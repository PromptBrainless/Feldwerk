export type Dir = "down" | "left" | "right" | "up";

export const GroundId = {
  grass: 0,
  path: 1,
  water: 2,
  earth: 3,
  sand: 4,
  stone: 5,
} as const;

export const ObjectId = {
  none: 0,
  tree: 1,
  bush: 2,
  flowers: 3,
  rock: 4,
  fence: 5,
  cottage: 6,
  cottageFill: 7,
  sign: 8,
  well: 9,
  span: 10,
} as const;

export type TileLayerName = "ground" | "objects" | "collision";

export type TileLayer = {
  name: TileLayerName;
  width: number;
  height: number;
  tiles: number[];
};

export type Span = {
  id: number;
  w: number;
  h: number;
  solid: boolean;
};

/** Projektkarte. Runtime liest sie; der Editor schreibt in dieselben Arrays. */
export type TownMap = {
  formatVersion: 1;
  id: string;
  name: string;
  tileSize: number;
  width: number;
  height: number;
  layers: TileLayer[];
  messages: Record<string, string>;
  /** Anker „x,y“ → Fläche eines Objekts. Die übrigen Zellen tragen ObjectId.span. */
  spans: Record<string, Span>;
  /** Boden-IDs, die den Schritt sperren. Wasser ist immer dabei. */
  blockingGrounds: number[];
  /** Zelle „x,y“ → Ort, der beim Betreten öffnet. */
  exits?: Record<string, string>;
};

export type SwitchMap = Record<string, boolean>;
export type VariableMap = Record<string, number>;

export type GameState = {
  formatVersion: 1;
  mapId: string;
  tick: number;
  switches: SwitchMap;
  variables: VariableMap;
  selfSwitches: Record<string, boolean>;
  party: { gold: number; itemCounts: Record<string, number> };
};

export type EventCommand =
  | { type: "wait"; frames: number }
  | { type: "setSwitch"; id: string; value: boolean }
  | { type: "setVariable"; id: string; value: number }
  | { type: "message"; text: string };
