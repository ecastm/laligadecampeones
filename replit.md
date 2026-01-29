# Liga de Fútbol - Sistema de Gestión de Torneos

## Descripción
Aplicación web full-stack para organizar torneos de fútbol (liga) con autenticación JWT, roles RBAC y paneles de administración. Completamente en español y responsive.

## Stack Tecnológico
- **Frontend**: React + Vite + TypeScript + TailwindCSS + Shadcn UI
- **Backend**: Node.js + Express + TypeScript
- **Autenticación**: JWT + bcrypt
- **Almacenamiento**: In-memory storage (MemStorage)
- **Validación**: Zod

## Cómo Ejecutar
```bash
npm install
npm run dev
```
La aplicación estará disponible en el puerto 5000.

## Credenciales de Acceso (Datos Semilla)

### Administradores
- `admin@liga.com` / `admin123`
- `admin2@liga.com` / `admin123`
- `admin3@liga.com` / `admin123`

### Capitanes
- `capitan1@liga.com` / `capitan123` (Águilas FC)
- `capitan2@liga.com` / `capitan123` (Leones Unidos)
- `capitan3@liga.com` / `capitan123` (Tigres del Valle)
- `capitan4@liga.com` / `capitan123` (Dragones Rojos)

### Árbitros
- `arbitro1@liga.com` / `arbitro123`
- `arbitro2@liga.com` / `arbitro123`

## Roles y Permisos

### ADMIN (Administrador)
- Acceso total a toda la aplicación
- CRUD de usuarios, equipos, jugadores, partidos y torneo
- Puede corregir resultados

### CAPITAN (Capitán)
- Puede editar solo su equipo asignado
- Puede gestionar jugadores de su equipo (alta/edición/baja)
- Ver calendario de partidos de su equipo (solo lectura)

### ARBITRO (Árbitro)
- Ver calendario de partidos asignados
- Cargar resultados de partidos asignados
- Registrar eventos (goles, tarjetas amarillas/rojas)

## Estructura del Proyecto

```
├── client/                    # Frontend React
│   └── src/
│       ├── components/        # Componentes reutilizables
│       │   └── ui/           # Componentes Shadcn
│       ├── lib/              # Utilidades (auth, queryClient)
│       └── pages/            # Páginas de la aplicación
│           ├── admin/        # Panel de administrador
│           ├── captain/      # Panel de capitán
│           └── referee/      # Panel de árbitro
├── server/                   # Backend Express
│   ├── routes.ts            # API endpoints
│   ├── storage.ts           # Almacenamiento en memoria
│   ├── auth.ts              # Autenticación JWT
│   └── seed.ts              # Datos semilla
└── shared/                  # Esquemas compartidos
    └── schema.ts            # Tipos y validaciones
```

## API Endpoints

### Públicos
- `GET /api/tournaments/active` - Torneo activo
- `GET /api/tournaments/completed` - Torneos finalizados (historial)
- `GET /api/tournaments/:id` - Detalle de torneo específico
- `GET /api/home/schedule` - Calendario de partidos
- `GET /api/home/standings` - Tabla de posiciones
- `GET /api/home/results` - Resultados recientes
- `GET /api/home/teams` - Equipos del torneo
- `GET /api/home/news` - Noticias del torneo
- `GET /api/home/news/:id` - Detalle de noticia
- `GET /api/matches/:id` - Detalle de partido

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar nuevo usuario (rol CAPITAN por defecto)
- `GET /api/auth/me` - Usuario actual

### Admin (requiere rol ADMIN)
- `/api/admin/users` - CRUD usuarios
- `/api/admin/teams` - CRUD equipos (soporta ?tournamentId= para filtrar)
- `/api/admin/players` - CRUD jugadores
- `/api/admin/matches` - CRUD partidos
- `/api/admin/tournaments` - CRUD torneos
- `/api/admin/tournaments/:id/finish` - Finalizar torneo con campeón
- `/api/admin/news` - CRUD noticias
- `/api/admin/referees` - Gestión de perfiles de árbitros (ver, editar, eliminar)

### Capitán (requiere rol CAPITAN)
- `GET/PUT /api/captain/team` - Mi equipo
- `GET/POST/DELETE /api/captain/players` - Jugadores de mi equipo
- `GET /api/captain/matches` - Partidos de mi equipo

### Árbitro (requiere rol ARBITRO)
- `GET /api/referee/matches` - Mis partidos asignados
- `POST /api/referee/matches/:id/result` - Cargar resultado

## Funcionalidades Principales

### Página Principal (Pública)
- Calendario de partidos con filtros por jornada y equipo
- Tabla de posiciones (PJ, PG, PE, PP, GF, GC, DG, PTS)
- Resultados recientes
- Noticias del torneo (reseñas de partidos, blog informativo)
- Detalle de partidos con eventos

### Panel Admin
- Gestión completa de usuarios, equipos, jugadores y partidos
- **Catálogo de árbitros**: ver, editar y eliminar perfiles de árbitros registrados
- **Gestión de múltiples torneos**: crear, editar, finalizar y eliminar
- Al finalizar un torneo: guarda campeón, fecha fin y tabla de posiciones final
- Historial de torneos completados con tabla de posiciones archivada
- Gestión de noticias (crear, editar, eliminar reseñas de partidos)

### Panel Capitán
- Editar datos de su equipo
- Gestionar plantilla de jugadores
- Ver calendario de partidos

### Panel Árbitro
- **Perfil obligatorio**: Al primer acceso debe completar datos generales
- Ver partidos pendientes y completados
- Cargar resultados con marcador
- Registrar eventos (goles, tarjetas)
- Ver tabla de posiciones y resultados
- Gestionar perfil personal (nombre, identificación, teléfono, email, etc.)

## Cálculo de Posiciones
- Victoria: 3 puntos
- Empate: 1 punto
- Derrota: 0 puntos
- Ordenamiento: PTS > DG > GF

## Gestión de Torneos
- Los torneos tienen estados: ACTIVO o FINALIZADO
- Al crear un torneo se define: nombre, temporada, lugar y fecha de inicio
- Al finalizar un torneo:
  - Se selecciona el equipo campeón
  - Se guarda la tabla de posiciones final
  - Se registra la fecha de finalización
- Los torneos finalizados se muestran en el historial público (/historial)
- Cada torneo conserva su tabla de posiciones archivada para consulta futura

## Perfil del Árbitro
- Datos obligatorios: nombre completo, número de identificación, teléfono, email
- Datos opcionales: asociación/liga, años de experiencia, observaciones
- Estado: activo/inactivo
- El nombre del árbitro se muestra en el detalle del partido
- Trazabilidad: identifica quién registró cada resultado
