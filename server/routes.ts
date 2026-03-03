import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticate, authorizeRoles, generateToken, verifyPassword, hashPassword, type AuthRequest } from "./auth";
import {
  loginSchema,
  registerSchema,
  insertUserSchema,
  updateUserSchema,
  insertTeamSchema,
  insertPlayerSchema,
  insertMatchSchema,
  insertTournamentSchema,
  finishTournamentSchema,
  matchResultSchema,
  insertNewsSchema,
  insertRefereeProfileSchema,
  insertCaptainProfileSchema,
  insertDivisionSchema,
  insertMatchLineupSchema,
  insertMatchEvidenceSchema,
  insertTeamPaymentSchema,
  insertFinePaymentSchema,
  insertExpenseSchema,
  insertMarketingMediaSchema,
  insertContactMessageSchema,
  insertSiteSettingsSchema,
  insertTournamentStageSchema,
  saveAttendanceSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ==================== OBJECT STORAGE ====================
  const { registerObjectStorageRoutes } = await import("./replit_integrations/object_storage");
  registerObjectStorageRoutes(app);

  // ==================== SITE SETTINGS ====================
  app.get("/api/site-settings", async (_req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings || { leagueName: "La Liga de Campeones", logoUrl: null, phone: null, email: null, address: null, instagramUrl: null, facebookUrl: null, whatsappNumber: null });
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.put("/api/admin/site-settings", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
    try {
      const data = insertSiteSettingsSchema.parse(req.body);
      const settings = await storage.updateSiteSettings(data);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // ==================== AUTH ====================
  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }
      const valid = await verifyPassword(data.password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }
      if (user.status === "INACTIVO") {
        return res.status(403).json({ message: "Tu cuenta ha sido desactivada. Contacta al administrador." });
      }
      const token = generateToken({ userId: user.id, email: user.email, role: user.role });
      const { passwordHash, ...userWithoutPassword } = user;
      res.json({ token, user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.get("/api/auth/me", authenticate, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.userId);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      const { passwordHash, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Este correo ya está registrado" });
      }
      const passwordHash = await hashPassword(data.password);
      const user = await storage.createUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      const token = generateToken({ userId: user.id, email: user.email, role: user.role });
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.status(201).json({ token, user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // ==================== PUBLIC HOME ====================
  app.get("/api/tournaments/active", async (req, res) => {
    try {
      const tournament = await storage.getActiveTournament();
      if (!tournament) {
        return res.status(404).json({ message: "No hay torneo activo" });
      }
      res.json(tournament);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.get("/api/tournaments/active/all", async (req, res) => {
    try {
      const tournaments = await storage.getTournaments();
      const activeTournaments = tournaments.filter(t => t.status === "ACTIVO");
      res.json(activeTournaments);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.get("/api/home/schedule", async (req, res) => {
    try {
      const tournamentId = req.query.tournamentId as string | undefined;
      let targetTournamentId = tournamentId;
      
      if (!targetTournamentId) {
        const tournament = await storage.getActiveTournament();
        if (!tournament) {
          return res.json([]);
        }
        targetTournamentId = tournament.id;
      }
      
      const matches = await storage.getMatches(targetTournamentId);
      const result = [];
      for (const match of matches) {
        const withTeams = await storage.getMatchWithTeams(match.id);
        if (withTeams) result.push(withTeams);
      }
      result.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
      res.json(result);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.get("/api/home/schedule/upcoming", async (req, res) => {
    try {
      const allTournaments = await storage.getTournaments();
      const activeTournaments = allTournaments.filter(t => t.status === "ACTIVO");
      const allUpcoming: any[] = [];
      const now = new Date();
      
      for (const tournament of activeTournaments) {
        const matches = await storage.getMatches(tournament.id);
        for (const match of matches) {
          if (match.status === "PROGRAMADO" || match.status === "EN_CURSO") {
            const matchDate = new Date(match.dateTime);
            if (isNaN(matchDate.getTime())) continue;
            if (matchDate >= now || match.status === "EN_CURSO") {
              const withTeams = await storage.getMatchWithTeams(match.id);
              if (withTeams) allUpcoming.push(withTeams);
            }
          }
        }
      }
      
      allUpcoming.sort((a, b) => {
        const dateA = new Date(a.dateTime).getTime();
        const dateB = new Date(b.dateTime).getTime();
        return dateA - dateB;
      });
      res.json(allUpcoming.slice(0, 8));
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.get("/api/home/standings", async (req, res) => {
    try {
      const tournamentId = req.query.tournamentId as string | undefined;
      let targetTournamentId = tournamentId;
      
      if (!targetTournamentId) {
        const tournament = await storage.getActiveTournament();
        if (!tournament) {
          return res.json([]);
        }
        targetTournamentId = tournament.id;
      }
      
      const standings = await storage.calculateStandings(targetTournamentId);
      res.json(standings);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.get("/api/home/results", async (req, res) => {
    try {
      const tournamentId = req.query.tournamentId as string | undefined;
      let targetTournamentId = tournamentId;
      
      if (!targetTournamentId) {
        const tournament = await storage.getActiveTournament();
        if (!tournament) {
          return res.json([]);
        }
        targetTournamentId = tournament.id;
      }
      
      const matches = await storage.getMatches(targetTournamentId);
      const playedMatches = matches.filter(m => m.status === "JUGADO");
      const result = [];
      for (const match of playedMatches) {
        const withTeams = await storage.getMatchWithTeams(match.id);
        if (withTeams && withTeams.homeTeam && withTeams.awayTeam) result.push(withTeams);
      }
      result.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
      res.json(result.slice(0, 10));
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.get("/api/home/teams", async (req, res) => {
    try {
      const tournamentId = req.query.tournamentId as string | undefined;
      let targetTournamentId = tournamentId;
      
      if (!targetTournamentId) {
        const tournament = await storage.getActiveTournament();
        if (!tournament) {
          return res.json([]);
        }
        targetTournamentId = tournament.id;
      }
      
      const teams = await storage.getTeams(targetTournamentId);
      res.json(teams);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Top scorers (public)
  app.get("/api/home/scorers", async (req, res) => {
    try {
      const tournamentId = req.query.tournamentId as string | undefined;
      let targetTournamentId = tournamentId;
      
      if (!targetTournamentId) {
        const tournament = await storage.getActiveTournament();
        if (!tournament) {
          return res.json([]);
        }
        targetTournamentId = tournament.id;
      }

      const allEvents = await storage.getAllMatchEvents();
      const teams = await storage.getTeams(targetTournamentId);
      const teamIds = new Set(teams.map(t => t.id));
      
      // Filter goal events for teams in the tournament
      const goalEvents = allEvents.filter(e => e.type === "GOAL" && teamIds.has(e.teamId));
      
      // Count goals per player
      const playerGoals: Map<string, number> = new Map();
      for (const event of goalEvents) {
        const current = playerGoals.get(event.playerId) || 0;
        playerGoals.set(event.playerId, current + 1);
      }
      
      // Get player details and build scorers list
      const allPlayers = await storage.getPlayers();
      const scorers = Array.from(playerGoals.entries())
        .map(([playerId, goals]) => {
          const player = allPlayers.find(p => p.id === playerId);
          const team = teams.find(t => t.id === player?.teamId);
          return {
            playerId,
            playerName: player ? `${player.firstName} ${player.lastName}` : "Desconocido",
            teamId: player?.teamId || "",
            teamName: team?.name || "Sin equipo",
            goals,
            photoUrl: player?.photoUrls?.[0] || null,
          };
        })
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 20);
      
      res.json(scorers);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.get("/api/matches/:id", async (req, res) => {
    try {
      const match = await storage.getMatchWithTeams(req.params.id);
      if (!match) {
        return res.status(404).json({ message: "Partido no encontrado" });
      }
      res.json(match);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.get("/api/teams/:id/players", async (req, res) => {
    try {
      const players = await storage.getPlayers(req.params.id);
      res.json(players);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // ==================== NEWS (PUBLIC) ====================
  app.get("/api/home/news", async (req, res) => {
    try {
      const tournamentId = req.query.tournamentId as string | undefined;
      let targetTournamentId = tournamentId;
      
      if (!targetTournamentId) {
        const tournament = await storage.getActiveTournament();
        if (!tournament) {
          return res.json([]);
        }
        targetTournamentId = tournament.id;
      }
      
      const news = await storage.getNews(targetTournamentId);
      res.json(news);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.get("/api/home/news/:id", async (req, res) => {
    try {
      const news = await storage.getNewsItem(req.params.id);
      if (!news) {
        return res.status(404).json({ message: "Noticia no encontrada" });
      }
      res.json(news);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // ==================== PUBLIC TOURNAMENTS ====================
  app.get("/api/tournaments/completed", async (req, res) => {
    try {
      const tournaments = await storage.getCompletedTournaments();
      res.json(tournaments);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.get("/api/tournaments/:id", async (req, res) => {
    try {
      const tournament = await storage.getTournament(req.params.id);
      if (!tournament) {
        return res.status(404).json({ message: "Torneo no encontrado" });
      }
      res.json(tournament);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // ==================== ADMIN ====================
  // Tournaments
  app.get("/api/admin/tournaments", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
    try {
      const tournaments = await storage.getTournaments();
      res.json(tournaments);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/admin/tournaments", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
    try {
      const data = insertTournamentSchema.parse(req.body);
      const tournament = await storage.createTournament(data);
      res.status(201).json(tournament);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.put("/api/admin/tournaments/:id", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
    try {
      const data = insertTournamentSchema.partial().parse(req.body);
      const tournament = await storage.updateTournament(req.params.id, data);
      if (!tournament) {
        return res.status(404).json({ message: "Torneo no encontrado" });
      }
      res.json(tournament);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/admin/tournaments/:id/finish", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
    try {
      const data = finishTournamentSchema.parse(req.body);
      const tournament = await storage.finishTournament(req.params.id, data.championTeamId);
      if (!tournament) {
        return res.status(404).json({ message: "Torneo no encontrado" });
      }
      res.json(tournament);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.delete("/api/admin/tournaments/:id", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
    try {
      await storage.deleteTournament(req.params.id);
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Tournament Stages
  app.get("/api/admin/tournaments/:tournamentId/stages", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
    try {
      const stages = await storage.getStagesByTournament(req.params.tournamentId);
      res.json(stages);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/admin/tournaments/:tournamentId/stages", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
    try {
      const data = insertTournamentStageSchema.parse({
        ...req.body,
        tournamentId: req.params.tournamentId,
      });
      const stage = await storage.createStage(data);
      res.status(201).json(stage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.put("/api/admin/stages/:id", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
    try {
      const data = insertTournamentStageSchema.partial().parse(req.body);
      const stage = await storage.updateStage(req.params.id, data);
      if (!stage) {
        return res.status(404).json({ message: "Fase no encontrada" });
      }
      res.json(stage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.delete("/api/admin/stages/:id", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
    try {
      const matchCount = await storage.getMatchCountByStage(req.params.id);
      if (matchCount > 0) {
        return res.status(400).json({ message: "No se puede eliminar una fase que tiene partidos asignados" });
      }
      await storage.deleteStage(req.params.id);
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/admin/tournaments/:tournamentId/stages/reorder", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
    try {
      const { stageIds } = req.body as { stageIds: string[] };
      if (!Array.isArray(stageIds)) {
        return res.status(400).json({ message: "stageIds debe ser un array" });
      }
      for (let i = 0; i < stageIds.length; i++) {
        await storage.updateStage(stageIds[i], { sortOrder: i + 1 });
      }
      const stages = await storage.getStagesByTournament(req.params.tournamentId);
      res.json(stages);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Public stages endpoint for match forms
  app.get("/api/tournaments/:tournamentId/stages", authenticate, async (req, res) => {
    try {
      const stages = await storage.getStagesByTournament(req.params.tournamentId);
      res.json(stages);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Users
  app.get("/api/admin/users", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/admin/users", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByEmail(data.email);
      if (existing) {
        return res.status(400).json({ message: "El email ya está registrado" });
      }
      const user = await storage.createUser(data);
      const { passwordHash, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.put("/api/admin/users/:id", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
    try {
      const data = updateUserSchema.parse(req.body);
      if (data.email) {
        const existing = await storage.getUserByEmail(data.email);
        if (existing && existing.id !== req.params.id) {
          return res.status(400).json({ message: "El email ya está registrado por otro usuario" });
        }
      }
      const user = await storage.updateUser(req.params.id, data);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      const { passwordHash, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.delete("/api/admin/users/:id", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Teams
  app.get("/api/admin/teams", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
    try {
      const tournamentId = req.query.tournamentId as string | undefined;
      if (tournamentId) {
        const teams = await storage.getTeams(tournamentId);
        return res.json(teams);
      }
      const tournament = await storage.getActiveTournament();
      const teams = await storage.getTeams(tournament?.id);
      res.json(teams);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/admin/teams", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
    try {
      const data = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam(data);
      res.status(201).json(team);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.put("/api/admin/teams/:id", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
    try {
      const data = insertTeamSchema.partial().parse(req.body);
      const team = await storage.updateTeam(req.params.id, data);
      if (!team) {
        return res.status(404).json({ message: "Equipo no encontrado" });
      }
      res.json(team);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.delete("/api/admin/teams/:id", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
    try {
      await storage.deleteTeam(req.params.id);
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Players
  app.get("/api/admin/players", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
    try {
      const players = await storage.getPlayers();
      res.json(players);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/admin/players", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
    try {
      const data = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer(data);
      res.status(201).json(player);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.delete("/api/admin/players/:id", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
    try {
      await storage.deletePlayer(req.params.id);
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Matches
  app.get("/api/admin/matches", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
    try {
      const tournament = await storage.getActiveTournament();
      const matches = await storage.getMatches(tournament?.id);
      matches.sort((a, b) => a.roundNumber - b.roundNumber || new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
      res.json(matches);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/admin/matches", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
    try {
      const data = insertMatchSchema.parse(req.body);
      if (data.stageId) {
        const stage = await storage.getStage(data.stageId);
        if (!stage) {
          return res.status(400).json({ message: "La fase seleccionada no existe" });
        }
        if (stage.tournamentId !== data.tournamentId) {
          return res.status(400).json({ message: "La fase no pertenece al torneo seleccionado" });
        }
      }
      const match = await storage.createMatch(data);
      res.status(201).json(match);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.put("/api/admin/matches/:id", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
    try {
      const data = insertMatchSchema.partial().parse(req.body);
      if (data.stageId) {
        const stage = await storage.getStage(data.stageId);
        if (!stage) {
          return res.status(400).json({ message: "La fase seleccionada no existe" });
        }
        const existingMatch = await storage.getMatch(req.params.id);
        const tournamentId = data.tournamentId || existingMatch?.tournamentId;
        if (stage.tournamentId !== tournamentId) {
          return res.status(400).json({ message: "La fase no pertenece al torneo del partido" });
        }
      }
      const match = await storage.updateMatch(req.params.id, data);
      if (!match) {
        return res.status(404).json({ message: "Partido no encontrado" });
      }
      res.json(match);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.delete("/api/admin/matches/:id", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
    try {
      await storage.deleteMatch(req.params.id);
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Tournament
  app.put("/api/admin/tournaments/:id", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
    try {
      const data = insertTournamentSchema.partial().parse(req.body);
      const tournament = await storage.updateTournament(req.params.id, data);
      if (!tournament) {
        return res.status(404).json({ message: "Torneo no encontrado" });
      }
      res.json(tournament);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // News (Admin + Marketing)
  app.get("/api/admin/news", authenticate, authorizeRoles("ADMIN", "MARKETING"), async (req, res) => {
    try {
      const news = await storage.getNews();
      res.json(news);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/admin/news", authenticate, authorizeRoles("ADMIN", "MARKETING"), async (req: AuthRequest, res) => {
    try {
      const data = insertNewsSchema.parse(req.body);
      const news = await storage.createNews(data, req.user!.userId);
      res.status(201).json(news);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.put("/api/admin/news/:id", authenticate, authorizeRoles("ADMIN", "MARKETING"), async (req: AuthRequest, res) => {
    try {
      const data = insertNewsSchema.partial().parse(req.body);
      const news = await storage.updateNews(req.params.id, data);
      if (!news) {
        return res.status(404).json({ message: "Noticia no encontrada" });
      }
      res.json(news);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.delete("/api/admin/news/:id", authenticate, authorizeRoles("ADMIN", "MARKETING"), async (req, res) => {
    try {
      await storage.deleteNews(req.params.id);
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // ==================== CAPTAIN ====================
  app.get("/api/captain/team", authenticate, authorizeRoles("CAPITAN"), async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.userId);
      if (!user || !user.teamId) {
        return res.status(404).json({ message: "No tienes equipo asignado" });
      }
      const team = await storage.getTeam(user.teamId);
      if (!team) {
        return res.status(404).json({ message: "Equipo no encontrado" });
      }
      res.json(team);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.put("/api/captain/team", authenticate, authorizeRoles("CAPITAN"), async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.userId);
      if (!user || !user.teamId) {
        return res.status(404).json({ message: "No tienes equipo asignado" });
      }
      const data = insertTeamSchema.omit({ tournamentId: true, captainUserId: true }).partial().parse(req.body);
      const team = await storage.updateTeam(user.teamId, data);
      if (!team) {
        return res.status(404).json({ message: "Equipo no encontrado" });
      }
      res.json(team);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.get("/api/captain/players", authenticate, authorizeRoles("CAPITAN"), async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.userId);
      if (!user || !user.teamId) {
        return res.status(404).json({ message: "No tienes equipo asignado" });
      }
      const players = await storage.getPlayers(user.teamId);
      res.json(players);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/captain/players", authenticate, authorizeRoles("CAPITAN"), async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.userId);
      if (!user || !user.teamId) {
        return res.status(404).json({ message: "No tienes equipo asignado" });
      }
      const data = insertPlayerSchema.parse({ ...req.body, teamId: user.teamId });
      const player = await storage.createPlayer(data);
      res.status(201).json(player);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.delete("/api/captain/players/:id", authenticate, authorizeRoles("CAPITAN"), async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.userId);
      if (!user || !user.teamId) {
        return res.status(404).json({ message: "No tienes equipo asignado" });
      }
      const player = await storage.getPlayer(req.params.id);
      if (!player || player.teamId !== user.teamId) {
        return res.status(403).json({ message: "No puedes eliminar jugadores de otro equipo" });
      }
      await storage.deletePlayer(req.params.id);
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // ==================== ADMIN REFEREE PROFILES ====================
  // Returns ALL users with ARBITRO role, enriched with profile data if available
  app.get("/api/admin/referees", authenticate, authorizeRoles("ADMIN"), async (_req: AuthRequest, res) => {
    try {
      // Get all users and filter by ARBITRO role
      const allUsers = await storage.getUsers();
      const refereeUsers = allUsers.filter(u => u.role === "ARBITRO");
      
      // Get all referee profiles
      const profiles = await storage.getRefereeProfiles();
      const profilesByUserId = new Map(profiles.map(p => [p.userId, p]));
      
      // Combine users with their profiles (if they exist)
      const enrichedReferees = refereeUsers.map(user => {
        const profile = profilesByUserId.get(user.id);
        return {
          userId: user.id,
          user: { id: user.id, name: user.name, email: user.email },
          profile: profile || null,
          hasProfile: !!profile,
        };
      });
      
      res.json(enrichedReferees);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.get("/api/admin/referees/:id", authenticate, authorizeRoles("ADMIN"), async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getRefereeProfileById(req.params.id);
      if (!profile) {
        return res.status(404).json({ message: "Perfil de árbitro no encontrado" });
      }
      const user = await storage.getUser(profile.userId);
      res.json({
        ...profile,
        user: user ? { id: user.id, name: user.name, email: user.email } : null,
      });
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.put("/api/admin/referees/:id", authenticate, authorizeRoles("ADMIN"), async (req: AuthRequest, res) => {
    try {
      const data = insertRefereeProfileSchema.partial().parse(req.body);
      const profile = await storage.updateRefereeProfileById(req.params.id, data);
      if (!profile) {
        return res.status(404).json({ message: "Perfil de árbitro no encontrado" });
      }
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.delete("/api/admin/referees/:id", authenticate, authorizeRoles("ADMIN"), async (req: AuthRequest, res) => {
    try {
      await storage.deleteRefereeProfile(req.params.id);
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.get("/api/captain/matches", authenticate, authorizeRoles("CAPITAN"), async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.userId);
      if (!user || !user.teamId) {
        return res.status(404).json({ message: "No tienes equipo asignado" });
      }
      const matches = await storage.getMatchesByTeam(user.teamId);
      matches.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
      res.json(matches);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Captain Profile endpoints
  app.get("/api/captain/profile", authenticate, authorizeRoles("CAPITAN"), async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getCaptainProfile(req.user!.userId);
      res.json(profile || null);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/captain/profile", authenticate, authorizeRoles("CAPITAN"), async (req: AuthRequest, res) => {
    try {
      const existingProfile = await storage.getCaptainProfile(req.user!.userId);
      if (existingProfile) {
        return res.status(400).json({ message: "Ya tienes un perfil creado" });
      }
      const data = insertCaptainProfileSchema.parse(req.body);
      const profile = await storage.createCaptainProfile(req.user!.userId, data);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.put("/api/captain/profile", authenticate, authorizeRoles("CAPITAN"), async (req: AuthRequest, res) => {
    try {
      const data = insertCaptainProfileSchema.partial().parse(req.body);
      const profile = await storage.updateCaptainProfile(req.user!.userId, data);
      if (!profile) {
        return res.status(404).json({ message: "Perfil no encontrado" });
      }
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // ==================== REFEREE ====================
  // Helper function to check profile completion
  const requireRefereeProfile = async (userId: string): Promise<boolean> => {
    const profile = await storage.getRefereeProfile(userId);
    return !!profile;
  };

  app.get("/api/referee/matches", authenticate, authorizeRoles("ARBITRO"), async (req: AuthRequest, res) => {
    try {
      // Allow viewing matches without profile (so they can see what's assigned)
      // but profile is required for mutations
      const matches = await storage.getMatchesByReferee(req.user!.userId);
      matches.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
      res.json(matches);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/referee/matches/:id/result", authenticate, authorizeRoles("ARBITRO", "ADMIN"), async (req: AuthRequest, res) => {
    try {
      if (req.user!.role === "ARBITRO") {
        const refereeProfile = await storage.getRefereeProfile(req.user!.userId);
        if (!refereeProfile) {
          return res.status(403).json({ message: "Debes completar tu perfil antes de cargar resultados" });
        }
      }

      const match = await storage.getMatch(req.params.id);
      if (!match) {
        return res.status(404).json({ message: "Partido no encontrado" });
      }
      if (req.user!.role !== "ADMIN" && match.refereeUserId !== req.user!.userId) {
        return res.status(403).json({ message: "No estás asignado a este partido" });
      }
      if (match.status === "JUGADO") {
        return res.status(400).json({ message: "El partido ya tiene resultado" });
      }

      const data = matchResultSchema.parse(req.body);

      // Update match with result and confirm refereeUserId for traceability
      await storage.updateMatch(match.id, {
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        status: "JUGADO",
        refereeUserId: req.user!.userId,
        refereeNotes: data.refereeNotes || undefined,
      });

      // Save evidence photos
      if (data.evidenceUrls && data.evidenceUrls.length > 0) {
        for (const url of data.evidenceUrls) {
          await storage.createMatchEvidence({
            matchId: match.id,
            type: "PHOTO",
            url,
          });
        }
      }

      // Delete old events and create new ones
      await storage.deleteMatchEvents(match.id);
      for (const event of data.events) {
        await storage.createMatchEvent({
          matchId: match.id,
          type: event.type,
          minute: event.minute,
          teamId: event.teamId,
          playerId: event.playerId,
        });
      }

      const updatedMatch = await storage.getMatchWithTeams(match.id);
      res.json(updatedMatch);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Referee Profile endpoints
  app.get("/api/referee/profile", authenticate, authorizeRoles("ARBITRO"), async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getRefereeProfile(req.user!.userId);
      res.json(profile || null);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/referee/profile", authenticate, authorizeRoles("ARBITRO"), async (req: AuthRequest, res) => {
    try {
      const existing = await storage.getRefereeProfile(req.user!.userId);
      if (existing) {
        return res.status(400).json({ message: "Ya tienes un perfil registrado" });
      }
      const data = insertRefereeProfileSchema.parse(req.body);
      const profile = await storage.createRefereeProfile(req.user!.userId, data);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.put("/api/referee/profile", authenticate, authorizeRoles("ARBITRO"), async (req: AuthRequest, res) => {
    try {
      const existing = await storage.getRefereeProfile(req.user!.userId);
      if (!existing) {
        return res.status(404).json({ message: "Perfil no encontrado" });
      }
      const data = insertRefereeProfileSchema.partial().parse(req.body);
      const updated = await storage.updateRefereeProfile(req.user!.userId, data);
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // ==================== DIVISIONS ====================
  app.get("/api/divisions", async (_req, res) => {
    try {
      const divisions = await storage.getDivisions();
      res.json(divisions);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.get("/api/divisions/:id", async (req, res) => {
    try {
      const division = await storage.getDivision(req.params.id);
      if (!division) {
        return res.status(404).json({ message: "División no encontrada" });
      }
      res.json(division);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.get("/api/admin/divisions", authenticate, authorizeRoles("ADMIN"), async (req: AuthRequest, res) => {
    try {
      const divisions = await storage.getDivisions();
      res.json(divisions);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/admin/divisions", authenticate, authorizeRoles("ADMIN"), async (req: AuthRequest, res) => {
    try {
      const data = insertDivisionSchema.parse(req.body);
      const division = await storage.createDivision(data);
      res.status(201).json(division);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.put("/api/admin/divisions/:id", authenticate, authorizeRoles("ADMIN"), async (req: AuthRequest, res) => {
    try {
      const data = insertDivisionSchema.partial().parse(req.body);
      const division = await storage.updateDivision(req.params.id, data);
      if (!division) {
        return res.status(404).json({ message: "División no encontrada" });
      }
      res.json(division);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.delete("/api/admin/divisions/:id", authenticate, authorizeRoles("ADMIN"), async (req: AuthRequest, res) => {
    try {
      await storage.deleteDivision(req.params.id);
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // ==================== TOURNAMENT TYPES ====================
  app.get("/api/tournament-types", async (_req, res) => {
    try {
      const types = await storage.getTournamentTypes();
      res.json(types);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.get("/api/tournament-types/:id", async (req, res) => {
    try {
      const type = await storage.getTournamentType(req.params.id);
      if (!type) {
        return res.status(404).json({ message: "Tipo de torneo no encontrado" });
      }
      res.json(type);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // ==================== SCHEDULE GENERATION ====================
  app.post("/api/admin/tournaments/:id/generate-schedule", authenticate, authorizeRoles("ADMIN"), async (req: AuthRequest, res) => {
    try {
      const tournamentId = req.params.id;
      const { doubleRound } = req.body;
      
      const tournament = await storage.getTournament(tournamentId);
      if (!tournament) {
        return res.status(404).json({ message: "Torneo no encontrado" });
      }
      
      const teams = await storage.getTeams(tournamentId);
      if (teams.length < 2) {
        return res.status(400).json({ message: "Se necesitan al menos 2 equipos para generar el calendario" });
      }
      
      const matches = await storage.generateRoundRobinSchedule(tournamentId, doubleRound === true);
      res.status(201).json({ 
        message: `Calendario generado: ${matches.length} partidos en ${Math.max(...matches.map(m => m.roundNumber))} jornadas`,
        matches 
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.get("/api/admin/tournaments/:id/schedule-preview", authenticate, authorizeRoles("ADMIN"), async (req: AuthRequest, res) => {
    try {
      const tournamentId = req.params.id;
      const { doubleRound } = req.query;
      
      const tournament = await storage.getTournament(tournamentId);
      if (!tournament) {
        return res.status(404).json({ message: "Torneo no encontrado" });
      }
      
      const teams = await storage.getTeams(tournamentId);
      if (teams.length < 2) {
        return res.status(400).json({ message: "Se necesitan al menos 2 equipos" });
      }
      
      // Generate preview without saving
      const teamIds = teams.map(t => t.id);
      const n = teamIds.length;
      const hasOdd = n % 2 !== 0;
      if (hasOdd) teamIds.push("BYE");
      
      const numTeams = teamIds.length;
      const numRounds = numTeams - 1;
      const matchesPerRound = numTeams / 2;
      const totalRounds = doubleRound === "true" ? numRounds * 2 : numRounds;
      const matchesWithoutBye = hasOdd ? matchesPerRound - 1 : matchesPerRound;
      const totalMatches = matchesWithoutBye * totalRounds;
      
      res.json({
        teams: teams.length,
        rounds: totalRounds,
        matchesPerRound: matchesWithoutBye,
        totalMatches,
        hasOddTeams: hasOdd,
        doubleRound: doubleRound === "true",
      });
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // ==================== MATCH LINEUPS (Referee) ====================
  app.get("/api/referee/matches/:id/lineups", authenticate, authorizeRoles("ARBITRO", "ADMIN"), async (req: AuthRequest, res) => {
    try {
      const lineups = await storage.getMatchLineups(req.params.id);
      res.json(lineups);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/referee/matches/:id/lineups", authenticate, authorizeRoles("ARBITRO", "ADMIN"), async (req: AuthRequest, res) => {
    try {
      const data = insertMatchLineupSchema.parse({ ...req.body, matchId: req.params.id });
      
      // Delete existing lineup for this specific team only (not the other team's lineup)
      await storage.deleteMatchLineupByTeam(req.params.id, data.teamId);
      
      const lineup = await storage.createMatchLineup(data);
      res.status(201).json(lineup);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // ==================== MATCH ATTENDANCE (Referee) ====================
  app.get("/api/referee/matches/:id/attendance", authenticate, authorizeRoles("ARBITRO", "ADMIN"), async (req: AuthRequest, res) => {
    try {
      const attendance = await storage.getMatchAttendance(req.params.id);
      res.json(attendance);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/referee/matches/:id/attendance", authenticate, authorizeRoles("ARBITRO", "ADMIN"), async (req: AuthRequest, res) => {
    try {
      const data = saveAttendanceSchema.parse(req.body);
      const result = await storage.saveMatchAttendance(req.params.id, data.teamId, data.attendance);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/referee/matches/:id/no-show", authenticate, authorizeRoles("ARBITRO", "ADMIN"), async (req: AuthRequest, res) => {
    try {
      const match = await storage.getMatch(req.params.id);
      if (!match) {
        return res.status(404).json({ message: "Partido no encontrado" });
      }
      const { teamId } = z.object({ teamId: z.string() }).parse(req.body);
      const existingFines = await storage.getFines(match.tournamentId);
      const alreadyFined = existingFines.some(f => f.matchId === req.params.id && f.teamId === teamId && f.cardType === "NO_PRESENTADO");
      if (alreadyFined) {
        return res.status(400).json({ message: "Ya se registró la incomparecencia de este equipo" });
      }
      const fine = await storage.createFine({
        tournamentId: match.tournamentId,
        matchId: req.params.id,
        teamId,
        playerId: null,
        cardType: "NO_PRESENTADO",
        amount: 15,
        status: "PENDIENTE",
      });
      res.status(201).json(fine);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Admin: view attendance
  app.get("/api/admin/matches/:id/attendance", authenticate, authorizeRoles("ADMIN"), async (req: AuthRequest, res) => {
    try {
      const attendance = await storage.getMatchAttendance(req.params.id);
      res.json(attendance);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // ==================== MATCH FLOW (Referee) ====================
  app.post("/api/referee/matches/:id/start", authenticate, authorizeRoles("ARBITRO", "ADMIN"), async (req: AuthRequest, res) => {
    try {
      const match = await storage.getMatch(req.params.id);
      if (!match) {
        return res.status(404).json({ message: "Partido no encontrado" });
      }
      
      if (match.status !== "PROGRAMADO") {
        return res.status(400).json({ message: "El partido ya fue iniciado o finalizado" });
      }
      
      const updated = await storage.updateMatch(req.params.id, { status: "EN_CURSO" });
      res.json(updated);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/referee/matches/:id/finalize", authenticate, authorizeRoles("ARBITRO", "ADMIN"), async (req: AuthRequest, res) => {
    try {
      const match = await storage.getMatch(req.params.id);
      if (!match) {
        return res.status(404).json({ message: "Partido no encontrado" });
      }
      
      // Status guard: only allow finalize from EN_CURSO or PROGRAMADO (for admin flexibility)
      if (match.status === "JUGADO") {
        return res.status(400).json({ message: "El partido ya fue finalizado" });
      }
      
      const { homeScore, awayScore, refereeNotes, evidenceUrls } = matchResultSchema.pick({ homeScore: true, awayScore: true, refereeNotes: true, evidenceUrls: true }).parse(req.body);
      
      const updated = await storage.updateMatch(req.params.id, { 
        status: "JUGADO",
        homeScore,
        awayScore,
        refereeNotes: refereeNotes || undefined,
      });

      if (evidenceUrls && evidenceUrls.length > 0) {
        for (const url of evidenceUrls) {
          await storage.createMatchEvidence({
            matchId: req.params.id,
            type: "PHOTO",
            url,
          });
        }
      }
      
      // Decrement active suspensions for both teams (they played this match)
      await storage.decrementSuspensions(match.tournamentId, match.homeTeamId);
      await storage.decrementSuspensions(match.tournamentId, match.awayTeamId);

      // Generate fines for card events (only if not already generated)
      const existingFines = await storage.getFines(match.tournamentId);
      const matchFines = existingFines.filter(f => f.matchId === req.params.id);
      
      // Only generate fines if none exist for this match
      if (matchFines.length === 0) {
        const tournament = await storage.getTournament(match.tournamentId);
        if (tournament) {
          const events = await storage.getMatchEvents(req.params.id);
          for (const event of events) {
            let amount = 0;
            let cardType: "YELLOW" | "RED" | "RED_DIRECT" | null = null;
            
            if (event.type === "YELLOW" && tournament.fineYellow) {
              amount = tournament.fineYellow;
              cardType = "YELLOW";
            } else if (event.type === "RED" && tournament.fineRed) {
              amount = tournament.fineRed;
              cardType = "RED";
            } else if (event.type === "RED_DIRECT" && tournament.fineRedDirect) {
              amount = tournament.fineRedDirect;
              cardType = "RED_DIRECT";
            }
            
            if (cardType && amount > 0) {
              await storage.createFine({
                tournamentId: match.tournamentId,
                matchId: req.params.id,
                matchEventId: event.id,
                teamId: event.teamId,
                playerId: event.playerId,
                cardType,
                amount,
                status: "PENDIENTE",
              });
            }

            if ((event.type === "RED" || event.type === "RED_DIRECT") && event.playerId) {
              const existingSuspensions = await storage.getPlayerSuspensions(match.tournamentId, event.teamId, "ACTIVO");
              const alreadySuspended = existingSuspensions.some(s => s.matchId === req.params.id && s.playerId === event.playerId);
              if (!alreadySuspended) {
                const reason = event.type === "RED_DIRECT" ? "Tarjeta roja directa" : "Doble tarjeta amarilla (roja)";
                await storage.createPlayerSuspension({
                  tournamentId: match.tournamentId,
                  playerId: event.playerId,
                  teamId: event.teamId,
                  matchId: req.params.id,
                  matchEventId: event.id,
                  reason,
                  matchesRemaining: 1,
                  status: "ACTIVO",
                });
              }
            }
          }
        }
      }
      
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // ==================== MATCH EVIDENCE ====================
  app.get("/api/referee/matches/:id/evidence", authenticate, authorizeRoles("ARBITRO", "ADMIN"), async (req: AuthRequest, res) => {
    try {
      const evidence = await storage.getMatchEvidence(req.params.id);
      res.json(evidence);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/referee/matches/:id/evidence", authenticate, authorizeRoles("ARBITRO", "ADMIN"), async (req: AuthRequest, res) => {
    try {
      const data = insertMatchEvidenceSchema.parse({ ...req.body, matchId: req.params.id });
      const evidence = await storage.createMatchEvidence(data);
      res.status(201).json(evidence);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // ==================== PLAYER SUSPENSIONS ====================
  app.get("/api/admin/suspensions", authenticate, authorizeRoles("ADMIN"), async (req: AuthRequest, res) => {
    try {
      const { tournamentId, teamId, status } = req.query;
      if (!tournamentId) return res.status(400).json({ message: "tournamentId requerido" });
      const suspensions = await storage.getPlayerSuspensions(tournamentId as string, teamId as string, status as string);
      res.json(suspensions);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.get("/api/suspensions/active", authenticate, async (req: AuthRequest, res) => {
    try {
      const { tournamentId, teamId } = req.query;
      if (!tournamentId) return res.status(400).json({ message: "tournamentId requerido" });
      const suspensions = await storage.getPlayerSuspensions(tournamentId as string, teamId as string, "ACTIVO");
      res.json(suspensions);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // ==================== FINES ====================
  app.get("/api/admin/fines", authenticate, authorizeRoles("ADMIN"), async (req: AuthRequest, res) => {
    try {
      const { tournamentId, teamId } = req.query;
      const fines = await storage.getFines(tournamentId as string, teamId as string);
      res.json(fines);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.put("/api/admin/fines/:id", authenticate, authorizeRoles("ADMIN"), async (req: AuthRequest, res) => {
    try {
      const fine = await storage.updateFine(req.params.id, req.body);
      if (!fine) {
        return res.status(404).json({ message: "Multa no encontrada" });
      }
      res.json(fine);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.get("/api/captain/fines", authenticate, authorizeRoles("CAPITAN"), async (req: AuthRequest, res) => {
    try {
      const team = await storage.getTeamByCaptain(req.user!.userId);
      if (!team) {
        return res.status(404).json({ message: "No tienes equipo asignado" });
      }
      const fines = await storage.getFines(undefined, team.id);
      res.json(fines);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // ==================== TEAM PAYMENTS ====================
  app.get("/api/admin/payments", authenticate, authorizeRoles("ADMIN"), async (req: AuthRequest, res) => {
    try {
      const { tournamentId, teamId } = req.query;
      const payments = await storage.getTeamPayments(tournamentId as string, teamId as string);
      res.json(payments);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/admin/payments", authenticate, authorizeRoles("ADMIN"), async (req: AuthRequest, res) => {
    try {
      const data = insertTeamPaymentSchema.parse(req.body);
      const payment = await storage.createTeamPayment(data);
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.get("/api/captain/payments", authenticate, authorizeRoles("CAPITAN"), async (req: AuthRequest, res) => {
    try {
      const team = await storage.getTeamByCaptain(req.user!.userId);
      if (!team) {
        return res.status(404).json({ message: "No tienes equipo asignado" });
      }
      const payments = await storage.getTeamPayments(undefined, team.id);
      res.json(payments);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // ==================== FINE PAYMENTS ====================
  app.get("/api/admin/fine-payments", authenticate, authorizeRoles("ADMIN"), async (req: AuthRequest, res) => {
    try {
      const { tournamentId, teamId } = req.query;
      const payments = await storage.getFinePayments(tournamentId as string, teamId as string);
      res.json(payments);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/admin/fine-payments", authenticate, authorizeRoles("ADMIN"), async (req: AuthRequest, res) => {
    try {
      const data = insertFinePaymentSchema.parse(req.body);
      
      // Mark the fine as paid if fineId is provided
      if (data.fineId) {
        await storage.updateFine(data.fineId, { status: "PAGADA" });
      }
      
      const payment = await storage.createFinePayment(data);
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error creating fine payment:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.get("/api/captain/fine-payments", authenticate, authorizeRoles("CAPITAN"), async (req: AuthRequest, res) => {
    try {
      const team = await storage.getTeamByCaptain(req.user!.userId);
      if (!team) {
        return res.status(404).json({ message: "No tienes equipo asignado" });
      }
      const payments = await storage.getFinePayments(undefined, team.id);
      res.json(payments);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // ==================== EXPENSES ====================
  app.get("/api/admin/expenses", authenticate, authorizeRoles("ADMIN"), async (req: AuthRequest, res) => {
    try {
      const { tournamentId } = req.query;
      const expenses = await storage.getExpenses(tournamentId as string);
      res.json(expenses);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/admin/expenses", authenticate, authorizeRoles("ADMIN"), async (req: AuthRequest, res) => {
    try {
      const data = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(data);
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error creating expense:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.delete("/api/admin/expenses/:id", authenticate, authorizeRoles("ADMIN"), async (req: AuthRequest, res) => {
    try {
      await storage.deleteExpense(req.params.id);
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // ==================== MARKETING MEDIA (Public Gallery) ====================
  app.get("/api/home/gallery", async (_req, res) => {
    try {
      const media = await storage.getMarketingMedia();
      const photos = media.filter(m => m.type === "PHOTO");
      res.json(photos);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // ==================== MARKETING MEDIA (Admin + Marketing) ====================
  app.get("/api/admin/marketing", authenticate, authorizeRoles("ADMIN", "MARKETING"), async (req: AuthRequest, res) => {
    try {
      const media = await storage.getMarketingMedia();
      res.json(media);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/admin/marketing", authenticate, authorizeRoles("ADMIN", "MARKETING"), async (req: AuthRequest, res) => {
    try {
      const data = insertMarketingMediaSchema.parse(req.body);
      const media = await storage.createMarketingMedia(data);
      res.status(201).json(media);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.put("/api/admin/marketing/:id", authenticate, authorizeRoles("ADMIN", "MARKETING"), async (req: AuthRequest, res) => {
    try {
      const data = insertMarketingMediaSchema.partial().parse(req.body);
      const media = await storage.updateMarketingMedia(req.params.id, data);
      if (!media) return res.status(404).json({ message: "Contenido no encontrado" });
      res.json(media);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.delete("/api/admin/marketing/:id", authenticate, authorizeRoles("ADMIN", "MARKETING"), async (req: AuthRequest, res) => {
    try {
      await storage.deleteMarketingMedia(req.params.id);
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // ==================== PUBLIC CONTACT MESSAGES ====================
  app.post("/api/contact", async (req, res) => {
    try {
      const data = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(data);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error creating contact message:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // ==================== ADMIN CONTACT MESSAGES ====================
  app.get("/api/admin/messages", authenticate, authorizeRoles("ADMIN"), async (req: AuthRequest, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.put("/api/admin/messages/:id/status", authenticate, authorizeRoles("ADMIN"), async (req: AuthRequest, res) => {
    try {
      const { status } = req.body;
      if (!["NUEVO", "LEIDO", "RESPONDIDO"].includes(status)) {
        return res.status(400).json({ message: "Estado inválido" });
      }
      const updated = await storage.updateContactMessageStatus(req.params.id, status);
      if (!updated) return res.status(404).json({ message: "Mensaje no encontrado" });
      res.json(updated);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.delete("/api/admin/messages/:id", authenticate, authorizeRoles("ADMIN"), async (req: AuthRequest, res) => {
    try {
      await storage.deleteContactMessage(req.params.id);
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // ==================== AI CONTENT GENERATION ====================
  app.post("/api/ai/generate-content", authenticate, authorizeRoles("ADMIN", "MARKETING"), async (req: AuthRequest, res) => {
    try {
      const { photoUrls, contentType, context } = req.body;
      if (!photoUrls || !Array.isArray(photoUrls) || photoUrls.length === 0) {
        return res.status(400).json({ message: "Se requiere al menos una URL de foto" });
      }

      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });

      const protocol = req.headers["x-forwarded-proto"] || "https";
      const host = req.headers.host || "localhost:5000";
      const baseUrl = `${protocol}://${host}`;

      const imageContents = photoUrls.slice(0, 4).map((url: string) => ({
        type: "image_url" as const,
        image_url: { url: url.startsWith("http") ? url : `${baseUrl}${url}` },
      }));

      const formatLabel = contentType === "story" ? "Historia de Instagram" : contentType === "reel" ? "Reel de Instagram" : "Post de Instagram (Feed)";

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Eres el community manager de "La Liga de Campeones", una liga de fútbol amateur en Fuengirola, España. Tu trabajo es crear contenido atractivo para redes sociales (Instagram) basado en las fotos que se te proporcionan.

REGLAS:
- Escribe SIEMPRE en español (España)
- Usa un tono entusiasta pero profesional, cercano al público
- Si ves equipos, jugadores, un partido o acción de juego, describe lo que ves y crea contenido relacionado
- Si ves fotos generales (grupo, celebración, entrega de premios, etc.), crea contenido acorde
- NO inventes nombres de equipos ni jugadores si no los puedes leer/identificar en la foto
- Si NO puedes identificar equipos/jugadores, usa descripciones genéricas sin inventar datos
- Genera hashtags relevantes para fútbol amateur español

FORMATO DE RESPUESTA (JSON estricto):
{
  "copy": "texto de la publicación adaptado al formato ${formatLabel}",
  "hashtags": ["#hashtag1", "#hashtag2", ...],
  "team1": "nombre equipo local si identificable, vacío si no",
  "team2": "nombre equipo visitante si identificable, vacío si no",
  "score1": "goles local si visible, vacío si no",
  "score2": "goles visitante si visible, vacío si no",
  "matchday": "número de jornada si visible, vacío si no",
  "description": "breve descripción de lo que ves en las fotos (1-2 frases)"
}

${contentType === "story" ? "Para Historias: texto corto y directo, máximo 3-4 líneas." : contentType === "reel" ? "Para Reels: texto muy corto, 1-2 líneas con gancho." : "Para Posts: texto más desarrollado con emojis, 5-8 líneas con CTA al final."}`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: context
                  ? `Analiza estas fotos y genera contenido para ${formatLabel}. Contexto adicional: ${context}`
                  : `Analiza estas fotos y genera contenido para ${formatLabel}.`,
              },
              ...imageContents,
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return res.status(500).json({ message: "No se pudo generar contenido" });
      }

      const parsed = JSON.parse(content);
      res.json(parsed);
    } catch (error: any) {
      console.error("Error generando contenido con IA:", error);
      res.status(500).json({ message: error.message || "Error al generar contenido con IA" });
    }
  });

  return httpServer;
}
