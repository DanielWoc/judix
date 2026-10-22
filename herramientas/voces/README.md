# Voces neuronales de JUDIX (Azure AI Speech)

`generar_voces.mjs` crea un archivo MP3 por cada línea hablada del guion, con voces neuronales de Costa Rica:

- **es-CR-JuanNeural** para los hombres (Juez Woc, Lic. Vega, Carlos, Javier, el testigo y el narrador).
- **es-CR-MariaNeural** para las mujeres (Laura Méndez, Licda. Mora y la IA jurídica).

Cada personaje tiene su propio tono y su propia velocidad (tabla `PERFILES`), de modo que quienes comparten voz se distinguen. El programa también guarda en `audio/voces/indice.json` el instante de cada palabra y los visemas (posiciones de la boca). El juego usa esos datos para que el texto avance al ritmo de la voz y para mover la boca del personaje.

## Requisitos

- Node.js 18 o superior.
- Un recurso de **Azure AI Speech** (portal de Azure → *Crear un recurso* → *Speech*). Copie una de sus claves y su región.

## La clave nunca se guarda en el proyecto

El programa lee la clave **solo** de variables de entorno y no la escribe en disco ni en la consola. No la ponga en ningún archivo del repositorio. El `.gitignore` excluye además los archivos `.env` por si acaso. Los MP3 generados no contienen la clave, así que publicarlos con el juego es seguro.

## Uso

Desde esta carpeta (`herramientas/voces`):

```
npm install
```

**Windows (PowerShell):**
```
$env:AZURE_SPEECH_KEY = "su-clave"
$env:AZURE_SPEECH_REGION = "eastus"
node generar_voces.mjs
```

**Windows (símbolo del sistema):**
```
set AZURE_SPEECH_KEY=su-clave
set AZURE_SPEECH_REGION=eastus
node generar_voces.mjs
```

**macOS o Linux:**
```
export AZURE_SPEECH_KEY="su-clave"
export AZURE_SPEECH_REGION="eastus"
node generar_voces.mjs
```

Escriba la región de su propio recurso en lugar de `eastus`. Las variables duran mientras la terminal esté abierta.

| Opción | Efecto |
|---|---|
| *(ninguna)* | Genera solo las líneas nuevas o modificadas y reutiliza las demás. |
| `--todo` | Regenera todas las líneas. Úselo después de cambiar la tabla `PERFILES`. |
| `--listar` | Muestra cada línea y su SSML, sin llamar a Azure. |
| `--simular` | Crea audios sintéticos en `audio/voces-simuladas/` (excluida de Git) para probar la integración sin gastar cuota. |

El guion completo suma unos 2 000 caracteres de texto. Al final, el programa elimina los audios de líneas que ya no existen.

## Cuándo regenerar

Después de cualquier cambio aprobado en los textos de `js/caso-001.js`, ejecute el programa otra vez. Mientras una línea no tenga audio, el juego la pronuncia con la voz del navegador, de modo que nada se rompe.

Los anuncios de fase y los títulos del tribunal de apelación reproducen las plantillas de `mostrarFase()` y `mostrarApelacion()` (`js/juego.js`). Si esos textos cambian, actualice también la función `lineasDelGuion()`.
