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
// Section 3 (hero pieces) follows the design sheets Codex drew in card 46: every piece is modelled from rounded profiles, lathes, rods and discs.
// Section 4 (the story corner) puts a window seat, a draped coat, an open notebook, steaming cups, plants and shelf things where "someone was just here".
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

// Five moods. Morning is the arrival (Paul, 2026-11-13: A, the white early light); golden hour is the warm look from concept B and stays a choice.
// Each mood sets the sun, the sky fill, the track lights, a tint on the street painting (until Codex paints one street per mood) and how strongly the steel and glass reflect.
// sunPosition: x negative is the street side. street: a multiplier colour for the painted street. lamp: a warm point light over the counter.
const MOODS = Object.freeze({
  morning: Object.freeze({ sun: 3.0, sunColor: 0xfff3e6, sunPosition: [-7.0, 3.2, 1.8], hemi: 1.3, hemiSky: 0xf3f5f8, hemiGround: 0xd9d0c4, ambient: 0.34, track: 5.0, trackColor: 0xffd9a8, exposure: 1.0, sky: 0xdfe7ee, street: 0xffffff, lamp: 0, reflect: 1, pendant: 0.12, shaft: 0.1, steam: 0.3 }),
  noon: Object.freeze({ sun: 3.6, sunColor: 0xffffff, sunPosition: [-5.0, 6.6, 1.0], hemi: 1.5, hemiSky: 0xf7f9fc, hemiGround: 0xe0d8cc, ambient: 0.38, track: 2.5, trackColor: 0xfff0dc, exposure: 1.0, sky: 0xe6eef5, street: 0xfff8ec, lamp: 0, reflect: 1.1, pendant: 0.05, shaft: 0.05, steam: 0.18 }),
  golden: Object.freeze({ sun: 3.6, sunColor: 0xffb866, sunPosition: [-7.0, 1.5, 1.2], hemi: 0.85, hemiSky: 0xffe2c0, hemiGround: 0xcaa07a, ambient: 0.22, track: 6.5, trackColor: 0xffc98a, exposure: 1.08, sky: 0xf0c9a0, street: 0xfff0e0, lamp: 0.6, reflect: 0.85, pendant: 0.45, shaft: 0.18, steam: 0.36 }),
  rain: Object.freeze({ sun: 0, sunColor: 0xdbe6f2, sunPosition: [-6.0, 4.0, 1.5], hemi: 1.05, hemiSky: 0xcfd9e4, hemiGround: 0x9a958d, ambient: 0.3, track: 8.0, trackColor: 0xffd7a0, exposure: 1.0, sky: 0xb9c4ce, street: 0xffffff, lamp: 0.9, reflect: 0.7, pendant: 0.85, shaft: 0, steam: 0.4, rain: true }),
  closing: Object.freeze({ sun: 0, sunColor: 0x8fa4d6, sunPosition: [-6.0, 3.0, 1.5], hemi: 0.5, hemiSky: 0x7a8bb4, hemiGround: 0x453f4a, ambient: 0.16, track: 11.0, trackColor: 0xffc27a, exposure: 1.12, sky: 0x2c3550, street: 0xc4cce6, lamp: 3.4, reflect: 0.45, pendant: 1.4, shaft: 0, steam: 0.42 }),
});

// The looks (Paul, 2026-11-13: a "random cafe" like the random look of Rooms 01 to 03). Each group swaps colours or tints on existing materials, so a swap costs no
// geometry and no draw call. A tint is a multiplier on the painted texture (values above 1 lift a channel), a colour replaces the flat colour.
export const LOOK_GROUPS = Object.freeze({
  brick: Object.freeze({ red: [1, 1, 1], umber: [0.9, 0.78, 0.64], grey: [0.78, 1.75, 2.6], dusty: [1.2, 2.7, 3.9] }),
  counter: Object.freeze({ honey: [1, 1, 1], walnut: [0.55, 0.43, 0.35], pale: [1.1, 1.3, 1.65], grey: [0.95, 1.2, 1.5] }),
  back: Object.freeze({ olive: 0x4d5d3c, navy: 0x2f4560, terracotta: 0xa5563b, charcoal: 0x3a3d3f, sage: 0x88977a }),
  wainscot: Object.freeze({ same: null, olive: 0x4d5d3c, navy: 0x2f4560, terracotta: 0xa5563b, charcoal: 0x3a3d3f, sage: 0x88977a, cream: 0xe4d8c0, walnut: 0x5a3d2b, oat: 0xc9b896 }),
  wall: Object.freeze({ warm: 0xf1ece2, blush: 0xf0dcd4, mist: 0xdde5e2, butter: 0xf3e6c4, grey: 0xdad8d4 }),
  floor: Object.freeze({ greybrown: [1, 1, 1], warmoak: [1.25, 1.0, 0.78], walnut: [0.62, 0.52, 0.46], pale: [1.18, 1.16, 1.12] }),
  lamp: Object.freeze({ rattan: 0xd9bb82, paper: 0xf2ede2, black: 0x2b2b2c }),
  scarf: Object.freeze({ olive: 0x66763f, terracotta: 0xc4623a, mustard: 0xd6a43a, navy: 0x2f4560, rose: 0xd49a96 }),
  chair: Object.freeze({ bentwood: 0x9a6a3a, black: 0x2a2a2c, natural: 0xc9a06a }),
  // Room 01's wallpapers, shared from ../tex/: [file, metres per tile]. "none" keeps the painted wall colour.
  wallpaper: Object.freeze({ none: null, stripe: ["wallpaper-stripe-v1.webp", 1.0], botanical: ["wallpaper-botanical-v1.webp", 1.5], grasscloth: ["wallpaper-grasscloth-oat-v1.webp", 2.2], sagewash: ["wallpaper-sage-limewash-v1.webp", 2.4] }),
});
export const DEFAULT_LOOK = Object.freeze({ brick: "red", counter: "honey", back: "olive", wall: "warm", floor: "greybrown", lamp: "rattan", scarf: "olive", chair: "bentwood", wallpaper: "none", wainscot: "same" });
// What goes well below each of Room 01's wallpapers (the first is the pick a new choice of paper switches to): never simply the green again.
export const WAINSCOT_FOR_PAPER = Object.freeze({ stripe: ["navy", "charcoal", "walnut"], botanical: ["terracotta", "walnut", "oat"], grasscloth: ["navy", "walnut", "olive"], sagewash: ["cream", "charcoal", "walnut"] });

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

// A box with rounded vertical edges: a rounded-rectangle profile (w x h) extruded d deep along +z, centred on the origin.
function roundedBox(w, h, d, r, bevel = 0) {
  const shape = new THREE.Shape(), x = w / 2 - bevel, y = h / 2 - bevel, rr = Math.max(0.001, r - bevel);
  shape.moveTo(-x + rr, -y); shape.lineTo(x - rr, -y); shape.quadraticCurveTo(x, -y, x, -y + rr); shape.lineTo(x, y - rr); shape.quadraticCurveTo(x, y, x - rr, y);
  shape.lineTo(-x + rr, y); shape.quadraticCurveTo(-x, y, -x, y - rr); shape.lineTo(-x, -y + rr); shape.quadraticCurveTo(-x, -y, -x + rr, -y);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: Math.max(0.001, d - 2 * bevel), bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 8 });
  geometry.translate(0, 0, -(d - 2 * bevel) / 2); geometry.computeVertexNormals();
  return geometry;
}
// A rod (thin cylinder) between two points.
function rodGeometry(a, b, radius, segments = 8) {
  const from = new THREE.Vector3(...a), to = new THREE.Vector3(...b), length = from.distanceTo(to);
  const geometry = new THREE.CylinderGeometry(radius, radius, length, segments);
  geometry.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize()));
  geometry.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
  return geometry;
}
// The robot's egg: a lathe whose widest point sits low. eggRadius(y) also lets the belt, scarf and arms sit exactly on the surface.
const ROBOT_HEIGHT = 0.6;
const eggRadius = (y) => { const t = Math.acos(1 - (2 * Math.min(Math.max(y, 0), ROBOT_HEIGHT)) / ROBOT_HEIGHT); return 0.215 * Math.sin(t) * (1 - 0.2 * (y / ROBOT_HEIGHT - 0.4)); };
function eggGeometry() {
  const points = [];
  for (let i = 0; i <= 40; i++) { const y = (ROBOT_HEIGHT * i) / 40; points.push(new THREE.Vector2(Math.max(0.0005, i === 0 ? 0.0005 : eggRadius(y)), y)); }
  points[0].x = 0.0005; points[40].x = 0.0005;
  return new THREE.LatheGeometry(points, 40);
}

// A tube along a smooth curve through the given points.
function tubeGeometry(points, radius, segments = 24, radial = 8) {
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), segments, radius, radial, false);
}
// A drape of cloth: a width x length sheet bent along a side profile [[z, y], ...] (from one free end, over the rail, to the other free end), with wrinkles.
function drapeGeometry(width, profile, wrinkle = 0.012, seed = 1) {
  const cols = 14, rows = (profile.length - 1) * 4, positions = [], indices = [];
  const at = (t) => { const f = t * (profile.length - 1), i = Math.min(profile.length - 2, Math.floor(f)), k = f - i; return [profile[i][0] + (profile[i + 1][0] - profile[i][0]) * k, profile[i][1] + (profile[i + 1][1] - profile[i][1]) * k]; };
  for (let r = 0; r <= rows; r++) {
    const t = r / rows, [z, y] = at(t), hang = Math.min(t, 1 - t) < 0.4 ? 1 : 0.3;
    for (let c = 0; c <= cols; c++) {
      const u = c / cols - 0.5;
      const fold = Math.sin(u * 17 + seed * 2 + t * 3.1) * wrinkle * hang + Math.sin(u * 41 + seed) * wrinkle * 0.35 * hang;
      const narrow = 1 - 0.1 * Math.abs(u) * (1 - hang); // the free ends hang a little narrower
      positions.push(u * width * narrow + Math.sin(t * 9 + seed) * 0.006 * hang, y, z + fold);
    }
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const a = r * (cols + 1) + c, b = a + cols + 1; indices.push(a, b, a + 1, a + 1, b, b + 1); }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3)); geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
}
// A woven jute rug: concentric rings of slightly different tans with a fine cross-weave.
function makeRugTexture() {
  const canvas = document.createElement("canvas"); canvas.width = 512; canvas.height = 512;
  const g = canvas.getContext("2d");
  let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  g.fillStyle = "#c9ad7c"; g.fillRect(0, 0, 512, 512);
  for (let r = 250; r > 4; r -= 5) { const k = rnd(); g.strokeStyle = `rgb(${Math.round(188 + k * 30)},${Math.round(158 + k * 28)},${Math.round(104 + k * 22)})`; g.lineWidth = 5; g.beginPath(); g.arc(256, 256, r, 0, Math.PI * 2); g.stroke(); }
  g.strokeStyle = "rgba(95,70,40,.16)"; g.lineWidth = 1; for (let i = 0; i < 90; i++) { g.beginPath(); g.arc(256, 256, 8 + i * 2.7, 0, Math.PI * 2); g.stroke(); }
  g.strokeStyle = "#8a6a3e"; g.lineWidth = 9; g.beginPath(); g.arc(256, 256, 236, 0, Math.PI * 2); g.stroke();
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8; return texture;
}
// Four small stand-in paintings on one atlas (2 x 2 tiles): a plane-tree street, a Bund dawn, a window shadow and a curl of steam. Codex's real prints (card 49)
// replace them; the frames and the single draw call stay.
function makePrintAtlas() {
  const canvas = document.createElement("canvas"); canvas.width = 1024; canvas.height = 1024;
  const g = canvas.getContext("2d");
  let seed = 12; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const tile = (col, row, draw) => { g.save(); g.translate(col * 512, row * 512); g.beginPath(); g.rect(0, 0, 512, 512); g.clip(); draw(); g.restore(); };
  tile(0, 0, () => { // the street under plane trees, morning
    const sky = g.createLinearGradient(0, 0, 0, 512); sky.addColorStop(0, "#f6e8cd"); sky.addColorStop(1, "#ecd2a8"); g.fillStyle = sky; g.fillRect(0, 0, 512, 512);
    g.fillStyle = "#9aa4a8"; g.fillRect(0, 250, 512, 120); g.fillStyle = "#b44e35"; for (let i = 0; i < 6; i++) g.fillRect(20 + i * 80, 270, 54, 14);
    g.fillStyle = "#c2a67a"; g.fillRect(0, 370, 512, 142);
    for (const x of [90, 250, 410]) { g.fillStyle = "#cdb48c"; g.fillRect(x - 16, 130, 32, 300); g.fillStyle = "#a9b08a"; for (let i = 0; i < 9; i++) g.fillRect(x - 16 + (i % 2) * 14, 150 + i * 30, 14, 18); }
    g.fillStyle = "#7d9a3e"; for (let i = 0; i < 70; i++) { g.globalAlpha = 0.55 + rnd() * 0.4; g.beginPath(); g.ellipse(rnd() * 512, rnd() * 190, 30 + rnd() * 34, 18 + rnd() * 20, rnd(), 0, 7); g.fill(); } g.globalAlpha = 1;
  });
  tile(1, 0, () => { // the Bund at dawn
    const sky = g.createLinearGradient(0, 0, 0, 340); sky.addColorStop(0, "#f2b693"); sky.addColorStop(1, "#f8dfc0"); g.fillStyle = sky; g.fillRect(0, 0, 512, 512);
    g.fillStyle = "#fbe7bd"; g.beginPath(); g.arc(360, 250, 52, 0, 7); g.fill();
    g.fillStyle = "#54505c"; for (const [x, w, h] of [[20, 50, 80], [74, 36, 120], [114, 60, 70], [180, 24, 170], [208, 40, 110], [252, 56, 90], [312, 30, 140], [346, 44, 75], [394, 66, 100], [464, 40, 60]]) g.fillRect(x, 340 - h, w, h);
    g.fillRect(193, 150, 4, 30); const water = g.createLinearGradient(0, 340, 0, 512); water.addColorStop(0, "#9ba8b4"); water.addColorStop(1, "#6f8296"); g.fillStyle = water; g.fillRect(0, 340, 512, 172);
    g.fillStyle = "rgba(251,231,189,.7)"; for (let i = 0; i < 10; i++) g.fillRect(320 + rnd() * 80, 350 + i * 16, 60 + rnd() * 40, 4);
  });
  tile(0, 1, () => { // a window's shadow on a cream wall
    g.fillStyle = "#efe3cc"; g.fillRect(0, 0, 512, 512); g.fillStyle = "rgba(180,87,60,.78)";
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { g.beginPath(); g.moveTo(60 + i * 140 + j * 24, 50 + j * 140); g.lineTo(180 + i * 140 + j * 24, 50 + j * 140); g.lineTo(168 + i * 140 + j * 24, 170 + j * 140); g.lineTo(48 + i * 140 + j * 24, 170 + j * 140); g.fill(); }
    g.fillStyle = "rgba(77,93,60,.75)"; for (let i = 0; i < 14; i++) { g.beginPath(); g.ellipse(80 + rnd() * 360, 80 + rnd() * 360, 22 + rnd() * 18, 9 + rnd() * 8, rnd() * 3, 0, 7); g.fill(); }
  });
  tile(1, 1, () => { // the shape of steam
    g.fillStyle = "#f1e4cf"; g.fillRect(0, 0, 512, 512); g.lineCap = "round";
    for (const [col, off, w] of [["#d9a441", 0, 38], ["#b4573c", 46, 30], ["#4d5d3c", 88, 22], ["#a89a8e", 122, 16]]) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(150 + off, 470); g.bezierCurveTo(60 + off, 360, 250 + off, 300, 170 + off, 210); g.bezierCurveTo(100 + off, 130, 230 + off, 90, 190 + off, 40); g.stroke(); }
  });
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8; return texture;
}
// A soft round puff for steam.
function makeSteamTexture() {
  const canvas = document.createElement("canvas"); canvas.width = 64; canvas.height = 64;
  const g = canvas.getContext("2d"), grad = g.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, "rgba(255,255,255,.85)"); grad.addColorStop(0.5, "rgba(255,255,255,.3)"); grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
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
      loadedArt.add(file); then(texture); if (typeof reapplyLook === "function") reapplyLook(); render();
    });
  }
  const plaster = makePlasterBump(); plaster.repeat.set(2, 2);
  const materials = {
    wall: new THREE.MeshStandardMaterial({ color: COLORS.wall, roughness: 0.95, bumpMap: plaster, bumpScale: 0.6 }),
    ceiling: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, map: makePlankTexture(), bumpScale: 1.4, emissive: COLORS.ceiling, emissiveIntensity: 0.16 }), // a ceiling faces away from every light; a little glow stands in for light bounced up off the floor
    floor: new THREE.MeshStandardMaterial({ color: COLORS.floor, roughness: 0.62 }),
    brick: new THREE.MeshStandardMaterial({ color: 0x9a4f33, roughness: 0.93 }),
    oak: new THREE.MeshStandardMaterial({ color: COLORS.oak, roughness: 0.68 }),
    oakDeep: new THREE.MeshStandardMaterial({ color: 0xa5773f, roughness: 0.78 }), // the recessed panel fields: a shade darker than the frames around them
    oakDark: new THREE.MeshStandardMaterial({ color: 0x4a3524, roughness: 0.8 }), // the toe-kicks
    olive: new THREE.MeshStandardMaterial({ color: COLORS.olive, roughness: 0.75 }),
    wainscot: new THREE.MeshStandardMaterial({ color: COLORS.olive, roughness: 0.78 }),
    black: new THREE.MeshStandardMaterial({ color: COLORS.black, roughness: 0.6 }),
    frame: new THREE.MeshStandardMaterial({ color: 0x24272a, roughness: 0.5, metalness: 0.2 }),
    steel: new THREE.MeshStandardMaterial({ color: COLORS.steel, roughness: 0.42, metalness: 0.75 }),
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
  Object.assign(materials, {
    ceramic: new THREE.MeshStandardMaterial({ color: 0xf5f1ea, roughness: 0.32 }),
    beans: new THREE.MeshStandardMaterial({ color: 0x3b2415, roughness: 0.55 }),
    croissant: new THREE.MeshStandardMaterial({ color: 0xd8963d, roughness: 0.7 }),
    muffin: new THREE.MeshStandardMaterial({ color: 0xb87a43, roughness: 0.8 }),
    muffinCup: new THREE.MeshStandardMaterial({ color: 0xe9e0d0, roughness: 0.9, side: THREE.DoubleSide }),
    cookie: new THREE.MeshStandardMaterial({ color: 0xc58b4b, roughness: 0.85 }),
    chip: new THREE.MeshStandardMaterial({ color: 0x3a2418, roughness: 0.6 }),
    visor: new THREE.MeshStandardMaterial({ color: 0x17191c, roughness: 0.22, metalness: 0.15 }),
    robotBody: new THREE.MeshStandardMaterial({ color: 0xf4f2ec, roughness: 0.42 }),
    scarf: new THREE.MeshStandardMaterial({ color: 0x66763f, roughness: 0.92 }),
    coffee: new THREE.MeshStandardMaterial({ color: 0x3b2418, roughness: 0.35 }),
    eyes: new THREE.MeshBasicMaterial({ color: 0xffffff }),
    warm: new THREE.MeshBasicMaterial({ color: 0xffe0aa }),
  });
  Object.assign(materials, {
    pendantShade: new THREE.MeshStandardMaterial({ color: 0xd9bb82, roughness: 0.85, emissive: 0xffc77a, emissiveIntensity: 0, side: THREE.DoubleSide }),
    sconceGlow: new THREE.MeshStandardMaterial({ color: 0xf3e2c2, roughness: 0.8, emissive: 0xffc77a, emissiveIntensity: 0, side: THREE.DoubleSide }),
    kraft: new THREE.MeshStandardMaterial({ color: 0xc9a272, roughness: 0.85 }),
    lid: new THREE.MeshStandardMaterial({ color: 0xf1eee8, roughness: 0.6 }),
    tablet: new THREE.MeshStandardMaterial({ color: 0x1d2a33, roughness: 0.25, emissive: 0x9fc5d6, emissiveIntensity: 0.35 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xcfa25a, roughness: 0.4, metalness: 0.7 }),
    cane: new THREE.MeshStandardMaterial({ color: 0xcaa66b, roughness: 0.85 }),
    bentwood: new THREE.MeshStandardMaterial({ color: 0x9a6a3a, roughness: 0.55 }),
    cloth: new THREE.MeshStandardMaterial({ color: 0xded3bf, roughness: 0.96, side: THREE.DoubleSide }),
    paper: new THREE.MeshStandardMaterial({ color: 0xf6f0e2, roughness: 0.9 }),
    cover: new THREE.MeshStandardMaterial({ color: 0x5c4630, roughness: 0.8 }),
    leaf: new THREE.MeshStandardMaterial({ color: 0x5f8a45, roughness: 0.78, side: THREE.DoubleSide }),
    leafDark: new THREE.MeshStandardMaterial({ color: 0x3f6a33, roughness: 0.8, side: THREE.DoubleSide }),
    bloom: new THREE.MeshStandardMaterial({ color: 0xf3f1e6, roughness: 0.9 }),
    soil: new THREE.MeshStandardMaterial({ color: 0x3a2a1e, roughness: 1 }),
    pot: new THREE.MeshStandardMaterial({ color: 0xf0ebe1, roughness: 0.6 }),
    iron: new THREE.MeshStandardMaterial({ color: 0x25272a, roughness: 0.5, metalness: 0.35 }),
    water: new THREE.MeshStandardMaterial({ color: 0xcfe0e4, roughness: 0.05, transparent: true, opacity: 0.45, depthWrite: false }),
  });
  materials.menuA = new THREE.MeshStandardMaterial({ color: 0x2c302f, roughness: 0.96 });
  materials.menuB = new THREE.MeshStandardMaterial({ color: 0x2c302f, roughness: 0.96 });
  materials.ceiling.bumpMap = materials.ceiling.map;
  materials.ceiling.map.repeat.set(1, (ROOM.depth + 1.2) / (8 * 0.14)); // eight boards of 14 cm per tile
  // Brick: the painted tile covers about 2.2 x 1.1 m. The height map (bright brick face, dark joint) is the relief the low sun rakes across.
  paint("room04-brick-red-v1.webp", { repeat: [ROOM.width / 2.2, ROOM.height / 1.1], then: (t) => { materials.brick.map = t; materials.brick.color.set(0xffffff); materials.brick.needsUpdate = true; } });
  paint("room04-brick-red-height-v1.webp", { srgb: false, repeat: [ROOM.width / 2.2, ROOM.height / 1.1], then: (t) => { materials.brick.bumpMap = t; materials.brick.bumpScale = 20; materials.brick.needsUpdate = true; } });
  paint("room04-floor-greybrown-v1.webp", { repeat: [ROOM.width / 1.2, (ROOM.depth + 1.2) / 1.2], then: (t) => { materials.floor.map = t; materials.floor.color.set(0xffffff); materials.floor.needsUpdate = true; } });
  paint("room04-window-xintiandi-morning-v1.webp", { repeat: [1, 1], then: (t) => { t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; materials.street.userData.dry = t; materials.street.map = t; materials.street.color.set(0xffffff); materials.street.needsUpdate = true; if (typeof applyLive === "function") { applyStreet(currentMood); applyLive(); } } });

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
  const reflectiveBase = { ceramic: 0.5, visor: 1.2, steel: 1.5, glass: 1.6, pane: 1.6, stone: 0.35, frame: 0.5 };
  for (const [key, intensity] of Object.entries(reflectiveBase)) { materials[key].envMap = reflectionEnv; materials[key].envMapIntensity = intensity; }

  const add = (name, geometry, material, x, y, z, { cast = true, receive = true } = {}) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name; mesh.position.set(x, y, z); mesh.castShadow = cast; mesh.receiveShadow = receive;
    scene.add(mesh); return mesh;
  };
  const box = (name, material, [x0, x1], [y0, y1], [z0, z1], options) => {
    if (material !== materials.wall) return add(name, new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), material, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, options);
    const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); worldUVs(g, 1);
    return add(name, g, material, 0, 0, 0, options);
  };

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
  const noCast = new Set(["leaf", "leafDark", "bloom", "soil", "water", "paper", "cover", "glass", "muffinCup", "muffin", "croissant", "cookie", "chip", "beans", "coffee", "warm", "eyes", "cane", "kraft", "lid", "tablet", "gold", "pendantShade", "sconceGlow"]);
  const flush = (prefix) => { for (const [key, list] of parts) add(`${prefix}-${key}`, mergeGeometries(list), materials[key], 0, 0, 0, { cast: !noCast.has(key) }); parts.clear(); };

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
  {
    const canvas = document.createElement("canvas"); canvas.width = 800; canvas.height = 220;
    const g = canvas.getContext("2d");
    const wood = g.createLinearGradient(0, 0, 0, 220); wood.addColorStop(0, "#d9a95f"); wood.addColorStop(1, "#c4893f");
    g.fillStyle = wood; g.fillRect(0, 0, 800, 220);
    g.strokeStyle = "rgba(120,70,20,.22)"; g.lineWidth = 2; for (let i = 0; i < 14; i++) { g.beginPath(); g.moveTo(0, 10 + i * 16); g.bezierCurveTo(250, 6 + i * 16, 500, 18 + i * 16, 800, 10 + i * 16); g.stroke(); }
    g.strokeStyle = "#7a4a1c"; g.lineWidth = 7; g.strokeRect(14, 14, 772, 192); g.lineWidth = 2; g.strokeRect(26, 26, 748, 168);
    g.fillStyle = "#4a2a10"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = "700 62px Georgia, 'Times New Roman', serif";
    g.fillText("Christ is the Head", 400, 84); g.fillText("of this House", 400, 150);
    const face = new THREE.CanvasTexture(canvas); face.colorSpace = THREE.SRGBColorSpace; face.anisotropy = 8;
    const faceMaterial = new THREE.MeshStandardMaterial({ map: face, roughness: 0.6 });
    const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.8), [faceMaterial, materials.oak, materials.oak, materials.oak, materials.oak, materials.oak]);
    plaque.name = "house-plaque"; plaque.position.set(X0 + 0.015, 2.05, -1.65); plaque.castShadow = true; scene.add(plaque);
  }
  flush("section2");  flush("section2");

  // Soft contact shadows on the floor under the counter and the back bar.
  const contactTexture = makeContactShadowTexture();
  const contact = (name, x0, x1, z0, z1, opacity) => {
    const mesh = add(name, new THREE.PlaneGeometry(x1 - x0, z1 - z0), new THREE.MeshBasicMaterial({ map: contactTexture, transparent: true, opacity, depthWrite: false, color: 0x000000 }), (x0 + x1) / 2, 0.004, (z0 + z1) / 2, { cast: false, receive: false });
    mesh.rotation.x = -Math.PI / 2; mesh.renderOrder = 1;
  };
  contact("counter-contact-shadow", c.x0 - 0.35, c.x1 + 0.35, c.z0 - 0.35, c.z1 + 0.45, 0.5);
  contact("back-bar-contact-shadow", bb.x0 - 0.3, bb.x1 + 0.3, BACK - 0.05, bbFront + 0.4, 0.42);

  // ---------- hero pieces (section 3) ----------
  const top = c.height; // the stone top, 1.05 m
  // The machine and the grinder stand on the BACK BAR against the brick wall and face the room (Paul, 2026-11-13: the cover shows the machine facing out; the
  // first build had it facing the wall, so visitors saw only its plain back and never the steam wand). A standing counter is 1.05 m and the bar top 0.90 m,
  // so everything on the bar is visible over the counter edge from the eye height of both default views.
  const barTop = BACK_BAR.height, mx = -1.2, mz = BACK + 0.25; // the machine's centre on the bar

  // Espresso machine, 75 x 42 x 48 cm, FRONT toward +z: brushed steel body with black end caps, a cup warmer with a guard rail, two group heads with black
  // portafilters and a pressure gauge, a steam wand at the front right corner, a drip tray and four feet. The back, against the wall, is plain.
  const MACHINE = { W: 0.75, D: 0.48, H: 0.36 };
  const machineFront = mz + MACHINE.D / 2, machineY0 = barTop + 0.06;
  {
    const { W, D, H } = MACHINE, y0 = machineY0, front = machineFront;
    part("steel", roundedBox(W - 0.06, H, D - 0.02, 0.03, 0.006).translate(mx, y0 + H / 2, mz), { tile: 1 });
    for (const sign of [-1, 1]) part("black", roundedBox(D, H + 0.02, 0.03, 0.035, 0.005).rotateY(Math.PI / 2).translate(mx + sign * (W / 2 - 0.015), y0 + H / 2, mz), { tile: 1 });
    slab("steel", [mx - 0.345, mx + 0.345], [y0 + H, y0 + H + 0.012], [mz - 0.22, mz + 0.22], { tile: 1 }); // the cup-warmer plate
    for (let i = 0; i < 4; i++) part("ceramic", new THREE.LatheGeometry([[0, 0], [0.03, 0], [0.043, 0.062], [0.039, 0.062], [0.027, 0.008], [0]].map((p) => new THREE.Vector2(p[0], p[1] ?? 0)), 16).translate(mx - 0.24 + i * 0.16, y0 + H + 0.012, mz), { tile: 1 });
    for (const dz of [-0.19, 0.19]) {
      part("steel", rodGeometry([mx - 0.33, y0 + H + 0.085, mz + dz], [mx + 0.33, y0 + H + 0.085, mz + dz], 0.005), { tile: 1 });
      for (const dx of [-0.33, 0.33]) part("steel", rodGeometry([mx + dx, y0 + H + 0.012, mz + dz], [mx + dx, y0 + H + 0.085, mz + dz], 0.005), { tile: 1 });
    }
    for (const dx of [-0.33, 0.33]) part("steel", rodGeometry([mx + dx, y0 + H + 0.085, mz - 0.19], [mx + dx, y0 + H + 0.085, mz + 0.19], 0.005), { tile: 1 });
    // Front face: two group heads with portafilters (black handles pointing at the room), a gauge and four buttons.
    for (const dx of [-0.17, 0.17]) {
      part("steel", new THREE.CylinderGeometry(0.034, 0.034, 0.05, 20).rotateX(Math.PI / 2).translate(mx + dx, y0 + 0.27, front + 0.02), { tile: 1 });
      part("black", new THREE.CylinderGeometry(0.031, 0.027, 0.03, 20).rotateX(Math.PI / 2).translate(mx + dx, y0 + 0.265, front + 0.06), { tile: 1 });
      part("black", rodGeometry([mx + dx, y0 + 0.265, front + 0.07], [mx + dx + (dx < 0 ? -0.03 : 0.03), y0 + 0.255, front + 0.2], 0.012), { tile: 1 });
      slab("steel", [mx + dx - 0.05, mx + dx + 0.05], [y0 + 0.2, y0 + 0.208], [front + 0.01, front + 0.04], { tile: 1 });
    }
    part("steel", new THREE.CylinderGeometry(0.034, 0.034, 0.014, 24).rotateX(Math.PI / 2).translate(mx - 0.27, y0 + 0.31, front + 0.006), { tile: 1 });
    part("ceramic", new THREE.CylinderGeometry(0.028, 0.028, 0.004, 24).rotateX(Math.PI / 2).translate(mx - 0.27, y0 + 0.31, front + 0.014), { tile: 1 });
    for (let i = 0; i < 4; i++) part("black", new THREE.CylinderGeometry(0.01, 0.01, 0.008, 12).rotateX(Math.PI / 2).translate(mx - 0.1 + i * 0.07, y0 + 0.33, front + 0.004), { tile: 1 });
    // Steam wand at the front right corner: a tap on the front, a tube that runs out and down, a tip in the milk pitcher the barista holds.
    part("black", new THREE.SphereGeometry(0.014, 12, 8).translate(mx + W / 2 - 0.05, y0 + 0.25, front + 0.01), { tile: 1 });
    part("steel", rodGeometry([mx + W / 2 - 0.05, y0 + 0.25, front + 0.01], [mx + W / 2 + 0.02, y0 + 0.25, front + 0.06], 0.0065), { tile: 1 });
    part("steel", rodGeometry([mx + W / 2 + 0.02, y0 + 0.25, front + 0.06], [mx + W / 2 + 0.035, y0 + 0.17, front + 0.12], 0.006), { tile: 1 });
    part("steel", rodGeometry([mx + W / 2 + 0.035, y0 + 0.17, front + 0.12], [mx + W / 2 + 0.04, y0 + 0.13, front + 0.125], 0.0052), { tile: 1 });
    // Drip tray with a grille, and four feet.
    slab("steel", [mx - 0.33, mx + 0.33], [barTop + 0.034, barTop + 0.058], [mz - 0.2, mz + 0.24], { tile: 1 });
    for (let i = 0; i < 12; i++) slab("black", [mx - 0.3 + i * 0.05, mx - 0.27 + i * 0.05], [barTop + 0.058, barTop + 0.0605], [mz - 0.17, mz + 0.21], { tile: 1 });
    for (const dx of [-0.31, 0.31]) for (const dz of [-0.17, 0.19]) part("steel", new THREE.CylinderGeometry(0.022, 0.026, 0.036, 14).translate(mx + dx, barTop + 0.018, mz + dz), { tile: 1 });
  }

  // Grinder, about 22 x 34 x 26 cm, on the bar to the left of the machine: black tapered body, steel collar, a clear hopper of beans, a dial and a chute toward the room.
  {
    const gx = -2.02, gz = mz + 0.02, y0 = barTop + 0.022;
    part("black", roundedBox(0.26, 0.022, 0.3, 0.014, 0.004).rotateX(Math.PI / 2).translate(gx, barTop + 0.011, gz), { tile: 1 });
    part("black", new THREE.LatheGeometry([[0.0005, 0], [0.108, 0], [0.104, 0.03], [0.078, 0.27], [0.0005, 0.27]].map((p) => new THREE.Vector2(p[0], p[1])), 36).translate(gx, y0, gz), { tile: 1 });
    part("steel", new THREE.CylinderGeometry(0.083, 0.083, 0.024, 32).translate(gx, y0 + 0.282, gz), { tile: 1 });
    part("glass", new THREE.LatheGeometry([[0.078, 0], [0.098, 0.05], [0.104, 0.1], [0.104, 0.13], [0.1, 0.17]].map((p) => new THREE.Vector2(p[0], p[1])), 36).translate(gx, y0 + 0.294, gz), { tile: 1 });
    part("black", new THREE.CylinderGeometry(0.108, 0.108, 0.018, 36).translate(gx, y0 + 0.4, gz), { tile: 1 });
    let seed = 5; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 70; i++) {
      const a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * 0.085, hy = 0.3 + rnd() * 0.07 * (1 - rr / 0.1);
      const g = new THREE.SphereGeometry(0.0085, 6, 4); g.scale(1, 0.72, 0.58); g.rotateY(rnd() * 3).rotateZ(rnd() * 3);
      part("beans", g.translate(gx + Math.cos(a) * rr, y0 + 0.28 + (hy - 0.3) + rnd() * 0.02, gz + Math.sin(a) * rr), { tile: 1 });
    }
    part("steel", new THREE.CylinderGeometry(0.03, 0.03, 0.02, 24).rotateX(Math.PI / 2).translate(gx, y0 + 0.19, gz + 0.087), { tile: 1 });
    part("steel", rodGeometry([gx, y0 + 0.13, gz + 0.085], [gx, y0 + 0.085, gz + 0.125], 0.017), { tile: 1 });
    slab("steel", [gx - 0.05, gx + 0.05], [y0 + 0.05, y0 + 0.056], [gz + 0.09, gz + 0.16], { tile: 1 }); // the cradle for the portafilter
  }

  // Curved glass pastry case, 110 x 50 x 50 cm, on an oak base: steel rods on a quarter-round profile, glass sides, front and top, two glass shelves,
  // a warm strip light, and eight pastries on four plates (three croissants, two muffins, three cookies).
  {
    const x0 = 1.2, x1 = 2.3, cx = (x0 + x1) / 2, zb = c.z0 + 0.06, zf = c.z1 - 0.04, base = top + 0.04, Hh = 0.5, R = 0.2, arcSteps = 12;
    slab("oak", [x0, x1], [top, base], [zb - 0.02, zf + 0.02], { grain: "x" });
    const profile = [[zb, base], [zb, base + Hh], [zf - R, base + Hh]];
    for (let i = 1; i <= arcSteps; i++) { const a = (i / arcSteps) * (Math.PI / 2); profile.push([zf - R + R * Math.sin(a), base + Hh - R + R * Math.cos(a)]); }
    profile.push([zf, base]);
    const sideShape = new THREE.Shape(profile.map((p) => new THREE.Vector2(p[0], p[1])));
    for (const x of [x0 + 0.012, x1 - 0.012]) part("glass", new THREE.ShapeGeometry(sideShape, 6).rotateY(-Math.PI / 2).translate(x, 0, 0), { tile: 1 });
    // The curved front and top: a strip along the profile from the front foot, up and round, to the back top edge.
    const path = [[zf, base], [zf, base + Hh - R]];
    for (let i = 1; i <= arcSteps; i++) { const a = (i / arcSteps) * (Math.PI / 2); path.push([zf - R * (1 - Math.cos(a)) - 0, base + Hh - R + R * Math.sin(a)]); }
    path.push([zb, base + Hh]);
    const vertices = [], indices = [];
    path.forEach((p, i) => { vertices.push(x0 + 0.012, p[1], p[0], x1 - 0.012, p[1], p[0]); if (i) { const k = (i - 1) * 2; indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); } });
    const front = new THREE.BufferGeometry(); front.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3)); front.setIndex(indices); front.computeVertexNormals();
    part("glass", front, { tile: 1 });
    // Steel frame: rods along the profile at both ends, plus rods across the front foot, the top front edge and the back top edge.
    const ring = [[zb, base], [zb, base + Hh], ...path.slice(1, path.length - 1).map((p) => [p[0], p[1]]), [zf, base]];
    for (const x of [x0 + 0.012, x1 - 0.012]) for (let i = 0; i < ring.length - 1; i++) part("black", rodGeometry([x, ring[i][1], ring[i][0]], [x, ring[i + 1][1], ring[i + 1][0]], 0.006), { tile: 1 });
    for (const p of [[zf, base], [zb, base + Hh], [zf, base + Hh - R]]) part("black", rodGeometry([x0 + 0.012, p[1], p[0]], [x1 - 0.012, p[1], p[0]], 0.006), { tile: 1 });
    const shelfY = base + 0.25;
    slab("glass", [x0 + 0.014, x1 - 0.014], [shelfY - 0.003, shelfY + 0.003], [zb + 0.01, zf - 0.015], { tile: 1 });
    part("steel", rodGeometry([x0 + 0.014, shelfY + 0.006, zf - 0.015], [x1 - 0.014, shelfY + 0.006, zf - 0.015], 0.0045), { tile: 1 });
    for (const x of [x0 + 0.014, x1 - 0.014]) slab("black", [x - 0.006, x + 0.006], [shelfY - 0.012, shelfY], [zb + 0.01, zf - 0.015], { tile: 1 });
    // Warm strip light under the top front edge.
    slab("warm", [x0 + 0.06, x1 - 0.06], [base + Hh - 0.02, base + Hh - 0.012], [zf - R - 0.02, zf - R + 0.03], { tile: 1 });
    const plates = [[1.52, shelfY + 0.003, 0], [1.98, shelfY + 0.003, 1], [1.5, base, 2], [1.95, base, 3]];
    const pz = (zb + zf) / 2 + 0.01;
    for (const [px, py] of plates) part("ceramic", new THREE.CylinderGeometry(0.108, 0.092, 0.01, 28).translate(px, py + 0.005, pz), { tile: 1 });
    const croissant = (x, y, z, turn) => { // seven lumps along an arc, fat in the middle and thin at the horns
      for (let i = 0; i < 7; i++) {
        const t = i / 6, a = (t - 0.5) * 2.3, r = 0.011 + 0.016 * Math.sin(t * Math.PI);
        const g = new THREE.SphereGeometry(r, 10, 7); g.scale(1.25, 0.95, 1);
        part("croissant", g.translate(Math.sin(a) * 0.05, r * 0.9, -Math.cos(a) * 0.05 + 0.05).rotateY(turn).translate(x, y, z), { tile: 1 });
      }
    };
    croissant(1.5, shelfY + 0.01, pz - 0.01, 0.4); croissant(1.54, shelfY + 0.036, pz + 0.01, 2.2); croissant(1.99, shelfY + 0.01, pz, 1.1);
    const muffin = (x, y, z) => {
      part("muffinCup", new THREE.LatheGeometry([[0.026, 0], [0.037, 0.042]].map((p) => new THREE.Vector2(p[0], p[1])), 16).translate(x, y, z), { tile: 1 });
      const dome = new THREE.SphereGeometry(0.043, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2); dome.scale(1, 0.85, 1); part("muffin", dome.translate(x, y + 0.038, z), { tile: 1 });
      for (let i = 0; i < 5; i++) { const a = i * 1.3; part("chip", new THREE.SphereGeometry(0.0055, 6, 5).translate(x + Math.cos(a) * 0.026, y + 0.058 + (i % 2) * 0.004, z + Math.sin(a) * 0.026), { tile: 1 }); }
    };
    muffin(1.46, base + 0.01, pz - 0.015); muffin(1.56, base + 0.01, pz + 0.03);
    const cookie = (x, y, z) => { part("cookie", new THREE.CylinderGeometry(0.036, 0.036, 0.012, 20).translate(x, y + 0.006, z), { tile: 1 }); for (let i = 0; i < 4; i++) part("chip", new THREE.SphereGeometry(0.0055, 6, 5).translate(x + Math.cos(i * 1.7) * 0.02, y + 0.013, z + Math.sin(i * 1.7) * 0.02), { tile: 1 }); };
    cookie(1.91, base + 0.01, pz - 0.03); cookie(1.99, base + 0.012, pz + 0.025); cookie(2.03, base + 0.01, pz - 0.035);
    const caseLight = new THREE.PointLight(0xffd7a0, 0.9, 1.3, 2); caseLight.position.set(cx, base + Hh - 0.05, (zb + zf) / 2); scene.add(caseLight);
  }

  // Two ROOMVERSE robots work the bar (Paul, 2026-11-13). Paul did not want them floating on the counter: each one now stands on its own FLOOR PEDESTAL (a dark column on a
  // round base with an orange light ring, reaching up to the egg), behind the counter where its base is hidden, so from the front only the head and shoulders show above the
  // counter, like a person standing behind it, and from the sides the whole column is there to see. Nothing stands on the counter or the bar except what a cafe puts there.
  // The GREETER stands by the pastry case and sets a cup of coffee down on the counter; the BARISTA stands at the machine, three-quarters turned away from the visitors,
  // and steams milk with the pitcher at the wand. Both are 15% over their 60 cm design height so they read from across the room.
  const robot = new THREE.Group(); robot.name = "robot-barista"; // the greeter's egg and arms (it hops); its pedestal is static
  const ROBOT_SCALE = 1.15, EGG_BASE = 0.86, ARM_R = 0.036;
  const buildRobot = (group) => {
    const local = new THREE.Group(); group.add(local);
    const add2 = (key, geometry) => { const mesh = new THREE.Mesh(geometry, materials[key]); mesh.castShadow = true; mesh.receiveShadow = true; local.add(mesh); return mesh; };
    add2("robotBody", eggGeometry());
    const visor = add2("visor", new THREE.SphereGeometry(1, 28, 16)); visor.scale.set(0.135, 0.058, 0.034); visor.position.set(0, 0.42, eggRadius(0.42) - 0.008);
    for (const sx of [-1, 1]) { const eye = add2("eyes", new THREE.CircleGeometry(0.0175, 20)); eye.position.set(sx * 0.047, 0.425, eggRadius(0.42) - 0.008 + 0.0345); }
    const band = add2("terracotta", new THREE.CylinderGeometry(eggRadius(0.19) + 0.004, eggRadius(0.13) + 0.004, 0.06, 40, 1, true)); band.position.y = 0.16; band.material.side = THREE.DoubleSide;
    const scarf = add2("scarf", new THREE.TorusGeometry(eggRadius(0.325) + 0.004, 0.026, 10, 36)); scarf.rotation.x = Math.PI / 2; scarf.position.y = 0.325; scarf.scale.set(1, 1, 0.8);
    const knot = add2("scarf", new THREE.SphereGeometry(0.03, 12, 8)); knot.position.set(-0.075, 0.315, eggRadius(0.315) + 0.014);
    for (const [dx, tilt] of [[-0.05, 0.12], [-0.095, -0.1]]) { const tail = add2("scarf", new THREE.BoxGeometry(0.04, 0.1, 0.012)); tail.position.set(dx - 0.025, 0.245, eggRadius(0.25) + 0.016); tail.rotation.z = tilt; }
    // A limb: a capsule between two points in the robot's own frame.
    const limb = (a, b) => {
      const from = new THREE.Vector3(...a), to = new THREE.Vector3(...b), length = Math.max(0.01, from.distanceTo(to) - 2 * ARM_R);
      const g = new THREE.CapsuleGeometry(ARM_R, length, 6, 12); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize()));
      g.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); return add2("robotBody", g);
    };
    return { local, add2, limb };
  };
  // Merge a robot's parts by material (the robot still moves as one group), so each robot costs a handful of draw calls.
  const consolidateRobot = (local) => {
    local.updateMatrixWorld(true);
    const byMaterial = new Map();
    for (const mesh of [...local.children]) {
      if (!mesh.isMesh) continue;
      mesh.updateMatrix();
      let g = mesh.geometry.clone().applyMatrix4(mesh.matrix); if (g.index) g = g.toNonIndexed();
      if (!byMaterial.has(mesh.material)) byMaterial.set(mesh.material, []);
      byMaterial.get(mesh.material).push(g); local.remove(mesh); mesh.geometry.dispose();
    }
    for (const [material, list] of byMaterial) { const merged = new THREE.Mesh(mergeGeometries(list), material); merged.castShadow = true; merged.receiveShadow = true; local.add(merged); }
  };
  // The pedestal: a round steel-edged base on the floor with an orange light ring, a tapering dark column, and a collar under the egg.
  const pedestal = (x, z) => {
    part("black", new THREE.CylinderGeometry(0.29, 0.31, 0.04, 40).translate(x, 0.02, z), { tile: 1 });
    part("terracotta", new THREE.TorusGeometry(0.265, 0.006, 8, 48).rotateX(Math.PI / 2).translate(x, 0.043, z), { tile: 1 });
    part("black", new THREE.LatheGeometry([[0.0005, 0.04], [0.17, 0.04], [0.12, 0.14], [0.11, 0.72], [0.14, 0.84], [0.0005, 0.84]].map((p) => new THREE.Vector2(p[0], p[1])), 40).translate(x, 0, z), { tile: 1 });
    part("steel", new THREE.TorusGeometry(0.142, 0.012, 8, 40).rotateX(Math.PI / 2).translate(x, 0.84, z), { tile: 1 });
    const contactMesh = (name, x0, x1, z0, z1, opacity) => { const m = add(name, new THREE.PlaneGeometry(x1 - x0, z1 - z0), new THREE.MeshBasicMaterial({ map: makeContactShadowTexture(), transparent: true, opacity, depthWrite: false, color: 0x000000 }), (x0 + x1) / 2, 0.005, (z0 + z1) / 2, { cast: false, receive: false }); m.rotation.x = -Math.PI / 2; m.renderOrder = 1; };
    contactMesh(`robot-contact-${Math.round(x * 100)}`, x - 0.62, x + 0.62, z - 0.62, z + 0.62, 0.6);
  };

  const RG = { x: 0.8, z: -1.28 }; // the greeter
  const greeter = buildRobot(robot);
  const GREETER_CUP = new THREE.Vector3(1.08, c.height, -0.8); // the cup it has just set down on the counter
  {
    pedestal(RG.x, RG.z);
    greeter.local.position.set(RG.x, EGG_BASE, RG.z); greeter.local.scale.setScalar(ROBOT_SCALE); robot.updateMatrixWorld(true);
    const hand = greeter.local.worldToLocal(new THREE.Vector3(GREETER_CUP.x - 0.055, c.height + 0.03, GREETER_CUP.z));
    greeter.limb([0.19, 0.34, 0.05], [hand.x, hand.y, hand.z]); // the right arm reaches out over the counter to the cup
    greeter.limb([-0.19, 0.34, 0.03], [-0.235, 0.2, 0.08]); // the left arm rests at its side
    consolidateRobot(greeter.local);
    scene.add(robot);
    // The cup of coffee on its saucer, standing on the counter.
    part("ceramic", new THREE.CylinderGeometry(0.075, 0.058, 0.012, 28).translate(GREETER_CUP.x, c.height + 0.006, GREETER_CUP.z), { tile: 1 });
    part("ceramic", new THREE.LatheGeometry([[0, 0], [0.036, 0], [0.05, 0.07], [0.046, 0.07], [0.033, 0.01], [0]].map((p) => new THREE.Vector2(p[0], p[1] ?? 0)), 24).translate(GREETER_CUP.x, c.height + 0.012, GREETER_CUP.z), { tile: 1 });
    part("coffee", new THREE.CircleGeometry(0.044, 24).rotateX(-Math.PI / 2).translate(GREETER_CUP.x, c.height + 0.074, GREETER_CUP.z), { tile: 1 });
  }
  const baristaRobot = new THREE.Group(); baristaRobot.name = "robot-barista-machine";
  const PITCHER = new THREE.Vector3(mx + MACHINE.W / 2 + 0.04, machineY0 + 0.135, machineFront + 0.125); // where the wand tip sits: inside the pitcher
  {
    const RB = { x: -0.5, z: -1.62 }, yaw = Math.atan2(PITCHER.x - RB.x, PITCHER.z - RB.z); // it faces the wand
    pedestal(RB.x, RB.z);
    const barista = buildRobot(baristaRobot);
    barista.local.position.set(RB.x, EGG_BASE, RB.z); barista.local.rotation.y = yaw; barista.local.scale.setScalar(ROBOT_SCALE); baristaRobot.updateMatrixWorld(true);
    const hand = barista.local.worldToLocal(PITCHER.clone());
    barista.limb([0.19, 0.36, 0.05], [hand.x, hand.y, hand.z]); // the right arm reaches the pitcher under the wand
    barista.limb([-0.19, 0.34, 0.02], [-0.23, 0.2, 0.06]);
    consolidateRobot(barista.local);
    scene.add(baristaRobot);
    // The milk pitcher in the hand (steel, with a handle) and a white milk surface at its mouth.
    part("steel", new THREE.LatheGeometry([[0.0005, 0], [0.028, 0], [0.037, 0.08], [0.033, 0.09], [0.0005, 0.09]].map((p) => new THREE.Vector2(p[0], p[1])), 20).translate(PITCHER.x, PITCHER.y - 0.05, PITCHER.z), { tile: 1 });
    part("steel", new THREE.TorusGeometry(0.022, 0.005, 6, 12, Math.PI).rotateZ(-Math.PI / 2).translate(PITCHER.x + 0.036, PITCHER.y - 0.005, PITCHER.z), { tile: 1 });
    part("lid", new THREE.CylinderGeometry(0.03, 0.03, 0.003, 20).translate(PITCHER.x, PITCHER.y + 0.036, PITCHER.z), { tile: 1 });
  }
  flush("section3");

  // ---------- the story corner (section 4) ----------
  // The window seat stands under the street window: a 60 cm round table, one bentwood chair with a coat over its back (its back is what the visitor sees
  // from the door) and one beside the table. On the table: a vase of hydrangea, an open notebook and pen, and a cup that has just been poured.
  const SEAT = { x: -2.42, z: 0.5 };
  const place = (geometry, x, z, yaw = 0, y = 0) => geometry.rotateY(yaw).translate(x, y, z);
  const chair = (x, z, yaw, withCoat) => {
    const P = (key, geometry, options) => part(key, place(geometry, x, z, yaw), options);
    const R = 0.2, seatY = 0.46;
    P("bentwood", new THREE.CylinderGeometry(R, R - 0.004, 0.034, 36).translate(0, seatY - 0.01, 0), { tile: 0.6 }); // the seat frame
    P("cane", new THREE.CylinderGeometry(R - 0.022, R - 0.022, 0.006, 36).translate(0, seatY + 0.009, 0), { tile: 0.2 }); // the woven top
    P("bentwood", new THREE.TorusGeometry(R - 0.018, 0.008, 8, 36).rotateX(Math.PI / 2).translate(0, seatY + 0.008, 0), { tile: 0.6 });
    for (const [lx, lz] of [[-0.145, 0.125], [0.145, 0.125]]) P("bentwood", new THREE.CylinderGeometry(0.017, 0.011, seatY - 0.03, 12).translate(lx * 1.08, (seatY - 0.03) / 2, lz * 1.08), { tile: 0.6 });
    for (const sx of [-1, 1]) {
      P("bentwood", tubeGeometry([[0.146 * sx, 0, -0.152], [0.142 * sx, 0.24, -0.158], [0.145 * sx, 0.46, -0.16], [0.152 * sx, 0.66, -0.188], [0.142 * sx, 0.84, -0.205], [0.112 * sx, 0.935, -0.21]], 0.0145, 30, 10), { tile: 0.6 });
    }
    P("bentwood", tubeGeometry([[-0.112, 0.935, -0.21], [-0.06, 0.968, -0.222], [0, 0.976, -0.226], [0.06, 0.968, -0.222], [0.112, 0.935, -0.21]], 0.0145, 20, 10), { tile: 0.6 }); // the top bow
    P("bentwood", new THREE.TorusGeometry(0.098, 0.0075, 8, 32).scale(1, 0.62, 1).translate(0, 0.76, -0.196), { tile: 0.6 }); // the oval ring in the back
    P("cane", new THREE.CylinderGeometry(0.092, 0.092, 0.004, 28).scale(1, 1, 0.62).rotateX(Math.PI / 2).translate(0, 0.76, -0.196), { tile: 0.2 });
    P("bentwood", new THREE.TorusGeometry(0.168, 0.0075, 8, 36).rotateX(Math.PI / 2).translate(0, 0.2, -0.005), { tile: 0.6 }); // the leg ring
    if (withCoat) {
      // A linen coat over the back: a free end on the seat side, up over the bow, and a longer end down the back.
      const coat = drapeGeometry(0.4, [[-0.17, 0.585], [-0.178, 0.7], [-0.198, 0.88], [-0.222, 0.97], [-0.24, 0.99], [-0.262, 0.975], [-0.27, 0.9], [-0.272, 0.76], [-0.265, 0.6], [-0.27, 0.47]], 0.011, 3);
      P("cloth", coat, { tile: 1 });
      P("cloth", new THREE.CylinderGeometry(0.032, 0.032, 0.18, 12).rotateZ(Math.PI / 2).translate(0.2, 0.845, -0.215), { tile: 1 }); // a rolled sleeve over the right post
    }
  };
  chair(SEAT.x, SEAT.z + 0.62, Math.PI, true);
  chair(SEAT.x + 0.62, SEAT.z, -Math.PI / 2, false);
  // Table: a 60 cm oak top with a rounded edge on a black cast pedestal and a three-foot base.
  part("oak", place(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 48).translate(0, 0.725, 0), SEAT.x, SEAT.z), { tile: 0.9 });
  part("oak", place(new THREE.TorusGeometry(0.3, 0.0105, 8, 48).rotateX(Math.PI / 2).translate(0, 0.725, 0), SEAT.x, SEAT.z), { tile: 0.9 });
  part("iron", place(new THREE.LatheGeometry([[0.0005, 0.7], [0.04, 0.7], [0.026, 0.64], [0.02, 0.4], [0.034, 0.12], [0.06, 0.05], [0.0005, 0.05]].map((p) => new THREE.Vector2(p[0], p[1])), 24), SEAT.x, SEAT.z), { tile: 1 });
  part("iron", place(new THREE.CylinderGeometry(0.21, 0.23, 0.02, 40).translate(0, 0.01, 0), SEAT.x, SEAT.z), { tile: 1 });
  const tableTop = 0.74, tx = (dx) => SEAT.x + dx, tz = (dz) => SEAT.z + dz;
  // The cup that has just been poured, with a saucer.
  part("ceramic", new THREE.CylinderGeometry(0.062, 0.05, 0.01, 28).translate(tx(0.13), tableTop + 0.005, tz(-0.06)), { tile: 1 });
  part("ceramic", new THREE.LatheGeometry([[0.0005, 0], [0.034, 0], [0.047, 0.066], [0.043, 0.066], [0.031, 0.01], [0.0005, 0.01]].map((p) => new THREE.Vector2(p[0], p[1])), 24).translate(tx(0.13), tableTop + 0.01, tz(-0.06)), { tile: 1 });
  part("ceramic", new THREE.TorusGeometry(0.019, 0.006, 8, 14, Math.PI * 1.1).rotateZ(-Math.PI * 0.55).translate(tx(0.13) + 0.05, tableTop + 0.05, tz(-0.06)), { tile: 1 });
  part("coffee", new THREE.CircleGeometry(0.039, 24).rotateX(-Math.PI / 2).translate(tx(0.13), tableTop + 0.071, tz(-0.06)), { tile: 1 });
  // An open notebook (two page blocks tilted into a shallow V on a dark cover) and a pen lying across it.
  {
    const nx = tx(-0.04), nz = tz(0.12), yaw = 0.35;
    const cover = new THREE.BoxGeometry(0.34, 0.008, 0.23).translate(0, tableTop + 0.004, 0);
    part("cover", place(cover, nx, nz, yaw), { tile: 1 });
    for (const side of [-1, 1]) {
      const pages = new THREE.BoxGeometry(0.155, 0.011, 0.205).rotateZ(side * 0.04).translate(side * 0.082, tableTop + 0.0135, 0);
      part("paper", place(pages, nx, nz, yaw), { tile: 1 });
      for (let i = 0; i < 6; i++) part("black", place(new THREE.BoxGeometry(0.11 - (i % 3) * 0.02, 0.0006, 0.0016).translate(side * 0.082 + (i % 2) * 0.004, tableTop + 0.0195 - side * 0.0035, -0.07 + i * 0.027), nx, nz, yaw), { tile: 1 });
    }
    part("black", place(new THREE.CylinderGeometry(0.0045, 0.0045, 0.15, 10).rotateZ(Math.PI / 2).rotateY(0.5).translate(0.02, tableTop + 0.0245, 0.05), nx, nz, yaw), { tile: 1 });
    part("steel", place(new THREE.CylinderGeometry(0.0048, 0.0048, 0.014, 10).rotateZ(Math.PI / 2).rotateY(0.5).translate(0.07, tableTop + 0.0245, 0.028), nx, nz, yaw), { tile: 1 });
  }
  // A glass vase of hydrangea: round white blooms on bent stems with big leaves.
  {
    const vx = tx(-0.16), vz = tz(-0.08);
    part("glass", new THREE.LatheGeometry([[0.0005, 0], [0.032, 0], [0.04, 0.05], [0.026, 0.1], [0.022, 0.14], [0.03, 0.155]].map((p) => new THREE.Vector2(p[0], p[1])), 20).translate(vx, tableTop, vz), { tile: 1 });
    part("water", new THREE.CylinderGeometry(0.036, 0.034, 0.06, 20).translate(vx, tableTop + 0.04, vz), { tile: 1 });
    let seed = 31; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 5; i++) {
      const a = i * 1.26 + 0.4, lean = 0.05 + rnd() * 0.05, h = 0.2 + rnd() * 0.06, bx = vx + Math.cos(a) * lean, bz = vz + Math.sin(a) * lean;
      part("leaf", tubeGeometry([[vx, tableTop + 0.07, vz], [(vx + bx) / 2, tableTop + 0.14, (vz + bz) / 2], [bx, tableTop + h, bz]], 0.0035, 8, 5), { tile: 1 });
      for (let k = 0; k < 18; k++) { const b = new THREE.SphereGeometry(0.0085 + rnd() * 0.004, 6, 4); part("bloom", b.translate(bx + (rnd() - 0.5) * 0.085, tableTop + h + 0.018 + (rnd() - 0.2) * 0.05, bz + (rnd() - 0.5) * 0.085), { tile: 1 }); }
      const leaf = new THREE.SphereGeometry(0.036, 8, 4); leaf.scale(1, 0.12, 0.62); part("leafDark", leaf.rotateY(a).translate(vx + Math.cos(a) * (lean + 0.035), tableTop + 0.165 + i * 0.012, vz + Math.sin(a) * (lean + 0.035)), { tile: 1 });
    }
  }

  // A floor plant between the counter end and the window: a lathed ceramic pot, soil, and eleven curved stems carrying ninety leaves.
  {
    const px = -2.88, pz = -0.62;
    part("pot", new THREE.LatheGeometry([[0.0005, 0], [0.12, 0], [0.16, 0.2], [0.17, 0.38], [0.158, 0.4], [0.0005, 0.4]].map((p) => new THREE.Vector2(p[0], p[1])), 28).translate(px, 0, pz), { tile: 1 });
    part("soil", new THREE.CircleGeometry(0.15, 24).rotateX(-Math.PI / 2).translate(px, 0.36, pz), { tile: 1 });
    let seed = 8; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    part("bentwood", tubeGeometry([[px, 0.36, pz], [px + 0.02, 0.8, pz - 0.01], [px - 0.01, 1.2, pz + 0.01], [px + 0.02, 1.5, pz]], 0.016, 14, 8), { tile: 0.6 });
    for (let i = 0; i < 9; i++) {
      const a = i * 0.72 + rnd() * 0.4, base = 0.7 + (i / 9) * 0.78, reach = 0.2 + rnd() * 0.22, rise = 0.12 + rnd() * 0.16;
      const bx = px + Math.cos(a) * 0.02, bz = pz + Math.sin(a) * 0.02, ex = px + Math.cos(a) * reach, ez = pz + Math.sin(a) * reach, ey = base + rise;
      part("bentwood", tubeGeometry([[bx, base, bz], [(bx + ex) / 2, base + rise * 0.7, (bz + ez) / 2], [ex, ey, ez]], 0.006, 8, 5), { tile: 0.6 });
      for (let k = 0; k < 6; k++) {
        const t = 0.3 + k / 6 * 0.7, lx = bx + (ex - bx) * t, ly = base + (ey - base) * t + 0.015, lz = bz + (ez - bz) * t;
        const leaf = new THREE.SphereGeometry(0.115, 8, 5); leaf.scale(0.55, 0.05, 1); leaf.translate(0, 0, 0.115);
        leaf.rotateX(-0.35 - rnd() * 0.3).rotateY(a + (k % 2 ? 1 : -1) * (0.9 + rnd() * 0.6)).rotateZ((rnd() - 0.5) * 0.3);
        part(k % 3 === 1 ? "leafDark" : "leaf", leaf.translate(lx, ly, lz), { tile: 1 });
      }
      const tip = new THREE.SphereGeometry(0.1, 8, 5); tip.scale(0.55, 0.05, 1); tip.translate(0, 0, 0.1); tip.rotateX(-0.2).rotateY(a); part("leaf", tip.translate(ex, ey, ez), { tile: 1 });
    }
  }

  // Shelf things: four plates and two mugs on the lower shelf; two jars with oak lids and a trailing pothos on the upper one.
  {
    const lower = 1.75 + 0.035, upper = 2.15 + 0.035, zS = BACK + 0.13;
    for (let i = 0; i < 4; i++) part("ceramic", new THREE.CylinderGeometry(0.095, 0.075, 0.013, 28).translate(-2.3, lower + 0.0065 + i * 0.014, zS), { tile: 1 });
    for (const [mx2, turn] of [[-1.95, 0], [-1.78, 1]]) {
      part("ceramic", new THREE.LatheGeometry([[0.0005, 0], [0.036, 0], [0.04, 0.09], [0.0005, 0.09]].map((p) => new THREE.Vector2(p[0], p[1])), 20).translate(mx2, lower, zS), { tile: 1 });
      part("ceramic", new THREE.TorusGeometry(0.02, 0.006, 8, 14, Math.PI).rotateZ(-Math.PI / 2 + turn * 0.2).translate(mx2 + 0.042, lower + 0.048, zS), { tile: 1 });
    }
    for (const [jx, jh] of [[-2.25, 0.22], [-2.07, 0.17]]) {
      part("ceramic", new THREE.CylinderGeometry(0.058, 0.062, jh, 24).translate(jx, upper + jh / 2, zS), { tile: 1 });
      part("oak", new THREE.CylinderGeometry(0.056, 0.056, 0.028, 24).translate(jx, upper + jh + 0.014, zS), { tile: 0.3 });
    }
    part("pot", new THREE.LatheGeometry([[0.0005, 0], [0.05, 0], [0.07, 0.11], [0.0005, 0.11]].map((p) => new THREE.Vector2(p[0], p[1])), 20).translate(-1.42, upper, zS), { tile: 1 });
    let seed = 14; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let v = 0; v < 5; v++) {
      const vx = -1.42 + (rnd() - 0.5) * 0.1, drop = 0.14 + rnd() * 0.14, lean = (rnd() - 0.5) * 0.2;
      part("leafDark", tubeGeometry([[vx, upper + 0.1, zS + 0.05], [vx + lean * 0.4, upper + 0.02, zS + 0.1], [vx + lean, upper - drop, zS + 0.12]], 0.0035, 12, 5), { tile: 1 });
      for (let k = 0; k < 7; k++) { const t = 0.12 + k / 7 * 0.88, leaf = new THREE.SphereGeometry(0.036, 8, 4); leaf.scale(1, 0.1, 0.75); leaf.rotateY(rnd() * 3).rotateZ((rnd() - 0.5) * 0.6); part("leaf", leaf.translate(vx + lean * t, upper + 0.08 - drop * t, zS + 0.07 + 0.05 * t + (rnd() - 0.5) * 0.03), { tile: 1 }); }
    }
    for (let k = 0; k < 8; k++) { const leaf = new THREE.SphereGeometry(0.05, 8, 4); leaf.scale(1, 0.1, 0.8); leaf.rotateY(k * 0.8).rotateZ((k % 3 - 1) * 0.35); part("leaf", leaf.translate(-1.42 + Math.cos(k * 0.8) * 0.06, upper + 0.13 + (k % 3) * 0.02, zS + Math.sin(k * 0.8) * 0.06), { tile: 1 }); }
  }

  // A small paper note leaning against the pastry case foot, like the notes in Rooms 01 to 03 (reading it comes with the interaction in section 5).
  const note = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.06, 0.003), materials.paper); note.name = "story-note";
  note.position.set(1.02, top + 0.032, c.z1 - 0.12); note.rotation.set(-0.28, 0.12, 0); note.castShadow = true; scene.add(note);
  flush("section4");

  // ---------- a more lived-in room (polish pass): wainscot, sconces and a clock on the right wall, a rug and a pendant at the window seat, counter details ----------
  {
    // Board-and-batten wainscot on the right wall: olive panel, battens every 30 cm, an oak cap rail and a thin base moulding.
    const wx = X1, z0w = BACK + 0.04, z1w = FRONT + 1.2;
    slab("wainscot", [wx - 0.024, wx], [0.11, 1.08], [z0w, z1w], { tile: 1 });
    for (let z = z0w + 0.15; z < z1w - 0.05; z += 0.3) slab("wainscot", [wx - 0.036, wx - 0.024], [0.11, 1.08], [z - 0.025, z + 0.025], { tile: 1 });
    slab("oak", [wx - 0.06, wx], [1.08, 1.115], [z0w, z1w], { grain: "z" });
    slab("oak", [wx - 0.03, wx], [0.08, 0.11], [z0w, z1w], { grain: "z" });
    // Two wall sconces: a black arm and a drum shade that glows in the dim moods.
    for (const sz of [-0.85, 1.3]) {
      slab("black", [wx - 0.02, wx], [1.86, 1.94], [sz - 0.04, sz + 0.04], { tile: 1 });
      part("black", rodGeometry([wx - 0.02, 1.9, sz], [wx - 0.17, 1.9, sz], 0.008), { tile: 1 });
      part("sconceGlow", new THREE.CylinderGeometry(0.075, 0.095, 0.15, 24, 1, true).translate(wx - 0.2, 1.9, sz), { tile: 1 });
      part("black", new THREE.CylinderGeometry(0.078, 0.078, 0.006, 24).translate(wx - 0.2, 1.978, sz), { tile: 1 });
    }
    // A round oak wall clock.
    const cz = 0.2, cy = 2.1;
    part("oak", new THREE.TorusGeometry(0.205, 0.022, 10, 40).rotateY(Math.PI / 2).translate(wx - 0.024, cy, cz), { tile: 0.5 });
    part("paper", new THREE.CylinderGeometry(0.195, 0.195, 0.012, 40).rotateZ(Math.PI / 2).translate(wx - 0.018, cy, cz), { tile: 1 });
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, r1 = i % 3 === 0 ? 0.155 : 0.17; part("black", rodGeometry([wx - 0.026, cy + Math.cos(a) * r1, cz + Math.sin(a) * r1], [wx - 0.026, cy + Math.cos(a) * 0.185, cz + Math.sin(a) * 0.185], i % 3 === 0 ? 0.004 : 0.0025), { tile: 1 }); }
    part("black", rodGeometry([wx - 0.03, cy, cz], [wx - 0.03, cy + 0.085, cz + 0.05], 0.005), { tile: 1 });
    part("black", rodGeometry([wx - 0.034, cy, cz], [wx - 0.034, cy - 0.04, cz + 0.13], 0.0035), { tile: 1 });
    part("black", new THREE.CylinderGeometry(0.012, 0.012, 0.014, 12).rotateZ(Math.PI / 2).translate(wx - 0.032, cy, cz), { tile: 1 });
  }
  {
    // Rattan drum pendant over the window seat, on a black cord and canopy.
    const px = SEAT.x + 0.05, pz = SEAT.z + 0.05, py = 1.78;
    part("black", new THREE.CylinderGeometry(0.003, 0.003, ROOM.height - py - 0.14, 8).translate(px, (ROOM.height + py + 0.14) / 2, pz), { tile: 1 });
    part("black", new THREE.CylinderGeometry(0.035, 0.05, 0.02, 20).translate(px, ROOM.height - 0.01, pz), { tile: 1 });
    part("pendantShade", new THREE.CylinderGeometry(0.17, 0.23, 0.26, 36, 1, true).translate(px, py, pz), { tile: 1 });
    part("black", new THREE.TorusGeometry(0.17, 0.006, 8, 36).rotateX(Math.PI / 2).translate(px, py + 0.13, pz), { tile: 1 });
    part("black", new THREE.TorusGeometry(0.23, 0.006, 8, 36).rotateX(Math.PI / 2).translate(px, py - 0.13, pz), { tile: 1 });
    for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2; part("black", rodGeometry([px + Math.cos(a) * 0.17, py + 0.13, pz + Math.sin(a) * 0.17], [px + Math.cos(a) * 0.23, py - 0.13, pz + Math.sin(a) * 0.23], 0.0016), { tile: 1 }); }
    part("warm", new THREE.SphereGeometry(0.035, 12, 8).translate(px, py + 0.03, pz), { tile: 1 });
  }
  {
    // Counter details on the customer side: two stacks of kraft takeaway cups with white lids, a tip jar and a card reader on a stand.
    const cupStack = (x, z, n) => {
      for (let i = 0; i < n; i++) part("kraft", new THREE.CylinderGeometry(0.037, 0.027, 0.09, 20, 1, true).translate(x, top + 0.045 + i * 0.03, z), { tile: 1 });
      part("kraft", new THREE.CylinderGeometry(0.027, 0.027, 0.004, 20).translate(x, top + 0.002, z), { tile: 1 });
      part("lid", new THREE.CylinderGeometry(0.04, 0.04, 0.008, 20).translate(x, top + 0.03 * (n - 1) + 0.094, z), { tile: 1 });
      part("lid", new THREE.TorusGeometry(0.038, 0.005, 6, 20).rotateX(Math.PI / 2).translate(x, top + 0.03 * (n - 1) + 0.09, z), { tile: 1 });
    };
    cupStack(-0.42, c.z1 - 0.14, 5); cupStack(-0.3, c.z1 - 0.16, 4);
    part("glass", new THREE.CylinderGeometry(0.06, 0.06, 0.13, 24).translate(-0.12, top + 0.065, c.z1 - 0.13), { tile: 1 });
    part("gold", new THREE.CylinderGeometry(0.057, 0.057, 0.034, 20).translate(-0.12, top + 0.025, c.z1 - 0.13), { tile: 1 });
    for (let i = 0; i < 6; i++) part("gold", new THREE.CylinderGeometry(0.011, 0.011, 0.002, 10).rotateX(Math.PI / 2 - 0.4).translate(-0.12 + (i % 3 - 1) * 0.02, top + 0.045 + Math.floor(i / 3) * 0.018, c.z1 - 0.13 + 0.02), { tile: 1 });
    part("black", new THREE.CylinderGeometry(0.07, 0.075, 0.012, 24).translate(0.55, top + 0.006, c.z1 - 0.2), { tile: 1 });
    part("black", rodGeometry([0.55, top + 0.012, c.z1 - 0.2], [0.55, top + 0.12, c.z1 - 0.215], 0.012), { tile: 1 });
    part("tablet", roundedBox(0.2, 0.14, 0.012, 0.012, 0.002).rotateX(-0.32).translate(0.55, top + 0.165, c.z1 - 0.225), { tile: 1 });
  }
  {
    // A round jute rug under the window seat (a standalone mesh: a lid texture on the top face only).
    const rugTexture = makeRugTexture();
    const rug = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.014, 56), [new THREE.MeshStandardMaterial({ color: 0xb59868, roughness: 1 }), new THREE.MeshStandardMaterial({ map: rugTexture, roughness: 1 }), new THREE.MeshStandardMaterial({ color: 0x7a6040 })]);
    rug.name = "window-rug"; rug.position.set(SEAT.x + 0.2, 0.007, SEAT.z + 0.28); rug.receiveShadow = true; scene.add(rug);
  }
  // ---------- the front wall (behind the visitor): a glass door, a floor-to-ceiling window, hooks, an umbrella stand and a mat (Codex card 47, A) ----------
  {
    const FW = FRONT + 1.2, T = 0.2; // the inner face of the front wall and its thickness
    const WIN = { x0: -1.95, x1: -0.15, y0: 0.12, y1: 2.45 }, DOOR = { x0: 0.0, x1: 0.95, y1: 2.15 }, TOPY = 2.45; // the door leaf is 950 x 2150 under a 300 transom, the window 1800 x 2450
    // The wall in pieces around the openings, so the street really shows through them.
    slab("wall", [X0 - 0.22, WIN.x0], [0, ROOM.height], [FW, FW + T], { tile: 1 });
    slab("wall", [WIN.x1, DOOR.x0], [0, ROOM.height], [FW, FW + T], { tile: 1 });
    slab("wall", [DOOR.x1, X1 + 0.1], [0, ROOM.height], [FW, FW + T], { tile: 1 });
    slab("wall", [WIN.x0, DOOR.x1], [TOPY, ROOM.height], [FW, FW + T], { tile: 1 });
    slab("wall", [WIN.x0, WIN.x1], [0, WIN.y0], [FW, FW + T], { tile: 1 });
    // Window: a black steel frame 5 cm wide, three panes across and three down, one pane of glass.
    const bar = 0.05, depth = 0.06, zf = FW + 0.09, W = WIN.x1 - WIN.x0, H = WIN.y1 - WIN.y0;
    const frameBar = (x0, x1, y0, y1) => slab("frame", [x0, x1], [y0, y1], [zf - depth / 2, zf + depth / 2], { tile: 1 });
    frameBar(WIN.x0, WIN.x0 + bar, WIN.y0, WIN.y1); frameBar(WIN.x1 - bar, WIN.x1, WIN.y0, WIN.y1);
    frameBar(WIN.x0, WIN.x1, WIN.y0, WIN.y0 + bar); frameBar(WIN.x0, WIN.x1, WIN.y1 - bar, WIN.y1);
    for (const k of [1, 2]) { const x = WIN.x0 + (W * k) / 3; frameBar(x - bar / 2, x + bar / 2, WIN.y0, WIN.y1); const y = WIN.y0 + (H * k) / 3; frameBar(WIN.x0, WIN.x1, y - bar / 2, y + bar / 2); }
    part("pane", new THREE.PlaneGeometry(W, H).rotateY(Math.PI).translate((WIN.x0 + WIN.x1) / 2, (WIN.y0 + WIN.y1) / 2, zf), { tile: 1 });
    // Door: a steel-framed glass leaf with a push-pull bar, a kick plate, and a glazed transom above.
    const stile = 0.07, dz = FW + 0.09;
    const doorBar = (x0, x1, y0, y1) => slab("frame", [x0, x1], [y0, y1], [dz - 0.03, dz + 0.03], { tile: 1 });
    doorBar(DOOR.x0, DOOR.x0 + stile, 0, DOOR.y1); doorBar(DOOR.x1 - stile, DOOR.x1, 0, DOOR.y1);
    doorBar(DOOR.x0, DOOR.x1, DOOR.y1 - stile, DOOR.y1); doorBar(DOOR.x0, DOOR.x1, 0, 0.22); doorBar(DOOR.x0, DOOR.x1, DOOR.y1, DOOR.y1 + 0.04);
    doorBar(DOOR.x0, DOOR.x1, TOPY - 0.04, TOPY); doorBar((DOOR.x0 + DOOR.x1) / 2 - 0.02, (DOOR.x0 + DOOR.x1) / 2 + 0.02, DOOR.y1 + 0.04, TOPY - 0.04);
    doorBar(DOOR.x0, DOOR.x0 + 0.04, DOOR.y1 + 0.04, TOPY); doorBar(DOOR.x1 - 0.04, DOOR.x1, DOOR.y1 + 0.04, TOPY);
    part("pane", new THREE.PlaneGeometry(DOOR.x1 - DOOR.x0 - 2 * stile, DOOR.y1 - stile - 0.22).rotateY(Math.PI).translate((DOOR.x0 + DOOR.x1) / 2, (DOOR.y1 - stile + 0.22) / 2, dz), { tile: 1 });
    part("pane", new THREE.PlaneGeometry(DOOR.x1 - DOOR.x0, TOPY - DOOR.y1 - 0.08).rotateY(Math.PI).translate((DOOR.x0 + DOOR.x1) / 2, (DOOR.y1 + 0.04 + TOPY - 0.04) / 2, dz), { tile: 1 });
    const hx = DOOR.x1 - stile - 0.045; // a long D-pull bar on the latch side, standing off the glass on two posts
    part("black", rodGeometry([hx, 0.95, dz - 0.07], [hx, 1.55, dz - 0.07], 0.014, 10), { tile: 1 });
    for (const y of [0.99, 1.51]) part("black", rodGeometry([hx, y, dz - 0.03], [hx, y, dz - 0.07], 0.01, 8), { tile: 1 });
    for (const y of [0.4, 1.1, 1.8]) part("black", new THREE.CylinderGeometry(0.014, 0.014, 0.05, 10).rotateX(Math.PI / 2).translate(DOOR.x0 + 0.02, y, dz - 0.04), { tile: 1 }); // hinge knuckles
    // The street behind it: the painted Xintiandi view, tinted with the mood, on a big plane 1.6 m outside the wall.
    const street2 = add("front-street-view", new THREE.PlaneGeometry(7.2, 4.8), materials.street, -0.5, 1.6, FW + T + 1.6, { cast: false, receive: false });
    street2.rotation.y = Math.PI; // faces -z, into the room
    // Olive board-and-batten wainscot on the front wall, either side of the openings, and skirting.
    for (const [a0, a1] of [[X0 + 0.04, WIN.x0], [DOOR.x1, X1 - 0.04]]) {
      slab("wainscot", [a0, a1], [0.11, 1.08], [FW - 0.024, FW], { tile: 1 });
      for (let x = a0 + 0.15; x < a1 - 0.05; x += 0.3) slab("wainscot", [x - 0.025, x + 0.025], [0.11, 1.08], [FW - 0.036, FW - 0.024], { tile: 1 });
      slab("oak", [a0, a1], [1.08, 1.115], [FW - 0.06, FW], { grain: "x" }); slab("oak", [a0, a1], [0.08, 0.11], [FW - 0.03, FW], { grain: "x" });
    }
    slab("oak", [WIN.x0, WIN.x1], [0.08, 0.12], [FW - 0.03, FW], { grain: "x" }); // the sill under the window
    // A blank hanging sign (what it says is for Paul to decide) and the door mat. (Paul, 2026-11-13: no coat hooks and no umbrella stand at the door; a public cafe
    // does not hang visitors' coats, an umbrella stand's rings do not bake well in 360 degrees, and walls, light and small things carry the atmosphere better.)
    slab("black", [1.07, 1.35], [1.84, 1.86], [FW - 0.012, FW - 0.006], { tile: 1 }); slab("black", [1.07, 1.35], [2.0, 2.02], [FW - 0.012, FW - 0.006], { tile: 1 });
    slab("black", [1.07, 1.09], [1.84, 2.02], [FW - 0.012, FW - 0.006], { tile: 1 }); slab("black", [1.33, 1.35], [1.84, 2.02], [FW - 0.012, FW - 0.006], { tile: 1 });
    slab("paper", [1.09, 1.33], [1.86, 2.0], [FW - 0.012, FW - 0.008], { tile: 1 });
    part("black", rodGeometry([1.12, 2.02, FW - 0.01], [1.21, 2.12, FW - 0.01], 0.003, 6), { tile: 1 }); part("black", rodGeometry([1.3, 2.02, FW - 0.01], [1.21, 2.12, FW - 0.01], 0.003, 6), { tile: 1 });
    // A small gallery of framed prints right of the door, like Room 02's posters: four frames (oak, black and brass), each with a linen mat. The four paintings share one atlas.
    const artGeometries = [], PRINTS = [
      { x: 1.8, y: 1.8, w: 0.46, h: 0.6, col: 0, row: 0, frame: "oak" },
      { x: 2.7, y: 2.12, w: 0.7, h: 0.5, col: 1, row: 0, frame: "black" },
      { x: 2.4, y: 1.45, w: 0.3, h: 0.3, col: 1, row: 1, frame: "oak" },
      { x: 2.9, y: 1.5, w: 0.3, h: 0.4, col: 0, row: 1, frame: "gold" },
    ];
    for (const p of PRINTS) {
      const fw = 0.035, mat = 0.05, ow = p.w + 2 * (fw + mat), oh = p.h + 2 * (fw + mat), z0 = FW - 0.03;
      slab(p.frame, [p.x - ow / 2, p.x + ow / 2], [p.y + oh / 2 - fw, p.y + oh / 2], [z0, FW], { grain: "x" }); slab(p.frame, [p.x - ow / 2, p.x + ow / 2], [p.y - oh / 2, p.y - oh / 2 + fw], [z0, FW], { grain: "x" });
      slab(p.frame, [p.x - ow / 2, p.x - ow / 2 + fw], [p.y - oh / 2 + fw, p.y + oh / 2 - fw], [z0, FW], { grain: "y" }); slab(p.frame, [p.x + ow / 2 - fw, p.x + ow / 2], [p.y - oh / 2 + fw, p.y + oh / 2 - fw], [z0, FW], { grain: "y" });
      slab("paper", [p.x - ow / 2 + fw, p.x + ow / 2 - fw], [p.y - oh / 2 + fw, p.y + oh / 2 - fw], [z0, z0 + 0.008], { tile: 1 });
      const art = new THREE.PlaneGeometry(p.w, p.h).rotateY(Math.PI).translate(p.x, p.y, z0 - 0.0005), pos = art.attributes.position, uv = art.attributes.uv;
      for (let i = 0; i < pos.count; i++) { // seen from inside the room world +x is to the left, so the picture runs the other way; crop the tile to the frame's proportions
        const u = 1 - (pos.getX(i) - (p.x - p.w / 2)) / p.w, v = (pos.getY(i) - (p.y - p.h / 2)) / p.h;
        const uc = 0.5 + (u - 0.5) * Math.min(1, p.w / p.h), vc = 0.5 + (v - 0.5) * Math.min(1, p.h / p.w);
        uv.setXY(i, (p.col + 0.02 + uc * 0.96) * 0.5, 1 - (p.row + 1 - 0.02 - vc * 0.96) * 0.5);
      }
      artGeometries.push(art);
    }
    const wallArt = new THREE.Mesh(mergeGeometries(artGeometries), new THREE.MeshStandardMaterial({ map: makePrintAtlas(), roughness: 0.85 }));
    wallArt.name = "wall-art"; wallArt.receiveShadow = true; scene.add(wallArt);
    slab("cane", [DOOR.x0 + 0.02, DOOR.x1 - 0.02], [0, 0.012], [FW - 0.78, FW - 0.08], { tile: 1 }); // the door mat
    // From Codex's ceiling plan (card 47, C): a small sister of the window rattan lamp near the door, and two glass globes over the counter.
    const lampAt = (lx, lz, ly, r, h) => {
      part("black", new THREE.CylinderGeometry(0.003, 0.003, ROOM.height - ly - h / 2, 8).translate(lx, (ROOM.height + ly + h / 2) / 2, lz), { tile: 1 });
      part("black", new THREE.CylinderGeometry(0.03, 0.045, 0.02, 20).translate(lx, ROOM.height - 0.01, lz), { tile: 1 });
      part("pendantShade", new THREE.CylinderGeometry(r * 0.75, r, h, 32, 1, true).translate(lx, ly, lz), { tile: 1 });
      part("black", new THREE.TorusGeometry(r, 0.005, 8, 32).rotateX(Math.PI / 2).translate(lx, ly - h / 2, lz), { tile: 1 });
      part("warm", new THREE.SphereGeometry(0.03, 10, 8).translate(lx, ly + 0.02, lz), { tile: 1 });
    };
    lampAt(-1.1, 2.9, 2.0, 0.19, 0.2);
    for (const gx of [-0.4, 0.8]) {
      part("black", new THREE.CylinderGeometry(0.003, 0.003, ROOM.height - 1.9, 8).translate(gx, (ROOM.height + 1.9) / 2, -0.65), { tile: 1 });
      part("black", new THREE.CylinderGeometry(0.03, 0.045, 0.02, 20).translate(gx, ROOM.height - 0.01, -0.65), { tile: 1 });
      part("glass", new THREE.SphereGeometry(0.12, 24, 16).translate(gx, 1.78, -0.65), { tile: 1 });
      part("warm", new THREE.SphereGeometry(0.045, 12, 8).translate(gx, 1.78, -0.65), { tile: 1 });
      part("gold", new THREE.CylinderGeometry(0.028, 0.034, 0.05, 14).translate(gx, 1.92, -0.65), { tile: 1 });
    }
  }
  const pendantLight = new THREE.PointLight(0xffc88a, 0, 2.6, 2); pendantLight.position.set(SEAT.x + 0.05, 1.7, SEAT.z + 0.05); scene.add(pendantLight);
  flush("polish");

  // Steam rising from the barista's cup and from the cup on the window table: a few soft puffs, drifting up and widening.
  const steamTexture = makeSteamTexture();
  const steamPositions = [];
  for (const [sx, sy, sz] of [[PITCHER.x, PITCHER.y + 0.04, PITCHER.z], [GREETER_CUP.x, GREETER_CUP.y + 0.074, GREETER_CUP.z], [tx(0.13), tableTop + 0.075, tz(-0.06)]]) {
    for (let i = 0; i < 4; i++) steamPositions.push(sx + Math.sin(i * 1.7) * 0.012, sy + 0.05 + i * 0.07, sz + Math.cos(i * 1.3) * 0.01);
  }
  const steamGeometry = new THREE.BufferGeometry(); steamGeometry.setAttribute("position", new THREE.Float32BufferAttribute(steamPositions, 3));
  const steam = new THREE.Points(steamGeometry, new THREE.PointsMaterial({ map: steamTexture, size: 0.11, sizeAttenuation: true, transparent: true, opacity: 0.3, depthWrite: false, color: 0xffffff }));
  steam.name = "steam"; scene.add(steam);

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

  // Sun shafts: soft light beams from each pane column of the street window along the sun direction, as pairs of crossed additive quads in one mesh (one draw call).
  // They show where the light comes from in the morning and at golden hour and fade away at midday, in rain and after closing.
  const SUN_TARGET = new THREE.Vector3(0.5, 0, -0.6);
  const shaftTexture = (() => {
    const canvas = document.createElement("canvas"); canvas.width = 128; canvas.height = 64;
    const g = canvas.getContext("2d"), img = g.createImageData(128, 64);
    for (let y = 0; y < 64; y++) for (let x = 0; x < 128; x++) {
      const along = Math.pow(1 - x / 127, 1.4) * Math.min(1, x / 10), across = Math.pow(Math.sin((y / 63) * Math.PI), 1.2), a = Math.round(255 * along * across);
      const i = (y * 128 + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = a; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.NoColorSpace; return texture;
  })();
  const SHAFT_LENGTH = 5.2, shaftParts = [];
  for (const zc of [-0.5, 0.3, 1.1]) {
    const flat = new THREE.PlaneGeometry(SHAFT_LENGTH, 0.78).rotateX(-Math.PI / 2).translate(SHAFT_LENGTH / 2, 0, zc - 0.3);
    const upright = new THREE.PlaneGeometry(SHAFT_LENGTH, 1.5).translate(SHAFT_LENGTH / 2, 0, zc - 0.3);
    shaftParts.push(flat, upright);
  }
  const sunShafts = new THREE.Mesh(mergeGeometries(shaftParts.map((g) => (g.index ? g.toNonIndexed() : g))), new THREE.MeshBasicMaterial({ map: shaftTexture, color: 0xfff3e6, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  sunShafts.name = "sun-shafts"; sunShafts.position.set(X0 - 0.02, 1.7, 0.3); sunShafts.renderOrder = 2; sunShafts.frustumCulled = false; scene.add(sunShafts);

  // A warm lamp pool over the counter for the dim moods (a point light: no draw call).
  const lamp = new THREE.PointLight(0xffc88a, 0, 3.6, 2); lamp.position.set(0.4, 2.35, -0.55); scene.add(lamp);
  // The street painting with rain drawn over it, made once the first time the rain mood is chosen: pale falling strokes leaning one way and a few beads.
  // One painted street per mood (Codex, card 47 D): the morning painting for morning and midday, then golden hour, rain and night. The rain painting has no rain in it;
  // falling rain is drawn over it once, the first time it is needed. Until a painting has loaded the morning one stays.
  const MOOD_STREET = { morning: "room04-window-xintiandi-morning-v1.webp", noon: "room04-window-xintiandi-morning-v1.webp", golden: "room04-window-xintiandi-golden-v1.webp", rain: "room04-window-xintiandi-rain-v1.webp", closing: "room04-window-xintiandi-night-v1.webp" };
  const streetTextures = {};
  let rainStreet = null;
  function rainOver(texture) {
    if (rainStreet) return rainStreet;
    const image = texture.image, canvas = document.createElement("canvas"); canvas.width = image.width; canvas.height = image.height;
    const g = canvas.getContext("2d"), w = canvas.width, h = canvas.height;
    g.drawImage(image, 0, 0, w, h);
    let seed = 17; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 520; i++) { const x = rnd() * w * 1.1 - w * 0.05, y = rnd() * h, len = 60 + rnd() * 110; g.strokeStyle = `rgba(232,240,246,${(0.14 + rnd() * 0.22).toFixed(2)})`; g.lineWidth = 2 + rnd() * 2.4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + len * 0.17, y + len); g.stroke(); }
    rainStreet = new THREE.CanvasTexture(canvas); rainStreet.colorSpace = THREE.SRGBColorSpace; rainStreet.anisotropy = maxAnisotropy;
    return rainStreet;
  }
  function streetTexture(name) {
    const file = MOOD_STREET[name];
    if (file === MOOD_STREET.morning) return materials.street.userData.dry ?? null;
    if (!(file in streetTextures)) {
      streetTextures[file] = null;
      textureLoader.load(artBase + file, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.anisotropy = maxAnisotropy; streetTextures[file] = t; loadedArt.add(file); applyStreet(currentMood); render(); });
    }
    return streetTextures[file];
  }
  function applyStreet(name) {
    let t = streetTexture(name) ?? materials.street.userData.dry ?? null; // the morning painting stands in until this mood's painting has loaded
    if (t && name === "rain" && t !== materials.street.userData.dry) t = rainOver(t);
    if (t && materials.street.map !== t) { materials.street.map = t; materials.street.needsUpdate = true; }
  }

  let currentMood = "morning", moodTween = 0;
  const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const blend = (a, b, k) => a + (b - a) * k;
  const live = { shaft: 0, pendant: 0, sun: 0, hemi: 0, ambient: 0, track: 0, lamp: 0, exposure: 1, reflect: 1, steam: 0.3, sunColor: new THREE.Color(), sunPosition: new THREE.Vector3(), hemiSky: new THREE.Color(), hemiGround: new THREE.Color(), trackColor: new THREE.Color(), street: new THREE.Color() };
  function applyLive() {
    sun.intensity = live.sun; sun.color.copy(live.sunColor); sun.position.copy(live.sunPosition);
    hemi.intensity = live.hemi; hemi.color.copy(live.hemiSky); hemi.groundColor.copy(live.hemiGround);
    ambient.intensity = live.ambient; lamp.intensity = live.lamp;
    for (const spot of trackLights) { spot.intensity = live.track; spot.color.copy(live.trackColor); }
    renderer.toneMappingExposure = live.exposure; materials.street.color.copy(live.street);
    for (const [key, base] of Object.entries(reflectiveBase)) materials[key].envMapIntensity = base * live.reflect;
    steam.material.opacity = live.steam;
    sunShafts.material.opacity = live.shaft; sunShafts.material.color.copy(live.sunColor);
    sunShafts.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), SUN_TARGET.clone().sub(live.sunPosition).normalize());
    materials.pendantShade.emissiveIntensity = live.pendant; materials.sconceGlow.emissiveIntensity = live.pendant * 1.5; pendantLight.intensity = live.pendant * 0.9;
  }
  function setMood(name) {
    const look = MOODS[name]; if (!look) return false;
    currentMood = name;
    const targetSky = new THREE.Color(look.sky); scene.background = targetSky;
    applyStreet(name);
    const from = { shaft: live.shaft, pendant: live.pendant, sun: live.sun, hemi: live.hemi, ambient: live.ambient, track: live.track, lamp: live.lamp, exposure: live.exposure, reflect: live.reflect, steam: live.steam, sunColor: live.sunColor.clone(), sunPosition: live.sunPosition.clone(), hemiSky: live.hemiSky.clone(), hemiGround: live.hemiGround.clone(), trackColor: live.trackColor.clone(), street: live.street.clone() };
    const to = { sunColor: new THREE.Color(look.sunColor), sunPosition: new THREE.Vector3(...look.sunPosition), hemiSky: new THREE.Color(look.hemiSky), hemiGround: new THREE.Color(look.hemiGround), trackColor: new THREE.Color(look.trackColor), street: new THREE.Color(look.street) };
    const step = (k) => {
      for (const key of ["sun", "hemi", "ambient", "track", "lamp", "exposure", "reflect", "steam", "pendant", "shaft"]) live[key] = blend(from[key], look[key], k);
      live.sunColor.copy(from.sunColor).lerp(to.sunColor, k); live.sunPosition.copy(from.sunPosition).lerp(to.sunPosition, k);
      live.hemiSky.copy(from.hemiSky).lerp(to.hemiSky, k); live.hemiGround.copy(from.hemiGround).lerp(to.hemiGround, k);
      live.trackColor.copy(from.trackColor).lerp(to.trackColor, k); live.street.copy(from.street).lerp(to.street, k);
      applyLive(); render();
    };
    cancelAnimationFrame(moodTween);
    if (reducedMotion() || frames === 0) { step(1); return true; } // the first call and reduced motion jump straight to the look
    const t0 = performance.now(), T = 600;
    const run = (now) => { const k = Math.min(1, (now - t0) / T), e = k * k * (3 - 2 * k); step(e); if (k < 1) moodTween = requestAnimationFrame(run); };
    moodTween = requestAnimationFrame(run);
    return true;
  }
  // ---------- looks ----------
  const currentLook = { ...DEFAULT_LOOK };
  const OAK_BASE = new THREE.Color(0xe0bd90); // the recessed panel fields start a shade deeper than the frames
  function setLook(group, key, userPick = false) {
    const options = LOOK_GROUPS[group]; if (!options || !(key in options)) return false;
    currentLook[group] = key; const v = options[key]; if (group === "wainscot" && userPick) wainscotChosen = true;
    if (group === "brick") materials.brick.color.setRGB(...v);
    else if (group === "counter") { materials.oak.color.setRGB(...v); materials.oakDeep.color.setRGB(OAK_BASE.r * v[0], OAK_BASE.g * v[1], OAK_BASE.b * v[2]); }
    else if (group === "back") { materials.olive.color.setHex(v); applyWainscot(); }
    else if (group === "wainscot") applyWainscot();
    else if (group === "wall") { currentLook.wallpaper = "none"; applyWall(); }
    else if (group === "wallpaper") { applyWall(); const pairing = WAINSCOT_FOR_PAPER[key]; if (pairing && !wainscotChosen) { currentLook.wainscot = pairing[0]; applyWainscot(); } else if (!pairing && !wainscotChosen) { currentLook.wainscot = "same"; applyWainscot(); } }
    else if (group === "floor") materials.floor.color.setRGB(...v);
    else if (group === "lamp") { materials.pendantShade.color.setHex(v); materials.sconceGlow.color.setHex(v === 0x2b2b2c ? 0xf3e2c2 : v); }
    else if (group === "scarf") materials.scarf.color.setHex(v);
    else if (group === "chair") materials.bentwood.color.setHex(v);
    render(); return true;
  }
  function randomLook(rng = Math.random) {
    const pick = (group, except = []) => { const keys = Object.keys(LOOK_GROUPS[group]).filter((k) => !except.includes(k)); return keys[Math.floor(rng() * keys.length)]; };
    const brick = pick("brick");
    const picks = { brick, counter: pick("counter"), back: pick("back"), wall: pick("wall", brick === "grey" ? ["grey", "mist"] : brick === "dusty" ? ["butter"] : []), floor: pick("floor"), lamp: pick("lamp"), scarf: pick("scarf"), chair: pick("chair") };
    for (const [group, key] of Object.entries(picks)) setLook(group, key);
    wainscotChosen = false; setLook("wainscot", "same");
    if (rng() < 0.4) { const paper = pick("wallpaper", ["none"]); setLook("wallpaper", paper); const options = WAINSCOT_FOR_PAPER[paper]; setLook("wainscot", options[Math.floor(rng() * options.length)]); } // two rooms in five get one of Room 01's wallpapers, with a wainscot that suits it
    else if (rng() < 0.45) setLook("wainscot", pick("wainscot", ["same"]));
    return { ...currentLook };
  }
  function reapplyLook() { const paper = currentLook.wallpaper, wain = currentLook.wainscot; for (const [group, key] of Object.entries(currentLook)) if (group !== "wallpaper" && group !== "wainscot") setLook(group, key); currentLook.wallpaper = paper; currentLook.wainscot = wain; applyWall(); applyWainscot(); } // a texture that loads late must not undo the chosen look
  // The wall is either a painted colour or one of Room 01's wallpapers (a colour choice replaces the paper, as in Room 01).
  let wainscotChosen = false; // once the visitor picks a wainscot colour themselves, a paper no longer changes it
  function applyWainscot() { const key = currentLook.wainscot, hex = LOOK_GROUPS.wainscot[key]; materials.wainscot.color.setHex(hex ?? LOOK_GROUPS.back[currentLook.back]); }
  const wallpaperTextures = {};
  function applyWall() {
    const paper = LOOK_GROUPS.wallpaper[currentLook.wallpaper];
    if (!paper) { materials.wall.map = null; materials.wall.color.setHex(LOOK_GROUPS.wall[currentLook.wall]); }
    else {
      const [file, size] = paper;
      const texture = wallpaperTextures[file] ||= textureLoader.load(new URL(`../tex/${file}`, import.meta.url).href, () => render());
      texture.colorSpace = THREE.SRGBColorSpace; texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.anisotropy = maxAnisotropy; texture.repeat.set(1 / size, 1 / size);
      materials.wall.map = texture; materials.wall.color.setHex(0xffffff);
    }
    materials.wall.needsUpdate = true;
  }
  const resetLook = () => { wainscotChosen = false; for (const [group, key] of Object.entries(DEFAULT_LOOK)) setLook(group, key); return { ...currentLook }; };

  // Where the robot's head and the paper note are on screen, in client pixels, so the page can float tap targets and bubbles over them.
  const projectBox = (object) => {
    const box = new THREE.Box3().setFromObject(object), rect = stage.getBoundingClientRect();
    let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity, behind = false;
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
      const p = new THREE.Vector3(x, y, z).project(camera); if (p.z > 1) behind = true;
      const px = rect.left + (p.x + 1) / 2 * rect.width, py = rect.top + (1 - p.y) / 2 * rect.height;
      left = Math.min(left, px); right = Math.max(right, px); top = Math.min(top, py); bottom = Math.max(bottom, py);
    }
    if (behind || right < rect.left || left > rect.right || bottom < rect.top || top > rect.bottom) return null;
    return { left, right, top, bottom };
  };
  let robotRest = robot.position.y, hopRun = 0;
  function robotHop() {
    if (reducedMotion()) return;
    const run = ++hopRun, t0 = performance.now(), T = 520;
    const step = (now) => { if (run !== hopRun) return; const k = Math.min(1, (now - t0) / T); robot.position.y = robotRest + Math.sin(k * Math.PI) * 0.045; render(); if (k < 1) requestAnimationFrame(step); else { robot.position.y = robotRest; render(); } };
    requestAnimationFrame(step);
  }
  const onRenderHooks = [];

  let frames = 0;
  function render() { renderer.render(scene, camera); frames++; for (const hook of onRenderHooks) hook(); }
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

  // Stand in the middle of the room and turn all the way round (the second way to look, like Room 02 and Room 03): the orbit is switched off, the camera walks to the
  // station and a drag, or the arrow keys, turn the head. Leaving restores the exact orbit view.
  const CENTER_STATION = new THREE.Vector3(0.1, 1.55, 1.2), CENTER_FOV = compact ? 84 : 72;
  let center = null, savedOrbit = null, centerDrag = null;
  const applyCenter = () => {
    const { yaw, pitch } = center;
    camera.position.copy(CENTER_STATION);
    camera.lookAt(CENTER_STATION.x + Math.sin(yaw) * Math.cos(pitch), CENTER_STATION.y + Math.sin(pitch), CENTER_STATION.z - Math.cos(yaw) * Math.cos(pitch));
    camera.updateMatrixWorld(); render();
  };
  function centerLook(dYaw, dPitch) { if (!center) return; center.yaw += dYaw; center.pitch = Math.min(0.6, Math.max(-0.6, center.pitch + dPitch)); applyCenter(); }
  function setCenterView(on) {
    if (on === Boolean(center)) return;
    const canvas = renderer.domElement;
    if (on) {
      savedOrbit = { position: camera.position.clone(), target: controls.target.clone(), fov: camera.fov };
      controls.enabled = false; canvas.tabIndex = 0;
      center = { yaw: Math.PI * 0.82, pitch: -0.04 }; // it opens on the new front wall: the street window and the glass door
      camera.fov = CENTER_FOV; camera.updateProjectionMatrix(); applyCenter();
    } else {
      center = null; centerDrag = null; canvas.tabIndex = -1;
      camera.position.copy(savedOrbit.position); controls.target.copy(savedOrbit.target); camera.fov = savedOrbit.fov; camera.updateProjectionMatrix();
      controls.enabled = true; controls.update(); render();
    }
  }
  {
    const canvas = renderer.domElement;
    canvas.addEventListener("pointerdown", (event) => { if (!center) return; centerDrag = { x: event.clientX, y: event.clientY }; canvas.setPointerCapture?.(event.pointerId); });
    canvas.addEventListener("pointermove", (event) => { if (!center || !centerDrag) return; const k = (CENTER_FOV * Math.PI / 180) / canvas.clientHeight; centerLook(-(event.clientX - centerDrag.x) * k * 1.1, (event.clientY - centerDrag.y) * k * 0.8); centerDrag = { x: event.clientX, y: event.clientY }; });
    const end = () => { centerDrag = null; };
    canvas.addEventListener("pointerup", end); canvas.addEventListener("pointercancel", end);
    canvas.addEventListener("keydown", (event) => {
      if (!center) return;
      const step = event.shiftKey ? 0.25 : 0.1;
      if (event.key === "ArrowLeft") centerLook(-step, 0); else if (event.key === "ArrowRight") centerLook(step, 0); else if (event.key === "ArrowUp") centerLook(0, step); else if (event.key === "ArrowDown") centerLook(0, -step); else return;
      event.preventDefault();
    });
  }

  const instance = {
    camera, controls, render, resize, setMood,
    moods: () => Object.keys(MOODS),
    onRender: (hook) => { onRenderHooks.push(hook); },
    robotScreen: () => projectBox(robot),
    noteScreen: () => projectBox(note),
    robotHop, setCenterView, centerLook, isCenter: () => Boolean(center),
    lookDefaults: DEFAULT_LOOK, setLook, randomLook, resetLook, look: () => ({ ...currentLook }), lookGroups: () => Object.fromEntries(Object.entries(LOOK_GROUPS).map(([g, o]) => [g, Object.keys(o)])),
    info() {
      let vertices = 0, meshes = 0;
      scene.traverse((object) => { if (object.isMesh) { meshes++; vertices += object.geometry.attributes.position.count; } });
      render();
      const blockout = []; scene.traverse((object) => { if (object.isMesh && object.name.startsWith("blockout-") && !blockout.includes(object.name)) blockout.push(object.name); });
      return {
        title: ROOM_TITLE, stage: "section-6-front-wall", art: [...loadedArt].sort(), mood: currentMood, look: { ...currentLook }, dimensions: { ...ROOM },
        vertices, meshes, drawCalls: renderer.info.render.calls, renderFrame: frames,
        counter: { lengthMm: Math.round((COUNTER.x1 - COUNTER.x0) * 1000), heightMm: Math.round(COUNTER.height * 1000), depthMm: Math.round((COUNTER.z1 - COUNTER.z0) * 1000) },
        window: { widthMm: Math.round(wz * 1000), heightMm: Math.round(wy * 1000), sillMm: Math.round(WINDOW.y0 * 1000) },
        robot: (() => { const top = new THREE.Box3().setFromObject(robot).max.y; return { headTopMm: Math.round(top * 1000), aboveCounterMm: Math.round((top - COUNTER.height) * 1000) }; })(),
        blockout,
      };
    },
    mood: () => currentMood,
    dispose() { cancelAnimationFrame(moodTween); renderer.dispose(); },
  };
  onReady(instance);
  return instance;
}
