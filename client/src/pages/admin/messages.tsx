import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getAuthHeader } from "@/lib/auth";
import type { ContactMessage } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Mail, Phone, User, Trash2, Eye, CheckCheck, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  NUEVO: { label: "Nuevo", variant: "default" },
  LEIDO: { label: "Leído", variant: "secondary" },
  RESPONDIDO: { label: "Respondido", variant: "outline" },
};

export default function MessagesManagement() {
  const { toast } = useToast();

  const { data: messages = [], isLoading } = useQuery<ContactMessage[]>({
    queryKey: ["/api/admin/messages"],
    queryFn: async () => {
      const response = await fetch("/api/admin/messages", { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar mensajes");
      return response.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PUT", `/api/admin/messages/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/messages"] });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo actualizar el estado", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/messages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/messages"] });
      toast({ title: "Mensaje eliminado" });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo eliminar el mensaje", variant: "destructive" });
    },
  });

  const newCount = messages.filter((m) => m.status === "NUEVO").length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2" data-testid="text-messages-title">
            <MessageSquare className="h-6 w-6 text-primary" />
            Mensajería
          </h2>
          <p className="text-muted-foreground">
            Mensajes de contacto recibidos desde la página principal
          </p>
        </div>
        {newCount > 0 && (
          <Badge data-testid="badge-new-messages">{newCount} nuevo{newCount > 1 ? "s" : ""}</Badge>
        )}
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No hay mensajes</p>
            <p className="text-sm text-muted-foreground">Los mensajes de contacto aparecerán aquí</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => {
            const config = statusConfig[msg.status] || statusConfig.NUEVO;
            return (
              <Card key={msg.id} className={msg.status === "NUEVO" ? "border-primary/30" : ""} data-testid={`card-message-${msg.id}`}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={config.variant} data-testid={`badge-status-${msg.id}`}>
                          {msg.status === "NUEVO" && <Clock className="h-3 w-3 mr-1" />}
                          {msg.status === "LEIDO" && <Eye className="h-3 w-3 mr-1" />}
                          {msg.status === "RESPONDIDO" && <CheckCheck className="h-3 w-3 mr-1" />}
                          {config.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(msg.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}
                        </span>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-3">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="font-medium truncate" data-testid={`text-contact-name-${msg.id}`}>{msg.contactName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="truncate" data-testid={`text-contact-phone-${msg.id}`}>{msg.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="truncate" data-testid={`text-contact-email-${msg.id}`}>{msg.email}</span>
                        </div>
                      </div>

                      <div className="rounded-md bg-muted/50 p-3">
                        <p className="text-sm whitespace-pre-wrap" data-testid={`text-contact-comments-${msg.id}`}>{msg.comments}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {msg.status === "NUEVO" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => updateStatusMutation.mutate({ id: msg.id, status: "LEIDO" })}
                          title="Marcar como leído"
                          data-testid={`button-mark-read-${msg.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {msg.status === "LEIDO" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => updateStatusMutation.mutate({ id: msg.id, status: "RESPONDIDO" })}
                          title="Marcar como respondido"
                          data-testid={`button-mark-replied-${msg.id}`}
                        >
                          <CheckCheck className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(msg.id)}
                        title="Eliminar mensaje"
                        data-testid={`button-delete-message-${msg.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
