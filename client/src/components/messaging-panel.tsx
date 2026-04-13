import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const messageSchema = z.object({
  toUserIds: z.array(z.string()).optional().nullable(),
  subject: z.string().min(1, "El asunto es requerido"),
  content: z.string().min(1, "El mensaje es requerido"),
});

type MessageForm = z.infer<typeof messageSchema>;

interface User {
  id: string;
  email: string;
  role: string;
}

export default function MessagingPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);

  const form = useForm<MessageForm>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      toUserIds: undefined,
      subject: "",
      content: "",
    },
  });

  // Fetch users for admin selector
  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: () => apiRequest("/api/admin/users"),
    enabled: user?.role === "ADMIN",
  });

  const validRecipients = users.filter((u: any) => u.role === "ARBITRO" || u.role === "CAPITAN");

  // Fetch messages with polling
  const { data: messages = [], isLoading: messagesLoading, refetch } = useQuery({
    queryKey: ["/api/messages"],
    queryFn: () => apiRequest("/api/messages"),
    refetchInterval: 30000, // Poll every 30 seconds
  });

  // Track previous message count for notifications
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  
  useEffect(() => {
    if (!messagesLoading && messages) {
      const unreadMessages = messages.filter((m: any) => !m.readAt && m.toUserId === user?.id);
      if (unreadMessages.length > previousMessageCount && unreadMessages.length > 0) {
        // Show notification for new message
        const lastMessage = unreadMessages[unreadMessages.length - 1];
        showNotification(lastMessage);
      }
      setPreviousMessageCount(unreadMessages.length);
    }
  }, [messages, messagesLoading, user?.id, previousMessageCount]);

  const showNotification = (message: any) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification("Nuevo Mensaje - Liga de Campeones", {
        body: `${message.subject}: ${message.content.substring(0, 100)}...`,
        icon: "/favicon.png",
        badge: "/favicon.png",
        tag: `message-${message.id}`,
      });
      
      notification.onclick = () => {
        window.focus();
        // Could navigate to messages section
      };
    }
  };

  // Get users for dialog
  const handleOpenDialog = async () => {
    if (user?.role !== "ADMIN") {
      // For non-admin, we only need admin users
      try {
        // In a real app, you'd fetch admins. For now, just open dialog
        setIsDialogOpen(true);
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo cargar los destinatarios",
          variant: "destructive",
        });
      }
    } else {
      setIsDialogOpen(true);
    }
  };

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: MessageForm) => {
      return apiRequest("/api/messages", {
        method: "POST",
        body: JSON.stringify({
          toUserIds: data.toUserIds && data.toUserIds.length > 0 ? data.toUserIds : null,
          subject: data.subject,
          content: data.content,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Mensaje enviado correctamente",
      });
      form.reset();
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar el mensaje",
        variant: "destructive",
      });
    },
  });

  // Mark message as read
  const markReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      return apiRequest(`/api/messages/${messageId}/read`, {
        method: "PUT",
      });
    },
  });

  const onSubmit = (data: MessageForm) => {
    sendMessageMutation.mutate(data);
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "No soportado",
        description: "Tu navegador no soporta notificaciones",
        variant: "destructive",
      });
      return;
    }

    if (Notification.permission === "granted") {
      toast({
        title: "Ya habilitado",
        description: "Las notificaciones ya están habilitadas",
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        toast({
          title: "Éxito",
          description: "Notificaciones habilitadas para mensajes",
        });
      } else if (permission === "denied") {
        toast({
          title: "Denegado",
          description: "Notificaciones denegadas. Puedes habilitarlas en la configuración del navegador",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al solicitar permiso de notificaciones",
        variant: "destructive",
      });
    }
  };

  // Group messages by conversation
  const receivedMessages = messages.filter(
    (m: any) => m.toUserId === user?.id || m.toUserId === null
  );
  const sentMessages = messages.filter((m: any) => m.fromUserId === user?.id);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Mensajes</h2>
        </div>
        <div className="flex items-center gap-2">
          {typeof Notification !== "undefined" && Notification.permission !== "granted" && (
            <Button
              onClick={requestNotificationPermission}
              variant="outline"
              size="sm"
              className="gap-2"
              data-testid="button-enable-notifications"
            >
              🔔 Habilitar Notificaciones
            </Button>
          )}
          <Button
            onClick={handleOpenDialog}
            size="sm"
            className="gap-2"
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
            Nuevo Mensaje
          </Button>
        </div>
      </div>

      {messagesLoading ? (
        <div className="text-center py-8">Cargando mensajes...</div>
      ) : receivedMessages.length === 0 && sentMessages.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No hay mensajes
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Received messages */}
          {receivedMessages.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                Recibidos
              </h3>
              <div className="space-y-2">
                {receivedMessages.map((msg: any) => (
                  <Card
                    key={msg.id}
                    className={`p-3 cursor-pointer hover:bg-accent transition ${
                      !msg.readAt ? "border-primary bg-primary/5" : ""
                    }`}
                    data-testid={`message-received-${msg.id}`}
                    onClick={() => {
                      if (!msg.readAt) {
                        markReadMutation.mutate(msg.id);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">
                            {msg.subject}
                          </p>
                          {!msg.readAt && (
                            <Badge variant="default" className="text-xs">
                              Nuevo
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {msg.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Sent messages */}
          {sentMessages.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                Enviados
              </h3>
              <div className="space-y-2">
                {sentMessages.map((msg: any) => (
                  <Card
                    key={msg.id}
                    className="p-3 bg-muted/50"
                    data-testid={`message-sent-${msg.id}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{msg.subject}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {msg.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Send Message Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enviar Mensaje</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {user?.role === "ADMIN" && (
                <FormField
                  control={form.control}
                  name="toUserIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destinatarios (dejar vacío para enviar a todos)</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                            {validRecipients.length === 0 ? (
                              <p className="text-sm text-muted-foreground py-4 text-center">
                                No hay árbitros ni capitanes registrados
                              </p>
                            ) : (
                              validRecipients.map((u: any) => (
                                <label
                                  key={u.id}
                                  className="flex items-center gap-2 cursor-pointer hover:bg-accent p-2 rounded transition"
                                  data-testid={`checkbox-user-${u.id}`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={field.value?.includes(u.id) || false}
                                    onChange={(e) => {
                                      const current = field.value || [];
                                      if (e.target.checked) {
                                        field.onChange([...current, u.id]);
                                      } else {
                                        field.onChange(current.filter((id: string) => id !== u.id));
                                      }
                                    }}
                                    className="cursor-pointer"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{u.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                                    <Badge variant="outline" className="mt-1 text-xs">
                                      {u.role === "ARBITRO" ? "Árbitro" : "Capitán"}
                                    </Badge>
                                  </div>
                                </label>
                              ))
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {field.value && field.value.length > 0
                              ? `${field.value.length} usuario(s) seleccionado(s)`
                              : "Sin selección = enviar a todos"}
                          </p>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {user?.role !== "ADMIN" && (
                <div className="bg-muted p-3 rounded text-sm text-muted-foreground">
                  Tus mensajes serán enviados a administración
                </div>
              )}

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asunto</FormLabel>
                    <FormControl>
                      <Input placeholder="Asunto del mensaje" {...field} data-testid="input-message-subject" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensaje</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Escribe tu mensaje aquí"
                        rows={4}
                        {...field}
                        data-testid="textarea-message-content"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={sendMessageMutation.isPending}
                  data-testid="button-submit-message"
                >
                  {sendMessageMutation.isPending ? "Enviando..." : "Enviar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
