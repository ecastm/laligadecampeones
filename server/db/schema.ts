import { pgTable, varchar, text, integer, boolean, real, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const divisions = pgTable("divisions", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  theme: text("theme").notNull(),
  description: text("description"),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const tournamentTypes = pgTable("tournament_types", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  algorithm: text("algorithm").notNull(),
  description: text("description").notNull(),
  supportsDoubleRound: boolean("supports_double_round").notNull().default(false),
});

export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull(),
  teamId: text("team_id"),
  status: text("status").notNull().default("ACTIVO"),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const tournaments = pgTable("tournaments", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  divisionId: text("division_id"),
  tournamentTypeId: text("tournament_type_id"),
  name: text("name").notNull(),
  seasonName: text("season_name").notNull(),
  location: text("location").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  status: text("status").notNull().default("ACTIVO"),
  championTeamId: text("champion_team_id"),
  championTeamName: text("champion_team_name"),
  finalStandings: jsonb("final_standings"),
  feePerTeam: real("fee_per_team"),
  fineYellow: real("fine_yellow"),
  fineRed: real("fine_red"),
  fineRedDirect: real("fine_red_direct"),
  maxFederatedPlayers: integer("max_federated_players"),
  doubleRound: boolean("double_round"),
  scheduleGenerated: boolean("schedule_generated"),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const teams = pgTable("teams", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: text("tournament_id").notNull(),
  divisionId: text("division_id"),
  name: text("name").notNull(),
  colors: text("colors").notNull(),
  homeField: text("home_field").notNull(),
  logoUrl: text("logo_url"),
  captainUserId: text("captain_user_id"),
  coachName: text("coach_name"),
  instagramUrl: text("instagram_url"),
});

export const players = pgTable("players", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  teamId: text("team_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  jerseyNumber: integer("jersey_number").notNull(),
  position: text("position"),
  identificationType: text("identification_type").default("DNI"),
  identificationId: text("identification_id"),
  photoUrls: text("photo_urls").array(),
  isFederated: boolean("is_federated"),
  federationId: text("federation_id"),
  active: boolean("active").notNull().default(true),
});

export const tournamentStages = pgTable("tournament_stages", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: text("tournament_id").notNull(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(1),
  stageType: text("stage_type"),
});

export const matches = pgTable("matches", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: text("tournament_id").notNull(),
  roundNumber: integer("round_number").notNull(),
  dateTime: text("date_time").notNull(),
  field: text("field").notNull(),
  homeTeamId: text("home_team_id").notNull(),
  awayTeamId: text("away_team_id").notNull(),
  refereeUserId: text("referee_user_id"),
  status: text("status").notNull().default("PROGRAMADO"),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  vsImageUrl: text("vs_image_url"),
  stage: text("stage"),
  stageId: text("stage_id"),
  refereeNotes: text("referee_notes"),
});

export const matchEvents = pgTable("match_events", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  matchId: text("match_id").notNull(),
  type: text("type").notNull(),
  minute: integer("minute").notNull(),
  teamId: text("team_id").notNull(),
  playerId: text("player_id").notNull(),
  relatedPlayerId: text("related_player_id"),
  notes: text("notes"),
});

export const matchLineups = pgTable("match_lineups", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  matchId: text("match_id").notNull(),
  teamId: text("team_id").notNull(),
  playerIds: jsonb("player_ids").notNull(),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const matchEvidence = pgTable("match_evidence", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  matchId: text("match_id").notNull(),
  eventId: text("event_id"),
  type: text("type").notNull(),
  url: text("url").notNull(),
  transcript: text("transcript"),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const news = pgTable("news", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: text("tournament_id").notNull(),
  matchId: text("match_id"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  authorId: text("author_id").notNull(),
  createdAt: text("created_at").notNull().default(sql`now()`),
  updatedAt: text("updated_at").notNull().default(sql`now()`),
});

export const refereeProfiles = pgTable("referee_profiles", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  fullName: text("full_name").notNull(),
  identificationType: text("identification_type").default("DNI"),
  identificationNumber: text("identification_number").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  association: text("association"),
  yearsOfExperience: integer("years_of_experience"),
  observations: text("observations"),
  status: text("status").notNull().default("ACTIVO"),
  createdAt: text("created_at").notNull().default(sql`now()`),
  updatedAt: text("updated_at").notNull().default(sql`now()`),
});

export const captainProfiles = pgTable("captain_profiles", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  fullName: text("full_name").notNull(),
  identificationType: text("identification_type").default("DNI"),
  identificationNumber: text("identification_number").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  observations: text("observations"),
  divisionId: text("division_id"),
  createdAt: text("created_at").notNull().default(sql`now()`),
  updatedAt: text("updated_at").notNull().default(sql`now()`),
});

export const matchAttendance = pgTable("match_attendance", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  matchId: text("match_id").notNull(),
  teamId: text("team_id").notNull(),
  playerId: text("player_id").notNull(),
  present: boolean("present").notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const fines = pgTable("fines", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: text("tournament_id").notNull(),
  matchId: text("match_id").notNull(),
  matchEventId: text("match_event_id"),
  teamId: text("team_id").notNull(),
  playerId: text("player_id"),
  cardType: text("card_type").notNull(),
  amount: real("amount").notNull(),
  status: text("status").notNull().default("PENDIENTE"),
  paidAmount: real("paid_amount"),
  paidAt: text("paid_at"),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const teamPayments = pgTable("team_payments", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: text("tournament_id").notNull(),
  teamId: text("team_id").notNull(),
  amount: real("amount").notNull(),
  method: text("method"),
  notes: text("notes"),
  paidAt: text("paid_at").notNull(),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const finePayments = pgTable("fine_payments", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: text("tournament_id").notNull(),
  teamId: text("team_id").notNull(),
  amount: real("amount").notNull(),
  notes: text("notes"),
  paidAt: text("paid_at").notNull(),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const expenses = pgTable("expenses", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: text("tournament_id").notNull(),
  concept: text("concept").notNull(),
  amount: real("amount").notNull(),
  expenseAt: text("expense_at").notNull(),
  notes: text("notes"),
  receiptUrl: text("receipt_url"),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const marketingMedia = pgTable("marketing_media", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  tournamentId: text("tournament_id"),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const siteSettings = pgTable("site_settings", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  leagueName: text("league_name").notNull().default("La Liga de Campeones"),
  logoUrl: text("logo_url"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  instagramUrl: text("instagram_url"),
  facebookUrl: text("facebook_url"),
  whatsappNumber: text("whatsapp_number"),
  updatedAt: text("updated_at").notNull().default(sql`now()`),
});

export const playerSuspensions = pgTable("player_suspensions", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: text("tournament_id").notNull(),
  playerId: text("player_id").notNull(),
  teamId: text("team_id").notNull(),
  matchId: text("match_id").notNull(),
  matchEventId: text("match_event_id"),
  reason: text("reason").notNull(),
  matchesRemaining: integer("matches_remaining").notNull().default(1),
  status: text("status").notNull().default("ACTIVO"),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const competitionRules = pgTable("competition_rules", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  categoryId: text("category_id").notNull(),
  formatType: text("format_type").notNull(),
  pointsWin: integer("points_win").notNull().default(3),
  pointsDraw: integer("points_draw").notNull().default(1),
  pointsLoss: integer("points_loss").notNull().default(0),
  roundRobin: text("round_robin").notNull().default("double"),
  teamsPerDivision: integer("teams_per_division").notNull().default(10),
  promotionCount: integer("promotion_count"),
  relegationCount: integer("relegation_count"),
  federatedLimit: integer("federated_limit").notNull().default(3),
  plus30Rules: jsonb("plus30_rules"),
  rulesVersion: integer("rules_version").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`now()`),
  updatedAt: text("updated_at").notNull().default(sql`now()`),
});

export const competitionSeasons = pgTable("competition_seasons", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  categoryId: text("category_id").notNull(),
  tournamentId: text("tournament_id"),
  rulesId: text("rules_id").notNull(),
  rulesVersion: integer("rules_version").notNull(),
  name: text("name").notNull(),
  status: text("status").notNull().default("draft"),
  createdAt: text("created_at").notNull().default(sql`now()`),
  updatedAt: text("updated_at").notNull().default(sql`now()`),
});

export const standingsEntries = pgTable("standings_entries", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  seasonId: text("season_id").notNull(),
  tournamentId: text("tournament_id").notNull(),
  teamId: text("team_id").notNull(),
  division: text("division"),
  played: integer("played").notNull().default(0),
  won: integer("won").notNull().default(0),
  drawn: integer("drawn").notNull().default(0),
  lost: integer("lost").notNull().default(0),
  goalsFor: integer("goals_for").notNull().default(0),
  goalsAgainst: integer("goals_against").notNull().default(0),
  goalDifference: integer("goal_difference").notNull().default(0),
  points: integer("points").notNull().default(0),
  position: integer("position").notNull().default(0),
  updatedAt: text("updated_at").notNull().default(sql`now()`),
});

export const divisionMovements = pgTable("division_movements", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  seasonId: text("season_id").notNull(),
  teamId: text("team_id").notNull(),
  teamName: text("team_name").notNull(),
  fromDivision: text("from_division").notNull(),
  toDivision: text("to_division").notNull(),
  movementType: text("movement_type").notNull(),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const bracketMatches = pgTable("bracket_matches", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  seasonId: text("season_id").notNull(),
  tournamentId: text("tournament_id").notNull(),
  phase: text("phase").notNull(),
  matchOrder: integer("match_order").notNull().default(1),
  homeTeamId: text("home_team_id"),
  awayTeamId: text("away_team_id"),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  winnerId: text("winner_id"),
  status: text("status").notNull().default("PENDIENTE"),
  matchId: text("match_id"),
  seed: text("seed"),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const contactMessages = pgTable("contact_messages", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  contactName: text("contact_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  comments: text("comments").notNull(),
  status: text("status").notNull().default("NUEVO"),
  createdAt: text("created_at").notNull().default(sql`now()`),
});
