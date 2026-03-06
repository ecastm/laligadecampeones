-- =============================================
-- BACKUP COMPLETO BASE DE DATOS PRODUCCIÓN
-- Fecha: 2026-03-06T20:41:10.568Z
-- =============================================

-- SCHEMA DEFINITIONS
create_stmt
"CREATE TABLE bracket_matches (match_id text, status text NOT NULL DEFAULT 'PENDIENTE'::text, home_score integer, away_team_id text, id character varying(255) NOT NULL DEFAULT gen_random_uuid(), season_id text NOT NULL, away_score integer, phase text NOT NULL, tournament_id text NOT NULL, winner_id text, match_order integer NOT NULL DEFAULT 1, created_at text NOT NULL DEFAULT now(), home_team_id text, seed text);"
"CREATE TABLE captain_profiles (identification_number text NOT NULL, email text NOT NULL, id character varying(255) NOT NULL DEFAULT gen_random_uuid(), created_at text NOT NULL DEFAULT now(), full_name text NOT NULL, identification_type text DEFAULT 'DNI'::text, user_id text NOT NULL, address text, emergency_contact text, division_id text, phone text NOT NULL, updated_at text NOT NULL DEFAULT now(), observations text, emergency_phone text);"
"CREATE TABLE competition_rules (promotion_count integer, category_id text NOT NULL, federated_limit integer NOT NULL DEFAULT 3, is_active boolean NOT NULL DEFAULT true, created_at text NOT NULL DEFAULT now(), round_robin text NOT NULL DEFAULT 'double'::text, points_draw integer NOT NULL DEFAULT 1, updated_at text NOT NULL DEFAULT now(), relegation_count integer, rules_version integer NOT NULL DEFAULT 1, plus30_rules jsonb, points_win integer NOT NULL DEFAULT 3, id character varying(255) NOT NULL DEFAULT gen_random_uuid(), format_type text NOT NULL, teams_per_division integer NOT NULL DEFAULT 10, points_loss integer NOT NULL DEFAULT 0);"
"CREATE TABLE competition_seasons (rules_id text NOT NULL, id character varying(255) NOT NULL DEFAULT gen_random_uuid(), updated_at text NOT NULL DEFAULT now(), category_id text NOT NULL, tournament_id text, created_at text NOT NULL DEFAULT now(), rules_version integer NOT NULL, status text NOT NULL DEFAULT 'draft'::text, name text NOT NULL);"
"CREATE TABLE contact_messages (email text NOT NULL, created_at text NOT NULL DEFAULT now(), comments text NOT NULL, contact_name text NOT NULL, id character varying(255) NOT NULL DEFAULT gen_random_uuid(), status text NOT NULL DEFAULT 'NUEVO'::text, phone text NOT NULL);"
"CREATE TABLE division_movements (to_division text NOT NULL, team_name text NOT NULL, from_division text NOT NULL, team_id text NOT NULL, created_at text NOT NULL DEFAULT now(), movement_type text NOT NULL, id character varying(255) NOT NULL DEFAULT gen_random_uuid(), season_id text NOT NULL);"
"CREATE TABLE divisions (created_at text NOT NULL DEFAULT now(), theme text NOT NULL, id character varying(255) NOT NULL DEFAULT gen_random_uuid(), name text NOT NULL, description text);"
"CREATE TABLE expenses (concept text NOT NULL, notes text, expense_at text NOT NULL, amount real NOT NULL, created_at text NOT NULL DEFAULT now(), id character varying(255) NOT NULL DEFAULT gen_random_uuid(), receipt_url text, tournament_id text NOT NULL);"
"CREATE TABLE fine_payments (amount real NOT NULL, team_id text NOT NULL, tournament_id text NOT NULL, paid_at text NOT NULL, notes text, created_at text NOT NULL DEFAULT now(), id character varying(255) NOT NULL DEFAULT gen_random_uuid());"
"CREATE TABLE fines (id character varying(255) NOT NULL DEFAULT gen_random_uuid(), match_id text NOT NULL, card_type text NOT NULL, status text NOT NULL DEFAULT 'PENDIENTE'::text, match_event_id text, player_id text, amount real NOT NULL, paid_amount real, created_at text NOT NULL DEFAULT now(), tournament_id text NOT NULL, paid_at text, team_id text NOT NULL);"
"CREATE TABLE marketing_media (type text NOT NULL, description text, url text NOT NULL, thumbnail_url text, tournament_id text, created_at text NOT NULL DEFAULT now(), id character varying(255) NOT NULL DEFAULT gen_random_uuid(), title text NOT NULL);"
"CREATE TABLE match_attendance (present boolean NOT NULL DEFAULT false, id character varying(255) NOT NULL DEFAULT gen_random_uuid(), player_id text NOT NULL, match_id text NOT NULL, team_id text NOT NULL, created_at text NOT NULL DEFAULT now());"
"CREATE TABLE match_events (notes text, minute integer NOT NULL, related_player_id text, type text NOT NULL, player_id text NOT NULL, id character varying(255) NOT NULL DEFAULT gen_random_uuid(), team_id text NOT NULL, match_id text NOT NULL);"
"CREATE TABLE match_evidence (match_id text NOT NULL, created_at text NOT NULL DEFAULT now(), url text NOT NULL, transcript text, event_id text, type text NOT NULL, id character varying(255) NOT NULL DEFAULT gen_random_uuid());"
"CREATE TABLE match_lineups (match_id text NOT NULL, team_id text NOT NULL, id character varying(255) NOT NULL DEFAULT gen_random_uuid(), created_at text NOT NULL DEFAULT now(), player_ids jsonb NOT NULL);"
"CREATE TABLE matches (home_team_id text NOT NULL, tournament_id text NOT NULL, round_number integer NOT NULL, away_score integer, vs_image_url text, stage_id text, referee_user_id text, id character varying(255) NOT NULL DEFAULT gen_random_uuid(), field text NOT NULL, status text NOT NULL DEFAULT 'PROGRAMADO'::text, away_team_id text NOT NULL, referee_notes text, home_score integer, stage text, date_time text NOT NULL);"
"CREATE TABLE news (match_id text, updated_at text NOT NULL DEFAULT now(), id character varying(255) NOT NULL DEFAULT gen_random_uuid(), author_id text NOT NULL, content text NOT NULL, tournament_id text NOT NULL, title text NOT NULL, created_at text NOT NULL DEFAULT now(), image_url text);"
"CREATE TABLE player_suspensions (id character varying(255) NOT NULL DEFAULT gen_random_uuid(), match_event_id text, match_id text NOT NULL, status text NOT NULL DEFAULT 'ACTIVO'::text, player_id text NOT NULL, team_id text NOT NULL, matches_remaining integer NOT NULL DEFAULT 1, tournament_id text NOT NULL, created_at text NOT NULL DEFAULT now(), reason text NOT NULL);"
"CREATE TABLE players (id character varying(255) NOT NULL DEFAULT gen_random_uuid(), first_name text NOT NULL, is_federated boolean, last_name text NOT NULL, identification_id text, photo_urls ARRAY, team_id text NOT NULL, active boolean NOT NULL DEFAULT true, position text, identification_type text DEFAULT 'DNI'::text, federation_id text, jersey_number integer NOT NULL);"
"CREATE TABLE referee_profiles (identification_type text DEFAULT 'DNI'::text, observations text, created_at text NOT NULL DEFAULT now(), full_name text NOT NULL, user_id text NOT NULL, email text NOT NULL, years_of_experience integer, updated_at text NOT NULL DEFAULT now(), status text NOT NULL DEFAULT 'ACTIVO'::text, association text, phone text NOT NULL, id character varying(255) NOT NULL DEFAULT gen_random_uuid(), identification_number text NOT NULL);"
"CREATE TABLE site_settings (email text, facebook_url text, address text, id character varying(255) NOT NULL DEFAULT gen_random_uuid(), phone text, instagram_url text, whatsapp_number text, logo_url text, league_name text NOT NULL DEFAULT 'La Liga de Campeones'::text, updated_at text NOT NULL DEFAULT now());"
"CREATE TABLE standings_entries (updated_at text NOT NULL DEFAULT now(), team_id text NOT NULL, position integer NOT NULL DEFAULT 0, season_id text NOT NULL, goal_difference integer NOT NULL DEFAULT 0, goals_for integer NOT NULL DEFAULT 0, lost integer NOT NULL DEFAULT 0, goals_against integer NOT NULL DEFAULT 0, tournament_id text NOT NULL, division text, played integer NOT NULL DEFAULT 0, drawn integer NOT NULL DEFAULT 0, id character varying(255) NOT NULL DEFAULT gen_random_uuid(), won integer NOT NULL DEFAULT 0, points integer NOT NULL DEFAULT 0);"
"CREATE TABLE team_payments (tournament_id text NOT NULL, method text, created_at text NOT NULL DEFAULT now(), notes text, amount real NOT NULL, id character varying(255) NOT NULL DEFAULT gen_random_uuid(), team_id text NOT NULL, paid_at text NOT NULL);"
"CREATE TABLE teams (division_id text, instagram_url text, name text NOT NULL, id character varying(255) NOT NULL DEFAULT gen_random_uuid(), coach_name text, captain_user_id text, home_field text NOT NULL, tournament_id text NOT NULL, logo_url text, colors text NOT NULL);"
"CREATE TABLE tournament_stages (stage_type text, tournament_id text NOT NULL, sort_order integer NOT NULL DEFAULT 1, id character varying(255) NOT NULL DEFAULT gen_random_uuid(), name text NOT NULL);"
"CREATE TABLE tournament_types (description text NOT NULL, algorithm text NOT NULL, name text NOT NULL, supports_double_round boolean NOT NULL DEFAULT false, id character varying(255) NOT NULL DEFAULT gen_random_uuid());"
"CREATE TABLE tournaments (end_date text, location text NOT NULL, created_at text NOT NULL DEFAULT now(), division_id text, fine_red real, name text NOT NULL, tournament_type_id text, fine_yellow real, champion_team_id text, final_standings jsonb, schedule_generated boolean, id character varying(255) NOT NULL DEFAULT gen_random_uuid(), double_round boolean, status text NOT NULL DEFAULT 'ACTIVO'::text, start_date text NOT NULL, fine_red_direct real, max_federated_players integer, season_name text NOT NULL, fee_per_team real, champion_team_name text);"
"CREATE TABLE users (team_id text, id character varying(255) NOT NULL DEFAULT gen_random_uuid(), password_hash text NOT NULL, status text NOT NULL DEFAULT 'ACTIVO'::text, email text NOT NULL, created_at text NOT NULL DEFAULT now(), name text NOT NULL, role text NOT NULL);"


-- TABLE: divisions (3 rows)
-- DATA:
id,name,theme,description,created_at
e22ae070-36b7-4591-950e-f0216b8a7bb2,Primera División,PRIMERA,Máxima categoría,2026-02-18 12:10:37.549125+00
dd036abe-f19c-4a6f-8fe2-231aa5582882,Segunda División,SEGUNDA,Segunda categoría,2026-02-18 12:10:37.575956+00
2cec8476-a224-41d5-b597-388fc05c2c75,+ 30,PRIMERA,,2026-03-04 09:56:01.956136+00


-- TABLE: tournament_types (3 rows)
-- DATA:
id,name,algorithm,description,supports_double_round
4fbb15a2-daf9-4a1f-afe9-7a8eaca2ee5b,Liga (Todos contra todos),ROUND_ROBIN,Todos los equipos juegan entre sí. El campeón es quien acumula más puntos.,t
d563df28-8c52-4e5c-82d8-9139409cf9a5,Eliminación directa,KNOCKOUT,"Llaves directas, el perdedor queda eliminado.",f
7b479915-ef1f-4921-9f2f-2d5aafb0b214,Grupos + Playoffs,GROUPS_PLAYOFFS,Fase de grupos seguida de eliminatorias.,f


-- TABLE: users (11 rows)
-- DATA:
id,name,email,password_hash,role,team_id,status,created_at
b81a7f89-9cf5-4045-891d-96b438da26e0,Admin Principal,admin@liga.com,$2b$10$VuKyujfpqA7CV8n2u6iuLOPtqdCuQkj0daLPL8M9ahO4L30doiDNS,ADMIN,,ACTIVO,2026-02-18 12:10:37.876845+00
e1081b0f-e28e-4c0f-9171-9e11935996ee,Admin Secundario,admin2@liga.com,$2b$10$kpnwGAnXfkCiOVq1wFA2JOIdkglmBfgyhkme05n.HrHE3b/H3Zfwu,ADMIN,,ACTIVO,2026-02-18 12:10:38.036315+00
a919551f-6e8e-41f9-96f4-7ad054e522d5,Admin Soporte,admin3@liga.com,$2b$10$ez.bYoC8xRT2rbjkUwcGaeEDwJdZReAdrUhDcP/sV/UerjsyKIHsq,ADMIN,,ACTIVO,2026-02-18 12:10:38.195494+00
dceb6fcb-3a93-4846-b305-7c7c6a8b8709,Capitán El Palo,capitan1@liga.com,$2b$10$M7mH7iFXPqEToQFroqnqkOzT4xudex6LNsZKb4t/P2XsCDb2rG.7K,CAPITAN,99136abb-ea3f-45e9-8283-14931917b21a,ACTIVO,2026-02-18 12:10:38.454356+00
3d0470a9-dfb0-4a1b-af83-a7b3cb0af389,Capitán Fuengirola,capitan2@liga.com,$2b$10$QNPbmc13kl1/jFcZhvWSreQWeHlzphpHkUfMa49Aw4AZW4jAWUAfe,CAPITAN,3fa0fd99-35d0-40b7-a30d-d0881711c5cf,ACTIVO,2026-02-18 12:10:38.633155+00
0aa2a754-185c-414c-8821-26a7c78f885e,Capitán Rejunte,capitan4@liga.com,$2b$10$E33pFX2StLjsknbiYZgJduZn0yyYHOrN8jc/4kkfvs7p/Bk6C5H52,CAPITAN,a56a9605-b612-4c44-8426-c5e65ae83926,ACTIVO,2026-02-18 12:10:38.984539+00
049ae609-dc8e-4e7e-819c-bdc0df4b404a,Juan Pérez,arbitro1@liga.com,$2b$10$azP6OclfF.Qq7nXzGTrYO.kzc7aRMszMKjK3l9iRIKr84uG5ruYuS,ARBITRO,,ACTIVO,2026-02-18 12:10:39.167643+00
66b47301-199e-44e0-80f9-f19bd497d168,shey,sheylagaona312@gmail.com,$2b$10$i7G5JUF58cnrX5MIcR6reO5cLeug.G7sbtJuI/8ireTrwzzp7hGga,ADMIN,,ACTIVO,2026-02-25 18:00:16.199572+00
47e14470-8cbc-48c7-aac0-6c58f70ddaeb,Fer y Lucia,Ferbogadofilms@gmail.com,$2b$10$hs5JmJ6aj1xKjyf1aFUlpuueDQf1aCtvfmrcbxdaZSvuCw71pucEu,MARKETING,,ACTIVO,2026-02-25 18:19:25.675857+00
587f05d4-2d16-4abc-809b-ec65625844ab,Pedro Gómez,arbitro2@liga.com,$2b$10$r2JcZh0vC2QNGu7hY6mVQuG3ggF17yua.2LBaIFXnFkoeW20kgCkK,ARBITRO,,ACTIVO,2026-02-18 12:10:39.328234+00
a248fbb7-f9ed-4626-aab0-a478e1dc8ccf,Capitán Millonarios,capitan3@liga.com,$2b$10$y8AJJvGoO3HrMRLQolgo/.kh8L9RaUy7fbAjismiMHBBD.7JZstUG,CAPITAN,bb416f3a-f7c8-418a-b2eb-2d425bd301f6,ACTIVO,2026-02-18 12:10:38.811798+00


-- TABLE: tournaments (1 rows)
-- DATA:
id,division_id,tournament_type_id,name,season_name,location,start_date,end_date,status,champion_team_id,champion_team_name,final_standings,fee_per_team,fine_yellow,fine_red,fine_red_direct,max_federated_players,double_round,schedule_generated,created_at
86a7dc6c-f590-49f0-abb1-7f3c0dffe62d,e22ae070-36b7-4591-950e-f0216b8a7bb2,,Liga de Campeones 2026,Temporada Primavera 2026,Fuengirola,2026-02-18T12:10:37.681Z,,ACTIVO,,,,,,,,,,,2026-02-18 12:10:37.694136+00


-- TABLE: teams (9 rows)
-- DATA:
id,tournament_id,division_id,name,colors,home_field,logo_url,captain_user_id,coach_name,instagram_url
a56a9605-b612-4c44-8426-c5e65ae83926,86a7dc6c-f590-49f0-abb1-7f3c0dffe62d,e22ae070-36b7-4591-950e-f0216b8a7bb2,Rejunte,Rojo y Blanco,Campo Rejunte,/objects/uploads/d4a9e6fb-f500-49a4-865d-70b00bee2606,0aa2a754-185c-414c-8821-26a7c78f885e,,
382bcce4-cda4-4d82-99bb-96597d16cb30,86a7dc6c-f590-49f0-abb1-7f3c0dffe62d,dd036abe-f19c-4a6f-8fe2-231aa5582882,Albirroja torre Velez  LIBRE ,"blanco ,rojo y azul",CAMPOR POLRTADA ALTA TEATINOS,/objects/uploads/8cd08528-dbf8-4238-818f-392198b28ea3,,DANIEL ,
5ee31858-67e1-4392-8318-0a3a84fbd24c,86a7dc6c-f590-49f0-abb1-7f3c0dffe62d,e22ae070-36b7-4591-950e-f0216b8a7bb2,C.F.C. JR. ,Rojo y blanco ,Campo de fútbol portada,/objects/uploads/1bca5d92-f558-48fd-8f8c-f70156eda72d,,Ángel ,
40a28bf3-e59d-4b19-a3ac-4a69e376968c,86a7dc6c-f590-49f0-abb1-7f3c0dffe62d,dd036abe-f19c-4a6f-8fe2-231aa5582882,TOBATI  (LIBRE),VERDE OSCURO Y BLANCO,CAMPOR POLRTADA ALTA TEATINOS,/objects/uploads/5f1c37a0-857a-42ec-b49d-b07160ce4ed0,,JOSE TORRES,
4a3badc3-5a58-4ef0-9111-bca3c193ebca,86a7dc6c-f590-49f0-abb1-7f3c0dffe62d,dd036abe-f19c-4a6f-8fe2-231aa5582882,MALAGA C.F.  (LIBRE),BLANCO Y AZUL,CAMPOR POLRTADA ALTA TEATINOS,/objects/uploads/cbb21f5d-c07c-4267-b419-865f74797df7,,ARLANDO ,
3fa0fd99-35d0-40b7-a30d-d0881711c5cf,86a7dc6c-f590-49f0-abb1-7f3c0dffe62d,e22ae070-36b7-4591-950e-f0216b8a7bb2,Fuengirola  (LIBRE),Verde y Blanco,Campo Fuengirola,/objects/uploads/f2a176f1-0c44-40db-9281-ccf0cd3bc706,3d0470a9-dfb0-4a1b-af83-a7b3cb0af389,,
b5384884-bc6a-487d-9f8d-e0ae670f2362,86a7dc6c-f590-49f0-abb1-7f3c0dffe62d,e22ae070-36b7-4591-950e-f0216b8a7bb2,FUENGIROLA +30 ,Verde y Blanco,Campo Fuengirola,/objects/uploads/f2a176f1-0c44-40db-9281-ccf0cd3bc706,,SEBASTIAN,
bb416f3a-f7c8-418a-b2eb-2d425bd301f6,86a7dc6c-f590-49f0-abb1-7f3c0dffe62d,e22ae070-36b7-4591-950e-f0216b8a7bb2,Millonarios,Azul y Blanco,Campo Millonarios,/objects/uploads/4089ae16-bddc-4d56-88bc-74c637e3f593,a248fbb7-f9ed-4626-aab0-a478e1dc8ccf,,millonarios cf
99136abb-ea3f-45e9-8283-14931917b21a,86a7dc6c-f590-49f0-abb1-7f3c0dffe62d,e22ae070-36b7-4591-950e-f0216b8a7bb2,El Palo,Azul y Blanco,Campo El Palo,/objects/uploads/a76d92fb-4477-46ba-9818-f15189ca59f3,dceb6fcb-3a93-4846-b305-7c7c6a8b8709,,


-- TABLE: players (9 rows)
-- DATA:
id,team_id,first_name,last_name,jersey_number,position,identification_id,photo_urls,is_federated,federation_id,active,identification_type
ede2e1bf-af74-4e03-a9af-19032eace580,bb416f3a-f7c8-418a-b2eb-2d425bd301f6,javier,lopez,1,Delantero,jsjsjsj5,{},t,,t,DNI
05034b15-c19c-4fb8-a897-8a3eb96d3099,bb416f3a-f7c8-418a-b2eb-2d425bd301f6,carlos,juanque,1,,,{},f,,t,DNI
804714bf-1a05-49c7-9305-f4b4ddaad97d,bb416f3a-f7c8-418a-b2eb-2d425bd301f6,pedro,sanchez,1,,,{},t,,t,DNI
bc3d14f3-4826-4762-af84-d4cbb7dad24d,bb416f3a-f7c8-418a-b2eb-2d425bd301f6,jorge,lopez,18,,,{},t,,t,DNI
934d82bf-78c6-42e5-9691-ec4963a403d4,bb416f3a-f7c8-418a-b2eb-2d425bd301f6,pepe,gomez,19,,,{},f,,t,DNI
0bf71e2a-805e-425d-b5d8-6c7565002edd,bb416f3a-f7c8-418a-b2eb-2d425bd301f6,ruben,pereira,26,,,{},t,,t,DNI
93643497-1d6c-4285-a06f-3eb11bf2abbc,bb416f3a-f7c8-418a-b2eb-2d425bd301f6,carlitos,torrz,12,,,{},t,,t,DNI
679365c1-d15d-4442-ae1b-bee70519d3e2,bb416f3a-f7c8-418a-b2eb-2d425bd301f6,leo,torrez,81,,,{},t,,t,DNI
fe837171-361c-42dd-9298-5289425d7c82,bb416f3a-f7c8-418a-b2eb-2d425bd301f6,kiko,matamoros,11,,,{},t,,t,DNI


-- TABLE: matches (2 rows)
-- DATA:
id,tournament_id,round_number,date_time,field,home_team_id,away_team_id,referee_user_id,status,home_score,away_score,vs_image_url,stage,referee_notes,stage_id
c5199dbb-9f11-47e0-9775-91168735341b,86a7dc6c-f590-49f0-abb1-7f3c0dffe62d,2,2026-03-08T18:00,PORTA ALTA ,5ee31858-67e1-4392-8318-0a3a84fbd24c,3fa0fd99-35d0-40b7-a30d-d0881711c5cf,,PROGRAMADO,,,/objects/uploads/506d4387-7239-4e8b-8be8-c3c7a5e89404,,,d08eb75d-033b-4c30-a093-9c964f7908a1
ef9f6053-10d0-411e-bc19-4cc17544a472,86a7dc6c-f590-49f0-abb1-7f3c0dffe62d,1,2026-03-07T20:00,PORTA ALTA ,40a28bf3-e59d-4b19-a3ac-4a69e376968c,382bcce4-cda4-4d82-99bb-96597d16cb30,,PROGRAMADO,,,/objects/uploads/3bd840e8-e96f-4b39-9670-5d045f081ea4,,,d08eb75d-033b-4c30-a093-9c964f7908a1


-- TABLE: marketing_media (10 rows)
-- DATA:
id,title,description,type,url,thumbnail_url,tournament_id,created_at
b37ee0c1-0e1c-4983-bb48-03e9f8c76596,IMG_2851,,PHOTO,/objects/uploads/8706f3b9-e3a0-4c17-8035-7ad84516e8c7,,,2026-02-26 10:45:36.230112+00
cf5f514c-ad15-4520-ada2-b19e75d4a687,b70b3cad-7145-4120-bea8-a453262a1acf,,PHOTO,/objects/uploads/063a9661-c7a0-4f56-9d0e-685c07791f29,,,2026-02-26 10:45:38.03265+00
3b8792cd-b782-485a-9ee8-0a9c3a2f32d5,IMG_2546,,PHOTO,/objects/uploads/1663a1ee-eac1-4208-a6c9-aed7b954a302,,,2026-02-26 10:45:39.624282+00
17674f93-6656-4a79-98f4-a97256a4255b,IMG_2545,,PHOTO,/objects/uploads/b23139ab-f798-4a69-b5be-8682be1b8843,,,2026-02-26 10:45:41.202078+00
83a1cd90-3222-40c6-9f9c-db3489d893a3,IMG_2544,,PHOTO,/objects/uploads/09b3f194-762b-4629-af61-62764366f3b5,,,2026-02-26 10:45:42.806472+00
e972ac3b-9036-43b7-9541-7c63259747d0,IMG_2543,,PHOTO,/objects/uploads/b79913e1-7bc2-47c7-8669-0b6c37b04868,,,2026-02-26 10:45:44.291552+00
03cf4e31-8dae-47fd-9403-a1d72f6796ba,IMG_2540,,PHOTO,/objects/uploads/f32d2ebd-e9e4-4ad5-9e11-af3488ff220a,,,2026-02-26 10:45:46.201137+00
f04004cc-a84b-422f-a3c1-dd21c56b8d11,IMG_2539,,PHOTO,/objects/uploads/a2ec5845-caa5-4a61-85a6-6d23bf388f17,,,2026-02-26 10:45:47.928942+00
8e709555-5f8f-425e-9b28-51258e826b0c,IMG_2541,,PHOTO,/objects/uploads/6b0d1121-cb3c-4a9b-b260-36a36b1768ae,,,2026-02-26 10:45:50.847493+00
a8bd860d-13ee-40d4-955f-7571f7e19308,IMG_2538,,PHOTO,/objects/uploads/6013cf39-1b1b-4109-8dd7-e4fe086e6d5e,,,2026-02-26 10:45:52.651725+00


-- TABLE: captain_profiles (2 rows)
-- DATA:
id,user_id,full_name,identification_number,phone,email,address,emergency_contact,emergency_phone,observations,created_at,updated_at,identification_type,division_id
d4fb4f26-6232-48eb-94bb-8a04c48bd492,a248fbb7-f9ed-4626-aab0-a478e1dc8ccf,david,jskjsjsks ,682287161,sheylagaona312@gmail.com,,,,,2026-03-04 10:13:26.003254+00,2026-03-04 10:13:26.003254+00,DNI,
c56ca6cd-6f77-4047-81b2-81b2b4ae4988,dceb6fcb-3a93-4846-b305-7c7c6a8b8709,Eduardo Castillo,z34567809c,+34627867436,eduardo.castillo@gruposalus.com.mx,CARR CANCUN - TULUM KM 307 MZ 329 LT 9,,,,2026-03-04 10:38:24.340679+00,2026-03-04 10:39:07.195473+00,NIE,


-- TABLE: referee_profiles (1 rows)
-- DATA:
id,user_id,full_name,identification_number,phone,email,association,years_of_experience,observations,status,created_at,updated_at,identification_type
f63fda71-ad1e-4bc0-8691-325ab7ad2089,587f05d4-2d16-4abc-809b-ec65625844ab,Pedro Gómez,02562521m,691809799,arbitro2@liga.com,,0,,ACTIVO,2026-03-03 11:00:44.482073+00,2026-03-03 11:00:44.482073+00,DNI


-- TABLE: tournament_stages (1 rows)
-- DATA:
id,tournament_id,name,sort_order,stage_type
d08eb75d-033b-4c30-a093-9c964f7908a1,86a7dc6c-f590-49f0-abb1-7f3c0dffe62d,Jornada Regular,1,LIGA


-- TABLE: site_settings (1 rows)
-- DATA:
id,league_name,logo_url,phone,email,address,instagram_url,facebook_url,whatsapp_number,updated_at
db1a8e5c-4704-42db-99b4-bdaea0d3018e,La Liga de Campeones ,/objects/uploads/88751738-0edb-40a4-b32b-c95814c87e2f,,,,Laligadecampeones_100,,,2026-03-03T10:42:46.287Z


-- TABLE: contact_messages (1 rows)
-- DATA:
id,contact_name,phone,email,comments,status,created_at
1351681c-d2fa-4aae-b42a-4171be9ba244,Daniel Vacas Pérez ,673585995,danivp214@gmail.com,Buenas quería saber si hay alguna posibilidad de ponerme en contacto con los club por si le hace falta jugador ,NUEVO,2026-03-05 14:51:47.70694+00


-- TABLE: match_events (empty)

-- TABLE: match_lineups (empty)

-- TABLE: match_attendance (empty)

-- TABLE: match_evidence (empty)

-- TABLE: news (empty)

-- TABLE: fines (empty)

-- TABLE: fine_payments (empty)

-- TABLE: expenses (empty)

-- TABLE: team_payments (empty)

-- TABLE: player_suspensions (empty)

-- TABLE: competition_rules (empty)

-- TABLE: competition_seasons (empty)

-- TABLE: standings_entries (empty)

-- TABLE: division_movements (empty)

-- TABLE: bracket_matches (empty)

