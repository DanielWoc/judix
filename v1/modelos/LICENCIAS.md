# Licencias de los recursos 3D

## Personajes y animaciones: Microsoft Rocketbox

Los modelos de `modelos/personajes/` y las animaciones de `modelos/animaciones/` se derivan de la biblioteca
**Microsoft Rocketbox** (https://github.com/microsoft/Microsoft-Rocketbox), publicada por Microsoft bajo licencia MIT.
Los archivos se convirtieron de FBX a GLB; se redujeron sus texturas y se conservaron solo algunas expresiones faciales.
En el Juez Woc se tiñeron el traje (azul marino) y el cabello (negro), y se le añadieron anteojos rectangulares por código.

| Personaje | Avatar original |
|---|---|
| Juez Woc | Professions/Business_Male_01 |
| Lic. Andrés Vega | Professions/Business_Male_05 |
| Licda. Sofía Mora | Professions/Business_Female_04 |
| Laura Méndez | Professions/Business_Female_01 |
| Carlos Rojas Solano | Adults/Male_Adult_07 |
| Javier Rojas Solano | Adults/Male_Adult_08 |
| Eliécer Campos | Professions/Construction_Male_01 |
| Público | Adults/Male_Adult_02, Adults/Male_Adult_13, Adults/Female_Adult_07, Adults/Female_Adult_11 |

| Animación | Clip original |
|---|---|
| caminar | m_walk_neutral_01 |
| sentarse / levantarse | m_sit_down_chair_01 / m_sit_stand_up_chair_01 |
| reposo_h / reposo_m | m_idle_neutral_01 / f_idle_neutral_01 |
| sentado_h / sentada_m | m_sit_chair_idle_neutral_01 / f_sit_chair_idle_neutral_01 |
| hablar_h / hablar_m | m_gestic_talk_neutral_01 / f_gestic_talk_neutral_01 |
| pensar_h | m_sit_chair_gestic_thoughtful |

El golpe del mazo, el gesto de señalar y la entrega del expediente se generan por código sobre el esqueleto (`js/personajes.js`).

Texto de la licencia, que debe conservarse en toda copia del juego:

```
MIT License

Copyright (c) 2020 Microsoft

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Three.js

`js/vendor/GLTFLoader.js` y `js/vendor/SkeletonUtils.js` provienen de Three.js r128 (licencia MIT); el texto está en `js/vendor/LICENSE-three.txt`.
