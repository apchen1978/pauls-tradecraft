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
  materials.ceiling.bumpMap = materials.ceiling.map;
  materials.ceiling.map.repeat.set(1, (ROOM.depth + 1.2) / (8 * 0.14)); // eight boards of 14 cm per tile
  // Brick: the painted tile covers about 2.2 x 1.1 m. The height map (bright brick face, dark joint) is the relief the low sun rakes across.
  paint("room04-brick-red-v1.webp", { repeat: [ROOM.width / 2.2, ROOM.height / 1.1], then: (t) => { materials.brick.map = t; materials.brick.color.set(0xffffff); materials.brick.needsUpdate = true; } });
  paint("room04-brick-red-height-v1.webp", { srgb: false, repeat: [ROOM.width / 2.2, ROOM.height / 1.1], then: (t) => { materials.brick.bumpMap = t; materials.brick.bumpScale = 20; materials.brick.needsUpdate = true; } });
  paint("room04-floor-greybrown-v1.webp", { repeat: [ROOM.width / 1.2, (ROOM.depth + 1.2) / 1.2], then: (t) => { materials.floor.map = t; materials.floor.color.set(0xffffff); materials.floor.needsUpdate = true; } });
  paint("room04-window-xintiandi-morning-v1.webp", { repeat: [1, 1], then: (t) => { t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; materials.street.map = t; materials.street.color.set(0xffffff); materials.street.needsUpdate = true; } });

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
  const reflectiveBase = { steel: 1.0, glass: 1.6, pane: 1.6, stone: 0.35, frame: 0.5 };
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

  // ---------- counter and back bar ----------
  const c = COUNTER, endRadius = (c.z1 - c.z0) / 2;
  box("counter-body", materials.oak, [c.x0, c.x1 - endRadius], [0, c.height - c.top], [c.z0, c.z1]);
  add("counter-end", new THREE.CylinderGeometry(endRadius, endRadius, c.height - c.top, 24), materials.oak, c.x1 - endRadius, (c.height - c.top) / 2, (c.z0 + c.z1) / 2);
  box("counter-top", materials.stone, [c.x0 - 0.03, c.x1 - endRadius], [c.height - c.top, c.height], [c.z0 - 0.03, c.z1 + 0.03]);
  add("counter-top-end", new THREE.CylinderGeometry(endRadius + 0.03, endRadius + 0.03, c.top, 24), materials.stone, c.x1 - endRadius, c.height - c.top / 2, (c.z0 + c.z1) / 2);
  const b = BACK_BAR;
  box("back-bar", materials.olive, [b.x0, b.x1], [0, b.height - b.top], [BACK, BACK + b.depth]);
  box("back-bar-top", materials.stone, [b.x0, b.x1], [b.height - b.top, b.height], [BACK, BACK + b.depth + 0.02]);

  // ---------- on the brick wall ----------
  for (const y of [1.75, 2.15]) box("shelf", materials.oak, [-2.5, -1.0], [y, y + 0.04], [BACK, BACK + 0.24]);
  // Two framed chalk menus. They stay blank: the menu is Paul's to write.
  for (const [x, y, w, h] of [[0.35, 2.05, 1.35, 0.68], [1.95, 1.85, 1.3, 0.62]]) {
    box("menu-frame", materials.oak, [x - w / 2, x + w / 2], [y - h / 2, y + h / 2], [BACK, BACK + 0.04]);
    box("blockout-menu-board", materials.chalk, [x - w / 2 + 0.05, x + w / 2 - 0.05], [y - h / 2 + 0.05, y + h / 2 - 0.05], [BACK + 0.04, BACK + 0.045], { cast: false });
  }
  // The house plaque keeps its place in every room. Stand-in only: the real plaque is the same carved wood one as Rooms 01 to 03.
  box("blockout-house-plaque", materials.oak, [X0, X0 + 0.02], [1.95, 2.17], [-2.05, -1.25], { cast: false });

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
        title: ROOM_TITLE, stage: "section-1-shell", art: [...loadedArt].sort(), mood: currentMood, dimensions: { ...ROOM },
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
