import { expect, test } from "@playwright/test";

const room = "/prototype/roomverse-3d/cafe/";
const trackPath = /\/cafe\/audio\/room04-track-\d-v1\.(m4a|ogg)$/;

async function openRecord(page) {
  await page.goto(room + "?lang=zh");
  await page.locator("#enter").click();
  await page.waitForFunction(() => Boolean(window.__room04));
  await page.evaluate(() => window.__room04.setView("record", true));
  await expect(page.locator("#recordHit")).toBeVisible();
}

test("Room 04 native media survives a page hide and follows the media controls", async ({ page }) => {
  test.setTimeout(120000);
  await page.addInitScript(() => {
    const session = navigator.mediaSession;
    window.mediaActions = {};
    const register = session.setActionHandler.bind(session);
    session.setActionHandler = (name, handler) => {
      window.mediaActions[name] = handler;
      return register(name, handler);
    };
  });
  const requests = [], errors = [];
  page.on("request", (request) => { if (trackPath.test(request.url())) requests.push(request.url()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await openRecord(page);
  expect(requests).toEqual([]);
  await expect(page.locator("audio")).toHaveCount(1);
  await page.locator("#recordHit").click();
  const state = () => page.evaluate(() => window.__room04.soundState());
  await expect.poll(async () => (await state()).currentTime, { timeout: 15000 }).toBeGreaterThan(0.1);
  expect(requests.some((url) => /room04-track-0-v1\.(m4a|ogg)$/.test(url))).toBe(true);
  expect(await page.locator("audio").getAttribute("src")).toMatch(/room04-track-0-v1\.(m4a|ogg)$/);
  expect(await page.evaluate(() => ({
    title: navigator.mediaSession.metadata.title,
    artist: navigator.mediaSession.metadata.artist,
    artwork: navigator.mediaSession.metadata.artwork[0].src,
    playbackState: navigator.mediaSession.playbackState,
  }))).toMatchObject({ title: "慢板", artist: "ROOMVERSE", artwork: /room04-record-cover-0-512-v1\.jpg$/, playbackState: "playing" });

  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  const previousTime = (await state()).currentTime;
  const previousAngle = await page.evaluate(() => window.__room04.recordState().platterAngle);
  await expect.poll(async () => (await state()).currentTime, { timeout: 15000 }).toBeGreaterThan(previousTime + 0.2);
  expect(await page.evaluate(() => window.__room04.recordState().platterAngle)).toBe(previousAngle);
  await page.evaluate(() => window.mediaActions.nexttrack());
  await expect.poll(async () => ({ track: (await state()).track, playing: (await state()).playing }), { timeout: 15000 }).toEqual({ track: 1, playing: true });
  await page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator("#bubble [data-cover]")).toHaveAttribute("src", /room04-record-cover-1-v1\.webp/);
  expect(await page.evaluate(() => window.__room04.recordState().armAngle)).toBeGreaterThan(0.28);
  await page.evaluate(() => window.mediaActions.pause());
  expect((await state()).playing).toBe(false);
  expect(await page.evaluate(() => navigator.mediaSession.playbackState)).toBe("paused");
  expect(await page.evaluate(() => window.__room04.recordState().armAngle)).toBeCloseTo(0.28);
  await page.evaluate(() => window.mediaActions.play());
  await expect.poll(async () => (await state()).playing, { timeout: 15000 }).toBe(true);
  await page.evaluate(() => window.mediaActions.previoustrack());
  await expect.poll(async () => ({ track: (await state()).track, playing: (await state()).playing }), { timeout: 15000 }).toEqual({ track: 0, playing: true });
  await page.evaluate(() => window.mediaActions.previoustrack());
  await expect.poll(async () => ({ track: (await state()).track, playing: (await state()).playing }), { timeout: 15000 }).toEqual({ track: 3, playing: true });
  await page.locator("audio").evaluate((audio) => { audio.currentTime = audio.duration - 0.15; });
  await expect.poll(async () => ({ track: (await state()).track, playing: (await state()).playing }), { timeout: 15000 }).toEqual({ track: 0, playing: true });
  await page.locator("#recordHit").dispatchEvent("click"); // The projected tap target moves as the platter spins.
  expect((await state()).playing).toBe(false);
  expect(errors).toEqual([]);
});

test("Room 04 retries in Opus and retains the synthesizer if both formats fail", async ({ page }) => {
  test.setTimeout(120000);
  await page.route("**/audio/room04-track-0-v1.m4a", (route) => route.fulfill({ status: 503 }));
  await page.route("**/audio/room04-track-1-v1.*", (route) => route.fulfill({ status: 503 }));
  await openRecord(page);
  await page.locator("#recordHit").click();
  await expect.poll(() => page.locator("audio").evaluate((audio) => audio.currentTime), { timeout: 15000 }).toBeGreaterThan(0.1);
  await expect(page.locator("audio")).toHaveAttribute("src", /room04-track-0-v1\.ogg$/);
  await page.locator("#recordHit").dispatchEvent("click");
  await page.locator("#recordHit").dispatchEvent("click");
  await expect.poll(() => page.evaluate(() => window.__room04.soundState().backend), { timeout: 15000 }).toBe("synth");
  await expect.poll(() => page.evaluate(() => window.__room04.soundState().notes), { timeout: 15000 }).toBeGreaterThan(0);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  expect((await page.evaluate(() => window.__room04.soundState())).playing).toBe(false);
  await page.locator("#recordHit").dispatchEvent("click");
  expect(await page.evaluate(() => window.__room04.recordPlaying())).toBe(false);
});

test("Room 04 serves all four tracks in both formats within the audio budget", async ({ request }) => {
  let total = 0;
  for (let index = 0; index < 4; index++) {
    for (const [extension, mime] of [["m4a", "audio/mp4"], ["ogg", "audio/ogg"]]) {
      const response = await request.get(`${room}audio/room04-track-${index}-v1.${extension}`);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain(mime);
      const bytes = (await response.body()).length;
      expect(bytes).toBeGreaterThan(0);
      expect(bytes).toBeLessThanOrEqual(1_500_000);
      total += bytes;
      await response.dispose();
    }
  }
  expect(total).toBeLessThanOrEqual(6_000_000);
});
