import { GroundId, ObjectId, type Span, type TileLayerName, type TownMap } from "./types.ts";

export const MAP_MIN = 8;
export const MAP_MAX = 64;
export const FOOT_MAX = 8;

export function layer(map: TownMap, name: TileLayerName) {
  const found = map.layers.find((entry) => entry.name === name);
  if (!found) throw new Error(`Ebene fehlt: ${name}`);
  return found;
}

export function inBounds(map: TownMap, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < map.width && y < map.height;
}

export function tileAt(map: TownMap, name: TileLayerName, x: number, y: number): number {
  if (!inBounds(map, x, y)) return 0;
  const entry = layer(map, name);
  return entry.tiles[y * map.width + x] ?? 0;
}

export function setTile(map: TownMap, name: TileLayerName, x: number, y: number, value: number) {
  if (!inBounds(map, x, y)) return;
  layer(map, name).tiles[y * map.width + x] = value;
}

export function spanKey(x: number, y: number) {
  return `${x},${y}`;
}

export function spanAt(map: TownMap, x: number, y: number): { x: number; y: number; span: Span } | null {
  const direct = map.spans[spanKey(x, y)];
  if (direct) return { x, y, span: direct };
  for (const [key, span] of Object.entries(map.spans)) {
    const [sx, sy] = key.split(",").map(Number);
    if (x >= sx && x < sx + span.w && y >= sy && y < sy + span.h) return { x: sx, y: sy, span };
  }
  return null;
}

export function isBlocked(map: TownMap, x: number, y: number): boolean {
  if (!inBounds(map, x, y)) return true;
  return tileAt(map, "collision", x, y) !== 0;
}

export function isSolidObject(id: number): boolean {
  return id !== ObjectId.none && id !== ObjectId.flowers && id !== ObjectId.span;
}

export function isBlockingGround(map: TownMap, id: number): boolean {
  return id === GroundId.water || map.blockingGrounds.includes(id);
}

/** Kollision folgt Wasser, sperrenden Böden und festen Objekten. */
export function syncCollision(map: TownMap, x: number, y: number) {
  const covered = spanAt(map, x, y);
  const objectSolid = covered ? covered.span.solid : isSolidObject(tileAt(map, "objects", x, y));
  const groundSolid = isBlockingGround(map, tileAt(map, "ground", x, y));
  setTile(map, "collision", x, y, objectSolid || groundSolid ? 1 : 0);
}

export function clearSpan(map: TownMap, x: number, y: number) {
  const key = spanKey(x, y);
  const span = map.spans[key];
  if (!span) return;
  delete map.spans[key];
  for (let iy = y; iy < y + span.h; iy += 1) {
    for (let ix = x; ix < x + span.w; ix += 1) {
      setTile(map, "objects", ix, iy, ObjectId.none);
      delete map.messages[spanKey(ix, iy)];
      syncCollision(map, ix, iy);
    }
  }
}

export function writeSpan(map: TownMap, x: number, y: number, span: Span) {
  map.spans[spanKey(x, y)] = span;
  for (let iy = y; iy < y + span.h; iy += 1) {
    for (let ix = x; ix < x + span.w; ix += 1) {
      setTile(map, "objects", ix, iy, ix === x && iy === y ? span.id : ObjectId.span);
      syncCollision(map, ix, iy);
    }
  }
}

/** Alte 2×2-Häuser (cottage + cottageFill) in Flächen übersetzen. */
export function normalizeMap(map: TownMap) {
  if (!map.spans) map.spans = {};
  if (!map.blockingGrounds) map.blockingGrounds = [GroundId.water];
  if (!map.blockingGrounds.includes(GroundId.water)) map.blockingGrounds.push(GroundId.water);
  for (let y = 0; y < map.height; y += 1) {
    for (let x = 0; x < map.width; x += 1) {
      if (tileAt(map, "objects", x, y) !== ObjectId.cottage) continue;
      if (map.spans[spanKey(x, y)]) continue;
      if (x + 1 >= map.width || y + 1 >= map.height) continue;
      const fills = [
        [1, 0],
        [0, 1],
        [1, 1],
      ] as const;
      const legacy = fills.every(([dx, dy]) => {
        const id = tileAt(map, "objects", x + dx, y + dy);
        return id === ObjectId.cottageFill || id === ObjectId.span;
      });
      if (!legacy) continue;
      map.spans[spanKey(x, y)] = { id: ObjectId.cottage, w: 2, h: 2, solid: true };
      for (const [dx, dy] of fills) setTile(map, "objects", x + dx, y + dy, ObjectId.span);
    }
  }
}

export function resizeMap(map: TownMap, width: number, height: number): boolean {
  const nextW = Math.max(MAP_MIN, Math.min(MAP_MAX, Math.round(width)));
  const nextH = Math.max(MAP_MIN, Math.min(MAP_MAX, Math.round(height)));
  if (nextW === map.width && nextH === map.height) return false;

  const oldW = map.width;
  const oldH = map.height;
  const copyW = Math.min(oldW, nextW);
  const copyH = Math.min(oldH, nextH);
  const take = (name: TileLayerName, fill: number) => {
    const old = layer(map, name).tiles;
    const tiles = Array<number>(nextW * nextH).fill(fill);
    for (let y = 0; y < copyH; y += 1) {
      for (let x = 0; x < copyW; x += 1) tiles[y * nextW + x] = old[y * oldW + x] ?? fill;
    }
    return tiles;
  };

  const ground = take("ground", GroundId.grass);
  const objects = take("objects", ObjectId.none);
  const collision = take("collision", 0);
  const spans: Record<string, Span> = {};
  const cleared: { x: number; y: number }[] = [];

  for (const [key, span] of Object.entries(map.spans)) {
    const [sx, sy] = key.split(",").map(Number);
    const fits = sx >= 0 && sy >= 0 && sx + span.w <= nextW && sy + span.h <= nextH;
    if (fits) {
      spans[key] = { ...span };
      continue;
    }
    for (let y = sy; y < sy + span.h; y += 1) {
      for (let x = sx; x < sx + span.w; x += 1) {
        if (x < 0 || y < 0 || x >= nextW || y >= nextH) continue;
        objects[y * nextW + x] = ObjectId.none;
        cleared.push({ x, y });
      }
    }
  }

  const messages: Record<string, string> = {};
  for (const [key, text] of Object.entries(map.messages)) {
    const [x, y] = key.split(",").map(Number);
    if (x < 0 || y < 0 || x >= nextW || y >= nextH) continue;
    if (objects[y * nextW + x] === ObjectId.none) continue;
    messages[key] = text;
  }

  map.width = nextW;
  map.height = nextH;
  for (const name of ["ground", "objects", "collision"] as const) {
    const entry = layer(map, name);
    entry.width = nextW;
    entry.height = nextH;
  }
  layer(map, "ground").tiles = ground;
  layer(map, "objects").tiles = objects;
  layer(map, "collision").tiles = collision;
  map.spans = spans;
  map.messages = messages;

  for (let y = 0; y < nextH; y += 1) {
    for (let x = 0; x < nextW; x += 1) {
      if (x >= oldW || y >= oldH) syncCollision(map, x, y);
    }
  }
  for (const cell of cleared) syncCollision(map, cell.x, cell.y);
  return true;
}

export function cloneMap(map: TownMap): TownMap {
  return structuredClone(map);
}
