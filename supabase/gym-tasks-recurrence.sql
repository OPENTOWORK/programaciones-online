-- Frecuencia de las tareas del gimnasio: una vez, diaria, semanal o mensual.

alter table public.gym_tasks
  add column if not exists recurrence text not null default 'once'
  check (recurrence in ('once', 'daily', 'weekly', 'monthly'));

notify pgrst, 'reload schema';
