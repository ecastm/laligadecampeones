import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { matchResultSchema, type MatchResult, type MatchWithTeams, type Player, type MatchAttendance, type PlayerSuspension, type MatchSubstitution } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getAuthHeader } from "@/lib/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, CardDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";
import { Goal, Flag, Trash2, Ban, ClipboardList, UserCheck, UserX, ShieldAlert, ClipboardCheck, ArrowLeftRight, X, Loader2, ScrollText, FileText, Camera, Check, Plus } from "lucide-react";

export function LineupTab({
  match,
  homePlayers,
  awayPlayers,
}: {
  match: MatchWithTeams;
  homePlayers: Player[];
  awayPlayers: Player[];
}) {
  const { toast } = useToast();
  const [activeTeam, setActiveTeam] = useState<"home" | "away">("home");

  const teamId = activeTeam === "home" ? match.homeTeamId : match.awayTeamId;
  const teamName = activeTeam === "home" ? match.homeTeam?.name : match.awayTeam?.name;

  const { data: lineups = [] } = useQuery({
    queryKey: ["/api/referee/matches", match.id, "lineups"],
    queryFn: async () => {
      const r = await fetch(`/api/referee/matches/${match.id}/lineups`, { headers: getAuthHeader() });
      if (!r.ok) return [];
      return r.json();
    },
  });

  const { data: substitutions = [] } = useQuery<MatchSubstitution[]>({
    queryKey: ["/api/referee/matches", match.id, "substitutions"],
    queryFn: async () => {
      const r = await fetch(`/api/referee/matches/${match.id}/substitutions`, { headers: getAuthHeader() });
      if (!r.ok) return [];
      return r.json();
    },
  });

  const players = activeTeam === "home" ? homePlayers : awayPlayers;
  const currentLineup = lineups.find((l: any) => l.teamId === teamId);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [lineupInitialized, setLineupInitialized] = useState(false);

  if (!lineupInitialized && players.length > 0) {
    setLineupInitialized(true);
    if (currentLineup?.playerIds) {
      setSelectedPlayerIds(currentLineup.playerIds);
    } else {
      setSelectedPlayerIds([]);
    }
  }

  const togglePlayer = (playerId: string) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]
    );
  };

  const saveLineupMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/referee/matches/${match.id}/lineups`, {
        teamId,
        playerIds: selectedPlayerIds,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/referee/matches", match.id, "lineups"] });
      toast({ title: "Alineación guardada correctamente" });
    },
    onError: () => {
      toast({ title: "Error al guardar alineación", variant: "destructive" });
    },
  });

  const [subPlayerOut, setSubPlayerOut] = useState("");
  const [subPlayerIn, setSubPlayerIn] = useState("");
  const [subMinute, setSubMinute] = useState("");
  const teamSubs = substitutions.filter((s) => s.teamId === teamId);

  const addSubMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/referee/matches/${match.id}/substitutions`, {
        teamId,
        playerOutId: subPlayerOut,
        playerInId: subPlayerIn,
        minute: parseInt(subMinute) || 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/referee/matches", match.id, "substitutions"] });
      setSubPlayerOut("");
      setSubPlayerIn("");
      setSubMinute("");
      toast({ title: "Cambio registrado" });
    },
    onError: () => {
      toast({ title: "Error al registrar cambio", variant: "destructive" });
    },
  });

  const deleteSubMutation = useMutation({
    mutationFn: async (subId: string) => {
      return apiRequest("DELETE", `/api/referee/matches/${match.id}/substitutions/${subId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/referee/matches", match.id, "substitutions"] });
      toast({ title: "Cambio eliminado" });
    },
    onError: () => {
      toast({ title: "Error al eliminar cambio", variant: "destructive" });
    },
  });

  const getPlayerName = (playerId: string) => {
    const all = [...homePlayers, ...awayPlayers];
    const p = all.find((p) => p.id === playerId);
    return p ? `${p.firstName} ${p.lastName}` : playerId;
  };

  const handleTeamSwitch = (team: "home" | "away") => {
    setActiveTeam(team);
    setLineupInitialized(false);
    setSelectedPlayerIds([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border rounded-md p-1">
        <Button
          variant={activeTeam === "home" ? "default" : "ghost"}
          size="sm"
          className="flex-1 truncate"
          onClick={() => handleTeamSwitch("home")}
          data-testid="button-team-home"
        >
          {match.homeTeam?.name}
        </Button>
        <Button
          variant={activeTeam === "away" ? "default" : "ghost"}
          size="sm"
          className="flex-1 truncate"
          onClick={() => handleTeamSwitch("away")}
          data-testid="button-team-away"
        >
          {match.awayTeam?.name}
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">
            Alineación Titular{" "}
            <span className="text-primary">({selectedPlayerIds.length} seleccionados)</span>
          </h3>
          <Button
            size="sm"
            onClick={() => saveLineupMutation.mutate()}
            disabled={saveLineupMutation.isPending}
            data-testid="button-save-lineup"
          >
            {saveLineupMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-1" />
            )}
            Guardar
          </Button>
        </div>

        {players.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">
            No hay jugadores registrados en este equipo.
          </p>
        ) : (
          <div className="border rounded-md divide-y max-h-52 overflow-y-auto">
            {players.map((player) => {
              const isSelected = selectedPlayerIds.includes(player.id);
              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors ${
                    isSelected ? "bg-primary/10" : ""
                  }`}
                  onClick={() => togglePlayer(player.id)}
                  data-testid={`player-lineup-${player.id}`}
                >
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-primary border-primary" : "border-muted-foreground"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <span className="text-sm font-medium flex-1">{player.firstName} {player.lastName}</span>
                  {player.jerseyNumber && (
                    <span className="text-xs text-muted-foreground">#{player.jerseyNumber}</span>
                  )}
                  {player.position && (
                    <Badge variant="outline" className="text-xs">
                      {player.position}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-3 border-t pt-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4 text-primary" />
          Cambios — {teamName}
        </h3>

        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Sale</label>
              <Select value={subPlayerOut} onValueChange={setSubPlayerOut}>
                <SelectTrigger className="h-8 text-xs" data-testid="select-player-out">
                  <SelectValue placeholder="Jugador que sale" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.firstName} {p.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Entra</label>
              <Select value={subPlayerIn} onValueChange={setSubPlayerIn}>
                <SelectTrigger className="h-8 text-xs" data-testid="select-player-in">
                  <SelectValue placeholder="Jugador que entra" />
                </SelectTrigger>
                <SelectContent>
                  {players
                    .filter((p) => p.id !== subPlayerOut)
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.firstName} {p.lastName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-end gap-2">
            <div className="space-y-1 flex-1">
              <label className="text-xs text-muted-foreground">Minuto</label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Ej: 65"
                value={subMinute}
                onChange={(e) => setSubMinute(e.target.value.replace(/\D/g, ""))}
                className="h-8 text-xs"
                data-testid="input-sub-minute"
              />
            </div>
            <Button
              size="sm"
              className="h-8"
              onClick={() => {
                if (!subPlayerOut || !subPlayerIn) {
                  toast({ title: "Selecciona ambos jugadores", variant: "destructive" });
                  return;
                }
                if (subPlayerOut === subPlayerIn) {
                  toast({ title: "No puede ser el mismo jugador", variant: "destructive" });
                  return;
                }
                addSubMutation.mutate();
              }}
              disabled={addSubMutation.isPending}
              data-testid="button-add-sub"
            >
              {addSubMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {teamSubs.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-2">
            No hay cambios registrados
          </p>
        ) : (
          <div className="border rounded-md divide-y">
            {teamSubs.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center gap-2 px-3 py-2"
                data-testid={`sub-row-${sub.id}`}
              >
                <span className="text-xs font-bold text-primary w-8 shrink-0">
                  '{sub.minute}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 flex-wrap text-xs">
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      ↑ {getPlayerName(sub.playerInId)}
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-red-500">↓ {getPlayerName(sub.playerOutId)}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 shrink-0"
                  onClick={() => deleteSubMutation.mutate(sub.id)}
                  disabled={deleteSubMutation.isPending}
                  data-testid={`button-delete-sub-${sub.id}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function MatchResultDialog({
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {match.status === "PROGRAMADO" ? "Iniciar Partido" : "Gestión del Partido"}
          </DialogTitle>
          <CardDescription>
            {match.homeTeam?.name} vs {match.awayTeam?.name}
          </CardDescription>
        </DialogHeader>

        <Tabs defaultValue="partido" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="lineups"><ClipboardCheck className="mr-1 h-4 w-4" />Alineaciones</TabsTrigger>
            <TabsTrigger value="attendance"><ClipboardList className="mr-1 h-4 w-4" />Asistencia</TabsTrigger>
            <TabsTrigger value="partido"><Goal className="mr-1 h-4 w-4" />Partido</TabsTrigger>
          </TabsList>

          <TabsContent value="lineups" className="space-y-4">
            <LineupTab match={match} homePlayers={homePlayers} awayPlayers={awayPlayers} />
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
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
          </TabsContent>

          <TabsContent value="partido" className="space-y-4 pt-2">
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
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                    onClick={() =>
                      append({
                        type: "GOAL",
                        minute: 1,
                        teamId: match.homeTeamId || "",
                        playerId: "",
                      })
                    }
                    data-testid="button-add-goal"
                  >
                    <Goal className="mr-1 h-4 w-4" />
                    Gol
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-yellow-600 border-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-950"
                    onClick={() =>
                      append({
                        type: "YELLOW",
                        minute: 1,
                        teamId: match.homeTeamId || "",
                        playerId: "",
                      })
                    }
                    data-testid="button-add-yellow"
                  >
                    <Flag className="mr-1 h-4 w-4" />
                    Amarilla
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950"
                    onClick={() =>
                      append({
                        type: "RED",
                        minute: 1,
                        teamId: match.homeTeamId || "",
                        playerId: "",
                      })
                    }
                    data-testid="button-add-red"
                  >
                    <Flag className="mr-1 h-4 w-4" />
                    Roja
                  </Button>
                </div>
              </div>

              {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay eventos registrados. Usa los botones de arriba para agregar goles y tarjetas.
                </p>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => {
                    const eventType = form.watch(`events.${index}.type`);
                    const eventTeamId = form.watch(`events.${index}.teamId`);
                    const eventPlayerId = form.watch(`events.${index}.playerId`);
                    const eventMinute = form.watch(`events.${index}.minute`);
                    const eventPlayer = allPlayers.find(p => p.id === eventPlayerId);
                    const teamPlayers = allPlayers.filter(p => p.teamId === eventTeamId && p.active);
                    const isHome = eventTeamId === match.homeTeamId;
                    const teamName = isHome ? match.homeTeam?.name : match.awayTeam?.name;

                    return (
                      <div
                        key={field.id}
                        className={`border rounded-lg p-3 space-y-3 ${
                          eventType === "GOAL" ? "border-emerald-300 bg-emerald-500/5" :
                          eventType === "YELLOW" ? "border-yellow-300 bg-yellow-500/5" :
                          "border-red-300 bg-red-500/5"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {eventType === "GOAL" ? (
                              <span className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
                                <Goal className="h-4 w-4" /> GOL
                              </span>
                            ) : eventType === "YELLOW" ? (
                              <span className="flex items-center gap-1 text-sm font-semibold text-yellow-600">
                                <span className="inline-block w-3 h-4 bg-yellow-400 rounded-sm" /> AMARILLA
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-sm font-semibold text-red-600">
                                <span className="inline-block w-3 h-4 bg-red-500 rounded-sm" /> ROJA
                              </span>
                            )}
                            {eventPlayer && (
                              <span className="text-xs text-muted-foreground">
                                — #{eventPlayer.jerseyNumber} {eventPlayer.firstName} {eventPlayer.lastName} ({teamName})
                              </span>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => remove(index)}
                            data-testid={`button-remove-event-${index}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-12 gap-2 items-end">
                          <FormField
                            control={form.control}
                            name={`events.${index}.type`}
                            render={({ field }) => (
                              <FormItem className="col-span-3">
                                <FormLabel className="text-xs">Tipo</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid={`select-event-type-${index}`}>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="GOAL">⚽ Gol</SelectItem>
                                    <SelectItem value="YELLOW">🟡 Amarilla</SelectItem>
                                    <SelectItem value="RED">🔴 Roja</SelectItem>
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
                              <FormItem className="col-span-2">
                                <FormLabel className="text-xs">Minuto</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={1}
                                    max={120}
                                    placeholder="Min"
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
                              <FormItem className="col-span-3">
                                <FormLabel className="text-xs">Equipo</FormLabel>
                                <Select onValueChange={(val) => {
                                  field.onChange(val);
                                  form.setValue(`events.${index}.playerId`, "");
                                }} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid={`select-event-team-${index}`}>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {match.homeTeamId && (
                                      <SelectItem value={match.homeTeamId}>
                                        {match.homeTeam?.name || "Local"}
                                      </SelectItem>
                                    )}
                                    {match.awayTeamId && (
                                      <SelectItem value={match.awayTeamId}>
                                        {match.awayTeam?.name || "Visitante"}
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
                              <FormItem className="col-span-4">
                                <FormLabel className="text-xs">Jugador</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid={`select-event-player-${index}`}>
                                      <SelectValue placeholder="Seleccionar jugador" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {teamPlayers.map((player) => (
                                      <SelectItem key={player.id} value={player.id}>
                                        #{player.jerseyNumber} — {player.firstName} {player.lastName}
                                      </SelectItem>
                                    ))}
                                    {teamPlayers.length === 0 && (
                                      <SelectItem value="__none" disabled>Sin jugadores</SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {fields.length > 0 && (
                <div className="border rounded-lg p-3 bg-muted/30 space-y-2">
                  <h5 className="text-sm font-semibold flex items-center gap-2">
                    <ScrollText className="h-4 w-4" />
                    Cronología del Partido
                  </h5>
                  <div className="space-y-1">
                    {fields
                      .map((field, index) => ({
                        index,
                        type: form.watch(`events.${index}.type`),
                        minute: form.watch(`events.${index}.minute`),
                        teamId: form.watch(`events.${index}.teamId`),
                        playerId: form.watch(`events.${index}.playerId`),
                      }))
                      .sort((a, b) => (a.minute || 0) - (b.minute || 0))
                      .map((ev) => {
                        const player = allPlayers.find(p => p.id === ev.playerId);
                        const isHome = ev.teamId === match.homeTeamId;
                        const teamName = isHome ? match.homeTeam?.name : match.awayTeam?.name;
                        return (
                          <div key={ev.index} className="flex items-center gap-2 text-sm py-1 border-b border-border/50 last:border-0" data-testid={`chronology-event-${ev.index}`}>
                            <span className="font-mono text-xs text-muted-foreground w-8 text-right">{ev.minute}'</span>
                            {ev.type === "GOAL" ? (
                              <Goal className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            ) : ev.type === "YELLOW" ? (
                              <span className="inline-block w-3 h-3.5 bg-yellow-400 rounded-sm shrink-0" />
                            ) : (
                              <span className="inline-block w-3 h-3.5 bg-red-500 rounded-sm shrink-0" />
                            )}
                            <span className="truncate">
                              {player ? `${player.firstName} ${player.lastName}` : "Sin jugador"}{" "}
                              <span className="text-muted-foreground text-xs">({teamName})</span>
                            </span>
                          </div>
                        );
                      })}
                  </div>
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
