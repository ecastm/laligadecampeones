import { storage } from "./storage";
import { pool } from "./db-storage";

async function clearAllTables() {
  console.log("FORCE_RESEED: Limpiando todas las tablas...");
  const tables = [
    "match_evidence", "match_lineups", "match_events", "fines", "fine_payments",
    "team_payments", "expenses", "marketing_media", "contact_messages",
    "news", "matches", "players", "captain_profiles", "referee_profiles",
    "teams", "users", "tournaments", "tournament_types", "divisions"
  ];
  for (const table of tables) {
    await pool.query(`DELETE FROM ${table}`);
    console.log(`   - Tabla ${table} limpiada`);
  }
  console.log("Todas las tablas limpiadas.\n");
}

export async function seedDatabase() {
  console.log("\n==========================================");
  console.log("Iniciando seed de datos...");
  console.log("==========================================\n");

  const forceReseed = process.env.FORCE_RESEED === "true";

  if (forceReseed) {
    console.log("FORCE_RESEED activado - limpiando y recreando datos...");
    await clearAllTables();
  } else {
    const existingUsers = await storage.getUsers();
    if (existingUsers.length > 0) {
      console.log("La base de datos ya tiene datos, omitiendo seed.");
      return;
    }
  }

  const existingDivisions = await storage.getDivisions();
  let primeraDivision = existingDivisions.find(d => d.theme === "PRIMERA");
  let segundaDivision = existingDivisions.find(d => d.theme === "SEGUNDA");

  if (!primeraDivision) {
    primeraDivision = await storage.createDivision({ name: "Primera División", theme: "PRIMERA", description: "Máxima categoría" });
  }
  if (!segundaDivision) {
    segundaDivision = await storage.createDivision({ name: "Segunda División", theme: "SEGUNDA", description: "Segunda categoría" });
  }
  console.log("Divisiones creadas/verificadas");

  const existingTypes = await storage.getTournamentTypes();
  if (existingTypes.length === 0) {
    await storage.createTournamentType({ name: "Liga (Todos contra todos)", algorithm: "ROUND_ROBIN", description: "Todos los equipos juegan entre sí. El campeón es quien acumula más puntos.", supportsDoubleRound: true });
    await storage.createTournamentType({ name: "Eliminación directa", algorithm: "KNOCKOUT", description: "Llaves directas, el perdedor queda eliminado.", supportsDoubleRound: false });
    await storage.createTournamentType({ name: "Grupos + Playoffs", algorithm: "GROUPS_PLAYOFFS", description: "Fase de grupos seguida de eliminatorias.", supportsDoubleRound: false });
  }
  console.log("Tipos de torneo creados/verificados");

  const tournament = await storage.createTournament({
    name: "Liga de Campeones 2026",
    seasonName: "Temporada Primavera 2026",
    location: "Fuengirola",
    startDate: new Date().toISOString(),
    status: "ACTIVO",
    divisionId: primeraDivision?.id,
  });
  console.log("Torneo creado:", tournament.name);

  const admins = [
    { name: "Admin Principal", email: "admin@liga.com", password: "admin123", role: "ADMIN" as const },
    { name: "Admin Secundario", email: "admin2@liga.com", password: "admin123", role: "ADMIN" as const },
    { name: "Admin Soporte", email: "admin3@liga.com", password: "admin123", role: "ADMIN" as const },
  ];

  console.log("\nUsuarios administradores creados:");
  for (const admin of admins) {
    await storage.createUser(admin);
    console.log(`   - ${admin.email} / ${admin.password}`);
  }

  const teamsData = [
    { name: "El Palo", colors: "Azul y Blanco", homeField: "Campo El Palo", coachName: "" },
    { name: "Fuengirola", colors: "Verde y Blanco", homeField: "Campo Fuengirola", coachName: "" },
    { name: "Millonarios", colors: "Azul y Blanco", homeField: "Campo Millonarios", coachName: "" },
    { name: "Rejunte", colors: "Rojo y Blanco", homeField: "Campo Rejunte", coachName: "" },
  ];

  const teams: any[] = [];
  console.log("\nEquipos creados:");
  for (const teamData of teamsData) {
    const team = await storage.createTeam({ ...teamData, tournamentId: tournament.id });
    teams.push(team);
    console.log(`   - ${team.name}`);
  }

  const captainsData = [
    { name: "Capitán El Palo", email: "capitan1@liga.com", password: "capitan123", role: "CAPITAN" as const, teamId: teams[0].id },
    { name: "Capitán Fuengirola", email: "capitan2@liga.com", password: "capitan123", role: "CAPITAN" as const, teamId: teams[1].id },
    { name: "Capitán Millonarios", email: "capitan3@liga.com", password: "capitan123", role: "CAPITAN" as const, teamId: teams[2].id },
    { name: "Capitán Rejunte", email: "capitan4@liga.com", password: "capitan123", role: "CAPITAN" as const, teamId: teams[3].id },
  ];

  console.log("\nCapitanes creados:");
  for (const captain of captainsData) {
    const user = await storage.createUser(captain);
    await storage.updateTeam(captain.teamId, { captainUserId: user.id });
    console.log(`   - ${captain.email} / ${captain.password} (${teams.find(t => t.id === captain.teamId)?.name})`);
  }

  const refereesData = [
    { name: "Juan Pérez", email: "arbitro1@liga.com", password: "arbitro123", role: "ARBITRO" as const },
    { name: "Pedro Gómez", email: "arbitro2@liga.com", password: "arbitro123", role: "ARBITRO" as const },
  ];

  console.log("\nÁrbitros creados:");
  for (const ref of refereesData) {
    await storage.createUser(ref);
    console.log(`   - ${ref.email} / ${ref.password}`);
  }

  const match = await storage.createMatch({
    tournamentId: tournament.id,
    roundNumber: 1,
    dateTime: "2026-02-22T20:00",
    field: "Central",
    homeTeamId: teams[1].id,
    awayTeamId: teams[2].id,
    status: "PROGRAMADO",
  });
  console.log(`\nPartido creado: ${teams[1].name} vs ${teams[2].name}`);

  console.log("\n==========================================");
  console.log("Seed completado exitosamente");
  console.log("==========================================\n");
}
