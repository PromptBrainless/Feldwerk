# Feldwerk HUD / UI

Quelle: ChatGPT-Share [HUD UI Prompt überarbeiten](https://chatgpt.com/s/t_6abb8a733d3c81918b0c0b5714e69b60), extrahiert 2026-09-29.

Feldwerk soll sich wie ein **premium creative tool** anfühlen, nicht wie ein generisches AI-Dashboard oder eine Demo-Seite. Workspace bleibt Mittelpunkt. HUD und Inspector erscheinen nur im Kontext.

## Dateien

| Datei | Inhalt |
| --- | --- |
| [master-prompt.md](./master-prompt.md) | Vollständiger Master-Prompt (Abschnitte 1–35) |
| [kontext-hud.md](./kontext-hud.md) | Kontextuelles HUD, Modi, Shortcuts |
| [phasenplan.md](./phasenplan.md) | Implementierungsreihenfolge + Abschluss-Check |
| [../quellen/chatgpt-hud-ui-share.md](../quellen/chatgpt-hud-ui-share.md) | Bereinigtes Share-Original |

## Leitentscheidungen

1. Bestehende Architektur behalten, nicht neu scaffolden.
2. Keine Fake-Buttons, keine leeren Platzhalter, keine dekorativen Mockups.
3. Jede sichtbare Funktion funktioniert oder hat einen klaren, vorbereiteten Zustand.
4. Progressive Disclosure statt permanenter Tool-Flut.
5. Mobile ist kein nachträglicher Breakpoint.

## Bestehende Modi (Live)

Die aktuelle App trennt bereits **Spielen**, **Zeichnen** und **Reden**. Der Master-Prompt erweitert das auf:

`PLAY` · `BUILD` · `DRAW` · `WORLD` · `ASSETS`

„Reden“ wird zum kontextbezogenen Creative Assistant mit Apply/Cancel, keine stillen destruktiven Änderungen.

## App-Shell (Desktop)

```
┌──────────────────────────────────────────────────────────────┐
│ TOP BAR                                                       │
├────────────┼────────────────────────────────┼─────────────────┤
│ Navigation │        MAIN WORKSPACE          │ Inspector       │
│            │                                │ / Context       │
├────────────┴────────────────────────────────┴─────────────────┤
│ TOOLBAR / TIMELINE / STATUS                                   │
└──────────────────────────────────────────────────────────────┘
```

Klein: Sidebar = Drawer, Inspector = Bottom Sheet, Workspace bleibt nutzbar, Touch-Targets ≥ 44px.
