/* JUDIX · Música, efectos (Web Audio) y voces sintetizadas (speechSynthesis). */
/* Script clásico: comparte el ámbito global con los demás archivos de js/. Orden de carga en index.html: caso-001 → motor3d → audio → juego. */
const SND = { ctx:null, master:null, on:true, musGain:null, timer:null };
function audioInit(){
  try {
    if (SND.ctx){ if (SND.ctx.state === "suspended") SND.ctx.resume(); return; }
    const C = new (window.AudioContext||window.webkitAudioContext)(); SND.ctx = C;
    SND.master = C.createGain(); SND.master.gain.value = SND.on ? 1 : 0; SND.master.connect(C.destination);
    ambiente(); musica();
  } catch(e){}
}
function ruidoBuffer(seg, marron){ const C = SND.ctx, b = C.createBuffer(1, Math.floor(C.sampleRate*seg), C.sampleRate), d = b.getChannelData(0); let last = 0;
  for (let i=0;i<d.length;i++){ const w = Math.random()*2-1; if (marron){ last = (last + .02*w)/1.02; d[i] = last*3.5; } else d[i] = w; } return b; }
function ambiente(){ const C = SND.ctx, n = C.createBufferSource(), f = C.createBiquadFilter(), g = C.createGain();
  n.buffer = ruidoBuffer(4, true); n.loop = true; f.type = "lowpass"; f.frequency.value = 420; g.gain.value = .07; n.connect(f).connect(g).connect(SND.master); n.start(); }
function musica(){
  const C = SND.ctx, g = C.createGain(), f = C.createBiquadFilter(); g.gain.value = 0; f.type = "lowpass"; f.frequency.value = 950; f.Q.value = .4;
  g.connect(f).connect(SND.master); SND.musGain = g; g.gain.setTargetAtTime(.045, C.currentTime, 3);
  const acordes = [[73.42,146.83,174.61,220.0],[58.27,116.54,146.83,174.61],[87.31,174.61,220.0,261.63],[65.41,130.81,164.81,196.0]];
  const osc = [0,1,2,3].map(i => { const o = C.createOscillator(), o2 = C.createOscillator(), gg = C.createGain(); o.type = "triangle"; o2.type = "sawtooth"; o2.detune.value = 7;
    gg.gain.value = i === 0 ? .55 : .3; const g2 = C.createGain(); g2.gain.value = .12; o.connect(gg); o2.connect(g2).connect(gg); gg.connect(g); o.start(); o2.start(); return [o,o2]; });
  const lfo = C.createOscillator(), lg = C.createGain(); lfo.frequency.value = .08; lg.gain.value = 260; lfo.connect(lg).connect(f.frequency); lfo.start();
  let k = 0; const cambia = () => { const a = acordes[k++ % acordes.length], t0 = C.currentTime; osc.forEach(([o,o2],i) => { o.frequency.setTargetAtTime(a[i], t0, .8); o2.frequency.setTargetAtTime(a[i], t0, .8); }); };
  cambia(); SND.timer = setInterval(cambia, 7000);
}
function tono(f0, f1, dur, tipo="sine", vol=.3, delay=0){ if (!SND.ctx) return; const C = SND.ctx, t0 = C.currentTime + delay, o = C.createOscillator(), g = C.createGain();
  o.type = tipo; o.frequency.setValueAtTime(f0, t0); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t0+dur); g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0+.012);
  g.gain.exponentialRampToValueAtTime(.0001, t0+dur); o.connect(g).connect(SND.master); o.start(t0); o.stop(t0+dur+.05); }
function ruido(dur, tipo, freq, vol, delay=0, q=.8){ if (!SND.ctx) return; const C = SND.ctx, t0 = C.currentTime + delay, n = C.createBufferSource(), f = C.createBiquadFilter(), g = C.createGain();
  n.buffer = ruidoBuffer(dur, false); f.type = tipo; f.frequency.value = freq; f.Q.value = q; g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.0001, t0+dur);
  n.connect(f).connect(g).connect(SND.master); n.start(t0); }
const SFX = {
  click: () => tono(1100, 900, .05, "sine", .08),
  papel: () => { ruido(.22, "bandpass", 3200, .22, 0, .7); ruido(.18, "bandpass", 2400, .16, .16, .7); },
  fase: () => { tono(55, 41, 1.6, "sine", .5); tono(440, 440, 1.4, "triangle", .05, .05); tono(659, 659, 1.3, "triangle", .035, .25); },
  ok: () => { tono(660, 660, .16, "sine", .2); tono(990, 990, .28, "sine", .2, .12); },
  parcial: () => { tono(520, 520, .16, "sine", .16); tono(600, 600, .24, "sine", .14, .12); },
  mal: () => { tono(220, 140, .38, "sawtooth", .09); tono(110, 80, .4, "sine", .2); },
  holo: () => { tono(900, 1700, .16, "sine", .1); tono(1300, 2100, .12, "sine", .07, .12); },
  sello: () => { tono(95, 50, .3, "sine", .5); ruido(.12, "lowpass", 1500, .4); },
  golpe: () => { tono(180, 42, .28, "sine", .9); ruido(.05, "lowpass", 1800, .5); }
};
function golpe(){ SFX.golpe(); }
function sfxPaso(h){ if (!SND.ctx || !camera) return; const d = camera.position.distanceTo(h.root.position), v = Math.min(.35, .9/(1+d*.45));
  tono(95, 60, .09, "sine", v); ruido(.07, "lowpass", 700, v*.8); }
function setSonido(on){ SND.on = on; if (SND.master) SND.master.gain.setTargetAtTime(on ? 1 : 0, SND.ctx.currentTime, .05); }

const VOZ = { on:true, sup:("speechSynthesis" in window) && typeof SpeechSynthesisUtterance !== "undefined", voces:[] };
function cargarVoces(){ try { VOZ.voces = speechSynthesis.getVoices().filter(v => /^es/i.test(v.lang)); } catch(e){} }
if (VOZ.sup){ cargarVoces(); try { speechSynthesis.onvoiceschanged = cargarVoces; } catch(e){} }
const PERFIL = { juez:{g:"m",p:.85,r:.95}, laura:{g:"f",p:1.12,r:1.0}, vega:{g:"m",p:1.02,r:1.04}, mora:{g:"f",p:.95,r:1.05},
  carlos:{g:"m",p:1.08,r:.94}, javier:{g:"m",p:.9,r:1.0}, testigo:{g:"m",p:.78,r:.92}, ia:{g:"f",p:1.3,r:1.08}, narrador:{g:"m",p:.72,r:.9} };
const FEM = /(paulina|m[oó]nica|helena|laura|sabina|elvira|marisol|esperanza|soledad|luc[ií]a|elena|carmen|paloma|francisca|ximena|camila|valentina|dalia|renata|isabela|ang[eé]lica|hilda|abril|beatriz|nora|female|mujer|google espa)/i;
const MAS = /(jorge|diego|juan|pablo|ra[uú]l|[aá]lvaro|carlos|enrique|andr[eé]s|gonzalo|jos[eé]|alonso|arnau|gerardo|tom[aá]s|federico|lorenzo|dario|rodrigo|antonio|alberto|manuel|eduardo|jaime|sergio|male\b|hombre)/i;
function vozPara(who){
  const pf = PERFIL[who] || PERFIL.narrador, vs = VOZ.voces; if (!vs.length) return null;
  const pref = l => /es[-_](CR|MX|US|419|CO|AR|CL|PE)/i.test(l) ? 0 : /es[-_]ES/i.test(l) ? 1 : 2;
  let cand = vs.filter(v => pf.g === "f" ? (FEM.test(v.name) && !MAS.test(v.name)) : MAS.test(v.name));
  if (!cand.length) cand = vs.slice();
  cand.sort((a,b) => pref(a.lang) - pref(b.lang));
  const n = [...who].reduce((a,c)=>a+c.charCodeAt(0),0) % Math.min(cand.length, 3);
  return cand[n];
}
function paraVoz(t){
  return t.replace(/₡\s?([\d.]+)/g, (_, n) => { const v = Number(n.replace(/\./g,"")); if (v % 1000000 === 0){ const m = v/1000000; return (m === 1 ? "un millón" : m + " millones") + " de colones"; } return v.toLocaleString("es-CR") + " colones"; })
    .replace(/Licda\./g,"licenciada").replace(/Lic\./g,"licenciado").replace(/[«»]/g,"").replace(/\bF-0(\d+)/g,"factura cero $1").replace(/art\./g,"artículo");
}
function decir(texto, who, cb={}){
  if (!VOZ.on || !VOZ.sup) return false;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(paraVoz(texto)), v = vozPara(who), pf = PERFIL[who] || PERFIL.narrador;
    if (v){ u.voice = v; u.lang = v.lang; } else u.lang = "es-CR";
    u.pitch = pf.p; u.rate = pf.r; u.volume = 1;
    if (cb.start) u.onstart = cb.start; if (cb.end){ u.onend = cb.end; u.onerror = cb.end; } if (cb.boundary) u.onboundary = cb.boundary;
    speechSynthesis.speak(u); return true;
  } catch(e){ return false; }
}
function callar(){ if (VOZ.sup) try { speechSynthesis.cancel(); } catch(e){} }
function desbloquearVoz(){ if (!VOZ.sup) return; try { const u = new SpeechSynthesisUtterance(" "); u.volume = 0; speechSynthesis.speak(u); } catch(e){} }
