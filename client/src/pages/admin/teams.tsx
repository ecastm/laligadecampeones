import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTeamSchema, type InsertTeam, type Team, type Tournament, type User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getAuthHeader } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Shield, Edit, User as UserIcon, Award } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function TeamsManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

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

  const { data: users = [] } = useQuery<Omit<User, 'passwordHash'>[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users", { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar usuarios");
      return response.json();
    },
  });

  const getCaptainName = (captainUserId?: string) => {
    if (!captainUserId) return null;
    const captain = users.find(u => u.id === captainUserId);
    return captain?.name || null;
  };

  const form = useForm<Omit<InsertTeam, 'tournamentId'>>({
    resolver: zodResolver(insertTeamSchema.omit({ tournamentId: true })),
    defaultValues: {
      name: "",
      colors: "",
      homeField: "",
      logoUrl: "",
      coachName: "",
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

  const openEditDialog = (team: Team) => {
    setEditingTeam(team);
    form.reset({
      name: team.name,
      colors: team.colors,
      homeField: team.homeField,
      logoUrl: team.logoUrl || "",
      coachName: team.coachName || "",
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
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-start justify-between rounded-md border p-3 sm:p-4"
                  data-testid={`card-team-${team.id}`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-md bg-primary/10 text-primary font-bold text-sm sm:text-base shrink-0">
                      {team.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm sm:text-base truncate">{team.name}</p>
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
