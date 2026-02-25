import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { MarketingMedia, Match, Team } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Download, Copy, Check, Hash, ChevronLeft, ChevronRight,
  Search, Image, Sparkles, FileText, Loader2, Plus, Save
} from "lucide-react";

type ContentType = "post" | "story" | "reel";

interface MatchWithTeams extends Match {
  homeTeam?: Team;
  awayTeam?: Team;
}

interface Fields {
  team1: string;
  team2: string;
  score1: string;
  score2: string;
  matchday: string;
  datetime: string;
  venue: string;
  mvpName: string;
  cta: string;
}

const EMPTY_FIELDS: Fields = {
  team1: "", team2: "", score1: "", score2: "",
  matchday: "", datetime: "", venue: "", mvpName: "",
  cta: "Síguenos para más",
};

const BASE_HASHTAGS = ["#Futbol", "#Torneo", "#Liga", "#Jornada", "#Goles", "#Equipo", "#Partido", "#LaLigaDeCampeones"];

const KEYWORD_HASHTAG_MAP: Record<string, string[]> = {
  semifinal: ["#Semifinal", "#Eliminatoria"],
  final: ["#Final", "#Campeonato"],
  mvp: ["#MVP", "#FiguraDelPartido"],
  clasico: ["#Clasico", "#GranDerbi"],
  clásico: ["#Clasico", "#GranDerbi"],
  goleada: ["#Goleada"],
  "fair play": ["#FairPlay", "#Respeto"],
  campeon: ["#Campeon", "#Campeones"],
  campeón: ["#Campeon", "#Campeones"],
};

function sanitizeHashtag(text: string): string {
  return text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9]/g, "");
}

function buildHashtags(fields: Fields, keywords: string): string[] {
  const tags = new Set<string>(BASE_HASHTAGS);
  const kw = keywords.toLowerCase();
  for (const [keyword, mapped] of Object.entries(KEYWORD_HASHTAG_MAP)) {
    if (kw.includes(keyword)) mapped.forEach((t) => tags.add(t));
  }
  if (fields.matchday) tags.add(`#Jornada${fields.matchday}`);
  if (fields.team1) { const s = sanitizeHashtag(fields.team1); if (s) tags.add(`#${s}`); }
  if (fields.team2) { const s = sanitizeHashtag(fields.team2); if (s) tags.add(`#${s}`); }
  if (fields.mvpName) { tags.add("#MVP"); tags.add("#FiguraDelPartido"); }
  return Array.from(tags);
}

function buildCopy(fields: Fields, contentType: ContentType): string {
  const t1 = fields.team1 || "[Equipo Local]";
  const t2 = fields.team2 || "[Equipo Visitante]";
  const s1 = fields.score1 || "X";
  const s2 = fields.score2 || "X";
  const jornada = fields.matchday ? `Jornada ${fields.matchday}` : "Jornada";
  const fecha = fields.datetime || "[Fecha por confirmar]";
  const lugar = fields.venue || "[Cancha por confirmar]";
  const cta = fields.cta || "Síguenos para más";
  const hasScore = fields.score1 && fields.score2;

  if (contentType === "story") {
    return hasScore
      ? `⚽ ${t1} ${s1} - ${s2} ${t2}\n${jornada} | ${cta}`
      : `📅 ${t1} vs ${t2}\n${fecha} | ${lugar}\n${cta}`;
  }
  if (contentType === "reel") {
    return hasScore ? `⚽ ${t1} ${s1}-${s2} ${t2}\n${cta}` : `📅 ${t1} vs ${t2}\n¡Próximamente! ${cta}`;
  }
  if (hasScore) {
    return `⚽ ${jornada} | Resultado Final\n\n${t1} ${s1} - ${s2} ${t2}\n\n📅 ${fecha}\n📍 ${lugar}\n\nOtra gran jornada en La Liga de Campeones. ¡El balón no deja de rodar!\n\n👉 ${cta}`;
  }
  return `📅 Próximo Partido\n\n${t1} vs ${t2}\n\n🗓️ ${fecha}\n📍 ${lugar}\n🏆 ${jornada} - La Liga de Campeones\n\n¡No te lo pierdas!\n\n👉 ${cta}`;
}

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

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? cur + " " + w : w;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

async function renderCanvas(canvas: HTMLCanvasElement, fields: Fields, contentType: ContentType, photos: MarketingMedia[]): Promise<void> {
  const dims: Record<ContentType, [number, number]> = { post: [1080, 1350], story: [1080, 1920], reel: [1080, 1920] };
  const [W, H] = dims[contentType];
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const dk = "#031D0A", md = "#0A4A1F", br = "#0F6B2E", gd = "#D4A824", lg = "#F0D060", wh = "#FFFFFF";
  const bg = ctx.createRadialGradient(W/2, H*0.4, 0, W/2, H*0.4, H*0.8);
  bg.addColorStop(0, br); bg.addColorStop(0.5, md); bg.addColorStop(1, dk);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  ctx.save(); ctx.globalAlpha = 0.04; ctx.strokeStyle = gd; ctx.lineWidth = 1;
  for (let i = -W; i < W*2; i += 50) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H*0.3, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(i + H*0.3, 0); ctx.lineTo(i, H); ctx.stroke();
  }
  ctx.restore();

  if (photos.length > 0) {
    try {
      const img = await loadImage(photos[0].url);
      const ir = img.width / img.height, cr = W / H;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (ir > cr) { sw = img.height * cr; sx = (img.width - sw) / 2; }
      else { sh = img.width / cr; sy = (img.height - sh) / 2; }
      ctx.globalAlpha = 0.3; ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H); ctx.globalAlpha = 1;
    } catch {}
  }

  const topH = 160;
  const tg = ctx.createLinearGradient(0, 0, 0, topH);
  tg.addColorStop(0, dk); tg.addColorStop(0.8, dk + "EE"); tg.addColorStop(1, "transparent");
  ctx.fillStyle = tg; ctx.fillRect(0, 0, W, topH);

  const gl = ctx.createLinearGradient(0, topH-4, W, topH-4);
  gl.addColorStop(0, "transparent"); gl.addColorStop(0.15, gd); gl.addColorStop(0.85, gd); gl.addColorStop(1, "transparent");
  ctx.strokeStyle = gl; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, topH-2); ctx.lineTo(W, topH-2); ctx.stroke();

  ctx.fillStyle = lg; ctx.font = "900 34px 'Segoe UI', Arial, sans-serif"; ctx.textAlign = "center";
  ctx.fillText("LA LIGA DE CAMPEONES", W/2, topH - 35);

  const t1 = fields.team1 || "Equipo Local", t2 = fields.team2 || "Equipo Visitante";
  const cx = W / 2, hasScore = fields.score1 && fields.score2;

  const jText = fields.matchday ? `JORNADA ${fields.matchday}` : "JORNADA";
  const pY = topH + 60;
  ctx.font = "900 36px 'Segoe UI', Arial, sans-serif";
  const pW = ctx.measureText(jText).width + 80, pH = 56;
  const pg = ctx.createLinearGradient(cx-pW/2, pY, cx+pW/2, pY+pH);
  pg.addColorStop(0, gd); pg.addColorStop(0.5, lg); pg.addColorStop(1, gd);
  ctx.fillStyle = pg; roundRect(ctx, cx-pW/2, pY, pW, pH, pH/2); ctx.fill();
  ctx.fillStyle = dk; ctx.font = "900 32px 'Segoe UI', Arial, sans-serif";
  ctx.textBaseline = "middle"; ctx.fillText(jText, cx, pY + pH/2); ctx.textBaseline = "alphabetic";

  const tY = H * 0.42;
  ctx.fillStyle = wh; ctx.font = "900 44px 'Segoe UI', Arial, sans-serif"; ctx.textAlign = "center";
  wrapText(ctx, t1.toUpperCase(), 420).forEach((l, i) => ctx.fillText(l, cx-220, tY + i*52));
  wrapText(ctx, t2.toUpperCase(), 420).forEach((l, i) => ctx.fillText(l, cx+220, tY + i*52));

  const vY = tY - 30, vR = 55;
  const vb = ctx.createRadialGradient(cx, vY, 0, cx, vY, vR);
  vb.addColorStop(0, lg); vb.addColorStop(0.6, gd); vb.addColorStop(1, "#8B7518");
  ctx.fillStyle = vb; ctx.beginPath(); ctx.arc(cx, vY, vR, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = dk; ctx.font = "900 50px 'Segoe UI', Arial, sans-serif";
  ctx.textBaseline = "middle"; ctx.fillText("VS", cx, vY+2); ctx.textBaseline = "alphabetic";

  if (hasScore) {
    const sY = H * 0.60;
    ctx.save(); ctx.shadowColor = lg + "80"; ctx.shadowBlur = 20;
    ctx.fillStyle = lg; ctx.font = "900 120px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(fields.score1, cx-180, sY); ctx.fillText("-", cx, sY); ctx.fillText(fields.score2, cx+180, sY);
    ctx.restore();
    ctx.fillStyle = gd + "BB"; ctx.font = "600 26px 'Segoe UI', Arial, sans-serif";
    ctx.fillText("RESULTADO FINAL", cx, sY + 50);
  } else {
    ctx.fillStyle = wh; ctx.font = "700 28px 'Segoe UI', Arial, sans-serif";
    ctx.fillText("¡NO TE LO PIERDAS!", cx, H * 0.58);
  }

  if (fields.mvpName) {
    const mY = hasScore ? H*0.70 : H*0.65;
    ctx.fillStyle = lg; ctx.font = "900 28px 'Segoe UI', Arial, sans-serif";
    ctx.fillText("🌟 MVP: " + fields.mvpName.toUpperCase(), cx, mY);
  }

  const iY = H * 0.78, iW = 650, iH = 120;
  ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 20;
  ctx.fillStyle = dk + "E8"; roundRect(ctx, cx-iW/2, iY, iW, iH, 16); ctx.fill(); ctx.restore();
  ctx.strokeStyle = gd + "60"; ctx.lineWidth = 2; roundRect(ctx, cx-iW/2, iY, iW, iH, 16); ctx.stroke();

  if (fields.datetime) { ctx.fillStyle = lg; ctx.font = "700 28px 'Segoe UI', Arial, sans-serif"; ctx.fillText(fields.datetime.toUpperCase(), cx, iY+45); }
  if (fields.venue) { ctx.fillStyle = wh; ctx.font = "600 24px 'Segoe UI', Arial, sans-serif"; ctx.fillText("📍 " + fields.venue, cx, iY+85); }

  const bY = H - 55;
  const bg2 = ctx.createLinearGradient(0, bY-40, 0, H);
  bg2.addColorStop(0, "transparent"); bg2.addColorStop(1, dk + "DD");
  ctx.fillStyle = bg2; ctx.fillRect(0, bY-40, W, 95);

  const bl = ctx.createLinearGradient(0, bY-30, W, bY-30);
  bl.addColorStop(0, "transparent"); bl.addColorStop(0.15, gd+"60"); bl.addColorStop(0.85, gd+"60"); bl.addColorStop(1, "transparent");
  ctx.strokeStyle = bl; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, bY-30); ctx.lineTo(W, bY-30); ctx.stroke();

  ctx.fillStyle = gd + "BB"; ctx.font = "600 20px 'Segoe UI', Arial, sans-serif"; ctx.textAlign = "center";
  ctx.fillText("www.laligadecampeones.es  |  @laligadecampeones", cx, bY + 10);
}

interface SocialMediaEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  media: MarketingMedia | null;
  allPhotos: MarketingMedia[];
}

export function SocialMediaEditor({ open, onOpenChange, media, allPhotos }: SocialMediaEditorProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [keywords, setKeywords] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState<MarketingMedia[]>([]);
  const [contentType, setContentType] = useState<ContentType>("post");
  const [fields, setFields] = useState<Fields>({ ...EMPTY_FIELDS });

  const [copy, setCopy] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [copyEdited, setCopyEdited] = useState(false);

  const [isRendering, setIsRendering] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (open && media) setSelectedPhotos([media]);
  }, [open, media]);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setKeywords(""); setDateFrom(""); setDateTo("");
      setSelectedPhotos([]); setContentType("post");
      setFields({ ...EMPTY_FIELDS });
      setCopy(""); setHashtags([]); setCopyEdited(false);
    }
  }, [open]);

  useEffect(() => {
    if (step === 3 && canvasRef.current) {
      if (!copyEdited) {
        setCopy(buildCopy(fields, contentType));
        setHashtags(buildHashtags(fields, keywords));
      }
      setIsRendering(true);
      renderCanvas(canvasRef.current, fields, contentType, selectedPhotos)
        .finally(() => setIsRendering(false));
    }
  }, [step]);

  const filteredPhotos = allPhotos.filter((p) => {
    const kw = keywords.toLowerCase().trim();
    if (!kw && !dateFrom && !dateTo) return true;
    let ok = true;
    if (kw) ok = p.title.toLowerCase().includes(kw) || (p.description || "").toLowerCase().includes(kw);
    if (dateFrom && ok) ok = new Date(p.createdAt) >= new Date(dateFrom);
    if (dateTo && ok) ok = new Date(p.createdAt) <= new Date(dateTo + "T23:59:59");
    return ok;
  });

  const togglePhoto = (photo: MarketingMedia) => {
    setSelectedPhotos((prev) => prev.find((p) => p.id === photo.id) ? prev.filter((p) => p.id !== photo.id) : [...prev, photo]);
  };

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    await renderCanvas(canvasRef.current, fields, contentType, selectedPhotos);
    const blob = await new Promise<Blob>((res, rej) => canvasRef.current!.toBlob((b) => b ? res(b) : rej(), "image/png"));
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `liga-${contentType}-${Date.now()}.png`;
    a.click(); URL.revokeObjectURL(url);
    toast({ title: "Imagen descargada" });
  };

  const handleSave = async () => {
    if (!canvasRef.current) return;
    setIsSaving(true);
    try {
      await renderCanvas(canvasRef.current, fields, contentType, selectedPhotos);
      const blob = await new Promise<Blob>((res, rej) => canvasRef.current!.toBlob((b) => b ? res(b) : rej(), "image/png"));
      const file = new File([blob], `social-${contentType}-${Date.now()}.png`, { type: "image/png" });

      const token = localStorage.getItem("auth_token");
      const authH: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const r = await fetch("/api/uploads/request-url", {
        method: "POST", headers: { "Content-Type": "application/json", ...authH },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      if (!r.ok) throw new Error();
      const { uploadURL, objectPath } = await r.json();
      const u = await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      if (!u.ok) throw new Error();

      const t1 = fields.team1 || "", t2 = fields.team2 || "";
      const title = t1 && t2 ? `${t1} vs ${t2} - ${contentType === "post" ? "Post" : contentType === "story" ? "Historia" : "Reel"}` : `Contenido Redes - ${contentType === "post" ? "Post" : contentType === "story" ? "Historia" : "Reel"}`;

      await apiRequest("POST", "/api/admin/marketing", {
        title, description: copy.slice(0, 200), type: "PHOTO", url: objectPath,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing"] });
      toast({ title: "Guardado en Marketing", description: "Puedes verlo en la galería de Marketing." });
      onOpenChange(false);
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" });
    }
    setIsSaving(false);
  };

  const doCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field); setTimeout(() => setCopiedField(null), 2000);
      toast({ title: "Copiado" });
    } catch { toast({ title: "No se pudo copiar", variant: "destructive" }); }
  };

  const updateField = (key: keyof Fields, val: string) => setFields((p) => ({ ...p, [key]: val }));

  const totalSteps = 3;
  const canGoNext = step === 1 ? selectedPhotos.length > 0 : true;

  const phoneW = 300;
  const phoneAspect: Record<ContentType, number> = { post: 1350/1080, story: 1920/1080, reel: 1920/1080 };
  const phoneH = phoneW * phoneAspect[contentType];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Crear para Redes — Paso {step} de {totalSteps}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Selecciona las fotos y el formato."}
            {step === 2 && "Completa los datos de tu publicación."}
            {step === 3 && "Revisa, edita el texto y guarda."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 mb-3">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        <div className="min-h-[380px]">

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="Ej: semifinal, MVP..." className="pl-9" data-testid="input-keywords" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Desde</Label>
                  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} data-testid="input-date-from" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Hasta</Label>
                  <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} data-testid="input-date-to" />
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {filteredPhotos.length} foto{filteredPhotos.length !== 1 ? "s" : ""}
                {selectedPhotos.length > 0 && ` · ${selectedPhotos.length} seleccionada${selectedPhotos.length !== 1 ? "s" : ""}`}
              </p>

              {filteredPhotos.length === 0 ? (
                <Card><CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground"><Image className="h-12 w-12 mb-2" /><p>No se encontraron fotos</p></CardContent></Card>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-[280px] overflow-y-auto rounded-md border p-2">
                  {filteredPhotos.map((p) => {
                    const sel = selectedPhotos.some((s) => s.id === p.id);
                    return (
                      <button key={p.id} onClick={() => togglePhoto(p)} className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${sel ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-muted-foreground/30"}`} data-testid={`photo-select-${p.id}`}>
                        <img src={p.url} alt={p.title} className="h-full w-full object-cover" />
                        {sel && <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Check className="h-3 w-3" /></div>}
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1 py-0.5"><p className="text-[10px] text-white truncate">{p.title}</p></div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="border-t pt-4">
                <Label className="text-sm font-semibold mb-2 block">Formato</Label>
                <div className="grid grid-cols-3 gap-2">
                  {([["post", "Post", "1080×1350"], ["story", "Historia", "1080×1920"], ["reel", "Reel", "1080×1920"]] as const).map(([k, label, dim]) => (
                    <button key={k} onClick={() => setContentType(k)} className={`rounded-lg border-2 p-3 text-center transition-all ${contentType === k ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40"}`} data-testid={`type-${k}`}>
                      <p className="text-sm font-bold">{label}</p>
                      <p className="text-[10px] text-muted-foreground">{dim}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Equipo Local</Label>
                  <Input value={fields.team1} onChange={(e) => updateField("team1", e.target.value)} placeholder="Ej: Fuengirola" data-testid="field-team1" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Equipo Visitante</Label>
                  <Input value={fields.team2} onChange={(e) => updateField("team2", e.target.value)} placeholder="Ej: El Palo" data-testid="field-team2" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Goles Local (vacío = sin resultado)</Label>
                  <Input value={fields.score1} onChange={(e) => updateField("score1", e.target.value)} placeholder="Ej: 2" data-testid="field-score1" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Goles Visitante</Label>
                  <Input value={fields.score2} onChange={(e) => updateField("score2", e.target.value)} placeholder="Ej: 1" data-testid="field-score2" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Jornada / Etapa</Label>
                  <Input value={fields.matchday} onChange={(e) => updateField("matchday", e.target.value)} placeholder="Ej: 4" data-testid="field-matchday" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Fecha y Hora</Label>
                  <Input value={fields.datetime} onChange={(e) => updateField("datetime", e.target.value)} placeholder="Ej: Sábado 8 de marzo, 20:00" data-testid="field-datetime" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Cancha</Label>
                  <Input value={fields.venue} onChange={(e) => updateField("venue", e.target.value)} placeholder="Ej: Campo Central" data-testid="field-venue" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">MVP (opcional)</Label>
                  <Input value={fields.mvpName} onChange={(e) => updateField("mvpName", e.target.value)} placeholder="Ej: Carlos López" data-testid="field-mvp" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-medium">Texto final (Ej: Síguenos para más)</Label>
                  <Input value={fields.cta} onChange={(e) => updateField("cta", e.target.value)} data-testid="field-cta" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-5">
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-[20px] bg-black p-2 shadow-2xl" style={{ width: phoneW + 16 }}>
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
                      <div className="h-full w-full rounded-full bg-black flex items-center justify-center">
                        <span className="text-[6px] text-white font-bold">LC</span>
                      </div>
                    </div>
                    <span className="text-white text-[11px] font-semibold">laligadecampeones</span>
                  </div>
                  <div className="relative overflow-hidden rounded-sm bg-muted" style={{ width: phoneW, height: phoneH }}>
                    <canvas ref={canvasRef} style={{ width: phoneW, height: phoneH }} data-testid="canvas-preview" />
                    {isRendering && <div className="absolute inset-0 flex items-center justify-center bg-black/30"><Loader2 className="h-5 w-5 animate-spin text-white" /></div>}
                  </div>
                  <div className="px-2 py-1.5 flex gap-3">
                    <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </div>
                </div>

                <div className="flex gap-2 w-full">
                  <Button onClick={handleDownload} size="sm" className="gap-1.5 flex-1 text-xs" data-testid="button-download">
                    <Download className="h-3.5 w-3.5" /> Descargar
                  </Button>
                  <Button onClick={handleSave} size="sm" variant="default" className="gap-1.5 flex-1 text-xs" disabled={isSaving} data-testid="button-save">
                    {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    {isSaving ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[55vh]">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold flex items-center gap-1.5">
                      <FileText className="h-4 w-4" /> Texto de la publicación
                      {copyEdited && <Badge variant="secondary" className="text-[10px]">Editado</Badge>}
                    </Label>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => { setCopy(buildCopy(fields, contentType)); setHashtags(buildHashtags(fields, keywords)); setCopyEdited(false); toast({ title: "Texto regenerado" }); }} data-testid="button-regenerate">
                        <Sparkles className="h-3 w-3" /> Regenerar
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => doCopy(copy, "copy")} data-testid="button-copy-text">
                        {copiedField === "copy" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {copiedField === "copy" ? "Copiado" : "Copiar"}
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={copy}
                    onChange={(e) => { setCopy(e.target.value); setCopyEdited(true); }}
                    rows={5}
                    className="text-sm leading-relaxed"
                    placeholder="Escribe el texto de tu publicación..."
                    data-testid="textarea-copy"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold flex items-center gap-1.5"><Hash className="h-4 w-4" /> Hashtags</Label>
                    <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => doCopy(hashtags.join(" "), "tags")} data-testid="button-copy-hashtags">
                      {copiedField === "tags" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedField === "tags" ? "Copiados" : `Copiar (${hashtags.length})`}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {hashtags.map((t) => (
                      <button key={t} onClick={() => setHashtags((p) => p.filter((h) => h !== t))} className="rounded-full px-2 py-0.5 text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/80 transition-colors" data-testid={`tag-${t.slice(1)}`}>
                        {t} ✕
                      </button>
                    ))}
                  </div>
                  <form className="flex gap-2" onSubmit={(e) => {
                    e.preventDefault();
                    const inp = (e.target as HTMLFormElement).elements.namedItem("nt") as HTMLInputElement;
                    let v = inp.value.trim();
                    if (!v) return;
                    if (!v.startsWith("#")) v = "#" + v;
                    v = "#" + sanitizeHashtag(v.slice(1));
                    if (v.length > 1 && !hashtags.includes(v)) setHashtags((p) => [...p, v]);
                    inp.value = "";
                  }}>
                    <Input name="nt" placeholder="Agregar hashtag..." className="h-7 text-xs flex-1" data-testid="input-new-hashtag" />
                    <Button type="submit" size="sm" variant="outline" className="h-7 text-xs gap-1" data-testid="button-add-hashtag"><Plus className="h-3 w-3" /></Button>
                  </form>
                </div>

                <div className="border-t pt-2">
                  <Button className="gap-2 w-full" variant="outline" onClick={() => doCopy(copy + "\n\n" + hashtags.join(" "), "all")} data-testid="button-copy-all">
                    {copiedField === "all" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    Copiar Todo (texto + hashtags)
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1} className="gap-1" size="sm" data-testid="button-prev">
            <ChevronLeft className="h-4 w-4" /> Anterior
          </Button>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full transition-colors ${i + 1 === step ? "bg-primary" : i + 1 < step ? "bg-primary/50" : "bg-muted"}`} />
            ))}
          </div>
          {step < totalSteps ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canGoNext} className="gap-1" size="sm" data-testid="button-next">
              Siguiente <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => onOpenChange(false)} size="sm" data-testid="button-close">Cerrar</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
