import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPlayerSchema, type InsertPlayer, type Player, type Team } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getAuthHeader } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Users, Camera, IdCard } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function PlayersManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>("all");

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/admin/teams"],
    queryFn: async () => {
      const response = await fetch("/api/admin/teams", { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar equipos");
      return response.json();
    },
  });

  const { data: players = [], isLoading } = useQuery<Player[]>({
    queryKey: ["/api/admin/players"],
    queryFn: async () => {
      const response = await fetch("/api/admin/players", { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar jugadores");
      return response.json();
    },
  });

  const form = useForm<InsertPlayer>({
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

  const createMutation = useMutation({
    mutationFn: async (data: InsertPlayer) => {
      return apiRequest("POST", "/api/admin/players", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/players"] });
      toast({ title: "Jugador creado correctamente" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
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

  const filteredPlayers = players.filter(
    (p) => selectedTeamFilter === "all" || p.teamId === selectedTeamFilter
  );

  const getTeamName = (teamId: string) => {
    return teams.find((t) => t.id === teamId)?.name || "Sin equipo";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Gestión de Jugadores</h2>
          <p className="text-sm text-muted-foreground">
            Administra los jugadores de todos los equipos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedTeamFilter} onValueChange={setSelectedTeamFilter}>
            <SelectTrigger className="w-[180px]" data-testid="select-filter-team">
              <SelectValue placeholder="Filtrar por equipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los equipos</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-player">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Jugador
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Jugador</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="teamId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Equipo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-player-team">
                              <SelectValue placeholder="Selecciona un equipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teams.map((team) => (
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
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre" data-testid="input-player-firstname" {...field} />
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
                            <Input placeholder="Apellido" data-testid="input-player-lastname" {...field} />
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
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createMutation.isPending}
                    data-testid="button-submit-player"
                  >
                    {createMutation.isPending ? "Creando..." : "Agregar Jugador"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Jugadores ({filteredPlayers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : filteredPlayers.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No hay jugadores registrados</p>
          ) : (
            <div className="space-y-2">
              {filteredPlayers.map((player) => (
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
                      <p className="font-medium text-sm sm:text-base truncate">
                        #{player.jerseyNumber} {player.firstName} {player.lastName}
                      </p>
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                        <span className="truncate">{getTeamName(player.teamId)}</span>
                        {player.position && (
                          <>
                            <span>·</span>
                            <span>{player.position}</span>
                          </>
                        )}
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
                  <div className="flex items-center justify-between sm:justify-end gap-3">
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
                            ¿Estás seguro de que deseas eliminar a {player.firstName} {player.lastName}?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(player.id)}
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
    </div>
  );
}
