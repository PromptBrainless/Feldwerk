# Leiste L001–L100

Angebunden an die Live-Palette, nicht an die Papiernamen aus dem Chat.

- Code: `src/rpg/view/katalog.ts`
- UI: Zeichnen → Gruppe **Leiste**
- Dokumentation der Zuordnung: `design/katalog/BRUECKE.md`

Die erdachten Dateinamen (`gebaeude_dorf_huette_stroh_…`) existieren nicht. Jede L-Id zeigt auf eine Datei, die schon unter `src/rpg/assets/dorf/` oder `src/rpg/assets/stock/` liegt.

Neue Schnitte aus den ZIP-Packs gehören nicht in die Mitte des Globs. Erst schneiden, dann ans Ende legen und `world` anheben — siehe [Assets](./assets.md).

## Was nicht in die App gehört

Die Imagine-Runden (Lindendorf-HUD, Android-Editor, Kachelwerk) sind keine Referenz. Quelle für die Oberfläche bleibt diese Werkstatt und [stand.md](./stand.md).
