import { GroundId, ObjectId, type TownMap } from "../runtime/types.ts";
import { inBounds, isBlocked, normalizeMap, setTile, syncCollision, writeSpan } from "../runtime/tilemap.ts";
import { START } from "../runtime/town.ts";
import { dorfBrush } from "./dorf.ts";
import type { StockBrush } from "./stock.ts";

export type PlaceId = "stadt" | "kammer" | "anger" | "teich" | "stube";

export const PLACES: { id: PlaceId; label: string }[] = [
  { id: "stadt", label: "Stadt" },
  { id: "kammer", label: "Kammer" },
  { id: "anger", label: "Anger" },
  { id: "teich", label: "Teich" },
  { id: "stube", label: "Stube" },
];

const taken = new WeakMap<TownMap, Set<string>>();

function brush(fileName: string): StockBrush {
  const found = dorfBrush(fileName);
  if (!found) throw new Error(`Bild fehlt: ${fileName}`);
  return found;
}

function blank(id: string, name: string, width: number, height: number, floor: string): TownMap {
  const groundTile = brush(floor);
  const cells = width * height;
  const map: TownMap = {
    formatVersion: 1,
    id,
    name,
    tileSize: 64,
    width,
    height,
    layers: [
      { name: "ground", width, height, tiles: Array(cells).fill(groundTile.id) },
      { name: "objects", width, height, tiles: Array(cells).fill(ObjectId.none) },
      { name: "collision", width, height, tiles: Array(cells).fill(0) },
    ],
    messages: {},
    spans: {},
    blockingGrounds: [GroundId.water],
  };
  if (groundTile.solid) map.blockingGrounds.push(groundTile.id);
  return map;
}

function blockGround(map: TownMap, fileName: string) {
  const tile = brush(fileName);
  if (!map.blockingGrounds.includes(tile.id)) map.blockingGrounds.push(tile.id);
}

function ground(map: TownMap, x: number, y: number, fileName: string) {
  const tile = brush(fileName);
  if (tile.solid && !map.blockingGrounds.includes(tile.id)) map.blockingGrounds.push(tile.id);
  setTile(map, "ground", x, y, tile.id);
  syncCollision(map, x, y);
}

function fill(map: TownMap, x0: number, y0: number, x1: number, y1: number, fileName: string) {
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) ground(map, x, y, fileName);
  }
}

function claim(map: TownMap, x: number, y: number, w: number, h: number, fileName: string) {
  let cells = taken.get(map);
  if (!cells) {
    cells = new Set();
    taken.set(map, cells);
  }
  for (let iy = y; iy < y + h; iy += 1) {
    for (let ix = x; ix < x + w; ix += 1) {
      if (!inBounds(map, ix, iy)) throw new Error(`Außerhalb: ${fileName} ${ix},${iy}`);
      const key = `${ix},${iy}`;
      if (cells.has(key)) throw new Error(`Überlappung: ${fileName} auf ${key}`);
      cells.add(key);
    }
  }
}

function prop(map: TownMap, x: number, y: number, fileName: string, solid: boolean, text?: string) {
  const tile = brush(fileName);
  claim(map, x, y, tile.w, tile.h, fileName);
  writeSpan(map, x, y, { id: tile.id, w: tile.w, h: tile.h, solid });
  if (!text) return;
  for (let iy = y; iy < y + tile.h; iy += 1) {
    for (let ix = x; ix < x + tile.w; ix += 1) map.messages[`${ix},${iy}`] = text;
  }
}

function portal(map: TownMap, x: number, y: number, to: PlaceId) {
  map.exits = map.exits ?? {};
  map.exits[`${x},${y}`] = to;
}

function finish(map: TownMap) {
  normalizeMap(map);
  if (isBlocked(map, START.x, START.y)) throw new Error(`${map.name}: Start ist zu`);
  return map;
}

function stadt(): TownMap {
  const map = blank("stadt", "Stadt", 24, 16, "boden_lichtung_gras_1x1_64x64_01.png");
  fill(map, 0, 2, 3, 4, "boden_lichtung_gras_1x1_64x64_02.png");
  fill(map, 6, 2, 14, 4, "boden_lichtung_gras_1x1_64x64_03.png");
  fill(map, 15, 2, 21, 4, "boden_lichtung_gras_1x1_64x64_02.png");
  fill(map, 4, 0, 5, 8, "boden_wege_erde_1x1_64x64_04.png");
  fill(map, 0, 9, 23, 15, "boden_stadt_pflaster_1x1_64x64_01.png");
  fill(map, 8, 11, 14, 13, "boden_stadt_pflaster_1x1_64x64_02.png");
  fill(map, 16, 12, 20, 14, "boden_stadt_pflaster_1x1_64x64_04.png");
  ground(map, 0, 9, "boden_stadt_pflaster_1x1_64x64_10.png");
  ground(map, 23, 9, "boden_stadt_pflaster_1x1_64x64_10.png");
  ground(map, 0, 15, "boden_stadt_pflaster_1x1_64x64_05.png");
  ground(map, 23, 15, "boden_stadt_pflaster_1x1_64x64_05.png");
  ground(map, 1, 9, "boden_wege_holz_1x1_64x64_01.png");
  ground(map, 2, 9, "boden_wege_holz_1x1_64x64_01.png");
  portal(map, 1, 9, "kammer");
  portal(map, 2, 9, "kammer");

  for (const x of [0, 2, 6, 8, 10, 12, 14, 16, 18, 20, 22]) {
    const file =
      x % 8 === 0
        ? "natur_waldrand_hecke_2x2_128x128_01.png"
        : x % 8 === 2
          ? "natur_waldrand_hecke_2x2_128x128_02.png"
          : x % 8 === 4
            ? "natur_waldrand_hecke_2x2_128x128_03.png"
            : "natur_waldrand_hecke_2x2_128x128_04.png";
    prop(map, x, 0, file, true);
  }
  prop(map, 22, 4, "natur_waldrand_hecke_2x2_128x128_02.png", true);
  prop(map, 22, 6, "natur_waldrand_hecke_2x2_128x128_03.png", true);
  prop(map, 22, 8, "natur_waldrand_hecke_2x2_128x128_04.png", true);
  prop(map, 22, 10, "natur_waldrand_hecke_2x2_128x128_01.png", true);
  prop(map, 22, 12, "natur_waldrand_hecke_2x2_128x128_02.png", true);

  prop(map, 1, 5, "gebaeude_haus_serene_2x4_128x256_06.png", true, "Das rote Häuschen. Die Holzschwelle davor öffnet die Kammer.");
  prop(map, 7, 5, "gebaeude_haus_serene_3x4_192x256_04.png", true, "Frischer Putz. Nach Norden geht es durch die Lichtung in den Wald.");
  prop(map, 11, 5, "gebaeude_haus_serene_4x4_256x256_09.png", true, "Grünes Dach, grauer Sockel.");
  prop(map, 16, 5, "gebaeude_haus_serene_5x4_320x256_10.png", true, "Das blaue Haus steht am Waldrand.");
  prop(map, 2, 3, "props_pflanze_1x1_64x64_01.png", false);
  prop(map, 6, 3, "props_pflanze_1x1_64x64_12.png", false);
  prop(map, 8, 2, "props_pflanze_2x2_128x128_22.png", true);
  prop(map, 13, 2, "props_pflanze_2x2_128x128_26.png", true);
  prop(map, 19, 3, "props_pflanze_1x1_64x64_16.png", false);
  prop(map, 9, 4, "props_pflanze_1x1_64x64_09.png", false);
  prop(map, 6, 10, "dorf_1x2_64x128_03.png", true, "Stadt. Links auf die Holzschwelle treten, dann bist du in der Kammer.");
  prop(map, 8, 11, "figuren_buerger_anim_lauf_1x2_64x128_16.png", true, "Das Pflaster ist neu. Hinter den Hecken fängt der Wald an.");
  prop(map, 12, 13, "figuren_tier_1x1_64x64_01.png", false, "Das Schaf bleibt auf dem Pflaster.");
  prop(map, 18, 12, "figuren_tier_1x1_64x64_18.png", false);
  return finish(map);
}

function kammer(): TownMap {
  const map = blank("kammer", "Kammer", 16, 12, "boden_natur_parkett_a_1x1_64x64_01.png");
  const wall = "boden_natur_ziegel_dunkel_1x1_64x64_01.png";
  blockGround(map, wall);
  fill(map, 0, 0, 15, 0, wall);
  fill(map, 0, 11, 15, 11, wall);
  fill(map, 0, 0, 0, 11, wall);
  fill(map, 15, 0, 15, 11, wall);
  fill(map, 4, 8, 5, 11, "boden_natur_dielen_1x1_64x64_01.png");
  portal(map, 4, 11, "stadt");
  portal(map, 5, 11, "stadt");

  prop(map, 1, 1, "moebel_zimmer_pflanze_1x2_64x128_02.png", true, "Die Palme steht am Fenster.");
  prop(map, 3, 1, "moebel_zimmer_pflanze_1x1_64x64_03.png", false);
  prop(map, 6, 1, "moebel_zimmer_pflanze_1x1_64x64_07.png", false);
  prop(map, 8, 1, "moebel_zimmer_pflanze_2x2_128x128_11.png", true, "Der Farn will feucht bleiben.");
  prop(map, 11, 1, "moebel_zimmer_pflanze_2x2_128x128_02.png", true);
  prop(map, 13, 1, "moebel_zimmer_pflanze_2x1_128x64_03.png", true);
  prop(map, 1, 5, "moebel_zimmer_pflanze_1x2_64x128_09.png", true);
  prop(map, 3, 5, "moebel_zimmer_pflanze_1x1_64x64_03.png", false);
  prop(map, 8, 5, "moebel_zimmer_pflanze_1x1_64x64_07.png", false);
  prop(map, 12, 5, "moebel_zimmer_pflanze_2x2_128x128_11.png", true);
  prop(map, 1, 8, "moebel_zimmer_pflanze_1x2_64x128_02.png", true);
  prop(map, 7, 8, "moebel_zimmer_pflanze_1x1_64x64_07.png", false);
  prop(map, 10, 7, "moebel_zimmer_pflanze_2x1_128x64_03.png", true);
  prop(map, 12, 8, "moebel_zimmer_pflanze_1x1_64x64_03.png", false);
  prop(map, 6, 6, "dorf_1x2_64x128_05.png", true, "Kammer. Nach Süden durch die Tür zurück in die Stadt.");
  prop(map, 8, 8, "figuren_buerger_anim_lauf_1x2_64x128_19.png", true, "Die Zimmerpflanzen bleiben im Haus. Draußen ist die neue Stadt.");
  return finish(map);
}

function anger(): TownMap {
  const map = blank("anger", "Anger", 20, 14, "boden_natur_gras_1x1_64x64_01.png");
  fill(map, 1, 9, 18, 9, "boden_natur_steinweg_1x1_64x64_01.png");
  fill(map, 8, 4, 8, 10, "boden_natur_steinweg_1x1_64x64_01.png");
  fill(map, 11, 4, 13, 4, "boden_natur_pflaster_1x1_64x64_01.png");
  ground(map, 4, 8, "boden_natur_steinweg_1x1_64x64_01.png");
  for (const [x, y, file] of [
    [3, 7, "boden_natur_gras_blumen_1x1_64x64_01.png"],
    [5, 7, "boden_natur_klee_1x1_64x64_01.png"],
    [7, 6, "boden_natur_gras_hoch_1x1_64x64_01.png"],
    [4, 11, "boden_natur_wiese_1x1_64x64_01.png"],
    [9, 11, "boden_natur_blueten_1x1_64x64_01.png"],
    [12, 12, "boden_natur_pilze_1x1_64x64_01.png"],
    [2, 4, "boden_natur_erde_1x1_64x64_01.png"],
    [3, 4, "boden_natur_erde_hell_1x1_64x64_01.png"],
    [17, 10, "boden_natur_stuempfe_1x1_64x64_01.png"],
    [15, 12, "boden_natur_busch_1x1_64x64_01.png"],
    [10, 12, "boden_natur_farn_1x1_64x64_01.png"],
  ] as const) {
    ground(map, x, y, file);
  }

  prop(map, 1, 1, "dorf_2x2_128x128_03.png", true, "Die Tür ist nur angelehnt. Drinnen riecht es nach Brot.");
  prop(map, 4, 1, "dorf_2x2_128x128_05.png", true, "Hier wohnt die Müllerin. Sie steht unten am Weg.");
  prop(map, 7, 1, "dorf_2x3_128x192_01.png", true, "Das hohe Haus. Die Läden sind frisch gestrichen.");
  prop(map, 11, 1, "dorf_3x3_192x192_01.png", true, "Der Laden hat frische Äpfel. Die Körbe stehen draußen.");
  prop(map, 16, 1, "dorf_2x2_128x128_10.png", true, "Hinter dem Haus beginnt die Wiese.");
  prop(map, 9, 4, "dorf_1x2_64x128_10.png", true, "Der Brunnen ist tief. Das Trinkwasser holen wir vom Teich.");
  prop(map, 0, 4, "dorf_1x2_64x128_01.png", true);
  prop(map, 0, 8, "dorf_1x2_64x128_07.png", true);
  prop(map, 0, 11, "dorf_1x2_64x128_08.png", true);
  prop(map, 19, 3, "dorf_1x2_64x128_01.png", true);
  prop(map, 19, 7, "dorf_1x2_64x128_07.png", true);
  prop(map, 19, 11, "dorf_1x2_64x128_08.png", true);
  prop(map, 2, 6, "dorf_1x2_64x128_03.png", true, "Anger. Der Weg nach Osten führt zum Teich. Die dritte Karte ist die Stube.");
  prop(map, 6, 7, "dorf_1x2_64x128_02.png", true);
  prop(map, 14, 7, "dorf_1x2_64x128_04.png", true);
  prop(map, 3, 5, "figuren_buerger_anim_lauf_1x2_64x128_12.png", true, "Bleib auf dem Steinweg. Das Schaf sucht nur Krümel.");
  prop(map, 10, 6, "figuren_buerger_anim_lauf_1x2_64x128_16.png", true, "Ich bringe das Brot in die Stube.");
  prop(map, 15, 5, "figuren_buerger_anim_lauf_1x2_64x128_20.png", true, "Die Stube ist die kleine Karte oben in der Leiste.");
  prop(map, 2, 3, "dorf_1x1_64x64_01.png", true);
  prop(map, 15, 3, "dorf_1x1_64x64_01.png", true);
  prop(map, 6, 5, "dorf_1x1_64x64_05.png", true);
  prop(map, 18, 5, "dorf_1x1_64x64_09.png", true);
  prop(map, 1, 12, "dorf_1x1_64x64_04.png", true);
  prop(map, 3, 12, "dorf_1x1_64x64_06.png", true);
  prop(map, 18, 12, "dorf_1x1_64x64_04.png", true);
  prop(map, 5, 11, "props_dorf_1x1_64x64_01.png", false);
  prop(map, 7, 11, "figuren_tier_1x1_64x64_18.png", false, "Das Huhn bleibt auf der Wiese.");
  prop(map, 11, 11, "props_dorf_1x1_64x64_20.png", false);
  prop(map, 13, 11, "figuren_tier_1x1_64x64_01.png", false, "Es sucht Krümel und geht dir aus dem Weg.");
  prop(map, 16, 12, "figuren_tier_2x1_128x64_03.png", false);
  return finish(map);
}

function teich(): TownMap {
  const map = blank("teich", "Teich", 18, 13, "boden_natur_gras_1x1_64x64_01.png");
  const ripple = "wasser_1x1_64x64_04.png";
  const lilies = "boden_feld_1x1_64x64_31.png";
  blockGround(map, lilies);
  fill(map, 7, 1, 15, 6, lilies);
  fill(map, 9, 2, 12, 3, ripple);
  ground(map, 8, 4, ripple);
  ground(map, 14, 3, ripple);
  ground(map, 7, 1, "wasser_1x1_64x64_13.png");
  ground(map, 15, 6, "wasser_1x1_64x64_13.png");
  ground(map, 11, 6, "wasser_1x1_64x64_13.png");
  ground(map, 7, 5, "wasser_1x1_64x64_07.png");
  ground(map, 15, 2, "wasser_1x1_64x64_07.png");
  fill(map, 6, 1, 6, 7, "boden_natur_erde_1x1_64x64_01.png");
  fill(map, 6, 7, 16, 7, "boden_natur_erde_1x1_64x64_01.png");
  fill(map, 16, 1, 16, 7, "boden_natur_erde_hell_1x1_64x64_01.png");
  for (const [x, y] of [
    [6, 2],
    [6, 4],
    [6, 6],
    [9, 7],
    [13, 7],
    [16, 3],
    [16, 5],
  ] as const) {
    ground(map, x, y, "boden_natur_schilf_1x1_64x64_01.png");
  }
  ground(map, 5, 3, "boden_natur_steine_1x1_64x64_01.png");
  ground(map, 5, 6, "boden_natur_kiesel_1x1_64x64_01.png");
  ground(map, 17, 4, "boden_natur_steine_1x1_64x64_01.png");
  fill(map, 1, 10, 16, 10, "boden_natur_steinweg_1x1_64x64_01.png");
  fill(map, 4, 8, 4, 9, "boden_natur_steinweg_1x1_64x64_01.png");

  prop(map, 1, 2, "wasser_2x2_128x128_04.png", true, "Das Feuer ist klein. Setz dich daneben, nicht hinein.");
  prop(map, 0, 1, "dorf_1x2_64x128_01.png", true);
  prop(map, 0, 5, "dorf_1x2_64x128_07.png", true);
  prop(map, 0, 9, "dorf_1x2_64x128_08.png", true);
  prop(map, 17, 1, "dorf_1x2_64x128_01.png", true);
  prop(map, 17, 8, "dorf_1x2_64x128_07.png", true);
  prop(map, 3, 5, "figuren_buerger_anim_lauf_1x2_64x128_24.png", true, "Heute beißen sie nicht. Das Wasser trägt dich nicht.");
  prop(map, 2, 8, "dorf_1x2_64x128_05.png", true, "Teich. Zurück geht es über den Anger.");
  prop(map, 6, 8, "dorf_1x2_64x128_06.png", true);
  prop(map, 10, 7, "bauteile_steg_diele_1x1_64x64_02.png", false);
  prop(map, 11, 7, "bauteile_steg_diele_1x1_64x64_05.png", false);
  prop(map, 12, 7, "bauteile_steg_diele_1x1_64x64_06.png", false);
  prop(map, 5, 9, "dorf_1x1_64x64_02.png", true);
  prop(map, 14, 10, "figuren_tier_1x1_64x64_10.png", false, "Die Katze bleibt am Ufer.");
  prop(map, 2, 11, "figuren_tier_1x1_64x64_18.png", false);
  prop(map, 15, 11, "figuren_tier_1x1_64x64_01.png", false);
  prop(map, 8, 11, "props_dorf_1x1_64x64_15.png", false);
  return finish(map);
}

function stube(): TownMap {
  const map = blank("stube", "Stube", 16, 12, "boden_natur_parkett_a_1x1_64x64_01.png");
  const wall = "boden_natur_ziegel_dunkel_1x1_64x64_01.png";
  blockGround(map, wall);
  fill(map, 0, 0, 15, 0, wall);
  fill(map, 0, 11, 15, 11, wall);
  fill(map, 0, 0, 0, 11, wall);
  fill(map, 15, 0, 15, 11, wall);
  ground(map, 7, 11, "boden_natur_dielen_1x1_64x64_01.png");
  ground(map, 8, 11, "boden_natur_dielen_1x1_64x64_01.png");
  fill(map, 7, 3, 8, 10, "boden_natur_dielen_1x1_64x64_01.png");
  fill(map, 2, 4, 6, 7, "boden_natur_fliese_1x1_64x64_01.png");
  fill(map, 5, 1, 6, 2, "boden_natur_ziegel_1x1_64x64_01.png");

  prop(map, 1, 1, "moebel_zimmer_2x2_128x128_01.png", true, "Die Decke ist frisch gestopft.");
  prop(map, 3, 1, "moebel_haus_1x2_64x128_02.png", true, "Im Schrank steht das gute Geschirr.");
  prop(map, 5, 1, "moebel_zimmer_2x2_128x128_06.png", true, "Das Feuer ist klein, aber die Stube ist warm.");
  prop(map, 8, 1, "moebel_zimmer_2x2_128x128_04.png", true, "Die Bücher riechen nach Rauch.");
  prop(map, 11, 1, "moebel_zimmer_3x2_192x128_01.png", true, "Auf dem Herd zieht ein Eintopf.");
  prop(map, 14, 1, "moebel_zimmer_1x1_64x64_08.png", true);
  prop(map, 1, 5, "moebel_zimmer_2x2_128x128_05.png", true);
  prop(map, 4, 5, "moebel_zimmer_2x2_128x128_03.png", true);
  prop(map, 6, 6, "moebel_zimmer_1x1_64x64_02.png", true);
  prop(map, 9, 5, "moebel_zimmer_1x1_64x64_09.png", true, "Auf dem Tischchen liegt ein Laib Brot.");
  prop(map, 10, 6, "moebel_zimmer_1x1_64x64_05.png", false);
  prop(map, 12, 5, "figuren_buerger_anim_lauf_1x2_64x128_19.png", true, "Zieh die Schuhe aus. Der Anger ist gleich draußen.");
  prop(map, 14, 5, "moebel_zimmer_1x1_64x64_07.png", true);
  prop(map, 2, 8, "props_dorf_1x1_64x64_01.png", false);
  prop(map, 11, 8, "props_dorf_1x1_64x64_04.png", false);
  return finish(map);
}

export function buildPlace(id: PlaceId): TownMap {
  if (id === "stadt") return stadt();
  if (id === "kammer") return kammer();
  if (id === "teich") return teich();
  if (id === "stube") return stube();
  return anger();
}
