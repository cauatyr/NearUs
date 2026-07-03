-- =====================================================================
-- NearUs · Estado 'ausente' (no-show) para reservas
-- Ejecutar en Supabase SQL Editor. Idempotente.
-- Permite marcar que un cliente NO se presentó (distinto de cancelada).
-- =====================================================================

alter table reservas drop constraint if exists reservas_estado_check;

alter table reservas add constraint reservas_estado_check
  check (estado in ('confirmada', 'completada', 'cancelada', 'ausente'));

-- =====================================================================
-- Done.
-- =====================================================================
