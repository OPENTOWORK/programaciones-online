-- Semana de Hype generada por scripts/generate-hype-week.mjs
-- Cubre del 2026-09-07 al 2026-09-13 (7 sesiones).
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
    and coalesce(schedule_config->>'startDate', workout_date::text) between '2026-09-07' and '2026-09-13';

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
• 8 Tempo Push-up: 3-1-1', 'Fuerza · Barbell Floor Press · Descanso: 2''
RPE 7-8.
• Barbell Floor Press: 5 × 6 · RPE 7-8

EMOM · Metabólico · 20'' · ×4
Objetivo: mantener rendimiento estable durante las 4 vueltas.
• Min 1: 12/10 cal Row / Ski / Bike
• Min 2: 12 DB Front Rack Reverse Lunge
• Min 3: 10-12 Hand Release Push-up
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
    '70 min', 'Activación · Locomoción + escápula · 8'' · 2 rondas
Después: 1-2 aproximaciones fáciles de dominada.
• 200 m Run: por ronda
• 8 Scapular Pull-up: por ronda
• 10 Band Straight Arm Pulldown: por ronda
• 12 Band Face Pull: por ronda
• 20" Hollow Hold: por ronda', 'Fuerza · Strict Pull-up
RPE 7-8.
• Strict Pull-up: 5 × 5-8 · RPE 7-8

Técnica/skills · Progresiones
• Weighted Pull-up: 
• Strict Pull-up: 
• Band Assisted Pull-up: 
• Jumping Pull-up: 

For Time · Metabólico · 20'' · 4 rondas - 4'' WORK / 1'' REST
Registrar repeticiones de Chest-to-Bar en cada ronda e intentar minimizar la caída de rendimiento.
• 300 m Run: por ronda
• 10 DB Hang Power Snatch: por ronda
• 12 Box Jump Over: por ronda
• Max Chest-to-Bar / Pull-up: tiempo restante', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-09-08","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    '55 min', 'Activación · Partner flow · 8'' · 2 rondas
• 200 m Run: juntos · por ronda
• 8 Squat-to-Stand: por ronda
• 10 KB Romanian Deadlift: ligero · por ronda
• 8 Inchworm: por ronda
• 10 Med Ball Pass: por ronda', 'Partner · AMRAP en pareja · 36''
I GO / YOU GO excepto carrera Synchro. Si completan todo, volver a empezar.
• 800 m Run: Synchro
• 40 DB Thruster: reparto libre
• 40 Barbell Bent Over Row: reparto libre
• 60 Sandbag Walking Lunge: reparto libre
• 40 Burpee Box Jump Over: reparto libre
• 1000 m Row / Ski / Bike: reparto libre
• 40 KB American Swing: reparto libre
• 40 Pike Push-up / HSPU: reparto libre
• 40 Front Rack Walking Lunge: reparto libre
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
Ritmo sostenible durante 20''. Wall Ball solo en esta sesión de la semana.
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
    '80 min', 'Activación · Bisagra + core · 8''
Después: 2-3 aproximaciones de Deadlift. Menos volumen de rodilla que el jueves.
• Ski / Bike: 3'' progresivo
• 10 Glute Bridge: 
• 8 Single Leg RDL: sin carga · por lado
• 10 Good Morning: barra vacía
• 8 Bird Dog: por lado', 'Fuerza · Bloque 1 — Strength · Descanso: 2''-2''30"
RPE 7-8.
• Deadlift: 5 × 5 · RPE 7-8

For Time · Bloque 2 — Endurance · 10'' continuous
Alternar 250 m Row / Ski y 200 m Run durante 10 min. Ritmo cardiovascular alto pero sostenible; no interpretarlo como sprint. Con 20 atletas y 10 ergómetros: 10 pueden comenzar en el ergómetro y 10 en carrera.
• 250 m Row / Ski: alternar con
• 200 m Run: durante 10 min continuos

AMRAP · Bloque 3 — MetCon · 10''
Empuje + bisagra ligera. Sin goblet squat ni burpee estándar (ya en miércoles).
• 10 DB Push Press: por ronda
• 12 Box Step Over: por ronda
• 8 Burpee Over DB: por ronda
• 12 Sandbag Ground-to-Shoulder: por ronda', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-09-11","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    '55 min', 'Activación · Estaciones preview · 8''
Después: 2'' para probar cargas de sled y sandbag.
• Row / Ski: 2'' suave
• 8 World''s Greatest Stretch: por lado
• 8 Cossack Squat: por lado
• 10 Scapular Push-up: 
• 8 KB Romanian Deadlift: ligero', 'Estaciones · 5 estaciones en parejas · 30'' trabajo + transiciones · 6'' WORK - 1'' CHANGE
20 atletas - 10 parejas - 2 parejas por estación. Existen 2 carriles de sled; la distribución debe permitir exactamente 2 parejas en esa estación.
• Estación 1 — Sled: 12,5 m Sled Push atleta A + 12,5 m atleta B · relay continuo
• Estación 2 — Engine: 250 m Row + 250 m Ski · I GO / YOU GO
• Estación 3 — Sandbag: 20 m Sandbag Carry + 10 Reverse Lunge · alternando
• Estación 4 — Upper Body: 8 Ring Dip + 8 DB Devil Press + 8 DB Renegade Row · I GO / YOU GO
• Estación 5 — Power: 200 m Run + 12 Med Ball Slam · relay', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-09-12","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    '85 min', 'Activación · Recuperación activa · 8''
• 500 m Row: suave
• 10 Cat-Cow: 
• 10 Hip Airplane asistido: por lado
• 10 Glute Bridge: 
• 10 Band Face Pull: 
• 8 Reverse Lunge: por lado', 'Fuerza · Bloque A · Descanso: 90-120"
• Romanian Deadlift: 4 × 8 · RPE aprox. 7
• DB Incline Bench Press: 4 × 10 · RPE 7-8

Fuerza · Bloque B · Descanso: 90"
• DB Step-up: 3 × 10 por lado
• Single Arm DB Row: 3 × 10-12 por lado

Accesorios · Bloque C
• KB Sumo Deadlift: 3 × 12
• DB Lateral Raise: 3 × 12-15
• DB Hammer Curl: 3 × 10-12

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

end $$;
