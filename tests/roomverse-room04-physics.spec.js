import { expect, test } from "@playwright/test";
import { LEDGER } from "./helpers/room04-ledger.js";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const ROOM = "/prototype/roomverse-3d/cafe/";

test("Room 04 audits registered support, joints, container walls and barriers", async ({ page }) => {
  test.setTimeout(300000);
  // The audit reads geometry, not pixels, and the phone layout builds the same room. A phone-sized canvas keeps a CI runner (which draws in software) from spending
  // minutes on frames before the deferred prints finish loading; at 1440 px this test timed out on most CI runs, including PRs that did not touch the room.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(ROOM);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room04, null, { timeout: 120000 });
  await page.waitForFunction((vertices) => window.__room04.info().vertices === vertices, LEDGER.scene.vertices, { timeout: 150000 }); // a CI runner draws in software and loads the deferred prints slowly
  const result = await page.evaluate(() => ({ checks: window.__room04.physicsAudit(), info: window.__room04.info() }));
  expect(result.info.vertices).toBe(LEDGER.scene.vertices);
  expect(result.info.meshes).toBe(LEDGER.scene.meshes);
  const stock = result.info.takeawayLidStock;
  expect(stock).toMatchObject({ count: 7, radius: 0.041, thickness: 0.006, baseY: 1.05 });
  expect(stock.nearestCupClearanceMm).toBeGreaterThanOrEqual(20);
  const lidContacts = result.checks.filter(({ name }) => name.startsWith("takeaway-lid-"));
  expect(lidContacts).toHaveLength(stock.count);
  for (const contact of lidContacts) {
    expect(contact.ok, contact.name).toBe(true);
    expect(contact.detail, contact.name).toContain("vertical gap 0 mm");
  }
  // Pastry case (Paul 2026-11-18): the upper cakes and tarts sit on their plates, 0 to 1 mm in, never above.
  const seats = result.checks.filter(({ name }) => name.startsWith("pastry-seat-"));
  expect(seats.length).toBe(6);
  for (const seat of seats) {
    const gap = Number(seat.detail.match(/vertical gap (-?[\d.]+) mm/)[1]);
    expect(gap, seat.name).toBeLessThanOrEqual(0);
    expect(gap, seat.name).toBeGreaterThanOrEqual(-1);
  }
  expect(result.checks.length).toBeGreaterThan(100);
  expect(new Set(result.checks.map(({ name }) => name)).size).toBe(result.checks.length);
  for (const prefix of ["window-chair", "bar-stool-bentwood", "bar-stool-leather", "bar-stool-metal", "lounge-",
    "pothos-vine", "straw-", "wall-print", "menu", "espresso-foot", "grinder-", "record-player", "drip-tower", "checkout-", "cat-"]) {
    expect(result.checks.some(({ name }) => name.startsWith(prefix)), `registered ${prefix}`).toBe(true);
  }
  for (const check of result.checks) expect(check).toEqual({ ok: expect.any(Boolean), name: expect.any(String), detail: expect.stringContaining("mm") });
  const failures = result.checks.filter(({ ok }) => !ok);
  // The room passes every audit (the 26 findings #861 pinned are repaired: the bentwood stool legs now run 15 mm into their seats, and the lounge furniture is measured from the rug it
  // stands on). Any new finding fails this test; if a deliberate exception is ever needed, pin it here with its distance and the reason.
  expect(failures.map(({ name, detail }) => ({ name, detail })), "no physical findings").toEqual([]);
});

test("historical bad builds fail the same rules while sound joins pass", async ({ page }) => {
  await page.goto(ROOM);
  const checks = await page.evaluate(async () => {
    const { auditRoom04 } = await import("/prototype/roomverse-3d/cafe/physics-audit.js?v=1");
    const chairSeat = { shape: "circle", x: 0, z: 0, radius: 0.2, y: 0.433 };
    const shelf = { x0: -0.75, x1: 0.75, y0: 2.15, y1: 2.185, z0: -2.5, z1: -2.26 };
    const scenarios = [
      { name: "#837 chair leg only grazes seat", kind: "embed", tip: { x: 0.207, y: 0.464, z: 0 }, surface: chairSeat },
      { name: "#838 back oval misses post by 35 mm", kind: "join", a: { x: 0.128, y: 0.76, z: 0 }, b: { x: 0.185, y: 0.76, z: 0 }, radiusA: 0.0075, radiusB: 0.0145 },
      { name: "#843 straw crosses holder wall", kind: "rim", start: { x: 0.02, y: 1.064, z: 0 }, end: { x: 0.08, y: 1.23, z: 0 }, rim: { x: 0, y: 1.142, z: 0, radius: 0.034 }, tubeRadius: 0.0021 },
      { name: "#850 pothos vine cuts shelf", kind: "barrier", points: [{ x: 0, y: 2.17, z: -2.38 }], radius: 0.0028, box: shelf },
      { name: "#845 frame inherits counter shift", kind: "reset", value: 0.04 },
      { name: "correct inset chair leg", kind: "embed", tip: { x: 0.175, y: 0.464, z: 0 }, surface: chairSeat },
      { name: "correct touching back oval", kind: "join", a: { x: 0.128, y: 0.76, z: 0 }, b: { x: 0.147, y: 0.76, z: 0 }, radiusA: 0.0075, radiusB: 0.0145 },
      { name: "correct straw stays within holder", kind: "rim", start: { x: 0.01, y: 1.064, z: 0 }, end: { x: 0.02, y: 1.23, z: 0 }, rim: { x: 0, y: 1.142, z: 0, radius: 0.034 }, tubeRadius: 0.0021 },
      { name: "correct vine clears shelf", kind: "barrier", points: [{ x: 0, y: 2.1, z: -2.24 }], radius: 0.0028, box: shelf },
      { name: "correct frame shift reset", kind: "reset", value: 0 },
    ];
    return auditRoom04(scenarios);
  });
  expect(checks.slice(0, 5).map(({ ok }) => ok)).toEqual([false, false, false, false, false]);
  expect(checks.slice(5).every(({ ok }) => ok)).toBe(true);
  for (const result of checks) expect(result.detail).toMatch(/-?\d+(\.\d+)? mm/);
});

// Cache-busting (scripts/vite-auto-asset-versions.mjs): the build rewrites every `?v=auto` in the Room 04 sources to a hash of the target file's final content. This checks the
// built pages: no placeholder is left, each URL carries the hash of the file it points to, and a change in cafe.js would change page.js's URL (the hash chain).
test("Room 04 built pages carry content-hash versions, so a changed script always gets a new URL", () => {
  const dist = new URL("../dist/prototype/roomverse-3d/cafe/", import.meta.url);
  const read = (name) => readFileSync(new URL(name, dist), "utf8");
  const hashOf = (text) => createHash("sha1").update(text).digest("hex").slice(0, 10);
  const html = read("index.html"), page = read("page.js"), cafe = read("cafe.js");
  for (const [name, text] of [["index.html", html], ["page.js", page], ["cafe.js", cafe]]) expect(text, `${name} has no leftover ?v=auto`).not.toContain("?v=auto");
  expect(/page\.js\?v=([0-9a-f]{10})/.exec(html)?.[1], "index.html loads page.js by the hash of page.js").toBe(hashOf(page));
  expect(/\.\/cafe\.js\?v=([0-9a-f]{10})/.exec(page)?.[1], "page.js loads cafe.js by the hash of cafe.js").toBe(hashOf(cafe));
  expect(/physics-audit\.js\?v=([0-9a-f]{10})/.exec(cafe)?.[1], "cafe.js loads physics-audit.js by its hash").toBe(hashOf(read("physics-audit.js")));
});
