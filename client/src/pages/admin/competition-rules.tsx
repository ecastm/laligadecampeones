import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getAuthHeader } from "@/lib/auth";
import {
  insertCompetitionRuleSchema,
  insertCompetitionSeasonSchema,
  type CompetitionRule,
  type CompetitionSeason,
  type StandingsEntry,
  type BracketMatch,
  type DivisionMovement,
  type Division,
  type Tournament,
  CompetitionFormatLabels,
  BracketPhaseLabels,
  type InsertCompetitionRule,
} from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Settings, Plus, RefreshCw, Lock, Trophy, ArrowUpDown, ArrowUp, ArrowDown, Swords } from "lucide-react";
import { z } from "zod";

export default function CompetitionRulesManagement() {
  const { toast } = useToast();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [rulesDialogOpen, setRulesDialogOpen] = useState(false);
  const [seasonDialogOpen, setSeasonDialogOpen] = useState(false);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("rules");

  const { data: divisions = [], isLoading: loadingDivisions } = useQuery<Division[]>({
    queryKey: ["/api/admin/divisions"],
    queryFn: async () => {
      const res = await fetch("/api/admin/divisions", { headers: getAuthHeader() });
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
  });

  const { data: tournaments = [] } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments/active/all"],
    queryFn: async () => {
      const res = await fetch("/api/tournaments/active/all", { headers: getAuthHeader() });
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
  });

  const { data: currentRules, isLoading: loadingRules } = useQuery<CompetitionRule | null>({
    queryKey: ["/api/admin/competition-rules", selectedCategoryId],
    queryFn: async () => {
      if (!selectedCategoryId) return null;
      const res = await fetch(`/api/admin/competition-rules/${selectedCategoryId}`, { headers: getAuthHeader() });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!selectedCategoryId,
  });

  const { data: seasons = [] } = useQuery<CompetitionSeason[]>({
    queryKey: ["/api/admin/seasons", selectedCategoryId],
    queryFn: async () => {
      if (!selectedCategoryId) return [];
      const res = await fetch(`/api/admin/seasons?categoryId=${selectedCategoryId}`, { headers: getAuthHeader() });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedCategoryId,
  });

  const { data: standings = [] } = useQuery<StandingsEntry[]>({
    queryKey: ["/api/admin/seasons", selectedSeasonId, "standings"],
    queryFn: async () => {
      if (!selectedSeasonId) return [];
      const res = await fetch(`/api/admin/seasons/${selectedSeasonId}/standings`, { headers: getAuthHeader() });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedSeasonId,
  });

  const { data: bracketMatches = [] } = useQuery<BracketMatch[]>({
    queryKey: ["/api/admin/seasons", selectedSeasonId, "bracket"],
    queryFn: async () => {
      if (!selectedSeasonId) return [];
      const res = await fetch(`/api/admin/seasons/${selectedSeasonId}/bracket`, { headers: getAuthHeader() });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedSeasonId,
  });

  const { data: movements = [] } = useQuery<DivisionMovement[]>({
    queryKey: ["/api/admin/seasons", selectedSeasonId, "movements"],
    queryFn: async () => {
      if (!selectedSeasonId) return [];
      const res = await fetch(`/api/admin/seasons/${selectedSeasonId}/movements`, { headers: getAuthHeader() });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedSeasonId,
  });

  const ruleForm = useForm<InsertCompetitionRule>({
    resolver: zodResolver(insertCompetitionRuleSchema),
    defaultValues: {
      categoryId: "",
      formatType: "LEAGUE_DIVISIONS",
      pointsWin: 3,
      pointsDraw: 1,
      pointsLoss: 0,
      roundRobin: "double",
      teamsPerDivision: 10,
      promotionCount: 2,
      relegationCount: 2,
      federatedLimit: 3,
    },
  });

  const seasonForm = useForm({
    resolver: zodResolver(insertCompetitionSeasonSchema),
    defaultValues: {
      categoryId: "",
      tournamentId: "",
      rulesId: "",
      name: "",
    },
  });

  const activateSeasonMutation = useMutation({
    mutationFn: async (seasonId: string) => {
      const res = await apiRequest("POST", `/api/admin/seasons/${seasonId}/activate`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seasons", selectedCategoryId] });
      toast({ title: "Temporada activada" });
    },
    onError: (err: any) => {
      toast({ title: err.message || "Error al activar temporada", variant: "destructive" });
    },
  });

  const saveRuleMutation = useMutation({
    mutationFn: async (data: InsertCompetitionRule) => {
      const payload = { ...data };
      if (payload.formatType === "TOURNEY_PLUS30" && !payload.plus30Rules) {
        payload.plus30Rules = {
          eliminatePosition: 10,
          directToSemisPosition: 1,
          repechagePositions: [2, 3, 4, 5, 6, 7, 8, 9],
          repechagePairing: "random_seeded",
          cuartosPairing: "random_seeded",
          semisPairing: "includes_first_place",
          tiebreaker: "admin_select_winner",
        };
      }
      if (currentRules) {
        const res = await apiRequest("PUT", `/api/admin/competition-rules/${currentRules.id}`, payload);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/admin/competition-rules", payload);
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/competition-rules", selectedCategoryId] });
      toast({ title: "Reglas guardadas correctamente" });
      setRulesDialogOpen(false);
    },
    onError: (err: any) => {
      toast({ title: err.message || "Error al guardar reglas", variant: "destructive" });
    },
  });

  const createSeasonMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertCompetitionSeasonSchema>) => {
      const res = await apiRequest("POST", "/api/admin/seasons", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seasons", selectedCategoryId] });
      toast({ title: "Temporada creada" });
      setSeasonDialogOpen(false);
    },
    onError: (err: any) => {
      toast({ title: err.message || "Error al crear temporada", variant: "destructive" });
    },
  });

  const recalculateMutation = useMutation({
    mutationFn: async (seasonId: string) => {
      const res = await apiRequest("POST", `/api/admin/seasons/${seasonId}/recalculate`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seasons", selectedSeasonId, "standings"] });
      toast({ title: "Clasificación recalculada" });
    },
    onError: (err: any) => {
      toast({ title: err.message || "Error al recalcular", variant: "destructive" });
    },
  });

  const generateBracketMutation = useMutation({
    mutationFn: async (seasonId: string) => {
      const res = await apiRequest("POST", `/api/admin/seasons/${seasonId}/bracket/generate`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seasons", selectedSeasonId, "bracket"] });
      toast({ title: "Cuadro de eliminatorias generado" });
    },
    onError: (err: any) => {
      toast({ title: err.message || "Error al generar bracket", variant: "destructive" });
    },
  });

  const closeSeasonMutation = useMutation({
    mutationFn: async (seasonId: string) => {
      const res = await apiRequest("POST", `/api/admin/seasons/${seasonId}/close`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seasons", selectedCategoryId] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seasons", selectedSeasonId, "movements"] });
      toast({ title: "Temporada cerrada" });
    },
    onError: (err: any) => {
      toast({ title: err.message || "Error al cerrar temporada", variant: "destructive" });
    },
  });

  const bracketResultMutation = useMutation({
    mutationFn: async (data: { matchId: string; homeScore: number; awayScore: number; winnerId: string; seasonId: string }) => {
      const res = await apiRequest("PUT", `/api/admin/bracket-matches/${data.matchId}/result`, {
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        winnerId: data.winnerId,
        seasonId: data.seasonId,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seasons", selectedSeasonId, "bracket"] });
      toast({ title: "Resultado registrado" });
    },
    onError: (err: any) => {
      toast({ title: err.message || "Error al registrar resultado", variant: "destructive" });
    },
  });

  const openRulesDialog = () => {
    if (currentRules) {
      ruleForm.reset({
        categoryId: currentRules.categoryId,
        formatType: currentRules.formatType as any,
        pointsWin: currentRules.pointsWin,
        pointsDraw: currentRules.pointsDraw,
        pointsLoss: currentRules.pointsLoss,
        roundRobin: currentRules.roundRobin as any,
        teamsPerDivision: currentRules.teamsPerDivision,
        promotionCount: currentRules.promotionCount ?? 2,
        relegationCount: currentRules.relegationCount ?? 2,
        federatedLimit: currentRules.federatedLimit,
        plus30Rules: currentRules.plus30Rules as any,
      });
    } else {
      ruleForm.reset({
        categoryId: selectedCategoryId,
        formatType: "LEAGUE_DIVISIONS",
        pointsWin: 3,
        pointsDraw: 1,
        pointsLoss: 0,
        roundRobin: "double",
        teamsPerDivision: 10,
        promotionCount: 2,
        relegationCount: 2,
        federatedLimit: 3,
      });
    }
    setRulesDialogOpen(true);
  };

  const openSeasonDialog = () => {
    seasonForm.reset({
      categoryId: selectedCategoryId,
      tournamentId: "",
      rulesId: currentRules?.id || "",
      name: "",
    });
    setSeasonDialogOpen(true);
  };

  const selectedSeason = seasons.find(s => s.id === selectedSeasonId);

  if (loadingDivisions) {
    return <div className="p-6 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary" data-testid="text-competition-title">Competición</h2>
          <p className="text-sm text-[#C0C0C0]">Reglas, temporadas, clasificación y eliminatorias</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {divisions.map(div => (
          <Button
            key={div.id}
            variant={selectedCategoryId === div.id ? "default" : "outline"}
            onClick={() => { setSelectedCategoryId(div.id); setSelectedSeasonId(null); }}
            data-testid={`button-category-${div.id}`}
            className={selectedCategoryId === div.id ? "bg-primary text-black" : "border-primary/30 text-[#C0C0C0]"}
          >
            {div.name}
          </Button>
        ))}
      </div>

      {!selectedCategoryId && (
        <Card className="border-primary/20 bg-[#1a1a1a]">
          <CardContent className="p-8 text-center text-[#C0C0C0]">
            Selecciona una categoría para gestionar sus reglas de competición
          </CardContent>
        </Card>
      )}

      {selectedCategoryId && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#1a1a1a] border border-primary/20">
            <TabsTrigger value="rules" data-testid="tab-rules" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              <Settings className="h-4 w-4 mr-1" /> Reglas
            </TabsTrigger>
            <TabsTrigger value="seasons" data-testid="tab-seasons" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              <Trophy className="h-4 w-4 mr-1" /> Temporadas
            </TabsTrigger>
            <TabsTrigger value="standings" data-testid="tab-standings" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              <ArrowUpDown className="h-4 w-4 mr-1" /> Clasificación
            </TabsTrigger>
            {currentRules?.formatType === "TOURNEY_PLUS30" && (
              <TabsTrigger value="bracket" data-testid="tab-bracket" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                <Swords className="h-4 w-4 mr-1" /> Eliminatorias
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="rules">
            <Card className="border-primary/20 bg-[#1a1a1a]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-primary">Reglas de Competición</CardTitle>
                  <CardDescription className="text-[#C0C0C0]">
                    {currentRules ? `Versión ${currentRules.rulesVersion} — ${CompetitionFormatLabels[currentRules.formatType]}` : "Sin reglas configuradas"}
                  </CardDescription>
                </div>
                <Button onClick={openRulesDialog} className="bg-primary text-black hover:bg-primary/90" data-testid="button-edit-rules">
                  <Settings className="h-4 w-4 mr-1" /> {currentRules ? "Editar" : "Configurar"}
                </Button>
              </CardHeader>
              {currentRules && (
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <RuleCard label="Formato" value={currentRules.roundRobin === "double" ? "Doble Vuelta" : "Ida"} />
                    <RuleCard label="Victoria" value={`${currentRules.pointsWin} pts`} />
                    <RuleCard label="Empate" value={`${currentRules.pointsDraw} pts`} />
                    <RuleCard label="Derrota" value={`${currentRules.pointsLoss} pts`} />
                    <RuleCard label="Equipos/División" value={`${currentRules.teamsPerDivision}`} />
                    <RuleCard label="Federados Max" value={`${currentRules.federatedLimit}`} />
                    {currentRules.promotionCount != null && <RuleCard label="Ascienden" value={`${currentRules.promotionCount}`} />}
                    {currentRules.relegationCount != null && <RuleCard label="Descienden" value={`${currentRules.relegationCount}`} />}
                  </div>
                </CardContent>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="seasons">
            <Card className="border-primary/20 bg-[#1a1a1a]">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-primary">Temporadas</CardTitle>
                <Button onClick={openSeasonDialog} className="bg-primary text-black hover:bg-primary/90" disabled={!currentRules} data-testid="button-create-season">
                  <Plus className="h-4 w-4 mr-1" /> Nueva Temporada
                </Button>
              </CardHeader>
              <CardContent>
                {seasons.length === 0 ? (
                  <p className="text-center text-[#C0C0C0] py-4">No hay temporadas creadas</p>
                ) : (
                  <div className="space-y-3">
                    {seasons.map(season => (
                      <div
                        key={season.id}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedSeasonId === season.id ? "border-primary bg-primary/10" : "border-primary/20 hover:border-primary/40"}`}
                        onClick={() => setSelectedSeasonId(season.id)}
                        data-testid={`card-season-${season.id}`}
                      >
                        <div>
                          <p className="font-medium">{season.name}</p>
                          <p className="text-xs text-[#C0C0C0]">Versión reglas: {season.rulesVersion}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={season.status === "active" ? "default" : season.status === "closed" ? "secondary" : "outline"} data-testid={`badge-season-status-${season.id}`}>
                            {season.status === "draft" ? "Borrador" : season.status === "active" ? "Activa" : "Cerrada"}
                          </Badge>
                          {selectedSeasonId === season.id && season.status !== "closed" && (
                            <div className="flex gap-1">
                              {season.status === "draft" && (
                                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); activateSeasonMutation.mutate(season.id); }} className="border-emerald-500/30 text-emerald-400" data-testid="button-activate-season">
                                  <Trophy className="h-3 w-3 mr-1" /> Activar
                                </Button>
                              )}
                              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); recalculateMutation.mutate(season.id); }} className="border-primary/30 text-primary" data-testid="button-recalculate">
                                <RefreshCw className="h-3 w-3 mr-1" /> Recalcular
                              </Button>
                              {season.status === "active" && (
                                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); closeSeasonMutation.mutate(season.id); }} className="border-red-500/30 text-red-400" data-testid="button-close-season">
                                  <Lock className="h-3 w-3 mr-1" /> Cerrar
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="standings">
            <Card className="border-primary/20 bg-[#1a1a1a]">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-primary">Clasificación Persistida</CardTitle>
                {selectedSeasonId && selectedSeason?.status !== "closed" && (
                  <Button size="sm" onClick={() => recalculateMutation.mutate(selectedSeasonId)} className="bg-primary text-black" data-testid="button-recalculate-standings">
                    <RefreshCw className="h-4 w-4 mr-1" /> Recalcular
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {!selectedSeasonId ? (
                  <p className="text-center text-[#C0C0C0] py-4">Selecciona una temporada en la pestaña "Temporadas"</p>
                ) : standings.length === 0 ? (
                  <p className="text-center text-[#C0C0C0] py-4">Sin datos. Pulsa "Recalcular" para generar la tabla.</p>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-primary/20">
                          <TableHead className="text-[#C0C0C0] w-12">#</TableHead>
                          <TableHead className="text-[#C0C0C0]">Equipo</TableHead>
                          <TableHead className="text-[#C0C0C0] text-center">PJ</TableHead>
                          <TableHead className="text-[#C0C0C0] text-center">PG</TableHead>
                          <TableHead className="text-[#C0C0C0] text-center">PE</TableHead>
                          <TableHead className="text-[#C0C0C0] text-center">PP</TableHead>
                          <TableHead className="text-[#C0C0C0] text-center">GF</TableHead>
                          <TableHead className="text-[#C0C0C0] text-center">GC</TableHead>
                          <TableHead className="text-[#C0C0C0] text-center">DG</TableHead>
                          <TableHead className="text-primary text-center font-bold">PTS</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {standings.map((entry) => (
                          <TableRow key={entry.id} className="border-primary/10" data-testid={`row-standing-${entry.teamId}`}>
                            <TableCell className="font-bold text-primary">{entry.position}</TableCell>
                            <TableCell className="font-medium">{entry.teamName || entry.teamId}</TableCell>
                            <TableCell className="text-center">{entry.played}</TableCell>
                            <TableCell className="text-center">{entry.won}</TableCell>
                            <TableCell className="text-center">{entry.drawn}</TableCell>
                            <TableCell className="text-center">{entry.lost}</TableCell>
                            <TableCell className="text-center">{entry.goalsFor}</TableCell>
                            <TableCell className="text-center">{entry.goalsAgainst}</TableCell>
                            <TableCell className="text-center">{entry.goalDifference}</TableCell>
                            <TableCell className="text-center font-bold text-primary">{entry.points}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {movements.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-semibold text-primary mb-2">Movimientos de División</h4>
                        <div className="space-y-2">
                          {movements.map(m => (
                            <div key={m.id} className={`flex items-center gap-2 p-2 rounded-lg text-sm ${m.movementType === "PROMOTION" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`} data-testid={`movement-${m.id}`}>
                              {m.movementType === "PROMOTION" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                              <span className="font-medium">{m.teamName}</span>
                              <span>{m.fromDivision} → {m.toDivision}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {currentRules?.formatType === "TOURNEY_PLUS30" && (
            <TabsContent value="bracket">
              <Card className="border-primary/20 bg-[#1a1a1a]">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-primary">Eliminatorias +30</CardTitle>
                  {selectedSeasonId && selectedSeason?.status !== "closed" && (
                    <Button size="sm" onClick={() => generateBracketMutation.mutate(selectedSeasonId)} className="bg-primary text-black" data-testid="button-generate-bracket">
                      <Swords className="h-4 w-4 mr-1" /> Generar Cuadro
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {!selectedSeasonId ? (
                    <p className="text-center text-[#C0C0C0] py-4">Selecciona una temporada primero</p>
                  ) : bracketMatches.length === 0 ? (
                    <p className="text-center text-[#C0C0C0] py-4">Sin cuadro generado. Recalcula clasificación primero y luego genera el cuadro.</p>
                  ) : (
                    <BracketView
                      matches={bracketMatches}
                      seasonId={selectedSeasonId}
                      onResult={(matchId, homeScore, awayScore, winnerId) => {
                        bracketResultMutation.mutate({ matchId, homeScore, awayScore, winnerId, seasonId: selectedSeasonId });
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      )}

      <Dialog open={rulesDialogOpen} onOpenChange={setRulesDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border-primary/30 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary">{currentRules ? "Editar Reglas" : "Configurar Reglas"}</DialogTitle>
          </DialogHeader>
          <Form {...ruleForm}>
            <form onSubmit={ruleForm.handleSubmit((data) => saveRuleMutation.mutate({ ...data, categoryId: selectedCategoryId }))} className="space-y-4">
              <FormField control={ruleForm.control} name="formatType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Formato</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="LEAGUE_DIVISIONS">Liga con Divisiones</SelectItem>
                      <SelectItem value="TOURNEY_PLUS30">Torneo +30 (Liga + Eliminatorias)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-3 gap-3">
                <FormField control={ruleForm.control} name="pointsWin" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pts Victoria</FormLabel>
                    <FormControl><Input type="text" inputMode="numeric" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={ruleForm.control} name="pointsDraw" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pts Empate</FormLabel>
                    <FormControl><Input type="text" inputMode="numeric" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={ruleForm.control} name="pointsLoss" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pts Derrota</FormLabel>
                    <FormControl><Input type="text" inputMode="numeric" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                  </FormItem>
                )} />
              </div>
              <FormField control={ruleForm.control} name="roundRobin" render={({ field }) => (
                <FormItem>
                  <FormLabel>Rondas</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="single">Solo Ida</SelectItem>
                      <SelectItem value="double">Ida y Vuelta</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={ruleForm.control} name="teamsPerDivision" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipos/División</FormLabel>
                    <FormControl><Input type="text" inputMode="numeric" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={ruleForm.control} name="federatedLimit" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Máx. Federados</FormLabel>
                    <FormControl><Input type="text" inputMode="numeric" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                  </FormItem>
                )} />
              </div>
              {ruleForm.watch("formatType") === "LEAGUE_DIVISIONS" && (
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={ruleForm.control} name="promotionCount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ascienden</FormLabel>
                      <FormControl><Input type="text" inputMode="numeric" {...field} value={field.value ?? 0} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={ruleForm.control} name="relegationCount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descienden</FormLabel>
                      <FormControl><Input type="text" inputMode="numeric" {...field} value={field.value ?? 0} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                    </FormItem>
                  )} />
                </div>
              )}
              <DialogFooter>
                <Button type="submit" className="bg-primary text-black" disabled={saveRuleMutation.isPending} data-testid="button-save-rules">
                  {saveRuleMutation.isPending ? "Guardando..." : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={seasonDialogOpen} onOpenChange={setSeasonDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-primary">Nueva Temporada</DialogTitle>
          </DialogHeader>
          <Form {...seasonForm}>
            <form onSubmit={seasonForm.handleSubmit((data) => createSeasonMutation.mutate({ ...data, categoryId: selectedCategoryId, rulesId: currentRules?.id || "" }))} className="space-y-4">
              <FormField control={seasonForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl><Input placeholder="Temporada 2026" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={seasonForm.control} name="tournamentId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Torneo Vinculado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar torneo" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {tournaments.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="submit" className="bg-primary text-black" disabled={createSeasonMutation.isPending} data-testid="button-save-season">
                  {createSeasonMutation.isPending ? "Creando..." : "Crear Temporada"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RuleCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#0D0D0D] border border-primary/20 rounded-lg p-3">
      <p className="text-xs text-[#C0C0C0]">{label}</p>
      <p className="text-lg font-bold text-primary">{value}</p>
    </div>
  );
}

function BracketView({ matches, seasonId, onResult }: { matches: BracketMatch[]; seasonId: string; onResult: (matchId: string, homeScore: number, awayScore: number, winnerId: string) => void }) {
  const [resultDialog, setResultDialog] = useState<BracketMatch | null>(null);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [winnerId, setWinnerId] = useState("");

  const phases = ["REPECHAJE", "CUARTOS", "SEMIFINAL", "FINAL"] as const;

  const openResultDialog = (match: BracketMatch) => {
    setResultDialog(match);
    setHomeScore(0);
    setAwayScore(0);
    setWinnerId("");
  };

  return (
    <div className="space-y-6">
      {phases.map(phase => {
        const phaseMatches = matches.filter(m => m.phase === phase);
        if (phaseMatches.length === 0) return null;
        return (
          <div key={phase}>
            <h4 className="text-sm font-semibold text-primary mb-2">{BracketPhaseLabels[phase]}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {phaseMatches.map(match => (
                <div
                  key={match.id}
                  className={`border rounded-lg p-3 ${match.status === "JUGADO" ? "border-emerald-500/30 bg-emerald-500/5" : "border-primary/20"}`}
                  data-testid={`bracket-match-${match.id}`}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-xs text-[#C0C0C0]">{match.seed}</span>
                    {match.status === "JUGADO" ? (
                      <Badge variant="secondary" className="text-xs">Jugado</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Pendiente</Badge>
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className={`flex items-center justify-between ${match.winnerId === match.homeTeamId ? "text-emerald-400 font-bold" : ""}`}>
                      <span>{match.homeTeamName || (match.homeTeamId ? "TBD" : "—")}</span>
                      {match.status === "JUGADO" && <span>{match.homeScore}</span>}
                    </div>
                    <div className={`flex items-center justify-between ${match.winnerId === match.awayTeamId ? "text-emerald-400 font-bold" : ""}`}>
                      <span>{match.awayTeamName || (match.awayTeamId ? "TBD" : "—")}</span>
                      {match.status === "JUGADO" && <span>{match.awayScore}</span>}
                    </div>
                  </div>
                  {match.status !== "JUGADO" && match.homeTeamId && match.awayTeamId && (
                    <Button size="sm" variant="outline" className="w-full mt-2 border-primary/30 text-primary" onClick={() => openResultDialog(match)} data-testid={`button-result-${match.id}`}>
                      Registrar Resultado
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <Dialog open={!!resultDialog} onOpenChange={() => setResultDialog(null)}>
        <DialogContent className="bg-[#1a1a1a] border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-primary">Resultado del Partido</DialogTitle>
          </DialogHeader>
          {resultDialog && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 items-center">
                <div className="text-center">
                  <p className="text-sm font-medium">{resultDialog.homeTeamName}</p>
                  <Input type="text" inputMode="numeric" min={0} value={homeScore} onChange={e => setHomeScore(Number(e.target.value))} className="mt-1 text-center" data-testid="input-bracket-home-score" />
                </div>
                <p className="text-center text-[#C0C0C0] font-bold">VS</p>
                <div className="text-center">
                  <p className="text-sm font-medium">{resultDialog.awayTeamName}</p>
                  <Input type="text" inputMode="numeric" min={0} value={awayScore} onChange={e => setAwayScore(Number(e.target.value))} className="mt-1 text-center" data-testid="input-bracket-away-score" />
                </div>
              </div>
              <div>
                <label className="text-sm text-[#C0C0C0]">Ganador</label>
                <Select onValueChange={setWinnerId} value={winnerId}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar ganador" /></SelectTrigger>
                  <SelectContent>
                    {resultDialog.homeTeamId && <SelectItem value={resultDialog.homeTeamId}>{resultDialog.homeTeamName || "Local"}</SelectItem>}
                    {resultDialog.awayTeamId && <SelectItem value={resultDialog.awayTeamId}>{resultDialog.awayTeamName || "Visitante"}</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button
                  disabled={!winnerId}
                  onClick={() => {
                    onResult(resultDialog.id, homeScore, awayScore, winnerId);
                    setResultDialog(null);
                  }}
                  className="bg-primary text-black"
                  data-testid="button-confirm-bracket-result"
                >
                  Confirmar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
