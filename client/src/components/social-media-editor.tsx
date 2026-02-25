import { useState, useRef, useEffect, useCallback } from "react";
import type { MarketingMedia } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2, RotateCcw, Type, Palette, Sparkles, Hash, Copy, Check, Lightbulb } from "lucide-react";

type SocialFormat = "post" | "story" | "reel";

interface FormatConfig {
  width: number;
  height: number;
  label: string;
  description: string;
}

const FORMATS: Record<SocialFormat, FormatConfig> = {
  post: { width: 1080, height: 1080, label: "Post", description: "1080×1080" },
  story: { width: 1080, height: 1920, label: "Historia", description: "1080×1920" },
  reel: { width: 1080, height: 1920, label: "Reel", description: "1080×1920" },
};

interface TextOverlay {
  text: string;
  fontSize: number;
  color: string;
  position: "top" | "center" | "bottom";
  bold: boolean;
}

interface EditorState {
  format: SocialFormat;
  brightness: number;
  overlay: boolean;
  overlayColor: string;
  overlayOpacity: number;
  branding: boolean;
  title: TextOverlay;
  subtitle: TextOverlay;
  filter: "none" | "warm" | "cool" | "bw" | "contrast";
}

const DEFAULT_STATE: EditorState = {
  format: "post",
  brightness: 100,
  overlay: true,
  overlayColor: "#000000",
  overlayOpacity: 40,
  branding: true,
  title: {
    text: "",
    fontSize: 64,
    color: "#FFFFFF",
    position: "center",
    bold: true,
  },
  subtitle: {
    text: "",
    fontSize: 36,
    color: "#D4A824",
    position: "bottom",
    bold: false,
  },
  filter: "none",
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? current + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

async function renderCanvas(
  canvas: HTMLCanvasElement,
  imgSrc: string,
  state: EditorState
): Promise<void> {
  const fmt = FORMATS[state.format];
  const W = fmt.width;
  const H = fmt.height;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, W, H);

  try {
    const img = await loadImage(imgSrc);
    const imgRatio = img.width / img.height;
    const canvasRatio = W / H;
    let sx = 0, sy = 0, sw = img.width, sh = img.height;
    if (imgRatio > canvasRatio) {
      sw = img.height * canvasRatio;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / canvasRatio;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
  } catch {
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#888";
    ctx.font = "40px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Error al cargar imagen", W / 2, H / 2);
    return;
  }

  if (state.brightness !== 100) {
    const alpha = state.brightness < 100
      ? (100 - state.brightness) / 100
      : 0;
    if (state.brightness < 100) {
      ctx.fillStyle = `rgba(0,0,0,${alpha})`;
      ctx.fillRect(0, 0, W, H);
    } else {
      ctx.fillStyle = `rgba(255,255,255,${(state.brightness - 100) / 200})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  if (state.filter !== "none") {
    ctx.save();
    switch (state.filter) {
      case "warm":
        ctx.fillStyle = "rgba(255,140,0,0.12)";
        ctx.fillRect(0, 0, W, H);
        break;
      case "cool":
        ctx.fillStyle = "rgba(0,100,255,0.12)";
        ctx.fillRect(0, 0, W, H);
        break;
      case "bw": {
        const imageData = ctx.getImageData(0, 0, W, H);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }
        ctx.putImageData(imageData, 0, 0);
        break;
      }
      case "contrast": {
        const imageData = ctx.getImageData(0, 0, W, H);
        const data = imageData.data;
        const factor = 1.3;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
          data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
          data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
        }
        ctx.putImageData(imageData, 0, 0);
        break;
      }
    }
    ctx.restore();
  }

  if (state.overlay) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, hexToRgba(state.overlayColor, state.overlayOpacity / 100 * 0.8));
    grad.addColorStop(0.3, hexToRgba(state.overlayColor, state.overlayOpacity / 100 * 0.3));
    grad.addColorStop(0.7, hexToRgba(state.overlayColor, state.overlayOpacity / 100 * 0.3));
    grad.addColorStop(1, hexToRgba(state.overlayColor, state.overlayOpacity / 100 * 0.9));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  if (state.branding) {
    const brandH = state.format === "post" ? 100 : 120;
    const topGrad = ctx.createLinearGradient(0, 0, 0, brandH);
    topGrad.addColorStop(0, "rgba(3,29,10,0.85)");
    topGrad.addColorStop(1, "rgba(3,29,10,0)");
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, W, brandH);

    const gold = "#D4A824";
    const lineY = brandH - 4;
    const lineGrad = ctx.createLinearGradient(0, lineY, W, lineY);
    lineGrad.addColorStop(0, "transparent");
    lineGrad.addColorStop(0.15, gold);
    lineGrad.addColorStop(0.85, gold);
    lineGrad.addColorStop(1, "transparent");
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, lineY);
    ctx.lineTo(W, lineY);
    ctx.stroke();

    ctx.fillStyle = "#FFE066";
    ctx.font = "900 32px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("LA LIGA DE CAMPEONES", W / 2, brandH - 28);

    const bottomBrandY = H - 60;
    const btmGrad = ctx.createLinearGradient(0, bottomBrandY - 40, 0, H);
    btmGrad.addColorStop(0, "rgba(3,29,10,0)");
    btmGrad.addColorStop(1, "rgba(3,29,10,0.85)");
    ctx.fillStyle = btmGrad;
    ctx.fillRect(0, bottomBrandY - 40, W, 100);

    const btmLineGrad = ctx.createLinearGradient(0, bottomBrandY - 30, W, bottomBrandY - 30);
    btmLineGrad.addColorStop(0, "transparent");
    btmLineGrad.addColorStop(0.15, gold + "60");
    btmLineGrad.addColorStop(0.85, gold + "60");
    btmLineGrad.addColorStop(1, "transparent");
    ctx.strokeStyle = btmLineGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, bottomBrandY - 30);
    ctx.lineTo(W, bottomBrandY - 30);
    ctx.stroke();

    ctx.fillStyle = gold + "BB";
    ctx.font = "600 20px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("www.laligadecampeones.es  |  @laligadecampeones", W / 2, bottomBrandY + 10);
  }

  const drawTextOverlay = (overlay: TextOverlay, isTitle: boolean) => {
    if (!overlay.text.trim()) return;
    const padding = 60;
    const maxW = W - padding * 2;
    const weight = overlay.bold ? "900" : "600";
    ctx.font = `${weight} ${overlay.fontSize}px 'Segoe UI', Arial, sans-serif`;
    ctx.textAlign = "center";

    const lines = wrapText(ctx, overlay.text, maxW);
    const lineHeight = overlay.fontSize * 1.2;
    const totalH = lines.length * lineHeight;

    let startY: number;
    if (overlay.position === "top") {
      startY = state.branding ? 140 + overlay.fontSize : 60 + overlay.fontSize;
    } else if (overlay.position === "center") {
      startY = (H - totalH) / 2 + overlay.fontSize;
    } else {
      startY = H - totalH - (state.branding ? 100 : 40);
    }

    ctx.save();
    if (isTitle) {
      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
    } else {
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    }

    ctx.fillStyle = overlay.color;
    lines.forEach((line, i) => {
      ctx.fillText(line, W / 2, startY + i * lineHeight);
    });
    ctx.restore();
  };

  drawTextOverlay(state.title, true);
  drawTextOverlay(state.subtitle, false);
}

interface TitleSuggestion {
  title: string;
  subtitle: string;
  category: string;
}

const TITLE_SUGGESTIONS: TitleSuggestion[] = [
  { category: "Partido", title: "Jornada de Liga", subtitle: "La Liga de Campeones 2026" },
  { category: "Partido", title: "Noche de Fútbol", subtitle: "Vive la emoción del partido" },
  { category: "Partido", title: "Día de Clásico", subtitle: "El encuentro que todos esperan" },
  { category: "Partido", title: "Gran Derbi", subtitle: "La Liga de Campeones presenta" },
  { category: "Resultado", title: "Resultado Final", subtitle: "Resumen de la jornada" },
  { category: "Resultado", title: "Victoria Épica", subtitle: "Otro gran partido en la Liga" },
  { category: "Resultado", title: "Goleada Histórica", subtitle: "Momento inolvidable de la temporada" },
  { category: "Promo", title: "Inscribe Tu Equipo", subtitle: "Temporada 2026 - Plazas limitadas" },
  { category: "Promo", title: "Únete a La Liga", subtitle: "La mejor competición amateur" },
  { category: "Promo", title: "Nueva Temporada", subtitle: "Abierto el plazo de inscripción" },
  { category: "Promo", title: "Sé Parte de la Historia", subtitle: "La Liga de Campeones te espera" },
  { category: "Evento", title: "Entrega de Premios", subtitle: "Temporada 2026" },
  { category: "Evento", title: "Sorteo de Calendario", subtitle: "Comienza la emoción" },
  { category: "Evento", title: "Inauguración", subtitle: "Arranca la competición" },
  { category: "Equipo", title: "Plantilla Oficial", subtitle: "Temporada 2026" },
  { category: "Equipo", title: "Refuerzo Confirmado", subtitle: "Bienvenido al equipo" },
  { category: "Highlight", title: "Golazo de la Jornada", subtitle: "Momentos mágicos" },
  { category: "Highlight", title: "Mejores Jugadas", subtitle: "Lo mejor de la jornada" },
  { category: "Highlight", title: "MVP de la Jornada", subtitle: "El mejor jugador del partido" },
];

const HASHTAG_GROUPS = {
  principales: [
    "#LaLigaDeCampeones",
    "#LigaDeCampeones2026",
    "#FútbolAmateur",
    "#Fuengirola",
  ],
  partido: [
    "#DíaDePartido",
    "#JornadaDeLiga",
    "#FútbolEnVivo",
    "#VamosEquipo",
    "#GolGolGol",
    "#NocheDeFútbol",
  ],
  resultado: [
    "#ResultadoFinal",
    "#Victoria",
    "#Goleada",
    "#ResumenDelPartido",
    "#TressPuntos",
  ],
  promo: [
    "#InscribeTuEquipo",
    "#NuevaTemporada",
    "#FútbolParaTodos",
    "#CompeticiónAmateur",
    "#TemporadaNueva",
  ],
  general: [
    "#Fútbol",
    "#Soccer",
    "#Football",
    "#DeporteLocal",
    "#PasiónPorElFútbol",
    "#FútbolEsVida",
    "#AmorAlFútbol",
    "#CanteraDelFútbol",
  ],
  redes: [
    "#InstaFútbol",
    "#FútbolGram",
    "#ReelsFútbol",
    "#MatchDay",
    "#Gameday",
  ],
};

interface SocialMediaEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  media: MarketingMedia | null;
  allPhotos: MarketingMedia[];
}

export function SocialMediaEditor({ open, onOpenChange, media, allPhotos }: SocialMediaEditorProps) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<EditorState>({ ...DEFAULT_STATE });
  const [isRendering, setIsRendering] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<MarketingMedia | null>(media);
  const renderTimeout = useRef<ReturnType<typeof setTimeout>>();
  const [selectedHashtags, setSelectedHashtags] = useState<Set<string>>(new Set(HASHTAG_GROUPS.principales));
  const [copiedHashtags, setCopiedHashtags] = useState(false);
  const [suggestionCategory, setSuggestionCategory] = useState<string>("all");

  useEffect(() => {
    if (media) {
      setSelectedPhoto(media);
    }
  }, [media]);

  const doRender = useCallback(async () => {
    if (!canvasRef.current || !selectedPhoto) return;
    setIsRendering(true);
    try {
      await renderCanvas(canvasRef.current, selectedPhoto.url, state);
    } catch {
      console.error("Error rendering canvas");
    } finally {
      setIsRendering(false);
    }
  }, [selectedPhoto, state]);

  useEffect(() => {
    if (!open || !selectedPhoto) return;
    if (renderTimeout.current) clearTimeout(renderTimeout.current);
    renderTimeout.current = setTimeout(doRender, 100);
    return () => {
      if (renderTimeout.current) clearTimeout(renderTimeout.current);
    };
  }, [open, doRender, selectedPhoto]);

  const handleDownload = async () => {
    if (!canvasRef.current || !selectedPhoto) return;
    setIsDownloading(true);
    try {
      await renderCanvas(canvasRef.current, selectedPhoto.url, state);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvasRef.current!.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error("No se pudo crear la imagen"));
        }, "image/png");
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const formatLabel = FORMATS[state.format].label.toLowerCase();
      a.download = `liga-${formatLabel}-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Imagen descargada" });
    } catch {
      toast({ title: "Error al descargar la imagen", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReset = () => {
    setState({ ...DEFAULT_STATE });
  };

  const updateState = (partial: Partial<EditorState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  };

  const updateTitle = (partial: Partial<TextOverlay>) => {
    setState((prev) => ({ ...prev, title: { ...prev.title, ...partial } }));
  };

  const updateSubtitle = (partial: Partial<TextOverlay>) => {
    setState((prev) => ({ ...prev, subtitle: { ...prev.subtitle, ...partial } }));
  };

  const toggleHashtag = (tag: string) => {
    setSelectedHashtags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
    setCopiedHashtags(false);
  };

  const copyHashtags = async () => {
    const text = Array.from(selectedHashtags).join(" ");
    try {
      await navigator.clipboard.writeText(text);
      setCopiedHashtags(true);
      toast({ title: "Hashtags copiados al portapapeles" });
      setTimeout(() => setCopiedHashtags(false), 2000);
    } catch {
      toast({ title: "No se pudo copiar", variant: "destructive" });
    }
  };

  const applySuggestion = (s: TitleSuggestion) => {
    updateTitle({ text: s.title });
    updateSubtitle({ text: s.subtitle });
  };

  const categories = ["all", ...Array.from(new Set(TITLE_SUGGESTIONS.map((s) => s.category)))];
  const filteredSuggestions = suggestionCategory === "all"
    ? TITLE_SUGGESTIONS
    : TITLE_SUGGESTIONS.filter((s) => s.category === suggestionCategory);

  const fmt = FORMATS[state.format];
  const previewScale = state.format === "post" ? 0.35 : 0.25;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Crear Contenido para Redes Sociales
          </DialogTitle>
          <DialogDescription>
            Selecciona una foto, personaliza el diseño y descarga la imagen lista para publicar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <div className="flex flex-col items-center gap-4">
            <Tabs value={state.format} onValueChange={(v) => updateState({ format: v as SocialFormat })}>
              <TabsList>
                <TabsTrigger value="post" data-testid="tab-format-post">Post (1080×1080)</TabsTrigger>
                <TabsTrigger value="story" data-testid="tab-format-story">Historia (1080×1920)</TabsTrigger>
                <TabsTrigger value="reel" data-testid="tab-format-reel">Reel (1080×1920)</TabsTrigger>
              </TabsList>
            </Tabs>

            <div
              className="relative border rounded-lg overflow-hidden bg-muted shadow-lg"
              style={{
                width: fmt.width * previewScale,
                height: fmt.height * previewScale,
              }}
            >
              <canvas
                ref={canvasRef}
                style={{
                  width: fmt.width * previewScale,
                  height: fmt.height * previewScale,
                }}
                data-testid="canvas-preview"
              />
              {isRendering && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Button onClick={handleDownload} disabled={isDownloading || !selectedPhoto} className="gap-2" data-testid="button-download-social">
                {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {isDownloading ? "Descargando..." : "Descargar Imagen"}
              </Button>
              <Button variant="outline" onClick={handleReset} className="gap-2" data-testid="button-reset-editor">
                <RotateCcw className="h-4 w-4" />
                Reiniciar
              </Button>
            </div>
          </div>

          <div className="space-y-5 overflow-y-auto max-h-[70vh] pr-1">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Foto</Label>
              <div className="grid grid-cols-4 gap-2 max-h-28 overflow-y-auto rounded-md border p-2">
                {allPhotos.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPhoto(p)}
                    className={`relative aspect-square rounded overflow-hidden border-2 transition-all ${
                      selectedPhoto?.id === p.id ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-muted-foreground/30"
                    }`}
                    data-testid={`button-select-photo-${p.id}`}
                  >
                    <img src={p.url} alt={p.title} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-semibold">Título</Label>
              </div>
              <Input
                value={state.title.text}
                onChange={(e) => updateTitle({ text: e.target.value })}
                placeholder="Texto principal..."
                data-testid="input-social-title"
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Tamaño: {state.title.fontSize}px</Label>
                  <Slider
                    value={[state.title.fontSize]}
                    onValueChange={([v]) => updateTitle({ fontSize: v })}
                    min={24}
                    max={120}
                    step={2}
                    data-testid="slider-title-size"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={state.title.color}
                      onChange={(e) => updateTitle({ color: e.target.value })}
                      className="h-8 w-8 rounded cursor-pointer border"
                      data-testid="input-title-color"
                    />
                    <Select value={state.title.position} onValueChange={(v) => updateTitle({ position: v as TextOverlay["position"] })}>
                      <SelectTrigger className="h-8 text-xs" data-testid="select-title-position">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Arriba</SelectItem>
                        <SelectItem value="center">Centro</SelectItem>
                        <SelectItem value="bottom">Abajo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <Label className="text-sm font-semibold">Subtítulo</Label>
              <Input
                value={state.subtitle.text}
                onChange={(e) => updateSubtitle({ text: e.target.value })}
                placeholder="Texto secundario..."
                data-testid="input-social-subtitle"
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Tamaño: {state.subtitle.fontSize}px</Label>
                  <Slider
                    value={[state.subtitle.fontSize]}
                    onValueChange={([v]) => updateSubtitle({ fontSize: v })}
                    min={18}
                    max={80}
                    step={2}
                    data-testid="slider-subtitle-size"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={state.subtitle.color}
                      onChange={(e) => updateSubtitle({ color: e.target.value })}
                      className="h-8 w-8 rounded cursor-pointer border"
                      data-testid="input-subtitle-color"
                    />
                    <Select value={state.subtitle.position} onValueChange={(v) => updateSubtitle({ position: v as TextOverlay["position"] })}>
                      <SelectTrigger className="h-8 text-xs" data-testid="select-subtitle-position">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Arriba</SelectItem>
                        <SelectItem value="center">Centro</SelectItem>
                        <SelectItem value="bottom">Abajo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <Label className="text-sm font-semibold">Sugerencias de Texto</Label>
              </div>
              <div className="flex flex-wrap gap-1">
                {categories.map((cat) => {
                  const catLabels: Record<string, string> = {
                    all: "Todos",
                    Partido: "Partido",
                    Resultado: "Resultado",
                    Promo: "Promo",
                    Evento: "Evento",
                    Equipo: "Equipo",
                    Highlight: "Highlight",
                  };
                  return (
                    <Button
                      key={cat}
                      size="sm"
                      variant={suggestionCategory === cat ? "default" : "ghost"}
                      className="h-7 text-xs px-2"
                      onClick={() => setSuggestionCategory(cat)}
                      data-testid={`button-suggestion-cat-${cat}`}
                    >
                      {catLabels[cat] || cat}
                    </Button>
                  );
                })}
              </div>
              <div className="grid gap-1.5 max-h-36 overflow-y-auto">
                {filteredSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => applySuggestion(s)}
                    className="flex items-start gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                    data-testid={`button-suggestion-${i}`}
                  >
                    <Sparkles className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{s.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.subtitle}</p>
                    </div>
                    <Badge variant="outline" className="ml-auto shrink-0 text-[10px] h-5">
                      {s.category}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-blue-500" />
                  <Label className="text-sm font-semibold">Hashtags Sugeridos</Label>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 text-xs"
                  onClick={copyHashtags}
                  disabled={selectedHashtags.size === 0}
                  data-testid="button-copy-hashtags"
                >
                  {copiedHashtags ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedHashtags ? "Copiados" : `Copiar (${selectedHashtags.size})`}
                </Button>
              </div>
              {selectedHashtags.size > 0 && (
                <div className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground break-all leading-relaxed">
                  {Array.from(selectedHashtags).join(" ")}
                </div>
              )}
              {(Object.entries(HASHTAG_GROUPS) as [string, string[]][]).map(([group, tags]) => {
                const groupLabels: Record<string, string> = {
                  principales: "Principales",
                  partido: "Partido",
                  resultado: "Resultado",
                  promo: "Promoción",
                  general: "General",
                  redes: "Redes Sociales",
                };
                return (
                  <div key={group} className="space-y-1">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{groupLabels[group] || group}</p>
                    <div className="flex flex-wrap gap-1">
                      {tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleHashtag(tag)}
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors border ${
                            selectedHashtags.has(tag)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-muted-foreground border-border hover:border-primary/50"
                          }`}
                          data-testid={`hashtag-${tag.slice(1)}`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3 border-t pt-4">
              <Label className="text-sm font-semibold">Filtros</Label>
              <div className="flex flex-wrap gap-2">
                {(["none", "warm", "cool", "bw", "contrast"] as const).map((f) => {
                  const labels: Record<typeof f, string> = {
                    none: "Normal",
                    warm: "Cálido",
                    cool: "Frío",
                    bw: "B/N",
                    contrast: "Contraste",
                  };
                  return (
                    <Button
                      key={f}
                      size="sm"
                      variant={state.filter === f ? "default" : "outline"}
                      onClick={() => updateState({ filter: f })}
                      data-testid={`button-filter-${f}`}
                    >
                      {labels[f]}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <Label className="text-sm font-semibold">Ajustes</Label>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Brillo: {state.brightness}%</Label>
                  <Slider
                    value={[state.brightness]}
                    onValueChange={([v]) => updateState({ brightness: v })}
                    min={30}
                    max={170}
                    step={5}
                    data-testid="slider-brightness"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Superposición oscura</Label>
                  <Switch
                    checked={state.overlay}
                    onCheckedChange={(v) => updateState({ overlay: v })}
                    data-testid="switch-overlay"
                  />
                </div>

                {state.overlay && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Opacidad: {state.overlayOpacity}%</Label>
                    <Slider
                      value={[state.overlayOpacity]}
                      onValueChange={([v]) => updateState({ overlayOpacity: v })}
                      min={0}
                      max={80}
                      step={5}
                      data-testid="slider-overlay-opacity"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Branding Liga de Campeones</Label>
                  <Switch
                    checked={state.branding}
                    onCheckedChange={(v) => updateState({ branding: v })}
                    data-testid="switch-branding"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
