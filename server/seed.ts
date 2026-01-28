import { storage } from "./storage";

export async function seedDatabase() {
  console.log("\n==========================================");
  console.log("🌱 Iniciando seed de datos...");
  console.log("==========================================\n");

  // Create tournament
  const tournament = (storage as any).createTournament({
    name: "Torneo Demo 2026",
    seasonName: "Temporada Primavera 2026",
    active: true,
  });
  console.log("✅ Torneo creado:", tournament.name);

  // Create 3 admin users
  const admins = [
    { name: "Admin Principal", email: "admin@liga.com", password: "admin123", role: "ADMIN" as const },
    { name: "Admin Secundario", email: "admin2@liga.com", password: "admin123", role: "ADMIN" as const },
    { name: "Admin Soporte", email: "admin3@liga.com", password: "admin123", role: "ADMIN" as const },
  ];

  console.log("\n👤 Usuarios administradores creados:");
  for (const admin of admins) {
    await storage.createUser(admin);
    console.log(`   - ${admin.email} / ${admin.password}`);
  }

  // Create 4 teams
  const teamsData = [
    { name: "Águilas FC", colors: "Azul y Blanco", homeField: "Estadio Municipal" },
    { name: "Leones Unidos", colors: "Rojo y Negro", homeField: "Campo Norte" },
    { name: "Tigres del Valle", colors: "Amarillo y Negro", homeField: "Cancha Central" },
    { name: "Dragones Rojos", colors: "Rojo y Dorado", homeField: "Estadio Sur" },
  ];

  const teams: any[] = [];
  console.log("\n🏆 Equipos creados:");
  for (const teamData of teamsData) {
    const team = await storage.createTeam({ ...teamData, tournamentId: tournament.id });
    teams.push(team);
    console.log(`   - ${team.name}`);
  }

  // Create captains and referees
  const captainsData = [
    { name: "Carlos Mendoza", email: "capitan1@liga.com", password: "capitan123", role: "CAPITAN" as const, teamId: teams[0].id },
    { name: "Miguel Torres", email: "capitan2@liga.com", password: "capitan123", role: "CAPITAN" as const, teamId: teams[1].id },
    { name: "Andrés López", email: "capitan3@liga.com", password: "capitan123", role: "CAPITAN" as const, teamId: teams[2].id },
    { name: "Roberto Díaz", email: "capitan4@liga.com", password: "capitan123", role: "CAPITAN" as const, teamId: teams[3].id },
  ];

  console.log("\n👥 Capitanes creados:");
  for (const captain of captainsData) {
    const user = await storage.createUser(captain);
    await storage.updateTeam(captain.teamId, { captainUserId: user.id });
    console.log(`   - ${captain.email} / ${captain.password} (${teams.find(t => t.id === captain.teamId)?.name})`);
  }

  const refereesData = [
    { name: "Juan Pérez", email: "arbitro1@liga.com", password: "arbitro123", role: "ARBITRO" as const },
    { name: "Pedro Gómez", email: "arbitro2@liga.com", password: "arbitro123", role: "ARBITRO" as const },
  ];

  const referees: any[] = [];
  console.log("\n⚖️ Árbitros creados:");
  for (const ref of refereesData) {
    const user = await storage.createUser(ref);
    referees.push(user);
    console.log(`   - ${ref.email} / ${ref.password}`);
  }

  // Create players for each team
  const positions = ["Portero", "Defensa", "Mediocampista", "Delantero"];
  const firstNames = ["Juan", "Pedro", "Luis", "Carlos", "Miguel", "Andrés", "Jorge", "Roberto", "Fernando", "Diego", "Pablo"];
  const lastNames = ["García", "Martínez", "López", "Rodríguez", "Hernández", "González", "Pérez", "Sánchez", "Ramírez", "Torres", "Flores"];

  console.log("\n⚽ Jugadores creados:");
  for (const team of teams) {
    for (let i = 1; i <= 11; i++) {
      await storage.createPlayer({
        teamId: team.id,
        firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
        lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
        jerseyNumber: i,
        position: positions[Math.floor(Math.random() * positions.length)],
        active: true,
      });
    }
    console.log(`   - ${team.name}: 11 jugadores`);
  }

  // Create 6 matches
  const matchesData = [
    { round: 1, home: 0, away: 1, days: -7, referee: 0 },
    { round: 1, home: 2, away: 3, days: -7, referee: 1 },
    { round: 2, home: 0, away: 2, days: -3, referee: 0 },
    { round: 2, home: 1, away: 3, days: -3, referee: 1 },
    { round: 3, home: 0, away: 3, days: 3, referee: 0 },
    { round: 3, home: 1, away: 2, days: 3, referee: 1 },
  ];

  console.log("\n📅 Partidos creados:");
  for (const m of matchesData) {
    const date = new Date();
    date.setDate(date.getDate() + m.days);
    date.setHours(15, 0, 0, 0);

    const match = await storage.createMatch({
      tournamentId: tournament.id,
      roundNumber: m.round,
      dateTime: date.toISOString(),
      field: teams[m.home].homeField,
      homeTeamId: teams[m.home].id,
      awayTeamId: teams[m.away].id,
      refereeUserId: referees[m.referee].id,
      status: m.days < 0 ? "PROGRAMADO" : "PROGRAMADO",
    });
    console.log(`   - J${m.round}: ${teams[m.home].name} vs ${teams[m.away].name} (${m.days < 0 ? "Pasado" : "Próximo"})`);
  }

  console.log("\n==========================================");
  console.log("✅ Seed completado exitosamente");
  console.log("==========================================\n");
}
