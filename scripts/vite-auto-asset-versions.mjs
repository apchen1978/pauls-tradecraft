// Automatic cache-busting for the prototype pages (CC, 2026-11-15).
//
// Browsers and Cloudflare keep a script for up to 4 hours (max-age=14400), so a changed script is only fetched when its URL changes. Until now every PR had to
// bump a "?v=N" number by hand (and agents had to be told the next number). Instead, write the placeholder `?v=auto` after any script or stylesheet URL under
// public/prototype, for example:
//     import("./cafe.js?v=auto")      <script type="module" src="page.js?v=auto">
// At build time this plugin rewrites each placeholder to `?v=<hash of that file's final content>`. A file's hash includes the hashes written into it, so when cafe.js
// changes, page.js changes too, and so does the URL that index.html uses for page.js. Nobody edits a version number any more; a changed file always gets a new URL.
//
// Rules: paths are relative to the file that contains them (or start with "/" for the site root); a target that does not exist, a cycle, or a leftover `?v=auto`
// fails the build, so a mistake can never ship silently. In `vite dev` the placeholder stays as written (no caching to defeat).
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const TOKEN = /([A-Za-z0-9_./-]+\.(?:m?js|css))\?v=auto/g;
const TEXT = /\.(?:html|m?js|css)$/;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (TEXT.test(name)) out.push(full);
  }
  return out;
}

export function autoAssetVersions({ distDir = "dist", scanDir = "dist/prototype" } = {}) {
  return {
    name: "auto-asset-versions",
    apply: "build",
    enforce: "post",
    closeBundle: {
      order: "post",
      handler() {
        const root = resolve(distDir), scan = resolve(scanDir);
        if (!existsSync(scan)) return;
        const done = new Map(), stack = [];
        const finalize = (file) => {
          if (done.has(file)) return done.get(file);
          if (stack.includes(file)) throw new Error(`auto-asset-versions: a ?v=auto cycle through ${file}`);
          stack.push(file);
          const before = readFileSync(file, "utf8");
          const after = before.replace(TOKEN, (match, path) => {
            const target = path.startsWith("/") ? join(root, path) : resolve(dirname(file), path);
            if (!existsSync(target)) throw new Error(`auto-asset-versions: ${file} refers to ${path}?v=auto, which does not exist (${target})`);
            return `${path}?v=${finalize(target)}`;
          });
          if (after !== before) writeFileSync(file, after);
          stack.pop();
          const hash = createHash("sha1").update(after).digest("hex").slice(0, 10);
          done.set(file, hash);
          return hash;
        };
        const files = walk(scan);
        for (const file of files) finalize(file);
        const left = files.filter((file) => readFileSync(file, "utf8").includes("?v=auto"));
        if (left.length) throw new Error(`auto-asset-versions: ?v=auto left in ${left.join(", ")}`);
      },
    },
  };
}
