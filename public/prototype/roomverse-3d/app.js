// ROOMVERSE 3D: the same soft-furnishing idea as ROOM MODE REMOTE, as a small 3D room you can turn.
// Loaded only after the visitor presses "enter" (index.html), so the portfolio page stays light.
// Furniture: sofa, coffee table, side table, table lamp, floor lamp and plant were drawn as single illustrations, turned into shapes by an
// image-to-3D model, then coloured locally from the same illustrations. Walls, rug, light: drawn by code.
// Built and checked in a local trial first (Desktop CC_3D軟裝房間試作_2026-10-16, README trials 1-8).
import * as THREE from "./vendor/three.module.min.js"; // three.js r160 (MIT), self-hosted: the site loads nothing from other hosts
import { OrbitControls } from "./vendor/OrbitControls.js";
import { GLTFLoader } from "./vendor/GLTFLoader.js";

export const TEXT = {
  zh: { mood: "感覺", wall: "牆面", rug: "地毯", curtain: "窗簾", print: "掛畫", hint: "拖曳可以轉一點角度。網址會記住你搭的房間，複製給朋友就能看到同一間。", canvas: "3D 軟裝房間，可以拖曳轉動角度", look: "環顧四周", back: "回到正面", lookHint: "拖曳轉動視角，看看房間四周。", save: "存成明信片", shuffle: "幫我隨機搭一間", file: "ROOMVERSE-3D-明信片.png" },
  en: { mood: "Feeling", wall: "Wall", rug: "Rug", curtain: "Curtains", print: "Wall print", hint: "Drag to turn the room a little. The address remembers your room, so a copied link opens the same one.", canvas: "A 3D living room; drag to turn it", look: "Look around", back: "Back to front", lookHint: "Drag to look around the whole room.", save: "Save as a postcard", shuffle: "Surprise me with a room", file: "ROOMVERSE-3D-postcard.png" },
};
const MOODS = {
  // floor: the floor lamp's light; glow: how strong the halos around lit shades are
  // why: one line on why the pairing works. All three lines are Paul's wording (2026-10-16).
  rain: { zh: "下雨天想窩在家裡", en: "Rainy day, staying in",
    why: { zh: "窗外偏冷時，屋裡就用暖黃的燈和米白布料把溫度補回來，讓人想宅在家裡一天也很舒服。", en: "When it's cool and grey outside, warm lamps and cream fabrics bring the warmth back indoors, so a whole day at home feels good." }, hemi: .9, win: .7, winCol: "#bccbdb", lamp: 5, fill: 1.2, out: "#eef1f3", exposure: 1.05, floor: 2.2, glow: .55 },
  family: { zh: "Cozy family", en: "Cozy family",
    why: { zh: "白天靠自然光就夠亮，用木頭、綠色和陶土色這些來自大自然的色彩，讓一家人待得超comfy。", en: "Daylight does most of the work; wood, greens and terracotta, colours from nature, keep the whole family extra comfy." }, hemi: 1.6, win: 3.2, winCol: "#ffe7c2", lamp: 2, fill: 2.4, out: "#ffffff", exposure: 1.15, floor: 0, glow: .15 },
  // tech: moonlight through the window leaves a pale blue patch on the floor
  tech: { zh: "未來輕科技宅男", en: "Light-tech homebody",
    why: { zh: "晚上把主燈關掉，一盞暖燈加一道冷色燈帶，對比讓房間更有層次，又不刺眼!!", en: "At night, skip the ceiling light: one warm lamp against a cool LED wash gives depth without glare." }, hemi: .6, win: 1.5, winCol: "#7f9fe6", lamp: 3.6, fill: .7, out: "#ffffff", exposure: 1, led: true, floor: 1.2, glow: .45 },
  // chic: a bright weekend morning with a soft blush in the light (plan and line approved by Paul, 2026-10-16)
  chic: { zh: "粉領新貴風", en: "Chic city professional",
    why: { zh: "明亮的晨光配上霧粉和黃銅點綴，俐落又有溫度，週末在家也像住在喜歡的咖啡館。", en: "Bright morning light with dusty pink and brass accents: crisp but warm, like a weekend in your favourite café." },
    hemi: 1.5, win: 2.6, winCol: "#ffe2dc", lamp: 1.2, fill: 2.1, out: "#fff6f3", exposure: 1.13, floor: 0, glow: .12 },
};

export async function start({ stage, panel, lang, onReady }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap; // PCF honours shadow.radius: soft shadow edges (PCFSoft ignores it in r160)
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  stage.append(renderer.domElement);
  renderer.domElement.setAttribute("role", "img"); renderer.domElement.setAttribute("aria-label", TEXT[lang].canvas);
  // a persistent live region (the panel is rebuilt, so a note inside it would not be announced reliably)
  const live = document.createElement("div"); live.setAttribute("aria-live", "polite");
  Object.assign(live.style, { position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" });
  stage.parentNode.append(live);
  let announced = null;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(44, 1, 0.05, 50);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0.15, 0.85, -0.9);
  controls.enableDamping = true; controls.enablePan = false;
  controls.minDistance = 2.4; controls.maxDistance = 5.6;
  controls.minPolarAngle = Math.PI * 0.32; controls.maxPolarAngle = Math.PI * 0.5;
  controls.minAzimuthAngle = -0.55; controls.maxAzimuthAngle = 0.55;
  // the front view, framed so the sofa group fills the view and the floor does not take half the picture (checked at 390 and 1440)
  function homeView() {
    const narrow = stage.clientWidth / stage.clientHeight < 0.8;
    return { fov: narrow ? 58 : 42, pos: new THREE.Vector3(0.15, narrow ? 1.25 : 1.5, narrow ? 2.85 : 3.5), target: new THREE.Vector3(0.15, narrow ? 0.72 : 0.85, -0.9) };
  }
  // "look around": the camera stands inside the room and turns on the spot (see goLook below)
  let inside = false, moving = false, lookYaw = 0, lookPitch = -0.05;
  const INSIDE_POS = new THREE.Vector3(0.15, 1.45, 0.9);
  const insideFov = () => (stage.clientWidth / stage.clientHeight < 0.8 ? 80 : 68);
  const lookQuat = () => new THREE.Quaternion().setFromEuler(new THREE.Euler(lookPitch, lookYaw, 0, "YXZ"));
  function fit() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    if (inside || moving) { if (!moving) camera.fov = insideFov(); camera.updateProjectionMatrix(); return; } // do not drag the camera back to the front view
    const home = homeView();
    camera.fov = home.fov;
    camera.position.copy(home.pos);
    controls.target.copy(home.target);
    camera.updateProjectionMatrix();
    controls.update();
  }

  // ---------- textures drawn by code ----------
  function canvasTex(w, h, draw) {
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
    return t;
  }
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647; // same grain every visit
  const noise = (ctx, w, h, a, n = 9000) => { for (let i = 0; i < n; i++) { ctx.fillStyle = `rgba(${rnd() < .5 ? "255,255,255" : "0,0,0"},${a})`; ctx.fillRect(rnd() * w, rnd() * h, 1.5, 1.5); } };
  // narrow oak planks (about 15 cm wide), low tone contrast so they read as wood, not tiles
  const floorTex = canvasTex(1024, 1024, (ctx, w, h) => {
    const rows = 12, plank = h / rows;
    for (let r = 0; r < rows; r++) {
      let x = -((r * 397) % 520);
      while (x < w) {
        const len = 380 + rnd() * 320, tone = 128 + rnd() * 14;
        ctx.fillStyle = `rgb(${tone + 44},${tone - 2},${tone - 46})`; ctx.fillRect(x, r * plank, len, plank);
        for (let g = 0; g < 10; g++) { ctx.strokeStyle = `rgba(90,50,20,${.04 + rnd() * .06})`; ctx.lineWidth = 1 + rnd(); ctx.beginPath(); const y = r * plank + 3 + rnd() * (plank - 6); ctx.moveTo(x, y); ctx.bezierCurveTo(x + len * .3, y + 3, x + len * .6, y - 3, x + len, y + 1); ctx.stroke(); }
        if (rnd() < .35) { ctx.fillStyle = "rgba(90,50,20,.18)"; ctx.beginPath(); ctx.ellipse(x + rnd() * len, r * plank + plank / 2, 9, 4, 0, 0, 7); ctx.fill(); } // a knot now and then
        ctx.fillStyle = "rgba(50,25,8,.4)"; ctx.fillRect(x, r * plank, 2, plank);
        x += len;
      }
      ctx.fillStyle = "rgba(50,25,8,.35)"; ctx.fillRect(0, r * plank, w, 1.5);
    }
    noise(ctx, w, h, .03, 20000);
  });
  floorTex.repeat.set(2.6, 2.6);
  // wallpapers and rugs: Codex's painted textures (tex/, WebP); loaded only when chosen
  const texLoader = new THREE.TextureLoader();
  const image = (name, repeat) => () => {
    const t = texLoader.load(new URL(`./tex/${name}.webp`, import.meta.url).href, () => render());
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  };
  const WALLS = {
    original: { zh: "原來的米白", en: "Original cream", paint: "#e9e1d3" },
    sand: { zh: "暖砂米", en: "Warm sand", paint: "#d9c6a8" },
    olive: { zh: "柔橄欖", en: "Soft olive", paint: "#a9ad8a" },
    blush: { zh: "霧粉", en: "Dusty blush", paint: "#e6cec6" },
    // size = metres per tile (the wall's UVs are in metres); about 5 x 3 tiles on the back wall
    stripe: { zh: "細條紋壁紙", en: "Fine-stripe wallpaper", size: 1.0, tex: image("wallpaper-stripe-v1", true) },
    botanical: { zh: "淡色植紋壁紙", en: "Soft botanical wallpaper", size: 1.5, tex: image("wallpaper-botanical-v1", true) },
  };
  const RUGS = {
    stripe: { zh: "藍米條紋", en: "Blue and cream stripe", tex: image("rug-stripe-v1") },
    ivory: { zh: "柔米白", en: "Soft ivory", tex: image("rug-ivory-v1") },
    medallion: { zh: "古典花紋", en: "Classic medallion", tex: image("rug-medallion-v1") },
  };

  // ---------- room ----------
  const W = 5.2, D = 4.6, H = 2.7, BACK = -2.2;
  const add = (geo, mat, x, y, z, cast = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; scene.add(m); return m; };
  const floor = add(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: floorTex, roughness: .55 }), 0, 0, BACK + D / 2, false);
  floor.rotation.x = -Math.PI / 2;
  // back wall = one shape with the window cut out, so a wallpaper covers the whole wall, around the window too
  const win = { x0: -2.1, x1: -0.95, y0: 0.75, y1: 2.25 };
  const wallShape = new THREE.Shape([new THREE.Vector2(-W / 2, 0), new THREE.Vector2(W / 2, 0), new THREE.Vector2(W / 2, H), new THREE.Vector2(-W / 2, H)]);
  wallShape.holes.push(new THREE.Path([new THREE.Vector2(win.x0, win.y0), new THREE.Vector2(win.x1, win.y0), new THREE.Vector2(win.x1, win.y1), new THREE.Vector2(win.x0, win.y1)]));
  const wallMat = new THREE.MeshStandardMaterial({ color: "#e9e1d3", roughness: .9 });
  add(new THREE.ShapeGeometry(wallShape), wallMat, 0, 0, BACK, true); // casts: window light only comes in through the window
  const sideMat = new THREE.MeshStandardMaterial({ color: "#e4ddd0", roughness: .95 });
  // side walls and ceiling cast too: otherwise window light leaks through them (a bright band on the right wall, a patch at the left)
  [-1, 1].forEach((s) => { add(new THREE.PlaneGeometry(D, H + .3), sideMat, s * W / 2, H / 2 - .15, BACK + D / 2, true).rotation.y = -s * Math.PI / 2; });
  // the wall behind the camera: it faces into the room, so the front view (camera outside) looks straight through it.
  // The coloured or papered wall is the back wall only, like a feature wall; the other three stay neutral.
  add(new THREE.PlaneGeometry(W, H + .3), sideMat, 0, H / 2 - .15, BACK + D, false).rotation.y = Math.PI;
  add(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ color: "#f6f2ea", emissive: "#f6f2ea", emissiveIntensity: .12 }), 0, H, BACK + D / 2, true).rotation.x = Math.PI / 2;
  const wood = new THREE.MeshStandardMaterial({ color: "#8a5a36", roughness: .6 });
  const skirting = new THREE.MeshStandardMaterial({ color: "#f3efe6", roughness: .7 });
  add(new THREE.BoxGeometry(W, .09, .02), skirting, 0, .045, BACK + .01, false);
  // side skirting too: finishes the room and covers the thin light line where wall meets floor
  [-1, 1].forEach((s) => add(new THREE.BoxGeometry(.02, .09, D), skirting, s * (W / 2 - .01), .045, BACK + D / 2, false));
  add(new THREE.BoxGeometry(W, .09, .02), skirting, 0, .045, BACK + D - .01, false);
  // the view outside changes with the feeling: Codex's paintings of the same street in rain, afternoon sun and night
  // (window/, 1024 x 1536). The window is wider than 2:3, so the picture fills the width and is cropped a little top and bottom.
  const viewLoader = new THREE.TextureLoader();
  const VIEW_FILES = { rain: "rain", family: "family", tech: "tech", chic: "chic" }; // chic: weekend morning, same street
  const VIEWS = Object.fromEntries(Object.entries(VIEW_FILES).map(([m, f]) => [m, () => {
    const t = viewLoader.load(new URL(`./window/window-${f}-v1.webp`, import.meta.url).href, () => render());
    t.colorSpace = THREE.SRGBColorSpace;
    t.repeat.set(1, .87); t.offset.set(0, .05); // keep the trees and houses (lower middle) in view
    return t;
  }]));
  const outMat = new THREE.MeshBasicMaterial();
  const wx = (win.x0 + win.x1) / 2, wy = (win.y0 + win.y1) / 2, ww = win.x1 - win.x0, wh = win.y1 - win.y0;
  add(new THREE.PlaneGeometry(ww, wh), outMat, wx, wy, BACK - .06, false);
  const frame = (x, y, w, h) => add(new THREE.BoxGeometry(w, h, .08), wood, x, y, BACK - .02);
  frame(wx, win.y0, ww + .1, .06); frame(wx, win.y1, ww + .1, .06); frame(win.x0, wy, .06, wh); frame(win.x1, wy, .06, wh); frame(wx, wy, .04, wh); frame(wx, wy + .2, ww, .04);
  add(new THREE.CylinderGeometry(.015, .015, ww + .9, 12), wood, wx, win.y1 + .2, BACK + .12).rotation.z = Math.PI / 2;
  const linen = new THREE.MeshStandardMaterial({ color: "#e6ddcc", roughness: 1, side: THREE.DoubleSide, transparent: true, opacity: .93 });
  [win.x0 - .14, win.x1 + .14].forEach((x) => {
    const g = new THREE.PlaneGeometry(.42, win.y1 + .2, 40, 1); const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 46) * .035);
    g.computeVertexNormals(); add(g, linen, x, (win.y1 + .2) / 2, BACK + .12);
  });
  const SX = .35, SZ = BACK + .55, TX = SX + 1.35, TZ = SZ - .1;
  // the coffee table, the table lamp and the plant are AI-made models too (loaded with the others below);
  // the table lamp's light lives here, and is moved onto the lamp once the side table is placed
  const lampLight = new THREE.PointLight("#ffc27a", 3.2, 6, 1.6);
  lampLight.position.set(TX, .98, TZ); lampLight.castShadow = true; lampLight.shadow.mapSize.set(1024, 1024); lampLight.shadow.bias = -.002; lampLight.shadow.radius = 10; scene.add(lampLight);
  const PX = -2.3, PZ = BACK + .45;
  // art above the sofa: Codex's watercolour prints in a thin oak frame. The visitor picks one
  // (Paul 2026-10-16: 「讓訪客自己選」); only the shown print is loaded.
  const PRINTS = {
    hills: { zh: "山丘與太陽", en: "Hills and sun" },
    moon: { zh: "新月", en: "Crescent moon" },
    rain: { zh: "雨雲", en: "Rain cloud" },
  };
  const prints = {}, printLoader = new THREE.TextureLoader();
  const printMat = new THREE.MeshStandardMaterial({ roughness: .85 });
  function printFor(name) {
    if (!prints[name]) {
      prints[name] = printLoader.load(new URL(`./art/wall-print-${name}-v1.webp`, import.meta.url).href, () => render());
      prints[name].colorSpace = THREE.SRGBColorSpace; prints[name].anisotropy = 8;
    }
    return prints[name];
  }
  const AX = .35, AY = 1.62, AW = .86, AH = .6;
  add(new THREE.BoxGeometry(AW + .06, AH + .06, .035), new THREE.MeshStandardMaterial({ color: "#a8784c", roughness: .55 }), AX, AY, BACK + .02);
  add(new THREE.BoxGeometry(AW, AH, .006), new THREE.MeshStandardMaterial({ color: "#f7f3ea", roughness: .9 }), AX, AY, BACK + .038, false);
  add(new THREE.PlaneGeometry(AW - .14, AH - .14), printMat, AX, AY, BACK + .042, false); // .72 x .46 m, the prints are 1200 x 766
  const rugMat = new THREE.MeshStandardMaterial({ roughness: 1 });
  add(new THREE.BoxGeometry(2.6, .012, 1.65), rugMat, SX, .006, SZ + .95, false);
  // a wooden plaque on the back wall above the side table and lamp: "Christ is the Head of this House" (Paul 2026-10-16;
  // Codex's painting, spelling checked letter by letter). About 70 x 28 cm, facing the room, a hair off the wall.
  const plaqueTex = new THREE.TextureLoader().load(new URL("./art/wall-plaque-text-v1.webp", import.meta.url).href, () => render());
  plaqueTex.colorSpace = THREE.SRGBColorSpace; plaqueTex.anisotropy = 8;
  add(new THREE.PlaneGeometry(.7, .28), new THREE.MeshStandardMaterial({ map: plaqueTex, transparent: true, alphaTest: .5, roughness: .7 }), TX, 1.5, BACK + .015, false);

  // ---------- light ----------
  const hemi = new THREE.HemisphereLight("#dfe8f0", "#8a6a4f", .35); scene.add(hemi);
  const windowLight = new THREE.DirectionalLight("#cfdcea", 1.1);
  windowLight.position.set(-2.4, 2.6, -4.5); windowLight.target.position.set(.2, 0, .2);
  windowLight.castShadow = true; windowLight.shadow.mapSize.set(2048, 2048); windowLight.shadow.radius = 8; windowLight.shadow.bias = -.0005;
  // shadow box covers the whole room; a smaller box left a bright diagonal band on the right wall
  Object.assign(windowLight.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: .5, far: 14 });
  scene.add(windowLight, windowLight.target);
  const fill = new THREE.PointLight("#fff1dc", .6, 9, 1.2); fill.position.set(.2, 2.2, 2.2); scene.add(fill);
  // LED strip sits just above the sofa back (below the print) and washes the wall
  const led = new THREE.Group(); scene.add(led);
  const ledLine = new THREE.Mesh(new THREE.BoxGeometry(2.1, .01, .01), new THREE.MeshBasicMaterial({ color: "#bfeaff" })); ledLine.position.set(SX, 1.16, BACK + .02); led.add(ledLine);
  const washTex = canvasTex(8, 128, (ctx, w, h) => { const g = ctx.createLinearGradient(0, h, 0, 0); g.addColorStop(0, "rgba(140,210,255,.55)"); g.addColorStop(.35, "rgba(140,210,255,.18)"); g.addColorStop(1, "rgba(140,210,255,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); });
  const washAlpha = canvasTex(128, 8, (ctx, w, h) => { const g = ctx.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "#000"); g.addColorStop(.15, "#fff"); g.addColorStop(.85, "#fff"); g.addColorStop(1, "#000"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); });
  washAlpha.colorSpace = THREE.NoColorSpace;
  const wash = new THREE.Mesh(new THREE.PlaneGeometry(2.6, .6), new THREE.MeshBasicMaterial({ map: washTex, alphaMap: washAlpha, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  wash.position.set(SX, 1.16 + .3, BACK + .015); led.add(wash); // the strip washes the wall upward and fades at both ends
  const ledGlow = new THREE.PointLight("#8fd3ff", 0, 3, 2); ledGlow.position.set(SX, 1.2, BACK + .25); scene.add(ledGlow);
  // soft halos around the lamp shades, so a lit lamp looks lit
  const haloTex = canvasTex(128, 128, (ctx, w, h) => { const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, "rgba(255,220,160,.9)"); g.addColorStop(.35, "rgba(255,200,130,.35)"); g.addColorStop(1, "rgba(255,190,120,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); });
  const halo = (x, y, z, s) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); m.position.set(x, y, z); m.scale.setScalar(s); scene.add(m); return m; };
  const tableHalo = halo(TX, .99, TZ, .65);

  // ---------- furniture from illustrations (quantised GLB, ~100 KB each) ----------
  const fabric = new THREE.MeshStandardMaterial({ color: "#e6dccb", roughness: 1 });
  function place(g, { height, width, x, z, baseY = 0 }) {
    const obj = g.scene; const size = new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3());
    obj.scale.multiplyScalar(height ? height / size.y : width / size.x);
    const b = new THREE.Box3().setFromObject(obj); const c = b.getCenter(new THREE.Vector3());
    obj.position.add(new THREE.Vector3(x - c.x, baseY - b.min.y, z - c.z)); // the lowest point sits exactly on the floor
    obj.updateMatrixWorld(true);
    return obj;
  }
  function prepare(obj, material) {
    obj.traverse((m) => { if (!m.isMesh) return; m.geometry.computeVertexNormals(); m.castShadow = true; m.receiveShadow = true; m.material = material(m); });
  }
  const loader = new GLTFLoader();
  const base = new URL("./models/", import.meta.url).href;
  const [sofa, table, floorLamp, coffee, tableLamp, plant, robot] = await Promise.all(["sofa", "side-table", "floor-lamp", "coffee-table", "table-lamp", "plant", "robot"].map((f) => loader.loadAsync(base + f + ".glb")));
  const sofaObj = place(sofa, { width: 2.0, x: SX, z: SZ + .02 });
  // colours projected from the illustration, plus a fine fabric weave. The AI model has no UVs,
  // so the weave is sampled from three sides by world position (triplanar) and blended by the surface normal.
  // linen-like: a faint thread grid plus irregular slubs (thicker, lighter or darker runs), which is what reads at room distance
  const weave = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "rgb(128,0,0)"; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < w; i += 3) { ctx.fillStyle = "rgba(255,0,0,.10)"; ctx.fillRect(i, 0, 1, h); ctx.fillStyle = "rgba(0,0,0,.10)"; ctx.fillRect(0, i, w, 1); }
    for (let i = 0; i < 260; i++) { const light = rnd() < .5; ctx.fillStyle = light ? `rgba(255,0,0,${.25 + rnd() * .3})` : `rgba(0,0,0,${.2 + rnd() * .25})`; const x = rnd() * w, y = Math.floor(rnd() * h / 3) * 3, len = 8 + rnd() * 40; ctx.fillRect(x, y, len, 1.5 + rnd()); if (x + len > w) ctx.fillRect(x - w, y, len, 1.5); }
  });
  weave.colorSpace = THREE.NoColorSpace;
  const fabricMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .92 });
  fabricMat.onBeforeCompile = (sh) => {
    sh.uniforms.weave = { value: weave };
    sh.vertexShader = "varying vec3 vWP; varying vec3 vWN;\n" + sh.vertexShader.replace("#include <project_vertex>", "#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.)).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);");
    sh.fragmentShader = "uniform sampler2D weave; varying vec3 vWP; varying vec3 vWN;\n" + sh.fragmentShader.replace("#include <color_fragment>", `#include <color_fragment>
      vec3 bw = pow(abs(normalize(vWN)), vec3(4.)); bw /= bw.x + bw.y + bw.z;
      float s = 3.5; // one tile is about 29 cm, so a thread is about 1 mm and a slub 1-5 cm
      float wv = texture2D(weave, vWP.zy * s).r * bw.x + texture2D(weave, vWP.xz * s).r * bw.y + texture2D(weave, vWP.xy * s).r * bw.z;
      diffuseColor.rgb *= .75 + .5 * wv;`);
  };
  // the AI sofa's backrest top has a fringe of small spikes (they also cast a bumpy shadow on the wall):
  // smooth only the top 12% of the model a few times, leaving cushions, arms and colours alone
  sofaObj.traverse((m) => {
    if (!m.isMesh || !m.geometry.index) return;
    const g = m.geometry, pos = g.attributes.position, idx = g.index.array, n = pos.count;
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < n; i++) { const y = pos.getY(i); lo = Math.min(lo, y); hi = Math.max(hi, y); }
    const cut = lo + (hi - lo) * .88, nb = Array.from({ length: n }, () => new Set());
    for (let i = 0; i < idx.length; i += 3) { const a = idx[i], b = idx[i + 1], c = idx[i + 2]; nb[a].add(b).add(c); nb[b].add(a).add(c); nb[c].add(a).add(b); }
    const top = []; for (let i = 0; i < n; i++) if (pos.getY(i) > cut) top.push(i);
    for (let pass = 0; pass < 7; pass++) {
      const next = top.map((i) => { let x = 0, y = 0, z = 0; for (const j of nb[i]) { x += pos.getX(j); y += pos.getY(j); z += pos.getZ(j); } const k = nb[i].size || 1; return [x / k, y / k, z / k]; });
      top.forEach((i, t) => pos.setXYZ(i, (pos.getX(i) + next[t][0]) / 2, (pos.getY(i) + next[t][1]) / 2, (pos.getZ(i) + next[t][2]) / 2));
    }
    pos.needsUpdate = true;
  });
  prepare(sofaObj, () => fabricMat);
  const tableObj = place(table, { height: .6, x: TX, z: TZ });
  // light oak to match the coffee table, with a faint grain projected from three sides (the model has no UVs)
  const grain = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "rgb(128,0,0)"; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) { const y = rnd() * h, a = .05 + rnd() * .12; ctx.strokeStyle = rnd() < .5 ? `rgba(0,0,0,${a})` : `rgba(255,0,0,${a})`; ctx.lineWidth = 1 + rnd() * 2.5; ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(w * .3, y + (rnd() - .5) * 12, w * .7, y + (rnd() - .5) * 12, w, y); ctx.stroke(); }
  });
  grain.colorSpace = THREE.NoColorSpace;
  const oakMat = new THREE.MeshStandardMaterial({ color: "#b98a5c", roughness: .55 });
  oakMat.onBeforeCompile = (sh) => {
    sh.uniforms.grain = { value: grain };
    sh.vertexShader = "varying vec3 vWP; varying vec3 vWN;\n" + sh.vertexShader.replace("#include <project_vertex>", "#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.)).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);");
    sh.fragmentShader = "uniform sampler2D grain; varying vec3 vWP; varying vec3 vWN;\n" + sh.fragmentShader.replace("#include <color_fragment>", `#include <color_fragment>
      vec3 bw = pow(abs(normalize(vWN)), vec3(4.)); bw /= bw.x + bw.y + bw.z;
      float g = texture2D(grain, vWP.zy * vec2(1.2, 6.)).r * bw.x + texture2D(grain, vWP.xz * vec2(1.2, 6.)).r * bw.y + texture2D(grain, vWP.yx * vec2(6., 1.2)).r * bw.z;
      diffuseColor.rgb *= .8 + .4 * g;`);
  };
  prepare(tableObj, () => oakMat);
  const lampObj = place(floorLamp, { height: 1.55, x: SX - 1.3, z: SZ - .05 });
  const lb = new THREE.Box3().setFromObject(lampObj);
  const shadeGlow = { value: 0 };
  prepare(lampObj, (m) => {
    // shade starts at 70% of the height (measured on the model: radius jumps from 0.035 to 0.34 there)
    const pos = m.geometry.attributes.position, col = new Float32Array(pos.count * 3), v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld); col.set((v.y - lb.min.y) / (lb.max.y - lb.min.y) > .7 ? [.95, .9, .8] : [.5, .33, .12], i * 3); } // linen shade; brass pole and base (linear)
    m.geometry.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .6, metalness: .1 });
    // the shade glows when the lamp is on: shade vertices are the pale ones (blue channel .8 vs .28 on the pole)
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.shadeGlow = shadeGlow;
      sh.fragmentShader = "uniform float shadeGlow;\n" + sh.fragmentShader
        // brass = the dark vertices (pole and base): a little metallic sheen
        .replace("#include <metalnessmap_fragment>", "#include <metalnessmap_fragment>\nfloat brass = 1. - step(.6, vColor.b); metalnessFactor = mix(metalnessFactor, .45, brass); roughnessFactor = mix(roughnessFactor, .32, brass);")
        .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += step(.6, vColor.b) * vec3(1., .78, .5) * shadeGlow;");
    };
    return mat;
  });
  // coffee table, table lamp, plant: Codex's single-item drawings → image-to-3D → colours from the drawing
  // (lamp and plant coloured by measured height zones; see Desktop trial tools/zone_colors.py)
  const vcol = (opts) => () => new THREE.MeshStandardMaterial({ vertexColors: true, ...opts });
  const coffeeObj = place(coffee, { width: 1.0, x: SX, z: SZ + 1.05 });
  prepare(coffeeObj, vcol({ roughness: .55 }));
  const coffeeTop = new THREE.Box3().setFromObject(coffeeObj).max.y;
  add(new THREE.BoxGeometry(.26, .05, .18), new THREE.MeshStandardMaterial({ color: "#6d7d68" }), SX - .12, coffeeTop + .025, SZ + 1.02); // a book
  const sideTop = new THREE.Box3().setFromObject(tableObj).max.y;
  const tableLampObj = place(tableLamp, { height: .45, x: TX, z: TZ, baseY: sideTop });
  const tableGlow = { value: .45 };
  prepare(tableLampObj, () => {
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .7 });
    // shade = the pale linen vertices (blue channel ~.67 linear vs ~.47 on the ceramic base)
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.tableGlow = tableGlow;
      sh.fragmentShader = "uniform float tableGlow;\n" + sh.fragmentShader.replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += step(.6, vColor.b) * vec3(1., .81, .54) * tableGlow;");
    };
    return mat;
  });
  tableLampObj.traverse((m) => { if (m.isMesh) m.castShadow = false; }); // the lamp's own light sits inside this closed mesh
  const tlb = new THREE.Box3().setFromObject(tableLampObj), tlY = tlb.min.y + (tlb.max.y - tlb.min.y) * .72;
  lampLight.position.set(TX, tlY, TZ); tableHalo.position.set(TX, tlY, TZ + .2);
  const plantObj = place(plant, { height: 1.35, x: PX, z: PZ });
  prepare(plantObj, vcol({ roughness: .75 }));
  // a small home robot (Codex's drawing, same pipeline) keeps the plant company by the rug; no caption, just there
  const robotObj = place(robot, { height: .46, x: -1.45, z: SZ + 1.45 });
  // Vertex colours cannot hold a crisp screen or small eyes (edges can only fall on vertices: jagged, and the dark
  // screen spilled down the head; DSH review 2026-10-16). So: the dark projected colour becomes body cream, and the
  // face screen and eyes are their own small meshes with clean edges. Greens from the drawing stay.
  const cream = new THREE.Color("#ece6dc");
  // projected greens came out blotchy too, so the body is re-coloured by height: cream, with the sage belt from the drawing
  const sage = new THREE.Color("#8fa083"), rb0 = new THREE.Box3().setFromObject(robotObj), rv = new THREE.Vector3();
  robotObj.traverse((m) => {
    const c = m.isMesh && m.geometry.attributes.color; if (!c) return;
    const pos = m.geometry.attributes.position;
    for (let i = 0; i < c.count; i++) {
      rv.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld); const t = (rv.y - rb0.min.y) / (rb0.max.y - rb0.min.y);
      const col = t > .12 && t < .27 ? sage : cream; c.setXYZ(i, col.r, col.g, col.b);
    }
    c.needsUpdate = true;
  });
  prepare(robotObj, vcol({ roughness: .5 }));
  // measure the front of the head (the model faces +z) to fit the screen on it
  const rbb = new THREE.Box3().setFromObject(robotObj), rH = rbb.max.y - rbb.min.y, rW = rbb.max.x - rbb.min.x, rcx = (rbb.min.x + rbb.max.x) / 2;
  const fy = rbb.max.y - rH * .29, frontZ = (x, y) => {
    let z = -Infinity; const v = new THREE.Vector3();
    robotObj.traverse((m) => { if (!m.isMesh) return; const pos = m.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld); if (Math.abs(v.x - x) < rW * .06 && Math.abs(v.y - y) < rH * .05) z = Math.max(z, v.z); } });
    return z;
  };
  const fw = rW * .6, fh = rH * .25, zc = frontZ(rcx, fy), ze = frontZ(rcx + fw / 2, fy);
  const bend = isFinite(ze) ? (zc - ze) / ((fw / 2) ** 2) : 0; // follow the head's curve across the screen
  // the head bulges in places (it poked through the screen's lower middle): sample a grid over the screen area and
  // sit the screen just proud of the highest point
  let lift = 0;
  for (const gx of [-.45, -.25, 0, .25, .45]) for (const gy of [-.5, -.25, 0, .25, .5]) {
    const x = gx * fw, z = frontZ(rcx + x, fy + gy * fh);
    if (isFinite(z)) lift = Math.max(lift, z - (zc - bend * x * x));
  }
  const screenShape = new THREE.Shape(), rr = fh * .35;
  screenShape.moveTo(-fw / 2 + rr, -fh / 2); screenShape.lineTo(fw / 2 - rr, -fh / 2); screenShape.quadraticCurveTo(fw / 2, -fh / 2, fw / 2, -fh / 2 + rr);
  screenShape.lineTo(fw / 2, fh / 2 - rr); screenShape.quadraticCurveTo(fw / 2, fh / 2, fw / 2 - rr, fh / 2); screenShape.lineTo(-fw / 2 + rr, fh / 2);
  screenShape.quadraticCurveTo(-fw / 2, fh / 2, -fw / 2, fh / 2 - rr); screenShape.lineTo(-fw / 2, -fh / 2 + rr); screenShape.quadraticCurveTo(-fw / 2, -fh / 2, -fw / 2 + rr, -fh / 2);
  const screenGeo = new THREE.ShapeGeometry(screenShape, 12);
  { const q = screenGeo.attributes.position; for (let i = 0; i < q.count; i++) q.setZ(i, -bend * q.getX(i) ** 2); screenGeo.computeVertexNormals(); }
  const screen = new THREE.Mesh(screenGeo, new THREE.MeshStandardMaterial({ color: "#2b2d30", roughness: .35, metalness: .1 }));
  screen.position.set(rcx, fy, zc + lift + .02); // 2 cm proud: the sampled lift alone still let a bump show through the lower middle
  const eyeMat = new THREE.MeshBasicMaterial({ color: "#ffe2a8" });
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.CircleGeometry(fh * .13, 20), eyeMat);
    const ex = sx * fw * .2; eye.position.set(ex, fh * .05, -bend * ex * ex + .002); screen.add(eye);
  }
  scene.add(screen); robotObj.attach(screen);
  scene.add(sofaObj, tableObj, lampObj, coffeeObj, tableLampObj, plantObj);
  // the robot turns around its own centre: hang it on a pivot at its footprint centre
  const rb = new THREE.Box3().setFromObject(robotObj), robotPivot = new THREE.Group();
  robotPivot.position.set((rb.min.x + rb.max.x) / 2, 0, (rb.min.z + rb.max.z) / 2); scene.add(robotPivot); robotPivot.attach(robotObj);
  robotPivot.rotation.y = .5; // turned a little toward the room
  // the floor lamp gets its own light just under the shade (no shadow: a light inside the closed shade mesh would be blocked)
  const shadeY = lb.min.y + (lb.max.y - lb.min.y) * .8, lampX = (lb.min.x + lb.max.x) / 2, lampZ = (lb.min.z + lb.max.z) / 2;
  const floorLight = new THREE.PointLight("#ffc98a", 0, 5, 1.6); floorLight.position.set(lampX, shadeY - .12, lampZ + .05); scene.add(floorLight);
  const floorHalo = halo(lampX, shadeY, lampZ + .3, 1.1); // a little in front of the shade so the shade does not hide it

  // ---------- state + panel ----------
  const state = { mood: "rain", wall: "original", rug: "stripe", curtain: "linen", print: "hills", lang };
  const cache = {};
  const CURTAINS = {
    linen: { zh: "亞麻米白", en: "Linen cream", color: "#e6ddcc" },
    mist: { zh: "霧藍", en: "Mist blue", color: "#a9b8c6" },
    sage: { zh: "鼠尾草綠", en: "Sage green", color: "#b3bd9c" },
    clay: { zh: "陶土", en: "Terracotta", color: "#c79072" },
    rose: { zh: "霧玫瑰", en: "Dusty rose", color: "#d3a6a0" },
  };
  // light values for a feeling. Switching feelings eases between them over 0.6 s (skipped with reduced motion),
  // so the room seems to change its light rather than jump to a new picture.
  const lights = () => {
    const m = MOODS[state.mood];
    return {
      hemi: m.hemi, win: m.win, lamp: m.lamp, fill: m.fill, floor: m.floor, exposure: m.exposure, led: m.led ? .5 : 0,
      floorHalo: m.floor ? m.glow : 0, tableHalo: m.glow,
      shade: m.floor ? .55 : 0, table: m.glow > .3 ? .45 : .18, // the AI shade is a solid shape: a soft glow keeps its form; dimmer in daylight
      winCol: new THREE.Color(m.winCol), out: new THREE.Color(m.out),
    };
  };
  function setLights(v) {
    hemi.intensity = v.hemi; windowLight.intensity = v.win; windowLight.color.copy(v.winCol);
    lampLight.intensity = v.lamp; fill.intensity = v.fill; outMat.color.copy(v.out);
    floorLight.intensity = v.floor; floorHalo.material.opacity = v.floorHalo; tableHalo.material.opacity = v.tableHalo;
    shadeGlow.value = v.shade; tableGlow.value = v.table; renderer.toneMappingExposure = v.exposure; ledGlow.intensity = v.led;
  }
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let shown = null, shownMood = null, fade = 0;
  function easeLights() {
    const to = lights();
    if (!shown || still || shownMood === state.mood) { shown = to; shownMood = state.mood; fade++; setLights(to); return; }
    const from = shown, t0 = performance.now(), id = ++fade;
    shownMood = state.mood;
    const step = (now) => {
      if (id !== fade) return; // a newer change took over
      const k = Math.min(1, (now - t0) / 600), e = k * k * (3 - 2 * k);
      const v = {};
      for (const key in to) v[key] = to[key].isColor ? from[key].clone().lerp(to[key], e) : from[key] + (to[key] - from[key]) * e;
      shown = v; setLights(v); render();
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  // the visitor's room lives in the address, so a copied link opens the same room (unknown values are ignored)
  const CHOICES = { mood: MOODS, wall: WALLS, rug: RUGS, curtain: CURTAINS, print: PRINTS };
  const fromUrl = new URLSearchParams(location.search);
  for (const k in CHOICES) { const v = fromUrl.get(k); if (v && Object.hasOwn(CHOICES[k], v)) state[k] = v; }
  function toUrl() {
    const u = new URL(location.href);
    for (const k in CHOICES) u.searchParams.set(k, state[k]);
    history.replaceState(null, "", u);
  }
  function apply() {
    const m = MOODS[state.mood];
    if (announced !== state.mood) { if (announced) live.textContent = MOODS[state.mood][state.lang] + ". " + MOODS[state.mood].why[state.lang]; announced = state.mood; }
    outMat.map = cache["view-" + state.mood] ||= VIEWS[state.mood](); outMat.needsUpdate = true;
    led.visible = !!m.led;
    printMat.map = printFor(state.print); printMat.needsUpdate = true;
    easeLights();
    linen.color.set(CURTAINS[state.curtain].color);
    const w = WALLS[state.wall];
    if (w.tex) { const t = cache[state.wall] ||= w.tex(); t.repeat.set(1 / w.size, 1 / w.size); wallMat.map = t; wallMat.color.set("#ffffff"); }
    else { wallMat.map = null; wallMat.color.set(w.paint); }
    wallMat.needsUpdate = true;
    rugMat.map = cache["rug-" + state.rug] ||= RUGS[state.rug].tex(); rugMat.needsUpdate = true;
    drawPanel();
    render();
  }
  function drawPanel() {
    const t = TEXT[state.lang];
    // the panel is rebuilt on every choice; remember which button had focus so keyboard users stay where they were
    const had = document.activeElement;
    let keep = null;
    if (had && panel.contains(had)) {
      const g = had.closest(".opts");
      keep = g ? { g: [...panel.querySelectorAll(".opts")].indexOf(g), k: had.dataset.key } : { c: ["shuffle", "look"].find((c) => had.classList.contains(c)) || "save" };
    }
    panel.replaceChildren(...[["mood", MOODS], ["wall", WALLS], ["rug", RUGS], ["curtain", CURTAINS], ["print", PRINTS]].flatMap(([key, table]) => {
      const h = document.createElement("h2"); h.textContent = t[key];
      const box = document.createElement("div"); box.className = "opts"; box.setAttribute("role", "group"); box.setAttribute("aria-label", t[key]);
      box.append(...Object.entries(table).map(([k, v]) => {
        const b = document.createElement("button"); b.type = "button"; b.textContent = v[state.lang]; b.dataset.key = k;
        b.setAttribute("aria-pressed", String(state[key] === k));
        b.onclick = () => { state[key] = k; apply(); toUrl(); };
        return b;
      }));
      if (key !== "mood") return [h, box];
      const why = document.createElement("p"); why.className = "why"; why.textContent = MOODS[state.mood].why[state.lang]; // why this pairing
      return [h, box, why];
    }), Object.assign(document.createElement("p"), { className: "hint", textContent: inside ? t.lookHint : t.hint }),
    Object.assign(document.createElement("button"), { type: "button", className: "save look", textContent: inside ? t.back : t.look, onclick: () => goLook(!inside) }),
    Object.assign(document.createElement("button"), { type: "button", className: "save shuffle", textContent: t.shuffle, onclick: () => shuffle() }),
    Object.assign(document.createElement("button"), { type: "button", className: "save", textContent: t.save, onclick: () => savePostcard() }));
    if (keep) {
      const target = keep.c ? panel.querySelector("." + keep.c) : panel.querySelectorAll(".opts")[keep.g]?.querySelector(`button[data-key="${keep.k}"]`);
      target?.focus({ preventScroll: true });
    }
  }
  // a random wall, rug, curtain and print (never the same set twice in a row); the feeling stays the visitor's own
  function shuffle() {
    const pick = (table, now) => { const ks = Object.keys(table).filter((k) => k !== now); return ks[Math.floor(Math.random() * ks.length)]; };
    state.wall = pick(WALLS, state.wall); state.rug = pick(RUGS, state.rug); state.curtain = pick(CURTAINS, state.curtain); state.print = pick(PRINTS, state.print);
    apply(); toUrl();
  }

  // postcard: the room as it looks now, with a paper strip naming the chosen feeling, wall and rug
  function postcard() {
    render(); // read the canvas in the same task as the render, so no preserveDrawingBuffer is needed
    const src = renderer.domElement, w = src.width, h = src.height, strip = Math.round(Math.max(90, h * .16));
    const c = document.createElement("canvas"); c.width = w; c.height = h + strip;
    const ctx = c.getContext("2d");
    ctx.drawImage(src, 0, 0);
    ctx.fillStyle = "#fbfaf6"; ctx.fillRect(0, h, w, strip);
    const l = state.lang, pad = Math.round(strip * .32), big = Math.round(strip * .26), small = Math.round(strip * .17);
    ctx.fillStyle = "#24302c"; ctx.font = `800 ${big}px system-ui, "Noto Sans TC", sans-serif`; ctx.textBaseline = "alphabetic";
    ctx.fillText("ROOMVERSE 3D", pad, h + pad + big * .8);
    ctx.fillStyle = "#5b665f"; ctx.font = `500 ${small}px system-ui, "Noto Sans TC", sans-serif`;
    ctx.fillText([MOODS[state.mood][l], WALLS[state.wall][l], RUGS[state.rug][l], CURTAINS[state.curtain][l], PRINTS[state.print][l]].join("  ·  "), pad, h + strip - pad * .9);
    ctx.textAlign = "right"; ctx.fillText("paulstradecraft.com", w - pad, h + pad + big * .8);
    return c;
  }
  function savePostcard() {
    postcard().toBlob((blob) => {
      if (!blob) return;
      const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: TEXT[state.lang].file });
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }, "image/png");
  }

  let looping = false;
  function render() { renderer.render(scene, camera); }
  // a quiet easter egg: tap the little robot and it hops, turns to look at you, then turns back.
  // Only a tap counts (a drag to turn the room does not); with reduced motion it just turns to look.
  const ray = new THREE.Raycaster(), tap = new THREE.Vector2(), robotHome = { y: robotPivot.position.y, r: robotPivot.rotation.y };
  let downAt = null, hopping = false;
  renderer.domElement.addEventListener("pointerdown", (e) => { downAt = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener("pointerup", (e) => {
    if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6 || hopping) return;
    const r = renderer.domElement.getBoundingClientRect();
    tap.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(tap, camera);
    if (!ray.intersectObject(robotObj, true).length) return;
    hopping = true;
    const look = Math.atan2(camera.position.x - robotPivot.position.x, camera.position.z - robotPivot.position.z); // the robot faces +z
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, t0 = performance.now(), T = 1400;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / T);
      const turn = k < .3 ? k / .3 : k < .75 ? 1 : 1 - (k - .75) / .25; // turn to you, hold, turn back
      const ease = turn * turn * (3 - 2 * turn);
      robotPivot.rotation.y = robotHome.r + (look - robotHome.r) * ease;
      robotPivot.position.y = robotHome.y + (reduce ? 0 : Math.max(0, Math.sin(Math.min(1, k / .3) * Math.PI)) * .09);
      render();
      if (k < 1) requestAnimationFrame(step); else { robotPivot.position.y = robotHome.y; robotPivot.rotation.y = robotHome.r; hopping = false; render(); }
    };
    requestAnimationFrame(step);
  });
  function loop() { if (!inside && !moving && controls.update()) { render(); requestAnimationFrame(loop); } else { render(); looping = false; } }

  // ---------- look around ----------
  function goLook(on) {
    if (moving || on === inside) return;
    moving = true; intro = false;
    const fromPos = camera.position.clone(), fromQ = camera.quaternion.clone(), fromFov = camera.fov;
    // the front fill light sits 20 cm from the wall behind the camera and would burn a hot spot on it when you turn round:
    // while you stand inside it moves to above the middle of the room, and goes back when you step out
    const fromFill = fill.position.clone(), toFill = on ? new THREE.Vector3(.2, 2.2, .2) : new THREE.Vector3(.2, 2.2, 2.2);
    let toPos, toQ, toFov, home = null;
    if (on) { lookYaw = 0; lookPitch = -0.05; toPos = INSIDE_POS.clone(); toQ = lookQuat(); toFov = insideFov(); controls.enabled = false; }
    else {
      home = homeView(); toPos = home.pos; toFov = home.fov;
      const tmp = new THREE.PerspectiveCamera(); tmp.position.copy(home.pos); tmp.lookAt(home.target); toQ = tmp.quaternion.clone();
    }
    const done = () => {
      fill.position.copy(toFill);
      if (on) { inside = true; dom.tabIndex = 0; }
      else { inside = false; dom.removeAttribute("tabindex"); camera.position.copy(home.pos); controls.target.copy(home.target); camera.fov = home.fov; camera.updateProjectionMatrix(); controls.enabled = true; controls.update(); }
      moving = false; drawPanel(); render();
    };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      camera.position.copy(toPos); camera.quaternion.copy(toQ); camera.fov = toFov; camera.updateProjectionMatrix(); done(); return;
    }
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, Math.max(0, (now - t0) / 1100)), e = k * k * (3 - 2 * k);
      camera.position.lerpVectors(fromPos, toPos, e); camera.quaternion.slerpQuaternions(fromQ, toQ, e); fill.position.lerpVectors(fromFill, toFill, e);
      camera.fov = fromFov + (toFov - fromFov) * e; camera.updateProjectionMatrix(); render();
      if (k < 1) requestAnimationFrame(step); else done();
    };
    requestAnimationFrame(step);
  }
  // drag (mouse or finger) turns the view on the spot; arrow keys do too when the view has focus
  const dom = renderer.domElement;
  let drag = null, queued = false;
  const aim = () => { camera.quaternion.copy(lookQuat()); if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; render(); }); } };
  dom.addEventListener("pointerdown", (e) => { if (!inside || moving) return; drag = { x: e.clientX, y: e.clientY }; dom.setPointerCapture(e.pointerId); });
  dom.addEventListener("pointermove", (e) => {
    if (!drag) return;
    lookYaw += (e.clientX - drag.x) * .0045; lookPitch = Math.max(-.6, Math.min(.6, lookPitch + (e.clientY - drag.y) * .0035));
    drag.x = e.clientX; drag.y = e.clientY; aim();
  });
  const endDrag = () => { drag = null; };
  dom.addEventListener("pointerup", endDrag); dom.addEventListener("pointercancel", endDrag);
  dom.addEventListener("keydown", (e) => {
    if (!inside || moving) return;
    const d = { ArrowLeft: [.12, 0], ArrowRight: [-.12, 0], ArrowUp: [0, .08], ArrowDown: [0, -.08] }[e.key];
    if (!d) return;
    e.preventDefault(); lookYaw += d[0]; lookPitch = Math.max(-.6, Math.min(.6, lookPitch + d[1])); aim();
  });
  controls.addEventListener("start", () => { if (!looping) { looping = true; requestAnimationFrame(loop); } });
  controls.addEventListener("change", () => { if (!looping) render(); });
  new ResizeObserver(() => { fit(); render(); }).observe(stage);
  fit(); apply();
  // on entering, the camera drifts in from a step back (1.8 s). Skipped with reduced motion; a drag or a test view stops it.
  let intro = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (intro) {
    const end = camera.position.clone(), from = end.clone().add(new THREE.Vector3(-.3, .22, .9)), t0 = performance.now();
    controls.addEventListener("start", () => { intro = false; });
    const step = (now) => {
      if (!intro) return;
      const k = Math.min(1, Math.max(0, (now - t0) / 1800)), e = 1 - (1 - k) ** 3; // a frame stamp can be a little before t0
      camera.position.lerpVectors(from, end, e); camera.lookAt(controls.target); render();
      if (k < 1) requestAnimationFrame(step); else { intro = false; controls.update(); }
    };
    camera.position.copy(from); requestAnimationFrame(step);
    // safety net for very slow devices: if the drift has not finished by 2.2 s, settle at the end position
    setTimeout(() => { if (intro) { intro = false; camera.position.copy(end); camera.lookAt(controls.target); controls.update(); render(); } }, 2200);
  }
  onReady?.();
  return {
    setLang(l) { state.lang = l; renderer.domElement.setAttribute("aria-label", TEXT[l].canvas); drawPanel(); },
    set(k, v) { state[k] = v; apply(); }, // used by tests
    postcard, // used by tests: returns the postcard canvas
    cam: () => camera.position.toArray().map((v) => +v.toFixed(2)), // used by tests: where the camera is
    look: goLook, // used by tests
    turn(yaw, pitch = lookPitch) { lookYaw = yaw; lookPitch = pitch; aim(); }, // used by tests: face a direction inside the room
    isInside: () => inside && !moving,
    isHome: () => !inside && !moving,
    view(x, y, z) { intro = false; camera.position.set(x, y, z); controls.update(); render(); },
  };
}
