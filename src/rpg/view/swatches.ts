/**
 * Reine Fensterberechnung für die Asset-Leiste. Die Leiste darf nie den ganzen
 * Katalog auf einmal einhängen oder dekodieren (siehe docs/assets.md), darum
 * ist dieser Ausschnitt aus VirtualSwatches herausgezogen und für sich testbar.
 */
export type SwatchWindow = { cols: number; start: number; end: number };

export function computeSwatchWindow(params: {
  clientWidth: number;
  scrollLeft: number;
  scrollTop: number;
  rows: number;
  total: number;
  stride?: number;
}): SwatchWindow {
  const stride = params.stride ?? 64;
  const total = Math.max(0, params.total);
  const wide = params.rows === 1;
  const cols = wide ? Math.max(total, 1) : Math.max(1, Math.min(12, Math.floor(params.clientWidth / stride)));
  const start = wide
    ? Math.max(0, Math.floor(params.scrollLeft / stride) - 2)
    : Math.max(0, Math.floor(params.scrollTop / stride) - 1) * cols;
  const end = wide
    ? Math.min(total, start + Math.ceil(params.clientWidth / stride) + 5)
    : Math.min(total, start + (params.rows + 2) * cols);
  return { cols, start: Math.min(start, total), end };
}
