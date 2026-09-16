-- ============================================================
-- NearUs · Aceptación del contrato por parte del negocio
-- Correr UNA vez en el SQL editor de Supabase.
--
-- Deja constancia de qué versión del contrato aceptó cada negocio al
-- registrarse (checkbox obligatorio en el paso 4 del onboarding).
--
-- El app funciona igual sin correr esto: la escritura de estas dos columnas es
-- tolerante a que no existan, así que el registro de negocios NO se rompe. Lo
-- que falta hasta correrlo es el registro de la aceptación.
-- ============================================================

alter table negocios add column if not exists terminos_aceptados_en timestamptz;
alter table negocios add column if not exists terminos_version      text;

-- Los negocios que ya existían quedan en null (aceptaron fuera del app o son
-- anteriores al contrato). Se ven así en la ficha de administración.
select id, nombre, terminos_version, terminos_aceptados_en
from negocios
order by nombre;
