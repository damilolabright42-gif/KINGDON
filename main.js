import * as THREE from 'three';

const game = document.querySelector('#game');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8dc9df);
scene.fog = new THREE.Fog(0x8dc9df, 38, 78);
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 200);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
game.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffefc2, 0x52654a, 2));
const sun = new THREE.DirectionalLight(0xfff1bd, 2.5);
sun.position.set(-18, 28, 10); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); scene.add(sun);

const LAND_RADIUS = 38, BUILD_GRID = 6;
const trees = [], rocks = [], obstacles = [];
const ground = new THREE.Mesh(new THREE.CircleGeometry(LAND_RADIUS, 64), new THREE.MeshStandardMaterial({ color: 0x70a84f, roughness: 1 }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
// Alternating grass shades form visible, orderly building plots.
for (let x = -36; x < 36; x += BUILD_GRID) {
  for (let z = -36; z < 36; z += BUILD_GRID) {
    const cx = x + BUILD_GRID / 2, cz = z + BUILD_GRID / 2;
    if (Math.hypot(cx, cz) < LAND_RADIUS - 1) {
      const shade = (Math.round(x / BUILD_GRID) + Math.round(z / BUILD_GRID)) % 2 === 0 ? 0x78ad50 : 0x6fa44b;
      const tile = new THREE.Mesh(new THREE.PlaneGeometry(BUILD_GRID - 0.12, BUILD_GRID - 0.12), new THREE.MeshStandardMaterial({ color: shade, roughness: 1 }));
      tile.rotation.x = -Math.PI / 2; tile.position.set(cx, 0.018, cz); tile.receiveShadow = true; scene.add(tile);
    }
  }
}
const estate = new THREE.Mesh(new THREE.BoxGeometry(9, 0.25, 9), new THREE.MeshStandardMaterial({ color: 0xb4a77a }));
estate.position.set(0, 0.12, -2); estate.receiveShadow = true; scene.add(estate);

function addObstacle(x, z, radius) { obstacles.push({ x, z, radius }); }
function addBox(w, h, d, color, x, y, z, parent = scene, roughness = 0.85) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, roughness }));
  mesh.position.set(x, y, z); mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function createHouse(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.random() * Math.PI * 2;
  addBox(3.8, 2.4, 3, 0xb08a67, 0, 1.2, 0, g);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.8, 4), new THREE.MeshStandardMaterial({ color: 0x654535, roughness: 0.9 }));
  roof.position.y = 3.3; roof.rotation.y = Math.PI / 4; roof.scale.z = 0.72; roof.castShadow = true; g.add(roof);
  addBox(1.05, 1.75, 0.14, 0x493024, 0, 0.88, 1.56, g);
  addBox(0.75, 0.65, 0.14, 0x8bd0e1, -1.15, 1.55, 1.56, g); addBox(0.75, 0.65, 0.14, 0x8bd0e1, 1.15, 1.55, 1.56, g);
  scene.add(g); addObstacle(x, z, 2.85); return g;
}
function createWorkshop(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.random() * Math.PI * 2;
  addBox(4.2, 2.2, 3.2, 0x9c7139, 0, 1.1, 0, g); addBox(4.5, 0.35, 3.5, 0x544239, 0, 2.35, 0, g);
  addBox(1.4, 1.55, 0.14, 0x4a3326, -1.15, 0.78, 1.67, g); addBox(1.25, 0.85, 0.14, 0x89bdd1, 1.05, 1.45, 1.67, g);
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.11, 8, 16), new THREE.MeshStandardMaterial({ color: 0x9a7448 }));
  wheel.position.set(-1.3, 1.2, 1.68); wheel.rotation.x = Math.PI / 2; wheel.castShadow = true; g.add(wheel);
  scene.add(g); addObstacle(x, z, 3.05); return g;
}
function createTower(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  addBox(2.5, 4.8, 2.5, 0x758398, 0, 2.4, 0, g); addBox(3.1, 0.35, 3.1, 0x5d6675, 0, 4.95, 0, g);
  for (const px of [-1.25, 0, 1.25]) for (const pz of [-1.25, 1.25]) addBox(0.42, 0.7, 0.42, 0x5d6675, px, 5.45, pz, g);
  scene.add(g); addObstacle(x, z, 2); return g;
}
const keep = new THREE.Group(); keep.position.set(0, 0, -2);
addBox(5, 3, 4, 0x9b6947, 0, 1.5, 0, keep); addBox(5.2, 0.35, 4.2, 0x51413a, 0, 3.05, 0, keep); scene.add(keep); addObstacle(0, -2, 3.35);

const keys = {};
addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; if (e.code === 'Space') attack(); });
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
const hero = new THREE.Group();
const skin = new THREE.MeshStandardMaterial({ color: 0xf0c49a, roughness: 0.8 });
const tunic = new THREE.MeshStandardMaterial({ color: 0x2f78a8, roughness: 0.9 });
const pants = new THREE.MeshStandardMaterial({ color: 0x39465b, roughness: 0.9 });
function part(geometry, material, x, y, z, parent = hero) { const m = new THREE.Mesh(geometry, material); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m; }
part(new THREE.CapsuleGeometry(0.48, 0.75, 4, 8), tunic, 0, 1.25, 0);
part(new THREE.SphereGeometry(0.38, 16, 12), skin, 0, 2.12, 0);
part(new THREE.CapsuleGeometry(0.13, 0.58, 4, 8), tunic, -0.57, 1.35, 0);
part(new THREE.CapsuleGeometry(0.17, 0.58, 4, 8), pants, -0.23, 0.47, 0); part(new THREE.CapsuleGeometry(0.17, 0.58, 4, 8), pants, 0.23, 0.47, 0);
part(new THREE.BoxGeometry(0.36, 0.18, 0.55), new THREE.MeshStandardMaterial({ color: 0x493629 }), -0.23, 0.12, 0.08);
part(new THREE.BoxGeometry(0.36, 0.18, 0.55), new THREE.MeshStandardMaterial({ color: 0x493629 }), 0.23, 0.12, 0.08);
part(new THREE.SphereGeometry(0.4, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.48), new THREE.MeshStandardMaterial({ color: 0x543b2d }), 0, 2.34, 0);
for (const s of [-1, 1]) part(new THREE.SphereGeometry(0.045, 8, 6), new THREE.MeshStandardMaterial({ color: 0x24201b }), s * 0.14, 2.17, 0.34);
const rightArm = new THREE.Group(); rightArm.position.set(0.5, 1.65, 0); hero.add(rightArm);
part(new THREE.CapsuleGeometry(0.14, 0.62, 4, 8), tunic, 0.08, -0.34, 0, rightArm);
part(new THREE.SphereGeometry(0.15, 10, 8), skin, 0.12, -0.72, 0.08, rightArm);
const sword = new THREE.Group(); sword.position.set(0.12, -0.75, 0.12); rightArm.add(sword);
addBox(0.13, 0.32, 0.13, 0x604329, 0, 0, 0, sword, 0.9); addBox(0.42, 0.08, 0.14, 0xb4b9c0, 0, 0.2, 0, sword, 0.3); addBox(0.16, 1.18, 0.065, 0xdde4e8, 0, 0.86, 0, sword, 0.3);
hero.position.set(0, 0, 7); scene.add(hero);

const resources = { gold: 25, wood: 12, stone: 8 };
function makeTree(x, z) {
  const tree = new THREE.Group(); const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.36, 2.5, 10), new THREE.MeshStandardMaterial({ color: 0x765137, roughness: 1 }));
  trunk.position.y = 1.25; trunk.castShadow = true; tree.add(trunk);
  for (const [y, r, c] of [[2.5, 1.5, 0x3f7850], [3.3, 1.2, 0x4b8954], [4.05, 0.85, 0x588f55]]) { const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), new THREE.MeshStandardMaterial({ color: c, roughness: 1 })); crown.position.y = y; crown.castShadow = true; tree.add(crown); }
  tree.position.set(x, 0, z); scene.add(tree); trees.push(tree); addObstacle(x, z, 0.72);
}
function makeRock(x, z) { const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9, 0), new THREE.MeshStandardMaterial({ color: 0x7e8792, roughness: 0.9 })); rock.position.set(x, 0.7, z); rock.scale.y = 0.7; rock.castShadow = true; scene.add(rock); rocks.push(rock); }
[[-8, -8], [10, -9], [-12, 8], [12, 12], [16, -3], [-17, -15]].forEach(p => makeTree(p[0], p[1]));
[[-6, 13], [14, 7], [7, -14], [-15, 2]].forEach(p => makeRock(p[0], p[1]));
const enemies = [];
function makeEnemy(x, z) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.75, 12, 8), new THREE.MeshStandardMaterial({ color: 0x934851, roughness: 0.7 })); e.position.set(x, 0.75, z); e.castShadow = true; e.userData.hp = 3; scene.add(e); enemies.push(e); }
makeEnemy(14, 16); makeEnemy(-14, 15);

function updateHud() { document.querySelector('#gold').textContent = resources.gold; document.querySelector('#wood').textContent = resources.wood; document.querySelector('#stone').textContent = resources.stone; }
let messageTimer;
function message(text) { const box = document.querySelector('#message'); box.textContent = text; box.classList.add('show'); clearTimeout(messageTimer); messageTimer = setTimeout(() => box.classList.remove('show'), 1600); }
function nearest(list, max = 2.4) { let found = null, distance = max; list.forEach(item => { const d = hero.position.distanceTo(item.position); if (d < distance) { distance = d; found = item; } }); return found; }
function gather() {
  const tree = nearest(trees, 2.5);
  if (tree) { resources.wood += 3; scene.remove(tree); trees.splice(trees.indexOf(tree), 1); const i = obstacles.findIndex(o => Math.hypot(o.x - tree.position.x, o.z - tree.position.z) < 0.1); if (i >= 0) obstacles.splice(i, 1); updateHud(); message('+3 wood'); return true; }
  const rock = nearest(rocks, 2.5); if (rock) { resources.stone += 3; scene.remove(rock); rocks.splice(rocks.indexOf(rock), 1); updateHud(); message('+3 stone'); return true; } return false;
}
let attackTime = 0, attackStart = -1000;
function attack() {
  const now = performance.now(); if (now - attackTime < 500) return; attackTime = now; attackStart = now;
  const enemy = nearest(enemies, 2.8);
  if (enemy) { enemy.userData.hp--; enemy.position.add(new THREE.Vector3(enemy.position.x - hero.position.x, 0, enemy.position.z - hero.position.z).normalize().multiplyScalar(0.12)); if (enemy.userData.hp <= 0) { scene.remove(enemy); enemies.splice(enemies.indexOf(enemy), 1); resources.gold += 8; updateHud(); message('+8 gold'); } }
}

const buildingSizes = { house: { cost: [15, 5], radius: 2.85 }, tower: { cost: [10, 10], radius: 2 }, workshop: { cost: [20, 8], radius: 3.05 } };
let selectedBuilding = null, hologram = null;
function snapToPlot(position) { const x = Math.floor(position.x / BUILD_GRID) * BUILD_GRID + BUILD_GRID / 2, z = Math.floor(position.z / BUILD_GRID) * BUILD_GRID + BUILD_GRID / 2; return new THREE.Vector3(x, 0, z); }
function makeHologram(type) {
  if (hologram) scene.remove(hologram); hologram = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ color: 0x78d6ff, transparent: true, opacity: 0.38, depthWrite: false, side: THREE.DoubleSide });
  const size = type === 'house' ? [3.8, 2.4, 3] : type === 'tower' ? [2.5, 4.8, 2.5] : [4.2, 2.2, 3.2];
  const body = new THREE.Mesh(new THREE.BoxGeometry(...size), material); body.position.y = size[1] / 2; hologram.add(body);
  const outline = new THREE.LineSegments(new THREE.EdgesGeometry(body.geometry), new THREE.LineBasicMaterial({ color: 0xc5f4ff })); outline.position.copy(body.position); hologram.add(outline);
  if (type === 'house') { const roof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.8, 4), material); roof.position.y = 3.3; roof.rotation.y = Math.PI / 4; hologram.add(roof); }
  scene.add(hologram);
}
// Movement faces the same direction as this vector, so the preview is always in front.
function getBuildPosition() { const forward = new THREE.Vector3(Math.sin(hero.rotation.y), 0, Math.cos(hero.rotation.y)); return snapToPlot(hero.position.clone().addScaledVector(forward, 6)); }
function canBuildAt(p, radius) { if (Math.hypot(p.x, p.z) > LAND_RADIUS - 2) return false; return !obstacles.some(o => Math.hypot(o.x - p.x, o.z - p.z) < o.radius + radius * 0.55); }
function updateHologram() { if (!hologram || !selectedBuilding) return; const p = getBuildPosition(), valid = canBuildAt(p, buildingSizes[selectedBuilding].radius); hologram.position.set(p.x, 0, p.z); hologram.traverse(o => { if (o.material && o.material.color) o.material.color.set(valid ? 0x78d6ff : 0xff4545); }); }
function clearHologram() { if (hologram) scene.remove(hologram); hologram = null; selectedBuilding = null; }
document.querySelectorAll('[data-building]').forEach(button => button.addEventListener('click', () => { selectedBuilding = button.dataset.building; makeHologram(selectedBuilding); updateHologram(); message('Preview snaps to a plot in front of you'); }));
function build() {
  if (!selectedBuilding) return false;
  const p = getBuildPosition(), spec = buildingSizes[selectedBuilding];
  if (!canBuildAt(p, spec.radius)) { message('Red: choose a clear plot'); return true; }
  if (resources.wood < spec.cost[0] || resources.stone < spec.cost[1]) { message('Not enough building materials'); return true; }
  resources.wood -= spec.cost[0]; resources.stone -= spec.cost[1];
  if (selectedBuilding === 'house') createHouse(p.x, p.z); if (selectedBuilding === 'tower') createTower(p.x, p.z); if (selectedBuilding === 'workshop') createWorkshop(p.x, p.z);
  clearHologram(); updateHud(); message('Construction complete'); return true;
}
function interact() { if (build()) return; if (gather()) return; message('Move close to a tree or rock'); }
addEventListener('keydown', e => { if (e.key.toLowerCase() === 'e') interact(); });

const joystick = document.querySelector('#joystick'), knob = document.querySelector('#joystickKnob'), mobileMove = { x: 0, z: 0 };
let joystickPointer = null;
function updateJoystick(event) { const rect = joystick.getBoundingClientRect(), dx = event.clientX - (rect.left + rect.width / 2), dy = event.clientY - (rect.top + rect.height / 2), max = rect.width * 0.34, len = Math.hypot(dx, dy), scale = len > max ? max / len : 1, x = dx * scale, y = dy * scale; knob.style.transform = `translate(${x}px,${y}px)`; mobileMove.x = x / max; mobileMove.z = y / max; }
joystick.addEventListener('pointerdown', e => { joystickPointer = e.pointerId; joystick.setPointerCapture(e.pointerId); updateJoystick(e); });
joystick.addEventListener('pointermove', e => { if (e.pointerId === joystickPointer) updateJoystick(e); });
function releaseJoystick(e) { if (e.pointerId !== joystickPointer) return; joystickPointer = null; mobileMove.x = mobileMove.z = 0; knob.style.transform = 'translate(0,0)'; }
joystick.addEventListener('pointerup', releaseJoystick); joystick.addEventListener('pointercancel', releaseJoystick);
document.querySelector('#attackButton').addEventListener('pointerdown', e => { e.preventDefault(); attack(); });
document.querySelector('#interactButton').addEventListener('pointerdown', e => { e.preventDefault(); interact(); });

function collides(x, z) { return Math.hypot(x, z) > LAND_RADIUS - 1 || obstacles.some(o => Math.hypot(x - o.x, z - o.z) < o.radius + 0.48); }
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate); const dt = Math.min(clock.getDelta(), 0.03); let dx = 0, dz = 0;
  if (keys.w || keys.arrowup) dz -= 1; if (keys.s || keys.arrowdown) dz += 1; if (keys.a || keys.arrowleft) dx -= 1; if (keys.d || keys.arrowright) dx += 1; dx += mobileMove.x; dz += mobileMove.z;
  if (dx || dz) { const len = Math.hypot(dx, dz); dx /= len; dz /= len; const step = 8 * dt, nx = hero.position.x + dx * step, nz = hero.position.z + dz * step; if (!collides(nx, hero.position.z)) hero.position.x = nx; if (!collides(hero.position.x, nz)) hero.position.z = nz; hero.rotation.y = Math.atan2(dx, dz); }
  enemies.forEach(e => { const d = e.position.distanceTo(hero.position); if (d < 9) e.position.addScaledVector(new THREE.Vector3(hero.position.x - e.position.x, 0, hero.position.z - e.position.z).normalize(), dt * 1.2); });
  // Short diagonal cut: raise the sword, sweep down across the body, then return. No full spin.
  const elapsed = performance.now() - attackStart;
  if (elapsed >= 0 && elapsed < 360) {
    const t = elapsed / 360; let swing;
    if (t < 0.22) swing = -0.55 * (t / 0.22);
    else if (t < 0.72) swing = -0.55 + 1.15 * ((t - 0.22) / 0.5);
    else swing = 0.60 * (1 - (t - 0.72) / 0.28);
    rightArm.rotation.z = swing; rightArm.rotation.x = -0.2 - Math.sin(t * Math.PI) * 0.45; sword.rotation.z = -0.08 + Math.sin(t * Math.PI) * 0.18;
  } else {
    rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, 0, 0.22); rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, 0, 0.22); sword.rotation.z = THREE.MathUtils.lerp(sword.rotation.z, 0, 0.22);
  }
  updateHologram();
  camera.position.x += (hero.position.x - camera.position.x) * 0.07; camera.position.z += (hero.position.z + 18 - camera.position.z) * 0.07; camera.position.y += (14 - camera.position.y) * 0.07; camera.lookAt(hero.position.x, 1, hero.position.z);
  renderer.render(scene, camera);
}
function resize() { const w = game.clientWidth || innerWidth, h = game.clientHeight || innerHeight; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); }
addEventListener('resize', resize); if (window.visualViewport) visualViewport.addEventListener('resize', resize); resize(); updateHud(); animate();
