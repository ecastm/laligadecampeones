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
import { MatchStageLabels, type MatchStage } from "@shared/schema";
import { useSiteSettings } from "@/hooks/use-site-settings";

const DAYS_OF_WEEK = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedMatch, setSelectedMatch] = useState<MatchWithTeams | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { data: tournaments = [] } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments/active/all"],
  });

  const { logoUrl } = useSiteSettings();

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

  const validMatches = allMatches;

  const matchesByDate = validMatches.reduce<Record<string, MatchWithTeams[]>>((acc, match) => {
    const dateKey = format(new Date(match.dateTime), "yyyy-MM-dd");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(match);
    return acc;
  }, {});

  const matchesThisMonth = validMatches.filter((m) => {
    const d = new Date(m.dateTime);
    return isSameMonth(d, currentMonth);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "JUGADO": return "bg-sport-green/20 text-sport-green border-sport-green/30";
      case "EN_CURSO": return "bg-primary/20 text-primary border-primary/30";
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
    const cx = W / 2;

    const darkGreen = "#0D0D0D";
    const medGreen = "#1A1A1A";
    const brightGreen = "#252525";
    const gold = "#C6A052";
    const lightGold = "#D4B86A";
    const brightGold = "#E0C878";
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
      const logoImg = await loadImage(logoUrl);
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
    const stageLabel = match.stage && match.stage !== "JORNADA"
      ? (MatchStageLabels[match.stage as MatchStage] || match.stage).toUpperCase()
      : null;
    const roundText = stageLabel || `JORNADA ${match.roundNumber}`;
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

    const drawTeamLogo = async (teamLogoUrl: string | undefined | null, x: number, y: number, size: number) => {
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

    await drawTeamLogo(match.homeTeam?.logoUrl, cx - teamSpacing, teamCenterY, logoSize);
    await drawTeamLogo(match.awayTeam?.logoUrl, cx + teamSpacing, teamCenterY, logoSize);

    const nameY = teamCenterY + logoSize / 2 + 50;
    ctx.fillStyle = white;
    ctx.font = "900 42px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    const homeLines = wrapText((match.homeTeam?.name || "POR DEFINIR").toUpperCase(), 12);
    homeLines.forEach((line, i) => {
      ctx.fillText(line, cx - teamSpacing, nameY + i * 48);
    });
    const awayLines = wrapText((match.awayTeam?.name || "POR DEFINIR").toUpperCase(), 12);
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
  }, [tournaments, divisions]);

  const downloadImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedMatch) return;
    const link = document.createElement("a");
    link.download = `partido-${selectedMatch.homeTeam?.name || "TBD"}-vs-${selectedMatch.awayTeam?.name || "TBD"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [selectedMatch]);

  useEffect(() => {
    if (selectedMatch && !selectedMatch.vsImageUrl) {
      setTimeout(() => generateInstagramImage(selectedMatch), 150);
    }
  }, [selectedMatch, generateInstagramImage]);

  const today = new Date();

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-[100] border-b border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <img src={logoUrl} alt="La Liga de Campeones" className="h-10 w-10 object-contain" />
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
                            <span className="font-semibold">{getShortName(match.homeTeam?.name || "Por definir")}</span>
                            <span className="mx-0.5 opacity-60">v</span>
                            <span className="font-semibold">{getShortName(match.awayTeam?.name || "Por definir")}</span>
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
                        {match.homeTeam?.logoUrl ? (
                          <img src={match.homeTeam.logoUrl} alt="" className="h-5 w-5 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[8px] shrink-0">{match.homeTeam ? match.homeTeam.name.charAt(0) : "?"}</div>
                        )}
                        <span className="truncate">{match.homeTeam?.name || "Por definir"}</span>
                        <Badge variant="outline" className="text-[10px] shrink-0">VS</Badge>
                        {match.awayTeam?.logoUrl ? (
                          <img src={match.awayTeam.logoUrl} alt="" className="h-5 w-5 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[8px] shrink-0">{match.awayTeam ? match.awayTeam.name.charAt(0) : "?"}</div>
                        )}
                        <span className="truncate">{match.awayTeam?.name || "Por definir"}</span>
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
                  {selectedMatch.homeTeam?.logoUrl ? (
                    <img src={selectedMatch.homeTeam.logoUrl} alt={selectedMatch.homeTeam.name} className="h-12 w-12 mx-auto rounded-md object-cover" />
                  ) : (
                    <div className="h-12 w-12 mx-auto rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {selectedMatch.homeTeam ? selectedMatch.homeTeam.name.charAt(0) : "?"}
                    </div>
                  )}
                  <p className="mt-1 text-sm font-semibold">{selectedMatch.homeTeam?.name || "Por definir"}</p>
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
                  {selectedMatch.awayTeam?.logoUrl ? (
                    <img src={selectedMatch.awayTeam.logoUrl} alt={selectedMatch.awayTeam.name} className="h-12 w-12 mx-auto rounded-md object-cover" />
                  ) : (
                    <div className="h-12 w-12 mx-auto rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {selectedMatch.awayTeam ? selectedMatch.awayTeam.name.charAt(0) : "?"}
                    </div>
                  )}
                  <p className="mt-1 text-sm font-semibold">{selectedMatch.awayTeam?.name || "Por definir"}</p>
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
                  <span>
                    {selectedMatch.stage && selectedMatch.stage !== "JORNADA"
                      ? MatchStageLabels[selectedMatch.stage as MatchStage]
                      : `Jornada ${selectedMatch.roundNumber}`}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3 flex items-center gap-2">
                  <SiInstagram className="h-4 w-4 text-primary" />
                  Imagen para Redes Sociales
                </p>
                {selectedMatch.vsImageUrl ? (
                  <img
                    src={selectedMatch.vsImageUrl}
                    alt={`${selectedMatch.homeTeam?.name || "Por definir"} vs ${selectedMatch.awayTeam?.name || "Por definir"}`}
                    className="w-full rounded-md border"
                    style={{ aspectRatio: "1/1" }}
                    data-testid="img-saved-vs"
                  />
                ) : (
                  <canvas
                    ref={canvasRef}
                    className="w-full rounded-md border"
                    style={{ aspectRatio: "1/1" }}
                    data-testid="canvas-instagram"
                  />
                )}
                <Button
                  className="w-full mt-3"
                  onClick={selectedMatch.vsImageUrl ? () => {
                    const link = document.createElement("a");
                    link.href = selectedMatch.vsImageUrl!;
                    link.download = `partido-${selectedMatch.homeTeam?.name || "TBD"}-vs-${selectedMatch.awayTeam?.name || "TBD"}.png`;
                    link.click();
                  } : downloadImage}
                  disabled={!selectedMatch.vsImageUrl && isGenerating}
                  data-testid="button-download-image"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {!selectedMatch.vsImageUrl && isGenerating ? "Generando..." : "Descargar Imagen"}
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
