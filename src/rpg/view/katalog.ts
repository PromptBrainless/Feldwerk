/** Papier-Katalog L001–L100 als Alias auf bestehende Palette-Gruppen. Keine neuen PNGs. */

export type LeisteAlias = {
  id: string;
  group: "haeuser" | "boden" | "wald" | "deko";
  w: number;
  h: number;
  notiz: string;
};

const A: LeisteAlias[] = [
  { id: "L001", group: "haeuser", w: 2, h: 2, notiz: "Hütte 2×2 → Palette Häuser" },
  { id: "L004", group: "haeuser", w: 3, h: 2, notiz: "Fachwerk breit → Palette Häuser" },
  { id: "L010", group: "haeuser", w: 3, h: 3, notiz: "Mühle 3×3 → Palette Häuser" },
];

const B: LeisteAlias[] = [
  { id: "L021", group: "boden", w: 1, h: 1, notiz: "Weg → Palette Boden" },
];

const D: LeisteAlias[] = [
  { id: "L061", group: "wald", w: 1, h: 2, notiz: "Baum → Palette Wald" },
];

const E: LeisteAlias[] = [
  { id: "L079", group: "deko", w: 1, h: 1, notiz: "Pflanze Overlay → Palette Deko/Wald" },
];

export const LEISTE_ALIAS: LeisteAlias[] = [...A, ...B, ...D, ...E];

export function aliasGroup(id: string): LeisteAlias | undefined {
  return LEISTE_ALIAS.find((row) => row.id === id);
}
