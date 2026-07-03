-- =====================================================================
-- NearUs · Respuesta del dueño a las reseñas
-- Ejecutar en Supabase SQL Editor. Idempotente, aditivo.
-- =====================================================================

-- La respuesta del negocio a una reseña + cuándo respondió.
alter table resenas add column if not exists respuesta text;
alter table resenas add column if not exists respuesta_at timestamptz;

-- Política de UPDATE (el dueño responde). Consistente con el MVP abierto.
do $$ begin
  if not exists (select 1 from pg_policies where tablename='resenas' and policyname='resenas_update') then
    create policy resenas_update on resenas for update using (true) with check (true);
  end if;
end $$;

-- =====================================================================
-- Done.
-- =====================================================================
