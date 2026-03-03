# Liga de Fútbol - Sistema de Gestión de Torneos

## Descripción
Aplicación web full-stack para organizar torneos de fútbol (liga) con autenticación JWT, roles RBAC y paneles de administración. Completamente en español y responsive.

## Stack Tecnológico
- **Frontend**: React + Vite + TypeScript + TailwindCSS + Shadcn UI
- **Backend**: Node.js + Express + TypeScript
- **Autenticación**: JWT + bcrypt
- **Base de datos**: PostgreSQL (Neon) con raw SQL via pg Pool
- **Almacenamiento**: DatabaseStorage (server/db-storage.ts) - persistente
- **IA**: OpenAI (Replit AI Integrations) - GPT-4o con visión
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
- `capitan1@liga.com` / `capitan123` (El Palo)
- `capitan2@liga.com` / `capitan123` (Fuengirola)
- `capitan3@liga.com` / `capitan123` (Millonarios)
- `capitan4@liga.com` / `capitan123` (Rejunte)

### Árbitros
- `arbitro1@liga.com` / `arbitro123`
- `arbitro2@liga.com` / `arbitro123`

### Marketing
- `marketing@liga.com` / `marketing123`

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

### MARKETING (Marketing)
- Acceso solo a Fotos/Contenido y Noticias
- Panel dedicado en /marketing/dashboard
- Puede crear y gestionar contenido para redes sociales

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
- `GET /api/site-settings` - Configuración del sitio (nombre, logo, contacto, redes)
- `GET /api/tournaments/active` - Torneo activo
- `GET /api/tournaments/completed` - Torneos finalizados (historial)
- `GET /api/tournaments/:id` - Detalle de torneo específico
- `GET /api/home/schedule` - Calendario de partidos
- `GET /api/home/standings` - Tabla de posiciones
- `GET /api/home/results` - Resultados recientes
- `GET /api/home/teams` - Equipos del torneo
- `GET /api/home/news` - Noticias del torneo
- `GET /api/home/news/:id` - Detalle de noticia
- `GET /api/home/gallery` - Galería de fotos pública (fotos de marketing)
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
- `/api/admin/tournaments/:id/generate-schedule` - Generar calendario round-robin automático
- `/api/admin/tournaments/:id/schedule-preview` - Vista previa del calendario
- `/api/admin/divisions` - CRUD divisiones
- `/api/admin/news` - CRUD noticias
- `/api/admin/referees` - Gestión de perfiles de árbitros (ver, editar, eliminar)
- `/api/admin/fines` - Gestión de multas (ver, actualizar estado)
- `/api/admin/payments` - Gestión de pagos de equipos
- `/api/admin/fine-payments` - Gestión de pagos de multas
- `/api/admin/expenses` - Gestión de gastos del torneo
- `/api/admin/marketing` - CRUD contenido multimedia (fotos y videos)
- `/api/admin/messages` - Gestión de mensajes de contacto (ver, actualizar estado, eliminar)
- `PUT /api/admin/site-settings` - Actualizar configuración del sitio (nombre, logo, contacto, redes)

### Público - Contacto
- `POST /api/contact` - Enviar mensaje de contacto (sin autenticación)

### Capitán (requiere rol CAPITAN)
- `GET/PUT /api/captain/team` - Mi equipo
- `GET/POST/DELETE /api/captain/players` - Jugadores de mi equipo
- `GET /api/captain/matches` - Partidos de mi equipo
- `GET/POST/PUT /api/captain/profile` - Perfil del capitán (obligatorio)

### Árbitro (requiere rol ARBITRO)
- `GET /api/referee/matches` - Mis partidos asignados
- `POST /api/referee/matches/:id/result` - Cargar resultado
- `POST /api/referee/matches/:id/start` - Iniciar partido (cambia estado a EN_CURSO)
- `POST /api/referee/matches/:id/finalize` - Finalizar partido (guarda marcador, genera multas)
- `GET/POST /api/referee/matches/:id/lineups` - Gestión de alineaciones
- `GET/POST /api/referee/matches/:id/evidence` - Gestión de evidencias (fotos, actas)

### Divisiones y Tipos de Torneo (Públicos)
- `GET /api/divisions` - Lista de divisiones (Primera, Segunda)
- `GET /api/divisions/:id` - Detalle de división
- `GET /api/tournament-types` - Tipos de torneo (Liga, Eliminación, Grupos)

## Funcionalidades Principales

### Página Principal - Landing Page Promocional (Pública)
- **Hero section**: Título promocional con CTAs para inscripción y solicitud de información
- **Estadísticas**: Equipos registrados, jugadores activos, partidos por temporada
- **Selector de División**: Botones para Primera y Segunda División con theming visual
- **Visor de Torneos**: Al seleccionar una división muestra:
  - Nombre del torneo y badge de división
  - Calendario de partidos con filtros por jornada y equipo
  - Tabla de posiciones (PJ, PG, PE, PP, GF, GC, DG, PTS)
  - Resultados recientes
  - Equipos participantes
- **Galería de Fotos**: Carrusel público con todas las fotos de marketing, lightbox para ver en grande, responsive (1/2/4 columnas), swipe en móvil
- **Secciones CTA**: "Inscribe Tu Equipo" y "Solicita Información" con datos de contacto
- **Footer**: Enlaces a historial, calendario e inicio de sesión

### Calendario Mensual (Público - /calendario)
- Vista tipo calendario mensual con todos los partidos programados
- Cada día muestra los partidos como chips clickeables con nombres abreviados
- Lista detallada de partidos del mes debajo del calendario
- Al seleccionar un partido se muestra:
  - Detalle con logos, marcador (si jugado), fecha, hora, cancha, jornada
  - Imagen generada con Canvas API (1080x1080) estilo Instagram
  - Botón para descargar la imagen como PNG
- La imagen incluye: logo Liga de Campeones, nombres de equipos, logos, "VS", fecha, hora, cancha, tema verde/oro

### API Adicional para Landing
- `GET /api/tournaments/active/all` - Todos los torneos activos (para selector de división)

### Panel Admin
- Gestión completa de usuarios, equipos, jugadores y partidos
- **Funcionalidad de árbitro integrada**: botón "Arbitrar" en partidos programados para cargar resultados, eventos, notas y fotos directamente desde el panel admin; botón "Detalles" en partidos jugados para ver resumen completo
- **Catálogo de árbitros**: ver, editar y eliminar perfiles de árbitros registrados
- **Gestión de múltiples torneos**: crear, editar, finalizar y eliminar
- Al finalizar un torneo: guarda campeón, fecha fin y tabla de posiciones final
- Historial de torneos completados con tabla de posiciones archivada
- Gestión de noticias (crear, editar, eliminar reseñas de partidos)
- **Generador de Contenido para Redes Sociales** (Marketing):
  - Wizard de 3 pasos: Fotos + Formato → Datos del partido + IA → Vista previa y guardado
  - **Paso 1**: Selector de formato (Post/Historia/Reel) + Galería con búsqueda/filtro por fechas, selección múltiple
  - **Paso 2**: Botón "Generar con IA" que analiza las fotos con GPT-4o (visión) y genera copy, hashtags y detecta equipos + campos manuales editables
  - **Paso 3**: Vista previa estilo Instagram (phone mockup), copy editable, hashtags editables, botón regenerar con IA
  - La IA usa Replit AI Integrations (sin API key propia, cargos a créditos Replit)
  - Endpoint: POST /api/ai/generate-content (requiere ADMIN o MARKETING)
  - Vista previa simula cómo se vería en Instagram con avatar, iconos y layout real
  - Botones: Descargar PNG, Guardar en Marketing, Copiar copy, Copiar hashtags, Copiar todo
  - Al guardar se sube la imagen generada y se registra como asset en Marketing
  - Copy completamente editable con indicador "Editado" y botones "IA" (regenerar con IA) y "Plantilla" (regenerar con plantilla)
  - Hashtags removibles individualmente + campo para agregar nuevos manualmente
  - Imagen generada con diseño verde/dorado de La Liga de Campeones
  - Si no se capturan datos de partido (equipos), la imagen solo muestra la foto con branding

### Panel Capitán
- **Perfil obligatorio**: Al primer acceso debe completar datos personales
- Editar datos de su equipo
- Gestionar plantilla de jugadores
- Ver calendario de partidos
- Gestionar perfil personal (nombre, identificación, teléfono, email, contacto emergencia)

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

## Perfil del Capitán
- Datos obligatorios: nombre completo, número de identificación, teléfono, email
- Datos opcionales: dirección, contacto de emergencia, teléfono de emergencia, observaciones
- Trazabilidad: identifica al capitán de cada equipo

## Divisiones (Nuevo)
- Sistema de divisiones con theming personalizado
- Divisiones predefinidas: Primera División, Segunda División
- Cada división tiene: nombre, descripción, tema visual (PRIMERA/SEGUNDA)
- Los torneos pueden asociarse a una división
- Los equipos pueden asociarse a una división (campo divisionId)

## Tipos de Torneo (Nuevo)
- Catálogo de formatos de torneo predefinidos:
  - **Liga (ROUND_ROBIN)**: Todos contra todos, soporta ida y vuelta
  - **Eliminación directa (KNOCKOUT)**: Llaves de eliminación
  - **Grupos + Playoffs (GROUPS_PLAYOFFS)**: Fase de grupos seguida de eliminatorias

## Generador de Calendario (Nuevo)
- Algoritmo del círculo (circle method) para generar calendario round-robin
- Soporta ida (una vuelta) o ida y vuelta (dos vueltas)
- Maneja automáticamente equipos impares (jornadas de descanso)
- API de vista previa para ver estadísticas antes de generar
- Al generar, elimina partidos anteriores del torneo

## Flujo del Árbitro (Nuevo)
- Estados del partido: PROGRAMADO → EN_CURSO → JUGADO
- El árbitro puede iniciar el partido (cambia a EN_CURSO)
- Al finalizar registra marcador final
- Gestión de alineaciones por equipo
- Subida de evidencias (fotos, documentos)
- Generación automática de multas por tarjetas

## Sistema de Multas (Nuevo)
- Multas generadas automáticamente al finalizar partido según tarjetas
- Configuración por torneo: monto por tarjeta amarilla, roja, roja directa
- Estados: PENDIENTE, PAGADA
- El capitán puede ver las multas de su equipo
- El admin puede gestionar todas las multas

## Sistema de Finanzas (Nuevo)
- **Pagos de equipos**: Registro de inscripción y cuotas
- **Pagos de multas**: Registro de pagos de multas
- **Gastos del torneo**: Registro de gastos (arbitraje, canchas, etc.)
- Todos los movimientos asociados a torneo y equipo

## Etapas de Torneo (Nuevo)
- Campo `stage` opcional en partidos para indicar la etapa del torneo
- Etapas disponibles: JORNADA, OCTAVOS, CUARTOS, SEMIFINAL, TERCER_LUGAR, FINAL
- Se selecciona al crear/editar un partido en el panel de admin
- Se muestra en todas las vistas públicas: calendario, homepage, detalle de partido
- Se incluye en la imagen VS generada automáticamente
- Si no se especifica etapa, se muestra "Jornada X" por defecto
- MatchStageLabels en shared/schema.ts contiene los nombres en español
