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

Siehe die 35 Abschnitte im extrahierten Prompt:

1. Ziel — Game Creation Studio / Playground / Mini-Engine / Canvas-Editor / AI Workspace / Asset Hub
2. Visuelle Identität — Spark, Blau→Violett, premium creative tool, keine Neon-/Glass-Slop
3. App Shell — Topbar, Sidebar, Workspace, Inspector, Statusbar
4. Top Bar — Logo, Szene, Modes PLAY/BUILD/DRAW/WORLD/ASSETS, Undo/Redo/Save/Preview/Settings, Save-Status
5. Left Sidebar — CORE / CREATE / PROJECT / SYSTEM, collapsible
6. Command Palette — Ctrl/Cmd+K
7. Main Workspace — PLAY / DRAW / BUILD / WORLD
8. Context Toolbar — progressive disclosure
9. Right Inspector — objektbezogen, collapsible
10. Object Creation — + Add, Click → Objekt im Workspace
11. Asset Browser — Tabs, Search, DnD
12. Scene Manager
13. Layers
14. Search — Ctrl/Cmd+K und /
15. Settings
16. Shortcuts
17. Bottom Status Bar
18. Floating Actions — nur + Add oder Preview
19. Toast System inkl. Undo
20. Modals / Sheets
21. Responsive Design
22. Motion 150–220ms, prefers-reduced-motion
23. Accessibility
24. Empty States
25. Loading / Error States
26. Design Tokens
27. Brand — Spark als Micro-Element
28. AI / Reden — Creative Assistant mit Apply/Cancel
29. Tool System — id/name/icon/shortcut/category/execute/canExecute
30. Performance
31. Mobile first-class
32. Quality Bar — fertiges Produkt, keine Fake-Buttons
33. Phasen 1–12
34. Nicht überdesignen
35. Abschluss-Check

Der vollständige Fließtext der Abschnitte 1–35 steht lokal im Workspace-Artefakt und wird im nächsten Commit 1:1 nachgezogen, falls dieser Platzhalter die Gateway-Grenze trifft.

Arbeitskopie der strukturierten Fassung:
- docs/hud-ui/README.md
- docs/hud-ui/kontext-hud.md
- docs/hud-ui/phasenplan.md
