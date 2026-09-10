-- Programación anual de Calistenia generada por scripts/generate-calistenia-year.mjs
-- Parte 6 de 8 · 111 sesiones. Pega las partes en orden en el editor SQL de Supabase.
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
    target_program, '2026-08-17', -7100817, 'Empuje vertical y handstand', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Handstand libre · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Freestanding handstand hold: 5 × 25 s
• Freestanding handstand shoulder taps: 5 × 4

Fuerza · Empuje vertical · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Wall HSPU: 5 × 4
• Weighted ring dips: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Alternating hollow and arch: 4 × 10
• Feet-elevated bench dips: 4 × 10', 'Estira dorsales y pectoral 45 s por lado, más wrist mobility en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-08-17","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-17', -7200817, 'Metcon', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    '21 min', '', 'Estaciones de tiempo · Pull stations · 16 min · 4 estaciones
Un minuto por estación y cuatro vueltas, cambiando sin pausa.
• Pull up: 1 min
• Australian pull up: 1 min
• Hanging knee raise: 1 min
• Active hang: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-08-17","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-18', -7000818, 'Activación', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Band dislocates: 15 reps
• Supine thoracic rotation: 8 reps por lado
• Elbow and wrist mobility: 45 s

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Band row: 15 reps
• Active hang: 30 s', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-08-18","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-18', -7100818, 'Tracción vertical y muscle-up', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Muscle-up en barra · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Strict muscle-up: 10 intentos
• Sternum pull up: 5 × 4

Fuerza · Tracción vertical · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Weighted pull up: 5 × 4
• Sternum ring row: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Band face pull: 4 × 10
• Hanging knee raise: 4 × 10', 'Passive bar hang 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-08-18","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-18', -7200818, 'Metcon', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    '23 min', '', 'For Time · Buy in and buy out · Cap 18 min
Entras y sales con la misma tarea: administra el ritmo del bloque central. Sin sitio para correr, cambia los 400 m por 60 mountain climber.
• Buy in run: 400 m
• Australian pull up: 30 reps
• Push up: 40 reps
• Buy out run: 400 m', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-08-18","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-19', -7000819, 'Día de descanso', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-08-19","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-20', -7000820, 'Activación', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Deep squat hold: 45 s
• Cossack squat: 8 reps por lado
• 90/90 hip mobility: 8 reps por lado

Activación · Preparación específica · 8 min
• Glute bridge: 15 reps
• Single-leg calf raise: 15 reps por lado
• Slow dead bug: 10 reps por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-08-20","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-20', -7100820, 'Piernas, salto y core', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Pistol lastrado · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Weighted pistol squat: 5 × 4
• Shrimp squat: 5 × 4

Fuerza · Piernas y core · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Weighted pistol squat: 5 × 4
• Nordic curl: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 4 × 10
• Slow dead bug: 4 × 10', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-08-20","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-20', -7200820, 'Metcon', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    '21 min', '', 'Estaciones de tiempo · Park stations · 16 min · 4 estaciones
Un minuto por estación y cuatro vueltas, sin descanso entre estaciones.
• Australian pull up: 1 min
• Push up: 1 min
• Air squat: 1 min
• Front plank: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-08-20","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-21', -7000821, 'Activación', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Wrist mobility on floor: 45 s
• Quadruped thoracic rotation: 8 reps por lado
• Band dislocates: 15 reps

Activación · Preparación específica · 8 min
• Push up plus: 10 reps
• Hollow hold: 30 s
• Plank shoulder tap: 10 reps por lado', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-08-21","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-21', -7100821, 'Empuje horizontal y planche', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Advanced tuck planche · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Advanced tuck planche: 5 × 25 s
• Pseudo planche push up: 5 × 4

Fuerza · Empuje horizontal · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Pseudo planche push up: 5 × 4
• Weighted ring dips: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Plank shoulder tap: 4 × 10
• Band face pull: 4 × 10', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-08-21","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-21', -7200821, 'Metcon', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    '19 min', '', 'Ladder · Pull up ladder · 1-2-3-4-5-6-7 · Cap 14 min
Sube de una en una y baja de progresión cuando pierdas el rango completo.
• Pull up: reps del esquema
• Push up: el doble de reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-08-21","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-22', -7000822, 'Activación', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Supine thoracic rotation: 8 reps por lado
• Cat camel: 10 reps
• Band dislocates: 15 reps

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Arch hold: 20 s
• Band row: 15 reps', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-08-22","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-22', -7100822, 'Tracción horizontal y front lever', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Straddle front lever · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Straddle front lever: 5 × 25 s
• 5 s front lever negative: 5 × 4

Fuerza · Tracción horizontal · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Tuck front lever row: 5 × 4
• Weighted ring row: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Hanging knee raise: 4 × 10
• Arch hold: 4 × 35 s', 'Passive bar hang 3 × 30 s, estiramiento de dorsal e isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-08-22","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-22', -7200822, 'Metcon', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    '18 min', '', 'Ladder · Dips and squats · 21-15-9 · Cap 13 min
Fondos en paralelas o en banco según tu nivel.
• Parallel bar dips: reps del esquema
• Jump squat: reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-08-22","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-23', -7000823, 'Día de descanso', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-08-23","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-24', -7000824, 'Activación', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Wrist mobility on floor: 45 s
• Quadruped thoracic rotation: 8 reps por lado
• Doorway chest opener: 30 s por lado

Activación · Preparación específica · 8 min
• Band face pull: 15 reps
• Wall pike hold: 30 s
• Push up plus: 10 reps', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-08-24","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-24', -7100824, 'Empuje vertical y handstand', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Handstand push up · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall HSPU: 6 × 4
• Freestanding handstand hold: 6 × 25 s

Fuerza · Empuje vertical · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Wall deficit HSPU: 6 × 3
• Weighted parallel bar dips: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 4 × 12
• Band face pull: 4 × 12', 'Passive bar hang 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-08-24","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-24', -7200824, 'Metcon', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    '20 min', '', 'AMRAP · Park engine · 15 min
Ritmo constante: elige la progresión que te deje seguir sin parar.
• Australian pull up: 8 reps
• Push up: 10 reps
• Air squat: 15 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-08-24","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-25', -7000825, 'Activación', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Supine thoracic rotation: 8 reps por lado
• Elbow and wrist mobility: 45 s
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Band row: 15 reps
• Active hang: 30 s
• Hollow hold: 30 s', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-08-25","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-25', -7100825, 'Tracción vertical y muscle-up', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Muscle-up en anillas · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Band-assisted ring muscle-up: 6 × 4
• Low ring muscle-up transition: 6 × 4

Fuerza · Tracción vertical · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Sternum pull up: 6 × 3
• Weighted ring row: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Band external rotation: 4 × 12
• Arch hold: 5 × 35 s', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-08-25","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-25', -7200825, 'Metcon', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    '25 min', '', 'Ladder · Reverse ladder · 10-9-8-7-6-5-4-3-2-1 · Cap 20 min
Bajas repeticiones en un movimiento mientras subes en el otro.
• Pull up: reps descendentes del esquema
• Bench dips: reps ascendentes del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-08-25","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-26', -7000826, 'Día de descanso', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-08-26","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-27', -7000827, 'Activación', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Cossack squat: 8 reps por lado
• 90/90 hip mobility: 8 reps por lado
• Quadruped hip circles: 8 reps por lado

Activación · Preparación específica · 8 min
• Single-leg calf raise: 15 reps por lado
• Slow dead bug: 10 reps por lado
• Hollow hold: 30 s', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-08-27","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-27', -7100827, 'Piernas, salto y core', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Nordic curl completo · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Nordic curl: 6 × 4
• Pistol squat: 6 × 4

Fuerza · Piernas y core · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Shrimp squat: 6 × 3
• Nordic hamstring curl: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Hanging knee raise: 4 × 12
• Copenhagen plank: 5 × 35 s', 'Deep squat hold 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-08-27","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-27', -7200827, 'Metcon', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    '23 min', '', 'EMOM · Push EMOM · 18 min
Un movimiento por minuto, rotando siempre en el mismo orden.
• Pike push up: 6 reps
• Push up: 12 reps
• Bench dips: 10 reps
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-08-27","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-28', -7000828, 'Activación', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Quadruped thoracic rotation: 8 reps por lado
• Band dislocates: 15 reps
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Plank shoulder tap: 10 reps por lado
• Band pull apart: 15 reps', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-08-28","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-28', -7100828, 'Empuje horizontal y planche', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Straddle planche asistido · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Band-assisted straddle planche: 6 × 25 s
• Tuck planche: 6 × 25 s

Fuerza · Empuje horizontal · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Weighted push up: 6 × 3
• Ring push up with turnout: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Ab wheel rollout: 4 × 12
• Band Y raise: 4 × 12', 'Apertura de pectoral en pared, passive bar hang 3 × 30 s y wrist mobility. 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-08-28","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-28', -7200828, 'Metcon', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    '22 min', '', 'AMRAP · Ring engine · 17 min
Las anillas mandan: mantén los codos pegados y el cuerpo en tensión.
• Ring row: 10 reps
• Assisted ring dips: 8 reps
• Ring support hold: 20 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-08-28","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-29', -7000829, 'Activación', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Cat camel: 10 reps
• Band dislocates: 15 reps
• 90/90 hip mobility: 8 reps por lado

Activación · Preparación específica · 8 min
• Arch hold: 20 s
• Band row: 15 reps
• Hanging knee raise: 10 reps', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-08-29","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-29', -7100829, 'Tracción horizontal y front lever', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Front lever completo · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Front lever: 12 intentos
• One-leg front lever: 6 × 25 s

Fuerza · Tracción horizontal · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• One-arm ring row: 6 × 3
• Tuck front lever row: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Strict toes to bar: 4 × 12
• Band face pull: 4 × 12', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-08-29","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-29', -7200829, 'Metcon', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    '25 min', '', 'AMRAP · Park sunrise · 20 min
Ritmo conversacional: el objetivo es acabar mejor de lo que empiezas. Vale carrera o comba.
• Run: 200 m
• Australian pull up: 10 reps
• Push up: 15 reps
• Air squat: 20 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-08-29","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-30', -7000830, 'Día de descanso', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-08-30","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-31', -7000831, 'Activación', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    '10 min', '', 'Movilidad · Empuje vertical · 10 min
• Quadruped thoracic rotation: 8 reps por lado
• Doorway chest opener: 30 s por lado
• Cat camel: 10 reps
• Plank shoulder circles: 8 reps por lado', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-08-31","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-31', -7100831, 'Empuje vertical y handstand', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Desplazamiento invertido · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Handstand walk: 5 intentos
• Wall handstand shoulder taps: 3 × 3

Fuerza · Empuje vertical · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Pseudo planche push up: 3 × 4
• Wall HSPU: 2 × 8', 'Fuerza · Accesorio y core · 10 min
• Slow dead bug: 2 × 10
• Band Y raise: 2 × 10', 'Estiramiento de tríceps sobre la cabeza, seated shoulder bridge y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-08-31","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-31', -7200831, 'Metcon', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    '16 min', '', 'Rounds For Time · Grin and bear · 3 rondas · Cap 11 min
Fragmenta las dominadas antes de llegar al fallo. Usa banda si hace falta y cambia el toes to bar por elevación de rodillas.
• Pull up: 5 reps
• Toes to bar: 8 reps
• Reverse lunge: 10 reps por lado', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-08-31","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-01', -7000901, 'Activación', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    '10 min', '', 'Movilidad · Tracción vertical · 10 min
• Elbow and wrist mobility: 45 s
• Cat camel: 10 reps
• Scapular slides on bar: 10 reps
• Wall chest opener: 30 s por lado', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-09-01","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-01', -7100901, 'Tracción vertical y muscle-up', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Fuerza en el punto muerto · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• 5 s muscle-up negative: 3 × 3
• Weighted pull up: 3 × 3

Fuerza · Tracción vertical · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Explosive pull up to high bar: 3 × 4
• Weighted pull up: 2 × 8', 'Fuerza · Accesorio y core · 10 min
• One-arm band row: 2 × 10
• Plank shoulder tap: 2 × 10', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-09-01","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-01', -7200901, 'Metcon', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    '15 min', '', 'AMRAP · I go you go · 10 min
En solitario se hace con 40 s de trabajo y 20 s de pausa por movimiento.
• Australian pull up: 40 s
• Push up: 40 s
• Jump squat: 40 s
• Hollow hold: 40 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-09-01","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-02', -7000902, 'Día de descanso', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-09-02","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-03', -7000903, 'Activación', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    '10 min', '', 'Movilidad · Piernas y core · 10 min
• 90/90 hip mobility: 8 reps por lado
• Quadruped hip circles: 8 reps por lado
• Active hamstring stretch: 10 reps por lado
• Cat camel: 10 reps', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-09-03","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-03', -7100903, 'Piernas, salto y core', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Potencia de salto · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Max vertical jump: 3 × 3
• Single-leg box jump: 3 × 3

Fuerza · Piernas y core · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Single-leg jump squat: 3 × 4
• Nordic curl negative: 2 × 8', 'Fuerza · Accesorio y core · 10 min
• V-up: 2 × 10
• Single-leg glute bridge: 2 × 10', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-09-03","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-03', -7200903, 'Metcon', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    '11 min', '', 'Unbroken · Floor unbroken · 6 min
Series sin pausa: para en cuanto pierdas la línea del cuerpo.
• Push up: 5 series de 12 reps sin parar
• Hollow hold: 5 series de 30 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-09-03","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-04', -7000904, 'Activación', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    '10 min', '', 'Movilidad · Empuje horizontal · 10 min
• Band dislocates: 15 reps
• Cat camel: 10 reps
• Plank scapular slide: 10 reps
• Seated shoulder bridge: 10 reps', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-09-04","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-04', -7100904, 'Empuje horizontal y planche', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Fuerza de planche · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Deficit pseudo planche push up: 3 × 3
• Advanced tuck planche: 3 × 20 s

Fuerza · Empuje horizontal · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Assisted one-arm push up: 3 × 4
• Pseudo planche push up: 2 × 8', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 2 × 10
• Paused push up plus: 2 × 10', 'Rodillo en pectoral y dorsal, seated shoulder bridge y 2 min de respiración diafragmática.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-09-04","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-04', -7200904, 'Metcon', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    '12 min', '', 'Estaciones de tiempo · Core stations · 7 min · 3 estaciones
Un minuto por estación y cuatro vueltas, cambiando sin pausa.
• Hollow hold: 1 min
• Plank shoulder tap: 1 min
• Hanging knee raise: 1 min', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-09-04","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-05', -7000905, 'Activación', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    '10 min', '', 'Movilidad · Tracción horizontal · 10 min
• Band dislocates: 15 reps
• 90/90 hip mobility: 8 reps por lado
• Scapular slides on bar: 10 reps
• Wall chest opener: 30 s por lado', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-09-05","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-05', -7100905, 'Tracción horizontal y front lever', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Fuerza dinámica · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck front lever pull up: 3 × 3
• Straddle front lever: 3 × 20 s

Fuerza · Tracción horizontal · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Weighted ring row: 3 × 4
• Tuck ice cream maker: 2 × 8', 'Fuerza · Accesorio y core · 10 min
• Ab wheel rollout: 2 × 10
• Band external rotation: 2 × 10', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-09-05","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-05', -7200905, 'Metcon', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    '12 min', '', 'Ladder · Core ladder · 5-10-15-20 · Cap 7 min
Sube el número de repeticiones en cada bloque sin perder la posición lumbar.
• Hollow rock: reps del esquema
• V-up: reps del esquema
• Side plank: 15 s por lado entre bloques', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-09-05","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-06', -7000906, 'Día de descanso', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-09-06","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-07', -7000907, 'Activación', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Doorway chest opener: 30 s por lado
• Cat camel: 10 reps
• Plank shoulder circles: 8 reps por lado

Activación · Preparación específica · 8 min
• Push up plus: 10 reps
• Band Y raise: 12 reps
• Hollow hold: 30 s', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-09-07","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-07', -7100907, 'Empuje vertical y handstand', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Handstand libre · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Freestanding handstand hold: 5 × 20 s
• Freestanding handstand shoulder taps: 5 × 3

Fuerza · Empuje vertical · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Wall HSPU: 4 × 5
• Weighted ring dips: 3 × 8', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 4 × 30 s
• Ring triceps extension: 3 × 10', 'Estira dorsales y pectoral 45 s por lado, más wrist mobility en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-09-07","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-07', -7200907, 'Metcon', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    '18 min', '', 'Ladder · Push ladder · 21-15-9 · Cap 13 min
Si las flexiones se rompen, sube las manos a un cajón.
• Push up: reps del esquema
• Air squat: reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-09-07","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-08', -7000908, 'Activación', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Cat camel: 10 reps
• Scapular slides on bar: 10 reps
• Wall chest opener: 30 s por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Band face pull: 15 reps
• Band external rotation: 12 reps por lado', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-09-08","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-08', -7100908, 'Tracción vertical y muscle-up', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Muscle-up en barra · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Strict muscle-up: 8 intentos
• Sternum pull up: 5 × 3

Fuerza · Tracción vertical · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Weighted pull up: 4 × 5
• Sternum ring row: 3 × 8', 'Fuerza · Accesorio y core · 10 min
• Ring biceps curl: 3 × 10
• Hollow hold: 4 × 30 s', 'Passive bar hang 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-09-08","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-08', -7200908, 'Metcon', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    '14 min', '', 'For Time · Floor sprint · Cap 9 min
Es corto: entra fuerte y aguanta el ritmo hasta el final.
• Push up: 50 reps
• Hollow rock: 50 reps
• Plank shoulder tap: 50 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-09-08","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-09', -7000909, 'Día de descanso', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-09-09","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-10', -7000910, 'Activación', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Quadruped hip circles: 8 reps por lado
• Active hamstring stretch: 10 reps por lado
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Wall sit: 30 s
• Light jump lunge: 8 reps por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-09-10","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-10', -7100910, 'Piernas, salto y core', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Pistol lastrado · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Weighted pistol squat: 5 × 3
• Shrimp squat: 5 × 3

Fuerza · Piernas y core · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Weighted pistol squat: 4 × 5
• Nordic curl: 3 × 8', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 4 × 30 s
• Single-leg calf raise: 3 × 10', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-09-10","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-10', -7200910, 'Metcon', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    '19 min', '', 'Rounds For Time · Bodyweight complex · 6 rondas · Cap 14 min
La ronda es un complex seguido: una dominada, dos flexiones y tres sentadillas sin parar.
• Pull up: 1 rep
• Push up: 2 reps
• Air squat: 3 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-09-10","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-11', -7000911, 'Activación', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Cat camel: 10 reps
• Plank scapular slide: 10 reps
• Seated shoulder bridge: 10 reps

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Planche lean: 20 s
• Band face pull: 15 reps', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-09-11","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-11', -7100911, 'Empuje horizontal y planche', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Advanced tuck planche · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Advanced tuck planche: 5 × 20 s
• Pseudo planche push up: 5 × 3

Fuerza · Empuje horizontal · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Pseudo planche push up: 4 × 5
• Weighted ring dips: 3 × 8', 'Fuerza · Accesorio y core · 10 min
• Ring triceps extension: 3 × 10
• Hollow hold: 4 × 30 s', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-09-11","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-11', -7200911, 'Metcon', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    '18 min', '', 'EMOM · Muscle-up practice · 13 min
Calidad por encima de cantidad: salta el minuto si la transición se rompe.
• Assisted muscle-up transition: 3 reps
• Explosive pull up: 4 reps
• Parallel bar dips: 8 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-09-11","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-12', -7000912, 'Activación', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• 90/90 hip mobility: 8 reps por lado
• Scapular slides on bar: 10 reps
• Wall chest opener: 30 s por lado

Activación · Preparación específica · 8 min
• Hanging knee raise: 10 reps
• Band face pull: 15 reps
• Slow dead bug: 10 reps por lado', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-09-12","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-12', -7100912, 'Tracción horizontal y front lever', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Straddle front lever · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Straddle front lever: 5 × 20 s
• 5 s front lever negative: 5 × 3

Fuerza · Tracción horizontal · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Tuck front lever row: 4 × 5
• Weighted ring row: 3 × 8', 'Fuerza · Accesorio y core · 10 min
• Parallette L-sit: 4 × 30 s
• Ring biceps curl: 3 × 10', 'Passive bar hang 3 × 30 s, estiramiento de dorsal e isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-09-12","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-12', -7200912, 'Metcon', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    '19 min', '', 'For Time · Endurance test · Cap 14 min
Anota el tiempo: este metcon se repite al final de cada fase para comparar.
• Pull up: 25 reps
• Push up: 50 reps
• Air squat: 75 reps
• Hollow rock: 100 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-09-12","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-13', -7000913, 'Día de descanso', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-09-13","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-14', -7000914, 'Activación', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Cat camel: 10 reps
• Plank shoulder circles: 8 reps por lado
• Seated shoulder bridge: 10 reps

Activación · Preparación específica · 8 min
• Band Y raise: 12 reps
• Hollow hold: 30 s
• Slow wall walk: 3 reps', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-09-14","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-14', -7100914, 'Empuje vertical y handstand', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Handstand push up · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall HSPU: 5 × 4
• Freestanding handstand hold: 5 × 25 s

Fuerza · Empuje vertical · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Wall deficit HSPU: 5 × 4
• Weighted parallel bar dips: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Alternating hollow and arch: 4 × 10
• Feet-elevated bench dips: 4 × 10', 'Passive bar hang 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-09-14","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-14', -7200914, 'Metcon', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    '25 min', '', 'For Time · Park chipper · Cap 20 min
Trabajo continuo de arriba abajo, sin repetir estación.
• Australian pull up: 40 reps
• Push up: 60 reps
• Air squat: 80 reps
• Hollow rock: 40 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-09-14","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-15', -7000915, 'Activación', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Scapular slides on bar: 10 reps
• Wall chest opener: 30 s por lado
• Seated shoulder bridge: 10 reps

Activación · Preparación específica · 8 min
• Band face pull: 15 reps
• Band external rotation: 12 reps por lado
• Arch hold: 20 s', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-09-15","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-15', -7100915, 'Tracción vertical y muscle-up', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Muscle-up en anillas · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Band-assisted ring muscle-up: 5 × 4
• Low ring muscle-up transition: 5 × 4

Fuerza · Tracción vertical · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Sternum pull up: 5 × 4
• Weighted ring row: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Band face pull: 4 × 10
• Hanging knee raise: 4 × 10', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-09-15","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-15', -7200915, 'Metcon', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    '18 min', '', 'Ladder · Dips and squats · 21-15-9 · Cap 13 min
Fondos en paralelas o en banco según tu nivel.
• Parallel bar dips: reps del esquema
• Jump squat: reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-09-15","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-16', -7000916, 'Día de descanso', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-09-16","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-17', -7000917, 'Activación', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Active hamstring stretch: 10 reps por lado
• Cat camel: 10 reps
• Single-leg glute bridge: 10 reps por lado

Activación · Preparación específica · 8 min
• Wall sit: 30 s
• Light jump lunge: 8 reps por lado
• Side plank: 30 s por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-09-17","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-17', -7100917, 'Piernas, salto y core', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Nordic curl completo · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Nordic curl: 5 × 4
• Pistol squat: 5 × 4

Fuerza · Piernas y core · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Shrimp squat: 5 × 4
• Nordic hamstring curl: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 4 × 10
• Slow dead bug: 4 × 10', 'Deep squat hold 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-09-17","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-17', -7200917, 'Metcon', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    '17 min', '', 'EMOM · Handstand engine · 12 min
Sube al invertido con control; si no llegas, sostén pike contra la pared.
• Wall handstand hold: 30 s
• Push up: 12 reps
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-09-17","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-18', -7000918, 'Activación', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Plank scapular slide: 10 reps
• Seated shoulder bridge: 10 reps
• Band elbow mobility: 12 reps

Activación · Preparación específica · 8 min
• Planche lean: 20 s
• Band face pull: 15 reps
• Slow dead bug: 10 reps por lado', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-09-18","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-18', -7100918, 'Empuje horizontal y planche', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Straddle planche asistido · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Band-assisted straddle planche: 5 × 25 s
• Tuck planche: 5 × 25 s

Fuerza · Empuje horizontal · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Weighted push up: 5 × 4
• Ring push up with turnout: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Plank shoulder tap: 4 × 10
• Band face pull: 4 × 10', 'Apertura de pectoral en pared, passive bar hang 3 × 30 s y wrist mobility. 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-09-18","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-18', -7200918, 'Metcon', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    '20 min', '', 'Estaciones de tiempo · Leg engine · 15 min · 3 estaciones
Un minuto por estación y cinco vueltas, sin descanso entre estaciones.
• Air squat: 1 min
• Box step up: 1 min
• Single-leg glute bridge: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-09-18","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-19', -7000919, 'Activación', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Scapular slides on bar: 10 reps
• Wall chest opener: 30 s por lado
• Active hamstring stretch: 10 reps por lado

Activación · Preparación específica · 8 min
• Band face pull: 15 reps
• Slow dead bug: 10 reps por lado
• Active hang: 30 s', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-09-19","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-19', -7100919, 'Tracción horizontal y front lever', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Front lever completo · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Front lever: 10 intentos
• One-leg front lever: 5 × 25 s

Fuerza · Tracción horizontal · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• One-arm ring row: 5 × 4
• Tuck front lever row: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Hanging knee raise: 4 × 10
• Arch hold: 4 × 35 s', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-09-19","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-19', -7200919, 'Metcon', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    '15 min', '', 'AMRAP · Active recovery · 10 min
Ritmo suave, respirando por la nariz de principio a fin.
• Active hang: 30 s
• Push up: 8 reps
• Air squat: 12 reps
• Slow dead bug: 10 reps por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-09-19","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-20', -7000920, 'Día de descanso', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-09-20","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-21', -7000921, 'Activación', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Plank shoulder circles: 8 reps por lado
• Seated shoulder bridge: 10 reps
• Band dislocates: 15 reps

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Slow wall walk: 3 reps
• Scapular push up: 12 reps', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-09-21","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-21', -7100921, 'Empuje vertical y handstand', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Desplazamiento invertido · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Handstand walk: 12 intentos
• Wall handstand shoulder taps: 6 × 4

Fuerza · Empuje vertical · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Pseudo planche push up: 6 × 3
• Wall HSPU: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Side plank hip raise: 4 × 12
• Band face pull: 4 × 12', 'Estiramiento de tríceps sobre la cabeza, seated shoulder bridge y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-09-21","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-21', -7200921, 'Metcon', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    '23 min', '', 'EMOM · Pull EMOM · 18 min
Un movimiento por minuto, rotando siempre en el mismo orden. Usa banda en las dominadas si hace falta.
• Pull up: 4 reps
• Australian pull up: 8 reps
• Hanging knee raise: 10 reps
• Active hang: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-09-21","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-22', -7000922, 'Activación', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Wall chest opener: 30 s por lado
• Seated shoulder bridge: 10 reps
• Passive bar hang: 30 s

Activación · Preparación específica · 8 min
• Band external rotation: 12 reps por lado
• Arch hold: 20 s
• Scapular pull up: 10 reps', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-09-22","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-22', -7100922, 'Tracción vertical y muscle-up', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Fuerza en el punto muerto · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• 5 s muscle-up negative: 6 × 4
• Weighted pull up: 6 × 4

Fuerza · Tracción vertical · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Explosive pull up to high bar: 6 × 3
• Weighted pull up: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Band external rotation: 4 × 12
• Arch hold: 5 × 35 s', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-09-22","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-22', -7200922, 'Metcon', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    '24 min', '', 'Rounds For Time · Pike and pistol · 5 rondas · Cap 19 min
Alterna piernas en el pistol y controla la bajada del pike.
• Pike push up: 8 reps
• Assisted pistol squat: 5 reps por lado
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-09-22","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-23', -7000923, 'Día de descanso', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-09-23","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-24', -7000924, 'Activación', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Cat camel: 10 reps
• Single-leg glute bridge: 10 reps por lado
• Wall ankle mobility: 10 reps por lado

Activación · Preparación específica · 8 min
• Light jump lunge: 8 reps por lado
• Side plank: 30 s por lado
• Band monster walk: 12 pasos por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-09-24","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-24', -7100924, 'Piernas, salto y core', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Potencia de salto · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Max vertical jump: 6 × 4
• Single-leg box jump: 6 × 4

Fuerza · Piernas y core · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Single-leg jump squat: 6 × 3
• Nordic curl negative: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Hanging knee raise: 4 × 12
• Copenhagen plank: 5 × 35 s', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-09-24","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-24', -7200924, 'Metcon', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    '20 min', '', 'Ladder · Pull up ladder · 1-2-3-4-5-6-7 · Cap 15 min
Sube de una en una y baja de progresión cuando pierdas el rango completo.
• Pull up: reps del esquema
• Push up: el doble de reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-09-24","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-25', -7000925, 'Activación', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Seated shoulder bridge: 10 reps
• Band elbow mobility: 12 reps
• Wall chest opener: 30 s por lado

Activación · Preparación específica · 8 min
• Band face pull: 15 reps
• Slow dead bug: 10 reps por lado
• Scapular push up: 12 reps', '', '', '{"weekdays":[4],"recurrence":"once","startDate":"2026-09-25","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-25', -7100925, 'Empuje horizontal y planche', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Fuerza de planche · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Deficit pseudo planche push up: 6 × 4
• Advanced tuck planche: 6 × 25 s

Fuerza · Empuje horizontal · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Assisted one-arm push up: 6 × 3
• Pseudo planche push up: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Ab wheel rollout: 4 × 12
• Band Y raise: 4 × 12', 'Rodillo en pectoral y dorsal, seated shoulder bridge y 2 min de respiración diafragmática.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-09-25","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-25', -7200925, 'Metcon', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    '19 min', '', 'Ladder · Dips and squats · 21-15-9 · Cap 14 min
Fondos en paralelas o en banco según tu nivel.
• Parallel bar dips: reps del esquema
• Jump squat: reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"once","startDate":"2026-09-25","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-26', -7000926, 'Activación', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Wall chest opener: 30 s por lado
• Active hamstring stretch: 10 reps por lado
• Passive bar hang: 30 s

Activación · Preparación específica · 8 min
• Slow dead bug: 10 reps por lado
• Active hang: 30 s
• Scapular pull up: 10 reps', '', '', '{"weekdays":[5],"recurrence":"once","startDate":"2026-09-26","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-26', -7100926, 'Tracción horizontal y front lever', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Fuerza dinámica · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck front lever pull up: 6 × 4
• Straddle front lever: 6 × 25 s

Fuerza · Tracción horizontal · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Weighted ring row: 6 × 3
• Tuck ice cream maker: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Strict toes to bar: 4 × 12
• Band face pull: 4 × 12', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-09-26","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-26', -7200926, 'Metcon', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    '23 min', '', 'Estaciones de tiempo · Pull stations · 18 min · 4 estaciones
Un minuto por estación y cuatro vueltas, cambiando sin pausa.
• Pull up: 1 min
• Australian pull up: 1 min
• Hanging knee raise: 1 min
• Active hang: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[5],"recurrence":"once","startDate":"2026-09-26","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-27', -7000927, 'Día de descanso', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    'Descanso', '', '', '', '', '{"weekdays":[6],"recurrence":"once","startDate":"2026-09-27","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-28', -7000928, 'Activación', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    '10 min', '', 'Movilidad · Empuje vertical · 10 min
• Seated shoulder bridge: 10 reps
• Band dislocates: 15 reps
• Wall slides: 12 reps
• Wrist mobility on floor: 45 s', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-09-28","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-28', -7100928, 'Empuje vertical y handstand', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Handstand libre · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Freestanding handstand hold: 3 × 20 s
• Freestanding handstand shoulder taps: 3 × 3

Fuerza · Empuje vertical · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Wall HSPU: 3 × 4
• Weighted ring dips: 2 × 8', 'Fuerza · Accesorio y core · 10 min
• Slow dead bug: 2 × 10
• Band Y raise: 2 × 10', 'Estira dorsales y pectoral 45 s por lado, más wrist mobility en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-09-28","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-28', -7200928, 'Metcon', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    '12 min', '', 'AMRAP · Bodyweight legs · 7 min
Aterriza suave en los saltos y mantén el pecho alto en las zancadas.
• Air squat: 20 reps
• Jump lunge: 10 reps por lado
• Box jump: 10 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[0],"recurrence":"once","startDate":"2026-09-28","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-29', -7000929, 'Activación', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    '10 min', '', 'Movilidad · Tracción vertical · 10 min
• Seated shoulder bridge: 10 reps
• Passive bar hang: 30 s
• Band dislocates: 15 reps
• Supine thoracic rotation: 8 reps por lado', '', '', '{"weekdays":[1],"recurrence":"once","startDate":"2026-09-29","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-29', -7100929, 'Tracción vertical y muscle-up', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Muscle-up en barra · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Strict muscle-up: 5 intentos
• Sternum pull up: 3 × 3

Fuerza · Tracción vertical · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Weighted pull up: 3 × 4
• Sternum ring row: 2 × 8', 'Fuerza · Accesorio y core · 10 min
• One-arm band row: 2 × 10
• Plank shoulder tap: 2 × 10', 'Passive bar hang 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-09-29","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-29', -7200929, 'Metcon', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    '15 min', '', 'For Time · Endurance test · Cap 10 min
Anota el tiempo: este metcon se repite al final de cada fase para comparar.
• Pull up: 25 reps
• Push up: 50 reps
• Air squat: 75 reps
• Hollow rock: 100 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[1],"recurrence":"once","startDate":"2026-09-29","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-09-30', -7000930, 'Día de descanso', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    'Descanso', '', '', '', '', '{"weekdays":[2],"recurrence":"once","startDate":"2026-09-30","dayOrder":0,"kind":"rest"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-10-01', -7001001, 'Activación', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    '10 min', '', 'Movilidad · Piernas y core · 10 min
• Single-leg glute bridge: 10 reps por lado
• Wall ankle mobility: 10 reps por lado
• Deep squat hold: 45 s
• Cossack squat: 8 reps por lado', '', '', '{"weekdays":[3],"recurrence":"once","startDate":"2026-10-01","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-10-01', -7101001, 'Piernas, salto y core', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Pistol lastrado · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Weighted pistol squat: 3 × 3
• Shrimp squat: 3 × 3

Fuerza · Piernas y core · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Weighted pistol squat: 3 × 4
• Nordic curl: 2 × 8', 'Fuerza · Accesorio y core · 10 min
• V-up: 2 × 10
• Single-leg glute bridge: 2 × 10', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-10-01","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-10-01', -7201001, 'Metcon', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    '16 min', '', 'Ladder · Reverse ladder · 10-9-8-7-6-5-4-3-2-1 · Cap 11 min
Bajas repeticiones en un movimiento mientras subes en el otro.
• Pull up: reps descendentes del esquema
• Bench dips: reps ascendentes del esquema', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[3],"recurrence":"once","startDate":"2026-10-01","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
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
