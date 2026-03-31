import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Users, Trophy, TrendingUp, AlertCircle, Lock } from "lucide-react";
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

interface PlayerWithCards {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  yellowCards: number;
  redCards: number;
  photoUrl?: string;
}

interface SuspendedPlayer {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  reason: string;
  matchesRemaining: number;
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

  const { data: playerCardsData, isLoading: loadingCards } = useQuery<{ withCards: PlayerWithCards[]; suspended: SuspendedPlayer[] }>({
    queryKey: ["/api/home/player-cards", selectedTournamentId],
    queryFn: async () => {
      const response = await fetch(`/api/home/player-cards${tournamentQueryParam}`);
      if (!response.ok) throw new Error("Error al cargar tarjetas");
      return response.json();
    },
  });

  const activeTournaments = tournaments.filter(t => t.status === "ACTIVO");
  const totalGoals = topScorers.reduce((sum, s) => sum + s.goals, 0);
  const withCards = playerCardsData?.withCards || [];
  const suspended = playerCardsData?.suspended || [];

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
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
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
                            idx === 0 ? "bg-primary text-primary-foreground" :
                            idx === 1 ? "bg-muted text-foreground" :
                            "bg-secondary text-secondary-foreground"
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card data-testid="card-player-cards">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Jugadores Sancionados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingCards ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : withCards.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <AlertCircle className="mx-auto h-10 w-10 opacity-50" />
                <p className="mt-2">No hay jugadores con tarjetas</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="pb-3 text-left font-medium">Jugador</th>
                      <th className="pb-3 text-left font-medium">Equipo</th>
                      <th className="pb-3 text-center font-medium w-16">
                        <span className="inline-block w-6 h-6 bg-yellow-400 rounded-sm" title="Tarjetas Amarillas" />
                      </th>
                      <th className="pb-3 text-center font-medium w-16">
                        <span className="inline-block w-6 h-6 bg-red-600 rounded-sm" title="Tarjetas Rojas" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {withCards.slice(0, 15).map((player) => (
                      <tr key={player.playerId} className="border-b last:border-0">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            {player.photoUrl ? (
                              <img 
                                src={player.photoUrl} 
                                alt={player.playerName}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
                                {player.playerName.charAt(0)}
                              </div>
                            )}
                            <span className="font-medium text-sm">{player.playerName}</span>
                          </div>
                        </td>
                        <td className="py-3 text-muted-foreground text-sm">{player.teamName}</td>
                        <td className="py-3 text-center">
                          {player.yellowCards > 0 && (
                            <Badge className="bg-yellow-400 text-yellow-900 font-bold">
                              {player.yellowCards}
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          {player.redCards > 0 && (
                            <Badge className="bg-red-600 text-white font-bold">
                              {player.redCards}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-suspended-players">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-600" />
              Jugadores Suspendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingCards ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : suspended.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Lock className="mx-auto h-10 w-10 opacity-50" />
                <p className="mt-2">No hay jugadores suspendidos</p>
              </div>
            ) : (
              <div className="space-y-3">
                {suspended.map((player) => (
                  <div key={player.playerId} className="flex items-center gap-3 rounded-lg border p-3">
                    {player.photoUrl ? (
                      <img 
                        src={player.photoUrl} 
                        alt={player.playerName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white font-bold text-sm">
                        {player.playerName.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{player.playerName}</p>
                      <p className="text-xs text-muted-foreground truncate">{player.teamName}</p>
                      <p className="text-xs text-red-600 font-medium">{player.reason}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-red-600">{player.matchesRemaining}</p>
                      <p className="text-xs text-muted-foreground">partidos</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
