import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTournamentSchema, finishTournamentSchema, type InsertTournament, type Tournament, type Team, type Standing, type Division, type TournamentType } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getAuthHeader } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Plus, Edit, Trash2, Flag, MapPin, Calendar, Award, Users, CalendarPlus, Loader2, Shield } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function TournamentManagement() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [finishingTournament, setFinishingTournament] = useState<Tournament | null>(null);
  const [viewingTournament, setViewingTournament] = useState<Tournament | null>(null);
  const [generatingSchedule, setGeneratingSchedule] = useState<Tournament | null>(null);
  const [doubleRound, setDoubleRound] = useState(false);

  const { data: tournaments = [], isLoading } = useQuery<Tournament[]>({
    queryKey: ["/api/admin/tournaments"],
    queryFn: async () => {
      const response = await fetch("/api/admin/tournaments", { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar torneos");
      return response.json();
    },
  });

  const { data: divisions = [] } = useQuery<Division[]>({
    queryKey: ["/api/divisions"],
  });

  const { data: tournamentTypes = [] } = useQuery<TournamentType[]>({
    queryKey: ["/api/tournament-types"],
  });

  const { data: tournamentTeams = [] } = useQuery<Team[]>({
    queryKey: ["/api/admin/teams", finishingTournament?.id],
    queryFn: async () => {
      const url = finishingTournament
        ? `/api/admin/teams?tournamentId=${finishingTournament.id}`
        : "/api/admin/teams";
      const response = await fetch(url, { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar equipos");
      return response.json();
    },
    enabled: !!finishingTournament,
  });

  const createForm = useForm<InsertTournament>({
    resolver: zodResolver(insertTournamentSchema),
    defaultValues: {
      name: "",
      seasonName: "",
      location: "",
      startDate: new Date().toISOString().split("T")[0],
      status: "ACTIVO",
      divisionId: "",
    },
  });

  // Helper to get division name by id
  const getDivisionById = (divisionId?: string) => {
    if (!divisionId) return null;
    return divisions.find((d) => d.id === divisionId);
  };

  const editForm = useForm<Partial<InsertTournament>>({
    defaultValues: {},
  });

  const finishForm = useForm<{ championTeamId: string }>({
    resolver: zodResolver(finishTournamentSchema),
    defaultValues: {
      championTeamId: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertTournament) => {
      return apiRequest("POST", "/api/admin/tournaments", {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments/active"] });
      setShowCreateDialog(false);
      createForm.reset();
      toast({ title: "Torneo creado correctamente" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertTournament> }) => {
      return apiRequest("PUT", `/api/admin/tournaments/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments/active"] });
      setEditingTournament(null);
      toast({ title: "Torneo actualizado correctamente" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const finishMutation = useMutation({
    mutationFn: async ({ id, championTeamId }: { id: string; championTeamId: string }) => {
      return apiRequest("POST", `/api/admin/tournaments/${id}/finish`, { championTeamId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments/completed"] });
      setFinishingTournament(null);
      finishForm.reset();
      toast({ title: "Torneo finalizado correctamente" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/tournaments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments/completed"] });
      toast({ title: "Torneo eliminado correctamente" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const { data: scheduleTeams = [] } = useQuery<Team[]>({
    queryKey: ["/api/admin/teams", generatingSchedule?.id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/teams?tournamentId=${generatingSchedule!.id}`, { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar equipos");
      return response.json();
    },
    enabled: !!generatingSchedule,
  });

  const generateScheduleMutation = useMutation({
    mutationFn: async ({ id, doubleRound }: { id: string; doubleRound: boolean }) => {
      return apiRequest("POST", `/api/admin/tournaments/${id}/generate-schedule`, { doubleRound });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home/schedule"] });
      setGeneratingSchedule(null);
      setDoubleRound(false);
      toast({ title: "Calendario generado", description: data.message });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const openEditDialog = (tournament: Tournament) => {
    setEditingTournament(tournament);
    editForm.reset({
      name: tournament.name,
      seasonName: tournament.seasonName,
      location: tournament.location,
      startDate: tournament.startDate.split("T")[0],
      divisionId: tournament.divisionId || "",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  const activeTournaments = tournaments.filter((t) => t.status === "ACTIVO");
  const completedTournaments = tournaments.filter((t) => t.status === "FINALIZADO");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Gestión de Torneos</h2>
          <p className="text-sm text-muted-foreground">
            Crea y administra torneos de la liga
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-tournament" className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Torneo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Torneo</DialogTitle>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Torneo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Liga Primavera 2026" data-testid="input-tournament-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="seasonName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temporada</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Temporada Primavera 2026" data-testid="input-tournament-season" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lugar</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Ciudad Central" data-testid="input-tournament-location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Inicio</FormLabel>
                      <FormControl>
                        <Input type="date" data-testid="input-tournament-start-date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="divisionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>División</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-division">
                            <SelectValue placeholder="Selecciona una división" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {divisions.map((div) => (
                            <SelectItem key={div.id} value={div.id}>
                              <div className="flex items-center gap-2">
                                <Shield className={`h-4 w-4 ${div.theme === "PRIMERA" ? "text-amber-700 dark:text-amber-500" : "text-emerald-700 dark:text-emerald-500"}`} />
                                {div.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-tournament">
                    {createMutation.isPending ? "Creando..." : "Crear Torneo"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {activeTournaments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Torneos Activos
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeTournaments.map((tournament) => (
              <Card key={tournament.id} className="hover-elevate">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base truncate">{tournament.name}</CardTitle>
                      <CardDescription className="truncate">{tournament.seasonName}</CardDescription>
                    </div>
                    <Badge variant="default" className="shrink-0">Activo</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(() => {
                    const division = getDivisionById(tournament.divisionId);
                    return division ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className={`h-4 w-4 shrink-0 ${division.theme === "PRIMERA" ? "text-amber-700 dark:text-amber-500" : "text-emerald-700 dark:text-emerald-500"}`} />
                        <span className={`font-medium ${division.theme === "PRIMERA" ? "text-amber-800 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"}`}>
                          {division.name}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="h-4 w-4 shrink-0" />
                        <span className="italic">Sin división asignada</span>
                      </div>
                    );
                  })()}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">{tournament.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>Inicio: {formatDate(tournament.startDate)}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEditDialog(tournament)} data-testid={`button-edit-tournament-${tournament.id}`}>
                    <Edit className="mr-1 h-3 w-3" />
                    Editar
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setGeneratingSchedule(tournament)} data-testid={`button-generate-schedule-${tournament.id}`}>
                    <CalendarPlus className="mr-1 h-3 w-3" />
                    Generar Calendario
                  </Button>
                  <Button size="sm" variant="default" onClick={() => setFinishingTournament(tournament)} data-testid={`button-finish-tournament-${tournament.id}`}>
                    <Flag className="mr-1 h-3 w-3" />
                    Finalizar
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => {
                    if (confirm("¿Estás seguro de eliminar este torneo? Se eliminarán todos los equipos, partidos y datos asociados.")) {
                      deleteMutation.mutate(tournament.id);
                    }
                  }} data-testid={`button-delete-tournament-${tournament.id}`}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {completedTournaments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-700 dark:text-amber-500" />
            Torneos Finalizados
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completedTournaments.map((tournament) => (
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
                <CardContent className="space-y-2">
                  {(() => {
                    const division = getDivisionById(tournament.divisionId);
                    return division ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className={`h-4 w-4 shrink-0 ${division.theme === "PRIMERA" ? "text-amber-700 dark:text-amber-500" : "text-emerald-700 dark:text-emerald-500"}`} />
                        <span className={`font-medium ${division.theme === "PRIMERA" ? "text-amber-800 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"}`}>
                          {division.name}
                        </span>
                      </div>
                    ) : null;
                  })()}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">{tournament.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>Finalizó: {tournament.endDate ? formatDate(tournament.endDate) : "N/A"}</span>
                  </div>
                  {tournament.championTeamName && (
                    <div className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-400">
                      <Trophy className="h-4 w-4 shrink-0" />
                      <span className="truncate">Campeón: {tournament.championTeamName}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setViewingTournament(tournament)} data-testid={`button-view-tournament-${tournament.id}`}>
                    <Users className="mr-1 h-3 w-3" />
                    Ver Tabla Final
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => {
                    if (confirm("¿Estás seguro de eliminar este torneo del historial?")) {
                      deleteMutation.mutate(tournament.id);
                    }
                  }} data-testid={`button-delete-completed-tournament-${tournament.id}`}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tournaments.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay torneos creados.</p>
            <p className="text-sm text-muted-foreground">Crea un nuevo torneo para comenzar.</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!editingTournament} onOpenChange={() => setEditingTournament(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Torneo</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit((data) => {
              if (editingTournament) {
                updateMutation.mutate({ id: editingTournament.id, data });
              }
            })} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Torneo</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="seasonName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temporada</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lugar</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Inicio</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="divisionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>División</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger data-testid="edit-select-division">
                          <SelectValue placeholder="Selecciona una división" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {divisions.map((div) => (
                          <SelectItem key={div.id} value={div.id}>
                            <div className="flex items-center gap-2">
                              <Shield className={`h-4 w-4 ${div.theme === "PRIMERA" ? "text-amber-700 dark:text-amber-500" : "text-emerald-700 dark:text-emerald-500"}`} />
                              {div.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!finishingTournament} onOpenChange={() => setFinishingTournament(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Finalizar Torneo</DialogTitle>
            <DialogDescription>
              Selecciona el equipo campeón para finalizar el torneo. Se guardará la tabla de posiciones final.
            </DialogDescription>
          </DialogHeader>
          <Form {...finishForm}>
            <form onSubmit={finishForm.handleSubmit((data) => {
              if (finishingTournament) {
                finishMutation.mutate({ id: finishingTournament.id, championTeamId: data.championTeamId });
              }
            })} className="space-y-4">
              <FormField
                control={finishForm.control}
                name="championTeamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipo Campeón</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-champion-team">
                          <SelectValue placeholder="Selecciona el campeón" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tournamentTeams.map((team) => (
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
              <DialogFooter>
                <Button type="submit" disabled={finishMutation.isPending} data-testid="button-confirm-finish">
                  <Flag className="mr-2 h-4 w-4" />
                  {finishMutation.isPending ? "Finalizando..." : "Finalizar Torneo"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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

      <Dialog open={!!generatingSchedule} onOpenChange={() => { setGeneratingSchedule(null); setDoubleRound(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5" />
              Generar Calendario
            </DialogTitle>
            <DialogDescription>
              {generatingSchedule?.name} - Genera automáticamente los partidos del torneo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-medium">Equipos registrados: {scheduleTeams.length}</p>
              {scheduleTeams.length >= 2 && (
                <>
                  <p className="text-sm text-muted-foreground">
                    Se generarán {scheduleTeams.length - 1} jornadas con {Math.floor(scheduleTeams.length / 2)} partidos cada una.
                  </p>
                  {doubleRound && (
                    <p className="text-sm text-muted-foreground">
                      Con ida y vuelta: {(scheduleTeams.length - 1) * 2} jornadas en total.
                    </p>
                  )}
                </>
              )}
              {scheduleTeams.length < 2 && (
                <p className="text-sm text-destructive">Se necesitan al menos 2 equipos para generar el calendario.</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="doubleRound"
                checked={doubleRound}
                onCheckedChange={(checked) => setDoubleRound(checked === true)}
                data-testid="checkbox-double-round"
              />
              <label htmlFor="doubleRound" className="text-sm font-medium cursor-pointer">
                Ida y vuelta (dos vueltas completas)
              </label>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Advertencia:</strong> Generar el calendario eliminará todos los partidos existentes del torneo.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setGeneratingSchedule(null); setDoubleRound(false); }}>
              Cancelar
            </Button>
            <Button
              disabled={scheduleTeams.length < 2 || generateScheduleMutation.isPending}
              onClick={() => {
                if (generatingSchedule) {
                  generateScheduleMutation.mutate({ id: generatingSchedule.id, doubleRound });
                }
              }}
              data-testid="button-confirm-generate"
            >
              {generateScheduleMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Generar Partidos
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
