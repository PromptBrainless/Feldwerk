# Leiste L001–L100

Angebunden an die Live-Palette, nicht an die Papiernamen aus dem Chat.

- Code: `src/rpg/view/katalog.ts`
- UI: Zeichnen → Gruppe **Leiste**
- Dokumentation der Zuordnung: `design/katalog/BRUECKE.md`
- Neue Schnitte (noch nicht im Glob): `design/kachel-leiste/` — 233 PNGs, siehe `kontrolltabelle.md`

Die erdachten Dateinamen (`gebaeude_dorf_huette_stroh_…`) existieren nicht im Live-Glob. Jede L-Id zeigt auf eine Datei, die schon unter `src/rpg/assets/dorf/` oder `src/rpg/assets/stock/` liegt.

Neue Schnitte aus den ZIP-Packs gehören nicht in die Mitte des Globs. Erst schneiden, dann ans Ende legen und `world` anheben — siehe [Assets](./assets.md).

## Schnitt 2026-09-29

Houses_Pack, MiniPack, Gentle Trees, Serene Village 32 → 233 Kacheln T=64. Noch nicht importiert. Manifest: `design/kachel-leiste/MANIFEST.txt`.

## Was nicht in die App gehört

Die Imagine-Runden (Lindendorf-HUD, Android-Editor, Kachelwerk) sind keine Referenz. Quelle für die Oberfläche bleibt diese Werkstatt und [stand.md](./stand.md).
