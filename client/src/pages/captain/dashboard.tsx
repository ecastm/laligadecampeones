import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTeamSchema, insertPlayerSchema, insertCaptainProfileSchema, type Team, type Player, type InsertPlayer, type MatchWithTeams, type CaptainProfile, type InsertCaptainProfile } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getAuthHeader } from "@/lib/auth";
import { SidebarProvider, SidebarTrigger, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, Calendar, LogOut, Plus, Trash2, Edit, Save, User, Camera, IdCard } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type CaptainSection = "team" | "players" | "schedule" | "profile";

const menuItems = [
  { id: "team" as const, title: "Mi Equipo", icon: Shield },
  { id: "players" as const, title: "Jugadores", icon: Users },
  { id: "schedule" as const, title: "Calendario", icon: Calendar },
  { id: "profile" as const, title: "Mi Perfil", icon: User },
];

export default function CaptainDashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState<CaptainSection>("team");

  const { data: captainProfile, isLoading: loadingProfile } = useQuery<CaptainProfile | null>({
    queryKey: ["/api/captain/profile"],
    queryFn: async () => {
      const response = await fetch("/api/captain/profile", { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar perfil");
      return response.json();
    },
  });

  const effectiveSection = (!loadingProfile && !captainProfile) ? "profile" : activeSection;
  const showProfileRequired = !loadingProfile && !captainProfile;

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Shield className="h-5 w-5" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold truncate">Panel Capitán</p>
                <p className="text-xs text-muted-foreground truncate">{user?.name}</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Mi Equipo</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveSection(item.id)}
                        isActive={effectiveSection === item.id}
                        data-testid={`nav-${item.id}`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <div className="mt-auto border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-muted-foreground"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </Sidebar>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-14 items-center justify-between gap-4 border-b bg-card px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-lg font-semibold">
                {menuItems.find(i => i.id === effectiveSection)?.title || "Mi Equipo"}
              </h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-6">
            {effectiveSection === "team" && <TeamInfo />}
            {effectiveSection === "players" && <TeamPlayers />}
            {effectiveSection === "schedule" && <TeamSchedule />}
            {effectiveSection === "profile" && <ProfileSection profile={captainProfile} />}
          </main>
        </div>
      </div>

      <ProfileRequiredDialog open={showProfileRequired} />
    </SidebarProvider>
  );
}

function TeamInfo() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const { data: team, isLoading } = useQuery<Team>({
    queryKey: ["/api/captain/team"],
    queryFn: async () => {
      const response = await fetch("/api/captain/team", { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar equipo");
      return response.json();
    },
  });

  const form = useForm({
    resolver: zodResolver(insertTeamSchema.omit({ tournamentId: true, captainUserId: true })),
    defaultValues: {
      name: "",
      colors: "",
      homeField: "",
      logoUrl: "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Team>) => {
      return apiRequest("PUT", "/api/captain/team", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/captain/team"] });
      toast({ title: "Equipo actualizado" });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return <Skeleton className="h-64" />;
  }

  if (!team) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No tienes un equipo asignado</p>
        </CardContent>
      </Card>
    );
  }

  if (isEditing) {
    if (!form.getValues().name) {
      form.reset({
        name: team.name,
        colors: team.colors,
        homeField: team.homeField,
        logoUrl: team.logoUrl || "",
      });
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Editar Equipo</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input data-testid="input-edit-team-name" {...field} />
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
                      <Input data-testid="input-edit-team-colors" {...field} />
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
                    <FormLabel>Sede</FormLabel>
                    <FormControl>
                      <Input data-testid="input-edit-team-field" {...field} />
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
                    <FormLabel>URL del Logo</FormLabel>
                    <FormControl>
                      <Input data-testid="input-edit-team-logo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save-team">
                  <Save className="mr-2 h-4 w-4" />
                  {updateMutation.isPending ? "Guardando..." : "Guardar"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-md bg-primary/10 text-primary font-bold text-xl sm:text-2xl shrink-0">
              {team.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <CardTitle data-testid="text-team-name" className="text-base sm:text-lg truncate">{team.name}</CardTitle>
              <CardDescription className="text-xs sm:text-sm truncate">{team.colors}</CardDescription>
            </div>
          </div>
          <Button variant="outline" onClick={() => setIsEditing(true)} data-testid="button-edit-team" className="w-full sm:w-auto">
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border p-4">
            <p className="text-sm text-muted-foreground">Sede</p>
            <p className="font-medium" data-testid="text-team-field">{team.homeField}</p>
          </div>
          <div className="rounded-md border p-4">
            <p className="text-sm text-muted-foreground">Colores</p>
            <p className="font-medium" data-testid="text-team-colors">{team.colors}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamPlayers() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: team } = useQuery<Team>({
    queryKey: ["/api/captain/team"],
    queryFn: async () => {
      const response = await fetch("/api/captain/team", { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar equipo");
      return response.json();
    },
  });

  const { data: players = [], isLoading } = useQuery<Player[]>({
    queryKey: ["/api/captain/players"],
    queryFn: async () => {
      const response = await fetch("/api/captain/players", { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar jugadores");
      return response.json();
    },
  });

  const form = useForm<Omit<InsertPlayer, 'teamId'>>({
    resolver: zodResolver(insertPlayerSchema.omit({ teamId: true })),
    defaultValues: {
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

  const createMutation = useMutation({
    mutationFn: async (data: Omit<InsertPlayer, 'teamId'>) => {
      return apiRequest("POST", "/api/captain/players", { ...data, teamId: team?.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/captain/players"] });
      toast({ title: "Jugador agregado" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/captain/players/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/captain/players"] });
      toast({ title: "Jugador eliminado" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold">Jugadores del Equipo</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Gestiona los jugadores de tu equipo</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-player" className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Jugador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Jugador</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input data-testid="input-player-firstname" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellido</FormLabel>
                        <FormControl>
                          <Input data-testid="input-player-lastname" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="jerseyNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={99}
                            data-testid="input-player-number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Posición</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Delantero" data-testid="input-player-position" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
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
                  control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-player">
                  {createMutation.isPending ? "Agregando..." : "Agregar Jugador"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Plantilla ({players.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : players.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No hay jugadores registrados</p>
          ) : (
            <div className="space-y-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex flex-col gap-3 rounded-md border p-3 sm:p-4 sm:flex-row sm:items-center sm:justify-between"
                  data-testid={`row-player-${player.id}`}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    {player.photoUrls && player.photoUrls.length > 0 ? (
                      <img 
                        src={player.photoUrls[0]} 
                        alt={`${player.firstName} ${player.lastName}`}
                        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border-2 border-primary shrink-0"
                      />
                    ) : (
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm sm:text-base shrink-0">
                        {player.jerseyNumber}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">#{player.jerseyNumber} {player.firstName} {player.lastName}</p>
                      <div className="flex flex-wrap items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                        <span>{player.position || "Sin posición"}</span>
                        {player.identificationId && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <IdCard className="h-3 w-3" />
                              {player.identificationId}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2">
                    <Badge variant={player.active ? "default" : "secondary"} className="text-xs">
                      {player.active ? "Activo" : "Inactivo"}
                    </Badge>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`button-delete-player-${player.id}`}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Eliminar jugador</AlertDialogTitle>
                          <AlertDialogDescription>
                            ¿Eliminar a {player.firstName} {player.lastName}?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(player.id)}
                            className="bg-destructive text-destructive-foreground"
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
    </div>
  );
}

function TeamSchedule() {
  const { data: matches = [], isLoading } = useQuery<MatchWithTeams[]>({
    queryKey: ["/api/captain/matches"],
    queryFn: async () => {
      const response = await fetch("/api/captain/matches", { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar partidos");
      return response.json();
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-bold">Calendario del Equipo</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">Partidos programados y resultados</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Partidos
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
                  <div className="flex items-start gap-3 sm:gap-4">
                    <Badge variant="outline" className="shrink-0 text-xs">J{match.roundNumber}</Badge>
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base">
                        {match.homeTeam?.name} vs {match.awayTeam?.name}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {format(new Date(match.dateTime), "d MMM yyyy, HH:mm", { locale: es })} · {match.field}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    {match.status === "JUGADO" && (
                      <Badge variant="default" className="text-xs">
                        {match.homeScore} - {match.awayScore}
                      </Badge>
                    )}
                    <Badge variant={match.status === "JUGADO" ? "default" : "secondary"} className="text-xs">
                      {match.status === "JUGADO" ? "Jugado" : "Programado"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileSection({ profile }: { profile: CaptainProfile | null | undefined }) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<InsertCaptainProfile>({
    resolver: zodResolver(insertCaptainProfileSchema),
    defaultValues: {
      fullName: "",
      identificationNumber: "",
      phone: "",
      email: "",
      address: "",
      emergencyContact: "",
      emergencyPhone: "",
      observations: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.fullName,
        identificationNumber: profile.identificationNumber,
        phone: profile.phone,
        email: profile.email,
        address: profile.address || "",
        emergencyContact: profile.emergencyContact || "",
        emergencyPhone: profile.emergencyPhone || "",
        observations: profile.observations || "",
      });
    }
  }, [profile, form]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertCaptainProfile) => {
      const response = await apiRequest("POST", "/api/captain/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/captain/profile"] });
      toast({ title: "Perfil creado exitosamente" });
      setIsEditing(false);
    },
    onError: () => {
      toast({ title: "Error al crear perfil", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertCaptainProfile>) => {
      const response = await apiRequest("PUT", "/api/captain/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/captain/profile"] });
      toast({ title: "Perfil actualizado exitosamente" });
      setIsEditing(false);
    },
    onError: () => {
      toast({ title: "Error al actualizar perfil", variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertCaptainProfile) => {
    if (profile) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Mi Perfil de Capitán
          </CardTitle>
          <CardDescription>
            Información personal requerida para identificación y contacto
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing || !profile ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-fullName" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="identificationNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Identificación *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-identificationNumber" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico *</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} data-testid="input-address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergencyContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contacto de Emergencia</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} data-testid="input-emergencyContact" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergencyPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono de Emergencia</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} data-testid="input-emergencyPhone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="observations"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Observaciones</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ""} data-testid="input-observations" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  {profile && (
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                  )}
                  <Button type="submit" disabled={isPending} data-testid="button-save-profile">
                    <Save className="h-4 w-4 mr-2" />
                    {isPending ? "Guardando..." : "Guardar Perfil"}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre Completo</p>
                  <p className="font-medium">{profile.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Número de Identificación</p>
                  <p className="font-medium">{profile.identificationNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{profile.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Correo Electrónico</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
                {profile.address && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Dirección</p>
                    <p className="font-medium">{profile.address}</p>
                  </div>
                )}
                {profile.emergencyContact && (
                  <div>
                    <p className="text-sm text-muted-foreground">Contacto de Emergencia</p>
                    <p className="font-medium">{profile.emergencyContact}</p>
                  </div>
                )}
                {profile.emergencyPhone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono de Emergencia</p>
                    <p className="font-medium">{profile.emergencyPhone}</p>
                  </div>
                )}
                {profile.observations && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Observaciones</p>
                    <p className="font-medium">{profile.observations}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setIsEditing(true)} variant="outline" data-testid="button-edit-profile">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileRequiredDialog({ open }: { open: boolean }) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 pointer-events-none">
      <Card className="max-w-md pointer-events-auto shadow-lg border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            Perfil Requerido
          </CardTitle>
          <CardDescription>
            Completa tu perfil de capitán con tus datos personales antes de continuar.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
