import * as THREE from 'three';

const game=document.querySelector('#game');
const scene=new THREE.Scene();scene.background=new THREE.Color(0x8dc9df);scene.fog=new THREE.Fog(0x8dc9df,38,78);
const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,200);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;game.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffefc2,0x52654a,2));const sun=new THREE.DirectionalLight(0xfff1bd,2.5);sun.position.set(-18,28,10);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);

sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-45,right:45,top:45,bottom:-45,far:90});
sun.shadow.camera.updateProjectionMatrix();

const LAND_RADIUS=38,BUILD_GRID=6,trees=[],rocks=[],buildings=[],obstacles=[];
const ground=new THREE.Mesh(new THREE.CircleGeometry(LAND_RADIUS,64),new THREE.MeshStandardMaterial({color:0x70a84f,roughness:1}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);

// Ordered estate plots: alternating shaded grass squares separated by visible lines.
for(let x=-36;x<36;x+=BUILD_GRID){for(let z=-36;z<36;z+=BUILD_GRID){if(Math.hypot(x+BUILD_GRID/2,z+BUILD_GRID/2)<LAND_RADIUS-1){const tile=new THREE.Mesh(new THREE.PlaneGeometry(BUILD_GRID-.12,BUILD_GRID-.12),new THREE.MeshStandardMaterial({color:(x/BUILD_GRID+z/BUILD_GRID)%2===0?0x78ad50:0x6fa44b,roughness:1}));tile.rotation.x=-Math.PI/2;tile.position.set(x+BUILD_GRID/2,.018,z+BUILD_GRID/2);tile.receiveShadow=true;scene.add(tile);}}}
const estate=new THREE.Mesh(new THREE.BoxGeometry(9,.25,9),new THREE.MeshStandardMaterial({color:0xb4a77a}));estate.position.set(0,.12,-2);estate.receiveShadow=true;scene.add(estate);

function addObstacle(x,z,radius){obstacles.push({x,z,radius});}
function addBox(w,h,d,color,x,y,z,parent=scene,roughness=.85){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness}));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}

const OAK=0x4a3322,PLASTER=0xe9dfc6,STONE=0x80838a,TILE=0x8a4b38,GOLD=0xe2b94a,CRIMSON=0x8e2230;
function gable(w,h,d,color){
  const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(0,h);s.closePath();
  const geo=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false});geo.translate(0,0,-d/2);
  const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,roughness:.9}));m.castShadow=true;return m;
}
function timber(g,w,h,d,y0){
  const t=.14;
  for(const sx of[-1,1])for(const sz of[-1,1])addBox(t,h,t,OAK,sx*w/2,y0+h/2,sz*d/2,g);
  for(const sz of[-1,1])for(const y of[y0+t/2,y0+h/2,y0+h-t/2])addBox(w,t,t,OAK,0,y,sz*d/2,g);
  for(const sx of[-1,1])for(const y of[y0+h/2,y0+h-t/2])addBox(t,t,d,OAK,sx*w/2,y,0,g);
}
function windowAt(g,x,y,z){
  addBox(.9,.85,.12,OAK,x,y,z,g);addBox(.66,.62,.14,0x8bc3d9,x,y,z,g,.2);
  addBox(.05,.66,.16,OAK,x,y,z,g);addBox(.66,.05,.16,OAK,x,y,z,g);
}
function createHouse(x,z){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=Math.floor(Math.random()*4)*Math.PI/2;
  addBox(4.1,.4,3.3,STONE,0,.2,0,g);addBox(3.8,2,3,PLASTER,0,1.4,0,g);timber(g,3.8,2,3,.4);
  const roof=gable(4.9,1.8,3.9,TILE);roof.position.y=2.4;g.add(roof);
  addBox(.55,1.9,.55,STONE,1.2,3.35,-.7,g);addBox(.75,.14,.75,0x5d6068,1.2,4.33,-.7,g);
  addBox(1,1.6,.14,OAK,0,1.2,1.55,g);addBox(1.3,.2,.45,STONE,0,.1,1.9,g);
  windowAt(g,-1.25,1.85,1.52);windowAt(g,1.25,1.85,1.52);
  scene.add(g);addObstacle(x,z,2.85);return g;
}
function createWorkshop(x,z){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=Math.floor(Math.random()*4)*Math.PI/2;
  addBox(4.2,1.5,3.2,STONE,0,.75,0,g);addBox(4.2,.9,3.2,PLASTER,0,1.95,0,g);timber(g,4.2,.9,3.2,1.5);
  const roof=gable(5.2,1.5,4,0x5b4636);roof.position.y=2.4;g.add(roof);
  addBox(.9,3.6,.9,0x6d7076,-1.4,2.2,-.9,g);addBox(1.1,.16,1.1,0x4f5258,-1.4,4.05,-.9,g);
  addBox(1.6,1,.16,0x4f5258,1,.95,1.6,g);
  const fire=new THREE.Mesh(new THREE.BoxGeometry(1.2,.6,.2),new THREE.MeshStandardMaterial({color:0xff8a2a,emissive:0xff5a10,emissiveIntensity:1.6}));
  fire.position.set(1,.95,1.66);g.add(fire);addBox(1.1,1.3,.14,OAK,-.9,.65,1.62,g);
  const stump=new THREE.Mesh(new THREE.CylinderGeometry(.3,.34,.5,10),new THREE.MeshStandardMaterial({color:0x6b4a30}));stump.position.set(1.5,.25,2.5);stump.castShadow=true;g.add(stump);
  addBox(.32,.22,.8,0x2f3338,1.5,.6,2.5,g);
  const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.8,10),new THREE.MeshStandardMaterial({color:0x7a5535}));barrel.position.set(-1.8,.4,2.4);barrel.castShadow=true;g.add(barrel);
  scene.add(g);addObstacle(x,z,3.05);return g;
}
function createTower(x,z){
  const g=new THREE.Group();g.position.set(x,0,z);
  const cyl=(rt,rb,h,y,c)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,12),new THREE.MeshStandardMaterial({color:c,roughness:1}));m.position.y=y;m.castShadow=m.receiveShadow=true;g.add(m);};
  cyl(1.25,1.5,5,2.5,0x8b8f96);cyl(1.6,1.3,.6,5.2,0x6f737a);
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2,m=addBox(.5,.6,.5,0x6f737a,Math.cos(a)*1.45,5.8,Math.sin(a)*1.45,g);m.rotation.y=-a;}
  addBox(.8,1.3,.12,OAK,0,.65,1.48,g);addBox(.2,.9,.12,0x1f2227,0,3.1,1.35,g);
  addBox(.08,1.7,.08,OAK,0,6.5,0,g);addBox(.9,.55,.04,CRIMSON,.5,7.05,0,g);addBox(.9,.1,.05,GOLD,.5,7.05,0,g);
  scene.add(g);addObstacle(x,z,2);return g;
}

const keep=new THREE.Group();keep.position.set(0,0,-2);addBox(5,3,4,0x9b6947,0,1.5,0,keep);addBox(5.2,.35,4.2,0x51413a,0,3.05,0,keep);scene.add(keep);addObstacle(0,-2,3.35);

const keys={};addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.code==='Space')attack();});addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;});
const hero=new THREE.Group(),skin=new THREE.MeshStandardMaterial({color:0xf0c49a,roughness:.8}),tunic=new THREE.MeshStandardMaterial({color:0x2f78a8,roughness:.9}),pants=new THREE.MeshStandardMaterial({color:0x39465b,roughness:.9});
function part(geometry,material,x,y,z,parent=hero){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
part(new THREE.CapsuleGeometry(.48,.75,4,8),tunic,0,1.25,0);part(new THREE.SphereGeometry(.38,16,12),skin,0,2.12,0);part(new THREE.CapsuleGeometry(.13,.58,4,8),tunic,-.57,1.35,0);part(new THREE.CapsuleGeometry(.17,.58,4,8),pants,-.23,.47,0);part(new THREE.CapsuleGeometry(.17,.58,4,8),pants,.23,.47,0);part(new THREE.BoxGeometry(.36,.18,.55),new THREE.MeshStandardMaterial({color:0x493629}),-.23,.12,.08);part(new THREE.BoxGeometry(.36,.18,.55),new THREE.MeshStandardMaterial({color:0x493629}),.23,.12,.08);part(new THREE.SphereGeometry(.4,12,8,0,Math.PI*2,0,Math.PI*.48),new THREE.MeshStandardMaterial({color:0x543b2d}),0,2.34,0);for(const s of[-1,1])part(new THREE.SphereGeometry(.045,8,6),new THREE.MeshStandardMaterial({color:0x24201b}),s*.14,2.17,.34);
const rightArm=new THREE.Group();rightArm.position.set(.5,1.65,0);hero.add(rightArm);part(new THREE.CapsuleGeometry(.14,.62,4,8),tunic,.08,-.34,0,rightArm);part(new THREE.SphereGeometry(.15,10,8),skin,.12,-.72,.08,rightArm);const sword=new THREE.Group();sword.position.set(.12,-.75,.12);rightArm.add(sword);addBox(.13,.32,.13,0x604329,0,0,0,sword,.9);addBox(.42,.08,.14,0xb4b9c0,0,.2,0,sword,.3);addBox(.16,1.18,.065,0xdde4e8,0,.86,0,sword,.3);hero.position.set(0,0,7);scene.add(hero);

const resources={gold:25,wood:12,stone:8};
function makeTree(x,z){const g=new THREE.Group();const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.25,.36,2.5,10),new THREE.MeshStandardMaterial({color:0x765137,roughness:1}));trunk.position.y=1.25;trunk.castShadow=true;g.add(trunk);for(const[y,r,c]of[[2.5,1.5,0x3f7850],[3.3,1.2,0x4b8954],[4.05,.85,0x588f55]]){const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(r,1),new THREE.MeshStandardMaterial({color:c,roughness:1}));crown.position.y=y;crown.castShadow=true;g.add(crown);}g.position.set(x,0,z);scene.add(g);trees.push(g);addObstacle(x,z,.72);}
function makeRock(x,z){const r=new THREE.Mesh(new THREE.DodecahedronGeometry(.9,0),new THREE.MeshStandardMaterial({color:0x7e8792,roughness:.9}));r.position.set(x,.7,z);r.scale.y=.7;r.castShadow=true;scene.add(r);rocks.push(r);addObstacle(x,z,1);}
[[-8,-8],[10,-9],[-12,8],[12,12],[16,-3],[-17,-15]].forEach(p=>makeTree(p[0],p[1]));[[-6,13],[14,7],[7,-14],[-15,2]].forEach(p=>makeRock(p[0],p[1]));
const enemies=[];function makeEnemy(x,z){const e=new THREE.Mesh(new THREE.SphereGeometry(.75,12,8),new THREE.MeshStandardMaterial({color:0x934851,roughness:.7}));e.position.set(x,.75,z);e.castShadow=true;e.userData.hp=3;scene.add(e);enemies.push(e);}makeEnemy(14,16);makeEnemy(-14,15);

function updateHud(){document.querySelector('#gold').textContent=resources.gold;document.querySelector('#wood').textContent=resources.wood;document.querySelector('#stone').textContent=resources.stone;}let messageTimer;function message(t){const b=document.querySelector('#message');b.textContent=t;b.classList.add('show');clearTimeout(messageTimer);messageTimer=setTimeout(()=>b.classList.remove('show'),1600);}function nearest(list,max=2.4){let r=null,d=max;list.forEach(i=>{const q=hero.position.distanceTo(i.position);if(q<d){d=q;r=i;}});return r;}
function removeObstacle(x,z){const i=obstacles.findIndex(o=>Math.hypot(o.x-x,o.z-z)<.1);if(i>=0)obstacles.splice(i,1);}
function randomSpot(){for(let i=0;i<40;i++){const a=Math.random()*Math.PI*2,r=6+Math.random()*(LAND_RADIUS-10),x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.hypot(x-hero.position.x,z-hero.position.z)>4&&!obstacles.some(o=>Math.hypot(o.x-x,o.z-z)<o.radius+2))return[x,z];}return null;}
function respawn(make){setTimeout(()=>{const s=randomSpot();if(s)make(s[0],s[1]);},20000);}
function gather(){const tree=nearest(trees,2.5);if(tree){resources.wood+=3;scene.remove(tree);trees.splice(trees.indexOf(tree),1);removeObstacle(tree.position.x,tree.position.z);respawn(makeTree);updateHud();message('+3 wood');return true;}const rock=nearest(rocks,2.5);if(rock){resources.stone+=3;scene.remove(rock);rocks.splice(rocks.indexOf(rock),1);removeObstacle(rock.position.x,rock.position.z);respawn(makeRock);updateHud();message('+3 stone');return true;}return false;}
let attackTime=0,attackStart=-1000;function attack(){const now=performance.now();if(now-attackTime<500)return;attackTime=now;attackStart=now;const e=nearest(enemies,2.8);if(e){e.userData.hp--;e.position.add(new THREE.Vector3(e.position.x-hero.position.x,0,e.position.z-hero.position.z).normalize().multiplyScalar(.12));if(e.userData.hp<=0){scene.remove(e);enemies.splice(enemies.indexOf(e),1);resources.gold+=8;updateHud();message('+8 gold');}}}

const sizes={house:{cost:[15,5],radius:2.85},tower:{cost:[10,10],radius:2},workshop:{cost:[20,8],radius:3.05}};let selectedBuilding=null,hologram=null;
function snapToPlot(position){let gx=Math.floor(position.x/BUILD_GRID)*BUILD_GRID+BUILD_GRID/2,gz=Math.floor(position.z/BUILD_GRID)*BUILD_GRID+BUILD_GRID/2;return new THREE.Vector3(gx,0,gz);}
function makeHologram(type){if(hologram)scene.remove(hologram);hologram=new THREE.Group();const mat=new THREE.MeshBasicMaterial({color:0x78d6ff,transparent:true,opacity:.38,depthWrite:false,side:THREE.DoubleSide});const size=type==='house'?[3.8,2.4,3]:type==='tower'?[2.5,4.8,2.5]:[4.2,2.2,3.2];const body=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);body.position.y=size[1]/2;hologram.add(body);const edges=new THREE.LineSegments(new THREE.EdgesGeometry(body.geometry),new THREE.LineBasicMaterial({color:0xc5f4ff}));edges.position.copy(body.position);hologram.add(edges);if(type==='house'){const roof=new THREE.Mesh(new THREE.ConeGeometry(3.2,1.8,4),mat);roof.position.y=3.3;roof.rotation.y=Math.PI/4;hologram.add(roof);}scene.add(hologram);}
function getBuildPosition(){const forward=new THREE.Vector3(-Math.sin(hero.rotation.y),0,-Math.cos(hero.rotation.y));return snapToPlot(hero.position.clone().addScaledVector(forward,6));}
function canBuildAt(p,radius){if(Math.hypot(p.x,p.z)>LAND_RADIUS-2)return false;return !obstacles.some(o=>Math.hypot(o.x-p.x,o.z-p.z)<o.radius+radius*.55);}
function updateHologram(){if(!hologram||!selectedBuilding)return;const p=getBuildPosition(),valid=canBuildAt(p,sizes[selectedBuilding].radius);hologram.position.set(p.x,0,p.z);hologram.traverse(o=>{if(o.material&&o.material.color)o.material.color.set(valid?0x78d6ff:0xff4545);});}
function clearHologram(){if(hologram)scene.remove(hologram);hologram=null;selectedBuilding=null;}document.querySelectorAll('[data-building]').forEach(b=>b.addEventListener('click',()=>{selectedBuilding=b.dataset.building;makeHologram(selectedBuilding);updateHologram();message('Blue hologram snaps to the nearest estate plot');}));
function build(){if(!selectedBuilding)return false;const p=getBuildPosition(),s=sizes[selectedBuilding];if(!canBuildAt(p,s.radius)){message('Red: choose another grid plot');return true;}if(resources.wood<s.cost[0]||resources.stone<s.cost[1]){message('Not enough building materials');return true;}resources.wood-=s.cost[0];resources.stone-=s.cost[1];if(selectedBuilding==='house')createHouse(p.x,p.z);if(selectedBuilding==='tower')createTower(p.x,p.z);if(selectedBuilding==='workshop')createWorkshop(p.x,p.z);clearHologram();updateHud();message('Construction complete');return true;}function interact(){if(build())return;if(gather())return;message('Move close to a tree or rock');}addEventListener('keydown',e=>{if(e.key.toLowerCase()==='e')interact();});

const joystick=document.querySelector('#joystick'),knob=document.querySelector('#joystickKnob'),mobileMove={x:0,z:0};let joystickPointer=null;function updateJoystick(e){const rect=joystick.getBoundingClientRect(),dx=e.clientX-(rect.left+rect.width/2),dy=e.clientY-(rect.top+rect.height/2),max=rect.width*.34,len=Math.hypot(dx,dy),scale=len>max?max/len:1,x=dx*scale,y=dy*scale;knob.style.transform=`translate(${x}px,${y}px)`;mobileMove.x=x/max;mobileMove.z=y/max;}joystick.addEventListener('pointerdown',e=>{joystickPointer=e.pointerId;joystick.setPointerCapture(e.pointerId);updateJoystick(e);});joystick.addEventListener('pointermove',e=>{if(e.pointerId===joystickPointer)updateJoystick(e);});function releaseJoystick(e){if(e.pointerId!==joystickPointer)return;joystickPointer=null;mobileMove.x=mobileMove.z=0;knob.style.transform='translate(0,0)';}joystick.addEventListener('pointerup',releaseJoystick);joystick.addEventListener('pointercancel',releaseJoystick);document.querySelector('#attackButton').addEventListener('pointerdown',e=>{e.preventDefault();attack();});document.querySelector('#interactButton').addEventListener('pointerdown',e=>{e.preventDefault();interact();});

function collides(x,z){return Math.hypot(x,z)>LAND_RADIUS-1||obstacles.some(o=>Math.hypot(x-o.x,z-o.z)<o.radius+.48);}const clock=new THREE.Clock();function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.03);let dx=0,dz=0;if(keys.w||keys.arrowup)dz-=1;if(keys.s||keys.arrowdown)dz+=1;if(keys.a||keys.arrowleft)dx-=1;if(keys.d||keys.arrowright)dx+=1;dx+=mobileMove.x;dz+=mobileMove.z;if(dx||dz){const len=Math.hypot(dx,dz);dx/=len;dz/=len;const step=8*dt,nx=hero.position.x+dx*step,nz=hero.position.z+dz*step;if(!collides(nx,hero.position.z))hero.position.x=nx;if(!collides(hero.position.x,nz))hero.position.z=nz;hero.rotation.y=Math.atan2(dx,dz);}enemies.forEach(e=>{const d=e.position.distanceTo(hero.position);if(d<9)e.position.addScaledVector(new THREE.Vector3(hero.position.x-e.position.x,0,hero.position.z-e.position.z).normalize(),dt*1.2);});const elapsed=performance.now()-attackStart;if(elapsed>=0&&elapsed<360){const t=elapsed/360;let swing;if(t<.25)swing=-.9*(t/.25);else if(t<.72)swing=-.9+2.15*((t-.25)/.47);else swing=1.25*(1-(t-.72)/.28);rightArm.rotation.z=swing;rightArm.rotation.x=-.45-Math.sin(t*Math.PI)*.7;sword.rotation.z=-.15+Math.sin(t*Math.PI)*.55;}else{rightArm.rotation.z=THREE.MathUtils.lerp(rightArm.rotation.z,0,.22);rightArm.rotation.x=THREE.MathUtils.lerp(rightArm.rotation.x,0,.22);sword.rotation.z=THREE.MathUtils.lerp(sword.rotation.z,0,.22);}updateHologram();camera.position.x+=(hero.position.x-camera.position.x)*.07;camera.position.z+=(hero.position.z+18-camera.position.z)*.07;camera.position.y+=(14-camera.position.y)*.07;camera.lookAt(hero.position.x,1,hero.position.z);renderer.render(scene,camera);}function resize(){const w=game.clientWidth||innerWidth,h=game.clientHeight||innerHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);}addEventListener('resize',resize);if(window.visualViewport)visualViewport.addEventListener('resize',resize);resize();updateHud();animate();

game.addEventListener('pointerdown',()=>{if(selectedBuilding){clearHologram();message('Build cancelled');}});
addEventListener('keydown',e=>{if(e.key==='Escape'&&selectedBuilding){clearHologram();message('Build cancelled');}});
document.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>b.blur()));
