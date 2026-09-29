import { useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { nextBrushId, prepareUpload, type CustomBrush } from "./library.ts";

const MAX_BRUSHES = 24;

export function LibrarySheet({
  brushes,
  onClose,
  onSave,
  onDelete,
}: {
  brushes: CustomBrush[];
  onClose: () => void;
  onSave: (brush: CustomBrush) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [kind, setKind] = useState<CustomBrush["kind"]>("object");
  const [label, setLabel] = useState("Eigene Grafik");
  const [solid, setSolid] = useState(true);
  const [talk, setTalk] = useState(false);
  const [w, setW] = useState(1);
  const [h, setH] = useState(1);
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const choose = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const next = await prepareUpload(file, kind);
      setSrc(next);
      const stem = file.name.replace(/\.[^.]+$/, "").trim();
      if (stem) setLabel(stem.slice(0, 24));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Bild nicht lesbar");
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!src) {
      setError("Bitte zuerst ein Bild wählen");
      return;
    }
    if (brushes.length >= MAX_BRUSHES) {
      setError("Höchstens 24 eigene Grafiken");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSave({
        id: nextBrushId(brushes),
        kind,
        label: label.trim() || "Eigene Grafik",
        solid,
        talk: kind === "object" && talk,
        w: kind === "object" ? w : 1,
        h: kind === "object" ? h : 1,
        src,
      });
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Grafik nicht gespeichert");
      setBusy(false);
    }
  };

  return (
    <div className="absolute inset-x-3 bottom-3 z-30 max-h-[70%] overflow-y-auto rounded-2xl border border-line bg-panel p-3 shadow-none">
      <div className="flex items-center gap-2">
        <p className="font-display text-lg leading-none">Eigene Grafik</p>
        <button type="button" onClick={onClose} className="ml-auto h-11 rounded-full px-3 text-sm text-ink-soft">
          Schließen
        </button>
      </div>
      <p className="mt-2 text-sm text-ink-soft">Boden wiederholt sich als Kachel. Ein Objekt steht auf der Fläche, die du darunter einstellst.</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="grid h-14 w-14 cursor-pointer place-items-center overflow-hidden rounded-xl border border-line bg-parchment">
          {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : <ImagePlus size={18} />}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              void choose(file);
            }}
          />
        </label>
        <input
          aria-label="Name der Grafik"
          value={label}
          maxLength={24}
          onChange={(event) => setLabel(event.target.value)}
          className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-parchment px-3 text-ink outline-none"
        />
        <button
          type="button"
          aria-pressed={kind === "ground"}
          onClick={() => setKind("ground")}
          className={`h-11 rounded-full px-3 text-sm ${kind === "ground" ? "bg-moss text-parchment" : "border border-line bg-parchment text-ink"}`}
        >
          Boden
        </button>
        <button
          type="button"
          aria-pressed={kind === "object"}
          onClick={() => setKind("object")}
          className={`h-11 rounded-full px-3 text-sm ${kind === "object" ? "bg-moss text-parchment" : "border border-line bg-parchment text-ink"}`}
        >
          Objekt
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-pressed={solid}
          onClick={() => setSolid((value) => !value)}
          className={`h-11 rounded-full px-3 text-sm ${solid ? "bg-walnut text-parchment" : "border border-line bg-parchment text-ink"}`}
        >
          Sperrt
        </button>
        {kind === "object" && (
          <button
            type="button"
            aria-pressed={talk}
            onClick={() => setTalk((value) => !value)}
            className={`h-11 rounded-full px-3 text-sm ${talk ? "bg-walnut text-parchment" : "border border-line bg-parchment text-ink"}`}
          >
            Spruch
          </button>
        )}
        {kind === "object" && (
          <>
            <span className="text-sm text-ink-soft">Fläche</span>
            <SizePair w={w} h={h} setW={setW} setH={setH} />
          </>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => void save()}
          className="ml-auto h-11 rounded-full bg-gold px-4 text-sm font-medium text-ink disabled:opacity-40"
        >
          Übernehmen
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-walnut">{error}</p>}
      {brushes.length > 0 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {brushes.map((brush) => (
            <li key={brush.id} className="flex w-16 shrink-0 flex-col items-center gap-1">
              <img src={brush.src} alt="" className="h-14 w-14 rounded-xl border border-line object-cover" />
              <span className="w-full truncate text-center text-sm text-ink-soft">{brush.label}</span>
              <button
                type="button"
                aria-label={`${brush.label} entfernen`}
                onClick={() => void onDelete(brush.id)}
                className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SizePair({
  w,
  h,
  setW,
  setH,
}: {
  w: number;
  h: number;
  setW: (value: number) => void;
  setH: (value: number) => void;
}) {
  return (
    <span className="flex items-center gap-1 text-sm">
      <Tiny value={w} label="Breite" onChange={setW} />
      <span className="text-ink-soft">×</span>
      <Tiny value={h} label="Höhe" onChange={setH} />
    </span>
  );
}

function Tiny({ value, label, onChange }: { value: number; label: string; onChange: (value: number) => void }) {
  return (
    <>
      <button type="button" aria-label={`${label} kleiner`} disabled={value <= 1} onClick={() => onChange(value - 1)} className="grid h-11 w-11 place-items-center rounded-full border border-line disabled:opacity-40">
        −
      </button>
      <span className="w-4 text-center">{value}</span>
      <button type="button" aria-label={`${label} größer`} disabled={value >= 8} onClick={() => onChange(value + 1)} className="grid h-11 w-11 place-items-center rounded-full border border-line disabled:opacity-40">
        +
      </button>
    </>
  );
}
