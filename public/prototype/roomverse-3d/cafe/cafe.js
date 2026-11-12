import * as THREE from "../vendor/three.module.min.js";
import { OrbitControls } from "../vendor/OrbitControls.js";
import { mergeGeometries } from "../vendor/BufferGeometryUtils.js";

// Room 04 | Shanghai, Slowly. A small red-brick cafe in Shanghai, just opened for the morning.
// Look brief approved by Paul on 2026-11-13 (arrival = morning white light; red brick, honey oak, grey-brown floor, matte black, brushed steel, olive).
//
// Built in sections, each one finished before the next (Paul, 2026-11-13: Room 03's first week was thin and cost a lot of rework):
//   1. SHELL AND LIGHT: painted brick with real relief, plank ceiling, floor, plaster walls, a window with depth and the painted street,
//      skirting, soft reflections. 2. Counter and back bar. 3. Hero pieces (machine, grinder, pastry case, robot). 4. Story corner. 5. Moods and polish.
// Everything still named "blockout-*" is a plain stand-in that a later section replaces.
// Section 2 (counter and back bar) is built from many small real parts (frames, panels, mouldings, brackets, handles) merged by material, because
// thickness, shadow lines and bevels are what make a room read as 3D. Vertices are not rationed (Paul, 2026-11-13); draw calls are, by merging.
export const ROOM_TITLE = "Room 04｜Shanghai, Slowly";

// Metres. x: left (-) to right (+); z: brick back wall (-) to the visitor (+); y: up.
const ROOM = Object.freeze({ width: 6.4, depth: 4.8, height: 3.0 });
const X0 = -ROOM.width / 2, X1 = ROOM.width / 2, BACK = -ROOM.depth / 2, FRONT = ROOM.depth / 2;
// The street window is in the left wall: 2.4 x 1.6 m (3:2, the proportion of the street painting), three panes across and two down.
const WINDOW = Object.freeze({ z0: -0.9, z1: 1.5, y0: 0.9, y1: 2.5 });
// The customer counter. 1.05 m is a standing cafe counter; the top overhangs the panelled front by 3 cm.
const COUNTER = Object.freeze({ x0: -2.2, x1: 2.5, z0: -0.95, z1: -0.35, height: 1.05, top: 0.04 });
const BACK_BAR = Object.freeze({ x0: -2.6, x1: 3.0, depth: 0.5, height: 0.9, top: 0.03 });

const COLORS = Object.freeze({
  wall: 0xf1ece2, ceiling: 0xf4f1ea, floor: 0xa89a8e, oak: 0xb98a55, olive: 0x4d5d3c, black: 0x2b2e2e,
  steel: 0xd9dddf, stone: 0xeeeae4, plant: 0x5f8a45, terracotta: 0xc4623a, robot: 0xf2f0ea, chalk: 0x2f3334,
});

// Morning: a low, nearly white sun through the street window. Golden hour and the other moods come after the blockout is agreed.
const MOODS = Object.freeze({
  morning: Object.freeze({ sun: 3.0, sunColor: 0xfff3e6, sunPosition: [-7.0, 3.2, 1.8], hemi: 1.3, hemiSky: 0xf3f5f8, hemiGround: 0xd9d0c4, ambient: 0.34, track: 5.0, exposure: 1.0, sky: 0xdfe7ee }),
});

// Plank ceiling drawn on a canvas: white boards 14 cm wide with a dark tongue-and-groove line, used as colour AND bump so the grooves catch the light.
function makePlankTexture() {
  const canvas = document.createElement("canvas"); canvas.width = 512; canvas.height = 512;
  const g = canvas.getContext("2d");
  const boards = 8, h = 512 / boards;
  let seed = 9; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < boards; i++) {
    const k = 236 + Math.round(rnd() * 12);
    g.fillStyle = `rgb(${k},${k - 2},${k - 7})`; g.fillRect(0, i * h, 512, h);
    g.strokeStyle = "rgba(120,110,98,.16)"; g.lineWidth = 1; // a faint grain
    for (let n = 0; n < 5; n++) { const y = i * h + 8 + rnd() * (h - 16); g.beginPath(); g.moveTo(0, y); g.lineTo(512, y + (rnd() - .5) * 4); g.stroke(); }
    g.fillStyle = "rgba(70,62,54,.55)"; g.fillRect(0, i * h, 512, 3); // the groove
    g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(0, i * h + 3, 512, 2); // the lit edge below it
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace; texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.anisotropy = 8;
  return texture;
}
// Plaster: fine noise used only as a bump, so painted walls are not perfectly flat and the low sun rakes across them.
function makePlasterBump() {
  const canvas = document.createElement("canvas"); canvas.width = 256; canvas.height = 256;
  const g = canvas.getContext("2d"), image = g.createImageData(256, 256);
  let seed = 21; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 256 * 256; i++) { const v = 128 + (rnd() - .5) * 70; image.data.set([v, v, v, 255], i * 4); }
  g.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace; texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Texture coordinates in metres, so a grain or a stone vein keeps the same size on every part however it is cut. "grain" is the axis the wood runs along
// (the texture's grain runs along v); on an end face the two tangent axes are used as they come.
function worldUVs(geometry, tile, grain = "y") {
  const p = geometry.attributes.position, n = geometry.attributes.normal, uv = new Float32Array(p.count * 2);
  const axes = { x: 0, y: 1, z: 2 };
  for (let i = 0; i < p.count; i++) {
    const normal = [Math.abs(n.getX(i)), Math.abs(n.getY(i)), Math.abs(n.getZ(i))];
    const dominant = normal.indexOf(Math.max(...normal)), coords = [p.getX(i), p.getY(i), p.getZ(i)];
    const tangents = [0, 1, 2].filter((axis) => axis !== dominant);
    const along = tangents.includes(axes[grain]) ? axes[grain] : tangents[1];
    const across = tangents.find((axis) => axis !== along);
    uv[i * 2] = coords[across] / tile; uv[i * 2 + 1] = coords[along] / tile;
  }
  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
}

// A slab whose outline is a rectangle with one half-round end (a counter) or a plain rectangle, standing on y0 with a rounded bullnose edge.
function footprintGeometry(x0, x1, z0, z1, y0, height, { round = true, bevel = 0 } = {}) {
  const r = (z1 - z0) / 2, zc = (z0 + z1) / 2, shape = new THREE.Shape();
  shape.moveTo(x0, -z0);
  if (round) { shape.lineTo(x1 - r, -z0); shape.absarc(x1 - r, -zc, r, Math.PI / 2, -Math.PI / 2, true); } else { shape.lineTo(x1, -z0); shape.lineTo(x1, -z1); }
  shape.lineTo(x0, -z1); shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: Math.max(0.001, height - 2 * bevel), bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 28 });
  geometry.rotateX(-Math.PI / 2); geometry.translate(0, y0 + bevel, 0);
  geometry.computeVertexNormals();
  return geometry;
}

// A soft dark patch on the floor under a piece of furniture, so it sits on the floor instead of hovering over it.
function makeContactShadowTexture() {
  const canvas = document.createElement("canvas"); canvas.width = 128; canvas.height = 128;
  const g = canvas.getContext("2d");
  g.shadowColor = "rgba(0,0,0,1)"; g.shadowBlur = 22; g.shadowOffsetX = 1000;
  g.fillStyle = "#000"; g.fillRect(28 - 1000, 28, 72, 72);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.NoColorSpace;
  return texture;
}

export async function start({ stage, onReady = () => {} }) {
  const scene = new THREE.Scene();
  const compact = window.innerWidth < 500;
  // Desktop stands at the door, facing the counter a little from the left. The phone stands at the left end and looks ALONG the counter,
  // so the long counter front does not become a slab of wood across a tall, narrow screen (the Room 03 dining-table lesson).
  const DESKTOP_CAMERA = { position: [-0.9, 1.55, 3.05], target: [0.25, 1.3, -1.0], fov: 52 };
  const PORTRAIT_CAMERA = { position: [-2.7, 1.62, 2.15], target: [0.75, 1.22, -1.3], fov: 62 };
  const initial = compact ? PORTRAIT_CAMERA : DESKTOP_CAMERA;
  const camera = new THREE.PerspectiveCamera(initial.fov, 1, 0.05, 40);
  camera.position.set(...initial.position);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, compact ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  stage.replaceChildren(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.enablePan = false;
  controls.target.set(...initial.target);
  controls.minDistance = 2.2; controls.maxDistance = 5.2;
  controls.minPolarAngle = 1.2; controls.maxPolarAngle = 1.62;
  // The visitor's side of the room has no wall in the blockout, so the orbit stays on that side.
  controls.minAzimuthAngle = -1.05; controls.maxAzimuthAngle = 0.75;

  // Painted textures (Codex, cards 45 and 46) are given to a material only when they have loaded, so nothing flashes black; until then the material
  // keeps a flat colour of the same family.
  const textureLoader = new THREE.TextureLoader();
  const artBase = new URL("./art/", import.meta.url).href;
  const loadedArt = new Set();
  const maxAnisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  function paint(file, { srgb = true, repeat = [1, 1], then } = {}) {
    textureLoader.load(artBase + file, (texture) => {
      texture.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.anisotropy = maxAnisotropy; texture.repeat.set(...repeat);
      loadedArt.add(file); then(texture); render();
    });
  }
  const plaster = makePlasterBump(); plaster.repeat.set(ROOM.width / 1.0, ROOM.height / 1.0);
  const materials = {
    wall: new THREE.MeshStandardMaterial({ color: COLORS.wall, roughness: 0.95, bumpMap: plaster, bumpScale: 0.6 }),
    ceiling: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, map: makePlankTexture(), bumpScale: 1.4, emissive: COLORS.ceiling, emissiveIntensity: 0.16 }), // a ceiling faces away from every light; a little glow stands in for light bounced up off the floor
    floor: new THREE.MeshStandardMaterial({ color: COLORS.floor, roughness: 0.62 }),
    brick: new THREE.MeshStandardMaterial({ color: 0x9a4f33, roughness: 0.93 }),
    oak: new THREE.MeshStandardMaterial({ color: COLORS.oak, roughness: 0.68 }),
    oakDeep: new THREE.MeshStandardMaterial({ color: 0xa5773f, roughness: 0.78 }), // the recessed panel fields: a shade darker than the frames around them
    oakDark: new THREE.MeshStandardMaterial({ color: 0x4a3524, roughness: 0.8 }), // the toe-kicks
    olive: new THREE.MeshStandardMaterial({ color: COLORS.olive, roughness: 0.75 }),
    black: new THREE.MeshStandardMaterial({ color: COLORS.black, roughness: 0.6 }),
    frame: new THREE.MeshStandardMaterial({ color: 0x24272a, roughness: 0.5, metalness: 0.2 }),
    steel: new THREE.MeshStandardMaterial({ color: COLORS.steel, roughness: 0.34, metalness: 0.9 }),
    stone: new THREE.MeshStandardMaterial({ color: COLORS.stone, roughness: 0.5 }),
    trim: new THREE.MeshStandardMaterial({ color: 0xf6f2ea, roughness: 0.7 }),
    chalk: new THREE.MeshStandardMaterial({ color: COLORS.chalk, roughness: 0.95 }),
    plant: new THREE.MeshStandardMaterial({ color: COLORS.plant, roughness: 0.9 }),
    white: new THREE.MeshStandardMaterial({ color: COLORS.robot, roughness: 0.55 }),
    terracotta: new THREE.MeshStandardMaterial({ color: COLORS.terracotta, roughness: 0.7 }),
    glass: new THREE.MeshStandardMaterial({ color: 0xdfeaf0, roughness: 0.08, transparent: true, opacity: 0.34, depthWrite: false, side: THREE.DoubleSide }),
    pane: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.04, transparent: true, opacity: 0.07, depthWrite: false }),
    street: new THREE.MeshBasicMaterial({ color: MOODS.morning.sky }),
  };
  materials.menuA = new THREE.MeshStandardMaterial({ color: 0x2c302f, roughness: 0.96 });
  materials.menuB = new THREE.MeshStandardMaterial({ color: 0x2c302f, roughness: 0.96 });
  materials.ceiling.bumpMap = materials.ceiling.map;
  materials.ceiling.map.repeat.set(1, (ROOM.depth + 1.2) / (8 * 0.14)); // eight boards of 14 cm per tile
  // Brick: the painted tile covers about 2.2 x 1.1 m. The height map (bright brick face, dark joint) is the relief the low sun rakes across.
  paint("room04-brick-red-v1.webp", { repeat: [ROOM.width / 2.2, ROOM.height / 1.1], then: (t) => { materials.brick.map = t; materials.brick.color.set(0xffffff); materials.brick.needsUpdate = true; } });
  paint("room04-brick-red-height-v1.webp", { srgb: false, repeat: [ROOM.width / 2.2, ROOM.height / 1.1], then: (t) => { materials.brick.bumpMap = t; materials.brick.bumpScale = 20; materials.brick.needsUpdate = true; } });
  paint("room04-floor-greybrown-v1.webp", { repeat: [ROOM.width / 1.2, (ROOM.depth + 1.2) / 1.2], then: (t) => { materials.floor.map = t; materials.floor.color.set(0xffffff); materials.floor.needsUpdate = true; } });
  paint("room04-window-xintiandi-morning-v1.webp", { repeat: [1, 1], then: (t) => { t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; materials.street.map = t; materials.street.color.set(0xffffff); materials.street.needsUpdate = true; } });

  paint("room04-oak-panel-v1.webp", { then: (t) => { materials.oak.map = t; materials.oak.color.set(0xffffff); materials.oak.needsUpdate = true; materials.oakDeep.map = t; materials.oakDeep.color.set(0xe0bd90); materials.oakDeep.needsUpdate = true; } });
  paint("room04-counter-stone-v1.webp", { then: (t) => { materials.stone.map = t; materials.stone.color.set(0xffffff); materials.stone.needsUpdate = true; } });
  paint("room04-menu-board-a-v1.webp", { then: (t) => { t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; materials.menuA.map = t; materials.menuA.color.set(0xffffff); materials.menuA.needsUpdate = true; } });
  paint("room04-menu-board-b-v1.webp", { then: (t) => { t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; materials.menuB.map = t; materials.menuB.color.set(0xffffff); materials.menuB.needsUpdate = true; } });

  // Soft reflections (the Room 03 recipe): a tiny made-up room (pale ceiling, warm floor, one bright window panel) baked into an environment map and
  // given ONLY to the metals, glass and stone. scene.environment stays unset so walls, wood and brick keep their exact lighting.
  const reflectionEnv = (() => {
    const room = new THREE.Scene();
    const cv = document.createElement("canvas"); cv.width = 8; cv.height = 256;
    const ctx = cv.getContext("2d"), g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, "#fbf6ec"); g.addColorStop(0.5, "#d8d0c0"); g.addColorStop(1, "#a88c6a");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 8, 256);
    const gradient = new THREE.CanvasTexture(cv); gradient.colorSpace = THREE.SRGBColorSpace;
    room.add(new THREE.Mesh(new THREE.BoxGeometry(8, 5, 8), new THREE.MeshBasicMaterial({ map: gradient, side: THREE.BackSide })));
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.7), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    panel.position.set(-3.9, 0.4, 0); panel.rotation.y = Math.PI / 2; room.add(panel); // the street window, on the left like the real one
    const pmrem = new THREE.PMREMGenerator(renderer);
    const texture = pmrem.fromScene(room, 0.04).texture; pmrem.dispose();
    return texture;
  })();
  const reflectiveBase = { steel: 1.5, glass: 1.6, pane: 1.6, stone: 0.35, frame: 0.5 };
  for (const [key, intensity] of Object.entries(reflectiveBase)) { materials[key].envMap = reflectionEnv; materials[key].envMapIntensity = intensity; }

  const add = (name, geometry, material, x, y, z, { cast = true, receive = true } = {}) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name; mesh.position.set(x, y, z); mesh.castShadow = cast; mesh.receiveShadow = receive;
    scene.add(mesh); return mesh;
  };
  const box = (name, material, [x0, x1], [y0, y1], [z0, z1], options) =>
    add(name, new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), material, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, options);

  // ---------- shell ----------
  const LEFT_WALL = 0.22; // thick enough to give the window a real reveal (the glass sits 11 cm inside the opening)
  box("floor", materials.floor, [X0, X1], [-0.05, 0], [BACK, FRONT + 1.2], { cast: false });
  box("ceiling", materials.ceiling, [X0, X1], [ROOM.height, ROOM.height + 0.05], [BACK, FRONT + 1.2], { receive: false });
  box("brick-wall", materials.brick, [X0, X1], [0, ROOM.height], [BACK - 0.1, BACK]);
  box("right-wall", materials.wall, [X1, X1 + 0.1], [0, ROOM.height], [BACK, FRONT + 1.2]);
  // The left wall is four pieces around the window opening, so the sun really comes through the hole and the wall shades the rest.
  box("left-wall-below", materials.wall, [X0 - LEFT_WALL, X0], [0, WINDOW.y0], [BACK, FRONT + 1.2]);
  box("left-wall-above", materials.wall, [X0 - LEFT_WALL, X0], [WINDOW.y1, ROOM.height], [BACK, FRONT + 1.2]);
  box("left-wall-back", materials.wall, [X0 - LEFT_WALL, X0], [WINDOW.y0, WINDOW.y1], [BACK, WINDOW.z0]);
  box("left-wall-front", materials.wall, [X0 - LEFT_WALL, X0], [WINDOW.y0, WINDOW.y1], [WINDOW.z1, FRONT + 1.2]);
  // Black steel glazing: an outer frame, two uprights and one rail, 5 cm wide and 6 cm deep, set at the glass plane inside the reveal.
  const wz = WINDOW.z1 - WINDOW.z0, wy = WINDOW.y1 - WINDOW.y0, GLASS_X = X0 - 0.11, bar = 0.05, barDepth = 0.06;
  const bars = [];
  const addBar = (x0, x1, y0, y1, z0, z1) => bars.push(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2));
  for (const z of [WINDOW.z0 + bar / 2, WINDOW.z0 + wz / 3, WINDOW.z0 + wz * 2 / 3, WINDOW.z1 - bar / 2]) addBar(GLASS_X - barDepth / 2, GLASS_X + barDepth / 2, WINDOW.y0, WINDOW.y1, z - bar / 2, z + bar / 2);
  for (const y of [WINDOW.y0 + bar / 2, WINDOW.y0 + wy / 2, WINDOW.y1 - bar / 2]) addBar(GLASS_X - barDepth / 2, GLASS_X + barDepth / 2, y - bar / 2, y + bar / 2, WINDOW.z0, WINDOW.z1);
  add("window-frame", mergeGeometries(bars), materials.frame, 0, 0, 0); // one mesh for all seven bars
  add("window-glass", new THREE.PlaneGeometry(wz, wy), materials.pane, GLASS_X, (WINDOW.y0 + WINDOW.y1) / 2, (WINDOW.z0 + WINDOW.z1) / 2, { cast: false, receive: false }).rotation.y = Math.PI / 2;
  // An oak sill that sticks 7 cm into the room, and a thin apron under it, so the window reads as built into a thick wall.
  box("window-sill", materials.oak, [X0 - 0.11, X0 + 0.07], [WINDOW.y0 - 0.035, WINDOW.y0 + 0.005], [WINDOW.z0 - 0.06, WINDOW.z1 + 0.06]);
  box("window-apron", materials.trim, [X0, X0 + 0.02], [WINDOW.y0 - 0.14, WINDOW.y0 - 0.035], [WINDOW.z0 - 0.02, WINDOW.z1 + 0.02]);
  // The painted street (Codex card 45) hangs 1.35 m outside the wall: far enough to read as a street, near enough to fill the opening from where the visitor stands.
  const streetW = 4.5, streetH = streetW / 1.5;
  const street = add("window-street-view", new THREE.PlaneGeometry(streetW, streetH), materials.street, X0 - 1.35, (WINDOW.y0 + WINDOW.y1) / 2 + 0.05, (WINDOW.z0 + WINDOW.z1) / 2, { cast: false, receive: false });
  street.rotation.y = Math.PI / 2; // faces +x, into the room
  // Skirting: 11 cm high and 2 cm thick on the side walls and the two exposed ends of the brick wall, merged into one mesh.
  const skirting = [], skirtH = 0.11, skirtT = 0.02;
  const addSkirt = (x0, x1, z0, z1) => skirting.push(new THREE.BoxGeometry(x1 - x0, skirtH, z1 - z0).translate((x0 + x1) / 2, skirtH / 2, (z0 + z1) / 2));
  addSkirt(X0, X0 + skirtT, BACK, FRONT + 1.2); addSkirt(X1 - skirtT, X1, BACK, FRONT + 1.2);
  addSkirt(X0, BACK_BAR.x0, BACK, BACK + skirtT); addSkirt(BACK_BAR.x1, X1, BACK, BACK + skirtT);
  add("skirting", mergeGeometries(skirting), materials.trim, 0, 0, 0);

  // ---------- counter and back bar (section 2) ----------
  // Every part below is real-sized geometry in world coordinates, collected per material and merged, so the whole section costs a handful of draw calls.
  const parts = new Map();
  const part = (key, geometry, { tile = 0.9, grain = "y" } = {}) => {
    const g = geometry.index ? geometry.toNonIndexed() : geometry;
    worldUVs(g, tile, grain);
    if (!parts.has(key)) parts.set(key, []);
    parts.get(key).push(g);
  };
  const slab = (key, [x0, x1], [y0, y1], [z0, z1], options) => part(key, new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), options);
  const flush = (prefix) => { for (const [key, list] of parts) add(`${prefix}-${key}`, mergeGeometries(list), materials[key], 0, 0, 0); parts.clear(); };

  const c = COUNTER, endRadius = (c.z1 - c.z0) / 2, zc = (c.z0 + c.z1) / 2, arcX = c.x1 - endRadius;
  const bodyY0 = 0.10, bodyY1 = c.height - c.top; // a 10 cm recessed toe-kick, then the body up to the stone
  // Plinth, body and stone top follow one outline: a straight run with a half-round right end.
  part("oakDark", footprintGeometry(c.x0 + 0.04, c.x1 - 0.04, c.z0 + 0.04, c.z1 - 0.04, 0, bodyY0 + 0.01), { tile: 1 });
  part("oak", footprintGeometry(c.x0, c.x1, c.z0, c.z1, bodyY0, bodyY1 - bodyY0), { tile: 0.9, grain: "y" });
  part("stone", footprintGeometry(c.x0 - 0.03, c.x1 + 0.03, c.z0 - 0.03, c.z1 + 0.03, bodyY1, c.top, { bevel: 0.013 }), { tile: 1 });
  // Raised-and-fielded front: stiles and rails 2.2 cm proud of the body, and a 1.2 cm bevel moulding framing each recessed panel.
  const fz = c.z1, bays = 5, run = arcX - c.x0, bayW = run / bays, stile = 0.07, proud = 0.022;
  slab("oak", [c.x0, arcX], [bodyY1 - 0.09, bodyY1], [fz, fz + proud], { grain: "x" }); // top rail
  slab("oak", [c.x0, arcX], [bodyY0, bodyY0 + 0.11], [fz, fz + proud], { grain: "x" }); // bottom rail
  for (let i = 0; i <= bays; i++) {
    const x = c.x0 + i * bayW, half = i === 0 || i === bays ? stile : stile / 2;
    slab("oak", [i === 0 ? x : x - half, i === bays ? x : x + half], [bodyY0 + 0.11, bodyY1 - 0.09], [fz, fz + proud], { grain: "y" });
  }
  for (let i = 0; i < bays; i++) {
    const xa = c.x0 + i * bayW + (i === 0 ? stile : stile / 2), xb = c.x0 + (i + 1) * bayW - (i === bays - 1 ? stile : stile / 2), ya = bodyY0 + 0.11, yb = bodyY1 - 0.09, m = 0.022, d = 0.012;
    slab("oak", [xa, xb], [ya, ya + m], [fz, fz + d], { grain: "x" }); slab("oak", [xa, xb], [yb - m, yb], [fz, fz + d], { grain: "x" });
    slab("oak", [xa, xa + m], [ya + m, yb - m], [fz, fz + d], { grain: "y" }); slab("oak", [xb - m, xb], [ya + m, yb - m], [fz, fz + d], { grain: "y" });
    slab("oakDeep", [xa + m, xb - m], [ya + m, yb - m], [fz, fz + 0.003], { grain: "y" }); // the recessed field
  }
  // The half-round end: seven stiles standing on the curve and a top and bottom rail wrapped around it.
  for (let k = 0; k <= 6; k++) {
    const theta = Math.PI / 2 - k * (Math.PI / 6); // from the front (+z) round to the back
    const g = new THREE.BoxGeometry(0.06, bodyY1 - bodyY0, proud).rotateY(Math.PI / 2 - theta).translate(arcX + (endRadius + proud / 2) * Math.cos(theta), (bodyY0 + bodyY1) / 2, zc + (endRadius + proud / 2) * Math.sin(theta));
    part("oak", g, { grain: "y" });
  }
  const wrap = (y0, y1) => part("oak", new THREE.CylinderGeometry(endRadius + proud, endRadius + proud, y1 - y0, 36, 1, true, 0, Math.PI).translate(arcX, (y0 + y1) / 2, zc), { grain: "x" });
  wrap(bodyY1 - 0.09, bodyY1); wrap(bodyY0, bodyY0 + 0.11);
  // A brushed-steel foot rail 20 cm off the floor on four arms: a real bar detail that also throws a long shadow line down the front.
  const railZ = fz + 0.14, railY = 0.2;
  part("steel", new THREE.CylinderGeometry(0.024, 0.024, run - 0.5, 20).rotateZ(Math.PI / 2).translate((c.x0 + 0.25 + arcX - 0.25) / 2, railY, railZ), { tile: 1 });
  for (const t of [0.04, 0.36, 0.64, 0.96]) {
    const x = c.x0 + 0.25 + t * (run - 0.5);
    slab("steel", [x - 0.014, x + 0.014], [railY - 0.014, railY + 0.014], [fz, railZ]);
    part("steel", new THREE.CylinderGeometry(0.03, 0.03, 0.012, 16).rotateX(Math.PI / 2).translate(x, railY, fz + 0.006), { tile: 1 });
  }

  // Back bar along the brick wall: olive shaker doors on a 10 cm toe-kick under a bullnosed stone top.
  const bb = BACK_BAR, bbFront = BACK + bb.depth, bbTop = bb.height - bb.top;
  part("oakDark", footprintGeometry(bb.x0 + 0.03, bb.x1 - 0.03, BACK, bbFront - 0.04, 0, 0.11, { round: false }), { tile: 1 });
  part("olive", footprintGeometry(bb.x0, bb.x1, BACK, bbFront - 0.02, 0.1, bbTop - 0.1, { round: false }));
  part("stone", footprintGeometry(bb.x0 - 0.01, bb.x1 + 0.01, BACK, bbFront + 0.025, bbTop, bb.top, { round: false, bevel: 0.009 }), { tile: 1 });
  const doors = 8, doorW = (bb.x1 - bb.x0) / doors, gap = 0.006, doorY0 = 0.11, doorY1 = bbTop - 0.012, fzb = bbFront - 0.02, frameW = 0.062, thick = 0.02;
  for (let i = 0; i < doors; i++) {
    const xa = bb.x0 + i * doorW + gap / 2, xb = bb.x0 + (i + 1) * doorW - gap / 2;
    slab("olive", [xa, xb], [doorY0, doorY0 + frameW], [fzb, fzb + thick]); slab("olive", [xa, xb], [doorY1 - frameW, doorY1], [fzb, fzb + thick]);
    slab("olive", [xa, xa + frameW], [doorY0 + frameW, doorY1 - frameW], [fzb, fzb + thick]); slab("olive", [xb - frameW, xb], [doorY0 + frameW, doorY1 - frameW], [fzb, fzb + thick]);
    slab("olive", [xa + frameW, xb - frameW], [doorY0 + frameW, doorY1 - frameW], [fzb, fzb + thick - 0.011]); // the recessed panel
    const hx = i % 2 === 0 ? xb - frameW / 2 : xa + frameW / 2; // handles sit beside the meeting edge of each pair
    slab("black", [hx - 0.006, hx + 0.006], [doorY1 - frameW - 0.19, doorY1 - frameW - 0.03], [fzb + thick + 0.02, fzb + thick + 0.032]);
    slab("black", [hx - 0.006, hx + 0.006], [doorY1 - frameW - 0.19, doorY1 - frameW - 0.178], [fzb + thick, fzb + thick + 0.02]); slab("black", [hx - 0.006, hx + 0.006], [doorY1 - frameW - 0.042, doorY1 - frameW - 0.03], [fzb + thick, fzb + thick + 0.02]);
  }

  // ---------- on the brick wall: two shelves on black brackets, two framed chalk menus, the house plaque ----------
  for (const y of [1.75, 2.15]) {
    part("oak", new THREE.BoxGeometry(1.5, 0.035, 0.24).translate(-1.75, y + 0.0175, BACK + 0.12), { grain: "x" });
    for (const x of [-2.4, -1.75, -1.1]) { slab("black", [x - 0.008, x + 0.008], [y - 0.16, y], [BACK, BACK + 0.012]); slab("black", [x - 0.008, x + 0.008], [y - 0.012, y], [BACK, BACK + 0.2]); slab("black", [x - 0.008, x + 0.008], [y - 0.16, y - 0.012], [BACK + 0.012, BACK + 0.02]); }
  }
  const menus = [{ x: 0.35, y: 2.05, w: 1.35, h: 0.68, key: "menuA" }, { x: 1.95, y: 1.85, w: 1.3, h: 0.62, key: "menuB" }];
  for (const m of menus) {
    const fw = 0.05, depth = 0.04;
    slab("oak", [m.x - m.w / 2, m.x + m.w / 2], [m.y + m.h / 2 - fw, m.y + m.h / 2], [BACK, BACK + depth], { grain: "x" }); slab("oak", [m.x - m.w / 2, m.x + m.w / 2], [m.y - m.h / 2, m.y - m.h / 2 + fw], [BACK, BACK + depth], { grain: "x" });
    slab("oak", [m.x - m.w / 2, m.x - m.w / 2 + fw], [m.y - m.h / 2 + fw, m.y + m.h / 2 - fw], [BACK, BACK + depth], { grain: "y" }); slab("oak", [m.x + m.w / 2 - fw, m.x + m.w / 2], [m.y - m.h / 2 + fw, m.y + m.h / 2 - fw], [BACK, BACK + depth], { grain: "y" });
    slab("oak", [m.x - m.w * 0.4, m.x + m.w * 0.4], [m.y - m.h / 2 - 0.02, m.y - m.h / 2], [BACK, BACK + 0.1], { grain: "x" }); // a chalk ledge under each board
    const board = add(`menu-board-${m.key === "menuA" ? "a" : "b"}`, new THREE.PlaneGeometry(m.w - 2 * fw, m.h - 2 * fw), materials[m.key], m.x, m.y, BACK + 0.012, { cast: false });
    board.position.z = BACK + 0.012;
  }
  box("blockout-house-plaque", materials.oak, [X0, X0 + 0.02], [1.95, 2.17], [-2.05, -1.25], { cast: false });
  flush("section2");

  // Soft contact shadows on the floor under the counter and the back bar.
  const contactTexture = makeContactShadowTexture();
  const contact = (name, x0, x1, z0, z1, opacity) => {
    const mesh = add(name, new THREE.PlaneGeometry(x1 - x0, z1 - z0), new THREE.MeshBasicMaterial({ map: contactTexture, transparent: true, opacity, depthWrite: false, color: 0x000000 }), (x0 + x1) / 2, 0.004, (z0 + z1) / 2, { cast: false, receive: false });
    mesh.rotation.x = -Math.PI / 2; mesh.renderOrder = 1;
  };
  contact("counter-contact-shadow", c.x0 - 0.35, c.x1 + 0.35, c.z0 - 0.35, c.z1 + 0.45, 0.5);
  contact("back-bar-contact-shadow", bb.x0 - 0.3, bb.x1 + 0.3, BACK - 0.05, bbFront + 0.4, 0.42);

  // ---------- hero stand-ins (plain shapes at the real sizes; each becomes a detailed piece later) ----------
  const top = c.height;
  // Two-group espresso machine: about 75 cm wide, 42 cm tall, 50 cm deep, cups warming on top.
  box("blockout-espresso-machine", materials.steel, [-1.4, -0.65], [top + 0.06, top + 0.48], [c.z0 + 0.04, c.z0 + 0.54]);
  box("blockout-espresso-feet", materials.black, [-1.36, -0.69], [top, top + 0.06], [c.z0 + 0.08, c.z0 + 0.5]);
  for (let i = 0; i < 4; i++) add("blockout-cup", new THREE.CylinderGeometry(0.045, 0.035, 0.07, 16), materials.white, -1.27 + i * 0.165, top + 0.515, c.z0 + 0.3);
  // Grinder: a black body and a clear hopper.
  box("blockout-grinder", materials.black, [-1.92, -1.7], [top, top + 0.34], [c.z0 + 0.16, c.z0 + 0.42]);
  add("blockout-grinder-hopper", new THREE.CylinderGeometry(0.1, 0.07, 0.18, 20), materials.glass, -1.81, top + 0.43, c.z0 + 0.29, { cast: false });
  // Curved glass pastry case on an oak base: 1.1 m wide, 50 cm tall.
  box("blockout-pastry-base", materials.oak, [1.2, 2.3], [top, top + 0.04], [c.z0 + 0.06, c.z1 - 0.04]);
  const dome = add("blockout-pastry-case", new THREE.CylinderGeometry(0.25, 0.25, 1.06, 28, 1, false, 0, Math.PI), materials.glass, 1.75, top + 0.04, (c.z0 + c.z1) / 2 + 0.01, { cast: false });
  dome.rotation.z = Math.PI / 2; dome.rotation.y = Math.PI / 2; dome.scale.set(1, 1, 1.9);
  box("blockout-pastry-shelf", materials.glass, [1.25, 2.25], [top + 0.27, top + 0.28], [c.z0 + 0.12, c.z1 - 0.1], { cast: false });
  // The robot barista stands BEHIND the counter. It is about 60 cm tall, so it stands on a crate to clear a 1.05 m counter:
  // only its upper half shows from the visitor's side. It stands right of the machine: further left, the machine hides it from the phone's view along the counter.
  box("blockout-robot-crate", materials.oak, [0.5, 1.1], [0, 0.86], [-1.75, -1.2]);
  const robot = add("blockout-robot", new THREE.CapsuleGeometry(0.2, 0.2, 8, 20), materials.white, 0.8, 0.86 + 0.3, -1.45);
  box("blockout-robot-visor", materials.black, [0.68, 0.92], [1.22, 1.32], [-1.27, -1.25], { cast: false });
  add("blockout-robot-band", new THREE.CylinderGeometry(0.205, 0.205, 0.04, 24), materials.terracotta, 0.8, 1.0, -1.45, { cast: false });
  // One floor plant under the window, as in the approved look. It stands clear of the phone's standing spot (front left corner),
  // where a plant filled a third of the screen, and its leaves add a soft shadow to the pane light on the floor.
  add("blockout-plant-pot", new THREE.CylinderGeometry(0.17, 0.13, 0.42, 20), materials.white, -2.85, 0.21, 0.3);
  add("blockout-plant", new THREE.SphereGeometry(0.36, 16, 12), materials.plant, -2.85, 1.0, 0.3).scale.set(0.8, 1.5, 0.8);

  // ---------- lights ----------
  // Track light over the counter: one black rail and four heads. The warmest light in the room is the one on the menus.
  box("track-rail", materials.black, [-1.6, 2.6], [ROOM.height - 0.06, ROOM.height - 0.03], [-0.42, -0.38], { cast: false, receive: false });
  const trackLights = [];
  for (const x of [-1.2, 0.0, 1.2, 2.4]) {
    add("track-head", new THREE.CylinderGeometry(0.045, 0.055, 0.14, 16), materials.black, x, ROOM.height - 0.16, -0.4, { cast: false, receive: false }).rotation.x = 0.5;
    const spot = new THREE.SpotLight(0xffd9a8, 0, 5, 0.55, 0.7, 1.6);
    spot.position.set(x, ROOM.height - 0.2, -0.4); spot.target.position.set(x + 0.1, 1.7, BACK);
    scene.add(spot, spot.target); trackLights.push(spot);
  }
  const hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 1); scene.add(hemi);
  const ambient = new THREE.AmbientLight(0xffffff, 0.2); scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02; sun.shadow.radius = 3;
  Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 4, bottom: -4, near: 0.5, far: 16 });
  sun.target.position.set(0.5, 0, -0.6);
  scene.add(sun, sun.target);

  let currentMood = "morning";
  function setMood(name) {
    const look = MOODS[name]; if (!look) return false;
    currentMood = name;
    sun.intensity = look.sun; sun.color.setHex(look.sunColor); sun.position.set(...look.sunPosition);
    hemi.intensity = look.hemi; hemi.color.setHex(look.hemiSky); hemi.groundColor.setHex(look.hemiGround);
    ambient.intensity = look.ambient;
    for (const spot of trackLights) spot.intensity = look.track;
    renderer.toneMappingExposure = look.exposure;
    scene.background = new THREE.Color(look.sky); if (!materials.street.map) materials.street.color.setHex(look.sky);
    render(); return true;
  }

  let frames = 0;
  function render() { renderer.render(scene, camera); frames++; }
  function resize() {
    const rect = stage.getBoundingClientRect(); if (!rect.width || !rect.height) return;
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height; camera.updateProjectionMatrix();
    render();
  }
  // One render per animation frame while the camera is moving, none while it rests (same rule as the other rooms).
  let looping = false;
  const loop = () => { if (controls.update()) { render(); requestAnimationFrame(loop); } else { render(); looping = false; } };
  controls.addEventListener("start", () => { if (!looping) { looping = true; requestAnimationFrame(loop); } });
  new ResizeObserver(resize).observe(stage);
  // The room only draws when something changes, so a restored WebGL context (a phone coming back from the background) would stay blank.
  renderer.domElement.addEventListener("webglcontextrestored", () => requestAnimationFrame(() => { setMood(currentMood); resize(); }));

  controls.update(); setMood("morning"); resize();

  const instance = {
    camera, controls, render, resize, setMood,
    moods: () => Object.keys(MOODS),
    info() {
      let vertices = 0, meshes = 0;
      scene.traverse((object) => { if (object.isMesh) { meshes++; vertices += object.geometry.attributes.position.count; } });
      render();
      const blockout = []; scene.traverse((object) => { if (object.isMesh && object.name.startsWith("blockout-") && !blockout.includes(object.name)) blockout.push(object.name); });
      return {
        title: ROOM_TITLE, stage: "section-2-counter", art: [...loadedArt].sort(), mood: currentMood, dimensions: { ...ROOM },
        vertices, meshes, drawCalls: renderer.info.render.calls, renderFrame: frames,
        counter: { lengthMm: Math.round((COUNTER.x1 - COUNTER.x0) * 1000), heightMm: Math.round(COUNTER.height * 1000), depthMm: Math.round((COUNTER.z1 - COUNTER.z0) * 1000) },
        window: { widthMm: Math.round(wz * 1000), heightMm: Math.round(wy * 1000), sillMm: Math.round(WINDOW.y0 * 1000) },
        robot: { headTopMm: Math.round((robot.position.y + 0.3) * 1000), aboveCounterMm: Math.round((robot.position.y + 0.3 - COUNTER.height) * 1000) },
        blockout,
      };
    },
    dispose() { renderer.dispose(); },
  };
  onReady(instance);
  return instance;
}
