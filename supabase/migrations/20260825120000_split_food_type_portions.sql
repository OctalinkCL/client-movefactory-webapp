-- Permite que el alumno divida un ítem de N porciones en N alimentos
-- independientes (en vez de un solo alimento escalado x N).
--
-- Este archivo no se ejecuta solo: no hay conexión configurada a un
-- proyecto Supabase remoto desde este entorno. Correr este script
-- manualmente en el SQL Editor del proyecto (o via `supabase db push`
-- si el repo se linkea con `supabase link`).

-- 1) Slot dentro de un mismo meal_plan_item, para poder guardar más de
--    una selección por ítem/día cuando el alumno decide dividir.
alter table user_food_selections
  add column if not exists slot_index integer not null default 0;

-- Existía una constraint UNIQUE sobre (meal_plan_item_id, day_of_week) que
-- permitía una sola selección por ítem/día. Hay que reemplazarla por una
-- que incluya slot_index, si no, insertar el segundo slot chocaría contra
-- la vieja.
alter table user_food_selections
  drop constraint if exists user_food_selections_meal_plan_item_id_day_of_week_key;

create unique index if not exists user_food_selections_unique_slot
  on user_food_selections (meal_plan_item_id, day_of_week, slot_index);

-- 2) Marca de "este ítem lo dividí": la existencia de una fila = dividido,
--    ausencia = combinado (comportamiento actual, default para todos los
--    ítems existentes). Solo el alumno dueño del ítem puede leerla/escribirla.
create table if not exists meal_plan_item_splits (
  id uuid primary key default gen_random_uuid(),
  meal_plan_item_id uuid not null references meal_plan_items(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (meal_plan_item_id)
);

alter table meal_plan_item_splits enable row level security;

create policy "Users manage their own item splits"
  on meal_plan_item_splits
  for all
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from meal_plan_items mpi
      join meal_plan_moments mpm on mpm.id = mpi.meal_plan_moment_id
      join meal_plans mp on mp.id = mpm.meal_plan_id
      where mpi.id = meal_plan_item_id
        and mp.user_id = auth.uid()
    )
  );
