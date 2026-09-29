# Brücke Katalog → Live-App

Die 100 L-IDs sind **Aliase**, keine zweiten PNGs.

Live-Quelle bleibt `src/rpg/assets/dorf/` + `dorf.ts` (`id = 300 + Index`).
Neue Dateien in der Mitte verschieben gespeicherte Karten — deshalb hängt dieser Katalog nichts in den Glob.

| Papier | Live |
|---|---|
| Block A Häuser | Palette-Gruppe `haeuser` |
| Block B Wege | Gruppe `boden` |
| Block C Stadt | Gruppe `boden` + `deko` |
| Block D Wald | Gruppe `wald` |
| Block E Pflanzen | Gruppe `wald` / `deko`, Overlay wenn nicht fest |

Pivot-Rechnung: `src/rpg/view/pivot.ts`.
Zeichnen: `engine.ts` setzt das Sprite bereits auf die Südkante (`objectalignment=bottom`).
Inspector (Zeichnen, Desktop) zeigt `pivot_px`, Stand, Tür.
