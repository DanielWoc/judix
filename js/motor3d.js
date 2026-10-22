/* JUDIX · Motor 3D (Three.js r128): sala, personajes procedimentales, animación y cámaras. */
/* Script clásico: comparte el ámbito global con los demás archivos de js/. Orden de carga en index.html: caso-001 → motor3d → audio → juego. */
const $ = id => document.getElementById(id);
let GL = false, renderer, scene, camera, clock, t3 = 0;
const H = {}; const V = (x,y,z) => new THREE.Vector3(x,y,z);
const mats = {};
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
let camShot = "general", camPos, camLook, viewOff = 0, viewOffT = 0, parX = 0, parY = 0;
let folder, gavel, flag, holo, speaker = null, iaActiva = false, construida = false;

function mat(c, rough=.75, metal=0, extra={}){ const k = c+"|"+rough+"|"+metal+JSON.stringify(extra); if(!mats[k]){ const e = Object.assign({}, extra); if (e.emissive != null) e.emissive = new THREE.Color(e.emissive).convertSRGBToLinear(); mats[k] = new THREE.MeshStandardMaterial(Object.assign({color:new THREE.Color(c).convertSRGBToLinear(), roughness:rough, metalness:metal}, e)); } return mats[k]; }
function sombras(m){ m.castShadow = true; m.receiveShadow = true; return m; }
function box(w,h,d,m,x,y,z,p=scene){ const o = sombras(new THREE.Mesh(new THREE.BoxGeometry(w,h,d), m)); o.position.set(x,y,z); p.add(o); return o; }
function cyl(rt,rb,h,m,x,y,z,p=scene,s=14){ const o = sombras(new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,s), m)); o.position.set(x,y,z); p.add(o); return o; }
function sph(r,m,x,y,z,p=scene,ws=16,hs=12){ const o = sombras(new THREE.Mesh(new THREE.SphereGeometry(r,ws,hs), m)); o.position.set(x,y,z); p.add(o); return o; }
function tex(w,h,draw,rep){ const c = document.createElement("canvas"); c.width=w; c.height=h; draw(c.getContext("2d"),w,h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; if(rep){ t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0],rep[1]); } return t; }
function rnd(a,b){ return a + Math.random()*(b-a); }

function texturas(){
  const T = {};
  T.piso = tex(512,512,(g,w,h)=>{ g.fillStyle="#3b2416"; g.fillRect(0,0,w,h); const fil=8, ah=h/fil;
    for(let r=0;r<fil;r++){ let x = -rnd(0,200); while(x<w){ const L=rnd(160,300); g.fillStyle=`hsl(${rnd(20,28)},${rnd(38,48)}%,${rnd(15,23)}%)`; g.fillRect(x,r*ah,L,ah-2);
      g.strokeStyle="rgba(0,0,0,.35)"; g.lineWidth=2; g.strokeRect(x,r*ah,L,ah-2);
      for(let k=0;k<6;k++){ g.strokeStyle=`rgba(255,220,180,${rnd(.02,.06)})`; g.beginPath(); const yy=r*ah+rnd(4,ah-6); g.moveTo(x,yy); g.bezierCurveTo(x+L/3,yy+rnd(-3,3),x+2*L/3,yy+rnd(-3,3),x+L,yy); g.stroke(); }
      x+=L; } } },[5,5]);
  T.marmol = tex(512,512,(g,w,h)=>{ g.fillStyle="#141a24"; g.fillRect(0,0,w,h);
    for(let i=0;i<26;i++){ g.strokeStyle=`rgba(${rnd(150,220)},${rnd(140,190)},${rnd(110,150)},${rnd(.03,.09)})`; g.lineWidth=rnd(.5,1.6); g.beginPath(); let x=rnd(0,w), y=rnd(0,h); g.moveTo(x,y); for(let k=0;k<5;k++){ x+=rnd(-120,120); y+=rnd(-120,120); g.lineTo(x,y);} g.stroke(); } },[3,1.5]);
  T.panel = tex(512,512,(g,w,h)=>{ g.fillStyle="#24160d"; g.fillRect(0,0,w,h); g.strokeStyle="rgba(216,180,108,.22)"; g.lineWidth=3;
    for(let i=0;i<2;i++) for(let j=0;j<2;j++){ g.strokeRect(i*w/2+22,j*h/2+22,w/2-44,h/2-44); }
    for(let k=0;k<40;k++){ g.strokeStyle=`rgba(0,0,0,${rnd(.05,.15)})`; g.beginPath(); const x=rnd(0,w); g.moveTo(x,0); g.lineTo(x+rnd(-8,8),h); g.stroke(); } },[4,1]);
  T.bandera = tex(300,180,(g,w,h)=>{ const c=["#002B7F","#FFFFFF","#CE1126","#CE1126","#FFFFFF","#002B7F"]; c.forEach((col,i)=>{ g.fillStyle=col; g.fillRect(0,i*h/6,w,h/6+1); });
    g.fillStyle="#FFFFFF"; g.beginPath(); g.ellipse(w*0.3,h/2,16,19,0,0,PI*2); g.fill(); g.fillStyle="#2a6a3a"; g.beginPath(); g.ellipse(w*0.3,h/2+2,10,12,0,0,PI*2); g.fill(); });
  T.placa = tex(512,116,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,"#16130e"); gr.addColorStop(1,"#0a0907"); g.fillStyle=gr; g.fillRect(0,0,w,h);
    g.strokeStyle="#c9a35a"; g.lineWidth=4; g.strokeRect(6,6,w-12,h-12); g.fillStyle="#e9cd8e"; g.textAlign="center"; g.font="700 46px Cinzel, Georgia, serif"; g.fillText("JUEZ WOC",w/2,64);
    g.fillStyle="#c9a35a"; g.fillRect(w/2-90,76,180,2); g.font="500 20px Cinzel, Georgia, serif"; g.fillText("JUDIX",w/2,102); });
  T.holo = tex(512,320,(g,w,h)=>{ g.clearRect(0,0,w,h); g.strokeStyle="rgba(120,180,255,.95)"; g.lineWidth=3; g.strokeRect(8,8,w-16,h-16);
    g.fillStyle="rgba(76,155,255,.10)"; g.fillRect(8,8,w-16,h-16); g.fillStyle="#cfe2ff"; g.font="600 30px 'JetBrains Mono', monospace"; g.fillText("IA JURÍDICA",30,52);
    g.font="400 19px 'JetBrains Mono', monospace"; ["▸ EXPEDIENTE 26-001107","▸ ANÁLISIS DE PRUEBA","▸ JURISPRUDENCIA","▸ ARGUMENTOS","▸ PROYECTO DE RESOLUCIÓN"].forEach((s,i)=>g.fillText(s,30,98+i*38));
    g.strokeStyle="rgba(160,205,255,.9)"; g.lineWidth=2.5; const cx=w-100, cy=150; g.beginPath(); g.arc(cx,cy,62,0,PI*2); g.stroke();
    g.beginPath(); g.moveTo(cx,cy-40); g.lineTo(cx,cy+38); g.moveTo(cx-38,cy-22); g.lineTo(cx+38,cy-22); g.moveTo(cx-24,cy+38); g.lineTo(cx+24,cy+38); g.stroke();
    g.beginPath(); g.moveTo(cx-38,cy-22); g.lineTo(cx-50,cy+4); g.lineTo(cx-26,cy+4); g.closePath(); g.moveTo(cx+38,cy-22); g.lineTo(cx+26,cy+4); g.lineTo(cx+50,cy+4); g.closePath(); g.stroke(); });
  T.pantalla = tex(256,160,(g,w,h)=>{ g.fillStyle="#0b2550"; g.fillRect(0,0,w,h); g.fillStyle="#7fb2ff"; for(let i=0;i<7;i++) g.fillRect(16,18+i*19,rnd(80,210),6); });
  return T;
}

function humano(o){
  const root = new THREE.Group(); scene.add(root);
  const mSkin = mat(o.skin,.5,0,{emissive:o.skin, emissiveIntensity:.07}), mSuit = mat(o.suit,.66), mSuitD = mat(o.suit,.55,0,{emissive:0x000000}),
    mTorso = mat(o.suit,.66,0,{side:THREE.DoubleSide}), mPants = mat(o.pants||o.suit,.72), mShoe = mat(o.shoe||0x0b0b0d,.28,.2),
    mHair = mat(o.hair,.62), mShirt = mat(o.shirt||0xf2f2f0,.6), mLip = mat(o.lip||(o.female?0xa8545e:0x9a6158),.42),
    mWhite = mat(0xf3efe7,.25), mIris = mat(o.eye||0x3a2414,.25), mPupil = mat(0x050505,.15), mMouth = mat(0x3a1416,.6), mDark = mat(0x111111,.4);
  const hips = new THREE.Group(); hips.position.y = .975; root.add(hips);
  cyl(.165,.155,.2,mPants,0,0,0,hips,18).scale.z = .7;
  const chest = new THREE.Group(); chest.position.y = .06; hips.add(chest);
  const prof = o.female ? [[0,0],[.15,0],[.155,.07],[.138,.2],[.152,.31],[.163,.4],[.158,.48],[.11,.54],[.055,.57],[0,.57]]
                        : [[0,0],[.158,0],[.165,.09],[.17,.2],[.188,.32],[.2,.42],[.195,.49],[.13,.55],[.06,.575],[0,.575]];
  const tor = sombras(new THREE.Mesh(new THREE.LatheGeometry(prof.map(p=>new THREE.Vector2(p[0],p[1])), 26), mTorso)); tor.scale.z = .66; chest.add(tor);
  // Ropa: saco con solapas, camisa, corbata o camisa casual
  if (!o.casual){
    box(.1,.2,.01,mShirt,0,.45,.127,chest);
    if (o.tie){ box(.038,.25,.012,mat(o.tie,.42),0,.385,.133,chest); box(.048,.035,.016,mat(o.tie,.42),0,.507,.131,chest); }
    const l1 = box(.055,.27,.013,mSuitD,-.052,.405,.131,chest); l1.rotation.z = .33; const l2 = box(.055,.27,.013,mSuitD,.052,.405,.131,chest); l2.rotation.z = -.33;
    sph(.009,mDark,0,.235,.131,chest,8,6); sph(.009,mDark,0,.155,.13,chest,8,6);
    const c1 = box(.045,.03,.012,mShirt,-.028,.545,.105,chest); c1.rotation.z = .5; const c2 = box(.045,.03,.012,mShirt,.028,.545,.105,chest); c2.rotation.z = -.5;
  } else {
    const c1 = box(.05,.032,.012,mSuitD,-.03,.548,.104,chest); c1.rotation.z = .55; const c2 = box(.05,.032,.012,mSuitD,.03,.548,.104,chest); c2.rotation.z = -.55;
    box(.018,.36,.008,mSuitD,0,.34,.128,chest); [.46,.37,.28,.19].forEach(y=>sph(.006,mat(0xe8e2d0,.4),0,y,.133,chest,6,5));
    if (o.plaid){ for (let i=0;i<5;i++) box(.33,.008,.004,mat(o.plaid,.7),0,.12+i*.09,.125-Math.abs(.25-i*.05)*.0,chest); }
  }
  [-1,1].forEach(sd=>sph(.078,mSuit,sd*.2,.49,0,chest,14,10).scale.set(1,.85,.85));
  cyl(.046,.052,.12,mSkin,0,.585,0,chest);
  // Cabeza
  const head = new THREE.Group(); head.position.y = .62; chest.add(head);
  sph(.104,mSkin,0,.135,-.005,head,30,22).scale.set(.93,1.06,1.02);
  sph(.086,mSkin,0,.08,.018,head,26,18).scale.set(o.female?.9:.98,.93,1.0);
  sph(.03,mSkin,0,.046,.07,head,12,10).scale.set(1.2,.8,.8);
  [-1,1].forEach(sd=>sph(.027,mSkin,sd*.097,.122,-.005,head,10,8).scale.set(.45,1,.75));
  sph(.02,mSkin,0,.118,.099,head,12,10).scale.set(.75,1.5,.9); sph(.017,mSkin,0,.097,.108,head,12,10);
  const lids = [];
  [-1,1].forEach(sd=>{ const ex = sd*.035, ey = .136, ez = .083;
    sph(.0165,mWhite,ex,ey,ez,head,14,10); sph(.0095,mIris,ex,ey,ez+.0125,head,10,8); sph(.0045,mPupil,ex,ey,ez+.0158,head,8,6);
    const lid = sph(.0185,mSkin,ex,ey+.007,ez,head,12,10); lid.scale.set(1.06,.42,1.06); lid.castShadow = false; lids.push(lid);
    const b = box(.034,.007,.01,mHair,sd*.037,.162,.094,head); b.rotation.z = sd*.12; });
  const lz = o.beard ? .108 : .098;
  const inner = sph(.02,mMouth,0,.074,lz-.003,head,10,8); inner.scale.set(1.25,.15,.5);
  sph(.016,mLip,0,.081,lz,head,12,8).scale.set(1.55,.36,.62);
  const lower = sph(.016,mLip,0,.068,lz-.002,head,12,8); lower.scale.set(1.4,.45,.6);
  // Cabello
  const st = o.estilo || (o.female ? "melena" : "corto");
  if (st !== "gorra"){
    const cap = sombras(new THREE.Mesh(new THREE.SphereGeometry(.112,28,16,0,PI*2,0,PI*.5), mHair)); cap.position.set(0,.142,-.012); cap.rotation.x = -.32; cap.scale.set(.98,1.1,1.06); head.add(cap);
    sph(.1,mHair,0,.118,-.04,head,20,14).scale.set(.97,1.02,.86);
    if (!o.female) [-1,1].forEach(sd=>box(.012,.045,.032,mHair,sd*.094,.125,.018,head));
  }
  if (st === "woc"){ sph(.085,mHair,.018,.206,.022,head,20,12).scale.set(1.25,.55,1.15); sph(.05,mHair,.04,.198,.075,head,16,10).scale.set(1.35,.55,.9); sph(.05,mHair,-.04,.2,.06,head,14,10).scale.set(1.1,.5,.9); }
  if (st === "moño"){ sph(.104,mHair,0,.125,-.045,head,20,14).scale.set(1.0,1.05,.9); sph(.055,mHair,0,.172,-.122,head,16,12); }
  if (st === "cola"){ sph(.104,mHair,0,.125,-.045,head,20,14).scale.set(1.0,1.05,.9); const p = cyl(.036,.016,.25,mHair,0,.06,-.15,head,10); p.rotation.x = .32; sph(.022,mat(0x1a1a1a,.4),0,.15,-.13,head,8,6); }
  if (st === "melena"){ sph(.106,mHair,0,.12,-.045,head,20,14).scale.set(1.04,1.08,.92); const m = cyl(.1,.118,.24,mHair,0,.02,-.04,head,20); m.scale.z = .75; }
  if (st === "canas"){ /* cabello corto entrecano, ya cubierto por el color */ }
  if (st === "gorra"){ const cm = sombras(new THREE.Mesh(new THREE.SphereGeometry(.116,22,12,0,PI*2,0,PI*.48), mat(o.gorra||0x1f3a5a,.75))); cm.position.y = .15; cm.scale.set(1,1.02,1.05); head.add(cm);
    const v = box(.15,.012,.1,mat(o.gorra||0x1f3a5a,.75),0,.175,.125,head); v.rotation.x = .12; sph(.1,mHair,0,.1,-.045,head,16,10).scale.set(.97,.8,.85); }
  if (o.beard){ const bm = sombras(new THREE.Mesh(new THREE.SphereGeometry(.09,22,12,0,PI*2,PI*.46,PI*.54), mat(o.hair,.85,0,{transparent:true, opacity:.82}))); bm.position.set(0,.082,.02); bm.scale.set(1.01,.97,1.06); head.add(bm);
    box(.045,.009,.014,mat(o.hair,.8),0,.088,lz+.006,head); }
  if (o.lentes){ const gm = mat(0x16181c,.25,.7);
    [-1,1].forEach(sd=>{ const g = new THREE.Group(); g.position.set(sd*.036,.137,.103); head.add(g);
      box(.05,.0045,.004,gm,0,.0145,0,g); box(.05,.0035,.004,gm,0,-.0145,0,g); box(.0035,.032,.004,gm,-.025,0,0,g); box(.0035,.032,.004,gm,.025,0,0,g);
      const lens = new THREE.Mesh(new THREE.PlaneGeometry(.048,.028), mat(0x9fb6cc,.05,.2,{transparent:true, opacity:.18})); g.add(lens);
      box(.004,.004,.1,gm,sd*.026,.004,-.05,g); });
    box(.02,.004,.004,gm,0,.142,.104,head); }
  function brazo(side){ const sh = new THREE.Group(); sh.position.set(side*.225,.49,0); chest.add(sh); cyl(.056,.047,.29,mSuit,0,-.145,0,sh,14);
    const el = new THREE.Group(); el.position.y = -.29; sh.add(el); sph(.048,mSuit,0,0,0,el,12,8); cyl(.046,.038,.25,mSuit,0,-.125,0,el,14);
    if (!o.casual) cyl(.039,.039,.025,mShirt,0,-.255,0,el,12);
    const hand = sph(.042,mSkin,0,-.305,.008,el,14,10); hand.scale.set(.82,1.15,.55); sph(.015,mSkin,side*-.03,-.285,.022,el,8,6).scale.set(1,1.6,1);
    return {sh,el,hand}; }
  function pierna(side){ const hp = new THREE.Group(); hp.position.set(side*.09,-.04,0); hips.add(hp); cyl(.076,.06,.46,mPants,0,-.23,0,hp,14);
    const kn = new THREE.Group(); kn.position.y = -.46; hp.add(kn); sph(.06,mPants,0,0,0,kn,12,8); cyl(.058,.045,.42,mPants,0,-.21,0,kn,14);
    box(.088,.06,.2,mShoe,0,-.445,.035,kn); sph(.046,mShoe,0,-.45,.13,kn,12,8).scale.set(1,.6,1.25); return {hp,kn}; }
  const h = { root, hips, chest, head, mouth:{inner, lower}, lids, aR:brazo(-1), aL:brazo(1), lR:pierna(-1), lL:pierna(1),
    x:o.x, z:o.z, base:o.base||0, rot:o.rot||0, rotT:o.rot||0, sit:o.seated?1:0, sitT:o.seated?1:0, walk:0, walkT:0, phase:0,
    queue:[], task:null, pose:null, talking:false, seed:Math.random()*10, speed:1.5, home:{x:o.x, z:o.z, rot:o.rot||0, seated:!!o.seated}, gv:0, yaw:0,
    open:0, nextBlink:1+Math.random()*3, blinkT:0, lastStep:0 };
  root.scale.setScalar(o.escala || (o.female ? .95 : 1));
  root.position.set(h.x, h.base, h.z); root.rotation.y = h.rot;
  return h;
}

function silla(x,y,z,rot,col,alta){ const g = new THREE.Group(); g.position.set(x,y,z); g.rotation.y = rot; scene.add(g); const m = mat(col,.55);
  box(.5,.08,.5,m,0,.43,0,g); box(.5,alta?1.0:.55,.08,m,0,.43+(alta?.5:.28),-.24,g); cyl(.03,.03,.39,mat(0x222222,.4,.6),0,.2,0,g); cyl(.22,.22,.03,mat(0x222222,.4,.6),0,.02,0,g); }

function construirSala(){
  const T = texturas();
  const madera = mat(0x4a2c18,.6), maderaOsc = mat(0x2a180d,.55), oro = mat(0xc9a35a,.35,.8,{emissive:0x3a2a0c}), negro = mat(0x15171c,.5);
  scene.background = new THREE.Color(0x05080f); scene.fog = new THREE.Fog(0x05080f, 14, 30);
  const piso = new THREE.Mesh(new THREE.PlaneGeometry(18,20), new THREE.MeshStandardMaterial({map:T.piso, roughness:.55})); piso.rotation.x = -PI/2; piso.position.z = 1; piso.receiveShadow = true; scene.add(piso);
  const fondo = new THREE.Mesh(new THREE.PlaneGeometry(18,7.5), new THREE.MeshStandardMaterial({map:T.marmol, roughness:.35, metalness:.1})); fondo.position.set(0,3.75,-8); fondo.receiveShadow = true; scene.add(fondo);
  [-9,9].forEach(x=>{ const p = new THREE.Mesh(new THREE.PlaneGeometry(20,7.5), new THREE.MeshStandardMaterial({map:T.panel, roughness:.6})); p.position.set(x,3.75,1); p.rotation.y = x<0?PI/2:-PI/2; p.receiveShadow = true; scene.add(p); });
  const techo = new THREE.Mesh(new THREE.PlaneGeometry(18,20), mat(0x0b0f18,.9)); techo.rotation.x = PI/2; techo.position.set(0,7.5,1); scene.add(techo);
  box(18,.05,.05,oro,0,1.2,-7.97); box(18,.05,.05,oro,0,6.4,-7.97);
  [-2.9,2.9,-6.6,6.6].forEach(x=>{ box(.6,6.6,.6,mat(0x1b2230,.3,.1),x,3.3,-7.7); box(.72,.14,.72,oro,x,6.6,-7.7); box(.72,.14,.72,oro,x,.07,-7.7); });
  const L = new THREE.TextureLoader();
  L.load("img/logo.jpg", t => { t.encoding = THREE.sRGBEncoding; const m = new THREE.Mesh(new THREE.PlaneGeometry(4.4,2.2), new THREE.MeshStandardMaterial({map:t, emissive:0xffffff, emissiveMap:t, emissiveIntensity:.55, roughness:.4})); m.position.set(0,3.95,-7.94); scene.add(m); });
  box(4.6,.06,.06,oro,0,5.08,-7.93); box(4.6,.06,.06,oro,0,2.82,-7.93);
  L.load("img/ventana.jpg", t => { t.encoding = THREE.sRGBEncoding; const m = new THREE.Mesh(new THREE.PlaneGeometry(1.7,3.2), new THREE.MeshBasicMaterial({map:t})); m.position.set(-8.97,3.0,-3.2); m.rotation.y = PI/2; scene.add(m); });
  box(.12,3.4,.12,negro,-8.9,3.0,-4.1); box(.12,3.4,.12,negro,-8.9,3.0,-2.3); box(.12,.12,1.9,negro,-8.9,4.65,-3.2); box(.12,.12,1.9,negro,-8.9,1.35,-3.2);
  // Puerta lateral
  box(.1,2.5,1.3,maderaOsc,8.95,1.25,-3.0); box(.12,.08,1.45,oro,8.92,2.52,-3.0);

  // Estrado
  box(6.4,.35,2.7,maderaOsc,0,.175,-6.35);
  box(4.4,.95,.7,madera,0,.35+.475,-5.3); box(4.65,.07,.86,maderaOsc,0,1.335,-5.3);
  box(4.4,.03,.02,oro,0,1.18,-4.94); box(4.4,.03,.02,oro,0,.42,-4.94);
  const placa = new THREE.Mesh(new THREE.PlaneGeometry(1.5,.34), new THREE.MeshStandardMaterial({map:T.placa, roughness:.35, emissive:0x221808, emissiveMap:T.placa, emissiveIntensity:.4})); placa.position.set(0,.85,-4.93); scene.add(placa);
  silla(0,.35,-6.2,0,0x111216,true);
  [0x2b3e66,0x7a2026,0x1d4a34].forEach((c,i)=>box(.26,.08,.34,mat(c,.6),-1.6,1.41+i*.085,-5.45));
  folder = { mesh: box(.33,.03,.24,mat(0xd8c58f,.8),3.3,.795,-4.3), holder:null };
  gavel = new THREE.Group(); scene.add(gavel); gavel.position.set(-.85,1.39,-5.45);
  cyl(.012,.012,.28,mat(0x3a2414,.5),0,0,0,gavel).rotation.z = PI/2; const cab = cyl(.045,.045,.13,mat(0x2a160b,.45),.14,0,0,gavel); cab.rotation.x = PI/2;
  gavel.userData.home = gavel.position.clone();
  cyl(.12,.12,.04,mat(0x2a160b,.45),-.85,1.39,-5.25);

  // Bandera
  cyl(.025,.025,3.4,oro,-4.4,1.7,-7.2); sph(.06,oro,-4.4,3.43,-7.2);
  const fg = new THREE.PlaneGeometry(1.5,.9,14,6); flag = new THREE.Mesh(fg, new THREE.MeshStandardMaterial({map:T.bandera, side:THREE.DoubleSide, roughness:.8})); flag.position.set(-3.63,2.9,-7.2); flag.castShadow = true; scene.add(flag);
  flag.userData.orig = Float32Array.from(fg.attributes.position.array);

  // Escritorio de la técnica judicial
  box(1.6,.06,.8,madera,3.4,.76,-4.25); box(1.6,.7,.04,maderaOsc,3.4,.38,-3.87); [-.75,.75].forEach(dx=>box(.04,.73,.7,maderaOsc,3.4+dx,.37,-4.25));
  box(.55,.34,.04,negro,3.65,1.05,-4.45); const pant = new THREE.Mesh(new THREE.PlaneGeometry(.5,.29), new THREE.MeshBasicMaterial({map:T.pantalla})); pant.position.set(3.65,1.05,-4.475); pant.rotation.y = PI; scene.add(pant);
  silla(3.4,0,-4.85,-.4,0x1c2333,false);

  // Estrado del testigo
  const tg = new THREE.Group(); tg.position.set(-3.6+Math.sin(.9)*.55,0,-4.6+Math.cos(.9)*.55); tg.rotation.y = .9; scene.add(tg);
  box(.9,1.0,.08,madera,0,.5,0,tg); box(1.0,.05,.3,maderaOsc,0,1.02,-.08,tg);
  silla(-3.6,0,-4.6,.9,0x3b2416,false);

  // Mesas de las partes
  [-2.4,2.4].forEach(cx=>{ box(2.6,.06,.9,madera,cx,.76,.2); box(2.6,.66,.04,maderaOsc,cx,.4,-.23); [-1.2,1.2].forEach(dx=>box(.05,.73,.8,maderaOsc,cx+dx,.37,.2));
    box(.3,.01,.22,mat(0xf1f1ee,.9),cx+.3,.795,.35); box(.3,.01,.22,mat(0xf1f1ee,.9),cx-.5,.795,.3); });
  box(.36,.02,.25,mat(0x2a2d33,.4,.5),2.0,.8,.25);
  [[-1.9,.95],[-3.0,.95],[1.9,.95],[3.0,.95]].forEach(([x,z])=>silla(x,0,z,PI,0x1c2333,false));

  // Barandilla y público
  [-3.5,3.5].forEach(cx=>{ box(5.0,.07,.1,madera,cx,.95,2.35); box(5.0,.05,.08,madera,cx,.15,2.35); for(let i=0;i<=12;i++) cyl(.025,.025,.8,maderaOsc,cx-2.5+i*5/12,.55,2.35,scene,8); });
  [3.6,4.9].forEach(z=>[-3.4,3.4].forEach(cx=>{ box(5.0,.08,.5,madera,cx,.45,z); box(5.0,.5,.06,maderaOsc,cx,.78,z+.28); }));
  // Lámparas
  [[-3,-3],[3,-3],[-3,3],[3,3]].forEach(([x,z])=>{ cyl(.5,.5,.06,mat(0xfff2d6,.4,0,{emissive:0xffe2a8, emissiveIntensity:1.2}),x,7.45,z); });

  // Holograma de la IA
  holo = new THREE.Group(); holo.position.set(1.85,2.05,-5.05); holo.rotation.y = -.35; scene.add(holo);
  const hm = new THREE.MeshBasicMaterial({map:T.holo, transparent:true, opacity:.6, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide});
  const hp = new THREE.Mesh(new THREE.PlaneGeometry(1.3,.81), hm); holo.add(hp); holo.userData.mat = hm;
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(1.26,.02), new THREE.MeshBasicMaterial({color:0x9cc6ff, transparent:true, opacity:.7, blending:THREE.AdditiveBlending, depthWrite:false})); scan.position.z = .01; holo.add(scan); holo.userData.scan = scan;
  const anillo = new THREE.Mesh(new THREE.TorusGeometry(.42,.006,6,48), new THREE.MeshBasicMaterial({color:0x4c9bff, transparent:true, opacity:.45, blending:THREE.AdditiveBlending})); anillo.rotation.x = PI/2; anillo.position.y = -.48; holo.add(anillo); holo.userData.anillo = anillo;
  holo.userData.luz = new THREE.PointLight(0x4c9bff,.7,4); holo.add(holo.userData.luz);

  // Luces
  scene.add(new THREE.HemisphereLight(0xffe7c4, 0x1a1410, .5));
  const key = new THREE.DirectionalLight(0xfff1dc, 1.05); key.position.set(4,9,7); key.target.position.set(0,0,-3); scene.add(key, key.target);
  key.castShadow = true; Object.assign(key.shadow.camera, {left:-10,right:10,top:10,bottom:-10,near:1,far:30}); key.shadow.mapSize.set(1024,1024); key.shadow.bias = -.0006;
  const fill = new THREE.DirectionalLight(0x7aa6ff,.35); fill.position.set(-7,5,-2); scene.add(fill);
  const pl = new THREE.PointLight(0xffc977,1.3,9); pl.position.set(0,3.6,-6.6); scene.add(pl);
  const sp = new THREE.SpotLight(0xffe3b0,1.3,16,.45,.6); sp.position.set(0,6.8,-2.4); sp.target.position.set(0,1.3,-6); scene.add(sp, sp.target);
  const win = new THREE.PointLight(0x6f8fff,.5,8); win.position.set(-7.6,3,-3.2); scene.add(win);

  // Personajes
  H.juez = humano({x:0, z:-6.2, base:.35, rot:0, seated:true, estilo:"woc", lentes:true, skin:0xd9a588, hair:0x0f0c0b, suit:0x1a2546, shirt:0xbcd0ee, tie:0xb01e2a, eye:0x2a1a10, escala:1.02});
  H.laura = humano({x:3.4, z:-4.85, rot:-.4, seated:true, female:true, estilo:"moño", skin:0xc89274, hair:0x3a2416, suit:0x34466d, shirt:0xe9eef6, pants:0x22283a, eye:0x4a2e1a});
  H.vega = humano({x:-1.9, z:.95, rot:PI, seated:true, beard:true, estilo:"corto", skin:0xcf9a7a, hair:0x2a1c14, suit:0x23262d, shirt:0xe8ecf2, tie:0x2d3f73});
  H.carlos = humano({x:-3.0, z:.95, rot:PI, seated:true, casual:true, estilo:"corto", skin:0xc48b68, hair:0x1f1712, suit:0x5c6b58, pants:0x2f3542, eye:0x2b1c12});
  H.mora = humano({x:1.9, z:.95, rot:PI, seated:true, female:true, estilo:"cola", skin:0xe2b398, hair:0x5a3a24, suit:0x1d1f26, shirt:0xf0f2f5, eye:0x3d5a3a});
  H.javier = humano({x:3.0, z:.95, rot:PI, seated:true, casual:true, estilo:"corto", skin:0xd3a080, hair:0x3b2a1e, suit:0x6e2f35, pants:0x262b33});
  H.testigo = humano({x:7.4, z:-3.0, rot:-PI/2, seated:false, casual:true, estilo:"gorra", gorra:0x1f3a5a, plaid:0x5a4a30, skin:0xae7853, hair:0x2a2a2a, suit:0x8a7a52, pants:0x3b4252, escala:.98});
  H.testigo.root.visible = false;
  const pub = [[-4.6,3.85],[-2.6,3.85],[3.2,3.85],[4.9,3.85],[-3.6,5.15],[2.4,5.15],[4.2,5.15]];
  const ropa = [0x3c4a5c,0x5a3b3b,0x2f4f4f,0x6b5b3e,0x40364f,0x4d5a3a,0x7a6a5a], piel = [0xc68e6b,0xe0b096,0xa56c4a,0xd3a080,0xb27b57,0xd6a487,0x8d5a3c];
  pub.forEach(([x,z],i)=>{ H["p"+i] = humano({x, z:z+.05, rot:PI, seated:true, female:i%2===1, casual:i%3===0, estilo:i%2? (i%3===1?"moño":"melena") : "corto", skin:piel[i], hair:[0x2a1c14,0x111111,0x6b6b6b,0x4a3020][i%4], suit:ropa[i], pants:0x23262c}); H["p"+i].publico = true; });
}

function ang(a){ while(a>PI) a-=2*PI; while(a<-PI) a+=2*PI; return a; }
function k(dt, s){ return 1 - Math.exp(-dt*s); }
function tarea(h, dt){
  if (!h.task && h.queue.length){ h.task = h.queue.shift(); h.task.t = 0; }
  const tk = h.task; if (!tk) return; tk.t += dt;
  const fin = () => { h.task = null; };
  switch(tk.type){
    case "stand": h.sitT = 0; if (h.sit < .06) fin(); break;
    case "sit": h.sitT = 1; if (tk.arg != null) h.rotT = tk.arg; if (h.sit > .94 && Math.abs(ang(h.rot-h.rotT)) < .08) fin(); break;
    case "walk": { if (!tk.p) tk.p = tk.arg.map(a=>a.slice()); const [x,z] = tk.p[0], dx = x-h.x, dz = z-h.z, d = Math.hypot(dx,dz);
      if (d < .05){ tk.p.shift(); if (!tk.p.length){ h.walkT = 0; fin(); } }
      else { h.walkT = 1; const s = Math.min(d, h.speed*dt*Math.min(1, h.walk+.25)); h.x += dx/d*s; h.z += dz/d*s; h.rotT = Math.atan2(dx,dz); } break; }
    case "face": h.rotT = tk.arg; if (Math.abs(ang(h.rot-h.rotT)) < .06) fin(); break;
    case "pick": folder.holder = h; fin(); break;
    case "give": h.pose = "give"; if (!tk.f && tk.t > .8){ tk.f = 1; folder.holder = null; folder.mesh.position.set(.35,1.385,-5.5); folder.mesh.rotation.set(0,0,0); } if (tk.t > 1.4){ h.pose = null; fin(); } break;
    case "point": h.pose = "point"; if (tk.t > (tk.arg||1.6)){ h.pose = null; fin(); } break;
    case "gavel": h.pose = "gavel"; h.gv = tk.t; [.55,1.05,1.55].forEach((m,i)=>{ if (!tk["g"+i] && tk.t > m){ tk["g"+i] = 1; golpe(); } }); if (tk.t > 2.0){ h.pose = null; fin(); } break;
    case "show": h.root.visible = true; fin(); break;
    case "hide": h.root.visible = false; fin(); break;
    default: fin();
  }
}

function animarHumano(h, dt, t){
  tarea(h, dt);
  h.rot += ang(h.rotT - h.rot) * k(dt,6);
  h.sit += (h.sitT - h.sit) * k(dt,4.5);
  h.walk += (h.walkT - h.walk) * k(dt,8);
  h.root.position.set(h.x, h.base, h.z); h.root.rotation.y = h.rot;
  const s = h.sit, w = h.walk, K = k(dt,10);
  if (w > .01) h.phase += dt*8.5;
  const sw = Math.sin(h.phase) * .55 * w;
  h.hips.position.y = .975 - (.975-.55)*s + Math.abs(Math.sin(h.phase))*.025*w;
  const J = (o, ax, v) => { o.rotation[ax] += (v - o.rotation[ax]) * K; };
  J(h.lR.hp,"x", -PI/2*s + sw); J(h.lL.hp,"x", -PI/2*s - sw);
  J(h.lR.kn,"x", PI/2*s + Math.max(0,-Math.sin(h.phase))*.7*w); J(h.lL.kn,"x", PI/2*s + Math.max(0,Math.sin(h.phase))*.7*w);
  // brazos
  let rX = -.55*s, rE = -.8*s, rZ = -.08, lX = -.55*s, lE = -.8*s, lZ = .08;
  if (w > .05){ rX = -sw*.7; lX = sw*.7; rE = -.25; lE = -.25; }
  if (h.talking && !h.pose){ rX = (s>.5?-.85:-.55) + Math.sin(t*2.6+h.seed)*.22; rE = -1.05 + Math.sin(t*3.3)*.25; rZ = .12; if (s<.5){ lX = -.35 + Math.sin(t*2.1)*.12; lE = -.6; } }
  if (h.pose === "think"){ rX = -1.0; rE = -1.9; rZ = .38; lX = -1.0; lE = -1.9; lZ = -.38; }
  if (h.pose === "point"){ rX = -1.45; rE = -.1; rZ = .05; }
  if (h.pose === "give"){ rX = -1.15; rE = -.35; rZ = .05; }
  if (h.pose === "gavel"){ const ph = Math.max(0, Math.sin((h.gv-.05)*PI*2)); rX = -.9 - ph*1.0; rE = -.7 + ph*.3; rZ = .1; }
  J(h.aR.sh,"x",rX); J(h.aR.el,"x",rE); J(h.aR.sh,"z",rZ); J(h.aL.sh,"x",lX); J(h.aL.el,"x",lE); J(h.aL.sh,"z",lZ);
  // respiración y cabeza
  h.chest.scale.y = 1 + Math.sin(t*1.6 + h.seed)*.012;
  let yaw = 0, pitch = 0;
  const tgt = mirarA(h);
  if (tgt && w < .3){ const hx = h.x, hz = h.z; yaw = Math.max(-1.1, Math.min(1.1, ang(Math.atan2(tgt.x-hx, tgt.z-hz) - h.rot))); }
  else yaw = Math.sin(t*.4 + h.seed)*.15;
  if (h.talking) pitch = Math.sin(t*5.2+h.seed)*.05;
  if (h.pose === "think") pitch = .12;
  h.yaw += (yaw - h.yaw) * k(dt,5);
  h.chest.rotation.y = h.yaw*.3; h.head.rotation.y = h.yaw*.7; J(h.head,"x",pitch);
  const ab = h.talking ? Math.abs(Math.sin(t*12.5 + h.seed))*(.55 + .45*Math.sin(t*2.7 + h.seed)) : 0;
  h.open += (ab - h.open) * k(dt,18);
  h.mouth.lower.position.y = .066 - h.open*.013; h.mouth.inner.scale.y = .15 + h.open*1.2;
  if (t > h.nextBlink){ h.blinkT = .13; h.nextBlink = t + 2.2 + Math.random()*3.8; }
  h.blinkT -= dt; const cerr = h.blinkT > 0;
  h.lids.forEach(l => { l.scale.y = cerr ? 1.05 : .42; l.position.y = cerr ? .136 : .143; });
  h.hips.rotation.z = Math.sin(t*.7 + h.seed)*.018*(1-s)*(1-w);
  if (w > .4){ const paso = Math.floor(h.phase/PI); if (paso !== h.lastStep){ h.lastStep = paso; if (h.root.visible) sfxPaso(h); } }
}

function mirarA(h){
  if (h === H.juez && speaker && speaker !== H.juez) return speaker.root.position;
  if (speaker && speaker !== h) return speaker.root.position;
  if (speaker === h){ return h === H.juez ? V(0,0,2) : H.juez.root.position; }
  if (iaActiva) return holo.position;
  return h.publico || h === H.laura ? H.juez.root.position : null;
}

const SHOTS = {
  general: () => [V(0,4.1,8.6), V(0,1.25,-3.4)],
  frente: () => [V(0,2.6,-3.6), V(0,1.0,1.6)],
  mesa: () => [V(.25,2.55,-4.35), V(0,1.25,-5.6)],
  ia: () => [V(.55,2.15,-2.75), V(1.75,1.9,-5.1)],
  orbit: (t) => { const a = Math.sin(t*.13)*1.05; return [V(Math.sin(a)*7.6, 4.3, -1.6 + Math.cos(a)*7.6), V(0,1.4,-3.6)]; }
};
function headPos(h){ const v = V(0,0,0); h.head.getWorldPosition(v); v.y += .12; return v; }
function shotHumano(h){
  const hp = headPos(h), f = V(Math.sin(h.rot),0,Math.cos(h.rot)), side = V(f.z,0,-f.x);
  const asp = camera.aspect, d = (asp < .8 ? 2.2 : 1.6) + (h === H.juez ? .45 : 0);
  const pos = hp.clone().add(f.multiplyScalar(d)).add(side.multiplyScalar(.45)).add(V(0,.14,0));
  return [pos, hp.clone().add(V(0,-.08,0))];
}
function metaCamara(t){ if (SHOTS[camShot]) return SHOTS[camShot](t); if (H[camShot]) return shotHumano(H[camShot]); return SHOTS.general(); }

function tick(){
  requestAnimationFrame(tick);
  if ($("juego").hidden || !GL) return;
  const dt = Math.min(clock.getDelta(), .05); t3 += dt;
  for (const n in H) animarHumano(H[n], dt, t3);
  H.juez.pose = H.juez.pose === "gavel" ? "gavel" : (pensando ? "think" : (H.juez.pose === "think" ? null : H.juez.pose));
  if (folder.holder){ const v = V(0,0,0); folder.holder.aR.hand.getWorldPosition(v); folder.mesh.position.set(v.x, v.y-.03, v.z); folder.mesh.rotation.y = folder.holder.rot; }
  if (H.juez.pose === "gavel"){ const v = V(0,0,0); H.juez.aR.hand.getWorldPosition(v); gavel.position.copy(v); gavel.rotation.set(0,PI/2,-.4); }
  else { gavel.position.lerp(gavel.userData.home, k(dt,8)); gavel.rotation.set(0,0,0); }
  const pa = flag.geometry.attributes.position, o = flag.userData.orig;
  for (let i=0;i<pa.count;i++){ const x = o[i*3]; pa.array[i*3+2] = Math.sin(x*3.2 + t3*2.6)*.07*((x+.75)/1.5); }
  pa.needsUpdate = true; flag.geometry.computeVertexNormals();
  const act = iaActiva ? 1 : 0, hm = holo.userData.mat;
  hm.opacity += ((act ? .95 : .45) + Math.sin(t3*(act?6:2))*.06 - hm.opacity) * k(dt,6);
  holo.position.y = 2.05 + Math.sin(t3*1.3)*.04; holo.rotation.y = -.35 + Math.sin(t3*.5)*.06;
  holo.userData.scan.position.y = ((t3*.35)%1 - .5)*.78; holo.userData.anillo.rotation.z = t3*.6; holo.userData.luz.intensity = act ? 1.6 : .6;
  const [gp, gl] = metaCamara(t3), kk = reduce ? 1 : k(dt, camShot === "orbit" ? 1.2 : 2.3);
  camPos.lerp(gp, kk); camLook.lerp(gl, kk);
  const right = V(0,0,0).subVectors(camLook, camPos).cross(V(0,1,0)).normalize();
  camera.position.copy(camPos).addScaledVector(right, parX*.22).add(V(0, -parY*.12, 0));
  camera.lookAt(camLook);
  viewOff += (viewOffT - viewOff) * k(dt,6);
  const W = renderer.domElement.clientWidth, Ht = renderer.domElement.clientHeight;
  camera.setViewOffset(W, Ht, 0, viewOff, W, Ht);
  renderer.render(scene, camera);
  posTag(W, Ht);
}
let pensando = false;

function posTag(W, Ht){
  const tg = $("tag");
  let target = null, label = "", esIA = false;
  if (speaker){ target = headPos(speaker).add(V(0,.25,0)); label = speakerNombre; }
  else if (iaActiva){ target = holo.position.clone().add(V(0,.55,0)); label = "IA Jurídica"; esIA = true; }
  if (!target || !$("capaHoja").hidden && !iaActiva){ tg.hidden = true; return; }
  target.project(camera);
  if (target.z > 1 || Math.abs(target.x) > 1.05 || target.y > .95 || target.y < -1){ tg.hidden = true; return; }
  tg.hidden = false; tg.textContent = label; tg.className = "tag" + (esIA ? " ia" : "");
  tg.style.left = ((target.x+1)/2*W) + "px"; tg.style.top = ((1-target.y)/2*Ht) + "px";
}
let speakerNombre = "";

function iniciar3D(){
  try {
    if (!window.THREE) throw new Error("sin three");
    renderer = new THREE.WebGLRenderer({antialias:true, powerPreference:"high-performance"});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    $("stage").appendChild(renderer.domElement);
    scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(50, 1, .1, 60); clock = new THREE.Clock();
    construirSala(); GL = true;
    camPos = V(0,4.6,9.5); camLook = V(0,1.2,-3.4);
    redimensionar(); addEventListener("resize", redimensionar);
    $("stage").addEventListener("pointermove", e => { const r = $("stage").getBoundingClientRect(); parX = ((e.clientX-r.left)/r.width - .5)*2; parY = ((e.clientY-r.top)/r.height - .5)*2; });
    tick();
  } catch(e){ GL = false; $("stage").classList.add("sinGL"); }
}
function redimensionar(){ if (!GL) return; const w = $("stage").clientWidth, h = $("stage").clientHeight; renderer.setSize(w, h, false); camera.aspect = w/h; camera.fov = w/h < .8 ? 62 : 48; camera.updateProjectionMatrix(); ajustarOffset(); }
