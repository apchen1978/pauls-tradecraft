import { mkdirSync, readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const OUT = "/opt/cursor/artifacts/screenshots";
mkdirSync(OUT, { recursive: true });

async function noOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

async function shoot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png` });
}

async function expectFunnyHighlight(page) {
  const mark = page.locator(".line-funny .mark");
  await expect(mark).toBeVisible();
  const lines = await mark.evaluate((el) => {
    const box = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return {
      display: style.display,
      breakMode: style.webkitBoxDecorationBreak || style.boxDecorationBreak,
      fragments: [...el.getClientRects()].map((rect) => ({
        x: rect.left - box.left,
        y: rect.top - box.top,
        w: rect.width,
        h: rect.height,
      })),
    };
  });
  expect(lines.display).toBe("inline");
  expect(lines.breakMode).toBe("clone");
  expect(lines.fragments.length).toBeGreaterThan(0);
  const dpr = await page.evaluate(() => window.devicePixelRatio || 1);
  const png = await mark.screenshot();
  const painted = await page.evaluate(async ({ b64, fragments, dpr }) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    return fragments.map((fragment) => {
      const x0 = Math.max(0, Math.floor(fragment.x * dpr));
      const x1 = Math.min(img.width, Math.ceil((fragment.x + fragment.w) * dpr));
      const y0 = Math.max(0, Math.floor((fragment.y + fragment.h * 0.58) * dpr));
      const y1 = Math.min(img.height, Math.ceil((fragment.y + fragment.h * 0.92) * dpr));
      let salmon = 0;
      const data = ctx.getImageData(x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0)).data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r > 200 && g > 90 && g < 190 && b > 60 && b < 170 && r > g + 30 && r > b) salmon += 1;
      }
      return salmon;
    });
  }, { b64: png.toString("base64"), fragments: lines.fragments, dpr });
  painted.forEach((count) => expect(count).toBeGreaterThan(8));
}

async function waitForMg(page) {
  await page.waitForFunction(() => {
    const img = document.querySelector("#mg");
    return img && img.complete && img.naturalWidth > 0;
  });
}

async function waitForQueen(page) {
  await page.waitForFunction(() => {
    const img = document.querySelector("#queen-art");
    return img && !img.hidden && img.complete && img.naturalWidth > 0;
  });
}

async function expectBranchFirst(page, experimentTitle) {
  const order = await page.evaluate((experimentTitle) => {
    const plain = (el) => (el?.textContent || "").replace(/\u200b/g, "");
    const branch = document.getElementById("garage-branch-light-tech");
    const experiment = [...document.querySelectorAll("#garage h3")].find((el) => plain(el).includes(experimentTitle));
    const story = [...document.querySelectorAll("#garage p")].find((el) => /從現場經驗|Stories and samples/.test(plain(el)));
    const following = Node.DOCUMENT_POSITION_FOLLOWING;
    return {
      beforeExperiment: Boolean(experiment && (branch.compareDocumentPosition(experiment) & following)),
      beforeStory: Boolean(story && (branch.compareDocumentPosition(story) & following)),
    };
  }, experimentTitle);
  expect(order.beforeExperiment).toBe(true);
  expect(order.beforeStory).toBe(true);
}

async function frameBranch(page) {
  await page.evaluate(() => {
    const branch = document.getElementById("garage-branch-light-tech");
    const top = branch.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo(0, Math.max(0, top));
  });
}

test.describe("garage listing", () => {
  for (const width of [390, 1280]) {
    test(`${width}px zh and en put the light-tech toy first`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 1680 : 1560 });
      await page.goto("/?lang=zh#garage");
      const branch = page.locator("#garage-branch-light-tech");
      await expect(branch.getByRole("heading", { level: 3 })).toHaveText("輕科技玩具");
      await expectBranchFirst(page, "Bring Paul Into the Room");
      const card = page.getByRole("heading", { name: "你是哪一種隊友？" });
      await expect(card).toBeVisible();
      await expect(page.locator("#garage-more").getByRole("heading", { name: "你是哪一種隊友？" })).toHaveCount(0);
      await expect(page.getByText("示意玩具，不是心理測驗。").first()).toBeVisible();
      const href = await page.getByRole("link", { name: "玩一次", exact: true }).getAttribute("href");
      expect(href).toContain("/prototype/teammate-type/");
      expect(href).toContain("lang=zh");
      await frameBranch(page);
      await shoot(page, `garage-${width}-zh-light-tech`);
      await page.goto("/?lang=en#garage");
      await expect(page.locator("#garage-branch-light-tech").getByRole("heading", { level: 3 })).toHaveText("Light-tech toys");
      await expectBranchFirst(page, "Bring Paul Into the Room");
      await expect(page.getByRole("heading", { name: "What kind of teammate are you?" })).toBeVisible();
      await expect(page.getByText("A toy, not a personality test.").first()).toBeVisible();
      const enHref = await page.getByRole("link", { name: "Play", exact: true }).getAttribute("href");
      expect(enHref).toContain("lang=en");
      await frameBranch(page);
      await shoot(page, `garage-${width}-en-light-tech`);
      await noOverflow(page);
    });
  }
});

for (const width of [390, 768, 1440]) {
  test.describe(`toy ${width}px`, () => {
    test.use({ viewport: { width, height: width === 390 ? 844 : 1000 } });

    test("zh play, share-link round trip, and en card", async ({ page }) => {
      const external = [];
      page.on("request", (request) => {
        const url = request.url();
        if (!url.startsWith("http://127.0.0.1:4173") && !url.startsWith("data:")) external.push(url);
      });
      await page.goto("/prototype/teammate-type/?lang=zh");
      await expect(page.getByRole("heading", { name: "你是哪一種隊友？" })).toBeVisible();
      await expect(page.getByText("示意玩具，不是心理測驗。").first()).toBeVisible();
      await expect(page.locator("#quiz")).toBeVisible();
      await noOverflow(page);
      if (width === 390) await shoot(page, "teammate-390-zh-quiz");

      await page.locator("#choices button").nth(0).click();
      await expect(page.locator("#scenario-title")).toHaveText("社團成果展佈置");
      await page.locator("#choices button").nth(1).click();
      await page.locator("#choices button").nth(0).click();

      await expect(page.locator("#card-name")).toHaveText("最後一擊");
      await expectFunnyHighlight(page);
      await expect(page.locator("#card-boundary")).toHaveText("示意玩具，不是心理測驗。");
      await expect(page.locator("#picks-label")).toHaveText("你的選擇 ABA");
      expect(page.url()).toContain("c=ABA");
      expect(page.url()).toContain("lang=zh");
      await waitForQueen(page);
      await page.locator("#card").scrollIntoViewIfNeeded();
      await noOverflow(page);
      await shoot(page, `teammate-${width}-zh-result`);
      await page.locator("#card").screenshot({ path: `${OUT}/teammate-${width}-zh-card.png` });
      await page.locator(".line-funny .line-body").screenshot({ path: `${OUT}/teammate-${width}-zh-funny.png` });

      const shared = page.locator("#share-url");
      const url = await shared.inputValue();
      expect(url).toContain("c=ABA");
      expect(url).toContain("lang=zh");
      await page.goto(url);
      await expect(page.locator("#card-name")).toHaveText("最後一擊");
      await expect(page.locator("#quiz")).toBeHidden();

      await page.getByRole("button", { name: "EN" }).click();
      await expect(page.locator("#card-name")).toHaveText("The Finisher");
      await expectFunnyHighlight(page);
      await expect(page.locator("#card-boundary")).toHaveText("A toy, not a personality test.");
      expect(page.url()).toContain("c=ABA");
      expect(page.url()).toContain("lang=en");
      await waitForQueen(page);
      await page.locator("#card").scrollIntoViewIfNeeded();
      await noOverflow(page);
      await shoot(page, `teammate-${width}-en-result`);
      await page.locator("#card").screenshot({ path: `${OUT}/teammate-${width}-en-card.png` });
      await page.locator(".line-funny .line-body").screenshot({ path: `${OUT}/teammate-${width}-en-funny.png` });

      const enUrl = await page.locator("#share-url").inputValue();
      await page.goto(enUrl);
      await expect(page.locator("#card-name")).toHaveText("The Finisher");
      await expect(page.locator("#other-name")).toHaveText("最後一擊");

      if (width === 1440) {
        const [download] = await Promise.all([
          page.waitForEvent("download"),
          page.getByRole("button", { name: "Download card" }).click(),
        ]);
        expect(download.suggestedFilename()).toBe("teammate-ABA.png");
        await page.getByRole("button", { name: "Play again" }).click();
        await expect(page.locator("#quiz")).toBeVisible();
        await expect(page.locator("#scenario-title")).toHaveText("The night before the deadline");
        expect(page.url()).not.toContain("c=");
        await shoot(page, "teammate-1440-en-quiz");
      }
      expect(external).toEqual([]);
    });
  });
}

test.describe("cocoa role label", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("390px zh and en say 守護者 / Guardian", async ({ page }) => {
    await page.goto("/prototype/teammate-type/?c=BBB&lang=zh");
    await waitForMg(page);
    await expect(page.locator("#card-name")).toHaveText("晚安熱可可");
    await expect(page.locator("#role")).toHaveText("組隊角色 · 守護者");
    await expectFunnyHighlight(page);
    await noOverflow(page);
    await page.locator("#card").screenshot({ path: `${OUT}/teammate-390-zh-cocoa-card.png` });

    await page.getByRole("button", { name: "EN" }).click();
    await expect(page.locator("#card-name")).toHaveText("The Cocoa");
    await expect(page.locator("#role")).toHaveText("Party role · Guardian");
    await expectFunnyHighlight(page);
    await noOverflow(page);
    await page.locator("#card").screenshot({ path: `${OUT}/teammate-390-en-cocoa-card.png` });
  });
});

for (const width of [390, 768, 1440]) {
  test.describe(`long funny lines ${width}px`, () => {
    test.use({ viewport: { width, height: width === 390 ? 844 : 1000 } });

    test("highlight stays on every wrapped line", async ({ page }) => {
      const cases = [
        { code: "AAA", lang: "zh", name: "umbrella" },
        { code: "CCC", lang: "zh", name: "spark" },
        { code: "AAA", lang: "en", name: "umbrella" },
        { code: "CCC", lang: "en", name: "spark" },
      ];
      for (const item of cases) {
        await page.goto(`/prototype/teammate-type/?c=${item.code}&lang=${item.lang}`);
        await waitForQueen(page);
        await expectFunnyHighlight(page);
        await noOverflow(page);
        await page.locator("#card").screenshot({ path: `${OUT}/teammate-${width}-${item.lang}-${item.name}.png` });
        await page.locator(".line-funny .line-body").screenshot({ path: `${OUT}/teammate-${width}-${item.lang}-${item.name}-funny.png` });
      }
    });
  });
}

const CARDS = "/opt/cursor/artifacts/teammate-cards";
mkdirSync(CARDS, { recursive: true });

function pngSize(file) {
  const buf = readFileSync(file);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

const NEW_ROLES = [
  { code: "EAE", zh: "先看全局", en: "Sees the Whole Board", roleZh: "組隊角色 · 軍師", roleEn: "Party role · Strategist" },
  { code: "AEF", zh: "喊到到齊", en: "Gets It Through", roleZh: "組隊角色 · 傳令兵", roleEn: "Party role · Messenger" },
  { code: "FAE", zh: "今晚聽我的", en: "Tonight, Follow Me", roleZh: "組隊角色 · 女王", roleEn: "Party role · Queen" },
  { code: "AFC", zh: "順眼就對了", en: "Makes It Look Right", roleZh: "組隊角色 · 設計師", roleEn: "Party role · Designer" },
];

test.describe("new choices and roles", () => {
  for (const width of [390, 1280]) {
    test(`${width}px scenario shows the added options`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 1400 : 1100 });
      await page.goto("/prototype/teammate-type/?lang=zh");
      await expect(page.locator("#choices button")).toHaveCount(6);
      await expect(page.locator("#choices")).toContainText("先把整晚要做的事在腦裡走一遍，再動手。");
      await expect(page.locator("#choices")).toContainText("在語音裡定調：今晚照這個走，大家跟上。");
      await noOverflow(page);
      await page.locator("#quiz").screenshot({ path: `${OUT}/teammate-${width}-zh-choices.png` });
      await page.goto("/prototype/teammate-type/?lang=en");
      await expect(page.locator("#choices button")).toHaveCount(6);
      await expect(page.locator("#choices")).toContainText("Walk the whole night through in your head, then start.");
      await expect(page.locator("#choices")).toContainText("Set the tone on voice: this is the plan tonight, everyone follow.");
      await noOverflow(page);
      await page.locator("#quiz").screenshot({ path: `${OUT}/teammate-${width}-en-choices.png` });
    });

    test(`${width}px four new role cards`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 1100 : 1000 });
      for (const role of NEW_ROLES) {
        await page.goto(`/prototype/teammate-type/?c=${role.code}&lang=zh`);
        await waitForQueen(page);
        await expect(page.locator("#card-name")).toHaveText(role.zh);
        await expect(page.locator("#role")).toHaveText(role.roleZh);
        await expect(page.locator("#card-boundary")).toHaveText("示意玩具，不是心理測驗。");
        await expectFunnyHighlight(page);
        await noOverflow(page);
        await page.locator("#card").screenshot({ path: `${OUT}/teammate-${width}-zh-${role.code}-card.png` });
        await page.goto(`/prototype/teammate-type/?c=${role.code}&lang=en`);
        await waitForQueen(page);
        await expect(page.locator("#card-name")).toHaveText(role.en);
        await expect(page.locator("#role")).toHaveText(role.roleEn);
        await expect(page.locator("#card-boundary")).toHaveText("A toy, not a personality test.");
        await expectFunnyHighlight(page);
        await noOverflow(page);
        await page.locator("#card").screenshot({ path: `${OUT}/teammate-${width}-en-${role.code}-card.png` });
      }
    });
  }

  test("downloaded cards export at 2× of 1080×1350", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1000 });
    const jobs = [
      { code: "EAE", lang: "zh", file: "strategist-zh.png", button: "下載角色卡" },
      { code: "FAE", lang: "zh", file: "queen-zh.png", button: "下載角色卡" },
      { code: "AAA", lang: "zh", file: "umbrella-zh.png", button: "下載角色卡" },
      { code: "AEF", lang: "en", file: "messenger-en.png", button: "Download card" },
    ];
    for (const job of jobs) {
      await page.goto(`/prototype/teammate-type/?c=${job.code}&lang=${job.lang}`);
      await waitForQueen(page);
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.getByRole("button", { name: job.button }).click(),
      ]);
      const dest = `${CARDS}/${job.file}`;
      await download.saveAs(dest);
      expect(download.suggestedFilename()).toBe(`teammate-${job.code}.png`);
      expect(pngSize(dest)).toEqual({ width: 2160, height: 2700 });
    }
  });

  test("390px zh queen is rare and a guardian code shows the horse", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1100 });
    await page.goto("/prototype/teammate-type/?c=FAE&lang=zh");
    await waitForQueen(page);
    await expect(page.locator("#card-name")).toHaveText("今晚聽我的");
    await expect(page.locator("#rare")).toHaveText("稀有");
    await expect(page.locator("#horse")).toBeHidden();
    await expect(page.locator("#mg")).toBeHidden();
    await expect(page.locator("#queen-art")).toBeVisible();
    await expect(page.locator("#queen-art")).toHaveAttribute("src", "assets/queen.png");
    await noOverflow(page);
    await page.locator("#card").screenshot({ path: `${OUT}/teammate-390-zh-queen-rare.png` });
    const [queenDownload] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "下載角色卡" }).click(),
    ]);
    const queenDest = `${CARDS}/queen-zh.png`;
    await queenDownload.saveAs(queenDest);
    expect(pngSize(queenDest)).toEqual({ width: 2160, height: 2700 });

    await page.goto("/prototype/teammate-type/?c=BBA&lang=zh");
    await expect(page.locator("#card-name")).toHaveText("晚安熱可可");
    await expect(page.locator("#role")).toHaveText("組隊角色 · 守護者");
    await expect(page.locator("#horse")).toBeVisible();
    await expect(page.locator("#companion")).toHaveText("同伴 · 有翅膀的白馬");
    await expect(page.locator("#mg")).toBeHidden();
    await page.getByRole("button", { name: "EN" }).click();
    await expect(page.locator("#companion")).toHaveText("Companion · Winged white horse");
    await expect(page.locator("#card-name")).toHaveText("The Cocoa");
    await page.getByRole("button", { name: "中文" }).click();
    await noOverflow(page);
    await page.locator("#card").screenshot({ path: `${OUT}/teammate-390-zh-guardian-horse.png` });
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "下載角色卡" }).click(),
    ]);
    const dest = `${CARDS}/guardian-horse-zh.png`;
    await download.saveAs(dest);
    expect(pngSize(dest)).toEqual({ width: 2160, height: 2700 });
  });

  test("390px zh eight roles each show their own portrait", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1100 });
    const roles = [
      { code: "AAA", file: "umbrella.png", zh: "擋雨的人", en: "The Umbrella" },
      { code: "BBC", file: "finisher.png", zh: "最後一擊", en: "The Finisher" },
      { code: "CCC", file: "spark.png", zh: "腦內煙火師", en: "The Spark" },
      { code: "DAA", file: "mapkeeper.png", zh: "地圖收藏家", en: "The Mapkeeper" },
      { code: "CCD", file: "soundtrack.png", zh: "BGM 擔當", en: "The Soundtrack" },
      { code: "EAE", file: "strategist.png", zh: "先看全局", en: "Sees the Whole Board" },
      { code: "AEF", file: "messenger.png", zh: "喊到到齊", en: "Gets It Through" },
      { code: "AFC", file: "designer.png", zh: "順眼就對了", en: "Makes It Look Right" },
    ];
    for (const role of roles) {
      await page.goto(`/prototype/teammate-type/?c=${role.code}&lang=zh`);
      await waitForQueen(page);
      await expect(page.locator("#card-name")).toHaveText(role.zh);
      await expect(page.locator("#queen-art")).toHaveAttribute("src", `assets/${role.file}`);
      await expect(page.locator("#mg")).toBeHidden();
      await expect(page.locator("#horse")).toBeHidden();
      await expect(page.locator("#companion")).toBeHidden();
      await noOverflow(page);
      await page.locator("#card").screenshot({ path: `${OUT}/role-390-zh-${role.file.replace(".png", "")}.png` });
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.getByRole("button", { name: "下載角色卡" }).click(),
      ]);
      const dest = `${CARDS}/${role.file.replace(".png", "")}-zh.png`;
      await download.saveAs(dest);
      expect(pngSize(dest)).toEqual({ width: 2160, height: 2700 });
      await page.getByRole("button", { name: "EN" }).click();
      await waitForQueen(page);
      await expect(page.locator("#card-name")).toHaveText(role.en);
      await expect(page.locator("#queen-art")).toHaveAttribute("src", `assets/${role.file}`);
      await expect(page.locator("#mg")).toBeHidden();
      await expect(page.locator("#horse")).toBeHidden();
      const [enDownload] = await Promise.all([
        page.waitForEvent("download"),
        page.getByRole("button", { name: "Download card" }).click(),
      ]);
      const enDest = `${CARDS}/${role.file.replace(".png", "")}-en.png`;
      await enDownload.saveAs(enDest);
      expect(pngSize(enDest)).toEqual({ width: 2160, height: 2700 });
    }
  });
});
