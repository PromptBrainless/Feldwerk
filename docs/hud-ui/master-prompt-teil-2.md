# Master-Prompt (Teil 2) — Abschnitte 18–35

Fortsetzung von [master-prompt.md](./master-prompt.md)

==================================================
18. FLOATING ACTIONS
==================================================

Nur wirklich wichtige Aktionen dürfen floating sein.

Beispiel:

       + Add

oder:

       ▶ Preview

Floating UI darf niemals wichtige Inhalte verdecken.

==================================================
19. TOAST SYSTEM
==================================================

Implementiere dezente Toasts:

Saved
Object created
Deleted
Copied
Scene duplicated

Keine riesigen Notifications.

Auto-dismiss.

Undo Action anbieten, wenn sinnvoll:

"Object deleted — Undo"

==================================================
20. MODALS / SHEETS
==================================================

Modals sollen klein und fokussiert sein.

Für komplexere Inhalte:

Side Sheet
Bottom Sheet
Full page

Nicht alles als Modal bauen.

==================================================
21. RESPONSIVE DESIGN
==================================================

Desktop:

Sidebar + Workspace + Inspector

Tablet:

Sidebar collapsible
Inspector collapsible

Mobile:

Bottom navigation:

Play
Build
Draw
Assets
More

Inspector als Bottom Sheet.

Workspace maximal groß halten.

Kein horizontales Scrollen.

==================================================
22. MOTION
==================================================

Animationen subtil.

150–220ms für normale UI transitions.

Keine unnötigen Animationen.

Verwende Motion für:

- panel open
- modal
- hover
- selected state
- toast
- object creation
- command palette

Respect:

prefers-reduced-motion

==================================================
23. ACCESSIBILITY
==================================================

Alle Controls:

- keyboard erreichbar
- sichtbarer focus state
- aria-labels
- sinnvolle tooltips
- ausreichender Kontrast

Icons niemals als einzige Information verwenden, wenn der Kontext unklar ist.

==================================================
24. EMPTY STATES
==================================================

Jede leere Ansicht soll einen sinnvollen nächsten Schritt zeigen.

Beispiel:

NO SCENES

"Create your first scene"

[New Scene]

NO ASSETS

"Add an asset or create one"

[Add Asset]

NO SELECTION

"Select an object to inspect it"

==================================================
25. LOADING / ERROR STATES
==================================================

Keine weißen/leeren Flächen.

Loading:

Skeleton oder dezenter Spinner.

Error:

klare Fehlermeldung
+
Retry

==================================================
26. DESIGN TOKENS
==================================================

Erstelle zentrale Design Tokens.

Beispiel:

--bg
--surface
--surface-elevated
--border
--text
--text-muted
--accent
--accent-secondary
--danger
--success

Radius:

klein bis mittel.

Keine extrem runden Cards überall.

Spacing:

4 / 8 / 12 / 16 / 24 / 32

Typography:

moderne UI-Schrift,
hohe Lesbarkeit,
kompakte Labels,
klare Hierarchie.

==================================================
27. BRAND
==================================================

Das vorhandene Feldwerk-Symbol soll nicht einfach irgendwo als großes Logo stehen.

Verwende es intelligent:

- App icon
- favicon
- loading mark
- empty-state mark
- active AI/creative indicator
- subtle transition

Gradient:

blue → violet

Glow nur sehr dezent.

==================================================
28. AI / "REDEN"
==================================================

Die bestehende "Reden"-Funktion soll zu einem echten Creative Assistant ausgebaut werden.

Nicht als gewöhnlicher Chat.

AI kann Kontext aus dem aktuellen Workspace erhalten:

Scene
Selected Object
Assets
Layers
Current Mode

Beispiele:

"Mach den Spieler schneller."

"Erstelle drei Plattformen."

"Ändere den Hintergrund."

"Erstelle eine zweite Szene."

"Warum funktioniert dieses Objekt nicht?"

AI-Antworten sollen Aktionen als überprüfbare Vorschläge darstellen.

Beispiel:

AI
"Ich kann die Geschwindigkeit auf 8 erhöhen."

[Apply] [Cancel]

Keine stillen destruktiven Änderungen.

==================================================
29. TOOL SYSTEM
==================================================

Baue Tools modular.

Jedes Tool soll besitzen:

id
name
icon
shortcut
category
description
execute()
canExecute()

Beispiele:

select
move
draw
erase
text
shape
duplicate
delete
zoom
pan

Damit später weitere Tools ohne UI-Umbau hinzugefügt werden können.

==================================================
30. PERFORMANCE
==================================================

UI muss sich sofort anfühlen.

Vermeide:

- unnötige rerenders
- riesige component trees
- unnötige state duplication
- heavy effects
- permanent animations

Workspace darf auch bei vielen Objekten benutzbar bleiben.

==================================================
31. MOBILE
==================================================

Mobile ist kein nachträglicher Breakpoint.

Design mobile bewusst:

- große Touch Targets
- Bottom navigation
- Bottom sheets
- compact toolbar
- gesture-friendly canvas
- no tiny desktop controls

==================================================
32. QUALITY BAR
==================================================

Die App muss sich wie ein fertiges Produkt anfühlen.

Nicht:

"hier sind ein paar Buttons"

sondern:

"hier ist ein konsistentes kreatives Werkzeug."

Jede Seite braucht:

- klare Navigation
- sinnvolle Empty States
- Loading State
- Error State
- funktionierende Interaktionen
- responsive Layout
- Keyboard Support

==================================================
33. IMPLEMENTIERUNGSREIHENFOLGE
==================================================

Arbeite in dieser Reihenfolge:

PHASE 1
Bestehende App analysieren.

PHASE 2
Design Tokens + globale UI-Shell.

PHASE 3
Sidebar + Topbar + Workspace.

PHASE 4
Play / Build / Draw / World Modes.

PHASE 5
Context Toolbar.

PHASE 6
Inspector.

PHASE 7
Assets + Scenes + Layers.

PHASE 8
Command Palette.

PHASE 9
Settings + Shortcuts.

PHASE 10
AI Creative Assistant.

PHASE 11
Mobile Responsive.

PHASE 12
Animation + Accessibility + Polish.

==================================================
34. WICHTIG: NICHT ÜBERDESIGNEN
==================================================

Die größte Gefahr ist UI-Überladung.

Deshalb:

- lieber 5 wichtige Controls als 20 kleine
- progressive disclosure
- Kontext statt permanente Optionen
- Workspace bleibt Mittelpunkt
- Inspector nur wenn relevant
- Sidebar kann verschwinden
- Toolbars ändern sich abhängig vom Kontext

Die App soll ruhig und professionell wirken.

==================================================
35. ABSCHLUSS-CHECK
==================================================

Nach der Implementierung:

1. gesamte App auf Desktop prüfen
2. mobile Ansicht prüfen
3. jede Navigation testen
4. Command Palette testen
5. Shortcuts testen
6. Add/Create flows testen
7. Inspector testen
8. Draw/Build/Play testen
9. Empty States prüfen
10. Error States prüfen
11. Console auf Fehler prüfen
12. Build und Typecheck ausführen
13. visuell auf Abstände, Kontrast und Überladung prüfen

Keine Funktion als "fertig" markieren, wenn sie nur visuell existiert.

Ziel:

Feldwerk soll wie ein eigenständiges, hochwertiges Creative Tool wirken — nicht wie eine Demo-Seite.
