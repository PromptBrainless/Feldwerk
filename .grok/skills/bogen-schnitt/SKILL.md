---
name: bogen-schnitt
description: >
  Schneidet hochgeladene Bögen (Spritesheets, Tilesets, Objekt- und UI-Bögen)
  und einzelne Grafiken in eigene PNG-Dateien. Basiskachel T = 64 px, ein
  Maßstab pro Bogen, Ordnerhierarchie, Benennung, Kontrolltabelle. Nutzen,
  sobald Bilddateien zum Zerlegen, Zuschneiden oder Einsortieren kommen, oder
  der Nutzer „Start“ schreibt. Vor „Start“ nichts speichern.
metadata:
  short-description: "Bögen und Einzelbilder in 64-px-PNGs schneiden"
user-invocable: false
---

# Bogen-Schnitt

Jedes erkannte Asset wird eine eigene PNG. Nichts bleibt nur ein Vorschlag.
Originale bleiben unverändert in `_quellen/`.

Beginne erst, wenn der Nutzer **Start** schreibt. Davor nur Schritt 1 (Analyse)
und dann warten. Bei Unklarheit fragen, bevor du speicherst. Eine Datei nach
der anderen, jeweils Abschluss bestätigen.

## Parameter (fest)

- Basiskachel **T = 64 px**, einheitlich für alle Assets.
- Skalierung: **Lanczos**, gleiche Methode für alle Assets.
- Transparenter Rand um Objekte: **offen**. Steht er noch auf `[X]`, vor dem
  ersten Schnitt nachfragen. Nicht raten.
- Projektname: **offen**. Steht er noch auf `[ ]`, vor dem ersten Schnitt
  nachfragen. Ausgabe liegt unter `/[Projektname]/`.

## Einzelbilder

- Jedes erkannte Asset wird als eigene PNG gespeichert, auch Varianten,
  Animationsframes und Teile.
- Bereits einzelne Bilder (kein Bogen) laufen durch dieselbe Verarbeitung:
  einordnen, auf die Größenklasse bringen, umbenennen, ablegen.
- Es wird nichts nur vorgeschlagen. Am Ende existiert für jedes Asset eine Datei.
- „Einzelbilder“ heißt nicht, dass der komplette Bogen zusätzlich ins Ergebnis
  kommt. Der Bogen bleibt nur in `_quellen/`.

## Ordnerhierarchie

`/[Projektname]/[kategorie]/[unterkategorie]/.../[größenklasse]/`

Größenordner heißt `[Kacheln]_[BxH]`, zum Beispiel `1x2_64x128`.

Vorgegebene Struktur, Beispiele:

- `figuren/humanoide/beruf/(baecker, wache, schmied, haendler, bauer, fischer, wirt, heiler, priester …)`
- `figuren/humanoide/(buerger, adel, abenteurer, held, fremde_voelker, schurken)`
- `figuren/(tiere, monster, fabelwesen, portraits)`
- `boden/`, `natur/`, `gebaeude/`, `bauteile/`, `moebel/`, `props/`, `items/`, `wasser/`, `technik/`, `effekte/`, `hintergruende/`, `ui/`
- `_quellen/`, `_unklar/`

Passt kein Ordner, lege einen neuen auf der passenden Ebene an und melde ihn
in der Kontrolltabelle. Im Zweifel `_unklar/`.

## Größenklassen (T = 64)

- Kacheln (Boden, Wasser, Texturen): exakt **64×64**.
- Objekte (Möbel, Bäume, Häuser, Bauteile, Props): Vielfaches von 64.
  1×1 = 64×64, 1×2 = 64×128, 2×2 = 128×128, 3×3 = 192×192.
  Motiv proportional skalieren, unten bündig und horizontal mittig auf
  transparenter Leinwand (Standfläche muss stimmen).
- Figuren: einheitlicher Rahmen pro Klasse. Menschen 1×2 = 64×128. Große
  Monster 2×2 oder 3×3.
- UI: eigene Maße ohne Rasterbindung. Rahmen und Buttons 9-Slice-tauglich
  zuschneiden.
- Maßstab pro Bogen: Faktor aus der Kachelgröße des Bogens
  (Kachel im Original → 64 px). Dieselbe Skalierung auf alle Objekte dieses
  Bogens. Danach auf das nächste Kachelvielfache mit Transparenz auffüllen.
- Passt ein Motiv nicht in die Klasse, kommt es in die nächstgrößere.
  Niemals quetschen oder verzerren.
- Enthält ein Bogen keine Kacheln als Maßstab, den Faktor vorschlagen und auf
  Bestätigung warten. Nicht schneiden.

## Schritt 1 — Analyse (nichts speichern)

Pro Datei:

- Dateiname, Bildgröße in px, Hintergrundart (schwarz, einfarbig, Muster, transparent).
- Kachelgröße im Original und berechneter Skalierungsfaktor.
- Liste aller erkannten Assets: Arbeitsname, Typ, Zielordner, Größenklasse, Position (Zeile/Spalte).
- Geplante Schnittlogik und Unsicherheiten.

Danach warten. Nicht schneiden.

## Schritt 2 — Schnitt

- Ein Asset = eine PNG. Nichts weglassen, nichts erfinden, nichts nachzeichnen.
- Kacheln: rechteckig lassen, exakt zuschneiden, keine Nachbarpixel, keine Hintergrundreste.
- Objekte, Figuren, UI: freistellen (Hintergrund weg, sauberer Alpha-Rand, keine Halos), nichts abschneiden.
- Schlagschatten nur behalten, wenn er zum Asset gehört, und dann in der Tabelle melden.
- Zusammengehörige Teile (Haus mit Anbau, Küchenzeile, Zaun) als ein Asset, außer der Nutzer sagt etwas anderes.
- Animationsreihen und Varianten: Reihenfolge links nach rechts, oben nach unten. Jeder Frame eine eigene Datei.
- Keine Farbänderung, kein Weichzeichnen. Lanczos nur für die Skalierung auf die Größenklasse.

## Schritt 3 — Benennung

`[kategorie]_[unterkategorie]_[motiv]_[BxH]_[nr].png`

- Kleinbuchstaben, keine Leerzeichen, keine Umlaute (ä=ae, ö=oe, ü=ue, ß=ss).
- Nummer zweistellig, pro Motiv fortlaufend.
- Farbvarianten und Zustände im Motivnamen (`bett_gruen`, `tuer_offen`).
- Animationen: `..._anim_[aktion]_[richtung]_[frame].png`, in ihrer Kategorie.

Beispiel: `figuren_baecker_mann_64x128_01.png`

## Schritt 4 — Kontrolle

Tabelle: Dateiname | Ordner | Größenklasse | Pixelgröße | Quelldatei | Position im Bogen.

Prüfen:

- Anzahl Ausgabedateien = Anzahl erkannter Assets
- keine doppelten Namen
- keine leeren oder abgeschnittenen PNGs
- alle Kacheln exakt 64×64
- alle Objekte Vielfache von 64

Auffälligkeiten melden (Überlappungen, unscharfe Kanten, Hintergrundreste,
unklare Zuordnung, neu angelegte Ordner), statt zu raten.

Alles als ZIP mit der Ordnerstruktur liefern.

## Regeln

- Bei Unklarheit fragen, bevor du speicherst.
- Eine Datei nach der anderen, jeweils Abschluss bestätigen.
- Gleiches Schema für alle Dateien, auch über mehrere Bögen hinweg.

## Bekannte Quellen

Neun Bögen, schwarzer oder gemusterter Grund, noch nicht geschnitten. Reihenfolge,
eine Datei nach der anderen. Die nächste beginnt erst nach Abschluss der vorigen.

| Schritt | Datei | Inhalt | Schnitt |
|---|---|---|---|
| 1 | `1000143568.jpg` | Böden, natur | jede Kachel 64×64, nur Boden |
| 2 | `1000143569.jpg` | Böden, Wege | endlose Flächen als Kachel. Stege und Brücken sind Bauteile, nicht Boden |
| 3 | `1000143567.jpg` | Böden, Feld | nur die Flächen. Untere Reihe (Kiste, Fass, Ofen, Pflanzkasten, Laterne) nicht in diesem Schritt |
| 4 | `1000143561.jpg` | Dorf außen | nur Bäume, Büsche, Häuser. Zaun, Bogen, Laterne, Brunnen, Schild später |
| 5 | `1000143567.jpg` untere Reihe | Deko | die fünf Props, einzeln, mit Fläche |
| 6 | `1000143562.jpg` | Möbel | ein Zimmer: Bett, Stuhl, Tisch, Schrank, Tür. Rest dieses Bogens danach |
| 7 | `1000143560.jpg` | Möbel, Haus | erst nach Schritt 6 |
| 8 | `1000143564.jpg` | Wasser | eine ruhige Wellenkachel. Wasserfall, Eis, Ufer, Rohre, Angler, Feuer später, jeder Frame eine Datei |
| 9 | `1000143563.jpg` | Figuren | Laufstreifen: nur die Vorderansicht, ein Frame. Brustbilder nach `figuren/portraits/`, nicht auf die Karte |
| 10 | `1000143565.jpg` | UI | Rahmen und Knöpfe, 9-Slice, nie in die Pinselleiste |

Maßstab dieser Bögen ist noch nicht gemessen. Erst in Schritt 1 der Analyse, aus der
Kachel des jeweiligen Bogens. Kein Schnitt vor **Start**, und nicht bevor Rand und
Projektname gesetzt sind.
