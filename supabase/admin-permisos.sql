-- ============================================================
-- NearUs · Permisos por administrador
-- Correr UNA vez en el SQL editor, después de supabase/admin.sql.
--
-- Cada admin pasa a tener una lista de permisos. Se administran desde
-- /admin/equipo (sólo quien tenga 'admins.gestionar'); esta tabla sigue sin
-- policies de escritura, así que nadie puede darse permisos desde el navegador:
-- las altas y cambios pasan por /api/admin/admins, con service_role.
-- ============================================================

alter table admins add column if not exists nombre     text;
alter table admins add column if not exists permisos   text[] not null default '{}';
alter table admins add column if not exists creado_por uuid;

-- Los admins que ya existían (o sea, el primero) se quedan con todo.
update admins
set permisos = array[
  'negocios.ver',
  'negocios.crear',
  'negocios.editar',
  'negocios.eliminar',
  'negocios.gestionar',
  'finanzas.ver',
  'clientes.ver',
  'admins.gestionar'
]
where permisos = '{}';

select email, nombre, permisos from admins;
