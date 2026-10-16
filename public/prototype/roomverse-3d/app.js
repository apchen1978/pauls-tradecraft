// ROOMVERSE 3D: the same soft-furnishing idea as ROOM MODE REMOTE, as a small 3D room you can turn.
// Loaded only after the visitor presses "enter" (index.html), so the portfolio page stays light.
// Furniture: sofa, coffee table, side table, table lamp, floor lamp and plant were drawn as single illustrations, turned into shapes by an
// image-to-3D model, then coloured locally from the same illustrations. Walls, rug, light: drawn by code.
// Built and checked in a local trial first (Desktop CC_3D軟裝房間試作_2026-10-16, README trials 1-8).
import * as THREE from "./vendor/three.module.min.js"; // three.js r160 (MIT), self-hosted: the site loads nothing from other hosts
import { OrbitControls } from "./vendor/OrbitControls.js";
import { GLTFLoader } from "./vendor/GLTFLoader.js";

export const TEXT = {
  zh: { mood: "感覺", wall: "牆面", rug: "地毯", hint: "拖曳可以轉一點角度。", save: "存成明信片", file: "ROOMVERSE-3D-明信片.png" },
  en: { mood: "Feeling", wall: "Wall", rug: "Rug", hint: "Drag to turn the room a little.", save: "Save as a postcard", file: "ROOMVERSE-3D-postcard.png" },
};
const MOODS = {
  // floor: the floor lamp's light; glow: how strong the halos around lit shades are
  rain: { zh: "下雨天想窩在家裡", en: "Rainy day, staying in", hemi: .9, win: .7, winCol: "#bccbdb", lamp: 5, fill: 1.2, out: "#d2dae0", exposure: 1.05, floor: 2.2, glow: .55 },
  family: { zh: "Cozy family", en: "Cozy family", hemi: 1.6, win: 3.2, winCol: "#ffe7c2", lamp: 2, fill: 2.4, out: "#ffffff", exposure: 1.15, floor: 0, glow: .15 },
  // tech: moonlight through the window leaves a pale blue patch on the floor
  tech: { zh: "未來輕科技宅男", en: "Light-tech homebody", hemi: .6, win: 1.5, winCol: "#7f9fe6", lamp: 3.6, fill: .7, out: "#ffffff", exposure: 1, led: true, floor: 1.2, glow: .45 },
};

export async function start({ stage, panel, lang, onReady }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap; // PCF honours shadow.radius: soft shadow edges (PCFSoft ignores it in r160)
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  stage.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(44, 1, 0.05, 50);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0.15, 0.85, -0.9);
  controls.enableDamping = true; controls.enablePan = false;
  controls.minDistance = 2.4; controls.maxDistance = 5.6;
  controls.minPolarAngle = Math.PI * 0.32; controls.maxPolarAngle = Math.PI * 0.5;
  controls.minAzimuthAngle = -0.55; controls.maxAzimuthAngle = 0.55;
  function fit() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    const narrow = w / h < 0.8;
    // framed so the sofa group fills the view and the floor does not take half the picture (checked at 390 and 1440)
    camera.fov = narrow ? 58 : 42;
    camera.position.set(0.15, narrow ? 1.25 : 1.5, narrow ? 2.85 : 3.5);
    controls.target.set(0.15, narrow ? 0.72 : 0.85, -0.9);
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
  const WALLS = {
    original: { zh: "原來的米白", en: "Original cream", paint: "#e9e1d3" },
    sand: { zh: "暖砂米", en: "Warm sand", paint: "#d9c6a8" },
    olive: { zh: "柔橄欖", en: "Soft olive", paint: "#a9ad8a" },
    stripe: { zh: "細條紋壁紙", en: "Fine-stripe wallpaper", size: .55, tex: () => canvasTex(512, 512, (ctx, w, h) => {
      ctx.fillStyle = "#e4dcc9"; ctx.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 64) { ctx.fillStyle = "#b9c2a8"; ctx.fillRect(x + 6, 0, 14, h); ctx.fillStyle = "#cfd3bd"; ctx.fillRect(x + 30, 0, 5, h); ctx.fillStyle = "#c6b79b"; ctx.fillRect(x + 44, 0, 3, h); }
      noise(ctx, w, h, .04);
    }) },
    botanical: { zh: "淡色植紋壁紙", en: "Soft botanical wallpaper", size: .8, tex: () => canvasTex(512, 512, (ctx, w, h) => {
      ctx.fillStyle = "#dfe0cf"; ctx.fillRect(0, 0, w, h);
      const sprig = (cx, cy) => { ctx.strokeStyle = "#8f9e7c"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy + 70); ctx.quadraticCurveTo(cx + 8, cy, cx, cy - 70); ctx.stroke();
        for (let i = -3; i <= 3; i++) { ctx.fillStyle = i % 2 ? "#9fae8b" : "#b3bf9f"; ctx.beginPath(); ctx.ellipse(cx + (i % 2 ? 18 : -18), cy + i * 20, 18, 8, i % 2 ? -.5 : .5, 0, Math.PI * 2); ctx.fill(); } };
      sprig(128, 128); sprig(384, 384); sprig(384, -128); sprig(128, 640);
      noise(ctx, w, h, .035);
    }) },
  };
  const RUGS = {
    stripe: { zh: "藍米條紋", en: "Blue and cream stripe", tex: () => canvasTex(1024, 640, (ctx, w, h) => {
      const bands = ["#d8c9ad", "#6f7f8e", "#d8c9ad", "#b8a585", "#d8c9ad", "#55667a"];
      let y = 0, i = 0; while (y < h) { const bh = 18 + (i % 3) * 14; ctx.fillStyle = bands[i % bands.length]; ctx.fillRect(0, y, w, bh); y += bh; i++; }
      for (let x = 0; x < w; x += 6) { ctx.fillStyle = "rgba(255,255,255,.06)"; ctx.fillRect(x, 0, 2, h); }
      noise(ctx, w, h, .08, 30000); ctx.strokeStyle = "#cdbb98"; ctx.lineWidth = 16; ctx.strokeRect(0, 0, w, h);
    }) },
    ivory: { zh: "柔米白", en: "Soft ivory", tex: () => canvasTex(1024, 640, (ctx, w, h) => {
      ctx.fillStyle = "#e8dfcd"; ctx.fillRect(0, 0, w, h); noise(ctx, w, h, .09, 60000);
      ctx.strokeStyle = "#d6cab2"; ctx.lineWidth = 26; ctx.strokeRect(40, 40, w - 80, h - 80);
    }) },
    medallion: { zh: "古典花紋", en: "Classic medallion", tex: () => canvasTex(1024, 640, (ctx, w, h) => {
      ctx.fillStyle = "#b9775a"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#e5d5b8"; ctx.fillRect(60, 60, w - 120, h - 120);
      ctx.strokeStyle = "#3f5167"; ctx.lineWidth = 14; ctx.strokeRect(80, 80, w - 160, h - 160);
      for (let x = 30; x < w; x += 46) { ctx.fillStyle = "#3f5167"; ctx.beginPath(); ctx.arc(x, 30, 9, 0, 7); ctx.arc(x, h - 30, 9, 0, 7); ctx.fill(); }
      const cx = w / 2, cy = h / 2;
      [[230, "#3f5167"], [180, "#b9775a"], [120, "#d9a173"], [60, "#3f5167"]].forEach(([r, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx, cy - r * .62); ctx.lineTo(cx + r, cy); ctx.lineTo(cx, cy + r * .62); ctx.closePath(); ctx.fill(); });
      noise(ctx, w, h, .1, 50000);
    }) },
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
  add(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ color: "#f6f2ea", emissive: "#f6f2ea", emissiveIntensity: .12 }), 0, H, BACK + D / 2, true).rotation.x = Math.PI / 2;
  const wood = new THREE.MeshStandardMaterial({ color: "#8a5a36", roughness: .6 });
  const skirting = new THREE.MeshStandardMaterial({ color: "#f3efe6", roughness: .7 });
  add(new THREE.BoxGeometry(W, .09, .02), skirting, 0, .045, BACK + .01, false);
  // side skirting too: finishes the room and covers the thin light line where wall meets floor
  [-1, 1].forEach((s) => add(new THREE.BoxGeometry(.02, .09, D), skirting, s * (W / 2 - .01), .045, BACK + D / 2, false));
  // the view outside changes with the feeling: grey rain, a sunny afternoon, a city night
  const trees = (ctx, w, h, cols, top = .45) => { for (let i = 0; i < 46; i++) { ctx.fillStyle = cols[i % cols.length]; ctx.beginPath(); ctx.arc(rnd() * w, h * top + rnd() * h * (1 - top), 22 + rnd() * 40, 0, 7); ctx.fill(); } };
  const VIEWS = {
    rain: () => canvasTex(256, 512, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#9fb0bd"); g.addColorStop(1, "#5d7268"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      trees(ctx, w, h, ["rgba(60,90,70,.45)", "rgba(70,100,82,.55)", "rgba(50,78,62,.5)"]);
      ctx.fillStyle = "rgba(200,212,222,.18)"; ctx.fillRect(0, 0, w, h); // mist
      ctx.strokeStyle = "rgba(230,240,250,.35)"; for (let i = 0; i < 160; i++) { const x = rnd() * w, y = rnd() * h; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 2, y + 14); ctx.stroke(); }
      for (let i = 0; i < 30; i++) { const x = rnd() * w, y = rnd() * h, r = 1.5 + rnd() * 2.5; ctx.fillStyle = "rgba(235,242,250,.5)"; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.fillRect(x - .6, y, 1.2, 6 + rnd() * 14); } // drops on the glass
    }),
    family: () => canvasTex(256, 512, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#a9cbe6"); g.addColorStop(.45, "#e9eadb"); g.addColorStop(1, "#d9c99a"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 5; i++) { ctx.fillStyle = "rgba(255,255,255,.7)"; const x = rnd() * w, y = 30 + rnd() * 120; ctx.beginPath(); ctx.ellipse(x, y, 40 + rnd() * 30, 10 + rnd() * 6, 0, 0, 7); ctx.fill(); }
      trees(ctx, w, h, ["#7f9f55", "#94b263", "#6c8c4a", "#a9bf72"], .5);
      for (let i = 0; i < 40; i++) { ctx.fillStyle = "rgba(255,240,190,.35)"; ctx.beginPath(); ctx.arc(rnd() * w, h * .5 + rnd() * h * .3, 6 + rnd() * 10, 0, 7); ctx.fill(); } // sun on the leaves
    }),
    tech: () => canvasTex(256, 512, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#141c33"); g.addColorStop(.6, "#2a3558"); g.addColorStop(1, "#3b3f5c"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(255,255,255,${.3 + rnd() * .5})`; ctx.fillRect(rnd() * w, rnd() * h * .4, 1.2, 1.2); }
      let x = -10; while (x < w) { const bw = 30 + rnd() * 50, bh = h * (.25 + rnd() * .4); ctx.fillStyle = `rgb(${22 + rnd() * 14},${28 + rnd() * 14},${48 + rnd() * 16})`; ctx.fillRect(x, h - bh, bw, bh);
        for (let wy = h - bh + 8; wy < h - 6; wy += 12) for (let wx = x + 5; wx < x + bw - 6; wx += 9) if (rnd() < .35) { ctx.fillStyle = rnd() < .7 ? "rgba(255,214,140,.85)" : "rgba(150,210,255,.85)"; ctx.fillRect(wx, wy, 4, 5); }
        x += bw + 2; }
    }),
  };
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
  lampLight.position.set(TX, .98, TZ); lampLight.castShadow = true; lampLight.shadow.mapSize.set(1024, 1024); lampLight.shadow.bias = -.002; lampLight.shadow.radius = 6; scene.add(lampLight);
  const PX = -2.3, PZ = BACK + .45;
  // art above the sofa: a soft abstract print in a thin oak frame
  const art = canvasTex(600, 420, (ctx, w, h) => {
    ctx.fillStyle = "#efe8da"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#d9a77a"; ctx.beginPath(); ctx.arc(w * .34, h * .62, 120, Math.PI, 0); ctx.fill();
    ctx.fillStyle = "#8a9c84"; ctx.beginPath(); ctx.arc(w * .62, h * .78, 150, Math.PI, 0); ctx.fill();
    ctx.fillStyle = "#c46f4f"; ctx.beginPath(); ctx.arc(w * .7, h * .3, 34, 0, 7); ctx.fill();
    ctx.strokeStyle = "#3f5167"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(w * .12, h * .78); ctx.lineTo(w * .88, h * .78); ctx.stroke();
    noise(ctx, w, h, .05, 12000);
  });
  const AX = .35, AY = 1.62, AW = .86, AH = .6;
  add(new THREE.BoxGeometry(AW + .06, AH + .06, .035), new THREE.MeshStandardMaterial({ color: "#a8784c", roughness: .55 }), AX, AY, BACK + .02);
  add(new THREE.BoxGeometry(AW, AH, .006), new THREE.MeshStandardMaterial({ color: "#f7f3ea", roughness: .9 }), AX, AY, BACK + .038, false);
  add(new THREE.PlaneGeometry(AW - .14, AH - .14), new THREE.MeshStandardMaterial({ map: art, roughness: .85 }), AX, AY, BACK + .042, false);
  const rugMat = new THREE.MeshStandardMaterial({ roughness: 1 });
  add(new THREE.BoxGeometry(2.6, .012, 1.65), rugMat, SX, .006, SZ + .95, false);

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
  const led = add(new THREE.BoxGeometry(2.2, .015, .015), new THREE.MeshBasicMaterial({ color: "#9fe3ff" }), SX, 1.16, BACK + .02, false);
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
  const [sofa, table, floorLamp, coffee, tableLamp, plant] = await Promise.all(["sofa", "side-table", "floor-lamp", "coffee-table", "table-lamp", "plant"].map((f) => loader.loadAsync(base + f + ".glb")));
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
  prepare(sofaObj, () => fabricMat);
  const tableObj = place(table, { height: .6, x: TX, z: TZ });
  prepare(tableObj, () => new THREE.MeshStandardMaterial({ color: "#b98a5c", roughness: .55 })); // light oak, same family as the coffee table
  const lampObj = place(floorLamp, { height: 1.55, x: SX - 1.3, z: SZ - .05 });
  const lb = new THREE.Box3().setFromObject(lampObj);
  const shadeGlow = { value: 0 };
  prepare(lampObj, (m) => {
    // shade starts at 70% of the height (measured on the model: radius jumps from 0.035 to 0.34 there)
    const pos = m.geometry.attributes.position, col = new Float32Array(pos.count * 3), v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld); col.set((v.y - lb.min.y) / (lb.max.y - lb.min.y) > .7 ? [.95, .9, .8] : [.72, .56, .28], i * 3); }
    m.geometry.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .6, metalness: .1 });
    // the shade glows when the lamp is on: shade vertices are the pale ones (blue channel .8 vs .28 on the pole)
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.shadeGlow = shadeGlow;
      sh.fragmentShader = "uniform float shadeGlow;\n" + sh.fragmentShader.replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += step(.6, vColor.b) * vec3(1., .78, .5) * shadeGlow;");
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
  scene.add(sofaObj, tableObj, lampObj, coffeeObj, tableLampObj, plantObj);
  // the floor lamp gets its own light just under the shade (no shadow: a light inside the closed shade mesh would be blocked)
  const shadeY = lb.min.y + (lb.max.y - lb.min.y) * .8, lampX = (lb.min.x + lb.max.x) / 2, lampZ = (lb.min.z + lb.max.z) / 2;
  const floorLight = new THREE.PointLight("#ffc98a", 0, 5, 1.6); floorLight.position.set(lampX, shadeY - .12, lampZ + .05); scene.add(floorLight);
  const floorHalo = halo(lampX, shadeY, lampZ + .3, 1.1); // a little in front of the shade so the shade does not hide it

  // ---------- state + panel ----------
  const state = { mood: "rain", wall: "original", rug: "stripe", lang };
  const cache = {};
  function apply() {
    const m = MOODS[state.mood];
    hemi.intensity = m.hemi; windowLight.intensity = m.win; windowLight.color.set(m.winCol);
    lampLight.intensity = m.lamp; fill.intensity = m.fill; outMat.color.set(m.out);
    outMat.map = cache["view-" + state.mood] ||= VIEWS[state.mood](); outMat.needsUpdate = true;
    floorLight.intensity = m.floor; floorHalo.material.opacity = m.floor ? m.glow : 0; tableHalo.material.opacity = m.glow;
    shadeGlow.value = m.floor ? .55 : 0; tableGlow.value = m.glow > .3 ? .45 : .18; // the AI shade is a solid shape: a softer glow keeps its form readable // in daylight a lit shade glows less
    renderer.toneMappingExposure = m.exposure;
    led.visible = !!m.led; ledGlow.intensity = m.led ? .5 : 0;
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
    panel.replaceChildren(...[["mood", MOODS], ["wall", WALLS], ["rug", RUGS]].flatMap(([key, table]) => {
      const h = document.createElement("h2"); h.textContent = t[key];
      const box = document.createElement("div"); box.className = "opts"; box.setAttribute("role", "group"); box.setAttribute("aria-label", t[key]);
      box.append(...Object.entries(table).map(([k, v]) => {
        const b = document.createElement("button"); b.type = "button"; b.textContent = v[state.lang]; b.dataset.key = k;
        b.setAttribute("aria-pressed", String(state[key] === k));
        b.onclick = () => { state[key] = k; apply(); };
        return b;
      }));
      return [h, box];
    }), Object.assign(document.createElement("p"), { className: "hint", textContent: t.hint }),
    Object.assign(document.createElement("button"), { type: "button", className: "save", textContent: t.save, onclick: () => savePostcard() }));
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
    ctx.fillText([MOODS[state.mood][l], WALLS[state.wall][l], RUGS[state.rug][l]].join("  ·  "), pad, h + strip - pad * .9);
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
  function loop() { if (controls.update()) { render(); requestAnimationFrame(loop); } else { render(); looping = false; } }
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
      const k = Math.min(1, (now - t0) / 1800), e = 1 - (1 - k) ** 3;
      camera.position.lerpVectors(from, end, e); camera.lookAt(controls.target); render();
      if (k < 1) requestAnimationFrame(step); else { intro = false; controls.update(); }
    };
    camera.position.copy(from); requestAnimationFrame(step);
  }
  onReady?.();
  return {
    setLang(l) { state.lang = l; drawPanel(); },
    set(k, v) { state[k] = v; apply(); }, // used by tests
    postcard, // used by tests: returns the postcard canvas
    view(x, y, z) { intro = false; camera.position.set(x, y, z); controls.update(); render(); },
  };
}
