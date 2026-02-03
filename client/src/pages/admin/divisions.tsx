import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getAuthHeader } from "@/lib/auth";
import { insertDivisionSchema, type Division, type InsertDivision } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Shield } from "lucide-react";

export default function DivisionsManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);

  const { data: divisions = [], isLoading } = useQuery<Division[]>({
    queryKey: ["/api/admin/divisions"],
    queryFn: async () => {
      const res = await fetch("/api/admin/divisions", { headers: getAuthHeader() });
      if (!res.ok) throw new Error("Error al cargar divisiones");
      return res.json();
    },
  });

  const form = useForm<InsertDivision>({
    resolver: zodResolver(insertDivisionSchema),
    defaultValues: {
      name: "",
      theme: "PRIMERA",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertDivision) => {
      const res = await apiRequest("POST", "/api/admin/divisions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/divisions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/divisions"] });
      toast({ title: "División creada exitosamente" });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: "Error al crear división", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertDivision }) => {
      const res = await apiRequest("PUT", `/api/admin/divisions/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/divisions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/divisions"] });
      toast({ title: "División actualizada exitosamente" });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: "Error al actualizar división", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/divisions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/divisions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/divisions"] });
      toast({ title: "División eliminada exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al eliminar división", variant: "destructive" });
    },
  });

  const handleOpenCreate = () => {
    setEditingDivision(null);
    form.reset({
      name: "",
      theme: "PRIMERA",
      description: "",
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (division: Division) => {
    setEditingDivision(division);
    form.reset({
      name: division.name,
      theme: division.theme,
      description: division.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDivision(null);
    form.reset();
  };

  const onSubmit = (data: InsertDivision) => {
    if (editingDivision) {
      updateMutation.mutate({ id: editingDivision.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta división?")) {
      deleteMutation.mutate(id);
    }
  };

  const getThemeBadge = (theme: string) => {
    if (theme === "PRIMERA") {
      return <Badge className="bg-yellow-500 text-yellow-950">Primera</Badge>;
    }
    return <Badge className="bg-slate-500 text-slate-50">Segunda</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gestión de Divisiones
          </CardTitle>
          <Button onClick={handleOpenCreate} className="gap-2" data-testid="button-create-division">
            <Plus className="h-4 w-4" />
            Nueva División
          </Button>
        </CardHeader>
        <CardContent>
          {divisions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Shield className="mx-auto h-12 w-12 opacity-50" />
              <p className="mt-4">No hay divisiones registradas</p>
              <Button onClick={handleOpenCreate} variant="outline" className="mt-4">
                Crear primera división
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tema</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {divisions.map((division) => (
                    <TableRow key={division.id} data-testid={`row-division-${division.id}`}>
                      <TableCell className="font-medium">{division.name}</TableCell>
                      <TableCell>{getThemeBadge(division.theme)}</TableCell>
                      <TableCell className="max-w-xs truncate">{division.description || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(division)}
                            data-testid={`button-edit-division-${division.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(division.id)}
                            data-testid={`button-delete-division-${division.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDivision ? "Editar División" : "Nueva División"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Primera División" {...field} data-testid="input-division-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tema Visual</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-division-theme">
                          <SelectValue placeholder="Selecciona un tema" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PRIMERA">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-yellow-500" />
                            Primera (Dorado)
                          </div>
                        </SelectItem>
                        <SelectItem value="SEGUNDA">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-slate-500" />
                            Segunda (Plateado)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
                        placeholder="Descripción de la división..."
                        {...field}
                        data-testid="input-division-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-division"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Guardando..."
                    : editingDivision
                    ? "Actualizar"
                    : "Crear"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
