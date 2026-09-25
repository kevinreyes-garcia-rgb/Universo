// ===== Ilustración 3D del universo (Three.js r128) =====
(function(){
"use strict";
var scene=new THREE.Scene();
var camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,0.5,8000);
var renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.15;
document.body.appendChild(renderer.domElement);

function ease(t){return t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}

// ---- textura de punto suave (estrellas brillantes) ----
function dotTexture(){
  var s=64,cv=document.createElement('canvas');cv.width=cv.height=s;
  var ctx=cv.getContext('2d');
  var g=ctx.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(0.35,'rgba(255,255,255,0.85)');g.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=g;ctx.fillRect(0,0,s,s);
  return new THREE.CanvasTexture(cv);
}
var dotTex=dotTexture();

function nebulaTexture(rgba){
  var s=128,cv=document.createElement('canvas');cv.width=cv.height=s;
  var ctx=cv.getContext('2d');
  var g=ctx.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
  g.addColorStop(0,rgba);g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g;ctx.fillRect(0,0,s,s);
  return new THREE.CanvasTexture(cv);
}

// ---- campo de estrellas: disco (brazos galácticos) o esfera (fondo) ----
function starField(count,spread,size,hueBase,hueRange,light,disk){
  var geo=new THREE.BufferGeometry();
  var pos=new Float32Array(count*3),col=new Float32Array(count*3);
  var c=new THREE.Color();
  for(var i=0;i<count;i++){
    var x,y,z;
    if(disk){
      var r=Math.pow(Math.random(),0.55)*spread;
      var arm=(Math.floor(Math.random()*3))*(Math.PI*2/3);
      var ang=Math.random()*0.8+arm+r*0.018;
      x=Math.cos(ang)*r; z=Math.sin(ang)*r; y=(Math.random()-0.5)*spread*0.05;
    } else {
      var rr=spread*Math.cbrt(Math.random());
      var th=Math.random()*Math.PI*2, ph=Math.acos(2*Math.random()-1);
      x=rr*Math.sin(ph)*Math.cos(th); y=rr*Math.sin(ph)*Math.sin(th); z=rr*Math.cos(ph);
    }
    pos[i*3]=x;pos[i*3+1]=y;pos[i*3+2]=z;
    c.setHSL(hueBase+Math.random()*hueRange,0.55,light+Math.random()*0.25);
    col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;
  }
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  geo.setAttribute('color',new THREE.BufferAttribute(col,3));
  var mat=new THREE.PointsMaterial({size:size,map:dotTex,vertexColors:true,transparent:true,opacity:1,blending:THREE.AdditiveBlending,depthWrite:false,sizeAttenuation:true});
  return new THREE.Points(geo,mat);
}
scene.add(starField(10000,820,5.5,0.56,0.32,0.55,true));
scene.add(starField(2600,150,5,0.11,0.06,0.75,false));
scene.add(starField(3500,3200,2.4,0.55,0.4,0.75,false));

// nubes de nebulosa
var nebColors=['rgba(190,90,220,0.5)','rgba(80,130,235,0.45)','rgba(230,110,170,0.4)','rgba(90,205,215,0.35)'];
for(var n=0;n<8;n++){
  var tex=nebulaTexture(nebColors[n%nebColors.length]);
  var sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false}));
  var rad=120+Math.random()*620, ang=Math.random()*Math.PI*2;
  sp.position.set(Math.cos(ang)*rad,(Math.random()-0.5)*60,Math.sin(ang)*rad);
  var sc=140+Math.random()*220; sp.scale.set(sc,sc,1);
  scene.add(sp);
}

// ---- luces ----
scene.add(new THREE.AmbientLight(0x554066,0.35));
var sunLight=new THREE.PointLight(0xfff2cc,3,0,0.15);
scene.add(sunLight);

// ---- generador de texturas de planeta ----
function planetTexture(c1,c2,c3,bands,spots){
  var w=256,h=128,cv=document.createElement('canvas');cv.width=w;cv.height=h;
  var ctx=cv.getContext('2d');
  ctx.fillStyle=c1;ctx.fillRect(0,0,w,h);
  for(var i=0;i<bands;i++){
    ctx.globalAlpha=0.12+Math.random()*0.28;
    ctx.fillStyle=Math.random()>0.5?c2:c3;
    var by=Math.random()*h,bh=3+Math.random()*14;
    ctx.fillRect(0,by,w,bh);
  }
  ctx.globalAlpha=1;
  for(var s=0;s<spots;s++){
    ctx.globalAlpha=0.15+Math.random()*0.3;
    ctx.fillStyle=Math.random()>0.5?c2:c3;
    var r=2+Math.random()*10;
    ctx.beginPath();ctx.arc(Math.random()*w,Math.random()*h,r,0,7);ctx.fill();
  }
  var t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;t.needsUpdate=true;return t;
}
function radialSprite(stops,size){
  var cv=document.createElement('canvas');cv.width=cv.height=size;
  var ctx=cv.getContext('2d');
  var g=ctx.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
  stops.forEach(function(st){g.addColorStop(st[0],st[1]);});
  ctx.fillStyle=g;ctx.fillRect(0,0,size,size);
  return new THREE.CanvasTexture(cv);
}

// ---- sol ----
var sunTex=planetTexture('#ffb347','#ff7a3d','#ffe38a',10,14);
var sun=new THREE.Mesh(new THREE.SphereGeometry(9,48,48),new THREE.MeshBasicMaterial({map:sunTex}));
scene.add(sun);
var coronaTex=radialSprite([[0,'rgba(255,244,214,0.95)'],[0.25,'rgba(255,178,90,0.55)'],[1,'rgba(255,140,60,0)']],256);
var corona=new THREE.Sprite(new THREE.SpriteMaterial({map:coronaTex,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false}));
corona.scale.set(50,50,1); sun.add(corona);
sun.userData={name:'El Sol',msg:'Tú eres el sol que ilumina todo mi universo ☀️❤️'};

// ---- planetas ----
var planetDefs=[
 {name:'Mercurio',dist:20,size:1.6,c1:'#9c9c9c',c2:'#5c5c5c',c3:'#cfcfcf',rough:0.95,tilt:0.1,msg:'Rápido como late mi corazón cuando pienso en ti 💛'},
 {name:'Venus',dist:27,size:2.4,c1:'#e8c27a',c2:'#c98a3d',c3:'#f3d9a0',rough:0.55,tilt:3,atm:'#f2cf90',msg:'Eres la estrella más brillante de mis noches ✨'},
 {name:'Tierra',dist:35,size:2.6,c1:'#2b6fd1',c2:'#2ecc71',c3:'#e8e4d8',rough:0.65,tilt:0.41,atm:'#6fb7ff',msg:'Contigo hasta este planeta se siente pequeño 🌍💙'},
 {name:'Marte',dist:43,size:2.0,c1:'#c1440e',c2:'#e07a5f',c3:'#8a3110',rough:0.9,tilt:0.44,msg:'Mi pasión por ti es tan intensa como el rojo de Marte ❤️'},
 {name:'Júpiter',dist:58,size:6.2,c1:'#d9a066',c2:'#b5651d',c3:'#f0dcb8',rough:0.45,tilt:0.05,atm:'#e2bd8a',msg:'Mi amor por ti es tan grande como Júpiter 🪐'},
 {name:'Saturno',dist:76,size:5.3,c1:'#e3c78f',c2:'#c9a86a',c3:'#f5e6c2',rough:0.45,tilt:0.47,ring:true,atm:'#e8d5a3',msg:'Tus anillos de luz rodean cada uno de mis días 💫'},
 {name:'Urano',dist:92,size:3.6,c1:'#8fd6e0',c2:'#5aa9b5',c3:'#c9eef2',rough:0.5,tilt:1.7,atm:'#a5e3ea',msg:'Contigo descubro un mundo nuevo cada día 💙'},
 {name:'Neptuno',dist:106,size:3.5,c1:'#3455d1',c2:'#6a7fe0',c3:'#8fa2f0',rough:0.5,tilt:0.49,atm:'#5b7fe0',msg:'En lo más profundo de mi corazón siempre estás tú 🌊'}
];
var planets=[],clickable=[sun];
planetDefs.forEach(function(p){
  var tex=planetTexture(p.c1,p.c2,p.c3,9,10);
  var mesh=new THREE.Mesh(new THREE.SphereGeometry(p.size,48,48),new THREE.MeshStandardMaterial({map:tex,roughness:p.rough,metalness:0.08}));
  mesh.rotation.z=p.tilt;
  var pivot=new THREE.Object3D();
  pivot.rotation.y=Math.random()*Math.PI*2;
  mesh.position.x=p.dist;
  pivot.add(mesh);
  scene.add(pivot);
  if(p.atm){
    var atmMat=new THREE.MeshBasicMaterial({color:p.atm,transparent:true,opacity:0.22,side:THREE.BackSide,blending:THREE.AdditiveBlending});
    mesh.add(new THREE.Mesh(new THREE.SphereGeometry(p.size*1.14,32,32),atmMat));
  }
  if(p.ring){
    var rgeo=new THREE.RingGeometry(p.size*1.5,p.size*2.5,64);
    var rtex=planetTexture('#d8c9a3','#b09a70','#efe3c4',6,4);
    var ring=new THREE.Mesh(rgeo,new THREE.MeshBasicMaterial({map:rtex,side:THREE.DoubleSide,transparent:true,opacity:0.88}));
    ring.rotation.x=Math.PI/2.3;
    mesh.add(ring);
  }
  mesh.userData={name:p.name,msg:p.msg,speed:0.15/(p.dist*0.05+1),pivot:pivot};
  planets.push(mesh);
  clickable.push(mesh);
});

// ---- cámara esférica compartida (intro + arrastre manual) ----
var homePos=new THREE.Vector3(0,55,170);
var homeRadius=homePos.length(), homeTheta=Math.atan2(homePos.x,homePos.z), homePhi=Math.acos(homePos.y/homeRadius);
var spherical={radius:1600,theta:homeTheta+Math.PI*2*2.4,phi:1.2};
var focusPoint=new THREE.Vector3(0,0,0);
function applySpherical(){
  camera.position.x=spherical.radius*Math.sin(spherical.phi)*Math.sin(spherical.theta);
  camera.position.y=spherical.radius*Math.cos(spherical.phi);
  camera.position.z=spherical.radius*Math.sin(spherical.phi)*Math.cos(spherical.theta);
  camera.lookAt(focusPoint);
}
applySpherical();

var t0=performance.now(),introDur=10000,introDone=false;
var titleEl=document.getElementById('title'),hint=document.getElementById('hint');
setTimeout(function(){titleEl.style.opacity='0.8';},400);
setTimeout(function(){titleEl.textContent='Acercándonos a casa…';},introDur*0.62);
setTimeout(function(){document.getElementById('loading').style.opacity='0';setTimeout(function(){document.getElementById('loading').style.display='none';},1000);},700);
var srStart={radius:spherical.radius,theta:spherical.theta,phi:spherical.phi};

// ---- controles de arrastre ----
var dragging=false,lastX=0,lastY=0,moved=0,userControl=false;
renderer.domElement.addEventListener('pointerdown',function(e){dragging=true;lastX=e.clientX;lastY=e.clientY;moved=0;});
window.addEventListener('pointermove',function(e){
  if(!dragging)return;
  var dx=e.clientX-lastX,dy=e.clientY-lastY;moved+=Math.abs(dx)+Math.abs(dy);
  if(introDone&&!zooming){userControl=true;spherical.theta-=dx*0.005;spherical.phi=Math.min(2.7,Math.max(0.3,spherical.phi-dy*0.005));}
  lastX=e.clientX;lastY=e.clientY;
});
window.addEventListener('pointerup',function(e){if(dragging&&moved<6){onPick(e.clientX,e.clientY);}dragging=false;});

// ---- selección y zoom a planeta ----
var raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2();
var zooming=false,zFrom=new THREE.Vector3(),zTo=new THREE.Vector3(),zTime=0,zDur=1500,focused=null,zBackHome=false,zTargetFocus=new THREE.Vector3();
var panel=document.getElementById('panel'),pName=document.getElementById('pName'),pMsg=document.getElementById('pMsg');
function worldPos(o){var v=new THREE.Vector3();o.getWorldPosition(v);return v;}
function onPick(cx,cy){
  if(!introDone||focused)return;
  mouse.x=(cx/innerWidth)*2-1;mouse.y=-(cy/innerHeight)*2+1;
  raycaster.setFromCamera(mouse,camera);
  var hits=raycaster.intersectObjects(clickable,false);
  if(hits.length)focusOn(hits[0].object);
}
function focusOn(obj){
  focused=obj;
  var wp=worldPos(obj),r=obj.geometry.parameters.radius||9;
  var dir=camera.position.clone().sub(wp).normalize();
  zTo.copy(wp).add(dir.multiplyScalar(r*4.5+6));
  zFrom.copy(camera.position);zTargetFocus.copy(wp);
  zooming=true;zTime=0;
  setTimeout(function(){pName.textContent=obj.userData.name;pMsg.textContent=obj.userData.msg;panel.classList.add('show');hint.style.opacity='0';},zDur*0.75);
}
document.getElementById('back').addEventListener('click',function(){
  panel.classList.remove('show');focused=null;
  zFrom.copy(camera.position);zTo.copy(homePos);zTargetFocus.set(0,0,0);
  zooming=true;zTime=0;zBackHome=true;
  setTimeout(function(){hint.style.opacity='0.8';},zDur);
});

window.addEventListener('resize',function(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});

function animate(now){
  requestAnimationFrame(animate);
  planets.forEach(function(m){m.userData.pivot.rotation.y+=m.userData.speed*0.01;m.rotation.y+=0.006;});
  sun.rotation.y+=0.0006;

  if(!introDone){
    var el=Math.min(1,(now-t0)/introDur);
    var e=ease(el);
    spherical.theta=srStart.theta+(homeTheta-srStart.theta)*e;
    spherical.phi=srStart.phi+(homePhi-srStart.phi)*e;
    spherical.radius=srStart.radius+(homeRadius-srStart.radius)*e;
    applySpherical();
    if(el>=1){introDone=true;hint.style.opacity='0.8';titleEl.style.opacity='0';}
  } else if(zooming){
    zTime+=16;var e2=Math.min(1,zTime/zDur);var e3=ease(e2);
    camera.position.lerpVectors(zFrom,zTo,e3);
    focusPoint.lerp(zTargetFocus,0.18);
    camera.lookAt(focused?worldPos(focused):zTargetFocus);
    if(e2>=1){
      zooming=false;
      if(zBackHome){spherical.radius=homeRadius;spherical.theta=Math.atan2(camera.position.x,camera.position.z);spherical.phi=Math.acos(camera.position.y/spherical.radius);zBackHome=false;}
    }
  } else if(!focused){
    if(!userControl)spherical.theta+=0.0006;
    applySpherical();
  }
  renderer.render(scene,camera);
}
requestAnimationFrame(animate);
})();
