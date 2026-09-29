# Spielwelt

Drei kleine Orte, ein Speicherplatz, Kollision als Farbe. Die Karten stehen in `src/rpg/view/places.ts` und werden über `buildPlace` neu aufgebaut, nicht aus Dateinamen geraten. Welche Bilder wirklich Häuser, Bäume oder Rohre sind: [Assets](./assets.md).

Startzelle aller drei Orte ist `{x: 4, y: 8}`. Die Zelle muss frei bleiben.

## Anger

20×14, Gras. Steinweg auf y = 9 und die Gasse x = 8 von y = 4 bis 10. Der Start liegt auf einem Steinweg-Stück.

Häuser entlang der oberen Kante (von links): `dorf_2x2_128x128_03`, `_05`, das hohe `dorf_2x3_128x192_01`, der Laden `dorf_3x3_192x192_01`, `dorf_2x2_128x128_10`. Brunnen `dorf_1x2_64x128_10` bei (9, 4). Kiefern, Laternen und das Schild säumen den Weg. Bauer, Läuferin und die Ältere stehen am Weg und haben Sprüche. Schaf, Huhn und Kuh stehen auf der Wiese und blockieren nicht.

Weg und Gasse bleiben frei von festen Dingen. `dorf_2x2_128x128_02` ist ein Baum, kein Haus. `dorf_3x4_192x256_01` ist ein Gelände-Atlas und wird nicht gesetzt.

## Teich

18×13. Der Teichkörper ist die deckende Seerose `boden_feld_1x1_64x64_31` (x 7–15, y 1–6) und blockiert. In der Mitte liegen ein paar Wellen (`wasser_1x1_64x64_04`). Steine und Schilf am Rand blockieren, weil sie zur Wasser-Gruppe gehören. Der Steg aus Dielen (y = 7) blockiert nicht. Lagerfeuer `wasser_2x2_128x128_04` bei (1, 2) ist fest. Der Angler steht bei (3, 5). Die Katze auf dem Weg blockiert nicht. Keine Laterne auf die Startzelle setzen.

Wellenkacheln haben durchsichtige Ränder. Blockierender Boden mit eigenem Bild wird deshalb vorher in `#46766f` unterlegt, damit kein Pergament durchscheint.

## Stube

16×12, Parkett. Die Außenkante ist dunkler Ziegel und blockiert. Die Tür (7, 11) und (8, 11) ist Diele und offen. Der Läufer aus Dielen läuft x = 7–8 von y = 3 bis 10. Bett, Schrank, Kamin, Regal, Herd, Uhr, Sofa, Sessel, Hocker, Tisch und eine Person stehen im Raum. Die Pflanze blockiert nicht. Raus geht es nach Süden durch die Tür.

## Kollision

Anstoßen schiebt die Figur nicht mehr in die Wand. `player.bump` ist nur noch ein Blitz von etwa 0,28 Sekunden.

- Die Figur wird für den Blitz sepia und etwas heller.
- Die blockierte Zelle vor ihr füllt sich mit `rgba(214, 84, 72, …)` und blendet aus.
- Im Zeichnen sind blockierte Zellen ein violetter Schleier `rgba(109, 94, 252, 0.32)`. Keine Kreuze.
- Der Knopf **Kollision** (`sim.debug`) legt denselben Schleier im Spiel über alle blockierten Zellen.

Blumen und alles mit `solid: false` (Steg, Rahmen, Wiesen-Tiere) lassen sich durchqueren. Anderer Objekt-Inhalt blockiert, außer der Span sagt `solid: false`. Boden blockiert nur, wenn seine Id in `blockingGrounds` steht oder es das eingebaute Wasser ist.

## Speicher

Ein Slot, `feldwerk-town-v2`, Feld `world: 3`. Ein älterer Stand mit dem Namen Anger, Teich, Stube oder Beispielstadt wird nicht zurückgeladen, damit die neuen Orte nicht von einem alten Entwurf verdeckt werden. Eine selbst umbenannte Karte bleibt erhalten. Ein Ort aus der Leiste baut die Karte neu und überschreibt den Slot.

## Beispielstadt

Der Rücksetzen-Knopf lädt `buildTown()` aus `src/rpg/runtime/town.ts`. Die Logiktests prüfen Kollision, Schildtext und die Spanne des Häuschens. Diese Funktion nicht nebenbei umbauen.
