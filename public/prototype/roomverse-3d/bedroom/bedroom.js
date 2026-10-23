// ROOMVERSE studio (bedroom): a second room, built apart from the living room so that room stays untouched.
// Stage 1: the empty shell (walls, floor, window, door), daylight and three floor zones. Stage 2: the sleep zone (bed, bedding, bedside). Stage 3: the work/game zone (desk, ultrawide monitor, console, chair). Stage 4: the lounge (sofa, coffee table, TV, bookshelf). Stage 5: lived-in details (books, posters, plant, fittings). Stage 6: four moods (lighting). Stage 7: the vinyl corner. Stage 8: round-1 swaps (feature wall, rug, window, bedding, posters), the house plaque. Stage 9: Codex's painted surfaces (floor, walls, rugs, oak, fabrics, screen, books).
// Everything is drawn by code.
// Units are metres. North is the window wall (z = -ROOM.d / 2); the door is on the south wall.
import * as THREE from "../vendor/three.module.min.js"; // same self-hosted three.js r160 as the living room
import { loadModel, loadGlb } from "./models.js?v=5";

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
  const g = new THREE.ExtrudeGeometry(sh, { depth: h - 2 * bt, bevelEnabled: true, bevelThickness: bt, bevelSize: bs, bevelSegments: 1, curveSegments: 2 });
  g.rotateX(-Math.PI / 2); g.translate(0, -(h - 2 * bt) / 2, 0); // lies flat: height along y, centred
  g.computeVertexNormals();
  return g;
}

// Furniture edges: a hero piece gets a small rounded edge (radius capped by its thinnest side) so light rolls off it like a real object.
const rb = (w, h, d) => softBox(w, h, d, Math.min(.012, w / 4, h / 4, d / 4));

export async function start({ stage, lang = "zh" }) {
  const compact = matchMedia("(max-width: 600px)").matches;
  // Painted surfaces from Codex (floor, walls, rugs, oak, fabrics, window dressings, screen, bookshelf rows). Each material starts with a
  // code-drawn stand-in and swaps to the painting when it arrives, so a slow or failed download never leaves a blank room.
  let ready = false;
  const redraw = () => { if (ready) render(); };
  const painted = {};
  const art = (file, { repeat, apply } = {}) => {
    const t = new THREE.TextureLoader().load(new URL(`./art/${file}`, import.meta.url).href, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
      if (repeat) { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(...repeat); }
      painted[file] = true; apply?.(tex); redraw();
    }, undefined, () => { painted[file] = false; });
    return t;
  };
  const ceil = { glow: null }; // the pool of light on the ceiling
  const CEILING_GLOW = { focus: .55, weekend: .34, night: 0, sunday: .2 };
  const live = { mood: "focus" }; // the current mood, readable before the moods block exists
  const SPRITE_TINT = { focus: 1, weekend: .88, night: .45, sunday: .8 };
  const chosen = { wall: "paper", rug: "modern", window: "linen", bedding: "stone", posters: "C", tv: "auto", led: "amber", desktop: "minimal", screen: "city", sofa: "slate", shelf: "mixed" };
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
  // The camera stands in the south-east corner, high, and the visitor turns their head: drag to look around within a limited range.
  // (A 4 x 5 m room has no safe orbit circle for this distance, so the camera itself never moves and never leaves the room.)
  // Phones are narrow, so the view is aimed a little further east to keep the bed in frame.
  const target = new THREE.Vector3(compact ? .05 : -.1, compact ? .98 : .75, compact ? -.6 : -.35), home = new THREE.Vector3(1.8, 2.05, 2.38);
  const dir = target.clone().sub(home);
  const look0 = { yaw: Math.atan2(-dir.x, -dir.z), pitch: Math.atan2(dir.y, Math.hypot(dir.x, dir.z)) };
  const look = { yaw: look0.yaw, pitch: look0.pitch };
  const LIMIT = { yaw: .9, pitch: .3 }; // wide enough that every look (the TV wall sits .43 and the bed side -.4 from the corner view) still has .45 or more to turn either way, so a drag never hits a stop right away
  camera.position.copy(home);
  camera.rotation.order = "YXZ";
  const applyLook = () => camera.rotation.set(look.pitch, look.yaw, 0);
  applyLook();
  let centred = false; // the second way to look: standing in the middle of the room, turning on the spot all the way round
  const CENTER = new THREE.Vector3(-.2, 1.5, .1), CENTER_PITCH = .5;
  const controls = {
    look, look0, limit: LIMIT,
    turn(dYaw, dPitch) {
      if (centred) { look.yaw += dYaw; look.pitch = Math.min(CENTER_PITCH, Math.max(-CENTER_PITCH, look.pitch + dPitch)); applyLook(); render(); return; }
      look.yaw = Math.min(look0.yaw + LIMIT.yaw, Math.max(look0.yaw - LIMIT.yaw, look.yaw + dYaw));
      look.pitch = Math.min(look0.pitch + LIMIT.pitch, Math.max(look0.pitch - LIMIT.pitch, look.pitch + dPitch));
      applyLook(); render();
    },
  };
  // Three looks from the corner (the camera never moves, only the head turns): the desk and window (the opening look), the TV wall
  // on the left, and the bed side on the right. On a phone the screen is too narrow to hold the whole room, so the buttons below the
  // room turn the head for you; dragging still works within the same limits.
  // The fourth look, "centre", is absolute: the camera walks to the middle of the room at eye height and the head can turn a full circle.
  const LOOKS = { center: { pos: CENTER, yaw: 0, pitch: compact ? -.22 : -.09, zoom: compact ? .8 : .92 }, work: compact ? [.1, .1, 1.4] : [.22, .12, 1.35], tv: [.43, .01], bed: compact ? [-.4, .03, 1.9] : [-.4, .08, 1.45] }; // [yaw, pitch, zoom]: the bed look leans in so the pillows and the quilt fill the frame instead of the empty east wall
  let lookRun = 0, lookName = "center";
  const setZoom = (z) => { camera.zoom = z; camera.updateProjectionMatrix(); };
  // The opening look is the centre (Paul, 2026-10-23): standing in the middle of the room facing the window wall, free to turn all the way round.
  // The corner looks (desk and window, TV wall, bed side) are one tap away.
  camera.position.copy(CENTER); look.yaw = LOOKS.center.yaw; look.pitch = LOOKS.center.pitch; setZoom(LOOKS.center.zoom); centred = true; applyLook();
  const wrapPi = (a) => Math.atan2(Math.sin(a), Math.cos(a)); // the short way round
  function lookTo(name) {
    const to = LOOKS[name]; if (!to) return Promise.resolve(false);
    lookName = name; glide++;
    const abs = !Array.isArray(to);
    const target = abs ? { yaw: to.yaw, pitch: to.pitch, zoom: to.zoom, pos: to.pos } : { yaw: look0.yaw + to[0], pitch: look0.pitch + to[1], zoom: to[2] ?? 1, pos: home };
    const showWardrobe = (v) => { const w = root.getObjectByName("wardrobe"); if (w) w.visible = v; }; // it stands beside the corner camera and on the arrival walk, so it only exists while you are in the middle
    const apply = (yaw, pitch, zoom, pos) => { look.yaw = yaw; look.pitch = pitch; setZoom(zoom); camera.position.copy(pos); applyLook(); render(); };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { apply(target.yaw, target.pitch, target.zoom, target.pos); centred = abs; showWardrobe(abs); return Promise.resolve(true); }
    const from = { yaw: look.yaw, pitch: look.pitch, zoom: camera.zoom, pos: camera.position.clone() }, dy = wrapPi(target.yaw - from.yaw), t0 = performance.now(), T = abs || centred ? 1100 : 650, run = ++lookRun, ease = (k) => k * k * (3 - 2 * k);
    travelling = abs || centred; if (travelling) showWardrobe(true);
    return new Promise((resolve) => {
      const step = (now) => {
        if (run !== lookRun) { travelling = false; resolve(false); return; }
        const k = ease(Math.min(1, (now - t0) / T));
        apply(from.yaw + dy * k, from.pitch + (target.pitch - from.pitch) * k, from.zoom + (target.zoom - from.zoom) * k, from.pos.clone().lerp(target.pos, k));
        if (now - t0 < T) requestAnimationFrame(step); else { centred = abs; travelling = false; showWardrobe(abs); look.yaw = target.yaw; applyLook(); render(); resolve(true); }
      };
      requestAnimationFrame(step);
    });
  }
  let drag = null, arriving = false, travelling = false; // travelling: the camera is walking between the corner and the middle, so a drag waits
  const el = renderer.domElement;
  el.style.touchAction = "none"; el.style.cursor = "grab";
  // Dragging should feel like Room 01's orbit: the scene follows the finger at every zoom (a zoomed look would otherwise run faster than the finger)
  // and keeps gliding a moment after you let go (a short glide that eases out, like OrbitControls' damping).
  let glide = 0, vel = { x: 0, y: 0 }, lastMove = 0;
  el.addEventListener("pointerdown", (e) => { if (arriving || travelling) return; lookRun++; glide++; vel = { x: 0, y: 0 }; drag = { x: e.clientX, y: e.clientY }; el.setPointerCapture(e.pointerId); el.style.cursor = "grabbing"; });
  el.addEventListener("pointermove", (e) => {
    if (!drag || arriving) return;
    const k = camera.fov * Math.PI / 180 / (el.clientHeight || 500) / camera.zoom; // radians per pixel
    const now = performance.now(), dt = Math.max(8, now - (lastMove || now - 16)) / 1000;
    const dx = (e.clientX - drag.x) * k, dy = (e.clientY - drag.y) * k;
    controls.turn(dx, dy);
    vel = { x: vel.x * .5 + dx / dt * .5, y: vel.y * .5 + dy / dt * .5 }; lastMove = now;
    drag = { x: e.clientX, y: e.clientY };
  });
  const endDrag = () => {
    const wasDragging = !!drag; drag = null; el.style.cursor = "grab";
    if (!wasDragging || matchMedia("(prefers-reduced-motion: reduce)").matches || performance.now() - lastMove > 90 || Math.hypot(vel.x, vel.y) < .08) { lastMove = 0; return; }
    lastMove = 0; const run = ++glide; let t = performance.now();
    const step = (now) => {
      if (run !== glide || arriving || travelling) return;
      const dt = Math.min(.05, (now - t) / 1000); t = now;
      const before = look.yaw + look.pitch; controls.turn(vel.x * dt, vel.y * dt);
      const f = Math.exp(-dt / .22); vel = { x: vel.x * f, y: vel.y * f };
      if (Math.hypot(vel.x, vel.y) > .02 && (look.yaw + look.pitch !== before)) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  el.addEventListener("pointerup", endDrag); el.addEventListener("pointercancel", endDrag);
  // Tap the little robot (same as Room 01's): it hops, turns to look at you, then turns back. Only a tap counts, not a drag; with reduced
  // motion it just turns. The robot is loaded later, so it is looked up when tapped.
  const tapTargets = { robot: null }, tapRay = new THREE.Raycaster(), tapAt = new THREE.Vector2();
  let downAt = null, hopping = false;
  el.addEventListener("pointerdown", (e) => { downAt = [e.clientX, e.clientY]; });
  el.addEventListener("pointerup", (e) => {
    const rb = tapTargets.robot;
    if (!rb || !downAt || hopping || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return;
    const r = el.getBoundingClientRect(); tapAt.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    tapRay.setFromCamera(tapAt, camera);
    if (!tapRay.intersectObject(rb, true).length) return;
    hopping = true;
    const home = { y: rb.position.y, r: rb.rotation.y }, look = Math.atan2(camera.position.x - rb.position.x, camera.position.z - rb.position.z); // the robot faces +z
    const dr = Math.atan2(Math.sin(look - home.r), Math.cos(look - home.r)), reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, t0 = performance.now(), T = 1400;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / T), turn = k < .3 ? k / .3 : k < .75 ? 1 : 1 - (k - .75) / .25, ease = turn * turn * (3 - 2 * turn); // turn to you, hold, turn back
      rb.rotation.y = home.r + dr * ease;
      rb.position.y = home.y + (reduce ? 0 : Math.max(0, Math.sin(Math.min(1, k / .3) * Math.PI)) * .09);
      render();
      if (k < 1) requestAnimationFrame(step); else { rb.position.y = home.y; rb.rotation.y = home.r; hopping = false; render(); }
    };
    requestAnimationFrame(step);
  });

  // Arriving from Room 01's door: the camera starts in the doorway at eye height, looking into the room, then walks to the middle of the
  // room (the opening look), clear of the wardrobe. Reduced motion: it simply starts there.
  function arrive() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return Promise.resolve(false);
    arriving = true;
    const from = { pos: new THREE.Vector3(DOOR.x, 1.58, HD - .25), yaw: 0, pitch: -.04 };
    camera.position.copy(from.pos); look.yaw = from.yaw; look.pitch = from.pitch; applyLook(); render(); // the first frame is already in the doorway
    const t0 = performance.now(), T = 2600, ease = (k) => k * k * (3 - 2 * k);
    return new Promise((resolve) => {
      const step = (now) => {
        const k = Math.min(1, (now - t0) / T), e = ease(k), lift = ease(Math.min(1, Math.max(0, (k - .25) / .75)));
        camera.position.lerpVectors(from.pos, CENTER, e);
        look.yaw = from.yaw + (LOOKS.center.yaw - from.yaw) * lift; look.pitch = from.pitch + (LOOKS.center.pitch - from.pitch) * lift;
        applyLook(); render();
        if (k < 1) requestAnimationFrame(step); else { camera.position.copy(CENTER); look.yaw = LOOKS.center.yaw; look.pitch = LOOKS.center.pitch; setZoom(LOOKS.center.zoom); centred = true; lookName = "center"; applyLook(); arriving = false; render(); resolve(true); }
      };
      requestAnimationFrame(step);
    });
  }

  // ---------- materials ----------
  const wallMat = new THREE.MeshStandardMaterial({ color: "#f5eee2", roughness: .95 }); // designer pass: one family of warm whites on the plain walls, not three beiges
  const mainWallMat = new THREE.MeshStandardMaterial({ color: "#f1e9db", roughness: .95 });
  const trimMat = new THREE.MeshStandardMaterial({ color: "#efe9dc", roughness: .7 });
  const frameMat = new THREE.MeshStandardMaterial({ color: "#f1ede4", roughness: .55 });
  const floorMat = new THREE.MeshStandardMaterial({ map: boardsTexture(), color: "#f0e7da", roughness: .66 }); // a touch less orange: natural oak, not honey
  art("room02-e1-oak-floor-v1.webp", { repeat: [ROOM.w / 1.2, ROOM.d / 1.2], apply: (t) => { floorMat.map = t; floorMat.needsUpdate = true; } }); // one picture is about 1.2 m of boards
  const ceilMat = new THREE.MeshStandardMaterial({ color: "#f3efe6", roughness: 1 });
  const doorMat = new THREE.MeshStandardMaterial({ color: "#a9825a", roughness: .62 });
  const metalMat = new THREE.MeshStandardMaterial({ color: "#8d8a84", roughness: .35, metalness: .6 });

  let renderSoon = null; // set to render() further down, once it exists
  let wallCement = null; // the soft paint finish, kept so a colour swap can put it back after the wallpaper
  const wallTexApply = (t) => { wallCement = t; for (const m of [wallMat, mainWallMat, featureMat]) { if (m === featureMat && chosen.wall === "paper") continue; m.map = t; m.needsUpdate = true; } };
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
  // the west wall (the big wall in the overview) takes the swappable feature colour; the east wall stays a quiet warm tone
  add(box(T, ROOM.h, ROOM.d + T * 2), mainWallMat, "wall-main-east", HW + T / 2, ROOM.h / 2, 0);
  // The west wall, behind the desk, the TV and the posters, is wallpaper (Paul 2026-10-23: the view outside reads as New York, and American flats
  // paper their walls): Room 01's botanical leaf paper (Paul chose it): cream with soft sage vines, one picture about 1.1 m wide.
  // The colour options below swap it for plain colour as before.
  const stripeTex = new THREE.TextureLoader().load(new URL("../tex/wallpaper-botanical-v1.webp", import.meta.url).href, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; renderSoon?.(); }); // render() does not exist yet at this point
  stripeTex.wrapS = stripeTex.wrapT = THREE.RepeatWrapping; stripeTex.repeat.set((ROOM.d + .2) / 1.1, ROOM.h / 1.1); stripeTex.anisotropy = 8;
  const featureMat = new THREE.MeshStandardMaterial({ color: "#ffffff", map: stripeTex, roughness: .95 }); // the west wall: wallpaper, or a swappable colour
  art("room02-e2-warm-wall-v1.webp", { repeat: [2.2, 1.6], apply: wallTexApply }); // a soft micro-cement / paint finish, multiplied by each wall colour
  add(box(T, ROOM.h, ROOM.d + T * 2), featureMat, "wall-west", -HW - T / 2, ROOM.h / 2, 0);

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
  // Codex's painted frame (a slim white double casement with a handle and hinges; the glass area is fully transparent). It replaces the
  // five plain boxes once it has loaded, and a little overlap onto the wall hides the seam.
  const sashMat = new THREE.MeshStandardMaterial({ transparent: true, alphaTest: .04, roughness: .55 });
  const sash = new THREE.Mesh(new THREE.PlaneGeometry(WINDOW.w + .04, WINDOW.h + .04), sashMat);
  sash.name = "window-sash"; sash.visible = false; sash.position.set(WINDOW.x, WINDOW.sill + WINDOW.h / 2, -HD + .045); root.add(sash);
  art("room02-window-frame-v1.webp", { apply: (t) => {
    sashMat.map = t; sashMat.needsUpdate = true; sash.visible = true;
    for (const n of ["window-frame-top", "window-frame-bottom", "window-frame-left", "window-frame-right", "window-mullion"]) { const o = root.getObjectByName(n); if (o) o.visible = false; }
  } });
  // The view outside is a painted pair (day and night), same buildings and framing. The plane sits 1.2 m behind the wall, so a
  // camera never gets close enough to see its edges; windowArt().covers proves the four window corners stay inside it.
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
  // A balcony rail and two plants painted on a layer just outside the window, so the city sits beyond them instead of looking pasted on.
  // The camera only turns, so depth comes from this foreground, not from parallax. The night version has not been painted yet:
  // until it arrives the day layer is shown darker at night.
  const fgTex = {};
  const fgMat = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false });
  const fg = new THREE.Mesh(new THREE.PlaneGeometry(2.25, 1.4), fgMat);
  fg.name = "window-foreground"; fg.visible = false; fg.renderOrder = 2; fg.position.set(WINDOW.x, WINDOW.sill + WINDOW.h / 2 + .02, -HD - .4); root.add(fg);
  const updateForeground = () => {
    const t = fgTex[skyTime] ?? fgTex.day; if (!t) return;
    fgMat.map = t; fgMat.color.setScalar(fgTex[skyTime] ? 1 : .38); fgMat.needsUpdate = true; fg.visible = true; redraw();
  };
  art("room02-window-foreground-day-v1.webp", { apply: (t) => { fgTex.day = t; updateForeground(); } });
  art("room02-window-foreground-night-v1.webp", { apply: (t) => { fgTex.night = t; updateForeground(); } }); // the same railing and plants, in blue night light
  async function setTime(time) {
    const t = await loadSky(time);
    if (!t) return false;
    skyTime = time; skyMat.map = t; skyMat.color.set("#ffffff"); skyMat.needsUpdate = true; updateForeground(); render();
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
  const sleepRugMat = new THREE.MeshStandardMaterial({ map: weaveTexture("#e0d2b8", "#9a8662"), roughness: 1 });
  zoneRug(.63, 1.8, .45, -1.0, sleepRugMat, "zone-sleep-rug"); // a runner along the bed's open side, between the bedside table and the foot
  const cutout = (mat) => { mat.transparent = true; mat.alphaTest = .45; mat.needsUpdate = true; };
  const tvRugMat = new THREE.MeshStandardMaterial({ map: weaveTexture("#e0d2b8", "#9a8662"), roughness: 1 });
  zoneRug(1.2, 1.7, -1.05, .95, tvRugMat, "zone-tv-rug"); // in front of the TV, between the console and the coffee table
  art("room02-rug-oat-v1.webp", { apply: (t) => { tvRugMat.map = t; cutout(tvRugMat); } }); // an oat rug seen whole from above, with its fringe
  // The rugs Codex drew on white are trimmed to the rug's own edge with the white made transparent, so a rug is only as big as the rug.
  art("room02-rug-runner-v1.webp", { apply: (t) => { sleepRugMat.map = t; cutout(sleepRugMat); } });
  const loungeRugMat = new THREE.MeshStandardMaterial({ map: weaveTexture("#a9b1b8", "#5d6a76", { stripes: true }), roughness: 1 });
  zoneRug(1.6, 2.3, .55, 1.3, loungeRugMat, "zone-lounge-rug"); // the sofa's front legs stand on its east end
  const rugArt = {};
  for (const [k, file] of [["modern", "room02-rug-modern-v1.webp"], ["stripe", "room02-a1-living-rug-v1.webp"], ["oat", "room02-rug-oat-v1.webp"]])
    art(file, { apply: (t) => { rugArt[k] = t; if (chosen.rug === k) { loungeRugMat.map = t; if (k === "modern" || k === "oat") cutout(loungeRugMat); loungeRugMat.needsUpdate = true; } } });

  // ---------- sleep zone: a 110 x 200 cm bed along the east wall, head to the window wall ----------
  // Real sizes: mattress top 48 cm, pillow 70 x 45 cm, duvet 105 cm wide. The window sits at x < 0.8, so the headboard stays clear of it.
  const BED = { x: 1.4, z: -1.325, w: 1.1, l: 2.15, top: .48 }; // 2.15 m long, head against the north wall (Paul: a 185 cm person has to fit)
  const woodTex = (base, dark, light) => canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 140; i++) { const y = (i * 53) % h, a = .05 + (i % 6) * .018; ctx.strokeStyle = (i % 3 ? dark : light).replace("A", a.toFixed(3)); ctx.lineWidth = .8 + (i % 4) * .5;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(w * .3, y + ((i * 7) % 9) - 4, w * .65, y + ((i * 11) % 9) - 4, w, y + ((i * 5) % 7) - 3); ctx.stroke(); }
    for (let i = 0; i < 6; i++) { ctx.fillStyle = "rgba(60,38,20,.10)"; ctx.beginPath(); ctx.ellipse((i * 97) % w, (i * 61) % h, 14, 4, 0, 0, 7); ctx.fill(); } // a few knots and cathedral marks
  });
  const woods = [];
  let oakImg = null; // set once the painted oak arrives, so pieces made later pick it up too
  const woodMat = (base, { rough = .62, tint = "#ffffff" } = {}) => { const t = woodTex(base, "rgba(70,42,20,A)", "rgba(255,235,200,A)"); const m = new THREE.MeshStandardMaterial({ map: t, bumpMap: t, bumpScale: .6, roughness: rough }); m.userData.tint = tint; woods.push(m); if (oakImg) { m.map = oakImg; m.bumpMap = oakImg; m.bumpScale = .5; m.color.set(tint); } return m; };
  art("room02-a3-oak-grain-v1.webp", { apply: (t) => { oakImg = t; for (const m of woods) { m.map = t; m.bumpMap = t; m.bumpScale = .5; m.color.set(m.userData.tint); m.needsUpdate = true; } } }); // the painted oak, tinted per piece
  const oak = woodMat("#b8895a", { rough: .66, tint: "#e3d6cc" });
  // Bedding tones: the duvet reads ~4-5 % darker and ~3 % warmer than the sheet, so the two do not merge into one white slab.
  const DUVET_TINT = [1.03, .995, .94];
  const sheetMat = new THREE.MeshStandardMaterial({ color: "#efe8dd", roughness: .95 });
  const duvetMat = new THREE.MeshStandardMaterial({ roughness: 1 });
  duvetMat.color.setRGB(...DUVET_TINT);
  const throwMat = new THREE.MeshStandardMaterial({ map: weaveTexture("#4b5059", "#33373d"), roughness: 1 });
  const beddingArt = {};
  duvetMat.userData.plain = true;
  const linenNoise = () => canvasTex(256, 256, (ctx, w, h) => { // plain greige linen: a soft colour with the faintest slubs, no pattern
    ctx.fillStyle = "#d8d1c4"; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 420; i++) { ctx.fillStyle = `rgba(${i % 2 ? "120,108,92" : "255,252,244"},${.03 + (i % 5) * .012})`; ctx.fillRect((i * 67) % w, (i * 29) % h, 6 + (i * 13) % 26, 1 + (i % 2)); }
  }, { repeat: [1.6, 1.6] });
  const useBeddingArt = () => { // the painted weaves belong to the "stone" bedding; the other sets keep their code-drawn weaves
    duvetMat.map = beddingArt.duvet ?? linenNoise(); const k = beddingArt.duvet ? 1.25 : 1; duvetMat.color.setRGB(DUVET_TINT[0] * k, DUVET_TINT[1] * k, DUVET_TINT[2] * k); duvetMat.needsUpdate = true;
    if (!beddingArt.throw) return;
    throwMat.map = beddingArt.throw; throwMat.color.setScalar(1.35); throwMat.needsUpdate = true;
  };
  duvetMat.map = linenNoise();
  art("room02-a5-throw-weave-v1.webp", { repeat: [3.3, 3.3], apply: (t) => { beddingArt.throw = t; if (chosen.bedding === "stone") useBeddingArt(); } });
  art("room02-linen-duvet-v1.webp", { repeat: [5.7, 5.7], apply: (t) => { beddingArt.duvet = t; if (chosen.bedding === "stone") useBeddingArt(); } }); // Codex's plain greige linen, about 30 cm a tile
  const pillowMat = new THREE.MeshStandardMaterial({ color: "#f3eee3", roughness: .95, side: THREE.DoubleSide });
  art("room02-cotton-v1.webp", { repeat: [2.3, 1.5], apply: (t) => { pillowMat.map = t; pillowMat.color.set("#ffffff"); pillowMat.needsUpdate = true; } });
  const bed = new THREE.Group(); bed.name = "bed"; root.add(bed);
  const part = (geo, mat, name, x, y, z) => {
    const m = new THREE.Mesh(geo, mat); m.name = name; m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; bed.add(m); return m;
  };
  const north = BED.z - BED.l / 2; // z of the head end
  // A low upholstered platform bed (Codex's D1 reference): the fabric frame floats on small black feet and the headboard is three
  // soft horizontal channels, 95 cm tall. Not a wooden slab, not a classic bed.
  const upholst = new THREE.MeshStandardMaterial({ map: weaveTexture("#b9ad9d", "#8f8576"), roughness: 1 });
  const bedFoot = new THREE.MeshStandardMaterial({ color: "#23262b", roughness: .45, metalness: .25 });
  art("room02-boucle-v1.webp", { repeat: [3.3, 3.3], apply: (t) => { upholst.map = t; upholst.color.setScalar(1.35); upholst.needsUpdate = true; } }); // bouclé: the little looped yarn that reads as soft upholstery
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) part(box(.07, .07, .07), bedFoot, "bed-leg", BED.x + dx * (BED.w / 2 - .1), .035, BED.z + dz * (BED.l / 2 - .12));
  part(softBox(BED.w + .06, .19, BED.l + .06, .035), upholst, "bed-frame", BED.x, .165, BED.z); // 7 cm to 26 cm, floating on the feet
  part(softBox(BED.w, .22, BED.l - .02, .03), sheetMat, "bed-mattress", BED.x, .26 + .11, BED.z); // top at 48 cm
  for (let k = 0; k < 2; k++) { const ch = part(softBox(BED.w + .06, .09, .225, .05), upholst, "bed-headboard", BED.x, .385 + k * .235, north - .045); ch.rotation.x = Math.PI / 2; } // two channels, 26 cm to 73 cm: a third one would reach the window sill (90 cm), which sticks out of the wall beside the bed
  // Soft goods. A box with segments, pushed into soft folds on top and rolled over at the edges, reads as cloth instead of a slab;
  // pillows are plump ellipsoids. Sizes are real: duvet 106 cm wide, pillow 70 x 45 cm, cushion 45 x 30 cm.
  const cloth = (w, h, d, seed, { fold = .014, roll = .05 } = {}) => {
    const g = new THREE.BoxGeometry(w, h, d, Math.round(w * 14), 1, Math.round(d * 15)), pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i); let y = pos.getY(i);
      const up = y > 0 ? 1 : .25, edge = Math.max(Math.abs(x) / (w / 2), Math.abs(z) / (d / 2));
      y += up * fold * (Math.sin(x * 11 + seed) * Math.sin(z * 7 + seed * 1.7) + .5 * Math.sin(z * 17 + x * 5 + seed)) - up * Math.pow(edge, 5) * roll;
      pos.setY(i, y);
    }
    g.computeVertexNormals(); return g;
  };
  // A pillow is two soft sheets sewn along a square outline: plump in the middle, pinched at the seam — but the seam keeps a
  // 1.8 cm welt so the rim reads as fabric rather than paper, and the corners taper to a point. A narrow band joins the two sheets
  // along the rim, so the pillow is closed and casts a solid shadow. (A smooth ellipsoid reads as a stone.)
  const pillowGeo = (w, h, d, dent = .02) => {
    const nx = 16, nz = 11, row = nx + 1, n = row * (nz + 1), welt = .018;
    const pos = [], uv = [], idx = [];
    for (const side of [1, -1]) for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
      const u = i / nx * 2 - 1, v = j / nz * 2 - 1;
      const t = Math.pow(Math.max(1 - u * u, 0), .5) * Math.pow(Math.max(1 - v * v, 0), .5);
      const corner = Math.min(1, Math.min(1 - Math.abs(u), 1 - Math.abs(v)) / .22); // 0 at the corners, 1 along the edges
      // The underside is flatter than the crown, so a pillow rests on the one under it over an area instead of touching on a single
      // point: two dome-to-dome surfaces read as floating however close they are.
      const prof = side > 0 ? t : Math.min(1, t * 2.1);
      let y = side * Math.max((h / 2) * prof, welt * Math.max(corner, .12));
      if (side > 0) y -= dent * Math.exp(-Math.pow(u / .3, 2)) * (1 - v * v);
      pos.push(u * w / 2, y, v * d / 2); uv.push(i / nx, j / nz);
    }
    for (const [side, b] of [[1, 0], [-1, n]]) for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      const a = b + j * row + i, c = a + row, bb = a + 1, e = c + 1;
      if (side > 0) idx.push(a, c, bb, bb, c, e); else idx.push(a, bb, c, bb, e, c);
    }
    const F = (i, j) => i + j * row, B = (i, j) => n + i + j * row; // the rim band closes the two sheets along the outline
    const band = (i0, j0, i1, j1) => idx.push(F(i0, j0), B(i0, j0), F(i1, j1), F(i1, j1), B(i0, j0), B(i1, j1));
    for (let i = 0; i < nx; i++) { band(i, 0, i + 1, 0); band(i + 1, nz, i, nz); }
    for (let j = 0; j < nz; j++) { band(0, j, 0, j + 1); band(nx, j + 1, nx, j); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
  };
  // The duvet is one sheet laid over the bed: flat on top with soft folds, rolled over the mattress edges and hanging 15 cm down the sides
  // and the foot, with the head end turned back in a fold. Real sizes: 106 cm across the top, covering from the foot to 30 cm from the head.
  // The hanging part sags in a low wave (~1.8 cm, 40 cm wavelength), the hem is not a straight line, and the foot/side corner gets soft
  // diagonal folds instead of a hard crease. Segment counts stay at 26 x 30; the roll radius is 7 cm.
  const duvetGeo = () => {
    const nu = 26, nv = 30, hx = .53, hzFoot = .7, hzHead = -.68, drape = .15, r = .07, arc = r * Math.PI / 2;
    const A = hx + arc + drape, Bmax = hzFoot + arc + drape, pos = [], uv = [], idx = [], row = nu + 1;
    for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
      const a = -A + 2 * A * i / nu, b = hzHead + (Bmax - hzHead) * j / nv;
      const ex = Math.max(Math.abs(a) - hx, 0), ez = Math.max(b - hzFoot, 0), hang = Math.max(ex, ez);
      const off = (e) => (e < arc ? r * Math.sin(e / r) : r), dropOf = (e) => (e < arc ? r * (1 - Math.cos(e / r)) : r + (e - arc)); // the roll over an edge, then straight down
      let x = a, z = b, y = 0;
      if (ex > 0 || ez > 0) {
        if (ex > 0) x = Math.sign(a) * (hx + off(ex));
        if (ez > 0) z = hzFoot + off(ez);
        y = -Math.max(dropOf(ex), dropOf(ez));
        // Gravity sag: the cloth leaves the roll attached, then dips; faded in so the top of the drape stays put.
        const fade = Math.min(1, Math.max(0, (hang - arc) / .06));
        y -= (.018 * Math.sin(b * 15.2 + .8) + .011 * Math.sin(a * 12.1 + 2.1)) * fade;
        // The hem is not a straight line (+-1.5 cm), so the bottom edge reads as fabric.
        if (hang > arc + drape * .8) y -= (.012 * Math.sin(b * 19.3 + .4) + .009 * Math.sin(a * 17.7 + 1.1));
        // Soft diagonal folds where the foot and side drapes meet, instead of one hard crease.
        const corner = Math.exp(-Math.pow(ex - ez, 2) / .0016) * Math.min(1, hang / .08);
        if (corner > .01) { const push = .010 * Math.sin((ex + ez) * 42 + 1.3) * corner; z += push; } // fold in depth only: keeps the duvet inside the bed width
      } else {
        y += .011 * Math.sin(a * 9 + 1.3) * Math.sin(b * 5.5) + .007 * Math.sin(b * 13 + a * 3) + .018 * Math.exp(-Math.pow((b - (hzHead + .1)) / .07, 2)) // a turned-back head fold
          - .014 * Math.exp(-Math.pow((b - hzHead) / .035, 2));
      }
      pos.push(x, y, z); uv.push((a + A) / (2 * A), (b - hzHead) / (Bmax - hzHead));
    }
    for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const a = j * row + i, c = a + row; idx.push(a, c, a + 1, a + 1, c, c + 1); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
  };
  const codeDuvet = part(duvetGeo(), duvetMat, "bed-duvet", BED.x, BED.top + .06, BED.z + .3); // from the foot to 30 cm from the head: the code-made sheet stays until Codex's duvet has loaded
  // Codex's duvet (batch 13): one sheet with a turned-back edge at the head, uneven soft folds and hanging sides, origin at the middle of the mattress top
  // (head at -z). Its UVs are 1 per metre, so they are scaled to the old sheet's so the same linen picture tiles about 30 cm wide.
  loadGlb(new URL("./models/duvet-v1.glb", import.meta.url).href, { anchor: "none", roughness: 1 }).then((g) => {
    g.traverse((o) => { if (!o.isMesh) return; o.material = duvetMat; const uv = o.geometry.attributes.uv; for (let i = 0; i < uv.array.length; i++) uv.array[i] /= 1.7; uv.needsUpdate = true; });
    const head = BED.z - BED.l / 2, foot = BED.z + BED.l / 2, k = ((foot + .072) - (head + .3)) / 1.772; // the file is made for a 2.0 m bed: stretch it so its fold starts 30 cm from the head and the foot hangs at the foot
    g.scale.z = k; g.name = "bed-duvet"; g.position.set(BED.x, BED.top, head + .3 + .7 * k); codeDuvet.parent.remove(codeDuvet); root.add(g); redraw();
  }).catch(() => {});
  // The throw is a knitted strip laid across the foot, longer than the bed is wide: flat on the duvet, rolled over the mattress edges and
  // hanging 10-15 cm down each side, a little longer on one side than the other, with a folded-over band across it and a short fringe on
  // both hems. Real sizes: 36 cm deep, lying on the duvet's top (6 cm above the mattress).
  const throwGeo = () => {
    const nu = 28, nv = 14, d = .36, hx = .535, r = .052, arc = r * Math.PI / 2, pos = [], uv = [], idx = [], row = nu + 1, hems = { "-1": [], 1: [] };
    const drape = (side, b) => .13 + side * .018 + .014 * Math.sin(b * 16 + 1.1), Amax = hx + arc + .17;
    const off = (e) => (e < arc ? r * Math.sin(e / r) : r), dropOf = (e) => (e < arc ? r * (1 - Math.cos(e / r)) : r + (e - arc));
    for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
      const b = -d / 2 + d * j / nv, a = -Amax + 2 * Amax * i / nu, side = Math.sign(a) || 1, ex = Math.min(Math.max(Math.abs(a) - hx, 0), arc + drape(side, b));
      let x = a, y = .006 * Math.sin(a * 10 + .8) * Math.sin(b * 9 + .4) + .011 * Math.exp(-Math.pow((b - .05) / .05, 2)) - .012 * Math.pow(Math.abs(b) / (d / 2), 6); // soft waves, a folded-over band, hems that dip
      if (ex > 0) { x = side * (hx + off(ex)); y -= dropOf(ex) * (1 + .05 * Math.sin(b * 23)); } // rolled over the edge, then straight down, never perfectly
      pos.push(x, y, b); uv.push(a / 1.06 + .5, b / 1.06 + .5);
      if (Math.abs(a) >= Amax - 2 * Amax / nu * .5) hems[side].push([x, y, b]);
    }
    for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const a0 = j * row + i, c = a0 + row; idx.push(a0, c, a0 + 1, a0 + 1, c, c + 1); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    // the fringe: 26 thin tassels on each hem, one geometry
    const fp = [], fuv = [], fidx = []; let k = 0;
    for (const side of [-1, 1]) for (let n = 0; n < 26; n++) {
      const b = -d / 2 + .012 + (d - .024) * n / 25, h = hems[side].reduce((m, q) => (Math.abs(q[2] - b) < Math.abs(m[2] - b) ? q : m)), len = .07 + .014 * Math.sin(n * 2.3), w = .006;
      fp.push(h[0] - w, h[1], b, h[0] + w, h[1], b, h[0] + w * .6, h[1] - len, b, h[0] - w * .6, h[1] - len, b);
      fuv.push(0, 1, 1, 1, 1, 0, 0, 0); fidx.push(k, k + 1, k + 2, k, k + 2, k + 3); k += 4;
    }
    const f = new THREE.BufferGeometry(); f.setAttribute("position", new THREE.Float32BufferAttribute(fp, 3)); f.setAttribute("uv", new THREE.Float32BufferAttribute(fuv, 2)); f.setIndex(fidx); f.computeVertexNormals();
    return { g, f };
  };
  { const { g, f } = throwGeo(), tx = BED.x, ty = BED.top + .084, tz = BED.z + .695; // 38 cm from the foot
    throwMat.side = THREE.DoubleSide;
    part(g, throwMat, "bed-throw", tx, ty, tz);
    part(f, throwMat, "bed-throw-fringe", tx, ty, tz); }
  // 19 cm pillow. The grey cushion that leaned on it is gone (Paul: it looked fake); the pillow alone reads cleaner.
  const bedPillow = part(pillowGeo(.7, .19, .46, .026), pillowMat, "bed-pillow", BED.x, BED.top + .082, north + .36);
  bedPillow.rotation.set(0, .05, .012);
  // bedside table in the cream-and-walnut style Paul sent a photo of (40 x 40 x 50 cm): a walnut top with a small overhang, a soft cream body with two drawer
  // fronts and a dark gap between them, a black plinth; and a lamp with a turned walnut base and a cone shade; the shade glows a little by itself
  const tx = BED.x - BED.w / 2 - .27, tz = north + .27;
  const walnut = new THREE.MeshStandardMaterial({ color: "#6b4a33", roughness: .5 }), creamBody = new THREE.MeshStandardMaterial({ color: "#e6dcca", roughness: .85 });
  part(rb(.43, .03, .43), walnut, "bedside-top", tx, .485, tz); // top face at 50 cm
  part(rb(.38, .41, .38), creamBody, "bedside-body", tx, .275, tz);
  part(box(.34, .06, .34), new THREE.MeshStandardMaterial({ color: "#1f1d1b", roughness: .7 }), "bedside-plinth", tx, .03, tz);
  for (const y of [.18, .385]) part(rb(.34, .185, .012), creamBody, "bedside-drawer", tx, y, tz + .19 + .003);
  part(box(.34, .01, .008), new THREE.MeshStandardMaterial({ color: "#5a3f2c", roughness: .6 }), "bedside-drawer-gap", tx, .283, tz + .193);
  const lampBase = part(new THREE.LatheGeometry([[0, 0], [.055, 0], [.062, .02], [.05, .06], [.032, .1], [.022, .14], [.02, .17], [.03, .2], [.034, .215], [0, .215]].map(([x, y]) => new THREE.Vector2(x, y)), 24), walnut, "lamp-base", tx, .5, tz);
  part(new THREE.CylinderGeometry(.012, .012, .1, 8), metalMat, "lamp-stem", tx, .73, tz);
  part(new THREE.CylinderGeometry(.075, .14, .17, 28, 1, true), new THREE.MeshStandardMaterial({ color: "#f4e6c8", emissive: "#e9b86a", emissiveIntensity: .35, roughness: .9, side: THREE.DoubleSide }), "lamp-shade", tx, .785, tz);

  // ---------- work / game zone: desk along the west wall, ultrawide monitor, console, gaming chair ----------
  // Real sizes: desk 140 x 65 cm, top at 75 cm; 34-inch ultrawide panel 80 x 34 cm; chair seat at 48 cm. Built facing +z and turned so the
  // monitor looks east into the room. No logos or text anywhere; the screen is an abstract night-city game scene.
  const deskMat = woodMat("#c9a77c");
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
  // Pure black took every highlight away and made the chair and the desk legs read as flat silhouettes: a lighter graphite with a little metal
  // lets the light roll off the edges, and the seat is a slate-grey fabric.
  const graphite = new THREE.MeshStandardMaterial({ color: "#5d626b", roughness: .4, metalness: .35 });
  const seatFabric = new THREE.MeshStandardMaterial({ map: weaveTexture("#69727d", "#4f5862"), roughness: .95 });
  const desk = new THREE.Group(); desk.name = "desk"; desk.position.set(-HW + .325, 0, -1.75); desk.rotation.y = Math.PI / 2; root.add(desk);
  const dpart = hold(desk);
  dpart(rb(1.4, .03, .65), deskMat, "desk-top", 0, .735, 0); // top face at 75 cm
  for (const sx of [-1, 1]) { // an inverted T at each end: a column and a long foot
    dpart(rb(.06, .69, .06), graphite, "desk-leg", sx * .62, .375, 0);
    dpart(rb(.06, .03, .58), graphite, "desk-foot", sx * .62, .015, 0);
  }
  dpart(box(1.2, .03, .09), blackMat, "desk-tray", 0, .7, -.24); // a cable tray under the back edge
  dpart(rb(.36, .09, .4), deskMat, "desk-drawer", .4, .675, .02); // a shallow drawer under the right end
  dpart(softBox(.82, .004, .32, .02), softBlack, "desk-mat", 0, .752, .12);
  dpart(box(.26, .01, .18), blackMat, "monitor-foot", 0, .755, -.1);
  dpart(box(.05, .2, .02), blackMat, "monitor-neck", 0, .86, -.16);
  dpart(rb(.8, .34, .025), blackMat, "monitor-panel", 0, 1.05, -.15);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(.77, .31), new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }));
  art("room02-a6-game-screen-v1.webp", { apply: (t) => { cityScreen = t; if (chosen.screen === "city") screen.material.map = t; screen.material.needsUpdate = true; } });
  screen.name = "monitor-screen"; screen.position.set(0, 1.05, -.15 + .0135); desk.add(screen);
  dpart(box(.42, .018, .13), new THREE.MeshStandardMaterial({ map: keysTex, roughness: .6 }), "keyboard", -.02, .765, .16);
  dpart(softBox(.065, .03, .11, .025), blackMat, "mouse", .33, .767, .16);
  dpart(box(.28, .06, .22), new THREE.MeshStandardMaterial({ color: "#e9e6df", roughness: .5 }), "console", -.55, .785, -.08); // white slim console, no logo
  dpart(box(.012, .004, .2), new THREE.MeshStandardMaterial({ color: "#69b8ff", emissive: "#69b8ff", emissiveIntensity: 1 }), "console-light", -.55, .816, -.08);
  // Screens (round 2): the painted night city, plus three drawn in code: a neon grid horizon, an editor-like work view made only of
  // coloured bars (no words), and a calm gradient wallpaper.
  let cityScreen = screen.material.map; // the painted city replaces this stand-in when it loads
  const screens = { city: null, grid: null, work: null, calm: null };
  const drawScreen = (name) => canvasTex(512, 216, (ctx, w, h) => {
    if (name === "grid") {
      const g = ctx.createLinearGradient(0, 0, 0, h * .6); g.addColorStop(0, "#150a33"); g.addColorStop(1, "#6a2a8a"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ffb86b"; ctx.beginPath(); ctx.arc(w / 2, h * .5, 46, Math.PI, 0); ctx.fill();
      ctx.fillStyle = "#1a0d3a"; ctx.fillRect(0, h * .6, w, h * .4); ctx.strokeStyle = "#ff5fd0"; ctx.lineWidth = 1.3;
      for (let i = -10; i <= 10; i++) { ctx.beginPath(); ctx.moveTo(w / 2 + i * 12, h * .6); ctx.lineTo(w / 2 + i * 62, h); ctx.stroke(); }
      for (let k = 0; k < 7; k++) { const y = h * .6 + Math.pow(k / 7, 2) * h * .4; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    } else if (name === "work") {
      ctx.fillStyle = "#1b1f27"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#12151b"; ctx.fillRect(0, 0, 70, h); ctx.fillRect(w - 50, 0, 50, h);
      const cols = ["#7aa2f7", "#9ece6a", "#e0af68", "#bb9af7", "#7dcfff", "#c0caf5"];
      for (let r = 0; r < 14; r++) { let x = 90 + (r % 4) * 18; for (let k = 0; k < 2 + (r * 3) % 4; k++) { const len = 22 + ((r * 31 + k * 17) % 70); ctx.fillStyle = cols[(r + k * 2) % cols.length]; ctx.fillRect(x, 14 + r * 14, len, 6); x += len + 8; } }
      ctx.fillStyle = "#2a2f3a"; for (let r = 0; r < 9; r++) ctx.fillRect(10, 16 + r * 18, 44 - (r % 3) * 10, 6);
    } else {
      const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#9fb4d6"); g.addColorStop(.55, "#e8c9b8"); g.addColorStop(1, "#f4dfc0"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      for (const [c, y, a] of [["#8aa0c0", .62, .9], ["#6f8aa8", .74, 1.3], ["#4f6a85", .86, .7]]) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, h); for (let x = 0; x <= w; x += 16) ctx.lineTo(x, h * y + Math.sin(x / 70 * a) * 14); ctx.lineTo(w, h); ctx.fill(); }
    }
  });
  // LED bias strip: a thin emissive bar on the wall behind the monitor and a soft additive glow on the wall
  dpart(box(.9, .012, .012), new THREE.MeshStandardMaterial({ color: "#ffb066", emissive: "#ffb066", emissiveIntensity: 1.4 }), "led-strip", 0, .92, -.315);
  const glowTex = canvasTex(256, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 6, w / 2, h / 2, w / 2); g.addColorStop(0, "rgba(255,255,255,.8)"); g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 1.0), new THREE.MeshBasicMaterial({ map: glowTex, color: "#ffb066", transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .55, toneMapped: false }));
  glow.name = "led-glow"; glow.position.set(0, 1.0, -.322); desk.add(glow);
  // Desk sets (round 2): minimal (just the keyboard and mouse), gamer (headphones on a stand and a gamepad), coffee (a small espresso machine
  // and a cup, for people who really like coffee), creative (an adjustable lamp, a notebook and a pen pot). Each is a few dozen cheap shapes.
  const deskSets = {};
  const deskSet = (name, build) => { const g = new THREE.Group(); g.name = "deskset-" + name; g.visible = name === "minimal"; desk.add(g); build(hold(g)); deskSets[name] = g; };
  const steel = new THREE.MeshStandardMaterial({ color: "#b9bcc0", roughness: .3, metalness: .85 });
  const ceramicWhite = new THREE.MeshStandardMaterial({ color: "#f1ece2", roughness: .4 });
  deskSet("minimal", (p) => { // keyboard and mouse are on the desk already; one small warm-wood speaker stands at the far end (13 x 20 x 14 cm)
    p(rb(.13, .2, .14), new THREE.MeshStandardMaterial({ color: "#c9a77c", roughness: .55 }), "desk-speaker", .6, .75 + .1, -.12);
    p(new THREE.CylinderGeometry(.04, .04, .008, 24), softBlack, "desk-speaker-woofer", .6, .75 + .075, -.12 + .074).rotation.x = Math.PI / 2;
    p(new THREE.CylinderGeometry(.015, .015, .008, 16), softBlack, "desk-speaker-tweeter", .6, .75 + .163, -.12 + .074).rotation.x = Math.PI / 2;
  });
  deskSet("gamer", (p) => {
    p(new THREE.CylinderGeometry(.05, .055, .012, 20), blackMat, "headset-stand-base", .56, .756, -.14);
    p(new THREE.CylinderGeometry(.008, .008, .2, 8), blackMat, "headset-stand-post", .56, .85, -.14);
    p(new THREE.TorusGeometry(.085, .009, 6, 16, Math.PI), softBlack, "headset-band", .56, .95, -.14);
    for (const sx of [-1, 1]) p(new THREE.CylinderGeometry(.045, .045, .03, 16), softBlack, "headset-cup", .56 + sx * .085, .93, -.14).rotation.z = Math.PI / 2;
    p(rb(.15, .026, .09), new THREE.MeshStandardMaterial({ color: "#e9e6df", roughness: .5 }), "gamepad", .44, .766, .2).rotation.y = .3;
    for (const sx of [-1, 1]) p(rb(.05, .024, .075), new THREE.MeshStandardMaterial({ color: "#e9e6df", roughness: .5 }), "gamepad-grip", .44 + sx * .065 * Math.cos(.3), .765, .2 - sx * .065 * Math.sin(.3)).rotation.y = .3;
    p(new THREE.CylinderGeometry(.004, .004, .02, 6), accentMat, "gamepad-light", .44, .782, .2);
  });
  deskSet("coffee", (p) => {
    p(rb(.24, .3, .3), blackMat, "coffee-body", .56, .9, -.15);
    p(rb(.25, .03, .31), steel, "coffee-top", .56, 1.06, -.15);
    p(box(.2, .012, .16), steel, "coffee-tray", .56, .763, -.03);
    p(new THREE.CylinderGeometry(.02, .02, .05, 12), steel, "coffee-group", .56, .93, .02).rotation.x = 0;
    p(box(.012, .012, .09), blackMat, "coffee-handle", .56, .93, .075);
    p(new THREE.CylinderGeometry(.03, .03, .006, 20), steel, "coffee-gauge", .56, .99, .005).rotation.x = Math.PI / 2;
    p(new THREE.CylinderGeometry(.036, .03, .065, 16), ceramicWhite, "coffee-cup", .56, .795, -.02);
    p(new THREE.CylinderGeometry(.04, .04, .09, 16), ceramicWhite, "coffee-mug", .3, .795, .24);
  });
  const coffeeParts = [];
  const sprites = []; // camera-facing cut-outs (unlit, so their brightness is set per mood)
  deskSets.coffee.children.forEach((m) => { if (/^coffee-(body|top|tray|group|handle|gauge)$/.test(m.name)) coffeeParts.push(m); });
  art("room02-coffee-machine-v1.webp", { apply: (t) => {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, alphaTest: .03, depthWrite: false })); sp.name = "coffee-sprite";
    sp.center.set(.5, 0); sp.scale.set(.27, .3, 1); sp.position.set(.56, .751, -.12); deskSets.coffee.add(sp); sprites.push(sp);
    coffeeParts.forEach((m) => { m.visible = false; });
    sp.material.color.setScalar(SPRITE_TINT[live.mood] ?? 1); redraw();
  } });
  deskSet("creative", (p) => {
    p(new THREE.CylinderGeometry(.06, .065, .015, 18), blackMat, "lamp2-base", .56, .758, -.2);
    const a1 = p(box(.012, .3, .012), blackMat, "lamp2-arm-1", .56, .92, -.2); a1.rotation.z = .25;
    const a2 = p(box(.012, .26, .012), blackMat, "lamp2-arm-2", .5, 1.08, -.2); a2.rotation.z = -.85;
    p(new THREE.ConeGeometry(.055, .09, 16, 1, true), new THREE.MeshStandardMaterial({ color: "#2a2b2e", side: THREE.DoubleSide, roughness: .5 }), "lamp2-head", .4, 1.13, -.2).rotation.z = Math.PI + .5;
    p(rb(.2, .018, .14), new THREE.MeshStandardMaterial({ color: "#c58a62", roughness: .8 }), "notebook", .5, .765, .08).rotation.y = -.15;
    p(new THREE.CylinderGeometry(.035, .032, .09, 14), ceramicWhite, "pen-pot", -.5, .797, -.2);
    for (let i = 0; i < 4; i++) p(new THREE.CylinderGeometry(.004, .004, .07, 5), i % 2 ? accentMat : blackMat, "pen", -.5 + (i - 1.5) * .01, .86, -.2).rotation.z = (i - 1.5) * .12;
  });
  // ergonomic task chair, pulled up to the desk
  const chair = new THREE.Group(); chair.name = "chair"; chair.position.set(-.93, 0, -1.75); chair.rotation.y = -Math.PI / 2 + .1; root.add(chair);
  const cpart = hold(chair); // the code-made chair stays until Codex's chair (batch 13) has loaded, then it is replaced
  const meshTex = canvasTex(64, 64, (ctx, w, h) => { // fine woven mesh: a dark grid with a few lighter threads
    ctx.fillStyle = "#555b63"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "rgba(255,255,255,.12)";
    for (let i = 0; i < w; i += 2) { ctx.fillRect(i, 0, 1, h); ctx.fillRect(0, i, w, 1); }
  }, { repeat: [5, 6] });
  const meshMat = new THREE.MeshStandardMaterial({ map: meshTex, roughness: .8 });
  cpart(softBox(.5, .08, .48, .07), seatFabric, "chair-seat", 0, .44, 0); // top at 48 cm, a rounded waterfall front
  cpart(box(.3, .05, .28), graphite, "chair-mech", 0, .375, -.02);
  const frameBack = cpart(softBox(.5, .05, .6, .08), graphite, "chair-back-frame", 0, .78, -.265); frameBack.rotation.x = Math.PI / 2 + .14;
  const back = cpart(softBox(.44, .03, .54, .07), meshMat, "chair-back", 0, .785, -.24); back.rotation.x = Math.PI / 2 + .14;
  const lumbar = cpart(softBox(.3, .05, .13, .03), seatFabric, "chair-lumbar", 0, .64, -.205); lumbar.rotation.x = Math.PI / 2 + .14;
  for (const sx of [-1, 1]) {
    cpart(rb(.035, .2, .035), graphite, "chair-arm-post", sx * .27, .56, -.05);
    cpart(rb(.06, .025, .27), graphite, "chair-arm", sx * .27, .68, .03);
  }
  cpart(new THREE.CylinderGeometry(.035, .035, .26, 10), metalMat, "chair-lift", 0, .27, 0);
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5, arm = cpart(rb(.3, .028, .05), graphite, "chair-leg", Math.cos(a) * .15, .07, Math.sin(a) * .15);
    arm.rotation.y = -a;
    cpart(new THREE.SphereGeometry(.027, 8, 6), graphite, "chair-wheel", Math.cos(a) * .3, .027, Math.sin(a) * .3);
  }
  loadGlb(new URL("./models/computer-chair-v1.glb", import.meta.url).href, { anchor: "none" }).then((g) => {
    const meshes = []; g.traverse((o) => { if (o.isMesh) meshes.push(o); }); // four parts in the file's order: frame, mesh, seat, metal
    if (meshes.length === 4) meshes[2].name = "chair-seat";
    chair.children.slice().forEach((c) => chair.remove(c)); chair.add(g); redraw();
  }).catch(() => {});

  // ---------- lounge zone: sofa facing a TV on the west wall, coffee table, bookshelf ----------
  // Real sizes: 2-seater sofa 160 x 85 cm, seat at 44 cm, back at 82 cm; coffee table 90 x 50 x 40 cm, 33 cm in front of the sofa;
  // 43-inch TV 95 x 55 cm on a 45 cm low console, about 3 m from the sofa; bookshelf 75 x 30 x 180 cm. Books carry no text.
  const sofaMat = new THREE.MeshStandardMaterial({ color: "#6d7a86", roughness: 1 });
  const sofaDark = new THREE.MeshStandardMaterial({ color: "#5b6772", roughness: 1 });
  const pillowA = new THREE.MeshStandardMaterial({ color: "#c58a62", roughness: .95 });
  const pillowB = new THREE.MeshStandardMaterial({ color: "#e8dfcf", roughness: .95 });
  const tvReflect = canvasTex(256, 144, (ctx, w, h) => { // a switched-off TV is not flat black: it holds a faint reflection of the window and the room
    ctx.fillStyle = "#0c0e12"; ctx.fillRect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, "rgba(190,205,225,.20)"); g.addColorStop(.45, "rgba(190,205,225,.05)"); g.addColorStop(1, "rgba(255,230,200,.03)"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(205,220,240,.10)"; ctx.fillRect(18, 14, 62, 44); ctx.fillStyle = "rgba(12,14,18,.5)"; ctx.fillRect(48, 14, 2, 44); ctx.fillRect(18, 35, 62, 2); // the window, as a ghost
  });
  const tvScreen = new THREE.MeshStandardMaterial({ color: "#ffffff", map: tvReflect, roughness: .12, metalness: .3 });
  // the sofa is Codex's own Japandi model (not Room 01's), slate blue-grey, front looking west
  const sofa = await loadGlb(new URL("./models/sofa-hunyuan-v1.glb", import.meta.url).href, { roughness: .95, weave: true }); sofa.name = "sofa"; // Codex's Hunyuan-made Japandi two-seater (batch 11, 11.9k triangles): two height-zone materials, 'legs_wood_height_zone' and 'upholstery_height_zone'
  sofa.traverse((o) => { if (!o.isMesh) return; o.material.vertexColors = false; o.material.color.set(o.material.name.startsWith("legs") ? "#b38759" : "#8197ab"); o.material.needsUpdate = true; }); // its painted colours came out as blotches: plain slate-blue cover and room-oak legs
  sofa.position.set(1.3, 0, .9); sofa.rotation.y = -Math.PI / 2; root.add(sofa);
  // Codex's two cushions (batch 9), not Room 01's: a blue-grey square turned on its corner at one end, an oat-and-sage striped lumbar at the other.
  // (the GLBs lie flat, thin along y: a quarter turn about x stands them up facing the room, rx then leans them back, ry spins them on their face)
  for (const [file, name, x, y, z, rx, ry, rz] of [["diamond-cushion-v1.glb", "sofa-cushion-diamond", -.4, .62, -.08, -.3, Math.PI / 4, 0], ["lumbar-cushion-v1.glb", "sofa-cushion-lumbar", .36, .5, -.1, -.32, 0, .05]]) {
    loadGlb(new URL(`./models/${file}`, import.meta.url).href, { anchor: "center", roughness: 1, weave: true }).then((g) => { g.name = name; if (name.endsWith("lumbar")) g.traverse((o) => { if (o.isMesh) { o.material.vertexColors = false; o.material.color.set("#e2d6c0"); o.material.needsUpdate = true; } }); /* the stripes came out as grey smudges: a plain oat cover */ g.position.set(x, y, z); g.rotation.set(Math.PI / 2 + rx, ry, rz); sofa.add(g); redraw(); }).catch(() => {});
  }
  // Round coffee table (72 cm, 38 cm high): a travertine top on a dark metal ring base (Codex's D2 reference), plus a small side table.
  const travertine = new THREE.MeshStandardMaterial({ map: canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#cdbc9c"; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) { ctx.fillStyle = `rgba(${150 + (i % 5) * 8}, ${128 + (i % 4) * 8}, ${100 + (i % 3) * 8}, ${.1 + (i % 4) * .04})`; ctx.fillRect((i * 71) % w, (i * 29) % h, 40 + (i * 37) % 160, 1.5 + (i % 3)); } // layered bands
    for (let i = 0; i < 70; i++) { ctx.fillStyle = "rgba(90,70,50,.35)"; ctx.beginPath(); ctx.ellipse((i * 53) % w, (i * 97) % h, 1 + (i % 3), .8, 0, 0, 7); ctx.fill(); } // small pores
  }), roughness: .5 });
  const bronze = new THREE.MeshStandardMaterial({ color: "#2f2b27", roughness: .42, metalness: .55 });
  const darkOak = woodMat("#7a5a40", { rough: .55, tint: "#8e6f55" });
  const ringTable = (g, name, r, topY, topR, topH, topMat) => {
    const h = hold(g);
    h(new THREE.CylinderGeometry(topR, topR, topH, 36), topMat, name + "-top", 0, topY, 0);
    for (const y of [.017, topY - topH / 2 - .02]) h(new THREE.TorusGeometry(r, .012, 6, 36), bronze, name + "-ring", 0, y, 0).rotation.x = Math.PI / 2;
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; h(box(.028, topY - topH / 2 - .02, .02), bronze, name + "-post", Math.cos(a) * r, (topY - topH / 2 - .02) / 2, Math.sin(a) * r).rotation.y = -a + Math.PI / 2; }
    return h;
  };
  // A coffee table a home would have (Paul: the ring-and-iron one looked like a hotel's): a solid oak top 50 x 90 cm with softened corners, four tapered
  // wooden legs and a lower shelf, 45 cm from the sofa.
  const ct = new THREE.Group(); ct.name = "coffee-table"; ct.position.set(.19, 0, .9); root.add(ct);
  const cp = hold(ct);
  cp(rb(.5, .035, .9), oak, "coffee-table-top", 0, .3825, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) cp(new THREE.CylinderGeometry(.027, .017, .365, 14), oak, "coffee-table-leg", sx * .2, .1825, sz * .38);
  cp(rb(.4, .02, .78), oak, "coffee-table-shelf", 0, .12, 0);
  cp(box(.24, .035, .18), pillowB, "coffee-table-book", -.12, .4175, .04); cp(box(.2, .03, .15), accentMat, "coffee-table-book", -.12, .45, .04);
  { // Codex's mug (a plain glazed café mug, no brand): the old terracotta cylinder stays until it has loaded, so a slow download never leaves the table bare
    const stand = cp(new THREE.CylinderGeometry(.04, .035, .09, 14), pillowA, "coffee-table-mug", .15, .445, -.1);
    loadGlb(new URL("./models/mug-v1.glb", import.meta.url).href, { height: .095, roughness: .4 }).then((g) => {
      g.name = "coffee-table-mug"; g.position.set(.15, .4, -.1); g.rotation.y = -.7; // the handle turns towards the sofa
      ct.remove(stand); ct.add(g); redraw();
    }).catch(() => {});
  }
  const tv = new THREE.Group(); tv.name = "tv-unit"; tv.position.set(-HW + .2, 0, .95); tv.rotation.y = Math.PI / 2; root.add(tv); // front looks east
  const tp = hold(tv);
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) tp(box(.04, .15, .04), oak, "tv-console-leg", dx * .56, .075, dz * .15);
  // Cabinet shell: top (45 cm), bottom, two sides, a back, a divider. The left bay has a door; the right bay is open and holds a game console.
  tp(rb(1.2, .03, .36), oak, "tv-console", 0, .435, 0);
  tp(box(1.15, .02, .34), oak, "tv-console-bottom", 0, .16, 0);
  for (const sx of [-1, 1]) tp(box(.025, .3, .36), oak, "tv-console-side", sx * .5875, .3, 0);
  tp(box(1.15, .27, .012), oak, "tv-console-back", 0, .3, -.174);
  tp(box(.02, .27, .34), oak, "tv-console-divider", 0, .3, 0);
  tp(box(.55, .24, .01), deskMat, "tv-console-door", -.295, .3, .185);
  // A slim black game console of the PS4 kind (275 x 300 x 53 mm): a matte slab with a glossy top plate and a thin blue light bar.
  // No logos or marks. It lies on the open bay's floor with its front facing the room; a white pad rests on top of it.
  const consoleBody = new THREE.MeshStandardMaterial({ color: "#2b2d33", roughness: .45, metalness: .25 });
  const consoleTop = new THREE.MeshStandardMaterial({ color: "#0d0e11", roughness: .18, metalness: .35 });
  tp(rb(.275, .053, .3), consoleBody, "game-console", .295, .17 + .0265, -.02);
  tp(rb(.265, .004, .29), consoleTop, "game-console-top", .295, .17 + .053 + .002, -.02);
  tp(box(.1, .003, .002), new THREE.MeshStandardMaterial({ color: "#4aa8ff", emissive: "#4aa8ff", emissiveIntensity: 1.4 }), "game-console-light", .295, .17 + .053 + .0045, .125);
  // The pad is a real controller lying on the coffee table (PAD_BASE is that table top), where you can see it (Paul: the console is a big thing in a young person's room):
  // a rounded body, two grips angled back, two sticks, and a blue light bar. Codex's painted top lies on the body.
  const PAD_BASE = .4, padX = .1, padZ = .15, padMat = new THREE.MeshStandardMaterial({ color: "#e9e6df", roughness: .5 }), padDark = new THREE.MeshStandardMaterial({ color: "#2a2b30", roughness: .55 });
  const pad = cp(rb(.15, .028, .09), padMat, "game-pad", padX, PAD_BASE + .014, padZ); pad.rotation.y = .4;
  for (const sx of [-1, 1]) { const grip = cp(rb(.045, .03, .085), padMat, "game-pad-grip", padX, PAD_BASE + .015, padZ); grip.rotation.y = .4; grip.translateX(sx * .062); grip.translateZ(.045); grip.rotateY(-sx * .35); }
  for (const sx of [-1, 1]) { const st = cp(new THREE.CylinderGeometry(.013, .013, .01, 14), padDark, "game-pad-stick", padX, PAD_BASE + .033, padZ); st.rotation.y = .4; st.translateX(sx * .03); st.translateZ(.012); }
  // Codex's painted top of the console (a thin diagonal seam and a blue edge line) and of the pad, laid as flat skins on the 3D shapes
  const skin = (w, d, y, x, z, rotZ, file, name, bodyToHide, parent = tv) => {
    const mat = new THREE.MeshBasicMaterial({ transparent: true, alphaTest: .05, toneMapped: false });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat); m.name = name; m.rotation.set(-Math.PI / 2, 0, rotZ); m.position.set(x, y, z); m.visible = false; parent.add(m);
    art(file, { apply: (t) => { mat.map = t; mat.needsUpdate = true; m.visible = true; if (bodyToHide) bodyToHide.visible = false; mat.color.setScalar(.8); redraw(); } });
    return m;
  };
  skin(.265, .29, .17 + .053 + .0042, .295, -.02, 0, "room02-console-top-v1.webp", "game-console-skin", null);
  skin(.15, .15, PAD_BASE + .0285, padX, padZ, .4, "room02-controller-top-v1.webp", "game-pad-skin", null, ct);
  tp(box(.5, .006, .02), new THREE.MeshStandardMaterial({ color: "#fff1d6", emissive: "#ffd9a0", emissiveIntensity: 1.1 }), "tv-bay-led", .295, .418, .15); // a warm strip under the top, so the console stands out of the dark bay
  tp(box(.3, .012, .2), blackMat, "tv-foot", 0, .456, 0);
  tp(rb(.95, .55, .035), blackMat, "tv-panel", 0, .75, 0); // 47 cm to 102 cm
  const screenFace = new THREE.Mesh(new THREE.PlaneGeometry(.92, .52), tvScreen); screenFace.name = "tv-screen"; screenFace.position.set(0, .75, .0185); tv.add(screenFace);
  const shelf = new THREE.Group(); shelf.name = "bookshelf"; shelf.position.set(-HW + .15, 0, 2.08); shelf.rotation.y = Math.PI / 2; root.add(shelf);
  const bp = hold(shelf);
  bp(box(.75, 1.8, .012), oak, "shelf-back", 0, .9, -.14);
  for (const sx of [-1, 1]) bp(rb(.02, 1.8, .3), oak, "shelf-side", sx * .365, .9, 0);
  const levels = [.02, .4, .78, 1.16, 1.54, 1.79];
  for (const y of levels) bp(rb(.75, .02, .3), oak, "shelf-board", 0, y, 0);
  // Books: each compartment shows a painted row of real-looking books (Codex), standing on its board. The code-drawn spines this replaces
  // never looked like books. The paintings include their own cast shadows; the scene lights still dim them with the mood.
  const bookRows = [["room02-c1-full-bookshelf-v1.webp", .36], ["room02-c3-hardback-bookshelf-v1.webp", .36], ["room02-c2-seven-tenths-bookshelf-v1.webp", .36], ["room02-c4-sparse-bookshelf-v1.webp", .36], ["room02-c5-top-shelf-v1.webp", .22]];
  const bookTex = {}, rowMats = [];
  const SHELF_SETS = { mixed: ["room02-c1-full-bookshelf-v1.webp", "room02-c3-hardback-bookshelf-v1.webp", "room02-c2-seven-tenths-bookshelf-v1.webp", "room02-c4-sparse-bookshelf-v1.webp"], airy: ["room02-c4-sparse-bookshelf-v1.webp", "room02-c2-seven-tenths-bookshelf-v1.webp", "room02-c4-sparse-bookshelf-v1.webp", "room02-c2-seven-tenths-bookshelf-v1.webp"], library: ["room02-c1-full-bookshelf-v1.webp", "room02-c3-hardback-bookshelf-v1.webp", "room02-c1-full-bookshelf-v1.webp", "room02-c3-hardback-bookshelf-v1.webp"] };
  const applyShelf = () => rowMats.forEach((mat, i) => { const t = bookTex[i === 4 ? bookRows[4][0] : SHELF_SETS[chosen.shelf][i]]; if (t) { mat.map = t; mat.color.set("#ffffff"); mat.needsUpdate = true; } });
  bookRows.forEach(([file, h], i) => {
    const mat = new THREE.MeshStandardMaterial({ color: "#cfc4b0", roughness: .9 }); rowMats[i] = mat;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(.71, h), mat); m.name = "shelf-books-" + i;
    m.position.set(0, levels[i] + .01 + h / 2, -.133); m.receiveShadow = true; shelf.add(m);
  });
  for (const file of new Set([...Object.values(SHELF_SETS).flat(), bookRows[4][0]])) art(file, { apply: (t) => { bookTex[file] = t; applyShelf(); } });
  // Every shelf item must fit its compartment (23 cm clear under the top board). Taller things go on top of the shelf, the way
  // people store what has no other place: a lidded fabric box and a small plant. info().shelfClash proves nothing passes through a board.
  const TOP = levels[levels.length - 1] + .01; // upper face of the top board
  bp(box(.36, .2, .26), new THREE.MeshStandardMaterial({ map: weaveTexture("#d9cfbd", "#a99a7f"), roughness: 1 }), "shelf-top-box", -.15, TOP + .1, 0);
  bp(box(.37, .02, .27), new THREE.MeshStandardMaterial({ color: "#cfc4b0", roughness: 1 }), "shelf-top-box-lid", -.15, TOP + .21, 0);
  // three sneaker boxes stacked beside it (Paul: the plant on top looked like a cartoon): 33 x 12 x 20 cm, a lid line, a white side label; no logos
  for (const [y, col, ry] of [[.06, "#c4622d", .06], [.18, "#23252a", -.05], [.3, "#e9e4da", .1]]) {
    const bx = bp(box(.33, .12, .2), new THREE.MeshStandardMaterial({ color: col, roughness: .75 }), "shelf-top-shoebox", .22, TOP + y, 0); bx.rotation.y = ry;
    const lid = bp(box(.335, .034, .205), new THREE.MeshStandardMaterial({ color: col, roughness: .7 }), "shelf-top-shoebox-lid", .22, TOP + y + .043, 0); lid.rotation.y = ry;
    const label = bp(box(.07, .045, .002), new THREE.MeshStandardMaterial({ color: col === "#e9e4da" ? "#2a2b2f" : "#f1eee7", roughness: .6 }), "shelf-top-shoebox-label", .22 + .08 * Math.cos(ry), TOP + y - .005, .101 + .08 * Math.sin(ry)); label.rotation.y = ry;
  }

  // ---------- vinyl corner under the window: record console, turntable, two small speakers ----------
  // Real sizes: console 100 x 40 x 50 cm (stays under the 90 cm sill), turntable 45 x 35 cm with a 30 cm record, speakers 16 x 25 x 18 cm.
  // Records stand in four open cubbies; sleeves are plain colour blocks (no album art, no text).
  const vin = new THREE.Group(); vin.name = "vinyl-corner"; vin.position.set(-.45, 0, -HD + .2); root.add(vin);
  const vp = hold(vin);
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) vp(box(.035, .12, .035), blackMat, "vinyl-leg", dx * .47, .06, dz * .17);
  vp(rb(1.0, .025, .4), oak, "vinyl-top", 0, .4875, 0); // top face at 50 cm
  vp(rb(1.0, .025, .4), oak, "vinyl-bottom", 0, .1325, 0);
  for (const x of [-.4875, -.25, 0, .25, .4875]) vp(box(.025, .33, .4), oak, "vinyl-divider", x, .31, 0);
  vp(box(1.0, .33, .01), oak, "vinyl-back", 0, .31, -.195);
  const sleeveCols = ["#1f2124", "#d9c9a8", "#8c3b2e", "#2f3b52", "#c9a14e", "#e9e4da", "#3e5a48", "#b2566a", "#5b6b7c", "#6a4c6e"];
  for (const [c0, n] of [[-.37, 9], [-.125, 7], [.125, 10], [.37, 6]]) {
    for (let i = 0; i < n; i++) {
      const sleeve = vp(box(.006, .31, .31), new THREE.MeshStandardMaterial({ color: sleeveCols[(i * 3 + n) % sleeveCols.length], roughness: .7 }), "vinyl-sleeve", c0 - .1 + i * .008 + .004, .145 + .155 + .001, .02);
      if (i === n - 1) { sleeve.rotation.z = .12; sleeve.position.x += .018; } // the last record leans
    }
  }
  const plinth = vp(box(.45, .07, .35), new THREE.MeshStandardMaterial({ color: "#2a2b2e", roughness: .4, metalness: .2 }), "turntable", 0, .5 + .035, .01);
  vp(new THREE.CylinderGeometry(.152, .152, .015, 40), metalMat, "turntable-platter", -.05, .5 + .0775, .01);
  const recordTex = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#101012"; ctx.fillRect(0, 0, w, h);
    for (let r = 40; r < 128; r += 2) { ctx.strokeStyle = `rgba(255,255,255,${r % 6 ? .03 : .07})`; ctx.beginPath(); ctx.arc(128, 128, r, 0, 7); ctx.stroke(); }
    ctx.fillStyle = "#c58a62"; ctx.beginPath(); ctx.arc(128, 128, 36, 0, 7); ctx.fill(); // centre label, plain colour
    ctx.fillStyle = "#e9e4da"; ctx.beginPath(); ctx.arc(128, 128, 3, 0, 7); ctx.fill();
  });
  const record = vp(new THREE.CylinderGeometry(.15, .15, .003, 48), [new THREE.MeshStandardMaterial({ color: "#101012", roughness: .3 }), new THREE.MeshStandardMaterial({ map: recordTex, roughness: .35 }), new THREE.MeshStandardMaterial({ color: "#101012" })], "turntable-record", -.05, .5 + .0865, .01);
  vp(new THREE.CylinderGeometry(.006, .006, .02, 8), metalMat, "tonearm-post", .17, .5 + .08, -.11);
  const arm = vp(box(.24, .008, .008), metalMat, "tonearm", .09, .5 + .093, -.06); arm.rotation.y = -.55;
  vp(box(.03, .012, .02), blackMat, "tonearm-head", .0, .5 + .092, .02);
  for (const sx of [-1, 1]) {
    vp(box(.16, .25, .18), new THREE.MeshStandardMaterial({ color: "#c9a77c", roughness: .55 }), "speaker", sx * .4, .5 + .125, -.03);
    vp(new THREE.CylinderGeometry(.045, .045, .01, 24), softBlack, "speaker-woofer", sx * .4, .5 + .095, .062).rotation.x = Math.PI / 2;
    vp(new THREE.CylinderGeometry(.018, .018, .01, 16), softBlack, "speaker-tweeter", sx * .4, .5 + .19, .062).rotation.x = Math.PI / 2;
  }

  // ---------- lived-in details: posters, a real plant, blind, switch and sockets, ceiling light ----------
  // Like Room 01, the room should hold what a real home holds. Posters are Codex's prints (no text, no real people or brands),
  // the plant is Room 01's image-to-3D plant, and the small fittings sit where an electrician would put them.
  const POSTER = { w: .4, h: .4 * 1020 / 720, y: 1.82, z: -1.75, gap: .08 }; // A2-like portrait, over the desk (Paul: a young person hangs favourites above the desk); the TV wall gets Room 01's morning harbour
  const posterSets = { A: ["A1-v2", "A2-v1", "A3-v1"], B: ["B1-v1", "B2-v1", "B3-v1"], C: ["C1-v1", "C2-v1", "C3-v1"] };
  const posterTex = {};
  const loadPoster = (id) => posterTex[id] ??= new Promise((resolve) => texLoader.load(new URL(`./art/bedroom-poster-${id}.webp`, import.meta.url).href,
    (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; resolve(t); }, undefined, () => resolve(null)));
  const posters = new THREE.Group(); posters.name = "posters"; posters.position.set(-HW, 0, POSTER.z); posters.rotation.y = Math.PI / 2; root.add(posters);
  const frameBlack = new THREE.MeshStandardMaterial({ color: "#1d1f22", roughness: .5 });
  const printMats = [0, 1, 2].map((i) => {
    const x = (i - 1) * (POSTER.w + POSTER.gap);
    const f = new THREE.Mesh(box(POSTER.w + .04, POSTER.h + .04, .022), frameBlack); f.name = "poster-frame"; f.position.set(x, POSTER.y, .011); f.castShadow = true; posters.add(f);
    const mat = new THREE.MeshStandardMaterial({ color: "#e9e4da", roughness: .6 });
    const art = new THREE.Mesh(new THREE.PlaneGeometry(POSTER.w, POSTER.h), mat); art.name = "poster-print"; art.position.set(x, POSTER.y, .0225); posters.add(art);
    return mat;
  });
  // Room 01's morning harbour over the TV (Paul: it lifts the whole wall): the same stepped gold frame, 90 x 60 cm picture, centred 1.62 m up.
  { const g = new THREE.Group(); g.name = "tv-wall-harbor"; g.position.set(-HW + .018, 1.62, .95); g.rotation.y = Math.PI / 2; root.add(g);
    const part = (geo, mat, z, cast) => { const m = new THREE.Mesh(geo, mat); m.position.z = z; m.receiveShadow = true; m.castShadow = cast; g.add(m); return m; };
    const gold = new THREE.MeshStandardMaterial({ color: "#b8934e", roughness: .42, metalness: .55 }), goldDark = new THREE.MeshStandardMaterial({ color: "#6f5428", roughness: .5, metalness: .4 });
    part(box(1.04, .74, .034), gold, 0, true); part(box(.96, .66, .036), goldDark, 0, false); part(box(.92, .62, .038), gold, 0, false);
    const harbor = texLoader.load(new URL("../tex/right-wall-harbor-v1.webp", import.meta.url).href, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; renderSoon?.(); });
    part(new THREE.PlaneGeometry(.9, .6), new THREE.MeshStandardMaterial({ map: harbor, roughness: .8 }), .0205, false); }
  // one bigger print on the window wall above the headboard (it faces the visitor): the basketball poster (A1). When the TV wall shows the sport set, this one
  // switches to the planet print so the same picture never hangs twice.
  const BEDPOSTER = { w: .5, h: .5 * 1020 / 720, y: 1.58 };
  const bedPoster = new THREE.Group(); bedPoster.name = "bed-poster"; bedPoster.position.set(BED.x + .02, 0, -HD); root.add(bedPoster);
  { const f = new THREE.Mesh(box(BEDPOSTER.w + .04, BEDPOSTER.h + .04, .022), frameBlack); f.name = "bed-poster-frame"; f.position.set(0, BEDPOSTER.y, .011); f.castShadow = true; bedPoster.add(f); }
  const bedPrintMat = new THREE.MeshStandardMaterial({ color: "#e9e4da", roughness: .6 });
  { const a = new THREE.Mesh(new THREE.PlaneGeometry(BEDPOSTER.w, BEDPOSTER.h), bedPrintMat); a.name = "bed-poster-print"; a.position.set(0, BEDPOSTER.y, .0225); bedPoster.add(a); }
  let posterSet = null, bedPosterId = null;
  async function setPosters(set) {
    const ids = posterSets[set], bedId = set === "A" ? "C2-v1" : "A1-v2";
    const ts = await Promise.all([...ids, bedId].map(loadPoster));
    if (ts.some((t) => !t)) return false;
    [...printMats, bedPrintMat].forEach((m, i) => { m.map = ts[i]; m.color.set("#ffffff"); m.needsUpdate = true; });
    posterSet = set; bedPosterId = bedId; render(); return true;
  }
  // Room 01's plant on the west wall, between the desk and the TV
  const plant = await loadModel("plant", { height: 1.2 }); plant.name = "floor-plant"; plant.position.set(-HW + .55, 0, -.5); root.add(plant);
  // Codex's coffee bar (batch 12): a 39 cm oak cabinet with a sage door and the espresso machine on top, against the west wall just north of the TV unit.
  // Its colours are written as linear factors and wash out to cream and mint here, so the wood and the door get the room's own oak and sage.
  const barColours = { pale_oak: "#b38759", oak_grain: "#a07549", oak_interior: "#80603d", sage_door: "#6f8568" };
  loadGlb(new URL("./models/coffee-bar-v1.glb", import.meta.url).href).then((g) => {
    g.traverse((o) => { if (o.isMesh && barColours[o.material.name]) o.material.color.set(barColours[o.material.name]); });
    g.name = "coffee-bar"; g.position.set(-HW + .195, 0, .35 - .04 - .195); g.rotation.y = Math.PI / 2; root.add(g); render(); // front looks east, like the TV unit
  }).catch(() => {});
  // Room 01's little robot has a cousin here: the same model, a soft blue belt, standing on the open floor between the desk and the foot of the
  // bed, turned towards the corner camera. As in Room 01 the body is re-coloured by height (cream, one belt) and the face is its own dark
  // screen with two warm eyes, because vertex colours cannot hold a crisp face.
  loadModel("robot", { height: .46, roughness: .5 }).then((rb) => {
    rb.name = "room02-robot";
    const cream = new THREE.Color("#ece6dc"), belt = new THREE.Color("#7a8cc4"), v = new THREE.Vector3();
    const b0 = new THREE.Box3().setFromObject(rb);
    rb.traverse((m) => {
      const c = m.isMesh && m.geometry.attributes.color; if (!c) return;
      m.geometry = m.geometry.clone(); const cc = m.geometry.attributes.color, pos = m.geometry.attributes.position; m.updateWorldMatrix(true, false);
      for (let i = 0; i < cc.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld); const t = (v.y - b0.min.y) / (b0.max.y - b0.min.y); const col = t > .12 && t < .27 ? belt : cream; cc.setXYZ(i, col.r, col.g, col.b); }
      cc.needsUpdate = true;
    });
    const size = b0.getSize(new THREE.Vector3()), fw = size.x * .55, fh = size.y * .22, fy = b0.max.y - size.y * .29;
    const face = new THREE.Mesh(new THREE.PlaneGeometry(fw, fh), new THREE.MeshStandardMaterial({ color: "#2b2d30", roughness: .35 })); face.name = "room02-robot-face";
    face.position.set((b0.min.x + b0.max.x) / 2, fy, b0.max.z + .004);
    for (const sx of [-1, 1]) { const eye = new THREE.Mesh(new THREE.CircleGeometry(fh * .14, 16), new THREE.MeshBasicMaterial({ color: "#ffe2a8" })); eye.position.set(sx * fw * .2, fh * .05, .002); face.add(eye); }
    rb.add(face);
    rb.position.set(.35, 0, -.55); rb.rotation.y = .46; root.add(rb); tapTargets.robot = rb; redraw();
  }).catch(() => {});
  // roller blind: a slim cassette above the window with the oat fabric pulled down 18 cm
  add(box(WINDOW.w + .12, .07, .08), frameMat, "blind-cassette", WINDOW.x, wTop + .085, -HD + .07, { shadow: false });
  add(new THREE.PlaneGeometry(WINDOW.w - .04, .18), new THREE.MeshStandardMaterial({ map: weaveTexture("#e6dccb", "#b8aa90"), roughness: 1, side: THREE.DoubleSide }), "blind-fabric", WINDOW.x, wTop - .09, -HD + .075, { shadow: false });
  add(box(WINDOW.w - .02, .02, .02), frameMat, "blind-bar", WINDOW.x, wTop - .18, -HD + .075, { shadow: false });
  // the house plaque, same piece as Room 01 ("Christ is the Head of this House"): on the window wall between the desk corner and
  // the window, where the overview always shows all of it (plaqueInView() proves that on desktop and phone)
  const plaqueTex = texLoader.load(new URL("../art/wall-plaque-text-v1.webp", import.meta.url).href, (t) => { t.colorSpace = THREE.SRGBColorSpace; render(); });
  plaqueTex.anisotropy = 8;
  const plaque = add(new THREE.PlaneGeometry(.9, .36), new THREE.MeshStandardMaterial({ map: plaqueTex, transparent: true, alphaTest: .5, roughness: .7 }), "house-plaque", -1.45, 1.8, -HD + .015, { shadow: false });
  // Two framed prints on the wall behind the sofa (the east wall), Codex's pair: sage, terracotta, navy and cream, nothing like the city outside.
  // 134 x 89 cm in all (two 58 x 78 cm frames), centred over the sofa, bottom edge 121 cm up, well above the sofa back.
  art("room02-east-pair-v1.webp", { apply: (t) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.34, .894), new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: .35, roughness: .8 }));
    m.name = "sofa-wall-art"; m.rotation.y = -Math.PI / 2; m.position.set(HW - .012, 1.66, .9); m.receiveShadow = true; root.add(m);
  } });
  // Room 01's wall pieces, rebuilt here (Paul 2026-10-23: use Room 01's own pieces). (1) The bed's side wall, the east wall beside the bed: Room 01's
  // "hills and sun" print in the same thin oak frame and cream mount (86 x 60 cm), over the bed's middle, centre 1.55 m up.
  { const AW = .86, AH = .6, g = new THREE.Group(); g.name = "bed-wall-print"; g.position.set(HW - .02, 1.55, BED.z); g.rotation.y = -Math.PI / 2; root.add(g);
    const part = (geo, mat, z, shadow) => { const m = new THREE.Mesh(geo, mat); m.position.z = z; m.receiveShadow = true; m.castShadow = shadow; g.add(m); return m; };
    part(new THREE.BoxGeometry(AW + .06, AH + .06, .035), new THREE.MeshStandardMaterial({ color: "#a8784c", roughness: .55 }), 0, true);
    part(new THREE.BoxGeometry(AW, AH, .006), new THREE.MeshStandardMaterial({ color: "#f7f3ea", roughness: .9 }), .018, false);
    const hills = texLoader.load(new URL("../art/wall-print-hills-v1.webp", import.meta.url).href, (t) => { t.colorSpace = THREE.SRGBColorSpace; render(); }); hills.anisotropy = 8;
    part(new THREE.PlaneGeometry(AW - .14, AH - .14), new THREE.MeshStandardMaterial({ map: hills, roughness: .85 }), .022, false); }
  // (2) Room 01's glass planning board, on the west wall beside the desk, between the desk and the plant (its own words: a work list, the red line is
  // the one that matters). A glass slab on four brass stand-offs, a small oak ledge with two black markers and a red one.
  { const BW = .58, BH = .84, g = new THREE.Group(); g.name = "whiteboard"; g.position.set(-HW + .004, 1.6, -.6); g.rotation.y = Math.PI / 2; root.add(g);
    const part = (geo, mat, x, y, z, name) => { const m = new THREE.Mesh(geo, mat); m.name = name; m.position.set(x, y, z); m.receiveShadow = true; g.add(m); return m; };
    const brass = new THREE.MeshStandardMaterial({ color: "#c2a36a", metalness: .48, roughness: .58 });
    part(rb(BW, BH, .008), new THREE.MeshStandardMaterial({ color: "#f3f2ee", roughness: .32, metalness: .08 }), 0, 0, .022, "whiteboard-glass");
    const faceTex = texLoader.load(new URL("../art/room02-whiteboard-v1.webp", import.meta.url).href, (t) => { t.colorSpace = THREE.SRGBColorSpace; render(); }); faceTex.anisotropy = 8;
    part(new THREE.PlaneGeometry(BW - .01, BH - .01), new THREE.MeshStandardMaterial({ map: faceTex, roughness: .55 }), 0, 0, .0265, "whiteboard-face");
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) part(new THREE.CylinderGeometry(.0042, .0042, .018, 12), brass, sx * (BW / 2 - .04), sy * (BH / 2 - .045), .009, "whiteboard-standoff").rotation.x = Math.PI / 2;
    const ledgeY = -BH / 2 - .016;
    part(new THREE.BoxGeometry(.5, .007, .04), new THREE.MeshStandardMaterial({ color: "#d4b483", roughness: .72 }), 0, ledgeY, .042, "whiteboard-ledge");
    part(new THREE.BoxGeometry(.5, .006, .006), new THREE.MeshStandardMaterial({ color: "#d4b483", roughness: .72 }), 0, ledgeY + .003, .06, "whiteboard-ledge-lip");
    for (const [x, c] of [[-.16, "#1c1c1c"], [-.04, "#c43131"], [.09, "#1c1c1c"]]) part(new THREE.CapsuleGeometry(.008, .1, 4, 12), new THREE.MeshStandardMaterial({ color: c, roughness: .36 }), x, ledgeY + .0075 + .004, .044, "whiteboard-marker").rotation.z = Math.PI / 2; }
  // linen curtains (only in the "linen over roller" choice): a slim rod and two pleated panels gathered at the sides (the left one stops short of the house plaque)
  const curtains = new THREE.Group(); curtains.name = "curtains"; curtains.visible = chosen.window === "linen"; root.add(curtains);
  const linenMat = new THREE.MeshStandardMaterial({ map: weaveTexture("#efe8da", "#c9bfa9"), roughness: 1, side: THREE.DoubleSide });
  { const rod = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, WINDOW.w + .6, 10), metalMat); rod.rotation.z = Math.PI / 2; rod.position.set(WINDOW.x, wTop + .2, -HD + .12); rod.name = "curtain-rod"; curtains.add(rod); }
  for (const side of [-1, 1]) {
    // Gathered at the rod, hanging open at the hem: tight small folds at the top that open into larger, uneven S-folds towards the floor (three
    // waves of different length), the fabric pulling in a little where it folds, and a hem that is not a straight line, 2 cm off the floor.
    const H = wTop + .17, g = new THREE.PlaneGeometry(.3, H, 34, 12), pos = g.attributes.position, TAU = Math.PI * 2;
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i) / .3 + .5, t = (pos.getY(i) + H / 2) / H, open = Math.pow(1 - t, 1.3), ph = side * .2 + .12 * open;
      const wave = .62 * Math.sin(TAU * (2.5 * u + ph)) + .28 * Math.sin(TAU * (4.3 * u + .35 + .15 * open)) + .1 * Math.sin(TAU * (1.2 * u + .7));
      pos.setZ(i, (.012 + .022 * open) * wave);
      pos.setX(i, pos.getX(i) + open * .012 * Math.sin(TAU * (2.5 * u + ph) + 1.2));
      pos.setY(i, pos.getY(i) + Math.pow(open, 4) * .016 * Math.sin(u * 13 + side * 1.7));
    }
    g.computeVertexNormals();
    const panel = new THREE.Mesh(g, linenMat); panel.name = "curtain-panel"; panel.castShadow = true; panel.receiveShadow = true;
    panel.position.set(WINDOW.x + side * (WINDOW.w / 2), .02 + H / 2, -HD + .12); curtains.add(panel);
  }
  // A sliding-door wardrobe on the south wall (behind the corner camera, so it only shows when you stand in the middle): light oak doors,
  // one slim mirror door, a dark rail top and bottom. 160 x 55 cm, 225 cm high, clear of the door (x < -0.7) and the light switch.
  { const W = { w: 1.6, d: .55, h: 2.25, x: .4 }, wz = HD - W.d / 2, g = new THREE.Group(); g.name = "wardrobe"; g.visible = centred; root.add(g); // shown while standing in the middle (the opening look)
    const mirrorTex = canvasTex(64, 256, (ctx, w, h) => { const gr = ctx.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#c9d3da"); gr.addColorStop(.35, "#eef3f5"); gr.addColorStop(.5, "#d6dee3"); gr.addColorStop(1, "#aeb9c1"); ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(26, 0); ctx.lineTo(10, h); ctx.lineTo(-8, h); ctx.fill(); }); // a soft glass sheen, so the mirror reads as glass
    const doorMat = new THREE.MeshStandardMaterial({ map: woodTex("#d8b98d", "rgba(110,76,40,A)", "rgba(255,240,215,A)"), roughness: .55 }); // plain veneer, drawn here: the painted oak is a strip made for boards and stretches on a tall door
    const wp = hold(g), mirrorMat = new THREE.MeshStandardMaterial({ map: mirrorTex, color: "#ffffff", roughness: .08, metalness: .6, envMapIntensity: 1.2 }), railMat = new THREE.MeshStandardMaterial({ color: "#3a3c3f", roughness: .4, metalness: .5 });
    const dz = HD - W.d + .03; // the door plane, 3 cm inside the front edge; the room is north of the wall (smaller z)
    wp(box(W.w, W.h, W.d - .05), wallMat, "wardrobe-carcass", W.x, W.h / 2, HD - (W.d - .05) / 2);
    wp(box(W.w + .04, .04, W.d + .05), oak, "wardrobe-top", W.x, W.h + .02, wz - .025);
    wp(box(W.w, .03, .05), railMat, "wardrobe-rail-bottom", W.x, .03, dz);
    wp(box(W.w, .025, .05), railMat, "wardrobe-rail-top", W.x, W.h - .04, dz);
    const grainUp = (geo) => { const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getY(i) * 1.6, uv.getX(i) * .8); return geo; }; // the grain runs up the door, at about the scale of the desk top
    wp(grainUp(rb(.56, W.h - .1, .022)), doorMat, "wardrobe-door-a", W.x - .54, W.h / 2, dz - .02); // two oak doors, the right one slid in front of the mirror one
    wp(grainUp(rb(.56, W.h - .1, .022)), doorMat, "wardrobe-door-b", W.x + .02, W.h / 2, dz - .045);
    wp(rb(.46, W.h - .1, .018), mirrorMat, "wardrobe-door-mirror", W.x + .6, W.h / 2, dz - .02);
    for (const hx of [W.x - .29, W.x + .27]) wp(box(.012, .5, .014), railMat, "wardrobe-handle", hx, 1.0, dz - (hx > W.x ? .07 : .045)); }
  // switch by the door (120 cm), sockets at 30 cm by the desk, the bed and the TV
  const plateMat = new THREE.MeshStandardMaterial({ color: "#f4f1ea", roughness: .4 });
  const plate = (w, h, x, y, z, rotY, name) => { const m = add(box(w, h, .01), plateMat, name, x, y, z, { shadow: false }); m.rotation.y = rotY; return m; };
  plate(.086, .086, DOOR.x + DOOR.w / 2 + .16, 1.2, HD - .005, 0, "switch");
  plate(.086, .086, -HW + .005, .3, -.92, Math.PI / 2, "socket-desk");
  plate(.086, .086, BED.x - BED.w / 2 - .55, .3, -HD + .005, 0, "socket-bed");
  // The bedside lamp's cable: from the back of the lamp base, over the back edge of the table, down behind it, along the floor by the wall, over the skirting board and up
  // into the socket beside the bed, with a small white plug. A gentle curve through real points, 5.6 mm thick.
  { const sx = BED.x - BED.w / 2 - .55, lx = BED.x - BED.w / 2 - .27, lz = north + .27;
    const pts = [[lx, .51, lz - .055], [lx - .02, .505, lz - .205], [lx - .03, .25, lz - .235], [lx - .06, .015, lz - .285], [sx + .1, .006, -HD + .03], [sx + .025, .008, -HD + .025], [sx, .07, -HD + .021], [sx, .1, -HD + .011], [sx, .26, -HD + .008], [sx, .29, -HD + .016]] /* in front of the skirting board, then over its top and up the wall */.map((q) => new THREE.Vector3(...q));
    const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, .0028, 6), new THREE.MeshStandardMaterial({ color: "#3a3a3a", roughness: .6 }));
    cable.name = "lamp-cable"; cable.castShadow = true; root.add(cable);
    add(rb(.032, .042, .026), plateMat, "lamp-plug", sx, .3, -HD + .018, { shadow: false }); }
  // The monitor's cable, to the nearest socket (west wall, 30 cm up, just past the desk's south end): from the back of the monitor neck over the
  // desk's back edge, down the gap behind the desk, along the floor in front of the skirting board, over it and up into the socket.
  { const w = -HW, sz = -.92;
    const pts = [[-1.86, .8, -1.75], [w + .03, .755, -1.72], [w + .015, .5, -1.6], [w + .02, .1, -1.35], [w + .025, .008, -1.1], [w + .025, .008, sz - .05], [w + .021, .07, sz - .005], [w + .011, .1, sz], [w + .008, .26, sz], [w + .016, .29, sz]].map((q) => new THREE.Vector3(...q));
    const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, .0028, 6), new THREE.MeshStandardMaterial({ color: "#2e2f33", roughness: .6 }));
    cable.name = "monitor-cable"; cable.castShadow = true; root.add(cable);
    add(rb(.026, .042, .032), plateMat, "monitor-plug", w + .018, .3, sz, { shadow: false }); }
  plate(.086, .086, -HW + .005, .3, 1.62, Math.PI / 2, "socket-tv");
  // a flush round ceiling light (glows softly; the room light itself is still the fill light)
  // A ring lamp: a slim round tube with a thinner ring inside it, hung on three wires 30 cm below the ceiling, the kind of light younger people
  // choose. It is the real light of the room: the fill light sits at its centre, and a warm pool of light lies on the ceiling above it.
  const ring = new THREE.Group(); ring.name = "ring-lamp"; ring.position.set(0, ROOM.h - .3, .2); root.add(ring);
  const ringMat = new THREE.MeshStandardMaterial({ color: "#f4efe6", emissive: "#ffe9c4", emissiveIntensity: 1, roughness: .4 });
  const ringTube = new THREE.Mesh(new THREE.TorusGeometry(.3, .02, 8, 48), ringMat); ringTube.name = "ceiling-light"; ringTube.rotation.x = Math.PI / 2; ring.add(ringTube);
  const ringInner = new THREE.Mesh(new THREE.TorusGeometry(.2, .011, 6, 40), ringMat); ringInner.rotation.x = Math.PI / 2; ring.add(ringInner);
  for (let i = 0; i < 3; i++) { const an = i * Math.PI * 2 / 3 + .5; const w = new THREE.Mesh(new THREE.CylinderGeometry(.0025, .0025, .3, 4), blackMat); w.position.set(Math.cos(an) * .3, .15, Math.sin(an) * .3); ring.add(w); }
  { const canopy = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .02, 20), blackMat); canopy.position.set(0, .29, 0); ring.add(canopy); }
  art("room02-ceiling-glow-v1.webp", { apply: (t) => {
    const g = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), new THREE.MeshBasicMaterial({ map: t, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, opacity: CEILING_GLOW[live.mood] ?? .5 }));
    g.name = "ceiling-glow"; g.rotation.x = Math.PI / 2; g.position.set(0, ROOM.h - .004, .2); g.renderOrder = 1; root.add(g); ceil.glow = g; redraw();
  } });

  // ---------- polish: soft reflections, contact shadows, wall corner shading, vignette ----------
  // Reflections: a tiny made-up room (warm floor, pale walls, a bright window panel) baked into an environment map, so wood, metal,
  // the monitor bezel and ceramics pick up believable highlights instead of looking like flat plastic. Intensity follows the mood.
  { const e = new THREE.Scene();
    const grad = canvasTex(8, 256, (ctx, w, h) => { const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#fbf6ec"); g.addColorStop(.5, "#d8d0c0"); g.addColorStop(1, "#a88c6a"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); });
    e.add(new THREE.Mesh(new THREE.BoxGeometry(8, 5, 8), new THREE.MeshBasicMaterial({ map: grad, side: THREE.BackSide })));
    const win = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.5), new THREE.MeshBasicMaterial({ color: "#ffffff" })); win.position.set(0, 0, -3.9); e.add(win);
    const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(e, .04).texture; pm.dispose(); }
  const envLevel = { focus: .26, weekend: .2, night: .08, sunday: .22 };
  const applyEnv = (name) => root.traverse((o) => { if (!o.isMesh) return; for (const m of [].concat(o.material)) if (m.isMeshStandardMaterial) m.envMapIntensity = o.name.startsWith("window-") || /^(wall|floor|ceiling)/.test(o.name) ? .08 * (envLevel[name] / .26) : envLevel[name]; });

  // Contact shadows: a soft dark footprint under each piece, where a real room is darkest (the renderer's shadows cannot reach there).
  const footprintTex = canvasTex(128, 128, (ctx, w, h) => {
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, w, h); // alphaMap reads the green channel: white = solid, black = clear
    ctx.fillStyle = "#fff"; ctx.shadowColor = "#fff"; ctx.shadowBlur = 20; ctx.shadowOffsetX = 1000;
    ctx.fillRect(34 - 1000, 34, 60, 60);
  });
  const footprintMat = (op) => new THREE.MeshBasicMaterial({ color: "#1c1510", alphaMap: footprintTex, transparent: true, opacity: op, depthWrite: false, toneMapped: false });
  for (const [name, op, grow] of [["bed", .5, .1], ["desk", .32, .06], ["chair", .4, .06], ["vinyl-corner", .45, .06], ["sofa", .55, .12], ["coffee-table", .32, .05], ["tv-unit", .5, .07], ["bookshelf", .5, .07], ["floor-plant", .5, .06]]) {
    const o = root.getObjectByName(name); if (!o) continue;
    const b = new THREE.Box3().setFromObject(o);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(b.max.x - b.min.x + grow * 2, b.max.z - b.min.z + grow * 2), footprintMat(op));
    m.name = "contact-" + name; m.rotation.x = -Math.PI / 2; m.position.set((b.min.x + b.max.x) / 2, .0075, (b.min.z + b.max.z) / 2); m.renderOrder = 1; root.add(m);
  }
  // Soft goods rest on each other, so each one gets a faint shadow on the surface under it: the pillow on the mattress, the throw on the
  // duvet. The cushion is deliberately not in this list any more: it now sinks ~2 cm into the pillow, so a flat plane at the pillow's
  // surface would be buried inside it. Its own cast shadow (part() enables castShadow) lands on the pillow instead.
  for (const [name, surfaceY, op, grow, shift] of [["bed-pillow", BED.top + .004, .55, .07, .02]]) {
    const o = root.getObjectByName(name); if (!o) continue;
    const b = new THREE.Box3().setFromObject(o), m = new THREE.Mesh(new THREE.PlaneGeometry(b.max.x - b.min.x + grow * 2, b.max.z - b.min.z + grow * 2), footprintMat(op));
    m.material.polygonOffset = true; m.material.polygonOffsetFactor = -2; m.material.polygonOffsetUnits = -2;
    m.name = "contact-" + name; m.rotation.x = -Math.PI / 2; m.position.set((b.min.x + b.max.x) / 2 + shift, surfaceY ?? b.min.y + .01, (b.min.z + b.max.z) / 2 + shift); m.renderOrder = 2; root.add(m);
  }
  // Corners: a faint gradient where walls meet the floor, the ceiling and each other, the way real rooms hold a little shade.
  const edgeTex = (dir) => canvasTex(4, 64, (ctx, w, h) => { const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, dir ? "#000" : "#fff"); g.addColorStop(1, dir ? "#fff" : "#000"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); });
  const shadeStrip = (w, h, x, y, z, rotY, tex, op, name) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ alphaMap: tex, color: "#2a1d10", transparent: true, opacity: op, depthWrite: false, toneMapped: false }));
    m.name = name; m.position.set(x, y, z); m.rotation.y = rotY; m.renderOrder = 1; root.add(m);
  };
  const upTex = edgeTex(1), downTex = edgeTex(0), e = .004;
  for (const [len, x, z, rot, id] of [[ROOM.w, 0, -HD + e, 0, "n"], [ROOM.w, 0, HD - e, Math.PI, "s"], [ROOM.d, HW - e, 0, -Math.PI / 2, "e"], [ROOM.d, -HW + e, 0, Math.PI / 2, "w"]]) {
    shadeStrip(len, .55, x, .08 + .275, z, rot, upTex, .3, "corner-floor-" + id); // dark at the bottom edge
    shadeStrip(len, .5, x, ROOM.h - .25, z, rot, downTex, .22, "corner-ceiling-" + id);
  }

  // ---------- daylight ----------
  const hemi = new THREE.HemisphereLight("#e8f0f8", "#d6c6aa", 1.45); scene.add(hemi);
  const sun = new THREE.DirectionalLight("#fff3df", 2.3);
  sun.position.set(1.1, 2.3, -HD - 2.2); sun.target.position.set(-.1, .4, 1.0);
  sun.castShadow = true; sun.shadow.mapSize.set(compact ? 1024 : 2048, compact ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -3.2, right: 3.2, top: 3.2, bottom: -3.2, near: .5, far: 12 });
  sun.shadow.bias = -.0005; sun.shadow.normalBias = .02; sun.shadow.radius = 5;
  scene.add(sun, sun.target);
  const fill = new THREE.PointLight("#ffe9cf", 7, 7, 2); fill.position.set(0, ROOM.h - .32, .2); scene.add(fill); // at the ring lamp's centre
  // A single soft spot over the desk, the way Room 01 lights the picture above its shelf: a narrow pool of warm light with a 512 shadow
  // map, so the desk edge, the keyboard and the mug get a real light-to-dark transition instead of another flat fill (DSH, plan 3).
  // It comes from a small recessed downlight in the ceiling, so the pool and the scallop on the wall have a visible source.
  const deskSpot = new THREE.SpotLight("#ffe3bd", 0, 3.2, .5, .72, 2);
  deskSpot.position.set(-1.55, ROOM.h - .03, -1.75);
  deskSpot.target.position.set(-1.7, .76, -1.75);
  deskSpot.castShadow = true;
  deskSpot.shadow.mapSize.set(512, 512);
  deskSpot.shadow.bias = -.0006; deskSpot.shadow.normalBias = .02; deskSpot.shadow.radius = 6;
  scene.add(deskSpot, deskSpot.target);
  const downlightTrim = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .012, 24), new THREE.MeshStandardMaterial({ color: "#f2efe8", roughness: .5 }));
  downlightTrim.name = "desk-downlight"; downlightTrim.position.set(-1.55, ROOM.h - .006, -1.75); scene.add(downlightTrim);
  const downlightLens = new THREE.Mesh(new THREE.CircleGeometry(.035, 24), new THREE.MeshStandardMaterial({ color: "#fff6e6", emissive: "#ffe3bd", emissiveIntensity: 0 }));
  downlightLens.rotation.x = Math.PI / 2; downlightLens.position.set(-1.55, ROOM.h - .013, -1.75); scene.add(downlightLens);
  // More light (Paul 2026-10-23: "this one gives it atmosphere", and a photo of the black track light with round spot heads at home): a short black track
  // in front of the window with four round heads on small yokes, each turned towards something. Three really light it (the house plaque, the bed, the print
  // by the window: a soft scallop on the wall, like the desk downlight); the second looks at the rug for the picture. The spots cast no shadows, so each
  // costs one extra light and nothing more.
  const trackBlack = new THREE.MeshStandardMaterial({ color: "#1d1e21", roughness: .5, metalness: .2 });
  const lensMat = new THREE.MeshStandardMaterial({ color: "#fff6e6", emissive: "#ffe3bd", emissiveIntensity: 0 });
  const TRACK_Z = -HD + .4, trackY = ROOM.h - .012; // along the window wall, in front of the window and well away from the ring lamp
  { const rail = new THREE.Mesh(new THREE.BoxGeometry(1.7, .024, .03), trackBlack); rail.name = "ceiling-track"; rail.position.set(0, trackY, TRACK_Z); scene.add(rail); }
  const trackHeads = [[-.7, [-1.45, 1.8, -HD + .02], "#ffe3bd"], [-.25, [-.3, .3, -1.2], null], [.25, [1.4, .5, -1.5], "#ffe0b5"], [.7, [1.3, 1.5, -HD + .02], "#ffe3bd"]]; // the plaque, the rug, the bed, the print by the window
  const roomSpots = [];
  for (const [hx, [tx, ty, tz], col] of trackHeads) { // hx: the head's place along the track
    const head = new THREE.Group(); head.name = "track-head"; head.position.set(hx, trackY - .02, TRACK_Z); scene.add(head);
    head.lookAt(new THREE.Vector3(tx, ty, tz)); // local +z now points at the target
    const yoke = new THREE.Mesh(new THREE.BoxGeometry(.012, .05, .05), trackBlack); yoke.position.set(0, .02, 0); head.add(yoke);
    const can = new THREE.Mesh(new THREE.CylinderGeometry(.034, .034, .11, 20), trackBlack); can.rotation.x = Math.PI / 2; can.position.z = .05; head.add(can);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(.028, 20), lensMat); lens.position.z = .106; head.add(lens);
    if (col) { const sp = new THREE.SpotLight(col, 0, 3.8, .5, .75, 2); sp.position.copy(head.position); sp.target.position.set(tx, ty, tz); scene.add(sp, sp.target); roomSpots.push(sp); }
  }

  // ---------- four moods: each one sets the window, daylight, room fill and the lamps that really glow ----------
  // The bedside lamp and the screen are real lights (no shadows, short reach), so a dark mood is lit by what is on in the room.
  const shade = root.getObjectByName("lamp-shade"), shadePos = shade.getWorldPosition(new THREE.Vector3());
  const bedLamp = new THREE.PointLight("#ffc98a", 0, 3.2, 2); bedLamp.position.copy(shadePos).add(new THREE.Vector3(0, -.02, 0)); scene.add(bedLamp);
  const monitor = root.getObjectByName("monitor-screen"), monitorPos = monitor.getWorldPosition(new THREE.Vector3());
  const screenLight = new THREE.PointLight("#8f9bff", 0, 3, 2); screenLight.position.copy(monitorPos).add(new THREE.Vector3(.35, 0, 0)); scene.add(screenLight);
  const ledStrip = root.getObjectByName("led-strip"), ledGlow = root.getObjectByName("led-glow"), ceilingLight = root.getObjectByName("ceiling-light");
  const tvFace = root.getObjectByName("tv-screen");
  tvFace.material.emissive.set("#ffffff");
  const tvTex = {
    film: canvasTex(256, 144, (ctx, w, h) => { // a film playing: warm dusk tones, no picture detail, no text
      const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#f2b36b"); g.addColorStop(.5, "#b2566a"); g.addColorStop(1, "#2c2f5e");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "rgba(20,16,30,.55)"; ctx.fillRect(0, h * .72, w, h * .28);
    }),
    game: canvasTex(256, 144, (ctx, w, h) => { // a console home screen made of coloured tiles only (no words, no logos)
      const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#10173d"); g.addColorStop(1, "#2a1a52"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      const rr = (x, y, ww, hh, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.roundRect(x, y, ww, hh, 5); ctx.fill(); };
      rr(14, 30, 78, 78, "#3f6cf0"); rr(98, 30, 44, 36, "#e0679a"); rr(98, 72, 44, 36, "#f2b36b"); rr(148, 30, 44, 36, "#5ec2a4"); rr(148, 72, 44, 36, "#8f7bff"); rr(198, 30, 44, 78, "#2f3a66");
      ctx.fillStyle = "rgba(255,255,255,.7)"; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(16 + i * 12, 12, 3, 0, 7); ctx.fill(); }
    }),
  };
  const applyTv = (moodName) => { // "auto": the TV plays a film on the weekend mood and is off otherwise; the visitor can force it
    const mode = chosen.tv === "auto" ? (moodName === "weekend" ? "film" : "off") : chosen.tv;
    tvFace.material.emissiveMap = mode === "off" ? null : tvTex[mode]; tvFace.material.emissiveIntensity = mode === "off" ? 0 : .9; tvFace.material.needsUpdate = true;
  };
  const blindFabric = root.getObjectByName("blind-fabric"), blindBar = root.getObjectByName("blind-bar");
  const setBlind = (drop) => { blindFabric.scale.y = drop / .18; blindFabric.position.y = wTop - drop / 2; blindBar.position.y = wTop - drop; };
  const MOODS = {
    focus:   { time: "day",   sky: "#ffffff", bg: "#d9d4c8", exposure: 1.20, hemi: [1.05, "#e8f0f8", "#d6c6aa"], sun: [2.3, "#fff3df", 2.3], fill: [4.8, "#ffe9cf"],
               bedLamp: 0, shade: .12, screen: .4, led: .6, glow: .35, ceiling: .35, monitor: 1, tv: 0, blind: .18, deskSpot: 3.4 },
    weekend: { time: "day",   sky: "#efe5d8", bg: "#d6cbbb", exposure: 1.08, hemi: [.85, "#f3e6d4", "#cdb79a"], sun: [1.1, "#ffe2b8", 2.3], fill: [4.5, "#ffcf96"],
               bedLamp: 3, shade: .9, screen: 0, led: .25, glow: .15, ceiling: .1, monitor: .45, tv: .9, blind: .45, deskSpot: 2.4 },
    night:   { time: "night", sky: "#ffffff", bg: "#1d2230", exposure: 1.05, hemi: [.44, "#7d8fb8", "#3a3442"], sun: [0, "#9db4ff", 2.3], fill: [1.5, "#ffcf9a"],
               bedLamp: .7, shade: .55, screen: 1.8, led: 1.4, glow: .35, ceiling: 0, monitor: 1.3, tv: 0, blind: .18, deskSpot: 4.2 },
    sunday:  { time: "day",   sky: "#ffe6cc", bg: "#dccdb9", exposure: 1.1, hemi: [1.0, "#f8e7d5", "#d6c2a4"], sun: [1.8, "#ffcf94", 1.45], fill: [2.5, "#ffd9b0"],
               bedLamp: 0, shade: .1, screen: 0, led: 0, glow: 0, ceiling: 0, monitor: .2, tv: 0, blind: .62, deskSpot: 1.8 },
  };
  let mood = "focus";
  async function setMood(name) {
    const m = MOODS[name];
    if (!m) return false;
    mood = name; live.mood = name;
    if (!(await setTime(m.time))) return false;
    skyMat.color.set(m.sky);
    scene.background.set(m.bg);
    renderer.toneMappingExposure = m.exposure;
    hemi.intensity = m.hemi[0]; hemi.color.set(m.hemi[1]); hemi.groundColor.set(m.hemi[2]);
    sun.intensity = m.sun[0]; sun.color.set(m.sun[1]); sun.position.y = m.sun[2]; // a lower sun in the early morning reaches further in
    fill.intensity = m.fill[0]; fill.color.set(m.fill[1]);
    bedLamp.intensity = m.bedLamp; deskSpot.intensity = m.deskSpot; downlightLens.material.emissiveIntensity = m.deskSpot * .4; for (const sp of roomSpots) sp.intensity = m.deskSpot * .7; lensMat.emissiveIntensity = m.deskSpot * .4; shade.material.emissiveIntensity = m.shade;
    screenLight.intensity = m.screen; monitor.material.color.setScalar(m.monitor);
    ledStrip.material.emissiveIntensity = m.led * 1.4; ledGlow.material.opacity = m.glow;
    ceilingLight.material.emissiveIntensity = m.ceiling * 3;
    applyTv(name);
    setBlind(m.blind);
    applyEnv(name);
    for (const sp of sprites) sp.material.color.setScalar(SPRITE_TINT[name] ?? 1);
    if (ceil.glow) ceil.glow.material.opacity = CEILING_GLOW[name] ?? .5;
    render();
    return true;
  }

  // ---------- swappable choices (round 1): feature wall, rug, window, bedding, posters ----------
  const bambooTex = canvasTex(256, 256, (ctx, w, h) => {
    for (let y = 0; y < h; y += 8) { ctx.fillStyle = (y / 8) % 2 ? "#b58a55" : "#c19761"; ctx.fillRect(0, y, w, 7); ctx.fillStyle = "rgba(60,40,20,.45)"; ctx.fillRect(0, y + 7, w, 1); }
    for (let i = 0; i < 80; i++) { ctx.fillStyle = `rgba(80,50,20,${.08 + (i % 5) * .02})`; ctx.fillRect((i * 53) % w, (i * 31) % h, 30 + (i % 7) * 6, 1); }
  }, { repeat: [1, 4] });
  const windowPaint = {};
  const swapWindow = () => { const v = chosen.window; if (v === "roller" || v === "bamboo") { blindFabric.material.map = (v === "bamboo" ? windowPaint.bamboo ?? bambooTex : windowPaint.roller ?? rollerTex); blindFabric.material.needsUpdate = true; } };
  art("room02-a4-roller-linen-v1.webp", { repeat: [3.9, .45], apply: (t) => { windowPaint.roller = t; swapWindow(); } });
  art("room02-a4-bamboo-blind-v1.webp", { repeat: [3.9, .45], apply: (t) => { windowPaint.bamboo = t; swapWindow(); } });
  art("room02-a4-curtain-linen-v1.webp", { repeat: [.85, 6], apply: (t) => { linenMat.map = t; linenMat.needsUpdate = true; } });
  const rollerTex = blindFabric.material.map;
  const oakBorderRug = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#1f2124"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#b8925f"; ctx.fillRect(14, 14, w - 28, h - 28);
    for (let y = 14; y < h - 14; y += 4) { ctx.fillStyle = "rgba(70,45,20,.12)"; ctx.fillRect(14, y, w - 28, 1.4); }
  });
  const CHOICES = {
    wall: { paper: "#ffffff", oat: "#f3eadb", latte: "#e6d2b5", warmGrey: "#d9d3ca", sage: "#c6cfb6", terracotta: "#d9967a", slate: "#66717e" },
    rug: { modern: () => rugArt.modern ?? weaveTexture("#e8dfd2", "#b9ab97"), stripe: () => rugArt.stripe ?? weaveTexture("#a9b1b8", "#5d6a76", { stripes: true }), oat: () => rugArt.oat ?? weaveTexture("#e0d2b8", "#9a8662"), oak: () => oakBorderRug },
    window: ["roller", "bamboo", "linen"],
    bedding: { stone: ["#d9d4ca", "#b9b2a3", "#4b5059", "#33373d", "#7b8794"], mist: ["#ccd6df", "#9fb0bf", "#f1ede4", "#cfc6b4", "#2f3b52"], clay: ["#e8dfcf", "#bfae8f", "#b9573f", "#8c3b2e", "#c9a14e"] },
    posters: ["A", "B", "C"],
    led: { violet: "#8f7bff", cyan: "#4fd1ff", amber: "#ffb066", pink: "#ff6fb5", white: "#e8f0ff" },
    desktop: ["minimal", "gamer", "coffee", "creative"],
    screen: ["city", "grid", "work", "calm"],
    sofa: { slate: "#8197ab", sand: "#e2cfae", moss: "#9aab8a", charcoal: "#666a72", terracotta: "#cf8f74" },
    shelf: ["mixed", "airy", "library"],
    tv: ["auto", "off", "film", "game"],
  };
  const rugCache = {};
  async function setChoice(kind, value) {
    if (kind === "posters") { if (!(await setPosters(value))) return false; chosen.posters = value; return true; }
    if (kind === "wall" && CHOICES.wall[value]) { featureMat.color.set(CHOICES.wall[value]); featureMat.map = value === "paper" ? stripeTex : wallCement; featureMat.needsUpdate = true; }
    else if (kind === "rug" && CHOICES.rug[value]) { loungeRugMat.map = value === "oak" ? (rugCache.oak ??= CHOICES.rug.oak()) : CHOICES.rug[value](); const cut = (value === "modern" && !!rugArt.modern) || (value === "oat" && !!rugArt.oat); loungeRugMat.transparent = cut; loungeRugMat.alphaTest = cut ? .45 : 0; loungeRugMat.needsUpdate = true; }
    else if (kind === "window" && CHOICES.window.includes(value)) {
      blindFabric.material.map = value === "bamboo" ? (windowPaint.bamboo ?? bambooTex) : (windowPaint.roller ?? rollerTex); blindFabric.material.needsUpdate = true;
      curtains.visible = value === "linen";
    } else if (kind === "bedding" && CHOICES.bedding[value]) {
      const [d0, d1, t0, t1] = CHOICES.bedding[value];
      duvetMat.color.setRGB(...DUVET_TINT); throwMat.color.set("#ffffff");
      duvetMat.map = weaveTexture(d0, d1); throwMat.map = weaveTexture(t0, t1);
      if (value === "stone") useBeddingArt();
      duvetMat.needsUpdate = throwMat.needsUpdate = true;
    } else if (kind === "led" && CHOICES.led[value]) {
      const c = CHOICES.led[value]; ledStrip.material.color.set(c); ledStrip.material.emissive.set(c); ledGlow.material.color.set(c); screenLight.color.set(c);
    } else if (kind === "desktop" && CHOICES.desktop.includes(value)) {
      for (const [n, g] of Object.entries(deskSets)) g.visible = n === value;
    } else if (kind === "screen" && CHOICES.screen.includes(value)) {
      screen.material.map = value === "city" ? cityScreen : (screens[value] ??= drawScreen(value)); screen.material.needsUpdate = true;
    } else if (kind === "sofa" && CHOICES.sofa[value]) {
      sofa.traverse((o) => { if (o.isMesh && o.name !== "legs") o.material.color.set(CHOICES.sofa[value]); }); // the wooden legs keep their wood
    } else if (kind === "tv" && CHOICES.tv.includes(value)) {
      chosen.tv = value; applyTv(live.mood);
    } else if (kind === "shelf" && CHOICES.shelf.includes(value)) {
      chosen.shelf = value; applyShelf();
    } else return false;
    chosen[kind] = value; render(); return true;
  }

  // ---------- loop ----------
  function resize() {
    const w = stage.clientWidth || 800, h = stage.clientHeight || 500;
    renderer.setSize(w, h, true); // true: also set the canvas CSS size, or on a hi-dpi screen the canvas is pixelRatio times too big for its box (cropped and half as sharp)
    camera.aspect = w / h;
    camera.fov = camera.aspect < .8 ? 82 : 60;
    camera.updateProjectionMatrix();
  }
  const render = () => renderer.render(scene, camera); renderSoon = render;
  new ResizeObserver(() => { resize(); render(); }).observe(stage);
  resize(); render(); ready = true;
  setMood("focus");
  setPosters("C");

  const info = () => {
    let vertices = 0, meshes = 0;
    root.traverseVisible((o) => { if (o.isMesh) { meshes++; vertices += o.geometry.attributes.position.count; } });
    const box3 = new THREE.Box3().setFromObject(root.getObjectByName("floor"));
    return {
      room: ROOM, window: WINDOW, door: DOOR, headboardTop: Math.max(...root.children.filter((o) => o.name === "bed-headboard").map((o) => new THREE.Box3().setFromObject(o).max.y)), wallArt: (() => { const o = root.getObjectByName("sofa-wall-art"); if (!o) return null; const bb = new THREE.Box3().setFromObject(o); return { min: bb.min.toArray(), max: bb.max.toArray() }; })(), wardrobe: (() => { const b = new THREE.Box3().setFromObject(root.getObjectByName("wardrobe")); return { min: b.min.toArray(), max: b.max.toArray() }; })(), centred, vertices, meshes,
      floor: { w: box3.max.x - box3.min.x, d: box3.max.z - box3.min.z },
      zones: ["zone-sleep-rug", "zone-lounge-rug"].map((n) => root.getObjectByName(n)?.name),
      bed: (() => { const b = new THREE.Box3().setFromObject(root.getObjectByName("bed")), m = new THREE.Box3().setFromObject(root.getObjectByName("bed-mattress")); return { min: b.min.toArray(), max: b.max.toArray(), mattressTop: m.max.y - .0 }; })(),
      work: Object.fromEntries(["desk", "chair"].map((n) => { const b = new THREE.Box3().setFromObject(root.getObjectByName(n)); return [n, { min: b.min.toArray(), max: b.max.toArray() }]; })),
      desk: { top: new THREE.Box3().setFromObject(root.getObjectByName("desk-top")).max.y, seat: new THREE.Box3().setFromObject(root.getObjectByName("chair-seat")).max.y,
        monitor: (() => { const b = new THREE.Box3().setFromObject(root.getObjectByName("monitor-panel")); return { min: b.min.toArray(), max: b.max.toArray() }; })() },
      lounge: Object.fromEntries(["sofa", "coffee-table", "tv-unit", "bookshelf"].map((n) => { const b = new THREE.Box3().setFromObject(root.getObjectByName(n)); return [n, { min: b.min.toArray(), max: b.max.toArray() }]; })),
      shelfClash: (() => {
        const sh = root.getObjectByName("bookshelf"), boards = [], items = [];
        sh.traverse((o) => { if (!o.isMesh) return; const b = new THREE.Box3().setFromObject(o); if (o.name === "shelf-board") boards.push(b); else if (/^shelf-(book|frame|top)/.test(o.name)) items.push([o.name, b]); });
        return items.filter(([, b]) => boards.some((d) => b.min.y < d.max.y - .002 && b.max.y > d.min.y + .002)).map(([n]) => n);
      })(),
      posters: (() => { const b = new THREE.Box3().setFromObject(posters); return { set: posterSet, loaded: printMats.every((m) => !!m.map), min: b.min.toArray(), max: b.max.toArray() }; })(),
      plant: (() => { const b = new THREE.Box3().setFromObject(plant); return { min: b.min.toArray(), max: b.max.toArray() }; })(),
      tvPanel: (() => { const b = new THREE.Box3().setFromObject(root.getObjectByName("tv-panel")); return { min: b.min.toArray(), max: b.max.toArray() }; })(),
      vinyl: (() => { const b = new THREE.Box3().setFromObject(vin), r = new THREE.Box3().setFromObject(record), sl = []; vin.traverse((o) => { if (o.name === "vinyl-sleeve") sl.push(new THREE.Box3().setFromObject(o)); });
        return { min: b.min.toArray(), max: b.max.toArray(), recordY: r.min.y, sleevesMaxY: Math.max(...sl.map((x) => x.max.y)), sleevesMinY: Math.min(...sl.map((x) => x.min.y)) }; })(),
      choices: { ...chosen }, featureWall: "#" + featureMat.color.getHexString(), curtains: curtains.visible, curtainPanels: curtains.children.filter((c) => c.name === "curtain-panel").map((c) => { const b = new THREE.Box3().setFromObject(c); return { min: b.min.toArray(), max: b.max.toArray() }; }), bedPoster: bedPosterId,
      bedPosterBox: (() => { const b = new THREE.Box3().setFromObject(bedPoster); return { min: b.min.toArray(), max: b.max.toArray() }; })(),
      plaque: (() => { const b = new THREE.Box3().setFromObject(plaque); return { min: b.min.toArray(), max: b.max.toArray(), loaded: !!plaqueTex.image }; })(),
      plaqueInView: (() => { const b = new THREE.Box3().setFromObject(plaque); camera.updateMatrixWorld(); return [[b.min.x, b.min.y], [b.max.x, b.min.y], [b.min.x, b.max.y], [b.max.x, b.max.y]].every(([x, y]) => { const v = new THREE.Vector3(x, y, b.max.z).project(camera); return Math.abs(v.x) < .98 && Math.abs(v.y) < .98 && v.z < 1; }); })(),
      painted: { ...painted },
      mood, blind: +((wTop - blindBar.position.y).toFixed(3)),
      camera: camera.position.toArray(), lights: scene.children.filter((c) => c.isLight).length,
    };
  };
  // The camera never moves (the visitor only turns their head), so both ends of the turn share one position; kept so tests can prove it stays inside the room.
  const reach = () => ({ min: home.toArray(), max: home.toArray() });
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
    tvState() { // local QA only
      const m = tvFace.material, on = !!m.emissiveMap;
      return { mode: !on ? "off" : m.emissiveMap === tvTex.film ? "film" : "game", reflection: !!m.map };
    },
    bedSoft() { // local QA only
      const bx = (n) => { const b = new THREE.Box3().setFromObject(root.getObjectByName(n)); return { min: b.min.toArray(), max: b.max.toArray() }; };
      return { duvet: bx("bed-duvet"), pillow: bx("bed-pillow"), cushion: root.getObjectByName("bed-cushion") ? bx("bed-cushion") : null, throw: bx("bed-throw"), mattress: bx("bed-mattress"), frame: bx("bed-frame") };
    },
    batch4() { // local QA only: the ceiling, console skins and night foreground
      const bx = (n) => { const o = root.getObjectByName(n) ?? scene.getObjectByName(n); if (!o) return null; const b = new THREE.Box3().setFromObject(o); return { min: b.min.toArray(), max: b.max.toArray() }; };
      const lamp = bx("ring-lamp");
      const skin = bx("game-console-skin"), padSkin = bx("game-pad-skin"), glow = bx("ceiling-glow");
      return { ready: !!(lamp && skin && padSkin && glow && fgTex.night), lamp, glow, skin, padSkin, console: bx("game-console"), consoleTop: bx("game-console-top")?.max[1], fgNightLoaded: !!fgTex.night, fgIsNight: fgMat.map === fgTex.night };
    },
    windowParts() { // local QA only
      const bx = (n) => { const b = new THREE.Box3().setFromObject(root.getObjectByName(n)); return { min: b.min.toArray(), max: b.max.toArray() }; };
      const sashEl = root.getObjectByName("window-sash"), fgEl = root.getObjectByName("window-foreground");
      return { sash: sashEl.visible, foreground: fgEl.visible, sashBox: bx("window-sash"), fgBox: bx("window-foreground"),
        boxesHidden: ["window-frame-top", "window-frame-bottom", "window-frame-left", "window-frame-right", "window-mullion"].every((n) => !root.getObjectByName(n).visible) };
    },
    inView(names) { // local QA only: where the named objects' centres land on screen (-1..1; z < 1 means in front of the camera)
      camera.updateMatrixWorld(); scene.updateMatrixWorld(true);
      return Object.fromEntries(names.map((n) => { const o = root.getObjectByName(n); const b = new THREE.Box3().setFromObject(o), c = b.getCenter(new THREE.Vector3()).project(camera);
        const corners = [b.min.x, b.max.x].flatMap((x) => [b.min.y, b.max.y].flatMap((y) => [b.min.z, b.max.z].map((z) => new THREE.Vector3(x, y, z).project(camera))));
        return [n, { x: +c.x.toFixed(2), y: +c.y.toFixed(2), z: +c.z.toFixed(3), minX: +Math.min(...corners.map((v) => v.x)).toFixed(2), maxX: +Math.max(...corners.map((v) => v.x)).toFixed(2) }]; }));
    },
    rugs() { // local QA only
      const bx = (n) => { const b = new THREE.Box3().setFromObject(root.getObjectByName(n)); return { min: b.min.toArray(), max: b.max.toArray() }; };
      return { sleep: bx("zone-sleep-rug"), lounge: bx("zone-lounge-rug"), tv: bx("zone-tv-rug"), bed: bx("bed-frame"), bedside: bx("bedside-top") };
    },
    tvCorner() { // local QA only: rug, console and cabinet bounds
      const bx = (o) => { const b = new THREE.Box3().setFromObject(o); return { min: b.min.toArray(), max: b.max.toArray() }; };
      const get = (n) => root.getObjectByName(n);
      return { rug: bx(get("zone-tv-rug")), unit: bx(get("tv-unit")), table: bx(get("coffee-table")), console: bx((() => { const g = new THREE.Group(); return get("game-console"); })()), pad: bx(get("game-pad")),
        shelfTop: new THREE.Box3().setFromObject(get("tv-console-bottom")).max.y, topUnderside: new THREE.Box3().setFromObject(get("tv-console")).min.y };
    },
    robotState() { const rb = tapTargets.robot; if (!rb) return { loaded: false }; scene.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(rb), p = b.getCenter(new THREE.Vector3()).project(camera); return { loaded: true, hopping, y: rb.position.y, yaw: rb.rotation.y, ndc: { x: p.x, y: p.y, z: p.z } }; }, // local QA only
    info, reach, arrive, lookTo, looks: () => ({ name: lookName, yaw: look.yaw - look0.yaw, pitch: look.pitch - look0.pitch }), arriving: () => arriving, windowArt, setTime, setMood, setPosters, setChoice, render, camera, controls, moods: Object.keys(MOODS),
    choices: Object.fromEntries(Object.entries(CHOICES).map(([k, v]) => [k, Array.isArray(v) ? v : Object.keys(v)])),
    // average brightness of the rendered frame (0-255), so tests can prove no mood is blown out or crushed to black
    brightness() { render(); const gl = renderer.getContext(), w = gl.drawingBufferWidth, h = gl.drawingBufferHeight, px = new Uint8Array(w * h * 4); gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px); let sum = 0, n = 0; for (let i = 0; i < px.length; i += 4 * 37) { sum += (px[i] + px[i + 1] + px[i + 2]) / 3; n++; } return sum / n; },
    setLang(l) { lang = l; renderer.domElement.setAttribute("aria-label", TEXT[l].canvas); },
  };
}
