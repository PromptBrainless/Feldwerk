# Master-Prompt — Feldwerk HUD / UI / Tools / Seiten

Diesen Prompt in Grok Build / Feldwerk einsetzen.

Quelle: https://chatgpt.com/s/t_6abb8a733d3c81918b0c0b5714e69b60

---

Überarbeite Feldwerk als vollständiges, hochwertiges Interactive-Game-/Creation-Workspace-Interface.

WICHTIG:
Arbeite auf dem bestehenden Projekt aufbauend und ersetze nicht unnötig die vorhandene Architektur.
Analysiere zuerst den vorhandenen Code, die bestehenden Komponenten, Routes, State-Struktur und Assets.
Behalte funktionierende Features bei und verbessere sie.
Keine Fake-Buttons, keine leeren Platzhalterseiten und keine rein dekorativen Mockups.
Jede sichtbare Funktion soll tatsächlich funktionieren oder einen klaren, sinnvoll vorbereiteten Zustand besitzen.

## Wo der Prompt liegt

| Abschnitt | Datei |
| --- | --- |
| Leitentscheidungen, Shell, Modi, HUD | [README.md](./README.md), [kontext-hud.md](./kontext-hud.md) |
| Phasen 1–12 und Quality Bar | [phasenplan.md](./phasenplan.md) |
| Abschnitte 18–35 im Originalwortlaut | [master-prompt-teil-2.md](./master-prompt-teil-2.md) |
| Share-Provenienz | [../quellen/chatgpt-hud-ui-share.md](../quellen/chatgpt-hud-ui-share.md) |

## Abschnitte 1–17 (Arbeitsfassung)

1. **Ziel** — Mischung aus Game Creation Studio, Playground, Mini-Engine, Canvas/Level-Editor, AI Workspace, Asset Hub. Keine gewöhnliche Website.
2. **Visuelle Identität** — vierzackiger Spark, Blau→Violett, leichtes Glow, dunkle ruhige Fläche. Premium creative tool, kein generic AI dashboard, kein Neon-/Glass-Slop.
3. **App Shell** — Topbar + Sidebar + Workspace + Inspector + Statusbar. Mobile: Drawer / Bottom Sheet, Touch ≥ 44px.
4. **Top Bar** — Logo, Szene, Modes PLAY/BUILD/DRAW/WORLD/ASSETS, Undo/Redo/Save/Preview/Settings/Help, Saved/Unsaved/Saving.
5. **Sidebar** — CORE (Play/Build/Draw/World), CREATE, PROJECT, SYSTEM. Collapsible, aktiver Punkt mit Blau/Violett-Akzent.
6. **Command Palette** — Ctrl/Cmd+K. Pages/Tools/Objects/Actions/Assets. Pfeile, Enter, Esc.
7. **Workspace** — PLAY (Pause/Restart/Debug/Fullscreen), DRAW (Pen/Eraser/Select/Move/Shape/Fill/Text), BUILD (Grid/Snap/Transform), WORLD (Scene/Layers/Objects/Environment).
8. **Context Toolbar** — nichts gewählt / ein Objekt / mehrere Objekte. Keine 30 Buttons.
9. **Inspector** — Name/Type, Transform, Appearance, Behavior, Advanced. Leer: Select an object.
10. **Object Creation** — + Add, Klick erzeugt Objekt direkt.
11. **Asset Browser** — Tabs, Search/Filter/Sort, Grid/List, Favorites, DnD.
12. **Scene Manager** — New/Duplicate/Rename/Delete/Reorder/Preview.
13. **Layers** — UI/FX/Objects/Characters/Environment/Background, visibility/lock/reorder.
14. **Search** — Ctrl/Cmd+K und optional `/`.
15. **Settings** — General/Appearance/Controls/Editor/Audio/Performance/Accessibility/Shortcuts.
16. **Shortcuts** — Z/Shift+Z, S, Delete, D, Space, Esc, F, 1–4.
17. **Statusbar** — Ready · Scene/Objects/Selected · Zoom/Grid/FPS.

Originalwortlaut 18–35: [master-prompt-teil-2.md](./master-prompt-teil-2.md).
