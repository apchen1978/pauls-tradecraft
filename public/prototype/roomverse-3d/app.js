// ROOMVERSE 3D: the same soft-furnishing idea as ROOM MODE REMOTE, as a small 3D room you can turn.
// Loaded only after the visitor presses "enter" (index.html), so the portfolio page stays light.
// Furniture: sofa, side table and floor lamp were drawn as single illustrations, turned into shapes by an
// image-to-3D model, then coloured locally from the same illustrations. Walls, rug, light: drawn by code.
// Built and checked in a local trial first (Desktop CC_3D軟裝房間試作_2026-10-16, README trials 1-8).
import * as THREE from "./vendor/three.module.min.js"; // three.js r160 (MIT), self-hosted: the site loads nothing from other hosts
import { OrbitControls } from "./vendor/OrbitControls.js";
import { GLTFLoader } from "./vendor/GLTFLoader.js";

export const TEXT = {
  zh: { mood: "感覺", wall: "牆面", rug: "地毯", hint: "拖曳可以轉一點角度。" },
  en: { mood: "Feeling", wall: "Wall", rug: "Rug", hint: "Drag to turn the room a little." },
};
const MOODS = {
  rain: { zh: "下雨天想窩在家裡", en: "Rainy day, staying in", hemi: .9, win: .7, winCol: "#bccbdb", lamp: 5, fill: 1.2, out: "#9aa9b6", exposure: 1.05 },
  family: { zh: "Cozy family", en: "Cozy family", hemi: 1.6, win: 3.2, winCol: "#ffe7c2", lamp: 2, fill: 2.4, out: "#ffffff", exposure: 1.15 },
  tech: { zh: "未來輕科技宅男", en: "Light-tech homebody", hemi: .6, win: .4, winCol: "#a9c4ff", lamp: 3.6, fill: .7, out: "#6f7f9a", exposure: 1, led: true },
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
  const floorTex = canvasTex(1024, 1024, (ctx, w, h) => {
    const plank = h / 8;
    for (let r = 0; r < 8; r++) {
      let x = -(r % 3) * 170;
      while (x < w) {
        const len = 300 + rnd() * 260, tone = 120 + rnd() * 30;
        ctx.fillStyle = `rgb(${tone + 40},${tone - 10},${tone - 55})`; ctx.fillRect(x, r * plank, len, plank);
        for (let g = 0; g < 14; g++) { ctx.strokeStyle = `rgba(70,35,10,${.05 + rnd() * .07})`; ctx.beginPath(); const y = r * plank + rnd() * plank; ctx.moveTo(x, y); ctx.bezierCurveTo(x + len * .3, y + 4, x + len * .6, y - 4, x + len, y + 2); ctx.stroke(); }
        ctx.fillStyle = "rgba(40,20,5,.55)"; ctx.fillRect(x, r * plank, 2, plank);
        x += len;
      }
      ctx.fillStyle = "rgba(40,20,5,.5)"; ctx.fillRect(0, r * plank, w, 2);
    }
  });
  floorTex.repeat.set(2.2, 2.2);
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
  add(new THREE.ShapeGeometry(wallShape), wallMat, 0, 0, BACK, false);
  const sideMat = new THREE.MeshStandardMaterial({ color: "#e4ddd0", roughness: .95 });
  [-1, 1].forEach((s) => { add(new THREE.PlaneGeometry(D, H), sideMat, s * W / 2, H / 2, BACK + D / 2, false).rotation.y = -s * Math.PI / 2; });
  add(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ color: "#f6f2ea", emissive: "#f6f2ea", emissiveIntensity: .12 }), 0, H, BACK + D / 2, false).rotation.x = Math.PI / 2;
  const wood = new THREE.MeshStandardMaterial({ color: "#8a5a36", roughness: .6 });
  add(new THREE.BoxGeometry(W, .09, .02), new THREE.MeshStandardMaterial({ color: "#f3efe6", roughness: .7 }), 0, .045, BACK + .01, false);
  const outside = canvasTex(256, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#9fb0bd"); g.addColorStop(1, "#5d7268"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(60,90,70,${.3 + rnd() * .3})`; ctx.beginPath(); ctx.arc(rnd() * w, h * .45 + rnd() * h * .55, 20 + rnd() * 40, 0, 7); ctx.fill(); }
    ctx.strokeStyle = "rgba(230,240,250,.35)"; for (let i = 0; i < 160; i++) { const x = rnd() * w, y = rnd() * h; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 2, y + 14); ctx.stroke(); }
  });
  const outMat = new THREE.MeshBasicMaterial({ map: outside });
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
  // coffee table + a book, small table lamp on the side table (the room's warm light)
  add(new THREE.CylinderGeometry(.5, .5, .05, 48), wood, SX, .42, SZ + 1.05).scale.z = .62;
  [[-.3, -.14], [.3, -.14], [-.3, .14], [.3, .14]].forEach(([dx, dz]) => add(new THREE.CylinderGeometry(.045, .045, .4, 16), wood, SX + dx, .2, SZ + 1.05 + dz));
  add(new THREE.BoxGeometry(.26, .05, .18), new THREE.MeshStandardMaterial({ color: "#6d7d68" }), SX - .12, .47, SZ + 1.02);
  const lathe = new THREE.LatheGeometry([[0, 0], [.09, .01], [.12, .08], [.11, .17], [.05, .23], [.02, .26]].map(([x, y]) => new THREE.Vector2(x, y)), 32);
  add(lathe, new THREE.MeshStandardMaterial({ color: "#c9c4b8", roughness: .5 }), TX, .615, TZ);
  add(new THREE.CylinderGeometry(.13, .19, .22, 40, 1, true), new THREE.MeshStandardMaterial({ color: "#f3e7cf", emissive: "#ffcf8a", emissiveIntensity: .9, side: THREE.DoubleSide, roughness: 1 }), TX, .99, TZ, false);
  const lampLight = new THREE.PointLight("#ffc27a", 3.2, 6, 1.6);
  lampLight.position.set(TX, .98, TZ); lampLight.castShadow = true; lampLight.shadow.mapSize.set(1024, 1024); lampLight.shadow.bias = -.002; lampLight.shadow.radius = 6; scene.add(lampLight);
  add(new THREE.CylinderGeometry(.17, .13, .32, 24), new THREE.MeshStandardMaterial({ color: "#b59a6e", roughness: 1 }), -2.35, .16, BACK + .45);
  const leaf = new THREE.MeshStandardMaterial({ color: "#5d7a4c", roughness: .8 });
  for (let i = 0; i < 26; i++) { const l = add(new THREE.SphereGeometry(.07, 8, 6), leaf, -2.35 + (rnd() - .5) * .45, .55 + rnd() * .75, BACK + .45 + (rnd() - .5) * .4); l.scale.set(1.4, .5, .9); l.rotation.set(rnd(), rnd(), rnd()); }
  const rugMat = new THREE.MeshStandardMaterial({ roughness: 1 });
  add(new THREE.BoxGeometry(2.6, .012, 1.65), rugMat, SX, .006, SZ + .95, false);

  // ---------- light ----------
  const hemi = new THREE.HemisphereLight("#dfe8f0", "#8a6a4f", .35); scene.add(hemi);
  const windowLight = new THREE.DirectionalLight("#cfdcea", 1.1);
  windowLight.position.set(-2.4, 2.6, -4.5); windowLight.target.position.set(.2, 0, .2);
  windowLight.castShadow = true; windowLight.shadow.mapSize.set(2048, 2048); windowLight.shadow.radius = 8; windowLight.shadow.bias = -.0005;
  Object.assign(windowLight.shadow.camera, { left: -3.5, right: 3.5, top: 3.5, bottom: -3.5, near: .5, far: 12 });
  scene.add(windowLight, windowLight.target);
  const fill = new THREE.PointLight("#fff1dc", .6, 9, 1.2); fill.position.set(.2, 2.2, 2.2); scene.add(fill);
  const led = add(new THREE.BoxGeometry(2.2, .015, .015), new THREE.MeshBasicMaterial({ color: "#9fe3ff" }), SX, 1.55, BACK + .02, false);
  const ledGlow = new THREE.PointLight("#8fd3ff", 0, 3, 2); ledGlow.position.set(SX, 1.5, BACK + .25); scene.add(ledGlow);

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
  const [sofa, table, floorLamp] = await Promise.all(["sofa", "side-table", "floor-lamp"].map((f) => loader.loadAsync(base + f + ".glb")));
  const sofaObj = place(sofa, { width: 2.0, x: SX, z: SZ + .02 });
  prepare(sofaObj, () => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .92 })); // colours projected from the illustration
  const tableObj = place(table, { height: .6, x: TX, z: TZ });
  prepare(tableObj, () => wood);
  const lampObj = place(floorLamp, { height: 1.55, x: SX - 1.3, z: SZ - .05 });
  const lb = new THREE.Box3().setFromObject(lampObj);
  prepare(lampObj, (m) => {
    // shade starts at 70% of the height (measured on the model: radius jumps from 0.035 to 0.34 there)
    const pos = m.geometry.attributes.position, col = new Float32Array(pos.count * 3), v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld); col.set((v.y - lb.min.y) / (lb.max.y - lb.min.y) > .7 ? [.95, .9, .8] : [.72, .56, .28], i * 3); }
    m.geometry.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .6, metalness: .1 });
  });
  scene.add(sofaObj, tableObj, lampObj);

  // ---------- state + panel ----------
  const state = { mood: "rain", wall: "original", rug: "stripe", lang };
  const cache = {};
  function apply() {
    const m = MOODS[state.mood];
    hemi.intensity = m.hemi; windowLight.intensity = m.win; windowLight.color.set(m.winCol);
    lampLight.intensity = m.lamp; fill.intensity = m.fill; outMat.color.set(m.out);
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
    }), Object.assign(document.createElement("p"), { className: "hint", textContent: t.hint }));
  }

  let looping = false;
  function render() { renderer.render(scene, camera); }
  function loop() { if (controls.update()) { render(); requestAnimationFrame(loop); } else { render(); looping = false; } }
  controls.addEventListener("start", () => { if (!looping) { looping = true; requestAnimationFrame(loop); } });
  controls.addEventListener("change", () => { if (!looping) render(); });
  new ResizeObserver(() => { fit(); render(); }).observe(stage);
  fit(); apply();
  onReady?.();
  return {
    setLang(l) { state.lang = l; drawPanel(); },
    set(k, v) { state[k] = v; apply(); }, // used by tests
    view(x, y, z) { camera.position.set(x, y, z); controls.update(); render(); },
  };
}
