-- =====================================================================
-- NearUs · Schema completo + seed (idempotente)
-- Ejecutar entero en Supabase SQL Editor. Re-ejecutable sin perder schema.
-- =====================================================================

-- Limpieza idempotente (orden inverso de dependencias)
drop table if exists reservas cascade;
drop table if exists empleados cascade;
drop table if exists servicios cascade;
drop table if exists negocios cascade;
drop table if exists categorias cascade;

-- =====================================================================
-- TABLAS
-- =====================================================================

create table categorias (
  id          text primary key,
  nombre      text not null,
  icono       text not null,        -- nombre del componente lucide-react
  color       text not null,        -- hex
  orden       int default 0
);

create table negocios (
  id           text primary key,
  nombre       text not null,
  categoria    text references categorias(id),
  direccion    text,
  barrio       text,
  lat          double precision not null,
  lng          double precision not null,
  rating       numeric(2,1),
  reviews      int default 0,
  horario      text,
  imagen       text,
  portada      text,
  descripcion  text,
  acepta_ahora boolean default false,
  telefono     text,
  destacado    boolean default false, -- corona dorada (Plan Pro)
  created_at   timestamptz default now()
);

create table servicios (
  id          text primary key,
  negocio_id  text references negocios(id) on delete cascade,
  nombre      text not null,
  duracion    int  not null,        -- minutos
  precio      numeric(10,2) not null,
  categoria   text references categorias(id)
);

create table empleados (
  id          text primary key,
  negocio_id  text references negocios(id) on delete cascade,
  nombre      text not null,
  cargo       text,
  avatar      text                  -- iniciales
);

create table reservas (
  id              text primary key,
  codigo          text unique not null,
  negocio_id      text references negocios(id) on delete cascade,
  servicio_id     text references servicios(id),
  empleado_id     text references empleados(id),
  cliente_nombre  text not null,
  cliente_celular text,
  fecha           timestamptz not null,
  duracion        int not null,
  precio          numeric(10,2) not null,
  estado          text check (estado in ('confirmada','completada','cancelada')) default 'confirmada',
  metodo_pago     text check (metodo_pago in ('inapp','local')),
  created_at      timestamptz default now()
);

-- Indices útiles
create index idx_negocios_categoria on negocios(categoria);
create index idx_servicios_negocio  on servicios(negocio_id);
create index idx_empleados_negocio  on empleados(negocio_id);
create index idx_reservas_negocio   on reservas(negocio_id);
create index idx_reservas_fecha     on reservas(fecha);

-- =====================================================================
-- SEED: categorias
-- =====================================================================
insert into categorias (id, nombre, icono, color, orden) values
  ('cabello',    'Cabello',    'Scissors',   '#534AB7', 1),
  ('barberia',   'Barbería',   'BadgeAlert', '#0F6E56', 2),
  ('unas',       'Uñas',       'Hand',       '#BA7517', 3),
  ('estetica',   'Estética',   'Sparkles',   '#A8336E', 4),
  ('spa',        'Spa',        'Flower2',    '#0C447C', 5),
  ('depilacion', 'Depilación', 'Wand2',      '#7A1F1F', 6),
  ('maquillaje', 'Maquillaje', 'Palette',    '#C0392B', 7),
  ('masajes',    'Masajes',    'HandHelping','#27500A', 8);

-- =====================================================================
-- SEED: negocios (20 reales-inspirados en Cuenca, Ecuador)
-- destacado=true → n2, n9, n13 (corona dorada Plan Pro)
-- =====================================================================
insert into negocios (id, nombre, categoria, direccion, barrio, lat, lng, rating, reviews, horario, imagen, portada, descripcion, acepta_ahora, telefono, destacado) values
('n1','Estilo Andino — Salón & Spa','cabello','Av. Solano 4-23 y Florencia Astudillo','El Ejido',-2.9098,-79.0107,4.8,124,'Lun–Sáb · 09:00–19:00','https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800','https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200','Salón boutique especializado en color y cortes contemporáneos. Productos veganos.',true,'+593 99 123 4567',false),
('n2','Don Carlos Barbería Clásica','barberia','Calle Larga 7-65 y Luis Cordero','Centro Histórico',-2.9023,-79.0038,4.9,287,'Lun–Sáb · 08:00–20:00','https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800','https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1200','Barbería tradicional con más de 20 años en el centro histórico. Afeitado clásico con navaja.',true,'+593 98 765 4321',true),
('n3','Nails Studio Cuenca','unas','Av. Remigio Crespo Toral 1-128','El Vergel',-2.9151,-79.0078,4.7,198,'Mar–Dom · 10:00–19:00','https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800','https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=1200','Diseño de uñas semipermanentes, acrílico, gel y nail art personalizado.',false,'+593 99 222 1133',false),
('n4','Aura Estética Avanzada','estetica','Av. Ordóñez Lasso 4-50','Cañaribamba',-2.8895,-79.0210,4.6,89,'Lun–Sáb · 09:30–18:30','https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800','https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200','Tratamientos faciales, limpieza profunda, hidrafacial y radiofrecuencia.',false,'+593 97 444 5566',false),
('n5','Serenity Spa Urbano','spa','Calle del Batán 2-45','El Batán',-2.9050,-79.0250,4.9,156,'Todos los días · 10:00–21:00','https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800','https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200','Spa urbano con sauna, jacuzzi, masajes terapéuticos y ritual de aromaterapia.',false,'+593 96 777 8899',false),
('n6','Glow Depilación Láser','depilacion','Av. Loja 2-110 y Av. de las Américas','Yanuncay',-2.9120,-79.0190,4.7,142,'Lun–Sáb · 09:00–19:00','https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800','https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200','Depilación láser diodo de última generación. Tarifas accesibles, paquetes corporales.',false,'+593 99 333 2211',false),
('n7','María Eugenia Makeup','maquillaje','Mariscal Lamar 12-34 y Estévez de Toral','Centro Histórico',-2.8961,-79.0061,5.0,76,'Cita previa · 08:00–20:00','https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800','https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200','Maquillaje profesional para novias, eventos y producción fotográfica.',false,'+593 98 111 2233',false),
('n8','Manos Sanadoras Masajes','masajes','Av. Huayna Cápac 2-30','Totoracocha',-2.8920,-78.9760,4.8,92,'Lun–Dom · 10:00–20:00','https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800','https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200','Masaje terapéutico, descontracturante, piedras calientes y reflexología.',true,'+593 99 887 6655',false),
('n9','Rebel Cuts Barbershop','barberia','Av. de las Américas 8-12','Misicata',-2.9180,-79.0290,4.6,213,'Mar–Dom · 10:00–21:00','https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800','https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200','Barbería urbana, fades, diseños, beard styling. Reserva online sin filas.',true,'+593 97 555 4422',true),
('n10','Coral Beauty Bar','unas','Gran Colombia 11-40 y Tarqui','Centro Histórico',-2.8973,-79.0072,4.5,67,'Lun–Sáb · 09:00–18:00','https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=800','https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200','Manicure, pedicure spa, esmaltado tradicional y semipermanente.',false,'+593 99 654 3210',false),
('n11','Belleza Integral Karina','estetica','Av. González Suárez 3-78','El Vergel',-2.9197,-78.9892,4.4,54,'Lun–Vie · 09:00–18:00','https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800','https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200','Tratamientos corporales, drenaje linfático, presoterapia y cavitación.',false,'+593 98 234 5678',false),
('n12','Zen Garden Spa','spa','Vía a Misicata 5-200','Misicata',-2.9220,-79.0310,4.7,103,'Todos los días · 11:00–22:00','https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800','https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200','Spa de inspiración asiática, masaje thai, shiatsu y ceremonia del té.',false,'+593 96 432 1098',false),
('n13','Hair Lab — Color Experts','cabello','Av. Solano 6-12','El Ejido',-2.9120,-79.0115,4.9,167,'Lun–Sáb · 10:00–20:00','https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800','https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200','Especialistas en balayage, mechas californianas, rubios fríos y color creativo.',false,'+593 99 998 7766',true),
('n14','Sleek Barber Club','barberia','Av. Don Bosco 1-45','Yanuncay',-2.9105,-79.0160,4.7,184,'Lun–Sáb · 09:00–20:00','https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800','https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200','Cortes ejecutivos, masaje capilar, mascarillas de barba y ambiente premium.',true,'+593 98 765 0011',false),
('n15','Pretty Nails Boutique','unas','Av. 12 de Octubre 4-67','El Batán',-2.9075,-79.0230,4.6,88,'Lun–Sáb · 10:00–19:00','https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800','https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=1200','Uñas acrílicas, gelish, nail art temático y atención personalizada.',false,'+593 99 543 2167',false),
('n16','Pure Skin Cosmetología','estetica','Calle Honorato Vázquez 8-12','Centro Histórico',-2.8989,-79.0048,4.8,115,'Mar–Sáb · 09:00–18:00','https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800','https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200','Microdermoabrasión, peeling químico, mesoterapia facial.',false,'+593 96 321 9876',false),
('n17','Velvet Wax Studio','depilacion','Av. 10 de Agosto 2-89','Totoracocha',-2.8932,-78.9710,4.5,72,'Lun–Sáb · 09:00–18:00','https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800','https://images.unsplash.com/photo-1614859275398-8e1f7b8b0f4a?w=1200','Depilación con cera tibia, chocolate y caramelo. Cejas con hilo.',true,'+593 99 876 1234',false),
('n18','Glam Bridal — Maquillaje de Novias','maquillaje','Av. Paucarbamba 1-30','Yanuncay',-2.9098,-79.0220,4.9,58,'Cita previa','https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800','https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200','Maquillaje y peinado para novias, quinceañeras y eventos especiales.',false,'+593 97 222 8844',false),
('n19','Relax Thai Massage','masajes','Av. Fray Vicente Solano 7-90','El Ejido',-2.9135,-79.0085,4.6,134,'Todos los días · 11:00–21:00','https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800','https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=1200','Masaje thai tradicional, sueco, relajante y deportivo.',true,'+593 98 654 3322',false),
('n20','Casa de Belleza Sofía','cabello','Calle Bolívar 9-45 y Benigno Malo','Centro Histórico',-2.8975,-79.0040,4.5,245,'Lun–Sáb · 08:30–19:30','https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800','https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200','Salón familiar tradicional. Cortes, peinados, tintes y tratamientos capilares.',false,'+593 99 111 5544',false);

-- =====================================================================
-- SEED: servicios (60)
-- =====================================================================
insert into servicios (id, negocio_id, nombre, duracion, precio, categoria) values
('s1-1','n1','Corte mujer',45,18.00,'cabello'),
('s1-2','n1','Color completo',120,65.00,'cabello'),
('s1-3','n1','Balayage',180,95.00,'cabello'),
('s1-4','n1','Tratamiento de keratina',150,80.00,'cabello'),
('s2-1','n2','Corte clásico caballero',30,8.00,'barberia'),
('s2-2','n2','Afeitado con navaja',30,10.00,'barberia'),
('s2-3','n2','Corte + barba',45,14.00,'barberia'),
('s2-4','n2','Corte niño',25,6.00,'barberia'),
('s3-1','n3','Manicure clásico',45,12.00,'unas'),
('s3-2','n3','Pedicure spa',60,18.00,'unas'),
('s3-3','n3','Uñas acrílicas',90,30.00,'unas'),
('s3-4','n3','Nail art personalizado',75,25.00,'unas'),
('s4-1','n4','Limpieza facial profunda',60,35.00,'estetica'),
('s4-2','n4','Hidrafacial',75,55.00,'estetica'),
('s4-3','n4','Radiofrecuencia facial',60,45.00,'estetica'),
('s5-1','n5','Masaje relajante 60min',60,35.00,'spa'),
('s5-2','n5','Ritual aromaterapia',90,55.00,'spa'),
('s5-3','n5','Circuito de hidroterapia',120,70.00,'spa'),
('s6-1','n6','Depilación láser axilas',20,25.00,'depilacion'),
('s6-2','n6','Depilación láser piernas completas',60,80.00,'depilacion'),
('s6-3','n6','Depilación láser zona bikini',30,40.00,'depilacion'),
('s7-1','n7','Maquillaje social',60,35.00,'maquillaje'),
('s7-2','n7','Maquillaje de novia',120,120.00,'maquillaje'),
('s7-3','n7','Prueba de maquillaje',90,45.00,'maquillaje'),
('s8-1','n8','Masaje descontracturante',60,30.00,'masajes'),
('s8-2','n8','Masaje con piedras calientes',75,45.00,'masajes'),
('s8-3','n8','Reflexología podal',45,25.00,'masajes'),
('s9-1','n9','Fade clásico',40,12.00,'barberia'),
('s9-2','n9','Diseño + corte',50,18.00,'barberia'),
('s9-3','n9','Beard styling',30,10.00,'barberia'),
('s10-1','n10','Manicure express',30,8.00,'unas'),
('s10-2','n10','Pedicure clásico',45,12.00,'unas'),
('s10-3','n10','Esmaltado semipermanente',60,18.00,'unas'),
('s11-1','n11','Drenaje linfático',60,28.00,'estetica'),
('s11-2','n11','Presoterapia',45,22.00,'estetica'),
('s11-3','n11','Sesión de cavitación',60,35.00,'estetica'),
('s12-1','n12','Masaje Thai 90 min',90,50.00,'spa'),
('s12-2','n12','Shiatsu',60,40.00,'spa'),
('s12-3','n12','Ceremonia del té + spa facial',120,75.00,'spa'),
('s13-1','n13','Balayage premium',240,130.00,'cabello'),
('s13-2','n13','Decoloración + tono',180,100.00,'cabello'),
('s13-3','n13','Corte y peinado',60,22.00,'cabello'),
('s14-1','n14','Corte ejecutivo',35,12.00,'barberia'),
('s14-2','n14','Ritual de barba',40,15.00,'barberia'),
('s14-3','n14','Combo premium',60,22.00,'barberia'),
('s15-1','n15','Uñas acrílicas',90,28.00,'unas'),
('s15-2','n15','Gelish manos y pies',90,25.00,'unas'),
('s15-3','n15','Diseño nail art',60,20.00,'unas'),
('s16-1','n16','Microdermoabrasión',60,38.00,'estetica'),
('s16-2','n16','Peeling químico',45,50.00,'estetica'),
('s16-3','n16','Mesoterapia facial',60,65.00,'estetica'),
('s17-1','n17','Depilación cera bigote',15,5.00,'depilacion'),
('s17-2','n17','Depilación cera piernas',40,18.00,'depilacion'),
('s17-3','n17','Diseño de cejas con hilo',20,8.00,'depilacion'),
('s18-1','n18','Maquillaje + peinado novia',180,180.00,'maquillaje'),
('s18-2','n18','Maquillaje quinceañera',120,80.00,'maquillaje'),
('s18-3','n18','Maquillaje fiesta',60,40.00,'maquillaje'),
('s19-1','n19','Masaje Thai 60 min',60,30.00,'masajes'),
('s19-2','n19','Masaje sueco',60,32.00,'masajes'),
('s19-3','n19','Masaje deportivo',75,40.00,'masajes'),
('s20-1','n20','Corte y secado',50,12.00,'cabello'),
('s20-2','n20','Tinte raíz',90,30.00,'cabello'),
('s20-3','n20','Tratamiento capilar',60,22.00,'cabello');

-- =====================================================================
-- SEED: empleados (12)
-- =====================================================================
insert into empleados (id, negocio_id, nombre, cargo, avatar) values
('e1-1','n1','Lucía Vintimilla','Estilista senior','LV'),
('e1-2','n1','Diego Cabrera','Colorista','DC'),
('e2-1','n2','Carlos Ortega','Maestro barbero','CO'),
('e2-2','n2','Andrés Pesántez','Barbero','AP'),
('e3-1','n3','Daniela Tello','Manicurista','DT'),
('e3-2','n3','Paula Vélez','Nail artist','PV'),
('e8-1','n8','Patricia Ávila','Masajista terapéutica','PA'),
('e9-1','n9','Jonathan Cárdenas','Master barber','JC'),
('e9-2','n9','Mateo Rivera','Barbero','MR'),
('e14-1','n14','Sebastián Loja','Barbero senior','SL'),
('e17-1','n17','Anita Quito','Esteticista','AQ'),
('e19-1','n19','Tanya Wong','Masajista','TW');

-- =====================================================================
-- SEED: reservas demo del negocio n2 (Don Carlos Barbería)
-- Fechas relativas a "now()" para que el panel siempre tenga datos vivos
-- =====================================================================
insert into reservas (id, codigo, negocio_id, servicio_id, empleado_id, cliente_nombre, cliente_celular, fecha, duracion, precio, estado, metodo_pago) values
-- Hoy
('r-demo-1','NU-A4D1X','n2','s2-3','e2-1','Mateo Vintimilla','+593 99 234 5678',(current_date + time '09:30')::timestamptz,45,14.00,'confirmada','inapp'),
('r-demo-2','NU-B7K2P','n2','s2-1','e2-2','Carlos Andrade','+593 98 765 4321',(current_date + time '10:00')::timestamptz,30,8.00,'confirmada','local'),
('r-demo-3','NU-C9M4R','n2','s2-2','e2-1','Felipe Crespo','+593 97 111 2233',(current_date + time '11:00')::timestamptz,30,10.00,'confirmada','inapp'),
('r-demo-4','NU-D2N7T','n2','s2-3','e2-2','Diego Cordero','+593 99 888 7766',(current_date + time '12:00')::timestamptz,45,14.00,'confirmada','inapp'),
('r-demo-5','NU-E5P3W','n2','s2-1','e2-1','Renato Solano','+593 96 444 3322',(current_date + time '14:30')::timestamptz,30,8.00,'confirmada','local'),
('r-demo-6','NU-F8R1Y','n2','s2-4','e2-2','Sebastián Loja','+593 98 123 4567',(current_date + time '16:00')::timestamptz,25,6.00,'confirmada','inapp'),
('r-demo-7','NU-G3S9Z','n2','s2-3','e2-1','Luis Ortiz','+593 99 765 4321',(current_date + time '17:30')::timestamptz,45,14.00,'confirmada','inapp'),
-- Mañana
('r-demo-8','NU-H6T4A','n2','s2-2','e2-2','Andrés Pulla','+593 97 654 3210',(current_date + interval '1 day' + time '09:00')::timestamptz,30,10.00,'confirmada','inapp'),
('r-demo-9','NU-I1U7B','n2','s2-3','e2-1','Tomás Ávila','+593 98 222 1111',(current_date + interval '1 day' + time '11:30')::timestamptz,45,14.00,'confirmada','local'),
-- Ayer y antes (completadas para reportes)
('r-demo-p1','NU-J9V5C','n2','s2-1','e2-1','Rodrigo Pesantez','+593 99 555 6677',(current_date - interval '1 day' + time '10:00')::timestamptz,30,8.00,'completada','inapp'),
('r-demo-p2','NU-K4W8D','n2','s2-3','e2-2','Camilo Bermeo','+593 96 888 9999',(current_date - interval '1 day' + time '14:00')::timestamptz,45,14.00,'completada','inapp'),
('r-demo-p3','NU-L2X6E','n2','s2-2','e2-1','Pablo Toral','+593 99 111 2222',(current_date - interval '2 day' + time '16:30')::timestamptz,30,10.00,'completada','local');

-- =====================================================================
-- RLS · Row-Level Security
-- MVP sin auth: lectura pública. Escritura abierta SOLO mientras no haya
-- login. Cuando agregues auth: cambiar policies de insert/update/delete
-- a `auth.uid() is not null` o filtrar por dueño del negocio.
-- =====================================================================
alter table categorias enable row level security;
alter table negocios   enable row level security;
alter table servicios  enable row level security;
alter table empleados  enable row level security;
alter table reservas   enable row level security;

-- Lectura pública (anon + authenticated)
create policy "public read categorias" on categorias for select using (true);
create policy "public read negocios"   on negocios   for select using (true);
create policy "public read servicios"  on servicios  for select using (true);
create policy "public read empleados"  on empleados  for select using (true);
create policy "public read reservas"   on reservas   for select using (true);

-- Escritura abierta (MVP — endurecer al agregar auth)
create policy "open write negocios"  on negocios  for all using (true) with check (true);
create policy "open write servicios" on servicios for all using (true) with check (true);
create policy "open write empleados" on empleados for all using (true) with check (true);
create policy "open write reservas"  on reservas  for all using (true) with check (true);

-- =====================================================================
-- Done. Verificar:
--   select count(*) from negocios;   -- 20
--   select count(*) from servicios;  -- 60
--   select count(*) from empleados;  -- 12
--   select count(*) from reservas;   -- 12
-- =====================================================================
