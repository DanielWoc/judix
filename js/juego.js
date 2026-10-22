/* JUDIX · Lógica del juego: flujo del guion, decisiones, puntuación, apelación e índice final. */
/* Script clásico: comparte el ámbito global con los demás archivos de js/. Orden de carga en index.html: caso-001 → motor3d → audio → juego. */
let S = null, SNAP = null, typing = null, temporizador = null;
function nuevo(){ return { i:0, pts:{val:0,fund:0,dp:0,imp:0,ia:0}, dec:{}, fallos:[], clas:{} }; }
function total(){ return Object.values(S.pts).reduce((a,b)=>a+b,0); }
function faseActual(){ let n = 1; for (let j=0;j<=S.i;j++) if (GUION[j].t === "fase") n = GUION[j].n; return n; }
function hud(){ const f = faseActual(), nm = ["","El conflicto","La contradicción","La investigación","La sentencia"];
  $("hudFase").textContent = `FASE ${f}/4 · ${nm[f].toUpperCase()}`; $("hudIndice").textContent = total(); $("hudBarra").style.width = Math.round(S.i/(GUION.length-1)*100) + "%"; }
function retrato(key){ const p = P[key]; if (p.ia) return `<span class="retrato ia" aria-hidden="true">${IA_SVG}</span>`; if (p.img) return `<img class="retrato" src="${p.img}" alt="">`; return `<span class="retrato" aria-hidden="true">${p.ini}</span>`; }
function hablante(key){ return `<div class="hablante">${retrato(key)}<div><div class="nombre">${P[key].n}</div><div class="rol">${P[key].r}</div></div></div>`; }
function ajustarOffset(){ const dl = $("capaDlg"), ho = $("capaHoja"); let hgt = 0; if (!ho.hidden) hgt = ho.offsetHeight*.5; else if (!dl.hidden) hgt = dl.offsetHeight*.42; viewOffT = Math.min(hgt, (window.innerHeight||600)*.32); }
function ocultarCapas(){ $("capaDlg").hidden = true; $("capaHoja").hidden = true; $("faseCard").hidden = true; $("capaDlg").innerHTML = ""; $("capaHoja").innerHTML = ""; }
function hablar(key, on){ if (speaker){ speaker.talking = false; } speaker = null; speakerNombre = ""; iaActiva = false;
  if (!on) return; if (key === "ia"){ iaActiva = true; return; } if (H[key]){ speaker = H[key]; speakerNombre = P[key].n; speaker.talking = true; } }

function ejecutarActos(acts){ if (!GL || !acts) return; for (const n in acts){ const h = H[n]; if (!h) continue; acts[n].forEach(a => h.queue.push({type:a[0], arg:a[1]})); } }
function asentar(i){
  if (!GL) return;
  for (const n in H){ const h = H[n]; h.queue = []; h.task = null; h.pose = null; h.talking = false; h.walkT = h.walk = 0;
    h.x = h.home.x; h.z = h.home.z; h.rot = h.rotT = h.home.rot; h.sit = h.sitT = h.home.seated ? 1 : 0; }
  const iIn = GUION.findIndex(e=>e.mark==="testigoIn"), iOut = GUION.findIndex(e=>e.mark==="testigoOut");
  const tg = H.testigo; tg.root.visible = false;
  if (i > iIn && i < iOut){ tg.root.visible = true; tg.x = -3.6; tg.z = -4.6; tg.rot = tg.rotT = .9; tg.sit = tg.sitT = 1; }
  const iDem = GUION.findIndex(e=>e.t==="doc");
  if (i > 1){ folder.holder = null; folder.mesh.position.set(.35,1.385,-5.5); folder.mesh.rotation.set(0,0,0); }
  else { folder.holder = null; folder.mesh.position.set(3.3,.795,-4.3); }
}

function pintar(){
  SNAP = JSON.parse(JSON.stringify(S));
  clearTimeout(temporizador); detenerTipeo(); callar(); ocultarCapas(); hud();
  const e = GUION[S.i];
  camShot = e.cam || (e.t === "fase" ? "orbit" : (e.t === "dec" ? "juez" : "general"));
  pensando = (e.t === "dec" || e.t === "clas");
  hablar(null, false);
  if (e.t === "ia") iaActiva = true;
  ejecutarActos(e.act);
  if (e.t === "fase") return mostrarFase(e);
  if (e.t === "dlg") return mostrarDialogo(e);
  if (e.t === "doc"){ SFX.papel(); return mostrarHoja(`<p class="eyebrow">Expediente sobre el estrado</p>${e.html}<div class="acciones"><button type="button" class="btn" data-sig>Continuar ▸</button></div>`); }
  if (e.t === "dec" || e.t === "ia") return mostrarDecision(e);
  if (e.t === "clas") return mostrarClasificacion();
  if (e.t === "apelacion"){ pensando = false; temporizador = setTimeout(mostrarApelacion, GL ? 2300 : 0); return; }
  if (e.t === "final"){ SFX.ok(); return mostrarFinal(); }
}
function mostrarHoja(html){ const c = $("capaHoja"); c.innerHTML = `<div class="hoja">${html}</div>`; c.hidden = false; c.querySelector(".hoja").scrollTop = 0;
  c.querySelectorAll("[data-sig]").forEach(b => b.addEventListener("click", avanzar)); requestAnimationFrame(ajustarOffset); const f = c.querySelector("button"); if (f) f.focus({preventScroll:true}); }
function mostrarFase(e){ const c = $("faseCard"); c.innerHTML = `<div class="in"><span class="n">FASE ${e.n} DE 4</span><h2>${e.tit}</h2><p>${e.sub}</p><button type="button" class="btn" data-sig>Comenzar fase ▸</button></div>`;
  c.hidden = false; c.querySelector("[data-sig]").addEventListener("click", avanzar); c.querySelector("[data-sig]").focus({preventScroll:true}); viewOffT = 0;
  SFX.fase(); const nums = ["","uno","dos","tres","cuatro"]; decir(`Fase ${nums[e.n]}. ${e.tit}.`, "narrador"); }

function mostrarDialogo(e){
  const c = $("capaDlg");
  c.innerHTML = `<div class="dlg${e.who==="ia"?" ia":""}">${hablante(e.who)}<p class="texto" id="dlgTxt" aria-live="polite"></p>
    <div class="pie"><span class="ayuda">Toque la sala o pulse Espacio para continuar</span><button type="button" class="btn cont" id="btnCont">Continuar <span class="flecha">▸</span></button></div></div>`;
  c.hidden = false; requestAnimationFrame(ajustarOffset);
  hablar(e.who, true);
  $("btnCont").addEventListener("click", e2 => { e2.stopPropagation(); continuarDialogo(); });
  $("btnCont").focus({preventScroll:true});
  tipear(e.txt, e.who);
}
function tipear(txt, who){
  const el = $("dlgTxt");
  let revelar = 0, vozFin = false;
  const hablando = decir(txt, who, {
    start: () => { if (speaker) speaker.talking = true; if (who === "ia") iaActiva = true; },
    end: () => { vozFin = true; revelar = txt.length; if (speaker) speaker.talking = false; },
    boundary: ev => { if (typeof ev.charIndex === "number") revelar = Math.max(revelar, ev.charIndex + (ev.charLength || 6)); }
  });
  if (who === "ia") SFX.holo();
  if (reduce){ el.textContent = txt; typing = null; if (!hablando) setTimeout(()=>{ if (speaker) speaker.talking = false; }, 600); return; }
  const cps = hablando ? 13.5*((PERFIL[who]||{}).r||1) : 46;
  let i = 0, last = performance.now(), acc = 0;
  typing = { txt, raf:0 };
  const paso = now => { acc += (now-last)/1000*cps; last = now; const n = Math.min(txt.length, Math.max(Math.floor(acc), Math.round(revelar*.98)));
    if (n > i){ i = n; el.textContent = txt.slice(0,i); }
    if (i < txt.length) typing.raf = requestAnimationFrame(paso);
    else { typing = null; if (!hablando || vozFin) setTimeout(()=>{ if (speaker && !typing) speaker.talking = false; }, 350); } };
  typing.raf = requestAnimationFrame(paso);
}
function detenerTipeo(){ if (typing){ cancelAnimationFrame(typing.raf); typing = null; } }
function continuarDialogo(){
  if (typing){ const t = typing.txt; detenerTipeo(); $("dlgTxt").textContent = t; return; }
  SFX.click(); callar(); avanzar();
}

function nivel(p, max){ return p === max ? "full" : p > 0 ? "part" : "cero"; }
function mostrarDecision(e){
  const L = "ABCD";
  const cab = e.t === "ia" ? `${hablante("ia")}<p class="dialogo-ia">${e.msg}</p><p class="pregunta">¿Qué hace con esta sugerencia?</p>` : `${hablante("juez")}<p class="pregunta">${e.q}</p>`;
  mostrarHoja(`${cab}<ol class="ops">${e.ops.map((o,j)=>`<li><button type="button" class="op" data-k="${j}"><span class="l">${L[j]}</span><span>${o.t}</span></button></li>`).join("")}</ol><div id="fbZona"></div>`);
  $("capaHoja").querySelectorAll(".op").forEach(b => b.addEventListener("click", () => decidir(e, Number(b.dataset.k))));
  if (e.t === "ia"){ SFX.holo(); decir(e.msg, "ia"); }
}
function decidir(e, j){
  const o = e.ops[j], max = Math.max(...e.ops.map(x=>x.p));
  S.pts[e.cat] += o.p; if (e.id) S.dec[e.id] = o.p === max;
  if (o.p < max) S.fallos.push({cat:e.cat, q:e.q || "Sugerencia de la IA", fb:o.fb});
  $("capaHoja").querySelectorAll(".op").forEach(b => { const x = e.ops[Number(b.dataset.k)]; b.disabled = true; b.classList.add(nivel(x.p,max)); if (Number(b.dataset.k) === j) b.classList.add("sel"); else if (x.p !== max) b.classList.add("apaga"); });
  const nv = nivel(o.p,max), et = {full:"Decisión ajustada a derecho", part:"Decisión con reparos", cero:"Decisión errónea"}[nv];
  callar(); (nv === "full" ? SFX.ok : nv === "part" ? SFX.parcial : SFX.mal)();
  $("fbZona").innerHTML = `<div class="fb ${nv}" role="status"><span class="v">${et}</span><p>${o.fb}</p><span class="pts">+${o.p} · ${CAT[e.cat]}</span></div><div class="acciones"><button type="button" class="btn" id="btnSigDec">Continuar ▸</button></div>`;
  $("btnSigDec").addEventListener("click", avanzar); $("btnSigDec").focus({preventScroll:true});
  $("fbZona").scrollIntoView({behavior: reduce ? "auto" : "smooth", block:"nearest"});
  pensando = false; iaActiva = e.t === "ia"; ejecutarActos(e.after); hud(); requestAnimationFrame(ajustarOffset);
}

function mostrarClasificacion(){
  mostrarHoja(`${hablante("juez")}<p class="pregunta">Califique cada factura según la prueba</p>
    <p style="color:var(--muted)">Distinga los gastos de conservación, que ambos condueños deben soportar según su cuota, de las mejoras que el otro no consintió y de los gastos que no se demostraron.</p>
    <div class="items">${FACTURAS.map((f,i)=>`<div class="item" data-i="${i}"><div class="top"><b>${f.d}</b><span>${f.id} · ${colones(f.m)}</span></div>
      <div class="seg" role="group" aria-label="Calificación de ${f.id}">${Object.entries(CLASES).map(([c,l])=>`<button type="button" data-c="${c}" aria-pressed="false">${l}</button>`).join("")}</div><p class="nota" hidden></p></div>`).join("")}</div>
    <div id="fbZona"><div class="acciones"><button type="button" class="btn" id="btnCalif" disabled>Confirmar calificación</button></div></div>`);
  S.clas = {};
  $("capaHoja").querySelectorAll(".item").forEach(it => { const i = Number(it.dataset.i);
    it.querySelectorAll(".seg button").forEach(b => b.addEventListener("click", () => { if (it.dataset.cerrado) return; S.clas[i] = b.dataset.c;
      it.querySelectorAll(".seg button").forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false")); $("btnCalif").disabled = Object.keys(S.clas).length < FACTURAS.length; })); });
  $("btnCalif").addEventListener("click", corregirClasificacion);
}
function corregirClasificacion(){
  let ac = 0;
  $("capaHoja").querySelectorAll(".item").forEach(it => { const i = Number(it.dataset.i), f = FACTURAS[i], el = S.clas[i]; it.dataset.cerrado = "1";
    it.querySelectorAll(".seg button").forEach(b => { b.disabled = true; if (b.dataset.c === f.ok) b.classList.add("ok"); else if (b.dataset.c === el) b.classList.add("mal"); });
    const n = it.querySelector(".nota"); n.hidden = false; n.textContent = (el === f.ok ? "Correcto. " : `Corresponde: ${CLASES[f.ok]}. `) + f.nota;
    if (el === f.ok) ac++; else S.fallos.push({cat:"val", q:`Calificación de ${f.id}`, fb:f.nota}); });
  const p = ac*4; S.pts.val += p; const nv = nivel(p,24); (nv === "full" ? SFX.ok : nv === "part" ? SFX.parcial : SFX.mal)();
  $("fbZona").innerHTML = `<div class="fb ${nv}" role="status"><span class="v">${ac} de 6 facturas bien calificadas</span><p>Gastos de conservación acreditados: ₡8.000.000. Cuota del demandado (50 %): ₡4.000.000.</p><span class="pts">+${p} · ${CAT.val}</span></div><div class="acciones"><button type="button" class="btn" id="btnSigCl">Continuar ▸</button></div>`;
  $("btnSigCl").addEventListener("click", avanzar); $("btnSigCl").focus({preventScroll:true}); pensando = false; hud();
}

function mostrarApelacion(){
  const d = S.dec; let sello, tit, raz = [];
  if (d.disp && d.monto && d.fund){ sello = ["ok","CONFIRMA"]; tit = "El tribunal confirma su sentencia"; raz.push("La sentencia distingue correctamente los gastos de conservación de las mejoras no consentidas y desvirtúa el gasto no acreditado."); }
  else if (d.disp){ sello = ["warn","REVOCA PARCIALMENTE"]; tit = "El tribunal modifica su sentencia";
    if (!d.monto) raz.push("El monto no corresponde a la cuota del demandado en los gastos de conservación acreditados. Se fija en ₡4.000.000.");
    if (!d.fund) raz.push("La motivación es insuficiente: no aplica el deber legal de contribuir a la conservación de la cosa común (art. 271 del Código Civil) ni califica cada gasto."); }
  else { sello = ["bad","REVOCA"]; tit = "El tribunal revoca su sentencia"; raz.push("La demanda debía acogerse parcialmente: hay gastos de conservación acreditados y otros que no son exigibles. Se condena al demandado a pagar ₡4.000.000."); }
  const dp = S.fallos.filter(f => f.cat === "dp" || f.cat === "imp");
  if (dp.length) raz.push("Además, advierte reparos en la conducción del proceso: " + dp.map(f => f.q.replace(/¿|\?/g,"").toLowerCase()).join("; ") + ".");
  SFX.sello(); decir(`${tit}.`, "narrador");
  mostrarHoja(`<p class="eyebrow">Tribunal de Apelación Civil · virtual</p><span class="sello ${sello[0]}">${sello[1]}</span><h2 style="font-size:23px">${tit}</h2><ul class="razones">${raz.map(r=>`<li>${r}</li>`).join("")}</ul><div class="acciones"><button type="button" class="btn" data-sig>Ver Índice de excelencia ▸</button></div>`);
}
function rango(t){
  if (t >= 90) return ["Juez de excelencia","Resolvió conforme a derecho, verificó a la IA y condujo el proceso con imparcialidad. Caso 002 desbloqueado."];
  if (t >= 70) return ["Sentencia sólida","Buen criterio, con reparos puntuales. Revise los puntos señalados."];
  if (t >= 50) return ["Criterio en formación","Varias decisiones no resistirían una revisión. Repita el caso con atención a la prueba."];
  return ["Sentencia vulnerable","El tribunal de alzada tendría mucho que corregir. Vuelva a intentarlo."];
}
function mostrarFinal(){
  const t = total(), [r, txt] = rango(t);
  try { if (t > (Number(localStorage.getItem("judix-001"))||0)) localStorage.setItem("judix-001", String(t)); } catch(e){}
  mostrarHoja(`<p class="eyebrow">Caso 001 · La casa en disputa</p><div class="indice-total"><span class="n">${t}</span><span class="d">/ 100 · Índice de excelencia judicial</span></div>
    <p class="rango">${r}</p><p style="color:var(--muted);max-width:60ch">${txt}</p>
    <div class="cats">${Object.keys(CAT).map(c=>`<div class="cat"><span>${CAT[c]}</span><span class="s">${S.pts[c]} / ${MAX[c]}</span><span class="b"><i style="width:${Math.round(S.pts[c]/MAX[c]*100)}%"></i></span></div>`).join("")}</div>
    <div class="acciones"><button type="button" class="btn sec" id="btnPort">Volver a la portada</button><button type="button" class="btn" id="btnRep">Repetir el caso</button></div>`);
  $("btnPort").addEventListener("click", volver); $("btnRep").addEventListener("click", iniciar);
}

function avanzar(){ if (S.i < GUION.length-1){ S.i++; pintar(); } }
async function iniciar(){
  audioInit(); desbloquearVoz();
  S = nuevo(); $("portada").hidden = true; $("juego").hidden = false; document.body.style.overflow = "hidden";
  if (!construida){ construida = true; $("cargando").hidden = false; try { await document.fonts.ready; } catch(e){} iniciar3D(); }
  $("cargando").hidden = true;
  asentar(0); if (GL){ camPos.set(0,4.6,9.5); camLook.set(0,1.2,-3.4); }
  pintar();
}
function volver(){ clearTimeout(temporizador); detenerTipeo(); callar(); hablar(null,false); if (SND.ctx) SND.ctx.suspend(); $("juego").hidden = true; $("portada").hidden = false; document.body.style.overflow = ""; record(); window.scrollTo({top:0}); }
function record(){ let r = 0; try { r = Number(localStorage.getItem("judix-001"))||0; } catch(e){} $("record").textContent = r ? `Su mejor índice en este navegador: ${r}/100.` : ""; }

$("stage").addEventListener("click", () => { if (!$("capaDlg").hidden) continuarDialogo(); });
addEventListener("keydown", ev => { if ($("juego").hidden) return; if ((ev.key === " " || ev.key === "Enter") && !$("capaDlg").hidden && document.activeElement?.id !== "btnCont"){ ev.preventDefault(); continuarDialogo(); } });
$("btnSalir").addEventListener("click", volver);
$("btnVoz").addEventListener("click", () => { VOZ.on = !VOZ.on; $("btnVoz").setAttribute("aria-pressed", VOZ.on); if (!VOZ.on) callar(); });
$("btnSon").addEventListener("click", () => { audioInit(); setSonido(!SND.on); $("btnSon").setAttribute("aria-pressed", SND.on); });
if (!VOZ.sup){ $("btnVoz").disabled = true; $("btnVoz").title = "Este navegador no ofrece voz sintetizada"; $("btnVoz").setAttribute("aria-pressed","false"); }

async function start(data){
  $("btnIniciar").addEventListener("click", iniciar);
  record();
  if (data && data.S){ S = data.S; $("portada").hidden = true; $("juego").hidden = false; document.body.style.overflow = "hidden";
    if (!construida){ construida = true; try { await document.fonts.ready; } catch(e){} iniciar3D(); }
    $("cargando").hidden = true; asentar(S.i); pintar(); }
}
window.claude?.hot?.snapshot?.(() => ({ S: SNAP }));
window.claude?.hot?.ready ? window.claude.hot.ready(start) : start(window.claude?.hot?.data ?? {});
