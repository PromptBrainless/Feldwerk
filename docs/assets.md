# Assets

473 Einzelbilder unter `src/rpg/assets/dorf/`, geschnitten mit Kachel 64. Volle Bögen liegen nur als Quelle, nicht noch einmal im Ergebnis. Die Leiste darf nie den ganzen Katalog auf einmal einhängen oder dekodieren, sonst hängt die Oberfläche.

## Katalog

`src/rpg/view/dorf.ts` liest die PNGs über `import.meta.glob` ohne `eager`. Die Id ist `300 + Index` der sortierten Pfade. Ein neues Bild in der Mitte verschiebt alle späteren Ids und bricht gespeicherte Karten. Dann `world` in der [Spielwelt](./spielwelt.md) anheben.

`loadDorfSrc(id)` holt eine URL, merkt sie und schreibt sie auf den Pinsel. `bootArt` dekodiert die festen Stock-Bilder, eigene Uploads und nur die Dorf-Ids, die auf der aktuellen Karte liegen. Ein Pinsel wird erst beim Auswählen dekodiert (`ensureBrushImage`).

Stock-Pinsel haben die Ids 200–233 und feste URLs. Eingebaute Böden und Objekte liegen darunter. Boden-Ids ab 100 malen über eigene Bilder. Objekte ab 100 setzen einen Span.

## Gruppen

Der oberste Ordner entscheidet die Palette. Wasser 1×1 ist Boden und blockiert. Größeres Wasser ist Objekt. Rahmen blockieren nicht. Bauteile blockieren, übrige Props nicht.

| Ordner | Palette | Art |
| --- | --- | --- |
| `boden`, Wasser 1×1 | Boden | Boden |
| übriges `wasser` | Wasser | Objekt |
| `natur` | Wald | Objekt, fest |
| `gebaeude` | Häuser | Objekt, fest |
| `moebel` | Möbel | Objekt, fest |
| `figuren` | Figuren | Objekt. Bildnisse reden nicht |
| `ui` | Rahmen | Objekt, nicht fest |
| `bauteile` | Deko | fest |
| `props` | Deko | nicht fest |

Die Palette **Dorf** sind nur die acht eingebauten Dinge (Baum, Busch, Blumen, Fels, Zaun, Haus, Schild, Brunnen). **Alle** ist der Dorfkatalog. **Eigene** sind Uploads.

## Leiste

Im Zeichnen ist **Alle** vorausgewählt. **Mehr** zeigt drei Reihen, auf einem hohen Fenster vier, höchstens zwölf Spalten. **Weniger** ist eine Zeile zum seitlichen Schieben. Es werden nur die Kästchen im Fenster plus eine Überhang-Reihe geladen. Hohe Motive sitzen mit `object-contain` vollständig im Kästchen, sonst sieht man nur den durchsichtigen Kopf und das Feld wirkt leer.

Gruppen filtern weiter. Der Knopf Objekte springt von Boden auf Alle, lässt eine schon gewählte Gruppe aber in Ruhe.

## Dateiname ist nicht das Bild

Einmal gegen die Bögen geprüft. Nicht wieder aus dem Namen setzen.

- Wasser 1×1: 01, 02, 03, 06, 08, 10–12, 14, 15 sind Rohre. 04 ist Kräuseln, 05 und 09 sind Wellen mit durchsichtigem Rand, 07 ist Schilf, 13 sind Steine.
- `figuren_buerger_anim_lauf_1x2` 01, 02, 05–09, 11 sind Bäume. Leute beginnen etwa bei 12 (12 Bauer, 16 Läuferin, 19 und 20 Ältere, 24 Angler).
- `dorf_2x2_128x128_02` ist ein Baum. `dorf_3x4_192x256_01` ist ein Gelände-Atlas.
- Laternen, Schilder, Brunnen: `dorf_1x2_64x128` 02, 04, 06, 09 Laternen, 03 und 05 Schilder, 10 Brunnen. 01 und 07 Kiefer, 08 Laub.
- Tiere: Schaf `figuren_tier_1x1_64x64_01`, Katze `_10`, Huhn `_18`, Kuh `figuren_tier_2x1_128x64_03`.
- Lagerfeuer: `wasser_2x2_128x128_04`.
- Möbel, die die Stube benutzt: Bett `moebel_zimmer_2x2_128x128_01`, Sessel `_03`, Regal `_04`, Sofa `_05`, Kamin `_06`, Uhr `moebel_zimmer_1x1_64x64_08`, Tisch `_09`, Pflanze `_05`, Schrank `moebel_zimmer_1x1_64x64_07`, Herd `moebel_zimmer_3x2_192x128_01`, Kleiderschrank `moebel_haus_1x2_64x128_02`.

Bilder bis 512×512 werden beim Malen mit nächstem Nachbarn gezeichnet, damit die Pixel scharf bleiben.
