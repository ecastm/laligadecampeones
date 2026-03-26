import { z } from "zod";

// Enums
export const UserRole = {
  ADMIN: "ADMIN",
  CAPITAN: "CAPITAN",
  ARBITRO: "ARBITRO",
  MARKETING: "MARKETING",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const MatchStatus = {
  PROGRAMADO: "PROGRAMADO",
  EN_CURSO: "EN_CURSO",
  JUGADO: "JUGADO",
} as const;
export type MatchStatus = (typeof MatchStatus)[keyof typeof MatchStatus];

export const MatchStage = {
  JORNADA: "JORNADA",
  OCTAVOS: "OCTAVOS",
  CUARTOS: "CUARTOS",
  SEMIFINAL: "SEMIFINAL",
  TERCER_LUGAR: "TERCER_LUGAR",
  FINAL: "FINAL",
} as const;
export type MatchStage = (typeof MatchStage)[keyof typeof MatchStage];

export const MatchStageLabels: Record<MatchStage, string> = {
  JORNADA: "Jornada",
  OCTAVOS: "Octavos de Final",
  CUARTOS: "Cuartos de Final",
  SEMIFINAL: "Semifinal",
  TERCER_LUGAR: "Tercer Lugar",
  FINAL: "Final",
};

export const TournamentStatus = {
  ACTIVO: "ACTIVO",
  FINALIZADO: "FINALIZADO",
} as const;
export type TournamentStatus = (typeof TournamentStatus)[keyof typeof TournamentStatus];

export const EventType = {
  GOAL: "GOAL",
  YELLOW: "YELLOW",
  RED: "RED",
  RED_DIRECT: "RED_DIRECT",
  SUBSTITUTION: "SUBSTITUTION",
  NOTE: "NOTE",
} as const;
export type EventType = (typeof EventType)[keyof typeof EventType];

// Division - Primera / Segunda
export const DivisionTheme = {
  PRIMERA: "PRIMERA",
  SEGUNDA: "SEGUNDA",
} as const;
export type DivisionTheme = (typeof DivisionTheme)[keyof typeof DivisionTheme];

export interface Division {
  id: string;
  name: string;
  theme: DivisionTheme;
  description?: string;
  createdAt: string;
}

export const insertDivisionSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  theme: z.enum(["PRIMERA", "SEGUNDA"]),
  description: z.string().optional(),
});
export type InsertDivision = z.infer<typeof insertDivisionSchema>;

// Tournament Types (Catalog)
export const TournamentTypeAlgorithm = {
  ROUND_ROBIN: "ROUND_ROBIN",
  ROUND_ROBIN_DOUBLE: "ROUND_ROBIN_DOUBLE",
  KNOCKOUT: "KNOCKOUT",
  DOUBLE_ELIMINATION: "DOUBLE_ELIMINATION",
  GROUPS_PLAYOFFS: "GROUPS_PLAYOFFS",
  LEAGUE_FINAL: "LEAGUE_FINAL",
} as const;
export type TournamentTypeAlgorithm = (typeof TournamentTypeAlgorithm)[keyof typeof TournamentTypeAlgorithm];

export interface TournamentType {
  id: string;
  name: string;
  algorithm: TournamentTypeAlgorithm;
  description: string;
  supportsDoubleRound: boolean;
}

export const insertTournamentTypeSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  algorithm: z.enum(["ROUND_ROBIN", "ROUND_ROBIN_DOUBLE", "KNOCKOUT", "DOUBLE_ELIMINATION", "GROUPS_PLAYOFFS", "LEAGUE_FINAL"]),
  description: z.string(),
  supportsDoubleRound: z.boolean().default(false),
});
export type InsertTournamentType = z.infer<typeof insertTournamentTypeSchema>;

// User
export const UserStatus = {
  ACTIVO: "ACTIVO",
  INACTIVO: "INACTIVO",
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  teamId?: string;
  phone?: string;
  status: UserStatus;
  createdAt: string;
}

export const insertUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["ADMIN", "CAPITAN", "ARBITRO", "MARKETING"]),
  teamId: z.string().optional(),
  phone: z.string().optional(),
});
export type InsertUser = z.infer<typeof insertUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  email: z.string().email("Email inválido").optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
  role: z.enum(["ADMIN", "CAPITAN", "ARBITRO", "MARKETING"]).optional(),
  teamId: z.string().optional().nullable(),
  status: z.enum(["ACTIVO", "INACTIVO"]).optional(),
});
export type UpdateUser = z.infer<typeof updateUserSchema>;

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});
export type LoginCredentials = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(6, "El número de teléfono es obligatorio"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  role: z.enum(["ADMIN", "CAPITAN", "ARBITRO", "MARKETING"], {
    required_error: "Debes seleccionar un rol",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});
export type RegisterCredentials = z.infer<typeof registerSchema>;

// Tournament
export interface Tournament {
  id: string;
  divisionId?: string;
  tournamentTypeId?: string;
  name: string;
  seasonName: string;
  location: string;
  startDate: string;
  endDate?: string;
  status: TournamentStatus;
  championTeamId?: string;
  championTeamName?: string;
  finalStandings?: Standing[];
  feePerTeam?: number;
  fineYellow?: number;
  fineRed?: number;
  fineRedDirect?: number;
  maxFederatedPlayers?: number;
  maxPlayersPerTeam?: number;
  doubleRound?: boolean;
  scheduleGenerated?: boolean;
  createdAt: string;
}

export const insertTournamentSchema = z.object({
  divisionId: z.string().optional(),
  tournamentTypeId: z.string().optional(),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  seasonName: z.string().min(2, "La temporada debe tener al menos 2 caracteres"),
  location: z.string().min(2, "El lugar es requerido"),
  startDate: z.string(),
  status: z.enum(["ACTIVO", "FINALIZADO"]).default("ACTIVO"),
  feePerTeam: z.number().min(0).optional(),
  fineYellow: z.number().min(0).optional(),
  fineRed: z.number().min(0).optional(),
  fineRedDirect: z.number().min(0).optional(),
  maxFederatedPlayers: z.number().min(0).optional(),
  maxPlayersPerTeam: z.number().min(0).optional(),
  doubleRound: z.boolean().optional(),
});
export type InsertTournament = z.infer<typeof insertTournamentSchema>;

export const finishTournamentSchema = z.object({
  championTeamId: z.string().min(1, "Debe seleccionar un campeón"),
});
export type FinishTournament = z.infer<typeof finishTournamentSchema>;

// Team
export interface Team {
  id: string;
  tournamentId: string;
  divisionId?: string;
  name: string;
  colors: string;
  homeField?: string;
  logoUrl?: string;
  captainUserId?: string;
  coachName?: string;
  instagramUrl?: string;
}

export const insertTeamSchema = z.object({
  tournamentId: z.string(),
  divisionId: z.string().optional(),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  colors: z.string().min(2, "Los colores son requeridos"),
  homeField: z.string().optional(),
  logoUrl: z.string().optional(),
  captainUserId: z.string().optional(),
  coachName: z.string().optional(),
  instagramUrl: z.string().optional(),
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
  identificationType?: string;
  identificationId?: string;
  photoUrls?: string[];
  isFederated?: boolean;
  federationId?: string;
  active: boolean;
}

export const insertPlayerSchema = z.object({
  teamId: z.string(),
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  jerseyNumber: z.number().min(1).max(99, "Número de camiseta entre 1 y 99"),
  position: z.string().optional(),
  identificationType: z.enum(["DNI", "NIE", "PASAPORTE"]).default("DNI"),
  identificationId: z.string().optional(),
  photoUrls: z.array(z.string()).optional(),
  isFederated: z.boolean().optional(),
  federationId: z.string().optional(),
  active: z.boolean().default(true),
});
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

// Match
// Tournament Stage
export interface TournamentStage {
  id: string;
  tournamentId: string;
  name: string;
  sortOrder: number;
  stageType?: string;
}

export const insertTournamentStageSchema = z.object({
  tournamentId: z.string(),
  name: z.string().min(1, "El nombre de la fase es requerido"),
  sortOrder: z.number().min(1).default(1),
  stageType: z.string().optional(),
});
export type InsertTournamentStage = z.infer<typeof insertTournamentStageSchema>;

export interface Match {
  id: string;
  tournamentId: string;
  roundNumber: number;
  dateTime: string;
  field: string;
  homeTeamId?: string | null;
  awayTeamId?: string | null;
  refereeUserId?: string;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  vsImageUrl?: string;
  stage?: MatchStage;
  stageId?: string;
  refereeNotes?: string;
}

export const insertMatchSchema = z.object({
  tournamentId: z.string(),
  roundNumber: z.number().min(1, "La jornada debe ser al menos 1"),
  dateTime: z.string(),
  field: z.string().min(2, "La cancha es requerida"),
  homeTeamId: z.preprocess((val) => (val === "" ? null : val), z.string().optional().nullable()),
  awayTeamId: z.preprocess((val) => (val === "" ? null : val), z.string().optional().nullable()),
  refereeUserId: z.preprocess((val) => (val === "" ? null : val), z.string().optional().nullable()),
  status: z.enum(["PROGRAMADO", "EN_CURSO", "JUGADO"]).default("PROGRAMADO"),
  homeScore: z.number().optional(),
  awayScore: z.number().optional(),
  vsImageUrl: z.string().optional(),
  stage: z.string().optional(),
  stageId: z.preprocess((val) => (val === "" ? null : val), z.string().optional().nullable()),
  refereeNotes: z.string().optional(),
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
  relatedPlayerId?: string;
  notes?: string;
}

export const insertMatchEventSchema = z.object({
  matchId: z.string(),
  type: z.enum(["GOAL", "YELLOW", "RED", "RED_DIRECT", "SUBSTITUTION", "NOTE"]),
  minute: z.number().min(0).max(120, "El minuto debe estar entre 0 y 120"),
  teamId: z.string(),
  playerId: z.string(),
  relatedPlayerId: z.string().optional(),
  notes: z.string().optional(),
});
export type InsertMatchEvent = z.infer<typeof insertMatchEventSchema>;

// Match Lineup
export interface MatchLineup {
  id: string;
  matchId: string;
  teamId: string;
  playerIds: string[];
  createdAt: string;
}

export const insertMatchLineupSchema = z.object({
  matchId: z.string(),
  teamId: z.string(),
  playerIds: z.array(z.string()),
});
export type InsertMatchLineup = z.infer<typeof insertMatchLineupSchema>;

// Match Substitutions
export interface MatchSubstitution {
  id: string;
  matchId: string;
  teamId: string;
  playerOutId: string;
  playerInId: string;
  minute: number;
  reason?: string;
  createdAt: string;
}

export const insertMatchSubstitutionSchema = z.object({
  matchId: z.string().min(1),
  teamId: z.string().min(1),
  playerOutId: z.string().min(1),
  playerInId: z.string().min(1),
  minute: z.number().min(0).max(120),
  reason: z.string().optional(),
});
export type InsertMatchSubstitution = z.infer<typeof insertMatchSubstitutionSchema>;

// Match Evidence (photos, videos, audio)
export const EvidenceType = {
  PHOTO: "PHOTO",
  VIDEO: "VIDEO",
  AUDIO: "AUDIO",
} as const;
export type EvidenceType = (typeof EvidenceType)[keyof typeof EvidenceType];

export interface MatchEvidence {
  id: string;
  matchId: string;
  eventId?: string;
  type: EvidenceType;
  url: string;
  transcript?: string;
  createdAt: string;
}

export const insertMatchEvidenceSchema = z.object({
  matchId: z.string(),
  eventId: z.string().optional(),
  type: z.enum(["PHOTO", "VIDEO", "AUDIO"]),
  url: z.string(),
  transcript: z.string().optional(),
});
export type InsertMatchEvidence = z.infer<typeof insertMatchEvidenceSchema>;

// Match result submission (for referees)
export const matchResultSchema = z.object({
  homeScore: z.number().min(0, "El marcador no puede ser negativo"),
  awayScore: z.number().min(0, "El marcador no puede ser negativo"),
  events: z.array(z.object({
    type: z.enum(["GOAL", "YELLOW", "RED", "RED_DIRECT", "SUBSTITUTION", "NOTE"]),
    minute: z.number().min(0).max(120),
    teamId: z.string(),
    playerId: z.string(),
    relatedPlayerId: z.string().optional(),
    notes: z.string().optional(),
  })),
  refereeNotes: z.string().optional(),
  evidenceUrls: z.array(z.string()).optional(),
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
  homeTeam?: Team | null;
  awayTeam?: Team | null;
  referee?: User;
  refereeProfile?: RefereeProfile;
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

// News (Blog posts for match summaries)
export interface News {
  id: string;
  tournamentId: string;
  matchId?: string;
  title: string;
  content: string;
  imageUrl?: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export const insertNewsSchema = z.object({
  tournamentId: z.string(),
  matchId: z.string().optional(),
  title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  content: z.string().min(20, "El contenido debe tener al menos 20 caracteres"),
  imageUrl: z.string().url().optional().or(z.literal("")),
});
export type InsertNews = z.infer<typeof insertNewsSchema>;

export interface NewsWithAuthor extends News {
  author: Omit<User, 'passwordHash'>;
  match?: MatchWithTeams;
}

// Referee Profile
export const RefereeStatus = {
  ACTIVO: "ACTIVO",
  INACTIVO: "INACTIVO",
} as const;
export type RefereeStatus = (typeof RefereeStatus)[keyof typeof RefereeStatus];

export const IdentificationTypes = {
  DNI: "DNI",
  NIE: "NIE",
  PASAPORTE: "PASAPORTE",
} as const;
export type IdentificationType = (typeof IdentificationTypes)[keyof typeof IdentificationTypes];
export const identificationTypeLabels: Record<IdentificationType, string> = {
  DNI: "DNI",
  NIE: "NIE",
  PASAPORTE: "Pasaporte",
};

export interface RefereeProfile {
  id: string;
  userId: string;
  fullName: string;
  identificationType?: string;
  identificationNumber: string;
  phone: string;
  email: string;
  association?: string;
  yearsOfExperience?: number;
  observations?: string;
  status: RefereeStatus;
  createdAt: string;
  updatedAt: string;
}

export const insertRefereeProfileSchema = z.object({
  fullName: z.string().min(3, "El nombre completo debe tener al menos 3 caracteres"),
  identificationType: z.enum(["DNI", "NIE", "PASAPORTE"]).default("DNI"),
  identificationNumber: z.string().min(5, "El número de identificación es requerido"),
  phone: z.string().min(8, "El teléfono debe tener al menos 8 caracteres"),
  email: z.string().email("Email inválido"),
  association: z.string().optional(),
  yearsOfExperience: z.number().min(0).optional(),
  observations: z.string().optional(),
  status: z.enum(["ACTIVO", "INACTIVO"]).default("ACTIVO"),
});
export type InsertRefereeProfile = z.infer<typeof insertRefereeProfileSchema>;

// Captain Profile
export interface CaptainProfile {
  id: string;
  userId: string;
  fullName: string;
  identificationType?: string;
  identificationNumber: string;
  phone: string;
  email: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  observations?: string;
  createdAt: string;
  updatedAt: string;
}

export const insertCaptainProfileSchema = z.object({
  fullName: z.string().min(3, "El nombre completo debe tener al menos 3 caracteres"),
  identificationType: z.enum(["DNI", "NIE", "PASAPORTE"]).default("DNI"),
  identificationNumber: z.string().min(5, "El número de identificación es requerido"),
  phone: z.string().min(8, "El teléfono debe tener al menos 8 caracteres"),
  email: z.string().email("Email inválido"),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  observations: z.string().optional(),
});
export type InsertCaptainProfile = z.infer<typeof insertCaptainProfileSchema>;

// Auth response
export interface AuthResponse {
  token: string;
  user: Omit<User, 'passwordHash'>;
  refereeProfile?: RefereeProfile;
  captainProfile?: CaptainProfile;
  activeDivision?: Division;
}

// Match Attendance (Pase de lista)
export interface MatchAttendance {
  id: string;
  matchId: string;
  teamId: string;
  playerId: string;
  present: boolean;
  createdAt: string;
}

export const insertMatchAttendanceSchema = z.object({
  matchId: z.string(),
  teamId: z.string(),
  playerId: z.string(),
  present: z.boolean(),
});
export type InsertMatchAttendance = z.infer<typeof insertMatchAttendanceSchema>;

export const saveAttendanceSchema = z.object({
  teamId: z.string(),
  attendance: z.array(z.object({
    playerId: z.string(),
    present: z.boolean(),
  })),
});
export type SaveAttendancePayload = z.infer<typeof saveAttendanceSchema>;

// Player Suspensions (Sanciones por tarjeta roja)
export const SuspensionStatus = {
  ACTIVO: "ACTIVO",
  CUMPLIDO: "CUMPLIDO",
} as const;
export type SuspensionStatus = (typeof SuspensionStatus)[keyof typeof SuspensionStatus];

export interface PlayerSuspension {
  id: string;
  tournamentId: string;
  playerId: string;
  teamId: string;
  matchId: string;
  matchEventId: string | null;
  reason: string;
  matchesRemaining: number;
  status: SuspensionStatus;
  createdAt: string;
}

export const insertPlayerSuspensionSchema = z.object({
  tournamentId: z.string(),
  playerId: z.string(),
  teamId: z.string(),
  matchId: z.string(),
  matchEventId: z.string().optional(),
  reason: z.string(),
  matchesRemaining: z.number().int().min(1).default(1),
  status: z.string().default("ACTIVO"),
});
export type InsertPlayerSuspension = z.infer<typeof insertPlayerSuspensionSchema>;

// Fines (Multas por tarjetas e incomparecencia)
export const FineStatus = {
  PENDIENTE: "PENDIENTE",
  PAGADA: "PAGADA",
  PARCIAL: "PARCIAL",
} as const;
export type FineStatus = (typeof FineStatus)[keyof typeof FineStatus];

export const FineType = {
  YELLOW: "YELLOW",
  RED: "RED",
  RED_DIRECT: "RED_DIRECT",
  NO_PRESENTADO: "NO_PRESENTADO",
} as const;
export type FineType = (typeof FineType)[keyof typeof FineType];

export const FineTypeLabels: Record<FineType, string> = {
  YELLOW: "Tarjeta Amarilla",
  RED: "Tarjeta Roja",
  RED_DIRECT: "Roja Directa",
  NO_PRESENTADO: "No Presentado",
};

export interface Fine {
  id: string;
  tournamentId: string;
  matchId: string;
  matchEventId?: string;
  teamId: string;
  playerId?: string;
  cardType: FineType;
  amount: number;
  status: FineStatus;
  paidAmount?: number;
  paidAt?: string;
  createdAt: string;
}

export const insertFineSchema = z.object({
  tournamentId: z.string(),
  matchId: z.string(),
  matchEventId: z.string().optional(),
  teamId: z.string(),
  playerId: z.string().optional().nullable(),
  cardType: z.enum(["YELLOW", "RED", "RED_DIRECT", "NO_PRESENTADO"]),
  amount: z.number().min(0),
  status: z.enum(["PENDIENTE", "PAGADA", "PARCIAL"]).default("PENDIENTE"),
});
export type InsertFine = z.infer<typeof insertFineSchema>;

// Team Payments (Abonos de inscripción)
export interface TeamPayment {
  id: string;
  tournamentId: string;
  teamId: string;
  amount: number;
  method?: string;
  notes?: string;
  paidAt: string;
  createdAt: string;
}

export const insertTeamPaymentSchema = z.object({
  tournamentId: z.string().min(1, "El torneo es requerido"),
  teamId: z.string().min(1, "El equipo es requerido"),
  amount: z.number().min(1, "El monto debe ser mayor a 0"),
  method: z.string().optional(),
  notes: z.string().optional(),
  paidAt: z.string().min(1, "La fecha es requerida"),
});
export type InsertTeamPayment = z.infer<typeof insertTeamPaymentSchema>;

// Fine Payments (Pagos de multas)
export interface FinePayment {
  id: string;
  tournamentId: string;
  teamId: string;
  amount: number;
  notes?: string;
  paidAt: string;
  createdAt: string;
}

export const insertFinePaymentSchema = z.object({
  tournamentId: z.string().min(1, "El torneo es requerido"),
  teamId: z.string().min(1, "El equipo es requerido"),
  fineId: z.string().optional(),
  amount: z.number().min(1, "El monto debe ser mayor a 0"),
  notes: z.string().optional(),
  paidAt: z.string().min(1, "La fecha es requerida"),
});
export type InsertFinePayment = z.infer<typeof insertFinePaymentSchema>;

// Expenses (Gastos del torneo)
export interface Expense {
  id: string;
  tournamentId: string;
  concept: string;
  amount: number;
  expenseAt: string;
  notes?: string;
  receiptUrl?: string;
  createdAt: string;
}

export const insertExpenseSchema = z.object({
  tournamentId: z.string().min(1, "El torneo es requerido"),
  concept: z.string().min(2, "El concepto es requerido"),
  amount: z.number().min(1, "El monto debe ser mayor a 0"),
  expenseAt: z.string().min(1, "La fecha es requerida"),
  notes: z.string().optional(),
  receiptUrl: z.string().optional(),
});
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

// Financial Summary (calculated)
export interface FinancialSummary {
  tournamentId: string;
  totalFees: number;
  totalCollected: number;
  totalExpenses: number;
  totalFines: number;
  totalFinesPaid: number;
  balance: number;
  teamBalances: {
    teamId: string;
    teamName: string;
    fee: number;
    paid: number;
    balance: number;
    fines: number;
    finesPaid: number;
    finesBalance: number;
  }[];
}

// Tournament with Division (extended type)
export interface TournamentWithDivision extends Tournament {
  division?: Division;
  tournamentType?: TournamentType;
}

// Marketing Media
export const MediaType = {
  PHOTO: "PHOTO",
  VIDEO: "VIDEO",
} as const;
export type MediaType = (typeof MediaType)[keyof typeof MediaType];

export interface MarketingMedia {
  id: string;
  title: string;
  description?: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  tournamentId?: string;
  createdAt: string;
}

export const insertMarketingMediaSchema = z.object({
  title: z.string().min(2, "El título debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  type: z.enum(["PHOTO", "VIDEO"]),
  url: z.string().min(1, "La URL es obligatoria"),
  thumbnailUrl: z.string().optional(),
  tournamentId: z.string().optional(),
});
export type InsertMarketingMedia = z.infer<typeof insertMarketingMediaSchema>;

// Contact Messages
export const ContactMessageStatus = {
  NUEVO: "NUEVO",
  LEIDO: "LEIDO",
  RESPONDIDO: "RESPONDIDO",
} as const;
export type ContactMessageStatus = (typeof ContactMessageStatus)[keyof typeof ContactMessageStatus];

export interface ContactMessage {
  id: string;
  contactName: string;
  phone: string;
  email: string;
  comments: string;
  status: ContactMessageStatus;
  createdAt: string;
}

export interface SiteSettings {
  id: string;
  leagueName: string;
  logoUrl: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  whatsappNumber: string | null;
  updatedAt: string;
}

export const insertSiteSettingsSchema = z.object({
  leagueName: z.string().min(1, "El nombre es obligatorio").optional(),
  logoUrl: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  instagramUrl: z.string().nullable().optional(),
  facebookUrl: z.string().nullable().optional(),
  whatsappNumber: z.string().nullable().optional(),
});
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;

// Competition Rules
export const CompetitionFormatType = {
  LEAGUE_DIVISIONS: "LEAGUE_DIVISIONS",
  TOURNEY_PLUS30: "TOURNEY_PLUS30",
} as const;
export type CompetitionFormatType = (typeof CompetitionFormatType)[keyof typeof CompetitionFormatType];

export const CompetitionFormatLabels: Record<CompetitionFormatType, string> = {
  LEAGUE_DIVISIONS: "Liga con Divisiones (Primera/Segunda)",
  TOURNEY_PLUS30: "Torneo +30 (Liga + Eliminatorias)",
};

export interface Plus30Rules {
  eliminatePosition: number;
  directToSemisPosition: number;
  repechagePositions: number[];
  repechagePairing: "random_seeded" | "bracket";
  cuartosPairing: "random_seeded" | "bracket";
  semisPairing: "includes_first_place";
  tiebreaker: "admin_select_winner" | "penalties" | "extra_time";
}

export interface CompetitionRule {
  id: string;
  categoryId: string;
  formatType: CompetitionFormatType;
  pointsWin: number;
  pointsDraw: number;
  pointsLoss: number;
  roundRobin: "single" | "double";
  teamsPerDivision: number;
  promotionCount?: number;
  relegationCount?: number;
  federatedLimit: number;
  plus30Rules?: Plus30Rules;
  rulesVersion: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const insertCompetitionRuleSchema = z.object({
  categoryId: z.string(),
  formatType: z.enum(["LEAGUE_DIVISIONS", "TOURNEY_PLUS30"]),
  pointsWin: z.number().min(0).default(3),
  pointsDraw: z.number().min(0).default(1),
  pointsLoss: z.number().min(0).default(0),
  roundRobin: z.enum(["single", "double"]).default("double"),
  teamsPerDivision: z.number().min(2).default(10),
  promotionCount: z.number().min(0).optional(),
  relegationCount: z.number().min(0).optional(),
  federatedLimit: z.number().min(0).default(3),
  plus30Rules: z.object({
    eliminatePosition: z.number().default(10),
    directToSemisPosition: z.number().default(1),
    repechagePositions: z.array(z.number()).default([2,3,4,5,6,7,8,9]),
    repechagePairing: z.enum(["random_seeded", "bracket"]).default("random_seeded"),
    cuartosPairing: z.enum(["random_seeded", "bracket"]).default("random_seeded"),
    semisPairing: z.literal("includes_first_place").default("includes_first_place"),
    tiebreaker: z.enum(["admin_select_winner", "penalties", "extra_time"]).default("admin_select_winner"),
  }).optional(),
});
export type InsertCompetitionRule = z.infer<typeof insertCompetitionRuleSchema>;

// Competition Seasons
export const SeasonStatus = {
  DRAFT: "draft",
  ACTIVE: "active",
  CLOSED: "closed",
} as const;
export type SeasonStatus = (typeof SeasonStatus)[keyof typeof SeasonStatus];

export interface CompetitionSeason {
  id: string;
  categoryId: string;
  tournamentId?: string;
  rulesId: string;
  rulesVersion: number;
  name: string;
  status: SeasonStatus;
  createdAt: string;
  updatedAt: string;
}

export const insertCompetitionSeasonSchema = z.object({
  categoryId: z.string(),
  tournamentId: z.string().optional(),
  rulesId: z.string(),
  name: z.string().min(2),
});
export type InsertCompetitionSeason = z.infer<typeof insertCompetitionSeasonSchema>;

// Standings Entries
export interface StandingsEntry {
  id: string;
  seasonId: string;
  tournamentId: string;
  teamId: string;
  division?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  position: number;
  updatedAt: string;
  teamName?: string;
}

// Division Movements
export const MovementType = {
  PROMOTION: "PROMOTION",
  RELEGATION: "RELEGATION",
} as const;
export type MovementType = (typeof MovementType)[keyof typeof MovementType];

export interface DivisionMovement {
  id: string;
  seasonId: string;
  teamId: string;
  teamName: string;
  fromDivision: string;
  toDivision: string;
  movementType: MovementType;
  createdAt: string;
}

// Bracket Matches (+30)
export const BracketPhase = {
  REPECHAJE: "REPECHAJE",
  CUARTOS: "CUARTOS",
  SEMIFINAL: "SEMIFINAL",
  FINAL: "FINAL",
} as const;
export type BracketPhase = (typeof BracketPhase)[keyof typeof BracketPhase];

export const BracketPhaseLabels: Record<BracketPhase, string> = {
  REPECHAJE: "Repechaje",
  CUARTOS: "Cuartos de Final",
  SEMIFINAL: "Semifinal",
  FINAL: "Final",
};

export const BracketMatchStatus = {
  PENDIENTE: "PENDIENTE",
  JUGADO: "JUGADO",
} as const;
export type BracketMatchStatus = (typeof BracketMatchStatus)[keyof typeof BracketMatchStatus];

export interface BracketMatch {
  id: string;
  seasonId: string;
  tournamentId: string;
  phase: BracketPhase;
  matchOrder: number;
  homeTeamId?: string;
  awayTeamId?: string;
  homeScore?: number;
  awayScore?: number;
  winnerId?: string;
  status: BracketMatchStatus;
  matchId?: string;
  seed?: string;
  createdAt: string;
  homeTeamName?: string;
  awayTeamName?: string;
}

export const insertContactMessageSchema = z.object({
  contactName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  phone: z.string().min(7, "El teléfono debe tener al menos 7 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  comments: z.string().min(1, "Los comentarios son obligatorios"),
});
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
