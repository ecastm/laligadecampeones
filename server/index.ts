import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { pool } from "./db-storage";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);
  
  try {
    await pool.query(`ALTER TABLE matches ALTER COLUMN home_team_id DROP NOT NULL`);
    await pool.query(`ALTER TABLE matches ALTER COLUMN away_team_id DROP NOT NULL`);
    console.log("Schema sync: matches columns verified as nullable");
  } catch (e) {
    console.log("Schema sync: columns already nullable or skipped");
  }

  try {
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30)`);
    console.log("Schema sync: users.phone column added");
  } catch (e) {
    console.log("Schema sync: users.phone already exists or skipped");
  }

  try {
    await pool.query(`ALTER TABLE fine_payments ADD COLUMN IF NOT EXISTS fine_id VARCHAR(255)`);
    console.log("Schema sync: fine_payments.fine_id column added");
  } catch (e) {
    console.log("Schema sync: fine_payments.fine_id already exists or skipped");
  }

  try {
    await pool.query(`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS max_players_per_team INTEGER`);
    console.log("Schema sync: tournaments.max_players_per_team column added");
  } catch (e) {
    console.log("Schema sync: tournaments.max_players_per_team already exists or skipped");
  }

  try {
    await pool.query(`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS registration_open BOOLEAN DEFAULT TRUE`);
    console.log("Schema sync: tournaments.registration_open column added");
  } catch (e) {
    console.log("Schema sync: tournaments.registration_open already exists or skipped");
  }

  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS match_substitutions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      match_id VARCHAR(255) NOT NULL,
      team_id VARCHAR(255) NOT NULL,
      player_out_id VARCHAR(255) NOT NULL,
      player_in_id VARCHAR(255) NOT NULL,
      minute INTEGER NOT NULL DEFAULT 0,
      reason VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    )`);
    console.log("Schema sync: match_substitutions table created or already exists");
  } catch (e) {
    console.log("Schema sync: match_substitutions table skipped:", e);
  }

  try {
    await pool.query(`ALTER TABLE matches ADD COLUMN IF NOT EXISTS division_id VARCHAR(255)`);
    console.log("Schema sync: matches.division_id column added");
  } catch (e) {
    console.log("Schema sync: matches.division_id already exists or skipped");
  }

  // Backfill: propagar division_id a partidos existentes con NULL
  // Prioridad: 1) equipo local, 2) equipo visitante, 3) torneo
  // Solo actualiza registros con division_id IS NULL → idempotente y seguro en producción
  try {
    const backfill = await pool.query(`
      UPDATE matches m
      SET division_id = COALESCE(
        (SELECT ht.division_id FROM teams ht WHERE ht.id = m.home_team_id AND ht.division_id IS NOT NULL),
        (SELECT at2.division_id FROM teams at2 WHERE at2.id = m.away_team_id AND at2.division_id IS NOT NULL),
        (SELECT t.division_id FROM tournaments t WHERE t.id = m.tournament_id AND t.division_id IS NOT NULL)
      )
      WHERE m.division_id IS NULL
    `);
    if (backfill.rowCount && backfill.rowCount > 0) {
      console.log(`Schema sync: backfilled division_id for ${backfill.rowCount} existing matches`);
    } else {
      console.log("Schema sync: no matches needed division_id backfill");
    }
  } catch (e) {
    console.log("Schema sync: division_id backfill skipped:", e);
  }

  try {
    await pool.query(`ALTER TABLE team_payments ALTER COLUMN paid_at DROP NOT NULL`);
    console.log("Schema sync: team_payments.paid_at made nullable");
  } catch (e) {
    console.log("Schema sync: team_payments.paid_at already nullable or skipped");
  }

  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      from_user_id VARCHAR(255) NOT NULL,
      to_user_id VARCHAR(255),
      subject VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      read_at TIMESTAMP
    )`);
    console.log("Schema sync: messages table created or already exists");
  } catch (e) {
    console.log("Schema sync: messages table skipped:", e);
  }

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
