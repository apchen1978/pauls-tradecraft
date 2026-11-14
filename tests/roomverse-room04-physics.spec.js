import { expect, test } from "@playwright/test";
import { LEDGER } from "./helpers/room04-ledger.js";

const ROOM = "/prototype/roomverse-3d/cafe/";

test("Room 04 audits registered support, joints, container walls and barriers", async ({ page }) => {
  test.setTimeout(300000);
  await page.goto(ROOM);
  await page.locator("#enter").click();
  await page.waitForFunction(() => window.__room04, null, { timeout: 120000 });
  await page.waitForFunction((vertices) => window.__room04.info().vertices === vertices, LEDGER.scene.vertices, { timeout: 150000 }); // a CI runner draws in software and loads the deferred prints slowly
  const result = await page.evaluate(() => ({ checks: window.__room04.physicsAudit(), info: window.__room04.info() }));
  expect(result.info.vertices).toBe(LEDGER.scene.vertices);
  expect(result.info.meshes).toBe(LEDGER.scene.meshes);
  expect(result.checks.length).toBeGreaterThan(100);
  expect(new Set(result.checks.map(({ name }) => name)).size).toBe(result.checks.length);
  for (const prefix of ["window-chair", "bar-stool-bentwood", "bar-stool-leather", "bar-stool-metal", "lounge-",
    "pothos-vine", "straw-", "wall-print", "menu", "espresso-foot", "grinder-", "record-player", "drip-tower", "checkout-"]) {
    expect(result.checks.some(({ name }) => name.startsWith(prefix)), `registered ${prefix}`).toBe(true);
  }
  for (const check of result.checks) expect(check).toEqual({ ok: expect.any(Boolean), name: expect.any(String), detail: expect.stringContaining("mm") });
  const failures = result.checks.filter(({ ok }) => !ok);
  // Existing room findings are pinned, not silently waived: any extra finding or changed distance fails.
  // Card 65-B audits these; a separate scene PR must repair them and remove the corresponding entries.
  const knownFindings = [
    ...[-1, 1].flatMap((side) => [-1, 1].map((end) => ({
      name: `lounge-armchair-leg-${side}-${end}-ground`, detail: "ground gap 10.7 mm (max ±3 mm)",
    }))),
    { name: "lounge-footstool-plinth-ground", detail: "ground gap 12 mm (max ±3 mm)" },
    { name: "lounge-stone-table-base-ground", detail: "ground gap 11 mm (max ±3 mm)" },
    ...["7.6", "7.8", "7.8"].map((gap, i) => ({
      name: `lounge-oak-table-leg-${i}-ground`, detail: `ground gap ${gap} mm (max ±3 mm)`,
    })),
    { name: "lounge-side-table-base-ground", detail: "ground gap 12 mm (max ±3 mm)" },
    ...[-1.2, -0.45, 0.65, 1.75].flatMap((x) => [0, 1, 2, 3].map((leg) => ({
      name: `bar-stool-bentwood-${x}-${leg}-seat`, detail: "support inset 40 mm; vertical embed 0 mm (min 3 mm)",
    }))),
  ];
  expect(failures.map(({ name, detail }) => ({ name, detail })), "pinned existing physical findings").toEqual(knownFindings);
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
