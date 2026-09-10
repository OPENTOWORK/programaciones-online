-- Programación anual de Calistenia generada por scripts/generate-calistenia-year.mjs
-- Parte 1 de 8 · 111 sesiones. Pega las partes en orden en el editor SQL de Supabase.
-- Solo borra y reescribe las sesiones de este script; el resto del programa queda intacto.
--
-- Si quieres retirar además los entrenos anuales que la importación de AimHarder dejó en Calistenia,
-- descomenta este bloque dentro del begin (no toca nada más del programa):
--   delete from public.entrenos_diarios
--   where program_id = target_program
--     and aimharder_rate_id between -501231 and -500101;
do $$
declare
  target_program uuid;
begin
  select id into target_program from public.programas where lower(trim(name)) = lower(trim('Calistenia')) limit 1;
  if target_program is null then
    raise exception 'No existe el programa %', 'Calistenia';
  end if;

  delete from public.entrenos_diarios
  where program_id = target_program
    and aimharder_rate_id between -7400000 and -7000000;

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-01-01', -7000101, 'Activación', 'Semana 1 · Mesociclo 1 · Básicos · Introducción',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Wall ankle mobility: 10 reps por lado
• Deep squat hold: 45 s
• Cossack squat: 8 reps por lado

Activación · Preparación específica · 8 min
• Band monster walk: 12 pasos por lado
• Glute bridge: 15 reps
• Single-leg calf raise: 15 reps por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-01-01","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-01-01', -7100101, 'Piernas, salto y core', 'Semana 1 · Mesociclo 1 · Básicos · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Control de sentadilla · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Deep squat hold: 3 × 15 s
• Single-leg box squat: 3 × 5

Fuerza · Piernas y core · 20 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Tempo 3-1-1 air squat: 3 × 8
• Reverse lunge: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 20 s
• Single-leg calf raise: 3 × 12', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-01-01","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-01-01', -7200101, 'Metcon', 'Semana 1 · Mesociclo 1 · Básicos · Introducción',
    '19 min', '', 'AMRAP · I go you go · 14 min
En solitario se hace con 40 s de trabajo y 20 s de pausa por movimiento.
• Australian pull up: 40 s
• Push up: 40 s
• Jump squat: 40 s
• Hollow hold: 40 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-01-01","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-01-02', -7000102, 'Activación', 'Semana 1 · Mesociclo 1 · Básicos · Introducción',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Wall chest opener: 30 s por lado
• Wrist mobility on floor: 45 s
• Quadruped thoracic rotation: 8 reps por lado

Activación · Preparación específica · 8 min
• Scapular push up: 12 reps
• Push up plus: 10 reps
• Hollow hold: 30 s', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-01-02","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-01-02', -7100102, 'Empuje horizontal y planche', 'Semana 1 · Mesociclo 1 · Básicos · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Base de planche · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Forward-leaning plank: 3 × 15 s
• Slow scapular push up: 3 × 5

Fuerza · Empuje horizontal · 20 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Strict push up: 3 × 8
• Bench dips: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Ring triceps extension: 3 × 12
• Hollow hold: 3 × 20 s', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-01-02","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-01-02', -7200102, 'Metcon', 'Semana 1 · Mesociclo 1 · Básicos · Introducción',
    '16 min', '', 'EMOM · Jump and bar · 11 min
Un movimiento por minuto: mantén la calidad del salto en las últimas rondas.
• Box jump: 10 reps
• Pull up: 5 reps
• Jump squat: 15 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-01-02","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-01-03', -7000103, 'Activación', 'Semana 1 · Mesociclo 1 · Básicos · Introducción',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Passive bar hang: 30 s
• Supine thoracic rotation: 8 reps por lado
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Scapular pull up: 10 reps
• Hollow hold: 30 s
• Arch hold: 20 s', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-01-03","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-01-03', -7100103, 'Tracción horizontal y front lever', 'Semana 1 · Mesociclo 1 · Básicos · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Base de front lever · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Bar tuck hang: 3 × 15 s
• Hollow hold: 3 × 15 s

Fuerza · Tracción horizontal · 20 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Australian pull up: 3 × 8
• One-arm band row: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Parallette L-sit: 3 × 20 s
• Ring biceps curl: 3 × 12', 'Passive bar hang 3 × 30 s, estiramiento de dorsal e isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-01-03","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-01-03', -7200103, 'Metcon', 'Semana 1 · Mesociclo 1 · Básicos · Introducción',
    '18 min', '', 'Ladder · Push ladder · 21-15-9 · Cap 13 min
Si las flexiones se rompen, sube las manos a un cajón.
• Push up: reps del esquema
• Air squat: reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-01-03","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-01-04', -7000104, 'Día de descanso', 'Semana 1 · Mesociclo 1 · Básicos · Introducción',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-01-04","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-01-05', -7000105, 'Activación', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Wall slides: 12 reps
• Wrist mobility on floor: 45 s
• Quadruped thoracic rotation: 8 reps por lado

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Band face pull: 15 reps
• Wall pike hold: 30 s', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-01-05","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-01-05', -7100105, 'Empuje vertical y handstand', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Handstand en pared · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Back-to-wall handstand: 3 × 20 s
• Hollow hold: 3 × 20 s

Fuerza · Empuje vertical · 20 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Feet-elevated push up: 4 × 8
• Band shoulder press: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Alternating hollow and arch: 3 × 15
• Feet-elevated bench dips: 3 × 15', 'Passive bar hang 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-01-05","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-01-05', -7200105, 'Metcon', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    '23 min', '', 'Rounds For Time · Grin and bear · 5 rondas · Cap 18 min
Fragmenta las dominadas antes de llegar al fallo. Usa banda si hace falta y cambia el toes to bar por elevación de rodillas.
• Pull up: 5 reps
• Toes to bar: 8 reps
• Reverse lunge: 10 reps por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-01-05","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-01-06', -7000106, 'Activación', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Band dislocates: 15 reps
• Supine thoracic rotation: 8 reps por lado
• Elbow and wrist mobility: 45 s

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Band row: 15 reps
• Active hang: 30 s', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-01-06","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-01-06', -7100106, 'Tracción vertical y muscle-up', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Dominada asistida · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Band-assisted pull up: 3 × 6
• Chin over bar hold: 3 × 20 s

Fuerza · Tracción vertical · 20 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Assisted chin up: 4 × 8
• Ring row: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Band face pull: 3 × 15
• Hanging knee raise: 3 × 15', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-01-06","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-01-06', -7200106, 'Metcon', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    '15 min', '', 'AMRAP · Burpee pull up · 10 min
Si no llegas a la barra, haz burpee y salto vertical con los brazos arriba.
• Burpee pull up: 5 reps
• Air squat: 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-01-06","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-01-07', -7000107, 'Día de descanso', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-01-07","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-01-08', -7000108, 'Activación', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Deep squat hold: 45 s
• Cossack squat: 8 reps por lado
• 90/90 hip mobility: 8 reps por lado

Activación · Preparación específica · 8 min
• Glute bridge: 15 reps
• Single-leg calf raise: 15 reps por lado
• Slow dead bug: 10 reps por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-01-08","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-01-08', -7100108, 'Piernas, salto y core', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Base de pistol · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Ring-assisted pistol squat: 3 × 6
• Bulgarian split squat: 3 × 6

Fuerza · Piernas y core · 20 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Box squat: 4 × 8
• Single-leg glute bridge: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 3 × 15
• Slow dead bug: 3 × 15', 'Deep squat hold 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-01-08","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-01-08', -7200108, 'Metcon', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    '20 min', '', 'Estaciones de tiempo · Leg engine · 15 min · 3 estaciones
Un minuto por estación y cinco vueltas, sin descanso entre estaciones.
• Air squat: 1 min
• Box step up: 1 min
• Single-leg glute bridge: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-01-08","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-01-09', -7000109, 'Activación', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Wrist mobility on floor: 45 s
• Quadruped thoracic rotation: 8 reps por lado
• Band dislocates: 15 reps

Activación · Preparación específica · 8 min
• Push up plus: 10 reps
• Hollow hold: 30 s
• Plank shoulder tap: 10 reps por lado', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-01-09","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-01-09', -7100109, 'Empuje horizontal y planche', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Tensión de línea · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Hollow hold: 3 × 20 s
• Forward-leaning plank: 3 × 20 s

Fuerza · Empuje horizontal · 20 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Tempo 3-1-1 knee push up: 4 × 8
• Incline push up: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Plank shoulder tap: 3 × 15
• Band face pull: 3 × 15', 'Apertura de pectoral en pared, passive bar hang 3 × 30 s y wrist mobility. 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-01-09","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-01-09', -7200109, 'Metcon', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    '13 min', '', 'Tabata · Leg tabata · 8 rondas
Alterna movimiento en cada ronda: 20 s de trabajo y 10 s de pausa.
• Jump squat: 20 s
• Jump lunge: 20 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-01-09","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-01-10', -7000110, 'Activación', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Supine thoracic rotation: 8 reps por lado
• Cat camel: 10 reps
• Band dislocates: 15 reps

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Arch hold: 20 s
• Band row: 15 reps', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-01-10","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-01-10', -7100110, 'Tracción horizontal y front lever', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Compresión y tensión · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Seated straight-leg compression: 3 × 20 s
• Bar tuck hang: 3 × 20 s

Fuerza · Tracción horizontal · 20 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Ring row: 4 × 8
• Supine-grip Australian pull up: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Hanging knee raise: 3 × 15
• Arch hold: 3 × 30 s', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-01-10","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-01-10', -7200110, 'Metcon', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    '13 min', '', 'Tabata · Core tabata · 8 rondas
Alterna ejercicio en cada ronda: 20 s de trabajo y 10 s de pausa, cambiando de lado en la plancha.
• Hollow hold: 20 s
• Side plank: 20 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-01-10","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-01-11', -7000111, 'Día de descanso', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-01-11","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-01-12', -7000112, 'Activación', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Wrist mobility on floor: 45 s
• Quadruped thoracic rotation: 8 reps por lado
• Doorway chest opener: 30 s por lado

Activación · Preparación específica · 8 min
• Band face pull: 15 reps
• Wall pike hold: 30 s
• Push up plus: 10 reps', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-01-12","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-01-12', -7100112, 'Empuje vertical y handstand', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Control de muñeca y línea · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Frogstand: 4 × 20 s
• Back-to-wall handstand: 4 × 20 s

Fuerza · Empuje vertical · 20 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Bent-knee pike push up: 4 × 10
• Band-assisted parallel bar dips: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 4 × 15
• Band face pull: 4 × 15', 'Estiramiento de tríceps sobre la cabeza, seated shoulder bridge y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-01-12","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-01-12', -7200112, 'Metcon', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    '20 min', '', 'Ladder · Push ladder · 21-15-9 · Cap 15 min
Si las flexiones se rompen, sube las manos a un cajón.
• Push up: reps del esquema
• Air squat: reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-01-12","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-01-13', -7000113, 'Activación', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Supine thoracic rotation: 8 reps por lado
• Elbow and wrist mobility: 45 s
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Band row: 15 reps
• Active hang: 30 s
• Hollow hold: 30 s', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-01-13","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-01-13', -7100113, 'Tracción vertical y muscle-up', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Negativas de dominada · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• 5 s pull up negative: 4 × 6
• Slow scapular pull up: 4 × 6

Fuerza · Tracción vertical · 20 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• 4 s pull up negative: 4 × 10
• Feet-elevated Australian pull up: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Band external rotation: 4 × 15
• Arch hold: 4 × 30 s', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-01-13","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-01-13', -7200113, 'Metcon', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    '22 min', '', 'AMRAP · Ring engine · 17 min
Las anillas mandan: mantén los codos pegados y el cuerpo en tensión.
• Ring row: 10 reps
• Assisted ring dips: 8 reps
• Ring support hold: 20 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-01-13","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-01-14', -7000114, 'Día de descanso', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-01-14","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-01-15', -7000115, 'Activación', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Cossack squat: 8 reps por lado
• 90/90 hip mobility: 8 reps por lado
• Quadruped hip circles: 8 reps por lado

Activación · Preparación específica · 8 min
• Single-leg calf raise: 15 reps por lado
• Slow dead bug: 10 reps por lado
• Hollow hold: 30 s', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-01-15","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-01-15', -7100115, 'Piernas, salto y core', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Tobillo y rodilla · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Heels-elevated squat: 4 × 6
• Single-leg calf raise: 4 × 6

Fuerza · Piernas y core · 20 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Box step up: 4 × 10
• Bulgarian split squat: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Hanging knee raise: 4 × 15
• Copenhagen plank: 4 × 30 s', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-01-15","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-01-15', -7200115, 'Metcon', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    '25 min', '', 'AMRAP · Park sunrise · 20 min
Ritmo conversacional: el objetivo es acabar mejor de lo que empiezas. Vale carrera o comba.
• Run: 200 m
• Australian pull up: 10 reps
• Push up: 15 reps
• Air squat: 20 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-01-15","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-01-16', -7000116, 'Activación', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Quadruped thoracic rotation: 8 reps por lado
• Band dislocates: 15 reps
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Plank shoulder tap: 10 reps por lado
• Band pull apart: 15 reps', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-01-16","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-01-16', -7100116, 'Empuje horizontal y planche', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Muñeca y protracción · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Paused push up plus: 4 × 6
• Frogstand: 4 × 20 s

Fuerza · Empuje horizontal · 20 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Close-grip push up: 4 × 10
• Band-assisted parallel bar dips: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Ab wheel rollout: 4 × 15
• Band Y raise: 4 × 15', 'Rodillo en pectoral y dorsal, seated shoulder bridge y 2 min de respiración diafragmática.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-01-16","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-01-16', -7200116, 'Metcon', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    '20 min', '', 'AMRAP · Park engine · 15 min
Ritmo constante: elige la progresión que te deje seguir sin parar.
• Australian pull up: 8 reps
• Push up: 10 reps
• Air squat: 15 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-01-16","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-01-17', -7000117, 'Activación', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Cat camel: 10 reps
• Band dislocates: 15 reps
• 90/90 hip mobility: 8 reps por lado

Activación · Preparación específica · 8 min
• Arch hold: 20 s
• Band row: 15 reps
• Hanging knee raise: 10 reps', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-01-17","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-01-17', -7100117, 'Tracción horizontal y front lever', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Control escapular colgado · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Slow scapular pull up: 4 × 6
• Arch hold: 4 × 20 s

Fuerza · Tracción horizontal · 20 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Feet-elevated Australian pull up: 4 × 10
• Bent-knee inverted row: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Strict toes to bar: 4 × 15
• Band face pull: 4 × 15', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-01-17","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-01-17', -7200117, 'Metcon', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    '23 min', '', 'Estaciones de tiempo · Park stations · 18 min · 4 estaciones
Un minuto por estación y cuatro vueltas, sin descanso entre estaciones.
• Australian pull up: 1 min
• Push up: 1 min
• Air squat: 1 min
• Front plank: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-01-17","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-01-18', -7000118, 'Día de descanso', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-01-18","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-01-19', -7000119, 'Activación', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    '10 min', '', 'Movilidad · Empuje vertical · 10 min
• Quadruped thoracic rotation: 8 reps por lado
• Doorway chest opener: 30 s por lado
• Cat camel: 10 reps
• Plank shoulder circles: 8 reps por lado', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-01-19","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-01-19', -7100119, 'Empuje vertical y handstand', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Base de handstand · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Feet-elevated pike hold: 2 × 15 s
• Active shoulder plank: 2 × 15 s

Fuerza · Empuje vertical · 20 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Pike push up: 2 × 8
• Bench dips: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Slow dead bug: 2 × 12
• Band Y raise: 2 × 12', 'Estira dorsales y pectoral 45 s por lado, más wrist mobility en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-01-19","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-01-19', -7200119, 'Metcon', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    '17 min', '', 'For Time · Park chipper · Cap 12 min
Trabajo continuo de arriba abajo, sin repetir estación.
• Australian pull up: 40 reps
• Push up: 60 reps
• Air squat: 80 reps
• Hollow rock: 40 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-01-19","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-01-20', -7000120, 'Activación', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    '10 min', '', 'Movilidad · Tracción vertical · 10 min
• Elbow and wrist mobility: 45 s
• Cat camel: 10 reps
• Scapular slides on bar: 10 reps
• Wall chest opener: 30 s por lado', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-01-20","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-01-20', -7100120, 'Tracción vertical y muscle-up', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Control escapular en barra · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Slow scapular pull up: 2 × 5
• Active hang: 2 × 15 s

Fuerza · Tracción vertical · 20 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Band-assisted pull up: 2 × 8
• Australian pull up: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• One-arm band row: 2 × 12
• Plank shoulder tap: 2 × 12', 'Passive bar hang 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-01-20","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-01-20', -7200120, 'Metcon', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    '15 min', '', 'AMRAP · I go you go · 10 min
En solitario se hace con 40 s de trabajo y 20 s de pausa por movimiento.
• Australian pull up: 40 s
• Push up: 40 s
• Jump squat: 40 s
• Hollow hold: 40 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-01-20","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-01-21', -7000121, 'Día de descanso', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-01-21","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-01-22', -7000122, 'Activación', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    '10 min', '', 'Movilidad · Piernas y core · 10 min
• 90/90 hip mobility: 8 reps por lado
• Quadruped hip circles: 8 reps por lado
• Active hamstring stretch: 10 reps por lado
• Cat camel: 10 reps', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-01-22","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-01-22', -7100122, 'Piernas, salto y core', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Control de sentadilla · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Deep squat hold: 2 × 15 s
• Single-leg box squat: 2 × 5

Fuerza · Piernas y core · 20 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Tempo 3-1-1 air squat: 2 × 8
• Reverse lunge: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• V-up: 2 × 12
• Single-leg glute bridge: 2 × 12', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-01-22","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-01-22', -7200122, 'Metcon', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    '14 min', '', 'Rounds For Time · Rings and floor · 3 rondas · Cap 9 min
Alterna anillas y suelo para repartir la fatiga del hombro.
• Ring row: 12 reps
• Push up: 15 reps
• Ring support hold: 30 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-01-22","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-01-23', -7000123, 'Activación', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    '10 min', '', 'Movilidad · Empuje horizontal · 10 min
• Band dislocates: 15 reps
• Cat camel: 10 reps
• Plank scapular slide: 10 reps
• Seated shoulder bridge: 10 reps', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-01-23","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-01-23', -7100123, 'Empuje horizontal y planche', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Base de planche · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Forward-leaning plank: 2 × 15 s
• Slow scapular push up: 2 × 5

Fuerza · Empuje horizontal · 20 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Strict push up: 2 × 8
• Bench dips: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 2 × 12
• Paused push up plus: 2 × 12', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-01-23","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-01-23', -7200123, 'Metcon', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    '16 min', '', 'Rounds For Time · Grin and bear · 3 rondas · Cap 11 min
Fragmenta las dominadas antes de llegar al fallo. Usa banda si hace falta y cambia el toes to bar por elevación de rodillas.
• Pull up: 5 reps
• Toes to bar: 8 reps
• Reverse lunge: 10 reps por lado', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-01-23","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-01-24', -7000124, 'Activación', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    '10 min', '', 'Movilidad · Tracción horizontal · 10 min
• Band dislocates: 15 reps
• 90/90 hip mobility: 8 reps por lado
• Scapular slides on bar: 10 reps
• Wall chest opener: 30 s por lado', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-01-24","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-01-24', -7100124, 'Tracción horizontal y front lever', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Base de front lever · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Bar tuck hang: 2 × 15 s
• Hollow hold: 2 × 15 s

Fuerza · Tracción horizontal · 20 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Australian pull up: 2 × 8
• One-arm band row: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Ab wheel rollout: 2 × 12
• Band external rotation: 2 × 12', 'Passive bar hang 3 × 30 s, estiramiento de dorsal e isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-01-24","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-01-24', -7200124, 'Metcon', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    '15 min', '', 'EMOM · Push EMOM · 10 min
Un movimiento por minuto, rotando siempre en el mismo orden.
• Pike push up: 6 reps
• Push up: 12 reps
• Bench dips: 10 reps
• Hollow hold: 30 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-01-24","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-01-25', -7000125, 'Día de descanso', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-01-25","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-01-26', -7000126, 'Activación', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Doorway chest opener: 30 s por lado
• Cat camel: 10 reps
• Plank shoulder circles: 8 reps por lado

Activación · Preparación específica · 8 min
• Push up plus: 10 reps
• Band Y raise: 12 reps
• Hollow hold: 30 s', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-01-26","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-01-26', -7100126, 'Empuje vertical y handstand', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Handstand en pared · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Back-to-wall handstand: 3 × 15 s
• Hollow hold: 3 × 15 s

Fuerza · Empuje vertical · 20 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Feet-elevated push up: 3 × 8
• Band shoulder press: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 20 s
• Ring triceps extension: 3 × 12', 'Passive bar hang 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-01-26","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-01-26', -7200126, 'Metcon', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    '19 min', '', 'EMOM · Pull EMOM · 14 min
Un movimiento por minuto, rotando siempre en el mismo orden. Usa banda en las dominadas si hace falta.
• Pull up: 4 reps
• Australian pull up: 8 reps
• Hanging knee raise: 10 reps
• Active hang: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-01-26","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-01-27', -7000127, 'Activación', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Cat camel: 10 reps
• Scapular slides on bar: 10 reps
• Wall chest opener: 30 s por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Band face pull: 15 reps
• Band external rotation: 12 reps por lado', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-01-27","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-01-27', -7100127, 'Tracción vertical y muscle-up', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Dominada asistida · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Band-assisted pull up: 3 × 5
• Chin over bar hold: 3 × 15 s

Fuerza · Tracción vertical · 20 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Assisted chin up: 3 × 8
• Ring row: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Ring biceps curl: 3 × 12
• Hollow hold: 3 × 20 s', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-01-27","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-01-27', -7200127, 'Metcon', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    '19 min', '', 'Estaciones de tiempo · Leg engine · 14 min · 3 estaciones
Un minuto por estación y cinco vueltas, sin descanso entre estaciones.
• Air squat: 1 min
• Box step up: 1 min
• Single-leg glute bridge: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-01-27","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-01-28', -7000128, 'Día de descanso', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-01-28","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-01-29', -7000129, 'Activación', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Quadruped hip circles: 8 reps por lado
• Active hamstring stretch: 10 reps por lado
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Wall sit: 30 s
• Light jump lunge: 8 reps por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-01-29","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-01-29', -7100129, 'Piernas, salto y core', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Base de pistol · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Ring-assisted pistol squat: 3 × 5
• Bulgarian split squat: 3 × 5

Fuerza · Piernas y core · 20 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Box squat: 3 × 8
• Single-leg glute bridge: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 20 s
• Single-leg calf raise: 3 × 12', 'Deep squat hold 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-01-29","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-01-29', -7200129, 'Metcon', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    '14 min', '', 'AMRAP · Active recovery · 9 min
Ritmo suave, respirando por la nariz de principio a fin.
• Active hang: 30 s
• Push up: 8 reps
• Air squat: 12 reps
• Slow dead bug: 10 reps por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-01-29","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-01-30', -7000130, 'Activación', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Cat camel: 10 reps
• Plank scapular slide: 10 reps
• Seated shoulder bridge: 10 reps

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Planche lean: 20 s
• Band face pull: 15 reps', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-01-30","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-01-30', -7100130, 'Empuje horizontal y planche', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Tensión de línea · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Hollow hold: 3 × 15 s
• Forward-leaning plank: 3 × 15 s

Fuerza · Empuje horizontal · 20 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Tempo 3-1-1 knee push up: 3 × 8
• Incline push up: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Ring triceps extension: 3 × 12
• Hollow hold: 3 × 20 s', 'Apertura de pectoral en pared, passive bar hang 3 × 30 s y wrist mobility. 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-01-30","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-01-30', -7200130, 'Metcon', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    '18 min', '', 'Ladder · Push ladder · 21-15-9 · Cap 13 min
Si las flexiones se rompen, sube las manos a un cajón.
• Push up: reps del esquema
• Air squat: reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-01-30","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-01-31', -7000131, 'Activación', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• 90/90 hip mobility: 8 reps por lado
• Scapular slides on bar: 10 reps
• Wall chest opener: 30 s por lado

Activación · Preparación específica · 8 min
• Hanging knee raise: 10 reps
• Band face pull: 15 reps
• Slow dead bug: 10 reps por lado', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-01-31","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-01-31', -7100131, 'Tracción horizontal y front lever', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Compresión y tensión · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Seated straight-leg compression: 3 × 15 s
• Bar tuck hang: 3 × 15 s

Fuerza · Tracción horizontal · 20 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Ring row: 3 × 8
• Supine-grip Australian pull up: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Parallette L-sit: 3 × 20 s
• Ring biceps curl: 3 × 12', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-01-31","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-01-31', -7200131, 'Metcon', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    '16 min', '', 'AMRAP · Bodyweight legs · 11 min
Aterriza suave en los saltos y mantén el pecho alto en las zancadas.
• Air squat: 20 reps
• Jump lunge: 10 reps por lado
• Box jump: 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-01-31","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-02-01', -7000201, 'Día de descanso', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-02-01","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-02-02', -7000202, 'Activación', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Cat camel: 10 reps
• Plank shoulder circles: 8 reps por lado
• Seated shoulder bridge: 10 reps

Activación · Preparación específica · 8 min
• Band Y raise: 12 reps
• Hollow hold: 30 s
• Slow wall walk: 3 reps', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-02-02","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-02-02', -7100202, 'Empuje vertical y handstand', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Control de muñeca y línea · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Frogstand: 3 × 20 s
• Back-to-wall handstand: 3 × 20 s

Fuerza · Empuje vertical · 20 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Bent-knee pike push up: 4 × 8
• Band-assisted parallel bar dips: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Alternating hollow and arch: 3 × 15
• Feet-elevated bench dips: 3 × 15', 'Estiramiento de tríceps sobre la cabeza, seated shoulder bridge y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-02-02","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-02-02', -7200202, 'Metcon', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    '21 min', '', 'Rounds For Time · Pistol partner · 4 rondas · Cap 16 min
Alterna piernas en cada repetición y usa anillas si necesitas asistencia.
• Assisted pistol squat: 6 reps por lado
• Hollow rock: 20 reps
• Jump squat: 15 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-02-02","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-02-03', -7000203, 'Activación', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Scapular slides on bar: 10 reps
• Wall chest opener: 30 s por lado
• Seated shoulder bridge: 10 reps

Activación · Preparación específica · 8 min
• Band face pull: 15 reps
• Band external rotation: 12 reps por lado
• Arch hold: 20 s', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-02-03","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-02-03', -7100203, 'Tracción vertical y muscle-up', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Negativas de dominada · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• 5 s pull up negative: 3 × 6
• Slow scapular pull up: 3 × 6

Fuerza · Tracción vertical · 20 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• 4 s pull up negative: 4 × 8
• Feet-elevated Australian pull up: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Band face pull: 3 × 15
• Hanging knee raise: 3 × 15', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-02-03","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-02-03', -7200203, 'Metcon', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    '23 min', '', 'AMRAP · Park sunrise · 18 min
Ritmo conversacional: el objetivo es acabar mejor de lo que empiezas. Vale carrera o comba.
• Run: 200 m
• Australian pull up: 10 reps
• Push up: 15 reps
• Air squat: 20 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-02-03","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-02-04', -7000204, 'Día de descanso', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-02-04","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-02-05', -7000205, 'Activación', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Active hamstring stretch: 10 reps por lado
• Cat camel: 10 reps
• Single-leg glute bridge: 10 reps por lado

Activación · Preparación específica · 8 min
• Wall sit: 30 s
• Light jump lunge: 8 reps por lado
• Side plank: 30 s por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-02-05","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-02-05', -7100205, 'Piernas, salto y core', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Tobillo y rodilla · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Heels-elevated squat: 3 × 6
• Single-leg calf raise: 3 × 6

Fuerza · Piernas y core · 20 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Box step up: 4 × 8
• Bulgarian split squat: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 3 × 15
• Slow dead bug: 3 × 15', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-02-05","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-02-05', -7200205, 'Metcon', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    '19 min', '', 'For Time · Mesocycle finisher · Cap 14 min
Última sesión del bloque: registra el tiempo para comparar con el siguiente mesociclo.
• Australian pull up: 30 reps
• Push up: 45 reps
• Reverse lunge: 30 reps por lado
• Hollow rock: 60 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-02-05","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-02-06', -7000206, 'Activación', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Plank scapular slide: 10 reps
• Seated shoulder bridge: 10 reps
• Band elbow mobility: 12 reps

Activación · Preparación específica · 8 min
• Planche lean: 20 s
• Band face pull: 15 reps
• Slow dead bug: 10 reps por lado', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-02-06","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-02-06', -7100206, 'Empuje horizontal y planche', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Muñeca y protracción · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Paused push up plus: 3 × 6
• Frogstand: 3 × 20 s

Fuerza · Empuje horizontal · 20 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Close-grip push up: 4 × 8
• Band-assisted parallel bar dips: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Plank shoulder tap: 3 × 15
• Band face pull: 3 × 15', 'Rodillo en pectoral y dorsal, seated shoulder bridge y 2 min de respiración diafragmática.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-02-06","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-02-06', -7200206, 'Metcon', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    '13 min', '', 'Tabata · Core tabata · 8 rondas
Alterna ejercicio en cada ronda: 20 s de trabajo y 10 s de pausa, cambiando de lado en la plancha.
• Hollow hold: 20 s
• Side plank: 20 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-02-06","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-02-07', -7000207, 'Activación', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Scapular slides on bar: 10 reps
• Wall chest opener: 30 s por lado
• Active hamstring stretch: 10 reps por lado

Activación · Preparación específica · 8 min
• Band face pull: 15 reps
• Slow dead bug: 10 reps por lado
• Active hang: 30 s', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-02-07","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-02-07', -7100207, 'Tracción horizontal y front lever', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Control escapular colgado · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Slow scapular pull up: 3 × 6
• Arch hold: 3 × 20 s

Fuerza · Tracción horizontal · 20 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Feet-elevated Australian pull up: 4 × 8
• Bent-knee inverted row: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Hanging knee raise: 3 × 15
• Arch hold: 3 × 30 s', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-02-07","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-02-07', -7200207, 'Metcon', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    '15 min', '', 'AMRAP · Burpee pull up · 10 min
Si no llegas a la barra, haz burpee y salto vertical con los brazos arriba.
• Burpee pull up: 5 reps
• Air squat: 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-02-07","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-02-08', -7000208, 'Día de descanso', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-02-08","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-02-09', -7000209, 'Activación', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Plank shoulder circles: 8 reps por lado
• Seated shoulder bridge: 10 reps
• Band dislocates: 15 reps

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Slow wall walk: 3 reps
• Scapular push up: 12 reps', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-02-09","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-02-09', -7100209, 'Empuje vertical y handstand', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Base de handstand · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Feet-elevated pike hold: 4 × 20 s
• Active shoulder plank: 4 × 20 s

Fuerza · Empuje vertical · 20 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Pike push up: 4 × 10
• Bench dips: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 4 × 15
• Band face pull: 4 × 15', 'Estira dorsales y pectoral 45 s por lado, más wrist mobility en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-02-09","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-02-09', -7200209, 'Metcon', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    '16 min', '', 'AMRAP · Burpee pull up · 11 min
Si no llegas a la barra, haz burpee y salto vertical con los brazos arriba.
• Burpee pull up: 5 reps
• Air squat: 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-02-09","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-02-10', -7000210, 'Activación', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Wall chest opener: 30 s por lado
• Seated shoulder bridge: 10 reps
• Passive bar hang: 30 s

Activación · Preparación específica · 8 min
• Band external rotation: 12 reps por lado
• Arch hold: 20 s
• Scapular pull up: 10 reps', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-02-10","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-02-10', -7100210, 'Tracción vertical y muscle-up', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Control escapular en barra · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Slow scapular pull up: 4 × 6
• Active hang: 4 × 20 s

Fuerza · Tracción vertical · 20 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Band-assisted pull up: 4 × 10
• Australian pull up: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Band external rotation: 4 × 15
• Arch hold: 4 × 30 s', 'Passive bar hang 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-02-10","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-02-10', -7200210, 'Metcon', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    '22 min', '', 'Rounds For Time · Rings and floor · 4 rondas · Cap 17 min
Alterna anillas y suelo para repartir la fatiga del hombro.
• Ring row: 12 reps
• Push up: 15 reps
• Ring support hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-02-10","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-02-11', -7000211, 'Día de descanso', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-02-11","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-02-12', -7000212, 'Activación', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Cat camel: 10 reps
• Single-leg glute bridge: 10 reps por lado
• Wall ankle mobility: 10 reps por lado

Activación · Preparación específica · 8 min
• Light jump lunge: 8 reps por lado
• Side plank: 30 s por lado
• Band monster walk: 12 pasos por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-02-12","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-02-12', -7100212, 'Piernas, salto y core', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Control de sentadilla · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Deep squat hold: 4 × 20 s
• Single-leg box squat: 4 × 6

Fuerza · Piernas y core · 20 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Tempo 3-1-1 air squat: 4 × 10
• Reverse lunge: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Hanging knee raise: 4 × 15
• Copenhagen plank: 4 × 30 s', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-02-12","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-02-12', -7200212, 'Metcon', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    '18 min', '', 'EMOM · Death by burpee · 13 min
Minuto 1 una repetición, minuto 2 dos, y así hasta que no llegues a tiempo.
• Burpee: 1 rep acumulativa por minuto', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-02-12","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-02-13', -7000213, 'Activación', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Seated shoulder bridge: 10 reps
• Band elbow mobility: 12 reps
• Wall chest opener: 30 s por lado

Activación · Preparación específica · 8 min
• Band face pull: 15 reps
• Slow dead bug: 10 reps por lado
• Scapular push up: 12 reps', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-02-13","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-02-13', -7100213, 'Empuje horizontal y planche', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Base de planche · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Forward-leaning plank: 4 × 20 s
• Slow scapular push up: 4 × 6

Fuerza · Empuje horizontal · 20 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Strict push up: 4 × 10
• Bench dips: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Ab wheel rollout: 4 × 15
• Band Y raise: 4 × 15', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-02-13","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-02-13', -7200213, 'Metcon', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    '23 min', '', 'EMOM · Pull EMOM · 18 min
Un movimiento por minuto, rotando siempre en el mismo orden. Usa banda en las dominadas si hace falta.
• Pull up: 4 reps
• Australian pull up: 8 reps
• Hanging knee raise: 10 reps
• Active hang: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-02-13","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-02-14', -7000214, 'Activación', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Wall chest opener: 30 s por lado
• Active hamstring stretch: 10 reps por lado
• Passive bar hang: 30 s

Activación · Preparación específica · 8 min
• Slow dead bug: 10 reps por lado
• Active hang: 30 s
• Scapular pull up: 10 reps', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-02-14","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-02-14', -7100214, 'Tracción horizontal y front lever', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Base de front lever · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Bar tuck hang: 4 × 20 s
• Hollow hold: 4 × 20 s

Fuerza · Tracción horizontal · 20 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Australian pull up: 4 × 10
• One-arm band row: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Strict toes to bar: 4 × 15
• Band face pull: 4 × 15', 'Passive bar hang 3 × 30 s, estiramiento de dorsal e isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-02-14","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-02-14', -7200214, 'Metcon', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    '20 min', '', 'Rounds For Time · Core cluster · 5 rondas · Cap 15 min
Sin balanceos: si no controlas el movimiento, reduce el rango o pasa a elevación de rodillas.
• Toes to bar: 8 reps
• Hollow rock: 15 reps
• Side plank: 30 s por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-02-14","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
