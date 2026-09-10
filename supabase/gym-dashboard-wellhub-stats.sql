-- Métrica de reservas Wellhub en el panel del gimnasio.

drop view if exists public.gym_dashboard_stats;
create view public.gym_dashboard_stats
with (security_invoker = true)
as
select
  g.id as gym_id,
  (select count(*) from public.gym_members m
    where m.gym_id = g.id and m.status = 'active') as active_members,
  (select count(*) from public.gym_members m
    where m.gym_id = g.id and m.joined_at >= date_trunc('month', current_date)) as new_members_this_month,
  (select count(*) from public.gym_members m where m.gym_id = g.id) as total_members,
  (select count(*) from public.gym_classes c
    where c.gym_id = g.id
      and c.start_at >= current_date
      and c.start_at < current_date + interval '1 day'
      and c.status <> 'cancelled') as classes_today,
  (select count(*) from public.gym_bookings b
    join public.gym_classes c on c.id = b.class_id
    where b.gym_id = g.id
      and c.start_at >= current_date
      and c.start_at < current_date + interval '1 day'
      and b.status in ('confirmed', 'attended')) as bookings_today,
  (select count(*) from public.gym_bookings b
    join public.gym_classes c on c.id = b.class_id
    join public.gym_members m on m.id = b.member_id
    where b.gym_id = g.id
      and c.start_at >= current_date
      and c.start_at < current_date + interval '1 day'
      and b.status in ('confirmed', 'attended')
      and (
        m.signup_source = 'wellhub'
        or m.wellhub_user_id is not null
      )) as wellhub_bookings_today,
  (select count(*) from public.gym_bookings b
    where b.gym_id = g.id
      and b.booked_at >= now() - interval '30 days'
      and b.status <> 'cancelled') as bookings_last_30_days,
  (select count(*) from public.gym_member_memberships mm
    where mm.gym_id = g.id
      and mm.status = 'active'
      and mm.ends_at is not null
      and mm.ends_at between current_date and current_date + interval '15 days') as memberships_expiring_soon
from public.gyms g;

grant select on public.gym_dashboard_stats to authenticated;

notify pgrst, 'reload schema';
