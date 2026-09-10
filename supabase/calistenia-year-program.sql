-- Programación anual de Calistenia generada por scripts/generate-calistenia-year.mjs
-- Pégalo en el editor SQL de Supabase si no tienes DATABASE_URL a mano.
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
    target_program, '2000-01-03', -7000103, 'Activación', 'Semana 1 · Mesociclo 1 · Básicos · Introducción',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Dislocaciones con banda: 15 reps
• Wall slides en pared: 12 reps
• Movilidad de muñeca en el suelo: 45 s

Activación · Preparación específica · 8 min
• Scapular push up: 12 reps
• Band pull apart: 15 reps
• Face pull con banda: 15 reps', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-01-03","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-03', -7100103, 'Empuje vertical y handstand', 'Semana 1 · Mesociclo 1 · Básicos · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Base de handstand · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pike hold con pies elevados: 3 × 15 s
• Plancha con hombros activos: 3 × 15 s

Fuerza · Empuje vertical · 20 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Pike push up: 3 × 8
• Fondos en banco: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 20 s
• Extensión de tríceps en anillas: 3 × 12', 'Estira dorsales y pectoral 45 s por lado, más movilidad de muñeca en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-01-03","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-03', -7200103, 'Metcon', 'Semana 1 · Mesociclo 1 · Básicos · Introducción',
    '18 min', '', 'AMRAP · Park engine · 13 min
Ritmo constante: elige la progresión que te deje seguir sin parar.
• Australian pull up: 8 reps
• Push up: 10 reps
• Sentadilla al aire: 15 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-01-03","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-04', -7000104, 'Activación', 'Semana 1 · Mesociclo 1 · Básicos · Introducción',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Colgado pasivo en barra: 30 s
• Dislocaciones con banda: 15 reps
• Rotación torácica tumbado: 8 reps por lado

Activación · Preparación específica · 8 min
• Scapular pull up: 10 reps
• Band pull apart: 15 reps
• Remo con banda: 15 reps', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-01-04","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-04', -7100104, 'Tracción vertical y muscle-up', 'Semana 1 · Mesociclo 1 · Básicos · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Control escapular en barra · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Scapular pull up lento: 3 × 5
• Active hang: 3 × 15 s

Fuerza · Tracción vertical · 20 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Dominada con banda: 3 × 8
• Australian pull up: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Curl de bíceps en anillas: 3 × 12
• Hollow hold: 3 × 20 s', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-01-04","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-04', -7200104, 'Metcon', 'Semana 1 · Mesociclo 1 · Básicos · Introducción',
    '19 min', '', 'Rounds For Time · Pistol partner · 4 rondas · Cap 14 min
Alterna piernas en cada repetición y usa anillas si necesitas asistencia.
• Pistol asistido: 6 reps por lado
• Hollow rock: 20 reps
• Sentadilla en salto: 15 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-01-04","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-05', -7000105, 'Activación', 'Semana 1 · Mesociclo 1 · Básicos · Introducción',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Movilidad de tobillo en pared: 10 reps por lado
• Sentadilla profunda sostenida: 45 s
• Cossack squat: 8 reps por lado

Activación · Preparación específica · 8 min
• Monster walk con banda: 12 pasos por lado
• Puente de glúteo: 15 reps
• Elevación de talón a una pierna: 15 reps por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-01-05","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-05', -7100105, 'Piernas, salto y core', 'Semana 1 · Mesociclo 1 · Básicos · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Control de sentadilla · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Sentadilla profunda sostenida: 3 × 15 s
• Sentadilla a cajón a una pierna: 3 × 5

Fuerza · Piernas y core · 20 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Sentadilla al aire con tempo 3-1-1: 3 × 8
• Zancada inversa: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 20 s
• Elevación de talón a una pierna: 3 × 12', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-01-05","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-05', -7200105, 'Metcon', 'Semana 1 · Mesociclo 1 · Básicos · Introducción',
    '19 min', '', 'AMRAP · I go you go · 14 min
En solitario se hace con 40 s de trabajo y 20 s de pausa por movimiento.
• Australian pull up: 40 s
• Push up: 40 s
• Sentadilla en salto: 40 s
• Hollow hold: 40 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-01-05","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-06', -7000106, 'Activación', 'Semana 1 · Mesociclo 1 · Básicos · Introducción',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Apertura de pectoral en pared: 30 s por lado
• Movilidad de muñeca en el suelo: 45 s
• Rotación torácica en cuadrupedia: 8 reps por lado

Activación · Preparación específica · 8 min
• Scapular push up: 12 reps
• Push up plus: 10 reps
• Hollow hold: 30 s', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-01-06","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-06', -7100106, 'Empuje horizontal y planche', 'Semana 1 · Mesociclo 1 · Básicos · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Base de planche · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Plancha adelantada con hombros activos: 3 × 15 s
• Scapular push up lento: 3 × 5

Fuerza · Empuje horizontal · 20 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Push up estricto: 3 × 8
• Fondos en banco: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Extensión de tríceps en anillas: 3 × 12
• Hollow hold: 3 × 20 s', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-01-06","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-06', -7200106, 'Metcon', 'Semana 1 · Mesociclo 1 · Básicos · Introducción',
    '16 min', '', 'EMOM · Salto y barra · 11 min
Un movimiento por minuto: mantén la calidad del salto en las últimas rondas.
• Salto al cajón: 10 reps
• Dominada: 5 reps
• Sentadilla en salto: 15 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-01-06","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-07', -7000107, 'Activación', 'Semana 1 · Mesociclo 1 · Básicos · Introducción',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Colgado pasivo en barra: 30 s
• Rotación torácica tumbado: 8 reps por lado
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Scapular pull up: 10 reps
• Hollow hold: 30 s
• Arch hold: 20 s', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-01-07","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-07', -7100107, 'Tracción horizontal y front lever', 'Semana 1 · Mesociclo 1 · Básicos · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Base de front lever · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck hang en barra: 3 × 15 s
• Hollow hold: 3 × 15 s

Fuerza · Tracción horizontal · 20 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Australian pull up: 3 × 8
• Remo con banda a una mano: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• L-sit en paralelas: 3 × 20 s
• Curl de bíceps en anillas: 3 × 12', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal y isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-01-07","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-07', -7200107, 'Metcon', 'Semana 1 · Mesociclo 1 · Básicos · Introducción',
    '18 min', '', 'Ladder · Push ladder · 21-15-9 · Cap 13 min
Si las flexiones se rompen, sube las manos a un cajón.
• Push up: reps del esquema
• Sentadilla al aire: reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-01-07","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-10', -7000110, 'Activación', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Wall slides en pared: 12 reps
• Movilidad de muñeca en el suelo: 45 s
• Rotación torácica en cuadrupedia: 8 reps por lado

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Face pull con banda: 15 reps
• Pike hold contra pared: 30 s', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-01-10","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-10', -7100110, 'Empuje vertical y handstand', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Handstand en pared · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall handstand de espaldas: 3 × 20 s
• Hollow hold: 3 × 20 s

Fuerza · Empuje vertical · 20 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Push up con pies elevados: 4 × 8
• Press de hombro con banda: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Hueco y arco alternos: 3 × 15
• Fondos en banco con pies elevados: 3 × 15', 'Colgado pasivo en barra 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-01-10","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-10', -7200110, 'Metcon', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    '23 min', '', 'Rounds For Time · Grin and bear · 5 rondas · Cap 18 min
Fragmenta las dominadas antes de llegar al fallo.
• Dominada con banda si hace falta: 5 reps
• Toes to bar o elevación de rodillas: 8 reps
• Zancada inversa: 10 reps por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-01-10","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-11', -7000111, 'Activación', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Dislocaciones con banda: 15 reps
• Rotación torácica tumbado: 8 reps por lado
• Movilidad de codo y muñeca: 45 s

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Remo con banda: 15 reps
• Active hang: 30 s', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-01-11","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-11', -7100111, 'Tracción vertical y muscle-up', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Dominada asistida · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Dominada con banda: 3 × 6
• Chin over bar hold: 3 × 20 s

Fuerza · Tracción vertical · 20 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Dominada supina asistida: 4 × 8
• Remo en anillas: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Face pull con banda: 3 × 15
• Elevación de rodillas colgado: 3 × 15', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-01-11","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-11', -7200111, 'Metcon', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    '15 min', '', 'AMRAP · Burpee pull up · 10 min
Si no llegas a la barra, haz burpee y salto vertical con los brazos arriba.
• Burpee pull up: 5 reps
• Sentadilla al aire: 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-01-11","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-12', -7000112, 'Activación', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Sentadilla profunda sostenida: 45 s
• Cossack squat: 8 reps por lado
• Movilidad de cadera en 90/90: 8 reps por lado

Activación · Preparación específica · 8 min
• Puente de glúteo: 15 reps
• Elevación de talón a una pierna: 15 reps por lado
• Dead bug lento: 10 reps por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-01-12","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-12', -7100112, 'Piernas, salto y core', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Base de pistol · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pistol asistido con anillas: 3 × 6
• Sentadilla búlgara: 3 × 6

Fuerza · Piernas y core · 20 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Sentadilla a cajón: 4 × 8
• Puente de glúteo a una pierna: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 3 × 15
• Dead bug lento: 3 × 15', 'Sentadilla profunda sostenida 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-01-12","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-12', -7200112, 'Metcon', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    '20 min', '', 'Estaciones de tiempo · Motor de piernas · 15 min · 3 estaciones
Un minuto por estación y cinco vueltas, sin descanso entre estaciones.
• Sentadilla al aire: 1 min
• Step up al cajón: 1 min
• Puente de glúteo a una pierna: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-01-12","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-13', -7000113, 'Activación', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Movilidad de muñeca en el suelo: 45 s
• Rotación torácica en cuadrupedia: 8 reps por lado
• Dislocaciones con banda: 15 reps

Activación · Preparación específica · 8 min
• Push up plus: 10 reps
• Hollow hold: 30 s
• Plancha con toque de hombro: 10 reps por lado', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-01-13","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-13', -7100113, 'Empuje horizontal y planche', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Tensión de línea · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Hollow hold: 3 × 20 s
• Plancha adelantada con hombros activos: 3 × 20 s

Fuerza · Empuje horizontal · 20 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Push up con rodillas apoyadas y tempo 3-1-1: 4 × 8
• Push up inclinado: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Plancha con toque de hombro: 3 × 15
• Face pull con banda: 3 × 15', 'Apertura de pectoral en pared, colgado pasivo 3 × 30 s y movilidad de muñeca. 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-01-13","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-13', -7200113, 'Metcon', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    '13 min', '', 'Tabata · Tabata de piernas · 8 rondas
Alterna movimiento en cada ronda: 20 s de trabajo y 10 s de pausa.
• Sentadilla en salto: 20 s
• Zancada con salto: 20 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-01-13","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-14', -7000114, 'Activación', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Rotación torácica tumbado: 8 reps por lado
• Cat camel: 10 reps
• Dislocaciones con banda: 15 reps

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Arch hold: 20 s
• Remo con banda: 15 reps', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-01-14","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-14', -7100114, 'Tracción horizontal y front lever', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Compresión y tensión · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Compresión sentado con piernas rectas: 3 × 20 s
• Tuck hang en barra: 3 × 20 s

Fuerza · Tracción horizontal · 20 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Remo en anillas: 4 × 8
• Australian pull up con agarre supino: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Elevación de rodillas colgado: 3 × 15
• Arch hold: 3 × 30 s', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-01-14","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-14', -7200114, 'Metcon', 'Semana 2 · Mesociclo 1 · Básicos · Carga',
    '13 min', '', 'Tabata · Tabata de core · 8 rondas
Alterna ejercicio en cada ronda: 20 s de trabajo y 10 s de pausa.
• Hollow hold: 20 s
• Plancha lateral alternando lado: 20 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-01-14","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-17', -7000117, 'Activación', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Movilidad de muñeca en el suelo: 45 s
• Rotación torácica en cuadrupedia: 8 reps por lado
• Apertura de pectoral en marco de puerta: 30 s por lado

Activación · Preparación específica · 8 min
• Face pull con banda: 15 reps
• Pike hold contra pared: 30 s
• Push up plus: 10 reps', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-01-17","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-17', -7100117, 'Empuje vertical y handstand', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Control de muñeca y línea · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Frogstand: 4 × 20 s
• Wall handstand de espaldas: 4 × 20 s

Fuerza · Empuje vertical · 20 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Pike push up con rodillas flexionadas: 4 × 10
• Fondos en paralelas asistidos con banda: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 4 × 15
• Face pull con banda: 4 × 15', 'Estiramiento de tríceps sobre la cabeza, puente de hombro sentado y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-01-17","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-17', -7200117, 'Metcon', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    '20 min', '', 'Ladder · Push ladder · 21-15-9 · Cap 15 min
Si las flexiones se rompen, sube las manos a un cajón.
• Push up: reps del esquema
• Sentadilla al aire: reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-01-17","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-18', -7000118, 'Activación', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Rotación torácica tumbado: 8 reps por lado
• Movilidad de codo y muñeca: 45 s
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Remo con banda: 15 reps
• Active hang: 30 s
• Hollow hold: 30 s', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-01-18","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-18', -7100118, 'Tracción vertical y muscle-up', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Negativas de dominada · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Dominada negativa en 5 s: 4 × 6
• Scapular pull up lento: 4 × 6

Fuerza · Tracción vertical · 20 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Dominada negativa en 4 s: 4 × 10
• Australian pull up con pies elevados: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Rotación externa con banda: 4 × 15
• Arch hold: 4 × 30 s', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-01-18","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-18', -7200118, 'Metcon', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    '22 min', '', 'AMRAP · Ring engine · 17 min
Las anillas mandan: mantén los codos pegados y el cuerpo en tensión.
• Remo en anillas: 10 reps
• Fondos en anillas asistidos: 8 reps
• Support hold en anillas: 20 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-01-18","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-19', -7000119, 'Activación', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Cossack squat: 8 reps por lado
• Movilidad de cadera en 90/90: 8 reps por lado
• Círculos de cadera en cuadrupedia: 8 reps por lado

Activación · Preparación específica · 8 min
• Elevación de talón a una pierna: 15 reps por lado
• Dead bug lento: 10 reps por lado
• Hollow hold: 30 s', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-01-19","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-19', -7100119, 'Piernas, salto y core', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Tobillo y rodilla · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Sentadilla en talones elevados: 4 × 6
• Elevación de talón a una pierna: 4 × 6

Fuerza · Piernas y core · 20 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Step up al cajón: 4 × 10
• Sentadilla búlgara: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Elevación de rodillas colgado: 4 × 15
• Copenhagen plank: 4 × 30 s', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-01-19","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-19', -7200119, 'Metcon', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    '25 min', '', 'AMRAP · Amanecer de parque · 20 min
Ritmo conversacional: el objetivo es acabar mejor de lo que empiezas.
• Carrera o cuerda: 200 m
• Australian pull up: 10 reps
• Push up: 15 reps
• Sentadilla al aire: 20 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-01-19","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-20', -7000120, 'Activación', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Rotación torácica en cuadrupedia: 8 reps por lado
• Dislocaciones con banda: 15 reps
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Plancha con toque de hombro: 10 reps por lado
• Band pull apart: 15 reps', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-01-20","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-20', -7100120, 'Empuje horizontal y planche', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Muñeca y protracción · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Push up plus con pausa: 4 × 6
• Frogstand: 4 × 20 s

Fuerza · Empuje horizontal · 20 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Push up con agarre estrecho: 4 × 10
• Fondos en paralelas asistidos con banda: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Rueda abdominal: 4 × 15
• Elevación en Y con banda: 4 × 15', 'Rodillo en pectoral y dorsal, puente de hombro sentado y 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-01-20","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-20', -7200120, 'Metcon', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    '20 min', '', 'AMRAP · Park engine · 15 min
Ritmo constante: elige la progresión que te deje seguir sin parar.
• Australian pull up: 8 reps
• Push up: 10 reps
• Sentadilla al aire: 15 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-01-20","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-21', -7000121, 'Activación', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Cat camel: 10 reps
• Dislocaciones con banda: 15 reps
• Movilidad de cadera en 90/90: 8 reps por lado

Activación · Preparación específica · 8 min
• Arch hold: 20 s
• Remo con banda: 15 reps
• Elevación de rodillas colgado: 10 reps', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-01-21","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-21', -7100121, 'Tracción horizontal y front lever', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Control escapular colgado · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Scapular pull up lento: 4 × 6
• Arch hold: 4 × 20 s

Fuerza · Tracción horizontal · 20 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Australian pull up con pies elevados: 4 × 10
• Remo invertido con rodillas flexionadas: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Toes to bar estricto: 4 × 15
• Face pull con banda: 4 × 15', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-01-21","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-21', -7200121, 'Metcon', 'Semana 3 · Mesociclo 1 · Básicos · Pico',
    '23 min', '', 'Estaciones de tiempo · Estaciones del parque · 18 min · 4 estaciones
Un minuto por estación y cuatro vueltas, sin descanso entre estaciones.
• Australian pull up: 1 min
• Push up: 1 min
• Sentadilla al aire: 1 min
• Plancha frontal: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-01-21","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-24', -7000124, 'Activación', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    '10 min', '', 'Movilidad · Empuje vertical · 10 min
• Rotación torácica en cuadrupedia: 8 reps por lado
• Apertura de pectoral en marco de puerta: 30 s por lado
• Cat camel: 10 reps
• Círculos de hombro en plancha: 8 reps por lado', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-01-24","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-24', -7100124, 'Empuje vertical y handstand', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Base de handstand · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pike hold con pies elevados: 2 × 15 s
• Plancha con hombros activos: 2 × 15 s

Fuerza · Empuje vertical · 20 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Pike push up: 2 × 8
• Fondos en banco: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Dead bug lento: 2 × 12
• Elevación en Y con banda: 2 × 12', 'Estira dorsales y pectoral 45 s por lado, más movilidad de muñeca en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-01-24","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-24', -7200124, 'Metcon', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    '17 min', '', 'For Time · Chipper de parque · Cap 12 min
Trabajo continuo de arriba abajo, sin repetir estación.
• Australian pull up: 40 reps
• Push up: 60 reps
• Sentadilla al aire: 80 reps
• Hollow rock: 40 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-01-24","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-25', -7000125, 'Activación', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    '10 min', '', 'Movilidad · Tracción vertical · 10 min
• Movilidad de codo y muñeca: 45 s
• Cat camel: 10 reps
• Deslizamientos de escápula en barra: 10 reps
• Apertura de pectoral en pared: 30 s por lado', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-01-25","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-25', -7100125, 'Tracción vertical y muscle-up', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Control escapular en barra · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Scapular pull up lento: 2 × 5
• Active hang: 2 × 15 s

Fuerza · Tracción vertical · 20 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Dominada con banda: 2 × 8
• Australian pull up: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Remo a una mano con banda: 2 × 12
• Plancha con toque de hombro: 2 × 12', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-01-25","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-25', -7200125, 'Metcon', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    '15 min', '', 'AMRAP · I go you go · 10 min
En solitario se hace con 40 s de trabajo y 20 s de pausa por movimiento.
• Australian pull up: 40 s
• Push up: 40 s
• Sentadilla en salto: 40 s
• Hollow hold: 40 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-01-25","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-26', -7000126, 'Activación', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    '10 min', '', 'Movilidad · Piernas y core · 10 min
• Movilidad de cadera en 90/90: 8 reps por lado
• Círculos de cadera en cuadrupedia: 8 reps por lado
• Estiramiento de isquios activo: 10 reps por lado
• Cat camel: 10 reps', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-01-26","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-26', -7100126, 'Piernas, salto y core', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Control de sentadilla · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Sentadilla profunda sostenida: 2 × 15 s
• Sentadilla a cajón a una pierna: 2 × 5

Fuerza · Piernas y core · 20 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Sentadilla al aire con tempo 3-1-1: 2 × 8
• Zancada inversa: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• V-up: 2 × 12
• Puente de glúteo a una pierna: 2 × 12', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-01-26","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-26', -7200126, 'Metcon', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    '14 min', '', 'Rounds For Time · Anillas y suelo · 3 rondas · Cap 9 min
Alterna anillas y suelo para repartir la fatiga del hombro.
• Remo en anillas: 12 reps
• Push up: 15 reps
• Support hold en anillas: 30 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-01-26","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-27', -7000127, 'Activación', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    '10 min', '', 'Movilidad · Empuje horizontal · 10 min
• Dislocaciones con banda: 15 reps
• Cat camel: 10 reps
• Deslizamiento de escápula en plancha: 10 reps
• Puente de hombro sentado: 10 reps', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-01-27","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-27', -7100127, 'Empuje horizontal y planche', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Base de planche · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Plancha adelantada con hombros activos: 2 × 15 s
• Scapular push up lento: 2 × 5

Fuerza · Empuje horizontal · 20 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Push up estricto: 2 × 8
• Fondos en banco: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 2 × 12
• Push up plus con pausa: 2 × 12', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-01-27","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-27', -7200127, 'Metcon', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    '16 min', '', 'Rounds For Time · Grin and bear · 3 rondas · Cap 11 min
Fragmenta las dominadas antes de llegar al fallo.
• Dominada con banda si hace falta: 5 reps
• Toes to bar o elevación de rodillas: 8 reps
• Zancada inversa: 10 reps por lado', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-01-27","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-28', -7000128, 'Activación', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    '10 min', '', 'Movilidad · Tracción horizontal · 10 min
• Dislocaciones con banda: 15 reps
• Movilidad de cadera en 90/90: 8 reps por lado
• Deslizamientos de escápula en barra: 10 reps
• Apertura de pectoral en pared: 30 s por lado', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-01-28","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-28', -7100128, 'Tracción horizontal y front lever', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Base de front lever · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck hang en barra: 2 × 15 s
• Hollow hold: 2 × 15 s

Fuerza · Tracción horizontal · 20 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Australian pull up: 2 × 8
• Remo con banda a una mano: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Rueda abdominal: 2 × 12
• Rotación externa con banda: 2 × 12', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal y isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-01-28","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-28', -7200128, 'Metcon', 'Semana 4 · Mesociclo 1 · Básicos · Descarga',
    '15 min', '', 'EMOM · EMOM de empuje · 10 min
Un movimiento por minuto, rotando siempre en el mismo orden.
• Pike push up: 6 reps
• Push up: 12 reps
• Fondos en banco: 10 reps
• Hollow hold: 30 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-01-28","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-31', -7000131, 'Activación', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Apertura de pectoral en marco de puerta: 30 s por lado
• Cat camel: 10 reps
• Círculos de hombro en plancha: 8 reps por lado

Activación · Preparación específica · 8 min
• Push up plus: 10 reps
• Elevación en Y con banda: 12 reps
• Hollow hold: 30 s', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-01-31","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-31', -7100131, 'Empuje vertical y handstand', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Handstand en pared · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall handstand de espaldas: 3 × 15 s
• Hollow hold: 3 × 15 s

Fuerza · Empuje vertical · 20 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Push up con pies elevados: 3 × 8
• Press de hombro con banda: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 20 s
• Extensión de tríceps en anillas: 3 × 12', 'Colgado pasivo en barra 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-01-31","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-01-31', -7200131, 'Metcon', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    '19 min', '', 'EMOM · EMOM de tracción · 14 min
Un movimiento por minuto, rotando siempre en el mismo orden.
• Dominada con banda si hace falta: 4 reps
• Australian pull up: 8 reps
• Elevación de rodillas colgado: 10 reps
• Active hang: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-01-31","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-01', -7000201, 'Activación', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Cat camel: 10 reps
• Deslizamientos de escápula en barra: 10 reps
• Apertura de pectoral en pared: 30 s por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Face pull con banda: 15 reps
• Rotación externa con banda: 12 reps por lado', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-02-01","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-01', -7100201, 'Tracción vertical y muscle-up', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Dominada asistida · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Dominada con banda: 3 × 5
• Chin over bar hold: 3 × 15 s

Fuerza · Tracción vertical · 20 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Dominada supina asistida: 3 × 8
• Remo en anillas: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Curl de bíceps en anillas: 3 × 12
• Hollow hold: 3 × 20 s', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-02-01","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-01', -7200201, 'Metcon', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    '19 min', '', 'Estaciones de tiempo · Motor de piernas · 14 min · 3 estaciones
Un minuto por estación y cinco vueltas, sin descanso entre estaciones.
• Sentadilla al aire: 1 min
• Step up al cajón: 1 min
• Puente de glúteo a una pierna: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-02-01","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-02', -7000202, 'Activación', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Círculos de cadera en cuadrupedia: 8 reps por lado
• Estiramiento de isquios activo: 10 reps por lado
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Sentadilla isométrica en pared: 30 s
• Zancada con salto suave: 8 reps por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-02-02","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-02', -7100202, 'Piernas, salto y core', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Base de pistol · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pistol asistido con anillas: 3 × 5
• Sentadilla búlgara: 3 × 5

Fuerza · Piernas y core · 20 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Sentadilla a cajón: 3 × 8
• Puente de glúteo a una pierna: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 20 s
• Elevación de talón a una pierna: 3 × 12', 'Sentadilla profunda sostenida 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-02-02","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-02', -7200202, 'Metcon', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    '14 min', '', 'AMRAP · Descarga activa · 9 min
Ritmo suave, respirando por la nariz de principio a fin.
• Active hang: 30 s
• Push up: 8 reps
• Sentadilla al aire: 12 reps
• Dead bug lento: 10 reps por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-02-02","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-03', -7000203, 'Activación', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Cat camel: 10 reps
• Deslizamiento de escápula en plancha: 10 reps
• Puente de hombro sentado: 10 reps

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Lean en plancha adelantada: 20 s
• Face pull con banda: 15 reps', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-02-03","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-03', -7100203, 'Empuje horizontal y planche', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Tensión de línea · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Hollow hold: 3 × 15 s
• Plancha adelantada con hombros activos: 3 × 15 s

Fuerza · Empuje horizontal · 20 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Push up con rodillas apoyadas y tempo 3-1-1: 3 × 8
• Push up inclinado: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Extensión de tríceps en anillas: 3 × 12
• Hollow hold: 3 × 20 s', 'Apertura de pectoral en pared, colgado pasivo 3 × 30 s y movilidad de muñeca. 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-02-03","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-03', -7200203, 'Metcon', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    '18 min', '', 'Ladder · Push ladder · 21-15-9 · Cap 13 min
Si las flexiones se rompen, sube las manos a un cajón.
• Push up: reps del esquema
• Sentadilla al aire: reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-02-03","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-04', -7000204, 'Activación', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Movilidad de cadera en 90/90: 8 reps por lado
• Deslizamientos de escápula en barra: 10 reps
• Apertura de pectoral en pared: 30 s por lado

Activación · Preparación específica · 8 min
• Elevación de rodillas colgado: 10 reps
• Face pull con banda: 15 reps
• Dead bug lento: 10 reps por lado', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-02-04","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-04', -7100204, 'Tracción horizontal y front lever', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Compresión y tensión · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Compresión sentado con piernas rectas: 3 × 15 s
• Tuck hang en barra: 3 × 15 s

Fuerza · Tracción horizontal · 20 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Remo en anillas: 3 × 8
• Australian pull up con agarre supino: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• L-sit en paralelas: 3 × 20 s
• Curl de bíceps en anillas: 3 × 12', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-02-04","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-04', -7200204, 'Metcon', 'Semana 5 · Mesociclo 2 · Básicos · Introducción',
    '16 min', '', 'AMRAP · Piernas al aire · 11 min
Aterriza suave en los saltos y mantén el pecho alto en las zancadas.
• Sentadilla al aire: 20 reps
• Zancada con salto: 10 reps por lado
• Salto al cajón: 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-02-04","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-07', -7000207, 'Activación', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Cat camel: 10 reps
• Círculos de hombro en plancha: 8 reps por lado
• Puente de hombro sentado: 10 reps

Activación · Preparación específica · 8 min
• Elevación en Y con banda: 12 reps
• Hollow hold: 30 s
• Wall walk lento: 3 reps', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-02-07","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-07', -7100207, 'Empuje vertical y handstand', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Control de muñeca y línea · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Frogstand: 3 × 20 s
• Wall handstand de espaldas: 3 × 20 s

Fuerza · Empuje vertical · 20 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Pike push up con rodillas flexionadas: 4 × 8
• Fondos en paralelas asistidos con banda: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Hueco y arco alternos: 3 × 15
• Fondos en banco con pies elevados: 3 × 15', 'Estiramiento de tríceps sobre la cabeza, puente de hombro sentado y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-02-07","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-07', -7200207, 'Metcon', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    '21 min', '', 'Rounds For Time · Pistol partner · 4 rondas · Cap 16 min
Alterna piernas en cada repetición y usa anillas si necesitas asistencia.
• Pistol asistido: 6 reps por lado
• Hollow rock: 20 reps
• Sentadilla en salto: 15 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-02-07","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-08', -7000208, 'Activación', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Deslizamientos de escápula en barra: 10 reps
• Apertura de pectoral en pared: 30 s por lado
• Puente de hombro sentado: 10 reps

Activación · Preparación específica · 8 min
• Face pull con banda: 15 reps
• Rotación externa con banda: 12 reps por lado
• Arch hold: 20 s', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-02-08","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-08', -7100208, 'Tracción vertical y muscle-up', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Negativas de dominada · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Dominada negativa en 5 s: 3 × 6
• Scapular pull up lento: 3 × 6

Fuerza · Tracción vertical · 20 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Dominada negativa en 4 s: 4 × 8
• Australian pull up con pies elevados: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Face pull con banda: 3 × 15
• Elevación de rodillas colgado: 3 × 15', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-02-08","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-08', -7200208, 'Metcon', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    '23 min', '', 'AMRAP · Amanecer de parque · 18 min
Ritmo conversacional: el objetivo es acabar mejor de lo que empiezas.
• Carrera o cuerda: 200 m
• Australian pull up: 10 reps
• Push up: 15 reps
• Sentadilla al aire: 20 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-02-08","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-09', -7000209, 'Activación', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Estiramiento de isquios activo: 10 reps por lado
• Cat camel: 10 reps
• Puente de glúteo a una pierna: 10 reps por lado

Activación · Preparación específica · 8 min
• Sentadilla isométrica en pared: 30 s
• Zancada con salto suave: 8 reps por lado
• Plancha lateral: 30 s por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-02-09","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-09', -7100209, 'Piernas, salto y core', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Tobillo y rodilla · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Sentadilla en talones elevados: 3 × 6
• Elevación de talón a una pierna: 3 × 6

Fuerza · Piernas y core · 20 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Step up al cajón: 4 × 8
• Sentadilla búlgara: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 3 × 15
• Dead bug lento: 3 × 15', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-02-09","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-09', -7200209, 'Metcon', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    '19 min', '', 'For Time · Cierre de mesociclo · Cap 14 min
Última sesión del bloque: registra el tiempo para comparar con el siguiente mesociclo.
• Australian pull up: 30 reps
• Push up: 45 reps
• Zancada inversa: 30 reps por lado
• Hollow rock: 60 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-02-09","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-10', -7000210, 'Activación', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Deslizamiento de escápula en plancha: 10 reps
• Puente de hombro sentado: 10 reps
• Movilidad de codo con banda: 12 reps

Activación · Preparación específica · 8 min
• Lean en plancha adelantada: 20 s
• Face pull con banda: 15 reps
• Dead bug lento: 10 reps por lado', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-02-10","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-10', -7100210, 'Empuje horizontal y planche', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Muñeca y protracción · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Push up plus con pausa: 3 × 6
• Frogstand: 3 × 20 s

Fuerza · Empuje horizontal · 20 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Push up con agarre estrecho: 4 × 8
• Fondos en paralelas asistidos con banda: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Plancha con toque de hombro: 3 × 15
• Face pull con banda: 3 × 15', 'Rodillo en pectoral y dorsal, puente de hombro sentado y 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-02-10","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-10', -7200210, 'Metcon', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    '13 min', '', 'Tabata · Tabata de core · 8 rondas
Alterna ejercicio en cada ronda: 20 s de trabajo y 10 s de pausa.
• Hollow hold: 20 s
• Plancha lateral alternando lado: 20 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-02-10","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-11', -7000211, 'Activación', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Deslizamientos de escápula en barra: 10 reps
• Apertura de pectoral en pared: 30 s por lado
• Estiramiento de isquios activo: 10 reps por lado

Activación · Preparación específica · 8 min
• Face pull con banda: 15 reps
• Dead bug lento: 10 reps por lado
• Active hang: 30 s', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-02-11","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-11', -7100211, 'Tracción horizontal y front lever', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Control escapular colgado · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Scapular pull up lento: 3 × 6
• Arch hold: 3 × 20 s

Fuerza · Tracción horizontal · 20 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Australian pull up con pies elevados: 4 × 8
• Remo invertido con rodillas flexionadas: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Elevación de rodillas colgado: 3 × 15
• Arch hold: 3 × 30 s', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-02-11","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-11', -7200211, 'Metcon', 'Semana 6 · Mesociclo 2 · Básicos · Carga',
    '15 min', '', 'AMRAP · Burpee pull up · 10 min
Si no llegas a la barra, haz burpee y salto vertical con los brazos arriba.
• Burpee pull up: 5 reps
• Sentadilla al aire: 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-02-11","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-14', -7000214, 'Activación', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Círculos de hombro en plancha: 8 reps por lado
• Puente de hombro sentado: 10 reps
• Dislocaciones con banda: 15 reps

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Wall walk lento: 3 reps
• Scapular push up: 12 reps', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-02-14","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-14', -7100214, 'Empuje vertical y handstand', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Base de handstand · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pike hold con pies elevados: 4 × 20 s
• Plancha con hombros activos: 4 × 20 s

Fuerza · Empuje vertical · 20 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Pike push up: 4 × 10
• Fondos en banco: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 4 × 15
• Face pull con banda: 4 × 15', 'Estira dorsales y pectoral 45 s por lado, más movilidad de muñeca en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-02-14","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-14', -7200214, 'Metcon', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    '16 min', '', 'AMRAP · Burpee pull up · 11 min
Si no llegas a la barra, haz burpee y salto vertical con los brazos arriba.
• Burpee pull up: 5 reps
• Sentadilla al aire: 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-02-14","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-15', -7000215, 'Activación', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Apertura de pectoral en pared: 30 s por lado
• Puente de hombro sentado: 10 reps
• Colgado pasivo en barra: 30 s

Activación · Preparación específica · 8 min
• Rotación externa con banda: 12 reps por lado
• Arch hold: 20 s
• Scapular pull up: 10 reps', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-02-15","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-15', -7100215, 'Tracción vertical y muscle-up', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Control escapular en barra · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Scapular pull up lento: 4 × 6
• Active hang: 4 × 20 s

Fuerza · Tracción vertical · 20 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Dominada con banda: 4 × 10
• Australian pull up: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Rotación externa con banda: 4 × 15
• Arch hold: 4 × 30 s', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-02-15","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-15', -7200215, 'Metcon', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    '22 min', '', 'Rounds For Time · Anillas y suelo · 4 rondas · Cap 17 min
Alterna anillas y suelo para repartir la fatiga del hombro.
• Remo en anillas: 12 reps
• Push up: 15 reps
• Support hold en anillas: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-02-15","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-16', -7000216, 'Activación', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Cat camel: 10 reps
• Puente de glúteo a una pierna: 10 reps por lado
• Movilidad de tobillo en pared: 10 reps por lado

Activación · Preparación específica · 8 min
• Zancada con salto suave: 8 reps por lado
• Plancha lateral: 30 s por lado
• Monster walk con banda: 12 pasos por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-02-16","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-16', -7100216, 'Piernas, salto y core', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Control de sentadilla · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Sentadilla profunda sostenida: 4 × 20 s
• Sentadilla a cajón a una pierna: 4 × 6

Fuerza · Piernas y core · 20 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Sentadilla al aire con tempo 3-1-1: 4 × 10
• Zancada inversa: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Elevación de rodillas colgado: 4 × 15
• Copenhagen plank: 4 × 30 s', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-02-16","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-16', -7200216, 'Metcon', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    '18 min', '', 'EMOM · Death by burpee · 13 min
Minuto 1 una repetición, minuto 2 dos, y así hasta que no llegues a tiempo.
• Burpee: 1 rep acumulativa por minuto', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-02-16","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-17', -7000217, 'Activación', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Puente de hombro sentado: 10 reps
• Movilidad de codo con banda: 12 reps
• Apertura de pectoral en pared: 30 s por lado

Activación · Preparación específica · 8 min
• Face pull con banda: 15 reps
• Dead bug lento: 10 reps por lado
• Scapular push up: 12 reps', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-02-17","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-17', -7100217, 'Empuje horizontal y planche', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Base de planche · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Plancha adelantada con hombros activos: 4 × 20 s
• Scapular push up lento: 4 × 6

Fuerza · Empuje horizontal · 20 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Push up estricto: 4 × 10
• Fondos en banco: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Rueda abdominal: 4 × 15
• Elevación en Y con banda: 4 × 15', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-02-17","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-17', -7200217, 'Metcon', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    '23 min', '', 'EMOM · EMOM de tracción · 18 min
Un movimiento por minuto, rotando siempre en el mismo orden.
• Dominada con banda si hace falta: 4 reps
• Australian pull up: 8 reps
• Elevación de rodillas colgado: 10 reps
• Active hang: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-02-17","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-18', -7000218, 'Activación', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Apertura de pectoral en pared: 30 s por lado
• Estiramiento de isquios activo: 10 reps por lado
• Colgado pasivo en barra: 30 s

Activación · Preparación específica · 8 min
• Dead bug lento: 10 reps por lado
• Active hang: 30 s
• Scapular pull up: 10 reps', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-02-18","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-18', -7100218, 'Tracción horizontal y front lever', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Base de front lever · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck hang en barra: 4 × 20 s
• Hollow hold: 4 × 20 s

Fuerza · Tracción horizontal · 20 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Australian pull up: 4 × 10
• Remo con banda a una mano: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Toes to bar estricto: 4 × 15
• Face pull con banda: 4 × 15', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal y isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-02-18","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-18', -7200218, 'Metcon', 'Semana 7 · Mesociclo 2 · Básicos · Pico',
    '20 min', '', 'Rounds For Time · Core cluster · 5 rondas · Cap 15 min
Sin balanceos: si no controlas el movimiento, reduce el rango.
• Toes to bar o elevación de rodillas: 8 reps
• Hollow rock: 15 reps
• Plancha lateral: 30 s por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-02-18","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-21', -7000221, 'Activación', 'Semana 8 · Mesociclo 2 · Básicos · Descarga',
    '10 min', '', 'Movilidad · Empuje vertical · 10 min
• Puente de hombro sentado: 10 reps
• Dislocaciones con banda: 15 reps
• Wall slides en pared: 12 reps
• Movilidad de muñeca en el suelo: 45 s', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-02-21","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-21', -7100221, 'Empuje vertical y handstand', 'Semana 8 · Mesociclo 2 · Básicos · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Handstand en pared · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall handstand de espaldas: 2 × 15 s
• Hollow hold: 2 × 15 s

Fuerza · Empuje vertical · 20 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Push up con pies elevados: 2 × 8
• Press de hombro con banda: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Dead bug lento: 2 × 12
• Elevación en Y con banda: 2 × 12', 'Colgado pasivo en barra 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-02-21","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-21', -7200221, 'Metcon', 'Semana 8 · Mesociclo 2 · Básicos · Descarga',
    '14 min', '', 'AMRAP · Ring engine · 9 min
Las anillas mandan: mantén los codos pegados y el cuerpo en tensión.
• Remo en anillas: 10 reps
• Fondos en anillas asistidos: 8 reps
• Support hold en anillas: 20 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-02-21","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-22', -7000222, 'Activación', 'Semana 8 · Mesociclo 2 · Básicos · Descarga',
    '10 min', '', 'Movilidad · Tracción vertical · 10 min
• Puente de hombro sentado: 10 reps
• Colgado pasivo en barra: 30 s
• Dislocaciones con banda: 15 reps
• Rotación torácica tumbado: 8 reps por lado', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-02-22","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-22', -7100222, 'Tracción vertical y muscle-up', 'Semana 8 · Mesociclo 2 · Básicos · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Dominada asistida · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Dominada con banda: 2 × 5
• Chin over bar hold: 2 × 15 s

Fuerza · Tracción vertical · 20 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Dominada supina asistida: 2 × 8
• Remo en anillas: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Remo a una mano con banda: 2 × 12
• Plancha con toque de hombro: 2 × 12', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-02-22","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-22', -7200222, 'Metcon', 'Semana 8 · Mesociclo 2 · Básicos · Descarga',
    '11 min', '', 'AMRAP · Descarga activa · 6 min
Ritmo suave, respirando por la nariz de principio a fin.
• Active hang: 30 s
• Push up: 8 reps
• Sentadilla al aire: 12 reps
• Dead bug lento: 10 reps por lado', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-02-22","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-23', -7000223, 'Activación', 'Semana 8 · Mesociclo 2 · Básicos · Descarga',
    '10 min', '', 'Movilidad · Piernas y core · 10 min
• Puente de glúteo a una pierna: 10 reps por lado
• Movilidad de tobillo en pared: 10 reps por lado
• Sentadilla profunda sostenida: 45 s
• Cossack squat: 8 reps por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-02-23","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-23', -7100223, 'Piernas, salto y core', 'Semana 8 · Mesociclo 2 · Básicos · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Base de pistol · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pistol asistido con anillas: 2 × 5
• Sentadilla búlgara: 2 × 5

Fuerza · Piernas y core · 20 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Sentadilla a cajón: 2 × 8
• Puente de glúteo a una pierna: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• V-up: 2 × 12
• Puente de glúteo a una pierna: 2 × 12', 'Sentadilla profunda sostenida 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-02-23","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-23', -7200223, 'Metcon', 'Semana 8 · Mesociclo 2 · Básicos · Descarga',
    '12 min', '', 'AMRAP · Hollow to bar · 7 min
Mantén la pelvis retrovertida en todo el trabajo de core.
• Hollow rock: 20 reps
• Australian pull up: 10 reps
• Plancha con toque de hombro: 20 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-02-23","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-24', -7000224, 'Activación', 'Semana 8 · Mesociclo 2 · Básicos · Descarga',
    '10 min', '', 'Movilidad · Empuje horizontal · 10 min
• Movilidad de codo con banda: 12 reps
• Apertura de pectoral en pared: 30 s por lado
• Movilidad de muñeca en el suelo: 45 s
• Rotación torácica en cuadrupedia: 8 reps por lado', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-02-24","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-24', -7100224, 'Empuje horizontal y planche', 'Semana 8 · Mesociclo 2 · Básicos · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Tensión de línea · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Hollow hold: 2 × 15 s
• Plancha adelantada con hombros activos: 2 × 15 s

Fuerza · Empuje horizontal · 20 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Push up con rodillas apoyadas y tempo 3-1-1: 2 × 8
• Push up inclinado: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 2 × 12
• Push up plus con pausa: 2 × 12', 'Apertura de pectoral en pared, colgado pasivo 3 × 30 s y movilidad de muñeca. 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-02-24","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-24', -7200224, 'Metcon', 'Semana 8 · Mesociclo 2 · Básicos · Descarga',
    '11 min', '', 'Unbroken · Unbroken de suelo · 6 min
Series sin pausa: para en cuanto pierdas la línea del cuerpo.
• Push up: 5 series de 12 reps sin parar
• Hollow hold: 5 series de 30 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-02-24","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-25', -7000225, 'Activación', 'Semana 8 · Mesociclo 2 · Básicos · Descarga',
    '10 min', '', 'Movilidad · Tracción horizontal · 10 min
• Estiramiento de isquios activo: 10 reps por lado
• Colgado pasivo en barra: 30 s
• Rotación torácica tumbado: 8 reps por lado
• Cat camel: 10 reps', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-02-25","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-25', -7100225, 'Tracción horizontal y front lever', 'Semana 8 · Mesociclo 2 · Básicos · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Compresión y tensión · 10 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Compresión sentado con piernas rectas: 2 × 15 s
• Tuck hang en barra: 2 × 15 s

Fuerza · Tracción horizontal · 20 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Remo en anillas: 2 × 8
• Australian pull up con agarre supino: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Rueda abdominal: 2 × 12
• Rotación externa con banda: 2 × 12', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-02-25","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-25', -7200225, 'Metcon', 'Semana 8 · Mesociclo 2 · Básicos · Descarga',
    '15 min', '', 'Rounds For Time · Zancada y barra · 3 rondas · Cap 10 min
Zancadas sin apoyar la rodilla y dominadas fragmentadas desde la primera ronda.
• Zancada caminando: 20 reps
• Dominada: 6 reps
• Hollow hold: 30 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-02-25","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-28', -7000228, 'Activación', 'Semana 9 · Mesociclo 3 · Acumulación · Introducción',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Dislocaciones con banda: 15 reps
• Rotación torácica en cuadrupedia: 8 reps por lado
• Círculos de hombro en plancha: 8 reps por lado

Activación · Preparación específica · 8 min
• Scapular push up: 12 reps
• Pike hold contra pared: 30 s
• Hollow hold: 30 s', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-02-28","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-28', -7100228, 'Empuje vertical y handstand', 'Semana 9 · Mesociclo 3 · Acumulación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Line drills · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall handstand de frente: 4 × 20 s
• Handstand toe pulls: 4 × 5

Fuerza · Empuje vertical · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Pike push up con pies elevados: 4 × 8
• Press de hombro en anillas: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 30 s
• Extensión de tríceps en anillas: 3 × 15', 'Estiramiento de tríceps sobre la cabeza, puente de hombro sentado y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-02-28","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-28', -7200228, 'Metcon', 'Semana 9 · Mesociclo 3 · Acumulación · Introducción',
    '19 min', '', 'AMRAP · Ring engine · 14 min
Las anillas mandan: mantén los codos pegados y el cuerpo en tensión.
• Remo en anillas: 10 reps
• Fondos en anillas asistidos: 8 reps
• Support hold en anillas: 20 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-02-28","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-29', -7000229, 'Activación', 'Semana 9 · Mesociclo 3 · Acumulación · Introducción',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Colgado pasivo en barra: 30 s
• Movilidad de codo y muñeca: 45 s
• Apertura de pectoral en pared: 30 s por lado

Activación · Preparación específica · 8 min
• Scapular pull up: 10 reps
• Active hang: 30 s
• Rotación externa con banda: 12 reps por lado', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-02-29","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-29', -7100229, 'Tracción vertical y muscle-up', 'Semana 9 · Mesociclo 3 · Acumulación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Tracción explosiva · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Dominada explosiva: 4 × 5
• Scapular pull up lento: 4 × 5

Fuerza · Tracción vertical · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Dominada estricta con tempo 3-1-1: 4 × 8
• Remo en anillas: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Curl de bíceps en anillas: 3 × 15
• Hollow hold: 3 × 30 s', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-02-29","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-02-29', -7200229, 'Metcon', 'Semana 9 · Mesociclo 3 · Acumulación · Introducción',
    '14 min', '', 'AMRAP · Descarga activa · 9 min
Ritmo suave, respirando por la nariz de principio a fin.
• Active hang: 30 s
• Push up: 8 reps
• Sentadilla al aire: 12 reps
• Dead bug lento: 10 reps por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-02-29","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-01', -7000301, 'Activación', 'Semana 9 · Mesociclo 3 · Acumulación · Introducción',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Movilidad de tobillo en pared: 10 reps por lado
• Movilidad de cadera en 90/90: 8 reps por lado
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Monster walk con banda: 12 pasos por lado
• Dead bug lento: 10 reps por lado
• Zancada con salto suave: 8 reps por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-03-01","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-01', -7100301, 'Piernas, salto y core', 'Semana 9 · Mesociclo 3 · Acumulación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Cadena posterior · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Nordic curl asistido: 4 × 5
• Puente de glúteo a una pierna: 4 × 5

Fuerza · Piernas y core · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Sentadilla a una pierna a cajón: 4 × 8
• Peso muerto rumano a una pierna: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 30 s
• Elevación de talón a una pierna: 3 × 15', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-03-01","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-01', -7200301, 'Metcon', 'Semana 9 · Mesociclo 3 · Acumulación · Introducción',
    '18 min', '', 'AMRAP · Park engine · 13 min
Ritmo constante: elige la progresión que te deje seguir sin parar.
• Australian pull up: 8 reps
• Push up: 10 reps
• Sentadilla al aire: 15 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-03-01","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-02', -7000302, 'Activación', 'Semana 9 · Mesociclo 3 · Acumulación · Introducción',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Apertura de pectoral en pared: 30 s por lado
• Dislocaciones con banda: 15 reps
• Puente de hombro sentado: 10 reps

Activación · Preparación específica · 8 min
• Scapular push up: 12 reps
• Plancha con toque de hombro: 10 reps por lado
• Face pull con banda: 15 reps', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-03-02","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-02', -7100302, 'Empuje horizontal y planche', 'Semana 9 · Mesociclo 3 · Acumulación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Pseudo push up · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pseudo planche push up con rodillas apoyadas: 4 × 5
• Planche lean en el suelo: 4 × 20 s

Fuerza · Empuje horizontal · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Push up arquero: 4 × 8
• Fondos en anillas asistidos: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Extensión de tríceps en anillas: 3 × 15
• Hollow hold: 3 × 30 s', 'Rodillo en pectoral y dorsal, puente de hombro sentado y 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-03-02","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-02', -7200302, 'Metcon', 'Semana 9 · Mesociclo 3 · Acumulación · Introducción',
    '19 min', '', 'EMOM · EMOM de tracción · 14 min
Un movimiento por minuto, rotando siempre en el mismo orden.
• Dominada con banda si hace falta: 4 reps
• Australian pull up: 8 reps
• Elevación de rodillas colgado: 10 reps
• Active hang: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-03-02","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-03', -7000303, 'Activación', 'Semana 9 · Mesociclo 3 · Acumulación · Introducción',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Colgado pasivo en barra: 30 s
• Dislocaciones con banda: 15 reps
• Apertura de pectoral en pared: 30 s por lado

Activación · Preparación específica · 8 min
• Scapular pull up: 10 reps
• Remo con banda: 15 reps
• Dead bug lento: 10 reps por lado', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-03-03","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-03', -7100303, 'Tracción horizontal y front lever', 'Semana 9 · Mesociclo 3 · Acumulación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Compresión avanzada · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• L-sit en paralelas: 4 × 20 s
• Tuck front lever: 4 × 20 s

Fuerza · Tracción horizontal · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Remo en anillas arquero: 4 × 8
• Remo en anillas con pies elevados: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• L-sit en paralelas: 3 × 30 s
• Curl de bíceps en anillas: 3 × 15', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-03-03","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-03', -7200303, 'Metcon', 'Semana 9 · Mesociclo 3 · Acumulación · Introducción',
    '19 min', '', 'Rounds For Time · Zancada y barra · 4 rondas · Cap 14 min
Zancadas sin apoyar la rodilla y dominadas fragmentadas desde la primera ronda.
• Zancada caminando: 20 reps
• Dominada: 6 reps
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-03-03","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-06', -7000306, 'Activación', 'Semana 10 · Mesociclo 3 · Acumulación · Carga',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Wall slides en pared: 12 reps
• Apertura de pectoral en marco de puerta: 30 s por lado
• Puente de hombro sentado: 10 reps

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Push up plus: 10 reps
• Wall walk lento: 3 reps', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-03-06","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-06', -7100306, 'Empuje vertical y handstand', 'Semana 10 · Mesociclo 3 · Acumulación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Handstand de barriga a pared · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall handstand de frente: 4 × 25 s
• Hollow to arch: 4 × 6

Fuerza · Empuje vertical · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Pike push up con pies elevados: 4 × 10
• Fondos en paralelas: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Hueco y arco alternos: 4 × 15
• Fondos en banco con pies elevados: 4 × 15', 'Estira dorsales y pectoral 45 s por lado, más movilidad de muñeca en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-03-06","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-06', -7200306, 'Metcon', 'Semana 10 · Mesociclo 3 · Acumulación · Carga',
    '21 min', '', 'Rounds For Time · Zancada y barra · 4 rondas · Cap 16 min
Zancadas sin apoyar la rodilla y dominadas fragmentadas desde la primera ronda.
• Zancada caminando: 20 reps
• Dominada: 6 reps
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-03-06","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-07', -7000307, 'Activación', 'Semana 10 · Mesociclo 3 · Acumulación · Carga',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Dislocaciones con banda: 15 reps
• Cat camel: 10 reps
• Puente de hombro sentado: 10 reps

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Hollow hold: 30 s
• Arch hold: 20 s', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-03-07","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-07', -7100307, 'Tracción vertical y muscle-up', 'Semana 10 · Mesociclo 3 · Acumulación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Dominada estricta · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Dominada estricta: 4 × 6
• Active hang a una mano alterna: 4 × 25 s

Fuerza · Tracción vertical · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Dominada estricta: 4 × 10
• Remo en anillas con pies elevados: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Face pull con banda: 4 × 15
• Elevación de rodillas colgado: 4 × 15', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-03-07","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-07', -7200307, 'Metcon', 'Semana 10 · Mesociclo 3 · Acumulación · Carga',
    '19 min', '', 'For Time · Cierre de mesociclo · Cap 14 min
Última sesión del bloque: registra el tiempo para comparar con el siguiente mesociclo.
• Australian pull up: 30 reps
• Push up: 45 reps
• Zancada inversa: 30 reps por lado
• Hollow rock: 60 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-03-07","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-08', -7000308, 'Activación', 'Semana 10 · Mesociclo 3 · Acumulación · Carga',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Sentadilla profunda sostenida: 45 s
• Círculos de cadera en cuadrupedia: 8 reps por lado
• Puente de glúteo a una pierna: 10 reps por lado

Activación · Preparación específica · 8 min
• Puente de glúteo: 15 reps
• Hollow hold: 30 s
• Plancha lateral: 30 s por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-03-08","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-08', -7100308, 'Piernas, salto y core', 'Semana 10 · Mesociclo 3 · Acumulación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Pistol progresivo · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pistol a cajón: 4 × 6
• Shrimp squat asistido: 4 × 6

Fuerza · Piernas y core · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Sentadilla búlgara: 4 × 10
• Puente nórdico asistido: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 4 × 15
• Dead bug lento: 4 × 15', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-03-08","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-08', -7200308, 'Metcon', 'Semana 10 · Mesociclo 3 · Acumulación · Carga',
    '23 min', '', 'Rounds For Time · Grin and bear · 5 rondas · Cap 18 min
Fragmenta las dominadas antes de llegar al fallo.
• Dominada con banda si hace falta: 5 reps
• Toes to bar o elevación de rodillas: 8 reps
• Zancada inversa: 10 reps por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-03-08","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-09', -7000309, 'Activación', 'Semana 10 · Mesociclo 3 · Acumulación · Carga',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Movilidad de muñeca en el suelo: 45 s
• Cat camel: 10 reps
• Movilidad de codo con banda: 12 reps

Activación · Preparación específica · 8 min
• Push up plus: 10 reps
• Band pull apart: 15 reps
• Dead bug lento: 10 reps por lado', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-03-09","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-09', -7100309, 'Empuje horizontal y planche', 'Semana 10 · Mesociclo 3 · Acumulación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Planche lean · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Planche lean en el suelo: 4 × 25 s
• Frogstand: 4 × 25 s

Fuerza · Empuje horizontal · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Push up con pies elevados: 4 × 10
• Fondos en paralelas: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Plancha con toque de hombro: 4 × 15
• Face pull con banda: 4 × 15', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-03-09","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-09', -7200309, 'Metcon', 'Semana 10 · Mesociclo 3 · Acumulación · Carga',
    '15 min', '', 'Unbroken · Unbroken de barra · 10 min
Cada serie tiene que salir sin soltar la barra: si la rompes, bajas de progresión.
• Dominada estricta: 5 series sin soltar
• Australian pull up: 5 series de 10 reps sin soltar', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-03-09","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-10', -7000310, 'Activación', 'Semana 10 · Mesociclo 3 · Acumulación · Carga',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Rotación torácica tumbado: 8 reps por lado
• Movilidad de cadera en 90/90: 8 reps por lado
• Estiramiento de isquios activo: 10 reps por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Elevación de rodillas colgado: 10 reps
• Active hang: 30 s', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-03-10","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-10', -7100310, 'Tracción horizontal y front lever', 'Semana 10 · Mesociclo 3 · Acumulación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Tuck front lever · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck front lever: 4 × 25 s
• Front lever negativo desde tuck: 4 × 6

Fuerza · Tracción horizontal · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Remo en anillas con pies elevados: 4 × 10
• Australian pull up con tempo 3-1-1: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Elevación de rodillas colgado: 4 × 15
• Arch hold: 4 × 30 s', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal y isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-03-10","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-10', -7200310, 'Metcon', 'Semana 10 · Mesociclo 3 · Acumulación · Carga',
    '17 min', '', 'Estaciones de tiempo · Estaciones de core · 12 min · 3 estaciones
Un minuto por estación y cuatro vueltas, cambiando sin pausa.
• Hollow hold: 1 min
• Plancha con toque de hombro: 1 min
• Elevación de rodillas colgado: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-03-10","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-13', -7000313, 'Activación', 'Semana 11 · Mesociclo 3 · Acumulación · Pico',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Movilidad de muñeca en el suelo: 45 s
• Cat camel: 10 reps
• Dislocaciones con banda: 15 reps

Activación · Preparación específica · 8 min
• Face pull con banda: 15 reps
• Elevación en Y con banda: 12 reps
• Scapular push up: 12 reps', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-03-13","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-13', -7100313, 'Empuje vertical y handstand', 'Semana 11 · Mesociclo 3 · Acumulación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Entradas controladas · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall walk: 5 × 6
• Pike hold con pies elevados: 5 × 25 s

Fuerza · Empuje vertical · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Push up en pica con cajón: 5 × 10
• Fondos en anillas asistidos: 4 × 15', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 4 × 20
• Face pull con banda: 4 × 20', 'Colgado pasivo en barra 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-03-13","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-13', -7200313, 'Metcon', 'Semana 11 · Mesociclo 3 · Acumulación · Pico',
    '22 min', '', 'Estaciones de tiempo · Motor de piernas · 17 min · 3 estaciones
Un minuto por estación y cinco vueltas, sin descanso entre estaciones.
• Sentadilla al aire: 1 min
• Step up al cajón: 1 min
• Puente de glúteo a una pierna: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-03-13","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-14', -7000314, 'Activación', 'Semana 11 · Mesociclo 3 · Acumulación · Pico',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Rotación torácica tumbado: 8 reps por lado
• Deslizamientos de escápula en barra: 10 reps
• Colgado pasivo en barra: 30 s

Activación · Preparación específica · 8 min
• Remo con banda: 15 reps
• Face pull con banda: 15 reps
• Scapular pull up: 10 reps', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-03-14","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-14', -7100314, 'Tracción vertical y muscle-up', 'Semana 11 · Mesociclo 3 · Acumulación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Camino al muscle-up · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Dominada alta al pecho: 5 × 6
• Transición de muscle-up con banda: 5 × 6

Fuerza · Tracción vertical · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Dominada supina: 5 × 10
• Australian pull up con pies elevados: 4 × 15', 'Fuerza · Accesorio y core · 10 min
• Rotación externa con banda: 4 × 20
• Arch hold: 4 × 40 s', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-03-14","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-14', -7200314, 'Metcon', 'Semana 11 · Mesociclo 3 · Acumulación · Pico',
    '18 min', '', 'EMOM · Death by burpee · 13 min
Minuto 1 una repetición, minuto 2 dos, y así hasta que no llegues a tiempo.
• Burpee: 1 rep acumulativa por minuto', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-03-14","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-15', -7000315, 'Activación', 'Semana 11 · Mesociclo 3 · Acumulación · Pico',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Cossack squat: 8 reps por lado
• Estiramiento de isquios activo: 10 reps por lado
• Movilidad de tobillo en pared: 10 reps por lado

Activación · Preparación específica · 8 min
• Elevación de talón a una pierna: 15 reps por lado
• Sentadilla isométrica en pared: 30 s
• Monster walk con banda: 12 pasos por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-03-15","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-15', -7100315, 'Piernas, salto y core', 'Semana 11 · Mesociclo 3 · Acumulación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Unilateral con control · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Zancada búlgara con tempo: 5 × 6
• Pistol asistido con anillas: 5 × 6

Fuerza · Piernas y core · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Zancada caminando: 5 × 10
• Curl de isquio con banda: 4 × 15', 'Fuerza · Accesorio y core · 10 min
• Elevación de rodillas colgado: 4 × 20
• Copenhagen plank: 4 × 40 s', 'Sentadilla profunda sostenida 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-03-15","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-15', -7200315, 'Metcon', 'Semana 11 · Mesociclo 3 · Acumulación · Pico',
    '20 min', '', 'Ladder · Push ladder · 21-15-9 · Cap 15 min
Si las flexiones se rompen, sube las manos a un cajón.
• Push up: reps del esquema
• Sentadilla al aire: reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-03-15","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-16', -7000316, 'Activación', 'Semana 11 · Mesociclo 3 · Acumulación · Pico',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Rotación torácica en cuadrupedia: 8 reps por lado
• Deslizamiento de escápula en plancha: 10 reps
• Apertura de pectoral en pared: 30 s por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Lean en plancha adelantada: 20 s
• Scapular push up: 12 reps', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-03-16","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-16', -7100316, 'Empuje horizontal y planche', 'Semana 11 · Mesociclo 3 · Acumulación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Tuck planche asistido · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck planche con banda: 5 × 25 s
• Planche lean en el suelo: 5 × 25 s

Fuerza · Empuje horizontal · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Push up en anillas: 5 × 10
• Push up con agarre estrecho: 4 × 15', 'Fuerza · Accesorio y core · 10 min
• Rueda abdominal: 4 × 20
• Elevación en Y con banda: 4 × 20', 'Apertura de pectoral en pared, colgado pasivo 3 × 30 s y movilidad de muñeca. 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-03-16","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-16', -7200316, 'Metcon', 'Semana 11 · Mesociclo 3 · Acumulación · Pico',
    '18 min', '', 'AMRAP · Piernas al aire · 13 min
Aterriza suave en los saltos y mantén el pecho alto en las zancadas.
• Sentadilla al aire: 20 reps
• Zancada con salto: 10 reps por lado
• Salto al cajón: 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-03-16","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-17', -7000317, 'Activación', 'Semana 11 · Mesociclo 3 · Acumulación · Pico',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Cat camel: 10 reps
• Deslizamientos de escápula en barra: 10 reps
• Colgado pasivo en barra: 30 s

Activación · Preparación específica · 8 min
• Arch hold: 20 s
• Face pull con banda: 15 reps
• Scapular pull up: 10 reps', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-03-17","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-17', -7100317, 'Tracción horizontal y front lever', 'Semana 11 · Mesociclo 3 · Acumulación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Raises en tuck · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck front lever raise: 5 × 6
• Tuck front lever: 5 × 25 s

Fuerza · Tracción horizontal · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Remo en anillas al esternón: 5 × 10
• Australian pull up con pies elevados: 4 × 15', 'Fuerza · Accesorio y core · 10 min
• Toes to bar estricto: 4 × 20
• Face pull con banda: 4 × 20', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-03-17","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-17', -7200317, 'Metcon', 'Semana 11 · Mesociclo 3 · Acumulación · Pico',
    '16 min', '', 'For Time · Sprint de suelo · Cap 11 min
Es corto: entra fuerte y aguanta el ritmo hasta el final.
• Push up: 50 reps
• Hollow rock: 50 reps
• Plancha con toque de hombro: 50 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-03-17","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-20', -7000320, 'Activación', 'Semana 12 · Mesociclo 3 · Acumulación · Descarga',
    '10 min', '', 'Movilidad · Empuje vertical · 10 min
• Rotación torácica en cuadrupedia: 8 reps por lado
• Círculos de hombro en plancha: 8 reps por lado
• Wall slides en pared: 12 reps
• Apertura de pectoral en marco de puerta: 30 s por lado', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-03-20","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-20', -7100320, 'Empuje vertical y handstand', 'Semana 12 · Mesociclo 3 · Acumulación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Line drills · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall handstand de frente: 3 × 20 s
• Handstand toe pulls: 3 × 5

Fuerza · Empuje vertical · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Pike push up con pies elevados: 3 × 8
• Press de hombro en anillas: 2 × 12', 'Fuerza · Accesorio y core · 10 min
• Dead bug lento: 2 × 15
• Elevación en Y con banda: 2 × 15', 'Estiramiento de tríceps sobre la cabeza, puente de hombro sentado y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-03-20","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-20', -7200320, 'Metcon', 'Semana 12 · Mesociclo 3 · Acumulación · Descarga',
    '11 min', '', 'Unbroken · Bar hang challenge · 6 min
Cada bloque empieza colgado: si sueltas, descansas un minuto y sigues.
• Active hang: 5 series de 45 s
• Elevación de rodillas colgado: 5 series de 10 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-03-20","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-21', -7000321, 'Activación', 'Semana 12 · Mesociclo 3 · Acumulación · Descarga',
    '10 min', '', 'Movilidad · Tracción vertical · 10 min
• Movilidad de codo y muñeca: 45 s
• Apertura de pectoral en pared: 30 s por lado
• Dislocaciones con banda: 15 reps
• Cat camel: 10 reps', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-03-21","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-21', -7100321, 'Tracción vertical y muscle-up', 'Semana 12 · Mesociclo 3 · Acumulación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Tracción explosiva · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Dominada explosiva: 3 × 5
• Scapular pull up lento: 3 × 5

Fuerza · Tracción vertical · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Dominada estricta con tempo 3-1-1: 3 × 8
• Remo en anillas: 2 × 12', 'Fuerza · Accesorio y core · 10 min
• Remo a una mano con banda: 2 × 15
• Plancha con toque de hombro: 2 × 15', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-03-21","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-21', -7200321, 'Metcon', 'Semana 12 · Mesociclo 3 · Acumulación · Descarga',
    '17 min', '', 'For Time · Chipper de parque · Cap 12 min
Trabajo continuo de arriba abajo, sin repetir estación.
• Australian pull up: 40 reps
• Push up: 60 reps
• Sentadilla al aire: 80 reps
• Hollow rock: 40 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-03-21","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-22', -7000322, 'Activación', 'Semana 12 · Mesociclo 3 · Acumulación · Descarga',
    '10 min', '', 'Movilidad · Piernas y core · 10 min
• Movilidad de cadera en 90/90: 8 reps por lado
• Cat camel: 10 reps
• Sentadilla profunda sostenida: 45 s
• Círculos de cadera en cuadrupedia: 8 reps por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-03-22","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-22', -7100322, 'Piernas, salto y core', 'Semana 12 · Mesociclo 3 · Acumulación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Cadena posterior · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Nordic curl asistido: 3 × 5
• Puente de glúteo a una pierna: 3 × 5

Fuerza · Piernas y core · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Sentadilla a una pierna a cajón: 3 × 8
• Peso muerto rumano a una pierna: 2 × 12', 'Fuerza · Accesorio y core · 10 min
• V-up: 2 × 15
• Puente de glúteo a una pierna: 2 × 15', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-03-22","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-22', -7200322, 'Metcon', 'Semana 12 · Mesociclo 3 · Acumulación · Descarga',
    '11 min', '', 'Tabata · Tabata de empuje · 5 rondas
Mismo número de repeticiones en las ocho rondas: elige un ritmo sostenible.
• Push up: 20 s
• Fondos en banco: 20 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-03-22","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-23', -7000323, 'Activación', 'Semana 12 · Mesociclo 3 · Acumulación · Descarga',
    '10 min', '', 'Movilidad · Empuje horizontal · 10 min
• Dislocaciones con banda: 15 reps
• Puente de hombro sentado: 10 reps
• Movilidad de muñeca en el suelo: 45 s
• Cat camel: 10 reps', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-03-23","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-23', -7100323, 'Empuje horizontal y planche', 'Semana 12 · Mesociclo 3 · Acumulación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Pseudo push up · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pseudo planche push up con rodillas apoyadas: 3 × 5
• Planche lean en el suelo: 3 × 20 s

Fuerza · Empuje horizontal · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Push up arquero: 3 × 8
• Fondos en anillas asistidos: 2 × 12', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 2 × 15
• Push up plus con pausa: 2 × 15', 'Rodillo en pectoral y dorsal, puente de hombro sentado y 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-03-23","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-23', -7200323, 'Metcon', 'Semana 12 · Mesociclo 3 · Acumulación · Descarga',
    '11 min', '', 'AMRAP · Burpee pull up · 6 min
Si no llegas a la barra, haz burpee y salto vertical con los brazos arriba.
• Burpee pull up: 5 reps
• Sentadilla al aire: 10 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-03-23","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-24', -7000324, 'Activación', 'Semana 12 · Mesociclo 3 · Acumulación · Descarga',
    '10 min', '', 'Movilidad · Tracción horizontal · 10 min
• Dislocaciones con banda: 15 reps
• Apertura de pectoral en pared: 30 s por lado
• Rotación torácica tumbado: 8 reps por lado
• Movilidad de cadera en 90/90: 8 reps por lado', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-03-24","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-24', -7100324, 'Tracción horizontal y front lever', 'Semana 12 · Mesociclo 3 · Acumulación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Compresión avanzada · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• L-sit en paralelas: 3 × 20 s
• Tuck front lever: 3 × 20 s

Fuerza · Tracción horizontal · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Remo en anillas arquero: 3 × 8
• Remo en anillas con pies elevados: 2 × 12', 'Fuerza · Accesorio y core · 10 min
• Rueda abdominal: 2 × 15
• Rotación externa con banda: 2 × 15', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-03-24","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-24', -7200324, 'Metcon', 'Semana 12 · Mesociclo 3 · Acumulación · Descarga',
    '13 min', '', 'Ladder · Dips and squats · 21-15-9 · Cap 8 min
Fondos en paralelas o en banco según tu nivel.
• Fondos en paralelas: reps del esquema
• Sentadilla en salto: reps del esquema', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-03-24","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-27', -7000327, 'Activación', 'Semana 13 · Mesociclo 4 · Acumulación · Introducción',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Apertura de pectoral en marco de puerta: 30 s por lado
• Puente de hombro sentado: 10 reps
• Movilidad de muñeca en el suelo: 45 s

Activación · Preparación específica · 8 min
• Push up plus: 10 reps
• Wall walk lento: 3 reps
• Face pull con banda: 15 reps', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-03-27","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-27', -7100327, 'Empuje vertical y handstand', 'Semana 13 · Mesociclo 4 · Acumulación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Handstand de barriga a pared · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall handstand de frente: 4 × 20 s
• Hollow to arch: 4 × 5

Fuerza · Empuje vertical · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Pike push up con pies elevados: 4 × 8
• Fondos en paralelas: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 30 s
• Extensión de tríceps en anillas: 3 × 15', 'Estira dorsales y pectoral 45 s por lado, más movilidad de muñeca en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-03-27","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-27', -7200327, 'Metcon', 'Semana 13 · Mesociclo 4 · Acumulación · Introducción',
    '20 min', '', 'Rounds For Time · Pike y pistol · 5 rondas · Cap 15 min
Alterna piernas en el pistol y controla la bajada del pike.
• Pike push up: 8 reps
• Pistol asistido: 5 reps por lado
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-03-27","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-28', -7000328, 'Activación', 'Semana 13 · Mesociclo 4 · Acumulación · Introducción',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Cat camel: 10 reps
• Puente de hombro sentado: 10 reps
• Rotación torácica tumbado: 8 reps por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Arch hold: 20 s
• Remo con banda: 15 reps', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-03-28","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-28', -7100328, 'Tracción vertical y muscle-up', 'Semana 13 · Mesociclo 4 · Acumulación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Dominada estricta · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Dominada estricta: 4 × 5
• Active hang a una mano alterna: 4 × 20 s

Fuerza · Tracción vertical · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Dominada estricta: 4 × 8
• Remo en anillas con pies elevados: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Curl de bíceps en anillas: 3 × 15
• Hollow hold: 3 × 30 s', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-03-28","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-28', -7200328, 'Metcon', 'Semana 13 · Mesociclo 4 · Acumulación · Introducción',
    '19 min', '', 'Estaciones de tiempo · Estaciones del parque · 14 min · 4 estaciones
Un minuto por estación y cuatro vueltas, sin descanso entre estaciones.
• Australian pull up: 1 min
• Push up: 1 min
• Sentadilla al aire: 1 min
• Plancha frontal: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-03-28","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-29', -7000329, 'Activación', 'Semana 13 · Mesociclo 4 · Acumulación · Introducción',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Círculos de cadera en cuadrupedia: 8 reps por lado
• Puente de glúteo a una pierna: 10 reps por lado
• Cossack squat: 8 reps por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Plancha lateral: 30 s por lado
• Elevación de talón a una pierna: 15 reps por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-03-29","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-29', -7100329, 'Piernas, salto y core', 'Semana 13 · Mesociclo 4 · Acumulación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Pistol progresivo · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pistol a cajón: 4 × 5
• Shrimp squat asistido: 4 × 5

Fuerza · Piernas y core · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Sentadilla búlgara: 4 × 8
• Puente nórdico asistido: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 30 s
• Elevación de talón a una pierna: 3 × 15', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-03-29","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-29', -7200329, 'Metcon', 'Semana 13 · Mesociclo 4 · Acumulación · Introducción',
    '19 min', '', 'EMOM · EMOM de tracción · 14 min
Un movimiento por minuto, rotando siempre en el mismo orden.
• Dominada con banda si hace falta: 4 reps
• Australian pull up: 8 reps
• Elevación de rodillas colgado: 10 reps
• Active hang: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-03-29","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-30', -7000330, 'Activación', 'Semana 13 · Mesociclo 4 · Acumulación · Introducción',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Cat camel: 10 reps
• Movilidad de codo con banda: 12 reps
• Rotación torácica en cuadrupedia: 8 reps por lado

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Dead bug lento: 10 reps por lado
• Hollow hold: 30 s', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-03-30","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-30', -7100330, 'Empuje horizontal y planche', 'Semana 13 · Mesociclo 4 · Acumulación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Planche lean · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Planche lean en el suelo: 4 × 20 s
• Frogstand: 4 × 20 s

Fuerza · Empuje horizontal · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Push up con pies elevados: 4 × 8
• Fondos en paralelas: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Extensión de tríceps en anillas: 3 × 15
• Hollow hold: 3 × 30 s', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-03-30","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-30', -7200330, 'Metcon', 'Semana 13 · Mesociclo 4 · Acumulación · Introducción',
    '21 min', '', 'For Time · Buy in and buy out · Cap 16 min
Entras y sales con la misma tarea: administra el ritmo del bloque central.
• Buy in con carrera: 400 m o 60 mountain climber
• Australian pull up: 30 reps
• Push up: 40 reps
• Buy out con carrera: 400 m o 60 mountain climber', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-03-30","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-31', -7000331, 'Activación', 'Semana 13 · Mesociclo 4 · Acumulación · Introducción',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Movilidad de cadera en 90/90: 8 reps por lado
• Estiramiento de isquios activo: 10 reps por lado
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Elevación de rodillas colgado: 10 reps
• Active hang: 30 s
• Arch hold: 20 s', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-03-31","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-31', -7100331, 'Tracción horizontal y front lever', 'Semana 13 · Mesociclo 4 · Acumulación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Tuck front lever · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck front lever: 4 × 20 s
• Front lever negativo desde tuck: 4 × 5

Fuerza · Tracción horizontal · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Remo en anillas con pies elevados: 4 × 8
• Australian pull up con tempo 3-1-1: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• L-sit en paralelas: 3 × 30 s
• Curl de bíceps en anillas: 3 × 15', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal y isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-03-31","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-03-31', -7200331, 'Metcon', 'Semana 13 · Mesociclo 4 · Acumulación · Introducción',
    '21 min', '', 'AMRAP · Amanecer de parque · 16 min
Ritmo conversacional: el objetivo es acabar mejor de lo que empiezas.
• Carrera o cuerda: 200 m
• Australian pull up: 10 reps
• Push up: 15 reps
• Sentadilla al aire: 20 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-03-31","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-03', -7000403, 'Activación', 'Semana 14 · Mesociclo 4 · Acumulación · Carga',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Cat camel: 10 reps
• Dislocaciones con banda: 15 reps
• Rotación torácica en cuadrupedia: 8 reps por lado

Activación · Preparación específica · 8 min
• Elevación en Y con banda: 12 reps
• Scapular push up: 12 reps
• Pike hold contra pared: 30 s', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-04-03","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-03', -7100403, 'Empuje vertical y handstand', 'Semana 14 · Mesociclo 4 · Acumulación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Entradas controladas · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall walk: 4 × 6
• Pike hold con pies elevados: 4 × 25 s

Fuerza · Empuje vertical · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Push up en pica con cajón: 4 × 10
• Fondos en anillas asistidos: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Hueco y arco alternos: 4 × 15
• Fondos en banco con pies elevados: 4 × 15', 'Colgado pasivo en barra 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-04-03","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-03', -7200403, 'Metcon', 'Semana 14 · Mesociclo 4 · Acumulación · Carga',
    '17 min', '', 'EMOM · Salto y barra · 12 min
Un movimiento por minuto: mantén la calidad del salto en las últimas rondas.
• Salto al cajón: 10 reps
• Dominada: 5 reps
• Sentadilla en salto: 15 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-04-03","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-04', -7000404, 'Activación', 'Semana 14 · Mesociclo 4 · Acumulación · Carga',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Deslizamientos de escápula en barra: 10 reps
• Colgado pasivo en barra: 30 s
• Movilidad de codo y muñeca: 45 s

Activación · Preparación específica · 8 min
• Face pull con banda: 15 reps
• Scapular pull up: 10 reps
• Active hang: 30 s', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-04-04","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-04', -7100404, 'Tracción vertical y muscle-up', 'Semana 14 · Mesociclo 4 · Acumulación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Camino al muscle-up · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Dominada alta al pecho: 4 × 6
• Transición de muscle-up con banda: 4 × 6

Fuerza · Tracción vertical · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Dominada supina: 4 × 10
• Australian pull up con pies elevados: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Face pull con banda: 4 × 15
• Elevación de rodillas colgado: 4 × 15', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-04-04","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-04', -7200404, 'Metcon', 'Semana 14 · Mesociclo 4 · Acumulación · Carga',
    '15 min', '', 'Unbroken · Unbroken de suelo · 10 min
Series sin pausa: para en cuanto pierdas la línea del cuerpo.
• Push up: 5 series de 12 reps sin parar
• Hollow hold: 5 series de 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-04-04","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-05', -7000405, 'Activación', 'Semana 14 · Mesociclo 4 · Acumulación · Carga',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Estiramiento de isquios activo: 10 reps por lado
• Movilidad de tobillo en pared: 10 reps por lado
• Movilidad de cadera en 90/90: 8 reps por lado

Activación · Preparación específica · 8 min
• Sentadilla isométrica en pared: 30 s
• Monster walk con banda: 12 pasos por lado
• Dead bug lento: 10 reps por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-04-05","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-05', -7100405, 'Piernas, salto y core', 'Semana 14 · Mesociclo 4 · Acumulación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Unilateral con control · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Zancada búlgara con tempo: 4 × 6
• Pistol asistido con anillas: 4 × 6

Fuerza · Piernas y core · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Zancada caminando: 4 × 10
• Curl de isquio con banda: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 4 × 15
• Dead bug lento: 4 × 15', 'Sentadilla profunda sostenida 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-04-05","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-05', -7200405, 'Metcon', 'Semana 14 · Mesociclo 4 · Acumulación · Carga',
    '21 min', '', 'EMOM · EMOM de empuje · 16 min
Un movimiento por minuto, rotando siempre en el mismo orden.
• Pike push up: 6 reps
• Push up: 12 reps
• Fondos en banco: 10 reps
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-04-05","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-06', -7000406, 'Activación', 'Semana 14 · Mesociclo 4 · Acumulación · Carga',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Deslizamiento de escápula en plancha: 10 reps
• Apertura de pectoral en pared: 30 s por lado
• Dislocaciones con banda: 15 reps

Activación · Preparación específica · 8 min
• Lean en plancha adelantada: 20 s
• Scapular push up: 12 reps
• Plancha con toque de hombro: 10 reps por lado', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-04-06","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-06', -7100406, 'Empuje horizontal y planche', 'Semana 14 · Mesociclo 4 · Acumulación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Tuck planche asistido · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck planche con banda: 4 × 25 s
• Planche lean en el suelo: 4 × 25 s

Fuerza · Empuje horizontal · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Push up en anillas: 4 × 10
• Push up con agarre estrecho: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Plancha con toque de hombro: 4 × 15
• Face pull con banda: 4 × 15', 'Apertura de pectoral en pared, colgado pasivo 3 × 30 s y movilidad de muñeca. 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-04-06","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-06', -7200406, 'Metcon', 'Semana 14 · Mesociclo 4 · Acumulación · Carga',
    '19 min', '', 'Rounds For Time · Core cluster · 5 rondas · Cap 14 min
Sin balanceos: si no controlas el movimiento, reduce el rango.
• Toes to bar o elevación de rodillas: 8 reps
• Hollow rock: 15 reps
• Plancha lateral: 30 s por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-04-06","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-07', -7000407, 'Activación', 'Semana 14 · Mesociclo 4 · Acumulación · Carga',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Deslizamientos de escápula en barra: 10 reps
• Colgado pasivo en barra: 30 s
• Dislocaciones con banda: 15 reps

Activación · Preparación específica · 8 min
• Face pull con banda: 15 reps
• Scapular pull up: 10 reps
• Remo con banda: 15 reps', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-04-07","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-07', -7100407, 'Tracción horizontal y front lever', 'Semana 14 · Mesociclo 4 · Acumulación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Raises en tuck · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck front lever raise: 4 × 6
• Tuck front lever: 4 × 25 s

Fuerza · Tracción horizontal · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Remo en anillas al esternón: 4 × 10
• Australian pull up con pies elevados: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Elevación de rodillas colgado: 4 × 15
• Arch hold: 4 × 30 s', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-04-07","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-07', -7200407, 'Metcon', 'Semana 14 · Mesociclo 4 · Acumulación · Carga',
    '17 min', '', 'Ladder · Escalera de core · 5-10-15-20 · Cap 12 min
Sube el número de repeticiones en cada bloque sin perder la posición lumbar.
• Hollow rock: reps del esquema
• V-up: reps del esquema
• Plancha lateral: 15 s por lado entre bloques', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-04-07","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-10', -7000410, 'Activación', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Círculos de hombro en plancha: 8 reps por lado
• Wall slides en pared: 12 reps
• Apertura de pectoral en marco de puerta: 30 s por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Band pull apart: 15 reps
• Push up plus: 10 reps', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-04-10","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-10', -7100410, 'Empuje vertical y handstand', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Line drills · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall handstand de frente: 5 × 25 s
• Handstand toe pulls: 5 × 6

Fuerza · Empuje vertical · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Pike push up con pies elevados: 5 × 10
• Press de hombro en anillas: 4 × 15', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 4 × 20
• Face pull con banda: 4 × 20', 'Estiramiento de tríceps sobre la cabeza, puente de hombro sentado y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-04-10","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-10', -7200410, 'Metcon', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    '14 min', '', 'Tabata · Tabata de piernas · 8 rondas
Alterna movimiento en cada ronda: 20 s de trabajo y 10 s de pausa.
• Sentadilla en salto: 20 s
• Zancada con salto: 20 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-04-10","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-11', -7000411, 'Activación', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Apertura de pectoral en pared: 30 s por lado
• Dislocaciones con banda: 15 reps
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Rotación externa con banda: 12 reps por lado
• Band pull apart: 15 reps
• Hollow hold: 30 s', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-04-11","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-11', -7100411, 'Tracción vertical y muscle-up', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Tracción explosiva · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Dominada explosiva: 5 × 6
• Scapular pull up lento: 5 × 6

Fuerza · Tracción vertical · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Dominada estricta con tempo 3-1-1: 5 × 10
• Remo en anillas: 4 × 15', 'Fuerza · Accesorio y core · 10 min
• Rotación externa con banda: 4 × 20
• Arch hold: 4 × 40 s', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-04-11","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-11', -7200411, 'Metcon', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    '23 min', '', 'Rounds For Time · Pistol partner · 4 rondas · Cap 18 min
Alterna piernas en cada repetición y usa anillas si necesitas asistencia.
• Pistol asistido: 6 reps por lado
• Hollow rock: 20 reps
• Sentadilla en salto: 15 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-04-11","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-12', -7000412, 'Activación', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Cat camel: 10 reps
• Sentadilla profunda sostenida: 45 s
• Círculos de cadera en cuadrupedia: 8 reps por lado

Activación · Preparación específica · 8 min
• Zancada con salto suave: 8 reps por lado
• Puente de glúteo: 15 reps
• Hollow hold: 30 s', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-04-12","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-12', -7100412, 'Piernas, salto y core', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Cadena posterior · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Nordic curl asistido: 5 × 6
• Puente de glúteo a una pierna: 5 × 6

Fuerza · Piernas y core · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Sentadilla a una pierna a cajón: 5 × 10
• Peso muerto rumano a una pierna: 4 × 15', 'Fuerza · Accesorio y core · 10 min
• Elevación de rodillas colgado: 4 × 20
• Copenhagen plank: 4 × 40 s', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-04-12","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-12', -7200412, 'Metcon', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    '16 min', '', 'Unbroken · Unbroken de suelo · 11 min
Series sin pausa: para en cuanto pierdas la línea del cuerpo.
• Push up: 5 series de 12 reps sin parar
• Hollow hold: 5 series de 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-04-12","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-13', -7000413, 'Activación', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Puente de hombro sentado: 10 reps
• Movilidad de muñeca en el suelo: 45 s
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Face pull con banda: 15 reps
• Push up plus: 10 reps
• Band pull apart: 15 reps', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-04-13","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-13', -7100413, 'Empuje horizontal y planche', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Pseudo push up · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pseudo planche push up con rodillas apoyadas: 5 × 6
• Planche lean en el suelo: 5 × 25 s

Fuerza · Empuje horizontal · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Push up arquero: 5 × 10
• Fondos en anillas asistidos: 4 × 15', 'Fuerza · Accesorio y core · 10 min
• Rueda abdominal: 4 × 20
• Elevación en Y con banda: 4 × 20', 'Rodillo en pectoral y dorsal, puente de hombro sentado y 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-04-13","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-13', -7200413, 'Metcon', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    '23 min', '', 'Rounds For Time · Zancada y barra · 4 rondas · Cap 18 min
Zancadas sin apoyar la rodilla y dominadas fragmentadas desde la primera ronda.
• Zancada caminando: 20 reps
• Dominada: 6 reps
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-04-13","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-14', -7000414, 'Activación', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Apertura de pectoral en pared: 30 s por lado
• Rotación torácica tumbado: 8 reps por lado
• Movilidad de cadera en 90/90: 8 reps por lado

Activación · Preparación específica · 8 min
• Dead bug lento: 10 reps por lado
• Hollow hold: 30 s
• Elevación de rodillas colgado: 10 reps', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-04-14","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-14', -7100414, 'Tracción horizontal y front lever', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Compresión avanzada · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• L-sit en paralelas: 5 × 25 s
• Tuck front lever: 5 × 25 s

Fuerza · Tracción horizontal · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Remo en anillas arquero: 5 × 10
• Remo en anillas con pies elevados: 4 × 15', 'Fuerza · Accesorio y core · 10 min
• Toes to bar estricto: 4 × 20
• Face pull con banda: 4 × 20', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-04-14","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-14', -7200414, 'Metcon', 'Semana 15 · Mesociclo 4 · Acumulación · Pico',
    '18 min', '', 'EMOM · Salto y barra · 13 min
Un movimiento por minuto: mantén la calidad del salto en las últimas rondas.
• Salto al cajón: 10 reps
• Dominada: 5 reps
• Sentadilla en salto: 15 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-04-14","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-17', -7000417, 'Activación', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    '10 min', '', 'Movilidad · Empuje vertical · 10 min
• Puente de hombro sentado: 10 reps
• Movilidad de muñeca en el suelo: 45 s
• Cat camel: 10 reps
• Dislocaciones con banda: 15 reps', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-04-17","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-17', -7100417, 'Empuje vertical y handstand', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Handstand de barriga a pared · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall handstand de frente: 3 × 20 s
• Hollow to arch: 3 × 5

Fuerza · Empuje vertical · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Pike push up con pies elevados: 3 × 8
• Fondos en paralelas: 2 × 12', 'Fuerza · Accesorio y core · 10 min
• Dead bug lento: 2 × 15
• Elevación en Y con banda: 2 × 15', 'Estira dorsales y pectoral 45 s por lado, más movilidad de muñeca en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-04-17","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-17', -7200417, 'Metcon', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    '13 min', '', 'For Time · Cierre de mesociclo · Cap 8 min
Última sesión del bloque: registra el tiempo para comparar con el siguiente mesociclo.
• Australian pull up: 30 reps
• Push up: 45 reps
• Zancada inversa: 30 reps por lado
• Hollow rock: 60 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-04-17","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-18', -7000418, 'Activación', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    '10 min', '', 'Movilidad · Tracción vertical · 10 min
• Puente de hombro sentado: 10 reps
• Rotación torácica tumbado: 8 reps por lado
• Deslizamientos de escápula en barra: 10 reps
• Colgado pasivo en barra: 30 s', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-04-18","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-18', -7100418, 'Tracción vertical y muscle-up', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Dominada estricta · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Dominada estricta: 3 × 5
• Active hang a una mano alterna: 3 × 20 s

Fuerza · Tracción vertical · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Dominada estricta: 3 × 8
• Remo en anillas con pies elevados: 2 × 12', 'Fuerza · Accesorio y core · 10 min
• Remo a una mano con banda: 2 × 15
• Plancha con toque de hombro: 2 × 15', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-04-18","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-18', -7200418, 'Metcon', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    '11 min', '', 'AMRAP · Burpee pull up · 6 min
Si no llegas a la barra, haz burpee y salto vertical con los brazos arriba.
• Burpee pull up: 5 reps
• Sentadilla al aire: 10 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-04-18","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-19', -7000419, 'Activación', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    '10 min', '', 'Movilidad · Piernas y core · 10 min
• Puente de glúteo a una pierna: 10 reps por lado
• Cossack squat: 8 reps por lado
• Estiramiento de isquios activo: 10 reps por lado
• Movilidad de tobillo en pared: 10 reps por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-04-19","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-19', -7100419, 'Piernas, salto y core', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Pistol progresivo · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pistol a cajón: 3 × 5
• Shrimp squat asistido: 3 × 5

Fuerza · Piernas y core · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Sentadilla búlgara: 3 × 8
• Puente nórdico asistido: 2 × 12', 'Fuerza · Accesorio y core · 10 min
• V-up: 2 × 15
• Puente de glúteo a una pierna: 2 × 15', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-04-19","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-19', -7200419, 'Metcon', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    '15 min', '', 'Rounds For Time · Complex de peso corporal · 4 rondas · Cap 10 min
La ronda es un complex seguido: una dominada, dos flexiones y tres sentadillas sin parar.
• Dominada: 1 rep
• Push up: 2 reps
• Sentadilla al aire: 3 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-04-19","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-20', -7000420, 'Activación', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    '10 min', '', 'Movilidad · Empuje horizontal · 10 min
• Movilidad de codo con banda: 12 reps
• Rotación torácica en cuadrupedia: 8 reps por lado
• Deslizamiento de escápula en plancha: 10 reps
• Apertura de pectoral en pared: 30 s por lado', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-04-20","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-20', -7100420, 'Empuje horizontal y planche', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Planche lean · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Planche lean en el suelo: 3 × 20 s
• Frogstand: 3 × 20 s

Fuerza · Empuje horizontal · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Push up con pies elevados: 3 × 8
• Fondos en paralelas: 2 × 12', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 2 × 15
• Push up plus con pausa: 2 × 15', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-04-20","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-20', -7200420, 'Metcon', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    '15 min', '', 'AMRAP · I go you go · 10 min
En solitario se hace con 40 s de trabajo y 20 s de pausa por movimiento.
• Australian pull up: 40 s
• Push up: 40 s
• Sentadilla en salto: 40 s
• Hollow hold: 40 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-04-20","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-21', -7000421, 'Activación', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    '10 min', '', 'Movilidad · Tracción horizontal · 10 min
• Estiramiento de isquios activo: 10 reps por lado
• Cat camel: 10 reps
• Deslizamientos de escápula en barra: 10 reps
• Colgado pasivo en barra: 30 s', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-04-21","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-21', -7100421, 'Tracción horizontal y front lever', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Tuck front lever · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck front lever: 3 × 20 s
• Front lever negativo desde tuck: 3 × 5

Fuerza · Tracción horizontal · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Remo en anillas con pies elevados: 3 × 8
• Australian pull up con tempo 3-1-1: 2 × 12', 'Fuerza · Accesorio y core · 10 min
• Rueda abdominal: 2 × 15
• Rotación externa con banda: 2 × 15', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal y isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-04-21","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-21', -7200421, 'Metcon', 'Semana 16 · Mesociclo 4 · Acumulación · Descarga',
    '11 min', '', 'Tabata · Tabata de piernas · 5 rondas
Alterna movimiento en cada ronda: 20 s de trabajo y 10 s de pausa.
• Sentadilla en salto: 20 s
• Zancada con salto: 20 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-04-21","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-24', -7000424, 'Activación', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Dislocaciones con banda: 15 reps
• Cat camel: 10 reps
• Movilidad de muñeca en el suelo: 45 s

Activación · Preparación específica · 8 min
• Scapular push up: 12 reps
• Elevación en Y con banda: 12 reps
• Face pull con banda: 15 reps', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-04-24","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-24', -7100424, 'Empuje vertical y handstand', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Entradas controladas · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall walk: 4 × 5
• Pike hold con pies elevados: 4 × 20 s

Fuerza · Empuje vertical · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Push up en pica con cajón: 4 × 8
• Fondos en anillas asistidos: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 30 s
• Extensión de tríceps en anillas: 3 × 15', 'Colgado pasivo en barra 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-04-24","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-24', -7200424, 'Metcon', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    '16 min', '', 'EMOM · Death by burpee · 11 min
Minuto 1 una repetición, minuto 2 dos, y así hasta que no llegues a tiempo.
• Burpee: 1 rep acumulativa por minuto', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-04-24","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-25', -7000425, 'Activación', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Colgado pasivo en barra: 30 s
• Deslizamientos de escápula en barra: 10 reps
• Rotación torácica tumbado: 8 reps por lado

Activación · Preparación específica · 8 min
• Scapular pull up: 10 reps
• Face pull con banda: 15 reps
• Remo con banda: 15 reps', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-04-25","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-25', -7100425, 'Tracción vertical y muscle-up', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Camino al muscle-up · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Dominada alta al pecho: 4 × 5
• Transición de muscle-up con banda: 4 × 5

Fuerza · Tracción vertical · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Dominada supina: 4 × 8
• Australian pull up con pies elevados: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Curl de bíceps en anillas: 3 × 15
• Hollow hold: 3 × 30 s', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-04-25","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-25', -7200425, 'Metcon', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    '21 min', '', 'For Time · Buy in and buy out · Cap 16 min
Entras y sales con la misma tarea: administra el ritmo del bloque central.
• Buy in con carrera: 400 m o 60 mountain climber
• Australian pull up: 30 reps
• Push up: 40 reps
• Buy out con carrera: 400 m o 60 mountain climber', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-04-25","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-26', -7000426, 'Activación', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Movilidad de tobillo en pared: 10 reps por lado
• Estiramiento de isquios activo: 10 reps por lado
• Cossack squat: 8 reps por lado

Activación · Preparación específica · 8 min
• Monster walk con banda: 12 pasos por lado
• Sentadilla isométrica en pared: 30 s
• Elevación de talón a una pierna: 15 reps por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-04-26","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-26', -7100426, 'Piernas, salto y core', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Unilateral con control · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Zancada búlgara con tempo: 4 × 5
• Pistol asistido con anillas: 4 × 5

Fuerza · Piernas y core · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Zancada caminando: 4 × 8
• Curl de isquio con banda: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 30 s
• Elevación de talón a una pierna: 3 × 15', 'Sentadilla profunda sostenida 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-04-26","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-26', -7200426, 'Metcon', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    '16 min', '', 'EMOM · Handstand engine · 11 min
Sube al invertido con control; si no llegas, sostén pike contra la pared.
• Handstand hold contra pared: 30 s
• Push up: 12 reps
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-04-26","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-27', -7000427, 'Activación', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Apertura de pectoral en pared: 30 s por lado
• Deslizamiento de escápula en plancha: 10 reps
• Rotación torácica en cuadrupedia: 8 reps por lado

Activación · Preparación específica · 8 min
• Scapular push up: 12 reps
• Lean en plancha adelantada: 20 s
• Hollow hold: 30 s', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-04-27","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-27', -7100427, 'Empuje horizontal y planche', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Tuck planche asistido · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck planche con banda: 4 × 20 s
• Planche lean en el suelo: 4 × 20 s

Fuerza · Empuje horizontal · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Push up en anillas: 4 × 8
• Push up con agarre estrecho: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• Extensión de tríceps en anillas: 3 × 15
• Hollow hold: 3 × 30 s', 'Apertura de pectoral en pared, colgado pasivo 3 × 30 s y movilidad de muñeca. 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-04-27","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-27', -7200427, 'Metcon', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    '19 min', '', 'Estaciones de tiempo · Motor de piernas · 14 min · 3 estaciones
Un minuto por estación y cinco vueltas, sin descanso entre estaciones.
• Sentadilla al aire: 1 min
• Step up al cajón: 1 min
• Puente de glúteo a una pierna: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-04-27","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-28', -7000428, 'Activación', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Colgado pasivo en barra: 30 s
• Deslizamientos de escápula en barra: 10 reps
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Scapular pull up: 10 reps
• Face pull con banda: 15 reps
• Arch hold: 20 s', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-04-28","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-28', -7100428, 'Tracción horizontal y front lever', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Raises en tuck · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck front lever raise: 4 × 5
• Tuck front lever: 4 × 20 s

Fuerza · Tracción horizontal · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Remo en anillas al esternón: 4 × 8
• Australian pull up con pies elevados: 3 × 12', 'Fuerza · Accesorio y core · 10 min
• L-sit en paralelas: 3 × 30 s
• Curl de bíceps en anillas: 3 × 15', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-04-28","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-04-28', -7200428, 'Metcon', 'Semana 17 · Mesociclo 5 · Acumulación · Introducción',
    '18 min', '', 'AMRAP · Park engine · 13 min
Ritmo constante: elige la progresión que te deje seguir sin parar.
• Australian pull up: 8 reps
• Push up: 10 reps
• Sentadilla al aire: 15 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-04-28","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-01', -7000501, 'Activación', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Wall slides en pared: 12 reps
• Círculos de hombro en plancha: 8 reps por lado
• Rotación torácica en cuadrupedia: 8 reps por lado

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Hollow hold: 30 s
• Pike hold contra pared: 30 s', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-05-01","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-01', -7100501, 'Empuje vertical y handstand', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Line drills · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall handstand de frente: 4 × 25 s
• Handstand toe pulls: 4 × 6

Fuerza · Empuje vertical · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Pike push up con pies elevados: 4 × 10
• Press de hombro en anillas: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Hueco y arco alternos: 4 × 15
• Fondos en banco con pies elevados: 4 × 15', 'Estiramiento de tríceps sobre la cabeza, puente de hombro sentado y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-05-01","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-01', -7200501, 'Metcon', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    '17 min', '', 'AMRAP · Hollow to bar · 12 min
Mantén la pelvis retrovertida en todo el trabajo de core.
• Hollow rock: 20 reps
• Australian pull up: 10 reps
• Plancha con toque de hombro: 20 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-05-01","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-02', -7000502, 'Activación', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Dislocaciones con banda: 15 reps
• Apertura de pectoral en pared: 30 s por lado
• Movilidad de codo y muñeca: 45 s

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Rotación externa con banda: 12 reps por lado
• Active hang: 30 s', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-05-02","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-02', -7100502, 'Tracción vertical y muscle-up', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Tracción explosiva · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Dominada explosiva: 4 × 6
• Scapular pull up lento: 4 × 6

Fuerza · Tracción vertical · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Dominada estricta con tempo 3-1-1: 4 × 10
• Remo en anillas: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Face pull con banda: 4 × 15
• Elevación de rodillas colgado: 4 × 15', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-05-02","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-02', -7200502, 'Metcon', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    '23 min', '', 'Ladder · Escalera invertida · 10-9-8-7-6-5-4-3-2-1 · Cap 18 min
Bajas repeticiones en un movimiento mientras subes en el otro.
• Dominada: reps descendentes del esquema
• Fondos en banco: reps ascendentes del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-05-02","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-03', -7000503, 'Activación', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Sentadilla profunda sostenida: 45 s
• Cat camel: 10 reps
• Movilidad de cadera en 90/90: 8 reps por lado

Activación · Preparación específica · 8 min
• Puente de glúteo: 15 reps
• Zancada con salto suave: 8 reps por lado
• Dead bug lento: 10 reps por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-05-03","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-03', -7100503, 'Piernas, salto y core', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Cadena posterior · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Nordic curl asistido: 4 × 6
• Puente de glúteo a una pierna: 4 × 6

Fuerza · Piernas y core · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Sentadilla a una pierna a cajón: 4 × 10
• Peso muerto rumano a una pierna: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 4 × 15
• Dead bug lento: 4 × 15', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-05-03","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-03', -7200503, 'Metcon', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    '19 min', '', 'Ladder · Escalera de dominadas · 1-2-3-4-5-6-7 · Cap 14 min
Sube de una en una y baja de progresión cuando pierdas el rango completo.
• Dominada: reps del esquema
• Push up: el doble de reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-05-03","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-04', -7000504, 'Activación', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Movilidad de muñeca en el suelo: 45 s
• Puente de hombro sentado: 10 reps
• Dislocaciones con banda: 15 reps

Activación · Preparación específica · 8 min
• Push up plus: 10 reps
• Face pull con banda: 15 reps
• Plancha con toque de hombro: 10 reps por lado', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-05-04","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-04', -7100504, 'Empuje horizontal y planche', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Pseudo push up · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pseudo planche push up con rodillas apoyadas: 4 × 6
• Planche lean en el suelo: 4 × 25 s

Fuerza · Empuje horizontal · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Push up arquero: 4 × 10
• Fondos en anillas asistidos: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Plancha con toque de hombro: 4 × 15
• Face pull con banda: 4 × 15', 'Rodillo en pectoral y dorsal, puente de hombro sentado y 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-05-04","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-04', -7200504, 'Metcon', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    '15 min', '', 'Unbroken · Bar hang challenge · 10 min
Cada bloque empieza colgado: si sueltas, descansas un minuto y sigues.
• Active hang: 5 series de 45 s
• Elevación de rodillas colgado: 5 series de 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-05-04","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-05', -7000505, 'Activación', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Rotación torácica tumbado: 8 reps por lado
• Apertura de pectoral en pared: 30 s por lado
• Dislocaciones con banda: 15 reps

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Dead bug lento: 10 reps por lado
• Remo con banda: 15 reps', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-05-05","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-05', -7100505, 'Tracción horizontal y front lever', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Compresión avanzada · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• L-sit en paralelas: 4 × 25 s
• Tuck front lever: 4 × 25 s

Fuerza · Tracción horizontal · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Remo en anillas arquero: 4 × 10
• Remo en anillas con pies elevados: 4 × 12', 'Fuerza · Accesorio y core · 10 min
• Elevación de rodillas colgado: 4 × 15
• Arch hold: 4 × 30 s', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-05-05","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-05', -7200505, 'Metcon', 'Semana 18 · Mesociclo 5 · Acumulación · Carga',
    '23 min', '', 'Rounds For Time · Grin and bear · 5 rondas · Cap 18 min
Fragmenta las dominadas antes de llegar al fallo.
• Dominada con banda si hace falta: 5 reps
• Toes to bar o elevación de rodillas: 8 reps
• Zancada inversa: 10 reps por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-05-05","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-08', -7000508, 'Activación', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Movilidad de muñeca en el suelo: 45 s
• Puente de hombro sentado: 10 reps
• Apertura de pectoral en marco de puerta: 30 s por lado

Activación · Preparación específica · 8 min
• Face pull con banda: 15 reps
• Wall walk lento: 3 reps
• Push up plus: 10 reps', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-05-08","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-08', -7100508, 'Empuje vertical y handstand', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Handstand de barriga a pared · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall handstand de frente: 5 × 25 s
• Hollow to arch: 5 × 6

Fuerza · Empuje vertical · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Pike push up con pies elevados: 5 × 10
• Fondos en paralelas: 4 × 15', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 4 × 20
• Face pull con banda: 4 × 20', 'Estira dorsales y pectoral 45 s por lado, más movilidad de muñeca en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-05-08","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-08', -7200508, 'Metcon', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    '22 min', '', 'Ladder · Pull ladder · 15-12-9-6-3 · Cap 17 min
Baja de progresión antes que romper la técnica.
• Australian pull up: reps del esquema
• Hollow rock: reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-05-08","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-09', -7000509, 'Activación', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Rotación torácica tumbado: 8 reps por lado
• Puente de hombro sentado: 10 reps
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Remo con banda: 15 reps
• Arch hold: 20 s
• Hollow hold: 30 s', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-05-09","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-09', -7100509, 'Tracción vertical y muscle-up', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Dominada estricta · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Dominada estricta: 5 × 6
• Active hang a una mano alterna: 5 × 25 s

Fuerza · Tracción vertical · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Dominada estricta: 5 × 10
• Remo en anillas con pies elevados: 4 × 15', 'Fuerza · Accesorio y core · 10 min
• Rotación externa con banda: 4 × 20
• Arch hold: 4 × 40 s', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-05-09","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-09', -7200509, 'Metcon', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    '23 min', '', 'AMRAP · I go you go · 18 min
En solitario se hace con 40 s de trabajo y 20 s de pausa por movimiento.
• Australian pull up: 40 s
• Push up: 40 s
• Sentadilla en salto: 40 s
• Hollow hold: 40 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-05-09","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-10', -7000510, 'Activación', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Cossack squat: 8 reps por lado
• Puente de glúteo a una pierna: 10 reps por lado
• Círculos de cadera en cuadrupedia: 8 reps por lado

Activación · Preparación específica · 8 min
• Elevación de talón a una pierna: 15 reps por lado
• Plancha lateral: 30 s por lado
• Hollow hold: 30 s', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-05-10","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-10', -7100510, 'Piernas, salto y core', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Pistol progresivo · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pistol a cajón: 5 × 6
• Shrimp squat asistido: 5 × 6

Fuerza · Piernas y core · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Sentadilla búlgara: 5 × 10
• Puente nórdico asistido: 4 × 15', 'Fuerza · Accesorio y core · 10 min
• Elevación de rodillas colgado: 4 × 20
• Copenhagen plank: 4 × 40 s', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-05-10","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-10', -7200510, 'Metcon', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    '25 min', '', 'Ladder · Escalera invertida · 10-9-8-7-6-5-4-3-2-1 · Cap 20 min
Bajas repeticiones en un movimiento mientras subes en el otro.
• Dominada: reps descendentes del esquema
• Fondos en banco: reps ascendentes del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-05-10","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-11', -7000511, 'Activación', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Rotación torácica en cuadrupedia: 8 reps por lado
• Movilidad de codo con banda: 12 reps
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Dead bug lento: 10 reps por lado
• Band pull apart: 15 reps', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-05-11","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-11', -7100511, 'Empuje horizontal y planche', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Planche lean · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Planche lean en el suelo: 5 × 25 s
• Frogstand: 5 × 25 s

Fuerza · Empuje horizontal · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Push up con pies elevados: 5 × 10
• Fondos en paralelas: 4 × 15', 'Fuerza · Accesorio y core · 10 min
• Rueda abdominal: 4 × 20
• Elevación en Y con banda: 4 × 20', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-05-11","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-11', -7200511, 'Metcon', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    '24 min', '', 'Rounds For Time · Pike y pistol · 5 rondas · Cap 19 min
Alterna piernas en el pistol y controla la bajada del pike.
• Pike push up: 8 reps
• Pistol asistido: 5 reps por lado
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-05-11","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-12', -7000512, 'Activación', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Cat camel: 10 reps
• Estiramiento de isquios activo: 10 reps por lado
• Movilidad de cadera en 90/90: 8 reps por lado

Activación · Preparación específica · 8 min
• Arch hold: 20 s
• Active hang: 30 s
• Elevación de rodillas colgado: 10 reps', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-05-12","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-12', -7100512, 'Tracción horizontal y front lever', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Tuck front lever · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck front lever: 5 × 25 s
• Front lever negativo desde tuck: 5 × 6

Fuerza · Tracción horizontal · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Remo en anillas con pies elevados: 5 × 10
• Australian pull up con tempo 3-1-1: 4 × 15', 'Fuerza · Accesorio y core · 10 min
• Toes to bar estricto: 4 × 20
• Face pull con banda: 4 × 20', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal y isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-05-12","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-12', -7200512, 'Metcon', 'Semana 19 · Mesociclo 5 · Acumulación · Pico',
    '20 min', '', 'Ladder · Push ladder · 21-15-9 · Cap 15 min
Si las flexiones se rompen, sube las manos a un cajón.
• Push up: reps del esquema
• Sentadilla al aire: reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-05-12","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-15', -7000515, 'Activación', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    '10 min', '', 'Movilidad · Empuje vertical · 10 min
• Rotación torácica en cuadrupedia: 8 reps por lado
• Dislocaciones con banda: 15 reps
• Cat camel: 10 reps
• Movilidad de muñeca en el suelo: 45 s', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-05-15","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-15', -7100515, 'Empuje vertical y handstand', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Entradas controladas · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall walk: 3 × 5
• Pike hold con pies elevados: 3 × 20 s

Fuerza · Empuje vertical · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Push up en pica con cajón: 3 × 8
• Fondos en anillas asistidos: 2 × 12', 'Fuerza · Accesorio y core · 10 min
• Dead bug lento: 2 × 15
• Elevación en Y con banda: 2 × 15', 'Colgado pasivo en barra 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-05-15","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-15', -7200515, 'Metcon', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    '15 min', '', 'Estaciones de tiempo · Estaciones del parque · 10 min · 4 estaciones
Un minuto por estación y cuatro vueltas, sin descanso entre estaciones.
• Australian pull up: 1 min
• Push up: 1 min
• Sentadilla al aire: 1 min
• Plancha frontal: 1 min', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-05-15","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-16', -7000516, 'Activación', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    '10 min', '', 'Movilidad · Tracción vertical · 10 min
• Movilidad de codo y muñeca: 45 s
• Colgado pasivo en barra: 30 s
• Deslizamientos de escápula en barra: 10 reps
• Rotación torácica tumbado: 8 reps por lado', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-05-16","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-16', -7100516, 'Tracción vertical y muscle-up', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Camino al muscle-up · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Dominada alta al pecho: 3 × 5
• Transición de muscle-up con banda: 3 × 5

Fuerza · Tracción vertical · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Dominada supina: 3 × 8
• Australian pull up con pies elevados: 2 × 12', 'Fuerza · Accesorio y core · 10 min
• Remo a una mano con banda: 2 × 15
• Plancha con toque de hombro: 2 × 15', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-05-16","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-16', -7200516, 'Metcon', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    '14 min', '', 'Estaciones de tiempo · Motor de piernas · 9 min · 3 estaciones
Un minuto por estación y cinco vueltas, sin descanso entre estaciones.
• Sentadilla al aire: 1 min
• Step up al cajón: 1 min
• Puente de glúteo a una pierna: 1 min', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-05-16","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-17', -7000517, 'Activación', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    '10 min', '', 'Movilidad · Piernas y core · 10 min
• Movilidad de cadera en 90/90: 8 reps por lado
• Movilidad de tobillo en pared: 10 reps por lado
• Estiramiento de isquios activo: 10 reps por lado
• Cossack squat: 8 reps por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-05-17","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-17', -7100517, 'Piernas, salto y core', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Unilateral con control · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Zancada búlgara con tempo: 3 × 5
• Pistol asistido con anillas: 3 × 5

Fuerza · Piernas y core · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Zancada caminando: 3 × 8
• Curl de isquio con banda: 2 × 12', 'Fuerza · Accesorio y core · 10 min
• V-up: 2 × 15
• Puente de glúteo a una pierna: 2 × 15', 'Sentadilla profunda sostenida 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-05-17","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-17', -7200517, 'Metcon', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    '15 min', '', 'AMRAP · I go you go · 10 min
En solitario se hace con 40 s de trabajo y 20 s de pausa por movimiento.
• Australian pull up: 40 s
• Push up: 40 s
• Sentadilla en salto: 40 s
• Hollow hold: 40 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-05-17","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-18', -7000518, 'Activación', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    '10 min', '', 'Movilidad · Empuje horizontal · 10 min
• Dislocaciones con banda: 15 reps
• Apertura de pectoral en pared: 30 s por lado
• Deslizamiento de escápula en plancha: 10 reps
• Rotación torácica en cuadrupedia: 8 reps por lado', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-05-18","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-18', -7100518, 'Empuje horizontal y planche', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Tuck planche asistido · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck planche con banda: 3 × 20 s
• Planche lean en el suelo: 3 × 20 s

Fuerza · Empuje horizontal · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Push up en anillas: 3 × 8
• Push up con agarre estrecho: 2 × 12', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 2 × 15
• Push up plus con pausa: 2 × 15', 'Apertura de pectoral en pared, colgado pasivo 3 × 30 s y movilidad de muñeca. 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-05-18","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-18', -7200518, 'Metcon', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    '14 min', '', 'Rounds For Time · Anillas y suelo · 3 rondas · Cap 9 min
Alterna anillas y suelo para repartir la fatiga del hombro.
• Remo en anillas: 12 reps
• Push up: 15 reps
• Support hold en anillas: 30 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-05-18","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-19', -7000519, 'Activación', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    '10 min', '', 'Movilidad · Tracción horizontal · 10 min
• Dislocaciones con banda: 15 reps
• Colgado pasivo en barra: 30 s
• Deslizamientos de escápula en barra: 10 reps
• Cat camel: 10 reps', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-05-19","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-19', -7100519, 'Tracción horizontal y front lever', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Raises en tuck · 12 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck front lever raise: 3 × 5
• Tuck front lever: 3 × 20 s

Fuerza · Tracción horizontal · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Remo en anillas al esternón: 3 × 8
• Australian pull up con pies elevados: 2 × 12', 'Fuerza · Accesorio y core · 10 min
• Rueda abdominal: 2 × 15
• Rotación externa con banda: 2 × 15', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-05-19","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-19', -7200519, 'Metcon', 'Semana 20 · Mesociclo 5 · Acumulación · Descarga',
    '11 min', '', 'Tabata · Tabata de core · 5 rondas
Alterna ejercicio en cada ronda: 20 s de trabajo y 10 s de pausa.
• Hollow hold: 20 s
• Plancha lateral alternando lado: 20 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-05-19","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-22', -7000522, 'Activación', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Apertura de pectoral en marco de puerta: 30 s por lado
• Wall slides en pared: 12 reps
• Círculos de hombro en plancha: 8 reps por lado

Activación · Preparación específica · 8 min
• Push up plus: 10 reps
• Band pull apart: 15 reps
• Hollow hold: 30 s', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-05-22","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-22', -7100522, 'Empuje vertical y handstand', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Kick up y parada · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Kick up a handstand libre: 6 intentos
• Wall handstand de frente: 4 × 25 s

Fuerza · Empuje vertical · 26 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• HSPU contra pared con almohadillas: 4 × 6
• Fondos en paralelas lastrados: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 30 s
• Extensión de tríceps en anillas: 3 × 12', 'Estiramiento de tríceps sobre la cabeza, puente de hombro sentado y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-05-22","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-22', -7200522, 'Metcon', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    '23 min', '', 'For Time · Chipper de parque · Cap 18 min
Trabajo continuo de arriba abajo, sin repetir estación.
• Australian pull up: 40 reps
• Push up: 60 reps
• Sentadilla al aire: 80 reps
• Hollow rock: 40 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-05-22","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-23', -7000523, 'Activación', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Cat camel: 10 reps
• Dislocaciones con banda: 15 reps
• Apertura de pectoral en pared: 30 s por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Band pull apart: 15 reps
• Rotación externa con banda: 12 reps por lado', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-05-23","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-23', -7100523, 'Tracción vertical y muscle-up', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Muscle-up asistido · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Muscle-up con banda: 4 × 4
• Dominada explosiva: 4 × 4

Fuerza · Tracción vertical · 26 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Dominada estricta con pausa arriba: 4 × 6
• Remo en anillas con pies elevados: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Curl de bíceps en anillas: 3 × 12
• Hollow hold: 3 × 30 s', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-05-23","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-23', -7200523, 'Metcon', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    '18 min', '', 'EMOM · Muscle-up practice · 13 min
Calidad por encima de cantidad: salta el minuto si la transición se rompe.
• Transición de muscle-up asistida: 3 reps
• Dominada explosiva: 4 reps
• Fondos en paralelas: 8 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-05-23","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-24', -7000524, 'Activación', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Círculos de cadera en cuadrupedia: 8 reps por lado
• Sentadilla profunda sostenida: 45 s
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Puente de glúteo: 15 reps
• Zancada con salto suave: 8 reps por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-05-24","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-24', -7100524, 'Piernas, salto y core', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Salto y aterrizaje · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Salto al cajón: 4 × 4
• Pistol squat: 4 × 4

Fuerza · Piernas y core · 26 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Shrimp squat: 4 × 6
• Peso muerto rumano a una pierna lastrado: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 30 s
• Elevación de talón a una pierna: 3 × 12', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-05-24","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-24', -7200524, 'Metcon', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    '21 min', '', 'Ladder · Escalera invertida · 10-9-8-7-6-5-4-3-2-1 · Cap 16 min
Bajas repeticiones en un movimiento mientras subes en el otro.
• Dominada: reps descendentes del esquema
• Fondos en banco: reps ascendentes del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-05-24","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-25', -7000525, 'Activación', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Cat camel: 10 reps
• Movilidad de muñeca en el suelo: 45 s
• Puente de hombro sentado: 10 reps

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Push up plus: 10 reps
• Face pull con banda: 15 reps', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-05-25","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-25', -7100525, 'Empuje horizontal y planche', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Planche en anillas · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck planche en anillas: 4 × 25 s
• Planche lean en el suelo: 4 × 25 s

Fuerza · Empuje horizontal · 26 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Push up arquero con tempo: 4 × 6
• Push up lastrado: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Extensión de tríceps en anillas: 3 × 12
• Hollow hold: 3 × 30 s', 'Rodillo en pectoral y dorsal, puente de hombro sentado y 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-05-25","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-25', -7200525, 'Metcon', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    '21 min', '', 'AMRAP · Amanecer de parque · 16 min
Ritmo conversacional: el objetivo es acabar mejor de lo que empiezas.
• Carrera o cuerda: 200 m
• Australian pull up: 10 reps
• Push up: 15 reps
• Sentadilla al aire: 20 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-05-25","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-26', -7000526, 'Activación', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Movilidad de cadera en 90/90: 8 reps por lado
• Rotación torácica tumbado: 8 reps por lado
• Apertura de pectoral en pared: 30 s por lado

Activación · Preparación específica · 8 min
• Elevación de rodillas colgado: 10 reps
• Hollow hold: 30 s
• Dead bug lento: 10 reps por lado', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-05-26","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-26', -7100526, 'Tracción horizontal y front lever', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Front lever a una pierna · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Front lever a una pierna: 4 × 25 s
• Tuck front lever raise: 4 × 4

Fuerza · Tracción horizontal · 26 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Remo en anillas con pausa 2 s: 4 × 6
• Remo en anillas lastrado: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• L-sit en paralelas: 3 × 30 s
• Curl de bíceps en anillas: 3 × 12', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-05-26","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-26', -7200526, 'Metcon', 'Semana 21 · Mesociclo 6 · Intensificación · Introducción',
    '18 min', '', 'AMRAP · Park engine · 13 min
Ritmo constante: elige la progresión que te deje seguir sin parar.
• Australian pull up: 8 reps
• Push up: 10 reps
• Sentadilla al aire: 15 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-05-26","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-29', -7000529, 'Activación', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Cat camel: 10 reps
• Movilidad de muñeca en el suelo: 45 s
• Puente de hombro sentado: 10 reps

Activación · Preparación específica · 8 min
• Elevación en Y con banda: 12 reps
• Face pull con banda: 15 reps
• Wall walk lento: 3 reps', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-05-29","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-29', -7100529, 'Empuje vertical y handstand', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Equilibrio activo · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall handstand shoulder taps: 5 × 4
• Handstand hold libre: 8 intentos

Fuerza · Empuje vertical · 26 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• HSPU negativa contra pared: 5 × 5
• Fondos en paralelas lastrados: 4 × 10', 'Fuerza · Accesorio y core · 10 min
• Hueco y arco alternos: 4 × 12
• Fondos en banco con pies elevados: 4 × 12', 'Estira dorsales y pectoral 45 s por lado, más movilidad de muñeca en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-05-29","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-29', -7200529, 'Metcon', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    '21 min', '', 'EMOM · EMOM de tracción · 16 min
Un movimiento por minuto, rotando siempre en el mismo orden.
• Dominada con banda si hace falta: 4 reps
• Australian pull up: 8 reps
• Elevación de rodillas colgado: 10 reps
• Active hang: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-05-29","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-30', -7000530, 'Activación', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Deslizamientos de escápula en barra: 10 reps
• Rotación torácica tumbado: 8 reps por lado
• Puente de hombro sentado: 10 reps

Activación · Preparación específica · 8 min
• Face pull con banda: 15 reps
• Remo con banda: 15 reps
• Arch hold: 20 s', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-05-30","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-30', -7100530, 'Tracción vertical y muscle-up', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Transición de muscle-up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Transición de muscle-up en anillas bajas: 5 × 4
• Dominada alta al esternón: 5 × 4

Fuerza · Tracción vertical · 26 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Dominada lastrada: 5 × 5
• Remo en anillas lastrado: 4 × 10', 'Fuerza · Accesorio y core · 10 min
• Face pull con banda: 4 × 12
• Elevación de rodillas colgado: 4 × 12', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-05-30","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-30', -7200530, 'Metcon', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    '20 min', '', 'Estaciones de tiempo · Motor de piernas · 15 min · 3 estaciones
Un minuto por estación y cinco vueltas, sin descanso entre estaciones.
• Sentadilla al aire: 1 min
• Step up al cajón: 1 min
• Puente de glúteo a una pierna: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-05-30","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-31', -7000531, 'Activación', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Estiramiento de isquios activo: 10 reps por lado
• Cossack squat: 8 reps por lado
• Puente de glúteo a una pierna: 10 reps por lado

Activación · Preparación específica · 8 min
• Sentadilla isométrica en pared: 30 s
• Elevación de talón a una pierna: 15 reps por lado
• Plancha lateral: 30 s por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-05-31","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-31', -7100531, 'Piernas, salto y core', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Pistol completo · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pistol squat: 5 × 4
• Shrimp squat: 5 × 4

Fuerza · Piernas y core · 26 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Pistol squat: 5 × 5
• Nordic curl negativo: 4 × 10', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 4 × 12
• Dead bug lento: 4 × 12', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-05-31","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-05-31', -7200531, 'Metcon', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    '21 min', '', 'AMRAP · I go you go · 16 min
En solitario se hace con 40 s de trabajo y 20 s de pausa por movimiento.
• Australian pull up: 40 s
• Push up: 40 s
• Sentadilla en salto: 40 s
• Hollow hold: 40 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-05-31","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-01', -7000601, 'Activación', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Deslizamiento de escápula en plancha: 10 reps
• Rotación torácica en cuadrupedia: 8 reps por lado
• Movilidad de codo con banda: 12 reps

Activación · Preparación específica · 8 min
• Lean en plancha adelantada: 20 s
• Hollow hold: 30 s
• Dead bug lento: 10 reps por lado', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-06-01","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-01', -7100601, 'Empuje horizontal y planche', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Tuck planche · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck planche: 5 × 25 s
• Planche lean en paralelas: 5 × 25 s

Fuerza · Empuje horizontal · 26 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Push up lastrado: 5 × 5
• Fondos en anillas: 4 × 10', 'Fuerza · Accesorio y core · 10 min
• Plancha con toque de hombro: 4 × 12
• Face pull con banda: 4 × 12', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-06-01","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-01', -7200601, 'Metcon', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    '17 min', '', 'Ladder · Escalera de core · 5-10-15-20 · Cap 12 min
Sube el número de repeticiones en cada bloque sin perder la posición lumbar.
• Hollow rock: reps del esquema
• V-up: reps del esquema
• Plancha lateral: 15 s por lado entre bloques', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-06-01","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-02', -7000602, 'Activación', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Deslizamientos de escápula en barra: 10 reps
• Cat camel: 10 reps
• Estiramiento de isquios activo: 10 reps por lado

Activación · Preparación específica · 8 min
• Face pull con banda: 15 reps
• Arch hold: 20 s
• Active hang: 30 s', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-06-02","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-02', -7100602, 'Tracción horizontal y front lever', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Advanced tuck front lever · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Advanced tuck front lever: 5 × 25 s
• Front lever raise en advanced tuck: 5 × 4

Fuerza · Tracción horizontal · 26 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Remo en anillas lastrado: 5 × 5
• Australian pull up lastrado: 4 × 10', 'Fuerza · Accesorio y core · 10 min
• Elevación de rodillas colgado: 4 × 12
• Arch hold: 4 × 35 s', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal y isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-06-02","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-02', -7200602, 'Metcon', 'Semana 22 · Mesociclo 6 · Intensificación · Carga',
    '23 min', '', 'Rounds For Time · Grin and bear · 5 rondas · Cap 18 min
Fragmenta las dominadas antes de llegar al fallo.
• Dominada con banda si hace falta: 5 reps
• Toes to bar o elevación de rodillas: 8 reps
• Zancada inversa: 10 reps por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-06-02","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-05', -7000605, 'Activación', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Círculos de hombro en plancha: 8 reps por lado
• Rotación torácica en cuadrupedia: 8 reps por lado
• Dislocaciones con banda: 15 reps

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Pike hold contra pared: 30 s
• Scapular push up: 12 reps', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-06-05","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-05', -7100605, 'Empuje vertical y handstand', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Fuerza en invertido · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• HSPU negativa contra pared: 5 × 5
• Wall handstand de frente: 5 × 30 s

Fuerza · Empuje vertical · 26 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Pike push up con déficit: 5 × 4
• Fondos en anillas: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 4 × 15
• Face pull con banda: 4 × 15', 'Colgado pasivo en barra 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-06-05","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-05', -7200605, 'Metcon', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    '18 min', '', 'AMRAP · Piernas al aire · 13 min
Aterriza suave en los saltos y mantén el pecho alto en las zancadas.
• Sentadilla al aire: 20 reps
• Zancada con salto: 10 reps por lado
• Salto al cajón: 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-06-05","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-06', -7000606, 'Activación', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Apertura de pectoral en pared: 30 s por lado
• Movilidad de codo y muñeca: 45 s
• Colgado pasivo en barra: 30 s

Activación · Preparación específica · 8 min
• Rotación externa con banda: 12 reps por lado
• Active hang: 30 s
• Scapular pull up: 10 reps', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-06-06","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-06', -7100606, 'Tracción vertical y muscle-up', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Dominada lastrada · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Dominada lastrada: 5 × 5
• Dominada negativa en 5 s: 5 × 5

Fuerza · Tracción vertical · 26 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Dominada con agarre estrecho lastrada: 5 × 4
• Australian pull up lastrado: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Rotación externa con banda: 4 × 15
• Arch hold: 4 × 40 s', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-06-06","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-06', -7200606, 'Metcon', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    '25 min', '', 'AMRAP · Amanecer de parque · 20 min
Ritmo conversacional: el objetivo es acabar mejor de lo que empiezas.
• Carrera o cuerda: 200 m
• Australian pull up: 10 reps
• Push up: 15 reps
• Sentadilla al aire: 20 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-06-06","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-07', -7000607, 'Activación', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Cat camel: 10 reps
• Movilidad de cadera en 90/90: 8 reps por lado
• Movilidad de tobillo en pared: 10 reps por lado

Activación · Preparación específica · 8 min
• Zancada con salto suave: 8 reps por lado
• Dead bug lento: 10 reps por lado
• Monster walk con banda: 12 pasos por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-06-07","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-07', -7100607, 'Piernas, salto y core', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Nordic curl · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Nordic curl negativo: 5 × 5
• Zancada búlgara lastrada: 5 × 5

Fuerza · Piernas y core · 26 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Sentadilla búlgara lastrada: 5 × 4
• Puente de glúteo a una pierna lastrado: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Elevación de rodillas colgado: 4 × 15
• Copenhagen plank: 4 × 40 s', 'Sentadilla profunda sostenida 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-06-07","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-07', -7200607, 'Metcon', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    '16 min', '', 'For Time · Sprint de suelo · Cap 11 min
Es corto: entra fuerte y aguanta el ritmo hasta el final.
• Push up: 50 reps
• Hollow rock: 50 reps
• Plancha con toque de hombro: 50 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-06-07","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-08', -7000608, 'Activación', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Puente de hombro sentado: 10 reps
• Dislocaciones con banda: 15 reps
• Apertura de pectoral en pared: 30 s por lado

Activación · Preparación específica · 8 min
• Face pull con banda: 15 reps
• Plancha con toque de hombro: 10 reps por lado
• Scapular push up: 12 reps', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-06-08","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-08', -7100608, 'Empuje horizontal y planche', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Pseudo planche push up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pseudo planche push up: 5 × 5
• Tuck planche con banda: 5 × 30 s

Fuerza · Empuje horizontal · 26 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Push up en anillas con rotación final: 5 × 4
• Fondos en paralelas lastrados: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Rueda abdominal: 4 × 15
• Elevación en Y con banda: 4 × 15', 'Apertura de pectoral en pared, colgado pasivo 3 × 30 s y movilidad de muñeca. 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-06-08","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-08', -7200608, 'Metcon', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    '23 min', '', 'For Time · Test de resistencia · Cap 18 min
Anota el tiempo: este metcon se repite al final de cada fase para comparar.
• Dominada: 25 reps
• Push up: 50 reps
• Sentadilla al aire: 75 reps
• Hollow rock: 100 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-06-08","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-09', -7000609, 'Activación', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Apertura de pectoral en pared: 30 s por lado
• Dislocaciones con banda: 15 reps
• Colgado pasivo en barra: 30 s

Activación · Preparación específica · 8 min
• Dead bug lento: 10 reps por lado
• Remo con banda: 15 reps
• Scapular pull up: 10 reps', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-06-09","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-09', -7100609, 'Tracción horizontal y front lever', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Negativas de front lever · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Front lever negativo en 5 s: 5 × 5
• Advanced tuck front lever: 5 × 30 s

Fuerza · Tracción horizontal · 26 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Remo en anillas a una mano asistido: 5 × 4
• Remo en anillas al esternón: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Toes to bar estricto: 4 × 15
• Face pull con banda: 4 × 15', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-06-09","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-09', -7200609, 'Metcon', 'Semana 23 · Mesociclo 6 · Intensificación · Pico',
    '20 min', '', 'Ladder · Push ladder · 21-15-9 · Cap 15 min
Si las flexiones se rompen, sube las manos a un cajón.
• Push up: reps del esquema
• Sentadilla al aire: reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-06-09","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-12', -7000612, 'Activación', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    '10 min', '', 'Movilidad · Empuje vertical · 10 min
• Puente de hombro sentado: 10 reps
• Apertura de pectoral en marco de puerta: 30 s por lado
• Wall slides en pared: 12 reps
• Círculos de hombro en plancha: 8 reps por lado', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-06-12","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-12', -7100612, 'Empuje vertical y handstand', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Kick up y parada · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Kick up a handstand libre: 4 intentos
• Wall handstand de frente: 3 × 20 s

Fuerza · Empuje vertical · 26 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• HSPU contra pared con almohadillas: 3 × 5
• Fondos en paralelas lastrados: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Dead bug lento: 2 × 12
• Elevación en Y con banda: 2 × 12', 'Estiramiento de tríceps sobre la cabeza, puente de hombro sentado y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-06-12","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-12', -7200612, 'Metcon', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    '15 min', '', 'Rounds For Time · Complex de peso corporal · 4 rondas · Cap 10 min
La ronda es un complex seguido: una dominada, dos flexiones y tres sentadillas sin parar.
• Dominada: 1 rep
• Push up: 2 reps
• Sentadilla al aire: 3 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-06-12","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-13', -7000613, 'Activación', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    '10 min', '', 'Movilidad · Tracción vertical · 10 min
• Puente de hombro sentado: 10 reps
• Cat camel: 10 reps
• Dislocaciones con banda: 15 reps
• Apertura de pectoral en pared: 30 s por lado', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-06-13","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-13', -7100613, 'Tracción vertical y muscle-up', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Muscle-up asistido · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Muscle-up con banda: 3 × 4
• Dominada explosiva: 3 × 4

Fuerza · Tracción vertical · 26 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Dominada estricta con pausa arriba: 3 × 5
• Remo en anillas con pies elevados: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Remo a una mano con banda: 2 × 12
• Plancha con toque de hombro: 2 × 12', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-06-13","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-13', -7200613, 'Metcon', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    '14 min', '', 'Rounds For Time · Anillas y suelo · 3 rondas · Cap 9 min
Alterna anillas y suelo para repartir la fatiga del hombro.
• Remo en anillas: 12 reps
• Push up: 15 reps
• Support hold en anillas: 30 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-06-13","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-14', -7000614, 'Activación', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    '10 min', '', 'Movilidad · Piernas y core · 10 min
• Puente de glúteo a una pierna: 10 reps por lado
• Círculos de cadera en cuadrupedia: 8 reps por lado
• Sentadilla profunda sostenida: 45 s
• Cat camel: 10 reps', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-06-14","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-14', -7100614, 'Piernas, salto y core', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Salto y aterrizaje · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Salto al cajón: 3 × 4
• Pistol squat: 3 × 4

Fuerza · Piernas y core · 26 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Shrimp squat: 3 × 5
• Peso muerto rumano a una pierna lastrado: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• V-up: 2 × 12
• Puente de glúteo a una pierna: 2 × 12', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-06-14","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-14', -7200614, 'Metcon', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    '13 min', '', 'EMOM · Front lever engine · 8 min
Elige la progresión de lever que puedas sostener 10 s limpios.
• Tuck front lever: 15 s
• Australian pull up: 10 reps
• Hollow rock: 20 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-06-14","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-15', -7000615, 'Activación', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    '10 min', '', 'Movilidad · Empuje horizontal · 10 min
• Movilidad de codo con banda: 12 reps
• Cat camel: 10 reps
• Movilidad de muñeca en el suelo: 45 s
• Puente de hombro sentado: 10 reps', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-06-15","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-15', -7100615, 'Empuje horizontal y planche', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Planche en anillas · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck planche en anillas: 3 × 20 s
• Planche lean en el suelo: 3 × 20 s

Fuerza · Empuje horizontal · 26 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Push up arquero con tempo: 3 × 5
• Push up lastrado: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 2 × 12
• Push up plus con pausa: 2 × 12', 'Rodillo en pectoral y dorsal, puente de hombro sentado y 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-06-15","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-15', -7200615, 'Metcon', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    '11 min', '', 'AMRAP · Descarga activa · 6 min
Ritmo suave, respirando por la nariz de principio a fin.
• Active hang: 30 s
• Push up: 8 reps
• Sentadilla al aire: 12 reps
• Dead bug lento: 10 reps por lado', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-06-15","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-16', -7000616, 'Activación', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    '10 min', '', 'Movilidad · Tracción horizontal · 10 min
• Estiramiento de isquios activo: 10 reps por lado
• Movilidad de cadera en 90/90: 8 reps por lado
• Rotación torácica tumbado: 8 reps por lado
• Apertura de pectoral en pared: 30 s por lado', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-06-16","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-16', -7100616, 'Tracción horizontal y front lever', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Front lever a una pierna · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Front lever a una pierna: 3 × 20 s
• Tuck front lever raise: 3 × 4

Fuerza · Tracción horizontal · 26 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Remo en anillas con pausa 2 s: 3 × 5
• Remo en anillas lastrado: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Rueda abdominal: 2 × 12
• Rotación externa con banda: 2 × 12', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-06-16","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-16', -7200616, 'Metcon', 'Semana 24 · Mesociclo 6 · Intensificación · Descarga',
    '11 min', '', 'Tabata · Tabata de core · 5 rondas
Alterna ejercicio en cada ronda: 20 s de trabajo y 10 s de pausa.
• Hollow hold: 20 s
• Plancha lateral alternando lado: 20 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-06-16","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-19', -7000619, 'Activación', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Dislocaciones con banda: 15 reps
• Puente de hombro sentado: 10 reps
• Círculos de hombro en plancha: 8 reps por lado

Activación · Preparación específica · 8 min
• Scapular push up: 12 reps
• Wall walk lento: 3 reps
• Hollow hold: 30 s', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-06-19","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-19', -7100619, 'Empuje vertical y handstand', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Equilibrio activo · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall handstand shoulder taps: 4 × 4
• Handstand hold libre: 6 intentos

Fuerza · Empuje vertical · 26 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• HSPU negativa contra pared: 4 × 6
• Fondos en paralelas lastrados: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 30 s
• Extensión de tríceps en anillas: 3 × 12', 'Estira dorsales y pectoral 45 s por lado, más movilidad de muñeca en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-06-19","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-19', -7200619, 'Metcon', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    '21 min', '', 'For Time · Buy in and buy out · Cap 16 min
Entras y sales con la misma tarea: administra el ritmo del bloque central.
• Buy in con carrera: 400 m o 60 mountain climber
• Australian pull up: 30 reps
• Push up: 40 reps
• Buy out con carrera: 400 m o 60 mountain climber', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-06-19","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-20', -7000620, 'Activación', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Colgado pasivo en barra: 30 s
• Puente de hombro sentado: 10 reps
• Apertura de pectoral en pared: 30 s por lado

Activación · Preparación específica · 8 min
• Scapular pull up: 10 reps
• Arch hold: 20 s
• Rotación externa con banda: 12 reps por lado', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-06-20","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-20', -7100620, 'Tracción vertical y muscle-up', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Transición de muscle-up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Transición de muscle-up en anillas bajas: 4 × 4
• Dominada alta al esternón: 4 × 4

Fuerza · Tracción vertical · 26 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Dominada lastrada: 4 × 6
• Remo en anillas lastrado: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Curl de bíceps en anillas: 3 × 12
• Hollow hold: 3 × 30 s', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-06-20","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-20', -7200620, 'Metcon', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    '16 min', '', 'EMOM · Salto y barra · 11 min
Un movimiento por minuto: mantén la calidad del salto en las últimas rondas.
• Salto al cajón: 10 reps
• Dominada: 5 reps
• Sentadilla en salto: 15 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-06-20","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-21', -7000621, 'Activación', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Movilidad de tobillo en pared: 10 reps por lado
• Puente de glúteo a una pierna: 10 reps por lado
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Monster walk con banda: 12 pasos por lado
• Plancha lateral: 30 s por lado
• Zancada con salto suave: 8 reps por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-06-21","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-21', -7100621, 'Piernas, salto y core', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Pistol completo · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pistol squat: 4 × 4
• Shrimp squat: 4 × 4

Fuerza · Piernas y core · 26 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Pistol squat: 4 × 6
• Nordic curl negativo: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 30 s
• Elevación de talón a una pierna: 3 × 12', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-06-21","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-21', -7200621, 'Metcon', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    '14 min', '', 'Unbroken · Bar hang challenge · 9 min
Cada bloque empieza colgado: si sueltas, descansas un minuto y sigues.
• Active hang: 5 series de 45 s
• Elevación de rodillas colgado: 5 series de 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-06-21","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-22', -7000622, 'Activación', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Apertura de pectoral en pared: 30 s por lado
• Movilidad de codo con banda: 12 reps
• Puente de hombro sentado: 10 reps

Activación · Preparación específica · 8 min
• Scapular push up: 12 reps
• Dead bug lento: 10 reps por lado
• Face pull con banda: 15 reps', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-06-22","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-22', -7100622, 'Empuje horizontal y planche', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Tuck planche · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck planche: 4 × 25 s
• Planche lean en paralelas: 4 × 25 s

Fuerza · Empuje horizontal · 26 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Push up lastrado: 4 × 6
• Fondos en anillas: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Extensión de tríceps en anillas: 3 × 12
• Hollow hold: 3 × 30 s', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-06-22","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-22', -7200622, 'Metcon', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    '19 min', '', 'Estaciones de tiempo · Estaciones de tracción · 14 min · 4 estaciones
Un minuto por estación y cuatro vueltas, cambiando sin pausa.
• Dominada: 1 min
• Australian pull up: 1 min
• Elevación de rodillas colgado: 1 min
• Active hang: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-06-22","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-23', -7000623, 'Activación', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Colgado pasivo en barra: 30 s
• Estiramiento de isquios activo: 10 reps por lado
• Apertura de pectoral en pared: 30 s por lado

Activación · Preparación específica · 8 min
• Scapular pull up: 10 reps
• Active hang: 30 s
• Dead bug lento: 10 reps por lado', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-06-23","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-23', -7100623, 'Tracción horizontal y front lever', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Advanced tuck front lever · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Advanced tuck front lever: 4 × 25 s
• Front lever raise en advanced tuck: 4 × 4

Fuerza · Tracción horizontal · 26 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Remo en anillas lastrado: 4 × 6
• Australian pull up lastrado: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• L-sit en paralelas: 3 × 30 s
• Curl de bíceps en anillas: 3 × 12', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal y isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-06-23","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-23', -7200623, 'Metcon', 'Semana 25 · Mesociclo 7 · Intensificación · Introducción',
    '19 min', '', 'Estaciones de tiempo · Estaciones del parque · 14 min · 4 estaciones
Un minuto por estación y cuatro vueltas, sin descanso entre estaciones.
• Australian pull up: 1 min
• Push up: 1 min
• Sentadilla al aire: 1 min
• Plancha frontal: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-06-23","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-26', -7000626, 'Activación', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Wall slides en pared: 12 reps
• Dislocaciones con banda: 15 reps
• Puente de hombro sentado: 10 reps

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Scapular push up: 12 reps
• Wall walk lento: 3 reps', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-06-26","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-26', -7100626, 'Empuje vertical y handstand', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Fuerza en invertido · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• HSPU negativa contra pared: 5 × 4
• Wall handstand de frente: 5 × 25 s

Fuerza · Empuje vertical · 26 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Pike push up con déficit: 5 × 5
• Fondos en anillas: 4 × 10', 'Fuerza · Accesorio y core · 10 min
• Hueco y arco alternos: 4 × 12
• Fondos en banco con pies elevados: 4 × 12', 'Colgado pasivo en barra 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-06-26","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-26', -7200626, 'Metcon', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    '20 min', '', 'AMRAP · Ring engine · 15 min
Las anillas mandan: mantén los codos pegados y el cuerpo en tensión.
• Remo en anillas: 10 reps
• Fondos en anillas asistidos: 8 reps
• Support hold en anillas: 20 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-06-26","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-27', -7000627, 'Activación', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Dislocaciones con banda: 15 reps
• Colgado pasivo en barra: 30 s
• Puente de hombro sentado: 10 reps

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Scapular pull up: 10 reps
• Arch hold: 20 s', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-06-27","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-27', -7100627, 'Tracción vertical y muscle-up', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Dominada lastrada · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Dominada lastrada: 5 × 4
• Dominada negativa en 5 s: 5 × 4

Fuerza · Tracción vertical · 26 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Dominada con agarre estrecho lastrada: 5 × 5
• Australian pull up lastrado: 4 × 10', 'Fuerza · Accesorio y core · 10 min
• Face pull con banda: 4 × 12
• Elevación de rodillas colgado: 4 × 12', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-06-27","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-27', -7200627, 'Metcon', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    '13 min', '', 'Tabata · Tabata de piernas · 8 rondas
Alterna movimiento en cada ronda: 20 s de trabajo y 10 s de pausa.
• Sentadilla en salto: 20 s
• Zancada con salto: 20 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-06-27","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-28', -7000628, 'Activación', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Sentadilla profunda sostenida: 45 s
• Movilidad de tobillo en pared: 10 reps por lado
• Puente de glúteo a una pierna: 10 reps por lado

Activación · Preparación específica · 8 min
• Puente de glúteo: 15 reps
• Monster walk con banda: 12 pasos por lado
• Plancha lateral: 30 s por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-06-28","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-28', -7100628, 'Piernas, salto y core', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Nordic curl · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Nordic curl negativo: 5 × 4
• Zancada búlgara lastrada: 5 × 4

Fuerza · Piernas y core · 26 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Sentadilla búlgara lastrada: 5 × 5
• Puente de glúteo a una pierna lastrado: 4 × 10', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 4 × 12
• Dead bug lento: 4 × 12', 'Sentadilla profunda sostenida 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-06-28","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-28', -7200628, 'Metcon', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    '22 min', '', 'Rounds For Time · Pike y pistol · 5 rondas · Cap 17 min
Alterna piernas en el pistol y controla la bajada del pike.
• Pike push up: 8 reps
• Pistol asistido: 5 reps por lado
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-06-28","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-29', -7000629, 'Activación', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Movilidad de muñeca en el suelo: 45 s
• Apertura de pectoral en pared: 30 s por lado
• Movilidad de codo con banda: 12 reps

Activación · Preparación específica · 8 min
• Push up plus: 10 reps
• Scapular push up: 12 reps
• Dead bug lento: 10 reps por lado', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-06-29","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-29', -7100629, 'Empuje horizontal y planche', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Pseudo planche push up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pseudo planche push up: 5 × 4
• Tuck planche con banda: 5 × 25 s

Fuerza · Empuje horizontal · 26 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Push up en anillas con rotación final: 5 × 5
• Fondos en paralelas lastrados: 4 × 10', 'Fuerza · Accesorio y core · 10 min
• Plancha con toque de hombro: 4 × 12
• Face pull con banda: 4 × 12', 'Apertura de pectoral en pared, colgado pasivo 3 × 30 s y movilidad de muñeca. 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-06-29","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-29', -7200629, 'Metcon', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    '17 min', '', 'EMOM · Death by burpee · 12 min
Minuto 1 una repetición, minuto 2 dos, y así hasta que no llegues a tiempo.
• Burpee: 1 rep acumulativa por minuto', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-06-29","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-30', -7000630, 'Activación', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Rotación torácica tumbado: 8 reps por lado
• Colgado pasivo en barra: 30 s
• Estiramiento de isquios activo: 10 reps por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Scapular pull up: 10 reps
• Active hang: 30 s', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-06-30","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-30', -7100630, 'Tracción horizontal y front lever', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Negativas de front lever · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Front lever negativo en 5 s: 5 × 4
• Advanced tuck front lever: 5 × 25 s

Fuerza · Tracción horizontal · 26 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Remo en anillas a una mano asistido: 5 × 5
• Remo en anillas al esternón: 4 × 10', 'Fuerza · Accesorio y core · 10 min
• Elevación de rodillas colgado: 4 × 12
• Arch hold: 4 × 35 s', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-06-30","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-06-30', -7200630, 'Metcon', 'Semana 26 · Mesociclo 7 · Intensificación · Carga',
    '21 min', '', 'EMOM · EMOM de empuje · 16 min
Un movimiento por minuto, rotando siempre en el mismo orden.
• Pike push up: 6 reps
• Push up: 12 reps
• Fondos en banco: 10 reps
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-06-30","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-03', -7000703, 'Activación', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Movilidad de muñeca en el suelo: 45 s
• Wall slides en pared: 12 reps
• Dislocaciones con banda: 15 reps

Activación · Preparación específica · 8 min
• Face pull con banda: 15 reps
• Band pull apart: 15 reps
• Scapular push up: 12 reps', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-07-03","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-03', -7100703, 'Empuje vertical y handstand', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Kick up y parada · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Kick up a handstand libre: 10 intentos
• Wall handstand de frente: 5 × 30 s

Fuerza · Empuje vertical · 26 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• HSPU contra pared con almohadillas: 5 × 4
• Fondos en paralelas lastrados: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 4 × 15
• Face pull con banda: 4 × 15', 'Estiramiento de tríceps sobre la cabeza, puente de hombro sentado y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-07-03","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-03', -7200703, 'Metcon', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    '23 min', '', 'Rounds For Time · Zancada y barra · 4 rondas · Cap 18 min
Zancadas sin apoyar la rodilla y dominadas fragmentadas desde la primera ronda.
• Zancada caminando: 20 reps
• Dominada: 6 reps
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-07-03","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-04', -7000704, 'Activación', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Rotación torácica tumbado: 8 reps por lado
• Dislocaciones con banda: 15 reps
• Colgado pasivo en barra: 30 s

Activación · Preparación específica · 8 min
• Remo con banda: 15 reps
• Band pull apart: 15 reps
• Scapular pull up: 10 reps', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-07-04","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-04', -7100704, 'Tracción vertical y muscle-up', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Muscle-up asistido · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Muscle-up con banda: 5 × 5
• Dominada explosiva: 5 × 5

Fuerza · Tracción vertical · 26 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Dominada estricta con pausa arriba: 5 × 4
• Remo en anillas con pies elevados: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Rotación externa con banda: 4 × 15
• Arch hold: 4 × 40 s', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-07-04","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-04', -7200704, 'Metcon', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    '20 min', '', 'For Time · Cierre de mesociclo · Cap 15 min
Última sesión del bloque: registra el tiempo para comparar con el siguiente mesociclo.
• Australian pull up: 30 reps
• Push up: 45 reps
• Zancada inversa: 30 reps por lado
• Hollow rock: 60 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-07-04","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-05', -7000705, 'Activación', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Cossack squat: 8 reps por lado
• Sentadilla profunda sostenida: 45 s
• Movilidad de tobillo en pared: 10 reps por lado

Activación · Preparación específica · 8 min
• Elevación de talón a una pierna: 15 reps por lado
• Puente de glúteo: 15 reps
• Monster walk con banda: 12 pasos por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-07-05","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-05', -7100705, 'Piernas, salto y core', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Salto y aterrizaje · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Salto al cajón: 5 × 5
• Pistol squat: 5 × 5

Fuerza · Piernas y core · 26 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Shrimp squat: 5 × 4
• Peso muerto rumano a una pierna lastrado: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Elevación de rodillas colgado: 4 × 15
• Copenhagen plank: 4 × 40 s', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-07-05","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-05', -7200705, 'Metcon', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    '23 min', '', 'For Time · Test de resistencia · Cap 18 min
Anota el tiempo: este metcon se repite al final de cada fase para comparar.
• Dominada: 25 reps
• Push up: 50 reps
• Sentadilla al aire: 75 reps
• Hollow rock: 100 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-07-05","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-06', -7000706, 'Activación', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Rotación torácica en cuadrupedia: 8 reps por lado
• Movilidad de muñeca en el suelo: 45 s
• Apertura de pectoral en pared: 30 s por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Push up plus: 10 reps
• Scapular push up: 12 reps', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-07-06","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-06', -7100706, 'Empuje horizontal y planche', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Planche en anillas · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck planche en anillas: 5 × 30 s
• Planche lean en el suelo: 5 × 30 s

Fuerza · Empuje horizontal · 26 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Push up arquero con tempo: 5 × 4
• Push up lastrado: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Rueda abdominal: 4 × 15
• Elevación en Y con banda: 4 × 15', 'Rodillo en pectoral y dorsal, puente de hombro sentado y 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-07-06","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-06', -7200706, 'Metcon', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    '18 min', '', 'AMRAP · Hollow to bar · 13 min
Mantén la pelvis retrovertida en todo el trabajo de core.
• Hollow rock: 20 reps
• Australian pull up: 10 reps
• Plancha con toque de hombro: 20 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-07-06","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-07', -7000707, 'Activación', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Cat camel: 10 reps
• Rotación torácica tumbado: 8 reps por lado
• Colgado pasivo en barra: 30 s

Activación · Preparación específica · 8 min
• Arch hold: 20 s
• Hollow hold: 30 s
• Scapular pull up: 10 reps', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-07-07","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-07', -7100707, 'Tracción horizontal y front lever', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Front lever a una pierna · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Front lever a una pierna: 5 × 30 s
• Tuck front lever raise: 5 × 5

Fuerza · Tracción horizontal · 26 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Remo en anillas con pausa 2 s: 5 × 4
• Remo en anillas lastrado: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Toes to bar estricto: 4 × 15
• Face pull con banda: 4 × 15', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-07-07","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-07', -7200707, 'Metcon', 'Semana 27 · Mesociclo 7 · Intensificación · Pico',
    '18 min', '', 'AMRAP · Piernas al aire · 13 min
Aterriza suave en los saltos y mantén el pecho alto en las zancadas.
• Sentadilla al aire: 20 reps
• Zancada con salto: 10 reps por lado
• Salto al cajón: 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-07-07","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-10', -7000710, 'Activación', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    '10 min', '', 'Movilidad · Empuje vertical · 10 min
• Rotación torácica en cuadrupedia: 8 reps por lado
• Movilidad de muñeca en el suelo: 45 s
• Wall slides en pared: 12 reps
• Dislocaciones con banda: 15 reps', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-07-10","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-10', -7100710, 'Empuje vertical y handstand', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Equilibrio activo · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall handstand shoulder taps: 3 × 4
• Handstand hold libre: 4 intentos

Fuerza · Empuje vertical · 26 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• HSPU negativa contra pared: 3 × 5
• Fondos en paralelas lastrados: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Dead bug lento: 2 × 12
• Elevación en Y con banda: 2 × 12', 'Estira dorsales y pectoral 45 s por lado, más movilidad de muñeca en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-07-10","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-10', -7200710, 'Metcon', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    '13 min', '', 'EMOM · Muscle-up practice · 8 min
Calidad por encima de cantidad: salta el minuto si la transición se rompe.
• Transición de muscle-up asistida: 3 reps
• Dominada explosiva: 4 reps
• Fondos en paralelas: 8 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-07-10","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-11', -7000711, 'Activación', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    '10 min', '', 'Movilidad · Tracción vertical · 10 min
• Movilidad de codo y muñeca: 45 s
• Rotación torácica tumbado: 8 reps por lado
• Dislocaciones con banda: 15 reps
• Colgado pasivo en barra: 30 s', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-07-11","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-11', -7100711, 'Tracción vertical y muscle-up', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Transición de muscle-up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Transición de muscle-up en anillas bajas: 3 × 4
• Dominada alta al esternón: 3 × 4

Fuerza · Tracción vertical · 26 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Dominada lastrada: 3 × 5
• Remo en anillas lastrado: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Remo a una mano con banda: 2 × 12
• Plancha con toque de hombro: 2 × 12', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-07-11","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-11', -7200711, 'Metcon', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    '12 min', '', 'EMOM · Death by burpee · 7 min
Minuto 1 una repetición, minuto 2 dos, y así hasta que no llegues a tiempo.
• Burpee: 1 rep acumulativa por minuto', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-07-11","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-12', -7000712, 'Activación', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    '10 min', '', 'Movilidad · Piernas y core · 10 min
• Movilidad de cadera en 90/90: 8 reps por lado
• Cossack squat: 8 reps por lado
• Sentadilla profunda sostenida: 45 s
• Movilidad de tobillo en pared: 10 reps por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-07-12","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-12', -7100712, 'Piernas, salto y core', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Pistol completo · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pistol squat: 3 × 4
• Shrimp squat: 3 × 4

Fuerza · Piernas y core · 26 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Pistol squat: 3 × 5
• Nordic curl negativo: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• V-up: 2 × 12
• Puente de glúteo a una pierna: 2 × 12', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-07-12","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-12', -7200712, 'Metcon', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    '11 min', '', 'AMRAP · Descarga activa · 6 min
Ritmo suave, respirando por la nariz de principio a fin.
• Active hang: 30 s
• Push up: 8 reps
• Sentadilla al aire: 12 reps
• Dead bug lento: 10 reps por lado', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-07-12","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-13', -7000713, 'Activación', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    '10 min', '', 'Movilidad · Empuje horizontal · 10 min
• Dislocaciones con banda: 15 reps
• Rotación torácica en cuadrupedia: 8 reps por lado
• Movilidad de muñeca en el suelo: 45 s
• Apertura de pectoral en pared: 30 s por lado', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-07-13","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-13', -7100713, 'Empuje horizontal y planche', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Tuck planche · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck planche: 3 × 20 s
• Planche lean en paralelas: 3 × 20 s

Fuerza · Empuje horizontal · 26 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Push up lastrado: 3 × 5
• Fondos en anillas: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 2 × 12
• Push up plus con pausa: 2 × 12', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-07-13","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-13', -7200713, 'Metcon', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    '14 min', '', 'Ladder · Pull ladder · 15-12-9-6-3 · Cap 9 min
Baja de progresión antes que romper la técnica.
• Australian pull up: reps del esquema
• Hollow rock: reps del esquema', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-07-13","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-14', -7000714, 'Activación', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    '10 min', '', 'Movilidad · Tracción horizontal · 10 min
• Dislocaciones con banda: 15 reps
• Cat camel: 10 reps
• Rotación torácica tumbado: 8 reps por lado
• Colgado pasivo en barra: 30 s', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-07-14","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-14', -7100714, 'Tracción horizontal y front lever', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Advanced tuck front lever · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Advanced tuck front lever: 3 × 20 s
• Front lever raise en advanced tuck: 3 × 4

Fuerza · Tracción horizontal · 26 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Remo en anillas lastrado: 3 × 5
• Australian pull up lastrado: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Rueda abdominal: 2 × 12
• Rotación externa con banda: 2 × 12', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal y isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-07-14","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-14', -7200714, 'Metcon', 'Semana 28 · Mesociclo 7 · Intensificación · Descarga',
    '11 min', '', 'AMRAP · Burpee pull up · 6 min
Si no llegas a la barra, haz burpee y salto vertical con los brazos arriba.
• Burpee pull up: 5 reps
• Sentadilla al aire: 10 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-07-14","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-17', -7000717, 'Activación', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Apertura de pectoral en marco de puerta: 30 s por lado
• Rotación torácica en cuadrupedia: 8 reps por lado
• Movilidad de muñeca en el suelo: 45 s

Activación · Preparación específica · 8 min
• Push up plus: 10 reps
• Pike hold contra pared: 30 s
• Face pull con banda: 15 reps', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-07-17","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-17', -7100717, 'Empuje vertical y handstand', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Fuerza en invertido · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• HSPU negativa contra pared: 4 × 4
• Wall handstand de frente: 4 × 25 s

Fuerza · Empuje vertical · 26 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Pike push up con déficit: 4 × 6
• Fondos en anillas: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 30 s
• Extensión de tríceps en anillas: 3 × 12', 'Colgado pasivo en barra 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-07-17","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-17', -7200717, 'Metcon', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    '18 min', '', 'EMOM · Front lever engine · 13 min
Elige la progresión de lever que puedas sostener 10 s limpios.
• Tuck front lever: 15 s
• Australian pull up: 10 reps
• Hollow rock: 20 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-07-17","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-18', -7000718, 'Activación', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Cat camel: 10 reps
• Movilidad de codo y muñeca: 45 s
• Rotación torácica tumbado: 8 reps por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Active hang: 30 s
• Remo con banda: 15 reps', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-07-18","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-18', -7100718, 'Tracción vertical y muscle-up', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Dominada lastrada · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Dominada lastrada: 4 × 4
• Dominada negativa en 5 s: 4 × 4

Fuerza · Tracción vertical · 26 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Dominada con agarre estrecho lastrada: 4 × 6
• Australian pull up lastrado: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Curl de bíceps en anillas: 3 × 12
• Hollow hold: 3 × 30 s', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-07-18","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-18', -7200718, 'Metcon', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    '23 min', '', 'For Time · Chipper de parque · Cap 18 min
Trabajo continuo de arriba abajo, sin repetir estación.
• Australian pull up: 40 reps
• Push up: 60 reps
• Sentadilla al aire: 80 reps
• Hollow rock: 40 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-07-18","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-19', -7000719, 'Activación', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Círculos de cadera en cuadrupedia: 8 reps por lado
• Movilidad de cadera en 90/90: 8 reps por lado
• Cossack squat: 8 reps por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Dead bug lento: 10 reps por lado
• Elevación de talón a una pierna: 15 reps por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-07-19","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-19', -7100719, 'Piernas, salto y core', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Nordic curl · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Nordic curl negativo: 4 × 4
• Zancada búlgara lastrada: 4 × 4

Fuerza · Piernas y core · 26 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Sentadilla búlgara lastrada: 4 × 6
• Puente de glúteo a una pierna lastrado: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 30 s
• Elevación de talón a una pierna: 3 × 12', 'Sentadilla profunda sostenida 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-07-19","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-19', -7200719, 'Metcon', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    '16 min', '', 'Unbroken · Empuje sin descanso · 11 min
Cada serie sin pausa: si rompes, subes las manos a un cajón y sigues.
• Pike push up: 4 series de 8 reps sin parar
• Fondos en paralelas: 4 series de 8 reps sin parar', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-07-19","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-20', -7000720, 'Activación', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Cat camel: 10 reps
• Dislocaciones con banda: 15 reps
• Rotación torácica en cuadrupedia: 8 reps por lado

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Plancha con toque de hombro: 10 reps por lado
• Hollow hold: 30 s', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-07-20","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-20', -7100720, 'Empuje horizontal y planche', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Pseudo planche push up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pseudo planche push up: 4 × 4
• Tuck planche con banda: 4 × 25 s

Fuerza · Empuje horizontal · 26 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Push up en anillas con rotación final: 4 × 6
• Fondos en paralelas lastrados: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• Extensión de tríceps en anillas: 3 × 12
• Hollow hold: 3 × 30 s', 'Apertura de pectoral en pared, colgado pasivo 3 × 30 s y movilidad de muñeca. 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-07-20","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-20', -7200720, 'Metcon', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    '19 min', '', 'Estaciones de tiempo · Estaciones del parque · 14 min · 4 estaciones
Un minuto por estación y cuatro vueltas, sin descanso entre estaciones.
• Australian pull up: 1 min
• Push up: 1 min
• Sentadilla al aire: 1 min
• Plancha frontal: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-07-20","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-21', -7000721, 'Activación', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Movilidad de cadera en 90/90: 8 reps por lado
• Dislocaciones con banda: 15 reps
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Elevación de rodillas colgado: 10 reps
• Remo con banda: 15 reps
• Arch hold: 20 s', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-07-21","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-21', -7100721, 'Tracción horizontal y front lever', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Negativas de front lever · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Front lever negativo en 5 s: 4 × 4
• Advanced tuck front lever: 4 × 25 s

Fuerza · Tracción horizontal · 26 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Remo en anillas a una mano asistido: 4 × 6
• Remo en anillas al esternón: 3 × 10', 'Fuerza · Accesorio y core · 10 min
• L-sit en paralelas: 3 × 30 s
• Curl de bíceps en anillas: 3 × 12', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-07-21","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-21', -7200721, 'Metcon', 'Semana 29 · Mesociclo 8 · Intensificación · Introducción',
    '21 min', '', 'For Time · Buy in and buy out · Cap 16 min
Entras y sales con la misma tarea: administra el ritmo del bloque central.
• Buy in con carrera: 400 m o 60 mountain climber
• Australian pull up: 30 reps
• Push up: 40 reps
• Buy out con carrera: 400 m o 60 mountain climber', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-07-21","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-24', -7000724, 'Activación', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Cat camel: 10 reps
• Apertura de pectoral en marco de puerta: 30 s por lado
• Rotación torácica en cuadrupedia: 8 reps por lado

Activación · Preparación específica · 8 min
• Elevación en Y con banda: 12 reps
• Push up plus: 10 reps
• Pike hold contra pared: 30 s', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-07-24","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-24', -7100724, 'Empuje vertical y handstand', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Kick up y parada · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Kick up a handstand libre: 8 intentos
• Wall handstand de frente: 5 × 25 s

Fuerza · Empuje vertical · 26 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• HSPU contra pared con almohadillas: 5 × 5
• Fondos en paralelas lastrados: 4 × 10', 'Fuerza · Accesorio y core · 10 min
• Hueco y arco alternos: 4 × 12
• Fondos en banco con pies elevados: 4 × 12', 'Estiramiento de tríceps sobre la cabeza, puente de hombro sentado y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-07-24","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-24', -7200724, 'Metcon', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    '15 min', '', 'Unbroken · Bar hang challenge · 10 min
Cada bloque empieza colgado: si sueltas, descansas un minuto y sigues.
• Active hang: 5 series de 45 s
• Elevación de rodillas colgado: 5 series de 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-07-24","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-25', -7000725, 'Activación', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Deslizamientos de escápula en barra: 10 reps
• Cat camel: 10 reps
• Movilidad de codo y muñeca: 45 s

Activación · Preparación específica · 8 min
• Face pull con banda: 15 reps
• Hollow hold: 30 s
• Active hang: 30 s', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-07-25","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-25', -7100725, 'Tracción vertical y muscle-up', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Muscle-up asistido · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Muscle-up con banda: 5 × 4
• Dominada explosiva: 5 × 4

Fuerza · Tracción vertical · 26 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Dominada estricta con pausa arriba: 5 × 5
• Remo en anillas con pies elevados: 4 × 10', 'Fuerza · Accesorio y core · 10 min
• Face pull con banda: 4 × 12
• Elevación de rodillas colgado: 4 × 12', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-07-25","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-25', -7200725, 'Metcon', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    '21 min', '', 'Estaciones de tiempo · Estaciones del parque · 16 min · 4 estaciones
Un minuto por estación y cuatro vueltas, sin descanso entre estaciones.
• Australian pull up: 1 min
• Push up: 1 min
• Sentadilla al aire: 1 min
• Plancha frontal: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-07-25","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-26', -7000726, 'Activación', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Estiramiento de isquios activo: 10 reps por lado
• Círculos de cadera en cuadrupedia: 8 reps por lado
• Movilidad de cadera en 90/90: 8 reps por lado

Activación · Preparación específica · 8 min
• Sentadilla isométrica en pared: 30 s
• Hollow hold: 30 s
• Dead bug lento: 10 reps por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-07-26","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-26', -7100726, 'Piernas, salto y core', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Salto y aterrizaje · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Salto al cajón: 5 × 4
• Pistol squat: 5 × 4

Fuerza · Piernas y core · 26 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Shrimp squat: 5 × 5
• Peso muerto rumano a una pierna lastrado: 4 × 10', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 4 × 12
• Dead bug lento: 4 × 12', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-07-26","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-26', -7200726, 'Metcon', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    '19 min', '', 'AMRAP · Park engine · 14 min
Ritmo constante: elige la progresión que te deje seguir sin parar.
• Australian pull up: 8 reps
• Push up: 10 reps
• Sentadilla al aire: 15 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-07-26","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-27', -7000727, 'Activación', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Deslizamiento de escápula en plancha: 10 reps
• Cat camel: 10 reps
• Dislocaciones con banda: 15 reps

Activación · Preparación específica · 8 min
• Lean en plancha adelantada: 20 s
• Band pull apart: 15 reps
• Plancha con toque de hombro: 10 reps por lado', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-07-27","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-27', -7100727, 'Empuje horizontal y planche', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Planche en anillas · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck planche en anillas: 5 × 25 s
• Planche lean en el suelo: 5 × 25 s

Fuerza · Empuje horizontal · 26 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Push up arquero con tempo: 5 × 5
• Push up lastrado: 4 × 10', 'Fuerza · Accesorio y core · 10 min
• Plancha con toque de hombro: 4 × 12
• Face pull con banda: 4 × 12', 'Rodillo en pectoral y dorsal, puente de hombro sentado y 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-07-27","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-27', -7200727, 'Metcon', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    '21 min', '', 'EMOM · EMOM de empuje · 16 min
Un movimiento por minuto, rotando siempre en el mismo orden.
• Pike push up: 6 reps
• Push up: 12 reps
• Fondos en banco: 10 reps
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-07-27","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-28', -7000728, 'Activación', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Deslizamientos de escápula en barra: 10 reps
• Movilidad de cadera en 90/90: 8 reps por lado
• Dislocaciones con banda: 15 reps

Activación · Preparación específica · 8 min
• Face pull con banda: 15 reps
• Elevación de rodillas colgado: 10 reps
• Remo con banda: 15 reps', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-07-28","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-28', -7100728, 'Tracción horizontal y front lever', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Front lever a una pierna · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Front lever a una pierna: 5 × 25 s
• Tuck front lever raise: 5 × 4

Fuerza · Tracción horizontal · 26 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Remo en anillas con pausa 2 s: 5 × 5
• Remo en anillas lastrado: 4 × 10', 'Fuerza · Accesorio y core · 10 min
• Elevación de rodillas colgado: 4 × 12
• Arch hold: 4 × 35 s', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-07-28","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-28', -7200728, 'Metcon', 'Semana 30 · Mesociclo 8 · Intensificación · Carga',
    '20 min', '', 'AMRAP · Ring engine · 15 min
Las anillas mandan: mantén los codos pegados y el cuerpo en tensión.
• Remo en anillas: 10 reps
• Fondos en anillas asistidos: 8 reps
• Support hold en anillas: 20 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-07-28","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-31', -7000731, 'Activación', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Círculos de hombro en plancha: 8 reps por lado
• Cat camel: 10 reps
• Apertura de pectoral en marco de puerta: 30 s por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Elevación en Y con banda: 12 reps
• Push up plus: 10 reps', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-07-31","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-31', -7100731, 'Empuje vertical y handstand', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Equilibrio activo · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Wall handstand shoulder taps: 5 × 5
• Handstand hold libre: 10 intentos

Fuerza · Empuje vertical · 26 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• HSPU negativa contra pared: 5 × 4
• Fondos en paralelas lastrados: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 4 × 15
• Face pull con banda: 4 × 15', 'Estira dorsales y pectoral 45 s por lado, más movilidad de muñeca en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-07-31","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-07-31', -7200731, 'Metcon', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    '24 min', '', 'Rounds For Time · Pike y pistol · 5 rondas · Cap 19 min
Alterna piernas en el pistol y controla la bajada del pike.
• Pike push up: 8 reps
• Pistol asistido: 5 reps por lado
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-07-31","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-01', -7000801, 'Activación', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Apertura de pectoral en pared: 30 s por lado
• Deslizamientos de escápula en barra: 10 reps
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Rotación externa con banda: 12 reps por lado
• Face pull con banda: 15 reps
• Hollow hold: 30 s', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-08-01","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-01', -7100801, 'Tracción vertical y muscle-up', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Transición de muscle-up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Transición de muscle-up en anillas bajas: 5 × 5
• Dominada alta al esternón: 5 × 5

Fuerza · Tracción vertical · 26 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Dominada lastrada: 5 × 4
• Remo en anillas lastrado: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Rotación externa con banda: 4 × 15
• Arch hold: 4 × 40 s', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-08-01","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-01', -7200801, 'Metcon', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    '16 min', '', 'Unbroken · Unbroken de suelo · 11 min
Series sin pausa: para en cuanto pierdas la línea del cuerpo.
• Push up: 5 series de 12 reps sin parar
• Hollow hold: 5 series de 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-08-01","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-02', -7000802, 'Activación', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Cat camel: 10 reps
• Estiramiento de isquios activo: 10 reps por lado
• Círculos de cadera en cuadrupedia: 8 reps por lado

Activación · Preparación específica · 8 min
• Zancada con salto suave: 8 reps por lado
• Sentadilla isométrica en pared: 30 s
• Hollow hold: 30 s', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-08-02","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-02', -7100802, 'Piernas, salto y core', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Pistol completo · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pistol squat: 5 × 5
• Shrimp squat: 5 × 5

Fuerza · Piernas y core · 26 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Pistol squat: 5 × 4
• Nordic curl negativo: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Elevación de rodillas colgado: 4 × 15
• Copenhagen plank: 4 × 40 s', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-08-02","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-02', -7200802, 'Metcon', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    '25 min', '', 'Rounds For Time · Grin and bear · 5 rondas · Cap 20 min
Fragmenta las dominadas antes de llegar al fallo.
• Dominada con banda si hace falta: 5 reps
• Toes to bar o elevación de rodillas: 8 reps
• Zancada inversa: 10 reps por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-08-02","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-03', -7000803, 'Activación', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Puente de hombro sentado: 10 reps
• Deslizamiento de escápula en plancha: 10 reps
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Face pull con banda: 15 reps
• Lean en plancha adelantada: 20 s
• Band pull apart: 15 reps', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-08-03","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-03', -7100803, 'Empuje horizontal y planche', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Tuck planche · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck planche: 5 × 30 s
• Planche lean en paralelas: 5 × 30 s

Fuerza · Empuje horizontal · 26 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Push up lastrado: 5 × 4
• Fondos en anillas: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Rueda abdominal: 4 × 15
• Elevación en Y con banda: 4 × 15', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-08-03","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-03', -7200803, 'Metcon', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    '18 min', '', 'AMRAP · Piernas al aire · 13 min
Aterriza suave en los saltos y mantén el pecho alto en las zancadas.
• Sentadilla al aire: 20 reps
• Zancada con salto: 10 reps por lado
• Salto al cajón: 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-08-03","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-04', -7000804, 'Activación', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Apertura de pectoral en pared: 30 s por lado
• Deslizamientos de escápula en barra: 10 reps
• Movilidad de cadera en 90/90: 8 reps por lado

Activación · Preparación específica · 8 min
• Dead bug lento: 10 reps por lado
• Face pull con banda: 15 reps
• Elevación de rodillas colgado: 10 reps', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-08-04","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-04', -7100804, 'Tracción horizontal y front lever', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Advanced tuck front lever · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Advanced tuck front lever: 5 × 30 s
• Front lever raise en advanced tuck: 5 × 5

Fuerza · Tracción horizontal · 26 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Remo en anillas lastrado: 5 × 4
• Australian pull up lastrado: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Toes to bar estricto: 4 × 15
• Face pull con banda: 4 × 15', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal y isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-08-04","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-04', -7200804, 'Metcon', 'Semana 31 · Mesociclo 8 · Intensificación · Pico',
    '18 min', '', 'Estaciones de tiempo · Estaciones de core · 13 min · 3 estaciones
Un minuto por estación y cuatro vueltas, cambiando sin pausa.
• Hollow hold: 1 min
• Plancha con toque de hombro: 1 min
• Elevación de rodillas colgado: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-08-04","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-07', -7000807, 'Activación', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    '10 min', '', 'Movilidad · Empuje vertical · 10 min
• Puente de hombro sentado: 10 reps
• Círculos de hombro en plancha: 8 reps por lado
• Cat camel: 10 reps
• Apertura de pectoral en marco de puerta: 30 s por lado', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-08-07","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-07', -7100807, 'Empuje vertical y handstand', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Fuerza en invertido · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• HSPU negativa contra pared: 3 × 4
• Wall handstand de frente: 3 × 20 s

Fuerza · Empuje vertical · 26 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Pike push up con déficit: 3 × 5
• Fondos en anillas: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Dead bug lento: 2 × 12
• Elevación en Y con banda: 2 × 12', 'Colgado pasivo en barra 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-08-07","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-07', -7200807, 'Metcon', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    '15 min', '', 'For Time · Test de resistencia · Cap 10 min
Anota el tiempo: este metcon se repite al final de cada fase para comparar.
• Dominada: 25 reps
• Push up: 50 reps
• Sentadilla al aire: 75 reps
• Hollow rock: 100 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-08-07","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-08', -7000808, 'Activación', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    '10 min', '', 'Movilidad · Tracción vertical · 10 min
• Puente de hombro sentado: 10 reps
• Apertura de pectoral en pared: 30 s por lado
• Deslizamientos de escápula en barra: 10 reps
• Cat camel: 10 reps', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-08-08","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-08', -7100808, 'Tracción vertical y muscle-up', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Dominada lastrada · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Dominada lastrada: 3 × 4
• Dominada negativa en 5 s: 3 × 4

Fuerza · Tracción vertical · 26 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Dominada con agarre estrecho lastrada: 3 × 5
• Australian pull up lastrado: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Remo a una mano con banda: 2 × 12
• Plancha con toque de hombro: 2 × 12', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-08-08","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-08', -7200808, 'Metcon', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    '15 min', '', 'Rounds For Time · Pistol partner · 3 rondas · Cap 10 min
Alterna piernas en cada repetición y usa anillas si necesitas asistencia.
• Pistol asistido: 6 reps por lado
• Hollow rock: 20 reps
• Sentadilla en salto: 15 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-08-08","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-09', -7000809, 'Activación', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    '10 min', '', 'Movilidad · Piernas y core · 10 min
• Puente de glúteo a una pierna: 10 reps por lado
• Cat camel: 10 reps
• Estiramiento de isquios activo: 10 reps por lado
• Círculos de cadera en cuadrupedia: 8 reps por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-08-09","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-09', -7100809, 'Piernas, salto y core', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Nordic curl · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Nordic curl negativo: 3 × 4
• Zancada búlgara lastrada: 3 × 4

Fuerza · Piernas y core · 26 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Sentadilla búlgara lastrada: 3 × 5
• Puente de glúteo a una pierna lastrado: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• V-up: 2 × 12
• Puente de glúteo a una pierna: 2 × 12', 'Sentadilla profunda sostenida 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-08-09","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-09', -7200809, 'Metcon', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    '13 min', '', 'Ladder · Push ladder · 21-15-9 · Cap 8 min
Si las flexiones se rompen, sube las manos a un cajón.
• Push up: reps del esquema
• Sentadilla al aire: reps del esquema', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-08-09","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-10', -7000810, 'Activación', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    '10 min', '', 'Movilidad · Empuje horizontal · 10 min
• Movilidad de codo con banda: 12 reps
• Puente de hombro sentado: 10 reps
• Deslizamiento de escápula en plancha: 10 reps
• Cat camel: 10 reps', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-08-10","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-10', -7100810, 'Empuje horizontal y planche', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Pseudo planche push up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pseudo planche push up: 3 × 4
• Tuck planche con banda: 3 × 20 s

Fuerza · Empuje horizontal · 26 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Push up en anillas con rotación final: 3 × 5
• Fondos en paralelas lastrados: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 2 × 12
• Push up plus con pausa: 2 × 12', 'Apertura de pectoral en pared, colgado pasivo 3 × 30 s y movilidad de muñeca. 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-08-10","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-10', -7200810, 'Metcon', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    '11 min', '', 'AMRAP · Burpee pull up · 6 min
Si no llegas a la barra, haz burpee y salto vertical con los brazos arriba.
• Burpee pull up: 5 reps
• Sentadilla al aire: 10 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-08-10","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-11', -7000811, 'Activación', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    '10 min', '', 'Movilidad · Tracción horizontal · 10 min
• Estiramiento de isquios activo: 10 reps por lado
• Apertura de pectoral en pared: 30 s por lado
• Deslizamientos de escápula en barra: 10 reps
• Movilidad de cadera en 90/90: 8 reps por lado', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-08-11","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-11', -7100811, 'Tracción horizontal y front lever', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Negativas de front lever · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Front lever negativo en 5 s: 3 × 4
• Advanced tuck front lever: 3 × 20 s

Fuerza · Tracción horizontal · 26 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Remo en anillas a una mano asistido: 3 × 5
• Remo en anillas al esternón: 2 × 10', 'Fuerza · Accesorio y core · 10 min
• Rueda abdominal: 2 × 12
• Rotación externa con banda: 2 × 12', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-08-11","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-11', -7200811, 'Metcon', 'Semana 32 · Mesociclo 8 · Intensificación · Descarga',
    '13 min', '', 'EMOM · Muscle-up practice · 8 min
Calidad por encima de cantidad: salta el minuto si la transición se rompe.
• Transición de muscle-up asistida: 3 reps
• Dominada explosiva: 4 reps
• Fondos en paralelas: 8 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-08-11","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-14', -7000814, 'Activación', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Dislocaciones con banda: 15 reps
• Wall slides en pared: 12 reps
• Movilidad de muñeca en el suelo: 45 s

Activación · Preparación específica · 8 min
• Scapular push up: 12 reps
• Band pull apart: 15 reps
• Face pull con banda: 15 reps', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-08-14","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-14', -7100814, 'Empuje vertical y handstand', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Desplazamiento invertido · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Handstand walk: 8 intentos
• Wall handstand shoulder taps: 5 × 3

Fuerza · Empuje vertical · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Pseudo planche push up: 4 × 5
• HSPU contra pared: 3 × 8', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 4 × 30 s
• Extensión de tríceps en anillas: 3 × 10', 'Estiramiento de tríceps sobre la cabeza, puente de hombro sentado y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-08-14","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-14', -7200814, 'Metcon', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    '14 min', '', 'AMRAP · Descarga activa · 9 min
Ritmo suave, respirando por la nariz de principio a fin.
• Active hang: 30 s
• Push up: 8 reps
• Sentadilla al aire: 12 reps
• Dead bug lento: 10 reps por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-08-14","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-15', -7000815, 'Activación', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Colgado pasivo en barra: 30 s
• Dislocaciones con banda: 15 reps
• Rotación torácica tumbado: 8 reps por lado

Activación · Preparación específica · 8 min
• Scapular pull up: 10 reps
• Band pull apart: 15 reps
• Remo con banda: 15 reps', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-08-15","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-15', -7100815, 'Tracción vertical y muscle-up', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Fuerza en el punto muerto · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Muscle-up negativo en 5 s: 5 × 3
• Dominada lastrada: 5 × 3

Fuerza · Tracción vertical · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Dominada explosiva a barra alta: 4 × 5
• Dominada lastrada: 3 × 8', 'Fuerza · Accesorio y core · 10 min
• Curl de bíceps en anillas: 3 × 10
• Hollow hold: 4 × 30 s', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-08-15","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-15', -7200815, 'Metcon', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    '14 min', '', 'AMRAP · Burpee pull up · 9 min
Si no llegas a la barra, haz burpee y salto vertical con los brazos arriba.
• Burpee pull up: 5 reps
• Sentadilla al aire: 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-08-15","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-16', -7000816, 'Activación', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Movilidad de tobillo en pared: 10 reps por lado
• Sentadilla profunda sostenida: 45 s
• Cossack squat: 8 reps por lado

Activación · Preparación específica · 8 min
• Monster walk con banda: 12 pasos por lado
• Puente de glúteo: 15 reps
• Elevación de talón a una pierna: 15 reps por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-08-16","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-16', -7100816, 'Piernas, salto y core', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Potencia de salto · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Salto vertical máximo: 5 × 3
• Salto a una pierna al cajón: 5 × 3

Fuerza · Piernas y core · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Sentadilla a una pierna con salto: 4 × 5
• Nordic curl negativo: 3 × 8', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 4 × 30 s
• Elevación de talón a una pierna: 3 × 10', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-08-16","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-16', -7200816, 'Metcon', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    '23 min', '', 'For Time · Chipper de parque · Cap 18 min
Trabajo continuo de arriba abajo, sin repetir estación.
• Australian pull up: 40 reps
• Push up: 60 reps
• Sentadilla al aire: 80 reps
• Hollow rock: 40 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-08-16","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-17', -7000817, 'Activación', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Apertura de pectoral en pared: 30 s por lado
• Movilidad de muñeca en el suelo: 45 s
• Rotación torácica en cuadrupedia: 8 reps por lado

Activación · Preparación específica · 8 min
• Scapular push up: 12 reps
• Push up plus: 10 reps
• Hollow hold: 30 s', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-08-17","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-17', -7100817, 'Empuje horizontal y planche', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Fuerza de planche · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pseudo planche push up con déficit: 5 × 3
• Advanced tuck planche: 5 × 20 s

Fuerza · Empuje horizontal · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Push up a una mano asistido: 4 × 5
• Pseudo planche push up: 3 × 8', 'Fuerza · Accesorio y core · 10 min
• Extensión de tríceps en anillas: 3 × 10
• Hollow hold: 4 × 30 s', 'Rodillo en pectoral y dorsal, puente de hombro sentado y 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-08-17","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-17', -7200817, 'Metcon', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    '16 min', '', 'EMOM · Handstand engine · 11 min
Sube al invertido con control; si no llegas, sostén pike contra la pared.
• Handstand hold contra pared: 30 s
• Push up: 12 reps
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-08-17","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-18', -7000818, 'Activación', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Colgado pasivo en barra: 30 s
• Rotación torácica tumbado: 8 reps por lado
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Scapular pull up: 10 reps
• Hollow hold: 30 s
• Arch hold: 20 s', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-08-18","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-18', -7100818, 'Tracción horizontal y front lever', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Fuerza dinámica · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Front lever pull up en tuck: 5 × 3
• Straddle front lever: 5 × 20 s

Fuerza · Tracción horizontal · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Remo en anillas lastrado: 4 × 5
• Ice cream maker en tuck: 3 × 8', 'Fuerza · Accesorio y core · 10 min
• L-sit en paralelas: 4 × 30 s
• Curl de bíceps en anillas: 3 × 10', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-08-18","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-18', -7200818, 'Metcon', 'Semana 33 · Mesociclo 9 · Skills · Introducción',
    '19 min', '', 'Estaciones de tiempo · Motor de piernas · 14 min · 3 estaciones
Un minuto por estación y cinco vueltas, sin descanso entre estaciones.
• Sentadilla al aire: 1 min
• Step up al cajón: 1 min
• Puente de glúteo a una pierna: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-08-18","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-21', -7000821, 'Activación', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Wall slides en pared: 12 reps
• Movilidad de muñeca en el suelo: 45 s
• Rotación torácica en cuadrupedia: 8 reps por lado

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Face pull con banda: 15 reps
• Pike hold contra pared: 30 s', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-08-21","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-21', -7100821, 'Empuje vertical y handstand', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Handstand libre · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Handstand hold libre: 5 × 25 s
• Handstand shoulder taps libre: 5 × 4

Fuerza · Empuje vertical · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• HSPU contra pared: 5 × 4
• Fondos en anillas lastrados: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Hueco y arco alternos: 4 × 10
• Fondos en banco con pies elevados: 4 × 10', 'Estira dorsales y pectoral 45 s por lado, más movilidad de muñeca en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-08-21","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-21', -7200821, 'Metcon', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    '21 min', '', 'Estaciones de tiempo · Estaciones de tracción · 16 min · 4 estaciones
Un minuto por estación y cuatro vueltas, cambiando sin pausa.
• Dominada: 1 min
• Australian pull up: 1 min
• Elevación de rodillas colgado: 1 min
• Active hang: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-08-21","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-22', -7000822, 'Activación', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Dislocaciones con banda: 15 reps
• Rotación torácica tumbado: 8 reps por lado
• Movilidad de codo y muñeca: 45 s

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Remo con banda: 15 reps
• Active hang: 30 s', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-08-22","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-22', -7100822, 'Tracción vertical y muscle-up', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Muscle-up en barra · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Muscle-up estricto: 10 intentos
• Dominada alta al esternón: 5 × 4

Fuerza · Tracción vertical · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Dominada lastrada: 5 × 4
• Remo en anillas al esternón: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Face pull con banda: 4 × 10
• Elevación de rodillas colgado: 4 × 10', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-08-22","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-22', -7200822, 'Metcon', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    '23 min', '', 'For Time · Buy in and buy out · Cap 18 min
Entras y sales con la misma tarea: administra el ritmo del bloque central.
• Buy in con carrera: 400 m o 60 mountain climber
• Australian pull up: 30 reps
• Push up: 40 reps
• Buy out con carrera: 400 m o 60 mountain climber', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-08-22","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-23', -7000823, 'Activación', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Sentadilla profunda sostenida: 45 s
• Cossack squat: 8 reps por lado
• Movilidad de cadera en 90/90: 8 reps por lado

Activación · Preparación específica · 8 min
• Puente de glúteo: 15 reps
• Elevación de talón a una pierna: 15 reps por lado
• Dead bug lento: 10 reps por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-08-23","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-23', -7100823, 'Piernas, salto y core', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Pistol lastrado · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pistol squat lastrado: 5 × 4
• Shrimp squat: 5 × 4

Fuerza · Piernas y core · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Pistol squat lastrado: 5 × 4
• Nordic curl: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 4 × 10
• Dead bug lento: 4 × 10', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-08-23","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-23', -7200823, 'Metcon', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    '21 min', '', 'Estaciones de tiempo · Estaciones del parque · 16 min · 4 estaciones
Un minuto por estación y cuatro vueltas, sin descanso entre estaciones.
• Australian pull up: 1 min
• Push up: 1 min
• Sentadilla al aire: 1 min
• Plancha frontal: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-08-23","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-24', -7000824, 'Activación', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Movilidad de muñeca en el suelo: 45 s
• Rotación torácica en cuadrupedia: 8 reps por lado
• Dislocaciones con banda: 15 reps

Activación · Preparación específica · 8 min
• Push up plus: 10 reps
• Hollow hold: 30 s
• Plancha con toque de hombro: 10 reps por lado', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-08-24","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-24', -7100824, 'Empuje horizontal y planche', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Advanced tuck planche · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Advanced tuck planche: 5 × 25 s
• Pseudo planche push up: 5 × 4

Fuerza · Empuje horizontal · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Pseudo planche push up: 5 × 4
• Fondos en anillas lastrados: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Plancha con toque de hombro: 4 × 10
• Face pull con banda: 4 × 10', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-08-24","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-24', -7200824, 'Metcon', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    '19 min', '', 'Ladder · Escalera de dominadas · 1-2-3-4-5-6-7 · Cap 14 min
Sube de una en una y baja de progresión cuando pierdas el rango completo.
• Dominada: reps del esquema
• Push up: el doble de reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-08-24","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-25', -7000825, 'Activación', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Rotación torácica tumbado: 8 reps por lado
• Cat camel: 10 reps
• Dislocaciones con banda: 15 reps

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Arch hold: 20 s
• Remo con banda: 15 reps', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-08-25","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-25', -7100825, 'Tracción horizontal y front lever', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Straddle front lever · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Straddle front lever: 5 × 25 s
• Front lever negativo en 5 s: 5 × 4

Fuerza · Tracción horizontal · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Front lever row en tuck: 5 × 4
• Remo en anillas lastrado: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Elevación de rodillas colgado: 4 × 10
• Arch hold: 4 × 35 s', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal y isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-08-25","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-25', -7200825, 'Metcon', 'Semana 34 · Mesociclo 9 · Skills · Carga',
    '18 min', '', 'Ladder · Dips and squats · 21-15-9 · Cap 13 min
Fondos en paralelas o en banco según tu nivel.
• Fondos en paralelas: reps del esquema
• Sentadilla en salto: reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-08-25","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-28', -7000828, 'Activación', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Movilidad de muñeca en el suelo: 45 s
• Rotación torácica en cuadrupedia: 8 reps por lado
• Apertura de pectoral en marco de puerta: 30 s por lado

Activación · Preparación específica · 8 min
• Face pull con banda: 15 reps
• Pike hold contra pared: 30 s
• Push up plus: 10 reps', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-08-28","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-28', -7100828, 'Empuje vertical y handstand', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Handstand push up · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• HSPU contra pared: 6 × 4
• Handstand hold libre: 6 × 25 s

Fuerza · Empuje vertical · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• HSPU con déficit contra pared: 6 × 3
• Fondos en paralelas lastrados: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 4 × 12
• Face pull con banda: 4 × 12', 'Colgado pasivo en barra 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-08-28","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-28', -7200828, 'Metcon', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    '20 min', '', 'AMRAP · Park engine · 15 min
Ritmo constante: elige la progresión que te deje seguir sin parar.
• Australian pull up: 8 reps
• Push up: 10 reps
• Sentadilla al aire: 15 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-08-28","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-29', -7000829, 'Activación', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Rotación torácica tumbado: 8 reps por lado
• Movilidad de codo y muñeca: 45 s
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Remo con banda: 15 reps
• Active hang: 30 s
• Hollow hold: 30 s', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-08-29","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-29', -7100829, 'Tracción vertical y muscle-up', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Muscle-up en anillas · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Muscle-up en anillas con banda: 6 × 4
• Transición de muscle-up en anillas bajas: 6 × 4

Fuerza · Tracción vertical · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Dominada al esternón: 6 × 3
• Remo en anillas lastrado: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Rotación externa con banda: 4 × 12
• Arch hold: 5 × 35 s', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-08-29","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-29', -7200829, 'Metcon', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    '25 min', '', 'Ladder · Escalera invertida · 10-9-8-7-6-5-4-3-2-1 · Cap 20 min
Bajas repeticiones en un movimiento mientras subes en el otro.
• Dominada: reps descendentes del esquema
• Fondos en banco: reps ascendentes del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-08-29","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-30', -7000830, 'Activación', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Cossack squat: 8 reps por lado
• Movilidad de cadera en 90/90: 8 reps por lado
• Círculos de cadera en cuadrupedia: 8 reps por lado

Activación · Preparación específica · 8 min
• Elevación de talón a una pierna: 15 reps por lado
• Dead bug lento: 10 reps por lado
• Hollow hold: 30 s', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-08-30","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-30', -7100830, 'Piernas, salto y core', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Nordic curl completo · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Nordic curl: 6 × 4
• Pistol squat: 6 × 4

Fuerza · Piernas y core · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Shrimp squat: 6 × 3
• Puente nórdico: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Elevación de rodillas colgado: 4 × 12
• Copenhagen plank: 5 × 35 s', 'Sentadilla profunda sostenida 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-08-30","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-30', -7200830, 'Metcon', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    '23 min', '', 'EMOM · EMOM de empuje · 18 min
Un movimiento por minuto, rotando siempre en el mismo orden.
• Pike push up: 6 reps
• Push up: 12 reps
• Fondos en banco: 10 reps
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-08-30","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-31', -7000831, 'Activación', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Rotación torácica en cuadrupedia: 8 reps por lado
• Dislocaciones con banda: 15 reps
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Plancha con toque de hombro: 10 reps por lado
• Band pull apart: 15 reps', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-08-31","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-31', -7100831, 'Empuje horizontal y planche', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Straddle planche asistido · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Straddle planche con banda: 6 × 25 s
• Tuck planche: 6 × 25 s

Fuerza · Empuje horizontal · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Push up lastrado: 6 × 3
• Push up en anillas con rotación final: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Rueda abdominal: 4 × 12
• Elevación en Y con banda: 4 × 12', 'Apertura de pectoral en pared, colgado pasivo 3 × 30 s y movilidad de muñeca. 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-08-31","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-08-31', -7200831, 'Metcon', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    '22 min', '', 'AMRAP · Ring engine · 17 min
Las anillas mandan: mantén los codos pegados y el cuerpo en tensión.
• Remo en anillas: 10 reps
• Fondos en anillas asistidos: 8 reps
• Support hold en anillas: 20 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-08-31","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-01', -7000901, 'Activación', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Cat camel: 10 reps
• Dislocaciones con banda: 15 reps
• Movilidad de cadera en 90/90: 8 reps por lado

Activación · Preparación específica · 8 min
• Arch hold: 20 s
• Remo con banda: 15 reps
• Elevación de rodillas colgado: 10 reps', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-09-01","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-01', -7100901, 'Tracción horizontal y front lever', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Front lever completo · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Front lever: 12 intentos
• Front lever a una pierna: 6 × 25 s

Fuerza · Tracción horizontal · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Remo en anillas a una mano: 6 × 3
• Front lever row en tuck: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Toes to bar estricto: 4 × 12
• Face pull con banda: 4 × 12', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-09-01","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-01', -7200901, 'Metcon', 'Semana 35 · Mesociclo 9 · Skills · Pico',
    '25 min', '', 'AMRAP · Amanecer de parque · 20 min
Ritmo conversacional: el objetivo es acabar mejor de lo que empiezas.
• Carrera o cuerda: 200 m
• Australian pull up: 10 reps
• Push up: 15 reps
• Sentadilla al aire: 20 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-09-01","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-04', -7000904, 'Activación', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    '10 min', '', 'Movilidad · Empuje vertical · 10 min
• Rotación torácica en cuadrupedia: 8 reps por lado
• Apertura de pectoral en marco de puerta: 30 s por lado
• Cat camel: 10 reps
• Círculos de hombro en plancha: 8 reps por lado', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-09-04","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-04', -7100904, 'Empuje vertical y handstand', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Desplazamiento invertido · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Handstand walk: 5 intentos
• Wall handstand shoulder taps: 3 × 3

Fuerza · Empuje vertical · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Pseudo planche push up: 3 × 4
• HSPU contra pared: 2 × 8', 'Fuerza · Accesorio y core · 10 min
• Dead bug lento: 2 × 10
• Elevación en Y con banda: 2 × 10', 'Estiramiento de tríceps sobre la cabeza, puente de hombro sentado y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-09-04","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-04', -7200904, 'Metcon', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    '16 min', '', 'Rounds For Time · Grin and bear · 3 rondas · Cap 11 min
Fragmenta las dominadas antes de llegar al fallo.
• Dominada con banda si hace falta: 5 reps
• Toes to bar o elevación de rodillas: 8 reps
• Zancada inversa: 10 reps por lado', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-09-04","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-05', -7000905, 'Activación', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    '10 min', '', 'Movilidad · Tracción vertical · 10 min
• Movilidad de codo y muñeca: 45 s
• Cat camel: 10 reps
• Deslizamientos de escápula en barra: 10 reps
• Apertura de pectoral en pared: 30 s por lado', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-09-05","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-05', -7100905, 'Tracción vertical y muscle-up', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Fuerza en el punto muerto · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Muscle-up negativo en 5 s: 3 × 3
• Dominada lastrada: 3 × 3

Fuerza · Tracción vertical · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Dominada explosiva a barra alta: 3 × 4
• Dominada lastrada: 2 × 8', 'Fuerza · Accesorio y core · 10 min
• Remo a una mano con banda: 2 × 10
• Plancha con toque de hombro: 2 × 10', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-09-05","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-05', -7200905, 'Metcon', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    '15 min', '', 'AMRAP · I go you go · 10 min
En solitario se hace con 40 s de trabajo y 20 s de pausa por movimiento.
• Australian pull up: 40 s
• Push up: 40 s
• Sentadilla en salto: 40 s
• Hollow hold: 40 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-09-05","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-06', -7000906, 'Activación', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    '10 min', '', 'Movilidad · Piernas y core · 10 min
• Movilidad de cadera en 90/90: 8 reps por lado
• Círculos de cadera en cuadrupedia: 8 reps por lado
• Estiramiento de isquios activo: 10 reps por lado
• Cat camel: 10 reps', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-09-06","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-06', -7100906, 'Piernas, salto y core', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Potencia de salto · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Salto vertical máximo: 3 × 3
• Salto a una pierna al cajón: 3 × 3

Fuerza · Piernas y core · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Sentadilla a una pierna con salto: 3 × 4
• Nordic curl negativo: 2 × 8', 'Fuerza · Accesorio y core · 10 min
• V-up: 2 × 10
• Puente de glúteo a una pierna: 2 × 10', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-09-06","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-06', -7200906, 'Metcon', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    '11 min', '', 'Unbroken · Unbroken de suelo · 6 min
Series sin pausa: para en cuanto pierdas la línea del cuerpo.
• Push up: 5 series de 12 reps sin parar
• Hollow hold: 5 series de 30 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-09-06","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-07', -7000907, 'Activación', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    '10 min', '', 'Movilidad · Empuje horizontal · 10 min
• Dislocaciones con banda: 15 reps
• Cat camel: 10 reps
• Deslizamiento de escápula en plancha: 10 reps
• Puente de hombro sentado: 10 reps', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-09-07","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-07', -7100907, 'Empuje horizontal y planche', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Fuerza de planche · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pseudo planche push up con déficit: 3 × 3
• Advanced tuck planche: 3 × 20 s

Fuerza · Empuje horizontal · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Push up a una mano asistido: 3 × 4
• Pseudo planche push up: 2 × 8', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 2 × 10
• Push up plus con pausa: 2 × 10', 'Rodillo en pectoral y dorsal, puente de hombro sentado y 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-09-07","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-07', -7200907, 'Metcon', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    '12 min', '', 'Estaciones de tiempo · Estaciones de core · 7 min · 3 estaciones
Un minuto por estación y cuatro vueltas, cambiando sin pausa.
• Hollow hold: 1 min
• Plancha con toque de hombro: 1 min
• Elevación de rodillas colgado: 1 min', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-09-07","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-08', -7000908, 'Activación', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    '10 min', '', 'Movilidad · Tracción horizontal · 10 min
• Dislocaciones con banda: 15 reps
• Movilidad de cadera en 90/90: 8 reps por lado
• Deslizamientos de escápula en barra: 10 reps
• Apertura de pectoral en pared: 30 s por lado', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-09-08","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-08', -7100908, 'Tracción horizontal y front lever', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Fuerza dinámica · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Front lever pull up en tuck: 3 × 3
• Straddle front lever: 3 × 20 s

Fuerza · Tracción horizontal · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Remo en anillas lastrado: 3 × 4
• Ice cream maker en tuck: 2 × 8', 'Fuerza · Accesorio y core · 10 min
• Rueda abdominal: 2 × 10
• Rotación externa con banda: 2 × 10', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-09-08","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-08', -7200908, 'Metcon', 'Semana 36 · Mesociclo 9 · Skills · Descarga',
    '12 min', '', 'Ladder · Escalera de core · 5-10-15-20 · Cap 7 min
Sube el número de repeticiones en cada bloque sin perder la posición lumbar.
• Hollow rock: reps del esquema
• V-up: reps del esquema
• Plancha lateral: 15 s por lado entre bloques', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-09-08","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-11', -7000911, 'Activación', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Apertura de pectoral en marco de puerta: 30 s por lado
• Cat camel: 10 reps
• Círculos de hombro en plancha: 8 reps por lado

Activación · Preparación específica · 8 min
• Push up plus: 10 reps
• Elevación en Y con banda: 12 reps
• Hollow hold: 30 s', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-09-11","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-11', -7100911, 'Empuje vertical y handstand', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Handstand libre · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Handstand hold libre: 5 × 20 s
• Handstand shoulder taps libre: 5 × 3

Fuerza · Empuje vertical · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• HSPU contra pared: 4 × 5
• Fondos en anillas lastrados: 3 × 8', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 4 × 30 s
• Extensión de tríceps en anillas: 3 × 10', 'Estira dorsales y pectoral 45 s por lado, más movilidad de muñeca en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-09-11","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-11', -7200911, 'Metcon', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    '18 min', '', 'Ladder · Push ladder · 21-15-9 · Cap 13 min
Si las flexiones se rompen, sube las manos a un cajón.
• Push up: reps del esquema
• Sentadilla al aire: reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-09-11","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-12', -7000912, 'Activación', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Cat camel: 10 reps
• Deslizamientos de escápula en barra: 10 reps
• Apertura de pectoral en pared: 30 s por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Face pull con banda: 15 reps
• Rotación externa con banda: 12 reps por lado', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-09-12","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-12', -7100912, 'Tracción vertical y muscle-up', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Muscle-up en barra · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Muscle-up estricto: 8 intentos
• Dominada alta al esternón: 5 × 3

Fuerza · Tracción vertical · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Dominada lastrada: 4 × 5
• Remo en anillas al esternón: 3 × 8', 'Fuerza · Accesorio y core · 10 min
• Curl de bíceps en anillas: 3 × 10
• Hollow hold: 4 × 30 s', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-09-12","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-12', -7200912, 'Metcon', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    '14 min', '', 'For Time · Sprint de suelo · Cap 9 min
Es corto: entra fuerte y aguanta el ritmo hasta el final.
• Push up: 50 reps
• Hollow rock: 50 reps
• Plancha con toque de hombro: 50 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-09-12","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-13', -7000913, 'Activación', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Círculos de cadera en cuadrupedia: 8 reps por lado
• Estiramiento de isquios activo: 10 reps por lado
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Sentadilla isométrica en pared: 30 s
• Zancada con salto suave: 8 reps por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-09-13","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-13', -7100913, 'Piernas, salto y core', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Pistol lastrado · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pistol squat lastrado: 5 × 3
• Shrimp squat: 5 × 3

Fuerza · Piernas y core · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Pistol squat lastrado: 4 × 5
• Nordic curl: 3 × 8', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 4 × 30 s
• Elevación de talón a una pierna: 3 × 10', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-09-13","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-13', -7200913, 'Metcon', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    '19 min', '', 'Rounds For Time · Complex de peso corporal · 6 rondas · Cap 14 min
La ronda es un complex seguido: una dominada, dos flexiones y tres sentadillas sin parar.
• Dominada: 1 rep
• Push up: 2 reps
• Sentadilla al aire: 3 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-09-13","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-14', -7000914, 'Activación', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Cat camel: 10 reps
• Deslizamiento de escápula en plancha: 10 reps
• Puente de hombro sentado: 10 reps

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Lean en plancha adelantada: 20 s
• Face pull con banda: 15 reps', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-09-14","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-14', -7100914, 'Empuje horizontal y planche', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Advanced tuck planche · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Advanced tuck planche: 5 × 20 s
• Pseudo planche push up: 5 × 3

Fuerza · Empuje horizontal · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Pseudo planche push up: 4 × 5
• Fondos en anillas lastrados: 3 × 8', 'Fuerza · Accesorio y core · 10 min
• Extensión de tríceps en anillas: 3 × 10
• Hollow hold: 4 × 30 s', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-09-14","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-14', -7200914, 'Metcon', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    '18 min', '', 'EMOM · Muscle-up practice · 13 min
Calidad por encima de cantidad: salta el minuto si la transición se rompe.
• Transición de muscle-up asistida: 3 reps
• Dominada explosiva: 4 reps
• Fondos en paralelas: 8 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-09-14","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-15', -7000915, 'Activación', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Movilidad de cadera en 90/90: 8 reps por lado
• Deslizamientos de escápula en barra: 10 reps
• Apertura de pectoral en pared: 30 s por lado

Activación · Preparación específica · 8 min
• Elevación de rodillas colgado: 10 reps
• Face pull con banda: 15 reps
• Dead bug lento: 10 reps por lado', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-09-15","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-15', -7100915, 'Tracción horizontal y front lever', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Straddle front lever · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Straddle front lever: 5 × 20 s
• Front lever negativo en 5 s: 5 × 3

Fuerza · Tracción horizontal · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Front lever row en tuck: 4 × 5
• Remo en anillas lastrado: 3 × 8', 'Fuerza · Accesorio y core · 10 min
• L-sit en paralelas: 4 × 30 s
• Curl de bíceps en anillas: 3 × 10', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal y isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-09-15","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-15', -7200915, 'Metcon', 'Semana 37 · Mesociclo 10 · Skills · Introducción',
    '19 min', '', 'For Time · Test de resistencia · Cap 14 min
Anota el tiempo: este metcon se repite al final de cada fase para comparar.
• Dominada: 25 reps
• Push up: 50 reps
• Sentadilla al aire: 75 reps
• Hollow rock: 100 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-09-15","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-18', -7000918, 'Activación', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Cat camel: 10 reps
• Círculos de hombro en plancha: 8 reps por lado
• Puente de hombro sentado: 10 reps

Activación · Preparación específica · 8 min
• Elevación en Y con banda: 12 reps
• Hollow hold: 30 s
• Wall walk lento: 3 reps', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-09-18","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-18', -7100918, 'Empuje vertical y handstand', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Handstand push up · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• HSPU contra pared: 5 × 4
• Handstand hold libre: 5 × 25 s

Fuerza · Empuje vertical · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• HSPU con déficit contra pared: 5 × 4
• Fondos en paralelas lastrados: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Hueco y arco alternos: 4 × 10
• Fondos en banco con pies elevados: 4 × 10', 'Colgado pasivo en barra 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-09-18","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-18', -7200918, 'Metcon', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    '25 min', '', 'For Time · Chipper de parque · Cap 20 min
Trabajo continuo de arriba abajo, sin repetir estación.
• Australian pull up: 40 reps
• Push up: 60 reps
• Sentadilla al aire: 80 reps
• Hollow rock: 40 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-09-18","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-19', -7000919, 'Activación', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Deslizamientos de escápula en barra: 10 reps
• Apertura de pectoral en pared: 30 s por lado
• Puente de hombro sentado: 10 reps

Activación · Preparación específica · 8 min
• Face pull con banda: 15 reps
• Rotación externa con banda: 12 reps por lado
• Arch hold: 20 s', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-09-19","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-19', -7100919, 'Tracción vertical y muscle-up', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Muscle-up en anillas · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Muscle-up en anillas con banda: 5 × 4
• Transición de muscle-up en anillas bajas: 5 × 4

Fuerza · Tracción vertical · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Dominada al esternón: 5 × 4
• Remo en anillas lastrado: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Face pull con banda: 4 × 10
• Elevación de rodillas colgado: 4 × 10', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-09-19","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-19', -7200919, 'Metcon', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    '18 min', '', 'Ladder · Dips and squats · 21-15-9 · Cap 13 min
Fondos en paralelas o en banco según tu nivel.
• Fondos en paralelas: reps del esquema
• Sentadilla en salto: reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-09-19","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-20', -7000920, 'Activación', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Estiramiento de isquios activo: 10 reps por lado
• Cat camel: 10 reps
• Puente de glúteo a una pierna: 10 reps por lado

Activación · Preparación específica · 8 min
• Sentadilla isométrica en pared: 30 s
• Zancada con salto suave: 8 reps por lado
• Plancha lateral: 30 s por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-09-20","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-20', -7100920, 'Piernas, salto y core', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Nordic curl completo · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Nordic curl: 5 × 4
• Pistol squat: 5 × 4

Fuerza · Piernas y core · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Shrimp squat: 5 × 4
• Puente nórdico: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 4 × 10
• Dead bug lento: 4 × 10', 'Sentadilla profunda sostenida 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-09-20","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-20', -7200920, 'Metcon', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    '17 min', '', 'EMOM · Handstand engine · 12 min
Sube al invertido con control; si no llegas, sostén pike contra la pared.
• Handstand hold contra pared: 30 s
• Push up: 12 reps
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-09-20","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-21', -7000921, 'Activación', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Deslizamiento de escápula en plancha: 10 reps
• Puente de hombro sentado: 10 reps
• Movilidad de codo con banda: 12 reps

Activación · Preparación específica · 8 min
• Lean en plancha adelantada: 20 s
• Face pull con banda: 15 reps
• Dead bug lento: 10 reps por lado', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-09-21","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-21', -7100921, 'Empuje horizontal y planche', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Straddle planche asistido · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Straddle planche con banda: 5 × 25 s
• Tuck planche: 5 × 25 s

Fuerza · Empuje horizontal · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Push up lastrado: 5 × 4
• Push up en anillas con rotación final: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Plancha con toque de hombro: 4 × 10
• Face pull con banda: 4 × 10', 'Apertura de pectoral en pared, colgado pasivo 3 × 30 s y movilidad de muñeca. 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-09-21","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-21', -7200921, 'Metcon', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    '20 min', '', 'Estaciones de tiempo · Motor de piernas · 15 min · 3 estaciones
Un minuto por estación y cinco vueltas, sin descanso entre estaciones.
• Sentadilla al aire: 1 min
• Step up al cajón: 1 min
• Puente de glúteo a una pierna: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-09-21","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-22', -7000922, 'Activación', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Deslizamientos de escápula en barra: 10 reps
• Apertura de pectoral en pared: 30 s por lado
• Estiramiento de isquios activo: 10 reps por lado

Activación · Preparación específica · 8 min
• Face pull con banda: 15 reps
• Dead bug lento: 10 reps por lado
• Active hang: 30 s', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-09-22","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-22', -7100922, 'Tracción horizontal y front lever', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Front lever completo · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Front lever: 10 intentos
• Front lever a una pierna: 5 × 25 s

Fuerza · Tracción horizontal · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Remo en anillas a una mano: 5 × 4
• Front lever row en tuck: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Elevación de rodillas colgado: 4 × 10
• Arch hold: 4 × 35 s', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-09-22","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-22', -7200922, 'Metcon', 'Semana 38 · Mesociclo 10 · Skills · Carga',
    '15 min', '', 'AMRAP · Descarga activa · 10 min
Ritmo suave, respirando por la nariz de principio a fin.
• Active hang: 30 s
• Push up: 8 reps
• Sentadilla al aire: 12 reps
• Dead bug lento: 10 reps por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-09-22","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-25', -7000925, 'Activación', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Círculos de hombro en plancha: 8 reps por lado
• Puente de hombro sentado: 10 reps
• Dislocaciones con banda: 15 reps

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Wall walk lento: 3 reps
• Scapular push up: 12 reps', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-09-25","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-25', -7100925, 'Empuje vertical y handstand', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Desplazamiento invertido · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Handstand walk: 12 intentos
• Wall handstand shoulder taps: 6 × 4

Fuerza · Empuje vertical · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Pseudo planche push up: 6 × 3
• HSPU contra pared: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 4 × 12
• Face pull con banda: 4 × 12', 'Estiramiento de tríceps sobre la cabeza, puente de hombro sentado y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-09-25","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-25', -7200925, 'Metcon', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    '23 min', '', 'EMOM · EMOM de tracción · 18 min
Un movimiento por minuto, rotando siempre en el mismo orden.
• Dominada con banda si hace falta: 4 reps
• Australian pull up: 8 reps
• Elevación de rodillas colgado: 10 reps
• Active hang: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-09-25","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-26', -7000926, 'Activación', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Apertura de pectoral en pared: 30 s por lado
• Puente de hombro sentado: 10 reps
• Colgado pasivo en barra: 30 s

Activación · Preparación específica · 8 min
• Rotación externa con banda: 12 reps por lado
• Arch hold: 20 s
• Scapular pull up: 10 reps', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-09-26","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-26', -7100926, 'Tracción vertical y muscle-up', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Fuerza en el punto muerto · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Muscle-up negativo en 5 s: 6 × 4
• Dominada lastrada: 6 × 4

Fuerza · Tracción vertical · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Dominada explosiva a barra alta: 6 × 3
• Dominada lastrada: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Rotación externa con banda: 4 × 12
• Arch hold: 5 × 35 s', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-09-26","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-26', -7200926, 'Metcon', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    '24 min', '', 'Rounds For Time · Pike y pistol · 5 rondas · Cap 19 min
Alterna piernas en el pistol y controla la bajada del pike.
• Pike push up: 8 reps
• Pistol asistido: 5 reps por lado
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-09-26","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-27', -7000927, 'Activación', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Cat camel: 10 reps
• Puente de glúteo a una pierna: 10 reps por lado
• Movilidad de tobillo en pared: 10 reps por lado

Activación · Preparación específica · 8 min
• Zancada con salto suave: 8 reps por lado
• Plancha lateral: 30 s por lado
• Monster walk con banda: 12 pasos por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-09-27","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-27', -7100927, 'Piernas, salto y core', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Potencia de salto · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Salto vertical máximo: 6 × 4
• Salto a una pierna al cajón: 6 × 4

Fuerza · Piernas y core · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Sentadilla a una pierna con salto: 6 × 3
• Nordic curl negativo: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Elevación de rodillas colgado: 4 × 12
• Copenhagen plank: 5 × 35 s', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-09-27","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-27', -7200927, 'Metcon', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    '20 min', '', 'Ladder · Escalera de dominadas · 1-2-3-4-5-6-7 · Cap 15 min
Sube de una en una y baja de progresión cuando pierdas el rango completo.
• Dominada: reps del esquema
• Push up: el doble de reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-09-27","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-28', -7000928, 'Activación', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Puente de hombro sentado: 10 reps
• Movilidad de codo con banda: 12 reps
• Apertura de pectoral en pared: 30 s por lado

Activación · Preparación específica · 8 min
• Face pull con banda: 15 reps
• Dead bug lento: 10 reps por lado
• Scapular push up: 12 reps', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-09-28","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-28', -7100928, 'Empuje horizontal y planche', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Fuerza de planche · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pseudo planche push up con déficit: 6 × 4
• Advanced tuck planche: 6 × 25 s

Fuerza · Empuje horizontal · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Push up a una mano asistido: 6 × 3
• Pseudo planche push up: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Rueda abdominal: 4 × 12
• Elevación en Y con banda: 4 × 12', 'Rodillo en pectoral y dorsal, puente de hombro sentado y 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-09-28","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-28', -7200928, 'Metcon', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    '19 min', '', 'Ladder · Dips and squats · 21-15-9 · Cap 14 min
Fondos en paralelas o en banco según tu nivel.
• Fondos en paralelas: reps del esquema
• Sentadilla en salto: reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-09-28","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-29', -7000929, 'Activación', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Apertura de pectoral en pared: 30 s por lado
• Estiramiento de isquios activo: 10 reps por lado
• Colgado pasivo en barra: 30 s

Activación · Preparación específica · 8 min
• Dead bug lento: 10 reps por lado
• Active hang: 30 s
• Scapular pull up: 10 reps', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-09-29","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-29', -7100929, 'Tracción horizontal y front lever', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Fuerza dinámica · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Front lever pull up en tuck: 6 × 4
• Straddle front lever: 6 × 25 s

Fuerza · Tracción horizontal · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Remo en anillas lastrado: 6 × 3
• Ice cream maker en tuck: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Toes to bar estricto: 4 × 12
• Face pull con banda: 4 × 12', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-09-29","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-09-29', -7200929, 'Metcon', 'Semana 39 · Mesociclo 10 · Skills · Pico',
    '23 min', '', 'Estaciones de tiempo · Estaciones de tracción · 18 min · 4 estaciones
Un minuto por estación y cuatro vueltas, cambiando sin pausa.
• Dominada: 1 min
• Australian pull up: 1 min
• Elevación de rodillas colgado: 1 min
• Active hang: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-09-29","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-02', -7001002, 'Activación', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    '10 min', '', 'Movilidad · Empuje vertical · 10 min
• Puente de hombro sentado: 10 reps
• Dislocaciones con banda: 15 reps
• Wall slides en pared: 12 reps
• Movilidad de muñeca en el suelo: 45 s', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-10-02","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-02', -7101002, 'Empuje vertical y handstand', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Handstand libre · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Handstand hold libre: 3 × 20 s
• Handstand shoulder taps libre: 3 × 3

Fuerza · Empuje vertical · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• HSPU contra pared: 3 × 4
• Fondos en anillas lastrados: 2 × 8', 'Fuerza · Accesorio y core · 10 min
• Dead bug lento: 2 × 10
• Elevación en Y con banda: 2 × 10', 'Estira dorsales y pectoral 45 s por lado, más movilidad de muñeca en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-10-02","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-02', -7201002, 'Metcon', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    '12 min', '', 'AMRAP · Piernas al aire · 7 min
Aterriza suave en los saltos y mantén el pecho alto en las zancadas.
• Sentadilla al aire: 20 reps
• Zancada con salto: 10 reps por lado
• Salto al cajón: 10 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-10-02","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-03', -7001003, 'Activación', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    '10 min', '', 'Movilidad · Tracción vertical · 10 min
• Puente de hombro sentado: 10 reps
• Colgado pasivo en barra: 30 s
• Dislocaciones con banda: 15 reps
• Rotación torácica tumbado: 8 reps por lado', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-10-03","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-03', -7101003, 'Tracción vertical y muscle-up', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Muscle-up en barra · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Muscle-up estricto: 5 intentos
• Dominada alta al esternón: 3 × 3

Fuerza · Tracción vertical · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Dominada lastrada: 3 × 4
• Remo en anillas al esternón: 2 × 8', 'Fuerza · Accesorio y core · 10 min
• Remo a una mano con banda: 2 × 10
• Plancha con toque de hombro: 2 × 10', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-10-03","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-03', -7201003, 'Metcon', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    '15 min', '', 'For Time · Test de resistencia · Cap 10 min
Anota el tiempo: este metcon se repite al final de cada fase para comparar.
• Dominada: 25 reps
• Push up: 50 reps
• Sentadilla al aire: 75 reps
• Hollow rock: 100 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-10-03","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-04', -7001004, 'Activación', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    '10 min', '', 'Movilidad · Piernas y core · 10 min
• Puente de glúteo a una pierna: 10 reps por lado
• Movilidad de tobillo en pared: 10 reps por lado
• Sentadilla profunda sostenida: 45 s
• Cossack squat: 8 reps por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-10-04","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-04', -7101004, 'Piernas, salto y core', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Pistol lastrado · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pistol squat lastrado: 3 × 3
• Shrimp squat: 3 × 3

Fuerza · Piernas y core · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Pistol squat lastrado: 3 × 4
• Nordic curl: 2 × 8', 'Fuerza · Accesorio y core · 10 min
• V-up: 2 × 10
• Puente de glúteo a una pierna: 2 × 10', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-10-04","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-04', -7201004, 'Metcon', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    '16 min', '', 'Ladder · Escalera invertida · 10-9-8-7-6-5-4-3-2-1 · Cap 11 min
Bajas repeticiones en un movimiento mientras subes en el otro.
• Dominada: reps descendentes del esquema
• Fondos en banco: reps ascendentes del esquema', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-10-04","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-05', -7001005, 'Activación', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    '10 min', '', 'Movilidad · Empuje horizontal · 10 min
• Movilidad de codo con banda: 12 reps
• Apertura de pectoral en pared: 30 s por lado
• Movilidad de muñeca en el suelo: 45 s
• Rotación torácica en cuadrupedia: 8 reps por lado', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-10-05","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-05', -7101005, 'Empuje horizontal y planche', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Advanced tuck planche · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Advanced tuck planche: 3 × 20 s
• Pseudo planche push up: 3 × 3

Fuerza · Empuje horizontal · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Pseudo planche push up: 3 × 4
• Fondos en anillas lastrados: 2 × 8', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 2 × 10
• Push up plus con pausa: 2 × 10', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-10-05","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-05', -7201005, 'Metcon', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    '16 min', '', 'AMRAP · Amanecer de parque · 11 min
Ritmo conversacional: el objetivo es acabar mejor de lo que empiezas.
• Carrera o cuerda: 200 m
• Australian pull up: 10 reps
• Push up: 15 reps
• Sentadilla al aire: 20 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-10-05","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-06', -7001006, 'Activación', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    '10 min', '', 'Movilidad · Tracción horizontal · 10 min
• Estiramiento de isquios activo: 10 reps por lado
• Colgado pasivo en barra: 30 s
• Rotación torácica tumbado: 8 reps por lado
• Cat camel: 10 reps', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-10-06","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-06', -7101006, 'Tracción horizontal y front lever', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Straddle front lever · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Straddle front lever: 3 × 20 s
• Front lever negativo en 5 s: 3 × 3

Fuerza · Tracción horizontal · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Front lever row en tuck: 3 × 4
• Remo en anillas lastrado: 2 × 8', 'Fuerza · Accesorio y core · 10 min
• Rueda abdominal: 2 × 10
• Rotación externa con banda: 2 × 10', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal y isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-10-06","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-06', -7201006, 'Metcon', 'Semana 40 · Mesociclo 10 · Skills · Descarga',
    '13 min', '', 'AMRAP · Park engine · 8 min
Ritmo constante: elige la progresión que te deje seguir sin parar.
• Australian pull up: 8 reps
• Push up: 10 reps
• Sentadilla al aire: 15 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-10-06","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-09', -7001009, 'Activación', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Dislocaciones con banda: 15 reps
• Rotación torácica en cuadrupedia: 8 reps por lado
• Círculos de hombro en plancha: 8 reps por lado

Activación · Preparación específica · 8 min
• Scapular push up: 12 reps
• Pike hold contra pared: 30 s
• Hollow hold: 30 s', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-10-09","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-09', -7101009, 'Empuje vertical y handstand', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Handstand push up · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• HSPU contra pared: 5 × 3
• Handstand hold libre: 5 × 20 s

Fuerza · Empuje vertical · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• HSPU con déficit contra pared: 4 × 5
• Fondos en paralelas lastrados: 3 × 8', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 4 × 30 s
• Extensión de tríceps en anillas: 3 × 10', 'Colgado pasivo en barra 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-10-09","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-09', -7201009, 'Metcon', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    '19 min', '', 'Rounds For Time · Complex de peso corporal · 6 rondas · Cap 14 min
La ronda es un complex seguido: una dominada, dos flexiones y tres sentadillas sin parar.
• Dominada: 1 rep
• Push up: 2 reps
• Sentadilla al aire: 3 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-10-09","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-10', -7001010, 'Activación', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Colgado pasivo en barra: 30 s
• Movilidad de codo y muñeca: 45 s
• Apertura de pectoral en pared: 30 s por lado

Activación · Preparación específica · 8 min
• Scapular pull up: 10 reps
• Active hang: 30 s
• Rotación externa con banda: 12 reps por lado', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-10-10","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-10', -7101010, 'Tracción vertical y muscle-up', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Muscle-up en anillas · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Muscle-up en anillas con banda: 5 × 3
• Transición de muscle-up en anillas bajas: 5 × 3

Fuerza · Tracción vertical · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Dominada al esternón: 4 × 5
• Remo en anillas lastrado: 3 × 8', 'Fuerza · Accesorio y core · 10 min
• Curl de bíceps en anillas: 3 × 10
• Hollow hold: 4 × 30 s', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-10-10","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-10', -7201010, 'Metcon', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    '14 min', '', 'AMRAP · Descarga activa · 9 min
Ritmo suave, respirando por la nariz de principio a fin.
• Active hang: 30 s
• Push up: 8 reps
• Sentadilla al aire: 12 reps
• Dead bug lento: 10 reps por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-10-10","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-11', -7001011, 'Activación', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Movilidad de tobillo en pared: 10 reps por lado
• Movilidad de cadera en 90/90: 8 reps por lado
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Monster walk con banda: 12 pasos por lado
• Dead bug lento: 10 reps por lado
• Zancada con salto suave: 8 reps por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-10-11","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-11', -7101011, 'Piernas, salto y core', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Nordic curl completo · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Nordic curl: 5 × 3
• Pistol squat: 5 × 3

Fuerza · Piernas y core · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Shrimp squat: 4 × 5
• Puente nórdico: 3 × 8', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 4 × 30 s
• Elevación de talón a una pierna: 3 × 10', 'Sentadilla profunda sostenida 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-10-11","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-11', -7201011, 'Metcon', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    '19 min', '', 'AMRAP · I go you go · 14 min
En solitario se hace con 40 s de trabajo y 20 s de pausa por movimiento.
• Australian pull up: 40 s
• Push up: 40 s
• Sentadilla en salto: 40 s
• Hollow hold: 40 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-10-11","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-12', -7001012, 'Activación', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Apertura de pectoral en pared: 30 s por lado
• Dislocaciones con banda: 15 reps
• Puente de hombro sentado: 10 reps

Activación · Preparación específica · 8 min
• Scapular push up: 12 reps
• Plancha con toque de hombro: 10 reps por lado
• Face pull con banda: 15 reps', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-10-12","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-12', -7101012, 'Empuje horizontal y planche', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Straddle planche asistido · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Straddle planche con banda: 5 × 20 s
• Tuck planche: 5 × 20 s

Fuerza · Empuje horizontal · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Push up lastrado: 4 × 5
• Push up en anillas con rotación final: 3 × 8', 'Fuerza · Accesorio y core · 10 min
• Extensión de tríceps en anillas: 3 × 10
• Hollow hold: 4 × 30 s', 'Apertura de pectoral en pared, colgado pasivo 3 × 30 s y movilidad de muñeca. 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-10-12","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-12', -7201012, 'Metcon', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    '16 min', '', 'Ladder · Escalera de core · 5-10-15-20 · Cap 11 min
Sube el número de repeticiones en cada bloque sin perder la posición lumbar.
• Hollow rock: reps del esquema
• V-up: reps del esquema
• Plancha lateral: 15 s por lado entre bloques', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-10-12","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-13', -7001013, 'Activación', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Colgado pasivo en barra: 30 s
• Dislocaciones con banda: 15 reps
• Apertura de pectoral en pared: 30 s por lado

Activación · Preparación específica · 8 min
• Scapular pull up: 10 reps
• Remo con banda: 15 reps
• Dead bug lento: 10 reps por lado', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-10-13","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-13', -7101013, 'Tracción horizontal y front lever', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Front lever completo · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Front lever: 8 intentos
• Front lever a una pierna: 5 × 20 s

Fuerza · Tracción horizontal · 24 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Remo en anillas a una mano: 4 × 5
• Front lever row en tuck: 3 × 8', 'Fuerza · Accesorio y core · 10 min
• L-sit en paralelas: 4 × 30 s
• Curl de bíceps en anillas: 3 × 10', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-10-13","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-13', -7201013, 'Metcon', 'Semana 41 · Mesociclo 11 · Skills · Introducción',
    '21 min', '', 'Rounds For Time · Grin and bear · 5 rondas · Cap 16 min
Fragmenta las dominadas antes de llegar al fallo.
• Dominada con banda si hace falta: 5 reps
• Toes to bar o elevación de rodillas: 8 reps
• Zancada inversa: 10 reps por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-10-13","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-16', -7001016, 'Activación', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Wall slides en pared: 12 reps
• Apertura de pectoral en marco de puerta: 30 s por lado
• Puente de hombro sentado: 10 reps

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Push up plus: 10 reps
• Wall walk lento: 3 reps', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-10-16","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-16', -7101016, 'Empuje vertical y handstand', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Desplazamiento invertido · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Handstand walk: 10 intentos
• Wall handstand shoulder taps: 5 × 4

Fuerza · Empuje vertical · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Pseudo planche push up: 5 × 4
• HSPU contra pared: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Hueco y arco alternos: 4 × 10
• Fondos en banco con pies elevados: 4 × 10', 'Estiramiento de tríceps sobre la cabeza, puente de hombro sentado y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-10-16","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-16', -7201016, 'Metcon', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    '23 min', '', 'For Time · Buy in and buy out · Cap 18 min
Entras y sales con la misma tarea: administra el ritmo del bloque central.
• Buy in con carrera: 400 m o 60 mountain climber
• Australian pull up: 30 reps
• Push up: 40 reps
• Buy out con carrera: 400 m o 60 mountain climber', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-10-16","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-17', -7001017, 'Activación', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Dislocaciones con banda: 15 reps
• Cat camel: 10 reps
• Puente de hombro sentado: 10 reps

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Hollow hold: 30 s
• Arch hold: 20 s', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-10-17","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-17', -7101017, 'Tracción vertical y muscle-up', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Fuerza en el punto muerto · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Muscle-up negativo en 5 s: 5 × 4
• Dominada lastrada: 5 × 4

Fuerza · Tracción vertical · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Dominada explosiva a barra alta: 5 × 4
• Dominada lastrada: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Face pull con banda: 4 × 10
• Elevación de rodillas colgado: 4 × 10', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-10-17","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-17', -7201017, 'Metcon', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    '17 min', '', 'Unbroken · Empuje sin descanso · 12 min
Cada serie sin pausa: si rompes, subes las manos a un cajón y sigues.
• Pike push up: 4 series de 8 reps sin parar
• Fondos en paralelas: 4 series de 8 reps sin parar', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-10-17","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-18', -7001018, 'Activación', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Sentadilla profunda sostenida: 45 s
• Círculos de cadera en cuadrupedia: 8 reps por lado
• Puente de glúteo a una pierna: 10 reps por lado

Activación · Preparación específica · 8 min
• Puente de glúteo: 15 reps
• Hollow hold: 30 s
• Plancha lateral: 30 s por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-10-18","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-18', -7101018, 'Piernas, salto y core', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Potencia de salto · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Salto vertical máximo: 5 × 4
• Salto a una pierna al cajón: 5 × 4

Fuerza · Piernas y core · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Sentadilla a una pierna con salto: 5 × 4
• Nordic curl negativo: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 4 × 10
• Dead bug lento: 4 × 10', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-10-18","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-18', -7201018, 'Metcon', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    '15 min', '', 'For Time · Sprint de suelo · Cap 10 min
Es corto: entra fuerte y aguanta el ritmo hasta el final.
• Push up: 50 reps
• Hollow rock: 50 reps
• Plancha con toque de hombro: 50 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-10-18","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-19', -7001019, 'Activación', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Movilidad de muñeca en el suelo: 45 s
• Cat camel: 10 reps
• Movilidad de codo con banda: 12 reps

Activación · Preparación específica · 8 min
• Push up plus: 10 reps
• Band pull apart: 15 reps
• Dead bug lento: 10 reps por lado', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-10-19","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-19', -7101019, 'Empuje horizontal y planche', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Fuerza de planche · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pseudo planche push up con déficit: 5 × 4
• Advanced tuck planche: 5 × 25 s

Fuerza · Empuje horizontal · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Push up a una mano asistido: 5 × 4
• Pseudo planche push up: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Plancha con toque de hombro: 4 × 10
• Face pull con banda: 4 × 10', 'Rodillo en pectoral y dorsal, puente de hombro sentado y 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-10-19","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-19', -7201019, 'Metcon', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    '21 min', '', 'For Time · Test de resistencia · Cap 16 min
Anota el tiempo: este metcon se repite al final de cada fase para comparar.
• Dominada: 25 reps
• Push up: 50 reps
• Sentadilla al aire: 75 reps
• Hollow rock: 100 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-10-19","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-20', -7001020, 'Activación', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Rotación torácica tumbado: 8 reps por lado
• Movilidad de cadera en 90/90: 8 reps por lado
• Estiramiento de isquios activo: 10 reps por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Elevación de rodillas colgado: 10 reps
• Active hang: 30 s', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-10-20","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-20', -7101020, 'Tracción horizontal y front lever', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Fuerza dinámica · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Front lever pull up en tuck: 5 × 4
• Straddle front lever: 5 × 25 s

Fuerza · Tracción horizontal · 24 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Remo en anillas lastrado: 5 × 4
• Ice cream maker en tuck: 4 × 8', 'Fuerza · Accesorio y core · 10 min
• Elevación de rodillas colgado: 4 × 10
• Arch hold: 4 × 35 s', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-10-20","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-20', -7201020, 'Metcon', 'Semana 42 · Mesociclo 11 · Skills · Carga',
    '19 min', '', 'Ladder · Push ladder · 21-15-9 · Cap 14 min
Si las flexiones se rompen, sube las manos a un cajón.
• Push up: reps del esquema
• Sentadilla al aire: reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-10-20","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-23', -7001023, 'Activación', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Movilidad de muñeca en el suelo: 45 s
• Cat camel: 10 reps
• Dislocaciones con banda: 15 reps

Activación · Preparación específica · 8 min
• Face pull con banda: 15 reps
• Elevación en Y con banda: 12 reps
• Scapular push up: 12 reps', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-10-23","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-23', -7101023, 'Empuje vertical y handstand', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Handstand libre · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Handstand hold libre: 6 × 25 s
• Handstand shoulder taps libre: 6 × 4

Fuerza · Empuje vertical · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• HSPU contra pared: 6 × 3
• Fondos en anillas lastrados: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 4 × 12
• Face pull con banda: 4 × 12', 'Estira dorsales y pectoral 45 s por lado, más movilidad de muñeca en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-10-23","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-23', -7201023, 'Metcon', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    '22 min', '', 'AMRAP · Ring engine · 17 min
Las anillas mandan: mantén los codos pegados y el cuerpo en tensión.
• Remo en anillas: 10 reps
• Fondos en anillas asistidos: 8 reps
• Support hold en anillas: 20 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-10-23","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-24', -7001024, 'Activación', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Rotación torácica tumbado: 8 reps por lado
• Deslizamientos de escápula en barra: 10 reps
• Colgado pasivo en barra: 30 s

Activación · Preparación específica · 8 min
• Remo con banda: 15 reps
• Face pull con banda: 15 reps
• Scapular pull up: 10 reps', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-10-24","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-24', -7101024, 'Tracción vertical y muscle-up', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Muscle-up en barra · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Muscle-up estricto: 12 intentos
• Dominada alta al esternón: 6 × 4

Fuerza · Tracción vertical · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Dominada lastrada: 6 × 3
• Remo en anillas al esternón: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Rotación externa con banda: 4 × 12
• Arch hold: 5 × 35 s', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-10-24","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-24', -7201024, 'Metcon', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    '20 min', '', 'AMRAP · Park engine · 15 min
Ritmo constante: elige la progresión que te deje seguir sin parar.
• Australian pull up: 8 reps
• Push up: 10 reps
• Sentadilla al aire: 15 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-10-24","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-25', -7001025, 'Activación', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Cossack squat: 8 reps por lado
• Estiramiento de isquios activo: 10 reps por lado
• Movilidad de tobillo en pared: 10 reps por lado

Activación · Preparación específica · 8 min
• Elevación de talón a una pierna: 15 reps por lado
• Sentadilla isométrica en pared: 30 s
• Monster walk con banda: 12 pasos por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-10-25","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-25', -7101025, 'Piernas, salto y core', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Pistol lastrado · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pistol squat lastrado: 6 × 4
• Shrimp squat: 6 × 4

Fuerza · Piernas y core · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Pistol squat lastrado: 6 × 3
• Nordic curl: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Elevación de rodillas colgado: 4 × 12
• Copenhagen plank: 5 × 35 s', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-10-25","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-25', -7201025, 'Metcon', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    '20 min', '', 'EMOM · Front lever engine · 15 min
Elige la progresión de lever que puedas sostener 10 s limpios.
• Tuck front lever: 15 s
• Australian pull up: 10 reps
• Hollow rock: 20 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-10-25","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-26', -7001026, 'Activación', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Rotación torácica en cuadrupedia: 8 reps por lado
• Deslizamiento de escápula en plancha: 10 reps
• Apertura de pectoral en pared: 30 s por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Lean en plancha adelantada: 20 s
• Scapular push up: 12 reps', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-10-26","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-26', -7101026, 'Empuje horizontal y planche', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Advanced tuck planche · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Advanced tuck planche: 6 × 25 s
• Pseudo planche push up: 6 × 4

Fuerza · Empuje horizontal · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Pseudo planche push up: 6 × 3
• Fondos en anillas lastrados: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Rueda abdominal: 4 × 12
• Elevación en Y con banda: 4 × 12', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-10-26","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-26', -7201026, 'Metcon', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    '16 min', '', 'AMRAP · Descarga activa · 11 min
Ritmo suave, respirando por la nariz de principio a fin.
• Active hang: 30 s
• Push up: 8 reps
• Sentadilla al aire: 12 reps
• Dead bug lento: 10 reps por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-10-26","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-27', -7001027, 'Activación', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Cat camel: 10 reps
• Deslizamientos de escápula en barra: 10 reps
• Colgado pasivo en barra: 30 s

Activación · Preparación específica · 8 min
• Arch hold: 20 s
• Face pull con banda: 15 reps
• Scapular pull up: 10 reps', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-10-27","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-27', -7101027, 'Tracción horizontal y front lever', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Straddle front lever · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Straddle front lever: 6 × 25 s
• Front lever negativo en 5 s: 6 × 4

Fuerza · Tracción horizontal · 24 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Front lever row en tuck: 6 × 3
• Remo en anillas lastrado: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Toes to bar estricto: 4 × 12
• Face pull con banda: 4 × 12', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal y isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-10-27","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-27', -7201027, 'Metcon', 'Semana 43 · Mesociclo 11 · Skills · Pico',
    '14 min', '', 'Tabata · Tabata de core · 8 rondas
Alterna ejercicio en cada ronda: 20 s de trabajo y 10 s de pausa.
• Hollow hold: 20 s
• Plancha lateral alternando lado: 20 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-10-27","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-30', -7001030, 'Activación', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    '10 min', '', 'Movilidad · Empuje vertical · 10 min
• Rotación torácica en cuadrupedia: 8 reps por lado
• Círculos de hombro en plancha: 8 reps por lado
• Wall slides en pared: 12 reps
• Apertura de pectoral en marco de puerta: 30 s por lado', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-10-30","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-30', -7101030, 'Empuje vertical y handstand', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Handstand push up · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• HSPU contra pared: 3 × 3
• Handstand hold libre: 3 × 20 s

Fuerza · Empuje vertical · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• HSPU con déficit contra pared: 3 × 4
• Fondos en paralelas lastrados: 2 × 8', 'Fuerza · Accesorio y core · 10 min
• Dead bug lento: 2 × 10
• Elevación en Y con banda: 2 × 10', 'Colgado pasivo en barra 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-10-30","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-30', -7201030, 'Metcon', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    '15 min', '', 'Rounds For Time · Zancada y barra · 3 rondas · Cap 10 min
Zancadas sin apoyar la rodilla y dominadas fragmentadas desde la primera ronda.
• Zancada caminando: 20 reps
• Dominada: 6 reps
• Hollow hold: 30 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-10-30","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-31', -7001031, 'Activación', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    '10 min', '', 'Movilidad · Tracción vertical · 10 min
• Movilidad de codo y muñeca: 45 s
• Apertura de pectoral en pared: 30 s por lado
• Dislocaciones con banda: 15 reps
• Cat camel: 10 reps', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-10-31","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-31', -7101031, 'Tracción vertical y muscle-up', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Muscle-up en anillas · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Muscle-up en anillas con banda: 3 × 3
• Transición de muscle-up en anillas bajas: 3 × 3

Fuerza · Tracción vertical · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Dominada al esternón: 3 × 4
• Remo en anillas lastrado: 2 × 8', 'Fuerza · Accesorio y core · 10 min
• Remo a una mano con banda: 2 × 10
• Plancha con toque de hombro: 2 × 10', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-10-31","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-10-31', -7201031, 'Metcon', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    '13 min', '', 'Ladder · Push ladder · 21-15-9 · Cap 8 min
Si las flexiones se rompen, sube las manos a un cajón.
• Push up: reps del esquema
• Sentadilla al aire: reps del esquema', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-10-31","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-01', -7001101, 'Activación', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    '10 min', '', 'Movilidad · Piernas y core · 10 min
• Movilidad de cadera en 90/90: 8 reps por lado
• Cat camel: 10 reps
• Sentadilla profunda sostenida: 45 s
• Círculos de cadera en cuadrupedia: 8 reps por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-11-01","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-01', -7101101, 'Piernas, salto y core', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Nordic curl completo · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Nordic curl: 3 × 3
• Pistol squat: 3 × 3

Fuerza · Piernas y core · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Shrimp squat: 3 × 4
• Puente nórdico: 2 × 8', 'Fuerza · Accesorio y core · 10 min
• V-up: 2 × 10
• Puente de glúteo a una pierna: 2 × 10', 'Sentadilla profunda sostenida 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-11-01","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-01', -7201101, 'Metcon', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    '11 min', '', 'Unbroken · Bar hang challenge · 6 min
Cada bloque empieza colgado: si sueltas, descansas un minuto y sigues.
• Active hang: 5 series de 45 s
• Elevación de rodillas colgado: 5 series de 10 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-11-01","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-02', -7001102, 'Activación', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    '10 min', '', 'Movilidad · Empuje horizontal · 10 min
• Dislocaciones con banda: 15 reps
• Puente de hombro sentado: 10 reps
• Movilidad de muñeca en el suelo: 45 s
• Cat camel: 10 reps', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-11-02","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-02', -7101102, 'Empuje horizontal y planche', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Straddle planche asistido · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Straddle planche con banda: 3 × 20 s
• Tuck planche: 3 × 20 s

Fuerza · Empuje horizontal · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Push up lastrado: 3 × 4
• Push up en anillas con rotación final: 2 × 8', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 2 × 10
• Push up plus con pausa: 2 × 10', 'Apertura de pectoral en pared, colgado pasivo 3 × 30 s y movilidad de muñeca. 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-11-02","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-02', -7201102, 'Metcon', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    '15 min', '', 'Estaciones de tiempo · Estaciones de tracción · 10 min · 4 estaciones
Un minuto por estación y cuatro vueltas, cambiando sin pausa.
• Dominada: 1 min
• Australian pull up: 1 min
• Elevación de rodillas colgado: 1 min
• Active hang: 1 min', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-11-02","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-03', -7001103, 'Activación', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    '10 min', '', 'Movilidad · Tracción horizontal · 10 min
• Dislocaciones con banda: 15 reps
• Apertura de pectoral en pared: 30 s por lado
• Rotación torácica tumbado: 8 reps por lado
• Movilidad de cadera en 90/90: 8 reps por lado', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-11-03","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-03', -7101103, 'Tracción horizontal y front lever', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Front lever completo · 16 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Front lever: 5 intentos
• Front lever a una pierna: 3 × 20 s

Fuerza · Tracción horizontal · 24 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Remo en anillas a una mano: 3 × 4
• Front lever row en tuck: 2 × 8', 'Fuerza · Accesorio y core · 10 min
• Rueda abdominal: 2 × 10
• Rotación externa con banda: 2 × 10', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-11-03","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-03', -7201103, 'Metcon', 'Semana 44 · Mesociclo 11 · Skills · Descarga',
    '15 min', '', 'Estaciones de tiempo · Estaciones del parque · 10 min · 4 estaciones
Un minuto por estación y cuatro vueltas, sin descanso entre estaciones.
• Australian pull up: 1 min
• Push up: 1 min
• Sentadilla al aire: 1 min
• Plancha frontal: 1 min', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-11-03","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-06', -7001106, 'Activación', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Apertura de pectoral en marco de puerta: 30 s por lado
• Puente de hombro sentado: 10 reps
• Movilidad de muñeca en el suelo: 45 s

Activación · Preparación específica · 8 min
• Push up plus: 10 reps
• Wall walk lento: 3 reps
• Face pull con banda: 15 reps', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-11-06","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-06', -7101106, 'Empuje vertical y handstand', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Handstand walk · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Handstand walk: 6 intentos
• Handstand hold libre al máximo: 4 × 25 s

Fuerza · Empuje vertical · 22 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• HSPU estricta: 4 × 4
• Pseudo planche push up: 3 × 6', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 35 s
• Extensión de tríceps en anillas: 3 × 10', 'Estiramiento de tríceps sobre la cabeza, puente de hombro sentado y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-11-06","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-06', -7201106, 'Metcon', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    '18 min', '', 'EMOM · Muscle-up practice · 13 min
Calidad por encima de cantidad: salta el minuto si la transición se rompe.
• Transición de muscle-up asistida: 3 reps
• Dominada explosiva: 4 reps
• Fondos en paralelas: 8 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-11-06","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-07', -7001107, 'Activación', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Cat camel: 10 reps
• Puente de hombro sentado: 10 reps
• Rotación torácica tumbado: 8 reps por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Arch hold: 20 s
• Remo con banda: 15 reps', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-11-07","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-07', -7101107, 'Tracción vertical y muscle-up', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Muscle-up en anillas · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Muscle-up en anillas: 6 intentos
• Muscle-up negativo en 5 s: 4 × 3

Fuerza · Tracción vertical · 22 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Dominada al esternón lastrada: 4 × 4
• Remo en anillas al esternón: 3 × 6', 'Fuerza · Accesorio y core · 10 min
• Curl de bíceps en anillas: 3 × 10
• Hollow hold: 3 × 35 s', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-11-07","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-07', -7201107, 'Metcon', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    '12 min', '', 'Tabata · Tabata de empuje · 8 rondas
Mismo número de repeticiones en las ocho rondas: elige un ritmo sostenible.
• Push up: 20 s
• Fondos en banco: 20 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-11-07","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-08', -7001108, 'Activación', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Círculos de cadera en cuadrupedia: 8 reps por lado
• Puente de glúteo a una pierna: 10 reps por lado
• Cossack squat: 8 reps por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Plancha lateral: 30 s por lado
• Elevación de talón a una pierna: 15 reps por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-11-08","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-08', -7101108, 'Piernas, salto y core', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Fuerza a una pierna · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pistol squat lastrado: 4 × 3
• Shrimp squat lastrado: 4 × 3

Fuerza · Piernas y core · 22 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Pistol squat: 4 × 4
• Peso muerto rumano a una pierna lastrado: 3 × 6', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 35 s
• Elevación de talón a una pierna: 3 × 10', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-11-08","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-08', -7201108, 'Metcon', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    '20 min', '', 'Rounds For Time · Pike y pistol · 5 rondas · Cap 15 min
Alterna piernas en el pistol y controla la bajada del pike.
• Pike push up: 8 reps
• Pistol asistido: 5 reps por lado
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-11-08","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-09', -7001109, 'Activación', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Cat camel: 10 reps
• Movilidad de codo con banda: 12 reps
• Rotación torácica en cuadrupedia: 8 reps por lado

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Dead bug lento: 10 reps por lado
• Hollow hold: 30 s', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-11-09","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-09', -7101109, 'Empuje horizontal y planche', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Planche push up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck planche push up: 4 × 3
• Pseudo planche push up con déficit: 4 × 3

Fuerza · Empuje horizontal · 22 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Pseudo planche push up: 4 × 4
• Push up lastrado: 3 × 6', 'Fuerza · Accesorio y core · 10 min
• Extensión de tríceps en anillas: 3 × 10
• Hollow hold: 3 × 35 s', 'Rodillo en pectoral y dorsal, puente de hombro sentado y 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-11-09","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-09', -7201109, 'Metcon', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    '16 min', '', 'EMOM · Death by burpee · 11 min
Minuto 1 una repetición, minuto 2 dos, y así hasta que no llegues a tiempo.
• Burpee: 1 rep acumulativa por minuto', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-11-09","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-10', -7001110, 'Activación', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Movilidad de cadera en 90/90: 8 reps por lado
• Estiramiento de isquios activo: 10 reps por lado
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Elevación de rodillas colgado: 10 reps
• Active hang: 30 s
• Arch hold: 20 s', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-11-10","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-10', -7101110, 'Tracción horizontal y front lever', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Test de L-sit · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• L-sit al máximo: 4 × 25 s
• Front lever al máximo: 4 × 25 s

Fuerza · Tracción horizontal · 22 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Ice cream maker: 4 × 4
• Front lever row en straddle: 3 × 6', 'Fuerza · Accesorio y core · 10 min
• L-sit en paralelas: 3 × 35 s
• Curl de bíceps en anillas: 3 × 10', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-11-10","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-10', -7201110, 'Metcon', 'Semana 45 · Mesociclo 12 · Realización y test · Introducción',
    '19 min', '', 'EMOM · EMOM de empuje · 14 min
Un movimiento por minuto, rotando siempre en el mismo orden.
• Pike push up: 6 reps
• Push up: 12 reps
• Fondos en banco: 10 reps
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-11-10","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-13', -7001113, 'Activación', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Cat camel: 10 reps
• Dislocaciones con banda: 15 reps
• Rotación torácica en cuadrupedia: 8 reps por lado

Activación · Preparación específica · 8 min
• Elevación en Y con banda: 12 reps
• Scapular push up: 12 reps
• Pike hold contra pared: 30 s', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-11-13","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-13', -7101113, 'Empuje vertical y handstand', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Test de handstand · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Handstand hold libre al máximo: 4 × 30 s
• HSPU estricta: 5 × 2

Fuerza · Empuje vertical · 22 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• HSPU estricta: 5 × 3
• Fondos en anillas lastrados: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Hueco y arco alternos: 3 × 12
• Fondos en banco con pies elevados: 3 × 12', 'Estira dorsales y pectoral 45 s por lado, más movilidad de muñeca en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-11-13","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-13', -7201113, 'Metcon', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    '19 min', '', 'EMOM · Front lever engine · 14 min
Elige la progresión de lever que puedas sostener 10 s limpios.
• Tuck front lever: 15 s
• Australian pull up: 10 reps
• Hollow rock: 20 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-11-13","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-14', -7001114, 'Activación', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Deslizamientos de escápula en barra: 10 reps
• Colgado pasivo en barra: 30 s
• Movilidad de codo y muñeca: 45 s

Activación · Preparación específica · 8 min
• Face pull con banda: 15 reps
• Scapular pull up: 10 reps
• Active hang: 30 s', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-11-14","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-14', -7101114, 'Tracción vertical y muscle-up', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Test de muscle-up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Muscle-up estricto: 5 × 2
• Dominada lastrada: 5 × 2

Fuerza · Tracción vertical · 22 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Dominada lastrada al máximo: 5 × 3
• Remo en anillas lastrado: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Face pull con banda: 3 × 12
• Elevación de rodillas colgado: 3 × 12', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-11-14","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-14', -7201114, 'Metcon', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    '21 min', '', 'EMOM · EMOM de empuje · 16 min
Un movimiento por minuto, rotando siempre en el mismo orden.
• Pike push up: 6 reps
• Push up: 12 reps
• Fondos en banco: 10 reps
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-11-14","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-15', -7001115, 'Activación', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Estiramiento de isquios activo: 10 reps por lado
• Movilidad de tobillo en pared: 10 reps por lado
• Movilidad de cadera en 90/90: 8 reps por lado

Activación · Preparación específica · 8 min
• Sentadilla isométrica en pared: 30 s
• Monster walk con banda: 12 pasos por lado
• Dead bug lento: 10 reps por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-11-15","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-15', -7101115, 'Piernas, salto y core', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Test unilateral · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pistol squat al máximo: 8 intentos
• Nordic curl: 5 × 2

Fuerza · Piernas y core · 22 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Pistol squat lastrado al máximo: 5 × 3
• Nordic curl: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 3 × 12
• Dead bug lento: 3 × 12', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-11-15","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-15', -7201115, 'Metcon', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    '21 min', '', 'For Time · Test de resistencia · Cap 16 min
Anota el tiempo: este metcon se repite al final de cada fase para comparar.
• Dominada: 25 reps
• Push up: 50 reps
• Sentadilla al aire: 75 reps
• Hollow rock: 100 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-11-15","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-16', -7001116, 'Activación', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Deslizamiento de escápula en plancha: 10 reps
• Apertura de pectoral en pared: 30 s por lado
• Dislocaciones con banda: 15 reps

Activación · Preparación específica · 8 min
• Lean en plancha adelantada: 20 s
• Scapular push up: 12 reps
• Plancha con toque de hombro: 10 reps por lado', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-11-16","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-16', -7101116, 'Empuje horizontal y planche', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Test de planche · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Advanced tuck planche al máximo: 4 × 30 s
• Tuck planche: 4 × 30 s

Fuerza · Empuje horizontal · 22 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Push up lastrado al máximo: 5 × 3
• Fondos en anillas lastrados: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Plancha con toque de hombro: 3 × 12
• Face pull con banda: 3 × 12', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-11-16","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-16', -7201116, 'Metcon', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    '17 min', '', 'AMRAP · Hollow to bar · 12 min
Mantén la pelvis retrovertida en todo el trabajo de core.
• Hollow rock: 20 reps
• Australian pull up: 10 reps
• Plancha con toque de hombro: 20 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-11-16","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-17', -7001117, 'Activación', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Deslizamientos de escápula en barra: 10 reps
• Colgado pasivo en barra: 30 s
• Dislocaciones con banda: 15 reps

Activación · Preparación específica · 8 min
• Face pull con banda: 15 reps
• Scapular pull up: 10 reps
• Remo con banda: 15 reps', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-11-17","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-17', -7101117, 'Tracción horizontal y front lever', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Test de front lever · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Front lever al máximo: 4 × 30 s
• Straddle front lever: 4 × 30 s

Fuerza · Tracción horizontal · 22 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Front lever row en straddle: 5 × 3
• Remo en anillas lastrado al máximo: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Elevación de rodillas colgado: 3 × 12
• Arch hold: 4 × 40 s', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal y isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-11-17","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-17', -7201117, 'Metcon', 'Semana 46 · Mesociclo 12 · Realización y test · Carga',
    '17 min', '', 'AMRAP · Piernas al aire · 12 min
Aterriza suave en los saltos y mantén el pecho alto en las zancadas.
• Sentadilla al aire: 20 reps
• Zancada con salto: 10 reps por lado
• Salto al cajón: 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-11-17","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-20', -7001120, 'Activación', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Círculos de hombro en plancha: 8 reps por lado
• Wall slides en pared: 12 reps
• Apertura de pectoral en marco de puerta: 30 s por lado

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Band pull apart: 15 reps
• Push up plus: 10 reps', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-11-20","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-20', -7101120, 'Empuje vertical y handstand', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    '55 min', '', 'Entrenamiento de Técnica · HSPU libre · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Freestanding HSPU: 10 intentos
• Handstand hold libre: 3 × 35 s

Fuerza · Empuje vertical · 22 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• HSPU con déficit: 5 × 2
• Fondos en paralelas lastrados: 4 × 5', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 4 × 12
• Face pull con banda: 4 × 12', 'Colgado pasivo en barra 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-11-20","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-20', -7201120, 'Metcon', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    '16 min', '', 'Unbroken · Bar hang challenge · 11 min
Cada bloque empieza colgado: si sueltas, descansas un minuto y sigues.
• Active hang: 5 series de 45 s
• Elevación de rodillas colgado: 5 series de 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-11-20","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-21', -7001121, 'Activación', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Apertura de pectoral en pared: 30 s por lado
• Dislocaciones con banda: 15 reps
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Rotación externa con banda: 12 reps por lado
• Band pull apart: 15 reps
• Hollow hold: 30 s', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-11-21","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-21', -7101121, 'Tracción vertical y muscle-up', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Test de dominadas · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Dominada estricta al máximo: 10 intentos
• Muscle-up estricto: 5 × 2

Fuerza · Tracción vertical · 22 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Dominada estricta al fallo técnico: 5 × 2
• Dominada lastrada: 4 × 5', 'Fuerza · Accesorio y core · 10 min
• Rotación externa con banda: 4 × 12
• Arch hold: 4 × 45 s', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-11-21","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-21', -7201121, 'Metcon', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    '18 min', '', 'AMRAP · Piernas al aire · 13 min
Aterriza suave en los saltos y mantén el pecho alto en las zancadas.
• Sentadilla al aire: 20 reps
• Zancada con salto: 10 reps por lado
• Salto al cajón: 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-11-21","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-22', -7001122, 'Activación', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Cat camel: 10 reps
• Sentadilla profunda sostenida: 45 s
• Círculos de cadera en cuadrupedia: 8 reps por lado

Activación · Preparación específica · 8 min
• Zancada con salto suave: 8 reps por lado
• Puente de glúteo: 15 reps
• Hollow hold: 30 s', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-11-22","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-22', -7101122, 'Piernas, salto y core', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Test de salto · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Salto vertical máximo: 5 × 2
• Salto horizontal máximo: 5 × 2

Fuerza · Piernas y core · 22 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Shrimp squat lastrado: 5 × 2
• Salto a una pierna al cajón: 4 × 5', 'Fuerza · Accesorio y core · 10 min
• Elevación de rodillas colgado: 4 × 12
• Copenhagen plank: 4 × 45 s', 'Sentadilla profunda sostenida 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-11-22","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-22', -7201122, 'Metcon', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    '16 min', '', 'AMRAP · Descarga activa · 11 min
Ritmo suave, respirando por la nariz de principio a fin.
• Active hang: 30 s
• Push up: 8 reps
• Sentadilla al aire: 12 reps
• Dead bug lento: 10 reps por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-11-22","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-23', -7001123, 'Activación', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Puente de hombro sentado: 10 reps
• Movilidad de muñeca en el suelo: 45 s
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Face pull con banda: 15 reps
• Push up plus: 10 reps
• Band pull apart: 15 reps', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-11-23","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-23', -7101123, 'Empuje horizontal y planche', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Straddle planche · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Straddle planche: 10 intentos
• Advanced tuck planche: 3 × 35 s

Fuerza · Empuje horizontal · 22 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Push up a una mano: 5 × 2
• Pseudo planche push up con déficit: 4 × 5', 'Fuerza · Accesorio y core · 10 min
• Rueda abdominal: 4 × 12
• Elevación en Y con banda: 4 × 12', 'Apertura de pectoral en pared, colgado pasivo 3 × 30 s y movilidad de muñeca. 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-11-23","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-23', -7201123, 'Metcon', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    '22 min', '', 'Ladder · Pull ladder · 15-12-9-6-3 · Cap 17 min
Baja de progresión antes que romper la técnica.
• Australian pull up: reps del esquema
• Hollow rock: reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-11-23","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-24', -7001124, 'Activación', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Apertura de pectoral en pared: 30 s por lado
• Rotación torácica tumbado: 8 reps por lado
• Movilidad de cadera en 90/90: 8 reps por lado

Activación · Preparación específica · 8 min
• Dead bug lento: 10 reps por lado
• Hollow hold: 30 s
• Elevación de rodillas colgado: 10 reps', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-11-24","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-24', -7101124, 'Tracción horizontal y front lever', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Front lever pull up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Front lever pull up en straddle: 5 × 2
• Front lever: 10 intentos

Fuerza · Tracción horizontal · 22 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Remo en anillas a una mano: 5 × 2
• Front lever row en tuck: 4 × 5', 'Fuerza · Accesorio y core · 10 min
• Toes to bar estricto: 4 × 12
• Face pull con banda: 4 × 12', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-11-24","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-24', -7201124, 'Metcon', 'Semana 47 · Mesociclo 12 · Realización y test · Pico',
    '16 min', '', 'AMRAP · Burpee pull up · 11 min
Si no llegas a la barra, haz burpee y salto vertical con los brazos arriba.
• Burpee pull up: 5 reps
• Sentadilla al aire: 10 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-11-24","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-27', -7001127, 'Activación', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    '10 min', '', 'Movilidad · Empuje vertical · 10 min
• Puente de hombro sentado: 10 reps
• Movilidad de muñeca en el suelo: 45 s
• Cat camel: 10 reps
• Dislocaciones con banda: 15 reps', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-11-27","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-27', -7101127, 'Empuje vertical y handstand', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Handstand walk · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Handstand walk: 4 intentos
• Handstand hold libre al máximo: 3 × 20 s

Fuerza · Empuje vertical · 22 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• HSPU estricta: 3 × 3
• Pseudo planche push up: 2 × 6', 'Fuerza · Accesorio y core · 10 min
• Dead bug lento: 2 × 10
• Elevación en Y con banda: 2 × 10', 'Estiramiento de tríceps sobre la cabeza, puente de hombro sentado y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-11-27","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-27', -7201127, 'Metcon', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    '15 min', '', 'Rounds For Time · Pike y pistol · 3 rondas · Cap 10 min
Alterna piernas en el pistol y controla la bajada del pike.
• Pike push up: 8 reps
• Pistol asistido: 5 reps por lado
• Hollow hold: 30 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-11-27","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-28', -7001128, 'Activación', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    '10 min', '', 'Movilidad · Tracción vertical · 10 min
• Puente de hombro sentado: 10 reps
• Rotación torácica tumbado: 8 reps por lado
• Deslizamientos de escápula en barra: 10 reps
• Colgado pasivo en barra: 30 s', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-11-28","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-28', -7101128, 'Tracción vertical y muscle-up', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Muscle-up en anillas · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Muscle-up en anillas: 4 intentos
• Muscle-up negativo en 5 s: 3 × 2

Fuerza · Tracción vertical · 22 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Dominada al esternón lastrada: 3 × 3
• Remo en anillas al esternón: 2 × 6', 'Fuerza · Accesorio y core · 10 min
• Remo a una mano con banda: 2 × 10
• Plancha con toque de hombro: 2 × 10', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-11-28","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-28', -7201128, 'Metcon', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    '15 min', '', 'Rounds For Time · Complex de peso corporal · 4 rondas · Cap 10 min
La ronda es un complex seguido: una dominada, dos flexiones y tres sentadillas sin parar.
• Dominada: 1 rep
• Push up: 2 reps
• Sentadilla al aire: 3 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-11-28","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-29', -7001129, 'Activación', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    '10 min', '', 'Movilidad · Piernas y core · 10 min
• Puente de glúteo a una pierna: 10 reps por lado
• Cossack squat: 8 reps por lado
• Estiramiento de isquios activo: 10 reps por lado
• Movilidad de tobillo en pared: 10 reps por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-11-29","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-29', -7101129, 'Piernas, salto y core', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Fuerza a una pierna · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pistol squat lastrado: 3 × 2
• Shrimp squat lastrado: 3 × 2

Fuerza · Piernas y core · 22 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Pistol squat: 3 × 3
• Peso muerto rumano a una pierna lastrado: 2 × 6', 'Fuerza · Accesorio y core · 10 min
• V-up: 2 × 10
• Puente de glúteo a una pierna: 2 × 10', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-11-29","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-29', -7201129, 'Metcon', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    '12 min', '', 'Unbroken · Empuje sin descanso · 7 min
Cada serie sin pausa: si rompes, subes las manos a un cajón y sigues.
• Pike push up: 4 series de 8 reps sin parar
• Fondos en paralelas: 4 series de 8 reps sin parar', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-11-29","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-30', -7001130, 'Activación', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    '10 min', '', 'Movilidad · Empuje horizontal · 10 min
• Movilidad de codo con banda: 12 reps
• Rotación torácica en cuadrupedia: 8 reps por lado
• Deslizamiento de escápula en plancha: 10 reps
• Apertura de pectoral en pared: 30 s por lado', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-11-30","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-30', -7101130, 'Empuje horizontal y planche', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Planche push up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck planche push up: 3 × 2
• Pseudo planche push up con déficit: 3 × 2

Fuerza · Empuje horizontal · 22 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Pseudo planche push up: 3 × 3
• Push up lastrado: 2 × 6', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 2 × 10
• Push up plus con pausa: 2 × 10', 'Rodillo en pectoral y dorsal, puente de hombro sentado y 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-11-30","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-11-30', -7201130, 'Metcon', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    '15 min', '', 'Estaciones de tiempo · Estaciones del parque · 10 min · 4 estaciones
Un minuto por estación y cuatro vueltas, sin descanso entre estaciones.
• Australian pull up: 1 min
• Push up: 1 min
• Sentadilla al aire: 1 min
• Plancha frontal: 1 min', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-11-30","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-01', -7001201, 'Activación', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    '10 min', '', 'Movilidad · Tracción horizontal · 10 min
• Estiramiento de isquios activo: 10 reps por lado
• Cat camel: 10 reps
• Deslizamientos de escápula en barra: 10 reps
• Colgado pasivo en barra: 30 s', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-12-01","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-01', -7101201, 'Tracción horizontal y front lever', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Test de L-sit · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• L-sit al máximo: 3 × 20 s
• Front lever al máximo: 3 × 20 s

Fuerza · Tracción horizontal · 22 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Ice cream maker: 3 × 3
• Front lever row en straddle: 2 × 6', 'Fuerza · Accesorio y core · 10 min
• Rueda abdominal: 2 × 10
• Rotación externa con banda: 2 × 10', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-12-01","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-01', -7201201, 'Metcon', 'Semana 48 · Mesociclo 12 · Realización y test · Descarga',
    '16 min', '', 'For Time · Buy in and buy out · Cap 11 min
Entras y sales con la misma tarea: administra el ritmo del bloque central.
• Buy in con carrera: 400 m o 60 mountain climber
• Australian pull up: 30 reps
• Push up: 40 reps
• Buy out con carrera: 400 m o 60 mountain climber', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-12-01","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-04', -7001204, 'Activación', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Dislocaciones con banda: 15 reps
• Cat camel: 10 reps
• Movilidad de muñeca en el suelo: 45 s

Activación · Preparación específica · 8 min
• Scapular push up: 12 reps
• Elevación en Y con banda: 12 reps
• Face pull con banda: 15 reps', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-12-04","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-04', -7101204, 'Empuje vertical y handstand', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Test de handstand · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Handstand hold libre al máximo: 4 × 25 s
• HSPU estricta: 4 × 3

Fuerza · Empuje vertical · 22 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• HSPU estricta: 4 × 4
• Fondos en anillas lastrados: 3 × 6', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 35 s
• Extensión de tríceps en anillas: 3 × 10', 'Estira dorsales y pectoral 45 s por lado, más movilidad de muñeca en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-12-04","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-04', -7201204, 'Metcon', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    '19 min', '', 'For Time · Test de resistencia · Cap 14 min
Anota el tiempo: este metcon se repite al final de cada fase para comparar.
• Dominada: 25 reps
• Push up: 50 reps
• Sentadilla al aire: 75 reps
• Hollow rock: 100 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-12-04","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-05', -7001205, 'Activación', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Colgado pasivo en barra: 30 s
• Deslizamientos de escápula en barra: 10 reps
• Rotación torácica tumbado: 8 reps por lado

Activación · Preparación específica · 8 min
• Scapular pull up: 10 reps
• Face pull con banda: 15 reps
• Remo con banda: 15 reps', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-12-05","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-05', -7101205, 'Tracción vertical y muscle-up', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Test de muscle-up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Muscle-up estricto: 4 × 3
• Dominada lastrada: 4 × 3

Fuerza · Tracción vertical · 22 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Dominada lastrada al máximo: 4 × 4
• Remo en anillas lastrado: 3 × 6', 'Fuerza · Accesorio y core · 10 min
• Curl de bíceps en anillas: 3 × 10
• Hollow hold: 3 × 35 s', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-12-05","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-05', -7201205, 'Metcon', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    '16 min', '', 'EMOM · Handstand engine · 11 min
Sube al invertido con control; si no llegas, sostén pike contra la pared.
• Handstand hold contra pared: 30 s
• Push up: 12 reps
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-12-05","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-06', -7001206, 'Activación', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Movilidad de tobillo en pared: 10 reps por lado
• Estiramiento de isquios activo: 10 reps por lado
• Cossack squat: 8 reps por lado

Activación · Preparación específica · 8 min
• Monster walk con banda: 12 pasos por lado
• Sentadilla isométrica en pared: 30 s
• Elevación de talón a una pierna: 15 reps por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-12-06","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-06', -7101206, 'Piernas, salto y core', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Test unilateral · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pistol squat al máximo: 6 intentos
• Nordic curl: 4 × 3

Fuerza · Piernas y core · 22 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Pistol squat lastrado al máximo: 4 × 4
• Nordic curl: 3 × 6', 'Fuerza · Accesorio y core · 10 min
• Hollow hold: 3 × 35 s
• Elevación de talón a una pierna: 3 × 10', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-12-06","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-06', -7201206, 'Metcon', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    '18 min', '', 'AMRAP · Park engine · 13 min
Ritmo constante: elige la progresión que te deje seguir sin parar.
• Australian pull up: 8 reps
• Push up: 10 reps
• Sentadilla al aire: 15 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-12-06","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-07', -7001207, 'Activación', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Apertura de pectoral en pared: 30 s por lado
• Deslizamiento de escápula en plancha: 10 reps
• Rotación torácica en cuadrupedia: 8 reps por lado

Activación · Preparación específica · 8 min
• Scapular push up: 12 reps
• Lean en plancha adelantada: 20 s
• Hollow hold: 30 s', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-12-07","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-07', -7101207, 'Empuje horizontal y planche', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Test de planche · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Advanced tuck planche al máximo: 4 × 25 s
• Tuck planche: 4 × 25 s

Fuerza · Empuje horizontal · 22 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Push up lastrado al máximo: 4 × 4
• Fondos en anillas lastrados: 3 × 6', 'Fuerza · Accesorio y core · 10 min
• Extensión de tríceps en anillas: 3 × 10
• Hollow hold: 3 × 35 s', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-12-07","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-07', -7201207, 'Metcon', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    '19 min', '', 'EMOM · EMOM de empuje · 14 min
Un movimiento por minuto, rotando siempre en el mismo orden.
• Pike push up: 6 reps
• Push up: 12 reps
• Fondos en banco: 10 reps
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-12-07","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-08', -7001208, 'Activación', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Colgado pasivo en barra: 30 s
• Deslizamientos de escápula en barra: 10 reps
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Scapular pull up: 10 reps
• Face pull con banda: 15 reps
• Arch hold: 20 s', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-12-08","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-08', -7101208, 'Tracción horizontal y front lever', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    '55 min', '', 'Entrenamiento de Técnica · Test de front lever · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Front lever al máximo: 4 × 25 s
• Straddle front lever: 4 × 25 s

Fuerza · Tracción horizontal · 22 min
Semana de introducción: prioriza la técnica y deja 3 repeticiones en reserva.
• Front lever row en straddle: 4 × 4
• Remo en anillas lastrado al máximo: 3 × 6', 'Fuerza · Accesorio y core · 10 min
• L-sit en paralelas: 3 × 35 s
• Curl de bíceps en anillas: 3 × 10', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal y isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-12-08","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-08', -7201208, 'Metcon', 'Semana 49 · Mesociclo 13 · Realización y test · Introducción',
    '19 min', '', 'AMRAP · Ring engine · 14 min
Las anillas mandan: mantén los codos pegados y el cuerpo en tensión.
• Remo en anillas: 10 reps
• Fondos en anillas asistidos: 8 reps
• Support hold en anillas: 20 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-12-08","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-11', -7001211, 'Activación', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Wall slides en pared: 12 reps
• Círculos de hombro en plancha: 8 reps por lado
• Rotación torácica en cuadrupedia: 8 reps por lado

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Hollow hold: 30 s
• Pike hold contra pared: 30 s', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-12-11","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-11', -7101211, 'Empuje vertical y handstand', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    '55 min', '', 'Entrenamiento de Técnica · HSPU libre · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Freestanding HSPU: 8 intentos
• Handstand hold libre: 4 × 30 s

Fuerza · Empuje vertical · 22 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• HSPU con déficit: 5 × 3
• Fondos en paralelas lastrados: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Hueco y arco alternos: 3 × 12
• Fondos en banco con pies elevados: 3 × 12', 'Colgado pasivo en barra 3 × 30 s, apertura de pectoral en pared y descarga de muñecas. 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-12-11","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-11', -7201211, 'Metcon', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    '15 min', '', 'AMRAP · Descarga activa · 10 min
Ritmo suave, respirando por la nariz de principio a fin.
• Active hang: 30 s
• Push up: 8 reps
• Sentadilla al aire: 12 reps
• Dead bug lento: 10 reps por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-12-11","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-12', -7001212, 'Activación', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Dislocaciones con banda: 15 reps
• Apertura de pectoral en pared: 30 s por lado
• Movilidad de codo y muñeca: 45 s

Activación · Preparación específica · 8 min
• Band pull apart: 15 reps
• Rotación externa con banda: 12 reps por lado
• Active hang: 30 s', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-12-12","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-12', -7101212, 'Tracción vertical y muscle-up', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Test de dominadas · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Dominada estricta al máximo: 8 intentos
• Muscle-up estricto: 5 × 2

Fuerza · Tracción vertical · 22 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Dominada estricta al fallo técnico: 5 × 3
• Dominada lastrada: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Face pull con banda: 3 × 12
• Elevación de rodillas colgado: 3 × 12', 'Estira dorsales, antebrazos y pectoral 45 s por lado. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-12-12","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-12', -7201212, 'Metcon', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    '20 min', '', 'AMRAP · Ring engine · 15 min
Las anillas mandan: mantén los codos pegados y el cuerpo en tensión.
• Remo en anillas: 10 reps
• Fondos en anillas asistidos: 8 reps
• Support hold en anillas: 20 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-12-12","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-13', -7001213, 'Activación', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Sentadilla profunda sostenida: 45 s
• Cat camel: 10 reps
• Movilidad de cadera en 90/90: 8 reps por lado

Activación · Preparación específica · 8 min
• Puente de glúteo: 15 reps
• Zancada con salto suave: 8 reps por lado
• Dead bug lento: 10 reps por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-12-13","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-13', -7101213, 'Piernas, salto y core', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Test de salto · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Salto vertical máximo: 5 × 2
• Salto horizontal máximo: 5 × 2

Fuerza · Piernas y core · 22 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Shrimp squat lastrado: 5 × 3
• Salto a una pierna al cajón: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 3 × 12
• Dead bug lento: 3 × 12', 'Sentadilla profunda sostenida 2 × 45 s, estiramiento de psoas y rodillo en cuádriceps. 2 min de respiración nasal.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-12-13","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-13', -7201213, 'Metcon', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    '23 min', '', 'Rounds For Time · Grin and bear · 5 rondas · Cap 18 min
Fragmenta las dominadas antes de llegar al fallo.
• Dominada con banda si hace falta: 5 reps
• Toes to bar o elevación de rodillas: 8 reps
• Zancada inversa: 10 reps por lado', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-12-13","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-14', -7001214, 'Activación', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Movilidad de muñeca en el suelo: 45 s
• Puente de hombro sentado: 10 reps
• Dislocaciones con banda: 15 reps

Activación · Preparación específica · 8 min
• Push up plus: 10 reps
• Face pull con banda: 15 reps
• Plancha con toque de hombro: 10 reps por lado', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-12-14","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-14', -7101214, 'Empuje horizontal y planche', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Straddle planche · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Straddle planche: 8 intentos
• Advanced tuck planche: 4 × 30 s

Fuerza · Empuje horizontal · 22 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Push up a una mano: 5 × 3
• Pseudo planche push up con déficit: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Plancha con toque de hombro: 3 × 12
• Face pull con banda: 3 × 12', 'Apertura de pectoral en pared, colgado pasivo 3 × 30 s y movilidad de muñeca. 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-12-14","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-14', -7201214, 'Metcon', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    '15 min', '', 'Unbroken · Unbroken de suelo · 10 min
Series sin pausa: para en cuanto pierdas la línea del cuerpo.
• Push up: 5 series de 12 reps sin parar
• Hollow hold: 5 series de 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-12-14","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-15', -7001215, 'Activación', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Rotación torácica tumbado: 8 reps por lado
• Apertura de pectoral en pared: 30 s por lado
• Dislocaciones con banda: 15 reps

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Dead bug lento: 10 reps por lado
• Remo con banda: 15 reps', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-12-15","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-15', -7101215, 'Tracción horizontal y front lever', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    '55 min', '', 'Entrenamiento de Técnica · Front lever pull up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Front lever pull up en straddle: 5 × 2
• Front lever: 8 intentos

Fuerza · Tracción horizontal · 22 min
Semana de carga: suma una repetición o mejora el tempo respecto a la semana anterior.
• Remo en anillas a una mano: 5 × 3
• Front lever row en tuck: 4 × 6', 'Fuerza · Accesorio y core · 10 min
• Elevación de rodillas colgado: 3 × 12
• Arch hold: 4 × 40 s', 'Estira antebrazo, dorsal y cadena posterior. Termina en 90/90 de cadera con respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-12-15","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-15', -7201215, 'Metcon', 'Semana 50 · Mesociclo 13 · Realización y test · Carga',
    '17 min', '', 'Estaciones de tiempo · Estaciones de core · 12 min · 3 estaciones
Un minuto por estación y cuatro vueltas, cambiando sin pausa.
• Hollow hold: 1 min
• Plancha con toque de hombro: 1 min
• Elevación de rodillas colgado: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-12-15","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-18', -7001218, 'Activación', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    '14 min', '', 'Movilidad · Empuje vertical · 6 min
• Movilidad de muñeca en el suelo: 45 s
• Puente de hombro sentado: 10 reps
• Apertura de pectoral en marco de puerta: 30 s por lado

Activación · Preparación específica · 8 min
• Face pull con banda: 15 reps
• Wall walk lento: 3 reps
• Push up plus: 10 reps', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-12-18","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-18', -7101218, 'Empuje vertical y handstand', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Handstand walk · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Handstand walk: 10 intentos
• Handstand hold libre al máximo: 3 × 35 s

Fuerza · Empuje vertical · 22 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• HSPU estricta: 5 × 2
• Pseudo planche push up: 4 × 5', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 4 × 12
• Face pull con banda: 4 × 12', 'Estiramiento de tríceps sobre la cabeza, puente de hombro sentado y 90/90 de cadera. 2 min de respiración diafragmática.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-12-18","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-18', -7201218, 'Metcon', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    '23 min', '', 'Estaciones de tiempo · Estaciones de tracción · 18 min · 4 estaciones
Un minuto por estación y cuatro vueltas, cambiando sin pausa.
• Dominada: 1 min
• Australian pull up: 1 min
• Elevación de rodillas colgado: 1 min
• Active hang: 1 min', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-12-18","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-19', -7001219, 'Activación', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    '14 min', '', 'Movilidad · Tracción vertical · 6 min
• Rotación torácica tumbado: 8 reps por lado
• Puente de hombro sentado: 10 reps
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Remo con banda: 15 reps
• Arch hold: 20 s
• Hollow hold: 30 s', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-12-19","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-19', -7101219, 'Tracción vertical y muscle-up', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Muscle-up en anillas · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Muscle-up en anillas: 10 intentos
• Muscle-up negativo en 5 s: 5 × 2

Fuerza · Tracción vertical · 22 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Dominada al esternón lastrada: 5 × 2
• Remo en anillas al esternón: 4 × 5', 'Fuerza · Accesorio y core · 10 min
• Rotación externa con banda: 4 × 12
• Arch hold: 4 × 45 s', 'Descarga de antebrazo y codo, apertura torácica sobre rodillo y 2 min de respiración diafragmática.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-12-19","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-19', -7201219, 'Metcon', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    '23 min', '', 'Rounds For Time · Zancada y barra · 4 rondas · Cap 18 min
Zancadas sin apoyar la rodilla y dominadas fragmentadas desde la primera ronda.
• Zancada caminando: 20 reps
• Dominada: 6 reps
• Hollow hold: 30 s', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-12-19","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-20', -7001220, 'Activación', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    '14 min', '', 'Movilidad · Piernas y core · 6 min
• Cossack squat: 8 reps por lado
• Puente de glúteo a una pierna: 10 reps por lado
• Círculos de cadera en cuadrupedia: 8 reps por lado

Activación · Preparación específica · 8 min
• Elevación de talón a una pierna: 15 reps por lado
• Plancha lateral: 30 s por lado
• Hollow hold: 30 s', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-12-20","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-20', -7101220, 'Piernas, salto y core', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Fuerza a una pierna · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pistol squat lastrado: 5 × 2
• Shrimp squat lastrado: 5 × 2

Fuerza · Piernas y core · 22 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Pistol squat: 5 × 2
• Peso muerto rumano a una pierna lastrado: 4 × 5', 'Fuerza · Accesorio y core · 10 min
• Elevación de rodillas colgado: 4 × 12
• Copenhagen plank: 4 × 45 s', 'Estiramiento de aductor en rana, isquios en el suelo y descarga de gemelo. 2 min de respiración diafragmática.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-12-20","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-20', -7201220, 'Metcon', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    '20 min', '', 'Ladder · Push ladder · 21-15-9 · Cap 15 min
Si las flexiones se rompen, sube las manos a un cajón.
• Push up: reps del esquema
• Sentadilla al aire: reps del esquema', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-12-20","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-21', -7001221, 'Activación', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    '14 min', '', 'Movilidad · Empuje horizontal · 6 min
• Rotación torácica en cuadrupedia: 8 reps por lado
• Movilidad de codo con banda: 12 reps
• Cat camel: 10 reps

Activación · Preparación específica · 8 min
• Hollow hold: 30 s
• Dead bug lento: 10 reps por lado
• Band pull apart: 15 reps', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-12-21","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-21', -7101221, 'Empuje horizontal y planche', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Planche push up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Tuck planche push up: 5 × 2
• Pseudo planche push up con déficit: 5 × 2

Fuerza · Empuje horizontal · 22 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Pseudo planche push up: 5 × 2
• Push up lastrado: 4 × 5', 'Fuerza · Accesorio y core · 10 min
• Rueda abdominal: 4 × 12
• Elevación en Y con banda: 4 × 12', 'Rodillo en pectoral y dorsal, puente de hombro sentado y 2 min de respiración diafragmática.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-12-21","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-21', -7201221, 'Metcon', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    '23 min', '', 'Rounds For Time · Pistol partner · 4 rondas · Cap 18 min
Alterna piernas en cada repetición y usa anillas si necesitas asistencia.
• Pistol asistido: 6 reps por lado
• Hollow rock: 20 reps
• Sentadilla en salto: 15 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-12-21","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-22', -7001222, 'Activación', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    '14 min', '', 'Movilidad · Tracción horizontal · 6 min
• Cat camel: 10 reps
• Estiramiento de isquios activo: 10 reps por lado
• Movilidad de cadera en 90/90: 8 reps por lado

Activación · Preparación específica · 8 min
• Arch hold: 20 s
• Active hang: 30 s
• Elevación de rodillas colgado: 10 reps', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-12-22","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-22', -7101222, 'Tracción horizontal y front lever', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    '55 min', '', 'Entrenamiento de Técnica · Test de L-sit · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• L-sit al máximo: 3 × 35 s
• Front lever al máximo: 3 × 35 s

Fuerza · Tracción horizontal · 22 min
Semana pico: máximo esfuerzo controlado, deja 1 repetición en reserva.
• Ice cream maker: 5 × 2
• Front lever row en straddle: 4 × 5', 'Fuerza · Accesorio y core · 10 min
• Toes to bar estricto: 4 × 12
• Face pull con banda: 4 × 12', 'Rodillo en dorsal, apertura torácica y 2 min de respiración diafragmática tumbado.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-12-22","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-22', -7201222, 'Metcon', 'Semana 51 · Mesociclo 13 · Realización y test · Pico',
    '20 min', '', 'EMOM · Muscle-up practice · 15 min
Calidad por encima de cantidad: salta el minuto si la transición se rompe.
• Transición de muscle-up asistida: 3 reps
• Dominada explosiva: 4 reps
• Fondos en paralelas: 8 reps', '', 'Camina 3 min, estira lo que más haya trabajado 45 s por lado y 2 min de respiración 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-12-22","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-25', -7001225, 'Activación', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    '10 min', '', 'Movilidad · Empuje vertical · 10 min
• Rotación torácica en cuadrupedia: 8 reps por lado
• Dislocaciones con banda: 15 reps
• Cat camel: 10 reps
• Movilidad de muñeca en el suelo: 45 s', '', '', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-12-25","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-25', -7101225, 'Empuje vertical y handstand', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Test de handstand · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Handstand hold libre al máximo: 3 × 20 s
• HSPU estricta: 3 × 2

Fuerza · Empuje vertical · 22 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• HSPU estricta: 3 × 3
• Fondos en anillas lastrados: 2 × 6', 'Fuerza · Accesorio y core · 10 min
• Dead bug lento: 2 × 10
• Elevación en Y con banda: 2 × 10', 'Estira dorsales y pectoral 45 s por lado, más movilidad de muñeca en el suelo. Termina con 2 min de respiración nasal tumbado.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-12-25","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-25', -7201225, 'Metcon', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    '13 min', '', 'AMRAP · Park engine · 8 min
Ritmo constante: elige la progresión que te deje seguir sin parar.
• Australian pull up: 8 reps
• Push up: 10 reps
• Sentadilla al aire: 15 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[0],"recurrence":"yearly","startDate":"2000-12-25","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-26', -7001226, 'Activación', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    '10 min', '', 'Movilidad · Tracción vertical · 10 min
• Movilidad de codo y muñeca: 45 s
• Colgado pasivo en barra: 30 s
• Deslizamientos de escápula en barra: 10 reps
• Rotación torácica tumbado: 8 reps por lado', '', '', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-12-26","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-26', -7101226, 'Tracción vertical y muscle-up', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Test de muscle-up · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Muscle-up estricto: 3 × 2
• Dominada lastrada: 3 × 2

Fuerza · Tracción vertical · 22 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Dominada lastrada al máximo: 3 × 3
• Remo en anillas lastrado: 2 × 6', 'Fuerza · Accesorio y core · 10 min
• Remo a una mano con banda: 2 × 10
• Plancha con toque de hombro: 2 × 10', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal en pared y bíceps 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-12-26","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-26', -7201226, 'Metcon', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    '13 min', '', 'EMOM · Muscle-up practice · 8 min
Calidad por encima de cantidad: salta el minuto si la transición se rompe.
• Transición de muscle-up asistida: 3 reps
• Dominada explosiva: 4 reps
• Fondos en paralelas: 8 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[1],"recurrence":"yearly","startDate":"2000-12-26","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-27', -7001227, 'Activación', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    '10 min', '', 'Movilidad · Piernas y core · 10 min
• Movilidad de cadera en 90/90: 8 reps por lado
• Movilidad de tobillo en pared: 10 reps por lado
• Estiramiento de isquios activo: 10 reps por lado
• Cossack squat: 8 reps por lado', '', '', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-12-27","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-27', -7101227, 'Piernas, salto y core', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Test unilateral · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Pistol squat al máximo: 4 intentos
• Nordic curl: 3 × 2

Fuerza · Piernas y core · 22 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Pistol squat lastrado al máximo: 3 × 3
• Nordic curl: 2 × 6', 'Fuerza · Accesorio y core · 10 min
• V-up: 2 × 10
• Puente de glúteo a una pierna: 2 × 10', 'Estira cuádriceps, isquios y gemelo 45 s por lado. Termina en 90/90 de cadera y 2 min de respiración 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-12-27","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-27', -7201227, 'Metcon', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    '17 min', '', 'For Time · Chipper de parque · Cap 12 min
Trabajo continuo de arriba abajo, sin repetir estación.
• Australian pull up: 40 reps
• Push up: 60 reps
• Sentadilla al aire: 80 reps
• Hollow rock: 40 reps', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[2],"recurrence":"yearly","startDate":"2000-12-27","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-28', -7001228, 'Activación', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    '10 min', '', 'Movilidad · Empuje horizontal · 10 min
• Dislocaciones con banda: 15 reps
• Apertura de pectoral en pared: 30 s por lado
• Deslizamiento de escápula en plancha: 10 reps
• Rotación torácica en cuadrupedia: 8 reps por lado', '', '', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-12-28","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-28', -7101228, 'Empuje horizontal y planche', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Test de planche · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Advanced tuck planche al máximo: 3 × 20 s
• Tuck planche: 3 × 20 s

Fuerza · Empuje horizontal · 22 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Push up lastrado al máximo: 3 × 3
• Fondos en anillas lastrados: 2 × 6', 'Fuerza · Accesorio y core · 10 min
• Plancha lateral con elevación de cadera: 2 × 10
• Push up plus con pausa: 2 × 10', 'Estira pectoral y tríceps 45 s por lado, descarga de muñecas en el suelo. 2 min de respiración nasal.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-12-28","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-28', -7201228, 'Metcon', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    '12 min', '', 'EMOM · Handstand engine · 7 min
Sube al invertido con control; si no llegas, sostén pike contra la pared.
• Handstand hold contra pared: 30 s
• Push up: 12 reps
• Hollow hold: 30 s', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[3],"recurrence":"yearly","startDate":"2000-12-28","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-29', -7001229, 'Activación', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    '10 min', '', 'Movilidad · Tracción horizontal · 10 min
• Dislocaciones con banda: 15 reps
• Colgado pasivo en barra: 30 s
• Deslizamientos de escápula en barra: 10 reps
• Cat camel: 10 reps', '', '', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-12-29","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-29', -7101229, 'Tracción horizontal y front lever', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    '40 min', '', 'Entrenamiento de Técnica · Test de front lever · 14 min
Trabaja en fresco y corta la serie en cuanto pierdas la posición.
• Front lever al máximo: 3 × 20 s
• Straddle front lever: 3 × 20 s

Fuerza · Tracción horizontal · 22 min
Semana de descarga: la mitad del volumen y sin acercarte al fallo.
• Front lever row en straddle: 3 × 3
• Remo en anillas lastrado al máximo: 2 × 6', 'Fuerza · Accesorio y core · 10 min
• Rueda abdominal: 2 × 10
• Rotación externa con banda: 2 × 10', 'Colgado pasivo 3 × 30 s, estiramiento de dorsal y isquios 45 s por lado. 2 min de respiración nasal.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-12-29","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2000-12-29', -7201229, 'Metcon', 'Semana 52 · Mesociclo 13 · Realización y test · Descarga',
    '14 min', '', 'Estaciones de tiempo · Motor de piernas · 9 min · 3 estaciones
Un minuto por estación y cinco vueltas, sin descanso entre estaciones.
• Sentadilla al aire: 1 min
• Step up al cajón: 1 min
• Puente de glúteo a una pierna: 1 min', '', 'Camina 5 min y termina con 2 min de respiración nasal 4-6.', '{"weekdays":[4],"recurrence":"yearly","startDate":"2000-12-29","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
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
