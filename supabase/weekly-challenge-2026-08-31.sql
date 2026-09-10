-- Desafío de la semana generado por scripts/generate-weekly-challenge.mjs
-- Semana del 2026-08-31 (3 heroes).
do $$
declare
  target_program uuid;
begin
  select id into target_program from public.programas where lower(trim(name)) = lower(trim('Desafío de la semana')) limit 1;
  if target_program is null then
    raise exception 'No existe el programa %', 'Desafío de la semana';
  end if;

  delete from public.entrenos_diarios
  where program_id = target_program
    and schedule_config->>'startDate' = '2026-08-31';

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-31', -9000831, 'Activación', 'ATHX · Activación · Desafío semanal',
    '12 min', '', 'Activación · Hybrid - Turf y movilidad · 12 min
2 rondas fluidas. Mezcla agilidad, potencia y técnica antes del bloque principal.
• Lateral shuffle: 20 m
• High knees: 20 m
• KB goblet squat: 10 reps · 16 kg
• Inchworm: 5 reps
• Band pull-apart: 12 reps
• Jump rope: 40 s
• World''s greatest stretch: 4 reps por lado', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-08-31","modality":"ATHX","heroId":"the-seven","honor":"The Seven (benchmark)","dayOrder":0,"kind":"activation"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-31', -9100831, 'Preparación', 'ATHX · Primer técnico · The Seven',
    '25 min', '', 'Técnica/skills · Primer - Empuje invertido · 8 min
No llegues al fallo. Escala HSPU con pike push-up, cajón o mancuernas.
• Pike push-up: 2 × 8
• Wall walk: 2 intentos
• Shoulder taps en pared: 2 × 6

Técnica/skills · Primer - Barra y bisagra · 10 min
Toca el suelo en cada deadlift. Thruster con barra vacía y 2 series ligeras.
• Thruster: 2 × 5 · barra vacía
• Thruster: 1 × 5 · 40 kg
• Deadlift: 2 × 5 · 70 kg
• Knees-to-elbow: 2 × 5

Técnica/skills · Primer - Dominadas y potencia · 8 min
Mantén el kipping fuera. Si rompes técnica, usa banda.
• Strict pull-up: 2 × 5
• KB swing: 2 × 10 · 16 kg
• Burpee: 2 × 5', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-08-31","modality":"ATHX","heroId":"the-seven","honor":"The Seven (benchmark)","dayOrder":1,"kind":"session"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
    name = excluded.name,
    day_label = excluded.day_label,
    estimated_duration = excluded.estimated_duration,
    warmup = excluded.warmup,
    main_part = excluded.main_part,
    core_part = excluded.core_part,
    cooldown = excluded.cooldown,
    schedule_config = excluded.schedule_config,
    synced_at = now();

  insert into public.entrenos_diarios (
    program_id, workout_date, aimharder_rate_id, name, day_label,
    estimated_duration, warmup, main_part, core_part, cooldown, schedule_config, synced_at
  ) values (
    target_program, '2026-08-31', -9200831, 'The Seven', 'ATHX · Hero WOD · Una sola vez',
    '30-40 min', '', 'Rounds For Time · HERO - THE SEVEN · Cap 35 min · 7 rondas
For time. 7 reps de cada movimiento por ronda, en orden. Rx: thruster 61/43 kg, deadlift 112/75 kg, swing 32/24 kg. Ritmo objetivo: primera ronda ~4 min y mantener transiciones cortas. Escala HSPU con pike o cajón, K2E con elevación de rodillas y dominadas con banda.
• Handstand Push-up: 7 reps
• THRUSTER BARBELL: 7 reps · 61 kg
• Knees-to-Elbow: 7 reps
• Deadlift: 7 reps · 112 kg
• Burpee: 7 reps
• Kettlebell Swing: 7 reps · 32 kg
• Strict Pull-up: 7 reps', '', '', '{"weekdays":[0],"recurrence":"once","startDate":"2026-08-31","modality":"ATHX","heroId":"the-seven","honor":"The Seven (benchmark)","dayOrder":2,"kind":"metcon"}'::jsonb, now()
  ) on conflict (workout_date, aimharder_rate_id) do update set
    program_id = excluded.program_id,
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
