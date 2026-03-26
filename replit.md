# Liga de Fútbol - Sistema de Gestión de Torneos

## Overview
This is a full-stack web application designed for organizing football (soccer) league tournaments. It features robust user authentication with JWT and RBAC, comprehensive administration panels, and a fully responsive design. The application aims to streamline tournament management for organizers, enhance player and team engagement, and provide a rich experience for fans. Key capabilities include real-time score updates, team and player management, and automated scheduling. The business vision is to become the leading platform for amateur and semi-professional football league management, offering a seamless and intuitive experience for all stakeholders.

## User Preferences
I want the development to be iterative. Please ask before making major changes. All communication and explanations should be in Spanish.

## System Architecture
The application follows a modern full-stack architecture.

### UI/UX Decisions
The design adheres to a specific brand palette: 40% Black, 40% Gold, 15% Green, 5% Silver.
- **Black (#0D0D0D)**: Primary backgrounds, headers, footers.
- **Gold (#C6A052)**: Buttons, titles, active icons, highlighted borders (`--primary`).
- **Green (#0B6B3A)**: Sports indicators, badges, positive states (`--sport-green / --secondary`).
- **Silver (#C0C0C0)**: Dividers, secondary icons, subtle details (`--silver`).
CSS variables are centralized in `client/src/index.css`, with Tailwind colors extended in `tailwind.config.ts`.
Canvas image generators (for match graphics, social media posts) use this black/gold palette. The UI is built using Shadcn UI components for a consistent and modern look. The application is entirely in Spanish and is fully responsive.
- **Numeric Input Fields**: All numeric fields for amounts/montos (payments, fines, expenses, points, scores, counts) use `type="text"` with `inputMode="decimal"` or `inputMode="numeric"` to avoid spinner arrows. This provides a cleaner UX for free numeric entry without up/down controls.

### Technical Implementations
- **Frontend**: React, Vite, TypeScript, TailwindCSS, Shadcn UI.
- **Backend**: Node.js, Express, TypeScript.
- **Authentication**: JWT for token-based authentication and bcrypt for password hashing. Role-Based Access Control (RBAC) is implemented to manage user permissions (ADMIN, CAPITAN, ARBITRO, MARKETING).
- **Database Interaction**: Uses raw SQL queries via `pg` pool for PostgreSQL. Public endpoints use `getAllMatchesWithTeams()` with JOINs for optimized batch loading (avoids N+1 queries). Development and production use separate PostgreSQL databases (dev: heliumdb, prod: neondb). Data was synced from production to development on 2026-03-06. The seed (`server/seed.ts`) is permanently disabled — `seedDatabase()` is no longer called at startup. Schema migrations are applied via `ALTER TABLE` statements in `server/index.ts` at server startup to keep both databases in sync.
- **Validation**: Zod is used for schema validation across the application.
- **State Management**: QueryClient is used for efficient data fetching and caching on the frontend.
- **Image Generation**: Uses Canvas API for generating shareable match graphics and social media content with custom branding.

### Feature Specifications
- **User Roles**: ADMIN, CAPITAN, ARBITRO, MARKETING, each with specific permissions and dedicated dashboards.
- **Tournament Management**: Create, edit, finalize, and archive tournaments. Supports various tournament types (League, Knockout, Groups + Playoffs) and divisions (e.g., Primera División, Segunda División). Dynamic tournament stages (phases) can be defined per tournament via the `tournament_stages` table, replacing the old hardcoded enum. Matches reference stages via `stage_id`.
- **Automated Scheduling**: Implements a round-robin schedule generator using the circle method, handling odd numbers of teams and providing a preview before generation.
- **Match Management**: Tracking of match status (PROGRAMADO, EN_CURSO, JUGADO), result submission by referees, event logging (goals, cards), and player attendance tracking (pase de lista) by referees.
- **Player & Team Management**: CRUD operations for teams and players, with captains managing their own team's roster. Identification documents support multiple types: DNI, NIE, and Pasaporte (stored as `identification_type` in captain_profiles, referee_profiles, and players tables).
- **Financial Management**: Tracking of team payments (registration, fees), fine payments, tournament expenses, and automated fines for no-show teams (€15). Fines support types: YELLOW, RED, RED_DIRECT, NO_PRESENTADO. Currency displayed in euros (€).
- **News & Content**: Management of news articles and a public photo gallery.
- **Social Media Content Generation**: An AI-powered wizard (utilizing GPT-4o with vision) for generating social media posts (copy, hashtags, branded images) from match photos.
- **Email Notifications**: SMTP2GO-powered email service (`server/email-service.ts`) sends branded HTML emails. Currently supports: welcome email on captain profile creation, fine notifications, and match result notifications. Emails use the brand palette (black/gold/green). Sender: info@laligadecampeones.es.

### System Design Choices
- **Modular Structure**: The project is divided into `client/`, `server/`, and `shared/` directories for clear separation of concerns.
- **Database Storage**: Uses a `DatabaseStorage` service (`server/db-storage.ts`) for persistent data management.
- **API Endpoints**: A well-defined RESTful API with public, authenticated, and role-specific endpoints. Player edit routes: `PUT /api/admin/players/:id` and `PUT /api/captain/players/:id`.
- **Transactional Integrity**: Match result submission (`/result`) and finalization (`/finalize`) use PostgreSQL transactions (BEGIN/COMMIT/ROLLBACK). Score, events, evidence, fines, and suspensions are saved atomically — if any step fails, everything rolls back. Concurrent submissions are prevented via `WHERE status != 'JUGADO'` guards.
- **Upload-Safe Forms**: All forms with `ImageUpload` (admin teams, admin players, admin settings, captain team, captain players) disable the submit button while images are uploading via `onUploadingChange` callback. Upload state is reset on dialog close to prevent stuck states. In `admin/teams.tsx`, team logo and player photo uploads use separate state variables to avoid cross-form interference.
- **Server-Side Upload Proxy**: File uploads use `POST /api/uploads/direct` (authenticated, multer memoryStorage, 10MB limit, MIME allowlist). The client sends files via XHR FormData to our server, which uploads to GCS server-side — avoiding CORS issues in production. The old presigned URL flow (`/api/uploads/request-url` + browser PUT to GCS) is kept for backward compatibility but the primary `useUpload.uploadFile()` hook uses the direct proxy.
- **Profile Management**: Mandatory profile completion for captains and referees upon first access ensures necessary contact and identification details are captured.
- **Penalty System**: Automated fine generation based on red/yellow cards recorded during matches, with configurable amounts per tournament. Red cards (RED, RED_DIRECT) automatically generate a 1-match suspension (`player_suspensions` table) for the offending player. Suspensions are decremented when the team plays their next match. Suspended players appear marked as "SANCIONADO" in the referee's attendance list and are defaulted to absent.
- **Suspension Tracking**: Admin can view all suspensions (active and completed) in the Finanzas > Sanciones tab. Shows player name, team, reason, matches remaining, and status.
- **Tournament Stages**: Matches can be associated with specific stages (e.g., JORNADA, OCTAVOS, CUARTOS, FINAL) for better organization and display.
- **Competition Rules System**: Configurable competition rules per category (division). Tables: `competition_rules`, `competition_seasons`, `standings_entries`, `division_movements`, `bracket_matches`. Supports two format types: `LEAGUE_DIVISIONS` (liga con ascensos/descensos) and `TOURNEY_PLUS30` (liga + eliminatorias). Engines: `server/standings-engine.ts` (recalculates standings with configurable points), `server/bracket-engine.ts` (generates knockout bracket from standings). Admin UI in "Competición" sidebar section with tabs for Rules, Seasons, Standings, and Bracket (+30). API endpoints under `/api/admin/competition-rules/*`, `/api/admin/seasons/*`, `/api/admin/bracket-matches/*`. Public endpoints: `/api/seasons/:id/standings` and `/api/seasons/:id/bracket`.
- **Auto-Recalculation**: When a match is finalized (`/api/referee/matches/:id/finalize`), standings are automatically recalculated for any active season linked to that tournament. The recalculation uses PostgreSQL transactions (BEGIN/COMMIT/ROLLBACK) with a unique constraint on `(season_id, team_id)` to prevent race conditions. Public endpoints (`/api/home/standings`, `/api/home/scorers`, `/api/home/results`) also read directly from match data so they always reflect the latest state.
- **Match Lineups & Substitutions**: Referees can manage lineups (starting XI selection per team) and register substitutions (player out, player in, minute) for each match directly from the pending matches view. Data stored in `match_lineups` (playerIds JSONB) and `match_substitutions` (separate rows per substitution). API endpoints: `GET/POST /api/referee/matches/:id/lineups`, `GET/POST/DELETE /api/referee/matches/:id/substitutions`. UI: `LineupManagerDialog` in `client/src/pages/referee/dashboard.tsx`.
- **Historical Tournament Data**: Admin can view data from both active and finalized tournaments. Tournament selector (dropdown) appears in team management and other admin modules, allowing filtering by any tournament. Finalized tournaments are marked as read-only — creation/editing buttons are disabled with visual indicators.
- **PWA Support**: The app is installable as a Progressive Web App on mobile devices. `client/public/manifest.json` and `client/public/sw.js` provide the manifest and a minimal service worker. The install banner (`client/src/components/pwa-install-banner.tsx`) is rendered only in the Dashboard (post-login) and only on mobile. On Android, it uses the native `beforeinstallprompt` event; on iOS or when the prompt is unavailable, it shows manual "Add to Home Screen" instructions. Dismissals are tracked per-user in localStorage (`pwa_dismiss_count_{email}`) with a max of 4 — after the 4th dismissal, the banner never shows again. `sw.js` and `manifest.json` are excluded from long-term caching in `server/static.ts`.

## External Dependencies
- **PostgreSQL (Neon)**: Relational database for all application data.
- **SMTP2GO**: Email delivery service via REST API. API Key stored in `SMTP2GO_API_KEY` env var, sender in `SMTP2GO_SENDER_EMAIL`.
- **OpenAI (Replit AI Integrations)**: Utilizes GPT-4o with vision for AI-driven content generation (social media posts).
- **Vite**: Frontend build tool.
- **React**: Frontend library for building user interfaces.
- **TypeScript**: Superset of JavaScript for type safety.
- **TailwindCSS**: Utility-first CSS framework for styling.
- **Shadcn UI**: React component library built with Tailwind CSS.
- **Node.js**: JavaScript runtime for the backend.
- **Express**: Web framework for Node.js.
- **JWT (jsonwebtoken)**: For creating and verifying authentication tokens.
- **bcrypt**: For hashing passwords securely.
- **Zod**: For schema validation.
- **pg (node-postgres)**: PostgreSQL client for Node.js.