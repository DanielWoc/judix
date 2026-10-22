#!/bin/sh
# JUDIX: sirve el juego en http://localhost:8000 y abre el navegador.
cd "$(dirname "$0")" || exit 1
URL=http://localhost:8000
( sleep 1; (command -v open >/dev/null && open "$URL") || (command -v xdg-open >/dev/null && xdg-open "$URL") ) &
echo "JUDIX: sirviendo en $URL (Ctrl + C para detener)"
exec python3 -m http.server 8000
