import * as THREE from "../vendor/three.module.min.js";
import { OrbitControls } from "../vendor/OrbitControls.js";
import { mergeGeometries } from "../vendor/BufferGeometryUtils.js";

export const ROOM_TITLE = "Room 03｜Bay Area Kitchen";
const ROOM = Object.freeze({ width: 6, depth: 4.8, height: 2.7 });
const COLORS = Object.freeze({
  cream: 0xe7ddca, oak: 0xbc8a53, beam: 0x8a5a2e, ceiling: 0xc48a4a, olive: 0x4b5034,
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
  direction.addColorStop(0, "#f4e6cc");
  direction.addColorStop(0.18, "#fff9eb");
  direction.addColorStop(0.42, "#f8edd8");
  direction.addColorStop(0.72, "#eee1c8");
  direction.addColorStop(1, "#f0e4ce");
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

function makeMaterials() {
  const std = (color, roughness = 0.8, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
  return {
    floor: std(0xcdbb9e, 0.42, { map: makeFloorTexture(31, 0.15), metalness: 0.025 }),
    wall: std(COLORS.cream, 0.92, { map: makeMottleTexture(19, 0.028) }),
    ceiling: std(COLORS.ceiling, 0.86, { map: makeWoodTexture(true, true), emissive: 0x9b6938, emissiveIntensity: 0.34 }),
    oak: std(COLORS.oak, 0.76, { map: makeWoodTexture(false) }),
    beam: std(COLORS.beam, 0.79, { map: makeWoodTexture(false) }),
    olive: std(COLORS.olive, 0.82),
    stone: std(COLORS.stone, 0.45, { map: makeFineNoise(23, 0.025) }),
    black: std(COLORS.black, 0.44), steel: std(COLORS.steel, 0.38),
    jute: std(COLORS.jute, 0.96, { map: makeRugTexture() }), seat: std(0xb8a17e, 0.98, { map: makeSeatTexture() }),
    red: std(COLORS.terracotta, 0.34), glass: new THREE.MeshPhysicalMaterial({ color: 0xb9d3d1, roughness: 0.12, metalness: 0.06, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false }),
    opal: new THREE.MeshStandardMaterial({ color: COLORS.opal, roughness: 0.22, emissive: 0xffdfa4, emissiveIntensity: 0.24 }),
    warmGlow: new THREE.MeshBasicMaterial({ color: 0xffc477, transparent: true, opacity: 0.94, side: THREE.DoubleSide, depthWrite: false }),
    sunlight: new THREE.MeshBasicMaterial({ color: 0xffdda0, map: makeSunPatchTexture(), transparent: true, opacity: 0.24, depthWrite: false, side: THREE.DoubleSide }),
    reveal: new THREE.MeshBasicMaterial({ color: 0xffc477, transparent: true, opacity: 0.98, depthWrite: false, side: THREE.DoubleSide }),
  };
}

function addBox(buckets, category, material, size, position, rotationY = 0) {
  const key = `${category}:${material.uuid}`;
  if (!buckets.has(key)) buckets.set(key, { category, material, geometries: [] });
  const geometry = new THREE.BoxGeometry(...size);
  const matrix = new THREE.Matrix4().compose(
    new THREE.Vector3(...position),
    new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotationY),
    new THREE.Vector3(1, 1, 1),
  );
  geometry.applyMatrix4(matrix);
  buckets.get(key).geometries.push(geometry);
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
  // Move the small wok-kitchen opening toward the front so it reads from the entry camera.
  addBox(b, "shell", m.wall, [0.12, h, 3.95], [hx, h / 2, -0.425]);
  addBox(b, "shell", m.wall, [0.12, 0.55, 0.85], [hx, 2.42, 1.975]);
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
  // Wide, quiet hood above the range.
  addBox(b, "hood", m.steel, [1.38, 0.15, 0.55], [0.82, 2.13, -2.01]);
  addBox(b, "hood", m.black, [0.7, 0.55, 0.23], [0.82, 2.43, -2.21]);
  // Under-cabinet light is an emissive strip plus a single low-power task spot.
  addBox(b, "light-fixtures", m.warmGlow, [3.45, 0.018, 0.024], [0, 1.43, -1.91]);
}

function buildSideKitchen(b, m, scene) {
  // One dark-framed slider covers most of the opening and leaves a narrow warm-lit slit.
  addBox(b, "side-kitchen", m.black, [0.08, 0.055, 0.85], [2.84, 2.05, 1.975]);
  // Dark olive slider leaves a narrow reveal on the courtyard-facing edge.
  addBox(b, "side-kitchen", m.olive, [0.055, 1.98, 0.75], [2.86, 1.0, 1.925]);
  addBox(b, "side-kitchen", m.black, [0.08, 2.1, 0.045], [2.84, 1.05, 1.55]);
  addBox(b, "side-kitchen", m.black, [0.08, 2.1, 0.045], [2.84, 1.05, 2.4]);
  addBox(b, "side-kitchen", m.black, [0.025, 0.22, 0.025], [2.81, 1.1, 2.16]);
  addBox(b, "side-kitchen", m.black, [0.08, 1.9, 1.15], [4.05, 1.02, 1.55]);
  // Align the small wok and hood with the 10 cm reveal so they read through the gap.
  addBox(b, "side-kitchen", m.stone, [0.7, 0.1, 0.65], [3.38, 0.9, 2.34]);
  addBox(b, "side-kitchen", m.steel, [0.66, 0.16, 0.42], [3.41, 1.63, 2.34]);
  const wok = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.1, 0.19, 18, 1, true), m.black);
  wok.position.set(3.32, 1.06, 2.34); wok.name = "wok-kitchen-wok"; wok.userData.category = "side-kitchen"; b.get(`shapes:${m.black.uuid}`) ?? b.set(`shapes:${m.black.uuid}`, { category: "side-kitchen", material: m.black, geometries: [], meshes: [] }); b.get(`shapes:${m.black.uuid}`).meshes.push(wok);
  // A narrow luminous backing aligns exactly with the visible slit, in front of the utensils.
  const revealGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 1.48), m.reveal);
  revealGlow.position.set(2.80, 1.06, 2.35); revealGlow.rotation.y = Math.PI / 2;
  revealGlow.name = "wok-kitchen-door-reveal"; revealGlow.userData.category = "side-kitchen"; scene.add(revealGlow);
  // Tiny silhouettes sit in the aperture: a range hood above and a wok below the glow.
  addBox(b, "side-kitchen", m.steel, [0.16, 0.045, 0.075], [2.77, 1.72, 2.35]);
  const peekWok = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.035, 0.055, 12), m.black);
  peekWok.position.set(2.76, 0.93, 2.35); peekWok.name = "wok-kitchen-door-peek"; peekWok.userData.category = "side-kitchen";
  peekWok.castShadow = false; peekWok.receiveShadow = false;
  b.get(`shapes:${m.black.uuid}`).meshes.push(peekWok);
  addBox(b, "side-kitchen", m.black, [0.14, 0.014, 0.014], [2.82, 0.95, 2.35]);
  const sideLight = new THREE.PointLight(0xffad64, 0, 1.7, 2); sideLight.position.set(3.3, 1.55, 2.34); sideLight.name = "side-kitchen-warm-source"; scene.add(sideLight);
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
  // Four restrained mid-century chairs: woven seats and curved timber backs.
  for (const x of [-0.5, 0.5]) for (const cz of [z - 0.72, z + 0.72]) {
    const facing = cz < z ? Math.PI : 0;
    addBox(b, "dining-chairs", m.seat, [0.44, 0.07, 0.42], [x, 0.47, cz]);
    for (const dx of [-0.18, 0.18]) for (const dz of [-0.16, 0.16]) addBox(b, "dining-chairs", m.oak, [0.045, 0.43, 0.045], [x + dx, 0.235, cz + dz]);
    const backZ = cz + (facing ? -0.18 : 0.18);
    for (const xx of [-0.19, 0.19]) addBox(b, "dining-chairs", m.oak, [0.045, 0.46, 0.045], [x + xx, 0.69, backZ]);
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.2, 0.88, 0),
      new THREE.Vector3(0, 1.11, 0),
      new THREE.Vector3(0.2, 0.88, 0),
    );
    const arch = new THREE.Mesh(new THREE.TubeGeometry(curve, 14, 0.026, 5, false), m.oak);
    arch.position.set(x, 0, backZ); arch.name = "curved-chair-back"; arch.userData.category = "dining-chairs";
    arch.castShadow = true; arch.receiveShadow = true; b.set(`chair-arch-${x}-${cz}`, { category: "dining-chairs", material: m.oak, geometries: [], meshes: [arch] });
  }
}

function buildRedPot(scene, m) {
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.16, 0.2, 20, 1), m.red);
  body.position.set(0.82, 1.1, -2.02); body.name = "single-terracotta-pot"; body.userData.category = "accent"; body.castShadow = true; body.receiveShadow = true; scene.add(body);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.195, 0.195, 0.035, 20), m.red);
  lid.position.set(0.82, 1.22, -2.02); lid.name = "terracotta-pot-lid"; lid.userData.category = "accent"; scene.add(lid);
  for (const dx of [-0.22, 0.22]) {
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.014, 6, 12), m.red);
    handle.position.set(0.82 + dx, 1.12, -2.02); handle.rotation.y = Math.PI / 2; handle.name = "terracotta-pot-handle"; handle.userData.category = "accent"; scene.add(handle);
  }
}

function buildPendant(scene, m) {
  const ceilingCap = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.025, 16), m.black);
  ceilingCap.position.set(0, 2.46, 0.15); ceilingCap.name = "pendant-canopy"; ceilingCap.userData.category = "lighting"; scene.add(ceilingCap);
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.42, 8), m.black);
  cord.position.set(0, 2.23, 0.15); cord.name = "pendant-cord"; cord.userData.category = "lighting"; scene.add(cord);
  const globe = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 14), m.opal);
  globe.position.set(0, 1.98, 0.15); globe.name = "single-opal-globe"; globe.userData.category = "lighting"; globe.castShadow = true; scene.add(globe);
  const bulb = new THREE.PointLight(0xffd39a, 0, 7, 2); bulb.position.set(0, 1.98, 0.15); bulb.name = "pendant-light-source"; bulb.castShadow = false; scene.add(bulb);
  return bulb;
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
  const compact = window.innerWidth < 500;
  const camera = new THREE.PerspectiveCamera(compact ? 60 : 50, 1, 0.05, 50);
  camera.position.set(1.25, compact ? 1.74 : 1.65, 4.95);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(1.5);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  stage.replaceChildren(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false; controls.enablePan = false;
  controls.target.set(0.8, 1.25, -0.1); controls.minDistance = 4.5;
  controls.minPolarAngle = 1.3; controls.maxPolarAngle = 1.88; controls.minAzimuthAngle = -0.6; controls.maxAzimuthAngle = 0.35;
  controls.maxDistance = compact ? 6.2 : 5.8;
  const materials = makeMaterials();
  const buckets = new Map();
  let yardLoaded = false;
  buildArchitecture(buckets, materials, scene, () => { yardLoaded = true; render(); });
  buildKitchen(buckets, materials);
  buildSideKitchen(buckets, materials, scene);
  buildTable(buckets, materials);
  assemble(buckets, scene);
  const sunTarget = new THREE.Object3D(); sunTarget.position.set(0, 0, 0); scene.add(sunTarget);
  const sun = new THREE.DirectionalLight(0xffd6a1, 2.4); sun.position.set(-4.2, 1.2, 3.6); sun.target = sunTarget; sun.castShadow = true;
  sun.shadow.mapSize.set(512, 512); sun.shadow.camera.left = -4; sun.shadow.camera.right = 4; sun.shadow.camera.top = 4; sun.shadow.camera.bottom = -4; sun.shadow.bias = -0.0002; sun.shadow.radius = 4; scene.add(sun);
  const hemi = new THREE.HemisphereLight(0xfff0d4, 0x6f6658, 0.68); scene.add(hemi);
  const ambient = new THREE.AmbientLight(0xffffff, 0.28); scene.add(ambient);
  const pendantLight = buildPendant(scene, materials);
  const underLight = new THREE.SpotLight(0xffca91, 0, 2.8, Math.PI / 3.5, 0.65, 2); underLight.position.set(0, 1.42, -1.82); underLight.target.position.set(0, 0.96, -1.45); scene.add(underLight, underLight.target);
  const sideLight = [...scene.children].find((o) => o.name === "side-kitchen-warm-source");
  buildRedPot(scene, materials);
  const sunlightPatch = new THREE.Mesh(new THREE.PlaneGeometry(3.35, 1.85), materials.sunlight);
  sunlightPatch.rotation.set(-Math.PI / 2, 0, 0);
  sunlightPatch.position.set(-1.15, 0.012, 0.48);
  sunlightPatch.name = "golden-hour-floor-patch";
  sunlightPatch.userData.category = "lighting";
  scene.add(sunlightPatch);

  const moods = {
    golden: { sun: 3.5, hemi: 0.54, ambient: 0.16, pendant: 0.32, under: 0.42, side: 0.48, exposure: 1.06, yard: 0xffd7a1, globe: 0.34 },
    night: { sun: 0, hemi: 0.34, ambient: 0.2, pendant: 5.1, under: 2.7, side: 2.3, exposure: 1.06, yard: 0x7187a5, globe: 1.35 },
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
    materials.floor.color.setHex(name === "night" ? 0xc2a77b : 0xcdbb9e);
    materials.jute.color.setHex(name === "night" ? 0xd9c99f : 0xd0b47f);
    materials.ceiling.emissiveIntensity = name === "golden" ? 0.3 : 0.5;
    materials.warmGlow.opacity = name === "night" ? 1 : 0.72;
    materials.sunlight.opacity = name === "golden" ? 0.32 : 0;
    materials.reveal.opacity = name === "night" ? 1 : 0.72;
    for (const light of [sun, pendantLight, underLight, sideLight]) light.visible = light.intensity > 0;
    render();
  }
  function resize() {
    const rect = stage.getBoundingClientRect(); if (!rect.width || !rect.height) return;
    camera.aspect = rect.width / rect.height;
    camera.fov = rect.width < 500 ? 78 : 52;
    camera.updateProjectionMatrix();
    renderer.setSize(rect.width, rect.height, false);
    render();
  }
  function render() { renderer.render(scene, camera); }
  controls.addEventListener("change", render);
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(stage);
  resize(); controls.update(); setMood("golden");
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
    const project = (point) => new THREE.Vector3(...point).project(camera).toArray();
    let vertices = 0, triangles = 0, meshes = 0;
    scene.traverse((object) => {
      if (!object.isMesh || !object.geometry?.attributes?.position) return;
      const count = object.geometry.attributes.position.count;
      vertices += count; triangles += object.geometry.index ? object.geometry.index.count / 3 : count / 3; meshes++;
      const key = object.userData.category || "other";
      categories[key] ??= { vertices: 0, meshes: 0 };
      categories[key].vertices += count; categories[key].meshes++;
    });
    const rug = scene.getObjectByName("merged-rug");
    rug?.geometry.computeBoundingBox();
    const bounds = rug?.geometry.boundingBox;
    const rugBounds = bounds ? {
      min: bounds.min.toArray(), max: bounds.max.toArray(),
      size: bounds.getSize(new THREE.Vector3()).toArray(),
      materialColor: `#${rug.material.color.getHexString()}`, roughness: rug.material.roughness,
    } : null;
    return { title: ROOM_TITLE, dimensions: ROOM, mood: currentMood, yardLoaded, vertices, triangles, meshes, drawCallsLastFrame: renderer.info.render.calls, categories, rug: rugBounds, rugSamples: { rug: project([1.22, 0.022, 0.5]), floorBesideRug: project([1.72, 0.002, 0.5]) }, floorSamples: { farFromWindow: project([1.72, 0.002, 0.5]) }, pixelRatio: renderer.getPixelRatio(), canvas: [renderer.domElement.width, renderer.domElement.height], camera: camera.position.toArray(), viewport: [stage.clientWidth, stage.clientHeight], projectedRegions: { dining: project([0, 0.76, 0.5]), kitchen: project([0, 1.2, -2.0]), wokDoor: project([2.84, 1.05, 2.35]), doorReveal: project([2.80, 1.05, 2.35]), doorPanel: project([2.86, 1.05, 2.0]) } };
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
    dispose: () => { resizeObserver.disconnect(); controls.dispose(); renderer.dispose(); scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); Object.values(materials).forEach((m) => { m.map?.dispose(); m.dispose(); }); Object.values(skyMaterials).forEach((texture) => texture.dispose()); },
  };
  onReady(instance);
  return instance;
}
