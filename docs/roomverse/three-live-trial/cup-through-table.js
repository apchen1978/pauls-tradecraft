// Small, standalone Three-Live fixture. Units are metres.
const fault = "cup-through-table";
const wood = new THREE.MeshStandardMaterial({ color: 0x987454 });
const darkWood = new THREE.MeshStandardMaterial({ color: 0x533c31 });
const floorMat = new THREE.MeshStandardMaterial({ color: 0xb9a59a });
const ceramic = new THREE.MeshStandardMaterial({ color: 0xf3e7d2 });
const frameMat = new THREE.MeshStandardMaterial({ color: 0x353b3a });

function box(name, size, position, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.name = name;
  mesh.position.set(...position);
  scene.add(mesh);
}

const floor = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 2.5), floorMat);
floor.name = "floor";
floor.rotation.x = -Math.PI / 2;
scene.add(floor);
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const key = new THREE.DirectionalLight(0xffffff, 1.2);
key.position.set(1, 3, 2);
scene.add(key);
box("table-top", [0.80, 0.06, 0.60], [0.55, 0.70, 0.12], wood);
for (const x of [0.25, 0.85]) {
  for (const z of [-0.08, 0.32]) box(`table-leg-${x}-${z}`, [0.05, 0.68, 0.05], [x, 0.34, z], darkWood);
}

box("chair-seat", [0.42, 0.05, 0.40], [-0.38, 0.47, 0.13], wood);
const chairLegOffset = fault === "edge" ? 0.235 : 0.16;
const chairLegLift = fault === "float" ? 0.05 : 0;
for (const side of [-1, 1]) {
  for (const z of [-0.02, 0.28]) {
    box(`chair-leg-${side}-${z}`, [0.05, 0.45, 0.05],
      [-0.38 + side * chairLegOffset, 0.225 + chairLegLift, z], darkWood);
  }
}
box("chair-back", [0.42, 0.42, 0.04], [-0.38, 0.69, -0.055], wood);

const cupY = fault === "cup-through-table" ? 0.68 : 0.80;
const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.14, 16), ceramic);
cup.name = "cup";
cup.position.set(0.55, cupY, 0.12);
scene.add(cup);

box("window-left", [0.04, 1.35, 0.04], [-1.15, 1.05, -0.95], frameMat);
box("window-right", [0.04, 1.35, 0.04], [1.15, 1.05, -0.95], frameMat);
box("window-top", [2.34, 0.04, 0.04], [0, 1.73, -0.95], frameMat);
box("window-bottom", [2.34, 0.04, 0.04], [0, 0.37, -0.95], frameMat);
