import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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
  Zap,
  Send,
  Swords,
  BarChart3,
  ShieldCheck,
  Shirt,
  Megaphone,
  HeartPulse,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { SiInstagram } from "react-icons/si";
import {
  insertContactMessageSchema,
  type InsertContactMessage,
  MatchStageLabels,
  type MatchStage,
} from "@shared/schema";
import type {
  MatchWithTeams,
  Standing,
  Team,
  Tournament,
  NewsWithAuthor,
  Division,
} from "@shared/schema";
import { MatchDetailDialog } from "@/components/match-detail-dialog";
import heroFootball from "@/assets/images/football-field.jpg";
import teamHuddle from "@/assets/images/team-huddle.jpg";
import trophyImage from "@/assets/images/trophy.jpg";
import stadiumImage from "@/assets/images/stadium.jpg";
import waterSplash from "@/assets/images/water-splash.jpg";
import ligaLogo from "@assets/logo_circular_transparente_1770735565551.webp";

export default function Home() {
  const { toast } = useToast();
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [showPrizes, setShowPrizes] = useState(false);
  const [showCompetencia, setShowCompetencia] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("calendario");
  const [showContactForm, setShowContactForm] = useState(false);

  const contactForm = useForm<InsertContactMessage>({
    resolver: zodResolver(insertContactMessageSchema),
    defaultValues: { contactName: "", phone: "", email: "", comments: "" },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: InsertContactMessage) => {
      await apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Mensaje enviado",
        description: "Nos pondremos en contacto contigo pronto.",
      });
      setShowContactForm(false);
      contactForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Intenta de nuevo.",
        variant: "destructive",
      });
    },
  });

  const { data: divisions = [], isLoading: loadingDivisions } = useQuery<
    Division[]
  >({
    queryKey: ["/api/divisions"],
  });

  const { data: allTournaments = [] } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments/active/all"],
  });

  const { data: activeTournament } = useQuery<Tournament>({
    queryKey: ["/api/tournaments/active"],
  });

  useEffect(() => {
    if (divisions.length > 0 && !selectedDivision) {
      setSelectedDivision(divisions[0].id);
    }
  }, [divisions, selectedDivision]);

  const currentTournament = selectedDivision
    ? allTournaments.find((t) => t.divisionId === selectedDivision) ||
      activeTournament
    : activeTournament;

  const currentDivision = selectedDivision
    ? divisions.find((d) => d.id === selectedDivision)
    : currentTournament?.divisionId
      ? divisions.find((d) => d.id === currentTournament.divisionId)
      : null;

  const tournamentId = currentTournament?.id;

  const { data: standings = [], isLoading: loadingStandings } = useQuery<
    Standing[]
  >({
    queryKey: ["/api/home/standings", tournamentId],
    queryFn: async () => {
      const res = await fetch(
        `/api/home/standings${tournamentId ? `?tournamentId=${tournamentId}` : ""}`,
      );
      if (!res.ok) throw new Error("Failed to fetch standings");
      return res.json();
    },
    enabled: !!tournamentId && !!selectedDivision,
  });

  const { data: results = [], isLoading: loadingResults } = useQuery<
    MatchWithTeams[]
  >({
    queryKey: ["/api/home/results", tournamentId],
    queryFn: async () => {
      const res = await fetch(
        `/api/home/results${tournamentId ? `?tournamentId=${tournamentId}` : ""}`,
      );
      if (!res.ok) throw new Error("Failed to fetch results");
      return res.json();
    },
    enabled: !!tournamentId && !!selectedDivision,
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/home/teams", tournamentId],
    queryFn: async () => {
      const res = await fetch(
        `/api/home/teams${tournamentId ? `?tournamentId=${tournamentId}` : ""}`,
      );
      if (!res.ok) throw new Error("Failed to fetch teams");
      return res.json();
    },
    enabled: !!tournamentId && !!selectedDivision,
  });

  const { data: news = [], isLoading: loadingNews } = useQuery<
    NewsWithAuthor[]
  >({
    queryKey: ["/api/home/news", tournamentId],
    queryFn: async () => {
      const res = await fetch(
        `/api/home/news${tournamentId ? `?tournamentId=${tournamentId}` : ""}`,
      );
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

  const { data: scorers = [], isLoading: loadingScorers } = useQuery<
    TopScorer[]
  >({
    queryKey: ["/api/home/scorers", tournamentId],
    queryFn: async () => {
      const res = await fetch(
        `/api/home/scorers${tournamentId ? `?tournamentId=${tournamentId}` : ""}`,
      );
      if (!res.ok) throw new Error("Failed to fetch scorers");
      return res.json();
    },
    enabled: !!tournamentId && !!selectedDivision,
  });

  const { data: allTournamentSchedule = [], isLoading: loadingSchedule } = useQuery<
    MatchWithTeams[]
  >({
    queryKey: ["/api/home/schedule", tournamentId],
    queryFn: async () => {
      const res = await fetch(
        `/api/home/schedule${tournamentId ? `?tournamentId=${tournamentId}` : ""}`,
      );
      if (!res.ok) throw new Error("Failed to fetch schedule");
      return res.json();
    },
    enabled: !!tournamentId && !!selectedDivision,
  });

  const tournamentSchedule = (allTournamentSchedule || []).filter(m => {
    if (m.status === "JUGADO") return false;
    if (m.status === "EN_CURSO") return true;
    const matchDate = new Date(m.dateTime);
    if (isNaN(matchDate.getTime())) return true;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return matchDate >= now;
  });

  const scheduleRounds = Array.from(new Set(tournamentSchedule.map(m => m.roundNumber))).sort((a, b) => a - b);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const filteredScheduleMatches = selectedRound
    ? tournamentSchedule.filter(m => m.roundNumber === selectedRound)
    : tournamentSchedule;

  const handleDivisionSelect = (divisionId: string) => {
    setSelectedDivision(divisionId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-[100] border-b border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={ligaLogo}
                alt="La Liga de Campeones"
                className="h-10 w-10 object-contain"
              />
              <span className="text-xl font-bold">La Liga de Campeones</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/calendario"
                className="hidden sm:inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium hover-elevate"
                data-testid="link-calendar"
              >
                Calendario
              </a>
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
        <div className="absolute inset-0 bg-gradient-to-r from-[#063A13]/90 via-[#063A13]/70 to-[#0B5D1E]/50" />

        <div className="container relative mx-auto px-4 py-20 sm:py-28">
          <div className="max-w-2xl">
            <Badge
              className="mb-6 bg-primary/90 text-primary-foreground"
              data-testid="badge-hero"
            >
              <Zap className="mr-1 h-3 w-3" />
              Inscripciones Abiertas - Temporada 2026
            </Badge>
            <h1
              className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
              data-testid="text-hero-title"
            >
              Bienvenidos a
              <span className="block text-primary">LA LIGA DE CAMPEONES</span>
            </h1>
            <p className="mb-8 text-lg text-gray-200 sm:text-xl">
              Inscribe a tu equipo y demuestra de qué están hechos. Competencia
              real, organización profesional, y la oportunidad de consagrarse
              campeones.
            </p>

            {/* Key Benefits */}
            <div className="mb-8 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-gray-200">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Gran ubicación con facil acceso</span>
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
              <Button
                size="lg"
                className="gap-2 text-base"
                data-testid="button-register-team"
                onClick={() => setShowContactForm(true)}
              >
                <UserPlus className="h-5 w-5" />
                Inscribir Mi Equipo
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                data-testid="button-request-info"
                onClick={() => setShowContactForm(true)}
              >
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
            <h2
              className="text-3xl font-bold mb-4"
              data-testid="text-why-join-title"
            >
              ¿Por Qué Inscribir a Tu Equipo?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              No es solo un torneo, es una experiencia competitiva de primer
              nivel para equipos que buscan superarse
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">
            {/* Benefit 1 */}
            <a
              href="https://maps.google.com/?q=Portada+Alta+C.F.,+C.+James+Joyce,+47,+Teatinos-Universidad,+29010+Málaga"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-md cursor-pointer w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]"
              data-testid="link-instalaciones"
            >
              <img
                src={stadiumImage}
                alt="Instalaciones"
                className="h-48 w-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 p-6 text-white">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">Instalaciones de Primera</h3>
                <p className="text-sm text-gray-300">
                  Canchas en óptimas condiciones, iluminación profesional y
                  vestuarios equipados
                </p>
              </div>
            </a>

            {/* Benefit 2 */}
            <div
              className="group relative overflow-hidden rounded-md cursor-pointer w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]"
              onClick={() => setShowPrizes(true)}
              data-testid="link-premios"
            >
              <img
                src={trophyImage}
                alt="Premios"
                className="h-48 w-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 p-6 text-white">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                  <Trophy className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">Premios y Reconocimientos</h3>
                <p className="text-sm text-gray-300">
                  Trofeos, medallas, premios en efectivo y reconocimiento a los
                  mejores jugadores
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div
              className="group relative overflow-hidden rounded-md cursor-pointer w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]"
              onClick={() => setShowCompetencia(true)}
              data-testid="link-competencia"
            >
              <img
                src={teamHuddle}
                alt="Competencia"
                className="h-48 w-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 p-6 text-white">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">Competencia Real</h3>
                <p className="text-sm text-gray-300">
                  Enfrenta a los mejores equipos de la zona en partidos
                  emocionantes cada semana
                </p>
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
              <p className="text-sm text-muted-foreground">
                Equipos Compitiendo
              </p>
            </div>
            <div className="text-center" data-testid="stat-players">
              <p className="text-4xl font-bold text-primary">800+</p>
              <p className="text-sm text-muted-foreground">Jugadores Activos</p>
            </div>
            <div className="text-center" data-testid="stat-matches">
              <p className="text-4xl font-bold text-primary">200+</p>
              <p className="text-sm text-muted-foreground">
                Partidos por Temporada
              </p>
            </div>
            <div className="text-center" data-testid="stat-seasons">
              <p className="text-4xl font-bold text-primary">10</p>
              <p className="text-sm text-muted-foreground">
                Años de Experiencia
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Próximos Partidos Section - VS Images */}
      <UpcomingMatchesSection />

      {/* Divisions Section - Tournament Viewer */}
      <section className="py-12 sm:py-16" id="torneos">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2
              className="mb-2 text-3xl font-bold"
              data-testid="text-divisions-title"
            >
              Ver Torneos en Curso
            </h2>
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
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                  data-testid={`button-division-${division.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full p-2 bg-primary/20">
                      <Trophy className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{division.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {division.description}
                      </p>
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
                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/15">
                        <Trophy className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3
                            className="text-xl font-bold"
                            data-testid="text-tournament-name"
                          >
                            {currentTournament.name}
                          </h3>
                          {currentDivision && (
                            <Badge
                              variant="outline"
                              className="shrink-0 border-primary/50 text-primary"
                              data-testid="badge-division"
                            >
                              <Shield className="mr-1 h-3 w-3 text-primary" />
                              {currentDivision.name}
                            </Badge>
                          )}
                        </div>
                        <p
                          className="text-sm text-muted-foreground"
                          data-testid="text-season-name"
                        >
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
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
              >
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger
                    value="calendario"
                    data-testid="tab-calendario"
                    className="flex flex-col gap-1 px-1 py-2 sm:flex-row sm:gap-2 sm:px-3"
                  >
                    <Calendar className="h-4 w-4" />
                    <span className="text-[10px] sm:text-sm">Calendario</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="posiciones"
                    data-testid="tab-posiciones"
                    className="flex flex-col gap-1 px-1 py-2 sm:flex-row sm:gap-2 sm:px-3"
                  >
                    <Trophy className="h-4 w-4" />
                    <span className="text-[10px] sm:text-sm">Posiciones</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="goleadores"
                    data-testid="tab-goleadores"
                    className="flex flex-col gap-1 px-1 py-2 sm:flex-row sm:gap-2 sm:px-3"
                  >
                    <Target className="h-4 w-4" />
                    <span className="text-[10px] sm:text-sm">Goleadores</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="resultados"
                    data-testid="tab-resultados"
                    className="flex flex-col gap-1 px-1 py-2 sm:flex-row sm:gap-2 sm:px-3"
                  >
                    <Users className="h-4 w-4" />
                    <span className="text-[10px] sm:text-sm">Resultados</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="equipos"
                    data-testid="tab-equipos"
                    className="flex flex-col gap-1 px-1 py-2 sm:flex-row sm:gap-2 sm:px-3"
                  >
                    <Shield className="h-4 w-4" />
                    <span className="text-[10px] sm:text-sm">Equipos</span>
                  </TabsTrigger>
                </TabsList>

                {/* Calendario Tab */}
                <TabsContent value="calendario" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Próximos Partidos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingSchedule ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-24" />
                          ))}
                        </div>
                      ) : tournamentSchedule.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                          <Calendar className="mx-auto h-12 w-12 opacity-50" />
                          <p className="mt-4">No hay partidos pendientes</p>
                          <p className="text-sm mt-1">Consulta los resultados en la pestaña correspondiente</p>
                        </div>
                      ) : (
                        <>
                          {scheduleRounds.length > 1 && (
                            <div className="flex flex-wrap items-center gap-2 mb-4" data-testid="schedule-round-filters">
                              <Button
                                variant={selectedRound === null ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedRound(null)}
                                data-testid="button-round-all"
                              >
                                Todos
                              </Button>
                              {scheduleRounds.map((round) => (
                                <Button
                                  key={round}
                                  variant={selectedRound === round ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setSelectedRound(round)}
                                  data-testid={`button-round-${round}`}
                                >
                                  Jornada {round}
                                </Button>
                              ))}
                            </div>
                          )}
                          <div className="space-y-3">
                            {filteredScheduleMatches.map((match) => (
                              <div
                                key={match.id}
                                className="rounded-md border p-3 sm:p-4 hover-elevate cursor-pointer"
                                onClick={() => setSelectedMatch(match.id)}
                                data-testid={`card-schedule-${match.id}`}
                              >
                                <div className="flex items-center justify-between gap-2 mb-3">
                                  <Badge variant="outline" className="text-xs">
                                    {match.stage && match.stage !== "JORNADA"
                                      ? MatchStageLabels[match.stage as MatchStage]
                                      : `Jornada ${match.roundNumber}`}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      match.status === "JUGADO"
                                        ? "bg-green-600/10 text-green-700 dark:text-green-400 border-green-600/30"
                                        : match.status === "EN_CURSO"
                                          ? "bg-yellow-600/10 text-yellow-700 dark:text-yellow-400 border-yellow-600/30"
                                          : ""
                                    }`}
                                  >
                                    {match.status === "JUGADO" ? "Jugado" : match.status === "EN_CURSO" ? "En curso" : "Programado"}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-center gap-2 sm:gap-4">
                                  <div className="flex-1 text-right flex flex-col items-end gap-1">
                                    {match.homeTeam?.logoUrl ? (
                                      <img src={match.homeTeam.logoUrl} alt={match.homeTeam.name} className="h-8 w-8 rounded-full object-cover border border-amber-400/50" />
                                    ) : (
                                      <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
                                        {match.homeTeam ? match.homeTeam.name.charAt(0) : "?"}
                                      </div>
                                    )}
                                    <span className="text-sm sm:text-base font-medium truncate block max-w-full" data-testid={`text-home-${match.id}`}>
                                      {match.homeTeam?.name || "Por definir"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 sm:gap-2 rounded-md bg-primary/10 px-2 sm:px-4 py-1 sm:py-2">
                                    {match.status === "JUGADO" || match.status === "EN_CURSO" ? (
                                      <>
                                        <span className="text-lg sm:text-2xl font-bold" data-testid={`text-score-home-${match.id}`}>
                                          {match.homeScore ?? 0}
                                        </span>
                                        <span className="text-muted-foreground">-</span>
                                        <span className="text-lg sm:text-2xl font-bold" data-testid={`text-score-away-${match.id}`}>
                                          {match.awayScore ?? 0}
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-sm font-medium text-muted-foreground px-2">VS</span>
                                    )}
                                  </div>
                                  <div className="flex-1 text-left flex flex-col items-start gap-1">
                                    {match.awayTeam?.logoUrl ? (
                                      <img src={match.awayTeam.logoUrl} alt={match.awayTeam.name} className="h-8 w-8 rounded-full object-cover border border-amber-400/50" />
                                    ) : (
                                      <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
                                        {match.awayTeam ? match.awayTeam.name.charAt(0) : "?"}
                                      </div>
                                    )}
                                    <span className="text-sm sm:text-base font-medium truncate block max-w-full" data-testid={`text-away-${match.id}`}>
                                      {match.awayTeam?.name || "Por definir"}
                                    </span>
                                  </div>
                                </div>
                                <div className="mt-2 text-center text-xs text-muted-foreground">
                                  {match.dateTime && new Date(match.dateTime).getFullYear() > 2000
                                    ? format(new Date(match.dateTime), "EEEE d MMM, HH:mm", { locale: es })
                                    : "Fecha por confirmar"}
                                  {match.field && match.field !== "Por asignar" ? ` • ${match.field}` : ""}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
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
                          <p className="mt-4">
                            No hay datos de posiciones disponibles
                          </p>
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
                                  <span className="font-medium text-sm truncate max-w-[100px] sm:max-w-[150px]">
                                    {team.teamName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-center">
                                    <p className="text-xs text-muted-foreground">
                                      PJ
                                    </p>
                                    <p className="font-medium text-sm">
                                      {team.played}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-xs text-muted-foreground">
                                      DG
                                    </p>
                                    <p className="font-medium text-sm">
                                      {team.goalDifference > 0
                                        ? `+${team.goalDifference}`
                                        : team.goalDifference}
                                    </p>
                                  </div>
                                  <div className="text-center min-w-[32px]">
                                    <p className="text-xs text-muted-foreground">
                                      PTS
                                    </p>
                                    <p className="font-bold text-primary">
                                      {team.points}
                                    </p>
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
                                  <th className="pb-3 text-center font-bold">
                                    PTS
                                  </th>
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
                                    </td>
                                    <td className="py-3 pr-4 font-medium">
                                      {team.teamName}
                                    </td>
                                    <td className="py-3 pr-2 text-center">
                                      {team.played}
                                    </td>
                                    <td className="py-3 pr-2 text-center text-foreground">
                                      {team.won}
                                    </td>
                                    <td className="py-3 pr-2 text-center text-primary">
                                      {team.drawn}
                                    </td>
                                    <td className="py-3 pr-2 text-center text-destructive">
                                      {team.lost}
                                    </td>
                                    <td className="py-3 pr-2 text-center">
                                      {team.goalsFor}
                                    </td>
                                    <td className="py-3 pr-2 text-center">
                                      {team.goalsAgainst}
                                    </td>
                                    <td className="py-3 pr-2 text-center font-medium">
                                      {team.goalDifference > 0
                                        ? `+${team.goalDifference}`
                                        : team.goalDifference}
                                    </td>
                                    <td className="py-3 text-center font-bold text-primary">
                                      {team.points}
                                    </td>
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
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-12" />
                          ))}
                        </div>
                      ) : scorers.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                          <Target className="mx-auto h-12 w-12 opacity-50" />
                          <p className="mt-4">
                            No hay goleadores registrados aún
                          </p>
                          <p className="text-sm">
                            Los goles se registran cuando el árbitro finaliza un
                            partido
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b text-muted-foreground">
                                <th className="pb-3 text-left font-medium w-12">
                                  #
                                </th>
                                <th className="pb-3 text-left font-medium">
                                  Jugador
                                </th>
                                <th className="pb-3 text-left font-medium">
                                  Equipo
                                </th>
                                <th className="pb-3 text-center font-medium w-16">
                                  Goles
                                </th>
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
                                      <div
                                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                          idx === 0
                                            ? "bg-primary text-primary-foreground"
                                            : idx === 1
                                              ? "bg-muted text-foreground"
                                              : "bg-secondary text-secondary-foreground"
                                        }`}
                                      >
                                        {idx + 1}
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground">
                                        {idx + 1}
                                      </span>
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
                                      <span className="font-medium">
                                        {scorer.playerName}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3 text-muted-foreground">
                                    {scorer.teamName}
                                  </td>
                                  <td className="py-3 text-center">
                                    <Badge
                                      variant="default"
                                      className="text-sm font-bold"
                                    >
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
                          {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-24" />
                          ))}
                        </div>
                      ) : results.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                          <Users className="mx-auto h-12 w-12 opacity-50" />
                          <p className="mt-4">No hay resultados disponibles</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {results.map((match) => (
                            <div
                              key={match.id}
                              className="rounded-md border p-3 sm:p-4 hover-elevate cursor-pointer"
                              onClick={() => setSelectedMatch(match.id)}
                              data-testid={`card-result-${match.id}`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {match.stage && match.stage !== "JORNADA"
                                      ? MatchStageLabels[match.stage as MatchStage]
                                      : `J${match.roundNumber}`}
                                  </Badge>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {format(
                                    new Date(match.dateTime),
                                    "d MMM yyyy",
                                    { locale: es },
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center justify-center gap-2 sm:gap-4">
                                <div className="flex-1 text-right flex flex-col items-end gap-1">
                                  {match.homeTeam?.logoUrl ? (
                                    <img src={match.homeTeam.logoUrl} alt={match.homeTeam.name} className="h-8 w-8 rounded-full object-cover border border-amber-400/50" />
                                  ) : (
                                    <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
                                      {match.homeTeam ? match.homeTeam.name.charAt(0) : "?"}
                                    </div>
                                  )}
                                  <span className="text-sm sm:text-base font-medium truncate block max-w-full">
                                    {match.homeTeam?.name || "Por definir"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2 rounded-md bg-primary/10 px-2 sm:px-4 py-1 sm:py-2">
                                  <span
                                    className="text-lg sm:text-2xl font-bold"
                                    data-testid={`text-score-home-${match.id}`}
                                  >
                                    {match.homeScore ?? 0}
                                  </span>
                                  <span className="text-muted-foreground text-sm">
                                    -
                                  </span>
                                  <span
                                    className="text-lg sm:text-2xl font-bold"
                                    data-testid={`text-score-away-${match.id}`}
                                  >
                                    {match.awayScore ?? 0}
                                  </span>
                                </div>
                                <div className="flex-1 flex flex-col items-start gap-1">
                                  {match.awayTeam?.logoUrl ? (
                                    <img src={match.awayTeam.logoUrl} alt={match.awayTeam.name} className="h-8 w-8 rounded-full object-cover border border-amber-400/50" />
                                  ) : (
                                    <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
                                      {match.awayTeam ? match.awayTeam.name.charAt(0) : "?"}
                                    </div>
                                  )}
                                  <span className="text-sm sm:text-base font-medium truncate block max-w-full">
                                    {match.awayTeam?.name || "Por definir"}
                                  </span>
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
                          {teams.map((team) => (
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
                                  <p className="text-sm text-muted-foreground">
                                    {team.colors}
                                  </p>
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
          ) : null}
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-card py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold">
              Lo Que Tu Equipo Obtiene
            </h2>
            <p className="text-muted-foreground">
              Beneficios exclusivos para todos los equipos inscritos
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="text-center" data-testid="feature-organization">
              <CardContent className="pt-4 pb-4">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                  <Swords className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-1 text-sm font-bold">
                  Partidos Garantizados
                </h3>
                <p className="text-xs text-muted-foreground">
                  Calendario fijo con partidos cada semana contra equipos de tu
                  nivel
                </p>
              </CardContent>
            </Card>
            <Card className="text-center" data-testid="feature-stats">
              <CardContent className="pt-4 pb-4">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-1 text-sm font-bold">Premios y Trofeos</h3>
                <p className="text-xs text-muted-foreground">
                  Copa para campeón, medallas y reconocimientos a los mejores
                  jugadores
                </p>
              </CardContent>
            </Card>
            <Card className="text-center" data-testid="feature-captain">
              <CardContent className="pt-4 pb-4">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-1 text-sm font-bold">Portal del Capitán</h3>
                <p className="text-xs text-muted-foreground">
                  Gestiona tu plantilla, consulta calendario y sigue el
                  desempeño de tu equipo
                </p>
              </CardContent>
            </Card>
            <Card className="text-center" data-testid="feature-rankings">
              <CardContent className="pt-4 pb-4">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-1 text-sm font-bold">Estadísticas en Vivo</h3>
                <p className="text-xs text-muted-foreground">
                  Tabla de posiciones, goleadores y rendimiento de tu equipo
                  actualizados en tiempo real
                </p>
              </CardContent>
            </Card>
            <Card className="text-center" data-testid="feature-referees">
              <CardContent className="pt-4 pb-4">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                  <Shirt className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-1 text-sm font-bold">
                  Árbitros Certificados
                </h3>
                <p className="text-xs text-muted-foreground">
                  Todos los partidos con árbitros profesionales que garantizan
                  juego limpio
                </p>
              </CardContent>
            </Card>
            <Card className="text-center" data-testid="feature-fair-play">
              <CardContent className="pt-4 pb-4">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                  <HeartPulse className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-1 text-sm font-bold">Competencia Sana</h3>
                <p className="text-xs text-muted-foreground">
                  Reglamento claro, sistema de multas y fair play para una
                  experiencia deportiva de calidad
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
            <p className="text-muted-foreground">
              Inscribe a tu equipo ahora y sé parte de la mejor liga amateur
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card
              className="overflow-hidden border-primary/50"
              data-testid="cta-register"
            >
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <UserPlus className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold">
                      Inscribe Tu Equipo Ahora
                    </h3>
                    <p className="mb-4 text-muted-foreground">
                      La temporada está por comenzar. No te quedes fuera de la
                      competencia más emocionante de la región.
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
                    <Button
                      size="lg"
                      className="gap-2"
                      data-testid="button-cta-register"
                      onClick={() => setShowContactForm(true)}
                    >
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
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold">¿Tienes Dudas?</h3>
                    <p className="mb-4 text-muted-foreground">
                      Consulta sobre cuotas, horarios, requisitos o cualquier
                      duda. Te respondemos en menos de 24 horas.
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Button
                        size="lg"
                        variant="outline"
                        className="gap-2"
                        data-testid="button-cta-info"
                        onClick={() => setShowContactForm(true)}
                      >
                        <Mail className="h-4 w-4" />
                        Contáctanos
                      </Button>
                      <a
                        href="https://www.instagram.com/laligadecampeones_100?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="link-instagram-cta"
                      >
                        <Button size="lg" variant="outline" className="gap-2">
                          <SiInstagram className="h-4 w-4" />
                          Instagram
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/20 bg-card py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="font-semibold">La Liga de Campeones</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="/historial" className="hover:text-foreground">
                Historial
              </a>
              <a href="/login" className="hover:text-foreground">
                Iniciar Sesión
              </a>
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

      <Dialog open={showPrizes} onOpenChange={setShowPrizes}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">
              Premios y Reconocimientos
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="flex flex-col items-center gap-3 rounded-md border p-6">
              <Trophy className="h-16 w-16 text-primary" />
              <h3 className="text-lg font-bold">Primera División</h3>
              <p className="text-3xl font-extrabold text-primary">
                1.500 &euro;
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-md border p-6">
              <Trophy className="h-16 w-16 text-muted-foreground" />
              <h3 className="text-lg font-bold">Segunda División</h3>
              <p className="text-3xl font-extrabold text-muted-foreground">
                1.000 &euro;
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCompetencia} onOpenChange={setShowCompetencia}>
        <DialogContent className="p-0 sm:max-w-lg overflow-hidden">
          <div className="relative">
            <img
              src={waterSplash}
              alt="Competencia Real"
              className="absolute inset-0 h-full w-full object-cover opacity-20"
            />
            <div className="relative z-10 p-8 sm:p-10">
              <DialogHeader className="mb-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
                  <Zap className="h-7 w-7 text-primary" />
                </div>
                <DialogTitle className="text-center text-2xl font-extrabold uppercase tracking-wide">
                  Competencia real que se vive en la cancha.
                </DialogTitle>
              </DialogHeader>
              <p className="mb-6 text-center text-base leading-relaxed text-muted-foreground">
                Enfr&eacute;ntate a los mejores equipos de la zona en partidos
                llenos de intensidad, pasi&oacute;n y emoci&oacute;n cada
                semana. S&uacute;mate al torneo, demuestra de qu&eacute;
                est&aacute; hecho tu equipo y forma parte de una liga donde cada
                partido cuenta.
              </p>
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-center">
                <p className="text-sm font-bold text-destructive">
                  Cupos limitados. No te quedes fuera.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Inscribe a tu equipo y vive el torneo desde adentro.
                </p>
              </div>
              <div className="mt-6 flex justify-center">
                <Button
                  className="gap-2 font-bold uppercase"
                  onClick={() => {
                    setShowCompetencia(false);
                    setShowContactForm(true);
                  }}
                  data-testid="button-competencia-inscribir"
                >
                  <UserPlus className="h-4 w-4" />
                  Inscribe Tu Equipo
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <UserPlus className="h-5 w-5 text-primary" />
              Formulario de Contacto
            </DialogTitle>
            <DialogDescription>
              Déjanos tus datos y nos pondremos en contacto contigo para
              inscribir a tu equipo.
            </DialogDescription>
          </DialogHeader>
          <Form {...contactForm}>
            <form
              onSubmit={contactForm.handleSubmit((data) =>
                contactMutation.mutate(data),
              )}
              className="space-y-4"
            >
              <FormField
                control={contactForm.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de Contacto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Tu nombre completo"
                        {...field}
                        data-testid="input-contact-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={contactForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="600 123 456"
                        {...field}
                        data-testid="input-contact-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={contactForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        {...field}
                        data-testid="input-contact-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={contactForm.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comentarios</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Cuéntanos sobre tu equipo, número de jugadores, experiencia..."
                        className="resize-none"
                        rows={3}
                        {...field}
                        data-testid="input-contact-comments"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full gap-2"
                disabled={contactMutation.isPending}
                data-testid="button-send-contact"
              >
                <Send className="h-4 w-4" />
                {contactMutation.isPending ? "Enviando..." : "Enviar Mensaje"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UpcomingMatchesSection() {
  const { data: allSchedule = [], isLoading } = useQuery<MatchWithTeams[]>({
    queryKey: ["/api/home/schedule/upcoming"],
    queryFn: async () => {
      const res = await fetch("/api/home/schedule/upcoming");
      if (!res.ok) throw new Error("Failed to fetch upcoming");
      return res.json();
    },
  });

  const upcomingMatches = (allSchedule || []).slice(0, 8);

  if (isLoading) {
    return (
      <section className="py-12 sm:py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="aspect-square rounded-md" />)}
          </div>
        </div>
      </section>
    );
  }

  if (upcomingMatches.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-card" data-testid="section-upcoming-matches">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2" data-testid="text-upcoming-title">
            Próximos Partidos
          </h2>
          <p className="text-muted-foreground">
            No te pierdas la acción en la cancha
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {upcomingMatches.map((match) => (
            <div key={match.id} className="group cursor-pointer" data-testid={`card-upcoming-match-${match.id}`}>
              <div className="overflow-hidden rounded-lg border shadow-md transition-transform group-hover:scale-[1.02] bg-gradient-to-br from-[#031D0A] to-[#0F6B2E]">
                <div className="p-4 flex flex-col items-center gap-3">
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-amber-400/40 text-amber-300 bg-amber-400/10">
                    {match.stage && match.stage !== "JORNADA"
                      ? MatchStageLabels[match.stage as MatchStage]
                      : `Jornada ${match.roundNumber}`}
                  </Badge>

                  <div className="flex items-center justify-center gap-4 w-full">
                    <div className="text-center flex-1">
                      {match.homeTeam?.logoUrl ? (
                        <img src={match.homeTeam.logoUrl} alt={match.homeTeam.name} className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover border-2 border-amber-400 mx-auto shadow-lg" />
                      ) : (
                        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 font-bold text-lg mx-auto">
                          {match.homeTeam ? match.homeTeam.name.charAt(0) : "?"}
                        </div>
                      )}
                      <p className="text-white font-bold text-xs mt-2 leading-tight truncate max-w-[100px] mx-auto">
                        {match.homeTeam?.name || "Por definir"}
                      </p>
                    </div>

                    <p className="text-amber-400 font-black text-2xl shrink-0">VS</p>

                    <div className="text-center flex-1">
                      {match.awayTeam?.logoUrl ? (
                        <img src={match.awayTeam.logoUrl} alt={match.awayTeam.name} className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover border-2 border-amber-400 mx-auto shadow-lg" />
                      ) : (
                        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 font-bold text-lg mx-auto">
                          {match.awayTeam ? match.awayTeam.name.charAt(0) : "?"}
                        </div>
                      )}
                      <p className="text-white font-bold text-xs mt-2 leading-tight truncate max-w-[100px] mx-auto">
                        {match.awayTeam?.name || "Por definir"}
                      </p>
                    </div>
                  </div>

                  <div className="w-full border-t border-white/10 pt-2 text-center space-y-0.5">
                    <p className="text-amber-300 font-semibold text-xs">
                      {match.dateTime && new Date(match.dateTime).getFullYear() > 2000
                        ? format(new Date(match.dateTime), "EEEE d 'de' MMMM", { locale: es })
                        : "Fecha por confirmar"}
                    </p>
                    <p className="text-white font-bold text-sm">
                      {match.dateTime && new Date(match.dateTime).getFullYear() > 2000
                        ? format(new Date(match.dateTime), "HH:mm", { locale: es }) + " hrs"
                        : ""}
                    </p>
                    {match.field && match.field !== "Por asignar" && (
                      <p className="text-emerald-300/70 text-[10px]">
                        {match.field}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a href="/calendario" data-testid="link-full-calendar">
            <Button variant="outline" size="lg" className="gap-2">
              <Calendar className="h-5 w-5" />
              Ver Calendario Completo
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
