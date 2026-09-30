import { DIR_DELTA } from "../runtime/movement.ts";
import type { Dir, TownMap } from "../runtime/types.ts";

/** Rundet eine Spielerposition auf die Zelle, auf der sie gerade steht. */
export function playerCell(x: number, y: number): { x: number; y: number } {
  return { x: Math.round(x), y: Math.round(y) };
}

/** Die Zelle vor dem Spieler, in Blickrichtung. Selbe Formel wie das Reden im Spiel. */
export function cellAhead(x: number, y: number, dir: Dir): { x: number; y: number } {
  const delta = DIR_DELTA[dir];
  const cell = playerCell(x, y);
  return { x: cell.x + delta.x, y: cell.y + delta.y };
}

/** Der Spruch der Zelle vor dem Spieler, ohne den Dialog auszulösen. Nur zum Anzeigen. */
export function messageAhead(map: TownMap, x: number, y: number, dir: Dir): string | null {
  const ahead = cellAhead(x, y, dir);
  return map.messages[`${ahead.x},${ahead.y}`] ?? null;
}

const DIR_LABEL: Record<Dir, string> = {
  down: "Süden",
  left: "Westen",
  right: "Osten",
  up: "Norden",
};

export function dirLabel(dir: Dir): string {
  return DIR_LABEL[dir];
}
