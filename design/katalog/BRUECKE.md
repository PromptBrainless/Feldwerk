# Brücke Katalog → Live-App

Die 100 L-IDs sind **Aliase auf vorhandene Dateien**. Keine zweiten PNGs, keine neuen Glob-Ids.

Quelle der Zuordnung: `src/rpg/view/katalog.ts`.
Palette-Gruppe **Leiste** in `Workshop.tsx` hängt die 100 Einträge in die Zeichenleiste.
Beim Anwählen gilt `stand_b` × `stand_s` als Stempel (Kollision). Overlay setzt `solid = false`.
Gemalt wird weiter die Live-Id (`300 + Index` oder Stock 200–233). Gespeicherte Karten bleiben gültig.

## Regel

1. Live-Datei aus `docs/assets.md` und `src/rpg/assets/dorf/` wählen.
2. Papiername nur als Label. `ersatz: true`, wenn der erfundene Dateiname nicht existiert.
3. `dorf_2x2_128x128_02` ist ein Baum — nicht als Haus verwenden.
4. Laternen/Schilder/Brunnen sitzen in `dorf_1x2_64x128` (siehe assets.md).

## Blöcke

| Papier | Live-Gruppe | Typische Dateien |
|---|---|---|
| A Häuser L001–L015 | `haeuser` + Stock 222–224 | `dorf_2x2_128x128_*`, `dorf_3x3`, Stock-Häuser |
| A Teile L016–L020 | `deko` | Props, Steg-Bauteile |
| B Wege L021–L038 | `boden` + `deko` | Erde, Feld, Steg, Schilder |
| C Stadt L039–L056 | `boden` + Laterne/Brunnen | `boden_wege_pflaster_*` |
| D Wald L057–L078 | `boden` / `wald` / Stock-Bäume | Laubweg, `dorf_1x2`, Stumpf |
| E Pflanzen L079–L100 | Overlay-Boden + Feld-Props | Gras, Klee, Farn, Topf |

Pivot-Rechnung bleibt `src/rpg/view/pivot.ts`. Die Zeichenroutine sitzt auf der Südkante.
Inspector (Zeichnen, Desktop) zeigt L-Id, `pivot_px`, Stand, Tür.

Tiled-Atlas unter `design/tiled-export/` bleibt Export-Vorlage. Die App liest ihn nicht.
