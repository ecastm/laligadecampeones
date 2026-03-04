import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { matchResultSchema, insertRefereeProfileSchema, MatchStageLabels, identificationTypeLabels, FineTypeLabels, type IdentificationType, type MatchResult, type MatchWithTeams, type Player, type MatchEventWithPlayer, type Standing, type RefereeProfile, type InsertRefereeProfile, type MatchStage, type MatchAttendance, type PlayerSuspension } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getAuthHeader } from "@/lib/auth";
import { SidebarProvider, SidebarTrigger, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { Flag, Calendar, LogOut, Plus, Trash2, CircleDot, Eye, CircleAlert, Goal, Trophy, ListOrdered, User, ScrollText, Camera, X, Loader2, FileText, Check, Ban, ClipboardList, UserCheck, UserX, ShieldAlert } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { Textarea } from "@/components/ui/textarea";
import { useUpload } from "@/hooks/use-upload";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import Regulations from "@/components/regulations";

type RefereeSection = "pending" | "completed" | "standings" | "results" | "profile" | "regulations";

const menuItems = [
  { id: "pending" as const, title: "Pendientes", icon: Calendar },
  { id: "completed" as const, title: "Completados", icon: CircleDot },
  { id: "standings" as const, title: "Posiciones", icon: Trophy },
  { id: "results" as const, title: "Resultados", icon: ListOrdered },
  { id: "regulations" as const, title: "Reglamento", icon: ScrollText },
  { id: "profile" as const, title: "Mi Perfil", icon: User },
];

export default function RefereeDashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedMatch, setSelectedMatch] = useState<MatchWithTeams | null>(null);
  const [viewingMatch, setViewingMatch] = useState<MatchWithTeams | null>(null);

  const { data: refereeProfile, isLoading: loadingProfile } = useQuery<RefereeProfile | null>({
    queryKey: ["/api/referee/profile"],
    queryFn: async () => {
      const response = await fetch("/api/referee/profile", { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar perfil");
      return response.json();
    },
  });

  // Force profile section if no profile exists
  const [activeSection, setActiveSection] = useState<RefereeSection>("pending");
  const { logoUrl } = useSiteSettings();
  const effectiveSection = (!loadingProfile && !refereeProfile) ? "profile" : activeSection;

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const showProfileRequired = !loadingProfile && !refereeProfile;

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4 border-b border-primary/30">
            <div className="flex items-center gap-3">
              <img src={logoUrl} alt="La Liga de Campeones" className="h-16 w-16 object-contain drop-shadow-[0_2px_8px_rgba(198,160,82,0.3)]" />
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold truncate text-primary">Panel Árbitro</p>
                <p className="text-xs text-[#C0C0C0] truncate">{user?.name}</p>
              </div>
            </div>
            <div className="mt-3 h-[2px] rounded-full bg-gradient-to-r from-emerald-400 via-primary to-emerald-400" />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-[#C0C0C0] uppercase tracking-wider text-[10px] font-semibold">Mis Partidos</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveSection(item.id)}
                        isActive={effectiveSection === item.id}
                        data-testid={`nav-${item.id}`}
                      >
                        <item.icon className={`h-4 w-4 ${effectiveSection === item.id ? "text-emerald-400" : ""}`} />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <div className="mt-auto border-t border-primary/20 p-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-[#C0C0C0] hover:text-white"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </Sidebar>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="relative flex h-14 items-center justify-between gap-4 border-b border-primary/20 bg-card px-4">
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400/50 via-primary/50 to-emerald-400/50" />
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-lg font-semibold">
                {menuItems.find(i => i.id === effectiveSection)?.title || "Mis Partidos"}
              </h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-3 sm:p-6">
            {(effectiveSection === "pending" || effectiveSection === "completed") && (
              <RefereeMatches
                status={effectiveSection === "pending" ? "PROGRAMADO" : "JUGADO"}
                onSelectMatch={setSelectedMatch}
                onViewMatch={setViewingMatch}
              />
            )}
            {effectiveSection === "standings" && <StandingsSection />}
            {effectiveSection === "results" && <ResultsSection />}
            {effectiveSection === "regulations" && <Regulations />}
            {effectiveSection === "profile" && <ProfileSection profile={refereeProfile} />}
          </main>
        </div>
      </div>

      {selectedMatch && (
        <MatchResultDialog
          match={selectedMatch}
          open={!!selectedMatch}
          onOpenChange={(open) => !open && setSelectedMatch(null)}
        />
      )}

      {viewingMatch && (
        <MatchDetailsDialog
          match={viewingMatch}
          open={!!viewingMatch}
          onOpenChange={(open) => !open && setViewingMatch(null)}
        />
      )}

      {showProfileRequired && (
        <ProfileRequiredDialog
          open={showProfileRequired}
          userEmail={user?.email || ""}
          userName={user?.name || ""}
        />
      )}
    </SidebarProvider>
  );
}

function RefereeMatches({
  status,
  onSelectMatch,
  onViewMatch,
}: {
  status: "PROGRAMADO" | "JUGADO";
  onSelectMatch: (match: MatchWithTeams) => void;
  onViewMatch: (match: MatchWithTeams) => void;
}) {
  const { data: matches = [], isLoading } = useQuery<MatchWithTeams[]>({
    queryKey: ["/api/referee/matches"],
    queryFn: async () => {
      const response = await fetch("/api/referee/matches", { headers: getAuthHeader() });
      if (!response.ok) throw new Error("Error al cargar partidos");
      return response.json();
    },
  });

  const filteredMatches = matches.filter((m) => m.status === status);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-bold">
          {status === "PROGRAMADO" ? "Partidos Pendientes" : "Partidos Completados"}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {status === "PROGRAMADO"
            ? "Partidos asignados que aún no tienen resultado"
            : "Partidos con resultado registrado"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === "PROGRAMADO" ? (
              <Calendar className="h-5 w-5 text-primary" />
            ) : (
              <CircleDot className="h-5 w-5 text-primary" />
            )}
            Partidos ({filteredMatches.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
            </div>
          ) : filteredMatches.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              {status === "PROGRAMADO"
                ? "No tienes partidos pendientes"
                : "No hay partidos completados"}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredMatches.map((match) => (
                <div
                  key={match.id}
                  className="rounded-md border p-3 sm:p-4"
                  data-testid={`row-match-${match.id}`}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {match.stage && match.stage !== "JORNADA"
                          ? MatchStageLabels[match.stage as MatchStage]
                          : `J${match.roundNumber}`}
                      </Badge>
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base">
                          {match.homeTeam?.name} vs {match.awayTeam?.name}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {match.dateTime && !isNaN(new Date(match.dateTime).getTime())
                            ? format(new Date(match.dateTime), "d MMM yyyy, HH:mm", { locale: es })
                            : "Fecha por definir"} · {match.field}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2">
                      {match.status === "JUGADO" && (
                        <>
                          <Badge variant="default" className="text-base sm:text-lg px-2 sm:px-3 py-1">
                            {match.homeScore} - {match.awayScore}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewMatch(match)}
                            data-testid={`button-view-details-${match.id}`}
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            Ver Detalles
                          </Button>
                        </>
                      )}
                      {match.status === "PROGRAMADO" && (
                        <Button
                          onClick={() => onSelectMatch(match)}
                          data-testid={`button-register-result-${match.id}`}
                        >
                          Cargar Resultado
                        </Button>
                      )}
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

function MatchResultDialog({
  match,
  open,
  onOpenChange,
}: {
  match: MatchWithTeams;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const { uploadFile, isUploading } = useUpload({
    onSuccess: (response) => {
      setUploadedPhotos(prev => [...prev, response.objectPath]);
      toast({ title: "Foto subida correctamente" });
    },
    onError: () => {
      toast({ title: "Error al subir la foto", variant: "destructive" });
    },
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      await uploadFile(files[i]);
    }
    e.target.value = "";
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const [homeAttendance, setHomeAttendance] = useState<Record<string, boolean>>({});
  const [awayAttendance, setAwayAttendance] = useState<Record<string, boolean>>({});
  const [homeNoShow, setHomeNoShow] = useState(false);
  const [awayNoShow, setAwayNoShow] = useState(false);
  const [attendanceInitialized, setAttendanceInitialized] = useState(false);

  const { data: homePlayers = [] } = useQuery<Player[]>({
    queryKey: ["/api/teams", match.homeTeamId, "players"],
    queryFn: async () => {
      const response = await fetch(`/api/teams/${match.homeTeamId}/players`, { headers: getAuthHeader() });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: open,
  });

  const { data: awayPlayers = [] } = useQuery<Player[]>({
    queryKey: ["/api/teams", match.awayTeamId, "players"],
    queryFn: async () => {
      const response = await fetch(`/api/teams/${match.awayTeamId}/players`, { headers: getAuthHeader() });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: open,
  });

  const { data: existingAttendance = [] } = useQuery<MatchAttendance[]>({
    queryKey: ["/api/referee/matches", match.id, "attendance"],
    queryFn: async () => {
      const response = await fetch(`/api/referee/matches/${match.id}/attendance`, { headers: getAuthHeader() });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: open,
  });

  const { data: activeSuspensions = [] } = useQuery<PlayerSuspension[]>({
    queryKey: ["/api/suspensions/active", match.tournamentId],
    queryFn: async () => {
      const response = await fetch(`/api/suspensions/active?tournamentId=${match.tournamentId}`, { headers: getAuthHeader() });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: open,
  });

  const isPlayerSuspended = (playerId: string) => {
    return activeSuspensions.some(s => s.playerId === playerId);
  };

  if (!attendanceInitialized && homePlayers.length > 0 && awayPlayers.length > 0) {
    setAttendanceInitialized(true);
    if (existingAttendance.length > 0) {
      const homeAtt: Record<string, boolean> = {};
      const awayAtt: Record<string, boolean> = {};
      let homeAllAbsent = true;
      let awayAllAbsent = true;
      existingAttendance.forEach(a => {
        if (a.teamId === match.homeTeamId) {
          homeAtt[a.playerId] = a.present;
          if (a.present) homeAllAbsent = false;
        } else if (a.teamId === match.awayTeamId) {
          awayAtt[a.playerId] = a.present;
          if (a.present) awayAllAbsent = false;
        }
      });
      setHomeAttendance(homeAtt);
      setAwayAttendance(awayAtt);
      const homeRecords = existingAttendance.filter(a => a.teamId === match.homeTeamId);
      const awayRecords = existingAttendance.filter(a => a.teamId === match.awayTeamId);
      if (homeRecords.length > 0 && homeAllAbsent) setHomeNoShow(true);
      if (awayRecords.length > 0 && awayAllAbsent) setAwayNoShow(true);
    } else {
      const homeAtt: Record<string, boolean> = {};
      homePlayers.forEach(p => { homeAtt[p.id] = isPlayerSuspended(p.id) ? false : true; });
      setHomeAttendance(homeAtt);
      const awayAtt: Record<string, boolean> = {};
      awayPlayers.forEach(p => { awayAtt[p.id] = isPlayerSuspended(p.id) ? false : true; });
      setAwayAttendance(awayAtt);
    }
  }

  const form = useForm<MatchResult>({
    resolver: zodResolver(matchResultSchema),
    defaultValues: {
      homeScore: 0,
      awayScore: 0,
      events: [],
      refereeNotes: "",
      evidenceUrls: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "events",
  });

  const noShowMutation = useMutation({
    mutationFn: async (teamId: string) => {
      return apiRequest("POST", `/api/referee/matches/${match.id}/no-show`, { teamId });
    },
    onSuccess: () => {
      toast({ title: "Incomparecencia registrada", description: "Multa de 15€ generada automáticamente" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: MatchResult) => {
      if (!homeNoShow && homePlayers.length > 0) {
        await apiRequest("POST", `/api/referee/matches/${match.id}/attendance`, {
          teamId: match.homeTeamId,
          attendance: Object.entries(homeAttendance).map(([playerId, present]) => ({ playerId, present })),
        });
      }
      if (!awayNoShow && awayPlayers.length > 0) {
        await apiRequest("POST", `/api/referee/matches/${match.id}/attendance`, {
          teamId: match.awayTeamId,
          attendance: Object.entries(awayAttendance).map(([playerId, present]) => ({ playerId, present })),
        });
      }
      return apiRequest("POST", `/api/referee/matches/${match.id}/result`, {
        ...data,
        evidenceUrls: uploadedPhotos,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/referee/matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home/standings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home/results"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home/schedule"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home/schedule/upcoming"] });
      toast({ title: "Resultado registrado correctamente" });
      setUploadedPhotos([]);
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const allPlayers = [...homePlayers, ...awayPlayers];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cargar Resultado</DialogTitle>
          <CardDescription>
            {match.homeTeam?.name} vs {match.awayTeam?.name}
          </CardDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ClipboardList className="h-4 w-4 text-primary" />
            Pase de Lista
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-semibold">{match.homeTeam?.name} (Local)</h5>
                <Button
                  type="button"
                  variant={homeNoShow ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (!homeNoShow && match.homeTeamId) {
                      noShowMutation.mutate(match.homeTeamId);
                      setHomeNoShow(true);
                    }
                  }}
                  disabled={noShowMutation.isPending || homeNoShow}
                  data-testid="button-home-no-show"
                >
                  <Ban className="mr-1 h-3 w-3" />
                  {homeNoShow ? "No Presentado" : "No se presentó"}
                </Button>
              </div>
              {!homeNoShow && homePlayers.filter(p => p.active).length > 0 ? (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {homePlayers.filter(p => p.active).map((player) => {
                    const suspended = isPlayerSuspended(player.id);
                    return (
                      <div
                        key={player.id}
                        className={`flex items-center justify-between px-2 py-1.5 rounded transition-colors text-sm ${
                          suspended
                            ? "bg-amber-500/15 cursor-not-allowed opacity-70"
                            : homeAttendance[player.id]
                              ? "bg-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer"
                              : "bg-destructive/10 hover:bg-destructive/20 cursor-pointer"
                        }`}
                        onClick={() => !suspended && setHomeAttendance(prev => ({ ...prev, [player.id]: !prev[player.id] }))}
                        data-testid={`attendance-home-${player.id}`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-5 text-right">#{player.jerseyNumber}</span>
                          {player.firstName} {player.lastName}
                          {suspended && (
                            <span className="text-[10px] font-bold bg-amber-500 text-black px-1.5 py-0.5 rounded" data-testid={`badge-suspended-${player.id}`}>
                              SANCIONADO
                            </span>
                          )}
                        </span>
                        {suspended ? (
                          <ShieldAlert className="h-4 w-4 text-amber-500" />
                        ) : homeAttendance[player.id] ? (
                          <UserCheck className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <UserX className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : homeNoShow ? (
                <p className="text-xs text-destructive text-center py-2">Equipo marcado como no presentado (Multa 15€)</p>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">Sin jugadores registrados</p>
              )}
            </div>

            <div className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-semibold">{match.awayTeam?.name} (Visitante)</h5>
                <Button
                  type="button"
                  variant={awayNoShow ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (!awayNoShow && match.awayTeamId) {
                      noShowMutation.mutate(match.awayTeamId);
                      setAwayNoShow(true);
                    }
                  }}
                  disabled={noShowMutation.isPending || awayNoShow}
                  data-testid="button-away-no-show"
                >
                  <Ban className="mr-1 h-3 w-3" />
                  {awayNoShow ? "No Presentado" : "No se presentó"}
                </Button>
              </div>
              {!awayNoShow && awayPlayers.filter(p => p.active).length > 0 ? (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {awayPlayers.filter(p => p.active).map((player) => {
                    const suspended = isPlayerSuspended(player.id);
                    return (
                      <div
                        key={player.id}
                        className={`flex items-center justify-between px-2 py-1.5 rounded transition-colors text-sm ${
                          suspended
                            ? "bg-amber-500/15 cursor-not-allowed opacity-70"
                            : awayAttendance[player.id]
                              ? "bg-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer"
                              : "bg-destructive/10 hover:bg-destructive/20 cursor-pointer"
                        }`}
                        onClick={() => !suspended && setAwayAttendance(prev => ({ ...prev, [player.id]: !prev[player.id] }))}
                        data-testid={`attendance-away-${player.id}`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-5 text-right">#{player.jerseyNumber}</span>
                          {player.firstName} {player.lastName}
                          {suspended && (
                            <span className="text-[10px] font-bold bg-amber-500 text-black px-1.5 py-0.5 rounded" data-testid={`badge-suspended-${player.id}`}>
                              SANCIONADO
                            </span>
                          )}
                        </span>
                        {suspended ? (
                          <ShieldAlert className="h-4 w-4 text-amber-500" />
                        ) : awayAttendance[player.id] ? (
                          <UserCheck className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <UserX className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : awayNoShow ? (
                <p className="text-xs text-destructive text-center py-2">Equipo marcado como no presentado (Multa 15€)</p>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">Sin jugadores registrados</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t pt-4" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => submitMutation.mutate(data))} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="homeScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{match.homeTeam?.name} (Local)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        data-testid="input-home-score"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="awayScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{match.awayTeam?.name} (Visitante)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        data-testid="input-away-score"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Eventos del Partido</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      type: "GOAL",
                      minute: 1,
                      teamId: match.homeTeamId || "",
                      playerId: "",
                    })
                  }
                  data-testid="button-add-event"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Agregar Evento
                </Button>
              </div>

              {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay eventos registrados
                </p>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-2 sm:grid-cols-12 gap-2 items-end border rounded-md p-3"
                    >
                      <FormField
                        control={form.control}
                        name={`events.${index}.type`}
                        render={({ field }) => (
                          <FormItem className="col-span-1 sm:col-span-3">
                            <FormLabel className="text-xs">Tipo</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid={`select-event-type-${index}`}>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="GOAL">Gol</SelectItem>
                                <SelectItem value="YELLOW">Amarilla</SelectItem>
                                <SelectItem value="RED">Roja</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`events.${index}.minute`}
                        render={({ field }) => (
                          <FormItem className="col-span-1 sm:col-span-2">
                            <FormLabel className="text-xs">Min</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={120}
                                data-testid={`input-event-minute-${index}`}
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`events.${index}.teamId`}
                        render={({ field }) => (
                          <FormItem className="col-span-1 sm:col-span-3">
                            <FormLabel className="text-xs">Equipo</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid={`select-event-team-${index}`}>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {match.homeTeamId && (
                                  <SelectItem value={match.homeTeamId}>
                                    {match.homeTeam?.name || "Por definir"}
                                  </SelectItem>
                                )}
                                {match.awayTeamId && (
                                  <SelectItem value={match.awayTeamId}>
                                    {match.awayTeam?.name || "Por definir"}
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`events.${index}.playerId`}
                        render={({ field }) => (
                          <FormItem className="col-span-1 sm:col-span-3">
                            <FormLabel className="text-xs">Jugador</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid={`select-event-player-${index}`}>
                                  <SelectValue placeholder="Jugador" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {allPlayers
                                  .filter(
                                    (p) =>
                                      p.teamId === form.watch(`events.${index}.teamId`)
                                  )
                                  .map((player) => (
                                    <SelectItem key={player.id} value={player.id}>
                                      {player.jerseyNumber} - {player.firstName} {player.lastName}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="col-span-1"
                        onClick={() => remove(index)}
                        data-testid={`button-remove-event-${index}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notas del Árbitro
              </h4>
              <FormField
                control={form.control}
                name="refereeNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Observaciones, incidencias, notas sobre el partido..."
                        className="min-h-[80px]"
                        data-testid="textarea-referee-notes"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Fotos / Evidencias
              </h4>
              <div className="flex flex-wrap gap-2">
                {uploadedPhotos.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Evidencia ${index + 1}`}
                      className="h-20 w-20 rounded-md object-cover border"
                      data-testid={`img-evidence-${index}`}
                    />
                    <button
                      type="button"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removePhoto(index)}
                      data-testid={`button-remove-photo-${index}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="h-20 w-20 rounded-md border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                  {isUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Camera className="h-5 w-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground mt-1">Subir</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={isUploading}
                    data-testid="input-upload-photo"
                  />
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Sube fotos del acta, cancha, o cualquier incidencia relevante
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={submitMutation.isPending || isUploading}
              data-testid="button-submit-result"
            >
              {submitMutation.isPending ? "Guardando..." : "Guardar Resultado"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function MatchDetailsDialog({
  match,
  open,
  onOpenChange,
}: {
  match: MatchWithTeams;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: matchDetails, isLoading } = useQuery<MatchWithTeams>({
    queryKey: ["/api/matches", match.id],
    queryFn: async () => {
      const response = await fetch(`/api/matches/${match.id}`);
      if (!response.ok) throw new Error("Error al cargar detalles del partido");
      return response.json();
    },
    enabled: open,
  });

  const events: MatchEventWithPlayer[] = matchDetails?.events || [];
  const goals = events.filter((e: MatchEventWithPlayer) => e.type === "GOAL");
  const yellowCards = events.filter((e: MatchEventWithPlayer) => e.type === "YELLOW");
  const redCards = events.filter((e: MatchEventWithPlayer) => e.type === "RED");

  const getEventIcon = (type: string) => {
    switch (type) {
      case "GOAL":
        return <Goal className="h-4 w-4 text-primary" />;
      case "YELLOW":
        return <div className="h-4 w-3 rounded-sm bg-primary" />;
      case "RED":
        return <div className="h-4 w-3 rounded-sm bg-destructive" />;
      default:
        return <CircleAlert className="h-4 w-4" />;
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case "GOAL":
        return "Gol";
      case "YELLOW":
        return "Tarjeta Amarilla";
      case "RED":
        return "Tarjeta Roja";
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Detalle del Partido
          </DialogTitle>
          <CardDescription>
            {match.stage && match.stage !== "JORNADA"
              ? MatchStageLabels[match.stage as MatchStage]
              : `Jornada ${match.roundNumber}`} · {match.dateTime && !isNaN(new Date(match.dateTime).getTime()) ? format(new Date(match.dateTime), "d MMMM yyyy", { locale: es }) : "Fecha por definir"}
          </CardDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-32" />
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-6 text-center">
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{match.homeTeam?.name}</p>
                    <p className="text-xs text-muted-foreground">Local</p>
                  </div>
                  <div className="text-4xl font-bold text-primary">
                    {match.homeScore} - {match.awayScore}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{match.awayTeam?.name}</p>
                    <p className="text-xs text-muted-foreground">Visitante</p>
                  </div>
                </div>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  {match.field}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Goal className="h-4 w-4 text-primary" />
                    Goles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{goals.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <div className="h-4 w-3 rounded-sm bg-primary" />
                    Amarillas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{yellowCards.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <div className="h-4 w-3 rounded-sm bg-destructive" />
                    Rojas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{redCards.length}</p>
                </CardContent>
              </Card>
            </div>

            {events.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Flag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No se registraron eventos en este partido</p>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Cronología de Eventos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {events
                      .sort((a: MatchEventWithPlayer, b: MatchEventWithPlayer) => a.minute - b.minute)
                      .map((event: MatchEventWithPlayer, index: number) => (
                        <div
                          key={event.id || index}
                          className="flex items-center gap-3 rounded-md border p-3"
                          data-testid={`event-${event.type.toLowerCase()}-${index}`}
                        >
                          <Badge variant="outline" className="shrink-0">
                            {event.minute}'
                          </Badge>
                          {getEventIcon(event.type)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {event.player
                                ? `${event.player.firstName} ${event.player.lastName}`
                                : "Jugador desconocido"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {getEventLabel(event.type)} · {event.teamId === match.homeTeamId ? match.homeTeam?.name : match.awayTeam?.name}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {matchDetails?.refereeNotes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notas del Árbitro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap" data-testid="text-referee-notes">{matchDetails.refereeNotes}</p>
                </CardContent>
              </Card>
            )}

            <EvidenceGallery matchId={match.id} open={open} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EvidenceGallery({ matchId, open }: { matchId: string; open: boolean }) {
  const { data: evidence = [] } = useQuery<{ id: string; url: string; type: string }[]>({
    queryKey: ["/api/referee/matches", matchId, "evidence"],
    queryFn: async () => {
      const response = await fetch(`/api/referee/matches/${matchId}/evidence`, { headers: getAuthHeader() });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: open,
  });

  if (evidence.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Camera className="h-4 w-4" />
          Fotos / Evidencias ({evidence.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {evidence.map((item, index) => (
            <img
              key={item.id}
              src={item.url}
              alt={`Evidencia ${index + 1}`}
              className="w-full aspect-square rounded-md object-cover border"
              data-testid={`img-saved-evidence-${index}`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StandingsSection() {
  const { data: standings = [], isLoading } = useQuery<Standing[]>({
    queryKey: ["/api/home/standings"],
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-bold">Tabla de Posiciones</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Clasificación actual del torneo
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Posiciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : standings.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No hay datos de posiciones disponibles
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Equipo</TableHead>
                    <TableHead className="text-center w-10">PJ</TableHead>
                    <TableHead className="text-center w-10">PG</TableHead>
                    <TableHead className="text-center w-10">PE</TableHead>
                    <TableHead className="text-center w-10">PP</TableHead>
                    <TableHead className="text-center w-10">GF</TableHead>
                    <TableHead className="text-center w-10">GC</TableHead>
                    <TableHead className="text-center w-10">DG</TableHead>
                    <TableHead className="text-center w-12">PTS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standings.map((team, index) => (
                    <TableRow key={team.teamId} data-testid={`row-standing-${team.teamId}`}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">{team.teamName}</TableCell>
                      <TableCell className="text-center">{team.played}</TableCell>
                      <TableCell className="text-center">{team.won}</TableCell>
                      <TableCell className="text-center">{team.drawn}</TableCell>
                      <TableCell className="text-center">{team.lost}</TableCell>
                      <TableCell className="text-center">{team.goalsFor}</TableCell>
                      <TableCell className="text-center">{team.goalsAgainst}</TableCell>
                      <TableCell className="text-center">{team.goalDifference}</TableCell>
                      <TableCell className="text-center font-bold">{team.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ResultsSection() {
  const { data: results = [], isLoading } = useQuery<MatchWithTeams[]>({
    queryKey: ["/api/home/results"],
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-bold">Resultados Recientes</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Últimos partidos jugados en el torneo
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListOrdered className="h-5 w-5 text-primary" />
            Resultados ({results.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : results.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No hay resultados disponibles
            </p>
          ) : (
            <div className="space-y-3">
              {results.map((match) => (
                <div
                  key={match.id}
                  className="rounded-md border p-3"
                  data-testid={`row-result-${match.id}`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {match.stage && match.stage !== "JORNADA"
                          ? MatchStageLabels[match.stage as MatchStage]
                          : `J${match.roundNumber}`}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {match.dateTime && !isNaN(new Date(match.dateTime).getTime()) ? format(new Date(match.dateTime), "d MMM yyyy", { locale: es }) : "Fecha por definir"}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <span className="flex-1 text-right text-sm font-medium truncate">
                        {match.homeTeam?.name}
                      </span>
                      <Badge variant="default" className="text-base px-3 py-1">
                        {match.homeScore} - {match.awayScore}
                      </Badge>
                      <span className="flex-1 text-left text-sm font-medium truncate">
                        {match.awayTeam?.name}
                      </span>
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

function ProfileSection({ profile }: { profile: RefereeProfile | null | undefined }) {
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<InsertRefereeProfile>({
    resolver: zodResolver(insertRefereeProfileSchema),
    defaultValues: {
      fullName: profile?.fullName || user?.name || "",
      identificationType: (profile?.identificationType as "DNI" | "NIE" | "PASAPORTE") || "DNI",
      identificationNumber: profile?.identificationNumber || "",
      phone: profile?.phone || "",
      email: profile?.email || user?.email || "",
      association: profile?.association || "",
      yearsOfExperience: profile?.yearsOfExperience || 0,
      observations: profile?.observations || "",
      status: profile?.status || "ACTIVO",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertRefereeProfile) => {
      const method = profile ? "PUT" : "POST";
      return apiRequest(method, "/api/referee/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/referee/profile"] });
      toast({ title: profile ? "Perfil actualizado" : "Perfil creado" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-bold">Mi Perfil de Árbitro</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Datos generales para identificación y trazabilidad
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Datos del Árbitro
          </CardTitle>
          <CardDescription>
            {profile ? "Actualiza tu información de perfil" : "Completa tu perfil para continuar"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-profile-fullname" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="identificationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Documento *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "DNI"}>
                        <FormControl>
                          <SelectTrigger data-testid="select-profile-identificationType">
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(identificationTypeLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="identificationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Identificación *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-profile-identification" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-profile-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} data-testid="input-profile-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="association"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asociación o Liga (opcional)</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-profile-association" />
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
                      <FormLabel>Años de Experiencia (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          inputMode="numeric"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-profile-experience"
                        />
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
                          <SelectTrigger data-testid="select-profile-status">
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
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Notas adicionales..."
                        data-testid="input-profile-observations"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save-profile">
                {updateMutation.isPending ? "Guardando..." : profile ? "Actualizar Perfil" : "Guardar Perfil"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileRequiredDialog({
  open,
  userEmail,
  userName,
}: {
  open: boolean;
  userEmail: string;
  userName: string;
}) {
  const { toast } = useToast();

  const form = useForm<InsertRefereeProfile>({
    resolver: zodResolver(insertRefereeProfileSchema),
    defaultValues: {
      fullName: userName,
      identificationType: "DNI" as const,
      identificationNumber: "",
      phone: "",
      email: userEmail,
      association: "",
      yearsOfExperience: 0,
      observations: "",
      status: "ACTIVO",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertRefereeProfile) => {
      return apiRequest("POST", "/api/referee/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/referee/profile"] });
      toast({ title: "Perfil creado correctamente" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Completa tu Perfil de Árbitro
          </DialogTitle>
          <CardDescription>
            Antes de continuar, es obligatorio completar tus datos generales.
          </CardDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo *</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-required-fullname" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="identificationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Documento *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "DNI"}>
                      <FormControl>
                        <SelectTrigger data-testid="select-required-identificationType">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(identificationTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="identificationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Identificación *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-required-identification" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-required-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} data-testid="input-required-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="association"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asociación o Liga (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-required-association" />
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
                    <FormLabel>Años de Experiencia (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-required-experience"
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
                  <FormLabel>Observaciones (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Notas adicionales..."
                      data-testid="input-required-observations"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-create-profile">
              {createMutation.isPending ? "Guardando..." : "Completar Perfil y Continuar"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
