// Self-hosted production build without Docker (plan.md 13.3): `next build` with
// output "standalone", then copy the static files next to the generated server.
// Run it with: node .next/standalone/server.js   (PORT / HOSTNAME env vars)
import { execSync } from "node:child_process";
import { cpSync, existsSync } from "node:fs";

execSync("npx next build", { stdio: "inherit", env: { ...process.env, BUILD_STANDALONE: "1" } });
const dist = process.env.NEXT_DIST_DIR || ".next";
cpSync(`${dist}/static`, `${dist}/standalone/${dist}/static`, { recursive: true });
if (existsSync("public")) cpSync("public", `${dist}/standalone/public`, { recursive: true });
process.stdout.write(`standalone build ready: node ${dist}/standalone/server.js\n`);
