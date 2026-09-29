import type { CustomBrush } from "./library.ts";

import s_fliese from "../assets/stock/fliese.png";
import s_fliese_b from "../assets/stock/fliese-b.png";
import s_fliese_c from "../assets/stock/fliese-c.png";
import s_baum_rabite_a from "../assets/stock/baum-rabite-a.png";
import s_baum_rabite_b from "../assets/stock/baum-rabite-b.png";
import s_baum_dschungel_a from "../assets/stock/baum-dschungel-a.png";
import s_baum_dschungel_b from "../assets/stock/baum-dschungel-b.png";
import s_baum_mondlicht_a from "../assets/stock/baum-mondlicht-a.png";
import s_baum_mondlicht_b from "../assets/stock/baum-mondlicht-b.png";
import s_baeumchen from "../assets/stock/baeumchen.png";
import s_klein_baum from "../assets/stock/klein-baum.png";
import s_stumpf from "../assets/stock/stumpf.png";
import s_scheite from "../assets/stock/scheite.png";
import s_topf from "../assets/stock/topf.png";
import s_fass from "../assets/stock/fass.png";
import s_truhe from "../assets/stock/truhe.png";
import s_regal from "../assets/stock/regal.png";
import s_tisch from "../assets/stock/tisch.png";
import s_trank from "../assets/stock/trank.png";
import s_schluessel from "../assets/stock/schluessel.png";
import s_beutel from "../assets/stock/beutel.png";
import s_fahne from "../assets/stock/fahne.png";
import s_haus_1 from "../assets/stock/haus-1.png";
import s_haus_2 from "../assets/stock/haus-2.png";
import s_haus_3 from "../assets/stock/haus-3.png";
import s_haus_4 from "../assets/stock/haus-4.png";
import s_haus_5 from "../assets/stock/haus-5.png";
import s_haus_6 from "../assets/stock/haus-6.png";
import s_haus_7 from "../assets/stock/haus-7.png";
import s_haus_8 from "../assets/stock/haus-8.png";
import s_hobbit from "../assets/stock/hobbit.png";
import s_ritter from "../assets/stock/ritter.png";
import s_goblin from "../assets/stock/goblin.png";
import s_schleim from "../assets/stock/schleim.png";

export type StockGroup = "boden" | "wald" | "haeuser" | "deko" | "figuren" | "wasser" | "moebel" | "rahmen";
export type StockBrush = CustomBrush & { group: StockGroup };

export const STOCK: StockBrush[] = [
  { id: 200, group: "boden", kind: "ground", label: "Verliesboden", solid: false, talk: false, w: 1, h: 1, src: s_fliese },
  { id: 201, group: "boden", kind: "ground", label: "Verliesboden, rau", solid: false, talk: false, w: 1, h: 1, src: s_fliese_b },
  { id: 202, group: "boden", kind: "ground", label: "Verliesboden, dunkel", solid: false, talk: false, w: 1, h: 1, src: s_fliese_c },
  { id: 203, group: "wald", kind: "object", label: "Waldbaum", solid: true, talk: false, w: 1, h: 1, src: s_baum_rabite_a },
  { id: 204, group: "wald", kind: "object", label: "Waldbaum, schmal", solid: true, talk: false, w: 1, h: 1, src: s_baum_rabite_b },
  { id: 205, group: "wald", kind: "object", label: "Dschungelbaum", solid: true, talk: false, w: 1, h: 1, src: s_baum_dschungel_a },
  { id: 206, group: "wald", kind: "object", label: "Dschungelbaum, schmal", solid: true, talk: false, w: 1, h: 1, src: s_baum_dschungel_b },
  { id: 207, group: "wald", kind: "object", label: "Mondbaum", solid: true, talk: false, w: 1, h: 1, src: s_baum_mondlicht_a },
  { id: 208, group: "wald", kind: "object", label: "Mondbaum, schmal", solid: true, talk: false, w: 1, h: 1, src: s_baum_mondlicht_b },
  { id: 209, group: "wald", kind: "object", label: "Bäumchen", solid: true, talk: false, w: 1, h: 1, src: s_baeumchen },
  { id: 210, group: "wald", kind: "object", label: "Kleiner Baum", solid: true, talk: false, w: 1, h: 1, src: s_klein_baum },
  { id: 211, group: "deko", kind: "object", label: "Stumpf", solid: true, talk: false, w: 1, h: 1, src: s_stumpf },
  { id: 212, group: "deko", kind: "object", label: "Scheite", solid: false, talk: false, w: 1, h: 1, src: s_scheite },
  { id: 213, group: "deko", kind: "object", label: "Topf", solid: true, talk: false, w: 1, h: 1, src: s_topf },
  { id: 214, group: "deko", kind: "object", label: "Fass", solid: true, talk: false, w: 1, h: 1, src: s_fass },
  { id: 215, group: "deko", kind: "object", label: "Truhe", solid: true, talk: true, w: 1, h: 1, src: s_truhe },
  { id: 216, group: "deko", kind: "object", label: "Regal", solid: true, talk: false, w: 1, h: 1, src: s_regal },
  { id: 217, group: "deko", kind: "object", label: "Tisch", solid: true, talk: false, w: 1, h: 1, src: s_tisch },
  { id: 218, group: "deko", kind: "object", label: "Trank", solid: false, talk: false, w: 1, h: 1, src: s_trank },
  { id: 219, group: "deko", kind: "object", label: "Schlüssel", solid: false, talk: true, w: 1, h: 1, src: s_schluessel },
  { id: 220, group: "deko", kind: "object", label: "Beutel", solid: false, talk: false, w: 1, h: 1, src: s_beutel },
  { id: 221, group: "deko", kind: "object", label: "Fahne", solid: false, talk: false, w: 1, h: 1, src: s_fahne },
  { id: 222, group: "haeuser", kind: "object", label: "Haus 1", solid: true, talk: false, w: 2, h: 2, src: s_haus_1 },
  { id: 223, group: "haeuser", kind: "object", label: "Haus 2", solid: true, talk: false, w: 2, h: 2, src: s_haus_2 },
  { id: 224, group: "haeuser", kind: "object", label: "Haus 3", solid: true, talk: false, w: 2, h: 2, src: s_haus_3 },
  { id: 225, group: "haeuser", kind: "object", label: "Haus 4", solid: true, talk: false, w: 2, h: 2, src: s_haus_4 },
  { id: 226, group: "haeuser", kind: "object", label: "Haus 5", solid: true, talk: false, w: 2, h: 2, src: s_haus_5 },
  { id: 227, group: "haeuser", kind: "object", label: "Haus 6", solid: true, talk: false, w: 2, h: 2, src: s_haus_6 },
  { id: 228, group: "haeuser", kind: "object", label: "Haus 7", solid: true, talk: false, w: 2, h: 1, src: s_haus_7 },
  { id: 229, group: "haeuser", kind: "object", label: "Haus 8", solid: true, talk: false, w: 2, h: 1, src: s_haus_8 },
  { id: 230, group: "figuren", kind: "object", label: "Hobbit", solid: true, talk: true, w: 1, h: 1, src: s_hobbit },
  { id: 231, group: "figuren", kind: "object", label: "Ritter", solid: true, talk: false, w: 1, h: 1, src: s_ritter },
  { id: 232, group: "figuren", kind: "object", label: "Goblin", solid: true, talk: false, w: 1, h: 1, src: s_goblin },
  { id: 233, group: "figuren", kind: "object", label: "Schleim", solid: true, talk: false, w: 1, h: 1, src: s_schleim },
];
