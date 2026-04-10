import "dotenv/config";
import { Pool, PoolClient } from "pg";

type MatchStatus = "PROGRAMADO" | "EN_CURSO" | "JUGADO";

interface CliOptions {
  sourceUrl: string;
  targetUrl: string;
  fromDate: string;
  toDate: string;
  timezone: string;
  dryRun: boolean;
}

interface RecoveryStats {
  matchesInserted: number;
  matchesUpdated: number;
  eventsInserted: number;
  lineupsInserted: number;
  lineupsUpdated: number;
  attendanceInserted: number;
  attendanceUpdated: number;
  evidenceInserted: number;
  finesInserted: number;
  finesUpdated: number;
  suspensionsInserted: number;
  suspensionsUpdated: number;
  skipped: number;
  conflicts: number;
  warnings: string[];
}

interface MatchRow {
  id: string;
  tournamentId: string;
  roundNumber: number;
  dateTime: string;
  field: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  refereeUserId: string | null;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  vsImageUrl: string | null;
  stage: string | null;
  stageId: string | null;
  refereeNotes: string | null;
  tournamentName: string;
  seasonName: string;
  homeTeamName: string | null;
  awayTeamName: string | null;
  refereeEmail: string | null;
}

interface TeamRow {
  id: string;
  tournamentId: string;
  name: string;
}

interface PlayerRow {
  id: string;
  teamId: string;
  firstName: string;
  lastName: string;
  jerseyNumber: number;
  identificationId: string | null;
}

function parseArgs(): CliOptions {
  const values: Record<string, string> = {};
  let apply = false;

  for (const arg of process.argv.slice(2)) {
    if (arg === "--apply") {
      apply = true;
      continue;
    }
    if (!arg.startsWith("--")) continue;
    const [key, ...rest] = arg.slice(2).split("=");
    values[key] = rest.join("=");
  }

  const sourceUrl = values["source-url"] || process.env.SOURCE_DATABASE_URL || "";
  const targetUrl =
    values["target-url"] || process.env.TARGET_DATABASE_URL || process.env.DATABASE_URL || "";

  if (!sourceUrl || !targetUrl) {
    throw new Error(
      "Missing DB URLs. Use SOURCE_DATABASE_URL and DATABASE_URL/TARGET_DATABASE_URL, or pass --source-url=... --target-url=..."
    );
  }

  return {
    sourceUrl,
    targetUrl,
    fromDate: values["from-date"] || "2026-04-04",
    toDate: values["to-date"] || "2026-04-05",
    timezone: values["timezone"] || "Europe/Madrid",
    dryRun: !apply,
  };
}

function normalize(value: string | null | undefined): string {
  return (value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function getDateKey(dateTime: string, timezone: string): string | null {
  const prefix = dateTime.match(/^(\d{4}-\d{2}-\d{2})/);
  if (prefix) return prefix[1];

  const parsed = new Date(dateTime);
  if (Number.isNaN(parsed.getTime())) return null;

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(parsed);
}

function inRange(dateKey: string, fromDate: string, toDate: string): boolean {
  return dateKey >= fromDate && dateKey <= toDate;
}

function matchBusinessKey(
  tournamentId: string,
  roundNumber: number,
  homeTeamId: string,
  awayTeamId: string,
  dateKey: string
): string {
  return [tournamentId, String(roundNumber), homeTeamId, awayTeamId, dateKey].join("|");
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

async function fetchMatches(pool: Pool): Promise<MatchRow[]> {
  const query = `
    SELECT
      m.id,
      m.tournament_id AS "tournamentId",
      m.round_number AS "roundNumber",
      m.date_time AS "dateTime",
      m.field,
      m.home_team_id AS "homeTeamId",
      m.away_team_id AS "awayTeamId",
      m.referee_user_id AS "refereeUserId",
      m.status,
      m.home_score AS "homeScore",
      m.away_score AS "awayScore",
      m.vs_image_url AS "vsImageUrl",
      m.stage,
      m.stage_id AS "stageId",
      m.referee_notes AS "refereeNotes",
      t.name AS "tournamentName",
      t.season_name AS "seasonName",
      ht.name AS "homeTeamName",
      at.name AS "awayTeamName",
      ru.email AS "refereeEmail"
    FROM matches m
    JOIN tournaments t ON t.id = m.tournament_id
    LEFT JOIN teams ht ON ht.id = m.home_team_id
    LEFT JOIN teams at ON at.id = m.away_team_id
    LEFT JOIN users ru ON ru.id = m.referee_user_id
  `;

  const result = await pool.query<MatchRow>(query);
  return result.rows;
}

async function fetchTeams(pool: Pool, tournamentIds: string[]): Promise<TeamRow[]> {
  if (tournamentIds.length === 0) return [];
  const result = await pool.query<TeamRow>(
    `SELECT id, tournament_id AS "tournamentId", name FROM teams WHERE tournament_id = ANY($1)`,
    [tournamentIds]
  );
  return result.rows;
}

async function fetchPlayers(pool: Pool, teamIds: string[]): Promise<PlayerRow[]> {
  if (teamIds.length === 0) return [];
  const result = await pool.query<PlayerRow>(
    `
      SELECT
        id,
        team_id AS "teamId",
        first_name AS "firstName",
        last_name AS "lastName",
        jersey_number AS "jerseyNumber",
        identification_id AS "identificationId"
      FROM players
      WHERE team_id = ANY($1)
    `,
    [teamIds]
  );
  return result.rows;
}

function eventFingerprint(
  type: string,
  minute: number,
  teamId: string,
  playerId: string,
  relatedPlayerId: string | null,
  notes: string | null
): string {
  return [
    type,
    String(minute),
    teamId,
    playerId,
    relatedPlayerId || "",
    normalize(notes),
  ].join("|");
}

async function run(): Promise<void> {
  const options = parseArgs();
  const sourcePool = new Pool({ connectionString: options.sourceUrl });
  const targetPool = new Pool({ connectionString: options.targetUrl });

  const stats: RecoveryStats = {
    matchesInserted: 0,
    matchesUpdated: 0,
    eventsInserted: 0,
    lineupsInserted: 0,
    lineupsUpdated: 0,
    attendanceInserted: 0,
    attendanceUpdated: 0,
    evidenceInserted: 0,
    finesInserted: 0,
    finesUpdated: 0,
    suspensionsInserted: 0,
    suspensionsUpdated: 0,
    skipped: 0,
    conflicts: 0,
    warnings: [],
  };

  let client: PoolClient | null = null;
  let dryRunId = 1;

  try {
    console.log("Recovery options:", options);

    const [sourceMatches, targetMatches] = await Promise.all([
      fetchMatches(sourcePool),
      fetchMatches(targetPool),
    ]);

    const filteredSourceMatches = sourceMatches.filter((row) => {
      const dateKey = getDateKey(row.dateTime, options.timezone);
      if (!dateKey) return false;
      return inRange(dateKey, options.fromDate, options.toDate);
    });

    if (filteredSourceMatches.length === 0) {
      console.log("No source matches found for selected date range.");
      return;
    }

    const sourceTournamentMap = new Map<string, { key: string; name: string }>();
    for (const match of filteredSourceMatches) {
      sourceTournamentMap.set(match.tournamentId, {
        key: `${normalize(match.tournamentName)}|${normalize(match.seasonName)}`,
        name: `${match.tournamentName} (${match.seasonName})`,
      });
    }

    const targetTournamentByKey = new Map<string, string>();
    for (const match of targetMatches) {
      const key = `${normalize(match.tournamentName)}|${normalize(match.seasonName)}`;
      if (!targetTournamentByKey.has(key)) {
        targetTournamentByKey.set(key, match.tournamentId);
      }
    }

    const sourceToTargetTournament = new Map<string, string>();
    for (const [sourceTournamentId, data] of sourceTournamentMap.entries()) {
      const targetTournamentId = targetTournamentByKey.get(data.key);
      if (!targetTournamentId) {
        stats.warnings.push(`Tournament not found in target: ${data.name}`);
        stats.skipped += 1;
        continue;
      }
      sourceToTargetTournament.set(sourceTournamentId, targetTournamentId);
    }

    const filteredForMappedTournaments = filteredSourceMatches.filter((match) =>
      sourceToTargetTournament.has(match.tournamentId)
    );

    const sourceTournamentIds = [...new Set(filteredForMappedTournaments.map((m) => m.tournamentId))];
    const targetTournamentIds = [...new Set([...sourceToTargetTournament.values()])];

    const [sourceTeams, targetTeams] = await Promise.all([
      fetchTeams(sourcePool, sourceTournamentIds),
      fetchTeams(targetPool, targetTournamentIds),
    ]);

    const targetTeamByKey = new Map<string, string>();
    for (const team of targetTeams) {
      const key = `${team.tournamentId}|${normalize(team.name)}`;
      if (!targetTeamByKey.has(key)) {
        targetTeamByKey.set(key, team.id);
      }
    }

    const sourceToTargetTeam = new Map<string, string>();
    for (const sourceTeam of sourceTeams) {
      const mappedTournamentId = sourceToTargetTournament.get(sourceTeam.tournamentId);
      if (!mappedTournamentId) continue;
      const key = `${mappedTournamentId}|${normalize(sourceTeam.name)}`;
      const mappedTeamId = targetTeamByKey.get(key);
      if (!mappedTeamId) {
        stats.warnings.push(`Team not found in target: ${sourceTeam.name}`);
        continue;
      }
      sourceToTargetTeam.set(sourceTeam.id, mappedTeamId);
    }

    const sourceTeamIds = [...new Set(sourceTeams.map((t) => t.id))];
    const targetTeamIds = [...new Set([...sourceToTargetTeam.values()])];

    const [sourcePlayers, targetPlayers] = await Promise.all([
      fetchPlayers(sourcePool, sourceTeamIds),
      fetchPlayers(targetPool, targetTeamIds),
    ]);

    const targetPlayerByIdentity = new Map<string, string>();
    const targetPlayerByFallback = new Map<string, string>();
    for (const player of targetPlayers) {
      if (player.identificationId) {
        targetPlayerByIdentity.set(
          `${player.teamId}|${normalize(player.identificationId)}`,
          player.id
        );
      }
      targetPlayerByFallback.set(
        `${player.teamId}|${normalize(player.firstName)}|${normalize(player.lastName)}|${player.jerseyNumber}`,
        player.id
      );
    }

    const sourceToTargetPlayer = new Map<string, string>();
    for (const sourcePlayer of sourcePlayers) {
      const mappedTeamId = sourceToTargetTeam.get(sourcePlayer.teamId);
      if (!mappedTeamId) continue;

      const byIdentity = sourcePlayer.identificationId
        ? targetPlayerByIdentity.get(`${mappedTeamId}|${normalize(sourcePlayer.identificationId)}`)
        : undefined;

      const byFallback = targetPlayerByFallback.get(
        `${mappedTeamId}|${normalize(sourcePlayer.firstName)}|${normalize(sourcePlayer.lastName)}|${sourcePlayer.jerseyNumber}`
      );

      const mapped = byIdentity || byFallback;
      if (mapped) {
        sourceToTargetPlayer.set(sourcePlayer.id, mapped);
      }
    }

    const refereeEmails = [...new Set(filteredForMappedTournaments.map((m) => m.refereeEmail).filter(Boolean))] as string[];
    const targetUsersByEmail = new Map<string, string>();
    if (refereeEmails.length > 0) {
      const targetUserRows = await targetPool.query<{ id: string; email: string }>(
        `SELECT id, email FROM users WHERE email = ANY($1)`,
        [refereeEmails]
      );
      for (const user of targetUserRows.rows) {
        targetUsersByEmail.set(normalize(user.email), user.id);
      }
    }

    const existingTargetMatchByKey = new Map<string, MatchRow>();
    for (const targetMatch of targetMatches) {
      const dateKey = getDateKey(targetMatch.dateTime, options.timezone);
      if (!dateKey || !inRange(dateKey, options.fromDate, options.toDate)) continue;
      if (!targetMatch.homeTeamId || !targetMatch.awayTeamId) continue;

      const key = matchBusinessKey(
        targetMatch.tournamentId,
        targetMatch.roundNumber,
        targetMatch.homeTeamId,
        targetMatch.awayTeamId,
        dateKey
      );
      existingTargetMatchByKey.set(key, targetMatch);
    }

    const sourceToTargetMatch = new Map<string, string>();
    const targetMatchIdsTouched: string[] = [];

    if (!options.dryRun) {
      client = await targetPool.connect();
      await client.query("BEGIN");
    }

    for (const sourceMatch of filteredForMappedTournaments) {
      if (!sourceMatch.homeTeamId || !sourceMatch.awayTeamId) {
        stats.skipped += 1;
        continue;
      }

      const mappedTournamentId = sourceToTargetTournament.get(sourceMatch.tournamentId);
      const mappedHomeTeamId = sourceToTargetTeam.get(sourceMatch.homeTeamId);
      const mappedAwayTeamId = sourceToTargetTeam.get(sourceMatch.awayTeamId);
      const dateKey = getDateKey(sourceMatch.dateTime, options.timezone);

      if (!mappedTournamentId || !mappedHomeTeamId || !mappedAwayTeamId || !dateKey) {
        stats.skipped += 1;
        continue;
      }

      const businessKey = matchBusinessKey(
        mappedTournamentId,
        sourceMatch.roundNumber,
        mappedHomeTeamId,
        mappedAwayTeamId,
        dateKey
      );

      const existing = existingTargetMatchByKey.get(businessKey);
      const mappedRefereeUserId = sourceMatch.refereeEmail
        ? targetUsersByEmail.get(normalize(sourceMatch.refereeEmail)) || null
        : null;

      if (!existing) {
        if (options.dryRun) {
          const newId = `dry-run-match-${dryRunId++}`;
          sourceToTargetMatch.set(sourceMatch.id, newId);
          targetMatchIdsTouched.push(newId);
          stats.matchesInserted += 1;
        } else {
          const insertResult = await (client as PoolClient).query<{ id: string }>(
            `
              INSERT INTO matches (
                tournament_id, round_number, date_time, field,
                home_team_id, away_team_id, referee_user_id,
                status, home_score, away_score, vs_image_url,
                stage, stage_id, referee_notes
              )
              VALUES (
                $1, $2, $3, $4,
                $5, $6, $7,
                $8, $9, $10, $11,
                $12, $13, $14
              )
              RETURNING id
            `,
            [
              mappedTournamentId,
              sourceMatch.roundNumber,
              sourceMatch.dateTime,
              sourceMatch.field,
              mappedHomeTeamId,
              mappedAwayTeamId,
              mappedRefereeUserId,
              sourceMatch.status,
              sourceMatch.homeScore,
              sourceMatch.awayScore,
              sourceMatch.vsImageUrl,
              sourceMatch.stage,
              sourceMatch.stageId,
              sourceMatch.refereeNotes,
            ]
          );

          const newId = insertResult.rows[0].id;
          sourceToTargetMatch.set(sourceMatch.id, newId);
          targetMatchIdsTouched.push(newId);
          stats.matchesInserted += 1;
        }
        continue;
      }

      sourceToTargetMatch.set(sourceMatch.id, existing.id);
      targetMatchIdsTouched.push(existing.id);

      const updates: Record<string, unknown> = {};
      if (sourceMatch.status === "JUGADO" && existing.status !== "JUGADO") updates.status = "JUGADO";
      if (existing.homeScore == null && sourceMatch.homeScore != null) updates.home_score = sourceMatch.homeScore;
      if (existing.awayScore == null && sourceMatch.awayScore != null) updates.away_score = sourceMatch.awayScore;
      if (!existing.refereeUserId && mappedRefereeUserId) updates.referee_user_id = mappedRefereeUserId;
      if (!existing.refereeNotes && sourceMatch.refereeNotes) updates.referee_notes = sourceMatch.refereeNotes;
      if (!existing.vsImageUrl && sourceMatch.vsImageUrl) updates.vs_image_url = sourceMatch.vsImageUrl;
      if (!existing.stage && sourceMatch.stage) updates.stage = sourceMatch.stage;
      if (!existing.stageId && sourceMatch.stageId) updates.stage_id = sourceMatch.stageId;

      if (
        existing.homeScore != null &&
        sourceMatch.homeScore != null &&
        existing.homeScore !== sourceMatch.homeScore
      ) {
        stats.conflicts += 1;
        stats.warnings.push(`Score conflict homeScore for match ${existing.id}; preserved target value.`);
      }
      if (
        existing.awayScore != null &&
        sourceMatch.awayScore != null &&
        existing.awayScore !== sourceMatch.awayScore
      ) {
        stats.conflicts += 1;
        stats.warnings.push(`Score conflict awayScore for match ${existing.id}; preserved target value.`);
      }

      const updateEntries = Object.entries(updates);
      if (updateEntries.length > 0) {
        stats.matchesUpdated += 1;
        if (!options.dryRun) {
          const columns = updateEntries.map(([column], index) => `${column} = $${index + 1}`);
          const values = updateEntries.map(([, value]) => value);
          values.push(existing.id);
          await (client as PoolClient).query(
            `UPDATE matches SET ${columns.join(", ")} WHERE id = $${updateEntries.length + 1}`,
            values
          );
        }
      }
    }

    const sourceMatchIds = [...sourceToTargetMatch.keys()];
    const targetMatchIds = [...new Set(targetMatchIdsTouched.filter((id) => !id.startsWith("dry-run-")))];

    const [sourceEvents, sourceLineups, sourceAttendance, sourceEvidence, sourceFines, sourceSuspensions] = await Promise.all([
      sourceMatchIds.length
        ? sourcePool.query(
            `SELECT id, match_id AS "matchId", type, minute, team_id AS "teamId", player_id AS "playerId", related_player_id AS "relatedPlayerId", notes FROM match_events WHERE match_id = ANY($1)`,
            [sourceMatchIds]
          )
        : Promise.resolve({ rows: [] as any[] }),
      sourceMatchIds.length
        ? sourcePool.query(
            `SELECT id, match_id AS "matchId", team_id AS "teamId", player_ids AS "playerIds" FROM match_lineups WHERE match_id = ANY($1)`,
            [sourceMatchIds]
          )
        : Promise.resolve({ rows: [] as any[] }),
      sourceMatchIds.length
        ? sourcePool.query(
            `SELECT id, match_id AS "matchId", team_id AS "teamId", player_id AS "playerId", present FROM match_attendance WHERE match_id = ANY($1)`,
            [sourceMatchIds]
          )
        : Promise.resolve({ rows: [] as any[] }),
      sourceMatchIds.length
        ? sourcePool.query(
            `SELECT id, match_id AS "matchId", event_id AS "eventId", type, url, transcript FROM match_evidence WHERE match_id = ANY($1)`,
            [sourceMatchIds]
          )
        : Promise.resolve({ rows: [] as any[] }),
      sourceMatchIds.length
        ? sourcePool.query(
            `SELECT id, tournament_id AS "tournamentId", match_id AS "matchId", match_event_id AS "matchEventId", team_id AS "teamId", player_id AS "playerId", card_type AS "cardType", amount, status, paid_amount AS "paidAmount", paid_at AS "paidAt" FROM fines WHERE match_id = ANY($1)`,
            [sourceMatchIds]
          )
        : Promise.resolve({ rows: [] as any[] }),
      sourceMatchIds.length
        ? sourcePool.query(
            `SELECT id, tournament_id AS "tournamentId", player_id AS "playerId", team_id AS "teamId", match_id AS "matchId", match_event_id AS "matchEventId", reason, matches_remaining AS "matchesRemaining", status FROM player_suspensions WHERE match_id = ANY($1)`,
            [sourceMatchIds]
          )
        : Promise.resolve({ rows: [] as any[] }),
    ]);

    const [targetEvents, targetLineups, targetAttendance, targetEvidence, targetFines, targetSuspensions] = await Promise.all([
      targetMatchIds.length
        ? targetPool.query(
            `SELECT id, match_id AS "matchId", type, minute, team_id AS "teamId", player_id AS "playerId", related_player_id AS "relatedPlayerId", notes FROM match_events WHERE match_id = ANY($1)`,
            [targetMatchIds]
          )
        : Promise.resolve({ rows: [] as any[] }),
      targetMatchIds.length
        ? targetPool.query(
            `SELECT id, match_id AS "matchId", team_id AS "teamId", player_ids AS "playerIds" FROM match_lineups WHERE match_id = ANY($1)`,
            [targetMatchIds]
          )
        : Promise.resolve({ rows: [] as any[] }),
      targetMatchIds.length
        ? targetPool.query(
            `SELECT id, match_id AS "matchId", team_id AS "teamId", player_id AS "playerId", present FROM match_attendance WHERE match_id = ANY($1)`,
            [targetMatchIds]
          )
        : Promise.resolve({ rows: [] as any[] }),
      targetMatchIds.length
        ? targetPool.query(
            `SELECT id, match_id AS "matchId", event_id AS "eventId", type, url, transcript FROM match_evidence WHERE match_id = ANY($1)`,
            [targetMatchIds]
          )
        : Promise.resolve({ rows: [] as any[] }),
      targetMatchIds.length
        ? targetPool.query(
            `SELECT id, tournament_id AS "tournamentId", match_id AS "matchId", match_event_id AS "matchEventId", team_id AS "teamId", player_id AS "playerId", card_type AS "cardType", amount, status, paid_amount AS "paidAmount", paid_at AS "paidAt" FROM fines WHERE match_id = ANY($1)`,
            [targetMatchIds]
          )
        : Promise.resolve({ rows: [] as any[] }),
      targetMatchIds.length
        ? targetPool.query(
            `SELECT id, tournament_id AS "tournamentId", player_id AS "playerId", team_id AS "teamId", match_id AS "matchId", match_event_id AS "matchEventId", reason, matches_remaining AS "matchesRemaining", status FROM player_suspensions WHERE match_id = ANY($1)`,
            [targetMatchIds]
          )
        : Promise.resolve({ rows: [] as any[] }),
    ]);

    const targetEventsByMatch = new Map<string, Map<string, string>>();
    for (const event of targetEvents.rows) {
      const byMatch = targetEventsByMatch.get(event.matchId) || new Map<string, string>();
      const key = eventFingerprint(
        event.type,
        event.minute,
        event.teamId,
        event.playerId,
        event.relatedPlayerId,
        event.notes
      );
      byMatch.set(key, event.id);
      targetEventsByMatch.set(event.matchId, byMatch);
    }

    const sourceEventToTargetEvent = new Map<string, string>();
    for (const sourceEvent of sourceEvents.rows) {
      const mappedMatchId = sourceToTargetMatch.get(sourceEvent.matchId);
      const mappedTeamId = sourceToTargetTeam.get(sourceEvent.teamId);
      const mappedPlayerId = sourceToTargetPlayer.get(sourceEvent.playerId);
      const mappedRelatedPlayerId = sourceEvent.relatedPlayerId
        ? sourceToTargetPlayer.get(sourceEvent.relatedPlayerId)
        : null;

      if (!mappedMatchId || !mappedTeamId || !mappedPlayerId) {
        stats.skipped += 1;
        continue;
      }

      const fingerprint = eventFingerprint(
        sourceEvent.type,
        sourceEvent.minute,
        mappedTeamId,
        mappedPlayerId,
        mappedRelatedPlayerId || null,
        sourceEvent.notes || null
      );

      const existingId = targetEventsByMatch.get(mappedMatchId)?.get(fingerprint);
      if (existingId) {
        sourceEventToTargetEvent.set(sourceEvent.id, existingId);
        continue;
      }

      if (mappedMatchId.startsWith("dry-run-")) {
        const dryId = `dry-run-event-${dryRunId++}`;
        sourceEventToTargetEvent.set(sourceEvent.id, dryId);
        stats.eventsInserted += 1;
        continue;
      }

      if (!options.dryRun) {
        const result = await (client as PoolClient).query<{ id: string }>(
          `INSERT INTO match_events (match_id, type, minute, team_id, player_id, related_player_id, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
          [
            mappedMatchId,
            sourceEvent.type,
            sourceEvent.minute,
            mappedTeamId,
            mappedPlayerId,
            mappedRelatedPlayerId || null,
            sourceEvent.notes || null,
          ]
        );
        sourceEventToTargetEvent.set(sourceEvent.id, result.rows[0].id);
      }
      stats.eventsInserted += 1;
    }

    const targetLineupByKey = new Map<string, { id: string; playerIds: string[] }>();
    for (const lineup of targetLineups.rows) {
      targetLineupByKey.set(`${lineup.matchId}|${lineup.teamId}`, {
        id: lineup.id,
        playerIds: asStringArray(lineup.playerIds),
      });
    }

    for (const sourceLineup of sourceLineups.rows) {
      const mappedMatchId = sourceToTargetMatch.get(sourceLineup.matchId);
      const mappedTeamId = sourceToTargetTeam.get(sourceLineup.teamId);
      if (!mappedMatchId || !mappedTeamId) {
        stats.skipped += 1;
        continue;
      }

      const mappedPlayers = asStringArray(sourceLineup.playerIds)
        .map((id) => sourceToTargetPlayer.get(id))
        .filter((id): id is string => Boolean(id));

      if (mappedPlayers.length === 0) {
        stats.skipped += 1;
        continue;
      }

      const key = `${mappedMatchId}|${mappedTeamId}`;
      const existing = targetLineupByKey.get(key);
      if (!existing) {
        if (!mappedMatchId.startsWith("dry-run-") && !options.dryRun) {
          await (client as PoolClient).query(
            `INSERT INTO match_lineups (match_id, team_id, player_ids) VALUES ($1, $2, $3::jsonb)`,
            [mappedMatchId, mappedTeamId, JSON.stringify(mappedPlayers)]
          );
        }
        stats.lineupsInserted += 1;
        continue;
      }

      const merged = [...new Set([...existing.playerIds, ...mappedPlayers])];
      if (merged.length !== existing.playerIds.length) {
        if (!options.dryRun) {
          await (client as PoolClient).query(`UPDATE match_lineups SET player_ids = $1::jsonb WHERE id = $2`, [
            JSON.stringify(merged),
            existing.id,
          ]);
        }
        stats.lineupsUpdated += 1;
      }
    }

    const targetAttendanceKey = new Map<string, { id: string; present: boolean }>();
    for (const row of targetAttendance.rows) {
      targetAttendanceKey.set(`${row.matchId}|${row.teamId}|${row.playerId}`, {
        id: row.id,
        present: Boolean(row.present),
      });
    }

    for (const sourceRow of sourceAttendance.rows) {
      const mappedMatchId = sourceToTargetMatch.get(sourceRow.matchId);
      const mappedTeamId = sourceToTargetTeam.get(sourceRow.teamId);
      const mappedPlayerId = sourceToTargetPlayer.get(sourceRow.playerId);
      if (!mappedMatchId || !mappedTeamId || !mappedPlayerId) {
        stats.skipped += 1;
        continue;
      }

      const key = `${mappedMatchId}|${mappedTeamId}|${mappedPlayerId}`;
      const existing = targetAttendanceKey.get(key);
      if (!existing) {
        if (!mappedMatchId.startsWith("dry-run-") && !options.dryRun) {
          await (client as PoolClient).query(
            `INSERT INTO match_attendance (match_id, team_id, player_id, present) VALUES ($1, $2, $3, $4)`,
            [mappedMatchId, mappedTeamId, mappedPlayerId, Boolean(sourceRow.present)]
          );
        }
        stats.attendanceInserted += 1;
        continue;
      }

      if (!existing.present && Boolean(sourceRow.present)) {
        if (!options.dryRun) {
          await (client as PoolClient).query(`UPDATE match_attendance SET present = true WHERE id = $1`, [
            existing.id,
          ]);
        }
        stats.attendanceUpdated += 1;
      }
    }

    const targetEvidenceKey = new Set<string>();
    for (const row of targetEvidence.rows) {
      targetEvidenceKey.add(
        `${row.matchId}|${row.type}|${normalize(row.url)}|${normalize(row.transcript || "")}`
      );
    }

    for (const sourceRow of sourceEvidence.rows) {
      const mappedMatchId = sourceToTargetMatch.get(sourceRow.matchId);
      if (!mappedMatchId) {
        stats.skipped += 1;
        continue;
      }

      const mappedEventId = sourceRow.eventId ? sourceEventToTargetEvent.get(sourceRow.eventId) || null : null;
      const key = `${mappedMatchId}|${sourceRow.type}|${normalize(sourceRow.url)}|${normalize(
        sourceRow.transcript || ""
      )}`;
      if (targetEvidenceKey.has(key)) continue;

      if (!mappedMatchId.startsWith("dry-run-") && !options.dryRun) {
        await (client as PoolClient).query(
          `INSERT INTO match_evidence (match_id, event_id, type, url, transcript) VALUES ($1, $2, $3, $4, $5)`,
          [mappedMatchId, mappedEventId, sourceRow.type, sourceRow.url, sourceRow.transcript || null]
        );
      }
      stats.evidenceInserted += 1;
    }

    const targetFineByKey = new Map<string, any>();
    for (const row of targetFines.rows) {
      const key = [
        row.matchId,
        row.teamId,
        row.playerId || "",
        row.cardType,
        String(row.amount),
      ].join("|");
      targetFineByKey.set(key, row);
    }

    for (const sourceRow of sourceFines.rows) {
      const mappedMatchId = sourceToTargetMatch.get(sourceRow.matchId);
      const mappedTournamentId = sourceToTargetTournament.get(sourceRow.tournamentId);
      const mappedTeamId = sourceToTargetTeam.get(sourceRow.teamId);
      const mappedPlayerId = sourceRow.playerId ? sourceToTargetPlayer.get(sourceRow.playerId) || null : null;
      const mappedEventId = sourceRow.matchEventId
        ? sourceEventToTargetEvent.get(sourceRow.matchEventId) || null
        : null;

      if (!mappedMatchId || !mappedTournamentId || !mappedTeamId) {
        stats.skipped += 1;
        continue;
      }

      const key = [
        mappedMatchId,
        mappedTeamId,
        mappedPlayerId || "",
        sourceRow.cardType,
        String(sourceRow.amount),
      ].join("|");
      const existing = targetFineByKey.get(key);

      if (!existing) {
        if (!mappedMatchId.startsWith("dry-run-") && !options.dryRun) {
          await (client as PoolClient).query(
            `INSERT INTO fines (tournament_id, match_id, match_event_id, team_id, player_id, card_type, amount, status, paid_amount, paid_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [
              mappedTournamentId,
              mappedMatchId,
              mappedEventId,
              mappedTeamId,
              mappedPlayerId,
              sourceRow.cardType,
              sourceRow.amount,
              sourceRow.status,
              sourceRow.paidAmount,
              sourceRow.paidAt,
            ]
          );
        }
        stats.finesInserted += 1;
        continue;
      }

      if (!existing.paidAmount && sourceRow.paidAmount) {
        if (!options.dryRun) {
          await (client as PoolClient).query(
            `UPDATE fines SET paid_amount = $1, paid_at = COALESCE(paid_at, $2), status = $3 WHERE id = $4`,
            [sourceRow.paidAmount, sourceRow.paidAt, sourceRow.status, existing.id]
          );
        }
        stats.finesUpdated += 1;
      }
    }

    const targetSuspensionByKey = new Map<string, any>();
    for (const row of targetSuspensions.rows) {
      const key = [row.matchId, row.teamId, row.playerId, normalize(row.reason)].join("|");
      targetSuspensionByKey.set(key, row);
    }

    for (const sourceRow of sourceSuspensions.rows) {
      const mappedMatchId = sourceToTargetMatch.get(sourceRow.matchId);
      const mappedTournamentId = sourceToTargetTournament.get(sourceRow.tournamentId);
      const mappedTeamId = sourceToTargetTeam.get(sourceRow.teamId);
      const mappedPlayerId = sourceToTargetPlayer.get(sourceRow.playerId);
      const mappedEventId = sourceRow.matchEventId
        ? sourceEventToTargetEvent.get(sourceRow.matchEventId) || null
        : null;

      if (!mappedMatchId || !mappedTournamentId || !mappedTeamId || !mappedPlayerId) {
        stats.skipped += 1;
        continue;
      }

      const key = [mappedMatchId, mappedTeamId, mappedPlayerId, normalize(sourceRow.reason)].join("|");
      const existing = targetSuspensionByKey.get(key);

      if (!existing) {
        if (!mappedMatchId.startsWith("dry-run-") && !options.dryRun) {
          await (client as PoolClient).query(
            `INSERT INTO player_suspensions (tournament_id, player_id, team_id, match_id, match_event_id, reason, matches_remaining, status)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [
              mappedTournamentId,
              mappedPlayerId,
              mappedTeamId,
              mappedMatchId,
              mappedEventId,
              sourceRow.reason,
              sourceRow.matchesRemaining,
              sourceRow.status,
            ]
          );
        }
        stats.suspensionsInserted += 1;
        continue;
      }

      if (existing.matchesRemaining !== sourceRow.matchesRemaining || existing.status !== sourceRow.status) {
        if (!options.dryRun) {
          await (client as PoolClient).query(
            `UPDATE player_suspensions SET matches_remaining = $1, status = $2 WHERE id = $3`,
            [sourceRow.matchesRemaining, sourceRow.status, existing.id]
          );
        }
        stats.suspensionsUpdated += 1;
      }
    }

    if (!options.dryRun && client) {
      await client.query("COMMIT");
    }

    console.log("\nRecovery summary");
    console.log("================");
    console.log(`Mode: ${options.dryRun ? "DRY RUN" : "APPLY"}`);
    console.log(`Matches inserted: ${stats.matchesInserted}`);
    console.log(`Matches updated: ${stats.matchesUpdated}`);
    console.log(`Events inserted: ${stats.eventsInserted}`);
    console.log(`Lineups inserted: ${stats.lineupsInserted}`);
    console.log(`Lineups updated: ${stats.lineupsUpdated}`);
    console.log(`Attendance inserted: ${stats.attendanceInserted}`);
    console.log(`Attendance updated: ${stats.attendanceUpdated}`);
    console.log(`Evidence inserted: ${stats.evidenceInserted}`);
    console.log(`Fines inserted: ${stats.finesInserted}`);
    console.log(`Fines updated: ${stats.finesUpdated}`);
    console.log(`Suspensions inserted: ${stats.suspensionsInserted}`);
    console.log(`Suspensions updated: ${stats.suspensionsUpdated}`);
    console.log(`Skipped rows: ${stats.skipped}`);
    console.log(`Conflicts: ${stats.conflicts}`);

    if (stats.warnings.length > 0) {
      console.log("\nWarnings:");
      for (const warning of stats.warnings) {
        console.log(`- ${warning}`);
      }
    }
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK");
    }
    throw error;
  } finally {
    if (client) client.release();
    await sourcePool.end();
    await targetPool.end();
  }
}

run().catch((error) => {
  console.error("Recovery failed:", error);
  process.exit(1);
});
