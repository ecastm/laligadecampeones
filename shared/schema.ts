import { z } from "zod";

// Enums
export const UserRole = {
  ADMIN: "ADMIN",
  CAPITAN: "CAPITAN",
  ARBITRO: "ARBITRO",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const MatchStatus = {
  PROGRAMADO: "PROGRAMADO",
  JUGADO: "JUGADO",
} as const;
export type MatchStatus = (typeof MatchStatus)[keyof typeof MatchStatus];

export const EventType = {
  GOAL: "GOAL",
  YELLOW: "YELLOW",
  RED: "RED",
} as const;
export type EventType = (typeof EventType)[keyof typeof EventType];

// User
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  teamId?: string;
  createdAt: string;
}

export const insertUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["ADMIN", "CAPITAN", "ARBITRO"]),
  teamId: z.string().optional(),
});
export type InsertUser = z.infer<typeof insertUserSchema>;

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});
export type LoginCredentials = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirma tu contraseña"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});
export type RegisterCredentials = z.infer<typeof registerSchema>;

// Tournament
export interface Tournament {
  id: string;
  name: string;
  seasonName: string;
  active: boolean;
}

export const insertTournamentSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  seasonName: z.string().min(2, "La temporada debe tener al menos 2 caracteres"),
  active: z.boolean().default(true),
});
export type InsertTournament = z.infer<typeof insertTournamentSchema>;

// Team
export interface Team {
  id: string;
  tournamentId: string;
  name: string;
  colors: string;
  homeField: string;
  logoUrl?: string;
  captainUserId?: string;
}

export const insertTeamSchema = z.object({
  tournamentId: z.string(),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  colors: z.string().min(2, "Los colores son requeridos"),
  homeField: z.string().min(2, "La sede es requerida"),
  logoUrl: z.string().optional(),
  captainUserId: z.string().optional(),
});
export type InsertTeam = z.infer<typeof insertTeamSchema>;

// Player
export interface Player {
  id: string;
  teamId: string;
  firstName: string;
  lastName: string;
  jerseyNumber: number;
  position?: string;
  active: boolean;
}

export const insertPlayerSchema = z.object({
  teamId: z.string(),
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  jerseyNumber: z.number().min(1).max(99, "Número de camiseta entre 1 y 99"),
  position: z.string().optional(),
  active: z.boolean().default(true),
});
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

// Match
export interface Match {
  id: string;
  tournamentId: string;
  roundNumber: number;
  dateTime: string;
  field: string;
  homeTeamId: string;
  awayTeamId: string;
  refereeUserId?: string;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
}

export const insertMatchSchema = z.object({
  tournamentId: z.string(),
  roundNumber: z.number().min(1, "La jornada debe ser al menos 1"),
  dateTime: z.string(),
  field: z.string().min(2, "La cancha es requerida"),
  homeTeamId: z.string(),
  awayTeamId: z.string(),
  refereeUserId: z.string().optional(),
  status: z.enum(["PROGRAMADO", "JUGADO"]).default("PROGRAMADO"),
  homeScore: z.number().optional(),
  awayScore: z.number().optional(),
});
export type InsertMatch = z.infer<typeof insertMatchSchema>;

// Match Event
export interface MatchEvent {
  id: string;
  matchId: string;
  type: EventType;
  minute: number;
  teamId: string;
  playerId: string;
}

export const insertMatchEventSchema = z.object({
  matchId: z.string(),
  type: z.enum(["GOAL", "YELLOW", "RED"]),
  minute: z.number().min(1).max(120, "El minuto debe estar entre 1 y 120"),
  teamId: z.string(),
  playerId: z.string(),
});
export type InsertMatchEvent = z.infer<typeof insertMatchEventSchema>;

// Match result submission (for referees)
export const matchResultSchema = z.object({
  homeScore: z.number().min(0, "El marcador no puede ser negativo"),
  awayScore: z.number().min(0, "El marcador no puede ser negativo"),
  events: z.array(z.object({
    type: z.enum(["GOAL", "YELLOW", "RED"]),
    minute: z.number().min(1).max(120),
    teamId: z.string(),
    playerId: z.string(),
  })),
});
export type MatchResult = z.infer<typeof matchResultSchema>;

// Standings (calculated)
export interface Standing {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

// Extended types with relations for frontend
export interface MatchWithTeams extends Match {
  homeTeam: Team;
  awayTeam: Team;
  referee?: User;
  events?: MatchEventWithPlayer[];
}

export interface MatchEventWithPlayer extends MatchEvent {
  player: Player;
  team: Team;
}

export interface TeamWithPlayers extends Team {
  players: Player[];
  captain?: User;
}

// Auth response
export interface AuthResponse {
  token: string;
  user: Omit<User, 'passwordHash'>;
}
