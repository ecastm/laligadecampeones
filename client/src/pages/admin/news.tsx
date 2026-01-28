import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertNewsSchema, type InsertNews, type NewsWithAuthor, type Tournament, type MatchWithTeams } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getAuthHeader } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Newspaper, Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function NewsManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsWithAuthor | null>(null);

  const { data: news = [], isLoading } = useQuery<NewsWithAuthor[]>({
    queryKey: ["/api/admin/news"],
    queryFn: async () => {
      const response = await fetch("/api/admin/news", { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar noticias");
      return response.json();
    },
  });

  const { data: tournament } = useQuery<Tournament>({
    queryKey: ["/api/tournaments/active"],
  });

  const { data: matches = [] } = useQuery<MatchWithTeams[]>({
    queryKey: ["/api/admin/matches"],
    queryFn: async () => {
      const response = await fetch("/api/admin/matches", { headers: getAuthHeader() });
      if (!response.ok) return [];
      return response.json();
    },
  });

  const playedMatches = matches.filter((m) => m.status === "JUGADO");

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/news/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home/news"] });
      toast({ title: "Noticia eliminada" });
    },
    onError: () => {
      toast({ title: "Error al eliminar noticia", variant: "destructive" });
    },
  });

  const handleEdit = (item: NewsWithAuthor) => {
    setEditingNews(item);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingNews(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Noticias</h2>
          <p className="text-sm text-muted-foreground">
            Publica reseñas y resúmenes de los partidos jugados
          </p>
        </div>
        <Button onClick={handleCreate} data-testid="button-create-news">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Noticia
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            Noticias Publicadas ({news.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
            </div>
          ) : news.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No hay noticias publicadas. Crea la primera para informar sobre los partidos.
            </p>
          ) : (
            <div className="space-y-4">
              {news.map((item) => (
                <div
                  key={item.id}
                  className="rounded-md border p-4"
                  data-testid={`row-news-${item.id}`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{item.title}</h3>
                        {item.match && (
                          <Badge variant="outline" className="text-xs">
                            {item.match.homeTeam?.name} vs {item.match.awayTeam?.name}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Por {item.author.name} · {format(new Date(item.createdAt), "d MMM yyyy, HH:mm", { locale: es })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(item)}
                        data-testid={`button-edit-news-${item.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteMutation.mutate(item.id)}
                        data-testid={`button-delete-news-${item.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <NewsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        news={editingNews}
        tournamentId={tournament?.id || ""}
        playedMatches={playedMatches}
      />
    </div>
  );
}

function NewsDialog({
  open,
  onOpenChange,
  news,
  tournamentId,
  playedMatches,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  news: NewsWithAuthor | null;
  tournamentId: string;
  playedMatches: MatchWithTeams[];
}) {
  const { toast } = useToast();
  const isEditing = !!news;

  const form = useForm<InsertNews>({
    resolver: zodResolver(insertNewsSchema),
    defaultValues: {
      tournamentId: tournamentId,
      matchId: news?.matchId || "",
      title: news?.title || "",
      content: news?.content || "",
      imageUrl: news?.imageUrl || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertNews) => {
      return apiRequest("POST", "/api/admin/news", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home/news"] });
      toast({ title: "Noticia creada correctamente" });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertNews) => {
      return apiRequest("PUT", `/api/admin/news/${news!.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home/news"] });
      toast({ title: "Noticia actualizada correctamente" });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertNews) => {
    const payload = {
      ...data,
      tournamentId: tournamentId,
      matchId: data.matchId || undefined,
    };
    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Noticia" : "Nueva Noticia"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Gran victoria de Águilas FC en la Jornada 3"
                      data-testid="input-news-title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="matchId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Partido relacionado (opcional)</FormLabel>
                  <Select onValueChange={(val) => field.onChange(val === "none" ? "" : val)} value={field.value || "none"}>
                    <FormControl>
                      <SelectTrigger data-testid="select-news-match">
                        <SelectValue placeholder="Selecciona un partido" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Sin partido relacionado</SelectItem>
                      {playedMatches.map((match) => (
                        <SelectItem key={match.id} value={match.id}>
                          J{match.roundNumber}: {match.homeTeam?.name} {match.homeScore} - {match.awayScore} {match.awayTeam?.name}
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
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenido</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Escribe aquí la reseña del partido o la noticia..."
                      className="min-h-[200px] resize-none"
                      data-testid="input-news-content"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de imagen (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://ejemplo.com/imagen.jpg"
                      data-testid="input-news-image"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-submit-news"
            >
              {(createMutation.isPending || updateMutation.isPending)
                ? "Guardando..."
                : isEditing
                  ? "Actualizar Noticia"
                  : "Publicar Noticia"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
