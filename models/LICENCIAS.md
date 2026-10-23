# Licencias de los recursos 3D

## Personajes y animaciones: Microsoft Rocketbox

Los modelos de `models/personajes/` y las animaciones de `models/animaciones/` se derivan de la biblioteca **Microsoft Rocketbox**
(https://github.com/microsoft/Microsoft-Rocketbox), publicada por Microsoft bajo licencia MIT. Son personajes ficticios de catálogo.
Se convirtieron de FBX a GLB, se redujeron sus texturas a 1024 px y se conservaron solo algunas expresiones faciales.
En el Juez Woc se tiñeron el traje (azul oscuro), la camisa (celeste), la corbata (roja) y el cabello (negro); los anteojos se añaden por código.

| Personaje | Avatar original |
|---|---|
| Juez Woc | Professions/Business_Male_03 |
| Juez del jugador | Professions/Business_Male_01 (corbata teñida de azul) |
| Jueza del jugador | Professions/Business_Female_03 |
| Laura Méndez | Professions/Business_Female_01 |
| Técnico del jugador | Professions/Business_Male_02 |
| Técnica del jugador | Adults/Female_Adult_09 |
| Magistrados | Adults/Male_Adult_03, Professions/Business_Female_02, Professions/Business_Male_04 |
| Abogado y abogada | Professions/Business_Male_05, Professions/Business_Female_04 |
| Partes | Adults/Male_Adult_07, Adults/Male_Adult_08 |
| Testigo | Professions/Construction_Male_01 |
| Público | Adults/Male_Adult_02, Adults/Male_Adult_13, Adults/Female_Adult_07, Adults/Female_Adult_11 |

Actores de las audiencias de prueba (archivos `a_*.glb`): Adults/Female_Adult_01, 02, 05, 13, 14, 15 y 17; Adults/Male_Adult_01, 04, 05, 06, 10 y 14;
Professions/Business_Male_06 y 07; Professions/Construction_Male_02.

Animaciones: m_walk_neutral_01, m_sit_down_chair_01, m_sit_stand_up_chair_01, m_idle_neutral_01, f_idle_neutral_01,
m_sit_chair_idle_neutral_01, f_sit_chair_idle_neutral_01, m_gestic_talk_neutral_01, f_gestic_talk_neutral_01, m_sit_chair_gestic_thoughtful.
Señalar, entregar y golpear el mazo se generan por código sobre el esqueleto.

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
