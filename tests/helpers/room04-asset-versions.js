// Room 04 cache-busting guard (CC, 2026-11-15).
//
// The browser and Cloudflare keep cafe.js and page.js for up to 4 hours (max-age=14400); only a new ?v= number in the URL makes a phone fetch the new file:
//   page.js   imports  ./cafe.js?v=N     (the version of cafe.js)
//   index.html loads   page.js?v=M       (the version of page.js)
// PR #868 and #869 changed cafe.js without bumping N, and Paul's phone kept showing the old room. This file records, for each file, a fingerprint of the content that
// the current version number belongs to. tests/roomverse-room04-physics.spec.js (it runs on every PR) fails when a file's content no longer matches its fingerprint.
//
// When that test fails after you edit cafe.js or page.js:
//   1. Bump the number(s): cafe.js?v=N in page.js, and page.js?v=M in index.html (page.js changes too whenever N changes, so M goes up as well).
//   2. Paste the new fingerprint(s) and version(s) the failure message prints into this file.
// Do not update the fingerprint without bumping the version: a stale number is what hides the new room from phones.
export const ASSET_VERSIONS = Object.freeze({
  "cafe.js": Object.freeze({ sha256: "397382aa28b81837bb24a6f6f28a078341cff53548a99bae93445dd76c813f68", version: 70 }),
  // page.js is fingerprinted with its own cafe.js?v=N token masked, so bumping N does not by itself change the fingerprint.
  "page.js": Object.freeze({ sha256: "edd7f134f63ffd8bf117d27fc170c2e4dc01be9e373ee00854157f093b7ee788", version: 78 }),
});
