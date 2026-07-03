-- =====================================================================
-- NearUs · Mejoras del panel de empresa (idempotente, ADITIVO)
-- Ejecutar entero en Supabase SQL Editor. NO borra datos.
--   · foto de servicios y de profesionales (empleados)
--   · horario por día (horario_semanal jsonb) en negocios
-- =====================================================================

-- Foto del servicio (dataURL base64, mismo patrón que el logo del negocio)
alter table servicios add column if not exists foto text;

-- Foto del profesional (dataURL base64). El campo 'avatar' (iniciales) queda
-- como fallback cuando no hay foto.
alter table empleados add column if not exists foto text;

-- Horario detallado por día. Estructura (array de 7, orden Lun→Dom):
--   [{ "dia":"Lun", "abierto":true, "apertura":"09:00", "cierre":"19:00" }, ...]
-- El campo 'horario' (text) sigue existiendo como resumen legible para los cards.
alter table negocios add column if not exists horario_semanal jsonb;

-- =====================================================================
-- Done. Verificar:
--   select column_name from information_schema.columns
--     where table_name in ('servicios','empleados','negocios')
--     and column_name in ('foto','horario_semanal');
-- =====================================================================
