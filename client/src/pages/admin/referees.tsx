import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getAuthHeader } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, User, Phone, Mail, Building, Clock, FileText } from "lucide-react";
import type { RefereeProfile } from "@shared/schema";

interface RefereeProfileWithUser extends RefereeProfile {
  user: { id: string; name: string; email: string } | null;
}

const editRefereeSchema = z.object({
  fullName: z.string().min(1, "Nombre requerido"),
  identificationNumber: z.string().min(1, "Número de identificación requerido"),
  phone: z.string().min(1, "Teléfono requerido"),
  email: z.string().email("Email inválido"),
  association: z.string().optional(),
  yearsOfExperience: z.number().min(0).optional().nullable(),
  observations: z.string().optional(),
  status: z.enum(["ACTIVO", "INACTIVO"]),
});

type EditRefereeForm = z.infer<typeof editRefereeSchema>;

export default function RefereesManagement() {
  const { toast } = useToast();
  const [editingProfile, setEditingProfile] = useState<RefereeProfileWithUser | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<RefereeProfileWithUser | null>(null);

  const { data: profiles = [], isLoading } = useQuery<RefereeProfileWithUser[]>({
    queryKey: ["/api/admin/referees"],
    queryFn: async () => {
      const response = await fetch("/api/admin/referees", { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar árbitros");
      return response.json();
    },
  });

  const form = useForm<EditRefereeForm>({
    resolver: zodResolver(editRefereeSchema),
    defaultValues: {
      fullName: "",
      identificationNumber: "",
      phone: "",
      email: "",
      association: "",
      yearsOfExperience: null,
      observations: "",
      status: "ACTIVO",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<RefereeProfile> }) => {
      return apiRequest("PUT", `/api/admin/referees/${data.id}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/referees"] });
      setEditingProfile(null);
      toast({ title: "Árbitro actualizado", description: "Los datos del árbitro se han guardado correctamente." });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo actualizar el árbitro", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/referees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/referees"] });
      setDeleteConfirm(null);
      toast({ title: "Perfil eliminado", description: "El perfil del árbitro ha sido eliminado." });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo eliminar el perfil", variant: "destructive" });
    },
  });

  const openEditDialog = (profile: RefereeProfileWithUser) => {
    setEditingProfile(profile);
    form.reset({
      fullName: profile.fullName,
      identificationNumber: profile.identificationNumber,
      phone: profile.phone,
      email: profile.email,
      association: profile.association || "",
      yearsOfExperience: profile.yearsOfExperience ?? null,
      observations: profile.observations || "",
      status: profile.status as "ACTIVO" | "INACTIVO",
    });
  };

  const onSubmit = (data: EditRefereeForm) => {
    if (!editingProfile) return;
    updateMutation.mutate({
      id: editingProfile.id,
      updates: {
        ...data,
        yearsOfExperience: data.yearsOfExperience ?? undefined,
        association: data.association || undefined,
        observations: data.observations || undefined,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Catálogo de Árbitros</h2>
          <p className="text-muted-foreground">Gestiona la información de los árbitros registrados</p>
        </div>
        <Badge variant="secondary">{profiles.length} árbitros</Badge>
      </div>

      {profiles.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No hay árbitros registrados aún.</p>
            <p className="text-sm text-muted-foreground">Los árbitros completan su perfil desde su panel.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <Card key={profile.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{profile.fullName}</CardTitle>
                    <p className="text-sm text-muted-foreground truncate">{profile.user?.email || "Sin usuario"}</p>
                  </div>
                  <Badge variant={profile.status === "ACTIVO" ? "default" : "secondary"}>
                    {profile.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">ID: {profile.identificationNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{profile.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{profile.email}</span>
                  </div>
                  {profile.association && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{profile.association}</span>
                    </div>
                  )}
                  {profile.yearsOfExperience !== undefined && profile.yearsOfExperience !== null && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>{profile.yearsOfExperience} años de experiencia</span>
                    </div>
                  )}
                </div>
                {profile.observations && (
                  <p className="text-xs text-muted-foreground border-t pt-2 line-clamp-2">{profile.observations}</p>
                )}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => openEditDialog(profile)}
                    data-testid={`button-edit-referee-${profile.id}`}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteConfirm(profile)}
                    data-testid={`button-delete-referee-${profile.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editingProfile} onOpenChange={() => setEditingProfile(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Árbitro</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-referee-fullName" />
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
                    <FormLabel>Número de identificación *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-referee-identificationNumber" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-referee-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-referee-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ACTIVO">Activo</SelectItem>
                          <SelectItem value="INACTIVO">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico *</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" data-testid="input-referee-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="association"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asociación/Liga</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-referee-association" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="yearsOfExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Años de exp.</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          data-testid="input-referee-yearsOfExperience"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} data-testid="input-referee-observations" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingProfile(null)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save-referee">
                  {updateMutation.isPending ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Perfil</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            ¿Estás seguro de que deseas eliminar el perfil de <strong>{deleteConfirm?.fullName}</strong>?
            Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete-referee"
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
