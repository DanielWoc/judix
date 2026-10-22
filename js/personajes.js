/* JUDIX · Personajes con esqueleto (Microsoft Rocketbox, licencia MIT): carga, animación y gestos. */
/* Script clásico: comparte el ámbito global con los demás archivos de js/. Se carga después de motor3d.js. */
/* Si un modelo no carga (sin red, abierto con file://, etc.), el personaje conserva su figura procedimental. */

const RIG_DIR = "modelos/";
const RIG_MODELOS = { juez:"juez", laura:"laura", vega:"vega", mora:"mora", carlos:"carlos", javier:"javier", testigo:"testigo",
  p0:"pub_h1", p1:"pub_m1", p2:"pub_h2", p3:"pub_m2", p4:"pub_h1", p5:"pub_m1", p6:"pub_h2" };
const RIG_MUJERES = new Set(["laura","mora","p1","p3","p5"]);
const RIG_CLIPS = ["caminar","sentarse","levantarse","reposo_h","sentado_h","hablar_h","pensar_h","reposo_m","sentada_m","hablar_m"];
const RIG_ALTURA_REF = .8952;   // altura de la raíz Bip01 del esqueleto de referencia de las animaciones masculinas
const RIG_PASO = 1.15;          // metros por segundo del clip de caminar a velocidad 1
const RIG_VEL_TRANS = 1.35;     // sentarse y levantarse algo más ágiles que la captura original
const RIG_SUPERIOR = /Spine1|Spine2|Neck|Head|Clavicle|UpperArm|Forearm|Hand|Finger/;

/* --- Carga --- */
function rigCargar(){
  if (!window.THREE || !THREE.GLTFLoader || !THREE.SkeletonUtils) return Promise.reject(new Error("sin cargador GLTF"));
  const L = new THREE.GLTFLoader(), ld = u => new Promise((ok, ko) => L.load(u, ok, undefined, ko));
  const archivos = [...new Set(Object.values(RIG_MODELOS))];
  return Promise.all([
    Promise.all(archivos.map(a => ld(RIG_DIR + "personajes/" + a + ".glb").then(g => [a, g]))),
    Promise.all(RIG_CLIPS.map(c => ld(RIG_DIR + "animaciones/" + c + ".glb").then(g => [c, g.animations[0]])))
  ]).then(([m, c]) => ({ modelos:Object.fromEntries(m), clips:Object.fromEntries(c) }));
}
const RIG_PRECARGA = rigCargar();
RIG_PRECARGA.catch(() => {});

/* Adapta un clip a un modelo: descarta pistas de huesos que no tiene (r128 las aplicaría a la raíz), fija la raíz en el sitio
   y ajusta la altura de la cadera a la estatura del modelo. */
function rigAdaptar(clip, modelo, alturaRaiz){
  const c = clip.clone(), k = /_m$/.test(clip.name) ? 1 : alturaRaiz / RIG_ALTURA_REF;
  c.tracks = c.tracks.filter(p => { const n = p.name.split(".")[0]; return !p.name.endsWith(".scale") && modelo.getObjectByName(n); });
  c.tracks.forEach(p => { if (p.name === "Bip01.position"){ const v = p.values; for (let i=0;i<v.length;i+=3){ v[i] = 0; v[i+1] *= k; v[i+2] = 0; } } });
  return c;
}
/* Clip compuesto: piernas y cadera de la postura sentada, torso y brazos de la gesticulación. */
function rigComponer(nombre, base, gesto){
  const sup = p => RIG_SUPERIOR.test(p.name.split(".")[0]);
  const c = new THREE.AnimationClip(nombre, Math.min(base.duration, gesto.duration), [...base.tracks.filter(p => !sup(p)), ...gesto.tracks.filter(p => sup(p))]);
  c.tracks = c.tracks.map(p => p.clone().trim(0, c.duration)); return c;
}

// Tramo de un clip, reiniciado en 0 (p. ej., la parte del gesto pensativo con la mano en el mentón).
function rigRecortar(clip, desde, hasta){
  const c = clip.clone(); c.tracks = c.tracks.map(p => p.clone().trim(desde, hasta).shift(-desde)); c.duration = hasta - desde; return c;
}

/* --- Montaje sobre los personajes existentes --- */
function vestirPersonajes(){
  return RIG_PRECARGA.then(R => { for (const n in RIG_MODELOS){ if (H[n]) try { rigMontar(H[n], n, R); } catch(e){ console.warn("JUDIX: modelo no aplicado a", n, e); } } return true; });
}
function rigMontar(h, n, R){
  const g = R.modelos[RIG_MODELOS[n]]; if (!g) return;
  const m = THREE.SkeletonUtils.clone(g.scene), mujer = RIG_MUJERES.has(n);
  const huesos = {}; let morfos = [];
  m.traverse(o => {
    if (o.isBone) huesos[o.name] = o;
    if (o.isMesh){ o.castShadow = true; o.receiveShadow = !h.publico; o.frustumCulled = false;
      const ms = Array.isArray(o.material) ? o.material : [o.material];
      o.material = ms.map(x => { const y = x.clone(); y.metalness = 0; y.roughness = Math.max(y.roughness, .62);
        if (y.transparent || /opacity/i.test(y.name)){ y.transparent = false; y.alphaTest = .45; y.side = THREE.DoubleSide; } return y; });
      if (o.material.length === 1) o.material = o.material[0];
      if (o.morphTargetDictionary) morfos.push(o); }
  });
  if (!huesos.Bip01_Head || !huesos.Bip01_R_Hand) return;
  const alturaRaiz = huesos.Bip01 ? huesos.Bip01.position.y : RIG_ALTURA_REF;
  const C = {}; for (const c in R.clips) C[c] = rigAdaptar(R.clips[c], m, alturaRaiz);
  const sx = mujer ? "m" : "h", sent = mujer ? "sentada_m" : "sentado_h";
  const clips = { caminar:C.caminar, sentarse:C.sentarse, levantarse:C.levantarse, reposo:C["reposo_"+sx], sentado:C[sent],
    hablar:C["hablar_"+sx], hablarSentado:rigComponer("hablarSentado", C[sent], C["hablar_"+sx]), pensar:rigRecortar(C.pensar_h, 2.5, 13.5) };
  m.scale.setScalar(1 / h.root.scale.x);
  h.hips.visible = false; h.root.add(m);
  const mixer = new THREE.AnimationMixer(m), acciones = {};
  for (const c in clips){ const a = mixer.clipAction(clips[c]); if (c === "sentarse" || c === "levantarse"){ a.setLoop(THREE.LoopOnce); a.clampWhenFinished = true; } acciones[c] = a; }
  h.rig = { m, mixer, acciones, huesos, morfos, actual:null, sentado:h.sitT === 1, trans:null, pesos:{point:0, give:0, gavel:0}, parp:0, paso:0 };
  h.aR = Object.assign({}, h.aR, { hand:huesos.Bip01_R_Hand });
  if (n === "juez") rigAnteojos(h);
  rigPoner(h, h.rig.sentado ? "sentado" : "reposo", 0);
  mixer.update(0);
}

/* Anteojos rectangulares del Juez Woc, montados sobre el hueso de la cabeza. */
function rigAnteojos(h){
  const B = h.rig.huesos, ri = B.Bip01_REye, li = B.Bip01_LEye; if (!ri || !li) return;
  h.root.updateMatrixWorld(true);
  const pr = new THREE.Vector3(), pl = new THREE.Vector3(); ri.getWorldPosition(pr); li.getWorldPosition(pl);
  const ancho = pr.distanceTo(pl), x = pl.clone().sub(pr).normalize(), z = new THREE.Vector3(Math.sin(h.root.rotation.y), 0, Math.cos(h.root.rotation.y));
  const y = new THREE.Vector3().crossVectors(z, x).normalize(); z.crossVectors(x, y).normalize();
  const g = new THREE.Group(), mm = new THREE.MeshStandardMaterial({color:0x111216, roughness:.3, metalness:.6});
  const lente = new THREE.MeshStandardMaterial({color:0xa9c0d6, roughness:.05, metalness:.2, transparent:true, opacity:.16, depthWrite:false});
  const w = ancho * .78, alto = w * .58, t = .0035;
  const caja = (a,b,c,px,py,pz,mat=mm) => { const o = new THREE.Mesh(new THREE.BoxGeometry(a,b,c), mat); o.position.set(px,py,pz); g.add(o); return o; };
  [-1,1].forEach(s => { const cx = s * ancho/2;
    caja(w,t,t,cx,alto/2,0); caja(w,t,t,cx,-alto/2,0); caja(t,alto,t,cx-w/2,0,0); caja(t,alto,t,cx+w/2,0,0);
    const l = new THREE.Mesh(new THREE.PlaneGeometry(w,alto), lente); l.position.set(cx,0,0); g.add(l);
    caja(t,t,.105,s*(ancho/2+w/2),alto*.3,-.052); });
  caja(ancho - w + t, t, t, 0, alto*.25, 0);
  g.matrix.makeBasis(x, y, z); g.quaternion.setFromRotationMatrix(g.matrix);
  g.position.copy(pr).add(pl).multiplyScalar(.5).addScaledVector(z, .028).addScaledVector(y, .004);
  h.root.parent.add(g); B.Bip01_Head.attach(g);
}

/* --- Animación por cuadro --- */
function rigPoner(h, nombre, fundido = .35){
  const r = h.rig; if (r.actual === nombre) return;
  const a = r.acciones[nombre], prev = r.actual && r.acciones[r.actual];
  a.reset(); a.setEffectiveTimeScale(nombre === "sentarse" || nombre === "levantarse" ? RIG_VEL_TRANS : 1); a.setEffectiveWeight(1);
  if (nombre !== "sentarse" && nombre !== "levantarse") a.time = Math.random() * a.getClip().duration;
  if (prev && fundido > 0){ a.play(); prev.crossFadeTo(a, fundido, false); } else { if (prev) prev.stop(); a.play(); }
  r.actual = nombre;
}
function animarRig(h, dt, t){
  const r = h.rig;
  h.rot += ang(h.rotT - h.rot) * k(dt,6);
  h.walk += (h.walkT - h.walk) * k(dt,8);
  h.root.position.set(h.x, h.base, h.z); h.root.rotation.y = h.rot;
  // Sentarse y levantarse: el clip de transición gobierna h.sit, del que dependen las tareas del guion.
  const quiere = h.sitT === 1;
  if (!r.trans && quiere !== r.sentado){
    if (h.sit === h.sitT){ r.sentado = quiere; rigPoner(h, quiere ? "sentado" : "reposo", 0); }
    else { r.trans = quiere ? "sentarse" : "levantarse"; rigPoner(h, r.trans, .25); }
  }
  if (r.trans){
    const a = r.acciones[r.trans], p = Math.min(1, a.time / a.getClip().duration);
    h.sit = r.trans === "sentarse" ? p : 1 - p;
    if (p >= 1){ r.sentado = r.trans === "sentarse"; r.trans = null; h.sit = r.sentado ? 1 : 0; }
  }
  if (!r.trans){
    let base;
    if (h.walk > .3) base = "caminar";
    else if (r.sentado) base = h.pose === "think" && r.acciones.pensar ? "pensar" : (h.talking ? "hablarSentado" : "sentado");
    else base = h.talking ? "hablar" : "reposo";
    rigPoner(h, base, base === "pensar" ? .7 : .35);
    if (base === "caminar"){ const v = h.speed * Math.min(1, h.walk + .25); r.acciones.caminar.setEffectiveTimeScale(Math.max(.6, v / RIG_PASO));
      const paso = Math.floor(r.acciones.caminar.time / (r.acciones.caminar.getClip().duration / 2));
      if (paso !== r.paso){ r.paso = paso; if (h.root.visible) sfxPaso(h); } }
  }
  if (!h.root.visible && !h.publico) return;
  r.mixer.update(dt);
  h.root.updateMatrixWorld(true);
  rigMirada(h, dt, t);
  rigGestos(h, dt);
  rigCara(h, dt, t);
}
// Giro de cabeza hacia quien habla (misma lógica que la figura procedimental).
function rigMirada(h, dt, t){
  let yaw = 0; const tgt = mirarA(h);
  if (tgt && h.walk < .3) yaw = Math.max(-1.1, Math.min(1.1, ang(Math.atan2(tgt.x-h.x, tgt.z-h.z) - h.rot)));
  else yaw = Math.sin(t*.4 + h.seed)*.15;
  h.yaw += (yaw - h.yaw) * k(dt,5);
  const B = h.rig.huesos; rigGiroY(B.Bip01_Neck, h.yaw*.35); rigGiroY(B.Bip01_Head, h.yaw*.55);
}
const _q = window.THREE && new THREE.Quaternion(), _q2 = window.THREE && new THREE.Quaternion(), _v = window.THREE && new THREE.Vector3(), _v2 = window.THREE && new THREE.Vector3(), _v3 = window.THREE && new THREE.Vector3();
function rigGiroY(b, a){ if (!b || !a) return; b.parent.getWorldQuaternion(_q).invert(); _v.set(0,1,0).applyQuaternion(_q); b.quaternion.premultiply(_q2.setFromAxisAngle(_v, a)); b.updateMatrixWorld(true); }
// Orienta un hueso para que apunte (hacia su hijo) en la dirección mundial dada, con peso w.
function rigApuntar(b, hijo, dir, w){
  if (!b || !hijo || w < .001) return;
  b.getWorldPosition(_v); hijo.getWorldPosition(_v2); _v2.sub(_v).normalize();
  _q.setFromUnitVectors(_v2, _v3.copy(dir).normalize());
  b.getWorldQuaternion(_q2); _q.multiply(_q2);
  b.parent.getWorldQuaternion(_q2).invert(); _q2.multiply(_q);
  b.quaternion.slerp(_q2, w); b.updateMatrixWorld(true);
}
// Señalar, entregar el expediente y golpear el mazo: brazo derecho dirigido por objetivos.
function rigGestos(h, dt){
  const r = h.rig, B = r.huesos, P = r.pesos;
  for (const p in P) P[p] += ((h.pose === p ? 1 : 0) - P[p]) * k(dt, 7);
  const f = new THREE.Vector3(Math.sin(h.rot), 0, Math.cos(h.rot)), hom = B.Bip01_R_UpperArm, cod = B.Bip01_R_Forearm, man = B.Bip01_R_Hand;
  if (P.point > .01){ const d = f.clone().add(new THREE.Vector3(0,.32,0)); rigApuntar(hom, cod, d, P.point); rigApuntar(cod, man, d, P.point); }
  if (P.give > .01){ const obj = new THREE.Vector3(.35,1.42,-5.45); hom.getWorldPosition(_v);
    rigApuntar(hom, cod, obj.clone().sub(_v).add(new THREE.Vector3(0,-.25,0)), P.give); cod.getWorldPosition(_v); rigApuntar(cod, man, obj.clone().sub(_v), P.give); }
  if (P.gavel > .01){ const obj = gavel.userData.home.clone(), ph = Math.max(0, Math.sin((h.gv-.05)*PI*2));
    hom.getWorldPosition(_v); rigApuntar(hom, cod, obj.clone().add(new THREE.Vector3(0,.12,0)).sub(_v).add(f.clone().multiplyScalar(-.15)), P.gavel);
    cod.getWorldPosition(_v); const golpe = obj.clone().sub(_v), alto = f.clone().multiplyScalar(.35).add(new THREE.Vector3(0,1,0));
    rigApuntar(cod, man, golpe.normalize().lerp(alto.normalize(), ph), P.gavel); }
}
// Boca al hablar y parpadeo, con las expresiones faciales del modelo.
function rigCara(h, dt, t){
  const r = h.rig; if (!r.morfos.length) return;
  const ab = h.talking ? Math.abs(Math.sin(t*12.5 + h.seed))*(.55 + .45*Math.sin(t*2.7 + h.seed)) : 0;
  h.open += (ab - h.open) * k(dt,18);
  if (t > h.nextBlink){ h.blinkT = .13; h.nextBlink = t + 2.2 + Math.random()*3.8; }
  h.blinkT -= dt; r.parp += ((h.blinkT > 0 ? 1 : 0) - r.parp) * k(dt, 30);
  const o = h.open, fo = Math.sin(t*3.1 + h.seed)*.5 + .5;
  r.morfos.forEach(m => { const d = m.morphTargetDictionary, i = m.morphTargetInfluences, s = (n, v) => { if (d[n] != null) i[d[n]] = v; };
    s("bocaAbierta", o*.55); s("visemaA", o*.45*fo); s("visemaO", o*.35*(1-fo)); s("parpadeoI", r.parp); s("parpadeoD", r.parp); });
}
