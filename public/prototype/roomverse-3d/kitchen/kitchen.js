import * as THREE from "../vendor/three.module.min.js";
import { OrbitControls } from "../vendor/OrbitControls.js";
import { mergeGeometries, mergeVertices } from "../vendor/BufferGeometryUtils.js";
import { GLTFLoader } from "../vendor/GLTFLoader.js";

export const ROOM_TITLE = "Room 03｜Bay Area Kitchen";
const ROOM = Object.freeze({ width: 6, depth: 4.8, height: 2.7 });
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

function makeFloorTexture(seed, strength = 0.12) {
  const texture = makeMottleTexture(seed, strength);
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
      gradient.addColorStop(0, "#454d57");
      gradient.addColorStop(0.52, "#58616a");
      gradient.addColorStop(1, "#746c61");
    } else {
      gradient.addColorStop(0, "#d4c2a7");
      gradient.addColorStop(0.62, "#e5d2b1");
      gradient.addColorStop(1, "#c1a887");
    }
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);
  }, 8, 256);
}

function makeRugTexture() {
  return makeTexture((ctx, w, h) => {
    ctx.fillStyle = "#e7dcc2"; ctx.fillRect(0, 0, w, h);
    // Coarse, softly irregular jute strands; no regular checkerboard grid.
    let state = 37;
    const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
    for (let i = 0; i < 38; i++) {
      const y = 7 + random() * (h - 14);
      ctx.strokeStyle = random() > 0.48 ? "rgba(117,89,51,.15)" : "rgba(255,255,255,.23)";
      ctx.lineWidth = 0.7 + random() * 1.25;
      const start = random() * 16, end = w - random() * 16;
      ctx.beginPath(); ctx.moveTo(start, y);
      ctx.bezierCurveTo(w * 0.28, y + (random() - 0.5) * 5, w * 0.68, y + (random() - 0.5) * 5, end, y + (random() - 0.5) * 4);
      ctx.stroke();
    }
    for (let i = 0; i < 20; i++) {
      const x = 7 + random() * (w - 14), start = random() * 24, end = h - random() * 24;
      ctx.strokeStyle = random() > 0.5 ? "rgba(133,101,59,.085)" : "rgba(255,255,255,.16)";
      ctx.lineWidth = 0.65 + random() * 0.9;
      ctx.beginPath(); ctx.moveTo(x, start);
      ctx.bezierCurveTo(x + (random() - 0.5) * 5, h * 0.35, x + (random() - 0.5) * 5, h * 0.7, x + (random() - 0.5) * 5, end);
      ctx.stroke();
    }
    for (let i = 0; i < 100; i++) {
      const x = random() * w, y = random() * h, length = 2 + random() * 7;
      ctx.strokeStyle = random() > 0.5 ? "rgba(121,91,54,.12)" : "rgba(255,255,255,.2)";
      ctx.lineWidth = 0.5 + random() * 0.65;
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.lineTo(x + (random() - 0.5) * length, y + (random() - 0.5) * length); ctx.stroke();
    }
    // A pale woven binding, about 2 cm at this texture scale.
    ctx.strokeStyle = "rgba(255,250,232,.96)"; ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, w - 2, h - 2);
    ctx.strokeStyle = "rgba(247,238,213,.85)"; ctx.lineWidth = 1;
    ctx.strokeRect(4, 4, w - 8, h - 8);
  });
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
  return {
    floor: std(0xcdbb9e, 0.42, { map: makeFloorTexture(31, 0.15), metalness: 0.025 }),
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
    loungePillow: std(0x9ba88a, 0.98, { map: boucle, side: THREE.DoubleSide }),
    loungeThrow: std(0xc8af87, 0.99, { map: boucle, side: THREE.DoubleSide }),
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
  addBox(b, "kitchen", m.olive, [4.24, 0.78, 0.62], [0, 0.47, -2.04]);
  for (const x of [-1.55, -0.52, 0.52, 1.55]) {
    addBox(b, "kitchen", m.olive, [0.96, 0.72, 0.035], [x, 0.47, -1.715]);
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
    [0.50, -0.19, 0.225, 0.073], [0.60, -0.22, 0.225, 0.075],
    [0.70, -0.24, 0.22, 0.072], [0.79, -0.255, 0.205, 0.060],
    [0.835, -0.265, 0.12, 0.028],
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

function buildProceduralDiningChairs(scene, m) {
  const shell = makeDiningShellGeometry();
  const legParts = [];
  for (const x of [-0.17, 0.17]) for (const z of [-0.16, 0.16]) {
    const leg = new THREE.CylinderGeometry(0.029, 0.018, 0.365, 8);
    leg.translate(x, 0.2025, z);
    legParts.push(leg);
  }
  const legs = mergeGeometries(legParts, false);
  legParts.forEach((part) => part.dispose());
  const upholstery = m.loungeFabric.clone(); upholstery.name = "warm-oat-linen";
  for (const x of [-0.5, 0.5]) for (const z of [-0.22, 1.22]) {
    const chair = new THREE.Group();
    chair.name = `room03-dining-chair-${x}-${z}`;
    chair.position.set(x, 0, z);
    chair.rotation.y = z > 0.5 ? Math.PI : 0;
    chair.userData.category = "dining-chairs";
    for (const [name, geometry, material] of [["upholstered-shell", shell, upholstery], ["tapered-oak-legs", legs, m.oak]]) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = name; mesh.castShadow = true; mesh.receiveShadow = true;
      mesh.userData.category = "dining-chairs"; mesh.userData.furnitureAsset = "chair";
      chair.add(mesh);
    }
    scene.add(chair);
  }
}

// Local, four-material procedural furniture: no external model or cloth simulation.
const LOUNGE_PLACEMENT = Object.freeze({ position: [-2.29, 0, -0.20], yaw: THREE.MathUtils.degToRad(8) });

function makeLoungePillowGeometry() {
  const nx = 12, ny = 12, row = nx + 1;
  const positions = [], uvs = [], indices = [];
  for (const side of [1, -1]) {
    for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
      const u = i / nx * 2 - 1, v = j / ny * 2 - 1;
      const inflation = Math.pow(Math.max(0, 1 - u * u), 0.6) * Math.pow(Math.max(0, 1 - v * v), 0.6);
      const dent = side > 0 ? 0.014 * Math.exp(-7 * (u * u + v * v)) : 0;
      const crease = side > 0 ? 0.006 * Math.sin(4 * u + 3 * v) * Math.max(0, Math.abs(u * v) - 0.15) : 0;
      positions.push(u * 0.20 * Math.sqrt(1 - 0.5 * v * v), v * 0.20 * Math.sqrt(1 - 0.5 * u * u), side * (0.011 + 0.069 * inflation) - dent + crease);
      uvs.push(i / nx, j / ny);
    }
  }
  const faceCount = row * row;
  for (let side = 0; side < 2; side++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const a = side * faceCount + j * row + i, b = a + 1, c = a + row, d = c + 1;
    if (side === 0) indices.push(a, b, d, a, d, c);
    else indices.push(a, d, b, a, c, d);
  }
  const rim = [];
  for (let i = 0; i <= nx; i++) rim.push(i);
  for (let j = 1; j <= ny; j++) rim.push(j * row + nx);
  for (let i = nx - 1; i >= 0; i--) rim.push(ny * row + i);
  for (let j = ny - 1; j > 0; j--) rim.push(j * row);
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
  const nx = 16, nz = 22, row = nx + 1;
  const positions = [], uvs = [], indices = [];
  const crossSection = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.205, 0.515, 0), new THREE.Vector3(0.23, 0.642, 0),
    new THREE.Vector3(0.29, 0.695, 0), new THREE.Vector3(0.345, 0.656, 0),
    new THREE.Vector3(0.377, 0.57, 0), new THREE.Vector3(0.392, 0.408, 0),
  ]);
  for (const side of [1, -1]) for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
    const u = i / nx, t = j / nz;
    const point = crossSection.getPoint(u);
    const fold = Math.sin(t * Math.PI * 3.6 + u * 0.5) + 0.22 * Math.sin(t * Math.PI * 7.1 - u * 0.7);
    const drape = 0.28 + 0.72 * u;
    const x = point.x + 0.006 * fold * drape;
    const y = point.y + 0.012 * fold * drape;
    const z = -0.22 + t * (0.48 + 0.012 * u) + 0.005 * fold * drape + 0.009 * Math.sin(t * 5 + u * 2) * u;
    const edgeRound = 0.003 * Math.sin(Math.PI * u) * Math.sin(Math.PI * t);
    positions.push(x, y + side * (0.008 + edgeRound), z);
    uvs.push(u, t);
  }
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
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
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
    placed(new THREE.SphereGeometry(1, 20, 14), [0, 0.355, 0.025], [0.34, 0.087, 0.345]),
    placed(new THREE.SphereGeometry(1, 20, 14), [0, 0.59, -0.26], [0.355, 0.19, 0.135], [-0.12, 0, 0]),
    ...[-1, 1].map((side) => placed(new THREE.SphereGeometry(1, 16, 12), [side * 0.311, 0.52, -0.012], [0.075, 0.138, 0.335], [-0.12, 0, side * 0.08])),
  ];
  const paddedRim = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.32, 0.55, 0.205), new THREE.Vector3(-0.33, 0.61, -0.115),
    new THREE.Vector3(-0.25, 0.715, -0.287), new THREE.Vector3(0, 0.775, -0.305),
    new THREE.Vector3(0.25, 0.715, -0.287), new THREE.Vector3(0.33, 0.61, -0.115),
    new THREE.Vector3(0.32, 0.55, 0.205),
  ]);
  body.push(new THREE.TubeGeometry(paddedRim, 32, 0.047, 7, false));
  addPart("lounge-upholstery", mergeGeometries(body, false), m.loungeFabric);
  const legs = [];
  for (const x of [-0.26, 0.26]) for (const z of [-0.25, 0.25]) {
    legs.push(placed(new THREE.CylinderGeometry(0.028, 0.018, 0.31, 8), [x, 0.155, z], [1, 1, 1], [0.065 * Math.sign(z), 0, -0.065 * Math.sign(x)]));
  }
  addPart("lounge-oak-legs", mergeGeometries(legs, false), m.oak);
  addPart("lounge-sage-pillow", placed(makeLoungePillowGeometry(), [-0.06, 0.525, -0.113], [1, 1, 1], [-0.23, -0.13, 0.13]), m.loungePillow);
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

function buildRoomWallArt(scene, materials, onTextureLoad) {
  const texture = new THREE.TextureLoader().load(
    new URL("./art/room03-wall-art-v1.webp", import.meta.url).href,
    onTextureLoad,
  );
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const artMaterial = new THREE.MeshStandardMaterial({ map: texture, color: 0xffffff, roughness: 1, metalness: 0 });
  artMaterial.name = "room03-original-garden-art";
  const group = buildPropGroup(scene, "room03-wall-art", [2.923, 1.52, -0.02], ({ box, shape }) => {
    // Keep the image aspect ratio while enlarging the oak frame to about 1.2 x 0.94 m.
    box(materials.oak, [0.034, 0.035, 1.2], [0, 0.4525, 0]);
    box(materials.oak, [0.034, 0.035, 1.2], [0, -0.4525, 0]);
    box(materials.oak, [0.034, 0.87, 0.035], [0, 0, -0.5825]);
    box(materials.oak, [0.034, 0.87, 0.035], [0, 0, 0.5825]);
    box(materials.oak, [0.012, 0.87, 1.13], [0.011, 0, 0]);
    shape(new THREE.PlaneGeometry(1.13, 0.87), artMaterial, [-0.015, 0, 0], [0, -Math.PI / 2, 0]);
  });
  const imagePlane = group.children.find((child) => child.material === artMaterial);
  if (imagePlane) imagePlane.receiveShadow = false;
  return { group, texture };
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

  // Three restrained succulents in one low rectangular planter, brought forward for the default view.
  const succulents = buildPropGroup(scene, "tabletop-succulents", [0, 0.75, 0.76], ({ box, shape }) => {
    box(m.oak, [0.56, 0.075, 0.19], [0, 0.039, 0]);
    box(m.soil, [0.52, 0.012, 0.15], [0, 0.082, 0]);
    const leafGeometry = new THREE.SphereGeometry(1, 10, 8);
    for (const centerX of [-0.18, 0, 0.18]) {
      shape(new THREE.SphereGeometry(0.035, 10, 8), m.leafGreen, [centerX, 0.115, 0]);
      for (let leaf = 0; leaf < 4; leaf++) {
        const angle = leaf * Math.PI / 2 + (centerX < 0 ? 0.22 : 0);
        const x = centerX + Math.cos(angle) * 0.032;
        const z = Math.sin(angle) * 0.032;
        shape(leafGeometry.clone(), m.leafGreen, [x, 0.136, z], [0.25 * Math.sin(angle), 0, -0.52 * Math.cos(angle)], [0.035, 0.014, 0.027]);
      }
    }
    leafGeometry.dispose();
  });
  succulents.scale.setScalar(1.3);

  // Fiddle-leaf fig: each petiole grows upward from the trunk instead of forming horizontal rungs.
  const leafCount = 30;
  let leafVerticesPerBlade = 0;
  const figLeaf = m.leafGreen.clone(); figLeaf.color.setHex(0x668354);
  const figLeafLight = m.leafGreenLight.clone(); figLeafLight.color.setHex(0x8ca668);
  const fig = buildPropGroup(scene, "window-fiddle-leaf-fig", [-1.93, 0, 1.68], ({ shape }) => {
    const potProfile = [
      new THREE.Vector2(0.105, 0.01), new THREE.Vector2(0.14, 0.022),
      new THREE.Vector2(0.17, 0.13), new THREE.Vector2(0.158, 0.255),
      new THREE.Vector2(0.163, 0.266), new THREE.Vector2(0.157, 0.279),
      new THREE.Vector2(0.139, 0.284), new THREE.Vector2(0.125, 0.27),
      new THREE.Vector2(0.122, 0.245),
    ];
    shape(new THREE.LatheGeometry(potProfile, 24), m.stone);
    shape(new THREE.CylinderGeometry(0.123, 0.123, 0.009, 18), m.soil, [0, 0.263, 0]);
    const trunk = new THREE.CylinderGeometry(0.015, 0.028, 1.16, 12, 8);
    const trunkPositions = trunk.attributes.position;
    for (let i = 0; i < trunkPositions.count; i++) {
      const t = (trunkPositions.getY(i) + 0.58) / 1.16;
      trunkPositions.setX(i, trunkPositions.getX(i) + 0.035 * Math.sin(t * Math.PI));
      trunkPositions.setZ(i, trunkPositions.getZ(i) + 0.016 * Math.sin(t * Math.PI * 1.6));
    }
    trunk.computeVertexNormals();
    shape(trunk, m.oak, [0, 0.87, 0]);
    const profile = [0.025, 0.18, 0.42, 0.68, 0.79, 0.74, 0.67, 0.69, 0.82, 0.97, 1.0, 0.94, 0.77, 0.54, 0.27, 0.025];
    const rows = 16;
    const widthAt = (t) => {
      const position = t * (profile.length - 1);
      const index = Math.min(Math.floor(position), profile.length - 2);
      const u = position - index;
      const a = profile[Math.max(0, index - 1)], b = profile[index];
      const c = profile[index + 1], d = profile[Math.min(profile.length - 1, index + 2)];
      return Math.max(0.025, 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u));
    };
    const columns = 15;
    const positions = [], uvs = [], indices = [];
    for (let row = 0; row < rows; row++) {
      const t = row / (rows - 1);
      for (let column = 0; column <= columns; column++) {
        const u = (column / columns) * 2 - 1;
        const fold = Math.sin(Math.PI * t);
        const bend = 0.10 * (1 - u * u) * fold - 0.035 * t * t + 0.035 * u * u * fold;
        positions.push(u * widthAt(t), t - 0.025 * fold * (1 - u * u), bend);
        uvs.push(column / columns, t);
      }
    }
    for (let row = 0; row < rows - 1; row++) for (let column = 0; column < columns; column++) {
      const a = row * (columns + 1) + column, b = a + columns + 1;
      indices.push(a, a + 1, b, b, a + 1, b + 1);
    }
    const leafGeometry = new THREE.BufferGeometry();
    leafGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    leafGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    leafGeometry.setIndex(indices);
    leafGeometry.computeVertexNormals();
    const veinCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0.015), new THREE.Vector3(0, 0.31, 0.09),
      new THREE.Vector3(0, 0.67, 0.093), new THREE.Vector3(0, 1, -0.02),
    ]);
    const veinGeometry = new THREE.TubeGeometry(veinCurve, 8, 0.005, 3, false);
    for (let index = 0; index < leafCount; index++) {
      const level = Math.floor(index / 3), around = index % 3;
      const angle = level * 1.73 + around * (Math.PI * 2 / 3);
      const baseY = 0.51 + level * 0.085 + around * 0.018;
      const radius = 0.17 + Math.sin((level / 9) * Math.PI) * 0.13;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius * 0.72;
      const length = 0.22 + level * 0.007 + ((level + around) % 3) * 0.012;
      const width = 0.23 + level * 0.005 + ((level * 2 + around) % 3) * 0.012;
      const rotation = [0.48 * Math.sin(angle), angle, 0.52 * Math.cos(angle + index * 0.13)];
      const scale = [width / 2, length, 0.75];
      const leafMaterial = index % 7 === 0 ? figLeafLight : figLeaf;
      const petiole = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, baseY - 0.10, 0),
        new THREE.Vector3(x * 0.38, baseY - 0.02, z * 0.38),
        new THREE.Vector3(x, baseY, z),
      );
      shape(new THREE.TubeGeometry(petiole, 7, 0.0045, 4, false), m.oak);
      shape(leafGeometry.clone(), leafMaterial, [x, baseY, z], rotation, scale);
      shape(veinGeometry.clone(), figLeafLight, [x, baseY, z], rotation, scale);
    }
    leafVerticesPerBlade = leafGeometry.attributes.position.count;
    leafGeometry.dispose();
    veinGeometry.dispose();
  });
  fig.userData.leafCount = leafCount;
  fig.userData.leafVerticesPerBlade = leafVerticesPerBlade;
  fig.scale.set(0.9, 1, 0.9);

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
        object.castShadow = true;
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

export async function start({ stage, onReady = () => {} }) {
  const scene = new THREE.Scene();
  const skyMaterials = { golden: makeSkyTexture(false), night: makeSkyTexture(true) };
  scene.background = skyMaterials.golden;
  const DESKTOP_CAMERA = { position: [1.25, 1.65, 4.95], target: [0.8, 1.25, -0.1], fov: 52, maxDistance: 5.3 };
  const PORTRAIT_CAMERA = { position: [1.36, 1.71, 4.49], target: [1.15, 1.25, 0], fov: 84, maxDistance: 4.7 };
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
  renderer.shadowMap.type = THREE.VSMShadowMap;
  stage.replaceChildren(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false; controls.enablePan = false;
  controls.target.set(...initialCamera.target); controls.minDistance = 4.5;
  controls.minPolarAngle = 1.36; controls.maxPolarAngle = 1.55; controls.minAzimuthAngle = -0.24; controls.maxAzimuthAngle = 0.31;
  controls.maxDistance = initialCamera.maxDistance;
  let compactCameraActive = compact;
  const materials = makeMaterials();
  const buckets = new Map();
  let yardLoaded = false;
  let wallArtLoaded = false;
  buildArchitecture(buckets, materials, scene, () => { yardLoaded = true; render(); });
  buildKitchen(buckets, materials);
  buildSideKitchen(buckets, materials, scene);
  buildTable(buckets, materials);
  buildProceduralDiningChairs(scene, materials);
  buildHouseholdProps(scene, materials);
  const loungeChair = buildLoungeChair(scene, materials);
  const wallArt = buildRoomWallArt(scene, materials, () => { wallArtLoaded = true; render(); });
  assemble(buckets, scene);
  const sunTarget = new THREE.Object3D(); sunTarget.position.set(0, 0, 0); scene.add(sunTarget);
  const sun = new THREE.DirectionalLight(0xffd6a1, 2.4); sun.position.set(-4.2, 1.2, 3.6); sun.target = sunTarget; sun.castShadow = true;
  sun.shadow.mapSize.set(512, 512); sun.shadow.camera.left = -4; sun.shadow.camera.right = 4; sun.shadow.camera.top = 4; sun.shadow.camera.bottom = -4; sun.shadow.bias = -0.0002; sun.shadow.radius = 3; sun.shadow.blurSamples = 8; scene.add(sun);
  const hemi = new THREE.HemisphereLight(0xfff0d4, 0x6f6658, 0.68); scene.add(hemi);
  const ambient = new THREE.AmbientLight(0xffffff, 0.28); scene.add(ambient);
  const pendantLight = buildPendant(scene, materials);
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
  // Four subtle contact patches are merged into one horizontal mesh for both light moods.
  const loungeChairLocal = [
    [-0.26, -0.25], [-0.26, 0.25], [0.26, -0.25], [0.26, 0.25],
  ].map(([x, z]) => {
    const patch = new THREE.PlaneGeometry(0.18, 0.15);
    patch.rotateX(-Math.PI / 2);
    patch.translate(x, 0.003, z);
    patch.applyMatrix4(new THREE.Matrix4().compose(
      new THREE.Vector3(...LOUNGE_PLACEMENT.position),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, LOUNGE_PLACEMENT.yaw, 0)),
      new THREE.Vector3(1, 1, 1),
    ));
    return patch;
  });
  const loungeContactShadow = new THREE.Mesh(
    mergeGeometries(loungeChairLocal, false),
    new THREE.MeshBasicMaterial({ map: makeLoungeShadowTexture(), transparent: true, opacity: 0.8, depthWrite: false }),
  );
  loungeContactShadow.name = "lounge-foot-contact-shadows";
  loungeContactShadow.userData.category = "lounge-chair";
  loungeContactShadow.position.set(0, 0, 0);
  loungeContactShadow.visible = false;
  scene.add(loungeContactShadow);
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

  const moods = {
    golden: { sun: 2.8, hemi: 0.9, ambient: 0.30, pendant: 0.32, under: 0.42, side: 0.48, exposure: 1.10, yard: 0xffd7a1, globe: 0.34 },
    night: { sun: 0, hemi: 0.46, ambient: 0.29, pendant: 6.1, under: 2.7, side: 2.3, exposure: 1.08, yard: 0x7187a5, globe: 1.55 },
  };
  let currentMood = "golden";
  function setMood(name) {
    const preset = moods[name]; if (!preset) return;
    currentMood = name;
    sun.intensity = preset.sun; hemi.intensity = preset.hemi; ambient.intensity = preset.ambient;
    pendantLight.intensity = preset.pendant; underLight.intensity = preset.under; sideLight.intensity = preset.side;
    renderer.toneMappingExposure = preset.exposure;
    scene.background = skyMaterials[name];
    const yardMaterial = scene.getObjectByName("courtyard-background")?.material;
    if (yardMaterial) { yardMaterial.color.setHex(preset.yard); yardMaterial.needsUpdate = true; }
    materials.opal.emissiveIntensity = preset.globe;
    scene.traverse((object) => {
      if (!object.isMesh) return;
      for (const material of (Array.isArray(object.material) ? object.material : [object.material])) {
        if (material?.name === "warm-opal-glass") material.emissiveIntensity = preset.globe;
      }
    });
    materials.floor.color.setHex(name === "night" ? 0xc2a77b : 0xcdbb9e);
    materials.jute.color.setHex(name === "night" ? 0xd9c99f : 0xd0b47f);
    materials.ceiling.emissiveIntensity = name === "golden" ? 0.3 : 0.55;
    materials.warmGlow.opacity = name === "night" ? 1 : 0.72;
    materials.wokGlow.opacity = name === "night" ? 1 : 0.72;
    materials.sunlight.opacity = name === "golden" ? 0.32 : 0;
    sunlightPatch.visible = name === "golden";
    loungeContactShadow.visible = true;
    windowWallBounce.material.opacity = name === "golden" ? 0.22 : 0;
    pendantFloorBounce.material.opacity = name === "night" ? 0.34 : 0;
    pendantCeilingBounce.material.opacity = name === "night" ? 0.22 : 0;
    windowWallBounce.visible = name === "golden";
    pendantFloorBounce.visible = name === "night";
    pendantCeilingBounce.visible = name === "night";
    materials.reveal.opacity = name === "night" ? 1 : 0.72;
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
    renderer.setSize(rect.width, rect.height, false);
    render();
  }
  function render() { renderer.render(scene, camera); }
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
    let red = 0, green = 0, blue = 0, luminance = 0, luminanceSq = 0;
    for (let i = 0; i < rgba.length; i += 4) {
      const r = rgba[i], g = rgba[i + 1], b = rgba[i + 2];
      const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      red += r; green += g; blue += b; luminance += l; luminanceSq += l * l;
    }
    const count = sampleWidth * sampleHeight;
    renderer.setRenderTarget(null);
    renderer.setViewport(0, 0, stage.clientWidth, stage.clientHeight);
    renderer.render(scene, camera);
    target.dispose();
    const mean = luminance / count;
    return { meanLuminance: mean, luminanceStdDev: Math.sqrt(Math.max(0, luminanceSq / count - mean * mean)), red: red / count, green: green / count, blue: blue / count, samples: count };
  };
  const sampleNdc = (point, radius = 0.012) => samplePixels({ left: (point[0] + 1) / 2 - radius, top: (1 - point[1]) / 2 - radius, width: radius * 2, height: radius * 2 });
  const info = () => {
    const categories = {};
    const furnitureAssets = {};
    const softForms = { chairShells: 0, shellHeights: [], pendantGlobeVertices: 0 };
    let lightCount = 0;
    scene.traverse((object) => { if (object.isLight) lightCount++; });
    const lightMetrics = {
      lightCount, shadowType: renderer.shadowMap.type === THREE.VSMShadowMap ? "VSM" : "other",
      shadowMapSize: sun.shadow.mapSize.toArray(), shadowRadius: sun.shadow.radius,
      shadowBlurSamples: sun.shadow.blurSamples, sun: sun.intensity, hemi: hemi.intensity,
      ambient: ambient.intensity, pendant: pendantLight.intensity,
      exposure: renderer.toneMappingExposure,
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
      const box = new THREE.Box3().setFromObject(object);
      return { min: box.min.toArray(), max: box.max.toArray(), size: box.getSize(new THREE.Vector3()).toArray() };
    };
    const categoryBoxFor = (category) => {
      const box = new THREE.Box3(); box.makeEmpty();
      scene.traverse((object) => { if (object.isMesh && object.userData.category === category) box.expandByObject(object); });
      return box.isEmpty() ? null : { min: box.min.toArray(), max: box.max.toArray(), size: box.getSize(new THREE.Vector3()).toArray() };
    };
    const propKeys = ["drip-coffee-maker", "electric-kettle", "rice-cooker", "cutting-board", "oil-and-salt", "tabletop-succulents", "window-fiddle-leaf-fig", "cookbooks"];
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
    const loungeBounds = boxFor(loungeChair.name);
    const lounge = {
      bounds: loungeBounds, position: loungeChair.position.toArray(), yawDegrees: THREE.MathUtils.radToDeg(loungeChair.rotation.y), contactShadowVisible: loungeContactShadow.visible, contactShadowBounds: boxFor(loungeContactShadow.name),
      projectedCenter: project(new THREE.Box3().setFromObject(loungeChair).getCenter(new THREE.Vector3()).toArray()),
      parts: Object.fromEntries(loungeChair.children.map((part) => [part.name, { bounds: boxFor(part.name), vertices: part.geometry.attributes.position.count }])),
    };
    const plantGroup = scene.getObjectByName("prop-window-fiddle-leaf-fig");
    const cookbookGroup = scene.getObjectByName("prop-cookbooks");
    const wallArtCorners = [[2.908, 1.05, -0.62], [2.908, 1.99, -0.62], [2.908, 1.05, 0.58], [2.908, 1.99, 0.58]].map(project);
    const wallArtNdc = wallArtCorners.map(([x, y]) => [x, y]);
    const wallArtPixels = {
      width: (Math.max(...wallArtNdc.map(([x]) => x)) - Math.min(...wallArtNdc.map(([x]) => x))) * stage.clientWidth / 2,
      height: (Math.max(...wallArtNdc.map(([, y]) => y)) - Math.min(...wallArtNdc.map(([, y]) => y))) * stage.clientHeight / 2,
      center: [(Math.min(...wallArtNdc.map(([x]) => x)) + Math.max(...wallArtNdc.map(([x]) => x))) / 2, (Math.min(...wallArtNdc.map(([, y]) => y)) + Math.max(...wallArtNdc.map(([, y]) => y))) / 2],
    };
    const wallArtDoorFrameBounds = { min: [2.86, 0, 1.2025], max: [2.94, 2.1, 2.0975], size: [0.08, 2.1, 0.895] };
    const wallArtImagePlane = wallArt.group.children.find((child) => child.material?.name === "room03-original-garden-art");
    return { lounge, lightMetrics, title: ROOM_TITLE, dimensions: ROOM, mood: currentMood, yardLoaded, wallArtLoaded, wallArtTextureSize: [wallArt.texture.image?.naturalWidth || wallArt.texture.image?.width || 0, wallArt.texture.image?.naturalHeight || wallArt.texture.image?.height || 0], wallArtColorSpace: wallArt.texture.colorSpace, wallArtMaterial: wallArtImagePlane?.material?.type || null, wallArtReceivesShadow: wallArtImagePlane?.receiveShadow ?? null, wallArtBounds: boxFor("prop-room03-wall-art"), wallArtCorners, wallArtPixels, wallArtDoorFrameBounds, wallArtClearanceBounds: { beams: boxFor("merged-structure"), hood: boxFor("merged-hood"), upperCabinets: boxFor("merged-kitchen") }, furniture: { ...furniture.status, urls: furniture.urls, tabletopEdgeHeightDeviation: furniture.tabletopEdgeHeightDeviation }, furnitureAssets, furnitureBounds: { table: boxFor("room03-table-glb"), chairs: chairBounds, pendant: boxFor("room03-pendant-glb") }, propBounds, propGeometry, windowBounds: { slider: boxFor("glass-slider-panel"), ajar: boxFor("glass-slider-panel-ajar") }, plantLeafCount: plantGroup?.userData.leafCount || 0, plantLeafVerticesPerBlade: plantGroup?.userData.leafVerticesPerBlade || 0, softForms, cookbookCount: cookbookGroup?.userData.bookCount || 0, wokSupport: { bounds: categoryBoxFor("wok-base-cabinet"), counterBottomY: 0.8125, counterTopY: 0.8975 }, sceneBounds: { kitchen: boxFor("merged-kitchen"), counter: boxFor("merged-counter"), structure: boxFor("merged-structure"), hood: boxFor("merged-hood"), sideKitchen: boxFor("merged-side-kitchen"), wokBase: categoryBoxFor("wok-base-cabinet") }, materialColors: { wall: `#${materials.wall.color.getHexString()}`, cabinet: `#${materials.olive.color.getHexString()}`, hood: `#${materials.hoodSteel.color.getHexString()}` }, edgeRadii: EDGE_RADIUS_BY_CATEGORY, roundingSegments: ROUNDING_SEGMENTS, vertices, triangles, meshes, drawCallsLastFrame: renderer.info.render.calls, categories, rug: rugBounds, rugSamples: { rug: project([1.22, 0.022, 0.5]), floorBesideRug: project([1.72, 0.002, 0.5]) }, floorSamples: { farFromWindow: project([1.72, 0.002, 0.5]) }, pixelRatio: renderer.getPixelRatio(), canvas: [renderer.domElement.width, renderer.domElement.height], camera: camera.position.toArray(), cameraTarget: controls.target.toArray(), cameraFov: camera.fov, viewport: [stage.clientWidth, stage.clientHeight], wokOpeningWidth: 0.55, projectedRegions: { dining: project([0, 0.76, 0.5]), kitchen: project([0, 1.2, -2.0]), countertop: project([0, 0.955, -2.03]), cabinetSample: project([-1.55, 1.78, -1.9225]), pendant: project([0, 1.98, 0.15]), wallArt: project([2.908, 1.52, -0.02]), wokDoor: project([3.08, 1.44, 1.8]), wokBowl: project([2.65, 1.02, 1.8]), wokHood: project([2.65, 1.68, 1.8]), wokGlow: project([2.48, 1.535, 1.8]), wokBase: project([2.705, 0.41625, 1.8]), doorReveal: project([2.48, 1.535, 1.8]), doorPanel: project([2.91, 1.05, 1.15]), wokOpening: project([2.7, 1.32, 1.8]), wallBesideWok: project([2.92, 1.4, 2.2]), plantTrunk: project([-1.93, 0.87, 1.68]) } };
  };
  const instance = {
    setMood, resize, render, camera, controls, info,
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
    },
  };
  onReady(instance);
  return instance;
}
