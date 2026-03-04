import { storage } from "./storage";
import type { CompetitionRule, StandingsEntry, Plus30Rules } from "@shared/schema";

export async function generateBracket(
  seasonId: string,
  tournamentId: string,
  standings: StandingsEntry[],
  rules: CompetitionRule
): Promise<void> {
  const plus30 = rules.plus30Rules as Plus30Rules | undefined;
  if (!plus30) throw new Error("No hay reglas de eliminatorias configuradas");

  await storage.deleteBracketMatches(seasonId);

  const directToSemis = standings.find(s => s.position === plus30.directToSemisPosition);

  const repechageTeams = standings.filter(s =>
    plus30.repechagePositions.includes(s.position)
  ).sort((a, b) => a.position - b.position);

  const repechageMatches: { homeTeamId: string; awayTeamId: string; seed: string }[] = [];
  const half = Math.floor(repechageTeams.length / 2);
  for (let i = 0; i < half; i++) {
    const top = repechageTeams[i];
    const bottom = repechageTeams[repechageTeams.length - 1 - i];
    repechageMatches.push({
      homeTeamId: top.teamId,
      awayTeamId: bottom.teamId,
      seed: `${top.position}v${bottom.position}`,
    });
  }

  for (let i = 0; i < repechageMatches.length; i++) {
    await storage.createBracketMatch({
      seasonId,
      tournamentId,
      phase: "REPECHAJE",
      matchOrder: i + 1,
      homeTeamId: repechageMatches[i].homeTeamId,
      awayTeamId: repechageMatches[i].awayTeamId,
      status: "PENDIENTE",
      seed: repechageMatches[i].seed,
    });
  }

  for (let i = 0; i < Math.ceil(repechageMatches.length / 2); i++) {
    await storage.createBracketMatch({
      seasonId,
      tournamentId,
      phase: "CUARTOS",
      matchOrder: i + 1,
      status: "PENDIENTE",
      seed: `C${i + 1}`,
    });
  }

  const semiCount = 2;
  for (let i = 0; i < semiCount; i++) {
    await storage.createBracketMatch({
      seasonId,
      tournamentId,
      phase: "SEMIFINAL",
      matchOrder: i + 1,
      homeTeamId: i === 0 && directToSemis ? directToSemis.teamId : undefined,
      status: "PENDIENTE",
      seed: i === 0 ? `1ºvGC` : `GC_v_GC`,
    });
  }

  await storage.createBracketMatch({
    seasonId,
    tournamentId,
    phase: "FINAL",
    matchOrder: 1,
    status: "PENDIENTE",
    seed: "FINAL",
  });
}

export async function advanceBracketWinner(
  seasonId: string,
  bracketMatchId: string,
  homeScore: number,
  awayScore: number,
  winnerId: string
): Promise<void> {
  await storage.updateBracketMatch(bracketMatchId, {
    homeScore,
    awayScore,
    winnerId,
    status: "JUGADO",
  });

  const allMatches = await storage.getBracketMatches(seasonId);
  const currentMatch = allMatches.find(m => m.id === bracketMatchId);
  if (!currentMatch) return;

  if (currentMatch.phase === "REPECHAJE") {
    const repechageMatches = allMatches.filter(m => m.phase === "REPECHAJE").sort((a, b) => a.matchOrder - b.matchOrder);
    const cuartosMatches = allMatches.filter(m => m.phase === "CUARTOS").sort((a, b) => a.matchOrder - b.matchOrder);

    const matchIdx = repechageMatches.findIndex(m => m.id === bracketMatchId);
    const cuartosIdx = Math.floor(matchIdx / 2);
    if (cuartosIdx < cuartosMatches.length) {
      const cuartos = cuartosMatches[cuartosIdx];
      if (matchIdx % 2 === 0) {
        await storage.updateBracketMatch(cuartos.id, { homeTeamId: winnerId });
      } else {
        await storage.updateBracketMatch(cuartos.id, { awayTeamId: winnerId });
      }
    }
  } else if (currentMatch.phase === "CUARTOS") {
    const cuartosMatches = allMatches.filter(m => m.phase === "CUARTOS").sort((a, b) => a.matchOrder - b.matchOrder);
    const semiMatches = allMatches.filter(m => m.phase === "SEMIFINAL").sort((a, b) => a.matchOrder - b.matchOrder);

    const matchIdx = cuartosMatches.findIndex(m => m.id === bracketMatchId);
    const semiIdx = matchIdx < Math.ceil(cuartosMatches.length / 2) ? 0 : 1;
    if (semiIdx < semiMatches.length) {
      const semi = semiMatches[semiIdx];
      if (semi.homeTeamId && !semi.awayTeamId) {
        await storage.updateBracketMatch(semi.id, { awayTeamId: winnerId });
      } else if (!semi.homeTeamId) {
        await storage.updateBracketMatch(semi.id, { homeTeamId: winnerId });
      } else {
        await storage.updateBracketMatch(semi.id, { awayTeamId: winnerId });
      }
    }
  } else if (currentMatch.phase === "SEMIFINAL") {
    const finalMatch = allMatches.find(m => m.phase === "FINAL");
    if (finalMatch) {
      if (!finalMatch.homeTeamId) {
        await storage.updateBracketMatch(finalMatch.id, { homeTeamId: winnerId });
      } else {
        await storage.updateBracketMatch(finalMatch.id, { awayTeamId: winnerId });
      }
    }
  }
}
