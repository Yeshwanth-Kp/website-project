/**
 * PUBLIC BROWSER CONFIGURATION
 * ---------------------------------------------------------------------------
 * Everything in this file ships to the browser and is visible to every
 * visitor. Only use your Supabase project URL and the public anon (or
 * publishable) key here.
 *
 * NEVER put a Supabase service_role key, secret key, or database password in
 * this file, this repository, or any other file served by GitHub Pages.
 *
 * The anon key is safe to expose *because* Row Level Security is enabled.
 * Run `supabase/schema.sql` in your Supabase project before testing.
 */

export const SITE_CONFIG = Object.freeze({
  // Example: "https://abcdefghijklmnop.supabase.co"
  supabaseUrl: "https://YOUR-PROJECT.supabase.co",

  // Supabase Dashboard → Project Settings → API → Project URL / anon key.
  supabaseAnonKey: "YOUR-SUPABASE-ANON-KEY",

  // Guests who choose 4 or 5 stars are sent here.
  googleReviewUrl:
    "https://www.google.co.in/travel/hotels/entity/CgoIv9KC2MS1zMl2EAE?ts=CAEaIAoCGgASGhIUCgcI6g8QCxgJEgcI6g8QCxgKGAEyAhAAKgkKBToDVVNEGgA&ap=ugEGcHJpY2Vz&ei=QQGkadDUKdSF8LAPyfHgsQU&sa=X&ved=0CAAQ5JsGahcKEwiA-ujYyNSXAxUAAAAAHQAAAAAQAg&utm_campaign=sharing&utm_medium=link&utm_source=htls",
});
