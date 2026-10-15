/**
 * Build the site for a PHP host (GoDaddy Linux hosting), rather than for
 * GitHub Pages.
 *
 * Two things differ from the ordinary build:
 *
 *   NEXT_PUBLIC_CONTACT_ENDPOINT=/send-enquiry.php
 *     makes the enquiry forms POST to public/send-enquiry.php instead of falling
 *     back to a mailto: the visitor has to send themselves.
 *
 *   NEXT_PUBLIC_BASE_PATH is left empty
 *     because the site sits at the root of its own domain there, not in a
 *     /aladrak/ subfolder as it does on GitHub Pages.
 *
 * Why a script and not `NEXT_PUBLIC_CONTACT_ENDPOINT=/send-enquiry.php npm run build`:
 * on Windows, Git Bash rewrites a value that begins with "/" into a Windows
 * path before Node ever sees it. Measured — the endpoint arrived as
 * "C:/Program Files/Git/send-enquiry.php" and every submission would have 404ed,
 * with nothing in the code to show why. Setting it here, inside Node, is
 * immune to that.
 *
 * Run from site/:  npm run build:php
 */
import { spawnSync } from "node:child_process";

const env = {
  ...process.env,
  NEXT_PUBLIC_CONTACT_ENDPOINT: "/send-enquiry.php",
  NEXT_PUBLIC_BASE_PATH: "",
};

console.log("building for a PHP host — forms post to /send-enquiry.php, site at domain root\n");

const r = spawnSync("npx", ["next", "build"], {
  env,
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (r.status !== 0) process.exit(r.status ?? 1);

console.log(
  "\nDone. Upload everything inside site/out/ to public_html on the host,\n" +
  "send-enquiry.php included — it is what sends the mail."
);
