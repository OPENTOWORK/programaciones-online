-- Programación anual de Calistenia generada por scripts/generate-calistenia-year.mjs
-- Parte 4 de 8 · 111 sesiones. Pega las partes en orden en el editor SQL de Supabase.
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
    target_program, '2026-05-18', -7000518, 'Activación', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Doorway chest opener: 30 s por lado
• Wall slides: 12 reps
• Plank shoulder circles: 8 reps por lado

Activación · Preparación específica · 8 min
• Push up plus: 10 reps
• Band pull apart: 15 reps
• Hollow hold: 30 s', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-05-18","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-18', -7100518, 'Empuje vertical y handstand', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Kick up y parada · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Freestanding kick up: 6 intentos
• Chest-to-wall handstand: 4 × 25 s

Fuerza · Empuje vertical · 26 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Wall HSPU to pads: 4 × 6
• Weighted parallel bar dips: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 30 s
• Ring triceps extension: 3 × 12', 'Estiramiento de tríceps sobre la cabeza, seated shoulder bridge y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-05-18","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-18', -7200518, 'Metcon', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    '23 min', '', 'For Time · Park chipper · Cap 18 min
Trabajo continuo de arriba abajo, sin repetir estación.
• Australian pull up: 40 reps
• Push up: 60 reps
• Air squat: 80 reps
• Hollow rock: 40 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-05-18","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-19', -7000519, 'Activación', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Cat camel: 10 reps
• Band dislocates: 15 reps
• Wall chest opener: 30 s por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Band pull apart: 15 reps
• Band external rotation: 12 reps por lado', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-05-19","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-19', -7100519, 'Tracción vertical y muscle-up', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Muscle-up asistido · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Band-assisted muscle-up: 4 × 4
• Explosive pull up: 4 × 4

Fuerza · Tracción vertical · 26 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Strict pull up with top pause: 4 × 6
• Feet-elevated ring row: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Ring biceps curl: 3 × 12
• Hollow hold: 3 × 30 s', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-05-19","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-19', -7200519, 'Metcon', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    '18 min', '', 'EMOM · Muscle-up practice · 13 min
Calidad por encima de cantidad: salta el minuto si la transición se rompe.
• Assisted muscle-up transition: 3 reps
• Explosive pull up: 4 reps
• Parallel bar dips: 8 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-05-19","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-20', -7000520, 'Día de descanso', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-05-20","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-21', -7000521, 'Activación', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Quadruped hip circles: 8 reps por lado
• Deep squat hold: 45 s
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Glute bridge: 15 reps
• Light jump lunge: 8 reps por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-05-21","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-21', -7100521, 'Piernas, salto y core', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Salto y aterrizaje · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Box jump: 4 × 4
• Pistol squat: 4 × 4

Fuerza · Piernas y core · 26 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Shrimp squat: 4 × 6
• Weighted single-leg Romanian deadlift: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 30 s
• Single-leg calf raise: 3 × 12', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-05-21","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-21', -7200521, 'Metcon', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    '21 min', '', 'Ladder · Reverse ladder · 10-9-8-7-6-5-4-3-2-1 · Cap 16 min
Bajas repeticiones en un movimiento mientras subes en el otro.
• Pull up: reps descendentes del esquema
• Bench dips: reps ascendentes del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-05-21","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-22', -7000522, 'Activación', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Cat camel: 10 reps
• Wrist mobility on floor: 45 s
• Seated shoulder bridge: 10 reps

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Push up plus: 10 reps
• Band face pull: 15 reps', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-05-22","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-22', -7100522, 'Empuje horizontal y planche', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Planche en anillas · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Ring tuck planche: 4 × 25 s
• Floor planche lean: 4 × 25 s

Fuerza · Empuje horizontal · 26 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Tempo archer push up: 4 × 6
• Weighted push up: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Ring triceps extension: 3 × 12
• Hollow hold: 3 × 30 s', 'Rodillo en pectoral y dorsal, seated shoulder bridge y 2 min de respiración diafragmática.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-05-22","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-22', -7200522, 'Metcon', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    '21 min', '', 'AMRAP · Park sunrise · 16 min
Ritmo conversacional: el objetivo es acabar mejor de lo que empiezas. Vale carrera o comba.
• Run: 200 m
• Australian pull up: 10 reps
• Push up: 15 reps
• Air squat: 20 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-05-22","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-23', -7000523, 'Activación', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• 90/90 hip mobility: 8 reps por lado
• Supine thoracic rotation: 8 reps por lado
• Wall chest opener: 30 s por lado

Activación · Preparación específica · 8 min
• Hanging knee raise: 10 reps
• Hollow hold: 30 s
• Slow dead bug: 10 reps por lado', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-05-23","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-23', -7100523, 'Tracción horizontal y front lever', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Front lever a una pierna · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• One-leg front lever: 4 × 25 s
• Tuck front lever raise: 4 × 4

Fuerza · Tracción horizontal · 26 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• 2 s paused ring row: 4 × 6
• Weighted ring row: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Parallette L-sit: 3 × 30 s
• Ring biceps curl: 3 × 12', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-05-23","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-23', -7200523, 'Metcon', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    '18 min', '', 'AMRAP · Park engine · 13 min
Ritmo constante: elige la progresión que te deje seguir sin parar.
• Australian pull up: 8 reps
• Push up: 10 reps
• Air squat: 15 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-05-23","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-24', -7000524, 'Día de descanso', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-05-24","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-25', -7000525, 'Activación', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Cat camel: 10 reps
• Wrist mobility on floor: 45 s
• Seated shoulder bridge: 10 reps

Activación · Preparación específica · 8 min
• Band Y raise: 12 reps
• Band face pull: 15 reps
• Slow wall walk: 3 reps', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-05-25","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-25', -7100525, 'Empuje vertical y handstand', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Equilibrio activo · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall handstand shoulder taps: 5 × 4
• Freestanding handstand hold: 8 intentos

Fuerza · Empuje vertical · 26 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Wall HSPU negative: 5 × 5
• Weighted parallel bar dips: 4 × 10', 'Fuerza · Accesorio y core · 10 min
• Alternating hollow and arch: 4 × 12
• Feet-elevated bench dips: 4 × 12', 'Estira dorsales y pectoral 45 s por lado, más wrist mobility en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-05-25","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-25', -7200525, 'Metcon', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    '21 min', '', 'EMOM · Pull EMOM · 16 min
Un movimiento por minuto, rotando siempre en el mismo orden. Usa banda en las dominadas si hace falta.
• Pull up: 4 reps
• Australian pull up: 8 reps
• Hanging knee raise: 10 reps
• Active hang: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-05-25","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-26', -7000526, 'Activación', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Scapular slides on bar: 10 reps
• Supine thoracic rotation: 8 reps por lado
• Seated shoulder bridge: 10 reps

Activación · Preparación específica · 8 min
• Band face pull: 15 reps
• Band row: 15 reps
• Arch hold: 20 s', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-05-26","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-26', -7100526, 'Tracción vertical y muscle-up', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Transición de muscle-up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Low ring muscle-up transition: 5 × 4
• Sternum pull up: 5 × 4

Fuerza · Tracción vertical · 26 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Weighted pull up: 5 × 5
• Weighted ring row: 4 × 10', 'Fuerza · Accesorio y core · 10 min
• Band face pull: 4 × 12
• Hanging knee raise: 4 × 12', 'Passive bar hang 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-05-26","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-26', -7200526, 'Metcon', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    '20 min', '', 'Estaciones de tiempo · Leg engine · 15 min · 3 estaciones
Un minuto por estación y cinco vueltas, sin descanso entre estaciones.
• Air squat: 1 min
• Box step up: 1 min
• Single-leg glute bridge: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-05-26","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-27', -7000527, 'Día de descanso', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-05-27","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-28', -7000528, 'Activación', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Active hamstring stretch: 10 reps por lado
• Cossack squat: 8 reps por lado
• Single-leg glute bridge: 10 reps por lado

Activación · Preparación específica · 8 min
• Wall sit: 30 s
• Single-leg calf raise: 15 reps por lado
• Side plank: 30 s por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-05-28","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-28', -7100528, 'Piernas, salto y core', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Pistol completo · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pistol squat: 5 × 4
• Shrimp squat: 5 × 4

Fuerza · Piernas y core · 26 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Pistol squat: 5 × 5
• Nordic curl negative: 4 × 10', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 4 × 12
• Slow dead bug: 4 × 12', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-05-28","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-28', -7200528, 'Metcon', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    '21 min', '', 'AMRAP · I go you go · 16 min
En solitario se hace con 40 s de trabajo y 20 s de pausa por movimiento.
• Australian pull up: 40 s
• Push up: 40 s
• Jump squat: 40 s
• Hollow hold: 40 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-05-28","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-29', -7000529, 'Activación', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Plank scapular slide: 10 reps
• Quadruped thoracic rotation: 8 reps por lado
• Band elbow mobility: 12 reps

Activación · Preparación específica · 8 min
• Planche lean: 20 s
• Hollow hold: 30 s
• Slow dead bug: 10 reps por lado', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-05-29","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-29', -7100529, 'Empuje horizontal y planche', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Tuck planche · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck planche: 5 × 25 s
• Parallette planche lean: 5 × 25 s

Fuerza · Empuje horizontal · 26 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Weighted push up: 5 × 5
• Ring dips: 4 × 10', 'Fuerza · Accesorio y core · 10 min
• Plank shoulder tap: 4 × 12
• Band face pull: 4 × 12', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-05-29","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-29', -7200529, 'Metcon', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    '17 min', '', 'Ladder · Core ladder · 5-10-15-20 · Cap 12 min
Sube el número de repeticiones en cada bloque sin perder la posición lumbar.
• Hollow rock: reps del esquema
• V-up: reps del esquema
• Side plank: 15 s por lado entre bloques', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-05-29","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-30', -7000530, 'Activación', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Scapular slides on bar: 10 reps
• Cat camel: 10 reps
• Active hamstring stretch: 10 reps por lado

Activación · Preparación específica · 8 min
• Band face pull: 15 reps
• Arch hold: 20 s
• Active hang: 30 s', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-05-30","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-30', -7100530, 'Tracción horizontal y front lever', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Advanced tuck front lever · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Advanced tuck front lever: 5 × 25 s
• Advanced tuck front lever raise: 5 × 4

Fuerza · Tracción horizontal · 26 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Weighted ring row: 5 × 5
• Weighted Australian pull up: 4 × 10', 'Fuerza · Accesorio y core · 10 min
• Hanging knee raise: 4 × 12
• Arch hold: 4 × 35 s', 'Passive bar hang 3 × 30 s, estiramiento de dorsal e isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-05-30","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-30', -7200530, 'Metcon', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    '23 min', '', 'Rounds For Time · Grin and bear · 5 rondas · Cap 18 min
Fragmenta las dominadas antes de llegar al fallo. Usa banda si hace falta y cambia el toes to bar por elevación de rodillas.
• Pull up: 5 reps
• Toes to bar: 8 reps
• Reverse lunge: 10 reps por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-05-30","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-31', -7000531, 'Día de descanso', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-05-31","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-01', -7000601, 'Activación', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Plank shoulder circles: 8 reps por lado
• Quadruped thoracic rotation: 8 reps por lado
• Band dislocates: 15 reps

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Wall pike hold: 30 s
• Scapular push up: 12 reps', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-06-01","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-01', -7100601, 'Empuje vertical y handstand', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Fuerza en invertido · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall HSPU negative: 5 × 5
• Chest-to-wall handstand: 5 × 30 s

Fuerza · Empuje vertical · 26 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Deficit pike push up: 5 × 4
• Ring dips: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 4 × 15
• Band face pull: 4 × 15', 'Passive bar hang 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-06-01","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-01', -7200601, 'Metcon', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    '18 min', '', 'AMRAP · Bodyweight legs · 13 min
Aterriza suave en los saltos y mantén el pecho alto en las zancadas.
• Air squat: 20 reps
• Jump lunge: 10 reps por lado
• Box jump: 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-06-01","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-02', -7000602, 'Activación', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Wall chest opener: 30 s por lado
• Elbow and wrist mobility: 45 s
• Passive bar hang: 30 s

Activación · Preparación específica · 8 min
• Band external rotation: 12 reps por lado
• Active hang: 30 s
• Scapular pull up: 10 reps', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-06-02","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-02', -7100602, 'Tracción vertical y muscle-up', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Dominada lastrada · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Weighted pull up: 5 × 5
• 5 s pull up negative: 5 × 5

Fuerza · Tracción vertical · 26 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Weighted close-grip pull up: 5 × 4
• Weighted Australian pull up: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Band external rotation: 4 × 15
• Arch hold: 4 × 40 s', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-06-02","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-02', -7200602, 'Metcon', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    '25 min', '', 'AMRAP · Park sunrise · 20 min
Ritmo conversacional: el objetivo es acabar mejor de lo que empiezas. Vale carrera o comba.
• Run: 200 m
• Australian pull up: 10 reps
• Push up: 15 reps
• Air squat: 20 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-06-02","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-03', -7000603, 'Día de descanso', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-06-03","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-04', -7000604, 'Activación', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Cat camel: 10 reps
• 90/90 hip mobility: 8 reps por lado
• Wall ankle mobility: 10 reps por lado

Activación · Preparación específica · 8 min
• Light jump lunge: 8 reps por lado
• Slow dead bug: 10 reps por lado
• Band monster walk: 12 pasos por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-06-04","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-04', -7100604, 'Piernas, salto y core', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Nordic curl · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Nordic curl negative: 5 × 5
• Weighted Bulgarian split squat: 5 × 5

Fuerza · Piernas y core · 26 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Weighted Bulgarian split squat: 5 × 4
• Weighted single-leg glute bridge: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Hanging knee raise: 4 × 15
• Copenhagen plank: 4 × 40 s', 'Deep squat hold 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-06-04","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-04', -7200604, 'Metcon', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    '16 min', '', 'For Time · Floor sprint · Cap 11 min
Es corto: entra fuerte y aguanta el ritmo hasta el final.
• Push up: 50 reps
• Hollow rock: 50 reps
• Plank shoulder tap: 50 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-06-04","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-05', -7000605, 'Activación', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Seated shoulder bridge: 10 reps
• Band dislocates: 15 reps
• Wall chest opener: 30 s por lado

Activación · Preparación específica · 8 min
• Band face pull: 15 reps
• Plank shoulder tap: 10 reps por lado
• Scapular push up: 12 reps', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-06-05","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-05', -7100605, 'Empuje horizontal y planche', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Pseudo planche push up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pseudo planche push up: 5 × 5
• Band-assisted tuck planche: 5 × 30 s

Fuerza · Empuje horizontal · 26 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Ring push up with turnout: 5 × 4
• Weighted parallel bar dips: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Ab wheel rollout: 4 × 15
• Band Y raise: 4 × 15', 'Apertura de pectoral en pared, passive bar hang 3 × 30 s y wrist mobility. 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-06-05","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-05', -7200605, 'Metcon', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    '23 min', '', 'For Time · Endurance test · Cap 18 min
Anota el tiempo: este metcon se repite al final de cada fase para comparar.
• Pull up: 25 reps
• Push up: 50 reps
• Air squat: 75 reps
• Hollow rock: 100 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-06-05","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-06', -7000606, 'Activación', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Wall chest opener: 30 s por lado
• Band dislocates: 15 reps
• Passive bar hang: 30 s

Activación · Preparación específica · 8 min
• Slow dead bug: 10 reps por lado
• Band row: 15 reps
• Scapular pull up: 10 reps', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-06-06","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-06', -7100606, 'Tracción horizontal y front lever', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Negativas de front lever · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• 5 s front lever negative: 5 × 5
• Advanced tuck front lever: 5 × 30 s

Fuerza · Tracción horizontal · 26 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Assisted one-arm ring row: 5 × 4
• Sternum ring row: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Strict toes to bar: 4 × 15
• Band face pull: 4 × 15', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-06-06","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-06', -7200606, 'Metcon', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    '20 min', '', 'Ladder · Push ladder · 21-15-9 · Cap 15 min
Si las flexiones se rompen, sube las manos a un cajón.
• Push up: reps del esquema
• Air squat: reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-06-06","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-07', -7000607, 'Día de descanso', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-06-07","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-08', -7000608, 'Activación', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    '10 min', '', 'Movilidad · Empuje vertical · 10 min
• Seated shoulder bridge: 10 reps
• Doorway chest opener: 30 s por lado
• Wall slides: 12 reps
• Plank shoulder circles: 8 reps por lado', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-06-08","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-08', -7100608, 'Empuje vertical y handstand', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Kick up y parada · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Freestanding kick up: 4 intentos
• Chest-to-wall handstand: 3 × 20 s

Fuerza · Empuje vertical · 26 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Wall HSPU to pads: 3 × 5
• Weighted parallel bar dips: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Slow dead bug: 2 × 12
• Band Y raise: 2 × 12', 'Estiramiento de tríceps sobre la cabeza, seated shoulder bridge y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-06-08","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-08', -7200608, 'Metcon', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    '15 min', '', 'Rounds For Time · Bodyweight complex · 4 rondas · Cap 10 min
La ronda es un complex seguido: una dominada, dos flexiones y tres sentadillas sin parar.
• Pull up: 1 rep
• Push up: 2 reps
• Air squat: 3 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-06-08","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-09', -7000609, 'Activación', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    '10 min', '', 'Movilidad · Tracción vertical · 10 min
• Seated shoulder bridge: 10 reps
• Cat camel: 10 reps
• Band dislocates: 15 reps
• Wall chest opener: 30 s por lado', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-06-09","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-09', -7100609, 'Tracción vertical y muscle-up', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Muscle-up asistido · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Band-assisted muscle-up: 3 × 4
• Explosive pull up: 3 × 4

Fuerza · Tracción vertical · 26 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Strict pull up with top pause: 3 × 5
• Feet-elevated ring row: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• One-arm band row: 2 × 12
• Plank shoulder tap: 2 × 12', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-06-09","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-09', -7200609, 'Metcon', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    '14 min', '', 'Rounds For Time · Rings and floor · 3 rondas · Cap 9 min
Alterna anillas y suelo para repartir la fatiga del hombro.
• Ring row: 12 reps
• Push up: 15 reps
• Ring support hold: 30 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-06-09","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-10', -7000610, 'Día de descanso', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-06-10","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-11', -7000611, 'Activación', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    '10 min', '', 'Movilidad · Piernas y core · 10 min
• Single-leg glute bridge: 10 reps por lado
• Quadruped hip circles: 8 reps por lado
• Deep squat hold: 45 s
• Cat camel: 10 reps', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-06-11","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-11', -7100611, 'Piernas, salto y core', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Salto y aterrizaje · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Box jump: 3 × 4
• Pistol squat: 3 × 4

Fuerza · Piernas y core · 26 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Shrimp squat: 3 × 5
• Weighted single-leg Romanian deadlift: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• V-up: 2 × 12
• Single-leg glute bridge: 2 × 12', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-06-11","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-11', -7200611, 'Metcon', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    '13 min', '', 'EMOM · Front lever engine · 8 min
Elige la progresión de lever que puedas sostener 10 s limpios.
• Tuck front lever: 15 s
• Australian pull up: 10 reps
• Hollow rock: 20 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-06-11","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-12', -7000612, 'Activación', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    '10 min', '', 'Movilidad · Empuje horizontal · 10 min
• Band elbow mobility: 12 reps
• Cat camel: 10 reps
• Wrist mobility on floor: 45 s
• Seated shoulder bridge: 10 reps', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-06-12","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-12', -7100612, 'Empuje horizontal y planche', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Planche en anillas · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Ring tuck planche: 3 × 20 s
• Floor planche lean: 3 × 20 s

Fuerza · Empuje horizontal · 26 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Tempo archer push up: 3 × 5
• Weighted push up: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 2 × 12
• Paused push up plus: 2 × 12', 'Rodillo en pectoral y dorsal, seated shoulder bridge y 2 min de respiración diafragmática.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-06-12","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-12', -7200612, 'Metcon', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    '11 min', '', 'AMRAP · Active recovery · 6 min
Ritmo suave, respirando por la nariz de principio a fin.
• Active hang: 30 s
• Push up: 8 reps
• Air squat: 12 reps
• Slow dead bug: 10 reps por lado', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-06-12","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-13', -7000613, 'Activación', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    '10 min', '', 'Movilidad · Tracción horizontal · 10 min
• Active hamstring stretch: 10 reps por lado
• 90/90 hip mobility: 8 reps por lado
• Supine thoracic rotation: 8 reps por lado
• Wall chest opener: 30 s por lado', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-06-13","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-13', -7100613, 'Tracción horizontal y front lever', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Front lever a una pierna · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• One-leg front lever: 3 × 20 s
• Tuck front lever raise: 3 × 4

Fuerza · Tracción horizontal · 26 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• 2 s paused ring row: 3 × 5
• Weighted ring row: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Ab wheel rollout: 2 × 12
• Band external rotation: 2 × 12', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-06-13","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-13', -7200613, 'Metcon', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    '11 min', '', 'Tabata · Core tabata · 5 rondas
Alterna ejercicio en cada ronda: 20 s de trabajo y 10 s de pausa, cambiando de lado en la plancha.
• Hollow hold: 20 s
• Side plank: 20 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-06-13","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-14', -7000614, 'Día de descanso', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-06-14","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-15', -7000615, 'Activación', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Band dislocates: 15 reps
• Seated shoulder bridge: 10 reps
• Plank shoulder circles: 8 reps por lado

Activación · Preparación específica · 8 min
• Scapular push up: 12 reps
• Slow wall walk: 3 reps
• Hollow hold: 30 s', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-06-15","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-15', -7100615, 'Empuje vertical y handstand', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Equilibrio activo · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall handstand shoulder taps: 4 × 4
• Freestanding handstand hold: 6 intentos

Fuerza · Empuje vertical · 26 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Wall HSPU negative: 4 × 6
• Weighted parallel bar dips: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 30 s
• Ring triceps extension: 3 × 12', 'Estira dorsales y pectoral 45 s por lado, más wrist mobility en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-06-15","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-15', -7200615, 'Metcon', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    '21 min', '', 'For Time · Buy in and buy out · Cap 16 min
Entras y sales con la misma tarea: administra el ritmo del bloque central. Sin sitio para correr, cambia los 400 m por 60 mountain climber.
• Buy in run: 400 m
• Australian pull up: 30 reps
• Push up: 40 reps
• Buy out run: 400 m', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-06-15","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-16', -7000616, 'Activación', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Passive bar hang: 30 s
• Seated shoulder bridge: 10 reps
• Wall chest opener: 30 s por lado

Activación · Preparación específica · 8 min
• Scapular pull up: 10 reps
• Arch hold: 20 s
• Band external rotation: 12 reps por lado', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-06-16","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-16', -7100616, 'Tracción vertical y muscle-up', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Transición de muscle-up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Low ring muscle-up transition: 4 × 4
• Sternum pull up: 4 × 4

Fuerza · Tracción vertical · 26 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Weighted pull up: 4 × 6
• Weighted ring row: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Ring biceps curl: 3 × 12
• Hollow hold: 3 × 30 s', 'Passive bar hang 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-06-16","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-16', -7200616, 'Metcon', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    '16 min', '', 'EMOM · Jump and bar · 11 min
Un movimiento por minuto: mantén la calidad del salto en las últimas rondas.
• Box jump: 10 reps
• Pull up: 5 reps
• Jump squat: 15 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-06-16","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-17', -7000617, 'Día de descanso', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-06-17","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-18', -7000618, 'Activación', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Wall ankle mobility: 10 reps por lado
• Single-leg glute bridge: 10 reps por lado
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Band monster walk: 12 pasos por lado
• Side plank: 30 s por lado
• Light jump lunge: 8 reps por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-06-18","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-18', -7100618, 'Piernas, salto y core', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Pistol completo · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pistol squat: 4 × 4
• Shrimp squat: 4 × 4

Fuerza · Piernas y core · 26 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Pistol squat: 4 × 6
• Nordic curl negative: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 30 s
• Single-leg calf raise: 3 × 12', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-06-18","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-18', -7200618, 'Metcon', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    '14 min', '', 'Unbroken · Bar hang challenge · 9 min
Cada bloque empieza colgado: si sueltas, descansas un minuto y sigues.
• Active hang: 5 series de 45 s
• Hanging knee raise: 5 series de 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-06-18","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-19', -7000619, 'Activación', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Wall chest opener: 30 s por lado
• Band elbow mobility: 12 reps
• Seated shoulder bridge: 10 reps

Activación · Preparación específica · 8 min
• Scapular push up: 12 reps
• Slow dead bug: 10 reps por lado
• Band face pull: 15 reps', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-06-19","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-19', -7100619, 'Empuje horizontal y planche', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Tuck planche · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck planche: 4 × 25 s
• Parallette planche lean: 4 × 25 s

Fuerza · Empuje horizontal · 26 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Weighted push up: 4 × 6
• Ring dips: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Ring triceps extension: 3 × 12
• Hollow hold: 3 × 30 s', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-06-19","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-19', -7200619, 'Metcon', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    '19 min', '', 'Estaciones de tiempo · Pull stations · 14 min · 4 estaciones
Un minuto por estación y cuatro vueltas, cambiando sin pausa.
• Pull up: 1 min
• Australian pull up: 1 min
• Hanging knee raise: 1 min
• Active hang: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-06-19","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-20', -7000620, 'Activación', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Passive bar hang: 30 s
• Active hamstring stretch: 10 reps por lado
• Wall chest opener: 30 s por lado

Activación · Preparación específica · 8 min
• Scapular pull up: 10 reps
• Active hang: 30 s
• Slow dead bug: 10 reps por lado', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-06-20","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-20', -7100620, 'Tracción horizontal y front lever', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Advanced tuck front lever · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Advanced tuck front lever: 4 × 25 s
• Advanced tuck front lever raise: 4 × 4

Fuerza · Tracción horizontal · 26 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Weighted ring row: 4 × 6
• Weighted Australian pull up: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Parallette L-sit: 3 × 30 s
• Ring biceps curl: 3 × 12', 'Passive bar hang 3 × 30 s, estiramiento de dorsal e isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-06-20","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-20', -7200620, 'Metcon', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    '19 min', '', 'Estaciones de tiempo · Park stations · 14 min · 4 estaciones
Un minuto por estación y cuatro vueltas, sin descanso entre estaciones.
• Australian pull up: 1 min
• Push up: 1 min
• Air squat: 1 min
• Front plank: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-06-20","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-21', -7000621, 'Día de descanso', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-06-21","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-22', -7000622, 'Activación', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Wall slides: 12 reps
• Band dislocates: 15 reps
• Seated shoulder bridge: 10 reps

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Scapular push up: 12 reps
• Slow wall walk: 3 reps', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-06-22","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-22', -7100622, 'Empuje vertical y handstand', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Fuerza en invertido · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall HSPU negative: 5 × 4
• Chest-to-wall handstand: 5 × 25 s

Fuerza · Empuje vertical · 26 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Deficit pike push up: 5 × 5
• Ring dips: 4 × 10', 'Fuerza · Accesorio y core · 10 min
• Alternating hollow and arch: 4 × 12
• Feet-elevated bench dips: 4 × 12', 'Passive bar hang 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-06-22","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-22', -7200622, 'Metcon', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    '20 min', '', 'AMRAP · Ring engine · 15 min
Las anillas mandan: mantén los codos pegados y el cuerpo en tensión.
• Ring row: 10 reps
• Assisted ring dips: 8 reps
• Ring support hold: 20 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-06-22","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-23', -7000623, 'Activación', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Band dislocates: 15 reps
• Passive bar hang: 30 s
• Seated shoulder bridge: 10 reps

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Scapular pull up: 10 reps
• Arch hold: 20 s', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-06-23","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-23', -7100623, 'Tracción vertical y muscle-up', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Dominada lastrada · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Weighted pull up: 5 × 4
• 5 s pull up negative: 5 × 4

Fuerza · Tracción vertical · 26 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Weighted close-grip pull up: 5 × 5
• Weighted Australian pull up: 4 × 10', 'Fuerza · Accesorio y core · 10 min
• Band face pull: 4 × 12
• Hanging knee raise: 4 × 12', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-06-23","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-23', -7200623, 'Metcon', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    '13 min', '', 'Tabata · Leg tabata · 8 rondas
Alterna movimiento en cada ronda: 20 s de trabajo y 10 s de pausa.
• Jump squat: 20 s
• Jump lunge: 20 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-06-23","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-24', -7000624, 'Día de descanso', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-06-24","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-25', -7000625, 'Activación', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Deep squat hold: 45 s
• Wall ankle mobility: 10 reps por lado
• Single-leg glute bridge: 10 reps por lado

Activación · Preparación específica · 8 min
• Glute bridge: 15 reps
• Band monster walk: 12 pasos por lado
• Side plank: 30 s por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-06-25","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-25', -7100625, 'Piernas, salto y core', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Nordic curl · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Nordic curl negative: 5 × 4
• Weighted Bulgarian split squat: 5 × 4

Fuerza · Piernas y core · 26 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Weighted Bulgarian split squat: 5 × 5
• Weighted single-leg glute bridge: 4 × 10', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 4 × 12
• Slow dead bug: 4 × 12', 'Deep squat hold 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-06-25","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-25', -7200625, 'Metcon', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    '22 min', '', 'Rounds For Time · Pike and pistol · 5 rondas · Cap 17 min
Alterna piernas en el pistol y controla la bajada del pike.
• Pike push up: 8 reps
• Assisted pistol squat: 5 reps por lado
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-06-25","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-26', -7000626, 'Activación', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Wrist mobility on floor: 45 s
• Wall chest opener: 30 s por lado
• Band elbow mobility: 12 reps

Activación · Preparación específica · 8 min
• Push up plus: 10 reps
• Scapular push up: 12 reps
• Slow dead bug: 10 reps por lado', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-06-26","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-26', -7100626, 'Empuje horizontal y planche', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Pseudo planche push up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pseudo planche push up: 5 × 4
• Band-assisted tuck planche: 5 × 25 s

Fuerza · Empuje horizontal · 26 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Ring push up with turnout: 5 × 5
• Weighted parallel bar dips: 4 × 10', 'Fuerza · Accesorio y core · 10 min
• Plank shoulder tap: 4 × 12
• Band face pull: 4 × 12', 'Apertura de pectoral en pared, passive bar hang 3 × 30 s y wrist mobility. 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-06-26","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-26', -7200626, 'Metcon', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    '17 min', '', 'EMOM · Death by burpee · 12 min
Minuto 1 una repetición, minuto 2 dos, y así hasta que no llegues a tiempo.
• Burpee: 1 rep acumulativa por minuto', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-06-26","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-27', -7000627, 'Activación', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Supine thoracic rotation: 8 reps por lado
• Passive bar hang: 30 s
• Active hamstring stretch: 10 reps por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Scapular pull up: 10 reps
• Active hang: 30 s', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-06-27","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-27', -7100627, 'Tracción horizontal y front lever', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Negativas de front lever · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• 5 s front lever negative: 5 × 4
• Advanced tuck front lever: 5 × 25 s

Fuerza · Tracción horizontal · 26 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Assisted one-arm ring row: 5 × 5
• Sternum ring row: 4 × 10', 'Fuerza · Accesorio y core · 10 min
• Hanging knee raise: 4 × 12
• Arch hold: 4 × 35 s', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-06-27","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-27', -7200627, 'Metcon', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    '21 min', '', 'EMOM · Push EMOM · 16 min
Un movimiento por minuto, rotando siempre en el mismo orden.
• Pike push up: 6 reps
• Push up: 12 reps
• Bench dips: 10 reps
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-06-27","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-28', -7000628, 'Día de descanso', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-06-28","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-29', -7000629, 'Activación', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Wrist mobility on floor: 45 s
• Wall slides: 12 reps
• Band dislocates: 15 reps

Activación · Preparación específica · 8 min
• Band face pull: 15 reps
• Band pull apart: 15 reps
• Scapular push up: 12 reps', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-06-29","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-29', -7100629, 'Empuje vertical y handstand', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Kick up y parada · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Freestanding kick up: 10 intentos
• Chest-to-wall handstand: 5 × 30 s

Fuerza · Empuje vertical · 26 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Wall HSPU to pads: 5 × 4
• Weighted parallel bar dips: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 4 × 15
• Band face pull: 4 × 15', 'Estiramiento de tríceps sobre la cabeza, seated shoulder bridge y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-06-29","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-29', -7200629, 'Metcon', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    '23 min', '', 'Rounds For Time · Lunge and bar · 4 rondas · Cap 18 min
Zancadas sin apoyar la rodilla y dominadas fragmentadas desde la primera ronda.
• Walking lunge: 20 reps
• Pull up: 6 reps
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-06-29","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-30', -7000630, 'Activación', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Supine thoracic rotation: 8 reps por lado
• Band dislocates: 15 reps
• Passive bar hang: 30 s

Activación · Preparación específica · 8 min
• Band row: 15 reps
• Band pull apart: 15 reps
• Scapular pull up: 10 reps', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-06-30","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-30', -7100630, 'Tracción vertical y muscle-up', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Muscle-up asistido · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Band-assisted muscle-up: 5 × 5
• Explosive pull up: 5 × 5

Fuerza · Tracción vertical · 26 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Strict pull up with top pause: 5 × 4
• Feet-elevated ring row: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Band external rotation: 4 × 15
• Arch hold: 4 × 40 s', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-06-30","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-06-30', -7200630, 'Metcon', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    '20 min', '', 'For Time · Mesocycle finisher · Cap 15 min
Última sesión del bloque: registra el tiempo para comparar con el siguiente mesociclo.
• Australian pull up: 30 reps
• Push up: 45 reps
• Reverse lunge: 30 reps por lado
• Hollow rock: 60 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-06-30","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-01', -7000701, 'Día de descanso', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-07-01","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-02', -7000702, 'Activación', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Cossack squat: 8 reps por lado
• Deep squat hold: 45 s
• Wall ankle mobility: 10 reps por lado

Activación · Preparación específica · 8 min
• Single-leg calf raise: 15 reps por lado
• Glute bridge: 15 reps
• Band monster walk: 12 pasos por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-07-02","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-02', -7100702, 'Piernas, salto y core', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Salto y aterrizaje · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Box jump: 5 × 5
• Pistol squat: 5 × 5

Fuerza · Piernas y core · 26 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Shrimp squat: 5 × 4
• Weighted single-leg Romanian deadlift: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Hanging knee raise: 4 × 15
• Copenhagen plank: 4 × 40 s', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-07-02","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
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
