# Kontextuelles HUD

Nicht alle Funktionen permanent sichtbar machen. Das Spielfeld bleibt dominant; das HUD erscheint nur, wenn es gebraucht wird.

## Toolbar-Kontexte

### Normal (nichts ausgewählt)

`Select` · `Draw` · `Object` · `Text` · `Zoom`

### Objekt ausgewählt

`Move` · `Rotate` · `Scale` · `Duplicate` · `Delete` · `Lock`

### Mehrere Objekte

`Group` · `Align` · `Distribute` · `Duplicate` · `Delete`

### Zeichnen

`Pen` · `Eraser` · `Shape` · `Fill` · `Color`

### Play

`Pause` · `Restart` · `Debug` · `Fullscreen`

## Workspace-Modi

| Modus | Inhalt | Overlay |
| --- | --- | --- |
| PLAY | Große interaktive Vorschau | nur Pause / Restart / Debug / Fullscreen |
| DRAW | Canvas | Pen, Eraser, Select, Move, Shape, Fill, Text, Undo, Redo |
| BUILD | Editor | Grid, Snap, Select, Move, Duplicate, Delete, Rotate, Scale |
| WORLD | Navigation | Scene, Layers, Objects, Environment |

## Sidebar-Gruppen

- **CORE:** Play, Build, Draw, World
- **CREATE:** Objects, Characters, Terrain, Effects, Audio, Text
- **PROJECT:** Scenes, Assets, Templates, History
- **SYSTEM:** Search, Settings, Shortcuts

Collapsed = nur Icons. Aktiv = subtiler Blau/Violett-Hintergrund + Akzentlinie.

## Inspector

Kontextabhängig, Sektionen collapsible:

- Name, Type
- Position X/Y, Size W/H, Rotation
- Appearance: Opacity, Color, Border
- Behavior: Collision, Physics, Interaction
- Advanced: ID, Layer, Visibility, Lock

Ohne Auswahl: „Select an object“ + Shortcuts.

## Statusleiste

- Links: Ready
- Mitte: Scene, Objects-Count, Selected-Count
- Rechts: Zoom, Grid, optional FPS

## Floating

Nur `+ Add` oder `▶ Preview`. Darf den Workspace nicht verdecken.

## Shortcuts (Kern)

| Taste | Aktion |
| --- | --- |
| Ctrl/Cmd + K | Command Palette |
| / | Suche (optional) |
| Ctrl/Cmd + Z | Undo |
| Ctrl/Cmd + Shift + Z | Redo |
| Ctrl/Cmd + S | Save |
| Delete | Auswahl löschen |
| Ctrl/Cmd + D | Duplizieren |
| Space | Pan / temporäre Aktion |
| Esc | Modal schließen / abbrechen |
| F | Fullscreen / Workspace fokussieren |
| 1 / 2 / 3 / 4 | Play / Build / Draw / World |

## Tool-Vertrag

Jedes Tool hat `id`, `name`, `icon`, `shortcut`, `category`, `description`, `execute()`, `canExecute()`. Neue Tools ohne UI-Umbau anschließbar.

## Mobile

- Bottom Nav: Play, Build, Draw, Assets, More
- Inspector als Bottom Sheet
- große Touch-Targets, compact toolbar, gesture-friendly canvas
- kein horizontales Scrollen
