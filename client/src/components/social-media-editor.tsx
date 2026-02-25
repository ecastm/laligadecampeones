import { useState, useEffect } from "react";
import type { MarketingMedia } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Download, Sparkles, Hash, Copy, Check, Lightbulb, Share2, Image } from "lucide-react";

type SocialFormat = "post" | "story" | "reel";

interface FormatConfig {
  label: string;
  description: string;
  aspectClass: string;
}

const FORMATS: Record<SocialFormat, FormatConfig> = {
  post: { label: "Post", description: "1080×1080", aspectClass: "aspect-square" },
  story: { label: "Historia", description: "1080×1920", aspectClass: "aspect-[9/16]" },
  reel: { label: "Reel", description: "1080×1920", aspectClass: "aspect-[9/16]" },
};

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
    "#TresPuntos",
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

const CAPTION_SUGGESTIONS: { category: string; text: string }[] = [
  { category: "Partido", text: "Llega la jornada más esperada de la temporada. ¡Nos vemos en el campo!" },
  { category: "Partido", text: "Todo listo para otra noche de fútbol de primer nivel." },
  { category: "Partido", text: "El balón rueda de nuevo en La Liga de Campeones." },
  { category: "Resultado", text: "Gran partido, gran victoria. Así se resume la jornada de hoy." },
  { category: "Resultado", text: "Los goles, las emociones y el resultado final de una jornada inolvidable." },
  { category: "Resultado", text: "Otro día más de fútbol espectacular. ¡Felicidades a los protagonistas!" },
  { category: "Promo", text: "¿Quieres competir en la mejor liga amateur? ¡Inscribe tu equipo ahora! Plazas limitadas." },
  { category: "Promo", text: "Nueva temporada, nuevos retos. La Liga de Campeones te espera. ¡Apúntate ya!" },
  { category: "Promo", text: "Forma parte de algo grande. Inscripciones abiertas para la próxima temporada." },
  { category: "Evento", text: "Noche de premiación. Reconocemos el esfuerzo y la pasión de todos los participantes." },
  { category: "Evento", text: "Gran sorteo del calendario. ¡Ya sabemos los emparejamientos de la temporada!" },
  { category: "Highlight", text: "¡Golazo! Momentos como este hacen que el fútbol sea el deporte más bonito del mundo." },
  { category: "Highlight", text: "Las mejores jugadas de la jornada. ¿Cuál es tu favorita?" },
  { category: "Equipo", text: "Presentamos la plantilla oficial para esta temporada. ¡A por todas!" },
];

interface SocialMediaEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  media: MarketingMedia | null;
  allPhotos: MarketingMedia[];
}

export function SocialMediaEditor({ open, onOpenChange, media, allPhotos }: SocialMediaEditorProps) {
  const { toast } = useToast();
  const [format, setFormat] = useState<SocialFormat>("post");
  const [selectedPhoto, setSelectedPhoto] = useState<MarketingMedia | null>(media);
  const [selectedHashtags, setSelectedHashtags] = useState<Set<string>>(new Set(HASHTAG_GROUPS.principales));
  const [copiedHashtags, setCopiedHashtags] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [suggestionCategory, setSuggestionCategory] = useState<string>("all");
  const [selectedTitle, setSelectedTitle] = useState<TitleSuggestion | null>(null);
  const [selectedCaption, setSelectedCaption] = useState<string>("");

  useEffect(() => {
    if (media) setSelectedPhoto(media);
  }, [media]);

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

  const copyFullCaption = async () => {
    const parts: string[] = [];
    if (selectedTitle) {
      parts.push(selectedTitle.title.toUpperCase());
      parts.push(selectedTitle.subtitle);
      parts.push("");
    }
    if (selectedCaption) {
      parts.push(selectedCaption);
      parts.push("");
    }
    if (selectedHashtags.size > 0) {
      parts.push(Array.from(selectedHashtags).join(" "));
    }
    const text = parts.join("\n");
    if (!text.trim()) {
      toast({ title: "No hay contenido para copiar", variant: "destructive" });
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCaption(true);
      toast({ title: "Texto completo copiado al portapapeles" });
      setTimeout(() => setCopiedCaption(false), 2000);
    } catch {
      toast({ title: "No se pudo copiar", variant: "destructive" });
    }
  };

  const handleDownloadPhoto = () => {
    if (!selectedPhoto) return;
    const a = document.createElement("a");
    a.href = selectedPhoto.url;
    a.download = `liga-${FORMATS[format].label.toLowerCase()}-${Date.now()}.jpg`;
    a.target = "_blank";
    a.click();
    toast({ title: "Descargando foto..." });
  };

  const applySuggestion = (s: TitleSuggestion) => {
    setSelectedTitle(s);
  };

  const categories = ["all", ...Array.from(new Set(TITLE_SUGGESTIONS.map((s) => s.category)))];
  const filteredSuggestions = suggestionCategory === "all"
    ? TITLE_SUGGESTIONS
    : TITLE_SUGGESTIONS.filter((s) => s.category === suggestionCategory);

  const filteredCaptions = suggestionCategory === "all"
    ? CAPTION_SUGGESTIONS
    : CAPTION_SUGGESTIONS.filter((c) => c.category === suggestionCategory);

  const fmt = FORMATS[format];
  const previewMaxW = format === "post" ? "max-w-[350px]" : "max-w-[250px]";

  const captionPreview = (() => {
    const parts: string[] = [];
    if (selectedTitle) {
      parts.push(selectedTitle.title.toUpperCase());
      parts.push(selectedTitle.subtitle);
    }
    if (selectedCaption) {
      if (parts.length > 0) parts.push("");
      parts.push(selectedCaption);
    }
    if (selectedHashtags.size > 0) {
      if (parts.length > 0) parts.push("");
      parts.push(Array.from(selectedHashtags).join(" "));
    }
    return parts.join("\n");
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Preparar Contenido para Redes Sociales
          </DialogTitle>
          <DialogDescription>
            Selecciona una foto, elige el formato, y copia el texto sugerido para tu publicación.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6">
          <div className="flex flex-col items-center gap-4">
            <Tabs value={format} onValueChange={(v) => setFormat(v as SocialFormat)}>
              <TabsList>
                <TabsTrigger value="post" data-testid="tab-format-post">Post</TabsTrigger>
                <TabsTrigger value="story" data-testid="tab-format-story">Historia</TabsTrigger>
                <TabsTrigger value="reel" data-testid="tab-format-reel">Reel</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className={`relative ${previewMaxW} w-full rounded-lg overflow-hidden border shadow-lg bg-muted`}>
              {selectedPhoto ? (
                <div className={`w-full ${fmt.aspectClass} overflow-hidden`}>
                  <img
                    src={selectedPhoto.url}
                    alt={selectedPhoto.title}
                    className="w-full h-full object-cover"
                    data-testid="img-preview"
                  />
                </div>
              ) : (
                <div className={`w-full ${fmt.aspectClass} flex flex-col items-center justify-center gap-2 text-muted-foreground`}>
                  <Image className="h-12 w-12" />
                  <p className="text-sm">Selecciona una foto</p>
                </div>
              )}
              <div className="absolute bottom-2 right-2">
                <Badge variant="secondary" className="text-[10px]">{fmt.description}</Badge>
              </div>
            </div>

            <Button onClick={handleDownloadPhoto} disabled={!selectedPhoto} className="gap-2 w-full max-w-[250px]" data-testid="button-download-photo">
              <Download className="h-4 w-4" />
              Descargar Foto
            </Button>

            <div className="space-y-2 w-full">
              <Label className="text-sm font-semibold">Seleccionar Foto</Label>
              <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto rounded-md border p-2">
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
                {allPhotos.length === 0 && (
                  <p className="col-span-4 text-xs text-muted-foreground text-center py-4">No hay fotos subidas</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-5 overflow-y-auto max-h-[75vh] pr-1">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <Label className="text-sm font-semibold">Título y Subtítulo Sugerido</Label>
              </div>
              <div className="flex flex-wrap gap-1">
                {categories.map((cat) => {
                  const catLabels: Record<string, string> = {
                    all: "Todos", Partido: "Partido", Resultado: "Resultado",
                    Promo: "Promo", Evento: "Evento", Equipo: "Equipo", Highlight: "Highlight",
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
              <div className="grid gap-1.5 max-h-40 overflow-y-auto">
                {filteredSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => applySuggestion(s)}
                    className={`flex items-start gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${
                      selectedTitle?.title === s.title && selectedTitle?.subtitle === s.subtitle
                        ? "border-primary bg-primary/5"
                        : ""
                    }`}
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
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <Label className="text-sm font-semibold">Descripción Sugerida</Label>
              </div>
              <div className="grid gap-1.5 max-h-36 overflow-y-auto">
                {filteredCaptions.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedCaption(c.text)}
                    className={`rounded-md border px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${
                      selectedCaption === c.text ? "border-primary bg-primary/5" : ""
                    }`}
                    data-testid={`button-caption-${i}`}
                  >
                    <p className="text-sm">{c.text}</p>
                    <Badge variant="outline" className="mt-1 text-[10px] h-5">{c.category}</Badge>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-blue-500" />
                  <Label className="text-sm font-semibold">Hashtags</Label>
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
              {(Object.entries(HASHTAG_GROUPS) as [string, string[]][]).map(([group, tags]) => {
                const groupLabels: Record<string, string> = {
                  principales: "Principales", partido: "Partido", resultado: "Resultado",
                  promo: "Promoción", general: "General", redes: "Redes Sociales",
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

            {captionPreview && (
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Vista Previa del Texto</Label>
                  <Button
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={copyFullCaption}
                    data-testid="button-copy-full-caption"
                  >
                    {copiedCaption ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedCaption ? "Copiado" : "Copiar Todo"}
                  </Button>
                </div>
                <div className="rounded-md bg-muted/50 border p-3 text-sm whitespace-pre-line leading-relaxed" data-testid="text-caption-preview">
                  {captionPreview}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
