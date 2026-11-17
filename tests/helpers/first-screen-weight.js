// Measures how many bytes a ROOMVERSE room downloads before it is usable. See first-screen-ledger.js for the rules.
import { gzipSync } from "node:zlib";

const TEXT = /\.(js|mjs|css|html|json|svg)$/i;

// page: a Playwright page. baseURL: origin of the running site. room: one entry of ROOMS.
// Returns { bytes, requests, byType, files } where files is [[bytes, path], ...] sorted largest first.
export async function measureFirstScreen(page, baseURL, room, { quietMs = 6000, capMs = 60000 } = {}) {
  const origin = new URL(baseURL).origin;
  const files = [];
  let lastNew = Date.now();
  page.on("response", async (res) => {
    try {
      const url = new URL(res.url());
      if (url.origin !== origin) return;
      const body = await res.body();
      const bytes = TEXT.test(url.pathname) ? gzipSync(body, { level: 6 }).length : body.length;
      files.push([bytes, url.pathname, res.request().resourceType()]);
      lastNew = Date.now();
    } catch { /* a response that was cancelled mid-flight is not counted */ }
  });
  await page.goto(`${baseURL}${room.url}?lang=en`, { waitUntil: "load" });
  const enter = page.locator("#enter");
  if (await enter.isVisible().catch(() => false)) {
    await enter.click();
    await page.waitForFunction((h) => !!window[h], room.hook, { timeout: capMs }).catch(() => {});
  }
  const start = Date.now();
  lastNew = Date.now();
  while (Date.now() - lastNew < quietMs && Date.now() - start < capMs) await page.waitForTimeout(250);
  const byType = {};
  for (const [bytes, , type] of files) byType[type] = (byType[type] || 0) + bytes;
  files.sort((a, b) => b[0] - a[0]);
  return { bytes: files.reduce((s, f) => s + f[0], 0), requests: files.length, byType, files };
}

export const mb = (bytes) => `${(bytes / 1048576).toFixed(2)} MB`;
