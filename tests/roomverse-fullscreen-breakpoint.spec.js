import { expect, test } from "@playwright/test";

const QA = "C:/Users/grays/Desktop/AI交接文件/2026-10-27/room01-02-fullscreen-exit";
const phase = process.env.FULLSCREEN_PHASE || "after";
for (const [name, path, state] of [["room01", "/prototype/roomverse-3d/", "room01Immersive"], ["room02", "/prototype/roomverse-3d/bedroom/", "room02Immersive"]]) {
  async function enter(page) {
    await page.setViewportSize({width:390,height:844});
    await page.goto(`${path}?lang=zh`);
    await page.locator("#enter").click();
    await expect(page.locator("#immersiveEnter")).toBeVisible({timeout:90000});
    await page.evaluate(() => history.replaceState({ ...history.state, qaBaseline: true }, ""));
    await page.locator("#immersiveEnter").click();
    await expect(page.locator(".room")).toHaveClass(/is-immersive/);
  }
  test(`${name} exit stays usable at 1024x768 and restores history and focus`, async ({page}) => {
    await enter(page);
    await page.screenshot({path:`${QA}/${phase}-${name}-390.png`});
    await page.setViewportSize({width:1024,height:768});
    await page.screenshot({path:`${QA}/${phase}-${name}-1024.png`});
    const button=page.locator("#immersiveExit");
    await expect(button).toBeVisible({timeout:10000});
    const rect=await button.boundingBox(); expect(rect.width).toBeGreaterThanOrEqual(44); expect(rect.height).toBeGreaterThanOrEqual(44);
    await expect(page.locator("#immersiveControls")).toBeVisible();
    await button.click();
    await expect(page.locator("html")).not.toHaveClass(/room-immersive/);
    await expect.poll(() => page.evaluate((key)=>Boolean(history.state?.[key]),state)).toBe(false);
    expect(await page.evaluate(()=>getComputedStyle(document.body).overflow)).not.toBe("hidden");
    expect(await page.evaluate(()=>history.state?.qaBaseline)).toBe(true);
    await expect(page.locator("#portalBtn")).toBeFocused();
    await page.screenshot({path:`${QA}/${phase}-${name}-after.png`});
  });
  for (const method of ["Escape", "Back"]) test(`${name} portrait landscape portrait exits with ${method}`,async ({page})=>{
    await enter(page);
    await page.setViewportSize({width:844,height:390});
    await expect(page.locator("#immersiveExit")).toBeVisible();
    await page.setViewportSize({width:390,height:844});
    if(method==="Escape") await page.keyboard.press("Escape"); else await page.goBack();
    await expect(page.locator("html")).not.toHaveClass(/room-immersive/);
    await expect(page.locator("#immersiveEnter")).toBeFocused();
    await expect.poll(()=>page.evaluate(()=>history.state?.qaBaseline)).toBe(true);
    await expect.poll(()=>page.evaluate((key)=>Boolean(history.state?.[key]),state)).toBe(false);
  });
}
