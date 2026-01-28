import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Trophy, Users, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { MatchWithTeams, Standing, Team, Tournament } from "@shared/schema";
import { MatchDetailDialog } from "@/components/match-detail-dialog";

export default function Home() {
  const [selectedRound, setSelectedRound] = useState<string>("all");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  const { data: tournament, isLoading: loadingTournament } = useQuery<Tournament>({
    queryKey: ["/api/tournaments/active"],
  });

  const { data: schedule = [], isLoading: loadingSchedule } = useQuery<MatchWithTeams[]>({
    queryKey: ["/api/home/schedule", selectedRound, selectedTeam],
    enabled: !!tournament,
  });

  const { data: standings = [], isLoading: loadingStandings } = useQuery<Standing[]>({
    queryKey: ["/api/home/standings"],
    enabled: !!tournament,
  });

  const { data: results = [], isLoading: loadingResults } = useQuery<MatchWithTeams[]>({
    queryKey: ["/api/home/results"],
    enabled: !!tournament,
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/home/teams"],
    enabled: !!tournament,
  });

  const rounds = [...new Set(schedule.map(m => m.roundNumber))].sort((a, b) => a - b);
  const filteredSchedule = schedule.filter(m => {
    const matchRound = selectedRound === "all" || m.roundNumber === parseInt(selectedRound);
    const matchTeam = selectedTeam === "all" || m.homeTeamId === selectedTeam || m.awayTeamId === selectedTeam;
    return matchRound && matchTeam;
  });

  if (loadingTournament) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold" data-testid="text-tournament-name">
                  {tournament?.name || "Liga de Fútbol"}
                </h1>
                <p className="text-sm text-muted-foreground" data-testid="text-season-name">
                  {tournament?.seasonName || "Temporada 2026"}
                </p>
              </div>
            </div>
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover-elevate active-elevate-2"
              data-testid="link-login"
            >
              Iniciar Sesión
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="calendario" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
            <TabsTrigger value="calendario" data-testid="tab-calendario" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendario</span>
            </TabsTrigger>
            <TabsTrigger value="posiciones" data-testid="tab-posiciones" className="gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Posiciones</span>
            </TabsTrigger>
            <TabsTrigger value="resultados" data-testid="tab-resultados" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Resultados</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendario" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Calendario de Partidos
                  </CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Select value={selectedRound} onValueChange={setSelectedRound}>
                      <SelectTrigger className="w-[140px]" data-testid="select-round">
                        <SelectValue placeholder="Jornada" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {rounds.map(r => (
                          <SelectItem key={r} value={r.toString()}>Jornada {r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                      <SelectTrigger className="w-[160px]" data-testid="select-team">
                        <SelectValue placeholder="Equipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {teams.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingSchedule ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
                  </div>
                ) : filteredSchedule.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <Calendar className="mx-auto h-12 w-12 opacity-50" />
                    <p className="mt-4">No hay partidos programados</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredSchedule.map(match => (
                      <div
                        key={match.id}
                        className="flex flex-col gap-3 rounded-md border p-4 hover-elevate cursor-pointer sm:flex-row sm:items-center sm:justify-between"
                        onClick={() => setSelectedMatch(match.id)}
                        data-testid={`card-match-${match.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">J{match.roundNumber}</Badge>
                          <div className="flex flex-1 items-center gap-2 text-sm">
                            <span className="font-medium" data-testid={`text-home-team-${match.id}`}>
                              {match.homeTeam?.name || "Equipo Local"}
                            </span>
                            <span className="text-muted-foreground">vs</span>
                            <span className="font-medium" data-testid={`text-away-team-${match.id}`}>
                              {match.awayTeam?.name || "Equipo Visitante"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {format(new Date(match.dateTime), "d MMM, HH:mm", { locale: es })}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {match.field}
                          </span>
                          <Badge variant={match.status === "JUGADO" ? "default" : "secondary"}>
                            {match.status === "JUGADO" ? "Jugado" : "Programado"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posiciones">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Tabla de Posiciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStandings ? (
                  <Skeleton className="h-64" />
                ) : standings.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <Trophy className="mx-auto h-12 w-12 opacity-50" />
                    <p className="mt-4">No hay datos de posiciones disponibles</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="pb-3 pr-4">#</th>
                          <th className="pb-3 pr-4">Equipo</th>
                          <th className="pb-3 pr-2 text-center">PJ</th>
                          <th className="pb-3 pr-2 text-center">PG</th>
                          <th className="pb-3 pr-2 text-center">PE</th>
                          <th className="pb-3 pr-2 text-center">PP</th>
                          <th className="pb-3 pr-2 text-center">GF</th>
                          <th className="pb-3 pr-2 text-center">GC</th>
                          <th className="pb-3 pr-2 text-center">DG</th>
                          <th className="pb-3 text-center font-bold">PTS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings.map((team, index) => (
                          <tr
                            key={team.teamId}
                            className={`border-b ${index < 3 ? "bg-accent/30" : ""}`}
                            data-testid={`row-standing-${team.teamId}`}
                          >
                            <td className="py-3 pr-4 font-medium">
                              {index + 1}
                              {index === 0 && <span className="ml-1 text-yellow-500">🏆</span>}
                            </td>
                            <td className="py-3 pr-4 font-medium">{team.teamName}</td>
                            <td className="py-3 pr-2 text-center">{team.played}</td>
                            <td className="py-3 pr-2 text-center text-green-600">{team.won}</td>
                            <td className="py-3 pr-2 text-center text-yellow-600">{team.drawn}</td>
                            <td className="py-3 pr-2 text-center text-red-600">{team.lost}</td>
                            <td className="py-3 pr-2 text-center">{team.goalsFor}</td>
                            <td className="py-3 pr-2 text-center">{team.goalsAgainst}</td>
                            <td className="py-3 pr-2 text-center font-medium">{team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}</td>
                            <td className="py-3 text-center font-bold text-primary">{team.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resultados" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Resultados Recientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingResults ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
                  </div>
                ) : results.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <Users className="mx-auto h-12 w-12 opacity-50" />
                    <p className="mt-4">No hay resultados disponibles</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {results.map(match => (
                      <div
                        key={match.id}
                        className="rounded-md border p-4 hover-elevate cursor-pointer"
                        onClick={() => setSelectedMatch(match.id)}
                        data-testid={`card-result-${match.id}`}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">J{match.roundNumber}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(match.dateTime), "d MMM yyyy", { locale: es })}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-center gap-4">
                          <div className="flex-1 text-right">
                            <span className="font-medium">{match.homeTeam?.name}</span>
                          </div>
                          <div className="flex items-center gap-2 rounded-md bg-primary/10 px-4 py-2">
                            <span className="text-2xl font-bold" data-testid={`text-score-home-${match.id}`}>
                              {match.homeScore ?? 0}
                            </span>
                            <span className="text-muted-foreground">-</span>
                            <span className="text-2xl font-bold" data-testid={`text-score-away-${match.id}`}>
                              {match.awayScore ?? 0}
                            </span>
                          </div>
                          <div className="flex-1">
                            <span className="font-medium">{match.awayTeam?.name}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {selectedMatch && (
        <MatchDetailDialog
          matchId={selectedMatch}
          open={!!selectedMatch}
          onOpenChange={(open) => !open && setSelectedMatch(null)}
        />
      )}
    </div>
  );
}
