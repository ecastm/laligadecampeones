import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, updateUserSchema, type InsertUser, type UpdateUser, type User, type Team } from "@shared/schema";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, UserCog, Pencil, ShieldAlert, ShieldCheck } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { z } from "zod";

type UserWithoutPassword = Omit<User, 'passwordHash'>;

export default function UsersManagement() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithoutPassword | null>(null);

  const { data: users = [], isLoading } = useQuery<UserWithoutPassword[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users", { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar usuarios");
      return response.json();
    },
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/admin/teams"],
    queryFn: async () => {
      const response = await fetch("/api/admin/teams", { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar equipos");
      return response.json();
    },
  });

  const createForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "CAPITAN",
      teamId: undefined,
    },
  });

  const editFormSchema = updateUserSchema.extend({
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional().or(z.literal("")),
  });

  const editForm = useForm<UpdateUser>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "CAPITAN",
      teamId: undefined,
      status: "ACTIVO",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      return apiRequest("POST", "/api/admin/users", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Usuario creado correctamente" });
      setIsCreateOpen(false);
      createForm.reset();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUser }) => {
      const payload = { ...data };
      if (!payload.password) {
        delete payload.password;
      }
      if (payload.teamId === "none") {
        payload.teamId = null;
      }
      return apiRequest("PUT", `/api/admin/users/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Usuario actualizado correctamente" });
      setEditingUser(null);
      editForm.reset();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Usuario eliminado" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PUT", `/api/admin/users/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Estado actualizado" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const openEditDialog = (user: UserWithoutPassword) => {
    setEditingUser(user);
    editForm.reset({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      teamId: user.teamId || undefined,
      status: user.status || "ACTIVO",
    });
  };

  const selectedCreateRole = createForm.watch("role");
  const selectedEditRole = editForm.watch("role");

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN": return <Badge variant="default" className="text-xs">Admin</Badge>;
      case "CAPITAN": return <Badge variant="secondary" className="text-xs">Capitán</Badge>;
      case "ARBITRO": return <Badge variant="outline" className="text-xs">Árbitro</Badge>;
      case "MARKETING": return <Badge className="text-xs bg-purple-600 hover:bg-purple-700">Marketing</Badge>;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "INACTIVO") {
      return <Badge variant="destructive" className="text-xs">Inactivo</Badge>;
    }
    return <Badge variant="outline" className="text-xs border-emerald-400 text-emerald-400">Activo</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold">Gestión de Usuarios</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Administra los usuarios del sistema
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (open) {
            createForm.reset({ name: "", email: "", password: "", role: "CAPITAN", teamId: undefined });
          }
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-user" className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Usuario</DialogTitle>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre completo" data-testid="input-user-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="usuario@email.com" data-testid="input-user-email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Contraseña" data-testid="input-user-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-user-role">
                            <SelectValue placeholder="Selecciona un rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ADMIN">Administrador</SelectItem>
                          <SelectItem value="CAPITAN">Capitán</SelectItem>
                          <SelectItem value="ARBITRO">Árbitro</SelectItem>
                          <SelectItem value="MARKETING">Marketing</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {selectedCreateRole === "CAPITAN" && (
                  <FormField
                    control={createForm.control}
                    name="teamId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Equipo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-user-team">
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
                )}
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-user">
                  {createMutation.isPending ? "Creando..." : "Crear Usuario"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => { if (!open) setEditingUser(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit((data) => {
              if (editingUser) updateMutation.mutate({ id: editingUser.id, data });
            })} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre completo" data-testid="input-edit-user-name" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="usuario@email.com" data-testid="input-edit-user-email" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva Contraseña (dejar vacío para no cambiar)</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Nueva contraseña" data-testid="input-edit-user-password" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "CAPITAN"}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-user-role">
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ADMIN">Administrador</SelectItem>
                        <SelectItem value="CAPITAN">Capitán</SelectItem>
                        <SelectItem value="ARBITRO">Árbitro</SelectItem>
                        <SelectItem value="MARKETING">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {selectedEditRole === "CAPITAN" && (
                <FormField
                  control={editForm.control}
                  name="teamId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-user-team">
                            <SelectValue placeholder="Selecciona un equipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Sin equipo</SelectItem>
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
              )}
              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-4 rounded-md border p-3">
                      <div className="flex items-center gap-2">
                        {field.value === "ACTIVO" ? (
                          <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <ShieldAlert className="h-4 w-4 text-destructive" />
                        )}
                        <Label>Estado de la cuenta</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {field.value === "ACTIVO" ? "Activo" : "Inactivo"}
                        </span>
                        <Switch
                          checked={field.value === "ACTIVO"}
                          onCheckedChange={(checked) => field.onChange(checked ? "ACTIVO" : "INACTIVO")}
                          data-testid="switch-edit-user-status"
                        />
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={updateMutation.isPending} data-testid="button-submit-edit-user">
                {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" />
            Usuarios del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : users.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No hay usuarios</p>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`flex flex-col gap-3 rounded-md border p-3 sm:p-4 sm:flex-row sm:items-center sm:justify-between ${
                    user.status === "INACTIVO" ? "opacity-60" : ""
                  }`}
                  data-testid={`row-user-${user.id}`}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full font-medium text-sm sm:text-base ${
                      user.status === "INACTIVO" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                    }`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{user.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
                    {getRoleBadge(user.role)}
                    {getStatusBadge(user.status || "ACTIVO")}
                    {user.role === "CAPITAN" && user.teamId && (
                      <Badge variant="outline" className="text-xs">
                        {teams.find(t => t.id === user.teamId)?.name || "Equipo"}
                      </Badge>
                    )}
                    <div className="flex items-center gap-1">
                      <Switch
                        checked={(user.status || "ACTIVO") === "ACTIVO"}
                        onCheckedChange={(checked) =>
                          toggleStatusMutation.mutate({
                            id: user.id,
                            status: checked ? "ACTIVO" : "INACTIVO",
                          })
                        }
                        data-testid={`switch-status-user-${user.id}`}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(user)}
                        data-testid={`button-edit-user-${user.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" data-testid={`button-delete-user-${user.id}`}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
                            <AlertDialogDescription>
                              ¿Estás seguro de que deseas eliminar a {user.name}? Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(user.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
