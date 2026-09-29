import { GroundId, ObjectId, type TownMap } from "./types.ts";
import { normalizeMap, setTile, syncCollision, tileAt, writeSpan } from "./tilemap.ts";

export const MAP_W = 20;
export const MAP_H = 14;
export const START = { x: 4, y: 8 };

const WELCOME = "Willkommen in der Beispielstadt. Bäume, Mauern und Wasser halten dich auf.";
const WELL = "Der Brunnen ist kühl und tief. Jemand hat eine Münze liegen lassen.";
const DOOR = "Die Tür ist verriegelt. Drinnen brennt kein Licht.";

function emptyMap(name: string): TownMap {
  const cells = MAP_W * MAP_H;
  return {
    formatVersion: 1,
    id: "town",
    name,
    tileSize: 64,
    width: MAP_W,
    height: MAP_H,
    layers: [
      { name: "ground", width: MAP_W, height: MAP_H, tiles: Array(cells).fill(GroundId.grass) },
      { name: "objects", width: MAP_W, height: MAP_H, tiles: Array(cells).fill(ObjectId.none) },
      { name: "collision", width: MAP_W, height: MAP_H, tiles: Array(cells).fill(0) },
    ],
    messages: {},
    spans: {},
    blockingGrounds: [GroundId.water],
  };
}

function paintGround(map: TownMap, x: number, y: number, id: number) {
  setTile(map, "ground", x, y, id);
  syncCollision(map, x, y);
}

function paintObject(map: TownMap, x: number, y: number, id: number) {
  setTile(map, "objects", x, y, id);
  syncCollision(map, x, y);
}

export function buildTown(name = "Beispielstadt"): TownMap {
  const map = emptyMap(name);

  for (let y = 0; y < MAP_H; y += 1) {
    for (let x = 0; x < MAP_W; x += 1) {
      if (x === 0 || y === 0 || x === MAP_W - 1 || y === MAP_H - 1) {
        paintObject(map, x, y, ObjectId.tree);
      }
    }
  }

  for (let x = 2; x <= 17; x += 1) paintGround(map, x, 8, GroundId.path);
  for (let y = 5; y <= 12; y += 1) paintGround(map, 10, y, GroundId.path);

  for (let y = 2; y <= 4; y += 1) {
    for (let x = 14; x <= 17; x += 1) paintGround(map, x, y, GroundId.water);
  }

  paintObject(map, 3, 2, ObjectId.cottage);
  writeSpan(map, 3, 2, { id: ObjectId.cottage, w: 2, h: 2, solid: true });
  map.messages["3,3"] = DOOR;
  map.messages["4,3"] = DOOR;

  paintObject(map, 8, 7, ObjectId.sign);
  map.messages["8,7"] = WELCOME;

  paintObject(map, 13, 5, ObjectId.well);
  map.messages["13,5"] = WELL;

  paintObject(map, 2, 4, ObjectId.tree);
  paintObject(map, 7, 5, ObjectId.tree);
  paintObject(map, 16, 10, ObjectId.tree);
  paintObject(map, 17, 9, ObjectId.bush);
  paintObject(map, 15, 9, ObjectId.bush);
  paintObject(map, 6, 6, ObjectId.bush);
  paintObject(map, 11, 11, ObjectId.rock);
  paintObject(map, 12, 11, ObjectId.rock);
  paintObject(map, 2, 11, ObjectId.fence);
  paintObject(map, 3, 11, ObjectId.fence);
  paintObject(map, 4, 11, ObjectId.fence);
  paintObject(map, 5, 11, ObjectId.fence);

  paintObject(map, 5, 7, ObjectId.flowers);
  paintObject(map, 6, 9, ObjectId.flowers);
  paintObject(map, 9, 9, ObjectId.flowers);
  paintObject(map, 12, 7, ObjectId.flowers);
  paintObject(map, 11, 6, ObjectId.flowers);

  // Der Ost-West-Weg bleibt frei, sonst scheitert der erste Schritt.
  for (let x = 1; x <= 17; x += 1) {
    if (tileAt(map, "objects", x, 8) !== ObjectId.none) {
      paintObject(map, x, 8, ObjectId.none);
    }
  }

  normalizeMap(map);
  return map;
}
