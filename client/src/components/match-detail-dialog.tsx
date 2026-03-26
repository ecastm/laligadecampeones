import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, MapPin, User, CircleDot } from "lucide-react";
import type { MatchWithTeams, MatchStage } from "@shared/schema";
import { MatchStageLabels } from "@shared/schema";

interface MatchDetailDialogProps {
  matchId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showReferee?: boolean;
}

export function MatchDetailDialog({ matchId, open, onOpenChange, showReferee = false }: MatchDetailDialogProps) {
  const { data: match, isLoading } = useQuery<MatchWithTeams>({
    queryKey: ["/api/matches", matchId],
    queryFn: async () => {
      const res = await fetch(`/api/matches/${matchId}`);
      if (!res.ok) throw new Error("Failed to fetch match");
      return res.json();
    },
    enabled: open && !!matchId,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CircleDot className="h-5 w-5 text-primary" />
            Detalle del Partido
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-32" />
          </div>
        ) : !match ? (
          <p className="text-center text-muted-foreground">Partido no encontrado</p>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <Badge variant="outline" className="mb-3">
                {match.stage && match.stage !== "JORNADA"
                  ? MatchStageLabels[match.stage as MatchStage]
                  : `Jornada ${match.roundNumber}`}
              </Badge>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {match.dateTime && !isNaN(new Date(match.dateTime).getTime()) ? format(new Date(match.dateTime), "d MMMM yyyy, HH:mm", { locale: es }) : "Fecha por definir"}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {match.field}
                </span>
              </div>
              {showReferee && (match.refereeProfile || match.referee) && (
                <div className="mt-2 flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  Árbitro: {match.refereeProfile?.fullName || match.referee?.name}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 sm:gap-6 rounded-lg bg-card p-3 sm:p-6 border">
              <div className="flex-1 text-center min-w-0">
                {match.homeTeam?.logoUrl ? (
                  <img src={match.homeTeam.logoUrl} alt={match.homeTeam.name} className="h-10 w-10 sm:h-14 sm:w-14 mx-auto rounded-full object-cover border-2 border-primary/50 mb-2" />
                ) : (
                  <div className="h-10 w-10 sm:h-14 sm:w-14 mx-auto rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary font-bold text-sm sm:text-lg mb-2">
                    {match.homeTeam ? match.homeTeam.name.charAt(0) : "?"}
                  </div>
                )}
                <p className="text-sm sm:text-lg font-semibold truncate" data-testid="text-detail-home-team">
                  {match.homeTeam?.name || "Por definir"}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Local</p>
              </div>
              {match.status === "JUGADO" ? (
                <div className="flex items-center gap-2 sm:gap-3 rounded-md bg-primary/10 px-3 py-2 sm:px-6 sm:py-4 shrink-0">
                  <span className="text-2xl sm:text-4xl font-bold" data-testid="text-detail-home-score">
                    {match.homeScore ?? 0}
                  </span>
                  <span className="text-lg sm:text-2xl text-muted-foreground">-</span>
                  <span className="text-2xl sm:text-4xl font-bold" data-testid="text-detail-away-score">
                    {match.awayScore ?? 0}
                  </span>
                </div>
              ) : (
                <div className="px-2 sm:px-4 shrink-0">
                  <Badge variant="secondary">Programado</Badge>
                </div>
              )}
              <div className="flex-1 text-center min-w-0">
                {match.awayTeam?.logoUrl ? (
                  <img src={match.awayTeam.logoUrl} alt={match.awayTeam.name} className="h-10 w-10 sm:h-14 sm:w-14 mx-auto rounded-full object-cover border-2 border-primary/50 mb-2" />
                ) : (
                  <div className="h-10 w-10 sm:h-14 sm:w-14 mx-auto rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary font-bold text-sm sm:text-lg mb-2">
                    {match.awayTeam ? match.awayTeam.name.charAt(0) : "?"}
                  </div>
                )}
                <p className="text-sm sm:text-lg font-semibold truncate" data-testid="text-detail-away-team">
                  {match.awayTeam?.name || "Por definir"}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Visitante</p>
              </div>
            </div>

            {match.status === "JUGADO" && match.events && match.events.length > 0 && (
              <div>
                <h4 className="mb-3 font-medium">Eventos del Partido</h4>
                <div className="space-y-2">
                  {match.events.map((event, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 rounded-md border p-3"
                      data-testid={`event-${event.id}`}
                    >
                      <Badge
                        variant={
                          event.type === "GOAL"
                            ? "default"
                            : event.type === "YELLOW"
                            ? "outline"
                            : "destructive"
                        }
                        className={event.type === "YELLOW" ? "bg-primary text-primary-foreground border-primary" : ""}
                      >
                        {event.type === "GOAL" ? "Gol" : event.type === "YELLOW" ? "Amarilla" : "Roja"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{event.minute}'</span>
                      <span className="flex-1 text-sm">
                        {event.player?.firstName} {event.player?.lastName}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {event.team?.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
