# JUDIX · Reglas del proyecto

JUDIX es un videojuego judicial en 3D para el navegador. El jugador es el Juez Woc y resuelve casos de derecho civil costarricense con el apoyo, falible, de una IA jurídica. Estas reglas son obligatorias para cualquier cambio en el repositorio.

## Reglas obligatorias

1. **Idioma.** Todo el contenido visible del juego, los comentarios del código, los mensajes de commit y la documentación se redactan en español de Costa Rica, con trato de **usted**. No use «tú» ni el voseo, salvo en el lema ya aprobado de la portada («PERO LA JUSTICIA DEPENDE DE VOS»), que se conserva tal cual.
2. **Imagen del Juez Woc.** El Juez Woc conserva siempre su imagen: **cabello negro, anteojos rectangulares, traje azul marino y corbata roja**. Esto rige para el modelo con esqueleto `modelos/personajes/juez.glb` (texturas teñidas con `herramientas/texturas.py` y anteojos añadidos por `rigAnteojos()` en `js/personajes.js`), para la figura de respaldo (`H.juez` en `js/motor3d.js`: `hair:0x0f0c0b`, `lentes:true`, `suit:0x1a2546`, `tie:0xb01e2a`), para el retrato `img/juez.jpg` y para cualquier ilustración, modelo o recurso nuevo.
3. **Ningún cambio jurídico sin aprobación.** No se modifica el contenido jurídico sin la aprobación expresa del titular del proyecto. Esa aprobación debe constar antes de editar. Se considera contenido jurídico:
   - todo `js/caso-001.js` (hechos, pretensión, prueba, facturas, opciones, retroalimentación, citas normativas y montos) y los archivos de casos futuros;
   - la puntuación: los puntos de cada opción, la rúbrica `MAX` (30 / 30 / 20 / 10 / 10), la puntuación de la clasificación de facturas (4 puntos por acierto) y los umbrales de `rango()`;
   - los textos del tribunal de apelación en `mostrarApelacion()` y de los rangos en `rango()` (`js/juego.js`).

   Si un cambio técnico obliga a tocar cualquiera de estos elementos, deténgase, explique el motivo y proponga el texto exacto antes de aplicarlo. Las erratas evidentes también se proponen; no se corrigen por cuenta propia.

## Marco jurídico de referencia

El contenido se ajusta al derecho costarricense: Código Civil (Ley N.º 30), Código Procesal Civil (Ley N.º 9342), Código de Comercio (Ley N.º 3284) y Constitución Política. Toda cita normativa nueva debe verificarse contra el texto oficial vigente.

## Estructura

```
index.html          Portada y contenedor del juego; carga estilos y scripts
css/estilos.css     Estilos (tema oscuro único, fiel al afiche)
js/caso-001.js      Caso 001: personajes, facturas, rutas y GUION (contenido jurídico)
js/motor3d.js       Sala, figuras procedimentales de respaldo, tareas del guion y cámaras (Three.js r128)
js/personajes.js    Personajes con esqueleto: carga, animaciones, mirada, boca, parpadeo y gestos
js/vendor/          GLTFLoader y SkeletonUtils de Three.js r128
js/audio.js         Música y efectos (Web Audio) y voces (speechSynthesis)
js/juego.js         Flujo del guion, decisiones, puntuación, apelación e índice final
img/                Logo, afiche, despacho (fondo sin WebGL), retratos y ventana
modelos/            Personajes y animaciones GLB (Microsoft Rocketbox, MIT) y LICENCIAS.md
herramientas/       Guiones de Blender para convertir y teñir modelos
audio/              Audio grabado; hoy todo el sonido es sintetizado
```

## Notas técnicas

- Los archivos de `js/` son **scripts clásicos**, no módulos: comparten el ámbito global y se cargan en este orden: `caso-001` → `motor3d` → `personajes` → `audio` → `juego`. No cambie ese orden ni los convierta en módulos ES sin revisar las dependencias entre archivos.
- Los personajes con esqueleto se cargan desde `modelos/` mientras se muestra la portada. Si no llegan en 20 s, o si falta el cargador GLTF, cada personaje conserva su figura procedimental. No elimine `humano()` de `js/motor3d.js`, porque es el respaldo.
- Al aplicar una animación a un modelo, descarte siempre las pistas de huesos que el modelo no tiene: en Three.js r128 esas pistas se aplican a la raíz del personaje y la desplazan (véase `rigAdaptar()`).
- `modelos/LICENCIAS.md` debe acompañar siempre al juego, porque así lo exige la licencia MIT de Rocketbox.
- Three.js r128 se carga desde cdnjs. Si no hay WebGL o la biblioteca no carga, el juego sigue funcionando con `img/despacho.jpg` de fondo.
- Las rutas de imágenes en JavaScript son relativas a `index.html`; en `css/estilos.css` son relativas a `css/` (`../img/...`).
- El juego debe servirse por HTTP (véase `README.md`). Abierto con doble clic (`file://`), Chrome bloquea las texturas WebGL de `img/`.
- El mejor índice se guarda en `localStorage` con la clave `judix-001`; no la renombre, o se perderán los récords.
- Después de cada cambio, recorra el caso completo en el navegador y confirme que la consola no muestre errores.
