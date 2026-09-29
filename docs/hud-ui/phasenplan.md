# HUD/UI Implementierungsreihenfolge

Arbeiten auf dem bestehenden TanStack/React/Tailwind-Workspace. Kein Neu-Scaffold.

## Phasen

| Phase | Ziel |
| --- | --- |
| 1 | Bestehende App analysieren (Routes, State, Assets, Live-Modi Spielen/Zeichnen/Reden) |
| 2 | Design Tokens + globale UI-Shell |
| 3 | Sidebar + Topbar + Workspace |
| 4 | Play / Build / Draw / World Modes |
| 5 | Context Toolbar |
| 6 | Inspector |
| 7 | Assets + Scenes + Layers |
| 8 | Command Palette |
| 9 | Settings + Shortcuts |
| 10 | AI Creative Assistant (aus „Reden“) |
| 11 | Mobile Responsive |
| 12 | Animation + Accessibility + Polish |

## Priorität

1. Bedienbarkeit
2. Informationshierarchie
3. visuelle Qualität
4. schnelle Interaktion
5. responsive Verhalten
6. Erweiterbarkeit

## Nicht überdesignen

- lieber 5 wichtige Controls als 20 kleine
- progressive disclosure
- Kontext statt permanente Optionen
- Workspace bleibt Mittelpunkt
- Inspector nur wenn relevant
- Sidebar kann verschwinden
- Toolbars ändern sich abhängig vom Kontext

## Abschluss-Check

Keine Funktion als fertig markieren, wenn sie nur visuell existiert.

1. Desktop prüfen
2. Mobile prüfen
3. jede Navigation testen
4. Command Palette testen
5. Shortcuts testen
6. Add/Create-Flows testen
7. Inspector testen
8. Draw / Build / Play testen
9. Empty States prüfen
10. Error States prüfen
11. Console auf Fehler prüfen
12. Build und Typecheck
13. Abstände, Kontrast, Überladung visuell prüfen

## Quality Bar (AGENTS.md + Master-Prompt)

- `npm run build` und `npm run typecheck` grün
- Browser-QA Desktop + Mobile, keine Console-Fehler
- Empty / Loading / Error States auf jeder Seite
- Keyboard + sichtbarer Focus + ausreichender Kontrast
- prefers-reduced-motion
