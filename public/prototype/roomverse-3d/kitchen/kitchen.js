import * as THREE from "../vendor/three.module.min.js";
import { OrbitControls } from "../vendor/OrbitControls.js";
import { mergeGeometries, mergeVertices } from "../vendor/BufferGeometryUtils.js";
import { GLTFLoader } from "../vendor/GLTFLoader.js";
import { LOUNGE_THROW_POSITIONS_B64 } from "./lounge-throw-baked.js";

export const ROOM_TITLE = "Room 03｜Bay Area Kitchen";
const ROOM = Object.freeze({ width: 6, depth: 4.8, height: 2.7 });
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
  cream: 0xf0e8da, oak: 0xbc8a53, beam: 0x8a5a2e, ceiling: 0xc48a4a, olive: 0x71805b,
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

function makeRugTexture() {
  const texture = makeTexture((ctx, w, h) => {
    ctx.fillStyle = "#e7dcc2"; ctx.fillRect(0, 0, w, h);
    let state = 37;
    const rand = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
    ctx.save(); ctx.beginPath(); ctx.rect(5, 5, w - 10, h - 10); ctx.clip();
    // Broken bundles, random spacing and short cross-fibres; no full-length cross grid.
    for (let i = 0; i < 170; i++) {
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
  const pillowWeave = boucle.clone();
  pillowWeave.repeat.set(1.7, 1.35);
  const throwWeave = boucle.clone();
  throwWeave.repeat.set(1.35, 2.1);
  return {
    floor: std(0xcdbb9e, 0.42, { map: makeFloorTexture(31, 0.23), metalness: 0.025 }),
    wall: std(COLORS.cream, 0.94, { map: makePlasterTexture() }),
    wokWall: std(0x907258, 0.9, { map: makeFineNoise(47, 0.025) }),
    wokSteel: std(0xbfc3c0, 0.34, { metalness: 0.22, emissive: 0x2e1e0e, emissiveIntensity: 0.45 }),
    wokIron: std(0x343733, 0.42, { metalness: 0.08, emissive: 0x16120e, emissiveIntensity: 0.18 }),
    ceiling: std(COLORS.ceiling, 0.86, { map: makeWoodTexture(true, true), emissive: 0x9b6938, emissiveIntensity: 0.34 }),
    oak: std(COLORS.oak, 0.76, { map: makeWoodTexture(false) }),
    beam: std(COLORS.beam, 0.79, { map: makeWoodTexture(false) }),
    olive: std(COLORS.olive, 0.88, { map: makeCabinetTexture() }),
    stone: std(COLORS.stone, 0.45, { map: makeFineNoise(23, 0.025) }),
    black: std(COLORS.black, 0.44), steel: std(COLORS.steel, 0.38),
    hoodSteel: std(0xd1d3cc, 0.56, { map: makeBrushedMetalTexture(), metalness: 0.08 }),
    jute: std(COLORS.jute, 0.96, { map: makeRugTexture() }), seat: std(0xb8a17e, 0.98, { map: makeSeatTexture() }),
    loungeFabric: std(0xe4d5bd, 0.98, { map: boucle }),
    // Deeper sage and a warmer camel, only on this chair's loose cushions, so the pillow reads as cotton and the throw as linen.
    loungePillow: std(0x7f946c, 0.94, { map: pillowWeave, side: THREE.DoubleSide }),
    loungeThrow: std(0xb18458, 1, { map: throwWeave, side: THREE.DoubleSide }),
    red: std(COLORS.terracotta, 0.34), glass: new THREE.MeshPhysicalMaterial({ color: 0xb9d3d1, roughness: 0.12, metalness: 0.06, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false }),
    opal: new THREE.MeshStandardMaterial({ color: COLORS.opal, roughness: 0.22, emissive: 0xffdfa4, emissiveIntensity: 0.24 }),
    porcelain: std(0xe1ddd2, 0.72), coffee: std(0x47372b, 0.78),
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

  // Three exposed timber beams run from the glass wall into the kitchen.
  for (const x of [-2.05, 0, 2.05]) addBox(b, "structure", m.beam, [0.16, 0.18, 4.72], [x, 2.57, 0]);
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

function buildKitchen(b, m) {
  // Straight olive cabinet run, kept low and uncluttered.
  addBox(b, "kitchen", m.olive, [4.24, 0.75, 0.62], [0, 0.485, -2.04]);
  addBox(b, "kitchen", m.olive, [4.0, 0.11, 0.54], [0, 0.055, -2.04]);
  for (const x of [-1.55, -0.52, 0.52, 1.55]) {
    addBox(b, "kitchen", m.olive, [0.99, 0.72, 0.035], [x, 0.47, -1.715]);
    addBox(b, "hardware", m.black, [0.27, 0.018, 0.025], [x, 0.71, -1.69]);
  }
  addBox(b, "counter", m.stone, [4.46, 0.09, 0.74], [0, 0.91, -2.02]);
  addBox(b, "backsplash", m.stone, [4.34, 0.5, 0.035], [0, 1.21, -2.285]);
  addBox(b, "kitchen", m.olive, [4.24, 0.66, 0.42], [0, 1.78, -2.16]);
  // Handle-less push-to-open doors with a slim shadow gap along the lower edge (Paul 2026-10-29: make the top row more modern and technical), and the
  // far-left door is replaced by a built-in dish dryer (buildDishDryer).
  for (const x of [-1.55, -0.52, 0.52, 1.55]) {
    if (x !== -1.55) addBox(b, "kitchen", m.olive, [0.98, 0.61, 0.035], [x, 1.78, -1.94]);
    if (x !== -1.55) addBox(b, "hardware", m.black, [0.96, 0.010, 0.006], [x, 1.4825, -1.9225]);
  }
  // Sink, faucet and main cooktop.
  addBox(b, "appliances", m.black, [0.68, 0.045, 0.42], [-1.25, 0.963, -2.02]);
  addBox(b, "appliances", m.steel, [0.55, 0.025, 0.3], [-1.25, 0.984, -2.02]);
  addBox(b, "appliances", m.steel, [0.028, 0.35, 0.028], [-1.25, 1.12, -1.88]);
  addBox(b, "appliances", m.steel, [0.19, 0.028, 0.028], [-1.25, 1.28, -1.97]);
  addBox(b, "appliances", m.black, [0.9, 0.035, 0.58], [0.82, 0.98, -2.02]);
  // Gas hob (Paul 2026-10-29: four bare rings read like an induction plate): each burner is a low dark-steel head with a hollow centre, inside a flat
  // cast-iron pan-support frame, with four knobs on the front edge. Everything stays under 12 mm so the pots and the pan-support ray still reach the plate.
  const hobTop = 0.9975;
  for (const x of [0.53, 1.1]) for (const z of [-2.18, -1.88]) {
    const head = new THREE.LatheGeometry([[0.022, 0], [0.052, 0], [0.052, 0.006], [0.040, 0.009], [0.022, 0.007]].map(([radius, y]) => new THREE.Vector2(radius, y)), 20);
    addGeometryToBucket(b, "appliances", m.steel, head, [x, hobTop, z]);
    for (const side of [-1, 1]) {
      addGeometryToBucket(b, "appliances", m.black, new THREE.BoxGeometry(0.013, 0.012, 0.27), [x + side * 0.135, hobTop + 0.006, z]);
      addGeometryToBucket(b, "appliances", m.black, new THREE.BoxGeometry(0.27, 0.012, 0.013), [x, hobTop + 0.006, z + side * 0.135]);
    }
  }
  for (const x of [0.58, 0.74, 0.90, 1.06]) {
    addGeometryToBucket(b, "appliances", m.steel, new THREE.CylinderGeometry(0.017, 0.019, 0.018, 14), [x, 0.98, -1.722], [Math.PI / 2, 0, 0]);
  }
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
  // Under-cabinet light is an emissive strip plus a single low-power task spot.
  addBox(b, "light-fixtures", m.warmGlow, [3.45, 0.018, 0.024], [0, 1.43, -1.91]);
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

  addBox(b, "wok-base-cabinet", m.olive, [cabDepth, bodyH, cabLen], [cabX, bodyY, counterZ]);
  const kickDepth = 0.46;
  const kickMaxX = 2.872;
  const kickX = kickMaxX - kickDepth / 2;
  addBox(b, "wok-base-cabinet", m.olive, [kickDepth, 0.10, cabLen - 0.08], [kickX, 0.07, counterZ]);
  const doorX = cabX - cabDepth / 2 + 0.006;
  for (const dz of [-0.32, 0.32]) {
    addBox(b, "wok-base-cabinet", m.olive, [0.012, 0.62, 0.60], [doorX, 0.47, counterZ + dz]);
    addBox(b, "wok-base-cabinet", m.steel, [0.016, 0.09, 0.012], [doorX - 0.012, 0.50, counterZ + dz]);
  }

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
  // The bottle shares the wok iron mesh. A separate mesh would spend the draw call the tile needs.
  const wokMesh = [...(b.get(`shapes:${m.wokIron.uuid}`)?.meshes || [])].find((mesh) => mesh.name === "wok-kitchen-wok");
  // Oil bottle with a shoulder, neck and stopper instead of a plain cylinder (same dark mesh, same position).
  const oilGeo = new THREE.LatheGeometry([[0, 0], [0.036, 0], [0.04, 0.012], [0.041, 0.07], [0.036, 0.095], [0.016, 0.115], [0.014, 0.14], [0.017, 0.147], [0, 0.147]].map(([x, y]) => new THREE.Vector2(x, y)), 12);
  oilGeo.translate(wallFaceX - 0.15 - cookX, shelfTop - (counterY + 0.07), shelfZ - 0.06 - cookZ);
  // The wok's helper loop on the side away from the handle, in the same iron mesh.
  const earGeo = new THREE.TorusGeometry(0.03, 0.0065, 5, 10, Math.PI);
  earGeo.rotateZ(-Math.PI / 2);
  earGeo.translate(0.184, 0.115, 0);
  const wokWithOil = mergeGeometries([wokMesh.geometry, oilGeo, earGeo], false);
  oilGeo.dispose();
  earGeo.dispose();
  wokMesh.geometry.dispose();
  wokMesh.geometry = wokWithOil;
  // Rail on two wall brackets with three tools hanging from S-hooks: a ladle, a spatula and a skimmer, each with a real head. Before, a rail floated
  // in the air with two bare sticks. The tools share the black mesh that already existed, so there is no extra draw call.
  const railX = wallFaceX - 0.034, railY = 1.36, railZ = shelfZ + 0.04;
  addBox(b, "side-kitchen", m.black, [0.012, 0.012, 0.26], [railX, railY, railZ]);
  for (const dz of [-0.11, 0.11]) addBox(b, "side-kitchen", m.black, [0.026, 0.022, 0.012], [wallFaceX - 0.013, railY, railZ + dz]);
  const toolParts = [];
  const tool = (geometry, x, y, z, rotation = [0, 0, 0]) => {
    geometry.rotateX(rotation[0]); geometry.rotateY(rotation[1]); geometry.rotateZ(rotation[2]);
    geometry.translate(x, y, z);
    toolParts.push(geometry);
  };
  [-0.085, 0, 0.085].forEach((dz, index) => {
    const z = railZ + dz;
    tool(new THREE.TorusGeometry(0.008, 0.0016, 5, 10, Math.PI * 1.5), railX, railY - 0.004, z, [0, Math.PI / 2, 0]);
    const handleLength = [0.17, 0.19, 0.15][index];
    tool(new THREE.CylinderGeometry(0.0055, 0.0065, handleLength, 7), railX, railY - 0.012 - handleLength / 2, z);
    const headY = railY - 0.012 - handleLength;
    if (index === 0) {
      const bowl = new THREE.SphereGeometry(0.03, 9, 7);
      bowl.scale(0.5, 1, 1);
      tool(bowl, railX, headY - 0.02, z);
    } else if (index === 1) {
      tool(new THREE.BoxGeometry(0.004, 0.075, 0.052), railX, headY - 0.036, z);
    } else {
      tool(new THREE.TorusGeometry(0.03, 0.0035, 5, 14), railX, headY - 0.028, z, [0, Math.PI / 2, 0]);
      tool(new THREE.CylinderGeometry(0.03, 0.03, 0.003, 14), railX, headY - 0.028, z, [0, 0, Math.PI / 2]);
    }
  });
  const spatulas = mergeGeometries(toolParts, false);
  toolParts.forEach((part) => part.dispose());
  addSideMesh(spatulas, m.black, "wok-kitchen-spatula", [0, 0, 0]);

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
  addTiledSplash([0.02, splashH, splashLen], [wallFaceX - 0.007, splashY, splashZ]);
  addTiledSplash([0.13, splashH, 0.016], [wallFaceX - 0.062, splashY, counterMinZ + 0.008]);
  addTiledSplash([0.13, splashH, 0.016], [wallFaceX - 0.062, splashY, counterMaxZ - 0.008]);
  scene.userData.wokTile = { material: wokTile, repeatM: tileRepeatM, status: "pending", readyBeforeFirstPaint: false };

  const hoodShape = new THREE.Shape();
  hoodShape.moveTo(-0.26, -0.12); hoodShape.lineTo(-0.14, 0.10); hoodShape.lineTo(0.14, 0.10); hoodShape.lineTo(0.26, -0.12); hoodShape.closePath();
  const hoodGeometry = new THREE.ExtrudeGeometry(hoodShape, { depth: 0.38, bevelEnabled: true, bevelSegments: 1, bevelThickness: 0.008, bevelSize: 0.006 });
  hoodGeometry.translate(0, 0, -0.19);
  addSideMesh(hoodGeometry, m.wokSteel, "wok-kitchen-sloped-hood", [cookX + 0.04, 1.72, cookZ], [0, Math.PI / 2, 0]);

  const soffitY = 2.61;
  const capH = 0.05;
  const capTop = soffitY + embed;
  const capY = capTop - capH / 2;
  const ductBottom = 1.80;
  const ductTop = capY - capH / 2 + 0.002;
  const ductH = ductTop - ductBottom;
  const ductX = wallFaceX - 0.09;
  const duct = new THREE.Mesh(new THREE.BoxGeometry(0.16, ductH, 0.22), m.wokSteel);
  duct.position.set(ductX, ductBottom + ductH / 2, cookZ); duct.name = "wok-kitchen-hood-duct"; duct.userData.category = "side-kitchen";
  duct.castShadow = true; duct.receiveShadow = true; scene.add(duct);
  const ductCap = new THREE.Mesh(new THREE.BoxGeometry(0.20, capH, 0.26), m.wokSteel);
  ductCap.position.set(ductX, capY, cookZ); ductCap.name = "wok-kitchen-hood-duct-cap"; ductCap.userData.category = "side-kitchen";
  ductCap.castShadow = true; ductCap.receiveShadow = true; scene.add(ductCap);

  const hoodLight = new THREE.Mesh(new THREE.PlaneGeometry(0.40, 0.06), m.wokGlow);
  hoodLight.position.set(cookX - 0.02, 1.55, cookZ); hoodLight.rotation.y = Math.PI / 2; hoodLight.name = "wok-kitchen-hood-light"; hoodLight.userData.category = "side-kitchen";
  hoodLight.castShadow = false; hoodLight.receiveShadow = false;
  sceneAddToBucket(b, hoodLight, "wok-kitchen-hood-light");
  const sideLight = new THREE.PointLight(0xffad64, 0, 0.9, 2); sideLight.position.set(cookX, 1.50, cookZ); sideLight.name = "side-kitchen-warm-source"; scene.add(sideLight);
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
    { wine: [0.214, 0.147], water: [0.234, 0.247], wineScale: 1, waterScale: 1, wineFill: 0.46, waterFill: 0.52 },
    { wine: [0.192, 0.160], water: [0.224, 0.256], wineScale: 1, waterScale: 0.82, wineFill: 0.38, waterFill: 0.60 },
    { wine: [0.230, 0.140], water: [0.202, 0.240], wineScale: 0.9, waterScale: 1, wineFill: 0.55, waterFill: 0 },
    { wine: [0.204, 0.152], water: [0.240, 0.252], wineScale: 1, waterScale: 0.9, wineFill: 0.42, waterFill: 0.48 },
  ];
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
    const waterGeometry = addLathe("glass", waterProfile, 20, water, 0xe8f0ed);
    if (layout.wineScale !== 1) scaleAboutBase(wineGeometry, layout.wineScale, tableY);
    if (layout.waterScale !== 1) scaleAboutBase(waterGeometry, layout.waterScale, tableY);
    const wineLiquid = new THREE.CylinderGeometry(0.031, 0.031, 0.0015, 20, 1, false);
    wineLiquid.translate(wine[0], tableY + 0.001 + TABLEWARE.wineHeight * layout.wineScale * layout.wineFill, wine[2]);
    setVertexColor(wineLiquid, 0x5c1823);
    geometryParts.liquid.push(wineLiquid);
    if (layout.waterFill > 0) {
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
      tableY, plateCenter, wineCenter: wine, waterCenter: water,
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
  group.userData.materials = {
    glass: { transparent: materials.glass.transparent, depthWrite: materials.glass.depthWrite, renderOrder: renderOrder.glass },
    liquid: { transparent: materials.liquid.transparent, depthWrite: materials.liquid.depthWrite, renderOrder: renderOrder.liquid },
  };
  group.userData.colors = { wine: "#5c1823", plate: "#e3dacb", bowl: "#d8ccb6", accent: ["#777f63", "#9a6a50"], linen: "#cdbfa7", napkin: "#dacfba" };
  const mm = (value) => Number((value * 1000).toFixed(1));
  const boxClear = (a, b) => mm(Math.hypot(Math.max(a.min.x - b.max.x, b.min.x - a.max.x, 0), Math.max(a.min.y - b.max.y, b.min.y - a.max.y, 0), Math.max(a.min.z - b.max.z, b.min.z - a.max.z, 0)));
  // Plan-view distance from a round tableware footprint (plate, glasses) to a piece's bounding rectangle; a union box per setting would be too coarse.
  const circleClear = ([cx, cz], radius, box) => Math.hypot(Math.max(box.min.x - cx, cx - box.max.x, 0), Math.max(box.min.z - cz, cz - box.max.z, 0)) - radius;
  const FOOTPRINTS = settings.flatMap((setting) => [[[setting.plateCenter[0], setting.plateCenter[2]], plateRadius], [[setting.wineCenter[0], setting.wineCenter[2]], wineRadius], [[setting.waterCenter[0], setting.waterCenter[2]], waterRadius]]);
  const minSettingClearance = (box) => mm(Math.min(...FOOTPRINTS.map(([centre, radius]) => circleClear(centre, radius, box))));
  group.userData.extras = {
    runner: { widthMm: mm(RUNNER.width), lengthMm: mm(RUNNER.length), gapMm: mm(extraBoxes.runner.min.y - runnerBaseY), minSettingClearanceMm: minSettingClearance(extraBoxes.runner), maxX: Number(extraBoxes.runner.max.x.toFixed(3)) },
    pitcher: { heightMm: mm(extraBoxes.pitcher.max.y - extraBoxes.pitcher.min.y), gapMm: mm(extraBoxes.pitcher.min.y - runnerTop), minSettingClearanceMm: minSettingClearance(extraBoxes.pitcher), lemonClearanceMm: boxClear(extraBoxes.pitcher, lemonBounds), boardClearanceMm: boxClear(extraBoxes.pitcher, extraBoxes.board), maxX: Number(extraBoxes.pitcher.max.x.toFixed(3)) },
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
  // Flat-weave rug: cream ground, two terracotta end bands and a fine sage stripe pair, drawn on a canvas (no download).
  const canvas = document.createElement("canvas");
  canvas.width = 512; canvas.height = 292;
  const context = canvas.getContext("2d");
  context.fillStyle = "#d9ccb2"; context.fillRect(0, 0, 512, 292);
  let seed = 11;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < 1800; i++) { context.fillStyle = `rgba(${random() > 0.5 ? "255,250,235" : "120,98,66"}, ${0.05 + random() * 0.09})`; context.fillRect(random() * 512, random() * 292, 6 + random() * 26, 1 + random() * 1.4); }
  for (const [y, h, color] of [[20, 10, "#a8664b"], [34, 3, "#7d8a68"], [259, 10, "#a8664b"], [252, 3, "#7d8a68"]]) { context.fillStyle = color; context.fillRect(0, y, 512, h); }
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
  const NEAR_Z = 0.72;
  const parts = { decor: [], glass: [], liquid: [] };
  const items = [];
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
    items.push({ name, x, z, radius, gapMm: Number(((geometry.boundingBox.min.y - y) * 1000).toFixed(1)), heightMm: Number(((geometry.boundingBox.max.y - geometry.boundingBox.min.y) * 1000).toFixed(1)) });
    return y;
  };

  // Burgundy-style wine bottle: dark green glass, a blank cream label band, a burgundy foil capsule.
  const bottleProfile = [[0, 0], [0.034, 0], [0.038, 0.006], [0.038, 0.17], [0.034, 0.19], [0.022, 0.215], [0.0155, 0.235], [0.015, 0.285], [0.0165, 0.292], [0.0165, 0.30], [0, 0.30]];
  place("decor", "wine-bottle", paint(lathe(bottleProfile, 20), (y, n) => (y > 0.255 ? 0x5a1a22 : y > 0.06 && y < 0.14 ? 0xd8ceba : n > 0.9 ? 0x2c3a2f : 0x1f2b22)), 0.17, NEAR_Z, 0.038);
  // Two brass candlesticks with cream taper candles (unlit, so no new light source).
  const holderProfile = [[0, 0], [0.034, 0], [0.036, 0.005], [0.014, 0.012], [0.009, 0.06], [0.014, 0.085], [0.018, 0.092], [0.012, 0.096], [0, 0.096]];
  for (const [index, x] of [-0.28, 0.28].entries()) {
    const y = place("decor", `candlestick-${index}`, paint(lathe(holderProfile, 14), () => 0xb08d4e), x, NEAR_Z, 0.036);
    const candle = new THREE.CylinderGeometry(0.0095, 0.0105, 0.19, 10);
    candle.translate(x, y + 0.096 + 0.095 - 0.002, NEAR_Z);
    parts.decor.push(paint(candle, (yy) => (yy > y + 0.28 ? 0xcfc2a8 : 0xe9dfc9)));
    const wick = new THREE.CylinderGeometry(0.0009, 0.0009, 0.012, 4);
    wick.translate(x, y + 0.096 + 0.19 + 0.004, NEAR_Z);
    parts.decor.push(paint(wick, () => 0x2b2b2b));
  }
  // Stoneware bowl heaped with cranberries (muted deep red; the berries are the only red on the table).
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
  // Two extra wine glasses, the same glass and liquid treatment as the place settings.
  const wineRadius = 0.044, wineHeight = 0.100;
  const wineProfile = [[0, 0.001], [wineRadius * 0.59, 0.001], [wineRadius * 0.77, 0.006], [wineRadius * 0.89, 0.019], [wineRadius, wineHeight * 0.55], [wineRadius * 0.977, wineHeight * 0.80], [wineRadius * 0.91, wineHeight * 0.96], [wineRadius * 0.82, wineHeight], [wineRadius * 0.75, wineHeight * 0.97], [wineRadius * 0.80, wineHeight * 0.78], [wineRadius * 0.77, wineHeight * 0.55], [wineRadius * 0.66, 0.025], [wineRadius * 0.50, 0.011], [0, 0.011]];
  for (const [index, [x, fill]] of [[-0.045, 0.44], [0.065, 0.30]].entries()) {
    const y = place("glass", `wine-glass-${index}`, paint(lathe(wineProfile, 20), () => 0xe8f0ed), x, NEAR_Z, wineRadius);
    const wine = new THREE.CylinderGeometry(0.031, 0.031, 0.0015, 20, 1, false);
    wine.translate(x, y + 0.001 + wineHeight * fill, NEAR_Z);
    parts.liquid.push(paint(wine, () => 0x5c1823));
  }

  const materials = {
    decor: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.38, vertexColors: true }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.18, transparent: true, opacity: 0.30, depthWrite: false, vertexColors: true }),
    liquid: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.22, transparent: true, opacity: 0.78, depthWrite: false, vertexColors: true }),
  };
  const renderOrder = { liquid: 1, glass: 2, decor: 3 };
  let vertices = 0;
  for (const [kind, list] of Object.entries(parts)) {
    const geometry = mergeGeometries(list, false);
    list.forEach((part) => part.dispose());
    if (!geometry) throw new Error(`Could not merge Room 03 Thanksgiving ${kind}`);
    geometry.computeVertexNormals();
    vertices += geometry.attributes.position.count;
    const mesh = new THREE.Mesh(geometry, materials[kind]);
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
  return group;
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
  // Swappable prints for the two frames (Paul 2026-10-29). Each option is fetched only when chosen, painted into the same atlas
  // region as the original and then released, so vertices, meshes and draw calls never change and nothing extra loads up front.
  const choice = { "cable-car": "cable-car", "redwood-path": "redwood-path", "lamp-wall": "moon-hills" };
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
    // A cream mat (passe-partout) around the picture, painted into the texture: it is what makes a painting read as a hung, framed object
    // instead of a bright hole in the wall like the window beside it (Paul 2026-10-29). No geometry, no draw call.
    const mat = Math.round(width * 0.07);
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
    atlasContext.fillStyle = "#eee5d2";
    atlasContext.fillRect(left, y, width, height);
    atlasContext.drawImage(source, sx, sy, sw, sh, left + mat, y + mat, innerWidth, innerHeight);
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
    const mat = Math.round(regionWidth * 0.07);
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
    setArtwork(frameKey, optionKey, onDone = () => {}) {
      const urls = ART_OPTIONS[frameKey];
      const asset = frameAssetByKey[frameKey];
      if (!urls || !urls[optionKey] || !asset) return false;
      choice[frameKey] = optionKey;
      new THREE.TextureLoader().load(new URL(urls[optionKey], import.meta.url).href, (texture) => {
        // A later click may have replaced this one while it was loading.
        if (choice[frameKey] === optionKey) paintRegion(asset, texture.image);
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
        redwoodPath: new URL("./art/room03-bay-redwood-path-v1.webp", import.meta.url).href,
        lampWall: new URL("./art/room03-lamp-wall-moon-hills-v1.webp", import.meta.url).href,
      };
      for (const [name, asset] of Object.entries(assets)) {
        loader.load(urls[name], (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          asset.texture = texture;
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
  const centerX = -0.65;
  const screenCenterY = 1.06;
  const screenFrameParts = [
    [[0.98, 0.02, 0.03], [centerX, screenCenterY + 0.275, 0]],
    [[0.98, 0.02, 0.03], [centerX, screenCenterY - 0.275, 0]],
    [[0.02, 0.53, 0.03], [centerX - 0.48, screenCenterY, 0]],
    [[0.02, 0.53, 0.03], [centerX + 0.48, screenCenterY, 0]],
  ];
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
    min: [centerX - 0.49, screenCenterY - 0.275, 3.685],
    max: [centerX + 0.49, screenCenterY + 0.275, 3.715],
    size: [0.98, 0.55, 0.03],
  };
  const console = new THREE.Object3D();
  console.name = "room03-tv-low-console";
  console.userData.bounds = {
    min: [centerX - 0.65, 0.05, 3.365],
    max: [centerX + 0.65, 0.575, 3.686],
    size: [1.30, 0.525, 0.321],
  };
  group.add(frame, console);
  const woodwork = mergeBoxes([...screenFrameParts, ...consoleParts], "screen-and-console woodwork");
  woodwork.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, 3.70));
  woodwork.computeBoundingBox();
  woodGeometries.push(woodwork);

  const screenSlot = new THREE.Group();
  screenSlot.name = "mood-slot-screen-content";
  screenSlot.userData.moodSlot = "screen-content";
  const screenMaterial = new THREE.MeshBasicMaterial({ color: 0x171918, side: THREE.DoubleSide });
  screenMaterial.name = "room03-screen-powered-off";
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.94, 0.53), screenMaterial);
  screen.name = "screen-content-surface";
  screen.userData.moodSlot = "screen-content";
  screen.position.set(centerX, screenCenterY, -0.022);
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
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.94, 0.53), new THREE.MeshBasicMaterial({ map: reflection, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    glass.name = "screen-glass-reflection"; glass.renderOrder = 4;
    glass.position.set(centerX, screenCenterY, -0.025);
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
// Low clay-red credenza under the cable-car painting (Paul 2026-10-29: the wall below the painting was empty, and an all-olive room needs a second
// cabinet colour). It lines up with the wok run and stops 23 mm short of its counter; 45 cm deep and 81.5 cm high with an oak top, so the painting
// keeps about 25 cm of air above it. Four doors with slim brass pulls on a recessed dark plinth. Muted terracotta complements the olive cabinets
// without competing with the red Dutch oven.
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
  const OLIVE = 0x566339, GLASS = 0xe2dccb, BRASS = 0xb08d4e;
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
        casingMm: mm(C), wallDepthMm: mm(wallDepth), colour: "#566339", frameColour: "oak",
        frameBounds: { min: frameBox.min.toArray(), max: frameBox.max.toArray() },
        leafBounds: { min: leafBox3.min.toArray(), max: leafBox3.max.toArray() },
        meshes: 2, vertices: vertexCount(), frameBoxes: doorFrameBoxes().length,
      };
    },
  };
}

function buildRightWallCredenza(scene, m) {
  const WALL_X = 2.94, Z_MIN = -0.80, Z_MAX = 1.00, DEPTH = 0.45, TOP_Y = 0.815, PLINTH = 0.08, TOP_T = 0.03;
  const length = Z_MAX - Z_MIN, zMid = (Z_MIN + Z_MAX) / 2, xBack = WALL_X - 0.002, xFront = xBack - DEPTH, xMid = (xBack + xFront) / 2;
  const parts = { clay: [], oak: [], dark: [], brass: [] };
  // Rounded edges only where they are seen (top and door fronts, 2 bevel segments); hidden body, plinth and pulls are plain boxes.
  const box = (bucket, size, position, rounded = false) => { const g = rounded ? roundedBoxGeometry(size, Math.min(0.006, Math.min(...size) * 0.25), 2) : new THREE.BoxGeometry(...size); if (!rounded) { g.deleteAttribute("uv"); g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2)); } g.translate(...position); parts[bucket].push(rounded ? g : g); return g; };
  const bodyH = TOP_Y - TOP_T - PLINTH;
  box("clay", [DEPTH - 0.02, bodyH, length], [xMid + 0.01, PLINTH + bodyH / 2, zMid]);
  box("dark", [DEPTH - 0.08, PLINTH, length - 0.06], [xMid + 0.04, PLINTH / 2, zMid]);
  box("oak", [DEPTH + 0.01, TOP_T, length + 0.02], [xMid - 0.005, TOP_Y - TOP_T / 2, zMid], true);
  const doors = 4, gap = 0.006, doorW = (length - gap * (doors + 1)) / doors;
  for (let i = 0; i < doors; i++) {
    const z = Z_MIN + gap + doorW / 2 + i * (doorW + gap);
    box("clay", [0.02, bodyH - 0.02, doorW], [xFront - 0.004, PLINTH + bodyH / 2, z], true);
    const pullZ = z + (i % 2 ? -1 : 1) * (doorW / 2 - 0.035);
    box("brass", [0.012, 0.14, 0.012], [xFront - 0.02, PLINTH + bodyH - 0.12, pullZ]);
  }
  // One mesh: the four finishes are vertex colours on the shared cabinet grain map (one draw call instead of four).
  const tints = { clay: 0x9c5b45, oak: 0xbc8a53, dark: 0x2b2b2b, brass: 0xb08d4e };
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
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.8, map: m.olive.map }));
  mesh.name = "credenza"; mesh.userData.category = "credenza";
  mesh.castShadow = true; mesh.receiveShadow = true;
  group.add(mesh);
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
      doors, color: "#9c5b45", meshes: group.children.length, vertices,
    }),
  };
}

function buildDishDryer(scene, m) {
  const group = new THREE.Group();
  group.name = "dish-dryer";
  group.userData.category = "appliances";
  const CX = -1.55, CY = 1.78, DOOR_Z = -1.94, W = 0.96, H = 0.60, D = 0.035;
  const TOP = 0.075, BOTTOM = 0.028, SIDE = 0.04;
  const parts = [];
  const bar = (w, h, d, x, y, z) => { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z); parts.push(g); };
  bar(W, TOP, D, CX, CY + H / 2 - TOP / 2, DOOR_Z);
  bar(W, BOTTOM, D, CX, CY - H / 2 + BOTTOM / 2, DOOR_Z);
  const innerTop = CY + H / 2 - TOP, innerBottom = CY - H / 2 + BOTTOM, innerHeight = innerTop - innerBottom, innerY = (innerTop + innerBottom) / 2;
  for (const side of [-1, 1]) bar(SIDE, innerHeight, D, CX + side * (W / 2 - SIDE / 2), innerY, DOOR_Z);
  // three ribs across the top band, like the pull-down grille on the real unit
  for (const dy of [-0.012, 0, 0.012]) bar(W - 0.02, 0.0035, 0.004, CX, CY + H / 2 - TOP / 2 + dy, DOOR_Z + D / 2 + 0.0012);
  const frameGeometry = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose());
  frameGeometry.computeVertexNormals();
  const steel = m.hoodSteel.clone(); steel.color.set(0x8f9598); steel.metalness = 0.3; steel.roughness = 0.5; // cooler stainless than the beige-leaning hood steel
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
  c.fillStyle = "rgba(255,255,255,0.035)"; c.beginPath(); c.moveTo(0, ch * 0.55); c.lineTo(cw * 0.45, 0); c.lineTo(cw * 0.62, 0); c.lineTo(0, ch * 0.9); c.fill();
  c.fillStyle = "rgba(255,255,255,0.025)"; c.beginPath(); c.moveTo(cw * 0.5, ch); c.lineTo(cw, ch * 0.3); c.lineTo(cw, ch * 0.5); c.lineTo(cw * 0.75, ch); c.fill();
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

function buildHouseholdProps(scene, m) {
  const counterY = 0.955;
  // A compact American drip brewer: a warm-white housing and visible glass carafe.
  const coffeeMaker = buildPropGroup(scene, "drip-coffee-maker", [-0.34, counterY - 0.001, -2.03], ({ box, shape }) => {
    box(m.porcelain, [0.28, 0.036, 0.25], [0, 0.018, 0]);
    box(m.porcelain, [0.22, 0.18, 0.15], [0, 0.125, -0.035]);
    box(m.porcelain, [0.26, 0.065, 0.16], [0, 0.245, -0.04]);
    box(m.black, [0.12, 0.018, 0.1], [0, 0.29, -0.04]);
    const carafeProfile = [
      new THREE.Vector2(0.050, 0.008), new THREE.Vector2(0.058, 0.008),
      new THREE.Vector2(0.060, 0.016), new THREE.Vector2(0.060, 0.092),
      new THREE.Vector2(0.055, 0.108), new THREE.Vector2(0.046, 0.118),
      new THREE.Vector2(0.041, 0.125), new THREE.Vector2(0.036, 0.125),
      new THREE.Vector2(0.036, 0.118), new THREE.Vector2(0.041, 0.111),
      new THREE.Vector2(0.049, 0.101), new THREE.Vector2(0.050, 0.020),
      new THREE.Vector2(0, 0.020),
    ];
    shape(new THREE.LatheGeometry(carafeProfile, 20), m.glass, [0, 0.105, 0.065]);
    shape(new THREE.CylinderGeometry(0.055, 0.052, 0.032, 10), m.coffee, [0, 0.078, 0.065]);
    // A square strap handle on two studs instead of the black ring that read like a water-dispenser dial (Paul 2026-10-29).
    box(m.black, [0.014, 0.072, 0.012], [0.080, 0.112, 0.065]);
    box(m.black, [0.026, 0.012, 0.012], [0.069, 0.148, 0.065]);
    box(m.black, [0.026, 0.012, 0.012], [0.069, 0.076, 0.065]);
    shape(new THREE.SphereGeometry(0.012, 8, 6), m.black, [0.085, 0.205, 0.015]);
    const outlet = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.205, 0.01), new THREE.Vector3(0, 0.174, 0.018), new THREE.Vector3(0, 0.15, 0.036),
    ]);
    shape(new THREE.TubeGeometry(outlet, 8, 0.006, 8, false), m.black);
    shape(new THREE.TorusGeometry(0.009, 0.003, 4, 10), m.black, [0, 0.148, 0.036], [Math.PI / 2, 0, 0]);
  });

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
  const kettle = buildPropGroup(scene, "electric-kettle", [-0.76, counterY - 0.011, -2.04], ({ shape }) => {
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
  const riceCooker = buildPropGroup(scene, "rice-cooker", [-1.92, counterY - 0.004, -2.03], ({ box, shape }) => {
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

  // A turned oak utensil crock with a rolled lip, a real hollow, and three
  // softly splayed spoons. The low radial segment count keeps it lightweight.
  const utensilCrock = buildPropGroup(scene, "oak-utensil-crock", [-1.72, counterY - 0.003, -1.73], ({ shape }) => {
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
  const pantryJar = buildPropGroup(scene, "glass-pantry-jar", [-0.99, counterY - 0.003, -1.73], ({ shape }) => {
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
  [coffeeMaker, kettle, utensilCrock, pantryJar, riceCooker, saucepan].forEach(savePropMeasure);
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
  mergeWorldMaterialMeshes([utensilCrock, pantryJar], m.oak, "prop-countertop-oak-shared");
  const sharedCounterGlass = mergeWorldMaterialMeshes([coffeeMaker, pantryJar], m.glass, "prop-countertop-glass-shared", 2);
  sharedCounterGlass.castShadow = false;
  sharedCounterGlass.receiveShadow = false;
  // Preserve the steel/black distinction as per-vertex color while merging
  // these small hardware parts into one draw call for narrow mobile views.
  mergeWorldTintedMeshes([kettle, riceCooker, saucepan], [m.steel, m.black], "prop-countertop-hardware-shared");

  // Cutting board, unbranded oil and salt sit at the free end of the counter.
  buildPropGroup(scene, "cutting-board", [0, counterY, 0], ({ box, shape }) => {
    box(m.oak, [0.34, 0.42, 0.026], [1.62, 0.22, -2.23], [-0.14, 0, 0]);
    shape(new THREE.TorusGeometry(0.032, 0.006, 5, 10), m.oak, [1.62, 0.448, -2.23]);
  });
  buildPropGroup(scene, "oil-and-salt", [0, counterY, 0], ({ shape }) => {
    shape(new THREE.CylinderGeometry(0.038, 0.043, 0.16, 9), m.oilGlass, [1.42, 0.08, -1.96]);
    shape(new THREE.CylinderGeometry(0.021, 0.021, 0.036, 8), m.black, [1.42, 0.178, -1.96]);
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
  scene.add(centerpieceSlot);

  // Three upright cookbooks on the existing cabinet top; one leans gently against its neighbor.
  const cookbooks = buildPropGroup(scene, "cookbooks", [-1.52, 2.11, -2.16], ({ shape }) => {
    const addBookPart = (material, size, center, pivotX, tilt) => {
      const geometry = new THREE.BoxGeometry(...size);
      geometry.translate(...center);
      geometry.translate(-pivotX, 0, 0);
      geometry.rotateZ(tilt);
      geometry.translate(pivotX, 0, 0);
      shape(geometry, material);
    };
    const books = [
      { x: -0.09, width: 0.082, height: 0.24, depth: 0.15, cover: m.olive, tilt: -0.11 },
      { x: 0, width: 0.088, height: 0.285, depth: 0.16, cover: m.beam, tilt: 0 },
      { x: 0.096, width: 0.084, height: 0.325, depth: 0.15, cover: m.black, tilt: 0 },
    ];
    for (const book of books) {
      const { x, width, height, depth, cover, tilt } = book;
      addBookPart(cover, [width, height, depth], [x, height / 2, 0], x, tilt);
      addBookPart(m.porcelain, [width - 0.012, height - 0.02, depth - 0.022], [x, height / 2, 0.004], x, tilt);
      addBookPart(m.porcelain, [width * 0.67, height - 0.012, 0.006], [x + width * 0.165, height / 2, depth / 2 + 0.004], x, tilt);
      addBookPart(cover, [width * 0.32, height, 0.008], [x - width * 0.34, height / 2, depth / 2 + 0.006], x, tilt);
    }
  });
  cookbooks.userData.bookCount = 3;
}

// Three compact living details, each batched to one vertex-colour mesh. Their
// silhouettes stay genuinely three-dimensional while keeping draw calls low.
// Foliage cards for the Meyer lemon tree (Paul 2026-10-29: programmatic leaf balls are not 3D enough; image-to-3D turned the crown into a flat slab).
// Real, painted leaves and lemons were cut out of Codex's concept pictures into an alpha atlas (3 x 2 patches), and 46 small cards are scattered through
// an ellipsoid crown, each with its outward normal blended in so the crown shades like a volume. Every card has a front and a back quad (no flipped normals).
// A canvas atlas draws instantly; the painted webp replaces it when it loads (if it fails, the canvas leaves stay).
function buildLemonLeafCards(crown) {
  const canvas = document.createElement("canvas");
  canvas.width = 768; canvas.height = 512;
  const context = canvas.getContext("2d");
  let seed = 5;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let slot = 0; slot < 6; slot++) {
    const ox = (slot % 3) * 256, oy = Math.floor(slot / 3) * 256;
    context.save();
    context.beginPath(); context.ellipse(ox + 128, oy + 128, 118, 118, 0, 0, Math.PI * 2); context.clip();
    for (let i = 0; i < 16; i++) {
      context.save();
      context.translate(ox + 40 + random() * 176, oy + 40 + random() * 176);
      context.rotate(random() * Math.PI * 2);
      const gradient = context.createLinearGradient(-28, 0, 28, 0);
      gradient.addColorStop(0, random() > 0.5 ? "#4f6a34" : "#5b7a3a"); gradient.addColorStop(1, "#7b9150");
      context.fillStyle = gradient;
      context.beginPath(); context.ellipse(0, 0, 30 + random() * 8, 11 + random() * 3, 0, 0, Math.PI * 2); context.fill();
      context.strokeStyle = "rgba(220,235,170,0.55)"; context.lineWidth = 1.2; context.beginPath(); context.moveTo(-28, 0); context.lineTo(28, 0); context.stroke();
      context.restore();
    }
    if (slot >= 3) {
      context.fillStyle = "#d9a937"; context.beginPath(); context.ellipse(ox + 118, oy + 130, 34, 44, 0.2, 0, Math.PI * 2); context.fill();
    }
    context.restore();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  new THREE.TextureLoader().load(new URL("./art/room03-lemon-leaf-atlas-v2.webp", import.meta.url).href, (loaded) => {
    texture.image = loaded.image; texture.needsUpdate = true; loaded.dispose();
  }, undefined, () => { /* keep the canvas atlas */ });
  const material = new THREE.MeshStandardMaterial({ map: texture, alphaTest: 0.5, roughness: 0.55, metalness: 0, side: THREE.FrontSide, emissive: 0x2c3b1b, emissiveMap: texture, emissiveIntensity: 0.28 });
  const positions = [], normals = [], uvs = [], indices = [];
  const up = new THREE.Vector3(0, 1, 0), centre = new THREE.Vector3(crown.cx, crown.cy, crown.cz);
  // 46 slots, but a few low front cards are left out so the trunk and branches show through (a real crown is loose, not a solid ball).
  const count = 46;
  let placed = 0;
  for (let i = 0; i < count; i++) {
    // Fibonacci sphere, flattened a little and pulled in at random depths; fewer cards on the underside
    const t = (i + 0.5) / count;
    const polar = Math.acos(1 - 2 * t * 0.92 - 0.08);
    const azimuth = i * 2.399963;
    const depth = 0.55 + 0.45 * ((i * 37) % 11) / 10;
    const radial = new THREE.Vector3(Math.sin(polar) * Math.cos(azimuth), Math.cos(polar), Math.sin(polar) * Math.sin(azimuth));
    if (radial.y < 0.15 && i % 3 !== 0) continue;
    if (radial.y > 0.2 && radial.y < 0.55 && i % 5 === 2) continue;
    placed++;
    const position = new THREE.Vector3(crown.cx + radial.x * crown.rx * depth, crown.cy + radial.y * crown.ry * depth, crown.cz + radial.z * crown.rz * depth);
    const wobble = new THREE.Vector3(Math.sin(i * 12.9898) , Math.sin(i * 78.233), Math.sin(i * 37.719)).multiplyScalar(0.3);
    const facing = radial.clone().multiplyScalar(0.75).add(wobble).normalize();
    const side = new THREE.Vector3().crossVectors(up, facing);
    if (side.lengthSq() < 1e-4) side.set(1, 0, 0);
    side.normalize();
    const high = new THREE.Vector3().crossVectors(facing, side).normalize();
    const roll = (i * 1.7) % (Math.PI * 2);
    const u = side.clone().multiplyScalar(Math.cos(roll)).addScaledVector(high, Math.sin(roll));
    const v = high.clone().multiplyScalar(Math.cos(roll)).addScaledVector(side, -Math.sin(roll));
    const size = 0.205 + 0.05 * (((i * 53) % 7) / 6);
    // slot: lemon patches (3, 4, 5) go mainly to the outer, front-facing cards
    const outer = depth > 0.82 && radial.z > -0.2;
    const slot = outer && i % 3 === 0 ? 3 + (i % 3 + i % 2) % 3 : (i % 3);
    const col = slot % 3, row = Math.floor(slot / 3);
    const u0 = col / 3, u1 = (col + 1) / 3, v0 = 1 - (row + 1) / 2, v1 = 1 - row / 2;
    const shadeNormal = radial.clone().multiplyScalar(0.65).addScaledVector(facing, 0.35).normalize();
    for (const flip of [1, -1]) {
      const base = positions.length / 3;
      const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
      for (const [cx, cy] of corners) {
        const point = position.clone().addScaledVector(u, cx * size / 2).addScaledVector(v, cy * size / 2);
        positions.push(point.x, point.y, point.z);
        normals.push(shadeNormal.x, shadeNormal.y, shadeNormal.z);
        uvs.push(cx < 0 ? u0 : u1, cy < 0 ? v0 : v1);
      }
      if (flip === 1) indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
      else indices.push(base, base + 2, base + 1, base, base + 3, base + 2);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeBoundingBox(); geometry.computeBoundingSphere();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "prop-window-meyer-lemon-tree-leaf-cards";
  mesh.userData.category = "household-props";
  mesh.userData.propKey = "window-meyer-lemon-tree";
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
    material.name = "warm-opal-glass";
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
    paint(place(new THREE.CylinderGeometry(0.012, 0.012, 1.15, 8), [0, 0.62, 0]), 0x2a2622),
    ...[0, 1, 2].map((index) => {
      const angle = index * Math.PI * 2 / 3 + Math.PI / 6;
      return paint(segment(
        [Math.cos(angle) * 0.055, 0.17, Math.sin(angle) * 0.055],
        [Math.cos(angle) * 0.15, 0.012, Math.sin(angle) * 0.15],
        0.009, 0.007, 8,
      ), 0x2a2622);
    }),
    paint(place(new THREE.CylinderGeometry(0.038, 0.052, 0.025, 10), [0, 0.17, 0]), 0x2a2622),
  ]), hardwareMaterial());
  floorHardwareMesh.castShadow = false;
  const paperRings = [
    [0.145, 1.25], [0.153, 1.33], [0.16, 1.42], [0.153, 1.51], [0.145, 1.59],
  ].map(([radius, y]) => paint(place(new THREE.TorusGeometry(radius, 0.003, 4, 24), [0, y, 0], [Math.PI / 2, 0, 0]), 0xe4d3b3));
  const lanternProfile = [
    [0.137, -0.23], [0.15, -0.20], [0.158, -0.13], [0.16, -0.05],
    [0.16, 0.05], [0.158, 0.13], [0.15, 0.20], [0.137, 0.23],
  ].map(([radius, y]) => new THREE.Vector2(radius, y));
  const lanternPaper = paint(new THREE.LatheGeometry(lanternProfile, 24), 0xf2e6cd);
  lanternPaper.translate(0, 1.42, 0);
  const floorShadeMesh = addMesh(floor, "floor-reading-lamp-shade", mergeParts([lanternPaper, ...paperRings]), floorShade);
  floorShadeMesh.castShadow = false;
  scene.add(floor);
  const floorLight = new THREE.PointLight(0xffc27a, 0, 6, 2);
  floorLight.name = "floor-lamp-light";
  floorLight.castShadow = false;
  floorLight.position.set(-1.93, 1.42, 1.68);
  scene.add(floorLight);
  const floorHalo = addHalo("floor-lamp-halo", [-1.93, 1.42, 1.68], 0.62);

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
  ]), hardwareMaterial());
  addMesh(picture, "redwood-picture-light-diffuser", mergeParts([
    place(new THREE.BoxGeometry(0.42, 0.012, 0.045), [0, -0.004, 0.01]),
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
  // Low-reflection mirror, mounted below the Redwood print; frame and glass share one draw call through vertex colours.
  parts.push(paint(place(new THREE.CylinderGeometry(0.205, 0.205, 0.008, 24), [0.32, 0.83, 3.735], [Math.PI / 2, 0, 0]), 0x9ca7a7));
  parts.push(paint(place(new THREE.TorusGeometry(0.218, 0.012, 6, 24), [0.32, 0.83, 3.728]), 0xb88b5b));
  // Three black iron J-hooks and one simple linen coat, mounted in front of the wall and below the existing artwork.
  parts.push(paint(place(new THREE.BoxGeometry(0.31, 0.022, 0.014), [0.73, 1.145, 3.733]), 0x2b2b2b));
  for (const x of [0.62, 0.73, 0.84]) {
    const hookPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x, 1.145, 3.73),
      new THREE.Vector3(x, 1.115, 3.70),
      new THREE.Vector3(x, 1.08, 3.685),
      new THREE.Vector3(x, 1.055, 3.70),
      new THREE.Vector3(x, 1.06, 3.72),
    ]);
    parts.push(paint(new THREE.TubeGeometry(hookPath, 10, 0.0055, 6, false), 0x2b2b2b));
  }
  const coat = new THREE.Shape();
  coat.moveTo(-0.115, 0.04); coat.lineTo(-0.075, 0.15); coat.lineTo(-0.035, 0.19); coat.lineTo(0, 0.16);
  coat.lineTo(0.035, 0.19); coat.lineTo(0.075, 0.15); coat.lineTo(0.115, 0.04); coat.lineTo(0.08, 0.015);
  coat.lineTo(0.065, 0.07); coat.lineTo(0.058, -0.17); coat.lineTo(-0.058, -0.17); coat.lineTo(-0.065, 0.07); coat.lineTo(-0.08, 0.015); coat.closePath();
  parts.push(paint(place(new THREE.ShapeGeometry(coat, 5), [0.73, 0.90, 3.72]), 0xcdbfa7));
  // A shallow floating key shelf with a single low oak dish, tucked below the mirror.
  parts.push(paint(place(new THREE.BoxGeometry(0.38, 0.025, 0.12), [0.32, 0.43, 3.68]), 0xb88b5b));
  parts.push(paint(place(new THREE.CylinderGeometry(0.052, 0.058, 0.012, 14), [0.32, 0.449, 3.68]), 0xc6a77e));
  const geometry = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose());
  if (!geometry) throw new Error("Could not merge Room 03 entry wall details");
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.78, metalness: 0.04, side: THREE.DoubleSide });
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
    mirror: { center: [0.32, 0.83, 3.735], diameterMm: 410, wallGapMm: 1 },
    hooks: { count: 3, railCenter: [0.73, 1.145, 3.733] },
    shelf: { center: [0.32, 0.43, 3.68], dishTopY: 0.455 },
  };
}

export async function start({ stage, onReady = () => {} }) {
  const scene = new THREE.Scene();
  const skyMaterials = { golden: makeSkyTexture(false), night: makeSkyTexture(true), day: makeSkyTexture(false, true) };
  scene.background = skyMaterials.day;
  const DESKTOP_CAMERA = { position: [0.22, 1.64, 1.52], target: [0.05, 1.50, 0.05], fov: 62, maxDistance: 1.72 };
  const PORTRAIT_CAMERA = { position: [0.408432, 1.591908, 1.524290], target: [0, 1.48, 0], fov: 84, maxDistance: 1.72 };
  const compact = window.innerWidth < 500;
  const camera = new THREE.PerspectiveCamera(compact ? 60 : 50, 1, 0.05, 50);
  const initialCamera = compact ? PORTRAIT_CAMERA : DESKTOP_CAMERA;
  camera.position.set(...initialCamera.position);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(1.5);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  // PCF instead of VSM: a 512 px VSM shadow map over an 8 x 8 m room blurred every edge into mush, so cabinets and
  // chairs had no readable shadow. PCF with a larger map keeps a soft edge without washing the contact area away.
  renderer.shadowMap.type = THREE.PCFShadowMap;
  stage.replaceChildren(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false; controls.enablePan = false;
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
  canvas.addEventListener('pointerdown', centerPointerDown);
  canvas.addEventListener('pointermove', centerPointerMove);
  canvas.addEventListener('pointerup', centerPointerEnd);
  canvas.addEventListener('pointercancel', centerPointerEnd);
  canvas.addEventListener('keydown', centerKey);
  const materials = makeMaterials();
  const buckets = new Map();
  let yardLoaded = false;
  let wallArtLoaded = false;
  let wallArtSettled = 0;
  let firstFrameRendered = false;
  buildArchitecture(buckets, materials, scene, () => { yardLoaded = true; render(); });
  {
    const boxes = [
      [[2.1, 2.7, 0.12], [-2.05, 1.35, 2.4]], [[2.1, 2.7, 0.12], [2.05, 1.35, 2.4]], [[2.0, 0.6, 0.12], [0, 2.4, 2.4]],
      [[0.12, 2.7, 1.4], [-1, 1.35, 3.1]], [[0.12, 2.7, 1.4], [1, 1.35, 3.1]],
      [[2.0, 0.12, 1.4], [0, -0.06, 3.1]], [[2.0, 0.12, 1.4], [0, 2.64, 3.1]], [[2.0, 2.7, 0.12], [0, 1.35, 3.8]],
    ];
    const parts = boxes.map(([size, position]) => { const geometry = new THREE.BoxGeometry(...size); geometry.translate(...position); return geometry; });
    const geometry = mergeGeometries(parts, false); parts.forEach((part) => part.dispose()); geometry.computeVertexNormals();
    const hall = new THREE.Mesh(geometry, materials.wall); hall.name = "entry-hall"; hall.userData.category = "entry-architecture"; hall.castShadow = false; hall.receiveShadow = true; scene.add(hall);
  }
  buildKitchen(buckets, materials);
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
      render();
    }, undefined, () => {
      wokTileState.material.map = null;
      wokTileState.material.color.setHex(0xc9c0ae);
      wokTileState.material.roughness = materials.stone.roughness;
      wokTileState.material.needsUpdate = true;
      wokTileState.status = "failed";
      render();
    });
  }
  buildTable(buckets, materials);
  const diningChairSeatGap = buildProceduralDiningChairs(scene, materials);
  buildHouseholdProps(scene, materials);
  const dishDryer = buildDishDryer(scene, materials);
  let credenza = null;
  const loungeChair = buildLoungeChair(scene, materials);
  const loungeOttoman = buildLoungeOttoman(scene, materials, loungeChair);
  const entryNook = buildEntryNook(scene, materials);
  const room03Curtains = buildRoom03WindowCurtains(scene, materials);
  const entryWallDetails = buildRoom03EntryWallDetails(scene);
  const woodGeometries = [];
  const wallArt = buildRoomWallArt(scene, materials, woodGeometries);
  const grasscloth = makeGrasscloth(scene);
  credenza = buildRightWallCredenza(scene, materials);
  const mediaUnit = buildRoom03MediaUnit(scene, materials, woodGeometries);
  const mediaWoodwork = addRoom03Woodwork(scene, materials.oak, woodGeometries);
  const moodSlots = { screen: mediaUnit.screen, tabletopCenterpiece: scene.getObjectByName("mood-slot-tabletop-centerpiece"), tableware: null };
  let tablewareGroup = null, thanksgivingGroup = null, roomDoor = null;
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
    "ceilingColor", "ceilingEmissiveColor", "beamColor", "tableTint",
  ]);
  const sharedLook = {
    sunColor: 0xffd6a1, sunPosition: [-4.2, 1.2, 3.6],
    hemiSky: 0xfff0d4, hemiGround: 0x6f6658, ambientColor: 0xffffff,
    sunlightOpacity: 0, sunlightVisible: false,
    pendantFloorBounce: 0, pendantFloorBounceVisible: false,
    loungePillow: 0x7f946c, screenColor: 0x171918, screenToneMapped: true, screenMap: null,
    floorLamp: 0, tableLamp: 0, screenCool: 0, pictureLightEmissive: 0, counterPendantEmissive: 0,
    yardMap: null,
    ceilingColor: COLORS.ceiling, ceilingEmissiveColor: 0x9b6938, beamColor: COLORS.beam, tableTint: 0xffffff, curtainColor: 0xcdbfa8,
  };
  const MOOD_LOOK = Object.freeze({
    // Bay Area daylight (Paul 2026-10-30: the golden look read as a video game at the door). Neutral-white sun, a cool pale sky, an untinted garden and
    // lighter, less orange wood overhead; golden hour stays as a choice.
    daylight: Object.freeze({
      ...sharedLook,
      sun: 1.25, sunColor: 0xfff3e6, sunPosition: [-3.6, 2.1, 3.4],
      hemi: 1.15, hemiSky: 0xf1f5fb, hemiGround: 0xd8d0c3, ambient: 0.36, pendant: 0.2, under: 0.70, side: 0.70,
      exposure: 0.96, yard: 0xc2c9cb, globe: 0.2, sky: "day",
      floor: 0xc8bda9, jute: 0xcfc2a4, ceilingEmissive: 0.10,
      ceilingColor: 0xcdae80, ceilingEmissiveColor: 0xa8957a, beamColor: 0x9a7a52, tableTint: 0xd4c9ba,
      warmGlow: 0.4, wokGlow: 0.6,
      windowWallBounce: 0.10, windowWallBounceVisible: true,
      pendantCeilingBounce: 0, pendantCeilingBounceVisible: false,
      reveal: 0.6, contactShadow: 0.30, blind: "open", curtainColor: 0xcdbfa8, tableware: false, thanksgivingDecor: false, artLight: [0.92, 0.92, 0.9],
    }),
    golden: Object.freeze({
      ...sharedLook,
      sun: 3.1, hemi: 0.55, ambient: 0.16, pendant: 0.32, under: 0.42, side: 0.48,
      exposure: 1.26, yard: 0xffd7a1, globe: 0.34, sky: "golden",
      floor: 0xcdbb9e, jute: 0xd0b47f, ceilingEmissive: 0.3,
      warmGlow: 0.72, wokGlow: 0.72,
      windowWallBounce: 0.12, windowWallBounceVisible: true,
      pendantCeilingBounce: 0, pendantCeilingBounceVisible: false,
      reveal: 0.72, contactShadow: 0.30, blind: "open", curtainColor: 0xd0bea0, tableware: false, thanksgivingDecor: false, artLight: [0.86, 0.84, 0.82],
    }),
    night: Object.freeze({
      ...sharedLook,
      sun: 0, hemi: 0.55, ambient: 0.26, pendant: 7.0, under: 2.7, side: 2.3,
      exposure: 1.20, yard: 0x5d7593, globe: 1.55, sky: "night",
      floor: 0xc2a77b, jute: 0xd9c99f, ceilingEmissive: 0.55,
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
      exposure: 1.20, yard: 0x4a5a7c, globe: 0.06, sky: "night",
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
      sun: 0.8, sunColor: 0xffb263, sunPosition: [-4.2, 1.15, 3.6],
      hemi: 0.70, hemiSky: 0xffe0bd, hemiGround: 0xc7a578,
      ambient: 0.18,
      pendant: 3.2, under: 1.6, side: 0,
      // Dinner is dusk: the golden-hour yard photo is tinted blue-hour so the window no longer reads as afternoon (Paul 2026-10-28).
      exposure: 1.14, yard: 0x6f7a96, globe: 0.55, sky: "golden",
      floor: 0xcdbb9e, jute: 0xd0b47f, ceilingEmissive: 0.22,
      warmGlow: 0.80, wokGlow: 0.25,
      windowWallBounce: 0.06, windowWallBounceVisible: true,
      pendantCeilingBounce: 0.03, pendantCeilingBounceVisible: true,
      reveal: 0.55, contactShadow: 0.26,
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
  let autumnCourtyardTexture = null;
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
  // The dining table is a downloaded model, so its wood is tinted (multiplied) rather than repainted; the model's own colour is kept to restore it.
  function tintDiningTable(tint) {
    const table = scene.getObjectByName("room03-table-glb");
    if (!table) return;
    const factor = new THREE.Color(tint);
    table.traverse((object) => {
      if (!object.isMesh) return;
      for (const material of (Array.isArray(object.material) ? object.material : [object.material])) {
        if (!material?.color) continue;
        if (!material.userData.baseColor) material.userData.baseColor = material.color.clone();
        material.color.copy(material.userData.baseColor).multiply(factor);
      }
    });
  }
  function setMood(name) {
    const look = MOOD_LOOK[name]; if (!look) return;
    currentMood = name;
    // The lemon bowl is the everyday centrepiece; in the dinner moods the roast chicken takes the middle of the table instead.
    if (moodSlots.tabletopCenterpiece) moodSlots.tabletopCenterpiece.visible = !look.tableware;
    if (thanksgivingGroup) {
      thanksgivingGroup.visible = look.thanksgivingDecor;
      if (look.thanksgivingDecor && thanksgivingGroup.parent !== scene) scene.add(thanksgivingGroup);
      else if (!look.thanksgivingDecor && thanksgivingGroup.parent === scene) scene.remove(thanksgivingGroup);
    }
    if (tablewareGroup) {
      tablewareGroup.visible = look.tableware;
      if (look.tableware && tablewareGroup.parent !== scene) scene.add(tablewareGroup);
      else if (!look.tableware && tablewareGroup.parent === scene) scene.remove(tablewareGroup);
    }
    sun.intensity = look.sun; sun.color.setHex(look.sunColor); sun.position.set(...look.sunPosition);
    hemi.intensity = look.hemi; hemi.color.setHex(look.hemiSky); hemi.groundColor.setHex(look.hemiGround);
    ambient.intensity = look.ambient; ambient.color.setHex(look.ambientColor);
    pendantLight.intensity = look.pendant; underLight.intensity = look.under; sideLight.intensity = look.side;
    if (floorLampLight) { floorLampLight.intensity = look.floorLamp; floorLampLight.visible = look.floorLamp > 0; }
    if (tableLampLight) { tableLampLight.intensity = look.tableLamp; tableLampLight.visible = look.tableLamp > 0; }
    if (screenCoolLight) { screenCoolLight.intensity = look.screenCool; screenCoolLight.visible = look.screenCool > 0; }
    renderer.toneMappingExposure = look.exposure;
    scene.background = skyMaterials[look.sky];
    const yardMaterial = scene.getObjectByName("courtyard-background")?.material;
    if (yardMaterial) {
      yardMaterial.color.setHex(look.yard);
      const autumnReady = look.yardMap === "courtyard-autumn-v1" && autumnCourtyardTexture?.image;
      const chosenYard = yardView !== "auto" ? yardViewTextures[yardView] : null;
      yardMaterial.map = chosenYard?.image ? chosenYard : (autumnReady ? autumnCourtyardTexture : courtyardDefaultMap);
      yardMaterial.needsUpdate = true;
    }
    // The two framed paintings are unlit (accurate colour), so by day and night they looked identical and read as windows (Paul 2026-10-29).
    // Dim and warm them with the mood like the wall around them.
    wallArt.material.color.setRGB(...look.artLight);
    roomDoor?.setMoodLight(look.artLight);
    materials.opal.emissiveIntensity = look.globe;
    room03Curtains.material.color.setHex(look.curtainColor);
    scene.traverse((object) => {
      if (!object.isMesh) return;
      for (const material of (Array.isArray(object.material) ? object.material : [object.material])) {
        if (material?.name === "warm-opal-glass") material.emissiveIntensity = look.globe;
      }
    });
    materials.floor.color.setHex(look.floor);
    materials.ceiling.color.setHex(look.ceilingColor); materials.ceiling.emissive.setHex(look.ceilingEmissiveColor);
    materials.beam.color.setHex(look.beamColor);
    tintDiningTable(look.tableTint);
    materials.jute.color.setHex(look.jute);
    materials.ceiling.emissiveIntensity = look.ceilingEmissive;
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
    if (pictureLightMaterial) pictureLightMaterial.emissiveIntensity = look.pictureLightEmissive;
    // The globe glows in proportion to the light it throws (old: a flat 0.45 whatever the mood, so a strongly lit wall sat beside a dull globe).
    if (floorShadeMaterial) floorShadeMaterial.emissiveIntensity = look.floorLamp > 0
      ? Math.min(2.2, 0.55 + 0.5 * look.floorLamp)
      : 0.2;
    if (tableShadeMaterial) tableShadeMaterial.emissiveIntensity = look.tableLamp > 0 ? Math.min(2.2, 0.55 + 0.5 * look.tableLamp) : 0;
    if (floorHalo) { floorHalo.material.opacity = look.floorLamp > 0 ? Math.min(0.5, 0.15 * look.floorLamp) : 0; floorHalo.visible = look.floorLamp > 0; }
    if (tableHalo) { tableHalo.material.opacity = look.tableLamp > 0 ? Math.min(0.5, 0.15 * look.tableLamp) : 0; tableHalo.visible = look.tableLamp > 0; }
    const screenMaterial = mediaUnit.screen.material;
    const screenTexture = look.screenMap === "screen-movie-city-night-v1" ? movieScreenTexture
      : look.screenMap === "screen-thanksgiving-parade-v1" ? thanksgivingScreenTexture
      : null;
    if (look.screenMap && screenTexture?.image) {
      screenMaterial.map = screenTexture;
      screenMaterial.color.setHex(look.screenColor);
      screenMaterial.toneMapped = look.screenToneMapped;
    } else if (look.screenMap) {
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
      if (!centerView) {
        camera.position.set(...preset.position);
        controls.target.set(...preset.target);
        controls.update();
      }
    }
    camera.aspect = rect.width / rect.height;
    camera.fov = centerView ? (compactCameraActive ? 84 : 86) : (compactCameraActive ? PORTRAIT_CAMERA.fov : DESKTOP_CAMERA.fov);
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
  controls.addEventListener("change", render);
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(stage);
  resize(); controls.update(); setMood("daylight");
  await furniture.ready;
  tintDiningTable(MOOD_LOOK[currentMood].tableTint);
  tablewareGroup = buildTableware(scene);
  thanksgivingGroup = buildThanksgivingDecor(scene);
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
    const categoryBoxFor = (category) => {
      const box = new THREE.Box3(); box.makeEmpty();
      scene.traverse((object) => { if (object.isMesh && object.userData.category === category) box.expandByObject(object); });
      return box.isEmpty() ? null : { min: box.min.toArray(), max: box.max.toArray(), size: box.getSize(new THREE.Vector3()).toArray() };
    };
    const propKeys = ["drip-coffee-maker", "electric-kettle", "rice-cooker", "cutting-board", "oil-and-salt", "oak-utensil-crock", "glass-pantry-jar", "steel-saucepan", "tabletop-meyer-lemon-bowl", "cookbooks", "tv-console-living-set", "window-side-table", "window-meyer-lemon-tree"];
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
    const utensilObject = scene.getObjectByName("prop-oak-utensil-crock");
    const counterSurface = scene.getObjectByName("merged-counter");
    scene.updateMatrixWorld(true);
    const measureCounterPropFit = (key, x, z) => {
      const object = scene.getObjectByName(`prop-${key}`);
      const ray = new THREE.Raycaster(new THREE.Vector3(x, 1.3, z), new THREE.Vector3(0, -1, 0), 0, 1);
      const hit = counterSurface ? ray.intersectObject(counterSurface, false).find(({ face }) => {
        if (!face) return false;
        const normal = face.normal.clone().applyMatrix3(new THREE.Matrix3().getNormalMatrix(counterSurface.matrixWorld)).normalize();
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
    const crockSupportHit = counterSurface ? crockSupportRay.intersectObject(counterSurface, false).find(({ face }) => {
      if (!face) return false;
      const normal = face.normal.clone().applyMatrix3(new THREE.Matrix3().getNormalMatrix(counterSurface.matrixWorld)).normalize();
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
    const jarSupportRay = new THREE.Raycaster(new THREE.Vector3(-0.99, 1.3, -1.73), new THREE.Vector3(0, -1, 0), 0, 1);
    const jarSupportHit = counterSurface ? jarSupportRay.intersectObject(counterSurface, false).find(({ face }) => {
      if (!face) return false;
      const normal = face.normal.clone().applyMatrix3(new THREE.Matrix3().getNormalMatrix(counterSurface.matrixWorld)).normalize();
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
    const cooktopSurface = scene.getObjectByName("merged-appliances");
    const saucepanSupportRay = new THREE.Raycaster(new THREE.Vector3(0.53, 1.3, -2.18), new THREE.Vector3(0, -1, 0), 0, 1);
    const saucepanSupportHit = cooktopSurface ? saucepanSupportRay.intersectObject(cooktopSurface, false).find(({ face }) => {
      if (!face) return false;
      const normal = face.normal.clone().applyMatrix3(new THREE.Matrix3().getNormalMatrix(cooktopSurface.matrixWorld)).normalize();
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
    const tablewareInfo = tablewareGroup ? { vertices: tablewareGroup.userData.vertices, meshes: tablewareGroup.children.filter((child) => child.isMesh).length, settings: tablewareGroup.userData.settings, materials: tablewareGroup.userData.materials, colors: tablewareGroup.userData.colors, extras: tablewareGroup.userData.extras } : null;
    return { room03LivingDetails: { ...room03LivingDetails.furnitureFit, fit: room03LivingDetails.fit, vertices: room03LivingDetails.vertices }, dishDryer: dishDryer.info(), credenza: credenza ? credenza.info() : null, thanksgivingDecor: thanksgivingInfo, moodLook: { fields: MOOD_LOOK_FIELDS, moods: MOOD_LOOK }, tableware: tablewareInfo, screenContent, courtyardMap, renderFrame: renderer.info.render.frame, plaque, lounge, footToBody, diningChairQA, contactShadow: contactShadowInfo, lightMetrics, centerpieceFit, wallpaper: grasscloth.info(), entryNook: entryNook.info(), pendantPaper: (() => { const paper = scene.getObjectByName("pendant-paper-tiers"); const box = new THREE.Box3().setFromObject(scene.getObjectByName("room03-pendant-tiered")); return paper ? { tiers: PENDANT_TIERS.radii.length, radiiMm: PENDANT_TIERS.radii.map((r) => Math.round(r * 1000)), emissive: paper.material.emissiveIntensity, materialName: paper.material.name, vertices: paper.geometry.attributes.position.count, bounds: { min: box.min.toArray(), max: box.max.toArray() } } : null; })(), yardView, ottoman: { ...loungeOttoman.userData.measure(), vertices: loungeOttoman.userData.vertices, meshes: loungeOttoman.children.length }, wallArtChoice: wallArt.choice, wallArtMean: { "cable-car": wallArt.regionMean("cable-car"), "redwood-path": wallArt.regionMean("redwood-path"), "lamp-wall": wallArt.regionMean("lamp-wall") }, lampWallArt: { bounds: boxFor("prop-room03-wall-art-lamp-wall"), imageBounds: wallArt.assets.lampWall.image.userData.bounds, status: wallArt.assets.lampWall.status }, title: ROOM_TITLE, dimensions: ROOM, mood: currentMood, yardLoaded, wallArtLoaded, wallArtAssets, moodSlots: moodSlotInfo, wallArtTextureSize: [wallArt.assets.cableCar.texture?.image?.naturalWidth || wallArt.assets.cableCar.texture?.image?.width || 0, wallArt.assets.cableCar.texture?.image?.naturalHeight || wallArt.assets.cableCar.texture?.image?.height || 0], wallArtColorSpace: wallArt.texture?.colorSpace || null, wallArtMaterial: wallArtImagePlane?.material?.type || null, wallArtLight: wallArtImagePlane ? wallArtImagePlane.material.color.toArray().map((v) => Number(v.toFixed(3))) : null, wallArtReceivesShadow: wallArtImagePlane?.receiveShadow ?? null, wallArtBounds: boxFor("prop-room03-wall-art"), wallArtCorners, wallArtPixels, wokZone, wokTile, wallArtClearanceBounds: { beams: boxFor("merged-structure"), hood: boxFor("merged-hood"), upperCabinets: boxFor("merged-kitchen") }, furniture: { ...furniture.status, urls: furniture.urls, tabletopEdgeHeightDeviation: furniture.tabletopEdgeHeightDeviation }, furnitureAssets, furnitureBounds: { table: boxFor("room03-table-glb"), chairs: chairBounds, pendant: boxFor("room03-pendant-tiered") }, propBounds, propGeometry, utensilCrockFit, pantryJarFit, electricKettleFit, dripCoffeeMakerFit, riceCookerFit, saucepanFit, windowBounds: { slider: boxFor("glass-slider-panel"), ajar: boxFor("glass-slider-panel-ajar") }, plantLeafCount: 0, plantLeafVerticesPerBlade: 0, lamps: lampInfo, curtains: room03Curtains.info(), entryWallDetails: { vertices: entryWallDetails.vertices, bounds: entryWallDetails.bounds(), mirror: entryWallDetails.mirror, hooks: entryWallDetails.hooks, shelf: entryWallDetails.shelf }, softForms, cookbookCount: cookbookGroup?.userData.bookCount || 0, wokSupport: { bounds: wokCabinetBounds, counter: wokCounterBounds, counterBottomY: wokCounterBounds ? wokCounterBounds.min[1] : null, counterTopY: wokCounterBounds ? wokCounterBounds.max[1] : null }, sceneBounds: { kitchen: boxFor("merged-kitchen"), counter: boxFor("merged-counter"), structure: boxFor("merged-structure"), hood: boxFor("merged-hood"), sideKitchen: boxFor("merged-side-kitchen"), wokBase: categoryBoxFor("wok-base-cabinet") }, materialColors: { wall: `#${materials.wall.color.getHexString()}`, cabinet: `#${materials.olive.color.getHexString()}`, hood: `#${materials.hoodSteel.color.getHexString()}`, ceiling: `#${materials.ceiling.color.getHexString()}`, beam: `#${materials.beam.color.getHexString()}`, floor: `#${materials.floor.color.getHexString()}` }, edgeRadii: EDGE_RADIUS_BY_CATEGORY, roundingSegments: ROUNDING_SEGMENTS, vertices, triangles, meshes, drawCallsLastFrame: renderer.info.render.calls, categories, rug: rugBounds, rugSamples: { rug: project([1.22, 0.022, 0.5]), floorBesideRug: project([1.72, 0.002, 0.5]) }, floorSamples: { farFromWindow: project([1.72, 0.002, 0.5]) }, pixelRatio: renderer.getPixelRatio(), canvas: [renderer.domElement.width, renderer.domElement.height], camera: camera.position.toArray(), cameraTarget: controls.target.toArray(), cameraFov: camera.fov, viewport: [stage.clientWidth, stage.clientHeight], wokOpeningWidth: 0, projectedRegions: { dining: project([0, 0.76, 0.5]), kitchen: project([0, 1.2, -2.0]), countertop: project([0, 0.955, -2.03]), cabinetSample: project([-0.52, 1.78, -1.9225]), pendant: project([0, 1.98, 0.15]), wallArt: project([2.908, 1.52, -0.02]), wokDoor: project(scene.getObjectByName("wok-kitchen-sloped-hood")?.position.toArray() || [2.68, 1.72, 1.68]), wokBowl: project(scene.getObjectByName("wok-kitchen-wok")?.position.toArray() || [2.64, 0.98, 1.68]), wokHood: project(scene.getObjectByName("wok-kitchen-sloped-hood")?.position.toArray() || [2.68, 1.72, 1.68]), wokGlow: project(scene.getObjectByName("wok-kitchen-hood-light")?.position.toArray() || [2.62, 1.55, 1.68]), wokBase: project([wokCabinetBounds.min[0] + wokCabinetBounds.size[0] / 2, wokCabinetBounds.min[1] + wokCabinetBounds.size[1] / 2, wokCabinetBounds.min[2] + wokCabinetBounds.size[2] / 2]), doorReveal: project(scene.getObjectByName("wok-kitchen-hood-light")?.position.toArray() || [2.62, 1.55, 1.68]), doorPanel: project([2.9, 1.62, 0.78]), wokOpening: project(scene.getObjectByName("wok-kitchen-wok")?.position.toArray() || [2.64, 0.98, 1.68]), wallBesideWok: project([2.9, 1.62, 0.78]), floorLamp: project(lampInfo["floor-reading-lamp"].center) } };
  };
  const instance = {
    setMood, resize, render, camera, controls, info, moodSlots, plaqueMesh: housePlaque, setCenterView,
    doorScreen, doorOpen: () => roomDoor.set(true, true, render), doorClose: () => roomDoor.set(false, true, render), doorSnap: (open) => roomDoor.set(open, false, render), doorIsOpen: () => roomDoor.isOpen(), doorInfo: () => roomDoor.info(), doorBounds: () => { const b = roomDoor.bounds(); return { min: b.min.toArray(), max: b.max.toArray() }; }, doorLeafBounds: () => { const b = roomDoor.leafBounds(); return { min: b.min.toArray(), max: b.max.toArray() }; },
    robotScreen, robotHop, onRender: (listener) => { renderListeners.push(listener); },
    robotInfo: () => robot.ready ? (() => { const b = new THREE.Box3().setFromObject(robot.pivot); return { ready: true, heightMm: Number(((b.max.y - b.min.y) * 1000).toFixed(1)), floorGapMm: Number((b.min.y * 1000).toFixed(1)), centre: [Number(((b.min.x + b.max.x) / 2).toFixed(3)), Number(((b.min.z + b.max.z) / 2).toFixed(3))], belt: "#e3b23c" }; })() : { ready: false },
    wallpaperOptions: () => [...grasscloth.options],
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
    centerViewInfo: () => centerView ? { station: [...CENTER_STATION], yaw: centerView.yaw, pitch: centerView.pitch } : null,
    setLang: () => {}, samplePixels, sampleNdc,
    setView: (azimuth = 0) => {
      const offset = camera.position.clone().sub(controls.target);
      const spherical = new THREE.Spherical().setFromVector3(offset);
      spherical.theta = azimuth;
      camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
      controls.update(); render();
    },
    dispose: () => {
      canvas.removeEventListener('pointerdown', centerPointerDown);
      canvas.removeEventListener('pointermove', centerPointerMove);
      canvas.removeEventListener('pointerup', centerPointerEnd);
      canvas.removeEventListener('pointercancel', centerPointerEnd);
      canvas.removeEventListener('keydown', centerKey);
      resizeObserver.disconnect(); controls.dispose(); renderer.dispose();
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
    },
  };
  onReady(instance);
  return instance;
}
