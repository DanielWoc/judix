# Audio

- `voces/`: voces neuronales de Costa Rica (Azure AI Speech), un MP3 por línea del guion, más `indice.json` con los tiempos de cada palabra y los visemas. Se generan con `herramientas/voces/generar_voces.mjs` (véase su README).
- La música y los efectos se sintetizan en `js/audio.js` con Web Audio.

Si `voces/` no existe o le falta una línea, el juego usa la síntesis de voz del navegador para esa línea.
