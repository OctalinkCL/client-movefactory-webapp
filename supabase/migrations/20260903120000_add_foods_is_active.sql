-- Soft-delete de alimentos: en vez de borrar un alimento del listado
-- maestro (imposible con hard delete porque user_food_selections.food_id
-- es NO ACTION y bloquea el DELETE en cuanto algún alumno lo eligió), se
-- desactiva. Los alimentos inactivos dejan de ofrecerse al elegir, pero
-- las selecciones históricas y las listas de compra siguen intactas.
--
-- Este archivo no se ejecuta solo: correrlo manualmente en el SQL Editor
-- del proyecto Supabase (o via `supabase db push` si el repo se linkea
-- con `supabase link`).

alter table foods
  add column if not exists is_active boolean not null default true;
