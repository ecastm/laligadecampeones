import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Image, Upload } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Match, Team, Tournament, Division } from "@shared/schema";
import { uploadVsImage } from "@/lib/vs-image-generator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ligaLogo from "@assets/image_1771352006885.png";

interface MatchVsImageProps {
  match: Match;
  homeTeam: Team | undefined;
  awayTeam: Team | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MatchVsImage({ match, homeTeam, awayTeam, open, onOpenChange }: MatchVsImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const { data: tournaments = [] } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments/active/all"],
  });

  const { data: divisions = [] } = useQuery<Division[]>({
    queryKey: ["/api/divisions"],
  });

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const generateImage = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !homeTeam || !awayTeam) return;
    setIsGenerating(true);

    const W = 1080;
    const H = 1080;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    const cx = W / 2;

    const darkGreen = "#031D0A";
    const medGreen = "#0A4A1F";
    const brightGreen = "#0F6B2E";
    const gold = "#D4A824";
    const lightGold = "#F0D060";
    const brightGold = "#FFE066";
    const white = "#FFFFFF";

    const bgGrad = ctx.createRadialGradient(cx, H * 0.45, 0, cx, H * 0.45, H * 0.85);
    bgGrad.addColorStop(0, brightGreen);
    bgGrad.addColorStop(0.5, medGreen);
    bgGrad.addColorStop(1, darkGreen);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.strokeStyle = gold;
    ctx.lineWidth = 1;
    for (let i = -W; i < W * 2; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + H * 0.3, H);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(i + H * 0.3, 0);
      ctx.lineTo(i, H);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = lightGold;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, H * 0.48, 250, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, H * 0.48, 320, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    const topBarH = 180;
    const topGrad = ctx.createLinearGradient(0, 0, 0, topBarH);
    topGrad.addColorStop(0, darkGreen);
    topGrad.addColorStop(0.7, darkGreen + "EE");
    topGrad.addColorStop(1, "transparent");
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, W, topBarH);

    const goldLineGrad = ctx.createLinearGradient(0, topBarH - 4, W, topBarH - 4);
    goldLineGrad.addColorStop(0, "transparent");
    goldLineGrad.addColorStop(0.15, gold);
    goldLineGrad.addColorStop(0.85, gold);
    goldLineGrad.addColorStop(1, "transparent");
    ctx.strokeStyle = goldLineGrad;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, topBarH - 2);
    ctx.lineTo(W, topBarH - 2);
    ctx.stroke();

    try {
      const logoImg = await loadImage(ligaLogo);
      ctx.drawImage(logoImg, cx - 45, 18, 90, 90);
    } catch {}

    ctx.fillStyle = brightGold;
    ctx.font = "900 38px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.letterSpacing = "4px";
    ctx.fillText("LA LIGA DE CAMPEONES", cx, 148);
    ctx.letterSpacing = "0px";

    const tournament = tournaments.find(t => t.id === match.tournamentId);
    const division = tournament?.divisionId ? divisions.find(d => d.id === tournament.divisionId) : null;

    const roundY = 230;
    const roundText = `JORNADA ${match.roundNumber}`;
    ctx.font = "900 42px 'Segoe UI', Arial, sans-serif";
    const roundW = ctx.measureText(roundText).width + 80;
    const roundH = 58;

    const pillGrad = ctx.createLinearGradient(cx - roundW / 2, roundY - roundH / 2, cx + roundW / 2, roundY + roundH / 2);
    pillGrad.addColorStop(0, gold);
    pillGrad.addColorStop(0.5, lightGold);
    pillGrad.addColorStop(1, gold);
    ctx.fillStyle = pillGrad;
    roundRect(ctx, cx - roundW / 2, roundY - roundH / 2, roundW, roundH, roundH / 2);
    ctx.fill();

    ctx.fillStyle = darkGreen;
    ctx.font = "900 36px 'Segoe UI', Arial, sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText(roundText, cx, roundY + 1);
    ctx.textBaseline = "alphabetic";

    if (division) {
      ctx.fillStyle = gold + "BB";
      ctx.font = "600 24px 'Segoe UI', Arial, sans-serif";
      ctx.fillText(division.name.toUpperCase(), cx, roundY + 52);
    }

    const teamCenterY = 500;
    const teamSpacing = 260;
    const logoSize = 200;

    const drawTeamLogo = async (teamLogoUrl: string | undefined, x: number, y: number, size: number) => {
      ctx.save();
      ctx.shadowColor = gold + "60";
      ctx.shadowBlur = 30;
      const outerGrad = ctx.createRadialGradient(x, y, size / 2 - 5, x, y, size / 2 + 8);
      outerGrad.addColorStop(0, gold);
      outerGrad.addColorStop(1, gold + "00");
      ctx.fillStyle = outerGrad;
      ctx.beginPath();
      ctx.arc(x, y, size / 2 + 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (teamLogoUrl) {
        try {
          const img = await loadImage(teamLogoUrl);
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, size / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
          ctx.restore();
        } catch {
          drawFallbackLogo(ctx, x, y, size);
        }
      } else {
        drawFallbackLogo(ctx, x, y, size);
      }

      ctx.strokeStyle = gold;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.stroke();
    };

    const drawFallbackLogo = (c: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      const fbGrad = c.createRadialGradient(x, y - size * 0.1, 0, x, y, size / 2);
      fbGrad.addColorStop(0, medGreen);
      fbGrad.addColorStop(1, darkGreen);
      c.fillStyle = fbGrad;
      c.beginPath();
      c.arc(x, y, size / 2, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = brightGold;
      c.font = "900 60px 'Segoe UI', Arial, sans-serif";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText("FC", x, y);
      c.textBaseline = "alphabetic";
    };

    await drawTeamLogo(homeTeam.logoUrl || undefined, cx - teamSpacing, teamCenterY, logoSize);
    await drawTeamLogo(awayTeam.logoUrl || undefined, cx + teamSpacing, teamCenterY, logoSize);

    const nameY = teamCenterY + logoSize / 2 + 50;
    ctx.fillStyle = white;
    ctx.font = "900 42px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    const homeLines = wrapText(homeTeam.name.toUpperCase(), 12);
    homeLines.forEach((line, i) => {
      ctx.fillText(line, cx - teamSpacing, nameY + i * 48);
    });
    const awayLines = wrapText(awayTeam.name.toUpperCase(), 12);
    awayLines.forEach((line, i) => {
      ctx.fillText(line, cx + teamSpacing, nameY + i * 48);
    });

    const vsY = teamCenterY;
    const vsRadius = 72;

    ctx.save();
    ctx.shadowColor = brightGold + "80";
    ctx.shadowBlur = 40;
    const vsOuterGrad = ctx.createRadialGradient(cx, vsY, vsRadius - 5, cx, vsY, vsRadius + 15);
    vsOuterGrad.addColorStop(0, brightGold + "50");
    vsOuterGrad.addColorStop(1, "transparent");
    ctx.fillStyle = vsOuterGrad;
    ctx.beginPath();
    ctx.arc(cx, vsY, vsRadius + 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const vsBgGrad = ctx.createRadialGradient(cx, vsY - 15, 0, cx, vsY, vsRadius);
    vsBgGrad.addColorStop(0, lightGold);
    vsBgGrad.addColorStop(0.6, gold);
    vsBgGrad.addColorStop(1, "#8B7518");
    ctx.fillStyle = vsBgGrad;
    ctx.beginPath();
    ctx.arc(cx, vsY, vsRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = brightGold;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, vsY, vsRadius - 6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = darkGreen;
    ctx.font = "900 68px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("VS", cx, vsY + 2);
    ctx.textBaseline = "alphabetic";

    if (match.status === "JUGADO" && match.homeScore !== undefined && match.awayScore !== undefined) {
      const scoreY = teamCenterY - logoSize / 2 - 45;
      ctx.save();
      ctx.shadowColor = brightGold + "80";
      ctx.shadowBlur = 20;
      ctx.fillStyle = brightGold;
      ctx.font = "900 90px 'Segoe UI', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(match.homeScore), cx - teamSpacing, scoreY);
      ctx.fillText(String(match.awayScore), cx + teamSpacing, scoreY);
      ctx.restore();
    }

    const infoY = 820;
    const infoH = 150;
    const infoW = 700;

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 25;
    const infoBgGrad = ctx.createLinearGradient(cx - infoW / 2, infoY, cx + infoW / 2, infoY + infoH);
    infoBgGrad.addColorStop(0, darkGreen + "F0");
    infoBgGrad.addColorStop(1, "#021508F0");
    ctx.fillStyle = infoBgGrad;
    roundRect(ctx, cx - infoW / 2, infoY, infoW, infoH, 20);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = gold + "80";
    ctx.lineWidth = 2;
    roundRect(ctx, cx - infoW / 2, infoY, infoW, infoH, 20);
    ctx.stroke();

    const matchDate = new Date(match.dateTime);
    ctx.fillStyle = brightGold;
    ctx.font = "900 34px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(format(matchDate, "EEEE d 'de' MMMM", { locale: es }).toUpperCase(), cx, infoY + 48);

    ctx.fillStyle = white;
    ctx.font = "700 30px 'Segoe UI', Arial, sans-serif";
    const timeText = format(matchDate, "HH:mm", { locale: es }) + " HRS";
    const fieldText = match.field ? `  |  ${match.field.toUpperCase()}` : "";
    ctx.fillText(timeText + fieldText, cx, infoY + 95);

    if (tournament) {
      ctx.fillStyle = gold + "90";
      ctx.font = "600 22px 'Segoe UI', Arial, sans-serif";
      ctx.fillText(tournament.name.toUpperCase(), cx, infoY + 130);
    }

    const bottomY = 1010;
    const btmLineGrad = ctx.createLinearGradient(0, bottomY, W, bottomY);
    btmLineGrad.addColorStop(0, "transparent");
    btmLineGrad.addColorStop(0.1, gold + "60");
    btmLineGrad.addColorStop(0.5, gold);
    btmLineGrad.addColorStop(0.9, gold + "60");
    btmLineGrad.addColorStop(1, "transparent");
    ctx.strokeStyle = btmLineGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, bottomY);
    ctx.lineTo(W, bottomY);
    ctx.stroke();

    ctx.fillStyle = gold + "AA";
    ctx.font = "600 22px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("www.laligadecampeones.com", cx - 100, bottomY + 38);
    ctx.fillStyle = lightGold + "88";
    ctx.fillText("@laligadecampeones", cx + 180, bottomY + 38);

    setIsGenerating(false);
  }, [match, homeTeam, awayTeam, tournaments, divisions]);

  const downloadImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !homeTeam || !awayTeam) return;
    const link = document.createElement("a");
    link.download = `partido-${homeTeam.name}-vs-${awayTeam.name}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [homeTeam, awayTeam]);

  useEffect(() => {
    if (open) {
      setTimeout(() => generateImage(), 100);
    }
  }, [open, generateImage]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Imagen VS para Instagram
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-md border">
            <canvas
              ref={canvasRef}
              className="w-full"
              style={{ aspectRatio: "1/1" }}
              data-testid="canvas-vs-image"
            />
            {isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <p className="text-sm text-muted-foreground">Generando imagen...</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={downloadImage}
              className="flex-1"
              data-testid="button-download-vs-image"
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar PNG
            </Button>
            <Button
              variant="outline"
              onClick={() => generateImage()}
              data-testid="button-regenerate-vs-image"
            >
              Regenerar
            </Button>
          </div>
          <Button
            variant="default"
            className="w-full"
            disabled={isSaving || isGenerating}
            onClick={async () => {
              const canvas = canvasRef.current;
              if (!canvas) return;
              setIsSaving(true);
              try {
                const blob = await new Promise<Blob>((resolve, reject) => {
                  canvas.toBlob((b) => b ? resolve(b) : reject(new Error("No blob")), "image/png");
                });
                const objectPath = await uploadVsImage(blob, match.id);
                await apiRequest("PUT", `/api/admin/matches/${match.id}`, { vsImageUrl: objectPath });
                queryClient.invalidateQueries({ queryKey: ["/api/admin/matches"] });
                queryClient.invalidateQueries({ queryKey: ["/api/home/schedule"] });
                queryClient.invalidateQueries({ queryKey: ["/api/home/schedule/upcoming"] });
                toast({ title: "Imagen VS guardada correctamente" });
              } catch (err) {
                toast({ title: "Error al guardar imagen", variant: "destructive" });
              } finally {
                setIsSaving(false);
              }
            }}
            data-testid="button-save-vs-image"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isSaving ? "Guardando..." : "Guardar Imagen VS"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current) lines.push(current);
  return lines;
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
