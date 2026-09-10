-- Programación anual de Calistenia generada por scripts/generate-calistenia-year.mjs
-- Parte 7 de 8 · 111 sesiones. Pega las partes en orden en el editor SQL de Supabase.
-- Esta parte solo inserta: la limpieza previa va en la parte 1.
do $$
declare
  target_program uuid;
begin
  select id into target_program from public.programas where lower(trim(name)) = lower(trim('Calistenia')) limit 1;
  if target_program is null then
    raise exception 'No existe el programa %', 'Calistenia';
  end if;

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-10-02', -7001002, 'Activación', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    '10 min', '', 'Movilidad · Empuje horizontal · 10 min
• Band elbow mobility: 12 reps
• Wall chest opener: 30 s por lado
• Wrist mobility on floor: 45 s
• Quadruped thoracic rotation: 8 reps por lado', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-10-02","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-10-02', -7101002, 'Empuje horizontal y planche', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Advanced tuck planche · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Advanced tuck planche: 3 × 20 s
• Pseudo planche push up: 3 × 3

Fuerza · Empuje horizontal · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Pseudo planche push up: 3 × 4
• Weighted ring dips: 2 × 8', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 2 × 10
• Paused push up plus: 2 × 10', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-10-02","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-10-02', -7201002, 'Metcon', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    '16 min', '', 'AMRAP · Park sunrise · 11 min
Ritmo conversacional: el objetivo es acabar mejor de lo que empiezas. Vale carrera o comba.
• Run: 200 m
• Australian pull up: 10 reps
• Push up: 15 reps
• Air squat: 20 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-10-02","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-10-03', -7001003, 'Activación', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    '10 min', '', 'Movilidad · Tracción horizontal · 10 min
• Active hamstring stretch: 10 reps por lado
• Passive bar hang: 30 s
• Supine thoracic rotation: 8 reps por lado
• Cat camel: 10 reps', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-10-03","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-10-03', -7101003, 'Tracción horizontal y front lever', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Straddle front lever · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Straddle front lever: 3 × 20 s
• 5 s front lever negative: 3 × 3

Fuerza · Tracción horizontal · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Tuck front lever row: 3 × 4
• Weighted ring row: 2 × 8', 'Fuerza · Accesorio y core · 10 min
• Ab wheel rollout: 2 × 10
• Band external rotation: 2 × 10', 'Passive bar hang 3 × 30 s, estiramiento de dorsal e isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-10-03","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-10-03', -7201003, 'Metcon', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    '13 min', '', 'AMRAP · Park engine · 8 min
Ritmo constante: elige la progresión que te deje seguir sin parar.
• Australian pull up: 8 reps
• Push up: 10 reps
• Air squat: 15 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-10-03","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-10-04', -7001004, 'Día de descanso', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-10-04","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-10-05', -7001005, 'Activación', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Band dislocates: 15 reps
• Quadruped thoracic rotation: 8 reps por lado
• Plank shoulder circles: 8 reps por lado

Activación · Preparación específica · 8 min
• Scapular push up: 12 reps
• Wall pike hold: 30 s
• Hollow hold: 30 s', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-10-05","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-10-05', -7101005, 'Empuje vertical y handstand', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Handstand push up · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall HSPU: 5 × 3
• Freestanding handstand hold: 5 × 20 s

Fuerza · Empuje vertical · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Wall deficit HSPU: 4 × 5
• Weighted parallel bar dips: 3 × 8', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 4 × 30 s
• Ring triceps extension: 3 × 10', 'Passive bar hang 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-10-05","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-10-05', -7201005, 'Metcon', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    '19 min', '', 'Rounds For Time · Bodyweight complex · 6 rondas · Cap 14 min
La ronda es un complex seguido: una dominada, dos flexiones y tres sentadillas sin parar.
• Pull up: 1 rep
• Push up: 2 reps
• Air squat: 3 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-10-05","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-10-06', -7001006, 'Activación', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Passive bar hang: 30 s
• Elbow and wrist mobility: 45 s
• Wall chest opener: 30 s por lado

Activación · Preparación específica · 8 min
• Scapular pull up: 10 reps
• Active hang: 30 s
• Band external rotation: 12 reps por lado', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-10-06","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-10-06', -7101006, 'Tracción vertical y muscle-up', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Muscle-up en anillas · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Band-assisted ring muscle-up: 5 × 3
• Low ring muscle-up transition: 5 × 3

Fuerza · Tracción vertical · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Sternum pull up: 4 × 5
• Weighted ring row: 3 × 8', 'Fuerza · Accesorio y core · 10 min
• Ring biceps curl: 3 × 10
• Hollow hold: 4 × 30 s', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-10-06","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-10-06', -7201006, 'Metcon', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    '14 min', '', 'AMRAP · Active recovery · 9 min
Ritmo suave, respirando por la nariz de principio a fin.
• Active hang: 30 s
• Push up: 8 reps
• Air squat: 12 reps
• Slow dead bug: 10 reps por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-10-06","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-10-07', -7001007, 'Día de descanso', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-10-07","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-10-08', -7001008, 'Activación', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Wall ankle mobility: 10 reps por lado
• 90/90 hip mobility: 8 reps por lado
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Band monster walk: 12 pasos por lado
• Slow dead bug: 10 reps por lado
• Light jump lunge: 8 reps por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-10-08","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-10-08', -7101008, 'Piernas, salto y core', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Nordic curl completo · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Nordic curl: 5 × 3
• Pistol squat: 5 × 3

Fuerza · Piernas y core · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Shrimp squat: 4 × 5
• Nordic hamstring curl: 3 × 8', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 4 × 30 s
• Single-leg calf raise: 3 × 10', 'Deep squat hold 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-10-08","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-10-08', -7201008, 'Metcon', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    '19 min', '', 'AMRAP · I go you go · 14 min
En solitario se hace con 40 s de trabajo y 20 s de pausa por movimiento.
• Australian pull up: 40 s
• Push up: 40 s
• Jump squat: 40 s
• Hollow hold: 40 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-10-08","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-10-09', -7001009, 'Activación', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Wall chest opener: 30 s por lado
• Band dislocates: 15 reps
• Seated shoulder bridge: 10 reps

Activación · Preparación específica · 8 min
• Scapular push up: 12 reps
• Plank shoulder tap: 10 reps por lado
• Band face pull: 15 reps', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-10-09","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-10-09', -7101009, 'Empuje horizontal y planche', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Straddle planche asistido · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Band-assisted straddle planche: 5 × 20 s
• Tuck planche: 5 × 20 s

Fuerza · Empuje horizontal · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Weighted push up: 4 × 5
• Ring push up with turnout: 3 × 8', 'Fuerza · Accesorio y core · 10 min
• Ring triceps extension: 3 × 10
• Hollow hold: 4 × 30 s', 'Apertura de pectoral en pared, passive bar hang 3 × 30 s y wrist mobility. 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-10-09","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-10-09', -7201009, 'Metcon', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    '16 min', '', 'Ladder · Core ladder · 5-10-15-20 · Cap 11 min
Sube el número de repeticiones en cada bloque sin perder la posición lumbar.
• Hollow rock: reps del esquema
• V-up: reps del esquema
• Side plank: 15 s por lado entre bloques', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-10-09","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-10-10', -7001010, 'Activación', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Passive bar hang: 30 s
• Band dislocates: 15 reps
• Wall chest opener: 30 s por lado

Activación · Preparación específica · 8 min
• Scapular pull up: 10 reps
• Band row: 15 reps
• Slow dead bug: 10 reps por lado', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-10-10","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-10-10', -7101010, 'Tracción horizontal y front lever', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Front lever completo · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Front lever: 8 intentos
• One-leg front lever: 5 × 20 s

Fuerza · Tracción horizontal · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• One-arm ring row: 4 × 5
• Tuck front lever row: 3 × 8', 'Fuerza · Accesorio y core · 10 min
• Parallette L-sit: 4 × 30 s
• Ring biceps curl: 3 × 10', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-10-10","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-10-10', -7201010, 'Metcon', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    '21 min', '', 'Rounds For Time · Grin and bear · 5 rondas · Cap 16 min
Fragmenta las dominadas antes de llegar al fallo. Usa banda si hace falta y cambia el toes to bar por elevación de rodillas.
• Pull up: 5 reps
• Toes to bar: 8 reps
• Reverse lunge: 10 reps por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-10-10","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-10-11', -7001011, 'Día de descanso', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-10-11","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-10-12', -7001012, 'Activación', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Wall slides: 12 reps
• Doorway chest opener: 30 s por lado
• Seated shoulder bridge: 10 reps

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Push up plus: 10 reps
• Slow wall walk: 3 reps', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-10-12","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-10-12', -7101012, 'Empuje vertical y handstand', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Desplazamiento invertido · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Handstand walk: 10 intentos
• Wall handstand shoulder taps: 5 × 4

Fuerza · Empuje vertical · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Pseudo planche push up: 5 × 4
• Wall HSPU: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Alternating hollow and arch: 4 × 10
• Feet-elevated bench dips: 4 × 10', 'Estiramiento de tríceps sobre la cabeza, seated shoulder bridge y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-10-12","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-10-12', -7201012, 'Metcon', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    '23 min', '', 'For Time · Buy in and buy out · Cap 18 min
Entras y sales con la misma tarea: administra el ritmo del bloque central. Sin sitio para correr, cambia los 400 m por 60 mountain climber.
• Buy in run: 400 m
• Australian pull up: 30 reps
• Push up: 40 reps
• Buy out run: 400 m', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-10-12","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-10-13', -7001013, 'Activación', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Band dislocates: 15 reps
• Cat camel: 10 reps
• Seated shoulder bridge: 10 reps

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Hollow hold: 30 s
• Arch hold: 20 s', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-10-13","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-10-13', -7101013, 'Tracción vertical y muscle-up', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Fuerza en el punto muerto · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• 5 s muscle-up negative: 5 × 4
• Weighted pull up: 5 × 4

Fuerza · Tracción vertical · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Explosive pull up to high bar: 5 × 4
• Weighted pull up: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Band face pull: 4 × 10
• Hanging knee raise: 4 × 10', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-10-13","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-10-13', -7201013, 'Metcon', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    '17 min', '', 'Unbroken · Push unbroken · 12 min
Cada serie sin pausa: si rompes, subes las manos a un cajón y sigues.
• Pike push up: 4 series de 8 reps sin parar
• Parallel bar dips: 4 series de 8 reps sin parar', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-10-13","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-10-14', -7001014, 'Día de descanso', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-10-14","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-10-15', -7001015, 'Activación', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Deep squat hold: 45 s
• Quadruped hip circles: 8 reps por lado
• Single-leg glute bridge: 10 reps por lado

Activación · Preparación específica · 8 min
• Glute bridge: 15 reps
• Hollow hold: 30 s
• Side plank: 30 s por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-10-15","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-10-15', -7101015, 'Piernas, salto y core', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Potencia de salto · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Max vertical jump: 5 × 4
• Single-leg box jump: 5 × 4

Fuerza · Piernas y core · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Single-leg jump squat: 5 × 4
• Nordic curl negative: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 4 × 10
• Slow dead bug: 4 × 10', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-10-15","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-10-15', -7201015, 'Metcon', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    '15 min', '', 'For Time · Floor sprint · Cap 10 min
Es corto: entra fuerte y aguanta el ritmo hasta el final.
• Push up: 50 reps
• Hollow rock: 50 reps
• Plank shoulder tap: 50 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-10-15","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-10-16', -7001016, 'Activación', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Wrist mobility on floor: 45 s
• Cat camel: 10 reps
• Band elbow mobility: 12 reps

Activación · Preparación específica · 8 min
• Push up plus: 10 reps
• Band pull apart: 15 reps
• Slow dead bug: 10 reps por lado', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-10-16","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-10-16', -7101016, 'Empuje horizontal y planche', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Fuerza de planche · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Deficit pseudo planche push up: 5 × 4
• Advanced tuck planche: 5 × 25 s

Fuerza · Empuje horizontal · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Assisted one-arm push up: 5 × 4
• Pseudo planche push up: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Plank shoulder tap: 4 × 10
• Band face pull: 4 × 10', 'Rodillo en pectoral y dorsal, seated shoulder bridge y 2 min de respiración diafragmática.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-10-16","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-10-16', -7201016, 'Metcon', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    '21 min', '', 'For Time · Endurance test · Cap 16 min
Anota el tiempo: este metcon se repite al final de cada fase para comparar.
• Pull up: 25 reps
• Push up: 50 reps
• Air squat: 75 reps
• Hollow rock: 100 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-10-16","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-10-17', -7001017, 'Activación', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Supine thoracic rotation: 8 reps por lado
• 90/90 hip mobility: 8 reps por lado
• Active hamstring stretch: 10 reps por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Hanging knee raise: 10 reps
• Active hang: 30 s', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-10-17","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-10-17', -7101017, 'Tracción horizontal y front lever', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Fuerza dinámica · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck front lever pull up: 5 × 4
• Straddle front lever: 5 × 25 s

Fuerza · Tracción horizontal · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Weighted ring row: 5 × 4
• Tuck ice cream maker: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Hanging knee raise: 4 × 10
• Arch hold: 4 × 35 s', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-10-17","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-10-17', -7201017, 'Metcon', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    '19 min', '', 'Ladder · Push ladder · 21-15-9 · Cap 14 min
Si las flexiones se rompen, sube las manos a un cajón.
• Push up: reps del esquema
• Air squat: reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-10-17","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-10-18', -7001018, 'Día de descanso', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-10-18","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-10-19', -7001019, 'Activación', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Wrist mobility on floor: 45 s
• Cat camel: 10 reps
• Band dislocates: 15 reps

Activación · Preparación específica · 8 min
• Band face pull: 15 reps
• Band Y raise: 12 reps
• Scapular push up: 12 reps', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-10-19","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-10-19', -7101019, 'Empuje vertical y handstand', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Handstand libre · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Freestanding handstand hold: 6 × 25 s
• Freestanding handstand shoulder taps: 6 × 4

Fuerza · Empuje vertical · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Wall HSPU: 6 × 3
• Weighted ring dips: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 4 × 12
• Band face pull: 4 × 12', 'Estira dorsales y pectoral 45 s por lado, más wrist mobility en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-10-19","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-10-19', -7201019, 'Metcon', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    '22 min', '', 'AMRAP · Ring engine · 17 min
Las anillas mandan: mantén los codos pegados y el cuerpo en tensión.
• Ring row: 10 reps
• Assisted ring dips: 8 reps
• Ring support hold: 20 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-10-19","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-10-20', -7001020, 'Activación', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Supine thoracic rotation: 8 reps por lado
• Scapular slides on bar: 10 reps
• Passive bar hang: 30 s

Activación · Preparación específica · 8 min
• Band row: 15 reps
• Band face pull: 15 reps
• Scapular pull up: 10 reps', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-10-20","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-10-20', -7101020, 'Tracción vertical y muscle-up', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Muscle-up en barra · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Strict muscle-up: 12 intentos
• Sternum pull up: 6 × 4

Fuerza · Tracción vertical · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Weighted pull up: 6 × 3
• Sternum ring row: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Band external rotation: 4 × 12
• Arch hold: 5 × 35 s', 'Passive bar hang 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-10-20","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-10-20', -7201020, 'Metcon', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    '20 min', '', 'AMRAP · Park engine · 15 min
Ritmo constante: elige la progresión que te deje seguir sin parar.
• Australian pull up: 8 reps
• Push up: 10 reps
• Air squat: 15 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-10-20","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-10-21', -7001021, 'Día de descanso', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-10-21","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-10-22', -7001022, 'Activación', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Cossack squat: 8 reps por lado
• Active hamstring stretch: 10 reps por lado
• Wall ankle mobility: 10 reps por lado

Activación · Preparación específica · 8 min
• Single-leg calf raise: 15 reps por lado
• Wall sit: 30 s
• Band monster walk: 12 pasos por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-10-22","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-10-22', -7101022, 'Piernas, salto y core', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Pistol lastrado · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Weighted pistol squat: 6 × 4
• Shrimp squat: 6 × 4

Fuerza · Piernas y core · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Weighted pistol squat: 6 × 3
• Nordic curl: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Hanging knee raise: 4 × 12
• Copenhagen plank: 5 × 35 s', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-10-22","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-10-22', -7201022, 'Metcon', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    '20 min', '', 'EMOM · Front lever engine · 15 min
Elige la progresión de lever que puedas sostener 10 s limpios.
• Tuck front lever: 15 s
• Australian pull up: 10 reps
• Hollow rock: 20 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-10-22","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-10-23', -7001023, 'Activación', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Quadruped thoracic rotation: 8 reps por lado
• Plank scapular slide: 10 reps
• Wall chest opener: 30 s por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Planche lean: 20 s
• Scapular push up: 12 reps', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-10-23","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-10-23', -7101023, 'Empuje horizontal y planche', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Advanced tuck planche · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Advanced tuck planche: 6 × 25 s
• Pseudo planche push up: 6 × 4

Fuerza · Empuje horizontal · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Pseudo planche push up: 6 × 3
• Weighted ring dips: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Ab wheel rollout: 4 × 12
• Band Y raise: 4 × 12', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-10-23","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-10-23', -7201023, 'Metcon', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    '16 min', '', 'AMRAP · Active recovery · 11 min
Ritmo suave, respirando por la nariz de principio a fin.
• Active hang: 30 s
• Push up: 8 reps
• Air squat: 12 reps
• Slow dead bug: 10 reps por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-10-23","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-10-24', -7001024, 'Activación', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Cat camel: 10 reps
• Scapular slides on bar: 10 reps
• Passive bar hang: 30 s

Activación · Preparación específica · 8 min
• Arch hold: 20 s
• Band face pull: 15 reps
• Scapular pull up: 10 reps', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-10-24","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-10-24', -7101024, 'Tracción horizontal y front lever', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Straddle front lever · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Straddle front lever: 6 × 25 s
• 5 s front lever negative: 6 × 4

Fuerza · Tracción horizontal · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Tuck front lever row: 6 × 3
• Weighted ring row: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Strict toes to bar: 4 × 12
• Band face pull: 4 × 12', 'Passive bar hang 3 × 30 s, estiramiento de dorsal e isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-10-24","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-10-24', -7201024, 'Metcon', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    '14 min', '', 'Tabata · Core tabata · 8 rondas
Alterna ejercicio en cada ronda: 20 s de trabajo y 10 s de pausa, cambiando de lado en la plancha.
• Hollow hold: 20 s
• Side plank: 20 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-10-24","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-10-25', -7001025, 'Día de descanso', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-10-25","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-10-26', -7001026, 'Activación', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    '10 min', '', 'Movilidad · Empuje vertical · 10 min
• Quadruped thoracic rotation: 8 reps por lado
• Plank shoulder circles: 8 reps por lado
• Wall slides: 12 reps
• Doorway chest opener: 30 s por lado', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-10-26","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-10-26', -7101026, 'Empuje vertical y handstand', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Handstand push up · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall HSPU: 3 × 3
• Freestanding handstand hold: 3 × 20 s

Fuerza · Empuje vertical · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Wall deficit HSPU: 3 × 4
• Weighted parallel bar dips: 2 × 8', 'Fuerza · Accesorio y core · 10 min
• Slow dead bug: 2 × 10
• Band Y raise: 2 × 10', 'Passive bar hang 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-10-26","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-10-26', -7201026, 'Metcon', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    '15 min', '', 'Rounds For Time · Lunge and bar · 3 rondas · Cap 10 min
Zancadas sin apoyar la rodilla y dominadas fragmentadas desde la primera ronda.
• Walking lunge: 20 reps
• Pull up: 6 reps
• Hollow hold: 30 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-10-26","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-10-27', -7001027, 'Activación', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    '10 min', '', 'Movilidad · Tracción vertical · 10 min
• Elbow and wrist mobility: 45 s
• Wall chest opener: 30 s por lado
• Band dislocates: 15 reps
• Cat camel: 10 reps', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-10-27","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-10-27', -7101027, 'Tracción vertical y muscle-up', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Muscle-up en anillas · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Band-assisted ring muscle-up: 3 × 3
• Low ring muscle-up transition: 3 × 3

Fuerza · Tracción vertical · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Sternum pull up: 3 × 4
• Weighted ring row: 2 × 8', 'Fuerza · Accesorio y core · 10 min
• One-arm band row: 2 × 10
• Plank shoulder tap: 2 × 10', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-10-27","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-10-27', -7201027, 'Metcon', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    '13 min', '', 'Ladder · Push ladder · 21-15-9 · Cap 8 min
Si las flexiones se rompen, sube las manos a un cajón.
• Push up: reps del esquema
• Air squat: reps del esquema', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-10-27","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-10-28', -7001028, 'Día de descanso', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-10-28","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-10-29', -7001029, 'Activación', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    '10 min', '', 'Movilidad · Piernas y core · 10 min
• 90/90 hip mobility: 8 reps por lado
• Cat camel: 10 reps
• Deep squat hold: 45 s
• Quadruped hip circles: 8 reps por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-10-29","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-10-29', -7101029, 'Piernas, salto y core', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Nordic curl completo · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Nordic curl: 3 × 3
• Pistol squat: 3 × 3

Fuerza · Piernas y core · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Shrimp squat: 3 × 4
• Nordic hamstring curl: 2 × 8', 'Fuerza · Accesorio y core · 10 min
• V-up: 2 × 10
• Single-leg glute bridge: 2 × 10', 'Deep squat hold 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-10-29","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-10-29', -7201029, 'Metcon', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    '11 min', '', 'Unbroken · Bar hang challenge · 6 min
Cada bloque empieza colgado: si sueltas, descansas un minuto y sigues.
• Active hang: 5 series de 45 s
• Hanging knee raise: 5 series de 10 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-10-29","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-10-30', -7001030, 'Activación', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    '10 min', '', 'Movilidad · Empuje horizontal · 10 min
• Band dislocates: 15 reps
• Seated shoulder bridge: 10 reps
• Wrist mobility on floor: 45 s
• Cat camel: 10 reps', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-10-30","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-10-30', -7101030, 'Empuje horizontal y planche', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Straddle planche asistido · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Band-assisted straddle planche: 3 × 20 s
• Tuck planche: 3 × 20 s

Fuerza · Empuje horizontal · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Weighted push up: 3 × 4
• Ring push up with turnout: 2 × 8', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 2 × 10
• Paused push up plus: 2 × 10', 'Apertura de pectoral en pared, passive bar hang 3 × 30 s y wrist mobility. 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-10-30","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-10-30', -7201030, 'Metcon', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    '15 min', '', 'Estaciones de tiempo · Pull stations · 10 min · 4 estaciones
Un minuto por estación y cuatro vueltas, cambiando sin pausa.
• Pull up: 1 min
• Australian pull up: 1 min
• Hanging knee raise: 1 min
• Active hang: 1 min', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-10-30","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-10-31', -7001031, 'Activación', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    '10 min', '', 'Movilidad · Tracción horizontal · 10 min
• Band dislocates: 15 reps
• Wall chest opener: 30 s por lado
• Supine thoracic rotation: 8 reps por lado
• 90/90 hip mobility: 8 reps por lado', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-10-31","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-10-31', -7101031, 'Tracción horizontal y front lever', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Front lever completo · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Front lever: 5 intentos
• One-leg front lever: 3 × 20 s

Fuerza · Tracción horizontal · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• One-arm ring row: 3 × 4
• Tuck front lever row: 2 × 8', 'Fuerza · Accesorio y core · 10 min
• Ab wheel rollout: 2 × 10
• Band external rotation: 2 × 10', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-10-31","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-10-31', -7201031, 'Metcon', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    '15 min', '', 'Estaciones de tiempo · Park stations · 10 min · 4 estaciones
Un minuto por estación y cuatro vueltas, sin descanso entre estaciones.
• Australian pull up: 1 min
• Push up: 1 min
• Air squat: 1 min
• Front plank: 1 min', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-10-31","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-11-01', -7001101, 'Día de descanso', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-11-01","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-11-02', -7001102, 'Activación', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Doorway chest opener: 30 s por lado
• Seated shoulder bridge: 10 reps
• Wrist mobility on floor: 45 s

Activación · Preparación específica · 8 min
• Push up plus: 10 reps
• Slow wall walk: 3 reps
• Band face pull: 15 reps', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-11-02","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-11-02', -7101102, 'Empuje vertical y handstand', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Handstand walk · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Handstand walk: 6 intentos
• Max freestanding handstand hold: 4 × 25 s

Fuerza · Empuje vertical · 22 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Strict HSPU: 4 × 4
• Pseudo planche push up: 3 × 6', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 35 s
• Ring triceps extension: 3 × 10', 'Estiramiento de tríceps sobre la cabeza, seated shoulder bridge y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-11-02","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-11-02', -7201102, 'Metcon', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    '18 min', '', 'EMOM · Muscle-up practice · 13 min
Calidad por encima de cantidad: salta el minuto si la transición se rompe.
• Assisted muscle-up transition: 3 reps
• Explosive pull up: 4 reps
• Parallel bar dips: 8 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-11-02","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-11-03', -7001103, 'Activación', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Cat camel: 10 reps
• Seated shoulder bridge: 10 reps
• Supine thoracic rotation: 8 reps por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Arch hold: 20 s
• Band row: 15 reps', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-11-03","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-11-03', -7101103, 'Tracción vertical y muscle-up', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Muscle-up en anillas · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Ring muscle-up: 6 intentos
• 5 s muscle-up negative: 4 × 3

Fuerza · Tracción vertical · 22 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Weighted sternum pull up: 4 × 4
• Sternum ring row: 3 × 6', 'Fuerza · Accesorio y core · 10 min
• Ring biceps curl: 3 × 10
• Hollow hold: 3 × 35 s', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-11-03","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-11-03', -7201103, 'Metcon', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    '12 min', '', 'Tabata · Push tabata · 8 rondas
Mismo número de repeticiones en las ocho rondas: elige un ritmo sostenible.
• Push up: 20 s
• Bench dips: 20 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-11-03","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-11-04', -7001104, 'Día de descanso', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-11-04","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-11-05', -7001105, 'Activación', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Quadruped hip circles: 8 reps por lado
• Single-leg glute bridge: 10 reps por lado
• Cossack squat: 8 reps por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Side plank: 30 s por lado
• Single-leg calf raise: 15 reps por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-11-05","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-11-05', -7101105, 'Piernas, salto y core', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Fuerza a una pierna · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Weighted pistol squat: 4 × 3
• Weighted shrimp squat: 4 × 3

Fuerza · Piernas y core · 22 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Pistol squat: 4 × 4
• Weighted single-leg Romanian deadlift: 3 × 6', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 35 s
• Single-leg calf raise: 3 × 10', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-11-05","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-11-05', -7201105, 'Metcon', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    '20 min', '', 'Rounds For Time · Pike and pistol · 5 rondas · Cap 15 min
Alterna piernas en el pistol y controla la bajada del pike.
• Pike push up: 8 reps
• Assisted pistol squat: 5 reps por lado
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-11-05","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-11-06', -7001106, 'Activación', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Cat camel: 10 reps
• Band elbow mobility: 12 reps
• Quadruped thoracic rotation: 8 reps por lado

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Slow dead bug: 10 reps por lado
• Hollow hold: 30 s', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-11-06","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-11-06', -7101106, 'Empuje horizontal y planche', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Planche push up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck planche push up: 4 × 3
• Deficit pseudo planche push up: 4 × 3

Fuerza · Empuje horizontal · 22 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Pseudo planche push up: 4 × 4
• Weighted push up: 3 × 6', 'Fuerza · Accesorio y core · 10 min
• Ring triceps extension: 3 × 10
• Hollow hold: 3 × 35 s', 'Rodillo en pectoral y dorsal, seated shoulder bridge y 2 min de respiración diafragmática.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-11-06","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-11-06', -7201106, 'Metcon', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    '16 min', '', 'EMOM · Death by burpee · 11 min
Minuto 1 una repetición, minuto 2 dos, y así hasta que no llegues a tiempo.
• Burpee: 1 rep acumulativa por minuto', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-11-06","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-11-07', -7001107, 'Activación', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• 90/90 hip mobility: 8 reps por lado
• Active hamstring stretch: 10 reps por lado
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Hanging knee raise: 10 reps
• Active hang: 30 s
• Arch hold: 20 s', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-11-07","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-11-07', -7101107, 'Tracción horizontal y front lever', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Test de L-sit · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Max L-sit: 4 × 25 s
• Max front lever hold: 4 × 25 s

Fuerza · Tracción horizontal · 22 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Ice cream maker: 4 × 4
• Straddle front lever row: 3 × 6', 'Fuerza · Accesorio y core · 10 min
• Parallette L-sit: 3 × 35 s
• Ring biceps curl: 3 × 10', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-11-07","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-11-07', -7201107, 'Metcon', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    '19 min', '', 'EMOM · Push EMOM · 14 min
Un movimiento por minuto, rotando siempre en el mismo orden.
• Pike push up: 6 reps
• Push up: 12 reps
• Bench dips: 10 reps
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-11-07","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-11-08', -7001108, 'Día de descanso', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-11-08","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-11-09', -7001109, 'Activación', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Cat camel: 10 reps
• Band dislocates: 15 reps
• Quadruped thoracic rotation: 8 reps por lado

Activación · Preparación específica · 8 min
• Band Y raise: 12 reps
• Scapular push up: 12 reps
• Wall pike hold: 30 s', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-11-09","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-11-09', -7101109, 'Empuje vertical y handstand', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Test de handstand · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Max freestanding handstand hold: 4 × 30 s
• Strict HSPU: 5 × 2

Fuerza · Empuje vertical · 22 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Strict HSPU: 5 × 3
• Weighted ring dips: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Alternating hollow and arch: 3 × 12
• Feet-elevated bench dips: 3 × 12', 'Estira dorsales y pectoral 45 s por lado, más wrist mobility en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-11-09","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-11-09', -7201109, 'Metcon', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    '19 min', '', 'EMOM · Front lever engine · 14 min
Elige la progresión de lever que puedas sostener 10 s limpios.
• Tuck front lever: 15 s
• Australian pull up: 10 reps
• Hollow rock: 20 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-11-09","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-11-10', -7001110, 'Activación', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Scapular slides on bar: 10 reps
• Passive bar hang: 30 s
• Elbow and wrist mobility: 45 s

Activación · Preparación específica · 8 min
• Band face pull: 15 reps
• Scapular pull up: 10 reps
• Active hang: 30 s', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-11-10","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-11-10', -7101110, 'Tracción vertical y muscle-up', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Test de muscle-up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Strict muscle-up: 5 × 2
• Weighted pull up: 5 × 2

Fuerza · Tracción vertical · 22 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Max weighted pull up: 5 × 3
• Weighted ring row: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Band face pull: 3 × 12
• Hanging knee raise: 3 × 12', 'Passive bar hang 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-11-10","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-11-10', -7201110, 'Metcon', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    '21 min', '', 'EMOM · Push EMOM · 16 min
Un movimiento por minuto, rotando siempre en el mismo orden.
• Pike push up: 6 reps
• Push up: 12 reps
• Bench dips: 10 reps
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-11-10","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-11-11', -7001111, 'Día de descanso', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-11-11","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-11-12', -7001112, 'Activación', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Active hamstring stretch: 10 reps por lado
• Wall ankle mobility: 10 reps por lado
• 90/90 hip mobility: 8 reps por lado

Activación · Preparación específica · 8 min
• Wall sit: 30 s
• Band monster walk: 12 pasos por lado
• Slow dead bug: 10 reps por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-11-12","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-11-12', -7101112, 'Piernas, salto y core', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Test unilateral · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Max pistol squat: 8 intentos
• Nordic curl: 5 × 2

Fuerza · Piernas y core · 22 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Max weighted pistol squat: 5 × 3
• Nordic curl: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 3 × 12
• Slow dead bug: 3 × 12', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-11-12","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-11-12', -7201112, 'Metcon', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    '21 min', '', 'For Time · Endurance test · Cap 16 min
Anota el tiempo: este metcon se repite al final de cada fase para comparar.
• Pull up: 25 reps
• Push up: 50 reps
• Air squat: 75 reps
• Hollow rock: 100 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-11-12","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-11-13', -7001113, 'Activación', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Plank scapular slide: 10 reps
• Wall chest opener: 30 s por lado
• Band dislocates: 15 reps

Activación · Preparación específica · 8 min
• Planche lean: 20 s
• Scapular push up: 12 reps
• Plank shoulder tap: 10 reps por lado', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-11-13","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-11-13', -7101113, 'Empuje horizontal y planche', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Test de planche · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Max advanced tuck planche: 4 × 30 s
• Tuck planche: 4 × 30 s

Fuerza · Empuje horizontal · 22 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Max weighted push up: 5 × 3
• Weighted ring dips: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Plank shoulder tap: 3 × 12
• Band face pull: 3 × 12', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-11-13","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-11-13', -7201113, 'Metcon', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    '17 min', '', 'AMRAP · Hollow to bar · 12 min
Mantén la pelvis retrovertida en todo el trabajo de core.
• Hollow rock: 20 reps
• Australian pull up: 10 reps
• Plank shoulder tap: 20 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-11-13","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-11-14', -7001114, 'Activación', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Scapular slides on bar: 10 reps
• Passive bar hang: 30 s
• Band dislocates: 15 reps

Activación · Preparación específica · 8 min
• Band face pull: 15 reps
• Scapular pull up: 10 reps
• Band row: 15 reps', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-11-14","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-11-14', -7101114, 'Tracción horizontal y front lever', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Test de front lever · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Max front lever hold: 4 × 30 s
• Straddle front lever: 4 × 30 s

Fuerza · Tracción horizontal · 22 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Straddle front lever row: 5 × 3
• Max weighted ring row: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Hanging knee raise: 3 × 12
• Arch hold: 4 × 40 s', 'Passive bar hang 3 × 30 s, estiramiento de dorsal e isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-11-14","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-11-14', -7201114, 'Metcon', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    '17 min', '', 'AMRAP · Bodyweight legs · 12 min
Aterriza suave en los saltos y mantén el pecho alto en las zancadas.
• Air squat: 20 reps
• Jump lunge: 10 reps por lado
• Box jump: 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-11-14","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-11-15', -7001115, 'Día de descanso', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-11-15","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-11-16', -7001116, 'Activación', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Plank shoulder circles: 8 reps por lado
• Wall slides: 12 reps
• Doorway chest opener: 30 s por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Band pull apart: 15 reps
• Push up plus: 10 reps', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-11-16","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-11-16', -7101116, 'Empuje vertical y handstand', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    '55 min', '', 'Entrenamiento de Técnica · HSPU libre · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Freestanding HSPU: 10 intentos
• Freestanding handstand hold: 3 × 35 s

Fuerza · Empuje vertical · 22 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Deficit HSPU: 5 × 2
• Weighted parallel bar dips: 4 × 5', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 4 × 12
• Band face pull: 4 × 12', 'Passive bar hang 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-11-16","dayOrder":1,"kind":"session"}'::jsonb, now()
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
