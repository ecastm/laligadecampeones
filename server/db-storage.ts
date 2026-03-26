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
  type MatchSubstitution, type InsertMatchSubstitution,
  type MatchEvidence, type InsertMatchEvidence,
  type MatchAttendance,
  type PlayerSuspension, type InsertPlayerSuspension,
  type Fine, type InsertFine,
  type TeamPayment, type InsertTeamPayment,
  type FinePayment, type InsertFinePayment,
  type Expense, type InsertExpense,
  type MarketingMedia, type InsertMarketingMedia,
  type ContactMessage, type InsertContactMessage,
  type SiteSettings, type InsertSiteSettings,
  type TournamentStage, type InsertTournamentStage,
} from "@shared/schema";
import { IStorage } from "./storage";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export class DatabaseStorage implements IStorage {
  constructor(private pool: Pool) {}

  async getClient() {
    return this.pool.connect();
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.pool.query(
      `SELECT id, name, email, password_hash AS "passwordHash", role, team_id AS "teamId", phone, status, created_at AS "createdAt" FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0] || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.pool.query(
      `SELECT id, name, email, password_hash AS "passwordHash", role, team_id AS "teamId", phone, status, created_at AS "createdAt" FROM users WHERE email = $1`,
      [email]
    );
    return result.rows[0] || undefined;
  }

  async getUsers(): Promise<Omit<User, 'passwordHash'>[]> {
    const result = await this.pool.query(
      `SELECT id, name, email, role, team_id AS "teamId", phone, status, created_at AS "createdAt" FROM users ORDER BY created_at DESC`
    );
    return result.rows;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const passwordHash = await bcrypt.hash(insertUser.password, 10);
    const result = await this.pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, team_id, phone, status, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'ACTIVO', NOW())
       RETURNING id, name, email, password_hash AS "passwordHash", role, team_id AS "teamId", phone, status, created_at AS "createdAt"`,
      [insertUser.name, insertUser.email, passwordHash, insertUser.role, insertUser.teamId || null, insertUser.phone || null]
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
    if ((data as any).phone !== undefined) {
      setClauses.push(`phone = $${paramIndex++}`);
      values.push((data as any).phone || null);
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
       RETURNING id, name, email, password_hash AS "passwordHash", role, team_id AS "teamId", phone, status, created_at AS "createdAt"`,
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

  // Tournament Stages
  async getStagesByTournament(tournamentId: string): Promise<TournamentStage[]> {
    const result = await this.pool.query(
      `SELECT id, tournament_id AS "tournamentId", name, sort_order AS "sortOrder", stage_type AS "stageType"
       FROM tournament_stages WHERE tournament_id = $1 ORDER BY sort_order ASC`,
      [tournamentId]
    );
    return result.rows;
  }

  async getStage(id: string): Promise<TournamentStage | undefined> {
    const result = await this.pool.query(
      `SELECT id, tournament_id AS "tournamentId", name, sort_order AS "sortOrder", stage_type AS "stageType"
       FROM tournament_stages WHERE id = $1`,
      [id]
    );
    return result.rows[0] || undefined;
  }

  async createStage(stage: InsertTournamentStage): Promise<TournamentStage> {
    const result = await this.pool.query(
      `INSERT INTO tournament_stages (id, tournament_id, name, sort_order, stage_type)
       VALUES (gen_random_uuid(), $1, $2, $3, $4)
       RETURNING id, tournament_id AS "tournamentId", name, sort_order AS "sortOrder", stage_type AS "stageType"`,
      [stage.tournamentId, stage.name, stage.sortOrder, stage.stageType || null]
    );
    return result.rows[0];
  }

  async updateStage(id: string, data: Partial<InsertTournamentStage>): Promise<TournamentStage | undefined> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    if (data.name !== undefined) { setClauses.push(`name = $${paramIndex++}`); values.push(data.name); }
    if (data.sortOrder !== undefined) { setClauses.push(`sort_order = $${paramIndex++}`); values.push(data.sortOrder); }
    if (data.stageType !== undefined) { setClauses.push(`stage_type = $${paramIndex++}`); values.push(data.stageType || null); }
    if (setClauses.length === 0) return this.getStage(id);
    values.push(id);
    const result = await this.pool.query(
      `UPDATE tournament_stages SET ${setClauses.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, tournament_id AS "tournamentId", name, sort_order AS "sortOrder", stage_type AS "stageType"`,
      values
    );
    return result.rows[0] || undefined;
  }

  async deleteStage(id: string): Promise<void> {
    await this.pool.query(`DELETE FROM tournament_stages WHERE id = $1`, [id]);
  }

  async getMatchCountByStage(stageId: string): Promise<number> {
    const result = await this.pool.query(
      `SELECT COUNT(*)::int AS count FROM matches WHERE stage_id = $1`,
      [stageId]
    );
    return result.rows[0]?.count || 0;
  }

  async getTeams(tournamentId?: string): Promise<Team[]> {
    if (tournamentId) {
      const result = await this.pool.query(
        `SELECT id, tournament_id AS "tournamentId", division_id AS "divisionId", name, colors, home_field AS "homeField", logo_url AS "logoUrl", captain_user_id AS "captainUserId", coach_name AS "coachName", instagram_url AS "instagramUrl" FROM teams WHERE tournament_id = $1`,
        [tournamentId]
      );
      return result.rows;
    }
    const result = await this.pool.query(
      `SELECT id, tournament_id AS "tournamentId", division_id AS "divisionId", name, colors, home_field AS "homeField", logo_url AS "logoUrl", captain_user_id AS "captainUserId", coach_name AS "coachName", instagram_url AS "instagramUrl" FROM teams`
    );
    return result.rows;
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const result = await this.pool.query(
      `SELECT id, tournament_id AS "tournamentId", division_id AS "divisionId", name, colors, home_field AS "homeField", logo_url AS "logoUrl", captain_user_id AS "captainUserId", coach_name AS "coachName", instagram_url AS "instagramUrl" FROM teams WHERE id = $1`,
      [id]
    );
    return result.rows[0] || undefined;
  }

  async getTeamByCaptain(userId: string): Promise<Team | undefined> {
    const result = await this.pool.query(
      `SELECT id, tournament_id AS "tournamentId", division_id AS "divisionId", name, colors, home_field AS "homeField", logo_url AS "logoUrl", captain_user_id AS "captainUserId", coach_name AS "coachName", instagram_url AS "instagramUrl" FROM teams WHERE captain_user_id = $1`,
      [userId]
    );
    return result.rows[0] || undefined;
  }

  async getTeamsByTournamentAndCaptain(tournamentId: string, userId: string): Promise<Team[]> {
    const result = await this.pool.query(
      `SELECT id, tournament_id AS "tournamentId", division_id AS "divisionId", name, colors, home_field AS "homeField", logo_url AS "logoUrl", captain_user_id AS "captainUserId", coach_name AS "coachName", instagram_url AS "instagramUrl" FROM teams WHERE tournament_id = $1 AND captain_user_id = $2`,
      [tournamentId, userId]
    );
    return result.rows;
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const result = await this.pool.query(
      `INSERT INTO teams (id, tournament_id, division_id, name, colors, home_field, logo_url, captain_user_id, coach_name, instagram_url)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, tournament_id AS "tournamentId", division_id AS "divisionId", name, colors, home_field AS "homeField", logo_url AS "logoUrl", captain_user_id AS "captainUserId", coach_name AS "coachName", instagram_url AS "instagramUrl"`,
      [insertTeam.tournamentId, insertTeam.divisionId || null, insertTeam.name, insertTeam.colors, insertTeam.homeField, insertTeam.logoUrl || null, insertTeam.captainUserId || null, insertTeam.coachName || null, insertTeam.instagramUrl || null]
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
    if (data.instagramUrl !== undefined) { setClauses.push(`instagram_url = $${paramIndex++}`); values.push(data.instagramUrl || null); }

    if (setClauses.length === 0) return this.getTeam(id);

    values.push(id);
    const result = await this.pool.query(
      `UPDATE teams SET ${setClauses.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, tournament_id AS "tournamentId", division_id AS "divisionId", name, colors, home_field AS "homeField", logo_url AS "logoUrl", captain_user_id AS "captainUserId", coach_name AS "coachName", instagram_url AS "instagramUrl"`,
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
        `SELECT id, team_id AS "teamId", first_name AS "firstName", last_name AS "lastName", jersey_number AS "jerseyNumber", position, identification_type AS "identificationType", identification_id AS "identificationId", photo_urls AS "photoUrls", is_federated AS "isFederated", federation_id AS "federationId", active FROM players WHERE team_id = $1`,
        [teamId]
      );
      return result.rows;
    }
    const result = await this.pool.query(
      `SELECT id, team_id AS "teamId", first_name AS "firstName", last_name AS "lastName", jersey_number AS "jerseyNumber", position, identification_type AS "identificationType", identification_id AS "identificationId", photo_urls AS "photoUrls", is_federated AS "isFederated", federation_id AS "federationId", active FROM players`
    );
    return result.rows;
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    const result = await this.pool.query(
      `SELECT id, team_id AS "teamId", first_name AS "firstName", last_name AS "lastName", jersey_number AS "jerseyNumber", position, identification_type AS "identificationType", identification_id AS "identificationId", photo_urls AS "photoUrls", is_federated AS "isFederated", federation_id AS "federationId", active FROM players WHERE id = $1`,
      [id]
    );
    return result.rows[0] || undefined;
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const result = await this.pool.query(
      `INSERT INTO players (id, team_id, first_name, last_name, jersey_number, position, identification_type, identification_id, photo_urls, is_federated, federation_id, active)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, team_id AS "teamId", first_name AS "firstName", last_name AS "lastName", jersey_number AS "jerseyNumber", position, identification_type AS "identificationType", identification_id AS "identificationId", photo_urls AS "photoUrls", is_federated AS "isFederated", federation_id AS "federationId", active`,
      [
        insertPlayer.teamId,
        insertPlayer.firstName,
        insertPlayer.lastName,
        insertPlayer.jerseyNumber,
        insertPlayer.position || null,
        insertPlayer.identificationType || "DNI",
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
    if (data.identificationType !== undefined) { setClauses.push(`identification_type = $${paramIndex++}`); values.push(data.identificationType); }
    if (data.identificationId !== undefined) { setClauses.push(`identification_id = $${paramIndex++}`); values.push(data.identificationId); }
    if (data.photoUrls !== undefined) { setClauses.push(`photo_urls = $${paramIndex++}`); values.push(data.photoUrls); }
    if (data.isFederated !== undefined) { setClauses.push(`is_federated = $${paramIndex++}`); values.push(data.isFederated); }
    if (data.federationId !== undefined) { setClauses.push(`federation_id = $${paramIndex++}`); values.push(data.federationId); }
    if (data.active !== undefined) { setClauses.push(`active = $${paramIndex++}`); values.push(data.active); }

    if (setClauses.length === 0) return this.getPlayer(id);

    values.push(id);
    const result = await this.pool.query(
      `UPDATE players SET ${setClauses.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, team_id AS "teamId", first_name AS "firstName", last_name AS "lastName", jersey_number AS "jerseyNumber", position, identification_type AS "identificationType", identification_id AS "identificationId", photo_urls AS "photoUrls", is_federated AS "isFederated", federation_id AS "federationId", active`,
      values
    );
    return result.rows[0] || undefined;
  }

  async deletePlayer(id: string): Promise<void> {
    await this.pool.query(`DELETE FROM players WHERE id = $1`, [id]);
  }

  async getMatches(tournamentId?: string): Promise<Match[]> {
    const cols = `id, tournament_id AS "tournamentId", round_number AS "roundNumber", date_time AS "dateTime", field, home_team_id AS "homeTeamId", away_team_id AS "awayTeamId", referee_user_id AS "refereeUserId", status, home_score AS "homeScore", away_score AS "awayScore", vs_image_url AS "vsImageUrl", stage, stage_id AS "stageId", referee_notes AS "refereeNotes"`;
    if (tournamentId) {
      const result = await this.pool.query(`SELECT ${cols} FROM matches WHERE tournament_id = $1`, [tournamentId]);
      return result.rows;
    }
    const result = await this.pool.query(`SELECT ${cols} FROM matches`);
    return result.rows;
  }

  async getMatch(id: string): Promise<Match | undefined> {
    const result = await this.pool.query(
      `SELECT id, tournament_id AS "tournamentId", round_number AS "roundNumber", date_time AS "dateTime", field, home_team_id AS "homeTeamId", away_team_id AS "awayTeamId", referee_user_id AS "refereeUserId", status, home_score AS "homeScore", away_score AS "awayScore", vs_image_url AS "vsImageUrl", stage, stage_id AS "stageId", referee_notes AS "refereeNotes" FROM matches WHERE id = $1`,
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

  async getAllMatchesWithTeams(tournamentId: string): Promise<MatchWithTeams[]> {
    const result = await this.pool.query(`
      SELECT
        m.id, m.tournament_id AS "tournamentId", m.round_number AS "roundNumber",
        m.date_time AS "dateTime", m.field, m.home_team_id AS "homeTeamId",
        m.away_team_id AS "awayTeamId", m.referee_user_id AS "refereeUserId",
        m.status, m.home_score AS "homeScore", m.away_score AS "awayScore",
        m.vs_image_url AS "vsImageUrl", m.stage, m.stage_id AS "stageId",
        m.referee_notes AS "refereeNotes",
        json_build_object(
          'id', ht.id, 'tournamentId', ht.tournament_id, 'divisionId', ht.division_id,
          'name', ht.name, 'colors', ht.colors, 'homeField', ht.home_field,
          'logoUrl', ht.logo_url, 'captainUserId', ht.captain_user_id,
          'coachName', ht.coach_name, 'instagramUrl', ht.instagram_url
        ) AS "homeTeam",
        json_build_object(
          'id', at2.id, 'tournamentId', at2.tournament_id, 'divisionId', at2.division_id,
          'name', at2.name, 'colors', at2.colors, 'homeField', at2.home_field,
          'logoUrl', at2.logo_url, 'captainUserId', at2.captain_user_id,
          'coachName', at2.coach_name, 'instagramUrl', at2.instagram_url
        ) AS "awayTeam"
      FROM matches m
      LEFT JOIN teams ht ON m.home_team_id = ht.id
      LEFT JOIN teams at2 ON m.away_team_id = at2.id
      WHERE m.tournament_id = $1
      ORDER BY m.date_time ASC NULLS LAST
    `, [tournamentId]);

    const matchIds = result.rows.map(r => r.id);
    let eventsMap: Record<string, MatchEventWithPlayer[]> = {};
    if (matchIds.length > 0) {
      const eventsResult = await this.pool.query(`
        SELECT
          me.id, me.match_id AS "matchId", me.type, me.minute,
          me.team_id AS "teamId", me.player_id AS "playerId",
          me.related_player_id AS "relatedPlayerId", me.notes,
          p.id AS "p_id", p.team_id AS "p_teamId", p.first_name AS "p_firstName",
          p.last_name AS "p_lastName", p.jersey_number AS "p_jerseyNumber",
          p.position AS "p_position", p.identification_id AS "p_identificationId",
          p.photo_urls AS "p_photoUrls", p.is_federated AS "p_isFederated",
          p.federation_id AS "p_federationId", p.active AS "p_active",
          t.id AS "t_id", t.tournament_id AS "t_tournamentId", t.division_id AS "t_divisionId",
          t.name AS "t_name", t.colors AS "t_colors", t.home_field AS "t_homeField",
          t.logo_url AS "t_logoUrl", t.captain_user_id AS "t_captainUserId",
          t.coach_name AS "t_coachName"
        FROM match_events me
        LEFT JOIN players p ON me.player_id = p.id
        LEFT JOIN teams t ON me.team_id = t.id
        WHERE me.match_id = ANY($1)
        ORDER BY me.minute ASC
      `, [matchIds]);
      for (const row of eventsResult.rows) {
        if (!row.p_id || !row.t_id) continue;
        if (!eventsMap[row.matchId]) eventsMap[row.matchId] = [];
        eventsMap[row.matchId].push({
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
          } as any,
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
          } as any,
        });
      }
    }

    return result.rows.map(row => ({
      ...row,
      homeTeam: row.homeTeam?.id ? row.homeTeam : null,
      awayTeam: row.awayTeam?.id ? row.awayTeam : null,
      events: eventsMap[row.id] || [],
    }));
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
      `INSERT INTO matches (id, tournament_id, round_number, date_time, field, home_team_id, away_team_id, referee_user_id, status, home_score, away_score, vs_image_url, stage, stage_id, referee_notes)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id, tournament_id AS "tournamentId", round_number AS "roundNumber", date_time AS "dateTime", field, home_team_id AS "homeTeamId", away_team_id AS "awayTeamId", referee_user_id AS "refereeUserId", status, home_score AS "homeScore", away_score AS "awayScore", vs_image_url AS "vsImageUrl", stage, stage_id AS "stageId", referee_notes AS "refereeNotes"`,
      [
        insertMatch.tournamentId,
        insertMatch.roundNumber,
        insertMatch.dateTime,
        insertMatch.field,
        insertMatch.homeTeamId || null,
        insertMatch.awayTeamId || null,
        insertMatch.refereeUserId || null,
        insertMatch.status || "PROGRAMADO",
        insertMatch.homeScore ?? null,
        insertMatch.awayScore ?? null,
        insertMatch.vsImageUrl || null,
        insertMatch.stage || null,
        insertMatch.stageId || null,
        insertMatch.refereeNotes || null,
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
    if (data.homeTeamId !== undefined) { setClauses.push(`home_team_id = $${paramIndex++}`); values.push(data.homeTeamId || null); }
    if (data.awayTeamId !== undefined) { setClauses.push(`away_team_id = $${paramIndex++}`); values.push(data.awayTeamId || null); }
    if (data.refereeUserId !== undefined) { setClauses.push(`referee_user_id = $${paramIndex++}`); values.push(data.refereeUserId || null); }
    if (data.status !== undefined) { setClauses.push(`status = $${paramIndex++}`); values.push(data.status); }
    if (data.homeScore !== undefined) { setClauses.push(`home_score = $${paramIndex++}`); values.push(data.homeScore); }
    if (data.awayScore !== undefined) { setClauses.push(`away_score = $${paramIndex++}`); values.push(data.awayScore); }
    if (data.vsImageUrl !== undefined) { setClauses.push(`vs_image_url = $${paramIndex++}`); values.push(data.vsImageUrl || null); }
    if (data.stage !== undefined) { setClauses.push(`stage = $${paramIndex++}`); values.push(data.stage || null); }
    if (data.stageId !== undefined) { setClauses.push(`stage_id = $${paramIndex++}`); values.push(data.stageId || null); }
    if (data.refereeNotes !== undefined) { setClauses.push(`referee_notes = $${paramIndex++}`); values.push(data.refereeNotes || null); }

    if (setClauses.length === 0) return this.getMatch(id);

    values.push(id);
    const result = await this.pool.query(
      `UPDATE matches SET ${setClauses.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, tournament_id AS "tournamentId", round_number AS "roundNumber", date_time AS "dateTime", field, home_team_id AS "homeTeamId", away_team_id AS "awayTeamId", referee_user_id AS "refereeUserId", status, home_score AS "homeScore", away_score AS "awayScore", vs_image_url AS "vsImageUrl", stage, stage_id AS "stageId", referee_notes AS "refereeNotes"`,
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
      `SELECT id, user_id AS "userId", full_name AS "fullName", identification_type AS "identificationType", identification_number AS "identificationNumber", phone, email, association, years_of_experience AS "yearsOfExperience", observations, status, created_at AS "createdAt", updated_at AS "updatedAt" FROM referee_profiles`
    );
    return result.rows;
  }

  async getRefereeProfile(userId: string): Promise<RefereeProfile | undefined> {
    const result = await this.pool.query(
      `SELECT id, user_id AS "userId", full_name AS "fullName", identification_type AS "identificationType", identification_number AS "identificationNumber", phone, email, association, years_of_experience AS "yearsOfExperience", observations, status, created_at AS "createdAt", updated_at AS "updatedAt" FROM referee_profiles WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0] || undefined;
  }

  async getRefereeProfileById(id: string): Promise<RefereeProfile | undefined> {
    const result = await this.pool.query(
      `SELECT id, user_id AS "userId", full_name AS "fullName", identification_type AS "identificationType", identification_number AS "identificationNumber", phone, email, association, years_of_experience AS "yearsOfExperience", observations, status, created_at AS "createdAt", updated_at AS "updatedAt" FROM referee_profiles WHERE id = $1`,
      [id]
    );
    return result.rows[0] || undefined;
  }

  async createRefereeProfile(userId: string, profile: InsertRefereeProfile): Promise<RefereeProfile> {
    const result = await this.pool.query(
      `INSERT INTO referee_profiles (id, user_id, full_name, identification_type, identification_number, phone, email, association, years_of_experience, observations, status, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       RETURNING id, user_id AS "userId", full_name AS "fullName", identification_type AS "identificationType", identification_number AS "identificationNumber", phone, email, association, years_of_experience AS "yearsOfExperience", observations, status, created_at AS "createdAt", updated_at AS "updatedAt"`,
      [userId, profile.fullName, profile.identificationType || "DNI", profile.identificationNumber, profile.phone, profile.email, profile.association || null, profile.yearsOfExperience ?? null, profile.observations || null, profile.status || "ACTIVO"]
    );
    return result.rows[0];
  }

  async updateRefereeProfile(userId: string, data: Partial<InsertRefereeProfile>): Promise<RefereeProfile | undefined> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.fullName !== undefined) { setClauses.push(`full_name = $${paramIndex++}`); values.push(data.fullName); }
    if (data.identificationType !== undefined) { setClauses.push(`identification_type = $${paramIndex++}`); values.push(data.identificationType); }
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
       RETURNING id, user_id AS "userId", full_name AS "fullName", identification_type AS "identificationType", identification_number AS "identificationNumber", phone, email, association, years_of_experience AS "yearsOfExperience", observations, status, created_at AS "createdAt", updated_at AS "updatedAt"`,
      values
    );
    return result.rows[0] || undefined;
  }

  async updateRefereeProfileById(id: string, data: Partial<InsertRefereeProfile>): Promise<RefereeProfile | undefined> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.fullName !== undefined) { setClauses.push(`full_name = $${paramIndex++}`); values.push(data.fullName); }
    if (data.identificationType !== undefined) { setClauses.push(`identification_type = $${paramIndex++}`); values.push(data.identificationType); }
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
       RETURNING id, user_id AS "userId", full_name AS "fullName", identification_type AS "identificationType", identification_number AS "identificationNumber", phone, email, association, years_of_experience AS "yearsOfExperience", observations, status, created_at AS "createdAt", updated_at AS "updatedAt"`,
      values
    );
    return result.rows[0] || undefined;
  }

  async deleteRefereeProfile(id: string): Promise<void> {
    await this.pool.query(`DELETE FROM referee_profiles WHERE id = $1`, [id]);
  }

  async getCaptainProfiles(): Promise<CaptainProfile[]> {
    const result = await this.pool.query(
      `SELECT id, user_id AS "userId", full_name AS "fullName", identification_type AS "identificationType", identification_number AS "identificationNumber", phone, email, address, emergency_contact AS "emergencyContact", emergency_phone AS "emergencyPhone", observations, created_at AS "createdAt", updated_at AS "updatedAt" FROM captain_profiles`
    );
    return result.rows;
  }

  async getCaptainProfile(userId: string): Promise<CaptainProfile | undefined> {
    const result = await this.pool.query(
      `SELECT id, user_id AS "userId", full_name AS "fullName", identification_type AS "identificationType", identification_number AS "identificationNumber", phone, email, address, emergency_contact AS "emergencyContact", emergency_phone AS "emergencyPhone", observations, created_at AS "createdAt", updated_at AS "updatedAt" FROM captain_profiles WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0] || undefined;
  }

  async getCaptainProfileById(id: string): Promise<CaptainProfile | undefined> {
    const result = await this.pool.query(
      `SELECT id, user_id AS "userId", full_name AS "fullName", identification_type AS "identificationType", identification_number AS "identificationNumber", phone, email, address, emergency_contact AS "emergencyContact", emergency_phone AS "emergencyPhone", observations, created_at AS "createdAt", updated_at AS "updatedAt" FROM captain_profiles WHERE id = $1`,
      [id]
    );
    return result.rows[0] || undefined;
  }

  async createCaptainProfile(userId: string, profile: InsertCaptainProfile): Promise<CaptainProfile> {
    const result = await this.pool.query(
      `INSERT INTO captain_profiles (id, user_id, full_name, identification_type, identification_number, phone, email, address, emergency_contact, emergency_phone, observations, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       RETURNING id, user_id AS "userId", full_name AS "fullName", identification_type AS "identificationType", identification_number AS "identificationNumber", phone, email, address, emergency_contact AS "emergencyContact", emergency_phone AS "emergencyPhone", observations, created_at AS "createdAt", updated_at AS "updatedAt"`,
      [userId, profile.fullName, profile.identificationType || "DNI", profile.identificationNumber, profile.phone, profile.email, profile.address || null, profile.emergencyContact || null, profile.emergencyPhone || null, profile.observations || null]
    );
    return result.rows[0];
  }

  async updateCaptainProfile(userId: string, data: Partial<InsertCaptainProfile>): Promise<CaptainProfile | undefined> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.fullName !== undefined) { setClauses.push(`full_name = $${paramIndex++}`); values.push(data.fullName); }
    if (data.identificationType !== undefined) { setClauses.push(`identification_type = $${paramIndex++}`); values.push(data.identificationType); }
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
       RETURNING id, user_id AS "userId", full_name AS "fullName", identification_type AS "identificationType", identification_number AS "identificationNumber", phone, email, address, emergency_contact AS "emergencyContact", emergency_phone AS "emergencyPhone", observations, created_at AS "createdAt", updated_at AS "updatedAt"`,
      values
    );
    return result.rows[0] || undefined;
  }

  async updateCaptainProfileById(id: string, data: Partial<InsertCaptainProfile>): Promise<CaptainProfile | undefined> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.fullName !== undefined) { setClauses.push(`full_name = $${paramIndex++}`); values.push(data.fullName); }
    if (data.identificationType !== undefined) { setClauses.push(`identification_type = $${paramIndex++}`); values.push(data.identificationType); }
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
       RETURNING id, user_id AS "userId", full_name AS "fullName", identification_type AS "identificationType", identification_number AS "identificationNumber", phone, email, address, emergency_contact AS "emergencyContact", emergency_phone AS "emergencyPhone", observations, created_at AS "createdAt", updated_at AS "updatedAt"`,
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

  async getMatchSubstitutions(matchId: string): Promise<MatchSubstitution[]> {
    const result = await this.pool.query(
      `SELECT id, match_id AS "matchId", team_id AS "teamId", player_out_id AS "playerOutId", player_in_id AS "playerInId", minute, reason, created_at AS "createdAt" FROM match_substitutions WHERE match_id = $1 ORDER BY minute ASC, created_at ASC`,
      [matchId]
    );
    return result.rows;
  }

  async createMatchSubstitution(data: InsertMatchSubstitution): Promise<MatchSubstitution> {
    const result = await this.pool.query(
      `INSERT INTO match_substitutions (id, match_id, team_id, player_out_id, player_in_id, minute, reason, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, match_id AS "matchId", team_id AS "teamId", player_out_id AS "playerOutId", player_in_id AS "playerInId", minute, reason, created_at AS "createdAt"`,
      [data.matchId, data.teamId, data.playerOutId, data.playerInId, data.minute, data.reason || null]
    );
    return result.rows[0];
  }

  async deleteMatchSubstitution(id: string): Promise<void> {
    await this.pool.query(`DELETE FROM match_substitutions WHERE id = $1`, [id]);
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

  async getMatchAttendance(matchId: string, teamId?: string): Promise<MatchAttendance[]> {
    let query = `SELECT id, match_id AS "matchId", team_id AS "teamId", player_id AS "playerId", present, created_at AS "createdAt" FROM match_attendance WHERE match_id = $1`;
    const values: any[] = [matchId];
    if (teamId) {
      query += ` AND team_id = $2`;
      values.push(teamId);
    }
    query += ` ORDER BY created_at ASC`;
    const result = await this.pool.query(query, values);
    return result.rows;
  }

  async saveMatchAttendance(matchId: string, teamId: string, attendance: { playerId: string; present: boolean }[]): Promise<MatchAttendance[]> {
    await this.pool.query(`DELETE FROM match_attendance WHERE match_id = $1 AND team_id = $2`, [matchId, teamId]);
    const results: MatchAttendance[] = [];
    for (const entry of attendance) {
      const result = await this.pool.query(
        `INSERT INTO match_attendance (id, match_id, team_id, player_id, present, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())
         RETURNING id, match_id AS "matchId", team_id AS "teamId", player_id AS "playerId", present, created_at AS "createdAt"`,
        [matchId, teamId, entry.playerId, entry.present]
      );
      results.push(result.rows[0]);
    }
    return results;
  }

  async deleteMatchAttendance(matchId: string, teamId: string): Promise<void> {
    await this.pool.query(`DELETE FROM match_attendance WHERE match_id = $1 AND team_id = $2`, [matchId, teamId]);
  }

  // Player Suspensions
  async getPlayerSuspensions(tournamentId: string, teamId?: string, status?: string): Promise<PlayerSuspension[]> {
    let query = `SELECT id, tournament_id AS "tournamentId", player_id AS "playerId", team_id AS "teamId", match_id AS "matchId", match_event_id AS "matchEventId", reason, matches_remaining AS "matchesRemaining", status, created_at AS "createdAt" FROM player_suspensions WHERE tournament_id = $1`;
    const values: any[] = [tournamentId];
    let paramIndex = 2;
    if (teamId) { query += ` AND team_id = $${paramIndex++}`; values.push(teamId); }
    if (status) { query += ` AND status = $${paramIndex++}`; values.push(status); }
    query += ` ORDER BY created_at DESC`;
    const result = await this.pool.query(query, values);
    return result.rows;
  }

  async createPlayerSuspension(suspension: InsertPlayerSuspension): Promise<PlayerSuspension> {
    const result = await this.pool.query(
      `INSERT INTO player_suspensions (tournament_id, player_id, team_id, match_id, match_event_id, reason, matches_remaining, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, tournament_id AS "tournamentId", player_id AS "playerId", team_id AS "teamId", match_id AS "matchId", match_event_id AS "matchEventId", reason, matches_remaining AS "matchesRemaining", status, created_at AS "createdAt"`,
      [suspension.tournamentId, suspension.playerId, suspension.teamId, suspension.matchId, suspension.matchEventId || null, suspension.reason, suspension.matchesRemaining || 1, suspension.status || "ACTIVO"]
    );
    return result.rows[0];
  }

  async updatePlayerSuspension(id: string, data: Partial<PlayerSuspension>): Promise<PlayerSuspension | undefined> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    if (data.matchesRemaining !== undefined) { setClauses.push(`matches_remaining = $${paramIndex++}`); values.push(data.matchesRemaining); }
    if (data.status !== undefined) { setClauses.push(`status = $${paramIndex++}`); values.push(data.status); }
    if (setClauses.length === 0) return undefined;
    values.push(id);
    const result = await this.pool.query(
      `UPDATE player_suspensions SET ${setClauses.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, tournament_id AS "tournamentId", player_id AS "playerId", team_id AS "teamId", match_id AS "matchId", match_event_id AS "matchEventId", reason, matches_remaining AS "matchesRemaining", status, created_at AS "createdAt"`,
      values
    );
    return result.rows[0] || undefined;
  }

  async decrementSuspensions(tournamentId: string, teamId: string): Promise<void> {
    await this.pool.query(
      `UPDATE player_suspensions
       SET matches_remaining = GREATEST(matches_remaining - 1, 0),
           status = CASE WHEN matches_remaining - 1 <= 0 THEN 'CUMPLIDO' ELSE status END
       WHERE tournament_id = $1 AND team_id = $2 AND status = 'ACTIVO'`,
      [tournamentId, teamId]
    );
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
    let query = `SELECT id, tournament_id AS "tournamentId", team_id AS "teamId", fine_id AS "fineId", amount, notes, paid_at AS "paidAt", created_at AS "createdAt" FROM fine_payments WHERE 1=1`;
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
      `INSERT INTO fine_payments (id, tournament_id, team_id, fine_id, amount, notes, paid_at, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, tournament_id AS "tournamentId", team_id AS "teamId", fine_id AS "fineId", amount, notes, paid_at AS "paidAt", created_at AS "createdAt"`,
      [payment.tournamentId, payment.teamId, payment.fineId || null, payment.amount, payment.notes || null, payment.paidAt]
    );
    return result.rows[0];
  }

  async deleteFinePaymentByFineId(fineId: string): Promise<void> {
    await this.pool.query(`DELETE FROM fine_payments WHERE fine_id = $1`, [fineId]);
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

  async getSiteSettings(): Promise<SiteSettings | null> {
    const result = await this.pool.query(
      `SELECT id, league_name AS "leagueName", logo_url AS "logoUrl", phone, email, address, instagram_url AS "instagramUrl", facebook_url AS "facebookUrl", whatsapp_number AS "whatsappNumber", updated_at AS "updatedAt"
       FROM site_settings LIMIT 1`
    );
    return result.rows[0] || null;
  }

  async updateSiteSettings(data: InsertSiteSettings): Promise<SiteSettings> {
    const existing = await this.getSiteSettings();
    if (existing) {
      const setClauses: string[] = [];
      const values: any[] = [];
      let i = 1;
      if (data.leagueName !== undefined) { setClauses.push(`league_name = $${i++}`); values.push(data.leagueName); }
      if (data.logoUrl !== undefined) { setClauses.push(`logo_url = $${i++}`); values.push(data.logoUrl); }
      if (data.phone !== undefined) { setClauses.push(`phone = $${i++}`); values.push(data.phone); }
      if (data.email !== undefined) { setClauses.push(`email = $${i++}`); values.push(data.email); }
      if (data.address !== undefined) { setClauses.push(`address = $${i++}`); values.push(data.address); }
      if (data.instagramUrl !== undefined) { setClauses.push(`instagram_url = $${i++}`); values.push(data.instagramUrl); }
      if (data.facebookUrl !== undefined) { setClauses.push(`facebook_url = $${i++}`); values.push(data.facebookUrl); }
      if (data.whatsappNumber !== undefined) { setClauses.push(`whatsapp_number = $${i++}`); values.push(data.whatsappNumber); }
      setClauses.push(`updated_at = $${i++}`); values.push(new Date().toISOString());
      values.push(existing.id);
      const result = await this.pool.query(
        `UPDATE site_settings SET ${setClauses.join(', ')} WHERE id = $${i}
         RETURNING id, league_name AS "leagueName", logo_url AS "logoUrl", phone, email, address, instagram_url AS "instagramUrl", facebook_url AS "facebookUrl", whatsapp_number AS "whatsappNumber", updated_at AS "updatedAt"`,
        values
      );
      return result.rows[0];
    } else {
      const result = await this.pool.query(
        `INSERT INTO site_settings (id, league_name, logo_url, phone, email, address, instagram_url, facebook_url, whatsapp_number, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, league_name AS "leagueName", logo_url AS "logoUrl", phone, email, address, instagram_url AS "instagramUrl", facebook_url AS "facebookUrl", whatsapp_number AS "whatsappNumber", updated_at AS "updatedAt"`,
        [
          data.leagueName || "La Liga de Campeones",
          data.logoUrl || null,
          data.phone || null,
          data.email || null,
          data.address || null,
          data.instagramUrl || null,
          data.facebookUrl || null,
          data.whatsappNumber || null,
          new Date().toISOString(),
        ]
      );
      return result.rows[0];
    }
  }

  async getCompetitionRules(categoryId: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT id, category_id AS "categoryId", format_type AS "formatType", points_win AS "pointsWin", points_draw AS "pointsDraw", points_loss AS "pointsLoss", round_robin AS "roundRobin", teams_per_division AS "teamsPerDivision", promotion_count AS "promotionCount", relegation_count AS "relegationCount", federated_limit AS "federatedLimit", plus30_rules AS "plus30Rules", rules_version AS "rulesVersion", is_active AS "isActive", created_at AS "createdAt", updated_at AS "updatedAt" FROM competition_rules WHERE category_id = $1 AND is_active = true ORDER BY rules_version DESC LIMIT 1`,
      [categoryId]
    );
    return result.rows[0];
  }

  async getCompetitionRuleById(id: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT id, category_id AS "categoryId", format_type AS "formatType", points_win AS "pointsWin", points_draw AS "pointsDraw", points_loss AS "pointsLoss", round_robin AS "roundRobin", teams_per_division AS "teamsPerDivision", promotion_count AS "promotionCount", relegation_count AS "relegationCount", federated_limit AS "federatedLimit", plus30_rules AS "plus30Rules", rules_version AS "rulesVersion", is_active AS "isActive", created_at AS "createdAt", updated_at AS "updatedAt" FROM competition_rules WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  async getAllCompetitionRules(): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT id, category_id AS "categoryId", format_type AS "formatType", points_win AS "pointsWin", points_draw AS "pointsDraw", points_loss AS "pointsLoss", round_robin AS "roundRobin", teams_per_division AS "teamsPerDivision", promotion_count AS "promotionCount", relegation_count AS "relegationCount", federated_limit AS "federatedLimit", plus30_rules AS "plus30Rules", rules_version AS "rulesVersion", is_active AS "isActive", created_at AS "createdAt", updated_at AS "updatedAt" FROM competition_rules WHERE is_active = true ORDER BY category_id, rules_version DESC`
    );
    return result.rows;
  }

  async createCompetitionRule(rule: any): Promise<any> {
    await this.pool.query(
      `UPDATE competition_rules SET is_active = false WHERE category_id = $1`,
      [rule.categoryId]
    );
    const result = await this.pool.query(
      `INSERT INTO competition_rules (id, category_id, format_type, points_win, points_draw, points_loss, round_robin, teams_per_division, promotion_count, relegation_count, federated_limit, plus30_rules, rules_version, is_active, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, COALESCE((SELECT MAX(rules_version) FROM competition_rules WHERE category_id = $1), 0) + 1, true, now(), now())
       RETURNING id, category_id AS "categoryId", format_type AS "formatType", points_win AS "pointsWin", points_draw AS "pointsDraw", points_loss AS "pointsLoss", round_robin AS "roundRobin", teams_per_division AS "teamsPerDivision", promotion_count AS "promotionCount", relegation_count AS "relegationCount", federated_limit AS "federatedLimit", plus30_rules AS "plus30Rules", rules_version AS "rulesVersion", is_active AS "isActive", created_at AS "createdAt", updated_at AS "updatedAt"`,
      [rule.categoryId, rule.formatType, rule.pointsWin ?? 3, rule.pointsDraw ?? 1, rule.pointsLoss ?? 0, rule.roundRobin ?? 'double', rule.teamsPerDivision ?? 10, rule.promotionCount ?? null, rule.relegationCount ?? null, rule.federatedLimit ?? 3, rule.plus30Rules ? JSON.stringify(rule.plus30Rules) : null]
    );
    return result.rows[0];
  }

  async updateCompetitionRule(id: string, data: any): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    if (data.formatType !== undefined) { fields.push(`format_type = $${idx++}`); values.push(data.formatType); }
    if (data.pointsWin !== undefined) { fields.push(`points_win = $${idx++}`); values.push(data.pointsWin); }
    if (data.pointsDraw !== undefined) { fields.push(`points_draw = $${idx++}`); values.push(data.pointsDraw); }
    if (data.pointsLoss !== undefined) { fields.push(`points_loss = $${idx++}`); values.push(data.pointsLoss); }
    if (data.roundRobin !== undefined) { fields.push(`round_robin = $${idx++}`); values.push(data.roundRobin); }
    if (data.teamsPerDivision !== undefined) { fields.push(`teams_per_division = $${idx++}`); values.push(data.teamsPerDivision); }
    if (data.promotionCount !== undefined) { fields.push(`promotion_count = $${idx++}`); values.push(data.promotionCount); }
    if (data.relegationCount !== undefined) { fields.push(`relegation_count = $${idx++}`); values.push(data.relegationCount); }
    if (data.federatedLimit !== undefined) { fields.push(`federated_limit = $${idx++}`); values.push(data.federatedLimit); }
    if (data.plus30Rules !== undefined) { fields.push(`plus30_rules = $${idx++}`); values.push(JSON.stringify(data.plus30Rules)); }
    fields.push(`updated_at = $${idx++}`); values.push(new Date().toISOString());
    values.push(id);
    const result = await this.pool.query(
      `UPDATE competition_rules SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING id, category_id AS "categoryId", format_type AS "formatType", points_win AS "pointsWin", points_draw AS "pointsDraw", points_loss AS "pointsLoss", round_robin AS "roundRobin", teams_per_division AS "teamsPerDivision", promotion_count AS "promotionCount", relegation_count AS "relegationCount", federated_limit AS "federatedLimit", plus30_rules AS "plus30Rules", rules_version AS "rulesVersion", is_active AS "isActive", created_at AS "createdAt", updated_at AS "updatedAt"`,
      values
    );
    return result.rows[0];
  }

  async getCompetitionSeasons(categoryId?: string): Promise<any[]> {
    let query = `SELECT id, category_id AS "categoryId", tournament_id AS "tournamentId", rules_id AS "rulesId", rules_version AS "rulesVersion", name, status, created_at AS "createdAt", updated_at AS "updatedAt" FROM competition_seasons`;
    const params: any[] = [];
    if (categoryId) {
      query += ` WHERE category_id = $1`;
      params.push(categoryId);
    }
    query += ` ORDER BY created_at DESC`;
    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getCompetitionSeason(id: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT id, category_id AS "categoryId", tournament_id AS "tournamentId", rules_id AS "rulesId", rules_version AS "rulesVersion", name, status, created_at AS "createdAt", updated_at AS "updatedAt" FROM competition_seasons WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  async createCompetitionSeason(season: any): Promise<any> {
    const rules = await this.getCompetitionRules(season.categoryId);
    if (!rules) throw new Error("No hay reglas configuradas para esta categoría");
    const result = await this.pool.query(
      `INSERT INTO competition_seasons (id, category_id, tournament_id, rules_id, rules_version, name, status, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'draft', now(), now())
       RETURNING id, category_id AS "categoryId", tournament_id AS "tournamentId", rules_id AS "rulesId", rules_version AS "rulesVersion", name, status, created_at AS "createdAt", updated_at AS "updatedAt"`,
      [season.categoryId, season.tournamentId || null, rules.id, rules.rulesVersion, season.name]
    );
    return result.rows[0];
  }

  async updateCompetitionSeasonStatus(id: string, status: string): Promise<any> {
    const result = await this.pool.query(
      `UPDATE competition_seasons SET status = $1, updated_at = now() WHERE id = $2
       RETURNING id, category_id AS "categoryId", tournament_id AS "tournamentId", rules_id AS "rulesId", rules_version AS "rulesVersion", name, status, created_at AS "createdAt", updated_at AS "updatedAt"`,
      [status, id]
    );
    return result.rows[0];
  }

  async getStandingsEntries(seasonId: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT se.id, se.season_id AS "seasonId", se.tournament_id AS "tournamentId", se.team_id AS "teamId", se.division, se.played, se.won, se.drawn, se.lost, se.goals_for AS "goalsFor", se.goals_against AS "goalsAgainst", se.goal_difference AS "goalDifference", se.points, se.position, se.updated_at AS "updatedAt", t.name AS "teamName"
       FROM standings_entries se LEFT JOIN teams t ON se.team_id = t.id WHERE se.season_id = $1 ORDER BY se.position ASC`,
      [seasonId]
    );
    return result.rows;
  }

  async upsertStandingsEntries(entries: any[]): Promise<void> {
    for (const e of entries) {
      await this.pool.query(
        `INSERT INTO standings_entries (id, season_id, tournament_id, team_id, division, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, position, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, now())
         ON CONFLICT (id) DO UPDATE SET played = $5, won = $6, drawn = $7, lost = $8, goals_for = $9, goals_against = $10, goal_difference = $11, points = $12, position = $13, updated_at = now()`,
        [e.seasonId, e.tournamentId, e.teamId, e.division || null, e.played, e.won, e.drawn, e.lost, e.goalsFor, e.goalsAgainst, e.goalDifference, e.points, e.position]
      );
    }
  }

  async deleteStandingsEntries(seasonId: string): Promise<void> {
    await this.pool.query(`DELETE FROM standings_entries WHERE season_id = $1`, [seasonId]);
  }

  async getDivisionMovements(seasonId: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT id, season_id AS "seasonId", team_id AS "teamId", team_name AS "teamName", from_division AS "fromDivision", to_division AS "toDivision", movement_type AS "movementType", created_at AS "createdAt" FROM division_movements WHERE season_id = $1 ORDER BY movement_type, created_at`,
      [seasonId]
    );
    return result.rows;
  }

  async createDivisionMovements(movements: any[]): Promise<any[]> {
    const results: any[] = [];
    for (const m of movements) {
      const result = await this.pool.query(
        `INSERT INTO division_movements (id, season_id, team_id, team_name, from_division, to_division, movement_type, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, now())
         RETURNING id, season_id AS "seasonId", team_id AS "teamId", team_name AS "teamName", from_division AS "fromDivision", to_division AS "toDivision", movement_type AS "movementType", created_at AS "createdAt"`,
        [m.seasonId, m.teamId, m.teamName, m.fromDivision, m.toDivision, m.movementType]
      );
      results.push(result.rows[0]);
    }
    return results;
  }

  async getBracketMatches(seasonId: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT bm.id, bm.season_id AS "seasonId", bm.tournament_id AS "tournamentId", bm.phase, bm.match_order AS "matchOrder", bm.home_team_id AS "homeTeamId", bm.away_team_id AS "awayTeamId", bm.home_score AS "homeScore", bm.away_score AS "awayScore", bm.winner_id AS "winnerId", bm.status, bm.match_id AS "matchId", bm.seed, bm.created_at AS "createdAt",
       ht.name AS "homeTeamName", at2.name AS "awayTeamName"
       FROM bracket_matches bm LEFT JOIN teams ht ON bm.home_team_id = ht.id LEFT JOIN teams at2 ON bm.away_team_id = at2.id
       WHERE bm.season_id = $1 ORDER BY CASE bm.phase WHEN 'REPECHAJE' THEN 1 WHEN 'CUARTOS' THEN 2 WHEN 'SEMIFINAL' THEN 3 WHEN 'FINAL' THEN 4 END, bm.match_order`,
      [seasonId]
    );
    return result.rows;
  }

  async createBracketMatch(match: any): Promise<any> {
    const result = await this.pool.query(
      `INSERT INTO bracket_matches (id, season_id, tournament_id, phase, match_order, home_team_id, away_team_id, status, seed, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, now())
       RETURNING id, season_id AS "seasonId", tournament_id AS "tournamentId", phase, match_order AS "matchOrder", home_team_id AS "homeTeamId", away_team_id AS "awayTeamId", home_score AS "homeScore", away_score AS "awayScore", winner_id AS "winnerId", status, match_id AS "matchId", seed, created_at AS "createdAt"`,
      [match.seasonId, match.tournamentId, match.phase, match.matchOrder, match.homeTeamId || null, match.awayTeamId || null, match.status || 'PENDIENTE', match.seed || null]
    );
    return result.rows[0];
  }

  async updateBracketMatch(id: string, data: any): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    if (data.homeTeamId !== undefined) { fields.push(`home_team_id = $${idx++}`); values.push(data.homeTeamId); }
    if (data.awayTeamId !== undefined) { fields.push(`away_team_id = $${idx++}`); values.push(data.awayTeamId); }
    if (data.homeScore !== undefined) { fields.push(`home_score = $${idx++}`); values.push(data.homeScore); }
    if (data.awayScore !== undefined) { fields.push(`away_score = $${idx++}`); values.push(data.awayScore); }
    if (data.winnerId !== undefined) { fields.push(`winner_id = $${idx++}`); values.push(data.winnerId); }
    if (data.status !== undefined) { fields.push(`status = $${idx++}`); values.push(data.status); }
    if (data.matchId !== undefined) { fields.push(`match_id = $${idx++}`); values.push(data.matchId); }
    if (fields.length === 0) return undefined;
    values.push(id);
    const result = await this.pool.query(
      `UPDATE bracket_matches SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING id, season_id AS "seasonId", tournament_id AS "tournamentId", phase, match_order AS "matchOrder", home_team_id AS "homeTeamId", away_team_id AS "awayTeamId", home_score AS "homeScore", away_score AS "awayScore", winner_id AS "winnerId", status, match_id AS "matchId", seed, created_at AS "createdAt"`,
      values
    );
    return result.rows[0];
  }

  async deleteBracketMatches(seasonId: string): Promise<void> {
    await this.pool.query(`DELETE FROM bracket_matches WHERE season_id = $1`, [seasonId]);
  }
}
