import { paintCell, type PaintLayer, type PaintTool, type Stamp } from "../editor/paint.ts";
import { EventInterpreter } from "../runtime/EventInterpreter.ts";
import { createEmptyGameState } from "../runtime/GameState.ts";
import { DIR_DELTA, dirFromCode, tryStep } from "../runtime/movement.ts";
import { inBounds, isBlocked, isBlockingGround, layer, MAP_MAX, MAP_MIN, normalizeMap, resizeMap, spanKey } from "../runtime/tilemap.ts";
import { MAP_H, MAP_W, START, buildTown } from "../runtime/town.ts";
import { buildPlace, type PlaceId } from "./places.ts";
import {
  GroundId,
  ObjectId,
  type Dir,
  type EventCommand,
  type GameState,
  type Span,
  type TownMap,
} from "../runtime/types.ts";
import { loadArt, type ArtKey, type ArtSet } from "./assets.ts";
import { decodeImage, listBrushes, type CustomBrush } from "./library.ts";
import { STOCK } from "./stock.ts";
import { DORF, loadDorfSrc } from "./dorf.ts";

export const TILE_STEPS = [48, 64, 96] as const;
export const DEFAULT_TILE = 64;
const STEP = 0.17;
const SAVE_KEY = "feldwerk-town-v2";
const SAVE_KEY_V1 = "feldwerk-town-v1";

export type { PaintLayer, PaintTool };

type Snap = {
  width: number;
  height: number;
  ground: number[];
  objects: number[];
  collision: number[];
  messages: Record<string, string>;
  spans: Record<string, Span>;
  blockingGrounds: number[];
};

export type Player = {
  x: number;
  y: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  t: number;
  moving: boolean;
  dir: Dir;
  bump: number;
  bumpDir: Dir;
  hitWall: boolean;
  walk: number;
};

export type Sim = {
  mode: "play" | "draw";
  tool: PaintTool;
  layer: PaintLayer;
  groundBrush: number;
  objectBrush: number;
  stampText: string;
  stamp: Stamp;
  groundSolid: boolean;
  tile: number;
  blockOn: boolean;
  map: TownMap;
  game: GameState;
  player: Player;
  dialog: string | null;
  talk: { interp: EventInterpreter; shown: number } | null;
  dialogLock: number;
  cam: { x: number; y: number };
  viewW: number;
  viewH: number;
  keys: Set<string>;
  dirStack: Dir[];
  touchDir: Dir | null;
  padDir: Dir | null;
  padInteract: boolean;
  prevInteract: boolean;
  touchPulse: boolean;
  hover: { x: number; y: number } | null;
  art: ArtSet | null;
  customs: CustomBrush[];
  customImages: Record<number, HTMLImageElement>;
  undo: Snap[];
  before: Snap | null;
  strokeDirty: boolean;
  muted: boolean;
  framed: boolean;
  artState: "loading" | "ready" | "missing";
};

declare global {
  interface Window {
    __controlsTest?: {
      getX: () => number;
      getY: () => number;
      getYaw: () => number;
      getSpeed: () => number;
      setKeys: (codes: string[]) => void;
    };
  }
}

const ROW: Record<Dir, number> = { down: 0, left: 1, right: 2, up: 3 };

const SPRITE: Partial<Record<number, { key: ArtKey; w: number; footW: number; footH: number }>> = {
  [ObjectId.tree]: { key: "tree", w: 1.5, footW: 1, footH: 1 },
  [ObjectId.bush]: { key: "bush", w: 1.02, footW: 1, footH: 1 },
  [ObjectId.flowers]: { key: "flowers", w: 0.74, footW: 1, footH: 1 },
  [ObjectId.rock]: { key: "rock", w: 0.86, footW: 1, footH: 1 },
  [ObjectId.fence]: { key: "fence", w: 1.12, footW: 1, footH: 1 },
  [ObjectId.cottage]: { key: "cottage", w: 2.2, footW: 2, footH: 2 },
  [ObjectId.sign]: { key: "sign", w: 0.82, footW: 1, footH: 1 },
  [ObjectId.well]: { key: "well", w: 1.08, footW: 1, footH: 1 },
};

const GROUND_ART: Record<number, ArtKey> = {
  [GroundId.grass]: "grass",
  [GroundId.path]: "path",
  [GroundId.water]: "water",
  [GroundId.earth]: "earth",
  [GroundId.sand]: "sand",
  [GroundId.stone]: "stone",
};

const STRETCH_GROUND = new Set<number>([GroundId.grass, GroundId.path, GroundId.water]);
const SAMPLE = 128;

let audioCtx: AudioContext | null = null;

function tone(sim: Sim, freq: number, dur = 0.07, gain = 0.03) {
  if (sim.muted || !audioCtx) return;
  const osc = audioCtx.createOscillator();
  const amp = audioCtx.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(gain, audioCtx.currentTime);
  amp.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
  osc.connect(amp);
  amp.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + dur);
}

export function unlockAudio(sim: Sim) {
  if (sim.muted) return;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  if (!audioCtx) audioCtx = new Ctx();
  if (audioCtx.state === "suspended") void audioCtx.resume();
}

function snapOf(map: TownMap): Snap {
  return {
    width: map.width,
    height: map.height,
    ground: [...layer(map, "ground").tiles],
    objects: [...layer(map, "objects").tiles],
    collision: [...layer(map, "collision").tiles],
    messages: { ...map.messages },
    spans: structuredClone(map.spans),
    blockingGrounds: [...map.blockingGrounds],
  };
}

function applySnap(map: TownMap, snap: Snap) {
  map.width = snap.width;
  map.height = snap.height;
  for (const name of ["ground", "objects", "collision"] as const) {
    const entry = layer(map, name);
    entry.width = snap.width;
    entry.height = snap.height;
  }
  layer(map, "ground").tiles = [...snap.ground];
  layer(map, "objects").tiles = [...snap.objects];
  layer(map, "collision").tiles = [...snap.collision];
  map.messages = { ...snap.messages };
  map.spans = structuredClone(snap.spans);
  map.blockingGrounds = [...snap.blockingGrounds];
}

function makePlayer(): Player {
  return {
    x: START.x,
    y: START.y,
    fromX: START.x,
    fromY: START.y,
    toX: START.x,
    toY: START.y,
    t: 0,
    moving: false,
    dir: "down",
    bump: 0,
    bumpDir: "down",
    hitWall: false,
    walk: 0,
  };
}

export function createSim(): Sim {
  return {
    mode: "play",
    tool: "brush",
    layer: "ground",
    groundBrush: GroundId.grass,
    objectBrush: ObjectId.tree,
    stampText: "Hier steht etwas.",
    stamp: { w: 1, h: 1, solid: true, talk: false },
    groundSolid: false,
    tile: DEFAULT_TILE,
    blockOn: true,
    map: buildPlace("anger"),
    game: createEmptyGameState("anger"),
    player: makePlayer(),
    dialog: null,
    talk: null,
    dialogLock: 0,
    cam: { x: 0, y: 0 },
    viewW: 800,
    viewH: 600,
    keys: new Set(),
    dirStack: [],
    touchDir: null,
    padDir: null,
    padInteract: false,
    prevInteract: false,
    touchPulse: false,
    hover: null,
    art: null,
    customs: [],
    customImages: {},
    undo: [],
    before: null,
    strokeDirty: false,
    muted: false,
    framed: false,
    artState: "loading",
  };
}

function parkPlayer(sim: Sim) {
  const player = sim.player;
  player.moving = false;
  player.t = 0;
  const startX = Math.min(START.x, sim.map.width - 1);
  const startY = Math.min(START.y, sim.map.height - 1);
  if (inBounds(sim.map, startX, startY) && !isBlocked(sim.map, startX, startY)) {
    player.x = startX;
    player.y = startY;
  } else {
    for (let y = 0; y < sim.map.height; y += 1) {
      for (let x = 0; x < sim.map.width; x += 1) {
        if (!isBlocked(sim.map, x, y)) {
          player.x = x;
          player.y = y;
          y = sim.map.height;
          break;
        }
      }
    }
  }
  player.fromX = player.x;
  player.fromY = player.y;
  player.toX = player.x;
  player.toY = player.y;
  player.dir = "down";
}

function ensurePlayer(sim: Sim) {
  const player = sim.player;
  if (inBounds(sim.map, player.x, player.y) && !isBlocked(sim.map, player.x, player.y)) {
    player.moving = false;
    player.t = 0;
    player.fromX = player.x;
    player.fromY = player.y;
    player.toX = player.x;
    player.toY = player.y;
    return;
  }
  parkPlayer(sim);
}

export function resetTown(sim: Sim) {
  const name = sim.map.name;
  sim.map = buildTown(name);
  sim.game = createEmptyGameState("town");
  sim.dialog = null;
  sim.talk = null;
  sim.undo = [];
  parkPlayer(sim);
  sim.framed = false;
  try {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(SAVE_KEY_V1);
  } catch {
    /* private mode */
  }
}

export function undoTown(sim: Sim) {
  const prev = sim.undo.pop();
  if (!prev) return;
  applySnap(sim.map, prev);
  ensurePlayer(sim);
  sim.framed = false;
  saveTown(sim);
}

type SavedTown = {
  version?: number;
  world?: number;
  name?: string;
  width?: number;
  height?: number;
  tile?: number;
  ground?: number[];
  objects?: number[];
  collision?: number[];
  messages?: Record<string, string>;
  spans?: Record<string, Span>;
  blockingGrounds?: number[];
  switches?: Record<string, boolean>;
  muted?: boolean;
};

const WORLD = 3;
const FRESH_NAMES = new Set(["Anger", "Teich", "Stube", "Beispielstadt"]);

function applySaved(sim: Sim, data: SavedTown) {
  const width = Math.max(MAP_MIN, Math.min(MAP_MAX, Math.round(data.width ?? MAP_W)));
  const height = Math.max(MAP_MIN, Math.min(MAP_MAX, Math.round(data.height ?? MAP_H)));
  const cells = width * height;
  if (!data.ground || !data.objects || data.ground.length !== cells || data.objects.length !== cells) return;
  if (width !== sim.map.width || height !== sim.map.height) resizeMap(sim.map, width, height);
  layer(sim.map, "ground").tiles = data.ground;
  layer(sim.map, "objects").tiles = data.objects;
  layer(sim.map, "collision").tiles = data.collision?.length === cells ? data.collision : Array(cells).fill(0);
  sim.map.messages = data.messages ?? {};
  sim.map.spans = data.spans ?? {};
  sim.map.blockingGrounds = data.blockingGrounds ?? [GroundId.water];
  normalizeMap(sim.map);
  if (typeof data.name === "string" && data.name.trim()) sim.map.name = data.name.slice(0, 40);
  sim.game.switches = data.switches ?? {};
  if (typeof data.muted === "boolean") sim.muted = data.muted;
  if (TILE_STEPS.includes(data.tile as (typeof TILE_STEPS)[number])) sim.tile = data.tile as number;
  parkPlayer(sim);
}

export function loadTown(sim: Sim) {
  try {
    const raw = localStorage.getItem(SAVE_KEY) ?? localStorage.getItem(SAVE_KEY_V1);
    if (!raw) return;
    const data = JSON.parse(raw) as SavedTown;
    if (data.version !== 1 && data.version !== 2) return;
    if (data.world !== WORLD && FRESH_NAMES.has((data.name ?? "Beispielstadt").trim() || "Beispielstadt")) return;
    applySaved(sim, data);
  } catch {
    /* kaputter Speicher bleibt ungenutzt */
  }
}

export function saveTown(sim: Sim) {
  try {
    const payload = {
      version: 2,
      world: WORLD,
      name: sim.map.name,
      width: sim.map.width,
      height: sim.map.height,
      tile: sim.tile,
      ground: layer(sim.map, "ground").tiles,
      objects: layer(sim.map, "objects").tiles,
      collision: layer(sim.map, "collision").tiles,
      messages: sim.map.messages,
      spans: sim.map.spans,
      blockingGrounds: sim.map.blockingGrounds,
      switches: sim.game.switches,
      muted: sim.muted,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  } catch {
    /* Speicher voll oder gesperrt */
  }
}

export function resizeTown(sim: Sim, width: number, height: number) {
  const before = snapOf(sim.map);
  if (!resizeMap(sim.map, width, height)) return false;
  sim.undo.push(before);
  if (sim.undo.length > 40) sim.undo.shift();
  ensurePlayer(sim);
  sim.framed = false;
  saveTown(sim);
  return true;
}

export function setTilePx(sim: Sim, tile: number) {
  if (!TILE_STEPS.includes(tile as (typeof TILE_STEPS)[number])) return;
  sim.tile = tile;
  sim.framed = false;
  saveTown(sim);
}

export function visualPlayer(player: Player) {
  if (!player.moving) return { x: player.x, y: player.y };
  const k = Math.min(1, player.t / STEP);
  return {
    x: player.fromX + (player.toX - player.fromX) * k,
    y: player.fromY + (player.toY - player.fromY) * k,
  };
}

function currentDir(sim: Sim): Dir | null {
  if (sim.touchDir) return sim.touchDir;
  if (sim.dirStack.length) return sim.dirStack[sim.dirStack.length - 1] ?? null;
  return sim.padDir;
}

function pollPad(sim: Sim) {
  sim.padDir = null;
  sim.padInteract = false;
  const pads = navigator.getGamepads?.();
  if (!pads) return;
  for (const pad of pads) {
    if (!pad) continue;
    const ax = pad.axes[0] ?? 0;
    const ay = pad.axes[1] ?? 0;
    const dead = 0.35;
    if (ay < -dead || pad.buttons[12]?.pressed) sim.padDir = "up";
    else if (ay > dead || pad.buttons[13]?.pressed) sim.padDir = "down";
    else if (ax < -dead || pad.buttons[14]?.pressed) sim.padDir = "left";
    else if (ax > dead || pad.buttons[15]?.pressed) sim.padDir = "right";
    if (pad.buttons[0]?.pressed) sim.padInteract = true;
  }
}

function beginMove(sim: Sim, dir: Dir) {
  const player = sim.player;
  player.dir = dir;
  const next = tryStep((x, y) => isBlocked(sim.map, x, y), player.x, player.y, dir);
  if (!next) {
    if (!player.hitWall) {
      player.bump = 0.001;
      player.bumpDir = dir;
      player.hitWall = true;
      tone(sim, 90, 0.05, 0.02);
    }
    return;
  }
  player.hitWall = false;
  player.fromX = player.x;
  player.fromY = player.y;
  player.toX = next.x;
  player.toY = next.y;
  player.t = 0;
  player.moving = true;
}

function arrive(sim: Sim, extra: number) {
  const player = sim.player;
  player.x = player.toX;
  player.y = player.toY;
  player.moving = false;
  player.t = 0;
  tone(sim, 160 + (player.x + player.y) * 3, 0.04, 0.018);
  const dir = currentDir(sim);
  if (!dir || sim.dialog || sim.mode !== "play") return;
  const next = tryStep((x, y) => isBlocked(sim.map, x, y), player.x, player.y, dir);
  if (!next) {
    player.dir = dir;
    if (!player.hitWall) {
      player.bump = 0.001;
      player.bumpDir = dir;
      player.hitWall = true;
    }
    return;
  }
  player.dir = dir;
  player.fromX = player.x;
  player.fromY = player.y;
  player.toX = next.x;
  player.toY = next.y;
  player.moving = true;
  player.t = Math.min(extra, STEP);
}

function pumpTalk(sim: Sim) {
  const talk = sim.talk;
  if (!talk) return;
  const before = talk.shown;
  let guard = 0;
  while (!talk.interp.isDone() && talk.interp.messages().length === before && guard < 12) {
    talk.interp.tick(sim.game);
    guard += 1;
  }
  const messages = talk.interp.messages();
  if (messages.length > before) {
    sim.dialog = messages[messages.length - 1] ?? null;
    talk.shown = messages.length;
    tone(sim, 420, 0.08, 0.025);
  } else {
    sim.dialog = null;
    sim.talk = null;
    saveTown(sim);
  }
}

function tryTalk(sim: Sim) {
  if (sim.player.moving) return;
  const delta = DIR_DELTA[sim.player.dir];
  const x = sim.player.x + delta.x;
  const y = sim.player.y + delta.y;
  const text = sim.map.messages[`${x},${y}`];
  if (!text) return;
  const commands: EventCommand[] = [
    { type: "message", text },
    { type: "setSwitch", id: "sawSign", value: true },
  ];
  sim.talk = { interp: new EventInterpreter(commands), shown: 0 };
  sim.dialogLock = performance.now() + 280;
  pumpTalk(sim);
}

function clampCam(value: number, world: number, view: number) {
  if (world <= view) return (world - view) / 2;
  return Math.max(0, Math.min(world - view, value));
}

export function step(sim: Sim, dt: number) {
  const TILE = sim.tile;
  const capped = Math.min(0.05, dt);
  pollPad(sim);
  const interactDown =
    sim.keys.has("Space") || sim.keys.has("Enter") || sim.keys.has("KeyE") || sim.padInteract;
  const want = (interactDown && !sim.prevInteract) || sim.touchPulse;
  sim.prevInteract = interactDown;
  if (want && performance.now() >= sim.dialogLock) {
    sim.touchPulse = false;
    if (sim.dialog) pumpTalk(sim);
    else if (sim.mode === "play") tryTalk(sim);
  }

  const player = sim.player;
  if (sim.mode === "play") {
    if (player.moving) {
      player.t += capped;
      player.walk += capped;
      if (player.t >= STEP) arrive(sim, player.t - STEP);
    } else if (!sim.dialog) {
      const dir = currentDir(sim);
      if (dir) beginMove(sim, dir);
      else player.hitWall = false;
    }
  } else {
    const dir = currentDir(sim);
    if (dir) {
      const delta = DIR_DELTA[dir];
      sim.cam.x += delta.x * 380 * capped;
      sim.cam.y += delta.y * 380 * capped;
    }
  }

  if (player.bump > 0 && player.bump < 1) {
    player.bump = Math.min(1, player.bump + capped / 0.14);
  }

  const vis = visualPlayer(player);
  if (sim.mode === "play" && sim.viewW > 0) {
    const worldW = sim.map.width * TILE;
    const worldH = sim.map.height * TILE;
    const targetX = clampCam((vis.x + 0.5) * TILE - sim.viewW / 2, worldW, sim.viewW);
    const targetY = clampCam((vis.y + 0.42) * TILE - sim.viewH / 2, worldH, sim.viewH);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !sim.framed) {
      sim.cam.x = targetX;
      sim.cam.y = targetY;
      sim.framed = true;
    } else {
      const k = 1 - Math.exp(-9 * capped);
      sim.cam.x += (targetX - sim.cam.x) * k;
      sim.cam.y += (targetY - sim.cam.y) * k;
    }
  } else {
    const worldW = sim.map.width * TILE;
    const worldH = sim.map.height * TILE;
    sim.cam.x = clampCam(sim.cam.x, worldW, sim.viewW);
    sim.cam.y = clampCam(sim.cam.y, worldH, sim.viewH);
  }

  window.__controlsTest = {
    getX: () => visualPlayer(sim.player).x,
    getY: () => visualPlayer(sim.player).y,
    getYaw: () => 0,
    getSpeed: () => (sim.player.moving ? 1 : 0),
    setKeys: (codes) => {
      sim.keys = new Set(codes);
      sim.dirStack = [];
      sim.touchDir = null;
      for (const code of codes) {
        const dir = dirFromCode(code);
        if (dir && !sim.dirStack.includes(dir)) sim.dirStack.push(dir);
      }
    },
  };
}

export function pointerTile(sim: Sim, canvas: HTMLCanvasElement, clientX: number, clientY: number) {
  const TILE = sim.tile;
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left + sim.cam.x;
  const y = clientY - rect.top + sim.cam.y;
  const tx = Math.floor(x / TILE);
  const ty = Math.floor(y / TILE);
  if (tx < 0 || ty < 0 || tx >= sim.map.width || ty >= sim.map.height) return null;
  return { x: tx, y: ty };
}

export function beginStroke(sim: Sim, tile: { x: number; y: number } | null) {
  if (sim.mode !== "draw" || sim.tool === "hand" || !tile) return;
  sim.before = snapOf(sim.map);
  sim.strokeDirty = false;
  if (sim.tool === "block") {
    sim.blockOn = layer(sim.map, "collision").tiles[tile.y * sim.map.width + tile.x] === 0;
  }
  applyStroke(sim, tile);
}

function syncGroundBlock(sim: Sim) {
  const id = sim.groundBrush;
  if (id < 100 || id === GroundId.water) return;
  const has = sim.map.blockingGrounds.includes(id);
  if (sim.groundSolid && !has) sim.map.blockingGrounds.push(id);
  if (!sim.groundSolid && has) sim.map.blockingGrounds = sim.map.blockingGrounds.filter((entry) => entry !== id);
}

export function applyStroke(sim: Sim, tile: { x: number; y: number } | null) {
  if (sim.mode !== "draw" || sim.tool === "hand" || !tile || !sim.before) return;
  if (sim.layer === "object" && sim.tool === "brush" && (sim.stamp.w > 1 || sim.stamp.h > 1) && sim.strokeDirty) {
    return;
  }
  if (sim.tool === "brush" && sim.layer === "ground") syncGroundBlock(sim);
  const changed = paintCell(
    sim.map,
    tile.x,
    tile.y,
    sim.tool,
    sim.layer,
    sim.groundBrush,
    sim.objectBrush,
    sim.stampText,
    sim.blockOn,
    sim.stamp,
  );
  if (changed) sim.strokeDirty = true;
}

export function endStroke(sim: Sim) {
  if (sim.before && sim.strokeDirty) {
    sim.undo.push(sim.before);
    if (sim.undo.length > 40) sim.undo.shift();
    saveTown(sim);
  }
  sim.before = null;
  sim.strokeDirty = false;
}

const INK = "#1c1915";
const PARCHMENT = "#f4efe4";
const GOLD = "#b8883a";
const WALNUT = "rgba(107, 70, 50, 0.38)";
const FALLBACK = ["#7d9a62", "#c6a56a", "#3f7e86", "#8a6244", "#d8c08a", "#8d8274"];

function blitRepeat(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
) {
  const iw = image.width;
  const ih = image.height;
  if (iw < 1 || ih < 1 || sw < 1 || sh < 1) return;
  const x0 = ((sx % iw) + iw) % iw;
  const y0 = ((sy % ih) + ih) % ih;
  const w1 = Math.min(sw, iw - x0);
  const h1 = Math.min(sh, ih - y0);
  const dw1 = (w1 / sw) * dw;
  const dh1 = (h1 / sh) * dh;
  ctx.drawImage(image, x0, y0, w1, h1, dx, dy, dw1 + 0.5, dh1 + 0.5);
  if (w1 < sw) ctx.drawImage(image, 0, y0, sw - w1, h1, dx + dw1, dy, dw - dw1 + 0.5, dh1 + 0.5);
  if (h1 < sh) ctx.drawImage(image, x0, 0, w1, sh - h1, dx, dy + dh1, dw1 + 0.5, dh - dh1 + 0.5);
  if (w1 < sw && h1 < sh) {
    ctx.drawImage(image, 0, 0, sw - w1, sh - h1, dx + dw1, dy + dh1, dw - dw1 + 0.5, dh - dh1 + 0.5);
  }
}

export function draw(ctx: CanvasRenderingContext2D, sim: Sim) {
  const TILE = sim.tile;
  const { viewW: w, viewH: h } = sim;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const dpr = ctx.canvas.width / Math.max(1, w);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.fillStyle = PARCHMENT;
  ctx.fillRect(0, 0, w, h);

  const worldW = sim.map.width * TILE;
  const worldH = sim.map.height * TILE;
  const cam = sim.cam;
  const tiles = layer(sim.map, "ground").tiles;
  const x0 = Math.max(0, Math.floor(cam.x / TILE) - 1);
  const y0 = Math.max(0, Math.floor(cam.y / TILE) - 1);
  const x1 = Math.min(sim.map.width, Math.ceil((cam.x + w) / TILE) + 1);
  const y1 = Math.min(sim.map.height, Math.ceil((cam.y + h) / TILE) + 1);

  if (sim.art) {
    for (const groundId of STRETCH_GROUND) {
      const key = GROUND_ART[groundId];
      const image = key ? sim.art[key] : undefined;
      if (!image) continue;
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < tiles.length; i += 1) {
        if (tiles[i] !== groundId) continue;
        const x = i % sim.map.width;
        const y = (i - x) / sim.map.width;
        ctx.rect(x * TILE - cam.x - 0.5, y * TILE - cam.y - 0.5, TILE + 1, TILE + 1);
      }
      ctx.clip();
      ctx.drawImage(image, -cam.x, -cam.y, worldW, worldH);
      ctx.restore();
    }
    for (let y = y0; y < y1; y += 1) {
      for (let x = x0; x < x1; x += 1) {
        const id = tiles[y * sim.map.width + x] ?? 0;
        if (STRETCH_GROUND.has(id)) continue;
        const key = GROUND_ART[id];
        const builtin = key ? sim.art[key] : undefined;
        const custom = sim.customImages[id];
        const dx = x * TILE - cam.x;
        const dy = y * TILE - cam.y;
        if (builtin) {
          blitRepeat(ctx, builtin, x * SAMPLE, y * SAMPLE, SAMPLE, SAMPLE, dx, dy, TILE + 1, TILE + 1);
        } else if (custom) {
          if (isBlockingGround(sim.map, id)) {
            ctx.fillStyle = "#46766f";
            ctx.fillRect(dx, dy, TILE + 1, TILE + 1);
          }
          blitCrisp(ctx, custom, dx, dy, TILE + 1, TILE + 1);
        } else if (id !== GroundId.grass) {
          ctx.fillStyle = FALLBACK[id] ?? "#c4b49a";
          ctx.fillRect(dx, dy, TILE + 0.5, TILE + 0.5);
        }
      }
    }
  } else {
    for (let i = 0; i < tiles.length; i += 1) {
      const x = i % sim.map.width;
      const y = (i - x) / sim.map.width;
      ctx.fillStyle = FALLBACK[tiles[i] ?? 0] ?? FALLBACK[0];
      ctx.fillRect(x * TILE - cam.x, y * TILE - cam.y, TILE + 0.5, TILE + 0.5);
    }
  }

  type Item = { sort: number; paint: () => void };
  const items: Item[] = [];
  const objects = layer(sim.map, "objects").tiles;
  for (let i = 0; i < objects.length; i += 1) {
    const id = objects[i] ?? 0;
    if (id === ObjectId.none || id === ObjectId.span || id === ObjectId.cottageFill) continue;
    const x = i % sim.map.width;
    const y = (i - x) / sim.map.width;
    const spec = SPRITE[id];
    const span = sim.map.spans[spanKey(x, y)];
    const footW = span?.w ?? spec?.footW ?? 1;
    const footH = span?.h ?? spec?.footH ?? 1;
    const scale = spec ? spec.w / spec.footW : 1;
    items.push({
      sort: (y + footH) * TILE,
      paint: () => {
        const image = sim.customImages[id] ?? (spec ? sim.art?.[spec.key] : undefined);
        const destW = TILE * footW * scale;
        const aspect = image ? image.height / Math.max(1, image.width) : 1.15;
        let destH = destW * aspect;
        if (!spec) destH = Math.max(destH, TILE * footH * 0.92);
        const dx = (x + footW / 2) * TILE - destW / 2 - cam.x;
        const dy = (y + footH) * TILE - destH + TILE * 0.06 - cam.y;
        ctx.fillStyle = "rgba(28,25,21,0.18)";
        ctx.beginPath();
        ctx.ellipse(
          (x + footW / 2) * TILE - cam.x,
          (y + footH) * TILE - cam.y - 2,
          Math.max(8, destW * 0.28),
          TILE * 0.12,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        if (image) blitCrisp(ctx, image, dx, dy, destW, destH);
        else {
          ctx.fillStyle = "#c4b49a";
          ctx.fillRect(x * TILE - cam.x + 4, (y + footH) * TILE - cam.y - TILE * footH + 4, TILE * footW - 8, TILE * footH - 8);
        }
      },
    });
  }

  const vis = visualPlayer(sim.player);
  const bumpAmp = Math.sin(Math.min(1, sim.player.bump) * Math.PI) * 7;
  const bumpDelta = DIR_DELTA[sim.player.bumpDir];
  items.push({
    sort: (vis.y + 1) * TILE + 0.5,
    paint: () => {
      const feetX = (vis.x + 0.5) * TILE - cam.x + bumpDelta.x * bumpAmp;
      const feetY = (vis.y + 1) * TILE - cam.y + bumpDelta.y * bumpAmp;
      ctx.fillStyle = "rgba(28,25,21,0.22)";
      ctx.beginPath();
      ctx.ellipse(feetX, feetY - 2, TILE * 0.26, TILE * 0.11, 0, 0, Math.PI * 2);
      ctx.fill();
      const hero = sim.art?.hero;
      if (!hero) {
        ctx.fillStyle = "#2f6b4f";
        ctx.beginPath();
        ctx.arc(feetX, feetY - TILE * 0.45, TILE * 0.28, 0, Math.PI * 2);
        ctx.fill();
        return;
      }
      const fw = hero.width / 4;
      const fh = hero.height / 4;
      const col = sim.player.moving ? Math.floor(sim.player.walk / 0.11) % 4 : 0;
      const row = ROW[sim.player.dir];
      const destH = TILE * 2.05;
      const destW = destH * (fw / fh);
      ctx.drawImage(hero, col * fw, row * fh, fw, fh, feetX - destW / 2, feetY - destH + 4, destW, destH);
    },
  });

  items.sort((a, b) => a.sort - b.sort);
  for (const item of items) item.paint();

  ctx.strokeStyle = WALNUT.replace("0.38", "0.85");
  ctx.lineWidth = 2;
  ctx.strokeRect(-cam.x + 1, -cam.y + 1, worldW - 2, worldH - 2);

  if (sim.mode === "draw") {
    ctx.strokeStyle = "rgba(28,25,21,0.16)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= sim.map.width; x += 1) {
      ctx.moveTo(x * TILE - cam.x, -cam.y);
      ctx.lineTo(x * TILE - cam.x, worldH - cam.y);
    }
    for (let y = 0; y <= sim.map.height; y += 1) {
      ctx.moveTo(-cam.x, y * TILE - cam.y);
      ctx.lineTo(worldW - cam.x, y * TILE - cam.y);
    }
    ctx.stroke();

    const collision = layer(sim.map, "collision").tiles;
    ctx.fillStyle = WALNUT;
    for (let y = y0; y < y1; y += 1) {
      for (let x = x0; x < x1; x += 1) {
        if (!collision[y * sim.map.width + x]) continue;
        const dx = x * TILE - cam.x;
        const dy = y * TILE - cam.y;
        ctx.fillRect(dx, dy, TILE, TILE);
        ctx.strokeStyle = "rgba(107,70,50,0.7)";
        ctx.beginPath();
        ctx.moveTo(dx + 8, dy + 8);
        ctx.lineTo(dx + TILE - 8, dy + TILE - 8);
        ctx.moveTo(dx + TILE - 8, dy + 8);
        ctx.lineTo(dx + 8, dy + TILE - 8);
        ctx.stroke();
      }
    }

    if (sim.hover) {
      const wide = sim.layer === "object" && sim.tool === "brush";
      const footW = wide ? sim.stamp.w : 1;
      const footH = wide ? sim.stamp.h : 1;
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 2;
      ctx.strokeRect(
        sim.hover.x * TILE - cam.x + 1,
        sim.hover.y * TILE - cam.y + 1,
        TILE * footW - 2,
        TILE * footH - 2,
      );
    }
  }

  if (!sim.art) {
    ctx.fillStyle = INK;
    ctx.font = "16px Outfit, sans-serif";
    ctx.fillText(sim.artState === "missing" ? "Bilder fehlen." : "Die Karte wird aufgerollt …", 16, 28);
  }
}

export function attachInput(sim: Sim) {
  const onDown = (event: KeyboardEvent) => {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) {
      event.preventDefault();
    }
    if (event.repeat) return;
    if ((event.ctrlKey || event.metaKey) && event.code === "KeyZ" && sim.mode === "draw") {
      event.preventDefault();
      undoTown(sim);
      return;
    }
    unlockAudio(sim);
    sim.keys.add(event.code);
    const dir = dirFromCode(event.code);
    if (dir && !sim.dirStack.includes(dir)) sim.dirStack.push(dir);
  };
  const onUp = (event: KeyboardEvent) => {
    sim.keys.delete(event.code);
    const dir = dirFromCode(event.code);
    if (dir) sim.dirStack = sim.dirStack.filter((entry) => entry !== dir);
  };
  const clear = () => {
    sim.keys.clear();
    sim.dirStack = [];
    sim.touchDir = null;
  };
  window.addEventListener("keydown", onDown);
  window.addEventListener("keyup", onUp);
  window.addEventListener("blur", clear);
  document.addEventListener("visibilitychange", clear);
  return () => {
    window.removeEventListener("keydown", onDown);
    window.removeEventListener("keyup", onUp);
    window.removeEventListener("blur", clear);
    document.removeEventListener("visibilitychange", clear);
    delete window.__controlsTest;
  };
}

export async function loadPlacedImages(sim: Sim) {
  const used = new Set<number>();
  for (const id of layer(sim.map, "ground").tiles) if (id >= 300) used.add(id);
  for (const id of layer(sim.map, "objects").tiles) if (id >= 300) used.add(id);
  for (const span of Object.values(sim.map.spans)) if (span.id >= 300) used.add(span.id);
  await Promise.all(
    DORF.filter((brush) => used.has(brush.id)).map(async (brush) => {
      try {
        await ensureBrushImage(sim, brush);
      } catch {
        /* fehlende Grafik bleibt ein Platz */
      }
    }),
  );
}

export function openPlace(sim: Sim, id: PlaceId) {
  sim.map = buildPlace(id);
  sim.game = createEmptyGameState(id);
  sim.dialog = null;
  sim.talk = null;
  sim.undo = [];
  parkPlayer(sim);
  sim.framed = false;
  saveTown(sim);
  void loadPlacedImages(sim);
}

export function bootArt(sim: Sim, onReady: () => void) {
  Promise.all([loadArt(), listBrushes().catch(() => [] as CustomBrush[])])
    .then(async ([art, brushes]) => {
      sim.art = art;
      sim.customs = brushes;
      await Promise.all([
        ...brushes.map(async (brush) => {
          try {
            sim.customImages[brush.id] = await decodeImage(brush.src);
          } catch {
            /* fehlende Grafik bleibt ein Platz */
          }
        }),
        ...STOCK.map(async (brush) => {
          try {
            await ensureBrushImage(sim, brush);
          } catch {
            /* fehlende Grafik bleibt ein Platz */
          }
        }),
        loadPlacedImages(sim),
      ]);
      sim.artState = "ready";
      onReady();
    })
    .catch(() => {
      sim.artState = "missing";
      onReady();
    });
}

export async function ensureBrushImage(sim: Sim, brush: CustomBrush) {
  if (sim.customImages[brush.id]) return;
  const src = brush.src || (await loadDorfSrc(brush.id));
  if (!src) return;
  sim.customImages[brush.id] = await decodeImage(src);
}

function blitCrisp(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource & { width: number; height: number },
  dx: number,
  dy: number,
  dw: number,
  dh: number,
) {
  const crisp = image.width <= 512 && image.height <= 512;
  if (crisp) ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, dx, dy, dw, dh);
  if (crisp) ctx.imageSmoothingEnabled = true;
}
