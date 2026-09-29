# Feldwerk — Projektanweisungen

Gilt zusätzlich zu `AGENTS.md`. Bei UI-Arbeit zuerst die HUD-Doku lesen.

## Produkt

Feldwerk ist ein Interactive-Game-/Creation-Workspace (Playground + Mini-Engine + Canvas/Level-Editor + Asset-Hub + AI-Assistant), kein generisches Dashboard.

Bestehende Live-Modi: **Spielen**, **Zeichnen**, **Reden**. Erweitern, nicht wegwerfen.

## HUD / UI Quelle

- `docs/hud-ui/README.md`
- `docs/hud-ui/master-prompt.md`
- `docs/hud-ui/kontext-hud.md`
- `docs/hud-ui/phasenplan.md`

## Harte Regeln

- Auf bestehendem Code aufbauen. Kein unnötiges Re-Scaffold.
- Keine Fake-Buttons, keine leeren Platzhalterseiten, keine dekorativen Mockups.
- Jede sichtbare Kontrolle funktioniert oder hat einen klaren, vorbereiteten Zustand.
- Workspace bleibt dominant. HUD und Inspector nur kontextuell.
- Progressive Disclosure: lieber 5 Controls als 20.
- Brand: vierzackiger Spark, Blau→Violett, dunkle ruhige Fläche, kein Neon-Slop, kein Glassmorphism-Overkill.
- „Reden“ → Creative Assistant mit Workspace-Kontext und Apply/Cancel. Keine stillen destruktiven Änderungen.
- Mobile von Anfang an: Bottom-Nav, Sheets, Touch ≥ 44px, kein Horizontal-Scroll.
- Auth/DB bleiben aus, solange der User keine Accounts oder geteilte Persistenz verlangt.

## Reihenfolge

Nicht die Phasen 2–12 in einem Turn erzwingen. Nächsten sinnvollen Schritt aus `docs/hud-ui/phasenplan.md` liefern und im Browser prüfen.
