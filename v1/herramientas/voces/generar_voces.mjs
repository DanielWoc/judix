// JUDIX · Generador de voces neuronales con Azure AI Speech (español de Costa Rica).
//
// Produce un MP3 por cada línea hablada del guion y el índice audio/voces/indice.json, con los tiempos de cada
// palabra (para que el texto avance al ritmo de la voz) y los visemas (para mover la boca del personaje).
//
// Uso (desde esta carpeta, después de `npm install`):
//   node generar_voces.mjs              genera solo las líneas nuevas o modificadas
//   node generar_voces.mjs --todo       regenera todas las líneas
//   node generar_voces.mjs --listar     muestra las líneas y el SSML, sin llamar a Azure
//   node generar_voces.mjs --simular    crea audios sintéticos en audio/voces-simuladas/ para probar la integración
//
// La clave se lee SOLO de variables de entorno y nunca se escribe en disco ni en la consola:
//   AZURE_SPEECH_KEY     clave del recurso de Azure AI Speech
//   AZURE_SPEECH_REGION  región del recurso (por ejemplo, eastus)

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ARGS = new Set(process.argv.slice(2));
const SIMULAR = ARGS.has("--simular"), LISTAR = ARGS.has("--listar"), TODO = ARGS.has("--todo");
const SALIDA = path.join(RAIZ, "audio", SIMULAR ? "voces-simuladas" : "voces");

/* Voz y tono de cada personaje. Juan para los hombres y María para las mujeres; el tono (pitch) y la
   velocidad (rate) distinguen a quienes comparten voz. Ajuste aquí y regenere con --todo. */
const PERFILES = {
  juez:     { voz:"es-CR-JuanNeural",  tono:"-8%",  velocidad:"-6%" },   // grave y pausado
  vega:     { voz:"es-CR-JuanNeural",  tono:"+3%",  velocidad:"+7%" },   // ágil, persuasivo
  carlos:   { voz:"es-CR-JuanNeural",  tono:"+7%",  velocidad:"-3%" },   // afligido
  javier:   { voz:"es-CR-JuanNeural",  tono:"-3%",  velocidad:"+2%" },   // firme
  testigo:  { voz:"es-CR-JuanNeural",  tono:"-14%", velocidad:"-8%" },   // maestro de obras, voz ronca
  narrador: { voz:"es-CR-JuanNeural",  tono:"-18%", velocidad:"-10%" },  // anuncios de fase y del tribunal
  laura:    { voz:"es-CR-MariaNeural", tono:"+6%",  velocidad:"+2%" },   // cordial
  mora:     { voz:"es-CR-MariaNeural", tono:"-4%",  velocidad:"+6%" },   // enérgica
  ia:       { voz:"es-CR-MariaNeural", tono:"+12%", velocidad:"+4%" }    // asistente artificial, timbre más agudo
};

/* --- Líneas del guion --- */
// Se leen de js/caso-001.js sin modificarlo. Los anuncios de fase y de apelación reproducen el texto que
// arma js/juego.js (mostrarFase y mostrarApelacion); si allí cambia, actualice también estas plantillas.
// Una línea sin audio no rompe nada: el juego usa la voz del navegador.
function lineasDelGuion(){
  const codigo = fs.readFileSync(path.join(RAIZ, "js", "caso-001.js"), "utf8");
  const { GUION } = vm.runInNewContext(codigo + "\n;({ GUION, P })", { Math, Number, String, Intl });
  const NUMS = ["", "uno", "dos", "tres", "cuatro"], L = new Map();
  const agregar = (who, texto) => { const k = who + "|" + texto; if (!L.has(k)) L.set(k, { who, texto, clave:k }); };
  for (const e of GUION){
    if (e.t === "fase") agregar("narrador", `Fase ${NUMS[e.n]}. ${e.tit}.`);
    if (e.t === "dlg") agregar(e.who, e.txt);
    if (e.t === "ia") agregar("ia", e.msg);
  }
  ["El tribunal confirma su sentencia", "El tribunal modifica su sentencia", "El tribunal revoca su sentencia"].forEach(t => agregar("narrador", t + "."));
  return [...L.values()];
}

/* --- Texto hablado --- */
// Convierte el texto visible en texto para la voz (montos, abreviaturas, facturas) y guarda la correspondencia
// de posiciones, para saber qué parte del texto visible se ha dicho en cada palabra.
const REGLAS = /₡\s?([\d.]+)|Licda\.|Lic\.|[«»]|\bF-0(\d+)|art\./g;
function hablado(texto){
  const tramos = []; let dicho = "", i = 0;
  const pegar = (a, b, s) => { tramos.push({ v0:a, v1:b, h0:dicho.length, h1:dicho.length + s.length, literal:s === texto.slice(a, b) }); dicho += s; };
  for (const m of texto.matchAll(REGLAS)){
    if (m.index > i) pegar(i, m.index, texto.slice(i, m.index));
    let s;
    if (m[0].startsWith("₡")){ const v = Number(m[1].replace(/\./g, "")); s = v % 1000000 === 0 ? (v === 1000000 ? "un millón" : v/1000000 + " millones") + " de colones" : v + " colones"; }
    else if (m[0] === "Licda.") s = "licenciada";
    else if (m[0] === "Lic.") s = "licenciado";
    else if (m[0] === "«" || m[0] === "»") s = "";
    else if (m[0].startsWith("F-0")) s = "efe " + ("0" + m[2]).split("").join(" ");   // código de factura, cifra por cifra
    else s = "artículo";
    pegar(m.index, m.index + m[0].length, s); i = m.index + m[0].length;
  }
  if (i < texto.length) pegar(i, texto.length, texto.slice(i));
  // Posición en el texto hablado -> posición final correspondiente en el texto visible.
  const aVisible = h => { for (const t of tramos) if (h <= t.h1 && h >= t.h0) return t.literal ? t.v0 + (h - t.h0) : t.v1; return texto.length; };
  return { dicho, aVisible };
}
const escaparXml = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function ssml(who, dicho){
  const p = PERFILES[who] || PERFILES.narrador;
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="es-CR">`
    + `<voice name="${p.voz}"><prosody pitch="${p.tono}" rate="${p.velocidad}">${escaparXml(dicho)}</prosody></voice></speak>`;
}
// Nombre de archivo estable: personaje + huella FNV-1a del texto.
function nombreArchivo(l, ext){
  let h = 0x811c9dc5; for (const b of Buffer.from(l.clave, "utf8")){ h ^= b; h = Math.imul(h, 0x01000193) >>> 0; }
  return `${l.who}-${h.toString(16).padStart(8, "0")}.${ext}`;
}
// Ubica cada palabra pronunciada dentro del texto hablado (en orden) y la traduce a posición visible.
function alinearPalabras(eventos, dicho, aVisible){
  const bajo = dicho.toLocaleLowerCase("es"), out = []; let cursor = 0;
  for (const { ms, palabra } of eventos){
    const j = bajo.indexOf(palabra.toLocaleLowerCase("es"), cursor); if (j < 0) continue;
    cursor = j + palabra.length; out.push([Math.round(ms), aVisible(cursor)]);
  }
  return out;
}

/* --- Síntesis con Azure --- */
async function sintetizarAzure(sdk, config, xml){
  const sint = new sdk.SpeechSynthesizer(config, null), palabras = [], visemas = [];
  sint.wordBoundary = (_, e) => { if (e.boundaryType === sdk.SpeechSynthesisBoundaryType.Word) palabras.push({ ms:e.audioOffset/10000, palabra:e.text }); };
  sint.visemeReceived = (_, e) => visemas.push([Math.round(e.audioOffset/10000), e.visemeId]);
  try {
    const r = await new Promise((ok, ko) => sint.speakSsmlAsync(xml, ok, ko));
    if (r.reason !== sdk.ResultReason.SynthesizingAudioCompleted){
      const d = sdk.CancellationDetails.fromResult(r); throw new Error(`síntesis cancelada (${d.reason}): ${d.errorDetails}`);
    }
    return { audio:Buffer.from(r.audioData), dur:Math.round(r.audioDuration/10000), palabras, visemas };
  } finally { sint.close(); }
}
// Audio sintético para pruebas: un pulso modulado por palabra, con tiempos y visemas verosímiles.
function sintetizarSimulado(dicho){
  const SR = 16000, palabras = [], visemas = [], muestras = []; let t = 120;
  const sil = ms => { for (let i=0;i<ms*SR/1000;i++) muestras.push(0); t += ms; };
  sil(120);
  for (const m of dicho.matchAll(/[\p{L}\p{N}]+/gu)){
    const dur = 90 + m[0].length * 55; palabras.push({ ms:t, palabra:m[0] });
    for (let v=0; v<Math.ceil(dur/90); v++) visemas.push([Math.round(t + v*90), [2,6,8,21,19,4][(m.index+v) % 6]]);
    for (let i=0;i<dur*SR/1000;i++){ const x = i/SR, env = Math.sin(Math.PI*i/(dur*SR/1000)) * (.55 + .45*Math.sin(2*Math.PI*7*x));
      muestras.push(env * .35 * (Math.sin(2*Math.PI*140*x) + .5*Math.sin(2*Math.PI*280*x) + .25*Math.sin(2*Math.PI*560*x))); }
    t += dur; sil(/[.,;:!?]/.test(dicho[m.index + m[0].length] || "") ? 260 : 70);
  }
  const datos = Buffer.alloc(44 + muestras.length*2);
  datos.write("RIFF",0); datos.writeUInt32LE(36 + muestras.length*2,4); datos.write("WAVEfmt ",8); datos.writeUInt32LE(16,16); datos.writeUInt16LE(1,20); datos.writeUInt16LE(1,22);
  datos.writeUInt32LE(SR,24); datos.writeUInt32LE(SR*2,28); datos.writeUInt16LE(2,32); datos.writeUInt16LE(16,34); datos.write("data",36); datos.writeUInt32LE(muestras.length*2,40);
  muestras.forEach((s,i) => datos.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(s*32767))), 44 + i*2));
  return { audio:datos, dur:Math.round(muestras.length/SR*1000), palabras, visemas };
}

/* --- Programa principal --- */
async function main(){
  const lineas = lineasDelGuion();
  if (LISTAR){ for (const l of lineas){ const { dicho } = hablado(l.texto); console.log(`\n[${l.who}] ${l.texto}\n${ssml(l.who, dicho)}`); } console.log(`\n${lineas.length} líneas.`); return; }

  let sdk = null, config = null;
  if (!SIMULAR){
    const clave = process.env.AZURE_SPEECH_KEY, region = process.env.AZURE_SPEECH_REGION;
    if (!clave || !region){
      console.error("Faltan las variables de entorno AZURE_SPEECH_KEY y AZURE_SPEECH_REGION. Véase herramientas/voces/README.md.");
      process.exit(1);
    }
    sdk = (await import("microsoft-cognitiveservices-speech-sdk")).default;
    config = sdk.SpeechConfig.fromSubscription(clave, region);
    config.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3;
  }

  fs.mkdirSync(SALIDA, { recursive:true });
  const rutaIndice = path.join(SALIDA, "indice.json");
  const previo = fs.existsSync(rutaIndice) ? JSON.parse(fs.readFileSync(rutaIndice, "utf8")).lineas || {} : {};
  const indice = {}; let hechas = 0, reusadas = 0, fallidas = 0;

  for (const l of lineas){
    const archivo = nombreArchivo(l, SIMULAR ? "wav" : "mp3"), anterior = previo[l.clave];
    if (!TODO && anterior && anterior.archivo === archivo && fs.existsSync(path.join(SALIDA, archivo))){ indice[l.clave] = anterior; reusadas++; continue; }
    const { dicho, aVisible } = hablado(l.texto);
    let r = null;
    for (let intento = 1; intento <= 3 && !r; intento++){
      try { r = SIMULAR ? sintetizarSimulado(dicho) : await sintetizarAzure(sdk, config, ssml(l.who, dicho)); }
      catch (e){ console.warn(`  intento ${intento} fallido para [${l.who}]: ${e.message || e}`); await new Promise(ok => setTimeout(ok, 1500 * intento)); }
    }
    if (!r){ fallidas++; continue; }
    fs.writeFileSync(path.join(SALIDA, archivo), r.audio);
    indice[l.clave] = { archivo, dur:r.dur, palabras:alinearPalabras(r.palabras, dicho, aVisible), visemas:r.visemas };
    hechas++; console.log(`✓ [${l.who}] ${l.texto.slice(0, 70)}${l.texto.length > 70 ? "…" : ""} (${(r.dur/1000).toFixed(1)} s)`);
  }

  // Elimina audios de líneas que ya no existen en el guion.
  const vigentes = new Set(Object.values(indice).map(e => e.archivo));
  for (const f of fs.readdirSync(SALIDA)) if (/\.(mp3|wav)$/.test(f) && !vigentes.has(f)) fs.unlinkSync(path.join(SALIDA, f));
  fs.writeFileSync(rutaIndice, JSON.stringify({ version:1, generado:new Date().toISOString(), lineas:indice }));
  console.log(`\nListo: ${hechas} generadas, ${reusadas} reutilizadas, ${fallidas} fallidas. Índice: ${path.relative(RAIZ, rutaIndice)}`);
  if (fallidas) process.exitCode = 1;
}
main().catch(e => { console.error("Error:", e.message || e); process.exit(1); });
