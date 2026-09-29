# Pivot-Positionen für Gebäude

`T = 64`. Gilt für L001–L020 und alle späteren Haus-Objekte.
Sprite-Ausrichtung in der PNG: Motiv **unten bündig**, **horizontal mittig** (`scale-pad --align bottom-center`).

Zwei Punkte, nie vermischen:

| Name | Sitzt auf | Zweck |
|---|---|---|
| **Sprite-Pivot** | PNG-Pixel | Zeichnen, Sortierung Y, Schatten |
| **Stand-Ursprung** | Kachelraster der Karte | Platzieren, Kollision, Türzelle |

## 1. Sprite-Pivot (immer)

```
pivot_px = width  / 2
pivot_py = height
origin_x = 0.5
origin_y = 1.0
```

Tiled-Objekt: `objectalignment = bottom` (Unterkante Mitte).

## 2. Standfläche

| Klasse | Leinwand | Standard-Stand (Sperr) |
|---|---|---|
| 2×2 | 128×128 | 2×1 Süd |
| 3×2 | 192×128 | 3×1 Süd |
| 3×3 | 192×192 | 3×2 Süd |
| 1×2 Tür | 64×128 | 1×1 Süd |

Stand-Ursprung = Mitte der Süd-Kante.
`tuer_dx` relativ zur Südwest-Kachel. Overlay: `stand_b = 0`.

## 3. L001–L020 (Kurz)

Hütten/Fachwerk klein 2×2 Stand 2×1 Tür 0. Breite Häuser 3×2 Stand 3×1 Tür 1. Mühle/Kirche 3×3 Stand 3×2 Tür 1. Brunnenhaus volle 2×2, keine Tür. Dächer/Fenster Overlay.
