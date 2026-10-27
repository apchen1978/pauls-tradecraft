import * as THREE from "../vendor/three.module.min.js";
import { OrbitControls } from "../vendor/OrbitControls.js";
import { mergeGeometries, mergeVertices } from "../vendor/BufferGeometryUtils.js";
import { GLTFLoader } from "../vendor/GLTFLoader.js";
import { LOUNGE_THROW_POSITIONS_B64 } from "./lounge-throw-baked.js";

export const ROOM_TITLE = "Room 03｜Bay Area Kitchen";
const ROOM = Object.freeze({ width: 6, depth: 4.8, height: 2.7 });
// Shared with Room 01 and Room 02: "Christ is the Head of this House", 5:2, about 76 × 30.4 cm.
// The right pier of the entry front wall is the empty stretch beside the doorway. Its box is
// centered at (2.05, 1.35, 2.4) with size (2.1, 2.7, 0.12), so the room-facing face is z = 2.34
// and the pier covers x = 1.00 to 3.10. x = 1.72 keeps the board on that pier (x = 1.34 to 2.10),
// 34 cm clear of the doorway band at x = 1, and clear of the wok door at x ≈ 2.9. #578 measured this
// spot; the board stays here after the fig came out.
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

function makeSkyTexture(night) {
  return makeTexture((ctx, w, h) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    if (night) {
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

function buildArchitecture(b, m, scene, onYardLoad) {
  const hx = ROOM.width / 2, hz = ROOM.depth / 2, h = ROOM.height;
  addBox(b, "shell", m.floor, [ROOM.width, 0.14, ROOM.depth], [0, -0.07, 0]);
  addBox(b, "shell", m.wall, [ROOM.width, h, 0.12], [0, h / 2, -hz]);
  // Shift the side-kitchen opening 0.275 m toward the back for a clearer mobile sightline.
  addBox(b, "shell", m.wall, [0.12, h, 3.625], [hx, h / 2, -0.5875]);
  addBox(b, "shell", m.wall, [0.12, h, 0.325], [hx, h / 2, 2.2375]);
  addBox(b, "shell", m.wall, [0.12, 0.55, 0.85], [hx, 2.42, 1.65]);
  addBox(b, "shell", m.ceiling, [ROOM.width, 0.16, ROOM.depth], [0, 2.69, 0]);

  // Three exposed timber beams run from the glass wall into the kitchen.
  for (const x of [-2.05, 0, 2.05]) addBox(b, "structure", m.beam, [0.16, 0.18, 4.72], [x, 2.57, 0]);
  addBox(b, "trim", m.oak, [ROOM.width, 0.09, 0.08], [0, 0.1, -2.31]);
  addBox(b, "trim", m.oak, [0.08, 0.09, ROOM.depth], [2.91, 0.1, 0]);
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
  for (const x of [-1.55, -0.52, 0.52, 1.55]) {
    addBox(b, "kitchen", m.olive, [0.98, 0.61, 0.035], [x, 1.78, -1.94]);
    addBox(b, "hardware", m.black, [0.25, 0.018, 0.025], [x, 1.53, -1.91]);
  }
  // Sink, faucet and main cooktop.
  addBox(b, "appliances", m.black, [0.68, 0.045, 0.42], [-1.25, 0.963, -2.02]);
  addBox(b, "appliances", m.steel, [0.55, 0.025, 0.3], [-1.25, 0.984, -2.02]);
  addBox(b, "appliances", m.steel, [0.028, 0.35, 0.028], [-1.25, 1.12, -1.88]);
  addBox(b, "appliances", m.steel, [0.19, 0.028, 0.028], [-1.25, 1.28, -1.97]);
  addBox(b, "appliances", m.black, [0.9, 0.035, 0.58], [0.82, 0.98, -2.02]);
  for (const x of [0.53, 1.1]) for (const z of [-2.18, -1.88]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.018, 6, 18), m.steel);
    ring.position.set(x, 1.005, z); ring.rotation.x = Math.PI / 2; ring.name = "hob-burner"; ring.userData.category = "appliances"; ring.castShadow = false; b.get(`shapes:${m.steel.uuid}`) ?? b.set(`shapes:${m.steel.uuid}`, { category: "appliances", material: m.steel, geometries: [], meshes: [] }); b.get(`shapes:${m.steel.uuid}`).meshes.push(ring);
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
  // The panel slides flush along the wall and leaves a 55 cm clear reveal.
  addBox(b, "side-kitchen", m.black, [0.08, 0.055, 0.85], [2.9, 2.05, 1.65]);
  addBox(b, "side-kitchen", m.olive, [0.055, 1.98, 0.75], [2.91, 1.0, 1.15]);
  addBox(b, "side-kitchen", m.black, [0.08, 2.1, 0.045], [2.9, 1.05, 1.225]);
  addBox(b, "side-kitchen", m.black, [0.08, 2.1, 0.045], [2.9, 1.05, 2.075]);
  addBox(b, "side-kitchen", m.black, [0.025, 0.22, 0.025], [2.88, 1.1, 1.15]);
  const wokBackdrop = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.7), m.wokWall);
  wokBackdrop.position.set(3.16, 1.44, 1.65); wokBackdrop.rotation.y = -Math.PI / 2; wokBackdrop.name = "wok-kitchen-warm-backsplash"; wokBackdrop.userData.category = "side-kitchen";
  wokBackdrop.castShadow = false; wokBackdrop.receiveShadow = false; sceneAddToBucket(b, wokBackdrop, "wok-kitchen-backdrop");
  const addSideMesh = (geometry, material, name, position, rotation = [0, 0, 0]) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name; mesh.userData.category = "side-kitchen";
    mesh.position.set(...position); mesh.rotation.set(...rotation);
    mesh.castShadow = true; mesh.receiveShadow = true;
    const key = `shapes:${material.uuid}`;
    b.get(key) ?? b.set(key, { category: "side-kitchen", material, geometries: [], meshes: [] });
    b.get(key).meshes.push(mesh);
    return mesh;
  };
  // Bring the cooking group 35 cm toward the room so its silhouette clears the slider.
  const centerX = 2.65, centerZ = 1.8;
  // A recessed kick, two framed fronts and handles keep the small cabinet readable from the entrance.
  addBox(b, "wok-base-cabinet", m.olive, [0.47, 0.69, 0.43], [2.705, 0.4675, centerZ]);
  addBox(b, "wok-base-cabinet", m.olive, [0.38, 0.10, 0.33], [2.705, 0.07, centerZ - 0.04]);
  for (const dx of [-0.113, 0.113]) {
    addBox(b, "wok-base-cabinet", m.olive, [0.216, 0.60, 0.012], [2.705 + dx, 0.455, centerZ + 0.22]);
    addBox(b, "wok-base-cabinet", m.steel, [0.009, 0.095, 0.016], [2.705 + dx + (dx < 0 ? 0.075 : -0.075), 0.49, centerZ + 0.235]);
  }
  addGeometryToBucket(b, "side-kitchen", m.stone, roundedBoxGeometry([0.36, 0.085, 0.43], 0.025), [centerX, 0.855, centerZ]);
  addBox(b, "side-kitchen", m.black, [0.31, 0.025, 0.38], [centerX, 0.91, centerZ]);
  const burner = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.012, 5, 20), m.wokSteel);
  burner.position.set(centerX, 0.938, centerZ); burner.rotation.x = Math.PI / 2; burner.name = "wok-kitchen-burner-outer"; burner.userData.category = "side-kitchen";
  burner.castShadow = false; burner.receiveShadow = false;
  b.get(`shapes:${m.wokSteel.uuid}`) ?? b.set(`shapes:${m.wokSteel.uuid}`, { category: "side-kitchen", material: m.wokSteel, geometries: [], meshes: [] }); b.get(`shapes:${m.wokSteel.uuid}`).meshes.push(burner);
  const innerBurner = new THREE.Mesh(new THREE.TorusGeometry(0.061, 0.009, 5, 16), m.wokSteel);
  innerBurner.position.set(centerX, 0.941, centerZ); innerBurner.rotation.x = Math.PI / 2; innerBurner.name = "wok-kitchen-burner-inner"; innerBurner.userData.category = "side-kitchen";
  innerBurner.castShadow = false; innerBurner.receiveShadow = false; b.get(`shapes:${m.wokSteel.uuid}`).meshes.push(innerBurner);
  const wokProfile = [
    new THREE.Vector2(0, 0.015), new THREE.Vector2(0.065, 0.005), new THREE.Vector2(0.13, 0.035),
    new THREE.Vector2(0.175, 0.105), new THREE.Vector2(0.182, 0.14), new THREE.Vector2(0.166, 0.142),
    new THREE.Vector2(0.152, 0.108), new THREE.Vector2(0.105, 0.055), new THREE.Vector2(0.04, 0.032), new THREE.Vector2(0, 0.03),
  ];
  addSideMesh(new THREE.LatheGeometry(wokProfile, 24), m.wokIron, "wok-kitchen-wok", [centerX, 0.935, centerZ]);
  const wokRim = new THREE.Mesh(new THREE.TorusGeometry(0.174, 0.011, 6, 24), m.wokSteel);
  wokRim.position.set(centerX, 1.077, centerZ); wokRim.rotation.x = Math.PI / 2; wokRim.name = "wok-kitchen-rim"; wokRim.userData.category = "side-kitchen";
  b.get(`shapes:${m.wokSteel.uuid}`).meshes.push(wokRim);
  const wokHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.016, 0.24, 10), m.oak);
  wokHandle.rotation.z = Math.PI / 2; wokHandle.position.set(2.46, 1.025, centerZ); wokHandle.name = "wok-kitchen-handle"; wokHandle.userData.category = "side-kitchen";
  b.get(`shapes:${m.oak.uuid}`) ?? b.set(`shapes:${m.oak.uuid}`, { category: "side-kitchen", material: m.oak, geometries: [], meshes: [] }); b.get(`shapes:${m.oak.uuid}`).meshes.push(wokHandle);
  // A short shelf is fixed to the rear wall with two restrained silhouettes.
  addBox(b, "side-kitchen", m.oak, [0.15, 0.025, 0.42], [3.08, 1.36, centerZ]);
  addSideMesh(new THREE.CylinderGeometry(0.032, 0.04, 0.13, 10), m.wokIron, "wok-kitchen-oil-bottle", [3.01, 1.435, 1.7]);
  addSideMesh(new THREE.CylinderGeometry(0.007, 0.009, 0.19, 6), m.black, "wok-kitchen-spatula", [3.04, 1.46, 1.9], [0, 0, -0.15]);
  // A sloped trapezoid hood and a warm row of light face the default room camera.
  const hoodShape = new THREE.Shape();
  hoodShape.moveTo(-0.24, -0.11); hoodShape.lineTo(-0.135, 0.095); hoodShape.lineTo(0.135, 0.095); hoodShape.lineTo(0.24, -0.11); hoodShape.closePath();
  const hoodGeometry = new THREE.ExtrudeGeometry(hoodShape, { depth: 0.16, bevelEnabled: true, bevelSegments: 1, bevelThickness: 0.008, bevelSize: 0.006 });
  hoodGeometry.translate(0, 0, -0.08);
  addSideMesh(hoodGeometry, m.wokSteel, "wok-kitchen-sloped-hood", [2.65, 1.65, centerZ], [0, -0.55, 0]);
  addBox(b, "side-kitchen", m.wokSteel, [0.12, 0.28, 0.12], [2.88, 1.88, centerZ], -0.55);
  const hoodLight = new THREE.Mesh(new THREE.PlaneGeometry(0.43, 0.045), m.wokGlow);
  hoodLight.position.set(2.48, 1.535, centerZ); hoodLight.rotation.y = -0.55; hoodLight.name = "wok-kitchen-hood-light"; hoodLight.userData.category = "side-kitchen";
  sceneAddToBucket(b, hoodLight, "wok-kitchen-hood-light");
  const sideLight = new THREE.PointLight(0xffad64, 0, 0.68, 2); sideLight.position.set(2.92, 1.43, centerZ); sideLight.name = "side-kitchen-warm-source"; scene.add(sideLight);
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
    repairedInThisPr: false,
    note: "under 5 mm; left unchanged",
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
  const succulents = scene.getObjectByName("prop-tabletop-succulents");
  const tableBox = table ? new THREE.Box3().setFromObject(table) : null;
  const succulentBox = succulents ? new THREE.Box3().setFromObject(succulents) : null;
  rows.push({
    item: "tabletop succulents",
    support: tableStatus === "glb" ? "dining table GLB top" : "fallback table top",
    gapMm: succulentBox && tableBox ? round((succulentBox.min.y - tableBox.max.y) * 1000) : null,
    repairedInThisPr: false,
    note: "planter bottom against the loaded table top",
  });
  const redPot = scene.getObjectByName("single-terracotta-pot");
  const appliancePoints = [];
  scene.traverse((object) => {
    if (!object.isMesh || object.userData.category !== "appliances" || !object.geometry?.attributes?.position) return;
    object.updateWorldMatrix(true, false);
    const position = object.geometry.attributes.position;
    for (let i = 0; i < position.count; i++) appliancePoints.push(new THREE.Vector3().fromBufferAttribute(position, i).applyMatrix4(object.matrixWorld));
  });
  const potBox = redPot ? new THREE.Box3().setFromObject(redPot) : null;
  const cooktop = potBox ? appliancePoints.filter((point) => Math.hypot(point.x - 0.82, point.z + 2.02) < 0.46 && point.y > 0.9 && point.y <= potBox.min.y + 0.001) : [];
  const cooktopTop = cooktop.length ? Math.max(...cooktop.map((point) => point.y)) : null;
  rows.push({
    item: "terracotta pot",
    support: "main cooktop",
    gapMm: potBox && cooktopTop !== null ? round((potBox.min.y - cooktopTop) * 1000) : null,
    repairedInThisPr: false,
    note: "pot bottom against the cooktop under it",
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
  ], [1.13, 0.87], [-0.015, 0, 0], [0, -Math.PI / 2, 0], { u0: 0, u1: 0.5, v0: 0, v1: 1, flip: false });
  const redwoodPath = makeFrame("redwood-path", [0.86, 1.78, 3.70], [
    [[1.61, 0.03, 0.035], [0, 0.59, 0]], [[1.61, 0.03, 0.035], [0, -0.59, 0]],
    [[0.03, 1.21, 0.035], [-0.79, 0, 0]], [[0.03, 1.21, 0.035], [0.79, 0, 0]],
    [[1.55, 1.1625, 0.012], [0, 0, 0.012]],
  ], [1.55, 1.1625], [0, 0, -0.02], [0, Math.PI, 0], { u0: 0.5, u1: 1, v0: 0.012987, v1: 0.987013, flip: true });
  const assets = { cableCar, redwoodPath };
  const atlasCanvas = document.createElement("canvas");
  atlasCanvas.width = 1600;
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
  return {
    assets,
    imageMesh,
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
      };
      for (const [name, asset] of Object.entries(assets)) {
        loader.load(urls[name], (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          asset.texture = texture;
          const source = texture.image;
          const x = asset.atlasRect.u0 * atlasCanvas.width;
          const width = (asset.atlasRect.u1 - asset.atlasRect.u0) * atlasCanvas.width;
          const y = asset.key === "redwood-path" ? 8 : 0;
          const height = asset.key === "redwood-path" ? 600 : atlasCanvas.height;
          atlasContext.clearRect(x, 0, width, atlasCanvas.height);
          atlasContext.fillStyle = "#d8cbb5";
          atlasContext.fillRect(x, 0, width, atlasCanvas.height);
          atlasContext.save();
          if (asset.atlasRect.flip) {
            atlasContext.translate(x + width, 0);
            atlasContext.scale(-1, 1);
            atlasContext.drawImage(source, 0, y, width, height);
          } else atlasContext.drawImage(source, x, y, width, height);
          atlasContext.restore();
          texture.dispose();
          atlasTexture.needsUpdate = true;
          asset.status = "loaded";
          asset.image.userData.loadStatus = "loaded";
          settled += 1;
          onSettled({ status: asset.status, startedAfterFirstRender, settled, total: 2 });
        }, undefined, () => {
          asset.status = "fallback";
          asset.image.userData.loadStatus = "fallback";
          settled += 1;
          onSettled({ status: asset.status, startedAfterFirstRender, settled, total: 2 });
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

function buildHouseholdProps(scene, m) {
  const counterY = 0.955;
  // A compact American drip brewer: a warm-white housing and visible glass carafe.
  buildPropGroup(scene, "drip-coffee-maker", [-0.34, counterY, -2.03], ({ box, shape }) => {
    box(m.porcelain, [0.28, 0.036, 0.25], [0, 0.018, 0]);
    box(m.porcelain, [0.22, 0.18, 0.15], [0, 0.125, -0.035]);
    box(m.porcelain, [0.26, 0.065, 0.16], [0, 0.245, -0.04]);
    box(m.black, [0.12, 0.018, 0.1], [0, 0.29, -0.04]);
    shape(new THREE.CylinderGeometry(0.071, 0.058, 0.125, 10), m.glass, [0, 0.105, 0.065]);
    shape(new THREE.CylinderGeometry(0.055, 0.052, 0.032, 10), m.coffee, [0, 0.078, 0.065]);
    shape(new THREE.TorusGeometry(0.045, 0.008, 5, 12), m.black, [0.075, 0.115, 0.065]);
    shape(new THREE.SphereGeometry(0.012, 8, 6), m.black, [0.085, 0.205, 0.015]);
  });

  // One ordinary electric kettle beside the sink, scaled like a 25 cm counter appliance.
  const kettle = buildPropGroup(scene, "electric-kettle", [-0.76, counterY, -2.04], ({ shape }) => {
    const profile = [
      new THREE.Vector2(0, 0.012), new THREE.Vector2(0.09, 0.012), new THREE.Vector2(0.12, 0.045),
      new THREE.Vector2(0.125, 0.15), new THREE.Vector2(0.105, 0.205), new THREE.Vector2(0, 0.205),
    ];
    shape(new THREE.LatheGeometry(profile, 18), m.porcelain, [0, 0, 0]);
    shape(new THREE.CylinderGeometry(0.08, 0.08, 0.018, 18), m.black, [0, 0.207, 0]);
    shape(new THREE.SphereGeometry(0.021, 12, 8), m.porcelain, [0, 0.228, 0]);
    shape(new THREE.TorusGeometry(0.068, 0.011, 7, 16), m.black, [-0.112, 0.14, -0.015]);
    shape(new THREE.CylinderGeometry(0.012, 0.032, 0.105, 12), m.porcelain, [0.14, 0.145, -0.012], [0, 0, Math.PI / 2]);
  });
  kettle.scale.x = 0.75;

  // Plain rice cooker: plausible for the household, but prevalence remains an inference.
  buildPropGroup(scene, "rice-cooker", [-1.92, counterY, -2.03], ({ box, shape }) => {
    shape(new THREE.CylinderGeometry(0.11, 0.12, 0.17, 20), m.porcelain, [0, 0.09, 0]);
    shape(new THREE.CylinderGeometry(0.124, 0.124, 0.026, 20), m.steel, [0, 0.188, 0]);
    box(m.porcelain, [0.1, 0.018, 0.05], [0, 0.213, -0.015]);
    box(m.black, [0.046, 0.04, 0.018], [0, 0.105, 0.115]);
    shape(new THREE.SphereGeometry(0.012, 8, 6), m.olive, [0, 0.108, 0.13]);
  });

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
  const planterMaterial = m.porcelain.clone();
  planterMaterial.color.setHex(0xe5e2d9);
  planterMaterial.roughness = 0.9;
  const rosetteLeafMaterial = m.leafGreen.clone();
  rosetteLeafMaterial.color.setHex(0xffffff);
  rosetteLeafMaterial.vertexColors = true;
  rosetteLeafMaterial.name = "room03-rosette-leaves-vertex-color";
  const tintGeometry = (geometry, colorHex) => {
    const color = new THREE.Color(colorHex);
    const colors = new Float32Array(geometry.attributes.position.count * 3);
    for (let vertex = 0; vertex < geometry.attributes.position.count; vertex++) color.toArray(colors, vertex * 3);
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  };
  const succulents = buildPropGroup(scene, "tabletop-succulents", [0, 0.75, 0.76], ({ box, shape }) => {
    box(planterMaterial, [0.56, 0.075, 0.19], [0, 0.039, 0]);
    box(m.soil, [0.52, 0.012, 0.15], [0, 0.082, 0]);
    const leafGeometry = new THREE.SphereGeometry(1, 8, 5);
    [-0.18, 0, 0.18].forEach((centerX, index) => {
      const leafCount = index === 1 ? 9 : 8;
      for (let leaf = 0; leaf < leafCount; leaf++) {
        const angle = 2 * Math.PI * leaf / leafCount + index * 0.22;
        const radius = 0.034 + (leaf % 3) * 0.003;
        shape(tintGeometry(leafGeometry.clone(), (leaf + index) % 2 ? 0x9aa581 : 0x728263), rosetteLeafMaterial,
          [centerX + Math.cos(angle) * radius, 0.137 + (leaf % 2) * 0.003, Math.sin(angle) * radius],
          [0.05 * Math.sin(angle), -angle, -0.32 * Math.cos(angle)], [0.043, 0.012, 0.024]);
      }
      shape(tintGeometry(new THREE.SphereGeometry(0.021, 8, 6), index % 2 ? 0x9aa581 : 0x728263), rosetteLeafMaterial, [centerX, 0.122, 0]);
    });
    leafGeometry.dispose();
  });
  succulents.scale.setScalar(1.3);
  succulents.traverse((object) => { if (object.isMesh) object.castShadow = false; });
  succulents.userData.form = "three-low-rosette-succulents";
  succulents.userData.moodReplaceable = true;
  succulents.removeFromParent();
  centerpieceSlot.add(succulents);
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

function buildRedPot(scene, m) {
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.16, 0.2, 32, 1), m.red);
  body.position.set(0.82, 1.1, -2.02); body.name = "single-terracotta-pot"; body.userData.category = "accent"; body.castShadow = true; body.receiveShadow = true; scene.add(body);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.195, 0.195, 0.035, 32), m.red);
  lid.position.set(0.82, 1.22, -2.02); lid.name = "terracotta-pot-lid"; lid.userData.category = "accent"; scene.add(lid);
  for (const dx of [-0.22, 0.22]) {
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.014, 6, 12), m.red);
    handle.position.set(0.82 + dx, 1.12, -2.02); handle.rotation.y = Math.PI / 2; handle.name = "terracotta-pot-handle"; handle.userData.category = "accent"; scene.add(handle);
  }
}

function buildPendant(scene, m) {
  const ceilingCap = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.025, 32), m.black);
  ceilingCap.position.set(0, 2.46, 0.15); ceilingCap.name = "pendant-canopy"; ceilingCap.userData.category = "lighting"; scene.add(ceilingCap);
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.42, 10), m.black);
  cord.position.set(0, 2.23, 0.15); cord.name = "pendant-cord"; cord.userData.category = "lighting"; scene.add(cord);
  const globe = new THREE.Mesh(new THREE.SphereGeometry(0.16, 48, 32), m.opal);
  globe.position.set(0, 1.98, 0.15); globe.name = "single-opal-globe"; globe.userData.category = "lighting"; globe.castShadow = true; scene.add(globe);
  const bulb = new THREE.PointLight(0xffd39a, 0, 7, 2); bulb.position.set(0, 1.98, 0.15); bulb.name = "pendant-light-source"; bulb.castShadow = false; scene.add(bulb);
  return bulb;
}

function loadFurniture(scene, materials) {
  const loader = new GLTFLoader();
  const urls = {
    table: new URL("./models/dining-table-v2.glb", import.meta.url).href,
    pendant: new URL("./models/opal-globe-pendant-v2.glb", import.meta.url).href,
  };
  const status = { table: "fallback", chair: "procedural-v2", pendant: "fallback" };
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
        object.castShadow = kind !== "pendant"; // the pendant's own glass must not shadow the light inside it
        object.receiveShadow = true;
        object.userData.category = kind === "table" ? "dining-table" : "lighting";
        object.userData.furnitureAsset = kind;
        if (kind === "pendant") {
          object.name = object.name || "room03-opal-pendant-part";
          const materialList = Array.isArray(object.material) ? object.material : [object.material];
          for (const material of materialList) {
            if (material?.name === "warm-opal-glass") {
              material.emissiveIntensity = materials.opal.emissiveIntensity;
              material.needsUpdate = true;
            }
          }
        }
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
      } else {
        for (const name of ["pendant-canopy", "pendant-cord", "single-opal-globe"]) {
          const fallback = scene.getObjectByName(name);
          if (fallback) { scene.remove(fallback); fallback.geometry.dispose(); }
        }
        model.position.set(0, 1.8075, 0.15);
      }
      model.name = `room03-${kind}-glb`;
      scene.add(model);
      status[kind] = "glb";
    } catch (error) {
      status[kind] = "fallback";
      console.warn(`Room 03 ${kind} GLB failed; keeping procedural fallback.`, error);
    }
  };
  return { status, ready: Promise.all([loadOne("table"), loadOne("pendant")]), urls, get tabletopEdgeHeightDeviation() { return tabletopEdgeHeightDeviation; } };
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
  // Four fixtures, two meshes each. Coordinates come from the measured console, redwood frame and hood,
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

  const floor = new THREE.Group();
  floor.name = "floor-reading-lamp";
  floor.position.set(-1.93, 0, 1.68);
  const floorShade = shadeMaterial(0xffc27a);
  addMesh(floor, "floor-reading-lamp-hardware", mergeParts([
    paint(place(new THREE.CylinderGeometry(0.16, 0.18, 0.02, 16), [0, 0.01, 0]), 0x2a2622),
    paint(place(new THREE.CylinderGeometry(0.012, 0.014, 1.30, 8), [0, 0.67, 0]), 0x2a2622),
  ]), hardwareMaterial());
  addMesh(floor, "floor-reading-lamp-shade", mergeParts([
    place(new THREE.SphereGeometry(0.08, 14, 10), [0, 1.42, 0]),
  ]), floorShade);
  scene.add(floor);
  const floorLight = new THREE.PointLight(0xffc27a, 0, 6, 2);
  floorLight.name = "floor-lamp-light";
  floorLight.castShadow = false;
  floorLight.position.set(-1.93, 1.42, 1.68);
  scene.add(floorLight);

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

  // Clear of the hood (x 0.13–1.51, front z ≈ -1.735) and in front of the upper cabinets (front z ≈ -1.92).
  const pendants = new THREE.Group();
  pendants.name = "counter-mini-pendants";
  const pendantShade = shadeMaterial(0xffe6c4);
  const pendantCenters = [[-0.70, 1.88, -1.78], [1.78, 1.88, -1.78]];
  const wires = [];
  const globes = [];
  for (const [x, y, z] of pendantCenters) {
    const wireLength = 2.61 - (y + 0.10);
    wires.push(paint(place(new THREE.CylinderGeometry(0.004, 0.004, wireLength, 6), [x, y + 0.10 + wireLength / 2, z]), 0x2a2622));
    wires.push(paint(place(new THREE.CylinderGeometry(0.03, 0.03, 0.015, 10), [x, 2.602, z]), 0x8a5a32));
    globes.push(place(new THREE.SphereGeometry(0.10, 14, 10), [x, y, z]));
  }
  addMesh(pendants, "counter-mini-pendants-hardware", mergeParts(wires), hardwareMaterial());
  addMesh(pendants, "counter-mini-pendants-shades", mergeParts(globes), pendantShade);
  pendants.userData.pendantCenters = pendantCenters.map((center) => [...center]);
  scene.add(pendants);

  const screenCoolLight = new THREE.PointLight(0xcdd6f0, 0, 5, 2);
  screenCoolLight.name = "screen-cool-light";
  screenCoolLight.castShadow = false;
  screenCoolLight.position.set(-0.65, 1.06, 3.40);
  scene.add(screenCoolLight);

  return { floorLight, tableLight, screenCoolLight, pictureShade, pendantShade, floorShade, tableShade };
}

export async function start({ stage, onReady = () => {} }) {
  const scene = new THREE.Scene();
  const skyMaterials = { golden: makeSkyTexture(false), night: makeSkyTexture(true) };
  scene.background = skyMaterials.golden;
  const DESKTOP_CAMERA = { position: [0, 1.56, 1.58], target: [0, 1.48, 0], fov: 62, maxDistance: 1.72 };
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
  buildTable(buckets, materials);
  const diningChairSeatGap = buildProceduralDiningChairs(scene, materials);
  buildHouseholdProps(scene, materials);
  const loungeChair = buildLoungeChair(scene, materials);
  const woodGeometries = [];
  const wallArt = buildRoomWallArt(scene, materials, woodGeometries);
  const mediaUnit = buildRoom03MediaUnit(scene, materials, woodGeometries);
  const mediaWoodwork = addRoom03Woodwork(scene, materials.oak, woodGeometries);
  const moodSlots = { screen: mediaUnit.screen, tabletopCenterpiece: scene.getObjectByName("mood-slot-tabletop-centerpiece") };
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
  addContactStrip("merged-side-kitchen", "-x", 0.30, 3.4);
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
  const MOOD_LOOK_FIELDS = Object.freeze([
    "sun", "sunColor", "sunPosition", "hemi", "hemiSky", "hemiGround", "ambient", "ambientColor",
    "pendant", "under", "side", "exposure", "yard", "globe", "sky", "floor", "jute", "ceilingEmissive",
    "warmGlow", "wokGlow", "sunlightOpacity", "sunlightVisible", "windowWallBounce", "windowWallBounceVisible",
    "pendantFloorBounce", "pendantFloorBounceVisible", "pendantCeilingBounce", "pendantCeilingBounceVisible",
    "reveal", "contactShadow", "loungePillow", "screenColor", "screenToneMapped", "screenMap",
    "floorLamp", "tableLamp", "screenCool", "pictureLightEmissive", "counterPendantEmissive", "blind",
  ]);
  const sharedLook = {
    sunColor: 0xffd6a1, sunPosition: [-4.2, 1.2, 3.6],
    hemiSky: 0xfff0d4, hemiGround: 0x6f6658, ambientColor: 0xffffff,
    sunlightOpacity: 0, sunlightVisible: false,
    pendantFloorBounce: 0, pendantFloorBounceVisible: false,
    loungePillow: 0x7f946c, screenColor: 0x171918, screenToneMapped: true, screenMap: null,
    floorLamp: 0, tableLamp: 0, screenCool: 0, pictureLightEmissive: 0, counterPendantEmissive: 0,
  };
  const MOOD_LOOK = Object.freeze({
    golden: Object.freeze({
      ...sharedLook,
      sun: 3.1, hemi: 0.55, ambient: 0.16, pendant: 0.32, under: 0.42, side: 0.48,
      exposure: 1.26, yard: 0xffd7a1, globe: 0.34, sky: "golden",
      floor: 0xcdbb9e, jute: 0xd0b47f, ceilingEmissive: 0.3,
      warmGlow: 0.72, wokGlow: 0.72,
      windowWallBounce: 0.12, windowWallBounceVisible: true,
      pendantCeilingBounce: 0, pendantCeilingBounceVisible: false,
      reveal: 0.72, contactShadow: 0.30, blind: "open",
    }),
    night: Object.freeze({
      ...sharedLook,
      sun: 0, hemi: 0.55, ambient: 0.26, pendant: 7.0, under: 2.7, side: 2.3,
      exposure: 1.20, yard: 0x5d7593, globe: 1.55, sky: "night",
      floor: 0xc2a77b, jute: 0xd9c99f, ceilingEmissive: 0.55,
      warmGlow: 1, wokGlow: 1,
      windowWallBounce: 0, windowWallBounceVisible: false,
      pendantCeilingBounce: 0.05, pendantCeilingBounceVisible: true,
      reveal: 1, contactShadow: 0.12, blind: "closed",
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
      blind: "closed",
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
      exposure: 1.14, yard: 0xffc79a, globe: 0.55, sky: "golden",
      floor: 0xcdbb9e, ceilingEmissive: 0.22,
      warmGlow: 0.80, wokGlow: 0.25,
      windowWallBounce: 0.06, windowWallBounceVisible: true,
      pendantCeilingBounce: 0.03, pendantCeilingBounceVisible: true,
      reveal: 0.55, contactShadow: 0.26,
      floorLamp: 1.6, tableLamp: 2.4, screenCool: 0,
      pictureLightEmissive: 0.6, counterPendantEmissive: 1.0,
      blind: "half",
    }),
    sunday: Object.freeze({
      ...sharedLook,
      sun: 2.2, sunColor: 0xffd9b8, sunPosition: [-4.2, 1.05, 3.6],
      hemi: 0.80, hemiSky: 0xeef2f8, hemiGround: 0xcfc6b6,
      ambient: 0.20,
      pendant: 0, under: 0.3, side: 0.4,
      exposure: 1.22, yard: 0xbfd3d8, globe: 0.15, sky: "golden",
      floor: 0xc9bb9f, ceilingEmissive: 0.12,
      warmGlow: 0.35, wokGlow: 0.40,
      windowWallBounce: 0.10, windowWallBounceVisible: true,
      pendantCeilingBounce: 0, pendantCeilingBounceVisible: false,
      reveal: 0.35, contactShadow: 0.24,
      floorLamp: 0.8, tableLamp: 0.6, screenCool: 0,
      pictureLightEmissive: 0.2, counterPendantEmissive: 0.25,
      blind: "half",
    }),
  });
  let floorLampLight = null, tableLampLight = null, screenCoolLight = null;
  let pictureLightMaterial = null, counterPendantMaterial = null;
  let floorShadeMaterial = null, tableShadeMaterial = null;
  {
    const lamps = addRoom03Lamps(scene, materials);
    floorLampLight = lamps.floorLight;
    tableLampLight = lamps.tableLight;
    screenCoolLight = lamps.screenCoolLight;
    pictureLightMaterial = lamps.pictureShade;
    counterPendantMaterial = lamps.pendantShade;
    floorShadeMaterial = lamps.floorShade;
    tableShadeMaterial = lamps.tableShade;
  }
  let currentMood = "golden";
  let movieScreenTexture = null;
  new THREE.TextureLoader().load(new URL("./art/screen-movie-city-night-v1.webp", import.meta.url).href, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.name = "screen-movie-city-night-v1";
    movieScreenTexture = texture;
    if (currentMood === "movie") {
      const screenMaterial = mediaUnit.screen.material;
      screenMaterial.map = texture;
      screenMaterial.color.setHex(0xffffff);
      screenMaterial.toneMapped = false;
      screenMaterial.needsUpdate = true;
      render();
    }
  });
  function setMood(name) {
    const look = MOOD_LOOK[name]; if (!look) return;
    currentMood = name;
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
    if (yardMaterial) { yardMaterial.color.setHex(look.yard); yardMaterial.needsUpdate = true; }
    materials.opal.emissiveIntensity = look.globe;
    scene.traverse((object) => {
      if (!object.isMesh) return;
      for (const material of (Array.isArray(object.material) ? object.material : [object.material])) {
        if (material?.name === "warm-opal-glass") material.emissiveIntensity = look.globe;
      }
    });
    materials.floor.color.setHex(look.floor);
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
    if (counterPendantMaterial) counterPendantMaterial.emissiveIntensity = look.counterPendantEmissive;
    if (floorShadeMaterial) floorShadeMaterial.emissiveIntensity = look.floorLamp > 0 ? 0.45 : 0;
    if (tableShadeMaterial) tableShadeMaterial.emissiveIntensity = look.tableLamp > 0 ? 0.45 : 0;
    const screenMaterial = mediaUnit.screen.material;
    const movieReady = look.screenMap === "screen-movie-city-night-v1" && movieScreenTexture?.image;
    if (movieReady) {
      screenMaterial.map = movieScreenTexture;
      screenMaterial.color.setHex(look.screenColor);
      screenMaterial.toneMapped = look.screenToneMapped;
    } else {
      // Missing city art stays the dark powered-off screen. No white or black stand-in.
      screenMaterial.map = null;
      screenMaterial.color.setHex(look.screenMap ? 0x171918 : look.screenColor);
      screenMaterial.toneMapped = look.screenMap ? true : look.screenToneMapped;
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
      camera.position.set(...preset.position);
      controls.target.set(...preset.target);
      controls.maxDistance = preset.maxDistance;
      controls.update();
    }
    camera.aspect = rect.width / rect.height;
    camera.fov = compactCameraActive ? PORTRAIT_CAMERA.fov : DESKTOP_CAMERA.fov;
    camera.updateProjectionMatrix();
    // P0b: the pendant shadow follows the same compact flag the camera uses, so a phone never pays for the point-light pass.
    pendantLight.castShadow = !compactCameraActive;
    renderer.setSize(rect.width, rect.height, false);
    render();
  }
  function render() {
    renderer.render(scene, camera);
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
  resize(); controls.update(); setMood("golden");
  await furniture.ready;
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
    const propKeys = ["drip-coffee-maker", "electric-kettle", "rice-cooker", "cutting-board", "oil-and-salt", "tabletop-succulents", "cookbooks"];
    const propBounds = Object.fromEntries(propKeys.map((key) => {
      const object = scene.getObjectByName(`prop-${key}`);
      if (!object) return [key, null];
      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      return [key, { min: box.min.toArray(), max: box.max.toArray(), size: box.getSize(new THREE.Vector3()).toArray(), projectedCenter: project(center.toArray()) }];
    }));
    const propGeometry = Object.fromEntries(propKeys.map((key) => {
      const object = scene.getObjectByName(`prop-${key}`);
      let propVertices = 0, propMeshes = 0;
      object?.traverse((child) => {
        if (!child.isMesh || !child.geometry?.attributes?.position) return;
        propVertices += child.geometry.attributes.position.count;
        propMeshes++;
      });
      return [key, { vertices: propVertices, meshes: propMeshes }];
    }));
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
    const contactShadowInfo = {
      name: contactShadow.name, meshes: 1, materialType: contactShadow.material.type,
      vertices: contactShadow.geometry.attributes.position.count,
      patchCount: contactShadow.userData.patchCount, totalPatchCount: contactShadow.userData.totalPatchCount,
      opacity: contactShadow.material.opacity, bounds: boxFor(contactShadow.name),
      depthWrite: contactShadow.material.depthWrite, polygonOffsetFactor: contactShadow.material.polygonOffsetFactor,
      renderOrder: contactShadow.renderOrder,
      coverage: ["dining-table", "dining-chair-0.5-1.22", "dining-chair-0.5--0.22", "dining-chair--0.5-1.22", "dining-chair--0.5--0.22", "kitchen-island", "side-kitchen", "lounge-chair"],
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
    const wallArtCorners = [[2.908, 1.05, -0.62], [2.908, 1.99, -0.62], [2.908, 1.05, 0.58], [2.908, 1.99, 0.58]].map(project);
    const wallArtNdc = wallArtCorners.map(([x, y]) => [x, y]);
    const wallArtPixels = {
      width: (Math.max(...wallArtNdc.map(([x]) => x)) - Math.min(...wallArtNdc.map(([x]) => x))) * stage.clientWidth / 2,
      height: (Math.max(...wallArtNdc.map(([, y]) => y)) - Math.min(...wallArtNdc.map(([, y]) => y))) * stage.clientHeight / 2,
      center: [(Math.min(...wallArtNdc.map(([x]) => x)) + Math.max(...wallArtNdc.map(([x]) => x))) / 2, (Math.min(...wallArtNdc.map(([, y]) => y)) + Math.max(...wallArtNdc.map(([, y]) => y))) / 2],
    };
    const wallArtDoorFrameBounds = { min: [2.86, 0, 1.2025], max: [2.94, 2.1, 2.0975], size: [0.08, 2.1, 0.895] };
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
    // The wok door's nearer jamb. Built at (2.9, 1.05, 2.075), size (0.08, 2.1, 0.045).
    const wokDoorBounds = { min: [2.86, 0, 1.2025], max: [2.94, 2.1, 2.0975] };
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
        pendant: boxFor("room03-pendant-glb") ? boxGap(plaqueBounds, boxFor("room03-pendant-glb")) : null,
        wokDoor: boxGap(plaqueBounds, wokDoorBounds),
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
    const footToBody = measureRoomFootToBody(scene, furniture.status.table, diningChairSeatGap(), loungeFit);
    const screenMaterialNow = mediaUnit.screen.material;
    const screenContent = {
      map: Boolean(screenMaterialNow.map),
      color: screenMaterialNow.color.getHex(),
      toneMapped: screenMaterialNow.toneMapped,
      ready: Boolean(movieScreenTexture?.image),
      asset: movieScreenTexture?.name || null,
    };
    return { moodLook: { fields: MOOD_LOOK_FIELDS, moods: MOOD_LOOK }, screenContent, renderFrame: renderer.info.render.frame, plaque, lounge, footToBody, diningChairQA, contactShadow: contactShadowInfo, lightMetrics, title: ROOM_TITLE, dimensions: ROOM, mood: currentMood, yardLoaded, wallArtLoaded, wallArtAssets, moodSlots: moodSlotInfo, wallArtTextureSize: [wallArt.assets.cableCar.texture?.image?.naturalWidth || wallArt.assets.cableCar.texture?.image?.width || 0, wallArt.assets.cableCar.texture?.image?.naturalHeight || wallArt.assets.cableCar.texture?.image?.height || 0], wallArtColorSpace: wallArt.texture?.colorSpace || null, wallArtMaterial: wallArtImagePlane?.material?.type || null, wallArtReceivesShadow: wallArtImagePlane?.receiveShadow ?? null, wallArtBounds: boxFor("prop-room03-wall-art"), wallArtCorners, wallArtPixels, wallArtDoorFrameBounds, wallArtClearanceBounds: { beams: boxFor("merged-structure"), hood: boxFor("merged-hood"), upperCabinets: boxFor("merged-kitchen") }, furniture: { ...furniture.status, urls: furniture.urls, tabletopEdgeHeightDeviation: furniture.tabletopEdgeHeightDeviation }, furnitureAssets, furnitureBounds: { table: boxFor("room03-table-glb"), chairs: chairBounds, pendant: boxFor("room03-pendant-glb") }, propBounds, propGeometry, windowBounds: { slider: boxFor("glass-slider-panel"), ajar: boxFor("glass-slider-panel-ajar") }, plantLeafCount: 0, plantLeafVerticesPerBlade: 0, lamps: lampInfo, softForms, cookbookCount: cookbookGroup?.userData.bookCount || 0, wokSupport: { bounds: categoryBoxFor("wok-base-cabinet"), counterBottomY: 0.8125, counterTopY: 0.8975 }, sceneBounds: { kitchen: boxFor("merged-kitchen"), counter: boxFor("merged-counter"), structure: boxFor("merged-structure"), hood: boxFor("merged-hood"), sideKitchen: boxFor("merged-side-kitchen"), wokBase: categoryBoxFor("wok-base-cabinet") }, materialColors: { wall: `#${materials.wall.color.getHexString()}`, cabinet: `#${materials.olive.color.getHexString()}`, hood: `#${materials.hoodSteel.color.getHexString()}` }, edgeRadii: EDGE_RADIUS_BY_CATEGORY, roundingSegments: ROUNDING_SEGMENTS, vertices, triangles, meshes, drawCallsLastFrame: renderer.info.render.calls, categories, rug: rugBounds, rugSamples: { rug: project([1.22, 0.022, 0.5]), floorBesideRug: project([1.72, 0.002, 0.5]) }, floorSamples: { farFromWindow: project([1.72, 0.002, 0.5]) }, pixelRatio: renderer.getPixelRatio(), canvas: [renderer.domElement.width, renderer.domElement.height], camera: camera.position.toArray(), cameraTarget: controls.target.toArray(), cameraFov: camera.fov, viewport: [stage.clientWidth, stage.clientHeight], wokOpeningWidth: 0.55, projectedRegions: { dining: project([0, 0.76, 0.5]), kitchen: project([0, 1.2, -2.0]), countertop: project([0, 0.955, -2.03]), cabinetSample: project([-1.55, 1.78, -1.9225]), pendant: project([0, 1.98, 0.15]), wallArt: project([2.908, 1.52, -0.02]), wokDoor: project([3.08, 1.44, 1.8]), wokBowl: project([2.65, 1.02, 1.8]), wokHood: project([2.65, 1.68, 1.8]), wokGlow: project([2.48, 1.535, 1.8]), wokBase: project([2.705, 0.41625, 1.8]), doorReveal: project([2.48, 1.535, 1.8]), doorPanel: project([2.91, 1.05, 1.15]), wokOpening: project([2.7, 1.32, 1.8]), wallBesideWok: project([2.92, 1.4, 2.2]), floorLamp: project(lampInfo["floor-reading-lamp"].center) } };
  };
  const instance = {
    setMood, resize, render, camera, controls, info, moodSlots, plaqueMesh: housePlaque,
    setLang: () => {}, samplePixels, sampleNdc,
    setView: (azimuth = 0) => {
      const offset = camera.position.clone().sub(controls.target);
      const spherical = new THREE.Spherical().setFromVector3(offset);
      spherical.theta = azimuth;
      camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
      controls.update(); render();
    },
    dispose: () => {
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
    },
  };
  onReady(instance);
  return instance;
}
