import type { StockBrush } from "./stock.ts";

const loaders = import.meta.glob("../assets/dorf/**/*.png", {
  import: "default",
}) as Record<string, () => Promise<string>>;

const paths = Object.keys(loaders).sort();

const WORD: Record<string, string> = {
  parkett: "Parkett",
  ziegel: "Ziegel",
  fliese: "Fliese",
  kiesel: "Kiesel",
  gras: "Gras",
  erde: "Erde",
  schotter: "Schotter",
  blumen: "Blumen",
  hoch: "hoch",
  pflaster: "Pflaster",
  riss: "Risse",
  stuempfe: "Stümpfe",
  dielen: "Dielen",
  diele: "Diele",
  klee: "Klee",
  wiese: "Wiese",
  farn: "Farn",
  busch: "Busch",
  steine: "Steine",
  pilze: "Pilze",
  kies: "Kies",
  blueten: "Blüten",
  felsweg: "Felsweg",
  steinweg: "Steinweg",
  schilf: "Schilf",
  holz: "Holz",
  laub: "Laub",
  hell: "hell",
  dunkel: "dunkel",
  lauf: "Lauf",
  portrait: "Bildnis",
  buerger: "Bürger",
  fischer: "Angler",
  zimmer: "Zimmer",
  haus: "Haus",
  feld: "Feld",
  steg: "Steg",
  wasser: "Wasser",
  tier: "Tier",
  dorf: "Dorf",
};

const SKIP = new Set([
  "boden",
  "wege",
  "natur",
  "feld",
  "figuren",
  "buerger",
  "anim",
  "moebel",
  "props",
  "dorf",
  "wasser",
  "boegen",
  "bauteile",
  "steg",
  "gebaeude",
  "haeuser",
  "ui",
  "rahmen",
  "humanoide",
  "portraits",
  "tiere",
]);

function labelFor(path: string): string {
  const stem = path.split("/").pop()?.replace(/\.png$/, "") ?? "Bild";
  const bits = stem.split("_");
  const index = bits[bits.length - 1]?.match(/^\d+$/) ? bits.pop() : undefined;
  const words = bits
    .filter((bit) => !/^\d+x\d+$/.test(bit) && !SKIP.has(bit))
    .map((bit) => WORD[bit] ?? (/^\d+$/.test(bit) ? String(Number(bit)) : bit.charAt(0).toUpperCase() + bit.slice(1)));
  const name = words.join(" ") || "Bild";
  if (words.some((word) => /^\d+$/.test(word))) return name;
  return index ? `${name} ${Number(index)}` : name;
}

function meta(path: string): Pick<StockBrush, "group" | "kind" | "solid" | "talk" | "w" | "h"> {
  const parts = path.split("/");
  const top = parts[parts.indexOf("dorf") + 1] ?? "";
  const size = parts[parts.length - 2] ?? "";
  const match = size.match(/^(\d+)x(\d+)_/);
  const w = Math.min(8, Math.max(1, match ? Number(match[1]) : 1));
  const h = Math.min(8, Math.max(1, match ? Number(match[2]) : 1));
  const portrait = path.includes("/portraits/");
  if (top === "boden" || (top === "wasser" && w === 1 && h === 1)) {
    return { group: "boden", kind: "ground", solid: top === "wasser", talk: false, w: 1, h: 1 };
  }
  if (top === "wasser") return { group: "wasser", kind: "object", solid: h >= 2, talk: false, w, h };
  if (top === "natur") return { group: "wald", kind: "object", solid: true, talk: false, w, h };
  if (top === "gebaeude") return { group: "haeuser", kind: "object", solid: true, talk: false, w, h };
  if (top === "moebel") return { group: "moebel", kind: "object", solid: true, talk: false, w, h };
  if (top === "figuren") return { group: "figuren", kind: "object", solid: true, talk: !portrait, w, h };
  if (top === "ui") return { group: "rahmen", kind: "object", solid: false, talk: false, w, h };
  const solid = top === "bauteile";
  return { group: "deko", kind: "object", solid, talk: false, w, h };
}

export const DORF: StockBrush[] = paths.map((path, index) => {
  const brush = meta(path);
  return {
    id: 300 + index,
    group: brush.group,
    kind: brush.kind,
    label: labelFor(path),
    solid: brush.solid,
    talk: brush.talk,
    w: brush.w,
    h: brush.h,
    src: "",
  };
});

const pathById = new Map(paths.map((path, index) => [300 + index, path]));
const srcCache = new Map<number, Promise<string>>();

export function dorfBrush(fileName: string): StockBrush | undefined {
  const index = paths.findIndex((path) => path.endsWith(`/${fileName}`));
  return index >= 0 ? DORF[index] : undefined;
}

export function loadDorfSrc(id: number): Promise<string> {
  const pending = srcCache.get(id);
  if (pending) return pending;
  const path = pathById.get(id);
  const load = path ? loaders[path] : undefined;
  if (!load) return Promise.resolve("");
  const next = load()
    .then((src) => {
      const brush = DORF[id - 300];
      if (brush) brush.src = src;
      return src;
    })
    .catch(() => "");
  srcCache.set(id, next);
  return next;
}
