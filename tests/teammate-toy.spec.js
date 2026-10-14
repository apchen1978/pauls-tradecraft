import { mkdirSync, readFileSync, statSync } from "node:fs";
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

async function shootShowcaseAndGarage(page, name) {
  const width = page.viewportSize().width;
  await page.setViewportSize({ width, height: 2800 });
  await page.evaluate(() => {
    const header = document.querySelector("header");
    if (header) header.style.position = "relative";
    const start = document.getElementById("showcase").getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, Math.max(0, start));
  });
  await page.waitForFunction(() => {
    const img = document.querySelector("#showcase img");
    return img && img.complete && img.naturalWidth > 0;
  });
  const clipHeight = await page.evaluate(() => {
    const showcase = document.getElementById("showcase");
    const intro = document.getElementById("garage-heading")?.nextElementSibling;
    const start = showcase.getBoundingClientRect().top + window.scrollY;
    const end = (intro || document.getElementById("garage")).getBoundingClientRect().bottom + window.scrollY + 28;
    return Math.ceil(end - start);
  });
  await page.setViewportSize({ width, height: Math.min(clipHeight + 8, 4000) });
  await page.evaluate(() => {
    const start = document.getElementById("showcase").getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, start);
  });
  await page.screenshot({
    path: `${OUT}/${name}.png`,
    clip: { x: 0, y: 0, width, height: clipHeight },
  });
}

test("showcase comes before one deal and the garage", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?lang=zh");
  await expect(page.locator("#showcase")).toBeVisible();
  const order = await page.evaluate(() => {
    const node = (id) => document.getElementById(id);
    const follows = (earlier, later) => Boolean(earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING);
    const showcase = node("showcase");
    return {
      beforeOneDeal: follows(showcase, node("one-deal")),
      beforeGarage: follows(showcase, node("garage")),
      afterQuestions: follows(node("three-questions"), showcase),
    };
  });
  expect(order.afterQuestions).toBe(true);
  expect(order.beforeOneDeal).toBe(true);
  expect(order.beforeGarage).toBe(true);
  const nav = page.locator("header nav");
  const hrefs = await nav.locator('a[href^="#"]').evaluateAll((els) => els.map((el) => el.getAttribute("href")));
  expect(hrefs.indexOf("#showcase")).toBeGreaterThan(-1);
  expect(hrefs.indexOf("#showcase")).toBeLessThan(hrefs.indexOf("#works"));
  await expect(nav.getByRole("link", { name: "互動作品", exact: true })).toHaveAttribute("href", "#showcase");
  await expect(nav.getByRole("link", { name: "商業作品", exact: true })).toHaveAttribute("href", "#works");
  const images = page.locator("#showcase img");
  expect(await images.count()).toBeGreaterThan(0);
  for (const img of await images.all()) {
    await expect(img).toHaveAttribute("loading", "lazy");
  }
  await page.goto("/?lang=en");
  await expect(page.locator("header nav").getByRole("link", { name: "Playful Works", exact: true })).toHaveAttribute("href", "#showcase");
  await expect(page.locator("header nav").getByRole("link", { name: "Business Works", exact: true })).toHaveAttribute("href", "#works");
});

test.describe("nav names", () => {
  for (const width of [1024, 1440]) {
    for (const lang of ["zh", "en"]) {
      const showcase = lang === "zh" ? "互動作品" : "Playful Works";
      const works = lang === "zh" ? "商業作品" : "Business Works";
      test(`${width}px ${lang}: ${showcase} stays before ${works} on one line`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/?lang=${lang}`);
        const nav = page.locator("header nav");
        const showcaseLink = nav.getByRole("link", { name: showcase, exact: true });
        const worksLink = nav.getByRole("link", { name: works, exact: true });
        await expect(showcaseLink).toHaveAttribute("href", "#showcase");
        await expect(worksLink).toHaveAttribute("href", "#works");
        const fit = await showcaseLink.evaluate((el) => {
          const row = el.parentElement;
          const links = [...row.querySelectorAll(":scope > a")];
          const tops = links.map((link) => link.getBoundingClientRect().top);
          const header = document.querySelector("header");
          return {
            sameRow: Math.max(...tops) - Math.min(...tops) < 1,
            wrapped: links.some((link) => {
              const range = document.createRange();
              range.selectNodeContents(link);
              return range.getClientRects().length > 1;
            }),
            pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            headerOverflow: header.scrollWidth - header.clientWidth,
          };
        });
        expect(fit.sameRow).toBe(true);
        expect(fit.wrapped).toBe(false);
        expect(fit.pageOverflow).toBeLessThanOrEqual(1);
        expect(fit.headerOverflow).toBeLessThanOrEqual(1);
        const hrefs = await nav.locator('a[href^="#"]').evaluateAll((els) => els.map((el) => el.getAttribute("href")));
        expect(hrefs.indexOf("#showcase")).toBeLessThan(hrefs.indexOf("#works"));
      });
    }
  }

  test("390px menu keeps the new names and the same anchors", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/?lang=zh");
    await page.getByRole("button", { name: "開啟選單" }).click();
    const menu = page.locator("header");
    await expect(menu.getByRole("link", { name: "互動作品", exact: true })).toHaveAttribute("href", "#showcase");
    await expect(menu.getByRole("link", { name: "商業作品", exact: true })).toHaveAttribute("href", "#works");
    await page.goto("/?lang=en");
    await page.getByRole("button", { name: "Open menu" }).click();
    const enMenu = page.locator("header");
    await expect(enMenu.getByRole("link", { name: "Playful Works", exact: true })).toHaveAttribute("href", "#showcase");
    await expect(enMenu.getByRole("link", { name: "Business Works", exact: true })).toHaveAttribute("href", "#works");
  });
});

test.describe("garage listing", () => {
  for (const width of [390, 1280, 1440]) {
    test(`${width}px zh and en keep Garage experiments and put the teammate toy in Showcase`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 1680 : 1560 });
      await page.goto("/?lang=zh#garage");
      const branch = page.locator("#garage-branch-light-tech");
      await expect(branch.getByRole("heading", { level: 3 })).toHaveText("輕科技玩具");
      await expectBranchFirst(page, "Bring Paul Into the Room");
      await expect(branch.getByRole("heading", { name: "AI agent 聽得懂你的暗號嗎？" })).toBeVisible();
      await expect(page.locator("#garage")).toContainText("這裡放還在進行中的實驗。");
      await expect(page.locator("#garage").getByRole("heading", { name: "十二月的燈" })).toHaveCount(0);
      const showcase = page.locator("#showcase");
      const card = showcase.getByRole("heading", { name: "十二月的燈" });
      await expect(card).toBeVisible();
      await expect(showcase.getByRole("heading", { level: 2 })).toHaveText("有趣互動作品展示");
      await expect(showcase.getByText("探索 AI 如何結合商業判斷、工作流程與互動工具，將想法轉化為可親自體驗的解決方案。")).toBeVisible();
      await expect(showcase.getByText("從一個想法開始，讓創意透過科技成形，讓每一次探索都有新的可能。")).toBeVisible();
      await expect(showcase.getByText("示範／成效未驗證。", { exact: true })).toHaveCount(0);
      await expect(showcase.getByText("照夜鎮裡，十六種隊友，四個隊伍。")).toBeVisible();
      await expect(showcase.getByText("不教貿易：輕鬆玩，順便看見自己的團隊風格")).toBeVisible();
      await expect(card.locator("..").getByText("示意玩具 · 雙語原型")).toBeVisible();
      await expect(showcase.getByText("示意玩具，不是心理測驗。")).toBeVisible();
      await expect(showcase.locator("img").first()).toHaveAttribute("src", "/images/showcase-december-cover.webp");
      await expect(showcase.locator("img").first()).toHaveAttribute("alt", /銀河之女/);
      const href = await card.locator("..").getByRole("link", { name: "玩一次", exact: true }).getAttribute("href");
      expect(href).toContain("/prototype/teammate-type/");
      expect(href).toContain("lang=zh");
      await noOverflow(page);
      await shootShowcaseAndGarage(page, `home-${width}-zh-showcase-garage`);
      await page.goto("/?lang=en#garage");
      await expect(page.locator("#garage-branch-light-tech").getByRole("heading", { level: 3 })).toHaveText("Light-tech toys");
      await expectBranchFirst(page, "Bring Paul Into the Room");
      await expect(page.locator("#garage")).toContainText("Experiments in progress live here.");
      await expect(page.locator("#garage").getByRole("heading", { name: "December Lights" })).toHaveCount(0);
      const enShowcase = page.locator("#showcase");
      const enCard = enShowcase.getByRole("heading", { name: "December Lights" });
      await expect(enCard).toBeVisible();
      await expect(enShowcase.getByRole("heading", { level: 2 })).toHaveText("Playful Interactive Works");
      await expect(enShowcase.getByText("Explore how AI brings together business judgment, workflows and interactive tools to turn ideas into solutions you can try for yourself.")).toBeVisible();
      await expect(enShowcase.getByText("It starts with an idea. Technology gives it shape, and every exploration opens new possibilities.")).toBeVisible();
      await expect(enShowcase.getByText("Demo / outcomes not validated.", { exact: true })).toHaveCount(0);
      await expect(enShowcase.getByText("Nightglow has sixteen teammates in four factions.")).toBeVisible();
      await expect(enShowcase.getByText("Not about trade: a light play that shows your team style")).toBeVisible();
      await expect(enCard.locator("..").getByText("Illustrative toy · bilingual prototype")).toBeVisible();
      await expect(enShowcase.getByText("A toy, not a personality test.")).toBeVisible();
      await expect(enShowcase.locator("img").first()).toHaveAttribute("alt", /Daughter of the Galaxy/);
      const enHref = await enCard.locator("..").getByRole("link", { name: "Play", exact: true }).getAttribute("href");
      expect(enHref).toContain("/prototype/teammate-type/");
      expect(enHref).toContain("lang=en");
      await noOverflow(page);
      if (width === 1280) await shootShowcaseAndGarage(page, "home-1280-en-showcase-garage");
      await frameBranch(page);
    });
  }
});

test.describe("showcase cover", () => {
  const coverBytes = statSync("public/images/showcase-december-cover.webp").size;
  const showcaseSource = readFileSync("src/components/Showcase.jsx", "utf8");

  test("cover size and ratio live on the item, not a shared 273×1138 frame", () => {
    expect(coverBytes).toBeLessThanOrEqual(60 * 1024);
    expect(showcaseSource).not.toContain("273");
    expect(showcaseSource).not.toContain("1138");
    expect(showcaseSource).not.toContain("aspect-[4/3]");
    expect(showcaseSource).not.toContain("object-top");
    expect(showcaseSource).toContain("item.imageRatio");
    expect(showcaseSource).toContain("item.objectPosition");
    expect(showcaseSource).toContain("item.imageWidth");
    expect(showcaseSource).toContain("item.imageHeight");
  });

  for (const width of [390, 768, 1440]) {
    for (const lang of ["zh", "en"]) {
      test(`${width}px ${lang} shows the Nightglow scene cover centered in a 4:5 frame`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/?lang=${lang}#showcase`);
        const img = page.locator("#showcase img").first();
        await img.scrollIntoViewIfNeeded();
        await expect(img).toHaveAttribute("src", "/images/showcase-december-cover.webp");
        await expect(img).toHaveAttribute("width", "816");
        await expect(img).toHaveAttribute("height", "1020");
        await img.evaluate((node) => (node.complete && node.naturalWidth > 0 ? null : node.decode()));
        const metrics = await img.evaluate((node) => {
          const frame = node.parentElement.getBoundingClientRect();
          return {
            naturalWidth: node.naturalWidth,
            naturalHeight: node.naturalHeight,
            objectPosition: getComputedStyle(node).objectPosition,
            aspectRatio: getComputedStyle(node.parentElement).aspectRatio,
            frameRatio: frame.width / frame.height,
          };
        });
        expect(metrics.naturalWidth).toBe(816);
        expect(metrics.naturalHeight).toBe(1020);
        expect(metrics.objectPosition).toBe("50% 50%");
        expect(metrics.aspectRatio.replace(/\s/g, "")).toBe("4/5");
        expect(Math.abs(metrics.frameRatio - 4 / 5)).toBeLessThan(0.02);
        await noOverflow(page);
        const card = page.locator("#showcase article").first();
        await card.scrollIntoViewIfNeeded();
        await card.screenshot({ path: `${OUT}/showcase-after-${width}-${lang}.png` });
      });
    }
  }
});

for (const width of [390, 768, 1440]) {
  test.describe(`toy ${width}px`, () => {
    test.use({ viewport: { width, height: width === 390 ? 844 : 1000 } });

    test("zh play, share-link round trip, and en card", async ({ page }) => {
      const external = [];
      const roleArt = [];
      const maps = [];
      page.on("request", (request) => {
        const url = request.url();
        if (!url.startsWith("http://127.0.0.1:4173") && !url.startsWith("data:")) external.push(url);
        if (url.includes("nightglow-map")) maps.push(url);
        else if (url.includes("/prototype/teammate-type/assets/")) roleArt.push(url);
      });
      await page.goto("/prototype/teammate-type/?lang=zh");
      await expect(page.getByRole("heading", { name: "十二月的燈" })).toBeVisible();
      await expect(page.locator("#subtitle")).toHaveText("你是哪一種隊友？");
      expect(roleArt).toEqual([]);
      expect(maps.length).toBeGreaterThan(0);
      await expect(page.getByText("示意玩具，不是心理測驗。").first()).toBeVisible();
      await expect(page.locator("#entry")).toBeVisible();
      await expect(page.locator("#quiz")).toBeHidden();
      await page.locator("#start").click();
      await expect(page.locator("#quiz")).toBeVisible();
      await noOverflow(page);
      if (width === 390) await shoot(page, "teammate-390-zh-quiz");

      await page.locator("#choices button").nth(0).click();
      await expect(page.locator("#scenario-title")).toHaveText("社團成果展佈置");
      await page.locator("#choices button").nth(1).click();
      await page.locator("#choices button").nth(0).click();

      await expect(page.locator("#card-name")).toHaveText("塞安 · 刺客 · 最後一擊");
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

      const shared = page.locator("#share-short");
      const url = await shared.getAttribute("data-url");
      await expect(shared).toContainText("c=ABA");
      await expect(page.getByRole("button", { name: "複製連結" })).toBeVisible();
      expect(url).toContain("c=ABA");
      expect(url).toContain("lang=zh");
      await page.goto(url);
      await expect(page.locator("#card-name")).toHaveText("塞安 · 刺客 · 最後一擊");
      await expect(page.locator("#quiz")).toBeHidden();

      await page.getByRole("button", { name: "EN" }).click();
      await expect(page.locator("#card-name")).toHaveText("Zion · Assassin · The Finisher");
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

      const enUrl = await page.locator("#share-short").getAttribute("data-url");
      await expect(page.getByRole("button", { name: "Copy link" })).toBeVisible();
      await page.goto(enUrl);
      await expect(page.locator("#card-name")).toHaveText("Zion · Assassin · The Finisher");
      await expect(page.locator("#other-name")).toHaveText("塞安 · 刺客 · 最後一擊");

      if (width === 1440) {
        const [download] = await Promise.all([
          page.waitForEvent("download"),
          page.getByRole("button", { name: "Download card" }).click(),
        ]);
        expect(download.suggestedFilename()).toBe("teammate-ABA.png");
        await page.getByRole("button", { name: "Play again" }).click();
        await expect(page.locator("#entry")).toBeVisible();
        await expect(page.locator("#quiz")).toBeHidden();
        await expect(page.locator("#start")).toBeVisible();
        expect(page.url()).not.toContain("c=");
        await shoot(page, "teammate-1440-en-entry");
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
    await expect(page.locator("#card-name")).toHaveText("MG · 守護者 · 晚安熱可可");
    await expect(page.locator("#role")).toBeHidden();
    await expectFunnyHighlight(page);
    await noOverflow(page);
    await page.locator("#card").screenshot({ path: `${OUT}/teammate-390-zh-cocoa-card.png` });

    await page.getByRole("button", { name: "EN" }).click();
    await expect(page.locator("#card-name")).toHaveText("MG · Guardian · The Cocoa");
    await expect(page.locator("#role")).toBeHidden();
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
  { code: "EAE", zh: "墨衡 · 軍師 · 先看全局", en: "Rook · Strategist · Sees the Whole Board", roleZh: "組隊角色 · 軍師", roleEn: "Party role · Strategist" },
  { code: "AEA", zh: "阿修 · 傳令兵 · 話送到了", en: "Shiu · Messenger · Gets It Through", roleZh: "組隊角色 · 傳令兵", roleEn: "Party role · Messenger" },
  { code: "AFE", zh: "言歌 · 傳教士 · 這件事值得說", en: "Echo · Missionary · Worth Saying Out Loud", roleZh: "組隊角色 · 傳教士", roleEn: "Party role · Missionary" },
  { code: "ACF", zh: "保羅 · 使徒 · 我接著走", en: "Paul · Apostle · I'll Carry It On", roleZh: "組隊角色 · 使徒", roleEn: "Party role · Apostle" },
  { code: "FAE", zh: "銀河之女 · 女王", en: "Daughter of the Galaxy · Queen", roleZh: "組隊角色 · 女王", roleEn: "Party role · Queen" },
  { code: "FBD", zh: "Holly · 仙女座女王", en: "Holly · Queen of Andromeda", roleZh: "組隊角色 · 女王", roleEn: "Party role · Queen" },
  { code: "AFC", zh: "苔苔 · 設計師 · 順眼就對了", en: "Moss · Designer · Makes It Look Right", roleZh: "組隊角色 · 設計師", roleEn: "Party role · Designer" },
];

test.describe("new choices and roles", () => {
  for (const width of [390, 1280]) {
    test(`${width}px scenario shows the added options`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 1400 : 1100 });
      await page.goto("/prototype/teammate-type/?lang=zh");
      await page.locator("#start").click();
      await expect(page.locator("#choices button")).toHaveCount(8);
      await expect(page.locator("#choices")).toContainText("先把整晚要做的事在腦裡走一遍，再動手。");
      await expect(page.locator("#choices")).toContainText("在語音裡定調：今晚照這個走，大家跟上。");
      await expect(page.locator("#choices")).toContainText("先把一直當機的那台電腦修好，大家才不會一直等。");
      await expect(page.locator("#choices")).toContainText("先把今晚每個人做的事記下來，明天才看得到。");
      await noOverflow(page);
      await page.locator("#quiz").screenshot({ path: `${OUT}/teammate-${width}-zh-choices.png` });
      await page.goto("/prototype/teammate-type/?lang=en");
      await page.locator("#start").click();
      await expect(page.locator("#choices button")).toHaveCount(8);
      await expect(page.locator("#choices")).toContainText("Walk the whole night through in your head, then start.");
      await expect(page.locator("#choices")).toContainText("Set the tone on voice: this is the plan tonight, everyone follow.");
      await expect(page.locator("#choices")).toContainText("Fix the computer that keeps freezing, so nobody has to keep waiting.");
      await expect(page.locator("#choices")).toContainText("Write down what everyone did tonight, so tomorrow it's still there.");
      await noOverflow(page);
      await page.locator("#quiz").screenshot({ path: `${OUT}/teammate-${width}-en-choices.png` });
    });

    test(`${width}px four new role cards`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 1100 : 1000 });
      for (const role of NEW_ROLES) {
        await page.goto(`/prototype/teammate-type/?c=${role.code}&lang=zh`);
        await waitForQueen(page);
        await expect(page.locator("#card-name")).toHaveText(role.zh);
        await expect(page.locator("#role")).toBeHidden();
        await expect(page.locator("#card-boundary")).toHaveText("示意玩具，不是心理測驗。");
        await expectFunnyHighlight(page);
        await noOverflow(page);
        await page.locator("#card").screenshot({ path: `${OUT}/teammate-${width}-zh-${role.code}-card.png` });
        await page.goto(`/prototype/teammate-type/?c=${role.code}&lang=en`);
        await waitForQueen(page);
        await expect(page.locator("#card-name")).toHaveText(role.en);
        await expect(page.locator("#role")).toBeHidden();
        await expect(page.locator("#card-boundary")).toHaveText("A toy, not a personality test.");
        await expectFunnyHighlight(page);
        await noOverflow(page);
        await page.locator("#card").screenshot({ path: `${OUT}/teammate-${width}-en-${role.code}-card.png` });
      }
    });
  }

  test("downloaded cards export at 2× of 1080×2200", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1000 });
    const jobs = [
      { code: "EAE", lang: "zh", file: "strategist-zh.png", button: "下載角色卡" },
      { code: "FAE", lang: "zh", file: "queen-zh.png", button: "下載角色卡" },
      { code: "AAA", lang: "zh", file: "umbrella-zh.png", button: "下載角色卡" },
      { code: "AEA", lang: "en", file: "messenger-en.png", button: "Download card" },
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
      expect(pngSize(dest)).toEqual({ width: 2160, height: 4400 });
    }
  });

  test("390px zh queen is rare and a guardian code shows the cat", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1100 });
    await page.goto("/prototype/teammate-type/?c=FAE&lang=zh");
    await waitForQueen(page);
    await expect(page.locator("#card-name")).toHaveText("銀河之女 · 女王");
    await expect(page.locator("#role")).toBeHidden();
    await expect(page.locator("#rare")).toHaveText("稀有");
    await expect(page.locator("#horse")).toBeHidden();
    await expect(page.locator("#mg")).toBeHidden();
    await expect(page.locator("#queen-art")).toBeVisible();
    await expect(page.locator("#queen-art")).toHaveAttribute("src", "assets/galaxy.webp");
    await noOverflow(page);
    await page.locator("#card").screenshot({ path: `${OUT}/teammate-390-zh-queen-rare.png` });
    const [queenDownload] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "下載角色卡" }).click(),
    ]);
    const queenDest = `${CARDS}/galaxy-zh.png`;
    await queenDownload.saveAs(queenDest);
    expect(pngSize(queenDest)).toEqual({ width: 2160, height: 4400 });

    await page.goto("/prototype/teammate-type/?c=FBD&lang=zh");
    await waitForQueen(page);
    await expect(page.locator("#card-name")).toHaveText("Holly · 仙女座女王");
    await expect(page.locator("#card-egg")).toHaveText("M-31");
    await expect(page.locator("#role")).toBeHidden();
    await expect(page.locator("#rare")).toHaveText("稀有");
    await expect(page.locator("#queen-art")).toHaveAttribute("src", "assets/andromeda-v2.webp");
    await expect(page.locator("#horse")).toBeHidden();
    await expect(page.locator("#mg")).toBeHidden();
    await noOverflow(page);
    await page.locator("#card").screenshot({ path: `${OUT}/teammate-390-zh-andromeda-rare.png` });
    const [andromedaDownload] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "下載角色卡" }).click(),
    ]);
    const andromedaDest = `${CARDS}/andromeda-zh.png`;
    await andromedaDownload.saveAs(andromedaDest);
    expect(pngSize(andromedaDest)).toEqual({ width: 2160, height: 4400 });

    await page.goto("/prototype/teammate-type/?c=BBA&lang=zh");
    await waitForMg(page);
    await expect(page.locator("#card-name")).toHaveText("MG · 守護者 · 晚安熱可可");
    await expect(page.locator("#role")).toBeHidden();
    await expect(page.locator("#horse")).toBeHidden();
    await expect(page.locator("#companion")).toBeHidden();
    await expect(page.locator("#mg")).toBeVisible();
    await expect(page.locator("#queen-art")).toBeHidden();
    await page.getByRole("button", { name: "EN" }).click();
    await expect(page.locator("#card-name")).toHaveText("MG · Guardian · The Cocoa");
    await expect(page.locator("#role")).toBeHidden();
    await expect(page.locator("#horse")).toBeHidden();
    await expect(page.locator("#mg")).toBeVisible();
    await page.getByRole("button", { name: "中文" }).click();
    await waitForMg(page);
    await noOverflow(page);
    await page.locator("#card").screenshot({ path: `${OUT}/role-390-zh-guardian-cat.png` });
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "下載角色卡" }).click(),
    ]);
    const dest = `${CARDS}/guardian-cat-zh.png`;
    await download.saveAs(dest);
    expect(pngSize(dest)).toEqual({ width: 2160, height: 4400 });
  });

  test("390px zh alliance shows the winged horse", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1100 });
    await page.goto("/prototype/teammate-type/?c=EEA&lang=zh");
    await page.waitForFunction(() => {
      const img = document.querySelector("#horse");
      return img && !img.hidden && img.complete && img.naturalWidth > 0;
    });
    await expect(page.locator("#card-name")).toHaveText("玉仔 · 聯盟 · 援軍到了");
    await expect(page.locator("#card-mark")).toHaveText("照夜玉獅子");
    await expect(page.locator("#role")).toBeHidden();
    await expect(page.locator("#rare")).toBeHidden();
    await expect(page.locator("#horse")).toBeVisible();
    await expect(page.locator("#mg")).toBeHidden();
    await expect(page.locator("#queen-art")).toBeHidden();
    await expect(page.locator("#companion")).toBeHidden();
    await expectFunnyHighlight(page);
    await noOverflow(page);
    await page.locator("#card").screenshot({ path: `${OUT}/role-390-zh-alliance.png` });
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "下載角色卡" }).click(),
    ]);
    const dest = `${CARDS}/alliance-zh.png`;
    await download.saveAs(dest);
    expect(pngSize(dest)).toEqual({ width: 2160, height: 4400 });
    await page.getByRole("button", { name: "EN" }).click();
    await expect(page.locator("#card-name")).toHaveText("Yuzai · Alliance · Reinforcements Are Here");
    await expect(page.locator("#card-mark")).toHaveText("Night-Shining Jade Lion");
    await expect(page.locator("#role")).toBeHidden();
    await expect(page.locator("#horse")).toBeVisible();
    await expect(page.locator("#mg")).toBeHidden();
    const [enDownload] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Download card" }).click(),
    ]);
    await enDownload.saveAs(`${CARDS}/alliance-en.png`);
    expect(pngSize(`${CARDS}/alliance-en.png`)).toEqual({ width: 2160, height: 4400 });
  });

  test("390px zh portrait roles each show their own picture", async ({ page }) => {
    test.setTimeout(240000);
    await page.setViewportSize({ width: 390, height: 1100 });
    const roles = [
      { code: "AAA", file: "umbrella.webp", zh: "阿白 · 坦克 · 擋雨的人", en: "Abai · Tank · The Umbrella" },
      { code: "BBC", file: "finisher.webp", zh: "塞安 · 刺客 · 最後一擊", en: "Zion · Assassin · The Finisher" },
      { code: "CCC", file: "spark.webp", zh: "阿閃 · 點子 · 腦內煙火師", en: "Flick · Ideas · The Spark" },
      { code: "DAA", file: "mapkeeper.webp", zh: "莉婭 · 斥候 · 地圖收藏家", en: "Leia · Scout · The Mapkeeper" },
      { code: "CCD", file: "soundtrack.webp", zh: "樂樂 · 吟遊詩人 · BGM 擔當", en: "Remi · Bard · The Soundtrack" },
      { code: "EAE", file: "strategist.webp", zh: "墨衡 · 軍師 · 先看全局", en: "Rook · Strategist · Sees the Whole Board" },
      { code: "AEA", file: "messenger.webp", zh: "阿修 · 傳令兵 · 話送到了", en: "Shiu · Messenger · Gets It Through" },
      { code: "AFC", file: "designer.webp", zh: "苔苔 · 設計師 · 順眼就對了", en: "Moss · Designer · Makes It Look Right" },
      { code: "AFE", file: "missionary.webp", zh: "言歌 · 傳教士 · 這件事值得說", en: "Echo · Missionary · Worth Saying Out Loud" },
      { code: "ACF", file: "apostle.webp", zh: "保羅 · 使徒 · 我接著走", en: "Paul · Apostle · I'll Carry It On" },
      { code: "FAE", file: "galaxy.webp", zh: "銀河之女 · 女王", en: "Daughter of the Galaxy · Queen" },
      { code: "FBD", file: "andromeda-v2.webp", zh: "Holly · 仙女座女王", en: "Holly · Queen of Andromeda" },
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
      await page.locator("#card").screenshot({ path: `${OUT}/role-390-zh-${role.file.replace(/\.webp$/, "")}.png` });
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.getByRole("button", { name: "下載角色卡" }).click(),
      ]);
      const dest = `${CARDS}/${role.file.replace(/\.webp$/, "")}-zh.png`;
      await download.saveAs(dest);
      expect(pngSize(dest)).toEqual({ width: 2160, height: 4400 });
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
      const enDest = `${CARDS}/${role.file.replace(/\.webp$/, "")}-en.png`;
      await enDownload.saveAs(enDest);
      expect(pngSize(enDest)).toEqual({ width: 2160, height: 4400 });
    }
  });
});

test.describe("two-person scene", () => {
  async function settleDuo(page) {
    await page.evaluate(() => Promise.all(
      [...document.querySelectorAll("#duo-stage .duo-card, #duo-stage .duo-line")].flatMap((el) => el.getAnimations().map((anim) => anim.finished.catch(() => {}))),
    ));
  }

  async function openDuo(page, width, search) {
    await page.setViewportSize({ width, height: width === 390 ? 1400 : 1200 });
    await page.goto(`/prototype/teammate-type/${search}`);
    await page.waitForFunction(() => {
      const left = document.querySelector("#duo-left");
      const right = document.querySelector("#duo-right");
      return left && right && !left.closest("#duo-stage").hidden && left.complete && right.complete && left.naturalWidth > 0 && right.naturalWidth > 0;
    });
    await expect(page.locator("#duo-boundary")).toHaveText("示意玩具，不是心理測驗。");
    await expect(page.locator("#card-boundary")).toHaveText("示意玩具，不是心理測驗。");
    await expect(page.locator("#card")).toBeHidden();
    await expect(page.locator("#duo-card-left")).toBeVisible();
    await expect(page.locator("#duo-card-right")).toBeVisible();
    await settleDuo(page);
    await page.locator("#duo-stage").evaluate((el) => {
      document.documentElement.style.scrollBehavior = "auto";
      el.scrollIntoView({ block: "start", behavior: "instant" });
    });
    await noOverflow(page);
  }

  test("lazy-loads a scene and keeps the boundary", async ({ page }) => {
    test.setTimeout(120000);
    const early = [];
    page.on("request", (request) => {
      const url = request.url();
      if (!url.includes("nightglow-map") && (url.includes("/prototype/teammate-type/assets/") || url.includes("/mg-mini-demo/"))) early.push(url);
    });
    await page.setViewportSize({ width: 390, height: 1100 });
    await page.goto("/prototype/teammate-type/?lang=zh");
    expect(await page.locator("#duo-left").getAttribute("src")).toBeNull();
    expect(await page.locator("#duo-right").getAttribute("src")).toBeNull();
    expect(early).toEqual([]);

    await openDuo(page, 390, "?c=FAE&with=FBD&lang=zh");
    await expect(page.locator("#duo-left-name")).toHaveText("銀河之女 · 女王");
    await expect(page.locator("#duo-right-name")).toHaveText("Holly · 仙女座女王");
    await expect(page.locator("#duo-right-egg")).toHaveText("M-31");
    await expect(page.locator("#duo-left-egg")).toBeHidden();
    await expect(page.locator("#duo-left-lines")).toContainText("你一站出來，滑手機的人都把臉抬起來了。");
    await expect(page.locator("#duo-right-lines")).toContainText("你一笑，原本各做各的人都轉過來了。");
    await expect(page.locator("#duo-left-role")).toBeHidden();
    await expect(page.locator("#duo-right-role")).toBeHidden();
    await expect(page.locator("#duo-right-rare")).toHaveText("稀有");
    await expect(page.locator("#duo-lines")).toContainText("你站右邊");
    await expect(page.locator("#duo-left")).not.toHaveClass(/face-in/);
    await expect(page.locator("#duo-right")).toHaveClass(/face-in/);
    await expect(page.locator("#duo-stage")).toHaveClass(/theme-queens/);
    const stacked = await page.evaluate(() => {
      const left = document.querySelector("#duo-card-left").getBoundingClientRect();
      const right = document.querySelector("#duo-card-right").getBoundingClientRect();
      return right.top > left.bottom - 20 && left.width > 240 && right.width > 240;
    });
    expect(stacked).toBe(true);
    expect(page.url()).toContain("c=FAE");
    expect(page.url()).toContain("with=FBD");
    const [duoDownload] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "下載這一幕" }).click(),
    ]);
    expect(duoDownload.suggestedFilename()).toBe("teammate-FAE-with-FBD.png");
    const duoDest = `${CARDS}/duo-FAE-with-FBD.png`;
    await duoDownload.saveAs(duoDest);
    const duoPng = pngSize(duoDest);
    expect(duoPng.width).toBe(2160);
    expect(duoPng.height).toBeGreaterThan(2000);
    await page.screenshot({ path: `${OUT}/duo-390-zh-queens.png` });
    await page.locator("#duo-stage").screenshot({ path: `${OUT}/duo-cards-390-zh-queens.png` });

    await page.getByRole("button", { name: "EN" }).click();
    await expect(page.locator("#duo-title")).toHaveText("A short scene for two");
    await expect(page.locator("#duo-boundary")).toHaveText("A toy, not a personality test.");
    await expect(page.locator("#duo-lines")).toContainText("You take the right");
    await expect(page.locator("#duo-download")).toHaveText("Download this scene");
    await settleDuo(page);
    await page.locator("#duo-stage").scrollIntoViewIfNeeded();
    await noOverflow(page);
    await page.screenshot({ path: `${OUT}/duo-390-en-queens.png` });

    await openDuo(page, 390, "?c=EEA&with=BBA&lang=zh");
    await expect(page.locator("#duo-left-name")).toHaveText("玉仔 · 聯盟 · 援軍到了");
    await expect(page.locator("#duo-left-mark")).toHaveText("照夜玉獅子");
    await expect(page.locator("#duo-right-name")).toHaveText("MG · 守護者 · 晚安熱可可");
    await expect(page.locator("#duo-left")).toHaveAttribute("src", "assets/winged-horse.webp");
    await expect(page.locator("#duo-right")).toHaveAttribute("src", /heart\/00\.webp/);
    await expect(page.locator("#duo-left")).toHaveClass(/face-in/);
    await expect(page.locator("#duo-right")).not.toHaveClass(/face-in/);
    await expect(page.locator("#duo-lines")).toContainText("貓也讓出一點位子");
    await expect(page.locator("#duo-stage")).toHaveClass(/theme-alliance/);
    await expect(page.locator("#duo-left-lines")).toContainText("長處");
    await expect(page.locator("#duo-right-lines")).toContainText("長處");
    await page.screenshot({ path: `${OUT}/duo-390-zh-alliance-cocoa.png` });
    await page.locator("#duo-stage").screenshot({ path: `${OUT}/duo-cards-390-zh-alliance.png` });

    await page.setViewportSize({ width: 390, height: 1100 });
    await page.goto("/prototype/teammate-type/?c=AAA&lang=zh");
    await expect(page.locator("#duo-stage")).toBeHidden();
    await page.locator("#duo-code").fill("https://paulstradecraft.com/prototype/teammate-type/?c=BBC&lang=zh");
    await page.locator("#duo-open").click();
    await page.waitForFunction(() => {
      const right = document.querySelector("#duo-right");
      return right && right.complete && right.naturalWidth > 0 && right.getAttribute("src") === "assets/finisher.webp";
    });
    expect(page.url()).toContain("c=AAA");
    expect(page.url()).toContain("with=BBC");
    await expect(page.locator("#duo-lines")).toContainText("你也在。有你在，這一段就沒那麼吵。");
    await expect(page.locator("#duo-status")).toHaveText("");
    await expect(page.locator("#duo-right-name")).toHaveText("塞安 · 刺客 · 最後一擊");
    await settleDuo(page);
    await page.locator("#duo-stage").evaluate((el) => {
      document.documentElement.style.scrollBehavior = "auto";
      el.scrollIntoView({ block: "start", behavior: "instant" });
    });
    await noOverflow(page);
    await page.screenshot({ path: `${OUT}/duo-390-zh-fallback.png` });
    await page.locator("#duo").screenshot({ path: `${OUT}/duo-390-zh-fallback-scene.png` });
    await page.locator("#duo-code").fill("ZZZ");
    await page.locator("#duo-open").click();
    await expect(page.locator("#duo-status")).toHaveText("這組字母還找不到對應的角色，檢查一下朋友的三個字母。");
    await expect(page.locator("#duo-lines")).toContainText("你也在。有你在，這一段就沒那麼吵。");
    await page.locator("#duo-status").screenshot({ path: `${OUT}/duo-390-zh-invalid.png` });
    await page.getByRole("button", { name: "EN" }).click();
    await expect(page.locator("#duo-status")).toHaveText("These letters haven't found a role yet. Check the three letters your friend sent.");
    await page.locator("#duo-status").screenshot({ path: `${OUT}/duo-390-en-invalid.png` });

    await openDuo(page, 1280, "?c=FAE&with=FBD&lang=zh");
    await expect(page.locator("#duo-title")).toHaveText("兩人小劇場");
    const desktopDialogue = await page.evaluate(() => {
      const left = document.querySelector("#duo-card-left").getBoundingClientRect();
      const right = document.querySelector("#duo-card-right").getBoundingClientRect();
      const bubbles = document.querySelector("#duo-lines").getBoundingClientRect();
      const stage = document.querySelector("#duo-stage").getBoundingClientRect();
      const cardsSideBySide = right.left > left.right - 4 && Math.abs(left.top - right.top) < 24;
      const dialogueBelow = bubbles.top >= left.bottom - 8 && bubbles.top >= right.bottom - 8;
      const widthOk = bubbles.width >= 560 && bubbles.width <= 640;
      const centered = Math.abs((bubbles.left + bubbles.right) / 2 - (stage.left + stage.right) / 2) < 8;
      return cardsSideBySide && dialogueBelow && widthOk && centered;
    });
    expect(desktopDialogue).toBe(true);
    await page.screenshot({ path: `${OUT}/duo-1280-zh-queens.png` });
    await page.locator("#duo-stage").screenshot({ path: `${OUT}/duo-cards-1280-zh-queens.png` });

    await openDuo(page, 1280, "?c=EEA&with=BBA&lang=zh");
    await expect(page.locator("#duo-left-name")).toHaveText("玉仔 · 聯盟 · 援軍到了");
    await expect(page.locator("#duo-left-mark")).toHaveText("照夜玉獅子");
    await expect(page.locator("#duo-right-name")).toHaveText("MG · 守護者 · 晚安熱可可");
    await page.locator("#duo-stage").screenshot({ path: `${OUT}/duo-cards-1280-zh-alliance.png` });
  });
});

test.describe("Nightglow intro", () => {
  const zhIntro = "歡迎來到照夜鎮。每個人都有自己的本事。一起完成一件小事，就讓夜晚亮一點。";
  const enIntro = "Welcome to Nightglow. Everyone brings something to the team. Each small thing you accomplish together makes the night a little brighter.";

  test("zh and en intro name the town and the English wraps", async ({ page }) => {
    for (const width of [390, 1280]) {
      await page.setViewportSize({ width, height: width === 390 ? 900 : 800 });
      await page.goto("/prototype/teammate-type/?lang=zh");
      await expect(page.locator("#intro")).toHaveText(zhIntro);
      await expect(page.locator("body")).not.toContainText("遠燈鎮");
      await noOverflow(page);
      await page.screenshot({ path: `${OUT}/intro-${width}-zh-nightglow.png`, clip: await introClip(page) });

      await page.getByRole("button", { name: "EN" }).click();
      await expect(page.locator("#intro")).toHaveText(enIntro);
      await expect(page.locator("body")).not.toContainText("遠燈鎮");
      const wrap = await page.locator("#intro").evaluate((node) => {
        const range = document.createRange();
        range.selectNodeContents(node);
        const rects = [...range.getClientRects()];
        return { lines: rects.length, overflow: node.scrollWidth - node.clientWidth };
      });
      expect(wrap.overflow).toBeLessThanOrEqual(1);
      expect(wrap.lines).toBeGreaterThan(1);
      await noOverflow(page);
      await page.screenshot({ path: `${OUT}/intro-${width}-en-nightglow.png`, clip: await introClip(page) });
    }
  });
});

async function introClip(page) {
  const title = await page.locator("#title").boundingBox();
  const intro = await page.locator("#intro").boundingBox();
  const viewport = page.viewportSize();
  const top = Math.min(title.y, intro.y);
  const bottom = Math.max(title.y + title.height, intro.y + intro.height);
  return {
    x: 0,
    y: Math.max(0, top - 28),
    width: viewport.width,
    height: Math.min(viewport.height - Math.max(0, top - 28), Math.ceil(bottom - top + 48)),
  };
}

test.describe("sixteen roles", () => {
  test("result cards, the cast, and one duo show faction badges", async ({ page }) => {
    test.setTimeout(120000);
    for (const width of [390, 1280]) {
      await page.setViewportSize({ width, height: width === 390 ? 1600 : 1400 });
      await page.goto("/prototype/teammate-type/?c=HHH&lang=zh");
      await page.waitForFunction(() => {
        const img = document.querySelector("#queen-art");
        return img && !img.hidden && img.complete && img.naturalWidth > 0;
      });
      await expect(page.locator("#card-name")).toHaveText("靚仔 · 記錄者 · 拍下來了");
      await expect(page.locator("#card-sub")).toBeHidden();
      await expect(page.locator("#faction")).toHaveText("🌌 銀河隊");
      await expect(page.locator("#about")).toContainText("關於隊友阿白");
      await expect(page.locator("#card-boundary")).toHaveText("示意玩具，不是心理測驗。");
      await noOverflow(page);
      await page.locator("#card").screenshot({ path: `${OUT}/role-${width}-zh-recorder.png` });

      await page.goto("/prototype/teammate-type/?c=GGG&lang=zh");
      await page.waitForFunction(() => {
        const img = document.querySelector("#queen-art");
        return img && !img.hidden && img.complete && img.naturalWidth > 0;
      });
      await expect(page.locator("#card-name")).toHaveText("戴安娜 · 工匠 · 修好了");
      await expect(page.locator("#role")).toBeHidden();
      await expect(page.locator("#faction")).toHaveText("🏮 燈下隊");
      await expect(page.locator("#about")).toContainText("關於隊友MG");
      await noOverflow(page);
      await page.locator("#card").screenshot({ path: `${OUT}/role-${width}-zh-craftsman.png` });

      await page.goto("/prototype/teammate-type/?lang=zh");
      await expect(page.locator("#see-all")).toHaveCount(0);
      await page.locator("#gallery").scrollIntoViewIfNeeded();
      await expect(page.locator("#gallery img").first()).toHaveAttribute("loading", "lazy");
      await page.locator("#gallery img").last().scrollIntoViewIfNeeded();
      await page.waitForFunction(() => {
        const images = [...document.querySelectorAll("#gallery img")];
        return images.length === 16 && images.every((img) => img.complete && img.naturalWidth > 0);
      });
      await expect(page.locator("#gallery")).toContainText("銀河隊");
      await expect(page.locator("#gallery")).toContainText("仙女隊");
      await expect(page.locator("#gallery")).toContainText("星圖隊");
      await expect(page.locator("#gallery")).toContainText("燈下隊");
      await expect(page.locator("#gallery")).toContainText("靚仔");
      await expect(page.locator("#gallery")).toContainText("修好了");
      await noOverflow(page);
      await page.locator("#gallery").screenshot({ path: `${OUT}/gallery-${width}-zh-sixteen.png` });

      await page.goto("/prototype/teammate-type/?c=GGG&with=HHH&lang=zh");
      await page.waitForFunction(() => {
        const left = document.querySelector("#duo-left");
        const right = document.querySelector("#duo-right");
        return left && right && !left.closest("#duo-stage").hidden && left.complete && right.complete && left.naturalWidth > 0 && right.naturalWidth > 0;
      });
      await page.evaluate(() => Promise.all(
        [...document.querySelectorAll("#duo-stage .duo-card, #duo-stage .duo-line")].flatMap((el) => el.getAnimations().map((anim) => anim.finished.catch(() => {}))),
      ));
      await expect(page.locator("#duo-left-name")).toHaveText("戴安娜 · 工匠 · 修好了");
      await expect(page.locator("#duo-right-name")).toHaveText("靚仔 · 記錄者 · 拍下來了");
      await expect(page.locator("#duo-left-faction")).toHaveText("🏮 燈下隊");
      await expect(page.locator("#duo-right-faction")).toHaveText("🌌 銀河隊");
      await expect(page.locator("#duo-lines")).toContainText("你也在。");
      await noOverflow(page);
      await page.locator("#duo-stage").screenshot({ path: `${OUT}/duo-${width}-zh-craftsman-recorder.png` });
    }
  });
});

test.describe("game cover", () => {
  test("the map is the first screen and the CTA stays in view", async ({ page }) => {
    const shots = [
      { width: 1280, height: 800, lang: "zh", name: "cover-1280x800-zh" },
      { width: 1440, height: 900, lang: "zh", name: "cover-1440x900-zh" },
      { width: 390, height: 844, lang: "zh", name: "cover-390x844-zh" },
      { width: 390, height: 844, lang: "en", name: "cover-390x844-en" },
      { width: 1440, height: 900, lang: "en", name: "cover-1440x900-en" },
      { width: 1280, height: 800, lang: "en", name: "cover-1280x800-en" },
    ];
    for (const shot of shots) {
      await page.setViewportSize({ width: shot.width, height: shot.height });
      await page.goto(`/prototype/teammate-type/?lang=${shot.lang}`);
      await page.waitForFunction(() => {
        const img = document.querySelector("#town-map");
        return img && img.complete && img.naturalWidth > 0;
      });
      const box = await page.evaluate(() => {
        const rect = (sel) => {
          const node = document.querySelector(sel).getBoundingClientRect();
          return { top: node.top, bottom: node.bottom, left: node.left, right: node.right, width: node.width, height: node.height };
        };
        return {
          vh: window.innerHeight,
          vw: window.innerWidth,
          start: rect("#start"),
          boundary: rect("#entry-boundary"),
          intro: rect("#intro"),
          title: rect("#title"),
          cover: rect("#cover"),
          frame: rect(".map-frame"),
          team: rect("#team-fallback"),
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });
      expect(box.overflow).toBeLessThanOrEqual(1);
      expect(box.cover.top).toBeLessThanOrEqual(2);
      expect(box.cover.height).toBeGreaterThanOrEqual(box.vh - 2);
      if (shot.width >= 860) {
        expect(box.frame.height).toBeGreaterThanOrEqual(box.vh - 2);
        expect(box.frame.width).toBeGreaterThanOrEqual(box.vw - 2);
      } else {
        expect(box.frame.left).toBeGreaterThanOrEqual(-1);
        expect(box.frame.right).toBeLessThanOrEqual(box.vw + 1);
        expect(box.frame.top).toBeGreaterThanOrEqual(-1);
        expect(box.frame.bottom).toBeLessThanOrEqual(box.vh + 1);
      }
      expect(box.start.top).toBeGreaterThanOrEqual(0);
      expect(box.start.bottom).toBeLessThanOrEqual(box.vh);
      expect(box.boundary.bottom).toBeLessThanOrEqual(box.vh);
      expect(box.boundary.top).toBeGreaterThanOrEqual(0);
      expect(box.title.bottom).toBeLessThanOrEqual(box.vh);
      expect(box.intro.bottom).toBeLessThanOrEqual(box.vh);
      expect(box.team.top).toBeGreaterThanOrEqual(box.vh - 2);
      await expect(page.locator("#lockup")).toHaveText("照夜鎮 Nightglow");
      const phrase = shot.lang === "zh" ? "示意玩具，不是心理測驗。" : "A toy, not a personality test.";
      await expect(page.locator("#entry-boundary")).toHaveText(phrase);
      const visibleLabels = await page.evaluate((text) => [...document.querySelectorAll("p")].filter((el) => {
        if (el.textContent.trim() !== text) return false;
        const box = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        return style.visibility !== "hidden" && box.height > 8 && box.top < window.innerHeight && box.bottom > 0;
      }).length, phrase);
      expect(visibleLabels).toBe(1);
      const pin = page.locator(shot.width < 860 ? ".hotspots-mobile .hot-galaxy .pin-label" : ".hotspots-desk .hot-galaxy .pin-label");
      if (shot.lang === "zh") {
        await expect(page.locator("#start")).toHaveText("出發");
        await expect(page.locator("#cover-hint")).toHaveText("點街區認識隊員，點中央的燈出發");
        await expect(pin).toHaveText("銀河隊");
      } else {
        await expect(page.locator("#start")).toHaveText("Set out");
        await expect(page.locator("#cover-hint")).toHaveText("Tap a district to meet the team. Tap the lamp in the center to set out.");
        await expect(pin).toHaveText("Galaxy");
      }
      await page.screenshot({ path: `${OUT}/${shot.name}.png` });
    }
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/prototype/teammate-type/?c=EEA&lang=zh");
    await expect(page.locator("#entry")).toBeHidden();
    await expect(page.locator("#card-name")).toHaveText("玉仔 · 聯盟 · 援軍到了");
  });
});

test.describe("Nightglow map", () => {
  test("entry, district preview, and named cards", async ({ page }) => {
    test.setTimeout(120000);
    for (const lang of ["zh", "en"]) {
      for (const width of [390, 1280]) {
        await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
        await page.goto(`/prototype/teammate-type/?lang=${lang}`);
        await expect(page.locator("#entry")).toBeVisible();
        await expect(page.locator("#quiz")).toBeHidden();
        await expect(page.locator("#intro")).toBeVisible();
        await expect(page.locator("#entry-boundary")).toBeVisible();
        await page.waitForFunction(() => {
          const img = document.querySelector("#town-map");
          return img && img.complete && img.naturalWidth > 0;
        });
        const lamp = page.locator(width === 390 ? ".hotspots-mobile .hot-lamp" : ".hotspots-desk .hot-lamp");
        const lampBox = await lamp.boundingBox();
        expect(lampBox.width).toBeGreaterThanOrEqual(48);
        expect(lampBox.height).toBeGreaterThanOrEqual(48);
        await expect(page.locator("#team-fallback")).toContainText(lang === "zh" ? "玉仔" : "Yuzai");
        await noOverflow(page);
        await page.screenshot({ path: `${OUT}/map-${width}-${lang}-entry.png`, fullPage: false });
      }
    }

    for (const width of [390, 1280]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto("/prototype/teammate-type/?lang=zh");
      const hotspot = page.locator(width === 390 ? ".hotspots-mobile .hot-galaxy" : ".hotspots-desk .hot-galaxy");
      const box = await hotspot.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(48);
      expect(box.height).toBeGreaterThanOrEqual(48);
      await hotspot.click();
      await expect(page.locator("#district")).toBeVisible();
      await expect(page.locator("#district-title")).toContainText("銀河隊");
      await expect(page.locator("#district-motto")).toContainText("安靜地站穩");
      await expect(page.locator("#district-members")).toContainText("玉仔 · 聯盟");
      await expect(page.locator("#district-members")).toContainText("照夜玉獅子");
      await page.waitForFunction(() => {
        const images = [...document.querySelectorAll("#district-members img")];
        return images.length === 4 && images.every((img) => img.complete && img.naturalWidth > 0);
      });
      await noOverflow(page);
      await page.screenshot({ path: `${OUT}/map-${width}-zh-district.png` });
    }

    await page.setViewportSize({ width: 390, height: 1200 });
    await page.goto("/prototype/teammate-type/?c=EEA&lang=zh");
    await expect(page.locator("#entry")).toBeHidden();
    await expect(page.locator("#card-name")).toHaveText("玉仔 · 聯盟 · 援軍到了");
    await expect(page.locator("#card-mark")).toHaveText("照夜玉獅子");
    await expect(page.locator("#card-egg")).toBeHidden();
    await noOverflow(page);
    await page.locator("#card").screenshot({ path: `${OUT}/map-390-zh-yuzai.png` });

    await page.setViewportSize({ width: 1280, height: 1100 });
    await page.goto("/prototype/teammate-type/?c=FBD&lang=zh");
    await expect(page.locator("#card-name")).toHaveText("Holly · 仙女座女王");
    await expect(page.locator("#card-egg")).toHaveText("M-31");
    await noOverflow(page);
    await page.locator("#card").screenshot({ path: `${OUT}/map-1280-zh-holly.png` });
    await page.getByRole("button", { name: "EN" }).click();
    await expect(page.locator("#card-name")).toHaveText("Holly · Queen of Andromeda");
    await expect(page.locator("#card-egg")).toHaveText("M-31");
    await page.locator("#card").screenshot({ path: `${OUT}/map-1280-en-holly.png` });
  });
});

test.describe("Paul's review on the names", () => {
  test("assassin and designer cards, and the district focus trap", async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 390, height: 1200 });
    await page.goto("/prototype/teammate-type/?c=BBC&lang=zh");
    await waitForQueen(page);
    await expect(page.locator("#card-name")).toHaveText("塞安 · 刺客 · 最後一擊");
    await expect(page.locator("#role")).toBeHidden();
    await expect(page.locator("#card")).not.toContainText("組隊角色");
    await expect(page.locator("#card")).not.toContainText("輸出");
    await expect(page.locator("#rare")).toBeHidden();
    await noOverflow(page);
    await page.locator("#card").screenshot({ path: `${OUT}/role-390-zh-zion.png` });

    await page.goto("/prototype/teammate-type/?c=AFC&lang=zh");
    await waitForQueen(page);
    await expect(page.locator("#card-name")).toHaveText("苔苔 · 設計師 · 順眼就對了");
    await expect(page.locator("#rare")).toBeHidden();
    await expect(page.locator("#card")).not.toHaveClass(/rare/);
    await expect(page.locator("#role")).toBeHidden();
    await noOverflow(page);
    await page.locator("#card").screenshot({ path: `${OUT}/role-390-zh-moss.png` });

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/prototype/teammate-type/?lang=zh");
    const hotspot = page.locator(".hotspots-desk .hot-galaxy");
    await hotspot.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#district")).toBeVisible();
    await expect(page.locator("#district-close")).toBeFocused();
    for (let step = 0; step < 8; step += 1) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(() => document.querySelector("#district-sheet").contains(document.activeElement));
      expect(inside).toBe(true);
    }
    await page.keyboard.press("Shift+Tab");
    const stillInside = await page.evaluate(() => document.querySelector("#district-sheet").contains(document.activeElement));
    expect(stillInside).toBe(true);
    await page.keyboard.press("Escape");
    await expect(page.locator("#district")).toBeHidden();
    await expect(hotspot).toBeFocused();
  });
});

test.describe("December Lights mobile", () => {
  const views = [
    { width: 390, height: 844, lang: "zh" },
    { width: 390, height: 844, lang: "en" },
    { width: 360, height: 780, lang: "zh" },
    { width: 360, height: 780, lang: "en" },
    { width: 1440, height: 900, lang: "zh" },
    { width: 1440, height: 900, lang: "en" },
  ];

  test("cover, district, quiz, result, and duo at the review sizes", async ({ page }) => {
    test.setTimeout(180000);
    for (const v of views) {
      await page.setViewportSize({ width: v.width, height: v.height });
      await page.goto(`/prototype/teammate-type/?lang=${v.lang}`);
      await page.waitForFunction(() => {
        const img = document.querySelector("#town-map");
        return img && img.complete && img.naturalWidth > 0;
      });
      const tag = `${v.width}x${v.height}-${v.lang}`;
      const title = v.lang === "zh" ? "十二月的燈" : "December Lights";
      const subtitle = v.lang === "zh" ? "你是哪一種隊友？" : "What kind of teammate are you?";
      await expect(page.locator("#title")).toHaveText(title);
      await expect(page.locator("#subtitle")).toHaveText(subtitle);
      await expect(page.locator("#lockup")).toHaveText("照夜鎮 Nightglow");
      await expect(page).toHaveTitle(new RegExp(title));
      const map = await page.evaluate(async () => {
        const img = document.querySelector("#town-map");
        const blob = await (await fetch(img.currentSrc)).blob();
        const bmp = await createImageBitmap(blob);
        return { width: bmp.width, height: bmp.height, current: img.currentSrc };
      });
      if (v.width < 860) {
        expect(map.current).toContain("nightglow-map-mobile.webp");
        expect(map.width).toBe(800);
        expect(map.height).toBe(1422);
        const spots = await page.locator(".hotspots-mobile .hotspot-district").evaluateAll((nodes) => nodes.map((node) => {
          const rect = node.getBoundingClientRect();
          return {
            left: rect.left,
            top: rect.top,
            right: window.innerWidth - rect.right,
            bottom: window.innerHeight - rect.bottom,
          };
        }));
        expect(spots).toHaveLength(4);
        for (const spot of spots) {
          expect(spot.left).toBeGreaterThanOrEqual(16);
          expect(spot.top).toBeGreaterThanOrEqual(16);
          expect(spot.right).toBeGreaterThanOrEqual(16);
          expect(spot.bottom).toBeGreaterThanOrEqual(16);
        }
        const pinSize = await page.locator(".hotspots-mobile .pin-label").first().evaluate((node) => parseFloat(getComputedStyle(node).fontSize));
        expect(pinSize).toBeGreaterThanOrEqual(14);
        expect(pinSize).toBeLessThanOrEqual(15);
      } else {
        expect(map.current).toContain("nightglow-map.webp");
        expect(map.current).not.toContain("nightglow-map-mobile.webp");
        expect(map.width).toBe(1600);
        expect(map.width).toBeLessThan(2560);
      }
      const lockupSize = await page.locator("#lockup").evaluate((node) => parseFloat(getComputedStyle(node).fontSize));
      const boundarySize = await page.locator("#entry-boundary").evaluate((node) => parseFloat(getComputedStyle(node).fontSize));
      expect(lockupSize).toBeGreaterThanOrEqual(14);
      expect(boundarySize).toBeGreaterThanOrEqual(14);
      const home = await page.locator("#cover-home").boundingBox();
      expect(home.width).toBeGreaterThanOrEqual(44);
      expect(home.height).toBeGreaterThanOrEqual(44);
      await noOverflow(page);
      await page.screenshot({ path: `${OUT}/december-after-${tag}-cover.png` });

      const before = await page.evaluate(() => ({
        y: window.scrollY,
        title: document.querySelector("#title").getBoundingClientRect().top,
        map: document.querySelector(".map-frame").getBoundingClientRect().top,
      }));
      const hot = page.locator(v.width < 860 ? ".hotspots-mobile .hot-galaxy" : ".hotspots-desk .hot-galaxy");
      await hot.click();
      await expect(page.locator("#district")).toBeVisible();
      const after = await page.evaluate(() => ({
        y: window.scrollY,
        title: document.querySelector("#title").getBoundingClientRect().top,
        map: document.querySelector(".map-frame").getBoundingClientRect().top,
      }));
      expect(after.y).toBe(before.y);
      expect(Math.abs(after.title - before.title)).toBeLessThanOrEqual(1);
      expect(Math.abs(after.map - before.map)).toBeLessThanOrEqual(1);
      expect(after.title).toBeGreaterThanOrEqual(0);
      await page.screenshot({ path: `${OUT}/december-after-${tag}-district.png` });
      await page.locator("#district-close").click();

      await page.locator("#start").click();
      await expect(page.locator("#quiz")).toBeVisible();
      const progressSize = await page.locator("#progress").evaluate((node) => parseFloat(getComputedStyle(node).fontSize));
      const settingSize = await page.locator("#setting").evaluate((node) => parseFloat(getComputedStyle(node).fontSize));
      expect(progressSize).toBeGreaterThanOrEqual(14);
      expect(settingSize).toBeGreaterThanOrEqual(14);
      await page.screenshot({ path: `${OUT}/december-after-${tag}-quiz.png` });

      await page.goto(`/prototype/teammate-type/?c=ABA&lang=${v.lang}`);
      await expect(page.locator("#card-name")).toBeVisible();
      const back = await page.locator("#back").boundingBox();
      expect(back.width).toBeGreaterThanOrEqual(44);
      expect(back.height).toBeGreaterThanOrEqual(44);
      const factionSize = await page.locator("#faction").evaluate((node) => parseFloat(getComputedStyle(node).fontSize));
      const labelSize = await page.locator(".line-label").first().evaluate((node) => parseFloat(getComputedStyle(node).fontSize));
      expect(factionSize).toBeGreaterThanOrEqual(14);
      expect(labelSize).toBeGreaterThanOrEqual(14);
      await expect(page.locator("#share-short")).toContainText(`c=ABA`);
      await expect(page.locator("input.share-url")).toHaveCount(0);
      if (v.width <= 390) {
        const buttons = await page.locator(".actions .primary").evaluateAll((nodes) => nodes.filter((node) => !node.hidden).map((node) => {
          const rect = node.getBoundingClientRect();
          return { y: rect.top, h: rect.height };
        }));
        expect(buttons.length).toBeGreaterThanOrEqual(2);
        expect(buttons[1].y).toBeGreaterThanOrEqual(buttons[0].y + buttons[0].h - 1);
      }
      await page.locator("#result").screenshot({ path: `${OUT}/december-after-${tag}-result.png` });
      await page.locator("#duo-pick").selectOption("alliance");
      await expect(page.locator("#duo-stage")).toBeVisible();
      await page.locator("#duo-lines").scrollIntoViewIfNeeded();
      const bubble = page.locator(".duo-line.from-right").first();
      await expect(bubble).toBeVisible();
      const bubbleStyle = await bubble.evaluate((node) => {
        const style = getComputedStyle(node);
        const speaker = node.querySelector(".duo-speaker");
        return {
          align: style.textAlign,
          self: style.alignSelf,
          speaker: speaker ? parseFloat(getComputedStyle(speaker).fontSize) : 0,
        };
      });
      expect(bubbleStyle.align).toBe("left");
      expect(bubbleStyle.self).toBe("flex-end");
      expect(bubbleStyle.speaker).toBeGreaterThanOrEqual(14);
      await page.locator("#duo-lines").screenshot({ path: `${OUT}/december-after-${tag}-duo.png` });
      await noOverflow(page);
    }
  });
});

test("hidden scene: a quiet glint after the gallery reveals the scene gallery, zh and en", async ({ page }) => {
  for (const f of ["easter-nightglow-v2", "easter-clocktower", "easter-warmwindow", "easter-stage"]) {
    expect(statSync(`prototype/teammate-type/assets/${f}.webp`).size).toBeLessThanOrEqual(61440);
  }
  for (const [lang, word] of [["zh", "路燈"], ["en", "street lamp"]]) {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/prototype/teammate-type/?lang=${lang}`);
      const glint = page.locator("#scene-glint");
      await expect(page.locator("#scenes")).toBeHidden();
      expect((await glint.innerText()).trim()).toBe("✦");
      await expect(glint).toHaveAttribute("aria-label", /.+/);
      await glint.scrollIntoViewIfNeeded();
      await glint.click();
      await expect(glint).toHaveAttribute("aria-expanded", "true");
      const fig = page.locator('#scenes figure[data-scene="galaxy-lamp"]');
      await expect(fig.locator("figcaption")).toContainText(word);
      const img = fig.locator("img");
      await expect(img).toHaveAttribute("alt", /.{12,}/);
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((e) => e.complete && e.naturalWidth)).toBe(816);
      expect(await page.locator("#scenes").innerText()).not.toMatch(/[0-9]/);
      await expect(page.locator("#scenes figure")).toHaveCount(4);
      await noOverflow(page);
      await glint.click();
      await expect(page.locator("#scenes")).toBeHidden();
    }
  }
});

test("share image: December Lights page carries og and twitter image meta", async ({ page }) => {
  expect(statSync("prototype/teammate-type/assets/og-december.webp").size).toBeLessThanOrEqual(61440);
  await page.goto("/prototype/teammate-type/?lang=zh");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /og-december\.webp$/);
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", /og-december\.webp$/);
  const res = await page.request.get("/prototype/teammate-type/assets/og-december.webp");
  expect(res.ok()).toBe(true);
});

test("Holly v2: the queen uses andromeda-v2 everywhere, same canvas as before, old file kept", async ({ page }) => {
  expect(statSync("prototype/teammate-type/assets/andromeda.webp").size).toBeGreaterThan(0);
  expect(statSync("prototype/teammate-type/assets/andromeda-v2.webp").size).toBeLessThanOrEqual(61440);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/prototype/teammate-type/?c=FBD&lang=zh");
  const art = page.locator("#queen-art");
  await expect(art).toHaveAttribute("src", "assets/andromeda-v2.webp");
  await expect.poll(() => art.evaluate((e) => e.complete && `${e.naturalWidth}x${e.naturalHeight}`)).toBe("422x1143");
  const box = await art.boundingBox();
  const ratio = await art.evaluate((e) => e.naturalWidth / e.naturalHeight);
  expect(Math.abs(box.width / box.height - ratio)).toBeLessThan(0.03);
  await page.goto("/prototype/teammate-type/?lang=en");
  const tile = page.locator('#gallery-list a[href*="FBD"] img');
  await tile.scrollIntoViewIfNeeded();
  await expect(tile).toHaveAttribute("src", "assets/andromeda-v2.webp");
});
