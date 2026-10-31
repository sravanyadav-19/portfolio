// Refresh browser asset versions whenever content, styling, or rendering changes.
// This runs automatically after the TypeScript build; no manual index.html edit is needed.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const versionedAssets = [
  "assets/css/main.css",
  "assets/js/main.js",
  "assets/js/portfolio.js",
];
const hashInputs = [
  ...versionedAssets,
  "content/portfolio.ts",
  "scripts/render.ts",
  "scripts/version-assets.mjs",
];

const hash = createHash("sha256");
for (const relativePath of hashInputs) {
  hash.update(readFileSync(join(root, relativePath), "utf8"));
}
const version = hash.digest("hex").slice(0, 12);
const indexPath = join(root, "index.html");
let html = readFileSync(indexPath, "utf8");

for (const relativePath of versionedAssets) {
  const escapedPath = relativePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`((?:src|href)=["'])(${escapedPath})(?:\\?v=[^"']*)?(["'])`, "g");
  html = html.replace(pattern, (_match, prefix, path, quote) => `${prefix}${path}?v=${version}${quote}`);
}

writeFileSync(indexPath, html);
console.log(`Asset version refreshed: ${version}`);
