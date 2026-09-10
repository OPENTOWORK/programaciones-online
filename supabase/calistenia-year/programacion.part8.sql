-- Programación anual de Calistenia generada por scripts/generate-calistenia-year.mjs
-- Parte 8 de 8 · 110 sesiones. Pega las partes en orden en el editor SQL de Supabase.
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
    target_program, '2026-11-16', -7201116, 'Metcon', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    '16 min', '', 'Unbroken · Bar hang challenge · 11 min
Cada bloque empieza colgado: si sueltas, descansas un minuto y sigues.
• Active hang: 5 series de 45 s
• Hanging knee raise: 5 series de 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-11-16","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-11-17', -7001117, 'Activación', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Wall chest opener: 30 s por lado
• Band dislocates: 15 reps
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Band external rotation: 12 reps por lado
• Band pull apart: 15 reps
• Hollow hold: 30 s', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-11-17","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-11-17', -7101117, 'Tracción vertical y muscle-up', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Test de dominadas · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Max strict pull up: 10 intentos
• Strict muscle-up: 5 × 2

Fuerza · Tracción vertical · 22 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Strict pull up to technical failure: 5 × 2
• Weighted pull up: 4 × 5', 'Fuerza · Accesorio y core · 10 min
• Band external rotation: 4 × 12
• Arch hold: 4 × 45 s', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-11-17","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-11-17', -7201117, 'Metcon', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    '18 min', '', 'AMRAP · Bodyweight legs · 13 min
Aterriza suave en los saltos y mantén el pecho alto en las zancadas.
• Air squat: 20 reps
• Jump lunge: 10 reps por lado
• Box jump: 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-11-17","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-11-18', -7001118, 'Día de descanso', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-11-18","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-11-19', -7001119, 'Activación', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Cat camel: 10 reps
• Deep squat hold: 45 s
• Quadruped hip circles: 8 reps por lado

Activación · Preparación específica · 8 min
• Light jump lunge: 8 reps por lado
• Glute bridge: 15 reps
• Hollow hold: 30 s', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-11-19","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-11-19', -7101119, 'Piernas, salto y core', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Test de salto · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Max vertical jump: 5 × 2
• Max broad jump: 5 × 2

Fuerza · Piernas y core · 22 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Weighted shrimp squat: 5 × 2
• Single-leg box jump: 4 × 5', 'Fuerza · Accesorio y core · 10 min
• Hanging knee raise: 4 × 12
• Copenhagen plank: 4 × 45 s', 'Deep squat hold 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-11-19","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-11-19', -7201119, 'Metcon', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    '16 min', '', 'AMRAP · Active recovery · 11 min
Ritmo suave, respirando por la nariz de principio a fin.
• Active hang: 30 s
• Push up: 8 reps
• Air squat: 12 reps
• Slow dead bug: 10 reps por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-11-19","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-11-20', -7001120, 'Activación', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Seated shoulder bridge: 10 reps
• Wrist mobility on floor: 45 s
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Band face pull: 15 reps
• Push up plus: 10 reps
• Band pull apart: 15 reps', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-11-20","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-11-20', -7101120, 'Empuje horizontal y planche', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Straddle planche · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Straddle planche: 10 intentos
• Advanced tuck planche: 3 × 35 s

Fuerza · Empuje horizontal · 22 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• One-arm push up: 5 × 2
• Deficit pseudo planche push up: 4 × 5', 'Fuerza · Accesorio y core · 10 min
• Ab wheel rollout: 4 × 12
• Band Y raise: 4 × 12', 'Apertura de pectoral en pared, passive bar hang 3 × 30 s y wrist mobility. 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-11-20","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-11-20', -7201120, 'Metcon', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    '22 min', '', 'Ladder · Pull ladder · 15-12-9-6-3 · Cap 17 min
Baja de progresión antes que romper la técnica.
• Australian pull up: reps del esquema
• Hollow rock: reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-11-20","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-11-21', -7001121, 'Activación', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Wall chest opener: 30 s por lado
• Supine thoracic rotation: 8 reps por lado
• 90/90 hip mobility: 8 reps por lado

Activación · Preparación específica · 8 min
• Slow dead bug: 10 reps por lado
• Hollow hold: 30 s
• Hanging knee raise: 10 reps', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-11-21","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-11-21', -7101121, 'Tracción horizontal y front lever', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Front lever pull up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Straddle front lever pull up: 5 × 2
• Front lever: 10 intentos

Fuerza · Tracción horizontal · 22 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• One-arm ring row: 5 × 2
• Tuck front lever row: 4 × 5', 'Fuerza · Accesorio y core · 10 min
• Strict toes to bar: 4 × 12
• Band face pull: 4 × 12', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-11-21","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-11-21', -7201121, 'Metcon', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    '16 min', '', 'AMRAP · Burpee pull up · 11 min
Si no llegas a la barra, haz burpee y salto vertical con los brazos arriba.
• Burpee pull up: 5 reps
• Air squat: 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-11-21","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-11-22', -7001122, 'Día de descanso', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-11-22","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-11-23', -7001123, 'Activación', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    '10 min', '', 'Movilidad · Empuje vertical · 10 min
• Seated shoulder bridge: 10 reps
• Wrist mobility on floor: 45 s
• Cat camel: 10 reps
• Band dislocates: 15 reps', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-11-23","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-11-23', -7101123, 'Empuje vertical y handstand', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Handstand walk · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Handstand walk: 4 intentos
• Max freestanding handstand hold: 3 × 20 s

Fuerza · Empuje vertical · 22 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Strict HSPU: 3 × 3
• Pseudo planche push up: 2 × 6', 'Fuerza · Accesorio y core · 10 min
• Slow dead bug: 2 × 10
• Band Y raise: 2 × 10', 'Estiramiento de tríceps sobre la cabeza, seated shoulder bridge y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-11-23","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-11-23', -7201123, 'Metcon', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    '15 min', '', 'Rounds For Time · Pike and pistol · 3 rondas · Cap 10 min
Alterna piernas en el pistol y controla la bajada del pike.
• Pike push up: 8 reps
• Assisted pistol squat: 5 reps por lado
• Hollow hold: 30 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-11-23","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-11-24', -7001124, 'Activación', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    '10 min', '', 'Movilidad · Tracción vertical · 10 min
• Seated shoulder bridge: 10 reps
• Supine thoracic rotation: 8 reps por lado
• Scapular slides on bar: 10 reps
• Passive bar hang: 30 s', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-11-24","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-11-24', -7101124, 'Tracción vertical y muscle-up', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Muscle-up en anillas · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Ring muscle-up: 4 intentos
• 5 s muscle-up negative: 3 × 2

Fuerza · Tracción vertical · 22 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Weighted sternum pull up: 3 × 3
• Sternum ring row: 2 × 6', 'Fuerza · Accesorio y core · 10 min
• One-arm band row: 2 × 10
• Plank shoulder tap: 2 × 10', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-11-24","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-11-24', -7201124, 'Metcon', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    '15 min', '', 'Rounds For Time · Bodyweight complex · 4 rondas · Cap 10 min
La ronda es un complex seguido: una dominada, dos flexiones y tres sentadillas sin parar.
• Pull up: 1 rep
• Push up: 2 reps
• Air squat: 3 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-11-24","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-11-25', -7001125, 'Día de descanso', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-11-25","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-11-26', -7001126, 'Activación', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    '10 min', '', 'Movilidad · Piernas y core · 10 min
• Single-leg glute bridge: 10 reps por lado
• Cossack squat: 8 reps por lado
• Active hamstring stretch: 10 reps por lado
• Wall ankle mobility: 10 reps por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-11-26","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-11-26', -7101126, 'Piernas, salto y core', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Fuerza a una pierna · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Weighted pistol squat: 3 × 2
• Weighted shrimp squat: 3 × 2

Fuerza · Piernas y core · 22 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Pistol squat: 3 × 3
• Weighted single-leg Romanian deadlift: 2 × 6', 'Fuerza · Accesorio y core · 10 min
• V-up: 2 × 10
• Single-leg glute bridge: 2 × 10', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-11-26","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-11-26', -7201126, 'Metcon', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    '12 min', '', 'Unbroken · Push unbroken · 7 min
Cada serie sin pausa: si rompes, subes las manos a un cajón y sigues.
• Pike push up: 4 series de 8 reps sin parar
• Parallel bar dips: 4 series de 8 reps sin parar', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-11-26","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-11-27', -7001127, 'Activación', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    '10 min', '', 'Movilidad · Empuje horizontal · 10 min
• Band elbow mobility: 12 reps
• Quadruped thoracic rotation: 8 reps por lado
• Plank scapular slide: 10 reps
• Wall chest opener: 30 s por lado', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-11-27","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-11-27', -7101127, 'Empuje horizontal y planche', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Planche push up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck planche push up: 3 × 2
• Deficit pseudo planche push up: 3 × 2

Fuerza · Empuje horizontal · 22 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Pseudo planche push up: 3 × 3
• Weighted push up: 2 × 6', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 2 × 10
• Paused push up plus: 2 × 10', 'Rodillo en pectoral y dorsal, seated shoulder bridge y 2 min de respiración diafragmática.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-11-27","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-11-27', -7201127, 'Metcon', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    '15 min', '', 'Estaciones de tiempo · Park stations · 10 min · 4 estaciones
Un minuto por estación y cuatro vueltas, sin descanso entre estaciones.
• Australian pull up: 1 min
• Push up: 1 min
• Air squat: 1 min
• Front plank: 1 min', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-11-27","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-11-28', -7001128, 'Activación', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    '10 min', '', 'Movilidad · Tracción horizontal · 10 min
• Active hamstring stretch: 10 reps por lado
• Cat camel: 10 reps
• Scapular slides on bar: 10 reps
• Passive bar hang: 30 s', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-11-28","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-11-28', -7101128, 'Tracción horizontal y front lever', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Test de L-sit · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Max L-sit: 3 × 20 s
• Max front lever hold: 3 × 20 s

Fuerza · Tracción horizontal · 22 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Ice cream maker: 3 × 3
• Straddle front lever row: 2 × 6', 'Fuerza · Accesorio y core · 10 min
• Ab wheel rollout: 2 × 10
• Band external rotation: 2 × 10', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-11-28","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-11-28', -7201128, 'Metcon', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    '16 min', '', 'For Time · Buy in and buy out · Cap 11 min
Entras y sales con la misma tarea: administra el ritmo del bloque central. Sin sitio para correr, cambia los 400 m por 60 mountain climber.
• Buy in run: 400 m
• Australian pull up: 30 reps
• Push up: 40 reps
• Buy out run: 400 m', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-11-28","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-11-29', -7001129, 'Día de descanso', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-11-29","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-11-30', -7001130, 'Activación', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Band dislocates: 15 reps
• Cat camel: 10 reps
• Wrist mobility on floor: 45 s

Activación · Preparación específica · 8 min
• Scapular push up: 12 reps
• Band Y raise: 12 reps
• Band face pull: 15 reps', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-11-30","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-11-30', -7101130, 'Empuje vertical y handstand', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Test de handstand · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Max freestanding handstand hold: 4 × 25 s
• Strict HSPU: 4 × 3

Fuerza · Empuje vertical · 22 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Strict HSPU: 4 × 4
• Weighted ring dips: 3 × 6', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 35 s
• Ring triceps extension: 3 × 10', 'Estira dorsales y pectoral 45 s por lado, más wrist mobility en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-11-30","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-11-30', -7201130, 'Metcon', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    '19 min', '', 'For Time · Endurance test · Cap 14 min
Anota el tiempo: este metcon se repite al final de cada fase para comparar.
• Pull up: 25 reps
• Push up: 50 reps
• Air squat: 75 reps
• Hollow rock: 100 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-11-30","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-12-01', -7001201, 'Activación', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Passive bar hang: 30 s
• Scapular slides on bar: 10 reps
• Supine thoracic rotation: 8 reps por lado

Activación · Preparación específica · 8 min
• Scapular pull up: 10 reps
• Band face pull: 15 reps
• Band row: 15 reps', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-12-01","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-12-01', -7101201, 'Tracción vertical y muscle-up', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Test de muscle-up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Strict muscle-up: 4 × 3
• Weighted pull up: 4 × 3

Fuerza · Tracción vertical · 22 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Max weighted pull up: 4 × 4
• Weighted ring row: 3 × 6', 'Fuerza · Accesorio y core · 10 min
• Ring biceps curl: 3 × 10
• Hollow hold: 3 × 35 s', 'Passive bar hang 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-12-01","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-12-01', -7201201, 'Metcon', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    '16 min', '', 'EMOM · Handstand engine · 11 min
Sube al invertido con control; si no llegas, sostén pike contra la pared.
• Wall handstand hold: 30 s
• Push up: 12 reps
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-12-01","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-12-02', -7001202, 'Día de descanso', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-12-02","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-12-03', -7001203, 'Activación', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Wall ankle mobility: 10 reps por lado
• Active hamstring stretch: 10 reps por lado
• Cossack squat: 8 reps por lado

Activación · Preparación específica · 8 min
• Band monster walk: 12 pasos por lado
• Wall sit: 30 s
• Single-leg calf raise: 15 reps por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-12-03","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-12-03', -7101203, 'Piernas, salto y core', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Test unilateral · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Max pistol squat: 6 intentos
• Nordic curl: 4 × 3

Fuerza · Piernas y core · 22 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Max weighted pistol squat: 4 × 4
• Nordic curl: 3 × 6', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 35 s
• Single-leg calf raise: 3 × 10', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-12-03","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-12-03', -7201203, 'Metcon', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    '18 min', '', 'AMRAP · Park engine · 13 min
Ritmo constante: elige la progresión que te deje seguir sin parar.
• Australian pull up: 8 reps
• Push up: 10 reps
• Air squat: 15 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-12-03","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-12-04', -7001204, 'Activación', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Wall chest opener: 30 s por lado
• Plank scapular slide: 10 reps
• Quadruped thoracic rotation: 8 reps por lado

Activación · Preparación específica · 8 min
• Scapular push up: 12 reps
• Planche lean: 20 s
• Hollow hold: 30 s', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-12-04","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-12-04', -7101204, 'Empuje horizontal y planche', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Test de planche · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Max advanced tuck planche: 4 × 25 s
• Tuck planche: 4 × 25 s

Fuerza · Empuje horizontal · 22 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Max weighted push up: 4 × 4
• Weighted ring dips: 3 × 6', 'Fuerza · Accesorio y core · 10 min
• Ring triceps extension: 3 × 10
• Hollow hold: 3 × 35 s', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-12-04","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-12-04', -7201204, 'Metcon', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    '19 min', '', 'EMOM · Push EMOM · 14 min
Un movimiento por minuto, rotando siempre en el mismo orden.
• Pike push up: 6 reps
• Push up: 12 reps
• Bench dips: 10 reps
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-12-04","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-12-05', -7001205, 'Activación', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Passive bar hang: 30 s
• Scapular slides on bar: 10 reps
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Scapular pull up: 10 reps
• Band face pull: 15 reps
• Arch hold: 20 s', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-12-05","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-12-05', -7101205, 'Tracción horizontal y front lever', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Test de front lever · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Max front lever hold: 4 × 25 s
• Straddle front lever: 4 × 25 s

Fuerza · Tracción horizontal · 22 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Straddle front lever row: 4 × 4
• Max weighted ring row: 3 × 6', 'Fuerza · Accesorio y core · 10 min
• Parallette L-sit: 3 × 35 s
• Ring biceps curl: 3 × 10', 'Passive bar hang 3 × 30 s, estiramiento de dorsal e isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-12-05","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-12-05', -7201205, 'Metcon', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    '19 min', '', 'AMRAP · Ring engine · 14 min
Las anillas mandan: mantén los codos pegados y el cuerpo en tensión.
• Ring row: 10 reps
• Assisted ring dips: 8 reps
• Ring support hold: 20 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-12-05","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-12-06', -7001206, 'Día de descanso', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-12-06","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-12-07', -7001207, 'Activación', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Wall slides: 12 reps
• Plank shoulder circles: 8 reps por lado
• Quadruped thoracic rotation: 8 reps por lado

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Hollow hold: 30 s
• Wall pike hold: 30 s', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-12-07","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-12-07', -7101207, 'Empuje vertical y handstand', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    '55 min', '', 'Entrenamiento de Técnica · HSPU libre · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Freestanding HSPU: 8 intentos
• Freestanding handstand hold: 4 × 30 s

Fuerza · Empuje vertical · 22 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Deficit HSPU: 5 × 3
• Weighted parallel bar dips: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Alternating hollow and arch: 3 × 12
• Feet-elevated bench dips: 3 × 12', 'Passive bar hang 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-12-07","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-12-07', -7201207, 'Metcon', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    '15 min', '', 'AMRAP · Active recovery · 10 min
Ritmo suave, respirando por la nariz de principio a fin.
• Active hang: 30 s
• Push up: 8 reps
• Air squat: 12 reps
• Slow dead bug: 10 reps por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-12-07","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-12-08', -7001208, 'Activación', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Band dislocates: 15 reps
• Wall chest opener: 30 s por lado
• Elbow and wrist mobility: 45 s

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Band external rotation: 12 reps por lado
• Active hang: 30 s', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-12-08","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-12-08', -7101208, 'Tracción vertical y muscle-up', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Test de dominadas · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Max strict pull up: 8 intentos
• Strict muscle-up: 5 × 2

Fuerza · Tracción vertical · 22 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Strict pull up to technical failure: 5 × 3
• Weighted pull up: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Band face pull: 3 × 12
• Hanging knee raise: 3 × 12', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-12-08","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-12-08', -7201208, 'Metcon', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    '20 min', '', 'AMRAP · Ring engine · 15 min
Las anillas mandan: mantén los codos pegados y el cuerpo en tensión.
• Ring row: 10 reps
• Assisted ring dips: 8 reps
• Ring support hold: 20 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-12-08","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-12-09', -7001209, 'Día de descanso', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-12-09","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-12-10', -7001210, 'Activación', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Deep squat hold: 45 s
• Cat camel: 10 reps
• 90/90 hip mobility: 8 reps por lado

Activación · Preparación específica · 8 min
• Glute bridge: 15 reps
• Light jump lunge: 8 reps por lado
• Slow dead bug: 10 reps por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-12-10","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-12-10', -7101210, 'Piernas, salto y core', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Test de salto · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Max vertical jump: 5 × 2
• Max broad jump: 5 × 2

Fuerza · Piernas y core · 22 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Weighted shrimp squat: 5 × 3
• Single-leg box jump: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 3 × 12
• Slow dead bug: 3 × 12', 'Deep squat hold 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-12-10","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-12-10', -7201210, 'Metcon', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    '23 min', '', 'Rounds For Time · Grin and bear · 5 rondas · Cap 18 min
Fragmenta las dominadas antes de llegar al fallo. Usa banda si hace falta y cambia el toes to bar por elevación de rodillas.
• Pull up: 5 reps
• Toes to bar: 8 reps
• Reverse lunge: 10 reps por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-12-10","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-12-11', -7001211, 'Activación', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Wrist mobility on floor: 45 s
• Seated shoulder bridge: 10 reps
• Band dislocates: 15 reps

Activación · Preparación específica · 8 min
• Push up plus: 10 reps
• Band face pull: 15 reps
• Plank shoulder tap: 10 reps por lado', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-12-11","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-12-11', -7101211, 'Empuje horizontal y planche', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Straddle planche · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Straddle planche: 8 intentos
• Advanced tuck planche: 4 × 30 s

Fuerza · Empuje horizontal · 22 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• One-arm push up: 5 × 3
• Deficit pseudo planche push up: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Plank shoulder tap: 3 × 12
• Band face pull: 3 × 12', 'Apertura de pectoral en pared, passive bar hang 3 × 30 s y wrist mobility. 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-12-11","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-12-11', -7201211, 'Metcon', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    '15 min', '', 'Unbroken · Floor unbroken · 10 min
Series sin pausa: para en cuanto pierdas la línea del cuerpo.
• Push up: 5 series de 12 reps sin parar
• Hollow hold: 5 series de 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-12-11","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-12-12', -7001212, 'Activación', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Supine thoracic rotation: 8 reps por lado
• Wall chest opener: 30 s por lado
• Band dislocates: 15 reps

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Slow dead bug: 10 reps por lado
• Band row: 15 reps', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-12-12","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-12-12', -7101212, 'Tracción horizontal y front lever', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Front lever pull up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Straddle front lever pull up: 5 × 2
• Front lever: 8 intentos

Fuerza · Tracción horizontal · 22 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• One-arm ring row: 5 × 3
• Tuck front lever row: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Hanging knee raise: 3 × 12
• Arch hold: 4 × 40 s', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-12-12","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-12-12', -7201212, 'Metcon', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    '17 min', '', 'Estaciones de tiempo · Core stations · 12 min · 3 estaciones
Un minuto por estación y cuatro vueltas, cambiando sin pausa.
• Hollow hold: 1 min
• Plank shoulder tap: 1 min
• Hanging knee raise: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-12-12","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-12-13', -7001213, 'Día de descanso', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-12-13","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-12-14', -7001214, 'Activación', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Wrist mobility on floor: 45 s
• Seated shoulder bridge: 10 reps
• Doorway chest opener: 30 s por lado

Activación · Preparación específica · 8 min
• Band face pull: 15 reps
• Slow wall walk: 3 reps
• Push up plus: 10 reps', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-12-14","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-12-14', -7101214, 'Empuje vertical y handstand', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Handstand walk · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Handstand walk: 10 intentos
• Max freestanding handstand hold: 3 × 35 s

Fuerza · Empuje vertical · 22 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Strict HSPU: 5 × 2
• Pseudo planche push up: 4 × 5', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 4 × 12
• Band face pull: 4 × 12', 'Estiramiento de tríceps sobre la cabeza, seated shoulder bridge y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-12-14","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-12-14', -7201214, 'Metcon', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    '23 min', '', 'Estaciones de tiempo · Pull stations · 18 min · 4 estaciones
Un minuto por estación y cuatro vueltas, cambiando sin pausa.
• Pull up: 1 min
• Australian pull up: 1 min
• Hanging knee raise: 1 min
• Active hang: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-12-14","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-12-15', -7001215, 'Activación', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Supine thoracic rotation: 8 reps por lado
• Seated shoulder bridge: 10 reps
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Band row: 15 reps
• Arch hold: 20 s
• Hollow hold: 30 s', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-12-15","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-12-15', -7101215, 'Tracción vertical y muscle-up', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Muscle-up en anillas · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Ring muscle-up: 10 intentos
• 5 s muscle-up negative: 5 × 2

Fuerza · Tracción vertical · 22 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Weighted sternum pull up: 5 × 2
• Sternum ring row: 4 × 5', 'Fuerza · Accesorio y core · 10 min
• Band external rotation: 4 × 12
• Arch hold: 4 × 45 s', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-12-15","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-12-15', -7201215, 'Metcon', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    '23 min', '', 'Rounds For Time · Lunge and bar · 4 rondas · Cap 18 min
Zancadas sin apoyar la rodilla y dominadas fragmentadas desde la primera ronda.
• Walking lunge: 20 reps
• Pull up: 6 reps
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-12-15","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-12-16', -7001216, 'Día de descanso', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-12-16","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-12-17', -7001217, 'Activación', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Cossack squat: 8 reps por lado
• Single-leg glute bridge: 10 reps por lado
• Quadruped hip circles: 8 reps por lado

Activación · Preparación específica · 8 min
• Single-leg calf raise: 15 reps por lado
• Side plank: 30 s por lado
• Hollow hold: 30 s', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-12-17","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-12-17', -7101217, 'Piernas, salto y core', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Fuerza a una pierna · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Weighted pistol squat: 5 × 2
• Weighted shrimp squat: 5 × 2

Fuerza · Piernas y core · 22 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Pistol squat: 5 × 2
• Weighted single-leg Romanian deadlift: 4 × 5', 'Fuerza · Accesorio y core · 10 min
• Hanging knee raise: 4 × 12
• Copenhagen plank: 4 × 45 s', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-12-17","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-12-17', -7201217, 'Metcon', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    '20 min', '', 'Ladder · Push ladder · 21-15-9 · Cap 15 min
Si las flexiones se rompen, sube las manos a un cajón.
• Push up: reps del esquema
• Air squat: reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-12-17","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-12-18', -7001218, 'Activación', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Quadruped thoracic rotation: 8 reps por lado
• Band elbow mobility: 12 reps
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Slow dead bug: 10 reps por lado
• Band pull apart: 15 reps', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-12-18","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-12-18', -7101218, 'Empuje horizontal y planche', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Planche push up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck planche push up: 5 × 2
• Deficit pseudo planche push up: 5 × 2

Fuerza · Empuje horizontal · 22 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Pseudo planche push up: 5 × 2
• Weighted push up: 4 × 5', 'Fuerza · Accesorio y core · 10 min
• Ab wheel rollout: 4 × 12
• Band Y raise: 4 × 12', 'Rodillo en pectoral y dorsal, seated shoulder bridge y 2 min de respiración diafragmática.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-12-18","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-12-18', -7201218, 'Metcon', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    '23 min', '', 'Rounds For Time · Pistol partner · 4 rondas · Cap 18 min
Alterna piernas en cada repetición y usa anillas si necesitas asistencia.
• Assisted pistol squat: 6 reps por lado
• Hollow rock: 20 reps
• Jump squat: 15 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-12-18","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-12-19', -7001219, 'Activación', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Cat camel: 10 reps
• Active hamstring stretch: 10 reps por lado
• 90/90 hip mobility: 8 reps por lado

Activación · Preparación específica · 8 min
• Arch hold: 20 s
• Active hang: 30 s
• Hanging knee raise: 10 reps', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-12-19","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-12-19', -7101219, 'Tracción horizontal y front lever', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Test de L-sit · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Max L-sit: 3 × 35 s
• Max front lever hold: 3 × 35 s

Fuerza · Tracción horizontal · 22 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Ice cream maker: 5 × 2
• Straddle front lever row: 4 × 5', 'Fuerza · Accesorio y core · 10 min
• Strict toes to bar: 4 × 12
• Band face pull: 4 × 12', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-12-19","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-12-19', -7201219, 'Metcon', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    '20 min', '', 'EMOM · Muscle-up practice · 15 min
Calidad por encima de cantidad: salta el minuto si la transición se rompe.
• Assisted muscle-up transition: 3 reps
• Explosive pull up: 4 reps
• Parallel bar dips: 8 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-12-19","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-12-20', -7001220, 'Día de descanso', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-12-20","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-12-21', -7001221, 'Activación', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    '10 min', '', 'Movilidad · Empuje vertical · 10 min
• Quadruped thoracic rotation: 8 reps por lado
• Band dislocates: 15 reps
• Cat camel: 10 reps
• Wrist mobility on floor: 45 s', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-12-21","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-12-21', -7101221, 'Empuje vertical y handstand', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Test de handstand · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Max freestanding handstand hold: 3 × 20 s
• Strict HSPU: 3 × 2

Fuerza · Empuje vertical · 22 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Strict HSPU: 3 × 3
• Weighted ring dips: 2 × 6', 'Fuerza · Accesorio y core · 10 min
• Slow dead bug: 2 × 10
• Band Y raise: 2 × 10', 'Estira dorsales y pectoral 45 s por lado, más wrist mobility en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-12-21","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-12-21', -7201221, 'Metcon', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    '13 min', '', 'AMRAP · Park engine · 8 min
Ritmo constante: elige la progresión que te deje seguir sin parar.
• Australian pull up: 8 reps
• Push up: 10 reps
• Air squat: 15 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-12-21","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-12-22', -7001222, 'Activación', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    '10 min', '', 'Movilidad · Tracción vertical · 10 min
• Elbow and wrist mobility: 45 s
• Passive bar hang: 30 s
• Scapular slides on bar: 10 reps
• Supine thoracic rotation: 8 reps por lado', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-12-22","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-12-22', -7101222, 'Tracción vertical y muscle-up', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Test de muscle-up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Strict muscle-up: 3 × 2
• Weighted pull up: 3 × 2

Fuerza · Tracción vertical · 22 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Max weighted pull up: 3 × 3
• Weighted ring row: 2 × 6', 'Fuerza · Accesorio y core · 10 min
• One-arm band row: 2 × 10
• Plank shoulder tap: 2 × 10', 'Passive bar hang 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-12-22","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-12-22', -7201222, 'Metcon', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    '13 min', '', 'EMOM · Muscle-up practice · 8 min
Calidad por encima de cantidad: salta el minuto si la transición se rompe.
• Assisted muscle-up transition: 3 reps
• Explosive pull up: 4 reps
• Parallel bar dips: 8 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-12-22","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-12-23', -7001223, 'Día de descanso', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-12-23","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-12-24', -7001224, 'Activación', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    '10 min', '', 'Movilidad · Piernas y core · 10 min
• 90/90 hip mobility: 8 reps por lado
• Wall ankle mobility: 10 reps por lado
• Active hamstring stretch: 10 reps por lado
• Cossack squat: 8 reps por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-12-24","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-12-24', -7101224, 'Piernas, salto y core', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Test unilateral · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Max pistol squat: 4 intentos
• Nordic curl: 3 × 2

Fuerza · Piernas y core · 22 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Max weighted pistol squat: 3 × 3
• Nordic curl: 2 × 6', 'Fuerza · Accesorio y core · 10 min
• V-up: 2 × 10
• Single-leg glute bridge: 2 × 10', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-12-24","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-12-24', -7201224, 'Metcon', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    '17 min', '', 'For Time · Park chipper · Cap 12 min
Trabajo continuo de arriba abajo, sin repetir estación.
• Australian pull up: 40 reps
• Push up: 60 reps
• Air squat: 80 reps
• Hollow rock: 40 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-12-24","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-12-25', -7001225, 'Activación', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    '10 min', '', 'Movilidad · Empuje horizontal · 10 min
• Band dislocates: 15 reps
• Wall chest opener: 30 s por lado
• Plank scapular slide: 10 reps
• Quadruped thoracic rotation: 8 reps por lado', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-12-25","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-12-25', -7101225, 'Empuje horizontal y planche', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Test de planche · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Max advanced tuck planche: 3 × 20 s
• Tuck planche: 3 × 20 s

Fuerza · Empuje horizontal · 22 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Max weighted push up: 3 × 3
• Weighted ring dips: 2 × 6', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 2 × 10
• Paused push up plus: 2 × 10', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-12-25","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-12-25', -7201225, 'Metcon', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    '12 min', '', 'EMOM · Handstand engine · 7 min
Sube al invertido con control; si no llegas, sostén pike contra la pared.
• Wall handstand hold: 30 s
• Push up: 12 reps
• Hollow hold: 30 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-12-25","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-12-26', -7001226, 'Activación', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    '10 min', '', 'Movilidad · Tracción horizontal · 10 min
• Band dislocates: 15 reps
• Passive bar hang: 30 s
• Scapular slides on bar: 10 reps
• Cat camel: 10 reps', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-12-26","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-12-26', -7101226, 'Tracción horizontal y front lever', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Test de front lever · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Max front lever hold: 3 × 20 s
• Straddle front lever: 3 × 20 s

Fuerza · Tracción horizontal · 22 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Straddle front lever row: 3 × 3
• Max weighted ring row: 2 × 6', 'Fuerza · Accesorio y core · 10 min
• Ab wheel rollout: 2 × 10
• Band external rotation: 2 × 10', 'Passive bar hang 3 × 30 s, estiramiento de dorsal e isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-12-26","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-12-26', -7201226, 'Metcon', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    '14 min', '', 'Estaciones de tiempo · Leg engine · 9 min · 3 estaciones
Un minuto por estación y cinco vueltas, sin descanso entre estaciones.
• Air squat: 1 min
• Box step up: 1 min
• Single-leg glute bridge: 1 min', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-12-26","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-12-27', -7001227, 'Día de descanso', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-12-27","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-12-28', -7001228, 'Activación', 'Semana 53 · Mesociclo 13 · Realización y test · Descarga',
    '10 min', '', 'Movilidad · Empuje vertical · 10 min
• Doorway chest opener: 30 s por lado
• Wall slides: 12 reps
• Plank shoulder circles: 8 reps por lado
• Quadruped thoracic rotation: 8 reps por lado', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-12-28","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-12-28', -7101228, 'Empuje vertical y handstand', 'Semana 53 · Mesociclo 13 · Realización y test · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · HSPU libre · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Freestanding HSPU: 4 intentos
• Freestanding handstand hold: 3 × 20 s

Fuerza · Empuje vertical · 22 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Deficit HSPU: 3 × 3
• Weighted parallel bar dips: 2 × 6', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 2 × 30 s
• Ring triceps extension: 2 × 10', 'Passive bar hang 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-12-28","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-12-28', -7201228, 'Metcon', 'Semana 53 · Mesociclo 13 · Realización y test · Descarga',
    '16 min', '', 'Rounds For Time · Grin and bear · 3 rondas · Cap 11 min
Fragmenta las dominadas antes de llegar al fallo. Usa banda si hace falta y cambia el toes to bar por elevación de rodillas.
• Pull up: 5 reps
• Toes to bar: 8 reps
• Reverse lunge: 10 reps por lado', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-12-28","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-12-29', -7001229, 'Activación', 'Semana 53 · Mesociclo 13 · Realización y test · Descarga',
    '10 min', '', 'Movilidad · Tracción vertical · 10 min
• Cat camel: 10 reps
• Band dislocates: 15 reps
• Wall chest opener: 30 s por lado
• Elbow and wrist mobility: 45 s', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-12-29","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-12-29', -7101229, 'Tracción vertical y muscle-up', 'Semana 53 · Mesociclo 13 · Realización y test · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Test de dominadas · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Max strict pull up: 4 intentos
• Strict muscle-up: 3 × 2

Fuerza · Tracción vertical · 22 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Strict pull up to technical failure: 3 × 3
• Weighted pull up: 2 × 6', 'Fuerza · Accesorio y core · 10 min
• Ring biceps curl: 2 × 10
• Hollow hold: 2 × 30 s', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-12-29","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-12-29', -7201229, 'Metcon', 'Semana 53 · Mesociclo 13 · Realización y test · Descarga',
    '14 min', '', 'Estaciones de tiempo · Leg engine · 9 min · 3 estaciones
Un minuto por estación y cinco vueltas, sin descanso entre estaciones.
• Air squat: 1 min
• Box step up: 1 min
• Single-leg glute bridge: 1 min', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-12-29","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
    target_program, '2026-12-30', -7001230, 'Día de descanso', 'Semana 53 · Mesociclo 13 · Realización y test · Descarga',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-12-30","dayOrder":0,"kind":"rest"}'::jsonb, now()
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
    target_program, '2026-12-31', -7001231, 'Activación', 'Semana 53 · Mesociclo 13 · Realización y test · Descarga',
    '10 min', '', 'Movilidad · Piernas y core · 10 min
• Quadruped hip circles: 8 reps por lado
• Deep squat hold: 45 s
• Cat camel: 10 reps
• 90/90 hip mobility: 8 reps por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-12-31","dayOrder":0,"kind":"activation"}'::jsonb, now()
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
    target_program, '2026-12-31', -7101231, 'Piernas, salto y core', 'Semana 53 · Mesociclo 13 · Realización y test · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Test de salto · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Max vertical jump: 3 × 2
• Max broad jump: 3 × 2

Fuerza · Piernas y core · 22 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Weighted shrimp squat: 3 × 3
• Single-leg box jump: 2 × 6', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 2 × 30 s
• Single-leg calf raise: 2 × 10', 'Deep squat hold 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-12-31","dayOrder":1,"kind":"session"}'::jsonb, now()
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
    target_program, '2026-12-31', -7201231, 'Metcon', 'Semana 53 · Mesociclo 13 · Realización y test · Descarga',
    '15 min', '', 'Estaciones de tiempo · Park stations · 10 min · 4 estaciones
Un minuto por estación y cuatro vueltas, sin descanso entre estaciones.
• Australian pull up: 1 min
• Push up: 1 min
• Air squat: 1 min
• Front plank: 1 min', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-12-31","dayOrder":2,"kind":"metcon"}'::jsonb, now()
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
