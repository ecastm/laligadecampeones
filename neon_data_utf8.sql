--
-- PostgreSQL database dump
--

\restrict UO2EqA5CMUeKmteKMf77ICgLPqY7jCposbF5D8o6K6mHNS82C8RIn0erAOSsyAe

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
-- Data for Name: replit_database_migrations_v1; Type: TABLE DATA; Schema: _system; Owner: -
--

COPY _system.replit_database_migrations_v1 (id, build_id, deployment_id, statement_count, applied_at) FROM stdin;
1	f0ab4334-e99c-4b98-b6b2-ddfb51394959	102e20fe-b7a4-4327-a09c-e2ad501656d0	19	2026-02-17 19:11:33.715907+00
2	41e6f5fc-fd2c-4613-b96f-ff96f9690df3	102e20fe-b7a4-4327-a09c-e2ad501656d0	37	2026-02-17 21:40:19.536305+00
3	dac3a1e1-ed4b-487e-9382-3119fda114d8	102e20fe-b7a4-4327-a09c-e2ad501656d0	36	2026-02-18 09:54:39.490744+00
4	f38761a1-36cf-48d7-84a6-acedfa0bfe48	102e20fe-b7a4-4327-a09c-e2ad501656d0	37	2026-02-18 10:18:19.639141+00
5	8a61e287-bcb9-475d-9784-7ad952aeebfa	102e20fe-b7a4-4327-a09c-e2ad501656d0	36	2026-02-18 11:10:50.754706+00
6	ae87c0fc-0270-4886-a0db-134d1436af83	102e20fe-b7a4-4327-a09c-e2ad501656d0	36	2026-02-18 11:29:37.291549+00
7	fbab9ff0-04d8-475c-a334-65f0eaffb0d7	102e20fe-b7a4-4327-a09c-e2ad501656d0	36	2026-02-18 12:27:41.682934+00
8	42ff7cfe-30d4-497a-9ddf-3e7f7f7d8fa5	102e20fe-b7a4-4327-a09c-e2ad501656d0	36	2026-02-18 17:24:35.539161+00
9	cbfaaad6-3ad3-4666-887b-7676e2946536	102e20fe-b7a4-4327-a09c-e2ad501656d0	36	2026-02-19 16:51:41.674529+00
10	d8e067f4-cbb6-48e6-99fc-ff3000c806fd	102e20fe-b7a4-4327-a09c-e2ad501656d0	36	2026-02-19 17:36:32.770121+00
11	b26fe75f-b672-4456-91af-2a73bcc200c3	102e20fe-b7a4-4327-a09c-e2ad501656d0	36	2026-02-19 18:54:42.757565+00
12	24601af4-bb29-4b87-a05f-16be19bab405	102e20fe-b7a4-4327-a09c-e2ad501656d0	36	2026-02-20 11:07:41.21931+00
13	8bdc5fba-a60c-4fe0-a2e8-3dbd680a4ce9	102e20fe-b7a4-4327-a09c-e2ad501656d0	36	2026-02-20 11:36:04.251944+00
14	d7f5258f-0df5-4487-96df-6b110cb9d3a1	102e20fe-b7a4-4327-a09c-e2ad501656d0	38	2026-02-20 11:53:15.493829+00
15	b785ae24-0f07-4a8c-8640-bfbdfcd221b5	102e20fe-b7a4-4327-a09c-e2ad501656d0	36	2026-02-21 12:02:37.662637+00
16	83972de9-1e53-43f7-8c2b-5681430fdc3d	102e20fe-b7a4-4327-a09c-e2ad501656d0	37	2026-02-21 15:18:55.620186+00
17	8b95f5a2-bbd4-4463-8e21-b766814a9dea	102e20fe-b7a4-4327-a09c-e2ad501656d0	36	2026-02-23 10:48:42.720901+00
18	7d52fca5-61dc-4fef-9eb0-fd155a7dea5c	102e20fe-b7a4-4327-a09c-e2ad501656d0	36	2026-02-25 13:14:32.173448+00
19	bfa46636-f540-4f40-aa06-39bb121bcaed	102e20fe-b7a4-4327-a09c-e2ad501656d0	36	2026-02-25 14:56:25.698009+00
20	953b8989-dbbd-4a75-a7de-9f678546b578	102e20fe-b7a4-4327-a09c-e2ad501656d0	36	2026-02-25 15:18:28.615187+00
21	1caee3cf-d49a-4da1-b082-2116a7d64705	102e20fe-b7a4-4327-a09c-e2ad501656d0	36	2026-02-25 17:18:06.757376+00
22	1cf9a089-2283-4c72-8a1a-528e88ed026f	102e20fe-b7a4-4327-a09c-e2ad501656d0	36	2026-03-02 17:28:10.039122+00
23	bfe57a20-f586-4e44-92a4-54580319b6af	102e20fe-b7a4-4327-a09c-e2ad501656d0	37	2026-03-03 10:19:02.114869+00
24	df0e335e-3fec-406b-9536-ae063238bb9a	102e20fe-b7a4-4327-a09c-e2ad501656d0	36	2026-03-03 11:14:30.709029+00
25	9f215c9c-2bf3-4333-bc5f-86f25f3a3081	102e20fe-b7a4-4327-a09c-e2ad501656d0	36	2026-03-03 14:41:42.621596+00
26	336d82d1-6831-4b8a-afb3-1e92e570caf0	102e20fe-b7a4-4327-a09c-e2ad501656d0	14	2026-03-03 17:42:13.654748+00
27	2521aa51-951f-4491-a607-25d86ff178ef	102e20fe-b7a4-4327-a09c-e2ad501656d0	1	2026-03-03 18:14:32.498176+00
28	cd452b73-f25d-404a-bf30-31ab1b32e015	102e20fe-b7a4-4327-a09c-e2ad501656d0	7	2026-03-04 17:11:43.511562+00
29	99a52099-e563-4337-bee7-b104debd1c3f	102e20fe-b7a4-4327-a09c-e2ad501656d0	1	2026-03-19 15:13:13.656817+00
30	5fa964cf-4bd0-4673-832c-c4f2d1b535ea	102e20fe-b7a4-4327-a09c-e2ad501656d0	1	2026-03-23 19:35:53.555624+00
31	ae468064-2487-42f5-ac28-7e4298152d55	102e20fe-b7a4-4327-a09c-e2ad501656d0	2	2026-03-26 21:10:20.805896+00
32	dfd68e72-bb33-4da1-af91-b53613634690	102e20fe-b7a4-4327-a09c-e2ad501656d0	1	2026-03-30 20:26:23.556676+00
33	95c18d1f-9544-49e5-869f-e8ee98d59779	102e20fe-b7a4-4327-a09c-e2ad501656d0	1	2026-03-31 07:22:23.553757+00
34	9a841b94-fb16-4f08-aeac-dd9742b22b7f	102e20fe-b7a4-4327-a09c-e2ad501656d0	1	2026-04-02 13:52:01.829999+00
\.


--
-- Data for Name: bracket_matches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bracket_matches (id, season_id, tournament_id, phase, match_order, home_team_id, away_team_id, home_score, away_score, winner_id, status, match_id, seed, created_at) FROM stdin;
\.


--
-- Data for Name: captain_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.captain_profiles (id, user_id, full_name, identification_number, phone, email, address, emergency_contact, emergency_phone, observations, created_at, updated_at, identification_type, division_id) FROM stdin;
d4fb4f26-6232-48eb-94bb-8a04c48bd492	a248fbb7-f9ed-4626-aab0-a478e1dc8ccf	david	jskjsjsks 	682287161	sheylagaona312@gmail.com	\N	\N	\N	\N	2026-03-04 10:13:26.003254+00	2026-03-04 10:13:26.003254+00	DNI	\N
c56ca6cd-6f77-4047-81b2-81b2b4ae4988	dceb6fcb-3a93-4846-b305-7c7c6a8b8709	Eduardo Castillo	z34567809c	+34627867436	eduardo.castillo@gruposalus.com.mx	CARR CANCUN - TULUM KM 307 MZ 329 LT 9				2026-03-04 10:38:24.340679+00	2026-03-04 10:39:07.195473+00	NIE	\N
6db63997-f82e-4f99-a5a6-7e548841cfc2	26674c0d-f51f-44d3-84b3-8ebc052fdde3	Claudia Fajardo	z245038M9	637896456	cjfajardo@yahoo.com	\N	\N	\N	\N	2026-03-17 17:57:17.429877+00	2026-03-17 17:57:17.429877+00	NIE	\N
ac06afd3-a47e-4d3f-9d6e-0a2e93d3f6ad	fa02b729-5488-4898-8e68-456f1f7c1e48	CARLOS FAJARDO	z245038M9	89098765	claudia.fajardo@gruposalus.com.mx	\N	\N	\N	\N	2026-03-17 18:51:50.068285+00	2026-03-17 18:51:50.068285+00	DNI	\N
98033127-995d-4c4b-8c76-df98fd52dc81	ac8eca36-dd3f-4aab-ba50-653852f29d5f	C├®sar Francisco 	T831664	642576528	cesar99alvarenga@gmail.com	Carlos haya 	643481526	643481526	Nada	2026-03-17 19:45:42.73942+00	2026-03-17 19:45:42.73942+00	PASAPORTE	\N
f3d3f756-0916-4fb2-a160-2b3418e960c4	edb46209-a717-4a80-aa36-3c01bd331484	Miguel Sebasti├ín ramos	Y6440841G	691509073	sebas95ramos@gmail.com	Calle monda 11	\N	\N	\N	2026-03-18 21:30:27.399153+00	2026-03-18 21:30:27.399153+00	NIE	\N
69c3ff10-6108-481e-ba6d-e86e0b7ec570	d1acdb9d-3730-4708-a438-16f93708cfed	Julio David Franco 	A005223	604176346	francojuliodavid78@gmail.com	Padre lerchundi 5			Anotar a m├¡ equipo\n\n\n\n\n	2026-03-18 13:10:20.988126+00	2026-03-19 08:17:38.777716+00	PASAPORTE	\N
3707b217-a43a-4ec3-b24c-63275a75663d	1acdd179-7fd9-407b-8e84-40a0ef9d86db	Eduardo Castillo Munch	z34567809c	+34 627867636	ecastm@gmail.com	CAMINO DE LA DESVIACION 7 Bloq 3 Apto 1B	\N	+34 627867636	\N	2026-03-19 13:09:19.050794+00	2026-03-19 13:09:19.050794+00	DNI	\N
1ba223a2-b33b-49a9-8c1f-5fbd8f2e4d56	717e578d-7b85-45a2-a56a-8ed083a9b70c	Carlos David Arias	T 794935	603431277	carlosdavidarias124@gmail.com	H├®roe de sotoa 73	143	\N	\N	2026-03-20 08:48:32.607274+00	2026-03-20 08:48:32.607274+00	PASAPORTE	\N
be4fa60a-7e4e-4981-9586-178444bdfb70	8318b642-2210-4d24-80a4-de52e7e84202	Jose Torres	A036410	624079732	torresjo2002@gmail.com	\N	\N	\N	\N	2026-03-20 12:54:40.454825+00	2026-03-20 12:54:40.454825+00	PASAPORTE	\N
7bf7ba96-002d-4a44-bc8c-af315654929a	99365d73-c10e-461e-9362-b04c6ed3b175	Nestor Fabian Benitez	77956889E	603446106	winey7911@gmail.com	Calle almeria 57	\N	\N	\N	2026-03-20 21:02:22.975247+00	2026-03-20 21:02:22.975247+00	DNI	\N
86c6847f-6c7b-499a-8060-52bad2eb19e6	dd357587-c4e2-431e-9a55-7a0325d6c9d8	Alexis 	Z3435890V	634261552	alexisparedesbritos56@gmail.com	Call├® Concejal pedro Ruz Garc├¡a 	\N	\N	\N	2026-03-22 22:33:51.791469+00	2026-03-22 22:33:51.791469+00	NIE	\N
c7899fc8-6b9d-45f3-abbd-7fef045aa1e2	7acf2739-1e28-411a-a8ab-d04f974030c5	Lorenzo Augusto Ocampos Macchi	Y8498512A	631770002	ocamposlorenzo998@gmail.com	Calle Marmoles 39	Sonia Bernal 	632363676		2026-03-18 17:27:24.215041+00	2026-03-23 12:22:45.765588+00	NIE	\N
b18718b8-d77e-41b4-83ca-121f67e78e40	49922ee1-6306-48f3-abcb-de8026c6ce59	eduardo castilllo	z2450398y	62787655	ecastm2@yahoo.com	\N	\N	\N	\N	2026-03-24 10:50:20.522233+00	2026-03-24 10:50:20.522233+00	DNI	\N
3bc323a0-e00b-4dab-912d-d8039a4258b0	3832b4c5-e4f0-4ed5-9661-ea487d638d8e	Jhonatan alejandro	C311534	631241997	alejandrovillalba0014@gmail.com	Calle san patrio 8	\N	\N	\N	2026-03-30 09:52:46.9932+00	2026-03-30 09:52:46.9932+00	PASAPORTE	\N
9183576f-7767-4943-b3ed-71f671f17fef	069d6191-ba75-4291-84bc-8ba9a4af31f2	Gonzalo Tuma Ram├¡rez 	Y2577445x c	642323128	richardtuma19@gmail.com	Calle Pelayo 14	642323187	642323187	Campe├│n 	2026-03-31 08:48:59.36108+00	2026-03-31 08:48:59.36108+00	DNI	\N
e33565bb-650b-4f2e-8499-af82d19c27c2	d04be537-adfa-4eb0-b288-ef8d13e37568	Daniel Medina Vargas	33008407A	631809655	danielmedinavargas@hotmail.com	29751	\N	\N	\N	2026-04-02 11:28:17.783296+00	2026-04-02 11:28:17.783296+00	DNI	\N
0e6675c6-4f73-4b82-9ff6-59428bff9bf4	59b39d53-da4e-4dcd-8166-4fafb641bec6	alejandro vera gaona	77238190G	661658956	alejandroveragaona2008@gmail.com	albaro de luna 15	661658956	661658956	\N	2026-04-02 11:34:28.035224+00	2026-04-02 11:34:28.035224+00	DNI	\N
b5d71848-3341-4777-8050-b292d70791e4	2cf3faf6-c8a8-41cf-88f7-dec1687de700	Sebasti├ín Ortega 	Sebas2308	600990757	23sebastian.ortega@gmail.com	Av conde de San Isidro 18 2b	\N	\N	\N	2026-04-02 22:59:01.828552+00	2026-04-02 22:59:01.828552+00	NIE	\N
7b2f2fd0-a64d-4369-a5a7-4deae5666487	0b805314-0014-4a84-858d-0664b8d66372	Sebasti├ín Ortega 	Y1876336x 	600990757	mishykt@hotmail.es	Av conde de San Isidro 18 2b	\N	\N	\N	2026-04-03 21:56:45.910991+00	2026-04-03 21:56:45.910991+00	NIE	\N
46319afe-883b-4dff-9fba-8cdbfdce9588	c92827ef-fd0e-40fa-93f2-9ee2cc31f7e0	Antonio Gutierrez	Y8107068L	617181231	34069177belgrano@gmail.com	Calle Virgen De La Concepci├│n 2	617181231	\N	\N	2026-04-04 16:36:12.444689+00	2026-04-04 16:36:12.444689+00	DNI	\N
b4082d13-d6fe-4613-86ee-b084f0c63baf	1cbeade8-e712-486a-ad25-761c07069337	David Arias	Z43833952L	602431277	davidariascarlosdamianbeniten@gmail.com	\N	\N	\N	\N	2026-04-05 13:42:45.69454+00	2026-04-05 13:42:45.69454+00	PASAPORTE	\N
7c69cabb-04a9-4e88-8225-248d409b2a28	881b9ea8-b0e0-49aa-b7ce-8ac295ee92fc	Arnaldo	Z1014024m	602464931	ArnaldoRoman02@gmail.com	\N	\N	\N	\N	2026-04-05 16:45:56.407952+00	2026-04-05 16:45:56.407952+00	DNI	\N
37e528e4-b46a-43d1-be0b-febcfd784d00	920718d1-51ed-465c-857b-6dadd0bf3c2f	Marcelo Santacruz Cardozo	Z0535609J	632746505	marcelitosantacruzcardozo.91@gmail.com	Calle Ronda 26	\N	\N	\N	2026-04-07 14:06:38.999451+00	2026-04-07 14:06:38.999451+00	NIE	\N
076494cb-d65d-4de8-87e1-8d740244b4ed	2b208810-3b5c-4618-9114-e95a5b5586b8	Hugo Farina	Y6266464J	642452007	hugofarina99@gmail.com	Saladero viejo 	642452007	642452007	Albiroja Torre - V├®lez 	2026-04-08 08:18:11.656232+00	2026-04-08 08:18:11.656232+00	NIE	\N
3ea0d749-3d99-48c9-905d-3d4cb3460656	70d57a75-6f58-4b36-a288-8af3a4e93bc3	Fernando	60655829E	611150364	fernando.nbogado@gmail.com	\N	\N	\N	\N	2026-04-08 12:41:16.435585+00	2026-04-08 12:41:16.435585+00	DNI	\N
52cfd60b-1fab-41ad-9890-450136d145ac	b6268ee7-63d3-4fc5-9fd6-1d51ef64169e	Richard Cabral	A105339	614 49 59 95 	richard.cabral.758@gmail.com	Avenida Nuestra Se├▒ora de las Gu├¡as 9	\N	\N	\N	2026-04-08 18:27:06.786302+00	2026-04-08 18:27:06.786302+00	PASAPORTE	\N
b44ddbef-9721-43f6-9275-429d43c4fbb4	9c4b0e49-7e46-48e8-b491-880890333081	Richard Cabral 	A105339	614 49 59 95 	galeanocamila32@gmail.com	Avenida Nuestra Se├▒ora de las Gu├¡as 9	\N	\N	\N	2026-04-08 19:10:04.723494+00	2026-04-08 19:10:04.723494+00	PASAPORTE	\N
\.


--
-- Data for Name: competition_rules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.competition_rules (id, category_id, format_type, points_win, points_draw, points_loss, round_robin, teams_per_division, promotion_count, relegation_count, federated_limit, plus30_rules, rules_version, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: competition_seasons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.competition_seasons (id, category_id, tournament_id, rules_id, rules_version, name, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: contact_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contact_messages (id, contact_name, phone, email, comments, status, created_at) FROM stdin;
b5453287-aa9e-43c6-923a-ac445997c001	Lorenzo Ocampos	631770002	ocamposlorenzo998@gmail.com	Nombre del Equipo: Tobati Fc	LEIDO	2026-03-18 12:44:02.381385+00
434fb840-3715-4d92-9931-2a5a91781961	Juan Nu├▒ez Martin	643065282	alandalusleaks@gmail.com	Llevamls mucho jugando juntos y somos unas 15 personas 	RESPONDIDO	2026-03-16 12:31:37.459658+00
1351681c-d2fa-4aae-b42a-4171be9ba244	Daniel Vacas P├®rez 	673585995	danivp214@gmail.com	Buenas quer├¡a saber si hay alguna posibilidad de ponerme en contacto con los club por si le hace falta jugador 	RESPONDIDO	2026-03-05 14:51:47.70694+00
26850b45-ae9e-4eea-aa24-5a00a7df99fb	Jos├® Torres 	624079732	torresjo2002@gmail.com	Sp.Tobati 	NUEVO	2026-03-19 13:02:25.513279+00
033c3735-1030-44b1-8069-1bc3895c1766	Carlos David arias	603431277	carlosdavidarias124@gmail.com	carlosdavidarias124@gmail.com	NUEVO	2026-03-19 20:47:06.120339+00
23de3e4a-b11e-457f-b43a-e3c4bf05baa2	Nestor Fabian Benitez	603446106	winey7911@gmail.com	Quiero inscribir mi equipo para el torneo EL PALO FC. +30	NUEVO	2026-03-20 20:58:39.722718+00
2d242df6-50ec-42b2-8956-48b83534b0d9	Santo Domingo 	634261552	alexisparedesbritos56@gmail.com	A por el campeonato 	NUEVO	2026-03-22 22:30:45.270362+00
0bf44b11-15c8-4876-928a-38192b256c3b	Christian 	604455208	christianstellabotte@gmail.com	Me interesa mas informaci├│n de los torneos	NUEVO	2026-03-28 19:28:50.391412+00
ff4c1f60-be21-4b02-a279-ddf6b103e0bc	Cristian 	744737276	carraquecristianperez@gmail.com	Para informaci├│n 	NUEVO	2026-03-29 10:54:44.923566+00
815f12b3-5b66-4670-bad4-fdd8e5fe0c80	Millonarios 	631241997	alejandrovillalba0014@gmail.com	Equipaso tenemos	NUEVO	2026-03-30 09:49:36.361479+00
94121158-d232-4252-b3bf-bf3306c13e5c	Millonaros + 30	631241997	alejandrovillalba0014@gmail.com	Lindo tornei	NUEVO	2026-03-30 09:50:14.001903+00
54214a7b-880c-46c8-9f86-973ebbfb1588	Millonaros + 30	631241997	alejandrovillalba0014@gmail.com	Lindo toneo	NUEVO	2026-03-30 09:56:12.427851+00
e9cd21a2-f206-4720-9ef7-75fa8469f820	Hugo Farina	642452007	hugofarina99@gmail.com	Albiroja Torre - V├®lez \n18 jugadores entre libre y + 30	NUEVO	2026-04-06 11:16:48.428208+00
c4183bdd-1759-4ace-8992-9ff3804290d0	Hugo Fari├▒a 	642452007	hugofarina99@gmail.com	Albiroja torre - V├®lez estil├│ libre y + 30	NUEVO	2026-04-08 08:33:09.420562+00
2edab81a-c1e9-4e93-ad96-120c322c6550	gerardo mendoza	663173721	gerardomendoz680@gmail.com	Albirroja V├®lez y torre	RESPONDIDO	2026-04-09 07:34:14.560701+00
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
e22ae070-36b7-4591-950e-f0216b8a7bb2	Primera Divisi├│n	PRIMERA	M├íxima categor├¡a	2026-02-18 12:10:37.549125+00
dd036abe-f19c-4a6f-8fe2-231aa5582882	Segunda Divisi├│n	SEGUNDA	Segunda categor├¡a	2026-02-18 12:10:37.575956+00
2cec8476-a224-41d5-b597-388fc05c2c75	+ 30	SEGUNDA	Torneo libre +30	2026-03-04 09:56:01.956136+00
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expenses (id, tournament_id, concept, amount, expense_at, notes, receipt_url, created_at) FROM stdin;
ffbe099a-a1f9-4975-8f78-390a8d378b1c	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	F├®nix 	40	2026-04-05	Detrecho de partido 	\N	2026-04-05 10:11:32.781245+00
\.


--
-- Data for Name: fine_payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fine_payments (id, tournament_id, team_id, amount, notes, paid_at, created_at, fine_id) FROM stdin;
\.


--
-- Data for Name: fines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fines (id, tournament_id, match_id, match_event_id, team_id, player_id, card_type, amount, status, paid_amount, paid_at, created_at) FROM stdin;
720bd322-0d75-409b-bc20-d526ebf1322e	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	75939d11-ee34-4abd-929c-01d374a34eba	\N	91cf16fd-0336-4df0-a15a-25e820eed7b5	\N	NO_PRESENTADO	15	PENDIENTE	\N	\N	2026-04-05 11:53:02.575448+00
\.


--
-- Data for Name: marketing_media; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.marketing_media (id, title, description, type, url, thumbnail_url, tournament_id, created_at) FROM stdin;
b37ee0c1-0e1c-4983-bb48-03e9f8c76596	IMG_2851	\N	PHOTO	/objects/uploads/8706f3b9-e3a0-4c17-8035-7ad84516e8c7	\N	\N	2026-02-26 10:45:36.230112+00
cf5f514c-ad15-4520-ada2-b19e75d4a687	b70b3cad-7145-4120-bea8-a453262a1acf	\N	PHOTO	/objects/uploads/063a9661-c7a0-4f56-9d0e-685c07791f29	\N	\N	2026-02-26 10:45:38.03265+00
3b8792cd-b782-485a-9ee8-0a9c3a2f32d5	IMG_2546	\N	PHOTO	/objects/uploads/1663a1ee-eac1-4208-a6c9-aed7b954a302	\N	\N	2026-02-26 10:45:39.624282+00
17674f93-6656-4a79-98f4-a97256a4255b	IMG_2545	\N	PHOTO	/objects/uploads/b23139ab-f798-4a69-b5be-8682be1b8843	\N	\N	2026-02-26 10:45:41.202078+00
83a1cd90-3222-40c6-9f9c-db3489d893a3	IMG_2544	\N	PHOTO	/objects/uploads/09b3f194-762b-4629-af61-62764366f3b5	\N	\N	2026-02-26 10:45:42.806472+00
e972ac3b-9036-43b7-9541-7c63259747d0	IMG_2543	\N	PHOTO	/objects/uploads/b79913e1-7bc2-47c7-8669-0b6c37b04868	\N	\N	2026-02-26 10:45:44.291552+00
03cf4e31-8dae-47fd-9403-a1d72f6796ba	IMG_2540	\N	PHOTO	/objects/uploads/f32d2ebd-e9e4-4ad5-9e11-af3488ff220a	\N	\N	2026-02-26 10:45:46.201137+00
f04004cc-a84b-422f-a3c1-dd21c56b8d11	IMG_2539	\N	PHOTO	/objects/uploads/a2ec5845-caa5-4a61-85a6-6d23bf388f17	\N	\N	2026-02-26 10:45:47.928942+00
8e709555-5f8f-425e-9b28-51258e826b0c	IMG_2541	\N	PHOTO	/objects/uploads/6b0d1121-cb3c-4a9b-b260-36a36b1768ae	\N	\N	2026-02-26 10:45:50.847493+00
a8bd860d-13ee-40d4-955f-7571f7e19308	IMG_2538	\N	PHOTO	/objects/uploads/6013cf39-1b1b-4109-8dd7-e4fe086e6d5e	\N	\N	2026-02-26 10:45:52.651725+00
\.


--
-- Data for Name: match_attendance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.match_attendance (id, match_id, team_id, player_id, present, created_at) FROM stdin;
e8823ab7-3bcc-4fd8-a421-6c4a84a70bce	6eda79da-488c-457a-9b5e-9814c70c133c	3504f2dc-9798-4e8f-b754-6568193dffcd	3e6917e4-321c-4729-a691-b2ae1a84355d	f	2026-04-05 12:14:32.173227+00
53b72aa1-0d3c-4272-8e0a-caf5d2ce535a	6eda79da-488c-457a-9b5e-9814c70c133c	3504f2dc-9798-4e8f-b754-6568193dffcd	2cbf5943-d082-4e48-ac88-01fc0d3bfc51	t	2026-04-05 12:14:32.20548+00
acce4d40-562e-4318-bf10-75f394de2127	6eda79da-488c-457a-9b5e-9814c70c133c	3504f2dc-9798-4e8f-b754-6568193dffcd	026e38a5-57e8-4f64-bad0-537bf6edace8	t	2026-04-05 12:14:32.227774+00
5fe113ee-9461-42af-b679-190c016b95b9	6eda79da-488c-457a-9b5e-9814c70c133c	3504f2dc-9798-4e8f-b754-6568193dffcd	0594bc06-1032-4286-92e7-f4f56251390d	t	2026-04-05 12:14:32.249746+00
c3693a76-1b61-46a9-a324-dca17dc704a0	6eda79da-488c-457a-9b5e-9814c70c133c	3504f2dc-9798-4e8f-b754-6568193dffcd	87569fbb-deb3-4246-b377-31a694b7d2e5	f	2026-04-05 12:14:32.272248+00
2efea6ab-dd3b-492f-923f-c4be67268aaf	6eda79da-488c-457a-9b5e-9814c70c133c	3504f2dc-9798-4e8f-b754-6568193dffcd	75b89f5b-3b27-452c-8e36-bd450a20aa71	t	2026-04-05 12:14:32.294139+00
61804f49-2a37-4237-b2af-951565a3a6cb	6eda79da-488c-457a-9b5e-9814c70c133c	3504f2dc-9798-4e8f-b754-6568193dffcd	ffd247dc-262d-4c21-83c9-63dd1123e42d	t	2026-04-05 12:14:32.316254+00
4fadf8bf-e4ec-4d88-81ac-b3f0cf6f08c5	6eda79da-488c-457a-9b5e-9814c70c133c	3504f2dc-9798-4e8f-b754-6568193dffcd	68ead805-b19f-4a0a-a8e6-3b46da41e36e	t	2026-04-05 12:14:32.338262+00
1095e850-0a9c-42c6-943d-b9a45ec63b1d	6eda79da-488c-457a-9b5e-9814c70c133c	3504f2dc-9798-4e8f-b754-6568193dffcd	01d697a4-de36-4ebe-b2c3-ddfdd83dda77	f	2026-04-05 12:14:32.360087+00
68020ceb-9775-4273-ad21-18937bc10d7f	6eda79da-488c-457a-9b5e-9814c70c133c	3504f2dc-9798-4e8f-b754-6568193dffcd	890a113f-0f1e-4950-91f4-a4a7d0f6841e	f	2026-04-05 12:14:32.382418+00
9a87ca06-a9ff-430c-aae9-7b48d3d29eee	6eda79da-488c-457a-9b5e-9814c70c133c	3504f2dc-9798-4e8f-b754-6568193dffcd	adac41bd-ad37-477e-a08d-e224c1648e45	f	2026-04-05 12:14:32.404616+00
49902760-d6a7-46af-852f-ff1ef9b98be0	6eda79da-488c-457a-9b5e-9814c70c133c	3504f2dc-9798-4e8f-b754-6568193dffcd	1c6b5c99-984a-4ace-9665-4be63bf5bcc2	t	2026-04-05 12:14:32.42667+00
e49bb78c-8218-4d3a-8147-2b5a869e08af	6eda79da-488c-457a-9b5e-9814c70c133c	3504f2dc-9798-4e8f-b754-6568193dffcd	a371d434-1dbc-4ac7-aa7d-e56edbf6991f	f	2026-04-05 12:14:32.449281+00
9ebdc7c2-eb70-4639-adc3-4363418a6dee	6eda79da-488c-457a-9b5e-9814c70c133c	3504f2dc-9798-4e8f-b754-6568193dffcd	fbb4fb3a-cfb9-4c06-b74a-28f1758d50e0	f	2026-04-05 12:14:32.471698+00
8c800a58-7fda-4c41-a1ce-80a62caca857	6eda79da-488c-457a-9b5e-9814c70c133c	a0b6f286-9313-4773-81b2-55c8b131f22f	416c0f0c-dc9a-4abb-ab68-1454f6ead91c	t	2026-04-05 12:14:32.777481+00
56f879ee-9492-4289-9cc8-93c889458fb8	6eda79da-488c-457a-9b5e-9814c70c133c	a0b6f286-9313-4773-81b2-55c8b131f22f	125bac75-d370-47fe-9a31-67836c91d5e1	t	2026-04-05 12:14:32.799699+00
8b33d82b-fe85-459a-80f2-e53a6ea88cac	6eda79da-488c-457a-9b5e-9814c70c133c	a0b6f286-9313-4773-81b2-55c8b131f22f	d405579a-acb0-4fb8-bb86-d2f8fdc77c01	t	2026-04-05 12:14:32.821868+00
698c72f7-86b1-4477-a744-a1a509eda7f8	6eda79da-488c-457a-9b5e-9814c70c133c	a0b6f286-9313-4773-81b2-55c8b131f22f	7fc1ef36-c4a4-4b00-960a-10e4d4f8f47d	t	2026-04-05 12:14:32.844086+00
4f09fdfe-c91f-4630-b999-ca5fe297620e	6eda79da-488c-457a-9b5e-9814c70c133c	a0b6f286-9313-4773-81b2-55c8b131f22f	16d38df5-effc-4331-b62e-595651a64e7f	t	2026-04-05 12:14:32.866084+00
325aa159-2a4e-4651-b246-b88bb23d8b79	6eda79da-488c-457a-9b5e-9814c70c133c	a0b6f286-9313-4773-81b2-55c8b131f22f	af8b0592-fbc1-4d1f-9fbf-53f7a19229d3	t	2026-04-05 12:14:32.888234+00
eb9f0252-f680-46cc-ad2a-c50adbacd238	6eda79da-488c-457a-9b5e-9814c70c133c	a0b6f286-9313-4773-81b2-55c8b131f22f	2dc16817-8c99-4069-9268-67e0bc525cfd	t	2026-04-05 12:14:32.910582+00
e0386fc7-e43b-43f7-bdb8-877e6f7c0645	6eda79da-488c-457a-9b5e-9814c70c133c	a0b6f286-9313-4773-81b2-55c8b131f22f	c087e178-8840-45c5-a380-53e006f54e78	t	2026-04-05 12:14:32.932934+00
fb167e2d-4e1e-4131-b79c-10973c3cb08c	6eda79da-488c-457a-9b5e-9814c70c133c	a0b6f286-9313-4773-81b2-55c8b131f22f	b7cd6dca-b6cf-4a8f-8d53-7c376765f5b5	t	2026-04-05 12:14:32.955277+00
236ecf98-7858-4be9-b8de-a73df14045d9	6eda79da-488c-457a-9b5e-9814c70c133c	a0b6f286-9313-4773-81b2-55c8b131f22f	e85b7bda-248b-4b52-88a1-209bf28e738d	t	2026-04-05 12:14:32.977688+00
3adde555-29bc-4bbc-9249-d21459c4ccb4	75939d11-ee34-4abd-929c-01d374a34eba	91cf16fd-0336-4df0-a15a-25e820eed7b5	3891bb55-c45a-4129-a573-fe4d0362f341	t	2026-04-05 12:02:33.028388+00
9615d85f-28a1-47fa-957b-bf3b6885b406	75939d11-ee34-4abd-929c-01d374a34eba	91cf16fd-0336-4df0-a15a-25e820eed7b5	99b28caa-5d76-4f5b-91d6-e12457e861eb	t	2026-04-05 12:02:33.050252+00
78215311-a1dc-42af-9b7a-a52fe9963000	75939d11-ee34-4abd-929c-01d374a34eba	91cf16fd-0336-4df0-a15a-25e820eed7b5	bb8b5e60-d9bf-43ce-b066-d90d9aac44cf	t	2026-04-05 12:02:33.072096+00
78afce43-3f8d-4fed-bbd6-cebd78ce2f90	75939d11-ee34-4abd-929c-01d374a34eba	91cf16fd-0336-4df0-a15a-25e820eed7b5	a429b86a-e374-449b-921b-b7d6b19b757c	f	2026-04-05 12:02:33.093367+00
a6e99703-79eb-445e-9fea-3a7ea2b73f7c	75939d11-ee34-4abd-929c-01d374a34eba	91cf16fd-0336-4df0-a15a-25e820eed7b5	7b7237ba-63ce-4a79-a97e-ab6f4d569d80	f	2026-04-05 12:02:33.114337+00
e0838ecf-6cdb-4bea-9dee-f228f8c342aa	75939d11-ee34-4abd-929c-01d374a34eba	91cf16fd-0336-4df0-a15a-25e820eed7b5	a1f46406-2275-4e6b-919b-a5932521a203	t	2026-04-05 12:02:33.135422+00
ccd3ff0d-f120-437f-9084-71a0a95e4ae8	75939d11-ee34-4abd-929c-01d374a34eba	91cf16fd-0336-4df0-a15a-25e820eed7b5	c4fdbcf5-7e80-48e9-801d-4a0c60ed785d	t	2026-04-05 12:02:33.156618+00
74b0126b-b956-4a82-ae2e-369118c72ab8	75939d11-ee34-4abd-929c-01d374a34eba	6dc24c30-97fe-410a-8bf4-f096507da76c	1926f2f6-fb54-4ab7-8fe2-21d10ed57b1f	t	2026-04-05 12:02:33.404809+00
27ee9da3-7cba-4b40-8b8c-390e1f5cfda0	75939d11-ee34-4abd-929c-01d374a34eba	6dc24c30-97fe-410a-8bf4-f096507da76c	257eb3a4-bada-4919-9d77-cdabffcb087c	t	2026-04-05 12:02:33.425957+00
727738c5-95da-4461-b6c0-375f1f07eb2d	75939d11-ee34-4abd-929c-01d374a34eba	6dc24c30-97fe-410a-8bf4-f096507da76c	d0e7c77c-c9d9-45f5-b22b-fa6a3aaa4636	t	2026-04-05 12:02:33.447068+00
e9410dee-3bb5-431c-8810-d6ef21232093	75939d11-ee34-4abd-929c-01d374a34eba	6dc24c30-97fe-410a-8bf4-f096507da76c	0a1e5f14-bfe7-431d-be98-393471151673	t	2026-04-05 12:02:33.468203+00
652bf177-1fa1-41d7-b1eb-6fee574468f7	75939d11-ee34-4abd-929c-01d374a34eba	6dc24c30-97fe-410a-8bf4-f096507da76c	5b78461d-7ea4-43e3-8d26-0139d6950324	t	2026-04-05 12:02:33.489891+00
06758663-c695-4e53-8380-0f4d7b91219d	75939d11-ee34-4abd-929c-01d374a34eba	6dc24c30-97fe-410a-8bf4-f096507da76c	d4a530b0-195a-41af-b275-fa90b18927fd	t	2026-04-05 12:02:33.511686+00
cbdfa69b-4ab4-4719-9c68-c4039e108173	75939d11-ee34-4abd-929c-01d374a34eba	6dc24c30-97fe-410a-8bf4-f096507da76c	f433d998-5c0e-46cf-b66f-69ec03c9d164	f	2026-04-05 12:02:33.532906+00
c1e482e0-c8d9-456c-b850-a19e0f1c422b	75939d11-ee34-4abd-929c-01d374a34eba	6dc24c30-97fe-410a-8bf4-f096507da76c	e279e0c9-6bb3-4141-ac13-08445f566baa	f	2026-04-05 12:02:33.554285+00
bbb7252c-d67b-4b89-bff7-b7766104917d	75939d11-ee34-4abd-929c-01d374a34eba	6dc24c30-97fe-410a-8bf4-f096507da76c	2e8bb7da-1342-417c-8157-ce999bcf5315	t	2026-04-05 12:02:33.575625+00
baa481f9-eeb2-442e-a360-e273f60f9417	75939d11-ee34-4abd-929c-01d374a34eba	6dc24c30-97fe-410a-8bf4-f096507da76c	b00a7128-9e19-4827-8e0b-24c004e0f75e	t	2026-04-05 12:02:33.596783+00
c004268d-7010-4e79-a155-9e4f641db01f	75939d11-ee34-4abd-929c-01d374a34eba	6dc24c30-97fe-410a-8bf4-f096507da76c	3359f48c-20a7-4487-9cd2-42cf53e5001c	t	2026-04-05 12:02:33.618117+00
011a74f6-668b-4da0-b5ed-6ebf1715b8d6	75939d11-ee34-4abd-929c-01d374a34eba	6dc24c30-97fe-410a-8bf4-f096507da76c	512107ea-ba02-4306-86dd-9d84d884801d	t	2026-04-05 12:02:33.639674+00
d048b489-e158-4485-9c08-32902c299926	75939d11-ee34-4abd-929c-01d374a34eba	6dc24c30-97fe-410a-8bf4-f096507da76c	cc17ab85-9a63-4dde-8e29-890badf37d61	t	2026-04-05 12:02:33.661279+00
870fbda7-89e9-4182-b3e6-8a3fede9b4b0	75939d11-ee34-4abd-929c-01d374a34eba	6dc24c30-97fe-410a-8bf4-f096507da76c	374f23a4-1f86-449f-b8ff-48302121a72c	f	2026-04-05 12:02:33.682654+00
6e25d806-7408-41a9-a1cc-48dc0842aa8f	75939d11-ee34-4abd-929c-01d374a34eba	6dc24c30-97fe-410a-8bf4-f096507da76c	47b25502-9100-44b2-ac30-1ddea5f60e18	t	2026-04-05 12:02:33.70414+00
c30b3887-4124-4b93-becd-6460704a4ee0	75939d11-ee34-4abd-929c-01d374a34eba	6dc24c30-97fe-410a-8bf4-f096507da76c	7991692e-4203-4bc4-b48a-f941e04bcd2e	t	2026-04-05 12:02:33.725509+00
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
-- Data for Name: match_substitutions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.match_substitutions (id, match_id, team_id, player_out_id, player_in_id, minute, reason, created_at) FROM stdin;
\.


--
-- Data for Name: matches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.matches (id, tournament_id, round_number, date_time, field, home_team_id, away_team_id, referee_user_id, status, home_score, away_score, vs_image_url, stage, referee_notes, stage_id, division_id) FROM stdin;
63a29f39-e62d-473c-87c3-f133a5cc4284	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	2	2026-04-11T20:00	Portada alta 	83a1ae9f-d6ff-46c0-9d87-fe384f40e20e	6259d3d1-9cfe-4c19-8b32-f7e6d1433942	\N	PROGRAMADO	\N	\N	/objects/uploads/f62d2d8b-5629-46b1-bace-b44cc377e0a7	\N	\N	\N	2cec8476-a224-41d5-b597-388fc05c2c75
f5103355-8e8a-4d7f-ae71-cef3ef075b1e	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	2	2026-04-12T15:00	Portada alta 	9b66d7b0-3e3b-4a62-82a7-4f1b6258fff8	6dc24c30-97fe-410a-8bf4-f096507da76c	\N	PROGRAMADO	\N	\N	/objects/uploads/fd5cd2d3-f7ac-4b8c-8b48-3dd97aeb9a88	\N	\N	\N	e22ae070-36b7-4591-950e-f0216b8a7bb2
aeafe82e-f54a-4e2a-bafc-d0088192f280	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	2	2026-04-12T16:05	Portada alta 	8615f2fc-0ef4-4b80-8887-1123d3890762	1ebc1b72-055e-4aef-a906-ed0ec11e2840	\N	PROGRAMADO	\N	\N	/objects/uploads/7f64d2c6-3dff-4dfc-a6aa-daae90762374	\N	\N	\N	e22ae070-36b7-4591-950e-f0216b8a7bb2
ddb96f95-5587-4543-9da9-eb5509b02759	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	2	2026-04-12T17:10	Portada alta 	91cf16fd-0336-4df0-a15a-25e820eed7b5	011bbdb9-1e88-495c-97cc-eddb51427c51	\N	PROGRAMADO	\N	\N	/objects/uploads/d073dac6-7128-4c30-9524-68173f2071ce	\N	\N	\N	e22ae070-36b7-4591-950e-f0216b8a7bb2
6043e974-d8ad-442e-a6fb-06794d43ab35	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	2	2026-04-12T18:15	Portada alta 	2e23f2d6-4042-4a94-9ebb-13069e23fc1c	065bfcc2-308e-4fd4-b0f7-e90d5b8b56bc	\N	PROGRAMADO	\N	\N	/objects/uploads/8c6876b0-8d5b-4994-9dba-b5a365e9426e	\N	\N	\N	e22ae070-36b7-4591-950e-f0216b8a7bb2
5a66458b-0196-4a17-9941-4e71d41569da	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	2	2026-04-12T19:20	Portada alta 	0de56b98-1b8a-4dfd-977e-f9939f822c3a	96c15e2e-6ead-444a-8bd0-6ffd12d7d5d1	\N	PROGRAMADO	\N	\N	/objects/uploads/f7c0223c-5810-430d-8bab-0ec5a4cc7be6	\N	\N	\N	e22ae070-36b7-4591-950e-f0216b8a7bb2
95a74a64-6a94-4930-b0af-58bae5e1a098	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	2	2026-04-11T22:00	Portada alta 	34c51dc3-f3ab-4d18-adad-970db3a37784	c3efc237-51c9-471f-a17d-4f90f1f253af	\N	PROGRAMADO	\N	\N	/objects/uploads/338d89f2-9300-4343-b408-ef3c6e86c862	\N	\N	\N	2cec8476-a224-41d5-b597-388fc05c2c75
7ebb6098-f330-4c76-90ea-338fcee01910	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	2	2026-04-11T21:00	Portada alta 	7ad8ae90-c788-41b1-87e3-7b8b8cf95c97	2309b0ff-44cc-4964-b56c-182fe8ebb925	\N	PROGRAMADO	\N	\N	/objects/uploads/1a97ec57-ee5b-4d5a-8406-16dc2eee1ce7	\N	\N	\N	2cec8476-a224-41d5-b597-388fc05c2c75
3bf7763b-3780-4a63-b541-20648398cb80	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	2	2026-04-12T20:25	Portada alta 	f97ec679-d83d-456e-87dd-c20b806bd710	877bccca-879f-4579-8ca3-37ed944e9df7	\N	PROGRAMADO	\N	\N	/objects/uploads/520ad3e1-ce28-4324-8197-a931f85b363a	\N	\N	\N	2cec8476-a224-41d5-b597-388fc05c2c75
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages (id, from_user_id, to_user_id, subject, content, created_at, read_at) FROM stdin;
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
49a8510e-ce2c-4b98-baef-ac79fe05bc61	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	142df60c-a974-4030-8601-7bd12200b6a5	2309b0ff-44cc-4964-b56c-182fe8ebb925	95f15b6f-2c1f-4960-8dfb-35814ea8da69	fcc2602d-a5d7-4cbf-a45e-b7e710a594ce	Doble tarjeta amarilla (roja)	1	ACTIVO	2026-04-07 11:16:29.509508+00
\.


--
-- Data for Name: players; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.players (id, team_id, first_name, last_name, jersey_number, "position", identification_id, photo_urls, is_federated, federation_id, active, identification_type) FROM stdin;
3cc802b2-6eca-4a91-8818-d4f223ace4ba	065bfcc2-308e-4fd4-b0f7-e90d5b8b56bc	Carlos David	Arias	1	Arquero	T 794935	{/objects/uploads/1b9ff8f6-984a-448f-a512-727c4e172d62}	f	\N	t	PASAPORTE
8a574fcf-9b93-4192-bed1-6dba261a0dff	34c51dc3-f3ab-4d18-adad-970db3a37784	Luis Alejandro	Almada Godoy	3	Central	Z0506925X	{/objects/uploads/66e1550a-1bd2-4e7a-9275-9b850b041446}	f	\N	t	NIE
a33e0f9f-b887-484e-a170-bb427ea0676a	34c51dc3-f3ab-4d18-adad-970db3a37784	Francisco Ariel	Gonz├ílez	22	Central	Y8278833C	{/objects/uploads/9273916c-f73e-4929-aa37-e4fcdd93e0cb}	f		t	NIE
cba6ce3a-15e9-4c97-9761-0326f84d89c0	34c51dc3-f3ab-4d18-adad-970db3a37784	Ricardo 	Fern├índez Ruiz	15	Central	Y2889200T	{/objects/uploads/361439cd-9649-46f7-a873-029f2bdf8a5b}	f		t	NIE
c1ce862a-5746-4c7b-9ad5-32a7ecb412f5	34c51dc3-f3ab-4d18-adad-970db3a37784	Francisco Fernando	Montiel	30	Delantero	Y7862212K	{/objects/uploads/0e02ac0d-d56e-4950-86a1-80d8c51c6fea}	f	\N	t	NIE
763bd147-0615-473c-805e-2482da51339e	2e23f2d6-4042-4a94-9ebb-13069e23fc1c	Julio 	Galeano	31	Arquero	R617851	{/objects/uploads/559a4607-b593-492c-8913-845b328076db}	f		t	PASAPORTE
5c3fc88c-b141-4bb4-9678-5db4e80fc6f8	34c51dc3-f3ab-4d18-adad-970db3a37784	Juan Carlos 	Sosa Valdes	2	Lateral Derecho	77798942Q	{/objects/uploads/6865bb80-9a0e-42e5-b6a9-8997563ef8f7}	f		t	DNI
c3d16eeb-8551-44b8-b529-5151abcaa1ed	34c51dc3-f3ab-4d18-adad-970db3a37784	Luis Javier	Presentado Ortega	21	Lateral Izquierdo	4318987R	{/objects/uploads/f4cd8412-fc87-46b5-bde8-3d8b570b3e5d}	f		t	DNI
738a9e8f-ebe9-4073-9a04-0915bbd73bc1	34c51dc3-f3ab-4d18-adad-970db3a37784	Jos├® Armando	Fernandez Portillo	9	Delantero	C351625	{/objects/uploads/fefaabe7-1c61-45a9-b97b-021330a3d99b}	f		t	PASAPORTE
c8ea899a-5183-4376-aee7-342ea43e668a	34c51dc3-f3ab-4d18-adad-970db3a37784	Ruben Dario	Ferreira Dom├¡nguez 	8	Mediocentro	Y8572651J	{/objects/uploads/f7b70295-5caa-4899-ad44-51c93f16d025}	f		t	NIE
d7a7abcd-4997-4149-8917-ef610595dde9	34c51dc3-f3ab-4d18-adad-970db3a37784	Sergio Luis	Mart├¡nez Gonz├ílez 	31	Mediocentro	14054639Y	{/objects/uploads/6b8d4b85-d1d2-41e5-93ba-827c329c0d98}	f		t	DNI
392c83a1-973b-4e63-b68c-4d8db264a70a	34c51dc3-f3ab-4d18-adad-970db3a37784	Julio Cesar 	Franco Arevalos	26	Mediocentro	Y7183453S	{/objects/uploads/8c1496f3-e6d1-4b0f-8be2-de1463cc50ae}	f		t	NIE
3891bb55-c45a-4129-a573-fe4d0362f341	91cf16fd-0336-4df0-a15a-25e820eed7b5	Nestor 	Enciso	19	Defensor	C331791 	{/objects/uploads/d950d1a5-891d-4f58-a9ed-670b00df16af}	f	\N	t	PASAPORTE
0e88d251-32c1-4c7f-a695-7a92b3ed766b	34c51dc3-f3ab-4d18-adad-970db3a37784	Jorge  Dami├ín	Aguirre Qui├▒onez 	7	Delantero		{/objects/uploads/158b0da9-2871-414a-b075-d415f2a5a609}	f		t	DNI
99b28caa-5d76-4f5b-91d6-e12457e861eb	91cf16fd-0336-4df0-a15a-25e820eed7b5	Javier	Esquivel	80	Defensor	S766913	{/objects/uploads/68d7bdd5-54f2-4ef5-adb4-949133f63b9d}	f	\N	t	PASAPORTE
a0b5a140-612d-4429-b36b-fba095a2ba15	2e23f2d6-4042-4a94-9ebb-13069e23fc1c	Toribio 	Ortiz	22	Defensa	Z3342941B	{/objects/uploads/e7569e79-af8b-4825-8208-d604b0521a1a}	f		t	NIE
5c7cb236-af1f-48e4-b36c-2f2ad7358181	2e23f2d6-4042-4a94-9ebb-13069e23fc1c	Sergio 	Vera	11	Mediocampo	S705487	{/objects/uploads/04d7a2bd-44e6-4fd6-883e-fc74ea72f1ab}	t	E0610204	t	PASAPORTE
b59e3182-c037-49c3-836f-afd5d8fe675d	2e23f2d6-4042-4a94-9ebb-13069e23fc1c	Cristian 	Martinez	81	Mediocampo	A183282	{/objects/uploads/2e25c658-9ced-466d-99e7-1e56d20d4277}	f		t	PASAPORTE
2c9dbe6e-f783-411c-9976-cdb0e222999d	2e23f2d6-4042-4a94-9ebb-13069e23fc1c	Jose	Gonzalez	18	Delantero	A322805	{/objects/uploads/54e77762-7705-4f6d-b446-9ca3f86a2f24}	f		t	PASAPORTE
382017e9-cdff-42a0-b4d1-56939f11b0ab	2e23f2d6-4042-4a94-9ebb-13069e23fc1c	Miguel 	Ocampos	8	Mediocampo	Z3002752S	{/objects/uploads/0f4a2aaa-e2ba-4be7-95e1-4f0110944276}	f		t	NIE
bebdc1cc-8a62-4216-ae1c-1312499af17e	2e23f2d6-4042-4a94-9ebb-13069e23fc1c	Lorenzo 	Ocampos	3	Defensa	Y8498512A	{/objects/uploads/6c347656-8758-4781-92f6-9dc3b6250f4a}	f		t	NIE
d54e0394-bb3f-4499-97d6-68a9b5298e29	2e23f2d6-4042-4a94-9ebb-13069e23fc1c	Adolfo	Espinola	12	Arquero	A097137	{/objects/uploads/ddaf147d-fd19-4220-9cde-29cf044989e2}	f		t	PASAPORTE
3e6917e4-321c-4729-a691-b2ae1a84355d	3504f2dc-9798-4e8f-b754-6568193dffcd	Jose	Torres	8	Mediocampista 	A036410	{/objects/uploads/01b351bc-f457-42fb-88a6-5e151bc25a8f}	f	\N	t	PASAPORTE
a0e9336f-a13b-4421-932f-9be9c00b7b91	2e23f2d6-4042-4a94-9ebb-13069e23fc1c	Rodney	Ocampos	4	Defensa	Y9663777L	{/objects/uploads/a3633f30-b2bb-4e62-a77b-9e896c696f22}	f		t	NIE
2cbf5943-d082-4e48-ac88-01fc0d3bfc51	3504f2dc-9798-4e8f-b754-6568193dffcd	Alejandro	Borja 	10	Mediocampista 	A051673	{/objects/uploads/d4e9893f-86f6-45f4-ae56-d064cfdad856}	f	\N	t	PASAPORTE
2c67de4c-1a8f-4db8-80a1-9dfa2f2a1022	2e23f2d6-4042-4a94-9ebb-13069e23fc1c	Nelson	Martinez	24	Delantero	C322088	{/objects/uploads/fd0b0066-674f-4c49-8ec9-26b10ac11d0f}	f		t	PASAPORTE
026e38a5-57e8-4f64-bad0-537bf6edace8	3504f2dc-9798-4e8f-b754-6568193dffcd	Tobias 	Ramos 	6	Mediocampista 	A063504	{/objects/uploads/32a18324-29db-444b-b6fa-c607f7cc8de2}	f	\N	t	PASAPORTE
0594bc06-1032-4286-92e7-f4f56251390d	3504f2dc-9798-4e8f-b754-6568193dffcd	Jose 	L├│pez 	5	Defensor 	A455857	{/objects/uploads/0d0b4856-6790-4b32-a2d3-5d2dab019113}	f	\N	t	PASAPORTE
87569fbb-deb3-4246-b377-31a694b7d2e5	3504f2dc-9798-4e8f-b754-6568193dffcd	Rodrigo 	Gonz├ílez 	13	Mediocampista 	C376696	{/objects/uploads/525ffe66-17ea-48c0-ae13-ee5bfde636bb}	t	\N	t	PASAPORTE
0078c7eb-8572-42e2-bb96-7dc79e8f3d9e	2e23f2d6-4042-4a94-9ebb-13069e23fc1c	Juan 	Qui├▒onez	17	Defensa	A036466	{/objects/uploads/08d2f99a-ab70-4e70-81dc-261ab105c27f}	f		t	PASAPORTE
0a15c1c4-b491-4b19-a09c-5a106e716132	2e23f2d6-4042-4a94-9ebb-13069e23fc1c	Carlos 	Nu├▒ez 	9	Delantero	A022533	{/objects/uploads/f600d9ec-0cd9-40c6-b130-cea0ce90ab96}	f		t	PASAPORTE
75b89f5b-3b27-452c-8e36-bd450a20aa71	3504f2dc-9798-4e8f-b754-6568193dffcd	Alan 	S├ínchez 	4	Defensor 	R620144	{/objects/uploads/b5761bde-e20a-4f82-8d51-1af2b66b03c1}	f	\N	t	PASAPORTE
ffd247dc-262d-4c21-83c9-63dd1123e42d	3504f2dc-9798-4e8f-b754-6568193dffcd	Jos├® Miguel 	Macchi 	17	Defensor 	S776640	{/objects/uploads/7f237ec8-1358-4850-b27f-70db07d43804}	f	\N	t	PASAPORTE
68ead805-b19f-4a0a-a8e6-3b46da41e36e	3504f2dc-9798-4e8f-b754-6568193dffcd	Jes├║s 	Gonz├ílez 	11	Delantero 	A083120 	{/objects/uploads/614890d0-d953-4399-badb-6752e2c946b3}	f	\N	t	PASAPORTE
01d697a4-de36-4ebe-b2c3-ddfdd83dda77	3504f2dc-9798-4e8f-b754-6568193dffcd	Oscar 	Rom├ín 	1	Portero 	A079163	{/objects/uploads/0d3eeaca-944b-4e58-a301-097499dad543}	f	\N	t	PASAPORTE
890a113f-0f1e-4950-91f4-a4a7d0f6841e	3504f2dc-9798-4e8f-b754-6568193dffcd	Oscar 	C├íceres 	20	Defensor 	R526001	{/objects/uploads/bac9c1ef-fe42-4647-8b13-6ec787619888}	f	\N	t	PASAPORTE
adac41bd-ad37-477e-a08d-e224c1648e45	3504f2dc-9798-4e8f-b754-6568193dffcd	Hugo 	Flecha 	70	Delantero 	S722642	{/objects/uploads/b7ba8594-7a94-4f9a-81db-e9de6e384a17}	f	\N	t	PASAPORTE
1c6b5c99-984a-4ace-9665-4be63bf5bcc2	3504f2dc-9798-4e8f-b754-6568193dffcd	Cristhian 	Mareco	7	Delantero 	S756494	{/objects/uploads/90ca5af5-d0cf-4fd6-8ccb-c058bd6397fd}	f	\N	t	PASAPORTE
a371d434-1dbc-4ac7-aa7d-e56edbf6991f	3504f2dc-9798-4e8f-b754-6568193dffcd	Jos├® 	Adorno 	14	Mediocampista 	Y6422468P	{/objects/uploads/0b712ea7-bf83-4a4a-8169-51275670c296}	t	E0613776	t	NIE
fbb4fb3a-cfb9-4c06-b74a-28f1758d50e0	3504f2dc-9798-4e8f-b754-6568193dffcd	Juan 	Cuero 	2	Defensor 	S697510	{/objects/uploads/7b8bed12-a271-4929-9f50-2c64a71b4d30}	t	\N	t	PASAPORTE
bb8b5e60-d9bf-43ce-b066-d90d9aac44cf	91cf16fd-0336-4df0-a15a-25e820eed7b5	David	Roman	11	Delantero	A135663	{/objects/uploads/e7ab04ee-8223-4cf7-909f-76ce1d863493}	f	\N	t	PASAPORTE
a429b86a-e374-449b-921b-b7d6b19b757c	91cf16fd-0336-4df0-a15a-25e820eed7b5	N├®stor 	Figueredo	21	Defensor	T788395	{/objects/uploads/ff3f1ba0-5f47-4151-b0e2-e475c78ca2de}	f		t	PASAPORTE
7b7237ba-63ce-4a79-a97e-ab6f4d569d80	91cf16fd-0336-4df0-a15a-25e820eed7b5	Mario 	Acosta	1	Portero	A003758	{/objects/uploads/9f2317ec-d0e9-45a9-9d89-8dbab53bdce9}	t	\N	t	PASAPORTE
a1f46406-2275-4e6b-919b-a5932521a203	91cf16fd-0336-4df0-a15a-25e820eed7b5	Ramiro	Pais Mayan 	17	Centrocampista 	11449896J	{/objects/uploads/138416e1-bf15-4460-9662-ee04a595ad36}	f	\N	t	DNI
619d360e-2262-434c-b2ee-6b9c2a04cc2e	0de56b98-1b8a-4dfd-977e-f9939f822c3a	C├®sar Francisco 	Alvarenga Belotto	7	Delantero 	T831664	{}	f		t	PASAPORTE
fba0e96c-368f-4241-8410-b5553be1158e	35df28de-250d-4623-8437-124cd36679b4	Junior 	Acosta	10	Delantero	S756756	{/objects/uploads/8b4e62bf-1034-4d66-90af-6a44fb2c2183}	f		t	PASAPORTE
64545cc0-91d9-4c30-aecc-8f3938b1da70	35df28de-250d-4623-8437-124cd36679b4	Lizardo	Ruiz Diaz	15	Central	Z3112253J	{/objects/uploads/5a4c8194-0e8b-4774-a75d-6adc80def2e6}	f	\N	t	PASAPORTE
5870e7f2-529e-4f4c-a714-1ee2fa822563	35df28de-250d-4623-8437-124cd36679b4	Alexis 	Paredes	11	Central	Z3435890V	{/objects/uploads/795d9c7a-5996-4d33-8389-28670892fece}	f	\N	t	NIE
c4fdbcf5-7e80-48e9-801d-4a0c60ed785d	91cf16fd-0336-4df0-a15a-25e820eed7b5	El├¡as 	Ledezma	24	Delantero	A045792	{/objects/uploads/1bd178d9-25a7-4a52-88ef-2bd4ee4addaf}	t	E0657469	t	PASAPORTE
1926f2f6-fb54-4ab7-8fe2-21d10ed57b1f	6dc24c30-97fe-410a-8bf4-f096507da76c	Diego Fernando 	Santacruz franco 	18	Portero 	Y8589769L	{/objects/uploads/b49e0b72-d2a6-46b6-a10d-14c4d08d3dc8}	f	\N	t	NIE
257eb3a4-bada-4919-9d77-cdabffcb087c	6dc24c30-97fe-410a-8bf4-f096507da76c	H├®ctor Eduardo 	Romero aguero 	8	Delantero	Y4707806L	{/objects/uploads/ec69b15e-df29-43db-9a1b-b26179257055}	f	\N	t	NIE
d0e7c77c-c9d9-45f5-b22b-fa6a3aaa4636	6dc24c30-97fe-410a-8bf4-f096507da76c	Santino German	Patr├│n Gonz├ílez 	17	Delantero 	C391787	{/objects/uploads/c3ca3508-daa3-4f15-9e01-5b23f1e4c2ee}	f	\N	t	PASAPORTE
0a1e5f14-bfe7-431d-be98-393471151673	6dc24c30-97fe-410a-8bf4-f096507da76c	C├®sar 	Molinas 	11	Delantero 	T802186	{/objects/uploads/af3080c9-3128-43a4-8548-2e401746fa60}	f	\N	t	PASAPORTE
5b78461d-7ea4-43e3-8d26-0139d6950324	6dc24c30-97fe-410a-8bf4-f096507da76c	H├®ctor 	Arriola 	5	Defensa 	Y2881781X	{/objects/uploads/60ccb583-145b-4b16-92e7-720c935ddfdd}	f	\N	t	NIE
d4a530b0-195a-41af-b275-fa90b18927fd	6dc24c30-97fe-410a-8bf4-f096507da76c	Salvador 	Cabra L├│pez 	7	Extremo 	77687492Z	{/objects/uploads/2d09e2ac-d577-46d1-813c-945647c6fa21}	f	\N	t	DNI
f433d998-5c0e-46cf-b66f-69ec03c9d164	6dc24c30-97fe-410a-8bf4-f096507da76c	Pablo 	Romero 	9	Delantero 	16863305G	{/objects/uploads/c4d68acd-1fa6-4e7e-b6a9-9f6132708d4a}	t	E9900009589	t	DNI
e279e0c9-6bb3-4141-ac13-08445f566baa	6dc24c30-97fe-410a-8bf4-f096507da76c	Mart├¡n 	Arriola 	20	Defensa	Y8884534Q	{/objects/uploads/a41dd512-9a0c-4b88-be9a-b8f73ab3d3ca}	t	Y8884534Q	t	NIE
2e8bb7da-1342-417c-8157-ce999bcf5315	6dc24c30-97fe-410a-8bf4-f096507da76c	Miguel Sebasti├ín 	Ramos 	19	Defensa	Y6440841G	{/objects/uploads/56b57e37-62ba-42ec-999f-dc05d9d63f43}	f		t	NIE
b00a7128-9e19-4827-8e0b-24c004e0f75e	6dc24c30-97fe-410a-8bf4-f096507da76c	Salvador 	Ram├¡rez Garrido	21	Defensa	76428626V	{/objects/uploads/af99d8d4-8701-4fe6-8f13-52a29b864d54}	f	\N	t	DNI
3359f48c-20a7-4487-9cd2-42cf53e5001c	6dc24c30-97fe-410a-8bf4-f096507da76c	Emiliano	Trubiano	32	Delantero 	42028942	{/objects/uploads/a8cd9b7a-1b56-42bc-a06a-23cacae417bc}	f	\N	t	DNI
cc17ab85-9a63-4dde-8e29-890badf37d61	6dc24c30-97fe-410a-8bf4-f096507da76c	├üngel Enrique 	Carmona 	14	Defensa 	Y2954799A	{/objects/uploads/e773f497-274c-446a-a3fd-9e562f107010}	f		t	NIE
374f23a4-1f86-449f-b8ff-48302121a72c	6dc24c30-97fe-410a-8bf4-f096507da76c	Robert 	Nu├▒ez 	10	Centrocampistas 	77444199W	{/objects/uploads/8428a8c3-bbc2-4c9a-b77b-a6d03c3fcb9a}	t	77444199W	t	DNI
9133b1c9-b743-4457-a163-d96fb7a5636b	0de56b98-1b8a-4dfd-977e-f9939f822c3a	El├¡as Mart├¡n 	L├│pez 	20	Medio	A025668	{}	f		t	PASAPORTE
abdc60de-4f84-4f39-a267-a147c082a033	0de56b98-1b8a-4dfd-977e-f9939f822c3a	Aldo	L├│pez 	9	D	X8933408R	{}	f	\N	t	NIE
ae98110b-141e-4096-a455-2825c8f0cd0c	0de56b98-1b8a-4dfd-977e-f9939f822c3a	C├®sar Agust├¡n 	L├│pez Vera	10	D	Z1949778g	{}	f	\N	t	NIE
c170d6be-8b88-4636-a963-73aadc98791e	0de56b98-1b8a-4dfd-977e-f9939f822c3a	Denis	L├│pez 	5	C	Z1755817w	{}	f	\N	t	NIE
ddfe770c-ea63-4ef0-ba0f-b48284a29333	0de56b98-1b8a-4dfd-977e-f9939f822c3a	Diego	Godoy 	15	M	T799902	{}	t	\N	t	PASAPORTE
b6e22186-d409-4847-949c-7e867a3a31c9	0de56b98-1b8a-4dfd-977e-f9939f822c3a	Marciano 	Sosa Machado 	6	C	A086438	{}	f	\N	t	PASAPORTE
fc2e18ef-6348-4ecc-a986-f11b1e108f63	0de56b98-1b8a-4dfd-977e-f9939f822c3a	Celso de Jes├║s 	Ledesma Irala	11	\N	A133354	{}	f	\N	t	PASAPORTE
45bdf6f5-8e6b-46d1-bd2c-bd402af49bdf	0de56b98-1b8a-4dfd-977e-f9939f822c3a	Junior	Vega	17	M	C316850	{}	f	\N	t	PASAPORTE
02f8e04f-396a-4afc-827f-113067166343	0de56b98-1b8a-4dfd-977e-f9939f822c3a	Rodolfo 	Enr├¡quez 	18	D	A020302	{}	f	\N	t	PASAPORTE
39f9fe82-d199-42d3-9279-2fc3183c273c	0de56b98-1b8a-4dfd-977e-f9939f822c3a	Marcelo 	Cabrera 	16	M	A152588	{}	f	\N	t	PASAPORTE
47b25502-9100-44b2-ac30-1ddea5f60e18	6dc24c30-97fe-410a-8bf4-f096507da76c	Ezequiel 	Mart├¡nez 	22	Extremo	S743790	{/objects/uploads/eba243cf-ba09-4567-a7cf-ea8080ea71f9}	f	\N	t	PASAPORTE
b12cfb69-a912-490e-a26c-52948c059ac0	2309b0ff-44cc-4964-b56c-182fe8ebb925	Sebasti├ín 	Ortega Morel	14	Defensa 	Y1876336x 	{/objects/uploads/f25c500e-8751-4d0a-85c9-ceb425cc2b3a}	f	\N	t	NIE
e7e4152d-899d-4f1b-8cd6-5977fa1c6c28	34c51dc3-f3ab-4d18-adad-970db3a37784	Francisco Javier	Toledo Sanchez	4	Delantero	Y9558868J	{/objects/uploads/0053ae8f-267f-434d-bcc2-5cdde2f2a860}	f	\N	t	NIE
288a5988-7e18-49b5-8b15-2bf5b75185ed	34c51dc3-f3ab-4d18-adad-970db3a37784	Diego Fernando	Santacruz Franco	1	Arquero	Y8589769L	{/objects/uploads/40295f5c-e3bb-4d73-9660-1cd377b94c0b}	f	\N	t	NIE
41b16268-d6f8-41e7-918f-fe35167df863	2309b0ff-44cc-4964-b56c-182fe8ebb925	Ever Dani	Cohene	1	Arquero	Y6926272c	{/objects/uploads/2cf20530-6014-4fd7-b75d-0cf998118fdf}	f		t	NIE
f32a18c4-50dd-4f46-80f1-c16a45aa7b47	2309b0ff-44cc-4964-b56c-182fe8ebb925	Maximiliano 	Guti├®rrez 	5	Defensa 	Y8707068l	{/objects/uploads/40e04075-b0ca-4d7c-82fe-3d8ac08bce15}	f	\N	t	NIE
125b6915-478e-454f-8597-dd000200f1a5	2309b0ff-44cc-4964-b56c-182fe8ebb925	Julio	Galeano	7	\N	A053399	{/objects/uploads/106cfcb0-20eb-4854-bc42-fbd52b834079}	f	\N	t	PASAPORTE
db0153f8-d95f-4676-a6ca-a5424eec5cb0	2309b0ff-44cc-4964-b56c-182fe8ebb925	Juan carlos	Portillo	13	\N	2911594	{/objects/uploads/ffbe4e2a-3828-4806-9f5f-2c40901e653b}	f	\N	t	PASAPORTE
c9d32bed-3ffd-49c3-a4f6-0a6062c6c27a	2309b0ff-44cc-4964-b56c-182fe8ebb925	Ever Ramon	Rodriguez	18	\N	5736986	{/objects/uploads/181e2e11-578f-4dba-9aea-cfad47fb030f}	t	\N	t	PASAPORTE
f36c3911-e09f-4216-a85b-a748108c8f82	0de56b98-1b8a-4dfd-977e-f9939f822c3a	Marcos enrique 	Medina morinigo	23	D	A059052	{}	f	\N	t	PASAPORTE
97fe8885-900e-4dc3-a337-f248c0c929a6	2309b0ff-44cc-4964-b56c-182fe8ebb925	Nelson 	Torales	12	Arquero	Y7198201x	{/objects/uploads/bc857d62-f674-4909-aaf7-07cc06f2c6e7}	f	\N	t	NIE
142df60c-a974-4030-8601-7bd12200b6a5	2309b0ff-44cc-4964-b56c-182fe8ebb925	Marcelo	Cardozo	6	Medio campo	Z0535609j	{/objects/uploads/3385e396-a054-4ca9-8b69-36feaa2f349e}	f	\N	t	NIE
7991692e-4203-4bc4-b48a-f941e04bcd2e	6dc24c30-97fe-410a-8bf4-f096507da76c	Alejandro 	Ruiz	16	Defensa 	Z0596900D	{/objects/uploads/052b5b9f-ed26-4644-86b8-23f3d84f6fda}	f	\N	t	NIE
bcd9d456-dd41-4d0d-b8db-60dd88666444	2309b0ff-44cc-4964-b56c-182fe8ebb925	Francisco 	Caballero 	10	Delantero	02387290m	{/objects/uploads/087cc141-6de4-43de-9b15-2904f6378ebd}	f	\N	t	DNI
b11f8fae-c6e4-4eb5-9f9c-d55c0e831eb6	2309b0ff-44cc-4964-b56c-182fe8ebb925	Jorge	Velazquez	11		A031092	{/objects/uploads/642573d6-c5dc-45cc-9243-12ab01c9a80f}	f		t	PASAPORTE
de59145b-0d71-4535-a202-a9d8a67cef2c	0de56b98-1b8a-4dfd-977e-f9939f822c3a	Luis Miguel 	Centuri├│n Salinas 	16	M	A168871	{}	f	\N	t	PASAPORTE
19dfe912-0409-483d-96ae-5d62d9d768a4	0de56b98-1b8a-4dfd-977e-f9939f822c3a	Jose 	Torales	8	D	Y8126449B	{}	t	1471	t	NIE
416c0f0c-dc9a-4abb-ab68-1454f6ead91c	a0b6f286-9313-4773-81b2-55c8b131f22f	Alejandro 	Villalba 	14	Defensor	C311533	{/objects/uploads/63ec6b02-ec15-49ca-853a-340d51dbd97c}	f	\N	t	PASAPORTE
125bac75-d370-47fe-9a31-67836c91d5e1	a0b6f286-9313-4773-81b2-55c8b131f22f	Bruno 	Echeverria	8	Drfensor lateral	\N	{/objects/uploads/bff2a2ea-54d1-43e0-aead-dc60a696631a}	f	\N	t	DNI
d405579a-acb0-4fb8-bb86-d2f8fdc77c01	a0b6f286-9313-4773-81b2-55c8b131f22f	Pablo	Mongelo	17	Medio	\N	{/objects/uploads/a6883634-b2f2-4f50-b14b-d176d39bc977}	f	\N	t	DNI
7fc1ef36-c4a4-4b00-960a-10e4d4f8f47d	a0b6f286-9313-4773-81b2-55c8b131f22f	Carlos	Vidal	3	Defensor	\N	{/objects/uploads/f8d0cc3e-991e-450a-a1fc-22be24b89c84}	f	\N	t	DNI
16d38df5-effc-4331-b62e-595651a64e7f	a0b6f286-9313-4773-81b2-55c8b131f22f	Joel 	Servin	1	Arquero	\N	{/objects/uploads/55ca2f56-dd98-4efd-82e2-10daa8622575}	f	\N	t	DNI
af8b0592-fbc1-4d1f-9fbf-53f7a19229d3	a0b6f286-9313-4773-81b2-55c8b131f22f	Anderson	Amaya abando	99	Delantero	\N	{/objects/uploads/64b2b52e-b2ec-427f-9765-c6d08d220aa1}	f	\N	t	DNI
2dc16817-8c99-4069-9268-67e0bc525cfd	a0b6f286-9313-4773-81b2-55c8b131f22f	Rodrigo	Vera	11	Medio	\N	{/objects/uploads/77e7fda5-54d8-4559-adda-360260e6201b}	f	\N	t	DNI
65107849-09c4-4bdd-942e-c446b576c3c4	3eb77084-054f-4b21-a3e5-13d898d6960b	Cristian 	Fari├▒a	8	Medio campo	Y9244917n	{/objects/uploads/2e22d61f-9fe9-4eb5-a0b0-3fe319822481}	t	\N	t	NIE
61d94a8c-3ab8-48d2-972e-a9c982dd3ffb	3eb77084-054f-4b21-a3e5-13d898d6960b	Ever Ramon	Rodriguez	18	Delantero	5736086	{/objects/uploads/cb94fae8-2b85-4d57-a951-f88d9929492c}	t	\N	t	PASAPORTE
c087e178-8840-45c5-a380-53e006f54e78	a0b6f286-9313-4773-81b2-55c8b131f22f	Cesar 	Mongelos	18	Medio	\N	{/objects/uploads/99b9e65a-6985-4d6b-8034-a3ff8c17a3bb}	f	\N	t	PASAPORTE
b7cd6dca-b6cf-4a8f-8d53-7c376765f5b5	a0b6f286-9313-4773-81b2-55c8b131f22f	Luis	Durand	25	Arquero	122430285	{/objects/uploads/a2c9255a-a043-4606-8317-4551a2569978}	f	\N	t	PASAPORTE
3f1e42b2-4655-4353-8d13-ba0e5da2f102	9b66d7b0-3e3b-4a62-82a7-4f1b6258fff8	Daniel	Vacas perez	26	Medio campo 	70428655x	{/objects/uploads/b330e9ff-7170-42f4-854b-a8ae4c0d03a6}	f	\N	t	DNI
6197a8b8-b851-485a-bcab-3227d669d04d	3eb77084-054f-4b21-a3e5-13d898d6960b	Maximiliano 	Guti├®rrez 	5	Defensa 	Y8707068l	{/objects/uploads/84d9799c-682f-415f-a5cc-9fa3aaa195c5}	f	\N	t	NIE
e85b7bda-248b-4b52-88a1-209bf28e738d	a0b6f286-9313-4773-81b2-55c8b131f22f	Angel	Martinez	23	Delantero	\N	{/objects/uploads/789f76fb-f3d5-4d48-80f9-361e07202016}	f	\N	t	PASAPORTE
d593003b-e690-4b6e-bfcd-831a1ba44a82	3eb77084-054f-4b21-a3e5-13d898d6960b	Marcelo	Cardozo	6	Medio campo	Z05356095	{/objects/uploads/dbaecf26-b82b-4baa-88be-ba7bccb4df4c}	f	\N	t	NIE
d4d1da3f-460d-4f55-bad2-690bf61674a0	3eb77084-054f-4b21-a3e5-13d898d6960b	Francisca 	Caballero 	10	Delantero	\N	{/objects/uploads/e49a8ef3-1637-4d16-9007-0ce675c73140}	f	\N	t	DNI
2254ef8a-7bab-40ca-bccf-af6f30e3caa2	3eb77084-054f-4b21-a3e5-13d898d6960b	Sebasti├ín 	Ortega Morel	14	Defensa 	Y1876336x 	{/objects/uploads/a9aa52af-d06e-47d3-8b47-83d6f999c87b}	f	\N	t	NIE
0796c6ba-76b3-4df2-8633-b6450c73e1ab	3eb77084-054f-4b21-a3e5-13d898d6960b	Facundo	Guardia	22	Medio campo	Y1640000e	{/objects/uploads/14ec8d07-557a-434b-9c9b-d9b29fcbfc11}	f	\N	t	NIE
d284cea7-6541-4682-9e7c-04840def41c1	3eb77084-054f-4b21-a3e5-13d898d6960b	Lucio	Garberi	9	Medio campo	Z4315796n	{/objects/uploads/5c11db87-0dcc-45e2-a629-f809a963de56}	f	\N	t	NIE
0133e51b-13f3-46c3-b260-723fa97e1750	6259d3d1-9cfe-4c19-8b32-f7e6d1433942	Rodney 	Ocampos	1	Defensa 	\N	{}	f	\N	t	DNI
603cf5a3-56b5-4753-81d8-bc3820535fbc	6259d3d1-9cfe-4c19-8b32-f7e6d1433942	Miguel	Ferreira	1	Medio campo	\N	{}	f	\N	t	DNI
6abc7b3b-2a44-4858-a736-840e6844f8e1	6259d3d1-9cfe-4c19-8b32-f7e6d1433942	Erico	Samudio	1	Defensa 	\N	{}	f	\N	t	DNI
47d247c2-e5c1-40b0-8405-e49b7592a176	6259d3d1-9cfe-4c19-8b32-f7e6d1433942	Derlis 	Estigarribia	1	Medio campo	\N	{}	f	\N	t	DNI
ed4efe2e-b591-471c-bc63-15d25592ac75	6259d3d1-9cfe-4c19-8b32-f7e6d1433942	Ale	Borja	1	Medio campo	\N	{}	f	\N	t	DNI
064c2af1-1d3a-48eb-94e2-e63f798df7e0	6259d3d1-9cfe-4c19-8b32-f7e6d1433942	Gonzalo 	Tuma	1	\N	\N	{}	f	\N	t	DNI
0755a06c-5aa7-4469-975c-71eef884ee2b	6259d3d1-9cfe-4c19-8b32-f7e6d1433942	Diego 	Esquivel 	1	Defensa 	\N	{}	f	\N	t	DNI
a24f0c7b-064c-47c9-953c-9aab729f283d	6259d3d1-9cfe-4c19-8b32-f7e6d1433942	Julian 	Amarilla 	1	\N	\N	{}	f	\N	t	DNI
566dc3c4-203a-44ce-8a31-19cb8d46b2a7	3eb77084-054f-4b21-a3e5-13d898d6960b	Adelante Esteban	Mart├¡nez 	16	Delantero	Z3955382b	{/objects/uploads/def745d9-f0cd-4a93-bd9f-a486c407cee4}	f	\N	t	NIE
3cbfc695-fb0a-41f4-8c23-1daa25bd7b5e	34c51dc3-f3ab-4d18-adad-970db3a37784	David	Roman	11	Delantero	A135663	{/objects/uploads/c8323a43-77c2-4ead-a795-60f629223c21}	f	\N	t	PASAPORTE
b29f7312-5ffa-4699-b06e-2f7649c64190	34c51dc3-f3ab-4d18-adad-970db3a37784	Luiz Rodrigo	Dasilva	10	Mediocentro	Z0347714M	{/objects/uploads/f8143e9d-2c8a-4ac7-b934-c695be0fb928}	f		t	NIE
3c8ee85d-03a9-4bea-8721-2d4c5e019913	34c51dc3-f3ab-4d18-adad-970db3a37784	Nestor 	Enciso	4	Delantero	C331791	{/objects/uploads/678428a3-9f21-4e8c-b384-c50522fcc365}	f		t	PASAPORTE
f04e894c-dcd8-4507-b49c-506c1ad990de	35df28de-250d-4623-8437-124cd36679b4	Diego 	Sousa	11	Delantero	GA120198	{}	f	\N	t	PASAPORTE
c5c3253f-e728-4578-8ea8-e1610f18a432	35df28de-250d-4623-8437-124cd36679b4	Malio 	Oliva	19	Central	A102043	{}	f	\N	t	PASAPORTE
12ee1698-de26-42f0-b7aa-ed5443387217	35df28de-250d-4623-8437-124cd36679b4	Jorge 	Ram├¡rez 	15	Central	A116732	{/objects/uploads/318d748d-3b57-4348-91b2-af1693cf6899}	f		t	PASAPORTE
75878153-ff26-493d-894a-1b6136353cb5	35df28de-250d-4623-8437-124cd36679b4	Jony 	Valiente	18	Delantero 	A125275	{/objects/uploads/8ef6e79a-3c9f-40fa-a747-7a502592f6ac}	f		t	PASAPORTE
d7aef65a-27f2-4f3a-b54c-7d7023955460	065bfcc2-308e-4fd4-b0f7-e90d5b8b56bc	Andre	Ojeda	15	Defensa	Ao31537	{/objects/uploads/5c4926e5-de25-4dd8-8146-b7b43632b32f}	f	\N	t	PASAPORTE
54d4ee57-5085-4cbf-8112-9c16b3f79481	065bfcc2-308e-4fd4-b0f7-e90d5b8b56bc	Alexis	Almada	16	Defensa 	S701343	{/objects/uploads/686378e7-efa1-4523-a44d-b47a55bce4c5}	f	\N	t	PASAPORTE
21ff22f2-181e-4cf1-90a4-eaa644bd0330	065bfcc2-308e-4fd4-b0f7-e90d5b8b56bc	Fredy 	Ruiz	11	Delatero	R666940	{/objects/uploads/2af9333b-bc18-4615-a652-2398c5ca02e2}	f	\N	t	PASAPORTE
3403f3e7-73d4-446e-b641-b87bafff4c35	065bfcc2-308e-4fd4-b0f7-e90d5b8b56bc	Cristian 	Duarte	23	Delantero 	T787260	{/objects/uploads/7141ad3f-a7f3-42b5-bfe9-9dd7e1674491}	f		t	PASAPORTE
e4621d06-de45-4197-82b5-1097599acb03	065bfcc2-308e-4fd4-b0f7-e90d5b8b56bc	Villlaba	Gomez	22	Central	A167190	{/objects/uploads/f2d77846-a713-4a4c-9041-479394b7d644}	f	\N	t	PASAPORTE
bfc4c0c8-df60-4379-ba3b-a63c87125330	6259d3d1-9cfe-4c19-8b32-f7e6d1433942	Juan 	Valiente 	1	Medio campo	\N	{}	t	\N	t	DNI
be9d1b1f-3874-4057-a5c0-9992e252aff7	6259d3d1-9cfe-4c19-8b32-f7e6d1433942	Damian	C├íceres 	1	Defensa 		{}	f		t	DNI
d2410e26-c417-4e04-b9fa-9e435ab428bf	6259d3d1-9cfe-4c19-8b32-f7e6d1433942	Martin 	Arriola	1	Medio campo		{}	t		t	DNI
730b585a-8c42-4181-a7d0-6de31f19735b	6259d3d1-9cfe-4c19-8b32-f7e6d1433942	Marcial 	Chaparro	1	Portero 		{}	f		t	DNI
9cc4cdde-4280-42d2-8cc5-ba73ad185e9c	91cf16fd-0336-4df0-a15a-25e820eed7b5	Fabian	Jara	9	Delantero	A9161585	{/objects/uploads/68555b72-f670-452d-974c-b462b3e11ae8}	f	\N	t	PASAPORTE
a9cbe62f-6c4b-4f55-8f2b-bebf5bfb24ab	2e23f2d6-4042-4a94-9ebb-13069e23fc1c	Juan	Gonzalez	13	Mediocampo	S741702	{/objects/uploads/d0667a69-ae22-4a20-a689-3d33935989a5}	f		t	PASAPORTE
5279d91e-5353-4c5a-aba4-5e385dec1598	c7052d00-140e-4d8a-ae44-63e8603a5236	Richard	Cabral	1	Arquero	A105339 	{/objects/uploads/1a0ce6ee-3a44-45a6-9f94-1945eab2930c}	f		t	PASAPORTE
6db590a8-67df-404e-a9ee-34770d6617ae	c3efc237-51c9-471f-a17d-4f90f1f253af	Richard	Cabral	1	Arquero	A105339 	{/objects/uploads/bc378857-a01f-46d4-8168-4e7f594f4574}	f	\N	t	PASAPORTE
1337c89a-7af1-442c-80a7-34a973018e05	3504f2dc-9798-4e8f-b754-6568193dffcd	Elvis 	Mancuello 	26	Delantero 	A205673	{/objects/uploads/6870cb44-91bd-41e3-a2a0-c1ce4de81477}	f	\N	t	PASAPORTE
67bd4302-0882-4fd0-9d0a-4a349a7b5d3e	c3efc237-51c9-471f-a17d-4f90f1f253af	Eusebio 	Yegros 	9	Delantero 	Z1769670D	{/objects/uploads/5d95993d-0866-45e2-a380-3b5eb339b186}	f	\N	t	NIE
8d0f7f7c-5da1-44a4-bc50-54d41894e665	c3efc237-51c9-471f-a17d-4f90f1f253af	Aldo	Garc├¡a 	21	Delantero	Y1630106H	{/objects/uploads/a04d5677-5270-4973-8fc4-f14712f71fd9}	f		t	NIE
69dcc192-03b8-4977-bff7-23de1f7761bb	c3efc237-51c9-471f-a17d-4f90f1f253af	Rolando	Lopez 	4	Defensa	X7263511L	{/objects/uploads/38f4c0a0-3f4d-404b-b871-0f29f79b26b4}	f		t	NIE
77a63571-61db-415c-981a-d3d239153b75	c7052d00-140e-4d8a-ae44-63e8603a5236	Josu├®	Gonz├ílez	5	Mediocentro	T816860	{}	f	\N	t	PASAPORTE
7d33e7ce-5a47-4141-b852-e39c6458602a	c3efc237-51c9-471f-a17d-4f90f1f253af	Miguel	Cardozo 	80	Lateral	S749638	{}	f	\N	t	PASAPORTE
c6f2f8fb-918d-49be-ba47-1b266d847615	c7052d00-140e-4d8a-ae44-63e8603a5236	Victor 	Qui├▒ones 	10	Delantero	T793516	{/objects/uploads/406b8e05-3871-4416-9758-3d2d9c1acbb8}	f		t	PASAPORTE
93189001-dd5a-45f7-a45d-e9a32a4be84e	c7052d00-140e-4d8a-ae44-63e8603a5236	Nestor	Otazu	11	Extremo	7915321	{/objects/uploads/ab0dde3f-57e0-4110-97e4-9c5972c8ab77}	f	\N	t	DNI
bcd38957-fd9f-48da-9482-5f2e4aadf935	c7052d00-140e-4d8a-ae44-63e8603a5236	Daniel 	Lezcano	2	Lateral	C284001	{}	f	\N	t	PASAPORTE
298601b9-ab26-4ee2-9a41-bba8d7ff5e40	c7052d00-140e-4d8a-ae44-63e8603a5236	Juan	Godoy	14	Defensa 	Y8509898G	{/objects/uploads/f8d16735-95c2-44ef-b624-76a8bc8a7ef0}	f	\N	t	NIE
f063e9a2-e157-4ccf-a46d-1356688accb6	c3efc237-51c9-471f-a17d-4f90f1f253af	Juan	Godoy	14	Defensa	Y8509898G	{/objects/uploads/0d62434b-a909-44db-a0f1-445efc13a4f8}	f	\N	t	NIE
3c0e881a-1512-47fc-a6d2-4e98d83fb2d5	c3efc237-51c9-471f-a17d-4f90f1f253af	Manuel	Lezcano	17	Defensa	Z2068741B	{/objects/uploads/aed922af-4fb8-4aa7-8702-86fa0fae4257}	f		t	NIE
6d0ff19a-3e7d-4c94-8d61-b5a5dad7b4fd	c7052d00-140e-4d8a-ae44-63e8603a5236	Manuel	Lezcano	17	Defensa 	Z2068741B	{/objects/uploads/3eca40c7-9bfd-4354-bd5d-bb7617c248cb}	f		t	NIE
\.


--
-- Data for Name: referee_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.referee_profiles (id, user_id, full_name, identification_number, phone, email, association, years_of_experience, observations, status, created_at, updated_at, identification_type) FROM stdin;
f63fda71-ad1e-4bc0-8691-325ab7ad2089	587f05d4-2d16-4abc-809b-ec65625844ab	Pedro G├│mez	02562521m	691809799	arbitro2@liga.com	\N	0	\N	ACTIVO	2026-03-03 11:00:44.482073+00	2026-03-03 11:00:44.482073+00	DNI
07e9c33a-012a-4cfd-bd20-8618f32e1649	d7d5cdac-88d7-4192-a4c3-81e8ad694107	Hernando Pineda	y65454369	657839309	ecastm@gmail.com	\N	5	\N	ACTIVO	2026-03-17 18:57:07.148355+00	2026-03-17 18:57:07.148355+00	DNI
aca16e00-8839-4feb-9518-c687dd93776a	d064eb1c-fae8-4b88-ba7f-64d42a3405c4	Jos├® Heredia 	77234860d	671255726	Athenea.neymar@gmail.com	\N	0	\N	ACTIVO	2026-03-17 19:37:35.996216+00	2026-03-17 19:37:35.996216+00	DNI
33accad3-58a0-4fbc-97a7-3cb1772f3853	d68fa143-e655-4bb2-8f44-7fbef6f669f2	Francisco Javier Cortes	26819783N	665586020	adfjavicc@gmail.com	Naturaleza y Deporte / Benalm├ídena, FERE etc...	10	\N	ACTIVO	2026-03-23 11:44:35.900578+00	2026-03-23 11:44:35.900578+00	DNI
62f29d4f-4e24-4cc0-850f-bb832e902f9c	893f7549-ed21-4b6b-b5f4-8b7fbe7239b5	Adilson Roldan	A141775	+3466107765	comcome87@gmail.com	M├ílaga 	9	Excelente 	ACTIVO	2026-04-03 18:17:20.972292+00	2026-04-03 18:17:20.972292+00	PASAPORTE
93812308-9051-472d-bd43-c5ff98df64e3	e10d919f-f203-4d13-899a-787146bce2c7	Ruben ferreira	Y8572651J	+34652615497	rudafedo14@gmail.com	\N	0	\N	ACTIVO	2026-04-08 18:31:55.126353+00	2026-04-08 18:31:55.126353+00	NIE
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
ba1eb040-f8fe-4e7c-952a-2b1658ff6352	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	6dc24c30-97fe-410a-8bf4-f096507da76c	95	Efectivo (inscripci├│n)	Queda inscripci├│n (285)	2026-04-05	2026-04-05 12:28:02.178558+00
a22cfe35-69eb-4480-803e-5d582be43df8	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	2e23f2d6-4042-4a94-9ebb-13069e23fc1c	30	Efectivo (inscripci├│n)	Queda 350 	2026-04-05	2026-04-05 13:46:16.19913+00
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.teams (id, tournament_id, division_id, name, colors, home_field, logo_url, captain_user_id, coach_name, instagram_url) FROM stdin;
0de56b98-1b8a-4dfd-977e-f9939f822c3a	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	e22ae070-36b7-4591-950e-f0216b8a7bb2	Atl├®tico Fernandito 	Azul Rojo 	Portada alta	\N	ac8eca36-dd3f-4aab-ba50-653852f29d5f	\N	\N
9b66d7b0-3e3b-4a62-82a7-4f1b6258fff8	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	e22ae070-36b7-4591-950e-f0216b8a7bb2	Sport Tobati 	Por definir 	Teatinos 	\N	\N	\N	\N
09eb731f-aaf8-47be-ab4f-0bfb3e274d93	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	e22ae070-36b7-4591-950e-f0216b8a7bb2	Rejunte Libre	Por definir 	Teatinos 	\N	\N	\N	\N
5a25b09d-a8de-4532-87dd-0c330cc7b3f7	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	2cec8476-a224-41d5-b597-388fc05c2c75	Paraguay F.C.	Por definir 	Teatinos 	\N	\N	\N	\N
77312cc6-cd3e-4736-8af3-b34f2a2bc0c1		\N	F├®nix FC	Rojo negro	Teatino	\N	edb46209-a717-4a80-aa36-3c01bd331484	\N	\N
83a1ae9f-d6ff-46c0-9d87-fe384f40e20e	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	2cec8476-a224-41d5-b597-388fc05c2c75	Millonarios 	Por definir 	Teatinos 	\N	\N	\N	\N
011bbdb9-1e88-495c-97cc-eddb51427c51	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	e22ae070-36b7-4591-950e-f0216b8a7bb2	C.F.C Jr.	Rojo	Teatinos	\N	\N	\N	\N
96c15e2e-6ead-444a-8bd0-6ffd12d7d5d1	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	e22ae070-36b7-4591-950e-f0216b8a7bb2	Malaga	Rojo	Teatinos	\N	\N	\N	\N
a0b6f286-9313-4773-81b2-55c8b131f22f	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	e22ae070-36b7-4591-950e-f0216b8a7bb2	Millonarios	Negro y rojo	Teatinos	/objects/uploads/05af6cb3-3aa2-4a49-afed-e276f84eb6e5	3832b4c5-e4f0-4ed5-9661-ea487d638d8e	\N	\N
6259d3d1-9cfe-4c19-8b32-f7e6d1433942	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	2cec8476-a224-41d5-b597-388fc05c2c75	Sport t├¡o oscar 	Negro y amarillo 	Portada Alta 	/objects/uploads/0050febc-0a92-440e-9bda-2b1df411e42b	069d6191-ba75-4291-84bc-8ba9a4af31f2	\N	\N
1e025a1f-50dd-48ab-9e77-86c310359a18	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	e22ae070-36b7-4591-950e-f0216b8a7bb2	Fuengirola Libre 	Verde y blanco 	Teatinos 	\N	\N	\N	\N
8615f2fc-0ef4-4b80-8887-1123d3890762	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	e22ae070-36b7-4591-950e-f0216b8a7bb2	Millonarios 	Rojo y negro	Teatinos	\N	\N	\N	\N
065bfcc2-308e-4fd4-b0f7-e90d5b8b56bc	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	e22ae070-36b7-4591-950e-f0216b8a7bb2	BayerN munchen	Rojo y blanco	Teatino	/objects/uploads/492eb646-8e41-4c8c-92d3-eb13e87e1bbf	717e578d-7b85-45a2-a56a-8ed083a9b70c	\N	\N
f97ec679-d83d-456e-87dd-c20b806bd710	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	2cec8476-a224-41d5-b597-388fc05c2c75	Santo Domingo 	Blanco y azul	Teatinos	\N	\N	\N	\N
1ebc1b72-055e-4aef-a906-ed0ec11e2840	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	e22ae070-36b7-4591-950e-f0216b8a7bb2	Albiroja	Rojo y blanco 	P	\N	d04be537-adfa-4eb0-b288-ef8d13e37568	\N	\N
35df28de-250d-4623-8437-124cd36679b4	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	2cec8476-a224-41d5-b597-388fc05c2c75	Sto. Domingo	Azul Blanco	Campo1	/objects/uploads/db387a9a-c0ad-4fb3-8bb6-1e626e0e6967	dd357587-c4e2-431e-9a55-7a0325d6c9d8	\N	\N
34c51dc3-f3ab-4d18-adad-970db3a37784	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	2cec8476-a224-41d5-b597-388fc05c2c75	El Palo FC +30	Verde  Blanco	Teatinos	/objects/uploads/85c916b9-452a-4b32-8cc9-8ad17e7a1eec	\N	\N	Elpalofc_79
7ad8ae90-c788-41b1-87e3-7b8b8cf95c97	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	2cec8476-a224-41d5-b597-388fc05c2c75	Rejunte +30	Por definir 	Teatinos 	\N	\N	\N	\N
2e23f2d6-4042-4a94-9ebb-13069e23fc1c	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	e22ae070-36b7-4591-950e-f0216b8a7bb2	Tobati FC	Blanco, celeste y negro	Teatinos	/objects/uploads/517c6807-f56b-4ba9-a84e-c5dbc54c7994	7acf2739-1e28-411a-a8ab-d04f974030c5	\N	tobati_fc
3504f2dc-9798-4e8f-b754-6568193dffcd	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	e22ae070-36b7-4591-950e-f0216b8a7bb2	Sport Tobati	Verde y Blanco 	Teatinos 	/objects/uploads/e7c5bee6-dbc7-45a6-9815-6ebe85a4a2ee	8318b642-2210-4d24-80a4-de52e7e84202	\N	https://www.instagram.com/sport_tobatimlg?igsh=MTdxMG1oYTM0MGt3cg==
2309b0ff-44cc-4964-b56c-182fe8ebb925	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	2cec8476-a224-41d5-b597-388fc05c2c75	Fuengirola	Blanco y azul 		/objects/uploads/aacf1776-7fbc-4267-938c-bd2a44117744	2cf3faf6-c8a8-41cf-88f7-dec1687de700	\N	\N
877bccca-879f-4579-8ca3-37ed944e9df7	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	2cec8476-a224-41d5-b597-388fc05c2c75	Albirroja +30	Blanco rojo y azul 	Teatinos 	\N	\N	Daniel 	\N
04732c98-32ba-4998-a96d-71d9b2891e83	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	dd036abe-f19c-4a6f-8fe2-231aa5582882	Fuengirola +30	Por definir 	Teatinos 	\N	\N	Sebasti├ín 	\N
91cf16fd-0336-4df0-a15a-25e820eed7b5	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	e22ae070-36b7-4591-950e-f0216b8a7bb2	El Palo FC 	Verde y blanco 	Jose gallardo 	/objects/uploads/aa7f6ff8-0d9d-4bcf-a7f0-f6273aa61e3b	d1acdb9d-3730-4708-a438-16f93708cfed	\N	\N
6dc24c30-97fe-410a-8bf4-f096507da76c	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	e22ae070-36b7-4591-950e-f0216b8a7bb2	F├®nix F.C.	Por definir 	Portada alta	/objects/uploads/db1475a0-05a4-4195-acbe-ee11d22f2ff4	\N	\N	\N
3b3a1ee1-50b7-4cef-8f52-0ab7344ed096	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	2cec8476-a224-41d5-b597-388fc05c2c75	C.F.C	Azul oscuro		\N	\N	\N	\N
3eb77084-054f-4b21-a3e5-13d898d6960b	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	e22ae070-36b7-4591-950e-f0216b8a7bb2	Fuengirola libre	Blanco y azul 		/objects/uploads/2ece220b-dab4-4ac0-a76a-2e664c02478f	0b805314-0014-4a84-858d-0664b8d66372	\N	\N
c3efc237-51c9-471f-a17d-4f90f1f253af	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	2cec8476-a224-41d5-b597-388fc05c2c75	CFC	Azul	Jos├® Gallardo	/objects/uploads/c4dd1bb5-d2b5-4717-bc03-b22f9545f104	9c4b0e49-7e46-48e8-b491-880890333081	\N	https://www.instagram.com/cfc.malaga.es?igsh=MWZvNjZheDBmYzFl
46517705-b03a-4797-9e01-b23acba49c56	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	e22ae070-36b7-4591-950e-f0216b8a7bb2	Albiroja Torre - V├®lez 	Rojo blanco 	Teatinos 	/objects/uploads/9d907e7c-880b-49b4-8bda-2c17308fb9f0	2b208810-3b5c-4618-9114-e95a5b5586b8	\N	Albiroja Torre 
c7052d00-140e-4d8a-ae44-63e8603a5236	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	e22ae070-36b7-4591-950e-f0216b8a7bb2	CFC Jrs	Rojo	Jos├® Gallardo	/objects/uploads/2b474337-54c4-426b-b949-8e4f78a185c7	b6268ee7-63d3-4fc5-9fd6-1d51ef64169e	\N	https://www.instagram.com/cfc.malaga.es?igsh=MWZvNjZheDBmYzFl
\.


--
-- Data for Name: tournament_stages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tournament_stages (id, tournament_id, name, sort_order, stage_type) FROM stdin;
d08eb75d-033b-4c30-a093-9c964f7908a1	86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	Jornada Regular	1	LIGA
\.


--
-- Data for Name: tournament_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tournament_types (id, name, algorithm, description, supports_double_round) FROM stdin;
4fbb15a2-daf9-4a1f-afe9-7a8eaca2ee5b	Liga (Todos contra todos)	ROUND_ROBIN	Todos los equipos juegan entre s├¡. El campe├│n es quien acumula m├ís puntos.	t
d563df28-8c52-4e5c-82d8-9139409cf9a5	Eliminaci├│n directa	KNOCKOUT	Llaves directas, el perdedor queda eliminado.	f
7b479915-ef1f-4921-9f2f-2d5aafb0b214	Grupos + Playoffs	GROUPS_PLAYOFFS	Fase de grupos seguida de eliminatorias.	f
\.


--
-- Data for Name: tournaments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tournaments (id, division_id, tournament_type_id, name, season_name, location, start_date, end_date, status, champion_team_id, champion_team_name, final_standings, fee_per_team, fine_yellow, fine_red, fine_red_direct, max_federated_players, double_round, schedule_generated, created_at, max_players_per_team, registration_open) FROM stdin;
86a7dc6c-f590-49f0-abb1-7f3c0dffe62d	e22ae070-36b7-4591-950e-f0216b8a7bb2	\N	Liga de Campeones 2026	Temporada Primavera 2026	Fuengirola	2026-02-18	\N	ACTIVO	\N	\N	\N	\N	5	10	15	\N	\N	\N	2026-02-18 12:10:37.694136+00	\N	t
07935560-9e2e-413b-ae5c-3e3f7daa266f	2cec8476-a224-41d5-b597-388fc05c2c75	\N	Liga de campeones +30	+30	M├ílaga Teatinos gaonas 	2026-04-05	\N	ACTIVO	\N	\N	\N	380	5	10	15	\N	\N	\N	2026-04-09 15:45:35.846323+00	\N	t
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, password_hash, role, team_id, status, created_at, phone) FROM stdin;
b81a7f89-9cf5-4045-891d-96b438da26e0	Admin Principal	admin@liga.com	$2b$10$VuKyujfpqA7CV8n2u6iuLOPtqdCuQkj0daLPL8M9ahO4L30doiDNS	ADMIN	\N	ACTIVO	2026-02-18 12:10:37.876845+00	\N
e1081b0f-e28e-4c0f-9171-9e11935996ee	Admin Secundario	admin2@liga.com	$2b$10$kpnwGAnXfkCiOVq1wFA2JOIdkglmBfgyhkme05n.HrHE3b/H3Zfwu	ADMIN	\N	ACTIVO	2026-02-18 12:10:38.036315+00	\N
a919551f-6e8e-41f9-96f4-7ad054e522d5	Admin Soporte	admin3@liga.com	$2b$10$ez.bYoC8xRT2rbjkUwcGaeEDwJdZReAdrUhDcP/sV/UerjsyKIHsq	ADMIN	\N	ACTIVO	2026-02-18 12:10:38.195494+00	\N
dceb6fcb-3a93-4846-b305-7c7c6a8b8709	Capit├ín El Palo	capitan1@liga.com	$2b$10$M7mH7iFXPqEToQFroqnqkOzT4xudex6LNsZKb4t/P2XsCDb2rG.7K	CAPITAN	99136abb-ea3f-45e9-8283-14931917b21a	ACTIVO	2026-02-18 12:10:38.454356+00	\N
3d0470a9-dfb0-4a1b-af83-a7b3cb0af389	Capit├ín Fuengirola	capitan2@liga.com	$2b$10$QNPbmc13kl1/jFcZhvWSreQWeHlzphpHkUfMa49Aw4AZW4jAWUAfe	CAPITAN	3fa0fd99-35d0-40b7-a30d-d0881711c5cf	ACTIVO	2026-02-18 12:10:38.633155+00	\N
0aa2a754-185c-414c-8821-26a7c78f885e	Capit├ín Rejunte	capitan4@liga.com	$2b$10$E33pFX2StLjsknbiYZgJduZn0yyYHOrN8jc/4kkfvs7p/Bk6C5H52	CAPITAN	a56a9605-b612-4c44-8426-c5e65ae83926	ACTIVO	2026-02-18 12:10:38.984539+00	\N
049ae609-dc8e-4e7e-819c-bdc0df4b404a	Juan P├®rez	arbitro1@liga.com	$2b$10$azP6OclfF.Qq7nXzGTrYO.kzc7aRMszMKjK3l9iRIKr84uG5ruYuS	ARBITRO	\N	ACTIVO	2026-02-18 12:10:39.167643+00	\N
66b47301-199e-44e0-80f9-f19bd497d168	shey	sheylagaona312@gmail.com	$2b$10$i7G5JUF58cnrX5MIcR6reO5cLeug.G7sbtJuI/8ireTrwzzp7hGga	ADMIN	\N	ACTIVO	2026-02-25 18:00:16.199572+00	\N
47e14470-8cbc-48c7-aac0-6c58f70ddaeb	Fer y Lucia	Ferbogadofilms@gmail.com	$2b$10$hs5JmJ6aj1xKjyf1aFUlpuueDQf1aCtvfmrcbxdaZSvuCw71pucEu	MARKETING	\N	ACTIVO	2026-02-25 18:19:25.675857+00	\N
587f05d4-2d16-4abc-809b-ec65625844ab	Pedro G├│mez	arbitro2@liga.com	$2b$10$r2JcZh0vC2QNGu7hY6mVQuG3ggF17yua.2LBaIFXnFkoeW20kgCkK	ARBITRO	\N	ACTIVO	2026-02-18 12:10:39.328234+00	\N
a248fbb7-f9ed-4626-aab0-a478e1dc8ccf	Capit├ín Millonarios	capitan3@liga.com	$2b$10$y8AJJvGoO3HrMRLQolgo/.kh8L9RaUy7fbAjismiMHBBD.7JZstUG	CAPITAN	bb416f3a-f7c8-418a-b2eb-2d425bd301f6	ACTIVO	2026-02-18 12:10:38.811798+00	\N
26674c0d-f51f-44d3-84b3-8ebc052fdde3	Pablo Castillo 	cjfajardo@yahoo.com	$2b$10$4rlyrt8WuV/LG./PxExdDuENa/hBfKpb77IjK1uJZdmyLEpXuGqBa	CAPITAN	d81a1f2b-8397-4f2f-9f63-6f2edc169c47	ACTIVO	2026-03-17 17:55:59.028961+00	\N
fa02b729-5488-4898-8e68-456f1f7c1e48	Carlos Fajardo	claudia.fajardo@gruposalus.com.mx	$2b$10$VmnAm04YhXPmq/jVhmbnjOfTHQVObSJQfP1K/GiozHuJdKWzybrqG	CAPITAN	d51210e5-9302-47dc-b4e8-722b05d8344d	ACTIVO	2026-03-17 18:51:21.027548+00	\N
d064eb1c-fae8-4b88-ba7f-64d42a3405c4	Jos├® Heredia 	Athenea.neymar@gmail.com	$2b$10$U2qzmsuWLmMR6vtLYYK64.svJGvFVvSCm5PemdATli1Id2niuODhy	ARBITRO	\N	ACTIVO	2026-03-17 19:36:55.003797+00	\N
ac8eca36-dd3f-4aab-ba50-653852f29d5f	C├®sar Francisco 	cesar99alvarenga@gmail.com	$2b$10$O0DQxNTCI19E7eZ1eK/UX.mdgT6.TqcYevwYFNwjf08gzSpKU74FG	CAPITAN	0de56b98-1b8a-4dfd-977e-f9939f822c3a	ACTIVO	2026-03-17 19:42:21.374063+00	\N
99365d73-c10e-461e-9362-b04c6ed3b175	Nestor Fabian Benitez	winey7911@gmail.com	$2b$10$Qt3h66anuXVf6sQYAeeqEu0zXMP6SJQE3zy4wDYjGnbeh8XCBRIyq	CAPITAN	34c51dc3-f3ab-4d18-adad-970db3a37784	ACTIVO	2026-03-20 21:00:55.674417+00	603446106
d1acdb9d-3730-4708-a438-16f93708cfed	David Franco 	juliodavidfranco79@gmail.com	$2b$10$YpwmJClDWLtxsOL8B5C9kepjhvZt/Xhbyg0Ho2SaZeuCgkTQao9BO	CAPITAN	91cf16fd-0336-4df0-a15a-25e820eed7b5	ACTIVO	2026-03-18 13:09:03.94841+00	\N
920718d1-51ed-465c-857b-6dadd0bf3c2f	Marcelo Santacruz Cardozo 	marcelitosantacruzcardozo.91@gmail.com	$2b$10$RkiYEFeXxLBoqZ/mE8X6nul2TTjkcZw5Rn/cvcaWIfhat1PZIgrLu	CAPITAN	\N	ACTIVO	2026-03-18 14:59:40.937794+00	\N
1acdd179-7fd9-407b-8e84-40a0ef9d86db	Eduardo Pruebas	ecastm@yahoo.com	$2b$10$Frf5VjtHHz6v89g23/VQQO5aaKmis3RKwMGBJBDualySSTjGiYtwW	CAPITAN	\N	ACTIVO	2026-03-19 13:08:19.579807+00	\N
7acf2739-1e28-411a-a8ab-d04f974030c5	Lorenzo Ocampos	ocamposlorenzo998@gmail.com	$2b$10$Zphg9EqCj.9uMwHIyMgDuOM.2d0Ue4J3WfyBJoQuH/sc/dhDvntFy	CAPITAN	2e23f2d6-4042-4a94-9ebb-13069e23fc1c	ACTIVO	2026-03-18 13:05:16.832468+00	\N
b058a115-e5ed-4641-ad39-142f9faa70b4	Rafael duarte	wwwrafael.95@gemail.com	$2b$10$CjCu2ejO5G56QUjCmblu/eTaPTQj29TOd0LREpuZqWS7Yy0SsPJyy	CAPITAN	\N	ACTIVO	2026-03-18 20:18:15.146234+00	\N
edb46209-a717-4a80-aa36-3c01bd331484	Miguel	sebas95ramos@gmail.com	$2b$10$YgAYNCRNtmTgOvQ1sIidGOEZLlOUxxjux1AMFyRweFaBqxFOaex7S	CAPITAN	6dc24c30-97fe-410a-8bf4-f096507da76c	ACTIVO	2026-03-18 21:29:32.560927+00	\N
717e578d-7b85-45a2-a56a-8ed083a9b70c	Carlos David Arias	carlosdavidarias124@gmail.com	$2b$10$ugdfFqCWvuXhSMKhGCMHMOfEbG3TJQXndUDg3eOm25DwSF3OwPLni	CAPITAN	065bfcc2-308e-4fd4-b0f7-e90d5b8b56bc	ACTIVO	2026-03-20 08:44:18.873196+00	602431277
8318b642-2210-4d24-80a4-de52e7e84202	Jose Torres	torresjo2002@gmail.com	$2b$10$wKORADmzRtT.4sV/zwM8sONZfalKk/lrtdwvqQ0Pw7sgTX2QR187S	CAPITAN	3504f2dc-9798-4e8f-b754-6568193dffcd	ACTIVO	2026-03-20 12:53:58.870159+00	624079732
dd357587-c4e2-431e-9a55-7a0325d6c9d8	Alexis 	alexisparedesbritos56@gmail.com	$2b$10$ABiF2XN/EUSzN6f256LAK.Y473piR/DJ0JLPWsBIydiKRIui9hp9a	CAPITAN	35df28de-250d-4623-8437-124cd36679b4	ACTIVO	2026-03-22 22:32:46.734536+00	634261552
3832b4c5-e4f0-4ed5-9661-ea487d638d8e	Jhonatan alejandro	alejandrovillalba0014@gmail.com	$2b$10$zvXImIi6UDbNiGgQCO2mwOTL8CFglk96xfIiF2vfAA2ohMufc7er.	CAPITAN	a0b6f286-9313-4773-81b2-55c8b131f22f	ACTIVO	2026-03-30 09:51:38.087431+00	631241997
d68fa143-e655-4bb2-8f44-7fbef6f669f2	Francisco Javier Cortes	adfjavicc@gmail.com	$2b$10$43WB5l5kzK69fmyfoJLgQe2PhAmvSsuQ2r7oWKKheNFl.Y.vwzBWu	ARBITRO	\N	ACTIVO	2026-03-23 11:42:58.006796+00	+34665596020
069d6191-ba75-4291-84bc-8ba9a4af31f2	Richard Gonzalo	richardtuma19@gmail.com	$2b$10$.cqLMTtzML4bC.ab4dtK/Oix3SLMkv9dtpHejjmyClb4a897KAr6i	CAPITAN	6259d3d1-9cfe-4c19-8b32-f7e6d1433942	ACTIVO	2026-03-31 08:45:00.948324+00	642323128
d04be537-adfa-4eb0-b288-ef8d13e37568	Daniel Medina Vargas	danielmedinavargas@hotmail.com	$2b$10$GfUCwoc0JWBovgIzh1JZV.ayxPHaDqaN8/mOVUhzfmMQ1EB.AtveW	CAPITAN	1ebc1b72-055e-4aef-a906-ed0ec11e2840	ACTIVO	2026-04-02 11:27:08.192587+00	631809655
59b39d53-da4e-4dcd-8166-4fafb641bec6	ale	alejandroveragaona2008@gmail.com	$2b$10$CXNHhsT/fLI/xEQ33GEZiu6MKhJiaOs1sWfHcIt4SwBjZazAw1hR6	ADMIN	\N	ACTIVO	2026-04-02 11:32:06.46067+00	+34 661658956
2cf3faf6-c8a8-41cf-88f7-dec1687de700	Sebasti├ín Ortega 	23sebastian.ortega@gmail.com	$2b$10$AfIkzWfhmyJgK4FFXLvfquMAqcCusWPdDCExzavn6g.WlgYC6Qa6q	CAPITAN	2309b0ff-44cc-4964-b56c-182fe8ebb925	ACTIVO	2026-04-02 22:15:25.960998+00	600990757
10e31109-240f-4af8-84d7-6d2fd89673eb	Javier	rs3603906@gmail.com	$2b$10$eOm/RuJFTQuxaPS1D4NOFOS7f4ZErxFZeg8VdeJWwTiWecL/lkDJK	CAPITAN	\N	ACTIVO	2026-04-03 14:43:51.42618+00	+34624970369
893f7549-ed21-4b6b-b5f4-8b7fbe7239b5	Adilson Roldan	comcome87@gmail.com	$2b$10$GSEh0sY1NB3pP9OMdV0T2eoZSVr2j9KOgDiKQ9I5tRcYDqKWW4fx.	ARBITRO	\N	ACTIVO	2026-04-03 18:15:34.841055+00	+3466107765
0b805314-0014-4a84-858d-0664b8d66372	Sebasti├ín Ortega 	mishykt@hotmail.es	$2b$10$H9z2z7GW9HjKSDXIJEZ1T.0ldGTWzZtDs30PS/yCVMbcwlylykfOi	CAPITAN	3eb77084-054f-4b21-a3e5-13d898d6960b	ACTIVO	2026-04-03 21:54:21.231566+00	600990757
c92827ef-fd0e-40fa-93f2-9ee2cc31f7e0	Antonio Gutierrez	34069177belgrano@gmail.com	$2b$10$tfbKHtLfJhdgep7H6Y0eQO.FD7OANRFOziPOSQvS38460jkeeZfvC	CAPITAN	\N	ACTIVO	2026-04-04 16:35:31.069281+00	+34617181231
1cbeade8-e712-486a-ad25-761c07069337	David arias 	davidariascarlosdamianbeniten@gmail.com	$2b$10$lBAMOrhhNgtGXi5ssWvRV./5b3mmwT2RKMAeYSr76h0VveqVXcAMO	CAPITAN	065bfcc2-308e-4fd4-b0f7-e90d5b8b56bc	ACTIVO	2026-04-05 13:38:27.533023+00	\N
881b9ea8-b0e0-49aa-b7ce-8ac295ee92fc	Arnaldo Cabrera	cabreraarnaldo832@gmail.com	$2b$10$qF9zTL2pl13zIo62xMRhxeibznTivohETz5Y47kNcci.o13YgbDUO	CAPITAN	\N	ACTIVO	2026-04-05 16:45:13.577917+00	602464931
2b208810-3b5c-4618-9114-e95a5b5586b8	Ever Hugo Fari├▒a 	hugofarina99@gmail.com	$2b$10$mtdKjdxTRTWKa4EsEmLD1ui6DXas4Z6jdJ2Om70KUoLMSpi1ce83y	CAPITAN	46517705-b03a-4797-9e01-b23acba49c56	ACTIVO	2026-04-08 08:14:50.846302+00	642452007
70d57a75-6f58-4b36-a288-8af3a4e93bc3	Fernando 	fernando.nbogado@gmail.com	$2b$10$bRSo5d66/VQIrihNpqr2Wem7IIbEGZHhaspsLw3JdHX0KNYJZpquC	CAPITAN	\N	ACTIVO	2026-04-08 12:40:22.290804+00	611150364
e10d919f-f203-4d13-899a-787146bce2c7	Ruben ferreira	rudafedo14@gmail.com	$2b$10$oYgkgsP3ksr1Br7tfV2eWu0fm1knMXVWajosCY7vRLsyVYsL7xjy.	ARBITRO	\N	ACTIVO	2026-04-08 18:26:49.818429+00	+34652615497
b6268ee7-63d3-4fc5-9fd6-1d51ef64169e	Richard Cabral 	richard.cabral.758@gmail.com	$2b$10$TQHMq82iDSS43tZYxImzi.tye1A/ylR9XMEcSfM99T6Qu8RKDwBTK	CAPITAN	c7052d00-140e-4d8a-ae44-63e8603a5236	ACTIVO	2026-04-08 18:25:00.79587+00	614495995
9c4b0e49-7e46-48e8-b491-880890333081	Richard Cabral 	galeanocamila32@gmail.com	$2b$10$xBg7XFQ0ripFqaTZpMVt3utnRjVNmiEGGsS04lf1n6bORc28Db/tG	CAPITAN	c3efc237-51c9-471f-a17d-4f90f1f253af	ACTIVO	2026-04-08 19:08:26.264129+00	614495995
\.


--
-- Name: replit_database_migrations_v1_id_seq; Type: SEQUENCE SET; Schema: _system; Owner: -
--

SELECT pg_catalog.setval('_system.replit_database_migrations_v1_id_seq', 34, true);


--
-- PostgreSQL database dump complete
--

\unrestrict UO2EqA5CMUeKmteKMf77ICgLPqY7jCposbF5D8o6K6mHNS82C8RIn0erAOSsyAe

