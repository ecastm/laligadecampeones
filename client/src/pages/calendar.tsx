import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Download,
  Home,
  Trophy,
  Swords,
} from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isSameMonth } from "date-fns";
import { es } from "date-fns/locale";
import type { MatchWithTeams, Tournament, Division } from "@shared/schema";
import ligaLogo from "@assets/image_1771352006885.png";

const DAYS_OF_WEEK = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedMatch, setSelectedMatch] = useState<MatchWithTeams | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { data: tournaments = [] } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments/active/all"],
  });

  const { data: divisions = [] } = useQuery<Division[]>({
    queryKey: ["/api/divisions"],
  });

  const { data: allMatches = [], isLoading } = useQuery<MatchWithTeams[]>({
    queryKey: ["/api/home/schedule"],
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDayOfWeek = getDay(monthStart);
  const paddingDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const matchesByDate = allMatches.reduce<Record<string, MatchWithTeams[]>>((acc, match) => {
    const dateKey = format(new Date(match.dateTime), "yyyy-MM-dd");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(match);
    return acc;
  }, {});

  const matchesThisMonth = allMatches.filter((m) => {
    const d = new Date(m.dateTime);
    return isSameMonth(d, currentMonth);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "JUGADO": return "bg-green-600/20 text-green-700 dark:text-green-400 border-green-600/30";
      case "EN_CURSO": return "bg-yellow-600/20 text-yellow-700 dark:text-yellow-400 border-yellow-600/30";
      default: return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "JUGADO": return "Jugado";
      case "EN_CURSO": return "En Curso";
      default: return "Programado";
    }
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const generateInstagramImage = useCallback(async (match: MatchWithTeams) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
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
    await drawTeamLogo(match.homeTeam.logoUrl, cx - teamSpacing, teamY, logoSize);
    await drawTeamLogo(match.awayTeam.logoUrl, cx + teamSpacing, teamY, logoSize);

    ctx.fillStyle = white;
    ctx.font = "bold 30px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    const homeNameLines = wrapText(match.homeTeam.name.toUpperCase(), 20);
    homeNameLines.forEach((line, i) => {
      ctx.fillText(line, cx - teamSpacing, teamY + logoSize / 2 + 40 + i * 35);
    });

    const awayNameLines = wrapText(match.awayTeam.name.toUpperCase(), 20);
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
  }, [tournaments, divisions]);

  const downloadImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedMatch) return;
    const link = document.createElement("a");
    link.download = `partido-${selectedMatch.homeTeam.name}-vs-${selectedMatch.awayTeam.name}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [selectedMatch]);

  useEffect(() => {
    if (selectedMatch) {
      generateInstagramImage(selectedMatch);
    }
  }, [selectedMatch, generateInstagramImage]);

  const today = new Date();

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-[100] border-b border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <img src={ligaLogo} alt="La Liga de Campeones" className="h-10 w-10 object-contain" />
              <span className="text-lg sm:text-xl font-bold">Calendario</span>
            </div>
            <div className="flex items-center gap-2">
              <a href="/" data-testid="link-home">
                <Button variant="ghost" size="icon">
                  <Home className="h-4 w-4" />
                </Button>
              </a>
              <a href="/historial" data-testid="link-history">
                <Button variant="ghost" size="icon">
                  <Trophy className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-5xl">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} data-testid="button-prev-month">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg sm:text-2xl font-bold capitalize" data-testid="text-current-month">
            {format(currentMonth, "MMMM yyyy", { locale: es })}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} data-testid="button-next-month">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {matchesThisMonth.length > 0 && (
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <span>{matchesThisMonth.length} partido{matchesThisMonth.length !== 1 ? "s" : ""} este mes</span>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-20 sm:h-28" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-px sm:gap-1 mb-px sm:mb-1">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="text-center text-xs sm:text-sm font-semibold text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-px sm:gap-1">
              {Array.from({ length: paddingDays }).map((_, i) => (
                <div key={`pad-${i}`} className="min-h-[60px] sm:min-h-[100px]" />
              ))}

              {daysInMonth.map((day) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const dayMatches = matchesByDate[dateKey] || [];
                const isToday = isSameDay(day, today);

                return (
                  <Card
                    key={dateKey}
                    className={`min-h-[60px] sm:min-h-[100px] overflow-visible p-0 ${
                      isToday ? "border-primary border-2" : ""
                    } ${dayMatches.length > 0 ? "hover-elevate cursor-pointer" : ""}`}
                    data-testid={`calendar-day-${dateKey}`}
                  >
                    <div className="p-1 sm:p-2 h-full flex flex-col">
                      <div className={`text-xs sm:text-sm font-medium mb-1 ${isToday ? "text-primary font-bold" : "text-muted-foreground"}`}>
                        {format(day, "d")}
                      </div>
                      <div className="flex-1 space-y-0.5 sm:space-y-1 overflow-hidden">
                        {dayMatches.slice(0, 2).map((match) => (
                          <button
                            key={match.id}
                            className={`w-full text-left rounded px-1 py-0.5 text-[9px] sm:text-[11px] leading-tight truncate border ${getStatusColor(match.status)}`}
                            onClick={() => setSelectedMatch(match)}
                            data-testid={`button-match-${match.id}`}
                          >
                            <span className="font-semibold">{getShortName(match.homeTeam.name)}</span>
                            <span className="mx-0.5 opacity-60">v</span>
                            <span className="font-semibold">{getShortName(match.awayTeam.name)}</span>
                          </button>
                        ))}
                        {dayMatches.length > 2 && (
                          <div className="text-[9px] sm:text-[10px] text-muted-foreground text-center">
                            +{dayMatches.length - 2} más
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {matchesThisMonth.length > 0 && (
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Swords className="h-5 w-5 text-primary" />
                Partidos de {format(currentMonth, "MMMM yyyy", { locale: es })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {matchesThisMonth
                  .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
                  .map((match) => (
                    <button
                      key={match.id}
                      className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 rounded-md border p-3 text-left hover-elevate"
                      onClick={() => setSelectedMatch(match)}
                      data-testid={`button-list-match-${match.id}`}
                    >
                      <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                        <Clock className="h-3 w-3" />
                        {format(new Date(match.dateTime), "EEE d MMM, HH:mm", { locale: es })}
                      </div>
                      <div className="flex-1 flex items-center gap-2 text-sm font-medium">
                        <span className="truncate">{match.homeTeam.name}</span>
                        <Badge variant="outline" className="text-[10px] shrink-0">VS</Badge>
                        <span className="truncate">{match.awayTeam.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {match.status === "JUGADO" && match.homeScore !== undefined && match.awayScore !== undefined && (
                          <Badge variant="secondary" className="text-xs">{match.homeScore} - {match.awayScore}</Badge>
                        )}
                        <Badge variant="outline" className={`text-[10px] ${getStatusColor(match.status)}`}>
                          {getStatusLabel(match.status)}
                        </Badge>
                        <SiInstagram className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!selectedMatch} onOpenChange={(open) => { if (!open) setSelectedMatch(null); }}>
        <DialogContent className="max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Swords className="h-5 w-5 text-primary" />
              Detalle del Partido
            </DialogTitle>
          </DialogHeader>

          {selectedMatch && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="text-center flex-1">
                  {selectedMatch.homeTeam.logoUrl ? (
                    <img src={selectedMatch.homeTeam.logoUrl} alt={selectedMatch.homeTeam.name} className="h-12 w-12 mx-auto rounded-md object-cover" />
                  ) : (
                    <div className="h-12 w-12 mx-auto rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {selectedMatch.homeTeam.name.charAt(0)}
                    </div>
                  )}
                  <p className="mt-1 text-sm font-semibold">{selectedMatch.homeTeam.name}</p>
                </div>
                <div className="text-center px-4">
                  {selectedMatch.status === "JUGADO" && selectedMatch.homeScore !== undefined && selectedMatch.awayScore !== undefined ? (
                    <p className="text-2xl font-bold">{selectedMatch.homeScore} - {selectedMatch.awayScore}</p>
                  ) : (
                    <p className="text-xl font-bold text-primary">VS</p>
                  )}
                  <Badge variant="outline" className={`mt-1 text-[10px] ${getStatusColor(selectedMatch.status)}`}>
                    {getStatusLabel(selectedMatch.status)}
                  </Badge>
                </div>
                <div className="text-center flex-1">
                  {selectedMatch.awayTeam.logoUrl ? (
                    <img src={selectedMatch.awayTeam.logoUrl} alt={selectedMatch.awayTeam.name} className="h-12 w-12 mx-auto rounded-md object-cover" />
                  ) : (
                    <div className="h-12 w-12 mx-auto rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {selectedMatch.awayTeam.name.charAt(0)}
                    </div>
                  )}
                  <p className="mt-1 text-sm font-semibold">{selectedMatch.awayTeam.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  <span>{format(new Date(selectedMatch.dateTime), "EEEE d 'de' MMMM, yyyy", { locale: es })}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{format(new Date(selectedMatch.dateTime), "HH:mm", { locale: es })} hrs</span>
                </div>
                {selectedMatch.field && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{selectedMatch.field}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span>Jornada {selectedMatch.roundNumber}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3 flex items-center gap-2">
                  <SiInstagram className="h-4 w-4 text-primary" />
                  Imagen para Redes Sociales
                </p>
                <canvas
                  ref={canvasRef}
                  className="w-full rounded-md border"
                  style={{ maxWidth: "100%", height: "auto" }}
                  data-testid="canvas-instagram"
                />
                <Button
                  className="w-full mt-3"
                  onClick={downloadImage}
                  disabled={isGenerating}
                  data-testid="button-download-image"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isGenerating ? "Generando..." : "Descargar Imagen"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function wrapText(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxChars) {
      if (current) lines.push(current);
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

function getShortName(name: string): string {
  if (name.length <= 8) return name;
  const words = name.split(" ");
  if (words.length >= 2) {
    return words[0].substring(0, 3) + " " + words[words.length - 1].substring(0, 3);
  }
  return name.substring(0, 7);
}
