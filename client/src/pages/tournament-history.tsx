import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, MapPin, Calendar, ArrowLeft, Users } from "lucide-react";
import type { Tournament, Standing } from "@shared/schema";

export default function TournamentHistory() {
  const [viewingTournament, setViewingTournament] = useState<Tournament | null>(null);

  const { data: tournaments = [], isLoading } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments/completed"],
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
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
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-amber-700 text-white">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold" data-testid="text-page-title">
                  Historial de Torneos
                </h1>
                <p className="text-sm text-muted-foreground">
                  Torneos finalizados y sus campeones
                </p>
              </div>
            </div>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover-elevate active-elevate-2"
              data-testid="link-back-home"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Inicio
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {tournaments.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((tournament) => (
              <Card key={tournament.id} className="hover-elevate">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base truncate">{tournament.name}</CardTitle>
                      <CardDescription className="truncate">{tournament.seasonName}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="shrink-0">Finalizado</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">{tournament.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>Inicio: {formatDate(tournament.startDate)}</span>
                  </div>
                  {tournament.endDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>Fin: {formatDate(tournament.endDate)}</span>
                    </div>
                  )}
                  {tournament.championTeamName && (
                    <div className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md">
                      <Trophy className="h-4 w-4 shrink-0" />
                      <span className="truncate">Campeón: {tournament.championTeamName}</span>
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => setViewingTournament(tournament)}
                    data-testid={`button-view-tournament-${tournament.id}`}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Ver Tabla de Posiciones Final
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay torneos finalizados aún.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Cuando un torneo termine, aparecerá aquí con su historial.
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog open={!!viewingTournament} onOpenChange={() => setViewingTournament(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-700 dark:text-amber-500" />
              {viewingTournament?.name}
            </DialogTitle>
            <DialogDescription>
              {viewingTournament?.seasonName} - {viewingTournament?.location}
              {viewingTournament?.championTeamName && (
                <span className="block mt-1 font-medium text-amber-800 dark:text-amber-400">
                  Campeón: {viewingTournament.championTeamName}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          {viewingTournament?.finalStandings && viewingTournament.finalStandings.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Equipo</TableHead>
                    <TableHead className="text-center">PJ</TableHead>
                    <TableHead className="text-center">PG</TableHead>
                    <TableHead className="text-center">PE</TableHead>
                    <TableHead className="text-center">PP</TableHead>
                    <TableHead className="text-center">GF</TableHead>
                    <TableHead className="text-center">GC</TableHead>
                    <TableHead className="text-center">DG</TableHead>
                    <TableHead className="text-center font-bold">PTS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewingTournament.finalStandings.map((standing: Standing, index: number) => (
                    <TableRow key={standing.teamId} className={index === 0 ? "bg-amber-50 dark:bg-amber-900/20" : ""}>
                      <TableCell className="font-medium">
                        {index === 0 ? <Trophy className="h-4 w-4 text-amber-700 dark:text-amber-500" /> : index + 1}
                      </TableCell>
                      <TableCell className="font-medium">{standing.teamName}</TableCell>
                      <TableCell className="text-center">{standing.played}</TableCell>
                      <TableCell className="text-center">{standing.won}</TableCell>
                      <TableCell className="text-center">{standing.drawn}</TableCell>
                      <TableCell className="text-center">{standing.lost}</TableCell>
                      <TableCell className="text-center">{standing.goalsFor}</TableCell>
                      <TableCell className="text-center">{standing.goalsAgainst}</TableCell>
                      <TableCell className="text-center">{standing.goalDifference > 0 ? `+${standing.goalDifference}` : standing.goalDifference}</TableCell>
                      <TableCell className="text-center font-bold">{standing.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No hay datos de tabla de posiciones.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
