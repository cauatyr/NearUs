-- =====================================================================
-- NearUs · Billetera (wallet) por usuario — libro mayor universal
-- Ejecutar UNA vez en el SQL Editor de Supabase. NO está en schema.sql
-- (que se re-ejecuta y borra tablas) para no perder el saldo.
-- =====================================================================
--
-- DISEÑO (agnóstico al proveedor de pago):
--   El saldo NO se guarda como un número editable: es la SUMA de un libro
--   mayor inmutable (wallet_movimientos). Cada fila es un movimiento firmado:
--     recarga  → monto positivo (entra plata)
--     pago     → monto negativo (se gasta en una reserva)
--     reembolso→ monto positivo (devolución)
--   saldo = sum(monto). Imposible que se "desincronice".
--
-- VERIFICACIÓN DEL PAGO (el "seam" para PIX/tarjeta a futuro):
--   Hoy la recarga se inserta directo (simulada) para poder probar. Cuando
--   se integre un proveedor real (Mercado Pago / Stripe / Kushki / etc.),
--   la recarga la inserta SOLO el servidor (Edge Function) DESPUÉS de que el
--   webhook del proveedor confirme el pago — usando service_role (que ignora
--   RLS). El frontend nunca acreditará saldo en producción real.
--   PIX aplica solo en Brasil; tarjeta es universal. El núcleo de la wallet
--   no depende del país ni del proveedor: solo recibe "se confirmó +X".

create table if not exists wallet_movimientos (
  id              text primary key,
  cliente_user_id uuid not null references auth.users(id) on delete cascade,
  tipo            text not null check (tipo in ('recarga','pago','reembolso')),
  monto           numeric(10,2) not null,          -- firmado: + entra · - sale
  reserva_id      text references reservas(id) on delete set null,
  metodo          text,                            -- 'simulado' | 'pix' | 'tarjeta' | 'saldo' | ...
  descripcion     text,
  created_at      timestamptz default now()
);

create index if not exists idx_wallet_mov_user on wallet_movimientos(cliente_user_id);
create index if not exists idx_wallet_mov_fecha on wallet_movimientos(created_at);

-- =====================================================================
-- RLS — cada quien ve y escribe SOLO sus propios movimientos.
-- (A diferencia de las otras tablas del MVP que están abiertas: esto es
--  plata, así que va scoped por auth.uid() desde el inicio. No afecta al
--  modo demo del negocio, que ni toca esta tabla.)
-- Sin UPDATE ni DELETE desde el cliente: el libro mayor es inmutable.
-- =====================================================================
alter table wallet_movimientos enable row level security;

drop policy if exists "wallet propio select" on wallet_movimientos;
drop policy if exists "wallet propio insert" on wallet_movimientos;

create policy "wallet propio select" on wallet_movimientos
  for select using (auth.uid() = cliente_user_id);

create policy "wallet propio insert" on wallet_movimientos
  for insert with check (auth.uid() = cliente_user_id);

-- Realtime: para que si la mamá recarga, el hijo vea el saldo subir en vivo.
alter publication supabase_realtime add table wallet_movimientos;

-- =====================================================================
-- Verificar:
--   select cliente_user_id, sum(monto) as saldo
--   from wallet_movimientos group by cliente_user_id;
-- =====================================================================
