// ROOMVERSE 3D: the same soft-furnishing idea as ROOM MODE REMOTE, as a small 3D room you can turn.
// Loaded only after the visitor presses "enter" (index.html), so the portfolio page stays light.
// Furniture: sofa, coffee table, side table, table lamp, floor lamp and plant were drawn as single illustrations, turned into shapes by an
// image-to-3D model, then coloured locally from the same illustrations. Walls, rug, light: drawn by code.
// Built and checked in a local trial first (Desktop CC_3D軟裝房間試作_2026-10-16, README trials 1-8).
import * as THREE from "./vendor/three.module.min.js"; // three.js r160 (MIT), self-hosted: the site loads nothing from other hosts
import { OrbitControls } from "./vendor/OrbitControls.js";
import { GLTFLoader } from "./vendor/GLTFLoader.js";

export const TEXT = {
  zh: { mood: "感覺", wall: "牆面", rug: "地毯", curtain: "窗簾", print: "掛畫", hint: "拖一下轉動房間，或點「看電視牆」。網址會記住你搭的房間，複製給朋友就能看到同一間。", windowView: "回到窗邊", tvView: "看電視牆", canvas: "3D 軟裝房間，可以拖曳轉動角度", save: "存成明信片", shuffle: "幫我隨機搭一間", director: "看 8 秒房間短片", stop: "停止短片", close: "收起對照", preparing: "短片準備中…", unavailable: "窗景暫時無法載入，請再試一次。", directorPhases: ["雨天暖燈", "白天自然光", "夜晚冷暖光"], directorStill: "同一間房，從雨天的暖燈、白天的自然光，到夜晚的冷暖對照；小機器人最後回頭看你。", directorDone: "短片結束，已回到你原來的房間。", file: "ROOMVERSE-3D-明信片.png", artFile: "ROOMVERSE-3D-插畫明信片.webp" },
  en: { mood: "Feeling", wall: "Wall", rug: "Rug", curtain: "Curtains", print: "Wall print", hint: "Drag to turn the room, or tap ‘Turn to the TV wall’. The address remembers your room, so a copied link opens the same one.", windowView: "Back to the window", tvView: "Turn to the TV wall", canvas: "A 3D living room; drag to turn it", save: "Save as a postcard", shuffle: "Surprise me with a room", director: "Watch the 8-second room tour", stop: "Stop the tour", close: "Close comparison", preparing: "Preparing the tour…", unavailable: "The window view could not load. Please try again.", directorPhases: ["Rain · warm lamps", "Daylight", "Night · warm and cool"], directorStill: "One room: warm lamps on a rainy day, daylight, then a cool-and-warm evening. The little robot turns to greet you at the end.", directorDone: "Tour finished. Your room is back as you left it.", file: "ROOMVERSE-3D-postcard.png", artFile: "ROOMVERSE-3D-illustrated-postcard.webp" },
};
// Short labels for the single-row phone toolbar. The accessible name stays the full phrase above.
const PHONE_BAR = {
  zh: { save: "存成明信片", shuffle: "隨機搭一間", director: "8秒短片", stop: "停止短片", close: "收起對照", preparing: "準備中" },
  en: { save: "Save postcard", shuffle: "Random room", director: "8s tour", stop: "Stop", close: "Close", preparing: "Preparing" },
};
const POSTCARD_ART = new Set(["rain", "family", "tech", "chic", "slow", "tv"]);
const MOODS = {
  // floor: the floor lamp's light; glow: how strong the halos around lit shades are
  // why: one line on why the pairing works. rain, family, tech and chic are Paul's wording (2026-10-16); the slow line is a CC draft awaiting Paul's review.
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
  slow: { zh: "週日午後慢慢過", en: "Slow Sunday",
    why: { zh: "白天的光柔和又均勻，用淺木色、亞麻和一點深色收邊，房間就安靜下來，週日下午什麼都不用趕。", en: "Soft, even daylight with pale wood, linen and one dark accent keeps the room calm, so a Sunday afternoon has nowhere to hurry to." },
    hemi: 1.6, win: 2.2, winCol: "#f4f6f8", lamp: .5, fill: 1.8, out: "#f7f8f6", exposure: 1.08, floor: 0, glow: .04 },
  tv: { zh: "追劇夜", en: "Series night",
    why: { zh: "週五晚上，關掉主燈，只留燈帶和一盞暖燈，沙發就是整個世界。", en: "Friday night: ceiling light off, just the warm strips and one lamp; the sofa is the whole world." }, hemi: .62, win: .7, winCol: "#56647f", lamp: 2.5, fill: .55, out: "#c6cad6", exposure: .98, floor: .45, glow: .48 },
};

export async function start({ stage, panel, lang, onReady }) {
  const compactRender = matchMedia("(max-width: 600px)").matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, compactRender ? 1.5 : 2));
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
  const orbitCenter = new THREE.Vector3(0, 1.28, 0.1);
  const requestedView = new URLSearchParams(location.search).get("view");
  let viewTheta = requestedView === "tv" ? Math.PI : 0;
  let currentView = requestedView === "tv" ? "tv" : "window";
  let orbitRadius = 1.9, orbitPhi = Math.PI / 2, viewMoveToken = 0;
  let director = null, directorPreparing = false, directorPrepareToken = 0;
  let intro = false, introEnd = null;
  const stopButton = Object.assign(document.createElement("button"), { type: "button", className: "director-stop", hidden: true });
  stopButton.onclick = () => { if (director) stopDirector(); else if (directorPreparing) cancelPreparation(); };
  stage.append(stopButton);
  controls.target.copy(orbitCenter);
  controls.enableDamping = true; controls.enablePan = false;
  controls.minDistance = 1.55; controls.maxDistance = 1.95;
  controls.minPolarAngle = Math.PI * 0.32; controls.maxPolarAngle = Math.PI * 0.5;
  // Keep azimuth unbounded: clamping at ±π creates a hard seam at the TV wall and prevents a full orbit.
  controls.minAzimuthAngle = -Infinity; controls.maxAzimuthAngle = Infinity;
  const cameraAt = (theta, radius = orbitRadius, phi = orbitPhi) => new THREE.Vector3(
    orbitCenter.x + radius * Math.sin(phi) * Math.sin(theta),
    orbitCenter.y + radius * Math.cos(phi),
    orbitCenter.z + radius * Math.sin(phi) * Math.cos(theta),
  );
  // Base framing stays here: 66° on a tall canvas, 44° otherwise. The TV-wall widening is applied
  // later, per drawn frame, so this reset can keep doing one job (size, aspect, pose).
  const baseFov = () => (camera.aspect < .8 ? 66 : 44);
  const phoneViewport = matchMedia("(max-width: 600px)");
  const phoneActions = matchMedia("(max-width: 768px)");
  let fovProjectionUpdates = 0;
  // The house plaque's right edge (TX + 0.35 m) is the first thing a phone window-view clips.
  // 66° still misses it on a tall canvas; 44° misses it once the English stage is only a little
  // wider than 0.8. Ask for the vertical fov that puts that edge at 0.96 NDC from the level
  // window pose. Wider aspects, including desktop, already clear it at the base fov.
  function plaqueWindowFov() {
    if (!(camera.aspect > 0)) return 0;
    const radius = camera.aspect < .8 ? 1.82 : 1.9;
    const depth = orbitCenter.z + radius - (BACK + .015);
    const tanHalf = (TX + .35) / (depth * camera.aspect * .96);
    return 2 * Math.atan(tanHalf) * 180 / Math.PI;
  }
  function fovForYaw() {
    if (director) return baseFov();
    const base = Math.max(baseFov(), plaqueWindowFov());
    // Short phone stages can be wider than .8 even though their TV shelves no longer fit at 44°.
    // Frame the shelves' outer edges (±2.13 m), with a little breathing room, from the TV pose.
    // Keep the TV end at least as wide as the window, so the blend never tightens mid-turn.
    const tvFov = camera.aspect < .8 ? Math.max(76, base) : phoneViewport.matches
      ? Math.max(base, 2 * Math.atan(2.3 / ((FRONT - orbitCenter.z + orbitRadius) * camera.aspect)) * 180 / Math.PI)
      : base;
    if (tvFov === base) return base;
    // 0 faces the window, ±π faces the TV wall. The cosine keeps intermediate turns smooth.
    const yaw = Math.atan2(camera.position.x - orbitCenter.x, camera.position.z - orbitCenter.z);
    return base + (tvFov - base) * (1 - Math.cos(yaw)) / 2;
  }
  function syncFov() {
    const next = fovForYaw();
    if (Math.abs(camera.fov - next) < 1e-4) return;
    camera.fov = next;
    camera.updateProjectionMatrix();
    fovProjectionUpdates++;
  }
  function fit() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    orbitRadius = camera.aspect < .8 ? 1.82 : 1.9;
    orbitPhi = Math.PI / 2;
    camera.fov = baseFov();
    if (!director) {
      controls.target.copy(orbitCenter);
      camera.position.copy(cameraAt(viewTheta));
      camera.lookAt(orbitCenter);
    }
    camera.updateProjectionMatrix(); // aspect changes need this even when the base fov number does not
    if (!director) controls.update();
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
  const image = (name, repeat, onLoad, onError) => () => {
    const t = texLoader.load(new URL(`./tex/${name}.webp`, import.meta.url).href, (texture) => { onLoad?.(texture); render(); }, undefined, onError);
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  };
  const WALLS = {
    original: { zh: "原來的米白", en: "Original cream", paint: "#e9e1d3" },
    sand: { zh: "暖砂米", en: "Warm sand", paint: "#d9c6a8" },
    olive: { zh: "柔橄欖", en: "Soft olive", paint: "#a9ad8a" },
    blush: { zh: "霧粉", en: "Dusty blush", paint: "#e6cec6" },
    mist: { zh: "霧灰藍", en: "Misty blue-grey", paint: "#c3ccd2" },
    pine: { zh: "深松綠", en: "Deep pine", paint: "#46604f" },
    dusk: { zh: "暮色深藍", en: "Dusk navy", paint: "#66788d" },
    wine: { zh: "深酒紅", en: "Deep wine", paint: "#875b5e" },
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
  const FRONT = BACK + D;
  const add = (geo, mat, x, y, z, cast = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; scene.add(m); return m; };
  const floor = add(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: floorTex, roughness: .55 }), 0, 0, BACK + D / 2, false);
  floor.rotation.x = -Math.PI / 2;
  // back wall = one shape with the window cut out, so a wallpaper covers the whole wall, around the window too
  const win = { x0: -2.1, x1: -0.95, y0: 0.75, y1: 2.25 };
  const wallShape = new THREE.Shape([new THREE.Vector2(-W / 2, 0), new THREE.Vector2(W / 2, 0), new THREE.Vector2(W / 2, H), new THREE.Vector2(-W / 2, H)]);
  wallShape.holes.push(new THREE.Path([new THREE.Vector2(win.x0, win.y0), new THREE.Vector2(win.x1, win.y0), new THREE.Vector2(win.x1, win.y1), new THREE.Vector2(win.x0, win.y1)]));
  const wallMat = new THREE.MeshStandardMaterial({ color: "#e9e1d3", roughness: .9 });
  add(new THREE.ShapeGeometry(wallShape), wallMat, 0, 0, BACK, true); // casts: window light only comes in through the window
  const frontGeometry = new THREE.PlaneGeometry(W, H);
  for (let i = 0; i < frontGeometry.attributes.uv.count; i++) {
    const uv = frontGeometry.attributes.uv;
    uv.setXY(i, uv.getX(i) * W, uv.getY(i) * H); // keep wallpaper repeat at the same real-world tile scale
  }
  frontGeometry.attributes.uv.needsUpdate = true;
  const frontWall = add(frontGeometry, wallMat, 0, H / 2, FRONT, true);
  frontWall.rotation.y = Math.PI; // the room-facing side is visible from inside
  frontWall.name = "front-wall";
  const sideMat = new THREE.MeshStandardMaterial({ color: "#e4ddd0", roughness: .95 });
  // side walls and ceiling cast too: otherwise window light leaks through them (a bright band on the right wall, a patch at the left)
  [-1, 1].forEach((s) => { add(new THREE.PlaneGeometry(D, H + .3), sideMat, s * W / 2, H / 2 - .15, BACK + D / 2, true).rotation.y = -s * Math.PI / 2; });
  add(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ color: "#f6f2ea", emissive: "#f6f2ea", emissiveIntensity: .12 }), 0, H, BACK + D / 2, true).rotation.x = Math.PI / 2;
  const wood = new THREE.MeshStandardMaterial({ color: "#8a5a36", roughness: .6 });
  const skirting = new THREE.MeshStandardMaterial({ color: "#f3efe6", roughness: .7 });
  add(new THREE.BoxGeometry(W, .09, .02), skirting, 0, .045, BACK + .01, false);
  add(new THREE.BoxGeometry(W, .09, .02), skirting, 0, .045, FRONT - .015, false).name = "front-skirting";
  // side skirting too: finishes the room and covers the thin light line where wall meets floor
  const doorZ = 1.25, doorOuterWidth = 1.05;
  add(new THREE.BoxGeometry(.02, .09, D), skirting, -W / 2 + .01, .045, BACK + D / 2, false);
  const doorSkirting = [[BACK, doorZ - doorOuterWidth / 2], [doorZ + doorOuterWidth / 2, FRONT]].map(([from, to]) =>
    add(new THREE.BoxGeometry(.02, .09, to - from), skirting, W / 2 - .01, .045, (from + to) / 2, false));

  // A closed, non-interactive interior door. Keep the wall behind it to prevent light leaks.
  // Local +z faces into the room; the 2 cm leaf sits just in front of the right wall.
  const roomDoor = new THREE.Group(); roomDoor.name = "room-door";
  roomDoor.position.set(W / 2, 0, doorZ); roomDoor.rotation.y = -Math.PI / 2; scene.add(roomDoor);
  const doorEdgeMat = new THREE.MeshStandardMaterial({ color: "#c5a476", roughness: .9 });
  const doorFaceMat = new THREE.MeshStandardMaterial({ color: "#d7bd91", roughness: .92 });
  const doorPiece = (geo, mat, x, y, z, name) => {
    const mesh = new THREE.Mesh(geo, mat); mesh.position.set(x, y, z); mesh.name = name;
    mesh.castShadow = true; mesh.receiveShadow = true; roomDoor.add(mesh); return mesh;
  };
  doorPiece(new THREE.PlaneGeometry(.9, 2.05), new THREE.MeshStandardMaterial({ color: "#594a36", roughness: 1 }), 0, 1.025, .003, "door-reveal");
  const doorLeaf = doorPiece(new THREE.BoxGeometry(.886, 2.038, .02),
    [doorEdgeMat, doorEdgeMat, doorEdgeMat, doorEdgeMat, doorFaceMat, doorEdgeMat], 0, 1.027, .01, "door-leaf");
  [-1, 1].forEach((s) => doorPiece(new THREE.BoxGeometry(.075, 2.1, .045), skirting, s * .4875, 1.05, .0225, "door-jamb"));
  doorPiece(new THREE.BoxGeometry(.9, .05, .045), skirting, 0, 2.075, .0225, "door-lintel");
  const doorBrass = new THREE.MeshStandardMaterial({ color: "#b69a64", metalness: .6, roughness: .38 });
  doorPiece(new THREE.BoxGeometry(.036, .14, .009), doorBrass, .34, 1.0, .027, "door-handle-plate");
  doorPiece(new THREE.CylinderGeometry(.009, .009, .035, 10), doorBrass, .34, 1.0, .048, "door-handle-stem").rotation.x = Math.PI / 2;
  doorPiece(new THREE.CylinderGeometry(.009, .009, .125, 12), doorBrass, .287, 1.0, .065, "door-handle").rotation.z = Math.PI / 2;
  [.35, 1.7].forEach((y) => doorPiece(new THREE.CylinderGeometry(.008, .008, .065, 8), doorBrass, -.448, y, .025, "door-hinge"));
  let doorTexturePromise = null, doorTextureLoaded = false;
  function loadDoorTexture() {
    if (doorTexturePromise) return doorTexturePromise;
    doorTexturePromise = new Promise((resolve) => {
      image("door-oak-v1", false, (texture) => {
        doorFaceMat.map = texture; doorFaceMat.color.set("#ffffff"); doorFaceMat.needsUpdate = true;
        doorTextureLoaded = true; resolve(true);
      }, () => { console.warn("ROOMVERSE door texture unavailable; using the plain wood door"); resolve(false); })();
    });
    return doorTexturePromise;
  }

  // Central air, rather than a wall cassette: one recessed linear slot on the ceiling
  // above the window. The control plate sits on the latch side of the entry door,
  // about 12 cm clear of the frame, with a slim switch plate beside it. The plate
  // follows the pale housing, dark 23° screen and snowflake of the gallery room
  // picture. Emissive only; no new light.
  const climateSlot = new THREE.Group();
  climateSlot.name = "ceiling-slot-diffuser";
  climateSlot.position.set((win.x0 + win.x1) / 2, H, BACK + 0.18);
  scene.add(climateSlot);
  const ventFlange = new THREE.MeshStandardMaterial({ color: "#e4e0d8", roughness: .96, metalness: 0 });
  const ventChannel = new THREE.MeshStandardMaterial({ color: "#6a6762", roughness: 1, metalness: 0 });
  const ventThroat = new THREE.MeshStandardMaterial({ color: "#3c3a37", roughness: 1, metalness: 0 });
  const ventPiece = (geo, mat, x, y, z, name) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = name; mesh.position.set(x, y, z);
    mesh.castShadow = false; mesh.receiveShadow = true;
    climateSlot.add(mesh); return mesh;
  };
  const slotLength = 1.9, flangeW = .028, slotW = .02;
  ventPiece(new THREE.BoxGeometry(slotLength - .028, .011, flangeW), ventFlange, 0, -.0055, -(slotW / 2 + flangeW / 2), "ceiling-slot-flange");
  ventPiece(new THREE.BoxGeometry(slotLength - .028, .011, flangeW), ventFlange, 0, -.0055, slotW / 2 + flangeW / 2, "ceiling-slot-flange");
  ventPiece(new THREE.BoxGeometry(.014, .011, flangeW * 2 + slotW), ventFlange, slotLength / 2 - .007, -.0055, 0, "ceiling-slot-end");
  ventPiece(new THREE.BoxGeometry(.014, .011, flangeW * 2 + slotW), ventFlange, -slotLength / 2 + .007, -.0055, 0, "ceiling-slot-end");
  ventPiece(new THREE.BoxGeometry(slotLength - .05, .004, slotW), ventChannel, 0, -.002, 0, "ceiling-slot-channel");
  ventPiece(new THREE.BoxGeometry(slotLength - .08, .002, .008), ventThroat, 0, -.0052, 0, "ceiling-slot-throat");

  const panelW = .104, panelH = .130, panelD = .009;
  // Latch jamb is the +local-x stile (same side as the handle). Its outer edge is half the
  // 7.5 cm jamb past the stile centre. The plate's near edge is 12 cm beyond that.
  const latchOuterZ = doorZ + .525;
  const panelCenterZ = latchOuterZ + .12 + panelW / 2;
  const smartPanel = new THREE.Group();
  smartPanel.name = "smart-home-panel";
  smartPanel.position.set(W / 2 - .001, 1.30, panelCenterZ);
  smartPanel.rotation.y = -Math.PI / 2; // local +z faces into the room, same as the door
  scene.add(smartPanel);
  const roundRect = (ctx, x, y, rw, rh, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + rw, y, x + rw, y + rh, radius);
    ctx.arcTo(x + rw, y + rh, x, y + rh, radius);
    ctx.arcTo(x, y + rh, x, y, radius);
    ctx.arcTo(x, y, x + rw, y, radius);
    ctx.closePath();
  };
  const snowflake = (ctx, x, y, r, color) => {
    ctx.save(); ctx.translate(x, y); ctx.strokeStyle = color; ctx.lineWidth = 7; ctx.lineCap = "round";
    for (let i = 0; i < 6; i++) {
      ctx.save(); ctx.rotate(Math.PI / 3 * i);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r);
      ctx.moveTo(0, -r * .55); ctx.lineTo(r * .22, -r * .78);
      ctx.moveTo(0, -r * .55); ctx.lineTo(-r * .22, -r * .78);
      ctx.stroke(); ctx.restore();
    }
    ctx.restore();
  };
  const lampMark = (ctx, x, y, color) => {
    ctx.save(); ctx.translate(x, y); ctx.strokeStyle = color; ctx.lineWidth = 7; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(0, -2, 16, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-14, 12); ctx.lineTo(14, 12); ctx.moveTo(-9, 20); ctx.lineTo(9, 20); ctx.stroke();
    ctx.restore();
  };
  const paintPanel = (glow) => {
    const w = 512, h = 640, c = document.createElement("canvas"); c.width = w; c.height = h;
    const ctx = c.getContext("2d");
    ctx.fillStyle = glow ? "#000000" : "#f3f0e8"; ctx.fillRect(0, 0, w, h);
    if (!glow) { ctx.strokeStyle = "#e4ddd0"; ctx.lineWidth = 12; ctx.strokeRect(8, 8, w - 16, h - 16); }
    const sx = 46, sy = 46, sw = w - 92, sh = 392;
    roundRect(ctx, sx, sy, sw, sh, 28);
    ctx.fillStyle = glow ? "#0e3038" : "#172226"; ctx.fill();
    if (!glow) {
      ctx.save(); roundRect(ctx, sx, sy, sw, sh, 28); ctx.clip();
      const g = ctx.createLinearGradient(0, sy, 0, sy + sh * .45);
      g.addColorStop(0, "rgba(255,255,255,.18)"); g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g; ctx.fillRect(sx, sy, sw, sh * .45); ctx.restore();
    }
    ctx.fillStyle = glow ? "#e7fbff" : "#f4fbfb";
    ctx.font = "600 128px system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("23°", w / 2, sy + 148);
    snowflake(ctx, w / 2 - 86, sy + 300, 30, glow ? "#c6eef4" : "#d5f0f3");
    lampMark(ctx, w / 2 + 86, sy + 292, glow ? "#f6e2b4" : "#f0ddb0");
    if (!glow) {
      ctx.beginPath(); ctx.arc(w / 2, 552, 40, 0, Math.PI * 2); ctx.fillStyle = "#f7f4ee"; ctx.fill();
      ctx.lineWidth = 6; ctx.strokeStyle = "#d0c6b6"; ctx.stroke();
      ctx.beginPath(); ctx.arc(w / 2, 552, 8, 0, Math.PI * 2); ctx.fillStyle = "#9eb8b4"; ctx.fill();
    }
    const texture = new THREE.CanvasTexture(c);
    texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8;
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  };
  const panelAlbedo = paintPanel(false), panelGlow = paintPanel(true);
  const panelBody = new THREE.MeshStandardMaterial({ color: "#f3f0e8", roughness: .78, metalness: 0 });
  const panelReveal = new THREE.MeshStandardMaterial({ color: "#c9c2b4", roughness: .9, metalness: 0 });
  const panelFaceMat = new THREE.MeshStandardMaterial({
    map: panelAlbedo, emissive: "#b7e0e6", emissiveMap: panelGlow, emissiveIntensity: .62, roughness: .4, metalness: .02,
  });
  const panelPiece = (geo, mat, x, y, z, name) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = name; mesh.position.set(x, y, z);
    mesh.castShadow = false; mesh.receiveShadow = true;
    smartPanel.add(mesh); return mesh;
  };
  panelPiece(new THREE.BoxGeometry(panelW + .008, panelH + .008, .003), panelReveal, 0, 0, .0015, "smart-home-panel-reveal");
  panelPiece(new THREE.BoxGeometry(panelW, panelH, panelD), panelBody, 0, 0, .003 + panelD / 2, "smart-home-panel-body");
  const panelFace = panelPiece(new THREE.PlaneGeometry(panelW, panelH), panelFaceMat, 0, 0, .003 + panelD + .0008, "smart-home-panel-face");
  panelFace.castShadow = false;
  // A matching two-rocker plate on the far side of the panel, still clear of the front corner.
  const switchW = .086, switchH = .120;
  const entrySwitch = new THREE.Group();
  entrySwitch.name = "entry-switch-plate";
  entrySwitch.position.set(W / 2 - .001, 1.30, panelCenterZ + panelW / 2 + .012 + switchW / 2);
  entrySwitch.rotation.y = -Math.PI / 2;
  scene.add(entrySwitch);
  const paintSwitch = () => {
    const w = 256, h = 360, c = document.createElement("canvas"); c.width = w; c.height = h;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#f3f0e8"; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#e4ddd0"; ctx.lineWidth = 10; ctx.strokeRect(8, 8, w - 16, h - 16);
    [108, 252].forEach((y) => {
      roundRect(ctx, 48, y - 52, 160, 104, 16);
      ctx.fillStyle = "#ddd2c2"; ctx.fill();
      ctx.strokeStyle = "#c9beae"; ctx.lineWidth = 5; ctx.stroke();
      ctx.fillStyle = "#b7ad9e"; ctx.fillRect(68, y - 3, 120, 6);
    });
    const texture = new THREE.CanvasTexture(c);
    texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8;
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  };
  const switchFaceMat = new THREE.MeshStandardMaterial({ map: paintSwitch(), color: "#ffffff", roughness: .8, metalness: 0 });
  const switchPiece = (geo, mat, x, y, z, name) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = name; mesh.position.set(x, y, z);
    mesh.castShadow = false; mesh.receiveShadow = true;
    entrySwitch.add(mesh); return mesh;
  };
  switchPiece(new THREE.BoxGeometry(switchW + .006, switchH + .006, .003), panelReveal, 0, 0, .0015, "entry-switch-reveal");
  switchPiece(new THREE.BoxGeometry(switchW, switchH, panelD), panelBody, 0, 0, .003 + panelD / 2, "entry-switch-body");
  switchPiece(new THREE.PlaneGeometry(switchW, switchH), switchFaceMat, 0, 0, .003 + panelD + .0008, "entry-switch-face");

  // The TV wall is simple code-built furniture: one calm backing, recessed open shelves,
  // a closed dark screen, and soft warm strips. No additional real-time lights are added.
  const tvWall = new THREE.Group(); tvWall.name = "tv-wall"; scene.add(tvWall);
  const tvSurfaceSpecs = new Map();
  const tvWallPiece = (geo, mat, x, y, z, name, cast = true) => {
    const surface = tvSurfaceSpecs.get(mat);
    let textureFaces;
    if (surface) {
      const { width, height, depth } = geo.parameters;
      mat = mat.clone(); // each board gets an independent map later; repeat belongs to this size
      const repeat = surface.panel ? [1, 1] : [width / surface.tile, height / surface.tile];
      const faces = [[depth, height], [depth, height], [width, depth], [width, depth], [width, height], [width, height]];
      textureFaces = faces.map(([u, v], face) => ({ face, repeat: surface.panel ? [u / width, v / height] : [u / surface.tile, v / surface.tile] }));
      // BoxGeometry starts with 0..1 UVs on every face. Scale the side/top UVs too,
      // so a thin shelf edge does not stretch the same grain across a fraction of the area.
      const uv = geo.attributes.uv;
      for (let face = 0; face < faces.length; face++) for (let corner = 0; corner < 4; corner++) {
        const i = face * 4 + corner;
        uv.setXY(i, uv.getX(i) * faces[face][0] / width, uv.getY(i) * faces[face][1] / height);
      }
      uv.needsUpdate = true;
      meshSurfaceRepeat.set(mat, { ...surface, repeat });
    }
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z); mesh.castShadow = cast; mesh.receiveShadow = true; mesh.name = name;
    if (textureFaces) mesh.userData.textureFaces = textureFaces;
    if (surface) mesh.userData.tvTexture = surface.name;
    tvWall.add(mesh); return mesh;
  };
  const meshSurfaceRepeat = new WeakMap();
  // Keep the original hand-tuned block materials for the first interactive frame.
  const tvPanelMat = new THREE.MeshStandardMaterial({ color: "#e8ddca", roughness: .9 });
  const tvOakMat = new THREE.MeshStandardMaterial({ color: "#d4b58a", roughness: .82 });
  const tvCabinetMat = new THREE.MeshStandardMaterial({ color: "#c7a578", roughness: .8 });
  const tvDoorMat = tvCabinetMat.clone();
  const tvFrameMat = tvCabinetMat.clone();
  tvSurfaceSpecs.set(tvPanelMat, { name: "tv-backing-v1", tile: 1.2 });
  tvSurfaceSpecs.set(tvOakMat, { name: "tv-oak-v1", tile: .8 }); tvSurfaceSpecs.set(tvCabinetMat, { name: "tv-oak-v1", tile: .8 });
  tvSurfaceSpecs.set(tvDoorMat, { name: "tv-door-v1", panel: true }); // one illustrated door face, including its quiet rounded edge line
  tvSurfaceSpecs.set(tvFrameMat, { name: "tv-frame-v1", tile: .5 });
  const tvTrimMat = new THREE.MeshStandardMaterial({ color: "#d7bd91", roughness: .55, metalness: .2 });
  const tvScreenMat = new THREE.MeshBasicMaterial({ color: "#141b1e" }); // quiet powered-off face; no point-light specular hotspot
  let tvScreenArtLoaded = false;
  const tvStripMat = new THREE.MeshStandardMaterial({ color: "#ffe1a4", emissive: "#ffc477", emissiveIntensity: .18, roughness: .9 });
  const tvWashMap = canvasTex(64, 64, (ctx, w, h) => {
    const glow = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    glow.addColorStop(0, "rgba(255,255,255,.65)"); glow.addColorStop(.5, "rgba(255,255,255,.3)"); glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
  });
  const tvWashMat = new THREE.MeshBasicMaterial({ color: "#ffd098", map: tvWashMap, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const tvWallWashMap = canvasTex(128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * .78);
    g.addColorStop(0, "rgba(255,255,255,.75)"); g.addColorStop(.55, "rgba(255,255,255,.4)"); g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
  const tvWallWashMat = new THREE.MeshBasicMaterial({ color: "#e2a15d", map: tvWallWashMap, transparent: true, opacity: 0, depthWrite: false, blending: THREE.NormalBlending });
  const TV_STRIP_GLOW = { rain: .28, family: .18, tech: .08, chic: .2, slow: .13, tv: .82 };
  // A restrained wall-local wash warms the same wall surface without adding another light.
  const TV_WALL_WASH = { rain: .34, family: 0, tech: .35, chic: 0, slow: 0, tv: .4 };
  // Preserve the hue of saturated dark paints; the existing strip and room lights still apply.
  const WALLS_WITHOUT_WARM_WASH = new Set(["wine", "dusk", "pine"]);
  tvWallPiece(new THREE.BoxGeometry(2.95, 2.35, .08), tvPanelMat, 0, 1.36, FRONT - .125, "tv-wall-backing");
  // narrow trim makes the panel read as built-in millwork, not a freestanding equipment display
  for (const x of [-1.49, 1.49]) tvWallPiece(new THREE.BoxGeometry(.035, 2.36, .045), tvTrimMat, x, 1.36, FRONT - .17, "tv-wall-trim", false);
  // A continuous wall face with actual niche openings: the backs and returns sit behind
  // this plane, so the shelves remain recessed when seen from the side.
  const builtInFace = new THREE.Shape([
    new THREE.Vector2(-W / 2, 0), new THREE.Vector2(W / 2, 0),
    new THREE.Vector2(W / 2, H), new THREE.Vector2(-W / 2, H),
  ]);
  for (const side of [-1, 1]) {
    const x = side * 1.82;
    builtInFace.holes.push(new THREE.Path([
      new THREE.Vector2(x - .31, .55), new THREE.Vector2(x - .31, 2.17),
      new THREE.Vector2(x + .31, 2.17), new THREE.Vector2(x + .31, .55),
    ]));
  }
  tvWallPiece(new THREE.ShapeGeometry(builtInFace), wallMat, 0, 0, FRONT - .16, "tv-built-in-surround").rotation.y = Math.PI;
  // A broad radial wash follows the inset wall, with the shelf openings kept clear; the TV and console sit in front of it.
  const tvWallWashGeometry = new THREE.ShapeGeometry(builtInFace);
  const tvWallWashUv = tvWallWashGeometry.attributes.uv, tvWallWashPositions = tvWallWashGeometry.attributes.position;
  for (let i = 0; i < tvWallWashUv.count; i++) tvWallWashUv.setXY(i, tvWallWashPositions.getX(i) / W + .5, tvWallWashPositions.getY(i) / H);
  tvWallWashUv.needsUpdate = true;
  tvWallPiece(tvWallWashGeometry, tvWallWashMat, 0, 0, FRONT - .175, "tv-wall-warm-wash", false).rotation.y = Math.PI;
  for (const side of [-1, 1]) {
    const x = side * 1.82;
    tvWallPiece(new THREE.BoxGeometry(.62, 1.62, .025), tvOakMat, x, 1.36, FRONT - .025, "tv-shelf-back");
    for (const sx of [-1, 1]) {
      tvWallPiece(new THREE.BoxGeometry(.025, 1.62, .135), tvOakMat, x + sx * .3, 1.36, FRONT - .09, "tv-shelf-return");
      tvWallPiece(new THREE.BoxGeometry(.012, 1.48, .008), tvStripMat, x + sx * .272, 1.36, FRONT - .05, "tv-shelf-light", false);
    }
    for (const y of [.55, 1.09, 1.63, 2.17]) {
      tvWallPiece(new THREE.BoxGeometry(.62, .035, .135), tvOakMat, x, y, FRONT - .09, "tv-shelf-board");
    }
    tvWallPiece(new THREE.PlaneGeometry(.57, 1.54), tvWashMat, x, 1.36, FRONT - .041, "tv-shelf-wash", false).rotation.y = Math.PI;
  }
  // A slim, blank television on the central panel; its glass stays dark in every mood.
  tvWallPiece(new THREE.BoxGeometry(1.58, .94, .075), tvFrameMat, 0, 1.76, FRONT - .24, "tv-frame");
  const tvScreen = tvWallPiece(new THREE.PlaneGeometry(1.48, .84), tvScreenMat, 0, 1.76, FRONT - .282, "tv-screen", false);
  tvScreen.rotation.y = Math.PI;
  tvWallPiece(new THREE.BoxGeometry(1.5, .014, .012), tvStripMat, 0, 1.285, FRONT - .282, "tv-screen-lower-light", false);
  tvWallPiece(new THREE.PlaneGeometry(1.85, .28), tvWashMat, 0, 1.19, FRONT - .165, "tv-screen-wall-wash", false).rotation.y = Math.PI;
  // Grounded low cabinet with two quiet door faces and small brass pulls; no exposed wires.
  tvWallPiece(new THREE.BoxGeometry(2.05, .5, .4), tvCabinetMat, 0, .34, FRONT - .32, "tv-console");
  tvWallPiece(new THREE.BoxGeometry(1.74, .075, .36), tvOakMat, 0, .04, FRONT - .32, "tv-console-plinth");
  for (const side of [-1, 1]) {
    tvWallPiece(new THREE.BoxGeometry(.94, .42, .025), tvDoorMat, side * .49, .35, FRONT - .527, "tv-console-door", false);
    tvWallPiece(new THREE.BoxGeometry(.09, .018, .018), tvTrimMat, side * .49, .36, FRONT - .546, "tv-console-pull", false);
  }
  // A faceted bud vase and one book leave space for the reused laptop below.
  tvWallPiece(new THREE.CylinderGeometry(.055, .105, .22, 7), tvTrimMat, -.74, .71, FRONT - .39, "tv-vase-body");
  tvWallPiece(new THREE.CylinderGeometry(.045, .055, .075, 7), tvTrimMat, -.74, .855, FRONT - .39, "tv-vase-neck");
  tvWallPiece(new THREE.BoxGeometry(.28, .035, .2), new THREE.MeshStandardMaterial({ color: "#d4c6b1", roughness: .92 }), .72, .62, FRONT - .39, "tv-book-one");
  // Concealed strip beneath the panel; emissive material only, so the room keeps its existing light count.
  tvWallPiece(new THREE.BoxGeometry(2.4, .018, .018), tvStripMat, 0, .18, FRONT - .17, "tv-wall-lower-light", false);
  let tvWallTexturesPromise = null;
  let tvWallTexturesLoaded = false;
  async function loadTvWallTextures() {
    if (tvWallTexturesLoaded) return true;
    if (tvWallTexturesPromise) return tvWallTexturesPromise;
    tvWallTexturesPromise = (async () => {
      const specs = [
        ["tv-oak-v1", true], ["tv-door-v1", false], ["tv-frame-v1", true], ["tv-backing-v1", true],
      ];
      const [entries, screenArt] = await Promise.all([Promise.all(specs.map(([name, repeat]) => new Promise((resolve, reject) => {
        image(name, repeat, (texture) => resolve([name, texture]), reject)();
      }))), new Promise((resolve) => {
        // Optional artwork fails independently, leaving the original dark screen usable.
        image("tv-screen-night-v1", false, resolve, () => resolve(null))();
      })]);
      const sources = new Map(entries);
      if (screenArt) {
        tvScreenMat.map = screenArt;
        tvScreenArtLoaded = true;
        tvScreenMat.color.setScalar((shown ?? lights()).screenLevel);
        tvScreenMat.needsUpdate = true;
      }
      tvWall.traverse((obj) => {
        const spec = obj.userData.tvTexture && tvSurfaceSpecsByName.get(obj.userData.tvTexture);
        const repeat = meshSurfaceRepeat.get(obj.material);
        if (!spec || !repeat) return;
        const map = sources.get(spec.name).clone();
        map.repeat.set(repeat.repeat[0], repeat.repeat[1]);
        obj.material.map = map;
        obj.material.color.set("#ffffff");
        obj.material.needsUpdate = true;
      });
      // Compile while idle so opening the TV view does not pay the shader setup cost.
      if (renderer.compileAsync) { try { await renderer.compileAsync(scene, camera); } catch { /* visible render below remains the fallback */ } }
      await new Promise((resolve) => requestAnimationFrame(resolve));
      tvWallTexturesLoaded = true;
      render();
      return true;
    })().catch((error) => { console.warn("ROOMVERSE TV wall textures could not load", error); tvWallTexturesPromise = null; return false; });
    return tvWallTexturesPromise;
  }
  const tvSurfaceSpecsByName = new Map([...tvSurfaceSpecs.values()].map((spec) => [spec.name, spec]));

  // Optional lived-in console and shelf details: build only after entry/idle or an explicit TV-view click.
  // Oak and plaster reuse the TV wall images. The console and the shelf each have their own small print.
  const consoleDecor = new THREE.Group(); consoleDecor.name = "tv-console-decor"; scene.add(consoleDecor);
  const shelfDecor = new THREE.Group(); shelfDecor.name = "tv-inset-shelf-decor"; scene.add(shelfDecor);
  let shelfDecorReady = false, shelfArtFile = null, consoleArtTexture = null;
  const pictureFile = (texture) => texture?.image?.src?.split("?")[0].split("/").pop() ?? null;
  function buildShelfDecor(art, surface) {
    if (shelfDecorReady) return;
    shelfArtFile = pictureFile(art);
    const oak = surface("tv-console", "#ffffff", [.15 / .8, .10 / .8]);
    if (!oak.map) oak.color.set("#d4b58a");
    const paper = surface("tv-wall-backing", "#e6dfcf", [.2, .2]);
    const blue = surface("tv-wall-backing", "#70888a", [.2, .3]);
    const moss = surface("tv-wall-backing", "#8a9475", [.2, .3]);
    const clay = surface("tv-wall-backing", "#b4917a", [.2, .3]);
    const ceramic = surface("tv-wall-backing", "#d4c6ad", [.25, .2]);
    const dark = new THREE.MeshStandardMaterial({ color: "#565448", roughness: 1 });
    const leafMat = new THREE.MeshStandardMaterial({ color: "#718469", roughness: 1 });
    const contact = new THREE.MeshBasicMaterial({ color: "#473d2c", transparent: true, opacity: .13, depthWrite: false });
    const mesh = (group, geo, mat, x, y, z) => {
      const obj = new THREE.Mesh(geo, mat); obj.position.set(x, y, z);
      obj.castShadow = false; obj.receiveShadow = true; group.add(obj); return obj;
    };
    // TV view faces +z, so the viewer's left shelf is at +x. All dimensions are metres.
    const place = (group, bay, dx, width, depth) => {
      const [side, row] = bay.split("-");
      const board = { lower: .55, middle: 1.09, upper: 1.63 }[row];
      const x = side === "left" ? 1.82 : -1.82;
      const item = new THREE.Group(); item.name = group.name;
      item.userData.bay = bay; item.userData.supportY = board + .0175;
      item.add(group); group.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(group), center = box.getCenter(new THREE.Vector3());
      group.position.y -= box.min.y;
      // Keep the contact patch horizontal even when the object above it is tilted or laid flat.
      const shadow = mesh(item, new THREE.PlaneGeometry(width, depth), contact, center.x, .0002, center.z);
      shadow.rotation.x = -Math.PI / 2; shadow.receiveShadow = false;
      item.position.set(x + dx, board + .0175, FRONT - .101);
      shelfDecor.add(item); item.updateMatrixWorld(true);
    };
    const book = (name, width, height, depth, cover) => {
      const group = new THREE.Group(); group.name = name;
      mesh(group, new THREE.BoxGeometry(width - .004, height - .009, depth - .005), paper, 0, height / 2, 0);
      for (const x of [-width / 2 + .001, width / 2 - .001]) mesh(group, new THREE.BoxGeometry(.002, height, depth), cover, x, height / 2, 0);
      mesh(group, new THREE.BoxGeometry(width, height, .003), cover, 0, height / 2, -depth / 2 + .0015);
      return group;
    };
    // A fuller but still low row uses most of the opening height; varied spines keep it lived-in.
    [["blue", .040, .315, blue, -.150], ["moss", .035, .285, moss, -.090], ["clay", .043, .355, clay, -.030], ["paper", .038, .300, paper, .040], ["blue-short", .036, .270, blue, .110]].forEach(([name, w, h, mat, x]) => {
      const volume = book(`shelf-book-${name}`, w, h, .086, mat);
      volume.rotation.z = name === "clay" ? -.025 : name === "paper" ? .018 : 0;
      place(volume, "left-upper", x, w + .009, .091);
    });
    const frame = new THREE.Group(); frame.name = "shelf-small-frame";
    mesh(frame, new THREE.BoxGeometry(.205, .252, .014), oak, 0, .126, 0);
    mesh(frame, new THREE.PlaneGeometry(.176, .221), new THREE.MeshStandardMaterial({ map: art, color: art ? "#ffffff" : "#ddd2b8", roughness: 1 }), 0, .126, .0075);
    mesh(frame, new THREE.BoxGeometry(.016, .145, .036), oak, 0, .0725, -.023);
    frame.rotation.set(-.045, Math.PI - .04, 0);
    place(frame, "left-middle", .075, .215, .069);
    // Low, elongated ceramic dish: a deliberate shallow silhouette, not a round urn.
    const dish = new THREE.Group(); dish.name = "shelf-ceramic-dish";
    const profile = [[0, .003], [.033, .003], [.055, .012], [.066, .026], [.061, .03], [.051, .018], [.03, .009], [0, .009]].map(([x, y]) => new THREE.Vector2(x, y));
    mesh(dish, new THREE.LatheGeometry(profile, 18), ceramic, 0, 0, 0).scale.set(1.55, 1, .53);
    place(dish, "left-lower", -.09, .205, .077);
    const plant = new THREE.Group(); plant.name = "shelf-mini-plant";
    mesh(plant, new THREE.CylinderGeometry(.034, .029, .060, 7), ceramic, 0, .030, 0);
    mesh(plant, new THREE.CylinderGeometry(.0295, .0295, .002, 12), dark, 0, .060, 0);
    mesh(plant, new THREE.CylinderGeometry(.0015, .002, .190, 5), leafMat, 0, .145, 0);
    const leafGeo = new THREE.SphereGeometry(1, 7, 5);
    for (let i = 0; i < 9; i++) {
      const side = i % 2 ? -1 : 1;
      const leaf = mesh(plant, leafGeo, leafMat, side * (.016 + i * .001), .105 + i * .016, (i % 3 - 1) * .012);
      leaf.scale.set(.015, .031, .007); leaf.rotation.z = side * -.64;
    }
    place(plant, "right-upper", .085, .105, .091);
    // A tapered, faceted vessel reads as a hand-shaped ceramic form rather than a round urn.
    const vessel = new THREE.Group(); vessel.name = "shelf-medium-ceramic-vessel";
    const vesselProfile = [[0,.004],[.030,.004],[.046,.020],[.054,.075],[.050,.150],[.038,.202],[.024,.222],[.022,.285],[.029,.300],[.029,.312],[.018,.312],[.018,.292],[.013,.245],[0,.238]].map(([x,y]) => new THREE.Vector2(x,y));
    mesh(vessel, new THREE.LatheGeometry(vesselProfile, 8), ceramic, 0, 0, 0);
    place(vessel, "right-middle", -.075, .13, .094);
    const stack = new THREE.Group(); stack.name = "shelf-horizontal-book-stack";
    [[.274,.050,.091,blue,.018],[.252,.052,.088,clay,.077],[.263,.048,.090,moss,.136]].forEach(([w,h,d,mat,y]) => {
      mesh(stack, new THREE.BoxGeometry(w-.006,h-.005,d-.004), paper, 0, y+h/2, 0);
      mesh(stack, new THREE.BoxGeometry(w,h,d), mat, 0, y+h/2, 0);
    });
    const accent = new THREE.Group(); accent.name = "shelf-small-wood-sculpture";
    mesh(accent, new THREE.BoxGeometry(.094,.022,.068), oak, 0, .011, 0);
    mesh(accent, new THREE.BoxGeometry(.062,.072,.048), oak, 0, .058, 0);
    mesh(accent, new THREE.BoxGeometry(.043,.073,.039), clay, .009, .1305, .002);
    place(stack, "right-lower", -.035, .286, .096);
    place(accent, "right-lower", .17, .104, .078);
    shelfDecorReady = true;
  }
  let consoleDecorPromise = null, consoleDecorLoaded = false, consoleArtLoaded = false;
  function loadConsoleDecor() {
    if (consoleDecorPromise) return consoleDecorPromise;
    consoleDecorPromise = (async () => {
      const loadPicture = (name) => new Promise((resolve) => { image(name, false, resolve, () => resolve(null))(); });
      const [, art, shelfArt] = await Promise.all([
        loadTvWallTextures(),
        loadPicture("console-art-river-v1"),
        loadPicture("shelf-art-still-v1"),
      ]);
      consoleArtTexture = art;
      consoleArtLoaded = !!art;
      const surface = (name, color, repeat) => {
        const mat = new THREE.MeshStandardMaterial({ color, roughness: .9 });
        const source = tvWall.getObjectByName(name)?.material.map;
        if (source) { mat.map = source.clone(); mat.map.repeat.set(...repeat); mat.map.needsUpdate = true; }
        return mat;
      };
      const oak = surface("tv-console", "#ffffff", [.24 / .8, .23 / .8]);
      const linenBlue = surface("tv-wall-backing", "#8a9fa2", [1, 1]);
      const linenClay = surface("tv-wall-backing", "#bd9478", [1, 1]);
      const paper = surface("tv-wall-backing", "#eee9da", [1, 1]);
      const ceramic = surface("tv-wall-backing", "#e6e1d3", [1, 1]);
      const piece = (group, geo, mat, x, y, z) => {
        const mesh = new THREE.Mesh(geo, mat); mesh.position.set(x, y, z);
        mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); return mesh;
      };
      const onConsole = (group, x, z) => {
        consoleDecor.add(group); group.position.set(x, 0, z); group.updateMatrixWorld(true);
        group.position.y += .59 - new THREE.Box3().setFromObject(group).min.y;
        group.updateMatrixWorld(true);
      };
      // A real backed tabletop frame, leaning on a small stand rather than a floating decal.
      const frame = new THREE.Group(); frame.name = "console-decor-frame";
      piece(frame, new THREE.BoxGeometry(.188, .226, .014), oak, 0, .113, 0);
      piece(frame, new THREE.PlaneGeometry(.156, .194), new THREE.MeshStandardMaterial({ map: art, color: art ? "#ffffff" : "#d6c9ad", roughness: .96 }), 0, .113, .0078);
      piece(frame, new THREE.BoxGeometry(.012, .15, .05), oak, 0, .075, -.032);
      frame.rotation.set(-.10, Math.PI - .06, 0); onConsole(frame, -.38, FRONT - .21);
      // Two cloth-bound, blank-spined books, slightly offset rather than evenly lined up.
      const books = new THREE.Group(); books.name = "console-decor-books";
      const book = (width, depth, cover, x, y, z, angle) => {
        const group = new THREE.Group(); group.position.set(x, y, z); group.rotation.y = angle; books.add(group);
        piece(group, new THREE.BoxGeometry(width, .003, depth), cover, 0, .0015, 0);
        piece(group, new THREE.BoxGeometry(width - .008, .017, depth - .009), paper, 0, .0115, 0);
        piece(group, new THREE.BoxGeometry(width, .003, depth), cover, 0, .0215, 0);
        piece(group, new THREE.BoxGeometry(width, .023, .003), cover, 0, .0115, -depth / 2 + .0015);
      };
      book(.25, .16, linenBlue, 0, 0, 0, -.06);
      book(.21, .15, linenClay, -.01, .023, .006, .10);
      onConsole(books, .42, FRONT - .35);
      // A shallow ceramic tray and an unbranded remote: genuine depth from every orbit angle.
      const tray = new THREE.Group(); tray.name = "console-decor-tray";
      piece(tray, new THREE.CylinderGeometry(.08, .078, .008, 28), ceramic, 0, .004, 0).scale.set(1.55, 1, .8);
      const rim = piece(tray, new THREE.TorusGeometry(.075, .0055, 8, 32), ceramic, 0, .008, 0);
      rim.rotation.x = Math.PI / 2; rim.scale.set(1.55, .8, 1);
      const remoteMat = new THREE.MeshStandardMaterial({ color: "#424a49", roughness: .85 });
      const remote = piece(tray, new THREE.CapsuleGeometry(.018, .08, 4, 8), remoteMat, 0, .0143, -.003);
      remote.rotation.x = Math.PI / 2; remote.scale.set(1, 1, .35);
      const buttons = new THREE.InstancedMesh(new THREE.BoxGeometry(.009, .002, .008), new THREE.MeshStandardMaterial({ color: "#b7b8ae", roughness: 1 }), 3);
      const buttonMatrix = new THREE.Matrix4();
      [-.025, 0, .025].forEach((z, i) => buttons.setMatrixAt(i, buttonMatrix.makeTranslation(0, .0215, z)));
      buttons.instanceMatrix.needsUpdate = true;
      buttons.receiveShadow = true; tray.add(buttons);
      piece(tray, new THREE.CylinderGeometry(.003, .003, .002, 8), linenClay, 0, .0215, -.04);
      tray.rotation.y = .14; onConsole(tray, -.40, FRONT - .42);
      buildShelfDecor(shelfArt, surface);
      consoleDecorLoaded = true; render(); return true;
    })().catch((error) => { console.warn("ROOMVERSE console details could not load", error); consoleDecorPromise = null; return false; });
    return consoleDecorPromise;
  }
  // Optional gallery corner: create geometry and request its one responsive image only after entry.
  // The approved full 3:2 painting stays visible inside the stepped frame, including the right-hand crane.
  let rightWallArtGroup = null, rightWallArtPromise = null, rightWallArtReady = false, rightWallArtLoaded = false;
  let rightPaintingMat = null, rightArtWallWash = null, rightArtPaintWash = null, rightArtDiffuser = null;
  function updateRightArtLight(v) {
    if (!rightWallArtGroup) return;
    const level = Math.min(1, Math.max(0, v.tableHalo / .5));
    rightArtWallWash.opacity = .12 * level;
    rightArtPaintWash.opacity = .055 * level;
    rightPaintingMat.emissiveIntensity = rightWallArtLoaded ? .14 * level : 0;
    rightArtDiffuser.emissiveIntensity = .35 + level * .65;
  }
  function loadRightWallArt() {
    if (rightWallArtPromise) return rightWallArtPromise;
    rightWallArtPromise = new Promise((resolve) => {
      rightWallArtGroup = new THREE.Group(); rightWallArtGroup.name = "right-wall-gallery";
      rightWallArtGroup.position.set(W / 2 - .008, 1.5, -.65);
      rightWallArtGroup.rotation.y = -Math.PI / 2; scene.add(rightWallArtGroup);
      const piece = (geo, mat, x, y, z, name) => {
        const mesh = new THREE.Mesh(geo, mat); mesh.name = name; mesh.position.set(x, y, z);
        // These small details do not cast new shadows into the approved sofa view.
        mesh.castShadow = false; mesh.receiveShadow = false; rightWallArtGroup.add(mesh); return mesh;
      };
      const gold = new THREE.MeshStandardMaterial({ color: "#b28a48", metalness: .62, roughness: .47 });
      const goldEdge = new THREE.MeshStandardMaterial({ color: "#d8b76d", metalness: .58, roughness: .4 });
      const goldShade = new THREE.MeshStandardMaterial({ color: "#79603a", metalness: .45, roughness: .65 });
      piece(new THREE.BoxGeometry(1.318, .918, .018), goldShade, 0, 0, .015, "right-wall-frame-backing");
      // Stepped rails give a classical profile without carved textures or extra asset requests.
      [[1.34, .94, .04, .038, .034, gold], [1.29, .89, .026, .025, .061, goldShade], [1.24, .84, .018, .014, .079, goldEdge]].forEach(([w, h, t, depth, z, mat], layer) => {
        for (const side of [-1, 1]) {
          piece(new THREE.BoxGeometry(w, t, depth), mat, 0, side * (h - t) / 2, z, `right-wall-frame-${layer}-horizontal`);
          piece(new THREE.BoxGeometry(t, h - t * 2, depth), mat, side * (w - t) / 2, 0, z, `right-wall-frame-${layer}-vertical`);
        }
      });
      rightPaintingMat = new THREE.MeshStandardMaterial({ color: "#c7b896", roughness: 1, emissive: "#ffffff", emissiveIntensity: 0 });
      piece(new THREE.PlaneGeometry(1.2, .8), rightPaintingMat, 0, 0, .0745, "right-wall-painting");
      const wash = canvasTex(64, 96, (ctx, w, h) => {
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const u = x / (w - 1), v = y / (h - 1);
            const edge = Math.sin(Math.PI * u) ** 1.4;
            const down = Math.sin(Math.PI * v) ** .8 * (.85 - v * .55);
            ctx.fillStyle = `rgba(255,222,175,${edge * down})`; ctx.fillRect(x, y, 1, 1);
          }
        }
      });
      rightArtWallWash = new THREE.MeshBasicMaterial({ map: wash, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
      piece(new THREE.PlaneGeometry(1.46, 1.1), rightArtWallWash, 0, .025, .002, "right-wall-picture-wash");
      rightArtPaintWash = rightArtWallWash.clone();
      piece(new THREE.PlaneGeometry(1.2, .8), rightArtPaintWash, 0, 0, .076, "right-wall-painting-wash");
      // A real brass fixture with a downward diffuser; the wash is local decoration, not another light.
      const brass = new THREE.MeshStandardMaterial({ color: "#bc9a5d", metalness: .65, roughness: .4 });
      piece(new THREE.BoxGeometry(.085, .085, .015), brass, 0, .54, .02, "right-wall-light-mount");
      for (const x of [-.15, .15]) piece(new THREE.CylinderGeometry(.006, .006, .14, 8), brass, x, .545, .095, "right-wall-light-arm").rotation.x = Math.PI / 2;
      piece(new THREE.CylinderGeometry(.024, .024, .5, 16), brass, 0, .54, .17, "right-wall-picture-light").rotation.z = Math.PI / 2;
      rightArtDiffuser = new THREE.MeshStandardMaterial({ color: "#ffe6b9", emissive: "#ffd59a", emissiveIntensity: 0, roughness: .7 });
      piece(new THREE.PlaneGeometry(.45, .025), rightArtDiffuser, 0, .515, .17, "right-wall-light-diffuser").rotation.x = Math.PI / 2;
      updateRightArtLight(shown ?? lights());
      const name = compactRender ? "right-wall-harbor-mobile-v1" : "right-wall-harbor-v1";
      image(name, false, (texture) => {
        rightPaintingMat.map = texture; rightPaintingMat.emissiveMap = texture;
        rightPaintingMat.color.set("#ffffff"); rightPaintingMat.needsUpdate = true;
        rightWallArtLoaded = true; rightWallArtReady = true;
        updateRightArtLight(shown ?? lights()); render(); resolve(true);
      }, () => {
        rightWallArtReady = true; render(); resolve(false); // the solid canvas and frame remain usable
      })();
    });
    return rightWallArtPromise;
  }
  // Left-wall pair to the harbour on the right. Gold frame and a small gallery lamp, built in code.
  // The 16:9 canvas hangs on the open front half of the wall, clear of the floor lamp, plant, armchair and window light.
  // That stretch has no other lamp. The picture spot uses the renderer's existing physical units
  // (r160, useLegacyLights left at its default false): candela, decay 2 = 1/d². No renderer change.
  let leftWallArtGroup = null, leftWallArtPromise = null, leftWallArtReady = false, leftWallArtLoaded = false;
  let leftPaintingMat = null, leftArtWallWash = null, leftArtPaintWash = null, leftArtDiffuser = null, leftPictureSpot = null;
  const leftWallArtPlace = { x: -W / 2 + .008, y: 1.5, z: 1 }; // 8 mm off the wall at x=-2.6, same hanging line as the right wall
  // A 4 W picture LED at ~80 lm/W is 320 lm, about 100 cd in a wide flood. The room's other lamps are
  // authored at 2–5 cd, and the dusk painting is much darker than the dawn painting opposite.
  // 12.5 cd keeps 1/d². The source sits further forward so the pool covers the canvas
  // and still falls off toward the bottom, without a second fill. Series night is a little lower.
  const LEFT_ART_CANDELA = 12.5, LEFT_ART_COLOR = "#ffbe7a";
  function updateLeftArtLight(v) {
    if (!leftWallArtGroup) return;
    const level = v.hemi < .75 && v.exposure < 1 ? .86 : 1;
    leftArtWallWash.opacity = 0;
    leftArtPaintWash.opacity = 0;
    leftPaintingMat.emissiveIntensity = 0;
    leftArtDiffuser.emissiveIntensity = .9 * level;
    if (leftPictureSpot) leftPictureSpot.intensity = LEFT_ART_CANDELA * level;
  }
  function loadLeftWallArt() {
    if (leftWallArtPromise) return leftWallArtPromise;
    leftWallArtPromise = new Promise((resolve) => {
      const paintW = 1.2, paintH = .675; // 16:9
      leftWallArtGroup = new THREE.Group(); leftWallArtGroup.name = "left-wall-gallery";
      leftWallArtGroup.position.set(leftWallArtPlace.x, leftWallArtPlace.y, leftWallArtPlace.z);
      leftWallArtGroup.rotation.y = Math.PI / 2; scene.add(leftWallArtGroup);
      const piece = (geo, mat, x, y, z, name) => {
        const mesh = new THREE.Mesh(geo, mat); mesh.name = name; mesh.position.set(x, y, z);
        mesh.castShadow = false; mesh.receiveShadow = false; leftWallArtGroup.add(mesh); return mesh;
      };
      const gold = new THREE.MeshStandardMaterial({ color: "#c49a52", metalness: .78, roughness: .28 });
      const goldEdge = new THREE.MeshStandardMaterial({ color: "#e2c27a", metalness: .82, roughness: .18 });
      const goldShade = new THREE.MeshStandardMaterial({ color: "#8a6a3c", metalness: .55, roughness: .48 });
      piece(new THREE.BoxGeometry(paintW + .118, paintH + .118, .018), goldShade, 0, 0, .015, "left-wall-frame-backing");
      [[paintW + .14, paintH + .14, .04, .038, .034, gold], [paintW + .09, paintH + .09, .026, .025, .061, goldShade], [paintW + .04, paintH + .04, .018, .014, .079, goldEdge]].forEach(([w, h, t, depth, z, mat], layer) => {
        for (const side of [-1, 1]) {
          piece(new THREE.BoxGeometry(w, t, depth), mat, 0, side * (h - t) / 2, z, `left-wall-frame-${layer}-horizontal`);
          piece(new THREE.BoxGeometry(t, h - t * 2, depth), mat, side * (w - t) / 2, 0, z, `left-wall-frame-${layer}-vertical`);
        }
      });
      leftPaintingMat = new THREE.MeshStandardMaterial({ color: "#c7b896", roughness: 1, emissive: "#ffffff", emissiveIntensity: 0 });
      piece(new THREE.PlaneGeometry(paintW, paintH), leftPaintingMat, 0, 0, .0745, "left-wall-painting");
      const wash = canvasTex(64, 96, (ctx, w, h) => {
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const u = x / (w - 1), v = y / (h - 1); // v = 0 at the lamp, 1 at the bottom
            const edge = Math.sin(Math.PI * u) ** 1.35;
            const down = (1 - v) ** 1.15 * (.55 + .45 * (1 - v));
            ctx.fillStyle = `rgba(255,196,138,${edge * down})`; ctx.fillRect(x, y, 1, 1);
          }
        }
      });
      leftArtWallWash = new THREE.MeshBasicMaterial({ map: wash, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
      piece(new THREE.PlaneGeometry(1.72, 1.22), leftArtWallWash, 0, .16, .002, "left-wall-picture-wash");
      leftArtPaintWash = leftArtWallWash.clone();
      piece(new THREE.PlaneGeometry(paintW, paintH), leftArtPaintWash, 0, 0, .076, "left-wall-painting-wash");
      // A 36 cm brass gallery lamp. Bulb and beam are the same ~2900K.
      const brass = new THREE.MeshStandardMaterial({ color: "#b08a4e", metalness: .72, roughness: .36 });
      const lightY = (paintH + .14) / 2 + .055;
      const shadeW = .36;
      piece(new THREE.BoxGeometry(.06, .04, .012), brass, 0, lightY + .045, .016, "left-wall-light-mount");
      piece(new THREE.CylinderGeometry(.007, .007, .055, 8), brass, 0, lightY + .012, .045, "left-wall-light-stem");
      const shade = piece(new THREE.CylinderGeometry(.016, .02, shadeW, 18), brass, 0, lightY, .13, "left-wall-picture-light");
      shade.rotation.z = Math.PI / 2; shade.castShadow = true;
      leftWallArtGroup.getObjectByName("left-wall-light-stem").castShadow = true;
      leftWallArtGroup.getObjectByName("left-wall-light-mount").castShadow = true;
      leftArtDiffuser = new THREE.MeshStandardMaterial({ color: LEFT_ART_COLOR, emissive: LEFT_ART_COLOR, emissiveIntensity: 0, roughness: .4 });
      piece(new THREE.CylinderGeometry(.007, .007, shadeW - .05, 12), leftArtDiffuser, 0, lightY - .014, .132, "left-wall-light-bulb").rotation.z = Math.PI / 2;
      leftWallArtGroup.traverse((mesh) => {
        if (!mesh.isMesh || !mesh.name.startsWith("left-wall-frame-") || !mesh.name.endsWith("-horizontal") || mesh.position.y <= 0) return;
        mesh.castShadow = true; mesh.receiveShadow = true; // the top lip throws a short contact shadow down the canvas
      });
      leftWallArtGroup.getObjectByName("left-wall-painting").receiveShadow = true;
      // 12.5 cd, decay 2, cutoff 2.6 m. Aimed down the canvas from the lamp, wide enough to spill
      // onto the wall and soft at the edge. No second light on the paint.
      leftPictureSpot = new THREE.SpotLight(LEFT_ART_COLOR, LEFT_ART_CANDELA, 2.6, 1.0, .7, 2);
      leftPictureSpot.name = "left-wall-picture-spot";
      leftPictureSpot.castShadow = true;
      leftPictureSpot.shadow.mapSize.set(512, 512);
      leftPictureSpot.shadow.radius = 4;
      leftPictureSpot.shadow.bias = -.0004;
      leftPictureSpot.shadow.normalBias = .012;
      leftPictureSpot.shadow.camera.near = .05;
      leftPictureSpot.shadow.camera.far = 2.4;
      leftPictureSpot.position.set(0, lightY + .02, .62);
      leftPictureSpot.target.position.set(0, -.06, .074);
      leftPictureSpot.target.name = "left-wall-picture-spot-target";
      leftWallArtGroup.add(leftPictureSpot, leftPictureSpot.target);
      updateLeftArtLight(shown ?? lights());
      const name = compactRender ? "left-wall-harbor-dusk-mobile-v1" : "left-wall-harbor-dusk-v1";
      image(name, false, (texture) => {
        leftPaintingMat.map = texture; leftPaintingMat.emissiveMap = texture;
        leftPaintingMat.color.set("#ffffff"); leftPaintingMat.needsUpdate = true;
        leftWallArtLoaded = true; leftWallArtReady = true;
        updateLeftArtLight(shown ?? lights()); render(); resolve(true);
      }, () => {
        leftWallArtReady = true; render(); resolve(false); // the plain canvas and frame remain usable
      })();
    });
    return leftWallArtPromise;
  }
  controls.addEventListener("change", () => {
    const offset = camera.position.clone().sub(orbitCenter);
    if (Math.sin(Math.atan2(offset.x, offset.z)) > .45) void loadLeftWallArt(); // turning toward the left-hand wall
  });
  // the view outside changes with the feeling: Codex's paintings of the same street in rain, afternoon sun and night
  // (window/, 1024 x 1536). The window is wider than 2:3, so the picture fills the width and is cropped a little top and bottom.
  const viewLoader = new THREE.TextureLoader();
  const VIEW_FILES = { rain: "rain", family: "family", tech: "tech", chic: "chic", slow: "family", tv: "tech" }; // slow and series night reuse existing paintings; only room lighting changes
  const viewReady = {};
  const VIEWS = Object.fromEntries(Object.entries(VIEW_FILES).map(([m, f]) => [m, () => {
    let settle;
    viewReady[m] = new Promise((resolve) => { settle = resolve; });
    const t = viewLoader.load(new URL(`./window/window-${f}-v1.webp`, import.meta.url).href, () => { settle(true); render(); }, undefined, () => settle(false));
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
  const lampLight = new THREE.PointLight("#ffc27a", 3.2, 6, 2);
  lampLight.position.set(TX, .98, TZ); lampLight.castShadow = true; lampLight.shadow.mapSize.set(1024, 1024); lampLight.shadow.bias = -.002; lampLight.shadow.radius = 10;
  lampLight.shadow.camera.near = .025; lampLight.shadow.camera.far = 6; // the shade is closer than the default .5 m shadow near plane
  scene.add(lampLight);
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
  const plaque = add(new THREE.PlaneGeometry(.7, .28), new THREE.MeshStandardMaterial({ map: plaqueTex, transparent: true, alphaTest: .5, roughness: .7 }), TX, 1.5, BACK + .015, false);
  plaque.name = "house-plaque";

  // ---------- light ----------
  const hemi = new THREE.HemisphereLight("#dfe8f0", "#8a6a4f", .35); scene.add(hemi);
  const windowLight = new THREE.DirectionalLight("#cfdcea", 1.1);
  windowLight.position.set(-2.4, 2.6, -4.5); windowLight.target.position.set(.2, 0, .2);
  windowLight.castShadow = true; windowLight.shadow.mapSize.set(2048, 2048); windowLight.shadow.radius = 8; windowLight.shadow.bias = -.0005;
  // shadow box covers the whole room; a smaller box left a bright diagonal band on the right wall
  Object.assign(windowLight.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: .5, far: 14 });
  scene.add(windowLight, windowLight.target);
  // Keep the soft interior fill inside the room. The previous open-front setup let it sit
  // behind the new TV wall, which created an unexplained hotspot on the wall surface.
  const fill = new THREE.PointLight("#fff1dc", .6, 9, 1.2); fill.position.set(.2, 2.45, .1); scene.add(fill);
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
  const [sofa, table, floorLamp, coffee, tableLamp, plant, robot, lowChair, laptop] = await Promise.all(["sofa", "side-table", "floor-lamp", "coffee-table", "table-lamp", "plant", "robot", "low-chair-hy21", "laptop"].map((f) => loader.loadAsync(base + f + ".glb")));
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
  const coffeeBounds = new THREE.Box3().setFromObject(coffeeObj);
  const screenReflectionMat = new THREE.MeshStandardMaterial({ color: "#9db9cf", emissive: "#506a7f", emissiveIntensity: .12, roughness: .45, transparent: true, opacity: 0, depthWrite: false });
  const screenReflection = add(new THREE.PlaneGeometry(.42, .25), screenReflectionMat,
    coffeeBounds.getCenter(new THREE.Vector3()).x, coffeeBounds.max.y + .004, coffeeBounds.getCenter(new THREE.Vector3()).z - .08, false);
  screenReflection.rotation.x = -Math.PI / 2; screenReflection.name = "tv-screen-reflection";
  // a small low chair (Hunyuan3D-2.1 shape from the drawing, simplified to 10k faces, colour projected from the drawing), facing the coffee table
  lowChair.scene.rotation.y = 0; // this model already faces +x (toward the table)
  const chairObj = place(lowChair, { height: .5, x: SX - 1.0, z: SZ + 1.15 });
  prepare(chairObj, vcol({ roughness: .62 }));
  const coffeeTop = new THREE.Box3().setFromObject(coffeeObj).max.y;
  // the laptop is open on the coffee table with its screen turned toward the orange chair (left), and a little toward the viewer,
  // so it reads as if someone sat down to work here. Its front (keyboard side) faces +z, so -90deg points it at the chair.
  laptop.scene.rotation.y = -Math.PI / 2 + .55;
  const laptopObj = place(laptop, { width: .3, x: SX + .12, z: SZ + 1.2, baseY: coffeeTop });
  prepare(laptopObj, vcol({ roughness: .5 }));
  // Reuse the existing laptop model as the third quiet console prop, alongside the book and vase.
  // No extra download, plant or light; the original coffee-table laptop stays in place.
  const tvLaptopObj = laptopObj.clone(true); tvLaptopObj.rotation.y = Math.PI;
  place({ scene: tvLaptopObj }, { width: .28, x: .02, z: FRONT - .34, baseY: .59 });
  tvLaptopObj.name = "tv-laptop"; tvWall.add(tvLaptopObj);
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
  // Measure the actual pale shade vertices in world space, rather than guessing from the whole lamp.
  const tableShadeBounds = new THREE.Box3(), shadeVertex = new THREE.Vector3();
  tableLampObj.traverse((m) => {
    if (!m.isMesh) return;
    m.castShadow = false; // the illustration-derived shade is closed, including its top and bottom
    const positions = m.geometry.attributes.position, colors = m.geometry.attributes.color;
    for (let i = 0; i < positions.count; i++) if (colors?.getZ(i) >= .6) {
      shadeVertex.fromBufferAttribute(positions, i).applyMatrix4(m.matrixWorld);
      tableShadeBounds.expandByPoint(shadeVertex);
    }
  });
  if (tableShadeBounds.isEmpty()) throw new Error("Table lamp shade geometry is missing");
  const tableShadeCenter = tableShadeBounds.getCenter(new THREE.Vector3());
  const tableShadeSize = tableShadeBounds.getSize(new THREE.Vector3());
  const tableBulb = tableShadeCenter.clone();
  tableBulb.y = tableShadeBounds.min.y + tableShadeSize.y * .44; // bulb just below the shade's centre
  lampLight.position.copy(tableBulb);
  tableHalo.position.copy(tableBulb); // no camera-facing offset: the glow must stay inside the lamp from every angle
  tableHalo.scale.setScalar(Math.max(tableShadeSize.x, tableShadeSize.z) * 1.25);
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
  scene.add(sofaObj, tableObj, lampObj, coffeeObj, tableLampObj, plantObj, chairObj, laptopObj);
  // the robot turns around its own centre: hang it on a pivot at its footprint centre
  const rb = new THREE.Box3().setFromObject(robotObj), robotPivot = new THREE.Group();
  robotPivot.position.set((rb.min.x + rb.max.x) / 2, 0, (rb.min.z + rb.max.z) / 2); scene.add(robotPivot); robotPivot.attach(robotObj);
  robotPivot.rotation.y = .5; // turned a little toward the room
  // the floor lamp gets its own light just under the shade (no shadow: a light inside the closed shade mesh would be blocked)
  const shadeY = lb.min.y + (lb.max.y - lb.min.y) * .8, lampX = (lb.min.x + lb.max.x) / 2, lampZ = (lb.min.z + lb.max.z) / 2;
  const floorLight = new THREE.PointLight("#ffc98a", 0, 5, 1.6); floorLight.position.set(lampX, shadeY - .12, lampZ + .05); scene.add(floorLight);
  const floorHalo = halo(lampX, shadeY, lampZ + .3, 1.1); // a little in front of the shade so the shade does not hide it
  // A soft fabric-shade emission profile for this point light only: brighter through
  // the open top/bottom, diffuse transmission through the sides. This is an illustrated
  // approximation, not a measured photometric file; no extra lights or hard shadow shell.
  const tableLampProfile = `
    vec3 tableEmitterView = (viewMatrix * vec4(tableBulbWorld, 1.0)).xyz;
    if (distance(pointLight.position, tableEmitterView) < .0001) {
      vec3 tableAxisView = mat3(viewMatrix) * vec3(0.0, 1.0, 0.0);
      float elevation = abs(dot(light.direction, tableAxisView));
      light.color *= mix(.32, 1.0, smoothstep(.2, .65, elevation));
    }
  `;
  const profiledMaterials = new Set();
  scene.traverse((obj) => {
    for (const mat of Array.isArray(obj.material) ? obj.material : [obj.material]) {
      if (!mat?.isMeshStandardMaterial || profiledMaterials.has(mat)) continue;
      profiledMaterials.add(mat);
      const compile = mat.onBeforeCompile, cacheKey = mat.customProgramCacheKey();
      mat.onBeforeCompile = function (shader, webgl) {
        compile.call(this, shader, webgl); // retain fabric weave and both lamps' emissive shaders
        shader.uniforms.tableBulbWorld = { value: tableBulb };
        shader.fragmentShader = "uniform vec3 tableBulbWorld;\n" + shader.fragmentShader.replace(
          "#include <lights_pars_begin>",
          THREE.ShaderChunk.lights_pars_begin.replace(
            "light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );",
            "light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );" + tableLampProfile,
          ),
        );
      };
      mat.customProgramCacheKey = () => cacheKey + "|table-lamp-profile-v1";
    }
  });

  // Home planning board on the open stretch of the left wall, between the harbour frame and the plant.
  // Same lights as the rest of the room: no extra lamp. The words are baked pictures so the page loads no font.
  // Plumb to the wall: only rotation.y. The room camera stays level, so these edges stay vertical on screen.
  const HOME_BOARD_LINES = ["milk", "eggs", "bread", "Fri dinner 7pm", "dentist Tue"];
  const HOME_BOARD_NOTES = [];
  const HOME_BOARD_COPY = {
    zh: { lines: HOME_BOARD_LINES, notes: HOME_BOARD_NOTES },
    en: { lines: HOME_BOARD_LINES, notes: HOME_BOARD_NOTES },
  };
  const homeBoard = new THREE.Group();
  homeBoard.name = "home-board";
  const boardFaceW = .60, boardFaceH = .90, boardCorner = .022;
  const glassBack = .018, glassDepth = .008, glassFront = glassBack + glassDepth;
  // Harbour frame's near edge is about world z 0.33. The glass's near edge stays at world z -0.10.
  homeBoard.position.set(-W / 2 + .008, 1.38, -.10 - boardFaceW / 2);
  homeBoard.rotation.y = Math.PI / 2;
  scene.add(homeBoard);
  const boardPiece = (geo, mat, x, y, z, name) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = name; mesh.position.set(x, y, z);
    mesh.castShadow = false; mesh.receiveShadow = true;
    homeBoard.add(mesh); return mesh;
  };
  function roundedRectShape(w, h, r) {
    const shape = new THREE.Shape();
    const x = -w / 2, y = -h / 2;
    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);
    return shape;
  }
  function roundedMask(w, h, r) {
    const cw = 512, ch = Math.round(cw * h / w);
    const c = document.createElement("canvas"); c.width = cw; c.height = ch;
    const ctx = c.getContext("2d");
    const rx = r / w * cw;
    ctx.clearRect(0, 0, cw, ch); ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(rx, 0);
    ctx.lineTo(cw - rx, 0); ctx.quadraticCurveTo(cw, 0, cw, rx);
    ctx.lineTo(cw, ch - rx); ctx.quadraticCurveTo(cw, ch, cw - rx, ch);
    ctx.lineTo(rx, ch); ctx.quadraticCurveTo(0, ch, 0, ch - rx);
    ctx.lineTo(0, rx); ctx.quadraticCurveTo(0, 0, rx, 0);
    ctx.closePath(); ctx.fill();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.NoColorSpace; tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }
  const glassMat = new THREE.MeshStandardMaterial({ color: "#f3f2ee", roughness: .32, metalness: .08 });
  const boardFaceMat = new THREE.MeshStandardMaterial({
    color: "#f7f6f2", roughness: .55, metalness: .02, transparent: true, alphaTest: .5, alphaMap: roundedMask(boardFaceW, boardFaceH, boardCorner),
  });
  const brassMat = new THREE.MeshStandardMaterial({ color: "#c2a36a", metalness: .48, roughness: .58 });
  const ledgeMat = new THREE.MeshStandardMaterial({ color: "#d4b483", roughness: .72 });
  boardPiece(new THREE.ExtrudeGeometry(roundedRectShape(boardFaceW, boardFaceH, boardCorner), { depth: glassDepth, bevelEnabled: false, curveSegments: 8 }), glassMat, 0, 0, glassBack, "home-board-glass");
  boardPiece(new THREE.PlaneGeometry(boardFaceW, boardFaceH), boardFaceMat, 0, 0, glassFront + .0006, "home-board-face");
  for (const x of [-1, 1]) for (const y of [-1, 1]) {
    const sx = x * (boardFaceW / 2 - .042), sy = y * (boardFaceH / 2 - .048);
    const rose = boardPiece(new THREE.CylinderGeometry(.008, .008, .002, 16), brassMat, sx, sy, .0015, "home-board-standoff");
    rose.rotation.x = Math.PI / 2;
    const peg = boardPiece(new THREE.CylinderGeometry(.0042, .0042, glassBack - .002, 12), brassMat, sx, sy, glassBack / 2, "home-board-standoff");
    peg.rotation.x = Math.PI / 2;
  }
  const ledgeW = .52, ledgeD = .04, ledgeT = .007;
  const ledgeTop = -boardFaceH / 2 - .014;
  const ledgeCenterZ = glassFront + ledgeD / 2 - .006;
  boardPiece(new THREE.BoxGeometry(ledgeW, ledgeT, ledgeD), ledgeMat, 0, ledgeTop - ledgeT / 2, ledgeCenterZ, "home-board-ledge");
  boardPiece(new THREE.BoxGeometry(ledgeW, .006, .006), ledgeMat, 0, ledgeTop + .003, ledgeCenterZ + ledgeD / 2 - .003, "home-board-ledge-lip");
  const ledgeBack = ledgeCenterZ - ledgeD / 2;
  for (const x of [-.16, .16]) {
    const peg = boardPiece(new THREE.CylinderGeometry(.0045, .0045, ledgeBack - .002, 10), brassMat, x, ledgeTop - ledgeT / 2, (ledgeBack + .002) / 2, "home-board-ledge-peg");
    peg.rotation.x = Math.PI / 2;
  }
  const penShadowTex = canvasTex(128, 64, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const g = ctx.createRadialGradient(w / 2, h / 2, w * .08, w / 2, h / 2, w * .48);
    g.addColorStop(0, "rgba(40,28,18,.55)"); g.addColorStop(.7, "rgba(40,28,18,.18)"); g.addColorStop(1, "rgba(40,28,18,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
  penShadowTex.wrapS = penShadowTex.wrapT = THREE.ClampToEdgeWrapping;
  const penShadowMat = new THREE.MeshBasicMaterial({ map: penShadowTex, transparent: true, depthWrite: false });
  const penR = .008, penLen = .100;
  // Black and red only, matching the ink. Two black markers, one red.
  [{ color: "#1c1c1c", cap: "#2a2a2a", x: -.17 }, { color: "#c43131", cap: "#d24b4b", x: -.04 }, { color: "#1c1c1c", cap: "#2a2a2a", x: .09 }].forEach((pen) => {
    const y = ledgeTop + penR, z = ledgeCenterZ;
    const marker = boardPiece(new THREE.CapsuleGeometry(penR, penLen, 4, 12), new THREE.MeshStandardMaterial({ color: pen.color, roughness: .36 }), pen.x, y, z, "home-board-marker");
    marker.rotation.z = Math.PI / 2;
    const capMat = new THREE.MeshStandardMaterial({ color: pen.cap, roughness: .42 });
    const cap = boardPiece(new THREE.CapsuleGeometry(penR + .0005, .02, 3, 12), capMat, pen.x + penLen / 2 + .002, y, z, "home-board-marker-cap");
    cap.rotation.z = Math.PI / 2;
    const shadow = boardPiece(new THREE.PlaneGeometry(penLen + .028, penR * 3.2), penShadowMat, pen.x + .01, ledgeTop + .0012, z, "home-board-marker-shadow");
    shadow.rotation.x = -Math.PI / 2; shadow.receiveShadow = false;
  });
  const eraserFelt = new THREE.MeshStandardMaterial({ color: "#a7abae", roughness: .94 });
  const eraserX = .19, eraserY = ledgeTop + .006, eraserZ = ledgeCenterZ;
  boardPiece(new THREE.BoxGeometry(.058, .012, .026), eraserFelt, eraserX, eraserY, eraserZ, "home-board-eraser");
  const eraserShadow = boardPiece(new THREE.PlaneGeometry(.066, .032), penShadowMat, eraserX, ledgeTop + .0012, eraserZ, "home-board-marker-shadow");
  eraserShadow.rotation.x = -Math.PI / 2; eraserShadow.receiveShadow = false;
  function curledNote(w, h) {
    const geo = new THREE.PlaneGeometry(w, h, 7, 7);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i) / w + .5, v = pos.getY(i) / h + .5;
      const curl = Math.max(0, u - .75) / .25 * Math.max(0, v - .72) / .28;
      pos.setZ(i, curl * curl * .014);
    }
    geo.computeVertexNormals();
    return geo;
  }
  const noteSpecs = [
    { key: "yellow", color: "#f4e7b0", x: .13, y: .08, z: glassFront + .004, rot: .1, w: .05, h: .046 },
    { key: "sage", color: "#d5dec8", x: -.05, y: -.2, z: glassFront + .004, rot: -.08, w: .048, h: .044 },
  ];
  const noteMeshes = noteSpecs.map((spec) => {
    const mat = new THREE.MeshStandardMaterial({ color: spec.color, roughness: .88 });
    const mesh = boardPiece(curledNote(spec.w, spec.h), mat, spec.x, spec.y, spec.z, `home-board-note-${spec.key}`);
    mesh.rotation.z = spec.rot; mesh.userData.note = spec.key; mesh.userData.fixed = true;
    return mesh;
  });
  const addMagnet = (x, y, z) => {
    const mesh = boardPiece(new THREE.CylinderGeometry(.007, .007, .003, 20), brassMat, x, y, z, "home-board-magnet");
    mesh.rotation.x = Math.PI / 2;
  };
  addMagnet(.148, .096, glassFront + .006);
  addMagnet(-.032, -.184, glassFront + .006);
  const boardShadowTex = canvasTex(256, 384, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(48,34,22,.38)";
    ctx.filter = "blur(14px)";
    const inset = 22, rx = 18;
    ctx.beginPath();
    ctx.moveTo(inset + rx, inset);
    ctx.lineTo(w - inset - rx, inset); ctx.quadraticCurveTo(w - inset, inset, w - inset, inset + rx);
    ctx.lineTo(w - inset, h - inset - rx); ctx.quadraticCurveTo(w - inset, h - inset, w - inset - rx, h - inset);
    ctx.lineTo(inset + rx, h - inset); ctx.quadraticCurveTo(inset, h - inset, inset, h - inset - rx);
    ctx.lineTo(inset, inset + rx); ctx.quadraticCurveTo(inset, inset, inset + rx, inset);
    ctx.closePath(); ctx.fill();
    ctx.filter = "none";
  });
  boardShadowTex.wrapS = boardShadowTex.wrapT = THREE.ClampToEdgeWrapping;
  const boardShadow = boardPiece(new THREE.PlaneGeometry(boardFaceW + .05, boardFaceH + .2), new THREE.MeshBasicMaterial({ map: boardShadowTex, transparent: true, depthWrite: false }), 0, -.06, .001, "home-board-contact-shadow");
  boardShadow.receiveShadow = false;
  const boardArt = {};
  function boardArtTexture(name) {
    if (!boardArt[name]) {
      boardArt[name] = texLoader.load(new URL(`./art/${name}.webp`, import.meta.url).href, () => render(), undefined, () => {
        console.warn("ROOMVERSE home board picture unavailable");
      });
      boardArt[name].colorSpace = THREE.SRGBColorSpace; boardArt[name].anisotropy = 8;
    }
    return boardArt[name];
  }
  function boardEdgeLean() {
    camera.updateMatrixWorld(true);
    const offset = camera.position.clone().sub(controls.target);
    const pitch = Math.atan2(offset.y, Math.hypot(offset.x, offset.z)) * 180 / Math.PI;
    const lean = (x) => {
      const top = new THREE.Vector3(x, boardFaceH / 2, glassFront).applyMatrix4(homeBoard.matrixWorld).project(camera);
      const bot = new THREE.Vector3(x, -boardFaceH / 2, glassFront).applyMatrix4(homeBoard.matrixWorld).project(camera);
      return Math.atan2(top.x - bot.x, top.y - bot.y) * 180 / Math.PI;
    };
    return { pitch, left: lean(-boardFaceW / 2), right: lean(boardFaceW / 2) };
  }
  function showBoardLanguage(code) {
    const pack = code === "en" ? "en" : "zh";
    // Baked marker writing on the 60×90 cm face. Measured on the picture: main caps 4.0 cm
    // (the F in "Fri dinner 7pm" is 4.0 cm), note caps 3.0 cm, stroke 3.3 mm.
    // That dinner line is 30.5 cm across, half of the 60 cm width.
    boardFaceMat.map = boardArtTexture("home-board-en-v5"); boardFaceMat.color.set("#ffffff"); boardFaceMat.needsUpdate = true;
    homeBoard.userData.lang = pack;
  }
  showBoardLanguage(lang);

  // A real-size 春聯 strip on the open left wall, on the window side of the glass board.
  // 20 × 70 cm, five millimetres off the plaster, top lined up with the board.
  // The four characters are a baked picture, so the page loads no Chinese font.
  const coupletW = .20, coupletH = .70, coupletGap = .14;
  const couplet = new THREE.Group();
  couplet.name = "blessing-couplet";
  const boardTop = homeBoard.position.y + boardFaceH / 2;
  const boardWindowZ = homeBoard.position.z - boardFaceW / 2;
  couplet.position.set(-W / 2, boardTop - coupletH / 2, boardWindowZ - coupletGap - coupletW / 2);
  couplet.rotation.y = Math.PI / 2;
  scene.add(couplet);
  const coupletTex = new THREE.TextureLoader().load(new URL("./art/blessing-couplet-v1.webp", import.meta.url).href, () => render());
  coupletTex.colorSpace = THREE.SRGBColorSpace;
  coupletTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  coupletTex.wrapS = coupletTex.wrapT = THREE.ClampToEdgeWrapping;
  // Matte rice paper: no metalness, no clearcoat, no environment reflection. Any sheen here
  // reads as a black sheet once the camera turns away from the window light.
  const coupletMat = new THREE.MeshStandardMaterial({
    map: coupletTex, color: "#ffffff", roughness: .9, metalness: 0, alphaTest: .5,
  });
  const coupletPaper = new THREE.Mesh(new THREE.PlaneGeometry(coupletW, coupletH), coupletMat);
  coupletPaper.name = "blessing-couplet-paper";
  coupletPaper.position.set(0, 0, .005);
  coupletPaper.castShadow = false;
  // Five millimetres off the wall is close enough for the wall's shadow map to bite into the
  // paper (shadow acne), so the sheet takes no shadows; the soft mark below supplies the depth.
  coupletPaper.receiveShadow = false;
  couplet.add(coupletPaper);
  const coupletShadowTex = canvasTex(128, 384, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(36,18,14,.5)";
    ctx.filter = "blur(14px)";
    ctx.fillRect(20, 18, w - 40, h - 32);
    ctx.filter = "none";
  });
  coupletShadowTex.wrapS = coupletShadowTex.wrapT = THREE.ClampToEdgeWrapping;
  // The soft mark sits behind the sheet. It must not use polygonOffset: the offset is scaled by
  // depth slope, so on a grazing view it creeps in front of the paper and the strip turns black.
  const coupletShadow = new THREE.Mesh(new THREE.PlaneGeometry(coupletW + .06, coupletH + .08), new THREE.MeshBasicMaterial({
    map: coupletShadowTex, transparent: true, depthWrite: false,
  }));
  coupletShadow.name = "blessing-couplet-shadow";
  // Window light comes from above and toward the window, so the soft mark falls down and away from it.
  coupletShadow.position.set(-.012, -.016, .0012);
  coupletShadow.castShadow = false;
  coupletShadow.receiveShadow = false;
  couplet.add(coupletShadow);

  // ---------- state + panel ----------
  const state = { mood: "rain", wall: "original", rug: "stripe", curtain: "linen", print: "hills", lang };
  let directorStillOpen = false;
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
  const lightForMood = (mood) => {
    const m = MOODS[mood];
    const screenLevel = ({ rain: .1, family: .08, tech: .15, chic: .08, slow: .07, tv: .46 })[mood];
    return {
      hemi: m.hemi, win: m.win, lamp: m.lamp, fill: m.fill, floor: m.floor, exposure: m.exposure, led: m.led ? .5 : 0,
      floorHalo: m.floor ? m.glow : 0, tableHalo: m.glow,
      shade: m.floor ? .55 : 0, table: m.glow > .3 ? .45 : .18, // the AI shade is a solid shape: a soft glow keeps its form; dimmer in daylight
      winCol: new THREE.Color(m.winCol), out: new THREE.Color(m.out), tvWall: TV_STRIP_GLOW[mood], wallWarmth: WALLS_WITHOUT_WARM_WASH.has(state.wall) ? 0 : TV_WALL_WASH[mood], screenReflection: mood === "tv" ? .17 : 0, screenLevel,
    };
  };
  const lights = () => lightForMood(state.mood);
  let standGroup = null, standContact = null, standWall = null, standScarfMat = null, standBrass = null, standBaseMat = null;
  function setLights(v) {
    hemi.intensity = v.hemi; windowLight.intensity = v.win; windowLight.color.copy(v.winCol);
    lampLight.intensity = v.lamp; fill.intensity = v.fill; outMat.color.copy(v.out);
    floorLight.intensity = v.floor; floorHalo.material.opacity = v.floorHalo; tableHalo.material.opacity = v.tableHalo;
    shadeGlow.value = v.shade; tableGlow.value = v.table; renderer.toneMappingExposure = v.exposure; ledGlow.intensity = v.led;
    tvStripMat.emissiveIntensity = v.tvWall; tvWashMat.opacity = v.tvWall * .45; tvWallWashMat.opacity = v.wallWarmth; screenReflectionMat.opacity = v.screenReflection;
    if (tvScreenArtLoaded) tvScreenMat.color.setScalar(v.screenLevel);
    updateRightArtLight(v);
    updateLeftArtLight(v);
    // The hall stand uses the same lamps. Only the soft floor contact lifts in brighter moods.
    if (standContact) standContact.material.opacity = THREE.MathUtils.clamp(.22 - v.hemi * .05, .1, .22);
    if (standWall) standWall.material.opacity = THREE.MathUtils.clamp(.4 - v.hemi * .1, .16, .4);
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
  // Each feeling starts with a matching existing finish; an explicit URL or visitor pick wins.
  const DEFAULT_WALL_BY_MOOD = { rain: "original", family: "olive", tech: "mist", chic: "blush", slow: "sand", tv: "wine" };
  const fromUrl = new URLSearchParams(location.search);
  let wallWasChosen = Object.hasOwn(WALLS, fromUrl.get("wall") ?? "");
  for (const k in CHOICES) { const v = fromUrl.get(k); if (v && Object.hasOwn(CHOICES[k], v)) state[k] = v; }
  if (!wallWasChosen) state.wall = DEFAULT_WALL_BY_MOOD[state.mood];
  function choose(key, value) {
    if (key === "wall") wallWasChosen = true;
    if (key === "mood" && !wallWasChosen) state.wall = DEFAULT_WALL_BY_MOOD[value];
    state[key] = value;
    apply();
  }
  function toUrl() {
    const u = new URL(location.href);
    for (const k in CHOICES) u.searchParams.set(k, state[k]);
    if (currentView === "tv") u.searchParams.set("view", "tv"); else u.searchParams.delete("view");
    history.replaceState(null, "", u);
  }
  function setCameraAngle(theta, radius = orbitRadius, phi = orbitPhi) {
    controls.target.copy(orbitCenter);
    camera.position.copy(cameraAt(theta, radius, phi));
    camera.lookAt(orbitCenter);
    controls.update();
    render();
  }
  function moveToView(view) {
    if (view === "tv") { void loadTvWallTextures(); void loadDoorTexture(); void loadConsoleDecor(); void loadRightWallArt(); }
    if (director) stopDirector(false);
    if (directorPreparing) cancelPreparation();
    settleIntro();
    const target = view === "tv" ? Math.PI : 0;
    const offset = camera.position.clone().sub(orbitCenter), radius = Math.min(controls.maxDistance, Math.max(controls.minDistance, offset.length()));
    const phi = Math.acos(THREE.MathUtils.clamp(offset.y / Math.max(radius, .001), -1, 1));
    const start = Math.atan2(offset.x, offset.z);
    const delta = Math.atan2(Math.sin(target - start), Math.cos(target - start));
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const token = ++viewMoveToken;
    currentView = view; viewTheta = target;
    if (reduce || Math.abs(delta) < .01) {
      controls.enabled = true; setCameraAngle(target, radius, phi); toUrl(); drawPanel(); return;
    }
    controls.enabled = false;
    const t0 = performance.now(), duration = 980;
    const step = (now) => {
      if (token !== viewMoveToken) return;
      const k = Math.min(1, (now - t0) / duration), e = k * k * (3 - 2 * k);
      camera.position.copy(cameraAt(start + delta * e, radius, phi));
      camera.lookAt(orbitCenter); render();
      if (k < 1) requestAnimationFrame(step);
      else { controls.target.copy(orbitCenter); controls.enabled = true; setCameraAngle(target, radius, phi); toUrl(); drawPanel(); }
    };
    requestAnimationFrame(step);
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
    const toolbar = document.getElementById("roomToolbar");
    let keep = null;
    if (had && (panel.contains(had) || toolbar?.contains(had))) {
      const g = had.closest(".opts");
      keep = g ? { g: [...panel.querySelectorAll(".opts")].indexOf(g), k: had.dataset.key } : { c: had.classList.contains("camera-tv") ? "camera-tv" : had.classList.contains("camera-window") ? "camera-window" : had.classList.contains("director") ? "director" : had.classList.contains("shuffle") ? "shuffle" : "save" };
    }
    const cameraGroup = document.createElement("div"); cameraGroup.className = "camera-actions"; cameraGroup.setAttribute("role", "group"); cameraGroup.setAttribute("aria-label", state.lang === "zh" ? "房間視角" : "Room view");
    const windowButton = Object.assign(document.createElement("button"), { type: "button", className: "camera-window", textContent: t.windowView, "aria-label": t.windowView, "aria-pressed": String(currentView === "window"), onclick: () => moveToView("window") });
    const tvButton = Object.assign(document.createElement("button"), { type: "button", className: "camera-tv", textContent: t.tvView, "aria-label": t.tvView, "aria-pressed": String(currentView === "tv"), onclick: () => moveToView("tv") });
    windowButton.setAttribute("aria-label", t.windowView); windowButton.setAttribute("aria-pressed", String(currentView === "window"));
    tvButton.setAttribute("aria-label", t.tvView); tvButton.setAttribute("aria-pressed", String(currentView === "tv"));
    cameraGroup.append(windowButton, tvButton);
    const headings = document.createElement("h2"); headings.className = "camera-heading"; headings.textContent = state.lang === "zh" ? "轉換視角" : "Change view";
    panel.replaceChildren(headings, cameraGroup, ...[["mood", MOODS], ["wall", WALLS], ["rug", RUGS], ["curtain", CURTAINS], ["print", PRINTS]].flatMap(([key, table]) => {
      const h = document.createElement("h2"); h.textContent = t[key];
      const box = document.createElement("div"); box.className = "opts"; box.setAttribute("role", "group"); box.setAttribute("aria-label", t[key]);
      box.append(...Object.entries(table).map(([k, v]) => {
        const b = document.createElement("button"); b.type = "button"; b.textContent = v[state.lang]; b.dataset.key = k;
        b.setAttribute("aria-pressed", String(state[key] === k));
        b.onclick = () => { if (director) stopDirector(false); if (directorPreparing) cancelPreparation(); choose(key, k); toUrl(); };
        return b;
      }));
      if (key !== "mood") return [h, box];
      const why = document.createElement("p"); why.className = "why"; why.textContent = MOODS[state.mood].why[state.lang]; // why this pairing
      return [h, box, why];
    }), Object.assign(document.createElement("p"), { className: "hint", textContent: t.hint }));
    const bar = PHONE_BAR[state.lang];
    const onPhone = phoneActions.matches;
    const directorFull = directorPreparing ? t.preparing : director ? t.stop : still && directorStillOpen ? t.close : t.director;
    const directorShort = directorPreparing ? bar.preparing : director ? bar.stop : still && directorStillOpen ? bar.close : bar.director;
    const directorBtn = Object.assign(document.createElement("button"), { type: "button", className: "save director", textContent: onPhone ? directorShort : directorFull, onclick: () => toggleDirector() });
    const shuffleBtn = Object.assign(document.createElement("button"), { type: "button", className: "save shuffle", textContent: onPhone ? bar.shuffle : t.shuffle, onclick: () => shuffle() });
    const saveBtn = Object.assign(document.createElement("button"), { type: "button", className: "save", textContent: onPhone ? bar.save : t.save, onclick: () => savePostcard() });
    directorBtn.setAttribute("aria-label", directorFull);
    shuffleBtn.setAttribute("aria-label", t.shuffle);
    saveBtn.setAttribute("aria-label", t.save);
    const stillNodes = still && directorStillOpen ? [staticTour(t)] : [];
    if (onPhone && toolbar) {
      toolbar.replaceChildren(directorBtn, shuffleBtn, saveBtn);
      toolbar.setAttribute("aria-label", state.lang === "zh" ? "短片、隨機房間、明信片" : "Tour, random room, postcard");
      toolbar.hidden = panel.hidden;
      panel.append(...stillNodes);
    } else {
      if (toolbar) { toolbar.replaceChildren(); toolbar.hidden = true; }
      panel.append(directorBtn, ...stillNodes, shuffleBtn, saveBtn);
    }
    if (keep) {
      const target = keep.c ? (toolbar?.querySelector("." + keep.c) || panel.querySelector("." + keep.c)) : panel.querySelectorAll(".opts")[keep.g]?.querySelector(`button[data-key="${keep.k}"]`);
      target?.focus({ preventScroll: true });
    }
  }
  function staticTour(t) {
    const box = document.createElement("div"); box.className = "director-still";
    const phases = document.createElement("div"); phases.className = "director-phases";
    phases.append(...t.directorPhases.map((label, i) => {
      const phase = Object.assign(document.createElement("span"), { className: `director-phase phase-${i}` });
      const scene = Object.assign(document.createElement("span"), { className: "director-mini-room", ariaHidden: "true" });
      scene.append(Object.assign(document.createElement("span"), { className: "director-mini-window" }), Object.assign(document.createElement("span"), { className: "director-mini-lamp" }));
      phase.append(scene, Object.assign(document.createElement("span"), { textContent: label }));
      return phase;
    }));
    const description = document.createElement("p"); description.textContent = t.directorStill;
    box.append(phases, description);
    return box;
  }
  // Feeling stays. Each finish is drawn from the options other than the one on screen.
  // If that draw ever matches the whole room that was just showing, draw once more the same way.
  function shuffle() {
    if (director) stopDirector(false);
    if (directorPreparing) cancelPreparation();
    const pick = (table, now) => { const ks = Object.keys(table).filter((k) => k !== now); return ks[Math.floor(Math.random() * ks.length)]; };
    const before = { wall: state.wall, rug: state.rug, curtain: state.curtain, print: state.print };
    const draw = () => ({ wall: pick(WALLS, before.wall), rug: pick(RUGS, before.rug), curtain: pick(CURTAINS, before.curtain), print: pick(PRINTS, before.print) });
    let next = draw();
    if (next.wall === before.wall && next.rug === before.rug && next.curtain === before.curtain && next.print === before.print) next = draw();
    wallWasChosen = true;
    state.wall = next.wall; state.rug = next.rug; state.curtain = next.curtain; state.print = next.print;
    apply(); toUrl();
  }

  // Original 3D postcard, retained for QA and as the fallback if a new feeling lacks illustration.
  function postcard({ includeMood = true } = {}) {
    // Postcards keep the original window-facing composition, even when the visitor is at the TV wall.
    const savedPosition = camera.position.clone(), savedTarget = controls.target.clone();
    const offset = savedPosition.clone().sub(orbitCenter), radius = offset.length();
    const phi = Math.acos(THREE.MathUtils.clamp(offset.y / Math.max(radius, .001), -1, 1));
    camera.position.copy(cameraAt(0, radius, phi)); camera.lookAt(orbitCenter); render();
    const src = document.createElement("canvas"); src.width = renderer.domElement.width; src.height = renderer.domElement.height;
    src.getContext("2d").drawImage(renderer.domElement, 0, 0); // copy before restoring the live camera
    camera.position.copy(savedPosition); controls.target.copy(savedTarget); camera.lookAt(savedTarget); controls.update(); render();
    const w = src.width, h = src.height, baseStrip = Math.round(Math.max(90, h * .16));
    const pad = Math.round(baseStrip * .32), big = Math.round(baseStrip * .26), small = Math.round(baseStrip * .17);
    const c = document.createElement("canvas"), ctx = c.getContext("2d"), l = state.lang;
    function heading(inset, baseline) {
      const title = "ROOMVERSE 3D", domain = "paulstradecraft.com", gap = Math.ceil(small * .8);
      const available = w - inset * 2;
      let titleSize = big, domainSize = small;
      ctx.font = `800 ${big}px system-ui, "Noto Sans TC", sans-serif`;
      const titleWidth = ctx.measureText(title).width;
      ctx.font = `500 ${small}px system-ui, "Noto Sans TC", sans-serif`;
      const domainWidth = ctx.measureText(domain).width;
      if (titleWidth + domainWidth + gap > available) {
        domainSize = Math.max(Math.min(12, small), Math.min(small, small * (available - titleWidth - gap) / domainWidth));
        ctx.font = `500 ${domainSize}px system-ui, "Noto Sans TC", sans-serif`;
        titleSize = Math.min(big, big * (available - ctx.measureText(domain).width - gap) / titleWidth);
      }
      ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
      ctx.fillStyle = "#24302c"; ctx.font = `800 ${titleSize}px system-ui, "Noto Sans TC", sans-serif`;
      ctx.fillText(title, inset, baseline);
      ctx.fillStyle = "#5b665f"; ctx.font = `500 ${domainSize}px system-ui, "Noto Sans TC", sans-serif`;
      ctx.textAlign = "right"; ctx.fillText(domain, w - inset, baseline);
      ctx.textAlign = "left";
    }
    ctx.font = `500 ${small}px system-ui, "Noto Sans TC", sans-serif`;
    const labels = [includeMood ? MOODS[state.mood][l] : null, WALLS[state.wall][l], RUGS[state.rug][l], CURTAINS[state.curtain][l], PRINTS[state.print][l]].filter(Boolean);
    const joined = labels.join("  ·  ");
    if (ctx.measureText(joined).width <= w - pad * 2) {
      c.width = w; c.height = h + baseStrip;
      ctx.drawImage(src, 0, 0);
      ctx.fillStyle = "#fbfaf6"; ctx.fillRect(0, h, w, baseStrip);
      heading(pad, h + pad + big * .8);
      ctx.fillStyle = "#5b665f"; ctx.font = `500 ${small}px system-ui, "Noto Sans TC", sans-serif`;
      ctx.fillText(joined, pad, h + baseStrip - pad * .9);
      return c;
    }
    const wrapPad = Math.round(baseStrip * .23), maxLine = w - wrapPad * 2;
    const details = [];
    for (const label of labels) {
      const last = details.length - 1, candidate = last < 0 ? label : `${details[last]}  ·  ${label}`;
      if (last >= 0 && ctx.measureText(candidate).width > maxLine) details.push(label);
      else if (last < 0) details.push(label);
      else details[last] = candidate;
    }
    const lineHeight = Math.ceil(small * 1.3), strip = Math.max(baseStrip, Math.ceil(wrapPad * 1.4 + big * 1.15 + small * 1.1 + (details.length - 1) * lineHeight));
    c.width = w; c.height = h + strip;
    ctx.drawImage(src, 0, 0);
    ctx.fillStyle = "#fbfaf6"; ctx.fillRect(0, h, w, strip);
    const titleY = h + wrapPad + big * .8;
    heading(wrapPad, titleY);
    ctx.fillStyle = "#5b665f"; ctx.font = `500 ${small}px system-ui, "Noto Sans TC", sans-serif`;
    const detailBottom = h + strip - wrapPad * .6;
    details.forEach((line, i) => ctx.fillText(line, wrapPad, detailBottom - (details.length - 1 - i) * lineHeight));
    return c;
  }
  function downloadPostcard(blob, filename) {
    if (!blob) return;
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: filename });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  async function savePostcard() {
    const { mood, lang: downloadLang } = state;
    // Capture before loading, so a failed art request still represents what was selected at click time.
    const fallback = postcard({ includeMood: false });
    if (POSTCARD_ART.has(mood)) {
      try {
        const art = new URL(`./postcard/roomverse-postcard-${mood}-v1.webp`, import.meta.url);
        const response = await fetch(art.href);
        if (!response.ok) throw new Error(`Postcard art: ${response.status}`);
        const blob = await response.blob();
        if (!blob.type.startsWith("image/webp")) throw new Error("Postcard art is not WebP");
        downloadPostcard(blob, TEXT[downloadLang].artFile);
        return;
      } catch (error) {
        console.warn("Using the 3D postcard fallback", error);
      }
    }
    fallback.toBlob((blob) => downloadPostcard(blob, TEXT[downloadLang].file), "image/png");
  }

  let looping = false;
  // Yaw lives on the frame that is about to be drawn. fit() only knows the saved view and would
  // widen the window too; the controls "change" event does not run during a view-button turn,
  // the entrance drift, or the postcard's temporary window camera. Skip the blend while the
  // short film owns the camera, so that path keeps the base fov fit() already chose.
  function render() { syncFov(); renderer.render(scene, camera); }
  function showDirectorStop() {
    stopButton.textContent = TEXT[state.lang].stop;
    stopButton.hidden = !(director || directorPreparing);
  }
  function settleIntro() {
    if (!intro || !introEnd) return;
    intro = false;
    camera.position.copy(introEnd);
    camera.lookAt(controls.target);
    controls.update();
    render();
  }
  function showStage() {
    // On a phone the tour button sits above the room; keep the movie and its stop button in view.
    if (phoneActions.matches) stage.scrollIntoView({ behavior: "auto", block: "center" });
  }
  // A deliberately finite tour: no permanent render loop, URL mutation, or change to the visitor's choices.
  const tourStart = new THREE.Vector3(.22, 1.55, 1.85);
  const tourStartNarrow = new THREE.Vector3(.12, 1.5, 1.78);
  const tourEnd = new THREE.Vector3(.48, 1.34, 1.12);
  const tourTarget = new THREE.Vector3(0, 1.1, -1.15);
  const smooth = (x) => { const k = Math.max(0, Math.min(1, x)); return k * k * (3 - 2 * k); };
  function blendLights(a, b, k, out) {
    for (const key in a) {
      if (a[key].isColor) out[key].copy(a[key]).lerp(b[key], k);
      else out[key] = a[key] + (b[key] - a[key]) * k;
    }
    return out;
  }
  function tourView(mood) {
    const map = cache["view-" + mood] ||= VIEWS[mood]();
    if (director) director.view = mood;
    if (outMat.map !== map) { outMat.map = map; outMat.needsUpdate = true; }
    led.visible = !!MOODS[mood].led;
  }
  function stopDirector(announce = true) {
    if (!director) return;
    const run = director;
    director = null;
    cancelAnimationFrame(run.frame);
    showDirectorStop();
    camera.position.copy(run.camera);
    controls.target.copy(run.target);
    controls.enabled = true;
    controls.update();
    fade++; // cancel any earlier feeling transition, then restore this visitor's original feeling
    shown = lights(); shownMood = state.mood; setLights(shown);
    tourView(state.mood);
    robotPivot.rotation.y = robotHome.r;
    robotPivot.position.y = robotHome.y;
    render();
    if (announce) live.textContent = TEXT[state.lang].directorDone;
    drawPanel();
  }
  function cancelPreparation() {
    directorPrepareToken++;
    directorPreparing = false;
    showDirectorStop();
    live.textContent = "";
    drawPanel();
  }
  async function toggleDirector() {
    if (still) {
      directorStillOpen = !directorStillOpen;
      live.textContent = directorStillOpen ? TEXT[state.lang].directorStill : "";
      drawPanel();
      if (directorStillOpen) panel.querySelector(".director-still")?.scrollIntoView({ behavior: "auto", block: "nearest" });
      return;
    }
    if (directorPreparing) { cancelPreparation(); return; }
    if (director) { stopDirector(); return; }
    settleIntro();
    showStage();
    const token = ++directorPrepareToken;
    directorPreparing = true;
    showDirectorStop();
    live.textContent = TEXT[state.lang].preparing;
    drawPanel();
    const moods = ["rain", "family", "tech"];
    for (const mood of moods) cache["view-" + mood] ||= VIEWS[mood]();
    const ready = await Promise.all(moods.map((mood) => viewReady[mood]));
    if (token !== directorPrepareToken) return;
    directorPreparing = false;
    showDirectorStop();
    if (ready.some((ok) => !ok)) {
      moods.forEach((mood, i) => { if (!ready[i]) { delete cache["view-" + mood]; delete viewReady[mood]; } });
      live.textContent = TEXT[state.lang].unavailable;
      drawPanel();
      return;
    }
    fade++;
    hopRun++; hopping = false;
    robotPivot.rotation.y = robotHome.r; robotPivot.position.y = robotHome.y;
    const run = { camera: camera.position.clone(), target: controls.target.clone(), frame: 0, started: 0 };
    director = run;
    showDirectorStop();
    live.textContent = TEXT[state.lang].director;
    controls.enabled = false;
    const from = camera.aspect < 1 ? tourStartNarrow : tourStart;
    run.from = from;
    camera.position.copy(from); controls.target.copy(tourTarget); camera.lookAt(tourTarget);
    setLights(lightForMood("rain")); tourView("rain"); render(); drawPanel();
    for (let i = 0; i < 3; i++) { // WebGL may show the prior texture for a frame after swapping the view
      await new Promise(requestAnimationFrame);
      if (director !== run) return;
      render();
    }
    run.started = performance.now(); // time the story only after its first fully prepared frame
    const rain = lightForMood("rain"), day = lightForMood("family"), night = lightForMood("tech"), blended = lightForMood("rain");
    const step = (now) => {
      if (director !== run) return;
      const t = Math.max(0, Math.min(8, (now - run.started) / 1000));
      camera.position.lerpVectors(from, tourEnd, smooth(t / 8));
      camera.lookAt(tourTarget);
      if (t < 1.2) { setLights(rain); tourView("rain"); }
      else if (t < 4.5) { setLights(blendLights(rain, day, smooth((t - 1.2) / 1.8), blended)); tourView("family"); }
      else { setLights(blendLights(day, night, smooth((t - 4.5) / 1.5), blended)); tourView("tech"); }
      const look = Math.atan2(camera.position.x - robotPivot.position.x, camera.position.z - robotPivot.position.z);
      const turn = t < 5 ? 0 : t < 5.6 ? smooth((t - 5) / .6) : t < 6.8 ? 1 : 1 - smooth((t - 6.8) / .6);
      robotPivot.rotation.y = robotHome.r + (look - robotHome.r) * turn;
      render();
      if (t < 8) run.frame = requestAnimationFrame(step);
      else stopDirector();
    };
    run.frame = requestAnimationFrame(step);
  }
  // a quiet easter egg: tap the little robot and it hops, turns to look at you, then turns back.
  // Only a tap counts (a drag to turn the room does not); with reduced motion it just turns to look.
  const ray = new THREE.Raycaster(), tap = new THREE.Vector2(), robotHome = { y: robotPivot.position.y, r: robotPivot.rotation.y };
  let downAt = null, hopping = false, hopRun = 0, suppressTap = false;
  renderer.domElement.addEventListener("pointerdown", (e) => {
    if (director) { suppressTap = true; stopDirector(); downAt = null; return; }
    downAt = [e.clientX, e.clientY];
  });
  renderer.domElement.addEventListener("pointerup", (e) => {
    if (suppressTap) { suppressTap = false; return; }
    if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6 || hopping) return;
    const r = renderer.domElement.getBoundingClientRect();
    tap.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(tap, camera);
    if (!ray.intersectObject(robotObj, true).length) return;
    hopping = true;
    const hop = ++hopRun;
    const look = Math.atan2(camera.position.x - robotPivot.position.x, camera.position.z - robotPivot.position.z); // the robot faces +z
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, t0 = performance.now(), T = 1400;
    const step = (now) => {
      if (hop !== hopRun) return;
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
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { if (director) stopDirector(); else if (directorPreparing) cancelPreparation(); } });
  function loop() { if (controls.update()) { render(); requestAnimationFrame(loop); } else { render(); looping = false; } }
  controls.addEventListener("start", () => { if (!looping) { looping = true; requestAnimationFrame(loop); } });
  controls.addEventListener("change", () => {
    const offset = camera.position.clone().sub(orbitCenter);
    viewTheta = Math.atan2(offset.x, offset.z);
    if (Math.sin(viewTheta) < -.45) { void loadDoorTexture(); void loadRightWallArt(); } // turning toward the right-hand wall
    const toWindow = Math.abs(Math.atan2(Math.sin(viewTheta), Math.cos(viewTheta)));
    const toTv = Math.abs(Math.atan2(Math.sin(viewTheta - Math.PI), Math.cos(viewTheta - Math.PI)));
    currentView = toTv < toWindow ? "tv" : "window";
    if (!looping) render();
  });
  new ResizeObserver(() => { if (director) stopDirector(false); if (directorPreparing) cancelPreparation(); fit(); render(); }).observe(stage);
  phoneActions.addEventListener("change", () => drawPanel());
  // Hall stand in the front-left corner: walnut pole, brass hooks, a warm white stone base.
  // The scanned coat was one 60,000-triangle mesh. Cloth triangles reached 25 cm and the pole
  // reached 73 cm, so the coat came apart into shards. The pole was torn the same way, so the
  // stand is built from plain shapes instead of that file. A red knit scarf hangs on one hook.
  // The baseball cap is not part of the stand. No extra lamp.
  // Real-world sizes: stand about 1.78 m, wood pole 3.1–3.5 cm across, six hooks about 12 cm
  // long with the crown at 1.65 m. The scarf is about 1.6 m by 25 cm and 1 cm thick, each tail
  // dropping about 80 cm.
  const STAND_BASE_R = .205, STAND_DISC_H = .036;
  function knitTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 64; canvas.height = 96;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#9c3034";
    ctx.fillRect(0, 0, 64, 96);
    for (let y = 2; y < 96; y += 6) {
      for (let x = 2; x < 64; x += 6) {
        ctx.fillStyle = ((x + y) / 6) % 2 ? "#b84a4c" : "#7c2428";
        ctx.beginPath();
        ctx.ellipse(x, y, 2.1, 1.3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 9);
    tex.anisotropy = 4;
    return tex;
  }
  // Warm Carrara: mostly #ECE8E1, with a few thin grey wisps. One 1024 tile covers the
  // whole disc, so the same veins can walk off the top and down the rounded rim.
  function carraraTextures() {
    const size = 1024;
    const albedo = document.createElement("canvas");
    albedo.width = albedo.height = size;
    const actx = albedo.getContext("2d", { willReadFrequently: true });
    const pixels = actx.createImageData(size, size);
    const roughCanvas = document.createElement("canvas");
    roughCanvas.width = roughCanvas.height = size;
    const rctx = roughCanvas.getContext("2d", { willReadFrequently: true });
    const roughPx = rctx.createImageData(size, size);
    const color = pixels.data, rough = roughPx.data;
    const hash2 = (ix, iy) => {
      let n = Math.imul(ix, 374761393) + Math.imul(iy, 668265263);
      n = Math.imul(n ^ (n >>> 13), 1274126177);
      return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
    };
    const fade = (t) => t * t * (3 - 2 * t);
    const noise = (x, y) => {
      const x0 = Math.floor(x), y0 = Math.floor(y);
      const tx = fade(x - x0), ty = fade(y - y0);
      const a = hash2(x0, y0), b = hash2(x0 + 1, y0), c = hash2(x0, y0 + 1), d = hash2(x0 + 1, y0 + 1);
      return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
    };
    const fbm = (x, y) => noise(x, y) * .55 + noise(x * 2.03 + 1.7, y * 2.03) * .3 + noise(x * 4.07 + 3.1, y * 4.07) * .15;
    const clampByte = (v) => v < 0 ? 0 : v > 255 ? 255 : v;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const wx = fbm(x * .0035 + 2.2, y * .0035);
        const wy = fbm(x * .0035 + 8.4, y * .0035 + 3.7);
        const field = fbm(x * .009 + wy * 7.5, y * .009 + wx * 7.5);
        const region = fbm(x * .0024 + 14, y * .0024 + 2);
        const mask = Math.max(0, (region - .46) / .42);
        const vein = Math.exp(-(field - .5) * (field - .5) * 260) * mask;
        const wispField = fbm(x * .016 + wx * 4 + 20, y * .014 + wy * 4);
        const wisp = Math.exp(-(wispField - .58) * (wispField - .58) * 520) * Math.max(0, region - .52);
        const cloud = (fbm(x * .006, y * .006) - .5) * 7;
        const fine = (noise(x * .28, y * .28) - .5) * 3.5;
        const shade = vein * 36 + wisp * 18;
        color[i] = clampByte(236 + cloud + fine - shade * 1.05);
        color[i + 1] = clampByte(232 + cloud * .9 + fine * .85 - shade * .95);
        color[i + 2] = clampByte(225 + cloud * .8 + fine * .7 - shade * .72);
        color[i + 3] = 255;
        let nr = .3 + (fine / 3.5) * .02 + vein * .03;
        if (nr < .25) nr = .25;
        if (nr > .35) nr = .35;
        const g = (nr * 255 + .5) | 0;
        rough[i] = rough[i + 1] = rough[i + 2] = g;
        rough[i + 3] = 255;
      }
    }
    actx.putImageData(pixels, 0, 0);
    rctx.putImageData(roughPx, 0, 0);
    const map = new THREE.CanvasTexture(albedo);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
    map.wrapS = map.wrapT = THREE.ClampToEdgeWrapping;
    const roughnessMap = new THREE.CanvasTexture(roughCanvas);
    roughnessMap.colorSpace = THREE.LinearSRGBColorSpace;
    roughnessMap.anisotropy = 8;
    roughnessMap.wrapS = roughnessMap.wrapT = THREE.ClampToEdgeWrapping;
    return { map, roughnessMap };
  }
  function walnutMaps() {
    const w = 48, h = 128;
    const color = document.createElement("canvas");
    color.width = w; color.height = h;
    const ctx = color.getContext("2d", { willReadFrequently: true });
    const img = ctx.createImageData(w, h);
    const roughCanvas = document.createElement("canvas");
    roughCanvas.width = w; roughCanvas.height = h;
    const rctx = roughCanvas.getContext("2d", { willReadFrequently: true });
    const rimg = rctx.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const wave = Math.sin(x * .55 + Math.sin(y * .09) * 2.4);
        const pore = Math.sin(y * .85 + x * .15);
        const i = (y * w + x) * 4;
        img.data[i] = Math.max(0, Math.min(255, 108 + wave * 16 + pore * 5));
        img.data[i + 1] = Math.max(0, Math.min(255, 68 + wave * 11 + pore * 3));
        img.data[i + 2] = Math.max(0, Math.min(255, 38 + wave * 6 + pore * 2));
        img.data[i + 3] = 255;
        const roughV = Math.round(Math.max(.4, Math.min(.72, .5 + (1 - wave) * .06 + pore * .02)) * 255);
        rimg.data[i] = rimg.data[i + 1] = rimg.data[i + 2] = roughV;
        rimg.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    rctx.putImageData(rimg, 0, 0);
    const map = new THREE.CanvasTexture(color);
    map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(1, 3);
    map.anisotropy = 4;
    const roughnessMap = new THREE.CanvasTexture(roughCanvas);
    roughnessMap.colorSpace = THREE.LinearSRGBColorSpace;
    roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
    roughnessMap.repeat.set(1, 3);
    roughnessMap.anisotropy = 4;
    return { map, roughnessMap };
  }
  function variedRoughness(span) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 32;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const img = ctx.createImageData(32, 32);
    for (let i = 0; i < 32 * 32; i++) {
      const n = Math.sin((i + 3) * 12.9898) * 43758.5453;
      const f = n - Math.floor(n);
      const g = Math.round((1 - span / 2 + f * span) * 255);
      const o = i * 4;
      img.data[o] = img.data[o + 1] = img.data[o + 2] = g;
      img.data[o + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.LinearSRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }
  // Thick disc, bullnose edge, then a short turned collar the pole sits in.
  function roundedBaseProfile() {
    const R = STAND_BASE_R, H = STAND_DISC_H, e = .011;
    const collarR = .046, neck = .015, collarTop = H + .02;
    const pts = [new THREE.Vector2(.002, 0), new THREE.Vector2(R - e, 0)];
    const pushArc = (cx, cy, radius, a0, a1, steps) => {
      for (let i = 1; i <= steps; i++) {
        const a = a0 + (a1 - a0) * (i / steps);
        pts.push(new THREE.Vector2(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius));
      }
    };
    pushArc(R - e, e, e, -Math.PI / 2, 0, 5);
    pts.push(new THREE.Vector2(R, H - e));
    pushArc(R - e, H - e, e, 0, Math.PI / 2, 5);
    pts.push(new THREE.Vector2(R * .62, H + .0012));
    pts.push(new THREE.Vector2(collarR + .012, H + .0018));
    pts.push(new THREE.Vector2(collarR + .004, H + .005));
    pts.push(new THREE.Vector2(collarR, H + .01));
    pts.push(new THREE.Vector2(collarR, collarTop - .004));
    pts.push(new THREE.Vector2(collarR - .004, collarTop));
    pts.push(new THREE.Vector2(neck + .005, collarTop));
    pts.push(new THREE.Vector2(neck, collarTop - .003));
    pts.push(new THREE.Vector2(neck, H + .006));
    return pts;
  }
  function weightedBaseGeometry() {
    const geo = new THREE.LatheGeometry(roundedBaseProfile(), 56);
    const pos = geo.attributes.position, uv = geo.attributes.uv;
    geo.computeVertexNormals();
    // Unfold the top, the bullnose, and the collar into one radial patch. Walking
    // down the rim adds the vertical run to the radius, so a vein keeps its width.
    const H = STAND_DISC_H, span = (STAND_BASE_R + .06) * 2;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const r = Math.hypot(x, z) || 1e-6;
      const uRadius = r + Math.max(0, H - y) + Math.max(0, y - H);
      uv.setXY(i, .5 + (x / r) * uRadius / span, .5 + (z / r) * uRadius / span);
    }
    uv.needsUpdate = true;
    return geo;
  }
  // Two tails over the hook. u = -1 and +1 are the hems; the middle rests on the hook.
  function scarfCenterline() {
    const pts = [];
    for (let i = 0; i <= 28; i++) {
      const u = i / 28 * 2 - 1;
      const au = Math.abs(u);
      const drop = au < .07 ? 0 : Math.pow((au - .07) / .93, 1.06) * .80;
      const y = .01 - drop;
      const x = .098 + au * .02 + Math.sin(au * Math.PI) * .012;
      const z = Math.sin(u * Math.PI * 2) * .03 * (.3 + au);
      pts.push(new THREE.Vector3(x, y, z));
    }
    return pts;
  }
  // Width is split so a soft fold can run down the middle, and the cloth has a real 1 cm edge.
  function knitScarf(points, width, thick, along, across) {
    const curve = new THREE.CatmullRomCurve3(points);
    const positions = [], uvs = [], indices = [];
    const ht = thick / 2, cols = across + 1, layers = 2;
    for (let i = 0; i <= along; i++) {
      const t = i / along;
      const p = curve.getPoint(t);
      const tan = curve.getTangent(t);
      const up = Math.abs(tan.y) > .92 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
      const side = new THREE.Vector3().crossVectors(tan, up).normalize();
      const bin = new THREE.Vector3().crossVectors(side, tan).normalize();
      for (let j = 0; j < cols; j++) {
        const f = j / across;
        const s = (f - .5) * width;
        const fold = Math.sin(t * Math.PI * 4.5) * Math.sin(f * Math.PI) * .016 + Math.sin(t * Math.PI * 2.1 + .5) * .007;
        const cx = p.x + side.x * s + bin.x * fold;
        const cy = p.y + side.y * s + bin.y * fold;
        const cz = p.z + side.z * s + bin.z * fold;
        for (let layer = 0; layer < layers; layer++) {
          const sign = layer === 0 ? 1 : -1;
          positions.push(cx + bin.x * sign * ht, cy + bin.y * sign * ht, cz + bin.z * sign * ht);
          uvs.push(f, t * 4);
        }
      }
    }
    const stride = cols * layers;
    const at = (i, j, layer) => i * stride + j * layers + layer;
    for (let i = 0; i < along; i++) {
      for (let j = 0; j < across; j++) {
        for (let layer = 0; layer < layers; layer++) {
          const a = at(i, j, layer), b = at(i, j + 1, layer), c = at(i + 1, j, layer), d = at(i + 1, j + 1, layer);
          if (layer === 0) indices.push(a, c, b, b, c, d);
          else indices.push(a, b, c, b, d, c);
        }
      }
    }
    const link = (a, b, c, d) => indices.push(a, c, b, b, c, d);
    for (let i = 0; i < along; i++) {
      link(at(i, 0, 0), at(i, 0, 1), at(i + 1, 0, 0), at(i + 1, 0, 1));
      link(at(i, across, 1), at(i, across, 0), at(i + 1, across, 1), at(i + 1, across, 0));
    }
    for (let j = 0; j < across; j++) {
      link(at(0, j, 1), at(0, j, 0), at(0, j + 1, 1), at(0, j + 1, 0));
      link(at(along, j, 0), at(along, j, 1), at(along, j + 1, 0), at(along, j + 1, 1));
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    geo.userData.along = along;
    geo.userData.across = across;
    geo.userData.samples = curve.getPoints(48);
    return geo;
  }
  function standPart(geo, mat, name, parent) {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function buildHallStand() {
    const group = new THREE.Group();
    group.name = "hall-stand";
    const wood = walnutMaps();
    const walnut = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 1, metalness: .04, map: wood.map, roughnessMap: wood.roughnessMap });
    standBrass = new THREE.MeshStandardMaterial({ color: "#c4a15a", roughness: .42, metalness: .86, roughnessMap: variedRoughness(.14) });
    const stone = carraraTextures();
    standBaseMat = new THREE.MeshPhysicalMaterial({
      color: "#ffffff", map: stone.map, roughnessMap: stone.roughnessMap,
      roughness: 1, metalness: 0, clearcoat: .1, clearcoatRoughness: .5,
    });
    standScarfMat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .96, metalness: 0, side: THREE.DoubleSide, map: knitTexture() });
    const baseMesh = standPart(weightedBaseGeometry(), standBaseMat, "hall-stand-base", group);
    baseMesh.position.y = .001;
    const pole = standPart(new THREE.CylinderGeometry(.0155, .0175, 1.68, 24), walnut, "hall-stand-pole", group);
    pole.position.y = .87;
    const finial = standPart(new THREE.SphereGeometry(.034, 20, 14), walnut, "hall-stand-finial", group);
    finial.position.y = 1.746;
    const HOOK_Y = 1.65;
    const collar = standPart(new THREE.CylinderGeometry(.032, .032, .026, 20), standBrass, "hall-stand-collar", group);
    collar.position.y = HOOK_Y;
    const hookCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(.01, 0, 0), new THREE.Vector3(.04, .014, 0), new THREE.Vector3(.078, .01, 0),
      new THREE.Vector3(.108, -.012, 0), new THREE.Vector3(.086, -.04, 0),
    ]);
    const hookGeo = new THREE.TubeGeometry(hookCurve, 16, .0055, 8, false);
    hookGeo.userData.samples = hookCurve.getPoints(24);
    const tipGeo = new THREE.SphereGeometry(.008, 12, 8);
    const addHook = (angle, kind) => {
      const pivot = new THREE.Group();
      pivot.position.y = HOOK_Y;
      pivot.rotation.y = angle;
      pivot.name = kind ? `hall-stand-${kind}-hook` : "hall-stand-spare-hook";
      standPart(hookGeo, standBrass, "hall-stand-hook", pivot);
      const tip = standPart(tipGeo, standBrass, "hall-stand-hook-tip", pivot);
      tip.position.set(.086, -.04, 0);
      if (kind === "scarf") {
        const scarfWidth = .25, scarfThick = .01;
        const scarf = standPart(knitScarf(scarfCenterline(), scarfWidth, scarfThick, 40, 5), standScarfMat, "hall-stand-scarf", pivot);
        scarf.castShadow = true;
      }
      group.add(pivot);
    };
    const scarfAngle = .45;
    for (let i = 0; i < 6; i++) addHook(scarfAngle + i * Math.PI * 2 / 6, i === 0 ? "scarf" : null);
    group.position.set(-2.16, 0, 1.86);
    group.rotation.y = .55;
    const wallX = -W / 2 + .08, frontZ = FRONT - .24, pastPainting = 1.62;
    for (let i = 0; i < 6; i++) {
      group.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(group);
      let moved = false;
      if (box.min.x < wallX) { group.position.x += wallX - box.min.x; moved = true; }
      if (box.max.z > frontZ) { group.position.z -= box.max.z - frontZ; moved = true; }
      if (box.min.z < pastPainting) { group.position.z += pastPainting - box.min.z; moved = true; }
      if (!moved) break;
    }
    scene.add(group);
    standGroup = group;
    group.updateMatrixWorld(true);
    const base = new THREE.Box3().setFromObject(group.getObjectByName("hall-stand-base"));
    const radius = Math.max(base.max.x - base.min.x, base.max.z - base.min.z) / 2;
    const contactTex = (() => {
      const size = 256, canvas = document.createElement("canvas"); canvas.width = canvas.height = size;
      const ctx = canvas.getContext("2d");
      const cx = size / 2;
      const g = ctx.createRadialGradient(cx, cx, cx * .58, cx, cx, cx);
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(.62, "rgba(255,255,255,.03)");
      g.addColorStop(.74, "rgba(255,255,255,.58)");
      g.addColorStop(.84, "rgba(255,255,255,.28)");
      g.addColorStop(.94, "rgba(255,255,255,.08)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
      const img = ctx.getImageData(0, 0, size, size), data = img.data;
      for (let i = 0; i < data.length; i += 4) {
        const n = Math.sin((i + 11) * 12.9898) * 43758.5453;
        const wobble = ((n - Math.floor(n)) - .5) * 16;
        const v = Math.max(0, Math.min(255, data[i] + wobble));
        data[i] = data[i + 1] = data[i + 2] = v;
      }
      ctx.putImageData(img, 0, 0);
      const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; return tex;
    })();
    standContact = new THREE.Mesh(new THREE.CircleGeometry(radius * 1.36, 48), new THREE.MeshBasicMaterial({ map: contactTex, color: "#6a6258", transparent: true, depthWrite: false, opacity: .18, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }));
    standContact.name = "hall-stand-contact";
    standContact.rotation.x = -Math.PI / 2;
    standContact.position.set((base.min.x + base.max.x) / 2, .003, (base.min.z + base.max.z) / 2);
    scene.add(standContact);
    const wallTex = (() => {
      const canvas = document.createElement("canvas"); canvas.width = 64; canvas.height = 128;
      const ctx = canvas.getContext("2d");
      const g = ctx.createRadialGradient(32, 90, 4, 32, 78, 40);
      g.addColorStop(0, "rgba(255,255,255,.7)"); g.addColorStop(.55, "rgba(255,255,255,.2)"); g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 128);
      const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; return tex;
    })();
    standWall = new THREE.Mesh(new THREE.PlaneGeometry(.22, 1.35), new THREE.MeshBasicMaterial({ map: wallTex, color: "#2e261c", transparent: true, depthWrite: false, opacity: .28, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    standWall.name = "hall-stand-wall-shadow";
    standWall.rotation.y = Math.PI / 2;
    standWall.position.set(-W / 2 + .02, .72, group.position.z);
    scene.add(standWall);
    setLights(shown || lights());
  }
  function frameHallStand(kind = "room") {
    if (!standGroup) return null;
    intro = false;
    if (director) stopDirector(false);
    const box = new THREE.Box3().setFromObject(standGroup), center = box.getCenter(new THREE.Vector3());
    if (kind === "room") {
      const eye = new THREE.Vector3(.15, 1.42, .35);
      const focus = new THREE.Vector3(-1.85, 1.05, 1.55);
      camera.position.copy(eye); camera.lookAt(focus); controls.target.copy(focus); render();
      return { eye: eye.toArray(), focus: focus.toArray() };
    }
    if (kind === "scale") {
      // The round base (about 41 cm across, 3.6 cm thick) sits in the same frame as the scarf hem,
      // so the cloth width and the drape can be compared with a part whose size is already fixed.
      const scarfBox = new THREE.Box3().setFromObject(standGroup.getObjectByName("hall-stand-scarf"));
      const baseBox = new THREE.Box3().setFromObject(standGroup.getObjectByName("hall-stand-base"));
      const low = baseBox.min.y - .06;
      const high = scarfBox.min.y + .32;
      const baseCenter = baseBox.getCenter(new THREE.Vector3());
      const scarfCenter = scarfBox.getCenter(new THREE.Vector3());
      const focus = new THREE.Vector3(baseCenter.x * .6 + scarfCenter.x * .4, (low + high) / 2, baseCenter.z * .55 + scarfCenter.z * .45);
      const spanY = high - low;
      const spanX = Math.max(baseBox.max.x - baseBox.min.x, scarfBox.max.x - scarfBox.min.x) + .16;
      const vFov = THREE.MathUtils.degToRad(camera.fov);
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * Math.max(camera.aspect, .4));
      const dist = Math.max((spanY / 2) / Math.tan(vFov / 2), (spanX / 2) / Math.tan(hFov / 2)) * 1.06;
      const eye = new THREE.Vector3(focus.x + dist * .7, focus.y + spanY * .02, focus.z - dist * .46);
      camera.position.copy(eye); camera.lookAt(focus); controls.target.copy(focus); render();
      return { eye: eye.toArray(), focus: focus.toArray() };
    }
    const narrow = camera.aspect < .8;
    const shot = { close: [.55, .12, .42, 1.35], base: narrow ? [.3, .13, .22, .045] : [.46, .2, .34, .05] }[kind] || [.55, .12, .42, 1.35];
    const focus = new THREE.Vector3(center.x, shot[3], center.z);
    const eye = new THREE.Vector3(center.x + shot[0], shot[3] + shot[1], center.z - shot[2]);
    camera.position.copy(eye); camera.lookAt(focus); controls.target.copy(focus); render();
    return { eye: eye.toArray(), focus: focus.toArray() };
  }
  buildHallStand();

  fit(); apply();
  // Let the first room frame paint before the optional TV materials request any image bytes.
  if (requestedView === "tv") { void loadTvWallTextures(); void loadDoorTexture(); }
  // on entering, the camera drifts gently within the room (1.8 s). Skipped with reduced motion; a drag or a test view stops it.
  intro = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (intro) {
    const end = camera.position.clone(), from = end.clone().add(new THREE.Vector3(-.28, .18, 0)), t0 = performance.now();
    introEnd = end;
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
    setLang(l) { state.lang = l; showBoardLanguage(l); renderer.domElement.setAttribute("aria-label", TEXT[l].canvas); showDirectorStop(); drawPanel(); },
    set(k, v) { choose(k, v); }, // used by tests
    scheduleTvWallTextures() {
      const loadWallMaterials = () => { void loadTvWallTextures(); void loadDoorTexture(); void loadConsoleDecor(); void loadRightWallArt(); void loadLeftWallArt(); };
      const loadWhenIdle = () => {
        if (document.visibilityState !== "visible") { document.addEventListener("visibilitychange", loadWhenIdle, { once: true }); return; }
        if ("requestIdleCallback" in window) window.requestIdleCallback(loadWallMaterials, { timeout: 2500 });
        else setTimeout(loadWallMaterials, 1500);
      };
      requestAnimationFrame(() => requestAnimationFrame(loadWhenIdle));
    },
    postcard, // used by tests: returns the postcard canvas
    cam: () => camera.position.toArray().map((v) => +v.toFixed(2)), // used by tests: where the camera is
    fov: () => camera.fov,
    fovProjectionUpdates: () => fovProjectionUpdates,
    // QA only: draw one frame at a chosen fov without the yaw blend, so 74° and 76° can be compared.
    paintFov(value) { camera.fov = value; camera.updateProjectionMatrix(); renderer.render(scene, camera); return camera.fov; },
    plaqueView() {
      scene.updateMatrixWorld(true);
      const center = new THREE.Vector3();
      plaque.getWorldPosition(center);
      const caster = new THREE.Raycaster(camera.position.clone(), center.clone().sub(camera.position).normalize());
      let firstHit = null, firstDistance = Infinity;
      scene.traverse((obj) => {
        if (!obj.isMesh) return;
        const hit = caster.intersectObject(obj, false)[0];
        if (hit && hit.distance < firstDistance) { firstDistance = hit.distance; firstHit = obj.name || obj.type; }
      });
      const corners = [[-.35, -.14], [.35, -.14], [-.35, .14], [.35, .14]].map(([x, y]) => {
        const p = new THREE.Vector3(x, y, 0).applyMatrix4(plaque.matrixWorld).project(camera);
        return { x: p.x, y: p.y, z: p.z };
      });
      return { firstHit, corners };
    },
    angle() { const degrees = Math.atan2(camera.position.x - orbitCenter.x, camera.position.z - orbitCenter.z) * 180 / Math.PI; return (Math.round(degrees) + 360) % 360; },
    setOrbitAngle(degrees) { intro = false; viewTheta = degrees * Math.PI / 180; setCameraAngle(viewTheta); return camera.position.toArray(); },
    hasFrontWall: () => !!scene.getObjectByName("front-wall"),
    hasTvWall: () => !!scene.getObjectByName("tv-screen") && !!scene.getObjectByName("tv-console"),
    loadConsoleDecor,
    shelfDecor() { // read-only QA: real object bounds against shelf openings, boards and light strips
      scene.updateMatrixWorld(true);
      const objects = shelfDecor.children.map((obj) => {
        const box = new THREE.Box3().setFromObject(obj);
        const x = obj.userData.bay.startsWith("left") ? 1.82 : -1.82;
        const fits = box.min.x > x - .25 && box.max.x < x + .25 && box.min.z > FRONT - .1575 && box.max.z < FRONT - .045;
        const supported = Math.abs(box.min.y - obj.userData.supportY) < .0001;
        const rowTop = obj.userData.supportY + .54 - .035;
        return { name: obj.name, bay: obj.userData.bay, min: box.min.toArray(), max: box.max.toArray(), depth: box.max.z - box.min.z,
          fits: fits && box.max.y < rowTop, supported };
      });
      const boxes = shelfDecor.children.map((obj) => ({ name: obj.name, box: new THREE.Box3().setFromObject(obj) }));
      const overlaps = boxes.flatMap((a, i) => boxes.slice(i + 1).filter((b) => a.box.intersectsBox(b.box)).map((b) => [a.name, b.name]));
      return { ready: shelfDecorReady, art: shelfArtFile, objects, overlaps };
    },
    loadRightWallArt,
    rightWallArt() { // read-only QA: frame clearance, responsive image, local glow and projected artwork bounds
      if (!rightWallArtGroup) return { ready: false, loaded: false, built: false };
      scene.updateMatrixWorld(true);
      const bounds = (obj) => { const box = new THREE.Box3().setFromObject(obj); return { min: box.min.toArray(), max: box.max.toArray() }; };
      const painting = rightWallArtGroup.getObjectByName("right-wall-painting");
      const corners = [[-.6, -.4], [.6, -.4], [-.6, .4], [.6, .4]].map(([x, y]) => new THREE.Vector3(x, y, 0).applyMatrix4(painting.matrixWorld).project(camera));
      const rect = renderer.domElement.getBoundingClientRect();
      const xs = corners.map((p) => (p.x + 1) * rect.width / 2), ys = corners.map((p) => (1 - p.y) * rect.height / 2);
      const box = new THREE.Box3().setFromObject(rightWallArtGroup);
      return { built: true, ready: rightWallArtReady, loaded: rightWallArtLoaded,
        file: rightPaintingMat.map?.image?.src?.split("/").pop() ?? null,
        size: [rightPaintingMat.map?.image?.width ?? 0, rightPaintingMat.map?.image?.height ?? 0],
        bounds: bounds(rightWallArtGroup), painting: bounds(painting),
        fixture: bounds(rightWallArtGroup.getObjectByName("right-wall-picture-light")),
        glow: rightArtWallWash.opacity,
        screenRect: { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) },
        collisions: Object.entries({ door: roomDoor, sideTable: tableObj, tableLamp: tableLampObj })
          .filter(([, obj]) => box.intersectsBox(new THREE.Box3().setFromObject(obj))).map(([name]) => name),
      };
    },
    loadLeftWallArt,
    leftWallArt() { // read-only QA for the left-wall harbour pair
      if (!leftWallArtGroup) return { ready: false, loaded: false, built: false };
      scene.updateMatrixWorld(true);
      const bounds = (obj) => { const box = new THREE.Box3().setFromObject(obj); return { min: box.min.toArray(), max: box.max.toArray() }; };
      const painting = leftWallArtGroup.getObjectByName("left-wall-painting");
      const corners = [[-.6, -.3375], [.6, -.3375], [-.6, .3375], [.6, .3375]].map(([x, y]) => new THREE.Vector3(x, y, 0).applyMatrix4(painting.matrixWorld).project(camera));
      const rect = renderer.domElement.getBoundingClientRect();
      const xs = corners.map((p) => (p.x + 1) * rect.width / 2), ys = corners.map((p) => (1 - p.y) * rect.height / 2);
      const box = new THREE.Box3().setFromObject(leftWallArtGroup);
      return { built: true, ready: leftWallArtReady, loaded: leftWallArtLoaded,
        file: leftPaintingMat.map?.image?.src?.split("/").pop() ?? null,
        size: [leftPaintingMat.map?.image?.width ?? 0, leftPaintingMat.map?.image?.height ?? 0],
        place: { ...leftWallArtPlace },
        bounds: bounds(leftWallArtGroup), painting: bounds(painting),
        fixture: bounds(leftWallArtGroup.getObjectByName("left-wall-picture-light")),
        glow: leftArtWallWash.opacity,
        spot: leftPictureSpot ? {
          intensity: leftPictureSpot.intensity, castShadow: leftPictureSpot.castShadow,
          color: "#" + leftPictureSpot.color.getHexString(), decay: leftPictureSpot.decay,
          distance: leftPictureSpot.distance, angle: leftPictureSpot.angle, penumbra: leftPictureSpot.penumbra,
          shadowMap: leftPictureSpot.shadow.mapSize.x, bulb: "#" + leftArtDiffuser.emissive.getHexString(),
        } : null,
        screenRect: { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) },
        collisions: Object.entries({ floorLamp: lampObj, plant: plantObj, chair: chairObj, plaque })
          .filter(([, obj]) => box.intersectsBox(new THREE.Box3().setFromObject(obj))).map(([name]) => name),
      };
    },
    consoleDetails() { // local QA only: measured tabletop contacts and inter-object clearance
      scene.updateMatrixWorld(true);
      const old = ["tv-vase-body", "tv-vase-neck", "tv-book-one", "tv-laptop"].map((name) => ({ name, box: new THREE.Box3().setFromObject(scene.getObjectByName(name)) }));
      const bounds = consoleDecor.children.map((obj) => ({ name: obj.name, box: new THREE.Box3().setFromObject(obj) }));
      const collisions = bounds.flatMap((a, i) => [...old, ...bounds.slice(i + 1)].filter((b) => a.box.intersectsBox(b.box)).map((b) => [a.name, b.name]));
      return { ready: consoleDecorLoaded, artLoaded: consoleArtLoaded, artFile: pictureFile(consoleArtTexture), collisions,
        objects: bounds.map(({ name, box }) => ({ name, min: box.min.toArray(), max: box.max.toArray() })) };
    },
    loadDoorTexture,
    frameHallStand,
    hallStand() {
      if (!standGroup) return { ready: false };
      scene.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(standGroup);
      const baseMesh = standGroup.getObjectByName("hall-stand-base");
      baseMesh.geometry.computeBoundingBox();
      const localBase = baseMesh.geometry.boundingBox;
      const diameter = Math.max(localBase.max.x - localBase.min.x, localBase.max.z - localBase.min.z);
      const pos = baseMesh.geometry.attributes.position;
      let maxR = 0, discLow = Infinity, discHigh = -Infinity, collar = false;
      for (let i = 0; i < pos.count; i++) maxR = Math.max(maxR, Math.hypot(pos.getX(i), pos.getZ(i)));
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i), r = Math.hypot(pos.getX(i), pos.getZ(i));
        if (r > maxR * .72) { discLow = Math.min(discLow, y); discHigh = Math.max(discHigh, y); }
        if (y > STAND_DISC_H + .008 && r > .03 && r < .07) collar = true;
      }
      const blockers = { door: roomDoor, sofa: sofaObj, sideTable: tableObj, floorLamp: lampObj, coffee: coffeeObj, plant: plantObj, chair: chairObj, plaque, homeBoard, smartPanel, entrySwitch, vent: climateSlot, leftGallery: leftWallArtGroup, console: scene.getObjectByName("tv-console") };
      const hits = Object.entries(blockers).filter(([, obj]) => obj && box.intersectsBox(new THREE.Box3().setFromObject(obj))).map(([name]) => name);
      scene.traverse((obj) => {
        if (!obj.name?.startsWith("tv-shelf-")) return;
        if (box.intersectsBox(new THREE.Box3().setFromObject(obj))) hits.push(obj.name);
      });
      const clothNames = new Set(["hall-stand-scarf"]);
      let clothEdge = 0, vertices = 0;
      const edgeByName = {};
      const va = new THREE.Vector3(), vb = new THREE.Vector3(), vc = new THREE.Vector3();
      standGroup.traverse((obj) => {
        if (!obj.isMesh) return;
        const pos = obj.geometry.attributes.position;
        vertices += pos.count;
        if (!clothNames.has(obj.name)) return;
        const idx = obj.geometry.index;
        const triCount = idx ? idx.count : pos.count;
        const at = (slot) => idx ? idx.getX(slot) : slot;
        obj.updateWorldMatrix(true, false);
        let edge = 0;
        for (let i = 0; i < triCount; i += 3) {
          va.fromBufferAttribute(pos, at(i)).applyMatrix4(obj.matrixWorld);
          vb.fromBufferAttribute(pos, at(i + 1)).applyMatrix4(obj.matrixWorld);
          vc.fromBufferAttribute(pos, at(i + 2)).applyMatrix4(obj.matrixWorld);
          edge = Math.max(edge, va.distanceTo(vb), vb.distanceTo(vc), vc.distanceTo(va));
        }
        edgeByName[obj.name] = edge;
        clothEdge = Math.max(clothEdge, edge);
      });
      let lightCount = 0;
      scene.traverse((obj) => { if (obj.isLight) lightCount++; });
      const names = [];
      standGroup.traverse((obj) => { if (obj.name) names.push(obj.name); });
      const poleMesh = standGroup.getObjectByName("hall-stand-pole");
      const poleParams = poleMesh.geometry.parameters;
      const hookPivots = [];
      standGroup.traverse((obj) => { if (obj.name === "hall-stand-scarf-hook" || obj.name === "hall-stand-spare-hook") hookPivots.push(obj); });
      const hookMesh = standGroup.getObjectByName("hall-stand-hook");
      const hookSamples = hookMesh.geometry.userData.samples;
      const hookLocalY = hookPivots[0].position.y - poleMesh.position.y;
      const hookT = (hookLocalY + poleParams.height / 2) / poleParams.height;
      const poleRadiusAtHook = poleParams.radiusBottom + (poleParams.radiusTop - poleParams.radiusBottom) * hookT;
      let hookLength = 0;
      for (let i = 1; i < hookSamples.length; i++) {
        const a = hookSamples[i - 1], b = hookSamples[i];
        const ra = Math.hypot(a.x, a.z), rb = Math.hypot(b.x, b.z);
        if (ra < poleRadiusAtHook && rb < poleRadiusAtHook) continue;
        if (ra >= poleRadiusAtHook && rb >= poleRadiusAtHook) { hookLength += a.distanceTo(b); continue; }
        const cut = a.clone().lerp(b, THREE.MathUtils.clamp((poleRadiusAtHook - ra) / ((rb - ra) || 1), 0, 1));
        hookLength += (ra >= poleRadiusAtHook ? a : b).distanceTo(cut);
      }
      const hookHeight = hookPivots.reduce((sum, pivot) => sum + pivot.getWorldPosition(new THREE.Vector3()).y, 0) / hookPivots.length;
      const scarfMesh = standGroup.getObjectByName("hall-stand-scarf");
      const scarfPos = scarfMesh.geometry.attributes.position;
      const scarfAlong = scarfMesh.geometry.userData.along, scarfAcross = scarfMesh.geometry.userData.across;
      const scarfAt = (i, j, layer) => {
        const k = (i * (scarfAcross + 1) + j) * 2 + layer;
        return new THREE.Vector3().fromBufferAttribute(scarfPos, k);
      };
      const scarfWidth = scarfAt(0, 0, 0).distanceTo(scarfAt(0, scarfAcross, 0));
      const scarfThick = scarfAt(Math.floor(scarfAlong / 2), 1, 0).distanceTo(scarfAt(Math.floor(scarfAlong / 2), 1, 1));
      scarfMesh.updateWorldMatrix(true, false);
      const scarfWorld = scarfMesh.geometry.userData.samples.map((p) => p.clone().applyMatrix4(scarfMesh.matrixWorld));
      let scarfLength = 0, scarfTop = 0;
      for (let i = 1; i < scarfWorld.length; i++) scarfLength += scarfWorld[i].distanceTo(scarfWorld[i - 1]);
      scarfWorld.forEach((p, i) => { if (p.y > scarfWorld[scarfTop].y) scarfTop = i; });
      const sideDrop = (pts) => scarfWorld[scarfTop].y - Math.min(...pts.map((p) => p.y));
      const drapeA = sideDrop(scarfWorld.slice(0, scarfTop + 1));
      const drapeB = sideDrop(scarfWorld.slice(scarfTop));
      const measured = {
        poleDiameterTop: poleParams.radiusTop * 2, poleDiameterBottom: poleParams.radiusBottom * 2,
        hookCount: hookPivots.length, hookLength, hookHeight,
        scarfLength, scarfWidth, scarfThick, drapeA, drapeB,
      };
      return {
        ready: true, height: box.max.y - box.min.y, minY: box.min.y, maxY: box.max.y,
        baseDiameter: diameter, bounds: { min: box.min.toArray(), max: box.max.toArray() },
        yaw: standGroup.rotation.y,
        scarfSide: standScarfMat.side,
        scarfRough: standScarfMat.roughness, scarfMetal: standScarfMat.metalness,
        brassMetal: standBrass.metalness,
        baseType: standBaseMat?.type ?? null, baseMetal: standBaseMat?.metalness ?? null,
        baseHasRough: !!standBaseMat?.roughnessMap, baseMapped: !!standBaseMat?.map,
        discHeight: discHigh - discLow, collar, hasCap: names.some((name) => name.includes("cap")),
        measured,
        castShadow: standGroup.getObjectByProperty("castShadow", true)?.castShadow === true,
        contact: !!standContact, wallShadow: !!standWall, collisions: hits, lightCount,
        clothEdge, edgeByName, vertices, names,
        screen: box.getCenter(new THREE.Vector3()).project(camera).toArray(),
      };
    },
    roomDoor() { // read-only QA: actual world bounds, independent of the orbit angle
      scene.updateMatrixWorld(true);
      const bounds = (obj) => { const b = new THREE.Box3().setFromObject(obj); return { min: b.min.toArray(), max: b.max.toArray() }; };
      const box = new THREE.Box3().setFromObject(roomDoor);
      return {
        bounds: bounds(roomDoor), leaf: bounds(doorLeaf), textureLoaded: doorTextureLoaded,
        texture: doorFaceMat.map?.image?.src?.split("/").pop(),
        skirting: doorSkirting.map(bounds),
        collisions: Object.entries({ sofa: sofaObj, sideTable: tableObj, floorLamp: lampObj, coffeeTable: coffeeObj, plant: plantObj, robot: robotObj, chair: chairObj })
          .filter(([, obj]) => box.intersectsBox(new THREE.Box3().setFromObject(obj))).map(([name]) => name),
      };
    },
    tvWallTextures() {
      const meshes = [];
      tvWall.traverse((obj) => {
        if (!obj.isMesh || !obj.userData.tvTexture) return;
        const map = obj.material.map;
        meshes.push({ name: obj.name, file: obj.userData.tvTexture ? `${obj.userData.tvTexture}.webp` : map?.image?.src?.split("/").pop(),
          mapId: map?.uuid, materialId: obj.material.uuid, loaded: !!map?.image?.width,
          repeat: map?.repeat.toArray(), faces: obj.userData.textureFaces,
          size: obj.geometry.parameters, colorSpace: map?.colorSpace, anisotropy: map?.anisotropy });
      });
      return meshes;
    },
    loadTvWallTextures,
    tvWallTexturesReady: () => tvWallTexturesLoaded,
    tvScreen() { return { loaded: tvScreenArtLoaded, file: tvScreenMat.map?.image?.src?.split("/").pop() ?? null, width: tvScreenMat.map?.image?.width ?? 0, height: tvScreenMat.map?.image?.height ?? 0, brightness: tvScreenMat.color.r }; },
    tableLampLighting() {
      scene.updateMatrixWorld(true);
      const source = lampLight.getWorldPosition(new THREE.Vector3());
      const glow = tableHalo.getWorldPosition(new THREE.Vector3());
      let lightCount = 0, closedLampCastsShadow = false;
      scene.traverse((obj) => { if (obj.isLight) lightCount++; });
      tableLampObj.traverse((obj) => { if (obj.isMesh && obj.castShadow) closedLampCastsShadow = true; });
      return {
        source: source.toArray(), halo: glow.toArray(),
        shadeMin: tableShadeBounds.min.toArray(), shadeMax: tableShadeBounds.max.toArray(),
        sourceInsideShade: tableShadeBounds.containsPoint(source),
        closedLampCastsShadow, shadowNear: lampLight.shadow.camera.near, decay: lampLight.decay, lightCount,
      };
    },
    orbitLimits: () => ({ minRadius: controls.minDistance, maxRadius: controls.maxDistance, minAzimuth: controls.minAzimuthAngle, maxAzimuth: controls.maxAzimuthAngle, near: camera.near }),
    renderFrame: () => renderer.info.render.frame,
    view(x, y, z) { intro = false; camera.position.set(x, y, z); controls.update(); render(); },
    homeBoard() {
      scene.updateMatrixWorld(true);
      const bounds = (obj) => { const b = new THREE.Box3().setFromObject(obj); return { min: b.min.toArray(), max: b.max.toArray() }; };
      const box = new THREE.Box3().setFromObject(homeBoard);
      const around = { plant: plantObj, chair: chairObj, floorLamp: lampObj, plaque, sofa: sofaObj, robot: robotObj };
      if (leftWallArtGroup) around.leftArt = leftWallArtGroup;
      const pack = homeBoard.userData.lang;
      return {
        lang: pack, copy: HOME_BOARD_COPY[pack],
        file: boardFaceMat.map?.image?.src?.split("/").pop() ?? null,
        noteFile: noteMeshes[0].material.map?.image?.src?.split("/").pop() ?? null,
        loaded: !!boardFaceMat.map?.image?.width,
        visible: homeBoard.visible, bounds: bounds(homeBoard),
        face: bounds(homeBoard.getObjectByName("home-board-face")),
        markers: homeBoard.children.filter((obj) => obj.name === "home-board-marker").length,
        magnets: homeBoard.children.filter((obj) => obj.name === "home-board-magnet").length,
        notes: noteMeshes.map((mesh) => mesh.userData.note),
        rotation: [homeBoard.rotation.x, homeBoard.rotation.y, homeBoard.rotation.z],
        edges: boardEdgeLean(),
        collisions: Object.entries(around).filter(([, obj]) => box.intersectsBox(new THREE.Box3().setFromObject(obj))).map(([name]) => name),
      };
    },
    frameHomeBoard() {
      intro = false;
      scene.updateMatrixWorld(true);
      const center = new THREE.Vector3();
      homeBoard.getObjectByName("home-board-face").getWorldPosition(center);
      controls.target.copy(center);
      camera.position.set(center.x + 1.58, center.y, center.z);
      camera.lookAt(center);
      controls.update();
      // render() widens fov from the yaw blend. This portrait is a level close-up, so draw it at 42° after that.
      camera.fov = 42;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      return this.homeBoard();
    },
    blessingCouplet() {
      scene.updateMatrixWorld(true);
      const paper = scene.getObjectByName("blessing-couplet-paper");
      const group = scene.getObjectByName("blessing-couplet");
      const box = new THREE.Box3().setFromObject(paper);
      const face = new THREE.Box3().setFromObject(homeBoard.getObjectByName("home-board-face"));
      const size = box.getSize(new THREE.Vector3());
      const blocks = { plaque, plant: plantObj, homeBoard };
      return {
        text: "福杯滿溢",
        file: paper.material.map?.image?.src?.split("/").pop() ?? null,
        loaded: !!paper.material.map?.image?.width,
        pixels: [paper.material.map?.image?.width ?? 0, paper.material.map?.image?.height ?? 0],
        roughness: paper.material.roughness,
        metalness: paper.material.metalness,
        receiveShadow: paper.receiveShadow,
        polygonOffset: scene.getObjectByName("blessing-couplet-shadow")?.material.polygonOffset ?? null,
        width: size.z, height: size.y, depth: size.x,
        top: box.max.y, boardTop: face.max.y,
        gap: face.min.z - box.max.z,
        offWall: box.min.x + W / 2,
        rotation: [group.rotation.x, group.rotation.y, group.rotation.z],
        shadow: !!scene.getObjectByName("blessing-couplet-shadow"),
        collisions: Object.entries(blocks).filter(([, obj]) => box.intersectsBox(new THREE.Box3().setFromObject(obj))).map(([name]) => name),
        bounds: { min: box.min.toArray(), max: box.max.toArray() },
      };
    },
    frameBlessingCouplet(kind = "close") {
      intro = false;
      scene.updateMatrixWorld(true);
      const center = scene.getObjectByName("blessing-couplet-paper").getWorldPosition(new THREE.Vector3());
      const phone = camera.aspect < .8;
      if (kind === "close") {
        camera.position.set(center.x + (phone ? 1.08 : 1.02), center.y, center.z);
        camera.lookAt(center);
        camera.fov = phone ? 48 : 44;
      } else {
        camera.position.set(phone ? -.42 : -.7, 1.48, phone ? .05 : -.15);
        camera.lookAt(-2.55, 1.52, -.62);
        camera.fov = phone ? 56 : 40;
      }
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      return this.blessingCouplet();
    },
    framedPictures() { // read-only QA: one file per framed picture that can be on screen together
      return {
        sofa: pictureFile(printMat.map), console: pictureFile(consoleArtTexture), shelf: shelfArtFile,
        left: pictureFile(leftPaintingMat?.map), right: pictureFile(rightPaintingMat?.map),
        plaque: pictureFile(plaqueTex), window: pictureFile(outMat.map),
      };
    },
    director: () => ({ playing: !!director?.started, elapsed: director?.started ? (performance.now() - director.started) / 1000 : null, view: director?.view, image: outMat.map?.image?.src, stillOpen: directorStillOpen, controlsEnabled: controls.enabled }), // local QA hook
    climate() {
      scene.updateMatrixWorld(true);
      const boxOf = (obj) => new THREE.Box3().setFromObject(obj);
      const pack = (obj) => { const b = boxOf(obj); return { min: b.min.toArray(), max: b.max.toArray(), size: b.getSize(new THREE.Vector3()).toArray() }; };
      const panel = scene.getObjectByName("smart-home-panel");
      const vent = scene.getObjectByName("ceiling-slot-diffuser");
      const switches = scene.getObjectByName("entry-switch-plate");
      const panelBox = boxOf(panel), ventBox = boxOf(vent), switchBox = boxOf(switches), doorBox = boxOf(roomDoor);
      let lightCount = 0, fixtureLights = 0;
      scene.traverse((obj) => { if (obj.isLight) lightCount++; });
      panel.traverse((obj) => { if (obj.isLight) fixtureLights++; });
      vent.traverse((obj) => { if (obj.isLight) fixtureLights++; });
      switches.traverse((obj) => { if (obj.isLight) fixtureLights++; });
      const ndc = (obj) => { const p = obj.getWorldPosition(new THREE.Vector3()).project(camera); return { x: p.x, y: p.y, z: p.z }; };
      const panelCenter = panelBox.getCenter(new THREE.Vector3());
      return {
        panel: pack(panel), vent: pack(vent), switches: pack(switches), lightCount, fixtureLights,
        plaqueClear: !panelBox.intersectsBox(boxOf(plaque)) && !ventBox.intersectsBox(boxOf(plaque)) && !switchBox.intersectsBox(boxOf(plaque)),
        doorClear: !panelBox.intersectsBox(doorBox) && !switchBox.intersectsBox(doorBox),
        frameGap: panelBox.min.z - doorBox.max.z,
        switchGap: switchBox.min.z - panelBox.max.z,
        latchSide: panelCenter.z > doorBox.getCenter(new THREE.Vector3()).z,
        panelNdc: ndc(panel), ventNdc: ndc(vent), switchNdc: ndc(switches),
        emissive: scene.getObjectByName("smart-home-panel-face").material.emissiveIntensity,
      };
    },
    // QA framing only. Does not change orbit limits or add a light.
    frameClimate(kind) {
      intro = false;
      const panelFocus = scene.getObjectByName("smart-home-panel").getWorldPosition(new THREE.Vector3());
      if (kind === "panel") {
        camera.position.set(panelFocus.x - .42, panelFocus.y - .02, panelFocus.z - .06);
        camera.lookAt(panelFocus.x, panelFocus.y, panelFocus.z + .05);
      } else if (kind === "entry") {
        const phone = camera.aspect < .8;
        // Close enough that the 10 cm plate reads, still showing the latch stile beside it.
        const lookZ = panelFocus.z - (phone ? .25 : .40);
        camera.position.set(phone ? 1.55 : 1.35, 1.32, lookZ);
        camera.lookAt(W / 2 - .05, phone ? 1.26 : 1.28, lookZ);
      } else return false;
      camera.updateProjectionMatrix();
      render();
      return true;
    },
  };
}
