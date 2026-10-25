import { SITE_CONFIG } from "./config.js";

// Pinned to a known v2 release so a future upstream release cannot change the
// site unexpectedly. Update this version deliberately when you want to.
const SUPABASE_ESM_URL =
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/+esm";

let clientPromise = null;

/**
 * Returns a human-readable setup problem, or null when the public
 * configuration looks usable.
 */
export function getConfigError() {
  const url = SITE_CONFIG.supabaseUrl.trim();
  const key = SITE_CONFIG.supabaseAnonKey.trim();

  if (!url || url.includes("YOUR-PROJECT")) {
    return "Add your Supabase project URL to assets/js/config.js.";
  }

  if (!key || key.includes("YOUR-SUPABASE")) {
    return "Add your Supabase anon (public) key to assets/js/config.js.";
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      return "The Supabase project URL must start with https://.";
    }
  } catch {
    return "The Supabase project URL in assets/js/config.js is not a valid URL.";
  }

  if (
    key.startsWith("sb_secret_") ||
    key.startsWith("service_role") ||
    key.includes("service_role") ||
    readJwtRole(key) === "service_role"
  ) {
    return "A secret or service_role key must never be used in the browser. Use the public anon or publishable key instead.";
  }

  return null;
}

/**
 * Reads the role claim from a legacy Supabase JWT key so a service_role key
 * cannot be published by accident. New publishable keys are not JWTs and
 * simply return null.
 */
function readJwtRole(key) {
  const parts = key.split(".");
  if (parts.length !== 3) return null;

  try {
    const base64 = parts[1].replaceAll("-", "+").replaceAll("_", "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const payload = JSON.parse(atob(padded));
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

/**
 * Lazily loads the Supabase browser SDK from the CDN. Keeping this lazy means
 * the rating UI still works if the CDN or project configuration is missing.
 */
export function getSupabaseClient() {
  if (clientPromise) return clientPromise;

  const configError = getConfigError();
  if (configError) {
    return Promise.reject(new Error(configError));
  }

  clientPromise = import(SUPABASE_ESM_URL)
    .then(({ createClient }) =>
      createClient(
        SITE_CONFIG.supabaseUrl.trim(),
        SITE_CONFIG.supabaseAnonKey.trim(),
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        },
      ),
    )
    .catch((cause) => {
      clientPromise = null;
      throw new Error(
        "The Supabase client could not be loaded. Check your internet connection and try again.",
        { cause },
      );
    });

  return clientPromise;
}
