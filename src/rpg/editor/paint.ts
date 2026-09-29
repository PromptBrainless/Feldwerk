import { ObjectId, type TownMap } from "../runtime/types.ts";
import { clearSpan, inBounds, setTile, spanAt, spanKey, syncCollision, tileAt, writeSpan } from "../runtime/tilemap.ts";

export type PaintTool = "brush" | "erase" | "block" | "hand";
export type PaintLayer = "ground" | "object";

export type Stamp = {
  w: number;
  h: number;
  solid: boolean;
  talk: boolean;
};

function needsSpan(id: number, w: number, h: number) {
  return w > 1 || h > 1 || id >= 100 || id === ObjectId.cottage;
}

function eraseSingle(map: TownMap, x: number, y: number) {
  setTile(map, "objects", x, y, ObjectId.none);
  delete map.messages[spanKey(x, y)];
  syncCollision(map, x, y);
}

function eraseObject(map: TownMap, x: number, y: number) {
  const covered = spanAt(map, x, y);
  if (covered) {
    clearSpan(map, covered.x, covered.y);
    return;
  }
  eraseSingle(map, x, y);
}

function clearFootprint(map: TownMap, x: number, y: number, w: number, h: number) {
  const anchors = new Set<string>();
  const singles: { x: number; y: number }[] = [];
  for (let iy = y; iy < y + h; iy += 1) {
    for (let ix = x; ix < x + w; ix += 1) {
      const covered = spanAt(map, ix, iy);
      if (covered) anchors.add(spanKey(covered.x, covered.y));
      else if (tileAt(map, "objects", ix, iy) !== ObjectId.none) singles.push({ x: ix, y: iy });
    }
  }
  for (const key of anchors) {
    const [ax, ay] = key.split(",").map(Number);
    clearSpan(map, ax, ay);
  }
  for (const cell of singles) {
    if (tileAt(map, "objects", cell.x, cell.y) !== ObjectId.none) eraseObject(map, cell.x, cell.y);
  }
}

function writeTalk(map: TownMap, x: number, y: number, w: number, h: number, text: string | null) {
  for (let iy = y; iy < y + h; iy += 1) {
    for (let ix = x; ix < x + w; ix += 1) {
      const key = spanKey(ix, iy);
      if (text) map.messages[key] = text;
      else delete map.messages[key];
    }
  }
}

export function paintCell(
  map: TownMap,
  x: number,
  y: number,
  tool: PaintTool,
  layerName: PaintLayer,
  groundBrush: number,
  objectBrush: number,
  stampText: string,
  blockOn: boolean,
  stamp: Stamp,
): boolean {
  if (!inBounds(map, x, y) || tool === "hand") return false;

  if (tool === "block") {
    const next = blockOn ? 1 : 0;
    if (tileAt(map, "collision", x, y) === next) return false;
    setTile(map, "collision", x, y, next);
    return true;
  }

  if (tool === "erase") {
    if (layerName === "ground") {
      if (tileAt(map, "ground", x, y) === 0 && tileAt(map, "collision", x, y) === 0) return false;
      setTile(map, "ground", x, y, 0);
      syncCollision(map, x, y);
      return true;
    }
    if (tileAt(map, "objects", x, y) === ObjectId.none && !map.messages[spanKey(x, y)]) return false;
    eraseObject(map, x, y);
    return true;
  }

  if (layerName === "ground") {
    const same = tileAt(map, "ground", x, y) === groundBrush;
    if (!same) setTile(map, "ground", x, y, groundBrush);
    const before = tileAt(map, "collision", x, y);
    syncCollision(map, x, y);
    return !same || tileAt(map, "collision", x, y) !== before;
  }

  const w = Math.max(1, Math.min(8, stamp.w));
  const h = Math.max(1, Math.min(8, stamp.h));
  if (!inBounds(map, x + w - 1, y + h - 1)) return false;
  const text = stamp.talk && stampText.trim() ? stampText.trim() : null;

  if (needsSpan(objectBrush, w, h)) {
    const existing = map.spans[spanKey(x, y)];
    const same =
      existing?.id === objectBrush &&
      existing.w === w &&
      existing.h === h &&
      existing.solid === stamp.solid &&
      tileAt(map, "objects", x, y) === objectBrush;
    if (same) {
      const key = spanKey(x, y);
      if ((text ?? undefined) === map.messages[key]) return false;
      writeTalk(map, x, y, w, h, text);
      return true;
    }
    clearFootprint(map, x, y, w, h);
    writeSpan(map, x, y, { id: objectBrush, w, h, solid: stamp.solid });
    writeTalk(map, x, y, w, h, text);
    return true;
  }

  if (tileAt(map, "objects", x, y) === objectBrush && !spanAt(map, x, y)) {
    const key = spanKey(x, y);
    if ((text ?? undefined) === map.messages[key] || (!text && !(key in map.messages))) return false;
    writeTalk(map, x, y, 1, 1, text);
    return true;
  }

  eraseObject(map, x, y);
  setTile(map, "objects", x, y, objectBrush);
  syncCollision(map, x, y);
  writeTalk(map, x, y, 1, 1, text);
  return true;
}
