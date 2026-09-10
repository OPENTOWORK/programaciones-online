-- Programación anual de Calistenia generada por scripts/generate-calistenia-year.mjs
-- Parte 3 de 8 · 111 sesiones. Pega las partes en orden en el editor SQL de Supabase.
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
    target_program, '2026-04-02', -7100402, 'Piernas, salto y core', 'Semana 14 · Mesociclo 4 · Acumulación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Unilateral con control · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tempo Bulgarian split squat: 4 × 6
• Ring-assisted pistol squat: 4 × 6

Fuerza · Piernas y core · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Walking lunge: 4 × 10
• Band hamstring curl: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 4 × 15
• Slow dead bug: 4 × 15', 'Deep squat hold 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-04-02","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-02', -7200402, 'Metcon', 'Semana 14 · Mesociclo 4 · Acumulación · Carga',
    '21 min', '', 'EMOM · Push EMOM · 16 min
Un movimiento por minuto, rotando siempre en el mismo orden.
• Pike push up: 6 reps
• Push up: 12 reps
• Bench dips: 10 reps
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-04-02","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-03', -7000403, 'Activación', 'Semana 14 · Mesociclo 4 · Acumulación · Carga',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Plank scapular slide: 10 reps
• Wall chest opener: 30 s por lado
• Band dislocates: 15 reps

Activación · Preparación específica · 8 min
• Planche lean: 20 s
• Scapular push up: 12 reps
• Plank shoulder tap: 10 reps por lado', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-04-03","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-03', -7100403, 'Empuje horizontal y planche', 'Semana 14 · Mesociclo 4 · Acumulación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Tuck planche asistido · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Band-assisted tuck planche: 4 × 25 s
• Floor planche lean: 4 × 25 s

Fuerza · Empuje horizontal · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Ring push up: 4 × 10
• Close-grip push up: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Plank shoulder tap: 4 × 15
• Band face pull: 4 × 15', 'Apertura de pectoral en pared, passive bar hang 3 × 30 s y wrist mobility. 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-04-03","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-03', -7200403, 'Metcon', 'Semana 14 · Mesociclo 4 · Acumulación · Carga',
    '19 min', '', 'Rounds For Time · Core cluster · 5 rondas · Cap 14 min
Sin balanceos: si no controlas el movimiento, reduce el rango o pasa a elevación de rodillas.
• Toes to bar: 8 reps
• Hollow rock: 15 reps
• Side plank: 30 s por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-04-03","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-04', -7000404, 'Activación', 'Semana 14 · Mesociclo 4 · Acumulación · Carga',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Scapular slides on bar: 10 reps
• Passive bar hang: 30 s
• Band dislocates: 15 reps

Activación · Preparación específica · 8 min
• Band face pull: 15 reps
• Scapular pull up: 10 reps
• Band row: 15 reps', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-04-04","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-04', -7100404, 'Tracción horizontal y front lever', 'Semana 14 · Mesociclo 4 · Acumulación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Raises en tuck · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck front lever raise: 4 × 6
• Tuck front lever: 4 × 25 s

Fuerza · Tracción horizontal · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Sternum ring row: 4 × 10
• Feet-elevated Australian pull up: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Hanging knee raise: 4 × 15
• Arch hold: 4 × 30 s', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-04-04","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-04', -7200404, 'Metcon', 'Semana 14 · Mesociclo 4 · Acumulación · Carga',
    '17 min', '', 'Ladder · Core ladder · 5-10-15-20 · Cap 12 min
Sube el número de repeticiones en cada bloque sin perder la posición lumbar.
• Hollow rock: reps del esquema
• V-up: reps del esquema
• Side plank: 15 s por lado entre bloques', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-04-04","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-05', -7000405, 'Día de descanso', 'Semana 14 · Mesociclo 4 · Acumulación · Carga',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-04-05","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-06', -7000406, 'Activación', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Plank shoulder circles: 8 reps por lado
• Wall slides: 12 reps
• Doorway chest opener: 30 s por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Band pull apart: 15 reps
• Push up plus: 10 reps', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-04-06","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-06', -7100406, 'Empuje vertical y handstand', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Line drills · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Chest-to-wall handstand: 5 × 25 s
• Handstand toe pulls: 5 × 6

Fuerza · Empuje vertical · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Feet-elevated pike push up: 5 × 10
• Ring shoulder press: 4 × 15', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 4 × 20
• Band face pull: 4 × 20', 'Estiramiento de tríceps sobre la cabeza, seated shoulder bridge y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-04-06","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-06', -7200406, 'Metcon', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    '14 min', '', 'Tabata · Leg tabata · 8 rondas
Alterna movimiento en cada ronda: 20 s de trabajo y 10 s de pausa.
• Jump squat: 20 s
• Jump lunge: 20 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-04-06","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-07', -7000407, 'Activación', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Wall chest opener: 30 s por lado
• Band dislocates: 15 reps
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Band external rotation: 12 reps por lado
• Band pull apart: 15 reps
• Hollow hold: 30 s', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-04-07","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-07', -7100407, 'Tracción vertical y muscle-up', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Tracción explosiva · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Explosive pull up: 5 × 6
• Slow scapular pull up: 5 × 6

Fuerza · Tracción vertical · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Tempo 3-1-1 strict pull up: 5 × 10
• Ring row: 4 × 15', 'Fuerza · Accesorio y core · 10 min
• Band external rotation: 4 × 20
• Arch hold: 4 × 40 s', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-04-07","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-07', -7200407, 'Metcon', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    '23 min', '', 'Rounds For Time · Pistol partner · 4 rondas · Cap 18 min
Alterna piernas en cada repetición y usa anillas si necesitas asistencia.
• Assisted pistol squat: 6 reps por lado
• Hollow rock: 20 reps
• Jump squat: 15 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-04-07","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-08', -7000408, 'Día de descanso', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-04-08","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-09', -7000409, 'Activación', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Cat camel: 10 reps
• Deep squat hold: 45 s
• Quadruped hip circles: 8 reps por lado

Activación · Preparación específica · 8 min
• Light jump lunge: 8 reps por lado
• Glute bridge: 15 reps
• Hollow hold: 30 s', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-04-09","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-09', -7100409, 'Piernas, salto y core', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Cadena posterior · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Assisted Nordic curl: 5 × 6
• Single-leg glute bridge: 5 × 6

Fuerza · Piernas y core · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Single-leg box squat: 5 × 10
• Single-leg Romanian deadlift: 4 × 15', 'Fuerza · Accesorio y core · 10 min
• Hanging knee raise: 4 × 20
• Copenhagen plank: 4 × 40 s', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-04-09","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-09', -7200409, 'Metcon', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    '16 min', '', 'Unbroken · Floor unbroken · 11 min
Series sin pausa: para en cuanto pierdas la línea del cuerpo.
• Push up: 5 series de 12 reps sin parar
• Hollow hold: 5 series de 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-04-09","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-10', -7000410, 'Activación', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Seated shoulder bridge: 10 reps
• Wrist mobility on floor: 45 s
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Band face pull: 15 reps
• Push up plus: 10 reps
• Band pull apart: 15 reps', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-04-10","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-10', -7100410, 'Empuje horizontal y planche', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Pseudo push up · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Knee pseudo planche push up: 5 × 6
• Floor planche lean: 5 × 25 s

Fuerza · Empuje horizontal · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Archer push up: 5 × 10
• Assisted ring dips: 4 × 15', 'Fuerza · Accesorio y core · 10 min
• Ab wheel rollout: 4 × 20
• Band Y raise: 4 × 20', 'Rodillo en pectoral y dorsal, seated shoulder bridge y 2 min de respiración diafragmática.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-04-10","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-10', -7200410, 'Metcon', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    '23 min', '', 'Rounds For Time · Lunge and bar · 4 rondas · Cap 18 min
Zancadas sin apoyar la rodilla y dominadas fragmentadas desde la primera ronda.
• Walking lunge: 20 reps
• Pull up: 6 reps
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-04-10","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-11', -7000411, 'Activación', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Wall chest opener: 30 s por lado
• Supine thoracic rotation: 8 reps por lado
• 90/90 hip mobility: 8 reps por lado

Activación · Preparación específica · 8 min
• Slow dead bug: 10 reps por lado
• Hollow hold: 30 s
• Hanging knee raise: 10 reps', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-04-11","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-11', -7100411, 'Tracción horizontal y front lever', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Compresión avanzada · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Parallette L-sit: 5 × 25 s
• Tuck front lever: 5 × 25 s

Fuerza · Tracción horizontal · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Archer ring row: 5 × 10
• Feet-elevated ring row: 4 × 15', 'Fuerza · Accesorio y core · 10 min
• Strict toes to bar: 4 × 20
• Band face pull: 4 × 20', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-04-11","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-11', -7200411, 'Metcon', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    '18 min', '', 'EMOM · Jump and bar · 13 min
Un movimiento por minuto: mantén la calidad del salto en las últimas rondas.
• Box jump: 10 reps
• Pull up: 5 reps
• Jump squat: 15 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-04-11","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-12', -7000412, 'Día de descanso', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-04-12","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-13', -7000413, 'Activación', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    '10 min', '', 'Movilidad · Empuje vertical · 10 min
• Seated shoulder bridge: 10 reps
• Wrist mobility on floor: 45 s
• Cat camel: 10 reps
• Band dislocates: 15 reps', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-04-13","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-13', -7100413, 'Empuje vertical y handstand', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Handstand de barriga a pared · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Chest-to-wall handstand: 3 × 20 s
• Hollow to arch: 3 × 5

Fuerza · Empuje vertical · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Feet-elevated pike push up: 3 × 8
• Parallel bar dips: 2 × 12', 'Fuerza · Accesorio y core · 10 min
• Slow dead bug: 2 × 15
• Band Y raise: 2 × 15', 'Estira dorsales y pectoral 45 s por lado, más wrist mobility en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-04-13","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-13', -7200413, 'Metcon', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    '13 min', '', 'For Time · Mesocycle finisher · Cap 8 min
Última sesión del bloque: registra el tiempo para comparar con el siguiente mesociclo.
• Australian pull up: 30 reps
• Push up: 45 reps
• Reverse lunge: 30 reps por lado
• Hollow rock: 60 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-04-13","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-14', -7000414, 'Activación', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    '10 min', '', 'Movilidad · Tracción vertical · 10 min
• Seated shoulder bridge: 10 reps
• Supine thoracic rotation: 8 reps por lado
• Scapular slides on bar: 10 reps
• Passive bar hang: 30 s', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-04-14","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-14', -7100414, 'Tracción vertical y muscle-up', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Dominada estricta · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Strict pull up: 3 × 5
• Alternating one-arm active hang: 3 × 20 s

Fuerza · Tracción vertical · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Strict pull up: 3 × 8
• Feet-elevated ring row: 2 × 12', 'Fuerza · Accesorio y core · 10 min
• One-arm band row: 2 × 15
• Plank shoulder tap: 2 × 15', 'Passive bar hang 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-04-14","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-14', -7200414, 'Metcon', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    '11 min', '', 'AMRAP · Burpee pull up · 6 min
Si no llegas a la barra, haz burpee y salto vertical con los brazos arriba.
• Burpee pull up: 5 reps
• Air squat: 10 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-04-14","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-15', -7000415, 'Día de descanso', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-04-15","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-16', -7000416, 'Activación', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    '10 min', '', 'Movilidad · Piernas y core · 10 min
• Single-leg glute bridge: 10 reps por lado
• Cossack squat: 8 reps por lado
• Active hamstring stretch: 10 reps por lado
• Wall ankle mobility: 10 reps por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-04-16","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-16', -7100416, 'Piernas, salto y core', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Pistol progresivo · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Box pistol squat: 3 × 5
• Assisted shrimp squat: 3 × 5

Fuerza · Piernas y core · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Bulgarian split squat: 3 × 8
• Assisted Nordic hamstring curl: 2 × 12', 'Fuerza · Accesorio y core · 10 min
• V-up: 2 × 15
• Single-leg glute bridge: 2 × 15', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-04-16","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-16', -7200416, 'Metcon', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    '15 min', '', 'Rounds For Time · Bodyweight complex · 4 rondas · Cap 10 min
La ronda es un complex seguido: una dominada, dos flexiones y tres sentadillas sin parar.
• Pull up: 1 rep
• Push up: 2 reps
• Air squat: 3 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-04-16","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-17', -7000417, 'Activación', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    '10 min', '', 'Movilidad · Empuje horizontal · 10 min
• Band elbow mobility: 12 reps
• Quadruped thoracic rotation: 8 reps por lado
• Plank scapular slide: 10 reps
• Wall chest opener: 30 s por lado', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-04-17","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-17', -7100417, 'Empuje horizontal y planche', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Planche lean · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Floor planche lean: 3 × 20 s
• Frogstand: 3 × 20 s

Fuerza · Empuje horizontal · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Feet-elevated push up: 3 × 8
• Parallel bar dips: 2 × 12', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 2 × 15
• Paused push up plus: 2 × 15', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-04-17","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-17', -7200417, 'Metcon', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    '15 min', '', 'AMRAP · I go you go · 10 min
En solitario se hace con 40 s de trabajo y 20 s de pausa por movimiento.
• Australian pull up: 40 s
• Push up: 40 s
• Jump squat: 40 s
• Hollow hold: 40 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-04-17","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-18', -7000418, 'Activación', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    '10 min', '', 'Movilidad · Tracción horizontal · 10 min
• Active hamstring stretch: 10 reps por lado
• Cat camel: 10 reps
• Scapular slides on bar: 10 reps
• Passive bar hang: 30 s', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-04-18","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-18', -7100418, 'Tracción horizontal y front lever', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Tuck front lever · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck front lever: 3 × 20 s
• Tuck front lever negative: 3 × 5

Fuerza · Tracción horizontal · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Feet-elevated ring row: 3 × 8
• Tempo 3-1-1 Australian pull up: 2 × 12', 'Fuerza · Accesorio y core · 10 min
• Ab wheel rollout: 2 × 15
• Band external rotation: 2 × 15', 'Passive bar hang 3 × 30 s, estiramiento de dorsal e isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-04-18","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-18', -7200418, 'Metcon', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    '11 min', '', 'Tabata · Leg tabata · 5 rondas
Alterna movimiento en cada ronda: 20 s de trabajo y 10 s de pausa.
• Jump squat: 20 s
• Jump lunge: 20 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-04-18","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-19', -7000419, 'Día de descanso', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-04-19","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-20', -7000420, 'Activación', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Band dislocates: 15 reps
• Cat camel: 10 reps
• Wrist mobility on floor: 45 s

Activación · Preparación específica · 8 min
• Scapular push up: 12 reps
• Band Y raise: 12 reps
• Band face pull: 15 reps', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-04-20","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-20', -7100420, 'Empuje vertical y handstand', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Entradas controladas · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall walk: 4 × 5
• Feet-elevated pike hold: 4 × 20 s

Fuerza · Empuje vertical · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Box pike push up: 4 × 8
• Assisted ring dips: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 30 s
• Ring triceps extension: 3 × 15', 'Passive bar hang 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-04-20","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-20', -7200420, 'Metcon', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    '16 min', '', 'EMOM · Death by burpee · 11 min
Minuto 1 una repetición, minuto 2 dos, y así hasta que no llegues a tiempo.
• Burpee: 1 rep acumulativa por minuto', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-04-20","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-21', -7000421, 'Activación', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Passive bar hang: 30 s
• Scapular slides on bar: 10 reps
• Supine thoracic rotation: 8 reps por lado

Activación · Preparación específica · 8 min
• Scapular pull up: 10 reps
• Band face pull: 15 reps
• Band row: 15 reps', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-04-21","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-21', -7100421, 'Tracción vertical y muscle-up', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Camino al muscle-up · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Chest-to-bar pull up: 4 × 5
• Band muscle-up transition: 4 × 5

Fuerza · Tracción vertical · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Chin up: 4 × 8
• Feet-elevated Australian pull up: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Ring biceps curl: 3 × 15
• Hollow hold: 3 × 30 s', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-04-21","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-21', -7200421, 'Metcon', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    '21 min', '', 'For Time · Buy in and buy out · Cap 16 min
Entras y sales con la misma tarea: administra el ritmo del bloque central. Sin sitio para correr, cambia los 400 m por 60 mountain climber.
• Buy in run: 400 m
• Australian pull up: 30 reps
• Push up: 40 reps
• Buy out run: 400 m', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-04-21","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-22', -7000422, 'Día de descanso', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-04-22","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-23', -7000423, 'Activación', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Wall ankle mobility: 10 reps por lado
• Active hamstring stretch: 10 reps por lado
• Cossack squat: 8 reps por lado

Activación · Preparación específica · 8 min
• Band monster walk: 12 pasos por lado
• Wall sit: 30 s
• Single-leg calf raise: 15 reps por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-04-23","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-23', -7100423, 'Piernas, salto y core', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Unilateral con control · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tempo Bulgarian split squat: 4 × 5
• Ring-assisted pistol squat: 4 × 5

Fuerza · Piernas y core · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Walking lunge: 4 × 8
• Band hamstring curl: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 30 s
• Single-leg calf raise: 3 × 15', 'Deep squat hold 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-04-23","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-23', -7200423, 'Metcon', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    '16 min', '', 'EMOM · Handstand engine · 11 min
Sube al invertido con control; si no llegas, sostén pike contra la pared.
• Wall handstand hold: 30 s
• Push up: 12 reps
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-04-23","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-24', -7000424, 'Activación', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Wall chest opener: 30 s por lado
• Plank scapular slide: 10 reps
• Quadruped thoracic rotation: 8 reps por lado

Activación · Preparación específica · 8 min
• Scapular push up: 12 reps
• Planche lean: 20 s
• Hollow hold: 30 s', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-04-24","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-24', -7100424, 'Empuje horizontal y planche', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Tuck planche asistido · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Band-assisted tuck planche: 4 × 20 s
• Floor planche lean: 4 × 20 s

Fuerza · Empuje horizontal · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Ring push up: 4 × 8
• Close-grip push up: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Ring triceps extension: 3 × 15
• Hollow hold: 3 × 30 s', 'Apertura de pectoral en pared, passive bar hang 3 × 30 s y wrist mobility. 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-04-24","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-24', -7200424, 'Metcon', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    '19 min', '', 'Estaciones de tiempo · Leg engine · 14 min · 3 estaciones
Un minuto por estación y cinco vueltas, sin descanso entre estaciones.
• Air squat: 1 min
• Box step up: 1 min
• Single-leg glute bridge: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-04-24","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-25', -7000425, 'Activación', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Passive bar hang: 30 s
• Scapular slides on bar: 10 reps
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Scapular pull up: 10 reps
• Band face pull: 15 reps
• Arch hold: 20 s', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-04-25","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-25', -7100425, 'Tracción horizontal y front lever', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Raises en tuck · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck front lever raise: 4 × 5
• Tuck front lever: 4 × 20 s

Fuerza · Tracción horizontal · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Sternum ring row: 4 × 8
• Feet-elevated Australian pull up: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Parallette L-sit: 3 × 30 s
• Ring biceps curl: 3 × 15', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-04-25","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-25', -7200425, 'Metcon', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    '18 min', '', 'AMRAP · Park engine · 13 min
Ritmo constante: elige la progresión que te deje seguir sin parar.
• Australian pull up: 8 reps
• Push up: 10 reps
• Air squat: 15 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-04-25","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-26', -7000426, 'Día de descanso', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-04-26","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-27', -7000427, 'Activación', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Wall slides: 12 reps
• Plank shoulder circles: 8 reps por lado
• Quadruped thoracic rotation: 8 reps por lado

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Hollow hold: 30 s
• Wall pike hold: 30 s', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-04-27","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-27', -7100427, 'Empuje vertical y handstand', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Line drills · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Chest-to-wall handstand: 4 × 25 s
• Handstand toe pulls: 4 × 6

Fuerza · Empuje vertical · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Feet-elevated pike push up: 4 × 10
• Ring shoulder press: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Alternating hollow and arch: 4 × 15
• Feet-elevated bench dips: 4 × 15', 'Estiramiento de tríceps sobre la cabeza, seated shoulder bridge y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-04-27","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-27', -7200427, 'Metcon', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    '17 min', '', 'AMRAP · Hollow to bar · 12 min
Mantén la pelvis retrovertida en todo el trabajo de core.
• Hollow rock: 20 reps
• Australian pull up: 10 reps
• Plank shoulder tap: 20 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-04-27","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-28', -7000428, 'Activación', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Band dislocates: 15 reps
• Wall chest opener: 30 s por lado
• Elbow and wrist mobility: 45 s

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Band external rotation: 12 reps por lado
• Active hang: 30 s', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-04-28","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-28', -7100428, 'Tracción vertical y muscle-up', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Tracción explosiva · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Explosive pull up: 4 × 6
• Slow scapular pull up: 4 × 6

Fuerza · Tracción vertical · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Tempo 3-1-1 strict pull up: 4 × 10
• Ring row: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Band face pull: 4 × 15
• Hanging knee raise: 4 × 15', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-04-28","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-28', -7200428, 'Metcon', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    '23 min', '', 'Ladder · Reverse ladder · 10-9-8-7-6-5-4-3-2-1 · Cap 18 min
Bajas repeticiones en un movimiento mientras subes en el otro.
• Pull up: reps descendentes del esquema
• Bench dips: reps ascendentes del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-04-28","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-29', -7000429, 'Día de descanso', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-04-29","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-30', -7000430, 'Activación', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Deep squat hold: 45 s
• Cat camel: 10 reps
• 90/90 hip mobility: 8 reps por lado

Activación · Preparación específica · 8 min
• Glute bridge: 15 reps
• Light jump lunge: 8 reps por lado
• Slow dead bug: 10 reps por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-04-30","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-30', -7100430, 'Piernas, salto y core', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Cadena posterior · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Assisted Nordic curl: 4 × 6
• Single-leg glute bridge: 4 × 6

Fuerza · Piernas y core · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Single-leg box squat: 4 × 10
• Single-leg Romanian deadlift: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 4 × 15
• Slow dead bug: 4 × 15', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-04-30","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-04-30', -7200430, 'Metcon', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    '19 min', '', 'Ladder · Pull up ladder · 1-2-3-4-5-6-7 · Cap 14 min
Sube de una en una y baja de progresión cuando pierdas el rango completo.
• Pull up: reps del esquema
• Push up: el doble de reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-04-30","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-01', -7000501, 'Activación', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Wrist mobility on floor: 45 s
• Seated shoulder bridge: 10 reps
• Band dislocates: 15 reps

Activación · Preparación específica · 8 min
• Push up plus: 10 reps
• Band face pull: 15 reps
• Plank shoulder tap: 10 reps por lado', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-05-01","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-01', -7100501, 'Empuje horizontal y planche', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Pseudo push up · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Knee pseudo planche push up: 4 × 6
• Floor planche lean: 4 × 25 s

Fuerza · Empuje horizontal · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Archer push up: 4 × 10
• Assisted ring dips: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Plank shoulder tap: 4 × 15
• Band face pull: 4 × 15', 'Rodillo en pectoral y dorsal, seated shoulder bridge y 2 min de respiración diafragmática.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-05-01","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-01', -7200501, 'Metcon', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    '15 min', '', 'Unbroken · Bar hang challenge · 10 min
Cada bloque empieza colgado: si sueltas, descansas un minuto y sigues.
• Active hang: 5 series de 45 s
• Hanging knee raise: 5 series de 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-05-01","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-02', -7000502, 'Activación', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Supine thoracic rotation: 8 reps por lado
• Wall chest opener: 30 s por lado
• Band dislocates: 15 reps

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Slow dead bug: 10 reps por lado
• Band row: 15 reps', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-05-02","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-02', -7100502, 'Tracción horizontal y front lever', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Compresión avanzada · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Parallette L-sit: 4 × 25 s
• Tuck front lever: 4 × 25 s

Fuerza · Tracción horizontal · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Archer ring row: 4 × 10
• Feet-elevated ring row: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Hanging knee raise: 4 × 15
• Arch hold: 4 × 30 s', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-05-02","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-02', -7200502, 'Metcon', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    '23 min', '', 'Rounds For Time · Grin and bear · 5 rondas · Cap 18 min
Fragmenta las dominadas antes de llegar al fallo. Usa banda si hace falta y cambia el toes to bar por elevación de rodillas.
• Pull up: 5 reps
• Toes to bar: 8 reps
• Reverse lunge: 10 reps por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-05-02","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-03', -7000503, 'Día de descanso', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-05-03","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-04', -7000504, 'Activación', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Wrist mobility on floor: 45 s
• Seated shoulder bridge: 10 reps
• Doorway chest opener: 30 s por lado

Activación · Preparación específica · 8 min
• Band face pull: 15 reps
• Slow wall walk: 3 reps
• Push up plus: 10 reps', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-05-04","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-04', -7100504, 'Empuje vertical y handstand', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Handstand de barriga a pared · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Chest-to-wall handstand: 5 × 25 s
• Hollow to arch: 5 × 6

Fuerza · Empuje vertical · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Feet-elevated pike push up: 5 × 10
• Parallel bar dips: 4 × 15', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 4 × 20
• Band face pull: 4 × 20', 'Estira dorsales y pectoral 45 s por lado, más wrist mobility en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-05-04","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-04', -7200504, 'Metcon', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    '22 min', '', 'Ladder · Pull ladder · 15-12-9-6-3 · Cap 17 min
Baja de progresión antes que romper la técnica.
• Australian pull up: reps del esquema
• Hollow rock: reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-05-04","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-05', -7000505, 'Activación', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Supine thoracic rotation: 8 reps por lado
• Seated shoulder bridge: 10 reps
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Band row: 15 reps
• Arch hold: 20 s
• Hollow hold: 30 s', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-05-05","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-05', -7100505, 'Tracción vertical y muscle-up', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Dominada estricta · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Strict pull up: 5 × 6
• Alternating one-arm active hang: 5 × 25 s

Fuerza · Tracción vertical · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Strict pull up: 5 × 10
• Feet-elevated ring row: 4 × 15', 'Fuerza · Accesorio y core · 10 min
• Band external rotation: 4 × 20
• Arch hold: 4 × 40 s', 'Passive bar hang 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-05-05","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-05', -7200505, 'Metcon', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    '23 min', '', 'AMRAP · I go you go · 18 min
En solitario se hace con 40 s de trabajo y 20 s de pausa por movimiento.
• Australian pull up: 40 s
• Push up: 40 s
• Jump squat: 40 s
• Hollow hold: 40 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-05-05","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-06', -7000506, 'Día de descanso', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-05-06","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-07', -7000507, 'Activación', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Cossack squat: 8 reps por lado
• Single-leg glute bridge: 10 reps por lado
• Quadruped hip circles: 8 reps por lado

Activación · Preparación específica · 8 min
• Single-leg calf raise: 15 reps por lado
• Side plank: 30 s por lado
• Hollow hold: 30 s', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-05-07","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-07', -7100507, 'Piernas, salto y core', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Pistol progresivo · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Box pistol squat: 5 × 6
• Assisted shrimp squat: 5 × 6

Fuerza · Piernas y core · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Bulgarian split squat: 5 × 10
• Assisted Nordic hamstring curl: 4 × 15', 'Fuerza · Accesorio y core · 10 min
• Hanging knee raise: 4 × 20
• Copenhagen plank: 4 × 40 s', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-05-07","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-07', -7200507, 'Metcon', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    '25 min', '', 'Ladder · Reverse ladder · 10-9-8-7-6-5-4-3-2-1 · Cap 20 min
Bajas repeticiones en un movimiento mientras subes en el otro.
• Pull up: reps descendentes del esquema
• Bench dips: reps ascendentes del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-05-07","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-08', -7000508, 'Activación', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Quadruped thoracic rotation: 8 reps por lado
• Band elbow mobility: 12 reps
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Slow dead bug: 10 reps por lado
• Band pull apart: 15 reps', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-05-08","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-08', -7100508, 'Empuje horizontal y planche', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Planche lean · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Floor planche lean: 5 × 25 s
• Frogstand: 5 × 25 s

Fuerza · Empuje horizontal · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Feet-elevated push up: 5 × 10
• Parallel bar dips: 4 × 15', 'Fuerza · Accesorio y core · 10 min
• Ab wheel rollout: 4 × 20
• Band Y raise: 4 × 20', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-05-08","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-08', -7200508, 'Metcon', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    '24 min', '', 'Rounds For Time · Pike and pistol · 5 rondas · Cap 19 min
Alterna piernas en el pistol y controla la bajada del pike.
• Pike push up: 8 reps
• Assisted pistol squat: 5 reps por lado
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-05-08","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-09', -7000509, 'Activación', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Cat camel: 10 reps
• Active hamstring stretch: 10 reps por lado
• 90/90 hip mobility: 8 reps por lado

Activación · Preparación específica · 8 min
• Arch hold: 20 s
• Active hang: 30 s
• Hanging knee raise: 10 reps', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-05-09","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-09', -7100509, 'Tracción horizontal y front lever', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Tuck front lever · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck front lever: 5 × 25 s
• Tuck front lever negative: 5 × 6

Fuerza · Tracción horizontal · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Feet-elevated ring row: 5 × 10
• Tempo 3-1-1 Australian pull up: 4 × 15', 'Fuerza · Accesorio y core · 10 min
• Strict toes to bar: 4 × 20
• Band face pull: 4 × 20', 'Passive bar hang 3 × 30 s, estiramiento de dorsal e isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-05-09","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-09', -7200509, 'Metcon', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    '20 min', '', 'Ladder · Push ladder · 21-15-9 · Cap 15 min
Si las flexiones se rompen, sube las manos a un cajón.
• Push up: reps del esquema
• Air squat: reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-05-09","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-10', -7000510, 'Día de descanso', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-05-10","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-11', -7000511, 'Activación', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    '10 min', '', 'Movilidad · Empuje vertical · 10 min
• Quadruped thoracic rotation: 8 reps por lado
• Band dislocates: 15 reps
• Cat camel: 10 reps
• Wrist mobility on floor: 45 s', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-05-11","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-11', -7100511, 'Empuje vertical y handstand', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Entradas controladas · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall walk: 3 × 5
• Feet-elevated pike hold: 3 × 20 s

Fuerza · Empuje vertical · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Box pike push up: 3 × 8
• Assisted ring dips: 2 × 12', 'Fuerza · Accesorio y core · 10 min
• Slow dead bug: 2 × 15
• Band Y raise: 2 × 15', 'Passive bar hang 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-05-11","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-11', -7200511, 'Metcon', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    '15 min', '', 'Estaciones de tiempo · Park stations · 10 min · 4 estaciones
Un minuto por estación y cuatro vueltas, sin descanso entre estaciones.
• Australian pull up: 1 min
• Push up: 1 min
• Air squat: 1 min
• Front plank: 1 min', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-05-11","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-12', -7000512, 'Activación', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    '10 min', '', 'Movilidad · Tracción vertical · 10 min
• Elbow and wrist mobility: 45 s
• Passive bar hang: 30 s
• Scapular slides on bar: 10 reps
• Supine thoracic rotation: 8 reps por lado', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-05-12","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-12', -7100512, 'Tracción vertical y muscle-up', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Camino al muscle-up · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Chest-to-bar pull up: 3 × 5
• Band muscle-up transition: 3 × 5

Fuerza · Tracción vertical · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Chin up: 3 × 8
• Feet-elevated Australian pull up: 2 × 12', 'Fuerza · Accesorio y core · 10 min
• One-arm band row: 2 × 15
• Plank shoulder tap: 2 × 15', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-05-12","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-12', -7200512, 'Metcon', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    '14 min', '', 'Estaciones de tiempo · Leg engine · 9 min · 3 estaciones
Un minuto por estación y cinco vueltas, sin descanso entre estaciones.
• Air squat: 1 min
• Box step up: 1 min
• Single-leg glute bridge: 1 min', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-05-12","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-13', -7000513, 'Día de descanso', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-05-13","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-14', -7000514, 'Activación', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    '10 min', '', 'Movilidad · Piernas y core · 10 min
• 90/90 hip mobility: 8 reps por lado
• Wall ankle mobility: 10 reps por lado
• Active hamstring stretch: 10 reps por lado
• Cossack squat: 8 reps por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-05-14","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-14', -7100514, 'Piernas, salto y core', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Unilateral con control · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tempo Bulgarian split squat: 3 × 5
• Ring-assisted pistol squat: 3 × 5

Fuerza · Piernas y core · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Walking lunge: 3 × 8
• Band hamstring curl: 2 × 12', 'Fuerza · Accesorio y core · 10 min
• V-up: 2 × 15
• Single-leg glute bridge: 2 × 15', 'Deep squat hold 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-05-14","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-14', -7200514, 'Metcon', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    '15 min', '', 'AMRAP · I go you go · 10 min
En solitario se hace con 40 s de trabajo y 20 s de pausa por movimiento.
• Australian pull up: 40 s
• Push up: 40 s
• Jump squat: 40 s
• Hollow hold: 40 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-05-14","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-15', -7000515, 'Activación', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    '10 min', '', 'Movilidad · Empuje horizontal · 10 min
• Band dislocates: 15 reps
• Wall chest opener: 30 s por lado
• Plank scapular slide: 10 reps
• Quadruped thoracic rotation: 8 reps por lado', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-05-15","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-15', -7100515, 'Empuje horizontal y planche', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Tuck planche asistido · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Band-assisted tuck planche: 3 × 20 s
• Floor planche lean: 3 × 20 s

Fuerza · Empuje horizontal · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Ring push up: 3 × 8
• Close-grip push up: 2 × 12', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 2 × 15
• Paused push up plus: 2 × 15', 'Apertura de pectoral en pared, passive bar hang 3 × 30 s y wrist mobility. 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-05-15","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-15', -7200515, 'Metcon', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    '14 min', '', 'Rounds For Time · Rings and floor · 3 rondas · Cap 9 min
Alterna anillas y suelo para repartir la fatiga del hombro.
• Ring row: 12 reps
• Push up: 15 reps
• Ring support hold: 30 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-05-15","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-16', -7000516, 'Activación', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    '10 min', '', 'Movilidad · Tracción horizontal · 10 min
• Band dislocates: 15 reps
• Passive bar hang: 30 s
• Scapular slides on bar: 10 reps
• Cat camel: 10 reps', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-05-16","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-16', -7100516, 'Tracción horizontal y front lever', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Raises en tuck · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck front lever raise: 3 × 5
• Tuck front lever: 3 × 20 s

Fuerza · Tracción horizontal · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Sternum ring row: 3 × 8
• Feet-elevated Australian pull up: 2 × 12', 'Fuerza · Accesorio y core · 10 min
• Ab wheel rollout: 2 × 15
• Band external rotation: 2 × 15', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-05-16","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-16', -7200516, 'Metcon', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    '11 min', '', 'Tabata · Core tabata · 5 rondas
Alterna ejercicio en cada ronda: 20 s de trabajo y 10 s de pausa, cambiando de lado en la plancha.
• Hollow hold: 20 s
• Side plank: 20 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-05-16","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-05-17', -7000517, 'Día de descanso', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-05-17","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
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
