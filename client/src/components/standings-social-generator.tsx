import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { StandingsEntry, Tournament } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2 } from "lucide-react";
import { getAuthHeader } from "@/lib/auth";

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

async function renderStandingsCanvas(canvas: HTMLCanvasElement, standings: StandingsEntry[], tournamentName: string): Promise<void> {
  const W = 1080, H = 1350;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const dk = "#0D0D0D", md = "#1A1A1A", br = "#252525", gd = "#C6A052", lg = "#D4B86A", wh = "#FFFFFF", gr = "#0B6B3A";

  // Background gradient
  const bg = ctx.createRadialGradient(W / 2, H * 0.4, 0, W / 2, H * 0.4, H * 0.8);
  bg.addColorStop(0, br);
  bg.addColorStop(0.5, md);
  bg.addColorStop(1, dk);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Logo watermark
  try {
    const logo = await loadImage("/favicon.png");
    ctx.globalAlpha = 0.08;
    const logoSize = 400;
    ctx.drawImage(logo, (W - logoSize) / 2, (H - logoSize) / 2, logoSize, logoSize);
    ctx.globalAlpha = 1;
  } catch {}

  // Top header
  const topH = 140;
  const tg = ctx.createLinearGradient(0, 0, 0, topH);
  tg.addColorStop(0, dk);
  tg.addColorStop(0.8, dk + "EE");
  tg.addColorStop(1, "transparent");
  ctx.fillStyle = tg;
  ctx.fillRect(0, 0, W, topH);

  const gl = ctx.createLinearGradient(0, topH - 4, W, topH - 4);
  gl.addColorStop(0, "transparent");
  gl.addColorStop(0.15, gd);
  gl.addColorStop(0.85, gd);
  gl.addColorStop(1, "transparent");
  ctx.strokeStyle = gl;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, topH - 2);
  ctx.lineTo(W, topH - 2);
  ctx.stroke();

  ctx.fillStyle = lg;
  ctx.font = "900 32px 'Segoe UI', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("TABLA DE POSICIONES", W / 2, topH - 30);

  // Subtitle with tournament name
  ctx.fillStyle = gd + "BB";
  ctx.font = "600 20px 'Segoe UI', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(tournamentName, W / 2, topH + 20);

  // Table header
  const tableStartY = topH + 60;
  const headerH = 50;
  const headerBg = ctx.createLinearGradient(0, tableStartY, 0, tableStartY + headerH);
  headerBg.addColorStop(0, gd);
  headerBg.addColorStop(0.5, lg);
  headerBg.addColorStop(1, gd);
  ctx.fillStyle = headerBg;
  ctx.fillRect(40, tableStartY, W - 80, headerH);

  ctx.fillStyle = dk;
  ctx.font = "700 16px 'Segoe UI', Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const headerY = tableStartY + headerH / 2;
  ctx.fillText("Pos", 50, headerY);
  ctx.fillText("Equipo", 110, headerY);
  ctx.textAlign = "center";
  ctx.fillText("PJ", 800, headerY);
  ctx.fillText("G", 850, headerY);
  ctx.fillText("E", 900, headerY);
  ctx.fillText("P", 950, headerY);
  ctx.fillText("Pts", 1000, headerY);

  // Table rows
  const rowH = 45;
  const maxRows = 15;
  const visibleStandings = standings.slice(0, maxRows);

  visibleStandings.forEach((entry, idx) => {
    const rowY = tableStartY + headerH + idx * rowH;

    // Alternate row background
    if (idx % 2 === 1) {
      ctx.fillStyle = br + "80";
      ctx.fillRect(40, rowY, W - 80, rowH);
    }

    // Position badge
    ctx.fillStyle = idx < 3 ? gr : gd;
    roundRect(ctx, 45, rowY + 8, 35, 30, 4);
    ctx.fill();
    ctx.fillStyle = wh;
    ctx.font = "700 18px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${idx + 1}`, 62.5, rowY + 23);

    // Team name
    ctx.fillStyle = wh;
    ctx.font = "600 16px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const teamName = (entry.teamName || "Sin equipo").length > 25 ? (entry.teamName || "Sin equipo").substring(0, 22) + "..." : (entry.teamName || "Sin equipo");
    ctx.fillText(teamName, 110, rowY + rowH / 2);

    // Stats
    ctx.fillStyle = lg;
    ctx.font = "600 15px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const statY = rowY + rowH / 2;
    ctx.fillText(String(entry.played || 0), 800, statY);
    ctx.fillText(String(entry.won || 0), 850, statY);
    ctx.fillText(String(entry.drawn || 0), 900, statY);
    ctx.fillText(String(entry.lost || 0), 950, statY);
    ctx.fillStyle = idx < 3 ? gr : gd;
    ctx.font = "700 16px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(String(entry.points || 0), 1000, statY);
  });

  // Bottom footer
  const bY = H - 50;
  const bg2 = ctx.createLinearGradient(0, bY - 40, 0, H);
  bg2.addColorStop(0, "transparent");
  bg2.addColorStop(1, dk + "DD");
  ctx.fillStyle = bg2;
  ctx.fillRect(0, bY - 40, W, 100);

  const bl = ctx.createLinearGradient(0, bY - 30, W, bY - 30);
  bl.addColorStop(0, "transparent");
  bl.addColorStop(0.15, gd + "60");
  bl.addColorStop(0.85, gd + "60");
  bl.addColorStop(1, "transparent");
  ctx.strokeStyle = bl;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, bY - 30);
  ctx.lineTo(W, bY - 30);
  ctx.stroke();

  ctx.fillStyle = gd + "BB";
  ctx.font = "600 18px 'Segoe UI', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("www.laligadecampeones.es", W / 2, bY + 15);
}

interface StandingsSocialGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournaments: Tournament[];
}

export function StandingsSocialGenerator({ open, onOpenChange, tournaments }: StandingsSocialGeneratorProps) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");
  const [isRendering, setIsRendering] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const selectedTournament = tournaments.find(t => t.id === selectedTournamentId);

  const { data: standings = [], isLoading } = useQuery<StandingsEntry[]>({
    queryKey: ["/api/home/standings", selectedTournamentId],
    queryFn: async () => {
      if (!selectedTournamentId) return [];
      const response = await fetch(`/api/home/standings?tournamentId=${selectedTournamentId}`);
      if (!response.ok) throw new Error("Error al cargar tabla de posiciones");
      return response.json();
    },
    enabled: !!selectedTournamentId,
  });

  const handleRender = async () => {
    if (!canvasRef.current || !selectedTournament || standings.length === 0) return;

    setIsRendering(true);
    try {
      await renderStandingsCanvas(canvasRef.current, standings, selectedTournament.name);
      toast({ title: "Tabla renderizada correctamente" });
    } catch (error) {
      console.error("Error rendering standings:", error);
      toast({ title: "Error al renderizar tabla", variant: "destructive" });
    } finally {
      setIsRendering(false);
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;

    setIsDownloading(true);
    try {
      const blob = new Promise<Blob>((res, rej) => {
        canvasRef.current!.toBlob((b) => (b ? res(b) : rej()), "image/png", 1);
      }).then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `tabla-posiciones-${selectedTournament?.name?.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast({ title: "Imagen descargada correctamente" });
      });
    } catch (error) {
      console.error("Error downloading image:", error);
      toast({ title: "Error al descargar imagen", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tabla de Posiciones para Redes Sociales</DialogTitle>
          <DialogDescription>Genera una imagen de la tabla de posiciones con el logo de fondo</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Seleccionar Torneo</label>
            <Select value={selectedTournamentId} onValueChange={setSelectedTournamentId}>
              <SelectTrigger data-testid="select-tournament-standings">
                <SelectValue placeholder="Elige un torneo" />
              </SelectTrigger>
              <SelectContent>
                {tournaments.filter(t => t.status === "ACTIVO").map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTournamentId && (
            <>
              {isLoading ? (
                <Card>
                  <CardContent className="pt-6 space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}
                  </CardContent>
                </Card>
              ) : standings.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8 text-muted-foreground">
                    No hay datos de posiciones para este torneo
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleRender}
                      disabled={isRendering}
                      className="flex-1"
                      data-testid="button-render-standings"
                    >
                      {isRendering ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        "Generar Imagen"
                      )}
                    </Button>
                    <Button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      variant="outline"
                      className="gap-2"
                      data-testid="button-download-standings"
                    >
                      <Download className="h-4 w-4" />
                      {isDownloading ? "Descargando..." : "Descargar"}
                    </Button>
                  </div>

                  <Card className="bg-muted/30">
                    <CardContent className="pt-6 flex justify-center">
                      <canvas
                        ref={canvasRef}
                        style={{ width: "300px", height: "375px", border: "1px solid #ccc" }}
                        data-testid="canvas-standings-preview"
                      />
                    </CardContent>
                  </Card>

                  <div className="text-sm text-muted-foreground">
                    <p>📊 Se mostrará la tabla de posiciones de {selectedTournament?.name}</p>
                    <p>✨ Incluye logo de fondo para mejor presentación</p>
                    <p>🎨 Dimensiones: 1080x1350px (optimizado para redes sociales)</p>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
