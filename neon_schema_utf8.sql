--
-- PostgreSQL database dump
--

\restrict lejo8rTRtsmfvF7zeC7PwX1YuLpgMrB1Go8RdRvSSnTAM7KL2l1MvOjigsnUlwo

-- Dumped from database version 16.12 (ed61a14)
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: _system; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA _system;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: replit_database_migrations_v1; Type: TABLE; Schema: _system; Owner: -
--

CREATE TABLE _system.replit_database_migrations_v1 (
    id bigint NOT NULL,
    build_id text NOT NULL,
    deployment_id text NOT NULL,
    statement_count bigint NOT NULL,
    applied_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: replit_database_migrations_v1_id_seq; Type: SEQUENCE; Schema: _system; Owner: -
--

CREATE SEQUENCE _system.replit_database_migrations_v1_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: replit_database_migrations_v1_id_seq; Type: SEQUENCE OWNED BY; Schema: _system; Owner: -
--

ALTER SEQUENCE _system.replit_database_migrations_v1_id_seq OWNED BY _system.replit_database_migrations_v1.id;


--
-- Name: bracket_matches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bracket_matches (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    season_id text NOT NULL,
    tournament_id text NOT NULL,
    phase text NOT NULL,
    match_order integer DEFAULT 1 NOT NULL,
    home_team_id text,
    away_team_id text,
    home_score integer,
    away_score integer,
    winner_id text,
    status text DEFAULT 'PENDIENTE'::text NOT NULL,
    match_id text,
    seed text,
    created_at text DEFAULT now() NOT NULL
);


--
-- Name: captain_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.captain_profiles (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    full_name text NOT NULL,
    identification_number text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    address text,
    emergency_contact text,
    emergency_phone text,
    observations text,
    created_at text DEFAULT now() NOT NULL,
    updated_at text DEFAULT now() NOT NULL,
    identification_type text DEFAULT 'DNI'::text,
    division_id text
);


--
-- Name: competition_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.competition_rules (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    category_id text NOT NULL,
    format_type text NOT NULL,
    points_win integer DEFAULT 3 NOT NULL,
    points_draw integer DEFAULT 1 NOT NULL,
    points_loss integer DEFAULT 0 NOT NULL,
    round_robin text DEFAULT 'double'::text NOT NULL,
    teams_per_division integer DEFAULT 10 NOT NULL,
    promotion_count integer,
    relegation_count integer,
    federated_limit integer DEFAULT 3 NOT NULL,
    plus30_rules jsonb,
    rules_version integer DEFAULT 1 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at text DEFAULT now() NOT NULL,
    updated_at text DEFAULT now() NOT NULL
);


--
-- Name: competition_seasons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.competition_seasons (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    category_id text NOT NULL,
    tournament_id text,
    rules_id text NOT NULL,
    rules_version integer NOT NULL,
    name text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    created_at text DEFAULT now() NOT NULL,
    updated_at text DEFAULT now() NOT NULL
);


--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_messages (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    contact_name text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    comments text NOT NULL,
    status text DEFAULT 'NUEVO'::text NOT NULL,
    created_at text DEFAULT now() NOT NULL
);


--
-- Name: division_movements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.division_movements (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    season_id text NOT NULL,
    team_id text NOT NULL,
    team_name text NOT NULL,
    from_division text NOT NULL,
    to_division text NOT NULL,
    movement_type text NOT NULL,
    created_at text DEFAULT now() NOT NULL
);


--
-- Name: divisions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.divisions (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    theme text NOT NULL,
    description text,
    created_at text DEFAULT now() NOT NULL
);


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expenses (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    tournament_id text NOT NULL,
    concept text NOT NULL,
    amount real NOT NULL,
    expense_at text NOT NULL,
    notes text,
    receipt_url text,
    created_at text DEFAULT now() NOT NULL
);


--
-- Name: fine_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fine_payments (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    tournament_id text NOT NULL,
    team_id text NOT NULL,
    amount real NOT NULL,
    notes text,
    paid_at text NOT NULL,
    created_at text DEFAULT now() NOT NULL,
    fine_id character varying(255)
);


--
-- Name: fines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fines (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    tournament_id text NOT NULL,
    match_id text NOT NULL,
    match_event_id text,
    team_id text NOT NULL,
    player_id text,
    card_type text NOT NULL,
    amount real NOT NULL,
    status text DEFAULT 'PENDIENTE'::text NOT NULL,
    paid_amount real,
    paid_at text,
    created_at text DEFAULT now() NOT NULL
);


--
-- Name: marketing_media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marketing_media (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    type text NOT NULL,
    url text NOT NULL,
    thumbnail_url text,
    tournament_id text,
    created_at text DEFAULT now() NOT NULL
);


--
-- Name: match_attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.match_attendance (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    match_id text NOT NULL,
    team_id text NOT NULL,
    player_id text NOT NULL,
    present boolean DEFAULT false NOT NULL,
    created_at text DEFAULT now() NOT NULL
);


--
-- Name: match_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.match_events (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    match_id text NOT NULL,
    type text NOT NULL,
    minute integer NOT NULL,
    team_id text NOT NULL,
    player_id text NOT NULL,
    related_player_id text,
    notes text
);


--
-- Name: match_evidence; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.match_evidence (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    match_id text NOT NULL,
    event_id text,
    type text NOT NULL,
    url text NOT NULL,
    transcript text,
    created_at text DEFAULT now() NOT NULL
);


--
-- Name: match_lineups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.match_lineups (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    match_id text NOT NULL,
    team_id text NOT NULL,
    player_ids jsonb NOT NULL,
    created_at text DEFAULT now() NOT NULL
);


--
-- Name: match_substitutions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.match_substitutions (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    match_id text NOT NULL,
    team_id text NOT NULL,
    player_out_id text,
    player_in_id text,
    minute integer,
    reason character varying(255),
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: matches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.matches (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    tournament_id text NOT NULL,
    round_number integer NOT NULL,
    date_time text NOT NULL,
    field text NOT NULL,
    home_team_id text,
    away_team_id text,
    referee_user_id text,
    status text DEFAULT 'PROGRAMADO'::text NOT NULL,
    home_score integer,
    away_score integer,
    vs_image_url text,
    stage text,
    referee_notes text,
    stage_id text,
    division_id character varying(255)
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    from_user_id character varying(255) NOT NULL,
    to_user_id character varying(255),
    subject character varying(255) NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    read_at timestamp without time zone
);


--
-- Name: news; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.news (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    tournament_id text NOT NULL,
    match_id text,
    title text NOT NULL,
    content text NOT NULL,
    image_url text,
    author_id text NOT NULL,
    created_at text DEFAULT now() NOT NULL,
    updated_at text DEFAULT now() NOT NULL
);


--
-- Name: player_suspensions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.player_suspensions (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    tournament_id text NOT NULL,
    player_id text NOT NULL,
    team_id text NOT NULL,
    match_id text NOT NULL,
    match_event_id text,
    reason text NOT NULL,
    matches_remaining integer DEFAULT 1 NOT NULL,
    status text DEFAULT 'ACTIVO'::text NOT NULL,
    created_at text DEFAULT now() NOT NULL
);


--
-- Name: players; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.players (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    team_id text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    jersey_number integer NOT NULL,
    "position" text,
    identification_id text,
    photo_urls text[],
    is_federated boolean,
    federation_id text,
    active boolean DEFAULT true NOT NULL,
    identification_type text DEFAULT 'DNI'::text
);


--
-- Name: referee_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.referee_profiles (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    full_name text NOT NULL,
    identification_number text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    association text,
    years_of_experience integer,
    observations text,
    status text DEFAULT 'ACTIVO'::text NOT NULL,
    created_at text DEFAULT now() NOT NULL,
    updated_at text DEFAULT now() NOT NULL,
    identification_type text DEFAULT 'DNI'::text
);


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    league_name text DEFAULT 'La Liga de Campeones'::text NOT NULL,
    logo_url text,
    phone text,
    email text,
    address text,
    instagram_url text,
    facebook_url text,
    whatsapp_number text,
    updated_at text DEFAULT now() NOT NULL
);


--
-- Name: standings_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.standings_entries (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    season_id text NOT NULL,
    tournament_id text NOT NULL,
    team_id text NOT NULL,
    division text,
    played integer DEFAULT 0 NOT NULL,
    won integer DEFAULT 0 NOT NULL,
    drawn integer DEFAULT 0 NOT NULL,
    lost integer DEFAULT 0 NOT NULL,
    goals_for integer DEFAULT 0 NOT NULL,
    goals_against integer DEFAULT 0 NOT NULL,
    goal_difference integer DEFAULT 0 NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    updated_at text DEFAULT now() NOT NULL
);


--
-- Name: team_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_payments (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    tournament_id text NOT NULL,
    team_id text NOT NULL,
    amount real NOT NULL,
    method text,
    notes text,
    paid_at text NOT NULL,
    created_at text DEFAULT now() NOT NULL
);


--
-- Name: teams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teams (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    tournament_id text NOT NULL,
    division_id text,
    name text NOT NULL,
    colors text NOT NULL,
    home_field text NOT NULL,
    logo_url text,
    captain_user_id text,
    coach_name text,
    instagram_url text
);


--
-- Name: tournament_stages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tournament_stages (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    tournament_id text NOT NULL,
    name text NOT NULL,
    sort_order integer DEFAULT 1 NOT NULL,
    stage_type text
);


--
-- Name: tournament_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tournament_types (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    algorithm text NOT NULL,
    description text NOT NULL,
    supports_double_round boolean DEFAULT false NOT NULL
);


--
-- Name: tournaments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tournaments (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    division_id text,
    tournament_type_id text,
    name text NOT NULL,
    season_name text NOT NULL,
    location text NOT NULL,
    start_date text NOT NULL,
    end_date text,
    status text DEFAULT 'ACTIVO'::text NOT NULL,
    champion_team_id text,
    champion_team_name text,
    final_standings jsonb,
    fee_per_team real,
    fine_yellow real,
    fine_red real,
    fine_red_direct real,
    max_federated_players integer,
    double_round boolean,
    schedule_generated boolean,
    created_at text DEFAULT now() NOT NULL,
    max_players_per_team integer,
    registration_open boolean DEFAULT true
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying(255) DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role text NOT NULL,
    team_id text,
    status text DEFAULT 'ACTIVO'::text NOT NULL,
    created_at text DEFAULT now() NOT NULL,
    phone character varying(30)
);


--
-- Name: replit_database_migrations_v1 id; Type: DEFAULT; Schema: _system; Owner: -
--

ALTER TABLE ONLY _system.replit_database_migrations_v1 ALTER COLUMN id SET DEFAULT nextval('_system.replit_database_migrations_v1_id_seq'::regclass);


--
-- Name: replit_database_migrations_v1 replit_database_migrations_v1_pkey; Type: CONSTRAINT; Schema: _system; Owner: -
--

ALTER TABLE ONLY _system.replit_database_migrations_v1
    ADD CONSTRAINT replit_database_migrations_v1_pkey PRIMARY KEY (id);


--
-- Name: bracket_matches bracket_matches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bracket_matches
    ADD CONSTRAINT bracket_matches_pkey PRIMARY KEY (id);


--
-- Name: captain_profiles captain_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.captain_profiles
    ADD CONSTRAINT captain_profiles_pkey PRIMARY KEY (id);


--
-- Name: competition_rules competition_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.competition_rules
    ADD CONSTRAINT competition_rules_pkey PRIMARY KEY (id);


--
-- Name: competition_seasons competition_seasons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.competition_seasons
    ADD CONSTRAINT competition_seasons_pkey PRIMARY KEY (id);


--
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);


--
-- Name: division_movements division_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.division_movements
    ADD CONSTRAINT division_movements_pkey PRIMARY KEY (id);


--
-- Name: divisions divisions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.divisions
    ADD CONSTRAINT divisions_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: fine_payments fine_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fine_payments
    ADD CONSTRAINT fine_payments_pkey PRIMARY KEY (id);


--
-- Name: fines fines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fines
    ADD CONSTRAINT fines_pkey PRIMARY KEY (id);


--
-- Name: marketing_media marketing_media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketing_media
    ADD CONSTRAINT marketing_media_pkey PRIMARY KEY (id);


--
-- Name: match_attendance match_attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_attendance
    ADD CONSTRAINT match_attendance_pkey PRIMARY KEY (id);


--
-- Name: match_events match_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_events
    ADD CONSTRAINT match_events_pkey PRIMARY KEY (id);


--
-- Name: match_evidence match_evidence_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_evidence
    ADD CONSTRAINT match_evidence_pkey PRIMARY KEY (id);


--
-- Name: match_lineups match_lineups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_lineups
    ADD CONSTRAINT match_lineups_pkey PRIMARY KEY (id);


--
-- Name: match_substitutions match_substitutions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_substitutions
    ADD CONSTRAINT match_substitutions_pkey PRIMARY KEY (id);


--
-- Name: matches matches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: news news_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_pkey PRIMARY KEY (id);


--
-- Name: player_suspensions player_suspensions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_suspensions
    ADD CONSTRAINT player_suspensions_pkey PRIMARY KEY (id);


--
-- Name: players players_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_pkey PRIMARY KEY (id);


--
-- Name: referee_profiles referee_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referee_profiles
    ADD CONSTRAINT referee_profiles_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: standings_entries standings_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.standings_entries
    ADD CONSTRAINT standings_entries_pkey PRIMARY KEY (id);


--
-- Name: team_payments team_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_payments
    ADD CONSTRAINT team_payments_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: tournament_stages tournament_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tournament_stages
    ADD CONSTRAINT tournament_stages_pkey PRIMARY KEY (id);


--
-- Name: tournament_types tournament_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tournament_types
    ADD CONSTRAINT tournament_types_pkey PRIMARY KEY (id);


--
-- Name: tournaments tournaments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tournaments
    ADD CONSTRAINT tournaments_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_replit_database_migrations_v1_build_id; Type: INDEX; Schema: _system; Owner: -
--

CREATE UNIQUE INDEX idx_replit_database_migrations_v1_build_id ON _system.replit_database_migrations_v1 USING btree (build_id);


--
-- PostgreSQL database dump complete
--

\unrestrict lejo8rTRtsmfvF7zeC7PwX1YuLpgMrB1Go8RdRvSSnTAM7KL2l1MvOjigsnUlwo

