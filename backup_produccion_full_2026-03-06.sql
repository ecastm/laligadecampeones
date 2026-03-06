--
-- PostgreSQL database dump
--

\restrict 3B018PpoWEthof69ZqKSdMtYdhtYbmQIgU93ZGYmFDhdFiuBahOP2xMLx6YtAQh

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

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

SET default_tablespace = '';

SET default_table_access_method = heap;

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
    created_at text DEFAULT now() NOT NULL
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
    stage text,
    stage_id text,
    vs_image_url text,
    referee_notes text
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
    created_at text DEFAULT now() NOT NULL
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
    created_at text DEFAULT now() NOT NULL
);


--
-- Data for Name: bracket_matches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bracket_matches (id, season_id, tournament_id, phase, match_order, home_team_id, away_team_id, home_score, away_score, winner_id, status, match_id, seed, created_at) FROM stdin;
\.


--
-- Data for Name: captain_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.captain_profiles (id, user_id, full_name, identification_number, phone, email, address, emergency_contact, emergency_phone, observations, created_at, updated_at, identification_type, division_id) FROM stdin;
69f87937-ccae-4e70-9a35-afdd8c8e60c2	dceb6fcb-3a93-4846-b305-7c7c6a8b8709	Eduardo Castillo	z34567809c	+34627867436	eduardo.castillo@gruposalus.com.mx	CARR CANCUN - TULUM KM 307 MZ 329 LT 9	\N	\N	\N	2026-03-04 16:33:40.820413+00	2026-03-04 16:33:40.820413+00	DNI	\N
36937888-79c2-4a78-8d33-a4844d2207d9	428ddfc9-804a-4fa2-b066-aae72caace67	Claudia Fajardo	z2459083c	634567890	claudia.fajardo@gruposalus.com.mx	\N	\N	\N	\N	2026-03-04 17:00:12.076236+00	2026-03-04 17:00:12.076236+00	DNI	\N
\.


--
-- Data for Name: competition_rules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.competition_rules (id, category_id, format_type, points_win, points_draw, points_loss, round_robin, teams_per_division, promotion_count, relegation_count, federated_limit, plus30_rules, rules_version, is_active, created_at, updated_at) FROM stdin;
17fa0f06-56ec-4580-988e-49af8297cea1	e22ae070-36b7-4591-950e-f0216b8a7bb2	LEAGUE_DIVISIONS	3	1	0	double	10	3	3	3	\N	1	t	2026-03-04 14:59:10.431697+00	2026-03-04 15:05:30.877896+00
bfe00813-a812-4a46-8546-4a816cab53db	dd036abe-f19c-4a6f-8fe2-231aa5582882	LEAGUE_DIVISIONS	3	1	0	double	10	3	3	3	\N	1	t	2026-03-04 15:05:30.996455+00	2026-03-04 15:05:30.996455+00
eb9be55b-7fbf-4140-9c22-ffd3aa7a5875	2cec8476-a224-41d5-b597-388fc05c2c75	TOURNEY_PLUS30	3	1	0	single	10	\N	\N	1	{"tiebreaker": "admin_select_winner", "semisPairing": "includes_first_place", "cuartosPairing": "random_seeded", "repechagePairing": "random_seeded", "eliminatePosition": 10, "repechagePositions": [2, 3, 4, 5, 6, 7, 8, 9], "directToSemisPosition": 1}	1	t	2026-03-04 16:17:30.593828+00	2026-03-04 16:17:30.593828+00
\.


--
-- Data for Name: competition_seasons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.competition_seasons (id, category_id, tournament_id, rules_id, rules_version, name, status, created_at, updated_at) FROM stdin;
613e2380-3c53-4ea8-8a85-bdcc31334bc1	e22ae070-36b7-4591-950e-f0216b8a7bb2	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	17fa0f06-56ec-4580-988e-49af8297cea1	1	Test Temporada 2026	draft	2026-03-04 14:59:46.615856+00	2026-03-04 14:59:46.615856+00
\.


--
-- Data for Name: contact_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contact_messages (id, contact_name, phone, email, comments, status, created_at) FROM stdin;
\.


--
-- Data for Name: division_movements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.division_movements (id, season_id, team_id, team_name, from_division, to_division, movement_type, created_at) FROM stdin;
\.


--
-- Data for Name: divisions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.divisions (id, name, theme, description, created_at) FROM stdin;
e22ae070-36b7-4591-950e-f0216b8a7bb2	Primera División	PRIMERA	Máxima categoría	2026-02-18 12:10:37.549125+00
dd036abe-f19c-4a6f-8fe2-231aa5582882	Segunda División	SEGUNDA	Segunda categoría	2026-02-18 12:10:37.575956+00
2cec8476-a224-41d5-b597-388fc05c2c75	+ 30	PRIMERA	\N	2026-03-04 09:56:01.956136+00
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expenses (id, tournament_id, concept, amount, expense_at, notes, receipt_url, created_at) FROM stdin;
\.


--
-- Data for Name: fine_payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fine_payments (id, tournament_id, team_id, amount, notes, paid_at, created_at) FROM stdin;
\.


--
-- Data for Name: fines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fines (id, tournament_id, match_id, match_event_id, team_id, player_id, card_type, amount, status, paid_amount, paid_at, created_at) FROM stdin;
\.


--
-- Data for Name: marketing_media; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.marketing_media (id, title, description, type, url, thumbnail_url, tournament_id, created_at) FROM stdin;
ea766eb1-74bc-4b57-941c-503341c4b215	Foto de la Liga		PHOTO	/objects/uploads/063a9661-c7a0-4f56-9d0e-685c07791f29	\N	\N	2026-03-03 16:01:00.814546+00
b1ccb40f-a329-43ad-ad88-bce83cfb8b68	Foto de la Liga		PHOTO	/objects/uploads/09b3f194-762b-4629-af61-62764366f3b5	\N	\N	2026-03-03 16:01:00.864884+00
73a4c59b-63bf-408a-b555-877a9baebe72	Foto de la Liga		PHOTO	/objects/uploads/0a4fe101-0c18-42f6-ac36-385749304297	\N	\N	2026-03-03 16:01:00.869312+00
add952b2-049e-4bc7-94fb-238a84a6db46	Foto de la Liga		PHOTO	/objects/uploads/0be31211-d674-4544-a247-c425b9ebd7f8	\N	\N	2026-03-03 16:01:00.872768+00
5c265792-7208-4526-8ccb-46cea13d96f1	Foto de la Liga		PHOTO	/objects/uploads/0bfcbcda-dbe0-4eb6-9311-b714efba561e	\N	\N	2026-03-03 16:01:00.876309+00
af595edb-44c9-42a3-a1c5-78257a9d0bce	Foto de la Liga		PHOTO	/objects/uploads/0c54de55-5876-4213-b945-8ac82e1649c7	\N	\N	2026-03-03 16:01:00.880533+00
c85e6936-9657-4278-b05b-99dacd3d3918	Foto de la Liga		PHOTO	/objects/uploads/1100f444-6ae5-4cdc-bd8c-8e13f91fd2f4	\N	\N	2026-03-03 16:01:00.884353+00
ef537b89-462a-4cf4-bf42-5cfb1289da2b	Foto de la Liga		PHOTO	/objects/uploads/11224eaa-626f-418e-b753-c0a42e2fe0ec	\N	\N	2026-03-03 16:01:00.887051+00
0095da04-3b69-4b71-97f2-f8abc94405b3	Foto de la Liga		PHOTO	/objects/uploads/11bfd723-a532-4451-92b1-0625d8b510ce	\N	\N	2026-03-03 16:01:00.89072+00
10f6f51c-b1a9-485d-8ed8-24211183f657	Foto de la Liga		PHOTO	/objects/uploads/1239e065-7629-4a79-9772-bf5734f37659	\N	\N	2026-03-03 16:01:00.893986+00
27969a44-1ec4-481a-a09d-d5844bef5933	Foto de la Liga		PHOTO	/objects/uploads/1663a1ee-eac1-4208-a6c9-aed7b954a302	\N	\N	2026-03-03 16:01:00.897812+00
7f7ac46d-7e30-483d-ab5a-be9167f5ebe8	Foto de la Liga		PHOTO	/objects/uploads/1675edac-9c18-497d-a945-acb7bcb0e9ba	\N	\N	2026-03-03 16:01:00.900451+00
1071356c-feb3-4414-8ca5-3061e8db4153	Foto de la Liga		PHOTO	/objects/uploads/1bca5d92-f558-48fd-8f8c-f70156eda72d	\N	\N	2026-03-03 16:01:00.903864+00
85708596-e7f9-42f2-88f0-a297d655149b	Foto de la Liga		PHOTO	/objects/uploads/1f852a30-8549-4d4e-8571-fa85e5550a42	\N	\N	2026-03-03 16:01:00.907083+00
0f8c46d7-0ebf-4e6d-8087-d85255447b7b	Foto de la Liga		PHOTO	/objects/uploads/20a14feb-bf62-40e5-8913-9a247f169cd8	\N	\N	2026-03-03 16:01:00.910178+00
216673ee-a31e-49a9-802b-f657cb313a09	Foto de la Liga		PHOTO	/objects/uploads/26509540-264f-4033-9f4e-4a346ff5c18d	\N	\N	2026-03-03 16:01:00.913485+00
f25e3273-4fc8-4fd4-bedf-1b427a5bb535	Foto de la Liga		PHOTO	/objects/uploads/27b898a6-d632-45c8-8b8c-034c09123e4b	\N	\N	2026-03-03 16:01:00.915991+00
b6e13ef0-5ecd-4df7-b7d4-d3ed09b201db	Foto de la Liga		PHOTO	/objects/uploads/2aafaf24-d85b-47dc-a110-d4cc5c18f342	\N	\N	2026-03-03 16:01:00.91824+00
f331fb1e-b2fc-44ab-be69-ea8921ffbe6d	Foto de la Liga		PHOTO	/objects/uploads/2c7700f1-4ea4-4723-a617-dae170243c2a	\N	\N	2026-03-03 16:01:00.922393+00
03f7d159-7d99-486e-af5a-a8d07c21a905	Foto de la Liga		PHOTO	/objects/uploads/31396e3e-f58e-4fe4-9b0a-bafe31029cf4	\N	\N	2026-03-03 16:01:00.925744+00
7c8ad1b3-b833-4e58-bea6-bd89d0ca764b	Foto de la Liga		PHOTO	/objects/uploads/3ca8c54c-03ff-4285-afef-3f8641cc7fd6	\N	\N	2026-03-03 16:01:00.928533+00
eb5bb641-4639-4424-8306-3bcb9f8fb448	Foto de la Liga		PHOTO	/objects/uploads/3e407ba0-50f3-4f3c-b520-e84802020767	\N	\N	2026-03-03 16:01:00.931285+00
0c70f789-0e41-4462-9e51-69e9271d0808	Foto de la Liga		PHOTO	/objects/uploads/4a289947-5425-4922-b0d9-560317afc4b4	\N	\N	2026-03-03 16:01:00.9351+00
0f5480e7-b20b-4423-bd21-fd071008dd86	Foto de la Liga		PHOTO	/objects/uploads/4b7c7ece-4e00-4c82-ac4e-3251ed0ec66c	\N	\N	2026-03-03 16:01:00.937428+00
0033e1e8-f79f-49c8-b6f8-193680680269	Foto de la Liga		PHOTO	/objects/uploads/4e318aa5-aeff-4ebe-845a-16364ceb25df	\N	\N	2026-03-03 16:01:00.940182+00
24ff2412-6c42-4aea-8236-8dad7746237f	Foto de la Liga		PHOTO	/objects/uploads/51c65358-10ae-4284-85be-9b1bf737372a	\N	\N	2026-03-03 16:01:00.943166+00
8817a657-7d85-40b6-a501-f8431024c014	Foto de la Liga		PHOTO	/objects/uploads/594b75b7-361e-4176-ae3a-20b9b9bdbe4f	\N	\N	2026-03-03 16:01:00.947224+00
a4d3a47e-8e15-4da8-b941-57cce3593b26	Foto de la Liga		PHOTO	/objects/uploads/5f1c37a0-857a-42ec-b49d-b07160ce4ed0	\N	\N	2026-03-03 16:01:00.949815+00
e10a579b-26e7-45fb-b5e3-626e1da21431	Foto de la Liga		PHOTO	/objects/uploads/6013cf39-1b1b-4109-8dd7-e4fe086e6d5e	\N	\N	2026-03-03 16:01:00.953085+00
7a164759-ef06-4e0e-8fda-fa2106b0e2cc	Foto de la Liga		PHOTO	/objects/uploads/609d043a-da0a-41d7-8539-3e23fbc7f63d	\N	\N	2026-03-03 16:01:00.955388+00
cdc05d2c-71bf-4ae5-8b0c-9d15e9cc3446	Foto de la Liga		PHOTO	/objects/uploads/612d34e8-45d3-4979-89c0-f6bf1020032d	\N	\N	2026-03-03 16:01:00.95864+00
403b2524-1533-4109-854b-065b4371b075	Foto de la Liga		PHOTO	/objects/uploads/61b3d0fb-35f9-482a-92fa-b8342b88dbd3	\N	\N	2026-03-03 16:01:00.96131+00
542f2054-bb3e-48ae-9d87-b3b6190d7cdf	Foto de la Liga		PHOTO	/objects/uploads/65f130d6-5ada-4aec-8ee2-30410d18a573	\N	\N	2026-03-03 16:01:00.964169+00
5c1e1b42-8b6b-4f3e-98cd-af7c5d57d505	Foto de la Liga		PHOTO	/objects/uploads/6665f51d-99c6-48a4-8b21-c58d668e7069	\N	\N	2026-03-03 16:01:00.96743+00
79e250bf-0ced-4396-bea2-11bf39e1b99a	Foto de la Liga		PHOTO	/objects/uploads/667389e5-8215-4164-8ba0-fb0ed3578dd9	\N	\N	2026-03-03 16:01:00.970215+00
17dff8c8-5b1b-4348-97e2-d60789f6f67e	Foto de la Liga		PHOTO	/objects/uploads/66c43277-f9d9-41a2-b8dd-fb296647f7e7	\N	\N	2026-03-03 16:01:00.972624+00
ef5b5f93-b65f-4d53-8603-11caa619c0fd	Foto de la Liga		PHOTO	/objects/uploads/66d75f57-e77a-4fbd-b82d-9a66a9e75269	\N	\N	2026-03-03 16:01:00.974918+00
492b94e0-485d-4789-982e-f11dacdef1ad	Foto de la Liga		PHOTO	/objects/uploads/67dc47af-c0f7-4c29-a390-69b3234ac82a	\N	\N	2026-03-03 16:01:00.978061+00
23a6dc68-7b1e-4e1b-b34a-95025197d0f7	Foto de la Liga		PHOTO	/objects/uploads/68b43e2e-fc24-4f79-bec8-3ac3cf3a70a5	\N	\N	2026-03-03 16:01:00.981036+00
9d3ca6da-e792-4a14-8775-d4ae903937e6	Foto de la Liga		PHOTO	/objects/uploads/6b0d1121-cb3c-4a9b-b260-36a36b1768ae	\N	\N	2026-03-03 16:01:00.984005+00
2a1ef3c8-ec58-4378-bfa5-3bd45a1f210b	Foto de la Liga		PHOTO	/objects/uploads/700fcd86-ec0b-4da8-85c2-e3a250d4c57e	\N	\N	2026-03-03 16:01:00.987052+00
39dbdd74-5a7a-44b5-8dbc-05cc083525d9	Foto de la Liga		PHOTO	/objects/uploads/7a3ce8b2-ad64-4ee8-aaac-7b30c9811942	\N	\N	2026-03-03 16:01:00.989334+00
4ff8500b-882c-450a-89a3-0a6b95c2d836	Foto de la Liga		PHOTO	/objects/uploads/7a7d1748-ec21-4d94-af1d-a0255b400071	\N	\N	2026-03-03 16:01:00.992723+00
6dd0f61c-a9c2-4899-a549-21f398f150e5	Foto de la Liga		PHOTO	/objects/uploads/7b0345f9-aa09-4982-99cc-a55c8760424f	\N	\N	2026-03-03 16:01:00.995591+00
d9a1020e-5244-42a5-a94d-89c2f31e3e22	Foto de la Liga		PHOTO	/objects/uploads/7efb6866-aa08-4baf-ad57-8dcc40ba1786	\N	\N	2026-03-03 16:01:00.998557+00
9c4c0a08-246b-4fe5-84ca-d1c74c0d2a9c	Foto de la Liga		PHOTO	/objects/uploads/7f836943-7b76-4b55-971e-4475e69e6068	\N	\N	2026-03-03 16:01:01.001065+00
da1d663e-5b8c-482c-b770-a004564b64a7	Foto de la Liga		PHOTO	/objects/uploads/82a1f903-31dd-42d3-83e5-dcdc26ff6fff	\N	\N	2026-03-03 16:01:01.005255+00
a8fb2e43-9b7a-445c-b42f-b5b90f68fe50	Foto de la Liga		PHOTO	/objects/uploads/8706f3b9-e3a0-4c17-8035-7ad84516e8c7	\N	\N	2026-03-03 16:01:01.008429+00
c34dd3c5-130c-4e50-a30d-2accb3fa13fe	Foto de la Liga		PHOTO	/objects/uploads/88751738-0edb-40a4-b32b-c95814c87e2f	\N	\N	2026-03-03 16:01:01.01103+00
256d0dd1-52c0-4d26-8202-7e1147ccff73	Foto de la Liga		PHOTO	/objects/uploads/8bb9eee5-128a-4768-bcdb-930dc892f454	\N	\N	2026-03-03 16:01:01.013855+00
e8dc1255-7aa8-4f7e-9e60-e4bb5b887b4b	Foto de la Liga		PHOTO	/objects/uploads/8cd08528-dbf8-4238-818f-392198b28ea3	\N	\N	2026-03-03 16:01:01.016595+00
a80eadaa-fee7-4f6c-b630-6904cad3337d	Foto de la Liga		PHOTO	/objects/uploads/8dd30044-30d9-47e4-9625-ac61745f35ba	\N	\N	2026-03-03 16:01:01.018993+00
bd09a9b9-4bb7-436e-bf8b-2c3a110b4868	Foto de la Liga		PHOTO	/objects/uploads/8e6882ac-0544-481e-8f6b-4e7c57269c04	\N	\N	2026-03-03 16:01:01.022246+00
b7534b13-2697-468b-8886-c3646a773b36	Foto de la Liga		PHOTO	/objects/uploads/91396638-f818-4862-bd0d-31590980d281	\N	\N	2026-03-03 16:01:01.024809+00
30d7d59d-9c8b-4fdf-a9e4-c2e0b93f7e51	Foto de la Liga		PHOTO	/objects/uploads/9c364c18-0002-4236-ab61-2262ae4f1283	\N	\N	2026-03-03 16:01:01.028205+00
11d6ed14-4128-44e7-9f56-1b828bddeec5	Foto de la Liga		PHOTO	/objects/uploads/9c61ad34-0d19-4bfd-af6f-419388995c38	\N	\N	2026-03-03 16:01:01.031117+00
c5ef8204-1bc7-45b2-95aa-543d0f40d089	Foto de la Liga		PHOTO	/objects/uploads/9e1b32c8-0cc0-49f9-bd8f-58836f07192e	\N	\N	2026-03-03 16:01:01.034352+00
3db309e4-fdc6-4e1e-85cc-e53a1ef3df5d	Foto de la Liga		PHOTO	/objects/uploads/9e957f52-9edf-47fc-bf89-3700fbc00116	\N	\N	2026-03-03 16:01:01.037092+00
45783599-93b6-4551-8f3e-e3047b01e541	Foto de la Liga		PHOTO	/objects/uploads/9ece94ff-84d4-4f6d-9f2c-75e0fd91356a	\N	\N	2026-03-03 16:01:01.039934+00
3a6f28d2-8af9-4a48-b82f-ac68cb761a83	Foto de la Liga		PHOTO	/objects/uploads/a1a408b1-6668-4d97-8e82-b11f3884cc8c	\N	\N	2026-03-03 16:01:01.042452+00
efbb7d69-c55d-42cb-872f-2f97303be7f4	Foto de la Liga		PHOTO	/objects/uploads/a2ec5845-caa5-4a61-85a6-6d23bf388f17	\N	\N	2026-03-03 16:01:01.045372+00
9d44f6da-2afb-455c-b97c-686aefbafe11	Foto de la Liga		PHOTO	/objects/uploads/a8e99fd2-6fbe-4a7b-b941-5366a0cc719c	\N	\N	2026-03-03 16:01:01.047731+00
9f9c9ea9-b648-4be3-85cf-c6d5ccbee7fd	Foto de la Liga		PHOTO	/objects/uploads/abe1c506-54ff-4bec-9ff8-2eeec7f771a5	\N	\N	2026-03-03 16:01:01.050653+00
5dd37998-15ec-4e2a-8333-542d8fe37e48	Foto de la Liga		PHOTO	/objects/uploads/acf9cc05-3480-4f93-8182-0c9d2de0ab93	\N	\N	2026-03-03 16:01:01.05367+00
9d85a62d-ac2b-4ed7-8d4b-704056871f22	Foto de la Liga		PHOTO	/objects/uploads/ae016e19-d303-4b9c-aba7-8ebb15a7e4d8	\N	\N	2026-03-03 16:01:01.056912+00
382437b6-c341-4c73-8c86-2a745adf88d5	Foto de la Liga		PHOTO	/objects/uploads/b0adfa9a-a727-485a-86a6-c818e4446e3f	\N	\N	2026-03-03 16:01:01.059689+00
af5faa70-eeb9-4eee-8c30-5030978227b3	Foto de la Liga		PHOTO	/objects/uploads/b198a600-ba58-4773-927d-17e4b323b31b	\N	\N	2026-03-03 16:01:01.06305+00
44ad1d47-c8af-4795-a6ad-f5e815cc34ac	Foto de la Liga		PHOTO	/objects/uploads/b1f9b30f-ab7b-453a-811e-5d3aa02f2763	\N	\N	2026-03-03 16:01:01.065669+00
ac7ee329-ab0b-452a-a58a-e8e61ab282f3	Foto de la Liga		PHOTO	/objects/uploads/b23139ab-f798-4a69-b5be-8682be1b8843	\N	\N	2026-03-03 16:01:01.068229+00
dae3c386-5429-4250-ac38-ae0c07f5acdc	Foto de la Liga		PHOTO	/objects/uploads/b2d5f6d9-e865-408f-9f9a-b3b84391ea66	\N	\N	2026-03-03 16:01:01.070789+00
2a09ccf2-11b0-4ad9-9df6-1e00bd01a214	Foto de la Liga		PHOTO	/objects/uploads/b39d247d-0e3e-4389-aa56-50b7049d3dd5	\N	\N	2026-03-03 16:01:01.074241+00
529cc6a0-af8b-4437-9b02-46ebaebe4729	Foto de la Liga		PHOTO	/objects/uploads/b664086e-9d86-47dd-b785-ba3433269341	\N	\N	2026-03-03 16:01:01.07745+00
9b037c85-94bb-4910-bfdf-41d9b4311122	Foto de la Liga		PHOTO	/objects/uploads/b79913e1-7bc2-47c7-8669-0b6c37b04868	\N	\N	2026-03-03 16:01:01.08058+00
5d85f67e-4c7a-4685-b063-9b1278513d4c	Foto de la Liga		PHOTO	/objects/uploads/b935e5f1-30af-411b-9fa0-af929883b3fd	\N	\N	2026-03-03 16:01:01.083258+00
c2b8e804-89e8-492b-a4b7-5e2c58772712	Foto de la Liga		PHOTO	/objects/uploads/bdead640-3167-4107-8d31-17ad8229433b	\N	\N	2026-03-03 16:01:01.086646+00
f026cee3-9f47-4680-b148-655ca8b1630d	Foto de la Liga		PHOTO	/objects/uploads/bf92319e-cbe2-42cd-bdec-d24ffb52a2f0	\N	\N	2026-03-03 16:01:01.088904+00
34b2e3c8-1d43-4c41-9050-ac8222c566d2	Foto de la Liga		PHOTO	/objects/uploads/c472af3b-1c03-4fe7-ac7c-390db1c467ca	\N	\N	2026-03-03 16:01:01.091659+00
b9f9b312-66bf-40ce-bf77-844185d7aaff	Video de la Liga		VIDEO	/objects/uploads/c776ff6c-2f07-4bc7-bd9c-c1d78a3e2b28	\N	\N	2026-03-03 16:01:01.094715+00
5eb4b0a7-5c19-4c63-8507-437b5bddd73d	Foto de la Liga		PHOTO	/objects/uploads/c8ce6126-af25-42c4-a60b-2483030c24c6	\N	\N	2026-03-03 16:01:01.097765+00
4689289a-8772-40a5-947a-74328ce24bfc	Foto de la Liga		PHOTO	/objects/uploads/ca4b75cd-a72b-46b5-8da7-7a4f9def18db	\N	\N	2026-03-03 16:01:01.10107+00
1da6ed00-a517-4280-a70d-765210b60652	Foto de la Liga		PHOTO	/objects/uploads/cbb21f5d-c07c-4267-b419-865f74797df7	\N	\N	2026-03-03 16:01:01.103814+00
23e73638-3115-4b32-866b-862dd975522d	Foto de la Liga		PHOTO	/objects/uploads/d0ac66d8-518e-4ddd-be21-842e498e54d8	\N	\N	2026-03-03 16:01:01.106649+00
d26de67f-c043-4d03-bd20-1cf32500a6cf	Foto de la Liga		PHOTO	/objects/uploads/d4ade8e4-a1b8-4a40-9041-9103cea6c4b9	\N	\N	2026-03-03 16:01:01.109459+00
1a9cd4d2-fd98-4989-ba24-f7d5cca8278c	Foto de la Liga		PHOTO	/objects/uploads/d8027370-266f-4eb6-a791-cd52a95a3132	\N	\N	2026-03-03 16:01:01.112107+00
4734e468-282c-43d4-8307-1ce4e2dc5db2	Foto de la Liga		PHOTO	/objects/uploads/da601623-2cc1-4c14-90c5-b7bf0e6cd232	\N	\N	2026-03-03 16:01:01.11486+00
ad6f6f1c-1ba2-4898-bb38-241332bf4faf	Foto de la Liga		PHOTO	/objects/uploads/dad170d1-0771-4970-9608-6336e358008a	\N	\N	2026-03-03 16:01:01.11712+00
ef87ac17-fd58-4729-8641-5dd15f021c51	Foto de la Liga		PHOTO	/objects/uploads/e08f174a-7f8b-441b-a135-c4d59a2929c5	\N	\N	2026-03-03 16:01:01.120128+00
1a96a77f-4081-4ccc-aab9-217d66b46676	Foto de la Liga		PHOTO	/objects/uploads/e10480ea-6e55-42af-8b16-d6785bc37aa8	\N	\N	2026-03-03 16:01:01.122726+00
0e19d4e9-8429-4435-88ca-f84abfaf5ade	Foto de la Liga		PHOTO	/objects/uploads/e1aa8ad6-05c9-40f9-a9d7-470ced8bb5be	\N	\N	2026-03-03 16:01:01.125116+00
fb472022-5d47-4a4c-b114-43a470ae5dbd	Foto de la Liga		PHOTO	/objects/uploads/e314d29b-34bb-4775-9f99-1d385827c236	\N	\N	2026-03-03 16:01:01.127335+00
bcfa353f-7cae-43c9-9652-7d1abe240d13	Foto de la Liga		PHOTO	/objects/uploads/e41c3aac-7980-467b-8976-414e1c39ff6f	\N	\N	2026-03-03 16:01:01.130031+00
65d815f0-dd0c-4359-b132-6c4b3551f841	Foto de la Liga		PHOTO	/objects/uploads/ea0a5c81-fe4b-4536-ae9c-dcad7c70f873	\N	\N	2026-03-03 16:01:01.132656+00
1b491a56-ca29-4353-9fec-86347934f600	Foto de la Liga		PHOTO	/objects/uploads/f24a6ea3-0d2d-45b9-b6b5-c05bad38b741	\N	\N	2026-03-03 16:01:01.135561+00
f01f4199-cba5-4748-960a-39da00cd83cf	Foto de la Liga		PHOTO	/objects/uploads/f32d2ebd-e9e4-4ad5-9e11-af3488ff220a	\N	\N	2026-03-03 16:01:01.138499+00
e9db79c4-6221-46c4-9abb-2e4108abf766	Foto de la Liga		PHOTO	/objects/uploads/f35b5f8e-3b5c-488a-86fb-269a1b00a88a	\N	\N	2026-03-03 16:01:01.141264+00
171b2480-05ce-4b5e-82af-c6e5845a081a	Foto de la Liga		PHOTO	/objects/uploads/f408c3c0-e8a8-41e4-8f36-5efea048e66b	\N	\N	2026-03-03 16:01:01.144267+00
f7d73e91-89ac-43e5-a666-ba7f13a60aad	Foto de la Liga		PHOTO	/objects/uploads/f5b4becd-2682-4587-be40-a066b99b9057	\N	\N	2026-03-03 16:01:01.147858+00
b09fdc1e-50c9-499d-a3d2-9e2422c6331f	Foto de la Liga		PHOTO	/objects/uploads/f90a9bb9-0647-46e9-b2b6-cd55bd210862	\N	\N	2026-03-03 16:01:01.15057+00
6e79983c-e2ba-49ec-a376-ae790057882a	Foto de la Liga		PHOTO	/objects/uploads/fdbf7010-38cb-44bd-9863-a207ccab3558	\N	\N	2026-03-03 16:01:01.153266+00
b70b42a3-f4e1-44ed-a783-4d64042766d1	Foto de la Liga		PHOTO	/objects/uploads/fe291c92-0bee-4b6a-a84a-6b2e76e2eb24	\N	\N	2026-03-03 16:01:01.155801+00
7ea5ec66-86b7-4eed-ac0a-ef6024a0238c	Foto de la Liga		PHOTO	/objects/uploads/fed0fae1-4cf5-4ed8-8800-1992c792279c	\N	\N	2026-03-03 16:01:01.158706+00
\.


--
-- Data for Name: match_attendance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.match_attendance (id, match_id, team_id, player_id, present, created_at) FROM stdin;
\.


--
-- Data for Name: match_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.match_events (id, match_id, type, minute, team_id, player_id, related_player_id, notes) FROM stdin;
\.


--
-- Data for Name: match_evidence; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.match_evidence (id, match_id, event_id, type, url, transcript, created_at) FROM stdin;
\.


--
-- Data for Name: match_lineups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.match_lineups (id, match_id, team_id, player_ids, created_at) FROM stdin;
\.


--
-- Data for Name: matches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.matches (id, tournament_id, round_number, date_time, field, home_team_id, away_team_id, referee_user_id, status, home_score, away_score, stage, stage_id, vs_image_url, referee_notes) FROM stdin;
4b78cd33-8692-4a99-a7e2-5f7c056d2238	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	2	2026-02-28T20:00	Central	3fa0fd99-35d0-40b7-a30d-d0881711c5cf	382bcce4-cda4-4d82-99bb-96597d16cb30	\N	PROGRAMADO	\N	\N	CUARTOS	d08eb75d-033b-4c30-a093-9c964f7908a1	/objects/uploads/a1a408b1-6668-4d97-8e82-b11f3884cc8c	\N
\.


--
-- Data for Name: news; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.news (id, tournament_id, match_id, title, content, image_url, author_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: player_suspensions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.player_suspensions (id, tournament_id, player_id, team_id, match_id, match_event_id, reason, matches_remaining, status, created_at) FROM stdin;
\.


--
-- Data for Name: players; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.players (id, team_id, first_name, last_name, jersey_number, "position", identification_id, photo_urls, is_federated, federation_id, active, identification_type) FROM stdin;
71854490-8d7a-4458-99c0-669a90a87dd1	99136abb-ea3f-45e9-8283-14931917b21a	Juan 	Camanei	1	Centro medio	567890000	{/objects/uploads/636b8497-838b-4851-91f0-1200f1ea3ba6}	t	34567	t	DNI
\.


--
-- Data for Name: referee_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.referee_profiles (id, user_id, full_name, identification_number, phone, email, association, years_of_experience, observations, status, created_at, updated_at, identification_type) FROM stdin;
e55ec896-0915-497d-acf1-5ff3b60da06d	fa49086c-694e-4ba1-b90d-16f943c8b796	Claudia Fajardo	z34567809c	+34627867436	arbitro12@liga.com	\N	5	\N	ACTIVO	2026-03-04 16:52:59.786418+00	2026-03-04 16:52:59.786418+00	DNI
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_settings (id, league_name, logo_url, phone, email, address, instagram_url, facebook_url, whatsapp_number, updated_at) FROM stdin;
db1a8e5c-4704-42db-99b4-bdaea0d3018e	La Liga de Campeones 	/objects/uploads/88751738-0edb-40a4-b32b-c95814c87e2f				Laligadecampeones_100			2026-03-03T10:42:46.287Z
\.


--
-- Data for Name: standings_entries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.standings_entries (id, season_id, tournament_id, team_id, division, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, "position", updated_at) FROM stdin;
\.


--
-- Data for Name: team_payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.team_payments (id, tournament_id, team_id, amount, method, notes, paid_at, created_at) FROM stdin;
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.teams (id, tournament_id, division_id, name, colors, home_field, logo_url, captain_user_id, coach_name, instagram_url) FROM stdin;
99136abb-ea3f-45e9-8283-14931917b21a	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	e22ae070-36b7-4591-950e-f0216b8a7bb2	El Palo	Azul y Blanco	Campo El Palo	/objects/uploads/a76d92fb-4477-46ba-9818-f15189ca59f3	dceb6fcb-3a93-4846-b305-7c7c6a8b8709	\N	\N
bb416f3a-f7c8-418a-b2eb-2d425bd301f6	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	e22ae070-36b7-4591-950e-f0216b8a7bb2	Millonarios	Azul y Blanco	Campo Millonarios	/objects/uploads/4089ae16-bddc-4d56-88bc-74c637e3f593	a248fbb7-f9ed-4626-aab0-a478e1dc8ccf	\N	\N
3fa0fd99-35d0-40b7-a30d-d0881711c5cf	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	e22ae070-36b7-4591-950e-f0216b8a7bb2	Fuengirola  (LIBRE)	Verde y Blanco	Campo Fuengirola	/objects/uploads/f2a176f1-0c44-40db-9281-ccf0cd3bc706	3d0470a9-dfb0-4a1b-af83-a7b3cb0af389	\N	\N
382bcce4-cda4-4d82-99bb-96597d16cb30	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	e22ae070-36b7-4591-950e-f0216b8a7bb2	Equipo 5	Blanco y Negro	Campo 5	\N	\N	\N	\N
a56a9605-b612-4c44-8426-c5e65ae83926	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	e22ae070-36b7-4591-950e-f0216b8a7bb2	Rejunte	Rojo y Blanco	Campo Rejunte	/objects/uploads/d4a9e6fb-f500-49a4-865d-70b00bee2606	0aa2a754-185c-414c-8821-26a7c78f885e	\N	\N
96c34d38-ed46-4143-9e37-e9fa59e5b9b3	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	dd036abe-f19c-4a6f-8fe2-231aa5582882	Chivas de Guadalajara 	rojo, blanco y azul	Guadalajara	/objects/uploads/d2de8516-b732-4338-a17f-709b0cf5b306	428ddfc9-804a-4fa2-b066-aae72caace67	\N	\N
\.


--
-- Data for Name: tournament_stages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tournament_stages (id, tournament_id, name, sort_order, stage_type) FROM stdin;
d08eb75d-033b-4c30-a093-9c964f7908a1	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	Cuartos de Final	1	ELIMINATORIA
1dc0dda6-85e3-4f37-98a3-0ce9667379b6	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	Semifinal	2	ELIMINATORIA
44b29686-ee68-4505-a48d-a70def8b18ce	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	Final	3	ELIMINATORIA
eefab832-4553-4781-abcb-d72b5245c795	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	Jornada Regular	0	LIGA
\.


--
-- Data for Name: tournament_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tournament_types (id, name, algorithm, description, supports_double_round) FROM stdin;
359c2d41-2709-4be3-98ee-63fd74923774	Liga (Todos contra todos)	ROUND_ROBIN	Todos los equipos juegan entre sí.	t
03ab98e8-5cd3-48fd-ba4b-482ff345d27a	Eliminación directa	KNOCKOUT	Llaves directas, el perdedor queda eliminado.	f
777ea289-2281-4c88-a184-4d01e0bacbf8	Grupos + Playoffs	GROUPS_PLAYOFFS	Fase de grupos seguida de eliminatorias.	f
\.


--
-- Data for Name: tournaments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tournaments (id, division_id, tournament_type_id, name, season_name, location, start_date, end_date, status, champion_team_id, champion_team_name, final_standings, fee_per_team, fine_yellow, fine_red, fine_red_direct, max_federated_players, double_round, schedule_generated, created_at) FROM stdin;
86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	e22ae070-36b7-4591-950e-f0216b8a7bb2	\N	Liga de Campeones 2026	Temporada Primavera 2026	Fuengirola	2026-02-18T12:10:37.681Z	\N	ACTIVO	\N	\N	\N	\N	10	25	50	\N	\N	\N	2026-02-18 12:10:37.694136+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, password_hash, role, team_id, status, created_at) FROM stdin;
12ce96ab-da56-419a-8f55-bcb06f680453	Admin Principal	admin@liga.com	$2b$10$u0TYGdEbMTnK/DZZ9ODfouujrIbbYW.Hh9l7O6yaTl0lRj3QhYrre	ADMIN	\N	ACTIVO	2026-02-18 12:10:37.800+00
3564a85f-12ef-4d11-9a95-9f0de99e92e6	Admin Secundario	admin2@liga.com	$2b$10$u0TYGdEbMTnK/DZZ9ODfouujrIbbYW.Hh9l7O6yaTl0lRj3QhYrre	ADMIN	\N	ACTIVO	2026-02-18 12:10:37.900+00
557cf62b-16e8-428a-baae-4bfdfec642b3	Admin Soporte	admin3@liga.com	$2b$10$u0TYGdEbMTnK/DZZ9ODfouujrIbbYW.Hh9l7O6yaTl0lRj3QhYrre	ADMIN	\N	ACTIVO	2026-02-18 12:10:38.000+00
c4a01ad9-2005-416b-8eb1-097f3904e660	Marketing Liga	marketing@liga.com	$2b$10$Kmolb/t/JXlURzjSBbQlkutbcj579WN17v3xBDaL8bLhFQYL9wf9O	MARKETING	\N	ACTIVO	2026-02-18 12:10:39.500+00
049ae609-dc8e-4e7e-819c-bdc0df4b404a	Juan Pérez	arbitro1@liga.com	$2b$10$rtrJ4Hw6l.bY1HmTskShieVFVR9AlmUpjjW1w45o9Srs.NJciFbwC	ARBITRO	\N	ACTIVO	2026-02-18 12:10:39.167643+00
587f05d4-2d16-4abc-809b-ec65625844ab	Pedro Gómez	arbitro2@liga.com	$2b$10$rtrJ4Hw6l.bY1HmTskShieVFVR9AlmUpjjW1w45o9Srs.NJciFbwC	ARBITRO	\N	ACTIVO	2026-02-18 12:10:39.328234+00
dceb6fcb-3a93-4846-b305-7c7c6a8b8709	Capitán El Palo	capitan1@liga.com	$2b$10$8jaKfQdujUg8hHMKbZ.uHuyAlorRz7tWj7xSqgsCOZ6oAcutb7C9m	CAPITAN	99136abb-ea3f-45e9-8283-14931917b21a	ACTIVO	2026-02-18 12:10:38.480+00
3d0470a9-dfb0-4a1b-af83-a7b3cb0af389	Capitán Fuengirola	capitan2@liga.com	$2b$10$8jaKfQdujUg8hHMKbZ.uHuyAlorRz7tWj7xSqgsCOZ6oAcutb7C9m	CAPITAN	3fa0fd99-35d0-40b7-a30d-d0881711c5cf	ACTIVO	2026-02-18 12:10:38.650+00
a248fbb7-f9ed-4626-aab0-a478e1dc8ccf	Capitán Millonarios	capitan3@liga.com	$2b$10$8jaKfQdujUg8hHMKbZ.uHuyAlorRz7tWj7xSqgsCOZ6oAcutb7C9m	CAPITAN	bb416f3a-f7c8-418a-b2eb-2d425bd301f6	ACTIVO	2026-02-18 12:10:38.811798+00
0aa2a754-185c-414c-8821-26a7c78f885e	Capitán Rejunte	capitan4@liga.com	$2b$10$8jaKfQdujUg8hHMKbZ.uHuyAlorRz7tWj7xSqgsCOZ6oAcutb7C9m	CAPITAN	a56a9605-b612-4c44-8426-c5e65ae83926	ACTIVO	2026-02-18 12:10:38.970+00
66b47301-199e-44e0-80f9-f19bd497d168	shey	sheylagaona312@gmail.com	$2b$10$OnokZGPysahN/aN5MZ42PedaH8pI/9cCZZiO8gvqjrA5KI23fyWiq	ADMIN	\N	ACTIVO	2026-02-25 18:00:16.199572+00
47e14470-8cbc-48c7-aac0-6c58f70ddaeb	Fer y Lucia	Ferbogadofilms@gmail.com	$2b$10$OnokZGPysahN/aN5MZ42PedaH8pI/9cCZZiO8gvqjrA5KI23fyWiq	MARKETING	\N	ACTIVO	2026-02-25 18:19:25.675857+00
ea83e446-8ee7-45c7-b756-66200bc11f80	Test Admin	sheylagaona312+admin@example.com	$2b$10$61CnOFtZjNXgIJBLZ4ei8uTQGr/4ABBdi/1Rl4UQGQrGamRsOl2w2	ADMIN	\N	ACTIVO	2026-03-04 14:58:16.755719+00
fa49086c-694e-4ba1-b90d-16f943c8b796	Claudia Fajardo	arbitro12@liga.com	$2b$10$b3DygxI2WoutJLSmQEIoAOeH0TYnakAPjVgi.ApV.PykEp3BDO1py	ARBITRO	\N	ACTIVO	2026-03-04 16:44:45.072535+00
428ddfc9-804a-4fa2-b066-aae72caace67	Claudia Fajardo	claudia.fajardo@gruposalus.com.mx	$2b$10$K1gXZ.CHzJO3VNjIJq2e9eiDPqYk62yQQ9OjXc42fKJlC6iFBat5.	CAPITAN	96c34d38-ed46-4143-9e37-e9fa59e5b9b3	ACTIVO	2026-03-04 16:59:35.528419+00
\.


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
-- Name: matches matches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_pkey PRIMARY KEY (id);


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
-- PostgreSQL database dump complete
--

\unrestrict 3B018PpoWEthof69ZqKSdMtYdhtYbmQIgU93ZGYmFDhdFiuBahOP2xMLx6YtAQh

