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
const LAND_RADIUS = 38;
const ground = new THREE.Mesh(new THREE.CircleGeometry(LAND_RADIUS, 48), new THREE.MeshStandardMaterial({ color: 0x70a84f, roughness: 1 }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
const estate = new THREE.Mesh(new THREE.BoxGeometry(9, .25, 9), new THREE.MeshStandardMaterial({ color: 0xb4a77a }));
estate.position.y = .12; estate.receiveShadow = true; scene.add(estate);

const trees = [], rocks = [], buildings = [], obstacles = [];
function addObstacle(x, z, radius) { obstacles.push({ x, z, radius }); }
function addBox(w, h, d, color, x, y, z, parent = scene, roughness = .85) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, roughness }));
  mesh.position.set(x, y, z); mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function addWoodTrim(g, x, z, width) {
  for (const side of [-1, 1]) addBox(.13, 2.35, .15, 0x67472e, x + side * width / 2, 1.18, z, g);
  addBox(width + .15, .16, .15, 0x67472e, x, 2.25, z, g);
}
function createHouse(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.random() * Math.PI * 2;
  addBox(3.8, 2.4, 3, 0xb08a67, 0, 1.2, 0, g);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.8, 4), new THREE.MeshStandardMaterial({ color: 0x654535, roughness: .9 }));
  roof.position.y = 3.3; roof.rotation.y = Math.PI / 4; roof.scale.z = .72; roof.castShadow = true; g.add(roof);
  addBox(1.05, 1.75, .14, 0x493024, 0, .88, 1.56, g); // door
  addBox(.08, 1.72, .12, 0x9a774f, -.48, .88, 1.65, g);
  addBox(.75, .65, .14, 0x8bd0e1, -1.15, 1.55, 1.56, g); addWoodTrim(g, -1.15, 1.64, .82);
  addBox(.75, .65, .14, 0x8bd0e1, 1.15, 1.55, 1.56, g); addWoodTrim(g, 1.15, 1.64, .82);
  addBox(.58, 1.9, .58, 0x5d4a3d, 1.45, 3.1, -.7, g);
  addBox(4, .12, .12, 0x76563a, 0, .18, 1.53, g);
  scene.add(g); buildings.push(g); addObstacle(x, z, 2.85); return g;
}
function createWorkshop(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.random() * Math.PI * 2;
  addBox(4.2, 2.2, 3.2, 0x9c7139, 0, 1.1, 0, g);
  addBox(4.5, .35, 3.5, 0x544239, 0, 2.35, 0, g);
  addBox(1.4, 1.55, .14, 0x4a3326, -1.15, .78, 1.67, g);
  addBox(1.25, .85, .14, 0x89bdd1, 1.05, 1.45, 1.67, g); addWoodTrim(g, 1.05, 1.75, 1.35);
  addBox(.55, 2.8, .55, 0x454746, 1.35, 3.45, -.9, g);
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(.65, .11, 8, 16), new THREE.MeshStandardMaterial({ color: 0x9a7448 }));
  wheel.position.set(-1.3, 1.2, 1.68); wheel.rotation.x = Math.PI / 2; wheel.castShadow = true; g.add(wheel);
  for (let i=0;i<5;i++) addBox(.15, .28, .15, 0xcaa46b, -1.35 + i*.27, .3, -1.68, g);
  scene.add(g); buildings.push(g); addObstacle(x, z, 3.05); return g;
}
function createTower(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  addBox(2.5, 4.8, 2.5, 0x758398, 0, 2.4, 0, g);
  for (let y=.55;y<4.6;y+=.85) addBox(2.58,.11,2.58,0x596777,0,y,0,g);
  addBox(3.1,.35,3.1,0x5d6675,0,4.95,0,g);
  for (const px of [-1.25,0,1.25]) for (const pz of [-1.25,1.25]) addBox(.42,.7,.42,0x5d6675,px,5.45,pz,g);
  addBox(.75,1.2,.12,0x3e4652,0,.6,1.31,g);
  addBox(.5,.55,.12,0x1b1d21,-.7,3.15,1.31,g); addBox(.5,.55,.12,0x1b1d21,.7,3.15,1.31,g);
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(.8,1.5), new THREE.MeshStandardMaterial({ color:0x8d3d48, side:THREE.DoubleSide }));
  banner.position.set(0,4.45,1.58); banner.castShadow=true; g.add(banner);
  scene.add(g); buildings.push(g); addObstacle(x,z,2); return g;
}
// Existing central building
const keep = new THREE.Group(); keep.position.set(0,0,-2);
addBox(5,3,4,0x9b6947,0,1.5,0,keep);
addBox(5.2,.35,4.2,0x51413a,0,3.05,0,keep);
for (const x of [-1.8,1.8]) addBox(.18,3.1,.18,0x654532,x,1.55,2.02,keep);
scene.add(keep); addObstacle(0,-2,3.35);

const keys = {};
addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; if (e.code === 'Space') attack(); });
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

// A more human-shaped, stylized character with tunic, belt, limbs, boots and face.
const hero = new THREE.Group();
const skin = new THREE.MeshStandardMaterial({ color:0xf0c49a, roughness:.8 });
const tunic = new THREE.MeshStandardMaterial({ color:0x2f78a8, roughness:.9 });
const pants = new THREE.MeshStandardMaterial({ color:0x39465b, roughness:.9 });
function bodyPart(geometry, material, x,y,z) { const m=new THREE.Mesh(geometry,material); m.position.set(x,y,z); m.castShadow=true; hero.add(m); return m; }
bodyPart(new THREE.CapsuleGeometry(.48,.75,4,8),tunic,0,1.25,0);
bodyPart(new THREE.SphereGeometry(.38,16,12),skin,0,2.12,0);
bodyPart(new THREE.CylinderGeometry(.13,.14,.12,12),new THREE.MeshStandardMaterial({color:0x604329}),0,.93,0);
for (const s of [-1,1]) {
  const arm=bodyPart(new THREE.CapsuleGeometry(.13,.58,4,8),tunic,s*.57,1.35,0); arm.rotation.z=-s*.12;
  const hand=bodyPart(new THREE.SphereGeometry(.15,10,8),skin,s*.62,.98,.04);
  const leg=bodyPart(new THREE.CapsuleGeometry(.17,.58,4,8),pants,s*.23,.47,0); leg.rotation.z=-s*.04;
  bodyPart(new THREE.BoxGeometry(.36,.18,.55),new THREE.MeshStandardMaterial({color:0x493629}),s*.23,.12,.08);
  const eye=bodyPart(new THREE.SphereGeometry(.045,8,6),new THREE.MeshStandardMaterial({color:0x24201b}),s*.14,2.17,.34);
}
const hair=bodyPart(new THREE.SphereGeometry(.4,12,8,0,Math.PI*2,0,Math.PI*.48),new THREE.MeshStandardMaterial({color:0x543b2d}),0,2.34,0);
const sword=new THREE.Mesh(new THREE.BoxGeometry(.12,1.25,.12),new THREE.MeshStandardMaterial({color:0xcbd3d8,metalness:.65,roughness:.3}));
sword.position.set(.82,1.12,0); sword.rotation.z=-.18; sword.castShadow=true; hero.add(sword);
hero.position.set(0,0,7); scene.add(hero);

const resources={gold:25,wood:12,stone:8};
function makeTree(x,z) {
  const tree=new THREE.Group();
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.25,.36,2.5,10),new THREE.MeshStandardMaterial({color:0x765137,roughness:1})); trunk.position.y=1.25; trunk.castShadow=true; tree.add(trunk);
  for (const [y,r,c] of [[2.5,1.5,0x3f7850],[3.3,1.2,0x4b8954],[4.05,.85,0x588f55]]) { const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(r,1),new THREE.MeshStandardMaterial({color:c,roughness:1})); crown.position.set((Math.random()-.5)*.25,y,0); crown.castShadow=true; tree.add(crown); }
  tree.position.set(x,0,z); scene.add(tree); trees.push(tree); addObstacle(x,z,.72);
}
function makeRock(x,z) { const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.9,0),new THREE.MeshStandardMaterial({color:0x7e8792,roughness:.9})); rock.position.set(x,.7,z); rock.scale.y=.7; rock.castShadow=true; scene.add(rock); rocks.push(rock); }
[[-8,-8],[10,-9],[-12,8],[12,12],[16,-3],[-17,-15]].forEach(p=>makeTree(...p));
[[-6,13],[14,7],[7,-14],[-15,2]].forEach(p=>makeRock(...p));
const enemies=[];
function makeEnemy(x,z) { const e=new THREE.Mesh(new THREE.SphereGeometry(.75,12,8),new THREE.MeshStandardMaterial({color:0x934851,roughness:.7})); e.position.set(x,.75,z); e.castShadow=true; e.userData.hp=3; scene.add(e); enemies.push(e); }
makeEnemy(14,16); makeEnemy(-14,15);

function updateHud(){ document.querySelector('#gold').textContent=resources.gold; document.querySelector('#wood').textContent=resources.wood; document.querySelector('#stone').textContent=resources.stone; }
let messageTimer;
function message(text){const box=document.querySelector('#message');box.textContent=text;box.classList.add('show');clearTimeout(messageTimer);messageTimer=setTimeout(()=>box.classList.remove('show'),1600);}
function nearest(list,max=2.4){let result=null,dist=max;list.forEach(item=>{const d=hero.position.distanceTo(item.position);if(d<dist){dist=d;result=item;}});return result;}
function removeObstacleAt(x,z){const i=obstacles.findIndex(o=>Math.hypot(o.x-x,o.z-z)<.1);if(i>=0)obstacles.splice(i,1);}
function gather(){const tree=nearest(trees,2.5);if(tree){resources.wood+=3;scene.remove(tree);trees.splice(trees.indexOf(tree),1);removeObstacleAt(tree.position.x,tree.position.z);updateHud();message('+3 wood');return true;}const rock=nearest(rocks,2.5);if(rock){resources.stone+=3;scene.remove(rock);rocks.splice(rocks.indexOf(rock),1);updateHud();message('+3 stone');return true;}return false;}
let attackTime=0;
function attack(){if(performance.now()-attackTime<500)return;attackTime=performance.now();sword.rotation.z=.7;setTimeout(()=>sword.rotation.z=-.18,180);const enemy=nearest(enemies,2.8);if(enemy){enemy.userData.hp--;enemy.position.x+=(enemy.position.x-hero.position.x)*.12;if(enemy.userData.hp<=0){scene.remove(enemy);enemies.splice(enemies.indexOf(enemy),1);resources.gold+=8;updateHud();message('+8 gold');}}}
let selectedBuilding=null;
document.querySelectorAll('[data-building]').forEach(button=>button.addEventListener('click',()=>{selectedBuilding=button.dataset.building;message('Move to a clear spot, then press E');}));
function canBuild(x,z,radius){return Math.hypot(x,z)<LAND_RADIUS-3.5&&!obstacles.some(o=>Math.hypot(o.x-x,o.z-z)<o.radius+radius)&&Math.hypot(hero.position.x-x,hero.position.z-z)>radius+1.2;}
function build(){if(!selectedBuilding)return false;const dims={house:[15,5,2.85],tower:[10,10,2],workshop:[20,8,3.05]}[selectedBuilding];if(!canBuild(hero.position.x,hero.position.z,dims[2])){message('Move to a clear building spot');return true;}if(resources.wood<dims[0]||resources.stone<dims[1]){message('Not enough building materials');return true;}resources.wood-=dims[0];resources.stone-=dims[1];if(selectedBuilding==='house')createHouse(hero.position.x,hero.position.z);if(selectedBuilding==='tower')createTower(hero.position.x,hero.position.z);if(selectedBuilding==='workshop')createWorkshop(hero.position.x,hero.position.z);selectedBuilding=null;updateHud();message('Construction complete');return true;}
function interact(){if(build())return;if(gather())return;message('Move close to a tree or rock');}
addEventListener('keydown',e=>{if(e.key.toLowerCase()==='e')interact();});
const joystick=document.querySelector('#joystick'),knob=document.querySelector('#joystickKnob'),mobileMove={x:0,z:0};let joystickPointer=null;
function updateJoystick(event){const rect=joystick.getBoundingClientRect(),dx=event.clientX-(rect.left+rect.width/2),dy=event.clientY-(rect.top+rect.height/2),max=rect.width*.34,len=Math.hypot(dx,dy),scale=len>max?max/len:1,x=dx*scale,y=dy*scale;knob.style.transform=`translate(${x}px, ${y}px)`;mobileMove.x=x/max;mobileMove.z=y/max;}
joystick.addEventListener('pointerdown',e=>{joystickPointer=e.pointerId;joystick.setPointerCapture(e.pointerId);updateJoystick(e);});
joystick.addEventListener('pointermove',e=>{if(e.pointerId===joystickPointer)updateJoystick(e);});
function releaseJoystick(e){if(e.pointerId!==joystickPointer)return;joystickPointer=null;mobileMove.x=mobileMove.z=0;knob.style.transform='translate(0, 0)';}
joystick.addEventListener('pointerup',releaseJoystick);joystick.addEventListener('pointercancel',releaseJoystick);
document.querySelector('#attackButton').addEventListener('pointerdown',e=>{e.preventDefault();attack();});document.querySelector('#interactButton').addEventListener('pointerdown',e=>{e.preventDefault();interact();});
function collides(x,z){if(Math.hypot(x,z)>LAND_RADIUS-1)return true;return obstacles.some(o=>Math.hypot(x-o.x,z-o.z)<o.radius+.48);}
const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.03);let dx=0,dz=0;if(keys.w||keys.arrowup)dz-=1;if(keys.s||keys.arrowdown)dz+=1;if(keys.a||keys.arrowleft)dx-=1;if(keys.d||keys.arrowright)dx+=1;dx+=mobileMove.x;dz+=mobileMove.z;if(dx||dz){const len=Math.hypot(dx,dz);dx/=len;dz/=len;const step=8*dt;const nx=hero.position.x+dx*step,nz=hero.position.z+dz*step;if(!collides(nx,hero.position.z))hero.position.x=nx;if(!collides(hero.position.x,nz))hero.position.z=nz;hero.rotation.y=Math.atan2(dx,dz);}enemies.forEach(e=>{const d=e.position.distanceTo(hero.position);if(d<9)e.position.addScaledVector(new THREE.Vector3(hero.position.x-e.position.x,0,hero.position.z-e.position.z).normalize(),dt*1.2);});camera.position.x+=(hero.position.x-camera.position.x)*.07;camera.position.z+=(hero.position.z+18-camera.position.z)*.07;camera.position.y+=(14-camera.position.y)*.07;camera.lookAt(hero.position.x,1,hero.position.z);renderer.render(scene,camera);}
function resize(){const w=game.clientWidth||innerWidth,h=game.clientHeight||innerHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);}
addEventListener('resize',resize);if(window.visualViewport)visualViewport.addEventListener('resize',resize);resize();updateHud();animate();
