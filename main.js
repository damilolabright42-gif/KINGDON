import * as THREE from 'three';

const game = document.querySelector('#game');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8dc9df);
scene.fog = new THREE.Fog(0x8dc9df, 38, 78);

const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 200);
camera.position.set(0, 14, 18);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
game.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffefc2, 0x52654a, 2));
const sun = new THREE.DirectionalLight(0xfff1bd, 2.5);
sun.position.set(-18, 28, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
scene.add(sun);

const LAND_RADIUS = 38;
const ground = new THREE.Mesh(new THREE.CircleGeometry(LAND_RADIUS, 48), new THREE.MeshStandardMaterial({ color: 0x70a84f, roughness: 1 }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const estate = new THREE.Mesh(new THREE.BoxGeometry(9, 0.25, 9), new THREE.MeshStandardMaterial({ color: 0xb4a77a }));
estate.position.y = 0.12;
estate.receiveShadow = true;
scene.add(estate);

function addBox(w, h, d, color, x, y, z, parent = scene) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, roughness: 0.85 }));
  mesh.position.set(x, y, z);
  mesh.castShadow = mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function createHouse(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.random() * Math.PI * 2;
  addBox(3.8, 2.4, 3, 0xb08a67, 0, 1.2, 0, g);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.8, 4), new THREE.MeshStandardMaterial({ color: 0x654535, roughness: 0.9 }));
  roof.position.y = 3.3; roof.rotation.y = Math.PI / 4; roof.scale.z = 0.72; roof.castShadow = true; g.add(roof);
  addBox(1.2, 1.7, 0.12, 0x4a3024, 0, 0.85, 1.56, g);
  addBox(0.12, 1.7, 0.12, 0x8e6a42, -0.25, 0.85, 1.63, g);
  addBox(0.75, 0.65, 0.12, 0x8bd0e1, -1.15, 1.55, 1.56, g);
  addBox(0.75, 0.65, 0.12, 0x8bd0e1, 1.15, 1.55, 1.56, g);
  addBox(0.58, 1.9, 0.58, 0x5d4a3d, 1.45, 3.1, -0.7, g);
  scene.add(g); buildings.push(g); return g;
}

function createWorkshop(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.random() * Math.PI * 2;
  addBox(4.2, 2.2, 3.2, 0x9c7139, 0, 1.1, 0, g);
  addBox(4.5, 0.35, 3.5, 0x544239, 0, 2.35, 0, g);
  addBox(1.45, 1.55, 0.12, 0x4a3326, -1.15, 0.78, 1.67, g);
  addBox(1.25, 0.85, 0.12, 0x89bdd1, 1.05, 1.45, 1.67, g);
  addBox(0.55, 2.8, 0.55, 0x454746, 1.35, 3.45, -0.9, g);
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(.65, .11, 8, 16), new THREE.MeshStandardMaterial({ color: 0x9a7448 }));
  wheel.position.set(-1.3, 1.2, 1.68); wheel.rotation.x = Math.PI / 2; wheel.castShadow = true; g.add(wheel);
  scene.add(g); buildings.push(g); return g;
}

function createTower(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  addBox(2.5, 4.8, 2.5, 0x758398, 0, 2.4, 0, g);
  addBox(3.1, 0.35, 3.1, 0x5d6675, 0, 4.95, 0, g);
  for (let px of [-1.25, 0, 1.25]) {
    addBox(0.42, 0.7, 0.42, 0x5d6675, px, 5.45, -1.25, g);
    addBox(0.42, 0.7, 0.42, 0x5d6675, px, 5.45, 1.25, g);
  }
  addBox(0.75, 1.2, 0.12, 0x3e4652, 0, 0.6, 1.31, g);
  addBox(0.5, 0.55, 0.12, 0x1b1d21, -0.7, 3.15, 1.31, g);
  addBox(0.5, 0.55, 0.12, 0x1b1d21, 0.7, 3.15, 1.31, g);
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(.8, 1.5), new THREE.MeshStandardMaterial({ color: 0x8d3d48, side: THREE.DoubleSide }));
  banner.position.set(0, 4.45, 1.58); g.add(banner);
  scene.add(g); buildings.push(g); return g;
}

addBox(5, 3, 4, 0x9b6947, 0, 1.5, -2);
addBox(5.2, 0.35, 4.2, 0x51413a, 0, 3.05, -2);

const keys = {};
addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; if (e.code === 'Space') attack(); });
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

const hero = new THREE.Group();
const body = addBox(1.1, 1.5, 0.8, 0x2f78a8, 0, 1, 7);
scene.remove(body); hero.add(body); body.position.set(0, 1, 0);
const head = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 12), new THREE.MeshStandardMaterial({ color: 0xf0c49a }));
head.position.y = 2.15; head.castShadow = true; hero.add(head);
const sword = addBox(0.12, 1.6, 0.12, 0xcbd3d8, 0.8, 1.1, 0);
scene.remove(sword); sword.rotation.z = -0.18; hero.add(sword);
scene.add(hero);

const resources = { gold: 25, wood: 12, stone: 8 };
const trees = [];
const rocks = [];
const buildings = [];

function makeTree(x, z) { const tree = new THREE.Group(); const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.25, .35, 2, 8), new THREE.MeshStandardMaterial({ color: 0x765137 })); trunk.position.y = 1; trunk.castShadow = true; tree.add(trunk); const crown = new THREE.Mesh(new THREE.ConeGeometry(1.3, 2.8, 8), new THREE.MeshStandardMaterial({ color: 0x3f7850 })); crown.position.y = 3; crown.castShadow = true; tree.add(crown); tree.position.set(x, 0, z); scene.add(tree); trees.push(tree); }
function makeRock(x, z) { const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(.9, 0), new THREE.MeshStandardMaterial({ color: 0x7e8792, roughness: .9 })); rock.position.set(x, .7, z); rock.scale.y=.7; rock.castShadow=true; scene.add(rock); rocks.push(rock); }
[[-8,-8],[10,-9],[-12,8],[12,12],[16,-3],[-17,-15]].forEach(p => makeTree(p[0], p[1]));
[[-6,13],[14,7],[7,-14],[-15,2]].forEach(p => makeRock(p[0], p[1]));

const enemies = [];
function makeEnemy(x, z) { const e = new THREE.Mesh(new THREE.SphereGeometry(.75, 12, 8), new THREE.MeshStandardMaterial({ color: 0x934851, roughness: .7 })); e.position.set(x, .75, z); e.castShadow=true; e.userData.hp=3; scene.add(e); enemies.push(e); }
makeEnemy(14, 16); makeEnemy(-14, 15);

function updateHud() { document.querySelector('#gold').textContent = resources.gold; document.querySelector('#wood').textContent = resources.wood; document.querySelector('#stone').textContent = resources.stone; }
let messageTimer;
function message(text) { const box = document.querySelector('#message'); box.textContent=text; box.classList.add('show'); clearTimeout(messageTimer); messageTimer=setTimeout(() => box.classList.remove('show'), 1600); }
function nearest(list, max=2.4) { let result=null, dist=max; list.forEach(item => { const d=hero.position.distanceTo(item.position); if(d<dist){dist=d;result=item;} }); return result; }

function gather() { const tree=nearest(trees, 2.5); if(tree){ resources.wood += 3; scene.remove(tree); trees.splice(trees.indexOf(tree),1); updateHud(); message('+3 wood'); return true; } const rock=nearest(rocks, 2.5); if(rock){ resources.stone += 3; scene.remove(rock); rocks.splice(rocks.indexOf(rock),1); updateHud(); message('+3 stone'); return true; } return false; }

let attackTime=0;
function attack() { if(performance.now()-attackTime<500) return; attackTime=performance.now(); sword.rotation.z=.7; setTimeout(() => sword.rotation.z=-.18, 180); const enemy=nearest(enemies, 2.8); if(enemy){ enemy.userData.hp--; enemy.position.x += (enemy.position.x-hero.position.x)*.12; if(enemy.userData.hp<=0){ scene.remove(enemy); enemies.splice(enemies.indexOf(enemy),1); resources.gold+=8; updateHud(); message('+8 gold'); } } }

let selectedBuilding=null;
document.querySelectorAll('[data-building]').forEach(button => button.addEventListener('click', () => { selectedBuilding=button.dataset.building; message('Select a spot anywhere on your land, then press E'); }));

function build() {
  if(!selectedBuilding) return false;
  if(hero.position.length()>LAND_RADIUS-3.5){ message('Move farther inside your land to build'); return true; }
  const costs={house:[15,5],tower:[10,10],workshop:[20,8]};
  const [wood,stone]=costs[selectedBuilding];
  if(resources.wood<wood || resources.stone<stone){ message('Not enough building materials'); return true; }
  resources.wood-=wood; resources.stone-=stone;
  if(selectedBuilding==='house') createHouse(hero.position.x, hero.position.z);
  if(selectedBuilding==='tower') createTower(hero.position.x, hero.position.z);
  if(selectedBuilding==='workshop') createWorkshop(hero.position.x, hero.position.z);
  selectedBuilding=null; updateHud(); message('Construction complete'); return true;
}

function interact() { if(build()) return; if(gather()) return; message('Move close to a tree or rock, or select a building'); }
addEventListener('keydown', e => { if(e.key.toLowerCase()==='e') interact(); });

const joystick=document.querySelector('#joystick');
const knob=document.querySelector('#joystickKnob');
const mobileMove={x:0,z:0};
let joystickPointer=null;
function updateJoystick(event) { const rect=joystick.getBoundingClientRect(); const dx=event.clientX-(rect.left+rect.width/2); const dy=event.clientY-(rect.top+rect.height/2); const max=rect.width*.34; const length=Math.hypot(dx,dy); const scale=length>max ? max/length : 1; const x=dx*scale, y=dy*scale; knob.style.transform=`translate(${x}px, ${y}px)`; mobileMove.x=x/max; mobileMove.z=y/max; }
joystick.addEventListener('pointerdown', event => { joystickPointer=event.pointerId; joystick.setPointerCapture(event.pointerId); updateJoystick(event); });
joystick.addEventListener('pointermove', event => { if(event.pointerId===joystickPointer) updateJoystick(event); });
function releaseJoystick(event) { if(event.pointerId!==joystickPointer) return; joystickPointer=null; mobileMove.x=0; mobileMove.z=0; knob.style.transform='translate(0, 0)'; }
joystick.addEventListener('pointerup', releaseJoystick); joystick.addEventListener('pointercancel', releaseJoystick);
document.querySelector('#attackButton').addEventListener('pointerdown', event => { event.preventDefault(); attack(); });
document.querySelector('#interactButton').addEventListener('pointerdown', event => { event.preventDefault(); interact(); });

const clock=new THREE.Clock();
function animate() { requestAnimationFrame(animate); const dt=Math.min(clock.getDelta(),.03); let dx=0,dz=0; if(keys.w||keys.arrowup) dz-=1; if(keys.s||keys.arrowdown) dz+=1; if(keys.a||keys.arrowleft) dx-=1; if(keys.d||keys.arrowright) dx+=1; dx+=mobileMove.x; dz+=mobileMove.z; if(dx||dz){ const length=Math.hypot(dx,dz); dx/=length; dz/=length; hero.position.x+=dx*8*dt; hero.position.z+=dz*8*dt; hero.rotation.y=Math.atan2(dx,dz); } const distance=hero.position.length(); const maxWalkRadius=LAND_RADIUS-1; if(distance>maxWalkRadius) hero.position.multiplyScalar(maxWalkRadius/distance); enemies.forEach(enemy => { const d=hero.position.distanceTo(enemy.position); if(d<9){ enemy.position.addScaledVector(new THREE.Vector3(hero.position.x-enemy.position.x,0,hero.position.z-enemy.position.z).normalize(), dt*1.2); } }); camera.position.x += (hero.position.x - camera.position.x)*.07; camera.position.z += (hero.position.z+18-camera.position.z)*.07; camera.lookAt(hero.position.x,1,hero.position.z); renderer.render(scene,camera); }
animate();

addEventListener('resize', () => { camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); });
updateHud();
