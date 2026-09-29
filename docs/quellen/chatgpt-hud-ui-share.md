# ChatGPT-Share: HUD UI Prompt überarbeiten

- URL: https://chatgpt.com/s/t_6abb8a733d3c81918b0c0b5714e69b60
- Titel: HUD UI Prompt überarbeiten
- Extrahiert: 2026-09-29
- Repo: PromptBrainless/Feldwerk

Der öffentliche Share zeigte eine Assistenten-Antwort (kein mehrteiliger Thread sichtbar). ChatGPT-Chrome (Login, Sidebar, Sources-Footer) wurde entfernt.

## Was übernommen wurde

Der vollständige Master-Prompt (Abschnitte 1–35) liegt in [`docs/hud-ui/master-prompt.md`](../hud-ui/master-prompt.md).

Zusätzliche Schlussfolgerung aus dem Share, die den Prompt ergänzt:

Nicht alle Funktionen permanent sichtbar machen. Bei Feldwerk passt ein **kontextuelles HUD** besser:

- Normal: Select · Draw · Object · Text · Zoom
- Objekt ausgewählt: Move · Rotate · Scale · Duplicate · Delete
- Zeichnen: Pen · Eraser · Shape · Fill · Color
- Play: Pause · Restart · Debug · Fullscreen

Damit bleibt das Spielfeld dominant. Das passt zur vorhandenen Trennung **Spielen / Zeichnen / Reden**.

Ausgearbeitet in [`docs/hud-ui/kontext-hud.md`](../hud-ui/kontext-hud.md).

## Kontext laut Share

- Stack: öffentlicher Grok-App-Builder-Workspace, React / TanStack / Tailwind
- `AGENTS.md` verlangt echte, responsive, im Browser geprüfte UI
- Live war zum Zeitpunkt des Shares reduziert auf Spielfeld + Spielen / Zeichnen / Reden
- Verweise im Share: GitHub-Repo Feldwerk, Live feldwerk.grok.me, Gemini-Referenz
