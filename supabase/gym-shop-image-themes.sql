-- Variante de foto de producto por tema visual del CRM.

alter table public.gym_products
  add column if not exists image_themes text[] not null default '{}';

create index if not exists gym_products_image_themes_idx
  on public.gym_products using gin (image_themes);
