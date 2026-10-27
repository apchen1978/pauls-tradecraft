import { test, expect } from "@playwright/test";

const PAGE = "/prototype/roomverse-3d/kitchen/";

test("every Room 03 mood has every MOOD_LOOK field, and golden/night still apply the old values", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${PAGE}?lang=zh`);
  await page.waitForFunction(() => window.__room03?.info && window.__room03.info().drawCallsLastFrame > 0);
  const report = await page.evaluate(() => {
    const read = () => {
      const info = window.__room03.info();
      return {
        mood: info.mood,
        sun: info.lightMetrics.sun,
        hemi: info.lightMetrics.hemi,
        ambient: info.lightMetrics.ambient,
        pendant: info.lightMetrics.pendant,
        exposure: info.lightMetrics.exposure,
        contact: info.contactShadow.opacity,
        ceilingBounce: info.lightMetrics.pendantCeilingBounce,
        windowBounce: info.lightMetrics.windowBounce,
      };
    };
    window.__room03.setMood("golden");
    const golden = read();
    window.__room03.setMood("night");
    const night = read();
    window.__room03.setMood("golden");
    return { golden, night, look: window.__room03.info().moodLook };
  });
  expect(report.look.moods.golden).toBeTruthy();
  expect(report.look.moods.night).toBeTruthy();
  expect(report.look.fields.length).toBeGreaterThan(20);
  for (const mood of Object.keys(report.look.moods)) {
    expect(Object.keys(report.look.moods[mood]).sort(), mood).toEqual([...report.look.fields].sort());
    for (const field of report.look.fields) {
      expect(Object.prototype.hasOwnProperty.call(report.look.moods[mood], field), `${mood}.${field}`).toBe(true);
    }
  }
  expect(report.golden.sun).toBe(report.look.moods.golden.sun);
  expect(report.golden.hemi).toBe(report.look.moods.golden.hemi);
  expect(report.golden.ambient).toBe(report.look.moods.golden.ambient);
  expect(report.golden.pendant).toBe(report.look.moods.golden.pendant);
  expect(report.golden.exposure).toBe(report.look.moods.golden.exposure);
  expect(report.golden.contact).toBe(report.look.moods.golden.contactShadow);
  expect(report.golden.windowBounce).toBe(report.look.moods.golden.windowWallBounce);
  expect(report.night.sun).toBe(0);
  expect(report.night.pendant).toBe(7);
  expect(report.night.contact).toBe(0.12);
  expect(report.night.ceilingBounce).toBe(0.05);
  expect(report.look.moods.golden.floorLamp).toBe(0);
  expect(report.look.moods.night.floorLamp).toBe(0);
  expect(report.look.moods.golden.tableLamp).toBe(0);
  expect(report.look.moods.night.screenCool).toBe(0);
});
