-- Programación anual de Calistenia generada por scripts/generate-calistenia-year.mjs
-- Parte 5 de 8 · 111 sesiones. Pega las partes en orden en el editor SQL de Supabase.
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
    target_program, '2026-07-02', -7200702, 'Metcon', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    '23 min', '', 'For Time · Endurance test · Cap 18 min
Anota el tiempo: este metcon se repite al final de cada fase para comparar.
• Pull up: 25 reps
• Push up: 50 reps
• Air squat: 75 reps
• Hollow rock: 100 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-07-02","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-03', -7000703, 'Activación', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Quadruped thoracic rotation: 8 reps por lado
• Wrist mobility on floor: 45 s
• Wall chest opener: 30 s por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Push up plus: 10 reps
• Scapular push up: 12 reps', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-07-03","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-03', -7100703, 'Empuje horizontal y planche', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Planche en anillas · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Ring tuck planche: 5 × 30 s
• Floor planche lean: 5 × 30 s

Fuerza · Empuje horizontal · 26 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Tempo archer push up: 5 × 4
• Weighted push up: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Ab wheel rollout: 4 × 15
• Band Y raise: 4 × 15', 'Rodillo en pectoral y dorsal, seated shoulder bridge y 2 min de respiración diafragmática.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-07-03","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-03', -7200703, 'Metcon', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    '18 min', '', 'AMRAP · Hollow to bar · 13 min
Mantén la pelvis retrovertida en todo el trabajo de core.
• Hollow rock: 20 reps
• Australian pull up: 10 reps
• Plank shoulder tap: 20 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-07-03","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-04', -7000704, 'Activación', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Cat camel: 10 reps
• Supine thoracic rotation: 8 reps por lado
• Passive bar hang: 30 s

Activación · Preparación específica · 8 min
• Arch hold: 20 s
• Hollow hold: 30 s
• Scapular pull up: 10 reps', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-07-04","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-04', -7100704, 'Tracción horizontal y front lever', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Front lever a una pierna · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• One-leg front lever: 5 × 30 s
• Tuck front lever raise: 5 × 5

Fuerza · Tracción horizontal · 26 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• 2 s paused ring row: 5 × 4
• Weighted ring row: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Strict toes to bar: 4 × 15
• Band face pull: 4 × 15', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-07-04","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-04', -7200704, 'Metcon', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    '18 min', '', 'AMRAP · Bodyweight legs · 13 min
Aterriza suave en los saltos y mantén el pecho alto en las zancadas.
• Air squat: 20 reps
• Jump lunge: 10 reps por lado
• Box jump: 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-07-04","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-05', -7000705, 'Día de descanso', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-07-05","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-06', -7000706, 'Activación', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    '10 min', '', 'Movilidad · Empuje vertical · 10 min
• Quadruped thoracic rotation: 8 reps por lado
• Wrist mobility on floor: 45 s
• Wall slides: 12 reps
• Band dislocates: 15 reps', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-07-06","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-06', -7100706, 'Empuje vertical y handstand', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Equilibrio activo · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall handstand shoulder taps: 3 × 4
• Freestanding handstand hold: 4 intentos

Fuerza · Empuje vertical · 26 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Wall HSPU negative: 3 × 5
• Weighted parallel bar dips: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Slow dead bug: 2 × 12
• Band Y raise: 2 × 12', 'Estira dorsales y pectoral 45 s por lado, más wrist mobility en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-07-06","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-06', -7200706, 'Metcon', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    '13 min', '', 'EMOM · Muscle-up practice · 8 min
Calidad por encima de cantidad: salta el minuto si la transición se rompe.
• Assisted muscle-up transition: 3 reps
• Explosive pull up: 4 reps
• Parallel bar dips: 8 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-07-06","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-07', -7000707, 'Activación', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    '10 min', '', 'Movilidad · Tracción vertical · 10 min
• Elbow and wrist mobility: 45 s
• Supine thoracic rotation: 8 reps por lado
• Band dislocates: 15 reps
• Passive bar hang: 30 s', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-07-07","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-07', -7100707, 'Tracción vertical y muscle-up', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Transición de muscle-up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Low ring muscle-up transition: 3 × 4
• Sternum pull up: 3 × 4

Fuerza · Tracción vertical · 26 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Weighted pull up: 3 × 5
• Weighted ring row: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• One-arm band row: 2 × 12
• Plank shoulder tap: 2 × 12', 'Passive bar hang 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-07-07","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-07', -7200707, 'Metcon', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    '12 min', '', 'EMOM · Death by burpee · 7 min
Minuto 1 una repetición, minuto 2 dos, y así hasta que no llegues a tiempo.
• Burpee: 1 rep acumulativa por minuto', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-07-07","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-08', -7000708, 'Día de descanso', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-07-08","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-09', -7000709, 'Activación', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    '10 min', '', 'Movilidad · Piernas y core · 10 min
• 90/90 hip mobility: 8 reps por lado
• Cossack squat: 8 reps por lado
• Deep squat hold: 45 s
• Wall ankle mobility: 10 reps por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-07-09","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-09', -7100709, 'Piernas, salto y core', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Pistol completo · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pistol squat: 3 × 4
• Shrimp squat: 3 × 4

Fuerza · Piernas y core · 26 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Pistol squat: 3 × 5
• Nordic curl negative: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• V-up: 2 × 12
• Single-leg glute bridge: 2 × 12', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-07-09","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-09', -7200709, 'Metcon', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    '11 min', '', 'AMRAP · Active recovery · 6 min
Ritmo suave, respirando por la nariz de principio a fin.
• Active hang: 30 s
• Push up: 8 reps
• Air squat: 12 reps
• Slow dead bug: 10 reps por lado', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-07-09","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-10', -7000710, 'Activación', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    '10 min', '', 'Movilidad · Empuje horizontal · 10 min
• Band dislocates: 15 reps
• Quadruped thoracic rotation: 8 reps por lado
• Wrist mobility on floor: 45 s
• Wall chest opener: 30 s por lado', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-07-10","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-10', -7100710, 'Empuje horizontal y planche', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Tuck planche · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck planche: 3 × 20 s
• Parallette planche lean: 3 × 20 s

Fuerza · Empuje horizontal · 26 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Weighted push up: 3 × 5
• Ring dips: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 2 × 12
• Paused push up plus: 2 × 12', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-07-10","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-10', -7200710, 'Metcon', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    '14 min', '', 'Ladder · Pull ladder · 15-12-9-6-3 · Cap 9 min
Baja de progresión antes que romper la técnica.
• Australian pull up: reps del esquema
• Hollow rock: reps del esquema', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-07-10","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-11', -7000711, 'Activación', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    '10 min', '', 'Movilidad · Tracción horizontal · 10 min
• Band dislocates: 15 reps
• Cat camel: 10 reps
• Supine thoracic rotation: 8 reps por lado
• Passive bar hang: 30 s', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-07-11","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-11', -7100711, 'Tracción horizontal y front lever', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Advanced tuck front lever · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Advanced tuck front lever: 3 × 20 s
• Advanced tuck front lever raise: 3 × 4

Fuerza · Tracción horizontal · 26 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Weighted ring row: 3 × 5
• Weighted Australian pull up: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Ab wheel rollout: 2 × 12
• Band external rotation: 2 × 12', 'Passive bar hang 3 × 30 s, estiramiento de dorsal e isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-07-11","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-11', -7200711, 'Metcon', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    '11 min', '', 'AMRAP · Burpee pull up · 6 min
Si no llegas a la barra, haz burpee y salto vertical con los brazos arriba.
• Burpee pull up: 5 reps
• Air squat: 10 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-07-11","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-12', -7000712, 'Día de descanso', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-07-12","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-13', -7000713, 'Activación', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Doorway chest opener: 30 s por lado
• Quadruped thoracic rotation: 8 reps por lado
• Wrist mobility on floor: 45 s

Activación · Preparación específica · 8 min
• Push up plus: 10 reps
• Wall pike hold: 30 s
• Band face pull: 15 reps', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-07-13","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-13', -7100713, 'Empuje vertical y handstand', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Fuerza en invertido · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall HSPU negative: 4 × 4
• Chest-to-wall handstand: 4 × 25 s

Fuerza · Empuje vertical · 26 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Deficit pike push up: 4 × 6
• Ring dips: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 30 s
• Ring triceps extension: 3 × 12', 'Passive bar hang 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-07-13","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-13', -7200713, 'Metcon', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    '18 min', '', 'EMOM · Front lever engine · 13 min
Elige la progresión de lever que puedas sostener 10 s limpios.
• Tuck front lever: 15 s
• Australian pull up: 10 reps
• Hollow rock: 20 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-07-13","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-14', -7000714, 'Activación', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Cat camel: 10 reps
• Elbow and wrist mobility: 45 s
• Supine thoracic rotation: 8 reps por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Active hang: 30 s
• Band row: 15 reps', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-07-14","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-14', -7100714, 'Tracción vertical y muscle-up', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Dominada lastrada · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Weighted pull up: 4 × 4
• 5 s pull up negative: 4 × 4

Fuerza · Tracción vertical · 26 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Weighted close-grip pull up: 4 × 6
• Weighted Australian pull up: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Ring biceps curl: 3 × 12
• Hollow hold: 3 × 30 s', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-07-14","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-14', -7200714, 'Metcon', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    '23 min', '', 'For Time · Park chipper · Cap 18 min
Trabajo continuo de arriba abajo, sin repetir estación.
• Australian pull up: 40 reps
• Push up: 60 reps
• Air squat: 80 reps
• Hollow rock: 40 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-07-14","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-15', -7000715, 'Día de descanso', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-07-15","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-16', -7000716, 'Activación', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Quadruped hip circles: 8 reps por lado
• 90/90 hip mobility: 8 reps por lado
• Cossack squat: 8 reps por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Slow dead bug: 10 reps por lado
• Single-leg calf raise: 15 reps por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-07-16","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-16', -7100716, 'Piernas, salto y core', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Nordic curl · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Nordic curl negative: 4 × 4
• Weighted Bulgarian split squat: 4 × 4

Fuerza · Piernas y core · 26 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Weighted Bulgarian split squat: 4 × 6
• Weighted single-leg glute bridge: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 30 s
• Single-leg calf raise: 3 × 12', 'Deep squat hold 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-07-16","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-16', -7200716, 'Metcon', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    '16 min', '', 'Unbroken · Push unbroken · 11 min
Cada serie sin pausa: si rompes, subes las manos a un cajón y sigues.
• Pike push up: 4 series de 8 reps sin parar
• Parallel bar dips: 4 series de 8 reps sin parar', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-07-16","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-17', -7000717, 'Activación', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Cat camel: 10 reps
• Band dislocates: 15 reps
• Quadruped thoracic rotation: 8 reps por lado

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Plank shoulder tap: 10 reps por lado
• Hollow hold: 30 s', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-07-17","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-17', -7100717, 'Empuje horizontal y planche', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Pseudo planche push up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pseudo planche push up: 4 × 4
• Band-assisted tuck planche: 4 × 25 s

Fuerza · Empuje horizontal · 26 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Ring push up with turnout: 4 × 6
• Weighted parallel bar dips: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Ring triceps extension: 3 × 12
• Hollow hold: 3 × 30 s', 'Apertura de pectoral en pared, passive bar hang 3 × 30 s y wrist mobility. 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-07-17","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-17', -7200717, 'Metcon', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    '19 min', '', 'Estaciones de tiempo · Park stations · 14 min · 4 estaciones
Un minuto por estación y cuatro vueltas, sin descanso entre estaciones.
• Australian pull up: 1 min
• Push up: 1 min
• Air squat: 1 min
• Front plank: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-07-17","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-18', -7000718, 'Activación', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• 90/90 hip mobility: 8 reps por lado
• Band dislocates: 15 reps
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Hanging knee raise: 10 reps
• Band row: 15 reps
• Arch hold: 20 s', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-07-18","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-18', -7100718, 'Tracción horizontal y front lever', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Negativas de front lever · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• 5 s front lever negative: 4 × 4
• Advanced tuck front lever: 4 × 25 s

Fuerza · Tracción horizontal · 26 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Assisted one-arm ring row: 4 × 6
• Sternum ring row: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Parallette L-sit: 3 × 30 s
• Ring biceps curl: 3 × 12', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-07-18","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-18', -7200718, 'Metcon', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    '21 min', '', 'For Time · Buy in and buy out · Cap 16 min
Entras y sales con la misma tarea: administra el ritmo del bloque central. Sin sitio para correr, cambia los 400 m por 60 mountain climber.
• Buy in run: 400 m
• Australian pull up: 30 reps
• Push up: 40 reps
• Buy out run: 400 m', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-07-18","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-19', -7000719, 'Día de descanso', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-07-19","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-20', -7000720, 'Activación', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Cat camel: 10 reps
• Doorway chest opener: 30 s por lado
• Quadruped thoracic rotation: 8 reps por lado

Activación · Preparación específica · 8 min
• Band Y raise: 12 reps
• Push up plus: 10 reps
• Wall pike hold: 30 s', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-07-20","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-20', -7100720, 'Empuje vertical y handstand', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Kick up y parada · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Freestanding kick up: 8 intentos
• Chest-to-wall handstand: 5 × 25 s

Fuerza · Empuje vertical · 26 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Wall HSPU to pads: 5 × 5
• Weighted parallel bar dips: 4 × 10', 'Fuerza · Accesorio y core · 10 min
• Alternating hollow and arch: 4 × 12
• Feet-elevated bench dips: 4 × 12', 'Estiramiento de tríceps sobre la cabeza, seated shoulder bridge y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-07-20","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-20', -7200720, 'Metcon', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    '15 min', '', 'Unbroken · Bar hang challenge · 10 min
Cada bloque empieza colgado: si sueltas, descansas un minuto y sigues.
• Active hang: 5 series de 45 s
• Hanging knee raise: 5 series de 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-07-20","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-21', -7000721, 'Activación', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Scapular slides on bar: 10 reps
• Cat camel: 10 reps
• Elbow and wrist mobility: 45 s

Activación · Preparación específica · 8 min
• Band face pull: 15 reps
• Hollow hold: 30 s
• Active hang: 30 s', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-07-21","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-21', -7100721, 'Tracción vertical y muscle-up', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Muscle-up asistido · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Band-assisted muscle-up: 5 × 4
• Explosive pull up: 5 × 4

Fuerza · Tracción vertical · 26 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Strict pull up with top pause: 5 × 5
• Feet-elevated ring row: 4 × 10', 'Fuerza · Accesorio y core · 10 min
• Band face pull: 4 × 12
• Hanging knee raise: 4 × 12', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-07-21","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-21', -7200721, 'Metcon', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    '21 min', '', 'Estaciones de tiempo · Park stations · 16 min · 4 estaciones
Un minuto por estación y cuatro vueltas, sin descanso entre estaciones.
• Australian pull up: 1 min
• Push up: 1 min
• Air squat: 1 min
• Front plank: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-07-21","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-22', -7000722, 'Día de descanso', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-07-22","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-23', -7000723, 'Activación', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Active hamstring stretch: 10 reps por lado
• Quadruped hip circles: 8 reps por lado
• 90/90 hip mobility: 8 reps por lado

Activación · Preparación específica · 8 min
• Wall sit: 30 s
• Hollow hold: 30 s
• Slow dead bug: 10 reps por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-07-23","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-23', -7100723, 'Piernas, salto y core', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Salto y aterrizaje · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Box jump: 5 × 4
• Pistol squat: 5 × 4

Fuerza · Piernas y core · 26 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Shrimp squat: 5 × 5
• Weighted single-leg Romanian deadlift: 4 × 10', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 4 × 12
• Slow dead bug: 4 × 12', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-07-23","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-23', -7200723, 'Metcon', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    '19 min', '', 'AMRAP · Park engine · 14 min
Ritmo constante: elige la progresión que te deje seguir sin parar.
• Australian pull up: 8 reps
• Push up: 10 reps
• Air squat: 15 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-07-23","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-24', -7000724, 'Activación', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Plank scapular slide: 10 reps
• Cat camel: 10 reps
• Band dislocates: 15 reps

Activación · Preparación específica · 8 min
• Planche lean: 20 s
• Band pull apart: 15 reps
• Plank shoulder tap: 10 reps por lado', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-07-24","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-24', -7100724, 'Empuje horizontal y planche', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Planche en anillas · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Ring tuck planche: 5 × 25 s
• Floor planche lean: 5 × 25 s

Fuerza · Empuje horizontal · 26 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Tempo archer push up: 5 × 5
• Weighted push up: 4 × 10', 'Fuerza · Accesorio y core · 10 min
• Plank shoulder tap: 4 × 12
• Band face pull: 4 × 12', 'Rodillo en pectoral y dorsal, seated shoulder bridge y 2 min de respiración diafragmática.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-07-24","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-24', -7200724, 'Metcon', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    '21 min', '', 'EMOM · Push EMOM · 16 min
Un movimiento por minuto, rotando siempre en el mismo orden.
• Pike push up: 6 reps
• Push up: 12 reps
• Bench dips: 10 reps
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-07-24","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-25', -7000725, 'Activación', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Scapular slides on bar: 10 reps
• 90/90 hip mobility: 8 reps por lado
• Band dislocates: 15 reps

Activación · Preparación específica · 8 min
• Band face pull: 15 reps
• Hanging knee raise: 10 reps
• Band row: 15 reps', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-07-25","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-25', -7100725, 'Tracción horizontal y front lever', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Front lever a una pierna · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• One-leg front lever: 5 × 25 s
• Tuck front lever raise: 5 × 4

Fuerza · Tracción horizontal · 26 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• 2 s paused ring row: 5 × 5
• Weighted ring row: 4 × 10', 'Fuerza · Accesorio y core · 10 min
• Hanging knee raise: 4 × 12
• Arch hold: 4 × 35 s', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-07-25","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-25', -7200725, 'Metcon', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    '20 min', '', 'AMRAP · Ring engine · 15 min
Las anillas mandan: mantén los codos pegados y el cuerpo en tensión.
• Ring row: 10 reps
• Assisted ring dips: 8 reps
• Ring support hold: 20 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-07-25","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-26', -7000726, 'Día de descanso', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-07-26","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-27', -7000727, 'Activación', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Plank shoulder circles: 8 reps por lado
• Cat camel: 10 reps
• Doorway chest opener: 30 s por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Band Y raise: 12 reps
• Push up plus: 10 reps', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-07-27","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-27', -7100727, 'Empuje vertical y handstand', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Equilibrio activo · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall handstand shoulder taps: 5 × 5
• Freestanding handstand hold: 10 intentos

Fuerza · Empuje vertical · 26 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Wall HSPU negative: 5 × 4
• Weighted parallel bar dips: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 4 × 15
• Band face pull: 4 × 15', 'Estira dorsales y pectoral 45 s por lado, más wrist mobility en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-07-27","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-27', -7200727, 'Metcon', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    '24 min', '', 'Rounds For Time · Pike and pistol · 5 rondas · Cap 19 min
Alterna piernas en el pistol y controla la bajada del pike.
• Pike push up: 8 reps
• Assisted pistol squat: 5 reps por lado
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-07-27","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-28', -7000728, 'Activación', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Wall chest opener: 30 s por lado
• Scapular slides on bar: 10 reps
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Band external rotation: 12 reps por lado
• Band face pull: 15 reps
• Hollow hold: 30 s', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-07-28","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-28', -7100728, 'Tracción vertical y muscle-up', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Transición de muscle-up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Low ring muscle-up transition: 5 × 5
• Sternum pull up: 5 × 5

Fuerza · Tracción vertical · 26 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Weighted pull up: 5 × 4
• Weighted ring row: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Band external rotation: 4 × 15
• Arch hold: 4 × 40 s', 'Passive bar hang 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-07-28","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-28', -7200728, 'Metcon', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    '16 min', '', 'Unbroken · Floor unbroken · 11 min
Series sin pausa: para en cuanto pierdas la línea del cuerpo.
• Push up: 5 series de 12 reps sin parar
• Hollow hold: 5 series de 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-07-28","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-29', -7000729, 'Día de descanso', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-07-29","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-30', -7000730, 'Activación', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Cat camel: 10 reps
• Active hamstring stretch: 10 reps por lado
• Quadruped hip circles: 8 reps por lado

Activación · Preparación específica · 8 min
• Light jump lunge: 8 reps por lado
• Wall sit: 30 s
• Hollow hold: 30 s', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-07-30","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-30', -7100730, 'Piernas, salto y core', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Pistol completo · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pistol squat: 5 × 5
• Shrimp squat: 5 × 5

Fuerza · Piernas y core · 26 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Pistol squat: 5 × 4
• Nordic curl negative: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Hanging knee raise: 4 × 15
• Copenhagen plank: 4 × 40 s', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-07-30","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-30', -7200730, 'Metcon', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    '25 min', '', 'Rounds For Time · Grin and bear · 5 rondas · Cap 20 min
Fragmenta las dominadas antes de llegar al fallo. Usa banda si hace falta y cambia el toes to bar por elevación de rodillas.
• Pull up: 5 reps
• Toes to bar: 8 reps
• Reverse lunge: 10 reps por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-07-30","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-31', -7000731, 'Activación', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Seated shoulder bridge: 10 reps
• Plank scapular slide: 10 reps
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Band face pull: 15 reps
• Planche lean: 20 s
• Band pull apart: 15 reps', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-07-31","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-31', -7100731, 'Empuje horizontal y planche', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Tuck planche · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck planche: 5 × 30 s
• Parallette planche lean: 5 × 30 s

Fuerza · Empuje horizontal · 26 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Weighted push up: 5 × 4
• Ring dips: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Ab wheel rollout: 4 × 15
• Band Y raise: 4 × 15', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-07-31","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-07-31', -7200731, 'Metcon', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    '18 min', '', 'AMRAP · Bodyweight legs · 13 min
Aterriza suave en los saltos y mantén el pecho alto en las zancadas.
• Air squat: 20 reps
• Jump lunge: 10 reps por lado
• Box jump: 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-07-31","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-01', -7000801, 'Activación', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Wall chest opener: 30 s por lado
• Scapular slides on bar: 10 reps
• 90/90 hip mobility: 8 reps por lado

Activación · Preparación específica · 8 min
• Slow dead bug: 10 reps por lado
• Band face pull: 15 reps
• Hanging knee raise: 10 reps', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-08-01","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-01', -7100801, 'Tracción horizontal y front lever', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Advanced tuck front lever · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Advanced tuck front lever: 5 × 30 s
• Advanced tuck front lever raise: 5 × 5

Fuerza · Tracción horizontal · 26 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Weighted ring row: 5 × 4
• Weighted Australian pull up: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Strict toes to bar: 4 × 15
• Band face pull: 4 × 15', 'Passive bar hang 3 × 30 s, estiramiento de dorsal e isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-08-01","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-01', -7200801, 'Metcon', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    '18 min', '', 'Estaciones de tiempo · Core stations · 13 min · 3 estaciones
Un minuto por estación y cuatro vueltas, cambiando sin pausa.
• Hollow hold: 1 min
• Plank shoulder tap: 1 min
• Hanging knee raise: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-08-01","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-02', -7000802, 'Día de descanso', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-08-02","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-03', -7000803, 'Activación', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    '10 min', '', 'Movilidad · Empuje vertical · 10 min
• Seated shoulder bridge: 10 reps
• Plank shoulder circles: 8 reps por lado
• Cat camel: 10 reps
• Doorway chest opener: 30 s por lado', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-08-03","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-03', -7100803, 'Empuje vertical y handstand', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Fuerza en invertido · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall HSPU negative: 3 × 4
• Chest-to-wall handstand: 3 × 20 s

Fuerza · Empuje vertical · 26 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Deficit pike push up: 3 × 5
• Ring dips: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Slow dead bug: 2 × 12
• Band Y raise: 2 × 12', 'Passive bar hang 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-08-03","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-03', -7200803, 'Metcon', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    '15 min', '', 'For Time · Endurance test · Cap 10 min
Anota el tiempo: este metcon se repite al final de cada fase para comparar.
• Pull up: 25 reps
• Push up: 50 reps
• Air squat: 75 reps
• Hollow rock: 100 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-08-03","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-04', -7000804, 'Activación', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    '10 min', '', 'Movilidad · Tracción vertical · 10 min
• Seated shoulder bridge: 10 reps
• Wall chest opener: 30 s por lado
• Scapular slides on bar: 10 reps
• Cat camel: 10 reps', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-08-04","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-04', -7100804, 'Tracción vertical y muscle-up', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Dominada lastrada · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Weighted pull up: 3 × 4
• 5 s pull up negative: 3 × 4

Fuerza · Tracción vertical · 26 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Weighted close-grip pull up: 3 × 5
• Weighted Australian pull up: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• One-arm band row: 2 × 12
• Plank shoulder tap: 2 × 12', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-08-04","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-04', -7200804, 'Metcon', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    '15 min', '', 'Rounds For Time · Pistol partner · 3 rondas · Cap 10 min
Alterna piernas en cada repetición y usa anillas si necesitas asistencia.
• Assisted pistol squat: 6 reps por lado
• Hollow rock: 20 reps
• Jump squat: 15 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-08-04","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-05', -7000805, 'Día de descanso', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-08-05","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-06', -7000806, 'Activación', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    '10 min', '', 'Movilidad · Piernas y core · 10 min
• Single-leg glute bridge: 10 reps por lado
• Cat camel: 10 reps
• Active hamstring stretch: 10 reps por lado
• Quadruped hip circles: 8 reps por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-08-06","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-06', -7100806, 'Piernas, salto y core', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Nordic curl · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Nordic curl negative: 3 × 4
• Weighted Bulgarian split squat: 3 × 4

Fuerza · Piernas y core · 26 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Weighted Bulgarian split squat: 3 × 5
• Weighted single-leg glute bridge: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• V-up: 2 × 12
• Single-leg glute bridge: 2 × 12', 'Deep squat hold 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-08-06","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-06', -7200806, 'Metcon', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    '13 min', '', 'Ladder · Push ladder · 21-15-9 · Cap 8 min
Si las flexiones se rompen, sube las manos a un cajón.
• Push up: reps del esquema
• Air squat: reps del esquema', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-08-06","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-07', -7000807, 'Activación', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    '10 min', '', 'Movilidad · Empuje horizontal · 10 min
• Band elbow mobility: 12 reps
• Seated shoulder bridge: 10 reps
• Plank scapular slide: 10 reps
• Cat camel: 10 reps', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-08-07","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-07', -7100807, 'Empuje horizontal y planche', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Pseudo planche push up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pseudo planche push up: 3 × 4
• Band-assisted tuck planche: 3 × 20 s

Fuerza · Empuje horizontal · 26 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Ring push up with turnout: 3 × 5
• Weighted parallel bar dips: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 2 × 12
• Paused push up plus: 2 × 12', 'Apertura de pectoral en pared, passive bar hang 3 × 30 s y wrist mobility. 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-08-07","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-07', -7200807, 'Metcon', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    '11 min', '', 'AMRAP · Burpee pull up · 6 min
Si no llegas a la barra, haz burpee y salto vertical con los brazos arriba.
• Burpee pull up: 5 reps
• Air squat: 10 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-08-07","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-08', -7000808, 'Activación', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    '10 min', '', 'Movilidad · Tracción horizontal · 10 min
• Active hamstring stretch: 10 reps por lado
• Wall chest opener: 30 s por lado
• Scapular slides on bar: 10 reps
• 90/90 hip mobility: 8 reps por lado', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-08-08","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-08', -7100808, 'Tracción horizontal y front lever', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Negativas de front lever · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• 5 s front lever negative: 3 × 4
• Advanced tuck front lever: 3 × 20 s

Fuerza · Tracción horizontal · 26 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Assisted one-arm ring row: 3 × 5
• Sternum ring row: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Ab wheel rollout: 2 × 12
• Band external rotation: 2 × 12', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-08-08","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-08', -7200808, 'Metcon', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    '13 min', '', 'EMOM · Muscle-up practice · 8 min
Calidad por encima de cantidad: salta el minuto si la transición se rompe.
• Assisted muscle-up transition: 3 reps
• Explosive pull up: 4 reps
• Parallel bar dips: 8 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-08-08","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-09', -7000809, 'Día de descanso', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-08-09","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-10', -7000810, 'Activación', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Band dislocates: 15 reps
• Wall slides: 12 reps
• Wrist mobility on floor: 45 s

Activación · Preparación específica · 8 min
• Scapular push up: 12 reps
• Band pull apart: 15 reps
• Band face pull: 15 reps', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-08-10","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-10', -7100810, 'Empuje vertical y handstand', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Desplazamiento invertido · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Handstand walk: 8 intentos
• Wall handstand shoulder taps: 5 × 3

Fuerza · Empuje vertical · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Pseudo planche push up: 4 × 5
• Wall HSPU: 3 × 8', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 4 × 30 s
• Ring triceps extension: 3 × 10', 'Estiramiento de tríceps sobre la cabeza, seated shoulder bridge y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-08-10","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-10', -7200810, 'Metcon', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    '14 min', '', 'AMRAP · Active recovery · 9 min
Ritmo suave, respirando por la nariz de principio a fin.
• Active hang: 30 s
• Push up: 8 reps
• Air squat: 12 reps
• Slow dead bug: 10 reps por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-08-10","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-11', -7000811, 'Activación', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Passive bar hang: 30 s
• Band dislocates: 15 reps
• Supine thoracic rotation: 8 reps por lado

Activación · Preparación específica · 8 min
• Scapular pull up: 10 reps
• Band pull apart: 15 reps
• Band row: 15 reps', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-08-11","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-11', -7100811, 'Tracción vertical y muscle-up', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Fuerza en el punto muerto · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• 5 s muscle-up negative: 5 × 3
• Weighted pull up: 5 × 3

Fuerza · Tracción vertical · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Explosive pull up to high bar: 4 × 5
• Weighted pull up: 3 × 8', 'Fuerza · Accesorio y core · 10 min
• Ring biceps curl: 3 × 10
• Hollow hold: 4 × 30 s', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-08-11","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-11', -7200811, 'Metcon', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    '14 min', '', 'AMRAP · Burpee pull up · 9 min
Si no llegas a la barra, haz burpee y salto vertical con los brazos arriba.
• Burpee pull up: 5 reps
• Air squat: 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-08-11","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-12', -7000812, 'Día de descanso', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-08-12","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-13', -7000813, 'Activación', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Wall ankle mobility: 10 reps por lado
• Deep squat hold: 45 s
• Cossack squat: 8 reps por lado

Activación · Preparación específica · 8 min
• Band monster walk: 12 pasos por lado
• Glute bridge: 15 reps
• Single-leg calf raise: 15 reps por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-08-13","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-13', -7100813, 'Piernas, salto y core', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Potencia de salto · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Max vertical jump: 5 × 3
• Single-leg box jump: 5 × 3

Fuerza · Piernas y core · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Single-leg jump squat: 4 × 5
• Nordic curl negative: 3 × 8', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 4 × 30 s
• Single-leg calf raise: 3 × 10', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-08-13","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-13', -7200813, 'Metcon', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    '23 min', '', 'For Time · Park chipper · Cap 18 min
Trabajo continuo de arriba abajo, sin repetir estación.
• Australian pull up: 40 reps
• Push up: 60 reps
• Air squat: 80 reps
• Hollow rock: 40 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-08-13","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-14', -7000814, 'Activación', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Wall chest opener: 30 s por lado
• Wrist mobility on floor: 45 s
• Quadruped thoracic rotation: 8 reps por lado

Activación · Preparación específica · 8 min
• Scapular push up: 12 reps
• Push up plus: 10 reps
• Hollow hold: 30 s', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-08-14","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-14', -7100814, 'Empuje horizontal y planche', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Fuerza de planche · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Deficit pseudo planche push up: 5 × 3
• Advanced tuck planche: 5 × 20 s

Fuerza · Empuje horizontal · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Assisted one-arm push up: 4 × 5
• Pseudo planche push up: 3 × 8', 'Fuerza · Accesorio y core · 10 min
• Ring triceps extension: 3 × 10
• Hollow hold: 4 × 30 s', 'Rodillo en pectoral y dorsal, seated shoulder bridge y 2 min de respiración diafragmática.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-08-14","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-14', -7200814, 'Metcon', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    '16 min', '', 'EMOM · Handstand engine · 11 min
Sube al invertido con control; si no llegas, sostén pike contra la pared.
• Wall handstand hold: 30 s
• Push up: 12 reps
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-08-14","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-15', -7000815, 'Activación', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Passive bar hang: 30 s
• Supine thoracic rotation: 8 reps por lado
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Scapular pull up: 10 reps
• Hollow hold: 30 s
• Arch hold: 20 s', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-08-15","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-15', -7100815, 'Tracción horizontal y front lever', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Fuerza dinámica · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck front lever pull up: 5 × 3
• Straddle front lever: 5 × 20 s

Fuerza · Tracción horizontal · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Weighted ring row: 4 × 5
• Tuck ice cream maker: 3 × 8', 'Fuerza · Accesorio y core · 10 min
• Parallette L-sit: 4 × 30 s
• Ring biceps curl: 3 × 10', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-08-15","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-15', -7200815, 'Metcon', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    '19 min', '', 'Estaciones de tiempo · Leg engine · 14 min · 3 estaciones
Un minuto por estación y cinco vueltas, sin descanso entre estaciones.
• Air squat: 1 min
• Box step up: 1 min
• Single-leg glute bridge: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-08-15","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-16', -7000816, 'Día de descanso', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-08-16","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-17', -7000817, 'Activación', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Wall slides: 12 reps
• Wrist mobility on floor: 45 s
• Quadruped thoracic rotation: 8 reps por lado

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Band face pull: 15 reps
• Wall pike hold: 30 s', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-08-17","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
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
