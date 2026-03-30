import {
  type User, type InsertUser, type UpdateUser,
  type Tournament, type InsertTournament,
  type Team, type InsertTeam,
  type Player, type InsertPlayer,
  type Match, type InsertMatch,
  type MatchEvent, type InsertMatchEvent,
  type News, type InsertNews, type NewsWithAuthor,
  type Standing, type MatchWithTeams, type MatchEventWithPlayer,
  type RefereeProfile, type InsertRefereeProfile,
  type CaptainProfile, type InsertCaptainProfile,
  type Division, type InsertDivision,
  type TournamentType, type InsertTournamentType,
  type MatchLineup, type InsertMatchLineup,
  type MatchSubstitution, type InsertMatchSubstitution,
  type MatchEvidence, type InsertMatchEvidence,
  type PlayerSuspension, type InsertPlayerSuspension,
  type MatchAttendance, type InsertMatchAttendance,
  type Fine, type InsertFine,
  type TeamPayment, type InsertTeamPayment,
  type FinePayment, type InsertFinePayment,
  type Expense, type InsertExpense,
  type MarketingMedia, type InsertMarketingMedia,
  type ContactMessage, type InsertContactMessage,
  type SiteSettings, type InsertSiteSettings,
  type TournamentStage, type InsertTournamentStage,
  type CompetitionRule, type InsertCompetitionRule,
  type CompetitionSeason, type InsertCompetitionSeason,
  type StandingsEntry,
  type DivisionMovement,
  type BracketMatch,
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsers(): Promise<Omit<User, 'passwordHash'>[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: UpdateUser): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;

  // Tournaments
  getTournaments(): Promise<Tournament[]>;
  getActiveTournament(): Promise<Tournament | undefined>;
  getCompletedTournaments(): Promise<Tournament[]>;
  getTournament(id: string): Promise<Tournament | undefined>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  updateTournament(id: string, data: Partial<InsertTournament>): Promise<Tournament | undefined>;
  finishTournament(id: string, championTeamId: string): Promise<Tournament | undefined>;
  deleteTournament(id: string): Promise<void>;

  // Tournament Stages
  getStagesByTournament(tournamentId: string): Promise<TournamentStage[]>;
  getStage(id: string): Promise<TournamentStage | undefined>;
  createStage(stage: InsertTournamentStage): Promise<TournamentStage>;
  updateStage(id: string, data: Partial<InsertTournamentStage>): Promise<TournamentStage | undefined>;
  deleteStage(id: string): Promise<void>;
  getMatchCountByStage(stageId: string): Promise<number>;

  // Teams
  getTeams(tournamentId?: string): Promise<Team[]>;
  getTeam(id: string): Promise<Team | undefined>;
  getTeamByCaptain(userId: string): Promise<Team | undefined>;
  getTeamsByTournamentAndCaptain(tournamentId: string, userId: string): Promise<Team[]>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: string, data: Partial<InsertTeam>): Promise<Team | undefined>;
  deleteTeam(id: string): Promise<void>;

  // Players
  getPlayers(teamId?: string): Promise<Player[]>;
  getPlayer(id: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: string, data: Partial<InsertPlayer>): Promise<Player | undefined>;
  deletePlayer(id: string): Promise<void>;

  // Matches
  getMatches(tournamentId?: string): Promise<Match[]>;
  getAllMatchesWithTeams(tournamentId: string): Promise<MatchWithTeams[]>;
  getMatch(id: string): Promise<Match | undefined>;
  getMatchWithTeams(id: string): Promise<MatchWithTeams | undefined>;
  getMatchesByReferee(userId: string): Promise<MatchWithTeams[]>;
  getMatchesByTeam(teamId: string): Promise<MatchWithTeams[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: string, data: Partial<InsertMatch>): Promise<Match | undefined>;
  deleteMatch(id: string): Promise<void>;

  // Match Events
  getMatchEvents(matchId: string): Promise<MatchEventWithPlayer[]>;
  getAllMatchEvents(): Promise<MatchEvent[]>;
  createMatchEvent(event: InsertMatchEvent): Promise<MatchEvent>;
  deleteMatchEvents(matchId: string): Promise<void>;

  // Standings
  calculateStandings(tournamentId: string): Promise<Standing[]>;

  // News
  getNews(tournamentId?: string): Promise<NewsWithAuthor[]>;
  getNewsItem(id: string): Promise<NewsWithAuthor | undefined>;
  createNews(news: InsertNews, authorId: string): Promise<News>;
  updateNews(id: string, data: Partial<InsertNews>): Promise<News | undefined>;
  deleteNews(id: string): Promise<void>;

  // Referee Profiles
  getRefereeProfiles(): Promise<RefereeProfile[]>;
  getRefereeProfile(userId: string): Promise<RefereeProfile | undefined>;
  getRefereeProfileById(id: string): Promise<RefereeProfile | undefined>;
  createRefereeProfile(userId: string, profile: InsertRefereeProfile): Promise<RefereeProfile>;
  updateRefereeProfile(userId: string, data: Partial<InsertRefereeProfile>): Promise<RefereeProfile | undefined>;
  updateRefereeProfileById(id: string, data: Partial<InsertRefereeProfile>): Promise<RefereeProfile | undefined>;
  deleteRefereeProfile(id: string): Promise<void>;

  // Captain Profiles
  getCaptainProfiles(): Promise<CaptainProfile[]>;
  getCaptainProfile(userId: string): Promise<CaptainProfile | undefined>;
  getCaptainProfileById(id: string): Promise<CaptainProfile | undefined>;
  createCaptainProfile(userId: string, profile: InsertCaptainProfile): Promise<CaptainProfile>;
  updateCaptainProfile(userId: string, data: Partial<InsertCaptainProfile>): Promise<CaptainProfile | undefined>;
  updateCaptainProfileById(id: string, data: Partial<InsertCaptainProfile>): Promise<CaptainProfile | undefined>;
  deleteCaptainProfile(id: string): Promise<void>;

  // Divisions
  getDivisions(): Promise<Division[]>;
  getDivision(id: string): Promise<Division | undefined>;
  createDivision(division: InsertDivision): Promise<Division>;
  updateDivision(id: string, data: Partial<InsertDivision>): Promise<Division | undefined>;
  deleteDivision(id: string): Promise<void>;

  // Tournament Types
  getTournamentTypes(): Promise<TournamentType[]>;
  getTournamentType(id: string): Promise<TournamentType | undefined>;
  createTournamentType(type: InsertTournamentType): Promise<TournamentType>;

  // Match Lineups
  getMatchLineups(matchId: string): Promise<MatchLineup[]>;
  createMatchLineup(lineup: InsertMatchLineup): Promise<MatchLineup>;
  deleteMatchLineups(matchId: string): Promise<void>;
  deleteMatchLineupByTeam(matchId: string, teamId: string): Promise<void>;

  // Match Substitutions
  getMatchSubstitutions(matchId: string): Promise<MatchSubstitution[]>;
  createMatchSubstitution(data: InsertMatchSubstitution): Promise<MatchSubstitution>;
  deleteMatchSubstitution(id: string): Promise<void>;

  // Match Evidence
  getMatchEvidence(matchId: string): Promise<MatchEvidence[]>;
  createMatchEvidence(evidence: InsertMatchEvidence): Promise<MatchEvidence>;
  deleteMatchEvidence(id: string): Promise<void>;

  // Match Attendance
  getMatchAttendance(matchId: string, teamId?: string): Promise<MatchAttendance[]>;
  saveMatchAttendance(matchId: string, teamId: string, attendance: { playerId: string; present: boolean }[]): Promise<MatchAttendance[]>;
  deleteMatchAttendance(matchId: string, teamId: string): Promise<void>;

  // Player Suspensions
  getPlayerSuspensions(tournamentId: string, teamId?: string, status?: string): Promise<PlayerSuspension[]>;
  createPlayerSuspension(suspension: InsertPlayerSuspension): Promise<PlayerSuspension>;
  updatePlayerSuspension(id: string, data: Partial<PlayerSuspension>): Promise<PlayerSuspension | undefined>;
  decrementSuspensions(tournamentId: string, teamId: string): Promise<void>;

  // Fines
  getFines(tournamentId?: string, teamId?: string): Promise<Fine[]>;
  getFine(id: string): Promise<Fine | undefined>;
  createFine(fine: InsertFine): Promise<Fine>;
  updateFine(id: string, data: Partial<Fine>): Promise<Fine | undefined>;

  // Team Payments
  getTeamPayments(tournamentId?: string, teamId?: string): Promise<TeamPayment[]>;
  createTeamPayment(payment: InsertTeamPayment): Promise<TeamPayment>;

  // Fine Payments
  getFinePayments(tournamentId?: string, teamId?: string): Promise<FinePayment[]>;
  createFinePayment(payment: InsertFinePayment): Promise<FinePayment>;
  deleteFinePaymentByFineId(fineId: string): Promise<void>;

  // Expenses
  getExpenses(tournamentId?: string): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: string, data: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: string): Promise<void>;

  // Marketing Media
  getMarketingMedia(): Promise<MarketingMedia[]>;
  getMarketingMediaItem(id: string): Promise<MarketingMedia | undefined>;
  createMarketingMedia(media: InsertMarketingMedia): Promise<MarketingMedia>;
  updateMarketingMedia(id: string, data: Partial<InsertMarketingMedia>): Promise<MarketingMedia | undefined>;
  deleteMarketingMedia(id: string): Promise<void>;

  // Contact Messages
  getContactMessages(): Promise<ContactMessage[]>;
  getContactMessage(id: string): Promise<ContactMessage | undefined>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  updateContactMessageStatus(id: string, status: string): Promise<ContactMessage | undefined>;
  deleteContactMessage(id: string): Promise<void>;

  // Schedule Generation
  generateRoundRobinSchedule(tournamentId: string, doubleRound?: boolean): Promise<Match[]>;

  // Site Settings
  getSiteSettings(): Promise<SiteSettings | null>;
  updateSiteSettings(data: InsertSiteSettings): Promise<SiteSettings>;

  // Competition Rules
  getCompetitionRules(categoryId: string): Promise<CompetitionRule | undefined>;
  getCompetitionRuleById(id: string): Promise<CompetitionRule | undefined>;
  getAllCompetitionRules(): Promise<CompetitionRule[]>;
  createCompetitionRule(rule: InsertCompetitionRule): Promise<CompetitionRule>;
  updateCompetitionRule(id: string, data: Partial<InsertCompetitionRule>): Promise<CompetitionRule | undefined>;

  // Competition Seasons
  getCompetitionSeasons(categoryId?: string): Promise<CompetitionSeason[]>;
  getCompetitionSeason(id: string): Promise<CompetitionSeason | undefined>;
  createCompetitionSeason(season: InsertCompetitionSeason): Promise<CompetitionSeason>;
  updateCompetitionSeasonStatus(id: string, status: string): Promise<CompetitionSeason | undefined>;

  // Standings Entries
  getStandingsEntries(seasonId: string): Promise<StandingsEntry[]>;
  upsertStandingsEntries(entries: Omit<StandingsEntry, 'id' | 'updatedAt'>[]): Promise<void>;
  deleteStandingsEntries(seasonId: string): Promise<void>;

  // Division Movements
  getDivisionMovements(seasonId: string): Promise<DivisionMovement[]>;
  createDivisionMovements(movements: Omit<DivisionMovement, 'id' | 'createdAt'>[]): Promise<DivisionMovement[]>;

  // Bracket Matches
  getBracketMatches(seasonId: string): Promise<BracketMatch[]>;
  createBracketMatch(match: Omit<BracketMatch, 'id' | 'createdAt' | 'homeTeamName' | 'awayTeamName'>): Promise<BracketMatch>;
  updateBracketMatch(id: string, data: Partial<BracketMatch>): Promise<BracketMatch | undefined>;
  deleteBracketMatches(seasonId: string): Promise<void>;

  // Messages
  getMessages(userId: string): Promise<any[]>;
  createMessage(data: { fromUserId: string; toUserId: string | null; subject: string; content: string }): Promise<any>;
  markMessageAsRead(messageId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tournaments: Map<string, Tournament>;
  private teams: Map<string, Team>;
  private players: Map<string, Player>;
  private matches: Map<string, Match>;
  private matchEvents: Map<string, MatchEvent>;
  private news: Map<string, News>;
  private refereeProfiles: Map<string, RefereeProfile>;
  private captainProfiles: Map<string, CaptainProfile>;
  private divisions: Map<string, Division>;
  private tournamentTypes: Map<string, TournamentType>;
  private matchLineups: Map<string, MatchLineup>;
  private matchEvidence: Map<string, MatchEvidence>;
  private fines: Map<string, Fine>;
  private teamPayments: Map<string, TeamPayment>;
  private finePayments: Map<string, FinePayment>;
  private expenses: Map<string, Expense>;
  private marketingMedia: Map<string, MarketingMedia>;
  private contactMessages: Map<string, ContactMessage>;

  constructor() {
    this.users = new Map();
    this.tournaments = new Map();
    this.teams = new Map();
    this.players = new Map();
    this.matches = new Map();
    this.matchEvents = new Map();
    this.news = new Map();
    this.refereeProfiles = new Map();
    this.captainProfiles = new Map();
    this.divisions = new Map();
    this.tournamentTypes = new Map();
    this.matchLineups = new Map();
    this.matchEvidence = new Map();
    this.fines = new Map();
    this.teamPayments = new Map();
    this.finePayments = new Map();
    this.expenses = new Map();
    this.marketingMedia = new Map();
    this.contactMessages = new Map();
    
    this.initializeTournamentTypes();
    this.initializeDivisions();
  }

  private initializeTournamentTypes() {
    const types: TournamentType[] = [
      { id: "type-liga", name: "Liga (Todos contra todos)", algorithm: "ROUND_ROBIN", description: "Todos los equipos juegan entre sí. El campeón es quien acumula más puntos.", supportsDoubleRound: true },
      { id: "type-knockout", name: "Eliminación directa", algorithm: "KNOCKOUT", description: "Llaves directas, el perdedor queda eliminado.", supportsDoubleRound: false },
      { id: "type-groups-playoffs", name: "Grupos + Playoffs", algorithm: "GROUPS_PLAYOFFS", description: "Fase de grupos seguida de eliminatorias.", supportsDoubleRound: false },
    ];
    types.forEach(t => this.tournamentTypes.set(t.id, t));
  }

  private initializeDivisions() {
    const divs: Division[] = [
      { id: "div-primera", name: "Primera División", theme: "PRIMERA", description: "Máxima categoría", createdAt: new Date().toISOString() },
      { id: "div-segunda", name: "Segunda División", theme: "SEGUNDA", description: "Segunda categoría", createdAt: new Date().toISOString() },
    ];
    divs.forEach(d => this.divisions.set(d.id, d));
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async getUsers(): Promise<Omit<User, 'passwordHash'>[]> {
    return Array.from(this.users.values()).map(({ passwordHash, ...user }) => user);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const passwordHash = await bcrypt.hash(insertUser.password, 10);
    const user: User = {
      id,
      name: insertUser.name,
      email: insertUser.email,
      passwordHash,
      role: insertUser.role,
      teamId: insertUser.teamId,
      status: "ACTIVO",
      createdAt: new Date().toISOString(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, data: UpdateUser): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    if (data.name !== undefined) user.name = data.name;
    if (data.email !== undefined) user.email = data.email;
    if (data.role !== undefined) user.role = data.role;
    if (data.teamId !== undefined) user.teamId = data.teamId || undefined;
    if (data.status !== undefined) user.status = data.status;
    if (data.password) {
      user.passwordHash = await bcrypt.hash(data.password, 10);
    }
    this.users.set(id, user);
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    this.users.delete(id);
  }

  // Tournaments
  async getTournaments(): Promise<Tournament[]> {
    return Array.from(this.tournaments.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getActiveTournament(): Promise<Tournament | undefined> {
    return Array.from(this.tournaments.values()).find(t => t.status === "ACTIVO");
  }

  async getCompletedTournaments(): Promise<Tournament[]> {
    return Array.from(this.tournaments.values())
      .filter(t => t.status === "FINALIZADO")
      .sort((a, b) => new Date(b.endDate || b.createdAt).getTime() - new Date(a.endDate || a.createdAt).getTime());
  }

  async getTournament(id: string): Promise<Tournament | undefined> {
    return this.tournaments.get(id);
  }

  async createTournament(tournament: InsertTournament): Promise<Tournament> {
    const id = randomUUID();
    const newTournament: Tournament = {
      id,
      name: tournament.name,
      seasonName: tournament.seasonName,
      location: tournament.location,
      startDate: tournament.startDate,
      status: tournament.status || "ACTIVO",
      createdAt: new Date().toISOString(),
    };
    this.tournaments.set(id, newTournament);
    return newTournament;
  }

  async updateTournament(id: string, data: Partial<InsertTournament>): Promise<Tournament | undefined> {
    const tournament = this.tournaments.get(id);
    if (!tournament) return undefined;
    const updated = { ...tournament, ...data };
    this.tournaments.set(id, updated);
    return updated;
  }

  async finishTournament(id: string, championTeamId: string): Promise<Tournament | undefined> {
    const tournament = this.tournaments.get(id);
    if (!tournament) return undefined;
    
    // Get champion team name
    const championTeam = this.teams.get(championTeamId);
    const championTeamName = championTeam?.name || "Desconocido";
    
    // Calculate final standings
    const finalStandings = await this.calculateStandings(id);
    
    const updated: Tournament = {
      ...tournament,
      status: "FINALIZADO",
      endDate: new Date().toISOString(),
      championTeamId,
      championTeamName,
      finalStandings,
    };
    this.tournaments.set(id, updated);
    return updated;
  }

  async deleteTournament(id: string): Promise<void> {
    this.tournaments.delete(id);
    // Also delete related teams, players, matches
    const teamEntries = Array.from(this.teams.entries());
    for (const [teamId, team] of teamEntries) {
      if (team.tournamentId === id) {
        this.teams.delete(teamId);
        const playerEntries = Array.from(this.players.entries());
        for (const [playerId, player] of playerEntries) {
          if (player.teamId === teamId) {
            this.players.delete(playerId);
          }
        }
      }
    }
    const matchEntries = Array.from(this.matches.entries());
    for (const [matchId, match] of matchEntries) {
      if (match.tournamentId === id) {
        this.matches.delete(matchId);
        const eventEntries = Array.from(this.matchEvents.entries());
        for (const [eventId, event] of eventEntries) {
          if (event.matchId === matchId) {
            this.matchEvents.delete(eventId);
          }
        }
      }
    }
    const newsEntries = Array.from(this.news.entries());
    for (const [newsId, newsItem] of newsEntries) {
      if (newsItem.tournamentId === id) {
        this.news.delete(newsId);
      }
    }
  }

  // Teams
  async getTeams(tournamentId?: string): Promise<Team[]> {
    const teams = Array.from(this.teams.values());
    if (tournamentId) {
      return teams.filter(t => t.tournamentId === tournamentId);
    }
    return teams;
  }

  async getTeam(id: string): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async getTeamByCaptain(userId: string): Promise<Team | undefined> {
    return Array.from(this.teams.values()).find(t => t.captainUserId === userId);
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const id = randomUUID();
    const team: Team = { id, ...insertTeam };
    this.teams.set(id, team);
    return team;
  }

  async updateTeam(id: string, data: Partial<InsertTeam>): Promise<Team | undefined> {
    const team = this.teams.get(id);
    if (!team) return undefined;
    const updated = { ...team, ...data };
    this.teams.set(id, updated);
    return updated;
  }

  async deleteTeam(id: string): Promise<void> {
    this.teams.delete(id);
    // Also delete players of this team
    const playerEntries = Array.from(this.players.entries());
    for (const [playerId, player] of playerEntries) {
      if (player.teamId === id) {
        this.players.delete(playerId);
      }
    }
  }

  // Players
  async getPlayers(teamId?: string): Promise<Player[]> {
    const players = Array.from(this.players.values());
    if (teamId) {
      return players.filter(p => p.teamId === teamId);
    }
    return players;
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = randomUUID();
    const player: Player = { id, ...insertPlayer };
    this.players.set(id, player);
    return player;
  }

  async updatePlayer(id: string, data: Partial<InsertPlayer>): Promise<Player | undefined> {
    const player = this.players.get(id);
    if (!player) return undefined;
    const updated = { ...player, ...data };
    this.players.set(id, updated);
    return updated;
  }

  async deletePlayer(id: string): Promise<void> {
    this.players.delete(id);
  }

  // Matches
  async getMatches(tournamentId?: string): Promise<Match[]> {
    const matches = Array.from(this.matches.values());
    if (tournamentId) {
      return matches.filter(m => m.tournamentId === tournamentId);
    }
    return matches;
  }

  async getMatch(id: string): Promise<Match | undefined> {
    return this.matches.get(id);
  }

  async getMatchWithTeams(id: string): Promise<MatchWithTeams | undefined> {
    const match = this.matches.get(id);
    if (!match) return undefined;

    const homeTeam = await this.getTeam(match.homeTeamId);
    const awayTeam = await this.getTeam(match.awayTeamId);
    const referee = match.refereeUserId ? await this.getUser(match.refereeUserId) : undefined;
    const refereeProfile = match.refereeUserId ? await this.getRefereeProfile(match.refereeUserId) : undefined;
    const events = await this.getMatchEvents(id);

    return {
      ...match,
      homeTeam: homeTeam!,
      awayTeam: awayTeam!,
      referee: referee ? { ...referee, passwordHash: undefined } as any : undefined,
      refereeProfile,
      events,
    };
  }

  async getAllMatchesWithTeams(tournamentId: string): Promise<MatchWithTeams[]> {
    const matches = Array.from(this.matches.values()).filter(m => m.tournamentId === tournamentId);
    const result: MatchWithTeams[] = [];
    for (const match of matches) {
      const withTeams = await this.getMatchWithTeams(match.id);
      if (withTeams) result.push(withTeams);
    }
    return result;
  }

  async getMatchesByReferee(userId: string): Promise<MatchWithTeams[]> {
    const matches = Array.from(this.matches.values()).filter(m => m.refereeUserId === userId);
    const result: MatchWithTeams[] = [];
    for (const match of matches) {
      const withTeams = await this.getMatchWithTeams(match.id);
      if (withTeams) result.push(withTeams);
    }
    return result;
  }

  async getMatchesByTeam(teamId: string): Promise<MatchWithTeams[]> {
    const matches = Array.from(this.matches.values()).filter(
      m => m.homeTeamId === teamId || m.awayTeamId === teamId
    );
    const result: MatchWithTeams[] = [];
    for (const match of matches) {
      const withTeams = await this.getMatchWithTeams(match.id);
      if (withTeams) result.push(withTeams);
    }
    return result;
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const id = randomUUID();
    const match: Match = { id, ...insertMatch };
    this.matches.set(id, match);
    return match;
  }

  async updateMatch(id: string, data: Partial<InsertMatch>): Promise<Match | undefined> {
    const match = this.matches.get(id);
    if (!match) return undefined;
    const updated = { ...match, ...data };
    this.matches.set(id, updated);
    return updated;
  }

  async deleteMatch(id: string): Promise<void> {
    this.matches.delete(id);
    await this.deleteMatchEvents(id);
  }

  // Match Events
  async getMatchEvents(matchId: string): Promise<MatchEventWithPlayer[]> {
    const events = Array.from(this.matchEvents.values()).filter(e => e.matchId === matchId);
    const result: MatchEventWithPlayer[] = [];
    for (const event of events) {
      const player = await this.getPlayer(event.playerId);
      const team = await this.getTeam(event.teamId);
      if (player && team) {
        result.push({ ...event, player, team });
      }
    }
    return result.sort((a, b) => a.minute - b.minute);
  }

  async getAllMatchEvents(): Promise<MatchEvent[]> {
    return Array.from(this.matchEvents.values());
  }

  async createMatchEvent(insertEvent: InsertMatchEvent): Promise<MatchEvent> {
    const id = randomUUID();
    const event: MatchEvent = { id, ...insertEvent };
    this.matchEvents.set(id, event);
    return event;
  }

  async deleteMatchEvents(matchId: string): Promise<void> {
    const eventEntries = Array.from(this.matchEvents.entries());
    for (const [id, event] of eventEntries) {
      if (event.matchId === matchId) {
        this.matchEvents.delete(id);
      }
    }
  }

  // Standings
  async calculateStandings(tournamentId: string): Promise<Standing[]> {
    const teams = await this.getTeams(tournamentId);
    const matches = (await this.getMatches(tournamentId)).filter(m => m.status === "JUGADO");

    const standings: Map<string, Standing> = new Map();

    for (const team of teams) {
      standings.set(team.id, {
        teamId: team.id,
        teamName: team.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      });
    }

    for (const match of matches) {
      const homeStanding = standings.get(match.homeTeamId);
      const awayStanding = standings.get(match.awayTeamId);
      if (!homeStanding || !awayStanding) continue;

      const homeScore = match.homeScore ?? 0;
      const awayScore = match.awayScore ?? 0;

      homeStanding.played++;
      awayStanding.played++;
      homeStanding.goalsFor += homeScore;
      homeStanding.goalsAgainst += awayScore;
      awayStanding.goalsFor += awayScore;
      awayStanding.goalsAgainst += homeScore;

      if (homeScore > awayScore) {
        homeStanding.won++;
        homeStanding.points += 3;
        awayStanding.lost++;
      } else if (homeScore < awayScore) {
        awayStanding.won++;
        awayStanding.points += 3;
        homeStanding.lost++;
      } else {
        homeStanding.drawn++;
        awayStanding.drawn++;
        homeStanding.points += 1;
        awayStanding.points += 1;
      }

      homeStanding.goalDifference = homeStanding.goalsFor - homeStanding.goalsAgainst;
      awayStanding.goalDifference = awayStanding.goalsFor - awayStanding.goalsAgainst;
    }

    return Array.from(standings.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
  }

  // News
  async getNews(tournamentId?: string): Promise<NewsWithAuthor[]> {
    let newsItems = Array.from(this.news.values());
    if (tournamentId) {
      newsItems = newsItems.filter(n => n.tournamentId === tournamentId);
    }
    newsItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const result: NewsWithAuthor[] = [];
    for (const item of newsItems) {
      const author = await this.getUser(item.authorId);
      if (!author) continue;
      const { passwordHash, ...authorData } = author;
      let match: MatchWithTeams | undefined;
      if (item.matchId) {
        match = await this.getMatchWithTeams(item.matchId);
      }
      result.push({ ...item, author: authorData, match });
    }
    return result;
  }

  async getNewsItem(id: string): Promise<NewsWithAuthor | undefined> {
    const item = this.news.get(id);
    if (!item) return undefined;
    const author = await this.getUser(item.authorId);
    if (!author) return undefined;
    const { passwordHash, ...authorData } = author;
    let match: MatchWithTeams | undefined;
    if (item.matchId) {
      match = await this.getMatchWithTeams(item.matchId);
    }
    return { ...item, author: authorData, match };
  }

  async createNews(insertNews: InsertNews, authorId: string): Promise<News> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const news: News = {
      id,
      tournamentId: insertNews.tournamentId,
      matchId: insertNews.matchId,
      title: insertNews.title,
      content: insertNews.content,
      imageUrl: insertNews.imageUrl || undefined,
      authorId,
      createdAt: now,
      updatedAt: now,
    };
    this.news.set(id, news);
    return news;
  }

  async updateNews(id: string, data: Partial<InsertNews>): Promise<News | undefined> {
    const news = this.news.get(id);
    if (!news) return undefined;
    const updated: News = {
      ...news,
      ...data,
      imageUrl: data.imageUrl === "" ? undefined : (data.imageUrl || news.imageUrl),
      updatedAt: new Date().toISOString(),
    };
    this.news.set(id, updated);
    return updated;
  }

  async deleteNews(id: string): Promise<void> {
    this.news.delete(id);
  }

  // Referee Profiles
  async getRefereeProfile(userId: string): Promise<RefereeProfile | undefined> {
    return Array.from(this.refereeProfiles.values()).find(p => p.userId === userId);
  }

  async createRefereeProfile(userId: string, profile: InsertRefereeProfile): Promise<RefereeProfile> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const refereeProfile: RefereeProfile = {
      id,
      userId,
      fullName: profile.fullName,
      identificationNumber: profile.identificationNumber,
      phone: profile.phone,
      email: profile.email,
      association: profile.association,
      yearsOfExperience: profile.yearsOfExperience,
      observations: profile.observations,
      status: profile.status || "ACTIVO",
      createdAt: now,
      updatedAt: now,
    };
    this.refereeProfiles.set(id, refereeProfile);
    return refereeProfile;
  }

  async updateRefereeProfile(userId: string, data: Partial<InsertRefereeProfile>): Promise<RefereeProfile | undefined> {
    const profile = await this.getRefereeProfile(userId);
    if (!profile) return undefined;
    const updated: RefereeProfile = {
      ...profile,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.refereeProfiles.set(profile.id, updated);
    return updated;
  }

  async getRefereeProfiles(): Promise<RefereeProfile[]> {
    return Array.from(this.refereeProfiles.values());
  }

  async getRefereeProfileById(id: string): Promise<RefereeProfile | undefined> {
    return this.refereeProfiles.get(id);
  }

  async updateRefereeProfileById(id: string, data: Partial<InsertRefereeProfile>): Promise<RefereeProfile | undefined> {
    const profile = this.refereeProfiles.get(id);
    if (!profile) return undefined;
    const updated: RefereeProfile = {
      ...profile,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.refereeProfiles.set(id, updated);
    return updated;
  }

  async deleteRefereeProfile(id: string): Promise<void> {
    this.refereeProfiles.delete(id);
  }

  // Captain Profiles
  async getCaptainProfiles(): Promise<CaptainProfile[]> {
    return Array.from(this.captainProfiles.values());
  }

  async getCaptainProfile(userId: string): Promise<CaptainProfile | undefined> {
    return Array.from(this.captainProfiles.values()).find(p => p.userId === userId);
  }

  async getCaptainProfileById(id: string): Promise<CaptainProfile | undefined> {
    return this.captainProfiles.get(id);
  }

  async createCaptainProfile(userId: string, profile: InsertCaptainProfile): Promise<CaptainProfile> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const captainProfile: CaptainProfile = {
      id,
      userId,
      fullName: profile.fullName,
      identificationNumber: profile.identificationNumber,
      phone: profile.phone,
      email: profile.email,
      address: profile.address,
      emergencyContact: profile.emergencyContact,
      emergencyPhone: profile.emergencyPhone,
      observations: profile.observations,
      createdAt: now,
      updatedAt: now,
    };
    this.captainProfiles.set(id, captainProfile);
    return captainProfile;
  }

  async updateCaptainProfile(userId: string, data: Partial<InsertCaptainProfile>): Promise<CaptainProfile | undefined> {
    const profile = await this.getCaptainProfile(userId);
    if (!profile) return undefined;
    const updated: CaptainProfile = {
      ...profile,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.captainProfiles.set(profile.id, updated);
    return updated;
  }

  async updateCaptainProfileById(id: string, data: Partial<InsertCaptainProfile>): Promise<CaptainProfile | undefined> {
    const profile = this.captainProfiles.get(id);
    if (!profile) return undefined;
    const updated: CaptainProfile = {
      ...profile,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.captainProfiles.set(id, updated);
    return updated;
  }

  async deleteCaptainProfile(id: string): Promise<void> {
    this.captainProfiles.delete(id);
  }

  // Divisions
  async getDivisions(): Promise<Division[]> {
    return Array.from(this.divisions.values());
  }

  async getDivision(id: string): Promise<Division | undefined> {
    return this.divisions.get(id);
  }

  async createDivision(division: InsertDivision): Promise<Division> {
    const id = randomUUID();
    const newDivision: Division = {
      id,
      ...division,
      createdAt: new Date().toISOString(),
    };
    this.divisions.set(id, newDivision);
    return newDivision;
  }

  async updateDivision(id: string, data: Partial<InsertDivision>): Promise<Division | undefined> {
    const division = this.divisions.get(id);
    if (!division) return undefined;
    const updated: Division = { ...division, ...data };
    this.divisions.set(id, updated);
    return updated;
  }

  async deleteDivision(id: string): Promise<void> {
    this.divisions.delete(id);
  }

  // Tournament Types
  async getTournamentTypes(): Promise<TournamentType[]> {
    return Array.from(this.tournamentTypes.values());
  }

  async getTournamentType(id: string): Promise<TournamentType | undefined> {
    return this.tournamentTypes.get(id);
  }

  async createTournamentType(type: InsertTournamentType): Promise<TournamentType> {
    const id = randomUUID();
    const newType: TournamentType = { id, ...type };
    this.tournamentTypes.set(id, newType);
    return newType;
  }

  // Match Lineups
  async getMatchLineups(matchId: string): Promise<MatchLineup[]> {
    return Array.from(this.matchLineups.values()).filter(l => l.matchId === matchId);
  }

  async createMatchLineup(lineup: InsertMatchLineup): Promise<MatchLineup> {
    const id = randomUUID();
    const newLineup: MatchLineup = {
      id,
      ...lineup,
      createdAt: new Date().toISOString(),
    };
    this.matchLineups.set(id, newLineup);
    return newLineup;
  }

  async deleteMatchLineups(matchId: string): Promise<void> {
    const toDelete = Array.from(this.matchLineups.values()).filter(l => l.matchId === matchId);
    toDelete.forEach(l => this.matchLineups.delete(l.id));
  }

  async deleteMatchLineupByTeam(matchId: string, teamId: string): Promise<void> {
    const toDelete = Array.from(this.matchLineups.values()).filter(l => l.matchId === matchId && l.teamId === teamId);
    toDelete.forEach(l => this.matchLineups.delete(l.id));
  }

  // Match Substitutions
  async getMatchSubstitutions(matchId: string): Promise<MatchSubstitution[]> {
    return [];
  }

  async createMatchSubstitution(data: InsertMatchSubstitution): Promise<MatchSubstitution> {
    const id = randomUUID();
    return { id, ...data, createdAt: new Date().toISOString() };
  }

  async deleteMatchSubstitution(id: string): Promise<void> {}

  // Match Evidence
  async getMatchEvidence(matchId: string): Promise<MatchEvidence[]> {
    return Array.from(this.matchEvidence.values()).filter(e => e.matchId === matchId);
  }

  async createMatchEvidence(evidence: InsertMatchEvidence): Promise<MatchEvidence> {
    const id = randomUUID();
    const newEvidence: MatchEvidence = {
      id,
      ...evidence,
      createdAt: new Date().toISOString(),
    };
    this.matchEvidence.set(id, newEvidence);
    return newEvidence;
  }

  async deleteMatchEvidence(id: string): Promise<void> {
    this.matchEvidence.delete(id);
  }

  // Match Attendance
  async getMatchAttendance(matchId: string, teamId?: string): Promise<MatchAttendance[]> {
    let records = Array.from(this.matchAttendanceMap?.values() || []).filter(a => a.matchId === matchId);
    if (teamId) records = records.filter(a => a.teamId === teamId);
    return records;
  }

  async saveMatchAttendance(matchId: string, teamId: string, attendance: { playerId: string; present: boolean }[]): Promise<MatchAttendance[]> {
    if (!this.matchAttendanceMap) this.matchAttendanceMap = new Map();
    for (const [key, val] of this.matchAttendanceMap) {
      if (val.matchId === matchId && val.teamId === teamId) {
        this.matchAttendanceMap.delete(key);
      }
    }
    const results: MatchAttendance[] = [];
    for (const entry of attendance) {
      const id = randomUUID();
      const record: MatchAttendance = {
        id,
        matchId,
        teamId,
        playerId: entry.playerId,
        present: entry.present,
        createdAt: new Date().toISOString(),
      };
      this.matchAttendanceMap.set(id, record);
      results.push(record);
    }
    return results;
  }

  async deleteMatchAttendance(matchId: string, teamId: string): Promise<void> {
    if (!this.matchAttendanceMap) return;
    for (const [key, val] of this.matchAttendanceMap) {
      if (val.matchId === matchId && val.teamId === teamId) {
        this.matchAttendanceMap.delete(key);
      }
    }
  }

  // Player Suspensions
  private playerSuspensions = new Map<string, PlayerSuspension>();

  async getPlayerSuspensions(tournamentId: string, teamId?: string, status?: string): Promise<PlayerSuspension[]> {
    let suspensions = Array.from(this.playerSuspensions.values()).filter(s => s.tournamentId === tournamentId);
    if (teamId) suspensions = suspensions.filter(s => s.teamId === teamId);
    if (status) suspensions = suspensions.filter(s => s.status === status);
    return suspensions;
  }

  async createPlayerSuspension(suspension: InsertPlayerSuspension): Promise<PlayerSuspension> {
    const id = randomUUID();
    const record: PlayerSuspension = {
      id,
      tournamentId: suspension.tournamentId,
      playerId: suspension.playerId,
      teamId: suspension.teamId,
      matchId: suspension.matchId,
      matchEventId: suspension.matchEventId || null,
      reason: suspension.reason,
      matchesRemaining: suspension.matchesRemaining || 1,
      status: (suspension.status as any) || "ACTIVO",
      createdAt: new Date().toISOString(),
    };
    this.playerSuspensions.set(id, record);
    return record;
  }

  async updatePlayerSuspension(id: string, data: Partial<PlayerSuspension>): Promise<PlayerSuspension | undefined> {
    const existing = this.playerSuspensions.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.playerSuspensions.set(id, updated);
    return updated;
  }

  async decrementSuspensions(tournamentId: string, teamId: string): Promise<void> {
    for (const [key, suspension] of this.playerSuspensions) {
      if (suspension.tournamentId === tournamentId && suspension.teamId === teamId && suspension.status === "ACTIVO") {
        suspension.matchesRemaining -= 1;
        if (suspension.matchesRemaining <= 0) {
          suspension.status = "CUMPLIDO";
          suspension.matchesRemaining = 0;
        }
        this.playerSuspensions.set(key, suspension);
      }
    }
  }

  // Fines
  async getFines(tournamentId?: string, teamId?: string): Promise<Fine[]> {
    let fines = Array.from(this.fines.values());
    if (tournamentId) fines = fines.filter(f => f.tournamentId === tournamentId);
    if (teamId) fines = fines.filter(f => f.teamId === teamId);
    return fines;
  }

  async getFine(id: string): Promise<Fine | undefined> {
    return this.fines.get(id);
  }

  async createFine(fine: InsertFine): Promise<Fine> {
    const id = randomUUID();
    const newFine: Fine = {
      id,
      ...fine,
      status: fine.status || "PENDIENTE",
      createdAt: new Date().toISOString(),
    };
    this.fines.set(id, newFine);
    return newFine;
  }

  async updateFine(id: string, data: Partial<Fine>): Promise<Fine | undefined> {
    const fine = this.fines.get(id);
    if (!fine) return undefined;
    const updated: Fine = { ...fine, ...data };
    this.fines.set(id, updated);
    return updated;
  }

  // Team Payments
  async getTeamPayments(tournamentId?: string, teamId?: string): Promise<TeamPayment[]> {
    let payments = Array.from(this.teamPayments.values());
    if (tournamentId) payments = payments.filter(p => p.tournamentId === tournamentId);
    if (teamId) payments = payments.filter(p => p.teamId === teamId);
    return payments;
  }

  async createTeamPayment(payment: InsertTeamPayment): Promise<TeamPayment> {
    const id = randomUUID();
    const newPayment: TeamPayment = {
      id,
      ...payment,
      createdAt: new Date().toISOString(),
    };
    this.teamPayments.set(id, newPayment);
    return newPayment;
  }

  // Fine Payments
  async getFinePayments(tournamentId?: string, teamId?: string): Promise<FinePayment[]> {
    let payments = Array.from(this.finePayments.values());
    if (tournamentId) payments = payments.filter(p => p.tournamentId === tournamentId);
    if (teamId) payments = payments.filter(p => p.teamId === teamId);
    return payments;
  }

  async createFinePayment(payment: InsertFinePayment): Promise<FinePayment> {
    const id = randomUUID();
    const newPayment: FinePayment = {
      id,
      ...payment,
      createdAt: new Date().toISOString(),
    };
    this.finePayments.set(id, newPayment);
    return newPayment;
  }

  async deleteFinePaymentByFineId(fineId: string): Promise<void> {
    for (const [key, val] of this.finePayments.entries()) {
      if ((val as any).fineId === fineId) this.finePayments.delete(key);
    }
  }

  // Expenses
  async getExpenses(tournamentId?: string): Promise<Expense[]> {
    let expenses = Array.from(this.expenses.values());
    if (tournamentId) expenses = expenses.filter(e => e.tournamentId === tournamentId);
    return expenses;
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const id = randomUUID();
    const newExpense: Expense = {
      id,
      ...expense,
      createdAt: new Date().toISOString(),
    };
    this.expenses.set(id, newExpense);
    return newExpense;
  }

  async updateExpense(id: string, data: Partial<InsertExpense>): Promise<Expense | undefined> {
    const expense = this.expenses.get(id);
    if (!expense) return undefined;
    const updated: Expense = { ...expense, ...data };
    this.expenses.set(id, updated);
    return updated;
  }

  async deleteExpense(id: string): Promise<void> {
    this.expenses.delete(id);
  }

  // Marketing Media
  async getMarketingMedia(): Promise<MarketingMedia[]> {
    return Array.from(this.marketingMedia.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getMarketingMediaItem(id: string): Promise<MarketingMedia | undefined> {
    return this.marketingMedia.get(id);
  }

  async createMarketingMedia(media: InsertMarketingMedia): Promise<MarketingMedia> {
    const id = randomUUID();
    const newMedia: MarketingMedia = {
      id,
      ...media,
      createdAt: new Date().toISOString(),
    };
    this.marketingMedia.set(id, newMedia);
    return newMedia;
  }

  async updateMarketingMedia(id: string, data: Partial<InsertMarketingMedia>): Promise<MarketingMedia | undefined> {
    const media = this.marketingMedia.get(id);
    if (!media) return undefined;
    const updated: MarketingMedia = { ...media, ...data };
    this.marketingMedia.set(id, updated);
    return updated;
  }

  async deleteMarketingMedia(id: string): Promise<void> {
    this.marketingMedia.delete(id);
  }

  // Schedule Generation - Round Robin Circle Method
  async generateRoundRobinSchedule(tournamentId: string, doubleRound: boolean = false): Promise<Match[]> {
    const tournament = await this.getTournament(tournamentId);
    if (!tournament) throw new Error("Torneo no encontrado");

    const teams = await this.getTeams(tournamentId);
    if (teams.length < 2) throw new Error("Se necesitan al menos 2 equipos");

    // Delete existing matches for this tournament
    const existingMatches = await this.getMatches(tournamentId);
    for (const match of existingMatches) {
      await this.deleteMatch(match.id);
    }

    const teamIds = teams.map(t => t.id);
    const n = teamIds.length;
    const hasOdd = n % 2 !== 0;
    
    // If odd number of teams, add a "BYE" placeholder
    if (hasOdd) {
      teamIds.push("BYE");
    }
    
    const numTeams = teamIds.length;
    const numRounds = numTeams - 1;
    const matchesPerRound = numTeams / 2;
    
    const generatedMatches: Match[] = [];
    
    // Circle method: fix one team (index 0), rotate the rest
    const fixed = teamIds[0];
    const rotating = teamIds.slice(1);
    
    for (let round = 0; round < numRounds; round++) {
      const roundNumber = round + 1;
      
      // Generate pairings for this round
      const pairings: [string, string][] = [];
      
      // First match: fixed team vs first rotating team
      pairings.push([fixed, rotating[0]]);
      
      // Remaining matches: pair from ends of rotating array
      for (let i = 1; i < matchesPerRound; i++) {
        const home = rotating[i];
        const away = rotating[numTeams - 1 - i];
        pairings.push([home, away]);
      }
      
      // Create matches (skip BYE matches)
      for (const [homeId, awayId] of pairings) {
        if (homeId === "BYE" || awayId === "BYE") continue;
        
        const match = await this.createMatch({
          tournamentId,
          roundNumber,
          dateTime: "", // To be assigned manually
          field: "Por asignar",
          homeTeamId: homeId,
          awayTeamId: awayId,
          status: "PROGRAMADO",
        });
        generatedMatches.push(match);
      }
      
      // Rotate: move last to first position in rotating array
      rotating.unshift(rotating.pop()!);
    }
    
    // If double round, create second leg with swapped home/away
    if (doubleRound) {
      const firstLegMatches = [...generatedMatches];
      for (const match of firstLegMatches) {
        const secondLegMatch = await this.createMatch({
          tournamentId,
          roundNumber: match.roundNumber + numRounds,
          dateTime: "",
          field: "Por asignar",
          homeTeamId: match.awayTeamId,
          awayTeamId: match.homeTeamId,
          status: "PROGRAMADO",
        });
        generatedMatches.push(secondLegMatch);
      }
    }
    
    // Mark tournament as having generated schedule
    await this.updateTournament(tournamentId, { scheduleGenerated: true } as any);
    
    return generatedMatches;
  }

  // Contact Messages
  async getContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getContactMessage(id: string): Promise<ContactMessage | undefined> {
    return this.contactMessages.get(id);
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const id = randomUUID();
    const contactMessage: ContactMessage = {
      id,
      ...message,
      status: "NUEVO",
      createdAt: new Date().toISOString(),
    };
    this.contactMessages.set(id, contactMessage);
    return contactMessage;
  }

  async updateContactMessageStatus(id: string, status: string): Promise<ContactMessage | undefined> {
    const msg = this.contactMessages.get(id);
    if (!msg) return undefined;
    const updated = { ...msg, status: status as any };
    this.contactMessages.set(id, updated);
    return updated;
  }

  async deleteContactMessage(id: string): Promise<void> {
    this.contactMessages.delete(id);
  }

  async getSiteSettings(): Promise<SiteSettings | null> {
    return null;
  }

  async updateSiteSettings(data: InsertSiteSettings): Promise<SiteSettings> {
    return { id: "1", leagueName: data.leagueName || "La Liga de Campeones", logoUrl: null, phone: null, email: null, address: null, instagramUrl: null, facebookUrl: null, whatsappNumber: null, updatedAt: new Date().toISOString() };
  }

  async getCompetitionRules(_categoryId: string): Promise<CompetitionRule | undefined> { return undefined; }
  async getCompetitionRuleById(_id: string): Promise<CompetitionRule | undefined> { return undefined; }
  async getAllCompetitionRules(): Promise<CompetitionRule[]> { return []; }
  async createCompetitionRule(_rule: InsertCompetitionRule): Promise<CompetitionRule> { throw new Error("Not implemented"); }
  async updateCompetitionRule(_id: string, _data: Partial<InsertCompetitionRule>): Promise<CompetitionRule | undefined> { return undefined; }
  async getCompetitionSeasons(_categoryId?: string): Promise<CompetitionSeason[]> { return []; }
  async getCompetitionSeason(_id: string): Promise<CompetitionSeason | undefined> { return undefined; }
  async createCompetitionSeason(_season: InsertCompetitionSeason): Promise<CompetitionSeason> { throw new Error("Not implemented"); }
  async updateCompetitionSeasonStatus(_id: string, _status: string): Promise<CompetitionSeason | undefined> { return undefined; }
  async getStandingsEntries(_seasonId: string): Promise<StandingsEntry[]> { return []; }
  async upsertStandingsEntries(_entries: Omit<StandingsEntry, 'id' | 'updatedAt'>[]): Promise<void> {}
  async deleteStandingsEntries(_seasonId: string): Promise<void> {}
  async getDivisionMovements(_seasonId: string): Promise<DivisionMovement[]> { return []; }
  async createDivisionMovements(_movements: Omit<DivisionMovement, 'id' | 'createdAt'>[]): Promise<DivisionMovement[]> { return []; }
  async getBracketMatches(_seasonId: string): Promise<BracketMatch[]> { return []; }
  async createBracketMatch(_match: Omit<BracketMatch, 'id' | 'createdAt' | 'homeTeamName' | 'awayTeamName'>): Promise<BracketMatch> { throw new Error("Not implemented"); }
  async updateBracketMatch(_id: string, _data: Partial<BracketMatch>): Promise<BracketMatch | undefined> { return undefined; }
  async deleteBracketMatches(_seasonId: string): Promise<void> {}

  async getMessages(_userId: string): Promise<any[]> {
    return [];
  }

  async createMessage(_data: { fromUserId: string; toUserId: string | null; subject: string; content: string }): Promise<any> {
    return {};
  }

  async markMessageAsRead(_messageId: string): Promise<void> {}
}

import { Pool } from "pg";
import { DatabaseStorage } from "./db-storage";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const storage: IStorage = new DatabaseStorage(pool);
