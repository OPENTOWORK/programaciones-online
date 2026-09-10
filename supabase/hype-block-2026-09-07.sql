-- Semana de Hype generada por scripts/generate-hype-week.mjs
-- Cubre del 2026-09-07 al 2026-09-20 (14 sesiones).
do $$
declare
  target_program uuid;
begin
  select id into target_program from public.programas where lower(trim(name)) = lower(trim('Hype')) limit 1;
  if target_program is null then
    raise exception 'No existe el programa %', 'Hype';
  end if;

  delete from public.entrenos_diarios
  where program_id = target_program
    and coalesce(schedule_config->>'startDate', workout_date::text) between '2026-09-07' and '2026-09-20';

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-07', -5850907, 'Empuje', 'Bloque HY-PE · 7-20 sep 2026 · EMPUJE',
    '75 min', 'Activación · General · 8''
Después: 2-3 aproximaciones progresivas de Floor Press.
• Bike / Row: 3'' suave
• 12 Band Pull Apart: 
• 10 Band External Rotation: por lado
• 10 Scapular Push-up: 
• 8 Push-up: controladas', 'Fuerza · Barbell Floor Press · Descanso: 2''
RPE 7-8.
• Barbell Floor Press: 5 × 6 · RPE 7-8

EMOM · Metabólico · 20'' · ×4
Objetivo: mantener rendimiento estable durante las 4 vueltas.
• Min 1: 12/10 cal Row / Ski / Bike
• Min 2: 12 DB Front Rack Reverse Lunge
• Min 3: 10-15 Push-up
• Min 4: 14 KB Russian Swing
• Min 5: Rest', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-09-07","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-08', -5850908, 'Tracción', 'Bloque HY-PE · 7-20 sep 2026 · TRACCIÓN',
    '70 min', 'Activación · General · 8'' · 2 rondas
Después: 1-2 aproximaciones fáciles de dominada.
• 200 m Run: por ronda
• 8 Scapular Pull-up: por ronda
• 10 Ring Row: por ronda
• 12 Band Face Pull: por ronda
• 20" Hollow Hold: por ronda', 'Fuerza · Strict Pull-up
RPE 7-8.
• Strict Pull-up: 5 × 5-8 · RPE 7-8

Técnica/skills · Progresiones
• Weighted Pull-up: 
• Strict Pull-up: 
• Band Assisted Pull-up: 
• Ring Row: 

For Time · Metabólico · 20'' · 4 rondas - 4'' WORK / 1'' REST
Registrar Ring Row de cada ronda e intentar minimizar la caída de rendimiento.
• 300 m Run: por ronda
• 10 DB Hang Clean: por ronda
• 12 Wall Ball: por ronda
• Max Ring Row: tiempo restante', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-09-08","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-09', -5850909, 'Partner', 'Bloque HY-PE · 7-20 sep 2026 · PARTNER',
    '55 min', 'Activación · General · 8''
• 400 m Run: juntos
• 10 Air Squat: 
• 10 Alternating Lunge: por lado
• 10 KB Deadlift: 
• 8 Push-up: 
• 8 Ring Row: ', 'Partner · AMRAP en pareja · 36''
I GO / YOU GO excepto carrera Synchro. Si completan todo, volver a empezar.
• 800 m Run: Synchro
• 40 DB Thruster: reparto libre
• 40 Ring Row: reparto libre
• 60 Sandbag Walking Lunge: reparto libre
• 40 Burpee: reparto libre
• 1000 m Row / Ski / Bike: reparto libre
• 40 KB Swing: reparto libre
• 40 Push-up: reparto libre
• 40 Goblet Squat: reparto libre
• 800 m Run: Synchro', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-09-09","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-10', -5850910, 'Rodilla', 'Bloque HY-PE · 7-20 sep 2026 · RODILLA',
    '80 min', 'Activación · Movilidad · 8-10''
• Ankle Mobilization: 10 por lado
• Adductor Rock Back: 10 por lado
• 90/90 Hip Switch: 10 totales
• Deep Squat Hold: 30"
• Cossack Squat: 6 por lado
• Tempo Air Squat 3-1-1: 8 reps

Preparación · Back Squat
• Barra vacía: × 10
• Carga ligera: × 6
• Carga media: × 3', 'Fuerza · Back Squat · Descanso: 2''-2''30"
RPE 7-8.
• Back Squat: 5 × 6 · RPE 7-8

AMRAP · Metabólico · 20''
Ritmo sostenible durante 20''.
• 12 Wall Ball: por ronda
• 10 Alternating DB Hang Snatch: por ronda
• 12/10 cal Row / Ski / Bike: por ronda
• 10 Toes-to-Bar / Knees-to-Elbow: por ronda', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-09-10","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-11', -5850911, 'ATHX Day', 'Bloque HY-PE · 7-20 sep 2026 · ATHX DAY',
    '80 min', 'Activación · General · 8''
Después: 2-3 aproximaciones de Deadlift.
• Cardio: 3'' progresivo
• 10 Glute Bridge: 
• 10 KB Deadlift: ligero
• 10 Good Morning: barra vacía
• 8 Bird Dog: por lado', 'Fuerza · Bloque 1 — Strength · Descanso: 2''-2''30"
RPE 7-8.
• Deadlift: 5 × 5 · RPE 7-8

For Time · Bloque 2 — Endurance · 10'' continuous
Alternar 250 m Row / Ski y 200 m Run durante 10 min. Ritmo cardiovascular alto pero sostenible; no interpretarlo como sprint. Con 20 atletas y 10 ergómetros: 10 pueden comenzar en el ergómetro y 10 en carrera.
• 250 m Row / Ski: alternar con
• 200 m Run: durante 10 min continuos

AMRAP · Bloque 3 — MetCon · 10''
Más densidad y resistencia muscular que en el bloque Endurance.
• 10 DB Push Press: por ronda
• 12 Box Step Over: por ronda
• 10 Burpee: por ronda
• 12 KB Goblet Squat: por ronda', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-09-11","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-12', -5850912, 'Partner Stations', 'Bloque HY-PE · 7-20 sep 2026 · PARTNER STATIONS',
    '55 min', 'Activación · General · 8''
Después: 2'' para probar cargas.
• Row / Ski / Bike: 2'' suave
• 10 World''s Greatest Stretch: alternos
• 10 Air Squat: 
• 10 Alternating Lunge: 
• 8 Push-up: 
• 10 Ring Row: 
• 10 KB Deadlift: ', 'Estaciones · 5 estaciones en parejas · 30'' trabajo + transiciones · 6'' WORK - 1'' CHANGE
20 atletas - 10 parejas - 2 parejas por estación. Existen 2 carriles de sled; la distribución debe permitir exactamente 2 parejas en esa estación.
• Estación 1 — Sled: 12,5 m Sled Push atleta A + 12,5 m atleta B · relay continuo
• Estación 2 — Engine: 250 m Row + 250 m Ski · I GO / YOU GO
• Estación 3 — Sandbag: 20 m Sandbag Carry + 10 Sandbag Lunge · alternando
• Estación 4 — Upper Body: 10 Ring Row + 10 Push-up + 10 DB Devil Press · I GO / YOU GO
• Estación 5 — Run + Wall Ball: 200 m Run + 15 Wall Ball · relay', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-09-12","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-13', -5850913, 'Strength', 'Bloque HY-PE · 7-20 sep 2026 · STRENGTH',
    '85 min', 'Activación · General · 8''
• 500 m Row: suave
• 10 Cat-Cow: 
• 8 World''s Greatest Stretch: por lado
• 10 Glute Bridge: 
• 10 Band Pull Apart: 
• 10 Air Squat: ', 'Fuerza · Bloque A · Descanso: 90-120"
• Romanian Deadlift: 4 × 8 · RPE aprox. 7
• DB Bench Press: 4 × 10 · RPE 7-8

Fuerza · Bloque B · Descanso: 90"
• Bulgarian Split Squat: 3 × 10 por lado
• Ring Row: 3 × 12-15

Accesorios · Bloque C
• KB Goblet Squat: 3 × 12
• DB Lateral Raise: 3 × 12-15
• DB Biceps Curl: 3 × 10-12

Core · Core · 3 rondas
Sin MetCon.
• 30" Hollow Hold: por ronda
• 10 Dead Bug: por lado y ronda
• 30" Side Plank: por lado y ronda', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-09-13","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-14', -5850914, 'Empuje', 'Bloque HY-PE · 7-20 sep 2026 · EMPUJE',
    '70 min', 'Activación · General · 8''
• Ski / Bike: 3'' suave
• 10 Band External Rotation: por lado
• 12 Band Pull Apart: 
• 10 Scapular Wall Slide: 
• 8 Tempo Push-up: 
• 10 DB Strict Press: muy ligero', 'Fuerza · DB Bench Press · Descanso: 90-120"
RPE 8. Progresión: semana 1 Barbell Floor Press 5×6 → semana 2 DB Bench Press 4×8-10.
• DB Bench Press: 4 × 8-10 · RPE 8

AMRAP · Metabólico · 20''
Flujo continuo y ritmo sostenible.
• 10 DB Front Rack Walking Lunge: por ronda
• 12/10 cal Bike / Row: por ronda
• 10 Hand Release Push-up: por ronda
• 12 KB Swing: por ronda
• 200 m Run: por ronda', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-09-14","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-15', -5850915, 'Tracción', 'Bloque HY-PE · 7-20 sep 2026 · TRACCIÓN',
    '70 min', 'Activación · General · 8''
• 500 m Row: suave

Activación · Movimiento · 2 rondas
• 8 Scapular Pull-up: por ronda
• 10 Band Straight Arm Pulldown: por ronda
• 10 Ring Row: por ronda
• 15" Active Hang: por ronda', 'Fuerza · Strict Pull-up
RPE 8. Progresión: semana 1 5×5-8 → semana 2 5×6-8.
• Strict Pull-up: 5 × 6-8 · RPE 8

Técnica/skills · Progresión
Si completaste 5×8 la semana anterior con margen: añadir lastre. Si todavía no completaste el rango: mantener variante y progresar repeticiones.

EMOM · Metabólico · 20'' · ×4
• Min 1: 12/10 cal Ski
• Min 2: 10 DB Romanian Deadlift
• Min 3: 12 Wall Ball
• Min 4: 8-10 Burpee Over DB
• Min 5: Rest', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-09-15","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-16', -5850916, 'Partner', 'Bloque HY-PE · 7-20 sep 2026 · PARTNER',
    '55 min', 'Activación · General · 8'' · 2 rondas
• 200 m Run: juntos
• 8 Squat-to-Stand: por ronda
• 10 KB Deadlift: por ronda
• 8 Push-up: por ronda
• 10 Alternating Lunge: por ronda
• 20" Plank: por ronda', 'Partner · For Time · TIME CAP: 38'' · 4 rondas
I GO / YOU GO salvo carrera. Reparto libre. Después de completar las 4 rondas: 2000 m Any Erg.
• 600 m Run: Synchro · por ronda
• 40 DB Hang Power Clean: por ronda
• 30 Box Step Over: por ronda
• 40 Push-up: por ronda
• 30 Sandbag Front Rack Lunge: por ronda
• 40 Sit-up: por ronda
• 2000 m Any Erg: al terminar las 4 rondas', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-09-16","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-17', -5850917, 'Rodilla', 'Bloque HY-PE · 7-20 sep 2026 · RODILLA',
    '70 min', 'Activación · Movilidad · 9''
• Ankle Rock: 10 por lado
• 90/90 Switch: 8 por lado
• Adductor Rock Back: 8 por lado
• Cossack Squat: 8 por lado
• 10 Reverse Lunge: 
• 20" Split Squat Iso Hold: por lado', 'Fuerza · DB Front Rack Bulgarian Split Squat · Descanso: 90-120"
RPE 7-8. Progresión: semana 1 Back Squat 5×6 → semana 2 DB Front Rack Bulgarian Split Squat 4×8/lado.
• DB Front Rack Bulgarian Split Squat: 4 × 8 por lado · RPE 7-8

For Time · Metabólico · TIME CAP: 20'' · 5 rondas
Objetivo: rondas consistentes.
• 400 m Run: por ronda
• 12 DB Alternating Snatch: por ronda
• 10 Toes-to-Bar: por ronda
• 12 Wall Ball: por ronda', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-09-17","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-18', -5850918, 'ATHX Day', 'Bloque HY-PE · 7-20 sep 2026 · ATHX DAY',
    '85 min', 'Activación · General · 8''
• Row: 3'' progresivo
• 10 Glute Bridge: 
• 8 Single Leg RDL: sin carga · por lado
• 10 Band Pull Apart: 
• 8 Good Morning: 
• 8 Push-up: ', 'Fuerza · Bloque 1 — Strength · Descanso: 90-120"
RPE 7-8. Progresión: semana 1 Deadlift 5×5 → semana 2 Barbell RDL 4×8.
• Barbell Romanian Deadlift: 4 × 8 · RPE 7-8

For Time · Bloque 2 — Endurance · 12'' continuous
Alternar durante 12 min. Ritmo estable desde el inicio.
• 300 m Run: alternar con
• 12/10 cal Row / Ski / Bike: durante 12 min

AMRAP · Bloque 3 — MetCon · 12''
• 8 DB Push Press: por ronda
• 10 Burpee Box Step Over: por ronda
• 12 Sandbag Front Squat: por ronda
• 40 m Farmer Carry: por ronda', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-09-18","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-19', -5850919, 'Partner', 'Bloque HY-PE · 7-20 sep 2026 · PARTNER',
    '55 min', 'Activación · General · 8''
• 400 m Run: suave
• 10 Air Squat: 
• 10 Ring Row: 
• 8 Push-up: 
• 10 Alternating Lunge: 
• 10 KB Deadlift: ', 'Partner · AMRAP en pareja · 35''
I GO / YOU GO. BUY IN: 1000 m Run Synchro. Cada vez que completen una vuelta: 400 m Run Synchro.
• 1000 m Run: Synchro · BUY IN
• 30 cal Any Erg: por vuelta
• 40 KB Goblet Squat: por vuelta
• 30 Ring Row: por vuelta
• 40 Sandbag Carry: 20 m · por vuelta
• 30 Burpee: por vuelta
• 40 DB Shoulder-to-Overhead: por vuelta
• 30 Sit-up: por vuelta
• 400 m Run: Synchro · al completar cada vuelta', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-09-19","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-20', -5850920, 'Strength / Bodybuilding', 'Bloque HY-PE · 7-20 sep 2026 · STRENGTH / BODYBUILDING',
    '85 min', 'Activación · General · 8''
• Bike: 3''
• 10 Hip Airplane asistido: por lado
• 10 Glute Bridge: 
• 10 Band Face Pull: 
• 8 Reverse Lunge: por lado
• 8 Scapular Push-up: ', 'Fuerza · Bloque A
• Barbell Hip Thrust: 4 × 8-10
• DB Incline Bench Press: 4 × 8-10

Fuerza · Bloque B
• DB Step-up: 3 × 10 por lado
• Single Arm DB Row: 3 × 10-12 por lado

Accesorios · Bloque C
• Ring Push-up: 3 × 10-15
• DB Hammer Curl: 3 × 10-12
• Standing Calf Raise: 3 × 15-20

Core · Core · 3 rondas
Sin MetCon.
• 10-12 Hanging Knee Raise: por ronda
• 12 Pallof Press: por lado y ronda
• 30" Front Plank: por ronda', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-09-20","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

end $$;
