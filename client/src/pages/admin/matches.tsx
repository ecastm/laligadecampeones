import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMatchSchema, type InsertMatch, type Match, type Team, type User, type Tournament } from "@shared/schema";
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
import { Plus, Trash2, Calendar, Edit } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DateTimePicker } from "@/components/ui/date-picker";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function MatchesManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  const { data: tournament } = useQuery<Tournament>({
    queryKey: ["/api/tournaments/active"],
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
    queryKey: ["/api/admin/matches"],
    queryFn: async () => {
      const response = await fetch("/api/admin/matches", { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar partidos");
      return response.json();
    },
  });

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
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<InsertMatch, 'tournamentId'>) => {
      return apiRequest("POST", "/api/admin/matches", { ...data, tournamentId: tournament?.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home/schedule"] });
      toast({ title: "Partido creado correctamente" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertMatch> }) => {
      return apiRequest("PUT", `/api/admin/matches/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home/schedule"] });
      toast({ title: "Partido actualizado" });
      setEditingMatch(null);
      form.reset();
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
      toast({ title: "Partido eliminado" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const openEditDialog = (match: Match) => {
    setEditingMatch(match);
    form.reset({
      roundNumber: match.roundNumber,
      dateTime: match.dateTime.slice(0, 16),
      field: match.field,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      refereeUserId: match.refereeUserId || "",
      status: match.status,
    });
  };

  const handleSubmit = (data: Omit<InsertMatch, 'tournamentId'>) => {
    if (editingMatch) {
      updateMutation.mutate({ id: editingMatch.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getTeamName = (id: string) => teams.find((t) => t.id === id)?.name || "N/A";
  const getRefereeName = (id?: string) => referees.find((r) => r.id === id)?.name || "Sin asignar";

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
            form.reset();
          } else {
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
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="homeTeamId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Equipo Local</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-home-team">
                              <SelectValue placeholder="Selecciona" />
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
                  <FormField
                    control={form.control}
                    name="awayTeamId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Equipo Visitante</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-away-team">
                              <SelectValue placeholder="Selecciona" />
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
                      <Badge variant="outline" className="shrink-0 text-xs">J{match.roundNumber}</Badge>
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base">
                          {getTeamName(match.homeTeamId)} vs {getTeamName(match.awayTeamId)}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {format(new Date(match.dateTime), "d MMM yyyy, HH:mm", { locale: es })} · {match.field}
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
    </div>
  );
}
