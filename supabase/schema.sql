-- ============================================================================
-- Kumarakom Lake Resort — guest feedback database setup
-- ============================================================================
-- Run this entire file once in the Supabase SQL Editor (Dashboard → SQL).
--
-- It creates:
--   1. public.feedback       private notes submitted by guests (ratings 1–3)
--   2. public.admin_users    the staff allowlist
--   3. public.is_admin()     a safe helper used by Row Level Security
--
-- Security model:
--   • Anonymous visitors may INSERT private feedback and nothing else.
--   • No guest or anonymous visitor can read feedback.
--   • Authenticated users can read/update only when they are in admin_users.
--   • Public sign-up is disabled in Supabase (see README) and being an
--     authenticated user alone is not enough to access feedback.
--   • No service_role key is used by the website.
-- ============================================================================

-- 1. Private guest feedback -------------------------------------------------

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  rating smallint not null,
  guest_name text,
  guest_email text,
  comments text,
  reviewed boolean not null default false,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),

  constraint feedback_rating_range
    check (rating between 1 and 3),
  constraint feedback_name_length
    check (guest_name is null or char_length(trim(guest_name)) between 1 and 120),
  constraint feedback_email_length
    check (guest_email is null or char_length(guest_email) between 3 and 254),
  constraint feedback_email_format
    check (
      guest_email is null
      or guest_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    ),
  constraint feedback_comments_length
    check (comments is null or char_length(comments) <= 4000),
  constraint feedback_review_state
    check (
      (reviewed = false and reviewed_at is null and reviewed_by is null)
      or (reviewed = true and reviewed_at is not null)
    )
);

create index if not exists feedback_created_at_idx
  on public.feedback (created_at desc);

create index if not exists feedback_reviewed_created_at_idx
  on public.feedback (reviewed, created_at desc);

alter table public.feedback enable row level security;

-- Supabase's default grants are too broad for a guest-only insert table.
revoke all on table public.feedback from anon, authenticated;

-- A guest may create a note, but only with the fields shown on the form.
-- Column-level privileges stop anonymous callers from setting reviewed flags.
grant insert (rating, guest_name, guest_email, comments)
  on table public.feedback to anon, authenticated;

-- Approved staff read feedback. RLS policies below decide which rows.
grant select on table public.feedback to authenticated;

-- Staff may only change the review fields, never the guest's words.
grant update (reviewed, reviewed_at, reviewed_by)
  on table public.feedback to authenticated;

drop policy if exists "Guests can submit private feedback"
  on public.feedback;

create policy "Guests can submit private feedback"
  on public.feedback
  for insert
  to anon, authenticated
  with check (
    rating between 1 and 3
    and reviewed = false
    and reviewed_at is null
    and reviewed_by is null
  );

-- 2. Staff allowlist --------------------------------------------------------

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- No browser role can read or change the allowlist. Only SQL editor /
-- service-role actions (never shipped to the website) and the
-- security-definer helper below may access it.
revoke all on table public.admin_users from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;

-- 3. Policies for approved staff -------------------------------------------

drop policy if exists "Approved staff can read feedback"
  on public.feedback;

create policy "Approved staff can read feedback"
  on public.feedback
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Approved staff can update review status"
  on public.feedback;

create policy "Approved staff can update review status"
  on public.feedback
  for update
  to authenticated
  using (public.is_admin())
  with check (
    public.is_admin()
    and (
      (
        reviewed = true
        and reviewed_at is not null
        and reviewed_by = (select auth.uid())
      )
      or (
        reviewed = false
        and reviewed_at is null
        and reviewed_by is null
      )
    )
  );

-- Refresh PostgREST's schema cache after adding the table/function.
notify pgrst, 'reload schema';

-- ============================================================================
-- Create approved staff accounts
-- ============================================================================
-- 1. Dashboard → Authentication → Users → Add user.
--    Create the staff member with an email and password and confirm them.
-- 2. Replace the email below and run this block in the SQL Editor.
--
-- insert into public.admin_users (user_id, email)
-- select id, lower(email)
-- from auth.users
-- where lower(email) = lower('manager@example.com')
-- on conflict (user_id) do nothing;
--
-- Repeat for each approved staff member. There is intentionally no public
-- admin sign-up, and this allowlist is what grants access to feedback.
-- ============================================================================
