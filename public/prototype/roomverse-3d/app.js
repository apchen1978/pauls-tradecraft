// ROOMVERSE 3D: the same soft-furnishing idea as ROOM MODE REMOTE, as a small 3D room you can turn.
// Loaded only after the visitor presses "enter" (index.html), so the portfolio page stays light.
// Furniture: sofa, coffee table, side table, table lamp, floor lamp and plant were drawn as single illustrations, turned into shapes by an
// image-to-3D model, then coloured locally from the same illustrations. Walls, rug, light: drawn by code.
// Built and checked in a local trial first (Desktop CC_3D軟裝房間試作_2026-10-16, README trials 1-8).
import * as THREE from "./vendor/three.module.min.js"; // three.js r160 (MIT), self-hosted: the site loads nothing from other hosts
import { OrbitControls } from "./vendor/OrbitControls.js";
import { GLTFLoader } from "./vendor/GLTFLoader.js";
import { mergeGeometries } from "./vendor/BufferGeometryUtils.js";

export const TEXT = {
  zh: { mood: "感覺", wall: "牆面", rug: "地毯", curtain: "窗簾", print: "掛畫", hint: "拖一下轉動房間，或點「看電視牆」。網址會記住你搭的房間，複製給朋友就能看到同一間。", windowView: "回到窗邊", tvView: "看電視牆", canvas: "3D 軟裝房間，可以拖曳轉動角度", save: "存成明信片", shuffle: "幫我隨機搭一間", director: "看 8 秒房間短片", stop: "停止短片", close: "收起對照", preparing: "短片準備中…", unavailable: "窗景暫時無法載入，請再試一次。", previewTitle: "明信片已準備好", previewLongPress: "長按圖片即可儲存到相簿", previewOpenBrowser: "或點右上角「⋯」選「在瀏覽器開啟」後再按存成明信片", previewClose: "關閉明信片預覽", previewAlt: "ROOMVERSE 3D 明信片", directorPhases: ["雨天暖燈", "白天自然光", "夜晚冷暖光"], directorStill: "同一間房，從雨天的暖燈、白天的自然光，到夜晚的冷暖對照；小機器人最後回頭看你。", directorDone: "短片結束，已回到你原來的房間。", file: "ROOMVERSE-3D-明信片.png", artFile: "ROOMVERSE-3D-插畫明信片.webp" },
  en: { mood: "Feeling", wall: "Wall", rug: "Rug", curtain: "Curtains", print: "Wall print", hint: "Drag to turn the room, or tap ‘Turn to the TV wall’. The address remembers your room, so a copied link opens the same one.", windowView: "Back to the window", tvView: "Turn to the TV wall", canvas: "A 3D living room; drag to turn it", save: "Save as a postcard", shuffle: "Surprise me with a room", director: "Watch the 8-second room tour", stop: "Stop the tour", close: "Close comparison", preparing: "Preparing the tour…", unavailable: "The window view could not load. Please try again.", previewTitle: "Your postcard is ready", previewLongPress: "Press and hold the picture to save it to your photos", previewOpenBrowser: "Or tap “⋯” in the upper-right menu and choose “Open in browser”, then tap Save as a postcard", previewClose: "Close postcard preview", previewAlt: "ROOMVERSE 3D postcard", directorPhases: ["Rain · warm lamps", "Daylight", "Night · warm and cool"], directorStill: "One room: warm lamps on a rainy day, daylight, then a cool-and-warm evening. The little robot turns to greet you at the end.", directorDone: "Tour finished. Your room is back as you left it.", file: "ROOMVERSE-3D-postcard.png", artFile: "ROOMVERSE-3D-illustrated-postcard.webp" },
};
// Short labels for the single-row phone toolbar. The accessible name stays the full phrase above.
const PHONE_BAR = {
  zh: { save: "存成明信片", director: "8秒短片", stop: "停止短片", close: "收起對照", preparing: "準備中" },
  en: { save: "Save postcard", director: "8s tour", stop: "Stop", close: "Close", preparing: "Preparing" },
};
const GUIDE_LINE = { zh: "這扇門後面是 Room 02，推開看看？", en: "Room 02 is behind this door. Take a look?" };
const ROBOT_MOOD_LINES = {
  rain: { zh: "聽雨聲，剛剛好。", en: "The rain sounds just right." },
  family: { zh: "好像聞到晚餐香了。", en: "Feels like dinner is nearly ready." },
  tech: { zh: "安靜一點，靈感來了。", en: "A little quiet, a little inspiration." },
  chic: { zh: "今天的光很有精神。", en: "The light has a little sparkle today." },
  slow: { zh: "慢慢來，也很好。", en: "No rush. This feels good." },
  golden: { zh: "今天的夕陽，正好。", en: "Golden hour, just right." },
  tv: { zh: "今晚的沙發時間開始啦。", en: "Sofa time starts now." },
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
  golden: { zh: "傍晚金色時光", en: "Golden hour",
    why: { zh: "低角度的夕陽把窗影拉長，剛亮起的暖燈讓傍晚更有回家的感覺。", en: "Low golden sunlight stretches the window shadows while newly lit lamps make the evening feel like home." }, hemi: .95, win: 4.8, winCol: "#ffb866", lamp: 2.5, fill: 1.2, out: "#ffd093", exposure: 1.08, floor: .15, glow: .22, sunY: 1.2, shadowRadius: 4 },
  tv: { zh: "追劇夜", en: "Series night",
    why: { zh: "週五晚上，關掉主燈，只留燈帶和一盞暖燈，沙發就是整個世界。", en: "Friday night: ceiling light off, just the warm strips and one lamp; the sofa is the whole world." }, hemi: .62, win: .7, winCol: "#56647f", lamp: 2.5, fill: .55, out: "#c6cad6", exposure: .98, floor: .45, glow: .48 },
};

export async function start({ stage, panel, lang, onReady, arriveFromRoom02 = false }) {
  const compactRender = matchMedia("(max-width: 768px), (max-width: 1024px) and (max-height: 500px)").matches;
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
  let intro = false, introEnd = null, robotBubble = null, arrival = null;
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
    if (!director && !arrival) {
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
  const windowFrameParts = [], curtainParts = [];
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
  // The portal to Room 02: the leaf and handle sit on a pivot at the hinge edge so the door can swing into the room.
  // At rest the pivot is turned 0 and every world position is exactly what it was before.
  const doorSwing = new THREE.Group(); doorSwing.name = "door-swing"; doorSwing.position.set(-.443, 0, 0); roomDoor.add(doorSwing);
  roomDoor.updateMatrixWorld(true);
  for (const m of [doorLeaf, ...["door-handle-plate", "door-handle-stem", "door-handle"].map((n) => roomDoor.getObjectByName(n))]) doorSwing.attach(m);
  const doorReveal = roomDoor.getObjectByName("door-reveal");
  const DOOR_OPEN = .95; // about 54 degrees: wide enough to see through, and clear of the sofa, side table and plant (a test measures it)
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
  const TV_STRIP_GLOW = { rain: .28, family: .18, tech: .08, chic: .2, slow: .13, golden: .16, tv: .82 };
  // A restrained wall-local wash warms the same wall surface without adding another light.
  const TV_WALL_WASH = { rain: .34, family: 0, tech: .35, chic: 0, slow: 0, golden: 0, tv: .4 };
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
  let leftWallSmallPrintGroup = null, leftWallSmallPrintPromise = null, leftWallSmallPrintLoaded = false, leftWallSmallPrintReady = false;
  let leftWallSmallPrintMat = null;
  const leftWallSmallPrintPlace = { x: -W / 2 + .008, y: 1.6225, z: -1.07 };
  const leftWallSmallPrintSize = { w: .5, h: .375 }, leftWallSmallPrintFrame = .02; // 50 × 37.5 cm image; 2 cm oak frame
  const leftWallSmallPrintAsset = "room01-wall-print-v2-botanical-window.webp";
  let leftWallSecondPrintGroup = null, leftWallSecondPrintPromise = null, leftWallSecondPrintLoaded = false, leftWallSecondPrintReady = false;
  let leftWallSecondPrintMat = null;
  const leftWallSecondPrintGap = .16;
  const leftWallSecondPrintPlace = { x: leftWallSmallPrintPlace.x, y: leftWallSmallPrintPlace.y, z: leftWallSmallPrintPlace.z - leftWallSmallPrintSize.w / 2 - leftWallSmallPrintFrame - leftWallSecondPrintGap - leftWallSmallPrintSize.w / 2 - leftWallSmallPrintFrame };
  const leftWallSecondPrintAsset = "room01-wall-print-v2-neighborhood-corner.webp";
  const leftWallArtPlace = { x: -W / 2 + .008, y: 1.5, z: 1 }; // 8 mm off the wall at x=-2.6, same hanging line as the right wall
  const leftPaintSize = { w: 1.2, h: .675 }, leftFrameMargin = .118; // 16:9 picture; the frame adds 5.9 cm on each side
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
      const paintW = leftPaintSize.w, paintH = leftPaintSize.h;
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
      piece(new THREE.BoxGeometry(paintW + leftFrameMargin, paintH + leftFrameMargin, .018), goldShade, 0, 0, .015, "left-wall-frame-backing");
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
      const fetchArt = (attempt) => image(name, false, (texture) => {
        leftPaintingMat.map = texture; leftPaintingMat.emissiveMap = texture;
        leftPaintingMat.color.set("#ffffff"); leftPaintingMat.needsUpdate = true;
        leftWallArtLoaded = true; leftWallArtReady = true;
        updateLeftArtLight(shown ?? lights()); render(); resolve(true);
      }, () => {
        leftWallArtReady = true; render(); if (attempt === 0) resolve(false); // the plain canvas and frame remain usable
        if (attempt < 2) setTimeout(() => fetchArt(attempt + 1), attempt ? 6000 : 2000); // a flaky phone connection gets two quiet retries, so the painting appears without a reload
      })();
      fetchArt(0);
    });
    return leftWallArtPromise;
  }
  function loadLeftWallSmallPrint() {
    if (leftWallSmallPrintPromise) return leftWallSmallPrintPromise;
    leftWallSmallPrintPromise = new Promise((resolve) => {
      const { w, h } = leftWallSmallPrintSize, frame = leftWallSmallPrintFrame;
      leftWallSmallPrintGroup = new THREE.Group(); leftWallSmallPrintGroup.name = "room01-left-wall-small-print";
      leftWallSmallPrintGroup.position.set(leftWallSmallPrintPlace.x, leftWallSmallPrintPlace.y, leftWallSmallPrintPlace.z);
      leftWallSmallPrintGroup.rotation.y = Math.PI / 2; scene.add(leftWallSmallPrintGroup);
      const piece = (geo, mat, x, y, z, name) => {
        const mesh = new THREE.Mesh(geo, mat); mesh.name = name; mesh.position.set(x, y, z);
        mesh.castShadow = false; mesh.receiveShadow = false; leftWallSmallPrintGroup.add(mesh); return mesh;
      };
      const oak = new THREE.MeshStandardMaterial({ color: "#9b774c", roughness: .78, metalness: 0 });
      const outerW = w + frame * 2, outerH = h + frame * 2;
      piece(new THREE.BoxGeometry(outerW, outerH, .018), oak, 0, 0, .014, "room01-left-wall-small-print-backing");
      for (const side of [-1, 1]) {
        piece(new THREE.BoxGeometry(outerW, frame, .018), oak, 0, side * (h + frame) / 2, .023, `room01-left-wall-small-print-frame-horizontal-${side}`);
        piece(new THREE.BoxGeometry(frame, h, .018), oak, side * (w + frame) / 2, 0, .023, `room01-left-wall-small-print-frame-vertical-${side}`);
      }
      leftWallSmallPrintMat = new THREE.MeshStandardMaterial({ color: "#e8dfcc", roughness: .85, metalness: 0 });
      piece(new THREE.PlaneGeometry(w, h), leftWallSmallPrintMat, 0, 0, .024, "room01-left-wall-small-print-image");
      const fetchPoster = (attempt) => {
        const texture = new THREE.TextureLoader().load(new URL(`./art/${leftWallSmallPrintAsset}`, import.meta.url).href, () => {
          texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
          leftWallSmallPrintMat.map = texture; leftWallSmallPrintMat.color.set("#ffffff"); leftWallSmallPrintMat.needsUpdate = true;
          leftWallSmallPrintLoaded = true; leftWallSmallPrintReady = true; render(); resolve(true);
        }, undefined, () => {
          leftWallSmallPrintReady = true; render(); if (attempt === 0) resolve(false);
          if (attempt < 2) setTimeout(() => fetchPoster(attempt + 1), attempt ? 6000 : 2000); // retry a brief network failure without reloading the room
        });
      };
      fetchPoster(0);
    });
    return leftWallSmallPrintPromise;
  }
  function loadLeftWallSecondPrint() {
    if (leftWallSecondPrintPromise) return leftWallSecondPrintPromise;
    leftWallSecondPrintPromise = new Promise((resolve) => {
      const { w, h } = leftWallSmallPrintSize, frame = leftWallSmallPrintFrame;
      leftWallSecondPrintGroup = new THREE.Group(); leftWallSecondPrintGroup.name = "room01-left-wall-second-print";
      leftWallSecondPrintGroup.position.set(leftWallSecondPrintPlace.x, leftWallSecondPrintPlace.y, leftWallSecondPrintPlace.z);
      leftWallSecondPrintGroup.rotation.y = Math.PI / 2; scene.add(leftWallSecondPrintGroup);
      const piece = (geo, mat, x, y, z, name) => {
        const mesh = new THREE.Mesh(geo, mat); mesh.name = name; mesh.position.set(x, y, z);
        mesh.castShadow = false; mesh.receiveShadow = false; leftWallSecondPrintGroup.add(mesh); return mesh;
      };
      const oak = new THREE.MeshStandardMaterial({ color: "#9b774c", roughness: .78, metalness: 0 });
      const outerW = w + frame * 2, outerH = h + frame * 2;
      piece(new THREE.BoxGeometry(outerW, outerH, .018), oak, 0, 0, .014, "room01-left-wall-second-print-backing");
      for (const side of [-1, 1]) {
        piece(new THREE.BoxGeometry(outerW, frame, .018), oak, 0, side * (h + frame) / 2, .023, "room01-left-wall-second-print-frame-horizontal-" + side);
        piece(new THREE.BoxGeometry(frame, h, .018), oak, side * (w + frame) / 2, 0, .023, "room01-left-wall-second-print-frame-vertical-" + side);
      }
      leftWallSecondPrintMat = new THREE.MeshStandardMaterial({ color: "#e8dfcc", roughness: .85, metalness: 0 });
      piece(new THREE.PlaneGeometry(w, h), leftWallSecondPrintMat, 0, 0, .024, "room01-left-wall-second-print-image");
      const fetchPoster = (attempt) => {
        const texture = new THREE.TextureLoader().load(new URL("./art/" + leftWallSecondPrintAsset, import.meta.url).href, () => {
          texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
          leftWallSecondPrintMat.map = texture; leftWallSecondPrintMat.color.set("#ffffff"); leftWallSecondPrintMat.needsUpdate = true;
          leftWallSecondPrintLoaded = true; leftWallSecondPrintReady = true; render(); resolve(true);
        }, undefined, () => {
          leftWallSecondPrintReady = true; render(); if (attempt === 0) resolve(false);
          if (attempt < 2) setTimeout(() => fetchPoster(attempt + 1), attempt ? 6000 : 2000);
        });
      };
      fetchPoster(0);
    });
    return leftWallSecondPrintPromise;
  }
  controls.addEventListener("change", () => {
    const offset = camera.position.clone().sub(orbitCenter);
    if (Math.sin(Math.atan2(offset.x, offset.z)) > .45) {
      void loadLeftWallArt(); // existing harbor art
      void loadLeftWallSmallPrint(); // Room 01 poster is opt-in on the first turn toward this wall
      void loadLeftWallSecondPrint(); // existing neighbourhood-corner print is opt-in on the same turn
    }
  });
  // the view outside changes with the feeling: Codex's paintings of the same street in rain, afternoon sun and night
  // (window/, 1024 x 1536). The window is wider than 2:3, so the picture fills the width and is cropped a little top and bottom.
  const viewLoader = new THREE.TextureLoader();
  const VIEW_FILES = { rain: "rain", family: "family", tech: "tech", chic: "chic", slow: "family", golden: "family", tv: "tech" }; // slow, golden hour and series night reuse existing paintings; golden hour warms the existing daylight view
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
  const frame = (x, y, w, h) => { const part = add(new THREE.BoxGeometry(w, h, .08), wood, x, y, BACK - .02); windowFrameParts.push(part); return part; };
  frame(wx, win.y0, ww + .1, .06); frame(wx, win.y1, ww + .1, .06); frame(win.x0, wy, .06, wh); frame(win.x1, wy, .06, wh); frame(wx, wy, .04, wh); frame(wx, wy + .2, ww, .04);
  const curtainRod = add(new THREE.CylinderGeometry(.015, .015, ww + .9, 12), wood, wx, win.y1 + .2, BACK + .12); curtainRod.rotation.z = Math.PI / 2; windowFrameParts.push(curtainRod);
  const linen = new THREE.MeshStandardMaterial({ color: "#e6ddcc", roughness: 1, side: THREE.DoubleSide, transparent: true, opacity: .93 });
  [win.x0 - .14, win.x1 + .14].forEach((x) => {
    const g = new THREE.PlaneGeometry(.42, win.y1 + .2, 40, 1); const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 46) * .035);
    g.computeVertexNormals(); curtainParts.push(add(g, linen, x, (win.y1 + .2) / 2, BACK + .12));
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
  const rug = add(new THREE.BoxGeometry(2.6, .012, 1.65), rugMat, SX, .006, SZ + .95, false);
  rug.name = "living-room-rug"; rug.rotation.y = .0873; rug.position.z -= .08;
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
  const mugUrl = new URL("./bedroom/models/mug-v1.glb", import.meta.url).href;
  const [sofa, table, floorLamp, coffee, tableLamp, plant, robot, lowChair, laptop, mug] = await Promise.all(["sofa", "side-table", "floor-lamp", "coffee-table", "table-lamp", "plant", "robot", "low-chair", "laptop"].map((f) => loader.loadAsync(base + f + ".glb")).concat(loader.loadAsync(mugUrl)));
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
  // a small low chair (built by code from the side profile of a drawing, so it works without an image-to-3D quota), turned toward the coffee table
  lowChair.scene.rotation.y = Math.PI / 2; // the chair faces +z; turn it to face +x (toward the table)
  const chairObj = place(lowChair, { height: .5, x: SX - 1.0, z: SZ + 1.15 });
  prepare(chairObj, vcol({ roughness: .62 }));
  const coffeeTop = new THREE.Box3().setFromObject(coffeeObj).max.y;
  // the laptop is open on the coffee table with its screen turned toward the orange chair (left), and a little toward the viewer,
  // so it reads as if someone sat down to work here. Its front (keyboard side) faces +z, so -90deg points it at the chair.
  laptop.scene.rotation.y = -Math.PI / 2 + .55;
  const laptopObj = place(laptop, { width: .3, x: SX + .12, z: SZ + 1.2, baseY: coffeeTop });
  laptopObj.name = "coffee-table-laptop";
  prepare(laptopObj, vcol({ roughness: .5 }));
  const mugObj = place(mug, { height: .095, x: SX - .25, z: SZ + 1.25, baseY: coffeeTop });
  mugObj.name = "coffee-table-mug";
  const mugMaterials = new Map();
  prepare(mugObj, (part) => {
    const coffee = /coffee/i.test(part.material.name);
    const key = coffee ? "coffee" : "ceramic";
    if (!mugMaterials.has(key)) mugMaterials.set(key, new THREE.MeshStandardMaterial({ color: coffee ? "#5b3826" : "#f1e5d1", roughness: .42 }));
    return mugMaterials.get(key);
  });
  // Reuse the existing laptop model as the third quiet console prop, alongside the book and vase.
  // No extra download, plant or light; the original coffee-table laptop stays in place.
  const tvLaptopObj = laptopObj.clone(true); tvLaptopObj.rotation.y = Math.PI;
  place({ scene: tvLaptopObj }, { width: .28, x: .02, z: FRONT - .34, baseY: .59 });
  tvLaptopObj.name = "tv-laptop"; tvWall.add(tvLaptopObj);
  const coffeeBook = add(new THREE.BoxGeometry(.26, .05, .18), new THREE.MeshStandardMaterial({ color: "#6d7d68" }), SX - .12, coffeeTop + .025, SZ + 1.02); // a book
  coffeeBook.name = "coffee-table-book";
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
  const awakeEyeColor = eyeMat.color.clone();
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.CircleGeometry(fh * .13, 20), eyeMat);
    const ex = sx * fw * .2; eye.position.set(ex, fh * .05, -bend * ex * ex + .002); screen.add(eye);
  }
  scene.add(screen); robotObj.attach(screen);
  scene.add(sofaObj, tableObj, lampObj, coffeeObj, tableLampObj, plantObj, chairObj, laptopObj, mugObj);
  // ---------- lived-in details, cloth pass 2 (Paul 2026-11-01: the first pass read as boxes — “非常幾何”) ----------
  // The throw is a draped strip: rounded roll over the seat edge, a hanging face with a sag and an uneven hem, alpha-strand fringe.
  // The coffee-table pieces use rounded extrusions (bevelled book covers with a page block, a footed bowl, a rounded remote).
  // No new lights and no new text.
  const softTint = (geometry, hex) => {
    const colour = new THREE.Color(hex), count = geometry.attributes.position.count, a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) colour.toArray(a, i * 3);
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(a, 3));
    return geometry;
  };
  const softMerge = (list) => {
    const merged = new THREE.BufferGeometry();
    if (!list.length) return merged;
    const total = list.reduce((n, part) => n + part.attributes.position.count, 0);
    const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3), col = new Float32Array(total * 3);
    let offset = 0;
    for (const part of list) {
      pos.set(part.attributes.position.array, offset * 3);
      nor.set(part.attributes.normal.array, offset * 3);
      if (part.attributes.color) col.set(part.attributes.color.array, offset * 3);
      else col.fill(1, offset * 3, offset * 3 + part.attributes.position.count * 3);
      offset += part.attributes.position.count;
    }
    merged.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    merged.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
    merged.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    return merged;
  };
  const soft = { throwMesh: null, fringeMesh: null, propMesh: null, suitcaseShell: null, suitcaseHard: null, throwInfo: null, propBounds: [], propInfo: null, suitcaseInfo: null };
  {
    // 2) coffee-table pieces, rounded: two bevelled books with a page block, a footed bowl, a rounded remote.
    const coffeeBox = new THREE.Box3().setFromObject(coffeeObj);
    const occupied = [laptopObj, mugObj, coffeeBook].map((obj) => new THREE.Box3().setFromObject(obj));
    const pad = .012;
    const freeAt = (x, z, hx, hz) => {
      const probe = new THREE.Box3(new THREE.Vector3(x - hx - pad, coffeeTop, z - hz - pad), new THREE.Vector3(x + hx + pad, coffeeTop + .09, z + hz + pad));
      const inside = x - hx > coffeeBox.min.x + .03 && x + hx < coffeeBox.max.x - .03 && z - hz > coffeeBox.min.z + .03 && z + hz < coffeeBox.max.z - .03;
      return inside && !occupied.some((b) => b.intersectsBox(probe));
    };
    const corners = [
      [coffeeBox.max.x - .12, coffeeBox.max.z - .12], [coffeeBox.max.x - .12, coffeeBox.min.z + .12],
      [coffeeBox.min.x + .12, coffeeBox.max.z - .12], [coffeeBox.min.x + .12, coffeeBox.min.z + .12],
      [coffeeBox.max.x - .12, (coffeeBox.min.z + coffeeBox.max.z) / 2], [(coffeeBox.min.x + coffeeBox.max.x) / 2, coffeeBox.max.z - .12],
      [(coffeeBox.min.x + coffeeBox.max.x) / 2, coffeeBox.min.z + .12], [coffeeBox.min.x + .12, (coffeeBox.min.z + coffeeBox.max.z) / 2],
    ];
    const take = (hx, hz) => {
      for (const [x, z] of corners) if (freeAt(x, z, hx, hz)) {
        occupied.push(new THREE.Box3(new THREE.Vector3(x - hx, coffeeTop, z - hz), new THREE.Vector3(x + hx, coffeeTop + .09, z + hz)));
        return [x, z];
      }
      return null;
    };
    const parts = [];
    const put = (geometry, hex, yaw = 0, at = [0, 0, 0]) => {
      if (yaw) geometry.rotateY(yaw);
      geometry.translate(at[0], at[1], at[2]);
      geometry.computeBoundingBox();
      soft.propBounds.push(geometry.boundingBox.clone());
      parts.push(softTint(geometry, hex));
    };
    const slab = (w, d, r, thickness, bevel) => new THREE.ExtrudeGeometry(roundedRectShape(w, d, r), { depth: thickness, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, curveSegments: 4 }).rotateX(-Math.PI / 2);
    const bookSpot = take(.085, .07);
    if (bookSpot) {
      const [bx, bz] = bookSpot;
      put(slab(.175, .135, .010, .020, .0025), 0x64755f, .10, [bx, coffeeTop + .011, bz]);
      put(slab(.160, .123, .008, .016, .002), 0xf1e9d8, .10, [bx + .006, coffeeTop + .029, bz]);
      put(slab(.168, .130, .009, .018, .0022), 0x8b6a4f, -.06, [bx + .004, coffeeTop + .047, bz + .004]);
    }
    const bowlSpot = null, remoteSpot = null; // Paul 2026-11-01: the bowl and the remote were too small to read; the two books stay
    const mergedProps = softMerge(parts);
    if (mergedProps.attributes.position) {
      const propMesh = new THREE.Mesh(mergedProps, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .72, metalness: .02 }));
      propMesh.name = "coffee-table-props"; propMesh.castShadow = true; propMesh.receiveShadow = true;
      scene.add(propMesh); soft.propMesh = propMesh;
    }
    soft.propInfo = {
      coffeeTop: Number(coffeeTop.toFixed(3)),
      bookSpot: bookSpot ? bookSpot.map((v) => Number(v.toFixed(3))) : null,
      bowlSpot: bowlSpot ? bowlSpot.map((v) => Number(v.toFixed(3))) : null,
      remoteSpot: remoteSpot ? remoteSpot.map((v) => Number(v.toFixed(3))) : null,
      coffeeBounds: { min: coffeeBox.min.toArray().map((v) => Number(v.toFixed(3))), max: coffeeBox.max.toArray().map((v) => Number(v.toFixed(3))) },
      vertices: mergedProps.attributes.position ? mergedProps.attributes.position.count : 0,
    };
  }

  // the robot turns around its own centre: hang it on a pivot at its footprint centre
  const rb = new THREE.Box3().setFromObject(robotObj), robotPivot = new THREE.Group();
  robotPivot.position.set((rb.min.x + rb.max.x) / 2, 0, (rb.min.z + rb.max.z) / 2); scene.add(robotPivot); robotPivot.attach(robotObj);
  robotPivot.rotation.y = .5; // turned a little toward the room
  // A second robot stands by the door to Room 02 (the same model, a terracotta belt instead of sage) so a visitor knows the door opens.
  // North of the door, clear of the leaf's swing; it faces into the room, a little towards the door. Tap it for a hint; the door is one tap further.
  const guidePivot = robotPivot.clone(true); guidePivot.name = "door-robot";
  const terracotta = new THREE.Color("#c4704c");
  guidePivot.traverse((m) => {
    if (!m.isMesh || !m.geometry.attributes.color) return;
    m.geometry = m.geometry.clone(); const gc = m.geometry.attributes.color;
    for (let i = 0; i < gc.count; i++) if (Math.hypot(gc.getX(i) - sage.r, gc.getY(i) - sage.g, gc.getZ(i) - sage.b) < .02) gc.setXYZ(i, terracotta.r, terracotta.g, terracotta.b); // the belt is the only sage on the model
    gc.needsUpdate = true;
  });
  guidePivot.position.set(W / 2 - .34, 0, doorZ - .8); guidePivot.rotation.y = -1.3; scene.add(guidePivot);
  const guideHome = { y: guidePivot.position.y, r: guidePivot.rotation.y };
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

  // A real-size 春聯 strip on the left wall, centred in the open plaster between the glass board and the
  // harbour painting's frame (Paul, 2026-10-22). 20 × 70 cm, five millimetres off the plaster, top lined up with the board.
  // The four characters are a baked picture, so the page loads no Chinese font.
  const coupletW = .20, coupletH = .70;
  const couplet = new THREE.Group();
  couplet.name = "blessing-couplet";
  const boardTop = homeBoard.position.y + boardFaceH / 2;
  const boardRoomZ = homeBoard.position.z + boardFaceW / 2; // the board's edge on the painting side
  const artFrameNearZ = leftWallArtPlace.z - (leftPaintSize.w + leftFrameMargin) / 2;
  couplet.position.set(-W / 2, boardTop - coupletH / 2, (boardRoomZ + artFrameNearZ) / 2);
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

  // Low oak sideboard on the left wall under the harbour painting (Paul 2026-10-31: the TV console is full, so the mug and a bulk napkin pack
  // get their own spot). Warm oak like the TV console, two flat doors with a 3 mm reveal and small brass pulls, a top that overhangs 15 mm with a
  // softened edge, and a plinth recessed 30 mm. The carcass back rests on the 20 mm skirting face; the top, above the skirting, reaches the
  // plaster (0.5 mm in). The plinth sinks 2 mm into the floor. Four merged meshes: oak, gilded pulls, the mug and pack, and the vitamin bottle.
  const SIDEBOARD = Object.freeze({ wallX: -W / 2, backX: -W / 2 + .02, depth: .35, z0: .50, z1: 1.42, height: .68, top: .024, overhang: .015, plinthH: .06, plinthInset: .03, floorEmbed: .002, wallEmbed: .0005, reveal: .003, door: .018 });
  const sideboard = (() => {
    const S = SIDEBOARD, len = S.z1 - S.z0, zc = (S.z0 + S.z1) / 2;
    const frontX = S.backX + S.depth - S.overhang; // carcass front; the top and the doors reach past it
    const grain = canvasTex(256, 256, (ctx, w, h) => {
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h);
      for (let k = 0; k < 70; k++) {
        const y = (k * 37.3) % h, a = .025 + ((k * 7919) % 13) / 260;
        ctx.strokeStyle = `rgba(110,72,36,${a})`; ctx.lineWidth = 1 + (k % 3);
        ctx.beginPath(); ctx.moveTo(0, y);
        for (let x = 0; x <= w; x += 16) ctx.lineTo(x, y + Math.sin(x * .03 + k) * 2.4 + Math.sin(x * .011 + k * 3) * 3);
        ctx.stroke();
      }
    });
    grain.wrapS = grain.wrapT = THREE.RepeatWrapping;
    const tint = (geometry, hex) => {
      const c = new THREE.Color(hex), n = geometry.attributes.position.count, a = new Float32Array(n * 3);
      for (let k = 0; k < n; k++) c.toArray(a, k * 3);
      geometry.setAttribute("color", new THREE.Float32BufferAttribute(a, 3)); return geometry;
    };
    const box = (sx, sy, sz, x, y, z, hex) => { const g = tint(new THREE.BoxGeometry(sx, sy, sz), hex); g.translate(x, y, z); return g; };
    const oakParts = [];
    // Plinth: recessed on the front and both ends, 2 mm into the floor.
    const plinthBack = S.backX + .01;
    oakParts.push(box(frontX - S.plinthInset - plinthBack, S.plinthH + S.floorEmbed, len - 2 * S.plinthInset - .02, (plinthBack + frontX - S.plinthInset) / 2, (S.plinthH - S.floorEmbed) / 2, zc, 0x8f6c47));
    // Carcass (sides, back and the dark shadow line behind the door reveals), sitting on the plinth.
    const carcassTop = S.height - S.top;
    oakParts.push(box(frontX - S.backX, carcassTop - S.plinthH, len - .02, (S.backX + frontX) / 2, (S.plinthH + carcassTop) / 2, zc, 0xb48f63));
    oakParts.push(box(.002, carcassTop - S.plinthH - .01, len - .03, frontX + .001, (S.plinthH + carcassTop) / 2, zc, 0x5d4128));
    // Top: a rounded-rectangle slab (4 mm bevel) from the plaster to 15 mm past the doors.
    {
      const tx0 = S.wallX - S.wallEmbed, tx1 = frontX + S.door + S.overhang, bevel = .004;
      const shape = new THREE.Shape(), r = .01, w = tx1 - tx0, d = len;
      shape.moveTo(0, 0); shape.lineTo(w - r, 0); shape.quadraticCurveTo(w, 0, w, r); shape.lineTo(w, d - r); shape.quadraticCurveTo(w, d, w - r, d); shape.lineTo(0, d); shape.lineTo(0, 0);
      const top = new THREE.ExtrudeGeometry(shape, { depth: S.top - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * .75, bevelSegments: 3, curveSegments: 6 });
      top.rotateX(Math.PI / 2); // shape y -> z, extrusion -> -y
      top.computeBoundingBox();
      top.translate(tx0 - top.boundingBox.min.x, S.height - top.boundingBox.max.y, S.z0 - top.boundingBox.min.z);
      const uv = top.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) * 2.2, uv.getY(k) * 2.2);
      oakParts.push(tint(top, 0xc49a68));
    }
    // Two flat doors with a 3 mm reveal between them and around them; the right door's grain runs a touch darker so they do not read as one slab.
    const doorW = (len - .02 - 3 * S.reveal) / 2, doorY0 = S.plinthH + S.reveal, doorY1 = carcassTop - S.reveal;
    const doors = [];
    for (const k of [0, 1]) {
      const z = S.z0 + .01 + S.reveal + doorW / 2 + k * (doorW + S.reveal);
      const g = box(S.door, doorY1 - doorY0, doorW, frontX + S.door / 2, (doorY0 + doorY1) / 2, z, k ? 0xbd956a : 0xc39c70);
      const uv = g.attributes.uv; for (let q = 0; q < uv.count; q++) uv.setXY(q, uv.getX(q) * 1.6 + k * .37, uv.getY(q) * 1.1);
      oakParts.push(g); doors.push(z);
    }
    const oakGeometry = mergeGeometries(oakParts.map((g) => g.index ? g.toNonIndexed() : g), false); oakParts.forEach((g) => g.dispose());
    const oak = new THREE.Mesh(oakGeometry, new THREE.MeshStandardMaterial({ map: grain, vertexColors: true, roughness: .74 }));
    oak.name = "left-sideboard"; oak.castShadow = true; oak.receiveShadow = true; scene.add(oak);
    // Small brass bar pulls, vertical, near the meeting reveal; each sinks 1 mm into its door.
    const pullParts = [];
    for (const [k, z] of doors.entries()) {
      const pz = z + (k ? -1 : 1) * (doorW / 2 - .045);
      const bar = new THREE.CylinderGeometry(.0045, .0045, .07, 10); bar.translate(frontX + S.door + .014, carcassTop - .1, pz); pullParts.push(bar);
      for (const dy of [-.028, .028]) { const post = new THREE.CylinderGeometry(.003, .003, .016, 8); post.rotateZ(Math.PI / 2); post.translate(frontX + S.door + .007 - .001, carcassTop - .1 + dy, pz); pullParts.push(post); }
    }
    // Gilded pulls (Paul 2026-10-31): warm bright gold, near-full metalness, low roughness so they catch the painting light. The room has no
    // environment map, so a faint warm emissive keeps the metal from reading black where no light hits it.
    const pulls = new THREE.Mesh(mergeGeometries(pullParts, false), new THREE.MeshStandardMaterial({ color: "#f2c862", metalness: .95, roughness: .24, emissive: "#8a6018", emissiveIntensity: .45 }));
    pullParts.forEach((g) => g.dispose());
    pulls.name = "left-sideboard-pulls"; pulls.castShadow = true; scene.add(pulls);
    // Props, seated by a downward ray on the real top: the generic mug (Room 03's MUG profile, sage glaze, no logo) and the napkin pack.
    oak.updateMatrixWorld(true);
    const ray = new THREE.Raycaster();
    const topAt = (x, z) => { ray.set(new THREE.Vector3(x, 2, z), new THREE.Vector3(0, -1, 0)); const hit = ray.intersectObject(oak, false)[0]; if (!hit) throw new Error("sideboard top not found"); return hit.point.y; };
    const propParts = [];
    const MUG = { radius: .040, profile: [[0, .006], [.0365, .007], [.0365, .093], [.0372, .0948], [.0388, .0952], [.0399, .0935], [.040, .010], [.0395, .004], [.037, 0], [0, 0]] };
    const mugAt = { x: -2.39, z: .80 };
    const mugY = topAt(mugAt.x, mugAt.z);
    {
      const body = new THREE.LatheGeometry(MUG.profile.map(([r, y]) => new THREE.Vector2(r, y)), 32);
      const pos = body.attributes.position, col = new Float32Array(pos.count * 3), c = new THREE.Color();
      for (let k = 0; k < pos.count; k++) { const y = pos.getY(k), rad = Math.hypot(pos.getX(k), pos.getZ(k)); c.set(rad < .0366 && y > .0065 ? 0xe9e3d3 : y < .009 ? 0xd8cfbd : 0x93a487); col.set([c.r, c.g, c.b], k * 3); }
      body.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
      body.translate(mugAt.x, mugY, mugAt.z); propParts.push(body);
      // Half-ring handle on the side away from the pack, toward the room; both ends sink 2 mm into the wall of the mug.
      const handle = tint(new THREE.TorusGeometry(.026, .0055, 8, 20, Math.PI), 0x93a487);
      const handleYaw = -.7; // direction (cos, 0, -sin): +x is into the room, -z toward the near end
      handle.rotateZ(-Math.PI / 2); handle.rotateY(handleYaw);
      handle.translate(mugAt.x + Math.cos(handleYaw) * (MUG.radius - .002), mugY + .052, mugAt.z - Math.sin(handleYaw) * (MUG.radius - .002));
      propParts.push(handle);
    }
    // Bulk paper-napkin pack (same build as Room 03's): white soft plastic over a stack, 190 x 105 mm, a red band, an unreadable label block,
    // slightly squashed with pinched ends. No brand or logo.
    const packAt = { x: -2.45, z: 1.15, yaw: .38 };
    const packY = topAt(packAt.x, packAt.z);
    {
      const pack = new THREE.BoxGeometry(.19, .074, .105, 16, 6, 10);
      const pp = pack.attributes.position, col = new Float32Array(pp.count * 3), c = new THREE.Color();
      for (let k = 0; k < pp.count; k++) {
        const x = pp.getX(k), y = pp.getY(k), z = pp.getZ(k);
        const u = x / .095, v = (y + .037) / .074, w = z / .0525;
        const bulge = Math.sin(Math.PI * Math.min(1, v * 1.05)) * (1 - u * u * .6);
        const pinch = Math.max(0, Math.abs(u) - .86) / .14;
        const nz = z * (1 + .06 * bulge) * (1 - .10 * pinch);
        const ny = (y + .037) * (1 - .06 * pinch) * (1 + .035 * (1 - w * w) * (1 - u * u)) + .0012 * Math.sin(x * 140 + z * 60) * v * v;
        pp.setXYZ(k, x * (1 - .02 * v * v), ny, nz);
        const n = Math.abs(Math.sin(x * 191.3 + y * 83.7 + z * 151.1) * 43758.5453) % 1;
        if (Math.abs(x) < .034) c.set(0xb0242b); else c.set(n > .85 ? 0xdfe0dc : 0xf2f1eb);
        if (Math.abs(x) < .024 && z > .045 && ny > .022 && ny < .052) c.set(Math.sin(x * 900) > .6 && ny > .034 ? 0x6e1a20 : 0xeee3cf);
        col.set([c.r, c.g, c.b], k * 3);
      }
      pack.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
      pack.rotateY(Math.PI / 2 + packAt.yaw); // long side runs along the wall, turned a little
      pack.computeBoundingBox();
      pack.translate(packAt.x, packY - pack.boundingBox.min.y, packAt.z);
      propParts.push(pack);
    }
    // Generic vitamin bottle beside the mug (Paul's photo, 2026-10-31): white HDPE, 55 mm across, a ribbed white screw cap 60 x 25 mm, 105 mm
    // overall. Wrap label: white with bold red bands top and bottom and a big red block in the middle. No words, brand or logo.
    const bottleAt = { x: -2.46, z: .67, yaw: -.35 };
    const bottleY = topAt(bottleAt.x, bottleAt.z);
    const bottleParts = [];
    const labelTex = canvasTex(256, 128, (ctx, w, h) => {
      ctx.fillStyle = "#f7f6f1"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d9262b"; ctx.fillRect(0, 0, w, 20); ctx.fillRect(0, h - 22, w, 22);
      // The front block sits at u 0.25..0.5 (faces the room after the yaw); a rounded slab and a small cross, shapes only.
      const bx = w * .26, by = 34, bw = w * .15, bh = 58;
      ctx.beginPath(); ctx.roundRect(bx, by, bw * 1.05, bh, 9); ctx.fill(); // a plain heavy block, not a letter
      ctx.fillRect(bx + bw * 1.2, by + 4, bw * .42, 9); ctx.fillRect(bx + bw * 1.36, by - 6, 9, 30);
      ctx.fillStyle = "rgba(60,40,40,.35)"; ctx.fillRect(bx, by + bh + 8, bw * 1.5, 4); ctx.fillRect(bx, by + bh + 15, bw * 1.1, 3);
    });
    {
      // Body: flat base, 27.5 mm radius wall with a soft heel, rounded shoulder into a 22 mm neck. v runs with height so the label maps flat.
      const prof = [[0, 0], [.024, 0], [.0272, .003], [.0275, .008], [.0275, .0119], [.0275, .012], ...[.016, .020, .024, .028, .032, .036, .040, .044, .048, .052, .056, .060, .064].map((y) => [.0275, y]), [.0275, .068], [.0275, .0681], [.0275, .070], [.0268, .076], [.0245, .080], [.0225, .082], [.0222, .086], [0, .086]];
      const body = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 40);
      const pos = body.attributes.position, uv = body.attributes.uv;
      for (let k = 0; k < pos.count; k++) { const y = pos.getY(k); uv.setY(k, THREE.MathUtils.clamp((y - .012) / (.068 - .012), 0, 1) * .98 + .01); if (y < .012 || y > .068) uv.setXY(k, .97, .5); }
      bottleParts.push(body);
      // Cap: 30 mm radius, 25 mm tall, fine vertical ribs, a slightly domed top; it sits over the neck (1 mm overlap).
      const capProf = [[.0222, .081], [.030, .081], [.0302, .083], [.0302, .1035], [.0295, .105], [.012, .1055], [0, .1056]];
      const cap = new THREE.LatheGeometry(capProf.map(([r, y]) => new THREE.Vector2(r, y)), 96);
      const cp = cap.attributes.position;
      for (let k = 0; k < cp.count; k++) { const x = cp.getX(k), z = cp.getZ(k), y = cp.getY(k), r = Math.hypot(x, z); if (r > .0299 && y > .0835 && y < .103) { const a = Math.atan2(z, x), f = 1 + .025 * (Math.cos(a * 48) > 0 ? 1 : 0); cp.setXYZ(k, x * f, y, z * f); } }
      const cuv = cap.attributes.uv; for (let k = 0; k < cuv.count; k++) cuv.setXY(k, .97, .5);
      bottleParts.push(cap);
    }
    const bottleGeometry = mergeGeometries(bottleParts.map((g) => g.index ? g.toNonIndexed() : g), false);
    bottleParts.forEach((g) => g.dispose());
    bottleGeometry.computeVertexNormals();
    bottleGeometry.rotateY(bottleAt.yaw);
    bottleGeometry.translate(bottleAt.x, bottleY, bottleAt.z);
    const bottle = new THREE.Mesh(bottleGeometry, new THREE.MeshStandardMaterial({ map: labelTex, color: "#ffffff", roughness: .42 }));
    bottle.name = "left-sideboard-supplement"; bottle.castShadow = true; bottle.receiveShadow = true; scene.add(bottle);
    for (const g of propParts) { if (!g.attributes.uv) continue; g.deleteAttribute("uv"); }
    for (const g of propParts) if (g.attributes.normal) g.deleteAttribute("normal");
    const propGeometry = mergeGeometries(propParts.map((g) => g.index ? g.toNonIndexed() : g), false);
    propGeometry.computeVertexNormals();
    const props = new THREE.Mesh(propGeometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .5 }));
    props.name = "left-sideboard-props"; props.castShadow = true; props.receiveShadow = true; scene.add(props);
    return { oak, pulls, props, bottle, bottleAt, mugAt, mugY, packAt, packY, mugRadius: MUG.radius };
  })();

  // ---------- state + panel ----------
  const state = { mood: "rain", wall: "original", rug: "stripe", curtain: "linen", print: "hills", lang };
  robotBubble = document.getElementById("robotBubble");
  let robotSleeping = false, robotIdleTimer = 0, robotBubbleTimer = 0, robotTurnTimer = 0, robotTurnFrame = 0;
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
    const screenLevel = ({ rain: .1, family: .08, tech: .15, chic: .08, slow: .07, golden: .07, tv: .46 })[mood];
    return {
      hemi: m.hemi, win: m.win, lamp: m.lamp, fill: m.fill, floor: m.floor, exposure: m.exposure, sunY: m.sunY ?? 2.6, shadowRadius: m.shadowRadius ?? 8, led: m.led ? .5 : 0,
      floorHalo: m.floor ? m.glow : 0, tableHalo: m.glow,
      shade: m.floor ? .55 : 0, table: m.glow > .3 ? .45 : .18, // the AI shade is a solid shape: a soft glow keeps its form; dimmer in daylight
      winCol: new THREE.Color(m.winCol), out: new THREE.Color(m.out), tvWall: TV_STRIP_GLOW[mood], wallWarmth: WALLS_WITHOUT_WARM_WASH.has(state.wall) ? 0 : TV_WALL_WASH[mood], screenReflection: mood === "tv" ? .17 : 0, screenLevel,
    };
  };
  const lights = () => lightForMood(state.mood);
  let standGroup = null, standContact = null, standWall = null, standScarfMat = null, standBrass = null, standBaseMat = null;
  function setLights(v) {
    hemi.intensity = v.hemi; windowLight.intensity = v.win; windowLight.color.copy(v.winCol); windowLight.position.y = v.sunY; windowLight.shadow.radius = v.shadowRadius;
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
  const DEFAULT_WALL_BY_MOOD = { rain: "original", family: "olive", tech: "mist", chic: "blush", slow: "sand", golden: "sand", tv: "wine" };
  const fromUrl = new URLSearchParams(location.search);
  let wallWasChosen = Object.hasOwn(WALLS, fromUrl.get("wall") ?? "");
  for (const k in CHOICES) { const v = fromUrl.get(k); if (v && Object.hasOwn(CHOICES[k], v)) state[k] = v; }
  if (fromUrl.get("from") === "home" && !Object.hasOwn(MOODS, fromUrl.get("mood") ?? "")) state.mood = "golden"; // arriving from the home cover (a golden-hour painting) the first look matches it; an explicit mood in the address wins
  if (!wallWasChosen) state.wall = DEFAULT_WALL_BY_MOOD[state.mood];
  function choose(key, value) {
    const previous = state[key];
    if (key === "wall") wallWasChosen = true;
    if (key === "mood" && !wallWasChosen) state.wall = DEFAULT_WALL_BY_MOOD[value];
    state[key] = value;
    if (key === "mood" && previous !== value) showRobotMood(value);
    apply();
  }
  function toUrl() {
    const u = new URL(location.href);
    for (const k in CHOICES) u.searchParams.set(k, state[k]);
    if (currentView === "tv") u.searchParams.set("view", "tv"); else u.searchParams.delete("view");
    history.replaceState(history.state, "", u);
  }
  function setCameraAngle(theta, radius = orbitRadius, phi = orbitPhi) {
    controls.target.copy(orbitCenter);
    camera.position.copy(cameraAt(theta, radius, phi));
    camera.lookAt(orbitCenter);
    controls.update();
    render();
    startRobotTurn();
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
    const immersiveControls = document.getElementById("immersiveControls");
    const immersiveScroll = immersiveControls ? [...immersiveControls.querySelectorAll(".immersive-row")].map((row) => row.scrollLeft) : [];
    const immersiveFocus = immersiveControls?.contains(had) ? { view: had.dataset.view, mood: had.dataset.key, shuffle: had.classList.contains("shuffle") } : null;
    let keep = null;
    if (had && (panel.contains(had) || toolbar?.contains(had))) {
      const g = had.closest(".opts");
      keep = had.classList.contains("shuffle") ? { c: "shuffle" } : g ? { g: [...panel.querySelectorAll(".opts")].indexOf(g), k: had.dataset.key } : { c: had.classList.contains("camera-tv") ? "camera-tv" : had.classList.contains("camera-window") ? "camera-window" : had.classList.contains("director") ? "director" : "save" };
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
      if (key === "mood" && phoneActions.matches) {
        const shuffleBtn = Object.assign(document.createElement("button"), { type: "button", className: "save shuffle mood-shuffle", textContent: state.lang === "zh" ? "隨機搭一間" : "Random room", onclick: () => shuffle() });
        shuffleBtn.setAttribute("aria-label", t.shuffle);
        box.append(shuffleBtn);
      }
      if (key !== "mood") return [h, box];
      const why = document.createElement("p"); why.className = "why"; why.textContent = MOODS[state.mood].why[state.lang]; // why this pairing
      return [h, box, why];
    }), Object.assign(document.createElement("p"), { className: "hint", textContent: t.hint }));
    const bar = PHONE_BAR[state.lang];
    const onPhone = phoneActions.matches;
    const directorFull = directorPreparing ? t.preparing : director ? t.stop : still && directorStillOpen ? t.close : t.director;
    const directorShort = directorPreparing ? bar.preparing : director ? bar.stop : still && directorStillOpen ? bar.close : bar.director;
    const directorBtn = Object.assign(document.createElement("button"), { type: "button", className: "save director", textContent: onPhone ? directorShort : directorFull, onclick: () => toggleDirector() });
    const shuffleBtn = Object.assign(document.createElement("button"), { type: "button", className: "save shuffle panel-shuffle", textContent: t.shuffle, onclick: () => shuffle() });
    const saveBtn = Object.assign(document.createElement("button"), { type: "button", className: "save", textContent: onPhone ? bar.save : t.save, onclick: () => savePostcard() });
    directorBtn.setAttribute("aria-label", directorFull);
    shuffleBtn.setAttribute("aria-label", t.shuffle);
    saveBtn.setAttribute("aria-label", t.save);
    const stillNodes = still && directorStillOpen ? [staticTour(t)] : [];
    if (onPhone && toolbar) {
      toolbar.replaceChildren(directorBtn, saveBtn);
      toolbar.setAttribute("aria-label", state.lang === "zh" ? "短片、明信片" : "Tour, postcard");
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
    if (immersiveControls) {
      const views = document.createElement("div"); views.className = "immersive-row"; views.setAttribute("role", "group"); views.setAttribute("aria-label", state.lang === "zh" ? "房間視角" : "Room view");
      for (const [view, label] of [["window", t.windowView], ["tv", t.tvView]]) {
        const b = document.createElement("button"); b.type = "button"; b.dataset.view = view; b.textContent = label; b.setAttribute("aria-pressed", String(currentView === view)); b.onclick = () => { moveToView(view); drawPanel(); }; views.append(b);
      }
      const moods = document.createElement("div"); moods.className = "immersive-row"; moods.setAttribute("role", "group"); moods.setAttribute("aria-label", t.mood);
      for (const [key, item] of Object.entries(MOODS)) {
        const b = document.createElement("button"); b.type = "button"; b.dataset.key = key; b.textContent = item[state.lang]; b.setAttribute("aria-pressed", String(state.mood === key)); b.onclick = () => { if (director) stopDirector(false); if (directorPreparing) cancelPreparation(); choose("mood", key); toUrl(); }; moods.append(b);
      }
      const shuffleButton = document.createElement("button"); shuffleButton.type = "button"; shuffleButton.className = "shuffle"; shuffleButton.textContent = state.lang === "zh" ? "隨機搭一間" : "Random room"; shuffleButton.setAttribute("aria-label", t.shuffle); shuffleButton.onclick = () => shuffle(); moods.append(shuffleButton);
      immersiveControls.replaceChildren(views, moods);
      views.scrollLeft = immersiveScroll[0] ?? 0; moods.scrollLeft = immersiveScroll[1] ?? 0;
      if (immersiveFocus) {
        const target = immersiveFocus.view ? views.querySelector(`button[data-view="${immersiveFocus.view}"]`) : immersiveFocus.shuffle ? shuffleButton : moods.querySelector(`button[data-key="${immersiveFocus.mood}"]`);
        target?.focus({ preventScroll: true });
      }
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
  function isInAppBrowser(ua = navigator.userAgent) {
    return /MicroMessenger|FBAN|FBAV|FB_IAB|FBIOS|MessengerForiOS|Orca-Android|Instagram|\bLine\/|weibo__|WeiboliteIOS|WeiboIntlIOS|WhatsApp\/|;\s*wv\)/i.test(ua);
  }
  let postcardPreview = null;
  function closePostcardPreview(fromHistory = false) {
    if (!postcardPreview) return;
    const { overlay, imageUrl, previousFocus, onPopState } = postcardPreview;
    postcardPreview = null;
    window.removeEventListener("popstate", onPopState);
    document.documentElement.classList.remove("postcard-preview-open");
    overlay.remove(); URL.revokeObjectURL(imageUrl);
    if (!fromHistory && history.state?.room01PostcardPreview) history.back();
    if (previousFocus?.isConnected && previousFocus.getClientRects().length) previousFocus.focus({ preventScroll: true });
  }
  function showPostcardPreview(blob, lang = state.lang) {
    if (!blob) return;
    if (postcardPreview) return;
    const imageUrl = URL.createObjectURL(blob), copy = TEXT[lang];
    const overlay = document.createElement("div"); overlay.className = "postcard-preview"; overlay.setAttribute("role", "presentation");
    const dialog = document.createElement("section"); dialog.className = "postcard-preview__dialog"; dialog.setAttribute("role", "dialog"); dialog.setAttribute("aria-modal", "true"); dialog.setAttribute("aria-label", copy.previewTitle);
    const close = Object.assign(document.createElement("button"), { type: "button", className: "postcard-preview__close", textContent: "×" }); close.setAttribute("aria-label", copy.previewClose);
    const title = Object.assign(document.createElement("h2"), { className: "postcard-preview__title", textContent: copy.previewTitle });
    const image = Object.assign(document.createElement("img"), { className: "postcard-preview__image", src: imageUrl, alt: copy.previewAlt });
    const longPress = Object.assign(document.createElement("p"), { className: "postcard-preview__hint", textContent: copy.previewLongPress });
    const openBrowser = Object.assign(document.createElement("p"), { className: "postcard-preview__detail", textContent: copy.previewOpenBrowser });
    dialog.append(close, title, image, longPress, openBrowser); overlay.append(dialog); document.body.append(overlay);
    const previousFocus = document.activeElement;
    const onPopState = (event) => { if (!event.state?.room01PostcardPreview) closePostcardPreview(true); };
    postcardPreview = { overlay, imageUrl, previousFocus, onPopState };
    document.documentElement.classList.add("postcard-preview-open");
    history.pushState({ ...(history.state && typeof history.state === "object" ? history.state : {}), room01PostcardPreview: true }, "", location.href);
    window.addEventListener("popstate", onPopState);
    const closeFromUser = () => closePostcardPreview();
    close.onclick = closeFromUser;
    overlay.onclick = (event) => { if (event.target === overlay) closeFromUser(); };
    overlay.onkeydown = (event) => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); closeFromUser(); }
      else if (event.key === "Tab") { event.preventDefault(); close.focus({ preventScroll: true }); }
    };
    close.focus({ preventScroll: true });
  }
  function deliverPostcard(blob, filename, lang = state.lang) {
    if (!blob) return;
    if (isInAppBrowser()) showPostcardPreview(blob, lang);
    else downloadPostcard(blob, filename);
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
        deliverPostcard(blob, TEXT[downloadLang].artFile, downloadLang);
        return;
      } catch (error) {
        console.warn("Using the 3D postcard fallback", error);
      }
    }
    fallback.toBlob((blob) => deliverPostcard(blob, TEXT[downloadLang].file, downloadLang), "image/png");
  }

  let looping = false;
  // Yaw lives on the frame that is about to be drawn. fit() only knows the saved view and would
  // widen the window too; the controls "change" event does not run during a view-button turn,
  // the entrance drift, or the postcard's temporary window camera. Skip the blend while the
  // short film owns the camera, so that path keeps the base fov fit() already chose.
  function render() { syncFov(); renderer.render(scene, camera); positionRobotBubble(); }
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
  // ---- portal: push the door open and walk into Room 02 ----
  // Tap the door (or use the "Room 02" button under the room). The door swings into the room, light from the other side spills out,
  // the camera walks to the doorway and the screen fades to Room 02's night colour before the next page opens. With reduced motion
  // the page simply opens. Coming back with the browser's back button closes the door again.
  // What the doorway shows: a small painted glimpse of Room 02 at night (violet strip glow, a lit window of city lights, a warm lamp).
  const glowTex = (() => {
    const c = document.createElement("canvas"); c.width = 128; c.height = 256; const g = c.getContext("2d");
    let k = g.createLinearGradient(0, 0, 0, 256); k.addColorStop(0, "#2a2358"); k.addColorStop(.6, "#4a3466"); k.addColorStop(1, "#6a4a40"); g.fillStyle = k; g.fillRect(0, 0, 128, 256);
    k = g.createLinearGradient(0, 200, 0, 256); k.addColorStop(0, "#7a5638"); k.addColorStop(1, "#a07848"); g.fillStyle = k; g.fillRect(0, 200, 128, 56); // floorboards
    k = g.createLinearGradient(0, 60, 0, 150); k.addColorStop(0, "#1c2262"); k.addColorStop(1, "#5a56c8"); g.fillStyle = k; g.fillRect(34, 60, 60, 90); // the window at night
    g.fillStyle = "#141a46"; for (let i = 0; i < 7; i++) g.fillRect(36 + i * 8, 150 - (28 + (i * 37) % 34), 7, 28 + (i * 37) % 34);
    g.fillStyle = "#ffd98a"; for (let i = 0; i < 40; i++) g.fillRect(37 + (i * 13) % 56, 152 - (i * 29) % 56, 2, 2);
    g.fillStyle = "#e9e4da"; g.fillRect(32, 58, 64, 3); g.fillRect(32, 150, 64, 3); g.fillRect(32, 58, 3, 95); g.fillRect(93, 58, 3, 95); g.fillRect(62, 58, 3, 95); // frame and mullion
    k = g.createRadialGradient(12, 130, 2, 12, 130, 70); k.addColorStop(0, "rgba(160,130,255,.85)"); k.addColorStop(1, "rgba(160,130,255,0)"); g.fillStyle = k; g.fillRect(0, 40, 128, 200); // violet strip glow on the left
    k = g.createRadialGradient(108, 178, 1, 108, 178, 46); k.addColorStop(0, "rgba(255,200,120,.95)"); k.addColorStop(1, "rgba(255,200,120,0)"); g.fillStyle = k; g.fillRect(40, 120, 88, 110); // the bedside lamp
    g.fillStyle = "#f4e6c8"; g.fillRect(103, 168, 10, 9); g.fillStyle = "#5a4630"; g.fillRect(100, 182, 16, 30); // lamp shade and the table
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const revealBase = { color: doorReveal.material.color.clone(), emissive: doorReveal.material.emissive.clone(), emissiveIntensity: doorReveal.material.emissiveIntensity };
  let portal = null, portalFade = null;
  const setDoorOpen = (k) => { // k: 0 closed .. 1 open
    doorSwing.rotation.y = -DOOR_OPEN * k;
    const lit = Math.min(1, k * 1.6);
    doorReveal.material.color.copy(revealBase.color).lerp(new THREE.Color("#000000"), lit);
    doorReveal.material.emissive.set("#ffffff"); doorReveal.material.emissiveMap = lit > 0 ? glowTex : null;
    doorReveal.material.emissiveIntensity = lit * 1.0; doorReveal.material.needsUpdate = true;
  };
  function closePortal() {
    if (!portal) return;
    portal.cancel = true;
    cancelAnimationFrame(portal.frame);
    portalFade?.remove(); portalFade = null;
    setDoorOpen(0);
    camera.position.copy(portal.from.position); camera.quaternion.copy(portal.from.quaternion);
    controls.target.copy(orbitCenter); controls.enabled = true; controls.update(); portal = null; render();
  }
  function finishReturnArrival() {
    if (!arrival) return false;
    const run = arrival;
    cancelAnimationFrame(run.frame);
    clearTimeout(run.coverTimer);
    run.cover?.remove();
    camera.position.copy(run.endPosition);
    camera.quaternion.copy(run.endQuaternion);
    setDoorOpen(0);
    guidePivot.rotation.y = guideHome.r;
    controls.target.copy(orbitCenter);
    controls.enabled = true;
    controls.update();
    arrival = null;
    render();
    return true;
  }
  function beginReturnArrival() {
    if (still || !arriveFromRoom02 || arrival) return false;
    controls.update();
    const endPosition = camera.position.clone(), endQuaternion = camera.quaternion.clone();
    const startPosition = new THREE.Vector3(W / 2 - .35, 1.42, doorZ);
    const entryPosition = new THREE.Vector3(W / 2 - .95, 1.42, doorZ);
    const startQuaternion = new THREE.Quaternion();
    startQuaternion.setFromRotationMatrix(new THREE.Matrix4().lookAt(startPosition, new THREE.Vector3(W / 2 - .2, 1.42, doorZ), new THREE.Vector3(0, 1, 0)));
    const cover = Object.assign(document.createElement("div"), { className: "portal-fade room-arrival-cover", "aria-hidden": "true" });
    Object.assign(cover.style, { position: "fixed", inset: "0", zIndex: "60", background: "radial-gradient(ellipse at 50% 55%, #6b5bd8 0%, #2a2150 55%, #0e0c20 100%)", opacity: "1", transition: "opacity .5s ease", pointerEvents: "none" });
    document.body.append(cover);
    arrival = { frame: 0, started: 0, cover, endPosition, endQuaternion, startPosition, entryPosition, startQuaternion, coverTimer: 0 };
    controls.enabled = false;
    setDoorOpen(1);
    camera.position.copy(startPosition); camera.quaternion.copy(startQuaternion); render();
    arrival.started = performance.now(); // exclude the first, potentially expensive WebGL frame from the walk duration
    requestAnimationFrame(() => { if (arrival === null) return; cover.style.opacity = "0"; arrival.coverTimer = setTimeout(() => cover.remove(), 550); });
    const ease = (k) => k * k * (3 - 2 * k), segment = (time, a, b) => Math.min(1, Math.max(0, (time - a) / (b - a)));
    const guideStart = guideHome.r, guideTarget = Math.atan2(startPosition.x - guidePivot.position.x, startPosition.z - guidePivot.position.z);
    const step = (now) => {
      const run = arrival;
      if (!run) return;
      const time = now - run.started, intoRoom = ease(segment(time, 100, 1250)), toHome = ease(segment(time, 1050, 2750));
      camera.position.copy(run.startPosition).lerp(run.entryPosition, intoRoom).lerp(run.endPosition, toHome);
      camera.quaternion.copy(run.startQuaternion).slerp(run.endQuaternion, ease(segment(time, 0, 2500)));
      setDoorOpen(1 - ease(segment(time, 1050, 1800)));
      const turn = ease(segment(time, 650, 1150)) * (1 - ease(segment(time, 1750, 2250)));
      guidePivot.rotation.y = guideStart + Math.atan2(Math.sin(guideTarget - guideStart), Math.cos(guideTarget - guideStart)) * turn;
      render();
      if (time < 2800) { run.frame = requestAnimationFrame(step); return; }
      finishReturnArrival();
    };
    arrival.frame = requestAnimationFrame(step);
    return true;
  }
  function openPortal({ go = true, transitionColor = "#6b5bd8", destinationUrl = null } = {}) {
    if (portal || director || directorPreparing) return Promise.resolve(false);
    const url = new URL(destinationUrl || "bedroom/", location.href); url.searchParams.set("lang", state.lang); url.searchParams.set("from", "room01");
    if (still) { if (go) location.assign(url.href); else setDoorOpen(1); return Promise.resolve(true); }
    viewMoveToken++; controls.enabled = false;
    portal = { from: { position: camera.position.clone(), quaternion: camera.quaternion.clone() }, cancel: false, frame: 0 };
    const start = camera.position.clone(), doorMid = new THREE.Vector3(W / 2, 1.1, doorZ);
    const stand = new THREE.Vector3(W / 2 - 2.1, 1.38, doorZ), inside = new THREE.Vector3(W / 2 - 1.15, 1.38, doorZ);
    const startQ = camera.quaternion.clone(), endQ = new THREE.Quaternion();
    { const m = new THREE.Matrix4().lookAt(stand, doorMid, new THREE.Vector3(0, 1, 0)); endQ.setFromRotationMatrix(m); }
    const ease = (k) => k * k * (3 - 2 * k), seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
    const t0 = performance.now(), TOTAL = 3200;
    return new Promise((resolve) => {
      const step = (now) => {
        if (!portal || portal.cancel) { resolve(false); return; }
        const t = now - t0;
        setDoorOpen(ease(seg(t, 500, 1700)));
        const walk = ease(seg(t, 0, 1400)), push = ease(seg(t, 1800, 2800));
        camera.position.copy(start).lerp(stand, walk).lerp(inside, push);
        camera.quaternion.copy(startQ).slerp(endQ, walk);
        if (t > 2400 && go && !portalFade) {
          portalFade = Object.assign(document.createElement("div"), { className: "portal-fade", "aria-hidden": "true" });
          Object.assign(portalFade.style, { position: "fixed", inset: "0", zIndex: "60", background: `radial-gradient(ellipse at 50% 55%, ${transitionColor} 0%, #2a2150 55%, #0e0c20 100%)`, opacity: "0", transition: "opacity .65s ease" });
          document.body.append(portalFade); requestAnimationFrame(() => { if (portalFade) portalFade.style.opacity = "1"; });
        }
        render();
        if (t < TOTAL) { portal.frame = requestAnimationFrame(step); return; }
        if (go) location.assign(url.href); // the overlay stays up while the next page loads; closePortal() clears it if the visitor comes back
        resolve(true);
      };
      portal.frame = requestAnimationFrame(step);
    });
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && portal && !portalFade) closePortal(); }); // Esc steps back before the fade starts
  window.addEventListener("pageshow", (e) => { if (e.persisted) closePortal(); }); // back/forward cache: the door closes again
  renderer.domElement.addEventListener("pointermove", (e) => {
    if (e.buttons || portal) return;
    const r = renderer.domElement.getBoundingClientRect();
    tap.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(tap, camera);
    renderer.domElement.style.cursor = ray.intersectObject(roomDoor, true).length ? "pointer" : "";
  });
  // a quiet easter egg: tap the little robot and it hops, turns to look at you, then turns back.
  // Only a tap counts (a drag to turn the room does not); with reduced motion it just turns to look.
  const ray = new THREE.Raycaster(), tap = new THREE.Vector2(), robotHome = { y: robotPivot.position.y, r: robotPivot.rotation.y };
  let bubbleTarget = robotObj, guideHinted = false; // the bubble sits over whichever robot is speaking
  let downAt = null, hopping = false, hopRun = 0, suppressTap = false;
  function positionRobotBubble() {
    if (!robotBubble || robotBubble.hidden) return;
    bubbleTarget.updateWorldMatrix(true, true);
    const bounds = new THREE.Box3().setFromObject(bubbleTarget);
    const head = new THREE.Vector3((bounds.min.x + bounds.max.x) / 2, bounds.max.y, (bounds.min.z + bounds.max.z) / 2);
    head.project(camera);
    const rect = stage.getBoundingClientRect();
    const half = robotBubble.offsetWidth / 2;
    const bubbleHeight = robotBubble.offsetHeight;
    const left = THREE.MathUtils.clamp((head.x + 1) * rect.width / 2, half + 8, rect.width - half - 8);
    const top = THREE.MathUtils.clamp((1 - head.y) * rect.height / 2 - bubbleHeight - 10, 8, rect.height - bubbleHeight - 8);
    robotBubble.style.left = `${left}px`;
    robotBubble.style.top = `${top}px`;
  }
  function showGuideLine() {
    bubbleTarget = guidePivot;
    robotBubble.querySelector("[data-bubble-copy]").textContent = GUIDE_LINE[state.lang];
    const action = robotBubble.querySelector("[data-travel-door-action]"); if (action) action.hidden = false;
    robotBubble.hidden = false;
    clearTimeout(robotBubbleTimer); clearTimeout(robotTurnTimer);
    robotBubbleTimer = setTimeout(() => { robotBubble.hidden = true; bubbleTarget = robotObj; }, 4200);
    render();
  }
  function pauseGuideBubble() {
    if (robotBubble.hidden || bubbleTarget !== guidePivot) return false;
    clearTimeout(robotBubbleTimer);
    return true;
  }
  function resumeGuideBubble() {
    if (robotBubble.hidden || bubbleTarget !== guidePivot) return false;
    clearTimeout(robotBubbleTimer);
    robotBubbleTimer = setTimeout(() => { robotBubble.hidden = true; bubbleTarget = robotObj; }, 4200);
    return true;
  }
  function showRobotMood(mood) {
    bubbleTarget = robotObj;
    robotBubble.querySelector("[data-bubble-copy]").textContent = ROBOT_MOOD_LINES[mood][state.lang];
    const action = robotBubble.querySelector("[data-travel-door-action]"); if (action) action.hidden = true;
    robotBubble.hidden = false;
    clearTimeout(robotBubbleTimer);
    clearTimeout(robotTurnTimer);
    robotBubbleTimer = setTimeout(() => { robotBubble.hidden = true; }, 3000);
    render();
  }
  function wakeRobot() {
    clearTimeout(robotIdleTimer);
    if (robotSleeping) { robotSleeping = false; eyeMat.color.copy(awakeEyeColor); render(); }
    if (!still) robotIdleTimer = setTimeout(() => {
      robotSleeping = true;
      eyeMat.color.set("#756b5b");
      render();
    }, 20000);
  }
  function startRobotTurn() {
    if (still || robotSleeping || hopping || director) return;
    clearTimeout(robotTurnTimer);
    if (robotTurnFrame) cancelAnimationFrame(robotTurnFrame);
    if (intro) { robotTurnTimer = setTimeout(startRobotTurn, 300); return; }
    const look = Math.atan2(camera.position.x - robotPivot.position.x, camera.position.z - robotPivot.position.z);
    const difference = Math.atan2(Math.sin(look - robotPivot.rotation.y), Math.cos(look - robotPivot.rotation.y));
    const target = robotPivot.rotation.y + THREE.MathUtils.clamp(difference, -.58, .58);
    if (Math.abs(target - robotPivot.rotation.y) < .01) return;
    const from = robotPivot.rotation.y, started = performance.now(), duration = 1150;
    const step = (now) => {
      const t = Math.min(1, (now - started) / duration), eased = t * t * (3 - 2 * t);
      robotPivot.rotation.y = from + (target - from) * eased;
      render();
      if (t < 1) robotTurnFrame = requestAnimationFrame(step);
      else robotTurnFrame = 0;
    };
    robotTurnFrame = requestAnimationFrame(step);
  }
  const resetRobotIdle = () => wakeRobot();
  for (const event of ["pointerdown", "keydown", "wheel"]) window.addEventListener(event, resetRobotIdle, { passive: true });
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") resetRobotIdle(); });
  controls.addEventListener("end", () => { if (!still) robotTurnTimer = setTimeout(startRobotTurn, 240); });
  renderer.domElement.addEventListener("pointerdown", (e) => {
    if (arrival) { suppressTap = true; downAt = null; finishReturnArrival(); return; }
    if (director) { suppressTap = true; stopDirector(); downAt = null; return; }
    downAt = [e.clientX, e.clientY];
  });
  renderer.domElement.addEventListener("pointerup", (e) => {
    if (suppressTap) { suppressTap = false; return; }
    if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6 || hopping) return;
    const r = renderer.domElement.getBoundingClientRect();
    tap.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(tap, camera);
    const hitGuide = ray.intersectObject(guidePivot, true).length > 0;
    if (!hitGuide && !ray.intersectObject(robotObj, true).length) { if (ray.intersectObject(roomDoor, true).length) void openPortal(); return; } // tapping the door opens the portal
    const pivot = hitGuide ? guidePivot : robotPivot, home = hitGuide ? guideHome : robotHome;
    hopping = true;
    const hop = ++hopRun;
    if (hitGuide) showGuideLine();
    const look = Math.atan2(camera.position.x - pivot.position.x, camera.position.z - pivot.position.z); // the robot faces +z
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, t0 = performance.now(), T = 1400;
    const step = (now) => {
      if (hop !== hopRun) return;
      const k = Math.min(1, (now - t0) / T);
      const turn = k < .3 ? k / .3 : k < .75 ? 1 : 1 - (k - .75) / .25; // turn to you, hold, turn back
      const ease = turn * turn * (3 - 2 * turn);
      pivot.rotation.y = home.r + (look - home.r) * ease;
      pivot.position.y = home.y + (reduce ? 0 : Math.max(0, Math.sin(Math.min(1, k / .3) * Math.PI)) * .09);
      render();
      if (k < 1) requestAnimationFrame(step); else { pivot.position.y = home.y; pivot.rotation.y = home.r; hopping = false; render(); }
    };
    requestAnimationFrame(step);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { if (arrival) finishReturnArrival(); else if (director) stopDirector(); else if (directorPreparing) cancelPreparation(); } });
  function loop() { if (controls.update()) { render(); requestAnimationFrame(loop); } else { render(); looping = false; } }
  controls.addEventListener("start", () => { if (!looping) { looping = true; requestAnimationFrame(loop); } });
  controls.addEventListener("change", () => {
    const offset = camera.position.clone().sub(orbitCenter);
    viewTheta = Math.atan2(offset.x, offset.z);
    if (Math.sin(viewTheta) < -.45) { void loadDoorTexture(); void loadRightWallArt(); if (!guideHinted && !intro && !director && !still && robotBubble.hidden) { guideHinted = true; showGuideLine(); } } // turning toward the right-hand wall: the door robot says what is behind the door, once
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
  // 精品喀什米爾的細織紋：人字紋短斜線交錯，配一張同圖的凹凸貼圖，
  // 讓布面會吃光而不是一片平的紅。顏色維持原本的暖紅，不加點綴色。
  function knitTextures() {
    const size = 256;
    const make = () => { const c = document.createElement("canvas"); c.width = c.height = size; return c; };
    const albedo = make(), bump = make();
    const actx = albedo.getContext("2d"), bctx = bump.getContext("2d");
    actx.fillStyle = "#a83234"; actx.fillRect(0, 0, size, size);
    bctx.fillStyle = "#808080"; bctx.fillRect(0, 0, size, size);
    const step = 8;
    for (let row = 0; row * step < size + step; row++) {
      const dir = row % 2 ? 1 : -1;
      for (let col = 0; col * step < size + step; col++) {
        const x = col * step + (row % 2 ? step / 2 : 0), y = row * step;
        const light = (col + row) % 3 === 0;
        for (const [ctx, a, b] of [[actx, "#c14a4c", "#8f2528"], [bctx, "#d6d6d6", "#585858"]]) {
          ctx.strokeStyle = light ? a : b;
          ctx.lineWidth = 2.4;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dir * step * .9, y + step * .55); ctx.stroke();
        }
      }
    }
    for (let i = 0; i < 900; i++) { // faint fibre halo so the weave is not perfectly regular
      actx.fillStyle = i % 2 ? "rgba(255,214,208,.07)" : "rgba(88,18,18,.06)";
      actx.fillRect((i * 97) % size, (i * 53) % size, 1, 3);
    }
    const map = new THREE.CanvasTexture(albedo);
    map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(3, 7); map.anisotropy = 8;
    const bumpMap = new THREE.CanvasTexture(bump);
    bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping; bumpMap.repeat.set(3, 7); bumpMap.anisotropy = 8;
    return { map, bumpMap };
  }
  // 兩端流蘇：一條一條的細線、長度略有不齊，線與線之間是透明的。
  function scarfFringeTexture() {
    const w = 256, h = 128;
    const canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < 44; i++) {
      const x = (i + .5) * (w / 44) + (i % 3 - 1) * 0.6;
      const len = h * (.6 + ((i * 37) % 34) / 100);
      ctx.strokeStyle = i % 3 === 0 ? "#8f2528" : "#a83234";
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.bezierCurveTo(x + 2, len * .4, x - 2, len * .75, x + (i % 2 ? 2 : -2), len);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter;
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
  // 兩條尾巴掛在鉤上，一邊 85 cm、一邊 75 cm（不對稱才像真的掛過）。
  // u = -1 與 +1 是兩端下擺；中段貼在鉤子上。
  function scarfCenterline() {
    const pts = [];
    for (let i = 0; i <= 48; i++) {
      const u = i / 48 * 2 - 1;
      const au = Math.abs(u);
      const tail = u < 0 ? .85 : .75;
      const drop = au < .07 ? 0 : Math.pow((au - .07) / .93, 1.06) * tail;
      const y = .01 - drop;
      const x = .098 + au * .018 + Math.sin(au * Math.PI) * .010 + Math.sin(u * Math.PI * 1.7) * .006 + Math.tanh(u * 4.5) * .170;
      const z = Math.sin(u * Math.PI * 2) * .022 * (.3 + au) + u * .012 + Math.tanh(u * 4.5) * .006;
      pts.push(new THREE.Vector3(x, y, z));
    }
    return pts;
  }
  // Width is split so a soft fold can run down the middle, and the cloth has a real 1 cm edge.
  // 布的截面是一圈封閉的圓角矩形：前緣、右側圓邊、後緣、左側圓邊。
  // 這樣側面看到的是有厚度的布，不是兩片紙。中段最厚（1 cm），下擺稍薄，
  // 邊緣再帶一點起伏；後緣用頂點色調暗，內側看起來比較深。
  function knitScarf(points, width, thick, along, across) {
    const curve = new THREE.CatmullRomCurve3(points, false, "centripetal");
    const cols = across + 1;
    const ring = cols * 2 + 2;
    const positions = [], uvs = [], colors = [], indices = [];
    const pushVertex = (p, u, v, frame, f, t, tone) => {
      const { side, bin, fold } = frame;
      const x = p.x + side.x * u + bin.x * (v + fold(f));
      const y = p.y + side.y * u + bin.y * (v + fold(f));
      const z = p.z + side.z * u + bin.z * (v + fold(f));
      positions.push(x, y, z);
      uvs.push(f, t * 4);
      colors.push(tone, tone, tone);
    };
    for (let i = 0; i <= along; i++) {
      const t = i / along;
      const p = curve.getPoint(t);
      const tan = curve.getTangent(t);
      const up = Math.abs(tan.y) > .92 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
      const side = new THREE.Vector3().crossVectors(tan, up).normalize();
      const bin = new THREE.Vector3().crossVectors(side, tan).normalize();
      const pinch = THREE.MathUtils.lerp(.55, 1, Math.min(1, Math.abs(t * 2 - 1) / .35));
      const w = width * pinch;
      // 中段 1 cm、下擺 0.78 cm，邊緣再有一點沿長度的起伏。
      const depth = thick * (1 - .22 * Math.pow(Math.abs(t * 2 - 1), 1.6)) * (1 + .04 * Math.sin(t * 11));
      const half = depth / 2, bevel = half * .92;
      const twist = (t * 2 - 1) * .30;
      const ct = Math.cos(twist), st = Math.sin(twist);
      const rotSide = new THREE.Vector3(side.x * ct + bin.x * st, side.y * ct + bin.y * st, side.z * ct + bin.z * st);
      const rotBin = new THREE.Vector3(-side.x * st + bin.x * ct, -side.y * st + bin.y * ct, -side.z * st + bin.z * ct);
      const frame = {
        side: rotSide, bin: rotBin,
        fold: (f) => Math.sin(t * Math.PI * 5.2) * Math.sin(f * Math.PI) * .028
          + Math.sin(t * Math.PI * 2.3 + .6) * .008
          + Math.sin(f * Math.PI * 3 + t * 6) * .004,
      };
      const inner = w / 2 - bevel;          // 前後緣的平面寬度
      for (let j = 0; j < cols; j++) {       // 前緣（外側）
        const f = j / across;
        pushVertex(p, (f - .5) * 2 * inner, half * .92, frame, f, t, 1);
      }
      pushVertex(p, w / 2, 0, frame, 1, t, .94);   // 右側圓邊
      for (let j = cols - 1; j >= 0; j--) {  // 後緣（內側，稍暗）
        const f = j / across;
        pushVertex(p, (f - .5) * 2 * inner, -half * .92, frame, f, t, .82);
      }
      pushVertex(p, -w / 2, 0, frame, 0, t, .94);  // 左側圓邊
    }
    for (let i = 0; i < along; i++) {
      for (let k = 0; k < ring; k++) {
        const a = i * ring + k, b = i * ring + (k + 1) % ring;
        const c = (i + 1) * ring + k, d = (i + 1) * ring + (k + 1) % ring;
        indices.push(a, b, c, b, d, c);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    geo.userData.along = along;
    geo.userData.across = across;
    geo.userData.width = width;
    geo.userData.thick = thick;
    geo.userData.samples = curve.getPoints(48);
    return geo;
  }
  // 兩端各一片 8 cm 的流蘇面（貼圖帶透明），沿下擺的寬度延伸、順著尾巴方向垂下。
  function scarfFringeGeometry(points, width, thick) {
    const curve = new THREE.CatmullRomCurve3(points, false, "centripetal");
    const positions = [], uvs = [], indices = [];
    const len = .10;
    for (const t of [0, 1]) {
      const p = curve.getPoint(t);
      const tan = curve.getTangent(t).normalize();
      const up = Math.abs(tan.y) > .92 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
      const side = new THREE.Vector3().crossVectors(tan, up).normalize();
      const down = tan.clone().multiplyScalar(-1);
      const out = new THREE.Vector3().crossVectors(side, down).normalize().multiplyScalar(thick / 2 + .0012);
      const hw = width / 2, base = positions.length / 3;
      const corner = (s, l) => p.clone().addScaledVector(side, s).addScaledVector(down, l).add(out);
      const a = corner(-hw, 0), b = corner(hw, 0), c = corner(-hw, len), d = corner(hw, len);
      for (const v of [a, b, c, d]) positions.push(v.x, v.y, v.z);
      uvs.push(0, 1, 1, 1, 0, 0, 1, 0);
      indices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
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
    const knit = knitTextures();
    standScarfMat = new THREE.MeshStandardMaterial({
      color: "#ffffff", roughness: .96, metalness: 0, side: THREE.DoubleSide, vertexColors: true,
      map: knit.map, bumpMap: knit.bumpMap, bumpScale: .0035,
    });
    const fringeMat = new THREE.MeshStandardMaterial({
      color: "#ffffff", roughness: .96, metalness: 0, side: THREE.DoubleSide,
      map: scarfFringeTexture(), transparent: true, alphaTest: .35, depthWrite: false,
    });
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
        // 180 × 30 cm、厚 1 cm；兩條尾巴 85 cm 與 75 cm，兩端各有 8 cm 流蘇。
        const scarfWidth = .30, scarfThick = .01;
        const line = scarfCenterline();
        const scarf = standPart(knitScarf(line, scarfWidth, scarfThick, 48, 3), standScarfMat, "hall-stand-scarf", pivot);
        scarf.castShadow = true;
        const fringe = standPart(scarfFringeGeometry(line, scarfWidth, scarfThick), fringeMat, "hall-stand-scarf-fringe", pivot);
        fringe.castShadow = false;
        fringe.receiveShadow = false;
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
  // ---------- red hardshell suitcase (Paul 2026-11-01) ----------
  // A carry-on standing on its spinner wheels beside the hall stand, i.e. under the painting the stand sits below. Built as one shell mesh (body,
  // ribs, lid seam is hardware) and one hardware mesh (wheels, handles, tubes), so it costs two draw calls. Size is a real cabin case:
  // 40 x 52 x 19 cm shell, wheels 3.5 cm, handle out to 84 cm.
  function buildSuitcase() {
    // Paul 2026-11-01: "全力把紅色行李箱做漂亮一點 … 高級感拉滿". A cabin hardshell standing at a three-quarter angle under the right-wall harbour
    // painting: it should read as "the owner just got back from a trip" next to that painting. Built directly in upright coordinates (x width, y up,
    // z depth) so the silhouette, the seam and the wheels are authored where they are seen: lacquered shell with a clearcoat highlight, a recessed
    // seam with two metal latches, four spinner wheels in a visible gap under the shell, a chrome telescopic handle, a leather side handle and tag.
    const artBox = rightWallArtGroup ? new THREE.Box3().setFromObject(rightWallArtGroup) : null;
    const wallX = artBox ? artBox.min.x : W / 2 - .02;
    const artZ = artBox ? (artBox.min.z + artBox.max.z) / 2 : -.65;
    const yaw = -.72; // three-quarter: the room sees the broad face and one side
    const centre = new THREE.Vector3(wallX - .36, 0, artZ);
    centre.x = Math.min(W / 2 - .42, Math.max(-W / 2 + .42, centre.x));
    centre.z = Math.min(FRONT - .5, Math.max(BACK + .5, centre.z));

    const CASE_W = .40, CASE_D = .235, BODY_H = .52, WHEEL_H = .072; // a real cabin case: 55 x 40 x 23 cm, plus wheels and handle
    const RED = 0x9c1d17, METAL = 0xd0d4da, CHROME = 0xe6e9ee, DARK = 0x17181b, LEATHER = 0x4a352c;
    const shellG = [], metalG = [], chromeG = [], darkG = [], leatherG = [];
    const slab = (w, d, r, thickness, bevel, curveSegments = 6, bevelSegments = 3) => new THREE.ExtrudeGeometry(roundedRectShape(w, d, r), {
      depth: thickness, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel * .8, bevelSegments, curveSegments,
    }).rotateX(-Math.PI / 2);
    // body and lid: two stacked halves with a real recessed seam between them
    shellG.push(slab(CASE_W, CASE_D, .075, .285, .016).translate(0, WHEEL_H, 0));
    shellG.push(slab(CASE_W, CASE_D, .075, .22, .016).translate(0, WHEEL_H + .29, 0));
    // the opening: a dark groove and a brushed-aluminium band, then two latches on the broad face
    darkG.push(slab(CASE_W + .004, CASE_D + .004, .063, .012, .002, 4, 1).translate(0, WHEEL_H + .28, 0));
    metalG.push(slab(CASE_W + .010, CASE_D + .010, .064, .008, .002, 4, 1).translate(0, WHEEL_H + .29, 0));
    for (const sx of [-1, 1]) metalG.push(new THREE.BoxGeometry(.055, .028, .012).translate(sx * .11, WHEEL_H + .285, CASE_D / 2 + .004));
    // four spinner wheels, set in the gap under the shell so they are visible from the room
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const wx = sx * .146, wz = sz * .078;
      darkG.push(new THREE.BoxGeometry(.05, .05, .05).translate(wx, WHEEL_H - .026, wz));
      darkG.push(new THREE.CylinderGeometry(.029, .029, .026, 18).rotateZ(Math.PI / 2).translate(wx + sx * .008, .029, wz));
      metalG.push(new THREE.CylinderGeometry(.013, .013, .032, 12).rotateZ(Math.PI / 2).translate(wx + sx * .010, .032, wz));
    }
    // telescopic handle: two chrome tubes and a wide grip with a rubber insert
    for (const sx of [-1, 1]) chromeG.push(new THREE.CylinderGeometry(.015, .015, .07, 12).translate(sx * .125, WHEEL_H + BODY_H + .025, -.02));
    chromeG.push(new THREE.BoxGeometry(.28, .032, .036).translate(0, WHEEL_H + BODY_H + .078, -.02));
    darkG.push(new THREE.BoxGeometry(.18, .024, .028).translate(0, WHEEL_H + BODY_H + .079, -.02));
    // leather side handle and luggage tag on the side the room sees
    leatherG.push(new THREE.BoxGeometry(.028, .10, .018).translate(CASE_W / 2 + .004, WHEEL_H + .17, .02));
    leatherG.push(new THREE.CylinderGeometry(.0022, .0022, .07, 6).translate(CASE_W / 2 + .012, WHEEL_H + .115, .05));
    leatherG.push(new THREE.BoxGeometry(.05, .006, .075).translate(CASE_W / 2 + .012, WHEEL_H + .07, .075));
    for (const yOff of [WHEEL_H + .16, WHEEL_H + .31]) darkG.push(new THREE.BoxGeometry(CASE_W - .04, .006, .004).translate(0, yOff, CASE_D / 2 + .002)); // panel lines
    for (const yOff of [WHEEL_H + .16, WHEEL_H + .31]) darkG.push(new THREE.BoxGeometry(CASE_W - .04, .006, .004).translate(0, yOff, -CASE_D / 2 - .002));
    // four corner bumpers on the lid
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) darkG.push(new THREE.BoxGeometry(.05, .05, .05).translate(sx * .168, WHEEL_H + BODY_H - .02, sz * .10));

    const place = (geometry) => geometry.applyMatrix4(new THREE.Matrix4().compose(
      new THREE.Vector3(centre.x, 0, centre.z),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0)),
      new THREE.Vector3(1, 1, 1),
    ));
    const meshes = [];
    const addPart = (list, material, name) => {
      if (!list.length) return null;
      const geometry = softMerge(list.map(place));
      geometry.computeBoundingBox();
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = name; mesh.castShadow = true; mesh.receiveShadow = true;
      meshes.push(mesh); return mesh;
    };
    const shellMesh = addPart(shellG, new THREE.MeshPhysicalMaterial({
      color: RED, roughness: .26, metalness: .0, clearcoat: 1, clearcoatRoughness: .08, reflectivity: .5,
    }), "red-suitcase-shell");
    addPart(metalG, new THREE.MeshStandardMaterial({ color: METAL, roughness: .2, metalness: .92 }), "red-suitcase-metal");
    addPart(chromeG, new THREE.MeshStandardMaterial({ color: CHROME, roughness: .1, metalness: .96 }), "red-suitcase-chrome");
    addPart(darkG, new THREE.MeshStandardMaterial({ color: DARK, roughness: .58, metalness: .25 }), "red-suitcase-hardware");
    addPart(leatherG, new THREE.MeshStandardMaterial({ color: LEATHER, roughness: .78, metalness: .02 }), "red-suitcase-leather");
    const union = new THREE.Box3();
    for (const mesh of meshes) union.expandByObject(mesh);
    const drop = -union.min.y;
    for (const mesh of meshes) mesh.geometry.translate(0, drop, 0);
    const group = new THREE.Group(); group.name = "red-suitcase";
    for (const mesh of meshes) group.add(mesh);
    scene.add(group);
    soft.suitcaseShell = shellMesh; soft.suitcaseGroup = group;
    // contact shadow decal: a soft ellipse so the floor reads as shadowed instead of the mesh just ending
    const shadowTex = canvasTex(256, 256, (ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, h / 2, w * .05, w / 2, h / 2, w * .5);
      g.addColorStop(0, "rgba(18,12,9,.62)"); g.addColorStop(.5, "rgba(18,12,9,.3)"); g.addColorStop(1, "rgba(18,12,9,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    });
    const contact = new THREE.Mesh(new THREE.PlaneGeometry(.74, .58), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
    contact.name = "red-suitcase-contact"; contact.rotation.x = -Math.PI / 2; contact.rotation.z = -yaw;
    contact.position.set(centre.x, .003, centre.z);
    scene.add(contact);

    scene.updateMatrixWorld(true);
    const allBox = new THREE.Box3().setFromObject(group);
    let totalVertices = 0; group.traverse((o) => { if (o.isMesh) totalVertices += o.geometry.attributes.position.count; });
    soft.suitcaseInfo = {
      centre: [Number(centre.x.toFixed(3)), Number(centre.z.toFixed(3))],
      yaw: Number(yaw.toFixed(3)),
      flat: false,
      bounds: { min: allBox.min.toArray().map((v) => Number(v.toFixed(3))), max: allBox.max.toArray().map((v) => Number(v.toFixed(3))) },
      heightMm: Number(((allBox.max.y - allBox.min.y) * 1000).toFixed(1)),
      floorGapMm: Number((allBox.min.y * 1000).toFixed(2)),
      paintingBounds: artBox ? { min: artBox.min.toArray().map((v) => Number(v.toFixed(3))), max: artBox.max.toArray().map((v) => Number(v.toFixed(3))) } : null,
      insideRoom: allBox.min.x > -W / 2 + .05 && allBox.max.x < W / 2 - .05 && allBox.min.z > BACK + .05 && allBox.max.z < FRONT - .05,
      parts: group.children.map((m) => m.name),
      contactShadow: Boolean(contact.visible),
      lacquer: shellMesh.material.isMeshPhysicalMaterial === true && shellMesh.material.clearcoat === 1,
      vertices: totalVertices,
    };
  }

  buildHallStand();
  buildSuitcase();

  fit(); apply();
  // Let the first room frame paint before the optional TV materials request any image bytes.
  if (requestedView === "tv") { void loadTvWallTextures(); void loadDoorTexture(); }
  // on entering, the camera drifts gently within the room (1.8 s). Skipped with reduced motion; a drag or a test view stops it.
  intro = !arriveFromRoom02 && !matchMedia("(prefers-reduced-motion: reduce)").matches;
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
  wakeRobot();
  if (!still && !arriveFromRoom02) setTimeout(startRobotTurn, 500);
  onReady?.();
  return {
    geometryMetrics() { // local QA: count loaded scene geometry using BufferGeometry position attributes
      let meshes = 0, vertices = 0, triangles = 0;
      scene.traverse((obj) => {
        if (!obj.isMesh) return;
        const count = obj.geometry.attributes.position?.count ?? 0;
        meshes++; vertices += count;
        triangles += obj.geometry.index ? obj.geometry.index.count / 3 : count / 3;
      });
      return { meshes, vertices, triangles, robotLoaded: robotObj.children.length > 0 };
    },
    setLang(l) { state.lang = l; showBoardLanguage(l); renderer.domElement.setAttribute("aria-label", TEXT[l].canvas); if (!robotBubble.hidden) robotBubble.querySelector("[data-bubble-copy]").textContent = bubbleTarget === guidePivot ? GUIDE_LINE[l] : ROBOT_MOOD_LINES[state.mood][l]; showDirectorStop(); drawPanel(); },
    set(k, v) { choose(k, v); }, // used by tests
    robotState: () => ({ sleeping: robotSleeping, speaking: !robotBubble.hidden, mood: state.mood, phrase: robotBubble.querySelector("[data-bubble-copy]").textContent, yaw: robotPivot.rotation.y, reducedMotion: still }),
    guideRobot() { scene.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(guidePivot), c = b.getCenter(new THREE.Vector3()).project(camera); return { min: b.min.toArray(), max: b.max.toArray(), ndc: { x: c.x, y: c.y, z: c.z }, bubble: !robotBubble.hidden && bubbleTarget === guidePivot, phrase: robotBubble.querySelector("[data-bubble-copy]").textContent }; }, // local QA only
    faceDoorWall() { viewTheta = -Math.PI / 2; camera.position.copy(cameraAt(viewTheta)); camera.lookAt(controls.target); controls.update(); render(); }, // local QA only
    openPortal, closePortal, pauseGuideBubble, resumeGuideBubble,
    resize() { fit(); render(); },
    syncUrl: toUrl,
    beginReturnArrival, finishReturnArrival,
    returnArrival: () => arrival ? { active: true, elapsed: performance.now() - arrival.started, controlsEnabled: controls.enabled, camera: camera.position.toArray(), startPosition: arrival.startPosition.toArray(), doorOpen: doorSwing.rotation.y !== 0 } : { active: false, controlsEnabled: controls.enabled, camera: camera.position.toArray(), doorOpen: doorSwing.rotation.y !== 0 },
    doorNdc() { camera.updateMatrixWorld(); const v = new THREE.Vector3(W / 2, 1.0, doorZ - .1).project(camera); return { x: v.x, y: v.y, z: v.z }; }, // local QA only
    portal: () => ({ open: doorSwing.rotation.y, openMax: DOOR_OPEN, active: !!portal, fadeShown: !!portalFade, glow: !!doorReveal.material.emissiveMap }),
    doorSwingBounds() { // local QA only: the open leaf (and handle) against the furniture near the door
      scene.updateMatrixWorld(true);
      const swing = new THREE.Box3().setFromObject(doorSwing);
      const near = { sofa: sofaObj, sideTable: tableObj, tableLamp: tableLampObj, floorLamp: lampObj, coffee: coffeeObj, plant: plantObj, chair: chairObj, robot: robotObj, doorRobot: guidePivot };
      return { swing: { min: swing.min.toArray(), max: swing.max.toArray() }, hits: Object.entries(near).filter(([, o]) => new THREE.Box3().setFromObject(o).intersectsBox(swing)).map(([n]) => n) };
    },
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
    sideboardDetails() { // local QA only: floor/wall contact, props on the top, clearances (mm)
      scene.updateMatrixWorld(true);
      const S = SIDEBOARD, bb = (o) => new THREE.Box3().setFromObject(o);
      const oakBox = bb(sideboard.oak), propBox = bb(sideboard.props).union(bb(sideboard.bottle)), ray = new THREE.Raycaster();
      const topY = (x, z) => { ray.set(new THREE.Vector3(x, 2, z), new THREE.Vector3(0, -1, 0)); return ray.intersectObject(sideboard.oak, false)[0]?.point.y ?? null; };
      const lowest = (geometry, test) => { const p = geometry.attributes.position; let y = Infinity; for (let k = 0; k < p.count; k++) if (test(p.getX(k), p.getZ(k))) y = Math.min(y, p.getY(k)); return y; };
      const g = sideboard.props.geometry;
      const mugBase = lowest(g, (x, z) => Math.hypot(x - sideboard.mugAt.x, z - sideboard.mugAt.z) < sideboard.mugRadius + .001);
      const packBase = lowest(g, (x, z) => Math.hypot(x - sideboard.packAt.x, z - sideboard.packAt.z) < .11);
      const mm = (v) => Number((v * 1000).toFixed(2));
      const bottleBox = bb(sideboard.bottle), bottleBase = bottleBox.min.y;
      // Horizontal clearances from the bottle's cap circle (30 mm) to the mug (body 40 mm + handle) and to the pack's footprint box.
      const propPts = sideboard.props.geometry.attributes.position;
      let mugGap = Infinity, packGap = Infinity;
      for (let k = 0; k < propPts.count; k++) {
        const x = propPts.getX(k), z = propPts.getZ(k), dist = Math.hypot(x - sideboard.bottleAt.x, z - sideboard.bottleAt.z) - .0306;
        if (Math.hypot(x - sideboard.mugAt.x, z - sideboard.mugAt.z) < .09) mugGap = Math.min(mugGap, dist); else packGap = Math.min(packGap, dist);
      }
      const paintingBottom = leftWallArtPlace.y - leftPaintSize.h / 2 - leftFrameMargin / 2;
      const stand = standGroup ? bb(standGroup) : null;
      return {
        bounds: { min: oakBox.min.toArray(), max: oakBox.max.toArray() }, props: { min: propBox.min.toArray(), max: propBox.max.toArray() },
        floorEmbedMm: mm(-oakBox.min.y), plasterEmbedMm: mm(S.wallX - oakBox.min.x), carcassToSkirtingMm: mm(S.backX - (S.wallX + .02)),
        heightMm: mm(oakBox.max.y), lengthMm: mm(oakBox.max.z - oakBox.min.z), depthMm: mm(oakBox.max.x - S.wallX),
        mugSeatMm: mm(mugBase - topY(sideboard.mugAt.x, sideboard.mugAt.z)), packSeatMm: mm(packBase - topY(sideboard.packAt.x, sideboard.packAt.z)),
        bottleSeatMm: mm(bottleBase - topY(sideboard.bottleAt.x, sideboard.bottleAt.z)), bottleSizeMm: [mm(bottleBox.max.x - bottleBox.min.x), mm(bottleBox.max.y - bottleBox.min.y)], bottleMugGapMm: mm(mugGap), bottlePackGapMm: mm(packGap),
        pulls: { color: `#${sideboard.pulls.material.color.getHexString()}`, metalness: sideboard.pulls.material.metalness, roughness: sideboard.pulls.material.roughness },
        propsInsideTop: propBox.min.x > oakBox.min.x && propBox.max.x < oakBox.max.x && propBox.min.z > oakBox.min.z && propBox.max.z < oakBox.max.z,
        paintingClearMm: mm(paintingBottom - Math.max(oakBox.max.y, propBox.max.y)), paintingBottomY: paintingBottom,
        standClearMm: stand ? mm(stand.min.z - Math.max(oakBox.max.z, propBox.max.z)) : null,
        meshes: [sideboard.oak, sideboard.pulls, sideboard.props, sideboard.bottle].length,
        vertices: [sideboard.oak, sideboard.pulls, sideboard.props, sideboard.bottle].reduce((n, m) => n + m.geometry.attributes.position.count, 0),
      };
    },
    rugMugDetails() { // local QA only: geometry, rug footprint, tabletop support and clearances
      scene.updateMatrixWorld(true);
      const box = (obj) => { const b = new THREE.Box3().setFromObject(obj); return { min: b.min.toArray(), max: b.max.toArray() }; };
      const rugInverse = rug.matrixWorld.clone().invert();
      const support = (obj, frontOfZ = -Infinity) => {
        let minY = Infinity; const v = new THREE.Vector3();
        obj.traverse((part) => {
          if (!part.isMesh) return;
          const pos = part.geometry.attributes.position;
          for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(part.matrixWorld); minY = Math.min(minY, v.y); }
        });
        let total = 0, outside = 0, minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
        obj.traverse((part) => {
          if (!part.isMesh) return;
          const pos = part.geometry.attributes.position;
          for (let i = 0; i < pos.count; i++) {
            v.fromBufferAttribute(pos, i).applyMatrix4(part.matrixWorld);
            if (v.y > minY + .02 || v.z < frontOfZ) continue;
            total++;
            const local = v.clone().applyMatrix4(rugInverse);
            minX = Math.min(minX, local.x); maxX = Math.max(maxX, local.x);
            minZ = Math.min(minZ, local.z); maxZ = Math.max(maxZ, local.z);
            if (Math.abs(local.x) > 1.3 || Math.abs(local.z) > .825) outside++;
          }
        });
        return { minY, total, outside, footprint: [minX, maxX, minZ, maxZ] };
      };
      const mugBox = new THREE.Box3().setFromObject(mugObj);
      const mugCenter = mugBox.getCenter(new THREE.Vector3());
      const tableSurface = new THREE.Raycaster(new THREE.Vector3(mugCenter.x, coffeeTop + 1, mugCenter.z), new THREE.Vector3(0, -1, 0)).intersectObject(coffeeObj, true)[0];
      const clearance = (other) => {
        const otherBox = new THREE.Box3().setFromObject(other);
        return { intersects: mugBox.intersectsBox(otherBox), x: Math.max(otherBox.min.x - mugBox.max.x, mugBox.min.x - otherBox.max.x, 0), z: Math.max(otherBox.min.z - mugBox.max.z, mugBox.min.z - otherBox.max.z, 0) };
      };
      const sofaSupport = support(sofaObj), sofaFrontSupport = support(sofaObj, new THREE.Box3().setFromObject(sofaObj).getCenter(new THREE.Vector3()).z), tableSupport = support(coffeeObj);
      const corners = [[-1.3, -.825], [1.3, -.825], [1.3, .825], [-1.3, .825]].map(([x, z]) => new THREE.Vector3(x, 0, z).applyMatrix4(rug.matrixWorld).toArray());
      let vertices = 0; const materials = new Set();
      mugObj.traverse((part) => { if (part.isMesh) { vertices += part.geometry.attributes.position.count; materials.add(part.material.color.getHexString()); } });
      return {
        rug: { rotationY: rug.rotation.y, bounds: box(rug), corners },
        sofaSupport, sofaFrontSupport,
        tableSupport, coffeeTable: { bounds: box(coffeeObj), topY: coffeeBounds.max.y, surfaceYAtMug: tableSurface?.point.y ?? null },
        mug: { bounds: box(mugObj), vertices, colors: [...materials].sort(), attached: mugObj.parent === scene, triangles: (() => { let n = 0; mugObj.traverse((part) => { if (part.isMesh) n += part.geometry.index ? part.geometry.index.count / 3 : part.geometry.attributes.position.count / 3; }); return n; })() },
        coffeeTopY: coffeeBounds.max.y, mugBaseY: mugBox.min.y,
        bookClearance: clearance(coffeeBook), laptopClearance: clearance(laptopObj),
        windowShadow: { enabled: windowLight.castShadow, radius: windowLight.shadow.radius, mapSize: windowLight.shadow.mapSize.toArray() },
      };
    },
    frameCoffeeMug() { // local QA only: a close view to verify the reused cup reads clearly on the table
      scene.updateMatrixWorld(true);
      const focus = new THREE.Box3().setFromObject(mugObj).getCenter(new THREE.Vector3());
      controls.target.copy(focus);
      camera.position.copy(focus).add(new THREE.Vector3(.48, .32, .75));
      camera.lookAt(focus); camera.fov = 42; camera.updateProjectionMatrix(); controls.update(); renderer.render(scene, camera);
      camera.updateMatrixWorld(true);
      return focus.toArray();
    },
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
    leftWallSmallPrint() { // local QA: physical size, image, geometry and clearance to neighbouring wall objects
      if (!leftWallSmallPrintGroup) return { built: false, ready: false, loaded: false };
      scene.updateMatrixWorld(true);
      const boxOf = (obj) => new THREE.Box3().setFromObject(obj);
      const pack = (box) => ({ min: box.min.toArray(), max: box.max.toArray() });
      const box = boxOf(leftWallSmallPrintGroup), image = leftWallSmallPrintGroup.getObjectByName("room01-left-wall-small-print-image");
      const imageBox = boxOf(image), boardBox = boxOf(homeBoard.getObjectByName("home-board-face")), rect = renderer.domElement.getBoundingClientRect();
      const corners = [[-leftWallSmallPrintSize.w / 2, -leftWallSmallPrintSize.h / 2], [leftWallSmallPrintSize.w / 2, -leftWallSmallPrintSize.h / 2], [-leftWallSmallPrintSize.w / 2, leftWallSmallPrintSize.h / 2], [leftWallSmallPrintSize.w / 2, leftWallSmallPrintSize.h / 2]].map(([x, y]) => new THREE.Vector3(x, y, 0).applyMatrix4(image.matrixWorld).project(camera));
      const gaps = (other) => {
        const b = boxOf(other), dx = Math.max(b.min.x - box.max.x, box.min.x - b.max.x, 0);
        const dy = Math.max(b.min.y - box.max.y, box.min.y - b.max.y, 0), dz = Math.max(b.min.z - box.max.z, box.min.z - b.max.z, 0);
        return { intersects: box.intersectsBox(b), distance: Math.hypot(dx, dy, dz), z: dz };
      };
      const turnEnvelope = (other) => {
        const b = boxOf(other), center = b.getCenter(new THREE.Vector3()), radius = b.getSize(new THREE.Vector3()).length() / 2;
        const dx = Math.max(box.min.x - center.x, center.x - box.max.x, 0);
        const dy = Math.max(box.min.y - center.y, center.y - box.max.y, 0);
        const dz = Math.max(box.min.z - center.z, center.z - box.max.z, 0);
        const clearance = Math.hypot(dx, dy, dz) - radius;
        return { intersects: clearance <= 0, distance: Math.max(0, clearance), radius };
      };
      let vertices = 0, meshes = 0;
      leftWallSmallPrintGroup.traverse((obj) => { if (obj.isMesh) { meshes++; vertices += obj.geometry.attributes.position.count; } });
      const xs = corners.map((p) => (p.x + 1) * rect.width / 2), ys = corners.map((p) => (1 - p.y) * rect.height / 2);
      return { built: true, ready: leftWallSmallPrintReady, loaded: leftWallSmallPrintLoaded,
        file: leftWallSmallPrintMat.map?.image?.src?.split("/").pop() ?? null,
        size: [leftWallSmallPrintMat.map?.image?.width ?? 0, leftWallSmallPrintMat.map?.image?.height ?? 0],
        place: { ...leftWallSmallPrintPlace }, bounds: pack(box), image: pack(imageBox), boardBounds: pack(boardBox), vertices, meshes,
        screenRect: { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) },
        clearances: { plant: gaps(plantObj), board: gaps(homeBoard), couplet: gaps(couplet), harbor: leftWallArtGroup ? gaps(leftWallArtGroup) : null, floorLamp: gaps(lampObj), roomRobot: gaps(robotObj), guideRobot: gaps(guidePivot), roomRobotTurn: turnEnvelope(robotObj), guideRobotTurn: turnEnvelope(guidePivot) } };
    },
    leftWallSecondPrint() { // local QA: bounds, shared hanging line, lazy load, and neighbouring-object clearance
      if (!leftWallSecondPrintGroup) return { built: false, ready: false, loaded: false };
      scene.updateMatrixWorld(true);
      const boxOf = (obj) => new THREE.Box3().setFromObject(obj);
      const pack = (box) => ({ min: box.min.toArray(), max: box.max.toArray() });
      const box = boxOf(leftWallSecondPrintGroup), image = leftWallSecondPrintGroup.getObjectByName("room01-left-wall-second-print-image");
      const imageBox = boxOf(image), firstBox = leftWallSmallPrintGroup ? boxOf(leftWallSmallPrintGroup) : null, rect = renderer.domElement.getBoundingClientRect();
      const corners = [[-leftWallSmallPrintSize.w / 2, -leftWallSmallPrintSize.h / 2], [leftWallSmallPrintSize.w / 2, -leftWallSmallPrintSize.h / 2], [-leftWallSmallPrintSize.w / 2, leftWallSmallPrintSize.h / 2], [leftWallSmallPrintSize.w / 2, leftWallSmallPrintSize.h / 2]].map(([x, y]) => new THREE.Vector3(x, y, 0).applyMatrix4(image.matrixWorld).project(camera));
      const blockers = { plant: plantObj, firstPrint: leftWallSmallPrintGroup, board: homeBoard, harbor: leftWallArtGroup, floorLamp: lampObj, windowFrame: windowFrameParts, curtains: curtainParts };
      const separation = (other) => {
        const b = boxOf(other), dx = Math.max(b.min.x - box.max.x, box.min.x - b.max.x, 0);
        const dy = Math.max(b.min.y - box.max.y, box.min.y - b.max.y, 0), dz = Math.max(b.min.z - box.max.z, box.min.z - b.max.z, 0);
        return { intersects: box.intersectsBox(b), distance: Math.hypot(dx, dy, dz), x: dx, y: dy, z: dz };
      };
      const clearances = Object.fromEntries(Object.entries(blockers).map(([name, value]) => {
        const parts = (Array.isArray(value) ? value : [value]).filter(Boolean).map(separation);
        return [name, parts.reduce((near, current) => !near || current.distance < near.distance ? current : near, null)];
      }));
      const collisions = Object.entries(blockers).flatMap(([name, value]) => (Array.isArray(value) ? value : [value]).filter(Boolean).some((part) => box.intersectsBox(boxOf(part))) ? [name] : []);
      let vertices = 0, meshes = 0;
      leftWallSecondPrintGroup.traverse((obj) => { if (obj.isMesh) { meshes++; vertices += obj.geometry.attributes.position.count; } });
      const xs = corners.map((p) => (p.x + 1) * rect.width / 2), ys = corners.map((p) => (1 - p.y) * rect.height / 2);
      return { built: true, ready: leftWallSecondPrintReady, loaded: leftWallSecondPrintLoaded,
        file: leftWallSecondPrintMat.map?.image?.src?.split("/").pop() ?? null,
        size: [leftWallSecondPrintMat.map?.image?.width ?? 0, leftWallSecondPrintMat.map?.image?.height ?? 0],
        place: { ...leftWallSecondPrintPlace }, bounds: pack(box), image: pack(imageBox), vertices, meshes, collisions, clearances,
        gapToFirst: firstBox ? firstBox.min.z - box.max.z : null, cornerClearance: box.min.z - BACK,
        screenRect: { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) } };
    },
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
    softDetails() { // local QA only: the coffee-table props' support and the flat suitcase's floor contact
      scene.updateMatrixWorld(true);
      const rounded = (v) => Number(v.toFixed(4));
      const bounds = (obj) => { if (!obj) return null; const b = new THREE.Box3().setFromObject(obj); return { min: b.min.toArray().map(rounded), max: b.max.toArray().map(rounded) }; };
      const already = [laptopObj, mugObj, coffeeBook].map((obj) => new THREE.Box3().setFromObject(obj));
      const items = soft.propBounds.map((b, i) => ({
        index: i,
        min: b.min.toArray().map(rounded), max: b.max.toArray().map(rounded),
        bottomGapMm: Number(((b.min.y - soft.propInfo.coffeeTop) * 1000).toFixed(2)),
        overlapsExisting: already.some((other) => other.intersectsBox(b)),
        insideTable: b.min.x > soft.propInfo.coffeeBounds.min[0] && b.max.x < soft.propInfo.coffeeBounds.max[0] && b.min.z > soft.propInfo.coffeeBounds.min[2] && b.max.z < soft.propInfo.coffeeBounds.max[2],
      }));
      return {
        props: { bounds: bounds(soft.propMesh), vertices: soft.propInfo.vertices, items, coffeeTable: soft.propInfo.coffeeBounds, coffeeTop: soft.propInfo.coffeeTop, spots: { book: soft.propInfo.bookSpot, bowl: soft.propInfo.bowlSpot, remote: soft.propInfo.remoteSpot } },
        suitcase: soft.suitcaseInfo,
        lights: scene.children.filter((child) => child.isLight).length,
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
      const scarfWidth = scarfMesh.geometry.userData.width;
      const scarfThick = scarfMesh.geometry.userData.thick;
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
        scarfBump: !!standScarfMat.bumpMap, scarfBumpScale: standScarfMat.bumpScale,
        scarfFringe: !!standGroup.getObjectByName("hall-stand-scarf-fringe"),
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
        gapBoard: box.min.z - face.max.z,
        gapArt: leftWallArtPlace.z - (leftPaintSize.w + leftFrameMargin) / 2 - box.max.z,
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
