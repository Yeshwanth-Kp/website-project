/**
 * Lightweight repository check. No dependencies required.
 * Run with: npm run check
 */

import { spawnSync } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const requiredFiles = [
  "index.html",
  "admin/index.html",
  "assets/css/base.css",
  "assets/css/guest.css",
  "assets/css/admin.css",
  "assets/js/config.js",
  "assets/js/supabase-client.js",
  "assets/js/guest.js",
  "assets/js/admin.js",
  "assets/images/kumarakom-lake-resort.jpg",
  "assets/images/favicon.svg",
  "supabase/schema.sql",
  ".github/workflows/deploy.yml",
  "README.md",
];

const scriptFiles = [
  "assets/js/config.js",
  "assets/js/supabase-client.js",
  "assets/js/guest.js",
  "assets/js/admin.js",
  "scripts/dev-server.mjs",
];

let failed = false;

for (const file of requiredFiles) {
  try {
    const details = await stat(resolve(root, file));
    if (!details.isFile()) throw new Error("not a file");
  } catch {
    console.error(`Missing required file: ${file}`);
    failed = true;
  }
}

for (const file of scriptFiles) {
  const result = spawnSync(process.execPath, ["--check", resolve(root, file)], {
    encoding: "utf8",
  });

  if (result.status !== 0) {
    console.error(`JavaScript syntax error in ${file}`);
    if (result.stderr) process.stderr.write(result.stderr);
    failed = true;
  }
}

const config = await readFile(resolve(root, "assets/js/config.js"), "utf8");
if (config.includes("YOUR-PROJECT") || config.includes("YOUR-SUPABASE")) {
  console.warn(
    "\nNote: Supabase is not configured yet. Edit assets/js/config.js before testing feedback or the staff portal.\n",
  );
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log("All local checks passed.");
}
