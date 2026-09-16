-- ============================================================
-- NearUs · Acceso de administrador interno
-- Correr UNA vez en el SQL editor de Supabase.
--
-- La cuenta de admin NO se puede crear desde el app: no hay pantalla de
-- registro y esta tabla no acepta escrituras con la anon key. Para sumar un
-- admin nuevo hay que venir acá, al SQL editor.
-- ============================================================

create table if not exists admins (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  email     text,
  creado_en timestamptz not null default now()
);

alter table admins enable row level security;

-- ÚNICA policy: cada usuario ve SOLO su propia fila (así el app puede
-- preguntar "¿soy admin?" sin poder listar a los demás).
--
-- A propósito NO existe policy de insert / update / delete: con RLS habilitada
-- y sin policy, Postgres niega la operación. Eso hace imposible que alguien se
-- convierta en admin desde el navegador, aunque tenga la anon key (que es
-- pública, vive en el bundle). Ésta es la traba central del diseño.
drop policy if exists "admin ve su propia fila" on admins;
create policy "admin ve su propia fila"
  on admins for select
  using (user_id = auth.uid());

-- La cuenta ya fue creada por el equipo (auth.users). Acá solo se le da el
-- permiso de admin, buscándola por email.
--
-- ⚠️ Reemplazá el placeholder por el email real ANTES de correr esto. No queda
-- escrito en el repo a propósito: es público, y publicar cuál es la cuenta de
-- administración es media contraseña regalada.
insert into admins (user_id, email)
select id, email from auth.users where email = 'REEMPLAZAR@POR-EL-EMAIL-DEL-ADMIN'
on conflict (user_id) do nothing;

-- Debe devolver exactamente 1 fila.
select user_id, email, creado_en from admins;
