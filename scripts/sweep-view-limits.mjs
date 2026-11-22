// View-limit sweep: prove that no orbit-limited camera can be rotated into a blank wall.
//
// Why this exists (2026-11-23): the Room 03 record view allowed +-0.52 rad of swing, and past about +0.12 rad the camera
// sat against the wall behind the counter: the frame became one flat grey field with the record-player ring floating in
// it. The failing frame is easy to describe but easy to miss by eye at the wrong moment, so measure it instead.
//
// The test is contrast, not brightness: a normal interior frame here has a luminance standard deviation of roughly
// 43-73; a wall filling the frame collapses it to about 20. Measured on this project:
//   Room 03 record view, before the fix   std 20 (flat)   after: 47-59 (clean)
//   Room 03 nook view                     43-46             clean
//   Room 03 free orbit, whole turn        45-54             clean
//   Room 04 free orbit                    60-73             clean (desktop and 390 px)
//
// Use:
//   node scripts/sweep-view-limits.mjs --base http://127.0.0.1:4173 --room kitchen --view record --out .qa/sweep
//   node scripts/sweep-view-limits.mjs --base http://127.0.0.1:4173 --room cafe --view free --widths 1440,390
//   node scripts/sweep-view-limits.mjs ... --assert      # exit code 1 when any frame is flat
//
// It needs @playwright/test (already a devDependency) and a served copy of the site; it does not start a server, because
// the CI ports differ (4173 is blocked on Paul's machine, so the caller picks the port).
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = Object.fromEntries(process.argv.slice(2).reduce((list, value, index, all) => {
  if (value.startsWith("--")) list.push([value.slice(2), all[index + 1]?.startsWith("--") ? "true" : all[index + 1] ?? "true"]);
  return list;
}, []));

const BASE = args.base ?? "http://127.0.0.1:4173";
const ROOM = args.room ?? "kitchen";
const VIEW = args.view ?? "record";
const OUT = args.out ?? ".qa/view-sweep";
const WIDTHS = (args.widths ?? "1440").split(",").map(Number);
const STEPS = Number(args.steps ?? 8);
const FLAT = Number(args["flat-below"] ?? 15); // a frame whose luminance std is under this is a wall, not a room
const ASSERT = args.assert === "true";

const PATHS = {
  kitchen: "/prototype/roomverse-3d/kitchen/?from=room01&lang=zh",
  cafe: "/prototype/roomverse-3d/cafe/?from=room03&lang=zh&hint=0",
};
const HOOK = { kitchen: "__room03", cafe: "__room04" };
const BUTTON = { "kitchen:nook": "#nookView", "kitchen:record": "#recordView" };

mkdirSync(OUT, { recursive: true });

/** Luminance mean and standard deviation of a PNG, decoded in the browser (no extra image dependency). */
async function stats(browser, pngBase64) {
  const page = await browser.newPage();
  const data = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = "data:image/png;base64," + b64;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(img, 0, 0);
    // the room occupies the canvas under the page header; the same crop for every frame keeps the numbers comparable
    const top = Math.floor(img.naturalHeight * 0.22), bottom = Math.floor(img.naturalHeight * 0.88);
    const { data: pixels } = context.getImageData(0, top, img.naturalWidth, bottom - top);
    let sum = 0, sumSq = 0, n = 0;
    for (let i = 0; i < pixels.length; i += 4 * 7) { // every seventh pixel is plenty
      const luminance = 0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2];
      sum += luminance; sumSq += luminance * luminance; n++;
    }
    const mean = sum / n;
    return { mean, std: Math.sqrt(Math.max(0, sumSq / n - mean * mean)) };
  }, pngBase64);
  await page.close();
  return data;
}

const results = [];
const browser = await chromium.launch();
for (const width of WIDTHS) {
  const height = width <= 500 ? 844 : 900;
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message.slice(0, 120)));
  await page.goto(BASE + PATHS[ROOM], { waitUntil: "load", timeout: 180000 });
  await page.waitForFunction((hook) => Boolean(window[hook]), HOOK[ROOM], { timeout: 240000 });
  await page.waitForTimeout(5000);
  const button = BUTTON[`${ROOM}:${VIEW}`];
  if (button) { await page.locator(button).click(); await page.waitForTimeout(3200); }

  const limits = await page.evaluate((hook) => {
    const controls = window[hook].controls;
    return { min: controls.minAzimuthAngle, max: controls.maxAzimuthAngle };
  }, HOOK[ROOM]);

  // an unlimited orbit reports +-Infinity: sweep a whole turn instead
  let from = limits.min, to = limits.max;
  if (!Number.isFinite(from) || !Number.isFinite(to)) { from = -Math.PI; to = Math.PI; }
  else { while (to < from) to += Math.PI * 2; }

  const cdp = await context.newCDPSession(page);
  for (let step = 0; step <= STEPS; step++) {
    const theta = from + (to - from) * (step / STEPS);
    await page.evaluate(([angle, hook]) => {
      const room = window[hook], camera = room.camera, target = room.controls.target;
      const dx = camera.position.x - target.x, dz = camera.position.z - target.z, radius = Math.hypot(dx, dz);
      camera.position.set(target.x + Math.sin(angle) * radius, camera.position.y, target.z + Math.cos(angle) * radius);
      camera.lookAt(target);
      room.render();
    }, [theta, HOOK[ROOM]]);
    await page.waitForTimeout(420);
    const { data } = await cdp.send("Page.captureScreenshot", { format: "png", fromSurface: true });
    const name = `${ROOM}-${VIEW}-${width}-${String(step).padStart(2, "0")}.png`;
    writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
    const light = await stats(browser, data);
    const flat = light.std < FLAT;
    results.push({ name, width, theta: Number(theta.toFixed(3)), mean: Number(light.mean.toFixed(1)), std: Number(light.std.toFixed(1)), flat });
    console.log(`${flat ? "FLAT " : "ok   "} ${name}  theta ${theta.toFixed(3)}  mean ${light.mean.toFixed(1)}  std ${light.std.toFixed(1)}`);
  }
  if (errors.length) console.log("page errors:", errors.join(" | "));
  await context.close();
}
await browser.close();

const bad = results.filter((row) => row.flat);
writeFileSync(join(OUT, "sweep.json"), JSON.stringify({ room: ROOM, view: VIEW, widths: WIDTHS, flatBelow: FLAT, results }, null, 2));
console.log(`\n${results.length} frames, ${bad.length} flat (threshold std < ${FLAT}). Report: ${join(OUT, "sweep.json")}`);
if (ASSERT && bad.length) {
  console.error("View-limit sweep failed: " + bad.map((row) => `${row.name} (std ${row.std})`).join(", "));
  process.exitCode = 1;
}
