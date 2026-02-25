import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { MarketingMedia, Match, Team } from "@shared/schema";
import { MatchStageLabels } from "@shared/schema";
import { getAuthHeader } from "@/lib/auth";
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
import { format } from "date-fns";
import { es } from "date-fns/locale";

type ContentType = "post" | "story" | "reel";

interface MatchWithTeams extends Match {
  homeTeam?: Team;
  awayTeam?: Team;
}

interface GeneratorState {
  keywords: string;
  dateFrom: string;
  dateTo: string;
  selectedPhotos: MarketingMedia[];
  contentType: ContentType;
  fields: {
    team1: string;
    team2: string;
    score1: string;
    score2: string;
    matchday: string;
    datetime: string;
    venue: string;
    mvpName: string;
    cta: string;
  };
  copy: string;
  hashtags: string[];
}

const INITIAL_STATE: GeneratorState = {
  keywords: "",
  dateFrom: "",
  dateTo: "",
  selectedPhotos: [],
  contentType: "post",
  fields: {
    team1: "", team2: "", score1: "", score2: "",
    matchday: "", datetime: "", venue: "", mvpName: "",
    cta: "Síguenos para más",
  },
  copy: "",
  hashtags: [],
};

const BASE_HASHTAGS = ["#Futbol", "#Torneo", "#Liga", "#Jornada", "#Goles", "#Equipo", "#Partido"];

const KEYWORD_HASHTAG_MAP: Record<string, string[]> = {
  semifinal: ["#Semifinal", "#Eliminatoria"],
  final: ["#Final", "#Campeonato", "#GranFinal"],
  mvp: ["#MVP", "#FiguraDelPartido", "#MejorJugador"],
  clasico: ["#Clasico", "#GranDerbi"],
  clásico: ["#Clasico", "#GranDerbi"],
  goleada: ["#Goleada", "#LluviaDeGoles"],
  fairplay: ["#FairPlay", "#Respeto", "#JuegoLimpio"],
  "fair play": ["#FairPlay", "#Respeto"],
  debut: ["#Debut", "#PrimerPartido"],
  campeon: ["#Campeon", "#Campeones"],
  campeón: ["#Campeon", "#Campeones"],
  victoria: ["#Victoria", "#TresPuntos"],
  empate: ["#Empate"],
  derrota: ["#Derrota"],
  gol: ["#Gol", "#GolesDelPartido"],
};

const CONTENT_TYPE_CONFIG: Record<ContentType, { label: string; desc: string; dims: string; ratio: string }> = {
  post: { label: "Post (Feed)", desc: "Imagen para el feed", dims: "1080×1350", ratio: "4:5" },
  story: { label: "Historia", desc: "Formato vertical para stories", dims: "1080×1920", ratio: "9:16" },
  reel: { label: "Reel", desc: "Formato vertical para reels", dims: "1080×1920", ratio: "9:16" },
};

function sanitizeHashtag(text: string): string {
  return text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9]/g, "");
}

function generateHashtags(state: GeneratorState): string[] {
  const tags = new Set<string>(BASE_HASHTAGS);
  tags.add("#LaLigaDeCampeones");
  tags.add("#LigaDeCampeones2026");

  const kwLower = state.keywords.toLowerCase();
  for (const [keyword, mapped] of Object.entries(KEYWORD_HASHTAG_MAP)) {
    if (kwLower.includes(keyword)) mapped.forEach((t) => tags.add(t));
  }

  const jMatch = kwLower.match(/jornada\s*(\d+)/);
  if (jMatch) tags.add(`#Jornada${jMatch[1]}`);
  if (state.fields.matchday) tags.add(`#Jornada${state.fields.matchday}`);

  if (state.fields.team1) { const s = sanitizeHashtag(state.fields.team1); if (s) tags.add(`#${s}`); }
  if (state.fields.team2) { const s = sanitizeHashtag(state.fields.team2); if (s) tags.add(`#${s}`); }
  if (state.fields.venue) { const s = sanitizeHashtag(state.fields.venue); if (s) tags.add(`#${s}`); }
  if (state.fields.mvpName) { tags.add("#MVP"); tags.add("#FiguraDelPartido"); }

  return Array.from(tags);
}

function generateCopy(state: GeneratorState): string {
  const { contentType, fields } = state;
  const t1 = fields.team1 || "[Equipo Local]";
  const t2 = fields.team2 || "[Equipo Visitante]";
  const s1 = fields.score1 || "X";
  const s2 = fields.score2 || "X";
  const jornada = fields.matchday ? `Jornada ${fields.matchday}` : "Jornada";
  const fecha = fields.datetime || "[Fecha por confirmar]";
  const lugar = fields.venue || "[Cancha por confirmar]";
  const cta = fields.cta || "Síguenos para más";
  const hasScore = fields.score1 && fields.score2;

  if (contentType === "post") {
    if (hasScore) {
      return `⚽ ${jornada} | Resultado Final\n\n${t1} ${s1} - ${s2} ${t2}\n\n📅 ${fecha}\n📍 ${lugar}\n\nOtra gran jornada en La Liga de Campeones. ¡El balón no deja de rodar!\n\n👉 ${cta}`;
    }
    return `📅 Próximo Partido\n\n${t1} vs ${t2}\n\n🗓️ ${fecha}\n📍 ${lugar}\n🏆 ${jornada} - La Liga de Campeones\n\n¡No te lo pierdas!\n\n👉 ${cta}`;
  }
  if (contentType === "story") {
    if (hasScore) return `⚽ ${t1} ${s1} - ${s2} ${t2}\n${jornada} | ${cta}`;
    return `📅 ${t1} vs ${t2}\n${fecha} | ${lugar}\n${cta}`;
  }
  if (hasScore) return `⚽ ${t1} ${s1}-${s2} ${t2}\n${cta}`;
  return `📅 ${t1} vs ${t2}\n¡Próximamente! ${cta}`;
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

function wrapTextCanvas(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? current + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && current) { lines.push(current); current = word; }
    else current = test;
  }
  if (current) lines.push(current);
  return lines;
}

async function renderTemplate(canvas: HTMLCanvasElement, state: GeneratorState): Promise<void> {
  const dims: Record<ContentType, [number, number]> = {
    post: [1080, 1350], story: [1080, 1920], reel: [1080, 1920],
  };
  const [W, H] = dims[state.contentType];
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const darkGreen = "#031D0A";
  const medGreen = "#0A4A1F";
  const brightGreen = "#0F6B2E";
  const gold = "#D4A824";
  const lightGold = "#F0D060";
  const white = "#FFFFFF";

  const bgGrad = ctx.createRadialGradient(W / 2, H * 0.4, 0, W / 2, H * 0.4, H * 0.8);
  bgGrad.addColorStop(0, brightGreen); bgGrad.addColorStop(0.5, medGreen); bgGrad.addColorStop(1, darkGreen);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.globalAlpha = 0.04; ctx.strokeStyle = gold; ctx.lineWidth = 1;
  for (let i = -W; i < W * 2; i += 50) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H * 0.3, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(i + H * 0.3, 0); ctx.lineTo(i, H); ctx.stroke();
  }
  ctx.restore();

  if (state.selectedPhotos.length > 0) {
    try {
      const img = await loadImage(state.selectedPhotos[0].url);
      const imgRatio = img.width / img.height;
      const canvasRatio = W / H;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (imgRatio > canvasRatio) { sw = img.height * canvasRatio; sx = (img.width - sw) / 2; }
      else { sh = img.width / canvasRatio; sy = (img.height - sh) / 2; }
      ctx.globalAlpha = 0.3;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
      ctx.globalAlpha = 1.0;
    } catch {}
  }

  const topH = 160;
  const topGrad = ctx.createLinearGradient(0, 0, 0, topH);
  topGrad.addColorStop(0, darkGreen); topGrad.addColorStop(0.8, darkGreen + "EE"); topGrad.addColorStop(1, "transparent");
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, W, topH);

  const goldLineGrad = ctx.createLinearGradient(0, topH - 4, W, topH - 4);
  goldLineGrad.addColorStop(0, "transparent"); goldLineGrad.addColorStop(0.15, gold); goldLineGrad.addColorStop(0.85, gold); goldLineGrad.addColorStop(1, "transparent");
  ctx.strokeStyle = goldLineGrad; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, topH - 2); ctx.lineTo(W, topH - 2); ctx.stroke();

  ctx.fillStyle = lightGold;
  ctx.font = "900 34px 'Segoe UI', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("LA LIGA DE CAMPEONES", W / 2, topH - 35);

  const { fields } = state;
  const t1 = fields.team1 || "Equipo Local";
  const t2 = fields.team2 || "Equipo Visitante";
  const cx = W / 2;
  const hasScore = fields.score1 && fields.score2;

  const jornada = fields.matchday ? `JORNADA ${fields.matchday}` : "JORNADA";
  const pillY = topH + 60;
  ctx.font = "900 36px 'Segoe UI', Arial, sans-serif";
  const pillW = ctx.measureText(jornada).width + 80;
  const pillH = 56;
  const pillGrad = ctx.createLinearGradient(cx - pillW / 2, pillY, cx + pillW / 2, pillY + pillH);
  pillGrad.addColorStop(0, gold); pillGrad.addColorStop(0.5, lightGold); pillGrad.addColorStop(1, gold);
  ctx.fillStyle = pillGrad;
  roundRect(ctx, cx - pillW / 2, pillY, pillW, pillH, pillH / 2);
  ctx.fill();
  ctx.fillStyle = darkGreen;
  ctx.font = "900 32px 'Segoe UI', Arial, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(jornada, cx, pillY + pillH / 2);
  ctx.textBaseline = "alphabetic";

  const teamY = H * 0.42;
  ctx.fillStyle = white;
  ctx.font = "900 44px 'Segoe UI', Arial, sans-serif";
  ctx.textAlign = "center";
  const t1lines = wrapTextCanvas(ctx, t1.toUpperCase(), 420);
  t1lines.forEach((l, i) => ctx.fillText(l, cx - 220, teamY + i * 52));
  const t2lines = wrapTextCanvas(ctx, t2.toUpperCase(), 420);
  t2lines.forEach((l, i) => ctx.fillText(l, cx + 220, teamY + i * 52));

  const vsY = teamY - 30;
  const vsR = 55;
  const vsBg = ctx.createRadialGradient(cx, vsY, 0, cx, vsY, vsR);
  vsBg.addColorStop(0, lightGold); vsBg.addColorStop(0.6, gold); vsBg.addColorStop(1, "#8B7518");
  ctx.fillStyle = vsBg;
  ctx.beginPath(); ctx.arc(cx, vsY, vsR, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = darkGreen;
  ctx.font = "900 50px 'Segoe UI', Arial, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText("VS", cx, vsY + 2);
  ctx.textBaseline = "alphabetic";

  if (hasScore) {
    const scoreY = H * 0.60;
    ctx.save();
    ctx.shadowColor = lightGold + "80"; ctx.shadowBlur = 20;
    ctx.fillStyle = lightGold;
    ctx.font = "900 120px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(fields.score1, cx - 180, scoreY);
    ctx.fillText("-", cx, scoreY);
    ctx.fillText(fields.score2, cx + 180, scoreY);
    ctx.restore();
    ctx.fillStyle = gold + "BB";
    ctx.font = "600 26px 'Segoe UI', Arial, sans-serif";
    ctx.fillText("RESULTADO FINAL", cx, scoreY + 50);
  } else {
    const nextY = H * 0.58;
    ctx.fillStyle = white;
    ctx.font = "700 28px 'Segoe UI', Arial, sans-serif";
    ctx.fillText("¡NO TE LO PIERDAS!", cx, nextY);
  }

  if (fields.mvpName) {
    const mvpY = hasScore ? H * 0.70 : H * 0.65;
    ctx.fillStyle = lightGold;
    ctx.font = "900 28px 'Segoe UI', Arial, sans-serif";
    ctx.fillText("🌟 MVP: " + fields.mvpName.toUpperCase(), cx, mvpY);
  }

  const infoY = H * 0.78;
  const infoW = 650;
  const infoH = 120;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 20;
  ctx.fillStyle = darkGreen + "E8";
  roundRect(ctx, cx - infoW / 2, infoY, infoW, infoH, 16);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = gold + "60"; ctx.lineWidth = 2;
  roundRect(ctx, cx - infoW / 2, infoY, infoW, infoH, 16);
  ctx.stroke();

  if (fields.datetime) {
    ctx.fillStyle = lightGold;
    ctx.font = "700 28px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(fields.datetime.toUpperCase(), cx, infoY + 45);
  }
  if (fields.venue) {
    ctx.fillStyle = white;
    ctx.font = "600 24px 'Segoe UI', Arial, sans-serif";
    ctx.fillText("📍 " + fields.venue, cx, infoY + 85);
  }

  const btmY = H - 55;
  const btmGrad = ctx.createLinearGradient(0, btmY - 40, 0, H);
  btmGrad.addColorStop(0, "transparent"); btmGrad.addColorStop(1, darkGreen + "DD");
  ctx.fillStyle = btmGrad;
  ctx.fillRect(0, btmY - 40, W, 95);

  const btmLine = ctx.createLinearGradient(0, btmY - 30, W, btmY - 30);
  btmLine.addColorStop(0, "transparent"); btmLine.addColorStop(0.15, gold + "60"); btmLine.addColorStop(0.85, gold + "60"); btmLine.addColorStop(1, "transparent");
  ctx.strokeStyle = btmLine; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, btmY - 30); ctx.lineTo(W, btmY - 30); ctx.stroke();

  ctx.fillStyle = gold + "BB";
  ctx.font = "600 20px 'Segoe UI', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("www.laligadecampeones.es  |  @laligadecampeones", cx, btmY + 10);
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
  const [state, setState] = useState<GeneratorState>({ ...INITIAL_STATE });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copiedCopy, setCopiedCopy] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);
  const [copyManuallyEdited, setCopyManuallyEdited] = useState(false);
  const [hashtagsManuallyEdited, setHashtagsManuallyEdited] = useState(false);

  const { data: matchesRaw = [] } = useQuery<MatchWithTeams[]>({
    queryKey: ["/api/home/schedule"],
    enabled: open,
  });

  useEffect(() => {
    if (open && media) {
      setState((prev) => ({ ...prev, selectedPhotos: [media] }));
    }
  }, [open, media]);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setState({ ...INITIAL_STATE });
      setCopyManuallyEdited(false);
      setHashtagsManuallyEdited(false);
      setSaved(false);
    }
  }, [open]);

  const filteredPhotos = allPhotos.filter((p) => {
    const kw = state.keywords.toLowerCase().trim();
    if (!kw && !state.dateFrom && !state.dateTo) return true;
    let matchesKw = true;
    let matchesDate = true;
    if (kw) {
      matchesKw = p.title.toLowerCase().includes(kw) || (p.description || "").toLowerCase().includes(kw);
    }
    if (state.dateFrom) matchesDate = new Date(p.createdAt) >= new Date(state.dateFrom);
    if (state.dateTo && matchesDate) matchesDate = new Date(p.createdAt) <= new Date(state.dateTo + "T23:59:59");
    return matchesKw && matchesDate;
  });

  const togglePhoto = (photo: MarketingMedia) => {
    setState((prev) => {
      const exists = prev.selectedPhotos.find((p) => p.id === photo.id);
      return { ...prev, selectedPhotos: exists ? prev.selectedPhotos.filter((p) => p.id !== photo.id) : [...prev.selectedPhotos, photo] };
    });
  };

  const autoFillFromMatch = (match: MatchWithTeams) => {
    const dateStr = match.dateTime
      ? (() => { try { const d = new Date(match.dateTime); return !isNaN(d.getTime()) ? format(d, "EEEE d 'de' MMMM, HH:mm", { locale: es }) : ""; } catch { return ""; } })()
      : "";
    const stageLabel = match.stage && match.stage !== "JORNADA" ? (MatchStageLabels[match.stage as keyof typeof MatchStageLabels] || "") : "";
    setState((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        team1: match.homeTeam?.name || "",
        team2: match.awayTeam?.name || "",
        score1: match.homeScore !== undefined && match.homeScore !== null ? String(match.homeScore) : "",
        score2: match.awayScore !== undefined && match.awayScore !== null ? String(match.awayScore) : "",
        matchday: stageLabel || String(match.roundNumber),
        datetime: dateStr,
        venue: match.field || "",
      },
    }));
  };

  const doRender = useCallback(async () => {
    if (!canvasRef.current) return;
    setIsRendering(true);
    try { await renderTemplate(canvasRef.current, state); } catch {}
    setIsRendering(false);
  }, [state]);

  useEffect(() => {
    if (step === 4 && canvasRef.current) {
      if (!copyManuallyEdited) {
        const copy = generateCopy(state);
        setState((prev) => ({ ...prev, copy }));
      }
      if (!hashtagsManuallyEdited) {
        const hashtags = generateHashtags(state);
        setState((prev) => ({ ...prev, hashtags }));
      }
      const t = setTimeout(doRender, 150);
      return () => clearTimeout(t);
    }
  }, [step, state.contentType, state.fields, state.selectedPhotos, doRender, copyManuallyEdited, hashtagsManuallyEdited]);

  const regenerateCopy = () => {
    const copy = generateCopy(state);
    const hashtags = generateHashtags(state);
    setState((prev) => ({ ...prev, copy, hashtags }));
    setCopyManuallyEdited(false);
    setHashtagsManuallyEdited(false);
    toast({ title: "Texto regenerado" });
  };

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    await renderTemplate(canvasRef.current, state);
    const blob = await new Promise<Blob>((res, rej) =>
      canvasRef.current!.toBlob((b) => (b ? res(b) : rej(new Error("fail"))), "image/png")
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `liga-${state.contentType}-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Imagen descargada" });
  };

  const handleSave = async () => {
    if (!canvasRef.current) return;
    setIsSaving(true);
    try {
      await renderTemplate(canvasRef.current, state);
      const blob = await new Promise<Blob>((res, rej) =>
        canvasRef.current!.toBlob((b) => (b ? res(b) : rej(new Error("fail"))), "image/png")
      );
      const file = new File([blob], `social-${state.contentType}-${Date.now()}.png`, { type: "image/png" });

      const uploadRes = await fetch("/api/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      if (!uploadRes.ok) throw new Error("Error al obtener URL de subida");
      const { uploadURL, objectPath } = await uploadRes.json();

      const putRes = await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      if (!putRes.ok) throw new Error("Error al subir imagen");

      const t1 = state.fields.team1 || "";
      const t2 = state.fields.team2 || "";
      const title = t1 && t2 ? `${t1} vs ${t2} - ${CONTENT_TYPE_CONFIG[state.contentType].label}` : `Contenido Redes - ${CONTENT_TYPE_CONFIG[state.contentType].label}`;

      await apiRequest("POST", "/api/admin/marketing", {
        title,
        description: state.copy.slice(0, 200),
        type: "PHOTO",
        url: objectPath,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing"] });
      setSaved(true);
      toast({ title: "Contenido guardado en Marketing" });
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" });
    }
    setIsSaving(false);
  };

  const copyText = async (text: string, type: "copy" | "hashtags") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "copy") { setCopiedCopy(true); setTimeout(() => setCopiedCopy(false), 2000); }
      else { setCopiedHashtags(true); setTimeout(() => setCopiedHashtags(false), 2000); }
      toast({ title: "Copiado al portapapeles" });
    } catch {
      toast({ title: "No se pudo copiar", variant: "destructive" });
    }
  };

  const updateField = (field: string, value: string) => {
    setState((prev) => ({ ...prev, fields: { ...prev.fields, [field]: value } }));
  };

  const totalSteps = 4;
  const canNext = (): boolean => {
    if (step === 1) return state.selectedPhotos.length > 0;
    return true;
  };

  const PHONE_WIDTH = 320;
  const phoneAspect: Record<ContentType, number> = { post: 1350 / 1080, story: 1920 / 1080, reel: 1920 / 1080 };
  const phoneHeight = PHONE_WIDTH * phoneAspect[state.contentType];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Contenido para Redes — Paso {step} de {totalSteps}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Busca y selecciona las imágenes que usarás."}
            {step === 2 && "Elige el formato y opcionalmente un partido para autorellenar."}
            {step === 3 && "Completa o edita los datos del contenido."}
            {step === 4 && "Vista previa, descarga y copia el texto."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 mb-4">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        <div className="min-h-[400px]">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Palabras clave</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input value={state.keywords} onChange={(e) => setState((p) => ({ ...p, keywords: e.target.value }))} placeholder="Ej: semifinal, MVP..." className="pl-9" data-testid="input-keywords" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Desde</Label>
                  <Input type="date" value={state.dateFrom} onChange={(e) => setState((p) => ({ ...p, dateFrom: e.target.value }))} data-testid="input-date-from" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Hasta</Label>
                  <Input type="date" value={state.dateTo} onChange={(e) => setState((p) => ({ ...p, dateTo: e.target.value }))} data-testid="input-date-to" />
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {filteredPhotos.length} foto{filteredPhotos.length !== 1 ? "s" : ""} encontrada{filteredPhotos.length !== 1 ? "s" : ""}
                {state.selectedPhotos.length > 0 && ` · ${state.selectedPhotos.length} seleccionada${state.selectedPhotos.length !== 1 ? "s" : ""}`}
              </p>

              {filteredPhotos.length === 0 ? (
                <Card><CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground"><Image className="h-12 w-12 mb-2" /><p>No se encontraron fotos</p></CardContent></Card>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-[350px] overflow-y-auto rounded-md border p-2">
                  {filteredPhotos.map((p) => {
                    const isSelected = state.selectedPhotos.some((s) => s.id === p.id);
                    return (
                      <button key={p.id} onClick={() => togglePhoto(p)} className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${isSelected ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-muted-foreground/30"}`} data-testid={`photo-select-${p.id}`}>
                        <img src={p.url} alt={p.title} className="h-full w-full object-cover" />
                        {isSelected && (<div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold"><Check className="h-3 w-3" /></div>)}
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1 py-0.5"><p className="text-[10px] text-white truncate">{p.title}</p></div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold mb-3">Formato del contenido</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(Object.entries(CONTENT_TYPE_CONFIG) as [ContentType, typeof CONTENT_TYPE_CONFIG["post"]][]).map(([key, cfg]) => (
                    <button key={key} onClick={() => setState((p) => ({ ...p, contentType: key }))} className={`rounded-xl border-2 p-5 text-left transition-all hover:shadow-md ${state.contentType === key ? "border-primary bg-primary/5 shadow-md" : "border-border"}`} data-testid={`type-${key}`}>
                      <p className="text-base font-bold">{cfg.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{cfg.desc}</p>
                      <Badge variant="outline" className="mt-2 text-[10px]">{cfg.dims} ({cfg.ratio})</Badge>
                    </button>
                  ))}
                </div>
              </div>

              {matchesRaw.length > 0 && (
                <div className="space-y-2 border-t pt-4">
                  <Label className="text-sm font-semibold">Autorellenar desde partido (opcional)</Label>
                  <div className="grid gap-2 max-h-48 overflow-y-auto">
                    {matchesRaw.map((m) => (
                      <button key={m.id} onClick={() => autoFillFromMatch(m)} className="flex items-center gap-3 rounded-md border px-3 py-2 text-left text-sm hover:bg-accent transition-colors" data-testid={`match-fill-${m.id}`}>
                        <Badge variant={m.status === "JUGADO" ? "default" : "outline"} className="shrink-0 text-[10px]">
                          {m.status === "JUGADO" ? "Jugado" : m.status === "EN_CURSO" ? "En curso" : "Programado"}
                        </Badge>
                        <span className="font-medium truncate">
                          {m.homeTeam?.name || "?"} {m.status === "JUGADO" ? `${m.homeScore}-${m.awayScore}` : "vs"} {m.awayTeam?.name || "?"}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto shrink-0">J{m.roundNumber}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Completa o edita los campos. Se autorellenaron si seleccionaste un partido.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Equipo Local</Label>
                  <Input value={state.fields.team1} onChange={(e) => updateField("team1", e.target.value)} placeholder="Ej: Fuengirola" data-testid="field-team1" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Equipo Visitante</Label>
                  <Input value={state.fields.team2} onChange={(e) => updateField("team2", e.target.value)} placeholder="Ej: El Palo" data-testid="field-team2" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Goles Local</Label>
                  <Input value={state.fields.score1} onChange={(e) => updateField("score1", e.target.value)} placeholder="Dejar vacío si no hay resultado" data-testid="field-score1" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Goles Visitante</Label>
                  <Input value={state.fields.score2} onChange={(e) => updateField("score2", e.target.value)} placeholder="Dejar vacío si no hay resultado" data-testid="field-score2" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Jornada / Etapa</Label>
                  <Input value={state.fields.matchday} onChange={(e) => updateField("matchday", e.target.value)} placeholder="Ej: 4 o Semifinal" data-testid="field-matchday" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Fecha y Hora</Label>
                  <Input value={state.fields.datetime} onChange={(e) => updateField("datetime", e.target.value)} placeholder="Ej: Sábado 8 de marzo, 20:00" data-testid="field-datetime" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Lugar / Cancha</Label>
                  <Input value={state.fields.venue} onChange={(e) => updateField("venue", e.target.value)} placeholder="Ej: Campo Central" data-testid="field-venue" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Nombre del MVP (opcional)</Label>
                  <Input value={state.fields.mvpName} onChange={(e) => updateField("mvpName", e.target.value)} placeholder="Ej: Carlos López" data-testid="field-mvp" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-medium">CTA (Call to Action)</Label>
                  <Input value={state.fields.cta} onChange={(e) => updateField("cta", e.target.value)} placeholder="Ej: Síguenos para más" data-testid="field-cta" />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6">
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-2xl bg-black p-2 shadow-2xl" style={{ width: PHONE_WIDTH + 16 }}>
                  <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
                      <div className="h-full w-full rounded-full bg-black flex items-center justify-center">
                        <span className="text-[6px] text-white font-bold">LC</span>
                      </div>
                    </div>
                    <span className="text-white text-[11px] font-semibold">laligadecampeones</span>
                  </div>

                  <div className="relative overflow-hidden rounded-sm bg-muted" style={{ width: PHONE_WIDTH, height: phoneHeight }}>
                    <canvas
                      ref={canvasRef}
                      style={{ width: PHONE_WIDTH, height: phoneHeight }}
                      data-testid="canvas-preview"
                    />
                    {isRendering && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                      </div>
                    )}
                  </div>

                  <div className="px-2 py-1.5 space-y-1">
                    <div className="flex gap-3">
                      <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </div>
                    <p className="text-white text-[10px] leading-tight line-clamp-2">{state.copy.split("\n")[0]}</p>
                  </div>
                </div>

                <Badge variant="outline" className="text-xs">{CONTENT_TYPE_CONFIG[state.contentType].dims}</Badge>

                <div className="flex gap-2 w-full">
                  <Button onClick={handleDownload} className="gap-1.5 flex-1 text-xs" size="sm" data-testid="button-download">
                    <Download className="h-3.5 w-3.5" />
                    Descargar
                  </Button>
                  <Button
                    onClick={handleSave}
                    variant={saved ? "secondary" : "outline"}
                    className="gap-1.5 flex-1 text-xs"
                    size="sm"
                    disabled={isSaving || saved}
                    data-testid="button-save"
                  >
                    {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                    {isSaving ? "Guardando..." : saved ? "Guardado" : "Guardar"}
                  </Button>
                </div>
              </div>

              <div className="space-y-4 overflow-y-auto max-h-[60vh]">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Copy para Publicación
                      {copyManuallyEdited && (<Badge variant="secondary" className="text-[10px] ml-1">Editado</Badge>)}
                    </Label>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={regenerateCopy} data-testid="button-regenerate-copy">
                        <Sparkles className="h-3 w-3" /> Regenerar
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => copyText(state.copy, "copy")} data-testid="button-copy-text">
                        {copiedCopy ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {copiedCopy ? "Copiado" : "Copiar"}
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={state.copy}
                    onChange={(e) => { setState((p) => ({ ...p, copy: e.target.value })); setCopyManuallyEdited(true); }}
                    rows={5}
                    className="text-sm"
                    placeholder="Escribe o edita el texto de tu publicación..."
                    data-testid="textarea-copy"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold flex items-center gap-2"><Hash className="h-4 w-4" /> Hashtags</Label>
                    <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => copyText(state.hashtags.join(" "), "hashtags")} data-testid="button-copy-hashtags">
                      {copiedHashtags ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedHashtags ? "Copiados" : `Copiar (${state.hashtags.length})`}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {state.hashtags.map((tag) => (
                      <button key={tag} onClick={() => { setState((p) => ({ ...p, hashtags: p.hashtags.filter((t) => t !== tag) })); setHashtagsManuallyEdited(true); }} className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary text-primary-foreground border border-primary transition-colors hover:bg-primary/80" data-testid={`tag-${tag.slice(1)}`}>
                        {tag} ✕
                      </button>
                    ))}
                  </div>
                  <form className="flex gap-2" onSubmit={(e) => {
                    e.preventDefault();
                    const input = (e.target as HTMLFormElement).elements.namedItem("newTag") as HTMLInputElement;
                    let val = input.value.trim();
                    if (!val) return;
                    if (!val.startsWith("#")) val = "#" + val;
                    val = "#" + sanitizeHashtag(val.slice(1));
                    if (val.length > 1 && !state.hashtags.includes(val)) { setState((p) => ({ ...p, hashtags: [...p.hashtags, val] })); setHashtagsManuallyEdited(true); }
                    input.value = "";
                  }}>
                    <Input name="newTag" placeholder="Agregar hashtag..." className="h-8 text-xs flex-1" data-testid="input-new-hashtag" />
                    <Button type="submit" size="sm" variant="outline" className="h-8 text-xs gap-1" data-testid="button-add-hashtag"><Plus className="h-3 w-3" /> Agregar</Button>
                  </form>
                </div>

                <div className="space-y-2 border-t pt-3">
                  <Label className="text-sm font-semibold">Texto Completo para Redes</Label>
                  <div className="rounded-md bg-muted/50 border p-3 text-sm whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto" data-testid="full-caption-preview">
                    {state.copy}{"\n\n"}{state.hashtags.join(" ")}
                  </div>
                  <Button className="gap-2 w-full" onClick={() => copyText(state.copy + "\n\n" + state.hashtags.join(" "), "copy")} data-testid="button-copy-all">
                    {copiedCopy ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    Copiar Todo
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1} className="gap-1" data-testid="button-prev">
            <ChevronLeft className="h-4 w-4" /> Anterior
          </Button>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }, (_, i) => (
              <button key={i} onClick={() => { if (i + 1 <= step || canNext()) setStep(i + 1); }} className={`h-2.5 w-2.5 rounded-full transition-colors ${i + 1 === step ? "bg-primary" : i + 1 < step ? "bg-primary/50" : "bg-muted"}`} data-testid={`step-dot-${i + 1}`} />
            ))}
          </div>
          {step < totalSteps ? (
            <Button onClick={() => setStep((s) => Math.min(totalSteps, s + 1))} disabled={!canNext()} className="gap-1" data-testid="button-next">
              Siguiente <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close">Cerrar</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
