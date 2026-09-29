import type { Dir } from "./types.ts";

export const DIR_DELTA: Record<Dir, { x: number; y: number }> = {
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
};

/** Nächste Kachel, oder null wenn die Kachel sperrt. +x ist rechts, +y ist unten. */
export function tryStep(
  blocked: (x: number, y: number) => boolean,
  x: number,
  y: number,
  dir: Dir,
): { x: number; y: number } | null {
  const delta = DIR_DELTA[dir];
  const next = { x: x + delta.x, y: y + delta.y };
  if (blocked(next.x, next.y)) return null;
  return next;
}

const KEY_DIR: Record<string, Dir> = {
  KeyW: "up",
  ArrowUp: "up",
  KeyS: "down",
  ArrowDown: "down",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
};

export function dirFromCode(code: string): Dir | undefined {
  return KEY_DIR[code];
}
