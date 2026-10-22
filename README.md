# JUDIX

**Justicia, lógica y súper inteligencia.** Videojuego judicial en 3D para el navegador. Usted es el Juez Woc y resuelve casos de derecho civil costarricense con el apoyo de una IA jurídica que no siempre tiene razón.

Caso disponible: **Caso 001 · La casa en disputa**.

## Cómo abrir el juego

El juego debe abrirse desde un pequeño servidor local. Si abre `index.html` con doble clic, el navegador bloquea las texturas 3D.

**Windows:** haga doble clic en `iniciar-windows.bat`.
**macOS o Linux:** en una terminal, dentro de esta carpeta, ejecute `./iniciar-mac-linux.sh`.

Ambos lanzadores levantan el servidor en `http://localhost:8000` y abren el navegador. Para detenerlo, cierre la ventana de la terminal o pulse `Ctrl + C`.

Si prefiere hacerlo a mano, use cualquiera de estas opciones dentro de la carpeta del proyecto:

```
python -m http.server 8000     (o: py -m http.server 8000 en Windows)
npx serve -l 8000              (si tiene Node.js)
```

Luego abra `http://localhost:8000` en Chrome, Edge o Firefox. Se requiere conexión a internet para las fuentes y para Three.js.

## Estructura

Véase `CLAUDE.md`, que también contiene las reglas del proyecto.
