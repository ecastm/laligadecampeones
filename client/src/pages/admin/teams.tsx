import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTeamSchema, insertPlayerSchema, type InsertTeam, type InsertPlayer, type Team, type Tournament, type User, type Player, type Division } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getAuthHeader } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Shield, Edit, User as UserIcon, Award, Users, ChevronDown, ChevronUp, Camera, IdCard, ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function TeamsManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [playerDialogTeamId, setPlayerDialogTeamId] = useState<string | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const { data: tournament } = useQuery<Tournament>({
    queryKey: ["/api/tournaments/active"],
  });

  const { data: teams = [], isLoading } = useQuery<Team[]>({
    queryKey: ["/api/admin/teams"],
    queryFn: async () => {
      const response = await fetch("/api/admin/teams", { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar equipos");
      return response.json();
    },
  });

  const { data: allPlayers = [] } = useQuery<Player[]>({
    queryKey: ["/api/admin/players"],
    queryFn: async () => {
      const response = await fetch("/api/admin/players", { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar jugadores");
      return response.json();
    },
  });

  const { data: users = [] } = useQuery<Omit<User, 'passwordHash'>[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users", { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar usuarios");
      return response.json();
    },
  });

  const { data: divisions = [] } = useQuery<Division[]>({
    queryKey: ["/api/divisions"],
    queryFn: async () => {
      const response = await fetch("/api/divisions", { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar divisiones");
      return response.json();
    },
  });

  const getDivisionName = (divisionId?: string) => {
    if (!divisionId) return null;
    const division = divisions.find(d => d.id === divisionId);
    return division ? { name: division.name, theme: division.theme } : null;
  };

  const getCaptainName = (captainUserId?: string) => {
    if (!captainUserId) return null;
    const captain = users.find(u => u.id === captainUserId);
    return captain?.name || null;
  };

  const getTeamPlayers = (teamId: string) => {
    return allPlayers.filter(p => p.teamId === teamId);
  };

  const toggleTeamExpanded = (teamId: string) => {
    setExpandedTeams(prev => {
      const next = new Set(prev);
      if (next.has(teamId)) {
        next.delete(teamId);
      } else {
        next.add(teamId);
      }
      return next;
    });
  };

  const form = useForm<Omit<InsertTeam, 'tournamentId'>>({
    resolver: zodResolver(insertTeamSchema.omit({ tournamentId: true })),
    defaultValues: {
      name: "",
      colors: "",
      homeField: "",
      logoUrl: "",
      coachName: "",
      divisionId: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<InsertTeam, 'tournamentId'>) => {
      return apiRequest("POST", "/api/admin/teams", { ...data, tournamentId: tournament?.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/teams"] });
      toast({ title: "Equipo creado correctamente" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertTeam> }) => {
      return apiRequest("PUT", `/api/admin/teams/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/teams"] });
      toast({ title: "Equipo actualizado" });
      setEditingTeam(null);
      form.reset();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/teams/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/teams"] });
      toast({ title: "Equipo eliminado" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const playerForm = useForm<InsertPlayer>({
    resolver: zodResolver(insertPlayerSchema),
    defaultValues: {
      teamId: "",
      firstName: "",
      lastName: "",
      jerseyNumber: 1,
      position: "",
      identificationId: "",
      photoUrls: [],
      isFederated: false,
      federationId: "",
      active: true,
    },
  });

  const createPlayerMutation = useMutation({
    mutationFn: async (data: InsertPlayer) => {
      return apiRequest("POST", "/api/admin/players", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/players"] });
      toast({ title: "Jugador agregado correctamente" });
      setPlayerDialogTeamId(null);
      playerForm.reset();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deletePlayerMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/players/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/players"] });
      toast({ title: "Jugador eliminado" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updatePlayerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertPlayer }) => {
      return apiRequest("PUT", `/api/admin/players/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/players"] });
      toast({ title: "Jugador actualizado correctamente" });
      closePlayerDialog();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const closePlayerDialog = () => {
    setPlayerDialogTeamId(null);
    setEditingPlayer(null);
    playerForm.reset();
  };

  const openPlayerDialog = (teamId: string) => {
    setEditingPlayer(null);
    playerForm.reset({
      teamId,
      firstName: "",
      lastName: "",
      jerseyNumber: 1,
      position: "",
      identificationId: "",
      photoUrls: [],
      isFederated: false,
      federationId: "",
      active: true,
    });
    setPlayerDialogTeamId(teamId);
  };

  const openEditPlayerDialog = (player: Player) => {
    setEditingPlayer(player);
    playerForm.reset({
      teamId: player.teamId,
      firstName: player.firstName,
      lastName: player.lastName,
      jerseyNumber: player.jerseyNumber,
      position: player.position || "",
      identificationId: player.identificationId || "",
      photoUrls: player.photoUrls || [],
      isFederated: player.isFederated || false,
      federationId: player.federationId || "",
      active: player.active,
    });
    setPlayerDialogTeamId(player.teamId);
  };

  const handlePlayerSubmit = (data: InsertPlayer) => {
    if (editingPlayer) {
      updatePlayerMutation.mutate({ id: editingPlayer.id, data });
    } else {
      createPlayerMutation.mutate(data);
    }
  };

  const openEditDialog = (team: Team) => {
    setEditingTeam(team);
    form.reset({
      name: team.name,
      colors: team.colors,
      homeField: team.homeField,
      logoUrl: team.logoUrl || "",
      coachName: team.coachName || "",
      divisionId: team.divisionId || "",
    });
  };

  const handleSubmit = (data: Omit<InsertTeam, 'tournamentId'>) => {
    if (editingTeam) {
      updateMutation.mutate({ id: editingTeam.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold">Gestión de Equipos</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Administra los equipos del torneo
          </p>
        </div>
        <Dialog open={isDialogOpen || !!editingTeam} onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false);
            setEditingTeam(null);
            form.reset();
          } else {
            setIsDialogOpen(true);
          }
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-team" className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Equipo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTeam ? "Editar Equipo" : "Crear Equipo"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="divisionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>División</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-team-division">
                            <SelectValue placeholder="Seleccionar división" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {divisions.map((division) => (
                            <SelectItem key={division.id} value={division.id}>
                              {division.name}
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del equipo" data-testid="input-team-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="colors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Colores</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Rojo y Blanco" data-testid="input-team-colors" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="homeField"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sede / Cancha</FormLabel>
                      <FormControl>
                        <Input placeholder="Campo de juego local" data-testid="input-team-field" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="coachName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entrenador</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del entrenador" data-testid="input-team-coach" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL del Logo (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." data-testid="input-team-logo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit-team"
                >
                  {createMutation.isPending || updateMutation.isPending ? "Guardando..." : editingTeam ? "Actualizar" : "Crear Equipo"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Equipos del Torneo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : teams.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No hay equipos registrados</p>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {teams.map((team) => {
                const teamPlayers = getTeamPlayers(team.id);
                const isExpanded = expandedTeams.has(team.id);
                
                return (
                  <Collapsible
                    key={team.id}
                    open={isExpanded}
                    onOpenChange={() => toggleTeamExpanded(team.id)}
                  >
                    <div
                      className="rounded-md border p-3 sm:p-4"
                      data-testid={`card-team-${team.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-md bg-primary/10 text-primary font-bold text-sm sm:text-base shrink-0">
                            {team.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-sm sm:text-base truncate">{team.name}</p>
                              {getDivisionName(team.divisionId) && (
                                <Badge 
                                  variant="outline" 
                                  className={getDivisionName(team.divisionId)?.theme === "PRIMERA" 
                                    ? "text-yellow-600 border-yellow-600 text-xs" 
                                    : "text-slate-500 border-slate-500 text-xs"}
                                >
                                  {getDivisionName(team.divisionId)?.name}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">{team.colors}</p>
                            <p className="text-xs text-muted-foreground mt-1 truncate">{team.homeField}</p>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs">
                              {getCaptainName(team.captainUserId) && (
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <UserIcon className="h-3 w-3" />
                                  <span>Capitán: {getCaptainName(team.captainUserId)}</span>
                                </span>
                              )}
                              {team.coachName && (
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <Award className="h-3 w-3" />
                                  <span>DT: {team.coachName}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(team)}
                            data-testid={`button-edit-team-${team.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-delete-team-${team.id}`}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Eliminar equipo</AlertDialogTitle>
                                <AlertDialogDescription>
                                  ¿Estás seguro de que deseas eliminar a {team.name}? Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(team.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-full justify-between" data-testid={`button-toggle-players-${team.id}`}>
                            <span className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>Jugadores ({teamPlayers.length})</span>
                            </span>
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="mt-2">
                          <div className="space-y-2">
                            {teamPlayers.length === 0 ? (
                              <p className="text-sm text-muted-foreground text-center py-2">No hay jugadores registrados</p>
                            ) : (
                              <div className="grid gap-1">
                                {teamPlayers.map((player) => (
                                  <div
                                    key={player.id}
                                    className="flex items-center justify-between py-2 px-3 rounded bg-muted/50"
                                    data-testid={`row-player-${player.id}`}
                                  >
                                    <div className="flex items-center gap-3">
                                      {player.photoUrls && player.photoUrls.length > 0 ? (
                                        <img 
                                          src={player.photoUrls[0]} 
                                          alt={`${player.firstName} ${player.lastName}`}
                                          className="h-10 w-10 rounded-full object-cover"
                                        />
                                      ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                                          {player.jerseyNumber}
                                        </div>
                                      )}
                                      <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                          <Badge variant="outline" className="text-xs">#{player.jerseyNumber}</Badge>
                                          <span className="text-sm font-medium">{player.firstName} {player.lastName}</span>
                                          {player.isFederated && (
                                            <Badge variant="secondary" className="text-xs">
                                              <ShieldCheck className="h-3 w-3 mr-1" />
                                              Federado
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                          {player.position && (
                                            <span>{player.position}</span>
                                          )}
                                          {player.identificationId && (
                                            <span className="flex items-center gap-1">
                                              <IdCard className="h-3 w-3" />
                                              {player.identificationId}
                                            </span>
                                          )}
                                          {player.federationId && (
                                            <span>Fed: {player.federationId}</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-7 w-7" 
                                        onClick={() => openEditPlayerDialog(player)}
                                        data-testid={`button-edit-player-${player.id}`}
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-7 w-7" data-testid={`button-delete-player-${player.id}`}>
                                            <Trash2 className="h-3 w-3 text-destructive" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Eliminar jugador</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              ¿Estás seguro de que deseas eliminar a {player.firstName} {player.lastName}?
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() => deletePlayerMutation.mutate(player.id)}
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
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => openPlayerDialog(team.id)}
                              data-testid={`button-add-player-${team.id}`}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Agregar Jugador
                            </Button>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={playerDialogTeamId !== null} onOpenChange={(open) => !open && closePlayerDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPlayer ? "Editar Jugador" : "Agregar Jugador"}</DialogTitle>
            <DialogDescription>
              {editingPlayer ? "Modificar los datos del jugador" : "Agregar un nuevo jugador al equipo"}
            </DialogDescription>
          </DialogHeader>
          <Form {...playerForm}>
            <form onSubmit={playerForm.handleSubmit(handlePlayerSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={playerForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre" data-testid="input-player-firstName" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={playerForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido</FormLabel>
                      <FormControl>
                        <Input placeholder="Apellido" data-testid="input-player-lastName" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={playerForm.control}
                  name="jerseyNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Camiseta</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={99}
                          data-testid="input-player-jerseyNumber"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={playerForm.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Posición</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Delantero, Portero" data-testid="input-player-position" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={playerForm.control}
                name="identificationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <IdCard className="h-4 w-4" />
                      Número de Identificación (DNI/INE)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 12345678" data-testid="input-player-identification" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={playerForm.control}
                name="photoUrls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      URL de Fotografía
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://ejemplo.com/foto.jpg" 
                        data-testid="input-player-photo"
                        value={field.value?.[0] || ""}
                        onChange={(e) => field.onChange(e.target.value ? [e.target.value] : [])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={playerForm.control}
                  name="isFederated"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>¿Federado?</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-player-federated"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={playerForm.control}
                  name="federationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Federación</FormLabel>
                      <FormControl>
                        <Input placeholder="Número de federación" data-testid="input-player-federation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createPlayerMutation.isPending || updatePlayerMutation.isPending}
                data-testid="button-submit-player"
              >
                {(createPlayerMutation.isPending || updatePlayerMutation.isPending) 
                  ? "Guardando..." 
                  : editingPlayer 
                    ? "Guardar Cambios" 
                    : "Agregar Jugador"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
