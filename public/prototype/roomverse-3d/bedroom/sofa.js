// The Room 02 sofa: the same image-to-3D sofa model as Room 01 (../models/sofa.glb), re-coloured for this room.
// It follows the living room's treatment so both rooms feel equally solid: colours baked in the model, a fine linen weave
// sampled from three sides (the model has no UVs), and a smoothed top edge (the raw model has a fringe of small spikes).
import * as THREE from "../vendor/three.module.min.js";
import { GLTFLoader } from "../vendor/GLTFLoader.js";

function weaveTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const ctx = c.getContext("2d"), w = 256, h = 256;
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  ctx.fillStyle = "rgb(128,0,0)"; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < w; i += 3) { ctx.fillStyle = "rgba(255,0,0,.10)"; ctx.fillRect(i, 0, 1, h); ctx.fillStyle = "rgba(0,0,0,.10)"; ctx.fillRect(0, i, w, 1); }
  for (let i = 0; i < 260; i++) {
    const light = rnd() < .5; ctx.fillStyle = light ? `rgba(255,0,0,${.25 + rnd() * .3})` : `rgba(0,0,0,${.2 + rnd() * .25})`;
    const x = rnd() * w, y = Math.floor(rnd() * h / 3) * 3, len = 8 + rnd() * 40; ctx.fillRect(x, y, len, 1.5 + rnd()); if (x + len > w) ctx.fillRect(x - w, y, len, 1.5);
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.NoColorSpace; t.anisotropy = 4;
  return t;
}

function smoothTopEdge(obj) {
  obj.traverse((m) => {
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
}

// Returns a Group holding the sofa, `width` metres wide (its front looks along +z), standing on y = 0 and centred on x = z = 0.
export async function loadSofa({ width = 1.6, tint = "#ffffff" } = {}) {
  const gltf = await new GLTFLoader().loadAsync(new URL("../models/sofa.glb", import.meta.url).href);
  const obj = gltf.scene;
  const size = new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3());
  obj.scale.multiplyScalar(width / size.x);
  const b = new THREE.Box3().setFromObject(obj), c = b.getCenter(new THREE.Vector3());
  obj.position.set(-c.x, -b.min.y, -c.z);
  obj.updateMatrixWorld(true);
  smoothTopEdge(obj);
  const weave = weaveTexture();
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .92, color: tint });
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.weave = { value: weave };
    sh.vertexShader = "varying vec3 vWP; varying vec3 vWN;\n" + sh.vertexShader.replace("#include <project_vertex>", "#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.)).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);");
    sh.fragmentShader = "uniform sampler2D weave; varying vec3 vWP; varying vec3 vWN;\n" + sh.fragmentShader.replace("#include <color_fragment>", `#include <color_fragment>
      vec3 bw = pow(abs(normalize(vWN)), vec3(4.)); bw /= bw.x + bw.y + bw.z;
      float s = 3.5;
      float wv = texture2D(weave, vWP.zy * s).r * bw.x + texture2D(weave, vWP.xz * s).r * bw.y + texture2D(weave, vWP.xy * s).r * bw.z;
      diffuseColor.rgb *= .75 + .5 * wv;`);
  };
  obj.traverse((m) => { if (!m.isMesh) return; m.geometry.computeVertexNormals(); m.castShadow = true; m.receiveShadow = true; m.material = mat; });
  const g = new THREE.Group(); g.add(obj);
  return g;
}
