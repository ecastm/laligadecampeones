import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMarketingMediaSchema, type InsertMarketingMedia, type MarketingMedia } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getAuthHeader } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Image, Video, ExternalLink, Upload, Loader2, Images, Share2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { SocialMediaEditor } from "@/components/social-media-editor";

async function uploadFile(file: File): Promise<string> {
  const token = localStorage.getItem("auth_token");
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch("/api/uploads/request-url", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({
      name: file.name,
      size: file.size,
      contentType: file.type || "application/octet-stream",
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Error al obtener URL de subida: ${res.status} ${errText}`);
  }

  const { uploadURL, objectPath } = await res.json();

  const uploadRes = await fetch(uploadURL, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type || "application/octet-stream" },
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text().catch(() => "");
    throw new Error(`Error al subir archivo: ${uploadRes.status} ${errText}`);
  }

  return objectPath;
}

export default function MarketingManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MarketingMedia | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const bulkInputRef = useRef<HTMLInputElement>(null);
  const [socialEditorOpen, setSocialEditorOpen] = useState(false);
  const [socialEditorMedia, setSocialEditorMedia] = useState<MarketingMedia | null>(null);

  const { data: media = [], isLoading } = useQuery<MarketingMedia[]>({
    queryKey: ["/api/admin/marketing"],
    queryFn: async () => {
      const response = await fetch("/api/admin/marketing", { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar contenido");
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/marketing/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing"] });
      toast({ title: "Contenido eliminado" });
    },
    onError: () => {
      toast({ title: "Error al eliminar contenido", variant: "destructive" });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este contenido?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (item: MarketingMedia) => {
    setEditingMedia(item);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingMedia(null);
    setIsDialogOpen(true);
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      toast({ title: "No se encontraron imágenes válidas", variant: "destructive" });
      if (bulkInputRef.current) bulkInputRef.current.value = "";
      return;
    }

    setIsBulkUploading(true);
    setBulkProgress({ current: 0, total: imageFiles.length });

    let successCount = 0;
    let errorCount = 0;

    try {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        setBulkProgress({ current: i + 1, total: imageFiles.length });

        try {
          const objectPath = await uploadFile(file);
          const title = file.name.replace(/\.[^/.]+$/, "");

          await apiRequest("POST", "/api/admin/marketing", {
            title,
            type: "PHOTO",
            url: objectPath,
          });
          successCount++;
        } catch (err) {
          errorCount++;
          console.error(`Error uploading ${file.name}:`, err);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing"] });

      if (errorCount === 0) {
        toast({ title: `${successCount} fotos subidas correctamente` });
      } else {
        toast({
          title: `Subida completada: ${successCount} exitosas, ${errorCount} con error`,
          variant: errorCount > 0 ? "destructive" : "default",
        });
      }
    } catch (err) {
      console.error("Error inesperado en subida masiva:", err);
      toast({ title: "Error inesperado al subir fotos", variant: "destructive" });
    } finally {
      setIsBulkUploading(false);
      setBulkProgress({ current: 0, total: 0 });
      if (bulkInputRef.current) bulkInputRef.current.value = "";
    }
  };

  const filteredMedia = filter === "all" ? media : media.filter(m => m.type === filter);
  const photos = media.filter(m => m.type === "PHOTO");
  const videos = media.filter(m => m.type === "VIDEO");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold" data-testid="text-marketing-title">Marketing</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona fotos y videos promocionales del torneo
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => bulkInputRef.current?.click()}
            className="gap-2"
            disabled={isBulkUploading}
            data-testid="button-bulk-upload"
          >
            {isBulkUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Images className="h-4 w-4" />
            )}
            {isBulkUploading ? `Subiendo ${bulkProgress.current}/${bulkProgress.total}...` : "Subida Masiva"}
          </Button>
          <input
            ref={bulkInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleBulkUpload}
            data-testid="input-bulk-upload"
          />
          <Button
            variant="outline"
            onClick={() => {
              setSocialEditorMedia(photos.length > 0 ? photos[0] : null);
              setSocialEditorOpen(true);
            }}
            className="gap-2"
            disabled={photos.length === 0}
            data-testid="button-open-social-editor"
          >
            <Share2 className="h-4 w-4" />
            Crear para Redes
          </Button>
          <Button onClick={handleCreate} className="gap-2" data-testid="button-add-media">
            <Plus className="h-4 w-4" />
            Agregar Contenido
          </Button>
        </div>
      </div>

      {isBulkUploading && bulkProgress.total > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Subiendo fotos...</span>
              <span className="text-muted-foreground">{bulkProgress.current} de {bulkProgress.total}</span>
            </div>
            <Progress value={(bulkProgress.current / bulkProgress.total) * 100} />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <Image className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-photo-count">{photos.length}</p>
              <p className="text-sm text-muted-foreground">Fotos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <Video className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-video-count">{videos.length}</p>
              <p className="text-sm text-muted-foreground">Videos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-total-count">{media.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">Todo ({media.length})</TabsTrigger>
          <TabsTrigger value="PHOTO" data-testid="tab-photos">Fotos ({photos.length})</TabsTrigger>
          <TabsTrigger value="VIDEO" data-testid="tab-videos">Videos ({videos.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-64 rounded-md" />
              ))}
            </div>
          ) : filteredMedia.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                {filter === "VIDEO" ? (
                  <Video className="h-12 w-12 text-muted-foreground mb-4" />
                ) : (
                  <Image className="h-12 w-12 text-muted-foreground mb-4" />
                )}
                <p className="text-muted-foreground">No hay contenido registrado</p>
                <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
                  <Button variant="outline" className="gap-2" onClick={handleCreate} data-testid="button-add-first">
                    <Plus className="h-4 w-4" />
                    Agregar contenido
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => bulkInputRef.current?.click()} data-testid="button-bulk-first">
                    <Images className="h-4 w-4" />
                    Subida masiva
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMedia.map((item) => (
                <Card key={item.id}>
                  <div className="relative aspect-video overflow-hidden rounded-t-md bg-muted">
                    {item.type === "PHOTO" ? (
                      <img
                        src={item.url}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "";
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Video className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2" variant={item.type === "PHOTO" ? "default" : "secondary"}>
                      {item.type === "PHOTO" ? "Foto" : "Video"}
                    </Badge>
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold truncate" data-testid={`text-media-title-${item.id}`}>{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(item.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}
                    </p>
                    <div className="flex items-center gap-2 pt-2 flex-wrap">
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="gap-1" data-testid={`button-view-${item.id}`}>
                          <ExternalLink className="h-3 w-3" />
                          Ver
                        </Button>
                      </a>
                      {item.type === "PHOTO" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => {
                            setSocialEditorMedia(item);
                            setSocialEditorOpen(true);
                          }}
                          data-testid={`button-social-${item.id}`}
                        >
                          <Share2 className="h-3 w-3" />
                          Redes
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => handleEdit(item)} data-testid={`button-edit-${item.id}`}>
                        <Pencil className="h-3 w-3" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-destructive"
                        onClick={() => handleDelete(item.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-${item.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <MediaFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingMedia={editingMedia}
      />

      <SocialMediaEditor
        open={socialEditorOpen}
        onOpenChange={setSocialEditorOpen}
        media={socialEditorMedia}
        allPhotos={photos}
      />
    </div>
  );
}

function MediaFormDialog({
  open,
  onOpenChange,
  editingMedia,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingMedia: MarketingMedia | null;
}) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<InsertMarketingMedia>({
    resolver: zodResolver(insertMarketingMediaSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "PHOTO",
      url: "",
      thumbnailUrl: "",
      tournamentId: "",
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const objectPath = await uploadFile(file);
      form.setValue("url", objectPath, { shouldValidate: true });

      if (!form.getValues("title")) {
        form.setValue("title", file.name.replace(/\.[^/.]+$/, ""));
      }

      toast({ title: "Archivo subido correctamente" });
    } catch (err) {
      toast({ title: "Error al subir archivo", variant: "destructive" });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: InsertMarketingMedia) => {
      const cleanData = {
        ...data,
        tournamentId: data.tournamentId || undefined,
        thumbnailUrl: data.thumbnailUrl || undefined,
        description: data.description || undefined,
      };
      if (editingMedia) {
        return apiRequest("PUT", `/api/admin/marketing/${editingMedia.id}`, cleanData);
      }
      return apiRequest("POST", "/api/admin/marketing", cleanData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing"] });
      toast({ title: editingMedia ? "Contenido actualizado" : "Contenido agregado" });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error al guardar contenido", variant: "destructive" });
    },
  });

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && editingMedia) {
      form.reset({
        title: editingMedia.title,
        description: editingMedia.description || "",
        type: editingMedia.type,
        url: editingMedia.url,
        thumbnailUrl: editingMedia.thumbnailUrl || "",
        tournamentId: editingMedia.tournamentId || "",
      });
    } else if (isOpen) {
      form.reset({
        title: "",
        description: "",
        type: "PHOTO",
        url: "",
        thumbnailUrl: "",
        tournamentId: "",
      });
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingMedia ? "Editar Contenido" : "Agregar Contenido"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título del contenido" {...field} data-testid="input-media-title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-media-type">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PHOTO">Foto</SelectItem>
                      <SelectItem value="VIDEO">Video</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {form.watch("type") === "VIDEO" ? "URL del Video" : "Foto"}
                  </FormLabel>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        disabled={isUploading}
                        onClick={() => document.getElementById("file-upload-input")?.click()}
                        data-testid="button-upload-file"
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        {isUploading ? "Subiendo..." : "Subir desde dispositivo"}
                      </Button>
                      <span className="text-xs text-muted-foreground">o pega una URL abajo</span>
                    </div>
                    <input
                      id="file-upload-input"
                      type="file"
                      accept={form.watch("type") === "VIDEO" ? "video/*" : "image/*"}
                      className="hidden"
                      onChange={handleFileUpload}
                      data-testid="input-file-upload"
                    />
                  </div>
                  <FormControl>
                    <Input
                      placeholder={form.watch("type") === "VIDEO" ? "https://youtube.com/watch?v=..." : "https://ejemplo.com/foto.jpg"}
                      {...field}
                      data-testid="input-media-url"
                    />
                  </FormControl>
                  {field.value && form.watch("type") === "PHOTO" && (
                    <div className="mt-2 rounded-md overflow-hidden border aspect-video bg-muted">
                      <img
                        src={field.value}
                        alt="Vista previa"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción del contenido..."
                      {...field}
                      data-testid="input-media-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2 flex-wrap">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending} data-testid="button-save-media">
                {createMutation.isPending ? "Guardando..." : editingMedia ? "Actualizar" : "Agregar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
