// ROOMVERSE studio (bedroom): a second room, built apart from the living room so that room stays untouched.
// Stage 1: the empty shell (walls, floor, window, door), daylight and three floor zones. Stage 2: the sleep zone (bed, bedding, bedside). Stage 3: the work/game zone (desk, ultrawide monitor, console, chair).
// Everything is drawn by code.
// Units are metres. North is the window wall (z = -ROOM.d / 2); the door is on the south wall.
import * as THREE from "../vendor/three.module.min.js"; // same self-hosted three.js r160 as the living room
import { OrbitControls } from "../vendor/OrbitControls.js";

export const ROOM = { w: 4.0, d: 5.0, h: 2.6 };
export const WINDOW = { w: 1.6, h: 1.3, sill: .9, x: 0 };
export const DOOR = { w: .9, h: 2.05, x: -1.15 };
const SKIRT = { h: .08, t: .012 };
const HW = ROOM.w / 2, HD = ROOM.d / 2;

const TEXT = {
  zh: { canvas: "一個 3D 套房；拖一下轉動房間" },
  en: { canvas: "A 3D studio room; drag to turn it" },
};

function canvasTex(w, h, draw, { repeat, srgb = true } = {}) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  return t;
}

function boardsTexture() {
  // Oak boards laid along the long side: slight tone steps and a faint grain, no photograph.
  return canvasTex(512, 512, (ctx, w, h) => {
    const rows = 8, rh = h / rows;
    for (let r = 0; r < rows; r++) {
      const tone = 150 + ((r * 37) % 5) * 5;
      ctx.fillStyle = `rgb(${tone + 38}, ${tone + 2}, ${tone - 38})`;
      ctx.fillRect(0, r * rh, w, rh);
      for (let i = 0; i < 38; i++) {
        ctx.fillStyle = `rgba(${90 + (i * 7) % 40}, ${58 + (i * 5) % 20}, 32, .06)`;
        ctx.fillRect(((i * 97 + r * 53) % w), r * rh + 2 + (i * 11) % (rh - 4), 70 + (i * 23) % 150, 1.2);
      }
      ctx.fillStyle = "rgba(60,38,20,.35)"; ctx.fillRect(0, r * rh, w, 1.5);
      ctx.fillRect(((r * 211) % w), r * rh, 1.5, rh);
    }
  }, { repeat: [ROOM.w / 1.6, ROOM.d / 1.6] });
}

function weaveTexture(base, line, { stripes = false } = {}) {
  return canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 4) { ctx.fillStyle = line; ctx.globalAlpha = .13; ctx.fillRect(0, y, w, 1.4); }
    for (let x = 0; x < w; x += 4) { ctx.globalAlpha = .08; ctx.fillRect(x, 0, 1.2, h); }
    ctx.globalAlpha = 1;
    if (stripes) { ctx.fillStyle = line; for (let x = 28; x < w; x += 64) ctx.fillRect(x, 0, 10, h); }
  }, { repeat: [3, 4] });
}


// A box with softly rounded vertical edges (mattress, duvet, pillows), centred on its middle. Extruded from a rounded rectangle.
function softBox(w, h, d, r) {
  const bt = Math.min(r, h / 2) * .8, bs = r * .5; // the bevel adds to the outline and the height, so shrink both to keep the true size
  const sh = new THREE.Shape(), x = -(w - 2 * bs) / 2, y = -(d - 2 * bs) / 2;
  w -= 2 * bs; d -= 2 * bs;
  sh.moveTo(x + r, y); sh.lineTo(x + w - r, y); sh.quadraticCurveTo(x + w, y, x + w, y + r);
  sh.lineTo(x + w, y + d - r); sh.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  sh.lineTo(x + r, y + d); sh.quadraticCurveTo(x, y + d, x, y + d - r);
  sh.lineTo(x, y + r); sh.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ExtrudeGeometry(sh, { depth: h - 2 * bt, bevelEnabled: true, bevelThickness: bt, bevelSize: bs, bevelSegments: 2, curveSegments: 4 });
  g.rotateX(-Math.PI / 2); g.translate(0, -(h - 2 * bt) / 2, 0); // lies flat: height along y, centred
  g.computeVertexNormals();
  return g;
}

export async function start({ stage, lang = "zh" }) {
  const compact = matchMedia("(max-width: 600px)").matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, compact ? 1.5 : 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  stage.append(renderer.domElement);
  renderer.domElement.setAttribute("role", "img");
  renderer.domElement.setAttribute("aria-label", TEXT[lang].canvas);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#d9d4c8");
  const camera = new THREE.PerspectiveCamera(50, 1, .05, 40);
  const controls = new OrbitControls(camera, renderer.domElement);
  // Phones are narrow, so the view is aimed a little further east to keep the bed in frame.
  // Overview from the south-east corner, looking across the room. The camera stays inside the walls, so the orbit is a
  // short arc rather than a full circle (a 4 x 5 m room has no safe circle wide enough for this distance).
  const target = new THREE.Vector3(compact ? .45 : -.2, .9, -.6), home = new THREE.Vector3(1.45, 1.5, 2.0);
  controls.target.copy(target);
  controls.enablePan = false; controls.enableDamping = false; controls.enableZoom = false;
  const offset = home.clone().sub(target), az0 = Math.atan2(offset.x, offset.z), polar0 = Math.acos(offset.y / offset.length());
  controls.minAzimuthAngle = az0 - .2; controls.maxAzimuthAngle = az0 + .18;
  controls.minPolarAngle = polar0 - .12; controls.maxPolarAngle = polar0 + .1;
  camera.position.copy(home);
  controls.update();

  // ---------- materials ----------
  const wallMat = new THREE.MeshStandardMaterial({ color: "#e6ddcd", roughness: .95 });
  const mainWallMat = new THREE.MeshStandardMaterial({ color: "#d3c7b3", roughness: .95 });
  const trimMat = new THREE.MeshStandardMaterial({ color: "#efe9dc", roughness: .7 });
  const frameMat = new THREE.MeshStandardMaterial({ color: "#f1ede4", roughness: .55 });
  const floorMat = new THREE.MeshStandardMaterial({ map: boardsTexture(), roughness: .72 });
  const ceilMat = new THREE.MeshStandardMaterial({ color: "#f3efe6", roughness: 1 });
  const doorMat = new THREE.MeshStandardMaterial({ color: "#a9825a", roughness: .62 });
  const metalMat = new THREE.MeshStandardMaterial({ color: "#8d8a84", roughness: .35, metalness: .6 });

  const root = new THREE.Group(); root.name = "bedroom"; scene.add(root);
  const add = (geo, mat, name, x, y, z, { shadow = true } = {}) => {
    const m = new THREE.Mesh(geo, mat); m.name = name; m.position.set(x, y, z);
    m.castShadow = shadow; m.receiveShadow = true; root.add(m); return m;
  };
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  // ---------- shell ----------
  add(new THREE.PlaneGeometry(ROOM.w, ROOM.d), floorMat, "floor", 0, 0, 0, { shadow: false }).rotation.x = -Math.PI / 2;
  add(new THREE.PlaneGeometry(ROOM.w, ROOM.d), ceilMat, "ceiling", 0, ROOM.h, 0, { shadow: false }).rotation.x = Math.PI / 2;
  const T = .1; // wall thickness, built outward so the inside faces stay at the room size
  // north wall: four blocks around the window opening, so daylight really passes through it
  const wx0 = WINDOW.x - WINDOW.w / 2, wx1 = WINDOW.x + WINDOW.w / 2, wTop = WINDOW.sill + WINDOW.h;
  add(box(wx0 + HW, ROOM.h, T), wallMat, "wall-n-left", (-HW + wx0) / 2, ROOM.h / 2, -HD - T / 2);
  add(box(HW - wx1, ROOM.h, T), wallMat, "wall-n-right", (wx1 + HW) / 2, ROOM.h / 2, -HD - T / 2);
  add(box(WINDOW.w, WINDOW.sill, T), wallMat, "wall-n-below", WINDOW.x, WINDOW.sill / 2, -HD - T / 2);
  add(box(WINDOW.w, ROOM.h - wTop, T), wallMat, "wall-n-above", WINDOW.x, (wTop + ROOM.h) / 2, -HD - T / 2);
  // south wall with the door opening
  const dx0 = DOOR.x - DOOR.w / 2, dx1 = DOOR.x + DOOR.w / 2;
  add(box(dx0 + HW, ROOM.h, T), wallMat, "wall-s-left", (-HW + dx0) / 2, ROOM.h / 2, HD + T / 2);
  add(box(HW - dx1, ROOM.h, T), wallMat, "wall-s-right", (dx1 + HW) / 2, ROOM.h / 2, HD + T / 2);
  add(box(DOOR.w, ROOM.h - DOOR.h, T), wallMat, "wall-s-above", DOOR.x, (DOOR.h + ROOM.h) / 2, HD + T / 2);
  // east wall is the main (colour-swappable) wall; west wall is plain
  add(box(T, ROOM.h, ROOM.d + T * 2), mainWallMat, "wall-main-east", HW + T / 2, ROOM.h / 2, 0);
  add(box(T, ROOM.h, ROOM.d + T * 2), wallMat, "wall-west", -HW - T / 2, ROOM.h / 2, 0);

  // skirting boards (not across the door)
  const skirt = (w, x, z, rotY, name) => { const m = add(box(w, SKIRT.h, SKIRT.t), trimMat, name, x, SKIRT.h / 2, z, { shadow: false }); m.rotation.y = rotY; };
  skirt(ROOM.w, 0, -HD + SKIRT.t / 2, 0, "skirt-n");
  skirt(ROOM.d, HW - SKIRT.t / 2, 0, Math.PI / 2, "skirt-e");
  skirt(ROOM.d, -HW + SKIRT.t / 2, 0, Math.PI / 2, "skirt-w");
  skirt(dx0 + HW, (-HW + dx0) / 2, HD - SKIRT.t / 2, 0, "skirt-s-left");
  skirt(HW - dx1, (dx1 + HW) / 2, HD - SKIRT.t / 2, 0, "skirt-s-right");

  // ---------- window: frame, sill, two panes of glass and a sky behind ----------
  const fz = -HD + .03, ft = .05;
  add(box(WINDOW.w + .1, ft, .07), frameMat, "window-frame-top", WINDOW.x, wTop + ft / 2, fz, { shadow: false });
  add(box(WINDOW.w + .1, ft, .07), frameMat, "window-frame-bottom", WINDOW.x, WINDOW.sill - ft / 2, fz, { shadow: false });
  add(box(ft, WINDOW.h, .07), frameMat, "window-frame-left", wx0 - ft / 2, WINDOW.sill + WINDOW.h / 2, fz, { shadow: false });
  add(box(ft, WINDOW.h, .07), frameMat, "window-frame-right", wx1 + ft / 2, WINDOW.sill + WINDOW.h / 2, fz, { shadow: false });
  add(box(.04, WINDOW.h, .05), frameMat, "window-mullion", WINDOW.x, WINDOW.sill + WINDOW.h / 2, fz, { shadow: false });
  add(box(WINDOW.w + .16, .03, .16), trimMat, "window-sill", WINDOW.x, WINDOW.sill - ft - .005, -HD + .06, { shadow: false });
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(WINDOW.w, WINDOW.h), new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: .06, depthWrite: false }));
  glass.name = "window-glass"; glass.position.set(WINDOW.x, WINDOW.sill + WINDOW.h / 2, -HD + .01); root.add(glass);
  // The view outside is a painted pair (day and night), same buildings and framing. The plane sits 1.2 m behind the wall, so a
  // short orbit moves it against the window frame a little (parallax) without showing its edges; reach() proves that.
  const texLoader = new THREE.TextureLoader();
  const skyTex = {};
  const loadSky = (time) => skyTex[time] ??= new Promise((resolve) => {
    texLoader.load(new URL(`./art/studio-window-${time}-v1.webp`, import.meta.url).href, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; resolve(t); }, undefined, () => resolve(null));
  });
  const SKY = { w: 4.8, h: 3.0, y: 1.6, z: -HD - 1.2 };
  const skyMat = new THREE.MeshBasicMaterial({ color: "#cfe2f2", toneMapped: false });
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(SKY.w, SKY.h), skyMat);
  sky.name = "window-sky"; sky.position.set(0, SKY.y, SKY.z); root.add(sky);
  let skyTime = "day";
  async function setTime(time) {
    const t = await loadSky(time);
    if (!t) return false;
    skyTime = time; skyMat.map = t; skyMat.color.set("#ffffff"); skyMat.needsUpdate = true; render();
    return true;
  }

  // ---------- door: slab, frame, handle ----------
  const dz = HD - .02;
  add(box(DOOR.w - .02, DOOR.h - .01, .04), doorMat, "door-slab", DOOR.x, DOOR.h / 2, dz, { shadow: false });
  add(box(.045, DOOR.h + .045, .07), frameMat, "door-frame-left", dx0 - .0225, (DOOR.h + .045) / 2, dz, { shadow: false });
  add(box(.045, DOOR.h + .045, .07), frameMat, "door-frame-right", dx1 + .0225, (DOOR.h + .045) / 2, dz, { shadow: false });
  add(box(DOOR.w + .09, .045, .07), frameMat, "door-frame-top", DOOR.x, DOOR.h + .0225, dz, { shadow: false });
  add(new THREE.CylinderGeometry(.02, .02, .13, 12), metalMat, "door-handle", dx1 - .09, 1.0, dz - .06, { shadow: false }).rotation.z = Math.PI / 2;

  // ---------- three floor zones ----------
  const zoneRug = (w, d, x, z, mat, name) => { const m = add(new THREE.PlaneGeometry(w, d), mat, name, x, .006, z, { shadow: false }); m.rotation.x = -Math.PI / 2; };
  zoneRug(1.2, 1.8, .95, -1.45, new THREE.MeshStandardMaterial({ map: weaveTexture("#e0d2b8", "#9a8662"), roughness: 1 }), "zone-sleep-rug");
  zoneRug(1.0, .8, -1.35, -1.55, new THREE.MeshStandardMaterial({ map: weaveTexture("#555a61", "#2c3036"), roughness: 1 }), "zone-work-mat");
  zoneRug(1.6, 2.3, .85, 1.3, new THREE.MeshStandardMaterial({ map: weaveTexture("#a9b1b8", "#5d6a76", { stripes: true }), roughness: 1 }), "zone-lounge-rug");

  // ---------- sleep zone: a 110 x 200 cm bed along the east wall, head to the window wall ----------
  // Real sizes: mattress top 48 cm, pillow 70 x 45 cm, duvet 105 cm wide. The window sits at x < 0.8, so the headboard stays clear of it.
  const BED = { x: 1.4, z: -1.46, w: 1.1, l: 2.0, top: .48 };
  const oak = new THREE.MeshStandardMaterial({ color: "#b8895a", roughness: .66 });
  const sheetMat = new THREE.MeshStandardMaterial({ color: "#ece4d4", roughness: .95 });
  const duvetMat = new THREE.MeshStandardMaterial({ map: weaveTexture("#d8cdb8", "#a69878"), roughness: 1 });
  const throwMat = new THREE.MeshStandardMaterial({ map: weaveTexture("#9fae98", "#6f8068", { stripes: true }), roughness: 1 });
  const pillowMat = new THREE.MeshStandardMaterial({ color: "#f3eee3", roughness: .95 });
  const cushionMat = new THREE.MeshStandardMaterial({ color: "#c58a62", roughness: .95 });
  const bed = new THREE.Group(); bed.name = "bed"; root.add(bed);
  const part = (geo, mat, name, x, y, z) => {
    const m = new THREE.Mesh(geo, mat); m.name = name; m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; bed.add(m); return m;
  };
  const north = BED.z - BED.l / 2; // z of the head end
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    part(box(.05, .12, .05), oak, "bed-leg", BED.x + dx * (BED.w / 2 - .02), .06, BED.z + dz * (BED.l / 2 - .03));
  }
  part(box(BED.w + .02, .14, BED.l + .02), oak, "bed-frame", BED.x, .19, BED.z); // 12 cm to 26 cm
  part(softBox(BED.w, .22, BED.l - .02, .03), sheetMat, "bed-mattress", BED.x, .26 + .11, BED.z); // top at 48 cm
  part(box(BED.w + .08, .82, .035), oak, "bed-headboard", BED.x, .6, north - .0225); // 19 cm to 101 cm, against the wall
  part(softBox(BED.w - .04, .09, 1.32, .05), duvetMat, "bed-duvet", BED.x, BED.top + .045, BED.z + .3); // foot to mid-bed
  part(softBox(BED.w - .02, .07, .34, .04), throwMat, "bed-throw", BED.x, BED.top + .1, BED.z + .62); // folded striped throw across the foot
  part(softBox(.7, .13, .45, .06), pillowMat, "bed-pillow", BED.x, BED.top + .065, north + .36);
  part(softBox(.45, .12, .3, .05), cushionMat, "bed-cushion", BED.x, BED.top + .19, north + .22).rotation.x = -.28;
  // bedside table (40 x 40 x 45 cm) with a small lamp; the shade glows a little by itself, no extra light needed
  const tx = BED.x - BED.w / 2 - .27, tz = north + .27;
  part(box(.4, .02, .4), oak, "bedside-top", tx, .44, tz);
  part(box(.36, .3, .36), oak, "bedside-body", tx, .28, tz);
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) part(box(.03, .13, .03), oak, "bedside-leg", tx + dx * .17, .065, tz + dz * .17);
  part(new THREE.CylinderGeometry(.06, .07, .02, 16), metalMat, "lamp-base", tx, .46, tz);
  part(new THREE.CylinderGeometry(.012, .012, .2, 8), metalMat, "lamp-stem", tx, .56, tz);
  part(new THREE.CylinderGeometry(.075, .11, .13, 20, 1, true), new THREE.MeshStandardMaterial({ color: "#f4e6c8", emissive: "#e9b86a", emissiveIntensity: .35, roughness: .9, side: THREE.DoubleSide }), "lamp-shade", tx, .72, tz);

  // ---------- work / game zone: desk along the west wall, ultrawide monitor, console, gaming chair ----------
  // Real sizes: desk 140 x 65 cm, top at 75 cm; 34-inch ultrawide panel 80 x 34 cm; chair seat at 48 cm. Built facing +z and turned so the
  // monitor looks east into the room. No logos or text anywhere; the screen is an abstract night-city game scene.
  const deskMat = new THREE.MeshStandardMaterial({ color: "#c9a77c", roughness: .6 });
  const blackMat = new THREE.MeshStandardMaterial({ color: "#23262b", roughness: .45, metalness: .25 });
  const softBlack = new THREE.MeshStandardMaterial({ color: "#2d3036", roughness: .9 });
  const accentMat = new THREE.MeshStandardMaterial({ color: "#6e5bd6", roughness: .8 });
  const screenTex = canvasTex(512, 216, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#1b1a4a"); g.addColorStop(.55, "#5a2f86"); g.addColorStop(1, "#e0679a");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#f6e6b8"; ctx.beginPath(); ctx.arc(w * .7, h * .36, 26, 0, 7); ctx.fill(); // low sun
    ctx.fillStyle = "#14122e"; // skyline silhouette
    for (let x = 0, i = 0; x < w; x += 22 + (i % 3) * 8, i++) { const bh = 38 + ((i * 53) % 70); ctx.fillRect(x, h - bh, 20 + (i % 3) * 8, bh); }
    ctx.fillStyle = "#ffd66b"; for (let i = 0; i < 70; i++) ctx.fillRect((i * 37) % w, h - 10 - (i * 29) % 70, 3, 3);
  });
  const keysTex = canvasTex(256, 80, (ctx, w, h) => {
    ctx.fillStyle = "#2b2e34"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#454a53";
    for (let r = 0; r < 5; r++) for (let c = 0; c < 15; c++) ctx.fillRect(6 + c * 16.3, 6 + r * 14, 13.5, 11);
  });
  const hold = (parent) => (geo, mat, name, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.name = name; m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
  const desk = new THREE.Group(); desk.name = "desk"; desk.position.set(-HW + .325, 0, -1.75); desk.rotation.y = Math.PI / 2; root.add(desk);
  const dpart = hold(desk);
  dpart(box(1.4, .03, .65), deskMat, "desk-top", 0, .735, 0); // top face at 75 cm
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) dpart(box(.04, .72, .04), blackMat, "desk-leg", dx * .66, .36, dz * .29);
  dpart(box(1.3, .03, .04), blackMat, "desk-rail", 0, .6, -.29);
  dpart(softBox(.82, .004, .32, .02), softBlack, "desk-mat", 0, .752, .12);
  dpart(box(.26, .01, .18), blackMat, "monitor-foot", 0, .755, -.1);
  dpart(box(.05, .2, .02), blackMat, "monitor-neck", 0, .86, -.16);
  dpart(box(.8, .34, .025), blackMat, "monitor-panel", 0, 1.05, -.15);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(.77, .31), new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }));
  screen.name = "monitor-screen"; screen.position.set(0, 1.05, -.15 + .0135); desk.add(screen);
  dpart(box(.42, .018, .13), new THREE.MeshStandardMaterial({ map: keysTex, roughness: .6 }), "keyboard", -.02, .765, .16);
  dpart(softBox(.065, .03, .11, .025), blackMat, "mouse", .33, .767, .16);
  dpart(box(.28, .06, .22), new THREE.MeshStandardMaterial({ color: "#e9e6df", roughness: .5 }), "console", -.55, .785, -.08); // white slim console, no logo
  dpart(box(.012, .004, .2), new THREE.MeshStandardMaterial({ color: "#69b8ff", emissive: "#69b8ff", emissiveIntensity: 1 }), "console-light", -.55, .816, -.08);
  // LED bias strip: a thin emissive bar on the wall behind the monitor and a soft additive glow on the wall
  dpart(box(.9, .012, .012), new THREE.MeshStandardMaterial({ color: "#8f7bff", emissive: "#8f7bff", emissiveIntensity: 1.4 }), "led-strip", 0, .92, -.315);
  const glowTex = canvasTex(256, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 6, w / 2, h / 2, w / 2); g.addColorStop(0, "rgba(143,123,255,.75)"); g.addColorStop(1, "rgba(143,123,255,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 1.0), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .55, toneMapped: false }));
  glow.name = "led-glow"; glow.position.set(0, 1.0, -.322); desk.add(glow);
  // gaming chair, pulled up to the desk
  const chair = new THREE.Group(); chair.name = "chair"; chair.position.set(-.93, 0, -1.75); chair.rotation.y = -Math.PI / 2 + .1; root.add(chair);
  const cpart = hold(chair);
  cpart(softBox(.5, .09, .5, .07), softBlack, "chair-seat", 0, .435, 0); // top at 48 cm
  const back = cpart(softBox(.5, .1, .72, .07), softBlack, "chair-back", 0, .84, -.255); back.rotation.x = Math.PI / 2 + .12;
  const stripe = cpart(box(.12, .5, .012), accentMat, "chair-stripe", 0, .84, -.195); stripe.rotation.x = .12;
  const head = cpart(softBox(.26, .08, .16, .04), accentMat, "chair-headrest", 0, 1.19, -.3); head.rotation.x = Math.PI / 2 + .12;
  for (const sx of [-1, 1]) {
    cpart(box(.04, .22, .04), blackMat, "chair-arm-post", sx * .29, .56, -.02);
    cpart(box(.06, .025, .26), blackMat, "chair-arm", sx * .29, .68, .02);
  }
  cpart(new THREE.CylinderGeometry(.035, .035, .26, 10), metalMat, "chair-lift", 0, .27, 0);
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5, arm = cpart(box(.3, .028, .05), blackMat, "chair-leg", Math.cos(a) * .15, .07, Math.sin(a) * .15);
    arm.rotation.y = -a;
    cpart(new THREE.SphereGeometry(.027, 8, 6), blackMat, "chair-wheel", Math.cos(a) * .3, .027, Math.sin(a) * .3);
  }

  // ---------- daylight ----------
  scene.add(new THREE.HemisphereLight("#e8f0f8", "#d6c6aa", 1.45));
  const sun = new THREE.DirectionalLight("#fff3df", 2.3);
  sun.position.set(1.1, 2.3, -HD - 2.2); sun.target.position.set(-.1, .4, 1.0);
  sun.castShadow = true; sun.shadow.mapSize.set(compact ? 1024 : 2048, compact ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -3.2, right: 3.2, top: 3.2, bottom: -3.2, near: .5, far: 12 });
  sun.shadow.bias = -.0005; sun.shadow.normalBias = .02; sun.shadow.radius = 5;
  scene.add(sun, sun.target);
  const fill = new THREE.PointLight("#ffe9cf", 7, 7, 2); fill.position.set(0, 2.3, .6); scene.add(fill);

  // ---------- loop ----------
  function resize() {
    const w = stage.clientWidth || 800, h = stage.clientHeight || 500;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = camera.aspect < .8 ? 66 : 50;
    camera.updateProjectionMatrix();
  }
  const render = () => renderer.render(scene, camera);
  new ResizeObserver(() => { resize(); render(); }).observe(stage);
  controls.addEventListener("change", render);
  resize(); render();
  setTime("day");

  const info = () => {
    let vertices = 0, meshes = 0;
    root.traverse((o) => { if (o.isMesh) { meshes++; vertices += o.geometry.attributes.position.count; } });
    const box3 = new THREE.Box3().setFromObject(root.getObjectByName("floor"));
    return {
      room: ROOM, window: WINDOW, door: DOOR, vertices, meshes,
      floor: { w: box3.max.x - box3.min.x, d: box3.max.z - box3.min.z },
      zones: ["zone-sleep-rug", "zone-work-mat", "zone-lounge-rug"].map((n) => root.getObjectByName(n)?.name),
      bed: (() => { const b = new THREE.Box3().setFromObject(root.getObjectByName("bed")), m = new THREE.Box3().setFromObject(root.getObjectByName("bed-mattress")); return { min: b.min.toArray(), max: b.max.toArray(), mattressTop: m.max.y - .0 }; })(),
      work: Object.fromEntries(["desk", "chair"].map((n) => { const b = new THREE.Box3().setFromObject(root.getObjectByName(n)); return [n, { min: b.min.toArray(), max: b.max.toArray() }]; })),
      desk: { top: new THREE.Box3().setFromObject(root.getObjectByName("desk-top")).max.y, seat: new THREE.Box3().setFromObject(root.getObjectByName("chair-seat")).max.y,
        monitor: (() => { const b = new THREE.Box3().setFromObject(root.getObjectByName("monitor-panel")); return { min: b.min.toArray(), max: b.max.toArray() }; })() },
      camera: camera.position.toArray(), lights: scene.children.filter((c) => c.isLight).length,
    };
  };
  // Camera positions at the two ends of the allowed orbit arc, so a test can prove the camera never leaves the room.
  const reach = () => {
    const r = Math.hypot(offset.x, offset.z), y = offset.y;
    const at = (az) => [target.x + r * Math.sin(az), home.y + (y - offset.y), target.z + r * Math.cos(az)].map((v) => +v.toFixed(3));
    return { min: at(controls.minAzimuthAngle), max: at(controls.maxAzimuthAngle) };
  };
  // For a camera position, do the four window corners land inside the sky plane? (the plane must never show its edge)
  const skyCovers = (pos) => {
    const [cx, cy, cz] = pos, k = (cz - SKY.z) / (cz + HD);
    return [[wx0, WINDOW.sill], [wx1, WINDOW.sill], [wx0, wTop], [wx1, wTop]].every(([x, y]) => {
      const px = cx + (x - cx) * k, py = cy + (y - cy) * k;
      return Math.abs(px) < SKY.w / 2 && py > SKY.y - SKY.h / 2 && py < SKY.y + SKY.h / 2;
    });
  };
  const windowArt = () => ({ time: skyTime, loaded: !!skyMat.map, pixels: skyMat.map ? [skyMat.map.image.width, skyMat.map.image.height] : null,
    covers: [camera.position.toArray(), ...Object.values(reach())].map(skyCovers) });
  return {
    info, reach, windowArt, setTime, render, camera, controls,
    setLang(l) { lang = l; renderer.domElement.setAttribute("aria-label", TEXT[l].canvas); },
  };
}
