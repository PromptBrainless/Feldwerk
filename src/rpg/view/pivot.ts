/** Tiled-kompatible Unterkanten-Ausrichtung. Die Zeichenroutine in engine.ts sitzt schon auf der Südkante. */

export const TILE_PX = 64;

export type Pivot = {
  pivot_px: number;
  pivot_py: number;
  origin_x: 0.5;
  origin_y: 1;
  stand_b: number;
  stand_s: number;
  tuer_dx: number | null;
  tuer_dy: number | null;
  objectalignment: "bottom";
};

export function pivotOf(
  w: number,
  h: number,
  kind: "ground" | "object",
  solid: boolean,
  group?: string,
): Pivot {
  const tilesW = Math.max(1, w);
  const tilesH = Math.max(1, h);
  const pivot_px = (tilesW * TILE_PX) / 2;
  const pivot_py = tilesH * TILE_PX;
  if (kind === "ground") {
    return {
      pivot_px: TILE_PX / 2,
      pivot_py: TILE_PX,
      origin_x: 0.5,
      origin_y: 1,
      stand_b: 1,
      stand_s: 1,
      tuer_dx: null,
      tuer_dy: null,
      objectalignment: "bottom",
    };
  }
  if (!solid) {
    return {
      pivot_px,
      pivot_py,
      origin_x: 0.5,
      origin_y: 1,
      stand_b: 0,
      stand_s: 0,
      tuer_dx: null,
      tuer_dy: null,
      objectalignment: "bottom",
    };
  }
  const stand_b = tilesW;
  const stand_s = group === "haeuser" && tilesH >= 3 ? 2 : 1;
  const hasDoor = group === "haeuser";
  return {
    pivot_px,
    pivot_py,
    origin_x: 0.5,
    origin_y: 1,
    stand_b,
    stand_s,
    tuer_dx: hasDoor ? Math.floor((stand_b - 1) / 2) : null,
    tuer_dy: hasDoor ? stand_s - 1 : null,
    objectalignment: "bottom",
  };
}

export function pivotLabel(p: Pivot): string {
  const stand = p.stand_b === 0 ? "Overlay" : `${p.stand_b}×${p.stand_s}`;
  const door = p.tuer_dx == null ? "—" : `${p.tuer_dx},${p.tuer_dy}`;
  return `pivot ${p.pivot_px},${p.pivot_py} · Stand ${stand} · Tür ${door}`;
}
