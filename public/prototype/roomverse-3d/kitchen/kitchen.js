import * as THREE from "../vendor/three.module.min.js";
import { OrbitControls } from "../vendor/OrbitControls.js";
import { mergeGeometries, mergeVertices } from "../vendor/BufferGeometryUtils.js";
import { GLTFLoader } from "../vendor/GLTFLoader.js";
import { LOUNGE_THROW_POSITIONS_B64 } from "./lounge-throw-baked.js";
import { createRoomRecord } from "../bedroom/sound.js?v=auto"; // Room 02's "布魯克林窗台" (side A)
import { createNightMusic } from "../night-score.js?v=auto"; // Paul 2026-11-22: movie night plays the epic orchestral piece of Room 01
import { createRoomSound } from "../cafe/sound.js?v=auto"; // Room 04's records; track 1 is "午後弄堂"
import { createBayRecord, BAY_BARS } from "./sound.js?v=auto"; // Room 03's own piece "灣區午後", played first

export const ROOM_TITLE = "Room 03｜Bay Area Kitchen";
const ROOM = Object.freeze({ width: 6, depth: 4.8, height: 2.7 });
// Paul 2026-11-17: the brick-red mug moves from the counter (x -0.30, z -1.752, base 0.954) to the credenza, right of the record player
// (x 2.70, z 0.84, standing on the 0.815 top). Both the mug and its morning steam use this one shift.
const RED_MUG_SHIFT = Object.freeze([3.0, -0.139, 2.592]);
// The room's door (Paul 2026-10-30: every room has one; beside the cable-car painting on the right wall). A doorway is cut through the 120 mm wall
// (face x 2.94), the wall panel and the skirting; leaf 0.85 x 2.04 m, hinged on the painting side, so the leaf opens into the room.
const ROOM_DOOR = Object.freeze({ wallFaceX: 2.94, wallBackX: 3.06, zMid: -1.58, halfHole: 0.443, holeHeight: 2.07, casing: 0.06, leafWidth: 0.85, leafHeight: 2.04 });
// Shared with Room 01 and Room 02: "Christ is the Head of this House", 5:2, about 76 × 30.4 cm.
// The right pier of the entry front wall is the empty stretch beside the doorway. Its box is
// centered at (2.05, 1.35, 2.4) with size (2.1, 2.7, 0.12), so the room-facing face is z = 2.34
// and the pier covers x = 1.00 to 3.10. x = 1.72 keeps the board on that pier (x = 1.34 to 2.10),
// 34 cm clear of the doorway band at x = 1. The side-wall wok door is gone; the board stays on this
// pier. #578 measured this spot; the board stays here after the fig came out.
const HOUSE_PLAQUE = Object.freeze({
  width: 0.76,
  height: 0.304,
  position: Object.freeze([1.72, 1.64, 2.325]),
});
const ROUNDING_SEGMENTS = 2;
const COLORS = Object.freeze({
  cream: 0xf0e8da, oak: 0xbc8a53, beam: 0xe2d9c8, ceiling: 0xe1cfaf, olive: 0x71805b,
  stone: 0xc9c0ae, black: 0x282a27, steel: 0x8e918b, jute: 0xc4ae80,
  terracotta: 0xad452b, opal: 0xf2d7a0,
});

function makeTexture(paint, width = 256, height = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  paint(canvas.getContext("2d"), width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

function makeFineNoise(seed, alpha = 0.035) {
  let state = seed;
  const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
  return makeTexture((ctx, w, h) => {
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 1500; i++) {
      const value = random() > 0.5 ? 70 : 125;
      ctx.fillStyle = `rgba(${value},${value},${value},${alpha * random()})`;
      ctx.fillRect(random() * w, random() * h, 1 + random() * 2, 1 + random() * 2);
    }
  });
}

// Paul 2026-11-22 (a patchwork azulejo / Moroccan backsplash from a reference photo): eight by four glazed square tiles, each a different pattern in cobalt, sky blue, terracotta, ochre and sage on cream,
// 12.5 cm a side with a thin grout line. Drawn once on a canvas (no picture file).
function makeAzulejoTexture() {
  return makeTexture((ctx, w, h) => {
    const T = 128, cream = "#f1e6d0", pale = "#e3ebf0", cobalt = "#2f4f93", sky = "#7f9fd0", terra = "#c4704f", ochre = "#d9a441", sage = "#8aa07a";
    ctx.fillStyle = "#d9d1c0"; ctx.fillRect(0, 0, w, h); // grout
    const poly = (cx, cy, r, n, rot, fill) => { ctx.beginPath(); for (let k = 0; k < n; k++) { const a = rot + k / n * Math.PI * 2; const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); };
    const dot = (cx, cy, r, fill) => { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); };
    for (let j = 0; j < 4; j++) for (let i = 0; i < 8; i++) {
      const x0 = i * T + 3, y0 = j * T + 3, S = T - 6, cx = i * T + T / 2, cy = j * T + T / 2, kind = (i * 3 + j * 5) % 6;
      ctx.fillStyle = (i + j) % 2 ? pale : cream; ctx.fillRect(x0, y0, S, S);
      if (kind === 0) { poly(cx, cy, 52, 16, 0, cobalt); poly(cx, cy, 34, 8, 0.2, cream); dot(cx, cy, 14, ochre); }
      else if (kind === 1) { for (let k = 0; k < 4; k++) dot(cx + Math.cos(k * Math.PI / 2 + Math.PI / 4) * 24, cy + Math.sin(k * Math.PI / 2 + Math.PI / 4) * 24, 24, terra); dot(cx, cy, 11, cobalt); }
      else if (kind === 2) { poly(cx, cy, 54, 4, Math.PI / 4, cobalt); poly(cx, cy, 38, 4, Math.PI / 4, cream); poly(cx, cy, 22, 4, Math.PI / 4, terra); }
      else if (kind === 3) { for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; dot(cx + Math.cos(a) * 28, cy + Math.sin(a) * 28, 13, k % 2 ? ochre : sky); } dot(cx, cy, 13, terra); }
      else if (kind === 4) { ctx.fillStyle = terra; ctx.fillRect(x0, y0, S, S); poly(cx, cy, 44, 8, 0, cream); poly(cx, cy, 26, 4, Math.PI / 4, cobalt); }
      else { dot(cx, cy, 54, cobalt); dot(cx, cy, 42, cream); dot(cx, cy, 30, sage); dot(cx, cy, 14, cobalt); }
      ctx.strokeStyle = "rgba(60,50,40,.18)"; ctx.lineWidth = 2; ctx.strokeRect(x0 + 1, y0 + 1, S - 2, S - 2); // the glaze edge
    }
  }, 1024, 512);
}

function makeCabinetTexture() {
  return makeTexture((ctx, w, h) => {
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
    for (let y = 4; y < h; y += 16) {
      ctx.strokeStyle = y % 3 ? "rgba(61,70,48,.035)" : "rgba(255,255,255,.08)";
      ctx.lineWidth = y % 2 ? 0.7 : 1.1;
      ctx.beginPath(); ctx.moveTo(0, y);
      ctx.bezierCurveTo(w * 0.28, y - 1.2, w * 0.66, y + 1.1, w, y - 0.5); ctx.stroke();
    }
    for (let i = 0; i < 130; i++) {
      const y = (i * 43) % h;
      ctx.fillStyle = i % 2 ? "rgba(65,70,49,.035)" : "rgba(255,255,255,.045)";
      ctx.fillRect((i * 71) % w, y, 8 + (i % 19), 1);
    }
  });
}

function makePlasterTexture() {
  const texture = makeMottleTexture(19, 0.022);
  const { width, height } = texture.image;
  const ctx = texture.image.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#f6eee3");
  gradient.addColorStop(0.48, "#fffaf0");
  gradient.addColorStop(1, "#f2e6d5");
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = "source-over";
  texture.needsUpdate = true;
  return texture;
}

function makeBrushedMetalTexture() {
  return makeTexture((ctx, w, h) => {
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
    const sheen = ctx.createLinearGradient(0, 0, 0, h);
    sheen.addColorStop(0, "rgba(55,61,63,.07)");
    sheen.addColorStop(0.28, "rgba(255,255,255,.12)");
    sheen.addColorStop(0.62, "rgba(70,75,73,.045)");
    sheen.addColorStop(1, "rgba(255,255,255,.08)");
    ctx.fillStyle = sheen; ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 3) {
      ctx.strokeStyle = y % 2 ? "rgba(72,77,76,.035)" : "rgba(255,255,255,.12)";
      ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
  }, 512, 128);
}

function makeMottleTexture(seed, strength = 0.06) {
  let state = seed;
  const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
  return makeTexture((ctx, w, h) => {
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 34; i++) {
      const x = random() * w, y = random() * h, radius = 18 + random() * 62;
      const shade = random() > 0.52 ? "60,48,35" : "255,255,255";
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(${shade},${strength * (0.5 + random() * 0.5)})`);
      gradient.addColorStop(1, `rgba(${shade},0)`);
      ctx.fillStyle = gradient; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    for (let i = 0; i < 900; i++) {
      const shade = random() > 0.5 ? 80 : 150;
      ctx.fillStyle = `rgba(${shade},${shade},${shade},${strength * 0.55 * random()})`;
      ctx.fillRect(random() * w, random() * h, 1, 1);
    }
  });
}

function applyFloorWindowLift(texture) {
  const { width, height } = texture.image;
  const ctx = texture.image.getContext("2d");
  // Baked, broad window-side lift: a soft matte gradient, not a reflection or extra light.
  const direction = ctx.createLinearGradient(0, height * 0.18, width, height * 0.52);
  direction.addColorStop(0, "#fff4dd");
  direction.addColorStop(0.18, "#fffaf0");
  direction.addColorStop(0.42, "#f8edd8");
  direction.addColorStop(0.72, "#e9dac0");
  direction.addColorStop(1, "#eaddc5");
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = direction;
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = "source-over";
  texture.needsUpdate = true;
  return texture;
}


function makeFloorTexture(seed, strength = 0.23) {
  // Same base generator and window lift, with a stronger but bounded mottle.
  const texture = makeMottleTexture(seed, strength);
  const ctx = texture.image.getContext("2d"), w = texture.image.width, h = texture.image.height;
  const detail = makeMottleTexture(73, 0.085);
  ctx.globalAlpha = .4; ctx.globalCompositeOperation = "multiply";
  // An incommensurate, cropped second scale avoids a repeated regular tile.
  ctx.drawImage(detail.image, 29, 41, 185, 193, 0, 0, w, h);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over"; detail.dispose();
  applyFloorWindowLift(texture);
  // Keep the old mean RGB, so added mottle does not simply darken the room.
  const reference = applyFloorWindowLift(makeMottleTexture(seed, .15));
  const before = reference.image.getContext("2d").getImageData(0, 0, w, h).data;
  const image = ctx.getImageData(0, 0, w, h), count = w * h;
  const target = [0, 0, 0];
  for (let i = 0; i < before.length; i += 4) for (let c = 0; c < 3; c++) target[c] += before[i + c] / count;
  for (let pass = 0; pass < 3; pass++) {
    const mean = [0, 0, 0];
    for (let i = 0; i < image.data.length; i += 4) for (let c = 0; c < 3; c++) mean[c] += image.data[i + c] / count;
    for (let i = 0; i < image.data.length; i += 4) for (let c = 0; c < 3; c++) image.data[i + c] = Math.max(0, Math.min(255, Math.round(image.data[i + c] + target[c] - mean[c])));
  }
  ctx.putImageData(image, 0, 0); reference.dispose(); texture.needsUpdate = true;
  return texture;
}

function makeTerrazzoTexture() {
  return makeTexture((ctx, w, h) => {
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
    let state = 231;
    const rand = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
    const chips = ["rgba(117,105,87,.15)", "rgba(161,145,119,.13)", "rgba(104,119,111,.10)", "rgba(255,255,255,.20)"];
    for (let i = 0; i < 170; i++) {
      const x = rand() * w, y = rand() * h, size = 1 + rand() * 2.4;
      ctx.fillStyle = chips[Math.floor(rand() * chips.length)];
      ctx.beginPath(); ctx.ellipse(x, y, size * (0.7 + rand() * 0.65), size * (0.55 + rand() * 0.55), rand() * Math.PI, 0, Math.PI * 2); ctx.fill();
    }
  });
}

function makeCorkFloorTexture() {
  return makeTexture((ctx, w, h) => {
    ctx.fillStyle = "#f5e4c7"; ctx.fillRect(0, 0, w, h);
    let state = 119;
    const rand = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
    for (let i = 0; i < 1900; i++) {
      const x = rand() * w, y = rand() * h, r = 0.35 + rand() * 1.1;
      ctx.fillStyle = rand() > .52 ? "rgba(123,91,53,.13)" : "rgba(255,255,255,.22)";
      ctx.beginPath(); ctx.ellipse(x, y, r * (0.7 + rand()), r, rand() * Math.PI, 0, Math.PI * 2); ctx.fill();
    }
  });
}

function makeWoodTexture(planks = false, alongDepth = false) {
  return makeTexture((ctx, w, h) => {
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
    if (planks) {
      if (alongDepth) {
        for (let x = 0; x < w; x += 42) {
          ctx.fillStyle = "rgba(70,48,30,.12)"; ctx.fillRect(x, 0, 1.4, h);
          ctx.fillStyle = "rgba(255,255,255,.20)"; ctx.fillRect(x + 2, 0, 1, h);
          for (const y of [52, 174]) {
            ctx.fillStyle = "rgba(80,58,35,.065)"; ctx.fillRect(x + 2, y, 40, 1);
          }
        }
      } else {
        for (let y = 0; y < h; y += 42) {
          ctx.fillStyle = "rgba(70,48,30,.10)"; ctx.fillRect(0, y, w, 1.4);
          ctx.fillStyle = "rgba(255,255,255,.16)"; ctx.fillRect(0, y + 2, w, 1);
          for (const x of [52, 174]) {
            ctx.fillStyle = "rgba(80,58,35,.07)"; ctx.fillRect(x, y + 2, 1, 40);
          }
        }
      }
    }
    for (let i = 0; i < 76; i++) {
      const across = (i * 37) % (alongDepth ? w : h) + (i % 3);
      const shade = i % 2 ? "rgba(104,72,40,.13)" : "rgba(255,255,255,.15)";
      ctx.strokeStyle = shade; ctx.lineWidth = 0.6 + (i % 3) * 0.3;
      ctx.beginPath();
      if (alongDepth) {
        ctx.moveTo(across, 0);
        ctx.bezierCurveTo(across - 2, h * 0.34, across + 2, h * 0.67, across - 1, h); ctx.stroke();
      } else {
        ctx.moveTo(0, across);
        ctx.bezierCurveTo(w * 0.34, across - 2, w * 0.67, across + 2, w, across - 1); ctx.stroke();
      }
    }
  });
}

function makeSunPatchTexture() {
  return makeTexture((ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const glow = ctx.createRadialGradient(w * 0.48, h * 0.5, h * 0.05, w * 0.48, h * 0.5, w * 0.52);
    glow.addColorStop(0, "rgba(255,226,174,.72)");
    glow.addColorStop(0.58, "rgba(255,222,164,.38)");
    glow.addColorStop(1, "rgba(255,220,160,0)");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
  });
}

function makeLoungeShadowTexture() {
  return makeTexture((ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const shade = ctx.createRadialGradient(w / 2, h / 2, w * 0.06, w / 2, h / 2, w * 0.47);
    shade.addColorStop(0, "rgba(38,28,18,.36)");
    shade.addColorStop(0.55, "rgba(38,28,18,.16)");
    shade.addColorStop(1, "rgba(38,28,18,0)");
    ctx.fillStyle = shade; ctx.fillRect(0, 0, w, h);
  }, 128, 128);
}

function makeSkyTexture(night, day = false) {
  return makeTexture((ctx, w, h) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    if (day) {
      // Bay Area daylight: a pale, slightly cool marine-layer sky instead of the warm golden one.
      gradient.addColorStop(0, "#d9e2e8");
      gradient.addColorStop(0.62, "#e8ebe8");
      gradient.addColorStop(1, "#cdd1cc");
    } else if (night) {
      gradient.addColorStop(0, "#344252");
      gradient.addColorStop(0.52, "#42566a");
      gradient.addColorStop(1, "#5b5f5c");
    } else {
      gradient.addColorStop(0, "#d4c2a7");
      gradient.addColorStop(0.62, "#e5d2b1");
      gradient.addColorStop(1, "#c1a887");
    }
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);
  }, 8, 256);
}

function makeRugTexture(style = "jute") {
  if (style === "blue-stripe") {
    // Reuse Room 01's blue-and-cream woven rug artwork for the dining rug.
    const texture = new THREE.TextureLoader().load(new URL("../tex/rug-stripe-v1.webp", import.meta.url).href);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return texture;
  }
  const texture = makeTexture((ctx, w, h) => {
    const bases = { jute: "#e7dcc2", stripe: "#d9d1c3", geometric: "#e4d9c8" };
    ctx.fillStyle = bases[style] || bases.jute; ctx.fillRect(0, 0, w, h);
    let state = 37;
    const rand = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
    if (style === "jute") {
      // Quiet Bay Area flatweave: a restrained broken border and fine, irregular fibres.
      ctx.fillStyle = "rgba(107,120,92,.16)"; ctx.fillRect(14, 14, w - 28, 4);
      ctx.fillStyle = "rgba(161,105,75,.15)"; ctx.fillRect(14, h - 18, w - 28, 4);
      ctx.fillStyle = "rgba(255,255,255,.30)"; ctx.fillRect(14, 22, w - 28, 2);
      for (const x of [18, w - 27]) {
        ctx.fillStyle = "rgba(107,120,92,.12)"; ctx.fillRect(x, 34, 3, h - 68);
        ctx.fillStyle = "rgba(255,255,255,.24)"; ctx.fillRect(x + 4, 34, 1, h - 68);
      }
      for (let i = 0; i < 9; i++) {
        const x = 36 + i * ((w - 72) / 8), y = 42 + (i % 2) * 3;
        ctx.strokeStyle = i % 3 === 1 ? "rgba(161,105,75,.19)" : "rgba(107,120,92,.16)";
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 5, y + 5); ctx.lineTo(x, y + 10); ctx.lineTo(x - 5, y + 5); ctx.closePath(); ctx.stroke();
      }
    } else if (style === "stripe") {
      for (let y = 22; y < h; y += 58) {
        ctx.fillStyle = "rgba(100,111,93,.14)"; ctx.fillRect(0, y, w, 12);
        ctx.fillStyle = "rgba(255,255,255,.16)"; ctx.fillRect(0, y + 13, w, 2);
      }
    } else if (style === "geometric") {
      ctx.fillStyle = "rgba(157,111,77,.12)";
      for (let y = 28; y < h; y += 76) for (let x = 28 + ((Math.floor(y / 76) % 2) * 38); x < w; x += 76) {
        ctx.beginPath(); ctx.moveTo(x, y - 12); ctx.lineTo(x + 12, y); ctx.lineTo(x, y + 12); ctx.lineTo(x - 12, y); ctx.closePath(); ctx.fill();
      }
    }
    ctx.save(); ctx.beginPath(); ctx.rect(5, 5, w - 10, h - 10); ctx.clip();
    // Fine broken fibres avoid a coarse checker pattern at the room's normal viewing distance.
    for (let i = 0; i < 125; i++) {
      const x = rand() * w, y = rand() * h, length = 9 + rand() * 42;
      ctx.strokeStyle = rand() > 0.48 ? "rgba(117,89,51,.085)" : "rgba(255,255,255,.15)";
      ctx.lineWidth = 0.9 + rand() * 1.2;
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.bezierCurveTo(x + length * .28, y - 1, x + length * .7, y + 1.5, x + length, y + (rand() - .5) * 3); ctx.stroke();
    }
    for (let i = 0; i < 32; i++) {
      const x = rand() * w, y = rand() * h;
      ctx.strokeStyle = rand() > .5 ? "rgba(133,101,59,.045)" : "rgba(255,255,255,.08)";
      ctx.lineWidth = .8 + rand() * .7;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (rand() - .5) * 3, y + 3 + rand() * 11); ctx.stroke();
    }
    for (let i = 0; i < 160; i++) {
      const x = rand() * w, y = rand() * h;
      ctx.strokeStyle = rand() > .5 ? "rgba(121,91,54,.07)" : "rgba(255,255,255,.12)";
      ctx.lineWidth = .8;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 2 + rand() * 4, y + (rand() - .5) * 3); ctx.stroke();
    }
    ctx.restore();
    // Keep the pale woven binding within the original UV bounds.
    ctx.strokeStyle = "rgba(255,250,232,.96)"; ctx.lineWidth = 2; ctx.strokeRect(1, 1, w - 2, h - 2);
    ctx.strokeStyle = "rgba(247,238,213,.85)"; ctx.lineWidth = 1; ctx.strokeRect(4, 4, w - 8, h - 8);
  });
  return texture;
}

function makeSeatTexture() {
  return makeTexture((ctx, w, h) => {
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      const y = i * 7;
      ctx.strokeStyle = i % 2 ? "rgba(115,94,64,.12)" : "rgba(255,255,255,.2)";
      ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y + 4); ctx.stroke();
    }
  });
}

function makeBoucleTexture() {
  return makeTexture((ctx, w, h) => {
    ctx.fillStyle = "#faf8f3"; ctx.fillRect(0, 0, w, h);
    let state = 91;
    const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
    for (let i = 0; i < 2400; i++) {
      const x = random() * w, y = random() * h;
      ctx.strokeStyle = random() > 0.48 ? "rgba(78,66,50,.12)" : "rgba(255,255,255,.58)";
      ctx.lineWidth = 0.6 + random() * 0.8;
      ctx.beginPath(); ctx.arc(x, y, 0.7 + random() * 1.3, random() * Math.PI, Math.PI * (1.25 + random())); ctx.stroke();
    }
  });
}

function makeMaterials() {
  const std = (color, roughness = 0.8, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
  const boucle = makeBoucleTexture();
  const ceiling = std(COLORS.ceiling, 0.86, { map: makeWoodTexture(true, true), emissive: 0x9b6938, emissiveIntensity: 0.34 });
  // The beam over the glass must match the ceiling exactly in every mood.
  const windowBeam = ceiling.clone();
  const pillowWeave = boucle.clone();
  pillowWeave.repeat.set(1.7, 1.35);
  const throwWeave = boucle.clone();
  throwWeave.repeat.set(1.35, 2.1);
  return {
    floor: std(0xcdbb9e, 0.88, { map: makeTerrazzoTexture(), metalness: 0.01 }),
    wall: std(0xd0deea, 0.94, { map: makePlasterTexture() }),
    wokWall: std(0x907258, 0.9, { map: makeFineNoise(47, 0.025) }),
    // Paul 2026-11-21 (is the stainless chimney still what a US kitchen has? 2026 hoods are sculptural, plastered or tiled, in warm putty/clay neutrals, with a slim brass detail): a limewash plaster hood.
    wokPlaster: std(0xe9ddc6, 0.93, { map: makeFineNoise(31, 0.035) }),
    wokSteel: std(0xbfc3c0, 0.34, { metalness: 0.22, emissive: 0x2e1e0e, emissiveIntensity: 0.45 }),
    wokIron: std(0x343733, 0.42, { metalness: 0.08, emissive: 0x16120e, emissiveIntensity: 0.18 }),
    ovenGlass: std(0x15191a, 0.2, { metalness: 0.18 }),
    ovenMitt: new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.94, side: THREE.DoubleSide }),
    ceiling,
    windowBeam,
    oak: std(COLORS.oak, 0.76, { map: makeWoodTexture(false) }),
    beam: std(COLORS.beam, 0.79, { map: makeWoodTexture(false) }),
    olive: std(COLORS.olive, 0.88, { map: makeCabinetTexture() }),
    // Paul 2026-11-21 (colour-blocking, more vibrant): the oven-side base cabinets turn a dusty terracotta clay, the warm complement of the slate-blue credenza opposite.
    clay: std(0xb9735a, 0.88, { map: makeCabinetTexture() }),
    stone: std(COLORS.stone, 0.45, { map: makeFineNoise(23, 0.025) }),
    black: std(COLORS.black, 0.44), steel: std(COLORS.steel, 0.38), brass: std(0xb58a50, 0.34, { metalness: 0.48 }),
    hoodSteel: std(0xc4c9ca, 0.5, { map: makeBrushedMetalTexture(), metalness: 0.2 }),
    jute: std(COLORS.jute, 0.96, { map: makeRugTexture("blue-stripe") }), seat: std(0xb8a17e, 0.98, { map: makeSeatTexture() }),
    loungeFabric: std(0xe4d5bd, 0.98, { map: boucle }),
    // Deeper sage and a warmer camel, only on this chair's loose cushions, so the pillow reads as cotton and the throw as linen.
    loungePillow: std(0x7f946c, 0.94, { map: pillowWeave, side: THREE.DoubleSide }),
    loungeThrow: std(0xb18458, 1, { map: throwWeave, side: THREE.DoubleSide }),
    red: std(COLORS.terracotta, 0.34), glass: new THREE.MeshPhysicalMaterial({ color: 0xb9d3d1, roughness: 0.12, metalness: 0.06, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false }),
    // Neutral brushed stainless: lower metalness keeps the basin grey instead
    // of reflecting the adjacent olive cabinetry as a green floor.
    sinkSteel: std(0x969d9e, 0.46, { metalness: 0.30 }),
    faucetSteel: std(0xaab1b2, 0.29, { metalness: 0.45 }),
    waterClear: new THREE.MeshStandardMaterial({ color: 0xc9e2e4, roughness: 0.12, transparent: true, opacity: 0.30, depthWrite: false }),
    // Paul 2026-11-17: close up the big water bottles read as empty. The water is now a visible pale blue-green body with a bright surface, under the clear shell.
    bottleWater: new THREE.MeshStandardMaterial({ color: 0x86c3cf, roughness: 0.06, transparent: true, opacity: 0.62, depthWrite: false }),
    bottleWaterTop: new THREE.MeshStandardMaterial({ color: 0xe4f6f7, roughness: 0.05, transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide }),
    pebble: std(0x8f8a7e, 0.9),
    waterBottleGlass: new THREE.MeshPhysicalMaterial({ color: 0xc6d8d5, roughness: 0.19, metalness: 0, transparent: true, opacity: 0.42, side: THREE.DoubleSide, depthWrite: false }),
    // Daylight table pitcher and tumblers (Paul 2026-11-11): real clear glass, not a milky shell. Transmission was tried
    // and dropped: three.js renders the whole room into a refraction buffer, which doubled the opening draw calls
    // (83 -> 156). Instead: low opacity, a tight clearcoat, the baked room env map (waterSetGlass in reflectiveBase,
    // assigned in makeMaterials so it is on the material before the first frame), and vertex colours that darken only
    // the rim and the foot so the outline still reads.
    waterSetGlass: new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0, roughness: 0.04, transparent: true, opacity: 0.22, depthWrite: false,
      side: THREE.DoubleSide, clearcoat: 1, clearcoatRoughness: 0.04, vertexColors: true,
    }),
    waterLabel: std(0x78959a, 0.78),
    opal: new THREE.MeshStandardMaterial({ color: COLORS.opal, roughness: 0.22, emissive: 0xffdfa4, emissiveIntensity: 0.24 }),
    porcelain: std(0xe1ddd2, 0.72), mugGlaze: std(0xb0533c, 0.30), mugCoffee: std(0x1b120c, 0.3), coffee: std(0x47372b, 0.78), coffeeBeanLight: std(0x805536, 0.8),
    oilGlass: std(0x526044, 0.4, { metalness: 0.04 }), leafGreen: std(0x405b3d, 0.78, { side: THREE.DoubleSide }), leafGreenLight: std(0x778b53, 0.8, { side: THREE.DoubleSide }), soil: std(0x62513d, 0.98),
    warmGlow: new THREE.MeshBasicMaterial({ color: 0xffc477, transparent: true, opacity: 0.94, side: THREE.DoubleSide, depthWrite: false }),
    sunlight: new THREE.MeshBasicMaterial({ color: 0xffdda0, map: makeSunPatchTexture(), transparent: true, opacity: 0.24, depthWrite: false, side: THREE.DoubleSide }),
    wokGlow: new THREE.MeshBasicMaterial({ color: 0xffd39a, transparent: true, opacity: 0.98, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }),
    reveal: new THREE.MeshBasicMaterial({ color: 0xffc477, transparent: true, opacity: 0.98, depthWrite: false, side: THREE.DoubleSide }),
  };
}

const EDGE_RADIUS_BY_CATEGORY = Object.freeze({
  structure: 0.015, trim: 0.012, kitchen: 0.018,
  counter: 0.025, backsplash: 0.01, hardware: 0.006, hood: 0.018,
  "side-kitchen": 0.012, "wok-base-cabinet": 0.018, appliances: 0.008,
  "light-fixtures": 0.006, "dining-table": 0.014, "dining-chairs": 0.008,
});

function roundedBoxGeometry(size, requestedRadius, bevelSegments = ROUNDING_SEGMENTS) {
  const [width, height, depth] = size;
  const minimum = Math.min(width, height, depth);
  const radius = Math.min(requestedRadius, minimum * 0.28);
  if (radius < 0.0015) return new THREE.BoxGeometry(...size);

  const innerWidth = width - radius * 2;
  const innerHeight = height - radius * 2;
  const innerDepth = depth - radius * 2;
  const corner = Math.min(radius * 0.45, innerWidth * 0.22, innerHeight * 0.22);
  const left = -innerWidth / 2, right = innerWidth / 2;
  const bottom = -innerHeight / 2, top = innerHeight / 2;
  const shape = new THREE.Shape();
  shape.moveTo(left + corner, bottom);
  shape.lineTo(right - corner, bottom); shape.quadraticCurveTo(right, bottom, right, bottom + corner);
  shape.lineTo(right, top - corner); shape.quadraticCurveTo(right, top, right - corner, top);
  shape.lineTo(left + corner, top); shape.quadraticCurveTo(left, top, left, top - corner);
  shape.lineTo(left, bottom + corner); shape.quadraticCurveTo(left, bottom, left + corner, bottom);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: innerDepth, bevelEnabled: true, bevelSegments,
    bevelThickness: radius, bevelSize: radius, curveSegments: bevelSegments,
  });
  geometry.translate(0, 0, -innerDepth / 2);
  geometry.computeVertexNormals();
  return mergeVertices(geometry);
}

function addGeometryToBucket(buckets, category, material, geometry, position, rotation = [0, 0, 0]) {
  const key = `${category}:${material.uuid}`;
  if (!buckets.has(key)) buckets.set(key, { category, material, geometries: [] });
  const matrix = new THREE.Matrix4().compose(
    new THREE.Vector3(...position),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
    new THREE.Vector3(1, 1, 1),
  );
  geometry.applyMatrix4(matrix);
  buckets.get(key).geometries.push(geometry);
}

function addBox(buckets, category, material, size, position, rotationY = 0) {
  const radius = EDGE_RADIUS_BY_CATEGORY[category] || 0;
  addGeometryToBucket(buckets, category, material, roundedBoxGeometry(size, radius), position, [0, rotationY, 0]);
}

function addShape(scene, geometry, material, category, position, rotation = null) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = category;
  mesh.position.set(...position);
  if (rotation) mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.category = category;
  scene.add(mesh);
  return mesh;
}

// Oak casing on the room face, a thin lining through the 120 mm wall and a threshold; they join the shared trim bucket, so they cost no draw call.
const DOOR_CASE_T = 0.045, DOOR_LINING = 0.012, DOOR_LEAF_BOTTOM = 0.014;
function doorFrameBoxes() {
  const { wallFaceX: WF, wallBackX: WB, zMid, halfHole: H, holeHeight: HH, casing: C } = ROOM_DOOR;
  const wallDepth = WB - WF, zOuterLow = zMid - H - C, zOuterHigh = zMid + H + C, strip = C + DOOR_LINING;
  return [
    [[DOOR_CASE_T, HH + C, strip], [WF - DOOR_CASE_T / 2, (HH + C) / 2, zOuterLow + strip / 2]],
    [[DOOR_CASE_T, HH + C, strip], [WF - DOOR_CASE_T / 2, (HH + C) / 2, zOuterHigh - strip / 2]],
    [[DOOR_CASE_T, strip, zOuterHigh - zOuterLow], [WF - DOOR_CASE_T / 2, HH - DOOR_LINING + strip / 2, zMid]],
    [[wallDepth, HH, DOOR_LINING], [WF + wallDepth / 2, HH / 2, zMid - H + DOOR_LINING / 2]],
    [[wallDepth, HH, DOOR_LINING], [WF + wallDepth / 2, HH / 2, zMid + H - DOOR_LINING / 2]],
    [[wallDepth, DOOR_LINING, 2 * H], [WF + wallDepth / 2, HH - DOOR_LINING / 2, zMid]],
    [[wallDepth, DOOR_LEAF_BOTTOM - 0.002, 2 * H - 2 * DOOR_LINING], [WF + wallDepth / 2, (DOOR_LEAF_BOTTOM - 0.002) / 2, zMid]],
  ];
}
function buildArchitecture(b, m, scene, onYardLoad) {
  const hx = ROOM.width / 2, hz = ROOM.depth / 2, h = ROOM.height;
  addBox(b, "shell", m.floor, [ROOM.width, 0.14, ROOM.depth], [0, -0.07, 0]);
  addBox(b, "shell", m.wall, [ROOM.width, h, 0.12], [0, h / 2, -hz]);
  // Right wall with the room door cut through it: a full-height piece each side of the doorway and a lintel over it.
  {
    const zLow = ROOM_DOOR.zMid - ROOM_DOOR.halfHole, zHigh = ROOM_DOOR.zMid + ROOM_DOOR.halfHole;
    addBox(b, "shell", m.wall, [0.12, h, zLow + hz], [hx, h / 2, (zLow - hz) / 2]);
    addBox(b, "shell", m.wall, [0.12, h, hz - zHigh], [hx, h / 2, (zHigh + hz) / 2]);
    addBox(b, "shell", m.wall, [0.12, h - ROOM_DOOR.holeHeight, zHigh - zLow], [hx, (h + ROOM_DOOR.holeHeight) / 2, ROOM_DOOR.zMid]);
  }
  addBox(b, "shell", m.ceiling, [ROOM.width, 0.16, ROOM.depth], [0, 2.69, 0]);

  // Three exposed timber beams run from the glass wall into the kitchen; keep all three in the ceiling's honey wood finish.
  addBox(b, "structure", m.windowBeam, [0.16, 0.18, 4.72], [-2.05, 2.57, 0]);
  for (const x of [0, 2.05]) addBox(b, "structure", m.windowBeam, [0.16, 0.18, 4.72], [x, 2.57, 0]);
  addBox(b, "trim", m.oak, [ROOM.width, 0.09, 0.08], [0, 0.1, -2.31]);
  {
    // Skirting on the right wall stops at the door casing on both sides.
    const zLow = ROOM_DOOR.zMid - ROOM_DOOR.halfHole - ROOM_DOOR.casing, zHigh = ROOM_DOOR.zMid + ROOM_DOOR.halfHole + ROOM_DOOR.casing;
    addBox(b, "trim", m.oak, [0.08, 0.09, zLow + hz], [2.91, 0.1, (zLow - hz) / 2]);
    addBox(b, "trim", m.oak, [0.08, 0.09, hz - zHigh], [2.91, 0.1, (zHigh + hz) / 2]);
    for (const [size, position] of doorFrameBoxes()) addBox(b, "trim", m.oak, size, position);
  }
  // A simple fixed, slightly ajar multi-panel glass slider on the left wall.
  const wx = -2.91;
  addBox(b, "window-frames", m.black, [0.07, 2.28, 0.07], [wx, 1.22, -2.18]);
  addBox(b, "window-frames", m.black, [0.07, 2.28, 0.07], [wx, 1.22, 2.18]);
  addBox(b, "window-frames", m.black, [0.07, 0.07, 4.36], [wx, 2.36, 0]);
  addBox(b, "window-frames", m.black, [0.07, 0.06, 4.36], [wx, 0.09, 0]);
  addBox(b, "window-frames", m.black, [0.07, 2.23, 0.055], [wx, 1.22, 0]);
  const outsideTexture = new THREE.TextureLoader().load(new URL("./courtyard-v1.webp", import.meta.url).href, onYardLoad);
  outsideTexture.colorSpace = THREE.SRGBColorSpace;
  outsideTexture.anisotropy = 4;
  const outsideMat = new THREE.MeshBasicMaterial({ map: outsideTexture, color: 0xffffff, side: THREE.DoubleSide });
  const yard = new THREE.Mesh(new THREE.PlaneGeometry(4.25, 2.23), outsideMat);
  yard.name = "courtyard-background"; yard.position.set(-3.16, 1.22, 0); yard.rotation.y = Math.PI / 2;
  yard.userData.category = "yard"; b.set("yard", { category: "yard", material: outsideMat, geometries: [yard.geometry], existing: yard });
  // Two glass panels; a small z-offset leaves a believable static slider gap.
  const doorGlass = new THREE.Mesh(new THREE.PlaneGeometry(2.02, 2.17), m.glass);
  doorGlass.name = "glass-slider-panel"; doorGlass.position.set(-2.85, 1.22, -1.03); doorGlass.rotation.y = Math.PI / 2;
  doorGlass.userData.category = "window-frames"; doorGlass.receiveShadow = false; sceneAddToBucket(b, doorGlass, "glass-panels");
  const secondGlass = new THREE.Mesh(new THREE.PlaneGeometry(2.02, 2.17), m.glass);
  secondGlass.name = "glass-slider-panel-ajar"; secondGlass.position.set(-2.83, 1.22, 1.12); secondGlass.rotation.y = Math.PI / 2;
  secondGlass.userData.category = "window-frames"; secondGlass.receiveShadow = false; sceneAddToBucket(b, secondGlass, "glass-panels");
  for (const z of [-2.05, 0.06, 2.13]) addBox(b, "window-frames", m.black, [0.09, 2.24, 0.045], [-2.81, 1.22, z]);
  addBox(b, "window-frames", m.black, [0.09, 0.05, 4.2], [-2.81, 2.34, 0]);
  addBox(b, "window-frames", m.black, [0.09, 0.045, 4.2], [-2.81, 0.11, 0]);
}

function sceneAddToBucket(b, mesh, name) {
  const key = `${name}:${mesh.material.uuid}`;
  if (!b.has(key)) b.set(key, { category: mesh.userData.category, material: mesh.material, geometries: [], meshes: [] });
  b.get(key).meshes.push(mesh);
}

let sinkStationInfoRef = null;
function buildKitchen(b, m) {
  // Straight olive cabinet run, kept low and uncluttered.
  // Leave an opening above the recessed basin: the old solid cabinet top
  // crossed the sink cavity and appeared as a green basin floor.
  addBox(b, "kitchen", m.olive, [4.24, 0.65, 0.62], [0, 0.435, -2.04]);
  addBox(b, "kitchen", m.olive, [0.53, 0.10, 0.62], [-1.855, 0.81, -2.04]);
  addBox(b, "kitchen", m.olive, [3.03, 0.10, 0.62], [0.605, 0.81, -2.04]);
  addBox(b, "kitchen", m.olive, [0.68, 0.10, 0.12], [-1.25, 0.81, -2.29]);
  addBox(b, "kitchen", m.olive, [0.68, 0.10, 0.08], [-1.25, 0.81, -1.77]);
  addBox(b, "kitchen", m.olive, [4.0, 0.11, 0.54], [0, 0.055, -2.04]);
  for (const x of [-1.55, -0.52, 0.52, 1.55]) {
    addBox(b, "kitchen", m.olive, [0.99, 0.72, 0.035], [x, 0.47, -1.715]);
    addBox(b, "hardware", m.black, [0.27, 0.018, 0.025], [x, 0.71, -1.69]);
  }
  // A true countertop opening with a recessed stainless basin. One holed slab
  // avoids visible seams across the stone front while staying in its old bucket.
  const sinkCenter = { x: -1.25, z: -2.02 };
  const sinkOpening = { width: 0.68, depth: 0.42 };
  const counterTop = 0.955, counterBottom = 0.865;
  const counterXMin = -2.23, counterXMax = 2.23;
  const counterZMin = -2.39, counterZMax = -1.65;
  const sinkXMin = sinkCenter.x - sinkOpening.width / 2, sinkXMax = sinkCenter.x + sinkOpening.width / 2;
  const sinkZMin = sinkCenter.z - sinkOpening.depth / 2, sinkZMax = sinkCenter.z + sinkOpening.depth / 2;
  const counterShape = new THREE.Shape();
  counterShape.moveTo(counterXMin, counterZMin); counterShape.lineTo(counterXMax, counterZMin);
  counterShape.lineTo(counterXMax, counterZMax); counterShape.lineTo(counterXMin, counterZMax); counterShape.closePath();
  const sinkHole = new THREE.Path();
  sinkHole.moveTo(sinkXMin, sinkZMin); sinkHole.lineTo(sinkXMin, sinkZMax);
  sinkHole.lineTo(sinkXMax, sinkZMax); sinkHole.lineTo(sinkXMax, sinkZMin); sinkHole.closePath();
  counterShape.holes.push(sinkHole);
  const counterGeometry = new THREE.ExtrudeGeometry(counterShape, { depth: 0.09, bevelEnabled: true, bevelSegments: 1, bevelThickness: 0.003, bevelSize: 0.003, curveSegments: 4 });
  counterGeometry.rotateX(Math.PI / 2); counterGeometry.translate(0, counterTop, 0);
  addGeometryToBucket(b, "counter", m.stone, counterGeometry, [0, 0, 0]);
  {
    // Main backsplash in the same glazed subway tile as the wok side (GrokBot 2026-10-31: a Bay Area kitchen wants a handmade-looking tile), tinted a pale sage-oat so it
    // sits between the olive cabinets and the mist-blue wall. The picture is shared with the wok tile and loaded once; the plain stone colour is the fallback.
    const tileRepeatM = (1024 / 109) * 0.075;
    m.mainTile = m.stone.clone();
    m.mainTile.name = "main-backsplash-tile";
    m.mainTile.color.setHex(0xc9c0ae);
    const geometry = roundedBoxGeometry([4.34, 0.5, 0.035], 0.004);
    geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 1.21, -2.285));
    const position = geometry.attributes.position, uv = geometry.attributes.uv;
    for (let index = 0; index < position.count; index++) uv.setXY(index, position.getX(index) / tileRepeatM, position.getY(index) / tileRepeatM);
    uv.needsUpdate = true;
    addGeometryToBucket(b, "backsplash", m.mainTile, geometry, [0, 0, 0]);
  }
  {
    // The patchwork azulejo panel behind the hob, in front of the plain backsplash, under the hood; the hub screen sits on it.
    // Paul 2026-11-22: a flat printed panel did not read as tile at the stove, so the panel is now REAL tile: 32 glazed bricks
    // (8 x 4, the same cells the texture paints) each with its own depth, tilt and glaze-edge bevel, over a grout bed. Every
    // tile keeps its cell of the shared azulejo texture as its face, so the pattern survives while the surface becomes relief.
    m.hobTile = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.34, map: makeAzulejoTexture() });
    m.hobTile.name = "main-hob-azulejo";
    addGeometryToBucket(b, "backsplash", m.hobTile, new THREE.PlaneGeometry(1.0, 0.5).translate(0.82, 1.21, -2.2655), [0, 0, 0]);
    for (const sy of [-1, 1]) addBox(b, "kitchen", m.brass, [1.02, 0.01, 0.007], [0.82, 1.21 + sy * 0.255, -2.2635]); // a slim brass frame round the panel
    for (const sx of [-1, 1]) addBox(b, "kitchen", m.brass, [0.01, 0.5, 0.007], [0.82 + sx * 0.505, 1.21, -2.2635]);
  }
  addBox(b, "kitchen", m.olive, [4.24, 0.66, 0.42], [0, 1.78, -2.16]);
  // Handle-less push-to-open doors with a slim shadow gap along the lower edge (Paul 2026-10-29: make the top row more modern and technical), and the
  // far-left door is replaced by a built-in dish dryer (buildDishDryer).
  for (const x of [-1.55, -0.52, 0.52, 1.55]) {
    if (x !== -1.55) addBox(b, "kitchen", m.olive, [0.98, 0.61, 0.035], [x, 1.78, -1.94]);
    if (x !== -1.55) addBox(b, "hardware", m.black, [0.96, 0.010, 0.006], [x, 1.4825, -1.9225]);
  }
  // Sink: exposed rim, sloped inner walls, brushed stainless basin floor, drain and a
  // restrained touchless gooseneck faucet. The sensor is visual only; no light.
  const sinkY = counterTop - 0.004;
  const sinkRail = (x, z, width, depth) => addGeometryToBucket(b, "appliances", m.sinkSteel,
    roundedBoxGeometry([width, 0.012, depth], 0.006), [x, sinkY, z]);
  sinkRail(sinkCenter.x, sinkZMin, sinkOpening.width, 0.012);
  sinkRail(sinkCenter.x, sinkZMax, sinkOpening.width, 0.012);
  sinkRail(sinkXMin, sinkCenter.z, 0.012, sinkOpening.depth);
  sinkRail(sinkXMax, sinkCenter.z, 0.012, sinkOpening.depth);
  const basinTopY = counterTop - 0.018, basinBottomY = 0.765;
  const basinTopW = sinkOpening.width - 0.042, basinTopD = sinkOpening.depth - 0.042;
  const basinBotW = basinTopW, basinBotD = basinTopD, basinWallT = 0.012;
  const basinWall = (length, height, x, y, z, alongX) => addGeometryToBucket(b, "appliances", m.sinkSteel,
    roundedBoxGeometry(alongX ? [length, height, basinWallT] : [basinWallT, height, length], 0.008), [x, y, z]);
  const basinMidY = (basinTopY + basinBottomY) / 2;
  basinWall(basinTopW, basinTopY - basinBottomY, sinkCenter.x, basinMidY, sinkZMin + 0.018, true);
  basinWall(basinTopW, basinTopY - basinBottomY, sinkCenter.x, basinMidY, sinkZMax - 0.018, true);
  basinWall(basinTopD, basinTopY - basinBottomY, sinkXMin + 0.018, basinMidY, sinkCenter.z, false);
  basinWall(basinTopD, basinTopY - basinBottomY, sinkXMax - 0.018, basinMidY, sinkCenter.z, false);
  // Stainless continues across the basin floor; avoid a cabinet-green-looking
  // insert that reads as a panel instead of the bottom of a real sink.
  addGeometryToBucket(b, "appliances", m.sinkSteel, new THREE.BoxGeometry(basinBotW, 0.012, basinBotD), [sinkCenter.x, basinBottomY, sinkCenter.z]);
  const drain = new THREE.CylinderGeometry(0.039, 0.039, 0.004, 20);
  addGeometryToBucket(b, "appliances", m.sinkSteel, drain, [sinkCenter.x, basinBottomY + 0.009, sinkCenter.z]);
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    addGeometryToBucket(b, "appliances", m.black, new THREE.SphereGeometry(0.003, 5, 4),
      [sinkCenter.x + Math.cos(a) * 0.023, basinBottomY + 0.012, sinkCenter.z + Math.sin(a) * 0.023]);
  }
  // Center-rear deck mount. The profile stays in one vertical plane and turns
  // toward the basin like the high-arc Talis / Essence references Paul shared.
  const faucetBase = [sinkCenter.x, counterTop + 0.008, sinkZMin + 0.065];
  addGeometryToBucket(b, "appliances", m.faucetSteel, new THREE.CylinderGeometry(0.022, 0.027, 0.018, 14), faucetBase);
  // A restrained single-plane gooseneck: vertical riser, broad rounded crown,
  // and a short downturned outlet within the basin.
  const faucetOutlet = [faucetBase[0], 1.10, sinkCenter.z - 0.015];
  const faucetPath = new THREE.CurvePath();
  const riserTop = new THREE.Vector3(faucetBase[0], 1.10, faucetBase[2]);
  faucetPath.add(new THREE.LineCurve3(new THREE.Vector3(faucetBase[0], faucetBase[1] + 0.006, faucetBase[2]), riserTop));
  faucetPath.add(new THREE.CubicBezierCurve3(riserTop,
    new THREE.Vector3(faucetBase[0], 1.25, faucetBase[2]),
    new THREE.Vector3(faucetOutlet[0], 1.25, faucetOutlet[2]),
    new THREE.Vector3(...faucetOutlet)));
  addGeometryToBucket(b, "appliances", m.faucetSteel, new THREE.TubeGeometry(faucetPath, 24, 0.011, 10, false), [0, 0, 0]);
  // Sensor is a discreet underside lens at the outlet; the short side lever
  // pivots at the deck like a normal single-handle faucet.
  addGeometryToBucket(b, "appliances", m.black, new THREE.CylinderGeometry(0.0045, 0.0045, 0.004, 10), [faucetOutlet[0], faucetOutlet[1] + 0.006, faucetOutlet[2]]);
  addGeometryToBucket(b, "appliances", m.faucetSteel, new THREE.SphereGeometry(0.009, 8, 6), [faucetBase[0] + 0.028, counterTop + 0.015, faucetBase[2]]);
  const faucetLeverPivot = new THREE.CylinderGeometry(0.006, 0.007, 0.014, 10);
  addGeometryToBucket(b, "appliances", m.faucetSteel, faucetLeverPivot, [faucetBase[0] + 0.025, counterTop + 0.020, faucetBase[2] + 0.012]);
  const faucetLever = roundedBoxGeometry([0.070, 0.014, 0.018], 0.005);
  addGeometryToBucket(b, "appliances", m.faucetSteel, faucetLever, [faucetBase[0] + 0.065, counterTop + 0.042, faucetBase[2] + 0.016]);

  const sinkInfo = {
    center: { ...sinkCenter }, openingMm: [680, 420], bottomY: basinBottomY, counterTopY: counterTop,
    basinMaterial: { color: `#${m.sinkSteel.color.getHexString()}`, roughness: m.sinkSteel.roughness, metalness: m.sinkSteel.metalness },
    faucetBase: [...faucetBase], faucetOutlet: [...faucetOutlet], faucetPeakY: 1.2125,
    outletInsideBasin: faucetOutlet[0] > sinkXMin && faucetOutlet[0] < sinkXMax && faucetOutlet[2] > sinkZMin && faucetOutlet[2] < sinkZMax,
    mountFromRearMm: Math.round((faucetBase[2] - sinkZMin) * 1000),
    faucetProfile: "center-rear high-arc gooseneck, single vertical plane",
  };

  // Main cooktop remains unchanged.
  addBox(b, "appliances", m.black, [0.9, 0.035, 0.58], [0.82, 0.98, -2.02]);
  // Paul 2026-11-22 (a flat induction cooktop from a reference photo: "no rotary knobs, fully flat, a single control strip"): the four gas burners, pan-support frames and front knobs are gone. The plate is one flat
  // sheet of black glass; the four cooking zones are printed as thin pale rings, and the only control is a slim touch strip along the front edge (a thin slider line with seven small glowing marks).
  const hobTop = 0.9975;
  for (const x of [0.53, 1.1]) for (const z of [-2.18, -1.88]) {
    addGeometryToBucket(b, "appliances", m.steel, new THREE.RingGeometry(0.098, 0.101, 44).rotateX(-Math.PI / 2), [x, hobTop + 0.0004, z]);
    addGeometryToBucket(b, "appliances", m.steel, new THREE.RingGeometry(0.052, 0.054, 32).rotateX(-Math.PI / 2), [x, hobTop + 0.0004, z]);
  }
  addGeometryToBucket(b, "appliances", m.steel, new THREE.BoxGeometry(0.62, 0.0006, 0.0035), [0.82, hobTop + 0.0004, -1.775]); // the slider line
  for (let i = 0; i < 7; i++) addGeometryToBucket(b, "appliances", m.wokGlow, new THREE.BoxGeometry(0.0045, 0.0006, 0.012), [0.82 + (i - 3) * 0.1, hobTop + 0.0005, -1.755]);
  // A soft-edged stainless canopy and tapered chimney replace the dark square hood.
  addBox(b, "hood", m.hoodSteel, [1.38, 0.15, 0.55], [0.82, 2.13, -2.01]);
  const hoodShape = new THREE.Shape();
  hoodShape.moveTo(-0.66, -0.257);
  hoodShape.quadraticCurveTo(-0.68, -0.257, -0.66, -0.225);
  hoodShape.lineTo(-0.235, 0.224);
  hoodShape.quadraticCurveTo(-0.216, 0.245, -0.19, 0.245);
  hoodShape.lineTo(0.19, 0.245);
  hoodShape.quadraticCurveTo(0.216, 0.245, 0.235, 0.224);
  hoodShape.lineTo(0.66, -0.225);
  hoodShape.quadraticCurveTo(0.68, -0.257, 0.66, -0.257);
  hoodShape.closePath();
  const hoodCoreDepth = 0.23 - 0.036;
  const hoodBody = new THREE.ExtrudeGeometry(hoodShape, {
    depth: hoodCoreDepth, bevelEnabled: true, bevelSegments: 3,
    bevelThickness: 0.018, bevelSize: 0.018, curveSegments: 4,
  });
  hoodBody.translate(0, 0, -hoodCoreDepth / 2);
  addGeometryToBucket(b, "hood", m.hoodSteel, mergeVertices(hoodBody), [0.82, 2.43, -2.21]);
  // Canopy details (GrokBot 2026-10-31: the hood read as a plain grey block): five dark vent slots in the underside, a pale polished lip along the front edge. They join the existing black and steel appliance meshes, so no draw call is added.
  for (const dz of [-0.14, -0.07, 0, 0.07, 0.14]) addGeometryToBucket(b, "appliances", m.black, new THREE.BoxGeometry(0.9, 0.003, 0.022), [0.82, 2.0535, -2.01 + dz]);
  addGeometryToBucket(b, "appliances", m.steel, new THREE.BoxGeometry(1.34, 0.006, 0.006), [0.82, 2.058, -1.735 + 0.001]);
  // Under-cabinet light is an emissive strip plus a single low-power task spot.
  addBox(b, "light-fixtures", m.warmGlow, [3.45, 0.018, 0.024], [0, 1.43, -1.91]);
  return { sink: sinkInfo };
}

function buildSideKitchen(b, m, scene) {
  // Continuous wok run on the solid right wall. No slider, frames, or exterior backboard.
  // Joins are settled in millimetres: counter and backsplash bury 3 mm into the side wall and
  // the entry-hall wall (inside the 120 mm thickness, so nothing shows through), the cabinet
  // top meets the counter bottom, and the duct cap buries 3 mm into the ceiling soffit at y 2.61.
  const wallFaceX = 2.94;
  const frontFaceZ = 2.34;
  const embed = 0.003;
  const counterH = 0.09;
  const counterY = 0.91;
  const counterTop = counterY + counterH / 2;
  const counterLen = 1.32;
  const counterDepth = 0.59;
  const counterMaxZ = frontFaceZ + embed;
  const counterMinZ = counterMaxZ - counterLen;
  const counterZ = (counterMinZ + counterMaxZ) / 2;
  const counterMaxX = wallFaceX + embed;
  const counterX = counterMaxX - counterDepth / 2;
  const cabDepth = 0.55;
  const cabLen = 1.28;
  const cabMaxX = wallFaceX + embed - 0.002;
  const cabX = cabMaxX - cabDepth / 2;
  const bodyTop = counterY - counterH / 2;
  const kickTop = 0.12;
  const bodyH = bodyTop - kickTop;
  const bodyY = kickTop + bodyH / 2;
  const cookX = 2.64;
  const cookZ = counterZ;

  const addSideMesh = (geometry, material, name, position, rotation = [0, 0, 0], { shadow = true } = {}) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name; mesh.userData.category = "side-kitchen";
    mesh.position.set(...position); mesh.rotation.set(...rotation);
    mesh.castShadow = shadow; mesh.receiveShadow = shadow;
    const key = `shapes:${material.uuid}`;
    b.get(key) ?? b.set(key, { category: "side-kitchen", material, geometries: [], meshes: [] });
    b.get(key).meshes.push(mesh);
    return mesh;
  };

  // Split the cabinet carcass around a real appliance bay instead of painting an oven over two doors.
  const ovenBay = { width: 0.60, bottom: 0.16, top: 0.82 };
  const sideWidth = (cabLen - ovenBay.width) / 2;
  for (const sign of [-1, 1]) {
    addBox(b, "wok-base-cabinet", m.clay, [cabDepth, bodyH, sideWidth], [cabX, bodyY, counterZ + sign * (ovenBay.width / 2 + sideWidth / 2)]);
  }
  addBox(b, "wok-base-cabinet", m.clay, [cabDepth, ovenBay.bottom - kickTop, ovenBay.width], [cabX, kickTop + (ovenBay.bottom - kickTop) / 2, counterZ]);
  addBox(b, "wok-base-cabinet", m.clay, [cabDepth, bodyTop - ovenBay.top, ovenBay.width], [cabX, ovenBay.top + (bodyTop - ovenBay.top) / 2, counterZ]);
  const kickDepth = 0.46;
  const kickMaxX = 2.872;
  const kickX = kickMaxX - kickDepth / 2;
  addBox(b, "wok-base-cabinet", m.clay, [kickDepth, 0.10, cabLen - 0.08], [kickX, 0.07, counterZ]);
  const doorX = cabX - cabDepth / 2 + 0.006;
  const doorHeight = ovenBay.top - ovenBay.bottom;
  const cabinetPullOffsetFromOvenMm = Math.round(sideWidth * 0.16 * 1000);
  for (const sign of [-1, 1]) {
    const doorZ = counterZ + sign * (ovenBay.width / 2 + sideWidth / 2);
    addBox(b, "wok-base-cabinet", m.clay, [0.012, doorHeight, sideWidth - 0.012], [doorX, ovenBay.bottom + doorHeight / 2, doorZ]);
    // Put both pulls at the inner, oven-facing opening edges so the adjacent wall cannot block the hand approach.
    addBox(b, "wok-base-cabinet", m.brass, [0.016, 0.09, 0.012], [doorX - 0.012, ovenBay.bottom + doorHeight * 0.57, doorZ - sign * (sideWidth * 0.34)]);
  }

  // A built-in under-counter oven: a recessed dark cavity, black-glass door, metal bezel and tactile controls.
  const oven = { width: 0.56, height: 0.62, depth: 0.43, frontX: doorX - 0.008, centerY: (ovenBay.bottom + ovenBay.top) / 2 };
  const ovenBodyX = oven.frontX + oven.depth / 2 + 0.004;
  addBox(b, "side-kitchen", m.black, [oven.depth, oven.height, oven.width], [ovenBodyX, oven.centerY, counterZ]);
  // Paul 2026-11-22: the oven front is the face you see beside the hob, so it gets the same care as the tile wall. The door
  // is a bevelled plate with a real picture-frame reveal around the glass, a shadow gap at its edges, a dark cavity behind
  // the glass with a warm strip in it, and a handle with turned end caps instead of bare bar ends.
  addGeometryToBucket(b, "side-kitchen", m.steel, roundedBoxGeometry([0.018, oven.height, oven.width], 0.004), [oven.frontX, oven.centerY, counterZ]);
  const windowY = ovenBay.bottom + 0.285;
  // the cavity: a dark box behind the glass, so the window reads as depth and not as a sticker
  addBox(b, "side-kitchen", m.black, [0.010, 0.300, 0.395], [oven.frontX + 0.006, windowY, counterZ]);
  addBox(b, "side-kitchen", m.ovenGlass, [0.008, 0.31, 0.405], [oven.frontX - 0.011, windowY, counterZ]);
  // a warm strip at the top of the cavity: emissive pixels, not another light source
  addBox(b, "side-kitchen", m.wokGlow, [0.004, 0.006, 0.300], [oven.frontX - 0.004, windowY + 0.142, counterZ]);
  // the oven glass is opaque, so the interior cannot be seen: a slim chrome bezel on the glass itself gives the window a
  // second plane that catches the room light, and the warm strip is repeated 1 mm in front of the glass where it reads.
  for (const sy of [-1, 1]) addBox(b, "side-kitchen", m.steel, [0.0025, 0.007, 0.371], [oven.frontX - 0.0155, windowY + sy * 0.148, counterZ]);
  for (const sz of [-1, 1]) addBox(b, "side-kitchen", m.steel, [0.0025, 0.303, 0.007], [oven.frontX - 0.0155, windowY, counterZ + sz * 0.182]);
  addBox(b, "side-kitchen", m.wokGlow, [0.002, 0.005, 0.286], [oven.frontX - 0.0158, windowY + 0.136, counterZ]);
  // the picture-frame reveal: four slim stepped rails that stand 2 mm proud of the door plate, 3 mm wide
  for (const sy of [-1, 1]) addBox(b, "side-kitchen", m.steel, [0.006, 0.016, 0.429], [oven.frontX - 0.014, windowY + sy * 0.163, counterZ]);
  for (const sz of [-1, 1]) addBox(b, "side-kitchen", m.steel, [0.006, 0.342, 0.014], [oven.frontX - 0.014, windowY, counterZ + sz * 0.2075]);
  // the joint lines: a thin dark slot under the trim and a hinge shadow at the foot of the door
  addBox(b, "side-kitchen", m.black, [0.004, 0.003, 0.412], [oven.frontX - 0.0145, windowY - 0.174, counterZ]);
  addBox(b, "side-kitchen", m.black, [0.004, 0.006, 0.418], [oven.frontX - 0.011, ovenBay.bottom + 0.004, counterZ]);
  // Brushed horizontal handle and two simple, readable control knobs; no branding or extra light source.
  // Paul 2026-11-22 (reference: a stainless range with long bar handles, no fussy dials): a full-width brushed stainless bar on two standoffs; the oven has no knobs, only the touch timer panel below.
  const handleBar = roundedBoxGeometry([0.018, 0.018, 0.46], 0.006);
  addGeometryToBucket(b, "side-kitchen", m.steel, handleBar, [oven.frontX - 0.034, windowY + 0.205, counterZ]);
  for (const sz of [-1, 1]) {
    // a tapered standoff and a turned end cap, so the bar ends look machined rather than cut
    const cap = new THREE.CylinderGeometry(0.0105, 0.0105, 0.012, 14).rotateX(Math.PI / 2).translate(oven.frontX - 0.034, windowY + 0.205, counterZ + sz * 0.236);
    addGeometryToBucket(b, "side-kitchen", m.steel, cap, [0, 0, 0]);
    const stem = new THREE.CylinderGeometry(0.006, 0.008, 0.014, 12).rotateX(Math.PI / 2).translate(oven.frontX - 0.024, windowY + 0.205, counterZ + sz * 0.19);
    addGeometryToBucket(b, "side-kitchen", m.steel, stem, [0, 0, 0]);
  }
  // Dark-glass timer panel and small amber indicators echo the kitchen's appliance UI.
  // These are emissive pixels only, not another light source.
  const ovenPanelY = ovenBay.top - 0.044;
  addBox(b, "side-kitchen", m.ovenGlass, [0.008, 0.060, 0.24], [oven.frontX - 0.013, ovenPanelY, counterZ]);
  addBox(b, "side-kitchen", m.wokGlow, [0.003, 0.006, 0.046], [oven.frontX - 0.018, ovenPanelY + 0.007, counterZ - 0.030]);
  addBox(b, "side-kitchen", m.wokGlow, [0.003, 0.005, 0.032], [oven.frontX - 0.018, ovenPanelY + 0.007, counterZ - 0.002]);
  addBox(b, "side-kitchen", m.wokGlow, [0.003, 0.004, 0.014], [oven.frontX - 0.018, ovenPanelY + 0.007, counterZ + 0.024]);
  addBox(b, "side-kitchen", m.steel, [0.003, 0.004, 0.016], [oven.frontX - 0.018, ovenPanelY - 0.014, counterZ + 0.036]);
  scene.userData.wokOven = { ...oven, bay: ovenBay, cooktopY: counterY + 0.055 + 0.014, cabinetFrontX: doorX - 0.006, backX: oven.frontX + oven.depth, counterBottomY: bodyTop, display: "240 x 60 mm dark-glass timer panel with amber indicators", handle: "centered horizontal brushed stainless bar pull on two standoffs", cabinetPulls: "two brass pulls on oven-facing inner door edges", cabinetPullOffsetFromOvenMm };

  addGeometryToBucket(b, "wok-counter", m.stone, roundedBoxGeometry([counterDepth, counterH, counterLen], 0.025), [counterX, counterY, counterZ]);
  addBox(b, "side-kitchen", m.black, [0.42, 0.028, 0.48], [cookX, counterY + 0.055, cookZ]);

  const placeRing = (geometry, y) => {
    geometry.rotateX(Math.PI / 2);
    geometry.translate(cookX, y, cookZ);
    return geometry;
  };
  const burners = mergeGeometries([
    placeRing(new THREE.TorusGeometry(0.105, 0.012, 5, 20), counterY + 0.078),
    placeRing(new THREE.TorusGeometry(0.061, 0.009, 5, 16), counterY + 0.081),
    placeRing(new THREE.TorusGeometry(0.174, 0.011, 6, 24), counterY + 0.212),
  ], false);
  addSideMesh(burners, m.wokSteel, "wok-kitchen-burners", [0, 0, 0], [0, 0, 0], { shadow: false });
  const wokProfile = [
    new THREE.Vector2(0, 0.015), new THREE.Vector2(0.065, 0.005), new THREE.Vector2(0.13, 0.035),
    new THREE.Vector2(0.175, 0.105), new THREE.Vector2(0.182, 0.14), new THREE.Vector2(0.166, 0.142),
    new THREE.Vector2(0.152, 0.108), new THREE.Vector2(0.105, 0.055), new THREE.Vector2(0.04, 0.032), new THREE.Vector2(0, 0.03),
  ];
  addSideMesh(new THREE.LatheGeometry(wokProfile, 24), m.wokIron, "wok-kitchen-wok", [cookX, counterY + 0.07, cookZ]);
  // Long wooden handle tapering toward the grip and rising 8 degrees (it was a short level rod); the pan also gets a helper loop opposite it.
  const wokHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.017, 0.30, 10), m.oak);
  wokHandle.rotation.z = Math.PI / 2 - 0.15; wokHandle.position.set(cookX - 0.323, counterY + 0.182, cookZ); wokHandle.name = "wok-kitchen-handle"; wokHandle.userData.category = "side-kitchen";
  b.get(`shapes:${m.oak.uuid}`) ?? b.set(`shapes:${m.oak.uuid}`, { category: "side-kitchen", material: m.oak, geometries: [], meshes: [] }); b.get(`shapes:${m.oak.uuid}`).meshes.push(wokHandle);

  // Past the hood's +Z edge so the shelf, bottle and rail read from the room, not inside the canopy.
  const shelfZ = 2.14;
  const shelfTop = 1.4325;
  addBox(b, "side-kitchen", m.oak, [0.16, 0.025, 0.32], [wallFaceX - 0.078, 1.42, shelfZ]);
  // Two L brackets carry the shelf: a plate on the wall and an arm under the board (it hung in the air before).
  for (const dz of [-0.11, 0.11]) {
    addBox(b, "side-kitchen", m.black, [0.008, 0.075, 0.014], [wallFaceX - 0.004, 1.3725, shelfZ + dz]);
    addBox(b, "side-kitchen", m.black, [0.13, 0.01, 0.014], [wallFaceX - 0.073, 1.4075 - 0.005, shelfZ + dz]);
  }
  // Keep the wok and its helper loop together; the oil bottle now sits beside the always-visible napkin pack.
  const wokMesh = [...(b.get(`shapes:${m.wokIron.uuid}`)?.meshes || [])].find((mesh) => mesh.name === "wok-kitchen-wok");
  // The wok's helper loop on the side away from the handle, in the same iron mesh.
  const earGeo = new THREE.TorusGeometry(0.03, 0.0065, 5, 10, Math.PI);
  earGeo.rotateZ(-Math.PI / 2);
  earGeo.translate(0.184, 0.115, 0);
  const wokWithEar = mergeGeometries([wokMesh.geometry, earGeo], false);
  earGeo.dispose();
  wokMesh.geometry.dispose();
  wokMesh.geometry = wokWithEar;
  // The tool rail, its tools and the shelf canisters are one vertex-colour mesh, built in buildRoom03WokTools.

  // Backsplash meets the counter top and the hood underside. The open end overruns the counter
  // by 4 cm (the slack that still leaves 0.40 m to the cable-car frame). Each end gets a 13 cm
  // stone return so the run is not a freestanding island.
  const splashBottom = counterTop - 0.002;
  const splashTop = 1.60;
  const splashH = splashTop - splashBottom;
  const splashY = splashBottom + splashH / 2;
  const splashMinZ = counterMinZ - 0.04;
  const splashLen = counterMaxZ - splashMinZ;
  const splashZ = splashMinZ + splashLen / 2;
  // tile-b-subway.webp is a seamless square. Course pitch on the file is 109 px, and a subway
  // brick is twice as wide as a course, so one repeat is (1024/109) × 7.5 cm on both axes.
  const tileRepeatM = (1024 / 109) * 0.075;
  const wokTile = m.stone.clone();
  wokTile.name = "wok-backsplash-tile";
  wokTile.color.setHex(0xc9c0ae);
  const stampTileUvs = (geometry) => {
    geometry.computeBoundingBox();
    const size = geometry.boundingBox.getSize(new THREE.Vector3());
    const position = geometry.attributes.position;
    const uv = geometry.attributes.uv;
    const horizontal = size.z >= size.x ? "z" : "x";
    for (let index = 0; index < position.count; index++) {
      const along = horizontal === "z" ? position.getZ(index) : position.getX(index);
      uv.setXY(index, along / tileRepeatM, position.getY(index) / tileRepeatM);
    }
    uv.needsUpdate = true;
  };
  const addTiledSplash = (size, position) => {
    const geometry = roundedBoxGeometry(size, 0.01);
    geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(...position));
    stampTileUvs(geometry);
    addGeometryToBucket(b, "wok-backsplash", wokTile, geometry, [0, 0, 0]);
  };
  // Paul 2026-11-22: the small stove is the wall worth the tile work. The printed subway run and its two returns become
  // REAL zellige: hand-set glazed bricks about 68 mm across, each 1.5-5 mm proud, leaning up to a degree, one flat glaze
  // colour per brick from the azulejo palette plus a light glaze lip. Same bucket and material as the hob panel, so no
  // draw call is added, and the oven mitts and the hanging tools stay exactly where they were.
  {
    const frontX = wallFaceX - 0.007 - 0.010;
    const GAP = 0.002, T = 0.014, TARGET = 0.068;
    const ROWS = Math.max(1, Math.round(splashH / TARGET)), COLS = Math.max(1, Math.round(splashLen / TARGET));
    const faceH = splashH / ROWS - GAP, faceW = splashLen / COLS - GAP;
    const PALETTE = [[8, 8], [136, 8], [64, 24], [20, 264], [64, 64]]; // cream, pale, cobalt, terracotta, ochre
    const WEIGHT = [0, 1, 0, 1, 0, 1, 0, 1, 2, 1, 0, 1, 3, 1, 0, 4, 1, 0, 1, 0];
    const mix = (n) => { let x = Math.imul((n ^ 0x9e3779b9) >>> 0, 2654435761) >>> 0; x ^= x >>> 15; x = Math.imul(x, 2246822519) >>> 0; return ((x ^ (x >>> 13)) >>> 8) / 16777216; };
    const jit = (i, k) => { const v = Math.sin((i * 12.9898 + k * 78.233) * 43758.5453); return v - Math.floor(v); };
    const bricks = [];
    const glaze = (g, index, front, lip) => {          // front: predicate telling which vertices face the room
      const uv = g.attributes.uv, pos = g.attributes.position;
      const pick = PALETTE[WEIGHT[Math.floor(mix(index) * WEIGHT.length)]];
      const fu = (pick[0] + 2) / 1024, fv = 1 - (pick[1] + 2) / 512;
      for (let n = 0; n < uv.count; n++) uv.setXY(n, front(pos, n) ? fu : lip, front(pos, n) ? fv : 1 - 4 / 512);
    };
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const index = r * COLS + c;
      const y = splashBottom + (r + 0.5) * (splashH / ROWS), z = splashMinZ + (c + 0.5) * (splashLen / COLS);
      const g = roundedBoxGeometry([T, faceH, faceW], 0.0012, 1);
      glaze(g, index, (pos, n) => pos.getX(n) < -T * 0.34, 4 / 1024);
      g.applyMatrix4(new THREE.Matrix4().makeRotationZ((jit(index, 2) - 0.5) * 0.030));
      g.applyMatrix4(new THREE.Matrix4().makeRotationY((jit(index, 3) - 0.5) * 0.018));
      g.applyMatrix4(new THREE.Matrix4().makeTranslation(frontX - (0.0015 + jit(index, 1) * 0.0035) - T / 2, y, z));
      bricks.push(g);
    }
    // Paul 2026-11-22: the two 13 cm stone returns stood out from the wall like fins (they read as a vertical slab
    // sticking into the room), so they are gone; the zellige field ends at the wall edge.
    // Paul 2026-11-22: a hairline brass edge at each end of the tile field, 5 mm wide and 24 mm deep, so the cut brick
    // edge meets a metal line instead of stopping abruptly against the wall. It wraps the tile thickness, nothing floats.
    for (const end of [splashMinZ + 0.0025, splashMinZ + splashLen - 0.0025]) {
      addBox(b, "kitchen", m.brass, [0.024, splashH - 0.002, 0.005], [frontX - 0.011, splashY, end]);
    }
    addGeometryToBucket(b, "backsplash", m.hobTile, mergeGeometries(bricks), [0, 0, 0]);
    bricks.forEach((g) => g.dispose());
  }
  scene.userData.wokTile = { material: wokTile, repeatM: tileRepeatM, status: "pending", readyBeforeFirstPaint: false };

  const hoodShape = new THREE.Shape();
  hoodShape.moveTo(-0.26, -0.12); hoodShape.quadraticCurveTo(-0.185, -0.035, -0.14, 0.10); hoodShape.lineTo(0.14, 0.10); hoodShape.quadraticCurveTo(0.185, -0.035, 0.26, -0.12); hoodShape.closePath(); // a bell: the sides sweep in with a curve
  const hoodGeometry = new THREE.ExtrudeGeometry(hoodShape, { depth: 0.38, bevelEnabled: true, bevelSegments: 4, bevelThickness: 0.008, bevelSize: 0.006 });
  hoodGeometry.translate(0, 0, -0.19);
  addSideMesh(hoodGeometry, m.wokPlaster, "wok-kitchen-sloped-hood", [cookX + 0.04, 1.72, cookZ], [0, Math.PI / 2, 0]);
  addSideMesh(new THREE.BoxGeometry(0.536, 0.016, 0.396), m.brass, "wok-kitchen-hood-rim", [cookX + 0.04, 1.72 - 0.116, cookZ], [0, Math.PI / 2, 0]); // a slim brass rim round the lower edge

  const soffitY = 2.61;
  const capH = 0.05;
  const capTop = soffitY + embed;
  const capY = capTop - capH / 2;
  const ductBottom = 1.80;
  const ductTop = capY - capH / 2 + 0.002;
  const ductH = ductTop - ductBottom;
  const ductX = wallFaceX - 0.09;
  const duct = new THREE.Mesh(new THREE.BoxGeometry(0.16, ductH, 0.22), m.wokPlaster);
  duct.position.set(ductX, ductBottom + ductH / 2, cookZ); duct.name = "wok-kitchen-hood-duct"; duct.userData.category = "side-kitchen";
  duct.castShadow = true; duct.receiveShadow = true; scene.add(duct);
  const ductCap = new THREE.Mesh(new THREE.BoxGeometry(0.20, capH, 0.26), m.wokPlaster);
  ductCap.position.set(ductX, capY, cookZ); ductCap.name = "wok-kitchen-hood-duct-cap"; ductCap.userData.category = "side-kitchen";
  ductCap.castShadow = true; ductCap.receiveShadow = true; scene.add(ductCap);

  const hoodLight = new THREE.Mesh(new THREE.PlaneGeometry(0.40, 0.06), m.wokGlow);
  hoodLight.position.set(cookX - 0.02, 1.55, cookZ); hoodLight.rotation.y = Math.PI / 2; hoodLight.name = "wok-kitchen-hood-light"; hoodLight.userData.category = "side-kitchen";
  hoodLight.castShadow = false; hoodLight.receiveShadow = false;
  sceneAddToBucket(b, hoodLight, "wok-kitchen-hood-light");
  const sideLight = new THREE.PointLight(0xffad64, 0, 0.9, 2); sideLight.position.set(cookX, 1.50, cookZ); sideLight.name = "side-kitchen-warm-source"; scene.add(sideLight);
  // Four-hook rail on the room-facing side wall beside the oven. The former
  // z=2.55 placement sat beyond the room's +Z wall (z=2.4), so the mitts were
  // built but never visible. The new rail stays on the tiled wall and clear of
  // the hood, with the mitt cuffs hung at the hooks and the fingers pointing down.
  const hookZ = 1.25, hookY = 1.62, wallX = wallFaceX + embed;
  const hookOffsets = [-0.12, -0.04, 0.04, 0.12];
  addBox(b, "side-kitchen", m.steel, [0.009, 0.055, 0.29], [wallX - 0.0045, hookY, hookZ]);
  for (const dz of hookOffsets) {
    const peg = new THREE.CylinderGeometry(0.006, 0.008, 0.065, 10);
    peg.rotateZ(Math.PI / 2);
    addGeometryToBucket(b, "side-kitchen", m.steel, peg, [wallX - 0.037, hookY - 0.005, hookZ + dz]);
  }
  const mittGeometries = [];
  const addMittGeometry = (source, color, position, rotation = [0, -Math.PI / 2, 0], scale = [1, 1, 1]) => {
    const geometry = source.index ? source.toNonIndexed() : source;
    if (geometry !== source) source.dispose();
    geometry.deleteAttribute("uv");
    const rgb = new THREE.Color(color);
    const colors = new Float32Array(geometry.attributes.position.count * 3);
    for (let index = 0; index < geometry.attributes.position.count; index++) rgb.toArray(colors, index * 3);
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...position), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)), new THREE.Vector3(...scale)));
    mittGeometries.push(geometry);
  };
  const mittPattern = { leaves: 0, flowers: 0 };
  const leafGeometry = (cx, cy, rx, ry, angle) => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -ry);
    shape.bezierCurveTo(rx * 0.95, -ry * 0.72, rx, ry * 0.45, 0, ry);
    shape.bezierCurveTo(-rx, ry * 0.45, -rx * 0.95, -ry * 0.72, 0, -ry);
    // Paul 2026-11-22: the print read as a sticker on a flat plane, so every motif is now a raised pad (an extruded
    // shape with a soft bevel) instead of a flat sheet: 1.8 mm of embroidery over the cloth, catching the hood light.
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.0018, bevelEnabled: true, bevelSegments: 1, bevelThickness: 0.0005, bevelSize: 0.0005, curveSegments: 4 });
    geometry.rotateZ(angle); geometry.translate(cx, cy, 0.0288);
    return geometry;
  };
  for (const [index, mittZ] of [hookZ - 0.12, hookZ + 0.12].entries()) {
    const silhouette = new THREE.Shape();
    // Broad rounded four-finger body plus a separate, clearly projecting thumb, like a sewn cotton oven mitt.
    silhouette.moveTo(-0.056, 0); silhouette.lineTo(0.056, 0); silhouette.lineTo(0.063, 0.035);
    silhouette.lineTo(0.066, 0.124); silhouette.bezierCurveTo(0.068, 0.143, 0.079, 0.15, 0.091, 0.162);
    silhouette.bezierCurveTo(0.109, 0.179, 0.109, 0.202, 0.095, 0.215);
    silhouette.bezierCurveTo(0.082, 0.228, 0.066, 0.218, 0.052, 0.201);
    silhouette.bezierCurveTo(0.049, 0.239, 0.028, 0.267, 0.001, 0.271);
    silhouette.bezierCurveTo(-0.031, 0.276, -0.057, 0.251, -0.066, 0.219);
    silhouette.lineTo(-0.073, 0.13); silhouette.bezierCurveTo(-0.075, 0.08, -0.069, 0.045, -0.056, 0.035);
    silhouette.closePath();
    const body = new THREE.ExtrudeGeometry(silhouette, { depth: 0.026, bevelEnabled: true, bevelSegments: 2, bevelThickness: 0.004, bevelSize: 0.004, curveSegments: 8 });
    const mittScale = [index === 1 ? -1 : 1, -1, 1];
    const mittPosition = [2.895, hookY - 0.012, mittZ], mittRotation = [0, -Math.PI / 2, 0];
    const addPrint = (geometry, colour) => addMittGeometry(geometry, colour, mittPosition, mittRotation, mittScale);
    addMittGeometry(body, 0xf3ecdc, mittPosition, mittRotation, mittScale);
    // Soft sage cuff binding and seams are printed geometry on the same merged mesh, not added render calls.
    const cuffShape = new THREE.Shape();
    cuffShape.moveTo(-0.052, 0.006); cuffShape.lineTo(0.052, 0.006); cuffShape.lineTo(0.056, 0.036);
    cuffShape.lineTo(-0.058, 0.036); cuffShape.closePath();
    const cuff = new THREE.ShapeGeometry(cuffShape, 4); cuff.translate(0, 0, 0.029);
    addMittGeometry(cuff, 0xb9c394, mittPosition, mittRotation, mittScale);
    const loop = new THREE.TorusGeometry(0.024, 0.0035, 6, 16);
    addMittGeometry(loop, 0xb9c394, [2.892, hookY + 0.006, mittZ]);
    for (const offset of [-0.025, 0.025]) {
      const seam = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
        new THREE.Vector3(offset, 0.045, 0.029), new THREE.Vector3(offset * 0.72, 0.12, 0.03),
        new THREE.Vector3(offset * 0.65, 0.17, 0.03), new THREE.Vector3(offset * 0.45, 0.225, 0.03),
      ]), 10, 0.0016, 5, false);
      addMittGeometry(seam, 0xd4ccb5, mittPosition, mittRotation, mittScale);
    }
    // Small stylized garden print: branching sage leaves and warm marigold/coral blossoms, kept readable at phone scale.
    const branch = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.006, 0.05, 0.029), new THREE.Vector3(0.012, 0.105, 0.029), new THREE.Vector3(-0.006, 0.16, 0.029), new THREE.Vector3(0.006, 0.22, 0.029),
    ]), 10, 0.0015, 5, false);
    addMittGeometry(branch, 0x6f824a, mittPosition, mittRotation, mittScale);
    const leaves = [[-0.026,0.075,0.009,0.022,-0.8], [0.031,0.092,0.009,0.021,0.75], [-0.033,0.128,0.009,0.023,-0.75], [0.031,0.145,0.010,0.023,0.8], [-0.025,0.181,0.009,0.022,-0.8], [0.025,0.199,0.009,0.020,0.75], [-0.008,0.234,0.009,0.018,-0.3]];
    for (const [x, y, rx, ry, angle] of leaves) {
      const leaf = leafGeometry(x, y, rx, ry, angle);
      addPrint(leaf, mittPattern.leaves++ % 2 ? 0x71884a : 0x879954);
    }
    for (const [cx, cy, petalColor] of [[-0.034, 0.09, 0xd18a39], [0.038, 0.157, 0xc9615c], [-0.018, 0.216, 0xe0b848]]) {
      for (let petal = 0; petal < 5; petal++) {
        const angle = petal * Math.PI * 0.4, px = cx + Math.cos(angle) * 0.008, py = cy + Math.sin(angle) * 0.008;
        const shape = new THREE.Shape();
        shape.moveTo(0, -0.007); shape.bezierCurveTo(0.006, -0.006, 0.006, 0.004, 0, 0.010);
        shape.bezierCurveTo(-0.006, 0.004, -0.006, -0.006, 0, -0.007);
        const petalGeometry = new THREE.ExtrudeGeometry(shape, { depth: 0.0012, bevelEnabled: true, bevelSegments: 1, bevelThickness: 0.0004, bevelSize: 0.0004, curveSegments: 4 });
        petalGeometry.rotateZ(angle); petalGeometry.translate(px, py, 0.0298);
        addPrint(petalGeometry, petalColor);
      }
      // the flower's centre is a little domed bead, not a printed disc
      const centre = new THREE.CylinderGeometry(0.0045, 0.0045, 0.0016, 10).rotateX(Math.PI / 2).translate(cx, cy, 0.0310);
      addPrint(centre, 0x8c683d);
      mittPattern.flowers++;
    }
  }
  const mittMesh = new THREE.Mesh(mergeGeometries(mittGeometries, false), m.ovenMitt);
  mittMesh.name = "wok-oven-mitts"; mittMesh.userData.category = "wok-mitts"; mittMesh.castShadow = true; mittMesh.receiveShadow = true; scene.add(mittMesh);
  const mittBounds = new THREE.Box3().setFromObject(mittMesh);
  scene.userData.wokMitts = { count: 2, hookCount: 4, occupiedHooks: 2, mesh: mittMesh, wallX, hookY, hookZ, pattern: "cream cotton, sage leaves, marigold and coral flowers", leafMotifs: 14, flowerMotifs: 6, lowerClearanceToCounterMm: Math.round((mittBounds.min.y - counterTop) * 1000) };
  return sideLight;
}

function buildTable(b, m) {
  const z = 0.5;
  // 2.0 × 0.9 m dining table with clear floor around four chairs.
  // 2.9 × 2.1 m rug; its underside sits 10 mm above the floor to avoid z-fighting.
  addBox(b, "rug", m.jute, [2.9, 0.01, 2.1], [0, 0.015, z]);
  addBox(b, "dining-table", m.oak, [2.0, 0.075, 0.9], [0, 0.76, z]);
  addBox(b, "dining-table", m.oak, [1.66, 0.12, 0.11], [0, 0.65, z]);
  for (const x of [-0.82, 0.82]) for (const zz of [z - 0.31, z + 0.31]) addBox(b, "dining-table", m.oak, [0.09, 0.64, 0.09], [x, 0.34, zz]);
}

// One continuous upholstered seat/back surface, with short solid-oak legs.
// All surfaces and UVs are authored here; no generated model or texture is loaded.
function makeDiningShellGeometry() {
  const stations = [
    [0.45, 0.22, 0.12, 0.026], [0.45, 0.19, 0.205, 0.060],
    [0.45, 0.10, 0.225, 0.075], [0.45, -0.08, 0.225, 0.075],
    [0.50, -0.19, 0.225, 0.040], [0.60, -0.22, 0.225, 0.040],
    [0.70, -0.24, 0.22, 0.040], [0.79, -0.255, 0.19, 0.040],
    [0.835, -0.265, 0.105, 0.022],
  ];
  const around = 12, positions = [], uvs = [], indices = [];
  for (let s = 0; s < stations.length; s++) {
    const [y, z, halfWidth, thickness] = stations[s];
    for (let a = 0; a < around; a++) {
      const theta = 2 * Math.PI * a / around;
      const x = Math.cos(theta) * halfWidth;
      const front = Math.sin(theta);
      const cushion = s < 4 ? 0.017 * (1 - Math.pow(x / halfWidth, 2)) : 0;
      const backBulge = s >= 4 ? 0.022 * (1 - Math.pow(x / halfWidth, 2)) * Math.sin(Math.PI * (s - 4) / 4) : 0;
      positions.push(x, y + (s < 4 ? front * thickness + cushion : 0), z + (s < 4 ? 0 : front * thickness + backBulge));
      uvs.push(a / around, s / (stations.length - 1));
    }
  }
  for (let s = 0; s < stations.length - 1; s++) for (let a = 0; a < around; a++) {
    const b = s * around + a, n = s * around + (a + 1) % around;
    indices.push(b, b + around, n, n, b + around, n + around);
  }
  positions.push(0, stations[0][0], stations[0][1], 0, stations.at(-1)[0], stations.at(-1)[1]);
  uvs.push(0.5, 0, 0.5, 1);
  const start = stations.length * around;
  for (let a = 0; a < around; a++) {
    indices.push(start, (a + 1) % around, a);
    indices.push(start + 1, (stations.length - 1) * around + a, (stations.length - 1) * around + (a + 1) % around);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
}

const DINING_CHAIR_PLACEMENTS = Object.freeze([
  { x: -0.5, z: -0.22, position: [-0.5, 0, -0.23], yaw: THREE.MathUtils.degToRad(-5) },
  { x: 0.5, z: -0.22, position: [0.5, 0, -0.23], yaw: THREE.MathUtils.degToRad(4) },
  { x: -0.5, z: 1.22, position: [-0.5, 0, 1.23], yaw: Math.PI + THREE.MathUtils.degToRad(5) },
  { x: 0.5, z: 1.22, position: [0.5, 0, 1.27], yaw: Math.PI - THREE.MathUtils.degToRad(4) },
]);

// Fine linen weave for the table runner and napkins: a 128 px canvas tile (no download), deterministic.
function makeLinenTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, 128, 128);
  const hash = (n) => Math.abs(Math.sin(n * 12.9898) * 43758.5453) % 1;
  for (let i = 0; i < 128; i += 2) {
    context.fillStyle = `rgba(96, 74, 44, ${0.02 + 0.05 * hash(i)})`;
    context.fillRect(0, i, 128, 1);
    context.fillStyle = `rgba(96, 74, 44, ${0.02 + 0.05 * hash(i + 300)})`;
    context.fillRect(i, 0, 1, 128);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function buildTableware(scene) {
  const group = new THREE.Group();
  group.name = "mood-slot-dinner-tableware";
  group.userData.category = "tableware";
  group.userData.moodSlot = "tableware";
  group.visible = false;

  const table = scene.getObjectByName("room03-table-glb") || scene.getObjectByName("merged-dining-table");
  if (!table) throw new Error("Cannot build tableware without the Room 03 dining table");
  scene.updateMatrixWorld(true);
  table.updateWorldMatrix(true, true);
  const tableBounds = new THREE.Box3().setFromObject(table);
  const tabletopBounds = new THREE.Box3().makeEmpty();
  table.traverse((object) => {
    const positions = object.isMesh ? object.geometry?.attributes?.position : null;
    if (!positions) return;
    for (let i = 0; i < positions.count; i++) {
      const point = new THREE.Vector3().fromBufferAttribute(positions, i).applyMatrix4(object.matrixWorld);
      if (point.y >= tableBounds.max.y - 0.004) tabletopBounds.expandByPoint(point);
    }
  });
  if (tabletopBounds.isEmpty()) throw new Error("Cannot find the upper surface of the Room 03 dining table");
  tabletopBounds.min.y = tableBounds.max.y;
  tabletopBounds.max.y = tableBounds.max.y;
  const raycaster = new THREE.Raycaster();
  const down = new THREE.Vector3(0, -1, 0);
  const tableYAt = (x, z) => {
    raycaster.set(new THREE.Vector3(x, tableBounds.max.y + 0.1, z), down);
    const hit = raycaster.intersectObject(table, true).find(({ point }) => point.y > tableBounds.max.y - 0.08);
    if (!hit) throw new Error(`Cannot measure dining tabletop under ${x.toFixed(3)}, ${z.toFixed(3)}`);
    return hit.point.y;
  };

  const geometryParts = { ceramic: [], glass: [], liquid: [], metal: [], linen: [], food: [] };
  const settings = [];
  const setVertexColor = (geometry, colorHex, speckle = false) => {
    const color = new THREE.Color(colorHex);
    const attribute = geometry.attributes.position;
    const colors = new Float32Array(attribute.count * 3);
    for (let i = 0; i < attribute.count; i++) {
      const px = attribute.getX(i), py = attribute.getY(i), pz = attribute.getZ(i);
      const noise = Math.abs(Math.sin(px * 127.1 + py * 311.7 + pz * 74.7) * 43758.5453) % 1;
      const modulation = speckle ? 0.94 + 0.12 * noise : 1;
      colors[i * 3] = color.r * modulation;
      colors[i * 3 + 1] = color.g * modulation;
      colors[i * 3 + 2] = color.b * modulation;
    }
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  };
  const addLathe = (bucket, profile, segments, position, color, speckle = false) => {
    const geometry = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segments);
    geometry.translate(...position);
    geometry.computeVertexNormals();
    setVertexColor(geometry, color, speckle);
    geometryParts[bucket].push(geometry);
    return geometry;
  };
  // Optional yaw = [radians, pivotX, pivotZ]: turn the piece about a pivot so four settings are not clones of each other.
  const placeBox = (geometry, position, yaw) => {
    if (yaw) {
      geometry.translate(position[0] - yaw[1], position[1], position[2] - yaw[2]);
      geometry.rotateY(yaw[0]);
      geometry.translate(yaw[1], 0, yaw[2]);
    } else geometry.translate(...position);
  };
  const addBox = (bucket, size, position, color, yaw) => {
    const geometry = new THREE.BoxGeometry(...size);
    placeBox(geometry, position, yaw);
    setVertexColor(geometry, color);
    geometryParts[bucket].push(geometry);
    return geometry;
  };
  const TABLEWARE = Object.freeze({
    plateDiameter: 0.270, plateHeight: 0.014,
    bowlDiameter: 0.160, bowlHeight: 0.070,
    wineDiameter: 0.088, wineHeight: 0.100,
    waterDiameter: 0.072, waterHeight: 0.082,
    edgeClearance: 0.060,
    accentDiameter: 0.190, accentHeight: 0.012,
  });
  const plateRadius = TABLEWARE.plateDiameter / 2, bowlRadius = TABLEWARE.bowlDiameter / 2;
  const wineRadius = TABLEWARE.wineDiameter / 2, waterRadius = TABLEWARE.waterDiameter / 2;
  const plateProfile = [[0, 0], [plateRadius * 0.63, 0], [plateRadius * 0.78, 0.001], [plateRadius * 0.88, 0.003], [plateRadius * 0.96, TABLEWARE.plateHeight * 0.71], [plateRadius, TABLEWARE.plateHeight], [plateRadius * 0.97, TABLEWARE.plateHeight * 0.93], [plateRadius * 0.88, TABLEWARE.plateHeight * 0.64], [plateRadius * 0.78, TABLEWARE.plateHeight * 0.43], [plateRadius * 0.63, TABLEWARE.plateHeight * 0.36], [0, TABLEWARE.plateHeight * 0.36]];
  const bowlProfile = [[0, 0], [bowlRadius * 0.55, 0], [bowlRadius * 0.75, 0.006], [bowlRadius * 0.875, 0.018], [bowlRadius * 0.963, TABLEWARE.bowlHeight * 0.76], [bowlRadius, TABLEWARE.bowlHeight * 0.96], [bowlRadius * 0.95, TABLEWARE.bowlHeight], [bowlRadius * 0.888, TABLEWARE.bowlHeight * 0.853], [bowlRadius * 0.763, TABLEWARE.bowlHeight * 0.4], [bowlRadius * 0.625, 0.014], [0, 0.014]];
  const wineProfile = [[0, 0.001], [wineRadius * 0.59, 0.001], [wineRadius * 0.77, 0.006], [wineRadius * 0.89, 0.019], [wineRadius, TABLEWARE.wineHeight * 0.55], [wineRadius * 0.977, TABLEWARE.wineHeight * 0.80], [wineRadius * 0.91, TABLEWARE.wineHeight * 0.96], [wineRadius * 0.82, TABLEWARE.wineHeight], [wineRadius * 0.75, TABLEWARE.wineHeight * 0.97], [wineRadius * 0.80, TABLEWARE.wineHeight * 0.78], [wineRadius * 0.77, TABLEWARE.wineHeight * 0.55], [wineRadius * 0.66, 0.025], [wineRadius * 0.50, 0.011], [0, 0.011]];
  const waterProfile = [[0, 0.001], [waterRadius * 0.64, 0.001], [waterRadius * 0.83, 0.004], [waterRadius * 0.97, 0.012], [waterRadius, TABLEWARE.waterHeight * 0.78], [waterRadius * 0.97, TABLEWARE.waterHeight * 0.976], [waterRadius * 0.89, TABLEWARE.waterHeight], [waterRadius * 0.83, TABLEWARE.waterHeight * 0.951], [waterRadius * 0.83, 0.012], [waterRadius * 0.67, 0.008], [0, 0.008]];
  // Bay Area table: a smaller matte-glazed plate (sage and terracotta, diagonal pairs) between the oatmeal dinner plate and the speckled bowl.
  const accentRadius = TABLEWARE.accentDiameter / 2;
  const accentProfile = [[0, 0], [accentRadius * 0.6, 0], [accentRadius * 0.78, 0.001], [accentRadius * 0.9, 0.003], [accentRadius * 0.97, TABLEWARE.accentHeight * 0.7], [accentRadius, TABLEWARE.accentHeight], [accentRadius * 0.96, TABLEWARE.accentHeight * 0.92], [accentRadius * 0.85, TABLEWARE.accentHeight * 0.55], [accentRadius * 0.6, TABLEWARE.accentHeight * 0.38], [0, TABLEWARE.accentHeight * 0.38]];
  const ACCENT_COLORS = [0x777f63, 0x9a6a50, 0x9a6a50, 0x777f63];
  const NAPKIN_YAW = [-2.5, 1.8, 3.2, -1.2];
  const NAPKIN_HEM = [true, false, true, true];
  const NAPKIN_COLOR = 0xdacfba, LINEN_COLOR = 0xcdbfa7;
  const addLinenBox = (size, position, color, yaw) => addBox("linen", size, position, color, yaw);
  const settingGeometryRanges = [];
  // Glasses are set by hand, not in matching rows (Paul 2026-10-29: two glasses per seat in identical positions looked staged): each seat has its
  // own offsets, one water glass is a shorter tumbler, one wine glass is stemless-short, fill levels differ and one water glass is empty.
  const GLASS_LAYOUT = [
    // Paul 2026-10-31: the water glasses of facing seats met near the table's centre line (z 0.5) and overlapped (window end ~39 mm, far end
    // ~51 mm). The window-end pair is now two ceramic mugs of orange juice in different glazes; the far-end glasses moved apart. The test
    // asserts that no two drink footprints overlap (>= 15 mm clear).
    { wine: [0.214, 0.147], water: [0.31, 0.19], wineScale: 1, waterScale: 1, wineFill: 0.46, waterFill: 0.52, mug: { body: 0x1f4a38, band: null, name: "green" } },
    { wine: [0.192, 0.160], water: [0.30, 0.20], wineScale: 1, waterScale: 0.82, wineFill: 0.38, waterFill: 0.60 },
    { wine: [0.230, 0.140], water: [0.33, 0.18], wineScale: 0.9, waterScale: 1, wineFill: 0.55, waterFill: 0, mug: { body: 0xeee6d5, band: 0x3f6b55, name: "cream" } },
    { wine: [0.204, 0.152], water: [0.30, 0.20], wineScale: 1, waterScale: 0.9, wineFill: 0.42, waterFill: 0.48 },
  ];
  const MUG = { radius: 0.040, profile: [[0, 0.006], [0.0365, 0.007], [0.0365, 0.093], [0.0372, 0.0948], [0.0388, 0.0952], [0.0399, 0.0935], [0.040, 0.010], [0.0395, 0.004], [0.037, 0], [0, 0]] };
  const scaleAboutBase = (geometry, factor, baseY) => { geometry.translate(0, -baseY, 0); geometry.scale(1, factor, 1); geometry.translate(0, baseY, 0); };

  for (const [index, chair] of DINING_CHAIR_PLACEMENTS.entries()) {
    const partStarts = Object.fromEntries(Object.entries(geometryParts).map(([kind, parts]) => [kind, parts.length]));
    const x = chair.x;
    const z = chair.z < 0
      ? tabletopBounds.min.z + plateRadius + TABLEWARE.edgeClearance
      : tabletopBounds.max.z - plateRadius - TABLEWARE.edgeClearance;
    const tableY = tableYAt(x, z);
    const outward = Math.sign(x);
    const inward = z < 0.5 ? 1 : -1;
    const plateCenter = [x, tableY, z];
    const plateGeometry = addLathe("ceramic", plateProfile, 24, plateCenter, 0xe3dacb);
    const plateTopRay = new THREE.Raycaster(new THREE.Vector3(x, tableY + 0.025, z), down);
    const plateTop = plateTopRay.intersectObject(new THREE.Mesh(plateGeometry), false)[0]?.point.y;
    if (plateTop == null) throw new Error(`Cannot measure plate support for ${chair.x}, ${chair.z}`);
    const accentGeometry = addLathe("ceramic", accentProfile, 24, [x, plateTop, z], ACCENT_COLORS[index]);
    const accentTop = new THREE.Raycaster(new THREE.Vector3(x, plateTop + 0.025, z), down).intersectObject(new THREE.Mesh(accentGeometry), false)[0]?.point.y;
    if (accentTop == null) throw new Error(`Cannot measure accent plate support for ${chair.x}, ${chair.z}`);
    const bowlGeometry = addLathe("ceramic", bowlProfile, 24, [x, accentTop, z], 0xd8ccb6, true);
    // Glasses sit just inside each setting; this keeps the lemon bowl clear while preserving the 60 mm plate margin.
    const layout = GLASS_LAYOUT[index];
    const wine = [x + outward * layout.wine[0], tableY + 0.001, z + inward * layout.wine[1]];
    const water = [x + outward * layout.water[0], tableY + 0.001, z + inward * layout.water[1]];
    wine[1] = tableY;
    water[1] = tableY;
    const wineGeometry = addLathe("glass", wineProfile, 20, wine, 0xe8f0ed);
    let waterGeometry, cupRadius = waterRadius;
    if (layout.mug) {
      // Generic coffee-house ceramic mug (no logo or wordmark): 80 mm across, 95 mm tall, 3.5 mm wall, rolled rim, 6 mm foot, a loop handle
      // facing the table end. Holds orange juice 15 mm below the rim.
      cupRadius = MUG.radius;
      waterGeometry = addLathe("ceramic", MUG.profile, 32, water, layout.mug.body);
      const colours = waterGeometry.attributes.color, position = waterGeometry.attributes.position, tint = new THREE.Color();
      for (let i = 0; i < position.count; i++) {
        const local = position.getY(i) - tableY, radial = Math.hypot(position.getX(i) - water[0], position.getZ(i) - water[2]);
        tint.set(layout.mug.body);
        if (layout.mug.band && radial > MUG.radius - 0.001 && local > 0.056 && local < 0.068) tint.set(layout.mug.band);
        if (radial < MUG.radius - 0.003 && local < 0.093) tint.multiplyScalar(layout.mug.band ? 1 : 1.12); // glaze reads a touch lighter inside
        if (local < 0.004) tint.set(0xcdbfa6); // unglazed foot ring
        tint.toArray(colours.array, i * 3);
      }
      const handle = new THREE.TorusGeometry(0.024, 0.0058, 10, 20, Math.PI);
      handle.rotateZ(-Math.PI / 2); // arc bulges toward +x
      handle.scale(0.9, 1.1, 1);
      if (outward < 0) handle.rotateY(Math.PI);
      handle.translate(water[0] + outward * (MUG.radius - 0.0025), tableY + 0.050, water[2]);
      setVertexColor(handle, layout.mug.body);
      geometryParts.ceramic.push(handle);
      const juice = new THREE.CylinderGeometry(MUG.radius - 0.0037, MUG.radius - 0.0037, 0.001, 32, 1, false);
      juice.translate(water[0], tableY + 0.080, water[2]);
      setVertexColor(juice, 0xe8881f);
      geometryParts.liquid.push(juice);
    } else {
      waterGeometry = addLathe("glass", waterProfile, 20, water, 0xe8f0ed);
      if (layout.waterScale !== 1) scaleAboutBase(waterGeometry, layout.waterScale, tableY);
    }
    if (layout.wineScale !== 1) scaleAboutBase(wineGeometry, layout.wineScale, tableY);
    const wineLiquid = new THREE.CylinderGeometry(0.031, 0.031, 0.0015, 20, 1, false);
    wineLiquid.translate(wine[0], tableY + 0.001 + TABLEWARE.wineHeight * layout.wineScale * layout.wineFill, wine[2]);
    setVertexColor(wineLiquid, 0x5c1823);
    geometryParts.liquid.push(wineLiquid);
    if (layout.waterFill > 0 && !layout.mug) {
      const waterLiquid = new THREE.CylinderGeometry(0.026, 0.026, 0.001, 20, 1, false);
      waterLiquid.translate(water[0], tableY + 0.001 + TABLEWARE.waterHeight * layout.waterScale * layout.waterFill, water[2]);
      setVertexColor(waterLiquid, 0xdbe7e5);
      geometryParts.liquid.push(waterLiquid);
    }

    // Folded linen napkin beside each plate (one hem fold on three of them); the fork rests on it, the knife on the table.
    const yaw = NAPKIN_YAW[index] * Math.PI / 180;
    const cutleryZ = z + inward * 0.015;
    const forkX = x - outward * 0.19, knifeX = x + outward * 0.19;
    const napkinX = forkX - outward * 0.012;
    const napkinThickness = 0.004;
    const napkinGeometry = addLinenBox([0.100, napkinThickness, 0.190], [napkinX, tableY + napkinThickness / 2, cutleryZ], NAPKIN_COLOR, [yaw, napkinX, cutleryZ]);
    if (NAPKIN_HEM[index]) addLinenBox([0.100, 0.0025, 0.040], [napkinX, tableY + napkinThickness + 0.00125, cutleryZ + inward * 0.075], 0xcfc3ac, [yaw, napkinX, cutleryZ]);
    // Four-piece fork on the napkin (0.2 mm embedded so it reads as resting) and a rounded table knife. Brushed stainless, one merged mesh.
    const forkY = tableY + napkinThickness + 0.0013, forkYaw = [yaw * 0.5, forkX, cutleryZ];
    const forkHandle = addBox("metal", [0.010, 0.003, 0.105], [forkX, forkY, cutleryZ], 0xaeb0ad, forkYaw);
    for (let tine = 0; tine < 4; tine++) addBox("metal", [0.003, 0.003, 0.028], [forkX + (tine - 1.5) * 0.004, forkY, cutleryZ - inward * 0.063], 0xaeb0ad, forkYaw);
    addBox("metal", [0.013, 0.004, 0.067], [knifeX, tableY + 0.002, cutleryZ + inward * 0.019], 0xaeb0ad, [-yaw * 0.4, knifeX, cutleryZ]);
    addBox("metal", [0.008, 0.003, 0.038], [knifeX, tableY + 0.002, cutleryZ - inward * 0.034], 0xa5a7a4, [-yaw * 0.4, knifeX, cutleryZ]);

    const plateEdge = {
      left: x - plateRadius - tabletopBounds.min.x,
      right: tabletopBounds.max.x - x - plateRadius,
      front: z - plateRadius - tabletopBounds.min.z,
      back: tabletopBounds.max.z - z - plateRadius,
    };
    const edgeClearanceMm = Math.round(Math.min(...Object.values(plateEdge)) * 1000);
    plateGeometry.computeBoundingBox(); bowlGeometry.computeBoundingBox();
    const plateTableGapMm = Math.round((plateGeometry.boundingBox.min.y - tableY) * 1000);
    const bowlPlateGapMm = Math.round((bowlGeometry.boundingBox.min.y - accentTop) * 1000);
    accentGeometry.computeBoundingBox(); napkinGeometry.computeBoundingBox(); forkHandle.computeBoundingBox();
    const accentPlateGapMm = Math.round((accentGeometry.boundingBox.min.y - plateTop) * 1000);
    const napkinTableGapMm = Math.round((napkinGeometry.boundingBox.min.y - tableY) * 1000);
    const forkNapkinGapMm = Number(((forkHandle.boundingBox.min.y - (tableY + napkinThickness)) * 1000).toFixed(1));
    wineGeometry.computeBoundingBox(); waterGeometry.computeBoundingBox();
    const wineTableGapMm = Math.round((wineGeometry.boundingBox.min.y - tableY) * 1000);
    const waterTableGapMm = Math.round((waterGeometry.boundingBox.min.y - tableY) * 1000);
    const settingBounds = new THREE.Box3().makeEmpty();
    for (const [kind, parts] of Object.entries(geometryParts)) {
      for (const geometry of parts.slice(partStarts[kind])) {
        geometry.computeBoundingBox();
        settingBounds.union(geometry.boundingBox);
      }
    }
    settingGeometryRanges.push({ min: settingBounds.min.toArray(), max: settingBounds.max.toArray() });
    settings.push({
      chair: `room03-dining-chair-${chair.x}-${chair.z}`,
      tableY, plateCenter, wineCenter: wine, waterCenter: water, cup: layout.mug ? { kind: "mug", glaze: layout.mug.name, color: `#${new THREE.Color(layout.mug.body).getHexString()}`, radiusMm: cupRadius * 1000, handleMm: 30, juice: true } : { kind: "water-glass", radiusMm: cupRadius * 1000 },
      plateDiameterMm: TABLEWARE.plateDiameter * 1000, bowlDiameterMm: TABLEWARE.bowlDiameter * 1000, bowlHeightMm: TABLEWARE.bowlHeight * 1000,
      plateTableGapMm, bowlPlateGapMm, accentPlateGapMm, napkinTableGapMm, forkNapkinGapMm,
      wineTableGapMm, waterTableGapMm,
      edgeClearanceMm,
      lemonClearanceMm: null,
      tableEdgeMm: Object.fromEntries(Object.entries(plateEdge).map(([key, value]) => [key, Math.round(value * 1000)])),
    });
  }
  // ---- Centre of the table (dinner and Thanksgiving only): linen runner, stoneware pitcher, bread on a board ----
  // The lemon bowl sits on the runner (centred on the table, z 0.5). Each piece is measured to the millimetre and reported in userData.extras.
  const extraBoxes = {};
  const keepBox = (name, geometry) => { geometry.computeBoundingBox(); extraBoxes[name] = geometry.boundingBox.clone(); return geometry; };
  const CENTRE_Z = 0.5, RUNNER = { length: 1.24, width: 0.22, thickness: 0.0012 };
  const runnerBaseY = tableYAt(0, CENTRE_Z);
  const runnerTop = runnerBaseY + RUNNER.thickness;
  keepBox("runner", addLinenBox([RUNNER.length, RUNNER.thickness, RUNNER.width], [0, runnerBaseY + RUNNER.thickness / 2, CENTRE_Z], LINEN_COLOR));
  const PITCHER_X = 0.51;
  const pitcherProfile = [[0, 0], [0.040, 0], [0.048, 0.004], [0.054, 0.050], [0.050, 0.100], [0.039, 0.145], [0.037, 0.168], [0.042, 0.180], [0.040, 0.181], [0.035, 0.170], [0.036, 0.146], [0.046, 0.100], [0.050, 0.050], [0, 0.022]];
  keepBox("pitcher", addLathe("ceramic", pitcherProfile, 24, [PITCHER_X, runnerTop, CENTRE_Z], 0xe9e1d2, true));
  const handleCurve = new THREE.CatmullRomCurve3([[0.038, 0.152], [0.074, 0.145], [0.084, 0.108], [0.072, 0.070], [0.050, 0.052]].map(([dx, dy]) => new THREE.Vector3(PITCHER_X + dx, runnerTop + dy, CENTRE_Z)));
  const pitcherHandle = new THREE.TubeGeometry(handleCurve, 12, 0.0065, 6, false);
  setVertexColor(pitcherHandle, 0xe9e1d2);
  geometryParts.ceramic.push(pitcherHandle);
  extraBoxes.pitcher.union(new THREE.Box3().setFromBufferAttribute(pitcherHandle.attributes.position));
  const BOARD = { x: -0.43, length: 0.22, depth: 0.14, thickness: 0.02, radius: 0.012 };
  const boardShape = new THREE.Shape();
  {
    const hx = BOARD.length / 2 - BOARD.radius, hy = BOARD.depth / 2 - BOARD.radius, r = BOARD.radius;
    boardShape.moveTo(-hx, -hy - r); boardShape.lineTo(hx, -hy - r); boardShape.absarc(hx, -hy, r, -Math.PI / 2, 0, false);
    boardShape.lineTo(hx + r, hy); boardShape.absarc(hx, hy, r, 0, Math.PI / 2, false);
    boardShape.lineTo(-hx, hy + r); boardShape.absarc(-hx, hy, r, Math.PI / 2, Math.PI, false);
    boardShape.lineTo(-hx - r, -hy); boardShape.absarc(-hx, -hy, r, Math.PI, Math.PI * 1.5, false);
  }
  // Extrude output is non-indexed; merge vertices so it can join the indexed lathe geometry in one mesh.
  const boardRaw = new THREE.ExtrudeGeometry(boardShape, { depth: BOARD.thickness, bevelEnabled: false, curveSegments: 4 });
  const boardGeometry = mergeVertices(boardRaw);
  boardRaw.dispose();
  boardGeometry.rotateX(-Math.PI / 2);
  boardGeometry.translate(BOARD.x, runnerTop, CENTRE_Z);
  setVertexColor(boardGeometry, 0x9b7448);
  geometryParts.ceramic.push(keepBox("board", boardGeometry));
  const boardTop = runnerTop + BOARD.thickness;
  // Orange-juice carafe (Paul 2026-10-31: juice for both dinner and Thanksgiving). Clear glass bottle with a short neck and a cream cap, at the
  // window-end corner beside seat 0 (off the view axis so it does not hide a mug), clear of the knife, mugs and wine glasses (extras.juice).
  const JUICE = { x: -0.84, z: 0.30, fill: 0.150 };
  const juiceY = tableYAt(JUICE.x, JUICE.z);
  const carafeProfile = [[0, 0], [0.036, 0], [0.042, 0.005], [0.044, 0.020], [0.044, 0.150], [0.040, 0.175], [0.026, 0.198], [0.0175, 0.212], [0.016, 0.238], [0.0172, 0.242]];
  keepBox("juiceCarafe", addLathe("glass", carafeProfile, 28, [JUICE.x, juiceY, JUICE.z], 0xe8f0ed));
  // Juice as a closed solid just inside the glass (1.5 mm), so it reads as a filled volume through the glass from every angle.
  const juiceProfile = [[0, 0.003], [0.035, 0.003], [0.0405, 0.007], [0.0425, 0.020], [0.0425, JUICE.fill], [0, JUICE.fill]];
  keepBox("juice", addLathe("liquid", juiceProfile, 28, [JUICE.x, juiceY, JUICE.z], 0xe98a1c));
  const cap = new THREE.CylinderGeometry(0.0185, 0.0185, 0.016, 24, 1, false);
  cap.translate(JUICE.x, juiceY + 0.242 + 0.007, JUICE.z);
  setVertexColor(cap, 0xeee6d6);
  geometryParts.ceramic.push(keepBox("juiceCap", cap));
  const addEllipsoid = (bucket, radii, position, color, yawRad, tilt = 0) => {
    const geometry = new THREE.SphereGeometry(1, 14, 8);
    geometry.scale(...radii);
    geometry.rotateZ(tilt); geometry.rotateY(yawRad);
    geometry.translate(...position);
    setVertexColor(geometry, color);
    geometryParts[bucket].push(geometry);
    return geometry;
  };
  // A scored batard rather than a plain egg (Paul 2026-10-29: the bread and food looked flat): poles along the loaf so its ends taper, a flatter
  // underside, three slanted scoring grooves cut 4.5 mm into the crust and tinted crumb-gold, and a crust that darkens toward the board and
  // is dusted with flour on top. Same ceramic material and batch, so no extra draw call.
  const makeLoafGeometry = (radii) => {
    const geometry = new THREE.SphereGeometry(1, 28, 18);
    geometry.rotateZ(Math.PI / 2);
    const position = geometry.attributes.position;
    const colors = new Float32Array(position.count * 3);
    const crustLow = new THREE.Color(0x7d4f26), crustHigh = new THREE.Color(0xb8864a), crumb = new THREE.Color(0xe8cf9b), dust = new THREE.Color(0xd9b982);
    const tint = new THREE.Color();
    const grooves = [-0.06, 0.0, 0.06];
    for (let i = 0; i < position.count; i++) {
      const ux = position.getX(i), uy = position.getY(i), uz = position.getZ(i);
      const taper = 1 - 0.28 * Math.pow(Math.abs(ux), 3.5);
      const x = ux * radii[0], z = uz * radii[2] * taper;
      let y = uy * (uy < 0 ? 0.30 : 1) * radii[1] * (0.85 + 0.15 * taper);
      let groove = 0;
      if (y > radii[1] * 0.25) {
        for (const centre of grooves) {
          const distance = Math.abs(x - centre - 0.4 * z);
          if (distance < 0.0075) groove = Math.max(groove, 1 - (distance / 0.0075) ** 2);
        }
        y -= groove * 0.0045;
      }
      position.setXYZ(i, x, y, z);
      const height = THREE.MathUtils.clamp((y / radii[1] + 0.3) / 1.3, 0, 1);
      tint.copy(crustLow).lerp(crustHigh, height);
      const noise = Math.abs(Math.sin(x * 271.1 + z * 97.7) * 43758.5453) % 1;
      if (y > 0) tint.lerp(dust, 0.22 * noise * height);
      if (groove > 0) tint.lerp(crumb, Math.min(1, groove * 1.3));
      tint.toArray(colors, i * 3);
    }
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    return geometry;
  };
  // Loaf pressed 3 mm into the board; two slices cut off the near end, uneven on purpose.
  const loafGeometry = makeLoafGeometry([0.086, 0.036, 0.042]);
  loafGeometry.rotateY(0.14);
  loafGeometry.translate(BOARD.x - 0.020, boardTop - 0.003 + 0.30 * 0.036, CENTRE_Z - 0.004);
  geometryParts.ceramic.push(keepBox("loaf", loafGeometry));
  for (const [index, [dx, dz, yawRad]] of [[0.074, 0.020, 0.10], [0.090, -0.012, -0.18]].entries()) {
    const sliceCentre = [BOARD.x + dx, boardTop + 0.029 - 0.002, CENTRE_Z + dz];
    const tilt = 0.06 * (index ? -1 : 1);
    keepBox(`slice-${index}`, addEllipsoid("ceramic", [0.0062, 0.029, 0.034], sliceCentre, 0xa9763f, yawRad, tilt));
    addEllipsoid("ceramic", [0.0066, 0.0265, 0.0316], sliceCentre, 0xe8cf9b, yawRad, tilt); // crust ring about 2.5 mm, not a donut
  }


  // ---- Roast chicken feast (Paul 2026-10-29: a roast-chicken dinner mood; shared with Thanksgiving) ----
  // Zuni Cafe's roast chicken with bread salad is a San Francisco classic, so the platter carries a golden bird on bread-salad croutons, roasted
  // potatoes, carrots, rosemary and lemon halves. Every piece rests on the platter (2 mm embedded) and is measured; the food shares one glossy mesh.
  const PLATTER = { x: 0, z: CENTRE_Z, halfLength: 0.26, halfDepth: 0.104 };
  const platterProfile = [[0, 0], [0.064, 0], [0.088, 0.002], [0.099, 0.012], [0.103, 0.021], [0.098, 0.0205], [0.090, 0.011], [0.068, 0.0075], [0, 0.0075]];
  const platterGeometry = addLathe("ceramic", platterProfile, 28, [0, runnerTop, 0], 0xf0ebdf);
  platterGeometry.scale(PLATTER.halfLength / 0.103, 1, PLATTER.halfDepth / 0.103);
  platterGeometry.translate(PLATTER.x, 0, PLATTER.z);
  keepBox("platter", platterGeometry);
  const platterTop = runnerTop + 0.0075;
  const foodRaycaster = new THREE.Raycaster();
  const foodNoise = (x, y, z) => Math.abs(Math.sin(x * 211.3 + y * 97.1 + z * 173.9) * 43758.5453) % 1;
  const paintFood = (geometry, lowHex, highHex, { speckle = 0.18, burn = 0 } = {}) => {
    geometry.computeBoundingBox();
    const position = geometry.attributes.position;
    const low = new THREE.Color(lowHex), high = new THREE.Color(highHex), burnt = new THREE.Color(0x6a3615), tint = new THREE.Color();
    const floor = geometry.boundingBox.min.y, span = Math.max(1e-6, geometry.boundingBox.max.y - floor);
    const colors = new Float32Array(position.count * 3);
    for (let i = 0; i < position.count; i++) {
      const noise = foodNoise(position.getX(i), position.getY(i), position.getZ(i));
      tint.copy(low).lerp(high, THREE.MathUtils.clamp((position.getY(i) - floor) / span, 0, 1));
      tint.multiplyScalar(1 - speckle * noise);
      if (burn && noise > 0.8) tint.lerp(burnt, burn * (noise - 0.8) / 0.2);
      tint.toArray(colors, i * 3);
    }
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  };
  const foodItems = [];
  // Place a piece on the platter at local (x, z) so its lowest point is `embed` below the platter surface, paint it, and file it for measuring.
  const placeFood = (name, geometry, lx, lz, lowHex, highHex, options, embed = 0.002, scale = 1) => {
    if (scale !== 1) geometry.scale(scale, scale, scale);
    geometry.translate(PLATTER.x + lx, 0, PLATTER.z + lz);
    geometry.computeBoundingBox();
    geometry.translate(0, platterTop - embed - geometry.boundingBox.min.y, 0);
    paintFood(geometry, lowHex, highHex, options);
    geometry.computeBoundingBox();
    geometryParts.food.push(geometry);
    foodItems.push({ name, box: geometry.boundingBox.clone(), embed });
    return geometry;
  };
  // The bird sits in the middle of the table (Paul 2026-10-29: it looked small and off to one side), drawn 40% larger than the first version.
  // Plump breast toward -x, narrower tail toward +x, flat underside, a shallow breast-line groove, golden skin with darker edges and a few burnt flecks.
  const FS = 1.4, BX = -0.03;
  const chickenGeometry = new THREE.SphereGeometry(1, 30, 20);
  {
    const position = chickenGeometry.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const ux = position.getX(i), uy = position.getY(i), uz = position.getZ(i);
      const taper = ux > 0 ? 1 - 0.34 * ux * ux : 1 - 0.05 * ux * ux;
      let y = uy * (uy < 0 ? 0.30 : 1) * 0.052 * (0.9 + 0.1 * taper);
      if (uy > 0) y += 0.010 * Math.exp(-((ux + 0.32) ** 2) / 0.11) * uy - 0.0035 * Math.exp(-(uz * uz) / 0.012) * uy;
      position.setXYZ(i, ux * 0.085, y, uz * 0.057 * taper);
    }
    chickenGeometry.computeVertexNormals();
  }
  chickenGeometry.rotateY(0.07);
  placeFood("chicken", chickenGeometry, BX, 0, 0xa95f26, 0xe0a85a, { speckle: 0.22, burn: 0.75 }, 0.002, FS);
  const chickenMesh = new THREE.Mesh(chickenGeometry);
  const chickenTopAt = (x, z) => {
    foodRaycaster.set(new THREE.Vector3(x, platterTop + 0.2, z), down);
    return foodRaycaster.intersectObject(chickenMesh, false)[0]?.point.y ?? platterTop;
  };
  // Two crossed drumsticks at the tail, with bone ends; the second sits higher so the cross reads.
  const legUp = new THREE.Vector3(0, 1, 0);
  [[-0.034, 1, 0], [0.034, -1, 0.010]].forEach(([baseZ, side, lift], index) => {
    const direction = new THREE.Vector3(0.9, 0.26, 0.62 * side).normalize();
    const matrix = new THREE.Matrix4().compose(new THREE.Vector3(0.050, 0.020 + lift, baseZ), new THREE.Quaternion().setFromUnitVectors(legUp, direction), new THREE.Vector3(1, 1, 1));
    const meat = new THREE.CylinderGeometry(0.0105, 0.0195, 0.078, 10); meat.translate(0, 0.039, 0);
    const bone = new THREE.CylinderGeometry(0.0055, 0.0065, 0.024, 8); bone.translate(0, 0.078 + 0.012, 0);
    const knob = new THREE.SphereGeometry(0.0088, 8, 6); knob.translate(0, 0.078 + 0.026, 0);
    for (const [part, low, high, opts] of [[meat, 0xa8602a, 0xdca058, { speckle: 0.2, burn: 0.7 }], [bone, 0xe6dac2, 0xf1e8d4, { speckle: 0.05 }], [knob, 0xe6dac2, 0xf1e8d4, { speckle: 0.05 }]]) {
      part.applyMatrix4(matrix);
      part.scale(FS, FS, FS);
      part.translate(PLATTER.x + BX, 0, PLATTER.z);
      paintFood(part, low, high, opts);
      part.computeBoundingBox();
      geometryParts.food.push(part);
    }
    // The leg's lowest point is the thick end: sink the whole leg so it touches the platter (same rule as every other piece).
    const legParts = geometryParts.food.slice(-3);
    const legBox = new THREE.Box3().makeEmpty();
    legParts.forEach((part) => legBox.union(part.boundingBox));
    const drop = platterTop - 0.002 - legBox.min.y;
    const raise = index ? 0.011 : 0;
    legParts.forEach((part) => { part.translate(0, drop + raise, 0); part.computeBoundingBox(); });
    const finalBox = new THREE.Box3().makeEmpty();
    legParts.forEach((part) => finalBox.union(part.boundingBox));
    foodItems.push({ name: `drumstick-${index}`, box: finalBox, embed: index ? -0.009 : 0.002 });
  });
  // Wings tucked against the flanks.
  for (const side of [-1, 1]) {
    const wing = new THREE.SphereGeometry(1, 10, 6);
    wing.scale(0.034, 0.013, 0.017); wing.rotateY(side * 0.45);
    placeFood(`wing-${side}`, wing, BX - 0.023 * FS, side * 0.042 * FS, 0xa35a24, 0xd6974d, { speckle: 0.2, burn: 0.8 }, 0.001, FS);
  }
  // Roasted potatoes and carrots along the two long sides, lemon halves at the tail end.
  [[-0.120, 0.076, 0.017, 0.012, 0.014, 0.4], [0.060, 0.076, 0.018, 0.013, 0.015, -0.3], [-0.070, -0.076, 0.016, 0.012, 0.014, 1.1], [0.110, -0.076, 0.018, 0.012, 0.014, 0.7]].forEach(([lx, lz, rx, ry, rz, yaw], index) => {
    const potato = new THREE.SphereGeometry(1, 10, 7);
    potato.scale(rx, ry, rz); potato.rotateY(yaw);
    placeFood(`potato-${index}`, potato, lx, lz, 0xb9792f, 0xe0ad5e, { speckle: 0.24, burn: 0.85 });
  });
  [[0.0, 0.078, 0.0], [0.02, -0.078, 0.05], [-0.165, -0.060, 0.15]].forEach(([lx, lz, yaw], index) => {
    const carrot = new THREE.CylinderGeometry(0.0050, 0.0075, 0.074, 8);
    carrot.rotateZ(Math.PI / 2); carrot.rotateY(yaw);
    placeFood(`carrot-${index}`, carrot, lx, lz, 0xb8591d, 0xdb8035, { speckle: 0.16, burn: 0.4 });
  });
  [[0.212, 0.050, 0.3], [0.212, -0.050, -0.5]].forEach(([lx, lz, yaw], index) => {
    const half = new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    half.scale(0.019, 0.015, 0.0165);
    const face = new THREE.CircleGeometry(1, 10); face.rotateX(-Math.PI / 2); face.scale(0.0185, 1, 0.016); face.translate(0, 0.0004, 0);
    const lemonPieces = [half, face]; lemonPieces.forEach((piece) => piece.rotateY(yaw));
    const [rind, flesh] = lemonPieces;
    placeFood(`lemon-half-${index}`, rind, lx, lz, 0xc99a2e, 0xdcb445, { speckle: 0.1 });
    placeFood(`lemon-face-${index}`, flesh, lx, lz, 0xf1de93, 0xf1de93, { speckle: 0.06 }, 0.0002);
    foodItems.pop(); // the face is part of the half: it was placed relative to its own bottom, re-seat it on the rind rim below
    const rindBox = foodItems[foodItems.length - 1].box;
    flesh.translate(0, rindBox.max.y + 0.0004 - flesh.boundingBox.min.y, 0);
    flesh.computeBoundingBox();
  });
  // Bread-salad croutons and a few arugula leaves at the left end (Zuni's bread salad nod).
  [[-0.218, -0.030, 0.014, 0.4], [-0.203, 0.004, 0.015, -0.6], [-0.218, 0.034, 0.013, 1.0], [-0.193, -0.036, 0.012, 0.2], [-0.206, 0.022, 0.011, 0.9]].forEach(([lx, lz, size, yaw], index) => {
    const cube = new THREE.BoxGeometry(size, size * 0.8, size);
    cube.rotateY(yaw); cube.rotateZ(0.05 * (index % 2 ? 1 : -1));
    placeFood(`crouton-${index}`, cube, lx, lz, 0x9a6a31, 0xcfa062, { speckle: 0.3, burn: 0.5 });
  });
  [[-0.198, 0.012, 0.013, 0.5], [-0.210, -0.012, 0.012, -0.8]].forEach(([lx, lz, size, yaw], index) => {
    const leaf = new THREE.SphereGeometry(1, 8, 5);
    leaf.scale(size, 0.0025, size * 0.45); leaf.rotateY(yaw);
    // Leaves lie on top of the croutons (about 12-16 mm above the platter), so they are measured as lifted pieces.
    placeFood(`arugula-${index}`, leaf, lx, lz, 0x4f6a34, 0x7b9150, { speckle: 0.2 }, -(0.012 + index * 0.004));
    foodItems[foodItems.length - 1].lifted = true;
  });
  // Rosemary sprigs laid on the breast: a thin stem and a few needle-like leaves each, resting on the skin (offsets from the bird's centre).
  [[-0.038, -0.014, 0.35], [-0.018, 0.016, -0.5], [0.002, -0.006, 0.9], [0.024, 0.020, -0.2]].forEach(([dx, dz, yaw]) => {
    const worldX = PLATTER.x + BX + dx * FS, worldZ = PLATTER.z + dz * FS;
    const topY = chickenTopAt(worldX, worldZ);
    const parts = [new THREE.CylinderGeometry(0.0009, 0.0013, 0.052, 5).rotateZ(Math.PI / 2)];
    for (let needle = 0; needle < 5; needle++) {
      const blade = new THREE.SphereGeometry(1, 5, 3);
      blade.scale(0.0075, 0.0011, 0.0016);
      blade.rotateY(needle % 2 ? 0.7 : -0.7);
      blade.translate(-0.020 + needle * 0.0095, 0, 0);
      parts.push(blade);
    }
    parts.forEach((part) => {
      part.rotateY(yaw);
      part.scale(FS, FS, FS);
      part.translate(worldX, topY + 0.0016, worldZ);
      paintFood(part, 0x55663a, 0x6f8248, { speckle: 0.22 });
      part.computeBoundingBox();
      geometryParts.food.push(part);
    });
  });

  const materials = {
    ceramic: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.84, vertexColors: true }),
    food: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.46, vertexColors: true }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.18, transparent: true, opacity: 0.30, depthWrite: false, vertexColors: true }),
    liquid: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.22, transparent: true, opacity: 0.78, depthWrite: false, vertexColors: true }),
    metal: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.38, metalness: 0.48, vertexColors: true }),
    linen: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.96, map: makeLinenTexture(), vertexColors: true }),
  };
  const renderOrder = { liquid: 1, glass: 2, ceramic: 3, metal: 3, linen: 3, food: 3 };
  let vertices = 0;
  for (const [kind, parts] of Object.entries(geometryParts)) {
    if (kind === "linen") {
      // Planar weave mapping in world metres (one 128 px tile per 25 cm) so runner and napkins share one weave scale.
      for (const part of parts) {
        const position = part.attributes.position;
        const uv = new Float32Array(position.count * 2);
        for (let i = 0; i < position.count; i++) { uv[i * 2] = position.getX(i) * 4; uv[i * 2 + 1] = position.getZ(i) * 4; }
        part.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
      }
    }
    // Dinner retains the original roast chicken. Thanksgiving swaps the food geometry in the same mesh (no extra draw call) for a
    // roast turkey after the reference board (concept A): crowned breast with a breastbone ridge, thigh bulges, knobbly drumsticks with
    // bone tips, wings tucked to the flanks, and apple wedges, acorn-squash crescents, cranberries and rosemary/thyme sprigs around it.
    // Every piece is seated by raycast (wings against the body, garnish onto the platter, herbs onto the skin) and recorded in turkeyFit.
    let turkeyGeometry = null;
    if (kind === "food") {
      const T = { x: PLATTER.x + BX, z: PLATTER.z };
      const turkeyParts = [], turkeyFit = [];
      const tint = new THREE.Color();
      const roastPaint = (geometry, { deep = 0x7c3c14, gold = 0xc77b34, light = 0xeab36a, crown = 0.6 } = {}) => {
        geometry.computeBoundingBox();
        const position = geometry.attributes.position, colors = new Float32Array(position.count * 3);
        const floor = geometry.boundingBox.min.y, span = Math.max(1e-6, geometry.boundingBox.max.y - floor);
        const cDeep = new THREE.Color(deep), cGold = new THREE.Color(gold), cLight = new THREE.Color(light);
        for (let i = 0; i < position.count; i++) {
          const x = position.getX(i), y = position.getY(i), z = position.getZ(i);
          const h = THREE.MathUtils.clamp((y - floor) / span, 0, 1), n = foodNoise(x, y, z), mottle = 0.5 + 0.25 * Math.sin(x * 160 + z * 90) + 0.25 * Math.sin(z * 210 - y * 130);
          tint.copy(cGold).lerp(cDeep, THREE.MathUtils.clamp(crown * h * h + 0.35 * mottle - 0.15 + (h < 0.18 ? 0.25 : 0), 0, 1));
          if (n > 0.9 && h > 0.35) tint.lerp(cLight, 0.55);
          else tint.multiplyScalar(1 - 0.12 * n);
          tint.toArray(colors, i * 3);
        }
        geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
        return geometry;
      };
      const flatPaint = (geometry, colourAt) => {
        const position = geometry.attributes.position, colors = new Float32Array(position.count * 3);
        for (let i = 0; i < position.count; i++) { tint.set(colourAt(position.getX(i), position.getY(i), position.getZ(i), foodNoise(position.getX(i), position.getY(i), position.getZ(i)))).toArray(colors, i * 3); }
        geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
        return geometry;
      };
      // Platter probe (same lathe as the ceramic platter) so garnish is seated on the real dished surface.
      const probeGeometry = new THREE.LatheGeometry(platterProfile.map(([r, y]) => new THREE.Vector2(r, y)), 48);
      probeGeometry.scale(PLATTER.halfLength / 0.103, 1, PLATTER.halfDepth / 0.103);
      probeGeometry.translate(PLATTER.x, runnerTop, PLATTER.z);
      const platterProbe = new THREE.Mesh(probeGeometry, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
      const seatRay = new THREE.Raycaster(), seatPoint = new THREE.Vector3();
      // Slide a piece along `dir` from 15 cm back until its first vertex meets one of `targets`, then push it `embed` metres in.
      const seat = (name, geometry, dir, targets, embed = 0.0005) => {
        geometry.translate(-dir.x * 0.15, -dir.y * 0.15, -dir.z * 0.15);
        const position = geometry.attributes.position;
        let travel = Infinity;
        for (let i = 0; i < position.count; i++) {
          seatPoint.fromBufferAttribute(position, i);
          seatRay.set(seatPoint, dir); seatRay.far = 0.4;
          const hit = seatRay.intersectObjects(targets, false)[0];
          if (hit) travel = Math.min(travel, hit.distance);
        }
        if (!Number.isFinite(travel)) throw new Error(`Turkey piece ${name} found nothing to rest on`);
        geometry.translate(dir.x * (travel + embed), dir.y * (travel + embed), dir.z * (travel + embed));
        turkeyFit.push({ name, embedMm: Number((embed * 1000).toFixed(1)) });
        return geometry;
      };
      const down = new THREE.Vector3(0, -1, 0);
      // Body: one high-segment form. Flattened underside, rounded crown with a soft breastbone ridge and two breast lobes,
      // narrower at the neck end (-x) than at the cavity/leg end (+x).
      const body = new THREE.SphereGeometry(1, 56, 36);
      const bodyPos = body.attributes.position;
      for (let i = 0; i < bodyPos.count; i++) {
        const ux = bodyPos.getX(i), uy = bodyPos.getY(i), uz = bodyPos.getZ(i);
        const width = 0.065 * (1 - 0.16 * (ux < 0 ? ux * ux : 0.4 * ux * ux));
        let y = uy < 0 ? uy * 0.018 : uy * 0.074 * (1 - 0.22 * ux * ux);
        if (uy > 0) y += uy * uy * (0.007 * Math.exp(-(uz * uz) / 0.012) + 0.006 * Math.exp(-((Math.abs(uz) - 0.42) ** 2) / 0.05)) * (1 - 0.5 * ux * ux);
        y += uy > 0 ? 0.0009 * Math.sin(ux * 23 + uz * 11) * Math.sin(uz * 17 - ux * 5) * uy : 0;
        bodyPos.setXYZ(i, ux * 0.122, y, uz * width);
      }
      body.translate(T.x, 0, T.z);
      body.computeBoundingBox();
      body.translate(0, platterTop - 0.0015 - body.boundingBox.min.y, 0);
      body.computeVertexNormals();
      turkeyFit.push({ name: "body", embedMm: 1.5 });
      const bodyTop = body.boundingBox.max.y + (platterTop - 0.0015 - body.boundingBox.min.y);
      const bodyMesh = new THREE.Mesh(body);
      bodyMesh.updateMatrixWorld(true);
      turkeyParts.push(roastPaint(body, { crown: 0.75 }));
      const bodyCentreY = platterTop + 0.035;
      // Thighs: rounded bulges where the legs meet the body (part of the same skin, so they overlap the body by design).
      const legEnds = [];
      for (const side of [-1, 1]) {
        const thigh = new THREE.SphereGeometry(1, 24, 16);
        thigh.scale(0.046, 0.034, 0.030); thigh.rotateY(side * -0.35); thigh.rotateZ(0.35);
        thigh.translate(T.x + 0.062, bodyCentreY + 0.006, T.z + side * 0.050);
        turkeyParts.push(roastPaint(thigh, { crown: 0.5 }));
        // Drumstick: fleshy, knobbly lathe rising up and back from the thigh, ending in a knuckle and a pale bone tip.
        const dir = new THREE.Vector3(0.62, 0.70, side * 0.26).normalize();
        const origin = new THREE.Vector3(T.x + 0.088, bodyCentreY + 0.012, T.z + side * 0.056);
        const profile = [[0, 0], [0.016, 0.002], [0.023, 0.014], [0.0245, 0.030], [0.022, 0.046], [0.016, 0.060], [0.0105, 0.072], [0.0085, 0.080], [0.0105, 0.086], [0.0115, 0.091], [0.008, 0.096], [0, 0.098]];
        const leg = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 24, 0, Math.PI * 2);
        const legPos = leg.attributes.position;
        for (let i = 0; i < legPos.count; i++) {
          const y = legPos.getY(i), a = Math.atan2(legPos.getZ(i), legPos.getX(i)), bump = y > 0.008 && y < 0.07 ? 1 + 0.06 * Math.sin(a * 3 + y * 90) : 1;
          legPos.setXYZ(i, legPos.getX(i) * bump, y, legPos.getZ(i) * bump);
        }
        leg.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir));
        leg.translate(origin.x, origin.y, origin.z);
        roastPaint(leg, { crown: 0.85, deep: 0x6e3412 });
        // Knuckle and bone tip turn pale where the skin pulls back.
        const legColors = leg.attributes.color, p = new THREE.Vector3();
        for (let i = 0; i < legPos.count; i++) { p.fromBufferAttribute(legPos, i).sub(origin); if (p.dot(dir) > 0.083) new THREE.Color(0xe6d6b4).lerp(new THREE.Color(0xcdb893), foodNoise(p.x, p.y, p.z)).toArray(legColors.array, i * 3); }
        turkeyParts.push(leg);
        legEnds.push([origin.clone(), origin.clone().addScaledVector(dir, 0.098)]);
      }
      // Wings tucked flat against each flank, seated sideways onto the body with a 1.5 mm embed (no longer buried in the breast).
      for (const side of [-1, 1]) {
        const wing = new THREE.SphereGeometry(1, 20, 12);
        const wingPos = wing.attributes.position;
        for (let i = 0; i < wingPos.count; i++) { const ux = wingPos.getX(i); wingPos.setX(i, ux * (ux > 0 ? 1 : 0.8)); }
        wing.scale(0.048, 0.020, 0.011);
        wing.rotateZ(-0.35); wing.rotateY(side * 0.12); wing.rotateX(side * -0.25);
        wing.translate(T.x - 0.035, bodyCentreY + 0.004, T.z);
        seat(`wing-${side}`, wing, new THREE.Vector3(0, 0, -side), [bodyMesh], 0.0015);
        turkeyParts.push(roastPaint(wing, { crown: 0.9, deep: 0x6a3110 }));
      }
      // Garnish ring: apple wedges, acorn-squash crescents, cranberry clusters and rosemary/thyme sprigs on clear spots of the platter,
      // each footprint kept off the bird, the legs and every other piece; all inside the platter's flat well.
      const footprints = [];
      const bodyClear = (x, z, r) => ((x - T.x) / (0.122 + r + 0.003)) ** 2 + ((z - T.z) / (0.065 + r + 0.003)) ** 2 > 1
        && legEnds.every(([a, b]) => { const t = THREE.MathUtils.clamp(((x - a.x) * (b.x - a.x) + (z - a.z) * (b.z - a.z)) / ((b.x - a.x) ** 2 + (b.z - a.z) ** 2), 0, 1); return Math.hypot(x - a.x - t * (b.x - a.x), z - a.z - t * (b.z - a.z)) > r + 0.027; });
      const inPlatter = (x, z, r) => Math.hypot((x - PLATTER.x) / (PLATTER.halfLength * 0.9 - r), (z - PLATTER.z) / (PLATTER.halfDepth * 0.9 - r)) <= 1;
      const freeSpot = (x, z, r) => inPlatter(x, z, r) && bodyClear(x, z, r) && footprints.every(([fx, fz, fr]) => Math.hypot(x - fx, z - fz) > r + fr + 0.002);
      const wedge = (outer, inner, angle, thickness, segments = 12) => {
        const shape = new THREE.Shape();
        shape.absarc(0, 0, outer, -angle / 2, angle / 2, false);
        if (inner > 0) shape.absarc(0, 0, inner, angle / 2, -angle / 2, true); else shape.lineTo(0, 0);
        const g = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: true, bevelThickness: 0.0018, bevelSize: 0.0015, bevelSegments: 2, curveSegments: segments });
        g.translate(-(outer + inner) / 2, 0, -thickness / 2);
        return mergeVertices(g.deleteAttribute("normal").deleteAttribute("uv"));
      };
      const garnish = [];
      const candidates = [];
      for (let gx = -0.215; gx <= 0.216; gx += 0.0125) for (const gz of [-0.074, -0.062, -0.05, -0.035, -0.018, 0, 0.018, 0.035, 0.05, 0.062, 0.074]) candidates.push([gx, gz]);
      candidates.sort((a, b) => Math.abs(b[0]) - Math.abs(a[0]) || Math.abs(b[1]) - Math.abs(a[1]));
      const kinds = ["apple", "squash", "berries", "rosemary", "apple", "squash", "berries", "thyme"];
      let made = 0;
      for (const [lx, lz] of candidates) {
        const type = kinds[made % kinds.length];
        const r = type === "berries" ? 0.012 : type === "rosemary" || type === "thyme" ? 0.014 : 0.0175;
        const x = PLATTER.x + lx, z = PLATTER.z + lz;
        if (!freeSpot(x, z, r)) continue;
        footprints.push([x, z, r]);
        const outward = Math.atan2(lz / PLATTER.halfDepth, lx / PLATTER.halfLength);
        if (type === "apple") {
          const g = wedge(0.030, 0, 1.0, 0.012);
          g.rotateX(-Math.PI / 2); g.rotateY(-outward); g.rotateZ(0.12);
          g.translate(x, platterTop + 0.03, z);
          flatPaint(g, (px, py, pz, n) => (Math.hypot(px - x, pz - z) > 0.012 && py < platterTop + 0.03 + 0.007 && Math.abs(py - (platterTop + 0.03)) > 0.004 ? (n > 0.5 ? 0xb3262c : 0x9c1f27) : Math.hypot(px - x, pz - z) > 0.016 ? (n > 0.6 ? 0xa82a2e : 0xf1e5c4) : 0xf3e9cc));
          garnish.push([`apple-${made}`, g]);
        } else if (type === "squash") {
          const g = wedge(0.031, 0.019, 1.15, 0.014);
          g.rotateX(-Math.PI / 2); g.rotateY(-outward);
          g.translate(x, platterTop + 0.03, z);
          flatPaint(g, (px, py, pz, n) => { return n > 0.93 ? 0x6b3a12 : (py > platterTop + 0.03 + 0.0075 ? 0xd98a2a : 0xc7731f); });
          // Dark green rind on the outer arc.
          const pos = g.attributes.position, col = g.attributes.color, c = new THREE.Vector3();
          let maxD = 0; for (let i = 0; i < pos.count; i++) maxD = Math.max(maxD, Math.hypot(pos.getX(i) - x, pos.getZ(i) - z));
          for (let i = 0; i < pos.count; i++) { if (Math.hypot(pos.getX(i) - x, pos.getZ(i) - z) > maxD - 0.004) tint.set(foodNoise(pos.getX(i), pos.getY(i), pos.getZ(i)) > 0.7 ? 0x48532a : 0x2f3d1f).toArray(col.array, i * 3); }
          garnish.push([`squash-${made}`, g]);
        } else if (type === "berries") {
          for (const [ox, oz] of [[0, 0], [0.0125, 0.004], [0.004, 0.0122]]) {
            const berry = new THREE.SphereGeometry(0.0062, 12, 9);
            berry.translate(x + ox - 0.005, platterTop + 0.03, z + oz - 0.005);
            flatPaint(berry, (px, py, pz, n) => (py > platterTop + 0.0335 && n > 0.7 ? 0xb83846 : n > 0.4 ? 0x7d1a28 : 0x6a1522));
            garnish.push([`cranberry-${made}-${ox}`, berry]);
          }
        } else {
          // A sprig: a thin woody stem with needles (rosemary) or small round leaves (thyme) along both sides.
          const sprig = [];
          const stem = new THREE.CylinderGeometry(0.0006, 0.0009, 0.042, 5); stem.rotateZ(Math.PI / 2);
          sprig.push(flatPaint(stem, () => 0x5d5a31));
          const count = type === "rosemary" ? 14 : 10;
          for (let k = 0; k < count; k++) {
            const leaf = new THREE.SphereGeometry(1, 5, 3);
            if (type === "rosemary") leaf.scale(0.0048, 0.0006, 0.0009); else leaf.scale(0.0019, 0.0006, 0.0015);
            leaf.rotateY((k % 2 ? 1 : -1) * (type === "rosemary" ? 0.75 : 0.4));
            leaf.translate(-0.018 + (k >> 1) * (0.036 / (count / 2)) + (k % 2 ? 0.002 : 0), 0.0006, (k % 2 ? 1 : -1) * (type === "rosemary" ? 0.0028 : 0.0022));
            sprig.push(flatPaint(leaf, (px, py, pz, n) => (n > 0.6 ? 0x56703c : 0x3f5a2e)));
          }
          const g = mergeGeometries(sprig.map((s) => s.deleteAttribute("uv") && s.deleteAttribute("normal") && s), false);
          sprig.forEach((s) => s.dispose());
          g.rotateY(-outward + Math.PI / 2 + (made % 3) * 0.3);
          g.translate(x, platterTop + 0.03, z);
          garnish.push([`${type}-${made}`, g]);
        }
        made++;
        if (made >= 22) break;
      }
      for (const [name, g] of garnish) { g.computeBoundingBox(); seat(name, g, down, [platterProbe], 0.0005); turkeyParts.push(g); }
      // Three sprigs laid over the crown, seated onto the skin.
      [[-0.045, -0.012, 0.35], [-0.005, 0.014, -0.45], [0.032, -0.006, 0.8]].forEach(([dx, dz, yaw], index) => {
        const sprig = [];
        const stem = new THREE.CylinderGeometry(0.0006, 0.0009, 0.046, 5); stem.rotateZ(Math.PI / 2);
        sprig.push(flatPaint(stem, () => 0x5d5a31));
        for (let k = 0; k < 16; k++) {
          const leaf = new THREE.SphereGeometry(1, 5, 3);
          leaf.scale(0.0048, 0.0006, 0.0009);
          leaf.rotateY(k % 2 ? 0.75 : -0.75);
          leaf.translate(-0.020 + (k >> 1) * 0.0052, 0.0006, (k % 2 ? 1 : -1) * 0.0028);
          sprig.push(flatPaint(leaf, (px, py, pz, n) => (n > 0.6 ? 0x56703c : 0x3f5a2e)));
        }
        const g = mergeGeometries(sprig.map((s) => s.deleteAttribute("uv") && s.deleteAttribute("normal") && s), false);
        sprig.forEach((s) => s.dispose());
        g.rotateY(yaw); g.translate(T.x + dx, bodyTop + 0.02, T.z + dz);
        seat(`crown-rosemary-${index}`, g, down, [bodyMesh], 0.0005);
        turkeyParts.push(g);
      });
      probeGeometry.dispose(); platterProbe.material.dispose();
      // Match the food mesh's attribute set (position, normal, uv, color; indexed) before merging.
      const ready = turkeyParts.map((part) => {
        let g = part.index ? part : mergeVertices(part);
        for (const name of Object.keys(g.attributes)) if (!["position", "color"].includes(name)) g.deleteAttribute(name);
        g.computeVertexNormals();
        const position = g.attributes.position, uv = new Float32Array(position.count * 2);
        for (let i = 0; i < position.count; i++) { uv[i * 2] = position.getX(i) * 4; uv[i * 2 + 1] = position.getZ(i) * 4; }
        g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
        return g;
      });
      const template = parts[0];
      for (const g of ready) for (const name of Object.keys(template.attributes)) if (!g.attributes[name]) throw new Error(`Turkey piece missing ${name}`);
      for (const g of ready) for (const name of Object.keys(g.attributes)) if (!template.attributes[name]) g.deleteAttribute(name);
      turkeyGeometry = mergeGeometries(ready, false);
      ready.forEach((part) => part.dispose());
      if (!turkeyGeometry) throw new Error("Could not merge Thanksgiving roast turkey");
      turkeyGeometry.computeVertexNormals();
      group.userData.turkeyFit = turkeyFit;
      if (globalThis.__ROOMVERSE_QA) globalThis.__ROOMVERSE_QA.turkey = { parts: ready.map((g) => g.clone()), fit: turkeyFit, platterTop };
    }
    const geometry = mergeGeometries(parts, false);
    parts.forEach((part) => part.dispose());
    if (!geometry) throw new Error(`Could not merge Room 03 ${kind} tableware`);
    geometry.computeVertexNormals();
    vertices += geometry.attributes.position.count;
    const mesh = new THREE.Mesh(geometry, materials[kind]);
    mesh.name = `room03-tableware-${kind}`;
    mesh.userData.category = "tableware";
    mesh.castShadow = kind === "ceramic" || kind === "metal" || kind === "food";
    mesh.receiveShadow = true;
    mesh.renderOrder = renderOrder[kind];
    group.add(mesh);
    if (turkeyGeometry) group.userData.foodVariants = { dinner: geometry, thanksgiving: turkeyGeometry };
  }
  const lemon = scene.getObjectByName("prop-tabletop-meyer-lemon-bowl");
  const lemonBounds = lemon ? new THREE.Box3().setFromObject(lemon) : null;
  const distanceBetweenBoxes = (a, b) => {
    const dx = Math.max(a.min.x - b.max.x, b.min.x - a.max.x, 0);
    const dy = Math.max(a.min.y - b.max.y, b.min.y - a.max.y, 0);
    const dz = Math.max(a.min.z - b.max.z, b.min.z - a.max.z, 0);
    return Math.hypot(dx, dy, dz) * 1000;
  };
  if (!lemonBounds) throw new Error("Cannot validate tableware against the Meyer lemon bowl");
  settings.forEach((setting, index) => {
    const bound = new THREE.Box3(new THREE.Vector3(...settingGeometryRanges[index].min), new THREE.Vector3(...settingGeometryRanges[index].max));
    setting.lemonClearanceMm = Number(distanceBetweenBoxes(bound, lemonBounds).toFixed(1));
    setting.index = index;
  });
  group.userData.settings = settings;
  group.userData.vertices = vertices;
  group.userData.baseVertices = vertices;
  group.userData.materials = {
    glass: { transparent: materials.glass.transparent, depthWrite: materials.glass.depthWrite, renderOrder: renderOrder.glass },
    liquid: { transparent: materials.liquid.transparent, depthWrite: materials.liquid.depthWrite, renderOrder: renderOrder.liquid },
  };
  group.userData.colors = { wine: "#5c1823", plate: "#e3dacb", bowl: "#d8ccb6", accent: ["#777f63", "#9a6a50"], linen: "#cdbfa7", napkin: "#dacfba" };
  const mm = (value) => Number((value * 1000).toFixed(1));
  const boxClear = (a, b) => mm(Math.hypot(Math.max(a.min.x - b.max.x, b.min.x - a.max.x, 0), Math.max(a.min.y - b.max.y, b.min.y - a.max.y, 0), Math.max(a.min.z - b.max.z, b.min.z - a.max.z, 0)));
  // Plan-view distance from a round tableware footprint (plate, glasses) to a piece's bounding rectangle; a union box per setting would be too coarse.
  const circleClear = ([cx, cz], radius, box) => Math.hypot(Math.max(box.min.x - cx, cx - box.max.x, 0), Math.max(box.min.z - cz, cz - box.max.z, 0)) - radius;
  const FOOTPRINTS = settings.flatMap((setting) => [[[setting.plateCenter[0], setting.plateCenter[2]], plateRadius], [[setting.wineCenter[0], setting.wineCenter[2]], wineRadius], [[setting.waterCenter[0], setting.waterCenter[2]], setting.cup.radiusMm / 1000]]);
  const minSettingClearance = (box) => mm(Math.min(...FOOTPRINTS.map(([centre, radius]) => circleClear(centre, radius, box))));
  group.userData.extras = {
    runner: { widthMm: mm(RUNNER.width), lengthMm: mm(RUNNER.length), gapMm: mm(extraBoxes.runner.min.y - runnerBaseY), minSettingClearanceMm: minSettingClearance(extraBoxes.runner), maxX: Number(extraBoxes.runner.max.x.toFixed(3)) },
    pitcher: { heightMm: mm(extraBoxes.pitcher.max.y - extraBoxes.pitcher.min.y), gapMm: mm(extraBoxes.pitcher.min.y - runnerTop), minSettingClearanceMm: minSettingClearance(extraBoxes.pitcher), lemonClearanceMm: boxClear(extraBoxes.pitcher, lemonBounds), boardClearanceMm: boxClear(extraBoxes.pitcher, extraBoxes.board), maxX: Number(extraBoxes.pitcher.max.x.toFixed(3)) },
    juice: { x: JUICE.x, z: JUICE.z, radiusMm: 44, heightMm: mm(extraBoxes.juiceCap.max.y - extraBoxes.juiceCarafe.min.y), gapMm: mm(extraBoxes.juiceCarafe.min.y - juiceY), liquidInsideMm: mm(Math.min(extraBoxes.juice.min.y - extraBoxes.juiceCarafe.min.y, extraBoxes.juiceCarafe.max.x - extraBoxes.juice.max.x)), minSettingClearanceMm: minSettingClearance(extraBoxes.juiceCarafe), boardClearanceMm: boxClear(extraBoxes.juiceCarafe, extraBoxes.board), runnerClearanceMm: mm(extraBoxes.runner.min.x - extraBoxes.juiceCarafe.max.x) },
    board: { gapMm: mm(extraBoxes.board.min.y - runnerTop), minSettingClearanceMm: minSettingClearance(extraBoxes.board), lemonClearanceMm: boxClear(extraBoxes.board, lemonBounds) },
    feast: (() => {
      const restItems = foodItems.filter((item) => !item.lifted && item.embed > 0);
      const platterBox = extraBoxes.platter;
      const foodBox = new THREE.Box3().makeEmpty();
      foodItems.forEach((item) => foodBox.union(item.box));
      return {
        platterWidthMm: mm(platterBox.max.x - platterBox.min.x), platterDepthMm: mm(platterBox.max.z - platterBox.min.z), platterGapMm: mm(platterBox.min.y - runnerTop),
        platterSettingClearanceMm: minSettingClearance(platterBox), platterLemonClearanceMm: boxClear(platterBox, lemonBounds), platterBoardClearanceMm: boxClear(platterBox, extraBoxes.board),
        platterMaxX: Number(platterBox.max.x.toFixed(3)),
        platterCenterXMm: mm((platterBox.min.x + platterBox.max.x) / 2),
        pieces: foodItems.length,
        minRestGapMm: Math.min(...restItems.map((item) => mm(item.box.min.y - platterTop))), maxRestGapMm: Math.max(...restItems.map((item) => mm(item.box.min.y - platterTop))),
        overhangMm: Math.max(0, mm(Math.max(foodBox.max.x - (PLATTER.x + PLATTER.halfLength - 0.02), (PLATTER.x - PLATTER.halfLength + 0.02) - foodBox.min.x, foodBox.max.z - (PLATTER.z + PLATTER.halfDepth - 0.012), (PLATTER.z - PLATTER.halfDepth + 0.012) - foodBox.min.z))),
        topMm: mm(foodBox.max.y - platterTop),
        potatoes: foodItems.filter((item) => item.name.startsWith("potato")).length, carrots: foodItems.filter((item) => item.name.startsWith("carrot")).length,
        lemonHalves: foodItems.filter((item) => item.name.startsWith("lemon-half")).length, croutons: foodItems.filter((item) => item.name.startsWith("crouton")).length,
      };
    })(),
    bread: { loafBottomMm: mm(extraBoxes.loaf.min.y - boardTop), sliceBottomsMm: [0, 1].map((i) => mm(extraBoxes[`slice-${i}`].min.y - boardTop)), maxXOverBoardMm: mm(Math.max(extraBoxes.loaf.max.x, extraBoxes["slice-0"].max.x, extraBoxes["slice-1"].max.x) - extraBoxes.board.max.x) },
  };
  return group;
}

// The entry hall (z 2.4 to 3.8, x -0.94 to 0.94) holds the TV on a low console but nowhere to sit and watch (Paul 2026-10-29). A low oak-framed bench with a
// back cushion and two pillows faces the screen from the free side of the console, on a flat-weave rug. Three meshes plus the rug, none in the opening frame.
function buildEntryNook(scene, m) {
  const group = new THREE.Group();
  group.name = "room03-entry-tv-nook";
  group.userData.category = "entry-nook";
  const NOOK = { benchX: -0.40, benchZ: 2.80, width: 0.92, depth: 0.44, legHeight: 0.255, rug: { x: -0.20, z: 2.88, width: 1.40, depth: 0.80, thickness: 0.012 } };
  const floorY = 0;
  const frameParts = [], clothParts = [], pillowParts = [];
  const indexed = (geometry) => mergeVertices(geometry);
  const place = (geometry, position, rotation = [0, 0, 0]) => {
    geometry.rotateX(rotation[0]); geometry.rotateY(rotation[1]); geometry.rotateZ(rotation[2]);
    geometry.translate(...position);
    return geometry;
  };
  const legRadius = [0.016, 0.011];
  const footBottoms = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const leg = new THREE.CylinderGeometry(legRadius[0], legRadius[1], NOOK.legHeight + 0.01, 10);
    leg.translate(0, (NOOK.legHeight + 0.01) / 2, 0);
    place(leg, [NOOK.benchX + sx * (NOOK.width / 2 - 0.06), floorY + 0.002, NOOK.benchZ + sz * (NOOK.depth / 2 - 0.05)]);
    footBottoms.push(0.002);
    frameParts.push(indexed(leg));
  }
  const railY = floorY + NOOK.legHeight;
  frameParts.push(indexed(place(new THREE.BoxGeometry(NOOK.width, 0.045, NOOK.depth - 0.02), [NOOK.benchX, railY + 0.0225, NOOK.benchZ])));
  for (const sx of [-1, 1]) frameParts.push(indexed(place(new THREE.BoxGeometry(0.036, 0.30, 0.04), [NOOK.benchX + sx * (NOOK.width / 2 - 0.018), railY + 0.045 + 0.15, NOOK.benchZ - NOOK.depth / 2 + 0.04])));
  frameParts.push(indexed(place(new THREE.BoxGeometry(NOOK.width, 0.035, 0.04), [NOOK.benchX, railY + 0.045 + 0.26, NOOK.benchZ - NOOK.depth / 2 + 0.04])));
  const seatTop = railY + 0.045 + 0.095;
  clothParts.push(indexed(place(roundedBoxGeometry([NOOK.width - 0.04, 0.095, NOOK.depth - 0.04], 0.03), [NOOK.benchX, railY + 0.045 + 0.0475, NOOK.benchZ + 0.01])));
  clothParts.push(indexed(place(roundedBoxGeometry([NOOK.width - 0.06, 0.24, 0.10], 0.035), [NOOK.benchX, seatTop + 0.12 - 0.01, NOOK.benchZ - NOOK.depth / 2 + 0.105], [-0.14, 0, 0])));
  for (const [dx, yaw, tilt] of [[-0.26, 0.2, -0.16], [0.27, -0.25, -0.12]]) {
    pillowParts.push(indexed(place(roundedBoxGeometry([0.30, 0.28, 0.085], 0.03), [NOOK.benchX + dx, seatTop + 0.135, NOOK.benchZ - NOOK.depth / 2 + 0.185], [tilt, yaw, 0])));
  }
  const merged = (parts) => { const geometry = mergeGeometries(parts, false); parts.forEach((part) => part.dispose()); geometry.computeVertexNormals(); return geometry; };
  const cloth = m.loungeFabric.clone(); cloth.name = "nook-oat-boucle"; cloth.map = cloth.map.clone(); cloth.map.repeat.set(2, 1); cloth.map.needsUpdate = true;
  const pillowCloth = m.loungeFabric.clone(); pillowCloth.name = "nook-sage-pillows"; pillowCloth.color.set(0x8a9873);
  const meshes = [];
  for (const [name, geometry, material] of [["entry-nook-bench-frame", merged(frameParts), m.oak], ["entry-nook-bench-cushions", merged(clothParts), cloth], ["entry-nook-bench-pillows", merged(pillowParts), pillowCloth]]) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name; mesh.userData.category = "entry-nook";
    mesh.castShadow = true; mesh.receiveShadow = true;
    group.add(mesh); meshes.push(mesh);
  }
  // Flat-weave kilim-style rug (Paul 2026-10-31: richer): cream ground, a triple border (terracotta, sage, ink), and a row of three stepped diamonds
  // down the middle, drawn on a canvas (no download). Fringe is added by buildRoom03NookDecor.
  const canvas = document.createElement("canvas");
  canvas.width = 1024; canvas.height = 585;
  const context = canvas.getContext("2d");
  context.fillStyle = "#dccfb4"; context.fillRect(0, 0, 1024, 585);
  let seed = 11;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < 5200; i++) { context.fillStyle = `rgba(${random() > 0.5 ? "255,250,235" : "120,98,66"}, ${0.05 + random() * 0.09})`; context.fillRect(random() * 1024, random() * 585, 6 + random() * 26, 1 + random() * 1.4); }
  const band = (inset, thickness, color) => { context.strokeStyle = color; context.lineWidth = thickness; context.strokeRect(inset + thickness / 2, inset + thickness / 2, 1024 - 2 * inset - thickness, 585 - 2 * inset - thickness); };
  band(26, 26, "#a8664b"); band(62, 7, "#2f3a33"); band(78, 12, "#7d8a68"); band(104, 4, "#a8664b");
  const diamond = (cx, cy, r, colors) => { colors.forEach((color, i) => { const k = r * (1 - i / colors.length); context.fillStyle = color; context.beginPath(); context.moveTo(cx, cy - k); context.lineTo(cx + k * 1.35, cy); context.lineTo(cx, cy + k); context.lineTo(cx - k * 1.35, cy); context.closePath(); context.fill(); }); };
  for (const cx of [262, 512, 762]) diamond(cx, 292, 118, ["#a8664b", "#dccfb4", "#7d8a68", "#e3b565", "#2f3a33"]);
  for (const cx of [387, 637]) { context.fillStyle = "#7d8a68"; context.fillRect(cx - 7, 285, 14, 14); }
  for (const x of [140, 884]) { context.fillStyle = "#a8664b"; context.beginPath(); context.moveTo(x, 270); context.lineTo(x + 18, 292); context.lineTo(x, 314); context.lineTo(x - 18, 292); context.closePath(); context.fill(); }
  const rugTexture = new THREE.CanvasTexture(canvas);
  rugTexture.colorSpace = THREE.SRGBColorSpace; rugTexture.anisotropy = 8;
  const rug = new THREE.Mesh(roundedBoxGeometry([NOOK.rug.width, NOOK.rug.thickness, NOOK.rug.depth], 0.004), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.97, map: rugTexture }));
  rug.name = "entry-nook-rug"; rug.userData.category = "entry-nook";
  rug.position.set(NOOK.rug.x, floorY + NOOK.rug.thickness / 2, NOOK.rug.z);
  rug.castShadow = false; rug.receiveShadow = true;
  group.add(rug);
  scene.add(group);
  scene.updateMatrixWorld(true);
  const boxOf = (object) => new THREE.Box3().setFromObject(object);
  const mm = (value) => Number((value * 1000).toFixed(1));
  const bench = new THREE.Box3().makeEmpty();
  meshes.forEach((mesh) => bench.union(boxOf(mesh)));
  const frameBox = boxOf(meshes[0]), rugBox = boxOf(rug);
  const consoleFrontZ = 3.365, wallInnerX = 0.94;
  return {
    group,
    info: () => ({
      benchMm: [mm(bench.max.x - bench.min.x), mm(bench.max.y - bench.min.y), mm(bench.max.z - bench.min.z)],
      seatTopMm: mm(seatTop - floorY), footGapMm: mm(frameBox.min.y - rugBox.max.y),
      rugMm: [mm(rugBox.max.x - rugBox.min.x), mm(rugBox.max.y - rugBox.min.y), mm(rugBox.max.z - rugBox.min.z)], rugGapMm: mm(rugBox.min.y - floorY),
      benchToConsoleMm: mm(consoleFrontZ - bench.max.z), benchToLeftWallMm: mm(bench.min.x + wallInnerX), benchToDoorLineMm: mm(bench.min.z - 2.46),
      rugToWallsMm: [mm(rugBox.min.x + wallInnerX), mm(wallInnerX - rugBox.max.x)], rugToConsoleMm: mm(consoleFrontZ - rugBox.max.z),
      meshes: meshes.length + 1, vertices: [...meshes.map((mesh) => mesh.geometry.attributes.position.count), rug.geometry.attributes.position.count].reduce((a, b) => a + b, 0),
    }),
  };
}

// Entry nook decor (Paul 2026-10-31: the closer view needs finer small things): a rug fringe, a folded striped throw on the bench, a woven basket
// with a rolled towel and two books on the console's lower shelf, a shoe tray with two pairs of slippers under the totes, and a floor vase of pampas
// by the right wall. One vertex-colour mesh, +1 draw call.
function buildRoom03NookDecor(scene) {
  const parts = [];
  const add = (geometry, hex, position, rotation = [0, 0, 0], scale = [1, 1, 1]) => {
    geometry.applyMatrix4(new THREE.Matrix4().compose(
      new THREE.Vector3(...position), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)), new THREE.Vector3(...scale),
    ));
    const colour = new THREE.Color(hex), count = geometry.attributes.position.count, colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) colour.toArray(colors, i * 3);
    geometry.deleteAttribute("uv");
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    parts.push(geometry);
  };
  const lathe = (profile, segments) => new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segments);
  const CLAY = 0xa8644a, MOSS = 0x6f7d5a, BLUE = 0x6c7f93, CREAM = 0xe6dccb, STRAW = 0xc9a971, STRAW_DARK = 0xa98b57, INK = 0x2f3a33;
  // Rug fringe: 28 flat cream strands on each short end of the rug (rug x -0.90 to 0.50, z 2.48 to 3.28, thickness 0.012). Paul 2026-11-01: every
  // strand was exactly 4 cm and evenly tilted, which read as a comb; lengths and angles now vary a little, at the same vertex count.
  for (const endX of [-0.90, 0.50]) for (let i = 0; i < 28; i++) {
    const z = 2.50 + i * (0.76 / 27), sign = endX < 0 ? -1 : 1;
    const wobble = Math.sin(i * 2.3) * 0.5 + Math.sin(i * 0.7) * 0.5;
    const length = 0.036 + Math.abs(wobble) * 0.012;
    add(new THREE.PlaneGeometry(length, 0.007), i % 3 === 0 ? 0xcdbf9f : 0xe6dccb, [endX + sign * (length * 0.5), 0.004, z], [-Math.PI / 2, 0, (0.05 + wobble * 0.05) * (i % 5 - 2)]);
  }
  // Folded striped throw on the bench seat (cushion top about y 0.395). Paul 2026-11-01: it read as four stacked planks, so each fold is now a little
  // narrower and turned differently, the top fold is pulled back, and one short flap hangs over the cushion's front edge like real cloth (4 extra vertices).
  let layerY = 0.395;
  [[CREAM, 0.013, 0.345, 0.255, 0.10], [CLAY, 0.011, 0.335, 0.25, -0.04], [CREAM, 0.013, 0.32, 0.245, 0.05], [MOSS, 0.011, 0.30, 0.235, -0.02]].forEach(([hex, h, w, d, yaw]) => {
    add(new THREE.BoxGeometry(w, h, d), hex, [-0.64, layerY + h / 2, 2.86], [0, 0.12 + yaw, 0]);
    layerY += h;
  });
  add(new THREE.PlaneGeometry(0.30, 0.17), CREAM, [-0.64, layerY - 0.088, 2.737], [-1.33, 0.12, 0.03]);
  // Woven basket on the console's lower shelf (shelf top y 0.24, centre z about 3.53): ribbed body, rolled towel, two lying books.
  const basketProfile = [[0, 0], [0.105, 0], [0.12, 0.02], [0.135, 0.09], [0.14, 0.14], [0.132, 0.145], [0.126, 0.138], [0.11, 0.02], [0, 0.012]];
  add(lathe(basketProfile, 16), STRAW, [-0.40, 0.24, 3.54]);
  for (let i = 0; i < 4; i++) add(new THREE.TorusGeometry(0.128 + (i % 2) * 0.004, 0.0035, 4, 18), STRAW_DARK, [-0.40, 0.24 + 0.03 + i * 0.03, 3.54], [Math.PI / 2, 0, 0]);
  add(new THREE.CylinderGeometry(0.045, 0.045, 0.2, 10), CREAM, [-0.40, 0.24 + 0.15, 3.54], [0, 0, Math.PI / 2]);
  add(new THREE.CylinderGeometry(0.0455, 0.0455, 0.03, 10), CLAY, [-0.40, 0.24 + 0.15, 3.54], [0, 0, Math.PI / 2]);
  for (const [w, h, d, cover, x, y, yaw] of [[0.2, 0.03, 0.14, BLUE, -0.83, 0.24, 0.08], [0.18, 0.025, 0.13, CLAY, -0.83, 0.27, -0.1]]) {
    add(new THREE.BoxGeometry(w, h, d), cover, [x, y + h / 2, 3.52], [0, yaw, 0]);
    add(new THREE.BoxGeometry(w - 0.006, h - 0.008, d + 0.002), CREAM, [x, y + h / 2, 3.52], [0, yaw, 0]);
  }
  // Shoe tray under the totes (x 0.54 to 0.92, z 3.29 to 3.63): charcoal rubber, low rim, two pairs of house slippers (Paul 2026-10-31: sneakers did not
  // read as real). Left pair: Taiwanese flip-flops (夾腳拖), sage rubber with a Y strap. Right pair: Bay Area shearling-lined suede slippers.
  const TRAY = [0.73, 3.46];
  add(new THREE.BoxGeometry(0.38, 0.012, 0.34), 0x2a2f2c, [TRAY[0], 0.006, TRAY[1]]);
  for (const [w, d, dx, dz] of [[0.38, 0.012, 0, -0.164], [0.38, 0.012, 0, 0.164], [0.012, 0.34, -0.184, 0], [0.012, 0.34, 0.184, 0]]) add(new THREE.BoxGeometry(w, 0.02, d), 0x2a2f2c, [TRAY[0] + dx, 0.015, TRAY[1] + dz]);
  const rod = (from, to, radius, hex) => {
    const a = new THREE.Vector3(...from), c = new THREE.Vector3(...to), direction = c.clone().sub(a);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
    add(new THREE.CylinderGeometry(radius, radius, direction.length(), 6), hex, a.add(c).multiplyScalar(0.5).toArray(), new THREE.Euler().setFromQuaternion(q).toArray().slice(0, 3));
  };
  const SOLE_Y = 0.012;
  for (const [dx, yaw] of [[-0.14, 0.05], [-0.047, -0.04]]) {
    const x = TRAY[0] + dx, z = TRAY[1] + 0.005;
    add(new THREE.CylinderGeometry(1, 1, 0.016, 20), 0x7d8a68, [x, SOLE_Y + 0.008, z], [0, yaw, 0], [0.04, 1, 0.125]);
    add(new THREE.CylinderGeometry(1, 1, 0.006, 20), 0xa8b394, [x, SOLE_Y + 0.019, z], [0, yaw, 0], [0.036, 1, 0.12]);
    const toe = [x + Math.sin(yaw) * 0.075, SOLE_Y + 0.022, z + Math.cos(yaw) * 0.075];
    rod(toe, [toe[0], toe[1] + 0.012, toe[2]], 0.005, 0x5f6a4d);
    for (const side of [-1, 1]) rod([toe[0], toe[1] + 0.012, toe[2]], [x + side * 0.034 - Math.sin(yaw) * 0.0, SOLE_Y + 0.024, z - 0.018], 0.0045, 0xf2efe8);
  }
  for (const [dx, yaw] of [[0.047, 0.04], [0.14, -0.05]]) {
    const x = TRAY[0] + dx, z = TRAY[1] + 0.005;
    add(new THREE.CylinderGeometry(1, 1, 0.02, 20), 0xc7b08c, [x, SOLE_Y + 0.01, z], [0, yaw, 0], [0.046, 1, 0.128]);
    add(new THREE.SphereGeometry(1, 12, 8), 0xb89a74, [x, SOLE_Y + 0.022, z + 0.03], [0, yaw, 0], [0.046, 0.032, 0.088]);
    add(new THREE.TorusGeometry(0.03, 0.011, 6, 14), 0xf0e6d2, [x, SOLE_Y + 0.043, z - 0.03], [Math.PI / 2, yaw, 0], [1.1, 1.5, 1]);
    add(new THREE.CylinderGeometry(1, 1, 0.008, 14), 0xe9ddc6, [x, SOLE_Y + 0.025, z - 0.03], [0, yaw, 0], [0.034, 1, 0.056]);
  }
  // Floor vase with pampas by the right wall (x 0.80, z 2.55): tall matte dusty-blue ceramic, fourteen stems and cream plumes.
  const VX = 0.84, VZ = 3.02;
  add(lathe([[0, 0], [0.055, 0], [0.075, 0.04], [0.082, 0.13], [0.066, 0.23], [0.043, 0.29], [0.032, 0.33], [0.037, 0.355], [0.028, 0.355], [0.024, 0.32], [0, 0.3]], 14), BLUE, [VX, 0, VZ]);
  for (let i = 0; i < 14; i++) {
    const around = i * 2.399963, lean = 0.05 + (i % 5) * 0.045, height = 0.36 + (i % 4) * 0.07;
    const tiltX = Math.asin(Math.sin(lean) * Math.sin(around)), tiltZ = -Math.asin(Math.sin(lean) * Math.cos(around));
    const dir = new THREE.Vector3(Math.sin(lean) * Math.cos(around), Math.cos(lean), Math.sin(lean) * Math.sin(around));
    const top = new THREE.Vector3(VX, 0.34, VZ).addScaledVector(dir, height), mid = new THREE.Vector3(VX, 0.34, VZ).addScaledVector(dir, height / 2);
    add(new THREE.CylinderGeometry(0.0015, 0.002, height, 4), 0xa08e62, mid.toArray(), [tiltX, 0, tiltZ]);
    add(new THREE.SphereGeometry(1, 7, 5), i % 3 ? 0xd8c8a4 : 0xe9dfc6, top.toArray(), [tiltX, 0, tiltZ], [0.016, 0.055, 0.016]);
  }
  // Paul 2026-11-01: one thing worth finding — a small sleeping puppy plush curled on the console top, beside the vase, facing the room. It is a single
  // story object (not a shelf of them): body, head, folded ears, muzzle, closed eyes and a curled tail merge into the same vertex-colour mesh, so it
  // costs vertices only (about 480), no new mesh and no new draw call.
  const PUP = [-0.40, 0.575, 3.46];
  const PUP_BODY = 0xd9c7ac, PUP_EAR = 0xbfa383, PUP_MUZZLE = 0xf2e8d8, PUP_DARK = 0x2b2622;
  add(new THREE.SphereGeometry(1, 10, 7), PUP_BODY, [PUP[0], PUP[1] + 0.046, PUP[2]], [0, 0.3, 0], [0.085, 0.045, 0.055]);
  const pupHead = [PUP[0] + 0.048, PUP[1] + 0.066, PUP[2] - 0.030];
  add(new THREE.SphereGeometry(1, 10, 7), PUP_BODY, pupHead, [0.2, 0.3, 0], [0.047, 0.043, 0.045]);
  for (const side of [-1, 1]) {
    add(new THREE.SphereGeometry(1, 6, 4), PUP_EAR, [pupHead[0] + side * 0.040, pupHead[1] + 0.022, pupHead[2] - 0.006], [0, 0, side * 0.7], [0.020, 0.014, 0.010]);
    add(new THREE.SphereGeometry(1, 6, 4), PUP_DARK, [pupHead[0] + side * 0.020, pupHead[1] + 0.010, pupHead[2] - 0.041], [0, 0, 0], [0.006, 0.0045, 0.004]);
  }
  add(new THREE.SphereGeometry(1, 8, 6), PUP_MUZZLE, [pupHead[0] + 0.004, pupHead[1] - 0.012, pupHead[2] - 0.040], [0, 0, 0], [0.024, 0.019, 0.022]);
  add(new THREE.SphereGeometry(1, 6, 4), PUP_DARK, [pupHead[0] + 0.002, pupHead[1] - 0.008, pupHead[2] - 0.060], [0, 0, 0], [0.008, 0.006, 0.005]);
  add(new THREE.TorusGeometry(0.028, 0.009, 5, 8), PUP_BODY, [PUP[0] - 0.075, PUP[1] + 0.052, PUP[2] + 0.014], [0, 1.1, 0.5]);
  // Two flush recessed downlights in the hall ceiling (underside y 2.58), the same cream trim and warm lens as Room 02's desk downlight. They are small on
  // purpose: the room's star is outside. The glow follows the mood in setMood.
  const DOWNLIGHTS = [[-0.35, 2.92], [0.30, 3.32]];
  for (const [x, z] of DOWNLIGHTS) add(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 24), 0xf2efe8, [x, 2.574, z]);
  const lensGeometry = mergeGeometries(DOWNLIGHTS.map(([x, z]) => { const lens = new THREE.CircleGeometry(0.035, 24); lens.rotateX(Math.PI / 2); lens.translate(x, 2.567, z); return lens; }), false);
  const lensMaterial = new THREE.MeshStandardMaterial({ color: 0xfff6e6, emissive: 0xffe3bd, emissiveIntensity: 0, roughness: 0.4 });
  const lens = new THREE.Mesh(lensGeometry, lensMaterial);
  lens.name = "room03-nook-downlight-lenses"; lens.userData.category = "entry-nook";
  scene.add(lens);
  // No extra scene light (the room is at its light budget): each lens gets a soft additive halo on the ceiling instead.
  const haloCanvas = document.createElement("canvas"); haloCanvas.width = haloCanvas.height = 64;
  const haloContext = haloCanvas.getContext("2d"), haloGradient = haloContext.createRadialGradient(32, 32, 0, 32, 32, 32);
  haloGradient.addColorStop(0, "rgba(255,226,180,0.95)"); haloGradient.addColorStop(0.35, "rgba(255,210,150,0.35)"); haloGradient.addColorStop(1, "rgba(255,200,140,0)");
  haloContext.fillStyle = haloGradient; haloContext.fillRect(0, 0, 64, 64);
  const haloTexture = new THREE.CanvasTexture(haloCanvas); haloTexture.colorSpace = THREE.SRGBColorSpace;
  const haloGeometry = mergeGeometries(DOWNLIGHTS.map(([x, z]) => { const disc = new THREE.PlaneGeometry(0.5, 0.5); disc.rotateX(Math.PI / 2); disc.translate(x, 2.562, z); return disc; }), false);
  const haloMaterial = new THREE.MeshBasicMaterial({ map: haloTexture, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const halo = new THREE.Mesh(haloGeometry, haloMaterial);
  halo.name = "room03-nook-downlight-halo"; halo.userData.category = "entry-nook"; halo.visible = false;
  scene.add(halo);
  const geometry = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose());
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.86, side: THREE.DoubleSide }));
  mesh.name = "room03-nook-decor";
  mesh.userData.category = "entry-nook";
  mesh.castShadow = true; mesh.receiveShadow = true;
  scene.add(mesh);
  mesh.updateMatrixWorld(true);
  const vertices = geometry.attributes.position.count + lensGeometry.attributes.position.count + haloGeometry.attributes.position.count;
  return { vertices, mesh, halo, lensMaterial, bounds: () => { const box = new THREE.Box3().setFromObject(mesh); return { min: box.min.toArray(), max: box.max.toArray() }; } };
}

// Thanksgiving-only table layer (Paul 2026-10-29: more than the everyday dinner): a burgundy wine bottle, two extra glasses of red wine, a bowl of
// cranberries and a pair of brass candlesticks along the near edge of the table. One opaque mesh plus the same glass and liquid treatment as the place settings.
function buildThanksgivingDecor(scene) {
  const group = new THREE.Group();
  group.name = "mood-slot-thanksgiving-decor";
  group.userData.category = "tableware";
  group.userData.moodSlot = "thanksgiving-decor";
  group.visible = false;
  const table = scene.getObjectByName("room03-table-glb") || scene.getObjectByName("merged-dining-table");
  if (!table) throw new Error("Cannot build Thanksgiving decor without the Room 03 dining table");
  scene.updateMatrixWorld(true);
  table.updateWorldMatrix(true, true);
  const tableTop = new THREE.Box3().setFromObject(table).max.y;
  const raycaster = new THREE.Raycaster();
  const tableYAt = (x, z) => {
    raycaster.set(new THREE.Vector3(x, tableTop + 0.1, z), new THREE.Vector3(0, -1, 0));
    const hit = raycaster.intersectObject(table, true).find(({ point }) => point.y > tableTop - 0.08);
    if (!hit) throw new Error(`Cannot measure the dining tabletop under ${x}, ${z}`);
    return hit.point.y;
  };
  const parts = { decor: [], glass: [], liquid: [], paperNapkin: [] };
  const items = [], paperNapkinItems = [];
  const paint = (geometry, colorAt) => {
    const position = geometry.attributes.position;
    const colors = new Float32Array(position.count * 3);
    const tint = new THREE.Color();
    for (let i = 0; i < position.count; i++) {
      const noise = Math.abs(Math.sin(position.getX(i) * 191.3 + position.getY(i) * 83.7 + position.getZ(i) * 151.1) * 43758.5453) % 1;
      tint.set(colorAt(position.getY(i), noise)).toArray(colors, i * 3);
    }
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  };
  const lathe = (profile, segments) => new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segments);
  const place = (bucket, name, geometry, x, z, radius, base = null) => {
    const y = base ?? tableYAt(x, z);
    geometry.translate(x, y, z);
    geometry.computeBoundingBox();
    parts[bucket].push(geometry);
    const item = { name, x, z, radius, gapMm: Number(((geometry.boundingBox.min.y - y) * 1000).toFixed(1)), heightMm: Number(((geometry.boundingBox.max.y - geometry.boundingBox.min.y) * 1000).toFixed(1)) };
    (bucket === "paperNapkin" ? paperNapkinItems : items).push(item);
    return y;
  };

  // Bulk pack of paper napkins (Paul 2026-10-31): a soft-plastic wrapped white stack with a generic red band and an abstract,
  // unreadable label block (no real brand name or logo). Slightly squashed: flat base on the table, bulging sides, pinched seams at both ends.
  {
    // Paul 2026-11-17: the wrapped pack looked like a plain white brick next to the record player. It is now a paper-napkin dispenser box (same footprint,
    // same spot): a cream carton with a soft sage band, an oval opening on top and two white napkins pulled up through it, rippled and leaning,
    // fanning out from the middle. No brand, no text. The two napkins stand 4 mm inside the carton so they grow out of the opening.
    const BODY_H = 0.062;
    const body = new THREE.BoxGeometry(0.19, BODY_H, 0.105, 6, 3, 4);
    paint(body, (y) => (y < -0.012 ? 0xe8e2d3 : y < 0.016 ? 0xc9d6c4 : 0xefeadd));
    body.translate(0, BODY_H / 2, 0);
    const opening = new THREE.CircleGeometry(1, 24).scale(0.062, 0.022, 1).rotateX(-Math.PI / 2).translate(0, BODY_H + 0.0004, 0);
    paint(opening, () => 0x3b3732);
    const napkin = (w, h, baseX, tiltZ, tiltY, phase, curl) => {
      const g = new THREE.BoxGeometry(w, h, 0.0016, 12, 10, 1);
      const pos = g.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i) + h / 2, rise = y / h; // 0 at the opening, 1 at the free edge
        pos.setZ(i, pos.getZ(i) + (0.002 + 0.011 * rise) * Math.sin((x / w) * Math.PI * 2.6 + phase) + curl * rise * rise);
        pos.setX(i, x * (1 + 0.1 * rise)); // a tissue opens out a little as it rises
        pos.setY(i, y);
      }
      g.rotateZ(tiltZ); g.rotateY(tiltY); g.translate(baseX, BODY_H - 0.004, 0);
      paint(g, (y, n) => (n > 0.9 ? 0xeceae3 : 0xf8f7f2));
      return g;
    };
    const pack = mergeGeometries([body, opening, napkin(0.066, 0.078, -0.006, 0.07, 0.12, 0.4, 0.016), napkin(0.058, 0.052, 0.018, -0.2, -0.28, 2.2, -0.012)], false);
    pack.rotateY(0.18);
    // Paul 2026-10-31: on the dining table it crowded a glass, so it lives on the free front end of the small wok counter, beside the clay-red
    // credenza. Seated on the measured stone top (0 mm), kept 20 mm+ clear of the wok kitchen props (checked in the decor test).
    const wokCounter = scene.getObjectByName("merged-wok-counter");
    if (!wokCounter) throw new Error("Cannot place the napkin pack without the wok counter");
    const counterBox = new THREE.Box3().setFromObject(wokCounter);
    const packX = (counterBox.min.x + counterBox.max.x) / 2 + 0.02, packZ = counterBox.min.z + 0.20;
    raycaster.set(new THREE.Vector3(packX, counterBox.max.y + 0.1, packZ), new THREE.Vector3(0, -1, 0));
    const counterHit = raycaster.intersectObject(wokCounter, true)[0];
    if (!counterHit) throw new Error("Cannot measure the wok counter top");
    pack.rotateY(Math.PI / 2 - 0.18 - 0.1);
    place("paperNapkin", "napkin-pack", pack, packX, packZ, 0.105, counterHit.point.y);
  }
  for (const row of [0, 1]) {
    const NEAR_Z = row === 0 ? 0.72 : 0.28;
    // Burgundy-style wine bottle: dark green glass, a blank cream label band, a burgundy foil capsule.
    const bottleProfile = [[0, 0], [0.034, 0], [0.038, 0.006], [0.038, 0.17], [0.034, 0.19], [0.022, 0.215], [0.0155, 0.235], [0.015, 0.285], [0.0165, 0.292], [0.0165, 0.30], [0, 0.30]];
    if (row === 0) place("decor", "wine-bottle", paint(lathe(bottleProfile, 20), (y, n) => (y > 0.255 ? 0x5a1a22 : y > 0.06 && y < 0.14 ? 0xd8ceba : n > 0.9 ? 0x2c3a2f : 0x1f2b22)), 0.17, NEAR_Z, 0.038);
    // Two brass candlesticks with cream taper candles (unlit, so no new light source).
    const holderProfile = [[0, 0], [0.034, 0], [0.036, 0.005], [0.014, 0.012], [0.009, 0.06], [0.014, 0.085], [0.018, 0.092], [0.012, 0.096], [0, 0.096]];
    for (const [index0, x] of [-0.28, 0.28].entries()) {
      const index = index0 + row * 2;
      const y = place("decor", `candlestick-${index}`, paint(lathe(holderProfile, 14), () => 0xb08d4e), x, NEAR_Z, 0.036);
      const candle = new THREE.CylinderGeometry(0.0095, 0.0105, 0.19, 10);
      candle.translate(x, y + 0.096 + 0.095 - 0.002, NEAR_Z);
      parts.decor.push(paint(candle, (yy) => (yy > y + 0.28 ? 0xcfc2a8 : 0xe9dfc9)));
      const wick = new THREE.CylinderGeometry(0.0009, 0.0009, 0.012, 4);
      wick.translate(x, y + 0.096 + 0.19 + 0.004, NEAR_Z);
      parts.decor.push(paint(wick, () => 0x2b2b2b));
    }
    // Stoneware bowl heaped with cranberries (muted deep red; the berries are the only red on the table).
    if (row === 0) {
    const bowlProfile = [[0, 0], [0.026, 0], [0.034, 0.006], [0.048, 0.034], [0.050, 0.046], [0.046, 0.046], [0.044, 0.036], [0.030, 0.014], [0, 0.014]];
    const bowlY = place("decor", "cranberry-bowl", paint(lathe(bowlProfile, 18), (y, n) => (n > 0.8 ? 0xcfc3ae : 0xd8ccb6)), -0.16, NEAR_Z, 0.050);
    const berryLayers = [[7, 0.026, 0.040], [5, 0.016, 0.050], [2, 0.006, 0.057]];
    let berryIndex = 0;
    for (const [count, ring, height] of berryLayers) {
      for (let i = 0; i < count; i++) {
        const angle = i * (Math.PI * 2 / count) + berryIndex * 0.6;
        const berry = new THREE.SphereGeometry(0.0095, 7, 5);
        berry.translate(-0.16 + Math.cos(angle) * ring, bowlY + height, NEAR_Z + Math.sin(angle) * ring);
        parts.decor.push(paint(berry, (y, n) => (n > 0.6 ? 0x7a2230 : 0x6a1d2b)));
        berryIndex++;
      }
    }
    }
    // Two extra wine glasses, the same glass and liquid treatment as the place settings.
    const wineRadius = 0.044, wineHeight = 0.100;
    const wineProfile = [[0, 0.001], [wineRadius * 0.59, 0.001], [wineRadius * 0.77, 0.006], [wineRadius * 0.89, 0.019], [wineRadius, wineHeight * 0.55], [wineRadius * 0.977, wineHeight * 0.80], [wineRadius * 0.91, wineHeight * 0.96], [wineRadius * 0.82, wineHeight], [wineRadius * 0.75, wineHeight * 0.97], [wineRadius * 0.80, wineHeight * 0.78], [wineRadius * 0.77, wineHeight * 0.55], [wineRadius * 0.66, 0.025], [wineRadius * 0.50, 0.011], [0, 0.011]];
    for (const [index0, [x0, fill]] of (row === 0 ? [[-0.045, 0.44], [0.065, 0.30]] : [[-0.015, 0.36], [0.10, 0.50]]).entries()) {
      const index = index0 + row * 2, x = x0;
      const y = place("glass", `wine-glass-${index}`, paint(lathe(wineProfile, 20), () => 0xe8f0ed), x, NEAR_Z, wineRadius);
      const wine = new THREE.CylinderGeometry(0.031, 0.031, 0.0015, 20, 1, false);
      wine.translate(x, y + 0.001 + wineHeight * fill, NEAR_Z);
      parts.liquid.push(paint(wine, () => 0x5c1823));
    }

    // Second bread course on the far side (Paul 2026-10-30: more abundant): a stoneware plate of five baked dinner rolls where the bottle stands on the other side.
    if (row === 1) {
      const platePro = [[0, 0], [0.052, 0], [0.067, 0.007], [0.070, 0.011], [0.064, 0.011], [0.048, 0.004], [0, 0.004]];
      const breadX = -0.155;
      const plateY = place("decor", "bread-plate", paint(lathe(platePro, 22), () => 0xd8ccb6), breadX, NEAR_Z, 0.070);
      const roll = (dx, dz, r, lift, tone) => {
        const geometry = new THREE.SphereGeometry(r, 10, 7);
        geometry.scale(1.08, 0.72, 1);
        geometry.translate(breadX + dx, plateY + 0.005 + r * 0.72 + lift, NEAR_Z + dz);
        parts.decor.push(paint(geometry, (y, n) => (y > plateY + 0.005 + r * 0.72 + lift + r * 0.2 ? (n > 0.5 ? 0xc78d4a : 0xb97d3d) : tone)));
      };
      for (let i = 0; i < 4; i++) roll(Math.cos(i * Math.PI / 2 + 0.5) * 0.033, Math.sin(i * Math.PI / 2 + 0.5) * 0.033, 0.023, 0, 0xd2a569);
      roll(0, 0, 0.022, 0.017, 0xd2a569);
    }
  }
  const materials = {
    decor: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.38, vertexColors: true }),
    paper: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.86, vertexColors: true }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.18, transparent: true, opacity: 0.30, depthWrite: false, vertexColors: true }),
    liquid: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.22, transparent: true, opacity: 0.78, depthWrite: false, vertexColors: true }),
  };
  const renderOrder = { liquid: 1, glass: 2, decor: 3 };
  let vertices = 0;
  let paperNapkinVertices = 0;
  for (const [kind, list] of Object.entries(parts)) {
    const geometry = mergeGeometries(list, false);
    list.forEach((part) => part.dispose());
    if (!geometry) throw new Error(`Could not merge Room 03 Thanksgiving ${kind}`);
    geometry.computeVertexNormals();
    if (kind !== "paperNapkin") vertices += geometry.attributes.position.count;
    const material = kind === "paperNapkin" ? materials.paper : materials[kind];
    const mesh = new THREE.Mesh(geometry, material);
    if (kind === "paperNapkin") {
      paperNapkinVertices = geometry.attributes.position.count;
      mesh.name = "room03-counter-paper-napkins";
      mesh.userData.category = "household-props";
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      continue;
    }
    mesh.name = `room03-thanksgiving-${kind}`;
    mesh.userData.category = "tableware";
    mesh.castShadow = kind === "decor";
    mesh.receiveShadow = true;
    mesh.renderOrder = renderOrder[kind];
    group.add(mesh);
  }
  const clearanceMm = (a, b) => Number(((Math.hypot(a.x - b.x, a.z - b.z) - a.radius - b.radius) * 1000).toFixed(1));
  let minNeighbourMm = Infinity;
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) minNeighbourMm = Math.min(minNeighbourMm, clearanceMm(items[i], items[j]));
  group.userData.vertices = vertices;
  group.userData.items = items;
  group.userData.minNeighbourMm = minNeighbourMm;
  return {
    group,
    paperNapkinPack: {
      mesh: scene.getObjectByName("room03-counter-paper-napkins"),
      vertices: paperNapkinVertices,
      items: paperNapkinItems,
    },
  };
}

const DINING_CHAIR_FOOT_CENTERS = Object.freeze([
  [-0.192, -0.182], [-0.192, 0.182], [0.192, -0.182], [0.192, 0.182],
]);
// Derived from vertical rays against the current seat shell; the QA hook remeasures them.
const DINING_CHAIR_FRONT_LEG_TOP_Y = Object.freeze({ left: 0.43344, right: 0.431981 });
const DINING_CHAIR_RAIL_TOP_Y = Object.freeze({
  "side-left": 0.407428, "side-right": 0.407428, "end-front": 0.4005, "end-rear": 0.4398,
});
const DINING_CHAIR_RAIL_HEIGHT = 0.03;

function measureDiningSeatGaps(shell) {
  const shellMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
  const shellMesh = new THREE.Mesh(shell, shellMaterial);
  const shellRaycaster = new THREE.Raycaster();
  const shellBottomAt = (x, z) => {
    shellRaycaster.set(new THREE.Vector3(x, 2, z), new THREE.Vector3(0, -1, 0));
    const intersections = shellRaycaster.intersectObject(shellMesh, false);
    if (!intersections.length) throw new Error(`No dining seat shell surface at ${x}, ${z}`);
    return Math.min(...intersections.map(({ point }) => point.y));
  };
  const railCenters = [
    { name: "side-left", point: [-0.15, 0] }, { name: "side-right", point: [0.15, 0] },
    { name: "end-front", point: [0, 0.145] }, { name: "end-rear", point: [0, -0.145] },
  ];
  const frontFeet = DINING_CHAIR_FOOT_CENTERS.filter(([, footZ]) => footZ > 0).map(([footX, footZ]) => {
    const topX = footX - Math.sign(footX) * 0.022;
    const topZ = footZ - 0.022;
    const shellBottomY = shellBottomAt(topX, topZ);
    let maxShellBottomY = shellBottomY;
    for (let around = 0; around < 12; around++) {
      const angle = around / 12 * Math.PI * 2;
      maxShellBottomY = Math.max(maxShellBottomY, shellBottomAt(topX + Math.cos(angle) * 0.023, topZ + Math.sin(angle) * 0.023));
    }
    const afterTopY = DINING_CHAIR_FRONT_LEG_TOP_Y[footX < 0 ? "left" : "right"];
    return {
      localFoot: [footX, footZ], localTopSample: [topX, topZ], shellBottomY,
      beforeTopY: 0.385, afterTopY,
      beforeGapMm: (shellBottomY - 0.385) * 1000,
      afterGapMm: (shellBottomY - afterTopY) * 1000,
      maxSampledShellBottomY: maxShellBottomY,
      maxSampledGapAfterMm: (maxShellBottomY - afterTopY) * 1000,
    };
  });
  const rails = railCenters.map(({ name, point: [x, z] }) => {
    const shellBottomY = shellBottomAt(x, z);
    const afterTopY = DINING_CHAIR_RAIL_TOP_Y[name];
    return {
      name, midpoint: [x, z], shellBottomY, beforeTopY: 0.375, afterTopY,
      afterBottomY: afterTopY - DINING_CHAIR_RAIL_HEIGHT, afterHeight: DINING_CHAIR_RAIL_HEIGHT,
      beforeGapMm: (shellBottomY - 0.375) * 1000,
      afterGapMm: (shellBottomY - afterTopY) * 1000,
    };
  });
  shellMaterial.dispose();
  return {
    frontFeet: DINING_CHAIR_PLACEMENTS.flatMap((placement) => frontFeet.map((measurement) => ({
      chair: `room03-dining-chair-${placement.x}-${placement.z}`, ...measurement,
    }))),
    rails: DINING_CHAIR_PLACEMENTS.flatMap((placement) => rails.map((measurement) => ({
      chair: `room03-dining-chair-${placement.x}-${placement.z}`, ...measurement,
    }))),
  };
}

function buildProceduralDiningChairs(scene, m) {
  const shell = makeDiningShellGeometry();
  const legParts = [];
  for (const [footX, footZ] of DINING_CHAIR_FOOT_CENTERS) {
    const topX = footX - Math.sign(footX) * 0.022;
    const topZ = footZ - Math.sign(footZ) * 0.022;
    const height = 0.365;
    const leg = new THREE.CylinderGeometry(0.023, 0.012, height, 10, 1);
    const position = leg.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const t = THREE.MathUtils.clamp((position.getY(i) + height / 2) / height, 0, 1);
      position.setXYZ(i,
        footX + (topX - footX) * t + position.getX(i),
        0.02 + height * t,
        footZ + (topZ - footZ) * t + position.getZ(i));
    }
    position.needsUpdate = true;
    leg.computeVertexNormals();
    legParts.push(leg);
    if (footZ > 0) {
      const targetY = DINING_CHAIR_FRONT_LEG_TOP_Y[footX < 0 ? "left" : "right"];
      const originalTop = new THREE.Vector3(topX, 0.02 + height, topZ);
      const horizontalPerY = new THREE.Vector3(topX - footX, 0, topZ - footZ).divideScalar(height);
      const start = originalTop.clone().addScaledVector(horizontalPerY, -0.001);
      start.y -= 0.001;
      const deltaY = targetY - start.y;
      const end = new THREE.Vector3(start.x + horizontalPerY.x * deltaY, targetY, start.z + horizontalPerY.z * deltaY);
      const direction = end.clone().sub(start);
      const extension = new THREE.CylinderGeometry(0.023, 0.023, direction.length(), 10, 1);
      extension.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize()));
      extension.translate((start.x + end.x) / 2, (start.y + end.y) / 2, (start.z + end.z) / 2);
      legParts.push(extension);
    }
  }
  for (const sign of [-1, 1]) {
    const backPost = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(sign * 0.17, 0.365, -0.16),
      new THREE.Vector3(sign * 0.215, 0.50, -0.18),
      new THREE.Vector3(sign * 0.22, 0.62, -0.21),
      new THREE.Vector3(sign * 0.20, 0.74, -0.24),
      new THREE.Vector3(sign * 0.105, 0.82, -0.26),
    ]), 10, 0.012, 6, false);
    legParts.push(backPost);
  }
  for (const sign of [-1, 1]) {
    const sideRailName = sign < 0 ? "side-left" : "side-right";
    const sideRailTop = DINING_CHAIR_RAIL_TOP_Y[sideRailName];
    const sideRailHeight = DINING_CHAIR_RAIL_HEIGHT;
    const sideRail = new THREE.BoxGeometry(0.026, sideRailHeight, 0.29);
    sideRail.translate(sign * 0.15, sideRailTop - sideRailHeight / 2, 0);
    legParts.push(sideRail);
    const endRailName = sign < 0 ? "end-rear" : "end-front";
    const endRailTop = DINING_CHAIR_RAIL_TOP_Y[endRailName];
    const endRailHeight = DINING_CHAIR_RAIL_HEIGHT;
    const endRail = new THREE.BoxGeometry(0.29, endRailHeight, 0.026);
    endRail.translate(0, endRailTop - endRailHeight / 2, sign * 0.145);
    legParts.push(endRail);
  }
  const legs = mergeGeometries(legParts, false);
  legParts.forEach((part) => part.dispose());
  const upholstery = m.loungeFabric.clone(); upholstery.name = "warm-oat-linen";
  upholstery.map = upholstery.map.clone();
  upholstery.map.repeat.set(2, 2);
  upholstery.map.needsUpdate = true;
  const chairWood = m.oak.clone();
  chairWood.name = "soft-oak-chair-frame";
  chairWood.color.set(0xa58a68);
  for (const placement of DINING_CHAIR_PLACEMENTS) {
    const chair = new THREE.Group();
    chair.name = `room03-dining-chair-${placement.x}-${placement.z}`;
    chair.position.set(...placement.position);
    chair.rotation.y = placement.yaw;
    chair.userData.category = "dining-chairs";
    for (const [name, geometry, material] of [["upholstered-shell", shell, upholstery], ["tapered-oak-legs", legs, chairWood]]) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = name; mesh.castShadow = true; mesh.receiveShadow = true;
      mesh.userData.category = "dining-chairs"; mesh.userData.furnitureAsset = "chair";
      chair.add(mesh);
    }
    scene.add(chair);
  }
  let cachedSeatGapMeasurements = null;
  return () => (cachedSeatGapMeasurements ??= measureDiningSeatGaps(shell));
}

// Local, four-material procedural furniture: no external model or cloth simulation.
const LOUNGE_PLACEMENT = Object.freeze({ position: [-2.29, 0, -0.20], yaw: THREE.MathUtils.degToRad(8) });

// Seat, back and arms are the same ellipsoids buildLoungeChair places. Fit checks use these, not the tessellated mesh.
const LOUNGE_SEAT = Object.freeze({ center: [0, 0.355, 0.025], radii: [0.34, 0.087, 0.345], rotation: [0, 0, 0] });
const LOUNGE_BACK = Object.freeze({ center: [0, 0.59, -0.26], radii: [0.355, 0.19, 0.135], rotation: [-0.12, 0, 0] });
const LOUNGE_ARMS = Object.freeze([-1, 1].map((side) => Object.freeze({
  center: [side * 0.311, 0.52, -0.012], radii: [0.075, 0.138, 0.335], rotation: [-0.12, 0, side * 0.08],
})));
const LOUNGE_RIM = Object.freeze([
  [-0.32, 0.55, 0.205], [-0.33, 0.61, -0.115], [-0.25, 0.715, -0.287], [0, 0.775, -0.305],
  [0.25, 0.715, -0.287], [0.33, 0.61, -0.115], [0.32, 0.55, 0.205],
]);
const LOUNGE_PILLOW_POSE = Object.freeze({ position: [0.02, 0.53, -0.023], rotation: [0.75, 0.16, -0.03] });
const LOUNGE_LEG_PULL = 0.065;
const LOUNGE_LEG_TOP_Y = 0.35;

function loungeSolid(spec) {
  const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(...spec.rotation));
  return { center: new THREE.Vector3(...spec.center), radii: spec.radii, quat };
}

function loungeClosest(point, solid) {
  const local = point.clone().sub(solid.center).applyQuaternion(solid.quat.clone().invert());
  const [a, b, c] = solid.radii;
  const a2 = a * a, b2 = b * b, c2 = c * c;
  const implicit = (local.x * local.x) / a2 + (local.y * local.y) / b2 + (local.z * local.z) / c2;
  if (local.lengthSq() < 1e-10) {
    const minRadius = Math.min(a, b, c);
    const axis = a <= b && a <= c ? new THREE.Vector3(a, 0, 0) : b <= c ? new THREE.Vector3(0, b, 0) : new THREE.Vector3(0, 0, c);
    return { point: axis.applyQuaternion(solid.quat).add(solid.center), signed: -minRadius };
  }
  const gOf = (t) => (a * local.x / (a2 + t)) ** 2 + (b * local.y / (b2 + t)) ** 2 + (c * local.z / (c2 + t)) ** 2 - 1;
  let lo;
  let hi;
  if (implicit > 1) {
    lo = 0; hi = 1;
    while (gOf(hi) > 0) hi *= 2;
  } else {
    hi = 0;
    lo = -Math.min(a2, b2, c2) + 1e-6;
    let guard = 0;
    while (gOf(lo) < 0 && guard < 20) { lo = (lo - Math.min(a2, b2, c2)) * 0.5; guard += 1; }
  }
  for (let step = 0; step < 50; step += 1) {
    const mid = (lo + hi) / 2;
    if (gOf(mid) > 0) lo = mid; else hi = mid;
  }
  const t = (lo + hi) / 2;
  const closest = new THREE.Vector3(a2 * local.x / (a2 + t), b2 * local.y / (b2 + t), c2 * local.z / (c2 + t));
  closest.applyQuaternion(solid.quat).add(solid.center);
  return { point: closest, signed: point.distanceTo(closest) * (implicit < 1 ? -1 : 1) };
}

function loungeSignedDistance(point, solid) {
  return loungeClosest(point, solid).signed;
}

function loungeRimDistance(point, samples) {
  let best = Infinity;
  for (const sample of samples) best = Math.min(best, point.distanceTo(sample));
  return best - 0.047;
}

function makeLoungePillowGeometry() {
  // A sewn cushion: plump crown, flatter underside, a welt, pinched corners and one sitting dent.
  // Same 12×12 sheet as before so the vertex count does not move.
  const nx = 12, nz = 12, row = nx + 1;
  const width = 0.34, depth = 0.26, thick = 0.058;
  const positions = [], uvs = [], indices = [];
  for (const side of [1, -1]) {
    for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
      const u = i / nx * 2 - 1, v = j / nz * 2 - 1;
      const dome = Math.pow(Math.max(0, 1 - u * u), 0.58) * Math.pow(Math.max(0, 1 - v * v), 0.66);
      const edge = Math.max(Math.abs(u), Math.abs(v));
      const pinch = Math.pow(Math.max(0, Math.abs(u) + Math.abs(v) - 1.05), 2);
      const crown = side > 0 ? dome : Math.pow(dome, 1.45);
      let y = side * Math.max(thick * crown, 0.011 * (1 - 0.35 * edge));
      if (side > 0) y -= 0.014 * Math.exp(-(u * u * 2.2 + v * v * 0.7));
      y -= side * 0.012 * pinch;
      positions.push(u * width * 0.5 * (1 - 0.06 * v * v), y, v * depth * 0.5 * (1 - 0.05 * u * u));
      uvs.push(i / nx, j / nz);
    }
  }
  const faceCount = row * row;
  for (let side = 0; side < 2; side++) for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const a = side * faceCount + j * row + i, b = a + 1, c = a + row, d = c + 1;
    if (side === 0) indices.push(a, b, d, a, d, c);
    else indices.push(a, d, b, a, c, d);
  }
  const rim = [];
  for (let i = 0; i <= nx; i++) rim.push(i);
  for (let j = 1; j <= nz; j++) rim.push(j * row + nx);
  for (let i = nx - 1; i >= 0; i--) rim.push(nz * row + i);
  for (let j = nz - 1; j > 0; j--) rim.push(j * row);
  for (let k = 0; k < rim.length; k++) {
    const a = rim[k], b = rim[(k + 1) % rim.length];
    indices.push(a, a + faceCount, b + faceCount, a, b + faceCount, b);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
}

function makeLoungeThrowGeometry() {
  // Positions are the settled cloth from #577: 782 vertices, 16×22 sheet, both sides of the
  // 6.5 mm shell, after the 12 + 12 + 6 clearance passes. Load reads those bytes instead of
  // running the settle loop (~45–60 ms). UVs and the index winding are the same grid.
  const nx = 16, nz = 22, row = nx + 1;
  const binary = atob(LOUNGE_THROW_POSITIONS_B64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const positions = new Float32Array(bytes.buffer);
  const count = positions.length / 3;
  const uvs = new Float32Array(count * 2);
  let uv = 0;
  for (let side = 0; side < 2; side++) {
    for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
      uvs[uv++] = i / nx;
      uvs[uv++] = j / nz;
    }
  }
  const indices = [];
  const faceCount = row * (nz + 1);
  for (let side = 0; side < 2; side++) for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const a = side * faceCount + j * row + i, b = a + 1, c = a + row, d = c + 1;
    if (side === 0) indices.push(a, d, b, a, c, d);
    else indices.push(a, b, d, a, d, c);
  }
  for (let j = 0; j < nz; j++) for (const i of [0, nx]) {
    const a = j * row + i, b = (j + 1) * row + i;
    indices.push(a, b, b + faceCount, a, b + faceCount, a + faceCount);
  }
  for (let i = 0; i < nx; i++) for (const j of [0, nz]) {
    const a = j * row + i, b = a + 1;
    indices.push(a, a + faceCount, b + faceCount, a, b + faceCount, b);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function makeLoungeLegGeometry() {
  // The old tops splayed past the seat. Pull each top inward under the cushion and keep the floor footprint.
  const bottoms = [];
  for (const x of [-0.26, 0.26]) for (const z of [-0.25, 0.25]) {
    const probe = new THREE.CylinderGeometry(0.028, 0.018, 0.31, 8);
    probe.applyMatrix4(new THREE.Matrix4().compose(
      new THREE.Vector3(x, 0.155, z),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0.065 * Math.sign(z), 0, -0.065 * Math.sign(x))),
      new THREE.Vector3(1, 1, 1),
    ));
    const source = probe.attributes.position;
    const points = [];
    for (let i = 0; i < source.count; i++) points.push(new THREE.Vector3().fromBufferAttribute(source, i));
    points.sort((a, b) => a.y - b.y);
    bottoms.push(points.slice(0, 10).reduce((sum, point) => sum.add(point), new THREE.Vector3()).multiplyScalar(0.1));
    probe.dispose();
  }
  const legs = bottoms.map((bottom) => {
    const inward = new THREE.Vector3(-bottom.x, 0, 0.025 - bottom.z).normalize();
    const top = new THREE.Vector3(bottom.x + inward.x * LOUNGE_LEG_PULL, LOUNGE_LEG_TOP_Y, bottom.z + inward.z * LOUNGE_LEG_PULL);
    const axis = new THREE.Vector3().subVectors(top, bottom);
    const leg = new THREE.CylinderGeometry(0.028, 0.018, axis.length(), 8);
    leg.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis.clone().normalize()));
    leg.translate((bottom.x + top.x) / 2, (bottom.y + top.y) / 2, (bottom.z + top.z) / 2);
    return leg;
  });
  const merged = mergeGeometries(legs, false);
  legs.forEach((leg) => leg.dispose());
  merged.computeBoundingBox();
  merged.translate(0, -merged.boundingBox.min.y, 0);
  return merged;
}

function measureLoungeFit(chair) {
  if (chair.userData.loungeFit) return chair.userData.loungeFit;
  const seat = loungeSolid(LOUNGE_SEAT);
  const back = loungeSolid(LOUNGE_BACK);
  const arms = LOUNGE_ARMS.map(loungeSolid);
  const rimSamples = new THREE.CatmullRomCurve3(LOUNGE_RIM.map((point) => new THREE.Vector3(...point))).getPoints(120);
  const pointsOf = (name) => {
    const position = chair.getObjectByName(name).geometry.attributes.position;
    const points = [];
    for (let i = 0; i < position.count; i++) points.push(new THREE.Vector3().fromBufferAttribute(position, i));
    return points;
  };
  const throwPoints = pointsOf("lounge-draped-throw");
  let throwSeat = Infinity, throwBack = Infinity, throwArm = Infinity, throwRim = Infinity, nearSeat = 0;
  for (const point of throwPoints) {
    const seatGap = loungeSignedDistance(point, seat);
    throwSeat = Math.min(throwSeat, seatGap);
    throwBack = Math.min(throwBack, loungeSignedDistance(point, back));
    throwRim = Math.min(throwRim, loungeRimDistance(point, rimSamples));
    for (const arm of arms) throwArm = Math.min(throwArm, loungeSignedDistance(point, arm));
    if (seatGap > -0.004 && seatGap < 0.014) nearSeat += 1;
  }
  const pillowPoints = pointsOf("lounge-sage-pillow");
  const pillowCenter = pillowPoints.reduce((sum, point) => sum.add(point), new THREE.Vector3()).multiplyScalar(1 / pillowPoints.length);
  let pillowSeat = Infinity, pillowBack = Infinity, pillowArm = Infinity, pressed = 0;
  for (const point of pillowPoints) {
    const seatGap = loungeSignedDistance(point, seat);
    pillowSeat = Math.min(pillowSeat, seatGap);
    pillowBack = Math.min(pillowBack, loungeSignedDistance(point, back));
    for (const arm of arms) pillowArm = Math.min(pillowArm, loungeSignedDistance(point, arm));
    if (seatGap < -0.002) pressed += 1;
  }
  const centerBack = loungeSignedDistance(pillowCenter, back);
  const centerSeat = loungeSignedDistance(pillowCenter, seat);
  const legPoints = pointsOf("lounge-oak-legs");
  const groups = new Map();
  for (const point of legPoints) {
    const name = `${point.x < 0 ? "left" : "right"}-${point.z < 0 ? "back" : "front"}`;
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(point);
  }
  const feet = [...groups.entries()].map(([name, points]) => {
    const topY = points.reduce((best, point) => Math.max(best, point.y), -Infinity);
    const cap = points.filter((point) => point.y > topY - 0.012);
    const worstSigned = cap.reduce((best, point) => Math.max(best, loungeSignedDistance(point, seat)), -Infinity);
    return { name, embedMm: -worstSigned * 1000, signedGapMm: worstSigned * 1000, topY };
  }).sort((a, b) => a.name.localeCompare(b.name));
  const fit = {
    throw: {
      armClearanceMm: throwArm * 1000,
      seatClearanceMm: throwSeat * 1000,
      backClearanceMm: throwBack * 1000,
      rimClearanceMm: throwRim * 1000,
      nearSeatSamples: nearSeat,
      vertices: throwPoints.length,
    },
    pillow: {
      inSeatBackZone: Math.abs(pillowCenter.x) <= 0.14 && pillowCenter.y >= 0.46 && pillowCenter.y <= 0.58 && pillowCenter.z >= -0.05 && pillowCenter.z <= 0.12 && centerBack > 0.015 && centerSeat > 0.02,
      center: pillowCenter.toArray(),
      seatEmbedMm: -pillowSeat * 1000,
      backClearanceMm: pillowBack * 1000,
      armClearanceMm: pillowArm * 1000,
      pressedFraction: pressed / pillowPoints.length,
      vertices: pillowPoints.length,
    },
    feet,
    legVertices: legPoints.length,
  };
  chair.userData.loungeFit = fit;
  return fit;
}

function collectWorldPoints(root) {
  const points = [];
  if (!root) return points;
  root.updateWorldMatrix(true, true);
  root.traverse((object) => {
    if (!object.isMesh || !object.geometry?.attributes?.position) return;
    const position = object.geometry.attributes.position;
    for (let i = 0; i < position.count; i++) points.push(new THREE.Vector3().fromBufferAttribute(position, i).applyMatrix4(object.matrixWorld));
  });
  return points;
}

function measureRoomFootToBody(scene, tableStatus, diningGaps, loungeFit) {
  const round = (millimetres) => Math.round(millimetres * 10) / 10;
  const rows = loungeFit.feet.map((foot) => ({
    item: `window lounge chair, ${foot.name} foot`,
    support: "seat cushion",
    gapMm: round(foot.signedGapMm),
    repairedInThisPr: true,
    note: "negative means the foot top is inside the cushion",
  }));
  const seenChairs = new Set();
  for (const measurement of diningGaps.frontFeet) {
    if (seenChairs.has(measurement.chair)) continue;
    seenChairs.add(measurement.chair);
    const feet = diningGaps.frontFeet.filter((item) => item.chair === measurement.chair);
    const rails = diningGaps.rails.filter((item) => item.chair === measurement.chair);
    const worst = Math.max(...feet.map((item) => item.afterGapMm), ...rails.map((item) => item.afterGapMm));
    rows.push({
      item: measurement.chair,
      support: "seat shell",
      gapMm: round(worst),
      repairedInThisPr: false,
      note: "existing front-foot and rail gap; left unchanged",
    });
  }
  const table = scene.getObjectByName(tableStatus === "glb" ? "room03-table-glb" : "merged-dining-table");
  let tableTrianglesToRail = 0;
  if (table) {
    table.updateWorldMatrix(true, true);
    table.traverse((object) => {
      const index = object.geometry?.index;
      const position = object.geometry?.attributes?.position;
      if (!object.isMesh || !index || !position) return;
      const pointAt = (vertex) => new THREE.Vector3().fromBufferAttribute(position, vertex).applyMatrix4(object.matrixWorld);
      for (let triangle = 0; triangle < index.count; triangle += 3) {
        const ys = [0, 1, 2].map((offset) => pointAt(index.getX(triangle + offset)).y);
        if (Math.min(...ys) < 0.08 && Math.max(...ys) >= 0.67) tableTrianglesToRail += 1;
      }
    });
  }
  rows.push({
    item: "dining table",
    support: tableStatus === "glb" ? "dining-table-v2.glb" : "procedural fallback",
    gapMm: tableTrianglesToRail > 0 ? 0 : null,
    trianglesFromFloorIntoRail: tableTrianglesToRail,
    repairedInThisPr: false,
    note: tableTrianglesToRail > 0 ? "leg faces run from the floor vertices into the rail" : "no face joins a floor vertex to the rail",
  });
  const islandPoints = collectWorldPoints(scene.getObjectByName("merged-kitchen")).filter((point) => point.z < -1.55 && point.z > -2.45 && Math.abs(point.x) < 2.2 && point.y < 1);
  const islandKick = islandPoints.filter((point) => point.y < 0.112);
  const islandBody = islandPoints.filter((point) => point.y >= 0.112 && point.y < 0.9);
  rows.push({
    item: "kitchen island cabinet",
    support: "kick and cabinet box",
    gapMm: islandKick.length && islandBody.length ? round((Math.min(...islandBody.map((point) => point.y)) - Math.max(...islandKick.map((point) => point.y))) * 1000) : null,
    repairedInThisPr: false,
    note: "measured on the merged cabinet mesh; not changed",
  });
  const wokPoints = collectWorldPoints(scene.getObjectByName("merged-wok-base-cabinet"));
  const wokKick = wokPoints.filter((point) => point.y < 0.121);
  const wokBody = wokPoints.filter((point) => point.y >= 0.121 && point.y < 0.5);
  rows.push({
    item: "wok base cabinet",
    support: "kick and cabinet box",
    gapMm: wokKick.length && wokBody.length ? round((Math.min(...wokBody.map((point) => point.y)) - Math.max(...wokKick.map((point) => point.y))) * 1000) : null,
    repairedInThisPr: true,
    note: "kick and cabinet share y 0.12; the reading is the next bevel vertex above that plane",
  });
  const floorLamp = scene.getObjectByName("floor-reading-lamp");
  const floorLampMinY = floorLamp ? new THREE.Box3().setFromObject(floorLamp).min.y : null;
  rows.push({
    item: "floor reading lamp",
    support: "floor",
    gapMm: floorLampMinY === null ? null : round(floorLampMinY * 1000),
    repairedInThisPr: true,
    note: "replaces the fiddle-leaf fig; the base sits on the floor",
  });
  const centerpiece = scene.getObjectByName("prop-tabletop-meyer-lemon-bowl");
  const tableBox = table ? new THREE.Box3().setFromObject(table) : null;
  const centerpieceBox = centerpiece ? new THREE.Box3().setFromObject(centerpiece) : null;
  rows.push({
    item: "Meyer lemon bowl",
    support: tableStatus === "glb" ? "dining table GLB top" : "fallback table top",
    gapMm: centerpieceBox && tableBox ? round((centerpieceBox.min.y - tableBox.max.y) * 1000) : null,
    repairedInThisPr: true,
    note: "bowl base rests on the loaded table top",
  });
  const redPot = scene.getObjectByName("single-terracotta-pot");
  const potBox = redPot ? new THREE.Box3().setFromObject(redPot) : null;
  const potPartBounds = (name) => {
    const part = redPot?.getObjectByName(name);
    if (!part) return null;
    return new THREE.Box3().setFromObject(part);
  };
  const bodyBox = potPartBounds("single-terracotta-pot-body");
  const rimBox = potPartBounds("terracotta-pot-rim");
  const lidBox = potPartBounds("terracotta-pot-lid");
  const leftHandleBox = potPartBounds("terracotta-pot-handle-left");
  const rightHandleBox = potPartBounds("terracotta-pot-handle-right");
  const applianceSurface = scene.getObjectByName("merged-appliances");
  let cooktopTop = null;
  if (potBox && applianceSurface) {
    const raycaster = new THREE.Raycaster(new THREE.Vector3(0.82, potBox.min.y + 0.1, -2.02), new THREE.Vector3(0, -1, 0), 0, 0.2);
    const hit = raycaster.intersectObject(applianceSurface, false).find(({ point }) => Math.hypot(point.x - 0.82, point.z + 2.02) < 0.025);
    cooktopTop = hit?.point.y ?? null;
  }
  rows.push({
    item: "terracotta pot",
    support: "main cooktop",
    gapMm: potBox && cooktopTop !== null ? round((potBox.min.y - cooktopTop) * 1000) : null,
    repairedInThisPr: true,
    note: "vertical ray at pot center against the merged appliance surface; negative means the pot intersects the cooktop",
    geometry: potBox && bodyBox && rimBox && lidBox && leftHandleBox && rightHandleBox ? {
      position: [round(redPot.position.x * 1000) / 1000, round(redPot.position.y * 1000) / 1000, round(redPot.position.z * 1000) / 1000],
      body: { size: bodyBox.getSize(new THREE.Vector3()).toArray().map((value) => round(value * 1000) / 1000) },
      bounds: { size: potBox.getSize(new THREE.Vector3()).toArray().map((value) => round(value * 1000) / 1000) },
      leftHandleOutstandMm: round((bodyBox.min.x - leftHandleBox.min.x) * 1000),
      rightHandleOutstandMm: round((rightHandleBox.max.x - bodyBox.max.x) * 1000),
      handleLidClearanceMm: round((lidBox.min.y - Math.max(leftHandleBox.max.y, rightHandleBox.max.y)) * 1000),
      lidRimOverlapMm: round((Math.min(lidBox.max.y, rimBox.max.y) - Math.max(lidBox.min.y, rimBox.min.y)) * 1000),
      vertices: redPot.children.reduce((sum, part) => sum + (part.geometry?.attributes?.position?.count || 0), 0),
      triangles: redPot.children.reduce((sum, part) => sum + (part.geometry?.index ? part.geometry.index.count / 3 : (part.geometry?.attributes?.position?.count || 0) / 3), 0),
      meshes: redPot.children.filter((part) => part.isMesh).length,
      bodyColor: `#${redPot.getObjectByName("single-terracotta-pot-body")?.material.color.getHexString() || ""}`,
      knobColor: `#${redPot.getObjectByName("terracotta-pot-knob")?.material.color.getHexString() || ""}`,
    } : null,
  });
  const mediaPoints = collectWorldPoints(scene.getObjectByName("room03-wall-art-and-media-woodwork")).filter((point) => point.x > -1.35 && point.x < 0.05 && point.z > 3.25 && point.z < 3.85);
  const plinth = mediaPoints.filter((point) => point.y < 0.15);
  const shelf = mediaPoints.filter((point) => point.y >= 0.16 && point.y < 0.28);
  rows.push({
    item: "media console",
    support: "plinth to the shelf above",
    gapMm: plinth.length && shelf.length ? round((Math.min(...shelf.map((point) => point.y)) - Math.max(...plinth.map((point) => point.y))) * 1000) : null,
    repairedInThisPr: false,
    note: "open plinth; listed only, not changed",
  });
  return rows;
}

function buildLoungeChair(scene, m) {
  const chair = new THREE.Group();
  chair.name = "room03-window-lounge-chair";
  chair.position.set(...LOUNGE_PLACEMENT.position);
  chair.rotation.y = LOUNGE_PLACEMENT.yaw;
  chair.userData.category = "lounge-chair";
  const placed = (geometry, position, scale = [1, 1, 1], rotation = [0, 0, 0]) => {
    geometry.applyMatrix4(new THREE.Matrix4().compose(
      new THREE.Vector3(...position),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
      new THREE.Vector3(...scale),
    ));
    return geometry;
  };
  const addPart = (name, geometry, material) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name; mesh.userData.category = "lounge-chair";
    mesh.castShadow = true; mesh.receiveShadow = true;
    chair.add(mesh);
  };
  const body = [
    placed(new THREE.SphereGeometry(1, 20, 14), LOUNGE_SEAT.center, LOUNGE_SEAT.radii, LOUNGE_SEAT.rotation),
    placed(new THREE.SphereGeometry(1, 20, 14), LOUNGE_BACK.center, LOUNGE_BACK.radii, LOUNGE_BACK.rotation),
    ...LOUNGE_ARMS.map((arm) => placed(new THREE.SphereGeometry(1, 16, 12), arm.center, arm.radii, arm.rotation)),
  ];
  const paddedRim = new THREE.CatmullRomCurve3(LOUNGE_RIM.map((point) => new THREE.Vector3(...point)));
  body.push(new THREE.TubeGeometry(paddedRim, 32, 0.047, 7, false));
  addPart("lounge-upholstery", mergeGeometries(body, false), m.loungeFabric);
  addPart("lounge-oak-legs", makeLoungeLegGeometry(), m.oak);
  addPart("lounge-sage-pillow", placed(makeLoungePillowGeometry(), LOUNGE_PILLOW_POSE.position, [1, 1, 1], LOUNGE_PILLOW_POSE.rotation), m.loungePillow);
  addPart("lounge-draped-throw", makeLoungeThrowGeometry(), m.loungeThrow);
  scene.add(chair);
  return chair;
}

// A low round ottoman in front of the window lounge chair (Paul 2026-10-29: nothing in front of the chair looked odd; somewhere to rest the feet).
// Round bouclé cushion on four splayed oak legs, the same cloth and wood as the chair so it reads as one set. The chair faces +z in its own frame.
const OTTOMAN = Object.freeze({
  chairLocal: [0.02, 0.72], yawOffset: 0.12,
  radius: 0.24, bottomY: 0.22, height: 0.12,
  legRadius: [0.026, 0.016], legRing: 0.15, legSplay: 0.07, legEmbed: 0.006,
});

function buildLoungeOttoman(scene, m, chair) {
  const group = new THREE.Group();
  group.name = "room03-lounge-ottoman";
  group.userData.category = "lounge-chair";
  const yaw = chair.rotation.y;
  const cosYaw = Math.cos(yaw), sinYaw = Math.sin(yaw);
  const [localX, localZ] = OTTOMAN.chairLocal;
  group.position.set(chair.position.x + localX * cosYaw + localZ * sinYaw, 0, chair.position.z - localX * sinYaw + localZ * cosYaw);
  group.rotation.y = yaw + OTTOMAN.yawOffset;
  const r = OTTOMAN.radius, h = OTTOMAN.height, y0 = OTTOMAN.bottomY;
  const profile = [[0, 0], [r * 0.82, 0], [r * 0.95, h * 0.1], [r, h * 0.36], [r * 0.998, h * 0.62], [r * 0.97, h * 0.82], [r * 0.88, h * 0.96], [r * 0.6, h * 0.995], [0, h]];
  const cushion = new THREE.LatheGeometry(profile.map(([x, y]) => new THREE.Vector2(x, y)), 28);
  cushion.translate(0, y0, 0);
  cushion.computeVertexNormals();
  const cloth = m.loungeFabric.clone();
  cloth.name = "ottoman-warm-oat-boucle";
  cloth.map = cloth.map.clone();
  cloth.map.repeat.set(3, 1);
  cloth.map.needsUpdate = true;
  const legParts = [];
  const legTopY = y0 + OTTOMAN.legEmbed;
  const footRingLocal = [];
  for (let i = 0; i < 4; i++) {
    const angle = Math.PI / 4 + i * Math.PI / 2;
    const dx = Math.cos(angle), dz = Math.sin(angle);
    const top = new THREE.Vector3(dx * OTTOMAN.legRing, legTopY, dz * OTTOMAN.legRing);
    const bottom = new THREE.Vector3(dx * (OTTOMAN.legRing + OTTOMAN.legSplay), 0, dz * (OTTOMAN.legRing + OTTOMAN.legSplay));
    const axis = new THREE.Vector3().subVectors(top, bottom);
    const leg = new THREE.CylinderGeometry(OTTOMAN.legRadius[0], OTTOMAN.legRadius[1], axis.length(), 10);
    leg.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis.clone().normalize()));
    leg.translate((top.x + bottom.x) / 2, (top.y + bottom.y) / 2, (top.z + bottom.z) / 2);
    legParts.push(leg);
    footRingLocal.push([bottom.x, bottom.z]);
  }
  const legs = mergeGeometries(legParts, false);
  legParts.forEach((part) => part.dispose());
  // Tilted cylinders: their lowest rim point sits below the end-cap centre, so lift the legs until the lowest vertex rests exactly on the floor.
  legs.computeBoundingBox();
  legs.translate(0, -legs.boundingBox.min.y, 0);
  legs.computeBoundingBox();
  for (const [name, geometry, material] of [["lounge-ottoman-cushion", cushion, cloth], ["lounge-ottoman-legs", legs, m.oak]]) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name; mesh.userData.category = "lounge-chair";
    mesh.castShadow = true; mesh.receiveShadow = true;
    group.add(mesh);
  }
  scene.add(group);
  scene.updateMatrixWorld(true);
  // World positions of the four feet (for the contact-shadow decals) and measured fit, all in millimetres.
  const matrix = group.matrixWorld;
  const feet = footRingLocal.map(([x, z]) => new THREE.Vector3(x, 0, z).applyMatrix4(matrix).toArray());
  group.userData.feet = feet;
  group.userData.vertices = cushion.attributes.position.count + legs.attributes.position.count;
  group.userData.measure = () => {
    scene.updateMatrixWorld(true);
    const world = new THREE.Matrix4().copy(group.matrixWorld);
    const legMesh = group.getObjectByName("lounge-ottoman-legs"), cushionMesh = group.getObjectByName("lounge-ottoman-cushion");
    const legBox = new THREE.Box3().setFromObject(legMesh), cushionBox = new THREE.Box3().setFromObject(cushionMesh);
    // Chair-local distance from the cushion rim to the chair's seat and arms (analytic ellipsoids, not the tessellated mesh).
    const chairInverse = new THREE.Matrix4().copy(chair.matrixWorld).invert();
    const seat = loungeSolid(LOUNGE_SEAT), arms = LOUNGE_ARMS.map(loungeSolid);
    let chairClearance = Infinity;
    for (let i = 0; i < 48; i++) {
      const a = i * Math.PI * 2 / 48;
      for (const y of [OTTOMAN.bottomY + 0.01, OTTOMAN.bottomY + OTTOMAN.height * 0.5, OTTOMAN.bottomY + OTTOMAN.height]) {
        const point = new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r).applyMatrix4(world).applyMatrix4(chairInverse);
        chairClearance = Math.min(chairClearance, loungeSignedDistance(point, seat), ...arms.map((arm) => loungeSignedDistance(point, arm)));
      }
    }
    // Leg tops against the cushion underside, in the ottoman's own frame.
    cushionMesh.geometry.computeBoundingBox();
    const legPositions = legMesh.geometry.attributes.position;
    let legTopY = -Infinity;
    for (let i = 0; i < legPositions.count; i++) legTopY = Math.max(legTopY, legPositions.getY(i));
    return {
      position: group.position.toArray(), yawDegrees: THREE.MathUtils.radToDeg(group.rotation.y),
      topY: Number(cushionBox.max.y.toFixed(4)), seatTopY: Number((LOUNGE_SEAT.center[1] + LOUNGE_SEAT.radii[1]).toFixed(4)),
      footFloorGapMm: Number((legBox.min.y * 1000).toFixed(2)),
      legTopEmbedMm: Number(((legTopY - OTTOMAN.bottomY) * 1000).toFixed(2)),
      cushionBottomGapMm: Number(((cushionBox.min.y - OTTOMAN.bottomY) * 1000).toFixed(2)),
      chairClearanceMm: Number((chairClearance * 1000).toFixed(1)),
      diameterMm: Number((cushionMesh.geometry.boundingBox ? (cushionMesh.geometry.boundingBox.max.x - cushionMesh.geometry.boundingBox.min.x) * 1000 : 0).toFixed(0)),
      bounds: { min: cushionBox.min.toArray(), max: cushionBox.max.toArray() },
      legBounds: { min: legBox.min.toArray(), max: legBox.max.toArray() },
    };
  };
  return group;
}

// Burnt-orange sneaker-box board (Room 02 bookshelf palette #c4622d); created once, shared by both builds.
let shoeboxOrangeMaterial = null;
const shoeboxOrange = () => shoeboxOrangeMaterial || (shoeboxOrangeMaterial = new THREE.MeshStandardMaterial({ color: 0xc4622d, roughness: 0.75, name: "shoebox-burnt-orange" }));

// Weld a lathe or cylinder into one smooth surface. mergeVertices alone will NOT close a lathe's seam, because the
// seam's two coincident vertices carry different UVs and mergeVertices keys on every attribute; the surface then
// keeps a hard normal break that draws a vertical line down the object from any angle (Paul 2026-11-04, the mug and
// the bean hopper). These materials carry no map, so dropping uv first lets the weld actually happen.
function weldSmooth(geometry) {
  // mergeVertices keys on every attribute, so the seam's duplicate vertices only merge once their UVs and normals
  // agree. These parts are untextured, so the UVs go to zero, the normals are thrown away to be rebuilt below.
  const count = geometry.attributes.position.count;
  geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(count * 2), 2));
  geometry.deleteAttribute("normal");
  const welded = mergeVertices(geometry);
  welded.computeVertexNormals();
  return welded;
}

function buildPropGroup(scene, key, position, build) {
  const group = new THREE.Group();
  group.name = `prop-${key}`;
  group.position.set(...position);
  group.userData.category = "household-props";
  group.userData.propKey = key;
  const buckets = new Map();
  const addGeometry = (geometry, material, offset = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) => {
    const matrix = new THREE.Matrix4().compose(
      new THREE.Vector3(...offset),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
      new THREE.Vector3(...scale),
    );
    geometry.applyMatrix4(matrix);
    if (!buckets.has(material)) buckets.set(material, []);
    buckets.get(material).push(geometry);
  };
  const box = (material, size, offset, rotation = [0, 0, 0]) => addGeometry(
    roundedBoxGeometry(size, Math.min(0.012, Math.min(...size) * 0.15)), material, offset, rotation,
  );
  const shape = (geometry, material, offset, rotation = [0, 0, 0], scale = [1, 1, 1]) => addGeometry(geometry, material, offset, rotation, scale);
  build({ box, shape });
  for (const [material, geometries] of buckets) {
    const geometry = geometries.length === 1 ? geometries[0] : mergeGeometries(geometries, false);
    if (!geometry) throw new Error(`Could not merge prop geometry: ${key}`);
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `prop-${key}-part`;
    mesh.userData.category = "household-props";
    mesh.userData.propKey = key;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  scene.add(group);
  return group;
}

// Grasscloth wallpaper on the right-hand wall behind the counter (Paul 2026-10-29, after a look at Bay Area practice: designers do use wallpaper,
// and the current trend is texture over loud pattern; an Eichler-era Bay Area project used grasscloth). The weave is drawn on a canvas, no download:
// fine horizontal fibres of uneven length and tone, a few darker knots, faint weft threads, and a seam every 69 cm (one wallpaper roll width).
function makeGrasscloth(scene) {
  const SEAM_WIDTH = 0.69;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const context = canvas.getContext("2d");
  context.fillStyle = "#f4efe2";
  context.fillRect(0, 0, 512, 512);
  let seed = 7;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < 1500; i++) {
    const y = random() * 512, length = 30 + random() * 190, x = random() * 512, thickness = 0.8 + random() * 1.8;
    const light = random() > 0.45;
    context.fillStyle = light ? `rgba(255, 250, 232, ${0.08 + random() * 0.16})` : `rgba(88, 70, 44, ${0.04 + random() * 0.09})`;
    context.fillRect(x, y, length, thickness);
    if (x + length > 512) context.fillRect(x - 512, y, length, thickness);
  }
  for (let i = 0; i < 40; i++) {
    context.fillStyle = `rgba(70, 54, 32, ${0.12 + random() * 0.18})`;
    context.beginPath();
    context.ellipse(random() * 512, random() * 512, 2 + random() * 3, 1 + random() * 1.4, 0, 0, Math.PI * 2);
    context.fill();
  }
  for (let x = 24; x < 512; x += 48) {
    context.fillStyle = "rgba(255, 252, 240, 0.07)";
    context.fillRect(x + random() * 6, 0, 1, 512);
  }
  // Roll seam on both edges of the tile, so it repeats every SEAM_WIDTH metres.
  context.fillStyle = "rgba(60, 46, 28, 0.32)";
  context.fillRect(0, 0, 2, 512);
  context.fillRect(510, 0, 2, 512);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  // The right wall face is at x 2.94; the panel stands 4 mm in front of it. It now runs the full wall, behind the cable-car painting, and stops 13 mm
  // short of the wok backsplash (z 0.983): Paul 2026-10-29, a half-papered wall read as unfinished.
  const PANEL = { x: 2.936, zMin: -2.30, zMax: 0.97, yMin: 0.10, yMax: 2.45 };
  const width = PANEL.zMax - PANEL.zMin, height = PANEL.yMax - PANEL.yMin;
  const material = new THREE.MeshStandardMaterial({ color: 0xf9efd5, roughness: 0.96, map: texture });
  // The panel is one mesh of three pieces around the doorway (beside the cable-car painting). UVs run in seam widths from the panel's low corner,
  // so the weave and the 69 cm seams carry on across the gap exactly as they did on the single plane.
  const doorLow = ROOM_DOOR.zMid - ROOM_DOOR.halfHole, doorHigh = ROOM_DOOR.zMid + ROOM_DOOR.halfHole;
  const pieces = [[PANEL.zMin, doorLow, PANEL.yMin, PANEL.yMax], [doorHigh, PANEL.zMax, PANEL.yMin, PANEL.yMax], [doorLow, doorHigh, ROOM_DOOR.holeHeight, PANEL.yMax]].map(([z0, z1, y0, y1]) => {
    const piece = new THREE.PlaneGeometry(z1 - z0, y1 - y0);
    piece.translate((z0 + z1) / 2 - (PANEL.zMin + PANEL.zMax) / 2, (y0 + y1) / 2 - (PANEL.yMin + PANEL.yMax) / 2, 0);
    const uv = piece.attributes.uv, position = piece.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (position.getX(i) + width / 2) / SEAM_WIDTH, (position.getY(i) + height / 2) / SEAM_WIDTH);
    return piece;
  });
  const panelGeometry = mergeGeometries(pieces, false);
  pieces.forEach((piece) => piece.dispose());
  const mesh = new THREE.Mesh(panelGeometry, material);
  mesh.name = "room03-grasscloth-wallpaper";
  mesh.userData.category = "wall-covering";
  mesh.rotation.y = -Math.PI / 2;
  mesh.position.set(PANEL.x, (PANEL.yMin + PANEL.yMax) / 2, (PANEL.zMin + PANEL.zMax) / 2);
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  scene.add(mesh);
  const COLORS = { "grasscloth-oat": 0xf9efd5, "grasscloth-sage": 0xa7b08f, "grasscloth-charcoal": 0xa3a59f };
  let choice = "grasscloth-oat";
  return {
    mesh,
    options: ["grasscloth-oat", "grasscloth-sage", "grasscloth-charcoal", "none"],
    set(name) {
      if (name !== "none" && !COLORS[name]) return false;
      choice = name;
      mesh.visible = name !== "none";
      if (name !== "none") material.color.setHex(COLORS[name]);
      return true;
    },
    info() {
      const box = new THREE.Box3().setFromObject(mesh);
      return {
        choice, visible: mesh.visible, color: `#${material.color.getHexString()}`, seamMetres: SEAM_WIDTH,
        repeat: [width / SEAM_WIDTH, height / SEAM_WIDTH], vertices: mesh.geometry.attributes.position.count,
        bounds: { min: box.min.toArray(), max: box.max.toArray(), size: box.getSize(new THREE.Vector3()).toArray() },
      };
    },
  };
}

function buildRoomWallArt(scene, materials, woodGeometries) {
  const imageGeometries = [];
  const makeFrame = (key, position, frameBoxes, imageSize, imageOffset, imageRotation = [0, 0, 0], atlasRect) => {
    const group = new THREE.Group();
    group.name = key === "cable-car" ? "prop-room03-wall-art" : `prop-room03-wall-art-${key}`;
    group.userData.category = "household-props";
    group.userData.artworkKey = key;
    group.position.set(...position);
    const parts = frameBoxes.map(([size, offset]) => {
      const geometry = new THREE.BoxGeometry(...size);
      geometry.translate(...offset);
      return geometry;
    });
    const frameGeometry = mergeGeometries(parts, false);
    parts.forEach((geometry) => geometry.dispose());
    if (!frameGeometry) throw new Error(`Could not build Room 03 wall-art frame: ${key}`);
    const worldMatrix = new THREE.Matrix4().makeTranslation(...position);
    frameGeometry.applyMatrix4(worldMatrix);
    frameGeometry.computeVertexNormals();
    frameGeometry.computeBoundingBox();
    woodGeometries.push(frameGeometry);
    const imageGeometry = new THREE.PlaneGeometry(...imageSize);
    const uv = imageGeometry.attributes.uv;
    for (let vertex = 0; vertex < uv.count; vertex++) {
      const localU = uv.getX(vertex), localV = uv.getY(vertex);
      const u = atlasRect.flip ? 1 - localU : localU;
      uv.setXY(vertex, atlasRect.u0 + u * (atlasRect.u1 - atlasRect.u0), atlasRect.v0 + localV * (atlasRect.v1 - atlasRect.v0));
    }
    uv.needsUpdate = true;
    const imageRotationQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(...imageRotation));
    const imageWorld = new THREE.Matrix4().compose(new THREE.Vector3(position[0] + imageOffset[0], position[1] + imageOffset[1], position[2] + imageOffset[2]), imageRotationQuat, new THREE.Vector3(1, 1, 1));
    imageGeometry.applyMatrix4(imageWorld);
    imageGeometry.computeBoundingBox();
    imageGeometries.push(imageGeometry);
    const image = new THREE.Object3D();
    image.name = `room03-wall-art-${key}-image`;
    image.userData.artworkKey = key;
    image.userData.loadStatus = "pending";
    image.userData.bounds = {
      min: imageGeometry.boundingBox.min.toArray(), max: imageGeometry.boundingBox.max.toArray(),
      size: imageGeometry.boundingBox.getSize(new THREE.Vector3()).toArray(),
    };
    group.userData.bounds = {
      min: frameGeometry.boundingBox.min.toArray(), max: frameGeometry.boundingBox.max.toArray(),
      size: frameGeometry.boundingBox.getSize(new THREE.Vector3()).toArray(),
    };
    group.add(image);
    scene.add(group);
    return { key, group, image, status: "pending", texture: null, atlasRect };
  };
  const cableCar = makeFrame("cable-car", [2.923, 1.52, -0.02], [
    [[0.034, 0.035, 1.2], [0, 0.4525, 0]], [[0.034, 0.035, 1.2], [0, -0.4525, 0]],
    [[0.034, 0.87, 0.035], [0, 0, -0.5825]], [[0.034, 0.87, 0.035], [0, 0, 0.5825]],
    [[0.012, 0.87, 1.13], [0.011, 0, 0]],
  ], [1.13, 0.87], [-0.015, 0, 0], [0, -Math.PI / 2, 0], { u0: 0, u1: 1 / 3, v0: 0, v1: 1, flip: false });
  const redwoodPath = makeFrame("redwood-path", [0.86, 1.78, 3.70], [
    [[1.61, 0.03, 0.035], [0, 0.59, 0]], [[1.61, 0.03, 0.035], [0, -0.59, 0]],
    [[0.03, 1.21, 0.035], [-0.79, 0, 0]], [[0.03, 1.21, 0.035], [0.79, 0, 0]],
    [[1.55, 1.1625, 0.012], [0, 0, 0.012]],
  ], [1.55, 1.1625], [0, 0, -0.02], [0, Math.PI, 0], { u0: 1 / 3, u1: 2 / 3, v0: 0.012987, v1: 0.987013, flip: true });
  // Third frame (Paul 2026-10-29: the room felt plain): a 4:3 painting on the entry wall above the window-side floor lamp. It hangs 18 mm off the
  // wall face (z 2.34) and faces the room, like the redwood frame; it shares the atlas, so it adds no mesh and no draw call.
  const lampWall = makeFrame("lamp-wall", [-1.93, 1.86, 2.321], [
    [[0.86, 0.03, 0.035], [0, 0.315, 0]], [[0.86, 0.03, 0.035], [0, -0.315, 0]],
    [[0.03, 0.65, 0.035], [-0.415, 0, 0]], [[0.03, 0.65, 0.035], [0.415, 0, 0]],
    [[0.80, 0.60, 0.012], [0, 0, 0.012]],
  ], [0.80, 0.60], [0, 0, -0.02], [0, Math.PI, 0], { u0: 2 / 3, u1: 1, v0: 0.012987, v1: 0.987013, flip: true });
  const assets = { cableCar, redwoodPath, lampWall };
  const atlasCanvas = document.createElement("canvas");
  atlasCanvas.width = 2400;
  atlasCanvas.height = 616;
  const atlasContext = atlasCanvas.getContext("2d");
  atlasContext.fillStyle = "#d8cbb5";
  atlasContext.fillRect(0, 0, atlasCanvas.width, atlasCanvas.height);
  const atlasTexture = new THREE.CanvasTexture(atlasCanvas);
  atlasTexture.colorSpace = THREE.SRGBColorSpace;
  const imageGeometry = mergeGeometries(imageGeometries, false);
  imageGeometries.forEach((part) => part.dispose());
  if (!imageGeometry) throw new Error("Could not merge Room 03 wall-art images");
  const imageMesh = new THREE.Mesh(imageGeometry, new THREE.MeshBasicMaterial({ map: atlasTexture, color: 0xffffff, side: THREE.DoubleSide, toneMapped: false }));
  imageMesh.name = "room03-wall-art-image-atlas";
  imageMesh.userData.category = "household-props";
  imageMesh.castShadow = false;
  imageMesh.receiveShadow = false;
  scene.add(imageMesh);
  let startedAfterFirstRender = false;
  let settled = 0;
  let cableCarImageGain = 1;
  // Swappable prints for the two frames (Paul 2026-10-29). Each option is fetched only when chosen, painted into the same atlas
  // region as the original and then released, so vertices, meshes and draw calls never change and nothing extra loads up front.
  const choice = { "cable-car": "cable-car", "redwood-path": "oak-street", "lamp-wall": "fog-bridge" };
  const ART_OPTIONS = {
    "cable-car": {
      "cable-car": "./art/room03-bay-cable-car-v1.webp",
      "fog-bridge": "./art/room03-print-fog-bridge-v1.webp",
      "marin-hills": "./art/room03-print-marin-hills-v1.webp",
      "poster-sun": "./art/room03-print-poster-sun-v1.webp",
    },
    "redwood-path": {
      "redwood-path": "./art/room03-bay-redwood-path-v1.webp",
      "ferry-building": "./art/room03-print-ferry-building-v1.webp",
      "oak-street": "./art/room03-print-oak-street-v1.webp",
      "poster-arch": "./art/room03-print-poster-arch-v1.webp",
      "poster-leaf": "./art/room03-print-poster-leaf-v1.webp",
    },
    "lamp-wall": {
      "fog-bridge": "./art/room03-print-fog-bridge-v1.webp",
      "ferry-building": "./art/room03-print-ferry-building-v1.webp",
      "moon-hills": "./art/room03-lamp-wall-moon-hills-v1.webp",
      "hills-sun": "./art/room03-lamp-wall-hills-sun-v1.webp",
      "botanical-window": "./art/room03-lamp-wall-botanical-window-v1.webp",
    },
  };
  const frameAssetByKey = { "cable-car": cableCar, "redwood-path": redwoodPath, "lamp-wall": lampWall };
  // Paint a picture into a frame's atlas region, cover-fitted (centre crop) to the region's aspect.
  const paintRegion = (asset, source) => {
    const x = asset.atlasRect.u0 * atlasCanvas.width;
    const width = (asset.atlasRect.u1 - asset.atlasRect.u0) * atlasCanvas.width;
    const y = asset.key !== "cable-car" ? 8 : 0;
    const height = asset.key !== "cable-car" ? 600 : atlasCanvas.height;
    // Keep the cable-car print's mat quiet and narrow; the printed image becomes the visual focus.
    // Other frames retain their approved proportions. This is atlas paint only: no geometry or draw-call cost.
    const matRatio = asset.key === "cable-car" ? 0.025 : asset.key === "redwood-path" ? 0.04 : 0.07;
    const mat = Math.round(width * matRatio);
    const sw0 = source.naturalWidth || source.width, sh0 = source.naturalHeight || source.height;
    const innerWidth = width - 2 * mat, innerHeight = height - 2 * mat;
    const scale = Math.max(innerWidth / sw0, innerHeight / sh0);
    const sw = innerWidth / scale, sh = innerHeight / scale;
    const sx = (sw0 - sw) / 2, sy = (sh0 - sh) / 2;
    atlasContext.fillStyle = "#d8cbb5";
    atlasContext.fillRect(x, 0, width, atlasCanvas.height);
    atlasContext.save();
    if (asset.atlasRect.flip) {
      atlasContext.translate(x + width, 0);
      atlasContext.scale(-1, 1);
    }
    const left = asset.atlasRect.flip ? 0 : x;
    atlasContext.fillStyle = asset.key === "cable-car" ? "#d4c8b4" : asset.key === "redwood-path" ? "#e5dac9" : "#eee5d2";
    atlasContext.fillRect(left, y, width, height);
    atlasContext.drawImage(source, sx, sy, sw, sh, left + mat, y + mat, innerWidth, innerHeight);
    if (asset.key === "cable-car" && cableCarImageGain < 1) {
      // The print and its remaining mat both follow the mood instead of leaving a bright, unlit patch on the wall.
      atlasContext.fillStyle = `rgba(0, 0, 0, ${1 - cableCarImageGain})`;
      atlasContext.fillRect(left, y, width, height);
    }
    // A thin bevel line where the mat meets the picture: darker on top and left, lighter below and right.
    atlasContext.lineWidth = 2;
    atlasContext.strokeStyle = "rgba(70, 55, 35, 0.35)";
    atlasContext.strokeRect(left + mat - 1, y + mat - 1, innerWidth + 2, innerHeight + 2);
    atlasContext.restore();
    atlasTexture.needsUpdate = true;
  };
  const regionMean = (asset) => {
    // A coarse 10 x 8 grid of single pixels: enough to tell two pictures apart without reading the whole region on every info() call.
    // Sampled inside the cream mat, so the reading is the picture itself.
    const regionX = Math.round(asset.atlasRect.u0 * atlasCanvas.width), regionWidth = Math.round((asset.atlasRect.u1 - asset.atlasRect.u0) * atlasCanvas.width);
    const matRatio = asset.key === "cable-car" ? 0.025 : asset.key === "redwood-path" ? 0.04 : 0.07;
    const mat = Math.round(regionWidth * matRatio);
    const y0 = (asset.key !== "cable-car" ? 8 : 0) + mat, height = (asset.key !== "cable-car" ? 600 : atlasCanvas.height) - 2 * mat;
    const x0 = regionX + mat, width = regionWidth - 2 * mat;
    let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < 10; i++) for (let j = 0; j < 8; j++) {
      const [pr, pg, pb] = atlasContext.getImageData(x0 + Math.floor((i + 0.5) * width / 10), y0 + Math.floor((j + 0.5) * height / 8), 1, 1).data;
      r += pr; g += pg; b += pb; n += 1;
    }
    return [r / n, g / n, b / n].map((value) => Number(value.toFixed(1)));
  };
  return {
    assets,
    imageMesh,
    artOptions: ART_OPTIONS,
    get choice() { return { ...choice }; },
    regionMean: (frameKey) => regionMean(frameAssetByKey[frameKey]),
    get cableCarImageGain() { return cableCarImageGain; },
    setCableCarImageGain(gain) {
      cableCarImageGain = THREE.MathUtils.clamp(gain, 0, 1);
      if (cableCar.sourceImage) paintRegion(cableCar, cableCar.sourceImage);
    },
    setArtwork(frameKey, optionKey, onDone = () => {}) {
      const urls = ART_OPTIONS[frameKey];
      const asset = frameAssetByKey[frameKey];
      if (!urls || !urls[optionKey] || !asset) return false;
      choice[frameKey] = optionKey;
      new THREE.TextureLoader().load(new URL(urls[optionKey], import.meta.url).href, (texture) => {
        // A later click may have replaced this one while it was loading.
        if (choice[frameKey] === optionKey) {
          asset.sourceImage = texture.image;
          paintRegion(asset, texture.image);
        }
        texture.dispose();
        onDone({ frameKey, optionKey, status: "loaded" });
      }, undefined, () => onDone({ frameKey, optionKey, status: "failed" }));
      return true;
    },
    get group() { return cableCar.group; },
    get texture() { return atlasTexture; },
    material: imageMesh.material,
    load(onSettled) {
      if (startedAfterFirstRender) return;
      startedAfterFirstRender = true;
      const loader = new THREE.TextureLoader();
      const urls = {
        cableCar: new URL("./art/room03-bay-cable-car-v1.webp", import.meta.url).href,
        redwoodPath: new URL(ART_OPTIONS["redwood-path"][choice["redwood-path"]], import.meta.url).href,
        lampWall: new URL("./art/room03-print-fog-bridge-v1.webp", import.meta.url).href,
      };
      for (const [name, asset] of Object.entries(assets)) {
        loader.load(urls[name], (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          asset.texture = texture;
          asset.sourceImage = texture.image;
          paintRegion(asset, texture.image);
          texture.dispose();
          atlasTexture.needsUpdate = true;
          asset.status = "loaded";
          asset.image.userData.loadStatus = "loaded";
          settled += 1;
          onSettled({ status: asset.status, startedAfterFirstRender, settled, total: 3 });
        }, undefined, () => {
          asset.status = "fallback";
          asset.image.userData.loadStatus = "fallback";
          settled += 1;
          onSettled({ status: asset.status, startedAfterFirstRender, settled, total: 3 });
        });
      }
    },
    get startedAfterFirstRender() { return startedAfterFirstRender; },
  };
}

function buildRoom03MediaUnit(scene, materials, woodGeometries) {
  const group = new THREE.Group();
  group.name = "prop-room03-screen-and-console";
  group.userData.category = "room03-media";
  const centerX = -0.95;
  // The TV (Paul 2026-10-31, widened 2026-11-01): a wide wall-mounted panel, 1.45 x 0.816 m, with a thin black bezel instead of the oak frame. Its left end
  // now reaches the hall's side wall (x -1.64) and disappears behind it, so the cut edge of the panel is out of sight from every camera the nook view allows
  // instead of ending in open wall. The bottom edge stays at 0.795 m, so the things on the console still stand below it.
  const SCREEN_W = 1.45, SCREEN_H = 0.816, BEZEL = 0.012;
  const screenCenterY = 0.795 + SCREEN_H / 2;
  const consoleParts = [
    [[1.30, 0.05, 0.32], [centerX, 0.55, -0.17]],
    [[0.05, 0.30, 0.30], [centerX - 0.625, 0.375, -0.17]],
    [[0.05, 0.30, 0.30], [centerX + 0.625, 0.375, -0.17]],
    [[1.20, 0.04, 0.30], [centerX, 0.22, -0.17]],
    [[0.56, 0.27, 0.012], [centerX - 0.315, 0.385, -0.014]],
    [[0.56, 0.27, 0.012], [centerX + 0.315, 0.385, -0.014]],
    [[1.15, 0.06, 0.25], [centerX, 0.08, -0.17]],
  ];
  const mergeBoxes = (parts, name) => {
    const geometries = parts.map(([size, position]) => {
      const geometry = new THREE.BoxGeometry(...size);
      geometry.translate(...position);
      return geometry;
    });
    const merged = mergeGeometries(geometries, false);
    geometries.forEach((geometry) => geometry.dispose());
    if (!merged) throw new Error(`Could not build Room 03 ${name}`);
    merged.computeVertexNormals();
    return merged;
  };
  const frame = new THREE.Object3D();
  frame.name = "room03-tv-screen-frame";
  frame.userData.bounds = {
    min: [centerX - SCREEN_W / 2 - BEZEL, screenCenterY - SCREEN_H / 2 - BEZEL, 3.685],
    max: [centerX + SCREEN_W / 2 + BEZEL, screenCenterY + SCREEN_H / 2 + BEZEL, 3.715],
    size: [SCREEN_W + 2 * BEZEL, SCREEN_H + 2 * BEZEL, 0.03],
  };
  const console = new THREE.Object3D();
  console.name = "room03-tv-low-console";
  console.userData.bounds = {
    min: [centerX - 0.65, 0.05, 3.365],
    max: [centerX + 0.65, 0.575, 3.686],
    size: [1.30, 0.525, 0.321],
  };
  group.add(frame, console);
  // The panel body: one black slab, 3 cm deep, whose 12 mm margin around the picture is the bezel. One extra draw call.
  const body = new THREE.Mesh(new THREE.BoxGeometry(SCREEN_W + 2 * BEZEL, SCREEN_H + 2 * BEZEL, 0.03), new THREE.MeshStandardMaterial({ color: 0x131514, roughness: 0.38, metalness: 0.2 }));
  body.name = "room03-tv-body"; body.userData.category = "room03-media";
  body.position.set(centerX, screenCenterY, 0);
  body.castShadow = true; body.receiveShadow = true;
  group.add(body);
  const woodwork = mergeBoxes(consoleParts, "screen-and-console woodwork");
  woodwork.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, 3.70));
  woodwork.computeBoundingBox();
  woodGeometries.push(woodwork);

  const screenSlot = new THREE.Group();
  screenSlot.name = "mood-slot-screen-content";
  screenSlot.userData.moodSlot = "screen-content";
  const screenMaterial = new THREE.MeshBasicMaterial({ color: 0x171918, side: THREE.DoubleSide });
  screenMaterial.name = "room03-screen-powered-off";
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN_W, SCREEN_H), screenMaterial);
  screen.name = "screen-content-surface";
  screen.userData.moodSlot = "screen-content";
  screen.position.set(centerX, screenCenterY, -0.018);
  screenSlot.add(screen);
  // A faint glass reflection in front of the panel (GrokBot review: the TV read as a flat black card). Drawn once on a canvas: a soft top-to-bottom
  // sheen and one diagonal streak. It sits 3 mm in front of the picture, so it also lies over the movie and parade pictures, like real glass.
  {
    const canvas = document.createElement("canvas");
    canvas.width = 256; canvas.height = 144;
    const c = canvas.getContext("2d");
    const sheen = c.createLinearGradient(0, 0, 0, 144); sheen.addColorStop(0, "rgba(255,255,255,0.10)"); sheen.addColorStop(0.45, "rgba(255,255,255,0.02)"); sheen.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = sheen; c.fillRect(0, 0, 256, 144);
    const streak = c.createLinearGradient(40, 0, 150, 144); streak.addColorStop(0, "rgba(255,255,255,0)"); streak.addColorStop(0.5, "rgba(255,255,255,0.12)"); streak.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = streak; c.beginPath(); c.moveTo(70, 0); c.lineTo(130, 0); c.lineTo(70, 144); c.lineTo(10, 144); c.fill();
    const reflection = new THREE.CanvasTexture(canvas); reflection.colorSpace = THREE.SRGBColorSpace;
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN_W, SCREEN_H), new THREE.MeshBasicMaterial({ map: reflection, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    glass.name = "screen-glass-reflection"; glass.renderOrder = 4;
    glass.position.set(centerX, screenCenterY, -0.021);
    screenSlot.add(glass);
  }
  group.add(screenSlot);
  group.position.set(0, 0, 3.70);
  scene.add(group);
  return { group, frame, console, screenSlot, screen, centerX, screenCenterY };
}

function addRoom03Woodwork(scene, material, geometries) {
  const geometry = mergeGeometries(geometries, false);
  geometries.forEach((part) => part.dispose());
  if (!geometry) throw new Error("Could not merge Room 03 wall-art and media woodwork");
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "room03-wall-art-and-media-woodwork";
  mesh.userData.category = "wall-art-frame";
  mesh.userData.room03MediaWoodwork = true;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

// Built-in dish dryer in the upper cabinet row (Paul 2026-10-29, from a photo of his own appliance): stainless frame with a ribbed top band, a black
// glass face with a clear window showing two glowing cyan UV tubes over a wire rack, a blue seven-segment clock, two orange icons, a red status bar,
// four oval buttons and a round power button. No brand or model text. The face is one canvas (glow comes from an emissive map, so only the lit parts
// shine); the frame is one steel mesh.
// Low walnut credenza under the cable-car painting. Its position, footprint and oak top stay fixed; the finish now relates to the room's timber
// ceiling and Eichler-era joinery. Four warm walnut slab fronts use a quiet tonal shift, with a fine integrated dark finger groove instead of applied
// pulls. One merged vertex-colour mesh keeps the update at the existing draw-call count.
// The third ROOMVERSE robot (Paul 2026-10-29: every room has the little robot; this one gets its own colour). Same model as Rooms 01 and 02, recoloured
// by height like Room 01: cream body with a lemon-yellow belt (Room 01 sage, its door robot terracotta). It stands beside the dining table where the first view sees it;
// a tap makes it hop and the page shows a bubble with the way to the other rooms.
function loadRoom03Robot(scene, onReady) {
  // Beside the dining table on the counter side, in the opening view, turned a little toward the visitor (the hall spot was hidden behind the chairs).
  const ROBOT = { x: 1.45, z: -0.95, height: 0.46, yaw: -0.45 }; // the model faces +z, so this turns it toward the opening camera
  const pivot = new THREE.Group();
  pivot.name = "room03-robot";
  pivot.userData.category = "robot";
  pivot.position.set(ROBOT.x, 0, ROBOT.z);
  pivot.rotation.y = ROBOT.yaw;
  scene.add(pivot);
  const state = { pivot, ready: false, home: 0, hopUntil: 0, bounds: null };
  new GLTFLoader().load(new URL("../models/robot.glb", import.meta.url).href, (gltf) => {
    const model = gltf.scene;
    model.updateMatrixWorld(true);
    let box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const scale = ROBOT.height / size.y;
    model.scale.setScalar(scale);
    model.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(model);
    const centre = box.getCenter(new THREE.Vector3());
    model.position.set(-centre.x, -box.min.y, -centre.z);
    pivot.add(model);
    pivot.updateMatrixWorld(true);
    // Face: a dark rounded screen with two warm eyes, fitted to the curve of the head exactly like Room 01 (the model has no face of its own).
    // Measured with the pivot unturned, so the head's box is the model's own box (a turned box is wider and put the screen too wide and low).
    pivot.rotation.y = 0; pivot.updateMatrixWorld(true);
    {
      const bodyBox = new THREE.Box3().setFromObject(model);
      const toLocal = new THREE.Matrix4().copy(pivot.matrixWorld).invert();
      const rH = bodyBox.max.y - bodyBox.min.y;
      const local = bodyBox.clone().applyMatrix4(toLocal);
      const rW = local.max.x - local.min.x, rcx = (local.min.x + local.max.x) / 2, fy = local.max.y - rH * 0.29;
      const v = new THREE.Vector3();
      const frontZ = (x, y) => {
        let z = -Infinity;
        model.traverse((mesh) => { if (!mesh.isMesh) return; const pos = mesh.geometry.attributes.position;
          for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld).applyMatrix4(toLocal); if (Math.abs(v.x - x) < rW * 0.06 && Math.abs(v.y - y) < rH * 0.05) z = Math.max(z, v.z); } });
        return z;
      };
      const fw = rW * 0.6, fh = rH * 0.25, zc = frontZ(rcx, fy), ze = frontZ(rcx + fw / 2, fy);
      const bend = Number.isFinite(ze) && Number.isFinite(zc) ? (zc - ze) / ((fw / 2) ** 2) : 0;
      let lift = 0;
      for (const gx of [-0.45, -0.25, 0, 0.25, 0.45]) for (const gy of [-0.5, -0.25, 0, 0.25, 0.5]) {
        const x = gx * fw, z = frontZ(rcx + x, fy + gy * fh);
        if (Number.isFinite(z)) lift = Math.max(lift, z - (zc - bend * x * x));
      }
      const shape = new THREE.Shape(), rr = fh * 0.35;
      shape.moveTo(-fw / 2 + rr, -fh / 2); shape.lineTo(fw / 2 - rr, -fh / 2); shape.quadraticCurveTo(fw / 2, -fh / 2, fw / 2, -fh / 2 + rr);
      shape.lineTo(fw / 2, fh / 2 - rr); shape.quadraticCurveTo(fw / 2, fh / 2, fw / 2 - rr, fh / 2); shape.lineTo(-fw / 2 + rr, fh / 2);
      shape.quadraticCurveTo(-fw / 2, fh / 2, -fw / 2, fh / 2 - rr); shape.lineTo(-fw / 2, -fh / 2 + rr); shape.quadraticCurveTo(-fw / 2, -fh / 2, -fw / 2 + rr, -fh / 2);
      const screenGeometry = new THREE.ShapeGeometry(shape, 12);
      { const q = screenGeometry.attributes.position; for (let i = 0; i < q.count; i++) q.setZ(i, -bend * q.getX(i) ** 2); screenGeometry.computeVertexNormals(); }
      const face = new THREE.Mesh(screenGeometry, new THREE.MeshStandardMaterial({ color: 0x2b2d30, roughness: 0.35, metalness: 0.1 }));
      face.name = "room03-robot-face";
      face.position.set(rcx, fy, (Number.isFinite(zc) ? zc : local.max.z) + lift + 0.02); // 2 cm proud like Room 01: the head's front bump showed through at 6 mm
      const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xffe2a8 });
      for (const sx of [-1, 1]) {
        const eye = new THREE.Mesh(new THREE.CircleGeometry(fh * 0.13, 20), eyeMaterial);
        const ex = sx * fw * 0.2; eye.position.set(ex, fh * 0.05, -bend * ex * ex + 0.002); face.add(eye);
      }
      pivot.add(face);
    }
    pivot.rotation.y = ROBOT.yaw; pivot.updateMatrixWorld(true);
    const cream = new THREE.Color("#ece6dc"), belt = new THREE.Color("#e3b23c");
    const local = new THREE.Box3().setFromObject(model);
    const v = new THREE.Vector3();
    model.traverse((mesh) => {
      if (!mesh.isMesh) return;
      mesh.castShadow = true; mesh.receiveShadow = true;
      const colors = mesh.geometry.attributes.color;
      if (!colors) return;
      mesh.geometry = mesh.geometry.clone();
      const c = mesh.geometry.attributes.color, p = mesh.geometry.attributes.position;
      for (let i = 0; i < c.count; i++) {
        v.fromBufferAttribute(p, i).applyMatrix4(mesh.matrixWorld);
        const t = (v.y - local.min.y) / (local.max.y - local.min.y);
        const col = t > 0.12 && t < 0.27 ? belt : cream;
        c.setXYZ(i, col.r, col.g, col.b);
      }
      c.needsUpdate = true;
      if (mesh.material) { mesh.material = mesh.material.clone(); mesh.material.vertexColors = true; }
    });
    // One mesh, one draw call: body, face screen and eyes are baked into pivot space and merged (they were four meshes, +4 opening calls).
    {
      const toPivot = new THREE.Matrix4().copy(pivot.matrixWorld).invert();
      const parts = [];
      // GLB attributes can be interleaved (not mergeable): copy position, normal and colour into plain attributes first.
      const plain = (source) => {
        const geometry = new THREE.BufferGeometry();
        for (const [name, size] of [["position", 3], ["normal", 3], ["color", 3]]) {
          const attribute = source.attributes[name];
          if (!attribute) continue;
          const array = new Float32Array(attribute.count * size);
          for (let i = 0; i < attribute.count; i++) for (let k = 0; k < size; k++) array[i * size + k] = [attribute.getX, attribute.getY, attribute.getZ][k].call(attribute, i);
          geometry.setAttribute(name, new THREE.BufferAttribute(array, size));
        }
        if (source.index) geometry.setIndex(Array.from(source.index.array));
        return geometry;
      };
      const prepare = (source, matrix, fallbackColor) => {
        const geometry = plain(source);
        geometry.applyMatrix4(matrix);
        if (geometry.attributes.uv) geometry.deleteAttribute("uv");
        if (!geometry.attributes.normal) geometry.computeVertexNormals();
        if (!geometry.attributes.color) {
          const colors = new Float32Array(geometry.attributes.position.count * 3);
          for (let i = 0; i < colors.length; i += 3) fallbackColor.toArray(colors, i);
          geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
        }
        if (!geometry.index) geometry.setIndex([...Array(geometry.attributes.position.count).keys()]);
        parts.push(geometry);
      };
      model.updateMatrixWorld(true);
      const bodyMeshes = [];
      model.traverse((mesh) => { if (mesh.isMesh) bodyMeshes.push(mesh); });
      for (const mesh of bodyMeshes) prepare(mesh.geometry.clone(), new THREE.Matrix4().multiplyMatrices(toPivot, mesh.matrixWorld), cream);
      const face = pivot.getObjectByName("room03-robot-face");
      if (face) {
        face.updateMatrixWorld(true);
        const faceToPivot = new THREE.Matrix4().multiplyMatrices(toPivot, face.matrixWorld);
        prepare(face.geometry.clone(), faceToPivot, new THREE.Color(0x2b2d30));
        for (const eye of [...face.children]) {
          eye.updateMatrixWorld(true);
          prepare(eye.geometry.clone(), new THREE.Matrix4().multiplyMatrices(toPivot, eye.matrixWorld), new THREE.Color(0xffe2a8));
        }
        pivot.remove(face);
      }
      pivot.remove(model);
      const merged = mergeGeometries(parts, false);
      parts.forEach((part) => part.dispose());
      merged.computeVertexNormals();
      const body = new THREE.Mesh(merged, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, metalness: 0 }));
      body.name = "room03-robot-body"; body.userData.category = "robot";
      body.castShadow = true; body.receiveShadow = true;
      pivot.add(body);
      pivot.userData.vertices = merged.attributes.position.count;
    }
    state.bounds = new THREE.Box3().setFromObject(pivot);
    state.ready = true;
    onReady();
  }, undefined, () => { /* no robot if the model fails to load; the room still works */ });
  return state;
}

// The room door (Paul 2026-10-30, drawn by Codex: deep olive leaf, oak casing, brass lever, one narrow frosted slot, hinges on the painting side).
// Three meshes: the oak frame, the leaf (olive, frosted glass and brass as vertex colours, one mesh) and a soft light panel in the doorway so
// the opening reads as a passage to the other rooms. The leaf turns about its hinge edge; the light panel follows the mood like the paintings.
function buildRoomDoor(scene, m) {
  const { wallFaceX: WF, wallBackX: WB, zMid, halfHole: H, holeHeight: HH, casing: C, leafWidth: LW, leafHeight: LH } = ROOM_DOOR;
  const LEAF_T = 0.04;
  const group = new THREE.Group();
  group.name = "room03-door";
  group.userData.category = "door";
  const place = (geometry, position) => { geometry.translate(...position); return geometry; };
  const box = (sx, sy, sz, x, y, z) => place(new THREE.BoxGeometry(sx, sy, sz), [x, y, z]);
  const mergeAll = (parts) => { const geometry = mergeGeometries(parts, false); parts.forEach((part) => part.dispose()); geometry.computeVertexNormals(); return geometry; };

  // The oak frame is built with the architecture (doorFrameBoxes); only its bounds are needed here.
  const wallDepth = WB - WF, LINING = DOOR_LINING, LEAF_BOTTOM = DOOR_LEAF_BOTTOM;
  const frameBox = new THREE.Box3(new THREE.Vector3(WF - DOOR_CASE_T, 0, zMid - H - C), new THREE.Vector3(WB, HH + C, zMid + H + C));

  // Leaf, in pivot space: the hinge edge is the origin and the leaf runs toward -z; +x points into the room's wall, so the room face is at -x.
  const pivot = new THREE.Group();
  pivot.name = "room03-door-leaf";
  pivot.userData.category = "door";
  const HINGE_Z = zMid + LW / 2, LEAF_X = (WF + WB) / 2;
  pivot.position.set(LEAF_X, 0, HINGE_Z);
  const colour = (geometry, hex) => {
    const tint = new THREE.Color(hex), colors = new Float32Array(geometry.attributes.position.count * 3);
    for (let i = 0; i < geometry.attributes.position.count; i++) tint.toArray(colors, i * 3);
    geometry.deleteAttribute("uv");
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  };
  const OLIVE = 0xd2a24c /* Paul 2026-11-21: the room was green enough; a warm saffron-mustard leaf completes the slate blue and terracotta */, GLASS = 0xe2dccb, BRASS = 0xb08d4e;
  const top = LEAF_BOTTOM + LH, slotLow = 0.30, slotHigh = 1.80, stile = 0.15, slotW = 0.12;
  const leafBox = (z0, z1, y0, y1, hex) => colour(box(LEAF_T, y1 - y0, z1 - z0, 0, (y0 + y1) / 2, (z0 + z1) / 2), hex);
  const parts = [
    leafBox(-LW, -LW + stile, LEAF_BOTTOM, top, OLIVE),
    leafBox(-LW + stile + slotW, 0, LEAF_BOTTOM, top, OLIVE),
    leafBox(-LW + stile, -LW + stile + slotW, LEAF_BOTTOM, slotLow, OLIVE),
    leafBox(-LW + stile, -LW + stile + slotW, slotHigh, top, OLIVE),
    colour(box(0.012, slotHigh - slotLow, slotW, 0, (slotLow + slotHigh) / 2, -LW + stile + slotW / 2), GLASS),
  ];
  const leverZ = -LW + stile / 2, leverY = 1.0;
  for (const side of [-1, 1]) {
    const rose = new THREE.CylinderGeometry(0.028, 0.028, 0.012, 14);
    rose.rotateZ(Math.PI / 2);
    parts.push(colour(place(rose, [side * (LEAF_T / 2 + 0.006), leverY, leverZ]), BRASS));
    parts.push(colour(box(0.014, 0.018, 0.115, side * (LEAF_T / 2 + 0.019), leverY, leverZ + 0.0475), BRASS));
  }
  for (const y of [0.25, 1.0, 1.8]) {
    const knuckle = new THREE.CylinderGeometry(0.011, 0.011, 0.10, 8);
    parts.push(colour(place(knuckle, [-LEAF_T / 2 + 0.004, y, -0.004]), BRASS));
  }
  const leafGeometry = mergeAll(parts);
  const leafMesh = new THREE.Mesh(leafGeometry, new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.82, metalness: 0.0 }));
  leafMesh.name = "room03-door-leaf-mesh"; leafMesh.userData.category = "door";
  leafMesh.castShadow = true; leafMesh.receiveShadow = true;
  pivot.add(leafMesh);
  group.add(pivot);

  // Light in the doorway: a soft warm panel just inside the back face of the wall (no download, drawn on a small canvas).
  const canvas = document.createElement("canvas");
  canvas.width = 64; canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, "#fff1d4"); gradient.addColorStop(0.55, "#f6dfb4"); gradient.addColorStop(1, "#e9c98f");
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 256);
  const side = ctx.createLinearGradient(0, 0, 64, 0);
  side.addColorStop(0, "rgba(120,90,50,0.28)"); side.addColorStop(0.2, "rgba(120,90,50,0)"); side.addColorStop(0.8, "rgba(120,90,50,0)"); side.addColorStop(1, "rgba(120,90,50,0.28)");
  ctx.fillStyle = side; ctx.fillRect(0, 0, 64, 256);
  const lightTexture = new THREE.CanvasTexture(canvas);
  lightTexture.colorSpace = THREE.SRGBColorSpace;
  const lightMaterial = new THREE.MeshBasicMaterial({ map: lightTexture, color: 0xffffff });
  const light = new THREE.Mesh(new THREE.PlaneGeometry(2 * H, HH), lightMaterial);
  light.name = "room03-door-light"; light.userData.category = "door";
  light.rotation.y = -Math.PI / 2;
  light.position.set(WB - 0.002, HH / 2, zMid);
  group.add(light);
  light.visible = false; // the closed leaf hides it, so it costs no draw call until the door opens
  scene.add(group);

  const OPEN_ANGLE = 70 * Math.PI / 180;
  const state = { angle: 0, target: 0, animating: false };
  const apply = (angle) => { state.angle = angle; pivot.rotation.y = angle; light.visible = angle > 0.001; pivot.updateMatrixWorld(true); };
  const mm = (v) => Number((v * 1000).toFixed(1));
  const vertexCount = () => leafGeometry.attributes.position.count + light.geometry.attributes.position.count;
  return {
    group, leafMesh, light, pivot, vertices: vertexCount(),
    setMoodLight: (rgb) => lightMaterial.color.setRGB(...rgb),
    isOpen: () => state.target > 0,
    // Opens or closes the leaf; with animate false (or reduced motion) the leaf jumps to its end position. Returns false if nothing changed.
    set(open, animate, render) {
      const target = open ? OPEN_ANGLE : 0;
      if (state.target === target) return false;
      state.target = target;
      if (!animate || matchMedia("(prefers-reduced-motion: reduce)").matches) { apply(target); render(); return true; }
      const from = state.angle, started = performance.now();
      state.animating = true;
      const step = (now) => {
        if (state.target !== target) return;
        const k = Math.min(1, (now - started) / 450), eased = k * k * (3 - 2 * k);
        apply(from + (target - from) * eased);
        render();
        if (k < 1) requestAnimationFrame(step); else state.animating = false;
      };
      requestAnimationFrame(step);
      return true;
    },
    bounds: () => { scene.updateMatrixWorld(true); return new THREE.Box3().setFromObject(leafMesh).union(frameBox); },
    leafBounds: () => { scene.updateMatrixWorld(true); return new THREE.Box3().setFromObject(leafMesh); },
    info: () => {
      scene.updateMatrixWorld(true);
      const leafBox3 = new THREE.Box3().setFromObject(leafMesh);
      return {
        open: state.target > 0, angleDeg: Number((state.angle * 180 / Math.PI).toFixed(1)),
        leafWidthMm: mm(LW), leafHeightMm: mm(LH), leafThicknessMm: mm(LEAF_T), hingeSide: "painting (z max)",
        clearOpeningMm: [mm(2 * H - 2 * LINING), mm(HH - LINING - LEAF_BOTTOM + 0.002)],
        sideGapMm: mm((2 * H - 2 * LINING - LW) / 2), floorGapMm: mm(LEAF_BOTTOM),
        casingMm: mm(C), wallDepthMm: mm(wallDepth), colour: "#8c9a70", frameColour: "oak",
        frameBounds: { min: frameBox.min.toArray(), max: frameBox.max.toArray() },
        leafBounds: { min: leafBox3.min.toArray(), max: leafBox3.max.toArray() },
        meshes: 2, vertices: vertexCount(), frameBoxes: doorFrameBoxes().length,
      };
    },
  };
}

// Oak slab top for the credenza (Paul 2026-11-04: the top read as plastic). Flat vertex colour and one roughness gave it no grain and no sheen variation.
// Three tileable canvases share one grain field: colour (four boards of slightly different tone, long grain streaks, pores), roughness (pores and
// cathedral lines rougher, polished mid-board a little smoother) and a very light bump. UVs are in metres, grain runs along the credenza length.
function makeCredenzaOakMaps() {
  const W = 1024, H = 512, TAU = Math.PI * 2;
  let state = 20261104;
  const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
  const boards = 4, boardH = H / boards;
  const tone = [[228, 218, 198], [220, 209, 188], [234, 224, 204], [224, 213, 192]]; // Paul 2026-11-21: a pale warm limestone-oak, so the top sits quietly between the slate blue and the walnut
  const streaks = [];
  for (let i = 0; i < 150; i++) {
    streaks.push({ y: random() * H, k: 1 + Math.floor(random() * 3), phase: random() * TAU, amp: 1 + random() * 5, width: 0.6 + random() * 1.8, dark: random() < 0.62, alpha: 0.05 + random() * 0.12 });
  }
  const pores = [];
  for (let i = 0; i < 900; i++) pores.push({ x: random() * W, y: random() * H, len: 3 + random() * 16 });
  const wavy = (ctx, st, dy) => {
    ctx.beginPath();
    for (let x = 0; x <= W; x += 16) {
      const y = st.y + dy + st.amp * Math.sin(TAU * st.k * x / W + st.phase);
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };
  const color = makeTexture((ctx) => {
    for (let b = 0; b < boards; b++) { const t = tone[b]; ctx.fillStyle = `rgb(${t[0]},${t[1]},${t[2]})`; ctx.fillRect(0, b * boardH, W, boardH + 1); }
    for (const st of streaks) {
      ctx.lineWidth = st.width;
      ctx.strokeStyle = st.dark ? `rgba(140,115,88,${st.alpha})` : `rgba(252,246,232,${st.alpha * 0.9})`;
      for (const dy of [-H, 0, H]) wavy(ctx, st, dy);
    }
    ctx.fillStyle = "rgba(110,86,62,.26)";
    for (const po of pores) ctx.fillRect(po.x, po.y, po.len, 0.9);
    for (let b = 0; b < boards; b++) { ctx.fillStyle = "rgba(120,96,70,.30)"; ctx.fillRect(0, b * boardH, W, 1.4); }
  }, W, H);
  const grey = (paint) => { const t = makeTexture(paint, W, H); t.colorSpace = THREE.NoColorSpace; return t; };
  const roughness = grey((ctx) => {
    ctx.fillStyle = "rgb(165,165,165)"; ctx.fillRect(0, 0, W, H);
    for (const st of streaks) { ctx.lineWidth = st.width * 1.4; ctx.strokeStyle = st.dark ? `rgba(215,215,215,${st.alpha * 2})` : `rgba(110,110,110,${st.alpha * 1.6})`; for (const dy of [-H, 0, H]) wavy(ctx, st, dy); }
    ctx.fillStyle = "rgba(235,235,235,.75)"; for (const po of pores) ctx.fillRect(po.x, po.y, po.len, 1);
    for (let b = 0; b < boards; b++) { ctx.fillStyle = "rgba(240,240,240,.9)"; ctx.fillRect(0, b * boardH, W, 1.6); }
  });
  const bump = grey((ctx) => {
    ctx.fillStyle = "rgb(150,150,150)"; ctx.fillRect(0, 0, W, H);
    for (const st of streaks.filter((x) => x.dark)) { ctx.lineWidth = st.width; ctx.strokeStyle = `rgba(90,90,90,${st.alpha * 2.2})`; for (const dy of [-H, 0, H]) wavy(ctx, st, dy); }
    ctx.fillStyle = "rgba(70,70,70,.7)"; for (const po of pores) ctx.fillRect(po.x, po.y, po.len, 0.9);
    for (let b = 0; b < boards; b++) { ctx.fillStyle = "rgba(40,40,40,.9)"; ctx.fillRect(0, b * boardH, W, 1.6); }
  });
  for (const t of [color, roughness, bump]) { t.anisotropy = 8; t.generateMipmaps = true; }
  return { color, roughness, bump, tileMetres: [1.0, 0.5] };
}

function buildRightWallCredenza(scene, m) {
  const WALL_X = 2.94, Z_MIN = -0.80, Z_MAX = 1.00, DEPTH = 0.45, TOP_Y = 0.815, PLINTH = 0.08, TOP_T = 0.03;
  const length = Z_MAX - Z_MIN, zMid = (Z_MIN + Z_MAX) / 2, xBack = WALL_X - 0.002, xFront = xBack - DEPTH, xMid = (xBack + xFront) / 2;
  const parts = { walnut: [], front: [], dark: [], paint: [], paintDeep: [], paintHi: [], rib: [] };
  const hardwareParts = [];
  // Rounded edges only where they are seen (top and door fronts, 2 bevel segments); hidden body, plinth and pulls are plain boxes.
  const box = (bucket, size, position, rounded = false) => { const g = rounded ? roundedBoxGeometry(size, Math.min(0.006, Math.min(...size) * 0.25), 2) : new THREE.BoxGeometry(...size); if (!rounded) { g.deleteAttribute("uv"); g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2)); } g.translate(...position); parts[bucket].push(rounded ? g : g); return g; };
  const bodyH = TOP_Y - TOP_T - PLINTH;
  box("walnut", [DEPTH - 0.02, bodyH, length], [xMid + 0.01, PLINTH + bodyH / 2, zMid]);
  box("dark", [DEPTH - 0.08, PLINTH, length - 0.06], [xMid + 0.04, PLINTH / 2, zMid]);
  // Paul 2026-11-21 (the side cabinet looked plain and not modern): three fluted doors and, at the window end, a wide section of two drawers over a door in the original walnut tone (2026-11-21: no lighter panel, no inlay line). Handles stay the slim brass bars; the plinth is a recessed dark toe kick, and a thin brass edge line runs under the oak top. Still one vertex-colour mesh (the brass
  // parts join the existing brass mesh), so the draw call count is unchanged.
  const gap = 0.007, widths = [0.36, 0.36, 0.36], wide = length - gap * 5 - widths.reduce((a, b) => a + b, 0), doorWidths = [...widths, wide];
  const doors = doorWidths.length; let cursor = Z_MIN + gap;
  // Paul 2026-11-21 (colour-blocking): the left door and the wide window-end section are both painted the same slate blue, the three walnut fluted fronts become a middle pair of two with their pulls on the meeting
  // edges at the centre; every vertical pull (blue and walnut) hangs at the same height and has the same size, so the handles read as one set.
  const PULL_Y = 0.44, drawerH = 0.125, dgap = 0.007, stileW = 0.032;
  const verticalPull = (pz) => { const pull = new THREE.BoxGeometry(0.014, 0.082, 0.012); pull.translate(xFront - 0.02, PULL_Y, pz); hardwareParts.push(pull);
    for (const dy of [-0.027, 0.027]) { const standoff = new THREE.BoxGeometry(0.018, 0.008, 0.008); standoff.translate(xFront - 0.016, PULL_Y + dy, pz); hardwareParts.push(standoff); } };
  const shaker = (fx, z, doorW, cy, h) => { // one painted front: the slab, four frame bars and the recessed panel
    box("paint", [0.02, h, doorW], [fx, cy, z], true);
    box("paintDeep", [0.004, h - 2 * stileW, doorW - 2 * stileW], [fx - 0.0105, cy, z]); // the recessed panel, a little darker
    for (const sz of [-1, 1]) box("paintHi", [0.007, h, stileW], [fx - 0.0105, cy, z + sz * (doorW / 2 - stileW / 2)], true); // the two stiles
    for (const sy of [-1, 1]) box("paintHi", [0.007, stileW, doorW - 2 * stileW], [fx - 0.0105, cy + sy * (h / 2 - stileW / 2), z], true); // the top and bottom rails
  };
  for (let i = 0; i < doors; i++) {
    const doorW = doorWidths[i], z = cursor + doorW / 2; cursor += doorW + gap;
    const doorH = bodyH - 0.02, yMid = PLINTH + bodyH / 2, fx = xFront - 0.004, last = i === doors - 1;
    if (i === 0) { // the left door: slate blue like the window end, its pull on the edge that meets the walnut pair
      shaker(fx, z, doorW, yMid, doorH); verticalPull(z + doorW / 2 - 0.035);
    } else if (!last) { // the middle pair of fluted walnut doors: pulls on the two meeting edges
      box("front", [0.02, doorH, doorW], [fx, yMid, z], true); // the door slab
      const pitch = 0.0105, rib = 0.0066, n = Math.floor((doorW - 0.07) / pitch); // flutes: plain ribs (flat boxes, 3 mm proud) read the same as round ones at room distance
      for (let k = 0; k < n; k++) box("rib", [0.0034, doorH - 0.03, rib], [fx - 0.0105, yMid, z - (n - 1) * pitch / 2 + k * pitch]);
      // Slim vertical pulls on the opening edge at a natural hand height.
      verticalPull(z + (i === 1 ? doorW / 2 - 0.035 : -doorW / 2 + 0.035));
    } else {
      // Paul 2026-11-21 (first the wide end kept the plain walnut, which read as a downgrade next to the fluted doors): the wide section is now painted a calm slate blue, an American shaker finish: two
      // drawers over a door, each with a raised frame (stiles and rails 3.2 cm wide, 6 mm proud) round a recessed panel, and the same brass pulls. The blue sits well beside the olive cabinets and the oak top.
      const topY = yMid + doorH / 2;
      for (const k of [0, 1]) {
        const y = topY - drawerH / 2 - k * (drawerH + dgap);
        shaker(fx, z, doorW, y, drawerH);
        const bar = new THREE.BoxGeometry(0.014, 0.012, 0.11); bar.translate(xFront - 0.02, y, z); hardwareParts.push(bar);
        for (const dz of [-0.04, 0.04]) { const standoff = new THREE.BoxGeometry(0.018, 0.008, 0.008); standoff.translate(xFront - 0.016, y, z + dz); hardwareParts.push(standoff); }
      }
      const doorTop = topY - 2 * drawerH - 2 * dgap, doorBottom = yMid - doorH / 2, doorMid = (doorTop + doorBottom) / 2;
      shaker(fx, z, doorW, doorMid, doorTop - doorBottom);
      verticalPull(z - doorW / 2 + 0.035);
    }
  }
  { const strip = new THREE.BoxGeometry(0.004, 0.006, length - 0.02); strip.translate(xFront - 0.006, TOP_Y - TOP_T - 0.003, zMid); hardwareParts.push(strip); } // the thin brass edge line under the oak top
  // One mesh: warm walnut, slightly lighter door fronts, oak top and recessed shadow lines share one draw call.
  const tints = { walnut: 0x76543b, front: 0x6a4a33, dark: 0x201e1b, paint: 0x4a6877, paintDeep: 0x41606e, paintHi: 0x587a8a, rib: 0x86613f }; // the painted wide section: a slate blue
  const all = [];
  for (const [kind, list] of Object.entries(parts)) {
    const tint = new THREE.Color(tints[kind]);
    for (const g of list) {
      const colors = new Float32Array(g.attributes.position.count * 3);
      for (let i = 0; i < g.attributes.position.count; i++) tint.toArray(colors, i * 3);
      g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
      if (g.attributes.normal === undefined) g.computeVertexNormals();
      all.push(g);
    }
  }
  const group = new THREE.Group();
  group.name = "room03-right-wall-credenza";
  group.userData.category = "credenza";
  const geometry = mergeGeometries(all, false);
  all.forEach((g) => g.dispose());
  geometry.computeVertexNormals();
  const vertices = geometry.attributes.position.count;
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.88, map: m.olive.map }));
  mesh.name = "credenza"; mesh.userData.category = "credenza";
  mesh.castShadow = true; mesh.receiveShadow = true;
  group.add(mesh);
  const hardwareGeometry = mergeGeometries(hardwareParts, false);
  hardwareParts.forEach((g) => g.dispose());
  hardwareGeometry.computeVertexNormals();
  const hardwareMesh = new THREE.Mesh(hardwareGeometry, m.brass);
  hardwareMesh.name = "credenza-brass-pulls"; hardwareMesh.userData.category = "credenza";
  hardwareMesh.castShadow = true; hardwareMesh.receiveShadow = true;
  group.add(hardwareMesh);
  // Oak slab top: its own mesh and material (the one extra draw call), generous 8 mm / 3-segment edge, metre-based UVs by face direction.
  const topGeometry = roundedBoxGeometry([DEPTH + 0.01, TOP_T, length + 0.02], 0.008, 3);
  topGeometry.translate(xMid - 0.005, TOP_Y - TOP_T / 2, zMid);
  topGeometry.computeVertexNormals();
  const oakMaps = makeCredenzaOakMaps();
  { const pos = topGeometry.attributes.position, nor = topGeometry.attributes.normal, uv = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      const ax = Math.abs(nor.getX(i)), ay = Math.abs(nor.getY(i));
      const across = ay >= ax ? pos.getX(i) : pos.getY(i); // grain runs along z; the other axis is across the boards
      uv[i * 2] = pos.getZ(i) / oakMaps.tileMetres[0];
      uv[i * 2 + 1] = across / oakMaps.tileMetres[1];
    }
    topGeometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); }
  const topMesh = new THREE.Mesh(topGeometry, new THREE.MeshStandardMaterial({ name: "credenza-oak-top", color: 0xffffff, map: oakMaps.color, roughness: 1, roughnessMap: oakMaps.roughness, bumpMap: oakMaps.bump, bumpScale: 0.35, metalness: 0 }));
  topMesh.name = "credenza-oak-top"; topMesh.userData.category = "credenza";
  topMesh.castShadow = true; topMesh.receiveShadow = true;
  group.add(topMesh);
  scene.add(group);
  scene.updateMatrixWorld(true);
  const box3 = new THREE.Box3().setFromObject(group);
  const painting = scene.getObjectByName("prop-room03-wall-art");
  const paintingBox = painting ? new THREE.Box3().setFromObject(painting) : null;
  const mm = (v) => Number((v * 1000).toFixed(1));
  return {
    group,
    info: () => ({
      lengthMm: mm(box3.max.z - box3.min.z), depthMm: mm(box3.max.x - box3.min.x), heightMm: mm(box3.max.y - box3.min.y), floorGapMm: mm(box3.min.y),
      wallGapMm: mm(WALL_X - box3.max.x), wokCounterGapMm: mm(1.023 - box3.max.z),
      paintingAirMm: paintingBox ? mm(paintingBox.min.y - box3.max.y) : null,
      underPainting: paintingBox ? box3.min.z <= paintingBox.min.z && box3.max.z >= paintingBox.max.z : null,
      doors, color: "#76543b", doorColor: "#886344", topColor: "#b58a5b", hardware: "four slim vertical brushed-brass pulls at alternating door opening edges", hardwareCount: doors, hardwareHeightMm: 82, meshes: group.children.length, vertices: vertices + hardwareGeometry.attributes.position.count + topGeometry.attributes.position.count,
      topMaterial: { name: "credenza-oak-top", map: true, roughnessMap: true, bumpMap: true, roughness: "0.65 mid-board, 0.5-0.9 across the map", edgeRadiusMm: 8 },
    }),
  };
}

// Things on top of the clay-red credenza (Paul 2026-10-30: the top was empty). Styled like the shelves of Room 01: a low stack of books, a row of upright
// books with a small wooden sculpture, a faceted ceramic vessel with dried stems, a potted plant and a shallow dish with three stones. One merged
// vertex-colour mesh. Every piece stands on the oak top (y 0.815, measured); nothing is higher than the painting's bottom edge.
function buildRoom03CredenzaDecor(scene) {
  const TOP_Y = 0.815, X = 2.71;
  const parts = [];
  const add = (geometry, hex, position, rotation = [0, 0, 0], scale = [1, 1, 1], bucket = parts) => {
    geometry.applyMatrix4(new THREE.Matrix4().compose(
      new THREE.Vector3(...position), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)), new THREE.Vector3(...scale),
    ));
    const colour = new THREE.Color(hex), count = geometry.attributes.position.count, colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) colour.toArray(colors, i * 3);
    geometry.deleteAttribute("uv");
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    bucket.push(geometry);
  };
  const lathe = (profile, segments) => new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segments);
  const CLAY = 0xa8644a, MOSS = 0x6f7d5a, BLUE = 0x6c7f93, CREAM = 0xe6dccb, OAK = 0xb88b5b, CERAMIC = 0xd9cfbc;
  // A book: cloth cover as a box plus a lighter page block that shows on three sides. Lying books are rotated about their length axis.
  const book = (width, height, depth, cover, [x, y, z], yaw = 0, lean = 0) => {
    add(new THREE.BoxGeometry(width, height, depth), cover, [x, y + height / 2, z], [0, yaw, lean]);
    add(new THREE.BoxGeometry(width - 0.006, height - 0.01, depth + 0.002), CREAM, [x, y + height / 2, z], [0, yaw, lean]);
  };
  // Paul 2026-11-21 (the stack of three books looked like a bookshelf item, not a kitchen one; kitchen things from a reference photo of a sideboard instead): a woven wicker basket with a leafy plant, a small
  // amber glass lantern and a cream crock of wooden spoons. They stand where the books stood (z -0.56) and between it and the first cup; all of it joins the same merged mesh.
  const WICKER = 0xc7a26b, WICKER_DARK = 0x9d7a45, LEAF = [0x5f8446, 0x4d7338, 0x6f9250, 0x3f6a3c];
  {
    // The flat top holds only cooking things, laid out in order from the window end towards the stove (Paul 2026-11-21): a stoneware canister and a walnut pepper mill against the wall, a cherry-red enamel casserole with a round
    // board of halved lemon and lime beside it, a floral lidded spice pot, a tray of good bottles (balsamic vinegar, olive oil, soy sauce and the Thanksgiving table's burgundy wine bottle, copied), and two
    // stacks of dinner plates side by side by the wall (with a mug on one), 4 cm clear of the record player (z 0.32 on). Anything that did not look finished was taken out.
    // Paul 2026-11-22 (the crock of thin spoons read as odd sticks in a white jar): a matte stoneware canister with a blue glaze band, an oak lid and a brass knob, and a turned walnut pepper mill with brass rings,
    // the kind of kitchenware in the 2026 design shops. Both stand against the wall at the window end, clear of each other and of the round board.
    const canX = 2.85, canZ = -0.744, millZ = -0.6745;
    add(lathe([[0, 0], [0.039, 0], [0.044, 0.008], [0.044, 0.118], [0.04, 0.122], [0, 0.122]], 28), 0xe9e0cf, [canX, TOP_Y, canZ]);
    add(new THREE.CylinderGeometry(0.0446, 0.0446, 0.02, 28, 1, true), 0xc4704f, [canX, TOP_Y + 0.07, canZ]);
    add(new THREE.CylinderGeometry(0.0446, 0.0446, 0.004, 28, 1, true), 0xf3ead8, [canX, TOP_Y + 0.088, canZ]);
    add(lathe([[0, 0.12], [0.043, 0.12], [0.043, 0.128], [0.037, 0.134], [0, 0.136]], 28), 0xb98a52, [canX, TOP_Y, canZ]);
    add(new THREE.SphereGeometry(0.0095, 12, 8), 0xc9a45a, [canX, TOP_Y + 0.144, canZ]);
    add(lathe([[0, 0], [0.022, 0], [0.021, 0.02], [0.015, 0.07], [0.013, 0.1], [0.018, 0.135], [0.02, 0.16], [0.012, 0.172], [0, 0.174]], 24), 0x7a5636, [canX, TOP_Y, millZ]);
    for (const y of [0.022, 0.108]) add(new THREE.TorusGeometry(y < 0.05 ? 0.0215 : 0.0135, 0.0018, 6, 20).rotateX(Math.PI / 2), 0xc9a45a, [canX, TOP_Y + y, millZ]);
    add(new THREE.SphereGeometry(0.0115, 12, 8), 0x7a5636, [canX, TOP_Y + 0.178, millZ]);
    { const bx3 = 2.82, bz3 = -0.575; // the round board with a halved lemon and a halved lime
      add(new THREE.CylinderGeometry(0.075, 0.075, 0.016, 28), 0xc79a5f, [bx3, TOP_Y + 0.008, bz3]); add(new THREE.TorusGeometry(0.075, 0.0045, 5, 28).rotateX(Math.PI / 2), 0xa9793f, [bx3, TOP_Y + 0.016, bz3]);
      add(new THREE.SphereGeometry(1, 16, 8).scale(0.03, 0.022, 0.026), 0xf1d54a, [bx3 - 0.025, TOP_Y + 0.025, bz3 - 0.012]); add(new THREE.CylinderGeometry(0.022, 0.022, 0.004, 18), 0xf8ecae, [bx3 - 0.025, TOP_Y + 0.046, bz3 - 0.012]);
      add(new THREE.SphereGeometry(1, 16, 8).scale(0.026, 0.02, 0.023), 0x8fbf3d, [bx3 + 0.028, TOP_Y + 0.024, bz3 + 0.022]); add(new THREE.CylinderGeometry(0.019, 0.019, 0.004, 18), 0xdce8a6, [bx3 + 0.028, TOP_Y + 0.042, bz3 + 0.022]);
    }
    { const cx3 = 2.65, cz3 = -0.62; // the cherry-red enamel casserole with its lid, a brass knob and two side handles
      add(lathe([[0, 0], [0.065, 0], [0.078, 0.01], [0.082, 0.07], [0.078, 0.082], [0.072, 0.082], [0, 0.08]], 28), 0xc6362a, [cx3, TOP_Y, cz3]);
      add(lathe([[0, 0.078], [0.08, 0.078], [0.083, 0.082], [0.07, 0.098], [0.02, 0.104], [0, 0.104]], 28), 0xc6362a, [cx3, TOP_Y, cz3]);
      add(new THREE.SphereGeometry(0.011, 12, 8), 0xc9a45a, [cx3, TOP_Y + 0.113, cz3]);
      for (const sz of [-1, 1]) add(new THREE.BoxGeometry(0.02, 0.012, 0.02), 0xa82a20, [cx3, TOP_Y + 0.07, cz3 + sz * 0.094]);
    }
    { const RX = 2.66, RZ = -0.44; // a ceramic lidded spice pot with a wooden spoon and a blue-and-white band
      add(lathe([[0, 0], [0.04, 0], [0.047, 0.03], [0.045, 0.085], [0.04, 0.09], [0, 0.09]], 20), 0xf1ece0, [RX, TOP_Y, RZ]); add(new THREE.CylinderGeometry(0.0475, 0.0475, 0.018, 20, 1, true), 0x3b6fa6, [RX, TOP_Y + 0.05, RZ]);
      add(lathe([[0, 0.09], [0.043, 0.09], [0.04, 0.1], [0.02, 0.106], [0, 0.106]], 18), 0xc79a5f, [RX, TOP_Y, RZ]); add(new THREE.SphereGeometry(0.008, 8, 6), 0xa9793f, [RX, TOP_Y + 0.112, RZ]);
      add(new THREE.CylinderGeometry(0.0025, 0.003, 0.07, 6), 0xb98a52, [RX + 0.012, TOP_Y + 0.12, RZ], [0, 0, -0.5]); add(new THREE.SphereGeometry(1, 8, 5).scale(0.01, 0.014, 0.004), 0xb98a52, [RX + 0.033, TOP_Y + 0.148, RZ], [0, 0, -0.5]);
    }
    { const tx2 = 2.855, tz2 = -0.235; // the tray of good bottles: 4 bottles, each 7 to 8 cm across, plain labels (no brands)
      add(new THREE.BoxGeometry(0.105, 0.012, 0.36), 0xb88b5b, [tx2, TOP_Y + 0.006, tz2]);
      for (const sz of [-1, 1]) add(new THREE.BoxGeometry(0.105, 0.018, 0.008), 0xa27a4c, [tx2, TOP_Y + 0.015, tz2 + sz * 0.176]);
      const y0 = TOP_Y + 0.012;
      const bottle = (z, r, h, body, cap, labelHex, neck = 0.42) => { // a broad-shouldered bottle with a screw cap (Paul 2026-11-22: no paper label on these two; the olive oil and the wine below are the kitchen's own bottles, copied)
        add(lathe([[0, 0], [r * 0.92, 0], [r, 0.008], [r, h * 0.58], [r * 0.9, h * 0.7], [r * 0.62, h * 0.8], [r * neck, h * 0.88], [r * neck, h * 0.97], [0, h * 0.97]], 26), body, [tx2, y0, z]);
        add(new THREE.CylinderGeometry(r * neck + 0.004, r * neck + 0.006, 0.026, 16), cap, [tx2, y0 + h * 0.97 + 0.01, z]);
      };
      bottle(tz2 - 0.135, 0.040, 0.235, 0x1b2b1e, 0x1b1b1b, 0xe8dcc0, 0.3);   // balsamic vinegar
      { const oz = tz2 - 0.045; // the olive oil copied from the oven-side counter: dark green glass, a blank olive-gold paper band, a narrow gold neck ring and a dark screw cap
        add(lathe([[0, 0], [0.026, 0], [0.032, 0.004], [0.034, 0.012], [0.034, 0.085]], 24), 0x263b2b, [tx2, y0, oz]);
        add(lathe([[0, 0.085], [0.034, 0.085], [0.034, 0.125], [0, 0.125]], 24), 0xb7a979, [tx2, y0, oz]);
        add(lathe([[0, 0.125], [0.034, 0.125], [0.031, 0.15], [0.018, 0.174], [0.013, 0.18], [0.013, 0.198], [0, 0.198]], 24), 0x263b2b, [tx2, y0, oz]);
        add(lathe([[0, 0.198], [0.013, 0.198], [0.013, 0.205], [0.014, 0.209], [0.014, 0.215], [0, 0.215]], 24), 0x786b44, [tx2, y0, oz]);
        add(new THREE.CylinderGeometry(0.015, 0.015, 0.029, 16), 0x292b25, [tx2, y0 + 0.2295, oz]);
        add(new THREE.TorusGeometry(0.0145, 0.0015, 4, 16).rotateX(Math.PI / 2), 0x81734a, [tx2, y0 + 0.218, oz]); }
      bottle(tz2 + 0.045, 0.042, 0.17, 0x2a1a12, 0xc6362a, 0xf2ece0, 0.5);    // soy sauce
      { const wz = tz2 + 0.135; // the burgundy wine bottle copied from the Thanksgiving table: dark green glass, a cream label band, a burgundy foil capsule
        add(lathe([[0, 0], [0.034, 0], [0.038, 0.006], [0.038, 0.06], [0, 0.06]], 20), 0x1f2b22, [tx2, y0, wz]);
        add(lathe([[0, 0.06], [0.038, 0.06], [0.038, 0.14], [0, 0.14]], 20), 0xd8ceba, [tx2, y0, wz]);
        add(lathe([[0, 0.14], [0.038, 0.14], [0.038, 0.17], [0.034, 0.19], [0.022, 0.215], [0.0155, 0.235], [0.015, 0.255], [0, 0.255]], 20), 0x1f2b22, [tx2, y0, wz]);
        add(lathe([[0, 0.255], [0.015, 0.255], [0.015, 0.285], [0.0165, 0.292], [0.0165, 0.30], [0, 0.30]], 20), 0x5a1a22, [tx2, y0, wz]); }
    }
    { const plateStack = (px2, pz2, withMug) => { // a stack of four dinner plates, 16 cm across
        for (let i = 0; i < 4; i++) add(lathe([[0, 0], [0.05, 0], [0.076, 0.009], [0.08, 0.013], [0.074, 0.013], [0.048, 0.004], [0, 0.003]], 28), i % 2 ? 0xf1ece0 : 0xe9e3d4, [px2, TOP_Y + i * 0.0125, pz2]);
        if (withMug) { add(lathe([[0, 0], [0.032, 0], [0.036, 0.004], [0.04, 0.07], [0.036, 0.075], [0.031, 0.07], [0, 0.007]], 18), 0x8aa5a8, [px2, TOP_Y + 0.0525, pz2]); add(new THREE.TorusGeometry(0.02, 0.0045, 5, 12, Math.PI).rotateZ(-Math.PI / 2), 0x8aa5a8, [px2 + 0.04, TOP_Y + 0.088, pz2]); }
      };
      plateStack(2.82, 0.03, true); plateStack(2.82, 0.2, false); // side by side by the wall; the second ends at z 0.28, 4 cm from the record player (z 0.32)
    }
  }
  // Replace the tiny decorative ceramic cup with two useful takeaway cups, set along the clear front strip.
  // Both are 125 mm tall, sit 1 mm into the oak top, and stay in the clear front strip between the books and the right-side keepsake.
  const cupFits = [];
  const takeawayCup = (name, z, bodyColour, sleeveColour) => {
    const cx = 2.55, baseY = TOP_Y - 0.001, cupParts = [];
    const part = (geometry, colour, position, rotation = [0, 0, 0], scale = [1, 1, 1]) => {
      add(geometry, colour, position, rotation, scale);
      geometry.computeBoundingBox();
      cupParts.push(geometry.boundingBox.clone());
    };
    part(lathe([[0, 0], [0.031, 0], [0.033, 0.003], [0.043, 0.112], [0, 0.112]], 18), bodyColour, [cx, baseY, z]);
    part(new THREE.CylinderGeometry(0.0415, 0.0385, 0.04, 18, 1, true), sleeveColour, [cx, baseY + 0.055, z]);
    part(lathe([[0, 0.112], [0.040, 0.112], [0.046, 0.115], [0.046, 0.120], [0.041, 0.125], [0.008, 0.125], [0, 0.123]], 18), 0x343431, [cx, baseY, z]);
    part(new THREE.SphereGeometry(1, 10, 6), 0x20201e, [cx, baseY + 0.126, z + 0.019], [0, 0, 0], [0.012, 0.0012, 0.004]);
    const bounds = new THREE.Box3();
    cupParts.forEach((box) => bounds.union(box));
    cupFits.push({ name, bounds: { min: bounds.min.toArray(), max: bounds.max.toArray() }, bodyColour: `#${bodyColour.toString(16).padStart(6, "0")}`, sleeveColour: `#${sleeveColour.toString(16).padStart(6, "0")}`, lidColour: "#343431" });
  };
  // Paul 2026-11-21: only the Shanghai Slowly cup stays; the cream-sage cup is gone.
  // Paul 2026-11-17: the mist-blue cup moves in beside the two water bottles so the whole record player shows, and it carries a small easter egg:
  // "Shanghai Slowly Cafe", Room 04's cafe, as if the owner had just flown home from Shanghai with a favourite cup. Drawn in code on a curved
  // label over the kraft sleeve (no download); the text is our own fictional cafe, not a real brand.
  takeawayCup("mist-blue-kraft", 0.26, 0xb8c4c4, 0xc0a27b); // moved closer to the record player (Paul 2026-11-21)
  {
    const canvas = document.createElement("canvas"); canvas.width = 560; canvas.height = 400;
    const g = canvas.getContext("2d");
    g.clearRect(0, 0, 560, 400); g.fillStyle = "#3a2a1c"; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = "italic 700 92px Georgia, 'Times New Roman', serif"; g.fillText("Shanghai", 280, 118); g.fillText("Slowly", 280, 218);
    g.font = "600 60px Georgia, 'Times New Roman', serif"; g.fillText("C A F E", 280, 318);
    g.fillRect(150, 358, 260, 4);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8;
    const arc = 1.3, facing = -0.8; // radians; the label faces into the room (toward the camera side)
    const label = new THREE.Mesh(new THREE.CylinderGeometry(0.0421, 0.0391, 0.04, 28, 1, true, facing - arc / 2, arc),
      new THREE.MeshStandardMaterial({ map: texture, transparent: true, roughness: 0.85, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    label.name = "room03-takeaway-cup-label"; label.position.set(2.55, TOP_Y - 0.001 + 0.055, 0.26); label.userData.category = "credenza";
    scene.add(label);
  }
  // Paul moved the upright books out so the record player has a clear, supported footprint.
  // The small unbranded San Francisco cable car now rests on the entry nook's TV console.
  // A redwood-toned plinth, clay-red body, cream trim and brass details echo the framed cable-car art above.
  const keepsakeCenter = [2.69, TOP_Y, 0.57], nookCenter = [-0.78, 0.575, 3.52], keepsakeBoxes = [], keepsakeParts = [];
  const keepsakeOffset = nookCenter.map((v, axis) => v - keepsakeCenter[axis]);
  let keepsakeVertices = 0;
  const keepsakePart = (geometry, colour, position, rotation = [0, 0, 0], scale = [1, 1, 1]) => {
    add(geometry, colour, position.map((v, axis) => v + keepsakeOffset[axis]), rotation, scale, keepsakeParts);
    geometry.computeBoundingBox();
    keepsakeBoxes.push(geometry.boundingBox.clone());
    keepsakeVertices += geometry.attributes.position.count;
  };
  const [kx, , kz] = keepsakeCenter;
  const cableClay = 0x9d5545, cableCream = 0xe7dfcf, cableGlass = 0x50666a, cableBrass = 0xb58c4e, cableDark = 0x343936, redwood = 0x80573e;
  keepsakePart(new THREE.BoxGeometry(0.126, 0.009, 0.202), redwood, [kx, TOP_Y + 0.0045, kz]);
  keepsakePart(new THREE.BoxGeometry(0.108, 0.018, 0.18), cableDark, [kx, TOP_Y + 0.018, kz]);
  // Four paired wheels, with small brass hubs on their outward faces.
  for (const wheelZ of [-0.061, 0.061]) for (const side of [-1, 1]) {
    const x = kx + side * 0.058, z = kz + wheelZ, y = TOP_Y + 0.022;
    keepsakePart(new THREE.CylinderGeometry(0.014, 0.014, 0.008, 12), cableDark, [x, y, z], [0, 0, Math.PI / 2]);
    keepsakePart(new THREE.CylinderGeometry(0.005, 0.005, 0.009, 10), cableBrass, [x + side * 0.004, y, z], [0, 0, Math.PI / 2]);
  }
  keepsakePart(new THREE.BoxGeometry(0.094, 0.049, 0.151), cableClay, [kx, TOP_Y + 0.0585, kz]);
  // Side glazing: four dark windows per side with raised cream pillars and sill rails.
  for (const side of [-1, 1]) {
    for (const windowZ of [-0.049, -0.016, 0.017, 0.05]) {
      keepsakePart(new THREE.BoxGeometry(0.002, 0.026, 0.026), cableGlass, [kx + side * 0.048, TOP_Y + 0.063, kz + windowZ]);
    }
    keepsakePart(new THREE.BoxGeometry(0.003, 0.006, 0.154), cableCream, [kx + side * 0.049, TOP_Y + 0.038, kz]);
    keepsakePart(new THREE.BoxGeometry(0.003, 0.005, 0.154), cableCream, [kx + side * 0.049, TOP_Y + 0.087, kz]);
    for (const postZ of [-0.066, -0.033, 0.0, 0.033, 0.066]) {
      keepsakePart(new THREE.BoxGeometry(0.003, 0.033, 0.004), cableCream, [kx + side * 0.049, TOP_Y + 0.063, kz + postZ]);
    }
  }
  // Front and rear windows, roof, open boarding decks and brass handrails.
  for (const end of [-1, 1]) {
    keepsakePart(new THREE.BoxGeometry(0.041, 0.025, 0.002), cableGlass, [kx, TOP_Y + 0.063, kz + end * 0.077]);
    keepsakePart(new THREE.BoxGeometry(0.098, 0.01, 0.036), cableClay, [kx, TOP_Y + 0.033, kz + end * 0.096]);
    keepsakePart(new THREE.CylinderGeometry(0.002, 0.002, 0.037, 6), cableBrass, [kx - 0.037, TOP_Y + 0.055, kz + end * 0.098]);
    keepsakePart(new THREE.CylinderGeometry(0.002, 0.002, 0.037, 6), cableBrass, [kx + 0.037, TOP_Y + 0.055, kz + end * 0.098]);
    keepsakePart(new THREE.CylinderGeometry(0.002, 0.002, 0.074, 6), cableBrass, [kx, TOP_Y + 0.074, kz + end * 0.098], [0, 0, Math.PI / 2]);
  }
  keepsakePart(new THREE.BoxGeometry(0.104, 0.012, 0.164), cableCream, [kx, TOP_Y + 0.089, kz]);
  // A tiny roof bell and grip pole are the distinctive cable-car details (form reference: SFMTA).
  keepsakePart(new THREE.SphereGeometry(0.009, 8, 6), cableBrass, [kx - 0.022, TOP_Y + 0.101, kz - 0.058]);
  const gripCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.096, -0.055), new THREE.Vector3(0, 0.133, -0.056),
    new THREE.Vector3(0.012, 0.145, -0.056), new THREE.Vector3(0.025, 0.145, -0.052),
  ]);
  keepsakePart(new THREE.TubeGeometry(gripCurve, 10, 0.0022, 6, false), cableDark, [kx, TOP_Y, kz]);
  const keepsakeBounds = new THREE.Box3();
  keepsakeBoxes.forEach((box) => keepsakeBounds.union(box));
  const keepsakeGeometry = mergeGeometries(keepsakeParts, false);
  keepsakeParts.forEach((part) => part.dispose());
  keepsakeGeometry.computeVertexNormals();
  const keepsakeMesh = new THREE.Mesh(keepsakeGeometry, new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.82 }));
  keepsakeMesh.name = "room03-nook-cable-car-keepsake";
  keepsakeMesh.userData.category = "entry-nook";
  keepsakeMesh.castShadow = true; keepsakeMesh.receiveShadow = true;
  scene.add(keepsakeMesh);
  const keepsake = { type: "unbranded-sf-cable-car-keepsake", bounds: { min: keepsakeBounds.min.toArray(), max: keepsakeBounds.max.toArray() }, vertices: keepsakeVertices, consoleGapMm: Math.round((keepsakeBounds.min.y - 0.575) * 1000) };
  // Paul 2026-11-21: the three lying books that stood on the credenza (it now carries kitchenware) go to the little entry nook: stacked on the console's far end, beside the little cable car, the top one a little
  // off square. Their own mesh, so the keepsake's and the credenza decor's measured bounds stay as they were.
  {
    const nookBooks = [], NB = { x: -1.07, z: 3.47, y: 0.575 };
    const nbook = (width, height, depth, cover, y, yaw) => {
      for (const [geo, hex] of [[new THREE.BoxGeometry(width, height, depth), cover], [new THREE.BoxGeometry(width - 0.006, height - 0.01, depth + 0.002), CREAM]]) {
        geo.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(NB.x, y + height / 2, NB.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0)), new THREE.Vector3(1, 1, 1)));
        const colour = new THREE.Color(hex), n = geo.attributes.position.count, cols = new Float32Array(n * 3); for (let i = 0; i < n; i++) colour.toArray(cols, i * 3);
        geo.deleteAttribute("uv"); geo.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3)); nookBooks.push(geo);
      }
    };
    let by = NB.y; for (const [length, height, width, cover, yaw] of [[0.27, 0.045, 0.19, MOSS, 1.6], [0.25, 0.05, 0.18, CLAY, 1.52], [0.23, 0.04, 0.17, BLUE, 1.7]]) { nbook(length, height, width, cover, by, yaw); by += height; }
    const booksGeometry = mergeGeometries(nookBooks, false); nookBooks.forEach((g) => g.dispose()); booksGeometry.computeVertexNormals();
    const booksMesh = new THREE.Mesh(booksGeometry, new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.82 }));
    booksMesh.name = "room03-nook-books"; booksMesh.userData.category = "entry-nook"; booksMesh.castShadow = true; booksMesh.receiveShadow = true; scene.add(booksMesh);
  }
  // Paul 2026-11-21: the green plant leaves the credenza (it holds cooking things only now) and stands on the floor by the window instead, beside the lounge chair: a tall glazed pot in sage with a big
  // leafy plant (a dozen large oval leaves on slim stems, two shades of green). Its own mesh; it needs no power and keeps clear of the chair (which ends at z 0.22) and the glass.
  {
    const floorParts = [], FX = -2.72, FZ = 0.78;
    const fadd = (geometry, hex, position, rotation = [0, 0, 0], scale = [1, 1, 1]) => {
      geometry.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...position), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)), new THREE.Vector3(...scale)));
      const colour = new THREE.Color(hex), n = geometry.attributes.position.count, cols = new Float32Array(n * 3); for (let q = 0; q < n; q++) colour.toArray(cols, q * 3);
      geometry.deleteAttribute("uv"); geometry.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3)); floorParts.push(geometry);
    };
    const POT = [[0, 0.002], [0.12, 0.002], [0.15, 0.1], [0.165, 0.3], [0.17, 0.34], [0.158, 0.345], [0.15, 0.33], [0, 0.32]];
    const potR = (y) => { for (let i = 1; i < POT.length - 3; i++) if (y <= POT[i + 1][1]) { const [r0, y0] = POT[i], [r1, y1] = POT[i + 1]; return r0 + (r1 - r0) * (y - y0) / (y1 - y0); } return 0.17; };
    fadd(new THREE.LatheGeometry(POT.map(([x, y]) => new THREE.Vector2(x, y)), 36), 0x9bad94, [FX, 0, FZ]); // the pot, same sage glaze
    fadd(new THREE.CylinderGeometry(0.15, 0.15, 0.004, 28), 0x4a3526, [FX, 0.322, FZ]); // soil
    // Hand-painted band on the upper pot (Paul 2026-11-21: same colour, more painted atmosphere): two cream stripes at the rim, a running vine of leaf pairs in deep green with a terracotta dot between them, and
    // a mustard dot border below. Flat decals lying 1 mm off the glaze (tangent ellipsoids), so they read as paint, not relief.
    const decal = (a, y, sx, sy, hex, rollZ = 0) => { const r = potR(y) + 0.0012; fadd(new THREE.SphereGeometry(1, 8, 5).scale(sx, sy, 0.0016), hex, [FX + Math.cos(a) * r, y, FZ + Math.sin(a) * r], [0, Math.PI / 2 - a, rollZ]); };
    for (const [sy, hex] of [[0.322, 0xf1e8d2], [0.304, 0xc4623a]]) fadd(new THREE.CylinderGeometry(potR(sy) + 0.0012, potR(sy) + 0.0012, 0.005, 48, 1, true), hex, [FX, sy, FZ]);
    for (let q = 0; q < 14; q++) { const a = q * Math.PI * 2 / 14;
      decal(a, 0.262, 0.026, 0.0085, 0x2f5a3a, 0.5); decal(a + 0.13, 0.268, 0.024, 0.008, 0x3f7a3c, -0.55); // a leaf pair
      decal(a + 0.0 + Math.PI / 14, 0.282, 0.0065, 0.0065, 0xc4623a); // terracotta bud between leaves
      decal(a, 0.222, 0.006, 0.006, 0xd9a441); } // mustard dot border
    // Fourteen slim stems fan out of one tuft: each starts 2.2 cm BELOW the soil (y 0.30), inside the pot, and rises to its own tip; the leaves hang off the tips in three layers (long arching outer leaves,
    // mid leaves, short upright inner ones), each cupped along its length with a pale midrib.
    const up = new THREE.Vector3(0, 1, 0);
    for (let q = 0; q < 16; q++) {
      const a = q * 2.399, layer = q % 3, tilt = [0.62, 0.4, 0.18][layer] + (q % 4) * 0.03, h = [0.4, 0.48, 0.55][layer] + (q % 5) * 0.03;
      const ox = Math.cos(a), oz = Math.sin(a), r0 = 0.012 + (q % 4) * 0.008;
      const base = new THREE.Vector3(FX + ox * r0, 0.30, FZ + oz * r0);
      const tip = new THREE.Vector3(FX + ox * (r0 + Math.sin(tilt) * h), 0.322 + Math.cos(tilt) * h, FZ + oz * (r0 + Math.sin(tilt) * h));
      const dir = tip.clone().sub(base), len = dir.length(), mid = base.clone().add(tip).multiplyScalar(0.5);
      const stemGeo = new THREE.CylinderGeometry(0.0035, 0.0048, len, 5);
      stemGeo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize()));
      fadd(stemGeo, 0x5d7a45, [mid.x, mid.y, mid.z]);
      // leaf: a cupped, arching ellipsoid whose base sits on the stem tip and whose length points outward and droops
      const L = [0.15, 0.125, 0.095][layer], Wd = [0.052, 0.046, 0.04][layer], droop = [0.55, 0.32, 0.05][layer];
      const f = new THREE.Vector3(ox * Math.cos(droop), Math.sin(0.35 - droop) * 0.6, oz * Math.cos(droop)).normalize();
      const xAx = new THREE.Vector3().crossVectors(up, f).normalize(), yAx = new THREE.Vector3().crossVectors(f, xAx).normalize();
      const leafGeo = new THREE.SphereGeometry(1, 14, 10), lp = leafGeo.attributes.position;
      for (let i = 0; i < lp.count; i++) { const z = lp.getZ(i); lp.setXYZ(i, lp.getX(i) * Wd * (1 - 0.25 * z * z), lp.getY(i) * 0.006 - 0.022 * z * z + 0.014 * Math.abs(lp.getX(i)), z * L); } // cupped and arched
      leafGeo.applyMatrix4(new THREE.Matrix4().makeBasis(xAx, yAx, f).setPosition(tip.x + f.x * L, tip.y + f.y * L, tip.z + f.z * L));
      fadd(leafGeo, q % 3 === 0 ? 0x5b9444 : layer === 2 ? 0x6fa24a : 0x3f7a3c, [0, 0, 0]);
      const rib = new THREE.CylinderGeometry(0.0016, 0.001, L * 1.7, 4); rib.rotateX(Math.PI / 2);
      rib.applyMatrix4(new THREE.Matrix4().makeBasis(xAx, yAx, f).setPosition(tip.x + f.x * L + yAx.x * 0.0035, tip.y + f.y * L + yAx.y * 0.0035, tip.z + f.z * L + yAx.z * 0.0035));
      fadd(rib, 0xa9c47a, [0, 0, 0]);
    }
    const floorGeometry = mergeGeometries(floorParts, false); floorParts.forEach((g) => g.dispose()); floorGeometry.computeVertexNormals();
    const floorMesh = new THREE.Mesh(floorGeometry, new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.78, side: THREE.DoubleSide }));
    floorMesh.name = "room03-window-floor-plant"; floorMesh.userData.category = "plants"; floorMesh.castShadow = true; floorMesh.receiveShadow = true; scene.add(floorMesh);
  }
  const geometry = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose());
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.82 }));
  mesh.name = "room03-credenza-decor";
  mesh.userData.category = "household-props";
  mesh.castShadow = true; mesh.receiveShadow = true;
  scene.add(mesh);
  mesh.updateMatrixWorld(true);
  const vertices = geometry.attributes.position.count;
  return {
    vertices, mesh, cups: cupFits, keepsake,
    bounds: () => { scene.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(mesh); return { min: box.min.toArray(), max: box.max.toArray() }; },
  };
}

// A compact, self-contained turntable on the cleared end of the credenza. No sound is loaded in this first step.
// US wall outlets (NEMA 5-15R) in the Decora style that a Bay Area kitchen remodel uses (Paul, 2026-11-19: "an outlet a Bay Area kitchen would use"; not the round-faced build of the
// first pass, and not Room 01's Taiwanese one): a white single-gang plate 70 x 114.5 mm, 8 mm thick, 0.5 mm into the wall, with one flat rounded-rectangle face 33.5 mm wide carrying two
// receptacles; each has a taller neutral slot on the left (9 mm), a shorter hot slot on the right (7 mm) and a round ground hole below. The GFCI kind (kitchen counters, by the sink) is a
// little taller and has a centre band with a dark TEST button, a dark-red RESET button and a small green LED. A plate screw sits below the face. When plugged, a chunky black moulded plug
// stands in the lower receptacle (1 mm into the face, with a lighter grip panel and a strain relief); the cord is added by the caller and ends inside that neck.
// Built facing +z in a local frame (x is the viewer's right), then turned by `yaw` about y and moved to `origin` (the centre of the plate on the wall plane).
const OUTLET_CORD_R = 0.0025;
function usOutlet(kind, { origin, yaw }, plugged = false) {
  const gfci = kind === "gfci", PITCH = gfci ? 0.0245 : 0.0195, FACE_H = 2 * PITCH + 0.032 + (gfci ? 0.004 : 0), ZF = 0.0083, DARK = 0x1b1a19, parts = [];
  const put = (geometry, hex) => parts.push([geometry, hex]);
  const rod = (radius, length) => new THREE.CylinderGeometry(radius, radius, length, 14).rotateX(Math.PI / 2); // a disc whose axis is z
  put(new THREE.BoxGeometry(0.07, 0.1145, 0.008).translate(0, 0, 0.0035), 0xf4f2ec);
  put(new THREE.BoxGeometry(0.0335, FACE_H, 0.0008).translate(0, 0, 0.0075 + 0.0004), 0xf8f6f0);
  for (const dy of [PITCH, -PITCH]) {
    for (const [dx, h] of [[-0.00635, 0.009], [0.00635, 0.007]]) put(new THREE.BoxGeometry(0.0021, h, 0.0006).translate(dx, dy + 0.0035, ZF + 0.0001), DARK);
    put(rod(0.0026, 0.0006).translate(0, dy - 0.0072, ZF + 0.0001), DARK);
  }
  if (gfci) {
    put(new THREE.BoxGeometry(0.0085, 0.0055, 0.0016).translate(-0.0075, 0, ZF + 0.0008), 0x26272a); // TEST
    put(new THREE.BoxGeometry(0.0085, 0.0055, 0.0016).translate(0.0075, 0, ZF + 0.0008), 0x8a2a2a); // RESET
    put(rod(0.0016, 0.0008).translate(0, 0.0072, ZF + 0.0004), 0x3fcf74); // the LED
  }
  put(rod(0.0026, 0.001).translate(0, -(FACE_H / 2 + 0.0078), 0.008), 0xd8d5cc); // the plate screw
  put(new THREE.BoxGeometry(0.0044, 0.0007, 0.0004).translate(0, -(FACE_H / 2 + 0.0078), 0.0088), 0x8d8a82); // and its slot
  let neckLocal = null;
  const NECK_LEN = 0.016, PZ = ZF - 0.001 + 0.009;
  if (plugged) {
    put(new THREE.BoxGeometry(0.026, 0.034, 0.018).translate(0, -PITCH, PZ), 0x161719);
    put(new THREE.BoxGeometry(0.018, 0.022, 0.003).translate(0, -PITCH + 0.001, PZ + 0.009 + 0.0015), 0x242628);
    neckLocal = new THREE.Vector3(0, -PITCH - 0.017 - 0.006, PZ);
    put(new THREE.CylinderGeometry(OUTLET_CORD_R + 0.0012, OUTLET_CORD_R + 0.0006, NECK_LEN, 8).translate(neckLocal.x, neckLocal.y, neckLocal.z), 0x161719);
  }
  const frame = new THREE.Matrix4().compose(new THREE.Vector3(...origin), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw), new THREE.Vector3(1, 1, 1));
  for (const [geometry] of parts) geometry.applyMatrix4(frame);
  return { parts, neck: neckLocal ? neckLocal.applyMatrix4(frame) : null, neckLen: NECK_LEN, plateBottomY: origin[1] - 0.05725, pitch: PITCH };
}
const colourParts = (parts, into) => { // vertex colours for every part, pushed into one list that is merged into a single mesh
  for (const [geometry, hex] of parts) {
    const tint = new THREE.Color(hex), count = geometry.attributes.position.count, colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) tint.toArray(colors, i * 3);
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    into.push(geometry);
  }
};

// Two more outlets (Paul, 2026-11-19): a GFCI on the backsplash beside the sink, empty, 165 mm above the counter, and a Decora duplex on the entry wall behind the window-side floor lamp
// with the lamp's cord plugged into its lower receptacle. The lamp's cord leaves its pole between two tripod legs, drops to the floor, lies along it to the wall and climbs the wall (flush,
// there is no skirting on this wall) into the plug. One vertex-coloured mesh for both outlets and the cord.
function buildRoom03Outlets(scene) {
  const COUNTER_TOP = 0.955, TILE_FACE_Z = -2.2675, WALL_Z = 2.34, LAMP = { x: -1.93, z: 1.68, poleR: 0.012 }, FLOOR_LIE = OUTLET_CORD_R + 0.0012, parts = [];
  const gfci = usOutlet("gfci", { origin: [-1.12, COUNTER_TOP + 0.165, TILE_FACE_Z], yaw: 0 });
  const lampOut = usOutlet("duplex", { origin: [-1.90, 0.36, WALL_Z], yaw: Math.PI }, true);
  colourParts(gfci.parts, parts); colourParts(lampOut.parts, parts);
  const nk = lampOut.neck, yPb = lampOut.plateBottomY, yEnd = nk.y + 0.004, zw = (d) => WALL_Z - d;
  const cordCurve = new THREE.CatmullRomCurve3([
    [LAMP.x, 0.22, LAMP.z + 0.009], [LAMP.x, 0.21, LAMP.z + 0.020], [LAMP.x, 0.15, LAMP.z + 0.032], [LAMP.x + 0.001, 0.06, LAMP.z + 0.050], [LAMP.x + 0.002, 0.026, LAMP.z + 0.066], [LAMP.x + 0.003, 0.009, LAMP.z + 0.083], [LAMP.x + 0.004, FLOOR_LIE, LAMP.z + 0.105], [LAMP.x + 0.012, FLOOR_LIE, LAMP.z + 0.150],
    // Paul 2026-11-19: a casual cord, not a ruler line: a loose S across the floor (all points flat on it), a soft turn up at the wall and a slight drift on the way up.
    [LAMP.x + 0.030, FLOOR_LIE, 1.88], [LAMP.x + 0.004, FLOOR_LIE, 1.98], [LAMP.x - 0.022, FLOOR_LIE, 2.06], [LAMP.x + 0.006, FLOOR_LIE, 2.15], [LAMP.x + 0.036, FLOOR_LIE, 2.22],
    [-1.90, FLOOR_LIE, 2.27], [-1.90, FLOOR_LIE + 0.003, 2.312], [-1.90, 0.026, zw(0.0045)], [-1.904, 0.12, zw(0.0040)], [-1.898, 0.24, zw(0.0040)], [-1.90, yPb - 0.020, zw(0.0037)],
    [-1.90, yPb - 0.003, zw(0.010)], [-1.90, yPb + 0.009, nk.z], [nk.x, yEnd, nk.z],
  ].map((q) => new THREE.Vector3(...q)), false, "centripetal"); // centripetal: a plain Catmull-Rom dipped 8 mm below the floor where the cord turns from the pole to the floor
  const cordGeometry = new THREE.TubeGeometry(cordCurve, 128, OUTLET_CORD_R, 6, false);
  colourParts([[cordGeometry, 0x101112]], parts);
  const geometry = mergeGeometries(parts, false); parts.forEach((part) => part.dispose()); geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.02 }));
  mesh.name = "room03-wall-outlets"; mesh.castShadow = false; mesh.receiveShadow = true; scene.add(mesh);
  const mm = (v) => Number((v * 1000).toFixed(1));
  const info = () => {
    let lowest = Infinity;
    for (let i = 0; i <= 600; i++) { const q = cordCurve.getPoint(i / 600); if (q.z > LAMP.z + 0.08 && q.z < 2.30) lowest = Math.min(lowest, q.y - OUTLET_CORD_R); }
    const start = cordCurve.getPoint(0), end = cordCurve.getPoint(1);
    return {
      counter: { kind: "gfci", xM: -1.12, centreAboveCounterMm: mm(0.165), plateIntoTileMm: 0.5 },
      lamp: { centreAboveFloorMm: 360, startInsidePoleMm: mm(LAMP.poleR - Math.hypot(start.x - LAMP.x, start.z - LAMP.z)), lowestAboveFloorMm: mm(lowest),
        endAboveNeckBottomMm: mm(end.y - (nk.y - lampOut.neckLen / 2)), endInsideNeck: end.y > nk.y - lampOut.neckLen / 2 && end.y < nk.y + lampOut.neckLen / 2 && Math.abs(end.x - nk.x) < 0.0005 && Math.abs(end.z - nk.z) < 0.0005 },
      vertices: geometry.attributes.position.count,
    };
  };
  return { mesh, info };
}

function buildRoom03RecordPlayer(scene) {
  const C = { x: 2.77, z: 0.53, top: 0.815 }, parts = [];
  const footBoxes = [];
  const add = (geometry, color, into = parts) => {
    const tint = new THREE.Color(color), count = geometry.attributes.position.count;
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) tint.toArray(colors, i * 3);
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    into.push(geometry);
  };
  // Card I (2026-11-18): the platter (with the record, grooves, label and spindle) and the tonearm (tube and stylus) are their own two meshes so they can
  // turn and swing while the music plays; everything else stays in the one merged body. Both share the body's material.
  const platterParts = [], armParts = [];
  // Four feet begin 2.5 mm inside the oak top and run 7.5 mm into the wooden plinth.
  for (const dx of [-0.12, 0.12]) for (const dz of [-0.17, 0.17]) {
    const foot = new THREE.CylinderGeometry(0.011, 0.012, 0.025, 10).translate(C.x + dx, 0.825, C.z + dz);
    foot.computeBoundingBox(); footBoxes.push(foot.boundingBox.clone()); add(foot, 0x272b29);
  }
  const deck = new THREE.BoxGeometry(0.32, 0.028, 0.42).translate(C.x, 0.844, C.z);
  deck.computeBoundingBox(); const deckBox = deck.boundingBox.clone(); add(deck, 0x71523e);
  add(new THREE.BoxGeometry(0.314, 0.003, 0.414).translate(C.x, 0.8595, C.z), 0x9c7858);
  const platter = { x: C.x, y: 0.864, z: C.z - 0.055, radius: 0.138 };
  add(new THREE.CylinderGeometry(platter.radius, platter.radius, 0.006, 40).translate(platter.x, platter.y, platter.z), 0x34383a, platterParts);
  const vinyl = new THREE.CylinderGeometry(0.132, 0.132, 0.002, 40).translate(platter.x, 0.868, platter.z);
  vinyl.computeBoundingBox(); const vinylBox = vinyl.boundingBox.clone(); add(vinyl, 0x141817, platterParts);
  for (const r of [0.073, 0.095, 0.116]) add(new THREE.TorusGeometry(r, 0.0007, 3, 40).rotateX(Math.PI / 2).translate(platter.x, 0.8692, platter.z), 0x555a57, platterParts);
  add(new THREE.CylinderGeometry(0.025, 0.025, 0.001, 20).translate(platter.x, 0.8695, platter.z), 0xc5a778, platterParts);
  // One small dark print block on the label, off centre (no words): the record and its rings are round, so without it a turning record looks still.
  add(new THREE.BoxGeometry(0.014, 0.0004, 0.004).translate(platter.x + 0.011, 0.87, platter.z - 0.006), 0x6b4a2c, platterParts);
  add(new THREE.CylinderGeometry(0.003, 0.003, 0.011, 8).translate(platter.x, 0.875, platter.z), 0xc6c6bb, platterParts);
  const pivot = [C.x + 0.113, 0.881, C.z + 0.151], elbow = [C.x + 0.11, 0.889, C.z + 0.106], tip = [C.x + 0.072, 0.873, C.z + 0.022];
  add(new THREE.CylinderGeometry(0.012, 0.012, 0.024, 12).translate(pivot[0], 0.87, pivot[2]), 0x46494a);
  const armCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(...pivot), new THREE.Vector3(...elbow), new THREE.Vector3(...tip)]);
  add(new THREE.TubeGeometry(armCurve, 14, 0.003, 6, false), 0xc6c6bb, armParts);
  const stylus = new THREE.BoxGeometry(0.012, 0.01, 0.015).translate(tip[0], 0.874, tip[2]);
  stylus.computeBoundingBox(); const stylusBox = stylus.boundingBox.clone(); add(stylus, 0x363632, armParts);
  // The arm parks 30 degrees outwards (stylus 12 mm clear of the gold rim) on a slim rest post that stands 1 mm into the deck top and meets the tube's underside.
  const ARM = { play: 0, rest: -0.52, swingMs: 650 }, DECK_TOP = 0.861;
  const restAt = armCurve.getPoint(0.72), restOff = new THREE.Vector3(restAt.x - pivot[0], 0, restAt.z - pivot[2]).applyAxisAngle(new THREE.Vector3(0, 1, 0), ARM.rest);
  const restTop = restAt.y - 0.003 + 0.001, restBottom = DECK_TOP - 0.001;
  const restPost = new THREE.CylinderGeometry(0.0026, 0.0032, restTop - restBottom, 8).translate(pivot[0] + restOff.x, (restTop + restBottom) / 2, pivot[2] + restOff.z);
  restPost.computeBoundingBox(); const restBox = restPost.boundingBox.clone(); add(restPost, 0x2c302e);
  // Gold trim (Paul 2026-11-17: make the record player shine and stand out): a thin frame around the top edge, a pinstripe on the room-facing side,
  // a ring at the platter's rim and a cap on the tonearm pivot. One merged mesh with a warm metal material.
  const gold = [];
  const addGold = (geometry) => { gold.push(geometry); };
  const FRAME_Y = 0.8625;
  for (const sz of [-1, 1]) addGold(new THREE.BoxGeometry(0.318, 0.0026, 0.004).translate(C.x, FRAME_Y, C.z + sz * 0.205));
  for (const sx of [-1, 1]) addGold(new THREE.BoxGeometry(0.004, 0.0026, 0.406).translate(C.x + sx * 0.155, FRAME_Y, C.z));
  addGold(new THREE.BoxGeometry(0.0022, 0.0024, 0.37).translate(C.x - 0.1601, 0.8445, C.z)); // pinstripe on the side that faces the room
  addGold(new THREE.TorusGeometry(platter.radius + 0.0012, 0.0014, 6, 48).rotateX(Math.PI / 2).translate(platter.x, 0.8668, platter.z));
  addGold(new THREE.CylinderGeometry(0.0085, 0.0085, 0.0022, 16).translate(pivot[0], 0.8826, pivot[2]));
  const goldGeometry = mergeGeometries(gold, false);
  gold.forEach((part) => part.dispose()); goldGeometry.computeVertexNormals();
  const goldMesh = new THREE.Mesh(goldGeometry, new THREE.MeshStandardMaterial({ color: 0xe0b45a, metalness: 0.78, roughness: 0.28, emissive: 0x3a2808, emissiveIntensity: 0.4 }));
  goldMesh.name = "room03-credenza-record-player-gold"; goldMesh.userData.category = "credenza"; goldMesh.castShadow = false; goldMesh.receiveShadow = false; scene.add(goldMesh);
  const geometry = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose()); geometry.computeVertexNormals();
  const bodyMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.59, metalness: 0.08 });
  const mesh = new THREE.Mesh(geometry, bodyMaterial);
  mesh.name = "room03-credenza-record-player"; mesh.userData.category = "credenza";
  mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh);
  // Moving parts: geometry is moved so the mesh's own origin sits on its axis (platter centre, arm pivot), then the mesh is placed back there.
  const moving = (list, name, ox, oz) => {
    const g = mergeGeometries(list, false); list.forEach((part) => part.dispose()); g.translate(-ox, 0, -oz); g.computeVertexNormals();
    const m = new THREE.Mesh(g, bodyMaterial); m.name = name; m.userData.category = "credenza"; m.position.set(ox, 0, oz); m.castShadow = true; m.receiveShadow = true; scene.add(m); return m;
  };
  const platterMesh = moving(platterParts, "room03-record-platter", platter.x, platter.z);
  const armMesh = moving(armParts, "room03-record-tonearm", pivot[0], pivot[2]);
  armMesh.rotation.y = ARM.rest; // stopped: parked on the rest post
  const box = new THREE.Box3().setFromObject(mesh).union(new THREE.Box3().setFromObject(platterMesh)).union(new THREE.Box3().setFromObject(armMesh));
  // Card I, copied from Room 04's deck: while playing, the platter turns at 33 1/3 rpm and the arm swings onto the record in 650 ms; on stop it swings back and
  // the loop ends, so a stopped room draws nothing extra.
  const RPM33 = (33.333 / 60) * Math.PI * 2;
  const motion = { playing: false, arm: ARM.rest, from: ARM.rest, swingAt: 0, last: 0, loop: 0, render: null };
  const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const frame = (now) => {
    motion.loop = 0;
    const dt = Math.min(0.1, (now - (motion.last || now)) / 1000); motion.last = now;
    const k = Math.min(1, (now - motion.swingAt) / ARM.swingMs), e = k * k * (3 - 2 * k), target = motion.playing ? ARM.play : ARM.rest;
    motion.arm = motion.from + (target - motion.from) * e; armMesh.rotation.y = motion.arm;
    if (motion.playing && !reduced()) platterMesh.rotation.y -= RPM33 * dt;
    motion.render?.();
    if (motion.playing || k < 1) motion.loop = requestAnimationFrame(frame);
  };
  const setPlaying = (playing, render) => {
    motion.render = render ?? motion.render; playing = !!playing;
    if (playing === motion.playing) return;
    motion.playing = playing; motion.from = motion.arm; motion.swingAt = performance.now(); motion.last = 0;
    if (reduced()) { motion.arm = playing ? ARM.play : ARM.rest; armMesh.rotation.y = motion.arm; motion.render?.(); return; }
    if (!motion.loop) motion.loop = requestAnimationFrame(frame);
  };
  const stop = () => { if (motion.loop) cancelAnimationFrame(motion.loop); motion.loop = 0; };
  const motionInfo = () => {
    scene.updateMatrixWorld(true);
    const tipNow = new THREE.Vector3(tip[0] - pivot[0], 0, tip[2] - pivot[2]).applyAxisAngle(new THREE.Vector3(0, 1, 0), armMesh.rotation.y);
    const mm = (v) => Number((v * 1000).toFixed(1));
    return { playing: motion.playing, looping: !!motion.loop, armAngle: Number(armMesh.rotation.y.toFixed(4)), armRest: ARM.rest, armPlay: ARM.play, platterAngle: Number(platterMesh.rotation.y.toFixed(4)),
      stylusFromCentreMm: mm(Math.hypot(pivot[0] + tipNow.x - platter.x, pivot[2] + tipNow.z - platter.z)), vinylRadiusMm: 132, labelRadiusMm: 25, platterRadiusMm: 138,
      restIntoDeckMm: mm(DECK_TOP - restBox.min.y), restTopToTubeMm: mm(restAt.y - 0.003 - restBox.max.y) };
  };
  // Power cord (Paul 2026-11-18): a thin black cord leaves the back corner of the deck on the record-player-view side and lies on the oak top along the wall past
  // the red mug (so the record view sees it). Paul 2026-11-19: it used to vanish into a grommet in the plaster, which looked unnatural; the credenza stands 2 mm off the wall, too tight to drop a
  // cord behind it, so it now climbs the wall into the plug of a white American duplex outlet just above the top (US form with round receptacle faces, not Room 01's Taiwanese build; plug in the lower receptacle).
  // Cord, plate, receptacles and plug are one vertex-coloured mesh; the curve is sampled below so the tests can check it rests on the top and ends in the plug.
  const CORD_R = 0.0025, WALL = 2.94, lie = C.top + CORD_R + 0.0006;
  const cordCurve = new THREE.CatmullRomCurve3([
    [2.905, 0.838, 0.734], [2.905, 0.836, 0.748], [2.906, lie + 0.004, 0.762], [2.908, lie, 0.785], [2.914, lie, 0.83], [2.921, lie, 0.874],
    [2.930, lie + 0.0012, 0.888], [WALL - CORD_R - 0.0015, C.top + 0.030, 0.908], [WALL - CORD_R - 0.0012, C.top + 0.085, 0.915],
    [WALL - 0.0037, C.top + 0.088, 0.915], [WALL - 0.010, C.top + 0.105, 0.915], [WALL - 0.0165, C.top + 0.117, 0.915], [WALL - 0.0165, C.top + 0.1265, 0.915],
  ].map((p) => new THREE.Vector3(...p)));
  const cordParts = [];
  add(new THREE.TubeGeometry(cordCurve, 64, CORD_R, 6, false), 0x101112, cordParts);
  // The outlet is a US duplex (NEMA 5-15R), not Room 01's rectangular-faced Taiwanese build (Paul, 2026-11-19): a white single-gang plate 70 x 114 mm, 8 mm thick (0.5 mm into the plaster),
  // centre 165 mm above the top, behind the deck's far corner. Each receptacle is a ROUND raised boss (the classic US duplex face) with two parallel vertical flat slots, the neutral one on the
  // left and taller (9 mm against 7 mm), and a round ground hole below them; one plate screw with a slotted head sits between the two. Slots and holes stand 0.2 mm proud so nothing shares a
  // plane. A chunky black moulded plug sits in the lower receptacle, 1 mm into its face, with the cord leaving through a strain relief downwards; the upper receptacle is empty.
  const OUT = { y: C.top + 0.165, z: 0.915 };
  const outlet = usOutlet("duplex", { origin: [WALL, OUT.y, OUT.z], yaw: -Math.PI / 2 }, true);
  for (const [geometry, hex] of outlet.parts) add(geometry, hex, cordParts);
  const NECK = { x: outlet.neck.x, y: outlet.neck.y, len: outlet.neckLen };
  const cordGeometry = mergeGeometries(cordParts, false); cordParts.forEach((part) => part.dispose()); cordGeometry.computeVertexNormals();
  const cordMesh = new THREE.Mesh(cordGeometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.02 }));
  cordMesh.name = "room03-record-player-power-cord"; cordMesh.userData.category = "credenza"; cordMesh.castShadow = false; cordMesh.receiveShadow = true; scene.add(cordMesh);
  const cordInfo = () => {
    let lowest = Infinity, maxX = -Infinity;
    for (let i = 0; i <= 400; i++) {
      const p = cordCurve.getPoint(i / 400);
      if (p.z > deckBox.max.z + CORD_R && p.x < WALL - 0.004) lowest = Math.min(lowest, p.y - CORD_R - C.top);
      maxX = Math.max(maxX, p.x);
    }
    const mm = (v) => Number((v * 1000).toFixed(1));
    const end = cordCurve.getPoint(1);
    return { radiusMm: mm(CORD_R), lowestAboveTopMm: mm(lowest), endIntoWallMm: mm(maxX - WALL), plugIntoFaceMm: 1, plateIntoWallMm: 0.5,
      outletCentreAboveTopMm: mm(OUT.y - C.top), cordEndAboveNeckBottomMm: mm(end.y - (NECK.y - NECK.len / 2)), cordEndInsideNeck: end.y > NECK.y - NECK.len / 2 && end.y < NECK.y + NECK.len / 2 && Math.abs(end.x - NECK.x) < 0.0005 && Math.abs(end.z - OUT.z) < 0.0005,
      startInsideDeckMm: mm(deckBox.max.z - cordCurve.getPoint(0).z),
      clearOfDeckUnderside: cordCurve.getPoints(200).every((p) => p.z > deckBox.max.z || p.y - CORD_R >= deckBox.min.y - 0.0005), vertices: cordGeometry.attributes.position.count };
  };
  return { mesh, platterMesh, armMesh, cordMesh, setPlaying, stop, motionInfo, info: () => ({ dimensionsMm: [320, 42, 420], platterMm: 276, cord: cordInfo(),
    footIntoTopMm: Math.round((C.top - Math.max(...footBoxes.map((b) => b.min.y))) * 1000),
    footIntoPlinthMm: Math.round((Math.min(...footBoxes.map((b) => b.max.y)) - deckBox.min.y) * 1000),
    tonearmEndAboveVinylMm: Math.round((stylusBox.min.y - vinylBox.max.y) * 1000),
    bounds: { min: box.min.toArray(), max: box.max.toArray() }, vertices: geometry.attributes.position.count + platterMesh.geometry.attributes.position.count + armMesh.geometry.attributes.position.count + goldGeometry.attributes.position.count, goldVertices: goldGeometry.attributes.position.count, cordVertices: cordGeometry.attributes.position.count, motion: motionInfo() }) };
}

function buildDishDryer(scene, m) {
  const group = new THREE.Group();
  group.name = "dish-dryer";
  group.userData.category = "appliances";
  const CX = -1.55, CY = 1.78, DOOR_Z = -1.94, W = 0.96, H = 0.60, D = 0.035;
  const TOP = 0.075, BOTTOM = 0.028, SIDE = 0.04;
  const parts = [];
  // Vertex colour 0.9 for the body and 1.0 for the polished inner lip, so the frame has an edge highlight even without an environment map.
  const bar = (w, h, d, x, y, z, shade = 0.9) => {
    const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z);
    const colors = new Float32Array(g.attributes.position.count * 3).fill(shade);
    g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    parts.push(g);
  };
  bar(W, TOP, D, CX, CY + H / 2 - TOP / 2, DOOR_Z);
  bar(W, BOTTOM, D, CX, CY - H / 2 + BOTTOM / 2, DOOR_Z);
  const innerTop = CY + H / 2 - TOP, innerBottom = CY - H / 2 + BOTTOM, innerHeight = innerTop - innerBottom, innerY = (innerTop + innerBottom) / 2;
  for (const side of [-1, 1]) bar(SIDE, innerHeight, D, CX + side * (W / 2 - SIDE / 2), innerY, DOOR_Z);
  // three ribs across the top band, like the pull-down grille on the real unit
  for (const dy of [-0.012, 0, 0.012]) bar(W - 0.02, 0.0035, 0.004, CX, CY + H / 2 - TOP / 2 + dy, DOOR_Z + D / 2 + 0.0012);
  // Polished lip around the opening, 3 mm proud of the frame face.
  {
    const lipZ = DOOR_Z + D / 2 + 0.0016;
    bar(W - 2 * SIDE, 0.003, 0.003, CX, innerTop - 0.0015, lipZ, 1.0);
    bar(W - 2 * SIDE, 0.003, 0.003, CX, innerBottom + 0.0015, lipZ, 1.0);
    for (const side of [-1, 1]) bar(0.003, innerHeight, 0.003, CX + side * (W / 2 - SIDE - 0.0015), innerY, lipZ, 1.0);
  }
  const frameGeometry = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose());
  frameGeometry.computeVertexNormals();
  const steel = m.hoodSteel.clone(); steel.vertexColors = true; steel.color.set(0x8f9598); steel.metalness = 0.3; steel.roughness = 0.5; // cooler stainless than the beige-leaning hood steel
  const frame = new THREE.Mesh(frameGeometry, steel);
  frame.name = "dish-dryer-frame"; frame.userData.category = "appliances"; frame.castShadow = true; frame.receiveShadow = true;
  group.add(frame);

  // The painted face, 1024 x 578 for 0.88 x 0.497 m.
  const FW = W - 2 * SIDE, FH = innerHeight;
  const canvas = document.createElement("canvas");
  canvas.width = 1024; canvas.height = Math.round(1024 * FH / FW);
  const c = canvas.getContext("2d");
  const cw = canvas.width, ch = canvas.height;
  const glass = c.createLinearGradient(0, 0, cw, ch); glass.addColorStop(0, "#0b0e11"); glass.addColorStop(1, "#05070a");
  c.fillStyle = glass; c.fillRect(0, 0, cw, ch);
  // soft reflection streaks on the black glass
  c.fillStyle = "rgba(255,255,255,0.075)"; c.beginPath(); c.moveTo(0, ch * 0.55); c.lineTo(cw * 0.45, 0); c.lineTo(cw * 0.62, 0); c.lineTo(0, ch * 0.9); c.fill();
  c.fillStyle = "rgba(255,255,255,0.05)"; c.beginPath(); c.moveTo(cw * 0.5, ch); c.lineTo(cw, ch * 0.3); c.lineTo(cw, ch * 0.5); c.lineTo(cw * 0.75, ch); c.fill();
  // clear window with the UV tubes and a wire rack
  const wx = cw * 0.12, wy = ch * 0.07, ww = cw * 0.58, wh = ch * 0.86;
  const haze = c.createLinearGradient(0, wy, 0, wy + wh); haze.addColorStop(0, "#14333c"); haze.addColorStop(0.5, "#0b1c22"); haze.addColorStop(1, "#070e12");
  c.fillStyle = haze; c.fillRect(wx, wy, ww, wh);
  c.strokeStyle = "rgba(150,170,180,0.28)"; c.lineWidth = 2;
  for (let gx = wx + 14; gx < wx + ww; gx += 34) { c.beginPath(); c.moveTo(gx, wy + wh * 0.58); c.lineTo(gx - 10, wy + wh); c.stroke(); }
  for (let gy = wy + wh * 0.62; gy < wy + wh; gy += 36) { c.beginPath(); c.moveTo(wx, gy); c.lineTo(wx + ww, gy); c.stroke(); }
  for (const ty of [wy + wh * 0.20, wy + wh * 0.36]) {
    c.save(); c.shadowColor = "#1d8fb8"; c.shadowBlur = 60;
    const tube = c.createLinearGradient(0, ty - 14, 0, ty + 14); tube.addColorStop(0, "#1aa6d8"); tube.addColorStop(0.5, "#46b9dc"); tube.addColorStop(1, "#1aa6d8");
    c.fillStyle = tube; c.beginPath(); c.roundRect(wx + ww * 0.28, ty - 14, ww * 0.76, 28, 14); c.fill(); c.restore();
    c.strokeStyle = "rgba(210,240,250,0.35)"; c.lineWidth = 1.5;
    for (let sx = wx + ww * 0.34; sx < wx + ww; sx += 56) { c.beginPath(); c.moveTo(sx, ty - 14); c.lineTo(sx, ty + 14); c.stroke(); }
  }
  c.strokeStyle = "rgba(120,140,150,0.55)"; c.lineWidth = 3; c.strokeRect(wx, wy, ww, wh);
  // control column: clock, icons, status bar, buttons
  const px = cw * 0.80, pw = cw * 0.17;
  const SEGMENTS = { 0: "abcdef", 1: "bc", 2: "abdeg", 3: "abcdg", 4: "bcfg", 5: "acdfg", 6: "acdefg", 7: "abc", 8: "abcdefg", 9: "abcdfg" };
  const digit = (glyph, x, y, w, h, t) => {
    const rects = { a: [x + t, y, w - 2 * t, t], b: [x + w - t, y + t, t, h / 2 - t], c: [x + w - t, y + h / 2, t, h / 2 - t], d: [x + t, y + h - t, w - 2 * t, t], e: [x, y + h / 2, t, h / 2 - t], f: [x, y + t, t, h / 2 - t], g: [x + t, y + h / 2 - t / 2, w - 2 * t, t] };
    for (const [name, rect] of Object.entries(rects)) {
      const lit = SEGMENTS[glyph].includes(name);
      c.fillStyle = lit ? "#5b92ff" : "#0f1a33"; c.shadowColor = lit ? "#2f6bff" : "transparent"; c.shadowBlur = lit ? 12 : 0;
      c.fillRect(...rect);
    }
    c.shadowBlur = 0;
  };
  c.fillStyle = "#020306"; c.fillRect(px, ch * 0.08, pw, ch * 0.17);
  c.strokeStyle = "#1c2d55"; c.lineWidth = 2; c.strokeRect(px, ch * 0.08, pw, ch * 0.17);
  const dy0 = ch * 0.10, dh = ch * 0.13, dw = pw * 0.19;
  [["1", 0.05], ["7", 0.27], ["0", 0.55], ["9", 0.77]].forEach(([g, at]) => digit(g, px + pw * at, dy0, dw, dh, 7));
  c.fillStyle = "#5b92ff"; c.shadowColor = "#2f6bff"; c.shadowBlur = 10;
  for (const dy of [0.35, 0.65]) { c.beginPath(); c.arc(px + pw * 0.49, dy0 + dh * dy, 3.4, 0, Math.PI * 2); c.fill(); }
  c.shadowBlur = 0;
  for (const bx of [px + pw * 0.22, px + pw * 0.78]) {
    c.save(); c.shadowColor = "#ff9a1a"; c.shadowBlur = 10; c.fillStyle = "#ffa01c";
    c.beginPath(); c.ellipse(bx, ch * 0.335, 26, 14, 0, 0, Math.PI); c.fill();
    c.fillRect(bx - 22, ch * 0.325, 44, 5);
    c.restore();
  }
  c.save(); c.shadowColor = "#ff5a1a"; c.shadowBlur = 12;
  for (const [dy, color] of [[0.40, "#ff7a1a"], [0.425, "#e5322a"], [0.45, "#ff7a1a"]]) { c.fillStyle = color; c.fillRect(px + pw * 0.06, ch * dy, pw * 0.88, 5); }
  c.restore();
  const steelRing = (x, y, w, h) => {
    const g = c.createLinearGradient(x - w, y - h, x + w, y + h); g.addColorStop(0, "#e5e8ea"); g.addColorStop(0.5, "#7c8388"); g.addColorStop(1, "#cfd3d6");
    c.fillStyle = g; c.beginPath(); c.ellipse(x, y, w, h, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#0a0c0e"; c.beginPath(); c.ellipse(x, y, w * 0.8, h * 0.62, 0, 0, Math.PI * 2); c.fill();
  };
  [0.56, 0.65, 0.74, 0.83].forEach((dy) => steelRing(px + pw * 0.5, ch * dy, pw * 0.34, 12));
  const power = c.createRadialGradient(px + pw * 0.5 - 8, ch * 0.935 - 8, 3, px + pw * 0.5, ch * 0.935, pw * 0.2);
  power.addColorStop(0, "#f2f4f5"); power.addColorStop(1, "#6d7378");
  c.fillStyle = power; c.beginPath(); c.arc(px + pw * 0.5, ch * 0.935, pw * 0.19, 0, Math.PI * 2); c.fill();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4;
  const faceMaterial = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.14, metalness: 0.25, emissive: 0xffffff, emissiveMap: texture, emissiveIntensity: 0.3 });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(FW, FH), faceMaterial);
  face.name = "dish-dryer-face"; face.userData.category = "appliances";
  face.position.set(CX, innerY, DOOR_Z - 0.0065);
  face.castShadow = false; face.receiveShadow = true;
  group.add(face);
  scene.add(group);
  scene.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(group);
  return {
    group,
    info: () => ({
      widthMm: Number(((box.max.x - box.min.x) * 1000).toFixed(1)), heightMm: Number(((box.max.y - box.min.y) * 1000).toFixed(1)),
      centre: [CX, innerY], faceZ: DOOR_Z - 0.0065, carcassFrontZ: -1.95, faceRecessInFrameMm: Number((((DOOR_Z + D / 2) - (DOOR_Z - 0.0065)) * 1000).toFixed(1)),
      meshes: 2, vertices: frameGeometry.attributes.position.count + 4,
    }),
  };
}

function buildHouseholdProps(scene, m, onPropLoad) {
  const counterY = 0.955;
  // The counter top measures 0.958; the coffee maker, kettle and rice cooker were each 3 mm too low (4 mm embed) and are lifted 3 mm, as the crock was in #731.
  // A compact American grind-and-brew drip maker: sealed bean hopper, warm-white housing, brew outlet and glass carafe on a warming plate.
  let coffeeBeanCount = 0;
  const coffeeMaker = buildPropGroup(scene, "drip-coffee-maker", [-0.34, counterY + 0.002, -2.03], ({ box, shape }) => {
    box(m.porcelain, [0.28, 0.036, 0.36], [0, 0.018, 0]);
    box(m.porcelain, [0.22, 0.18, 0.15], [0, 0.125, -0.035]);
    box(m.porcelain, [0.26, 0.065, 0.16], [0, 0.245, -0.04]);
    box(m.black, [0.12, 0.018, 0.1], [0, 0.29, -0.04]);
    // Closed clear bean hopper on the rear half of the lid, with a visible bed of beans under its cap.
    const hopperProfile = [
      new THREE.Vector2(0.042, 0), new THREE.Vector2(0.050, 0.004), new THREE.Vector2(0.052, 0.012),
      new THREE.Vector2(0.052, 0.055), new THREE.Vector2(0.048, 0.064), new THREE.Vector2(0.041, 0.064),
      new THREE.Vector2(0.041, 0.055), new THREE.Vector2(0.041, 0.012), new THREE.Vector2(0.038, 0.006),
      new THREE.Vector2(0.042, 0),
    ];
    // Welded like the mug body: an unwelded lathe seam in this transparent double-sided shell drew a fine vertical
    // line straight through the middle of the bean pile from the front view.
    shape(weldSmooth(new THREE.LatheGeometry(hopperProfile, 32)), m.glass, [0, 0.302, -0.04]);
    shape(new THREE.CylinderGeometry(0.054, 0.054, 0.010, 18), m.black, [0, 0.370, -0.04]);
    // A half-full hopper (Paul 2026-11-04). Paul's two complaints, in order: packed to the lid it read as one muddy
    // mass; with a solid core behind them it read as a dark slug. So the beans now STOP at about half the cavity
    // height and each one is a separate pill about 9 mm across, spaced with a clear gap so the silhouette between
    // them is visible. Nothing solid is drawn inside the bed: the only opaque part is a thin floor disc at the
    // bottom, which keeps the tiled wall from showing through the hopper floor.
    const beanNoise = (index, salt) => {
      const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
      return value - Math.floor(value);
    };
    let beanSeed = 0;
    const beanRows = [
      [0.3196, [[0, 1], [0.0072, 5], [0.0146, 8], [0.0220, 11], [0.0296, 14]]],
      [0.3230, [[0, 1], [0.0072, 5], [0.0146, 8], [0.0220, 11], [0.0296, 14]]],
      [0.3264, [[0, 1], [0.0072, 5], [0.0148, 8], [0.0220, 11], [0.0292, 13]]],
      [0.3298, [[0, 1], [0.0074, 5], [0.0148, 8], [0.0216, 10]]],
      [0.3332, [[0, 1], [0.0076, 4], [0.0148, 7], [0.0212, 9]]],
      [0.3364, [[0, 1], [0.0080, 4], [0.0156, 6]]],
      [0.3392, [[0, 1], [0.0086, 4]]],
    ];
    for (const [rowY, rings] of beanRows) {
      for (const [ringRadius, count] of rings) {
        for (let i = 0; i < count; i++) {
          const spread = ringRadius === 0 ? 0 : Math.min(0.0330, ringRadius + (beanNoise(beanSeed, 1) - 0.5) * 0.0012);
          const angle = (i / count + (beanSeed % 2) / (count * 2)) * Math.PI * 2 + (beanNoise(beanSeed, 2) - 0.5) * 0.26;
          const lift = (beanNoise(beanSeed, 3) - 0.5) * 0.0014;
          const size = 0.0040 + beanNoise(beanSeed, 4) * 0.0009;
          shape(new THREE.SphereGeometry(size, 7, 5), beanNoise(beanSeed, 5) < 0.34 ? m.coffee : m.coffeeBeanLight,
            [Math.cos(angle) * spread, rowY + lift, Math.sin(angle) * spread - 0.04],
            [(beanNoise(beanSeed, 6) - 0.5) * 1.2, angle, (beanNoise(beanSeed, 7) - 0.5) * 1.2], [1.05, 0.82, 0.92]);
          beanSeed++;
          coffeeBeanCount++;
        }
      }
    }
    shape(new THREE.CylinderGeometry(0.0405, 0.0405, 0.0030, 18), m.coffee, [0, 0.3180, -0.04]);
    const carafeProfile = [
      new THREE.Vector2(0.050, 0.008), new THREE.Vector2(0.058, 0.008),
      new THREE.Vector2(0.060, 0.016), new THREE.Vector2(0.060, 0.092),
      new THREE.Vector2(0.055, 0.108), new THREE.Vector2(0.046, 0.118),
      new THREE.Vector2(0.041, 0.125), new THREE.Vector2(0.036, 0.125),
      new THREE.Vector2(0.036, 0.118), new THREE.Vector2(0.041, 0.111),
      new THREE.Vector2(0.049, 0.101), new THREE.Vector2(0.050, 0.020),
      new THREE.Vector2(0, 0.020),
    ];
    shape(new THREE.LatheGeometry(carafeProfile, 20), m.glass, [0, 0.030, 0.110]);
    shape(new THREE.CylinderGeometry(0.055, 0.052, 0.034, 12), m.coffee, [0, 0.057, 0.110]);
    // A square strap handle on two studs instead of the black ring that read like a water-dispenser dial (Paul 2026-10-29).
    box(m.black, [0.014, 0.072, 0.012], [0.080, 0.074, 0.110]);
    box(m.black, [0.026, 0.012, 0.012], [0.069, 0.108, 0.110]);
    box(m.black, [0.026, 0.012, 0.012], [0.069, 0.040, 0.110]);
    // A dark lid sits on the carafe mouth, with a short pour lip.
    shape(new THREE.CylinderGeometry(0.042, 0.040, 0.009, 20), m.black, [0, 0.160, 0.110]);
    box(m.black, [0.035, 0.008, 0.022], [0, 0.160, 0.070]);
  });
  // The bean pile sits inside the hopper, under the black lid, so the shadow map was dropping the lid's shadow
  // straight onto the beans and turning the whole bed into one dark block (Paul 2026-11-04). Beans are small enough
  // that self-shadowing only muddies them, so they keep their own colour and cast nothing.
  coffeeMaker.traverse((child) => {
    if (!child.isMesh) return;
    if (child.material === m.coffee || child.material === m.coffeeBeanLight) {
      child.castShadow = false;
      child.receiveShadow = false;
    }
  });
  coffeeMaker.userData.brewer = { style: "grind-and-brew drip", hopperLid: "closed", hopperDiameterMm: 108, hopperHeightMm: 73, beansVisible: coffeeBeanCount, carafeDiameterMm: 120, carafeHeightMm: 125, carafeSupportGapMm: 2, carafeRimClearanceToUpperHousingMm: 57 };

  // Seven-segment temperature readout on the brewer's front panel (92 degrees C), drawn on a small canvas: amber digits that glow, unlit segments faint.
  {
    const canvas = document.createElement("canvas");
    canvas.width = 176; canvas.height = 64;
    const context = canvas.getContext("2d");
    context.fillStyle = "#130c07"; context.fillRect(0, 0, 176, 64);
    const SEGMENTS = { 9: "abcdfg", 2: "abdeg", C: "adef" };
    const drawDigit = (glyph, x, y, w, h, t) => {
      const rects = {
        a: [x + t, y, w - 2 * t, t], b: [x + w - t, y + t, t, h / 2 - t], c: [x + w - t, y + h / 2, t, h / 2 - t],
        d: [x + t, y + h - t, w - 2 * t, t], e: [x, y + h / 2, t, h / 2 - t], f: [x, y + t, t, h / 2 - t], g: [x + t, y + h / 2 - t / 2, w - 2 * t, t],
      };
      for (const [name, rect] of Object.entries(rects)) {
        const lit = SEGMENTS[glyph].includes(name);
        context.fillStyle = lit ? "#ffb04a" : "#2b1a0c";
        context.shadowColor = lit ? "#ff9a2e" : "transparent"; context.shadowBlur = lit ? 7 : 0;
        context.fillRect(...rect);
      }
    };
    drawDigit("9", 14, 10, 34, 44, 6); drawDigit("2", 58, 10, 34, 44, 6);
    context.shadowColor = "#ff9a2e"; context.shadowBlur = 7; context.strokeStyle = "#ffb04a"; context.lineWidth = 4; context.strokeRect(103, 12, 11, 11);
    drawDigit("C", 124, 10, 34, 44, 6);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const display = new THREE.Mesh(new THREE.PlaneGeometry(0.066, 0.024), new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }));
    display.name = "prop-coffee-maker-temperature-display";
    display.userData.category = "household-props";
    display.position.set(-0.34, counterY - 0.001 + 0.246, -2.03 + 0.0405);
    display.castShadow = false; display.receiveShadow = false;
    scene.add(display);
  }

  // One ordinary electric kettle beside the sink, scaled like a 25 cm counter appliance.
  const kettle = buildPropGroup(scene, "electric-kettle", [-0.76, counterY - 0.008, -2.04], ({ shape }) => {
    const profile = [
      new THREE.Vector2(0, 0.01), new THREE.Vector2(0.066, 0.01), new THREE.Vector2(0.091, 0.022),
      new THREE.Vector2(0.104, 0.05), new THREE.Vector2(0.108, 0.12), new THREE.Vector2(0.105, 0.145),
      new THREE.Vector2(0.096, 0.165), new THREE.Vector2(0.078, 0.187), new THREE.Vector2(0.066, 0.195),
      new THREE.Vector2(0, 0.195),
    ];
    shape(new THREE.LatheGeometry(profile, 24), m.porcelain, [0, 0, 0]);
    shape(new THREE.TorusGeometry(0.074, 0.003, 5, 24), m.steel, [0, 0.197, 0], [Math.PI / 2, 0, 0]);
    shape(new THREE.TorusGeometry(0.106, 0.0022, 5, 24), m.steel, [0, 0.132, 0], [Math.PI / 2, 0, 0]);
    shape(new THREE.TorusGeometry(0.074, 0.003, 5, 20), m.black, [0, 0.013, 0], [Math.PI / 2, 0, 0]);
    shape(new THREE.CylinderGeometry(0.08, 0.08, 0.018, 20), m.black, [0, 0.207, 0]);
    shape(new THREE.TorusGeometry(0.018, 0.002, 4, 16), m.steel, [0, 0.216, 0], [Math.PI / 2, 0, 0]);
    shape(new THREE.CylinderGeometry(0.006, 0.006, 0.008, 10), m.steel, [0, 0.216, 0]);
    shape(new THREE.SphereGeometry(0.021, 12, 8), m.porcelain, [0, 0.228, 0]);
    shape(new THREE.TorusGeometry(0.068, 0.010, 7, 18), m.black, [-0.112, 0.14, -0.015]);
    const spoutPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.09, 0.125, -0.012), new THREE.Vector3(0.122, 0.138, -0.012),
      new THREE.Vector3(0.151, 0.17, -0.012), new THREE.Vector3(0.174, 0.198, -0.012),
    ]);
    shape(new THREE.TubeGeometry(spoutPath, 14, 0.013, 8, false), m.porcelain);
    shape(new THREE.SphereGeometry(0.006, 8, 6), m.black, [0.174, 0.198, -0.012]);
  });
  kettle.scale.x = 0.75;

  // Plain rice cooker: plausible for the household, but prevalence remains an inference.
  const riceCooker = buildPropGroup(scene, "rice-cooker", [-1.92, counterY - 0.001, -2.03], ({ box, shape }) => {
    const cookerProfile = [
      new THREE.Vector2(0, 0.003), new THREE.Vector2(0.093, 0.003),
      new THREE.Vector2(0.112, 0.012), new THREE.Vector2(0.124, 0.034),
      new THREE.Vector2(0.130, 0.062), new THREE.Vector2(0.130, 0.142),
      new THREE.Vector2(0.126, 0.163), new THREE.Vector2(0.117, 0.178),
      new THREE.Vector2(0, 0.178),
    ];
    shape(new THREE.LatheGeometry(cookerProfile, 24), m.porcelain);
    shape(new THREE.TorusGeometry(0.123, 0.004, 5, 20), m.steel, [0, 0.179, 0], [Math.PI / 2, 0, 0]);
    shape(new THREE.CylinderGeometry(0.119, 0.119, 0.014, 20), m.steel, [0, 0.184, 0]);
    shape(new THREE.SphereGeometry(0.021, 10, 7), m.porcelain, [0, 0.203, -0.01]);
    for (const side of [-1, 1]) {
      const handlePath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.118, 0.145, -0.004), new THREE.Vector3(side * 0.158, 0.145, -0.004),
        new THREE.Vector3(side * 0.164, 0.128, -0.004), new THREE.Vector3(side * 0.16, 0.105, -0.004),
        new THREE.Vector3(side * 0.12, 0.105, -0.004),
      ]);
      shape(new THREE.TubeGeometry(handlePath, 12, 0.008, 6, false), m.black);
    }
    box(m.black, [0.046, 0.04, 0.018], [0, 0.105, 0.115]);
    // One slim status light on the panel (it had two dashes and a dot that read as a face).
    box(m.olive, [0.028, 0.006, 0.004], [0, 0.112, 0.125]);
  });

  // 2026-11-04: seated 3 mm higher (was counterY - 0.003): the counter top under it measures 956 mm, so the crock was sunk 4 mm instead of the 1-3 mm the fit spec wants.
  // A turned oak utensil crock with a rolled lip, a real hollow, and three
  // softly splayed spoons. The low radial segment count keeps it lightweight.
  const utensilCrock = buildPropGroup(scene, "oak-utensil-crock", [-1.72, counterY, -1.73], ({ shape }) => {
    const crockProfile = [
      new THREE.Vector2(0.052, 0.002), new THREE.Vector2(0.056, 0.004),
      new THREE.Vector2(0.059, 0.012), new THREE.Vector2(0.060, 0.022),
      new THREE.Vector2(0.060, 0.130), new THREE.Vector2(0.059, 0.140),
      new THREE.Vector2(0.056, 0.146), new THREE.Vector2(0.052, 0.148),
      new THREE.Vector2(0.049, 0.145), new THREE.Vector2(0.048, 0.139),
      new THREE.Vector2(0.048, 0.026), new THREE.Vector2(0.044, 0.019),
      new THREE.Vector2(0, 0.018),
    ];
    shape(new THREE.LatheGeometry(crockProfile, 20), m.oak);
    shape(new THREE.TorusGeometry(0.054, 0.003, 5, 20), m.oak, [0, 0.145, 0], [Math.PI / 2, 0, 0]);

    const makeSpoonBowl = () => {
      const radialSegments = 10, rings = [0.34, 0.68, 1];
      const positions = [[0, -0.004, 0]];
      for (const r of rings) for (let i = 0; i < radialSegments; i++) {
        const angle = i * Math.PI * 2 / radialSegments;
        positions.push([Math.cos(angle) * 0.018 * r, -0.004 * (1 - r * r), Math.sin(angle) * 0.028 * r]);
      }
      const indices = [];
      for (let i = 0; i < radialSegments; i++) indices.push(0, 1 + i, 1 + ((i + 1) % radialSegments));
      for (let ring = 0; ring < rings.length - 1; ring++) {
        const a = 1 + ring * radialSegments, b = a + radialSegments;
        for (let i = 0; i < radialSegments; i++) {
          const next = (i + 1) % radialSegments;
          indices.push(a + i, b + i, a + next, a + next, b + i, b + next);
        }
      }
      const bowl = new THREE.BufferGeometry();
      bowl.setAttribute("position", new THREE.Float32BufferAttribute(positions.flat(), 3));
      bowl.setAttribute("uv", new THREE.Float32BufferAttribute(positions.flatMap(([x, , z]) => [x / 0.036 + 0.5, z / 0.056 + 0.5]), 2));
      bowl.setIndex(indices); bowl.computeVertexNormals();
      return bowl;
    };
    const spoonAngles = [
      { x: -0.022, z: 0.004, tilt: -0.13, yaw: -0.38, height: 0.215 },
      { x: 0.006, z: -0.012, tilt: 0.08, yaw: 0.22, height: 0.229 },
      { x: 0.022, z: 0.008, tilt: 0.16, yaw: 0.58, height: 0.204 },
    ];
    for (const spoon of spoonAngles) {
      const handleLength = spoon.height - 0.024;
      shape(new THREE.CylinderGeometry(0.0048, 0.0062, handleLength, 8), m.oak,
        [spoon.x, 0.018 + handleLength / 2, spoon.z], [spoon.tilt, 0, spoon.yaw]);
      shape(makeSpoonBowl(), m.oak,
        [spoon.x + Math.sin(spoon.tilt) * handleLength * 0.46, spoon.height, spoon.z], [0, spoon.yaw, 0]);
    }
  });

  // Clear pantry jar with a warm oat fill. Glass is a separate depth-write-off
  // shell, rendered after the opaque grain and oak lid to keep sorting stable.
  const pantryJar = buildPropGroup(scene, "glass-pantry-jar", [-0.58, counterY, -1.82], ({ shape }) => {
    const jarProfile = [
      new THREE.Vector2(0.052, 0.002), new THREE.Vector2(0.057, 0.006),
      new THREE.Vector2(0.060, 0.014), new THREE.Vector2(0.060, 0.132),
      new THREE.Vector2(0.059, 0.144), new THREE.Vector2(0.056, 0.151),
      new THREE.Vector2(0.052, 0.151), new THREE.Vector2(0.050, 0.146),
      new THREE.Vector2(0.050, 0.019), new THREE.Vector2(0.045, 0.015),
      new THREE.Vector2(0, 0.015),
    ];
    shape(new THREE.LatheGeometry(jarProfile, 20), m.glass);
    const grainProfile = [
      new THREE.Vector2(0, 0.022), new THREE.Vector2(0.038, 0.022),
      new THREE.Vector2(0.047, 0.028), new THREE.Vector2(0.048, 0.075),
      new THREE.Vector2(0.044, 0.082), new THREE.Vector2(0.032, 0.087),
      new THREE.Vector2(0.018, 0.09), new THREE.Vector2(0, 0.091),
    ];
    shape(new THREE.LatheGeometry(grainProfile, 16), m.oak);
    shape(new THREE.CylinderGeometry(0.062, 0.061, 0.029, 20), m.oak, [0, 0.1665, 0]);
    shape(new THREE.TorusGeometry(0.060, 0.0025, 5, 20), m.oak, [0, 0.151, 0], [Math.PI / 2, 0, 0]);
  });
  // Two unbranded 1.5 L-style mineral water bottles beside the takeaway cups.
  // Approx. 90 mm wide and 310 mm tall, with water below the shoulders.
  // Paul 2026-11-04: more real, Evian-style PET bottles (no brand text): a slim body with soft grip ribs, a long tapered shoulder, a neck ring
  // and a ridged cap; water fills to the shoulder and a blank label band wraps the middle. Placed as a loose pair, not a row: one a little
  // forward and turned, one set back, at uneven spacing.
  const bottleSpots = [[-1.93, -0.55, -0.7, 0.001]]; // Paul 2026-11-21: the water bottle stands on the floor beside the window lounge chair (whoever sits there may want a drink), which frees the credenza top // Paul 2026-11-21: one bottle is enough, which leaves room for kitchen things (it was a pair)
  const waterBottles = bottleSpots.map(([bx, z, yaw, baseY = 0.814], index) => {
    const bottleGroup = buildPropGroup(scene, "mineral-water-bottle-" + (index + 1), [bx, baseY, z], ({ shape }) => {
      const profile = [[0, 0.001], [0.030, 0.001], [0.038, 0.004], [0.0415, 0.012], [0.042, 0.030], [0.0395, 0.040], [0.042, 0.050], [0.042, 0.150], [0.0395, 0.160], [0.042, 0.170],
        [0.042, 0.196], [0.039, 0.214], [0.031, 0.236], [0.022, 0.256], [0.0165, 0.272], [0.0155, 0.280], [0.018, 0.283], [0.018, 0.286], [0.0155, 0.288], [0, 0.288]]
        .map(([radius, y]) => new THREE.Vector2(radius, y));
      shape(new THREE.LatheGeometry(profile, 28), m.waterBottleGlass, [0, 0, 0], [0, yaw, 0]);
      const fill = [[0, 0.004], [0.039, 0.006], [0.039, 0.194], [0.036, 0.212], [0, 0.212]].map(([radius, y]) => new THREE.Vector2(radius, y));
      shape(new THREE.LatheGeometry(fill, 24), m.bottleWater);
      shape(new THREE.CircleGeometry(0.0375, 24).rotateX(-Math.PI / 2), m.bottleWaterTop, [0, 0.2125, 0]); // the water surface
      shape(new THREE.CylinderGeometry(0.0425, 0.0425, 0.062, 28, 1, true), m.waterLabel, [0, 0.105, 0], [0, yaw, 0]);
      // Ridged screw cap: 28 flutes on the side.
      const cap = new THREE.CylinderGeometry(0.0175, 0.0175, 0.022, 56, 1);
      const cp = cap.attributes.position;
      for (let i = 0; i < cp.count; i++) {
        const x = cp.getX(i), zz = cp.getZ(i), r = Math.hypot(x, zz);
        if (r > 0.017) { const k = (Math.round(Math.atan2(zz, x) / (Math.PI / 28)) % 2 ? 0.93 : 1); cp.setX(i, x * k); cp.setZ(i, zz * k); }
      }
      shape(cap, m.porcelain, [0, 0.299, 0]);
    });
    return bottleGroup;
  });
  // One opaque ceramic mug, using Room 01's hollow body and embedded handle. Paul 2026-11-04: two mugs side by
  // side read as one shape split by a seam, so there is now a single glazed brick-red mug, turned so its handle
  // faces away from the brewer and its rim catches the window light.
  const counterMugs = buildPropGroup(scene, "counter-mugs", [...RED_MUG_SHIFT], ({ shape }) => {
    // One clean hollow body: the old inherited profile climbed the outside, crossed over the rim and then ran
    // back DOWN at a LARGER radius than the outer wall, so the two walls intersected and the lathe drew thin
    // vertical slivers on both sides of the mug (Paul 2026-11-04). This profile goes up the outside, over a
    // rounded rim, down the inside and across the floor, and never turns back on itself.
    const profile = [[0, 0], [.0330, 0], [.0375, .0035], [.0400, .008], [.0400, .0900], [.0392, .0944], [.0376, .0952], [.0356, .0948], [.0342, .0900], [.0342, .0140], [.0320, .0110], [0, .0110]]
      .map(([radius, y]) => new THREE.Vector2(radius, y));
    const x = -0.30, z = -1.752, yaw = -0.62;
    // Paul 2026-11-17: black coffee in the mug. The inner wall is 34.2 mm in radius; the surface sits 15 mm under the 95 mm rim.
    shape(new THREE.CircleGeometry(0.0338, 40).rotateX(-Math.PI / 2), m.mugCoffee, [x, 0.954 + 0.080, z]);
    // Weld the lathe's duplicated seam vertices first: buildPropGroup recomputes normals on the merged geometry, and
    // an unwelded seam leaves two coincident vertices with different normals, which drew a hard vertical line down
    // the mug from every angle (Paul 2026-11-04). 48 segments keeps the silhouette round up close.
    shape(weldSmooth(new THREE.LatheGeometry(profile, 48)), m.mugGlaze, [x, 0.954, z]);
    // The handle is a half loop whose two open ends would otherwise show as razor-thin slivers where they meet the
    // wall, so each end lands exactly on the outer surface (r 0.040) and is capped by a rounded pad of the same
    // radius, the way a real mug handle is joined. No angle then catches an unswept edge.
    // The handle is one smooth half loop whose two ends finish INSIDE the 40 mm wall, so the tube never meets the
    // wall at a grazing angle and never leaves an open mouth on show. Each buried end is closed by a small cap
    // sphere that stays hidden in the glaze-thick wall, which is how a pulled handle actually meets a mug. Earlier
    // versions ended the tube exactly on the surface and left a bright splinter at each joint (Paul 2026-11-04).
    const tubeRadius = 0.0052;
    const loop = 0.0365;
    const dirX = Math.cos(yaw), dirZ = -Math.sin(yaw);
    const handle = new THREE.TorusGeometry(0.0255, tubeRadius, 12, 32, Math.PI);
    handle.rotateZ(-Math.PI / 2); // the half loop bulges toward +x before it is turned
    handle.rotateY(yaw);
    handle.translate(x + dirX * loop, 1.005, z + dirZ * loop);
    shape(weldSmooth(handle), m.mugGlaze);
    for (const side of [-1, 1]) {
      const cap = new THREE.SphereGeometry(tubeRadius, 10, 8);
      cap.translate(x + dirX * loop, 1.005 + side * 0.0255, z + dirZ * loop);
      shape(weldSmooth(cap), m.mugGlaze);
    }
  });
  // A 30-40 mm-tall glaze surface picks up shadow-map acne that reads as flat facets, so the mug only casts.
  counterMugs.traverse((child) => { if (child.isMesh) child.receiveShadow = false; });
  counterMugs.userData.mugCount = 1;
  // Paul 2026-11-17: the red mug gets a little gold. A thin gilded ring on the rim and a thin band near the foot, and on the side that faces the room a small
  // gold Golden Gate Bridge (two towers, the main cable and its hangers, the deck and a few lines of water), a band round the side that faces the room, drawn in
  // code on a canvas, no download. (Paul 2026-11-17: the first design, a round flower medallion, read a little Japanese, like a family crest; the bridge says Bay Area.)
  {
    const MX = -0.30 + RED_MUG_SHIFT[0], MY = 0.954 + RED_MUG_SHIFT[1], MZ = -1.752 + RED_MUG_SHIFT[2];
    const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xe0b45a, metalness: 0.78, roughness: 0.28, emissive: 0x3a2808, emissiveIntensity: 0.4 });
    const rim = new THREE.TorusGeometry(0.0374, 0.0016, 8, 56).rotateX(Math.PI / 2).translate(MX, MY + 0.0948, MZ);
    const foot = new THREE.TorusGeometry(0.0403, 0.0011, 8, 56).rotateX(Math.PI / 2).translate(MX, MY + 0.016, MZ);
    const goldRings = new THREE.Mesh(mergeGeometries([rim, foot], false), goldMaterial);
    goldRings.name = "room03-red-mug-gold"; goldRings.userData.category = "credenza"; goldRings.castShadow = false; goldRings.receiveShadow = false;
    scene.add(goldRings);
    const canvas = document.createElement("canvas"); canvas.width = 512; canvas.height = 224;
    const g = canvas.getContext("2d");
    const gradient = g.createLinearGradient(0, 0, 512, 224);
    gradient.addColorStop(0, "#f7e19a"); gradient.addColorStop(0.5, "#c9962f"); gradient.addColorStop(1, "#f1d98e");
    g.clearRect(0, 0, 512, 224);
    const DECK = 138, TOWER_X = [148, 364], TOP = 22, LEFT = 18, RIGHT = 494;
    const cable = (p0, p1, p2) => (t) => [(1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0], (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]];
    const spans = [cable([LEFT, DECK - 8], [(LEFT + TOWER_X[0]) / 2 - 8, 66], [TOWER_X[0], TOP + 6]), cable([TOWER_X[0], TOP + 6], [(TOWER_X[0] + TOWER_X[1]) / 2, 128], [TOWER_X[1], TOP + 6]), cable([TOWER_X[1], TOP + 6], [(TOWER_X[1] + RIGHT) / 2 + 8, 66], [RIGHT, DECK - 8])];
    const draw = (width, style) => { // a dark thin underlay first, then the gold on top, so the lines read on the red glaze
      g.strokeStyle = style; g.fillStyle = style; g.lineCap = "round"; g.lineJoin = "round";
      g.lineWidth = width; g.beginPath(); g.moveTo(LEFT - 6, DECK); g.lineTo(RIGHT + 6, DECK); g.stroke(); // the deck
      g.lineWidth = width * 0.55; g.beginPath(); g.moveTo(LEFT - 6, DECK + 7); g.lineTo(RIGHT + 6, DECK + 7); g.stroke(); // its lower edge
      for (const x of TOWER_X) { // Art Deco towers: two legs, three struts, a stepped cap
        for (const dx of [-11, 11]) { g.lineWidth = width * 1.5; g.beginPath(); g.moveTo(x + dx, DECK); g.lineTo(x + dx, TOP + 4); g.stroke(); }
        g.lineWidth = width * 0.8; for (const y of [50, 82, 112]) { g.beginPath(); g.moveTo(x - 11, y); g.lineTo(x + 11, y); g.stroke(); }
        g.lineWidth = width * 1.1; g.beginPath(); g.moveTo(x - 14, TOP + 4); g.lineTo(x + 14, TOP + 4); g.stroke(); g.beginPath(); g.moveTo(x - 8, TOP - 4); g.lineTo(x + 8, TOP - 4); g.stroke();
      }
      g.lineWidth = width * 0.9; for (const f of spans) { g.beginPath(); for (let i = 0; i <= 24; i++) { const [x, y] = f(i / 24); if (i) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke(); } // the cables
      g.lineWidth = width * 0.4; // the hangers, from the cable down to the deck
      for (const f of spans) for (let i = 1; i < 14; i++) { const [x, y] = f(i / 14); if (x > TOWER_X[0] - 12 && x < TOWER_X[0] + 12 || x > TOWER_X[1] - 12 && x < TOWER_X[1] + 12) continue; g.beginPath(); g.moveTo(x, y); g.lineTo(x, DECK); g.stroke(); }
      g.lineWidth = width * 0.7; for (const [y, half] of [[166, 190], [182, 140], [198, 90]]) { g.beginPath(); g.moveTo(256 - half, y); g.lineTo(256 + half, y); g.stroke(); } // water
    };
    draw(9, "#5a3a0a"); draw(5.5, gradient);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8;
    const arc = 1.7, facing = -1.3; // radians around the mug; the band is centred on the side that faces into the room, away from the handle
    const medallion = new THREE.Mesh(new THREE.CylinderGeometry(0.0403, 0.0403, 0.03, 48, 1, true, facing - arc / 2, arc),
      new THREE.MeshStandardMaterial({ map: texture, transparent: true, roughness: 0.4, metalness: 0.25, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    medallion.name = "room03-red-mug-medallion"; medallion.position.set(MX, MY + 0.049, MZ); medallion.userData.category = "credenza";
    scene.add(medallion);
  }
  // Paul 2026-11-22: the dish with three grey stones beside the bread is replaced by a bowl of popcorn, Room 01's bowl copied across (Codex's model, shared file) and re-glazed a soft blue.
  // The bowl is loaded once and recoloured by material name; the group exists from the start so the prop list and the clearance checks find it, and its measured bounds update when the model arrives.
  const stoneDish = new THREE.Group();
  stoneDish.name = "prop-counter-popcorn-bowl"; stoneDish.position.set(-0.30, counterY + 0.0005, -1.752); stoneDish.scale.setScalar(0.7);
  stoneDish.userData.category = "household-props"; stoneDish.userData.propKey = "counter-popcorn-bowl";
  scene.add(stoneDish);
  new GLTFLoader().loadAsync(new URL("../models/room01-popcorn-bowl-v2.glb", import.meta.url).href).then((asset) => {
    const glaze = { bowl: "#5a84b4", rim: "#ece2cb", popcorn: "#f3e7c6", butter: "#efd9a0", husk: "#6b4a2b" };
    asset.scene.traverse((o) => { if (!o.isMesh) return; o.castShadow = true; o.receiveShadow = true; o.userData.category = "household-props"; const c = glaze[o.material.name]; if (c) { o.material = o.material.clone(); o.material.color.set(c); o.material.vertexColors = false; } });
    stoneDish.add(asset.scene); stoneDish.userData.ready = true;
    stoneDish.updateMatrixWorld(true);
    { const first = new THREE.Box3().setFromObject(stoneDish); const k = stoneDish.scale.x; asset.scene.position.x -= ((first.min.x + first.max.x) / 2 - stoneDish.position.x) / k; asset.scene.position.z -= ((first.min.z + first.max.z) / 2 - stoneDish.position.z) / k; stoneDish.updateMatrixWorld(true); } // centre the heap and bowl on the spot (the popcorn leans to one side of the bowl)
    const box = new THREE.Box3().setFromObject(stoneDish);
    stoneDish.userData.qaBounds = { min: box.min.toArray(), max: box.max.toArray(), size: box.getSize(new THREE.Vector3()).toArray() };
    onPropLoad?.();
  }).catch(() => {});
  // Empty turned wooden serving bowl, on the free end of the wok counter.
  // The 220 mm rim stays clear of the 480 mm cooktop and the counter edges.
  const wokServingBowl = buildPropGroup(scene, "wok-wood-serving-bowl", [2.64, 0.954, 2.14], ({ shape }) => {
    const profile = [[0,0],[0.048,0],[0.072,0.008],[0.100,0.055],[0.110,0.082],[0.104,0.085],[0.095,0.063],[0.064,0.015],[0,0.012]]
      .map(([radius, y]) => new THREE.Vector2(radius, y));
    shape(new THREE.LatheGeometry(profile, 28), m.oak);
  });
  const saucepan = buildPropGroup(scene, "steel-saucepan", [0.53, 0.9965, -2.18], ({ shape }) => {
    const panProfile = [
      new THREE.Vector2(0.072, 0), new THREE.Vector2(0.082, 0.001),
      new THREE.Vector2(0.088, 0.012), new THREE.Vector2(0.090, 0.026),
      new THREE.Vector2(0.090, 0.071), new THREE.Vector2(0.088, 0.084),
      new THREE.Vector2(0.085, 0.090), new THREE.Vector2(0.081, 0.087),
      new THREE.Vector2(0.079, 0.078), new THREE.Vector2(0.079, 0.018),
      new THREE.Vector2(0.070, 0.014), new THREE.Vector2(0, 0.014),
    ];
    shape(new THREE.LatheGeometry(panProfile, 20), m.steel);
    shape(new THREE.CylinderGeometry(0.013, 0.019, 0.035, 10), m.steel, [-0.094, 0.062, 0], [0, 0, Math.PI / 2]);
    shape(new THREE.CylinderGeometry(0.012, 0.019, 0.17, 10), m.black, [-0.165, 0.062, 0], [0, 0, Math.PI / 2]);
  });
  // Batch the matching oak and glass surfaces across these countertop props:
  // the jar adds detail without adding a desktop/mobile draw call.
  const savePropMeasure = (group) => {
    group.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(group);
    group.userData.qaBounds = { min: box.min.toArray(), max: box.max.toArray(), size: box.getSize(new THREE.Vector3()).toArray() };
    let vertices = 0, meshes = 0;
    group.traverse((child) => {
      if (!child.isMesh || !child.geometry?.attributes?.position) return;
      vertices += child.geometry.attributes.position.count; meshes++;
    });
    group.userData.qaGeometry = { vertices, meshes };
  };
  [coffeeMaker, counterMugs, stoneDish, kettle, utensilCrock, pantryJar, ...waterBottles, wokServingBowl, riceCooker, saucepan].forEach(savePropMeasure);
  const mergeWorldMaterialMeshes = (groups, material, name, renderOrder = 0) => {
    const sourceMeshes = groups.flatMap((group) => group.children.filter((child) => child.isMesh && child.material === material));
    const geometries = sourceMeshes.map((mesh) => mesh.geometry.clone().applyMatrix4(mesh.matrixWorld));
    const merged = mergeGeometries(geometries, false);
    geometries.forEach((geometry) => geometry.dispose());
    if (!merged) throw new Error(`Could not batch countertop material: ${name}`);
    merged.computeVertexNormals();
    for (const mesh of sourceMeshes) { mesh.parent.remove(mesh); mesh.geometry.dispose(); }
    const combined = new THREE.Mesh(merged, material);
    combined.name = name;
    combined.userData.category = "household-props";
    combined.renderOrder = renderOrder;
    combined.castShadow = material === m.oak;
    combined.receiveShadow = material === m.oak;
    scene.add(combined);
    return combined;
  };
  const mergeWorldTintedMeshes = (groups, materials, name, renderOrder = 0) => {
    const sourceMeshes = groups.flatMap((group) => group.children.filter((child) => child.isMesh && materials.includes(child.material)));
    const geometries = sourceMeshes.map((mesh) => {
      const geometry = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
      const color = mesh.material.color;
      const colors = new Float32Array(geometry.attributes.position.count * 3);
      for (let i = 0; i < geometry.attributes.position.count; i++) colors.set([color.r, color.g, color.b], i * 3);
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      return geometry;
    });
    const merged = mergeGeometries(geometries, false);
    geometries.forEach((geometry) => geometry.dispose());
    if (!merged) throw new Error(`Could not batch countertop materials: ${name}`);
    merged.computeVertexNormals();
    for (const mesh of sourceMeshes) { mesh.parent.remove(mesh); mesh.geometry.dispose(); }
    const combinedMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.42, metalness: 0.12, vertexColors: true });
    const combined = new THREE.Mesh(merged, combinedMaterial);
    combined.name = name;
    combined.userData.category = "household-props";
    combined.renderOrder = renderOrder;
    combined.castShadow = false;
    combined.receiveShadow = false;
    scene.add(combined);
    return combined;
  };
  mergeWorldMaterialMeshes([utensilCrock, pantryJar, wokServingBowl], m.oak, "prop-countertop-oak-shared");
  mergeWorldMaterialMeshes([coffeeMaker, counterMugs], m.porcelain, "prop-countertop-ceramics-shared");
  const sharedCounterGlass = mergeWorldMaterialMeshes([coffeeMaker, pantryJar], m.glass, "prop-countertop-glass-shared", 2);
  sharedCounterGlass.castShadow = false;
  sharedCounterGlass.receiveShadow = false;
  mergeWorldMaterialMeshes(waterBottles, m.bottleWater, "prop-mineral-water-liquid", 1);
  mergeWorldMaterialMeshes(waterBottles, m.bottleWaterTop, "prop-mineral-water-surface", 1);
  mergeWorldMaterialMeshes(waterBottles, m.waterBottleGlass, "prop-mineral-water-shells", 2);
  mergeWorldMaterialMeshes(waterBottles, m.waterLabel, "prop-mineral-water-labels", 0);
  // Preserve the steel/black distinction as per-vertex color while merging
  // these small hardware parts into one draw call for narrow mobile views.
  // The red mug joins the same batched hardware mesh, so its colour costs no extra mesh or draw call. Its lathe is
  // welded before it gets here, so the batch's normal recompute cannot leave a seam on it.
  // ---- Sink station: the everyday things that actually live beside a basin (Paul 2026-11-04). ----
  // Ceramic soap dispenser with a steel pump, a sponge on a small dish, a folded waffle towel, and a paper-towel roll on an under-cabinet bracket.
  // Authored as prop groups, then folded into the existing countertop hardware batch: the station adds no mesh and no draw call, only vertices.
  const SINK_STATION = { frontZ: -1.73, wallZ: -2.2625, topY: 0.955 };
  buildPropGroup(scene, "sink-soap-dispenser", [-1.00, counterY, -1.72], ({ shape, box }) => {
    shape(new THREE.LatheGeometry([[0, 0], [0.034, 0], [0.036, 0.006], [0.035, 0.10], [0.028, 0.132], [0.019, 0.148], [0.017, 0.152], [0, 0.152]].map(([r, y]) => new THREE.Vector2(r, y)), 30), m.porcelain);
    shape(new THREE.CylinderGeometry(0.0355, 0.0355, 0.008, 30), m.mugGlaze, [0, 0.095, 0]); // a terracotta band where the label would sit
    shape(new THREE.CylinderGeometry(0.013, 0.014, 0.014, 18), m.faucetSteel, [0, 0.158, 0]); // collar
    shape(new THREE.CylinderGeometry(0.006, 0.006, 0.034, 14), m.faucetSteel, [0, 0.178, 0]); // pump stem
    const spout = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.194, 0), new THREE.Vector3(0.012, 0.198, 0), new THREE.Vector3(0.026, 0.192, 0), new THREE.Vector3(0.030, 0.178, 0),
    ]);
    shape(new THREE.TubeGeometry(spout, 12, 0.0042, 8, false), m.faucetSteel);
  });
  buildPropGroup(scene, "sink-sponge-dish", [-1.50, counterY, -1.72], ({ shape, box }) => {
    shape(new THREE.LatheGeometry([[0, 0], [0.050, 0], [0.056, 0.004], [0.059, 0.012], [0.052, 0.017], [0.030, 0.013], [0, 0.011]].map(([r, y]) => new THREE.Vector2(r, y)), 26), m.porcelain);
    box(m.leafGreen, [0.080, 0.022, 0.052], [0.005, 0.027, 0.002], [0, 0.14, 0]); // the sponge sits in the dish, one corner proud
    box(m.porcelain, [0.080, 0.008, 0.052], [0.005, 0.042, 0.002], [0, 0.14, 0]); // cream scrub face on top
  });
  buildPropGroup(scene, "sink-folded-towel", [-0.79, counterY, -1.79], ({ box, shape }) => {
    // Three folded layers, each nudged and turned a hair, with a terracotta hem top and bottom, so it reads as folded cloth on a counter.
    box(m.porcelain, [0.188, 0.012, 0.132], [0, 0.006, 0], [0, 0.12, 0]);
    box(m.porcelain, [0.181, 0.012, 0.128], [0.005, 0.018, 0.004], [0, 0.07, 0]);
    box(m.porcelain, [0.174, 0.011, 0.122], [-0.004, 0.029, -0.003], [0, 0.16, 0]);
    box(m.mugGlaze, [0.188, 0.0135, 0.014], [0, 0.006, 0.069], [0, 0.12, 0]); // front hem
    box(m.mugGlaze, [0.181, 0.0135, 0.012], [0.005, 0.018, -0.062], [0, 0.07, 0]); // back hem, offset like a real fold
  });
  // sits 4.5 mm lower than the counter top, so the tilted bristle tips actually rest on the stone
  buildPropGroup(scene, "sink-dish-brush", [-1.34, counterY - 0.0045, -1.735], ({ box, shape }) => {
    // A small wooden dish brush leaning against the dish, bristles down: the everyday partner of the sponge, and no wall bracket to get wrong.
    box(m.oak, [0.030, 0.016, 0.130], [0, 0.042, 0], [0.10, 0.18, 0]); // the back of the brush, tilted
    shape(new THREE.CylinderGeometry(0.011, 0.013, 0.070, 12), m.oak, [0.006, 0.078, 0.060], [0.10, 0.18, 0]); // handle rising from the head
    for (let row = 0; row < 2; row++) for (let col = 0; col < 5; col++) {
      shape(new THREE.BoxGeometry(0.011, 0.018, 0.010), m.leafGreen, [-0.009 + col * 0.0105, 0.024 - row * 0.019, -0.050 + row * 0.030], [0.10, 0.18, 0]);
    }
  });
  const sinkSoap = scene.getObjectByName("prop-sink-soap-dispenser");
  const sinkSponge = scene.getObjectByName("prop-sink-sponge-dish");
  const sinkTowel = scene.getObjectByName("prop-sink-folded-towel");
  const sinkBrush = scene.getObjectByName("prop-sink-dish-brush");
  const sinkStationProps = [sinkSoap, sinkSponge, sinkTowel, sinkBrush];
  // Settle each prop onto the measured counter top (the craft rule from the Room 03 handoff: measure, then sit it), and only then record the numbers:
  // the batching merge takes the meshes out of these groups, so the numbers have to be captured first.
  const sinkStationBoxes = {};
  scene.updateMatrixWorld(true);
  for (const group of [sinkSoap, sinkSponge, sinkTowel, sinkBrush]) {
    if (!group) continue;
    const gap = new THREE.Box3().setFromObject(group).min.y - SINK_STATION.topY;
    group.position.y -= gap;
  }
  scene.updateMatrixWorld(true);
  for (const [key, group] of [["soap", sinkSoap], ["sponge", sinkSponge], ["towel", sinkTowel], ["brush", sinkBrush]]) {
    if (!group) { sinkStationBoxes[key] = null; continue; }
    const b = new THREE.Box3().setFromObject(group);
    sinkStationBoxes[key] = {
      min: b.min.toArray().map((v) => Number(v.toFixed(3))), max: b.max.toArray().map((v) => Number(v.toFixed(3))),
      bottomGapMm: Number(((b.min.y - SINK_STATION.topY) * 1000).toFixed(1)),
      onCounter: b.min.x > -2.23 && b.max.x < 2.23 && b.min.z > -2.39 && b.max.z < -1.65,
      clearOfSink: !(b.max.x > -1.59 && b.min.x < -0.91 && b.max.z > -2.23 && b.min.z < -1.81),
    };
  }
  sinkStationInfoRef = () => JSON.parse(JSON.stringify(sinkStationBoxes));

  scene.updateMatrixWorld(true); // the station props were just created; merge in world space so they land where they belong
  mergeWorldTintedMeshes([kettle, riceCooker, saucepan, counterMugs, ...sinkStationProps], [m.steel, m.black, m.mugGlaze, m.mugCoffee, m.porcelain, m.faucetSteel, m.leafGreen, m.oak], "prop-countertop-hardware-shared");

  // One reduced solid-wood board leans against the wok-side backsplash; the former island board is removed.
  const cuttingBoard = buildPropGroup(scene, "cutting-board", [0, 0, 0], ({ shape }) => {
    const width = 0.255, height = 0.315, thickness = 0.0195, corner = 0.022, holeRadius = 0.009;
    const boardShape = new THREE.Shape();
    boardShape.moveTo(-width / 2 + corner, -height / 2);
    boardShape.lineTo(width / 2 - corner, -height / 2);
    boardShape.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + corner);
    boardShape.lineTo(width / 2, height / 2 - corner);
    boardShape.quadraticCurveTo(width / 2, height / 2, width / 2 - corner, height / 2);
    boardShape.lineTo(-width / 2 + corner, height / 2);
    boardShape.quadraticCurveTo(-width / 2, height / 2, -width / 2, height / 2 - corner);
    boardShape.lineTo(-width / 2, -height / 2 + corner);
    boardShape.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + corner, -height / 2);
    const handleHole = new THREE.Path();
    handleHole.absarc(0, height / 2 - 0.034, holeRadius, 0, Math.PI * 2, true);
    boardShape.holes.push(handleHole);
    const board = new THREE.ExtrudeGeometry(boardShape, { depth: thickness, bevelEnabled: false, curveSegments: 8 });
    board.translate(0, 0, -thickness / 2);
    // Paul 2026-11-22: the board leaned against the small stove's wall, and the new zellige bricks stand 1.5-5 mm proud of
    // it, so the board cut into the tile and read as broken. It now lies flat on the sink run, clear of the hob and of the
    // basin, drying after a wash, and the stove wall is left clean.
    const orient = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
    board.applyQuaternion(orient);
    const x = 2.12, z = -2.03, y = counterY + thickness / 2 + 0.0030; // lying flat; the 3 mm covers the counter's front bevel under the board
    shape(board, m.oak, [x, y, z]);
  });
  cuttingBoard.userData.nominalSizeM = [0.255, 0.315, 0.0195];
  // Oil has moved to the wok counter beside the paper pack. Keep a small salt cellar at the island end.
  buildPropGroup(scene, "counter-seasoning", [0, counterY, 0], ({ shape }) => {
    shape(new THREE.CylinderGeometry(0.039, 0.043, 0.115, 8), m.porcelain, [1.84, 0.058, -1.96]);
    shape(new THREE.CylinderGeometry(0.041, 0.041, 0.022, 8), m.stone, [1.84, 0.127, -1.96]);
  });

  // One mood-slot keeps the small tabletop centerpiece easy to replace later.
  const centerpieceSlot = new THREE.Group();
  centerpieceSlot.name = "mood-slot-tabletop-centerpiece";
  centerpieceSlot.userData.moodSlot = "tabletop-centerpiece";
  const centerpieceMaterial = m.porcelain.clone();
  centerpieceMaterial.color.setHex(0xffffff);
  centerpieceMaterial.roughness = 0.88;
  centerpieceMaterial.vertexColors = true;
  centerpieceMaterial.name = "room03-lemon-bowl-vertex-color";
  const centerpieceGeometries = [];
  const lemonSupportSamples = [];
  const addCenterpieceGeometry = (geometry, colorHex, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) => {
    geometry.applyMatrix4(new THREE.Matrix4().compose(
      new THREE.Vector3(...position), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)), new THREE.Vector3(...scale),
    ));
    const color = new THREE.Color(colorHex);
    const colors = new Float32Array(geometry.attributes.position.count * 3);
    for (let vertex = 0; vertex < geometry.attributes.position.count; vertex++) color.toArray(colors, vertex * 3);
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    centerpieceGeometries.push(geometry);
    return geometry;
  };
  // One thin-walled lathed bowl. Its broad, shallow inner floor leaves room for five fruit.
  const bowlGeometry = new THREE.LatheGeometry([
    [0, 0.001], [0.045, 0.001], [0.061, 0.003], [0.071, 0.010], [0.101, 0.030],
    [0.121, 0.066], [0.130, 0.095], [0.125, 0.100], [0.116, 0.092], [0.098, 0.055],
    [0.074, 0.024], [0.055, 0.018], [0, 0.018],
  ].map(([radius, y]) => new THREE.Vector2(radius, y)), 16);
  addCenterpieceGeometry(bowlGeometry, 0xb8a891);
  const lemonPlacements = [
    { x: -0.05, z: 0, support: "bowl" }, { x: 0, z: 0, support: "bowl" }, { x: 0.05, z: 0, support: "bowl" },
    { x: -0.025, z: 0, support: "fruit" }, { x: 0.025, z: 0, support: "fruit" },
  ];
  const supportRaycaster = new THREE.Raycaster();
  const supportDoubleSide = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
  const supportBowlMesh = new THREE.Mesh(bowlGeometry, supportDoubleSide);
  const supportLemonMeshes = [];
  for (let index = 0; index < lemonPlacements.length; index++) {
    const placement = lemonPlacements[index];
    let supportY = null;
    if (placement.support === "bowl") {
      supportRaycaster.set(new THREE.Vector3(placement.x, 0.2, placement.z), new THREE.Vector3(0, -1, 0));
      supportY = supportRaycaster.intersectObject(supportBowlMesh, false)[0]?.point.y ?? null;
    } else {
      supportRaycaster.set(new THREE.Vector3(placement.x, 0.2, placement.z), new THREE.Vector3(0, -1, 0));
      const hits = supportLemonMeshes.flatMap((supportMesh) => supportRaycaster.intersectObject(supportMesh, false));
      supportY = hits.length ? Math.max(...hits.map(({ point }) => point.y)) : null;
    }
    if (supportY === null) throw new Error(`Could not measure support for Meyer lemon ${index + 1}`);
    const lemonGeometry = new THREE.SphereGeometry(1, 10, 8);
    const positions = lemonGeometry.attributes.position;
    for (let vertex = 0; vertex < positions.count; vertex++) {
      const x = positions.getX(vertex), taper = Math.abs(x);
      positions.setXYZ(vertex, x * (1 + 0.13 * taper), positions.getY(vertex) * (1 - 0.10 * taper), positions.getZ(vertex) * (1 - 0.10 * taper));
    }
    positions.needsUpdate = true;
    lemonGeometry.computeVertexNormals();
    const lemonCenterY = supportY + 0.034 - 0.002;
    const transformed = addCenterpieceGeometry(lemonGeometry, [0xd6a53b, 0xd2a13a, 0xd9aa42][index % 3],
      [placement.x, lemonCenterY, placement.z], [0, index * 0.47, 0], [0.038, 0.034, 0.030]);
    let minY = Infinity;
    for (let vertex = 0; vertex < transformed.attributes.position.count; vertex++) minY = Math.min(minY, transformed.attributes.position.getY(vertex));
    lemonSupportSamples.push({ name: `lemon-${index + 1}`, support: placement.support, bottomY: minY, supportY });
    supportLemonMeshes.push(new THREE.Mesh(transformed, supportDoubleSide));
  }
  const leafGeometry = new THREE.SphereGeometry(1, 6, 4);
  for (const [index, placement] of [[-0.017, 0.045], [0.018, 0.046]].entries()) {
    addCenterpieceGeometry(leafGeometry.clone(), 0x687451, [placement[0], 0.084, placement[1]], [0.12, index ? -0.5 : 0.45, index ? 0.18 : -0.14], [0.020, 0.004, 0.009]);
  }
  leafGeometry.dispose();
  const lemonBowlGeometry = mergeGeometries(centerpieceGeometries, false);
  if (!lemonBowlGeometry) throw new Error("Could not merge Meyer lemon bowl geometry");
  lemonBowlGeometry.computeVertexNormals();
  centerpieceGeometries.forEach((geometry) => geometry.dispose());
  const lemonBowl = new THREE.Group();
  lemonBowl.name = "prop-tabletop-meyer-lemon-bowl";
  lemonBowl.position.set(0, 0.75, 0.5);
  lemonBowl.userData.category = "household-props";
  lemonBowl.userData.propKey = "tabletop-meyer-lemon-bowl";
  lemonBowl.userData.form = "lathed-stoneware-bowl-five-low-poly-meyer-lemons";
  lemonBowl.userData.moodReplaceable = true;
  const lemonBowlMesh = new THREE.Mesh(lemonBowlGeometry, centerpieceMaterial);
  lemonBowlMesh.name = "prop-tabletop-meyer-lemon-bowl-part";
  lemonBowlMesh.userData.category = "household-props";
  lemonBowlMesh.userData.propKey = "tabletop-meyer-lemon-bowl";
  lemonBowlMesh.castShadow = false;
  lemonBowlMesh.receiveShadow = true;
  lemonBowl.add(lemonBowlMesh);
  const centerpieceFit = lemonSupportSamples.map((sample) => {
    const gapMm = Math.round((sample.bottomY - sample.supportY) * 1000);
    return { lemon: sample.name, support: sample.support, bottomY: Number((lemonBowl.position.y + sample.bottomY).toFixed(4)), supportY: Number((lemonBowl.position.y + sample.supportY).toFixed(4)), gapMm };
  });
  supportDoubleSide.dispose();
  bowlGeometry.dispose();
  lemonBowl.userData.fit = centerpieceFit;
  centerpieceSlot.add(lemonBowl);
  // Paul 2026-11-11 (art-polish P1, pass 4): the daylight pitcher still read as a washed-out frosted blob sitting on
  // the cream chair back. This pass keeps the pear pitcher, two tumblers and lemon water, but moves the set toward the
  // table centre so it no longer silhouettes against the chair, welds every lathe, uses transmissive glass with a darker
  // rim and foot, shows a crisp meniscus in both vessels (filled about three-quarters), paints the lemon slices opaque,
  // and keeps a stronger contact shadow under each footprint.
  {
    const glassParts = [], waterParts = [], lemonParts = [];
    const bake = (list, geometry, colorHex, position = [0, 0, 0], rotation = [0, 0, 0]) => {
      geometry.applyMatrix4(new THREE.Matrix4().compose(
        new THREE.Vector3(...position), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)), new THREE.Vector3(1, 1, 1),
      ));
      if (!geometry.attributes.color) {
        const color = new THREE.Color(colorHex);
        const colors = new Float32Array(geometry.attributes.position.count * 3);
        for (let vertex = 0; vertex < geometry.attributes.position.count; vertex++) color.toArray(colors, vertex * 3);
        geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
      }
      list.push(geometry);
    };
    const lathe = (profile, segments = 28) => weldSmooth(new THREE.LatheGeometry(profile.map(([radius, y]) => new THREE.Vector2(radius, y)), segments));
    const GLASS_WALL = 0xf3f8f7, GLASS_RIM = 0x6a918c, GLASS_FOOT = 0x5e827c;
    const WATER_BODY = 0x8fb8bc, WATER_SURFACE = 0xe8f4f4, WATER_LINE = 0x5e8b90;
    const colorGlassShell = (geometry, rimY, footY) => {
      const pos = geometry.attributes.position;
      const colors = new Float32Array(pos.count * 3);
      const wall = new THREE.Color(GLASS_WALL), rim = new THREE.Color(GLASS_RIM), foot = new THREE.Color(GLASS_FOOT);
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        (y >= rimY ? rim : y <= footY ? foot : wall).toArray(colors, i * 3);
      }
      geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
      return geometry;
    };
    // Contemporary American glass pitcher (Crate & Barrel / West Elm pear shape): 0.219 m tall, 0.136 m across the belly,
    // a heavy 11 mm floor, a rounded rim about 5.5 mm thick so the lip reads, a pinched pour spout, a D handle with
    // both ends buried and capped.
    const PITCHER_H = 0.219, PITCHER_FILL = 0.168; // 76.7 %
    const pitcherGlass = lathe([
      [0, 0], [0.046, 0], [0.052, 0.006], [0.060, 0.020], [0.068, 0.070], [0.066, 0.115], [0.056, 0.160], [0.047, 0.190],
      [0.046, 0.204], [0.050, 0.214], [0.0490, 0.219], [0.0435, 0.219], [0.0420, 0.214], [0.043, 0.190], [0.052, 0.160],
      [0.062, 0.115], [0.064, 0.070], [0.056, 0.022], [0.044, 0.011], [0, 0.011],
    ], 36);
    {
      const pos = pitcherGlass.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
        if (y < 0.207 || x >= 0 || Math.abs(z) > 0.034) continue;
        const rise = (y - 0.207) / 0.012, across = 1 - (z / 0.034) ** 2;
        pos.setXYZ(i, x - 0.018 * rise * across, y + 0.005 * rise * across, z);
      }
      pos.needsUpdate = true;
      pitcherGlass.computeVertexNormals();
    }
    bake(glassParts, colorGlassShell(pitcherGlass, 0.208, 0.020), GLASS_WALL);
    // Heavy glass foot as a dense puck (reads as thickness at the base, not an empty shell).
    bake(glassParts, colorGlassShell(weldSmooth(new THREE.CylinderGeometry(0.044, 0.046, 0.010, 32)), 1, 0.006), GLASS_FOOT, [0, 0.005, 0]);
    // D-handle: both ends finish inside the wall, then a sphere caps each buried mouth.
    const HANDLE_TUBE = 0.0085;
    const handleStart = new THREE.Vector3(0.044, 0.180, 0), handleEnd = new THREE.Vector3(0.058, 0.066, 0);
    bake(glassParts, new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      handleStart, new THREE.Vector3(0.080, 0.190, 0), new THREE.Vector3(0.104, 0.145, 0),
      new THREE.Vector3(0.098, 0.098, 0), new THREE.Vector3(0.078, 0.066, 0), handleEnd,
    ]), 28, HANDLE_TUBE, 8, false), GLASS_WALL);
    bake(glassParts, new THREE.SphereGeometry(HANDLE_TUBE, 10, 8), GLASS_WALL, handleStart.toArray());
    bake(glassParts, new THREE.SphereGeometry(HANDLE_TUBE, 10, 8), GLASS_WALL, handleEnd.toArray());
    // Water as a closed solid 1.5 mm inside the glass, filled to 76.7 %, with a flat surface and a darker meniscus ring.
    bake(waterParts, lathe([[0, 0.012], [0.044, 0.012], [0.0525, 0.022], [0.0625, 0.070], [0.0605, 0.115], [0.0505, 0.160], [0.0468, 0.168], [0, 0.168]], 36), WATER_BODY);
    bake(waterParts, new THREE.CylinderGeometry(0.0466, 0.0466, 0.0010, 32), WATER_SURFACE, [0, PITCHER_FILL + 0.0006, 0]);
    bake(waterParts, new THREE.TorusGeometry(0.0462, 0.00115, 8, 32), WATER_LINE, [0, PITCHER_FILL + 0.0006, 0], [Math.PI / 2, 0, 0]);
    // Two Meyer-lemon slices floating just under the surface, tilted against each other; opaque so they do not wash out in the water.
    const lemonFlesh = (radius = 0.022) => {
      const flesh = new THREE.CylinderGeometry(radius, radius, 0.0038, 20);
      const rind = new THREE.TorusGeometry(radius, 0.0023, 6, 20);
      rind.rotateX(Math.PI / 2);
      const pith = new THREE.TorusGeometry(radius - 0.0022, 0.0009, 5, 20);
      pith.rotateX(Math.PI / 2);
      const fleshColors = new Float32Array(flesh.attributes.position.count * 3);
      const rindColors = new Float32Array(rind.attributes.position.count * 3);
      const pithColors = new Float32Array(pith.attributes.position.count * 3);
      const fleshC = new THREE.Color(0xf3d35a), rindC = new THREE.Color(0xd49a1c), pithC = new THREE.Color(0xf7f0d4);
      for (let i = 0; i < flesh.attributes.position.count; i++) fleshC.toArray(fleshColors, i * 3);
      for (let i = 0; i < rind.attributes.position.count; i++) rindC.toArray(rindColors, i * 3);
      for (let i = 0; i < pith.attributes.position.count; i++) pithC.toArray(pithColors, i * 3);
      flesh.setAttribute("color", new THREE.Float32BufferAttribute(fleshColors, 3));
      rind.setAttribute("color", new THREE.Float32BufferAttribute(rindColors, 3));
      pith.setAttribute("color", new THREE.Float32BufferAttribute(pithColors, 3));
      const merged = mergeGeometries([flesh, rind, pith], false);
      flesh.dispose(); rind.dispose(); pith.dispose();
      return merged;
    };
    const LEMON_SLICES = [[0.010, 0.160, 0.012, 0.22, 0.3], [-0.016, 0.164, -0.010, -0.30, 1.4]];
    for (const [x, y, z, tilt, yaw] of LEMON_SLICES) bake(lemonParts, lemonFlesh(), 0xf3d35a, [x, y, z], [tilt, yaw, 0.12]);
    // Dinner water-glass profile (0.072 m x 0.082 m), both filled about three-quarters, with their own meniscus.
    const TUMBLER_H = 0.082;
    const tumblerProfile = [
      [0, 0], [0.0230, 0], [0.0299, 0.004], [0.0349, 0.012], [0.0360, 0.0640], [0.0349, 0.0800], [0.0334, 0.0820],
      [0.0298, 0.0820], [0.0286, 0.0800], [0.0299, 0.012], [0.0241, 0.008], [0, 0.008],
    ];
    const TUMBLERS = [[-0.110, 0.080, 0.062], [-0.138, -0.048, 0.058]]; // 75.6 % and 70.7 %
    for (const [x, z, fill] of TUMBLERS) {
      bake(glassParts, colorGlassShell(lathe(tumblerProfile, 24), 0.076, 0.010), GLASS_WALL, [x, 0, z]);
      bake(waterParts, lathe([[0, 0.008], [0.0235, 0.008], [0.0294, 0.012], [0.0298, fill], [0, fill]], 24), WATER_BODY, [x, 0, z]);
      bake(waterParts, new THREE.CylinderGeometry(0.0296, 0.0296, 0.0009, 24), WATER_SURFACE, [x, fill + 0.0005, z]);
      bake(waterParts, new THREE.TorusGeometry(0.0293, 0.0009, 8, 24), WATER_LINE, [x, fill + 0.0005, z], [Math.PI / 2, 0, 0]);
    }
    const mergeFor = (list, label) => {
      const merged = mergeGeometries(list, false);
      if (!merged) throw new Error(`Could not merge the Room 03 daylight ${label}`);
      merged.computeVertexNormals();
      list.forEach((geometry) => geometry.dispose());
      return merged;
    };
    const waterMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, roughness: 0.08, metalness: 0, transparent: true, opacity: 0.34, depthWrite: false, vertexColors: true,
    });
    waterMaterial.name = "room03-water-set-water";
    const lemonMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.52, vertexColors: true });
    lemonMaterial.name = "room03-water-set-lemon";
    const SET_X = 0.32, SET_Z = 0.42, TABLE_Y = 0.75;
    const waterSet = new THREE.Group();
    waterSet.name = "prop-tabletop-water-set";
    waterSet.position.set(SET_X, TABLE_Y, SET_Z);
    waterSet.userData.category = "household-props";
    waterSet.userData.propKey = "tabletop-water-set";
    waterSet.userData.form = "glass-pitcher-with-lemon-water-and-two-tumblers";
    waterSet.userData.moodReplaceable = true;
    for (const [name, list, material, order, label] of [
      ["water", waterParts, waterMaterial, 1, "water"],
      ["glass", glassParts, m.waterSetGlass, 2, "glass"],
      ["lemon", lemonParts, lemonMaterial, 3, "lemon slices"],
    ]) {
      const mesh = new THREE.Mesh(mergeFor(list, label), material);
      mesh.name = `prop-tabletop-water-set-${name}`;
      mesh.userData.category = "household-props";
      mesh.userData.propKey = "tabletop-water-set";
      mesh.renderOrder = order;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      waterSet.add(mesh);
    }
    // Soft contact shadow so the set sits on the table: one plane, three blurred blobs, sized so the plane stays clear of the lemon bowl.
    {
      const W = 0.27, D = 0.23, ox = -0.052, oz = 0.016, px = 256;
      const canvas = document.createElement("canvas"); canvas.width = px; canvas.height = Math.round(px * D / W);
      const ctx = canvas.getContext("2d");
      const blob = (x, z, radius, alpha) => {
        const cx = (x - ox + W / 2) / W * canvas.width, cy = (z - oz + D / 2) / D * canvas.height, r = radius / W * canvas.width;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, `rgba(38,26,14,${alpha})`); g.addColorStop(0.5, `rgba(38,26,14,${alpha * 0.5})`); g.addColorStop(1, "rgba(38,26,14,0)");
        ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width, canvas.height);
      };
      blob(0.010, -0.008, 0.078, 0.56);
      blob(-0.110 + 0.008, 0.080 - 0.006, 0.042, 0.46);
      blob(-0.138 + 0.008, -0.048 - 0.006, 0.042, 0.46);
      const shadowTexture = new THREE.CanvasTexture(canvas); shadowTexture.colorSpace = THREE.SRGBColorSpace;
      const shadow = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }));
      shadow.name = "prop-tabletop-water-set-contact-shadow";
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.set(ox, 0.0012, oz);
      shadow.renderOrder = 0;
      shadow.userData.category = "household-props";
      shadow.userData.propKey = "tabletop-water-set";
      waterSet.add(shadow);
    }
    waterSet.updateMatrixWorld(true);
    lemonBowl.updateMatrixWorld(true);
    const glassBox = new THREE.Box3().setFromObject(waterSet.getObjectByName("prop-tabletop-water-set-glass"));
    const bowlBox = new THREE.Box3().setFromObject(lemonBowl);
    const bowlClearMm = Math.round((glassBox.min.x - bowlBox.max.x) * 1000);
    const waterBox = new THREE.Box3().setFromObject(waterSet.getObjectByName("prop-tabletop-water-set-glass"));
    waterBox.union(new THREE.Box3().setFromObject(waterSet.getObjectByName("prop-tabletop-water-set-water")));
    let setVertices = 0, setMeshes = 0;
    waterSet.traverse((child) => {
      if (!child.isMesh || !child.geometry?.attributes?.position) return;
      setVertices += child.geometry.attributes.position.count;
      setMeshes++;
    });
    waterSet.userData.measure = {
      form: waterSet.userData.form,
      position: [SET_X, TABLE_Y, SET_Z],
      pitcherHeightMm: Math.round(PITCHER_H * 1000),
      pitcherFillMm: Math.round(PITCHER_FILL * 1000),
      pitcherFillRatio: Number((PITCHER_FILL / PITCHER_H).toFixed(3)),
      tumblerCount: TUMBLERS.length,
      tumblerHeightMm: Math.round(TUMBLER_H * 1000),
      tumblerFillsMm: TUMBLERS.map(([, , fill]) => Math.round(fill * 1000)),
      tumblerFillRatios: TUMBLERS.map(([, , fill]) => Number((fill / TUMBLER_H).toFixed(3))),
      lemonSliceCount: LEMON_SLICES.length,
      gapMm: Math.round(waterBox.min.y * 1000 - TABLE_Y * 1000),
      bowlClearanceMm: bowlClearMm,
      chairOffsetXMm: Math.round((0.5 - SET_X) * 1000),
      pitcherBowlClearanceMm: Math.round(Math.hypot(SET_X, SET_Z - 0.5) * 1000) - 130 - 68,
      glass: {
        type: m.waterSetGlass.type,
        transmission: m.waterSetGlass.transmission,
        opacity: m.waterSetGlass.opacity,
        roughness: m.waterSetGlass.roughness,
        clearcoat: m.waterSetGlass.clearcoat,
        hasEnv: Boolean(m.waterSetGlass.envMap),
      },
      hasContactShadow: true,
      vertices: setVertices,
      meshes: setMeshes,
    };
    centerpieceSlot.add(waterSet);
  }
  scene.add(centerpieceSlot);

  // Three upright cookbooks on the existing cabinet top; one leans gently against its neighbor.
  const cookbooks = buildPropGroup(scene, "cookbooks", [-1.52, 2.11, -2.16], ({ box, shape }) => {
    const addBookPart = (material, size, center, pivotX, tilt) => {
      const geometry = new THREE.BoxGeometry(...size);
      geometry.translate(...center);
      geometry.translate(-pivotX, 0, 0);
      geometry.rotateZ(tilt);
      geometry.translate(pivotX, 0, 0);
      shape(geometry, material);
    };
    // Paul 2026-11-04: the upright books stood free with nothing holding them. Now the two upright books are packed tight against the
    // orange shoebox, which acts as the bookend, and the third book lies flat on its cover beside them.
    const books = [
      { x: 0.019, width: 0.088, height: 0.285, depth: 0.16, cover: m.beam, tilt: 0 },
      { x: 0.1025, width: 0.079, height: 0.325, depth: 0.15, cover: m.black, tilt: 0 },
    ];
    for (const book of books) {
      const { x, width, height, depth, cover, tilt } = book;
      addBookPart(cover, [width, height, depth], [x, height / 2, 0], x, tilt);
      addBookPart(m.porcelain, [width - 0.012, height - 0.02, depth - 0.022], [x, height / 2, 0.004], x, tilt);
      addBookPart(m.porcelain, [width * 0.67, height - 0.012, 0.006], [x + width * 0.165, height / 2, depth / 2 + 0.004], x, tilt);
      addBookPart(cover, [width * 0.32, height, 0.008], [x - width * 0.34, height / 2, depth / 2 + 0.006], x, tilt);
    }
    // Lying charcoal-cloth book (240 x 150 x 60 mm), spine to the room, its left edge 4 mm clear of the upright row.
    const flatX = 0.019 - 0.044 - 0.004 - 0.12;
    addBookPart(m.black, [0.24, 0.06, 0.15], [flatX, 0.03, 0], flatX, 0);
    addBookPart(m.porcelain, [0.228, 0.046, 0.146], [flatX + 0.004, 0.03, -0.006], flatX, 0);
    addBookPart(m.black, [0.24, 0.06 * 0.32, 0.008], [flatX, 0.03, 0.079], flatX, 0);
    // Two sneaker-style shoeboxes, ported from Room 02's bookshelf-top boxes (bedroom.js "shelf-top-shoebox"):
    // Paul 2026-11-04: one box was the exact cabinet olive and read fake. Now a burnt-orange box with a cream label
    // and a cream box with a charcoal lid (Room 02 palette, neither close to the olive). Bevelled body, separate
    // overhanging lid with a dark seam line, a blank side label block and a thumb notch. No logos or text.
    const shoeboxPalette = [
      { x: 0.28, body: shoeboxOrange(), lid: shoeboxOrange(), label: m.porcelain },
      { x: 0.565, body: m.porcelain, lid: m.black, label: m.black },
    ];
    for (const { x, body, lid, label } of shoeboxPalette) {
      box(body, [0.272, 0.160, 0.196], [x, 0.080, 0]);
      box(lid, [0.282, 0.034, 0.206], [x, 0.160, 0]);
      shape(new THREE.BoxGeometry(0.2735, 0.004, 0.1975), m.black, [x, 0.1415, 0]);
      box(label, [0.080, 0.050, 0.003], [x + 0.07, 0.075, 0.0985]);
      box(label, [0.003, 0.050, 0.060], [x - 0.1365, 0.075, 0]);
      shape(new THREE.CylinderGeometry(0.014, 0.014, 0.0025, 14, 1, false, 0, Math.PI), m.black, [x, 0.150, 0.1035], [Math.PI / 2, 0, Math.PI / 2]);
    }
  });
  cookbooks.userData.bookCount = 3; // two upright against the shoebox bookend, one lying flat
  cookbooks.userData.storageBoxCount = 2;
}

// Three compact living details, each batched to one vertex-colour mesh. Their
// silhouettes stay genuinely three-dimensional while keeping draw calls low.
// Foliage for the Meyer lemon tree. First version (Paul 2026-10-29): 46 big round cards, each a photo of a whole leaf cluster; from the room they read as flat
// discs ("billboards", Paul 2026-10-30). Now the crown is ~170 single leaves, each its own small leaf-shaped card (alpha cut to a real leaf outline,
// painted leaf texture inside, a midrib), grouped in sprigs of six that fan outward and droop, and darker toward the inside of the crown so it reads as a volume.
// The leaf texture is cut from Codex's painted atlas; a canvas atlas draws instantly and is repainted when the painting loads (if it fails, the canvas leaves stay).
// Every card has a front and a back quad, and its normal is blended with the outward direction of the crown so it shades like a ball of leaves.
function buildLemonLeafCards(crown) {
  const CELL = 256, COLS = 4, ROWS = 2;
  const canvas = document.createElement("canvas");
  canvas.width = CELL * COLS; canvas.height = CELL * ROWS;
  const context = canvas.getContext("2d");
  const SOURCE_PATCHES = [[1150, 126, 260, 260], [638, 126, 260, 260], [1150, 638, 260, 260]];
  const paintAtlas = (source) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    let seed = 11;
    const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let cell = 0; cell < COLS * ROWS; cell++) {
      const x0 = (cell % COLS) * CELL, y0 = Math.floor(cell / COLS) * CELL, cx = x0 + CELL / 2;
      const hw = CELL * (0.20 + 0.03 * random()), bend = (random() - 0.5) * CELL * 0.14;
      const leaf = new Path2D();
      leaf.moveTo(cx, y0 + CELL - 8);
      leaf.bezierCurveTo(cx + hw * 1.55, y0 + CELL * 0.70, cx + hw * 1.25 + bend, y0 + CELL * 0.28, cx + bend, y0 + 6);
      leaf.bezierCurveTo(cx - hw * 1.25 + bend, y0 + CELL * 0.28, cx - hw * 1.55, y0 + CELL * 0.70, cx, y0 + CELL - 8);
      context.save();
      context.clip(leaf);
      if (source) {
        const [px, py, pw, ph] = SOURCE_PATCHES[cell % SOURCE_PATCHES.length];
        const size = 150 + random() * 60;
        context.translate(cx, y0 + CELL / 2); context.rotate((random() - 0.5) * 0.7);
        context.drawImage(source, px + random() * (pw - size), py + random() * (ph - size), size, size, -CELL / 2, -CELL / 2, CELL, CELL);
        context.setTransform(1, 0, 0, 1, 0, 0);
      } else {
        const gradient = context.createLinearGradient(x0, y0 + CELL, x0, y0);
        gradient.addColorStop(0, "#3f5a2e"); gradient.addColorStop(1, random() > 0.5 ? "#6f8d45" : "#5b7a3a");
        context.fillStyle = gradient; context.fillRect(x0, y0, CELL, CELL);
      }
      // A little shade over the whole leaf, a dark outline, a pale midrib and a few side veins.
      context.fillStyle = "rgba(25,50,15,0.24)"; context.fillRect(x0, y0, CELL, CELL);
      context.restore();
      context.strokeStyle = "rgba(30,55,20,0.55)"; context.lineWidth = 3; context.stroke(leaf);
      context.strokeStyle = "rgba(225,235,170,0.65)"; context.lineWidth = 2.2;
      context.beginPath(); context.moveTo(cx, y0 + CELL - 8); context.quadraticCurveTo(cx + bend * 0.2, y0 + CELL * 0.5, cx + bend, y0 + 12); context.stroke();
      context.lineWidth = 1.1; context.strokeStyle = "rgba(225,235,170,0.4)";
      for (const t of [0.35, 0.5, 0.65]) {
        const y = y0 + CELL - 8 - (CELL - 20) * t;
        context.beginPath(); context.moveTo(cx + bend * t, y); context.lineTo(cx + hw * 0.95, y - 26); context.moveTo(cx + bend * t, y); context.lineTo(cx - hw * 0.95, y - 26); context.stroke();
      }
    }
  };
  paintAtlas(null);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  new THREE.TextureLoader().load(new URL("./art/room03-lemon-leaf-atlas-v2.webp", import.meta.url).href, (loaded) => {
    paintAtlas(loaded.image); texture.needsUpdate = true; loaded.dispose();
  }, undefined, () => { /* keep the canvas atlas */ });
  const material = new THREE.MeshStandardMaterial({ map: texture, alphaTest: 0.5, roughness: 0.95, metalness: 0, side: THREE.FrontSide, vertexColors: true, emissive: 0x2c3b1b, emissiveMap: texture, emissiveIntensity: 0.2 });
  const positions = [], normals = [], uvs = [], colors = [], indices = [];
  const up = new THREE.Vector3(0, 1, 0);
  let seed = 7;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const SPRIGS = 36, PER_SPRIG = 6;
  let leaves = 0;
  for (let s = 0; s < SPRIGS; s++) {
    // Fibonacci sphere over the crown, pulled in at random depths, fewer sprigs on the underside so the trunk shows through.
    const t = (s + 0.5) / SPRIGS;
    const polar = Math.acos(1 - 2 * t * 0.94 - 0.06);
    const azimuth = s * 2.399963;
    const radial = new THREE.Vector3(Math.sin(polar) * Math.cos(azimuth), Math.cos(polar), Math.sin(polar) * Math.sin(azimuth));
    if (radial.y < 0.1 && s % 3 !== 0) continue;
    const depth = 0.5 + 0.5 * random();
    const anchor = new THREE.Vector3(crown.cx + radial.x * crown.rx * depth * 0.88, crown.cy + radial.y * crown.ry * depth * 0.88, crown.cz + radial.z * crown.rz * depth * 0.88);
    for (let k = 0; k < PER_SPRIG; k++) {
      const around = (k / PER_SPRIG) * Math.PI * 2 + random() * 0.8;
      const spread = new THREE.Vector3(Math.cos(around), 0, Math.sin(around)).multiplyScalar(0.55);
      const dir = radial.clone().add(spread).add(new THREE.Vector3(0, -0.18 - 0.25 * random(), 0)).normalize();
      const sideways = new THREE.Vector3().crossVectors(up, dir);
      if (sideways.lengthSq() < 1e-4) sideways.set(1, 0, 0);
      sideways.normalize();
      // The leaf plane holds the leaf axis; its normal leans up and outward, so most leaves lie like real ones, a little tilted.
      const lean = up.clone().multiplyScalar(0.7).addScaledVector(radial, 0.5).addScaledVector(sideways, (random() - 0.5) * 0.9);
      lean.addScaledVector(dir, -lean.dot(dir)).normalize();
      const wide = new THREE.Vector3().crossVectors(dir, lean).normalize();
      const length = 0.11 + 0.045 * random();
      const cell = Math.floor(random() * COLS * ROWS);
      const col = cell % COLS, row = Math.floor(cell / COLS);
      const u0 = col / COLS, u1 = (col + 1) / COLS, v0 = 1 - (row + 1) / ROWS, v1 = 1 - row / ROWS;
      const centre = anchor.clone().addScaledVector(dir, length * 0.45);
      const shadeNormal = radial.clone().multiplyScalar(0.6).addScaledVector(lean, 0.4).normalize();
      const shade = 0.58 + 0.34 * depth + 0.06 * (random() - 0.5);
      leaves++;
      for (const flip of [1, -1]) {
        const base = positions.length / 3;
        for (const [cx, cy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
          const point = centre.clone().addScaledVector(wide, cx * length / 2).addScaledVector(dir, cy * length / 2);
          positions.push(point.x, point.y, point.z);
          normals.push(shadeNormal.x, shadeNormal.y, shadeNormal.z);
          uvs.push(cx < 0 ? u0 : u1, cy < 0 ? v0 : v1);
          colors.push(shade, shade, shade);
        }
        if (flip === 1) indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
        else indices.push(base, base + 2, base + 1, base, base + 3, base + 2);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeBoundingBox(); geometry.computeBoundingSphere();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "prop-window-meyer-lemon-tree-leaf-cards";
  mesh.userData.category = "household-props";
  mesh.userData.propKey = "window-meyer-lemon-tree";
  mesh.userData.leaves = leaves;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  return { mesh, vertices: positions.length / 3 };
}

function buildRoom03LivingDetails(scene) {
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.82, metalness: 0.01, vertexColors: true });
  const batches = [];
  const makeBatch = (key, position = [0, 0, 0]) => {
    const group = new THREE.Group();
    group.name = `prop-${key}`;
    group.position.set(...position);
    group.userData.category = "household-props";
    group.userData.propKey = key;
    group.userData.moodReplaceable = false;
    scene.add(group);
    const geometries = [];
    const bounds = new THREE.Box3().makeEmpty();
    const add = (geometry, color, offset = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) => {
      const matrix = new THREE.Matrix4().compose(
        new THREE.Vector3(...offset), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)), new THREE.Vector3(...scale),
      );
      geometry.applyMatrix4(matrix);
      geometry.computeVertexNormals();
      geometry.computeBoundingBox();
      bounds.union(geometry.boundingBox);
      const tint = new THREE.Color(color);
      const colors = new Float32Array(geometry.attributes.position.count * 3);
      for (let i = 0; i < geometry.attributes.position.count; i++) tint.toArray(colors, i * 3);
      geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
      geometries.push(geometry);
      return geometry;
    };
    const box = (color, size, offset, rotation = [0, 0, 0], radius = 0.004) => add(
      roundedBoxGeometry(size, Math.min(radius, Math.min(...size) * 0.2)), color, offset, rotation,
    );
    const sphere = (color, radius, offset, scale = [1, 1, 1], segments = [10, 7]) => add(
      new THREE.SphereGeometry(radius, segments[0], segments[1]), color, offset, [0, 0, 0], scale,
    );
    const tube = (color, points, radius = 0.003, radial = 5) => add(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point))), Math.max(6, points.length * 4), radius, radial, false), color,
    );
    batches.push({ group, key, geometries, bounds, add, box, sphere, tube });
    return batches[batches.length - 1];
  };

  // Low, slightly offset books and a small turned vase make the console feel used.
  const console = makeBatch("tv-console-living-set");
  const book = (x, y, z, width, depth, color, angle) => {
    console.box(color, [width, 0.018, depth], [x, y + 0.009, z], [0, angle, 0], 0.001);
    console.box("#e4d9c8", [width - 0.012, 0.004, depth - 0.012], [x, y + 0.019, z], [0, angle, 0], 0.001);
  };
  const consoleTop = 0.575;
  // The hall wall's inner face is at x -0.94 and the console runs into it, so the books sit at x -0.80 where they can be seen.
  book(-0.80, consoleTop + 0.001, 3.50, 0.19, 0.13, "#a77b55", -0.045);
  book(-0.785, consoleTop + 0.020, 3.50, 0.17, 0.12, "#788064", 0.035);
  const vaseX = -0.53, vaseZ = 3.50;
  const vaseProfile = [[0, 0], [0.029, 0], [0.037, 0.012], [0.039, 0.035], [0.032, 0.062], [0.022, 0.078], [0.020, 0.095], [0.015, 0.101], [0.014, 0.094], [0.016, 0.079], [0, 0.076]];
  console.add(new THREE.LatheGeometry(vaseProfile.map(([r, y]) => new THREE.Vector2(r, y)), 12), "#9a6a50", [vaseX, consoleTop + 0.001, vaseZ]);
  const branchTop = [vaseX + 0.015, consoleTop + 0.175, vaseZ - 0.004];
  console.tube("#715c3d", [[vaseX, consoleTop + 0.088, vaseZ], [vaseX + 0.004, consoleTop + 0.13, vaseZ - 0.004], branchTop], 0.0028, 5);
  for (let i = 0; i < 7; i++) {
    const t = 0.086 + i * 0.010;
    const side = i % 2 ? 1 : -1;
    const leafX = vaseX + side * (0.018 + (i % 3) * 0.004);
    const leafY = consoleTop + t;
    const leafZ = vaseZ + (i % 2 ? 0.012 : -0.012);
    console.sphere(i % 3 ? "#74805e" : "#87906b", 0.024, [leafX, leafY, leafZ], [0.60, 0.22, 0.34], [7, 5]);
  }
  // A shallow tray and one small fruit stay below the screen frame.
  console.box("#b88b5b", [0.17, 0.012, 0.105], [-0.16, consoleTop + 0.006, 3.50], [0, 0.04, 0], 0.001);
  console.sphere("#b27b3c", 0.022, [-0.16, consoleTop + 0.024, 3.50], [1.3, 0.8, 0.9], [8, 6]);

  // 38 cm round side table beside the lounge chair, behind its ottoman and clear of dining.
  const table = makeBatch("window-side-table");
  const tableX = -2.20, tableZ = -1.25, tableTopY = 0.52;
  const tableTopGeometry = table.add(new THREE.CylinderGeometry(0.19, 0.187, 0.025, 24), "#b88b5b", [tableX, tableTopY - 0.0125, tableZ]);
  const legFeet = [];
  for (let i = 0; i < 3; i++) {
    const angle = -Math.PI / 2 + i * Math.PI * 2 / 3;
    const foot = [tableX + Math.cos(angle) * 0.145, 0.0005, tableZ + Math.sin(angle) * 0.145];
    const top = [tableX + Math.cos(angle) * 0.115, tableTopY - 0.02, tableZ + Math.sin(angle) * 0.115];
    const start = new THREE.Vector3(...foot), end = new THREE.Vector3(...top);
    const axis = end.clone().sub(start);
    const leg = new THREE.CylinderGeometry(0.019, 0.024, axis.length(), 7);
    leg.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis.clone().normalize()));
    leg.translate(...start.clone().add(end).multiplyScalar(0.5).toArray());
    leg.computeBoundingBox();
    leg.translate(0, 0.0005 - leg.boundingBox.min.y, 0);
    table.add(leg, "#a77c4e");
    leg.computeBoundingBox();
    legFeet.push([foot[0], 0.0005, foot[2]]);
  }
  // The cup, coffee, loop handle and open two-page book sit 1 mm above the tabletop.
  const cupX = tableX + 0.055, cupZ = tableZ - 0.015, cupBase = tableTopY + 0.001;
  const cupProfile = [[0, 0], [0.026, 0], [0.031, 0.006], [0.034, 0.064], [0.031, 0.070], [0.027, 0.067], [0.028, 0.012], [0, 0.012]];
  const cupBodyGeometry = table.add(new THREE.LatheGeometry(cupProfile.map(([r, y]) => new THREE.Vector2(r, y)), 10), "#ded6c8", [cupX, cupBase, cupZ]);
  table.add(new THREE.CylinderGeometry(0.027, 0.027, 0.005, 12), "#574232", [cupX, cupBase + 0.053, cupZ]);
  table.tube("#d9cfbf", [[cupX + 0.028, cupBase + 0.055, cupZ], [cupX + 0.051, cupBase + 0.058, cupZ], [cupX + 0.051, cupBase + 0.033, cupZ], [cupX + 0.028, cupBase + 0.034, cupZ]], 0.004, 5);
  const bookCenter = [tableX - 0.055, tableTopY + 0.006, tableZ + 0.035];
  const openBookGeometry = table.box("#72806c", [0.13, 0.012, 0.105], bookCenter, [0, -0.16, 0], 0.001);
  table.box("#e7dfd2", [0.119, 0.004, 0.096], [bookCenter[0], bookCenter[1] + 0.008, bookCenter[2]], [0, -0.16, 0], 0.001);

  // A small potted Meyer-lemon tree at the far window end, below the reading lamp.
  const plant = makeBatch("window-meyer-lemon-tree");
  // Moved 8 cm toward the room and 20 cm toward the hall so it no longer overlaps the floor lamp in view.
  const plantX = -1.05, plantZ = 1.80, potHeight = 0.22;
  const potProfile = [[0, 0], [0.094, 0], [0.108, 0.012], [0.12, 0.205], [0.116, 0.22], [0.101, 0.22], [0.096, 0.035], [0, 0.035]];
  const potGeometry = plant.add(new THREE.LatheGeometry(potProfile.map(([r, y]) => new THREE.Vector2(r, y)), 16), "#9a6a50", [plantX, 0.0005, plantZ]);
  plant.add(new THREE.CylinderGeometry(0.012, 0.018, 0.47, 8), "#786044", [plantX, 0.0005 + potHeight + 0.225, plantZ]);
  // Three thin branches carry the foliage cards (the crown itself is built from painted leaf cards after the batches are merged), plus three 3D lemons
  // hanging on the outside of the crown so the fruit has real depth.
  const CROWN = { cx: plantX, cy: 0.80, cz: plantZ, rx: 0.205, ry: 0.19, rz: 0.205 };
  const trunkTop = [plantX, 0.0005 + potHeight + 0.45, plantZ];
  for (const [index, [dx, dy, dz]] of [[-0.10, 0.17, 0.04], [0.09, 0.15, -0.06], [0.02, 0.2, 0.10]].entries()) {
    plant.tube(index % 2 ? "#7a6247" : "#6f573d", [trunkTop, [trunkTop[0] + dx * 0.5, trunkTop[1] + dy * 0.55, trunkTop[2] + dz * 0.5], [trunkTop[0] + dx, trunkTop[1] + dy, trunkTop[2] + dz]], 0.0075 - index * 0.0008, 5);
  }
  // Bright Meyer-lemon yellow (the old tone read orange, like kumquats, in the golden light); five fruit, two of them tucked inside the crown.
  for (const [index, [dx, dy, dz]] of [[-0.17, -0.02, 0.09], [0.13, -0.06, 0.14], [0.05, -0.10, -0.17], [-0.06, 0.04, 0.11], [0.09, 0.02, -0.06]].entries()) {
    plant.sphere(index % 2 ? "#f0c63c" : "#e9bd2e", 0.030, [CROWN.cx + dx, CROWN.cy + dy, CROWN.cz + dz], [0.82, 1.16, 0.82], [8, 6]);
  }

  const fit = {};
  for (const batch of batches) {
    const merged = mergeGeometries(batch.geometries, false);
    batch.geometries.forEach((geometry) => geometry.dispose());
    if (!merged) throw new Error(`Could not merge Room 03 living details: ${batch.key}`);
    merged.computeVertexNormals();
    const mesh = new THREE.Mesh(merged, material);
    mesh.name = `prop-${batch.key}-mesh`;
    mesh.userData.category = "household-props";
    mesh.userData.propKey = batch.key;
    // The plant and small console accessories are grounded by their surfaces/decal; their
    // broad low-poly group shadows add noise to the established room-light QA sample.
    mesh.castShadow = !["window-meyer-lemon-tree", "tv-console-living-set"].includes(batch.key);
    mesh.receiveShadow = true;
    batch.group.add(mesh);
    let batchVertices = merged.attributes.position.count, batchMeshes = 1;
    if (batch.key === "window-meyer-lemon-tree") {
      const cards = buildLemonLeafCards(CROWN);
      batch.group.add(cards.mesh);
      batchVertices += cards.vertices; batchMeshes += 1;
      batch.group.userData.leafCards = cards.mesh;
    }
    batch.group.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(batch.group);
    const size = box.getSize(new THREE.Vector3());
    batch.group.userData.qaBounds = { min: box.min.toArray(), max: box.max.toArray(), size: size.toArray() };
    batch.group.userData.qaGeometry = { vertices: batchVertices, meshes: batchMeshes };
    fit[batch.key] = { bounds: batch.group.userData.qaBounds, vertices: batchVertices, meshes: batchMeshes };
  }
  const distanceBetweenXZ = (a, b) => {
    const dx = Math.max(0, a.min[0] - b.max[0], b.min[0] - a.max[0]);
    const dz = Math.max(0, a.min[2] - b.max[2], b.min[2] - a.max[2]);
    return Math.hypot(dx, dz);
  };
  const toArray = (box) => ({ min: box.min.toArray(), max: box.max.toArray(), size: box.getSize(new THREE.Vector3()).toArray() });
  const side = toArray(new THREE.Box3(new THREE.Vector3(...fit["window-side-table"].bounds.min), new THREE.Vector3(...fit["window-side-table"].bounds.max)));
  const plantBox = toArray(new THREE.Box3(new THREE.Vector3(...fit["window-meyer-lemon-tree"].bounds.min), new THREE.Vector3(...fit["window-meyer-lemon-tree"].bounds.max)));
  const loungeBox = new THREE.Box3().setFromObject(scene.getObjectByName("room03-window-lounge-chair"));
  const ottomanBox = new THREE.Box3().setFromObject(scene.getObjectByName("room03-lounge-ottoman"));
  const lampBox = new THREE.Box3().setFromObject(scene.getObjectByName("floor-reading-lamp"));
  const diningTableBox = new THREE.Box3().setFromObject(scene.getObjectByName("room03-table-glb") || scene.getObjectByName("merged-dining-table"));
  const windowBox = new THREE.Box3().setFromObject(scene.getObjectByName("glass-slider-panel"));
  const clearances = {
    sideTable: Object.fromEntries([["lounge", loungeBox], ["ottoman", ottomanBox], ["floorLamp", lampBox], ["window", windowBox], ["diningTable", diningTableBox]].map(([key, box]) => [key, Number((distanceBetweenXZ(side, toArray(box)) * 1000).toFixed(1))])),
    plant: Object.fromEntries([["lounge", loungeBox], ["ottoman", ottomanBox], ["floorLamp", lampBox], ["window", windowBox], ["diningTable", diningTableBox]].map(([key, box]) => [key, Number((distanceBetweenXZ(plantBox, toArray(box)) * 1000).toFixed(1))])),
  };
  const tableMesh = batches.find(({ key }) => key === "window-side-table").group.children[0];
  // Sample an exposed part of the tabletop away from the mug and open book.
  const tableSupportSample = [tableX + 0.12, tableZ + 0.08];
  const tableSupportRay = new THREE.Raycaster(new THREE.Vector3(tableSupportSample[0], 1, tableSupportSample[1]), new THREE.Vector3(0, -1, 0), 0, 1);
  const measuredTableTopY = tableSupportRay.intersectObject(tableMesh, false).find(({ point }) => Math.abs(point.x - tableSupportSample[0]) < 0.01 && Math.abs(point.z - tableSupportSample[1]) < 0.01)?.point.y ?? null;
  const consoleWoodwork = scene.getObjectByName("room03-wall-art-and-media-woodwork");
  scene.updateMatrixWorld(true);
  const consoleSupportRay = new THREE.Raycaster(new THREE.Vector3(-0.53, 1, 3.50), new THREE.Vector3(0, -1, 0), 0, 1);
  const measuredConsoleTopY = consoleWoodwork ? consoleSupportRay.intersectObject(consoleWoodwork, false).find(({ point }) => Math.abs(point.x + 0.53) < 0.01 && Math.abs(point.z - 3.50) < 0.18)?.point.y ?? null : null;
  tableTopGeometry.computeBoundingBox(); cupBodyGeometry.computeBoundingBox(); openBookGeometry.computeBoundingBox(); potGeometry.computeBoundingBox();
  const furnitureFit = {
    sideTable: { topDiameterMm: Number((tableTopGeometry.boundingBox.max.x - tableTopGeometry.boundingBox.min.x).toFixed(3)) * 1000, heightMm: Number(((measuredTableTopY - fit["window-side-table"].bounds.min[1]) * 1000).toFixed(1)), footFloorGapMm: Number((fit["window-side-table"].bounds.min[1] * 1000).toFixed(1)), feet: legFeet.map(([x, y, z]) => [x, y, z]), tableTopY: measuredTableTopY, cupBaseGapMm: Number(((cupBodyGeometry.boundingBox.min.y - measuredTableTopY) * 1000).toFixed(1)), bookBaseGapMm: Number(((openBookGeometry.boundingBox.min.y - measuredTableTopY) * 1000).toFixed(1)), clearancesMm: clearances.sideTable },
    plant: { potDiameterMm: Number((potGeometry.boundingBox.max.x - potGeometry.boundingBox.min.x).toFixed(3)) * 1000, potHeightMm: Number(((potGeometry.boundingBox.max.y - potGeometry.boundingBox.min.y) * 1000).toFixed(1)), overallHeightMm: Number(((plantBox.max[1] - plantBox.min[1]) * 1000).toFixed(1)), footFloorGapMm: Number((plantBox.min[1] * 1000).toFixed(1)), clearancesMm: clearances.plant },
    console: { supportY: measuredConsoleTopY, supportGapMm: Number(((fit["tv-console-living-set"].bounds.min[1] - measuredConsoleTopY) * 1000).toFixed(1)), lowestItemY: Number(fit["tv-console-living-set"].bounds.min[1].toFixed(4)), highestItemY: Number(fit["tv-console-living-set"].bounds.max[1].toFixed(4)), screenFrameBottomY: 0.785 },
  };
  return { fit, furnitureFit, sideTableFeet: legFeet.map(([x, y, z]) => [x, y, z]), plantPosition: [plantX, 0.0005, plantZ], vertices: Object.values(fit).reduce((sum, value) => sum + value.vertices, 0) };
}

function buildRedPot(scene, m) {
  const placement = { x: 0.82, baseY: 0.9975, z: -2.02 };
  const redEnamel = m.red.clone();
  redEnamel.color.set("#9b211e"); redEnamel.roughness = 0.27; redEnamel.metalness = 0.035;
  const brushedSteel = m.steel.clone();
  brushedSteel.color.set("#92918c"); brushedSteel.roughness = 0.42; brushedSteel.metalness = 0.32;
  const pot = new THREE.Group();
  pot.name = "single-terracotta-pot"; pot.position.set(placement.x, placement.baseY, placement.z); pot.userData.category = "accent";
  const addPart = (name, geometry, material, { shadow = true } = {}) => {
    const mesh = new THREE.Mesh(geometry, material); mesh.name = name; mesh.userData.category = "accent";
    mesh.castShadow = shadow; mesh.receiveShadow = shadow; pot.add(mesh); return mesh;
  };
  const lathe = (name, profile, material, segments = 32) => addPart(name, new THREE.LatheGeometry(profile.map(([radius, y]) => new THREE.Vector2(radius, y)), segments), material);
  const bodyTop = 0.081;
  const body = lathe("terracotta-pot-body", [
    [0, 0], [0.084, 0], [0.091, 0.003], [0.097, 0.012], [0.108, 0.029], [0.117, 0.052], [0.12, 0.073], [0.118, bodyTop],
  ], redEnamel, 16);
  body.name = "single-terracotta-pot-body";
  body.userData.part = "body";
  // A shallow flared rim gives the lid a real bearing surface without a separate ring mesh.
  lathe("terracotta-pot-rim", [[0.114, 0.078], [0.12, 0.079], [0.121, 0.083], [0.121, 0.087], [0.116, 0.088]], redEnamel, 16);
  // The lid's stepped profile forms the rim and two concentric raised rings in one lathed mesh.
  const lid = lathe("terracotta-pot-lid", [
    [0.116, 0.083], [0.122, 0.085], [0.122, 0.089], [0.118, 0.091],
    [0.113, 0.094], [0.109, 0.097], [0.104, 0.099], [0.098, 0.100],
    [0.092, 0.098], [0.088, 0.100], [0.083, 0.102], [0.078, 0.103],
    [0.073, 0.101], [0.069, 0.103], [0.064, 0.104], [0, 0.104],
  ], redEnamel, 16);
  lid.userData.part = "lid";
  // Compact rectangular loop handles, short in plan and immediately below the lid edge.
  const handlePath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.116, 0.068, 0), new THREE.Vector3(0.149, 0.068, 0),
    new THREE.Vector3(0.153, 0.070, 0), new THREE.Vector3(0.153, 0.072, 0),
    new THREE.Vector3(0.149, 0.074, 0), new THREE.Vector3(0.116, 0.074, 0),
  ], true, "centripetal", 0.25);
  for (const side of [-1, 1]) {
    const handle = addPart(`terracotta-pot-handle-${side < 0 ? "left" : "right"}`, new THREE.TubeGeometry(handlePath, 24, 0.004, 6, true), redEnamel);
    if (side < 0) handle.rotation.y = Math.PI;
    handle.userData.part = side < 0 ? "left-handle" : "right-handle";
  }
  // A low turned mushroom knob in a separate finish; the full pot remains below 12 cm.
  lathe("terracotta-pot-knob", [[0, 0.103], [0.009, 0.103], [0.011, 0.107], [0.014, 0.111], [0.019, 0.113], [0.02, 0.116], [0.018, 0.119], [0.011, 0.120], [0, 0.120]], brushedSteel, 12);
  scene.add(pot);
}

// The dining pendant (Paul 2026-10-30, after a drama-set reference, drawn by Codex): three stacked translucent paper lenses, smallest on top, on a black
// stem and canopy, an original piece rather than a copy. It replaces the opal globe. The paper material keeps the name "warm-opal-glass", so every mood's
// globe glow still drives it. Two meshes: the paper tiers (one lathe each, merged) and the black hardware. The lowest tier hangs at y 1.80, above the 1.64 m eye.
const PENDANT_TIERS = Object.freeze({ x: 0, z: 0.15, canopyY: 2.46, rimYs: [2.08, 1.97, 1.86], radii: [0.185, 0.23, 0.27], peak: 0.035, depth: 0.06 });
function makeFibrePaperTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f4e8d0"; ctx.fillRect(0, 0, 256, 256);
  let seed = 11;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < 170; i++) {
    let x = random() * 256, y = random() * 256, angle = random() * Math.PI * 2;
    ctx.strokeStyle = `rgba(190, 142, 80, ${0.14 + random() * 0.22})`; ctx.lineWidth = 0.6 + random() * 0.9;
    ctx.beginPath(); ctx.moveTo(x, y);
    for (let k = 0; k < 5; k++) { angle += (random() - 0.5) * 1.1; x += Math.cos(angle) * (8 + random() * 14); y += Math.sin(angle) * (8 + random() * 14); ctx.lineTo(x, y); }
    ctx.stroke();
  }
  for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(255, 252, 240, ${0.06 + random() * 0.1})`; ctx.fillRect(random() * 256, random() * 256, 10 + random() * 30, 2 + random() * 5); }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 1);
  return texture;
}
function buildPendant(scene, m) {
  const { x, z, canopyY, rimYs, radii, peak, depth } = PENDANT_TIERS;
  const group = new THREE.Group();
  group.name = "room03-pendant-tiered";
  group.userData.category = "lighting";
  group.position.set(x, 0, z);
  const lens = (R, rimY) => {
    // Underside dish from the centre out to the sharp rim, then the shallow dome back to the centre.
    const points = [];
    for (let i = 0; i <= 9; i++) { const r = R * (i / 9); points.push(new THREE.Vector2(Math.max(r, 0.0001), rimY - depth * (1 - Math.pow(r / R, 1.8)))); }
    for (let i = 1; i <= 9; i++) { const r = R * (1 - i / 9); points.push(new THREE.Vector2(Math.max(r, 0.0001), rimY + peak * (1 - Math.pow(r / R, 2)))); }
    return new THREE.LatheGeometry(points, 28);
  };
  const paperGeometry = mergeGeometries(radii.map((R, i) => lens(R, rimYs[i])), false);
  const texture = makeFibrePaperTexture();
  const paperMaterial = new THREE.MeshStandardMaterial({ name: "warm-opal-glass", color: 0xf2e6cd, roughness: 0.92, side: THREE.DoubleSide, map: texture, emissive: 0xffd9a0, emissiveMap: texture, emissiveIntensity: m.opal.emissiveIntensity });
  const paper = new THREE.Mesh(paperGeometry, paperMaterial);
  paper.name = "pendant-paper-tiers"; paper.userData.category = "lighting"; paper.userData.furnitureAsset = "pendant";
  paper.castShadow = false; paper.receiveShadow = false;
  group.add(paper);
  // Black hardware: canopy disc, the stem down to the top tier, and a small spacer between each pair of tiers.
  const hardware = [];
  const cylinder = (radius, height, y) => { const g = new THREE.CylinderGeometry(radius, radius, height, 12); g.translate(0, y, 0); hardware.push(g); };
  cylinder(0.075, 0.022, canopyY);
  const stemTop = canopyY - 0.011, stemBottom = rimYs[0] + peak;
  cylinder(0.006, stemTop - stemBottom, (stemTop + stemBottom) / 2);
  for (let i = 0; i < 2; i++) { const low = rimYs[i] - depth, high = rimYs[i + 1] + peak; cylinder(0.011, Math.max(0.012, low - high + 0.012), (low + high) / 2); }
  const hardwareGeometry = mergeGeometries(hardware, false);
  hardware.forEach((g) => g.dispose());
  const black = new THREE.Mesh(hardwareGeometry, m.black);
  black.name = "pendant-hardware"; black.userData.category = "lighting";
  group.add(black);
  scene.add(group);
  const bulb = new THREE.PointLight(0xffd39a, 0, 7, 2); bulb.position.set(x, rimYs[1], z); bulb.name = "pendant-light-source"; bulb.castShadow = false; scene.add(bulb);
  return bulb;
}

function loadFurniture(scene, materials) {
  const loader = new GLTFLoader();
  const urls = {
    table: new URL("./models/dining-table-v2.glb", import.meta.url).href,
  };
  const status = { table: "fallback", chair: "procedural-v2", pendant: "tiered-paper" }; // the pendant is built in code (buildPendant), no model to load
  let tabletopEdgeHeightDeviation = null;
  const removeCategory = (category) => {
    for (const object of [...scene.children]) {
      if (object.userData.category === category || object.name === `merged-${category}`) {
        scene.remove(object);
        object.traverse((child) => { if (child.geometry) child.geometry.dispose(); });
      }
    }
  };
  const loadOne = async (kind) => {
    try {
      const gltf = await loader.loadAsync(urls[kind]);
      const model = gltf.scene;
      model.traverse((object) => {
        if (!object.isMesh) return;
        object.castShadow = true;
        object.receiveShadow = true;
        object.userData.category = kind === "table" ? "dining-table" : "lighting";
        object.userData.furnitureAsset = kind;
      });
      if (kind === "table") {
        removeCategory("dining-table");
        model.position.set(0, 0, 0.5);
        const softenedMaps = new Set();
        model.traverse((object) => {
          if (!object.isMesh) return;
          const list = Array.isArray(object.material) ? object.material : [object.material];
          for (const material of list) {
            const map = material?.map;
            if (!map?.image || softenedMaps.has(map)) continue;
            const image = map.image;
            const canvas = document.createElement("canvas");
            canvas.width = image.naturalWidth || image.width;
            canvas.height = image.naturalHeight || image.height;
            const context = canvas.getContext("2d");
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            context.fillStyle = "rgba(216, 197, 164, 0.14)";
            context.fillRect(0, 0, canvas.width, canvas.height);
            map.image = canvas;
            map.needsUpdate = true;
            material.roughness = Math.max(material.roughness ?? 0.66, 0.72);
            material.needsUpdate = true;
            softenedMaps.add(map);
          }
        });
        const edgeHeights = [];
        model.traverse((object) => {
          if (!object.isMesh || !object.geometry?.attributes?.position) return;
          const positions = object.geometry.attributes.position;
          for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
            if (y >= 0.73 && (Math.abs(x) >= 0.85 || Math.abs(z) >= 0.36)) edgeHeights.push(y);
          }
        });
        tabletopEdgeHeightDeviation = edgeHeights.length ? Math.max(...edgeHeights) - Math.min(...edgeHeights) : null;
      }
      model.name = `room03-${kind}-glb`;
      scene.add(model);
      status[kind] = "glb";
    } catch (error) {
      status[kind] = "fallback";
      console.warn(`Room 03 ${kind} GLB failed; keeping procedural fallback.`, error);
    }
  };
  return { status, ready: loadOne("table"), urls, get tabletopEdgeHeightDeviation() { return tabletopEdgeHeightDeviation; } };
}

function assemble(b, scene) {
  for (const [key, bucket] of b) {
    if (bucket.existing) { scene.add(bucket.existing); continue; }
    if (bucket.meshes?.length) { for (const mesh of bucket.meshes) scene.add(mesh); }
    if (!bucket.geometries.length) continue;
    const geometry = mergeGeometries(bucket.geometries, false);
    for (const part of bucket.geometries) part.dispose();
    if (!geometry) throw new Error(`Could not merge static geometry: ${key}`);
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, bucket.material);
    mesh.name = `merged-${bucket.category}`;
    mesh.userData.category = bucket.category;
    mesh.castShadow = !["rug", "glass-panels", "yard", "light-fixtures"].includes(bucket.category);
    mesh.receiveShadow = true;
    scene.add(mesh);
  }
}

function addHousePlaque(scene, onChange) {
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff, roughness: 0.7, transparent: true, alphaTest: 0.5, opacity: 0,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(HOUSE_PLAQUE.width, HOUSE_PLAQUE.height), material);
  mesh.name = "house-plaque";
  mesh.position.set(...HOUSE_PLAQUE.position);
  mesh.rotation.y = Math.PI;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.visible = false;
  mesh.userData.plaqueStatus = "pending";
  scene.add(mesh);
  new THREE.TextureLoader().load(new URL("../art/wall-plaque-text-v1.webp", import.meta.url).href, (texture) => {
    const image = texture.image;
    if (!image || !(image.naturalWidth || image.width)) {
      mesh.userData.plaqueStatus = "failed";
      onChange();
      return;
    }
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    material.map = texture;
    material.opacity = 1;
    material.needsUpdate = true;
    mesh.visible = true;
    mesh.userData.plaqueStatus = "loaded";
    onChange();
  }, undefined, () => {
    material.map = null;
    material.opacity = 0;
    mesh.visible = false;
    mesh.userData.plaqueStatus = "failed";
    onChange();
  });
  return mesh;
}

function addRoom03Lamps(scene, materials) {
  // Three fixtures, two meshes each. Coordinates come from the measured console and redwood frame,
  // not from the proposal's first guess. Golden and night leave the new point lights at intensity 0.
  const paint = (geometry, hex) => {
    const color = new THREE.Color(hex);
    const colors = new Float32Array(geometry.attributes.position.count * 3);
    for (let i = 0; i < geometry.attributes.position.count; i++) {
      colors[i * 3] = color.r; colors[i * 3 + 1] = color.g; colors[i * 3 + 2] = color.b;
    }
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  };
  const place = (geometry, position, rotation) => {
    geometry.applyMatrix4(new THREE.Matrix4().compose(
      new THREE.Vector3(...position),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...(rotation || [0, 0, 0]))),
      new THREE.Vector3(1, 1, 1),
    ));
    return geometry;
  };
  const mergeParts = (parts) => {
    const merged = mergeGeometries(parts, false);
    parts.forEach((part) => part.dispose());
    if (!merged) throw new Error("Could not merge a Room 03 lamp");
    merged.computeVertexNormals();
    return merged;
  };
  const addMesh = (parent, name, geometry, material) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.userData.category = "lighting";
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const hardwareMaterial = () => {
    const material = materials.black.clone();
    material.vertexColors = true;
    material.roughness = 0.45;
    material.metalness = 0.25;
    return material;
  };
  // The gallery bar over the redwood print is brass, like Room 01's picture lights; the shared black hardware would swallow the vertex colour.
  const brassMaterial = () => {
    const material = materials.black.clone();
    material.color.setHex(0xffffff);
    material.vertexColors = true;
    material.roughness = 0.36;
    material.metalness = 0.72;
    return material;
  };
  const shadeMaterial = (emissive) => {
    const material = materials.opal.clone();
    material.color.setHex(0xfff4e4);
    material.emissive.setHex(emissive);
    material.emissiveIntensity = 0;
    material.roughness = 0.35;
    material.metalness = 0;
    return material;
  };
  const paperShadeMaterial = (emissive) => {
    const material = shadeMaterial(emissive);
    material.color.setHex(0xffffff);
    material.name = "paper-floor-lamp-shade";
    material.roughness = 0.92;
    material.side = THREE.DoubleSide;
    material.vertexColors = true;
    material.map = makeFibrePaperTexture();
    material.emissiveMap = material.map;
    return material;
  };
  const floorPaperShadeMaterial = (emissive) => {
    const material = paperShadeMaterial(emissive);
    material.transparent = true;
    material.opacity = 0.86;
    material.depthWrite = false;
    return material;
  };

  // Paul 2026-10-29: the light must read as coming from the middle of the bulb. A lit wall beside a dull globe looks like the light is
  // somewhere else, so each globe also gets a soft additive halo centred on it, and its emissive follows how strong the light is.
  const haloTexture = (() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const context = canvas.getContext("2d");
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "rgba(255,236,200,1)");
    gradient.addColorStop(0.18, "rgba(255,214,150,0.65)");
    gradient.addColorStop(0.5, "rgba(255,190,120,0.18)");
    gradient.addColorStop(1, "rgba(255,180,110,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  })();
  const addHalo = (name, position, size) => {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTexture, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    sprite.name = name;
    sprite.position.set(...position);
    sprite.scale.set(size, size, 1);
    sprite.visible = false;
    sprite.renderOrder = 4;
    sprite.raycast = () => {}; // a halo is light, not an object: it must never block a ray (Sprite.raycast also needs raycaster.camera, which review rays do not set)
    scene.add(sprite);
    return sprite;
  };

  const floor = new THREE.Group();
  floor.name = "floor-reading-lamp";
  floor.position.set(-1.93, 0, 1.68);
  const floorShade = floorPaperShadeMaterial(0xffc27a);
  const segment = (from, to, topRadius, bottomRadius, radialSegments = 8) => {
    const start = new THREE.Vector3(...from), end = new THREE.Vector3(...to);
    const direction = end.clone().sub(start);
    const geometry = new THREE.CylinderGeometry(topRadius, bottomRadius, direction.length(), radialSegments, 1);
    geometry.applyMatrix4(new THREE.Matrix4().compose(
      start.add(end).multiplyScalar(0.5),
      new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()),
      new THREE.Vector3(1, 1, 1),
    ));
    return geometry;
  };
  const floorHardwareMesh = addMesh(floor, "floor-reading-lamp-hardware", mergeParts([
    // Paul 2026-11-19: the stem and the tripod read as one lamp now. The stem used to run on 11.5 cm below the hub to a loose end 4.5 cm above the floor, and
    // the legs started just outside the hub; now the stem ends inside the hub, a short collar sleeves it where it enters, and the legs start 15 mm inside the hub.
    paint(place(new THREE.CylinderGeometry(0.012, 0.012, 1.035, 8), [0, 0.6775, 0]), 0x2a2622),
    paint(place(new THREE.CylinderGeometry(0.018, 0.018, 0.016, 10), [0, 0.19, 0]), 0x2a2622),
    ...[0, 1, 2].map((index) => {
      const angle = index * Math.PI * 2 / 3 + Math.PI / 6;
      return paint(segment(
        [Math.cos(angle) * 0.03, 0.172, Math.sin(angle) * 0.03],
        [Math.cos(angle) * 0.15, 0.012, Math.sin(angle) * 0.15],
        0.009, 0.007, 8,
      ), 0x2a2622);
    }),
    paint(place(new THREE.CylinderGeometry(0.038, 0.052, 0.025, 10), [0, 0.17, 0]), 0x2a2622),
  ]), hardwareMaterial());
  floorHardwareMesh.castShadow = false;
  const paperRings = [
    [0.145, 1.10], [0.153, 1.18], [0.16, 1.27], [0.153, 1.36], [0.145, 1.44],
  ].map(([radius, y]) => paint(place(new THREE.TorusGeometry(radius, 0.003, 4, 24), [0, y, 0], [Math.PI / 2, 0, 0]), 0xe4d3b3));
  const lanternProfile = [
    [0.137, -0.23], [0.15, -0.20], [0.158, -0.13], [0.16, -0.05],
    [0.16, 0.05], [0.158, 0.13], [0.15, 0.20], [0.137, 0.23],
  ].map(([radius, y]) => new THREE.Vector2(radius, y));
  const lanternPaper = paint(new THREE.LatheGeometry(lanternProfile, 24), 0xf2e6cd);
  lanternPaper.translate(0, 1.27, 0);
  const floorShadeMesh = addMesh(floor, "floor-reading-lamp-shade", mergeParts([lanternPaper, ...paperRings]), floorShade);
  floorShadeMesh.castShadow = false;
  scene.add(floor);
  const floorLight = new THREE.PointLight(0xffc27a, 0, 6, 2);
  floorLight.name = "floor-lamp-light";
  floorLight.castShadow = false;
  floorLight.position.set(-1.93, 1.27, 1.68);
  scene.add(floorLight);
  const floorHalo = addHalo("floor-lamp-halo", [-1.93, 1.27, 1.68], 0.62);

  // Left end of the console top (x -1.30 to 0, top y 0.575). The screen frame occupies x -1.14 to -0.16,
  // so the 15 cm globe stays at x -1.295 to -1.145.
  const table = new THREE.Group();
  table.name = "console-table-lamp";
  table.position.set(-1.22, 0.575, 3.52);
  const tableShade = shadeMaterial(0xffcf9e);
  addMesh(table, "console-table-lamp-hardware", mergeParts([
    paint(place(new THREE.CylinderGeometry(0.055, 0.07, 0.16, 14), [0, 0.08, 0]), 0xe4d2b4),
    paint(place(new THREE.TorusGeometry(0.04, 0.006, 6, 12), [0, 0.17, 0], [Math.PI / 2, 0, 0]), 0x8a5a32),
    paint(place(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 8), [0, 0.22, 0]), 0x8a5a32),
  ]), hardwareMaterial());
  addMesh(table, "console-table-lamp-shade", mergeParts([
    place(new THREE.SphereGeometry(0.075, 14, 10), [0, 0.325, 0]),
  ]), tableShade);
  scene.add(table);
  const tableLight = new THREE.PointLight(0xffcf9e, 0, 4, 2);
  tableLight.name = "table-lamp-light";
  tableLight.castShadow = false;
  tableLight.position.set(-1.22, 0.90, 3.52);
  scene.add(tableLight);
  const tableHalo = addHalo("table-lamp-halo", [-1.22, 0.90, 3.52], 0.46);

  // Above the redwood frame (top y ≈ 2.385) and in front of the end wall (face z ≈ 3.74).
  // The entry-hall band is at z ≈ 2.4; this fixture stays on the end wall.
  const picture = new THREE.Group();
  picture.name = "redwood-picture-light";
  picture.position.set(0.86, 2.50, 3.66);
  const pictureShade = shadeMaterial(0xffe1b0);
  addMesh(picture, "redwood-picture-light-bar", mergeParts([
    paint(place(new THREE.BoxGeometry(0.50, 0.028, 0.04), [0, 0.02, 0]), 0xb08a4e),
    paint(place(new THREE.BoxGeometry(0.02, 0.04, 0.03), [-0.22, -0.01, 0.01]), 0xb08a4e),
    paint(place(new THREE.BoxGeometry(0.02, 0.04, 0.03), [0.22, -0.01, 0.01]), 0xb08a4e),
  ]), brassMaterial());
  addMesh(picture, "redwood-picture-light-diffuser", mergeParts([
    place(new THREE.BoxGeometry(0.44, 0.02, 0.05), [0, -0.006, 0.012]),
  ]), pictureShade);
  scene.add(picture);

  const screenCoolLight = new THREE.PointLight(0xcdd6f0, 0, 5, 2);
  screenCoolLight.name = "screen-cool-light";
  screenCoolLight.castShadow = false;
  screenCoolLight.position.set(-0.65, 1.06, 3.40);
  scene.add(screenCoolLight);

  return { floorLight, tableLight, screenCoolLight, pictureShade, floorShade, tableShade, floorHalo, tableHalo };
}

function buildRoom03WindowCurtains(scene, materials) {
  const positions = [], uvs = [], indices = [];
  const columns = 12, rows = 18;
  for (const side of [-1, 1]) {
    const offset = positions.length / 3;
    for (let row = 0; row <= rows; row++) {
      const v = row / rows;
      for (let column = 0; column <= columns; column++) {
        const u = column / columns;
        const pleat = Math.cos(u * Math.PI * 8);
        const hem = Math.sin(u * Math.PI * 8) * 0.006;
        positions.push(
          -2.72 + pleat * 0.027,
          2.305 - v * 2.297 + hem * v,
          side * 1.84 + (u - 0.5) * 0.38 + Math.sin(u * Math.PI * 8) * 0.012,
        );
        uvs.push(u * 2.5, v * 3.2);
      }
    }
    const stride = columns + 1;
    for (let row = 0; row < rows; row++) for (let column = 0; column < columns; column++) {
      const a = offset + row * stride + column, b = a + stride;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const curtainWeave = makeLinenTexture();
  curtainWeave.repeat.set(2, 3);
  curtainWeave.needsUpdate = true;
  const material = new THREE.MeshStandardMaterial({
    name: "room03-curtain-linen",
    color: 0xcdbfa8,
    roughness: 0.96,
    map: curtainWeave,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "room03-window-curtains";
  mesh.userData.category = "soft-goods";
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return {
    mesh,
    material,
    info: () => {
      const bounds = new THREE.Box3().setFromObject(mesh);
      return {
        vertices: geometry.attributes.position.count,
        meshes: 1,
        bounds: { min: bounds.min.toArray(), max: bounds.max.toArray(), size: bounds.getSize(new THREE.Vector3()).toArray() },
        panels: [-1, 1].map((side) => ({ side: side < 0 ? "left" : "right", z: [side * 2.03, side * 1.65].sort((a, b) => a - b) })),
        floorHemGapMm: Number((bounds.min.y * 1000).toFixed(1)),
        color: `#${material.color.getHexString()}`,
      };
    },
  };
}

// A small smart-kitchen panel on the backsplash above the hob (Paul 2026-10-30: the hob area should feel like 2026 Bay Area: a temperature
// control or simple dashboard with a few numbers). One plane with a canvas-drawn display and a painted dark bezel (a separate bezel mesh cost a second draw call on phones); it is unlit (toneMapped off) so
// it reads in every mood, and it is drawn once, so nothing runs per frame. Numbers are decor, not a claim about a real appliance.
function buildWokOliveOil(scene, paperNapkinPack) {
  const pack = new THREE.Box3().setFromObject(paperNapkinPack.mesh);
  const x = pack.min.x - 0.034 - 0.012, z = (pack.min.z + pack.max.z) / 2;
  const counter = scene.getObjectByName("merged-wok-counter");
  const ray = new THREE.Raycaster(new THREE.Vector3(x, 1.3, z), new THREE.Vector3(0, -1, 0), 0, 1);
  const support = counter && ray.intersectObject(counter, true)[0];
  if (!support) throw new Error("Cannot measure the wok counter under the olive oil bottle");
  const parts = [];
  const add = (geometry, hex) => {
    const position = geometry.attributes.position;
    const colors = new Float32Array(position.count * 3);
    const color = new THREE.Color();
    for (let i = 0; i < position.count; i++) {
      const y = position.getY(i), x0 = position.getX(i);
      let tint = hex;
      if (y >= 0.215) tint = 0x292b25; // dark screw cap
      else if (y >= 0.198 && y < 0.215) tint = 0x786b44; // narrow olive-gold neck ring
      else if (y >= 0.085 && y <= 0.125) tint = 0xb7a979; // blank paper label band
      else if (Math.abs(x0) > 0.027 && Math.abs(x0) < 0.033 && y > 0.025 && y < 0.19) tint = 0x718044; // restrained glass highlight
      color.setHex(tint).toArray(colors, i * 3);
    }
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.translate(x, support.point.y - 0.001, z);
    parts.push(geometry);
  };
  const body = new THREE.LatheGeometry([
    [0, 0], [0.026, 0], [0.032, 0.004], [0.034, 0.012], [0.034, 0.125],
    [0.031, 0.15], [0.018, 0.174], [0.013, 0.18], [0.013, 0.205],
    [0.014, 0.209], [0.014, 0.215], [0, 0.215],
  ].map(([radius, y]) => new THREE.Vector2(radius, y)), 20);
  add(body, 0x263b2b);
  const cap = new THREE.CylinderGeometry(0.015, 0.015, 0.029, 16);
  cap.translate(0, 0.2295, 0); add(cap, 0x292b25);
  const capRim = new THREE.TorusGeometry(0.0145, 0.0015, 4, 16);
  capRim.rotateX(Math.PI / 2); capRim.translate(0, 0.218, 0); add(capRim, 0x81734a);
  const geometry = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose());
  geometry.computeVertexNormals();
  const material = new THREE.MeshPhysicalMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.24, metalness: 0, clearcoat: 0.55, clearcoatRoughness: 0.2 });
  material.name = "unbranded-dark-green-olive-oil-glass";
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "prop-wok-olive-oil"; mesh.userData.category = "household-props"; mesh.userData.propKey = "wok-olive-oil";
  mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh); mesh.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(mesh);
  return {
    mesh, vertices: geometry.attributes.position.count, material: { roughness: material.roughness, clearcoat: material.clearcoat, transparent: material.transparent },
    bounds: { min: bounds.min.toArray(), max: bounds.max.toArray(), size: bounds.getSize(new THREE.Vector3()).toArray() },
    supportY: Number(support.point.y.toFixed(4)), gapMm: Number(((bounds.min.y - support.point.y) * 1000).toFixed(2)),
    embedMm: Number((Math.max(0, support.point.y - bounds.min.y) * 1000).toFixed(2)),
  };
}

// One brass rail, four useful US-style everyday tools, and four small seasoning jars. Geometry stays batched into one vertex-colour mesh.
function buildRoom03WokTools(scene) {
  const WALL_X = 2.94, X = WALL_X - 0.034, RAIL_Y = 1.36, Z0 = 2.18, SHELF_TOP = 1.4325, SHELF_X = WALL_X - 0.085;
  const parts = [];
  const toolRecords = [];
  let activeBounds = null;
  const jarRecords = [];
  const add = (geometry, hex, position, rotation = [0, 0, 0], scale = [1, 1, 1]) => {
    geometry.applyMatrix4(new THREE.Matrix4().compose(
      new THREE.Vector3(...position), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)), new THREE.Vector3(...scale),
    ));
    const colour = new THREE.Color(hex), count = geometry.attributes.position.count, colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) colour.toArray(colors, i * 3);
    geometry.deleteAttribute("uv");
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    if (activeBounds) {
      geometry.computeBoundingBox();
      const { min, max } = geometry.boundingBox;
      for (let axis = 0; axis < 3; axis++) {
        activeBounds.min[axis] = Math.min(activeBounds.min[axis], min.toArray()[axis]);
        activeBounds.max[axis] = Math.max(activeBounds.max[axis], max.toArray()[axis]);
      }
    }
    parts.push(geometry);
  };
  const lathe = (profile, segments) => new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segments);
  const BRASS = 0xb08d4e, STEEL = 0xc3c5c2, DARK_STEEL = 0x7d807d, WALNUT = 0x6b4a32, OAK = 0xb88b5b, NYLON = 0x1d1e20, GLASS = 0xd9e2df, LID = 0x222326;
  // American-style utensil rail (Paul 2026-11-04: "像美國人會用的那種"): brushed stainless bar with round end caps on two wall posts,
  // five tools on S-hooks, each with a hang hole: walnut spoon, black slotted turner, balloon whisk, stainless ladle, locking tongs.
  add(new THREE.CylinderGeometry(0.0065, 0.0065, 0.46, 14), STEEL, [X, RAIL_Y, Z0], [Math.PI / 2, 0, 0]);
  for (const dz of [-0.23, 0.23]) add(lathe([[0, -0.004], [0.0095, -0.004], [0.0105, 0], [0.0095, 0.004], [0, 0.006]], 12), STEEL, [X, RAIL_Y, Z0 + dz], [Math.PI / 2, 0, 0]);
  for (const dz of [-0.19, 0.19]) {
    add(new THREE.CylinderGeometry(0.011, 0.011, 0.004, 14), STEEL, [WALL_X - 0.002, RAIL_Y, Z0 + dz], [0, 0, Math.PI / 2]);
    add(new THREE.CylinderGeometry(0.0045, 0.0045, WALL_X - X - 0.003, 8), STEEL, [(WALL_X + X) / 2 - 0.0015, RAIL_Y, Z0 + dz], [0, 0, Math.PI / 2]);
  }
  const TOOLS = [
    { name: "wood-spoon", dz: -0.16 },
    { name: "slotted-turner", dz: -0.09 },
    { name: "balloon-whisk", dz: -0.02 },
    { name: "stainless-ladle", dz: 0.05 },
    { name: "locking-tongs", dz: 0.12 },
  ];
  const includeInRecord = (record) => ({ min: [...record.min], max: [...record.max] });
  // Handle with a rounded end and a hang hole near its top; profile runs from y=0 (bottom) up to `len`.
  const handle = (z, topY, len, rBottom, rTop, hex) => {
    add(lathe([[0, 0], [rBottom, 0.002], [rBottom * 1.05, len * 0.35], [rTop, len - 0.012], [rTop * 0.75, len - 0.003], [0, len]], 12), hex, [X, topY - len, z]);
    add(new THREE.TorusGeometry(0.0045, 0.0012, 5, 12), DARK_STEEL, [X, topY - 0.009, z], [0, Math.PI / 2, 0], [1, 1, 1]);
  };
  for (const { name, dz } of TOOLS) {
    activeBounds = { name, min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
    const z = Z0 + dz;
    // S-hook: upper half-loop over the rail, lower half-loop through the hang hole.
    add(new THREE.TorusGeometry(0.0085, 0.0013, 5, 12, Math.PI), STEEL, [X, RAIL_Y, z], [0, Math.PI / 2, 0]);
    add(new THREE.TorusGeometry(0.006, 0.0013, 5, 12, Math.PI), STEEL, [X, RAIL_Y - 0.0145, z], [0, Math.PI / 2, Math.PI]);
    const top = RAIL_Y - 0.012;
    if (name === "wood-spoon") {
      handle(z, top, 0.22, 0.0055, 0.0085, WALNUT);
      const neckY = top - 0.22;
      add(new THREE.CylinderGeometry(0.0055, 0.009, 0.03, 10), WALNUT, [X, neckY - 0.012, z]);
      const bowl = new THREE.SphereGeometry(0.5, 16, 10);
      const pos = bowl.attributes.position;
      for (let i = 0; i < pos.count; i++) if (pos.getX(i) < 0) pos.setX(i, pos.getX(i) * 0.35); // shallow scooped front
      add(bowl, WALNUT, [X, neckY - 0.058, z], [0, 0, 0], [0.018, 0.075, 0.05]);
    } else if (name === "slotted-turner") {
      handle(z, top, 0.165, 0.0065, 0.0085, NYLON);
      add(new THREE.CylinderGeometry(0.0035, 0.0035, 0.004, 10), STEEL, [X, top - 0.05, z], [0, 0, Math.PI / 2]); // rivet
      add(new THREE.CylinderGeometry(0.0045, 0.006, 0.045, 8), NYLON, [X, top - 0.187, z], [0, 0, 0.12]);
      const bladeY = top - 0.255;
      add(new THREE.BoxGeometry(0.0035, 0.10, 0.068), NYLON, [X - 0.003, bladeY, z], [0, 0, 0.12]);
      add(new THREE.CylinderGeometry(0.034, 0.034, 0.0035, 20, 1, false, Math.PI / 2, Math.PI), NYLON, [X - 0.009, bladeY - 0.05, z], [0, 0, Math.PI / 2 + 0.12]);
      for (const sz of [-0.02, -0.0067, 0.0067, 0.02]) add(new THREE.BoxGeometry(0.0045, 0.064, 0.0045), 0x0b0b0c, [X - 0.0062, bladeY - 0.005, z + sz], [0, 0, 0.12]);
    } else if (name === "balloon-whisk") {
      handle(z, top, 0.13, 0.009, 0.0095, STEEL);
      add(new THREE.CylinderGeometry(0.0095, 0.0075, 0.012, 12), DARK_STEEL, [X, top - 0.136, z]); // wire collar
      const cy = top - 0.142 - 0.085;
      for (let k = 0; k < 6; k++) add(new THREE.TorusGeometry(0.085, 0.0011, 4, 28), STEEL, [X, cy, z], [0, (k * Math.PI) / 6, 0], [0.34, 1, 0.34]);
    } else if (name === "stainless-ladle") {
      handle(z, top, 0.07, 0.0085, 0.009, STEEL);
      add(new THREE.CylinderGeometry(0.003, 0.0035, 0.20, 8), STEEL, [X, top - 0.07 - 0.10, z]);
      const cupY = top - 0.27 - 0.03;
      add(new THREE.SphereGeometry(0.038, 18, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), STEEL, [X - 0.012, cupY + 0.03, z], [0, 0, -0.5]);
      add(new THREE.TorusGeometry(0.038, 0.0018, 5, 24), DARK_STEEL, [X - 0.012, cupY + 0.03, z], [Math.PI / 2, 0, -0.5]);
    } else {
      // Locking tongs: pull ring, a hinged pair of stainless arms with nylon-free scalloped tips.
      add(new THREE.TorusGeometry(0.009, 0.0016, 6, 14), STEEL, [X, top - 0.004, z], [0, Math.PI / 2, 0]);
      add(new THREE.CylinderGeometry(0.0085, 0.0085, 0.018, 12), DARK_STEEL, [X, top - 0.02, z]);
      for (const side of [-1, 1]) {
        add(new THREE.BoxGeometry(0.004, 0.25, 0.010), STEEL, [X, top - 0.155, z + side * 0.009], [side * 0.03, 0, 0]);
        add(new THREE.BoxGeometry(0.0045, 0.035, 0.022), STEEL, [X, top - 0.29, z + side * 0.015], [side * 0.03, 0, 0]);
        for (const ty of [-0.008, 0.004]) add(new THREE.CylinderGeometry(0.0022, 0.0022, 0.022, 6), DARK_STEEL, [X, top - 0.29 + ty, z + side * 0.017], [Math.PI / 2, 0, 0]);
      }
    }
    toolRecords.push({ name, bounds: includeInRecord(activeBounds) });
    activeBounds = null;
  }
  // Shelf: tall black-capped salt and pepper grinders plus four glass spice jars with black screw lids and coloured fills (no labels or logos).
  const shelfItem = (z, record) => { activeBounds = { name: "seasoning", min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] }; record(); jarRecords.push({ bounds: includeInRecord(activeBounds) }); activeBounds = null; };
  const grinder = (z, bodyHex) => shelfItem(z, () => {
    add(lathe([[0, 0], [0.019, 0], [0.020, 0.004], [0.016, 0.03], [0.0175, 0.075], [0.019, 0.085], [0, 0.085]], 18), bodyHex, [SHELF_X, SHELF_TOP, z]);
    add(new THREE.CylinderGeometry(0.0185, 0.0185, 0.003, 18), DARK_STEEL, [SHELF_X, SHELF_TOP + 0.0865, z]);
    add(lathe([[0, 0], [0.018, 0], [0.018, 0.012], [0.014, 0.024], [0, 0.026]], 18), LID, [SHELF_X, SHELF_TOP + 0.088, z]);
    add(new THREE.SphereGeometry(0.004, 8, 5), DARK_STEEL, [SHELF_X, SHELF_TOP + 0.115, z]);
  });
  const spiceJar = (z, fillHex, fill) => shelfItem(z, () => {
    // Spice colour fills the lower glass; the clear shoulder above it reads as pale glass.
    add(lathe([[0, 0], [0.0165, 0], [0.0175, 0.003], [0.0175, fill]], 16), fillHex, [SHELF_X, SHELF_TOP, z]);
    add(lathe([[0.0175, 0], [0.0175, 0.056 - fill], [0.014, 0.062 - fill], [0.0135, 0.066 - fill], [0, 0.066 - fill]], 16), GLASS, [SHELF_X, SHELF_TOP + fill, z]);
    add(lathe([[0, 0], [0.0155, 0], [0.0158, 0.016], [0, 0.017]], 16), LID, [SHELF_X, SHELF_TOP + 0.064, z]);
  });
  grinder(2.012, 0xe8e4da);
  grinder(2.058, 0x2b2c2f);
  spiceJar(2.112, 0xb2402c, 0.040); // paprika
  spiceJar(2.158, 0x6f7a46, 0.034); // oregano
  spiceJar(2.204, 0xc79a3c, 0.044); // cumin
  spiceJar(2.250, 0xd8c7a4, 0.030); // garlic powder
  const geometry = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose());
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.55, metalness: 0.12 }));
  mesh.name = "room03-wok-tools";
  mesh.userData.category = "side-kitchen";
  mesh.castShadow = true; mesh.receiveShadow = true;
  scene.add(mesh);
  mesh.updateMatrixWorld(true);
  return {
    vertices: geometry.attributes.position.count, mesh,
    bounds: () => { scene.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(mesh); return { min: box.min.toArray(), max: box.max.toArray() }; },
    utensils: toolRecords, spiceJars: jarRecords,
  };
}

// Two small farmers-market touches on the kitchen counter (GrokBot and ChatGPT 2026-10-31: the counter could look more lived in, but only a little):
// a round oak board with a scored sourdough boule in the free stretch between the coffee maker and the hob, and a bowl of apples and one orange at the
// free right end. One merged vertex-colour mesh; every piece stands on the counter top (0.955).
function buildRoom03CounterFresh(scene) {
  const TOP = 0.955;
  const parts = [];
  const add = (geometry, hex, position, rotation = [0, 0, 0], scale = [1, 1, 1], local = null, localRotation = [0, 0, 0]) => {
    if (local) geometry.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...local), new THREE.Quaternion().setFromEuler(new THREE.Euler(...localRotation)), new THREE.Vector3(1, 1, 1))); // a part placed inside a rotated group
    geometry.applyMatrix4(new THREE.Matrix4().compose(
      new THREE.Vector3(...position), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)), new THREE.Vector3(...scale),
    ));
    const colour = new THREE.Color(hex), count = geometry.attributes.position.count, colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      if (hex === 0xa96e38) { const v = geometry.attributes.position; const grain = Math.sin(v.getX(i) * 91) * Math.cos(v.getZ(i) * 79); colour.setHex(hex).multiplyScalar(0.95 + grain * 0.05); }
      colour.toArray(colors, i * 3);
    }
    geometry.deleteAttribute("uv");
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    parts.push(geometry);
  };
  const lathe = (profile, segments) => new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segments);
  // Board and boule at x 0.04, z -2.06.
  const BX = 0.04, BZ = -2.06, BOARD_H = 0.02;
  add(new THREE.CylinderGeometry(0.135, 0.135, BOARD_H, 28), 0xb88b5b, [BX, TOP + BOARD_H / 2, BZ]);
  add(new THREE.BoxGeometry(0.05, BOARD_H, 0.03), 0xb88b5b, [BX - 0.155, TOP + BOARD_H / 2, BZ]);
  add(new THREE.TorusGeometry(0.008, 0.0035, 5, 10), 0x8a6842, [BX - 0.185, TOP + BOARD_H / 2, BZ], [Math.PI / 2, 0, 0]);
  // Paul 2026-11-22 (reference: a golden quick bread in a metal loaf pan, the top split by one long crack): the batard is now a banana-bread style loaf in a dark steel loaf pan, a domed golden crust with
  // a lengthwise split showing the pale crumb; a rectangular slice has been cut and lies in front.
  const bread = { length: 0.235, width: 0.105, height: 0.068 }, panY = TOP + BOARD_H - 0.002, YAW = 0.30;
  const pan = (g, hex, x, y, z, rot = [0, 0, 0]) => add(g, hex, [BX, panY, BZ], [0, YAW, 0], [1, 1, 1], [x, y, z], rot);
  // the pan: a bottom, four slightly flared walls, and a flat rolled rim
  pan(new THREE.BoxGeometry(bread.length - 0.02, 0.004, bread.width - 0.014), 0x2e3032, 0, 0.002, 0);
  for (const s of [-1, 1]) {
    pan(new THREE.BoxGeometry(bread.length, bread.height, 0.004), 0x4a4d50, 0, bread.height / 2, s * (bread.width / 2 - 0.004), [s * 0.07, 0, 0]);
    pan(new THREE.BoxGeometry(0.004, bread.height, bread.width), 0x4a4d50, s * (bread.length / 2 - 0.002), bread.height / 2, 0, [0, 0, -s * 0.06]);
    pan(new THREE.BoxGeometry(bread.length + 0.018, 0.003, 0.012), 0x686b6e, 0, bread.height, s * (bread.width / 2 + 0.001));
    pan(new THREE.BoxGeometry(0.012, 0.003, bread.width + 0.018), 0x686b6e, s * (bread.length / 2 + 0.002), bread.height, 0);
    pan(new THREE.BoxGeometry(bread.length + 0.03, 0.0012, 0.028), 0xeadfc6, 0, bread.height + 0.0035, s * (bread.width / 2 + 0.009), [s * 0.95, 0, 0]); // baking parchment still hangs over the long edges
  }
  // the loaf: a flattened dome rising 3 cm over the rim, a long crack along its crest with raised lips and a pale crumb inside; the crust is golden with darker patches
  const dome = new THREE.SphereGeometry(1, 36, 16, 0, Math.PI * 2, 0, Math.PI / 2), dp = dome.attributes.position, domeColors = new Float32Array(dp.count * 3);
  const RX = bread.length / 2 - 0.007, RZ = bread.width / 2 - 0.007, RY = 0.052;
  for (let i = 0; i < dp.count; i++) {
    let x = dp.getX(i), y = dp.getY(i), z = dp.getZ(i);
    x = Math.sign(x) * Math.pow(Math.abs(x), 0.75); z = Math.sign(z) * Math.pow(Math.abs(z), 0.85);
    const px = x * RX, pz = z * RZ;
    let py = y * RY;
    const az = Math.abs(pz), lip = Math.max(0, 1 - Math.abs(az - 0.014) / 0.012) * y; // raised lips either side of the crack
    py += lip * 0.007 + 0.0035 * Math.sin(px * 46 + pz * 23) * y;
    if (az < 0.0085) py -= (1 - az / 0.0085) * 0.014 * y; // the crack
    dp.setXYZ(i, px, py, pz);
    const patch = 0.5 + 0.5 * Math.sin(px * 31 + 1.7) * Math.cos(pz * 47);
    const base = new THREE.Color(0xd49632).lerp(new THREE.Color(0xa9651f), 0.25 + 0.4 * patch * (0.3 + y));
    if (y < 0.12) base.set(0xb67a2a); else if (az < 0.011) base.set(0x8f5a24);
    base.toArray(domeColors, i * 3);
  }
  dome.setAttribute("color", new THREE.Float32BufferAttribute(domeColors, 3)); dome.computeVertexNormals();
  dome.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(BX, panY + bread.height - 0.022, BZ), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, YAW, 0)), new THREE.Vector3(1, 1, 1)));
  dome.deleteAttribute("uv"); parts.push(dome);
  add(new THREE.BoxGeometry(0.16, 0.0016, 0.007), 0xedc171, [BX, panY + bread.height + 0.0295, BZ], [0, YAW, 0]); // the pale crumb showing in the crack
  // A story on the counter (GrokBot 2026-10-31: tiny details people look for): one slice already cut from the loaf and lying in front of the board with its
  // crumbs, and a lemon half, cut side up, beside it (the lemons of the fruit bowl on the table).
  const SX = BX + 0.03, SZ = -1.86;
  add(new THREE.BoxGeometry(0.1, 0.016, 0.082), 0xb87a2a, [SX, TOP + 0.008, SZ], [0, 0.25, 0]);
  add(new THREE.BoxGeometry(0.092, 0.0165, 0.074), 0xf0d28c, [SX, TOP + 0.00825, SZ], [0, 0.25, 0]);
  for (const [dx, dz] of [[-0.02, -0.012], [0.015, 0.016], [0.028, -0.02], [-0.03, 0.02]]) add(new THREE.SphereGeometry(0.006, 6, 4), 0xa8743a, [SX + dx, TOP + 0.0168, SZ + dz], [0, 0, 0], [1, 0.3, 1]); // flecks of walnut
  for (const [i, [dx, dz]] of [[-0.09, 0.03], [-0.075, -0.045], [0.085, 0.045], [0.1, -0.025], [-0.03, 0.075], [0.04, -0.07], [0.0, 0.1], [-0.11, -0.01]].entries()) {
    add(new THREE.SphereGeometry(0.0034 + (i % 3) * 0.0008, 5, 4), i % 2 ? 0xe2c58c : 0xc99a58, [SX + dx, TOP + 0.003, SZ + dz]);
  }
  const LX = BX + 0.19, LZ = -1.9;
  add(new THREE.SphereGeometry(0.033, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0xe0b92d, [LX, TOP + 0.0004, LZ], [0, 0.4, 0], [1.25, 1, 1]);
  add(new THREE.CylinderGeometry(0.0325, 0.0325, 0.0008, 16), 0xf3e28f, [LX, TOP + 0.0006, LZ], [0, 0.4, 0], [1.25, 1, 1]);
  for (let k = 0; k < 6; k++) add(new THREE.BoxGeometry(0.058, 0.0006, 0.0014), 0xfaf1c4, [LX, TOP + 0.0011, LZ], [0, 0.4 + k * Math.PI / 6, 0], [1, 1, 1]);
  // Bowl of fruit at x 2.02, z -2.04: glazed cream bowl, four apples around and one on top, one orange.
  const FX = 2.02, FZ = -2.04;
  add(lathe([[0, 0], [0.05, 0], [0.058, 0.006], [0.098, 0.04], [0.108, 0.07], [0.102, 0.072], [0.092, 0.05], [0.05, 0.016], [0, 0.014]], 20), 0xd9cdb8, [FX, TOP, FZ]);
  const fruit = [[0.045, 0.0, 0xb5342b], [-0.04, 0.02, 0x9bb04a], [0.0, -0.045, 0xc43f30], [-0.005, 0.048, 0xa7b552], [0.005, 0.0, 0xd9822b]];
  fruit.forEach(([dx, dz, hex], i) => {
    const radius = i === 4 ? 0.036 : 0.034, lift = i === 4 ? 0.058 : 0.034;
    add(new THREE.SphereGeometry(radius, 12, 9), hex, [FX + dx, TOP + lift + radius * 0.85, FZ + dz], [0, i, 0], [1, 0.9, 1]);
  });
  add(new THREE.CylinderGeometry(0.0012, 0.0016, 0.012, 4), 0x5a4630, [FX + 0.045, TOP + 0.034 + 0.034 * 1.7, FZ]);
  // Two unbranded squeeze bottles set out while preparing food: muted tomato ketchup and mustard.
  // They stand in front of the cutting board, clear of the oil bottle and the fruit bowl.
  const squeeze = (x, color) => {
    const profile = [[0,0],[0.031,0],[0.034,0.008],[0.034,0.113],[0.030,0.135],[0.017,0.151],[0.016,0.16],[0,0.16]];
    add(lathe(profile, 16), color, [x, TOP, -1.94]);
    add(new THREE.CylinderGeometry(0.017, 0.017, 0.012, 12), 0xe8dfca, [x, TOP + 0.164, -1.94]);
    add(new THREE.CylinderGeometry(0.0343, 0.0343, 0.047, 16), 0xe1d5bf, [x, TOP + 0.075, -1.94]);
    // A simple color mark on the blank label distinguishes the two sauces without a brand or text.
    add(new THREE.CircleGeometry(0.010, 12), color, [x, TOP + 0.075, -1.905]);
  };
  squeeze(1.56, 0x963b30);
  squeeze(1.66, 0xb99a45);
  const geometry = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose());
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.78 }));
  mesh.name = "room03-counter-fresh";
  mesh.userData.category = "household-props";
  mesh.castShadow = true; mesh.receiveShadow = true;
  scene.add(mesh);
  mesh.updateMatrixWorld(true);
  return {
    vertices: geometry.attributes.position.count, mesh,
    bread: { dimensionsMm: [253, 123, 98], boardEmbedMm: 2, style: "golden quick-bread loaf in a metal pan" },
    bounds: () => { scene.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(mesh); return { min: box.min.toArray(), max: box.max.toArray() }; },
  };
}

// A reading corner beside the window-side floor lamp (GrokBot 2026-10-31: a folded blanket and a half-read book, the bookmark showing): a low round oak stool
// with a folded oat wool blanket on it, and a book lying on the blanket with a coral ribbon bookmark hanging over its front edge. One merged vertex-colour
// mesh standing on the floor, clear of the lamp (x -2.09 to -1.77) and of the window.
function buildRoom03LampBlanket(scene) {
  const X = -2.43, Z = 1.70, STOOL_H = 0.30, SEAT_R = 0.17;
  const parts = [];
  const add = (geometry, hex, position, rotation = [0, 0, 0], scale = [1, 1, 1]) => {
    geometry.applyMatrix4(new THREE.Matrix4().compose(
      new THREE.Vector3(...position), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)), new THREE.Vector3(...scale),
    ));
    const colour = new THREE.Color(hex), count = geometry.attributes.position.count, colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) colour.toArray(colors, i * 3);
    geometry.deleteAttribute("uv");
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    parts.push(geometry);
  };
  const OAK = 0xb88b5b, OAK_DARK = 0x9a7048, OAT = 0xdacdb4, OAT_SHADE = 0xc9bba0, SAGE = 0x8a9873, CLAY = 0xa8644a, PAGES = 0xece3d0, CORAL = 0xe2674a;
  // Stool: a rounded seat, a darker apron under it and three splayed legs that run from inside the apron (under the seat) down to the floor.
  add(new THREE.CylinderGeometry(SEAT_R, SEAT_R * 0.96, 0.034, 28), OAK, [X, STOOL_H - 0.017, Z]);
  add(new THREE.CylinderGeometry(0.118, 0.118, 0.026, 20), OAK_DARK, [X, STOOL_H - 0.034 - 0.013, Z]);
  const legFit = [];
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.4;
    const top = new THREE.Vector3(X + Math.cos(a) * 0.098, STOOL_H - 0.04, Z + Math.sin(a) * 0.098);
    const foot = new THREE.Vector3(X + Math.cos(a) * 0.15, 0.0, Z + Math.sin(a) * 0.15);
    const dir = top.clone().sub(foot), length = dir.length() + 0.012;
    const mid = top.clone().add(foot).multiplyScalar(0.5);
    const tilt = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize()));
    add(new THREE.CylinderGeometry(0.0145, 0.0115, length, 10), OAK_DARK, [mid.x, mid.y + 0.006, mid.z], [tilt.x, tilt.y, tilt.z]);
    const leg = parts[parts.length - 1]; leg.computeBoundingBox();
    const pos = leg.attributes.position; let insideApron = 0;
    // Intersect the 11 actual side edges with the apron mid-plane (a long cylinder has no intermediate side vertices).
    for (let j = 0; j <= 10; j++) {
      const y0 = pos.getY(j), y1 = pos.getY(j + 11), t = (STOOL_H - 0.047 - y0) / (y1 - y0);
      const x = THREE.MathUtils.lerp(pos.getX(j), pos.getX(j + 11), t);
      const z = THREE.MathUtils.lerp(pos.getZ(j), pos.getZ(j + 11), t);
      if (t >= 0 && t <= 1 && Math.hypot(x - X, z - Z) < 0.118) insideApron++;
    }
    legFit.push({ floorY: leg.boundingBox.min.y, insideApron });
  }
  // Folded blanket: three folds, each a little off square, with a sage stripe along the front edge of the top fold.
  const seatTop = STOOL_H;
  const folds = [[0.29, 0.034, 0.20, OAT_SHADE, 0.06], [0.28, 0.034, 0.195, OAT, -0.05], [0.27, 0.032, 0.19, OAT, 0.04]];
  let y = seatTop;
  for (const [w, h, d, hex, yaw] of folds) { add(new THREE.BoxGeometry(w, h, d), hex, [X, y + h / 2, Z], [0, yaw, 0]); y += h; }
  add(new THREE.BoxGeometry(0.271, 0.004, 0.018), SAGE, [X, y - 0.012, Z + 0.08], [0, 0.04, 0]);
  add(new THREE.BoxGeometry(0.271, 0.004, 0.006), SAGE, [X, y - 0.012, Z + 0.058], [0, 0.04, 0]);
  const blanketTop = y;
  // The book: cloth cover, a paler page block, closed and lying on the blanket, turned a little; the ribbon bookmark hangs over the front edge.
  const BW = 0.19, BD = 0.13, BH = 0.032, BYAW = -0.35, BX = X + 0.01, BZ = Z - 0.005;
  add(new THREE.BoxGeometry(BW, BH, BD), CLAY, [BX, blanketTop + BH / 2, BZ], [0, BYAW, 0]);
  add(new THREE.BoxGeometry(BW - 0.01, BH - 0.01, BD + 0.003), PAGES, [BX, blanketTop + BH / 2, BZ], [0, BYAW, 0]);
  const forward = new THREE.Vector3(Math.sin(BYAW), 0, Math.cos(BYAW)); // toward +z, the room's front wall
  const ribbonX = BX + forward.x * (BD / 2 + 0.002) + Math.cos(BYAW) * 0.03, ribbonZ = BZ + forward.z * (BD / 2 + 0.002) - Math.sin(BYAW) * 0.03;
  add(new THREE.BoxGeometry(0.008, 0.0015, 0.07), CORAL, [ribbonX + forward.x * 0.03, blanketTop + BH + 0.0008, ribbonZ + forward.z * 0.03 - 0.0], [0, BYAW + 0.12, 0]);
  add(new THREE.BoxGeometry(0.008, 0.07, 0.0015), CORAL, [ribbonX + forward.x * 0.004, blanketTop + BH / 2 - 0.005, ribbonZ + forward.z * 0.004], [0, BYAW + 0.12, 0]);
  const geometry = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose());
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.86 }));
  mesh.name = "room03-lamp-blanket";
  mesh.userData.category = "household-props";
  mesh.castShadow = true; mesh.receiveShadow = true;
  scene.add(mesh);
  mesh.updateMatrixWorld(true);
  return {
    vertices: geometry.attributes.position.count, mesh, legFit,
    bounds: () => { scene.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(mesh); return { min: box.min.toArray(), max: box.max.toArray() }; },
  };
}

function buildRoom03KitchenHub(scene) {
  const W = 0.46, H = 0.16, CX = 0.78, CY = 1.245, FACE_Z = -2.2675;
  const texture = makeTexture((ctx, w, h) => {
    ctx.fillStyle = "#0b1311"; ctx.fillRect(0, 0, w, h);
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "rgba(120,200,170,.10)"); grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
    const font = (px, weight = 600) => `${weight} ${px}px "Segoe UI", system-ui, sans-serif`;
    ctx.textBaseline = "alphabetic";
    // left: indoor temperature
    ctx.fillStyle = "#7fb7a0"; ctx.font = font(22, 700); ctx.fillText("KITCHEN", 36, 54);
    ctx.fillStyle = "#f3f6f2"; ctx.font = font(96, 600); ctx.fillText("72", 34, 152);
    ctx.fillStyle = "#9bd3bd"; ctx.font = font(36, 600); ctx.fillText("°F", 150, 112);
    ctx.fillStyle = "#6f8a80"; ctx.font = font(22, 600); ctx.fillText("AIR · GOOD", 36, 192);
    // divider
    ctx.fillStyle = "rgba(190,230,215,.18)"; ctx.fillRect(262, 34, 2, 184);
    // middle: hob zone levels
    ctx.fillStyle = "#7fb7a0"; ctx.font = font(22, 700); ctx.fillText("HOB", 296, 54);
    [[5, "#f08a6e"], [3, "#9bd3bd"], [0, ""], [0, ""]].forEach(([level, color], i) => {
      const x = 296 + i * 54;
      for (let n = 0; n < 6; n++) {
        ctx.fillStyle = n < level ? color : "rgba(190,230,215,.16)";
        ctx.fillRect(x, 150 - n * 18, 34, 12);
      }
    });
    ctx.fillStyle = "#6f8a80"; ctx.font = font(22, 600); ctx.fillText("1  2  3  4", 300, 192);
    ctx.fillStyle = "rgba(190,230,215,.18)"; ctx.fillRect(540, 34, 2, 184);
    // right: timer and oven
    ctx.fillStyle = "#7fb7a0"; ctx.font = font(22, 700); ctx.fillText("TIMER", 574, 54);
    ctx.fillStyle = "#f3f6f2"; ctx.font = font(64, 600); ctx.fillText("04:32", 570, 118);
    ctx.fillStyle = "#6f8a80"; ctx.font = font(22, 600); ctx.fillText("WOK  380°F", 574, 164);
    ctx.fillStyle = "rgba(190,230,215,.16)"; ctx.fillRect(574, 182, 150, 8);
    ctx.fillStyle = "#f08a6e"; ctx.fillRect(574, 182, 112, 8);
    ctx.strokeStyle = "#151918"; ctx.lineWidth = 16; ctx.strokeRect(0, 0, w, h);
  }, 768, 266);
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 8;
  texture.name = "kitchen-hub-display";
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: texture, toneMapped: false, color: 0xd9d9d9 }));
  screen.position.set(CX, CY, FACE_Z + 0.004);
  screen.name = "room03-kitchen-hub-screen"; screen.userData.category = "kitchen-hub";
  scene.add(screen);
  const vertices = screen.geometry.attributes.position.count;
  return {
    meshes: [screen], vertices,
    bounds: () => { const box = new THREE.Box3().setFromObject(screen); return { min: box.min.toArray(), max: box.max.toArray() }; },
  };
}

function buildRoom03EntryWallDetails(scene) {
  const paint = (geometry, hex) => {
    const color = new THREE.Color(hex), colors = new Float32Array(geometry.attributes.position.count * 3);
    for (let index = 0; index < geometry.attributes.position.count; index++) {
      colors[index * 3] = color.r; colors[index * 3 + 1] = color.g; colors[index * 3 + 2] = color.b;
    }
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  };
  const place = (geometry, position, rotation = [0, 0, 0]) => {
    geometry.applyMatrix4(new THREE.Matrix4().compose(
      new THREE.Vector3(...position),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
      new THREE.Vector3(1, 1, 1),
    ));
    return geometry;
  };
  const parts = [];
  // Cork board (Paul 2026-10-31: the round clock read out of place beside the TV). A 360 x 300 mm cork panel in a thin oak frame, hung at a natural
  // 1.0 m centre between the TV (x <= -0.04) and the hook rail, below the Redwood print (bottom y 1.175), with a child's crayon drawing, a generic
  // takeout menu and a farmers-market flyer pinned on it (abstract marks only: no readable text, brand or logo). The cork and papers come from one
  // canvas atlas on this mesh's own material; every other part samples the atlas's white corner, so the wall stays one draw call.
  const atlas = document.createElement("canvas");
  atlas.width = atlas.height = 1024;
  const ctx = atlas.getContext("2d");
  let seed = 7;
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, 1024, 1024);
  // Cork: warm base, thousands of granules in three tones.
  ctx.fillStyle = "#b9895a"; ctx.fillRect(0, 0, 640, 480);
  for (let i = 0; i < 14000; i++) {
    const tone = rand();
    ctx.fillStyle = tone < 0.4 ? "#9c6d42" : tone < 0.75 ? "#c99d6c" : tone < 0.93 ? "#86592f" : "#dcb489";
    const r = 0.8 + rand() * 2.4;
    ctx.beginPath(); ctx.ellipse(rand() * 640, rand() * 480, r, r * (0.6 + rand() * 0.6), rand() * 3, 0, Math.PI * 2); ctx.fill();
  }
  const crayon = (points, colour, width = 5) => {
    ctx.strokeStyle = colour; ctx.lineWidth = width; ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (let pass = 0; pass < 3; pass++) {
      ctx.globalAlpha = 0.55; ctx.beginPath();
      points.forEach(([x, y], i) => { const jx = x + (rand() - 0.5) * 3, jy = y + (rand() - 0.5) * 3; if (i) ctx.lineTo(jx, jy); else ctx.moveTo(jx, jy); });
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };
  const scribbleFill = (x, y, w, h, colour) => { for (let k = 0; k < h; k += 4) crayon([[x, y + k], [x + w, y + k + 2]], colour, 4); };
  // Child's drawing (x 0..300, y 500..720): house, sun, a family of three and a lemon tree.
  ctx.fillStyle = "#fbf8f0"; ctx.fillRect(0, 500, 300, 220);
  scribbleFill(0, 690, 300, 30, "#6fae4a");
  crayon([[60, 690], [60, 620], [140, 620], [140, 690]], "#d0463a", 5); crayon([[50, 622], [100, 575], [150, 622]], "#7a4a2a", 6);
  scribbleFill(88, 650, 22, 40, "#3b6fb6");
  for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2; crayon([[255 + Math.cos(a) * 20, 545 + Math.sin(a) * 20], [255 + Math.cos(a) * 32, 545 + Math.sin(a) * 32]], "#f2b51c", 3); }
  ctx.fillStyle = "#f6c625"; ctx.beginPath(); ctx.arc(255, 545, 17, 0, Math.PI * 2); ctx.fill();
  for (const [fx, h] of [[170, 52], [192, 44], [210, 30]]) { crayon([[fx, 690 - h], [fx, 690 - h * 0.35]], "#2b2b2b", 3); crayon([[fx - 8, 690], [fx, 690 - h * 0.35], [fx + 8, 690]], "#2b2b2b", 3); crayon([[fx - 10, 690 - h * 0.7], [fx + 10, 690 - h * 0.7]], "#2b2b2b", 3); ctx.strokeStyle = "#2b2b2b"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(fx, 690 - h - 7, 7, 0, Math.PI * 2); ctx.stroke(); }
  crayon([[260, 690], [262, 630]], "#7a4a2a", 6);
  ctx.fillStyle = "#4f9a3c"; ctx.beginPath(); ctx.arc(262, 615, 26, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f7d21e"; for (const [lx, ly] of [[250, 606], [272, 618], [258, 628], [276, 600]]) { ctx.beginPath(); ctx.ellipse(lx, ly, 5, 4, 0.4, 0, Math.PI * 2); ctx.fill(); }
  // Generic takeout menu (x 320..520, y 500..800): coloured header band, a bowl icon, rows of unreadable grey "text" bars and dotted price leaders.
  ctx.fillStyle = "#fffdf6"; ctx.fillRect(320, 500, 200, 300);
  ctx.fillStyle = "#b8352b"; ctx.fillRect(320, 500, 200, 46);
  ctx.fillStyle = "#f3e2c0"; for (let k = 0; k < 5; k++) ctx.fillRect(340 + k * 30, 516, 20, 12);
  ctx.strokeStyle = "#b8352b"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(420, 575, 20, 0, Math.PI); ctx.stroke(); ctx.beginPath(); ctx.moveTo(398, 575); ctx.lineTo(442, 575); ctx.stroke();
  for (let row = 0; row < 11; row++) { const y = 612 + row * 16; ctx.fillStyle = row % 4 === 0 ? "#6b2c24" : "#8a8580"; ctx.fillRect(334, y, row % 4 === 0 ? 70 : 60 + rand() * 50, 6); ctx.fillStyle = "#c2bdb6"; for (let d = 0; d < 8; d++) ctx.fillRect(440 + d * 6, y + 3, 2, 2); ctx.fillStyle = "#6b6560"; ctx.fillRect(492, y, 16, 6); }
  // Generic farmers-market flyer (x 540..760, y 500..790): green header, produce illustrations, abstract text bars, a date block.
  ctx.fillStyle = "#f5efd9"; ctx.fillRect(540, 500, 220, 290);
  ctx.fillStyle = "#4e7a3a"; ctx.fillRect(540, 500, 220, 54);
  ctx.fillStyle = "#e8dfb8"; ctx.fillRect(556, 516, 150, 10); ctx.fillRect(556, 532, 100, 8);
  const produce = [[580, 600, 22, "#d0412f"], [630, 596, 18, "#f2a12a"], [676, 604, 20, "#7aa83c"], [720, 598, 16, "#8c3d6e"], [600, 650, 16, "#e3c13a"], [652, 652, 20, "#d0412f"], [704, 650, 18, "#5d8f34"]];
  for (const [px, py, pr, pc] of produce) { ctx.fillStyle = pc; ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#3f6a2a"; ctx.fillRect(px - 2, py - pr - 6, 4, 8); }
  ctx.fillStyle = "#6f6a5c"; for (let row = 0; row < 4; row++) ctx.fillRect(556, 692 + row * 14, 120 + rand() * 60, 6);
  ctx.fillStyle = "#4e7a3a"; ctx.fillRect(556, 750, 70, 26);
  // Sticky note (Paul 2026-11-11, note 3 of the three-room set, the one in the kitchen): a soft yellow square with a small ink lemon and two lines of
  // pencil scribble. Abstract marks only, like the other papers here; what it says appears when it is tapped (NOOK_HOTSPOTS "note").
  ctx.fillStyle = "#f6e58d"; ctx.fillRect(780, 500, 180, 180);
  ctx.fillStyle = "#ecd878"; ctx.fillRect(780, 500, 180, 16);
  ctx.fillStyle = "#f2c63a"; ctx.beginPath(); ctx.ellipse(870, 568, 36, 25, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#6b5a2a"; ctx.lineWidth = 3; ctx.stroke();
  crayon([[893, 541], [909, 530], [912, 540]], "#4f7a36", 4);
  crayon([[802, 622], [830, 618], [858, 624], [888, 619], [920, 623]], "#4a4640", 3);
  crayon([[802, 648], [826, 645], [852, 650], [880, 646]], "#4a4640", 3);
  const atlasTexture = new THREE.CanvasTexture(atlas);
  atlasTexture.colorSpace = THREE.SRGBColorSpace; atlasTexture.anisotropy = 4;
  const textured = new Set();
  const atlasUv = (geometry, [x0, y0, x1, y1]) => {
    const uv = geometry.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (x0 + uv.getX(i) * (x1 - x0)) / 1024, 1 - (y1 - uv.getY(i) * (y1 - y0)) / 1024);
    textured.add(geometry);
    return geometry;
  };
  const WALL_Z = 3.74;
  const BOARD = { x: 0.27, y: 1.00, w: 0.36, h: 0.30, frame: 0.018, depth: 0.018 };
  const boardFront = WALL_Z - BOARD.depth;
  // Oak frame: four mitred-looking rails, back face on the wall (0 mm).
  for (const [sx, sy, px, py] of [[BOARD.w + 2 * BOARD.frame, BOARD.frame, 0, BOARD.h / 2 + BOARD.frame / 2], [BOARD.w + 2 * BOARD.frame, BOARD.frame, 0, -BOARD.h / 2 - BOARD.frame / 2], [BOARD.frame, BOARD.h, -BOARD.w / 2 - BOARD.frame / 2, 0], [BOARD.frame, BOARD.h, BOARD.w / 2 + BOARD.frame / 2, 0]]) {
    parts.push(paint(place(new THREE.BoxGeometry(sx, sy, BOARD.depth), [BOARD.x + px, BOARD.y + py, WALL_Z - BOARD.depth / 2]), 0xb88b5b));
  }
  // Cork panel recessed 6 mm behind the frame face. Seen from the room the wall's x axis runs right-to-left, so the panel is turned to face -z.
  const corkZ = boardFront + 0.006;
  parts.push(atlasUv(paint(place(new THREE.PlaneGeometry(BOARD.w, BOARD.h), [BOARD.x, BOARD.y, corkZ], [0, Math.PI, 0]), 0xffffff), [0, 0, 640, 480]));
  // Papers: slightly rotated, bowed off the cork (lifted 1-4 mm at the free corners), each held by a push pin.
  const pins = [];
  const paper = (region, w, h, cx, cy, roll, pinColour) => {
    const sheet = new THREE.PlaneGeometry(w, h, 6, 6);
    const position = sheet.attributes.position;
    for (let i = 0; i < position.count; i++) { const u = position.getX(i) / w + 0.5, v = position.getY(i) / h + 0.5; position.setZ(i, 0.0008 + 0.0032 * (1 - v) * (0.4 + Math.abs(u - 0.5)) ); }
    sheet.rotateZ(roll); sheet.rotateY(Math.PI);
    sheet.translate(cx, cy, corkZ - 0.0004);
    parts.push(atlasUv(paint(sheet, 0xffffff), region));
    const pinX = cx + Math.sin(roll) * (h / 2 - 0.012), pinY = cy + Math.cos(roll) * (h / 2 - 0.012);
    const head = new THREE.SphereGeometry(0.0055, 12, 8); head.scale(1, 1, 0.75);
    head.translate(pinX, pinY, corkZ - 0.0062);
    parts.push(paint(head, pinColour));
    const shank = new THREE.CylinderGeometry(0.0012, 0.0012, 0.008, 6); shank.rotateX(Math.PI / 2); shank.translate(pinX, pinY, corkZ - 0.0012);
    parts.push(paint(shank, 0xb9bcbf));
    pins.push([pinX, pinY]);
  };
  // Seen from the room +x is to the left; the drawing is pinned on the TV side, menu in the middle, flyer toward the hooks.
  paper([0, 500, 300, 720], 0.140, 0.105, BOARD.x - 0.09, BOARD.y + 0.06, -0.05, 0xd8402f);
  paper([320, 500, 520, 800], 0.100, 0.150, BOARD.x + 0.012, BOARD.y - 0.045, 0.06, 0x2f6fb8);
  paper([540, 500, 760, 790], 0.100, 0.135, BOARD.x + 0.112, BOARD.y + 0.02, -0.08, 0xf0c531);
  // The note sits in the free lower-right corner of the cork, clear of the flyer (6 mm) and the frame; green pin.
  paper([780, 500, 960, 680], 0.064, 0.064, BOARD.x + 0.125, BOARD.y - 0.085, 0.12, 0x3aa856);
  // Hook rail moved toward the right of the alcove so the board and the hung things each have room: three black iron J-hooks.
  const RAIL = { x: 0.685, y: 1.145, hooks: [0.585, 0.685, 0.785] };
  const HOOK_R = 0.0055, CUP = { y: 1.055, z: 3.70 };
  parts.push(paint(place(new THREE.BoxGeometry(0.31, 0.022, 0.014), [RAIL.x, RAIL.y, 3.733]), 0x2b2b2b));
  for (const x of RAIL.hooks) {
    const hookPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x, 1.145, 3.73),
      new THREE.Vector3(x, 1.115, 3.70),
      new THREE.Vector3(x, 1.08, 3.685),
      new THREE.Vector3(x, CUP.y, CUP.z),
      new THREE.Vector3(x, 1.06, 3.72),
    ]);
    parts.push(paint(new THREE.TubeGeometry(hookPath, 10, HOOK_R, 6, false), 0x2b2b2b));
  }
  // Two plain canvas totes, no print, text or logo (Paul 2026-10-31: the cap read poorly, so a second tote in brick red replaces it). Each soft
  // body has its back pressed 0.5 mm into the wall and bulges into the room, fuller at the bottom, its top edge sagging between the handles;
  // the two handles meet over the hook and rest in its cup (0.5 mm embed). The red one is narrower and longer with solid webbing handles set
  // closer together, so the pair does not read as a copy.
  const STRAP_R = 0.005, strapSeatY = CUP.y + HOOK_R + STRAP_R - 0.0005;
  const makeTote = (T) => {
    const body = new THREE.BoxGeometry(T.w, T.h, 1, 12, 14, 2);
    const position = body.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i), y = position.getY(i), z = position.getZ(i);
      const u = x / T.w * 2, v = y / T.h + 0.5; // v 0 bottom .. 1 top
      const thick = 0.010 + T.belly * Math.pow(Math.max(0, 1 - v), 1.3) * (1 - 0.55 * u * u);
      const sag = -T.sag * (1 - u * u) * Math.pow(Math.max(0, v), 6);
      const front = z < 0 ? -thick : 0.0005;
      position.setXYZ(i, x * (1 - T.taper * v), y + sag + 0.0015 * Math.sin(x * 70 + y * 40 + T.phase), WALL_Z + front);
    }
    body.translate(T.x, T.top - T.h / 2, 0);
    const colours = new Float32Array(position.count * 3), c = new THREE.Color();
    for (let i = 0; i < position.count; i++) { const n = Math.abs(Math.sin(position.getX(i) * 311 + position.getY(i) * 173) * 43758.5) % 1; c.set(position.getY(i) < T.top - T.h + 0.035 ? T.base : T.colour).multiplyScalar(0.96 + 0.06 * n); c.toArray(colours, i * 3); }
    body.setAttribute("color", new THREE.Float32BufferAttribute(colours, 3));
    parts.push(body);
    for (const side of [-1, 1]) {
      const x0 = T.x + side * T.handle;
      const strapPath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(x0, T.top - 0.015, WALL_Z - 0.012),
        new THREE.Vector3(x0 - side * 0.02, T.top + T.loop, 3.722),
        new THREE.Vector3(T.x + side * 0.012, strapSeatY - 0.012, CUP.z + 0.002),
        new THREE.Vector3(T.x + side * 0.003, strapSeatY, CUP.z),
      ]);
      const strap = new THREE.TubeGeometry(strapPath, 24, STRAP_R, 6, false);
      const sc = new Float32Array(strap.attributes.position.count * 3);
      for (let i = 0; i < strap.attributes.position.count; i++) { c.set(T.stripes[i % T.stripes.length]); c.toArray(sc, i * 3); }
      strap.setAttribute("color", new THREE.Float32BufferAttribute(sc, 3));
      parts.push(strap);
    }
    body.computeBoundingBox();
    const bb = body.boundingBox;
    return { hookX: T.x, colour: `#${new THREE.Color(T.colour).getHexString()}`, strapSeatY, strapRadiusMm: STRAP_R * 1000, strapHookEmbedMm: Number(((CUP.y + HOOK_R + STRAP_R - strapSeatY) * 1000).toFixed(2)), sizeMm: [Math.round(T.w * 1000), Math.round(T.h * 1000)], minX: bb.min.x, maxX: bb.max.x, bottomY: bb.min.y, topY: bb.max.y, wallGapMm: Number(((WALL_Z - bb.max.z) * 1000).toFixed(1)) };
  };
  const toteInfo = makeTote({ x: RAIL.hooks[2], top: 0.80, w: 0.22, h: 0.30, belly: 0.034, sag: 0.012, taper: 0.03, phase: 0, handle: 0.065, loop: 0.09, colour: 0xe6dcc4, base: 0xd3c6a9, stripes: [0x2c3e5c, 0xefe6d2, 0x2c3e5c, 0xb5523a, 0x2c3e5c, 0xefe6d2, 0x2c3e5c] });
  const redToteInfo = makeTote({ x: RAIL.hooks[0], top: 0.785, w: 0.16, h: 0.32, belly: 0.028, sag: 0.008, taper: 0.05, phase: 1.7, handle: 0.045, loop: 0.11, colour: 0xa4432f, base: 0x8a3726, stripes: [0x7e2f22] });
  // A shallow floating key shelf with a single low oak dish (unchanged).
  parts.push(paint(place(new THREE.BoxGeometry(0.38, 0.025, 0.12), [0.32, 0.43, 3.68]), 0xb88b5b));
  parts.push(paint(place(new THREE.CylinderGeometry(0.052, 0.058, 0.012, 14), [0.32, 0.449, 3.68]), 0xc6a77e));
  // Non-textured parts sample the atlas's white corner so vertex colours stay exact.
  for (const part of parts) if (!textured.has(part)) { const uv = part.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, 0.97, 0.03); }
  const geometry = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose());
  if (!geometry) throw new Error("Could not merge Room 03 entry wall details");
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.78, metalness: 0.04, side: THREE.DoubleSide, map: atlasTexture });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "room03-entry-wall-details";
  mesh.userData.category = "entry-details";
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return {
    mesh,
    vertices: geometry.attributes.position.count,
    bounds: () => { const box = new THREE.Box3().setFromObject(mesh); return { min: box.min.toArray(), max: box.max.toArray(), size: box.getSize(new THREE.Vector3()).toArray() }; },
    clock: null,
    corkboard: { center: [BOARD.x, BOARD.y, WALL_Z - BOARD.depth / 2], sizeMm: [Math.round((BOARD.w + 2 * BOARD.frame) * 1000), Math.round((BOARD.h + 2 * BOARD.frame) * 1000)], bottomY: BOARD.y - BOARD.h / 2 - BOARD.frame, topY: BOARD.y + BOARD.h / 2 + BOARD.frame, minX: BOARD.x - BOARD.w / 2 - BOARD.frame, maxX: BOARD.x + BOARD.w / 2 + BOARD.frame, wallGapMm: 0, papers: 4, pins: pins.length },
    hooks: { count: RAIL.hooks.length, railCenter: [RAIL.x, RAIL.y, 3.733], xs: RAIL.hooks, cupY: CUP.y, cupZ: CUP.z, radiusMm: HOOK_R * 1000 },
    tote: toteInfo,
    redTote: redToteInfo,
    cap: null,
    shelf: { center: [0.32, 0.43, 3.68], dishTopY: 0.455 },
  };
}

export async function start({ stage, onReady = () => {} }) {
  const scene = new THREE.Scene();
  const skyMaterials = { golden: makeSkyTexture(false), night: makeSkyTexture(true), day: makeSkyTexture(false, true) };
  scene.background = skyMaterials.day;
  const DESKTOP_CAMERA = { position: [0.242141, 1.658234, 1.711458], target: [0.05, 1.50, 0.05], fov: 62, maxDistance: 1.92 };
  const PORTRAIT_CAMERA = { position: [0.459544, 1.605912, 1.715041], target: [0, 1.48, 0], fov: 84, maxDistance: 1.92 };
  const compact = window.innerWidth < 500;
  const camera = new THREE.PerspectiveCamera(compact ? 60 : 50, 1, 0.05, 50);
  const initialCamera = compact ? PORTRAIT_CAMERA : DESKTOP_CAMERA;
  camera.position.set(...initialCamera.position);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, compact ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  // PCF instead of VSM: a 512 px VSM shadow map over an 8 x 8 m room blurred every edge into mush, so cabinets and
  // chairs had no readable shadow. PCF with a larger map keeps a soft edge without washing the contact area away.
  renderer.shadowMap.type = THREE.PCFShadowMap;
  stage.replaceChildren(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  // Damping + one render per animation frame, like Room 01 (Paul 2026-11-05: finger drag felt choppy next to Room 01). Without damping the
  // camera followed the raw touch samples and every pointermove rendered synchronously, so a 120 Hz touch screen could draw twice per frame.
  controls.enableDamping = true; controls.enablePan = false;
  controls.target.set(...initialCamera.target); controls.minDistance = 1.48;
  controls.minPolarAngle = 1.24; controls.maxPolarAngle = 1.65;
  controls.minAzimuthAngle = -Infinity; controls.maxAzimuthAngle = Infinity;
  controls.maxDistance = initialCamera.maxDistance;
  let compactCameraActive = compact;
  const CENTER_STATION = [0, 1.55, -0.85];
  let centerView = null, savedOrbit = null, centerPointer = null;
  const canvas = renderer.domElement;
  canvas.tabIndex = -1;
  function renderCenterView() {
    if (!centerView) return;
    const { yaw, pitch } = centerView;
    camera.position.set(...CENTER_STATION);
    camera.lookAt(CENTER_STATION[0] + Math.sin(yaw) * Math.cos(pitch), CENTER_STATION[1] + Math.sin(pitch), CENTER_STATION[2] - Math.cos(yaw) * Math.cos(pitch));
    camera.updateMatrixWorld();
    render();
  }
  function setCenterView(on) {
    if (on === Boolean(centerView)) return;
    if (on) {
      if (nookSaved) setNookView(false);
      if (recordSaved) setRecordView(false);
      savedOrbit = { position: camera.position.clone(), target: controls.target.clone(), zoom: camera.zoom };
      controls.enabled = false;
      canvas.tabIndex = 0;
      centerView = { yaw: -1.85, pitch: compactCameraActive ? -0.38 : -0.35 };
      camera.fov = compactCameraActive ? 84 : 86;
      camera.zoom = 1;
      camera.updateProjectionMatrix();
      renderCenterView();
    } else {
      centerView = null;
      centerPointer = null;
      canvas.tabIndex = -1;
      camera.position.copy(savedOrbit.position);
      controls.target.copy(savedOrbit.target);
      camera.fov = compactCameraActive ? PORTRAIT_CAMERA.fov : DESKTOP_CAMERA.fov;
      camera.zoom = savedOrbit.zoom;
      camera.updateProjectionMatrix();
      controls.enabled = true;
      controls.update();
      render();
    }
  }
  // Paul 2026-10-31: visitors want to look closer at the small pink entry nook (cork board, two totes, key shelf, TV, Redwood print). The nook
  // view re-centres the same orbit on the nook: target on the wall at board/tote height, camera 1.52 m back from the wall in the main room
  // (z 2.22, in front of the front-wall face at z 2.34) at 1.45 m eye height. Orbit is held to +/-0.30 rad of straight-on and zoom to
  // 1.58-1.92 m, so the closest any orbit can bring the camera is z ~2.31 with x -0.12..0.82, never into the lintel, the piers or the nook's
  // side walls (x +/-0.94). Leaving restores the previous orbit and limits.
  // Paul 2026-10-31: the first nook view (1.5 m from the wall, straight on) cut the redwood print at the top and showed where the wide TV runs into the
  // hall's side wall. The view now stands 2.6 m back (still inside the main room, looking through the opening), with the whole print, board, totes, key
  // shelf and TV in frame and the orbit held to +/-0.12 rad and 2.2-2.9 m. Paul 2026-11-01: the panel end is hidden by the side wall itself now, so the
  // view can come closer than 2.8 m, and it walks in over 0.9 s instead of jumping there.
  const NOOK_VIEW = { target: [0.35, 1.50, 3.74], position: [0.40, 1.52, 1.04], azimuthHalfRange: 0.12, minDistance: 2.2, maxDistance: 2.9, halfHfovDeg: 30, minFov: 46, rotateSpeed: 0.4, zoomSpeed: 0.65 };
  const nookFov = (aspect) => Math.min(compactCameraActive ? PORTRAIT_CAMERA.fov : DESKTOP_CAMERA.fov, Math.max(NOOK_VIEW.minFov, 2 * Math.atan(Math.tan(NOOK_VIEW.halfHfovDeg * Math.PI / 360 * 2) / aspect) * 180 / Math.PI));
  let nookSaved = null;
  let nookTween = null;
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  function nookPowerOn() {
    // The TV picture and the two downlights warm up over 380 ms, so walking in feels like switching the corner on rather than cutting to a lit set.
    const screenMaterial = mediaUnit.screen.material;
    const litColour = screenMaterial.color.clone();
    const haloMaterial = nookDecor.halo.material, haloOpacity = haloMaterial.opacity, lensIntensity = nookDecor.lensMaterial.emissiveIntensity;
    const start = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - start) / 500);
      screenMaterial.color.copy(litColour).multiplyScalar(0.18 + 0.82 * k);
      haloMaterial.opacity = haloOpacity * k;
      nookDecor.lensMaterial.emissiveIntensity = lensIntensity * k;
      render();
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function tweenNook(fromPosition, fromTarget, fromFov, toPosition, toTarget, toFov, onDone) {
    if (nookTween) cancelAnimationFrame(nookTween);
    const start = performance.now(), duration = 1150;
    const fromPositionV = fromPosition.clone(), fromTargetV = fromTarget.clone(), toPositionV = toPosition.clone(), toTargetV = toTarget.clone();
    const step = (now) => {
      const k = easeInOutCubic(Math.min(1, (now - start) / duration));
      camera.position.lerpVectors(fromPositionV, toPositionV, k);
      controls.target.lerpVectors(fromTargetV, toTargetV, k);
      camera.fov = fromFov + (toFov - fromFov) * k;
      camera.updateProjectionMatrix(); controls.update(); render();
      if (k < 1) { nookTween = requestAnimationFrame(step); return; }
      nookTween = null;
      camera.position.copy(toPositionV); controls.target.copy(toTargetV); camera.fov = toFov;
      camera.updateProjectionMatrix(); controls.update(); render();
      onDone?.();
    };
    nookTween = requestAnimationFrame(step);
  }
  function setNookView(on) {
    if (on === Boolean(nookSaved)) return;
    if (on) {
      if (centerView) setCenterView(false);
      if (recordSaved) setRecordView(false);
      nookSaved = { position: camera.position.clone(), target: controls.target.clone(), minAzimuth: controls.minAzimuthAngle, maxAzimuth: controls.maxAzimuthAngle, minDistance: controls.minDistance, maxDistance: controls.maxDistance, rotateSpeed: controls.rotateSpeed, zoomSpeed: controls.zoomSpeed };
      controls.minDistance = NOOK_VIEW.minDistance; controls.maxDistance = NOOK_VIEW.maxDistance;
      // Paul 2026-11-01: a slow, deliberate orbit feels like standing in the room; the room's default speed is for the big orbit.
      controls.rotateSpeed = NOOK_VIEW.rotateSpeed; controls.zoomSpeed = NOOK_VIEW.zoomSpeed;
      controls.minAzimuthAngle = Math.PI - NOOK_VIEW.azimuthHalfRange;
      controls.maxAzimuthAngle = -Math.PI + NOOK_VIEW.azimuthHalfRange;
      tweenNook(
        camera.position, controls.target, camera.fov,
        new THREE.Vector3(...NOOK_VIEW.position), new THREE.Vector3(...NOOK_VIEW.target), nookFov(camera.aspect),
        () => { setMood(currentMood); nookPowerOn(); showNookHint(); },
      );
    } else {
      // Leaving stays instant: the plaque / centre / immersive views set their own camera in the same click, and an exit tween would fight them.
      const saved = nookSaved;
      if (nookTween) { cancelAnimationFrame(nookTween); nookTween = null; }
      nookCaption.style.opacity = "0"; nookCaptionKey = null;
      camera.position.copy(saved.position);
      controls.target.copy(saved.target);
      camera.fov = compactCameraActive ? PORTRAIT_CAMERA.fov : DESKTOP_CAMERA.fov;
      camera.updateProjectionMatrix();
      controls.minAzimuthAngle = saved.minAzimuth; controls.maxAzimuthAngle = saved.maxAzimuth;
      controls.minDistance = saved.minDistance; controls.maxDistance = saved.maxDistance;
      controls.rotateSpeed = saved.rotateSpeed; controls.zoomSpeed = saved.zoomSpeed;
      nookSaved = null;
      controls.update(); setMood(currentMood); render();
    }
  }
  // A close, slow look at the credenza end where the record player stands (Paul 2026-11-17: the record player's own quality is the idea, and a tap on it
  // will start the music). Same pattern as the nook view: save the orbit, hold it to a small window, walk in over about a second, restore on leave.
  // Paul 2026-11-22: like Room 02, a look frames the whole object and lets you swing either side of it. The record view
  // aims at the deck itself (not at a point beside it) and steps back far enough that the deck, its plinth, the cable-car
  // art on the left and the small stove's zellige wall on the right are all inside one frame.
  const RECORD_VIEW = { target: [2.72, 0.98, 0.62], position: [1.22, 1.60, 2.30], minDistance: 0.8, maxDistance: 3.4, azimuthHalfRange: 0.52, halfHfovDeg: 24, minFov: 40, maxFov: 62, rotateSpeed: 0.45, zoomSpeed: 0.65 };
  const recordFov = (aspect) => Math.min(RECORD_VIEW.maxFov, Math.max(RECORD_VIEW.minFov, 2 * Math.atan(Math.tan(RECORD_VIEW.halfHfovDeg * Math.PI / 180) / aspect) * 180 / Math.PI));
  let recordSaved = null;
  function setRecordView(on) {
    if (on === Boolean(recordSaved)) return;
    if (on) {
      if (centerView) setCenterView(false);
      if (nookSaved) setNookView(false);
      recordSaved = { position: camera.position.clone(), target: controls.target.clone(), minAzimuth: controls.minAzimuthAngle, maxAzimuth: controls.maxAzimuthAngle, minDistance: controls.minDistance, maxDistance: controls.maxDistance, rotateSpeed: controls.rotateSpeed, zoomSpeed: controls.zoomSpeed };
      const theta = Math.atan2(RECORD_VIEW.position[0] - RECORD_VIEW.target[0], RECORD_VIEW.position[2] - RECORD_VIEW.target[2]);
      controls.minAzimuthAngle = theta - RECORD_VIEW.azimuthHalfRange; controls.maxAzimuthAngle = theta + RECORD_VIEW.azimuthHalfRange;
      controls.minDistance = RECORD_VIEW.minDistance; controls.maxDistance = RECORD_VIEW.maxDistance;
      controls.rotateSpeed = RECORD_VIEW.rotateSpeed; controls.zoomSpeed = RECORD_VIEW.zoomSpeed;
      tweenNook(camera.position, controls.target, camera.fov, new THREE.Vector3(...RECORD_VIEW.position), new THREE.Vector3(...RECORD_VIEW.target), recordFov(camera.aspect));
      refreshMugSteam();
    } else {
      const saved = recordSaved;
      if (nookTween) { cancelAnimationFrame(nookTween); nookTween = null; }
      camera.position.copy(saved.position); controls.target.copy(saved.target);
      camera.fov = compactCameraActive ? PORTRAIT_CAMERA.fov : DESKTOP_CAMERA.fov; camera.updateProjectionMatrix();
      controls.minAzimuthAngle = saved.minAzimuth; controls.maxAzimuthAngle = saved.maxAzimuth;
      controls.minDistance = saved.minDistance; controls.maxDistance = saved.maxDistance;
      controls.rotateSpeed = saved.rotateSpeed; controls.zoomSpeed = saved.zoomSpeed;
      recordSaved = null;
      controls.update(); render(); refreshMugSteam();
    }
  }
  function centerPointerDown(event) {
    if (!centerView || !event.isPrimary || event.button !== 0) return;
    centerPointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
  }
  function centerPointerMove(event) {
    if (!centerView || !centerPointer || centerPointer.id !== event.pointerId) return;
    const height = Math.max(1, canvas.clientHeight);
    centerView.yaw -= (event.clientX - centerPointer.x) * 3 / height;
    centerView.pitch = THREE.MathUtils.clamp(centerView.pitch + (event.clientY - centerPointer.y) * 2 / height, -0.5, 0.5);
    centerPointer.x = event.clientX; centerPointer.y = event.clientY;
    renderCenterView();
  }
  function centerPointerEnd(event) { if (centerPointer?.id === event.pointerId) centerPointer = null; }
  function centerKey(event) {
    if (!centerView || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'ArrowLeft') centerView.yaw -= 0.12;
    if (event.key === 'ArrowRight') centerView.yaw += 0.12;
    if (event.key === 'ArrowUp') centerView.pitch = THREE.MathUtils.clamp(centerView.pitch + 0.08, -0.5, 0.5);
    if (event.key === 'ArrowDown') centerView.pitch = THREE.MathUtils.clamp(centerView.pitch - 0.08, -0.5, 0.5);
    renderCenterView();
  }
  // Paul 2026-11-01: the things in the nook worth finding are the ones the closer view actually frames (the slippers and the basket sit below the frame
  // now that the view keeps the whole print in shot). The hint names three; the puppy on the console is the one a visitor finds on their own.
  const NOOK_HOTSPOTS = [
    { key: "totes", box: [[0.46, 0.42, 3.60], [0.94, 0.94, 3.76]], zh: "帆布袋掛在門邊，明天要帶去市場。", en: "The canvas totes wait by the door; market tomorrow." },
    // The note comes BEFORE the board: a tap picks the first box that holds the point, and the board's box covers the whole cork.
    { key: "note", box: [[0.355, 0.88, 3.70], [0.435, 0.95, 3.76]], zh: "便條 3/3：「桌上有檸檬水，慢慢來。」", en: "Note 3/3: “There's lemon water on the table. Take your time.”" },
    { key: "corkboard", box: [[0.06, 0.82, 3.70], [0.48, 1.18, 3.76]], zh: "軟木板上的蠟筆畫，是小姪女畫的。", en: "The crayon drawing on the board is from my niece." },
    { key: "keyShelf", box: [[0.16, 0.36, 3.58], [0.48, 0.50, 3.76]], zh: "鑰匙層板：回家先把鑰匙放下。", en: "The key shelf: keys land here before anything else." },
    { key: "puppy", box: [[-0.50, 0.57, 3.36], [-0.29, 0.71, 3.57]], zh: "小狗在等誰回家，等到睡著了。", en: "The puppy fell asleep waiting for someone to come home." },
    { key: "cableCar", box: [[-0.86, 0.575, 3.39], [-0.70, 0.75, 3.65]], zh: "從餐櫃搬來的小纜車，現在住在這個角落。", en: "The little cable car moved from the credenza to this nook." },
  ];
  let nookLang = new URLSearchParams(location.search).get("lang") === "en" ? "en" : "zh";
  let nookCaptionKey = null, nookHintShown = false, nookCaptionTimer = 0;
  const nookCaption = document.createElement("div");
  nookCaption.id = "nookCaption";
  nookCaption.setAttribute("role", "status");
  nookCaption.setAttribute("aria-live", "polite");
  Object.assign(nookCaption.style, {
    position: "absolute", left: "50%", bottom: "16%", transform: "translateX(-50%)", maxWidth: "min(84%, 460px)",
    padding: "9px 16px", borderRadius: "999px", background: "rgba(24,28,26,0.82)", color: "#f4efe6",
    font: "500 14px/1.45 system-ui, -apple-system, 'Segoe UI', sans-serif", textAlign: "center",
    pointerEvents: "none", opacity: "0", transition: "opacity 240ms ease", zIndex: "5",
  });
  (canvas.parentElement || document.body).appendChild(nookCaption);
  const nookCaptionText = (key) => { const spot = NOOK_HOTSPOTS.find((s) => s.key === key); return spot ? spot[nookLang] : ""; };
  function showNookCaption(text, key = null, hold = 4600) {
    nookCaptionKey = key;
    nookCaption.textContent = text;
    nookCaption.style.opacity = "1";
    clearTimeout(nookCaptionTimer);
    nookCaptionTimer = setTimeout(() => { nookCaption.style.opacity = "0"; nookCaptionKey = null; }, hold);
  }
  function showNookHint() {
    if (nookHintShown) return;
    nookHintShown = true;
    showNookCaption(nookLang === "zh" ? "點一下：帆布袋、軟木板、鑰匙層板。" : "Tap: totes, board, key shelf.", null, 4200);
  }
  // The record player (Paul, 2026-11-18): Room 03's own piece "灣區午後" plays first, then Room 02's "布魯克林窗台" and Room 04's "午後弄堂", each once through, round and round
  // like Room 04's playlist, until the next tap stops it. Sound can only start inside a tap, and the piano samples (about 1 MB) are fetched on the first tap, never before. After the first tap the
  // next piece starts from a timer, which browsers allow once the page has made sound.
  const recordBay = createBayRecord(), recordA = createRoomRecord(), recordB = createRoomSound(), recordEpic = createNightMusic();
  // [engine, bars to play once through, how to start it]. 午後弄堂 is about 5 dB softer than the others (measured), so it plays 1.4x louder here (+3 dB), as before.
  const RECORD_PIECES = [[recordBay, BAY_BARS, () => recordBay.start()], [recordA, 16, () => recordA.start(0)], [recordB, 12, () => recordB.start(1, false, { playlist: false, level: 1.4 })], [recordEpic, 16, () => recordEpic.start(0, { playlist: false })], [recordEpic, 16, () => recordEpic.start(1, { playlist: false })]];
  let recordSide = -1; // -1 stopped, 0 灣區午後, 1 布魯克林窗台, 2 午後弄堂, 3 追劇夜 (the epic orchestral piece; it is the first piece when the mood is movie night), 4 窗邊的午後 (Room 01's day piece, Paul 2026-11-22; the same night engine, its second piece)
  let syncRecordMotion = null; // Card I: set once the record player is built; turns the platter and drops the arm while a piece plays
  let recordTimer = 0;
  const stopRecords = () => { clearInterval(recordTimer); recordTimer = 0; for (const [engine] of RECORD_PIECES) engine.stop(); recordSide = -1; if (typeof refreshMugSteam === "function") refreshMugSteam(); syncRecordMotion?.(); };
  const playRecordPiece = (side) => { RECORD_PIECES.forEach(([engine], i) => { if (i !== side) engine.stop(); }); recordSide = RECORD_PIECES[side][2]() ? side : -1; return recordSide; };
  const advanceRecord = () => { // the next piece, a moment before the last bar of this one ends (bars counts bars already scheduled, 0.6 s ahead)
    let next = (recordSide + 1) % RECORD_PIECES.length; if (next === 3 && currentMood !== "movie") next = 4; // the epic piece only joins the round on movie night
    if (playRecordPiece(next) < 0) { stopRecords(); return; }
    showNookCaption(RECORD_CAPTIONS[next][nookLang], null, 3500); refreshMugSteam(); syncRecordMotion?.();
  };
  const watchRecord = () => { if (recordSide >= 0) { const [engine, bars] = RECORD_PIECES[recordSide]; if (engine.state().bars > bars) advanceRecord(); } };
  const nextRecord = () => { // one tap plays (from the first piece), the next tap stops
    if (recordSide === -1) { if (playRecordPiece(currentMood === "movie" ? 3 : 0) >= 0) { clearInterval(recordTimer); recordTimer = setInterval(watchRecord, 400); } }
    else stopRecords();
    refreshMugSteam(); syncRecordMotion?.();
    return recordSide;
  };
  const RECORD_CAPTIONS = [ // short on purpose: the line sits over the picture and must not cover the turntable
    { zh: "♪ 灣區午後　再點停止", en: "♪ Bay Area Afternoon · tap to stop" },
    { zh: "♪ 布魯克林窗台　再點停止", en: "♪ Brooklyn Windowsill · tap to stop" },
    { zh: "♪ 午後弄堂　再點停止", en: "♪ Afternoon Lane · tap to stop" },
    { zh: "♪ 追劇夜　再點停止", en: "♪ Series Night · tap to stop" },
    { zh: "♪ 窗邊的午後　再點停止", en: "♪ Afternoon by the Window · tap to stop" },
    { zh: "唱片收起來了", en: "Record put away" },
    { zh: "這台裝置放不出聲音", en: "No sound on this device" },
  ];

  const onRecordHidden = () => { if (document.hidden && recordSide !== -1) stopRecords(); }; // a phone that leaves the page stops the record
  document.addEventListener("visibilitychange", onRecordHidden);
  // A discoverable record-player cue (a glowing ring until it is found) and the tap that plays the record.
  let vinylFound = false, vinylTap = null;
  const vinylReadyAt = performance.now(), vinylRing = document.createElement("div"), vinylStyle = document.createElement("style");
  vinylRing.id = "vinylRing"; vinylRing.setAttribute("aria-hidden", "true"); vinylRing.hidden = true;
  vinylStyle.textContent = "#vinylRing{position:absolute;z-index:4;width:62px;height:62px;margin:-31px 0 0 -31px;border:3px solid #ffe2a8;border-radius:50%;background:radial-gradient(circle,rgba(255,214,150,.3),transparent 70%);box-shadow:0 0 18px 5px rgba(255,190,90,.8);pointer-events:none;animation:vinylPulse 1.9s ease-out infinite}#vinylRing[hidden]{display:none}@keyframes vinylPulse{0%{transform:scale(.72);opacity:1}80%,100%{transform:scale(1.35);opacity:0}}@media(prefers-reduced-motion:reduce){#vinylRing{animation:none}}";
  document.head.append(vinylStyle); (canvas.parentElement || stage).append(vinylRing);
  const vinylPoint = () => {
    scene.updateMatrixWorld(true); camera.updateMatrixWorld();
    const p = new THREE.Vector3(2.77, 0.875, 0.53).project(camera), rect = canvas.getBoundingClientRect();
    if (p.z >= 1 || Math.abs(p.x) > 0.9 || Math.abs(p.y) > 0.9) return null;
    return { x: rect.left + (p.x + 1) * rect.width / 2, y: rect.top + (1 - p.y) * rect.height / 2 };
  };
  const positionVinylRing = () => {
    const p = !vinylFound && performance.now() - vinylReadyAt > 4500 && !document.hidden ? vinylPoint() : null;
    vinylRing.hidden = !p;
    if (p) { const rect = vinylRing.parentElement.getBoundingClientRect(); vinylRing.style.left = `${p.x - rect.left}px`; vinylRing.style.top = `${p.y - rect.top}px`; }
  };
  const vinylTimer = setInterval(positionVinylRing, 1000);
  const vinylPointerDown = (event) => { if (event.isPrimary) vinylTap = { x: event.clientX, y: event.clientY }; };
  const vinylPointerUp = (event) => {
    if (!vinylTap || !event.isPrimary) return;
    const start = vinylTap; vinylTap = null;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) return;
    const p = vinylPoint(); if (!p) return;
    // the hit area follows how big the turntable looks on screen (a 14 cm platter radius), never smaller than a finger
    const edge = new THREE.Vector3(2.77, 0.875, 0.53 + 0.14).project(camera), rect = canvas.getBoundingClientRect();
    const radiusPx = Math.hypot((edge.x - ((p.x - rect.left) / rect.width * 2 - 1)) * rect.width / 2, (edge.y - (1 - (p.y - rect.top) / rect.height * 2)) * rect.height / 2);
    if (Math.hypot(event.clientX - p.x, event.clientY - p.y) > Math.max(34, radiusPx * 1.1)) return;
    vinylFound = true; positionVinylRing();
    const was = recordSide, now = nextRecord(), caption = RECORD_CAPTIONS[now >= 0 ? now : was === -1 ? 6 : 5];
    showNookCaption(caption[nookLang], null, now >= 0 ? 6500 : 3500);
  };
  canvas.addEventListener("pointerdown", vinylPointerDown);
  canvas.addEventListener("pointerup", vinylPointerUp);
  const nookRaycaster = new THREE.Raycaster();
  function nookSpotAt(clientX, clientY) {
    if (!nookSaved) return null;
    const rect = canvas.getBoundingClientRect();
    nookRaycaster.setFromCamera({ x: ((clientX - rect.left) / rect.width) * 2 - 1, y: -((clientY - rect.top) / rect.height) * 2 + 1 }, camera);
    const hits = nookRaycaster.intersectObjects(scene.children, true)
      .filter((hit) => hit.object.visible && hit.object.name !== "room03-nook-downlight-halo" && !(hit.object.material?.transparent && hit.object.material?.opacity < 0.5));
    if (!hits.length) return null;
    const point = hits[0].point;
    const direct = NOOK_HOTSPOTS.find((spot) => point.x >= spot.box[0][0] && point.x <= spot.box[1][0] && point.y >= spot.box[0][1] && point.y <= spot.box[1][1] && point.z >= spot.box[0][2] && point.z <= spot.box[1][2]);
    if (direct) return direct;
    // A console leg or the bench frame can sit in front of a small prop; a ray that passes within 9 cm of a prop's centre still counts as a
    // click on it, so the basket under the TV does not need pixel hunting through the leg.
    let nearest = null, nearestDistance = 0.09;
    for (const spot of NOOK_HOTSPOTS) {
      const centre = new THREE.Vector3((spot.box[0][0] + spot.box[1][0]) / 2, (spot.box[0][1] + spot.box[1][1]) / 2, (spot.box[0][2] + spot.box[1][2]) / 2);
      const offset = centre.clone().sub(nookRaycaster.ray.origin);
      const along = offset.dot(nookRaycaster.ray.direction);
      if (along <= 0) continue;
      const distance = offset.clone().addScaledVector(nookRaycaster.ray.direction, -along).length();
      if (distance < nearestDistance) { nearestDistance = distance; nearest = spot; }
    }
    return nearest;
  }
  let nookPointer = null;
  canvas.addEventListener("pointerdown", (event) => { if (!nookSaved || !event.isPrimary) return; nookPointer = { x: event.clientX, y: event.clientY }; });
  canvas.addEventListener("pointerup", (event) => {
    if (!nookPointer || !event.isPrimary) return;
    const moved = Math.hypot(event.clientX - nookPointer.x, event.clientY - nookPointer.y);
    nookPointer = null;
    if (moved > 6) return;
    const spot = nookSpotAt(event.clientX, event.clientY);
    if (spot) showNookCaption(nookCaptionText(spot.key), spot.key);
  });
  // The panel end must stay behind the hall's side wall from every camera the nook view allows (Paul 2026-11-01). Raycast the end point: a closer
  // opaque hit means the cut edge is hidden.
  function nookTvCutHidden() {
    const end = new THREE.Vector3(-1.687, 1.0, 3.70), direction = end.clone().sub(camera.position), distance = direction.length();
    nookRaycaster.set(camera.position, direction.normalize());
    const hit = nookRaycaster.intersectObjects(scene.children, true)
      .find((candidate) => candidate.object.visible && !(candidate.object.material?.transparent && candidate.object.material?.opacity < 0.5));
    return Boolean(hit && hit.distance < distance - 0.01);
  }
  function nookHotspotInfo() {
    const rect = canvas.getBoundingClientRect(), screen = {}, probe = new THREE.Vector3();
    for (const spot of NOOK_HOTSPOTS) {
      probe.set((spot.box[0][0] + spot.box[1][0]) / 2, (spot.box[0][1] + spot.box[1][1]) / 2, (spot.box[0][2] + spot.box[1][2]) / 2).project(camera);
      screen[spot.key] = [rect.left + ((probe.x + 1) / 2) * rect.width, rect.top + ((1 - probe.y) / 2) * rect.height];
    }
    return { keys: NOOK_HOTSPOTS.map((spot) => spot.key), caption: nookCaption.textContent, visible: nookCaption.style.opacity === "1", hintShown: nookHintShown, tvCutHidden: nookTvCutHidden(), screen };
  }
  canvas.addEventListener('pointerdown', centerPointerDown);
  canvas.addEventListener('pointermove', centerPointerMove);
  canvas.addEventListener('pointerup', centerPointerEnd);
  canvas.addEventListener('pointercancel', centerPointerEnd);
  canvas.addEventListener('keydown', centerKey);
  const materials = makeMaterials();
  // Soft reflections (ported from Room 02): a tiny made-up room - pale ceiling, warm floor, one bright window panel - baked into an
  // environment map and given ONLY to the metals and glazes below. scene.environment stays unset, so walls, floor and wood keep their
  // exact lighting and no existing luminance check moves. Zero new meshes, zero draw calls.
  const reflectiveBase = { wokSteel: 0.15, hoodSteel: 0.2, steel: 0.3, brass: 0.9, sinkSteel: 0.5, faucetSteel: 0.9, mugGlaze: 0.45, porcelain: 0.35, red: 0.4, oilGlass: 0.5, waterSetGlass: 1.8 };
  const reflectionMoodScale = { daylight: 1, golden: 0.8, movie: 0.3, night: 0.3, dinner: 0.6, sunday: 0.9, thanksgiving: 0.6 };
  const reflectionEnv = (() => {
    const room = new THREE.Scene();
    const cv = document.createElement("canvas"); cv.width = 8; cv.height = 256;
    const ctx = cv.getContext("2d"), g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, "#fbf6ec"); g.addColorStop(0.5, "#d8d0c0"); g.addColorStop(1, "#a88c6a");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 8, 256);
    const gradient = new THREE.CanvasTexture(cv); gradient.colorSpace = THREE.SRGBColorSpace;
    room.add(new THREE.Mesh(new THREE.BoxGeometry(8, 5, 8), new THREE.MeshBasicMaterial({ map: gradient, side: THREE.BackSide })));
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.5), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    panel.position.set(0, 0, -3.9); room.add(panel);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const texture = pmrem.fromScene(room, 0.04).texture; pmrem.dispose();
    return texture;
  })();
  for (const key of Object.keys(reflectiveBase)) if (materials[key]) materials[key].envMap = reflectionEnv;
  function applyReflections(moodName) {
    const scale = reflectionMoodScale[moodName] ?? 1;
    for (const [key, base] of Object.entries(reflectiveBase)) if (materials[key]) materials[key].envMapIntensity = base * scale;
  }
  const WALL_FINISHES = Object.freeze({ mist: 0xd0deea, cream: 0xe6ddcc, sage: 0xcbd2c0, oat: 0xd9cbb6 });
  // Keep the entry nook's approved dusty-pink default for mist-blue, while the other room palettes carry through to its three inner walls.
  const ENTRY_HALL_WALL_FINISHES = Object.freeze({ mist: 0xe9bdb9, cream: 0xe6ddcc, sage: 0xcbd2c0, oat: 0xd9cbb6 });
  let entryHallWallMaterial = null;
  // Oak plank floor ported from Room 02 (bedroom/art/room02-brooklyn-oak-floor-v1.webp, narrow-strip oak, one picture is about 1.2 m of boards).
  // Paul 2026-11-04: the default Room 03 floor is wood like Rooms 01 and 02; the random looks still use terrazzo, cork and concrete.
  const makeOakPlankTexture = () => {
    const texture = new THREE.TextureLoader().load(new URL("../bedroom/art/room02-brooklyn-oak-floor-v1.webp", import.meta.url).href, () => render());
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(ROOM.width / 1.2, ROOM.depth / 1.2);
    texture.anisotropy = 8;
    return texture;
  };
  const FLOOR_FINISHES = Object.freeze({
    // lift: the Room 02 oak photo is darker than terrazzo and the mood floor colours were tuned for terrazzo, so oak is lifted in linear light (Paul 2026-11-04: brighten the floor a little).
    oak: { make: makeOakPlankTexture, tint: 0xfff6ea, lift: 1.25 },
    terrazzo: { make: makeTerrazzoTexture, tint: 0xffffff },
    cork: { make: makeCorkFloorTexture, tint: 0xfff4df },
    concrete: { make: () => makeFloorTexture(31, 0.18), tint: 0xf0f1ef },
  });
  const RUG_FINISHES = Object.freeze({ "blue-stripe": "blue-stripe", jute: "jute", stripe: "stripe", geometric: "geometric" });
  const surfaceFinish = { wall: "mist", floor: "oak", rug: "blue-stripe" };
  { const previous = materials.floor.map; materials.floor.map = FLOOR_FINISHES.oak.make(); previous?.dispose(); materials.floor.needsUpdate = true; }
  function applySurfaceFinish() {
    const look = MOOD_LOOK[currentMood];
    materials.wall.color.setHex(WALL_FINISHES[surfaceFinish.wall]);
    if (entryHallWallMaterial) entryHallWallMaterial.color.setHex(ENTRY_HALL_WALL_FINISHES[surfaceFinish.wall]);
    materials.floor.color.setHex(look.floor).multiply(new THREE.Color(FLOOR_FINISHES[surfaceFinish.floor].tint)).multiplyScalar(FLOOR_FINISHES[surfaceFinish.floor].lift ?? 1);
    materials.jute.color.setHex(look.jute);
  }
  function setSurfaceFinish(next = {}) {
    const wall = next.wall ?? surfaceFinish.wall;
    const floor = next.floor ?? surfaceFinish.floor;
    const rug = next.rug ?? surfaceFinish.rug;
    if (!(wall in WALL_FINISHES) || !(floor in FLOOR_FINISHES) || !(rug in RUG_FINISHES)) return false;
    if (floor !== surfaceFinish.floor) {
      const previous = materials.floor.map;
      materials.floor.map = FLOOR_FINISHES[floor].make();
      previous?.dispose();
      materials.floor.needsUpdate = true;
    }
    if (rug !== surfaceFinish.rug) {
      const previous = materials.jute.map;
      materials.jute.map = makeRugTexture(RUG_FINISHES[rug]);
      previous?.dispose();
      materials.jute.needsUpdate = true;
    }
    Object.assign(surfaceFinish, { wall, floor, rug });
    applySurfaceFinish(); render();
    return { ...surfaceFinish };
  }
  const buckets = new Map();
  let yardLoaded = false;
  let wallArtLoaded = false;
  let wallArtSettled = 0;
  let firstFrameRendered = false;
  buildArchitecture(buckets, materials, scene, () => { yardLoaded = true; render(); });
  {
    // The entry hall: the front wall (two piers and a lintel), the floor and ceiling slabs keep the room's mist blue; the three walls inside the hall
    // are dusty pink (Paul 2026-10-31: blue everywhere made the small room read flat). One mesh, two materials.
    const BLUE_BOXES = [
      [[2.1, 2.7, 0.12], [-2.05, 1.35, 2.4]], [[2.1, 2.7, 0.12], [2.05, 1.35, 2.4]], [[2.0, 0.6, 0.12], [0, 2.4, 2.4]],
      [[3.5, 0.12, 1.4], [0, -0.06, 3.1]], [[3.5, 0.12, 1.4], [0, 2.64, 3.1]],
    ];
    const PINK_BOXES = [[[0.12, 2.7, 1.4], [-1.7, 1.35, 3.1]], [[0.12, 2.7, 1.4], [1.7, 1.35, 3.1]], [[3.5, 2.7, 0.12], [0, 1.35, 3.8]]];
    const merge = (list) => {
      const parts = list.map(([size, position]) => { const geometry = new THREE.BoxGeometry(...size); geometry.translate(...position); return geometry; });
      const merged = mergeGeometries(parts, false); parts.forEach((part) => part.dispose()); return merged;
    };
    const blueGeometry = merge(BLUE_BOXES), pinkGeometry = merge(PINK_BOXES);
    const geometry = mergeGeometries([blueGeometry, pinkGeometry], true); blueGeometry.dispose(); pinkGeometry.dispose(); geometry.computeVertexNormals();
    const pinkWall = materials.wall.clone(); pinkWall.name = "wall-entry-hall-pink"; pinkWall.color.setHex(0xe9bdb9);
    entryHallWallMaterial = pinkWall;
    entryHallWallMaterial.color.setHex(ENTRY_HALL_WALL_FINISHES[surfaceFinish.wall]);
    const hall = new THREE.Mesh(geometry, [materials.wall, pinkWall]); hall.name = "entry-hall"; hall.userData.category = "entry-architecture"; hall.castShadow = false; hall.receiveShadow = true; scene.add(hall);
  }
  const kitchenFixtures = buildKitchen(buckets, materials);
  buildSideKitchen(buckets, materials, scene);
  {
    const wokTileState = scene.userData.wokTile;
    new THREE.TextureLoader().load(new URL("./art/tile-b-subway.webp", import.meta.url).href, (texture) => {
      if (!firstFrameRendered) wokTileState.readyBeforeFirstPaint = true;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      wokTileState.material.map = texture;
      wokTileState.material.color.setHex(0xffffff);
      wokTileState.material.roughness = 0.86;
      wokTileState.material.needsUpdate = true;
      wokTileState.status = "loaded";
      materials.mainTile.map = texture;
      materials.mainTile.color.setHex(0xdde5d0);
      materials.mainTile.roughness = 0.8;
      materials.mainTile.needsUpdate = true;
      render();
    }, undefined, () => {
      wokTileState.material.map = null;
      wokTileState.material.color.setHex(0xc9c0ae);
      wokTileState.material.roughness = materials.stone.roughness;
      wokTileState.material.needsUpdate = true;
      wokTileState.status = "failed";
      materials.mainTile.map = null;
      materials.mainTile.needsUpdate = true;
      render();
    });
  }
  buildTable(buckets, materials);
  const diningChairSeatGap = buildProceduralDiningChairs(scene, materials);
  buildHouseholdProps(scene, materials, () => render());
  const dishDryer = buildDishDryer(scene, materials);
  let credenza = null;
  const loungeChair = buildLoungeChair(scene, materials);
  const loungeOttoman = buildLoungeOttoman(scene, materials, loungeChair);
  const entryNook = buildEntryNook(scene, materials);
  const nookDecor = buildRoom03NookDecor(scene);
  const room03Curtains = buildRoom03WindowCurtains(scene, materials);
  const entryWallDetails = buildRoom03EntryWallDetails(scene);
  const kitchenHub = buildRoom03KitchenHub(scene);
  const wokTools = buildRoom03WokTools(scene);
  const counterFresh = buildRoom03CounterFresh(scene);
  const lampBlanket = buildRoom03LampBlanket(scene);
  const woodGeometries = [];
  const wallArt = buildRoomWallArt(scene, materials, woodGeometries);
  const grasscloth = makeGrasscloth(scene);
  credenza = buildRightWallCredenza(scene, materials);
  const credenzaDecor = buildRoom03CredenzaDecor(scene);
  const recordPlayer = buildRoom03RecordPlayer(scene);
  const outlets = buildRoom03Outlets(scene); // a counter GFCI and the floor lamp's outlet with its cord (Paul, 2026-11-19)
  syncRecordMotion = () => recordPlayer.setPlaying(recordSide >= 0, render);
  // Paul 2026-11-18, a desktop-only easter egg: the mist-blue "Shanghai Slowly Cafe" cup by the record player is a way to Room 04. With a mouse (fine pointer that can hover),
  // the cup glows softly and shows a pointer and a small tip under the cursor; a click (not a drag) goes to the cafe. The ray is tested against the cup's own box only, so
  // nothing else in the room reacts, and phones and tablets are unchanged.
  const cupPortal = (() => {
    const fit = credenzaDecor?.cups?.find((cup) => cup.name === "mist-blue-kraft"), label = scene.getObjectByName("room03-takeaway-cup-label");
    if (!fit) return null;
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const box = new THREE.Box3(new THREE.Vector3(...fit.bounds.min), new THREE.Vector3(...fit.bounds.max)), ray = new THREE.Raycaster();
    const tip = document.createElement("div"); tip.id = "cupPortalTip"; tip.hidden = true;
    tip.style.cssText = "position:absolute;z-index:6;padding:5px 10px;border-radius:999px;background:#2b2118e6;color:#fff;font:700 12px/1.2 system-ui,'Noto Sans TC',sans-serif;pointer-events:none;white-space:nowrap;transform:translate(14px,-130%)";
    (canvas.parentElement || document.body).append(tip);
    const url = () => `/prototype/roomverse-3d/cafe/?lang=${nookLang}`;
    let hover = false, down = null;
    const over = (event) => {
      const rect = canvas.getBoundingClientRect();
      ray.setFromCamera({ x: ((event.clientX - rect.left) / rect.width) * 2 - 1, y: -((event.clientY - rect.top) / rect.height) * 2 + 1 }, camera);
      return ray.ray.intersectsBox(box);
    };
    const setHover = (on, event) => {
      if (on && event) { const rect = tip.parentElement.getBoundingClientRect(); tip.style.left = `${event.clientX - rect.left}px`; tip.style.top = `${event.clientY - rect.top}px`; }
      if (on === hover) return;
      hover = on; canvas.style.cursor = on ? "pointer" : "";
      tip.textContent = nookLang === "zh" ? "去 Shanghai Slowly Cafe →" : "To Shanghai Slowly Cafe →"; tip.hidden = !on;
      if (label) { label.material.emissive.setHex(on ? 0xffc27a : 0x000000); label.material.emissiveIntensity = on ? 0.45 : 0; }
      render();
    };
    const usable = (event) => fine.matches && event.pointerType === "mouse" && event.isPrimary;
    canvas.addEventListener("pointermove", (event) => { if (down && Math.hypot(event.clientX - down.x, event.clientY - down.y) > 6) down.moved = true; if (!usable(event)) return; if (event.buttons) { if (hover) setHover(false); return; } setHover(over(event), event); });
    canvas.addEventListener("pointerleave", () => { if (hover) setHover(false); });
    canvas.addEventListener("pointerdown", (event) => { down = usable(event) && over(event) ? { x: event.clientX, y: event.clientY } : null; });
    canvas.addEventListener("pointerup", (event) => {
      const start = down; down = null;
      if (!start || start.moved || !usable(event) || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6 || !over(event)) return; // a drag turns the camera, it does not travel
      location.assign(url());
    });
    return { box, url, hovering: () => hover, fine: () => fine.matches };
  })();
  const mediaUnit = buildRoom03MediaUnit(scene, materials, woodGeometries);
  const mediaWoodwork = addRoom03Woodwork(scene, materials.oak, woodGeometries);
  const moodSlots = { screen: mediaUnit.screen, tabletopCenterpiece: scene.getObjectByName("mood-slot-tabletop-centerpiece"), tableware: null };
  let tablewareGroup = null, thanksgivingGroup = null, paperNapkinPack = null, roomDoor = null;
  assemble(buckets, scene);
  const sunTarget = new THREE.Object3D(); sunTarget.position.set(0, 0, 0); scene.add(sunTarget);
  const sun = new THREE.DirectionalLight(0xffd6a1, 2.4); sun.position.set(-4.2, 1.2, 3.6); sun.target = sunTarget; sun.castShadow = true;
  // 2048 on desktop, 1024 on phones: the shadow camera still covers the room, but phones get a quarter of the texels so the
  // per-frame depth pass stays cheap (no real-device numbers yet — Paul measures iPhone FPS/heat).
  sun.shadow.mapSize.set(compact ? 1024 : 2048, compact ? 1024 : 2048);
  sun.shadow.camera.left = -4; sun.shadow.camera.right = 4; sun.shadow.camera.top = 4; sun.shadow.camera.bottom = -4;
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02; sun.shadow.radius = 4; scene.add(sun);
  const hemi = new THREE.HemisphereLight(0xfff0d4, 0x6f6658, 0.68); scene.add(hemi);
  const ambient = new THREE.AmbientLight(0xffffff, 0.28); scene.add(ambient);
  const pendantLight = buildPendant(scene, materials);
  // The pendant is the only real light at night: casting a shadow from it is what puts the plant, table and chairs on the
  // floor at night. Desktop only for now; phones keep it off until Paul has looked at an iPhone.
  pendantLight.castShadow = !compact;
  pendantLight.shadow.mapSize.set(512, 512);
  pendantLight.shadow.bias = -0.004;
  pendantLight.shadow.camera.near = 0.1;
  pendantLight.shadow.camera.far = 6;
  const furniture = loadFurniture(scene, materials);
  const underLight = new THREE.SpotLight(0xffca91, 0, 2.8, Math.PI / 3.5, 0.65, 2); underLight.position.set(0, 1.42, -1.82); underLight.target.position.set(0, 0.96, -1.45); scene.add(underLight, underLight.target);
  const sideLight = [...scene.children].find((o) => o.name === "side-kitchen-warm-source");
  buildRedPot(scene, materials);
  const sunlightPatch = new THREE.Mesh(new THREE.PlaneGeometry(3.35, 1.85), materials.sunlight);
  sunlightPatch.rotation.set(-Math.PI / 2, 0, 0);
  sunlightPatch.position.set(-1.15, 0.012, 0.48);
  sunlightPatch.name = "golden-hour-floor-patch";
  sunlightPatch.userData.category = "lighting";
  scene.add(sunlightPatch);
  // PR2: every piece that should sit on the floor shares one merged contact-shadow mesh (one material, one draw call).
  // Parts stay in this order: four dining-table feet, four chairs' foot dots, then island front edge, side-kitchen front
  // edge and the four lounge-chair feet. The #576 fig-pot patch is not in this list. The QA hook aligns the dining patches by index, so that order matters.
  // Night keeps a fainter decal than golden: the pendant point light already draws a real shadow there and two dark layers
  // would read as a stain. Candidate strengths: faint = { golden: 0.20, night: 0.08 }, recommended here = 0.30 / 0.12.
  const CONTACT_SHADOW_ALPHA = Object.freeze({ golden: 0.30, night: 0.12 });
  const contactShadowParts = [];
  const addContactPatch = (x, z, width, depth, y) => {
    const patch = new THREE.PlaneGeometry(width, depth);
    patch.rotateX(-Math.PI / 2);
    patch.translate(x, y, z);
    contactShadowParts.push(patch);
  };
  // Rug surface is at y 0.02, so the dining decals sit 1 mm above it; floor decals sit 3-4 mm above the boards.
  for (const x of [-0.82, 0.82]) for (const z of [0.19, 0.81]) addContactPatch(x, z, 0.16, 0.14, 0.021);
  for (const placement of DINING_CHAIR_PLACEMENTS) {
    const chairMatrix = new THREE.Matrix4().compose(
      new THREE.Vector3(...placement.position),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, placement.yaw, 0)),
      new THREE.Vector3(1, 1, 1),
    );
    for (const [legX, legZ] of DINING_CHAIR_FOOT_CENTERS) {
      const patch = new THREE.PlaneGeometry(0.11, 0.10);
      patch.rotateX(-Math.PI / 2);
      patch.translate(legX, 0.021, legZ);
      patch.applyMatrix4(chairMatrix);
      contactShadowParts.push(patch);
    }
  }
  const diningContactPatchCount = contactShadowParts.length; // 4 table feet + 16 chair feet
  // A long soft band under the island/back cabinets and under the side kitchen run, so the toe kick meets the floor.
  const addContactStrip = (name, frontAxis, depth, lengthCap) => {
    const object = scene.getObjectByName(name);
    if (!object) return;
    const bounds = new THREE.Box3().setFromObject(object);
    if (!Number.isFinite(bounds.min.x)) return;
    if (frontAxis === "+z") {
      const width = Math.min(lengthCap, (bounds.max.x - bounds.min.x) * 0.92);
      addContactPatch((bounds.min.x + bounds.max.x) / 2, bounds.max.z - depth * 0.15, width, depth, 0.004);
    } else {
      const length = Math.min(lengthCap, (bounds.max.z - bounds.min.z) * 0.92);
      addContactPatch(bounds.min.x + depth * 0.15, (bounds.min.z + bounds.max.z) / 2, depth, length, 0.004);
    }
  };
  addContactStrip("merged-kitchen", "+z", 0.34, 2.7);
  // The side-kitchen strip follows the continuous base cabinet, not the old door frame.
  addContactStrip("merged-wok-base-cabinet", "-x", 0.28, 1.5);
  // Ottoman feet: one soft decal under each, like the chair's.
  for (const [footX, footZ] of loungeOttoman.userData.feet.map(([x, , z]) => [x, z])) addContactPatch(footX, footZ, 0.10, 0.09, 0.003);
  // The fig pot patch from #576 is gone with the plant. Lounge-chair feet keep their four patches.
  for (const [localX, localZ] of [[-0.26, -0.25], [-0.26, 0.25], [0.26, -0.25], [0.26, 0.25]]) {
    const patch = new THREE.PlaneGeometry(0.18, 0.15);
    patch.rotateX(-Math.PI / 2);
    patch.translate(localX, 0.003, localZ);
    patch.applyMatrix4(new THREE.Matrix4().compose(
      new THREE.Vector3(...LOUNGE_PLACEMENT.position),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, LOUNGE_PLACEMENT.yaw, 0)),
      new THREE.Vector3(1, 1, 1),
    ));
    contactShadowParts.push(patch);
  }
  // Entry nook props (Paul 2026-11-01: the shoe tray, the pampas vase and the bench sat on the new rug without any shadow, so they floated).
  // The bench feet stand on the kilim (surface y 0.012), the tray and the vase on the floor. Same merged decal mesh, +24 vertices, no extra draw call.
  for (const [benchX, benchZ] of [[-0.80, 2.63], [0.00, 2.63], [-0.80, 2.97], [0.00, 2.97]]) addContactPatch(benchX, benchZ, 0.07, 0.07, 0.013);
  addContactPatch(0.73, 3.46, 0.40, 0.36, 0.003);
  addContactPatch(0.84, 3.02, 0.20, 0.20, 0.003);
  const contactShadow = new THREE.Mesh(
    mergeGeometries(contactShadowParts, false),
    new THREE.MeshBasicMaterial({
      map: makeLoungeShadowTexture(), transparent: true, opacity: CONTACT_SHADOW_ALPHA.golden,
      depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    }),
  );
  contactShadow.name = "room03-contact-shadows";
  contactShadow.userData.category = "contact-shadow";
  contactShadow.userData.patchCount = diningContactPatchCount;
  contactShadow.userData.totalPatchCount = contactShadowParts.length;
  contactShadow.renderOrder = 1;
  scene.add(contactShadow);
  contactShadowParts.forEach((geometry) => geometry.dispose());
  const makeBouncePlane = (name, size, position, rotation, color) => {
    const material = new THREE.MeshBasicMaterial({ color, map: materials.sunlight.map, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(...size), material);
    mesh.name = name; mesh.userData.category = "lighting";
    mesh.position.set(...position); mesh.rotation.set(...rotation);
    scene.add(mesh);
    return mesh;
  };
  const windowWallBounce = makeBouncePlane("window-wall-bounce", [1.3, 1.8], [-2.28, 1.22, -2.329], [0, 0, 0], 0xffd7a8);
  const pendantFloorBounce = makeBouncePlane("pendant-floor-bounce", [2.55, 1.9], [0, 0.027, 0.3], [-Math.PI / 2, 0, 0], 0xffcf91);
  const pendantCeilingBounce = makeBouncePlane("pendant-ceiling-bounce", [2.3, 1.65], [0, 2.601, 0.15], [Math.PI / 2, 0, 0], 0xffd5a0);

  // One table for every per-mood switch. Golden and night keep the values setMood used to
  // hard-code. Fields that have no mesh yet (blind, the three new lamps) are stored and applied
  // only when that object exists, so this table does not change the picture.
  // Keep the counterPendantEmissive field in the existing mood schema; its fixture was removed.
  const MOOD_LOOK_FIELDS = Object.freeze([
    "sun", "sunColor", "sunPosition", "hemi", "hemiSky", "hemiGround", "ambient", "ambientColor",
    "pendant", "under", "side", "exposure", "yard", "yardMap", "globe", "sky", "floor", "jute", "ceilingEmissive",
    "warmGlow", "wokGlow", "sunlightOpacity", "sunlightVisible", "windowWallBounce", "windowWallBounceVisible",
    "pendantFloorBounce", "pendantFloorBounceVisible", "pendantCeilingBounce", "pendantCeilingBounceVisible",
    "reveal", "contactShadow", "loungePillow", "screenColor", "screenToneMapped", "screenMap",
    "floorLamp", "tableLamp", "screenCool", "pictureLightEmissive", "counterPendantEmissive", "blind", "curtainColor", "tableware", "thanksgivingDecor", "artLight",
    "ceilingColor", "ceilingEmissiveColor", "beamColor", "tableTint", "cableCarArtGain",
  ]);
  const sharedLook = {
    sunColor: 0xffd6a1, sunPosition: [-4.2, 1.2, 3.6],
    hemiSky: 0xfff0d4, hemiGround: 0x6f6658, ambientColor: 0xffffff,
    sunlightOpacity: 0, sunlightVisible: false,
    pendantFloorBounce: 0, pendantFloorBounceVisible: false,
    loungePillow: 0x7f946c, screenColor: 0x171918, screenToneMapped: true, screenMap: null,
    cableCarArtGain: 0.86,
    floorLamp: 0, tableLamp: 0, screenCool: 0, pictureLightEmissive: 0, counterPendantEmissive: 0,
    yardMap: null,
    ceilingColor: COLORS.ceiling, ceilingEmissiveColor: 0xb7a68b, beamColor: COLORS.beam, tableTint: 0xffffff, curtainColor: 0xcdbfa8,
  };
  // Paul 2026-11-01: the brass gallery bar above the redwood print stays on in every mood, the way Room 01's picture lights do — low enough that it
  // only reads as "on" and never becomes a second key light on the canvas. Moods that already want it brighter keep their own value.
  const PICTURE_LIGHT_FLOOR = 0.32;
  const MOOD_LOOK = Object.freeze({
    // Bay Area daylight (Paul 2026-10-30: the golden look read as a video game at the door). Neutral-white sun, a cool pale sky, an untinted garden and
    // lighter, less orange wood overhead; golden hour stays as a choice.
    daylight: Object.freeze({
      ...sharedLook,
      sun: 1.25, sunColor: 0xfff3e6, sunPosition: [-3.9, 1.6, 3.2],
      hemi: 1.15, hemiSky: 0xf1f5fb, hemiGround: 0xd8d0c3, ambient: 0.36, pendant: 0.2, under: 0.70, side: 0.70,
      exposure: 0.96, yard: 0xc2c9cb, globe: 0.2, sky: "day",
      cableCarArtGain: 0.88,
      floor: 0xd8d8d2, jute: 0xcfc2a4, ceilingEmissive: 0.10,
      ceilingColor: 0xe8ddc9, ceilingEmissiveColor: 0xb4a995, beamColor: 0xebe4d6, tableTint: new THREE.Color().setRGB(1.0, 1.2, 1.6),
      warmGlow: 0.4, wokGlow: 0.6,
      windowWallBounce: 0.10, windowWallBounceVisible: true,
      pendantCeilingBounce: 0, pendantCeilingBounceVisible: false,
      reveal: 0.6, contactShadow: 0.30, blind: "open", curtainColor: 0xcdbfa8, tableware: false, thanksgivingDecor: false, artLight: [0.92, 0.92, 0.9],
    }),
    golden: Object.freeze({
      ...sharedLook,
      sun: 3.1, hemi: 0.55, ambient: 0.16, pendant: 0.32, under: 0.42, side: 0.48,
      exposure: 1.26, yard: 0xffd7a1, globe: 0.34, sky: "golden",
      cableCarArtGain: 0.74,
      floor: 0xcdbb9e, jute: 0xd0b47f, ceilingEmissive: 0.3,
      warmGlow: 0.72, wokGlow: 0.72,
      windowWallBounce: 0.12, windowWallBounceVisible: true,
      pendantCeilingBounce: 0, pendantCeilingBounceVisible: false,
      reveal: 0.72, contactShadow: 0.30, blind: "open", curtainColor: 0xd0bea0, tableware: false, thanksgivingDecor: false, artLight: [0.86, 0.84, 0.82],
    }),
    // Night (2026-11-12): the room measured as bright as daylight (mean luminance 116 vs 123 at 1440, 136 vs 123 on a phone) while the robot says
    // "just one small light on". The lamps keep their strength; the fill is lowered so they make a warm pool in a dark room
    // (exposure 1.20 -> 0.88, hemi 0.55 -> 0.34, ambient 0.26 -> 0.15, ceilingEmissive 0.55 -> 0.20).
    night: Object.freeze({
      ...sharedLook,
      sun: 0, hemi: 0.34, ambient: 0.15, pendant: 7.0, under: 2.7, side: 2.3,
      exposure: 0.88, yard: 0xd2dcf0, yardMap: "courtyard-night-moon-v1", globe: 1.55, sky: "night",
      cableCarArtGain: 0.78,
      floor: 0xc2a77b, jute: 0xd9c99f, ceilingEmissive: 0.20,
      warmGlow: 1, wokGlow: 1,
      windowWallBounce: 0, windowWallBounceVisible: false,
      pendantCeilingBounce: 0.05, pendantCeilingBounceVisible: true,
      reveal: 1, contactShadow: 0.12, blind: "closed", curtainColor: 0xaaa293, tableware: false, thanksgivingDecor: false, artLight: [0.52, 0.47, 0.42],
    }),
    // Movie night. Golden and night stay as they were. Sky reuses the night gradient
    // because there is no third sky texture; the yard tint is the movie color.
    // warmGlow, wokGlow, and reveal are not in the proposal table. They follow the
    // dimmer under/side lights so the strips do not stay at the night pendant values.
    movie: Object.freeze({
      ...sharedLook,
      sun: 0,
      hemi: 0.42, hemiSky: 0xc3cde8, hemiGround: 0x5a5668,
      ambient: 0.23, ambientColor: 0xd8e0f2,
      pendant: 0, under: 1.3, side: 0.85,
      exposure: 1.20, yard: 0x8d9ab8, yardMap: "courtyard-night-moon-v1", globe: 0.06, sky: "night",
      cableCarArtGain: 0.76,
      floor: 0xbfa982, jute: 0xcbb894, ceilingEmissive: 0.06,
      warmGlow: 0.55, wokGlow: 0.55,
      windowWallBounce: 0, windowWallBounceVisible: false,
      pendantCeilingBounce: 0, pendantCeilingBounceVisible: false,
      reveal: 0.40, contactShadow: 0.10,
      loungePillow: 0x8d95ad,
      screenColor: 0xffffff, screenToneMapped: false, screenMap: "screen-movie-city-night-v1",
      floorLamp: 3.1, tableLamp: 1.9, screenCool: 2.6,
      pictureLightEmissive: 0.5, counterPendantEmissive: 0.8,
      blind: "closed", curtainColor: 0x9da2a0, tableware: false, thanksgivingDecor: false, artLight: [0.5, 0.5, 0.52],
    }),
    // Dinner and Sunday morning. Sky stays the golden gradient; the yard tint carries
    // the recipe color. Jute and the pillow stay the golden cloth. The screen stays off.
    // Sun height is the y of the existing sun vector. warmGlow, wokGlow, reveal, and the
    // bounce planes are not in the proposal table.
    dinner: Object.freeze({
      ...sharedLook,
      // Paul 2026-11-06: dinner should read more like an evening meal, so the overall light is lower and the warm lamps carry it
      // (exposure 1.14 -> 0.96, sun 0.8 -> 0.5, hemi 0.70 -> 0.48, pendant 3.2 -> 2.6, under 1.6 -> 1.3, warmGlow 0.80 -> 0.62, reveal 0.55 -> 0.40, globe 0.55 -> 0.40).
      sun: 0.5, sunColor: 0xffb263, sunPosition: [-4.2, 1.15, 3.6],
      hemi: 0.48, hemiSky: 0xffe0bd, hemiGround: 0xc7a578,
      ambient: 0.18,
      pendant: 2.6, under: 1.3, side: 0,
      // Dinner is dusk: the golden-hour yard photo is tinted blue-hour so the window no longer reads as afternoon (Paul 2026-10-28).
      exposure: 0.96, yard: 0x6f7a96, globe: 0.40, sky: "golden",
      cableCarArtGain: 0.74,
      floor: 0xcdbb9e, jute: 0xd0b47f, ceilingEmissive: 0.22,
      warmGlow: 0.62, wokGlow: 0.25,
      windowWallBounce: 0.06, windowWallBounceVisible: true,
      pendantCeilingBounce: 0.03, pendantCeilingBounceVisible: true,
      reveal: 0.40, contactShadow: 0.26,
      floorLamp: 1.6, tableLamp: 2.4, screenCool: 0,
      pictureLightEmissive: 0.6, counterPendantEmissive: 1.0,
      blind: "half", curtainColor: 0xcdb99a, tableware: true, thanksgivingDecor: false, artLight: [0.74, 0.68, 0.6],
    }),
    sunday: Object.freeze({
      ...sharedLook,
      sun: 2.2, sunColor: 0xffd9b8, sunPosition: [-4.2, 1.05, 3.6],
      hemi: 0.80, hemiSky: 0xeef2f8, hemiGround: 0xcfc6b6,
      ambient: 0.20,
      pendant: 0, under: 0.3, side: 0.4,
      exposure: 1.22, yard: 0xbfd3d8, globe: 0.15, sky: "golden",
      cableCarArtGain: 0.90,
      floor: 0xc9bb9f, jute: 0xd0b47f, ceilingEmissive: 0.12,
      warmGlow: 0.35, wokGlow: 0.40,
      windowWallBounce: 0.10, windowWallBounceVisible: true,
      pendantCeilingBounce: 0, pendantCeilingBounceVisible: false,
      reveal: 0.35, contactShadow: 0.24,
      floorLamp: 0.8, tableLamp: 0.6, screenCool: 0,
      pictureLightEmissive: 0.2, counterPendantEmissive: 0.25,
      blind: "half", curtainColor: 0xc6b79e, tableware: false, thanksgivingDecor: false, artLight: [0.84, 0.82, 0.8],
    }),
    // Thanksgiving is lights and pictures only. Side kitchen stays off so the
    // true lights that are on stay at 7. The autumn photo is not tinted; amber
    // comes from the lamps and the low sun.
    thanksgiving: Object.freeze({
      ...sharedLook,
      sun: 0.6, sunColor: 0xffb15a, sunPosition: [-4.2, 1.10, 3.6],
      hemi: 0.55, hemiSky: 0xffe2c0, hemiGround: 0xc49a62,
      ambient: 0.18, ambientColor: 0xfff4e6,
      pendant: 2.2, under: 1.2, side: 0,
      exposure: 1.12, yard: 0xffffff, yardMap: "courtyard-autumn-v1", globe: 0.45, sky: "golden",
      cableCarArtGain: 0.74,
      floor: 0xc9a67a, jute: 0xd0b47f, ceilingEmissive: 0.20,
      warmGlow: 0.70, wokGlow: 0.45,
      windowWallBounce: 0.08, windowWallBounceVisible: true,
      pendantCeilingBounce: 0.02, pendantCeilingBounceVisible: true,
      reveal: 0.50, contactShadow: 0.22,
      screenColor: 0xffffff, screenToneMapped: false, screenMap: "screen-thanksgiving-parade-v1",
      floorLamp: 1.4, tableLamp: 1.8, screenCool: 0,
      pictureLightEmissive: 0.55, counterPendantEmissive: 0.80,
      blind: "half", curtainColor: 0xc8b294, tableware: true, thanksgivingDecor: true, artLight: [0.76, 0.7, 0.63],
    }),
  });
  let floorLampLight = null, tableLampLight = null, screenCoolLight = null;
  let pictureLightMaterial = null;
  let floorShadeMaterial = null, tableShadeMaterial = null, floorHalo = null, tableHalo = null;
  {
    const lamps = addRoom03Lamps(scene, materials);
    floorLampLight = lamps.floorLight;
    tableLampLight = lamps.tableLight;
    screenCoolLight = lamps.screenCoolLight;
    pictureLightMaterial = lamps.pictureShade;
    floorShadeMaterial = lamps.floorShade;
    tableShadeMaterial = lamps.tableShade;
    floorHalo = lamps.floorHalo;
    tableHalo = lamps.tableHalo;
  }
  const room03LivingDetails = buildRoom03LivingDetails(scene);
  // Keep new floor contact decals in the existing single shadow mesh/draw call.
  const existingContactPatchCount = contactShadow.userData.totalPatchCount;
  for (const [x, , z] of room03LivingDetails.sideTableFeet) addContactPatch(x, z, 0.085, 0.085, 0.003);
  addContactPatch(room03LivingDetails.plantPosition[0], room03LivingDetails.plantPosition[2], 0.34, 0.30, 0.003);
  const addedContactPatches = contactShadowParts.slice(existingContactPatchCount);
  const extendedContactGeometry = mergeGeometries([contactShadow.geometry, ...addedContactPatches], false);
  if (!extendedContactGeometry) throw new Error("Could not extend Room 03 living-detail contact shadows");
  contactShadow.geometry.dispose();
  contactShadow.geometry = extendedContactGeometry;
  addedContactPatches.forEach((geometry) => geometry.dispose());
  contactShadow.userData.totalPatchCount = existingContactPatchCount + addedContactPatches.length;
  let currentMood = "daylight";
  let movieScreenTexture = null;
  let thanksgivingScreenTexture = null;
  let autumnCourtyardTexture = null, nightYardTexture = null, nightYardRequested = false;
  const courtyardMesh = scene.getObjectByName("courtyard-background");
  const courtyardDefaultMap = courtyardMesh?.material?.map || null;
  if (courtyardDefaultMap) courtyardDefaultMap.name = "courtyard-v1";
  // Swappable window view (Paul 2026-10-29): three extra yard pictures, fetched only when chosen. "auto" keeps the old behaviour
  // (the golden-hour photo, the autumn photo for Thanksgiving); a chosen view replaces both in every mood and still takes the mood's tint.
  const YARD_VIEWS = {
    "fog-morning": "./art/room03-yard-fog-morning-v1.webp",
    "spring-bloom": "./art/room03-yard-spring-bloom-v1.webp",
    "overcast-rain": "./art/room03-yard-overcast-rain-v1.webp",
  };
  const yardViewTextures = {};
  let yardView = "auto";
  const reloadMoodPicture = () => { if (currentMood === "movie" || currentMood === "thanksgiving") setMood(currentMood); };
  new THREE.TextureLoader().load(new URL("./art/screen-movie-city-night-v1.webp", import.meta.url).href, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.name = "screen-movie-city-night-v1";
    movieScreenTexture = texture;
    reloadMoodPicture();
  });
  new THREE.TextureLoader().load(new URL("./art/screen-thanksgiving-parade-v1.webp", import.meta.url).href, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.name = "screen-thanksgiving-parade-v1";
    thanksgivingScreenTexture = texture;
    reloadMoodPicture();
  });
  new THREE.TextureLoader().load(new URL("./art/courtyard-autumn-v1.webp", import.meta.url).href, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    texture.name = "courtyard-autumn-v1";
    autumnCourtyardTexture = texture;
    reloadMoodPicture();
  });
  // The real night yard (full moon, hills, oaks; Codex 2026-10-30) is only fetched the first time Night or Movie is chosen.
  const requestNightYard = () => {
    if (nightYardRequested) return;
    nightYardRequested = true;
    new THREE.TextureLoader().load(new URL("./art/room03-yard-night-moon-v1.webp", import.meta.url).href, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      texture.name = "courtyard-night-moon-v1";
      nightYardTexture = texture;
      if (MOOD_LOOK[currentMood]?.yardMap === "courtyard-night-moon-v1") setMood(currentMood);
    });
  };
  // The dining table is a downloaded model, so its wood is tinted (multiplied) rather than repainted; the model's own colour is kept to restore it.
  function tintDiningTable(tint) {
    const table = scene.getObjectByName("room03-table-glb");
    if (!table) return;
    const factor = tint.isColor ? tint : new THREE.Color(tint);
    table.traverse((object) => {
      if (!object.isMesh) return;
      for (const material of (Array.isArray(object.material) ? object.material : [object.material])) {
        if (!material?.color) continue;
        if (!material.userData.baseColor) material.userData.baseColor = material.color.clone();
        material.color.copy(material.userData.baseColor).multiply(factor);
      }
    });
  }
  // Movie night (Paul 2026-11-11, after Room 02's series-night phone): a phone lies face up on the dining table, and every ~16 s its screen lights a
  // notification and throws a soft cool pool of light on the wood. Only in the movie mood (hidden otherwise: no cost anywhere else). The room renders
  // on demand, so the pulse drives its own frames; with reduced motion the screen simply stays lit. No text on the glass; the message appears when it
  // is tapped (34 px finger radius, like Room 02) and, once per visit, a hint says so when the mood arrives.
  const PHONE_AT = Object.freeze({ x: -0.40, z: 0.26, yaw: 0.42 });
  const PHONE_IDLE = 0.03, PHONE_NOTIFY = 1.1, PHONE_GLOW = 0.8;
  const PHONE_TEXT = {
    zh: "手機亮了一下：「晚餐幫你留了一份在爐上，慢慢吃。」",
    en: "The phone lights up: “I kept a plate warm on the stove. Take your time.”",
  };
  const phoneRig = (() => {
    const tableTopY = 0.75, bodyH = 0.0085, W = 0.072, L = 0.150;
    const shape = new THREE.Shape(), r = 0.011, x0 = -W / 2, y0 = -L / 2;
    shape.moveTo(x0 + r, y0); shape.lineTo(-x0 - r, y0); shape.quadraticCurveTo(-x0, y0, -x0, y0 + r); shape.lineTo(-x0, -y0 - r);
    shape.quadraticCurveTo(-x0, -y0, -x0 - r, -y0); shape.lineTo(x0 + r, -y0); shape.quadraticCurveTo(x0, -y0, x0, -y0 - r); shape.lineTo(x0, y0 + r); shape.quadraticCurveTo(x0, y0, x0 + r, y0);
    const bodyGeo = new THREE.ExtrudeGeometry(shape, { depth: bodyH - 0.0016, bevelEnabled: true, bevelThickness: 0.0008, bevelSize: 0.0008, bevelSegments: 2, curveSegments: 6 });
    bodyGeo.rotateX(-Math.PI / 2); bodyGeo.translate(0, 0.0008, 0); // thickness along +y, bottom face on the table
    const group = new THREE.Group(); group.name = "prop-table-phone"; group.visible = false;
    group.userData.category = "household-props"; group.userData.propKey = "table-phone";
    const body = new THREE.Mesh(bodyGeo, new THREE.MeshStandardMaterial({ color: "#1b1c1f", roughness: 0.35, metalness: 0.2 }));
    body.name = "prop-table-phone-body"; group.add(body);
    // the glass: a dark panel with a lock-screen notification banner, lit only while the pulse runs
    const cv = document.createElement("canvas"); cv.width = 128; cv.height = 272;
    const c = cv.getContext("2d");
    c.fillStyle = "#020306"; c.fillRect(0, 0, 128, 272);
    c.fillStyle = "#e4dcc8"; c.beginPath(); c.roundRect(10, 34, 108, 50, 11); c.fill();
    c.fillStyle = "#c58a3a"; c.beginPath(); c.arc(30, 59, 9, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#5a5246"; c.fillRect(48, 50, 56, 6); c.fillRect(48, 63, 38, 5);
    c.fillStyle = "#7a7366"; c.fillRect(34, 128, 60, 14);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const screenMat = new THREE.MeshStandardMaterial({ color: "#05070a", roughness: 0.2, metalness: 0.15, emissive: "#ffffff", emissiveMap: tex, emissiveIntensity: 0 });
    screenMat.name = "table-phone-screen";
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.066, 0.143), screenMat);
    screen.name = "table-phone-screen"; screen.rotation.x = -Math.PI / 2; screen.position.y = bodyH + 0.0006; group.add(screen);
    group.position.set(PHONE_AT.x, tableTopY, PHONE_AT.z); group.rotation.y = PHONE_AT.yaw;
    // soft pool of light on the wood, 12 mm above it (a plane 2 mm above a surface is not drawn)
    const gcv = document.createElement("canvas"); gcv.width = gcv.height = 64;
    const gx = gcv.getContext("2d"), gg = gx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gg.addColorStop(0, "rgba(255,255,255,1)"); gg.addColorStop(0.35, "rgba(255,255,255,.45)"); gg.addColorStop(1, "rgba(255,255,255,0)");
    gx.fillStyle = gg; gx.fillRect(0, 0, 64, 64);
    const glowMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gcv), color: "#a9c2ff", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    glowMat.name = "table-phone-glow";
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.36), glowMat);
    glow.name = "table-phone-glow"; glow.rotation.x = -Math.PI / 2; glow.position.set(PHONE_AT.x, tableTopY + 0.012, PHONE_AT.z); glow.visible = false;
    scene.add(group, glow);
    return { group, screenMat, glowMat, glow };
  })();
  const phoneReduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  let phonePulseTimer = 0, phonePulseRun = 0, phoneHintShown = false;
  function stopPhonePulse() { clearTimeout(phonePulseTimer); phonePulseTimer = 0; phonePulseRun += 1; }
  function applyTablePhone(name) {
    stopPhonePulse();
    const lit = name === "movie", { group, screenMat, glowMat, glow } = phoneRig;
    group.visible = lit; glow.visible = lit;
    screenMat.emissiveIntensity = lit ? (phoneReduced() ? PHONE_NOTIFY : PHONE_IDLE) : 0;
    glowMat.opacity = lit && phoneReduced() ? PHONE_GLOW * 0.6 : 0;
    if (!lit) return;
    if (!phoneHintShown) { phoneHintShown = true; setTimeout(() => { if (currentMood === "movie") showNookCaption(nookLang === "zh" ? "點一下：桌上的手機。" : "Tap: the phone on the table.", null, 4200); }, 900); }
    if (phoneReduced()) return;
    const fire = () => {
      const run = ++phonePulseRun, t0 = performance.now();
      const step = (now) => {
        if (run !== phonePulseRun) return;
        const t = (now - t0) / 1000, k = t < 0.5 ? t / 0.5 : t < 2.4 ? 1 : Math.max(0, 1 - (t - 2.4) / 1);
        screenMat.emissiveIntensity = PHONE_IDLE + (PHONE_NOTIFY - PHONE_IDLE) * k;
        glowMat.opacity = PHONE_GLOW * k;
        render();
        if (t < 3.4) requestAnimationFrame(step); else { screenMat.emissiveIntensity = PHONE_IDLE; glowMat.opacity = 0; render(); }
      };
      requestAnimationFrame(step);
    };
    const schedule = (delay) => { phonePulseTimer = setTimeout(() => { fire(); schedule(16000); }, delay); };
    schedule(3000);
  }
  // finger-sized tap: anywhere within 34 px of the phone's screen position reads its message (only while it is on the table)
  let phoneTap = null;
  canvas.addEventListener("pointerdown", (event) => { if (event.isPrimary) phoneTap = { x: event.clientX, y: event.clientY }; });
  canvas.addEventListener("pointerup", (event) => {
    if (!phoneTap || !event.isPrimary) return;
    const start = phoneTap; phoneTap = null;
    if (!phoneRig.group.visible || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) return;
    const rect = canvas.getBoundingClientRect(), p = phoneRig.group.position.clone().setY(0.756).project(camera);
    if (p.z > 1) return;
    const px = rect.left + ((p.x + 1) / 2) * rect.width, py = rect.top + ((1 - p.y) / 2) * rect.height;
    if (Math.hypot(event.clientX - px, event.clientY - py) <= 34) showNookCaption(PHONE_TEXT[nookLang], "phone");
  });
  function tablePhoneInfo() {
    const rect = canvas.getBoundingClientRect(), p = phoneRig.group.position.clone().setY(0.756).project(camera);
    return { visible: phoneRig.group.visible, faceUp: true, screenEmissive: phoneRig.screenMat.emissiveIntensity, glowOpacity: phoneRig.glowMat.opacity, glowVisible: phoneRig.glow.visible, screen: [rect.left + ((p.x + 1) / 2) * rect.width, rect.top + ((1 - p.y) / 2) * rect.height], caption: nookCaption.textContent, hintShown: phoneHintShown };
  }
  // Sunday morning (Paul 2026-11-11, "time and season touches"): the low sun comes in through the sliding door, so dust turns in its beam, and the mug beside
  // the coffee maker steams. Two small additive point clouds (2 draw calls), drawn only in the sunday mood. The room renders on demand, so a light loop
  // (about 15 frames a second, paused when the tab is hidden) moves them only while that mood is on; with reduced motion they hang still. Quiet on purpose:
  // you notice them after a moment, not at the first glance.
  const morningRig = (() => {
    const softCanvas = document.createElement("canvas"); softCanvas.width = softCanvas.height = 64;
    const sx = softCanvas.getContext("2d"), sg = sx.createRadialGradient(32, 32, 0, 32, 32, 32);
    sg.addColorStop(0, "rgba(255,255,255,1)"); sg.addColorStop(0.4, "rgba(255,255,255,.5)"); sg.addColorStop(1, "rgba(255,255,255,0)");
    sx.fillStyle = sg; sx.fillRect(0, 0, 64, 64);
    const soft = new THREE.CanvasTexture(softCanvas);
    // deterministic pseudo-random so every visit sees the same first frame
    let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const DUST = 44, dust = { home: new Float32Array(DUST * 3), phase: new Float32Array(DUST), pos: new Float32Array(DUST * 3), col: new Float32Array(DUST * 3) };
    for (let i = 0; i < DUST; i++) {
      // a wedge in front of the sliding door, widest at the glass and thinning toward the room, where the sun slants in
      const reach = rnd(), x = -2.75 + reach * 1.7, z = -1.9 + rnd() * 1.75, y = 0.7 + rnd() * 1.3;
      dust.home.set([x, y, z], i * 3); dust.phase[i] = rnd() * Math.PI * 2;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dust.pos, 3)); dustGeo.setAttribute("color", new THREE.BufferAttribute(dust.col, 3));
    const dustMat = new THREE.PointsMaterial({ map: soft, size: 0.016, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
    dustMat.name = "morning-dust"; const dustPoints = new THREE.Points(dustGeo, dustMat); dustPoints.name = "morning-dust"; dustPoints.frustumCulled = false; dustPoints.visible = false;
    const STEAM = 16, steam = { pos: new Float32Array(STEAM * 3), col: new Float32Array(STEAM * 3), seed: new Float32Array(STEAM) };
    for (let i = 0; i < STEAM; i++) steam.seed[i] = rnd();
    const steamGeo = new THREE.BufferGeometry();
    steamGeo.setAttribute("position", new THREE.BufferAttribute(steam.pos, 3)); steamGeo.setAttribute("color", new THREE.BufferAttribute(steam.col, 3));
    const steamMat = new THREE.PointsMaterial({ map: soft, size: 0.05, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false });
    steamMat.name = "morning-steam"; const steamPoints = new THREE.Points(steamGeo, steamMat); steamPoints.name = "morning-steam"; steamPoints.frustumCulled = false; steamPoints.visible = false;
    dustPoints.raycast = steamPoints.raycast = () => {}; // atmosphere, not objects: taps and the plaque's visibility probe pass straight through
    scene.add(dustPoints, steamPoints);
    const MUG = Object.freeze({ x: -0.292 + RED_MUG_SHIFT[0], y: 1.05 + RED_MUG_SHIFT[1], z: -1.752 + RED_MUG_SHIFT[2] }); // the rim of the red mug, now on the credenza
    const update = (t) => {
      for (let i = 0; i < DUST; i++) {
        const ph = dust.phase[i], tw = 0.5 + 0.5 * Math.sin(t * 0.55 + ph * 3);
        dust.pos[i * 3] = dust.home[i * 3] + Math.sin(t * 0.13 + ph) * 0.12;
        dust.pos[i * 3 + 1] = dust.home[i * 3 + 1] + Math.sin(t * 0.09 + ph * 2) * 0.1;
        dust.pos[i * 3 + 2] = dust.home[i * 3 + 2] + Math.cos(t * 0.11 + ph) * 0.1;
        const level = 0.35 + 0.65 * tw; dust.col[i * 3] = 1.0 * level; dust.col[i * 3 + 1] = 0.9 * level; dust.col[i * 3 + 2] = 0.72 * level; // warm, like the sun
      }
      dustGeo.attributes.position.needsUpdate = true; dustGeo.attributes.color.needsUpdate = true;
      for (let i = 0; i < STEAM; i++) {
        const life = (t * 0.32 + steam.seed[i]) % 1; // 0 at the rim, 1 gone, about three seconds
        const sway = Math.sin(t * 1.1 + steam.seed[i] * 12) * 0.012 * (0.3 + life * 1.4);
        steam.pos[i * 3] = MUG.x + sway + life * 0.025; steam.pos[i * 3 + 1] = MUG.y + life * 0.2; steam.pos[i * 3 + 2] = MUG.z + Math.cos(t * 0.9 + steam.seed[i] * 9) * 0.008;
        const fade = Math.sin(Math.PI * Math.min(1, life * 1.15)) * (1 - life * 0.55); steam.col[i * 3] = fade; steam.col[i * 3 + 1] = fade; steam.col[i * 3 + 2] = fade * 0.97;
      }
      steamGeo.attributes.position.needsUpdate = true; steamGeo.attributes.color.needsUpdate = true;
    };
    update(0);
    return { dustPoints, steamPoints, update, dustMat, steamMat };
  })();
  // Thanksgiving (Paul 2026-11-11, season touch): the courtyard is in autumn and the second glass panel stands open, so a few oak leaves have blown in and lie on
  // the boards just inside the door. Nine flat leaves in ONE mesh (one draw call), vertex-coloured rust, ochre and brown, hidden in every other mood. They sit
  // on the floor between the open panel and the rug, clear of the lounge chair (which ends at z 0.22) and the side table.
  const leafRig = (() => {
    const outline = (len, wid) => { // an oak-like leaf: a pointed ellipse with two soft lobes a side
      const s = new THREE.Shape(), lobes = [[0.18, 0.55], [0.38, 0.8], [0.6, 0.6], [0.8, 0.32]];
      s.moveTo(0, 0);
      for (const [t, w] of lobes) s.quadraticCurveTo(t * len - len * 0.04, w * wid * 0.5, (t + 0.05) * len, w * wid * 0.42);
      s.lineTo(len, 0);
      for (const [t, w] of [...lobes].reverse()) s.quadraticCurveTo((t + 0.05) * len, -w * wid * 0.5, t * len - len * 0.04, -w * wid * 0.42);
      s.lineTo(0, 0); return s;
    };
    const palette = ["#d9a93f", "#8c2f24", "#5c3b22", "#c9a24a", "#7a8038", "#a63d2b"]; // ochre, deep red, brown, straw, olive, brick: they must read against the orange boards
    const placed = [ // x, z, yaw, length m, colour index
      [-2.60, 0.62, 0.4, 0.085, 0], [-2.42, 0.90, 2.3, 0.075, 1], [-2.66, 1.18, 4.1, 0.09, 2], [-2.28, 1.34, 1.1, 0.07, 3], [-2.50, 1.62, 5.2, 0.08, 4],
      [-2.12, 0.74, 3.3, 0.07, 5], [-2.36, 1.88, 2.7, 0.075, 0], [-2.02, 1.10, 0.1, 0.065, 1], [-2.70, 1.92, 3.9, 0.07, 2],
    ];
    const geos = [], color = new THREE.Color();
    for (const [x, z, yaw, len, ci] of placed) {
      const g = new THREE.ShapeGeometry(outline(len * 1.7, len * 1.7 * 0.62), 4);
      g.rotateX(-Math.PI / 2); g.rotateY(yaw); g.translate(x, 0.006 + (ci % 3) * 0.0006, z);
      const n = g.attributes.position.count, cols = new Float32Array(n * 3); color.set(palette[ci]);
      for (let i = 0; i < n; i++) { const shade = 0.88 + 0.12 * Math.sin(i * 2.1 + ci); cols[i * 3] = color.r * shade; cols[i * 3 + 1] = color.g * shade; cols[i * 3 + 2] = color.b * shade; }
      g.setAttribute("color", new THREE.BufferAttribute(cols, 3)); g.deleteAttribute("uv"); geos.push(g);
    }
    const merged = mergeGeometries(geos.map((g) => g.toNonIndexed ? g.toNonIndexed() : g), false);
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    mat.name = "autumn-leaves"; const mesh = new THREE.Mesh(merged, mat); mesh.name = "prop-autumn-leaves"; mesh.visible = false; mesh.receiveShadow = true; mesh.castShadow = false;
    mesh.userData.category = "household-props"; mesh.userData.propKey = "autumn-leaves"; scene.add(mesh);
    return { mesh, count: placed.length, vertices: merged.attributes.position.count };
  })();
  function applyAutumnLeaves(name) { leafRig.mesh.visible = name === "thanksgiving"; }
  function autumnLeavesInfo() { const b = new THREE.Box3().setFromObject(leafRig.mesh); return { visible: leafRig.mesh.visible, leaves: leafRig.count, vertices: leafRig.vertices, bounds: { min: b.min.toArray(), max: b.max.toArray() } }; }
  // Paul 2026-11-17: a little steam over the red mug's black coffee. A faint curl is always there (one still frame); it drifts while the close record view is
  // open or the record plays, at about 15 frames a second like the Sunday-morning steam, and only then. In the Sunday mood the existing morning steam does this job.
  const mugSteamRig = (() => {
    const softCanvas = document.createElement("canvas"); softCanvas.width = softCanvas.height = 64;
    const sx = softCanvas.getContext("2d"), sg = sx.createRadialGradient(32, 32, 0, 32, 32, 32);
    sg.addColorStop(0, "rgba(255,255,255,1)"); sg.addColorStop(0.4, "rgba(255,255,255,.5)"); sg.addColorStop(1, "rgba(255,255,255,0)");
    sx.fillStyle = sg; sx.fillRect(0, 0, 64, 64);
    const COUNT = 22, data = { pos: new Float32Array(COUNT * 3), col: new Float32Array(COUNT * 3), seed: new Float32Array(COUNT) };
    for (let i = 0; i < COUNT; i++) data.seed[i] = (i * 0.618034 + 0.07 * Math.sin(i * 5.3)) % 1; // spread unevenly so it never reads as a row of dots
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(data.pos, 3)); geometry.setAttribute("color", new THREE.BufferAttribute(data.col, 3));
    const material = new THREE.PointsMaterial({ map: new THREE.CanvasTexture(softCanvas), size: 0.058, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false });
    material.name = "red-mug-steam";
    const points = new THREE.Points(geometry, material); points.name = "red-mug-steam"; points.frustumCulled = false;
    points.raycast = () => {}; // atmosphere, not an object
    scene.add(points);
    const RIM = { x: -0.30 + RED_MUG_SHIFT[0], y: 0.954 + RED_MUG_SHIFT[1] + 0.098, z: -1.752 + RED_MUG_SHIFT[2] };
    const update = (t) => {
      for (let i = 0; i < COUNT; i++) {
        const life = (t * 0.26 + data.seed[i]) % 1; // 0 at the coffee, 1 gone, about four seconds
        const widen = 0.25 + life * 1.6; // the curl opens out as it rises
        const sway = Math.sin(t * 0.9 + life * 5.2 + data.seed[i] * 6) * 0.012 * widen; // an S-shaped drift
        const spread = Math.sin(data.seed[i] * 40) * 0.008 * widen;
        data.pos[i * 3] = RIM.x + sway + spread + life * 0.014; data.pos[i * 3 + 1] = RIM.y + life * 0.16; data.pos[i * 3 + 2] = RIM.z + Math.cos(t * 0.7 + life * 4.1 + data.seed[i] * 7) * 0.009 * widen + Math.cos(data.seed[i] * 31) * 0.006 * widen;
        const fade = Math.sin(Math.PI * Math.min(1, life * 1.05)) * (1 - life * 0.5); data.col[i * 3] = fade; data.col[i * 3 + 1] = fade; data.col[i * 3 + 2] = fade * 0.97;
      }
      geometry.attributes.position.needsUpdate = true; geometry.attributes.color.needsUpdate = true;
    };
    update(7.3);
    return { points, update };
  })();
  let mugSteamRun = 0;
  function refreshMugSteam() {
    const run = ++mugSteamRun;
    mugSteamRig.points.visible = currentMood !== "sunday";
    if (!mugSteamRig.points.visible || morningReduced() || !(recordSaved || recordSide >= 0)) { mugSteamRig.update(7.3); return; }
    const t0 = performance.now(); let last = 0;
    const step = (now) => {
      if (run !== mugSteamRun) return;
      if (!(recordSaved || recordSide >= 0) || currentMood === "sunday") { mugSteamRig.update(7.3); render(); return; }
      if (!document.hidden && now - last > 66) { last = now; mugSteamRig.update((now - t0) / 1000 + 7.3); render(); }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  let morningRun = 0;
  const morningReduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  function applyMorningTouches(name) {
    const on = name === "sunday", { dustPoints, steamPoints, update } = morningRig;
    dustPoints.visible = on; steamPoints.visible = on;
    mugSteamRig.points.visible = !on;
    const run = ++morningRun;
    if (!on) return;
    if (morningReduced()) { update(12.5); return; } // still: motes hang in the beam, one soft curl above the mug
    const t0 = performance.now(); let last = 0;
    const step = (now) => {
      if (run !== morningRun || currentMood !== "sunday") return;
      if (!document.hidden && now - last > 66) { last = now; update((now - t0) / 1000 + 12.5); render(); }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  // Paul 2026-11-18: the Thanksgiving roast steams like the red mug's coffee (the same soft sprite, drift and fade), as three wisps a little larger, from the
  // top of the bird. Only in the Thanksgiving mood; it drifts at about 15 frames a second and holds one still frame for reduced motion.
  const turkeySteam = (() => {
    const WISPS = 3, PER = 9, COUNT = WISPS * PER, data = { pos: new Float32Array(COUNT * 3), col: new Float32Array(COUNT * 3), seed: new Float32Array(COUNT) };
    for (let i = 0; i < COUNT; i++) data.seed[i] = ((i % PER) / PER + 0.07 * Math.sin(i * 5.3) + Math.floor(i / PER) * 0.31) % 1;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(data.pos, 3)); geometry.setAttribute("color", new THREE.BufferAttribute(data.col, 3));
    const material = mugSteamRig.points.material.clone(); material.size = 0.085; material.opacity = 0.22; material.name = "turkey-steam";
    const points = new THREE.Points(geometry, material); points.name = "turkey-steam"; points.frustumCulled = false; points.visible = false; points.raycast = () => {};
    scene.add(points);
    let origins = null, run = 0;
    const findOrigins = () => { // three spots along the top of the bird, from its world box
      const food = tablewareGroup?.getObjectByName("room03-tableware-food"); if (!food) return null;
      food.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(food), c = box.getCenter(new THREE.Vector3()), sx = (box.max.x - box.min.x) * 0.18, sz = (box.max.z - box.min.z) * 0.18;
      return [[c.x - sx, box.max.y - 0.01, c.z - sz * 0.4], [c.x + sx * 0.3, box.max.y - 0.004, c.z + sz * 0.5], [c.x + sx, box.max.y - 0.014, c.z - sz * 0.2]];
    };
    const update = (t) => {
      for (let i = 0; i < COUNT; i++) {
        const [ox, oy, oz] = origins[Math.floor(i / PER)], life = (t * 0.22 + data.seed[i]) % 1, widen = 0.3 + life * 1.8;
        const sway = Math.sin(t * 0.8 + life * 5.2 + data.seed[i] * 6) * 0.016 * widen, spread = Math.sin(data.seed[i] * 40) * 0.01 * widen;
        data.pos[i * 3] = ox + sway + spread + life * 0.012; data.pos[i * 3 + 1] = oy + life * 0.24; data.pos[i * 3 + 2] = oz + Math.cos(t * 0.7 + life * 4.1 + data.seed[i] * 7) * 0.012 * widen;
        const fade = Math.sin(Math.PI * Math.min(1, life * 1.05)) * (1 - life * 0.5); data.col[i * 3] = fade; data.col[i * 3 + 1] = fade; data.col[i * 3 + 2] = fade * 0.97;
      }
      geometry.attributes.position.needsUpdate = true; geometry.attributes.color.needsUpdate = true;
    };
    const apply = (name) => {
      const on = name === "thanksgiving" && Boolean(tablewareGroup?.visible);
      const thisRun = ++run; points.visible = on; if (!on) return;
      origins = findOrigins(); if (!origins) { points.visible = false; return; }
      update(5.1); if (morningReduced()) return;
      const t0 = performance.now(); let last = 0;
      const step = (now) => { if (thisRun !== run || !points.visible) return; if (!document.hidden && now - last > 66) { last = now; update((now - t0) / 1000 + 5.1); render(); } requestAnimationFrame(step); };
      requestAnimationFrame(step);
    };
    return { points, apply, info: () => ({ visible: points.visible, wisps: WISPS, points: COUNT, looping: points.visible && !morningReduced() }) };
  })();
  function morningTouchInfo() {
    return { dustVisible: morningRig.dustPoints.visible, steamVisible: morningRig.steamPoints.visible, dustCount: morningRig.dustPoints.geometry.attributes.position.count, steamCount: morningRig.steamPoints.geometry.attributes.position.count, looping: morningRun > 0 };
  }
  function setMood(name) {
    const look = MOOD_LOOK[name]; if (!look) return;
    currentMood = name;
    applyTablePhone(name);
    applyMorningTouches(name);
    applyAutumnLeaves(name);
    // The lemon bowl is the everyday centrepiece; in the dinner moods the roast chicken takes the middle of the table instead.
    if (moodSlots.tabletopCenterpiece) moodSlots.tabletopCenterpiece.visible = !look.tableware;
    if (thanksgivingGroup) {
      thanksgivingGroup.visible = look.thanksgivingDecor;
      if (look.thanksgivingDecor && thanksgivingGroup.parent !== scene) scene.add(thanksgivingGroup);
      else if (!look.thanksgivingDecor && thanksgivingGroup.parent === scene) scene.remove(thanksgivingGroup);
    }
    if (tablewareGroup) {
      tablewareGroup.visible = look.tableware;
      const food = tablewareGroup.getObjectByName("room03-tableware-food");
      const variants = tablewareGroup.userData.foodVariants;
      if (food && variants) {
        food.geometry = name === "thanksgiving" ? variants.thanksgiving : variants.dinner;
        tablewareGroup.userData.vertices = tablewareGroup.userData.baseVertices - variants.dinner.attributes.position.count + food.geometry.attributes.position.count;
      }
      if (look.tableware && tablewareGroup.parent !== scene) scene.add(tablewareGroup);
      else if (!look.tableware && tablewareGroup.parent === scene) scene.remove(tablewareGroup);
    }
    turkeySteam.apply(name);
    sun.intensity = look.sun; sun.color.setHex(look.sunColor); sun.position.set(...look.sunPosition);
    hemi.intensity = look.hemi; hemi.color.setHex(look.hemiSky); hemi.groundColor.setHex(look.hemiGround);
    ambient.intensity = look.ambient; ambient.color.setHex(look.ambientColor);
    pendantLight.intensity = look.pendant; underLight.intensity = look.under; sideLight.intensity = look.side;
    if (floorLampLight) { floorLampLight.intensity = look.floorLamp; floorLampLight.visible = look.floorLamp > 0; }
    if (tableLampLight) { tableLampLight.intensity = look.tableLamp; tableLampLight.visible = look.tableLamp > 0; }
    if (screenCoolLight) { screenCoolLight.intensity = look.screenCool; screenCoolLight.visible = look.screenCool > 0; }
    { const moodGlow = look.tableLamp > 0 ? Math.min(1, 0.4 + look.tableLamp * 0.12) : 0, glow = nookSaved ? Math.max(moodGlow, 0.7) : moodGlow * 0.5; nookDecor.halo.material.opacity = glow * (nookSaved ? 0.55 : 0.3); nookDecor.halo.visible = glow > 0; nookDecor.lensMaterial.emissiveIntensity = glow * (nookSaved ? 4 : 2.4); }
    renderer.toneMappingExposure = look.exposure;
    applyReflections(name);
    scene.background = skyMaterials[look.sky];
    const yardMaterial = scene.getObjectByName("courtyard-background")?.material;
    if (yardMaterial) {
      yardMaterial.color.setHex(look.yard);
      if (look.yardMap === "courtyard-night-moon-v1") requestNightYard();
      const autumnReady = look.yardMap === "courtyard-autumn-v1" && autumnCourtyardTexture?.image;
      const nightReady = look.yardMap === "courtyard-night-moon-v1" && nightYardTexture?.image;
      const chosenYard = yardView !== "auto" ? yardViewTextures[yardView] : null;
      yardMaterial.map = chosenYard?.image ? chosenYard : (autumnReady ? autumnCourtyardTexture : nightReady ? nightYardTexture : courtyardDefaultMap);
      yardMaterial.needsUpdate = true;
    }
    // The two framed paintings are unlit (accurate colour), so by day and night they looked identical and read as windows (Paul 2026-10-29).
    // Dim and warm them with the mood like the wall around them.
    wallArt.material.color.setRGB(...look.artLight);
    wallArt.setCableCarImageGain(look.cableCarArtGain);
    roomDoor?.setMoodLight(look.artLight);
    materials.opal.emissiveIntensity = look.globe;
    room03Curtains.material.color.setHex(look.curtainColor);
    scene.traverse((object) => {
      if (!object.isMesh) return;
      for (const material of (Array.isArray(object.material) ? object.material : [object.material])) {
        if (material?.name === "warm-opal-glass") material.emissiveIntensity = look.globe;
      }
    });
    applySurfaceFinish();
    materials.ceiling.color.setHex(look.ceilingColor); materials.ceiling.emissive.setHex(look.ceilingEmissiveColor);
    materials.windowBeam.color.setHex(look.ceilingColor); materials.windowBeam.emissive.setHex(look.ceilingEmissiveColor);
    materials.beam.color.setHex(look.beamColor);
    tintDiningTable(look.tableTint);
    materials.ceiling.emissiveIntensity = look.ceilingEmissive;
    materials.windowBeam.emissiveIntensity = look.ceilingEmissive;
    materials.warmGlow.opacity = look.warmGlow;
    materials.wokGlow.opacity = look.wokGlow;
    materials.sunlight.opacity = look.sunlightOpacity;
    sunlightPatch.visible = look.sunlightVisible;
    contactShadow.visible = true;
    contactShadow.material.opacity = look.contactShadow;
    windowWallBounce.material.opacity = look.windowWallBounce;
    windowWallBounce.visible = look.windowWallBounceVisible;
    pendantFloorBounce.material.opacity = look.pendantFloorBounce;
    pendantFloorBounce.visible = look.pendantFloorBounceVisible;
    pendantCeilingBounce.material.opacity = look.pendantCeilingBounce;
    pendantCeilingBounce.visible = look.pendantCeilingBounceVisible;
    materials.reveal.opacity = look.reveal;
    materials.loungePillow.color.setHex(look.loungePillow);
    if (pictureLightMaterial) pictureLightMaterial.emissiveIntensity = Math.max(PICTURE_LIGHT_FLOOR, look.pictureLightEmissive);
    // Keep the paper drum visibly lit without clipping its white surface in the 180-degree movie view.
    if (floorShadeMaterial) floorShadeMaterial.emissiveIntensity = look.floorLamp > 0
      ? Math.min(1.9, 0.45 + 0.45 * look.floorLamp)
      : 0;
    if (tableShadeMaterial) tableShadeMaterial.emissiveIntensity = look.tableLamp > 0 ? Math.min(2.2, 0.55 + 0.5 * look.tableLamp) : 0;
    if (floorHalo) { floorHalo.material.opacity = look.floorLamp > 0 ? Math.min(0.5, 0.15 * look.floorLamp) : 0; floorHalo.visible = look.floorLamp > 0; }
    if (tableHalo) { tableHalo.material.opacity = look.tableLamp > 0 ? Math.min(0.5, 0.15 * look.tableLamp) : 0; tableHalo.visible = look.tableLamp > 0; }
    const screenMaterial = mediaUnit.screen.material;
    // Paul 2026-10-31: the "closer to the nook" view always shows a lit TV (the city-night picture) and the downlights, in every mood that has no picture of its own.
    const nookLit = Boolean(nookSaved) && !look.screenMap;
    const screenMap = look.screenMap || (nookLit ? "screen-movie-city-night-v1" : null);
    const screenTexture = screenMap === "screen-movie-city-night-v1" ? movieScreenTexture
      : screenMap === "screen-thanksgiving-parade-v1" ? thanksgivingScreenTexture
      : null;
    if (screenMap && screenTexture?.image) {
      screenMaterial.map = screenTexture;
      screenMaterial.color.setHex(nookLit ? 0xffffff : look.screenColor);
      screenMaterial.toneMapped = nookLit ? false : look.screenToneMapped;
    } else if (screenMap) {
      // Missing picture stays the dark powered-off screen. No white or black stand-in.
      screenMaterial.map = null;
      screenMaterial.color.setHex(0x171918);
      screenMaterial.toneMapped = true;
    } else {
      screenMaterial.map = null;
      screenMaterial.color.setHex(look.screenColor);
      screenMaterial.toneMapped = look.screenToneMapped;
    }
    screenMaterial.needsUpdate = true;
    scene.userData.room03Blind = look.blind;
    for (const light of [sun, pendantLight, underLight, sideLight]) light.visible = light.intensity > 0;
    render();
  }
  function resize() {
    const rect = stage.getBoundingClientRect(); if (!rect.width || !rect.height) return;
    const nextCompact = rect.width < 500;
    if (nextCompact !== compactCameraActive) {
      compactCameraActive = nextCompact;
      const preset = compactCameraActive ? PORTRAIT_CAMERA : DESKTOP_CAMERA;
      controls.maxDistance = preset.maxDistance;
      if (!centerView && !nookSaved && !recordSaved) {
        camera.position.set(...preset.position);
        controls.target.set(...preset.target);
        controls.update();
      }
    }
    camera.aspect = rect.width / rect.height;
    camera.fov = centerView ? (compactCameraActive ? 84 : 86) : nookSaved ? nookFov(camera.aspect) : recordSaved ? recordFov(camera.aspect) : (compactCameraActive ? PORTRAIT_CAMERA.fov : DESKTOP_CAMERA.fov);
    camera.updateProjectionMatrix();
    // P0b: the pendant shadow follows the same compact flag the camera uses, so a phone never pays for the point-light pass.
    pendantLight.castShadow = !compactCameraActive;
    renderer.setSize(rect.width, rect.height, false);
    render();
  }
  const renderListeners = [];
  function render() {
    renderer.render(scene, camera);
    for (const listener of renderListeners) listener();
    if (!firstFrameRendered) {
      firstFrameRendered = true;
      requestAnimationFrame(() => wallArt.load(({ settled, total }) => {
        wallArtSettled = settled;
        if (settled === total) wallArtLoaded = true;
        render();
      }));
    }
  }
  const housePlaque = addHousePlaque(scene, () => render());
  // The loop must survive the first frames after pointer-down (no movement yet, update() is false) and keep gliding after release.
  let orbitLooping = false, orbitHeld = false;
  function orbitLoop() { const moving = controls.update(); render(); if (moving || orbitHeld) requestAnimationFrame(orbitLoop); else orbitLooping = false; }
  controls.addEventListener("start", () => { orbitHeld = true; if (!orbitLooping) { orbitLooping = true; requestAnimationFrame(orbitLoop); } });
  controls.addEventListener("end", () => { orbitHeld = false; });
  controls.addEventListener("change", () => { if (!orbitLooping) render(); });
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(stage);
  resize(); controls.update(); setMood("daylight");
  await furniture.ready;
  tintDiningTable(MOOD_LOOK[currentMood].tableTint);
  tablewareGroup = buildTableware(scene);
  const thanksgivingDecor = buildThanksgivingDecor(scene);
  thanksgivingGroup = thanksgivingDecor.group;
  paperNapkinPack = thanksgivingDecor.paperNapkinPack;
  const wokOliveOil = buildWokOliveOil(scene, paperNapkinPack);
  if (globalThis.__ROOMVERSE_QA) globalThis.__ROOMVERSE_QA.scene = scene;
  const robot = loadRoom03Robot(scene, () => render());
  roomDoor = buildRoomDoor(scene, materials);
  roomDoor.setMoodLight(MOOD_LOOK[currentMood].artLight);
  // Screen rectangle of the doorway (frame and, once open, the leaf) for the page's tap target.
  const doorScreen = () => {
    const box = roomDoor.bounds();
    const corners = [];
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) corners.push(new THREE.Vector3(x, y, z).project(camera));
    if (corners.some((p) => p.z >= 1)) return null;
    const xs = corners.map((p) => (p.x + 1) / 2 * stage.clientWidth), ys = corners.map((p) => (1 - p.y) / 2 * stage.clientHeight);
    const rect = { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) };
    if (rect.right < 0 || rect.left > stage.clientWidth || rect.bottom < 0 || rect.top > stage.clientHeight) return null;
    return rect;
  };
  // Screen rectangle of the robot for the page's tap target (null when it is behind the camera or off screen).
  const robotScreen = () => {
    if (!robot.ready) return null;
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(robot.pivot);
    const corners = [];
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) corners.push(new THREE.Vector3(x, y, z).project(camera));
    if (corners.some((p) => p.z >= 1)) return null;
    const xs = corners.map((p) => (p.x + 1) / 2 * stage.clientWidth), ys = corners.map((p) => (1 - p.y) / 2 * stage.clientHeight);
    const rect = { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) };
    if (rect.right < 0 || rect.left > stage.clientWidth || rect.bottom < 0 || rect.top > stage.clientHeight) return null;
    return rect;
  };
  // A small hop toward the camera when tapped (no motion if the visitor prefers reduced motion).
  const robotHop = () => {
    if (!robot.ready || matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    const started = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - started) / 420);
      robot.pivot.position.y = Math.sin(k * Math.PI) * 0.06;
      render();
      if (k < 1) requestAnimationFrame(step); else { robot.pivot.position.y = 0; render(); }
    };
    requestAnimationFrame(step);
    return true;
  };
  moodSlots.tableware = tablewareGroup;
  setMood(currentMood);
  const samplePixels = (rect) => {
    const width = Math.min(renderer.domElement.width, 1200);
    const height = Math.max(1, Math.round(width * stage.clientHeight / stage.clientWidth));
    const target = new THREE.WebGLRenderTarget(width, height, { depthBuffer: true, stencilBuffer: false });
    target.texture.colorSpace = THREE.SRGBColorSpace;
    renderer.setRenderTarget(target);
    const pixelRatio = renderer.getPixelRatio();
    renderer.setViewport(0, 0, width / pixelRatio, height / pixelRatio);
    renderer.render(scene, camera);
    const x = Math.max(0, Math.floor(rect.left * width));
    const top = Math.max(0, Math.floor(rect.top * height));
    const sampleWidth = Math.max(1, Math.min(width - x, Math.ceil(rect.width * width)));
    const sampleHeight = Math.max(1, Math.min(height - top, Math.ceil(rect.height * height)));
    const rgba = new Uint8Array(sampleWidth * sampleHeight * 4);
    renderer.readRenderTargetPixels(target, x, height - top - sampleHeight, sampleWidth, sampleHeight, rgba);
    let red = 0, green = 0, blue = 0, luminance = 0, luminanceSq = 0, blown = 0, dark = 0;
    for (let i = 0; i < rgba.length; i += 4) {
      const r = rgba[i], g = rgba[i + 1], b = rgba[i + 2];
      const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      red += r; green += g; blue += b; luminance += l; luminanceSq += l * l;
      if (l > 245) blown += 1;
      if (l < 40) dark += 1;
    }
    const count = sampleWidth * sampleHeight;
    renderer.setRenderTarget(null);
    renderer.setViewport(0, 0, stage.clientWidth, stage.clientHeight);
    renderer.render(scene, camera);
    target.dispose();
    const mean = luminance / count;
    return { meanLuminance: mean, luminanceStdDev: Math.sqrt(Math.max(0, luminanceSq / count - mean * mean)), red: red / count, green: green / count, blue: blue / count, samples: count, blownRatio: blown / count, darkRatio: dark / count };
  };
  const sampleNdc = (point, radius = 0.012) => samplePixels({ left: (point[0] + 1) / 2 - radius, top: (1 - point[1]) / 2 - radius, width: radius * 2, height: radius * 2 });
  let basinFloorVisibleCache;
  const info = () => {
    const categories = {};
    const furnitureAssets = {};
    const softForms = { chairShells: 0, shellHeights: [], pendantGlobeVertices: 0 };
    let lightCount = 0;
    scene.traverse((object) => { if (object.isLight) lightCount++; });
    const lightMetrics = {
      lightCount, shadowType: renderer.shadowMap.type === THREE.PCFShadowMap ? "PCF" : (renderer.shadowMap.type === THREE.VSMShadowMap ? "VSM" : "other"),
      shadowMapSize: sun.shadow.mapSize.toArray(), shadowRadius: sun.shadow.radius,
      shadowBias: sun.shadow.bias, shadowNormalBias: sun.shadow.normalBias,
      pendantCastsShadow: pendantLight.castShadow, pendantShadowMapSize: pendantLight.shadow.mapSize.toArray(),
      sun: sun.intensity, hemi: hemi.intensity,
      ambient: ambient.intensity, pendant: pendantLight.intensity,
      under: underLight.intensity, side: sideLight.intensity,
      exposure: renderer.toneMappingExposure,
      goldenFloorPatch: sunlightPatch.visible ? materials.sunlight.opacity : 0,
      windowBounce: windowWallBounce.visible ? windowWallBounce.material.opacity : 0,
      pendantFloorBounce: pendantFloorBounce.visible ? pendantFloorBounce.material.opacity : 0,
      pendantCeilingBounce: pendantCeilingBounce.visible ? pendantCeilingBounce.material.opacity : 0,
    };
    const project = (point) => new THREE.Vector3(...point).project(camera).toArray();
    let vertices = 0, triangles = 0, meshes = 0;
    scene.traverse((object) => {
      if (!object.isMesh || !object.geometry?.attributes?.position) return;
      const count = object.geometry.attributes.position.count;
      vertices += count; triangles += object.geometry.index ? object.geometry.index.count / 3 : count / 3; meshes++;
      const key = object.userData.category || "other";
      categories[key] ??= { vertices: 0, meshes: 0 };
      categories[key].vertices += count; categories[key].meshes++;
      const asset = object.userData.furnitureAsset;
      if (asset) {
        furnitureAssets[asset] ??= { vertices: 0, triangles: 0, meshes: 0 };
        furnitureAssets[asset].vertices += count;
        furnitureAssets[asset].triangles += object.geometry.index ? object.geometry.index.count / 3 : count / 3;
        furnitureAssets[asset].meshes++;
        if (asset === "chair" && object.material?.name === "warm-oat-linen") {
          softForms.chairShells++;
          softForms.shellHeights.push(new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3()).y);
        }
        if (asset === "pendant" && object.material?.name === "warm-opal-glass") softForms.pendantGlobeVertices = count;
      }
    });
    const rug = scene.getObjectByName("merged-rug");
    rug?.geometry.computeBoundingBox();
    const bounds = rug?.geometry.boundingBox;
    const rugBounds = bounds ? {
      min: bounds.min.toArray(), max: bounds.max.toArray(),
      size: bounds.getSize(new THREE.Vector3()).toArray(),
      materialColor: `#${rug.material.color.getHexString()}`, roughness: rug.material.roughness,
    } : null;
    const boxFor = (name) => {
      const object = scene.getObjectByName(name); if (!object) return null;
      if (object.userData.bounds) return object.userData.bounds;
      const box = new THREE.Box3().setFromObject(object);
      return { min: box.min.toArray(), max: box.max.toArray(), size: box.getSize(new THREE.Vector3()).toArray() };
    };
    const sinkCounterMesh = scene.getObjectByName("merged-counter");
    const sinkOpeningRay = new THREE.Raycaster(new THREE.Vector3(-1.25, 1.1, -2.02), new THREE.Vector3(0, -1, 0), 0, 0.3);
    const sinkOpeningClear = !sinkCounterMesh || !sinkOpeningRay.intersectObject(sinkCounterMesh, false).length;
    if (basinFloorVisibleCache === undefined) {
      const candidates = scene.children.filter((object) => object.isMesh && (object.material === materials.sinkSteel || object.material === materials.olive));
      basinFloorVisibleCache = [-0.26, 0, 0.26].every((dx) => [-0.15, 0, 0.15].every((dz) => {
        const ray = new THREE.Raycaster(new THREE.Vector3(-1.25 + dx, 0.93, -2.02 + dz), new THREE.Vector3(0, -1, 0), 0, 0.3);
        return ray.intersectObjects(candidates, false)[0]?.object.material === materials.sinkSteel;
      }));
    }
    const basinFloorVisible = basinFloorVisibleCache;
    const categoryBoxFor = (category) => {
      const box = new THREE.Box3(); box.makeEmpty();
      scene.traverse((object) => { if (object.isMesh && object.userData.category === category) box.expandByObject(object); });
      return box.isEmpty() ? null : { min: box.min.toArray(), max: box.max.toArray(), size: box.getSize(new THREE.Vector3()).toArray() };
    };
    const propKeys = ["drip-coffee-maker", "counter-mugs", "counter-popcorn-bowl", "electric-kettle", "rice-cooker", "cutting-board", "counter-seasoning", "wok-olive-oil", "oak-utensil-crock", "glass-pantry-jar", "mineral-water-bottle-1", "mineral-water-bottle-2", "wok-wood-serving-bowl", "steel-saucepan", "tabletop-meyer-lemon-bowl", "tabletop-water-set", "cookbooks", "tv-console-living-set", "window-side-table", "window-meyer-lemon-tree"];
    const propBounds = Object.fromEntries(propKeys.map((key) => {
      const object = scene.getObjectByName(`prop-${key}`);
      if (!object) return [key, null];
      const box = object.userData.qaBounds
        ? new THREE.Box3(new THREE.Vector3(...object.userData.qaBounds.min), new THREE.Vector3(...object.userData.qaBounds.max))
        : new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      return [key, { min: box.min.toArray(), max: box.max.toArray(), size: box.getSize(new THREE.Vector3()).toArray(), projectedCenter: project(center.toArray()) }];
    }));
    const propGeometry = Object.fromEntries(propKeys.map((key) => {
      const object = scene.getObjectByName(`prop-${key}`);
      if (object?.userData.qaGeometry) return [key, object.userData.qaGeometry];
      let propVertices = 0, propMeshes = 0;
      object?.traverse((child) => {
        if (!child.isMesh || !child.geometry?.attributes?.position) return;
        propVertices += child.geometry.attributes.position.count;
        propMeshes++;
      });
      return [key, { vertices: propVertices, meshes: propMeshes }];
    }));
    const cuttingBoardObject = scene.getObjectByName("prop-cutting-board");
    const cuttingBoardBox = cuttingBoardObject ? new THREE.Box3().setFromObject(cuttingBoardObject) : null;
    // Paul 2026-11-22: the board stands on the sink run now, not the wok counter, so the support ray is cast against the
    // sink counter and falls back to the wok counter (the board's old home) if it ever moves back.
    const boardCounters = [];
    scene.traverse((object) => { if (object.name === "merged-counter" || object.name === "merged-wok-counter") boardCounters.push(object); });
    const wokCounterSurface = boardCounters;
    const boardSupportRay = cuttingBoardBox ? new THREE.Raycaster(
      new THREE.Vector3(cuttingBoardBox.min.x + 0.01, 1.3, (cuttingBoardBox.min.z + cuttingBoardBox.max.z) / 2),
      new THREE.Vector3(0, -1, 0), 0, 1,
    ) : null;
    const boardSupportHit = boardSupportRay && wokCounterSurface.length
      ? boardSupportRay.intersectObjects(wokCounterSurface, true)[0] : null;
    const boardBurner = scene.getObjectByName("wok-kitchen-burners");
    const burnerBox = boardBurner ? new THREE.Box3().setFromObject(boardBurner) : null;
    const cuttingBoardFit = cuttingBoardBox && boardSupportHit ? {
      sizeMm: cuttingBoardBox.getSize(new THREE.Vector3()).toArray().map((value) => Number((value * 1000).toFixed(1))),
      nominalSizeMm: cuttingBoardObject.userData.nominalSizeM.map((value) => Math.round(value * 1000)),
      supportY: Number(boardSupportHit.point.y.toFixed(4)),
      bottomY: Number(cuttingBoardBox.min.y.toFixed(4)),
      gapMm: Number(((cuttingBoardBox.min.y - boardSupportHit.point.y) * 1000).toFixed(2)),
      burnerClearanceMm: burnerBox ? Number(((burnerBox.min.z - cuttingBoardBox.max.z) * 1000).toFixed(1)) : null,
      wallClearanceMm: Number(((2.94 - cuttingBoardBox.max.x) * 1000).toFixed(1)),
    } : null;
    const utensilObject = scene.getObjectByName("prop-oak-utensil-crock");
    // "merged-counter" can be several meshes (one per material); measure against all of them, not just the first by name.
    const counterSurfaces = []; scene.traverse((object) => { if (object.name === "merged-counter") counterSurfaces.push(object); });
    scene.updateMatrixWorld(true);
    const measureCounterPropFit = (key, x, z) => {
      const object = scene.getObjectByName(`prop-${key}`);
      const ray = new THREE.Raycaster(new THREE.Vector3(x, 1.3, z), new THREE.Vector3(0, -1, 0), 0, 1);
      const hit = counterSurfaces.length ? ray.intersectObjects(counterSurfaces, false).find(({ face, object }) => {
        if (!face) return false;
        const normal = face.normal.clone().applyMatrix3(new THREE.Matrix3().getNormalMatrix(object.matrixWorld)).normalize();
        return normal.y > 0.9;
      }) : null;
      const box = object?.userData.qaBounds
        ? new THREE.Box3(new THREE.Vector3(...object.userData.qaBounds.min), new THREE.Vector3(...object.userData.qaBounds.max))
        : object ? new THREE.Box3().setFromObject(object) : null;
      return hit && box ? {
        supportY: Number(hit.point.y.toFixed(4)), bottomY: Number(box.min.y.toFixed(4)),
        gapMm: Number(((box.min.y - hit.point.y) * 1000).toFixed(2)),
        embedMm: Number((Math.max(0, hit.point.y - box.min.y) * 1000).toFixed(2)),
        overallSizeMm: box.getSize(new THREE.Vector3()).toArray().map((value) => Number((value * 1000).toFixed(1))),
      } : null;
    };
    const crockSupportRay = new THREE.Raycaster(new THREE.Vector3(-1.72, 1.3, -1.73), new THREE.Vector3(0, -1, 0), 0, 1);
    const crockSupportHit = counterSurfaces.length ? crockSupportRay.intersectObjects(counterSurfaces, false).find(({ face, object }) => {
      if (!face) return false;
      const normal = face.normal.clone().applyMatrix3(new THREE.Matrix3().getNormalMatrix(object.matrixWorld)).normalize();
      return normal.y > 0.9;
    }) : null;
    const utensilBox = utensilObject?.userData.qaBounds
      ? new THREE.Box3(new THREE.Vector3(...utensilObject.userData.qaBounds.min), new THREE.Vector3(...utensilObject.userData.qaBounds.max))
      : utensilObject ? new THREE.Box3().setFromObject(utensilObject) : null;
    const utensilCrockFit = crockSupportHit && utensilBox ? {
      supportY: Number(crockSupportHit.point.y.toFixed(4)),
      bottomY: Number(utensilBox.min.y.toFixed(4)),
      gapMm: Number(((utensilBox.min.y - crockSupportHit.point.y) * 1000).toFixed(2)),
      embedMm: Number((Math.max(0, crockSupportHit.point.y - utensilBox.min.y) * 1000).toFixed(2)),
      crockDiameterMm: 120, crockHeightMm: 148,
      overallSizeMm: utensilBox.getSize(new THREE.Vector3()).toArray().map((value) => Number((value * 1000).toFixed(1))),
    } : null;
    const jarObject = scene.getObjectByName("prop-glass-pantry-jar");
    const jarSupportRay = new THREE.Raycaster(new THREE.Vector3(-0.58, 1.3, -1.82), new THREE.Vector3(0, -1, 0), 0, 1);
    const jarSupportHit = counterSurfaces.length ? jarSupportRay.intersectObjects(counterSurfaces, false).find(({ face, object }) => {
      if (!face) return false;
      const normal = face.normal.clone().applyMatrix3(new THREE.Matrix3().getNormalMatrix(object.matrixWorld)).normalize();
      return normal.y > 0.9;
    }) : null;
    const jarBox = jarObject?.userData.qaBounds
      ? new THREE.Box3(new THREE.Vector3(...jarObject.userData.qaBounds.min), new THREE.Vector3(...jarObject.userData.qaBounds.max))
      : jarObject ? new THREE.Box3().setFromObject(jarObject) : null;
    const jarGlassMesh = scene.getObjectByName("prop-countertop-glass-shared");
    const pantryJarFit = jarSupportHit && jarBox ? {
      supportY: Number(jarSupportHit.point.y.toFixed(4)),
      bottomY: Number(jarBox.min.y.toFixed(4)),
      gapMm: Number(((jarBox.min.y - jarSupportHit.point.y) * 1000).toFixed(2)),
      embedMm: Number((Math.max(0, jarSupportHit.point.y - jarBox.min.y) * 1000).toFixed(2)),
      bodyDiameterMm: 120, totalHeightMm: Number((jarBox.getSize(new THREE.Vector3()).y * 1000).toFixed(1)),
      overallSizeMm: jarBox.getSize(new THREE.Vector3()).toArray().map((value) => Number((value * 1000).toFixed(1))),
      glass: { depthWrite: jarGlassMesh?.material.depthWrite ?? null, renderOrder: jarGlassMesh?.renderOrder ?? null },
    } : null;
    const dripCoffeeMakerFit = measureCounterPropFit("drip-coffee-maker", -0.34, -2.03);
    const riceCookerFit = measureCounterPropFit("rice-cooker", -1.92, -2.03);
    const electricKettleFit = measureCounterPropFit("electric-kettle", -0.76, -2.04);
    const saucepanObject = scene.getObjectByName("prop-steel-saucepan");
    // "merged-appliances" is several meshes (one per material: sink steel, black hob, faucet...), so look through all of them; the first
    // one by name is not necessarily the black cooktop (the sink station changed the bucket order, which broke this measurement).
    const cooktopSurfaces = []; scene.traverse((object) => { if (object.name === "merged-appliances") cooktopSurfaces.push(object); });
    const saucepanSupportRay = new THREE.Raycaster(new THREE.Vector3(0.53, 1.3, -2.18), new THREE.Vector3(0, -1, 0), 0, 1);
    const saucepanSupportHit = cooktopSurfaces.length ? saucepanSupportRay.intersectObjects(cooktopSurfaces, false).find(({ face, object }) => {
      if (!face) return false;
      const normal = face.normal.clone().applyMatrix3(new THREE.Matrix3().getNormalMatrix(object.matrixWorld)).normalize();
      return normal.y > 0.9;
    }) : null;
    const saucepanBox = saucepanObject?.userData.qaBounds
      ? new THREE.Box3(new THREE.Vector3(...saucepanObject.userData.qaBounds.min), new THREE.Vector3(...saucepanObject.userData.qaBounds.max))
      : saucepanObject ? new THREE.Box3().setFromObject(saucepanObject) : null;
    const redPotObject = scene.getObjectByName("single-terracotta-pot");
    const redPotBox = redPotObject ? new THREE.Box3().setFromObject(redPotObject) : null;
    const panPotGap = saucepanBox && redPotBox ? Math.hypot(
      Math.max(0, redPotBox.min.x - saucepanBox.max.x, saucepanBox.min.x - redPotBox.max.x),
      Math.max(0, redPotBox.min.y - saucepanBox.max.y, saucepanBox.min.y - redPotBox.max.y),
      Math.max(0, redPotBox.min.z - saucepanBox.max.z, saucepanBox.min.z - redPotBox.max.z),
    ) : null;
    const saucepanFit = saucepanSupportHit && saucepanBox ? {
      supportY: Number(saucepanSupportHit.point.y.toFixed(4)),
      bottomY: Number(saucepanBox.min.y.toFixed(4)),
      gapMm: Number(((saucepanBox.min.y - saucepanSupportHit.point.y) * 1000).toFixed(2)),
      embedMm: Number((Math.max(0, saucepanSupportHit.point.y - saucepanBox.min.y) * 1000).toFixed(2)),
      panDiameterMm: 180, bodyHeightMm: 90, overallLengthMm: 340,
      overallSizeMm: saucepanBox.getSize(new THREE.Vector3()).toArray().map((value) => Number((value * 1000).toFixed(1))),
      redPotClearanceMm: panPotGap === null ? null : Number((panPotGap * 1000).toFixed(1)),
    } : null;
    const chairBounds = [-0.5, 0.5].flatMap((x) => [-0.22, 1.22].map((z) => boxFor(`room03-dining-chair-${x}-${z}`)));
    const diningFootAlignment = [];
    const shadowPositions = contactShadow.geometry.attributes.position;
    for (let chairIndex = 0; chairIndex < DINING_CHAIR_PLACEMENTS.length; chairIndex++) {
      const placement = DINING_CHAIR_PLACEMENTS[chairIndex];
      const chair = scene.getObjectByName(`room03-dining-chair-${placement.x}-${placement.z}`);
      const legs = chair?.getObjectByName("tapered-oak-legs");
      const localPositions = legs?.geometry.attributes.position;
      for (let footIndex = 0; footIndex < DINING_CHAIR_FOOT_CENTERS.length; footIndex++) {
        const [footX, footZ] = DINING_CHAIR_FOOT_CENTERS[footIndex];
        let sumX = 0, sumZ = 0, samples = 0;
        for (let vertex = 0; vertex < localPositions.count; vertex++) {
          const x = localPositions.getX(vertex), y = localPositions.getY(vertex), z = localPositions.getZ(vertex);
          if (Math.abs(y - 0.02) < 1e-6 && Math.hypot(x - footX, z - footZ) < 0.013) { sumX += x; sumZ += z; samples++; }
        }
        const actual = chair.localToWorld(new THREE.Vector3(sumX / samples, 0.02, sumZ / samples));
        const patchIndex = 4 + chairIndex * DINING_CHAIR_FOOT_CENTERS.length + footIndex;
        const patchStart = patchIndex * 4;
        const patchCenter = new THREE.Vector3();
        for (let vertex = patchStart; vertex < patchStart + 4; vertex++) patchCenter.add(new THREE.Vector3().fromBufferAttribute(shadowPositions, vertex));
        patchCenter.multiplyScalar(0.25);
        diningFootAlignment.push({ samples, planarOffset: actual.distanceTo(new THREE.Vector3(patchCenter.x, actual.y, patchCenter.z)), verticalOffset: Math.abs(patchCenter.y - actual.y) });
      }
    }
    let diningUpholsteryMap = null;
    scene.traverse((object) => {
      if (object.isMesh && object.userData.furnitureAsset === "chair" && object.material?.name === "warm-oat-linen") diningUpholsteryMap = object.material.map;
    });
    const loungeUpholsteryMap = loungeChair.getObjectByName("lounge-upholstery")?.material?.map;
    const diningChairQA = {
      footCount: diningFootAlignment.length,
      patchCount: contactShadow.userData.patchCount - 4,
      maxPlanarOffset: Math.max(...diningFootAlignment.map((item) => item.planarOffset)),
      maxVerticalOffset: Math.max(...diningFootAlignment.map((item) => item.verticalOffset)),
      samplesPerFoot: Math.min(...diningFootAlignment.map((item) => item.samples)),
      seatGapMeasurements: diningChairSeatGap(),
      upholsteryMapIsolated: diningUpholsteryMap !== loungeUpholsteryMap,
      chairTextureRepeat: diningUpholsteryMap?.repeat.toArray() || null,
      loungeTextureRepeat: loungeUpholsteryMap?.repeat.toArray() || null,
    };
    const sideRunShadow = new THREE.Box3();
    for (let index = 0; index < shadowPositions.count; index++) {
      const point = new THREE.Vector3().fromBufferAttribute(shadowPositions, index);
      if (point.x > 2.2) sideRunShadow.expandByPoint(point);
    }
    const contactShadowInfo = {
      name: contactShadow.name, meshes: 1, materialType: contactShadow.material.type,
      vertices: contactShadow.geometry.attributes.position.count,
      patchCount: contactShadow.userData.patchCount, totalPatchCount: contactShadow.userData.totalPatchCount,
      opacity: contactShadow.material.opacity, bounds: boxFor(contactShadow.name),
      depthWrite: contactShadow.material.depthWrite, polygonOffsetFactor: contactShadow.material.polygonOffsetFactor,
      renderOrder: contactShadow.renderOrder,
      coverage: ["dining-table", "dining-chair-0.5-1.22", "dining-chair-0.5--0.22", "dining-chair--0.5-1.22", "dining-chair--0.5--0.22", "kitchen-island", "side-kitchen", "lounge-chair"],
      sideRun: sideRunShadow.isEmpty() ? null : { min: sideRunShadow.min.toArray(), max: sideRunShadow.max.toArray(), size: sideRunShadow.getSize(new THREE.Vector3()).toArray() },
    };
    const loungeBounds = boxFor(loungeChair.name);
    const loungeFit = measureLoungeFit(loungeChair);
    const lounge = {
      bounds: loungeBounds, position: loungeChair.position.toArray(), yawDegrees: THREE.MathUtils.radToDeg(loungeChair.rotation.y), contactShadowVisible: contactShadow.visible, contactShadowBounds: boxFor(contactShadow.name), contactShadowOpacity: contactShadow.material.opacity,
      projectedCenter: project(new THREE.Box3().setFromObject(loungeChair).getCenter(new THREE.Vector3()).toArray()),
      parts: Object.fromEntries(loungeChair.children.map((part) => [part.name, { bounds: boxFor(part.name), vertices: part.geometry.attributes.position.count }])),
      fit: loungeFit,
    };
    const cookbookGroup = scene.getObjectByName("prop-cookbooks");
    const lampInfo = {};
    for (const name of ["floor-reading-lamp", "console-table-lamp", "redwood-picture-light", "counter-mini-pendants"]) {
      const object = scene.getObjectByName(name);
      if (!object) { lampInfo[name] = null; continue; }
      const box = new THREE.Box3().setFromObject(object);
      let meshes = 0, vertices = 0;
      object.traverse((child) => {
        if (!child.isMesh || !child.geometry?.attributes?.position) return;
        meshes += 1;
        vertices += child.geometry.attributes.position.count;
      });
      lampInfo[name] = {
        bounds: { min: box.min.toArray(), max: box.max.toArray(), size: box.getSize(new THREE.Vector3()).toArray() },
        center: box.getCenter(new THREE.Vector3()).toArray(),
        meshes, vertices,
        pendantCenters: object.userData.pendantCenters || null,
      };
    }
    lampInfo.lights = {
      floor: { intensity: floorLampLight.intensity, castShadow: floorLampLight.castShadow, color: floorLampLight.color.getHex() },
      table: { intensity: tableLampLight.intensity, castShadow: tableLampLight.castShadow, color: tableLampLight.color.getHex() },
      screenCool: { intensity: screenCoolLight.intensity, castShadow: screenCoolLight.castShadow, color: screenCoolLight.color.getHex() },
    };
    // Each lamp's globe, its light and its halo must share one centre (Paul 2026-10-29: the light has to come from the middle of the bulb).
    const globeCentre = (name) => { const object = scene.getObjectByName(name); return object ? new THREE.Box3().setFromObject(object).getCenter(new THREE.Vector3()).toArray() : null; };
    lampInfo.glow = {
      floor: { globe: globeCentre("floor-reading-lamp-shade"), light: floorLampLight.position.toArray(), halo: floorHalo?.position.toArray() ?? null, haloVisible: floorHalo?.visible ?? false, haloOpacity: floorHalo?.material.opacity ?? 0, emissive: floorShadeMaterial?.emissiveIntensity ?? 0, materialName: floorShadeMaterial?.name ?? null, roughness: floorShadeMaterial?.roughness ?? null },
      table: { globe: globeCentre("console-table-lamp-shade"), light: tableLampLight.position.toArray(), halo: tableHalo?.position.toArray() ?? null, haloVisible: tableHalo?.visible ?? false, haloOpacity: tableHalo?.material.opacity ?? 0, emissive: tableShadeMaterial?.emissiveIntensity ?? 0 },
    };
    const wallArtCorners = [[2.908, 1.05, -0.62], [2.908, 1.99, -0.62], [2.908, 1.05, 0.58], [2.908, 1.99, 0.58]].map(project);
    const wallArtNdc = wallArtCorners.map(([x, y]) => [x, y]);
    const wallArtPixels = {
      width: (Math.max(...wallArtNdc.map(([x]) => x)) - Math.min(...wallArtNdc.map(([x]) => x))) * stage.clientWidth / 2,
      height: (Math.max(...wallArtNdc.map(([, y]) => y)) - Math.min(...wallArtNdc.map(([, y]) => y))) * stage.clientHeight / 2,
      center: [(Math.min(...wallArtNdc.map(([x]) => x)) + Math.max(...wallArtNdc.map(([x]) => x))) / 2, (Math.min(...wallArtNdc.map(([, y]) => y)) + Math.max(...wallArtNdc.map(([, y]) => y))) / 2],
    };
    const wallArtImagePlane = wallArt.imageMesh;
    const projectedPixelsFor = (object) => {
      const bounds = object.userData.bounds
        ? new THREE.Box3(new THREE.Vector3(...object.userData.bounds.min), new THREE.Vector3(...object.userData.bounds.max))
        : new THREE.Box3().setFromObject(object);
      const points = [];
      for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) points.push(project([x, y, z]));
      const xs = points.map(([x]) => x), ys = points.map(([, y]) => y);
      return { width: (Math.max(...xs) - Math.min(...xs)) * stage.clientWidth / 2, height: (Math.max(...ys) - Math.min(...ys)) * stage.clientHeight / 2 };
    };
    const boxGap = (a, b) => {
      const gaps = [0, 1, 2].map((axis) => Math.max(0, a.min[axis] - b.max[axis], b.min[axis] - a.max[axis]));
      return Math.hypot(...gaps);
    };
    const horizontalGap = (a, b) => {
      if (!a || !b) return null;
      const dx = Math.max(0, b.min[0] - a.max[0], a.min[0] - b.max[0]);
      const dz = Math.max(0, b.min[2] - a.max[2], a.min[2] - b.max[2]);
      return Math.hypot(dx, dz);
    };
    const boundsFromBox = (box) => box.isEmpty() ? null : { min: box.min.toArray(), max: box.max.toArray(), size: box.getSize(new THREE.Vector3()).toArray() };
    const unionBounds = (items) => {
      const box = new THREE.Box3();
      for (const item of items) {
        if (!item) continue;
        box.expandByPoint(new THREE.Vector3(...item.min));
        box.expandByPoint(new THREE.Vector3(...item.max));
      }
      return boundsFromBox(box);
    };
    const sideBacksplashBounds = () => {
      const mesh = scene.getObjectByName("merged-wok-backsplash") || scene.getObjectByName("merged-backsplash");
      if (!mesh?.geometry?.attributes?.position) return null;
      mesh.updateWorldMatrix(true, false);
      const position = mesh.geometry.attributes.position;
      const box = new THREE.Box3();
      for (let index = 0; index < position.count; index++) {
        const point = new THREE.Vector3().fromBufferAttribute(position, index).applyMatrix4(mesh.matrixWorld);
        if (mesh.name === "merged-wok-backsplash" || point.x > 2.5) box.expandByPoint(point);
      }
      return boundsFromBox(box);
    };
    const wokCounterBounds = boxFor("merged-wok-counter");
    const wokCabinetBounds = categoryBoxFor("wok-base-cabinet");
    const wokHoodBounds = boxFor("wok-kitchen-sloped-hood");
    const wokDuctBounds = boxFor("wok-kitchen-hood-duct");
    const wokDuctCapBounds = boxFor("wok-kitchen-hood-duct-cap");
    const wokSplashBounds = sideBacksplashBounds();
    const wokRunBounds = unionBounds([wokCounterBounds, wokCabinetBounds, wokHoodBounds, wokDuctBounds, wokDuctCapBounds, wokSplashBounds]);
    const entryDoorway = { min: [-1, 0, 2.34], max: [1, 2.7, 3.16] };
    const shellMeshes = [];
    scene.traverse((object) => { if (object.name === "merged-shell") shellMeshes.push(object); });
    const shellRay = new THREE.Raycaster(new THREE.Vector3(1.6, 1.25, 1.65), new THREE.Vector3(1, 0, 0));
    const shellHit = shellMeshes.length ? shellRay.intersectObjects(shellMeshes, false)[0] : null;
    const wokZone = {
      openingWidth: 0,
      wallHitX: shellHit ? shellHit.point.x : null,
      counter: wokCounterBounds,
      cabinet: wokCabinetBounds,
      hood: wokHoodBounds,
      duct: wokDuctBounds,
      ductCap: wokDuctCapBounds,
      backsplash: wokSplashBounds,
      run: wokRunBounds,
      doorway: entryDoorway,
      clearance: {
        cableCar: horizontalGap(wokRunBounds, boxFor("prop-room03-wall-art")),
        window: horizontalGap(wokRunBounds, boxFor("glass-slider-panel")),
        pendant: horizontalGap(wokRunBounds, boxFor("room03-pendant-tiered")),
        entryHallDoorway: horizontalGap(wokRunBounds, entryDoorway),
        entryHallMesh: horizontalGap(wokRunBounds, boxFor("entry-hall")),
        chairs: [-0.5, 0.5].flatMap((x) => [-0.22, 1.22].map((z) => horizontalGap(wokRunBounds, boxFor(`room03-dining-chair-${x}-${z}`)))),
      },
    };
    const artInfo = (asset) => {
      const bounds = boxFor(asset.group.name);
      const image = asset.texture?.image;
      return {
        status: asset.status,
        textureSize: image ? [image.naturalWidth || image.width, image.naturalHeight || image.height] : [0, 0],
        bounds,
        imagePixels: projectedPixelsFor(asset.image),
        fallbackColor: "#d8cbb5",
      };
    };
    const screenMaterial = mediaUnit.screen.material;
    const screenBounds = boxFor(mediaUnit.screen.name);
    const consoleBounds = boxFor(mediaUnit.console.name);
    const redwoodBounds = boxFor(wallArt.assets.redwoodPath.group.name);
    const redwoodPixels = projectedPixelsFor(wallArt.assets.redwoodPath.image);
    const normalizedYaw = (THREE.MathUtils.radToDeg(controls.getAzimuthalAngle()) + 360) % 360;
    const wallArtAssets = {
      cableCar: artInfo(wallArt.assets.cableCar),
      redwoodPath: {
        ...artInfo(wallArt.assets.redwoodPath),
        phone180Pixels: compactCameraActive && Math.abs(normalizedYaw - 180) < 15 ? redwoodPixels : { width: 0, height: 0 },
        gapToScreen: boxGap(redwoodBounds, boxFor("room03-tv-screen-frame")),
        topBelowHorizontalBand: redwoodBounds.max[1] <= 2.4,
      },
      canopyInRoom: false,
      startedAfterFirstRender: wallArt.startedAfterFirstRender && firstFrameRendered,
      settled: wallArtSettled,
    };
    const moodSlotInfo = {
      screen: {
        name: mediaUnit.screen.name,
        type: screenMaterial.type,
        hasMap: Boolean(screenMaterial.map),
        off: screenMaterial.isMeshBasicMaterial && screenMaterial.color.getHex() === 0x171918,
        width: screenBounds.size[0],
      },
      console: { name: mediaUnit.console.name, width: consoleBounds.size[0], bounds: consoleBounds },
      tabletopCenterpiece: {
        name: moodSlots.tabletopCenterpiece.name,
        visible: moodSlots.tabletopCenterpiece.visible,
        childCount: moodSlots.tabletopCenterpiece.children.length,
        childName: moodSlots.tabletopCenterpiece.children[0]?.name || null,
      },
      tableware: {
        name: tablewareGroup?.name || null,
        visible: tablewareGroup?.visible || false,
        mounted: tablewareGroup?.parent === scene,
      },
    };
    const plaqueMaterial = housePlaque.material;
    const plaqueMap = plaqueMaterial.map;
    housePlaque.updateWorldMatrix(true, true);
    const plaqueWidth = housePlaque.geometry.parameters.width;
    const plaqueHeight = housePlaque.geometry.parameters.height;
    const plaqueCorners = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => {
      const world = new THREE.Vector3(sx * plaqueWidth / 2, sy * plaqueHeight / 2, 0).applyMatrix4(housePlaque.matrixWorld);
      const ndc = world.clone().project(camera);
      return {
        world,
        ndc: [ndc.x, ndc.y, ndc.z],
        inside: ndc.z > -1 && ndc.z < 1 && Math.abs(ndc.x) < 0.98 && Math.abs(ndc.y) < 0.98,
      };
    });
    const plaqueBox = new THREE.Box3().setFromObject(housePlaque);
    const plaqueBounds = { min: plaqueBox.min.toArray(), max: plaqueBox.max.toArray(), size: plaqueBox.getSize(new THREE.Vector3()).toArray() };
    const entryHallBounds = boxFor("entry-hall");
    const bandBounds = { min: [-1, 2.1, 2.34], max: [1, 2.7, 2.46] };
    const frameCenters = {
      cableCar: boxFor("prop-room03-wall-art"),
      redwood: boxFor("prop-room03-wall-art-redwood-path"),
      screen: boxFor("room03-tv-screen-frame"),
    };
    const midY = (bounds) => bounds ? (bounds.min[1] + bounds.max[1]) / 2 : null;
    const plaqueCenterY = midY(plaqueBounds);
    const raycaster = new THREE.Raycaster();
    const occluders = plaqueCorners.map((corner) => {
      if (corner.ndc[2] >= 1) return "behind-camera";
      const direction = corner.world.clone().sub(camera.position);
      const distance = direction.length();
      raycaster.set(camera.position, direction.normalize());
      const blocker = raycaster.intersectObjects(scene.children, true).find((hit) => hit.object.visible && hit.object !== housePlaque && hit.distance < distance - 0.01);
      return blocker?.object.name || null;
    });
    const plaque = {
      name: housePlaque.name,
      status: housePlaque.userData.plaqueStatus,
      visible: housePlaque.visible,
      width: plaqueWidth,
      height: plaqueHeight,
      position: housePlaque.position.toArray(),
      wallGap: entryHallBounds ? entryHallBounds.min[2] - plaqueBounds.max[2] : null,
      vertices: housePlaque.geometry.attributes.position.count,
      bounds: plaqueBounds,
      inView: housePlaque.visible && plaqueCorners.every((corner) => corner.inside),
      corners: plaqueCorners.map((corner) => corner.ndc),
      unobstructed: occluders.every((name) => name == null),
      occluders,
      belowBand: plaqueBounds.max[1] <= bandBounds.min[1],
      clearance: {
        band: boxGap(plaqueBounds, bandBounds),
        cableCar: frameCenters.cableCar ? boxGap(plaqueBounds, frameCenters.cableCar) : null,
        redwood: frameCenters.redwood ? boxGap(plaqueBounds, frameCenters.redwood) : null,
        screen: frameCenters.screen ? boxGap(plaqueBounds, frameCenters.screen) : null,
        pendant: boxFor("room03-pendant-tiered") ? boxGap(plaqueBounds, boxFor("room03-pendant-tiered")) : null,
        wokRun: (() => {
          const pieces = [wokCounterBounds, wokCabinetBounds, wokHoodBounds, wokDuctBounds, wokDuctCapBounds, wokSplashBounds].filter(Boolean);
          return pieces.length ? Math.min(...pieces.map((piece) => boxGap(plaqueBounds, piece))) : null;
        })(),
      },
      frameCenterDeltaY: {
        cableCar: frameCenters.cableCar ? Math.abs(plaqueCenterY - midY(frameCenters.cableCar)) : null,
        redwood: frameCenters.redwood ? Math.abs(plaqueCenterY - midY(frameCenters.redwood)) : null,
        screen: frameCenters.screen ? Math.abs(plaqueCenterY - midY(frameCenters.screen)) : null,
      },
      material: {
        type: plaqueMaterial.type,
        transparent: plaqueMaterial.transparent,
        alphaTest: plaqueMaterial.alphaTest,
        roughness: plaqueMaterial.roughness,
        colorSpace: plaqueMap?.colorSpace || null,
        anisotropy: plaqueMap?.anisotropy ?? null,
        hasMap: Boolean(plaqueMap),
      },
    };
    const wokTileState = scene.userData.wokTile;
    const wokTileMesh = scene.getObjectByName("merged-wok-backsplash");
    let metresPerRepeat = null;
    if (wokTileMesh?.geometry?.attributes?.uv) {
      const position = wokTileMesh.geometry.attributes.position;
      const uv = wokTileMesh.geometry.attributes.uv;
      let far = 1;
      for (let index = 1; index < uv.count; index++) {
        if (Math.abs(uv.getY(index) - uv.getY(0)) > Math.abs(uv.getY(far) - uv.getY(0))) far = index;
      }
      const dv = Math.abs(uv.getY(far) - uv.getY(0));
      const dy = Math.abs(position.getY(far) - position.getY(0));
      if (dv > 1e-4) metresPerRepeat = dy / dv;
    }
    const tileMap = wokTileState?.material?.map || null;
    const wokTile = {
      status: wokTileState?.status || "missing",
      readyBeforeFirstPaint: Boolean(wokTileState?.readyBeforeFirstPaint),
      repeatM: wokTileState?.repeatM ?? null,
      metresPerRepeat,
      brickWidthM: metresPerRepeat ? metresPerRepeat / (1024 / 109) * 2 : null,
      brickHeightM: metresPerRepeat ? metresPerRepeat / (1024 / 109) : null,
      color: wokTileState ? wokTileState.material.color.getHex() : null,
      roughness: wokTileState?.material?.roughness ?? null,
      colorSpace: tileMap?.colorSpace || null,
      anisotropy: tileMap?.anisotropy ?? null,
      generateMipmaps: tileMap?.generateMipmaps ?? null,
      repeats: Boolean(tileMap && tileMap.wrapS === THREE.RepeatWrapping && tileMap.wrapT === THREE.RepeatWrapping),
      mipmapped: tileMap?.minFilter === THREE.LinearMipmapLinearFilter,
      image: tileMap?.image ? [tileMap.image.naturalWidth || tileMap.image.width || 0, tileMap.image.naturalHeight || tileMap.image.height || 0] : [0, 0],
    };
    const footToBody = measureRoomFootToBody(scene, furniture.status.table, diningChairSeatGap(), loungeFit);
    const screenMaterialNow = mediaUnit.screen.material;
    const screenContent = {
      map: Boolean(screenMaterialNow.map),
      color: screenMaterialNow.color.getHex(),
      toneMapped: screenMaterialNow.toneMapped,
      ready: Boolean(movieScreenTexture?.image),
      asset: screenMaterialNow.map?.name || null,
    };
    const courtyardMap = scene.getObjectByName("courtyard-background")?.material?.map?.name || null;
    const centerpieceFit = scene.getObjectByName("prop-tabletop-meyer-lemon-bowl")?.userData.fit || [];
    const thanksgivingInfo = thanksgivingGroup ? { vertices: thanksgivingGroup.userData.vertices, meshes: thanksgivingGroup.children.filter((child) => child.isMesh).length, visible: thanksgivingGroup.visible, mounted: thanksgivingGroup.parent === scene, items: thanksgivingGroup.userData.items, minNeighbourMm: thanksgivingGroup.userData.minNeighbourMm } : null;
    const paperNapkinInfo = paperNapkinPack ? { vertices: paperNapkinPack.vertices, visible: paperNapkinPack.mesh.visible, mounted: paperNapkinPack.mesh.parent === scene, items: paperNapkinPack.items, bounds: boxFor("room03-counter-paper-napkins") } : null;
    const tablewareInfo = tablewareGroup ? { foodVariant: tablewareGroup.getObjectByName("room03-tableware-food")?.geometry === tablewareGroup.userData.foodVariants?.thanksgiving ? "turkey" : "chicken", vertices: tablewareGroup.userData.vertices, meshes: tablewareGroup.children.filter((child) => child.isMesh).length, settings: tablewareGroup.userData.settings, materials: tablewareGroup.userData.materials, colors: tablewareGroup.userData.colors, extras: tablewareGroup.userData.extras } : null;
    const coffeeMakerInfo = scene.getObjectByName("prop-drip-coffee-maker")?.userData.brewer || null;
    const mainSinkInfo = { ...kitchenFixtures.sink, openingClear: sinkOpeningClear, basinFloorVisible, basinFinish: "brushed stainless steel", basinBottomY: kitchenFixtures.sink.bottomY, faucet: "center-rear high-arc gooseneck (visual only)", faucetMount: "centered on rear deck near backsplash", rearDeckOffsetMm: kitchenFixtures.sink.mountFromRearMm, control: "70 mm raised side lever with discreet infrared outlet sensor", leverLengthMm: 70, smartSensorVisualOnly: true };
    return { room03LivingDetails: { ...room03LivingDetails.furnitureFit, fit: room03LivingDetails.fit, vertices: room03LivingDetails.vertices }, dishDryer: dishDryer.info(), credenza: credenza ? credenza.info() : null, thanksgivingDecor: thanksgivingInfo, paperNapkinPack: paperNapkinInfo, moodLook: { fields: MOOD_LOOK_FIELDS, moods: MOOD_LOOK }, tableware: tablewareInfo, screenContent, courtyardMap, renderFrame: renderer.info.render.frame, plaque, lounge, footToBody, diningChairQA, contactShadow: contactShadowInfo, lightMetrics, reflections: { envReady: Boolean(reflectionEnv), materials: Object.fromEntries(Object.keys(reflectiveBase).filter((k) => materials[k]).map((k) => [k, { hasEnv: materials[k].envMap === reflectionEnv, intensity: materials[k].envMapIntensity }])), sceneEnvironment: scene.environment !== null }, centerpieceFit, waterSet: scene.getObjectByName("prop-tabletop-water-set")?.userData.measure ?? null, wallpaper: grasscloth.info(), entryNook: entryNook.info(), nookDecor: { vertices: nookDecor.vertices, bounds: nookDecor.bounds() }, pendantPaper: (() => { const paper = scene.getObjectByName("pendant-paper-tiers"); const box = new THREE.Box3().setFromObject(scene.getObjectByName("room03-pendant-tiered")); return paper ? { tiers: PENDANT_TIERS.radii.length, radiiMm: PENDANT_TIERS.radii.map((r) => Math.round(r * 1000)), emissive: paper.material.emissiveIntensity, materialName: paper.material.name, vertices: paper.geometry.attributes.position.count, bounds: { min: box.min.toArray(), max: box.max.toArray() } } : null; })(), yardView, ottoman: { ...loungeOttoman.userData.measure(), meshes: loungeOttoman.children.length, vertices: loungeOttoman.children.reduce((n, child) => n + (child.geometry?.attributes.position.count || 0), 0) }, wallArtChoice: wallArt.choice, wallArtMean: { "cable-car": wallArt.regionMean("cable-car"), "redwood-path": wallArt.regionMean("redwood-path"), "lamp-wall": wallArt.regionMean("lamp-wall") }, lampWallArt: { bounds: boxFor("prop-room03-wall-art-lamp-wall"), imageBounds: wallArt.assets.lampWall.image.userData.bounds, status: wallArt.assets.lampWall.status }, title: ROOM_TITLE, dimensions: ROOM, mood: currentMood, yardLoaded, wallArtLoaded, wallArtAssets, moodSlots: moodSlotInfo, wallArtTextureSize: [wallArt.assets.cableCar.texture?.image?.naturalWidth || wallArt.assets.cableCar.texture?.image?.width || 0, wallArt.assets.cableCar.texture?.image?.naturalHeight || wallArt.assets.cableCar.texture?.image?.height || 0], wallArtColorSpace: wallArt.texture?.colorSpace || null, wallArtMaterial: wallArtImagePlane?.material?.type || null, wallArtLight: wallArtImagePlane ? wallArtImagePlane.material.color.toArray().map((v) => Number(v.toFixed(3))) : null, wallArtReceivesShadow: wallArtImagePlane?.receiveShadow ?? null, wallArtBounds: boxFor("prop-room03-wall-art"), wallArtCorners, wallArtPixels, wokZone, wokTile, wallArtClearanceBounds: { beams: boxFor("merged-structure"), hood: boxFor("merged-hood"), upperCabinets: boxFor("merged-kitchen") }, furniture: { ...furniture.status, urls: furniture.urls, tabletopEdgeHeightDeviation: furniture.tabletopEdgeHeightDeviation }, furnitureAssets, furnitureBounds: { table: boxFor("room03-table-glb"), chairs: chairBounds, pendant: boxFor("room03-pendant-tiered") }, propBounds, propGeometry, cuttingBoardFit, wokOliveOil: { vertices: wokOliveOil.vertices, material: wokOliveOil.material, bounds: wokOliveOil.bounds, supportY: wokOliveOil.supportY, gapMm: wokOliveOil.gapMm, embedMm: wokOliveOil.embedMm }, utensilCrockFit, pantryJarFit, electricKettleFit, dripCoffeeMakerFit, riceCookerFit, saucepanFit, windowBounds: { slider: boxFor("glass-slider-panel"), ajar: boxFor("glass-slider-panel-ajar") }, plantLeafCount: 0, plantLeafVerticesPerBlade: 0, lamps: lampInfo, curtains: room03Curtains.info(), kitchenHub: { vertices: kitchenHub.vertices, bounds: kitchenHub.bounds() }, wokTools: { vertices: wokTools.vertices, bounds: wokTools.bounds(), utensils: wokTools.utensils.map((tool) => ({ ...tool, heightMm: Math.round((tool.bounds.max[1] - tool.bounds.min[1]) * 1000) })), spiceJars: wokTools.spiceJars }, mainSink: mainSinkInfo, coffeeMaker: coffeeMakerInfo, wokOven: (() => { const item = scene.userData.wokOven; const bottom = item.centerY - item.height / 2; const top = item.centerY + item.height / 2; const counterBottom = item.counterBottomY; return { style: "built-in under-counter oven", nominalSizeMm: [Math.round(item.width * 1000), Math.round(item.height * 1000), Math.round(item.depth * 1000)], bayMm: [Math.round(item.bay.width * 1000), Math.round((item.bay.top - item.bay.bottom) * 1000)], sideClearanceMm: Math.round((item.bay.width - item.width) * 500), lowerClearanceMm: Math.round((bottom - 0.12) * 1000), upperClearanceMm: Math.round((counterBottom - top) * 1000), rearClearanceMm: Math.round((2.94 - item.backX) * 1000), controls: 0, display: item.display, handle: item.handle, cabinetPulls: item.cabinetPulls, cabinetPullOffsetFromOvenMm: item.cabinetPullOffsetFromOvenMm, displayPanelMm: [240, 60], glassMaterial: materials.ovenGlass.type, transparentGlass: materials.ovenGlass.transparent }; })(), wokMitts: (() => { const item = scene.userData.wokMitts; const box = new THREE.Box3().setFromObject(item.mesh); return { count: item.count, hookCount: item.hookCount, occupiedHooks: item.occupiedHooks, bounds: { min: box.min.toArray(), max: box.max.toArray(), size: box.getSize(new THREE.Vector3()).toArray() }, reachHeightMm: Math.round((box.min.y + box.max.y) * 500), lowerClearanceToCounterMm: item.lowerClearanceToCounterMm, vertices: item.mesh.geometry.attributes.position.count, shape: "one distinct thumb and four-finger mitt silhouette", pattern: item.pattern, print: { leaves: item.leafMotifs, flowers: item.flowerMotifs }, colorFamily: "cream cotton with sage botanical print", materialRoughness: item.mesh.material.roughness }; })(), counterFresh: { vertices: counterFresh.vertices, bounds: counterFresh.bounds(), bread: counterFresh.bread }, lampBlanket: { vertices: lampBlanket.vertices, bounds: lampBlanket.bounds(), legFit: lampBlanket.legFit }, credenzaDecor: { vertices: credenzaDecor.vertices, bounds: credenzaDecor.bounds(), cups: credenzaDecor.cups, keepsake: credenzaDecor.keepsake }, entryWallDetails: { vertices: entryWallDetails.vertices, bounds: entryWallDetails.bounds(), clock: entryWallDetails.clock, corkboard: entryWallDetails.corkboard, hooks: entryWallDetails.hooks, tote: entryWallDetails.tote, redTote: entryWallDetails.redTote, cap: entryWallDetails.cap, shelf: entryWallDetails.shelf }, softForms, cookbookCount: cookbookGroup?.userData.bookCount || 0, storageBoxCount: cookbookGroup?.userData.storageBoxCount || 0, counterMugCount: scene.getObjectByName("prop-counter-mugs")?.userData.mugCount || 0, wokSupport: { bounds: wokCabinetBounds, counter: wokCounterBounds, counterBottomY: wokCounterBounds ? wokCounterBounds.min[1] : null, counterTopY: wokCounterBounds ? wokCounterBounds.max[1] : null }, sceneBounds: { kitchen: boxFor("merged-kitchen"), counter: boxFor("merged-counter"), structure: boxFor("merged-structure"), hood: boxFor("merged-hood"), sideKitchen: boxFor("merged-side-kitchen"), wokBase: categoryBoxFor("wok-base-cabinet") }, materialColors: { wall: `#${materials.wall.color.getHexString()}`, cabinet: `#${materials.olive.color.getHexString()}`, hood: `#${materials.hoodSteel.color.getHexString()}`, ceiling: `#${materials.ceiling.color.getHexString()}`, windowBeam: `#${materials.windowBeam.color.getHexString()}`, beam: `#${materials.beam.color.getHexString()}`, floor: `#${materials.floor.color.getHexString()}` }, materialEmissiveIntensity: { ceiling: materials.ceiling.emissiveIntensity, windowBeam: materials.windowBeam.emissiveIntensity }, edgeRadii: EDGE_RADIUS_BY_CATEGORY, roundingSegments: ROUNDING_SEGMENTS, vertices, triangles, meshes, drawCallsLastFrame: renderer.info.render.calls, categories, rug: rugBounds, rugSamples: { rug: project([1.22, 0.022, 0.5]), floorBesideRug: project([1.72, 0.002, 0.5]) }, floorSamples: { farFromWindow: project([1.72, 0.002, 0.5]) }, pixelRatio: renderer.getPixelRatio(), canvas: [renderer.domElement.width, renderer.domElement.height], camera: camera.position.toArray(), cameraTarget: controls.target.toArray(), cameraFov: camera.fov, viewport: [stage.clientWidth, stage.clientHeight], wokOpeningWidth: 0, projectedRegions: { dining: project([0, 0.76, 0.5]), kitchen: project([0, 1.2, -2.0]), countertop: project([0, 0.955, -2.03]), cabinetSample: project([-0.52, 1.78, -1.9225]), pendant: project([0, 1.98, 0.15]), wallArt: project([2.908, 1.52, -0.02]), wokDoor: project(scene.getObjectByName("wok-kitchen-sloped-hood")?.position.toArray() || [2.68, 1.72, 1.68]), wokBowl: project(scene.getObjectByName("wok-kitchen-wok")?.position.toArray() || [2.64, 0.98, 1.68]), wokHood: project(scene.getObjectByName("wok-kitchen-sloped-hood")?.position.toArray() || [2.68, 1.72, 1.68]), wokGlow: project(scene.getObjectByName("wok-kitchen-hood-light")?.position.toArray() || [2.62, 1.55, 1.68]), wokBase: project([wokCabinetBounds.min[0] + wokCabinetBounds.size[0] / 2, wokCabinetBounds.min[1] + wokCabinetBounds.size[1] / 2, wokCabinetBounds.min[2] + wokCabinetBounds.size[2] / 2]), doorReveal: project(scene.getObjectByName("wok-kitchen-hood-light")?.position.toArray() || [2.62, 1.55, 1.68]), doorPanel: project([2.9, 1.62, 0.78]), wokOpening: project(scene.getObjectByName("wok-kitchen-wok")?.position.toArray() || [2.64, 0.98, 1.68]), wallBesideWok: project([2.9, 1.62, 0.78]), floorLamp: project(lampInfo["floor-reading-lamp"].center) } };
  };
  const instance = {
    tablePhoneInfo, morningTouchInfo, autumnLeavesInfo,
    outletsInfo: () => outlets.info(),
    recordPlayerInfo: () => ({ ...recordPlayer.info(), ringVisible: !vinylRing.hidden, hintSeen: vinylFound, nookKeepsake: credenzaDecor.keepsake }),
    cupPortal: () => cupPortal && { url: cupPortal.url(), hovering: cupPortal.hovering(), fine: cupPortal.fine(), centre: cupPortal.box.getCenter(new THREE.Vector3()).toArray() }, turkeySteamInfo: () => turkeySteam.info(), recordMusicState: () => ({ side: recordSide, bay: recordBay.state(), windowsill: recordA.state(), lane: recordB.state() , epic: recordEpic.state()}), stopRecord: stopRecords, nextRecordPiece: () => { if (recordSide >= 0) advanceRecord(); return recordSide; }, // QA: skip to the next piece
    setMood, resize, render, camera, controls, info, moodSlots, plaqueMesh: housePlaque, setCenterView,
    doorScreen, doorOpen: () => roomDoor.set(true, true, render), doorClose: () => roomDoor.set(false, true, render), doorSnap: (open) => roomDoor.set(open, false, render), doorIsOpen: () => roomDoor.isOpen(), doorInfo: () => roomDoor.info(), doorBounds: () => { const b = roomDoor.bounds(); return { min: b.min.toArray(), max: b.max.toArray() }; }, doorLeafBounds: () => { const b = roomDoor.leafBounds(); return { min: b.min.toArray(), max: b.max.toArray() }; },
    robotScreen, robotHop, onRender: (listener) => { renderListeners.push(listener); },
    robotInfo: () => robot.ready ? (() => { const b = new THREE.Box3().setFromObject(robot.pivot); return { ready: true, heightMm: Number(((b.max.y - b.min.y) * 1000).toFixed(1)), floorGapMm: Number((b.min.y * 1000).toFixed(1)), centre: [Number(((b.min.x + b.max.x) / 2).toFixed(3)), Number(((b.min.z + b.max.z) / 2).toFixed(3))], belt: "#e3b23c" }; })() : { ready: false },
    wallpaperOptions: () => [...grasscloth.options],
    setSurfaceFinish, surfaceFinishInfo: () => ({ ...surfaceFinish }), entryHallWallColor: () => `#${entryHallWallMaterial?.color.getHexString() || "e9bdb9"}`,
    setWallpaper: (name) => { const done = grasscloth.set(name); render(); return done; },
    yardViews: () => ["auto", ...Object.keys(YARD_VIEWS)],
    setYardView: (name, onDone = () => {}) => {
      if (name !== "auto" && !YARD_VIEWS[name]) return false;
      yardView = name;
      if (name === "auto" || yardViewTextures[name]?.image) { setMood(currentMood); render(); onDone({ name, status: "loaded" }); return true; }
      new THREE.TextureLoader().load(new URL(YARD_VIEWS[name], import.meta.url).href, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        texture.name = `courtyard-${name}`;
        yardViewTextures[name] = texture;
        setMood(currentMood); render();
        onDone({ name, status: "loaded" });
      }, undefined, () => onDone({ name, status: "failed" }));
      return true;
    },
    setArtwork: (frameKey, optionKey, onDone) => wallArt.setArtwork(frameKey, optionKey, (result) => { render(); onDone?.(result); }),
    artOptions: () => Object.fromEntries(Object.entries(wallArt.artOptions).map(([frame, options]) => [frame, Object.keys(options)])),
    setRecordView, recordViewInfo: () => recordSaved ? { target: [...RECORD_VIEW.target], position: [...RECORD_VIEW.position], distance: camera.position.distanceTo(controls.target), fov: camera.fov } : null,
    setNookView, nookViewInfo: () => nookSaved ? { target: [...NOOK_VIEW.target], position: [...NOOK_VIEW.position], azimuthHalfRange: NOOK_VIEW.azimuthHalfRange, minDistance: NOOK_VIEW.minDistance } : null,
    nookAnimating: () => Boolean(nookTween), nookTvCutHidden, nookHotspotInfo, sinkStation: () => (sinkStationInfoRef ? sinkStationInfoRef() : null),

    pictureLightInfo: () => ({ emissive: pictureLightMaterial ? pictureLightMaterial.emissiveIntensity : null, floor: PICTURE_LIGHT_FLOOR, moodValue: MOOD_LOOK[currentMood]?.pictureLightEmissive ?? 0 }),
    centerViewInfo: () => centerView ? { station: [...CENTER_STATION], yaw: centerView.yaw, pitch: centerView.pitch } : null,
    setLang: (value) => { nookLang = value === "en" ? "en" : "zh"; if (nookCaptionKey) nookCaption.textContent = nookCaptionText(nookCaptionKey); }, samplePixels, sampleNdc,
    setView: (azimuth = 0) => {
      const offset = camera.position.clone().sub(controls.target);
      const spherical = new THREE.Spherical().setFromVector3(offset);
      spherical.theta = azimuth;
      camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
      controls.update(); render();
    },
    dispose: () => {
      stopRecords(); recordPlayer.stop(); document.removeEventListener("visibilitychange", onRecordHidden);
      clearInterval(vinylTimer); vinylRing.remove(); vinylStyle.remove();
      canvas.removeEventListener("pointerdown", vinylPointerDown); canvas.removeEventListener("pointerup", vinylPointerUp);
      canvas.removeEventListener('pointerdown', centerPointerDown);
      canvas.removeEventListener('pointermove', centerPointerMove);
      canvas.removeEventListener('pointerup', centerPointerEnd);
      canvas.removeEventListener('pointercancel', centerPointerEnd);
      canvas.removeEventListener('keydown', centerKey);
      resizeObserver.disconnect(); controls.dispose(); renderer.dispose();
      const foodVariants = tablewareGroup?.userData.foodVariants;
      const activeFood = tablewareGroup?.getObjectByName("room03-tableware-food")?.geometry;
      if (foodVariants) for (const geometry of Object.values(foodVariants)) {
        if (!tablewareGroup.parent || geometry !== activeFood) geometry.dispose();
      }
      const disposedTextures = new Set();
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        for (const material of (Array.isArray(object.material) ? object.material : [object.material])) {
          if (!material) continue;
          for (const value of Object.values(material)) if (value?.isTexture && !disposedTextures.has(value)) { disposedTextures.add(value); value.dispose(); }
          material.dispose();
        }
      });
      Object.values(materials).forEach((material) => { material.map?.dispose(); material.dispose(); });
      Object.values(skyMaterials).forEach((texture) => texture.dispose());
      movieScreenTexture?.dispose();
      thanksgivingScreenTexture?.dispose();
      autumnCourtyardTexture?.dispose();
      nightYardTexture?.dispose();
    },
  };
  onReady(instance);
  return instance;
}
