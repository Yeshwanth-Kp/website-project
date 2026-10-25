# Kumarakom Lake Resort — Guest Feedback

A focused guest feedback website for **Kumarakom Lake Resort**, built as a static
site that runs on **GitHub Pages** and stores private feedback in **Supabase**.

- Guests rate their stay from **1 to 5 stars**.
- **4–5 stars** redirects to the resort's Google review page.
- **1–3 stars** opens a private feedback form with optional name, email, and
  comments.
- Private feedback is saved to Supabase and confirmed on the page.
- Approved staff sign in at **`/admin/`** to search, filter, and mark feedback as
  reviewed.
- There is **no public admin sign-up**. Staff accounts must be created by the
  resort manager and added to a database allowlist.
- No build step, no framework, no runtime dependencies. Just HTML, CSS,
  JavaScript, and Supabase.

---

## Run locally

You need [Node.js](https://nodejs.org/) 18.17 or newer.

```bash
npm run dev
```

Open **http://localhost:3000** for the guest page and
**http://localhost:3000/admin/** for the staff portal.

There is no `npm install` step because the project has no dependencies. If your
machine blocks npm scripts, run the server directly:

```bash
node scripts/dev-server.mjs
```

Use a local server rather than opening `index.html` directly — JavaScript
modules and Supabase authentication require an HTTP origin.

Run the lightweight repository check at any time:

```bash
npm run check
```

It verifies required files, parses the JavaScript, and reminds you if the
Supabase placeholders are still present.

---

## 1. Set up Supabase

You need a Supabase account and one project for this site.

### 1.1 Create the database objects

1. Create a project at [supabase.com](https://supabase.com/).
2. In the Supabase dashboard, open **SQL Editor → New query**.
3. Copy the entire contents of [`supabase/schema.sql`](supabase/schema.sql) and
   run it once.

The SQL creates:

| Object | Purpose |
| --- | --- |
| `public.feedback` | Private notes (ratings 1–3, optional contact details, review status). |
| `public.admin_users` | The allowlist of staff accounts allowed to read feedback. |
| `public.is_admin()` | A `security definer` helper used by Row Level Security. |

It also sets explicit grants, enables RLS, and installs the policies described
under [Security](#security-model).

### 1.2 Disable public sign-up

In **Authentication → Sign In / Providers** (wording varies slightly by
Supabase version), turn off **Allow new users to sign up**. Also leave
anonymous sign-ins disabled.

The site has no sign-up UI, but disabling sign-ups in Supabase is a second
layer of protection. Even if an account is created another way, it cannot read
feedback unless its user ID is in `public.admin_users`.

### 1.3 Create an approved staff account

1. Go to **Authentication → Users → Add user → Create new user**.
2. Enter the staff member's email and a strong password.
3. Confirm the user (or use the **Auto Confirm User** option if shown).
4. Open **SQL Editor** and add that user to the allowlist:

```sql
insert into public.admin_users (user_id, email)
select id, lower(email)
from auth.users
where lower(email) = lower('manager@example.com')
on conflict (user_id) do nothing;
```

Replace `manager@example.com` with the account you created, then run the block.
Repeat for every approved staff member.

> An authenticated Supabase user is **not** automatically an admin. Access is
> granted only by a matching row in `public.admin_users`.

### 1.4 Add the public settings

Open [`assets/js/config.js`](assets/js/config.js) and replace:

```js
supabaseUrl: "https://YOUR-PROJECT.supabase.co",
supabaseAnonKey: "YOUR-SUPABASE-ANON-KEY",
```

Use values from **Supabase Dashboard → Project Settings → API**:

- **Project URL** — for `supabaseUrl`
- **anon public** key (or **publishable** key in newer projects) — for
  `supabaseAnonKey`

The Google review URL is already configured in the same file. Replace
`googleReviewUrl` if the resort's Google listing changes.

#### Public values only

`assets/js/config.js` is served to every visitor. That is expected for the
Supabase project URL and anon key — those values are designed to be public and
are protected by Row Level Security.

**Never put a Supabase `service_role` key, secret key, database password, or
other secret in this file, in this repository, or anywhere on GitHub Pages.**
The site never requests or uses service-role credentials. As a safety check,
the browser client refuses to initialise Supabase if the configured key looks
like a `service_role` JWT or an `sb_secret_` key.

### 1.5 Test the two flows

1. In a private/incognito window, open the guest page.
2. Choose **4 or 5 stars** and confirm you are sent to the Google page.
3. Choose **1, 2, or 3 stars**, submit the form, and confirm the thank-you
   state.
4. Sign in at `/admin/` with the staff account and confirm the note appears.
5. Try marking it reviewed, searching, and filtering.

---

## 2. Deploy to GitHub Pages

The workflow at
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) publishes the
static site whenever `main` is updated.

1. Push this repository to GitHub.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push to `main` (or run **Actions → Deploy to GitHub Pages → Run workflow**).
5. Wait for the workflow to finish, then open the URL shown in the deployment
   environment.

For a project repository, the URLs will look like:

```text
Guest page:  https://<user>.github.io/<repository>/
Staff page:  https://<user>.github.io/<repository>/admin/
```

All internal links and asset paths are relative, so a project subpath or a
custom domain both work.

The workflow copies only `index.html`, `admin/`, and `assets/` into the deploy
artifact. If you add another top-level public folder or HTML file, add it to
the **Prepare static site** step in the workflow. `supabase/`, `scripts/`, and
documentation remain private to the repository and are not published.

No GitHub Actions secrets are required: the Supabase URL and anon key in
`config.js` are public browser settings. All access control is enforced by
Supabase Auth and RLS.

### If the workflow cannot enable Pages

- Confirm Pages source is **GitHub Actions**, not “Deploy from a branch”.
- Confirm the workflow's default branch is `main`; update the `branches` value
  in the workflow if your repository uses another branch name.
- The deployment needs the `pages: write` and `id-token: write` permissions
  already declared in the workflow.

---

## Project structure

```text
.
├── index.html                     Guest welcome, rating, and private form
├── admin/
│   └── index.html                 Staff sign-in and feedback dashboard
├── assets/
│   ├── css/
│   │   ├── base.css               Shared tokens, typography, buttons
│   │   ├── guest.css              Guest page styles
│   │   └── admin.css              Staff portal styles
│   ├── images/
│   │   ├── favicon.svg
│   │   └── kumarakom-lake-resort.jpg
│   └── js/
│       ├── config.js              PUBLIC Supabase + Google settings
│       ├── supabase-client.js     Lazy Supabase browser client
│       ├── guest.js               Rating routing and private submission
│       └── admin.js               Sign-in, filtering, pagination, review actions
├── supabase/
│   └── schema.sql                 Tables, grants, RLS policies, admin helper
├── scripts/
│   ├── dev-server.mjs             Zero-dependency local server
│   └── check.mjs                  File and syntax check
├── .github/workflows/deploy.yml   GitHub Pages deployment
├── package.json                   Local dev/check scripts only
└── README.md
```

### Routes

| URL | Description |
| --- | --- |
| `/` | Public guest feedback page. |
| `/admin/` | Staff sign-in and dashboard. No guest data loads until Auth and the allowlist both pass. |

There is no server-side code and no build output. Each HTML file is a complete
page. Keep the trailing slash on `/admin/` when linking to it; this keeps
relative asset paths correct.

---

## How the guest flow works

1. The guest selects a star rating (`assets/js/guest.js`).
2. **4 or 5 stars**: the page shows a short confirmation and redirects to
   `googleReviewUrl` after 1.5 seconds. No personal data is stored.
3. **1, 2, or 3 stars**: the optional private feedback form is revealed.
4. On submit, the browser calls Supabase with the public anon key and inserts
   only the rating, optional name, optional email, and optional comments.
5. The database policy permits insert-only access for guests. A hidden
   honeypot field also quietly absorbs naive spam bots.
6. On success, the page replaces the form with a confirmation. On failure, the
   guest sees a friendly retry message while technical details go to the
   browser console.

The `feedback` table itself only accepts ratings from 1 to 3, so the database
enforces the same routing as the UI.

## How the staff flow works

1. `/admin/` signs in with Supabase email/password authentication.
2. The browser calls the `is_admin()` RPC. If the user is not in
   `public.admin_users`, the session is ended and no feedback is requested.
3. Staff can search by name, email, or comment; filter by rating or review
   status; page through results; and toggle each note between **Needs review**
   and **Reviewed**.
4. A review action writes only `reviewed`, `reviewed_at`, and `reviewed_by`.
   Guest text cannot be edited through the site.

## Security model

The public anon key is safe because the database — not the JavaScript — is the
security boundary.

- **Guest inserts:** `anon` and `authenticated` have column-level permission to
  insert `rating`, `guest_name`, `guest_email`, and `comments`. The insert RLS
  policy requires a rating from 1 to 3 and an unreviewed row.
- **No public reads:** anonymous visitors have no `SELECT` permission. Guests
  cannot list, read, or search anyone's feedback.
- **Staff reads:** `SELECT` is granted to `authenticated`, but an RLS policy
  allows rows only when `public.is_admin()` is true for the current JWT.
- **Staff updates:** only the three review columns are grantable. The update
  policy requires the caller to be an allowlisted admin and keeps
  `reviewed`/`reviewed_at`/`reviewed_by` consistent.
- **Allowlist privacy:** no browser role can read `admin_users` directly. The
  `security definer` helper checks membership without exposing the list.
- **No admin sign-up:** there is no sign-up form. Public registration should be
  disabled in Supabase as well.
- **Secrets:** the service-role key is never present in this repository or
  website code. All public configuration lives in `config.js`.
- **Admin page visibility:** `/admin/` is publicly reachable, as any static
  page is, but its data and actions are protected by Supabase Auth + RLS.

A static site cannot enforce its own per-IP rate limit. If feedback spam becomes
a problem, add a CAPTCHA or move submission behind a serverless function. For
normal resort volume, RLS plus the honeypot keeps the data private and ordering
simple.

---

## Customization

| Change | File |
| --- | --- |
| Supabase URL/key, Google review URL | `assets/js/config.js` |
| Guest copy, form labels, welcome message | `index.html` |
| Staff copy, filters, login screen | `admin/index.html` |
| Colors, fonts, spacing | `assets/css/base.css` (tokens) and the page CSS |
| Guest page layout | `assets/css/guest.css` |
| Staff dashboard layout | `assets/css/admin.css` |
| Page size in staff list (default 12) | `PAGE_SIZE` in `assets/js/admin.js` |
| Redirect delay (default 1500 ms) | `REDIRECT_DELAY_MS` in `assets/js/guest.js` |
| Validation limits | HTML `maxlength` values and constraints in `supabase/schema.sql` |
| Deployment steps | `.github/workflows/deploy.yml` |

If you add or remove a feedback field, update the HTML form, the submit payload
in `guest.js`, the select list in `admin.js`, and the table + grants in
`supabase/schema.sql` together.

---

## Troubleshooting

| Symptom | Likely fix |
| --- | --- |
| “Online feedback is unavailable” after submitting | `assets/js/config.js` still has placeholders, or the Supabase SDK could not load. Check the browser console and your connection. |
| “Staff access could not be verified” | `supabase/schema.sql` has not been applied (or `is_admin()` is missing). Re-run the SQL, then reload. |
| Staff signs in but sees “not approved” | Add the user's ID to `public.admin_users` with the SQL in [1.3](#13-create-an-approved-staff-account). |
| Invalid login credentials | Confirm the account exists in **Authentication → Users**, was confirmed, and the password is correct. |
| RLS / “new row violates row-level security policy” | Re-run `supabase/schema.sql` and make sure you are using the anon/publishable key, not a custom role key. |
| Supabase error mentions JWT or row-level access | Sign out and back in, and verify the allowlist row still exists. |
| 404 on GitHub Pages | Set Pages source to **GitHub Actions**, check the workflow run, and use the `/admin/` URL with a trailing slash. |
| Style or module errors only locally | Open the site through `npm run dev`, not as a `file://` URL. |
| Changed the Google listing | Update `googleReviewUrl` in `assets/js/config.js`. |
| Want to inspect the data | Use the Supabase SQL Editor or Table Editor. Do not add service-role credentials to the site. |

Useful SQL while debugging (run in the Supabase SQL Editor):

```sql
select count(*) from public.feedback;
select count(*) from public.feedback where reviewed = false;
select user_id, email from public.admin_users;
```

Browser console logs are prefixed with `[Guest feedback]` or `[Staff portal]`.
Supabase request errors and status codes are visible there and in the Supabase
dashboard's API logs.
