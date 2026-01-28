import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTournamentSchema, type InsertTournament, type Tournament } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getAuthHeader } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Save } from "lucide-react";

export default function TournamentManagement() {
  const { toast } = useToast();

  const { data: tournament, isLoading } = useQuery<Tournament>({
    queryKey: ["/api/tournaments/active"],
    queryFn: async () => {
      const response = await fetch("/api/tournaments/active", { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar torneo");
      return response.json();
    },
  });

  const form = useForm<Omit<InsertTournament, 'active'>>({
    resolver: zodResolver(insertTournamentSchema.omit({ active: true })),
    defaultValues: {
      name: "",
      seasonName: "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertTournament>) => {
      if (!tournament) throw new Error("No hay torneo activo");
      return apiRequest("PUT", `/api/admin/tournaments/${tournament.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments/active"] });
      toast({ title: "Torneo actualizado correctamente" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (tournament && !form.getValues().name) {
    form.reset({
      name: tournament.name,
      seasonName: tournament.seasonName,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Configuración del Torneo</h2>
        <p className="text-sm text-muted-foreground">
          Administra la información del torneo activo
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>{tournament?.name || "Sin torneo"}</CardTitle>
                <CardDescription>{tournament?.seasonName}</CardDescription>
              </div>
            </div>
            <Badge variant={tournament?.active ? "default" : "secondary"}>
              {tournament?.active ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Torneo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del torneo" data-testid="input-tournament-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seasonName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temporada</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Temporada 2026" data-testid="input-tournament-season" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                data-testid="button-save-tournament"
              >
                <Save className="mr-2 h-4 w-4" />
                {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
