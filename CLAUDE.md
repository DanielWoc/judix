# JUDIX — instrucciones permanentes para Claude Code

JUDIX es un videojuego docente de simulación judicial civil costarricense (Código Procesal Civil, Ley 9342).
Autor: MSc. Wálther Obando Corrales. Todo el juego vive en `index.html` (raíz del repositorio; publicado en https://danielwoc.github.io/judix/). La versión anterior está archivada en `v1/` (HTML + CSS + JS en un solo archivo)
y usa imágenes de `img/`. Los modelos 3D nuevos van en `models/`.

## Estructura de index.html
- **Pantallas:** `#registro` (perfil: juez, jueza, técnico, técnica + nombre), `#portada` (centro de carrera, catálogo, trayectoria), `#juego` (sala 3D con HUD y capas de diálogo/hoja).
- **Contenido:** `GUION001` (Caso 001, fases A–F, SALA DE CASACIÓN), `GUION002` (Caso 002, desahucio, TRIBUNAL DE APELACIÓN), `RAPIDOS` (18 casos de despacho rápido), `TEC` (8 expedientes de la carrera técnica).
- **Motor 3D (three.js r128 UMD):** `humano(o)` construye cada personaje con primitivas; `M` guarda todos los modelos (`M.woc`, `M.juezM`, `M.juezF`, `M.laura`, `M.tecM`, `M.tecF`, `M.mag[]`); `H` contiene los alias que usa el guion (`H.juez` = estrado, `H.laura` = escritorio, `H.vega`, `H.mora`, `H.carlos`, `H.javier`, `H.testigo`); `HUM` es la lista que se anima en `tick()`.
- **Interfaz de cada personaje (NO romper):** `h.root`, `h.head`, `h.queue`, `h.task`, `h.pose` (`think`, `point`, `give`, `gavel`), `h.talking`, `h.sit/sitT`, `h.walk/walkT`, `h.x/h.z/h.rot/h.rotT`, `h.home`. Las tareas (`stand`, `sit`, `walk`, `face`, `pick`, `give`, `point`, `gavel`, `show`, `hide`, `folderDesk`) se procesan en `tarea(h, dt)`; la animación en `animarHumano(h, dt, t)`.
- **Reparto por carrera:** `elenco3D()` decide quién ocupa el estrado (jugador o Juez Woc) y el escritorio (Laura o el jugador). `modoTribunal(org)` muestra los tres magistrados.
- **Personajes realistas:** cada personaje de `humano(o)` recibe, si carga, un modelo con esqueleto de `models/personajes/*.glb` (Microsoft Rocketbox, MIT; véase `models/LICENCIAS.md`), montado dentro de `h.root`; la figura procedimental queda como respaldo. El reparto está en `rigReparto()`; las animaciones (`models/animaciones/`) se aplican en `animarRig()`. Al aplicar un clip, descarte las pistas de huesos que el modelo no tiene (`rigAdaptar()`): en three r128 se aplicarían a la raíz. Para regenerar modelos, véase `herramientas/`.
- **Audiencia y práctica de pruebas (juicios rápidos con audiencia):** `AUDIENCIAS` (juicios p01 a p08) y su motor (`mostrarProtocolo`, `mostrarReconocimiento`, `ESCENARIOS`, `elencoAudiencia`) están antes de «INICIO DE PARTIDAS». Cada juicio define su reparto (`elenco`: puesto → modelo y género de voz), sus nombres y sus pasos. Orden ordinario de la prueba (art. 41.4 CPC): reconocimiento, declaraciones de parte, peritos y testigos. El reconocimiento judicial (art. 46) nunca da por demostrados hechos históricos. La categoría `prb` («Dirección y práctica de la prueba») se suma a la nota de 100 puntos. El «giro inesperado» del Juicio 03 aparece al azar; `?giro=1` o `?giro=0` lo fuerzan para pruebas. **El contenido de los ocho juicios fue aprobado por el autor el 23 de octubre de 2026; cualquier cambio jurídico posterior requiere su aprobación.**
- **Inicio y anuncios:** al abrir el juego se muestra una portada con dos opciones: «Entrar al juego» (registro o centro de carrera) y «Galería de anuncios». Los anuncios nunca se reproducen solos; la galería (`ANUNCIOS`: videos `video/intro-1..3`, MP4 con respaldo WebM, e imágenes) muestra miniaturas de `img/anuncios/` y abre el elegido en un visor. También se accede desde el botón «Anuncios» del centro de carrera.
- **Portadas de los casos:** `img/casos/<id>.webp` (c001, c002, p01–p08, r01–r18), listadas en `PORTADAS`; se muestran arriba de cada tarjeta del catálogo sin alterar el resto de su información.
- **LexAi:** usa SIEMPRE las capas originales `img/lexai-torso.webp`, `img/lexai-brazo-izq.webp`, `img/lexai-brazo-der.webp` y el rostro SVG de `lexHTML()`. No sustituirlo por otro robot.
- **Voces:** `PERFIL` (síntesis del navegador). El género de la voz depende del perfil, nunca del nombre.

## Reglas que no se negocian
1. No inventar artículos, jurisprudencia ni requisitos procesales. No cambiar el contenido jurídico de los casos sin que el autor lo pida.
2. Órganos revisores: usar exclusivamente «TRIBUNAL DE APELACIÓN» y «SALA DE CASACIÓN». JUDIX es un juego independiente, sin respaldo institucional.
3. Juez Woc: hombre blanco, cabello negro lacio peinado con raya a un lado, anteojos, traje entero azul oscuro, camisa celeste y corbata roja.
4. Personajes ficticios: no reproducir el rostro de personas reales ni de personajes conocidos.
5. Conservar el pie de autoría, la bandera de Costa Rica, los lemas y la identidad gráfica.
6. Si se publica como artefacto de Claude: scripts externos solo desde cdnjs.cloudflare.com o cdn.jsdelivr.net/npm con versión exacta (por ejemplo `three@0.128.0`); cada archivo binario ≤ 15 MB.

## Cómo probar
El juego debe servirse por HTTP (no abrir con doble clic). Desde esta carpeta: `npx serve .` o `python -m http.server 8000`, y abrir http://localhost:8000.
Antes de terminar cualquier cambio: abrir el juego, registrar un perfil, jugar un expediente de cada carrera y revisar la consola del navegador sin errores.
