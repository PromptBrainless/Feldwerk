import type { GameState } from "./types.ts";

export function createEmptyGameState(mapId: string): GameState {
  return {
    formatVersion: 1,
    mapId,
    tick: 0,
    switches: {},
    variables: {},
    selfSwitches: {},
    party: { gold: 0, itemCounts: {} },
  };
}

export function cloneGameState(state: GameState): GameState {
  return structuredClone(state);
}
