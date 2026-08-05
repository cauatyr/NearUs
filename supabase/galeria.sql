-- =====================================================================
-- NearUs · Galería de fotos del negocio (idempotente, ADITIVO)
-- Ejecutar entero en Supabase SQL Editor. NO borra datos.
-- =====================================================================

-- Fotos extra que se muestran en el carrusel del detalle (`/explorar/[id]`),
-- después de `portada` e `imagen`. Array JSON de URLs, orden = orden de la
-- galería. Ej: ["/negocios/bigotte/fachada.jpg", "/negocios/bigotte/lounge.jpg"]
--
-- Se guardan URLs (no dataURL) a propósito: el store carga TODOS los negocios
-- en el boot, y meter base64 acá inflaría esa carga para todos los clientes.
alter table negocios add column if not exists galeria jsonb;

-- =====================================================================
-- Fotos de Bigotté Barbershop & Lounge (archivos servidos desde public/)
-- =====================================================================
update negocios
set
  portada = '/negocios/bigotte/fachada.jpg',
  imagen  = '/negocios/bigotte/barberos.jpg',
  galeria = '["/negocios/bigotte/lounge.jpg","/negocios/bigotte/dardos.jpg","/negocios/bigotte/terraza.jpg"]'::jsonb
where id = 'n-bigotte';
