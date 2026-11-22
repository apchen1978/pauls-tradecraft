// ROOMVERSE 3D: the same soft-furnishing idea as ROOM MODE REMOTE, as a small 3D room you can turn.
// Loaded only after the visitor presses "enter" (index.html), so the portfolio page stays light.
// Furniture: sofa, coffee table, side table, table lamp, floor lamp and plant were drawn as single illustrations, turned into shapes by an
// image-to-3D model, then coloured locally from the same illustrations. Walls, rug, light: drawn by code.
// Built and checked in a local trial first (Desktop CC_3D軟裝房間試作_2026-10-16, README trials 1-8).
import * as THREE from "./vendor/three.module.min.js"; // three.js r160 (MIT), self-hosted: the site loads nothing from other hosts
import { OrbitControls } from "./vendor/OrbitControls.js";
import { GLTFLoader } from "./vendor/GLTFLoader.js";
import { mergeGeometries } from "./vendor/BufferGeometryUtils.js";
import { createRoomMusic } from "./sound.js?v=auto";

export const TEXT = {
  zh: { mood: "感覺", wall: "牆面", rug: "地毯", curtain: "窗簾", print: "掛畫", hint: "拖一下轉動房間，或點「看電視牆」。網址會記住你搭的房間，複製給朋友就能看到同一間。", windowView: "回到窗邊", doorView: "從門口看進來", tvView: "看電視牆", entryView: "看看入口角落", recordView: "看唱片機", canvas: "3D 軟裝房間，可以拖曳轉動角度", save: "存成明信片", shuffle: "幫我隨機搭一間", director: "看 8 秒房間短片", stop: "停止短片", close: "收起對照", preparing: "短片準備中…", unavailable: "窗景暫時無法載入，請再試一次。", previewTitle: "明信片已準備好", previewLongPress: "長按圖片即可儲存到相簿", previewOpenBrowser: "或點右上角「⋯」選「在瀏覽器開啟」後再按存成明信片", previewClose: "關閉明信片預覽", previewAlt: "ROOMVERSE 3D 明信片", directorPhases: ["雨天暖燈", "白天自然光", "夜晚冷暖光"], directorStill: "同一間房，從雨天的暖燈、白天的自然光，到夜晚的冷暖對照；小機器人最後回頭看你。", directorDone: "短片結束，已回到你原來的房間。", file: "ROOMVERSE-3D-明信片.png", artFile: "ROOMVERSE-3D-插畫明信片.webp" },
  en: { mood: "Feeling", wall: "Wall", rug: "Rug", curtain: "Curtains", print: "Wall print", hint: "Drag to turn the room, or tap ‘Turn to the TV wall’. The address remembers your room, so a copied link opens the same one.", windowView: "Back to the window", doorView: "From the doorway", tvView: "Turn to the TV wall", entryView: "Explore the entry", recordView: "The record player", canvas: "A 3D living room; drag to turn it", save: "Save as a postcard", shuffle: "Surprise me with a room", director: "Watch the 8-second room tour", stop: "Stop the tour", close: "Close comparison", preparing: "Preparing the tour…", unavailable: "The window view could not load. Please try again.", previewTitle: "Your postcard is ready", previewLongPress: "Press and hold the picture to save it to your photos", previewOpenBrowser: "Or tap “⋯” in the upper-right menu and choose “Open in browser”, then tap Save as a postcard", previewClose: "Close postcard preview", previewAlt: "ROOMVERSE 3D postcard", directorPhases: ["Rain · warm lamps", "Daylight", "Night · warm and cool"], directorStill: "One room: warm lamps on a rainy day, daylight, then a cool-and-warm evening. The little robot turns to greet you at the end.", directorDone: "Tour finished. Your room is back as you left it.", file: "ROOMVERSE-3D-postcard.png", artFile: "ROOMVERSE-3D-illustrated-postcard.webp" },
};
// Short labels for the single-row phone toolbar. The accessible name stays the full phrase above.
const PHONE_BAR = {
  zh: { shuffle: "隨機搭一間", save: "存成明信片", director: "8秒短片", stop: "停止短片", close: "收起對照", preparing: "準備中" },
  en: { shuffle: "Random room", save: "Save postcard", director: "8s tour", stop: "Stop", close: "Close", preparing: "Preparing" },
};
const GUIDE_LINE = { zh: "想去哪個房間？", en: "Which room would you like to visit?" };
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
    why: { zh: "窗外偏冷時，屋裡就用暖黃的燈和米白布料把溫度補回來，讓人想宅在家裡一天也很舒服。", en: "When it's cool and grey outside, warm lamps and cream fabrics bring the warmth back indoors, so a whole day at home feels good." }, hemi: .78, win: .7, winCol: "#bccbdb", lamp: 5, fill: 1.05, out: "#eef1f3", exposure: 1.05, floor: 2.2, glow: .55 },
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
    why: { zh: "低角度的夕陽把窗影拉長，剛亮起的暖燈讓傍晚更有回家的感覺。", en: "Low golden sunlight stretches the window shadows while newly lit lamps make the evening feel like home." }, hemi: 1.3, win: 8, winCol: "#ffc477", lamp: 2.5, fill: 1.8, out: "#fff0df", exposure: 1.2, floor: 0, glow: .22, sunY: 1.5, shadowRadius: 4 },
  tv: { zh: "追劇夜", en: "Series night",
    why: { zh: "週五晚上，關掉主燈，只留燈帶和一盞暖燈，沙發就是整個世界。", en: "Friday night: ceiling light off, just the warm strips and one lamp; the sofa is the whole world." }, hemi: .62, win: .7, winCol: "#56647f", lamp: 2.5, fill: .55, out: "#c6cad6", exposure: .98, floor: .45, glow: .48 },
};

export async function start({ stage, panel, lang, onReady, onTravelChoice = () => {}, arriveFromRoom02 = false }) {
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
  const DESKTOP_EYE_RISE = .22; // metres above orbitCenter.y for the default desktop pose (see fit())
  const requestedView = new URLSearchParams(location.search).get("view");
  let viewTheta = requestedView === "tv" ? Math.PI : requestedView === "entry" ? -Math.PI / 2 : 0;
  let currentView = requestedView === "tv" || requestedView === "entry" ? requestedView : "window";
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
    // Depth along the view axis, not the flat distance to the wall: above 0.8 the eye stands DESKTOP_EYE_RISE over the plaque and looks down at the orbit centre, so the flat distance was
    // about 1.4% too long and the edge landed at 0.973 instead of 0.96 (four phone sizes failed the 0.97 framing test). Below 0.8 the pose is level and this equals the old value.
    const phi = camera.aspect < .8 ? Math.PI / 2 : Math.acos(DESKTOP_EYE_RISE / radius), eye = cameraAt(0, radius, phi), axis = orbitCenter.clone().sub(eye).normalize();
    const depth = new THREE.Vector3(TX + .35, 1.5, BACK + .015).sub(eye).dot(axis);
    const tanHalf = (TX + .35) / (depth * camera.aspect * .96);
    return 2 * Math.atan(tanHalf) * 180 / Math.PI;
  }
  let doorBlend = 0; // 0 in the orbit views, 1 in the doorway view: the field of view widens as the camera glides there and narrows on the way back
  const doorFov = () => (camera.aspect < .8 ? 88 : 82); // Paul 2026-11-20: the sweep was too short; now wide enough to take in the TV console's left end as well
  function fovForYaw() { const base = fovForYawOrbit(); return doorBlend > 0 ? base + (doorFov() - base) * doorBlend : base; }
  function fovForYawOrbit() {
    if (director) return baseFov();
    const base = Math.max(baseFov(), plaqueWindowFov());
    // Short phone stages can be wider than .8 even though their TV shelves no longer fit at 44°.
    // Frame the shelves' outer edges (±2.13 m), with a little breathing room, from the TV pose.
    // Keep the TV end at least as wide as the window, so the blend never tightens mid-turn.
    const tvFov = camera.aspect < .8 ? Math.max(76, base) : phoneViewport.matches
      ? Math.max(base, 2 * Math.atan(2.3 / ((FRONT - orbitCenter.z + orbitRadius) * camera.aspect)) * 180 / Math.PI)
      : base;

    // 0 faces the window, ±π faces the TV wall. The cosine keeps intermediate turns smooth.
    const yaw = Math.atan2(camera.position.x - orbitCenter.x, camera.position.z - orbitCenter.z);
    const entryWeight = Math.pow(Math.max(0, -Math.sin(yaw)), 2);
    const entryWidening = camera.aspect < .8 ? 18 : 14;
    return base + (tvFov - base) * (1 - Math.cos(yaw)) / 2 + entryWidening * entryWeight;
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
    // Desktop stages sit a little above the level pose (eye about 1.5 m, looking slightly down) so the low chair and the robot by the rug land
    // inside the frame instead of being cut by its bottom edge. Phones keep the level pose.
    orbitPhi = camera.aspect < .8 ? Math.PI / 2 : Math.acos(DESKTOP_EYE_RISE / orbitRadius);
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
    softwhite: { zh: "柔和霧白", en: "Soft mist white", paint: "#e9e8e2" },
    sand: { zh: "暖砂米", en: "Warm sand", paint: "#d9c6a8" },
    olive: { zh: "柔橄欖", en: "Soft olive", paint: "#a9ad8a" },
    blush: { zh: "霧粉", en: "Dusty blush", paint: "#e6cec6" },
    mist: { zh: "霧灰藍", en: "Misty blue-grey", paint: "#c3ccd2" },
    pine: { zh: "深松綠", en: "Deep pine", paint: "#46604f" },
    dusk: { zh: "暮色深藍", en: "Dusk navy", paint: "#66788d" },
    wine: { zh: "深酒紅", en: "Deep wine", paint: "#875b5e" },
    // size = metres per tile (the wall's UVs are in metres); about 5 x 3 tiles on the back wall
    stripe: { zh: "細條紋壁紙", en: "Fine-stripe wallpaper", size: 1.0, tex: image("wallpaper-stripe-v1", true) },
    botanical: { zh: "淡色植紋壁紙", en: "Soft botanical wallpaper", size: 1.8, tex: image("wallpaper-botanical-v1", true) },
    grasscloth: { zh: "暖燕麥草織", en: "Warm oatmeal grasscloth", size: 2.2, tex: image("wallpaper-grasscloth-oat-v1", true) },
    sagewash: { zh: "鼠尾草石灰洗", en: "Sage limewash", size: 2.4, tex: image("wallpaper-sage-limewash-v1", true) },
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
  const sideMat = new THREE.MeshStandardMaterial({ color: "#dce3e8", roughness: .95 }); // lighter mist-blue echo balances the entry accent across the room
  const entrySideMat = new THREE.MeshStandardMaterial({ color: "#d0deea", roughness: .95 }); // mist-blue accent at the entry, echoing Room 03
  // side walls and ceiling cast too: otherwise window light leaks through them (a bright band on the right wall, a patch at the left)
  [-1, 1].forEach((s) => { add(new THREE.PlaneGeometry(D, H + .3), s === 1 ? entrySideMat : sideMat, s * W / 2, H / 2 - .15, BACK + D / 2, true).rotation.y = -s * Math.PI / 2; });
  add(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ color: "#f6f2ea", emissive: "#f6f2ea", emissiveIntensity: .12 }), 0, H, BACK + D / 2, true).rotation.x = Math.PI / 2;
  const wood = new THREE.MeshStandardMaterial({ color: "#8a5a36", roughness: .6 });
  const skirting = new THREE.MeshStandardMaterial({ color: "#f3efe6", roughness: .7 });
  add(new THREE.BoxGeometry(W, .09, .02), skirting, 0, .045, BACK + .01, false);
  add(new THREE.BoxGeometry(W, .09, .02), skirting, 0, .045, FRONT - .015, false).name = "front-skirting";
  // A slim warm-white corner bead separates the mist-blue side wall from the sofa/window wall.
  const curtainSideCornerTrim = add(new THREE.BoxGeometry(.045, H - .09, .045), skirting, -W / 2 + .0225, (H + .09) / 2, BACK + .0225, false);
  curtainSideCornerTrim.name = "curtain-side-wall-corner-trim";
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
  // Paul 2026-11-20: a smart lock like his own (a slim black body with a card reader and a fingerprint pad, an aluminium lever): tap a key card on the reader and it beeps, the light turns green and the door opens.
  const lockBlack = new THREE.MeshStandardMaterial({ color: "#18191c", roughness: .42, metalness: .35 }), lockGlass = new THREE.MeshStandardMaterial({ color: "#0b0c0f", roughness: .18, metalness: .2 }), doorAlu = new THREE.MeshStandardMaterial({ color: "#c9ccd0", metalness: .15, roughness: .36 });
  const lockLedMat = new THREE.MeshStandardMaterial({ color: "#222a35", emissive: "#3a6bff", emissiveIntensity: .35, roughness: .4 });
  doorPiece(new THREE.BoxGeometry(.05, .34, .014), lockBlack, .34, .99, .027, "door-handle-plate");
  doorPiece(new THREE.BoxGeometry(.034, .046, .004), lockGlass, .34, 1.1, .0355, "door-lock-reader");
  doorPiece(new THREE.SphereGeometry(.0032, 12, 8), lockLedMat, .34, 1.075, .0375, "door-lock-led");
  doorPiece(new THREE.BoxGeometry(.02, .028, .004), lockGlass, .34, .88, .0355, "door-lock-fingerprint");
  doorPiece(new THREE.CylinderGeometry(.0042, .0042, .005, 12), doorAlu, .34, .84, .0345, "door-lock-keyhole").rotation.x = Math.PI / 2;
  doorPiece(new THREE.CylinderGeometry(.009, .009, .035, 10), doorAlu, .34, 1.0, .048, "door-handle-stem").rotation.x = Math.PI / 2;
  doorPiece(new THREE.CylinderGeometry(.009, .009, .125, 12), doorAlu, .287, 1.0, .065, "door-handle").rotation.z = Math.PI / 2;
  [.35, 1.7].forEach((y) => doorPiece(new THREE.CylinderGeometry(.008, .008, .065, 8), doorBrass, -.448, y, .025, "door-hinge"));
  // The portal to Room 02: the leaf and handle sit on a pivot at the hinge edge so the door can swing into the room.
  // At rest the pivot is turned 0 and every world position is exactly what it was before.
  const doorSwing = new THREE.Group(); doorSwing.name = "door-swing"; doorSwing.position.set(-.443, 0, 0); roomDoor.add(doorSwing);
  roomDoor.updateMatrixWorld(true);
  for (const m of [doorLeaf, ...["door-handle-plate", "door-handle-stem", "door-handle", "door-lock-reader", "door-lock-led", "door-lock-fingerprint", "door-lock-keyhole"].map((n) => roomDoor.getObjectByName(n))]) doorSwing.attach(m);
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
  const pictureFile = (texture) => texture?.image?.src?.split("?")[0].split("/").pop() ?? texture?.userData?.file ?? null; // the rain view is redrawn on a canvas, which has no src
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
    // Paul 2026-11-18: the shelf books are little real books now. Each is one vertex-coloured mesh and they all share one material: two cover boards a little
    // taller and deeper than the cream page block (a 3 mm overhang on the three open sides), a rounded spine facing the room, and a pale title band near its top.
    const bookMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .82 });
    const PAGES = 0xeee6d2, BAND = 0xe3d3a8;
    const painted = (geo, hex) => {
      const g = geo.index ? geo.toNonIndexed() : geo; g.deleteAttribute("uv");
      const c = new THREE.Color(hex), n = g.attributes.position.count, a = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) c.toArray(a, i * 3);
      g.setAttribute("color", new THREE.BufferAttribute(a, 3)); return g;
    };
    // Standing upright: thickness along x, height along y (bottom at 0), the spine towards the room (-z), the fore-edge at +z.
    const bookGeometry = (width, height, depth, cover, band = BAND) => {
      const t = .0022, o = .003, r = width / 2, sz = .55, spineZ = -depth / 2 + r * sz, parts = [];
      for (const side of [-1, 1]) parts.push(painted(new THREE.BoxGeometry(t, height, depth / 2 - spineZ).translate(side * (r - t / 2), height / 2, (spineZ + depth / 2) / 2), cover));
      parts.push(painted(new THREE.CylinderGeometry(r, r, height, 8, 1, false, Math.PI / 2, Math.PI).scale(1, 1, sz).translate(0, height / 2, spineZ), cover));
      parts.push(painted(new THREE.BoxGeometry(width - 2 * t, height - 2 * o, depth / 2 - o - spineZ).translate(0, height / 2, (spineZ + depth / 2 - o) / 2), PAGES));
      const bandH = Math.min(.012, height * .06);
      parts.push(painted(new THREE.CylinderGeometry(r + .0006, r + .0006, bandH, 8, 1, false, Math.PI / 2, Math.PI).scale(1, 1, sz).translate(0, height * .8, spineZ - .0003), band));
      const geo = mergeGeometries(parts, false); parts.forEach((p) => p.dispose()); geo.computeVertexNormals(); return geo;
    };
    // Seven upright books on the upper left shelf, close together (3 mm apart), heights varied, the last one leaning a little away. Colours from the room:
    // navy, cream with a rust band, rust, olive, navy, mustard, plum.
    const uprights = [["navy", .040, .315, 0x34445e], ["cream", .036, .285, 0xe2d9c4, 0xa65a3c], ["rust", .043, .345, 0x9c4f35], ["olive", .038, .300, 0x6f7a4e],
      ["navy-short", .036, .270, 0x34445e], ["mustard", .034, .290, 0xc19243], ["plum", .037, .262, 0x6e3b52]];
    // Paul 2026-11-19 (t257u): seven books standing dead straight looked unreal. The first five stand upright 3 mm apart from near the left side; the last two
    // lean 16 degrees at the open end: the mustard one rests its spine-side cover on the top corner of the short navy book (its foot corner on the board),
    // and the plum one lies flush against the mustard one, its foot on the board too. Positions are solved from the angle, so nothing floats or cuts in.
    const LEAN = 16 * Math.PI / 180;
    let edge = -.2455, support = null; // Paul 2026-11-21: the top shelf should be full: the five upright books now start at the left end of the shelf and three more stand after the leaning pair, out to the right end
    uprights.forEach(([name, w, h, cover, band], i) => {
      const volume = new THREE.Group(); volume.name = `shelf-book-${name}`;
      mesh(volume, bookGeometry(w, h, .086, cover, band), bookMat, 0, 0, 0);
      if (i < 5) { // upright; the edge runs left to right with 3 mm between books
        place(volume, "left-upper", edge + w / 2, w + .002, .091); edge += w + .003;
        support = { name: volume.name, right: edge - .003, top: h, w };
        return;
      }
      volume.rotation.z = LEAN; // the top tips towards the upright books
      // foot corner x: against the upright's top corner (tall enough) or with its own top corner on that book's face; or flush on the previous leaning book
      const foot = support.leaning ? support.foot + support.w / Math.cos(LEAN)
        : support.right + (h * Math.cos(LEAN) >= support.top ? support.top * Math.tan(LEAN) : h * Math.sin(LEAN));
      place(volume, "left-upper", foot + w / 2 * Math.cos(LEAN), .06, .091);
      Object.assign(shelfDecor.children[shelfDecor.children.length - 1].userData, { leansOn: support.name, leanDeg: 16, bookW: w, bookH: h, contact: support.leaning ? "face" : "corner" });
      support = { name: volume.name, leaning: true, foot, w };
    });
    edge = support.foot + support.w / Math.cos(LEAN) + .003; // the books after the leaning pair stand upright against its foot, 3 mm apart, out to the right-hand light strip
    for (const [name, w, h, cover, band] of [["teal", .040, .318, 0x3f6466], ["sand", .036, .282, 0xcdbd98, 0x8a5a3a], ["wine", .042, .335, 0x6a2f3a]]) {
      const volume = new THREE.Group(); volume.name = `shelf-book-${name}`;
      mesh(volume, bookGeometry(w, h, .086, cover, band), bookMat, 0, 0, 0);
      place(volume, "left-upper", edge + w / 2, w + .002, .091); edge += w + .003;
    }
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
    // Three books lying flat, flush on one another (covers on covers), each turned and shifted a touch so the pile looks set down by hand. One mesh.
    const stack = new THREE.Group(); stack.name = "shelf-horizontal-book-stack";
    { let y = 0; const lying = [];
      for (const [len, thick, d, cover, yaw, dx] of [[.274, .050, .091, 0x3f6466, .03, .004], [.252, .052, .088, 0x9c4f35, -.04, -.006], [.263, .048, .090, 0x6f7a4e, .02, .008]]) {
        lying.push(bookGeometry(thick, len, d, cover).rotateZ(Math.PI / 2).translate(len / 2, thick / 2, 0).rotateY(yaw).translate(dx, y, 0)); y += thick;
      }
      mesh(stack, mergeGeometries(lying, false), bookMat, 0, 0, 0); lying.forEach((g) => g.dispose()); }
    place(stack, "right-lower", -.05, .286, .096);
    // Paul 2026-11-19: the mini Tatung rice cooker (大同電鍋), in its classic look: a glossy red body with rounded (bevelled) foot and rim, a white logo band
    // with a small red mark, a domed chrome-ish lid with a black knob, two side handles, and a front switch lever with a little indicator light. Two meshes:
    // one vertex-coloured body and the metal lid. It stands in the bottom compartment of the shelf by the entrance door, beside the low ceramic dish.
    const cooker = new THREE.Group(); cooker.name = "shelf-mini-tatung-cooker";
    { const lathe = (pts) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 24), BLACK = 0x18181a, parts = [];
      parts.push(painted(lathe([[0, 0], [.036, 0], [.0405, .0015], [.0428, .005], [.0438, .010], [.0442, .040], [.0440, .064], [.0430, .068], [.0412, .0705], [.0395, .071]]), 0xc4231d));
      parts.push(painted(new THREE.CylinderGeometry(.0447, .0447, .010, 24, 1, true).translate(0, .044, 0), 0xf6f3ec));
      parts.push(painted(new THREE.BoxGeometry(.014, .0045, .0012).translate(0, .044, -.0452), 0xb21f1a));
      parts.push(painted(new THREE.CylinderGeometry(.0042, .0058, .0065, 12).translate(0, .0955, 0), BLACK));
      parts.push(painted(new THREE.SphereGeometry(.0062, 10, 6).scale(1, .55, 1).translate(0, .0992, 0), BLACK));
      for (const side of [-1, 1]) {
        parts.push(painted(new THREE.BoxGeometry(.0065, .006, .03).translate(side * .0505, .058, 0), BLACK));
        for (const z of [-.011, .011]) parts.push(painted(new THREE.BoxGeometry(.0075, .005, .004).translate(side * .046, .058, z), BLACK));
      }
      parts.push(painted(new THREE.BoxGeometry(.016, .02, .004).translate(0, .021, -.0448), BLACK));
      parts.push(painted(new THREE.BoxGeometry(.006, .012, .006).rotateX(-.5).translate(0, .023, -.0485), 0x2c2c2e));
      parts.push(painted(new THREE.SphereGeometry(.0024, 8, 6).translate(0, .036, -.0442), 0xff8c2a));
      const geo = mergeGeometries(parts, false); parts.forEach((p) => p.dispose()); geo.computeVertexNormals();
      mesh(cooker, geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .3, metalness: .08 }), 0, 0, 0).name = "shelf-mini-tatung-cooker-body";
      const lid = lathe([[.0398, .0705], [.0418, .0715], [.0422, .0735], [.0405, .0765], [.036, .083], [.027, .0895], [.015, .093], [0, .094]]);
      mesh(cooker, lid, new THREE.MeshStandardMaterial({ color: 0xe2e5e8, roughness: .22, metalness: .5 }), 0, 0, 0).name = "shelf-mini-tatung-cooker-lid";
      cooker.children.forEach((m) => { m.castShadow = true; }); }
    // Paul 2026-11-19: on the entrance side's bottom shelf (mirrored from the first spot by the coat stand), on the door side of the dish, about 6 cm clear of it.
    // 1.08x keeps it inside the 11 cm shelf depth (the switch lever is the front-most point), nudged 5 mm towards the wall.
    cooker.scale.setScalar(1.08); cooker.position.z = .005;
    place(cooker, "left-lower", .125, .11, .09);
    // Paul 2026-11-22: the burgundy wine bottle of Room 03's Thanksgiving table (a dark green glass bottle with a cream band and a burgundy foil capsule) stands in the bottom compartment of the
    // viewer's left shelf, at the outer end beyond the little cooker. One vertex-coloured mesh built from the same profile.
    {
      const wine = new THREE.Group(); wine.name = "shelf-wine-bottle";
      const parts = [[[[0, 0], [.034, 0], [.038, .006], [.038, .06], [0, .06]], 0x1f2b22], [[[0, .06], [.038, .06], [.038, .14], [0, .14]], 0xd8ceba], [[[0, .14], [.038, .14], [.038, .17], [.034, .19], [.022, .215], [.0155, .235], [.015, .255], [0, .255]], 0x1f2b22], [[[0, .255], [.015, .255], [.015, .285], [.0165, .292], [.0165, .30], [0, .30]], 0x5a1a22]].map(([profile, hex]) => {
        const g = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 28), colour = new THREE.Color(hex), colors = new Float32Array(g.attributes.position.count * 3);
        for (let i = 0; i < g.attributes.position.count; i++) colour.toArray(colors, i * 3);
        g.deleteAttribute("uv"); g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3)); return g;
      });
      const bottle = new THREE.Mesh(mergeGeometries(parts, false), new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: .3, metalness: 0 }));
      bottle.castShadow = true; bottle.receiveShadow = true; wine.add(bottle);
      place(wine, "left-lower", .235, .085, .085);
    }
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
      // A matched pair of compact two-way speakers: warm oak cabinets tie into the built-in,
      // while the graphite baffles and two visible drivers read clearly against the dark TV.
      // The pair is merged by material so it adds only four draw calls, not one per detail.
      const SPEAKER = { width: .17, height: .28, depth: .19, x: .82 };
      const speakerWood = surface("tv-console", "#ffffff", [SPEAKER.width / .8, SPEAKER.height / .8]);
      const speakerFace = canvasTex(256, 420, (ctx, w, h) => {
        ctx.fillStyle = "#454640"; ctx.fillRect(0, 0, w, h);
        const driver = (y, radius, inner) => {
          ctx.fillStyle = "#c9c1ae"; ctx.beginPath(); ctx.arc(w / 2, y, radius, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "#c4a56f"; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(w / 2, y, radius - 5, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = "#756f62"; ctx.beginPath(); ctx.arc(w / 2, y, inner, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#e4ddcf"; ctx.beginPath(); ctx.arc(w / 2, y, inner * .45, 0, Math.PI * 2); ctx.fill();
        };
        driver(h * .65, w * .36, w * .12);
        driver(h * .16, w * .17, w * .05);
      });
      const speakerBaffleMat = new THREE.MeshStandardMaterial({ map: speakerFace, color: "#ffffff", roughness: .82, side: THREE.DoubleSide });
      const speakerConeMat = new THREE.MeshStandardMaterial({ color: "#c4bda9", roughness: .90, side: THREE.DoubleSide });
      const speakerTrimMat = new THREE.MeshStandardMaterial({ color: "#b29b70", metalness: .28, roughness: .62 });
      const speakerParts = { wood: [], baffle: [], cone: [], trim: [] };
      // The old vase and single book duplicate the shelf vessel and new console books.
      // Clear those spots so the speaker pair has a real, collision-free seat.
      for (const name of ["tv-vase-body", "tv-vase-neck", "tv-book-one"]) {
        const item = scene.getObjectByName(name);
        if (item) item.visible = false;
      }
      const roundedSpeakerShape = (width, height, radius) => {
        const s = new THREE.Shape(), x = width / 2, y = height / 2, r = radius;
        s.moveTo(-x + r, -y); s.lineTo(x - r, -y); s.quadraticCurveTo(x, -y, x, -y + r);
        s.lineTo(x, y - r); s.quadraticCurveTo(x, y, x - r, y);
        s.lineTo(-x + r, y); s.quadraticCurveTo(-x, y, -x, y - r);
        s.lineTo(-x, -y + r); s.quadraticCurveTo(-x, -y, -x + r, -y);
        return s;
      };
      const speakerPart = (geo, list, x, y, z, yaw = Math.PI) => {
        geo.applyMatrix4(new THREE.Matrix4().compose(
          new THREE.Vector3(x, y, z),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0)),
          new THREE.Vector3(1, 1, 1),
        ));
        list.push(geo);
      };
      for (const side of [-1, 1]) {
        const x = side * SPEAKER.x, z = 0, h = SPEAKER.height, d = SPEAKER.depth;
        const cabinet = new THREE.ExtrudeGeometry(roundedSpeakerShape(SPEAKER.width, h, .014), {
          depth: d, bevelEnabled: true, bevelSize: .003, bevelThickness: .003, bevelSegments: 2, curveSegments: 5,
        });
        cabinet.translate(0, 0, -d / 2);
        speakerPart(cabinet, speakerParts.wood, x, h / 2, z);
        const baffle = new THREE.ExtrudeGeometry(roundedSpeakerShape(SPEAKER.width - .016, h - .016, .012), { depth: .003, bevelEnabled: false, curveSegments: 5 });
        baffle.translate(0, 0, d / 2 + .001);
        speakerPart(baffle, speakerParts.baffle, x, h / 2, z);
        // Duplicate the shallow driver relief on both cabinet faces so the room-facing side
        // stays readable even if the local wall/view convention changes.
        for (const sign of [-1, 1]) {
          const yaw = sign > 0 ? Math.PI : 0, faceZ = sign * (d / 2 + .015);
          const wooferY = .095, tweeterY = .222;
          speakerPart(new THREE.TorusGeometry(.052, .0042, 8, 32), speakerParts.trim, x, wooferY, faceZ + sign * .002, yaw);
          speakerPart(new THREE.CircleGeometry(.044, 32), speakerParts.cone, x, wooferY, faceZ + sign * .003, yaw);
          speakerPart(new THREE.CircleGeometry(.012, 24), speakerParts.trim, x, wooferY, faceZ + sign * .005, yaw);
          speakerPart(new THREE.TorusGeometry(.021, .0032, 8, 24), speakerParts.trim, x, tweeterY, faceZ + sign * .002, yaw);
          speakerPart(new THREE.CircleGeometry(.014, 24), speakerParts.cone, x, tweeterY, faceZ + sign * .004, yaw);
        }
      }
      const mergeSpeakerParts = (parts) => {
        const source = parts.map((geo) => geo.index ? geo.toNonIndexed() : geo);
        const merged = mergeGeometries(source, false);
        parts.forEach((geo) => geo.dispose());
        merged.computeVertexNormals();
        return merged;
      };
      const speakers = new THREE.Group(); speakers.name = "tv-wall-speakers";
      speakers.userData.unitBoxes = [-SPEAKER.x, SPEAKER.x].map((x) => new THREE.Box3(
        new THREE.Vector3(x - .088, -.003, -.117),
        new THREE.Vector3(x + .088, .283, .117),
      ));
      for (const [kind, mat] of [["wood", speakerWood], ["baffle", speakerBaffleMat], ["cone", speakerConeMat], ["trim", speakerTrimMat]]) {
        const mesh = piece(speakers, mergeSpeakerParts(speakerParts[kind]), mat, 0, 0, 0);
        mesh.name = `tv-speakers-${kind}`;
      }
      onConsole(speakers, 0, FRONT - .38);
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
  const VIEW_FILES = { rain: "rain", family: "family", tech: "tech", chic: "chic", slow: "family", golden: "golden", tv: "tech" }; // slow and series night reuse existing paintings; golden hour has its own dusk painting of the same street, sun low on the left like the room's sun (Codex, 2026-11-12)
  const viewReady = {};
  // Rainy day: the painting already shows a grey sky and a wet street, but no rain was falling and the glass was dry. Falling rain (short strokes leaning one way; these are what read from across the room and on a phone), a few runs down the pane and some beads are drawn once onto the picture when it
  // loads (the picture plane sits 4 cm behind the frame, where the pane is), so the room gains no mesh, no draw call and no animation loop. Beads and
  // runs are about three times life size: at true size (3-8 mm) they would be smaller than one screen pixel. Same drops every visit (fixed seed).
  const rainOnGlass = (image) => {
    const canvas = document.createElement("canvas"); canvas.width = image.width; canvas.height = image.height;
    const g = canvas.getContext("2d"), w = canvas.width, h = canvas.height;
    g.drawImage(image, 0, 0, w, h);
    g.fillStyle = "rgba(198,210,218,.08)"; g.fillRect(0, 0, w, h); // a wet pane is slightly milky
    let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const bead = (x, y, r) => { // a drop is a tiny lens: pale body, dark rim, one glint
      const body = g.createRadialGradient(x, y + r * .25, r * .1, x, y, r);
      body.addColorStop(0, "rgba(255,255,255,.46)"); body.addColorStop(.7, "rgba(212,224,232,.2)"); body.addColorStop(1, "rgba(28,38,48,.46)");
      g.fillStyle = body; g.beginPath(); g.ellipse(x, y, r * .86, r, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "rgba(255,255,255,.78)"; g.beginPath(); g.arc(x - r * .3, y - r * .38, Math.max(1, r * .18), 0, Math.PI * 2); g.fill();
    };
    g.lineCap = "round";
    for (let i = 0; i < 620; i++) { // rain in the air outside: short pale strokes, all leaning the same way with the wind
      const x = rnd() * w * 1.1 - w * .05, y = rnd() * h, len = 70 + rnd() * 110;
      g.strokeStyle = `rgba(226,236,243,${(.16 + rnd() * .22).toFixed(2)})`; g.lineWidth = 2.6 + rnd() * 2.2;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + len * .17, y + len); g.stroke();
    }
    for (let i = 0; i < 22; i++) { // runs: a drop that grew heavy and slid, leaving a thin wet track that wanders a little
      const x0 = rnd() * w, y0 = rnd() * h * .8, len = 220 + rnd() * 560, width = 8 + rnd() * 5, sway = 6 + rnd() * 12, phase = rnd() * 6;
      const track = (dx, style, lineWidth) => {
        const fade = g.createLinearGradient(0, y0, 0, y0 + len); fade.addColorStop(0, "rgba(0,0,0,0)"); fade.addColorStop(1, style);
        g.strokeStyle = fade; g.lineWidth = lineWidth; g.beginPath();
        for (let k = 0; k <= 16; k++) { const t = k / 16, x = x0 + dx + Math.sin(phase + t * 4.2) * sway * t, y = y0 + len * t; if (k) g.lineTo(x, y); else g.moveTo(x, y); }
        g.stroke();
      };
      track(2.4, "rgba(24,34,44,.3)", width); track(0, "rgba(236,243,247,.44)", width * .62);
      bead(x0 + Math.sin(phase + 4.2) * sway, y0 + len, width * 1.25 + rnd() * 5);
    }
    for (let i = 0; i < 70; i++) { const r = 6 + rnd() * rnd() * 14; bead(rnd() * w, rnd() * h, r); }
    return canvas;
  };
  const VIEWS = Object.fromEntries(Object.entries(VIEW_FILES).map(([m, f]) => [m, () => {
    let settle;
    viewReady[m] = new Promise((resolve) => { settle = resolve; });
    const t = viewLoader.load(new URL(`./window/window-${f}-v1.webp`, import.meta.url).href, () => { if (m === "rain") { t.userData.file = `window-${f}-v1.webp`; t.image = rainOnGlass(t.image); t.needsUpdate = true; } settle(true); render(); }, undefined, () => settle(false));
    t.colorSpace = THREE.SRGBColorSpace;
    t.repeat.set(1, .87); t.offset.set(0, m === "golden" ? .015 : .05); // keep the trees and houses (lower middle) in view; the dusk painting sits 3.5% higher so its low sun clears the horizontal glazing bar instead of hiding behind it
    return t;
  }]));
  const outMat = new THREE.MeshBasicMaterial();
  const wx = (win.x0 + win.x1) / 2, wy = (win.y0 + win.y1) / 2, ww = win.x1 - win.x0, wh = win.y1 - win.y0;
  add(new THREE.PlaneGeometry(ww, wh), outMat, wx, wy, BACK - .06, false);
  const frame = (x, y, w, h) => { const part = add(new THREE.BoxGeometry(w, h, .08), wood, x, y, BACK - .02); windowFrameParts.push(part); return part; };
  frame(wx, win.y0, ww + .1, .06); frame(wx, win.y1, ww + .1, .06); frame(win.x0, wy, .06, wh); frame(win.x1, wy, .06, wh); frame(wx, wy, .04, wh); frame(wx, wy + .2, ww, .04);
  const curtainRod = add(new THREE.CylinderGeometry(.015, .015, ww + .9, 12), wood, wx, win.y1 + .2, BACK + .12); curtainRod.rotation.z = Math.PI / 2; windowFrameParts.push(curtainRod);
  // curtains: opaque linen, two sewn layers (1.2 cm thick) with side and hem edges in ONE mesh per panel, so draw calls stay at 2.
  // Pleats mix two wavelengths in panel space (u = -1..1) and get ~40% denser toward the rod, where the cloth is gathered;
  // the hem hangs 2.5 cm above the floor with a gentle wave.
  const linen = new THREE.MeshStandardMaterial({ color: "#e6ddcc", roughness: 1, side: THREE.DoubleSide });
  const curtainGeo = (phase) => {
    const NX = 36, NY = 8, TOP = win.y1 + .2 + .005, HEM_W = .46, TH = .006;
    const pos = [], idx = [];
    const at = (u, t) => { // t: 0 = hem, 1 = top
      const y0 = .025 + .008 * Math.sin(u * 2.3 + phase * 1.7), y = y0 + (TOP - y0) * t;
      const w = HEM_W, k = 1 + .4 * t, amp = .034 - .012 * t; // edges stay plumb; the gather shows as denser, shallower pleats toward the rod
      const z = amp * (.62 * Math.sin(u * 10.2 * k + phase) + .38 * Math.sin(u * 23 * k + phase * 2.1));
      return [u * w / 2, y, z];
    };
    const sheet = (dz) => { const base = pos.length / 3; for (let j = 0; j <= NY; j++) for (let i = 0; i <= NX; i++) { const [x, y, z] = at(i / NX * 2 - 1, j / NY); pos.push(x, y, z + dz); } for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) { const p = base + j * (NX + 1) + i, q = p + NX + 1; idx.push(p, q, p + 1, p + 1, q, q + 1); } return base; };
    const front = sheet(TH), back = sheet(-TH), row = NX + 1;
    const strip = (a0, step, n) => { const base = pos.length / 3; for (let k = 0; k <= n; k++) { const ia = (a0 + k * step) * 3; pos.push(pos[front * 3 + ia], pos[front * 3 + ia + 1], pos[front * 3 + ia + 2]); pos.push(pos[back * 3 + ia], pos[back * 3 + ia + 1], pos[back * 3 + ia + 2]); } for (let k = 0; k < n; k++) { const p = base + k * 2; idx.push(p, p + 2, p + 1, p + 1, p + 2, p + 3); } };
    strip(0, row, NY); strip(NX, row, NY); strip(0, 1, NX);
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
  };
  [[win.x0 - .14, .4], [win.x1 + .14, 2.1]].forEach(([x, phase]) => curtainParts.push(add(curtainGeo(phase), linen, x, 0, BACK + .12)));
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
    // Paul, 2026-11-16: the sofa wall needs art, not a child's picture. Three painted pieces from Codex card 70 (paper-textured, low contrast); the three simple prints above stay for the moods that suit them and for the picker.
    ridge: { zh: "晨光山脊", en: "Morning ridge" },
    paper: { zh: "紙剪植物", en: "Paper-cut leaves" },
    inkmoon: { zh: "墨與金月", en: "Ink and gold moon" },
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
  const AX = .35, AY = 1.70, AW = 1.07, AH = .76; // a larger frame for the 3:2 paintings; its bottom edge stays where it was (1.29 m), above the LED strip
  add(new THREE.BoxGeometry(AW + .06, AH + .06, .035), new THREE.MeshStandardMaterial({ color: "#a8784c", roughness: .55 }), AX, AY, BACK + .02);
  add(new THREE.BoxGeometry(AW, AH, .006), new THREE.MeshStandardMaterial({ color: "#f7f3ea", roughness: .9 }), AX, AY, BACK + .038, false);
  add(new THREE.PlaneGeometry(AW - .14, AH - .14), printMat, AX, AY, BACK + .042, false); // .93 x .62 m (3:2): the new paintings are 1536 x 1024, the old prints 1200 x 766 are drawn a little wide, which their flat shapes tolerate
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
  // the strip itself fades out toward both ends (it used to stop dead as a hard bright bar); the wall wash below already fades the same way
  const ledEndsAlpha = canvasTex(128, 8, (ctx, w, h) => { const g = ctx.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "#000"); g.addColorStop(.3, "#fff"); g.addColorStop(.7, "#fff"); g.addColorStop(1, "#000"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); });
  ledEndsAlpha.colorSpace = THREE.NoColorSpace;
  const ledLine = new THREE.Mesh(new THREE.BoxGeometry(2.1, .01, .01), new THREE.MeshBasicMaterial({ color: "#bfeaff", alphaMap: ledEndsAlpha, transparent: true, depthWrite: false })); ledLine.position.set(SX, 1.16, BACK + .02); led.add(ledLine);
  const washTex = canvasTex(8, 128, (ctx, w, h) => { const g = ctx.createLinearGradient(0, h, 0, 0); g.addColorStop(0, "rgba(140,210,255,0)"); g.addColorStop(.14, "rgba(140,210,255,.55)"); g.addColorStop(.45, "rgba(140,210,255,.18)"); g.addColorStop(1, "rgba(140,210,255,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); });
  washTex.wrapT = THREE.ClampToEdgeWrapping; // canvasTex repeats by default: the clear top row was blending with the bright bottom row and drew a thin hard line along the top of the glow
  const washAlpha = canvasTex(128, 8, (ctx, w, h) => { const g = ctx.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "#000"); g.addColorStop(.15, "#fff"); g.addColorStop(.85, "#fff"); g.addColorStop(1, "#000"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); });
  washAlpha.colorSpace = THREE.NoColorSpace;
  const wash = new THREE.Mesh(new THREE.PlaneGeometry(2.6, .7), new THREE.MeshBasicMaterial({ map: washTex, alphaMap: washAlpha, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  wash.position.set(SX, 1.16 + .25, BACK + .015); led.add(wash); // the strip washes the wall upward and fades at both ends; the plane also reaches 10 cm below the strip and fades there, so the glow no longer starts on a ruled line
  const ledGlow = new THREE.PointLight("#8fd3ff", 0, 3, 2); ledGlow.position.set(SX, 1.2, BACK + .25); scene.add(ledGlow);
  // soft halos around the lamp shades, so a lit lamp looks lit
  const haloTex = canvasTex(128, 128, (ctx, w, h) => { const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, "rgba(255,220,160,.9)"); g.addColorStop(.35, "rgba(255,200,130,.35)"); g.addColorStop(1, "rgba(255,190,120,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); });
  const halo = (x, y, z, s) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); m.position.set(x, y, z); m.scale.setScalar(s); scene.add(m); return m; };
  const tableHalo = halo(TX, .99, TZ, .65);
  // Dust motes drifting in the window light (Paul, 2026-11-16: the light in Room 04 felt lovely, the room breathes with it; bring it to the living room). One Points draw, a child of a rig that sits in
  // the window and points along the sun's direction, so the motes drift down the beam. They show only when the sun is strong (golden hour most, then afternoon), move at about 10 frames a second,
  // and only while the tab is visible, reduced motion is off and the visitor touched the room in the last 30 seconds (an idle room settles).
  const DUST_COUNT = compactRender ? 44 : 84, DUST_RANGE = 3.0;
  const dustRig = new THREE.Group(); dustRig.position.set((win.x0 + win.x1) / 2, (win.y0 + win.y1) / 2, BACK + .05);
  dustRig.lookAt(dustRig.position.clone().add(windowLight.target.position.clone().sub(windowLight.position).normalize())); scene.add(dustRig);
  const dustBase = new Float32Array(DUST_COUNT * 3), dustSpeed = new Float32Array(DUST_COUNT), dustPhase = new Float32Array(DUST_COUNT);
  const dustPositions = new Float32Array(DUST_COUNT * 3), dustColors = new Float32Array(DUST_COUNT * 4);
  { let seed = 20261116; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; // fixed seed: the same dust every visit
    for (let i = 0; i < DUST_COUNT; i++) { dustBase[i * 3] = (rnd() - .5) * 1.0; dustBase[i * 3 + 1] = (rnd() - .5) * 1.25; dustBase[i * 3 + 2] = rnd() * DUST_RANGE; dustSpeed[i] = .014 + rnd() * .02; dustPhase[i] = rnd() * Math.PI * 2; } }
  const dustTexture = canvasTex(32, 32, (ctx) => { const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 15); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.35, "rgba(255,255,255,.5)"); g.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, 32, 32); });
  dustTexture.wrapS = dustTexture.wrapT = THREE.ClampToEdgeWrapping;
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3)); dustGeometry.setAttribute("color", new THREE.BufferAttribute(dustColors, 4));
  const dustPoints = new THREE.Points(dustGeometry, new THREE.PointsMaterial({ map: dustTexture, size: .05, sizeAttenuation: true, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true }));
  dustPoints.name = "dust-motes"; dustPoints.renderOrder = 3; dustPoints.frustumCulled = false; dustPoints.visible = false; dustRig.add(dustPoints);
  let dustTime = 0;
  const stepDust = (dt) => {
    dustTime += dt;
    for (let i = 0; i < DUST_COUNT; i++) {
      const along = (dustBase[i * 3 + 2] + dustSpeed[i] * dustTime) % DUST_RANGE, wobble = dustTime * .3 + dustPhase[i];
      dustPositions[i * 3] = dustBase[i * 3] + Math.sin(wobble) * .05; dustPositions[i * 3 + 1] = dustBase[i * 3 + 1] + Math.cos(wobble * .8) * .05; dustPositions[i * 3 + 2] = along;
      const edge = Math.min(1, along / .5, (DUST_RANGE - along) / .5), twinkle = .65 + .35 * Math.sin(dustTime * .9 + dustPhase[i] * 3);
      dustColors[i * 4] = 1; dustColors[i * 4 + 1] = .94; dustColors[i * 4 + 2] = .8; dustColors[i * 4 + 3] = Math.max(0, edge) * twinkle;
    }
    dustGeometry.attributes.position.needsUpdate = true; dustGeometry.attributes.color.needsUpdate = true;
  };
  stepDust(0);
let lanternMat = null;
  const dustAmount = (sun) => Math.min(1, Math.max(0, (sun - 1.8) / 2)) * .9; // none in the dim moods, the most at golden hour (sun 4.8)
  // A beam of sunlight through the window (Paul, 2026-11-17: golden hour should look like the sun really comes in). Two crossed soft planes along the sun's direction, in the same rig as the dust motes
  // so the motes drift through it; one mesh, additive, painted with a soft gradient (bright at the window, fading across and along). It shows with the sun, like the motes.
  const sunBeamMaterial = new THREE.MeshBasicMaterial({ map: canvasTex(64, 128, (ctx, w, h) => { const image = ctx.createImageData(w, h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const across = Math.max(0, 1 - Math.pow(Math.abs(x / (w - 1) * 2 - 1), 1.6)), along = Math.pow(1 - y / (h - 1), 1.15) * Math.min(1, y / 10), a = across * across * along; const o = (y * w + x) * 4; image.data[o] = 255; image.data[o + 1] = 214; image.data[o + 2] = 150; image.data[o + 3] = Math.round(255 * a); } ctx.putImageData(image, 0, 0); }), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  sunBeamMaterial.map.wrapS = sunBeamMaterial.map.wrapT = THREE.ClampToEdgeWrapping;
  const sunBeam = (() => {
    const length = 3.0, lying = new THREE.PlaneGeometry(1.05, length).rotateX(-Math.PI / 2).translate(0, 0, length / 2), standing = new THREE.PlaneGeometry(1.4, length).rotateX(-Math.PI / 2).rotateZ(Math.PI / 2).translate(0, 0, length / 2);
    const mesh = new THREE.Mesh(mergeGeometries([lying, standing]), sunBeamMaterial); mesh.name = "sun-beam"; mesh.renderOrder = 2; mesh.visible = false; mesh.frustumCulled = false; mesh.raycast = () => {}; dustRig.add(mesh); return mesh;
  })();
  // The living room's main light (Paul, 2026-11-16: the ceiling had light but no fixture). A round washi-paper lantern on a short cord, after Codex's card 69 drawing (A2): a paper globe with a warm
  // glow, thin bamboo rings and a round canopy. It is built here (no model file): about 600 vertices, three meshes. Its glow follows the room's main light: bright in the day moods, dim at night
  // ("skip the ceiling light"). The light itself is still the room's soft fill; the lantern is the thing that light comes from.
  const LANTERN = { x: .05, z: -1.4, radius: .17, bottom: 2.0 };
  { const R = LANTERN.radius, cy = LANTERN.bottom + R, ceilingY = H;
    const paper = canvasTex(256, 256, (ctx, w, h) => { ctx.fillStyle = "#f4e6c8"; ctx.fillRect(0, 0, w, h); let seed = 77; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      for (let n = 0; n < 150; n++) { ctx.strokeStyle = `rgba(190,150,90,${.06 + rnd() * .12})`; ctx.lineWidth = .6 + rnd() * .8; ctx.beginPath(); const x = rnd() * w, y = rnd() * h; ctx.moveTo(x, y); ctx.quadraticCurveTo(x + (rnd() - .5) * 90, y + (rnd() - .5) * 90, x + (rnd() - .5) * 120, y + (rnd() - .5) * 120); ctx.stroke(); } });
    lanternMat = new THREE.MeshStandardMaterial({ map: paper, emissive: "#ffd9a0", emissiveMap: paper, emissiveIntensity: .8, roughness: .95 });
    const globe = add(new THREE.SphereGeometry(R, 28, 18), lanternMat, LANTERN.x, cy, LANTERN.z, false); globe.name = "living-room-lantern";
    const rings = [];
    for (const lat of [-.8, -.55, -.28, 0, .28, .55, .8]) { const ring = new THREE.TorusGeometry(R * Math.cos(lat) * 1.012, .0035, 5, 28); ring.rotateX(Math.PI / 2); ring.translate(0, R * Math.sin(lat), 0); rings.push(ring); }
    for (const yaw of [0, Math.PI / 2]) { const rib = new THREE.TorusGeometry(R * 1.012, .0035, 5, 36); rib.rotateY(yaw); rings.push(rib); }
    const bamboo = add(mergeGeometries(rings), new THREE.MeshStandardMaterial({ color: "#d9b87a", roughness: .6 }), LANTERN.x, cy, LANTERN.z, false); bamboo.name = "living-room-lantern-rings";
    const cordLength = ceilingY - .025 - (cy + R);
    const fittings = mergeGeometries([
      new THREE.CylinderGeometry(.07, .07, .025, 24).translate(0, ceilingY - .0125 - cy, 0), // the round canopy on the ceiling
      new THREE.CylinderGeometry(.006, .006, cordLength, 8).translate(0, R + cordLength / 2, 0), // the cord
      new THREE.CylinderGeometry(.02, .028, .03, 16).translate(0, R + .006, 0), // the cap on top of the globe
    ]);
    const fixture = add(fittings, new THREE.MeshStandardMaterial({ color: "#efe6d6", roughness: .7 }), LANTERN.x, cy, LANTERN.z, false); fixture.name = "living-room-lantern-fittings";
    fill.position.set(LANTERN.x, cy, LANTERN.z); /* Paul, 2026-11-16: the light must come from the fixture: the room's soft fill light now sits at the lantern's centre, not in the middle of the room */ }

  // Paul 2026-11-19: four recessed ceiling downlights over the living area (cream trim, warm lens, the same model as Room 02's desk downlight), in a rectangle
  // near the room's corners, clear of the paper lantern and 65 cm or more from the walls. They really light the room: one shared, shadowless SpotLight from their centre throws a wide
  // warm pool on the floor below them. Its strength follows the mood (off in 未來輕科技宅男, "skip the ceiling light"; dim in 追劇夜 so series night stays cozy).
  // Two meshes (four trims, four lenses) and one light.
  const DOWNLIGHTS = [[-1.95, -1.55], [1.95, -1.55], [-1.95, 1.75], [1.95, 1.75]], DOWNLIGHT_CANDELA = 7; // Paul 2026-11-19: out towards the four corners, like Room 02 (65 cm from the side walls)
  const DOWNLIGHT_LEVEL = { rain: .8, family: .35, tech: 0, chic: .45, slow: .7, golden: .3, tv: .25 }; // series night: on but dim (about 30 % of the rainy-day level), Paul 2026-11-19
  // Paul 2026-11-20 (the light atmosphere, as in Room 04; Room 04 was done and he asked for Room 01's light to feel better): a soft halo round the paper lantern, a glow on each of the four
  // recessed downlights (one Points draw) so they read as lit and not as white discs, a warm pool under the standing lamp, and a vignette in the dim moods (CSS, see index.html).
  const lanternHalo = halo(LANTERN.x, LANTERN.bottom + LANTERN.radius, LANTERN.z, 1.5); lanternHalo.material.opacity = 0;
  const downHaloMat = new THREE.PointsMaterial({ map: haloTex, size: .6, sizeAttenuation: true, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, color: new THREE.Color(1.6, 1.6, 1.6), toneMapped: false });
  const downHalos = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(DOWNLIGHTS.flatMap(([x, z]) => [x, H - .035, z]), 3)), downHaloMat);
  downHalos.frustumCulled = false; downHalos.raycast = () => {}; downHalos.visible = false; scene.add(downHalos);
  // Paul 2026-11-21 (a wall light he loved in a Taiwanese interior photo): a globe sconce on the left wall above the plant, between the whiteboard and the window corner: a small matte-black half-dome
  // mount holds a frosted blush-white glass sphere that glows warm from inside. No real light (the room's light count stays), only the glow of the glass and a soft halo of light on the wall, both following the mood
  // like the paper lantern's halo: faint by day, warm in the evening.
  // Paul 2026-11-21 (second pass: a bare globe looked lonely; raise it above the pictures; give it a shade with art): a pleated linen half-shade, the kind of folded-paper wall light that is
  // popular in Taiwan and the US now. A matte-black round wall plate, a short brass arm, and a half-cylinder shade of 16 soft pleats (open towards the wall side, glowing from inside) closed top and bottom
  // with brass half-discs; the light is thrown up and down the wall as two soft fans (halo sprites). No real light is added. It hangs at 2.05 m, above the pictures beside it.
  const movingBoxHolder = {};
  const SCONCE = { x: -W / 2, y: 2.05, z: -1.4, r: .07, h: .24 };
  const sconceMat = new THREE.MeshStandardMaterial({ color: "#f1e2c8", roughness: .85, metalness: 0, emissive: "#ffc27a", emissiveIntensity: .3, side: THREE.DoubleSide });
  const sconceGroup = new THREE.Group(); sconceGroup.name = "wall-sconce"; scene.add(sconceGroup);
  { const black = new THREE.MeshStandardMaterial({ color: "#16171a", roughness: .5, metalness: .25 }), brass = new THREE.MeshStandardMaterial({ color: "#c2a15a", roughness: .35, metalness: .75, side: THREE.DoubleSide });
    const cx = SCONCE.x + .062 + SCONCE.r, pleats = 16, brassParts = [];
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, .014, 32).rotateZ(Math.PI / 2).translate(SCONCE.x + .007, SCONCE.y, SCONCE.z), black); plate.name = "wall-sconce-plate"; sconceGroup.add(plate);
    brassParts.push(new THREE.CylinderGeometry(.007, .007, .05, 14).rotateZ(Math.PI / 2).translate(SCONCE.x + .037, SCONCE.y, SCONCE.z));
    const shadeGeo = new THREE.CylinderGeometry(SCONCE.r, SCONCE.r, SCONCE.h, 96, 1, true, 0, Math.PI), sp = shadeGeo.attributes.position; // a half cylinder: its convex side faces the room (+x), the open side the wall
    for (let i = 0; i < sp.count; i++) { const x = sp.getX(i), z = sp.getZ(i), a = Math.atan2(x, z), f = 1 + .09 * Math.cos(pleats * a); sp.setX(i, x * f); sp.setZ(i, z * f); }
    shadeGeo.computeVertexNormals();
    const shade = new THREE.Mesh(shadeGeo.translate(cx, SCONCE.y, SCONCE.z), sconceMat); shade.name = "wall-sconce-shade"; shade.castShadow = false; sconceGroup.add(shade);
    for (const dy of [-1, 1]) { brassParts.push(new THREE.CircleGeometry(SCONCE.r * 1.04, 40, -Math.PI / 2, Math.PI).rotateX(-Math.PI / 2).translate(cx, SCONCE.y + dy * SCONCE.h / 2, SCONCE.z));
      brassParts.push(new THREE.TorusGeometry(SCONCE.r * 1.02, .0035, 6, 40, Math.PI).rotateZ(-Math.PI / 2).rotateX(Math.PI / 2).translate(cx, SCONCE.y + dy * SCONCE.h / 2, SCONCE.z)); }
    const brassMesh = new THREE.Mesh(mergeGeometries(brassParts.map((g) => { const q = g.index ? g.toNonIndexed() : g; q.deleteAttribute("uv"); return q; }), false), brass); brassMesh.name = "wall-sconce-brass"; sconceGroup.add(brassMesh);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(.026, 20, 12), new THREE.MeshBasicMaterial({ color: "#ffe3b0" })); bulb.position.set(cx - .012, SCONCE.y, SCONCE.z); bulb.name = "wall-sconce-bulb"; sconceGroup.add(bulb); SCONCE.globeX = cx; }
  // Paul 2026-11-21: "the room feels just moved into". A corrugated moving box stands against the left wall under the sconce, in front of the plant with the Post-it, half unpacked: flaps open, a rolled
  // cream blanket and books peek out, a strip of tape, kraft board with a fine corrugated grain, and in black marker "# ROOM 01 / LIVING ROOM" on the side facing the room. 46 cm wide
  // (along the wall), 30 cm deep, 36 cm tall, on the floor 3 cm off the wall. Four meshes (kraft board, contents, tape and holes, label) so it costs four draw calls.
  {
    const BX = { x: -W / 2 + .03 + .15, z: -.8, w: .46, d: .30, h: .36 }, group = new THREE.Group(); group.name = "moving-box"; group.position.set(BX.x, 0, BX.z); group.rotation.y = .035; scene.add(group);
    const kraftTex = canvasTex(256, 256, (ctx, w, h) => { ctx.fillStyle = "#c19b68"; ctx.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 4) { ctx.fillStyle = x % 8 === 0 ? "rgba(120,84,44,.16)" : "rgba(255,230,180,.12)"; ctx.fillRect(x, 0, 2, h); } for (let i = 0; i < 120; i++) { ctx.fillStyle = `rgba(90,60,30,${.04 + (i % 5) * .012})`; ctx.fillRect((i * 53) % w, (i * 97) % h, 12 + (i % 7), 1); } });
    kraftTex.wrapS = kraftTex.wrapT = THREE.RepeatWrapping; kraftTex.repeat.set(2, 2);
    const kraft = new THREE.MeshStandardMaterial({ map: kraftTex, color: "#ffffff", roughness: .95 });
    const wallT = .006, kraftParts = [], contentParts = [], tapeParts = [];
    const colorize = (geo, hex) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.deleteAttribute("uv"); const c = new THREE.Color(hex), n = g.attributes.position.count, a2 = new Float32Array(n * 3); for (let i = 0; i < n; i++) c.toArray(a2, i * 3); g.setAttribute("color", new THREE.Float32BufferAttribute(a2, 3)); return g; };
    const mk = (sx, sy, sz, x, y, z) => { kraftParts.push(new THREE.BoxGeometry(sx, sy, sz).translate(x, y, z)); };
    mk(BX.d, wallT, BX.w, 0, wallT / 2, 0); // the base
    mk(wallT, BX.h, BX.w, BX.d / 2 - wallT / 2, BX.h / 2, 0); mk(wallT, BX.h, BX.w, -BX.d / 2 + wallT / 2, BX.h / 2, 0); // the room-facing side and the wall side (x is the depth, towards the room)
    mk(BX.d - 2 * wallT, BX.h, wallT, 0, BX.h / 2, BX.w / 2 - wallT / 2); mk(BX.d - 2 * wallT, BX.h, wallT, 0, BX.h / 2, -BX.w / 2 + wallT / 2);
    // the flaps: two long flaps folded back (hinged on the long edges), one short flap standing up leaning back over the contents
    const flap = (len, wid, hx, hz, offX, offZ, rx, rz) => { const pivot = new THREE.Object3D(); pivot.position.set(hx, BX.h, hz); pivot.rotation.set(rx, 0, rz); pivot.updateMatrix(); const g = new THREE.BoxGeometry(len, .004, wid).translate(offX, 0, offZ); g.applyMatrix4(pivot.matrix); kraftParts.push(g); };
    flap(BX.d, BX.w / 2 - .01, 0, BX.w / 2, 0, (BX.w / 2 - .01) / 2, (Math.PI / 2 - .35), 0);
    flap(BX.d, BX.w / 2 - .01, 0, -BX.w / 2, 0, -(BX.w / 2 - .01) / 2, -(Math.PI / 2 - .5), 0);
    flap(.15, BX.w - .02, BX.d / 2, 0, .075, 0, 0, Math.PI / 2 - .3); // the room-facing flap stands up leaning back over the contents, clear of the writing
    // contents peeking out: a rolled cream blanket and three books
    contentParts.push(colorize(new THREE.CylinderGeometry(.075, .075, .3, 20).rotateX(Math.PI / 2).rotateY(.1).translate(-.03, BX.h - .06, -.1), "#e8dcc5"));
    [["#6b3a2e", .04, .26], ["#3f5a6a", .035, .24], ["#a3643a", .03, .27]].forEach(([c, t, hgt], i) => { const g = new THREE.BoxGeometry(.16, hgt, t); if (i === 2) g.rotateZ(.14); g.translate(.03, BX.h - .12 + hgt / 2 - .1 + .02, .09 + i * (t + .002)); contentParts.push(colorize(g, c)); });
    // the tape across the room-facing side near the top
    tapeParts.push(colorize(new THREE.BoxGeometry(.006, .002, BX.w * .5).translate(BX.d / 2 + .0006, BX.h - .1, 0), "#8a5a34"));
    // (Paul 2026-11-22: the two black oval hand holes read as a pair of eyes and a Taiwanese carton does not have them; they are gone)
    const addMerged = (parts, material, name) => { const g = mergeGeometries(parts, false); g.computeVertexNormals(); const m = new THREE.Mesh(g, material); m.name = name; m.castShadow = true; m.receiveShadow = true; group.add(m); };
    addMerged(kraftParts, kraft, "moving-box-kraft"); addMerged(contentParts, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .9 }), "moving-box-contents"); addMerged(tapeParts, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .7 }), "moving-box-tape");
    const label = canvasTex(512, 320, (ctx, w, h) => { ctx.clearRect(0, 0, w, h); ctx.fillStyle = "#1c1814"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "800 78px 'Segoe Print', 'Bradley Hand', 'Comic Sans MS', cursive"; ctx.save(); ctx.translate(w / 2, h * .36); ctx.rotate(-.03); ctx.fillText("# ROOM 01", 0, 0); ctx.restore(); ctx.font = "700 54px 'Segoe Print', 'Bradley Hand', 'Comic Sans MS', cursive"; ctx.save(); ctx.translate(w / 2, h * .66); ctx.rotate(.02); ctx.fillText("LIVING ROOM", 0, 0); ctx.restore(); ctx.fillStyle = "rgba(28,24,20,.8)"; ctx.fillRect(w * .18, h * .87, w * .64, 4); });
    const lm = new THREE.Mesh(new THREE.PlaneGeometry(BX.w * .74, BX.w * .74 * 320 / 512), new THREE.MeshBasicMaterial({ map: label, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })); lm.rotation.y = Math.PI / 2; lm.position.set(BX.d / 2 + .0013, BX.h * .47, 0); lm.name = "moving-box-label"; group.add(lm);
    movingBoxHolder.group = group; movingBoxHolder.info = BX; // PROPS is declared further down; the holder is not
  }
  // Paul 2026-11-21: the two billboard sprites were cut by the wall (a hard-edged patch, bright on one side only). The light is now two soft pools lying ON the wall (planes parallel to it, 4 mm off, additive): a wide fan up and down + a small core round the shade, symmetric left and right, fading to nothing before any edge.
  const sconceWallGlow = (tex, w, h, cy) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h).rotateY(Math.PI / 2).translate(SCONCE.x + .004, cy, SCONCE.z), new THREE.MeshBasicMaterial({ map: tex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0, color: new THREE.Color(2.2, 2.0, 1.8), toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); m.name = "wall-sconce-pool"; m.renderOrder = 2; scene.add(m); return m; };
  const sconceFanTex = canvasTex(128, 256, (ctx, w, h) => { const ell = (cy, ry, a) => { ctx.save(); ctx.translate(w / 2, cy); ctx.scale(1, ry / (w / 2)); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, w / 2); g.addColorStop(0, `rgba(255,214,150,${a})`); g.addColorStop(.4, `rgba(255,196,120,${a * .45})`); g.addColorStop(.75, `rgba(255,184,110,${a * .12})`); g.addColorStop(1, "rgba(255,180,100,0)"); ctx.fillStyle = g; ctx.fillRect(-w / 2, -h, w, h * 2); ctx.restore(); }; ell(96, 92, .75); ell(128, 92, .6); });
  const sconceCoreTex = canvasTex(128, 128, (ctx, w, h) => { const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, "rgba(255,224,170,.9)"); g.addColorStop(.3, "rgba(255,206,140,.4)"); g.addColorStop(1, "rgba(255,190,120,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); });
  const sconceHalo = sconceWallGlow(sconceFanTex, 1.4, 1.5, 1.95), sconceHaloLow = sconceWallGlow(sconceCoreTex, .5, .5, SCONCE.y); sconceHalo.material.opacity = 0; sconceHaloLow.material.opacity = 0;
  const downTrim = add(mergeGeometries(DOWNLIGHTS.map(([x, z]) => new THREE.CylinderGeometry(.05, .05, .012, 24).translate(x, H - .006, z))), new THREE.MeshStandardMaterial({ color: "#f2efe8", roughness: .5 }), 0, 0, 0, false);
  downTrim.name = "ceiling-downlight-trims";
  const downLensMat = new THREE.MeshStandardMaterial({ color: "#fff6e6", emissive: "#ffe3bd", emissiveIntensity: 0 });
  const downLens = add(mergeGeometries(DOWNLIGHTS.map(([x, z]) => new THREE.CircleGeometry(.035, 24).rotateX(Math.PI / 2).translate(x, H - .013, z))), downLensMat, 0, 0, 0, false);
  downLens.name = "ceiling-downlight-lenses";
  const downSpot = new THREE.SpotLight("#ffe3bd", 0, 5.5, 1.05, .9, 2); downSpot.name = "ceiling-downlight-spot";
  downSpot.position.set(0, H - .03, .1); downSpot.target.position.set(0, 0, .1); scene.add(downSpot, downSpot.target);

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
  const fabricMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .92, side: THREE.DoubleSide }); // double sided since 2026-11-21: the thin slits in the AI sofa's surface show its fabric inside, not a dark gap
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
    let lo = Infinity, hi = -Infinity, xlo = Infinity, xhi = -Infinity, zlo = Infinity, zhi = -Infinity;
    for (let i = 0; i < n; i++) { const y = pos.getY(i), x = pos.getX(i), z = pos.getZ(i); lo = Math.min(lo, y); hi = Math.max(hi, y); xlo = Math.min(xlo, x); xhi = Math.max(xhi, x); zlo = Math.min(zlo, z); zhi = Math.max(zhi, z); }
    const cut = lo + (hi - lo) * .88;
    // Paul 2026-11-21: the "threads" are cracks. The AI model splits its vertices along seams (same place, several vertices), so smoothing each vertex on its own pulled the two sides of a seam apart and opened
    // thin dark slits along the backrest top and the cushion seams. Vertices that share a place are welded into one group here: they are smoothed together and always move together.
    const q = Math.max(xhi - xlo, hi - lo, zhi - zlo) * 2e-5, keyOf = (i) => `${Math.round(pos.getX(i) / q)},${Math.round(pos.getY(i) / q)},${Math.round(pos.getZ(i) / q)}`;
    const groupOf = new Int32Array(n), groups = [], byKey = new Map();
    for (let i = 0; i < n; i++) { const k = keyOf(i); let id = byKey.get(k); if (id === undefined) { id = groups.length; byKey.set(k, id); groups.push([i]); } else groups[id].push(i); groupOf[i] = id; }
    const nb = Array.from({ length: groups.length }, () => new Set());
    for (let i = 0; i < idx.length; i += 3) { const a = groupOf[idx[i]], b = groupOf[idx[i + 1]], c = groupOf[idx[i + 2]]; if (a !== b) { nb[a].add(b); nb[b].add(a); } if (b !== c) { nb[b].add(c); nb[c].add(b); } if (a !== c) { nb[a].add(c); nb[c].add(a); } }
    const gx = new Float32Array(groups.length), gy = new Float32Array(groups.length), gz = new Float32Array(groups.length);
    for (let id = 0; id < groups.length; id++) { const i = groups[id][0]; gx[id] = pos.getX(i); gy[id] = pos.getY(i); gz[id] = pos.getZ(i); }
    const top = []; for (let id = 0; id < groups.length; id++) if (gy[id] > cut) top.push(id);
    for (let pass = 0; pass < 20; pass++) { // 7 before 2026-11-21
      const next = top.map((id) => { let x = 0, y = 0, z = 0; for (const j of nb[id]) { x += gx[j]; y += gy[j]; z += gz[j]; } const k = nb[id].size || 1; return [x / k, y / k, z / k]; });
      top.forEach((id, t) => { gx[id] = (gx[id] + next[t][0]) / 2; gy[id] = (gy[id] + next[t][1]) / 2; gz[id] = (gz[id] + next[t][2]) / 2; });
    }
    for (let id = 0; id < groups.length; id++) for (const i of groups[id]) pos.setXYZ(i, gx[id], gy[id], gz[id]);
    // The dark "thread" specks along the backrest top are colour, not shape: the model's vertex colours were projected from a picture, and along the rim they sampled the dark edge of the picture. Colours that are
    // much darker than the fabric around them are replaced by the average of their lighter neighbours (3 passes).
    const col = g.attributes.color;
    if (col) {
      const lum = (i) => .299 * col.getX(i) + .587 * col.getY(i) + .114 * col.getZ(i), values = []; for (let i = 0; i < n; i++) values.push(lum(i)); values.sort((p1, p2) => p1 - p2); const median = values[Math.floor(n / 2)], floor = median * .8;
      const nbI = Array.from({ length: n }, () => new Set()); for (let i = 0; i < idx.length; i += 3) { const a1 = idx[i], b1 = idx[i + 1], c1 = idx[i + 2]; nbI[a1].add(b1).add(c1); nbI[b1].add(a1).add(c1); nbI[c1].add(a1).add(b1); }
      let fixed = 0;
      for (let pass = 0; pass < 3; pass++) { const edits = []; for (let i = 0; i < n; i++) { if (lum(i) >= floor) continue; let r = 0, gg = 0, b = 0, k = 0; for (const j of nbI[i]) if (lum(j) >= floor) { r += col.getX(j); gg += col.getY(j); b += col.getZ(j); k++; } if (k) edits.push([i, r / k, gg / k, b / k]); } for (const [i, r, gg, b] of edits) col.setXYZ(i, r, gg, b); fixed += edits.length; if (!edits.length) break; }
      col.needsUpdate = true; window.__sofaThreadFix = { ...(window.__sofaThreadFix || {}), darkFixed: fixed, medianLum: +median.toFixed(3) };
    }
    window.__sofaThreadFix = { ...(window.__sofaThreadFix || {}), welded: n - groups.length, vertices: n, groups: groups.length };
    pos.needsUpdate = true;
  });
  // the AI model's two cushions are fused into its mesh and their edges melt into the seat and backrest. Rather than cut them out (that tore holes),
  // press them flat: inside each cushion's span, any vertex above the seat/backrest profile measured at the sofa's centre seam is lowered to that profile.
  // No triangles are removed; the procedural cushions below carry the look.
  {
    const back = new THREE.Box3().setFromObject(sofaObj).min.z, v = new THREE.Vector3(), inv = new THREE.Matrix4();
    // [depth from the back (m), height (m)] along the centre seam: backrest top, its front face sloping down, then the seat and its front edge
    const CUSHION_PRESS = .35, BACK_PRESS = .62, ARM_TOP = .785, profile = [[0, 1.09], [.3, 1.09], [.4, .86], [.5, .575], [1, .565], [1.1, .53], [9, .5]];
    const heightAt = (z) => { for (let i = 1; i < profile.length; i++) if (z <= profile[i][0]) { const [z0, y0] = profile[i - 1], [z1, y1] = profile[i]; return y0 + (y1 - y0) * (z - z0) / (z1 - z0); } return profile[profile.length - 1][1]; };
    const smooth = (a, c, x) => { const t = Math.min(Math.max((x - a) / (c - a), 0), 1); return t * t * (3 - 2 * t); };
    const span = (x) => Math.max(smooth(-.8, -.72, x) * (1 - smooth(-.3, -.22, x)), smooth(.2, .28, x) * (1 - smooth(.78, .86, x)));
    sofaObj.updateMatrixWorld(true);
    sofaObj.traverse((m) => {
      if (!m.isMesh) return;
      const g = m.geometry, pos = g.attributes.position; inv.copy(m.matrixWorld).invert();
      const normal0 = g.attributes.normal ? g.attributes.normal.array.slice() : null, touched = new Uint8Array(pos.count); // the model's own soft normals stay wherever nothing moved
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld);
        const dx = v.x - SX, zr = v.z - back;
        // between the cushions: down to the seat/backrest profile. Over the arms: the cushions' tips rise above the arm top (0.785 m measured), so cap them there.
        const w = span(dx), arm = smooth(.74, .8, Math.abs(dx)) * (1 - smooth(1, 1.04, Math.abs(dx))) * smooth(.38, .46, zr) * (1 - smooth(.85, .95, zr));
        const target = w >= arm ? heightAt(zr) : ARM_TOP, k = Math.max(w, arm);
        // between the cushions only half of the old puff is pressed out, so the seat and backrest stay plump; over the arms the tips are still capped in full
        // Paul 2026-11-11: the part of each old cushion that LEANS on the backrest (depth .28-.75 m) stayed 65 percent puffed and showed from the side as a white
        // fold hanging off the backrest. It is pressed almost flat (BACK_PRESS) while the seat part (deeper than .75 m) keeps the plump 35 percent.
        const press = w >= arm ? CUSHION_PRESS + (BACK_PRESS - CUSHION_PRESS) * smooth(.26, .34, zr) * (1 - smooth(.7, .78, zr)) : 1;
        if (k > 0 && v.y > target) { v.y -= (v.y - target) * k * press; v.applyMatrix4(inv); pos.setXYZ(i, v.x, v.y, v.z); touched[i] = 1; }
      }
      // the spikes left where the old cushions met the backrest and arms: a few passes of neighbour averaging of the positions only (the model's baked vertex shading is kept), inside that zone only
      const idx = g.index && g.index.array; let nb = null;
      if (idx) {
        nb = Array.from({ length: pos.count }, () => new Set());
        for (let i = 0; i < idx.length; i += 3) { const p = idx[i], q = idx[i + 1], r = idx[i + 2]; nb[p].add(q).add(r); nb[q].add(p).add(r); nb[r].add(p).add(q); }
        const zone = [], zw = [];
        for (let i = 0; i < pos.count; i++) {
          v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld);
          const z = smooth(.26, .32, v.z - back) * (1 - smooth(.95, 1.02, v.z - back)) * (1 - smooth(.98, 1.04, Math.abs(v.x - SX))) * smooth(.5, .58, v.y);
          if (z > 0) { zone.push(i); zw.push(z); touched[i] = 1; }
        }
        for (let pass = 0; pass < 4; pass++) {
          const next = zone.map((i) => { let x = 0, y = 0, z = 0; const n = nb[i].size || 1; for (const j of nb[i]) { x += pos.getX(j); y += pos.getY(j); z += pos.getZ(j); } return [x / n, y / n, z / n]; });
          zone.forEach((i, t) => {
            const k = .6 * zw[t], s = next[t];
            pos.setXYZ(i, pos.getX(i) + (s[0] - pos.getX(i)) * k, pos.getY(i) + (s[1] - pos.getY(i)) * k, pos.getZ(i) + (s[2] - pos.getZ(i)) * k);
          });
        }
      }
      // the old cushions' baked colours (dark green/orange undersides) are still on the vertices they were pressed into, and show as smudges around the new cushions:
      // repaint those vertices from their clean neighbours, a ring at a time, so the sofa fabric runs on under and beside the scatter cushions
      const col = g.attributes.color;
      if (col && idx) {
        const clean = new Uint8Array(pos.count), dirty = [];
        for (let i = 0; i < pos.count; i++) {
          v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld);
          const dxm = v.x - SX, zrm = v.z - back, lum = (col.getX(i) + col.getY(i) + col.getZ(i)) / 3, chroma = col.getX(i) - col.getZ(i);
          const inSpan = Math.abs(dxm) > .22 && Math.abs(dxm) < 1.02 && zrm > .24 && zrm < 1.04 && v.y > .42 && (dxm < 0 ? dxm < -.26 : dxm > .26);
          if (inSpan && (lum < .5 || chroma > .25)) dirty.push(i); else clean[i] = 1;
        }
        for (let ring = 0; ring < 12 && dirty.length; ring++) {
          const fixed = [], keep = [];
          for (const i of dirty) { let r = 0, gg = 0, b = 0, n = 0; for (const j of nb[i]) if (clean[j]) { r += col.getX(j); gg += col.getY(j); b += col.getZ(j); n++; } if (n) fixed.push([i, r / n, gg / n, b / n]); else keep.push(i); }
          if (!fixed.length) break;
          for (const [i, r, gg, b] of fixed) { col.setXYZ(i, r, gg, b); clean[i] = 1; }
          dirty.length = 0; dirty.push(...keep);
        }
        col.needsUpdate = true;
      }
      pos.needsUpdate = true; g.computeVertexNormals();
      if (normal0) { const na = g.attributes.normal; for (let i = 0; i < pos.count; i++) if (!touched[i]) na.setXYZ(i, normal0[i * 3], normal0[i * 3 + 1], normal0[i * 3 + 2]); na.needsUpdate = true; }
    });
  }
  // Paul 2026-11-21: the sofa shows wiry "threads" (long, hair-thin triangles stretched between vertices of the AI model, most along the backrest top and the seams). Drop every triangle that is both long
  // (an edge over 3 cm and a quality ratio under 0.06, or an edge over 1 cm and a ratio under 0.03; an equilateral triangle is 1) -- needle-thin; nothing visible stands on them, only the stray strands go. Counted in sofaThreadFix.
  window.__sofaThreadFix = { ...(window.__sofaThreadFix || {}), removed: 0, kept: 0 };
  sofaObj.updateMatrixWorld(true);
  sofaObj.traverse((m) => {
    if (!m.isMesh || !m.geometry.index) return;
    const g = m.geometry, pos = g.attributes.position, idx = g.index.array, keep = [], A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3(), tri = new THREE.Triangle();
    for (let i = 0; i < idx.length; i += 3) {
      A.fromBufferAttribute(pos, idx[i]).applyMatrix4(m.matrixWorld); B.fromBufferAttribute(pos, idx[i + 1]).applyMatrix4(m.matrixWorld); C.fromBufferAttribute(pos, idx[i + 2]).applyMatrix4(m.matrixWorld);
      const ab = A.distanceToSquared(B), bc = B.distanceToSquared(C), ca = C.distanceToSquared(A), longest = Math.sqrt(Math.max(ab, bc, ca)), area = tri.set(A, B, C).getArea(), quality = 4 * Math.sqrt(3) * area / (ab + bc + ca || 1);
      if ((longest > .03 && quality < .06) || (longest > .01 && quality < .03)) window.__sofaThreadFix.removed++; else { keep.push(idx[i], idx[i + 1], idx[i + 2]); window.__sofaThreadFix.kept++; }
    }
    if (keep.length < idx.length) g.setIndex(keep);
  });
  // Paul 2026-11-21: the AI sofa's backrest top is an open, ragged edge (tiny cracks and scallops that no shading hides). A rolled piping, a soft fabric tube that follows the ridge of the backrest, now runs along
  // it: the ridge height and depth are read from the model's top vertices every 2 cm along its width, smoothed, and the tube is laid on that line (12 cm shorter at each end, where the backrest turns into the arms). The cracks sit under it.
  {
    sofaObj.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(sofaObj), v = new THREE.Vector3(), bins = new Map(), BIN = .02, backZ = box.min.z + (box.max.z - box.min.z) * .5; let r = 0, g2 = 0, b2 = 0, cn = 0;
    sofaObj.traverse((m) => { if (!m.isMesh) return; const pos = m.geometry.attributes.position, col = m.geometry.attributes.color;
      for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld); if (v.z > backZ || v.y < box.max.y - .12) continue; const k = Math.round(v.x / BIN), cur = bins.get(k); if (!cur || v.y > cur.y) bins.set(k, { x: v.x, y: v.y, z: v.z }); if (col && v.y > box.max.y - .06) { r += col.getX(i); g2 += col.getY(i); b2 += col.getZ(i); cn++; } } });
    const keys = [...bins.keys()].sort((a1, b1) => a1 - b1), pts = keys.map((k) => bins.get(k));
    if (pts.length > 10) {
      const sm = pts.map((p, i) => { let y = 0, z = 0, c = 0; for (let j = Math.max(0, i - 4); j <= Math.min(pts.length - 1, i + 4); j++) { y += pts[j].y; z += pts[j].z; c++; } return new THREE.Vector3(p.x, y / c - .004, z / c + .004); });
      const curve = new THREE.CatmullRomCurve3(sm.slice(6, sm.length - 6).filter((_, i) => i % 2 === 0), false, "centripetal"), pipe = new THREE.Mesh(new THREE.TubeGeometry(curve, 160, .02, 14, false), new THREE.MeshStandardMaterial({ color: cn ? new THREE.Color(r / cn, g2 / cn, b2 / cn).multiplyScalar(1.02) : 0xd8ccb4, roughness: .92 }));
      pipe.name = "sofa-backrest-piping"; pipe.castShadow = true; pipe.receiveShadow = true; scene.add(pipe);
    }
  }
  prepare(sofaObj, () => fabricMat);
  // Scatter cushions: the AI model's two cushions are fused into its mesh and their edges melt into the seat and arm, so two
  // procedural ones (two sewn sheets with a welt, see the procedural-cloth-goods skill) sit on top and cover them. The AI mesh stays unchanged underneath.
  const pillowGeo = (w, h, d, colour) => {
    const nx = 24, nz = 22, row = nx + 1, welt = .011, pos = [], col = [], idx = [], c = new THREE.Color(colour);
    for (const side of [1, -1]) for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
      const u = i / nx * 2 - 1, v = j / nz * 2 - 1;
      const t = Math.pow(Math.max(1 - u * u, 0), .6) * Math.pow(Math.max(1 - v * v, 0), .6); // 0 on the seam, 1 in the middle (round, not a plateau)
      let y = welt + (h / 2 - welt) * t;
      y -= .03 * Math.exp(-Math.pow(u / .32, 2)) * (1 - v * v) * (t > 0 ? 1 : 0); // the pressed middle
      y += .006 * Math.sin((u + v) * 6.5) * t; // a soft crease or two running in from the corners
      const grow = 1 + .018 * (1 - t); // the welt bulges slightly outward
      pos.push(u * w / 2 * grow * (1 - .1 * v * v), side * y, v * d / 2 * grow * (1 - .1 * u * u)); // edges bulge in the middle, corners pull in to a point
      const shade = .74 + .26 * Math.pow(t, .5); // the seam sits in a little shadow
      col.push(c.r * shade, c.g * shade, c.b * shade);
    }
    const half = (nx + 1) * (nz + 1);
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      const a = j * row + i, b2 = a + 1, c2 = a + row, d2 = c2 + 1;
      idx.push(a, c2, b2, b2, c2, d2); // the top sheet
      idx.push(half + a, half + b2, half + c2, half + b2, half + d2, half + c2); // the bottom sheet, wound the other way
    }
    // sew the seam: the two sheets keep a welt apart at the border, so without a wall between them the rim is an open slit you can see through
    const ring = [];
    for (let i = 0; i < nx; i++) ring.push(i);
    for (let j = 0; j < nz; j++) ring.push(j * row + nx);
    for (let i = nx; i > 0; i--) ring.push(nz * row + i);
    for (let j = nz; j > 0; j--) ring.push(j * row);
    for (let k = 0; k < ring.length; k++) { const p = ring[k], q = ring[(k + 1) % ring.length]; idx.push(p, q, half + q, p, half + q, half + p); }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx); g.computeVertexNormals();
    return g;
  };
  const pillowMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .95 });
  pillowMat.onBeforeCompile = fabricMat.onBeforeCompile; // the same fine weave as the sofa
  pillowMat.customProgramCacheKey = () => "sofa-weave-pillow";
  const sofaBox = new THREE.Box3().setFromObject(sofaObj);
  // [colour, x offset from the sofa centre, lean from upright, yaw, roll] - leaning on the backrest, one a little more turned than the other
  // Paul 2026-11-11: the pillows looked far bigger than the laptop on the coffee table; 40 x 27 x 40 cm is the common 16-inch throw pillow (they were 48 x 32 x 48)
  const PILLOW_DIM = [.40, .27, .40];
  // Paul 2026-11-11: a second, larger plain pillow sits behind each coloured one, as in many American sofas. It fills the gap and lump the AI backrest leaves
  // behind a single pillow, so the sofa reads right from the front and from the side. Back pillows are fitted to the sofa first; the front ones then rest on them.
  const pillowDefs = [["#d6cbb4", -.50, 14, -.08, .03, "sofa-pillow-back-oat", [.48, .30, .48]], ["#8497a6", .50, 12, .10, -.03, "sofa-pillow-back-blue", [.48, .30, .48]], ["#7a8654", -.56, 30, .14, .05, "sofa-pillow-green"], ["#c26036", .535, 27, -.2, -.06, "sofa-pillow-terracotta"]];
  for (const [colour, dx, lean, yaw, roll, name, size] of pillowDefs) {
    const p = new THREE.Mesh(pillowGeo(...(size || PILLOW_DIM), colour), pillowMat);
    p.name = name; p.castShadow = true; p.receiveShadow = true; p.rotation.order = "YXZ";
    p.rotation.set(Math.PI / 2 - lean * Math.PI / 180, yaw, roll);
    p.position.set(SX + dx, sofaBox.min.y + .78, sofaBox.min.z + .72);
    scene.add(p);
  }
  // Conform the scatter pillows to the sofa (Paul 2026-11-11; card 41 measured that NO rigid pose fits). The AI sofa's backrest is lumpy, and a flat
  // pillow leaned on it leaves a wedge-shaped gap at the top while its lower back digs in. A real pillow is soft, so each pillow gets (1) a pose, the lean
  // and back-to-front shift whose rear sheet lies closest to the backrest with its bottom edge on the seat, and (2) a shape: each rear vertex pulled to
  // 3 mm off the sofa surface along the pillow's back normal (clamped, smoothed, faded toward the rim), the front sheet following by half so the pillow stays
  // plump, and the lower rows settled onto the seat. The search needs ray casts against the whole sofa mesh (about 1 s per pillow), so it is BAKED: the
  // numbers below are applied at load with no ray cast. If the sofa mesh ever changes, run `await __room.bakePillowFit()` in the console and paste its output
  // here. `__room.pillowFit()` measures how the pillows sit (mm; gap > 0 is air, < 0 is the pillow sunk into the sofa). The sofa mesh and colours are untouched.
  const PILLOW_NX = 24, PILLOW_NZ = 22, PILLOW_ROW = PILLOW_NX + 1, PILLOW_HALF = PILLOW_ROW * (PILLOW_NZ + 1), PILLOW_SEAT_ROWS = 6; // must match pillowGeo's nx, nz
  const PILLOW_REST = .003, PILLOW_PROBE = .06;
  const PILLOW_FIT = {"sofa-pillow-back-oat":{"leanDeg":24,"x":-0.21,"y":0.801,"z":-1.514,"rear":[24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,33,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,33,24,24,33,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,33,24,24,33,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,33,24,24,33,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,33,24,24,33,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,33,24,24,33,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,33,24,24,33,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,33,24,24,33,39,39,39,39,38,38,38,39,39,40,39,39,39,39,39,40,40,40,40,40,39,31,24,24,30,36,36,36,35,34,34,35,36,37,38,37,37,36,37,38,39,40,40,40,39,36,21,0,24,24,28,28,28,26,25,26,27,30,32,32,31,30,30,31,34,37,39,40,40,39,35,19,0,1,12,19,20,18,15,14,14,16,19,20,21,20,19,20,23,29,35,38,40,40,39,35,19,0,-15,9,21,22,17,11,7,5,5,6,6,6,5,5,8,13,22,31,37,39,40,39,35,19,0,24,24,32,31,25,19,12,7,3,0,-3,-5,-7,-7,-4,4,14,26,34,38,40,39,34,18,0,0,20,34,37,34,30,25,20,15,8,2,-3,-9,-13,-12,-6,6,19,30,37,39,38,33,17,0,0,18,34,38,39,37,35,33,29,23,18,10,-1,-11,-16,-13,-3,11,24,34,38,38,33,17,0,0,17,33,38,40,39,39,38,36,33,29,22,10,-4,-14,-17,-11,2,17,30,36,38,34,20,0,0,17,33,38,40,40,39,38,36,32,28,23,14,0,-13,-18,-15,-4,11,26,35,38,38,30,24,0,20,34,38,39,38,36,33,28,23,17,13,7,-3,-14,-19,-16,-6,8,23,33,38,39,33,24,24,30,37,38,36,33,28,23,17,11,6,2,-2,-9,-16,-18,-14,-4,9,22,31,35,37,32,24,24,32,37,33,28,23,17,11,5,1,-3,-7,-10,-15,-18,-17,-12,-5,5,15,22,28,31,29,24,24,32,27,18,13,9,6,2,-6,-9,-11,-13,-16,-18,-19,-17,-15,-11,-6,0,5,10,15,21,24,24,24,14,0,0,0,0,0,-15,-15,-15,-15,-15,-15,-15,-15,-15,-15,-14,-11,-8,-5,-1,3,8],"seat":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-5,0,2,0,-2,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,0,0,-18,0,14,5,-2,-13,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,0,-32,0,0,0,22,5,-10,-32,-32,-32,-32,-32,-32,-32,-32,-32,-32,-32,-32,-32,-32,-32,-32,-30,0,-45,0,0,0,0,36,12,-34,-36,-35,-35,-36,-37,-37,-37,-37,-36,-35,-34,-33,-32,-31,-30,-26,0,-34,0,0,0,0,0,0,0,0,-1,-1,-1,0,0,-1,-2,-3,-4,-5,-6,-8,-10,-12,-14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-5,-5,-5,-4,-3,-3,-3,0,0,0,0,0,0,4,2,1,0,0,-1,-3,-4,-4,-5,-5,0,-18,-17,-12,-9,-7,-5,0,0,0,0,0,0,0,0,11,6,2,-7,-6,-6,-7,-9,-12,-18,0,-30,-19,-12,-8,0,0,0,0,0,0,0,0,0,0,15,-7,-6,-5,-4,-5,-6,-8,-13,-21,0,-26,-13,-5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-1,-2,-4,-6,-13,0,-18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-1,-2,-3]},"sofa-pillow-back-blue":{"leanDeg":24,"x":0.79,"y":0.8052,"z":-1.514,"rear":[24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,33,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,33,24,24,33,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,33,24,24,33,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,33,24,24,31,39,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,33,24,0,21,36,39,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,33,24,0,19,35,39,40,40,40,40,40,40,40,40,40,40,40,40,40,39,40,40,40,40,40,33,24,0,19,35,39,40,40,40,40,40,40,40,40,40,40,39,39,38,38,38,39,40,40,40,33,24,0,19,35,39,40,40,40,40,40,40,40,40,40,39,38,36,34,34,35,37,39,40,40,33,24,0,19,35,39,40,40,40,40,40,40,40,40,39,38,34,30,27,27,30,34,37,39,40,33,24,0,19,35,39,40,40,40,40,40,40,40,40,38,35,29,22,18,18,23,29,34,37,39,33,24,0,19,35,39,40,40,40,40,40,40,40,39,36,30,21,12,8,8,14,21,28,33,37,32,24,0,18,34,39,40,40,40,40,40,40,39,37,32,23,12,2,-3,-2,3,10,17,24,30,29,24,0,16,32,38,40,40,40,40,40,40,38,34,26,14,2,-7,-11,-10,-5,1,6,12,19,23,24,0,14,30,37,39,40,40,40,40,39,35,28,17,4,-7,-13,-13,-9,-3,2,3,4,8,16,24,0,13,29,36,39,40,40,40,39,37,31,21,8,-5,-12,-11,-5,3,11,16,14,10,8,7,3,0,14,30,37,39,40,40,40,39,35,26,13,0,-10,-12,-4,7,18,26,30,28,24,18,6,-15,0,19,33,38,40,40,40,39,38,33,23,10,-4,-12,-10,1,13,23,29,33,34,33,30,17,0,24,30,38,39,39,38,37,37,36,32,23,11,-2,-10,-10,-1,8,15,21,26,29,32,34,28,24,24,32,38,36,34,32,31,29,28,26,21,13,2,-7,-9,-6,-1,4,9,13,17,23,28,28,24,24,30,32,28,24,20,16,14,12,12,10,6,0,-6,-10,-10,-8,-6,-2,1,5,11,17,21,24,24,23,18,12,7,2,-2,-5,-6,-7,-7,-8,-10,-12,-14,-14,-13,-12,-9,-8,-6,2,5,6,0,13,6,2,-3,-6,-10,-12,-15,-15,-15,-15,-15,-15,-15,-15,-14,-13,-12,-10,-11,-15,0,0,0,0],"seat":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-4,0,1,2,4,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-9,2,10,14,0,-32,-32,-32,-32,-32,-32,-32,-32,-32,-32,-32,-32,-32,-32,-32,-32,-32,-32,-32,-32,-7,14,0,0,0,-29,-32,-33,-34,-35,-36,-36,-36,-35,-34,-34,-34,-35,-36,-38,-39,-40,-40,-40,-39,4,0,0,0,0,-16,-14,-11,-9,-7,-6,-4,-3,-2,-1,-1,-1,-1,-1,-2,-3,-4,-5,-6,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-5,-5,-5,-4,-3,-3,-3,-2,-2,-3,-3,0,0,2,3,0,0,0,0,0,0,0,0,0,0,-18,-14,-10,-8,-6,-5,-4,-4,-4,-4,-5,-7,-8,7,14,0,0,0,0,0,0,0,0,0,0,-24,-15,-9,-6,-4,-2,-2,-1,-2,-2,-3,-4,-6,-7,23,0,0,0,0,0,0,0,0,0,0,-17,-8,-4,-2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-5,-3,-2,-1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"sofa-pillow-green":{"leanDeg":12,"x":-0.27,"y":0.766,"z":-1.274,"rear":[0,0,0,0,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,0,2,7,16,30,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,33,24,0,3,12,25,35,39,40,40,40,40,40,40,40,40,40,40,39,39,38,38,38,38,39,33,24,0,4,14,27,36,39,40,39,39,38,38,38,38,39,39,38,37,35,34,33,33,34,37,32,24,0,5,16,28,36,39,39,38,36,34,34,34,35,35,34,33,30,26,23,22,23,27,32,31,24,0,9,21,31,37,39,38,35,31,27,26,26,27,27,25,22,17,12,8,7,11,18,27,29,24,0,16,29,35,39,39,36,31,25,20,18,18,18,16,13,8,2,-3,-6,-6,0,10,23,28,24,24,29,36,39,39,39,35,29,22,16,13,12,10,6,1,-5,-11,-15,-17,-15,-7,5,19,26,24,24,32,39,40,40,39,35,29,21,15,12,9,5,0,-7,-14,-19,-22,-22,-19,-12,1,17,25,24,24,31,38,39,40,39,36,30,23,17,13,8,3,-4,-12,-18,-22,-24,-24,-21,-14,-1,14,24,24,24,26,33,37,39,39,37,32,25,19,14,8,2,-5,-13,-19,-23,-24,-24,-22,-16,-4,12,23,24,-3,9,22,32,37,39,37,33,27,20,14,9,2,-4,-12,-18,-22,-24,-24,-23,-17,-6,9,21,24,-15,-2,11,25,34,38,37,33,27,21,14,9,3,-3,-9,-15,-20,-23,-24,-23,-18,-8,8,20,24,0,-2,5,19,32,36,36,32,27,21,15,9,5,0,-5,-10,-15,-20,-22,-22,-18,-8,8,20,24,0,-2,2,16,30,35,34,31,26,21,16,12,8,5,1,-4,-10,-16,-20,-20,-16,-5,9,21,24,0,-2,2,16,30,35,33,30,26,23,20,17,15,12,8,3,-4,-10,-15,-16,-11,-1,13,23,24,0,-2,3,18,31,35,33,29,27,26,26,24,23,20,16,10,3,-4,-8,-9,-4,6,19,26,24,0,-1,5,20,32,36,34,31,30,31,32,32,30,28,24,18,11,4,0,1,5,15,25,28,24,0,1,8,23,34,37,35,33,33,34,36,36,35,33,30,25,19,14,11,12,16,23,31,31,24,0,3,13,26,35,37,36,34,33,34,34,34,33,32,29,26,22,19,18,20,23,29,34,31,24,0,4,18,30,36,35,32,28,26,24,22,21,20,19,17,15,14,13,14,16,20,24,29,28,24,0,1,21,29,30,25,18,11,6,2,0,-1,-2,-3,-4,-5,-5,-4,-3,-1,1,4,10,17,24,0,-15,24,24,21,11,2,-6,-11,-15,-15,-15,-15,-15,-15,-15,-15,-15,-15,-15,-15,-15,-11,-6,-1],"seat":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,0,0,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,0,0,-32,-32,-32,-32,-32,-32,-32,-32,-32,-31,-30,-30,-31,-32,-32,-32,-32,-30,-29,-28,-26,-25,-23,0,0,-45,-39,-36,-32,-30,-29,-29,-28,-27,-26,-25,-25,-26,-26,-26,-25,-25,-24,-23,-23,-22,-20,-17,0,-22,-24,-18,-14,-11,-7,-5,-4,-2,0,0,0,0,0,0,0,0,0,0,-1,-3,-4,-5,-7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-5,-5,-3,-1,0,-1,-2,-3,-3,-4,-4,-4,-4,-4,4,-4,-4,-4,-4,-5,-5,-5,0,0,15,-15,-12,-8,-4,-3,-5,-6,-6,-7,-7,-6,-6,-6,-7,-7,-7,-8,-9,-9,-10,-12,-15,0,0,-4,-18,-15,-10,-6,-6,-5,-5,-5,-5,-4,-4,-4,-3,-3,-4,-5,-6,-7,-8,-9,-12,-17,0,0,-14,-15,-10,-6,-4,-3,-2,-1,0,0,0,0,0,0,0,0,0,0,-1,-2,-4,-5,-9,0,0,-11,-8,-5,-3,-1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,-1]},"sofa-pillow-terracotta":{"leanDeg":12,"x":0.825,"y":0.7703,"z":-1.274,"rear":[24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,0,0,0,0,24,33,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,30,16,8,3,0,24,33,39,38,38,38,39,39,39,40,40,39,39,39,39,39,40,40,40,39,36,28,16,5,0,24,32,37,35,34,34,35,36,37,38,38,38,37,37,37,38,39,39,40,40,38,32,22,8,0,24,31,33,29,27,27,28,30,31,32,33,32,32,31,32,33,36,38,39,40,39,35,25,10,0,24,29,29,23,19,17,17,19,20,22,23,24,23,23,24,26,30,34,38,39,39,36,26,10,0,24,28,25,17,10,7,5,6,8,10,13,14,14,14,15,17,22,28,34,38,39,36,27,10,0,24,27,22,11,3,-3,-5,-5,-3,0,3,6,7,7,7,9,14,22,30,36,38,36,27,11,0,24,25,18,6,-4,-11,-14,-14,-12,-8,-3,0,1,1,1,3,8,17,27,35,38,36,28,11,0,24,24,16,2,-10,-17,-20,-20,-17,-13,-8,-5,-3,-3,-2,0,6,16,26,34,38,37,30,14,0,24,23,13,-1,-13,-20,-23,-22,-20,-15,-11,-7,-6,-5,-3,0,7,17,28,35,38,38,33,19,0,24,23,12,-3,-14,-21,-23,-23,-20,-16,-12,-9,-7,-5,-3,2,10,20,30,36,39,39,38,30,24,24,23,13,-2,-13,-19,-21,-21,-19,-16,-12,-9,-7,-4,0,5,13,23,32,38,40,40,40,33,24,24,24,14,1,-10,-16,-18,-18,-16,-13,-10,-7,-4,-1,3,9,18,27,34,38,40,40,40,33,24,24,25,18,5,-4,-10,-13,-13,-12,-9,-6,-3,0,4,9,15,22,30,36,39,40,40,40,33,24,24,27,22,11,2,-4,-7,-7,-6,-3,0,4,8,12,16,21,27,33,37,39,40,40,40,33,24,24,29,26,17,9,3,0,0,2,5,9,13,17,20,24,28,32,36,39,40,40,40,40,33,24,24,30,31,23,16,11,8,8,11,14,18,22,26,29,31,34,36,38,39,40,40,40,40,33,24,24,32,34,29,23,19,17,17,20,23,27,30,32,34,35,37,38,39,39,39,40,40,40,33,24,24,32,35,31,27,24,22,22,24,26,28,30,31,32,33,33,34,35,36,37,38,39,39,33,24,24,29,30,25,21,18,16,15,15,16,16,17,18,18,19,20,21,23,26,29,32,35,37,32,24,24,19,12,6,2,-1,-3,-4,-4,-4,-4,-4,-4,-4,-3,-2,-1,1,4,9,15,21,26,30,24,3,-3,-8,-12,-15,-15,-15,-15,-15,-15,-15,-15,-15,-15,-15,-15,-15,-15,-13,-9,-3,3,10,19,24],"seat":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-18,-24,-26,-27,-29,-30,-31,-32,-32,-32,-31,-30,-30,-30,-31,-32,-32,-32,-32,-32,-32,-32,-32,-32,-32,-32,-19,-22,-23,-24,-25,-25,-25,-25,-25,-24,-24,-24,-25,-26,-27,-28,-29,-30,-30,-29,-29,-29,-29,-29,-30,-9,-7,-5,-3,-2,0,0,0,0,0,0,0,0,0,0,0,0,-2,-3,-5,-7,-9,-11,-13,-17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-5,-5,-5,-4,-4,-1,0,-4,-4,-4,-4,-4,-4,-4,-4,-4,-3,-4,-4,-4,-4,-5,-5,-5,-5,-15,-12,-10,-9,-8,-8,-7,-7,-6,-6,-6,-6,-6,-6,-6,-6,-6,-7,-7,-8,-10,-11,-13,-16,-18,-18,-13,-10,-8,-7,-5,-5,-4,-4,-3,-3,-3,-3,-3,-3,-3,-4,-5,-6,-7,-9,-12,-14,-19,-26,-10,-6,-4,-2,-1,0,0,0,0,0,0,0,0,0,0,0,0,0,-1,-3,-4,-7,-9,-13,-21,-1,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,-2,-3,-4,-7]}};
  const sofaMeshes = []; sofaObj.traverse((o) => { if (o.isMesh) sofaMeshes.push(o); });
  const fitRay = new THREE.Raycaster();
  const fitDistance = (origin, direction, far) => { fitRay.set(origin, direction); fitRay.far = far; const hit = fitRay.intersectObjects(sofaMeshes, false)[0]; return hit ? hit.distance : null; };
  const pillowProbe = (p) => {
    const pos = p.geometry.attributes.position, v = new THREE.Vector3(), o = new THREE.Vector3(), down = new THREE.Vector3(0, -1, 0);
    p.updateMatrixWorld(true);
    const normal = new THREE.Vector3(0, -1, 0).transformDirection(p.matrixWorld); // the rear sheet faces local -y
    return {
      back: (index) => { v.fromBufferAttribute(pos, index).applyMatrix4(p.matrixWorld); o.copy(v).addScaledVector(normal, -PILLOW_PROBE); const t = fitDistance(o, normal, .3); return t === null ? null : t - PILLOW_PROBE; },
      seat: (index) => { v.fromBufferAttribute(pos, index).applyMatrix4(p.matrixWorld); o.copy(v); o.y += .05; const t = fitDistance(o, down, .2); return t === null ? null : t - .05; },
    };
  };
  // the vertex order of the baked seat rows: front sheet (0) then rear sheet (HALF), rows NZ-3..NZ, columns 0..NX
  const seatIndices = () => { const list = []; for (const base of [0, PILLOW_HALF]) for (let j = PILLOW_NZ - PILLOW_SEAT_ROWS + 1; j <= PILLOW_NZ; j++) for (let i = 0; i <= PILLOW_NX; i++) list.push(base + j * PILLOW_ROW + i); return list; };
  const applyPillowFit = (p, fit) => {
    const pos = p.geometry.attributes.position;
    p.rotation.x = Math.PI / 2 - fit.leanDeg * Math.PI / 180; p.position.set(fit.x, fit.y, fit.z); p.updateMatrixWorld(true);
    for (let k = 0; k < PILLOW_HALF; k++) { const d = fit.rear[k] / 1000; pos.setY(PILLOW_HALF + k, pos.getY(PILLOW_HALF + k) - d); pos.setY(k, pos.getY(k) - d * .5); }
    const inverse = p.quaternion.clone().invert(), pull = new THREE.Vector3(), local = new THREE.Vector3(), indices = seatIndices();
    indices.forEach((index, n) => { const dy = fit.seat[n] / 1000; if (!dy) return; pull.set(0, dy, 0).applyQuaternion(inverse); local.fromBufferAttribute(pos, index).add(pull); pos.setXYZ(index, local.x, local.y, local.z); });
    pos.needsUpdate = true; p.geometry.computeVertexNormals(); p.geometry.computeBoundingBox(); p.geometry.computeBoundingSphere();
  };
  const pillowBuild = {};
  const sofaOnlyCount = sofaMeshes.length;
  for (const [,,,,, name] of pillowDefs) { const p = scene.getObjectByName(name), fit = PILLOW_FIT[name]; if (p && fit) { applyPillowFit(p, fit); pillowBuild[name] = { leanDeg: fit.leanDeg, baked: true }; if (name.includes("-back-")) sofaMeshes.push(p); } } // the back pillows count as sofa for what rests on them
  // the search that produced PILLOW_FIT (QA only, slow): rebuilds each pillow from its definition, searches the pose, shapes it, and returns the numbers to paste
  const bakePillowFit = () => {
    const out = {}; sofaMeshes.length = sofaOnlyCount;
    for (const [colour, dx, lean, yaw, roll, name, size] of pillowDefs) {
      const p = scene.getObjectByName(name); if (!p) continue;
      p.geometry.dispose(); p.geometry = pillowGeo(...(size || PILLOW_DIM), colour);
      p.rotation.set(Math.PI / 2 - lean * Math.PI / 180, yaw, roll); p.position.set(SX + dx, sofaBox.min.y + .78, sofaBox.min.z + .72); p.updateMatrixWorld(true);
      const pos = p.geometry.attributes.position, started = performance.now();
      const median = (list) => { const s = list.filter((x) => x !== null).sort((a, b) => a - b); return s.length ? s[s.length >> 1] : null; };
      const interior = []; for (const jf of [.22, .36, .5, .64, .78]) for (const iff of [.2, .32, .44, .56, .68, .8]) interior.push(PILLOW_HALF + Math.round(jf * PILLOW_NZ) * PILLOW_ROW + Math.round(iff * PILLOW_NX));
      const rim = []; for (const [jf, iff] of [[.1, .1], [.1, .5], [.1, .9], [.5, .06], [.5, .94], [.9, .1], [.9, .5], [.9, .9]]) rim.push(PILLOW_HALF + Math.round(jf * PILLOW_NZ) * PILLOW_ROW + Math.round(iff * PILLOW_NX));
      const bottom = []; for (const iff of [.25, .35, .5, .65, .75]) bottom.push(PILLOW_HALF + (PILLOW_NZ - 1) * PILLOW_ROW + Math.round(iff * PILLOW_NX));
      const restOnSeat = () => { const g = median(bottom.map(pillowProbe(p).seat)); if (g !== null) { p.position.y -= g + PILLOW_REST; p.updateMatrixWorld(true); } };
      const cost = () => { const probe = pillowProbe(p); let c = 0; for (const k of interior) { const g = probe.back(k), r = g === null ? .2 : Math.max(-.2, Math.min(.2, g - PILLOW_REST)); c += (r < 0 ? 4 : 1) * r * r; }
        for (const k of rim) { const g = probe.back(k); if (g !== null && g < 0) c += 12 * g * g; } // the rim only counts when it digs into the sofa (arms, backrest)
        return c; };
      const z0 = p.position.z, x0 = p.position.x; let best = null;
      for (let dxs = -.06; dxs <= .0601; dxs += .02) for (let leanDeg = 12; leanDeg <= 38; leanDeg += 4) for (let dz = -.06; dz <= .301; dz += .03) {
        p.rotation.x = Math.PI / 2 - leanDeg * Math.PI / 180; p.position.set(x0 + dxs, p.position.y, z0 + dz); p.updateMatrixWorld(true); restOnSeat();
        const c = cost(); if (!best || c < best.c) best = { c, leanDeg, dz, dxs, y: p.position.y };
      }
      // refine around the best coarse pose
      const coarse = { ...best };
      for (let leanDeg = coarse.leanDeg - 4; leanDeg <= coarse.leanDeg + 4; leanDeg += 2) for (let dz = coarse.dz - .02; dz <= coarse.dz + .0201; dz += .01) {
        p.rotation.x = Math.PI / 2 - leanDeg * Math.PI / 180; p.position.set(x0 + coarse.dxs, p.position.y, z0 + dz); p.updateMatrixWorld(true); restOnSeat();
        const c = cost(); if (c < best.c) best = { c, leanDeg, dz, dxs: coarse.dxs, y: p.position.y };
      }
      p.rotation.x = Math.PI / 2 - best.leanDeg * Math.PI / 180; p.position.set(x0 + best.dxs, best.y, z0 + best.dz); p.updateMatrixWorld(true);
      let field = new Float32Array(PILLOW_HALF); const probe = pillowProbe(p);
      for (let j = 0; j <= PILLOW_NZ; j++) for (let i = 0; i <= PILLOW_NX; i++) { const g = probe.back(PILLOW_HALF + j * PILLOW_ROW + i); field[j * PILLOW_ROW + i] = g === null ? 0 : Math.max(-.025, Math.min(.04, g - PILLOW_REST)); }
      for (let pass = 0; pass < 6; pass++) { const next = field.slice(); for (let j = 1; j < PILLOW_NZ; j++) for (let i = 1; i < PILLOW_NX; i++) { const k = j * PILLOW_ROW + i; next[k] = (4 * field[k] + field[k - 1] + field[k + 1] + field[k - PILLOW_ROW] + field[k + PILLOW_ROW]) / 8; } field = next; }
      const rear = []; let maxMove = 0;
      for (let j = 0; j <= PILLOW_NZ; j++) for (let i = 0; i <= PILLOW_NX; i++) {
        const k = j * PILLOW_ROW + i, m = Math.max(Math.abs(i / PILLOW_NX * 2 - 1), Math.abs(j / PILLOW_NZ * 2 - 1));
        const d = field[k] * (1 - .4 * THREE.MathUtils.smoothstep(m, .85, 1)); rear.push(Math.round(d * 1000)); maxMove = Math.max(maxMove, Math.abs(d));
        pos.setY(PILLOW_HALF + k, pos.getY(PILLOW_HALF + k) - rear[k] / 1000); pos.setY(k, pos.getY(k) - rear[k] / 2000);
      }
      const seatProbe = pillowProbe(p), inverse = p.quaternion.clone().invert(), pull = new THREE.Vector3(), local = new THREE.Vector3(), seat = [];
      for (const index of seatIndices()) {
        const j = Math.floor((index % PILLOW_HALF) / PILLOW_ROW), g = seatProbe.seat(index); let dy = 0;
        if (g !== null) { const w = THREE.MathUtils.smoothstep(j, PILLOW_NZ - PILLOW_SEAT_ROWS + 1, PILLOW_NZ); dy = g > 0 ? -Math.min(g, .05) * w : (-g - .008 > 0 ? (-g - .008) * w : 0); }
        seat.push(Math.round(dy * 1000));
        if (dy) { pull.set(0, dy, 0).applyQuaternion(inverse); local.fromBufferAttribute(pos, index).add(pull); pos.setXYZ(index, local.x, local.y, local.z); }
      }
      pos.needsUpdate = true; p.geometry.computeVertexNormals(); p.geometry.computeBoundingBox(); p.geometry.computeBoundingSphere();
      if (name.includes("-back-")) sofaMeshes.push(p);
      out[name] = { leanDeg: best.leanDeg, x: +p.position.x.toFixed(4), y: +p.position.y.toFixed(4), z: +p.position.z.toFixed(4), rear, seat, _maxMoveMm: Math.round(maxMove * 1000), _ms: Math.round(performance.now() - started) };
    }
    return out;
  };
  const measurePillow = (p) => {
    const probe = pillowProbe(p), gaps = [], seat = [];
    for (let j = 1; j < PILLOW_NZ; j++) for (let i = 1; i < PILLOW_NX; i++) { const g = probe.back(PILLOW_HALF + j * PILLOW_ROW + i); if (g !== null) gaps.push(g * 1000); }
    for (let i = 3; i <= PILLOW_NX - 3; i++) { const g = probe.seat(PILLOW_HALF + (PILLOW_NZ - 1) * PILLOW_ROW + i); if (g !== null) seat.push(g * 1000); }
    const sorted = [...gaps].sort((a, b) => a - b), at = (q) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))], r1 = (x) => Math.round(x * 10) / 10;
    return { back: { samples: gaps.length, missed: (PILLOW_NZ - 1) * (PILLOW_NX - 1) - gaps.length, medianMm: r1(at(.5)), p95Mm: r1(at(.95)), maxPenetrationMm: r1(Math.max(0, -sorted[0])) }, seat: { samples: seat.length, medianMm: r1(seat.length ? [...seat].sort((a, b) => a - b)[seat.length >> 1] : 0), maxMm: r1(seat.length ? Math.max(...seat) : 0) } };
  };
  const tableObj = place(table, { height: .6, x: TX, z: TZ });
  { // Paul 2026-11-20: the side table is a little small for a lamp, a mug and a notebook. It is 20% wider (30% would touch the sofa's right arm, which ends at x 1.35), the same height, and stays centred under the lamp.
    tableObj.scale.set(tableObj.scale.x * 1.2, tableObj.scale.y, tableObj.scale.z * 1.2); tableObj.updateMatrixWorld(true);
    const wide = new THREE.Box3().setFromObject(tableObj).getCenter(new THREE.Vector3()); tableObj.position.x += TX - wide.x; tableObj.position.z += TZ - wide.z; tableObj.updateMatrixWorld(true);
  }  // light oak to match the coffee table, with a faint grain projected from three sides (the model has no UVs)
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
  // Give the table six percent more room in plan while keeping the top and feet at their original heights.
  const coffeeWidth = 1.06;
  coffee.scene.scale.multiply(new THREE.Vector3(coffeeWidth, 1, coffeeWidth));
  const coffeeObj = place(coffee, { width: coffeeWidth, x: SX, z: SZ + 1.05 });
  const coffeeWoodMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .62 });
  coffeeWoodMat.onBeforeCompile = (sh) => {
    sh.uniforms.grain = { value: grain };
    sh.vertexShader = "varying vec3 vCoffeeWP; varying vec3 vCoffeeWN;\n" + sh.vertexShader.replace("#include <project_vertex>", "#include <project_vertex>\nvCoffeeWP = (modelMatrix * vec4(transformed, 1.)).xyz; vCoffeeWN = normalize(mat3(modelMatrix) * objectNormal);");
    sh.fragmentShader = "uniform sampler2D grain; varying vec3 vCoffeeWP; varying vec3 vCoffeeWN;\n" + sh.fragmentShader.replace("#include <color_fragment>", `#include <color_fragment>
      vec3 bw = pow(abs(normalize(vCoffeeWN)), vec3(4.)); bw /= bw.x + bw.y + bw.z;
      float g = texture2D(grain, vCoffeeWP.zy * vec2(1.2, 6.)).r * bw.x + texture2D(grain, vCoffeeWP.xz * vec2(1.2, 6.)).r * bw.y + texture2D(grain, vCoffeeWP.yx * vec2(6., 1.2)).r * bw.z;
      diffuseColor.rgb *= .86 + .28 * g;`);
  };
  coffeeWoodMat.customProgramCacheKey = () => "room01-coffee-oak-grain-v1";
  prepare(coffeeObj, () => coffeeWoodMat);
  const coffeeBounds = new THREE.Box3().setFromObject(coffeeObj);
  const screenReflectionMat = new THREE.MeshStandardMaterial({ color: "#9db9cf", emissive: "#506a7f", emissiveIntensity: .12, roughness: .45, transparent: true, opacity: 0, depthWrite: false });
  const screenReflection = add(new THREE.PlaneGeometry(.42, .25), screenReflectionMat,
    coffeeBounds.getCenter(new THREE.Vector3()).x, coffeeBounds.max.y + .004, coffeeBounds.getCenter(new THREE.Vector3()).z - .08, false);
  screenReflection.rotation.x = -Math.PI / 2; screenReflection.name = "tv-screen-reflection";
  // a small low chair (built by code from the side profile of a drawing, so it works without an image-to-3D quota), turned toward the coffee table
  lowChair.scene.rotation.y = Math.PI / 2; // the chair faces +z; turn it to face +x (toward the table)
  const chairObj = place(lowChair, { height: .5, x: SX - 1.0, z: SZ + .75 });
  // Keep the chair's orange colour, but use the sofa's existing fine weave so the rounded shell reads as upholstered fabric.
  prepare(chairObj, () => fabricMat);
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
  // A clothbound book: cream fore-edge, olive boards and quiet gilt tooling, batched as one mesh.
  const coffeeBook = (() => {
    const pieces = [];
    const piece = (geometry, color, shade = () => 1) => {
      const position = geometry.attributes.position;
      const values = new Float32Array(position.count * 3);
      const tint = new THREE.Color(color), shaded = new THREE.Color();
      for (let i = 0; i < position.count; i++) {
        shaded.copy(tint).multiplyScalar(shade(position.getX(i), position.getY(i), position.getZ(i))).toArray(values, i * 3);
      }
      geometry.setAttribute("color", new THREE.BufferAttribute(values, 3));
      pieces.push(geometry);
    };
    piece(new THREE.BoxGeometry(.26, .0045, .18).translate(0, .00225, 0), 0x515c42);
    piece(new THREE.BoxGeometry(.249, .039, .167, 1, 8, 1).translate(0, .024, 0), 0xd9c8a5,
      (x, y, z) => 0.94 + 0.055 * Math.cos((y - .0045) / .039 * Math.PI * 8) + 0.025 * Math.sin(x * 43 + z * 17));
    piece(new THREE.BoxGeometry(.26, .0055, .18, 10, 1, 6).translate(0, .04675, 0), 0x637259,
      (x, y, z) => 0.98 + 0.043 * Math.sin(x * 105 + z * 23) + 0.025 * Math.cos(z * 137));
    const spine = new THREE.CylinderGeometry(.02475, .02475, .26, 12, 1, false, Math.PI / 2, Math.PI);
    spine.rotateZ(Math.PI / 2).translate(0, .02475, -.06525);
    piece(spine, 0x4b5942);
    // The inset border and its small diamond are inside the original book envelope.
    for (const z of [-.061, .061]) piece(new THREE.BoxGeometry(.2083, .0008, .0017).translate(0, .0495, z), 0xb29b64);
    for (const x of [-.105, .105]) piece(new THREE.BoxGeometry(.0017, .0008, .1237).translate(x, .0495, 0), 0xb29b64);
    piece(new THREE.BoxGeometry(.019, .0008, .019).rotateY(Math.PI / 4).translate(0, .0495, 0), 0xb29b64);
    return add(mergeGeometries(pieces), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .89 }), SX - .12, coffeeTop, SZ + 1.02);
  })();
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
  // ---------- lived-in small things (Paul 2026-11-20, GrokBot's list items 1 to 3; "vertices may loosen, refinement matters") ----------
  // 1. The side table: a glass of water on a coaster printed with our name, and an open book (no glasses on it: they did not read as 3D). They stand in the ring between the lamp's foot (radius 111 mm)
  //    and the table edge (radius 275 mm), clear of both. 2. The rug: a pair of slippers, one a little askew. 3. Series night only: the coffee table changes (a bowl of popcorn, the laptop
  //    closed, steam off the mug) and the remote is tossed on the sofa. All of it is built from simple solids; vertex colours, so one mesh per group.
  const PROPS = {};
  {
    let seed = 4242; const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const col = (geometry, hex) => { // vertex colours on a non-indexed copy, ready to merge
      const g = geometry.index ? geometry.toNonIndexed() : geometry.clone(); g.deleteAttribute("uv");
      const c = new THREE.Color(hex), n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) c.toArray(a, i * 3);
      g.setAttribute("color", new THREE.Float32BufferAttribute(a, 3)); return g;
    };
    const solid = (parts, name, cast = true) => { const g = mergeGeometries(parts.map(([geo, hex]) => col(geo, hex)), false); g.computeVertexNormals(); const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .72 })); m.name = name; m.castShadow = cast; m.receiveShadow = true; scene.add(m); return m; };
    const at = (geo, x, y, z, yaw = 0) => geo.rotateY(yaw).translate(x, y, z);

    // ---- 1. side table ----
    const COASTER = { x: TX + .16, z: TZ + .125 }, BOOK = COASTER; // the coaster lies under the red mug, by the lamp's foot on the sofa-side-front of the table
    const coasterTex = canvasTex(256, 256, (ctx, w, h) => { // a cork-and-cream coaster with our name
      ctx.fillStyle = "#e9dcc3"; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = "#8a5a36"; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(w / 2, h / 2, w * .4, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#4a2c1a"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "italic 700 62px Georgia, serif"; ctx.fillText("paul's", w / 2, h / 2 + 2);
    });
    const coasterSide = new THREE.MeshStandardMaterial({ color: 0xc9b48f, roughness: .9 });
    const coaster = new THREE.Mesh(new THREE.CylinderGeometry(.047, .047, .005, 40).translate(COASTER.x, sideTop + .0025, COASTER.z), [coasterSide, new THREE.MeshStandardMaterial({ map: coasterTex, roughness: .85 }), coasterSide]);
    coaster.name = "side-table-coaster-top"; coaster.receiveShadow = true; scene.add(coaster);
    // The glass of water stands on the TV console (Paul 2026-11-20: someone came home, drank some water and left the glass there), between the books and the right-hand speaker.
    const GLASS = { x: .65, y: .59, z: 2.07 };
    const glassProfile = [[0, 0], [.027, 0], [.0285, .006], [.0335, .095], [.0345, .1], [.0325, .1], [.0315, .09], [.0255, .008], [0, .008]].map(([r, y]) => new THREE.Vector2(r, y));
    const glass = new THREE.Mesh(new THREE.LatheGeometry(glassProfile, 36).translate(GLASS.x, GLASS.y, GLASS.z), new THREE.MeshPhysicalMaterial({ color: 0xdfeceb, roughness: .08, metalness: 0, transparent: true, opacity: .38, side: THREE.DoubleSide, depthWrite: false }));
    glass.name = "console-water-glass"; glass.renderOrder = 2; scene.add(glass);
    const water = new THREE.Mesh(new THREE.LatheGeometry([[0, .009], [.0268, .009], [.0305, .07], [0, .07]].map(([r, y]) => new THREE.Vector2(r, y)), 30).translate(GLASS.x, GLASS.y, GLASS.z), new THREE.MeshStandardMaterial({ color: 0xbfe0e3, roughness: .05, transparent: true, opacity: .55, depthWrite: false }));
    water.name = "console-water"; water.renderOrder = 1; scene.add(water);
    // The red mug (Paul 2026-11-20: bring the brick-red mug of Rooms 03 and 04 over, black coffee and rising steam included, and stand it by the lamp). The same build as Room 04's record-corner
    // mug: a hollow lathe body with a rolled rim, a buried half-loop handle with cap spheres, coffee 15 mm under the rim, and a thin gold ring on the rim and one near the foot. One mesh; the
    // steam is Room 04's 22-point curl (a still frame always, drifting while the visitor is in the room).
    const MUG = { x: COASTER.x, z: COASTER.z, yaw: -.446 }, mugY = sideTop + .005; // on the coaster
    {
      const profile = [[0, 0], [.0330, 0], [.0375, .0035], [.0400, .008], [.0400, .0900], [.0392, .0944], [.0376, .0952], [.0356, .0948], [.0342, .0900], [.0342, .0140], [.0320, .0110], [0, .0110]].map(([r, h]) => new THREE.Vector2(r, h));
      const tubeRadius = .0052, loop = .0365, dirX = Math.cos(MUG.yaw), dirZ = -Math.sin(MUG.yaw), GLAZE = 0xb0533c, GOLD = 0xd0a64e;
      const parts = [[new THREE.LatheGeometry(profile, 48).translate(MUG.x, mugY, MUG.z), GLAZE],
        [new THREE.CircleGeometry(.0338, 40).rotateX(-Math.PI / 2).translate(MUG.x, mugY + .080, MUG.z), 0x1c110b],
        [new THREE.TorusGeometry(.0255, tubeRadius, 12, 32, Math.PI).rotateZ(-Math.PI / 2).rotateY(MUG.yaw).translate(MUG.x + dirX * loop, mugY + .051, MUG.z + dirZ * loop), GLAZE],
        [new THREE.TorusGeometry(.0374, .0016, 8, 56).rotateX(Math.PI / 2).translate(MUG.x, mugY + .0948, MUG.z), GOLD],
        [new THREE.TorusGeometry(.0403, .0011, 8, 56).rotateX(Math.PI / 2).translate(MUG.x, mugY + .016, MUG.z), GOLD]];
      for (const side of [-1, 1]) parts.push([new THREE.SphereGeometry(tubeRadius, 10, 8).translate(MUG.x + dirX * loop, mugY + .051 + side * .0255, MUG.z + dirZ * loop), GLAZE]);
      const g = mergeGeometries(parts.map(([geo, hex]) => col(geo, hex)), false); g.computeVertexNormals();
      const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .3 })); m.name = "side-table-red-mug"; m.castShadow = true; m.receiveShadow = true; scene.add(m); PROPS.mug = m;
    }
    {
      const COUNT = 22, data = { pos: new Float32Array(COUNT * 3), col: new Float32Array(COUNT * 3), seed: new Float32Array(COUNT) };
      for (let i = 0; i < COUNT; i++) data.seed[i] = (i * .618034 + .07 * Math.sin(i * 5.3)) % 1;
      const geometry = new THREE.BufferGeometry(); geometry.setAttribute("position", new THREE.BufferAttribute(data.pos, 3)); geometry.setAttribute("color", new THREE.BufferAttribute(data.col, 3));
      const puff = canvasTex(64, 64, (ctx, w, h) => { const gr = ctx.createRadialGradient(32, 32, 2, 32, 32, 30); gr.addColorStop(0, "rgba(255,255,255,.85)"); gr.addColorStop(.5, "rgba(255,255,255,.3)"); gr.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h); });
      const points = new THREE.Points(geometry, new THREE.PointsMaterial({ map: puff, size: .058, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: .2, blending: THREE.AdditiveBlending, depthWrite: false }));
      points.name = "side-table-mug-steam"; points.frustumCulled = false; points.raycast = () => {}; scene.add(points);
      const RIM = { x: MUG.x, y: mugY + .098, z: MUG.z };
      const update = (t) => {
        for (let i = 0; i < COUNT; i++) {
          const life = (t * .26 + data.seed[i]) % 1, widen = .25 + life * 1.6, sway = Math.sin(t * .9 + life * 5.2 + data.seed[i] * 6) * .012 * widen, spread = Math.sin(data.seed[i] * 40) * .008 * widen;
          data.pos[i * 3] = RIM.x + sway + spread + life * .014; data.pos[i * 3 + 1] = RIM.y + life * .16; data.pos[i * 3 + 2] = RIM.z + Math.cos(t * .7 + life * 4.1 + data.seed[i] * 7) * .009 * widen + Math.cos(data.seed[i] * 31) * .006 * widen;
          const fade = Math.sin(Math.PI * Math.min(1, life * 1.05)) * (1 - life * .5); data.col[i * 3] = fade; data.col[i * 3 + 1] = fade; data.col[i * 3 + 2] = fade * .97;
        }
        geometry.attributes.position.needsUpdate = true; geometry.attributes.color.needsUpdate = true;
      };
      update(7.3); PROPS.mugSteam = { points, update };
    }
    // The notebook (Paul 2026-11-20: take Room 04's Lounge notebook, recoloured if need be): a saddle-brown cover with a dark elastic band, cream pages, and the window-seat pen lying across it
    // (dark lacquer body, steel cap with a gold ring and clip, steel point). Its long side runs along the table's edge so it stays inside the ring.
    const NB = { x: TX - .15, z: TZ + .15 }, nbdx = NB.x - TX, nbdz = NB.z - TZ, nbd = Math.hypot(nbdx, nbdz);
    const nbYaw = Math.atan2(-nbdz / nbd, nbdx / nbd); // local z (the long side) -> the tangent (-dz, dx) / d
    {
      const cover = (y, hex) => { const sh = new THREE.Shape(), w = .15, d = .21, r = .009; sh.moveTo(-w / 2 + r, -d / 2); sh.lineTo(w / 2 - r, -d / 2); sh.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + r); sh.lineTo(w / 2, d / 2 - r); sh.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2); sh.lineTo(-w / 2 + r, d / 2); sh.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - r); sh.lineTo(-w / 2, -d / 2 + r); sh.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + r, -d / 2);
        return [new THREE.ExtrudeGeometry(sh, { depth: .003, bevelEnabled: true, bevelThickness: .0005, bevelSize: .0008, bevelSegments: 2, curveSegments: 6 }).rotateX(-Math.PI / 2).translate(0, y, 0), hex]; };
      const nb = [cover(0, 0xa37152), [new THREE.BoxGeometry(.138, .013, .198).translate(0, .0095, 0), 0xf3ead6], cover(.0185, 0xa37152), [new THREE.BoxGeometry(.006, .0008, .203).translate(.054, .0223, 0), 0x44312c], // covers, page block, the elastic band
        [new THREE.BoxGeometry(.0016, .0135, .198).translate(-.0718, .0095, 0), 0xb9a77f], [new THREE.BoxGeometry(.138, .0135, .0016).translate(0, .0095, .0995), 0xe4d7bb]]; // the spine side and the foot edge of the pages
      const penStart = [-.016, 0, .071], penEnd = [.025, 0, -.088], penR = .0052, bookTop = .0215;
      const axis = new THREE.Vector3(penStart[0] - penEnd[0], 0, penStart[2] - penEnd[2]).normalize(), up = new THREE.Vector3(0, 1, 0), basis = new THREE.Matrix4().makeBasis(new THREE.Vector3().crossVectors(axis, up), axis, up);
      const penPart = (geo, hex) => nb.push([geo.translate(0, .003, 0).applyMatrix4(basis).translate((penStart[0] + penEnd[0]) / 2, bookTop + penR, (penStart[2] + penEnd[2]) / 2), hex]);
      penPart(new THREE.CylinderGeometry(.0046, .004, .103, 10).translate(0, -.0165, 0), 0x16171a);
      penPart(new THREE.CylinderGeometry(.0052, .0052, .045, 10).translate(0, .0575, 0), 0xb9bcc0);
      penPart(new THREE.TorusGeometry(.00525, .0007, 6, 12).rotateX(Math.PI / 2).translate(0, .034, 0), 0xd0a64e);
      penPart(new THREE.ConeGeometry(.0038, .018, 10).rotateX(Math.PI).translate(0, -.077, 0), 0xb9bcc0);
      penPart(new THREE.BoxGeometry(.0016, .03, .0016).translate(0, .06, .0056), 0xd0a64e);
      const frame = new THREE.Matrix4().compose(new THREE.Vector3(NB.x, sideTop, NB.z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), nbYaw), new THREE.Vector3(1, 1, 1));
      const g = mergeGeometries(nb.map(([geo, hex]) => col(geo, hex)), false); g.applyMatrix4(frame); g.computeVertexNormals();
      const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .62 })); m.name = "side-table-notebook"; m.castShadow = true; m.receiveShadow = true; scene.add(m); PROPS.notebook = m;
    }
    PROPS.sideTable = { coaster, glass, water, COASTER, MUG, NB };

    // ---- 2a. the oatmeal scuffs on the rug (right of the coffee table, in front of the sofa's right end): a soft wool upper on a deep-brown sole ----
    const slipper = (side) => { // a soft scuff: an oat-wool upper over the toes on a deep-brown sole, a cream footbed; local +x is toward the toe; 265 mm long, 100 mm wide
      const L0 = .265, W0 = .1, shape = new THREE.Shape(); shape.moveTo(-L0 / 2 + .045, -W0 * .36);
      shape.bezierCurveTo(-L0 / 2 + .005, -W0 * .34, -L0 / 2 - .004, -W0 * .1, -L0 / 2 + .002, W0 * .08); shape.bezierCurveTo(-L0 / 2 + .01, W0 * .36, -L0 / 2 + .05, W0 * .42, -L0 / 2 + .09, W0 * .46);
      shape.bezierCurveTo(L0 / 2 - .07, W0 * .56, L0 / 2 - .005, W0 * .34, L0 / 2, 0); shape.bezierCurveTo(L0 / 2 - .005, -W0 * .4, L0 / 2 - .07, -W0 * .5, -L0 / 2 + .09, -W0 * .44); shape.bezierCurveTo(-L0 / 2 + .06, -W0 * .4, -L0 / 2 + .05, -W0 * .37, -L0 / 2 + .045, -W0 * .36);
      const sole = new THREE.ExtrudeGeometry(shape, { depth: .014, bevelEnabled: true, bevelThickness: .0025, bevelSize: .0025, bevelSegments: 2, curveSegments: 20 }); sole.rotateX(-Math.PI / 2);
      const footbed = new THREE.ShapeGeometry(shape, 20).rotateX(-Math.PI / 2).scale(.93, 1, .9).translate(0, .0185, 0);
      const upper = new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2).scale(.098, .043, .056).translate(.052, .0185, 0);
      const rim = new THREE.TorusGeometry(1, .0045, 8, 30).rotateX(Math.PI / 2).scale(.094, 1, .052).translate(.052 - .004, .0215, 0); // a soft folded edge round the opening
      const parts = [[sole, 0x4a2c1a], [footbed, 0xc9b08a], [upper, 0xe2d6bd], [rim, 0xd1c3a6]];
      return mergeGeometries(parts.map(([geo, hex]) => col(geo, hex)), false);
    };
    {
      const place = (geo, x, z, yaw, flip) => { const g = geo.clone(); if (flip) { g.scale(1, 1, -1); const pa = g.attributes.position, ca = g.attributes.color; for (let i = 0; i < pa.count; i += 3) for (const att of [pa, ca]) { const x1 = att.getX(i + 1), y1 = att.getY(i + 1), z1 = att.getZ(i + 1); att.setXYZ(i + 1, att.getX(i + 2), att.getY(i + 2), att.getZ(i + 2)); att.setXYZ(i + 2, x1, y1, z1); } } /* a mirrored copy turns every triangle inside out: swap two corners of each */ const m = new THREE.Matrix4().compose(new THREE.Vector3(x, .0143, z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw), new THREE.Vector3(1, 1, 1)); g.applyMatrix4(m); return g; };
      const base = slipper();
      const left = place(base, 1.16, -.80, -1.02, false), right = place(base, 1.30, -.60, -1.58, true); // the left stands as it was kicked off, the right a little askew
      const g = mergeGeometries([left, right], false); g.computeVertexNormals();
      const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .92 })); m.name = "rug-slippers"; m.castShadow = true; m.receiveShadow = true; scene.add(m); PROPS.slippers = m;
    }
    // ---- 2b. the red flip-flops on the rug (Paul 2026-11-20: take Room 02's thongs and turn the blue to red; no new modelling), in front of the coffee table, a different spot ----
    // The same procedural pair as Room 02 (a foam sole 27 x 10 cm with a rounded edge, a thong of two straps and a post), here with red straps. One is kicked a little crooked.
    {
      const soleShape = new THREE.Shape(); soleShape.moveTo(0, -.135); soleShape.bezierCurveTo(.05, -.135, .052, -.07, .05, -.02); soleShape.bezierCurveTo(.052, .05, .06, .12, 0, .135); soleShape.bezierCurveTo(-.06, .12, -.052, .05, -.05, -.02); soleShape.bezierCurveTo(-.052, -.07, -.05, -.135, 0, -.135);
      const SOLE = 0xf1ece3, STRAP = 0xc23b32;
      const strapGeo = (mx) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[mx * .046, .02, -.015], [mx * .04, .043, .01], [mx * .018, .05, .05], [0, .034, .085]].map((q) => new THREE.Vector3(...q))), 14, .0075, 6).scale(1, .7, 1);
      const oneFlip = () => [[new THREE.ExtrudeGeometry(soleShape, { depth: .016, bevelEnabled: true, bevelSize: .004, bevelThickness: .003, bevelSegments: 2, curveSegments: 10 }).rotateX(Math.PI / 2).translate(0, .019, 0), SOLE],
        [strapGeo(-1), STRAP], [strapGeo(1), STRAP], [new THREE.CylinderGeometry(.007, .007, .02, 8).translate(0, .028, .085), STRAP]];
      const placeFlip = (x, z, yaw, mirror) => oneFlip().map(([geo, hex]) => {
        const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.deleteAttribute("uv");
        if (mirror) { g.scale(-1, 1, 1); const pa = g.attributes.position; for (let i = 0; i < pa.count; i += 3) { const x1 = pa.getX(i + 1), y1 = pa.getY(i + 1), z1 = pa.getZ(i + 1); pa.setXYZ(i + 1, pa.getX(i + 2), pa.getY(i + 2), pa.getZ(i + 2)); pa.setXYZ(i + 2, x1, y1, z1); } } // a mirrored copy turns every triangle inside out: swap two corners of each
        g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x, .0118, z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw), new THREE.Vector3(1, 1, 1))); return [g, hex];
      });
      const flips = [...placeFlip(-.03, -.09, Math.PI - .3, false), ...placeFlip(.19, -.02, Math.PI + .55, true)]; // kicked off in front of the coffee table, toes towards it, the right one crooked
      const g = mergeGeometries(flips.map(([geo, hex]) => col(geo, hex)), false); g.computeVertexNormals();
      const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .78 })); m.name = "rug-flip-flops"; m.castShadow = true; m.receiveShadow = true; scene.add(m); PROPS.flips = m;
    }

    // ---- 4. by the door (Paul 2026-11-20, free hand; then: use Room 04's mat, Room 02's sneakers, finer keys, and keep the hooks away from the couplet) ----
    // Shared with the other rooms: the doormat is Room 04's graphite ribbed mat in a slim brass frame (the same bump pattern), the sneakers are Room 02's model in a navy colourway, and the key hooks hang on
    // the wall beside the thermostat, over the umbrella stand, not under the blessing couplet.
    {
      const MAT = { x: W / 2 - .36, z: doorZ, w: .46, l: .8, f: .02 };
      let ribSeed = 5; const ribRnd = () => (ribSeed = (ribSeed * 16807) % 2147483647) / 2147483647; // its own grain, so the room's shared random stream is untouched
      const ribs = canvasTex(128, 128, (ctx, w, h) => { for (let y = 0; y < h; y++) { const v = Math.max(0, Math.min(255, Math.round(128 + Math.sin(y / 16 * Math.PI * 2) * 44 + (ribRnd() - .5) * 22))); ctx.fillStyle = `rgb(${v},${v},${v})`; ctx.fillRect(0, y, w, 1); } });
      ribs.colorSpace = THREE.NoColorSpace; ribs.wrapS = ribs.wrapT = THREE.RepeatWrapping; ribs.repeat.set(1, 2);
      const doormat = new THREE.Group(); doormat.name = "entry-doormat";
      const weave = new THREE.Mesh(new THREE.BoxGeometry(MAT.w - 2 * MAT.f, .012, MAT.l - 2 * MAT.f).translate(MAT.x, .006, MAT.z), new THREE.MeshStandardMaterial({ color: 0x2b2b2e, roughness: 1, bumpMap: ribs, bumpScale: 1.4 }));
      weave.name = "entry-doormat-weave"; weave.receiveShadow = true; doormat.add(weave);
      const frameParts = [];
      for (const [w, l, dx, dz] of [[MAT.w, MAT.f, 0, MAT.l / 2 - MAT.f / 2], [MAT.w, MAT.f, 0, -MAT.l / 2 + MAT.f / 2], [MAT.f, MAT.l - 2 * MAT.f, MAT.w / 2 - MAT.f / 2, 0], [MAT.f, MAT.l - 2 * MAT.f, -MAT.w / 2 + MAT.f / 2, 0]]) frameParts.push([new THREE.BoxGeometry(w, .0135, l).translate(MAT.x + dx, .00675, MAT.z + dz), 0xb8934e]);
      const frame = solid(frameParts, "entry-doormat-frame", false); scene.remove(frame); doormat.add(frame);
      const lettering = document.createElement("canvas"); lettering.width = 1024; lettering.height = 512;
      const ink = lettering.getContext("2d"); ink.fillStyle = "#d9c7a7"; ink.textAlign = "center"; ink.textBaseline = "middle"; ink.font = "600 104px Georgia, 'Times New Roman', serif"; ink.fillText("Roomverse 3D", 512, 256);
      ink.globalAlpha = .55; ink.fillRect(250, 178, 524, 2); ink.fillRect(250, 335, 524, 2);
      const print = new THREE.CanvasTexture(lettering); print.colorSpace = THREE.SRGBColorSpace; print.anisotropy = 8;
      const welcome = new THREE.Mesh(new THREE.PlaneGeometry(MAT.l - .16, MAT.w - .1), new THREE.MeshStandardMaterial({ map: print, transparent: true, roughness: 1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }));
      welcome.name = "entry-doormat-welcome"; welcome.rotation.set(-Math.PI / 2, 0, Math.PI / 2); welcome.position.set(MAT.x, .0128, MAT.z); doormat.add(welcome);
      scene.add(doormat); PROPS.doormat = doormat;
      // The living room's door opens on a shared passage, so no street shoes here. Paul's beige clogs (Codex's model) stand between the door frame (it ends at z 1.775) and the umbrella stand (z 1.98 and up), toes to the wall; the oatmeal house slippers stay where they were, on the rug in front of the coffee table.
      PROPS.shoes = new THREE.Group(); PROPS.shoes.name = "entry-clogs"; scene.add(PROPS.shoes); PROPS.shoesInfo = { ready: false, placed: false };
      loader.loadAsync(new URL("./models/room01-clogs-beige-v2.glb", import.meta.url).href).then((asset) => { // Paul's beige clogs (Codex's model): recoloured by material name in sRGB, scaled to fit the slot, toes to the wall
        const clogs = asset.scene, colours = { upper: "#d6c69f", sole: "#c8b88e", lining: "#e6694a", loop: "#d6c69f" };
        clogs.traverse((o) => { if (!o.isMesh) return; if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals(); /* the v2 file carries no normals */ o.castShadow = true; o.receiveShadow = true; const c = colours[o.material.name]; if (c) { o.material = o.material.clone(); o.material.color.set(c); o.material.vertexColors = false; o.material.roughness = Math.max(o.material.roughness, .82); } });
        clogs.scale.multiplyScalar(.93); { const b = new THREE.Box3().setFromObject(clogs), c = b.getCenter(new THREE.Vector3()); clogs.position.set(-c.x, -b.min.y, -c.z); } // 20 cm wide, so the pair fits between the door frame and the umbrella stand
        PROPS.shoes.position.set(W / 2 - .03 - .1235, 0, 1.883); PROPS.shoes.rotation.y = Math.PI / 2 - .03; PROPS.shoes.add(clogs); PROPS.shoes.updateMatrixWorld(true);
        PROPS.shoesInfo = { ready: true, placed: true, size: new THREE.Box3().setFromObject(clogs).getSize(new THREE.Vector3()).toArray() };
      }).catch(() => { PROPS.shoesInfo = { ready: true, placed: false }; });
      // The key hooks (Paul's photo): a brushed-aluminium flat bar with four round-capped pegs, hung at coat-hook height on the wall over the thermostat and the light switch, clear of the couplet. One peg holds a ring
      // with two keys (profile-cut bows with holes, toothed blades, tinted caps) and a leather tag, flat against the wall.
      const RAIL = { z: 1.99, y: 1.62, len: .34 }, wallX = W / 2, PEG_Z = [-.12, -.04, .04, .12];
      const metal = new THREE.MeshStandardMaterial({ color: 0xd6d9dd, roughness: .38, metalness: .12 }); // no reflections to catch in this room, so a light, nearly matt aluminium reads better than a dark metal
      const railGeo = [new THREE.BoxGeometry(.008, .024, RAIL.len).translate(wallX - .004, RAIL.y, RAIL.z)];
      for (const dz of PEG_Z) railGeo.push(new THREE.CylinderGeometry(.0085, .0085, .03, 24).rotateZ(Math.PI / 2).translate(wallX - .008 - .015, RAIL.y, RAIL.z + dz));
      const railMesh = new THREE.Mesh(mergeGeometries(railGeo, false), metal); railMesh.name = "entry-hook-rail"; railMesh.castShadow = true; railMesh.receiveShadow = true; scene.add(railMesh);
      // The key card (Paul's photo: the pouch he carries for the door's magnetic card): a pale-sage leather card holder with a stitched edge, a snap strap with a rivet, a thin black cord and a small steel clasp hooked over a
      // peg; our own small mark is printed on it (no characters, no brands). It hangs flat against the wall and can be tapped: it beeps on the lock and the door opens.
      const hookX = wallX - .008 - .015, hookY = RAIL.y, hookZ = RAIL.z + PEG_Z[3];
      const roundRect = (w, h, r, topR = r) => { const s = new THREE.Shape(); s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); s.lineTo(w / 2, h / 2 - topR); s.quadraticCurveTo(w / 2, h / 2, w / 2 - topR, h / 2); s.lineTo(-w / 2 + topR, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - topR); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2); return s; };
      const ex = (shape, depth, bevel = .0005) => new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, curveSegments: 18 });
      const CARD = { w: .056, h: .088, y0: -.062 }; // the pouch hangs below the strap; y relative to the peg
      const LEATHER = 0xbfd5c9, LEATHER_DARK = 0x9db8aa, STEEL = 0xcfd2d6, CORD = 0x15161a;
      const cardParts = [];
      cardParts.push([ex(roundRect(CARD.w, CARD.h, .014, .004), .0034).translate(0, CARD.y0 - CARD.h / 2, 0), LEATHER]);
      // stitching: a dashed line round the inside of the edge, small dark-sage dashes laid along the spaced points of an inset outline
      { const outline = roundRect(CARD.w - .01, CARD.h - .01, .011, .002).getSpacedPoints(70); for (let i = 0; i < outline.length - 1; i += 2) { const a = outline[i], b = outline[i + 1], len = Math.hypot(b.x - a.x, b.y - a.y); if (len < .0005) continue; const d = new THREE.BoxGeometry(len * .9, .0009, .0007).rotateZ(Math.atan2(b.y - a.y, b.x - a.x)).translate((a.x + b.x) / 2, CARD.y0 - CARD.h / 2 + (a.y + b.y) / 2, .0037); cardParts.push([d, LEATHER_DARK]); } }
      // the strap: a short leather tab folded over the top of the pouch, a snap on it and a rivet near the clasp
      cardParts.push([ex(roundRect(.022, .046, .009, .009), .0028).translate(0, CARD.y0 - .006 + .0, .0036), LEATHER]);
      cardParts.push([new THREE.CylinderGeometry(.0072, .0072, .0016, 24).rotateX(Math.PI / 2).translate(0, CARD.y0 - .018, .0074), STEEL]);
      cardParts.push([new THREE.CylinderGeometry(.0045, .0045, .0018, 24).rotateX(Math.PI / 2).translate(0, CARD.y0 - .018, .0086), 0xe9ebee]);
      cardParts.push([new THREE.CylinderGeometry(.0036, .0036, .0014, 20).rotateX(Math.PI / 2).translate(0, CARD.y0 + .002, .0070), STEEL]);
      // our mark, small and plain: a ring with a dot
      cardParts.push([new THREE.TorusGeometry(.0105, .0011, 8, 36).translate(0, CARD.y0 - .063, .0036), 0xc4622d], [new THREE.CircleGeometry(.0042, 20).translate(0, CARD.y0 - .063, .0036), 0xc4622d]);
      // the cord loop and the clasp that hooks over the peg
      cardParts.push([new THREE.TorusGeometry(.0105, .0009, 8, 28).translate(0, CARD.y0 + .012, .0034), CORD], [new THREE.TorusGeometry(.0115, .0012, 8, 28).rotateY(Math.PI / 2).translate(0, -.003, 0), STEEL], [new THREE.CapsuleGeometry(.0035, .016, 4, 10).translate(0, CARD.y0 + .02, .0032), STEEL]);
      const cardGeos = cardParts.map(([g, hex]) => [g.rotateY(-Math.PI / 2).translate(hookX - .001, hookY, hookZ), hex]);
      PROPS.keyRail = PROPS.keycard = solid(cardGeos, "entry-keycard");
    }

    // ---- 3. series night: the coffee table, the remote on the sofa ----
    const nightParts = [];
    // popcorn bowl on the coffee table's free left strip
    const PB = { x: -.065, z: -.62 }; // the popcorn bowl (Codex's model, loaded below) stands on the coffee table's free left strip
    // the closed laptop where the open one was (brushed aluminium, a small dark mark on the lid)
    const LP = { x: .47, z: -.45, yaw: -.55 };
    nightParts.push([at(new THREE.BoxGeometry(.298, .0145, .205), LP.x, coffeeTop + .00725, LP.z, LP.yaw), 0xb7bbbf]);
    nightParts.push([at(new THREE.BoxGeometry(.286, .0018, .193), LP.x, coffeeTop + .0154, LP.z, LP.yaw), 0xc6cacd]);
    nightParts.push([at(new THREE.CylinderGeometry(.016, .016, .0012, 28), LP.x, coffeeTop + .0168, LP.z, LP.yaw), 0x7a7e82]);
    // the remote, tossed on the sofa seat (seated by a ray, slightly turned)
    const rayDown = new THREE.Vector3(0, -1, 0), rayAt = (x, z) => { const t = fitDistance(new THREE.Vector3(x, 1.2, z), rayDown, 1.2); return t === null ? null : 1.2 - t; };
    const RM = { x: .98, z: -1.36 }, seatY = rayAt(RM.x, RM.z) ?? .46;
    const remoteGeo = [[new THREE.BoxGeometry(.046, .015, .158), 0x1d1f22], [new THREE.BoxGeometry(.034, .0016, .052).translate(0, .0083, -.042), 0x34373b], [new THREE.CylinderGeometry(.0065, .0065, .0016, 14).translate(0, .0083, .003), 0xa5633a]];
    for (const [geo, hex] of remoteGeo) nightParts.push([geo.rotateY(.7).translate(RM.x, seatY + .0035, RM.z), hex]);
    // ---- 4a. a phone (Paul 2026-11-21: take Room 03's phone, no glow or message animation, just the phone): the same 72 x 150 x 8.5 mm body and dark glass, lying on the side table, face up,
    // in the first free spot found by scanning the top (clear of the lamp, mug, coaster and notebook by 12 mm, wholly inside the edge). A dim lock-screen banner is painted on the glass; nothing animates.
    {
      const bx3 = (o) => new THREE.Box3().setFromObject(o).expandByScalar(.012), blockers = [tableLampObj, PROPS.mug, PROPS.notebook, PROPS.sideTable.coaster].map(bx3), PW = .072, PL = .150, PH = .0085;
      const shape = new THREE.Shape(), r = .011, x0 = -PW / 2, y0 = -PL / 2;
      shape.moveTo(x0 + r, y0); shape.lineTo(-x0 - r, y0); shape.quadraticCurveTo(-x0, y0, -x0, y0 + r); shape.lineTo(-x0, -y0 - r); shape.quadraticCurveTo(-x0, -y0, -x0 - r, -y0); shape.lineTo(x0 + r, -y0); shape.quadraticCurveTo(x0, -y0, x0, -y0 - r); shape.lineTo(x0, y0 + r); shape.quadraticCurveTo(x0, y0, x0 + r, y0);
      const bodyGeo = new THREE.ExtrudeGeometry(shape, { depth: PH - .0016, bevelEnabled: true, bevelThickness: .0008, bevelSize: .0008, bevelSegments: 2, curveSegments: 6 }); bodyGeo.rotateX(-Math.PI / 2); bodyGeo.translate(0, .0008, 0);
      const group = new THREE.Group(); group.name = "side-table-phone";
      const body = new THREE.Mesh(bodyGeo, new THREE.MeshStandardMaterial({ color: "#1b1c1f", roughness: .35, metalness: .2 })); body.name = "side-table-phone-body"; body.castShadow = true; body.receiveShadow = true; group.add(body);
      const cv = document.createElement("canvas"); cv.width = 128; cv.height = 272; const c2 = cv.getContext("2d");
      c2.fillStyle = "#020306"; c2.fillRect(0, 0, 128, 272); c2.fillStyle = "#e4dcc8"; c2.beginPath(); c2.roundRect(10, 34, 108, 50, 11); c2.fill(); c2.fillStyle = "#c58a3a"; c2.beginPath(); c2.arc(30, 59, 9, 0, Math.PI * 2); c2.fill(); c2.fillStyle = "#5a5246"; c2.fillRect(48, 50, 56, 6); c2.fillRect(48, 63, 38, 5); c2.fillStyle = "#7a7366"; c2.fillRect(34, 128, 60, 14);
      const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(.066, .143), new THREE.MeshStandardMaterial({ color: "#05070a", roughness: .2, metalness: .15, emissive: "#ffffff", emissiveMap: tex, emissiveIntensity: .1 })); screen.name = "side-table-phone-screen"; screen.rotation.x = -Math.PI / 2; screen.position.y = PH + .0006; group.add(screen);
      let spot = null;
      for (let rr = .11; rr <= .225 && !spot; rr += .02) for (let k = 0; k < 24 && !spot; k++) {
        const ang = Math.PI / 2 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * Math.PI / 12, x = TX + Math.cos(ang) * rr, z = TZ + Math.sin(ang) * rr, yaw = -ang + Math.PI / 2 + .3; /* starts on the side that faces the room (+z) and works round */
        const hx = (PW * Math.abs(Math.cos(yaw)) + PL * Math.abs(Math.sin(yaw))) / 2, hz = (PW * Math.abs(Math.sin(yaw)) + PL * Math.abs(Math.cos(yaw))) / 2, probe = new THREE.Box3(new THREE.Vector3(x - hx, sideTop - .05, z - hz), new THREE.Vector3(x + hx, sideTop + .2, z + hz));
        if (!blockers.some((b) => b.intersectsBox(probe))) spot = { x, z, yaw };
      }
      spot ||= { x: TX + .2, z: TZ - .05, yaw: .3 };
      group.position.set(spot.x, sideTop, spot.z); group.rotation.y = spot.yaw; scene.add(group); PROPS.phone = group;
    }
    // ---- 4b. a coffee stool (Paul 2026-11-21): Room 04's Lounge pouf, a padded cylinder with eighteen soft pleats, in a dusty blush pink (a Taiwan-favoured Morandi tone), stands against the left wall between the sideboard and the yellow bag; a small
    // oak tray on it holds Room 02's graphite coffee canister (with its scoop) and a take-away cup. It is there in every mood. The pouf is the Lounge profile slimmed to a 17 cm radius and stretched to 42 cm.
    {
      const CS = { x: -W / 2 + .2, z: .2 }, SR = .17 / .225, SY = .42 / .315, parts = [], fabric = new THREE.Color(0xd9b5ae), PLY = 72; // dusty blush, a Morandi 'mist pink' of the kind Taiwan's homes favour now
      const profile = [[0, .045, 0, .83], [.177, .045, 0, .82], [.210, .071, .001, .90], [.225, .123, .004, .95], [.224, .274, .004, 1], [.217, .303, .0015, .95], [.212, .309, 0, .68], [.218, .316, 0, .96], [.213, .336, 0, 1.03], [.187, .351, 0, 1.06], [.126, .357, 0, 1.04], [0, .360, 0, 1.02]];
      const lathe = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r * SR, (y - .045) * SY + .006)), PLY), lp = lathe.attributes.position, lc = new Float32Array(lp.count * 3);
      for (let slice = 0; slice <= PLY; slice++) { const angle = (slice % PLY) * Math.PI * 2 / PLY, fold = (1 - Math.cos(18 * angle)) * .5; for (const [row, [radius, , depth, shade]] of profile.entries()) { const i = slice * profile.length + row, r = (radius - depth * fold) * SR; lp.setX(i, r * Math.sin(angle)); lp.setZ(i, r * Math.cos(angle)); const tone = shade * (1 - depth * 18 * fold + Math.min(1, radius * 8) * .022 * Math.sin(angle * 7 + row * .5)); lc.set([fabric.r * tone, fabric.g * tone, fabric.b * tone], i * 3); } }
      lathe.computeVertexNormals(); { const nrm = lathe.attributes.normal, w = new THREE.Vector3(), o = new THREE.Vector3(); for (let row = 0; row < profile.length; row++) { const last = PLY * profile.length + row; w.fromBufferAttribute(nrm, row).add(o.fromBufferAttribute(nrm, last)).normalize(); nrm.setXYZ(row, w.x, w.y, w.z); nrm.setXYZ(last, w.x, w.y, w.z); } }
      lathe.setAttribute("color", new THREE.BufferAttribute(lc, 3)); lathe.deleteAttribute("uv");
      const topY = .006 + (.360 - .045) * SY; // the pouf's top face, 42 cm
      { const pouf = new THREE.Mesh(lathe.translate(CS.x, 0, CS.z), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .95 })); pouf.name = "coffee-stool-pouf"; pouf.castShadow = true; pouf.receiveShadow = true; scene.add(pouf); PROPS.coffeeStoolPouf = pouf; } // its own mesh: the pleat shading lives in its vertex colours
      parts.push([new THREE.CylinderGeometry(.15, .15, .012, 48).translate(CS.x, 0, CS.z).translate(0, .006, 0), 0x5b4a3a]); // a dark oak base ring, 12 mm, hidden under the pleats' hem
      const trayY = topY - .004; // the tray sinks 4 mm into the soft top
      parts.push([new THREE.CylinderGeometry(.135, .13, .014, 48).translate(CS.x, trayY + .007, CS.z), 0xb88f5e], [new THREE.TorusGeometry(.1335, .0055, 8, 48).rotateX(Math.PI / 2).translate(CS.x, trayY + .0145, CS.z), 0xa27a4c]);
      const ty = trayY + .014;
      // Paul 2026-11-22 ("beautify the two cups or jars"): a speckled sage stoneware canister with a cream glaze band, an oak lid and a brass knob (left on the tray), and a terracotta-glazed
      // mug with a thin gold rim, a looped handle and black coffee (right). Same footprint and height as the graphite canister and paper cup they replace.
      const cx = CS.x - .045, cz = CS.z + .03, lathe2 = (pts, seg = 28) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
      parts.push([lathe2([[0, 0], [.038, 0], [.043, .008], [.043, .13], [.04, .142], [0, .142]]).translate(cx, ty, cz), 0x9fb79d]);
      parts.push([new THREE.CylinderGeometry(.0436, .0436, .022, 28, 1, true).translate(cx, ty + .07, cz), 0xf0e6d2], [new THREE.CylinderGeometry(.0436, .0436, .004, 28, 1, true).translate(cx, ty + .084, cz), 0xc9a45a]);
      parts.push([lathe2([[0, .14], [.044, .14], [.044, .148], [.036, .156], [0, .158]]).translate(cx, ty, cz), 0xb98a52], [new THREE.SphereGeometry(.0095, 10, 8).translate(cx, ty + .166, cz), 0xc9a45a]);
      for (let i = 0; i < 18; i++) { const a = i * 2.4, yy = .02 + (i * 0.0063) % .11; parts.push([new THREE.SphereGeometry(.0017, 5, 4).translate(cx + Math.cos(a) * .0435, ty + yy, cz + Math.sin(a) * .0435), 0x6f8a70]); } // the speckle
      const ux = CS.x + .05, uz = CS.z - .035;
      parts.push([lathe2([[0, 0], [.03, 0], [.038, .01], [.04, .085], [.0385, .09], [.034, .088], [.034, .014], [0, .012]], 28).translate(ux, ty, uz), 0xd98a62]);
      parts.push([new THREE.CylinderGeometry(.0335, .0335, .002, 28).translate(ux, ty + .079, uz), 0x2a1b12], [new THREE.TorusGeometry(.0392, .0013, 5, 28).rotateX(Math.PI / 2).translate(ux, ty + .0895, uz), 0xd7b15a]);
      parts.push([new THREE.TorusGeometry(.021, .0052, 6, 16, Math.PI).rotateZ(-Math.PI / 2).translate(ux + .04, ty + .05, uz), 0xd98a62]);
      PROPS.coffeeStool = solid(parts, "coffee-stool"); PROPS.coffeeStoolInfo = { topY, trayTop: ty, x: CS.x, z: CS.z };
    }
    PROPS.night = solid(nightParts, "series-night-props"); PROPS.night.visible = false;
    // steam off the mug (series night): a soft rising wisp, a Points object
    const steamTex = canvasTex(64, 64, (ctx, w, h) => { const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, "rgba(255,255,255,.55)"); g.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); });
    const MUGC = { x: .10, z: -.40, rim: .497 };
    const steamPts = []; for (let i = 0; i < 16; i++) { const t = i / 15; steamPts.push(MUGC.x + Math.sin(t * 5.2) * .014 * t + (rand() - .5) * .006, MUGC.rim + .012 + t * .12, MUGC.z + Math.cos(t * 4.1) * .012 * t + (rand() - .5) * .006); }
    const steam = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(steamPts, 3)), new THREE.PointsMaterial({ map: steamTex, size: .06, sizeAttenuation: true, transparent: true, opacity: .5, depthWrite: false, color: 0xffffff }));
    steam.name = "series-night-mug-steam"; steam.visible = false; steam.frustumCulled = false; steam.raycast = () => {}; scene.add(steam); PROPS.steam = steam;
    PROPS.popcorn = new THREE.Group(); PROPS.popcorn.name = "series-night-popcorn"; PROPS.popcorn.visible = false; PROPS.popcorn.position.set(PB.x, coffeeTop, PB.z); scene.add(PROPS.popcorn);
    loader.loadAsync(new URL("./models/room01-popcorn-bowl-v2.glb", import.meta.url).href).then((asset) => { // Paul 2026-11-21: the procedural popcorn looked like a heap of balls; this is Codex's bowl with real popcorn (recoloured by material name in sRGB)
      const colours = { bowl: "#efe6d2", rim: "#a5633a", popcorn: "#f3e7c6", butter: "#efd9a0", husk: "#6b4a2b" };
      asset.scene.traverse((o) => { if (!o.isMesh) return; o.castShadow = true; o.receiveShadow = true; const c = colours[o.material.name]; if (c) { o.material = o.material.clone(); o.material.color.set(c); o.material.vertexColors = false; } });
      PROPS.popcorn.add(asset.scene); PROPS.popcorn.userData.ready = true;
    }).catch(() => {});
    PROPS.apply = (mood) => { const night = mood === "tv"; PROPS.night.visible = night; PROPS.popcorn.visible = night || mood === "slow"; /* Paul 2026-11-21: the bowl also sits on the table on a slow Sunday afternoon, without the rest of the night set */ steam.visible = night; laptopObj.visible = !night; };
    PROPS.fit = () => {
      scene.updateMatrixWorld(true); const bx = (o) => new THREE.Box3().setFromObject(o, true), mm = (v) => Math.round(v * 10000) / 10;
      const radii = (o) => { let lo = 1e9, hi = 0; const v = new THREE.Vector3(); o.traverse((m) => { if (!m.isMesh) return; const pos = m.geometry.attributes.position; for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld); const r = Math.hypot(v.x - TX, v.z - TZ); lo = Math.min(lo, r); hi = Math.max(hi, r); } }); return { lo, hi }; };
      const radial = (o) => mm(radii(o).hi);
      const side = { coaster: bx(coaster), mug: bx(PROPS.mug) }, glassBox = bx(glass), booksObj = consoleDecor.children.find((c) => c.name === "console-decor-books"), books = booksObj ? bx(booksObj) : null, RIGHT_SPEAKER_X = .738;
      const gap = (a, b) => Math.round(Math.hypot(Math.max(b.min.x - a.max.x, a.min.x - b.max.x, 0), Math.max(b.min.z - a.max.z, a.min.z - b.max.z, 0)) * 1000);
      const lampFootR = .111, nb = bx(PROPS.night), sl = bx(PROPS.slippers);
      return {
        sideTable: { coasterSeatMm: mm(side.coaster.min.y - sideTop), mugSeatMm: mm(side.mug.min.y - (sideTop + .005)), outerRadiusMm: { coaster: radial(coaster), mug: radial(PROPS.mug), notebook: radial(PROPS.notebook) }, innerClearMm: { coasterToLamp: Math.round((radii(coaster).lo - lampFootR) * 1000), mugToLamp: Math.round((radii(PROPS.mug).lo - lampFootR) * 1000), notebookToLamp: Math.round((radii(PROPS.notebook).lo - lampFootR) * 1000) }, notebookSeatMm: mm(bx(PROPS.notebook).min.y - sideTop), notebookToMugMm: gap(bx(PROPS.notebook), side.mug), tableRadiusMm: mm(((bx(tableObj).max.x - bx(tableObj).min.x) + (bx(tableObj).max.z - bx(tableObj).min.z)) / 4), steamLive: PROPS.mugSteam.points.visible },
        consoleGlass: { seatMm: mm(glassBox.min.y - .59), toBooksMm: books ? gap(glassBox, books) : null, toSpeakerMm: Math.round((RIGHT_SPEAKER_X - glassBox.max.x) * 1000), insideConsole: glassBox.min.z > 1.88 && glassBox.max.z < 2.28 },
        slippers: { bounds: { min: sl.min.toArray(), max: sl.max.toArray() }, seatMm: mm(sl.min.y - .012), onRug: sl.min.x > -1.017 && sl.max.x < 1.717 && sl.min.z > -1.715 && sl.max.z < .155 },
        flips: (() => { const f = bx(PROPS.flips); return { bounds: { min: f.min.toArray(), max: f.max.toArray() }, seatMm: mm(f.min.y - .012), onRug: f.min.x > -1.017 && f.max.x < 1.717 && f.min.z > -1.715 && f.max.z < .155, clearOfTableMm: gap(f, bx(coffeeObj)) }; })(),
        night: { visible: PROPS.night.visible, laptopOpenVisible: laptopObj.visible, steamVisible: PROPS.steam.visible, bounds: { min: nb.min.toArray(), max: nb.max.toArray() }, popcornBowlInsideTable: PB.x - .1 > -.18 && PB.x + .1 < .88 && PB.z - .1 > -.911 && PB.z + .1 < -.289, laptopStandsOnTable: mm(nb.min.y - coffeeTop), remoteSeat: { seatY: +seatY.toFixed(3) } },
      };
    };
  }
  const plantObj = place(plant, { height: 1.35, x: PX, z: PZ });
  // Note 1/3 of the three-room note set (Paul 2026-11-11, set A): a yellow sticky note wrapped to the front curve of the plant's pot.
  const deskNoteLines = { zh: "便條 1/3：「出門前，記得澆花。」", en: "Note 1/3: “Water the plants before you head out.”" };
  const plantNote = (() => {
    const c = document.createElement("canvas"); c.width = 384; c.height = 320;
    const x = c.getContext("2d");
    x.fillStyle = "#f6e58d"; x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = "#ecd878"; x.fillRect(0, 0, c.width, 24);
    // Clear, high-contrast handwriting makes the note legible in the room overview.
    x.fillStyle = "#354638"; x.textAlign = "center"; x.textBaseline = "middle";
    x.font = "700 60px system-ui, sans-serif"; x.fillText("記得澆花", 192, 183);
    x.fillStyle = "#4a91bb"; x.beginPath(); x.moveTo(192, 65); x.bezierCurveTo(169, 91, 166, 105, 192, 116); x.bezierCurveTo(218, 105, 215, 91, 192, 65); x.fill();
    x.fillStyle = "#d8f1fa"; x.beginPath(); x.ellipse(184, 98, 5, 9, .4, 0, Math.PI * 2); x.fill();
    x.strokeStyle = "#83784e"; x.lineWidth = 2; x.beginPath(); x.moveTo(24, 282); x.lineTo(360, 282); x.stroke();
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const width = .16, height = .13, potRadius = .205;
    const geometry = new THREE.PlaneGeometry(width, height, 10, 4);
    const positions = geometry.attributes.position;
    // The note follows the planter's measured front radius instead of sitting out at the leaves' depth.
    for (let i = 0; i < positions.count; i++) {
      const px = positions.getX(i);
      positions.setZ(i, -(potRadius - Math.sqrt(potRadius * potRadius - px * px)));
    }
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ map: tex, roughness: .92, side: THREE.DoubleSide }));
    mesh.name = "plant-note";
    mesh.position.set(-2.336, .22, -1.725 + potRadius + .003);
    scene.add(mesh);
    return mesh;
  })();
  prepare(plantObj, vcol({ roughness: .75 }));
  // a small home robot (Codex's drawing, same pipeline) keeps the plant company by the rug; no caption, just there
  const robotObj = place(robot, { height: .46, x: -1.45, z: SZ + 1.05 });
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
  // Near the TV side, clear of the door swing; it still offers the Room 02 hint and travel action.
  const guidePivot = robotPivot.clone(true); guidePivot.name = "door-robot";
  const terracotta = new THREE.Color("#c4704c");
  guidePivot.traverse((m) => {
    if (!m.isMesh || !m.geometry.attributes.color) return;
    m.geometry = m.geometry.clone(); const gc = m.geometry.attributes.color;
    for (let i = 0; i < gc.count; i++) if (Math.hypot(gc.getX(i) - sage.r, gc.getY(i) - sage.g, gc.getZ(i) - sage.b) < .02) gc.setXYZ(i, terracotta.r, terracotta.g, terracotta.b); // the belt is the only sage on the model
    gc.needsUpdate = true;
  });
  guidePivot.position.set(1.40, 0, 1.43); guidePivot.rotation.y = -2.0; scene.add(guidePivot);
  const guideHome = { y: guidePivot.position.y, r: guidePivot.rotation.y };
  // the floor lamp gets its own light just under the shade (no shadow: a light inside the closed shade mesh would be blocked)
  const shadeY = lb.min.y + (lb.max.y - lb.min.y) * .8, lampX = (lb.min.x + lb.max.x) / 2, lampZ = (lb.min.z + lb.max.z) / 2;
  const floorLight = new THREE.PointLight("#ffc98a", 0, 5, 1.6); floorLight.position.set(lampX, shadeY - .12, lampZ + .05); scene.add(floorLight);
  const floorHalo = halo(lampX, shadeY, lampZ + .3, 1.1); // a little in front of the shade so the shade does not hide it
  const floorPool = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.0).rotateX(-Math.PI / 2).translate(lampX, .008, lampZ), new THREE.MeshBasicMaterial({ map: haloTex, color: new THREE.Color(1.5, 1.5, 1.5), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  floorPool.visible = false; floorPool.renderOrder = 2; floorPool.raycast = () => {}; scene.add(floorPool); // a pool of the lamp's warm light on the floor round its foot
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

  // A second, matching spring-couplet sheet above the entry suitcase. Keep it narrow so it
  // reads as a personal blessing beside the large harbour painting, not a competing poster.
  function buildRenewalCouplet() {
    const width = .229, height = .70;
    const suitcaseZ = soft.suitcaseInfo?.centre?.[1] ?? .36;
    const group = new THREE.Group();
    group.name = "renewal-couplet";
    group.position.set(W / 2, 1.61, suitcaseZ);
    group.rotation.y = -Math.PI / 2;
    scene.add(group);

    const texture = new THREE.TextureLoader().load(new URL("./art/renewal-couplet-v1.webp", import.meta.url).href, () => render());
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    const material = new THREE.MeshStandardMaterial({ map: texture, color: "#ffffff", roughness: .9, metalness: 0, alphaTest: .5 });
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
    paper.name = "renewal-couplet-paper";
    paper.position.z = .005;
    paper.castShadow = false;
    paper.receiveShadow = false;
    group.add(paper);

    const shadowTexture = canvasTex(128, 384, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(36,18,14,.42)";
      ctx.filter = "blur(14px)";
      ctx.fillRect(20, 18, w - 40, h - 32);
      ctx.filter = "none";
    });
    shadowTexture.wrapS = shadowTexture.wrapT = THREE.ClampToEdgeWrapping;
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(width + .06, height + .08), new THREE.MeshBasicMaterial({
      map: shadowTexture, transparent: true, depthWrite: false,
    }));
    shadow.name = "renewal-couplet-shadow";
    shadow.position.set(-.012, -.016, .0012);
    shadow.castShadow = false;
    shadow.receiveShadow = false;
    group.add(shadow);
    return { group, paper, shadow, width, height, texture };
  }

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
    // Paul 2026-11-18: the green lining ran up over the lip and faded down the outside (one shared ring of vertices at the rim blended the two colours), so the mug looked badly moulded.
    // The profile now ends the lining at the rim top and starts the outer shell on a duplicate ring at the same point, so the colours meet in a clean line: green inside, light blue outside. The profile also runs bottom-up on the outside (it ran
    // from the inside floor before, which turned every face inside out: the near wall was culled and the far wall's lining showed through it, the ghost Paul saw).
    const MUG = { radius: .040, profile: [[0, 0], [.037, 0], [.0395, .004], [.040, .010], [.0399, .0935], [.0388, .0952], [.0388, .0952], [.0372, .0948], [.0365, .093], [.0365, .007], [0, .006]], innerCount: 5 };
    const mugAt = { x: -2.39, z: .80 };
    const mugY = topAt(mugAt.x, mugAt.z);
    {
      const body = new THREE.LatheGeometry(MUG.profile.map(([r, y]) => new THREE.Vector2(r, y)), 32);
      const pos = body.attributes.position, col = new Float32Array(pos.count * 3), c = new THREE.Color();
      const ring = MUG.profile.length; // LatheGeometry lays its vertices out segment by segment, one profile point after another
      for (let k = 0; k < pos.count; k++) { const point = k % ring, y = pos.getY(k); c.set(point >= ring - MUG.innerCount ? 0xd9c6a0 : y < .005 ? 0xd9cdb4 : 0xf1e8d6); col.set([c.r, c.g, c.b], k * 3); }
      body.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
      body.translate(mugAt.x, mugY, mugAt.z); propParts.push(body);
      // Half-ring handle on the side away from the pack, toward the room; both ends sink 2 mm into the wall of the mug.
      const handle = tint(new THREE.TorusGeometry(.026, .0055, 8, 20, Math.PI), 0xf1e8d6);
      const handleYaw = -.7; // direction (cos, 0, -sin): +x is into the room, -z toward the near end
      handle.rotateZ(-Math.PI / 2); handle.rotateY(handleYaw);
      handle.translate(mugAt.x + Math.cos(handleYaw) * (MUG.radius - .002), mugY + .052, mugAt.z - Math.sin(handleYaw) * (MUG.radius - .002));
      propParts.push(handle);
    }
    // Paper-napkin pack: a cream wrapper over a 190 x 105 mm stack, a muted clay band and a folded sheet.
    // Paul 2026-11-18: the record player takes this end of the sideboard, so the pack moves to the coffee table: the first free spot (clear of the laptop, mug,
    // book and the book stack by 15 mm, inside the top by 4 cm) where five rays down find the table top level within 1 mm. It is its own small mesh there.
    const coffeeHits = [laptopObj, mugObj, coffeeBook].map((obj) => new THREE.Box3().setFromObject(obj)).concat(soft.propBounds);
    const coffeeBox = new THREE.Box3().setFromObject(coffeeObj), coffeeRay = new THREE.Raycaster();
    const coffeeTopAt = (x, z) => { coffeeRay.set(new THREE.Vector3(x, 2, z), new THREE.Vector3(0, -1, 0)); return coffeeRay.intersectObject(coffeeObj, true)[0]?.point.y ?? null; };
    const packSpot = (() => {
      const yaw = .38, hx = (.19 * Math.abs(Math.cos(yaw)) + .105 * Math.abs(Math.sin(yaw))) / 2, hz = (.19 * Math.abs(Math.sin(yaw)) + .105 * Math.abs(Math.cos(yaw))) / 2;
      for (let fz = .2; fz <= .8; fz += .05) for (let fx = .15; fx <= .85; fx += .05) {
        const x = coffeeBox.min.x + (coffeeBox.max.x - coffeeBox.min.x) * fx, z = coffeeBox.min.z + (coffeeBox.max.z - coffeeBox.min.z) * fz;
        if (x - hx < coffeeBox.min.x + .04 || x + hx > coffeeBox.max.x - .04 || z - hz < coffeeBox.min.z + .04 || z + hz > coffeeBox.max.z - .04) continue;
        const probe = new THREE.Box3(new THREE.Vector3(x - hx - .015, coffeeBox.max.y - .05, z - hz - .015), new THREE.Vector3(x + hx + .015, coffeeBox.max.y + .2, z + hz + .015));
        if (coffeeHits.some((b) => b.intersectsBox(probe))) continue;
        const ys = [[0, 0], [-hx, -hz], [hx, -hz], [-hx, hz], [hx, hz]].map(([dx, dz]) => coffeeTopAt(x + dx * .9, z + dz * .9));
        if (ys.some((y) => y === null) || Math.max(...ys) - Math.min(...ys) > .001) continue;
        return { x, z, yaw, y: Math.max(...ys) };
      }
      return null;
    })();
    const packAt = packSpot ? { x: packSpot.x, z: packSpot.z, yaw: packSpot.yaw } : { x: -2.45, z: 1.15, yaw: .38 };
    const packY = packSpot ? packSpot.y : topAt(packAt.x, packAt.z);
    const packGeometry = (() => {
      const height = .058;
      const pack = new THREE.BoxGeometry(.19, height, .105, 16, 6, 10);
      const position = pack.attributes.position, colors = new Float32Array(position.count * 3);
      const paper = new THREE.Color(0xeae0ca), band = new THREE.Color(0xa65e48), tint = new THREE.Color();
      for (let i = 0; i < position.count; i++) {
        const x = position.getX(i), y = position.getY(i), z = position.getZ(i);
        const u = x / .095, v = (y + height / 2) / height, w = z / .0525;
        const pinch = Math.max(0, Math.abs(u) - .79) / .21;
        const shoulder = Math.sin(Math.PI * v) * (1 - .6 * u * u);
        const top = v * height - (.004 * w ** 4 + .009 * pinch) * v;
        const fold = .0009 * Math.sin(u * 29 + w * 6) * (pinch + Math.abs(w) ** 6) * v;
        position.setXYZ(i, x, top + fold, z * (1 + .045 * shoulder - .1 * pinch));
        const stripe = 1 - THREE.MathUtils.smoothstep(Math.abs(x), .023, .036);
        tint.copy(paper).lerp(band, stripe).multiplyScalar(.94 + .06 * v + .025 * Math.sin(u * 23 - w * 6));
        tint.toArray(colors, i * 3);
      }
      pack.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      pack.computeVertexNormals();

      // A dark opening lies against the top, with the paper folded out from its centre.
      const opening = new THREE.CircleGeometry(1, 24).rotateX(-Math.PI / 2).scale(.038, 1, .010).translate(0, height + .0004, 0);
      const sheetPositions = [], sheetColors = [], sheetUVs = [], sheetIndices = [];
      const sheetTint = new THREE.Color();
      const columns = 9, rows = 6;
      for (let row = 0; row < rows; row++) {
        const rise = row / (rows - 1);
        for (let col = 0; col < columns; col++) {
          const across = 2 * col / (columns - 1) - 1;
          const crease = Math.cos(across * Math.PI * 1.7);
          sheetPositions.push(across * (.030 + .005 * rise), height - .0008 + rise * (.034 - .008 * across * across + .004 * crease),
            rise * rise * (.012 + .004 * crease) + across * rise * .003);
          sheetUVs.push((across + 1) / 2, rise);
          sheetTint.setHex(0xf6efdd).multiplyScalar(.88 + .12 * rise + .055 * crease).toArray(sheetColors, sheetColors.length);
        }
      }
      for (let row = 0; row < rows - 1; row++) for (let col = 0; col < columns - 1; col++) {
        const a = row * columns + col, b = a + columns;
        sheetIndices.push(a, a + 1, b, a + 1, b + 1, b);
      }
      const makeSheet = (back) => {
        const sheet = new THREE.BufferGeometry();
        sheet.setAttribute("position", new THREE.Float32BufferAttribute(sheetPositions, 3));
        sheet.setAttribute("color", new THREE.Float32BufferAttribute(sheetColors, 3));
        sheet.setAttribute("uv", new THREE.Float32BufferAttribute(sheetUVs, 2));
        sheet.setIndex(back ? sheetIndices.slice().reverse() : sheetIndices);
        sheet.computeVertexNormals();
        if (back) sheet.translate(0, 0, -.00025);
        return sheet;
      };
      const openingColors = new Float32Array(opening.attributes.position.count * 3);
      const ink = new THREE.Color(0x51382c);
      for (let i = 0; i < opening.attributes.position.count; i++) ink.toArray(openingColors, i * 3);
      opening.setAttribute("color", new THREE.BufferAttribute(openingColors, 3));

      const result = mergeGeometries([pack, opening, makeSheet(false), makeSheet(true)]);
      result.rotateY(Math.PI / 2 + packAt.yaw);
      result.computeBoundingBox();
      result.translate(packAt.x, packY - result.boundingBox.min.y, packAt.z);
      return result;
    })();
    // Generic vitamin bottle beside the mug (Paul's photo, 2026-10-31): white HDPE, 55 mm across, a ribbed white screw cap 60 x 25 mm, 105 mm
    // overall. Wrap label: white with bold red bands top and bottom and a big red block in the middle. No words, brand or logo.
    // Paul 2026-11-19 (t255u): the three supplement bottles stand in a tidy row against the wall, 10 mm apart edge to edge, and every label front (u = .375 on
    // each lathe, phi .75 pi) is turned to face the record-player view camera, which looks from about x -1.965, z .974. The orange-cap one is 18 % taller.
    const REC_EYE = { x: -1.965, z: .974 }, LABEL_FRONT = .75 * Math.PI, faceView = (x, z) => Math.atan2(REC_EYE.x - x, REC_EYE.z - z) - LABEL_FRONT;
    const bottleAt = { x: -2.34, z: .72 }; // Paul 2026-11-19: the roomverse 3d bottle stands forward beside the ivory mug (10 mm clear of it), off the record camera's line past the mug so its label is not hidden; the green and orange vitamins and the two waters stay in the back row bottleAt.yaw = faceView(bottleAt.x, bottleAt.z);
    const bottleY = topAt(bottleAt.x, bottleAt.z);
    const bottleParts = [];
    // The front label reads "roomverse 3d😋" (our own name, Paul; no brand or logo). If the emoji font draws nothing in colour, a small drawn smiley stands in.
    const labelTex = canvasTex(512, 128, (ctx, w, h) => {
      ctx.fillStyle = "#f7f6f1"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#b5382e"; ctx.fillRect(0, 0, w, 20); ctx.fillRect(0, h - 22, w, 22);
      const cx = w * .375, text = "roomverse 3d";
      ctx.font = "bold 25px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"; ctx.textBaseline = "middle"; ctx.textAlign = "left";
      const tw = Math.min(ctx.measureText(text).width, 132), face = 24, x0 = cx - (tw + 6 + face) / 2, y = h / 2 - 2;
      ctx.fillStyle = "#9a2f28"; ctx.fillText(text, x0, y, 132);
      const fx = x0 + tw + 6 + face / 2;
      const probe = document.createElement("canvas"); probe.width = probe.height = 24; const p2 = probe.getContext("2d");
      p2.font = "20px 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif"; p2.textBaseline = "middle"; p2.fillText("😋", 1, 12);
      const px = p2.getImageData(0, 0, 24, 24).data; let colour = false;
      for (let k = 0; k < px.length; k += 4) if (px[k + 3] > 100 && Math.abs(px[k] - px[k + 2]) > 60) { colour = true; break; }
      if (colour) { ctx.font = `${face}px 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif`; ctx.textAlign = "center"; ctx.fillText("😋", fx, y + 1); }
      else { // a simple yum face: yellow disc, two happy closed eyes, a smile and a little tongue
        ctx.fillStyle = "#f6c430"; ctx.beginPath(); ctx.arc(fx, y, face / 2, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#5a3a12"; ctx.lineWidth = 2; ctx.lineCap = "round";
        for (const ex of [-4.5, 4.5]) { ctx.beginPath(); ctx.arc(fx + ex, y - 2, 2.6, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
        ctx.beginPath(); ctx.arc(fx, y + 2, 6, Math.PI * .15, Math.PI * .85); ctx.stroke();
        ctx.fillStyle = "#e0475a"; ctx.beginPath(); ctx.ellipse(fx + 2.5, y + 8, 2.6, 2.2, 0, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = "rgba(60,40,40,.3)"; ctx.fillRect(cx - 50, h - 36, 100, 3);
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
    const bottle = new THREE.Mesh(bottleGeometry, new THREE.MeshStandardMaterial({ map: labelTex, color: "#ffffff", roughness: .42 }));
    bottle.position.set(bottleAt.x, bottleY, bottleAt.z); bottle.rotation.y = bottleAt.yaw;
    bottle.name = "left-sideboard-supplement"; bottle.castShadow = true; bottle.receiveShadow = true; scene.add(bottle);
    // An orange flip-top vitamin bottle, inspired by Paul's reference photo, without branding.
    const orangeBottleAt = { x: -2.52, z: .60 }; // Paul 2026-11-20: of the two jars behind, only this one stays, and it is fatter (a stout 71 mm round tub, 108 mm with the cap)
    const orangeBottleY = topAt(orangeBottleAt.x, orangeBottleAt.z);
    const orangeLabel = canvasTex(256, 128, (ctx, w, h) => { // plain: cream with an orange band and a thin sage line
      ctx.fillStyle = '#f6f4ed'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#dc8532'; ctx.fillRect(0, h * .34, w, h * .3);
      ctx.fillStyle = '#79976b'; ctx.fillRect(0, h * .7, w, 4);
      // our own name on the stout orange jar (Paul, 2026-11-20): the label's front is at u .375, like the red jar's
      ctx.fillStyle = '#f6f4ed'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = "italic 700 19px Georgia, serif"; ctx.fillText("paul's", w * .375, h * .49);
    });
    const orangeBody = new THREE.Mesh(new THREE.LatheGeometry([[0,0],[.03,0],[.0345,.005],[.0355,.012],[.0355,.075],[.033,.083],[.028,.088],[0,.088]].map(([r,y]) => new THREE.Vector2(r,y)),32), new THREE.MeshStandardMaterial({map:orangeLabel,roughness:.65}));
    orangeBody.position.set(orangeBottleAt.x, orangeBottleY-.001, orangeBottleAt.z); orangeBody.rotation.y = faceView(orangeBottleAt.x, orangeBottleAt.z); orangeBody.castShadow=true; orangeBody.name='orange-cap-vitamin-body'; scene.add(orangeBody);
    const orangeCap = new THREE.Mesh(new THREE.CylinderGeometry(.0305,.0305,.022,32),new THREE.MeshStandardMaterial({color:0xdc8532,roughness:.42}));
    orangeCap.position.set(orangeBottleAt.x, orangeBottleY+.0985, orangeBottleAt.z); orangeCap.castShadow=true; orangeCap.name='orange-cap-vitamin-lid'; scene.add(orangeCap);
    for (const g of propParts) { if (!g.attributes.uv) continue; g.deleteAttribute("uv"); }
    for (const g of propParts) if (g.attributes.normal) g.deleteAttribute("normal");
    const propGeometry = mergeGeometries(propParts.map((g) => g.index ? g.toNonIndexed() : g), false);
    propGeometry.computeVertexNormals();
    const props = new THREE.Mesh(propGeometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .5 }));
    props.name = "left-sideboard-props"; props.castShadow = true; props.receiveShadow = true; scene.add(props);
    const pack = new THREE.Mesh(packGeometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .75 }));
    pack.name = "coffee-table-napkin-pack"; pack.castShadow = true; pack.receiveShadow = true; scene.add(pack);
    // The record player stands on the far end of the top (toward the coat stand), its front and gold pinstripe toward the room, its feet 2.5 mm into the oak.
    const recordAt = { x: -2.405, z: 1.17 }, recordPlayer = buildRoom01RecordPlayer(scene, { ...recordAt, top: topAt(recordAt.x, recordAt.z), yaw: Math.PI });
    { // turn the two label fronts to the record-player view's real eye (the same framing as recordShot), now that the deck exists
      const b = new THREE.Box3().setFromObject(recordPlayer.group), c = b.getCenter(new THREE.Vector3()), d = new THREE.Vector3(.6, .75, -.28).normalize();
      const ex = c.x + .02 + d.x * .7, ez = c.z + d.z * .7;
      for (const m of [bottle, orangeBody]) m.rotation.y = Math.atan2(ex - m.position.x, ez - m.position.z) - LABEL_FRONT + (m === orangeBody ? .62 : 0);
      bottleAt.yaw = bottle.rotation.y; }
    // Paul 2026-11-18: a record player needs power. The sideboard top runs right to the plaster, so the cord cannot drop behind it: a white outlet sits on the wall just
    // above the top behind the player's far corner (centre 165 mm above the top, 0.5 mm into the plaster), and a thin black cord leaves the back of the deck, drops onto the
    // oak, lies along it in a loose curve and climbs the wall into the plug. Two meshes: the cord, and the outlet with its plug.
    const top = topAt(-2.5, 1.3), CORD_R = .0025, wallX = -W / 2;
    const cordCurve = new THREE.CatmullRomCurve3([[-2.556, top + .015, 1.31], [-2.572, top + .011, 1.312], [-2.582, top + CORD_R + .0012, 1.322], [-2.588, top + CORD_R + .0012, 1.348],
      [-2.594, top + CORD_R + .004, 1.372], [wallX + CORD_R + .0015, top + .03, 1.386], [wallX + CORD_R + .0012, top + .085, 1.39], [wallX + .009, top + .105, 1.39], [wallX + .0145, top + .113, 1.39], [wallX + .0145, top + .125, 1.39]].map((q) => new THREE.Vector3(...q)));
    const cord = new THREE.Mesh(new THREE.TubeGeometry(cordCurve, 48, CORD_R, 6, false), new THREE.MeshStandardMaterial({ color: 0x111214, roughness: .55 }));
    cord.name = "record-player-power-cord"; cord.castShadow = true; cord.receiveShadow = true; scene.add(cord);
    const outletParts = [], OUT = { y: top + .165, z: 1.39 };
    const plate = tint(new THREE.BoxGeometry(.008, .114, .07), 0xf4f2ec); plate.translate(wallX + .004 - .0005, OUT.y, OUT.z); outletParts.push(plate);
    // Paul 2026-11-18 (second pass): a Taiwanese outlet, which is the US Type A/B duplex: two receptacles stacked on the white plate, each a slightly raised face with
    // two parallel vertical flat slots (the neutral one a little taller) and a round ground hole below them, and one plate screw between them. The slots and holes
    // are thin dark boxes and discs standing 0.2 mm proud of the receptacle face, so nothing shares a plane (no z-fighting). The cord's small black plug sits in
    // the lower receptacle, 1 mm into its face, and the cord leaves it downwards; the upper receptacle is empty.
    const FACE_X = wallX + .0075, REC_X = FACE_X + .0015, DARK = 0x1b1a19;
    for (const dy of [.026, -.026]) {
      const face = tint(new THREE.BoxGeometry(.0015, .033, .027), 0xf8f6f0); face.translate(FACE_X + .00075, OUT.y + dy, OUT.z); outletParts.push(face);
      for (const [dz, h] of [[-.00635, .0072], [.00635, .0085]]) { const slot = tint(new THREE.BoxGeometry(.0006, h, .0021), DARK); slot.translate(REC_X - .0001, OUT.y + dy + .0045, OUT.z + dz); outletParts.push(slot); }
      const ground = tint(new THREE.CylinderGeometry(.0024, .0024, .0006, 12).rotateZ(Math.PI / 2), DARK); ground.translate(REC_X - .0001, OUT.y + dy - .0085, OUT.z); outletParts.push(ground);
    }
    const screw = tint(new THREE.CylinderGeometry(.0028, .0028, .0008, 12).rotateZ(Math.PI / 2), 0xd8d5cc); screw.translate(FACE_X + .0003, OUT.y, OUT.z); outletParts.push(screw);
    const plug = tint(new THREE.BoxGeometry(.0145, .024, .021), 0x161719); plug.translate(REC_X - .001 + .00725, OUT.y - .026 + .001, OUT.z); outletParts.push(plug); // 1 mm into the lower receptacle face
    const plugNeck = tint(new THREE.CylinderGeometry(CORD_R + .0012, CORD_R + .0006, .016, 8), 0x161719); plugNeck.translate(wallX + .0145, OUT.y - .026 - .013 - .006, OUT.z); outletParts.push(plugNeck);
    for (const g of outletParts) { g.deleteAttribute("uv"); }
    const outlet = new THREE.Mesh(mergeGeometries(outletParts.map((g) => g.index ? g.toNonIndexed() : g), false), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .45 }));
    outlet.geometry.computeVertexNormals(); outlet.name = "record-player-wall-outlet"; outlet.receiveShadow = true; scene.add(outlet);
    // A water-bottle profile with water to the shoulder, label band and fluted cap; keep the original 80% diameter so it fits beside the mug.
    // Between the mug and the player, toward the wall, standing 0.5 mm into the oak. Glass, water and label-with-cap: three meshes.
    // Paul 2026-11-20: keep the bottles' original footprint, lift them slightly, and give each a distinct vivid label.
    // Paul 2026-11-20 (second pass): the two waters were twins. One is clear water with a thin cream label; the other is a cola-style drink: dark brown liquid, a tall cream label with an orange and
    // a brown stripe (no words, no brand) and a dark cap, a little shorter and plumper. The same shell profile, so no new modelling; the palette is cream, deep brown and orange.
    const waterAt = { x: -2.54, z: .83 }, water2At = { x: -2.548, z: .915 }, CREAM = 0xf1e9d6, ORANGE = 0xdc8532, BROWN = 0x4a2c1a;
    const shellProfile = [[0, .001], [.030, .001], [.038, .004], [.0415, .012], [.042, .030], [.0395, .040], [.042, .050], [.042, .150], [.0395, .160], [.042, .170],
      [.042, .196], [.039, .214], [.031, .236], [.022, .256], [.0165, .272], [.0155, .280], [.018, .283], [.018, .286], [.0155, .288], [0, .288]];
    const makeWater = ({ at, sR, sV, fillColor, fillOpacity, label, capColor, tag }) => { // sR scales the radii, sV the heights; label bands are { y, h } in profile units
      const sc = (list) => list.map(([r, y]) => new THREE.Vector2(r * sR, y * sV)), y0 = topAt(at.x, at.z) - .0013;
      const glass = new THREE.Mesh(new THREE.LatheGeometry(sc(shellProfile), 28).translate(at.x, y0, at.z), new THREE.MeshPhysicalMaterial({ color: 0xc6d8d5, roughness: .19, metalness: 0, transparent: true, opacity: .42, side: THREE.DoubleSide, depthWrite: false }));
      glass.name = `left-sideboard-water-bottle${tag}-glass`; glass.renderOrder = 2; scene.add(glass);
      const fillGeometry = mergeGeometries([new THREE.LatheGeometry(sc([[0, .004], [.039, .006], [.039, .194], [.036, .212], [0, .212]]), 24), new THREE.CircleGeometry(.0375 * sR, 24).rotateX(-Math.PI / 2).translate(0, .2125 * sV, 0)].map((g) => { g.deleteAttribute("uv"); return g.index ? g.toNonIndexed() : g; }), false);
      const fill = new THREE.Mesh(fillGeometry.translate(at.x, y0, at.z), new THREE.MeshStandardMaterial({ color: fillColor, roughness: .06, transparent: true, opacity: fillOpacity, depthWrite: false }));
      fill.name = `left-sideboard-water-bottle${tag}-water`; fill.renderOrder = 1; scene.add(fill);
      const capGeometry = new THREE.CylinderGeometry(.0175 * sR, .0175 * sR, .022 * sV, 56, 1), cpos = capGeometry.attributes.position;
      for (let k = 0; k < cpos.count; k++) { const cx = cpos.getX(k), cz = cpos.getZ(k); if (Math.hypot(cx, cz) > .017 * sR) { const f = Math.round(Math.atan2(cz, cx) / (Math.PI / 28)) % 2 ? .93 : 1; cpos.setX(k, cx * f); cpos.setZ(k, cz * f); } }
      const parts = label.filter((l) => !l.map).map(({ y, h, color, grow = 0 }) => tint(new THREE.CylinderGeometry((.0425 + grow) * sR, (.0425 + grow) * sR, h * sV, 28, 1, true).translate(0, y * sV, 0), color));
      parts.push(tint(capGeometry.translate(0, .299 * sV, 0), capColor));
      const labelCap = new THREE.Mesh(mergeGeometries(parts.map((g) => { g.deleteAttribute("uv"); return g.index ? g.toNonIndexed() : g; }), false).translate(at.x, y0, at.z), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .74, side: THREE.DoubleSide }));
      labelCap.geometry.computeVertexNormals(); labelCap.name = `left-sideboard-water-bottle${tag}-label-cap`; labelCap.castShadow = true; scene.add(labelCap);
      const wrap = label.find((l) => l.map); let labelMesh = null; // a label with a printed picture is its own small textured band
      if (wrap) { labelMesh = new THREE.Mesh(new THREE.CylinderGeometry(.0425 * sR, .0425 * sR, wrap.h * sV, 48, 1, true).translate(0, wrap.y * sV, 0).translate(at.x, y0, at.z), new THREE.MeshStandardMaterial({ map: wrap.map, roughness: .7, side: THREE.DoubleSide })); labelMesh.name = `left-sideboard-water-bottle${tag}-label`; scene.add(labelMesh); }
      return { glass, fill, labelCap, labelMesh, at, y: y0, radius: .042 * sR, labelMm: Math.round(label[0].h * sV * 1000) };
    };
    // The cola's wrap: cream, an orange and brown stripe, and our own wordmark (Paul, 2026-11-20: "roomverse 3D" or "paul's" is our brand and can go on things). Front at u .25, which faces +x and so the record view.
    const colaLabel = canvasTex(512, 256, (ctx, w, h) => {
      ctx.fillStyle = "#f1e9d6"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#dc8532"; ctx.fillRect(0, h * .08, w, h * .07); ctx.fillStyle = "#4a2c1a"; ctx.fillRect(0, h * .17, w, h * .02); ctx.fillRect(0, h * .86, w, h * .06);
      ctx.fillStyle = "#4a2c1a"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "italic 700 72px Georgia, 'Times New Roman', serif"; ctx.fillText("paul's", w * .25, h * .5);
      ctx.fillStyle = "#dc8532"; ctx.fillRect(w * .25 - 72, h * .69, 144, 6);
      ctx.fillStyle = "#4a2c1a"; ctx.font = "italic 700 42px Georgia, serif"; ctx.fillText("paul's", w * .75, h * .5);
    });
    const clear = makeWater({ at: waterAt, sR: .8, sV: .88, fillColor: 0x86c3cf, fillOpacity: .62, label: [{ y: .13, h: .034, color: CREAM }], capColor: 0xe1ddd2, tag: "" });
    const cola = makeWater({ at: water2At, sR: .88, sV: .78, fillColor: 0x3a1c10, fillOpacity: .9, label: [{ y: .125, h: .115, map: colaLabel }], capColor: 0x3a2418, tag: "-2" });
    const water = { glass: clear.glass, fill: clear.fill, labelCap: clear.labelCap, at: waterAt, y: clear.y, radius: clear.radius, labelMm: clear.labelMm, second: { glass: cola.glass, water: cola.fill, labelCap: cola.labelCap, label: cola.labelMesh, at: water2At, radius: cola.radius, labelMm: cola.labelMm } };
    return { oak, pulls, props, bottle, bottleAt, mugAt, mugY, pack, packAt, packY, packSpot, coffeeObj, recordPlayer, recordAt, mugRadius: MUG.radius, cord, cordCurve, cordRadius: CORD_R, outlet, water, topY: top };
  })();

  // ---------- state + panel ----------
  const state = { mood: "golden", wall: "original", rug: "stripe", curtain: "linen", print: "ridge", lang }; let musicSync = null; // set once the music is built: it keeps the music in step with the mood
  robotBubble = document.getElementById("robotBubble");
  let robotSleeping = false, robotIdleTimer = 0, robotBubbleTimer = 0, robotTurnTimer = 0, robotTurnFrame = 0, robotCustomLine = null;
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
  // Warm moods used to keep the cool blue sky light and the cool blue side walls, so golden hour read lilac-grey and the side walls clashed with the
  // warm back wall. These moods now carry their own sky tint and side-wall paint; every other mood keeps the original cool values.
  const COOL_ROOM_TINT = { hemiSky: "#dfe8f0", sideWall: "#dce3e8", entryWall: "#d0deea" };
  const MOOD_ROOM_TINT = {
    golden: { hemiSky: "#ffe6c8", sideWall: "#eadfcf", entryWall: "#ddd9d0" },
    slow: { hemiSky: "#f2eee4", sideWall: "#e4ddd0", entryWall: "#d9dcd9" },
    chic: { hemiSky: "#f4e8e4", sideWall: "#e7dedb", entryWall: "#d9dde0" },
  };
  const lightForMood = (mood) => {
    const m = MOODS[mood];
    const tint = { ...COOL_ROOM_TINT, ...MOOD_ROOM_TINT[mood] };
    const screenLevel = ({ rain: .1, family: .08, tech: .15, chic: .08, slow: .07, golden: .07, tv: .46 })[mood];
    return {
      hemi: m.hemi, win: m.win, lamp: m.lamp, fill: m.fill, floor: m.floor, exposure: m.exposure, sunY: m.sunY ?? 2.6, shadowRadius: m.shadowRadius ?? 8, led: m.led ? .5 : 0,
      floorHalo: m.floor ? m.glow : 0, tableHalo: m.glow, lanternHalo: m.glow * .7 + .05, down: DOWNLIGHT_LEVEL[mood] ?? 0,
      shade: m.floor ? .55 : 0, table: m.glow > .3 ? .45 : .18, // the AI shade is a solid shape: a soft glow keeps its form; dimmer in daylight
      winCol: new THREE.Color(m.winCol), out: new THREE.Color(m.out), hemiSky: new THREE.Color(tint.hemiSky), sideWall: new THREE.Color(tint.sideWall), entryWall: new THREE.Color(tint.entryWall), tvWall: TV_STRIP_GLOW[mood], wallWarmth: WALLS_WITHOUT_WARM_WASH.has(state.wall) ? 0 : TV_WALL_WASH[mood], screenReflection: mood === "tv" ? .17 : 0, screenLevel,
    };
  };
  const lights = () => lightForMood(state.mood);
  let standGroup = null, standContact = null, standWall = null, standScarfMat = null, standBrass = null, standBaseMat = null;
  function setLights(v) {
    hemi.intensity = v.hemi; windowLight.intensity = v.win; windowLight.color.copy(v.winCol); windowLight.position.y = v.sunY; windowLight.shadow.radius = v.shadowRadius;
    downSpot.intensity = v.down * DOWNLIGHT_CANDELA; downLensMat.emissiveIntensity = v.down * 1.6; lampLight.intensity = v.lamp; fill.intensity = v.fill; outMat.color.copy(v.out); hemi.color.copy(v.hemiSky); sideMat.color.copy(v.sideWall); entrySideMat.color.copy(v.entryWall);
    floorLight.intensity = v.floor; floorHalo.material.opacity = v.floorHalo; tableHalo.material.opacity = v.tableHalo; lanternHalo.material.opacity = v.lanternHalo; sconceHalo.material.opacity = Math.min(.8, v.lanternHalo * 1.5); sconceHaloLow.material.opacity = Math.min(.8, v.lanternHalo * 1.5); sconceMat.emissiveIntensity = .22 + v.lanternHalo * 1.3; downHalos.visible = v.down > .02; downHaloMat.opacity = v.down * .85; floorPool.visible = v.floorHalo > .02; floorPool.material.opacity = v.floorHalo * .55;
    dustPoints.material.opacity = dustAmount(v.win); dustPoints.visible = dustPoints.material.opacity > .02; sunBeamMaterial.opacity = dustAmount(v.win) * .85; sunBeam.visible = sunBeamMaterial.opacity > .01;
    shadeGlow.value = v.shade; if (lanternMat) lanternMat.emissiveIntensity = Math.min(1.25, .35 + v.fill * .6); /* follows the main light: bright by day, dim at night */ tableGlow.value = v.table; renderer.toneMappingExposure = v.exposure; ledGlow.intensity = v.led;
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
    document.getElementById("stage").dataset.light = state.mood; PROPS.apply(state.mood); // series night changes the coffee table and the sofa // the CSS vignette follows the feeling (dim moods only)
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
  // Soft neutral walls pair with the mist-blue side walls in golden and chic moods.
  const DEFAULT_WALL_BY_MOOD = { rain: "grasscloth", family: "olive", tech: "mist", chic: "blush", slow: "sand", golden: "botanical", tv: "wine" }; // golden hour opens with the soft leaf wallpaper behind the sofa (Paul, 2026-11-17: a plain wall looked pale in long sunlight)
  let sideStripe = null; // the two side walls take the fine vertical-stripe paper when the leaf wallpaper is on the back wall, except in golden hour, which keeps the plain painted side walls (Paul, 2026-11-17: the stripes did not suit it): the sun sweeping across stripes gives the room a vertical rhythm
  const sideWallPaper = () => { if (!sideStripe) { sideStripe = WALLS.stripe.tex(); sideStripe.repeat.set(D / WALLS.stripe.size, (H + .3) / WALLS.stripe.size); } return sideStripe; }; // its own texture object: the repeat is set per use
  const fromUrl = new URLSearchParams(location.search);
  // The painting follows the mood once the visitor changes the feeling (the first view always shows the main painting); a picked or addressed painting wins.
  const DEFAULT_PRINT_BY_MOOD = { rain: "rain", family: "paper", tech: "moon", chic: "ridge", slow: "paper", golden: "ridge", tv: "inkmoon" };
  let printWasChosen = Object.hasOwn(PRINTS, fromUrl.get("print") ?? "");
  let wallWasChosen = Object.hasOwn(WALLS, fromUrl.get("wall") ?? "");
  for (const k in CHOICES) { const v = fromUrl.get(k); if (v && Object.hasOwn(CHOICES[k], v)) state[k] = v; }
  if (fromUrl.get("from") === "home" && !Object.hasOwn(MOODS, fromUrl.get("mood") ?? "")) state.mood = "golden"; // Room 01 opens in golden hour (Paul, 2026-11-17: the drifting light motes and the bright music suit it best), also from the home cover; a valid explicit mood in the address wins
  if (!wallWasChosen) state.wall = DEFAULT_WALL_BY_MOOD[state.mood];
  function choose(key, value) {
    const previous = state[key];
    if (key === "wall") wallWasChosen = true;
    if (key === "print") printWasChosen = true;
    if (key === "mood" && !printWasChosen && previous !== value) state.print = DEFAULT_PRINT_BY_MOOD[value];
    if (key === "mood" && !wallWasChosen) state.wall = DEFAULT_WALL_BY_MOOD[value];
    state[key] = value;
    if (key === "mood" && previous !== value) showRobotMood(value);
    apply(); musicSync?.();
  }
  function toUrl() {
    const u = new URL(location.href);
    for (const k in CHOICES) u.searchParams.set(k, state[k]);
    if (currentView === "tv" || currentView === "entry") u.searchParams.set("view", currentView); else u.searchParams.delete("view");
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
    if (view === "record" || view === "door" || currentView === "record" || currentView === "door") { moveRecordView(view); return; }
    if (director) stopDirector(false);
    if (directorPreparing) cancelPreparation();
    settleIntro();
    const target = view === "tv" ? Math.PI : view === "entry" ? -Math.PI / 2 : 0;
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
  // The record-player view (Paul 2026-11-18, like Room 02's and Room 04's): the camera glides to a close, slightly high look at the turntable on the sideboard and may
  // turn a little around it (limits kept so it never meets the wall or the cabinet); any other view chip glides back to the room orbit and restores its limits.
  let recordSaved = null;
  // The doorway view (Paul 2026-11-20: a new angle as if you had just opened the door and walked in, seeing the sofa and tables, the lamp and the whole room): the camera stands just inside the
  // door in the right wall (x 2.3, eye height 1.52 m), a wide lens, looking diagonally across the room towards the sofa, the rug and the window corner. On a phone's tall frame it aims a little more
  // to the right so the side table and its lamp stay in. The visitor may turn the head about 35 degrees either way (the orbit target sits 35 cm ahead of the eye, so it is almost a pure turn).
  const DOOR_EYE = new THREE.Vector3(W / 2 - .3, 1.52, doorZ), DOOR_HEAD = .35, DOOR_DOWN = .1; // the head may tip down only about 6 degrees below its default, so the umbrella stand beside the door stays out of the frame (Paul 2026-11-21)
  const doorShot = () => ({ eye: DOOR_EYE.clone(), focus: camera.aspect < .8 ? new THREE.Vector3(.2, 1.05, -.3) : new THREE.Vector3(-.5, 1.08, .5) });
  const recordShot = () => {
    const b = new THREE.Box3().setFromObject(sideboard.recordPlayer.group), c = b.getCenter(new THREE.Vector3());
    // Paul 2026-11-22: the view reaches further along the wall (towards the room's -z) so the coffee stool with its two jars and the backpack are in the picture too: the focus moves half a metre along the wall (towards -z, to the right on screen) and lower
    // (between the deck and the stool top) and the eye pulls back.
    const focus = new THREE.Vector3(c.x + .02, b.max.y - .1, c.z - .5), dist = camera.aspect < .8 ? 1.9 : 1.2;
    return { focus, eye: focus.clone().addScaledVector(new THREE.Vector3(.6, .75, -.28).normalize(), dist) }; // from the room side and above, a little toward the window end, so the hall stand stays out of frame
  };
  function moveRecordView(view) {
    const SPECIAL_VIEWS = { record: recordShot, door: doorShot }, special = !!SPECIAL_VIEWS[view];    if (director) stopDirector(false);
    if (directorPreparing) cancelPreparation();
    settleIntro();
    const token = ++viewMoveToken, fromEye = camera.position.clone(), fromFocus = controls.target.clone();
    let toEye, toFocus;
    if (special) ({ eye: toEye, focus: toFocus } = SPECIAL_VIEWS[view]());
    else { viewTheta = view === "tv" ? Math.PI : view === "entry" ? -Math.PI / 2 : 0; toEye = cameraAt(viewTheta, orbitRadius, orbitPhi); toFocus = orbitCenter.clone(); }
    if (!special && recordSaved) { Object.assign(controls, recordSaved); recordSaved = null; }
    const blendFrom = doorBlend, blendTo = view === "door" ? 1 : 0;
    currentView = view; controls.enabled = false;
    const finish = () => {
      doorBlend = blendTo;
      if (!special) { controls.enabled = true; setCameraAngle(viewTheta, orbitRadius, orbitPhi); toUrl(); drawPanel(); return; }
      recordSaved ||= { minDistance: controls.minDistance, maxDistance: controls.maxDistance, minPolarAngle: controls.minPolarAngle, maxPolarAngle: controls.maxPolarAngle, minAzimuthAngle: controls.minAzimuthAngle, maxAzimuthAngle: controls.maxAzimuthAngle };
      if (view === "door") { // a head turn: the orbit target sits 35 cm ahead of the eye, distance locked, so the camera only turns (a few centimetres of sway), within about 35 degrees either way
        const dir = toFocus.clone().sub(toEye).normalize(), ahead = toEye.clone().addScaledVector(dir, DOOR_HEAD), off = toEye.clone().sub(ahead), az = Math.atan2(off.x, off.z), polar = Math.acos(THREE.MathUtils.clamp(off.y / DOOR_HEAD, -1, 1));
        Object.assign(controls, { minDistance: DOOR_HEAD, maxDistance: DOOR_HEAD, minPolarAngle: Math.max(.2, polar - .3), maxPolarAngle: Math.min(Math.PI - .2, polar + DOOR_DOWN), minAzimuthAngle: az - 1.0, maxAzimuthAngle: az + 1.0 });
        camera.position.copy(toEye); controls.target.copy(ahead); camera.lookAt(ahead); controls.enabled = true; controls.update(); render(); toUrl(); drawPanel(); return;
      }
      const off = toEye.clone().sub(toFocus), az = Math.atan2(off.x, off.z), d = off.length();
      Object.assign(controls, { minDistance: d * .7, maxDistance: d * 1.25, minPolarAngle: Math.PI * .15, maxPolarAngle: Math.PI * .4, minAzimuthAngle: az - .5, maxAzimuthAngle: az + .5 });
      camera.position.copy(toEye); controls.target.copy(toFocus); camera.lookAt(toFocus); controls.enabled = true; controls.update(); render(); toUrl(); drawPanel();
    };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { finish(); return; }
    const t0 = performance.now(), duration = 1100, focus = new THREE.Vector3();
    const step = (now) => {
      if (token !== viewMoveToken) return;
      const k = Math.min(1, (now - t0) / duration), e = k * k * (3 - 2 * k);
      doorBlend = blendFrom + (blendTo - blendFrom) * e; camera.position.lerpVectors(fromEye, toEye, e); focus.lerpVectors(fromFocus, toFocus, e); camera.lookAt(focus); render();
      if (k < 1) requestAnimationFrame(step); else finish();
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
    for (const material of [sideMat, entrySideMat]) { const map = state.wall === "botanical" && state.mood !== "golden" ? sideWallPaper() : null; if (material.map !== map) { material.map = map; material.needsUpdate = true; } } // stripes on both side walls with the leaf wallpaper
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
      keep = had.classList.contains("shuffle") ? { c: "shuffle" } : g ? { g: [...panel.querySelectorAll(".opts")].indexOf(g), k: had.dataset.key } : { c: had.classList.contains("camera-tv") ? "camera-tv" : had.classList.contains("camera-window") ? "camera-window" : had.classList.contains("camera-entry") ? "camera-entry" : had.classList.contains("camera-record") ? "camera-record" : had.classList.contains("camera-door") ? "camera-door" : had.classList.contains("director") ? "director" : "save" };
    }
    const cameraGroup = document.createElement("div"); cameraGroup.className = "camera-actions"; cameraGroup.setAttribute("role", "group"); cameraGroup.setAttribute("aria-label", state.lang === "zh" ? "房間視角" : "Room view");
    const windowButton = Object.assign(document.createElement("button"), { type: "button", className: "camera-window", textContent: t.windowView, "aria-label": t.windowView, "aria-pressed": String(currentView === "window"), onclick: () => moveToView("window") });
    const tvButton = Object.assign(document.createElement("button"), { type: "button", className: "camera-tv", textContent: t.tvView, "aria-label": t.tvView, "aria-pressed": String(currentView === "tv"), onclick: () => moveToView("tv") });
    windowButton.setAttribute("aria-label", t.windowView); windowButton.setAttribute("aria-pressed", String(currentView === "window"));
    tvButton.setAttribute("aria-label", t.tvView); tvButton.setAttribute("aria-pressed", String(currentView === "tv"));
    const entryButton = Object.assign(document.createElement("button"), { type: "button", className: "camera-entry", textContent: t.entryView, onclick: () => moveToView("entry") });
    entryButton.setAttribute("aria-label", t.entryView); entryButton.setAttribute("aria-pressed", String(currentView === "entry"));
    const recordButton = Object.assign(document.createElement("button"), { type: "button", className: "camera-record", textContent: t.recordView, onclick: () => moveToView("record") });
    recordButton.setAttribute("aria-label", t.recordView); recordButton.setAttribute("aria-pressed", String(currentView === "record"));
    const doorButton = Object.assign(document.createElement("button"), { type: "button", className: "camera-door", textContent: t.doorView, onclick: () => moveToView("door") });
    doorButton.setAttribute("aria-label", t.doorView); doorButton.setAttribute("aria-pressed", String(currentView === "door"));
    cameraGroup.append(windowButton, tvButton, entryButton, doorButton, recordButton);
    const headings = document.createElement("h2"); headings.className = "camera-heading"; headings.textContent = state.lang === "zh" ? "轉換視角" : "Change view";
    panel.replaceChildren(headings, cameraGroup, ...[["mood", MOODS], ["wall", WALLS], ["rug", RUGS], ["curtain", CURTAINS], ["print", PRINTS]].flatMap(([key, table]) => {
      const h = document.createElement("h2"); h.textContent = t[key];
      const box = document.createElement("div"); box.className = "opts"; box.setAttribute("role", "group"); box.setAttribute("aria-label", t[key]);
      const choices = Object.entries(table).map(([k, v]) => {
        const b = document.createElement("button"); b.type = "button"; b.textContent = v[state.lang]; b.dataset.key = k;
        b.setAttribute("aria-pressed", String(state[key] === k));
        b.onclick = () => { if (director) stopDirector(false); if (directorPreparing) cancelPreparation(); choose(key, k); toUrl(); };
        return b;
      });
      if (key === "mood" && !phoneActions.matches) {
        const shuffleBtn = Object.assign(document.createElement("button"), { type: "button", className: "save shuffle mood-shuffle", textContent: t.shuffle, onclick: () => shuffle() });
        shuffleBtn.setAttribute("aria-label", t.shuffle);
        shuffleBtn.dataset.shuffle = "1";
        box.append(shuffleBtn, ...choices);
      } else box.append(...choices);
      if (key !== "mood") return [h, box];
      const why = document.createElement("p"); why.className = "why"; why.textContent = MOODS[state.mood].why[state.lang]; // why this pairing
      return [h, box, why];
    }), Object.assign(document.createElement("p"), { className: "hint", textContent: t.hint }));
    const bar = PHONE_BAR[state.lang];
    const onPhone = phoneActions.matches;
    const directorFull = directorPreparing ? t.preparing : director ? t.stop : still && directorStillOpen ? t.close : t.director;
    const directorShort = directorPreparing ? bar.preparing : director ? bar.stop : still && directorStillOpen ? bar.close : bar.director;
    const directorBtn = Object.assign(document.createElement("button"), { type: "button", className: "save director", textContent: onPhone ? directorShort : directorFull, onclick: () => toggleDirector() });
    const shuffleBtn = onPhone ? Object.assign(document.createElement("button"), { type: "button", className: "save shuffle", textContent: bar.shuffle, onclick: () => shuffle() }) : null;
    const saveBtn = Object.assign(document.createElement("button"), { type: "button", className: "save", textContent: onPhone ? bar.save : t.save, onclick: () => savePostcard() });
    directorBtn.setAttribute("aria-label", directorFull);
    shuffleBtn?.setAttribute("aria-label", t.shuffle);
    saveBtn.setAttribute("aria-label", t.save);
    const stillNodes = still && directorStillOpen ? [staticTour(t)] : [];
    if (onPhone && toolbar) {
      toolbar.replaceChildren(shuffleBtn, directorBtn, saveBtn);
      toolbar.setAttribute("aria-label", state.lang === "zh" ? "隨機搭配、短片、明信片" : "Random room, tour, postcard");
      toolbar.hidden = panel.hidden;
      panel.append(...stillNodes);
    } else {
      if (toolbar) { toolbar.replaceChildren(); toolbar.hidden = true; }
      panel.append(directorBtn, ...stillNodes, saveBtn);
    }
    if (keep) {
      const target = keep.c ? (toolbar?.querySelector("." + keep.c) || panel.querySelector("." + keep.c)) : panel.querySelectorAll(".opts")[keep.g]?.querySelector(`button[data-key="${keep.k}"]`);
      target?.focus({ preventScroll: true });
    }
    if (immersiveControls) {
      const views = document.createElement("div"); views.className = "immersive-row"; views.setAttribute("role", "group"); views.setAttribute("aria-label", state.lang === "zh" ? "房間視角" : "Room view");
      for (const [view, label] of [["window", t.windowView], ["tv", t.tvView], ["entry", t.entryView], ["door", t.doorView], ["record", t.recordView]]) {
        const b = document.createElement("button"); b.type = "button"; b.dataset.view = view; b.textContent = label; b.setAttribute("aria-pressed", String(currentView === view)); b.onclick = () => { moveToView(view); drawPanel(); }; views.append(b);
      }
      const moods = document.createElement("div"); moods.className = "immersive-moods"; moods.setAttribute("role", "group"); moods.setAttribute("aria-label", t.mood);
      const shuffleButton = document.createElement("button"); shuffleButton.type = "button"; shuffleButton.className = "shuffle"; shuffleButton.textContent = state.lang === "zh" ? "隨機搭一間" : "Random room"; shuffleButton.setAttribute("aria-label", t.shuffle); shuffleButton.onclick = () => shuffle();
      const moodOptions = document.createElement("div"); moodOptions.className = "immersive-row"; moodOptions.setAttribute("role", "group"); moodOptions.setAttribute("aria-label", t.mood);
      moods.append(shuffleButton, moodOptions);
      for (const [key, item] of Object.entries(MOODS)) {
        const b = document.createElement("button"); b.type = "button"; b.dataset.key = key; b.textContent = item[state.lang]; b.setAttribute("aria-pressed", String(state.mood === key)); b.onclick = () => { if (director) stopDirector(false); if (directorPreparing) cancelPreparation(); choose("mood", key); toUrl(); }; moodOptions.append(b);
      }
      immersiveControls.replaceChildren(views, moods);
      views.scrollLeft = immersiveScroll[0] ?? 0; moodOptions.scrollLeft = immersiveScroll[1] ?? 0;
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
    wallWasChosen = true; printWasChosen = true;
    state.wall = next.wall; state.rug = next.rug; state.curtain = next.curtain; state.print = next.print;
    apply(); musicSync?.(); toUrl();
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
  // The key card on the hooks (Paul 2026-11-20): tap it and the smart lock beeps twice, its light turns green, and the door opens (the same walk-through as tapping the door). The beep is two short Web Audio tones made on the tap.
  let lockBeepTimer = 0, beepContext = null;
  function tapKeycard({ go = true } = {}) {
    const led = roomDoor.getObjectByName("door-lock-led"), result = { beeped: false, ledGreen: false };
    try { beepContext ||= new (window.AudioContext || window.webkitAudioContext)(); const ctx = beepContext, now = ctx.currentTime; if (ctx.state === "suspended") void ctx.resume();
      for (const [at, freq, len] of [[0, 2093, .09], [.13, 2637, .16]]) { const osc = ctx.createOscillator(), gain = ctx.createGain(); osc.type = "sine"; osc.frequency.value = freq; gain.gain.setValueAtTime(.0001, now + at); gain.gain.exponentialRampToValueAtTime(.11, now + at + .01); gain.gain.exponentialRampToValueAtTime(.0001, now + at + len); osc.connect(gain).connect(ctx.destination); osc.start(now + at); osc.stop(now + at + len + .02); }
      result.beeped = true; } catch { /* no audio: the light still answers */ }
    if (led) { led.material.emissive.set("#2bd96b"); led.material.emissiveIntensity = 1.6; result.ledGreen = true; clearTimeout(lockBeepTimer); lockBeepTimer = setTimeout(() => { led.material.emissive.set("#3a6bff"); led.material.emissiveIntensity = .35; render(); }, 1800); render(); }
    if (go) setTimeout(() => { void openPortal(); }, 450);
    return result;
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
    robotBubble.querySelector("[data-bubble-copy]").textContent = GUIDE_LINE[state.lang]; robotCustomLine = null; setBubbleCover(null);
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
    robotBubble.querySelector("[data-bubble-copy]").textContent = ROBOT_MOOD_LINES[mood][state.lang]; robotCustomLine = null; setBubbleCover(null);
    const action = robotBubble.querySelector("[data-travel-door-action]"); if (action) action.hidden = true;
    robotBubble.hidden = false;
    clearTimeout(robotBubbleTimer);
    clearTimeout(robotTurnTimer);
    robotBubbleTimer = setTimeout(() => { robotBubble.hidden = true; }, 3000);
    render();
  }
  function setBubbleCover(src) { const cover = robotBubble.querySelector("[data-cover]"); if (!cover) return; cover.hidden = !src; if (src) cover.src = src; } // a record cover above the robot's line (the music), or none
  function showRobotLine(copy, ms, cover, target = robotObj) { // the little robot says a line of its own (the music hint, and the DJ's announcements with a cover); the record player reuses the same card
    bubbleTarget = target; robotCustomLine = copy; setBubbleCover(cover || null);
    robotBubble.querySelector("[data-bubble-copy]").textContent = copy[state.lang] || copy.zh;
    const action = robotBubble.querySelector("[data-travel-door-action]"); if (action) action.hidden = true;
    robotBubble.hidden = false; clearTimeout(robotBubbleTimer); clearTimeout(robotTurnTimer);
    robotBubbleTimer = setTimeout(() => { robotBubble.hidden = true; robotCustomLine = null; bubbleTarget = robotObj; }, ms);
    render();
  }
  function robotInView() { // is the little robot on screen, so that its speech bubble points at something?
    robotObj.updateWorldMatrix(true, true); const bounds = new THREE.Box3().setFromObject(robotObj);
    const head = new THREE.Vector3((bounds.min.x + bounds.max.x) / 2, bounds.max.y, (bounds.min.z + bounds.max.z) / 2).project(camera);
    return head.z < 1 && head.x > -1.25 && head.x < 0.92 && head.y > -0.8 && head.y < 0.92; // partly cut off at the left edge still counts: the bubble stays inside the picture
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
  const noteCaption = document.createElement("div");
  noteCaption.id = "plantNote"; noteCaption.setAttribute("role", "status"); noteCaption.setAttribute("aria-live", "polite");
  Object.assign(noteCaption.style, { position: "absolute", left: "50%", bottom: "14px", transform: "translateX(-50%)", maxWidth: "min(320px, 86%)", padding: "9px 14px", borderRadius: "14px", background: "#fffc", color: "#24302c", boxShadow: "0 5px 18px #0003", fontSize: "14px", fontWeight: "700", lineHeight: "1.45", textAlign: "center", pointerEvents: "none", opacity: "0", transition: "opacity .25s ease", zIndex: "4" });
  stage.append(noteCaption);
  let noteTimer = 0;
  // The speakers by the TV play music (Paul, 2026-11-16): tap a speaker, quiet original piano pieces made in the browser (sound.js). A second tap stops it; each new start plays the next piece.
  const roomMusic = createRoomMusic();
  let musicTrack = -1, musicTimer = 0, musicHinted = false, lastTouch = performance.now(), musicStopped = false, musicAuto = false;
  const musicOptions = { playlist: true, fade: 0.5, onTrack: (index) => { musicTrack = index; if (roomMusic.state().playing) announceMusic(index); } }; // the two pieces follow one another; each change shows its line
  const MUSIC_LINES = {
    zh: ["♪ 窗邊的午後。🎹 明亮的鋼琴。再點我，就換下一首！", "♪ 追劇夜。🎬 電影感的配樂，低音沉穩。再點我，就換下一首！", "♪ 十里洋場。🎺 單簧管和小號的搖擺樂，好開心！再點我，就換下一首！"],
    en: ["♪ Afternoon at the window. 🎹 Bright piano. Tap me again for the next one!", "♪ Series night. 🎬 A cinematic score with a deep bass. Tap me again for the next one!", "♪ Bund Swing (十里洋場). 🎺 Clarinet and trumpet swing, so happy! Tap me again for the next one!"],
    auto: { zh: "♪ 電視喇叭輕輕放著音樂。點喇叭可以關掉。", en: "♪ Music from the TV speakers. Tap a speaker to turn it off." },
    hint: { zh: "這邊有唱片機，點一下就能聽音樂 🎵", en: "There's a record player here — tap it for music 🎵" }, // Paul 2026-11-19: the music lives on the record player now
  };
  const MUSIC_COVERS = ["./cafe/art/room04-record-cover-4-v1.webp", "./cafe/art/room04-record-cover-5-v1.webp", "./cafe/art/room04-record-cover-3-v1.webp"]; // Paul 2026-11-22: 窗邊的午後 and 追劇夜 now have covers of their own (a golden hillside and a violet night city, made from gallery pictures); // Room 04's covers: 慢板 (the day piece), 夜色外灘 (for series night) and 十里洋場 (the swing)
  // Paul 2026-11-18: started from the record player, the same card (cover and line) pops up over the record player instead, with the piece now playing and the next one.
  const RECORD_LINES = {
    zh: ["♪ 正在播放：窗邊的午後 🎹 明亮的鋼琴。下一首：追劇夜。再點唱片機就停。", "♪ 正在播放：追劇夜 🎬 電影感的配樂。下一首：十里洋場。再點唱片機就停。", "♪ 正在播放：十里洋場 🎺 開心的搖擺樂。下一首：窗邊的午後。再點唱片機就停。"],
    en: ["♪ Now playing: Afternoon at the window 🎹 Bright piano. Next: Series night. Tap the record player again to stop.", "♪ Now playing: Series night 🎬 A cinematic score. Next: Bund Swing. Tap the record player again to stop.", "♪ Now playing: Bund Swing (十里洋場) 🎺 A happy swing. Next: Afternoon at the window. Tap the record player again to stop."],
  };
  let musicFromRecord = false; // who started the music: the record player's card follows the pieces it started; everything else keeps the robot's
  function recordPlayerInView() {
    const b = new THREE.Box3().setFromObject(sideboard.recordPlayer.group), c = b.getCenter(new THREE.Vector3()).project(camera);
    return c.z < 1 && Math.abs(c.x) < 1 && Math.abs(c.y) < 1;
  }
  function announceMusic(track) { // the robot says which piece is playing, with its cover (a caption if the robot is not in view)
    const cover = new URL(MUSIC_COVERS[track], import.meta.url).href;
    if (musicFromRecord && (currentView === "record" || recordPlayerInView())) { /* the record view counts while the camera is still gliding there */ showRobotLine({ zh: RECORD_LINES.zh[track], en: RECORD_LINES.en[track] }, 7000, cover, sideboard.recordPlayer.group); return; }
    const copy = { zh: MUSIC_LINES.zh[track], en: MUSIC_LINES.en[track] };
    if (!robotSleeping && robotInView()) showRobotLine(copy, 7000, cover); else showCaption(copy[state.lang] || copy.zh, 6000);
  }
  function djTap() { // the window-side robot is the DJ (Paul, 2026-11-17): a tap starts the music, and each next tap changes the piece
    musicHinted = true; musicStopped = false; musicAuto = true; musicFromRecord = false;
    musicTrack = roomMusic.state().playing ? (musicTrack + 1) % MUSIC_COVERS.length : (state.mood === "tv" ? 1 : 0); // the three pieces in turn
    roomMusic.start(musicTrack, musicOptions); announceMusic(musicTrack);
  }
  const showCaption = (text, ms) => { noteCaption.textContent = text; noteCaption.style.opacity = "1"; clearTimeout(noteTimer); noteTimer = setTimeout(() => { noteCaption.style.opacity = "0"; }, ms); };
  function toggleMusic(fromRecord = false) {
    musicHinted = true;
    if (roomMusic.state().playing) { roomMusic.stop(); musicStopped = true; /* switched off by hand: it never starts by itself again */ clearTimeout(musicTimer); noteCaption.style.opacity = "0";
      if (bubbleTarget === sideboard.recordPlayer.group) { clearTimeout(robotBubbleTimer); robotBubble.hidden = true; robotCustomLine = null; bubbleTarget = robotObj; } return; }
    musicFromRecord = fromRecord;
    musicTrack = state.mood === "tv" ? 1 : 0; // series night plays the cinematic piece, every other mood the bright one
    if (roomMusic.start(musicTrack, musicOptions)) { announceMusic(musicTrack); } /* no time limit */
  }
  // Series night and the TV wall (Paul, 2026-11-16): when the mood is series night, or the TV wall is the view, the speakers start the quiet piano by themselves, once per visit, from the visitor's
  // next tap or drag (browsers only allow sound after one). It starts the slow piece, stops after 60 s like the other start, and never starts again once the visitor has switched it off.
  function autoMusic() {
    if (musicAuto || musicStopped || roomMusic.state().playing || document.hidden || (state.mood !== "tv" && currentView !== "tv")) return;
    musicAuto = true; musicHinted = true; musicFromRecord = false; musicTrack = state.mood === "tv" ? 1 : 0;
    if (roomMusic.start(musicTrack, musicOptions)) { announceMusic(musicTrack); } /* no time limit */
  }
  window.addEventListener("pointerup", () => autoMusic(), { passive: true });
  // The record player turns while the music plays, whoever started it (the TV, the speakers, the DJ robot or the record player itself); a stopped room draws nothing extra.
  setInterval(() => { sideboard.recordPlayer.setPlaying(!!roomMusic.state().playing, render); }, 400);
  // The record player's glowing ring (Paul 2026-11-20, like Rooms 02 and 03): a soft pulsing ring over the turntable until the visitor taps it; the music then plays until they stop it. It shows only
  // while the turntable is on screen and clear of the edges, lets every tap through, and is drawn in CSS (no cost to the picture).
  let recordFound = false;
  const recordRing = document.createElement("div"), recordRingStyle = document.createElement("style");
  recordRing.id = "recordRing"; recordRing.setAttribute("aria-hidden", "true"); recordRing.hidden = true;
  recordRingStyle.textContent = "#recordRing{position:absolute;z-index:4;margin:0;border:3px solid #ffe2a8;border-radius:50%;background:radial-gradient(circle,rgba(255,214,150,.3),transparent 70%);box-shadow:0 0 18px 5px rgba(255,190,90,.8);pointer-events:none;transform:translate(-50%,-50%);animation:recordRingPulse 1.9s ease-out infinite}#recordRing[hidden]{display:none}@keyframes recordRingPulse{0%{opacity:1;box-shadow:0 0 10px 2px rgba(255,190,90,.8)}80%,100%{opacity:0;box-shadow:0 0 30px 10px rgba(255,190,90,0)}}@media(prefers-reduced-motion:reduce){#recordRing{animation:none}}"; document.head.append(recordRingStyle); stage.append(recordRing);
  const recordRingSpot = new THREE.Vector3(), recordRingBox = new THREE.Box3();
  function placeRecordRing() {
    if (roomMusic.state().playing) recordFound = true; // Paul 2026-11-20: once music plays, from the record player or the TV or the speakers or the robot, the ring has done its job and stays away, as in Rooms 02 to 04
    if (recordFound || document.hidden || director || intro || new URLSearchParams(location.search).get("hint") === "0") { recordRing.hidden = true; return; }
    recordRingBox.setFromObject(sideboard.recordPlayer.group); recordRingBox.getCenter(recordRingSpot); recordRingSpot.y = recordRingBox.max.y - .02;
    camera.updateMatrixWorld(); const p = recordRingSpot.clone().project(camera), edge = new THREE.Vector3(recordRingBox.max.x, recordRingSpot.y, recordRingSpot.z).project(camera), r = stage.getBoundingClientRect();
    if (p.z >= 1 || Math.abs(p.x) > .86 || Math.abs(p.y) > .8) { recordRing.hidden = true; return; }
    const cx = (p.x + 1) * r.width / 2, cy = (1 - p.y) * r.height / 2, size = Math.max(48, Math.abs(edge.x - p.x) * r.width * 1.1 + 40);
    recordRing.hidden = false; Object.assign(recordRing.style, { left: `${cx}px`, top: `${cy}px`, width: `${size}px`, height: `${size}px` });
  }
  setInterval(placeRecordRing, 250);
  let musicNightMood = state.mood === "tv"; // the mood the music last followed
  musicSync = () => { const night = state.mood === "tv"; if (night === musicNightMood) return; musicNightMood = night; if (!roomMusic.state().playing) return; musicTrack = night ? 1 : 0; roomMusic.start(musicTrack, musicOptions); announceMusic(musicTrack); }; // entering or leaving series night while music plays changes the piece; a piece picked with the robot stays until then
  window.addEventListener("click", () => autoMusic(), { passive: true }); // the view and mood buttons change the state in their own click handlers, which run before this one
  document.addEventListener("visibilitychange", () => { if (document.hidden) { roomMusic.stop(); clearTimeout(musicTimer); } });
  window.addEventListener("pointerdown", () => { lastTouch = performance.now(); }, { passive: true });
  let dustLast = 0, ambientFrozen = false; // ambientFrozen is a QA switch: tests that compare two renders of one angle stop the drifting motes first
  const ambientTick = () => { // the ambient tick: motes drift and the sun breathes a little (about 4%, one breath per 12 s) while the window light shows
    let cost = 0;
    try {
      const now = performance.now();
      if (!musicHinted && !intro && !director && now - lastTouch > 9000 && now - lastTouch < 30000 && !document.hidden && noteCaption.style.opacity === "0" && robotBubble.hidden) { musicHinted = true; if (!robotSleeping && robotInView()) showRobotLine(MUSIC_LINES.hint, 6500); else showCaption(MUSIC_LINES.hint[state.lang] || MUSIC_LINES.hint.zh, 5200); }
      if (ambientFrozen || document.hidden || still || now - lastTouch > 30000) dustLast = 0;
      else {
        const dt = dustLast ? Math.min(.25, (now - dustLast) / 1000) : .1; dustLast = now;
        if (dustPoints.visible) { stepDust(dt); if (shown) windowLight.intensity = shown.win * (1 + .04 * Math.sin(dustTime * .5)); } PROPS.mugSteam.update(now / 1000); /* the red mug's steam drifts while the visitor is in the room */ render(); cost = performance.now() - now;
      }
    } catch { /* the room is still starting up */ }
    setTimeout(ambientTick, Math.max(100, cost * 3)); // a slow device draws less often (at most a third of the time spent drawing), so the ambient motion never starves the rest of the page
  };
  setTimeout(ambientTick, 100);
  function showPlantNote() { plantHintShown = true; noteCaption.textContent = deskNoteLines[state.lang] || deskNoteLines.zh; noteCaption.style.opacity = "1"; clearTimeout(noteTimer); noteTimer = setTimeout(() => { noteCaption.style.opacity = "0"; }, 4600); }
  // Paul 2026-11-11: the note is a few pixels in the overview, so say it is there. Once per visit, when a turn of the view settles with the note in frame
  // (not in the default phone view, where the plant is off screen), one line under the picture: "Tap: the little note on the plant pot."
  let plantHintShown = false, plantHintTimer = 0;
  const plantNoteInFrame = () => { const c = new THREE.Box3().setFromObject(plantNote).getCenter(new THREE.Vector3()).project(camera); return c.z < 1 && Math.abs(c.x) < 0.97 && Math.abs(c.y) < 0.97; };
  function maybeHintPlantNote() {
    if (plantHintShown || still || arrival || director || (robotBubble && !robotBubble.hidden) || !plantNoteInFrame()) return;
    plantHintShown = true;
    noteCaption.textContent = state.lang === "en" ? "Tap: the little note on the plant pot." : "點一下：花盆上的小便條。";
    noteCaption.style.opacity = "1"; clearTimeout(noteTimer); noteTimer = setTimeout(() => { noteCaption.style.opacity = "0"; }, 4200);
  }
  controls.addEventListener("end", () => { clearTimeout(plantHintTimer); plantHintTimer = setTimeout(maybeHintPlantNote, 900); });
  renderer.domElement.addEventListener("pointerdown", (e) => {
    if (arrival) { suppressTap = true; downAt = null; finishReturnArrival(); return; }
    if (director) { suppressTap = true; stopDirector(); downAt = null; return; }
    downAt = [e.clientX, e.clientY, e.pointerType]; // a finger is allowed more wobble than a mouse: a tap that moves 10 px is still a tap
  });
  renderer.domElement.addEventListener("pointerup", (e) => {
    if (suppressTap) { suppressTap = false; return; }
    if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > (downAt[2] === "touch" ? 14 : 6) || hopping) return;
    const touchTap = downAt[2] === "touch";
    const r = renderer.domElement.getBoundingClientRect();
    tap.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(tap, camera);
    // Prioritize this 44 px touch target even while the robot dialogue bubble is open.
    const noteCenter = new THREE.Box3().setFromObject(plantNote).getCenter(new THREE.Vector3()).project(camera);
    if (noteCenter.z < 1 && Math.hypot(e.clientX - (r.left + ((noteCenter.x + 1) / 2) * r.width), e.clientY - (r.top + ((1 - noteCenter.y) / 2) * r.height)) <= (touchTap ? 60 : 44)) { showPlantNote(); return; }
    const speakerPair = scene.getObjectByName("tv-wall-speakers"); // tapping a speaker (the ray, or within 40 px of one on screen) plays the music
    if (speakerPair && (ray.intersectObject(speakerPair, true).length || speakerPair.userData.unitBoxes.some((box) => { const c = speakerPair.localToWorld(box.getCenter(new THREE.Vector3())).project(camera); return c.z < 1 && Math.hypot(e.clientX - (r.left + ((c.x + 1) / 2) * r.width), e.clientY - (r.top + ((1 - c.y) / 2) * r.height)) <= 40; }))) { toggleMusic(); return; }
    if (ray.intersectObject(tvScreen, false).length) { toggleMusic(); return; } // a tap on the TV screen starts (or stops) the music too
    { const cardBox = new THREE.Box3().setFromObject(PROPS.keycard), cc = cardBox.getCenter(new THREE.Vector3()).project(camera); // the card is small: its tap area is at least 44 px round it
      if (cc.z < 1 && Math.hypot(e.clientX - (r.left + ((cc.x + 1) / 2) * r.width), e.clientY - (r.top + ((1 - cc.y) / 2) * r.height)) <= 44) { tapKeycard(); return; } }
    if (ray.intersectObject(sideboard.recordPlayer.group, true).length) { recordFound = true; recordRing.hidden = true; toggleMusic(true); return; } // the record player on the sideboard (Paul 2026-11-18) switches the same music on or off
    const hitGuide = ray.intersectObject(guidePivot, true).length > 0;
    if (!hitGuide && !ray.intersectObject(robotObj, true).length) { if (ray.intersectObject(roomDoor, true).length) onTravelChoice(); return; } // tapping the door opens the shared destination chooser
    const pivot = hitGuide ? guidePivot : robotPivot, home = hitGuide ? guideHome : robotHome;
    hopping = true;
    const hop = ++hopRun;
    if (hitGuide) showGuideLine(); else djTap();
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
    const toEntry = Math.abs(Math.atan2(Math.sin(viewTheta + Math.PI / 2), Math.cos(viewTheta + Math.PI / 2)));
    if (currentView !== "record" && currentView !== "door") currentView = toEntry < toWindow && toEntry < toTv ? "entry" : toTv < toWindow ? "tv" : "window"; // turning a little in the record-player view keeps that view
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
    // Paul 2026-11-01: a premium red hardshell, standing under the right-wall harbour painting — then "毛邊修掉、拉桿做實在". Clean pass: two
    // lacquered shell halves with a real opening groove, a slim chrome handle that reads solid, four spinner wheels with hubcaps in a visible gap,
    // and nothing else on the silhouette. No corner blobs, no dangling tag: at this distance the clean outline is what reads as expensive.
    const artBox = rightWallArtGroup ? new THREE.Box3().setFromObject(rightWallArtGroup) : null;
    const wallX = artBox ? artBox.min.x : W / 2 - .02;

    const yaw = -1.02; // turned further toward the room, so the handle bar and the wheel line both read from the sofa side
    const centre = new THREE.Vector3(wallX - .36, 0, .36);
    centre.x = Math.min(W / 2 - .42, Math.max(-W / 2 + .42, centre.x));
    centre.z = Math.min(FRONT - .5, Math.max(BACK + .5, centre.z));

    const CASE_W = .40, CASE_D = .235, BODY_H = .52, WHEEL_H = .072;
    const RED = 0x9c1d17, METAL = 0xd2d6dc, CHROME = 0xe8ebef, DARK = 0x08090a;
    const shellG = [], metalG = [], chromeG = [], darkG = [], wheelG = [], wheelHubG = [], tagG = [], whiteG = [], leatherG = [];
    const slab = (w, d, r, thickness, bevel, curveSegments = 5, bevelSegments = 2) => new THREE.ExtrudeGeometry(roundedRectShape(w, d, r), {
      depth: thickness, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel * .8, bevelSegments, curveSegments,
    }).rotateX(-Math.PI / 2);
    // two halves with a 5 mm gap between them: the opening reads as a groove instead of a fin glued on the shell
    shellG.push(slab(CASE_W, CASE_D, .075, .283, .016).translate(0, WHEEL_H, 0));
    shellG.push(slab(CASE_W, CASE_D, .075, .218, .016).translate(0, WHEEL_H + .293, 0));
    metalG.push(slab(CASE_W - .01, CASE_D - .01, .0735, .004, .001, 4, 1).translate(0, WHEEL_H + .2915, 0)); // the aluminium lip inside the groove
    darkG.push(slab(CASE_W - .06, CASE_D - .06, .05, .018, .004, 3, 1).translate(0, WHEEL_H + .286, 0)); // dark liner so the groove is not hollow
    // two latches on the broad face, flush and small
    for (const sx of [-1, 1]) metalG.push(new THREE.BoxGeometry(.05, .024, .008).translate(sx * .105, WHEEL_H + .288, CASE_D / 2 + .002));
    // Paul 2026-11-01: the wheels looked scattered. They are one undercarriage now: a dark base rail under the shell floor with four wheels nested
    // in housings, each with a polished hubcap, so the four wheels read as one engineered part instead of four separate blobs.
    darkG.push(slab(CASE_W - .02, CASE_D - .02, .05, .02, .005, 5, 2).translate(0, WHEEL_H - .034, 0)); // base rail
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const wx = sx * .155, wz = sz * .086;
      darkG.push(new THREE.BoxGeometry(.056, .05, .058).translate(wx, .058, wz)); // housing, overlapping the rail
      // Each caster is slightly swivelled, and indexed cylinders are expanded before merging.
      wheelG.push(new THREE.CylinderGeometry(.038, .038, .032, 20).toNonIndexed().rotateZ(Math.PI / 2).rotateY(-.45).translate(wx, .038, wz));
      wheelHubG.push(new THREE.CylinderGeometry(.014, .014, .035, 16).toNonIndexed().rotateZ(Math.PI / 2).rotateY(-.45).translate(wx, .038, wz)); // flush metal hub
    }
    // Paul 2026-11-01: the handle stays fully retracted and flush; the grip and its pocket go near-black so the "T" reads as one dark part instead
    // of a grey smudge, and the chrome bar under it stays thin and bright.
    const topY = WHEEL_H + BODY_H;
    darkG.push(new THREE.BoxGeometry(.225, .018, .076).translate(0, topY - .006, -.02)); // retraction pocket, near-black
    metalG.push(new THREE.BoxGeometry(.178, .007, .04).translate(0, topY + .0025, -.02)); // flush chrome bar
    darkG.push(new THREE.BoxGeometry(.155, .011, .032).translate(0, topY + .009, -.02)); // the black grip itself, proud by 1 mm only
    for (const sx of [-1, 1]) metalG.push(new THREE.BoxGeometry(.024, .012, .052).translate(sx * .1, topY + .002, -.02)); // flush end caps

    // Low-profile carry grips, separate from the fully retracted telescopic trolley bar.
    // Their mounts overlap the shell and the grip, so each reads as one attached part.
    const carryParts = { top: [], side: [], front: [] }, carryG = [];
    const carry = (name, geometry) => { const g=geometry.index?geometry.toNonIndexed():geometry; carryParts[name].push(g); carryG.push(g); };
    // Top grip: a softly rounded horizontal bar on two flush supports.
    carry('top', new THREE.CapsuleGeometry(.012,.125,4,10).rotateZ(Math.PI/2).translate(0,topY+.024,.055));
    for(const x of [-.062,.062]) carry('top',new THREE.BoxGeometry(.026,.024,.028).translate(x,topY+.012,.055));
    // Side grip: runs vertically along the narrow right side of the upright case.
    carry('side',new THREE.CapsuleGeometry(.011,.115,4,10).translate(CASE_W/2+.032,WHEEL_H+.40,-.015));
    for(const y of [-.055,.055]) carry('side',new THREE.BoxGeometry(.052,.022,.024).translate(CASE_W/2+.010,WHEEL_H+.40+y,-.015));
    // A flush handhold on the upper front face, clear of the red luggage tag below.
    carry('front',new THREE.ExtrudeGeometry(roundedRectShape(.125,.028,.012),{depth:.020,bevelEnabled:true,bevelSize:.002,bevelThickness:.001,bevelSegments:1,curveSegments:4}).translate(-.025,WHEEL_H+.44,CASE_D/2+.025));
    for(const x of [-.077,.027]) carry('front',new THREE.BoxGeometry(.022,.022,.060).translate(x,WHEEL_H+.44,CASE_D/2+.012));

    // Paul: keep the reference tag as one connected red tag, ring and printed face.
    // The ring overlaps both the handle and the upper edge of the tag; the tag lies on the
    // broad front of the case so its white plane motif is visible at room scale.
    leatherG.push(new THREE.BoxGeometry(.034, .075, .025).translate(.142, WHEEL_H + .305, CASE_D / 2 + .004));
    darkG.push(new THREE.TorusGeometry(.023, .005, 8, 20).translate(.142, WHEEL_H + .272, CASE_D / 2 + .024));
    tagG.push(new THREE.ExtrudeGeometry(roundedRectShape(.072, .146, .009), { depth: .008, bevelEnabled: true, bevelSize: .002, bevelThickness: .001, bevelSegments: 1, curveSegments: 4 }).translate(.142, WHEEL_H + .178, CASE_D / 2 + .031));

    const place = (geometry) => geometry.applyMatrix4(
      new THREE.Matrix4().compose(
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
    addPart(metalG, new THREE.MeshStandardMaterial({ color: METAL, roughness: .22, metalness: .9 }), "red-suitcase-metal");
    addPart(chromeG, new THREE.MeshStandardMaterial({ color: CHROME, roughness: .12, metalness: .95 }), "red-suitcase-chrome");
    addPart(darkG, new THREE.MeshStandardMaterial({ color: DARK, roughness: .6, metalness: .22 }), "red-suitcase-hardware");
    addPart(wheelG, new THREE.MeshStandardMaterial({ color: 0x37393a, roughness: .8, metalness: .03 }), "red-suitcase-wheels");
    addPart(wheelHubG, new THREE.MeshStandardMaterial({ color: 0xaaa9a5, roughness: .42, metalness: .6 }), "red-suitcase-wheel-hubs");
    addPart(carryG, new THREE.MeshPhysicalMaterial({ color: 0x3c3b39, roughness: .45, metalness: .08, clearcoat: .25, clearcoatRoughness: .35 }), "red-suitcase-carry-handles");
    addPart(tagG, new THREE.MeshStandardMaterial({ color: 0xc22b1d, roughness: .32, metalness: .03 }), "red-suitcase-tag");
    // Small procedural canvas, no downloaded font or image; colour and proportions match Paul's reference.
    const tagPrint = canvasTex(256, 512, (ctx, w, h) => {
      ctx.fillStyle = '#bd251c'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#e56052'; ctx.lineWidth = 4; ctx.strokeRect(9, 9, w - 18, h - 18);
      ctx.fillStyle = '#ffece6'; ctx.textAlign = 'center'; ctx.font = 'bold 35px sans-serif';
      ctx.fillText('HAPPY', w / 2, 92); ctx.fillText('FLIGHT', w / 2, 135);
      ctx.save(); ctx.translate(w / 2, 276); ctx.rotate(-.38); ctx.scale(1.05, 1.05);
      ctx.beginPath(); ctx.moveTo(0,-86); ctx.bezierCurveTo(18,-86,18,-60,18,-38);
      ctx.lineTo(82,7); ctx.lineTo(82,25); ctx.lineTo(18,8); ctx.lineTo(16,60);
      ctx.lineTo(39,76); ctx.lineTo(39,88); ctx.lineTo(0,78); ctx.lineTo(-39,88);
      ctx.lineTo(-39,76); ctx.lineTo(-16,60); ctx.lineTo(-18,8); ctx.lineTo(-82,25);
      ctx.lineTo(-82,7); ctx.lineTo(-18,-38); ctx.bezierCurveTo(-18,-60,-18,-86,0,-86); ctx.fill(); ctx.restore();
    });
    const printGeometry = new THREE.PlaneGeometry(.066, .136).translate(.142, WHEEL_H + .178, CASE_D / 2 + .044);
    const printMesh = new THREE.Mesh(place(printGeometry), new THREE.MeshStandardMaterial({ map: tagPrint, color: 0xffffff, roughness: .38, metalness: .02 }));
    printMesh.name = "red-suitcase-tag-print"; meshes.push(printMesh);
    // Two small, original travel stickers on the broad shell, with no logos or lettering.
    const travelSticker=canvasTex(256,256,(ctx,w,h)=>{ctx.clearRect(0,0,w,h);ctx.fillStyle='#f2e5cb';ctx.beginPath();ctx.arc(128,128,119,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#b99470';ctx.lineWidth=8;ctx.stroke();ctx.fillStyle='#88a6a0';ctx.beginPath();ctx.arc(128,128,94,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f3d2a1';ctx.beginPath();ctx.arc(164,92,19,0,Math.PI*2);ctx.fill();ctx.fillStyle='#627c74';ctx.beginPath();ctx.moveTo(42,175);ctx.lineTo(97,102);ctx.lineTo(135,151);ctx.lineTo(163,124);ctx.lineTo(216,177);ctx.closePath();ctx.fill();ctx.fillStyle='#344f45';for(const x of [69,87,182]){ctx.fillRect(x,143,5,40);ctx.beginPath();ctx.moveTo(x-8,152);ctx.lineTo(x+2,119);ctx.lineTo(x+12,152);ctx.fill();}});
    const stickerGeo=new THREE.PlaneGeometry(.065,.065).translate(-.075,WHEEL_H+.18,CASE_D/2+.017);
    const sticker=new THREE.Mesh(place(stickerGeo),new THREE.MeshStandardMaterial({map:travelSticker,transparent:true,roughness:.75,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));sticker.name='red-suitcase-travel-sticker';meshes.push(sticker);
    // A second tiny sticker suggests the Brooklyn Bridge without text or logos.
    const bridgeSticker=canvasTex(256,256,(ctx,w,h)=>{ctx.clearRect(0,0,w,h);ctx.fillStyle='#f0e3c9';ctx.beginPath();ctx.roundRect(8,8,240,240,30);ctx.fill();ctx.fillStyle='#91a9a3';ctx.fillRect(28,56,200,132);ctx.fillStyle='#e5bc83';ctx.beginPath();ctx.arc(180,86,17,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#374c4d';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(30,173);ctx.lineTo(225,173);ctx.moveTo(91,175);ctx.lineTo(91,78);ctx.lineTo(111,78);ctx.lineTo(111,175);ctx.moveTo(163,175);ctx.lineTo(163,94);ctx.lineTo(181,94);ctx.lineTo(181,175);ctx.stroke();ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(29,124);ctx.quadraticCurveTo(100,192,171,128);ctx.quadraticCurveTo(200,105,226,109);ctx.stroke();});
    const bridgeGeo=new THREE.PlaneGeometry(.057,.057).translate(.025,WHEEL_H+.115,CASE_D/2+.017);
    const bridge=new THREE.Mesh(place(bridgeGeo),new THREE.MeshStandardMaterial({map:bridgeSticker,transparent:true,roughness:.75,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));bridge.name='red-suitcase-brooklyn-sticker';meshes.push(bridge);
    // Two more small, original travel badges: LA lettering and a Taipei 101 silhouette.
    const laBadge=canvasTex(256,256,(ctx,w,h)=>{ctx.clearRect(0,0,w,h);ctx.fillStyle='#f4dfbd';ctx.beginPath();ctx.roundRect(8,8,240,240,36);ctx.fill();ctx.strokeStyle='#ae7659';ctx.lineWidth=8;ctx.stroke();ctx.fillStyle='#375f67';ctx.font='bold 132px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('LA',128,133);});
    const taipeiBadge=canvasTex(256,256,(ctx,w,h)=>{ctx.clearRect(0,0,w,h);ctx.fillStyle='#eee5cf';ctx.beginPath();ctx.arc(128,128,120,0,Math.PI*2);ctx.fill();ctx.fillStyle='#769d9a';ctx.beginPath();ctx.arc(128,128,99,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f5e9ce';ctx.fillRect(121,36,14,22);for(let i=0;i<5;i++){const y=61+i*25,half=17+i*4;ctx.beginPath();ctx.moveTo(128-half,y);ctx.lineTo(128+half,y);ctx.lineTo(128+half-5,y+22);ctx.lineTo(128-half+5,y+22);ctx.closePath();ctx.fill();}ctx.fillRect(112,184,32,18);});
    for(const [map,x,y,name] of [[laBadge,-.100,WHEEL_H+.34,'red-suitcase-la-sticker'],[taipeiBadge,.075,WHEEL_H+.35,'red-suitcase-taipei-sticker']]){const geo=new THREE.PlaneGeometry(.067,.067).translate(x,y,CASE_D/2+.017);const m=new THREE.Mesh(place(geo),new THREE.MeshStandardMaterial({map,transparent:true,roughness:.75,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));m.name=name;meshes.push(m);}
    addPart(leatherG, new THREE.MeshStandardMaterial({ color: 0x4a352c, roughness: .8, metalness: .02 }), "red-suitcase-leather");
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
        handles: Object.fromEntries(Object.entries(carryParts).map(([name,parts]) => {
          const bounds = new THREE.Box3();
          for (const geo of parts) { geo.computeBoundingBox(); bounds.union(geo.boundingBox); }
          bounds.translate(new THREE.Vector3(0,drop,0));
          const mountOverlaps = parts.slice(1).filter(g => g.boundingBox.intersectsBox(parts[0].boundingBox)).length;
          return [name, { min: bounds.min.toArray(), max: bounds.max.toArray(), pieces: parts.length, mountOverlaps }];
        })),
        wheelFloorGapsMm: wheelG.map(g => { g.computeBoundingBox(); return (g.boundingBox.min.y + drop) * 1000; }),
      shellBottomMm: (new THREE.Box3().setFromObject(shellMesh).min.y) * 1000,
      vertices: totalVertices,
    };
  }

  // A restrained autumn arrangement beside the harbour wall, with no new lights.
  function buildAutumnPlant() {
    const group = new THREE.Group(); group.name = "red-leaf-plant";
    group.position.set(2.31, 0, -0.65); group.scale.y = 0.85;
    const addPlantPart = (geometry, material, name) => {
      const mesh = new THREE.Mesh(geometry, material); mesh.name = name;
      mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); return mesh;
    };
    const points = [[0,0],[.085,0],[.108,.018],[.13,.075],[.135,.14],[.119,.21],[.084,.265],[.081,.28],[.073,.28],[.072,.265]]
      .map(([x,y]) => new THREE.Vector2(x,y));
    const potGeo = new THREE.LatheGeometry(points, 32);
    const pos = potGeo.attributes.position;
    for (let i=0;i<pos.count;i++) { const y=pos.getY(i); const d=1 + .012*Math.sin(pos.getX(i)*72 + y*21)*Math.sin(pos.getZ(i)*59 + y*9); pos.setX(i,pos.getX(i)*d);pos.setZ(i,pos.getZ(i)*d); }
    potGeo.computeVertexNormals();
    // Soft olive glaze over a warm unglazed clay foot, with quiet tonal variation.
    const potColors=new Float32Array(pos.count*3);
    for(let i=0;i<pos.count;i++){const y=pos.getY(i), c=new THREE.Color(y<.028?0xb18c6b:y>.242?0x798771:0x879780);c.multiplyScalar(.96+.035*Math.sin(y*75+pos.getX(i)*11));c.toArray(potColors,i*3);}
    potGeo.setAttribute('color',new THREE.BufferAttribute(potColors,3));
    const pot=addPlantPart(potGeo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.72}),"autumn-plant-pot");
    // Merge the dark soil with the stems: one material and one draw call.
    const tintGeometry=(geometry,hex)=>{const c=new THREE.Color(hex),n=geometry.attributes.position.count,colors=new Float32Array(n*3);for(let i=0;i<n;i++)c.toArray(colors,i*3);geometry.setAttribute("color",new THREE.BufferAttribute(colors,3));return geometry;};
    // Recess the soil inside the thick rim; a dark narrow contact ring suggests ambient occlusion.
    const soilGeo=tintGeometry(new THREE.CircleGeometry(.0725,32).toNonIndexed().rotateX(-Math.PI/2).translate(0,.270,0),0x463321);
    const rimShadow=tintGeometry(new THREE.RingGeometry(.061,.073,32).toNonIndexed().rotateX(-Math.PI/2).translate(0,.2708,0),0x231a13);
    const branches=[soilGeo,rimShadow]; const tips=[]; const base=new THREE.Vector3(0,.265,0);
    for(let i=0;i<6;i++) {
      const a=i*Math.PI*2/6+.18, r=.095+(i%3)*.014;
      const tip=new THREE.Vector3(Math.cos(a)*r,0.79+i*.063,Math.sin(a)*r); tips.push(tip);
      const stem=new THREE.CylinderGeometry(.003,.006,base.distanceTo(tip),7,1).toNonIndexed();
      stem.rotateZ(Math.PI/2); // local X axis for the transform below
      const mid=base.clone().add(tip).multiplyScalar(.5), dir=tip.clone().sub(base).normalize();
      stem.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(-1,0,0),dir));stem.translate(mid.x,mid.y,mid.z);branches.push(tintGeometry(stem,0x695137));
    }
    addPlantPart(softMerge(branches),new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}),"autumn-plant-branches");
    // One curved, pointed leaf shared by every instance; shape is geometry, not a flat square.
    const leaf=new THREE.BufferGeometry(), vs=[], inds=[]; const steps=8;
    for(let j=0;j<=steps;j++){const t=j/steps,w=.023*Math.pow(Math.sin(Math.PI*t),.85); for(const side of [-1,1])vs.push(side*w,t*.085,.004*Math.sin(Math.PI*t));}
    for(let j=0;j<steps;j++){let k=j*2;inds.push(k,k+1,k+2,k+1,k+3,k+2);}
    leaf.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));leaf.setIndex(inds);leaf.computeVertexNormals();
    const count=6*32, leaves=new THREE.InstancedMesh(leaf,new THREE.MeshStandardMaterial({color:0xffffff,roughness:.55,side:THREE.DoubleSide}),count);
    leaves.name='autumn-plant-leaves'; const dummy=new THREE.Object3D();let index=0;
    const green=new THREE.Color('#7f9a45'),orange=new THREE.Color('#c66d2b'),red=new THREE.Color('#922920');
    tips.forEach((tip,i)=>{const a=i*Math.PI*2/6+.18; for(let j=0;j<32;j++){
      const upper=j<12, theta=(j%12)*Math.PI/6+a+.12*i;
      const origin=upper?tip.clone():base.clone().lerp(tip,.20+(j-12)*.038);
      if(!upper){origin.x+=.012*Math.cos(theta);origin.z+=.012*Math.sin(theta);}
      const direction=new THREE.Vector3(Math.cos(theta)*.88,upper?.45:.5,Math.sin(theta)*.88).normalize();
      dummy.position.copy(origin);dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction);
      dummy.rotateY((i*7+j)*.31);const size=.88+((i*11+j*7)%9)*.04;dummy.scale.set(size,size,size);dummy.updateMatrix();leaves.setMatrixAt(index,dummy.matrix);
      const c=(upper?(j%3===0?orange:red):(j%3===0?orange:green)).clone();c.multiplyScalar(.86+((i*13+j*5)%7)*.025);leaves.setColorAt(index,c);index++;
    }});
    leaves.computeBoundingBox();leaves.computeBoundingSphere();group.add(leaves);
    // Three quiet cream-gold buds at the centres of separate leaf rosettes.
    const buds=new THREE.InstancedMesh(new THREE.SphereGeometry(.008,10,7),new THREE.MeshStandardMaterial({color:0xd6b77d,roughness:.73}),3);
    buds.name="autumn-plant-buds";
    [0,2,4].forEach((tipIndex,i)=>{const tip=tips[tipIndex];dummy.position.set(tip.x,tip.y+.022,tip.z);dummy.quaternion.identity();dummy.scale.set(1,1.15,1);dummy.updateMatrix();buds.setMatrixAt(i,dummy.matrix);});
    buds.computeBoundingBox();buds.computeBoundingSphere();group.add(buds);
    const shadowTex=canvasTex(128,128,(ctx,w,h)=>{const g=ctx.createRadialGradient(w/2,h/2,w*.08,w/2,h/2,w*.49);g.addColorStop(0,'rgba(30,22,14,.30)');g.addColorStop(1,'rgba(30,22,14,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);});
    const shade=addPlantPart(new THREE.PlaneGeometry(.36,.36),new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false}),"autumn-plant-contact");shade.rotation.x=-Math.PI/2;shade.position.y=.002;shade.castShadow=false;
    scene.add(group);return {group,pot,leaves,buds};
  }
  // Compact umbrella stand by the entrance: a ceramic vessel and one folded umbrella.
  const umbrellaStand = new THREE.Group(); umbrellaStand.name='entry-umbrella-stand'; umbrellaStand.position.set(2.38,0,2.08);
  // Original hand-painted botanical ornament: cobalt, leaf green and warm ochre on ivory.
  const paintedCeramic=canvasTex(512,512,(ctx,w,h)=>{
    ctx.fillStyle='#eee2ca';ctx.fillRect(0,0,w,h);
    for(const y of [42,66,443,466]){ctx.strokeStyle=y===42||y===466?'#365d73':'#ba7854';ctx.lineWidth=y===42||y===466?9:4;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
    for(let j=0;j<4;j++){const x=64+j*128;ctx.strokeStyle='#6c8567';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x,408);ctx.bezierCurveTo(x-16,320,x+18,245,x,125);ctx.stroke();
      for(let k=0;k<4;k++){const y=174+k*59,side=k%2?1:-1;ctx.fillStyle=k%2?'#718e72':'#527b70';ctx.beginPath();ctx.ellipse(x+side*19,y,25,10,side*.55,0,Math.PI*2);ctx.fill();}
      for(const fy of [245,340]){ctx.fillStyle=fy===245?'#db9b68':'#91a9bc';for(let petal=0;petal<5;petal++){const t=petal*Math.PI*2/5;ctx.beginPath();ctx.ellipse(x+Math.cos(t)*12,fy+Math.sin(t)*12,10,6,t,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#d2a447';ctx.beginPath();ctx.arc(x,fy,6,0,Math.PI*2);ctx.fill();}
      ctx.fillStyle=j%2?'#cf8b55':'#607e9b';for(let k=0;k<5;k++){const t=k*Math.PI*2/5;ctx.beginPath();ctx.ellipse(x+Math.cos(t)*13,130+Math.sin(t)*13,11,7,t,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#d3aa58';ctx.beginPath();ctx.arc(x,130,6,0,Math.PI*2);ctx.fill();}
  });
  const standMat = new THREE.MeshStandardMaterial({map:paintedCeramic,color:0xffffff,roughness:.63});
  const darkStand = new THREE.MeshStandardMaterial({color:0x665a4e,roughness:1,side:THREE.DoubleSide});
  const standProfile=[[0,0],[.060,0],[.068,.01],[.078,.04],[.085,.11],[.080,.17],[.085,.195],[.090,.205],[.077,.205],[.071,.19],[.067,.17],[.063,.02],[0,.02]].map(([x,y])=>new THREE.Vector2(x,y));
  const vesselGeometry=new THREE.LatheGeometry(standProfile,48); const vp=vesselGeometry.attributes.position; for(let i=0;i<vp.count;i++){const x=vp.getX(i),z=vp.getZ(i),y=vp.getY(i);if(y>.015 && y<.19){const f=1+.035*Math.cos(Math.atan2(z,x)*12);vp.setX(i,x*f);vp.setZ(i,z*f);}} vesselGeometry.computeVertexNormals();
  const vessel=new THREE.Mesh(vesselGeometry,standMat);vessel.castShadow=true;vessel.receiveShadow=true;umbrellaStand.add(vessel);
  const umbrella=new THREE.Group(); umbrella.rotation.z=.08;umbrella.position.set(0,.025,0);umbrellaStand.add(umbrella);
  // Paul 2026-11-21 (with his own photos): a compact folding umbrella, not a long straight one. A dusty-pink canopy gathered into a fat, crumpled tube with a seam down it and a blunt closed end, a black
  // cylindrical handle with a small silver auto-open button on its side, and a black webbing wrist loop; it stands handle up in the stand, the handle showing above the rim.
  const buildFoldingUmbrella = (umbrella, { hex, seam: seamHex, R, LEN }) => { // R: the tube's radius; LEN: its length; about 6 cm of the canopy shows above the rim
    {
    const profile = []; for (let i = 0; i <= 36; i++) { const t = i / 36, y = t * LEN; let r = R * (.9 + .1 * Math.sin(Math.PI * Math.min(1, t * 3))); if (t > .8) r *= 1 - .45 * Math.pow((t - .8) / .2, 1.6); if (t < .06) r *= .55 + .45 * Math.sin(Math.PI / 2 * t / .06); profile.push(new THREE.Vector2(Math.max(.004, r), y)); }
    const lathe = new THREE.LatheGeometry(profile, 56), pos = lathe.attributes.position;
    for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i), y = pos.getY(i), a = Math.atan2(z, x), t = y / LEN; const f = 1 + .055 * Math.sin(3 * a + 4 * t) + .04 * Math.sin(5 * a - 7 * t + 1.3) + .03 * Math.sin(8 * a + 11 * t) + .025 * Math.sin(2 * a + 17 * t); pos.setX(i, x * f); pos.setZ(i, z * f); }
    lathe.computeVertexNormals();
    const fabric = new THREE.MeshStandardMaterial({ color: hex, roughness: .72, side: THREE.DoubleSide });
    const canopy = new THREE.Mesh(lathe, fabric); canopy.castShadow = true; umbrella.add(canopy);
    const seam = new THREE.Mesh(new THREE.BoxGeometry(.0014, LEN * .86, .003), new THREE.MeshStandardMaterial({ color: seamHex, roughness: .8 })); seam.position.set(R * .98, LEN * .46, 0); umbrella.add(seam);
    const black = new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: .62, metalness: .1 });
    const handleH = .12, handle = new THREE.Mesh(new THREE.CylinderGeometry(.0185, .0185, handleH, 36), black); handle.position.y = LEN + handleH / 2 - .012; handle.castShadow = true; umbrella.add(handle);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(.0185, 24, 8, 0, Math.PI * 2, 0, Math.PI / 2), black); cap.position.y = LEN + handleH - .012; cap.scale.y = .25; umbrella.add(cap);
    const button = new THREE.Mesh(new THREE.BoxGeometry(.011, .026, .006), new THREE.MeshStandardMaterial({ color: 0xcfd3d7, roughness: .3, metalness: .5 })); button.position.set(0, LEN + .02, .0195); umbrella.add(button);
    // the wrist strap: a flat black webbing loop that leaves the handle's top edge and hangs down along it, narrow and long, with a small twist, the way it lies when nobody holds it
    const top = LEN + handleH - .012, loopPath = new THREE.CatmullRomCurve3([new THREE.Vector3(-.0125, top - .006, .0135), new THREE.Vector3(-.026, top - .004, .022), new THREE.Vector3(-.031, top - .026, .026), new THREE.Vector3(-.028, top - .055, .024), new THREE.Vector3(-.0235, top - .078, .018), new THREE.Vector3(-.0185, top - .06, .0145), new THREE.Vector3(-.0175, top - .035, .0135)], true);
    const loopGeo = new THREE.TubeGeometry(loopPath, 48, .0026, 6, true); { const lp = loopGeo.attributes.position; for (let i = 0; i < lp.count; i++) { const k = loopPath.getUtoTmapping ? 0 : 0; } }
    const loop = new THREE.Mesh(loopGeo, new THREE.MeshStandardMaterial({ color: 0x17181c, roughness: .9 })); loop.scale.set(1, 1, 1); umbrella.add(loop);
    }
  };
  buildFoldingUmbrella(umbrella, { hex: 0xb06b79, seam: 0x935664, R: .027, LEN: .27 }); // dusty pink, leaning to the left
  umbrella.rotation.order = "ZYX"; umbrella.rotation.set(0, .6, .065); umbrella.position.set(-.029, .025, .003);
  const umbrella2 = new THREE.Group(); umbrellaStand.add(umbrella2); // the second one, slate blue and a little shorter, leaning to the right
  buildFoldingUmbrella(umbrella2, { hex: 0x3f527c, seam: 0x2d3b5c, R: .027, LEN: .235 });
  umbrella2.rotation.order = "ZYX"; umbrella2.rotation.set(0, 3.5, -.07); umbrella2.position.set(.029, .025, -.004);
  scene.add(umbrellaStand);
  buildHallStand();
  buildSuitcase();
  const renewalCouplet = buildRenewalCouplet();
  const autumnPlant = buildAutumnPlant();
  // Reuse the original Room 02 procedural backpack; optional loading must not block the room.
  let casualBackpack = null, casualBackpackError = null;
  loader.loadAsync(new URL("./bedroom/models/campus-backpack-v2.glb", import.meta.url).href).then((asset) => {
    const bag=place(asset,{height:.42,x:2.18,z:-.025});
    bag.rotation.y=-Math.PI/2 + .10; bag.updateMatrixWorld(true);
    const b=new THREE.Box3().setFromObject(bag); const c=b.getCenter(new THREE.Vector3());
    bag.position.add(new THREE.Vector3(2.18-c.x,-b.min.y,-.025-c.z));
    const palette={body:'#a86070',strap:'#714b50',zip:'#b99d80',base:'#70494c'};
    // The source has four untextured materials. Bake their colours and local transforms into
    // one mesh so the backpack keeps its palette without four separate draw calls.
    bag.updateMatrixWorld(true); const inverse=bag.matrixWorld.clone().invert(), parts=[];
    bag.traverse(o=>{if(!o.isMesh)return;const geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();
      geo.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,o.matrixWorld));
      if (o.material.name === 'body') { const p=geo.attributes.position; geo.computeBoundingBox(); const box=geo.boundingBox, h=Math.max(.001,box.max.y-box.min.y); for(let i=0;i<p.count;i++){const t=(p.getY(i)-box.min.y)/h; p.setX(i,p.getX(i)+.012*Math.sin(Math.PI*t));} p.needsUpdate=true; geo.computeVertexNormals(); }
      const col=new THREE.Color(palette[o.material.name] || '#bb566c'), values=new Float32Array(geo.attributes.position.count*3);
      // Subtle uneven fading and darker lower fabric give the bag a lived-in cloth finish.
      geo.computeBoundingBox(); const pos=geo.attributes.position, bounds=geo.boundingBox;
      for(let i=0;i<pos.count;i++) {
        const x=pos.getX(i), y=pos.getY(i), z=pos.getZ(i);
        const height=(y-bounds.min.y)/Math.max(bounds.max.y-bounds.min.y,.001);
        const variation=o.material.name==='body' ? .91 + .075*height + .022*Math.sin(x*27+z*19)*Math.sin(y*31) : .96;
        values[i*3]=col.r*variation; values[i*3+1]=col.g*variation; values[i*3+2]=col.b*variation;
      }
      geo.setAttribute('color',new THREE.BufferAttribute(values,3));parts.push(geo);
    });
    // Fine cross-woven texture is evaluated in local space, avoiding extra image downloads.
    const bagMaterial = new THREE.MeshStandardMaterial({vertexColors:true,roughness:1});
    bagMaterial.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vBagLocal;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvBagLocal = position;');
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vBagLocal;').replace('#include <color_fragment>', '#include <color_fragment>\nfloat weave = sin(vBagLocal.y * 190.0) * sin((vBagLocal.x + vBagLocal.z) * 190.0);\ndiffuseColor.rgb *= 0.965 + 0.035 * weave;');
    };
    bagMaterial.customProgramCacheKey = () => 'room01-bag-weave-v1';
    const merged=new THREE.Mesh(softMerge(parts),bagMaterial);
    merged.name='room01-backpack-mesh';merged.castShadow=true;merged.receiveShadow=true;bag.clear();bag.add(merged);
    bag.name='room01-casual-backpack';scene.add(bag);casualBackpack=bag;
    // A small fabric bear charm hangs from the bag, facing into the room.
    const charm = new THREE.Group(); charm.name = 'backpack-bear-charm';
    const cloth = new THREE.MeshStandardMaterial({color:0xeac5a8,roughness:1});
    const dark = new THREE.MeshStandardMaterial({color:0x513c38,roughness:1});
    function charmPart(r,x,y,z,mat=cloth) { const o=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),mat);o.position.set(x,y,z);charm.add(o); }
    charmPart(.025,0,0,0); charmPart(.020,0,.036,0); charmPart(.009,0,.052,-.014); charmPart(.009,0,.052,.014);
    charmPart(.010,0,-.024,-.016); charmPart(.010,0,-.024,.016); charmPart(.003,-.019,.039,-.007,dark); charmPart(.003,-.019,.039,.007,dark);
    const cord=new THREE.Mesh(new THREE.CylinderGeometry(.0015,.0015,.035,6),dark);cord.position.set(0,.076,0);charm.add(cord);
    charm.position.set(1.96,.29,-.015);scene.add(charm);
    const tex=canvasTex(128,128,(ctx,w,h)=>{const g=ctx.createRadialGradient(w/2,h/2,w*.06,w/2,h/2,w*.48);g.addColorStop(0,'rgba(24,18,16,.42)');g.addColorStop(1,'rgba(24,18,16,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);});
    const shadow=new THREE.Mesh(new THREE.PlaneGeometry(.42,.38),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));shadow.name='room01-backpack-contact';shadow.rotation.x=-Math.PI/2;shadow.position.set(2.18,.0025,-.025);scene.add(shadow);render();
  }).catch(e=>{casualBackpackError=String(e);console.warn('Optional backpack unavailable',e);});
  // Paul 2026-11-18: the floor under the 福杯滿溢 scroll and the home board was empty. A second copy of Room 02's campus backpack (the same model, 1.15x its
  // 46 cm, so about 53 cm tall) stands there, back to the left wall, front to the room, set on the floor by its measured lowest point (0.5 mm in) and its back
  // 2 mm off the skirting face, in a cobalt-and-cream colourway since 2026-11-22 (it was mustard and olive; Room 02's is navy, the bag by the door is rose). A small mint bear charm hangs on its front,
  // touching the fabric. The bag is one vertex-coloured mesh; the charm another.
  let wallBackpack = null, wallBackpackError = null;
  loader.loadAsync(new URL("./bedroom/models/campus-backpack-v2.glb", import.meta.url).href).then((asset) => {
    const bag = asset.scene, S = 1.15, palette = { body: "#3d63b8", strap: "#ece4d2", zip: "#f2c14e", base: "#2b3f78" }; // Paul 2026-11-22: the room already has plenty of browns and tans, so this bag turns cobalt blue (a 2026 colour in Taiwan, East Asia and the US), cream straps, butter-yellow zips; it echoes the blue stripes of the rug
    bag.scale.setScalar(S); bag.rotation.y = Math.PI / 2 - .12; bag.updateMatrixWorld(true);
    const inverse = new THREE.Matrix4(), parts = [];
    bag.traverse((o) => { if (!o.isMesh) return; const geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); geo.applyMatrix4(o.matrixWorld);
      const col = new THREE.Color(palette[o.material.name] || palette.body), n = geo.attributes.position.count, values = new Float32Array(n * 3);
      geo.computeBoundingBox(); const bb = geo.boundingBox;
      for (let i = 0; i < n; i++) { const t = (geo.attributes.position.getY(i) - bb.min.y) / Math.max(.001, bb.max.y - bb.min.y), k = o.material.name === "body" ? .9 + .08 * t : .96; values[i * 3] = col.r * k; values[i * 3 + 1] = col.g * k; values[i * 3 + 2] = col.b * k; }
      geo.setAttribute("color", new THREE.BufferAttribute(values, 3)); for (const key of Object.keys(geo.attributes)) if (key !== "position" && key !== "normal" && key !== "color") geo.deleteAttribute(key); parts.push(geo); });
    const merged = mergeGeometries(parts, false); merged.computeBoundingBox();
    const b = merged.boundingBox, cz = -.175; // Paul 2026-11-21: 3.5 cm from the coffee stool (it was at -.36), to leave room for the moving box under the paintings
    merged.translate(-W / 2 + .02 + .002 - b.min.x, -b.min.y - .0005, cz - (b.min.z + b.max.z) / 2);
    const mesh = new THREE.Mesh(merged, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .95 }));
    mesh.name = "room01-wall-backpack"; mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh); wallBackpack = mesh;
    // the charm: raycast the bag's front at 60% of its height, and hang the bear so its body just meets the fabric
    merged.computeBoundingBox(); const box = merged.boundingBox, hy = box.min.y + (box.max.y - box.min.y) * .6, hz = cz + .03;
    const hit = new THREE.Raycaster(new THREE.Vector3(box.max.x + .5, hy, hz), new THREE.Vector3(-1, 0, 0)).intersectObject(mesh, false)[0];
    const charm = new THREE.Group(); charm.name = "room01-wall-backpack-charm";
    const cloth = new THREE.MeshStandardMaterial({ color: 0x9fd1bf, roughness: 1 }), dark = new THREE.MeshStandardMaterial({ color: 0x3e4a44, roughness: 1 });
    const part = (r, x, y, z, mat = cloth) => { const o = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), mat); o.position.set(x, y, z); charm.add(o); };
    part(.025, 0, 0, 0); part(.020, 0, .036, 0); part(.009, 0, .052, -.014); part(.009, 0, .052, .014); part(.010, 0, -.024, -.016); part(.010, 0, -.024, .016);
    part(.003, .019, .039, -.007, dark); part(.003, .019, .039, .007, dark);
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(.0015, .0015, .035, 6), dark); cord.position.set(-.012, .072, 0); cord.rotation.z = .35; charm.add(cord);
    charm.position.set((hit ? hit.point.x : box.max.x) + .025 - .001, hy - .06, hz); scene.add(charm); // the bear's 25 mm body 1 mm into the fabric; the cord leans back to the bag
  }).catch((e) => { wallBackpackError = String(e); console.warn("Optional backpack unavailable", e); });
  // The big-leaf plant's pot had no soil (Paul 2026-11-18), the same fix as Room 02's: a soil disc 8 mm below the lip (lip about y 0.38, outer radius about 0.23 around
  // (-2.336, -1.725), measured on the model) with a little colour noise and six pebbles; one vertex-coloured mesh.
  { const soilParts = [], soilColor = new THREE.Color(), SOIL = { x: -2.336, z: -1.725, y: .372, r: .198 };
    const tint = (geo, pick) => { const n = geo.attributes.position.count, arr = new Float32Array(n * 3); for (let i = 0; i < n; i++) pick(i).toArray(arr, i * 3); geo.setAttribute("color", new THREE.Float32BufferAttribute(arr, 3)); return geo; };
    let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const disc = new THREE.RingGeometry(0, SOIL.r, 32, 4).rotateX(-Math.PI / 2); disc.deleteAttribute("uv");
    soilParts.push(tint(disc, () => soilColor.set("#3b2a1e").offsetHSL(0, 0, (rnd() - .5) * .06)).translate(SOIL.x, SOIL.y, SOIL.z));
    for (let i = 0; i < 6; i++) { const a = i * 1.9 + .4, d = .07 + (i % 3) * .035, pr = .008 + (i % 2) * .003;
      const pebble = new THREE.SphereGeometry(pr, 6, 4).scale(1.2, .55, 1).translate(SOIL.x + Math.cos(a) * d, SOIL.y + pr * .3, SOIL.z + Math.sin(a) * d);
      pebble.deleteAttribute("uv"); soilParts.push(tint(pebble, () => soilColor.set(i % 2 ? "#a49a8c" : "#cfc6b8"))); }
    const soil = new THREE.Mesh(mergeGeometries(soilParts, false), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
    soil.name = "room01-plant-soil"; soil.receiveShadow = true; scene.add(soil); }

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
      return { meshes, vertices, triangles, drawCalls: renderer.info.render.calls, robotLoaded: robotObj.children.length > 0 }; // drawCalls: the last rendered frame (QA, for the Room 01 ledger)
    },
    setLang(l) { state.lang = l; showBoardLanguage(l); renderer.domElement.setAttribute("aria-label", TEXT[l].canvas); if (!robotBubble.hidden) robotBubble.querySelector("[data-bubble-copy]").textContent = bubbleTarget === guidePivot ? GUIDE_LINE[l] : robotCustomLine ? (robotCustomLine[l] || robotCustomLine.zh) : ROBOT_MOOD_LINES[state.mood][l]; showDirectorStop(); drawPanel(); },
    set(k, v) { choose(k, v); }, // used by tests
    musicState: () => roomMusic.state(), musicNext: () => roomMusic.next(), musicTracks: () => roomMusic.tracks(), tapRecordPlayer: () => { recordFound = true; recordRing.hidden = true; return toggleMusic(true); }, recordRingInfo: () => { placeRecordRing(); return { visible: !recordRing.hidden, found: recordFound, w: recordRing.offsetWidth }; }, recordCard: () => ({ shown: !robotBubble.hidden && bubbleTarget === sideboard.recordPlayer.group, text: robotBubble.querySelector("[data-bubble-copy]").textContent, cover: robotBubble.querySelector("[data-cover]")?.hidden === false ? robotBubble.querySelector("[data-cover]").src : null }), playMusic: () => toggleMusic(), stopMusic: () => { roomMusic.stop(); clearTimeout(musicTimer); },
    speakerScreen() { const g = scene.getObjectByName("tv-wall-speakers"); if (!g) return null; scene.updateMatrixWorld(true); camera.updateMatrixWorld(); const r = renderer.domElement.getBoundingClientRect(), c = g.localToWorld(g.userData.unitBoxes[0].getCenter(new THREE.Vector3())).project(camera); return { x: r.left + ((c.x + 1) / 2) * r.width, y: r.top + ((1 - c.y) / 2) * r.height, front: c.z < 1 }; }, // QA: where the left speaker is on screen
    freezeAmbient(on = true) { ambientFrozen = on; },
    lanternInfo: () => { const globe = scene.getObjectByName("living-room-lantern"); return { fill: fill.position.toArray(), globe: globe ? globe.position.toArray() : null }; }, // QA: the room's fill light must sit at the lantern's centre
    robotPoint() { robotObj.updateWorldMatrix(true, true); camera.updateMatrixWorld(); const r = renderer.domElement.getBoundingClientRect(), c = new THREE.Box3().setFromObject(robotObj).getCenter(new THREE.Vector3()).project(camera); return { x: r.left + ((c.x + 1) / 2) * r.width, y: r.top + ((1 - c.y) / 2) * r.height, front: c.z < 1 }; }, // QA: the window-side robot on screen
    tvScreenPoint() { scene.updateMatrixWorld(true); camera.updateMatrixWorld(); const r = renderer.domElement.getBoundingClientRect(), c = new THREE.Box3().setFromObject(tvScreen).getCenter(new THREE.Vector3()).project(camera); return { x: r.left + ((c.x + 1) / 2) * r.width, y: r.top + ((1 - c.y) / 2) * r.height, front: c.z < 1 }; }, // QA: the TV screen on screen
    wallInfo: () => ({ wall: state.wall, backRepeat: wallMat.map ? wallMat.map.repeat.x : null, backMap: Boolean(wallMat.map), sideMap: Boolean(sideMat.map), entrySideMap: Boolean(entrySideMat.map) }),
    dustState: () => ({ visible: dustPoints.visible, opacity: dustPoints.material.opacity, count: DUST_COUNT, beam: sunBeam.visible }),
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
      const oakBox = bb(sideboard.oak), propBox = bb(sideboard.props).union(bb(sideboard.bottle)).union(bb(sideboard.recordPlayer.group)).union(bb(sideboard.water.glass)), ray = new THREE.Raycaster();
      const topY = (x, z) => { ray.set(new THREE.Vector3(x, 2, z), new THREE.Vector3(0, -1, 0)); return ray.intersectObject(sideboard.oak, false)[0]?.point.y ?? null; };
      const lowest = (geometry, test) => { const p = geometry.attributes.position; let y = Infinity; for (let k = 0; k < p.count; k++) if (test(p.getX(k), p.getZ(k))) y = Math.min(y, p.getY(k)); return y; };
      const g = sideboard.props.geometry;
      const mugBase = lowest(g, (x, z) => Math.hypot(x - sideboard.mugAt.x, z - sideboard.mugAt.z) < sideboard.mugRadius + .001);
      const packBase = new THREE.Box3().setFromObject(sideboard.pack).min.y; // the pack now stands on the coffee table (Paul 2026-11-18)
      const mm = (v) => Number((v * 1000).toFixed(2));
      const bottleBox = new THREE.Box3().setFromObject(sideboard.bottle, true), // precise: the bottle is turned to face the record view
        bottleBase = bottleBox.min.y;
      // Horizontal clearances from the bottle's cap circle (30 mm) to the mug (body 40 mm + handle) and to the pack's footprint box.
      const propPts = sideboard.props.geometry.attributes.position;
      let mugGap = Infinity, packGap = Infinity;
      for (let k = 0; k < propPts.count; k++) {
        const x = propPts.getX(k), z = propPts.getZ(k), dist = Math.hypot(x - sideboard.bottleAt.x, z - sideboard.bottleAt.z) - .0306;
        if (Math.hypot(x - sideboard.mugAt.x, z - sideboard.mugAt.z) < .09) mugGap = Math.min(mugGap, dist); else packGap = Math.min(packGap, dist);
      }
      { const rb = bb(sideboard.recordPlayer.group); packGap = Math.min(packGap, Math.max(rb.min.z - sideboard.bottleAt.z, sideboard.bottleAt.z - rb.max.z) - .0306); } // the pack moved to the coffee table; the record player is now the bottle's far neighbour
      const paintingBottom = leftWallArtPlace.y - leftPaintSize.h / 2 - leftFrameMargin / 2;
      const stand = standGroup ? bb(standGroup) : null;
      return {
        bounds: { min: oakBox.min.toArray(), max: oakBox.max.toArray() }, props: { min: propBox.min.toArray(), max: propBox.max.toArray() },
        floorEmbedMm: mm(-oakBox.min.y), plasterEmbedMm: mm(S.wallX - oakBox.min.x), carcassToSkirtingMm: mm(S.backX - (S.wallX + .02)),
        heightMm: mm(oakBox.max.y), lengthMm: mm(oakBox.max.z - oakBox.min.z), depthMm: mm(oakBox.max.x - S.wallX),
        mugSeatMm: mm(mugBase - topY(sideboard.mugAt.x, sideboard.mugAt.z)), packSeatMm: mm(packBase - (sideboard.packSpot ? sideboard.packSpot.y : topY(sideboard.packAt.x, sideboard.packAt.z))),
        bottleSeatMm: mm(bottleBase - topY(sideboard.bottleAt.x, sideboard.bottleAt.z)), bottleSizeMm: [mm(bottleBox.max.x - bottleBox.min.x), mm(bottleBox.max.y - bottleBox.min.y)], bottleMugGapMm: mm(mugGap), bottlePackGapMm: mm(packGap),
        pulls: { color: `#${sideboard.pulls.material.color.getHexString()}`, metalness: sideboard.pulls.material.metalness, roughness: sideboard.pulls.material.roughness },
        propsInsideTop: propBox.min.x > oakBox.min.x && propBox.max.x < oakBox.max.x && propBox.min.z > oakBox.min.z && propBox.max.z < oakBox.max.z,
        paintingClearMm: mm(paintingBottom - Math.max(oakBox.max.y, propBox.max.y)), paintingBottomY: paintingBottom,
        standClearMm: stand ? mm(stand.min.z - Math.max(oakBox.max.z, propBox.max.z)) : null,
        meshes: [sideboard.oak, sideboard.pulls, sideboard.props, sideboard.bottle].filter((m) => m.parent).length,
        vertices: [sideboard.oak, sideboard.pulls, sideboard.props, sideboard.bottle].reduce((n, m) => n + m.geometry.attributes.position.count, 0),
      };
    },
    recordView: () => { moveToView("record"); return currentView; },
    doorView: () => { moveToView("door"); return currentView; },
    sofaThreadFix: () => window.__sofaThreadFix,
    debugSofa(mode) { sofaObj.traverse((m) => { if (!m.isMesh) return; if (mode === 'noReceive') m.receiveShadow = false; if (mode === 'noCast') m.castShadow = false; if (mode === 'basic') m.material = new THREE.MeshBasicMaterial({ vertexColors: true }); }); render(); },
    sofaThreads(minEdge = .03, maxArea = .0004) { // QA: long, thin triangles in the sofa model (the 'threads' seen on the backrest top and seams)
      sofaObj.updateMatrixWorld(true); const out = { meshes: 0, tris: 0, thin: 0, byHeight: {}, worst: [] }; const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3();
      sofaObj.traverse((m) => { if (!m.isMesh) return; out.meshes++; const g = m.geometry, pos = g.attributes.position, idx = g.index ? g.index.array : null, n = idx ? idx.length : pos.count;
        for (let i = 0; i < n; i += 3) { const ia = idx ? idx[i] : i, ib = idx ? idx[i + 1] : i + 1, ic = idx ? idx[i + 2] : i + 2; A.fromBufferAttribute(pos, ia).applyMatrix4(m.matrixWorld); B.fromBufferAttribute(pos, ib).applyMatrix4(m.matrixWorld); C.fromBufferAttribute(pos, ic).applyMatrix4(m.matrixWorld);
          out.tris++; const e = Math.max(A.distanceTo(B), B.distanceTo(C), C.distanceTo(A)), area = new THREE.Triangle(A, B, C).getArea();
          if (e > minEdge && area < maxArea * (e / minEdge) * .35) { out.thin++; const k = (Math.round(A.y * 10) / 10).toFixed(1); out.byHeight[k] = (out.byHeight[k] || 0) + 1; if (out.worst.length < 5) out.worst.push([+e.toFixed(3), +area.toFixed(5), +A.y.toFixed(2)]); } } });
      return out; },
    doorSweep() { // QA: from the doorway eye, turn the head to each end of its allowed range (and look as far down as it allows) and say whether the umbrella stand is in the frame
      const eye = DOOR_EYE.clone(), base = doorShot(), d0 = base.focus.clone().sub(eye).normalize(), yaw0 = Math.atan2(d0.x, d0.z), pitch0 = Math.asin(d0.y), box = new THREE.Box3().setFromObject(umbrellaStand), out = {};
      const saved = { p: camera.position.clone(), q: camera.quaternion.clone(), f: camera.fov }; camera.fov = doorFov(); camera.updateProjectionMatrix();
      const half = (controls.maxAzimuthAngle - controls.minAzimuthAngle) / 2, down = controls.maxPolarAngle - controls.minPolarAngle > 0 ? Math.max(0, DOOR_DOWN) : 0;
      for (const [name, turn, dp] of [["centre", 0, 0], ["leftEnd", half, 0], ["rightEnd", -half, 0], ["leftEndDown", half, -down], ["rightEndDown", -half, -down], ["centreDown", 0, -down]]) {
        const y = yaw0 + turn, pc = pitch0 + dp; camera.position.copy(eye); camera.lookAt(eye.clone().add(new THREE.Vector3(Math.sin(y) * Math.cos(pc), Math.sin(pc), Math.cos(y) * Math.cos(pc)))); camera.updateMatrixWorld(true);
        out[name] = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)).intersectsBox(box); }
      camera.position.copy(saved.p); camera.quaternion.copy(saved.q); camera.fov = saved.f; camera.updateProjectionMatrix(); camera.updateMatrixWorld(true); return { ...out, halfRangeDeg: Math.round(half * 180 / Math.PI), downDeg: Math.round(down * 180 / Math.PI), fov: doorFov() }; },
    coffeeStoolFit() { if (!scene.getObjectByName('room01-wall-backpack')) return null; const bx = (o) => new THREE.Box3().setFromObject(o), mm = (v) => Math.round(v * 1000), s = bx(PROPS.coffeeStool).union(bx(PROPS.coffeeStoolPouf)), bag = bx(scene.getObjectByName('room01-wall-backpack')), oak = bx(sideboard.oak), info = PROPS.coffeeStoolInfo; const gapZ = (a, b) => Math.max(a.min.z - b.max.z, b.min.z - a.max.z); return { floorMm: mm(s.min.y), topM: +s.max.y.toFixed(3), wallGapMm: mm(s.min.x - (-W / 2)), toSideboardMm: mm(gapZ(s, oak)), toBagMm: mm(gapZ(s, bag)), info }; },
    nightInfo: () => ({ popcorn: PROPS.popcorn.visible, night: PROPS.night.visible, popcornReady: !!PROPS.popcorn.userData.ready }),
    phoneFit() { const b = new THREE.Box3().setFromObject(PROPS.phone), m = (v) => Math.round(v * 1000), side = new THREE.Box3().setFromObject(tableObj), others = { lamp: tableLampObj, mug: PROPS.mug, notebook: PROPS.notebook, coaster: PROPS.sideTable.coaster }, gaps = {}; for (const [k, o] of Object.entries(others)) { const ob = new THREE.Box3().setFromObject(o); if (k === 'lamp') { /* the shade overhangs the table, the phone lies under it: judge by the lamp's foot (111 mm radius) */ const lc = ob.getCenter(new THREE.Vector3()), dx = Math.max(b.min.x - lc.x, 0, lc.x - b.max.x), dz = Math.max(b.min.z - lc.z, 0, lc.z - b.max.z); gaps[k] = m(Math.hypot(dx, dz) - .111); continue; } gaps[k] = ob.intersectsBox(b) ? -1 : m(Math.max(ob.min.x - b.max.x, b.min.x - ob.max.x, ob.min.z - b.max.z, b.min.z - ob.max.z)); } const cx = (b.min.x + b.max.x) / 2, cz = (b.min.z + b.max.z) / 2; return { seatMm: m(b.min.y - sideTop), radialMm: m(Math.max(Math.hypot(b.min.x - TX, b.min.z - TZ), Math.hypot(b.max.x - TX, b.max.z - TZ), Math.hypot(b.min.x - TX, b.max.z - TZ), Math.hypot(b.max.x - TX, b.min.z - TZ))), tableRadiusMm: 330, gaps, at: [+cx.toFixed(3), +cz.toFixed(3)] }; },
    sconceInfo: () => ({ x: SCONCE.x, y: SCONCE.y, z: SCONCE.z, globeX: SCONCE.globeX, glow: +sconceMat.emissiveIntensity.toFixed(2), halo: +sconceHalo.material.opacity.toFixed(2) }),
    wallItems() { scene.updateMatrixWorld(true); const out = []; scene.children.forEach((o) => { const b = new THREE.Box3().setFromObject(o); if (b.isEmpty()) return; const c = b.getCenter(new THREE.Vector3()); if (c.y > .2 && c.y < 2.6 && b.min.x < -2.3 && b.max.x < -2.0) out.push([o.name || o.type, b.min.toArray().map((v) => +v.toFixed(2)), b.max.toArray().map((v) => +v.toFixed(2))]); }); return out; },
    movingBoxFit() { if (!movingBoxHolder.group) return null; const b = new THREE.Box3().setFromObject(movingBoxHolder.group), m = (v) => Math.round(v * 1000), soilObj = scene.getObjectByName('room01-plant-soil'), bagObj = scene.getObjectByName('room01-wall-backpack'); if (!soilObj || !bagObj) return null; /* both load a little after the room */ const plant = new THREE.Box3().setFromObject(soilObj), bag = new THREE.Box3().setFromObject(bagObj), gz = (a, c) => Math.max(a.min.z - c.max.z, c.min.z - a.max.z); return { floorMm: m(b.min.y), wallGapMm: m(b.min.x - (-W / 2)), heightMm: m(b.max.y - b.min.y), toPlantMm: m(gz(b, plant)), toBagMm: m(gz(b, bag)), z: [+b.min.z.toFixed(2), +b.max.z.toFixed(2)], x: [+b.min.x.toFixed(3), +b.max.x.toFixed(3)] }; },
    entryShoes: () => PROPS.shoesInfo || null,
    entryShoeMaterials: () => { const out = []; PROPS.shoes.traverse((o) => { if (o.isMesh) { const m = o.material; out.push({ name: m.name, color: m.color.getHexString(), emissive: m.emissive?.getHexString(), emissiveIntensity: m.emissiveIntensity, map: !!m.map, vertexColors: m.vertexColors, rough: m.roughness, metal: m.metalness, attrs: Object.keys(o.geometry.attributes) }); } }); return out; },
    tapKeycard: (opts) => tapKeycard(opts),
    lockLed: () => { const m = roomDoor.getObjectByName("door-lock-led").material; return { emissive: m.emissive.getHexString(), intensity: m.emissiveIntensity }; },
    entryFit() { const bx = (o) => new THREE.Box3().setFromObject(o), mm = (v) => Math.round(v * 1000), mat = bx(PROPS.doormat), shoes = PROPS.shoes ? bx(PROPS.shoes) : null, rail = bx(scene.getObjectByName("entry-hook-rail")), stand = bx(umbrellaStand.children[0]), frameZ = doorZ + doorOuterWidth / 2, wall = W / 2; const ovXZ = (a, b) => a.min.x < b.max.x && a.max.x > b.min.x && a.min.z < b.max.z && a.max.z > b.min.z; return { matSeatMm: mm(mat.min.y), matThickMm: mm(mat.max.y - mat.min.y), shoesSeatMm: shoes ? mm(shoes.min.y) : null, shoesToStandMm: !shoes ? null : ovXZ(shoes, stand) ? -1 : mm(Math.max(stand.min.z - shoes.max.z, stand.min.x - shoes.max.x, shoes.min.x - stand.max.x)), shoesToFrameMm: shoes ? mm(shoes.min.z - frameZ) : null, shoesToWallMm: shoes ? mm(wall - shoes.max.x) : null, shoesToMatMm: !shoes ? null : ovXZ(shoes, mat) ? -1 : mm(shoes.min.z - mat.max.z), railToWallMm: mm(wall - rail.max.x), railBackMm: mm(rail.max.x - Math.min(rail.max.x, wall)), railToFrameMm: mm(rail.min.z - frameZ), railHeightM: +rail.min.y.toFixed(2) }; },
    doorProbe() { camera.updateMatrixWorld(); const fr = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)); const seen = {}; scene.traverse((o) => { if (o.isMesh && o.visible && /sofa|side-table|floor-lamp|coffee|window|lamp|console/i.test(o.name || "")) { const b = new THREE.Box3().setFromObject(o); (seen[o.name] = fr.intersectsBox(b)); } }); return { view: currentView, fov: camera.fov, eye: camera.position.toArray(), seen }; },
    consoleProbe() { scene.updateMatrixWorld(true); const out = []; const add = (o, n) => { const q = new THREE.Box3().setFromObject(o, true); out.push({ n: n || o.name, min: q.min.toArray().map((v) => +v.toFixed(3)), max: q.max.toArray().map((v) => +v.toFixed(3)) }); }; consoleDecor.children.forEach((c) => add(c)); tvWall.traverse((o) => { if (o.name === "tv-console" || o.name === "tv-laptop") add(o); }); return out; },
    propVerts: () => Object.fromEntries(Object.entries(PROPS).filter(([, o]) => o && o.geometry).map(([k, o]) => [k, o.geometry.attributes.position.count])),
    propFit: () => PROPS.fit(),
    qaLook(p, t, fov) { intro = false; controls.enabled = false; camera.position.set(...p); controls.target.set(...t); camera.fov = fov; camera.updateProjectionMatrix(); camera.lookAt(...t); render(); },
    frameProbe() { // local QA only (2026-11-20): the living-room surfaces the small props stand on
      scene.updateMatrixWorld(true); const bx = (o) => { const q = new THREE.Box3().setFromObject(o, true); return { min: q.min.toArray().map((v) => +v.toFixed(3)), max: q.max.toArray().map((v) => +v.toFixed(3)) }; };
      return { SX, SZ, TX, TZ, sideTable: bx(tableObj), lamp: bx(tableLampObj), coffee: bx(coffeeObj), sofa: bx(sofaObj), rug: { bounds: bx(rug), yaw: rug.rotation.y, centre: rug.position.toArray() }, sideTop, coffeeTop, lampFoot: (() => { const q = new THREE.Box3(), v = new THREE.Vector3(); tableLampObj.traverse((m) => { if (!m.isMesh) return; const pos = m.geometry.attributes.position; for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld); if (v.y < sideTop + .05) q.expandByPoint(v); } }); return { min: q.min.toArray().map((x) => +x.toFixed(3)), max: q.max.toArray().map((x) => +x.toFixed(3)) }; })(), coffeeItems: [laptopObj, mugObj, coffeeBook, sideboard.pack].map((o) => ({ n: o.name, ...bx(o) })) };
    },
    sideboardTopItems() { // local QA only (Paul 2026-11-19): every free-standing thing on the left sideboard top, its seat on the oak and its gap to its nearest neighbour (mm, footprint boxes)
      scene.updateMatrixWorld(true);
      const ray = new THREE.Raycaster(), topY = (x, z) => { ray.set(new THREE.Vector3(x, 2, z), new THREE.Vector3(0, -1, 0)); return ray.intersectObject(sideboard.oak, false)[0]?.point.y ?? null; };
      const items = { mug: sideboard.props, redVitamin: sideboard.bottle, orangeVitamin: scene.getObjectByName("orange-cap-vitamin-body"), water1: sideboard.water.glass, water2: sideboard.water.second.glass, recordPlayer: sideboard.recordPlayer.group, outlet: sideboard.outlet };
      const boxes = Object.fromEntries(Object.entries(items).map(([k, o]) => [k, new THREE.Box3().setFromObject(o, true)])); // precise: the turned bottles' loose boxes would grow by their rotation
      { const rb = sideboard.recordPlayer.info().bounds; boxes.recordPlayer = new THREE.Box3(new THREE.Vector3(...rb.min), new THREE.Vector3(...rb.max)); } // the deck itself, not its invisible tap target
      boxes.orangeVitamin.union(new THREE.Box3().setFromObject(scene.getObjectByName("orange-cap-vitamin-lid"), true)); // the whole orange bottle, cap included
      const gap = (a, b) => { const dx = Math.max(b.min.x - a.max.x, a.min.x - b.max.x, 0), dz = Math.max(b.min.z - a.max.z, a.min.z - b.max.z, 0); return Math.round(Math.hypot(dx, dz) * 1000); };
      const out = {};
      for (const [k, b] of Object.entries(boxes)) {
        const c = b.getCenter(new THREE.Vector3()), near = Object.entries(boxes).filter(([o]) => o !== k).map(([o, ob]) => [o, gap(b, ob)]).sort((p, q) => p[1] - q[1])[0];
        out[k] = { seatMm: k === "outlet" || k === "recordPlayer" ? null : Math.round((b.min.y - topY(c.x, c.z)) * 10000) / 10, wallGapMm: Math.round((b.min.x - (-W / 2)) * 1000), nearest: near[0], gapMm: near[1], heightMm: Math.round((b.max.y - b.min.y) * 1000), widthMm: Math.round(Math.max(b.max.x - b.min.x, b.max.z - b.min.z) * 1000) };
      }
      out.labels = { // the label bands start with a cream wrap on both waters; the cola is told apart by its tall label, its dark liquid and its dark cap
        water1: `#${new THREE.Color().fromArray(sideboard.water.labelCap.geometry.attributes.color.array, 0).getHexString()}`,
        water2: `#${new THREE.Color().fromArray(sideboard.water.second.labelCap.geometry.attributes.color.array, 0).getHexString()}`,
        labelMm: { water1: sideboard.water.labelMm, water2: sideboard.water.second.labelMm },
        fill: { water1: `#${sideboard.water.fill.material.color.getHexString()}`, water2: `#${sideboard.water.second.water.material.color.getHexString()}` },
        distinctWaterShells: sideboard.water.second.glass.geometry !== sideboard.water.glass.geometry,
      };
      return out;
    },
    recordPlayerDetails() { // local QA only: Room 01's record player on the sideboard and the napkin pack on the coffee table (mm)
      scene.updateMatrixWorld(true);
      const rp = sideboard.recordPlayer, box = new THREE.Box3().setFromObject(rp.group), oakBox = new THREE.Box3().setFromObject(sideboard.oak), packBox = new THREE.Box3().setFromObject(sideboard.pack);
      const ray = new THREE.Raycaster(), down = (obj, x, z) => { ray.set(new THREE.Vector3(x, 2, z), new THREE.Vector3(0, -1, 0)); return ray.intersectObject(obj, true)[0]?.point.y ?? null; };
      const others = [sideboard.props, sideboard.bottle].map((o) => new THREE.Box3().setFromObject(o));
      const mm = (v) => Math.round(v * 10000) / 10;
      const packOverlaps = Object.entries({ laptop: laptopObj, mug: mugObj, book: coffeeBook }).filter(([, o]) => new THREE.Box3().setFromObject(o).intersectsBox(packBox)).map(([k]) => k).concat(soft.propBounds.some((b) => b.intersectsBox(packBox)) ? ["bookStack"] : []);
      return { ...rp.info(), footIntoSideboardMm: mm(down(sideboard.oak, sideboard.recordAt.x, sideboard.recordAt.z) - box.min.y), insideTop: box.min.x > oakBox.min.x && box.max.x < oakBox.max.x && box.min.z > oakBox.min.z && box.max.z < oakBox.max.z,
        cord: (() => { const pts = sideboard.cordCurve.getSpacedPoints(200), oak = new THREE.Box3().setFromObject(sideboard.oak), r = sideboard.cordRadius;
          const overTop = pts.filter((q) => q.x > oak.min.x + .001 && q.z > oak.min.z && q.z < oak.max.z && q.y < sideboard.topY + .05);
          return { lowestAboveTopMm: Math.round((Math.min(...overTop.map((q) => q.y)) - r - sideboard.topY) * 10000) / 10, wallGapMm: Math.round((Math.min(...pts.map((q) => q.x)) - r - (-W / 2)) * 10000) / 10,
            startInsideDeckMm: Math.round((pts[0].x - (sideboard.recordAt.x - .16)) * 10000) / 10, endY: pts[pts.length - 1].y }; })(),
        water: (() => { const wb = new THREE.Box3().setFromObject(sideboard.water.glass), gap = (b) => { const dx = Math.max(b.min.x - wb.max.x, wb.min.x - b.max.x, 0), dz = Math.max(b.min.z - wb.max.z, wb.min.z - b.max.z, 0); return Math.round(Math.hypot(dx, dz) * 1000); };
          return { seatMm: Math.round((wb.min.y - down(sideboard.oak, sideboard.water.at.x, sideboard.water.at.z)) * 10000) / 10, heightMm: Math.round((wb.max.y - wb.min.y) * 1000),
            gapToMugMm: Math.round((Math.hypot(sideboard.water.at.x - sideboard.mugAt.x, sideboard.water.at.z - sideboard.mugAt.z) - sideboard.water.radius - sideboard.mugRadius) * 1000),
            gapToPlayerBoxMm: gap(box), gapToVitaminsMm: Math.min(gap(new THREE.Box3().setFromObject(sideboard.bottle)), gap(new THREE.Box3().setFromObject(scene.getObjectByName("orange-cap-vitamin-body")))),
            hitsMugBox: new THREE.Box3().setFromObject(sideboard.props).intersectsBox(wb) }; })(),
        clearOfOtherProps: !others.some((b) => b.intersectsBox(box)), packOnCoffeeTable: !!sideboard.packSpot, packSeatMm: sideboard.packSpot ? mm(packBox.min.y - sideboard.packSpot.y) : null, packOverlaps, packAt: sideboard.packAt };
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
    pillowFit() { scene.updateMatrixWorld(true); return { build: pillowBuild, ...Object.fromEntries(["sofa-pillow-back-oat", "sofa-pillow-back-blue", "sofa-pillow-green", "sofa-pillow-terracotta"].map((name) => [name, measurePillow(scene.getObjectByName(name))])) }; }, // how the scatter pillows sit on the sofa (mm)
    bakePillowFit() { scene.updateMatrixWorld(true); return bakePillowFit(); }, // QA only: re-runs the pose and shape search that produced PILLOW_FIT
    plantNoteHint: () => ({ shown: plantHintShown, inFrame: plantNoteInFrame(), caption: noteCaption.textContent, visible: noteCaption.style.opacity === "1" }),
    plantNoteInfo() { const c = new THREE.Box3().setFromObject(plantNote).getCenter(new THREE.Vector3()).project(camera); const r = renderer.domElement.getBoundingClientRect(); return { screen: [r.left + ((c.x + 1) / 2) * r.width, r.top + ((1 - c.y) / 2) * r.height], world: plantNote.position.toArray(), sizeMeters: [.16, .13], ndcZ: c.z, caption: noteCaption.textContent, visible: noteCaption.style.opacity === "1" }; }, // note 1/3: its pot placement, size and tap position
    frameSofa(dx = 0, dy = .55, dz = 1.7, fov = 40) { // local QA only: a close view of the sofa to judge cushion edges and fabric
      scene.updateMatrixWorld(true);
      const focus = new THREE.Box3().setFromObject(sofaObj).getCenter(new THREE.Vector3());
      controls.target.copy(focus);
      camera.position.copy(focus).add(new THREE.Vector3(dx, dy, dz));
      camera.lookAt(focus); camera.fov = fov; camera.updateProjectionMatrix(); controls.update(); renderer.render(scene, camera);
      camera.updateMatrixWorld(true);
      return focus.toArray();
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
      const rests = (a, b) => shelfDecor.getObjectByName(a)?.userData.leansOn === b || shelfDecor.getObjectByName(b)?.userData.leansOn === a; // a leaning book touches its support by design; checked exactly below
      const overlaps = boxes.flatMap((a, i) => boxes.slice(i + 1).filter((b) => a.box.intersectsBox(b.box) && !rests(a.name, b.name)).map((b) => [a.name, b.name]));
      const bookOf = (item) => item.children.find((c) => c.isGroup); // the book group inside the placed item (the other child is the contact patch)
      const leans = shelfDecor.children.filter((o) => o.userData.leansOn).map((o) => {
        const on = shelfDecor.getObjectByName(o.userData.leansOn), book = bookOf(o), w = o.userData.bookW, h = o.userData.bookH;
        let contactMm, alongMm;
        if (o.userData.contact === "corner") { // the upright support's top corner must sit on this book's lower cover face
          const sb = new THREE.Box3().setFromObject(bookOf(on)), c = book.worldToLocal(new THREE.Vector3(sb.max.x, sb.max.y, (sb.min.z + sb.max.z) / 2));
          contactMm = (c.x + w / 2) * 1000; alongMm = c.y * 1000;
        } else { // this book's foot corner must lie on the support book's upper cover face
          const sw = on.userData.bookW, f = bookOf(on).worldToLocal(book.localToWorld(new THREE.Vector3(-w / 2, 0, 0)));
          contactMm = (f.x - sw / 2) * 1000; alongMm = f.y * 1000;
        }
        return { name: o.name, on: o.userData.leansOn, leanDeg: o.userData.leanDeg, contactMm, alongMm, heightMm: h * 1000 };
      });
      return { ready: shelfDecorReady, art: shelfArtFile, objects, overlaps, leans };
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
    wallBackpackInfo() { // local QA: the second backpack against the left wall and its charm
      if (!wallBackpack) return { ready: false, error: wallBackpackError };
      scene.updateMatrixWorld(true); const bag = new THREE.Box3().setFromObject(wallBackpack), charm = scene.getObjectByName("room01-wall-backpack-charm"), cb = charm ? new THREE.Box3().setFromObject(charm) : null;
      const hits = Object.entries({ plant: plantObj, board: homeBoard, couplet: scene.getObjectByName("blessing-couplet"), sideboard: sideboard.oak, plaque }).filter(([, o]) => o && new THREE.Box3().setFromObject(o).intersectsBox(bag)).map(([k]) => k);
      return { ready: true, floorGapMm: Math.round(bag.min.y * 10000) / 10, wallGapMm: Math.round((bag.min.x + W / 2) * 10000) / 10, heightMm: Math.round((bag.max.y - bag.min.y) * 1000), hits, charmTouches: !!cb && cb.intersectsBox(bag), charmFloorMm: cb ? Math.round(cb.min.y * 1000) : null };
    },
    casualBackpackInfo() {
      if (!casualBackpack) return {ready:false,error:casualBackpackError};
      scene.updateMatrixWorld(true);const bag=new THREE.Box3().setFromObject(casualBackpack),suit=new THREE.Box3().setFromObject(soft.suitcaseGroup),plant=new THREE.Box3().setFromObject(autumnPlant.group);
      const initial=doorSwing.rotation.y;let doorHits=0;for(let i=0;i<=40;i++){doorSwing.rotation.y=-DOOR_OPEN*i/40;scene.updateMatrixWorld(true);if(new THREE.Box3().setFromObject(doorSwing).intersectsBox(bag))doorHits++;}doorSwing.rotation.y=initial;scene.updateMatrixWorld(true);
      let vertices=0;casualBackpack.traverse(o=>{if(o.isMesh)vertices+=o.geometry.attributes.position.count});
      return {ready:true,bounds:{min:bag.min.toArray(),max:bag.max.toArray()},floorGapMm:bag.min.y*1000,suitcaseHit:bag.intersectsBox(suit),plantHit:bag.intersectsBox(plant),doorHits,vertices};
    },
    autumnPlantInfo() {
      scene.updateMatrixWorld(true);const box=o=>new THREE.Box3().setFromObject(o);const b=box(autumnPlant.group), p=box(autumnPlant.pot);
      const frame=rightWallArtGroup?.getObjectByName('right-wall-frame-0-horizontal');
      const frameGroup=rightWallArtGroup ? new THREE.Box3().setFromObject(frame) : null;
      const checks={suitcase:soft.suitcaseGroup,sideTable:tableObj,doorRobot:guidePivot,sideboard:sideboard.oak};
      const collisions=Object.entries(checks).filter(([,o])=>box(o).intersectsBox(b)).map(([n])=>n);
      const saved=doorSwing.rotation.y;let doorHits=0,suitcaseDoorHits=0;for(let i=0;i<=40;i++){doorSwing.rotation.y=-DOOR_OPEN*i/40;scene.updateMatrixWorld(true);const door=box(doorSwing);if(door.intersectsBox(b))doorHits++;if(door.intersectsBox(box(soft.suitcaseGroup)))suitcaseDoorHits++;}doorSwing.rotation.y=saved;scene.updateMatrixWorld(true);
      return {bounds:{min:b.min.toArray(),max:b.max.toArray()},potBottomMm:p.min.y*1000,heightMm:(b.max.y-p.min.y)*1000,leaves:autumnPlant.leaves.count,buds:autumnPlant.buds.count,collisions,doorHits,suitcaseDoorHits,frameBottomClearMm:frameGroup?(frameGroup.min.y-b.max.y)*1000:null,robotHitsTv:box(guidePivot).intersectsBox(box(scene.getObjectByName("tv-console"))),frameLoaded:!!frame};
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
      const old = ["tv-vase-body", "tv-vase-neck", "tv-book-one", "tv-laptop"].map((name) => {
        const item = scene.getObjectByName(name);
        return item?.visible ? { name, box: new THREE.Box3().setFromObject(item) } : null;
      }).filter(Boolean);
      const bounds = consoleDecor.children.map((obj) => ({ name: obj.name, box: new THREE.Box3().setFromObject(obj) }));
      const speakerPair = consoleDecor.getObjectByName("tv-wall-speakers");
      const speakerBox = speakerPair ? new THREE.Box3().setFromObject(speakerPair) : null;
      const speakerMeshes = [];
      speakerPair?.traverse((obj) => { if (obj.isMesh) speakerMeshes.push(obj); });
      const regularBounds = bounds.filter(({ name }) => name !== "tv-wall-speakers");
      const collisions = regularBounds.flatMap((a, i) => [...old, ...regularBounds.slice(i + 1)].filter((b) => a.box.intersectsBox(b.box)).map((b) => [a.name, b.name]));
      const speakerUnits = speakerPair?.userData.unitBoxes.map((localBox, index) => {
        const box = localBox.clone().applyMatrix4(speakerPair.matrixWorld);
        [...old, ...regularBounds].filter(({ box: other }) => box.intersectsBox(other)).forEach(({ name }) => collisions.push([`tv-wall-speaker-${index ? "right" : "left"}`, name]));
        return { min: box.min.toArray(), max: box.max.toArray(), size: box.getSize(new THREE.Vector3()).toArray() };
      }) ?? [];
      return { ready: consoleDecorLoaded, artLoaded: consoleArtLoaded, artFile: pictureFile(consoleArtTexture), collisions,
        speakers: speakerBox ? { min: speakerBox.min.toArray(), max: speakerBox.max.toArray(), size: speakerBox.getSize(new THREE.Vector3()).toArray(), meshes: speakerMeshes.length,
          units: speakerUnits, vertices: speakerMeshes.reduce((sum, obj) => sum + obj.geometry.attributes.position.count, 0) } : null,
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
    renewalCouplet() {
      scene.updateMatrixWorld(true);
      camera.updateMatrixWorld(true);
      const paperBox = new THREE.Box3().setFromObject(renewalCouplet.paper);
      const suitcaseBox = new THREE.Box3().setFromObject(soft.suitcaseGroup);
      const artBox = rightWallArtGroup ? new THREE.Box3().setFromObject(rightWallArtGroup) : null;
      const corners = [
        new THREE.Vector3(-renewalCouplet.width / 2, -renewalCouplet.height / 2, .005),
        new THREE.Vector3(renewalCouplet.width / 2, -renewalCouplet.height / 2, .005),
        new THREE.Vector3(-renewalCouplet.width / 2, renewalCouplet.height / 2, .005),
        new THREE.Vector3(renewalCouplet.width / 2, renewalCouplet.height / 2, .005),
      ].map((point) => point.applyMatrix4(renewalCouplet.group.matrixWorld).project(camera));
      const rect = {
        x: (Math.min(...corners.map((point) => point.x)) * .5 + .5) * renderer.domElement.clientWidth,
        y: (-Math.max(...corners.map((point) => point.y)) * .5 + .5) * renderer.domElement.clientHeight,
        width: (Math.max(...corners.map((point) => point.x)) - Math.min(...corners.map((point) => point.x))) * .5 * renderer.domElement.clientWidth,
        height: (Math.max(...corners.map((point) => point.y)) - Math.min(...corners.map((point) => point.y))) * .5 * renderer.domElement.clientHeight,
      };
      return {
        text: "重新得力",
        file: renewalCouplet.texture.image?.src?.split("/").pop() ?? null,
        loaded: !!renewalCouplet.texture.image?.width,
        pixels: [renewalCouplet.texture.image?.width ?? 0, renewalCouplet.texture.image?.height ?? 0],
        width: paperBox.max.z - paperBox.min.z,
        height: paperBox.max.y - paperBox.min.y,
        offWall: W / 2 - paperBox.max.x,
        suitcaseGap: paperBox.min.y - suitcaseBox.max.y,
        artGap: artBox ? paperBox.min.z - artBox.max.z : null,
        collisions: [
          ["suitcase", suitcaseBox],
          ...(artBox ? [["harbour-art", artBox]] : []),
        ].filter(([, box]) => paperBox.intersectsBox(box)).map(([name]) => name),
        bounds: { min: paperBox.min.toArray(), max: paperBox.max.toArray() },
        screenRect: rect,
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

// Room 01's record player (Paul 2026-11-18): a copy of Room 03's self-contained turntable (kitchen.js buildRoom03RecordPlayer, same 32 x 42 cm size, gold trim,
// turning platter and swinging arm), set on the left sideboard. A tap on it switches Room 01's music on or off; while the music plays the platter turns.
function buildRoom01RecordPlayer(scene, at) {
  // Built in Room 03's own frame (top at y 0.815, centre at the origin), inside a group that is turned and set down on Room 01's sideboard.
  const C = { x: 0, z: 0, top: 0.815 }, parts = [];
  const group = new THREE.Group(); group.name = "room01-record-player"; group.position.set(at.x, at.top - C.top, at.z); group.rotation.y = at.yaw; scene.add(group);
  const footBoxes = [];
  const add = (geometry, color, into = parts) => {
    const tint = new THREE.Color(color), count = geometry.attributes.position.count;
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) tint.toArray(colors, i * 3);
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    into.push(geometry);
  };
  // Card I (2026-11-18): the platter (with the record, grooves, label and spindle) and the tonearm (tube and stylus) are their own two meshes so they can
  // turn and swing while the music plays; everything else stays in the one merged body. Both share the body's material.
  const platterParts = [], armParts = [];
  // Four feet begin 2.5 mm inside the oak top and run 7.5 mm into the wooden plinth.
  for (const dx of [-0.12, 0.12]) for (const dz of [-0.17, 0.17]) {
    const foot = new THREE.CylinderGeometry(0.011, 0.012, 0.025, 10).translate(C.x + dx, 0.825, C.z + dz);
    foot.computeBoundingBox(); footBoxes.push(foot.boundingBox.clone()); add(foot, 0x272b29);
  }
  const deck = new THREE.BoxGeometry(0.32, 0.028, 0.42).translate(C.x, 0.844, C.z);
  deck.computeBoundingBox(); const deckBox = deck.boundingBox.clone(); add(deck, 0x4a3324); // a deeper walnut than Room 03's, so the close view reads as wood, not a flat tan
  add(new THREE.BoxGeometry(0.314, 0.003, 0.414).translate(C.x, 0.8595, C.z), 0x5a3f2c);
  const platter = { x: C.x, y: 0.864, z: C.z - 0.055, radius: 0.138 };
  add(new THREE.CylinderGeometry(platter.radius, platter.radius, 0.006, 40).translate(platter.x, platter.y, platter.z), 0x34383a, platterParts);
  const vinyl = new THREE.CylinderGeometry(0.132, 0.132, 0.002, 40).translate(platter.x, 0.868, platter.z);
  vinyl.computeBoundingBox(); const vinylBox = vinyl.boundingBox.clone(); add(vinyl, 0x141817, platterParts);
  // Room 01's copy is seen up close in its own view, so the record carries more grooves (eight fine rings, alternately lighter, like the sheen between tracks).
  for (const [k, r] of [0.034, 0.045, 0.058, 0.073, 0.086, 0.095, 0.106, 0.116, 0.126].entries()) add(new THREE.TorusGeometry(r, k % 2 ? 0.0005 : 0.0007, 3, 48).rotateX(Math.PI / 2).translate(platter.x, 0.8692, platter.z), k % 2 ? 0x3a3f3d : 0x5a5f5c, platterParts);
  add(new THREE.CylinderGeometry(0.025, 0.025, 0.001, 20).translate(platter.x, 0.8695, platter.z), 0xc5a778, platterParts);
  // One small dark print block on the label, off centre (no words): the record and its rings are round, so without it a turning record looks still.
  add(new THREE.BoxGeometry(0.014, 0.0004, 0.004).translate(platter.x + 0.011, 0.87, platter.z - 0.006), 0x6b4a2c, platterParts);
  add(new THREE.CylinderGeometry(0.003, 0.003, 0.011, 8).translate(platter.x, 0.875, platter.z), 0xc6c6bb, platterParts);
  const pivot = [C.x + 0.113, 0.881, C.z + 0.151], elbow = [C.x + 0.11, 0.889, C.z + 0.106], tip = [C.x + 0.072, 0.873, C.z + 0.022];
  add(new THREE.CylinderGeometry(0.012, 0.012, 0.024, 12).translate(pivot[0], 0.87, pivot[2]), 0x46494a);
  const armCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(...pivot), new THREE.Vector3(...elbow), new THREE.Vector3(...tip)]);
  add(new THREE.TubeGeometry(armCurve, 18, 0.0034, 8, false), 0xd2d2c8, armParts);
  // a counterweight behind the pivot and a small headshell at the tip, so the arm reads as a tonearm up close (both swing with it)
  { const back = new THREE.Vector3(pivot[0] - elbow[0], 0, pivot[2] - elbow[2]).normalize();
    add(new THREE.CylinderGeometry(0.0095, 0.0095, 0.018, 16).rotateX(Math.PI / 2).lookAt(back).translate(pivot[0] + back.x * 0.022, 0.884, pivot[2] + back.z * 0.022), 0x2e3133, armParts);
    add(new THREE.CylinderGeometry(0.0034, 0.0034, 0.022, 8).rotateX(Math.PI / 2).lookAt(back).translate(pivot[0] + back.x * 0.011, 0.884, pivot[2] + back.z * 0.011), 0xd2d2c8, armParts); }
  const stylus = new THREE.BoxGeometry(0.012, 0.01, 0.015).translate(tip[0], 0.874, tip[2]);
  stylus.computeBoundingBox(); const stylusBox = stylus.boundingBox.clone(); add(stylus, 0x363632, armParts);
  // The arm parks 30 degrees outwards (stylus 12 mm clear of the gold rim) on a slim rest post that stands 1 mm into the deck top and meets the tube's underside.
  const ARM = { play: 0, rest: -0.52, swingMs: 650 }, DECK_TOP = 0.861;
  const restAt = armCurve.getPoint(0.72), restOff = new THREE.Vector3(restAt.x - pivot[0], 0, restAt.z - pivot[2]).applyAxisAngle(new THREE.Vector3(0, 1, 0), ARM.rest);
  const restTop = restAt.y - 0.003 + 0.001, restBottom = DECK_TOP - 0.001;
  const restPost = new THREE.CylinderGeometry(0.0026, 0.0032, restTop - restBottom, 8).translate(pivot[0] + restOff.x, (restTop + restBottom) / 2, pivot[2] + restOff.z);
  restPost.computeBoundingBox(); const restBox = restPost.boundingBox.clone(); add(restPost, 0x2c302e);
  // Gold trim (Paul 2026-11-17: make the record player shine and stand out): a thin frame around the top edge, a pinstripe on the room-facing side,
  // a ring at the platter's rim and a cap on the tonearm pivot. One merged mesh with a warm metal material.
  const gold = [];
  const addGold = (geometry) => { gold.push(geometry); };
  const FRAME_Y = 0.8625;
  for (const sz of [-1, 1]) addGold(new THREE.BoxGeometry(0.318, 0.0026, 0.004).translate(C.x, FRAME_Y, C.z + sz * 0.205));
  for (const sx of [-1, 1]) addGold(new THREE.BoxGeometry(0.004, 0.0026, 0.406).translate(C.x + sx * 0.155, FRAME_Y, C.z));
  addGold(new THREE.BoxGeometry(0.0022, 0.0024, 0.37).translate(C.x - 0.1601, 0.8445, C.z)); // pinstripe on the side that faces the room
  addGold(new THREE.TorusGeometry(platter.radius + 0.0012, 0.0014, 6, 48).rotateX(Math.PI / 2).translate(platter.x, 0.8668, platter.z));
  addGold(new THREE.CylinderGeometry(0.0085, 0.0085, 0.0022, 16).translate(pivot[0], 0.8826, pivot[2]));
  // A soft contact shadow under the deck (one small transparent plane, 1 mm above the oak), so the player sits on the cabinet in every light.
  { const cv = document.createElement("canvas"); cv.width = 128; cv.height = 160; const g = cv.getContext("2d");
    const grad = g.createRadialGradient(64, 80, 20, 64, 80, 84); grad.addColorStop(0, "rgba(0,0,0,.55)"); grad.addColorStop(.6, "rgba(0,0,0,.35)"); grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad; g.fillRect(0, 0, 128, 160);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.47).rotateX(-Math.PI / 2).translate(C.x, C.top + 0.001, C.z), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false, opacity: 0.8 }));
    shadow.name = "room01-record-player-contact-shadow"; shadow.renderOrder = 1; group.add(shadow); }
  const goldGeometry = mergeGeometries(gold, false);
  gold.forEach((part) => part.dispose()); goldGeometry.computeVertexNormals();
  const goldMesh = new THREE.Mesh(goldGeometry, new THREE.MeshStandardMaterial({ color: 0xe0b45a, metalness: 0.78, roughness: 0.28, emissive: 0x3a2808, emissiveIntensity: 0.4 }));
  goldMesh.name = "room01-record-player-gold"; goldMesh.userData.category = "sideboard"; goldMesh.castShadow = false; goldMesh.receiveShadow = false; group.add(goldMesh);
  const geometry = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose()); geometry.computeVertexNormals();
  // Three finishes instead of Room 03's one (no extra draw calls; the platter and the arm were already their own meshes): satin oak for the plinth and feet,
  // a glossier vinyl and platter, and brushed metal for the tonearm.
  const bodyMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, metalness: 0.06 });
  const platterMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.3, metalness: 0.12 });
  const armMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.28, metalness: 0.72 });
  const mesh = new THREE.Mesh(geometry, bodyMaterial);
  mesh.name = "room01-record-player-body"; mesh.userData.category = "sideboard";
  mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh);
  // Moving parts: geometry is moved so the mesh's own origin sits on its axis (platter centre, arm pivot), then the mesh is placed back there.
  const moving = (list, name, ox, oz, material) => {
    const g = mergeGeometries(list, false); list.forEach((part) => part.dispose()); g.translate(-ox, 0, -oz); g.computeVertexNormals();
    const m = new THREE.Mesh(g, material); m.name = name; m.userData.category = "sideboard"; m.position.set(ox, 0, oz); m.castShadow = true; m.receiveShadow = true; group.add(m); return m;
  };
  const platterMesh = moving(platterParts, "room01-record-platter", platter.x, platter.z, platterMaterial);
  const armMesh = moving(armParts, "room01-record-tonearm", pivot[0], pivot[2], armMaterial);
  armMesh.rotation.y = ARM.rest; // stopped: parked on the rest post
  group.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(mesh).union(new THREE.Box3().setFromObject(platterMesh)).union(new THREE.Box3().setFromObject(armMesh));
  // Card I, copied from Room 04's deck: while playing, the platter turns at 33 1/3 rpm and the arm swings onto the record in 650 ms; on stop it swings back and
  // the loop ends, so a stopped room draws nothing extra.
  const RPM33 = (33.333 / 60) * Math.PI * 2;
  const motion = { playing: false, arm: ARM.rest, from: ARM.rest, swingAt: 0, last: 0, loop: 0, render: null };
  const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const frame = (now) => {
    motion.loop = 0;
    const dt = Math.min(0.1, (now - (motion.last || now)) / 1000); motion.last = now;
    const k = Math.min(1, (now - motion.swingAt) / ARM.swingMs), e = k * k * (3 - 2 * k), target = motion.playing ? ARM.play : ARM.rest;
    motion.arm = motion.from + (target - motion.from) * e; armMesh.rotation.y = motion.arm;
    if (motion.playing && !reduced()) platterMesh.rotation.y -= RPM33 * dt;
    motion.render?.();
    if (motion.playing || k < 1) motion.loop = requestAnimationFrame(frame);
  };
  const setPlaying = (playing, render) => {
    motion.render = render ?? motion.render; playing = !!playing;
    if (playing === motion.playing) return;
    motion.playing = playing; motion.from = motion.arm; motion.swingAt = performance.now(); motion.last = 0;
    if (reduced()) { motion.arm = playing ? ARM.play : ARM.rest; armMesh.rotation.y = motion.arm; motion.render?.(); return; }
    if (!motion.loop) motion.loop = requestAnimationFrame(frame);
  };
  const stop = () => { if (motion.loop) cancelAnimationFrame(motion.loop); motion.loop = 0; };
  const motionInfo = () => {
    scene.updateMatrixWorld(true);
    const tipNow = new THREE.Vector3(tip[0] - pivot[0], 0, tip[2] - pivot[2]).applyAxisAngle(new THREE.Vector3(0, 1, 0), armMesh.rotation.y);
    const mm = (v) => Number((v * 1000).toFixed(1));
    return { playing: motion.playing, looping: !!motion.loop, armAngle: Number(armMesh.rotation.y.toFixed(4)), armRest: ARM.rest, armPlay: ARM.play, platterAngle: Number(platterMesh.rotation.y.toFixed(4)),
      stylusFromCentreMm: mm(Math.hypot(pivot[0] + tipNow.x - platter.x, pivot[2] + tipNow.z - platter.z)), vinylRadiusMm: 132, labelRadiusMm: 25, platterRadiusMm: 138,
      restIntoDeckMm: mm(DECK_TOP - restBox.min.y), restTopToTubeMm: mm(restAt.y - 0.003 - restBox.max.y) };
  };
  return { group, mesh, platterMesh, armMesh, setPlaying, stop, motionInfo, info: () => ({ dimensionsMm: [320, 42, 420], platterMm: 276,
    footIntoTopMm: Math.round((C.top - Math.min(...footBoxes.map((b) => b.min.y))) * 1000),
    footIntoPlinthMm: Math.round((Math.min(...footBoxes.map((b) => b.max.y)) - deckBox.min.y) * 1000),
    tonearmEndAboveVinylMm: Math.round((stylusBox.min.y - vinylBox.max.y) * 1000),
    bounds: { min: box.min.toArray(), max: box.max.toArray() }, vertices: geometry.attributes.position.count + platterMesh.geometry.attributes.position.count + armMesh.geometry.attributes.position.count + goldGeometry.attributes.position.count, goldVertices: goldGeometry.attributes.position.count, motion: motionInfo() }) };
}
