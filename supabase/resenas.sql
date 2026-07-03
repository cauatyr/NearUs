-- ============================================================
-- NearUs · Reseñas (reviews de clientes) + recálculo de rating
-- Correr UNA vez en el SQL editor de Supabase. Es idempotente.
-- ============================================================

create table if not exists resenas (
  id              text primary key,
  negocio_id      text references negocios(id) on delete cascade,
  reserva_id      text references reservas(id) on delete set null,
  cliente_user_id uuid references auth.users(id),
  cliente_nombre  text not null,
  rating          int  not null check (rating between 1 and 5),
  comentario      text,
  created_at      timestamptz default now()
);

create index if not exists idx_resenas_negocio on resenas(negocio_id);

-- RLS: lectura pública, inserción abierta (consistente con el MVP; el resto de
-- las tablas también está abierto). Sin update/delete desde el cliente.
alter table resenas enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='resenas' and policyname='resenas_select') then
    create policy resenas_select on resenas for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='resenas' and policyname='resenas_insert') then
    create policy resenas_insert on resenas for insert with check (true);
  end if;
end $$;

-- Recalcula rating (promedio) y reviews (conteo) del negocio ante cualquier
-- cambio en sus reseñas. Así el rating mostrado siempre es real.
create or replace function recompute_negocio_rating() returns trigger as $$
declare nid text;
begin
  nid := coalesce(new.negocio_id, old.negocio_id);
  update negocios n set
    rating  = (select round(avg(rating)::numeric, 1) from resenas where negocio_id = nid),
    reviews = (select count(*) from resenas where negocio_id = nid)
  where n.id = nid;
  return null;
end;
$$ language plpgsql;

drop trigger if exists trg_resenas_rating on resenas;
create trigger trg_resenas_rating
after insert or update or delete on resenas
for each row execute function recompute_negocio_rating();

-- Realtime (para que una reseña nueva actualice el rating en vivo).
do $$ begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname='supabase_realtime' and tablename='resenas'
  ) then
    alter publication supabase_realtime add table resenas;
  end if;
end $$;

-- ============================================================
-- SEED de reseñas DEMO (para los 9 negocios demo-*). Prefijo demo-r-.
-- Borrar con: delete from resenas where id like 'demo-r-%';
-- El trigger recalcula rating/reviews de cada negocio automáticamente.
-- ============================================================
insert into resenas (id, negocio_id, cliente_nombre, rating, comentario, created_at) values
  ('demo-r-01','demo-studio-bella','María Cabrera',5,'Excelente atención. Reservé desde la app en 30 segundos y todo estaba listo al llegar.', now() - interval '3 days'),
  ('demo-r-02','demo-studio-bella','Doménica Vélez',5,'El balayage quedó espectacular. Ya es mi salón de cabecera.', now() - interval '9 days'),
  ('demo-r-03','demo-studio-bella','Paúl Andrade',4,'Muy buen corte y puntuales. Volvería sin duda.', now() - interval '15 days'),
  ('demo-r-04','demo-studio-bella','Andrea Once',5,'Ambiente lindo y profesionales de primera.', now() - interval '22 days'),

  ('demo-r-05','demo-barbers-club','Kevin Sarmiento',5,'La mejor barbería de Cuenca. Toalla caliente y atención de lujo.', now() - interval '2 days'),
  ('demo-r-06','demo-barbers-club','Jonathan Peña',5,'Corte + barba impecable. Reservar por la app es un golazo.', now() - interval '7 days'),
  ('demo-r-07','demo-barbers-club','Diego Molina',4,'Buen servicio, a veces se llena pero vale la pena.', now() - interval '13 days'),

  ('demo-r-08','demo-nails-co','Camila Bravo',5,'Mis uñas quedaron perfectas y me atendieron a la hora exacta.', now() - interval '4 days'),
  ('demo-r-09','demo-nails-co','Gabriela Torres',4,'Muy prolijas y amables. El local es súper limpio.', now() - interval '11 days'),
  ('demo-r-10','demo-nails-co','Sofía Reinoso',5,'Nail art increíble, me encantó el resultado.', now() - interval '18 days'),

  ('demo-r-11','demo-aura-estetica','Valeria Crespo',5,'La limpieza facial dejó mi piel como nueva. Recomendadísimo.', now() - interval '5 days'),
  ('demo-r-12','demo-aura-estetica','Michelle Ortiz',5,'Trato profesional y resultados visibles desde la primera sesión.', now() - interval '12 days'),
  ('demo-r-13','demo-aura-estetica','Fernanda Loja',4,'Muy buena atención, precios justos.', now() - interval '20 days'),

  ('demo-r-14','demo-zen-spa','Ricardo Peralta',5,'Un oasis en la ciudad. El circuito de spa es relajante total.', now() - interval '3 days'),
  ('demo-r-15','demo-zen-spa','Ana Belén Cordero',5,'Fuimos en pareja y fue una experiencia increíble.', now() - interval '8 days'),
  ('demo-r-16','demo-zen-spa','Luis Tapia',4,'Muy bueno, solo mejoraría la música del ambiente.', now() - interval '16 days'),

  ('demo-r-17','demo-glow-makeup','Emilia Vásquez',5,'Me maquilló para mi boda y quedé de ensueño. Gracias!', now() - interval '6 days'),
  ('demo-r-18','demo-glow-makeup','Nicole Piedra',5,'Súper talentosa, entendió justo lo que quería.', now() - interval '14 days'),

  ('demo-r-19','demo-serenity-masajes','Marco Rivera',5,'El masaje descontracturante me salvó la espalda. Excelente.', now() - interval '4 days'),
  ('demo-r-20','demo-serenity-masajes','Tatiana Guaman',4,'Muy relajante y profesionales certificados. Repetiré.', now() - interval '10 days'),
  ('demo-r-21','demo-serenity-masajes','Esteban Quito',5,'Puntualidad y manos de ángel. Recomendado.', now() - interval '19 days'),

  ('demo-r-22','demo-lisse-depilacion','Karla Bermeo',4,'Protocolo higiénico y muy buen resultado con el láser.', now() - interval '7 days'),
  ('demo-r-23','demo-lisse-depilacion','Priscila Rojas',5,'Sin dolor y muy prolijas. Súper recomendable.', now() - interval '17 days'),

  ('demo-r-24','demo-corte-fino','Wilson Ávila',5,'Llevé a mis hijos y quedaron felices. Rápido y económico.', now() - interval '5 days'),
  ('demo-r-25','demo-corte-fino','Jessica Naranjo',4,'Buen corte y buena onda. Volveremos.', now() - interval '13 days')
on conflict (id) do nothing;
