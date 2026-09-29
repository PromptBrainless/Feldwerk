# Ist-Stand

Pause nach der ersten spielbaren Werkstatt. Kein Ersatz für den [HUD-Master-Prompt](./hud-ui/master-prompt.md). Das hier ist, was die App wirklich tut.

## Live

- Modi **Spielen**, **Zeichnen**, **Reden**. Reden liest den Spruch der Zelle vor der Figur (Leertaste, Enter, E, oder der Knopf auf dem Handy). Der Creative Assistant mit Apply/Cancel ist nicht gebaut.
- Drei Orte in der Leiste: Anger, Teich, Stube. Details in [Spielwelt](./spielwelt.md).
- Zeichenpalette mit Gruppen, **Alle** (473 Dorfbilder, nur der sichtbare Ausschnitt) und **Leiste** (L001–L100 als Aliase). Regeln in [Assets](./assets.md) und [Katalog](./katalog.md).
- Dunkle Fläche, vierzackiger Spark, Akzent Blau→Violett (`#6d5efc` / `#c4b5fd`). Die Karte selbst bleibt warm (`#f4efe4`).
- Kollision im Spiel ist ein kurzer Farbblitz, kein Wegschieben. Im Zeichnen ein violetter Schleier, keine Kreuze. Siehe [Spielwelt](./spielwelt.md).
- Speichern lokal, ein Slot, `world: 3`. Auth und Datenbank sind aus.
- Beispielstadt bleibt der Testort hinter dem Rücksetzen-Knopf. `buildTown()` nicht umbauen, die Logiktests hängen daran.

## Schnittkacheln (noch nicht im Glob)

233 PNGs T=64 unter `design/kachel-leiste/` (Houses_Pack, MiniPack, Gentle, Serene). Kontrolle: `design/kachel-leiste/kontrolltabelle.md`. Nicht in die Mitte von `src/rpg/assets/dorf/` schieben.

## HUD-Phasen

Quelle der Reihenfolge: [phasenplan.md](./hud-ui/phasenplan.md). Nicht alles auf einmal nachziehen.

| Phase | Stand |
| --- | --- |
| 1 Analyse | erledigt, diese Notiz |
| 2 Tokens und Shell | dunkle Tokens, Spark, Kopfzeile |
| 3 Sidebar, Topbar, Workspace | nur Kopfzeile und Fußzeile, keine Sidebar |
| 4 Play / Build / Draw / World | Spielen und Zeichnen. Kein World-Modus, kein Build-Modus |
| 5 Kontext-Leiste | Zeichenwerkzeuge nur im Zeichnen, Spielknöpfe nur im Spielen |
| 6 Inspector | Zellenkarte rechts, ab mittlerer Breite |
| 7 Assets, Szenen, Ebenen | Palette und drei Orte. Kein Szenen- oder Ebenen-Manager |
| 8 Befehlspalette | nicht angefangen |
| 9 Einstellungen | nicht angefangen. Tasten 1, 2, F, P gelten |
| 10 Assistent | nicht angefangen. Reden bleibt Gespräch |
| 11 Mobil | Leiste, Steuerkreuz, Reden. Kein Extra-Menü |
| 12 Feinschliff | nicht angefangen |

## Tasten

| Taste | Wirkung |
| --- | --- |
| WASD, Pfeile | laufen. A verringert x, D erhöht x |
| Leertaste, Enter, E | Spruch der Zelle vor der Figur |
| 1 / 2 | Spielen / Zeichnen |
| F | Vollbild |
| P | Pause. Nur Bewegung, die Karte rutscht nicht |

Pause, Neu starten, Kollision und Vollbild liegen im Spiel oben rechts. Maße (Kartengröße, Auflösung, Objektfläche) ist im Zeichnen zugeklappt.
