-- Columna de sistema "Gimnasios" en el tablero CRM del administrador.

insert into public.trainer_crm_stages (trainer_id, name, position, system_key)
select
  p.id,
  'Gimnasios',
  coalesce((select max(s.position) from public.trainer_crm_stages s where s.trainer_id = p.id), -1) + 1,
  'gyms'
from public."Perfil" p
join public.roles r on r.id = p.id_roles
where r.slug = 'administrador'
  and not exists (
    select 1
    from public.trainer_crm_stages existing
    where existing.trainer_id = p.id
      and (
        existing.system_key = 'gyms'
        or lower(trim(existing.name)) = 'gimnasios'
      )
  );

update public.trainer_crm_stages
set system_key = 'gyms'
where system_key is null
  and lower(trim(name)) = 'gimnasios';
