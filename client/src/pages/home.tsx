import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  Trophy, 
  Users, 
  MapPin, 
  Newspaper, 
  Shield, 
  ChevronRight,
  Phone,
  Mail,
  UserPlus,
  Info,
  Award,
  Target,
  CheckCircle,
  Star,
  Clock,
  Zap
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { MatchWithTeams, Standing, Team, Tournament, NewsWithAuthor, Division } from "@shared/schema";
import { MatchDetailDialog } from "@/components/match-detail-dialog";
import heroFootball from "@/assets/images/football-field.jpg";
import teamHuddle from "@/assets/images/team-huddle.jpg";
import trophyImage from "@/assets/images/trophy.jpg";
import stadiumImage from "@/assets/images/stadium.jpg";

export default function Home() {
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
  const [selectedRound, setSelectedRound] = useState<string>("all");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("calendario");

  const { data: divisions = [], isLoading: loadingDivisions } = useQuery<Division[]>({
    queryKey: ["/api/divisions"],
  });

  const { data: allTournaments = [] } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments/active/all"],
  });

  const { data: activeTournament } = useQuery<Tournament>({
    queryKey: ["/api/tournaments/active"],
  });

  const currentTournament = selectedDivision 
    ? allTournaments.find(t => t.divisionId === selectedDivision) || activeTournament
    : activeTournament;

  const currentDivision = selectedDivision
    ? divisions.find(d => d.id === selectedDivision)
    : currentTournament?.divisionId 
      ? divisions.find(d => d.id === currentTournament.divisionId)
      : null;

  const tournamentId = currentTournament?.id;

  const { data: schedule = [], isLoading: loadingSchedule } = useQuery<MatchWithTeams[]>({
    queryKey: ["/api/home/schedule", tournamentId],
    queryFn: async () => {
      const res = await fetch(`/api/home/schedule${tournamentId ? `?tournamentId=${tournamentId}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch schedule");
      return res.json();
    },
    enabled: !!tournamentId && !!selectedDivision,
  });

  const { data: standings = [], isLoading: loadingStandings } = useQuery<Standing[]>({
    queryKey: ["/api/home/standings", tournamentId],
    queryFn: async () => {
      const res = await fetch(`/api/home/standings${tournamentId ? `?tournamentId=${tournamentId}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch standings");
      return res.json();
    },
    enabled: !!tournamentId && !!selectedDivision,
  });

  const { data: results = [], isLoading: loadingResults } = useQuery<MatchWithTeams[]>({
    queryKey: ["/api/home/results", tournamentId],
    queryFn: async () => {
      const res = await fetch(`/api/home/results${tournamentId ? `?tournamentId=${tournamentId}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch results");
      return res.json();
    },
    enabled: !!tournamentId && !!selectedDivision,
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/home/teams", tournamentId],
    queryFn: async () => {
      const res = await fetch(`/api/home/teams${tournamentId ? `?tournamentId=${tournamentId}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch teams");
      return res.json();
    },
    enabled: !!tournamentId && !!selectedDivision,
  });

  const { data: news = [], isLoading: loadingNews } = useQuery<NewsWithAuthor[]>({
    queryKey: ["/api/home/news", tournamentId],
    queryFn: async () => {
      const res = await fetch(`/api/home/news${tournamentId ? `?tournamentId=${tournamentId}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch news");
      return res.json();
    },
    enabled: !!tournamentId && !!selectedDivision,
  });

  interface TopScorer {
    playerId: string;
    playerName: string;
    teamId: string;
    teamName: string;
    goals: number;
    photoUrl: string | null;
  }

  const { data: scorers = [], isLoading: loadingScorers } = useQuery<TopScorer[]>({
    queryKey: ["/api/home/scorers", tournamentId],
    queryFn: async () => {
      const res = await fetch(`/api/home/scorers${tournamentId ? `?tournamentId=${tournamentId}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch scorers");
      return res.json();
    },
    enabled: !!tournamentId && !!selectedDivision,
  });

  const rounds = Array.from(new Set(schedule.map(m => m.roundNumber))).sort((a, b) => a - b);
  const filteredSchedule = schedule.filter(m => {
    const matchRound = selectedRound === "all" || m.roundNumber === parseInt(selectedRound);
    const matchTeam = selectedTeam === "all" || m.homeTeamId === selectedTeam || m.awayTeamId === selectedTeam;
    return matchRound && matchTeam;
  });

  const handleDivisionSelect = (divisionId: string) => {
    setSelectedDivision(divisionId);
    setSelectedRound("all");
    setSelectedTeam("all");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">La Liga de Campeones</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/historial"
                className="hidden sm:inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium hover-elevate"
                data-testid="link-history"
              >
                Historial
              </a>
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover-elevate active-elevate-2"
                data-testid="link-login"
              >
                Iniciar Sesión
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Football Image */}
      <section className="relative min-h-[600px] overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroFootball})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        
        <div className="container relative mx-auto px-4 py-20 sm:py-28">
          <div className="max-w-2xl">
            <Badge className="mb-6 bg-primary/90 text-primary-foreground" data-testid="badge-hero">
              <Zap className="mr-1 h-3 w-3" />
              Inscripciones Abiertas - Temporada 2026
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl" data-testid="text-hero-title">
              Bienvenidos a
              <span className="block text-primary">LA LIGA DE CAMPEONES</span>
            </h1>
            <p className="mb-8 text-lg text-gray-200 sm:text-xl">
              Inscribe a tu equipo y demuestra de qué están hechos. Competencia real, 
              organización profesional, y la oportunidad de consagrarse campeones.
            </p>
            
            {/* Key Benefits */}
            <div className="mb-8 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-gray-200">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Canchas de primera calidad</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Árbitros certificados</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Premios para los mejores</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Estadísticas en tiempo real</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" className="gap-2 text-base" data-testid="button-register-team">
                <UserPlus className="h-5 w-5" />
                Inscribir Mi Equipo
              </Button>
              <Button size="lg" variant="outline" className="gap-2 border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20" data-testid="button-request-info">
                <Info className="h-5 w-5" />
                Más Información
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-why-join-title">¿Por Qué Inscribir a Tu Equipo?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              No es solo un torneo, es una experiencia competitiva de primer nivel para equipos que buscan superarse
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Benefit 1 */}
            <a
              href="https://maps.google.com/?q=Portada+Alta+C.F.,+C.+James+Joyce,+47,+Teatinos-Universidad,+29010+Málaga"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-md cursor-pointer"
              data-testid="link-instalaciones"
            >
              <img src={stadiumImage} alt="Instalaciones" className="h-48 w-full object-cover transition-transform group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 p-6 text-white">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">Instalaciones de Primera</h3>
                <p className="text-sm text-gray-300">Canchas en óptimas condiciones, iluminación profesional y vestuarios equipados</p>
              </div>
            </a>
            
            {/* Benefit 2 */}
            <div className="group relative overflow-hidden rounded-md">
              <img src={trophyImage} alt="Premios" className="h-48 w-full object-cover transition-transform group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 p-6 text-white">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                  <Trophy className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">Premios y Reconocimientos</h3>
                <p className="text-sm text-gray-300">Trofeos, medallas, premios en efectivo y reconocimiento a los mejores jugadores</p>
              </div>
            </div>
            
            {/* Benefit 3 */}
            <div className="group relative overflow-hidden rounded-md">
              <img src={teamHuddle} alt="Competencia" className="h-48 w-full object-cover transition-transform group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 p-6 text-white">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">Competencia Real</h3>
                <p className="text-sm text-gray-300">Enfrenta a los mejores equipos de la zona en partidos emocionantes cada semana</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div className="text-center" data-testid="stat-teams">
              <p className="text-4xl font-bold text-primary">50+</p>
              <p className="text-sm text-muted-foreground">Equipos Compitiendo</p>
            </div>
            <div className="text-center" data-testid="stat-players">
              <p className="text-4xl font-bold text-primary">800+</p>
              <p className="text-sm text-muted-foreground">Jugadores Activos</p>
            </div>
            <div className="text-center" data-testid="stat-matches">
              <p className="text-4xl font-bold text-primary">200+</p>
              <p className="text-sm text-muted-foreground">Partidos por Temporada</p>
            </div>
            <div className="text-center" data-testid="stat-seasons">
              <p className="text-4xl font-bold text-primary">10</p>
              <p className="text-sm text-muted-foreground">Años de Experiencia</p>
            </div>
          </div>
        </div>
      </section>

      {/* Divisions Section - Tournament Viewer */}
      <section className="py-12 sm:py-16" id="torneos">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold" data-testid="text-divisions-title">Ver Torneos en Curso</h2>
            <p className="text-muted-foreground">Selecciona una división para ver la información del torneo activo</p>
          </div>

          {/* Division Selector */}
          <div className="mb-8 flex flex-wrap justify-center gap-4">
            {loadingDivisions ? (
              <div className="flex gap-4">
                <Skeleton className="h-24 w-48" />
                <Skeleton className="h-24 w-48" />
              </div>
            ) : (
              divisions.map((division) => (
                <button
                  key={division.id}
                  onClick={() => handleDivisionSelect(division.id)}
                  className={`group relative overflow-hidden rounded-md border-2 p-6 text-left transition-all hover-elevate ${
                    selectedDivision === division.id
                      ? division.theme === "PRIMERA"
                        ? "border-yellow-500 bg-yellow-500/10"
                        : "border-slate-500 bg-slate-500/10"
                      : "border-border hover:border-primary/50"
                  }`}
                  data-testid={`button-division-${division.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${
                      division.theme === "PRIMERA" 
                        ? "bg-yellow-500/20" 
                        : "bg-slate-500/20"
                    }`}>
                      <Shield className={`h-6 w-6 ${
                        division.theme === "PRIMERA" 
                          ? "text-yellow-500" 
                          : "text-slate-500"
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{division.name}</h3>
                      <p className="text-sm text-muted-foreground">{division.description}</p>
                    </div>
                  </div>
                  {selectedDivision === division.id && (
                    <ChevronRight className="absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Tournament Content */}
          {selectedDivision && currentTournament ? (
            <div className="space-y-6">
              {/* Tournament Header */}
              <Card className="border-2">
                <CardHeader className="pb-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-md ${
                        currentDivision?.theme === "PRIMERA"
                          ? "bg-yellow-500/20"
                          : "bg-slate-500/20"
                      }`}>
                        <Trophy className={`h-6 w-6 ${
                          currentDivision?.theme === "PRIMERA"
                            ? "text-yellow-600"
                            : "text-slate-600"
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold" data-testid="text-tournament-name">
                            {currentTournament.name}
                          </h3>
                          {currentDivision && (
                            <Badge
                              variant="outline"
                              className={`shrink-0 ${
                                currentDivision.theme === "PRIMERA"
                                  ? "border-yellow-500 text-yellow-600 dark:text-yellow-400"
                                  : "border-slate-500 text-slate-600 dark:text-slate-400"
                              }`}
                              data-testid="badge-division"
                            >
                              <Shield className={`mr-1 h-3 w-3 ${currentDivision.theme === "PRIMERA" ? "text-yellow-500" : "text-slate-500"}`} />
                              {currentDivision.name}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground" data-testid="text-season-name">
                          {currentTournament.seasonName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{currentTournament.location}</span>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Tournament Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="calendario" data-testid="tab-calendario" className="flex flex-col gap-1 px-1 py-2 sm:flex-row sm:gap-2 sm:px-3">
                    <Calendar className="h-4 w-4" />
                    <span className="text-[10px] sm:text-sm">Calendario</span>
                  </TabsTrigger>
                  <TabsTrigger value="posiciones" data-testid="tab-posiciones" className="flex flex-col gap-1 px-1 py-2 sm:flex-row sm:gap-2 sm:px-3">
                    <Trophy className="h-4 w-4" />
                    <span className="text-[10px] sm:text-sm">Posiciones</span>
                  </TabsTrigger>
                  <TabsTrigger value="goleadores" data-testid="tab-goleadores" className="flex flex-col gap-1 px-1 py-2 sm:flex-row sm:gap-2 sm:px-3">
                    <Target className="h-4 w-4" />
                    <span className="text-[10px] sm:text-sm">Goleadores</span>
                  </TabsTrigger>
                  <TabsTrigger value="resultados" data-testid="tab-resultados" className="flex flex-col gap-1 px-1 py-2 sm:flex-row sm:gap-2 sm:px-3">
                    <Users className="h-4 w-4" />
                    <span className="text-[10px] sm:text-sm">Resultados</span>
                  </TabsTrigger>
                  <TabsTrigger value="equipos" data-testid="tab-equipos" className="flex flex-col gap-1 px-1 py-2 sm:flex-row sm:gap-2 sm:px-3">
                    <Shield className="h-4 w-4" />
                    <span className="text-[10px] sm:text-sm">Equipos</span>
                  </TabsTrigger>
                </TabsList>

                {/* Calendario Tab */}
                <TabsContent value="calendario" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-4">
                      <div className="flex flex-col gap-4">
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-primary" />
                          Calendario de Partidos
                        </CardTitle>
                        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                          <Select value={selectedRound} onValueChange={setSelectedRound}>
                            <SelectTrigger className="w-full sm:w-[140px]" data-testid="select-round">
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
                            <SelectTrigger className="w-full sm:w-[160px]" data-testid="select-team">
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
                        <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                          {filteredSchedule.map(match => (
                            <div
                              key={match.id}
                              className="rounded border p-1.5 hover-elevate cursor-pointer"
                              onClick={() => setSelectedMatch(match.id)}
                              data-testid={`card-match-${match.id}`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <div className="flex items-center gap-0.5">
                                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">J{match.roundNumber}</Badge>
                                  <Badge variant={match.status === "JUGADO" ? "default" : "secondary"} className="text-[9px] px-1 py-0 h-4">
                                    {match.status === "JUGADO" ? "Fin" : "Prog"}
                                  </Badge>
                                </div>
                                <span className="text-[9px] text-muted-foreground">
                                  {format(new Date(match.dateTime), "d/MM HH:mm", { locale: es })}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px]">
                                <span className="flex-1 text-right font-medium truncate" data-testid={`text-home-team-${match.id}`}>
                                  {match.homeTeam?.name || "Local"}
                                </span>
                                <span className="text-[9px] text-muted-foreground px-0.5">vs</span>
                                <span className="flex-1 text-left font-medium truncate" data-testid={`text-away-team-${match.id}`}>
                                  {match.awayTeam?.name || "Visitante"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Posiciones Tab */}
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
                        <div>
                          {/* Mobile view */}
                          <div className="space-y-2 sm:hidden">
                            {standings.map((team, index) => (
                              <div
                                key={team.teamId}
                                className={`flex items-center justify-between rounded-md border p-3 ${index < 3 ? "bg-accent/30" : ""}`}
                                data-testid={`row-standing-mobile-${team.teamId}`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
                                    {index + 1}
                                  </span>
                                  <span className="font-medium text-sm truncate max-w-[120px]">{team.teamName}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-center">
                                    <p className="text-xs text-muted-foreground">PJ</p>
                                    <p className="font-medium text-sm">{team.played}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-xs text-muted-foreground">DG</p>
                                    <p className="font-medium text-sm">{team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}</p>
                                  </div>
                                  <div className="text-center min-w-[32px]">
                                    <p className="text-xs text-muted-foreground">PTS</p>
                                    <p className="font-bold text-primary">{team.points}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          {/* Desktop view */}
                          <div className="hidden sm:block overflow-x-auto">
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
                                    <td className="py-3 pr-4 font-medium">{index + 1}</td>
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
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Goleadores Tab */}
                <TabsContent value="goleadores" className="space-y-4">
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
                      ) : scorers.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                          <Target className="mx-auto h-12 w-12 opacity-50" />
                          <p className="mt-4">No hay goleadores registrados aún</p>
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
                                <th className="pb-3 text-center font-medium w-16">Goles</th>
                              </tr>
                            </thead>
                            <tbody>
                              {scorers.map((scorer, idx) => (
                                <tr
                                  key={scorer.playerId}
                                  className={`border-b last:border-0 ${idx < 3 ? "bg-primary/5" : ""}`}
                                  data-testid={`row-scorer-${idx + 1}`}
                                >
                                  <td className="py-3 font-bold">
                                    {idx < 3 ? (
                                      <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                        idx === 0 ? "bg-yellow-500 text-yellow-950" :
                                        idx === 1 ? "bg-slate-400 text-slate-950" :
                                        "bg-orange-400 text-orange-950"
                                      }`}>
                                        {idx + 1}
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground">{idx + 1}</span>
                                    )}
                                  </td>
                                  <td className="py-3">
                                    <div className="flex items-center gap-2">
                                      {scorer.photoUrl ? (
                                        <img 
                                          src={scorer.photoUrl} 
                                          alt={scorer.playerName}
                                          className="h-8 w-8 rounded-full object-cover"
                                        />
                                      ) : (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                          <Users className="h-4 w-4 text-primary" />
                                        </div>
                                      )}
                                      <span className="font-medium">{scorer.playerName}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 text-muted-foreground">{scorer.teamName}</td>
                                  <td className="py-3 text-center">
                                    <Badge variant="default" className="text-sm font-bold">
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
                </TabsContent>

                {/* Resultados Tab */}
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
                              className="rounded-md border p-3 sm:p-4 hover-elevate cursor-pointer"
                              onClick={() => setSelectedMatch(match.id)}
                              data-testid={`card-result-${match.id}`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">J{match.roundNumber}</Badge>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(match.dateTime), "d MMM yyyy", { locale: es })}
                                </span>
                              </div>
                              <div className="flex items-center justify-center gap-2 sm:gap-4">
                                <div className="flex-1 text-right">
                                  <span className="text-sm sm:text-base font-medium truncate block">{match.homeTeam?.name}</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2 rounded-md bg-primary/10 px-2 sm:px-4 py-1 sm:py-2">
                                  <span className="text-lg sm:text-2xl font-bold" data-testid={`text-score-home-${match.id}`}>
                                    {match.homeScore ?? 0}
                                  </span>
                                  <span className="text-muted-foreground text-sm">-</span>
                                  <span className="text-lg sm:text-2xl font-bold" data-testid={`text-score-away-${match.id}`}>
                                    {match.awayScore ?? 0}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <span className="text-sm sm:text-base font-medium truncate block">{match.awayTeam?.name}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Equipos Tab */}
                <TabsContent value="equipos" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Equipos Participantes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {teams.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                          <Shield className="mx-auto h-12 w-12 opacity-50" />
                          <p className="mt-4">No hay equipos registrados</p>
                        </div>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {teams.map(team => (
                            <div
                              key={team.id}
                              className="rounded-md border p-4 hover-elevate"
                              data-testid={`card-team-${team.id}`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                  <Shield className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold">{team.name}</h4>
                                  <p className="text-sm text-muted-foreground">{team.colors}</p>
                                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    {team.homeField}
                                  </div>
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
            </div>
          ) : (
            <div className="rounded-md border-2 border-dashed p-12 text-center">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">Selecciona una División</h3>
              <p className="mt-2 text-muted-foreground">
                Elige Primera o Segunda División arriba para ver los torneos activos
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-card py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold">Lo Que Tu Equipo Obtiene</h2>
            <p className="text-muted-foreground">Beneficios exclusivos para todos los equipos inscritos</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="text-center" data-testid="feature-organization">
              <CardContent className="pt-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">Partidos Garantizados</h3>
                <p className="text-sm text-muted-foreground">
                  Calendario fijo con partidos cada semana contra equipos de tu nivel
                </p>
              </CardContent>
            </Card>
            <Card className="text-center" data-testid="feature-stats">
              <CardContent className="pt-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">Premios y Trofeos</h3>
                <p className="text-sm text-muted-foreground">
                  Copa para campeón, medallas y reconocimientos a los mejores jugadores
                </p>
              </CardContent>
            </Card>
            <Card className="text-center" data-testid="feature-mobile">
              <CardContent className="pt-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">Portal del Capitán</h3>
                <p className="text-sm text-muted-foreground">
                  Gestiona tu plantilla, consulta calendario y sigue el desempeño de tu equipo
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">¿Listo Para Competir?</h2>
            <p className="text-muted-foreground">Inscribe a tu equipo ahora y sé parte de la mejor liga amateur</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="overflow-hidden border-primary/50" data-testid="cta-register">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <UserPlus className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold">Inscribe Tu Equipo Ahora</h3>
                    <p className="mb-4 text-muted-foreground">
                      La temporada está por comenzar. No te quedes fuera de la competencia más emocionante de la región.
                    </p>
                    <ul className="mb-6 space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        Mínimo 11 jugadores por equipo
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        Cuota de inscripción accesible
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        Uniformes no incluidos
                      </li>
                    </ul>
                    <Button size="lg" className="gap-2" data-testid="button-cta-register">
                      <UserPlus className="h-4 w-4" />
                      Quiero Inscribirme
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden" data-testid="cta-info">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold">¿Tienes Dudas?</h3>
                    <p className="mb-4 text-muted-foreground">
                      Consulta sobre cuotas, horarios, requisitos o cualquier duda. Te respondemos en menos de 24 horas.
                    </p>
                    <div className="mb-6 space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" />
                        <span className="font-medium">+52 555 123 4567</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        <span className="font-medium">inscripciones@ligafutbol.com</span>
                      </div>
                    </div>
                    <Button size="lg" variant="outline" className="gap-2" data-testid="button-cta-info">
                      <Mail className="h-4 w-4" />
                      Contáctanos
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="font-semibold">La Liga de Campeones</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="/historial" className="hover:text-foreground">Historial</a>
              <a href="/login" className="hover:text-foreground">Iniciar Sesión</a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 La Liga de Campeones. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

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
