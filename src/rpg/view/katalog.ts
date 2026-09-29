/** L001–L100 zeigen auf vorhandene Dorf-/Stock-PNGs. Keine neuen Dateien, keine neuen Ids. */

import { DORF, dorfBrush } from "./dorf.ts";
import { STOCK, type StockBrush, type StockGroup } from "./stock.ts";

export type LeisteBlock = "A" | "B" | "C" | "D" | "E";

export type LeisteItem = {
  id: string;
  label: string;
  block: LeisteBlock;
  group: StockGroup;
  file: string;
  source: "dorf" | "stock";
  stockId?: number;
  stand_b: number;
  stand_s: number;
  tuer_dx: number | null;
  tuer_dy: number | null;
  overlay: boolean;
  ersatz: boolean;
  notiz: string;
};

function dorf(
  id: string,
  label: string,
  block: LeisteBlock,
  group: StockGroup,
  file: string,
  stand_b: number,
  stand_s: number,
  tuer_dx: number | null,
  overlay: boolean,
  ersatz: boolean,
  notiz: string,
): LeisteItem {
  return {
    id,
    label,
    block,
    group,
    file,
    source: "dorf",
    stand_b,
    stand_s,
    tuer_dx,
    tuer_dy: tuer_dx == null ? null : Math.max(0, stand_s - 1),
    overlay,
    ersatz,
    notiz,
  };
}

function stock(
  id: string,
  label: string,
  block: LeisteBlock,
  group: StockGroup,
  stockId: number,
  file: string,
  stand_b: number,
  stand_s: number,
  tuer_dx: number | null,
  overlay: boolean,
  notiz: string,
): LeisteItem {
  return {
    id,
    label,
    block,
    group,
    file,
    source: "stock",
    stockId,
    stand_b,
    stand_s,
    tuer_dx,
    tuer_dy: tuer_dx == null ? null : Math.max(0, stand_s - 1),
    overlay,
    ersatz: true,
    notiz,
  };
}

export const LEISTE: LeisteItem[] = [
  dorf("L001", "Hütte Stroh", "A", "haeuser", "dorf_2x2_128x128_01.png", 2, 1, 0, false, true, "2×2 Dorfhaus"),
  dorf("L002", "Hütte Schindel", "A", "haeuser", "dorf_2x2_128x128_03.png", 2, 1, 0, false, true, "_02 ist Baum, deshalb _03"),
  dorf("L003", "Fachwerk klein", "A", "haeuser", "dorf_2x2_128x128_04.png", 2, 1, 0, false, true, "2×2 Dorfhaus"),
  dorf("L004", "Fachwerk breit", "A", "haeuser", "dorf_2x3_128x192_01.png", 2, 1, 0, false, true, "kein 3×2, nächstes ist 2×3"),
  dorf("L005", "Bauernhaus", "A", "haeuser", "dorf_2x2_128x128_05.png", 2, 1, 0, false, true, "2×2 Dorfhaus"),
  dorf("L006", "Scheune", "A", "haeuser", "dorf_2x2_128x128_06.png", 2, 1, 0, false, true, "2×2 Dorfhaus"),
  dorf("L007", "Schmiede", "A", "haeuser", "dorf_2x2_128x128_07.png", 2, 1, 0, false, true, "2×2 Dorfhaus"),
  dorf("L008", "Taverne", "A", "haeuser", "dorf_2x2_128x128_08.png", 2, 1, 0, false, true, "2×2 Dorfhaus"),
  dorf("L009", "Laden", "A", "haeuser", "dorf_2x2_128x128_09.png", 2, 1, 0, false, true, "2×2 Dorfhaus"),
  dorf("L010", "Mühle", "A", "haeuser", "dorf_3x3_192x192_01.png", 3, 2, 1, false, true, "einziges 3×3 Gebäude"),
  dorf("L011", "Kirche klein", "A", "haeuser", "dorf_3x4_192x256_01.png", 3, 2, 1, false, true, "3×4 Atlas, kein Kirchen-Schnitt"),
  stock("L012", "Rathaus", "A", "haeuser", 222, "haus-1.png", 2, 2, 1, false, "Stock Haus 1"),
  stock("L013", "Brunnenhaus", "A", "haeuser", 223, "haus-2.png", 2, 2, null, false, "volle Sperre, Stock Haus 2"),
  dorf("L014", "Stall", "A", "haeuser", "dorf_2x2_128x128_10.png", 2, 1, 0, false, true, "letztes 2×2 Dorfhaus"),
  stock("L015", "Speicher", "A", "haeuser", 224, "haus-3.png", 2, 2, 0, false, "Stock Haus 3"),
  dorf("L016", "Dach Giebel", "A", "deko", "dorf_2x1_128x64_01.png", 0, 0, null, true, true, "einziges 2×1 Prop"),
  stock("L017", "Dach Walm", "A", "haeuser", 228, "haus-7.png", 0, 0, null, true, "Stock Haus 7 als flaches Dach"),
  dorf("L018", "Fassade", "A", "deko", "bauteile_steg_holz_1x1_64x64_01.png", 0, 0, null, true, true, "Holz-Bauteil"),
  dorf("L019", "Holztür", "A", "deko", "bauteile_steg_ziegel_1x2_64x128_01.png", 1, 1, 0, false, true, "1×2 Ziegel-Bauteil"),
  dorf("L020", "Fenster", "A", "deko", "props_dorf_1x1_64x64_01.png", 0, 0, null, true, true, "1×1 Prop"),
  dorf("L021", "Erdweg Mitte", "B", "boden", "boden_natur_erde_1x1_64x64_01.png", 1, 1, null, false, true, "Erde"),
  dorf("L022", "Erdweg Kante N", "B", "boden", "boden_natur_erde_hell_1x1_64x64_01.png", 1, 1, null, false, true, "Erde hell"),
  dorf("L023", "Erdweg Kante O", "B", "boden", "boden_natur_gras_erde_1x1_64x64_01.png", 1, 1, null, false, true, "Gras/Erde"),
  dorf("L024", "Erdweg Knick", "B", "boden", "boden_feld_1x1_64x64_01.png", 1, 1, null, false, true, "Feld 01"),
  dorf("L025", "Erdweg Kreuz", "B", "boden", "boden_feld_1x1_64x64_02.png", 1, 1, null, false, true, "Feld 02"),
  dorf("L026", "Erdweg T", "B", "boden", "boden_feld_1x1_64x64_03.png", 1, 1, null, false, true, "Feld 03"),
  dorf("L027", "Kies Mitte", "B", "boden", "boden_natur_erde_kies_1x1_64x64_01.png", 1, 1, null, false, false, "Kies"),
  dorf("L028", "Kies Kante", "B", "boden", "boden_natur_kiesel_1x1_64x64_01.png", 1, 1, null, false, true, "Kiesel"),
  dorf("L029", "Steg längs", "B", "deko", "bauteile_steg_diele_1x1_64x64_01.png", 1, 1, null, false, true, "Diele"),
  dorf("L030", "Steg quer", "B", "deko", "bauteile_steg_diele_1x1_64x64_02.png", 1, 1, null, false, true, "Diele 02"),
  dorf("L031", "Steg Ende", "B", "deko", "bauteile_steg_holz_1x1_64x64_02.png", 1, 1, null, false, true, "Holzsteg"),
  dorf("L032", "Radspur", "B", "boden", "boden_natur_riss_1x1_64x64_01.png", 1, 1, null, false, true, "Riss"),
  dorf("L033", "Pfütze", "B", "boden", "boden_natur_schilf_1x1_64x64_01.png", 1, 1, null, false, true, "nasse Kachel"),
  dorf("L034", "Trittstein", "B", "boden", "boden_natur_steine_1x1_64x64_01.png", 1, 1, null, false, true, "Steine"),
  dorf("L035", "Hangstufe", "B", "boden", "boden_natur_felsweg_1x1_64x64_01.png", 1, 1, null, false, true, "Felsweg"),
  dorf("L036", "Meilenstein", "B", "deko", "props_dorf_1x1_64x64_02.png", 1, 1, null, false, true, "Prop 02"),
  dorf("L037", "Wegweiser", "B", "wald", "dorf_1x2_64x128_03.png", 1, 1, null, false, true, "Schild laut assets.md"),
  dorf("L038", "Lattenzaun", "B", "deko", "props_dorf_1x1_64x64_03.png", 1, 1, null, false, true, "Prop 03"),
  dorf("L039", "Pflaster 1", "C", "boden", "boden_wege_pflaster_1x1_64x64_01.png", 1, 1, null, false, false, "Pflaster"),
  dorf("L040", "Pflaster 2", "C", "boden", "boden_wege_pflaster_1x1_64x64_02.png", 1, 1, null, false, false, "Pflaster"),
  dorf("L041", "Pflaster 3", "C", "boden", "boden_wege_pflaster_1x1_64x64_03.png", 1, 1, null, false, false, "Pflaster"),
  dorf("L042", "Pflaster Kante", "C", "boden", "boden_wege_pflaster_1x1_64x64_04.png", 1, 1, null, false, true, "Pflaster 04"),
  dorf("L043", "Pflaster Ecke", "C", "boden", "boden_wege_pflaster_1x1_64x64_05.png", 1, 1, null, false, true, "Pflaster 05"),
  dorf("L044", "Pflaster Innenecke", "C", "boden", "boden_wege_pflaster_1x1_64x64_06.png", 1, 1, null, false, true, "Pflaster 06"),
  dorf("L045", "Rinne", "C", "boden", "boden_wege_pflaster_1x1_64x64_07.png", 1, 1, null, false, true, "Pflaster 07"),
  dorf("L046", "Rinne Kreuz", "C", "boden", "boden_wege_pflaster_1x1_64x64_08.png", 1, 1, null, false, true, "Pflaster 08"),
  dorf("L047", "Bordstein", "C", "boden", "boden_natur_pflaster_1x1_64x64_01.png", 1, 1, null, false, true, "Natur-Pflaster"),
  dorf("L048", "Platzornament", "C", "boden", "boden_natur_fliese_1x1_64x64_01.png", 1, 1, null, false, true, "Fliese"),
  dorf("L049", "Bruchstein", "C", "boden", "boden_natur_schotter_1x1_64x64_01.png", 1, 1, null, false, true, "Schotter"),
  dorf("L050", "Ziegel", "C", "boden", "boden_wege_ziegel_1x1_64x64_01.png", 1, 1, null, false, false, "Ziegelweg"),
  dorf("L051", "Luke", "C", "boden", "boden_natur_ziegel_1x1_64x64_01.png", 1, 1, null, false, true, "Ziegel"),
  dorf("L052", "Gully", "C", "boden", "boden_natur_ziegel_dunkel_1x1_64x64_01.png", 1, 1, null, false, true, "dunkler Ziegel"),
  dorf("L053", "Laterne", "C", "wald", "dorf_1x2_64x128_02.png", 1, 1, null, false, true, "Laterne laut assets.md"),
  dorf("L054", "Marktbrunnen", "C", "wald", "dorf_1x2_64x128_10.png", 1, 1, null, false, true, "Brunnen laut assets.md, kein 2×2"),
  dorf("L055", "Steinbank", "C", "deko", "props_dorf_1x1_64x64_04.png", 1, 1, null, false, true, "Prop 04"),
  dorf("L056", "Stadtmauer", "C", "deko", "bauteile_steg_ziegel_1x2_64x128_02.png", 1, 1, null, false, true, "Ziegel-Bauteil"),
  dorf("L057", "Nadelstreu", "D", "boden", "boden_wege_laub_1x1_64x64_01.png", 1, 1, null, false, true, "Laubweg"),
  dorf("L058", "Nadelstreu Wurzeln", "D", "boden", "boden_wege_laub_1x1_64x64_02.png", 1, 1, null, false, true, "Laubweg 02"),
  dorf("L059", "Moos", "D", "boden", "boden_natur_wiese_1x1_64x64_01.png", 1, 1, null, false, true, "Wiese"),
  dorf("L060", "Waldkante", "D", "boden", "boden_natur_gras_1x1_64x64_01.png", 1, 1, null, false, true, "Gras"),
  dorf("L061", "junge Fichte", "D", "wald", "dorf_1x2_64x128_01.png", 1, 1, null, false, true, "Kiefer/Baum 01"),
  dorf("L062", "alte Fichte", "D", "wald", "dorf_1x2_64x128_07.png", 1, 1, null, false, true, "Kiefer laut assets.md"),
  stock("L063", "Eiche", "D", "wald", 203, "baum-rabite-a.png", 1, 1, null, false, "Stock Waldbaum"),
  stock("L064", "Birke", "D", "wald", 205, "baum-dschungel-a.png", 1, 1, null, false, "Stock Dschungelbaum"),
  stock("L065", "Stubben", "D", "deko", 211, "stumpf.png", 1, 1, null, false, "Stock Stumpf"),
  dorf("L066", "liegender Stamm", "D", "deko", "dorf_2x1_128x64_01.png", 2, 1, null, false, true, "2×1 Prop"),
  stock("L067", "Krone Overlay", "D", "wald", 209, "baeumchen.png", 0, 0, null, true, "Stock Bäumchen"),
  dorf("L068", "Unterholz dicht", "D", "boden", "boden_natur_busch_1x1_64x64_01.png", 1, 1, null, false, true, "Busch-Boden"),
  dorf("L069", "Unterholz licht", "D", "boden", "boden_natur_gras_hoch_1x1_64x64_01.png", 1, 1, null, false, true, "Hochgras"),
  dorf("L070", "Waldstein", "D", "boden", "boden_natur_steine_1x1_64x64_01.png", 1, 1, null, false, true, "Steine"),
  dorf("L071", "Steinriegel", "D", "deko", "dorf_4x1_256x64_01.png", 4, 1, null, false, true, "4×1 Prop"),
  dorf("L072", "Wurzel", "D", "boden", "boden_natur_stuempfe_1x1_64x64_01.png", 1, 1, null, false, true, "Stümpfe"),
  dorf("L073", "Pilzring", "D", "boden", "boden_natur_pilze_1x1_64x64_01.png", 1, 1, null, false, true, "Pilze"),
  dorf("L074", "Totholz", "D", "deko", "props_dorf_1x1_64x64_05.png", 1, 1, null, false, true, "Prop 05"),
  dorf("L075", "Hohlweg", "D", "boden", "boden_natur_steinweg_1x1_64x64_01.png", 1, 1, null, false, true, "Steinweg"),
  dorf("L076", "Wildwechsel", "D", "boden", "boden_wege_laub_1x1_64x64_03.png", 0, 0, null, true, true, "Laub 03 Overlay"),
  dorf("L077", "Lichtung", "D", "boden", "boden_natur_gras_blumen_1x1_64x64_01.png", 1, 1, null, false, true, "Gras Blumen"),
  stock("L078", "Holzstoß", "D", "deko", 212, "scheite.png", 1, 1, null, false, "Stock Scheite"),
  dorf("L079", "Hochgras", "E", "boden", "boden_natur_gras_hoch_1x1_64x64_01.png", 0, 0, null, true, false, "Hochgras Overlay"),
  dorf("L080", "Trittgras", "E", "boden", "boden_natur_gras_1x1_64x64_01.png", 0, 0, null, true, true, "Gras Overlay"),
  dorf("L081", "Blüte weiß", "E", "boden", "boden_natur_blueten_1x1_64x64_01.png", 0, 0, null, true, false, "Blüten"),
  dorf("L082", "Blüte gelb", "E", "boden", "boden_natur_gras_blumen_1x1_64x64_01.png", 0, 0, null, true, true, "Blumengras"),
  dorf("L083", "Klee", "E", "boden", "boden_natur_klee_1x1_64x64_01.png", 0, 0, null, true, false, "Klee"),
  dorf("L084", "Distel", "E", "deko", "props_feld_1x1_64x64_01.png", 1, 1, null, false, true, "Feld-Prop"),
  dorf("L085", "Farn", "E", "boden", "boden_natur_farn_1x1_64x64_01.png", 0, 0, null, true, false, "Farn"),
  dorf("L086", "Nessel", "E", "deko", "props_feld_1x1_64x64_02.png", 1, 1, null, false, true, "Feld-Prop"),
  dorf("L087", "Schilf", "E", "boden", "boden_natur_schilf_1x1_64x64_01.png", 1, 1, null, false, false, "Schilf"),
  dorf("L088", "Seerose", "E", "wasser", "wasser_1x1_64x64_04.png", 0, 0, null, true, true, "Kräuseln laut assets.md"),
  dorf("L089", "Hecke gerade", "E", "deko", "props_feld_1x1_64x64_03.png", 1, 1, null, false, true, "Feld-Prop"),
  dorf("L090", "Hecke Ecke", "E", "deko", "props_feld_1x1_64x64_04.png", 1, 1, null, false, true, "Feld-Prop"),
  dorf("L091", "Wildhecke", "E", "deko", "props_feld_1x1_64x64_05.png", 1, 1, null, false, true, "Feld-Prop"),
  dorf("L092", "Holunder", "E", "wald", "dorf_1x2_64x128_08.png", 1, 1, null, false, true, "Laubbaum laut assets.md"),
  dorf("L093", "Beerenstrauch", "E", "deko", "props_dorf_1x1_64x64_06.png", 1, 1, null, false, true, "Prop 06"),
  dorf("L094", "Kohl", "E", "deko", "props_dorf_1x1_64x64_07.png", 1, 1, null, false, true, "Prop 07"),
  dorf("L095", "Weizen", "E", "boden", "boden_feld_1x1_64x64_10.png", 1, 1, null, false, true, "Feld 10"),
  dorf("L096", "Kräuter", "E", "deko", "props_dorf_1x1_64x64_08.png", 1, 1, null, false, true, "Prop 08"),
  dorf("L097", "Efeu", "E", "deko", "bauteile_steg_laub_1x1_64x64_01.png", 0, 0, null, true, true, "Laub-Bauteil"),
  dorf("L098", "Moospolster", "E", "boden", "boden_natur_wiese_1x1_64x64_01.png", 0, 0, null, true, true, "Wiese Overlay"),
  dorf("L099", "Hutpilz", "E", "boden", "boden_natur_pilze_1x1_64x64_01.png", 1, 1, null, false, false, "Pilze"),
  stock("L100", "Blumentopf", "E", "deko", 213, "topf.png", 1, 1, null, false, "Stock Topf"),
];

export const LEISTE_ALIAS = LEISTE;

export function aliasGroup(id: string): LeisteItem | undefined {
  return LEISTE.find((row) => row.id === id);
}

export function resolveLeiste(item: LeisteItem): StockBrush | undefined {
  if (item.source === "stock") return STOCK.find((brush) => brush.id === item.stockId);
  return dorfBrush(item.file);
}

export function leisteForBrush(brushId: number): LeisteItem | undefined {
  return LEISTE.find((item) => resolveLeiste(item)?.id === brushId);
}

export function leisteStats() {
  const missing = LEISTE.filter((item) => !resolveLeiste(item)).map((item) => item.id);
  return { count: LEISTE.length, dorf: DORF.length, missing };
}
