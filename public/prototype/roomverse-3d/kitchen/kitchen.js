import * as THREE from "../vendor/three.module.min.js";
import { OrbitControls } from "../vendor/OrbitControls.js";
import { mergeGeometries } from "../vendor/BufferGeometryUtils.js";

export const ROOM_TITLE = "Room 03｜Bay Area Kitchen";
const ROOM = Object.freeze({ width: 6, depth: 4.8, height: 2.7 });
const COLORS = Object.freeze({
  cream: 0xd9c6ab, oak: 0xbc8a53, ceiling: 0xa9713c, olive: 0x4b5034,
  stone: 0xc9c0ae, black: 0x282a27, steel: 0x8e918b, jute: 0xa88d67,
  terracotta: 0xad452b, opal: 0xf2d7a0,
});

function makeRugTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#a98e68";
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 128; i += 4) {
    ctx.strokeStyle = i % 8 ? "#806d51" : "#d0b995";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 10, 128); ctx.stroke();
    ctx.strokeStyle = i % 8 ? "#d0b995" : "#806d51";
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(128, i + 6); ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 2);
  return texture;
}

function makeMaterials() {
  const std = (color, roughness = 0.8, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
  return {
    floor: std(0xaaa49a, 0.88), wall: std(COLORS.cream), ceiling: std(COLORS.ceiling, 0.9),
    oak: std(COLORS.oak, 0.76), olive: std(COLORS.olive, 0.82), stone: std(COLORS.stone, 0.45),
    black: std(COLORS.black, 0.44), steel: std(COLORS.steel, 0.38), jute: std(0xffffff, 1, { map: makeRugTexture() }),
    red: std(COLORS.terracotta, 0.34), glass: new THREE.MeshPhysicalMaterial({ color: 0xb9d3d1, roughness: 0.12, metalness: 0.06, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false }),
    opal: new THREE.MeshStandardMaterial({ color: COLORS.opal, roughness: 0.22, emissive: 0xffdfa4, emissiveIntensity: 0.24 }),
    warmGlow: new THREE.MeshBasicMaterial({ color: 0xffbd70, transparent: true, opacity: 0.92, side: THREE.DoubleSide }),
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
  addBox(b, "shell", m.wall, [0.12, h, 1.8], [hx, h / 2, -1.5]);
  addBox(b, "shell", m.wall, [0.12, h, 1.8], [hx, h / 2, 1.5]);
  addBox(b, "shell", m.wall, [0.12, 0.55, 1.2], [hx, 2.42, 0]);
  addBox(b, "shell", m.ceiling, [ROOM.width, 0.16, ROOM.depth], [0, 2.69, 0]);

  // Three exposed timber beams run from the glass wall into the kitchen.
  for (const x of [-2.05, 0, 2.05]) addBox(b, "structure", m.oak, [0.16, 0.18, 4.72], [x, 2.57, 0]);
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
  addBox(b, "side-kitchen", m.black, [0.08, 0.055, 1.2], [2.84, 2.05, 0]);
  addBox(b, "side-kitchen", m.ceiling, [0.055, 1.98, 0.88], [2.86, 1.0, -0.12]);
  addBox(b, "side-kitchen", m.black, [0.08, 2.1, 0.045], [2.84, 1.05, -0.6]);
  addBox(b, "side-kitchen", m.black, [0.08, 2.1, 0.045], [2.84, 1.05, 0.6]);
  addBox(b, "side-kitchen", m.black, [0.025, 0.22, 0.025], [2.81, 1.1, 0.25]);
  addBox(b, "side-kitchen", m.warmGlow, [0.025, 1.65, 0.28], [3.04, 1.03, 0.46]);
  addBox(b, "side-kitchen", m.black, [0.08, 1.9, 1.15], [4.05, 1.02, 0.2]);
  addBox(b, "side-kitchen", m.stone, [0.7, 0.1, 0.65], [3.38, 0.9, 0.4]);
  addBox(b, "side-kitchen", m.steel, [0.66, 0.16, 0.42], [3.41, 1.63, 0.25]);
  const wok = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.1, 0.19, 18, 1, true), m.black);
  wok.position.set(3.32, 1.06, 0.48); wok.name = "wok-kitchen-wok"; wok.userData.category = "side-kitchen"; b.get(`shapes:${m.black.uuid}`) ?? b.set(`shapes:${m.black.uuid}`, { category: "side-kitchen", material: m.black, geometries: [], meshes: [] }); b.get(`shapes:${m.black.uuid}`).meshes.push(wok);
  const sideLight = new THREE.PointLight(0xffad64, 0, 1.5, 2); sideLight.position.set(3.3, 1.55, 0.55); sideLight.name = "side-kitchen-warm-source"; scene.add(sideLight);
  return sideLight;
}

function buildTable(b, m) {
  const z = 0.35;
  // Flat jute texture; table is 2.25 x 0.98 m, around 75 cm high.
  addBox(b, "rug", m.jute, [2.9, 0.025, 1.9], [0, 0.015, z]);
  addBox(b, "dining-table", m.oak, [2.28, 0.075, 1.0], [0, 0.76, z]);
  addBox(b, "dining-table", m.oak, [1.94, 0.12, 0.11], [0, 0.65, z]);
  for (const x of [-0.96, 0.96]) for (const zz of [z - 0.36, z + 0.36]) addBox(b, "dining-table", m.oak, [0.09, 0.64, 0.09], [x, 0.34, zz]);
  // Four chairs with open backs; all remain inside the room and off the wall.
  for (const x of [-0.72, 0.72]) for (const cz of [z - 0.86, z + 0.86]) {
    const facing = cz < z ? Math.PI : 0;
    addBox(b, "dining-chairs", m.oak, [0.48, 0.075, 0.45], [x, 0.47, cz]);
    for (const dx of [-0.19, 0.19]) for (const dz of [-0.16, 0.16]) addBox(b, "dining-chairs", m.oak, [0.045, 0.43, 0.045], [x + dx, 0.235, cz + dz]);
    addBox(b, "dining-chairs", m.oak, [0.48, 0.09, 0.06], [x, 0.92, cz + (facing ? -0.17 : 0.17)]);
    for (const xx of [-0.2, 0.2]) addBox(b, "dining-chairs", m.oak, [0.055, 0.46, 0.055], [x + xx, 0.69, cz + (facing ? -0.17 : 0.17)]);
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
  scene.background = new THREE.Color(0xb9aa93);
  const camera = new THREE.PerspectiveCamera(65, 1, 0.05, 40);
  camera.position.set(-0.45, 1.95, 1.7);
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
  controls.target.set(window.innerWidth < 500 ? 0.2 : 0, 1.25, 0); controls.minDistance = 1.6; controls.maxDistance = 2.1;
  controls.minPolarAngle = 0.85; controls.maxPolarAngle = 2.0; controls.minAzimuthAngle = -Math.PI; controls.maxAzimuthAngle = Math.PI;
  const materials = makeMaterials();
  const buckets = new Map();
  let yardLoaded = false;
  buildArchitecture(buckets, materials, scene, () => { yardLoaded = true; render(); });
  buildKitchen(buckets, materials);
  buildSideKitchen(buckets, materials, scene);
  buildTable(buckets, materials);
  assemble(buckets, scene);
  const sunTarget = new THREE.Object3D(); sunTarget.position.set(0, 0, 0); scene.add(sunTarget);
  const sun = new THREE.DirectionalLight(0xffc27f, 2.2); sun.position.set(-4.2, 1.35, 3.2); sun.target = sunTarget; sun.castShadow = true;
  sun.shadow.mapSize.set(512, 512); sun.shadow.camera.left = -4; sun.shadow.camera.right = 4; sun.shadow.camera.top = 4; sun.shadow.camera.bottom = -4; sun.shadow.bias = -0.0002; sun.shadow.radius = 4; scene.add(sun);
  const hemi = new THREE.HemisphereLight(0xfff0d4, 0x6f6658, 0.9); scene.add(hemi);
  const ambient = new THREE.AmbientLight(0xffffff, 0.42); scene.add(ambient);
  const pendantLight = buildPendant(scene, materials);
  const underLight = new THREE.SpotLight(0xffca91, 0, 2.8, Math.PI / 3.5, 0.65, 2); underLight.position.set(0, 1.42, -1.82); underLight.target.position.set(0, 0.96, -1.45); scene.add(underLight, underLight.target);
  const sideLight = [...scene.children].find((o) => o.name === "side-kitchen-warm-source");
  buildRedPot(scene, materials);

  const moods = {
    golden: { sun: 2.2, hemi: 0.9, ambient: 0.42, pendant: 0, under: 0, side: 0.12, exposure: 1.08, yard: 0xffffff, background: 0xb9aa93, globe: 0.16 },
    night: { sun: 0, hemi: 0.28, ambient: 0.22, pendant: 2.0, under: 1.15, side: 1.05, exposure: 1.0, yard: 0x617087, background: 0x273244, globe: 1.0 },
  };
  let currentMood = "golden";
  function setMood(name) {
    const preset = moods[name]; if (!preset) return;
    currentMood = name;
    sun.intensity = preset.sun; hemi.intensity = preset.hemi; ambient.intensity = preset.ambient;
    pendantLight.intensity = preset.pendant; underLight.intensity = preset.under; sideLight.intensity = preset.side;
    renderer.toneMappingExposure = preset.exposure;
    scene.background.setHex(preset.background);
    const yardMaterial = scene.getObjectByName("courtyard-background")?.material;
    if (yardMaterial) { yardMaterial.color.setHex(preset.yard); yardMaterial.needsUpdate = true; }
    materials.opal.emissiveIntensity = preset.globe;
    materials.warmGlow.opacity = name === "night" ? 0.98 : 0.55;
    for (const light of [sun, pendantLight, underLight, sideLight]) light.visible = light.intensity > 0;
    render();
  }
  function resize() {
    const rect = stage.getBoundingClientRect(); if (!rect.width || !rect.height) return;
    camera.aspect = rect.width / rect.height;
    camera.fov = rect.width < 500 ? 104 : 78;
    camera.updateProjectionMatrix();
    renderer.setSize(rect.width, rect.height, false);
    render();
  }
  function render() { renderer.render(scene, camera); }
  controls.addEventListener("change", render);
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(stage);
  resize(); controls.update(); setMood("golden");
  const info = () => {
    const categories = {};
    let vertices = 0, triangles = 0, meshes = 0;
    scene.traverse((object) => {
      if (!object.isMesh || !object.geometry?.attributes?.position) return;
      const count = object.geometry.attributes.position.count;
      vertices += count; triangles += object.geometry.index ? object.geometry.index.count / 3 : count / 3; meshes++;
      const key = object.userData.category || "other";
      categories[key] ??= { vertices: 0, meshes: 0 };
      categories[key].vertices += count; categories[key].meshes++;
    });
    return { title: ROOM_TITLE, dimensions: ROOM, mood: currentMood, yardLoaded, vertices, triangles, meshes, drawCallsLastFrame: renderer.info.render.calls, categories, pixelRatio: renderer.getPixelRatio(), canvas: [renderer.domElement.width, renderer.domElement.height], camera: camera.position.toArray(), viewport: [stage.clientWidth, stage.clientHeight] };
  };
  const instance = {
    setMood, resize, render, camera, controls, info,
    setLang: () => {},
    setView: (azimuth = 0) => {
      const offset = camera.position.clone().sub(controls.target);
      const spherical = new THREE.Spherical().setFromVector3(offset);
      spherical.theta = azimuth;
      camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
      controls.update(); render();
    },
    dispose: () => { resizeObserver.disconnect(); controls.dispose(); renderer.dispose(); scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); Object.values(materials).forEach((m) => m.dispose()); },
  };
  onReady(instance);
  return instance;
}
