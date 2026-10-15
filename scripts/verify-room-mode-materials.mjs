import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { test } from "node:test";

test("rainy-room wall and rug choices change the canvas and download card together", async () => {
  const source = readFileSync("public/prototype/room-mode-remote/app.js", "utf8");
  const elements = new Map();
  const postcardCanvases = [];
  const downloads = [];

  class Element {
    constructor(id = "") {
      this.id = id;
      this.children = [];
      this.handlers = {};
      this.attributes = {};
      this.dataset = {};
      this.hidden = false;
      this.style = {};
    }
    append(...children) { this.children.push(...children); }
    replaceChildren(...children) { this.children = children; }
    setAttribute(key, value) { this.attributes[key] = value; }
    addEventListener(key, handler) { this.handlers[key] = handler; }
    click() { this.handlers.click?.(); }
    scrollIntoView() {}
  }

  class Canvas extends Element {
    constructor(id = "") {
      super(id);
      this.width = 1122;
      this.height = 1402;
      this.draws = [];
      this.context = {
        drawImage: (image) => this.draws.push(image.src),
        fillRect() {},
        fillText() {},
        measureText: (text) => ({ width: text.length * 12 }),
      };
    }
    getContext() { return this.context; }
    toBlob(callback) { callback(new Blob(["postcard"])); }
  }

  class MockImage {
    constructor() {
      this.complete = false;
      this.naturalWidth = 0;
      this.listeners = {};
    }
    set src(value) {
      this._src = value;
      this.complete = true;
      this.naturalWidth = 960;
      queueMicrotask(() => {
        this.onload?.();
        this.listeners.load?.();
      });
    }
    get src() { return this._src; }
    addEventListener(key, handler) { this.listeners[key] = handler; }
  }

  const document = {
    documentElement: { lang: "" },
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, id === "room-canvas" || id === "materials-preview" ? new Canvas(id) : new Element(id));
      return elements.get(id);
    },
    createElement(tag) {
      if (tag === "canvas") {
        const canvas = new Canvas();
        postcardCanvases.push(canvas);
        return canvas;
      }
      const element = new Element();
      if (tag === "a") element.click = () => downloads.push(element.download);
      return element;
    },
    querySelector() { return new Element(); },
  };
  class MockURL extends URL {
    static createObjectURL() { return "blob:room"; }
    static revokeObjectURL() {}
  }
  const media = { matches: false, addEventListener(_event, handler) { this.listener = handler; } };
  const window = { matchMedia: () => media, alert() {} };
  runInNewContext(source, {
    document, window, Image: MockImage, Option: class { constructor(text, value) { this.text = text; this.value = value; } },
    URL: MockURL, URLSearchParams, Blob, location: { search: "?lang=zh", href: "https://example.test/room" },
    history: { replaceState() {} }, setTimeout: (fn) => fn(),
  });
  await Promise.resolve();

  elements.get("materials-entry").click();
  assert.equal(elements.get("materials-panel").hidden, false);
  assert.equal(elements.get("room-canvas").attributes["aria-label"], "雨後的窗邊，地毯把腳步接住。");
  elements.get("wall-options").children.find((button) => button.textContent === "金棕卷草").click();
  elements.get("rug-options").children.find((button) => button.textContent === "古典花紋").click();
  const sceneDraws = elements.get("room-canvas").draws.slice(-3);
  assert.match(sceneDraws[0], /room-rug-v2\.webp$/);
  assert.match(sceneDraws[1], /wallpaper-brown-gold-scroll-accepted\.webp$/);
  assert.match(sceneDraws[2], /rug-antique-inspired\.webp$/);

  media.matches = true;
  media.listener();
  await Promise.resolve();
  const mobileDraws = elements.get("room-canvas").draws.slice(-3);
  assert.match(mobileDraws[0], /room-rug-v2-mobile\.webp$/);
  assert.match(mobileDraws[1], /wallpaper-brown-gold-scroll-accepted\.webp$/);
  assert.match(mobileDraws[2], /rug-antique-inspired\.webp$/);

  elements.get("next-button").click();
  elements.get("choice-list").children[0].click();
  elements.get("next-button").click();
  elements.get("next-button").click();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(downloads[0], "room-mode-remote-rain.png");
  const postcardDraws = postcardCanvases.at(-1).draws;
  assert.match(postcardDraws[1], /wallpaper-brown-gold-scroll-accepted\.webp$/);
  assert.match(postcardDraws[2], /rug-antique-inspired\.webp$/);

  elements.get("language-toggle").click();
  assert.equal(elements.get("materials-title").textContent, "Change just the wall and rug");
});
