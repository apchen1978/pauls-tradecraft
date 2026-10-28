import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const PAGE = "/prototype/roomverse-3d/kitchen/";
const QA = process.env.ROOMVERSE_QA_DIR || null;
if (QA) mkdirSync(QA, { recursive: true });
const MOODS = ["golden", "movie", "night", "dinner", "sunday", "thanksgiving"];
const LAMPS_ON = { golden: false, movie: true, night: false, dinner: true, sunday: true, thanksgiving: true };

async function loadRoom(page, width) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().furniture.table === "glb" && window.__room03.info().yardLoaded);
  await page.waitForFunction(() => window.__room03.info().drawCallsLastFrame > 0);
}

const near = (a, b, mm) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) * 1000 <= mm;

// Paul 2026-10-29: a lit wall beside a dull globe looked as if the light came from somewhere else (same slip Rooms 01 and 02 had).
test("each lamp's light, globe and halo share one centre and the globe glows with its light in every mood", async ({ page }) => {
  await loadRoom(page, 1440);
  const strength = {};
  for (const mood of MOODS) {
    await page.evaluate((name) => window.__room03.setMood(name), mood);
    const { lamps } = await page.evaluate(() => window.__room03.info());
    for (const key of ["floor", "table"]) {
      const glow = lamps.glow[key];
      expect(near(glow.globe, glow.light, 1), `${mood} ${key}: light is at the middle of the globe`).toBe(true);
      expect(near(glow.globe, glow.halo, 1), `${mood} ${key}: halo is centred on the globe`).toBe(true);
      const on = lamps.lights[key].intensity > 0;
      expect(on, `${mood} ${key}: lit as designed`).toBe(key === "floor" ? LAMPS_ON[mood] : LAMPS_ON[mood]);
      expect(glow.haloVisible, `${mood} ${key}: halo only when the lamp is on`).toBe(on);
      if (on) {
        expect(glow.emissive, `${mood} ${key}: globe glows`).toBeGreaterThanOrEqual(0.8);
        expect(glow.haloOpacity, `${mood} ${key}: halo`).toBeGreaterThan(0.05);
        strength[`${mood}-${key}`] = [lamps.lights[key].intensity, glow.emissive];
      } else {
        expect(glow.emissive, `${mood} ${key}: globe dark when the lamp is off`).toBe(0);
        expect(glow.haloOpacity).toBe(0);
      }
    }
  }
  // Stronger light, brighter globe: movie night (floor 3.1) outshines dinner (1.6).
  expect(strength["movie-floor"][1]).toBeGreaterThan(strength["dinner-floor"][1]);
});

test("the halos are light, not objects: they never block a ray or add geometry", async ({ page }) => {
  await loadRoom(page, 390);
  await page.evaluate(() => window.__room03.setMood("movie"));
  const result = await page.evaluate(async () => {
    const R = window.__room03, T = await import("/prototype/roomverse-3d/vendor/three.module.min.js");
    const halos = [];
    R.camera.parent?.traverse?.(() => {});
    const scene = R.plaqueMesh.parent;
    scene.traverse((o) => { if (o.name === "floor-lamp-halo" || o.name === "table-lamp-halo") halos.push(o); });
    const rc = new T.Raycaster(new T.Vector3(0, 1.4, 4), new T.Vector3(-0.3, 0, -1).normalize());
    let error = null;
    try { rc.intersectObjects(scene.children, true); } catch (e) { error = String(e); }
    return { count: halos.length, error, blocksRay: halos.some((h) => { const hit = []; h.raycast(rc, hit); return hit.length > 0; }) };
  });
  expect(result.count).toBe(2);
  expect(result.error, "a ray test without a camera must not throw because of a sprite").toBeNull();
  expect(result.blocksRay).toBe(false);
});

// Paul 2026-10-29: the redwood painting by the TV read as a window because it looked the same by day and by night.
test("the framed paintings follow the mood's light instead of glowing the same all day", async ({ page }) => {
  await loadRoom(page, 1440);
  const light = {};
  for (const mood of MOODS) {
    await page.evaluate((name) => window.__room03.setMood(name), mood);
    light[mood] = (await page.evaluate(() => window.__room03.info().wallArtLight));
  }
  // Under full strength by day so a painting sits below the bright window beside it and is not a glowing patch on a shaded wall (was [1, 1, 1]).
  for (const channel of light.golden) { expect(channel).toBeGreaterThanOrEqual(0.8); expect(channel).toBeLessThanOrEqual(0.9); }
  for (const mood of ["movie", "night"]) for (const channel of light[mood]) expect(channel, `${mood} painting dimmed to about half`).toBeLessThan(0.6);
  expect(light.dinner[0], "dinner sits between day and night").toBeLessThan(light.golden[0]);
  expect(light.dinner[0]).toBeGreaterThan(light.night[0]);
  expect(light.night[0], "night is warm, not blue").toBeGreaterThan(light.night[2]);
  for (const mood of MOODS) for (const channel of light[mood]) expect(channel, `${mood} never goes black`).toBeGreaterThan(0.4);
});
