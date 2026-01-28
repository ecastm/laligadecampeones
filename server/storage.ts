import {
  type User, type InsertUser,
  type Tournament, type InsertTournament,
  type Team, type InsertTeam,
  type Player, type InsertPlayer,
  type Match, type InsertMatch,
  type MatchEvent, type InsertMatchEvent,
  type Standing, type MatchWithTeams, type MatchEventWithPlayer
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsers(): Promise<Omit<User, 'passwordHash'>[]>;
  createUser(user: InsertUser): Promise<User>;
  deleteUser(id: string): Promise<void>;

  // Tournaments
  getActiveTournament(): Promise<Tournament | undefined>;
  getTournament(id: string): Promise<Tournament | undefined>;
  updateTournament(id: string, data: Partial<InsertTournament>): Promise<Tournament | undefined>;

  // Teams
  getTeams(tournamentId?: string): Promise<Team[]>;
  getTeam(id: string): Promise<Team | undefined>;
  getTeamByCaptain(userId: string): Promise<Team | undefined>;
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
  getMatch(id: string): Promise<Match | undefined>;
  getMatchWithTeams(id: string): Promise<MatchWithTeams | undefined>;
  getMatchesByReferee(userId: string): Promise<MatchWithTeams[]>;
  getMatchesByTeam(teamId: string): Promise<MatchWithTeams[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: string, data: Partial<InsertMatch>): Promise<Match | undefined>;
  deleteMatch(id: string): Promise<void>;

  // Match Events
  getMatchEvents(matchId: string): Promise<MatchEventWithPlayer[]>;
  createMatchEvent(event: InsertMatchEvent): Promise<MatchEvent>;
  deleteMatchEvents(matchId: string): Promise<void>;

  // Standings
  calculateStandings(tournamentId: string): Promise<Standing[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tournaments: Map<string, Tournament>;
  private teams: Map<string, Team>;
  private players: Map<string, Player>;
  private matches: Map<string, Match>;
  private matchEvents: Map<string, MatchEvent>;

  constructor() {
    this.users = new Map();
    this.tournaments = new Map();
    this.teams = new Map();
    this.players = new Map();
    this.matches = new Map();
    this.matchEvents = new Map();
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
      createdAt: new Date().toISOString(),
    };
    this.users.set(id, user);
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    this.users.delete(id);
  }

  // Tournaments
  async getActiveTournament(): Promise<Tournament | undefined> {
    return Array.from(this.tournaments.values()).find(t => t.active);
  }

  async getTournament(id: string): Promise<Tournament | undefined> {
    return this.tournaments.get(id);
  }

  async updateTournament(id: string, data: Partial<InsertTournament>): Promise<Tournament | undefined> {
    const tournament = this.tournaments.get(id);
    if (!tournament) return undefined;
    const updated = { ...tournament, ...data };
    this.tournaments.set(id, updated);
    return updated;
  }

  createTournament(tournament: InsertTournament): Tournament {
    const id = randomUUID();
    const newTournament: Tournament = { id, ...tournament };
    this.tournaments.set(id, newTournament);
    return newTournament;
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
    for (const [playerId, player] of this.players) {
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
    const events = await this.getMatchEvents(id);

    return {
      ...match,
      homeTeam: homeTeam!,
      awayTeam: awayTeam!,
      referee: referee ? { ...referee, passwordHash: undefined } as any : undefined,
      events,
    };
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

  async createMatchEvent(insertEvent: InsertMatchEvent): Promise<MatchEvent> {
    const id = randomUUID();
    const event: MatchEvent = { id, ...insertEvent };
    this.matchEvents.set(id, event);
    return event;
  }

  async deleteMatchEvents(matchId: string): Promise<void> {
    for (const [id, event] of this.matchEvents) {
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
}

export const storage = new MemStorage();
