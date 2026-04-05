import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMatchSchema, type InsertMatch, type Match, type Team, type User, type Tournament, type Division, type MatchWithTeams, type TournamentStage } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getAuthHeader } from "@/lib/auth";
import { generateVsImageBlob, uploadVsImage } from "@/lib/vs-image-generator";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Calendar, Edit, Image, Flag, Eye, Play } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DateTimePicker } from "@/components/ui/date-picker";
import { MatchVsImage } from "@/components/match-vs-image";
import { SharedMatchResultDialog, SharedMatchDetailsDialog } from "@/components/match-referee-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function MatchesManagement() {
  const { toast } = useToast();
  const { logoUrl } = useSiteSettings();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [vsImageMatch, setVsImageMatch] = useState<Match | null>(null);
  const [refereeMatch, setRefereeMatch] = useState<MatchWithTeams | null>(null);
  const [viewingMatch, setViewingMatch] = useState<MatchWithTeams | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string>("");
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("");

  const { data: tournament } = useQuery<Tournament>({
    queryKey: ["/api/tournaments/active"],
  });

  const { data: allTournaments = [] } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments/active/all"],
  });

  const { data: divisions = [] } = useQuery<Division[]>({
    queryKey: ["/api/divisions"],
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/admin/teams"],
    queryFn: async () => {
      const response = await fetch("/api/admin/teams", { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar equipos");
      return response.json();
    },
  });

  const { data: referees = [] } = useQuery<Omit<User, 'passwordHash'>[]>({
    queryKey: ["/api/admin/referees"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users", { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar árbitros");
      const users = await response.json();
      return users.filter((u: User) => u.role === "ARBITRO");
    },
  });

  const { data: matches = [], isLoading } = useQuery<Match[]>({
    queryKey: ["/api/admin/matches", selectedTournamentId, selectedDivisionId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedTournamentId) params.set("tournamentId", selectedTournamentId);
      if (selectedDivisionId) params.set("divisionId", selectedDivisionId);
      const qs = params.toString();
      const url = qs ? `/api/admin/matches?${qs}` : "/api/admin/matches";
      const response = await fetch(url, { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar partidos");
      return response.json();
    },
  });

  const effectiveTournamentId = selectedTournamentId || editingMatch?.tournamentId || tournament?.id;

  const { data: tournamentStages = [] } = useQuery<TournamentStage[]>({
    queryKey: ["/api/admin/tournaments", effectiveTournamentId, "stages"],
    queryFn: async () => {
      const response = await fetch(`/api/admin/tournaments/${effectiveTournamentId}/stages`, { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar fases");
      return response.json();
    },
    enabled: !!effectiveTournamentId,
  });

  const getStageName = (match: Match) => {
    if (match.stageId) {
      const stage = tournamentStages.find(s => s.id === match.stageId);
      if (stage) return stage.name;
    }
    return `J${match.roundNumber}`;
  };

  const autoGenerateVsImage = async (matchId: string, matchData: Partial<InsertMatch>) => {
    try {
      const homeTeam = teams.find(t => t.id === matchData.homeTeamId);
      const awayTeam = teams.find(t => t.id === matchData.awayTeamId);
      if (!homeTeam || !awayTeam) return;

      const tournamentForImage = allTournaments.find(t => t.id === (matchData.tournamentId || tournament?.id));
      const divisionForImage = matchData.divisionId
        ? divisions.find(d => d.id === matchData.divisionId)
        : tournamentForImage?.divisionId
          ? divisions.find(d => d.id === tournamentForImage.divisionId)
          : undefined;

      const blob = await generateVsImageBlob({
        match: {
          id: matchId,
          tournamentId: matchData.tournamentId || tournament?.id || "",
          roundNumber: matchData.roundNumber || 1,
          dateTime: matchData.dateTime || "",
          field: matchData.field || "",
          homeTeamId: matchData.homeTeamId || "",
          awayTeamId: matchData.awayTeamId || "",
          status: matchData.status || "PROGRAMADO",
          homeScore: matchData.homeScore,
          awayScore: matchData.awayScore,
        },
        homeTeam,
        awayTeam,
        tournament: tournamentForImage,
        division: divisionForImage,
        ligaLogoSrc: logoUrl,
      });

      const objectPath = await uploadVsImage(blob, matchId);
      await apiRequest("PUT", `/api/admin/matches/${matchId}`, { vsImageUrl: objectPath });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home/schedule"] });
    } catch (err) {
      console.error("Error generando imagen VS:", err);
    }
  };

  const form = useForm<Omit<InsertMatch, 'tournamentId'>>({
    resolver: zodResolver(insertMatchSchema.omit({ tournamentId: true })),
    defaultValues: {
      roundNumber: 1,
      dateTime: "",
      field: "",
      homeTeamId: "",
      awayTeamId: "",
      refereeUserId: "",
      status: "PROGRAMADO",
      stage: undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<InsertMatch, 'tournamentId'>) => {
      const res = await apiRequest("POST", "/api/admin/matches", { ...data, tournamentId: selectedTournamentId || tournament?.id });
      return res.json();
    },
    onSuccess: async (createdMatch: Match) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home/schedule"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home/schedule/upcoming"] });
      toast({ title: "Partido creado correctamente" });
      setIsDialogOpen(false);
      const formData = form.getValues();
      form.reset();
      setSelectedTournamentId("");
      autoGenerateVsImage(createdMatch.id, { ...formData, tournamentId: selectedTournamentId || tournament?.id });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertMatch> }) => {
      const res = await apiRequest("PUT", `/api/admin/matches/${id}`, data);
      return { id, data, match: await res.json() };
    },
    onSuccess: async ({ id, data: updatedData, match: updatedMatch }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home/schedule"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home/schedule/upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home/standings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home/results"] });
      toast({ title: "Partido actualizado" });
      const needsRegeneration = updatedData.homeTeamId || updatedData.awayTeamId || updatedData.dateTime || updatedData.field || updatedData.roundNumber || updatedData.stage;
      setEditingMatch(null);
      setSelectedTournamentId("");
      form.reset();
      if (needsRegeneration) {
        autoGenerateVsImage(id, updatedMatch);
      }
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/matches/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home/schedule"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home/schedule/upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home/standings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home/results"] });
      toast({ title: "Partido eliminado" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const openEditDialog = (match: Match) => {
    setEditingMatch(match);
    setSelectedStageId(match.stageId || "");
    setSelectedTournamentId(match.tournamentId || "");
    setSelectedDivisionId(match.divisionId || "");
    form.reset({
      roundNumber: match.roundNumber,
      dateTime: match.dateTime.slice(0, 16),
      field: match.field,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      refereeUserId: match.refereeUserId || "",
      status: match.status,
      stage: match.stage || undefined,
    });
  };

  const handleSubmit = (data: Omit<InsertMatch, 'tournamentId'>) => {
    const stageName = selectedStageId ? tournamentStages.find(s => s.id === selectedStageId)?.name : undefined;
    const cleanData = {
      ...data,
      homeTeamId: data.homeTeamId || null,
      awayTeamId: data.awayTeamId || null,
      stage: stageName || undefined,
      stageId: selectedStageId || undefined,
      tournamentId: selectedTournamentId || tournament?.id,
      divisionId: selectedDivisionId || null,
    };
    if (editingMatch) {
      updateMutation.mutate({ id: editingMatch.id, data: cleanData });
    } else {
      createMutation.mutate(cleanData);
    }
  };

  const dialogTournamentId = selectedTournamentId || tournament?.id || "";
  const availableTeams = teams.filter(t =>
    (!dialogTournamentId || t.tournamentId === dialogTournamentId) &&
    (!selectedDivisionId || t.divisionId === selectedDivisionId)
  );

  const getTeamName = (id: string) => id ? (teams.find((t) => t.id === id)?.name || "N/A") : "Por definir";
  const getRefereeName = (id?: string) => referees.find((r) => r.id === id)?.name || "Sin asignar";

  const toMatchWithTeams = (match: Match): MatchWithTeams => ({
    ...match,
    homeTeam: match.homeTeamId ? teams.find(t => t.id === match.homeTeamId) || null : null,
    awayTeam: match.awayTeamId ? teams.find(t => t.id === match.awayTeamId) || null : null,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold">Gestión de Partidos</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Programa y administra los partidos del torneo
          </p>
        </div>
        <Dialog open={isDialogOpen || !!editingMatch} onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false);
            setEditingMatch(null);
            setSelectedStageId("");
            setSelectedTournamentId("");
            setSelectedDivisionId("");
            form.reset();
          } else {
            if (editingMatch) {
              openEditDialog(editingMatch);
            } else {
              setSelectedStageId("");
              setSelectedTournamentId(tournament?.id || "");
              setSelectedDivisionId("");
            }
            setIsDialogOpen(true);
          }
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-match" className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Partido
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingMatch ? "Editar Partido" : "Programar Partido"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                {allTournaments.length > 0 && (
                  <FormItem>
                    <FormLabel>Torneo</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        setSelectedTournamentId(val);
                        setSelectedDivisionId("");
                        setSelectedStageId("");
                      }}
                      value={selectedTournamentId}
                    >
                      <SelectTrigger data-testid="select-match-tournament-dialog">
                        <SelectValue placeholder="Selecciona un torneo" />
                      </SelectTrigger>
                      <SelectContent>
                        {allTournaments.map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
                {divisions.length > 0 && (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        setSelectedDivisionId(val === "none" ? "" : val);
                        setSelectedStageId("");
                      }}
                      value={selectedDivisionId || "none"}
                    >
                      <SelectTrigger data-testid="select-match-category">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— Sin categoría —</SelectItem>
                        {divisions.map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
                <FormField
                  control={form.control}
                  name="roundNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jornada</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          data-testid="input-match-round"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {tournamentStages.length > 0 && (
                  <FormItem>
                    <FormLabel>Fase del Torneo</FormLabel>
                    <Select
                      onValueChange={(val) => setSelectedStageId(val === "none" ? "" : val)}
                      value={selectedStageId || "none"}
                    >
                      <SelectTrigger data-testid="select-match-stage">
                        <SelectValue placeholder="Selecciona una fase" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— Sin fase específica —</SelectItem>
                        {tournamentStages.map((stage) => (
                          <SelectItem key={stage.id} value={stage.id}>
                            {stage.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="homeTeamId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Equipo Local</FormLabel>
                        <Select onValueChange={(val) => field.onChange(val === "tbc" ? "" : val)} value={field.value || "tbc"}>
                          <FormControl>
                            <SelectTrigger data-testid="select-home-team">
                              <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="tbc">Por confirmar</SelectItem>
                            {availableTeams.map((team) => (
                              <SelectItem key={team.id} value={team.id}>
                                {team.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="awayTeamId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Equipo Visitante</FormLabel>
                        <Select onValueChange={(val) => field.onChange(val === "tbc" ? "" : val)} value={field.value || "tbc"}>
                          <FormControl>
                            <SelectTrigger data-testid="select-away-team">
                              <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="tbc">Por confirmar</SelectItem>
                            {availableTeams.map((team) => (
                              <SelectItem key={team.id} value={team.id}>
                                {team.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="dateTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha y Hora</FormLabel>
                      <FormControl>
                        <DateTimePicker
                          value={field.value}
                          onChange={field.onChange}
                          data-testid="input-match-datetime"
                          placeholder="Selecciona fecha y hora del partido"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="field"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cancha</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre de la cancha" data-testid="input-match-field" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="refereeUserId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Árbitro</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-referee">
                            <SelectValue placeholder="Asignar árbitro" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {referees.map((ref) => (
                            <SelectItem key={ref.id} value={ref.id}>
                              {ref.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit-match"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Guardando..."
                    : editingMatch
                    ? "Actualizar"
                    : "Crear Partido"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tournament + Category Filters */}
      <div className="flex flex-col gap-3 sm:flex-row mb-4">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Torneo</label>
          <Select value={selectedTournamentId || "all"} onValueChange={(val) => {
            setSelectedTournamentId(val === "all" ? "" : val);
            setSelectedDivisionId("");
          }}>
            <SelectTrigger data-testid="select-match-tournament">
              <SelectValue placeholder="Todos los torneos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los torneos</SelectItem>
              {allTournaments.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Categoría</label>
          <Select value={selectedDivisionId || "all"} onValueChange={(val) => setSelectedDivisionId(val === "all" ? "" : val)}>
            <SelectTrigger data-testid="select-match-division">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {divisions.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Partidos del Torneo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : matches.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No hay partidos programados</p>
          ) : (
            <div className="space-y-2">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className="flex flex-col gap-3 rounded-md border p-3 sm:p-4"
                  data-testid={`row-match-${match.id}`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {getStageName(match)}
                      </Badge>
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base">
                          {getTeamName(match.homeTeamId || "")} vs {getTeamName(match.awayTeamId || "")}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {match.dateTime && !isNaN(new Date(match.dateTime).getTime()) ? format(new Date(match.dateTime), "d MMM yyyy, HH:mm", { locale: es }) : "Fecha por definir"} · {match.field}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Árbitro: {getRefereeName(match.refereeUserId)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2">
                    <div className="flex items-center gap-2">
                      {match.status === "JUGADO" && (
                        <Badge className="text-xs">
                          {match.homeScore} - {match.awayScore}
                        </Badge>
                      )}
                      <Badge variant={match.status === "JUGADO" ? "default" : "secondary"} className="text-xs">
                        {match.status === "JUGADO" ? "Jugado" : "Programado"}
                      </Badge>
                    </div>
                    {match.status === "PROGRAMADO" && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setRefereeMatch(toMatchWithTeams(match))}
                          data-testid={`button-start-match-${match.id}`}
                          title="Iniciar el partido"
                        >
                          <Play className="mr-1 h-4 w-4" />
                          <span className="hidden sm:inline">Iniciar</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRefereeMatch(toMatchWithTeams(match))}
                          data-testid={`button-referee-match-${match.id}`}
                          title="Gestionar como árbitro"
                        >
                          <Flag className="mr-1 h-4 w-4" />
                          <span className="hidden sm:inline">Arbitrar</span>
                        </Button>
                      </>
                    )}
                    {match.status === "JUGADO" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingMatch(toMatchWithTeams(match))}
                        data-testid={`button-view-match-${match.id}`}
                        title="Ver detalles del partido"
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        <span className="hidden sm:inline">Detalles</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setVsImageMatch(match)}
                      data-testid={`button-vs-image-${match.id}`}
                      title="Ver imagen VS"
                    >
                      <Image className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(match)}
                      data-testid={`button-edit-match-${match.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`button-delete-match-${match.id}`}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Eliminar partido</AlertDialogTitle>
                          <AlertDialogDescription>
                            ¿Estás seguro de que deseas eliminar este partido?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(match.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {vsImageMatch && (
        <MatchVsImage
          match={vsImageMatch}
          homeTeam={teams.find(t => t.id === vsImageMatch.homeTeamId)}
          awayTeam={teams.find(t => t.id === vsImageMatch.awayTeamId)}
          open={!!vsImageMatch}
          onOpenChange={(open) => { if (!open) setVsImageMatch(null); }}
        />
      )}

      {refereeMatch && (
        <SharedMatchResultDialog
          match={refereeMatch}
          open={!!refereeMatch}
          onOpenChange={(open) => { if (!open) setRefereeMatch(null); }}
        />
      )}

      {viewingMatch && (
        <SharedMatchDetailsDialog
          match={viewingMatch}
          open={!!viewingMatch}
          onOpenChange={(open) => { if (!open) setViewingMatch(null); }}
        />
      )}
    </div>
  );
}
