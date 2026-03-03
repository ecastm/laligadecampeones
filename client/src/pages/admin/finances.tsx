import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getAuthHeader } from "@/lib/auth";
import { 
  insertTeamPaymentSchema, 
  insertFinePaymentSchema, 
  insertExpenseSchema,
  FineTypeLabels,
  type FineType,
  type Tournament, 
  type Team, 
  type Fine,
  type Player,
  type PlayerSuspension,
  type TeamPayment,
  type FinePayment,
  type Expense,
  type InsertTeamPayment,
  type InsertFinePayment,
  type InsertExpense
} from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Plus, CreditCard, Receipt, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DatePicker } from "@/components/ui/date-picker";

export default function FinancesManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("fines");
  const [selectedTournament, setSelectedTournament] = useState<string>("");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isFinePaymentDialogOpen, setIsFinePaymentDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

  const { data: tournaments = [] } = useQuery<Tournament[]>({
    queryKey: ["/api/admin/tournaments"],
    queryFn: async () => {
      const res = await fetch("/api/admin/tournaments", { headers: getAuthHeader() });
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
  });

  const activeTournament = tournaments.find(t => t.status === "ACTIVO");
  const effectiveTournamentId = selectedTournament || activeTournament?.id || "";

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/admin/teams", effectiveTournamentId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/teams?tournamentId=${effectiveTournamentId}`, { headers: getAuthHeader() });
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
    enabled: !!effectiveTournamentId,
  });

  const { data: allPlayers = [] } = useQuery<Player[]>({
    queryKey: ["/api/admin/players"],
    queryFn: async () => {
      const res = await fetch("/api/admin/players", { headers: getAuthHeader() });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const getPlayerName = (playerId?: string | null) => {
    if (!playerId) return "—";
    const player = allPlayers.find(p => p.id === playerId);
    return player ? `${player.firstName} ${player.lastName}` : "Desconocido";
  };

  const { data: fines = [], isLoading: loadingFines } = useQuery<Fine[]>({
    queryKey: ["/api/admin/fines", effectiveTournamentId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/fines?tournamentId=${effectiveTournamentId}`, { headers: getAuthHeader() });
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
    enabled: !!effectiveTournamentId,
  });

  const { data: suspensions = [], isLoading: loadingSuspensions } = useQuery<PlayerSuspension[]>({
    queryKey: ["/api/admin/suspensions", effectiveTournamentId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/suspensions?tournamentId=${effectiveTournamentId}`, { headers: getAuthHeader() });
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
    enabled: !!effectiveTournamentId,
  });

  const getSuspensionPlayerName = (playerId: string) => {
    const player = allPlayers.find(p => p.id === playerId);
    return player ? `${player.firstName} ${player.lastName}` : "Desconocido";
  };

  const { data: payments = [], isLoading: loadingPayments } = useQuery<TeamPayment[]>({
    queryKey: ["/api/admin/payments", effectiveTournamentId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/payments?tournamentId=${effectiveTournamentId}`, { headers: getAuthHeader() });
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
    enabled: !!effectiveTournamentId,
  });

  const { data: finePayments = [], isLoading: loadingFinePayments } = useQuery<FinePayment[]>({
    queryKey: ["/api/admin/fine-payments", effectiveTournamentId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/fine-payments?tournamentId=${effectiveTournamentId}`, { headers: getAuthHeader() });
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
    enabled: !!effectiveTournamentId,
  });

  const { data: expenses = [], isLoading: loadingExpenses } = useQuery<Expense[]>({
    queryKey: ["/api/admin/expenses", effectiveTournamentId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/expenses?tournamentId=${effectiveTournamentId}`, { headers: getAuthHeader() });
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
    enabled: !!effectiveTournamentId,
  });

  const paymentForm = useForm<InsertTeamPayment>({
    resolver: zodResolver(insertTeamPaymentSchema),
    defaultValues: {
      tournamentId: effectiveTournamentId,
      teamId: "",
      amount: 0,
      method: "",
      notes: "",
      paidAt: new Date().toISOString().split('T')[0],
    },
  });

  const finePaymentForm = useForm<InsertFinePayment>({
    resolver: zodResolver(insertFinePaymentSchema),
    defaultValues: {
      tournamentId: effectiveTournamentId,
      teamId: "",
      amount: 0,
      notes: "",
      paidAt: new Date().toISOString().split('T')[0],
    },
  });

  const expenseForm = useForm<InsertExpense>({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: {
      tournamentId: effectiveTournamentId,
      concept: "",
      amount: 0,
      expenseAt: new Date().toISOString().split('T')[0],
      notes: "",
    },
  });

  const openPaymentDialog = () => {
    paymentForm.reset({
      tournamentId: effectiveTournamentId,
      teamId: "",
      amount: 0,
      method: "",
      notes: "",
      paidAt: new Date().toISOString().split('T')[0],
    });
    setIsPaymentDialogOpen(true);
  };

  const openFinePaymentDialog = () => {
    finePaymentForm.reset({
      tournamentId: effectiveTournamentId,
      teamId: "",
      amount: 0,
      notes: "",
      paidAt: new Date().toISOString().split('T')[0],
    });
    setIsFinePaymentDialogOpen(true);
  };

  const openExpenseDialog = () => {
    expenseForm.reset({
      tournamentId: effectiveTournamentId,
      concept: "",
      amount: 0,
      expenseAt: new Date().toISOString().split('T')[0],
      notes: "",
    });
    setIsExpenseDialogOpen(true);
  };

  const createPaymentMutation = useMutation({
    mutationFn: async (data: InsertTeamPayment) => {
      const payload = { ...data, tournamentId: effectiveTournamentId };
      const res = await apiRequest("POST", "/api/admin/payments", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
      toast({ title: "Pago registrado exitosamente" });
      setIsPaymentDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error al registrar pago", description: error.message, variant: "destructive" });
    },
  });

  const createFinePaymentMutation = useMutation({
    mutationFn: async (data: InsertFinePayment) => {
      const payload = { ...data, tournamentId: effectiveTournamentId };
      const res = await apiRequest("POST", "/api/admin/fine-payments", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fine-payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fines"] });
      toast({ title: "Pago de multa registrado exitosamente" });
      setIsFinePaymentDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error al registrar pago de multa", description: error.message, variant: "destructive" });
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (data: InsertExpense) => {
      const payload = { ...data, tournamentId: effectiveTournamentId };
      const res = await apiRequest("POST", "/api/admin/expenses", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/expenses"] });
      toast({ title: "Gasto registrado exitosamente" });
      setIsExpenseDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error al registrar gasto", description: error.message, variant: "destructive" });
    },
  });

  const updateFineMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PUT", `/api/admin/fines/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fines"] });
      toast({ title: "Multa actualizada" });
    },
    onError: (error: Error) => {
      toast({ title: "Error al actualizar multa", description: error.message, variant: "destructive" });
    },
  });

  const getTeamName = (teamId: string) => teams.find(t => t.id === teamId)?.name || "Desconocido";

  const totalFines = fines.reduce((acc, f) => acc + f.amount, 0);
  const totalFinesPaid = fines.filter(f => f.status === "PAGADA").reduce((acc, f) => acc + f.amount, 0);
  const totalPayments = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Gestión Financiera
              </CardTitle>
              <CardDescription>Multas, pagos y gastos del torneo</CardDescription>
            </div>
            <Select value={selectedTournament || activeTournament?.id || ""} onValueChange={setSelectedTournament}>
              <SelectTrigger className="w-[200px]" data-testid="select-tournament-finance">
                <SelectValue placeholder="Seleccionar torneo" />
              </SelectTrigger>
              <SelectContent>
                {tournaments.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">Multas Pendientes</p>
              <p className="text-2xl font-bold text-destructive">{(totalFines - totalFinesPaid).toLocaleString()}€</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">Multas Pagadas</p>
              <p className="text-2xl font-bold text-primary">{totalFinesPaid.toLocaleString()}€</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">Pagos Recibidos</p>
              <p className="text-2xl font-bold text-primary">{totalPayments.toLocaleString()}€</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">Gastos Totales</p>
              <p className="text-2xl font-bold">{totalExpenses.toLocaleString()}€</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
              <TabsTrigger value="fines" data-testid="tab-fines" className="text-xs sm:text-sm">Multas</TabsTrigger>
              <TabsTrigger value="suspensions" data-testid="tab-suspensions" className="text-xs sm:text-sm">Sanciones</TabsTrigger>
              <TabsTrigger value="payments" data-testid="tab-payments" className="text-xs sm:text-sm">Pagos Equipos</TabsTrigger>
              <TabsTrigger value="fine-payments" data-testid="tab-fine-payments" className="text-xs sm:text-sm">Pagos Multas</TabsTrigger>
              <TabsTrigger value="expenses" data-testid="tab-expenses" className="text-xs sm:text-sm">Gastos</TabsTrigger>
            </TabsList>

            <TabsContent value="fines" className="mt-4">
              {loadingFines ? (
                <Skeleton className="h-48" />
              ) : fines.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <AlertTriangle className="mx-auto h-12 w-12 opacity-50" />
                  <p className="mt-4">No hay multas registradas</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Equipo</TableHead>
                        <TableHead>Jugador</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fines.map((fine) => (
                        <TableRow key={fine.id} data-testid={`row-fine-${fine.id}`}>
                          <TableCell className="font-medium">{getTeamName(fine.teamId)}</TableCell>
                          <TableCell>{getPlayerName(fine.playerId)}</TableCell>
                          <TableCell>
                            <Badge variant={fine.cardType === "NO_PRESENTADO" ? "destructive" : fine.cardType === "YELLOW" ? "outline" : "destructive"} className={fine.cardType === "NO_PRESENTADO" ? "bg-orange-600" : ""}>
                              {FineTypeLabels[fine.cardType as FineType] || fine.cardType}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{fine.amount.toLocaleString()}€</TableCell>
                          <TableCell>
                            <Badge variant={fine.status === "PAGADA" ? "default" : "secondary"} className={fine.status === "PENDIENTE" ? "bg-destructive/20 text-destructive" : "bg-emerald-500/20 text-emerald-500"}>
                              {fine.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {fine.status === "PENDIENTE" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateFineMutation.mutate({ id: fine.id, status: "PAGADA" })}
                                data-testid={`button-pay-fine-${fine.id}`}
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Marcar Pagada
                              </Button>
                            )}
                            {fine.status === "PAGADA" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateFineMutation.mutate({ id: fine.id, status: "PENDIENTE" })}
                                data-testid={`button-unpay-fine-${fine.id}`}
                              >
                                Revertir
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="suspensions" className="mt-4">
              {loadingSuspensions ? (
                <Skeleton className="h-48" />
              ) : suspensions.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <ShieldAlert className="mx-auto h-12 w-12 opacity-50" />
                  <p className="mt-4">No hay sanciones registradas</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" data-testid="table-suspensions">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Equipo</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Jugador</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Motivo</th>
                        <th className="text-center py-3 px-2 font-medium text-muted-foreground">Partidos Restantes</th>
                        <th className="text-center py-3 px-2 font-medium text-muted-foreground">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suspensions.map(suspension => (
                        <tr key={suspension.id} className="border-b border-border/30" data-testid={`row-suspension-${suspension.id}`}>
                          <td className="py-3 px-2">{getTeamName(suspension.teamId)}</td>
                          <td className="py-3 px-2">{getSuspensionPlayerName(suspension.playerId)}</td>
                          <td className="py-3 px-2">{suspension.reason}</td>
                          <td className="py-3 px-2 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              suspension.matchesRemaining > 0 ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
                            }`}>
                              {suspension.matchesRemaining}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              suspension.status === "ACTIVO" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
                            }`}>
                              {suspension.status === "ACTIVO" ? "Sancionado" : "Cumplido"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="payments" className="mt-4">
              <div className="mb-4 flex justify-end">
                <Button onClick={openPaymentDialog} className="gap-2" data-testid="button-add-payment">
                  <Plus className="h-4 w-4" />
                  Registrar Pago
                </Button>
              </div>
              {loadingPayments ? (
                <Skeleton className="h-48" />
              ) : payments.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <CreditCard className="mx-auto h-12 w-12 opacity-50" />
                  <p className="mt-4">No hay pagos registrados</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Equipo</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Notas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{getTeamName(payment.teamId)}</TableCell>
                          <TableCell className="font-medium text-primary">{payment.amount.toLocaleString()}€</TableCell>
                          <TableCell>{payment.method || "-"}</TableCell>
                          <TableCell>{format(new Date(payment.paidAt), "dd/MM/yyyy", { locale: es })}</TableCell>
                          <TableCell className="max-w-xs truncate">{payment.notes || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="fine-payments" className="mt-4">
              <div className="mb-4 flex justify-end">
                <Button onClick={openFinePaymentDialog} className="gap-2" data-testid="button-add-fine-payment">
                  <Plus className="h-4 w-4" />
                  Registrar Pago de Multa
                </Button>
              </div>
              {loadingFinePayments ? (
                <Skeleton className="h-48" />
              ) : finePayments.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Receipt className="mx-auto h-12 w-12 opacity-50" />
                  <p className="mt-4">No hay pagos de multas registrados</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Equipo</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Notas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {finePayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{getTeamName(payment.teamId)}</TableCell>
                          <TableCell className="font-medium text-primary">{payment.amount.toLocaleString()}€</TableCell>
                          <TableCell>{format(new Date(payment.paidAt), "dd/MM/yyyy", { locale: es })}</TableCell>
                          <TableCell className="max-w-xs truncate">{payment.notes || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="expenses" className="mt-4">
              <div className="mb-4 flex justify-end">
                <Button onClick={openExpenseDialog} className="gap-2" data-testid="button-add-expense">
                  <Plus className="h-4 w-4" />
                  Registrar Gasto
                </Button>
              </div>
              {loadingExpenses ? (
                <Skeleton className="h-48" />
              ) : expenses.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Receipt className="mx-auto h-12 w-12 opacity-50" />
                  <p className="mt-4">No hay gastos registrados</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Concepto</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Notas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell className="font-medium">{expense.concept}</TableCell>
                          <TableCell className="text-destructive">{expense.amount.toLocaleString()}€</TableCell>
                          <TableCell>{format(new Date(expense.expenseAt), "dd/MM/yyyy", { locale: es })}</TableCell>
                          <TableCell className="max-w-xs truncate">{expense.notes || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago de Equipo</DialogTitle>
          </DialogHeader>
          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit((data) => createPaymentMutation.mutate(data))} className="space-y-4">
              <FormField
                control={paymentForm.control}
                name="teamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-payment-team">
                          <SelectValue placeholder="Selecciona equipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teams.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} data-testid="input-payment-amount" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pago</FormLabel>
                    <FormControl>
                      <Input placeholder="Efectivo, Transferencia, etc." {...field} data-testid="input-payment-method" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name="paidAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Pago</FormLabel>
                    <FormControl>
                      <DatePicker value={field.value} onChange={field.onChange} data-testid="input-payment-date" placeholder="Selecciona fecha de pago" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas (opcional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} data-testid="input-payment-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createPaymentMutation.isPending} data-testid="button-save-payment">
                  {createPaymentMutation.isPending ? "Guardando..." : "Registrar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isFinePaymentDialogOpen} onOpenChange={setIsFinePaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago de Multa</DialogTitle>
          </DialogHeader>
          <Form {...finePaymentForm}>
            <form onSubmit={finePaymentForm.handleSubmit((data) => createFinePaymentMutation.mutate(data))} className="space-y-4">
              <FormField
                control={finePaymentForm.control}
                name="teamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-fine-payment-team">
                          <SelectValue placeholder="Selecciona equipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teams.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={finePaymentForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} data-testid="input-fine-payment-amount" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={finePaymentForm.control}
                name="paidAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Pago</FormLabel>
                    <FormControl>
                      <DatePicker value={field.value} onChange={field.onChange} data-testid="input-fine-payment-date" placeholder="Selecciona fecha de pago" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={finePaymentForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas (opcional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} data-testid="input-fine-payment-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsFinePaymentDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createFinePaymentMutation.isPending} data-testid="button-save-fine-payment">
                  {createFinePaymentMutation.isPending ? "Guardando..." : "Registrar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Gasto</DialogTitle>
          </DialogHeader>
          <Form {...expenseForm}>
            <form onSubmit={expenseForm.handleSubmit((data) => createExpenseMutation.mutate(data))} className="space-y-4">
              <FormField
                control={expenseForm.control}
                name="concept"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Concepto</FormLabel>
                    <FormControl>
                      <Input placeholder="Arbitraje, Canchas, etc." {...field} data-testid="input-expense-concept" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={expenseForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} data-testid="input-expense-amount" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={expenseForm.control}
                name="expenseAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha del Gasto</FormLabel>
                    <FormControl>
                      <DatePicker value={field.value} onChange={field.onChange} data-testid="input-expense-date" placeholder="Selecciona fecha del gasto" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={expenseForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas (opcional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} data-testid="input-expense-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createExpenseMutation.isPending} data-testid="button-save-expense">
                  {createExpenseMutation.isPending ? "Guardando..." : "Registrar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
