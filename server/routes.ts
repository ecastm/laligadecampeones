import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticate, authorizeRoles, generateToken, verifyPassword, hashPassword, type AuthRequest } from "./auth";
import {
  loginSchema,
  registerSchema,
  insertUserSchema,
  insertTeamSchema,
  insertPlayerSchema,
  insertMatchSchema,
  insertTournamentSchema,
  finishTournamentSchema,
  matchResultSchema,
  insertNewsSchema,
  insertRefereeProfileSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

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

  app.get("/api/home/schedule", async (req, res) => {
    try {
      const tournament = await storage.getActiveTournament();
      if (!tournament) {
        return res.json([]);
      }
      const matches = await storage.getMatches(tournament.id);
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

  app.get("/api/home/standings", async (req, res) => {
    try {
      const tournament = await storage.getActiveTournament();
      if (!tournament) {
        return res.json([]);
      }
      const standings = await storage.calculateStandings(tournament.id);
      res.json(standings);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.get("/api/home/results", async (req, res) => {
    try {
      const tournament = await storage.getActiveTournament();
      if (!tournament) {
        return res.json([]);
      }
      const matches = await storage.getMatches(tournament.id);
      const playedMatches = matches.filter(m => m.status === "JUGADO");
      const result = [];
      for (const match of playedMatches) {
        const withTeams = await storage.getMatchWithTeams(match.id);
        if (withTeams) result.push(withTeams);
      }
      result.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
      res.json(result.slice(0, 10));
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.get("/api/home/teams", async (req, res) => {
    try {
      const tournament = await storage.getActiveTournament();
      if (!tournament) {
        return res.json([]);
      }
      const teams = await storage.getTeams(tournament.id);
      res.json(teams);
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
      const tournament = await storage.getActiveTournament();
      if (!tournament) {
        return res.json([]);
      }
      const news = await storage.getNews(tournament.id);
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

  // News (Admin)
  app.get("/api/admin/news", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
    try {
      const news = await storage.getNews();
      res.json(news);
    } catch {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/admin/news", authenticate, authorizeRoles("ADMIN"), async (req: AuthRequest, res) => {
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

  app.put("/api/admin/news/:id", authenticate, authorizeRoles("ADMIN"), async (req: AuthRequest, res) => {
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

  app.delete("/api/admin/news/:id", authenticate, authorizeRoles("ADMIN"), async (req, res) => {
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

  app.post("/api/referee/matches/:id/result", authenticate, authorizeRoles("ARBITRO"), async (req: AuthRequest, res) => {
    try {
      // Enforce mandatory profile completion before allowing result submission
      const refereeProfile = await storage.getRefereeProfile(req.user!.userId);
      if (!refereeProfile) {
        return res.status(403).json({ message: "Debes completar tu perfil antes de cargar resultados" });
      }

      const match = await storage.getMatch(req.params.id);
      if (!match) {
        return res.status(404).json({ message: "Partido no encontrado" });
      }
      if (match.refereeUserId !== req.user!.userId) {
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
        refereeUserId: req.user!.userId, // Confirm/lock referee who registered the result
      });

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

  return httpServer;
}
