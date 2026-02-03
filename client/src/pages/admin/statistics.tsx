import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Users, Trophy, TrendingUp } from "lucide-react";
import { getAuthHeader } from "@/lib/auth";
import type { Tournament, Player, Team } from "@shared/schema";
import { useState } from "react";

interface TopScorer {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  goals: number;
  photoUrl?: string;
}

export default function StatisticsManagement() {
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("all");

  const { data: tournaments = [] } = useQuery<Tournament[]>({
    queryKey: ["/api/admin/tournaments"],
    queryFn: async () => {
      const response = await fetch("/api/admin/tournaments", { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar torneos");
      return response.json();
    },
  });

  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ["/api/admin/players"],
    queryFn: async () => {
      const response = await fetch("/api/admin/players", { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar jugadores");
      return response.json();
    },
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/admin/teams"],
    queryFn: async () => {
      const response = await fetch("/api/admin/teams", { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar equipos");
      return response.json();
    },
  });

  // Fetch real scorer data from API
  const tournamentQueryParam = selectedTournamentId !== "all" ? `?tournamentId=${selectedTournamentId}` : "";
  
  const { data: topScorers = [], isLoading: loadingScorers } = useQuery<TopScorer[]>({
    queryKey: ["/api/home/scorers", selectedTournamentId],
    queryFn: async () => {
      const response = await fetch(`/api/home/scorers${tournamentQueryParam}`);
      if (!response.ok) throw new Error("Error al cargar goleadores");
      return response.json();
    },
  });

  const activeTournaments = tournaments.filter(t => t.status === "ACTIVO");
  const totalGoals = topScorers.reduce((sum, s) => sum + s.goals, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Estadísticas Generales</h2>
          <p className="text-sm text-muted-foreground">
            Tabla de goleadores y estadísticas del torneo
          </p>
        </div>
        <Select value={selectedTournamentId} onValueChange={setSelectedTournamentId}>
          <SelectTrigger className="w-[200px]" data-testid="select-tournament-filter">
            <SelectValue placeholder="Filtrar por torneo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los torneos</SelectItem>
            {activeTournaments.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="stat-total-players">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{players.length}</p>
                <p className="text-sm text-muted-foreground">Jugadores Totales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stat-total-teams">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teams.length}</p>
                <p className="text-sm text-muted-foreground">Equipos Totales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stat-total-goals">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {totalGoals}
                </p>
                <p className="text-sm text-muted-foreground">Goles Totales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stat-top-scorer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-lg font-bold truncate">
                  {topScorers[0]?.playerName || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Máximo Goleador ({topScorers[0]?.goals || 0} goles)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Tabla de Goleadores
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingScorers ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : topScorers.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Target className="mx-auto h-12 w-12 opacity-50" />
              <p className="mt-4">No hay goleadores registrados</p>
              <p className="text-sm">Los goles se registran cuando el árbitro finaliza un partido</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="pb-3 text-left font-medium w-12">#</th>
                    <th className="pb-3 text-left font-medium">Jugador</th>
                    <th className="pb-3 text-left font-medium">Equipo</th>
                    <th className="pb-3 text-center font-medium w-20">Goles</th>
                  </tr>
                </thead>
                <tbody>
                  {topScorers.map((scorer, idx) => (
                    <tr
                      key={scorer.playerId}
                      className={`border-b last:border-0 ${idx < 3 ? "bg-primary/5" : ""}`}
                      data-testid={`row-scorer-${idx + 1}`}
                    >
                      <td className="py-3 font-bold">
                        {idx < 3 ? (
                          <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                            idx === 0 ? "bg-yellow-500 text-yellow-950" :
                            idx === 1 ? "bg-slate-400 text-slate-950" :
                            "bg-orange-400 text-orange-950"
                          }`}>
                            {idx + 1}
                          </div>
                        ) : (
                          <span className="text-muted-foreground pl-2">{idx + 1}</span>
                        )}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          {scorer.photoUrl ? (
                            <img 
                              src={scorer.photoUrl} 
                              alt={scorer.playerName}
                              className="h-9 w-9 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                              {scorer.playerName.charAt(0)}
                            </div>
                          )}
                          <span className="font-medium">{scorer.playerName}</span>
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground">{scorer.teamName}</td>
                      <td className="py-3 text-center">
                        <Badge variant="default" className="text-sm font-bold px-3">
                          {scorer.goals}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
