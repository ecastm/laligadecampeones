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

### Technical Implementations
- **Frontend**: React, Vite, TypeScript, TailwindCSS, Shadcn UI.
- **Backend**: Node.js, Express, TypeScript.
- **Authentication**: JWT for token-based authentication and bcrypt for password hashing. Role-Based Access Control (RBAC) is implemented to manage user permissions (ADMIN, CAPITAN, ARBITRO, MARKETING).
- **Database Interaction**: Uses raw SQL queries via `pg` pool for PostgreSQL.
- **Validation**: Zod is used for schema validation across the application.
- **State Management**: QueryClient is used for efficient data fetching and caching on the frontend.
- **Image Generation**: Uses Canvas API for generating shareable match graphics and social media content with custom branding.

### Feature Specifications
- **User Roles**: ADMIN, CAPITAN, ARBITRO, MARKETING, each with specific permissions and dedicated dashboards.
- **Tournament Management**: Create, edit, finalize, and archive tournaments. Supports various tournament types (League, Knockout, Groups + Playoffs) and divisions (e.g., Primera División, Segunda División). Dynamic tournament stages (phases) can be defined per tournament via the `tournament_stages` table, replacing the old hardcoded enum. Matches reference stages via `stage_id`.
- **Automated Scheduling**: Implements a round-robin schedule generator using the circle method, handling odd numbers of teams and providing a preview before generation.
- **Match Management**: Tracking of match status (PROGRAMADO, EN_CURSO, JUGADO), result submission by referees, and event logging (goals, cards).
- **Player & Team Management**: CRUD operations for teams and players, with captains managing their own team's roster.
- **Financial Management**: Tracking of team payments (registration, fees), fine payments, and tournament expenses (referee fees, venue costs).
- **News & Content**: Management of news articles and a public photo gallery.
- **Social Media Content Generation**: An AI-powered wizard (utilizing GPT-4o with vision) for generating social media posts (copy, hashtags, branded images) from match photos.

### System Design Choices
- **Modular Structure**: The project is divided into `client/`, `server/`, and `shared/` directories for clear separation of concerns.
- **Database Storage**: Uses a `DatabaseStorage` service (`server/db-storage.ts`) for persistent data management.
- **API Endpoints**: A well-defined RESTful API with public, authenticated, and role-specific endpoints.
- **Profile Management**: Mandatory profile completion for captains and referees upon first access ensures necessary contact and identification details are captured.
- **Penalty System**: Automated fine generation based on red/yellow cards recorded during matches, with configurable amounts per tournament.
- **Tournament Stages**: Matches can be associated with specific stages (e.g., JORNADA, OCTAVOS, CUARTOS, FINAL) for better organization and display.

## External Dependencies
- **PostgreSQL (Neon)**: Relational database for all application data.
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