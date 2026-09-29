const DB_NAME = "feldwerk-library";
const STORE = "brushes";

export type CustomBrush = {
  id: number;
  kind: "ground" | "object";
  label: string;
  solid: boolean;
  talk: boolean;
  w: number;
  h: number;
  src: string;
  pivot_px?: number;
  pivot_py?: number;
  stand_b?: number;
  stand_s?: number;
  tuer_dx?: number | null;
  tuer_dy?: number | null;
  objectalignment?: "bottom";
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Bibliothek nicht erreichbar"));
  });
}

export async function listBrushes(): Promise<CustomBrush[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
    request.onsuccess = () => {
      const rows = (request.result as CustomBrush[]).slice().sort((a, b) => a.id - b.id);
      resolve(rows);
      db.close();
    };
    request.onerror = () => {
      reject(request.error ?? new Error("Bibliothek nicht lesbar"));
      db.close();
    };
  });
}

export async function saveBrush(brush: CustomBrush): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE, "readwrite").objectStore(STORE).put(brush);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Grafik nicht gespeichert"));
  });
  db.close();
}

export async function deleteBrush(id: number): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE, "readwrite").objectStore(STORE).delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Grafik nicht entfernt"));
  });
  db.close();
}

export function nextBrushId(brushes: CustomBrush[]) {
  return brushes.reduce((max, brush) => Math.max(max, brush.id), 99) + 1;
}

export function decodeImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Bild nicht lesbar"));
    image.src = src;
  });
}

function fitCover(source: CanvasImageSource, sw: number, sh: number, size: number) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Bild nicht lesbar");
  const scale = Math.max(size / sw, size / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  ctx.drawImage(source, (size - dw) / 2, (size - dh) / 2, dw, dh);
  return canvas.toDataURL("image/jpeg", 0.86);
}

function fitInside(source: CanvasImageSource, sw: number, sh: number, max: number) {
  const scale = Math.min(1, max / Math.max(sw, sh));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(sw * scale));
  canvas.height = Math.max(1, Math.round(sh * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Bild nicht lesbar");
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

export async function prepareUpload(file: File, kind: CustomBrush["kind"]): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Nur Bilder");
  if (file.size > 8_000_000) throw new Error("Das Bild ist zu groß");
  const src = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Bild nicht lesbar"));
    reader.readAsDataURL(file);
  });
  const image = await decodeImage(src);
  if (kind === "ground") return fitCover(image, image.width, image.height, 512);
  return fitInside(image, image.width, image.height, 768);
}
