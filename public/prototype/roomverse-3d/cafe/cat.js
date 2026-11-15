// Room 04's orange-and-white cat (Paul, 2026-11-15: an orange cat with a bed, a food bowl and a water bowl).
//
// The SHAPE comes from an image-to-3D model (Tencent Hunyuan3D 2.1, shape only, from a concept picture drawn for this card; portfolio use, non-commercial), simplified to about
// 2,300 vertices. The COLOUR is not baked into the vertices (too few of them for stripes): like the sofa in Rooms 01 and 02, the material draws it with a small shader from the
// position on the cat, so the tabby stripes, the white chest and muzzle, the closed eyes and the pink nose stay sharp whatever the vertex count.
//
// Model space (metres, as exported): y up, the cat lies on y = 0, about 0.40 x 0.166 x 0.40. It faces +z; the head is on the -x side, the body curls round to +x and -z,
// and the tail wraps along the front (+z) to the right. All the numbers below are positions in that space.
import * as THREE from "../vendor/three.module.min.js";
import { GLTFLoader } from "../vendor/GLTFLoader.js";

export const CAT_FILE = "../models/room04-cat-v1.glb"; // relative to this file

// Linear-light colours (sRGB #DE9440 orange, #C0702A darker stripe, #FBF2E4 cream, #E9A3A0 pink nose).
const GLSL = /* glsl */ `
  varying vec3 vCatPos;
  varying vec3 vCatNormal;
`;

const FRAGMENT = /* glsl */ `
  vec3 catColour(vec3 p, vec3 n) {
    const vec3 ORANGE = vec3(0.800, 0.262, 0.030);   // sRGB #E78B2E, a brighter ginger (Paul: more vivid)
    const vec3 DARK = vec3(0.470, 0.108, 0.010);     // sRGB #B75D15
    const vec3 CREAM = vec3(0.965, 0.888, 0.776);
    const vec3 PINK = vec3(0.815, 0.366, 0.351);
    const vec3 LASH = vec3(0.150, 0.060, 0.020);
    const vec2 HEAD = vec2(-0.10, 0.04);          // head centre on the floor plan (x, z)
    float facing = smoothstep(0.15, 0.55, n.z);    // surfaces that look to the front

    // white: chest and front paws, muzzle and chin, a blaze up the forehead, a little belly
    float chest = 1.0 - smoothstep(0.060, 0.100, length((p - vec3(-0.085, 0.020, 0.140)) * vec3(1.0, 2.6, 1.0)));
    float muzzle = 1.0 - smoothstep(0.030, 0.052, length((p - vec3(-0.100, 0.064, 0.130)) * vec3(1.0, 1.5, 1.0)));
    float blaze = (1.0 - smoothstep(0.007, 0.017, abs(p.x + 0.100))) * smoothstep(0.066, 0.084, p.y) * (1.0 - smoothstep(0.108, 0.128, p.y)) * smoothstep(0.045, 0.075, p.z);
    float belly = (1.0 - smoothstep(0.004, 0.030, p.y)) * 0.55;
    float white = clamp(chest + muzzle + blaze + belly, 0.0, 1.0);

    // tabby stripes on the back and flanks: they run across the body, so round the ring of the curl they are rays from its middle
    float theta = atan(p.z, p.x);
    float wobble = 0.55 * sin(theta * 3.0 + p.y * 24.0);
    float rays = smoothstep(0.40, 0.78, sin(theta * 9.0 + wobble));
    float aboveFloor = smoothstep(0.014, 0.060, p.y);
    float awayFromHead = smoothstep(0.075, 0.125, length(p.xz - HEAD));
    // the tail lies along the front, to the right of the head: its rings run across it
    float tail = smoothstep(0.075, 0.105, p.z) * smoothstep(-0.040, 0.000, p.x) * (1.0 - smoothstep(0.050, 0.085, p.y));
    float rings = smoothstep(0.40, 0.75, sin(p.x * 90.0)) * tail;
    // forehead: three short stripes above the eyes
    float forehead = smoothstep(0.65, 0.92, sin((p.x + 0.100) * 215.0 + 1.5707963)) * smoothstep(0.095, 0.115, p.y) * (1.0 - smoothstep(0.03, 0.045, abs(p.x + 0.100))) * (1.0 - smoothstep(0.125, 0.145, p.y));
    float stripes = max(max(rays * aboveFloor * awayFromHead, rings), forehead * (1.0 - tail));

    vec3 c = mix(ORANGE, DARK, clamp(stripes, 0.0, 1.0) * 0.92);
    c = mix(c, CREAM, white);

    // closed eyes (two short curved lines), pink nose, on the face only
    float eyeL = (1.0 - smoothstep(0.0025, 0.0055, abs(p.y - (0.080 + 45.0 * pow(p.x + 0.140, 2.0))))) * (1.0 - smoothstep(0.011, 0.016, abs(p.x + 0.140)));
    float eyeR = (1.0 - smoothstep(0.0025, 0.0055, abs(p.y - (0.080 + 45.0 * pow(p.x + 0.060, 2.0))))) * (1.0 - smoothstep(0.011, 0.016, abs(p.x + 0.060)));
    float eyes = max(eyeL, eyeR) * facing * step(0.085, p.z);
    float nose = (1.0 - smoothstep(0.0045, 0.0085, length((p - vec3(-0.100, 0.0705, 0.1345)) * vec3(1.0, 1.2, 1.0)))) * facing;
    // short fur: fine streaks along the body and a little grain, a few per cent either way
    float fur = sin(theta * 140.0 + p.y * 310.0 + sin(p.x * 95.0) * 2.0) * 0.5 + sin(p.x * 420.0 + p.z * 380.0) * sin(p.y * 520.0) * 0.5;
    c *= 1.0 + 0.055 * fur;
    c = mix(c, LASH, eyes * 0.9);
    c = mix(c, PINK, nose);
    return c;
  }
`;

export function catMaterial() {
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = GLSL + shader.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\n  vCatPos = position; vCatNormal = normal;");
    shader.fragmentShader = GLSL + FRAGMENT + shader.fragmentShader.replace("#include <color_fragment>", "#include <color_fragment>\n  diffuseColor.rgb = catColour(vCatPos, normalize(vCatNormal));")
      // a soft halo of fur at grazing angles, so the outline is not a hard plastic edge
      .replace("#include <normal_fragment_maps>", "#include <normal_fragment_maps>\n  { float catRim = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), 2.4); diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 1.22 + 0.035, catRim * 0.65); }");
  };
  material.customProgramCacheKey = () => "room04-cat-v2";
  return material;
}

// Taubin smoothing (a shrink-free Laplacian): rounds off the facets of the simplified shape without adding a vertex. The flat underside keeps its height.
function smoothCat(geometry, passes = 4) {
  const pos = geometry.attributes.position, index = geometry.index;
  if (!index) return;
  const n = pos.count, near = Array.from({ length: n }, () => new Set()), idx = index.array;
  for (let i = 0; i < idx.length; i += 3) { const a = idx[i], b = idx[i + 1], c = idx[i + 2]; near[a].add(b).add(c); near[b].add(a).add(c); near[c].add(a).add(b); }
  const step = (factor) => {
    const next = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      let x = 0, y = 0, z = 0; for (const j of near[i]) { x += pos.getX(j); y += pos.getY(j); z += pos.getZ(j); }
      const count = near[i].size || 1, px = pos.getX(i), py = pos.getY(i), pz = pos.getZ(i);
      next[i * 3] = px + factor * (x / count - px); next[i * 3 + 1] = py < 0.006 ? py : py + factor * (y / count - py); next[i * 3 + 2] = pz + factor * (z / count - pz);
    }
    pos.array.set(next); pos.needsUpdate = true;
  };
  for (let pass = 0; pass < passes; pass++) { step(0.5); step(-0.53); }
}

// The cat as a Group (one mesh, one material), lying on y = 0 and centred on x = z = 0 as exported.
export async function loadCat() {
  const gltf = await new GLTFLoader().loadAsync(new URL(CAT_FILE, import.meta.url).href);
  const group = new THREE.Group(); group.name = "room04-cat";
  const material = catMaterial();
  gltf.scene.traverse((m) => {
    if (!m.isMesh) return;
    m.geometry.deleteAttribute("color"); // the old vertex gradient is not used
    smoothCat(m.geometry);
    m.geometry.computeVertexNormals();
    m.material = material; m.castShadow = true; m.receiveShadow = true;
  });
  group.add(gltf.scene);
  return group;
}
