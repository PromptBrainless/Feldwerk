import bushUrl from "../assets/bush.png";
import cottageUrl from "../assets/cottage.png";
import earthUrl from "../assets/earth.jpg";
import fenceUrl from "../assets/fence.png";
import flowersUrl from "../assets/flowers.png";
import grassUrl from "../assets/grass.jpg";
import heroUrl from "../assets/hero.png";
import pathUrl from "../assets/path.jpg";
import rockUrl from "../assets/rock.png";
import sandUrl from "../assets/sand.jpg";
import signUrl from "../assets/sign.png";
import stoneUrl from "../assets/stone.jpg";
import treeUrl from "../assets/tree.png";
import waterUrl from "../assets/water.jpg";
import wellUrl from "../assets/well.png";

export const artUrls = {
  hero: heroUrl,
  grass: grassUrl,
  path: pathUrl,
  water: waterUrl,
  earth: earthUrl,
  sand: sandUrl,
  stone: stoneUrl,
  tree: treeUrl,
  bush: bushUrl,
  flowers: flowersUrl,
  rock: rockUrl,
  fence: fenceUrl,
  cottage: cottageUrl,
  sign: signUrl,
  well: wellUrl,
} as const;

export type ArtKey = keyof typeof artUrls;
export type ArtSet = Record<ArtKey, HTMLImageElement>;

export function loadArt(): Promise<ArtSet> {
  const entries = Object.entries(artUrls) as [ArtKey, string][];
  return Promise.all(
    entries.map(
      ([key, url]) =>
        new Promise<[ArtKey, HTMLImageElement]>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve([key, image]);
          image.onerror = () => reject(new Error(`Bild fehlt: ${key}`));
          image.src = url;
        }),
    ),
  ).then((loaded) => Object.fromEntries(loaded) as ArtSet);
}
