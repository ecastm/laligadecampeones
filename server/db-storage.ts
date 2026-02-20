import { Pool } from "pg";
import bcrypt from "bcryptjs";
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
  type MatchEvidence, type InsertMatchEvidence,
  type Fine, type InsertFine,
  type TeamPayment, type InsertTeamPayment,
  type FinePayment, type InsertFinePayment,
  type Expense, type InsertExpense,
  type MarketingMedia, type InsertMarketingMedia,
  type ContactMessage, type InsertContactMessage,
} from "@shared/schema";
import { IStorage } from "./storage";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export class DatabaseStorage implements IStorage {
  constructor(private pool: Pool) {}

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.pool.query(
      `SELECT id, name, email, password_hash AS "passwordHash", role, team_id AS "teamId", status, created_at AS "createdAt" FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0] || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.pool.query(
      `SELECT id, name, email, password_hash AS "passwordHash", role, team_id AS "teamId", status, created_at AS "createdAt" FROM users WHERE email = $1`,
      [email]
    );
    return result.rows[0] || undefined;
  }

  async getUsers(): Promise<Omit<User, 'passwordHash'>[]> {
    const result = await this.pool.query(
      `SELECT id, name, email, role, team_id AS "teamId", status, created_at AS "createdAt" FROM users ORDER BY created_at DESC`
    );
    return result.rows;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const passwordHash = await bcrypt.hash(insertUser.password, 10);
    const result = await this.pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, team_id, status, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'ACTIVO', NOW())
       RETURNING id, name, email, password_hash AS "passwordHash", role, team_id AS "teamId", status, created_at AS "createdAt"`,
      [insertUser.name, insertUser.email, passwordHash, insertUser.role, insertUser.teamId || null]
    );
    return result.rows[0];
  }

  async updateUser(id: string, data: UpdateUser): Promise<User | undefined> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      setClauses.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.email !== undefined) {
      setClauses.push(`email = $${paramIndex++}`);
      values.push(data.email);
    }
    if (data.role !== undefined) {
      setClauses.push(`role = $${paramIndex++}`);
      values.push(data.role);
    }
    if (data.teamId !== undefined) {
      setClauses.push(`team_id = $${paramIndex++}`);
      values.push(data.teamId || null);
    }
    if (data.status !== undefined) {
      setClauses.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }
    if (data.password) {
      const passwordHash = await bcrypt.hash(data.password, 10);
      setClauses.push(`password_hash = $${paramIndex++}`);
      values.push(passwordHash);
    }

    if (setClauses.length === 0) return this.getUser(id);

    values.push(id);
    const result = await this.pool.query(
      `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, name, email, password_hash AS "passwordHash", role, team_id AS "teamId", status, created_at AS "createdAt"`,
      values
    );
    return result.rows[0] || undefined;
  }

  async deleteUser(id: string): Promise<void> {
    await this.pool.query(`DELETE FROM users WHERE id = $1`, [id]);
  }

  async getTournaments(): Promise<Tournament[]> {
    const result = await this.pool.query(
      `SELECT id, division_id AS "divisionId", tournament_type_id AS "tournamentTypeId", name, season_name AS "seasonName", location, start_date AS "startDate", end_date AS "endDate", status, champion_team_id AS "championTeamId", champion_team_name AS "championTeamName", final_standings AS "finalStandings", fee_per_team AS "feePerTeam", fine_yellow AS "fineYellow", fine_red AS "fineRed", fine_red_direct AS "fineRedDirect", max_federated_players AS "maxFederatedPlayers", double_round AS "doubleRound", schedule_generated AS "scheduleGenerated", created_at AS "createdAt" FROM tournaments ORDER BY created_at DESC`
    );
    return result.rows;
  }

  async getActiveTournament(): Promise<Tournament | undefined> {
    const result = await this.pool.query(
      `SELECT id, division_id AS "divisionId", tournament_type_id AS "tournamentTypeId", name, season_name AS "seasonName", location, start_date AS "startDate", end_date AS "endDate", status, champion_team_id AS "championTeamId", champion_team_name AS "championTeamName", final_standings AS "finalStandings", fee_per_team AS "feePerTeam", fine_yellow AS "fineYellow", fine_red AS "fineRed", fine_red_direct AS "fineRedDirect", max_federated_players AS "maxFederatedPlayers", double_round AS "doubleRound", schedule_generated AS "scheduleGenerated", created_at AS "createdAt" FROM tournaments WHERE status = 'ACTIVO' LIMIT 1`
    );
    return result.rows[0] || undefined;
  }

  async getCompletedTournaments(): Promise<Tournament[]> {
    const result = await this.pool.query(
      `SELECT id, division_id AS "divisionId", tournament_type_id AS "tournamentTypeId", name, season_name AS "seasonName", location, start_date AS "startDate", end_date AS "endDate", status, champion_team_id AS "championTeamId", champion_team_name AS "championTeamName", final_standings AS "finalStandings", fee_per_team AS "feePerTeam", fine_yellow AS "fineYellow", fine_red AS "fineRed", fine_red_direct AS "fineRedDirect", max_federated_players AS "maxFederatedPlayers", double_round AS "doubleRound", schedule_generated AS "scheduleGenerated", created_at AS "createdAt" FROM tournaments WHERE status = 'FINALIZADO' ORDER BY COALESCE(end_date, created_at) DESC`
    );
    return result.rows;
  }

  async getTournament(id: string): Promise<Tournament | undefined> {
    const result = await this.pool.query(
      `SELECT id, division_id AS "divisionId", tournament_type_id AS "tournamentTypeId", name, season_name AS "seasonName", location, start_date AS "startDate", end_date AS "endDate", status, champion_team_id AS "championTeamId", champion_team_name AS "championTeamName", final_standings AS "finalStandings", fee_per_team AS "feePerTeam", fine_yellow AS "fineYellow", fine_red AS "fineRed", fine_red_direct AS "fineRedDirect", max_federated_players AS "maxFederatedPlayers", double_round AS "doubleRound", schedule_generated AS "scheduleGenerated", created_at AS "createdAt" FROM tournaments WHERE id = $1`,
      [id]
    );
    return result.rows[0] || undefined;
  }

  async createTournament(tournament: InsertTournament): Promise<Tournament> {
    const result = await this.pool.query(
      `INSERT INTO tournaments (id, division_id, tournament_type_id, name, season_name, location, start_date, status, fee_per_team, fine_yellow, fine_red, fine_red_direct, max_federated_players, double_round, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
       RETURNING id, division_id AS "divisionId", tournament_type_id AS "tournamentTypeId", name, season_name AS "seasonName", location, start_date AS "startDate", end_date AS "endDate", status, champion_team_id AS "championTeamId", champion_team_name AS "championTeamName", final_standings AS "finalStandings", fee_per_team AS "feePerTeam", fine_yellow AS "fineYellow", fine_red AS "fineRed", fine_red_direct AS "fineRedDirect", max_federated_players AS "maxFederatedPlayers", double_round AS "doubleRound", schedule_generated AS "scheduleGenerated", created_at AS "createdAt"`,
      [
        tournament.divisionId || null,
        tournament.tournamentTypeId || null,
        tournament.name,
        tournament.seasonName,
        tournament.location,
        tournament.startDate,
        tournament.status || "ACTIVO",
        tournament.feePerTeam ?? null,
        tournament.fineYellow ?? null,
        tournament.fineRed ?? null,
        tournament.fineRedDirect ?? null,
        tournament.maxFederatedPlayers ?? null,
        tournament.doubleRound ?? null,
      ]
    );
    return result.rows[0];
  }

  async updateTournament(id: string, data: Partial<InsertTournament>): Promise<Tournament | undefined> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.divisionId !== undefined) { setClauses.push(`division_id = $${paramIndex++}`); values.push(data.divisionId || null); }
    if (data.tournamentTypeId !== undefined) { setClauses.push(`tournament_type_id = $${paramIndex++}`); values.push(data.tournamentTypeId || null); }
    if (data.name !== undefined) { setClauses.push(`name = $${paramIndex++}`); values.push(data.name); }
    if (data.seasonName !== undefined) { setClauses.push(`season_name = $${paramIndex++}`); values.push(data.seasonName); }
    if (data.location !== undefined) { setClauses.push(`location = $${paramIndex++}`); values.push(data.location); }
    if (data.startDate !== undefined) { setClauses.push(`start_date = $${paramIndex++}`); values.push(data.startDate); }
    if (data.status !== undefined) { setClauses.push(`status = $${paramIndex++}`); values.push(data.status); }
    if (data.feePerTeam !== undefined) { setClauses.push(`fee_per_team = $${paramIndex++}`); values.push(data.feePerTeam); }
    if (data.fineYellow !== undefined) { setClauses.push(`fine_yellow = $${paramIndex++}`); values.push(data.fineYellow); }
    if (data.fineRed !== undefined) { setClauses.push(`fine_red = $${paramIndex++}`); values.push(data.fineRed); }
    if (data.fineRedDirect !== undefined) { setClauses.push(`fine_red_direct = $${paramIndex++}`); values.push(data.fineRedDirect); }
    if (data.maxFederatedPlayers !== undefined) { setClauses.push(`max_federated_players = $${paramIndex++}`); values.push(data.maxFederatedPlayers); }
    if (data.doubleRound !== undefined) { setClauses.push(`double_round = $${paramIndex++}`); values.push(data.doubleRound); }
    if ((data as any).scheduleGenerated !== undefined) { setClauses.push(`schedule_generated = $${paramIndex++}`); values.push((data as any).scheduleGenerated); }

    if (setClauses.length === 0) return this.getTournament(id);

    values.push(id);
    const result = await this.pool.query(
      `UPDATE tournaments SET ${setClauses.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, division_id AS "divisionId", tournament_type_id AS "tournamentTypeId", name, season_name AS "seasonName", location, start_date AS "startDate", end_date AS "endDate", status, champion_team_id AS "championTeamId", champion_team_name AS "championTeamName", final_standings AS "finalStandings", fee_per_team AS "feePerTeam", fine_yellow AS "fineYellow", fine_red AS "fineRed", fine_red_direct AS "fineRedDirect", max_federated_players AS "maxFederatedPlayers", double_round AS "doubleRound", schedule_generated AS "scheduleGenerated", created_at AS "createdAt"`,
      values
    );
    return result.rows[0] || undefined;
  }

  async finishTournament(id: string, championTeamId: string): Promise<Tournament | undefined> {
    const championTeam = await this.getTeam(championTeamId);
    const championTeamName = championTeam?.name || "Desconocido";
    const finalStandings = await this.calculateStandings(id);

    const result = await this.pool.query(
      `UPDATE tournaments SET status = 'FINALIZADO', end_date = NOW(), champion_team_id = $1, champion_team_name = $2, final_standings = $3 WHERE id = $4
       RETURNING id, division_id AS "divisionId", tournament_type_id AS "tournamentTypeId", name, season_name AS "seasonName", location, start_date AS "startDate", end_date AS "endDate", status, champion_team_id AS "championTeamId", champion_team_name AS "championTeamName", final_standings AS "finalStandings", fee_per_team AS "feePerTeam", fine_yellow AS "fineYellow", fine_red AS "fineRed", fine_red_direct AS "fineRedDirect", max_federated_players AS "maxFederatedPlayers", double_round AS "doubleRound", schedule_generated AS "scheduleGenerated", created_at AS "createdAt"`,
      [championTeamId, championTeamName, JSON.stringify(finalStandings), id]
    );
    return result.rows[0] || undefined;
  }

  async deleteTournament(id: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const matches = await client.query(`SELECT id FROM matches WHERE tournament_id = $1`, [id]);
      const matchIds = matches.rows.map((m: any) => m.id);
      if (matchIds.length > 0) {
        await client.query(`DELETE FROM match_events WHERE match_id = ANY($1)`, [matchIds]);
        await client.query(`DELETE FROM match_lineups WHERE match_id = ANY($1)`, [matchIds]);
        await client.query(`DELETE FROM match_evidence WHERE match_id = ANY($1)`, [matchIds]);
      }
      await client.query(`DELETE FROM matches WHERE tournament_id = $1`, [id]);
      const teams = await client.query(`SELECT id FROM teams WHERE tournament_id = $1`, [id]);
      const teamIds = teams.rows.map((t: any) => t.id);
      if (teamIds.length > 0) {
        await client.query(`DELETE FROM players WHERE team_id = ANY($1)`, [teamIds]);
      }
      await client.query(`DELETE FROM teams WHERE tournament_id = $1`, [id]);
      await client.query(`DELETE FROM news WHERE tournament_id = $1`, [id]);
      await client.query(`DELETE FROM fines WHERE tournament_id = $1`, [id]);
      await client.query(`DELETE FROM team_payments WHERE tournament_id = $1`, [id]);
      await client.query(`DELETE FROM fine_payments WHERE tournament_id = $1`, [id]);
      await client.query(`DELETE FROM expenses WHERE tournament_id = $1`, [id]);
      await client.query(`DELETE FROM tournaments WHERE id = $1`, [id]);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async getTeams(tournamentId?: string): Promise<Team[]> {
    if (tournamentId) {
      const result = await this.pool.query(
        `SELECT id, tournament_id AS "tournamentId", division_id AS "divisionId", name, colors, home_field AS "homeField", logo_url AS "logoUrl", captain_user_id AS "captainUserId", coach_name AS "coachName" FROM teams WHERE tournament_id = $1`,
        [tournamentId]
      );
      return result.rows;
    }
    const result = await this.pool.query(
      `SELECT id, tournament_id AS "tournamentId", division_id AS "divisionId", name, colors, home_field AS "homeField", logo_url AS "logoUrl", captain_user_id AS "captainUserId", coach_name AS "coachName" FROM teams`
    );
    return result.rows;
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const result = await this.pool.query(
      `SELECT id, tournament_id AS "tournamentId", division_id AS "divisionId", name, colors, home_field AS "homeField", logo_url AS "logoUrl", captain_user_id AS "captainUserId", coach_name AS "coachName" FROM teams WHERE id = $1`,
      [id]
    );
    return result.rows[0] || undefined;
  }

  async getTeamByCaptain(userId: string): Promise<Team | undefined> {
    const result = await this.pool.query(
      `SELECT id, tournament_id AS "tournamentId", division_id AS "divisionId", name, colors, home_field AS "homeField", logo_url AS "logoUrl", captain_user_id AS "captainUserId", coach_name AS "coachName" FROM teams WHERE captain_user_id = $1`,
      [userId]
    );
    return result.rows[0] || undefined;
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const result = await this.pool.query(
      `INSERT INTO teams (id, tournament_id, division_id, name, colors, home_field, logo_url, captain_user_id, coach_name)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, tournament_id AS "tournamentId", division_id AS "divisionId", name, colors, home_field AS "homeField", logo_url AS "logoUrl", captain_user_id AS "captainUserId", coach_name AS "coachName"`,
      [insertTeam.tournamentId, insertTeam.divisionId || null, insertTeam.name, insertTeam.colors, insertTeam.homeField, insertTeam.logoUrl || null, insertTeam.captainUserId || null, insertTeam.coachName || null]
    );
    return result.rows[0];
  }

  async updateTeam(id: string, data: Partial<InsertTeam>): Promise<Team | undefined> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.tournamentId !== undefined) { setClauses.push(`tournament_id = $${paramIndex++}`); values.push(data.tournamentId); }
    if (data.divisionId !== undefined) { setClauses.push(`division_id = $${paramIndex++}`); values.push(data.divisionId || null); }
    if (data.name !== undefined) { setClauses.push(`name = $${paramIndex++}`); values.push(data.name); }
    if (data.colors !== undefined) { setClauses.push(`colors = $${paramIndex++}`); values.push(data.colors); }
    if (data.homeField !== undefined) { setClauses.push(`home_field = $${paramIndex++}`); values.push(data.homeField); }
    if (data.logoUrl !== undefined) { setClauses.push(`logo_url = $${paramIndex++}`); values.push(data.logoUrl || null); }
    if (data.captainUserId !== undefined) { setClauses.push(`captain_user_id = $${paramIndex++}`); values.push(data.captainUserId || null); }
    if (data.coachName !== undefined) { setClauses.push(`coach_name = $${paramIndex++}`); values.push(data.coachName || null); }

    if (setClauses.length === 0) return this.getTeam(id);

    values.push(id);
    const result = await this.pool.query(
      `UPDATE teams SET ${setClauses.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, tournament_id AS "tournamentId", division_id AS "divisionId", name, colors, home_field AS "homeField", logo_url AS "logoUrl", captain_user_id AS "captainUserId", coach_name AS "coachName"`,
      values
    );
    return result.rows[0] || undefined;
  }

  async deleteTeam(id: string): Promise<void> {
    await this.pool.query(`DELETE FROM players WHERE team_id = $1`, [id]);
    await this.pool.query(`DELETE FROM teams WHERE id = $1`, [id]);
  }

  async getPlayers(teamId?: string): Promise<Player[]> {
    if (teamId) {
      const result = await this.pool.query(
        `SELECT id, team_id AS "teamId", first_name AS "firstName", last_name AS "lastName", jersey_number AS "jerseyNumber", position, identification_id AS "identificationId", photo_urls AS "photoUrls", is_federated AS "isFederated", federation_id AS "federationId", active FROM players WHERE team_id = $1`,
        [teamId]
      );
      return result.rows;
    }
    const result = await this.pool.query(
      `SELECT id, team_id AS "teamId", first_name AS "firstName", last_name AS "lastName", jersey_number AS "jerseyNumber", position, identification_id AS "identificationId", photo_urls AS "photoUrls", is_federated AS "isFederated", federation_id AS "federationId", active FROM players`
    );
    return result.rows;
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    const result = await this.pool.query(
      `SELECT id, team_id AS "teamId", first_name AS "firstName", last_name AS "lastName", jersey_number AS "jerseyNumber", position, identification_id AS "identificationId", photo_urls AS "photoUrls", is_federated AS "isFederated", federation_id AS "federationId", active FROM players WHERE id = $1`,
      [id]
    );
    return result.rows[0] || undefined;
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const result = await this.pool.query(
      `INSERT INTO players (id, team_id, first_name, last_name, jersey_number, position, identification_id, photo_urls, is_federated, federation_id, active)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, team_id AS "teamId", first_name AS "firstName", last_name AS "lastName", jersey_number AS "jerseyNumber", position, identification_id AS "identificationId", photo_urls AS "photoUrls", is_federated AS "isFederated", federation_id AS "federationId", active`,
      [
        insertPlayer.teamId,
        insertPlayer.firstName,
        insertPlayer.lastName,
        insertPlayer.jerseyNumber,
        insertPlayer.position || null,
        insertPlayer.identificationId || null,
        insertPlayer.photoUrls || null,
        insertPlayer.isFederated ?? null,
        insertPlayer.federationId || null,
        insertPlayer.active ?? true,
      ]
    );
    return result.rows[0];
  }

  async updatePlayer(id: string, data: Partial<InsertPlayer>): Promise<Player | undefined> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.teamId !== undefined) { setClauses.push(`team_id = $${paramIndex++}`); values.push(data.teamId); }
    if (data.firstName !== undefined) { setClauses.push(`first_name = $${paramIndex++}`); values.push(data.firstName); }
    if (data.lastName !== undefined) { setClauses.push(`last_name = $${paramIndex++}`); values.push(data.lastName); }
    if (data.jerseyNumber !== undefined) { setClauses.push(`jersey_number = $${paramIndex++}`); values.push(data.jerseyNumber); }
    if (data.position !== undefined) { setClauses.push(`position = $${paramIndex++}`); values.push(data.position); }
    if (data.identificationId !== undefined) { setClauses.push(`identification_id = $${paramIndex++}`); values.push(data.identificationId); }
    if (data.photoUrls !== undefined) { setClauses.push(`photo_urls = $${paramIndex++}`); values.push(data.photoUrls); }
    if (data.isFederated !== undefined) { setClauses.push(`is_federated = $${paramIndex++}`); values.push(data.isFederated); }
    if (data.federationId !== undefined) { setClauses.push(`federation_id = $${paramIndex++}`); values.push(data.federationId); }
    if (data.active !== undefined) { setClauses.push(`active = $${paramIndex++}`); values.push(data.active); }

    if (setClauses.length === 0) return this.getPlayer(id);

    values.push(id);
    const result = await this.pool.query(
      `UPDATE players SET ${setClauses.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, team_id AS "teamId", first_name AS "firstName", last_name AS "lastName", jersey_number AS "jerseyNumber", position, identification_id AS "identificationId", photo_urls AS "photoUrls", is_federated AS "isFederated", federation_id AS "federationId", active`,
      values
    );
    return result.rows[0] || undefined;
  }

  async deletePlayer(id: string): Promise<void> {
    await this.pool.query(`DELETE FROM players WHERE id = $1`, [id]);
  }

  async getMatches(tournamentId?: string): Promise<Match[]> {
    const cols = `id, tournament_id AS "tournamentId", round_number AS "roundNumber", date_time AS "dateTime", field, home_team_id AS "homeTeamId", away_team_id AS "awayTeamId", referee_user_id AS "refereeUserId", status, home_score AS "homeScore", away_score AS "awayScore", vs_image_url AS "vsImageUrl", stage`;
    if (tournamentId) {
      const result = await this.pool.query(`SELECT ${cols} FROM matches WHERE tournament_id = $1`, [tournamentId]);
      return result.rows;
    }
    const result = await this.pool.query(`SELECT ${cols} FROM matches`);
    return result.rows;
  }

  async getMatch(id: string): Promise<Match | undefined> {
    const result = await this.pool.query(
      `SELECT id, tournament_id AS "tournamentId", round_number AS "roundNumber", date_time AS "dateTime", field, home_team_id AS "homeTeamId", away_team_id AS "awayTeamId", referee_user_id AS "refereeUserId", status, home_score AS "homeScore", away_score AS "awayScore", vs_image_url AS "vsImageUrl", stage FROM matches WHERE id = $1`,
      [id]
    );
    return result.rows[0] || undefined;
  }

  async getMatchWithTeams(id: string): Promise<MatchWithTeams | undefined> {
    const match = await this.getMatch(id);
    if (!match) return undefined;

    const homeTeam = match.homeTeamId ? await this.getTeam(match.homeTeamId) : null;
    const awayTeam = match.awayTeamId ? await this.getTeam(match.awayTeamId) : null;
    const referee = match.refereeUserId ? await this.getUser(match.refereeUserId) : undefined;
    const refereeProfile = match.refereeUserId ? await this.getRefereeProfile(match.refereeUserId) : undefined;
    const events = await this.getMatchEvents(id);

    return {
      ...match,
      homeTeam: homeTeam || null,
      awayTeam: awayTeam || null,
      referee: referee ? { ...referee, passwordHash: undefined } as any : undefined,
      refereeProfile,
      events,
    };
  }

  async getMatchesByReferee(userId: string): Promise<MatchWithTeams[]> {
    const result = await this.pool.query(
      `SELECT id FROM matches WHERE referee_user_id = $1`,
      [userId]
    );
    const matches: MatchWithTeams[] = [];
    for (const row of result.rows) {
      const withTeams = await this.getMatchWithTeams(row.id);
      if (withTeams) matches.push(withTeams);
    }
    return matches;
  }

  async getMatchesByTeam(teamId: string): Promise<MatchWithTeams[]> {
    const result = await this.pool.query(
      `SELECT id FROM matches WHERE home_team_id = $1 OR away_team_id = $1`,
      [teamId]
    );
    const matches: MatchWithTeams[] = [];
    for (const row of result.rows) {
      const withTeams = await this.getMatchWithTeams(row.id);
      if (withTeams) matches.push(withTeams);
    }
    return matches;
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const result = await this.pool.query(
      `INSERT INTO matches (id, tournament_id, round_number, date_time, field, home_team_id, away_team_id, referee_user_id, status, home_score, away_score, vs_image_url, stage)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id, tournament_id AS "tournamentId", round_number AS "roundNumber", date_time AS "dateTime", field, home_team_id AS "homeTeamId", away_team_id AS "awayTeamId", referee_user_id AS "refereeUserId", status, home_score AS "homeScore", away_score AS "awayScore", vs_image_url AS "vsImageUrl", stage`,
      [
        insertMatch.tournamentId,
        insertMatch.roundNumber,
        insertMatch.dateTime,
        insertMatch.field,
        insertMatch.homeTeamId,
        insertMatch.awayTeamId,
        insertMatch.refereeUserId || null,
        insertMatch.status || "PROGRAMADO",
        insertMatch.homeScore ?? null,
        insertMatch.awayScore ?? null,
        insertMatch.vsImageUrl || null,
        insertMatch.stage || null,
      ]
    );
    return result.rows[0];
  }

  async updateMatch(id: string, data: Partial<InsertMatch>): Promise<Match | undefined> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.tournamentId !== undefined) { setClauses.push(`tournament_id = $${paramIndex++}`); values.push(data.tournamentId); }
    if (data.roundNumber !== undefined) { setClauses.push(`round_number = $${paramIndex++}`); values.push(data.roundNumber); }
    if (data.dateTime !== undefined) { setClauses.push(`date_time = $${paramIndex++}`); values.push(data.dateTime); }
    if (data.field !== undefined) { setClauses.push(`field = $${paramIndex++}`); values.push(data.field); }
    if (data.homeTeamId !== undefined) { setClauses.push(`home_team_id = $${paramIndex++}`); values.push(data.homeTeamId); }
    if (data.awayTeamId !== undefined) { setClauses.push(`away_team_id = $${paramIndex++}`); values.push(data.awayTeamId); }
    if (data.refereeUserId !== undefined) { setClauses.push(`referee_user_id = $${paramIndex++}`); values.push(data.refereeUserId || null); }
    if (data.status !== undefined) { setClauses.push(`status = $${paramIndex++}`); values.push(data.status); }
    if (data.homeScore !== undefined) { setClauses.push(`home_score = $${paramIndex++}`); values.push(data.homeScore); }
    if (data.awayScore !== undefined) { setClauses.push(`away_score = $${paramIndex++}`); values.push(data.awayScore); }
    if (data.vsImageUrl !== undefined) { setClauses.push(`vs_image_url = $${paramIndex++}`); values.push(data.vsImageUrl || null); }
    if (data.stage !== undefined) { setClauses.push(`stage = $${paramIndex++}`); values.push(data.stage || null); }

    if (setClauses.length === 0) return this.getMatch(id);

    values.push(id);
    const result = await this.pool.query(
      `UPDATE matches SET ${setClauses.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, tournament_id AS "tournamentId", round_number AS "roundNumber", date_time AS "dateTime", field, home_team_id AS "homeTeamId", away_team_id AS "awayTeamId", referee_user_id AS "refereeUserId", status, home_score AS "homeScore", away_score AS "awayScore", vs_image_url AS "vsImageUrl", stage`,
      values
    );
    return result.rows[0] || undefined;
  }

  async deleteMatch(id: string): Promise<void> {
    await this.pool.query(`DELETE FROM match_events WHERE match_id = $1`, [id]);
    await this.pool.query(`DELETE FROM match_lineups WHERE match_id = $1`, [id]);
    await this.pool.query(`DELETE FROM match_evidence WHERE match_id = $1`, [id]);
    await this.pool.query(`DELETE FROM matches WHERE id = $1`, [id]);
  }

  async getMatchEvents(matchId: string): Promise<MatchEventWithPlayer[]> {
    const result = await this.pool.query(
      `SELECT
        me.id, me.match_id AS "matchId", me.type, me.minute, me.team_id AS "teamId", me.player_id AS "playerId", me.related_player_id AS "relatedPlayerId", me.notes,
        p.id AS "p_id", p.team_id AS "p_teamId", p.first_name AS "p_firstName", p.last_name AS "p_lastName", p.jersey_number AS "p_jerseyNumber", p.position AS "p_position", p.identification_id AS "p_identificationId", p.photo_urls AS "p_photoUrls", p.is_federated AS "p_isFederated", p.federation_id AS "p_federationId", p.active AS "p_active",
        t.id AS "t_id", t.tournament_id AS "t_tournamentId", t.division_id AS "t_divisionId", t.name AS "t_name", t.colors AS "t_colors", t.home_field AS "t_homeField", t.logo_url AS "t_logoUrl", t.captain_user_id AS "t_captainUserId", t.coach_name AS "t_coachName"
       FROM match_events me
       LEFT JOIN players p ON me.player_id = p.id
       LEFT JOIN teams t ON me.team_id = t.id
       WHERE me.match_id = $1
       ORDER BY me.minute ASC`,
      [matchId]
    );

    return result.rows
      .filter((row: any) => row.p_id && row.t_id)
      .map((row: any) => ({
        id: row.id,
        matchId: row.matchId,
        type: row.type,
        minute: row.minute,
        teamId: row.teamId,
        playerId: row.playerId,
        relatedPlayerId: row.relatedPlayerId,
        notes: row.notes,
        player: {
          id: row.p_id,
          teamId: row.p_teamId,
          firstName: row.p_firstName,
          lastName: row.p_lastName,
          jerseyNumber: row.p_jerseyNumber,
          position: row.p_position,
          identificationId: row.p_identificationId,
          photoUrls: row.p_photoUrls,
          isFederated: row.p_isFederated,
          federationId: row.p_federationId,
          active: row.p_active,
        },
        team: {
          id: row.t_id,
          tournamentId: row.t_tournamentId,
          divisionId: row.t_divisionId,
          name: row.t_name,
          colors: row.t_colors,
          homeField: row.t_homeField,
          logoUrl: row.t_logoUrl,
          captainUserId: row.t_captainUserId,
          coachName: row.t_coachName,
        },
      }));
  }

  async getAllMatchEvents(): Promise<MatchEvent[]> {
    const result = await this.pool.query(
      `SELECT id, match_id AS "matchId", type, minute, team_id AS "teamId", player_id AS "playerId", related_player_id AS "relatedPlayerId", notes FROM match_events`
    );
    return result.rows;
  }

  async createMatchEvent(insertEvent: InsertMatchEvent): Promise<MatchEvent> {
    const result = await this.pool.query(
      `INSERT INTO match_events (id, match_id, type, minute, team_id, player_id, related_player_id, notes)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7)
       RETURNING id, match_id AS "matchId", type, minute, team_id AS "teamId", player_id AS "playerId", related_player_id AS "relatedPlayerId", notes`,
      [insertEvent.matchId, insertEvent.type, insertEvent.minute, insertEvent.teamId, insertEvent.playerId, insertEvent.relatedPlayerId || null, insertEvent.notes || null]
    );
    return result.rows[0];
  }

  async deleteMatchEvents(matchId: string): Promise<void> {
    await this.pool.query(`DELETE FROM match_events WHERE match_id = $1`, [matchId]);
  }

  async calculateStandings(tournamentId: string): Promise<Standing[]> {
    const teams = await this.getTeams(tournamentId);
    const allMatches = await this.getMatches(tournamentId);
    const matches = allMatches.filter(m => m.status === "JUGADO");

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

  async getNews(tournamentId?: string): Promise<NewsWithAuthor[]> {
    let query = `SELECT n.id, n.tournament_id AS "tournamentId", n.match_id AS "matchId", n.title, n.content, n.image_url AS "imageUrl", n.author_id AS "authorId", n.created_at AS "createdAt", n.updated_at AS "updatedAt",
      u.id AS "a_id", u.name AS "a_name", u.email AS "a_email", u.role AS "a_role", u.team_id AS "a_teamId", u.status AS "a_status", u.created_at AS "a_createdAt"
      FROM news n
      LEFT JOIN users u ON n.author_id = u.id`;
    const values: any[] = [];

    if (tournamentId) {
      query += ` WHERE n.tournament_id = $1`;
      values.push(tournamentId);
    }
    query += ` ORDER BY n.created_at DESC`;

    const result = await this.pool.query(query, values);

    const newsItems: NewsWithAuthor[] = [];
    for (const row of result.rows) {
      if (!row.a_id) continue;
      let match: MatchWithTeams | undefined;
      if (row.matchId) {
        match = await this.getMatchWithTeams(row.matchId);
      }
      newsItems.push({
        id: row.id,
        tournamentId: row.tournamentId,
        matchId: row.matchId,
        title: row.title,
        content: row.content,
        imageUrl: row.imageUrl,
        authorId: row.authorId,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        author: {
          id: row.a_id,
          name: row.a_name,
          email: row.a_email,
          role: row.a_role,
          teamId: row.a_teamId,
          status: row.a_status,
          createdAt: row.a_createdAt,
        },
        match,
      });
    }
    return newsItems;
  }

  async getNewsItem(id: string): Promise<NewsWithAuthor | undefined> {
    const result = await this.pool.query(
      `SELECT n.id, n.tournament_id AS "tournamentId", n.match_id AS "matchId", n.title, n.content, n.image_url AS "imageUrl", n.author_id AS "authorId", n.created_at AS "createdAt", n.updated_at AS "updatedAt",
        u.id AS "a_id", u.name AS "a_name", u.email AS "a_email", u.role AS "a_role", u.team_id AS "a_teamId", u.status AS "a_status", u.created_at AS "a_createdAt"
       FROM news n
       LEFT JOIN users u ON n.author_id = u.id
       WHERE n.id = $1`,
      [id]
    );
    const row = result.rows[0];
    if (!row || !row.a_id) return undefined;

    let match: MatchWithTeams | undefined;
    if (row.matchId) {
      match = await this.getMatchWithTeams(row.matchId);
    }

    return {
      id: row.id,
      tournamentId: row.tournamentId,
      matchId: row.matchId,
      title: row.title,
      content: row.content,
      imageUrl: row.imageUrl,
      authorId: row.authorId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      author: {
        id: row.a_id,
        name: row.a_name,
        email: row.a_email,
        role: row.a_role,
        teamId: row.a_teamId,
        status: row.a_status,
        createdAt: row.a_createdAt,
      },
      match,
    };
  }

  async createNews(insertNews: InsertNews, authorId: string): Promise<News> {
    const result = await this.pool.query(
      `INSERT INTO news (id, tournament_id, match_id, title, content, image_url, author_id, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id, tournament_id AS "tournamentId", match_id AS "matchId", title, content, image_url AS "imageUrl", author_id AS "authorId", created_at AS "createdAt", updated_at AS "updatedAt"`,
      [insertNews.tournamentId, insertNews.matchId || null, insertNews.title, insertNews.content, insertNews.imageUrl || null, authorId]
    );
    return result.rows[0];
  }

  async updateNews(id: string, data: Partial<InsertNews>): Promise<News | undefined> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.tournamentId !== undefined) { setClauses.push(`tournament_id = $${paramIndex++}`); values.push(data.tournamentId); }
    if (data.matchId !== undefined) { setClauses.push(`match_id = $${paramIndex++}`); values.push(data.matchId || null); }
    if (data.title !== undefined) { setClauses.push(`title = $${paramIndex++}`); values.push(data.title); }
    if (data.content !== undefined) { setClauses.push(`content = $${paramIndex++}`); values.push(data.content); }
    if (data.imageUrl !== undefined) { setClauses.push(`image_url = $${paramIndex++}`); values.push(data.imageUrl === "" ? null : data.imageUrl); }

    setClauses.push(`updated_at = NOW()`);

    values.push(id);
    const result = await this.pool.query(
      `UPDATE news SET ${setClauses.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, tournament_id AS "tournamentId", match_id AS "matchId", title, content, image_url AS "imageUrl", author_id AS "authorId", created_at AS "createdAt", updated_at AS "updatedAt"`,
      values
    );
    return result.rows[0] || undefined;
  }

  async deleteNews(id: string): Promise<void> {
    await this.pool.query(`DELETE FROM news WHERE id = $1`, [id]);
  }

  async getRefereeProfiles(): Promise<RefereeProfile[]> {
    const result = await this.pool.query(
      `SELECT id, user_id AS "userId", full_name AS "fullName", identification_number AS "identificationNumber", phone, email, association, years_of_experience AS "yearsOfExperience", observations, status, created_at AS "createdAt", updated_at AS "updatedAt" FROM referee_profiles`
    );
    return result.rows;
  }

  async getRefereeProfile(userId: string): Promise<RefereeProfile | undefined> {
    const result = await this.pool.query(
      `SELECT id, user_id AS "userId", full_name AS "fullName", identification_number AS "identificationNumber", phone, email, association, years_of_experience AS "yearsOfExperience", observations, status, created_at AS "createdAt", updated_at AS "updatedAt" FROM referee_profiles WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0] || undefined;
  }

  async getRefereeProfileById(id: string): Promise<RefereeProfile | undefined> {
    const result = await this.pool.query(
      `SELECT id, user_id AS "userId", full_name AS "fullName", identification_number AS "identificationNumber", phone, email, association, years_of_experience AS "yearsOfExperience", observations, status, created_at AS "createdAt", updated_at AS "updatedAt" FROM referee_profiles WHERE id = $1`,
      [id]
    );
    return result.rows[0] || undefined;
  }

  async createRefereeProfile(userId: string, profile: InsertRefereeProfile): Promise<RefereeProfile> {
    const result = await this.pool.query(
      `INSERT INTO referee_profiles (id, user_id, full_name, identification_number, phone, email, association, years_of_experience, observations, status, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING id, user_id AS "userId", full_name AS "fullName", identification_number AS "identificationNumber", phone, email, association, years_of_experience AS "yearsOfExperience", observations, status, created_at AS "createdAt", updated_at AS "updatedAt"`,
      [userId, profile.fullName, profile.identificationNumber, profile.phone, profile.email, profile.association || null, profile.yearsOfExperience ?? null, profile.observations || null, profile.status || "ACTIVO"]
    );
    return result.rows[0];
  }

  async updateRefereeProfile(userId: string, data: Partial<InsertRefereeProfile>): Promise<RefereeProfile | undefined> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.fullName !== undefined) { setClauses.push(`full_name = $${paramIndex++}`); values.push(data.fullName); }
    if (data.identificationNumber !== undefined) { setClauses.push(`identification_number = $${paramIndex++}`); values.push(data.identificationNumber); }
    if (data.phone !== undefined) { setClauses.push(`phone = $${paramIndex++}`); values.push(data.phone); }
    if (data.email !== undefined) { setClauses.push(`email = $${paramIndex++}`); values.push(data.email); }
    if (data.association !== undefined) { setClauses.push(`association = $${paramIndex++}`); values.push(data.association); }
    if (data.yearsOfExperience !== undefined) { setClauses.push(`years_of_experience = $${paramIndex++}`); values.push(data.yearsOfExperience); }
    if (data.observations !== undefined) { setClauses.push(`observations = $${paramIndex++}`); values.push(data.observations); }
    if (data.status !== undefined) { setClauses.push(`status = $${paramIndex++}`); values.push(data.status); }

    setClauses.push(`updated_at = NOW()`);

    if (setClauses.length === 1) return this.getRefereeProfile(userId);

    values.push(userId);
    const result = await this.pool.query(
      `UPDATE referee_profiles SET ${setClauses.join(', ')} WHERE user_id = $${paramIndex}
       RETURNING id, user_id AS "userId", full_name AS "fullName", identification_number AS "identificationNumber", phone, email, association, years_of_experience AS "yearsOfExperience", observations, status, created_at AS "createdAt", updated_at AS "updatedAt"`,
      values
    );
    return result.rows[0] || undefined;
  }

  async updateRefereeProfileById(id: string, data: Partial<InsertRefereeProfile>): Promise<RefereeProfile | undefined> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.fullName !== undefined) { setClauses.push(`full_name = $${paramIndex++}`); values.push(data.fullName); }
    if (data.identificationNumber !== undefined) { setClauses.push(`identification_number = $${paramIndex++}`); values.push(data.identificationNumber); }
    if (data.phone !== undefined) { setClauses.push(`phone = $${paramIndex++}`); values.push(data.phone); }
    if (data.email !== undefined) { setClauses.push(`email = $${paramIndex++}`); values.push(data.email); }
    if (data.association !== undefined) { setClauses.push(`association = $${paramIndex++}`); values.push(data.association); }
    if (data.yearsOfExperience !== undefined) { setClauses.push(`years_of_experience = $${paramIndex++}`); values.push(data.yearsOfExperience); }
    if (data.observations !== undefined) { setClauses.push(`observations = $${paramIndex++}`); values.push(data.observations); }
    if (data.status !== undefined) { setClauses.push(`status = $${paramIndex++}`); values.push(data.status); }

    setClauses.push(`updated_at = NOW()`);

    if (setClauses.length === 1) return this.getRefereeProfileById(id);

    values.push(id);
    const result = await this.pool.query(
      `UPDATE referee_profiles SET ${setClauses.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, user_id AS "userId", full_name AS "fullName", identification_number AS "identificationNumber", phone, email, association, years_of_experience AS "yearsOfExperience", observations, status, created_at AS "createdAt", updated_at AS "updatedAt"`,
      values
    );
    return result.rows[0] || undefined;
  }

  async deleteRefereeProfile(id: string): Promise<void> {
    await this.pool.query(`DELETE FROM referee_profiles WHERE id = $1`, [id]);
  }

  async getCaptainProfiles(): Promise<CaptainProfile[]> {
    const result = await this.pool.query(
      `SELECT id, user_id AS "userId", full_name AS "fullName", identification_number AS "identificationNumber", phone, email, address, emergency_contact AS "emergencyContact", emergency_phone AS "emergencyPhone", observations, created_at AS "createdAt", updated_at AS "updatedAt" FROM captain_profiles`
    );
    return result.rows;
  }

  async getCaptainProfile(userId: string): Promise<CaptainProfile | undefined> {
    const result = await this.pool.query(
      `SELECT id, user_id AS "userId", full_name AS "fullName", identification_number AS "identificationNumber", phone, email, address, emergency_contact AS "emergencyContact", emergency_phone AS "emergencyPhone", observations, created_at AS "createdAt", updated_at AS "updatedAt" FROM captain_profiles WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0] || undefined;
  }

  async getCaptainProfileById(id: string): Promise<CaptainProfile | undefined> {
    const result = await this.pool.query(
      `SELECT id, user_id AS "userId", full_name AS "fullName", identification_number AS "identificationNumber", phone, email, address, emergency_contact AS "emergencyContact", emergency_phone AS "emergencyPhone", observations, created_at AS "createdAt", updated_at AS "updatedAt" FROM captain_profiles WHERE id = $1`,
      [id]
    );
    return result.rows[0] || undefined;
  }

  async createCaptainProfile(userId: string, profile: InsertCaptainProfile): Promise<CaptainProfile> {
    const result = await this.pool.query(
      `INSERT INTO captain_profiles (id, user_id, full_name, identification_number, phone, email, address, emergency_contact, emergency_phone, observations, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING id, user_id AS "userId", full_name AS "fullName", identification_number AS "identificationNumber", phone, email, address, emergency_contact AS "emergencyContact", emergency_phone AS "emergencyPhone", observations, created_at AS "createdAt", updated_at AS "updatedAt"`,
      [userId, profile.fullName, profile.identificationNumber, profile.phone, profile.email, profile.address || null, profile.emergencyContact || null, profile.emergencyPhone || null, profile.observations || null]
    );
    return result.rows[0];
  }

  async updateCaptainProfile(userId: string, data: Partial<InsertCaptainProfile>): Promise<CaptainProfile | undefined> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.fullName !== undefined) { setClauses.push(`full_name = $${paramIndex++}`); values.push(data.fullName); }
    if (data.identificationNumber !== undefined) { setClauses.push(`identification_number = $${paramIndex++}`); values.push(data.identificationNumber); }
    if (data.phone !== undefined) { setClauses.push(`phone = $${paramIndex++}`); values.push(data.phone); }
    if (data.email !== undefined) { setClauses.push(`email = $${paramIndex++}`); values.push(data.email); }
    if (data.address !== undefined) { setClauses.push(`address = $${paramIndex++}`); values.push(data.address); }
    if (data.emergencyContact !== undefined) { setClauses.push(`emergency_contact = $${paramIndex++}`); values.push(data.emergencyContact); }
    if (data.emergencyPhone !== undefined) { setClauses.push(`emergency_phone = $${paramIndex++}`); values.push(data.emergencyPhone); }
    if (data.observations !== undefined) { setClauses.push(`observations = $${paramIndex++}`); values.push(data.observations); }

    setClauses.push(`updated_at = NOW()`);

    if (setClauses.length === 1) return this.getCaptainProfile(userId);

    values.push(userId);
    const result = await this.pool.query(
      `UPDATE captain_profiles SET ${setClauses.join(', ')} WHERE user_id = $${paramIndex}
       RETURNING id, user_id AS "userId", full_name AS "fullName", identification_number AS "identificationNumber", phone, email, address, emergency_contact AS "emergencyContact", emergency_phone AS "emergencyPhone", observations, created_at AS "createdAt", updated_at AS "updatedAt"`,
      values
    );
    return result.rows[0] || undefined;
  }

  async updateCaptainProfileById(id: string, data: Partial<InsertCaptainProfile>): Promise<CaptainProfile | undefined> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.fullName !== undefined) { setClauses.push(`full_name = $${paramIndex++}`); values.push(data.fullName); }
    if (data.identificationNumber !== undefined) { setClauses.push(`identification_number = $${paramIndex++}`); values.push(data.identificationNumber); }
    if (data.phone !== undefined) { setClauses.push(`phone = $${paramIndex++}`); values.push(data.phone); }
    if (data.email !== undefined) { setClauses.push(`email = $${paramIndex++}`); values.push(data.email); }
    if (data.address !== undefined) { setClauses.push(`address = $${paramIndex++}`); values.push(data.address); }
    if (data.emergencyContact !== undefined) { setClauses.push(`emergency_contact = $${paramIndex++}`); values.push(data.emergencyContact); }
    if (data.emergencyPhone !== undefined) { setClauses.push(`emergency_phone = $${paramIndex++}`); values.push(data.emergencyPhone); }
    if (data.observations !== undefined) { setClauses.push(`observations = $${paramIndex++}`); values.push(data.observations); }

    setClauses.push(`updated_at = NOW()`);

    if (setClauses.length === 1) return this.getCaptainProfileById(id);

    values.push(id);
    const result = await this.pool.query(
      `UPDATE captain_profiles SET ${setClauses.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, user_id AS "userId", full_name AS "fullName", identification_number AS "identificationNumber", phone, email, address, emergency_contact AS "emergencyContact", emergency_phone AS "emergencyPhone", observations, created_at AS "createdAt", updated_at AS "updatedAt"`,
      values
    );
    return result.rows[0] || undefined;
  }

  async deleteCaptainProfile(id: string): Promise<void> {
    await this.pool.query(`DELETE FROM captain_profiles WHERE id = $1`, [id]);
  }

  async getDivisions(): Promise<Division[]> {
    const result = await this.pool.query(
      `SELECT id, name, theme, description, created_at AS "createdAt" FROM divisions`
    );
    return result.rows;
  }

  async getDivision(id: string): Promise<Division | undefined> {
    const result = await this.pool.query(
      `SELECT id, name, theme, description, created_at AS "createdAt" FROM divisions WHERE id = $1`,
      [id]
    );
    return result.rows[0] || undefined;
  }

  async createDivision(division: InsertDivision): Promise<Division> {
    const result = await this.pool.query(
      `INSERT INTO divisions (id, name, theme, description, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, NOW())
       RETURNING id, name, theme, description, created_at AS "createdAt"`,
      [division.name, division.theme, division.description || null]
    );
    return result.rows[0];
  }

  async updateDivision(id: string, data: Partial<InsertDivision>): Promise<Division | undefined> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) { setClauses.push(`name = $${paramIndex++}`); values.push(data.name); }
    if (data.theme !== undefined) { setClauses.push(`theme = $${paramIndex++}`); values.push(data.theme); }
    if (data.description !== undefined) { setClauses.push(`description = $${paramIndex++}`); values.push(data.description); }

    if (setClauses.length === 0) return this.getDivision(id);

    values.push(id);
    const result = await this.pool.query(
      `UPDATE divisions SET ${setClauses.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, name, theme, description, created_at AS "createdAt"`,
      values
    );
    return result.rows[0] || undefined;
  }

  async deleteDivision(id: string): Promise<void> {
    await this.pool.query(`DELETE FROM divisions WHERE id = $1`, [id]);
  }

  async getTournamentTypes(): Promise<TournamentType[]> {
    const result = await this.pool.query(
      `SELECT id, name, algorithm, description, supports_double_round AS "supportsDoubleRound" FROM tournament_types`
    );
    return result.rows;
  }

  async getTournamentType(id: string): Promise<TournamentType | undefined> {
    const result = await this.pool.query(
      `SELECT id, name, algorithm, description, supports_double_round AS "supportsDoubleRound" FROM tournament_types WHERE id = $1`,
      [id]
    );
    return result.rows[0] || undefined;
  }

  async createTournamentType(type: InsertTournamentType): Promise<TournamentType> {
    const result = await this.pool.query(
      `INSERT INTO tournament_types (id, name, algorithm, description, supports_double_round)
       VALUES (gen_random_uuid(), $1, $2, $3, $4)
       RETURNING id, name, algorithm, description, supports_double_round AS "supportsDoubleRound"`,
      [type.name, type.algorithm, type.description, type.supportsDoubleRound ?? false]
    );
    return result.rows[0];
  }

  async getMatchLineups(matchId: string): Promise<MatchLineup[]> {
    const result = await this.pool.query(
      `SELECT id, match_id AS "matchId", team_id AS "teamId", player_ids AS "playerIds", created_at AS "createdAt" FROM match_lineups WHERE match_id = $1`,
      [matchId]
    );
    return result.rows;
  }

  async createMatchLineup(lineup: InsertMatchLineup): Promise<MatchLineup> {
    const result = await this.pool.query(
      `INSERT INTO match_lineups (id, match_id, team_id, player_ids, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, NOW())
       RETURNING id, match_id AS "matchId", team_id AS "teamId", player_ids AS "playerIds", created_at AS "createdAt"`,
      [lineup.matchId, lineup.teamId, JSON.stringify(lineup.playerIds)]
    );
    return result.rows[0];
  }

  async deleteMatchLineups(matchId: string): Promise<void> {
    await this.pool.query(`DELETE FROM match_lineups WHERE match_id = $1`, [matchId]);
  }

  async deleteMatchLineupByTeam(matchId: string, teamId: string): Promise<void> {
    await this.pool.query(`DELETE FROM match_lineups WHERE match_id = $1 AND team_id = $2`, [matchId, teamId]);
  }

  async getMatchEvidence(matchId: string): Promise<MatchEvidence[]> {
    const result = await this.pool.query(
      `SELECT id, match_id AS "matchId", event_id AS "eventId", type, url, transcript, created_at AS "createdAt" FROM match_evidence WHERE match_id = $1`,
      [matchId]
    );
    return result.rows;
  }

  async createMatchEvidence(evidence: InsertMatchEvidence): Promise<MatchEvidence> {
    const result = await this.pool.query(
      `INSERT INTO match_evidence (id, match_id, event_id, type, url, transcript, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
       RETURNING id, match_id AS "matchId", event_id AS "eventId", type, url, transcript, created_at AS "createdAt"`,
      [evidence.matchId, evidence.eventId || null, evidence.type, evidence.url, evidence.transcript || null]
    );
    return result.rows[0];
  }

  async deleteMatchEvidence(id: string): Promise<void> {
    await this.pool.query(`DELETE FROM match_evidence WHERE id = $1`, [id]);
  }

  async getFines(tournamentId?: string, teamId?: string): Promise<Fine[]> {
    let query = `SELECT id, tournament_id AS "tournamentId", match_id AS "matchId", match_event_id AS "matchEventId", team_id AS "teamId", player_id AS "playerId", card_type AS "cardType", amount, status, paid_amount AS "paidAmount", paid_at AS "paidAt", created_at AS "createdAt" FROM fines WHERE 1=1`;
    const values: any[] = [];
    let paramIndex = 1;

    if (tournamentId) {
      query += ` AND tournament_id = $${paramIndex++}`;
      values.push(tournamentId);
    }
    if (teamId) {
      query += ` AND team_id = $${paramIndex++}`;
      values.push(teamId);
    }

    const result = await this.pool.query(query, values);
    return result.rows;
  }

  async getFine(id: string): Promise<Fine | undefined> {
    const result = await this.pool.query(
      `SELECT id, tournament_id AS "tournamentId", match_id AS "matchId", match_event_id AS "matchEventId", team_id AS "teamId", player_id AS "playerId", card_type AS "cardType", amount, status, paid_amount AS "paidAmount", paid_at AS "paidAt", created_at AS "createdAt" FROM fines WHERE id = $1`,
      [id]
    );
    return result.rows[0] || undefined;
  }

  async createFine(fine: InsertFine): Promise<Fine> {
    const result = await this.pool.query(
      `INSERT INTO fines (id, tournament_id, match_id, match_event_id, team_id, player_id, card_type, amount, status, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING id, tournament_id AS "tournamentId", match_id AS "matchId", match_event_id AS "matchEventId", team_id AS "teamId", player_id AS "playerId", card_type AS "cardType", amount, status, paid_amount AS "paidAmount", paid_at AS "paidAt", created_at AS "createdAt"`,
      [fine.tournamentId, fine.matchId, fine.matchEventId || null, fine.teamId, fine.playerId, fine.cardType, fine.amount, fine.status || "PENDIENTE"]
    );
    return result.rows[0];
  }

  async updateFine(id: string, data: Partial<Fine>): Promise<Fine | undefined> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.amount !== undefined) { setClauses.push(`amount = $${paramIndex++}`); values.push(data.amount); }
    if (data.status !== undefined) { setClauses.push(`status = $${paramIndex++}`); values.push(data.status); }
    if (data.paidAmount !== undefined) { setClauses.push(`paid_amount = $${paramIndex++}`); values.push(data.paidAmount); }
    if (data.paidAt !== undefined) { setClauses.push(`paid_at = $${paramIndex++}`); values.push(data.paidAt); }

    if (setClauses.length === 0) return this.getFine(id);

    values.push(id);
    const result = await this.pool.query(
      `UPDATE fines SET ${setClauses.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, tournament_id AS "tournamentId", match_id AS "matchId", match_event_id AS "matchEventId", team_id AS "teamId", player_id AS "playerId", card_type AS "cardType", amount, status, paid_amount AS "paidAmount", paid_at AS "paidAt", created_at AS "createdAt"`,
      values
    );
    return result.rows[0] || undefined;
  }

  async getTeamPayments(tournamentId?: string, teamId?: string): Promise<TeamPayment[]> {
    let query = `SELECT id, tournament_id AS "tournamentId", team_id AS "teamId", amount, method, notes, paid_at AS "paidAt", created_at AS "createdAt" FROM team_payments WHERE 1=1`;
    const values: any[] = [];
    let paramIndex = 1;

    if (tournamentId) {
      query += ` AND tournament_id = $${paramIndex++}`;
      values.push(tournamentId);
    }
    if (teamId) {
      query += ` AND team_id = $${paramIndex++}`;
      values.push(teamId);
    }

    const result = await this.pool.query(query, values);
    return result.rows;
  }

  async createTeamPayment(payment: InsertTeamPayment): Promise<TeamPayment> {
    const result = await this.pool.query(
      `INSERT INTO team_payments (id, tournament_id, team_id, amount, method, notes, paid_at, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, tournament_id AS "tournamentId", team_id AS "teamId", amount, method, notes, paid_at AS "paidAt", created_at AS "createdAt"`,
      [payment.tournamentId, payment.teamId, payment.amount, payment.method || null, payment.notes || null, payment.paidAt]
    );
    return result.rows[0];
  }

  async getFinePayments(tournamentId?: string, teamId?: string): Promise<FinePayment[]> {
    let query = `SELECT id, tournament_id AS "tournamentId", team_id AS "teamId", amount, notes, paid_at AS "paidAt", created_at AS "createdAt" FROM fine_payments WHERE 1=1`;
    const values: any[] = [];
    let paramIndex = 1;

    if (tournamentId) {
      query += ` AND tournament_id = $${paramIndex++}`;
      values.push(tournamentId);
    }
    if (teamId) {
      query += ` AND team_id = $${paramIndex++}`;
      values.push(teamId);
    }

    const result = await this.pool.query(query, values);
    return result.rows;
  }

  async createFinePayment(payment: InsertFinePayment): Promise<FinePayment> {
    const result = await this.pool.query(
      `INSERT INTO fine_payments (id, tournament_id, team_id, amount, notes, paid_at, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
       RETURNING id, tournament_id AS "tournamentId", team_id AS "teamId", amount, notes, paid_at AS "paidAt", created_at AS "createdAt"`,
      [payment.tournamentId, payment.teamId, payment.amount, payment.notes || null, payment.paidAt]
    );
    return result.rows[0];
  }

  async getExpenses(tournamentId?: string): Promise<Expense[]> {
    if (tournamentId) {
      const result = await this.pool.query(
        `SELECT id, tournament_id AS "tournamentId", concept, amount, expense_at AS "expenseAt", notes, receipt_url AS "receiptUrl", created_at AS "createdAt" FROM expenses WHERE tournament_id = $1`,
        [tournamentId]
      );
      return result.rows;
    }
    const result = await this.pool.query(
      `SELECT id, tournament_id AS "tournamentId", concept, amount, expense_at AS "expenseAt", notes, receipt_url AS "receiptUrl", created_at AS "createdAt" FROM expenses`
    );
    return result.rows;
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const result = await this.pool.query(
      `INSERT INTO expenses (id, tournament_id, concept, amount, expense_at, notes, receipt_url, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, tournament_id AS "tournamentId", concept, amount, expense_at AS "expenseAt", notes, receipt_url AS "receiptUrl", created_at AS "createdAt"`,
      [expense.tournamentId, expense.concept, expense.amount, expense.expenseAt, expense.notes || null, expense.receiptUrl || null]
    );
    return result.rows[0];
  }

  async updateExpense(id: string, data: Partial<InsertExpense>): Promise<Expense | undefined> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.tournamentId !== undefined) { setClauses.push(`tournament_id = $${paramIndex++}`); values.push(data.tournamentId); }
    if (data.concept !== undefined) { setClauses.push(`concept = $${paramIndex++}`); values.push(data.concept); }
    if (data.amount !== undefined) { setClauses.push(`amount = $${paramIndex++}`); values.push(data.amount); }
    if (data.expenseAt !== undefined) { setClauses.push(`expense_at = $${paramIndex++}`); values.push(data.expenseAt); }
    if (data.notes !== undefined) { setClauses.push(`notes = $${paramIndex++}`); values.push(data.notes); }
    if (data.receiptUrl !== undefined) { setClauses.push(`receipt_url = $${paramIndex++}`); values.push(data.receiptUrl); }

    if (setClauses.length === 0) return undefined;

    values.push(id);
    const result = await this.pool.query(
      `UPDATE expenses SET ${setClauses.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, tournament_id AS "tournamentId", concept, amount, expense_at AS "expenseAt", notes, receipt_url AS "receiptUrl", created_at AS "createdAt"`,
      values
    );
    return result.rows[0] || undefined;
  }

  async deleteExpense(id: string): Promise<void> {
    await this.pool.query(`DELETE FROM expenses WHERE id = $1`, [id]);
  }

  async getMarketingMedia(): Promise<MarketingMedia[]> {
    const result = await this.pool.query(
      `SELECT id, title, description, type, url, thumbnail_url AS "thumbnailUrl", tournament_id AS "tournamentId", created_at AS "createdAt" FROM marketing_media ORDER BY created_at DESC`
    );
    return result.rows;
  }

  async getMarketingMediaItem(id: string): Promise<MarketingMedia | undefined> {
    const result = await this.pool.query(
      `SELECT id, title, description, type, url, thumbnail_url AS "thumbnailUrl", tournament_id AS "tournamentId", created_at AS "createdAt" FROM marketing_media WHERE id = $1`,
      [id]
    );
    return result.rows[0] || undefined;
  }

  async createMarketingMedia(media: InsertMarketingMedia): Promise<MarketingMedia> {
    const result = await this.pool.query(
      `INSERT INTO marketing_media (id, title, description, type, url, thumbnail_url, tournament_id, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, title, description, type, url, thumbnail_url AS "thumbnailUrl", tournament_id AS "tournamentId", created_at AS "createdAt"`,
      [media.title, media.description || null, media.type, media.url, media.thumbnailUrl || null, media.tournamentId || null]
    );
    return result.rows[0];
  }

  async updateMarketingMedia(id: string, data: Partial<InsertMarketingMedia>): Promise<MarketingMedia | undefined> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) { setClauses.push(`title = $${paramIndex++}`); values.push(data.title); }
    if (data.description !== undefined) { setClauses.push(`description = $${paramIndex++}`); values.push(data.description); }
    if (data.type !== undefined) { setClauses.push(`type = $${paramIndex++}`); values.push(data.type); }
    if (data.url !== undefined) { setClauses.push(`url = $${paramIndex++}`); values.push(data.url); }
    if (data.thumbnailUrl !== undefined) { setClauses.push(`thumbnail_url = $${paramIndex++}`); values.push(data.thumbnailUrl); }
    if (data.tournamentId !== undefined) { setClauses.push(`tournament_id = $${paramIndex++}`); values.push(data.tournamentId); }

    if (setClauses.length === 0) return this.getMarketingMediaItem(id);

    values.push(id);
    const result = await this.pool.query(
      `UPDATE marketing_media SET ${setClauses.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, title, description, type, url, thumbnail_url AS "thumbnailUrl", tournament_id AS "tournamentId", created_at AS "createdAt"`,
      values
    );
    return result.rows[0] || undefined;
  }

  async deleteMarketingMedia(id: string): Promise<void> {
    await this.pool.query(`DELETE FROM marketing_media WHERE id = $1`, [id]);
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    const result = await this.pool.query(
      `SELECT id, contact_name AS "contactName", phone, email, comments, status, created_at AS "createdAt" FROM contact_messages ORDER BY created_at DESC`
    );
    return result.rows;
  }

  async getContactMessage(id: string): Promise<ContactMessage | undefined> {
    const result = await this.pool.query(
      `SELECT id, contact_name AS "contactName", phone, email, comments, status, created_at AS "createdAt" FROM contact_messages WHERE id = $1`,
      [id]
    );
    return result.rows[0] || undefined;
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const result = await this.pool.query(
      `INSERT INTO contact_messages (id, contact_name, phone, email, comments, status, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'NUEVO', NOW())
       RETURNING id, contact_name AS "contactName", phone, email, comments, status, created_at AS "createdAt"`,
      [message.contactName, message.phone, message.email, message.comments]
    );
    return result.rows[0];
  }

  async updateContactMessageStatus(id: string, status: string): Promise<ContactMessage | undefined> {
    const result = await this.pool.query(
      `UPDATE contact_messages SET status = $1 WHERE id = $2
       RETURNING id, contact_name AS "contactName", phone, email, comments, status, created_at AS "createdAt"`,
      [status, id]
    );
    return result.rows[0] || undefined;
  }

  async deleteContactMessage(id: string): Promise<void> {
    await this.pool.query(`DELETE FROM contact_messages WHERE id = $1`, [id]);
  }

  async generateRoundRobinSchedule(tournamentId: string, doubleRound: boolean = false): Promise<Match[]> {
    const tournament = await this.getTournament(tournamentId);
    if (!tournament) throw new Error("Torneo no encontrado");

    const teams = await this.getTeams(tournamentId);
    if (teams.length < 2) throw new Error("Se necesitan al menos 2 equipos");

    const existingMatches = await this.getMatches(tournamentId);
    for (const match of existingMatches) {
      await this.deleteMatch(match.id);
    }

    const teamIds = teams.map(t => t.id);
    const n = teamIds.length;
    const hasOdd = n % 2 !== 0;

    if (hasOdd) {
      teamIds.push("BYE");
    }

    const numTeams = teamIds.length;
    const numRounds = numTeams - 1;
    const matchesPerRound = numTeams / 2;

    const generatedMatches: Match[] = [];

    const fixed = teamIds[0];
    const rotating = teamIds.slice(1);

    for (let round = 0; round < numRounds; round++) {
      const roundNumber = round + 1;

      const pairings: [string, string][] = [];

      pairings.push([fixed, rotating[0]]);

      for (let i = 1; i < matchesPerRound; i++) {
        const home = rotating[i];
        const away = rotating[numTeams - 1 - i];
        pairings.push([home, away]);
      }

      for (const [homeId, awayId] of pairings) {
        if (homeId === "BYE" || awayId === "BYE") continue;

        const match = await this.createMatch({
          tournamentId,
          roundNumber,
          dateTime: "",
          field: "Por asignar",
          homeTeamId: homeId,
          awayTeamId: awayId,
          status: "PROGRAMADO",
        });
        generatedMatches.push(match);
      }

      rotating.unshift(rotating.pop()!);
    }

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

    await this.updateTournament(tournamentId, { scheduleGenerated: true } as any);

    return generatedMatches;
  }
}
