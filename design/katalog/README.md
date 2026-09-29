# Katalog-Scherben

Die 100er-Dateien waren zu groß für den GitHub-Connector (~45–50 KB plus TSX).

| Datei vorher | Last |
|---|---|
| kachel-leiste-100.json | 45 KB, 100 Items in einem Blob |
| tiled-export/atlas.json | 50 KB, davon `missing[]` mit 100 Namen |
| objekte_64.tsx | 41 KB, 61 Tiles |
| boden_64.tsx | 12 KB, 39 Tiles |
| artifacts/rendered/ | 1.2 MB Screenshots, nicht versionieren |
| artifacts/.tmp/ | 148 KB MCP-Dumps |

Jetzt: ein Block = eine Datei, unter 10 KB.

- A Häuser L001–L020
- B Wege L021–L038
- C Stadt L039–L056
- D Wald L057–L078
- E Pflanzen L079–L100

Zusammenfügen: `python3 design/katalog/join.py`
