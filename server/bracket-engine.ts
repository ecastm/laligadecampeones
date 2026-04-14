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

  const sorted = [...standings].sort((a, b) => a.position - b.position);

  const directTeam = sorted.find(s => s.position === plus30.directToSemisPosition);

  const repechageTeams = sorted.filter(s =>
    plus30.repechagePositions.includes(s.position)
  ).sort((a, b) => a.position - b.position);

  const repechageMatchData: { homeTeamId: string; awayTeamId: string; seed: string }[] = [];
  const half = Math.floor(repechageTeams.length / 2);
  for (let i = 0; i < half; i++) {
    const top = repechageTeams[i];
    const bottom = repechageTeams[repechageTeams.length - 1 - i];
    repechageMatchData.push({
      homeTeamId: top.teamId,
      awayTeamId: bottom.teamId,
      seed: `${top.position}ºv${bottom.position}º`,
    });
  }

  for (let i = 0; i < repechageMatchData.length; i++) {
    await storage.createBracketMatch({
      seasonId,
      tournamentId,
      phase: "REPECHAJE",
      matchOrder: i + 1,
      homeTeamId: repechageMatchData[i].homeTeamId,
      awayTeamId: repechageMatchData[i].awayTeamId,
      status: "PENDIENTE",
      seed: repechageMatchData[i].seed,
    });
  }

  const repechageWinnerCount = repechageMatchData.length;

  if (repechageWinnerCount === 4) {
    for (let i = 0; i < 2; i++) {
      await storage.createBracketMatch({
        seasonId,
        tournamentId,
        phase: "CUARTOS",
        matchOrder: i + 1,
        status: "PENDIENTE",
        seed: `C${i + 1}`,
      });
    }

    await storage.createBracketMatch({
      seasonId,
      tournamentId,
      phase: "SEMIFINAL",
      matchOrder: 1,
      status: "PENDIENTE",
      seed: "GC1 v GC2",
    });

    await storage.createBracketMatch({
      seasonId,
      tournamentId,
      phase: "FINAL",
      matchOrder: 1,
      homeTeamId: directTeam ? directTeam.teamId : undefined,
      status: "PENDIENTE",
      seed: directTeam ? `${directTeam.position}º v Ganador SF` : "FINAL",
    });
  } else if (repechageWinnerCount <= 2) {
    const semiCount = Math.ceil((repechageWinnerCount + (directTeam ? 1 : 0)) / 2);
    for (let i = 0; i < semiCount; i++) {
      await storage.createBracketMatch({
        seasonId,
        tournamentId,
        phase: "SEMIFINAL",
        matchOrder: i + 1,
        homeTeamId: i === 0 && directTeam ? directTeam.teamId : undefined,
        status: "PENDIENTE",
        seed: i === 0 && directTeam ? `${directTeam.position}º v GR` : "GR v GR",
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
  } else {
    await storage.createBracketMatch({
      seasonId,
      tournamentId,
      phase: "SEMIFINAL",
      matchOrder: 1,
      homeTeamId: directTeam ? directTeam.teamId : undefined,
      status: "PENDIENTE",
      seed: directTeam ? `${directTeam.position}º v GR` : "GR v GR",
    });

    await storage.createBracketMatch({
      seasonId,
      tournamentId,
      phase: "SEMIFINAL",
      matchOrder: 2,
      status: "PENDIENTE",
      seed: "GR v GR",
    });

    await storage.createBracketMatch({
      seasonId,
      tournamentId,
      phase: "FINAL",
      matchOrder: 1,
      status: "PENDIENTE",
      seed: "FINAL",
    });
  }
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

  const getMatchesByPhase = (phase: string) =>
    allMatches.filter(m => m.phase === phase).sort((a, b) => a.matchOrder - b.matchOrder);

  const placeWinnerInNextMatch = (nextMatches: { id: string; homeTeamId?: string | null; awayTeamId?: string | null }[], targetIdx: number, asHome: boolean) => {
    if (targetIdx < nextMatches.length) {
      const target = nextMatches[targetIdx];
      if (asHome) {
        return storage.updateBracketMatch(target.id, { homeTeamId: winnerId });
      } else {
        return storage.updateBracketMatch(target.id, { awayTeamId: winnerId });
      }
    }
  };

  if (currentMatch.phase === "REPECHAJE") {
    const repMatches = getMatchesByPhase("REPECHAJE");
    const cuartosMatches = getMatchesByPhase("CUARTOS");
    const semiMatches = getMatchesByPhase("SEMIFINAL");

    const matchIdx = repMatches.findIndex(m => m.id === bracketMatchId);

    if (cuartosMatches.length > 0) {
      const cuartosIdx = Math.floor(matchIdx / 2);
      const isHome = matchIdx % 2 === 0;
      await placeWinnerInNextMatch(cuartosMatches, cuartosIdx, isHome);
    } else if (semiMatches.length > 0) {
      const semiIdx = Math.floor(matchIdx / 2);
      const isHome = matchIdx % 2 === 0;
      if (semiIdx < semiMatches.length) {
        const semi = semiMatches[semiIdx];
        if (semi.homeTeamId && !semi.awayTeamId) {
          await storage.updateBracketMatch(semi.id, { awayTeamId: winnerId });
        } else if (!semi.homeTeamId) {
          await placeWinnerInNextMatch(semiMatches, semiIdx, isHome);
        } else {
          await storage.updateBracketMatch(semi.id, { awayTeamId: winnerId });
        }
      }
    }
  } else if (currentMatch.phase === "CUARTOS") {
    const cuartosMatches = getMatchesByPhase("CUARTOS");
    const semiMatches = getMatchesByPhase("SEMIFINAL");

    const matchIdx = cuartosMatches.findIndex(m => m.id === bracketMatchId);

    if (semiMatches.length === 1) {
      const semi = semiMatches[0];
      if (!semi.homeTeamId) {
        await storage.updateBracketMatch(semi.id, { homeTeamId: winnerId });
      } else if (!semi.awayTeamId) {
        await storage.updateBracketMatch(semi.id, { awayTeamId: winnerId });
      }
    } else if (semiMatches.length >= 2) {
      const semiIdx = matchIdx < Math.ceil(cuartosMatches.length / 2) ? 0 : 1;
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
      if (finalMatch.homeTeamId && !finalMatch.awayTeamId) {
        await storage.updateBracketMatch(finalMatch.id, { awayTeamId: winnerId });
      } else if (!finalMatch.homeTeamId) {
        await storage.updateBracketMatch(finalMatch.id, { homeTeamId: winnerId });
      } else {
        await storage.updateBracketMatch(finalMatch.id, { awayTeamId: winnerId });
      }
    }
  }
}
