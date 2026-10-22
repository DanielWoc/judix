# Modelos 3D

- `personajes/`: un archivo GLB por personaje, con esqueleto (Biped `Bip01`) y expresiones faciales para la boca y el parpadeo.
- `animaciones/`: un archivo GLB por clip, solo con el esqueleto; `js/personajes.js` los aplica a cada personaje.
- `LICENCIAS.md`: procedencia y licencia (MIT, Microsoft Rocketbox). Debe acompañar siempre al juego.

Todo modelo del Juez Woc debe conservar su imagen: cabello negro, anteojos rectangulares, traje azul marino y corbata roja.

Para regenerar o agregar personajes, use los guiones de `herramientas/` (requieren el módulo `bpy` de Blender 4.2 con Python 3.11):

1. `texturas.py <repositorio_rocketbox> <salida>`: reduce las texturas y aplica la paleta del Juez Woc.
2. `convertir_avatar.py <avatar>_facial.fbx <texturas> <salida.glb> 1`: convierte un avatar a GLB.
3. `convertir_anim.py <clip>.fbx <salida.glb> <nombre> <paso>`: convierte un clip y elimina pistas faciales, de escala y de posición, salvo las de la cadera.

Si un modelo no carga, el juego usa la figura procedimental de `js/motor3d.js`.
