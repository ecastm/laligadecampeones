import { storage } from "./storage";
import { pool } from "./db-storage";
import type { CompetitionRule, StandingsEntry } from "@shared/schema";

export async function recalculateStandings(
  seasonId: string,
  tournamentId: string,
  rules: CompetitionRule
): Promise<StandingsEntry[]> {
  const teams = await storage.getTeams(tournamentId);
  const allMatches = await storage.getMatches(tournamentId);
  const matches = allMatches.filter(m => m.status === "JUGADO");

  const standings: Map<string, {
    teamId: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
  }> = new Map();

  for (const team of teams) {
    standings.set(team.id, {
      teamId: team.id,
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
    const home = standings.get(match.homeTeamId!);
    const away = standings.get(match.awayTeamId!);
    if (!home || !away) continue;

    const homeScore = match.homeScore ?? 0;
    const awayScore = match.awayScore ?? 0;

    home.played++;
    away.played++;
    home.goalsFor += homeScore;
    home.goalsAgainst += awayScore;
    away.goalsFor += awayScore;
    away.goalsAgainst += homeScore;

    if (homeScore > awayScore) {
      home.won++;
      home.points += rules.pointsWin;
      away.lost++;
      away.points += rules.pointsLoss;
    } else if (homeScore < awayScore) {
      away.won++;
      away.points += rules.pointsWin;
      home.lost++;
      home.points += rules.pointsLoss;
    } else {
      home.drawn++;
      away.drawn++;
      home.points += rules.pointsDraw;
      away.points += rules.pointsDraw;
    }

    home.goalDifference = home.goalsFor - home.goalsAgainst;
    away.goalDifference = away.goalsFor - away.goalsAgainst;
  }

  const sorted = Array.from(standings.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`DELETE FROM standings_entries WHERE season_id = $1`, [seasonId]);
    for (let idx = 0; idx < sorted.length; idx++) {
      const s = sorted[idx];
      await client.query(
        `INSERT INTO standings_entries (id, season_id, tournament_id, team_id, division, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, position, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, now())`,
        [seasonId, tournamentId, s.teamId, null, s.played, s.won, s.drawn, s.lost, s.goalsFor, s.goalsAgainst, s.goalDifference, s.points, idx + 1]
      );
    }
    await client.query('COMMIT');
  } catch (txError) {
    await client.query('ROLLBACK');
    throw txError;
  } finally {
    client.release();
  }

  return await storage.getStandingsEntries(seasonId);
}
