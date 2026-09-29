import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Eraser, Hand, ImagePlus, Pencil, RotateCcw, Shield, Undo2, Volume2, VolumeX } from "lucide-react";
import { ObjectId, GroundId } from "../runtime/types.ts";
import { FOOT_MAX, MAP_MAX, MAP_MIN } from "../runtime/tilemap.ts";
import { artUrls } from "./assets.ts";
import {
  applyStroke,
  attachInput,
  beginStroke,
  bootArt,
  createSim,
  draw,
  endStroke,
  ensureBrushImage,
  loadTown,
  openPlace,
  pointerTile,
  resetTown,
  resizeTown,
  saveTown,
  setTilePx,
  step,
  TILE_STEPS,
  undoTown,
  unlockAudio,
  type PaintLayer,
  type PaintTool,
  type Sim,
} from "./engine.ts";
import { deleteBrush, decodeImage, saveBrush, type CustomBrush } from "./library.ts";
import { LibrarySheet } from "./LibrarySheet.tsx";
import { STOCK, type StockGroup } from "./stock.ts";
import { DORF, loadDorfSrc } from "./dorf.ts";
import { PLACES } from "./places.ts";

const GROUNDS = [
  { id: GroundId.grass, label: "Gras", src: artUrls.grass, solid: false },
  { id: GroundId.path, label: "Weg", src: artUrls.path, solid: false },
  { id: GroundId.earth, label: "Erde", src: artUrls.earth, solid: false },
  { id: GroundId.sand, label: "Sand", src: artUrls.sand, solid: false },
  { id: GroundId.stone, label: "Stein", src: artUrls.stone, solid: false },
  { id: GroundId.water, label: "Wasser", src: artUrls.water, solid: true },
];

const OBJECTS = [
  { id: ObjectId.tree, label: "Baum", src: artUrls.tree, w: 1, h: 1, solid: true, talk: false },
  { id: ObjectId.bush, label: "Busch", src: artUrls.bush, w: 1, h: 1, solid: true, talk: false },
  { id: ObjectId.flowers, label: "Blumen", src: artUrls.flowers, w: 1, h: 1, solid: false, talk: false },
  { id: ObjectId.rock, label: "Fels", src: artUrls.rock, w: 1, h: 1, solid: true, talk: false },
  { id: ObjectId.fence, label: "Zaun", src: artUrls.fence, w: 1, h: 1, solid: true, talk: false },
  { id: ObjectId.cottage, label: "Haus", src: artUrls.cottage, w: 2, h: 2, solid: true, talk: true },
  { id: ObjectId.sign, label: "Schild", src: artUrls.sign, w: 1, h: 1, solid: true, talk: true },
  { id: ObjectId.well, label: "Brunnen", src: artUrls.well, w: 1, h: 1, solid: true, talk: true },
];

type Palette = "boden" | "dorf" | "eigen" | StockGroup;

const LIBRARY = [...STOCK, ...DORF];
const STRIDE = 64;

const PALETTES: { id: Palette; label: string }[] = [
  { id: "boden", label: "Boden" },
  { id: "dorf", label: "Dorf" },
  { id: "wasser", label: "Wasser" },
  { id: "wald", label: "Wald" },
  { id: "haeuser", label: "Häuser" },
  { id: "moebel", label: "Möbel" },
  { id: "deko", label: "Deko" },
  { id: "figuren", label: "Figuren" },
  { id: "rahmen", label: "Rahmen" },
  { id: "eigen", label: "Eigene" },
];

export function Workshop() {
  const simRef = useRef<Sim | null>(null);
  if (!simRef.current) simRef.current = createSim();
  const sim = simRef.current;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"play" | "draw">("play");
  const [tool, setTool] = useState<PaintTool>("brush");
  const [layer, setLayer] = useState<PaintLayer>("ground");
  const [palette, setPalette] = useState<Palette>("dorf");
  const [groundBrush, setGroundBrush] = useState<number>(GroundId.path);
  const [objectBrush, setObjectBrush] = useState<number>(ObjectId.tree);
  const [name, setName] = useState(sim.map.name);
  const [mapW, setMapW] = useState(sim.map.width);
  const [mapH, setMapH] = useState(sim.map.height);
  const [tilePx, setTile] = useState(sim.tile);
  const [footW, setFootW] = useState(1);
  const [footH, setFootH] = useState(1);
  const [stampSolid, setStampSolid] = useState(true);
  const [stampTalk, setStampTalk] = useState(false);
  const [groundSolid, setGroundSolid] = useState(false);
  const [customs, setCustoms] = useState<CustomBrush[]>([]);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [stamp, setStamp] = useState(sim.stampText);
  const [dialog, setDialog] = useState<string | null>(null);
  const [read, setRead] = useState(false);
  const [undos, setUndos] = useState(0);
  const [muted, setMuted] = useState(false);
  const [shown, setShown] = useState<Record<number, string>>({});

  sim.mode = mode;
  sim.tool = tool;
  sim.layer = layer;
  sim.groundBrush = groundBrush;
  sim.objectBrush = objectBrush;
  sim.stampText = stamp;
  sim.stamp = { w: footW, h: footH, solid: stampSolid, talk: stampTalk };
  sim.groundSolid = groundSolid;

  const pickBrush = (brush: CustomBrush) => {
    setTool("brush");
    if (brush.kind === "ground") {
      setLayer("ground");
      setGroundBrush(brush.id);
      setGroundSolid(brush.solid);
    } else {
      setLayer("object");
      setObjectBrush(brush.id);
      setFootW(brush.w);
      setFootH(brush.h);
      setStampSolid(brush.solid);
      setStampTalk(brush.talk);
    }
    void ensureBrushImage(sim, brush);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    loadTown(sim);
    setName(sim.map.name);
    setMapW(sim.map.width);
    setMapH(sim.map.height);
    setTile(sim.tile);
    setMuted(sim.muted);
    setRead(Boolean(sim.game.switches.sawSign));

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      sim.viewW = Math.max(1, rect.width);
      sim.viewH = Math.max(1, rect.height);
      canvas.width = Math.floor(sim.viewW * dpr);
      canvas.height = Math.floor(sim.viewH * dpr);
    };
    resize();
    const observer = new ResizeObserver(resize);
    if (canvas.parentElement) observer.observe(canvas.parentElement);

    const detach = attachInput(sim);
    let raf = 0;
    let last = performance.now();
    let pub = { dialog: null as string | null, read: false, undos: 0 };
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      step(sim, dt);
      const ctx = canvas.getContext("2d");
      if (ctx) draw(ctx, sim);
      const nextRead = Boolean(sim.game.switches.sawSign);
      if (sim.dialog !== pub.dialog || nextRead !== pub.read || sim.undo.length !== pub.undos) {
        pub = { dialog: sim.dialog, read: nextRead, undos: sim.undo.length };
        setDialog(sim.dialog);
        setRead(nextRead);
        setUndos(sim.undo.length);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    bootArt(sim, () => setCustoms([...sim.customs]));

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      detach();
    };
  }, [sim]);

  const pan = useRef<{ x: number; y: number; camX: number; camY: number } | null>(null);

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    unlockAudio(sim);
    event.currentTarget.setPointerCapture(event.pointerId);
    const tile = pointerTile(sim, event.currentTarget, event.clientX, event.clientY);
    sim.hover = tile;
    if (sim.mode !== "draw") return;
    if (sim.tool === "hand") {
      pan.current = { x: event.clientX, y: event.clientY, camX: sim.cam.x, camY: sim.cam.y };
      return;
    }
    beginStroke(sim, tile);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    sim.hover = pointerTile(sim, event.currentTarget, event.clientX, event.clientY);
    if (pan.current) {
      sim.cam.x = pan.current.camX - (event.clientX - pan.current.x);
      sim.cam.y = pan.current.camY - (event.clientY - pan.current.y);
      return;
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) applyStroke(sim, sim.hover);
  };

  const onPointerUp = () => {
    endStroke(sim);
    pan.current = null;
    setUndos(sim.undo.length);
    if (sim.hover) {
      const text = sim.map.messages[`${sim.hover.x},${sim.hover.y}`];
      if (text != null) setStamp(text);
    }
  };

  const holdDir = (dir: "up" | "down" | "left" | "right" | null) => {
    sim.touchDir = dir;
  };

  const chips = useMemo(() => {
    const list: Chip[] = [];
    if (palette === "boden") {
      for (const entry of GROUNDS) {
        list.push({
          key: entry.label,
          label: entry.label,
          src: entry.src,
          selected: groundBrush === entry.id,
          fit: "cover",
          onPick: () => {
            setTool("brush");
            setLayer("ground");
            setGroundBrush(entry.id);
            setGroundSolid(entry.solid);
          },
        });
      }
    }
    if (palette === "dorf") {
      for (const entry of OBJECTS) {
        list.push({
          key: entry.label,
          label: entry.label,
          src: entry.src,
          selected: objectBrush === entry.id,
          fit: "contain",
          onPick: () => {
            setTool("brush");
            setLayer("object");
            setObjectBrush(entry.id);
            setFootW(entry.w);
            setFootH(entry.h);
            setStampSolid(entry.solid);
            setStampTalk(entry.talk);
          },
        });
      }
    }
    if (palette === "eigen") {
      for (const brush of customs) {
        list.push({
          key: String(brush.id),
          label: brush.label,
          src: brush.src,
          selected: brush.kind === "ground" ? groundBrush === brush.id : objectBrush === brush.id,
          fit: brush.kind === "ground" ? "cover" : "contain",
          onPick: () => pickBrush(brush),
        });
      }
    }
    if (palette !== "dorf" && palette !== "eigen") {
      for (const brush of STOCK) {
        if (brush.group !== palette) continue;
        list.push({
          key: `stock-${brush.id}`,
          label: brush.label,
          src: brush.src,
          selected: brush.kind === "ground" ? groundBrush === brush.id : objectBrush === brush.id,
          fit: brush.kind === "ground" ? "cover" : "contain",
          onPick: () => pickBrush(brush),
        });
      }
      for (const brush of DORF) {
        if (brush.group !== palette) continue;
        list.push({
          key: `dorf-${brush.id}`,
          label: brush.label,
          src: shown[brush.id] || brush.src || undefined,
          lazyId: brush.id,
          selected: brush.kind === "ground" ? groundBrush === brush.id : objectBrush === brush.id,
          fit: brush.kind === "ground" ? "cover" : "contain",
          onPick: () => pickBrush(brush),
        });
      }
    }
    return list;
  }, [palette, groundBrush, objectBrush, customs, shown, footW, footH]);

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-parchment text-ink">
      <header className="shrink-0 border-b border-line bg-panel">
        <div className="flex min-h-14 items-center gap-2 px-3 py-2">
        <div className="min-w-0">
          <p className="font-display text-lg leading-none tracking-tight">Feldwerk</p>
          <input
            aria-label="Name der Karte"
            value={name}
            maxLength={40}
            onChange={(event) => {
              const value = event.target.value;
              setName(value);
              sim.map.name = value || "Beispielstadt";
              saveTown(sim);
            }}
            className="w-36 bg-transparent text-sm text-ink-soft outline-none"
          />
          <p className="text-sm text-ink-soft">
            {mapW} × {mapH} · {tilePx} px
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {read && mode === "play" && (
            <span className="hidden text-sm text-moss sm:inline">Gelesen</span>
          )}
          <button
            type="button"
            aria-pressed={muted}
            aria-label={muted ? "Ton an" : "Ton aus"}
            onClick={() => {
              sim.muted = !sim.muted;
              setMuted(sim.muted);
              saveTown(sim);
              if (!sim.muted) unlockAudio(sim);
            }}
            className="grid h-11 w-11 place-items-center rounded-full border border-line bg-parchment text-ink"
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button
            type="button"
            aria-pressed={mode === "play"}
            onClick={() => setMode("play")}
            className={`h-11 rounded-full px-4 text-sm font-medium ${mode === "play" ? "bg-moss text-parchment" : "border border-line bg-parchment text-ink"}`}
          >
            Spielen
          </button>
          <button
            type="button"
            aria-pressed={mode === "draw"}
            onClick={() => setMode("draw")}
            className={`h-11 rounded-full px-4 text-sm font-medium ${mode === "draw" ? "bg-moss text-parchment" : "border border-line bg-parchment text-ink"}`}
          >
            Zeichnen
          </button>
        </div>
        </div>
        <div className="flex gap-1 overflow-x-auto px-3 pb-2">
          {PLACES.map((place) => (
            <button
              key={place.id}
              type="button"
              aria-pressed={name === place.label}
              onClick={() => {
                openPlace(sim, place.id);
                setName(sim.map.name);
                setMapW(sim.map.width);
                setMapH(sim.map.height);
                setDialog(null);
                setRead(false);
                setUndos(0);
              }}
              className={`h-11 shrink-0 rounded-full px-3 text-sm ${name === place.label ? "bg-moss text-parchment" : "border border-line bg-parchment text-ink"}`}
            >
              {place.label}
            </button>
          ))}
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
        <p className="pointer-events-none absolute left-3 top-3 rounded-full bg-panel/90 px-3 py-1 text-sm text-ink-soft">
          {mode === "play"
            ? "WASD oder Pfeile. Leertaste spricht."
            : "Karte, Fläche und eigene Grafiken stellst du unten ein."}
        </p>

        {dialog && (
          <div className="absolute inset-x-3 bottom-36 z-20 rounded-2xl border border-line bg-panel p-4 md:bottom-4 md:left-1/2 md:w-[34rem] md:-translate-x-1/2">
            <p className="font-display text-xl leading-snug">{dialog}</p>
            <button
              type="button"
              className="mt-3 h-11 rounded-full bg-gold px-5 font-medium text-ink"
              onClick={() => {
                unlockAudio(sim);
                sim.touchPulse = true;
              }}
            >
              Weiter
            </button>
          </div>
        )}

        {mode === "play" && (
          <div className="absolute bottom-4 left-3 z-10 grid grid-cols-3 gap-1 md:hidden">
            <span />
            <DirButton label="Hoch" icon={<ChevronUp size={20} />} onHold={(down) => holdDir(down ? "up" : null)} />
            <span />
            <DirButton label="Links" icon={<ChevronLeft size={20} />} onHold={(down) => holdDir(down ? "left" : null)} />
            <span />
            <DirButton label="Rechts" icon={<ChevronRight size={20} />} onHold={(down) => holdDir(down ? "right" : null)} />
            <span />
            <DirButton label="Runter" icon={<ChevronDown size={20} />} onHold={(down) => holdDir(down ? "down" : null)} />
            <span />
          </div>
        )}
        {mode === "play" && (
          <button
            type="button"
            className="absolute bottom-8 right-3 z-10 h-14 w-14 rounded-full bg-moss text-sm font-medium text-parchment md:hidden"
            onPointerDown={(event) => {
              event.preventDefault();
              unlockAudio(sim);
              sim.touchPulse = true;
            }}
          >
            Reden
          </button>
        )}
        {libraryOpen && (
          <LibrarySheet
            brushes={customs}
            onClose={() => setLibraryOpen(false)}
            onSave={async (brush) => {
              await saveBrush(brush);
              sim.customImages[brush.id] = await decodeImage(brush.src);
              sim.customs = [...sim.customs, brush];
              setCustoms([...sim.customs]);
              setTool("brush");
              if (brush.kind === "ground") {
                setLayer("ground");
                setGroundBrush(brush.id);
                setGroundSolid(brush.solid);
              } else {
                setLayer("object");
                setObjectBrush(brush.id);
                setFootW(brush.w);
                setFootH(brush.h);
                setStampSolid(brush.solid);
                setStampTalk(brush.talk);
              }
            }}
            onDelete={async (id) => {
              await deleteBrush(id);
              delete sim.customImages[id];
              sim.customs = sim.customs.filter((brush) => brush.id !== id);
              setCustoms([...sim.customs]);
            }}
          />
        )}
      </div>

      {mode === "draw" && (
        <section className="shrink-0 border-t border-line bg-panel px-3 py-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <ToolButton label="Pinsel" iconOnly pressed={tool === "brush"} onClick={() => setTool("brush")}>
              <Pencil size={16} />
            </ToolButton>
            <ToolButton label="Radierer" iconOnly pressed={tool === "erase"} onClick={() => setTool("erase")}>
              <Eraser size={16} />
            </ToolButton>
            <ToolButton label="Sperre" iconOnly pressed={tool === "block"} onClick={() => setTool("block")}>
              <Shield size={16} />
            </ToolButton>
            <ToolButton label="Hand" iconOnly pressed={tool === "hand"} onClick={() => setTool("hand")}>
              <Hand size={16} />
            </ToolButton>
            <span className="mx-1 h-6 w-px bg-line" />
            <ToolButton
              label="Boden"
              pressed={layer === "ground"}
              onClick={() => {
                setLayer("ground");
                setPalette("boden");
                setTool("brush");
              }}
            />
            <ToolButton
              label="Objekte"
              pressed={layer === "object"}
              onClick={() => {
                setLayer("object");
                setPalette("dorf");
                setTool("brush");
              }}
            />
            <span className="mx-1 h-6 w-px bg-line" />
            <button
              type="button"
              disabled={undos === 0}
              onClick={() => {
                undoTown(sim);
                setMapW(sim.map.width);
                setMapH(sim.map.height);
                setUndos(sim.undo.length);
              }}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line text-ink disabled:opacity-40"
              aria-label="Rückgängig"
            >
              <Undo2 size={16} />
            </button>
            <button
              type="button"
              onClick={() => {
                resetTown(sim);
                setName(sim.map.name);
                setMapW(sim.map.width);
                setMapH(sim.map.height);
                setDialog(null);
                setRead(false);
                setUndos(0);
              }}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line text-ink"
              aria-label="Beispielstadt neu"
            >
              <RotateCcw size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {PALETTES.map((entry) => (
              <button
                key={entry.id}
                type="button"
                aria-pressed={palette === entry.id}
                onClick={() => {
                  setPalette(entry.id);
                  setTool("brush");
                  if (entry.id === "boden") setLayer("ground");
                  else if (entry.id !== "eigen") setLayer("object");
                }}
                className={`h-11 shrink-0 rounded-full px-3 text-sm ${palette === entry.id ? "bg-moss text-parchment" : "border border-line bg-parchment text-ink"}`}
              >
                {entry.label}
              </button>
            ))}
            <span className="shrink-0 text-sm text-ink-soft">
              {(layer === "ground" ? GROUNDS : OBJECTS).find((entry) => entry.id === (layer === "ground" ? groundBrush : objectBrush))?.label ??
                LIBRARY.find((entry) => entry.id === (layer === "ground" ? groundBrush : objectBrush))?.label ??
                customs.find((entry) => entry.id === (layer === "ground" ? groundBrush : objectBrush))?.label ??
                ""}
            </span>
          </div>
          <div className="flex w-full min-w-0 items-center gap-2 pb-1">
            <VirtualSwatches chips={chips} onShow={setShown} />
            <button
              type="button"
              onClick={() => setLibraryOpen(true)}
              className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-dashed border-line text-ink"
              aria-label="Grafik hochladen"
            >
              <ImagePlus size={18} />
            </button>
            {layer === "object" && (
              <label className="flex min-w-48 flex-1 items-center gap-2 text-sm text-ink-soft">
                Spruch
                <input
                  value={stamp}
                  maxLength={140}
                  onChange={(event) => {
                    const value = event.target.value;
                    setStamp(value);
                    sim.stampText = value;
                    if (sim.hover) {
                      const cell = `${sim.hover.x},${sim.hover.y}`;
                      if (cell in sim.map.messages) {
                        sim.map.messages[cell] = value;
                        saveTown(sim);
                      }
                    }
                  }}
                  className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-parchment px-3 text-ink outline-none"
                />
              </label>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="shrink-0 text-sm text-ink-soft">Karte</span>
            <Stepper
              label="Kartenbreite"
              value={mapW}
              min={MAP_MIN}
              max={MAP_MAX}
              onChange={(value) => {
                resizeTown(sim, value, mapH);
                setMapW(sim.map.width);
                setMapH(sim.map.height);
                setUndos(sim.undo.length);
              }}
            />
            <span className="text-sm text-ink-soft">×</span>
            <Stepper
              label="Kartenhöhe"
              value={mapH}
              min={MAP_MIN}
              max={MAP_MAX}
              onChange={(value) => {
                resizeTown(sim, mapW, value);
                setMapW(sim.map.width);
                setMapH(sim.map.height);
                setUndos(sim.undo.length);
              }}
            />
            <span className="mx-1 h-6 w-px shrink-0 bg-line" />
            <span className="shrink-0 text-sm text-ink-soft">Auflösung</span>
            {TILE_STEPS.map((px) => (
              <button
                key={px}
                type="button"
                aria-pressed={tilePx === px}
                onClick={() => {
                  setTile(px);
                  setTilePx(sim, px);
                }}
                className={`h-11 shrink-0 rounded-full px-3 text-sm ${tilePx === px ? "bg-moss text-parchment" : "border border-line bg-parchment text-ink"}`}
              >
                {px}
              </button>
            ))}
            {layer === "object" && (
              <>
                <span className="mx-1 h-6 w-px shrink-0 bg-line" />
                <span className="shrink-0 text-sm text-ink-soft">Fläche</span>
                <Stepper label="Objektbreite" value={footW} min={1} max={FOOT_MAX} onChange={setFootW} />
                <span className="text-sm text-ink-soft">×</span>
                <Stepper label="Objekthöhe" value={footH} min={1} max={FOOT_MAX} onChange={setFootH} />
              </>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

type Chip = {
  key: string;
  label: string;
  src?: string;
  lazyId?: number;
  selected: boolean;
  fit: "cover" | "contain";
  onPick: () => void;
};

function VirtualSwatches({ chips, onShow }: { chips: Chip[]; onShow: (patch: (prev: Record<number, string>) => Record<number, string>) => void }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [span, setSpan] = useState({ start: 0, end: 10 });
  const signature = chips.map((chip) => chip.key).join("|");

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollLeft = 0;
    const measure = () => {
      const start = Math.max(0, Math.floor(el.scrollLeft / STRIDE) - 2);
      const visible = Math.ceil(el.clientWidth / STRIDE) + 5;
      const end = Math.min(chips.length, start + visible);
      setSpan((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
    };
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [signature, chips.length]);

  useEffect(() => {
    let live = true;
    const ids = chips.slice(span.start, span.end).flatMap((chip) => (chip.lazyId != null && !chip.src ? [chip.lazyId] : []));
    if (ids.length === 0) return;
    void Promise.all(ids.map(async (id) => [id, await loadDorfSrc(id)] as const)).then((pairs) => {
      if (!live) return;
      onShow((prev) => {
        const next = { ...prev };
        for (const [id, src] of pairs) if (src) next[id] = src;
        return next;
      });
    });
    return () => {
      live = false;
    };
  }, [signature, span.start, span.end, chips, onShow]);

  const slice = chips.slice(span.start, span.end);
  return (
    <div ref={scroller} className="min-w-0 flex-1 overflow-x-auto">
      <div className="relative h-14" style={{ width: Math.max(chips.length, 1) * STRIDE }}>
        {slice.map((chip, index) => (
          <div key={chip.key} className="absolute top-0" style={{ left: (span.start + index) * STRIDE }}>
            {chip.src ? (
              <Swatch label={chip.label} src={chip.src} selected={chip.selected} fit={chip.fit} onPick={chip.onPick} />
            ) : (
              <button
                type="button"
                aria-label={chip.label}
                onClick={chip.onPick}
                className="block h-14 w-14 rounded-xl border border-line bg-parchment-deep"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Swatch({
  label,
  src,
  selected,
  fit,
  onPick,
}: {
  label: string;
  src: string;
  selected: boolean;
  fit: "cover" | "contain";
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      onClick={onPick}
      className={`grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl border bg-parchment-deep ${selected ? "border-gold ring-2 ring-gold" : "border-line"}`}
    >
      <img src={src} alt="" className={fit === "cover" ? "h-full w-full object-cover" : "max-h-full max-w-full object-contain"} />
    </button>
  );
}

function ToolButton({
  label,
  pressed,
  onClick,
  children,
  iconOnly = false,
}: {
  label: string;
  pressed: boolean;
  onClick: () => void;
  children?: React.ReactNode;
  iconOnly?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      onClick={onClick}
      className={`flex h-11 shrink-0 items-center gap-1 rounded-full px-3 text-sm ${pressed ? "bg-walnut text-parchment" : "border border-line bg-parchment text-ink"}`}
    >
      {children}
      <span className={iconOnly ? "hidden sm:inline" : undefined}>{label}</span>
    </button>
  );
}

function DirButton({
  label,
  icon,
  onHold,
}: {
  label: string;
  icon: React.ReactNode;
  onHold: (down: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid h-12 w-12 place-items-center rounded-xl border border-line bg-panel text-ink"
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        onHold(true);
      }}
      onPointerUp={() => onHold(false)}
      onPointerCancel={() => onHold(false)}
    >
      {icon}
    </button>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <span className="flex shrink-0 items-center">
      <button
        type="button"
        aria-label={`${label} kleiner`}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink disabled:opacity-40"
      >
        −
      </button>
      <span className="w-8 text-center text-sm">{value}</span>
      <button
        type="button"
        aria-label={`${label} größer`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink disabled:opacity-40"
      >
        +
      </button>
    </span>
  );
}
