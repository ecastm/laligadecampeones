import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Image } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Match, Team, Tournament, Division } from "@shared/schema";
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

    const darkGreen = "#063A13";
    const medGreen = "#0B5D1E";
    const gold = "#C9A227";
    const lightGold = "#E6C75A";
    const white = "#FFFFFF";
    const lightGray = "#E0E0E0";

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, darkGreen);
    grad.addColorStop(0.5, medGreen);
    grad.addColorStop(1, darkGreen);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = gold + "15";
    ctx.lineWidth = 1;
    for (let i = 0; i < W; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, H);
      ctx.stroke();
    }
    for (let i = 0; i < H; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(W, i);
      ctx.stroke();
    }

    ctx.strokeStyle = gold + "30";
    ctx.lineWidth = 2;
    const cx = W / 2;
    const cy = H / 2 + 30;
    ctx.beginPath();
    ctx.arc(cx, cy, 180, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - 200);
    ctx.lineTo(cx, cy + 200);
    ctx.stroke();

    try {
      const logoImg = await loadImage(ligaLogo);
      const logoSize = 100;
      ctx.drawImage(logoImg, cx - logoSize / 2, 30, logoSize, logoSize);
    } catch {}

    ctx.fillStyle = lightGold;
    ctx.font = "bold 28px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("LA LIGA DE CAMPEONES", cx, 160);

    ctx.fillStyle = gold;
    ctx.font = "bold 20px 'Segoe UI', Arial, sans-serif";
    const tournament = tournaments.find(t => t.id === match.tournamentId);
    const division = tournament?.divisionId ? divisions.find(d => d.id === tournament.divisionId) : null;
    const tournamentText = tournament ? tournament.name : "";
    const divisionText = division ? ` • ${division.name}` : "";
    ctx.fillText(`${tournamentText}${divisionText}`, cx, 195);

    const lineY = 215;
    const lineGrad = ctx.createLinearGradient(cx - 200, lineY, cx + 200, lineY);
    lineGrad.addColorStop(0, "transparent");
    lineGrad.addColorStop(0.3, gold);
    lineGrad.addColorStop(0.7, gold);
    lineGrad.addColorStop(1, "transparent");
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 200, lineY);
    ctx.lineTo(cx + 200, lineY);
    ctx.stroke();

    ctx.fillStyle = lightGold;
    ctx.font = "bold 22px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(`JORNADA ${match.roundNumber}`, cx, 260);

    const teamY = 440;
    const teamSpacing = 220;

    const drawTeamLogo = async (teamLogoUrl: string | undefined, x: number, y: number, size: number) => {
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
          ctx.strokeStyle = gold;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(x, y, size / 2, 0, Math.PI * 2);
          ctx.stroke();
        } catch {
          drawFallbackLogo(ctx, x, y, size);
        }
      } else {
        drawFallbackLogo(ctx, x, y, size);
      }
    };

    const drawFallbackLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      const fallbackGrad = ctx.createRadialGradient(x, y, 0, x, y, size / 2);
      fallbackGrad.addColorStop(0, gold + "40");
      fallbackGrad.addColorStop(1, gold + "15");
      ctx.fillStyle = fallbackGrad;
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = gold;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = lightGold;
      ctx.font = "bold 40px 'Segoe UI', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("FC", x, y);
      ctx.textBaseline = "alphabetic";
    };

    const logoSize = 130;
    await drawTeamLogo(homeTeam.logoUrl || undefined, cx - teamSpacing, teamY, logoSize);
    await drawTeamLogo(awayTeam.logoUrl || undefined, cx + teamSpacing, teamY, logoSize);

    ctx.fillStyle = white;
    ctx.font = "bold 30px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    const homeNameLines = wrapText(homeTeam.name.toUpperCase(), 20);
    homeNameLines.forEach((line, i) => {
      ctx.fillText(line, cx - teamSpacing, teamY + logoSize / 2 + 40 + i * 35);
    });

    const awayNameLines = wrapText(awayTeam.name.toUpperCase(), 20);
    awayNameLines.forEach((line, i) => {
      ctx.fillText(line, cx + teamSpacing, teamY + logoSize / 2 + 40 + i * 35);
    });

    const vsGrad = ctx.createRadialGradient(cx, teamY, 0, cx, teamY, 60);
    vsGrad.addColorStop(0, gold);
    vsGrad.addColorStop(1, lightGold);

    ctx.fillStyle = darkGreen;
    ctx.beginPath();
    ctx.arc(cx, teamY, 55, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = gold;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, teamY, 55, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = lightGold;
    ctx.font = "bold 50px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("VS", cx, teamY);
    ctx.textBaseline = "alphabetic";

    if (match.status === "JUGADO" && match.homeScore !== undefined && match.awayScore !== undefined) {
      ctx.fillStyle = white;
      ctx.font = "bold 70px 'Segoe UI', Arial, sans-serif";
      ctx.fillText(String(match.homeScore), cx - teamSpacing, teamY - logoSize / 2 - 30);
      ctx.fillText(String(match.awayScore), cx + teamSpacing, teamY - logoSize / 2 - 30);
    }

    const infoY = 720;
    const infoBg = ctx.createLinearGradient(cx - 250, infoY - 30, cx + 250, infoY + 80);
    infoBg.addColorStop(0, darkGreen + "CC");
    infoBg.addColorStop(1, medGreen + "CC");
    ctx.fillStyle = infoBg;
    roundRect(ctx, cx - 280, infoY - 35, 560, 120, 15);
    ctx.fill();
    ctx.strokeStyle = gold + "50";
    ctx.lineWidth = 1;
    roundRect(ctx, cx - 280, infoY - 35, 560, 120, 15);
    ctx.stroke();

    const matchDate = new Date(match.dateTime);
    ctx.fillStyle = lightGold;
    ctx.font = "bold 24px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(format(matchDate, "EEEE d 'de' MMMM, yyyy", { locale: es }).toUpperCase(), cx, infoY + 5);

    ctx.fillStyle = lightGray;
    ctx.font = "20px 'Segoe UI', Arial, sans-serif";
    ctx.fillText("HORA: " + format(matchDate, "HH:mm", { locale: es }) + " hrs", cx, infoY + 40);

    if (match.field) {
      ctx.fillText("CANCHA: " + match.field, cx, infoY + 70);
    }

    const bottomLineY = 900;
    const bottomLineGrad = ctx.createLinearGradient(0, bottomLineY, W, bottomLineY);
    bottomLineGrad.addColorStop(0, "transparent");
    bottomLineGrad.addColorStop(0.2, gold);
    bottomLineGrad.addColorStop(0.8, gold);
    bottomLineGrad.addColorStop(1, "transparent");
    ctx.strokeStyle = bottomLineGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, bottomLineY);
    ctx.lineTo(W, bottomLineY);
    ctx.stroke();

    ctx.fillStyle = gold + "80";
    ctx.font = "16px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("www.laligadecampeones.com", cx, 940);

    ctx.fillStyle = gold + "50";
    ctx.font = "14px 'Segoe UI', Arial, sans-serif";
    ctx.fillText("@laligadecampeones", cx, 970);

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
