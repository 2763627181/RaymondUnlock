-- Datos de ejemplo de Raymond Unlock. GENERADO desde el catálogo de prueba.
--
-- ATENCIÓN: precios, stock, tiempos, precios mayoristas y testimonios son
-- FICTICIOS. Reemplazarlos desde /admin antes de publicar. Es idempotente
-- (on conflict do nothing): no pisa lo que el dueño ya editó.

-- CATEGORÍAS Y MARCAS

insert into public.categories (id, slug, name, description, icon, image_url, parent_id, sort_order) values
  ('ddb7f49d-ca8c-5a0a-a4b1-0dc99ebf69df', 'celulares', 'Celulares', 'iPhone, Samsung Galaxy, Xiaomi, Google Pixel y Motorola: nuevos, open box y usados.', 'smartphone', null, null, 1),
  ('e920ada1-b5b2-5d51-b153-a75d4e58f291', 'tablets', 'Tablets', 'iPad y Galaxy Tab para trabajar, estudiar o entretenerte.', 'tablet', null, null, 2),
  ('82c4fa85-73e6-5f03-8239-5a079074a165', 'audio', 'Audio', 'AirPods, Galaxy Buds y audífonos para todos los presupuestos.', 'headphones', null, null, 3),
  ('857fabc4-fb72-59bb-b04c-c5491f79d68a', 'smartwatches', 'Smartwatches', 'Apple Watch y Galaxy Watch.', 'watch', null, null, 4),
  ('cdfd1a30-82eb-56c1-a7f2-2796746708e2', 'accesorios', 'Accesorios', 'Cargadores, cables, cases, protectores, power banks y memorias.', 'plug', null, null, 5),
  ('d86093e7-c4dd-5659-901e-b01dc4747e56', 'electronicos-varios', 'Electrónicos varios', 'Bocinas y otros artículos electrónicos.', 'speaker', null, null, 6),
  ('bbaae679-f7a6-5865-91c1-7fd78d9a9d46', 'cargadores-y-cables', 'Cargadores y cables', null, 'plug', null, 'cdfd1a30-82eb-56c1-a7f2-2796746708e2', 1),
  ('106da3f5-52e2-5d98-a1a6-28c1e382780f', 'cases-y-protectores', 'Cases y protectores', null, 'smartphone', null, 'cdfd1a30-82eb-56c1-a7f2-2796746708e2', 2)
on conflict do nothing;

insert into public.brands (id, slug, name, logo_url, sort_order) values
  ('9e0d3532-b601-5372-bab1-393112ef508e', 'apple', 'Apple', null, 1),
  ('5f1f5865-67a7-5b5a-a9cd-5cfa82e9ddc2', 'samsung', 'Samsung', null, 2),
  ('7df4f8b5-1ca8-5e8c-96d7-9a68a2542581', 'xiaomi', 'Xiaomi', null, 3),
  ('06c97acc-023a-5bd2-9a3b-11644367b517', 'google', 'Google', null, 4),
  ('8beb04db-bf18-5290-aabf-c29185509389', 'motorola', 'Motorola', null, 5),
  ('c727794e-ed22-5702-9f81-f9e0092d4317', 'anker', 'Anker', null, 6),
  ('30c12faf-a094-59b9-9984-c8003d627635', 'jbl', 'JBL', null, 7),
  ('f57df2b5-6101-5d8b-be9a-3e1b0a03008d', 'spigen', 'Spigen', null, 8)
on conflict do nothing;

-- PRODUCTOS, VARIANTES (con precio mayorista) E IMÁGENES

insert into public.products (id, slug, name, short_description, description, category_id, brand_id, condition, specs, is_featured, warranty_note, sort_order, created_at) values
  ('b123bc50-cd9a-5716-bef6-ac09dd5652d0', 'iphone-15-pro', 'iPhone 15 Pro', 'Diseño en titanio, chip A17 Pro y puerto USB-C.', 'El iPhone 15 Pro llega con un diseño en titanio, el chip A17 Pro y cámara principal de 48 MP.

- Pantalla Super Retina XDR con ProMotion
- Puerto USB-C
- Cámara con teleobjetivo 3x', 'ddb7f49d-ca8c-5a0a-a4b1-0dc99ebf69df', '9e0d3532-b601-5372-bab1-393112ef508e', 'nuevo', '{"Pantalla":"6.1\" Super Retina XDR OLED, ProMotion","Chip":"A17 Pro","Cámara principal":"48 MP","Conectividad":"5G, USB-C"}'::jsonb, true, 'Consulta las condiciones de garantía de este equipo por WhatsApp.', 1, '2026-08-01T12:00:00.000Z'),
  ('8a3ab91a-3145-5755-8efd-114355496639', 'iphone-15', 'iPhone 15', 'Dynamic Island, cámara de 48 MP y puerto USB-C.', 'El iPhone 15 trae la Dynamic Island, el chip A16 Bionic y una cámara principal de 48 MP.

- Puerto USB-C
- Pantalla Super Retina XDR
- Varios colores', 'ddb7f49d-ca8c-5a0a-a4b1-0dc99ebf69df', '9e0d3532-b601-5372-bab1-393112ef508e', 'nuevo', '{"Pantalla":"6.1\" Super Retina XDR OLED","Chip":"A16 Bionic","Cámara principal":"48 MP","Conectividad":"5G, USB-C"}'::jsonb, true, null, 2, '2026-07-31T12:00:00.000Z'),
  ('0df535a8-f3e7-5712-b755-bcf98ca9ae36', 'iphone-14', 'iPhone 14', 'Equipo open box con chip A15 Bionic.', 'iPhone 14 en condición open box: caja abierta, equipo sin uso.

- Chip A15 Bionic
- Cámara dual de 12 MP
- Detección de accidentes', 'ddb7f49d-ca8c-5a0a-a4b1-0dc99ebf69df', '9e0d3532-b601-5372-bab1-393112ef508e', 'open_box', '{"Pantalla":"6.1\" Super Retina XDR OLED","Chip":"A15 Bionic","Cámara principal":"12 MP","Conectividad":"5G, Lightning"}'::jsonb, false, null, 3, '2026-07-30T12:00:00.000Z'),
  ('cea84a52-5958-5a0a-a679-7ad185050323', 'iphone-13', 'iPhone 13', 'Reacondicionado, revisado y listo para usar.', 'iPhone 13 reacondicionado y revisado por nuestros técnicos.

- Chip A15 Bionic
- Cámara dual de 12 MP
- Ideal como primer iPhone', 'ddb7f49d-ca8c-5a0a-a4b1-0dc99ebf69df', '9e0d3532-b601-5372-bab1-393112ef508e', 'reacondicionado', '{"Pantalla":"6.1\" Super Retina XDR OLED","Chip":"A15 Bionic","Cámara principal":"12 MP","Conectividad":"5G, Lightning"}'::jsonb, false, null, 4, '2026-07-29T12:00:00.000Z'),
  ('f04ae3b8-c2c7-5b03-9337-196917a4771a', 'samsung-galaxy-s24-ultra', 'Samsung Galaxy S24 Ultra', 'Marco de titanio, cámara de 200 MP y S Pen incluido.', 'El tope de gama de Samsung con marco de titanio y S Pen integrado.

- Pantalla Dynamic AMOLED 2X de 6.8 pulgadas
- Cámara principal de 200 MP
- Funciones Galaxy AI', 'ddb7f49d-ca8c-5a0a-a4b1-0dc99ebf69df', '5f1f5865-67a7-5b5a-a9cd-5cfa82e9ddc2', 'nuevo', '{"Pantalla":"6.8\" Dynamic AMOLED 2X","Cámara principal":"200 MP","Extras":"S Pen incluido","Conectividad":"5G, USB-C"}'::jsonb, true, null, 5, '2026-07-28T12:00:00.000Z'),
  ('bc799509-53ab-5071-9081-f0f2ee27a29c', 'samsung-galaxy-s24', 'Samsung Galaxy S24', 'Compacto, potente y con Galaxy AI.', 'Un Galaxy compacto con pantalla Dynamic AMOLED 2X y funciones Galaxy AI.

- Cámara principal de 50 MP
- Pantalla de 6.2 pulgadas
- Carga por USB-C', 'ddb7f49d-ca8c-5a0a-a4b1-0dc99ebf69df', '5f1f5865-67a7-5b5a-a9cd-5cfa82e9ddc2', 'nuevo', '{"Pantalla":"6.2\" Dynamic AMOLED 2X","Cámara principal":"50 MP","Conectividad":"5G, USB-C"}'::jsonb, true, null, 6, '2026-07-27T12:00:00.000Z'),
  ('fbd2bfb3-79eb-55bd-a400-76616563938b', 'samsung-galaxy-a55-5g', 'Samsung Galaxy A55 5G', 'Pantalla Super AMOLED de 120 Hz y batería de 5,000 mAh.', 'Gama media con pantalla Super AMOLED y batería para todo el día.

- Pantalla de 6.6 pulgadas y 120 Hz
- Cámara principal de 50 MP
- Batería de 5,000 mAh', 'ddb7f49d-ca8c-5a0a-a4b1-0dc99ebf69df', '5f1f5865-67a7-5b5a-a9cd-5cfa82e9ddc2', 'nuevo', '{"Pantalla":"6.6\" Super AMOLED, 120 Hz","Cámara principal":"50 MP","Batería":"5,000 mAh","Conectividad":"5G"}'::jsonb, false, null, 7, '2026-07-26T12:00:00.000Z'),
  ('fbc65a14-7c92-5906-9620-1c298717f4c3', 'xiaomi-redmi-note-13-pro', 'Xiaomi Redmi Note 13 Pro', 'Cámara de 200 MP y pantalla AMOLED de 120 Hz.', 'Mucho equipo por lo que cuesta: cámara de 200 MP y pantalla AMOLED fluida.

- Pantalla de 6.67 pulgadas
- Batería de 5,100 mAh
- Carga rápida', 'ddb7f49d-ca8c-5a0a-a4b1-0dc99ebf69df', '7df4f8b5-1ca8-5e8c-96d7-9a68a2542581', 'nuevo', '{"Pantalla":"6.67\" AMOLED, 120 Hz","Cámara principal":"200 MP","Batería":"5,100 mAh"}'::jsonb, false, null, 8, '2026-07-25T12:00:00.000Z'),
  ('a0414a97-5235-5f47-9f95-0b65f6922fd9', 'google-pixel-8', 'Google Pixel 8', 'Chip Tensor G3 y años de actualizaciones de Google.', 'El Pixel 8 con el chip Tensor G3 y las funciones de fotografía de Google.

- Pantalla Actua OLED de 6.2 pulgadas
- Cámara principal de 50 MP
- Siete años de actualizaciones', 'ddb7f49d-ca8c-5a0a-a4b1-0dc99ebf69df', '06c97acc-023a-5bd2-9a3b-11644367b517', 'nuevo', '{"Pantalla":"6.2\" Actua OLED, 120 Hz","Chip":"Google Tensor G3","Cámara principal":"50 MP"}'::jsonb, false, null, 9, '2026-07-24T12:00:00.000Z'),
  ('5eb76f31-742c-5df0-9a77-15a02b259005', 'motorola-moto-g84-5g', 'Motorola Moto G84 5G', 'Pantalla pOLED de 120 Hz y 5G a buen precio.', 'Un Moto con pantalla pOLED y 5G para el día a día.

- Pantalla de 6.5 pulgadas y 120 Hz
- Cámara principal de 50 MP con estabilizador
- Batería de 5,000 mAh', 'ddb7f49d-ca8c-5a0a-a4b1-0dc99ebf69df', '8beb04db-bf18-5290-aabf-c29185509389', 'nuevo', '{"Pantalla":"6.5\" pOLED, 120 Hz","Cámara principal":"50 MP","Batería":"5,000 mAh","Conectividad":"5G"}'::jsonb, false, null, 10, '2026-07-23T12:00:00.000Z'),
  ('56557f93-fb43-5362-ab26-b489ad1b0eb0', 'ipad-10-generacion', 'iPad (10.ª generación)', 'Pantalla Liquid Retina de 10.9 pulgadas y USB-C.', 'El iPad para todos los días: estudiar, trabajar y ver contenido.

- Pantalla Liquid Retina de 10.9 pulgadas
- Chip A14 Bionic
- Puerto USB-C', 'e920ada1-b5b2-5d51-b153-a75d4e58f291', '9e0d3532-b601-5372-bab1-393112ef508e', 'nuevo', '{"Pantalla":"10.9\" Liquid Retina","Chip":"A14 Bionic","Conectividad":"Wi-Fi, USB-C"}'::jsonb, true, null, 11, '2026-07-22T12:00:00.000Z'),
  ('956481a8-38d0-5ba1-a1ea-6d6a326579ee', 'ipad-air-m2', 'iPad Air (M2)', 'Chip M2 en un iPad delgado y ligero.', 'Potencia del chip M2 en un formato ligero.

- Pantalla Liquid Retina de 11 pulgadas
- Chip M2
- Compatible con Apple Pencil', 'e920ada1-b5b2-5d51-b153-a75d4e58f291', '9e0d3532-b601-5372-bab1-393112ef508e', 'nuevo', '{"Pantalla":"11\" Liquid Retina","Chip":"Apple M2","Conectividad":"Wi-Fi, USB-C"}'::jsonb, false, null, 12, '2026-07-21T12:00:00.000Z'),
  ('baaf4d0a-267d-5495-a8e4-ab5ca4856284', 'samsung-galaxy-tab-s9-fe', 'Samsung Galaxy Tab S9 FE', 'Resistente al agua y con S Pen incluido.', 'Una tablet Android versátil con S Pen incluido y resistencia al agua y al polvo.

- Pantalla de 10.9 pulgadas
- Certificación IP68
- S Pen incluido', 'e920ada1-b5b2-5d51-b153-a75d4e58f291', '5f1f5865-67a7-5b5a-a9cd-5cfa82e9ddc2', 'nuevo', '{"Pantalla":"10.9\" LCD, 90 Hz","Resistencia":"IP68","Extras":"S Pen incluido"}'::jsonb, false, null, 13, '2026-07-20T12:00:00.000Z'),
  ('0a32025d-1b49-57fa-b129-94d2b3ab8199', 'airpods-pro-2', 'AirPods Pro (2.ª generación)', 'Cancelación activa de ruido y estuche con USB-C.', 'Los AirPods Pro con cancelación activa de ruido y audio adaptativo.

- Chip H2
- Estuche de carga con USB-C
- Resistencia al agua y al polvo IP54', '82c4fa85-73e6-5f03-8239-5a079074a165', '9e0d3532-b601-5372-bab1-393112ef508e', 'nuevo', '{"Cancelación":"Cancelación activa de ruido","Chip":"H2","Carga":"Estuche USB-C"}'::jsonb, true, null, 14, '2026-07-19T12:00:00.000Z'),
  ('76c23c90-de18-57f4-aa40-306fd3a33da8', 'airpods-3-generacion', 'AirPods (3.ª generación)', 'Audio espacial y hasta 6 horas de reproducción.', 'AirPods con diseño ergonómico y audio espacial.

- Hasta 6 horas de reproducción
- Resistencia al sudor y al agua IPX4
- Estuche de carga MagSafe', '82c4fa85-73e6-5f03-8239-5a079074a165', '9e0d3532-b601-5372-bab1-393112ef508e', 'nuevo', '{"Audio":"Audio espacial","Resistencia":"IPX4","Autonomía":"Hasta 6 horas"}'::jsonb, false, null, 15, '2026-07-18T12:00:00.000Z'),
  ('81272e67-f0a1-5813-aa14-f5c5fa0ee21f', 'airpods-max', 'AirPods Max', 'Audífonos over-ear con cancelación activa de ruido.', 'Audífonos de diadema con cancelación activa de ruido y audio espacial.

- Hasta 20 horas de reproducción
- Almohadillas de espuma viscoelástica
- Varios colores', '82c4fa85-73e6-5f03-8239-5a079074a165', '9e0d3532-b601-5372-bab1-393112ef508e', 'nuevo', '{"Tipo":"Over-ear inalámbricos","Cancelación":"Cancelación activa de ruido","Autonomía":"Hasta 20 horas"}'::jsonb, false, null, 16, '2026-07-17T12:00:00.000Z'),
  ('61315ddf-e67b-5b24-ab24-bf54f39f0a05', 'samsung-galaxy-buds2-pro', 'Samsung Galaxy Buds2 Pro', 'Cancelación de ruido y audio de alta resolución.', 'Los Buds2 Pro con cancelación activa de ruido y sonido de 24 bits.

- Resistencia al agua IPX7
- Diseño ergonómico
- Estuche de carga', '82c4fa85-73e6-5f03-8239-5a079074a165', '5f1f5865-67a7-5b5a-a9cd-5cfa82e9ddc2', 'nuevo', '{"Cancelación":"Cancelación activa de ruido","Audio":"24 bits","Resistencia":"IPX7"}'::jsonb, false, null, 17, '2026-07-16T12:00:00.000Z'),
  ('5e0bc14c-0903-561c-8a04-5fd86607b21f', 'jbl-tune-520bt', 'JBL Tune 520BT', 'Audífonos inalámbricos con hasta 57 horas de batería.', 'Audífonos on-ear con el sonido JBL Pure Bass.

- Hasta 57 horas de reproducción
- Bluetooth 5.3
- Plegables y livianos', '82c4fa85-73e6-5f03-8239-5a079074a165', '30c12faf-a094-59b9-9984-c8003d627635', 'nuevo', '{"Tipo":"On-ear inalámbricos","Autonomía":"Hasta 57 horas","Conectividad":"Bluetooth 5.3"}'::jsonb, false, null, 18, '2026-07-15T12:00:00.000Z'),
  ('cc2ea621-ae6b-5527-acf5-49b0660204dd', 'apple-watch-series-9', 'Apple Watch Series 9', 'Chip S9 y pantalla más brillante.', 'El Apple Watch Series 9 con el chip S9 y el gesto de doble toque.

- Pantalla siempre activa
- Seguimiento de actividad y salud
- Resistente al agua', '857fabc4-fb72-59bb-b04c-c5491f79d68a', '9e0d3532-b601-5372-bab1-393112ef508e', 'nuevo', '{"Chip":"S9 SiP","Pantalla":"Retina siempre activa","Extras":"Gesto de doble toque"}'::jsonb, true, null, 19, '2026-07-14T12:00:00.000Z'),
  ('eb1d2344-8238-5d80-837a-3fa8c8d8f557', 'apple-watch-se-2', 'Apple Watch SE (2.ª generación)', 'Lo esencial del Apple Watch a mejor precio.', 'El Apple Watch SE ofrece seguimiento de actividad, notificaciones y detección de choques.

- Pantalla Retina
- Resistente al agua
- Detección de choques', '857fabc4-fb72-59bb-b04c-c5491f79d68a', '9e0d3532-b601-5372-bab1-393112ef508e', 'nuevo', '{"Chip":"S8 SiP","Extras":"Detección de choques"}'::jsonb, false, null, 20, '2026-07-13T12:00:00.000Z'),
  ('96be9365-f30e-53d5-9095-75c17210523e', 'samsung-galaxy-watch6', 'Samsung Galaxy Watch6', 'Wear OS, pantalla Super AMOLED y seguimiento de salud.', 'El Galaxy Watch6 con Wear OS y una pantalla Super AMOLED más grande.

- Seguimiento de sueño y ejercicio
- Compatible con teléfonos Android
- Resistente al agua', '857fabc4-fb72-59bb-b04c-c5491f79d68a', '5f1f5865-67a7-5b5a-a9cd-5cfa82e9ddc2', 'nuevo', '{"Sistema":"Wear OS","Pantalla":"Super AMOLED"}'::jsonb, false, null, 21, '2026-07-12T12:00:00.000Z'),
  ('a78f9a4c-1f60-5e34-a813-77261b7b33fc', 'cargador-rapido-usb-c-20w', 'Cargador rápido USB-C 20W', 'Carga rápida para iPhone, iPad y Android con USB-C.', 'Cargador de pared compacto con salida USB-C de 20 W.

- Carga rápida
- Tamaño compacto
- Compatible con equipos USB-C', 'bbaae679-f7a6-5865-91c1-7fd78d9a9d46', null, 'nuevo', '{"Potencia":"20 W","Puerto":"USB-C"}'::jsonb, false, null, 22, '2026-07-11T12:00:00.000Z'),
  ('55d8eadc-2818-5ea1-9abf-c10f5a739d17', 'cable-usb-c-a-lightning', 'Cable USB-C a Lightning', 'Carga y sincroniza tu iPhone.', 'Cable USB-C a Lightning para cargar y sincronizar.

- Compatible con carga rápida
- Disponible en 1 y 2 metros', 'bbaae679-f7a6-5865-91c1-7fd78d9a9d46', null, 'nuevo', '{"Conectores":"USB-C a Lightning"}'::jsonb, false, null, 23, '2026-07-10T12:00:00.000Z'),
  ('dfe71d00-963e-5a07-8c08-f97ee8ac6dfc', 'case-spigen-ultra-hybrid-iphone-15', 'Case Spigen Ultra Hybrid para iPhone 15', 'Case transparente con esquinas reforzadas.', 'Case transparente que deja ver el color de tu iPhone.

- Esquinas con tecnología Air Cushion
- Bordes elevados para proteger pantalla y cámara', '106da3f5-52e2-5d98-a1a6-28c1e382780f', 'f57df2b5-6101-5d8b-be9a-3e1b0a03008d', 'nuevo', '{"Material":"Policarbonato y TPU","Acabado":"Transparente"}'::jsonb, false, null, 24, '2026-07-09T12:00:00.000Z'),
  ('513609c4-0a8f-55cc-ad9e-6516c1ee85b9', 'power-bank-anker-10000-mah', 'Power bank Anker 10,000 mAh', 'Batería portátil de 10,000 mAh.', 'Batería externa compacta para cargar tu celular fuera de casa.

- Capacidad de 10,000 mAh
- Tamaño de bolsillo', 'cdfd1a30-82eb-56c1-a7f2-2796746708e2', 'c727794e-ed22-5702-9f81-f9e0092d4317', 'nuevo', '{"Capacidad":"10,000 mAh"}'::jsonb, false, null, 25, '2026-07-08T12:00:00.000Z'),
  ('7f97ba2a-11b6-51e2-89f5-53370162e482', 'microsd-samsung-evo-select', 'Memoria microSD Samsung EVO Select', 'Tarjeta microSD Clase 10 con adaptador.', 'Tarjeta microSD para ampliar el almacenamiento de tu celular, cámara o consola.

- Clase 10, U3
- Incluye adaptador SD', 'cdfd1a30-82eb-56c1-a7f2-2796746708e2', '5f1f5865-67a7-5b5a-a9cd-5cfa82e9ddc2', 'nuevo', '{"Clase":"10, U3","Incluye":"Adaptador SD"}'::jsonb, false, null, 26, '2026-07-07T12:00:00.000Z'),
  ('72c358ce-2ee9-56de-b361-a608fee32936', 'bocina-bluetooth-jbl-go-3', 'Bocina Bluetooth JBL Go 3', 'Bocina portátil resistente al agua y al polvo.', 'Bocina Bluetooth pequeña con mucho sonido.

- Resistencia IP67
- Hasta 5 horas de reproducción
- Correa integrada', 'd86093e7-c4dd-5659-901e-b01dc4747e56', '30c12faf-a094-59b9-9984-c8003d627635', 'nuevo', '{"Resistencia":"IP67","Autonomía":"Hasta 5 horas","Conectividad":"Bluetooth"}'::jsonb, false, null, 27, '2026-07-06T12:00:00.000Z')
on conflict do nothing;

insert into public.product_variants (id, product_id, sku, capacity, color, color_hex, price_retail, price_wholesale, compare_at_price, min_wholesale_qty, stock, sort_order) values
  ('6e700b3a-6489-5051-b4bc-d322b1fbfa2f', 'b123bc50-cd9a-5716-bef6-ac09dd5652d0', 'RU-IPHONE-15-PRO-1', '128 GB', 'Titanio natural', '#B7AFA3', 74900, 67410, 79900, 3, 6, 1),
  ('997929a2-09a1-59b0-8295-70c4f4324414', 'b123bc50-cd9a-5716-bef6-ac09dd5652d0', 'RU-IPHONE-15-PRO-2', '256 GB', 'Titanio natural', '#B7AFA3', 84900, 76410, null, 3, 4, 2),
  ('d5f49db1-76b8-553d-aafa-ab2d17acb61e', 'b123bc50-cd9a-5716-bef6-ac09dd5652d0', 'RU-IPHONE-15-PRO-3', '256 GB', 'Titanio azul', '#3D4A5A', 84900, 76410, null, 3, 0, 3),
  ('ecfaa147-f53c-5460-ba20-f2baf6f9cdf2', 'b123bc50-cd9a-5716-bef6-ac09dd5652d0', 'RU-IPHONE-15-PRO-4', '512 GB', 'Titanio negro', '#2E2F31', 99900, 89910, null, 3, 2, 4),
  ('09a09bcc-8879-5371-b5a1-8c68d9ddc759', '8a3ab91a-3145-5755-8efd-114355496639', 'RU-IPHONE-15-1', '128 GB', 'Negro', '#2B2B2D', 62900, 56610, null, 3, 8, 1),
  ('8a5e3b10-6ce3-5e9a-96b1-67aa9f97d6ec', '8a3ab91a-3145-5755-8efd-114355496639', 'RU-IPHONE-15-2', '128 GB', 'Azul', '#A9C4D9', 62900, 56610, null, 3, 5, 2),
  ('621402ce-f4a5-59fb-be49-4ce030d81979', '8a3ab91a-3145-5755-8efd-114355496639', 'RU-IPHONE-15-3', '256 GB', 'Rosa', '#F2D3D2', 70900, 63810, null, 3, 3, 3),
  ('c8895d10-9094-5cb6-9ec1-91d6673d33c0', '0df535a8-f3e7-5712-b755-bcf98ca9ae36', 'RU-IPHONE-14-1', '128 GB', 'Medianoche', '#26282C', 46900, 42210, 52900, 3, 3, 1),
  ('63b30f12-5084-5b82-b944-76eb372fab86', '0df535a8-f3e7-5712-b755-bcf98ca9ae36', 'RU-IPHONE-14-2', '128 GB', 'Azul', '#A7C0DC', 46900, 42210, null, 3, 2, 2),
  ('221fc361-ae54-5526-ad1f-bad986f331ca', 'cea84a52-5958-5a0a-a679-7ad185050323', 'RU-IPHONE-13-1', '128 GB', 'Medianoche', '#26282C', 34900, 31410, null, 3, 4, 1),
  ('53700840-c16c-5156-8c78-6d0624a7c8a2', 'cea84a52-5958-5a0a-a679-7ad185050323', 'RU-IPHONE-13-2', '128 GB', 'Rosa', '#F2D3D2', 34900, 31410, 39900, 3, 2, 2),
  ('86206c4b-834b-591f-b689-221f330a2090', 'f04ae3b8-c2c7-5b03-9337-196917a4771a', 'RU-SAMSUNG-GALAXY-S24-ULTRA-1', '256 GB', 'Titanio negro', '#2F3033', 82900, 74610, null, 3, 5, 1),
  ('dda1e22b-8334-5601-a67a-8ccf3593f555', 'f04ae3b8-c2c7-5b03-9337-196917a4771a', 'RU-SAMSUNG-GALAXY-S24-ULTRA-2', '256 GB', 'Titanio gris', '#8A8C8F', 82900, 74610, null, 3, 3, 2),
  ('21ee9861-5514-5210-a960-462be45aeeee', 'f04ae3b8-c2c7-5b03-9337-196917a4771a', 'RU-SAMSUNG-GALAXY-S24-ULTRA-3', '512 GB', 'Titanio negro', '#2F3033', 94900, 85410, null, 3, 2, 3),
  ('b35139a0-cba1-5083-a3ad-2768cce2a976', 'bc799509-53ab-5071-9081-f0f2ee27a29c', 'RU-SAMSUNG-GALAXY-S24-1', '128 GB', 'Onyx', '#1F1F21', 54900, 49410, 59900, 3, 6, 1),
  ('29deff0a-882c-533d-823a-772927a7b999', 'bc799509-53ab-5071-9081-f0f2ee27a29c', 'RU-SAMSUNG-GALAXY-S24-2', '256 GB', 'Gris mármol', '#C9CACC', 61900, 55710, null, 3, 4, 2),
  ('074b8812-a5cb-5723-916f-33953f65a8d0', 'bc799509-53ab-5071-9081-f0f2ee27a29c', 'RU-SAMSUNG-GALAXY-S24-3', '256 GB', 'Violeta cobalto', '#B8A9D9', 61900, 55710, null, 3, 0, 3),
  ('349489d4-0220-5056-a089-f26a4074e21f', 'fbd2bfb3-79eb-55bd-a400-76616563938b', 'RU-SAMSUNG-GALAXY-A55-5G-1', '128 GB', 'Azul claro', '#B9CBE0', 24900, 22410, null, 5, 10, 1),
  ('db360eec-62a2-5994-8020-dd59094573a5', 'fbd2bfb3-79eb-55bd-a400-76616563938b', 'RU-SAMSUNG-GALAXY-A55-5G-2', '256 GB', 'Negro', '#2B2C2F', 28900, 26010, null, 5, 7, 2),
  ('c7b233a0-f291-59b5-9a63-cfd8c6b88323', 'fbc65a14-7c92-5906-9620-1c298717f4c3', 'RU-XIAOMI-REDMI-NOTE-13-PRO-1', '256 GB', 'Negro medianoche', '#1E1F22', 19900, 17910, 22900, 5, 12, 1),
  ('8f75d676-f8e7-595e-aee8-c93bd13c59b2', 'fbc65a14-7c92-5906-9620-1c298717f4c3', 'RU-XIAOMI-REDMI-NOTE-13-PRO-2', '256 GB', 'Púrpura aurora', '#B7A4D6', 19900, 17910, null, 5, 6, 2),
  ('87f36310-8a7a-5b35-a8bd-4a4e9f4f6fef', 'fbc65a14-7c92-5906-9620-1c298717f4c3', 'RU-XIAOMI-REDMI-NOTE-13-PRO-3', '256 GB', 'Turquesa océano', '#7FBFC0', 19900, 17910, null, 5, 4, 3),
  ('4784fd11-2ece-53fd-9d1d-5b38d8db1d9f', 'a0414a97-5235-5f47-9f95-0b65f6922fd9', 'RU-GOOGLE-PIXEL-8-1', '128 GB', 'Obsidiana', '#232326', 42900, 38610, null, 3, 3, 1),
  ('03e53b71-b504-540a-be0b-f80f63e62718', 'a0414a97-5235-5f47-9f95-0b65f6922fd9', 'RU-GOOGLE-PIXEL-8-2', '256 GB', 'Avellana', '#A8AD9B', 47900, 43110, null, 3, 2, 2),
  ('3e02e44a-ee53-5c6a-9000-6f6b426c1913', '5eb76f31-742c-5df0-9a77-15a02b259005', 'RU-MOTOROLA-MOTO-G84-5G-1', '256 GB', 'Azul medianoche', '#1D2A4A', 16900, 15210, null, 5, 9, 1),
  ('fb9c8758-dc97-5857-93a9-53f0ee7c593e', '5eb76f31-742c-5df0-9a77-15a02b259005', 'RU-MOTOROLA-MOTO-G84-5G-2', '256 GB', 'Magenta', '#B0315F', 16900, 15210, null, 5, 5, 2),
  ('49cb204b-dd5b-5f62-bb07-57254ee4fe86', '56557f93-fb43-5362-ab26-b489ad1b0eb0', 'RU-IPAD-10-GENERACION-1', '64 GB', 'Azul', '#9DB8D6', 27900, 25110, null, 3, 5, 1),
  ('92ff8442-1f0e-51e6-a4f9-630e5fdb345a', '56557f93-fb43-5362-ab26-b489ad1b0eb0', 'RU-IPAD-10-GENERACION-2', '64 GB', 'Plata', '#E2E3E5', 27900, 25110, null, 3, 3, 2),
  ('41c86586-73fa-5171-b7f4-4b566681e747', '56557f93-fb43-5362-ab26-b489ad1b0eb0', 'RU-IPAD-10-GENERACION-3', '256 GB', 'Plata', '#E2E3E5', 38900, 35010, null, 3, 2, 3),
  ('387b52b9-6998-563e-b7e3-9338151ca4ca', '956481a8-38d0-5ba1-a1ea-6d6a326579ee', 'RU-IPAD-AIR-M2-1', '128 GB', 'Gris espacial', '#5A5B5E', 49900, 44910, null, 3, 3, 1),
  ('f958c581-f06b-5daa-8796-ce2de6ce5d33', '956481a8-38d0-5ba1-a1ea-6d6a326579ee', 'RU-IPAD-AIR-M2-2', '256 GB', 'Azul', '#9DB2D3', 56900, 51210, null, 3, 2, 2),
  ('c79e8110-8a55-5371-b11f-6f95d7358979', 'baaf4d0a-267d-5495-a8e4-ab5ca4856284', 'RU-SAMSUNG-GALAXY-TAB-S9-FE-1', '128 GB', 'Gris', '#7C7E82', 27900, 25110, 30900, 3, 4, 1),
  ('7a140fa0-5c74-5c31-a901-3dabd065752e', 'baaf4d0a-267d-5495-a8e4-ab5ca4856284', 'RU-SAMSUNG-GALAXY-TAB-S9-FE-2', '256 GB', 'Menta', '#B8DDCB', 32900, 29610, null, 3, 2, 2),
  ('d5cdb7eb-fddf-5074-8028-e446864dcb61', '0a32025d-1b49-57fa-b129-94d2b3ab8199', 'RU-AIRPODS-PRO-2-1', null, 'Blanco', '#F4F4F5', 15900, 14310, null, 5, 12, 1),
  ('2ca0be65-44f1-5c91-8464-da8835765ccf', '76c23c90-de18-57f4-aa40-306fd3a33da8', 'RU-AIRPODS-3-GENERACION-1', null, 'Blanco', '#F4F4F5', 12900, 11610, 13900, 5, 8, 1),
  ('25202cce-cacf-5443-a1a3-8d7548313e1a', '81272e67-f0a1-5813-aa14-f5c5fa0ee21f', 'RU-AIRPODS-MAX-1', null, 'Gris espacial', '#5B5C60', 38900, 35010, null, 3, 3, 1),
  ('a46e2fba-57ee-5d0b-9892-892769375efd', '81272e67-f0a1-5813-aa14-f5c5fa0ee21f', 'RU-AIRPODS-MAX-2', null, 'Plata', '#DADCDF', 38900, 35010, null, 3, 2, 2),
  ('ed4d10af-c2a6-5f66-be92-050c1591f667', '81272e67-f0a1-5813-aa14-f5c5fa0ee21f', 'RU-AIRPODS-MAX-3', null, 'Azul cielo', '#A8C4DC', 38900, 35010, null, 3, 0, 3),
  ('ad99fb46-4efd-5440-ba49-b72d4af9afeb', '81272e67-f0a1-5813-aa14-f5c5fa0ee21f', 'RU-AIRPODS-MAX-4', null, 'Verde', '#B7D4C2', 38900, 35010, null, 3, 1, 4),
  ('64d46970-ad0c-5ccb-868e-49e543d72dde', '61315ddf-e67b-5b24-ab24-bf54f39f0a05', 'RU-SAMSUNG-GALAXY-BUDS2-PRO-1', null, 'Grafito', '#333437', 9900, 8910, 11900, 5, 7, 1),
  ('a834ab34-fd0b-57ba-9513-347f8aff90bc', '61315ddf-e67b-5b24-ab24-bf54f39f0a05', 'RU-SAMSUNG-GALAXY-BUDS2-PRO-2', null, 'Blanco', '#F1F1F2', 9900, 8910, null, 5, 5, 2),
  ('5a85acf7-526f-51ec-8f50-6e3878109a48', '61315ddf-e67b-5b24-ab24-bf54f39f0a05', 'RU-SAMSUNG-GALAXY-BUDS2-PRO-3', null, 'Púrpura bora', '#C7B8E0', 9900, 8910, null, 5, 3, 3),
  ('3a91f4c5-089c-536d-bd64-e4d641d80e09', '5e0bc14c-0903-561c-8a04-5fd86607b21f', 'RU-JBL-TUNE-520BT-1', null, 'Negro', '#232326', 3900, 3510, null, 10, 15, 1),
  ('b489c5ff-73f3-5ffb-a352-4aaf11154519', '5e0bc14c-0903-561c-8a04-5fd86607b21f', 'RU-JBL-TUNE-520BT-2', null, 'Blanco', '#F1F1F2', 3900, 3510, null, 10, 9, 2),
  ('2627b78a-219a-57b0-858f-6c2f06d759f5', '5e0bc14c-0903-561c-8a04-5fd86607b21f', 'RU-JBL-TUNE-520BT-3', null, 'Azul', '#3B6EA5', 3900, 3510, null, 10, 6, 3),
  ('8bae9d8c-02c7-5578-9297-27ef5ee7931e', 'cc2ea621-ae6b-5527-acf5-49b0660204dd', 'RU-APPLE-WATCH-SERIES-9-1', '41 mm', 'Medianoche', '#26292E', 27900, 25110, null, 3, 4, 1),
  ('cfd90a89-9898-5287-a8ff-5a5bfe4c3685', 'cc2ea621-ae6b-5527-acf5-49b0660204dd', 'RU-APPLE-WATCH-SERIES-9-2', '45 mm', 'Medianoche', '#26292E', 30900, 27810, null, 3, 3, 2),
  ('55d35eb1-adcc-58ff-9ec2-eae2de497d49', 'cc2ea621-ae6b-5527-acf5-49b0660204dd', 'RU-APPLE-WATCH-SERIES-9-3', '45 mm', 'Blanco estelar', '#E8E1D5', 30900, 27810, null, 3, 0, 3),
  ('49d724d5-c367-525b-9a11-891f72dd78a4', 'eb1d2344-8238-5d80-837a-3fa8c8d8f557', 'RU-APPLE-WATCH-SE-2-1', '40 mm', 'Medianoche', '#26292E', 17900, 16110, null, 3, 5, 1),
  ('bc038073-8572-5fcc-aa22-536f878793a9', 'eb1d2344-8238-5d80-837a-3fa8c8d8f557', 'RU-APPLE-WATCH-SE-2-2', '44 mm', 'Medianoche', '#26292E', 19900, 17910, 21900, 3, 4, 2),
  ('cafab804-c71b-5568-aea1-e05ca84ced60', '96be9365-f30e-53d5-9095-75c17210523e', 'RU-SAMSUNG-GALAXY-WATCH6-1', '40 mm', 'Grafito', '#3A3B3E', 15900, 14310, null, 3, 4, 1),
  ('2054e73e-60b7-5dab-abdf-e4c6848169b6', '96be9365-f30e-53d5-9095-75c17210523e', 'RU-SAMSUNG-GALAXY-WATCH6-2', '44 mm', 'Plata', '#D9DADC', 17900, 16110, null, 3, 3, 2),
  ('405141ea-becd-5e1f-9147-b17e7ea597d7', 'a78f9a4c-1f60-5e34-a813-77261b7b33fc', 'RU-CARGADOR-RAPIDO-USB-C-20W-1', null, 'Blanco', '#F4F4F5', 1190, 1070, null, 20, 40, 1),
  ('2635ddc4-856c-58d2-8242-413865b89472', '55d8eadc-2818-5ea1-9abf-c10f5a739d17', 'RU-CABLE-USB-C-A-LIGHTNING-1', '1 m', 'Blanco', '#F4F4F5', 890, 800, null, 20, 50, 1),
  ('f42fe3c0-32d5-5de7-8f8a-50b1d44f5591', '55d8eadc-2818-5ea1-9abf-c10f5a739d17', 'RU-CABLE-USB-C-A-LIGHTNING-2', '2 m', 'Blanco', '#F4F4F5', 1190, 1070, null, 20, 30, 2),
  ('14dd4692-88db-542f-8455-d3877dab8d08', 'dfe71d00-963e-5a07-8c08-f97ee8ac6dfc', 'RU-CASE-SPIGEN-ULTRA-HYBRID-IPHONE-15-1', 'iPhone 15', 'Transparente', '#D8DCE2', 1490, 1340, null, 10, 14, 1),
  ('cf5bb851-5e30-5006-8890-da95ff2eb711', 'dfe71d00-963e-5a07-8c08-f97ee8ac6dfc', 'RU-CASE-SPIGEN-ULTRA-HYBRID-IPHONE-15-2', 'iPhone 15 Pro', 'Transparente', '#D8DCE2', 1590, 1430, null, 10, 9, 2),
  ('96ba352a-484b-5b0b-9425-e33fbb922194', 'dfe71d00-963e-5a07-8c08-f97ee8ac6dfc', 'RU-CASE-SPIGEN-ULTRA-HYBRID-IPHONE-15-3', 'iPhone 15 Pro Max', 'Transparente', '#D8DCE2', 1690, 1520, null, 10, 6, 3),
  ('25460b3b-b036-5968-963c-abc1ab216725', '513609c4-0a8f-55cc-ad9e-6516c1ee85b9', 'RU-POWER-BANK-ANKER-10000-MAH-1', null, 'Negro', '#232326', 2900, 2610, null, 10, 18, 1),
  ('e4b3062d-c4b9-57ce-9fe3-153fab821936', '513609c4-0a8f-55cc-ad9e-6516c1ee85b9', 'RU-POWER-BANK-ANKER-10000-MAH-2', null, 'Blanco', '#F1F1F2', 2900, 2610, null, 10, 10, 2),
  ('96adf300-e3ac-511e-9f3b-339c7f25d6b6', '7f97ba2a-11b6-51e2-89f5-53370162e482', 'RU-MICROSD-SAMSUNG-EVO-SELECT-1', '64 GB', null, null, 890, 800, null, 10, 25, 1),
  ('edd6c729-3e48-5772-8ae3-29a7a9b794cf', '7f97ba2a-11b6-51e2-89f5-53370162e482', 'RU-MICROSD-SAMSUNG-EVO-SELECT-2', '128 GB', null, null, 1290, 1160, null, 10, 20, 2),
  ('8de3974d-fbca-5642-9719-55ccd12132e7', '7f97ba2a-11b6-51e2-89f5-53370162e482', 'RU-MICROSD-SAMSUNG-EVO-SELECT-3', '256 GB', null, null, 2190, 1970, null, 10, 8, 3),
  ('648990f2-a5f1-5039-877e-b206eeb91817', '72c358ce-2ee9-56de-b361-a608fee32936', 'RU-BOCINA-BLUETOOTH-JBL-GO-3-1', null, 'Negro', '#232326', 3490, 3140, 3990, 5, 16, 1),
  ('aa893aa7-def5-562e-a15d-b68606127b0f', '72c358ce-2ee9-56de-b361-a608fee32936', 'RU-BOCINA-BLUETOOTH-JBL-GO-3-2', null, 'Azul', '#3B6EA5', 3490, 3140, null, 5, 8, 2),
  ('d2722150-6ace-5fad-93c4-51aacf93f499', '72c358ce-2ee9-56de-b361-a608fee32936', 'RU-BOCINA-BLUETOOTH-JBL-GO-3-3', null, 'Rojo', '#C8323A', 3490, 3140, null, 5, 5, 3)
on conflict do nothing;

insert into public.product_images (id, product_id, variant_id, url, alt, sort_order) values
  ('cc3623e2-797f-5e00-9166-e37c4be6e857', 'b123bc50-cd9a-5716-bef6-ac09dd5652d0', null, '/seed/phone-back.svg', 'iPhone 15 Pro visto por detrás (ilustración de ejemplo)', 1),
  ('80574f9c-055a-5d41-b1e5-e9dd85c64c80', 'b123bc50-cd9a-5716-bef6-ac09dd5652d0', null, '/seed/phone-front.svg', 'iPhone 15 Pro visto de frente (ilustración de ejemplo)', 2)
on conflict do nothing;

-- SERVICIOS TÉCNICOS Y BANNERS

insert into public.services (id, slug, name, description, icon, price_from, turnaround, device_types, sort_order) values
  ('d1d9f783-3730-530b-86e2-b8b222e138e3', 'desbloqueo-de-celulares', 'Desbloqueo de celulares', 'Liberamos tu equipo para que lo uses con cualquier compañía. Te decimos si es posible antes de empezar.', 'lock', 1500, 'Mismo día', array['iPhone', 'Samsung', 'Xiaomi', 'Motorola']::text[], 1),
  ('4eb55603-c9b0-5829-ad76-450872bc4eec', 'cambio-de-pantalla', 'Cambio de pantalla', 'Pantalla rota, con líneas o sin respuesta al tacto. Diagnosticamos y te damos el precio antes de reparar.', 'smartphone', 3500, 'Mismo día a 24 horas', array['iPhone', 'Samsung', 'Xiaomi', 'Motorola', 'iPad']::text[], 2),
  ('9011eb55-9b69-5dde-8a57-6771f0057eea', 'cambio-de-bateria', 'Cambio de batería', 'Si tu celular se apaga solo o no te dura el día, una batería nueva le devuelve la autonomía.', 'battery', 1800, 'Mismo día', array['iPhone', 'Samsung', 'Xiaomi', 'Motorola', 'iPad']::text[], 3),
  ('07265c6a-d826-54c7-b09a-21bd447e103a', 'cambio-de-pin-de-carga', 'Cambio de pin de carga', 'Cuando el cargador no hace contacto o el equipo no carga, revisamos y cambiamos el pin de carga.', 'plug', 1500, 'Mismo día', array['iPhone', 'Samsung', 'Xiaomi', 'Motorola']::text[], 4),
  ('0a6e30be-38cf-53d8-8a88-1887544e92ae', 'dano-por-liquido', 'Daño por líquido', 'Se mojó tu celular: apágalo y tráelo lo antes posible. Limpiamos y revisamos los componentes afectados.', 'droplets', 2000, '24 a 72 horas', array['iPhone', 'Samsung', 'Xiaomi', 'Motorola']::text[], 5),
  ('6cf36aef-238c-5702-9f44-a629f4d5c396', 'software-y-flasheo', 'Software y flasheo', 'Actualizaciones, equipos que no encienden por software, reinstalación del sistema y más.', 'cpu', 1200, 'Mismo día', array['iPhone', 'Samsung', 'Xiaomi', 'Motorola']::text[], 6),
  ('732b8c2b-03fc-5c71-9691-45e41a95396b', 'cambio-de-cristal-trasero', 'Cambio de cristal trasero', '¿La tapa trasera está quebrada? La reemplazamos para que tu equipo vuelva a verse bien.', 'smartphone', 2500, '24 a 48 horas', array['iPhone', 'Samsung']::text[], 7),
  ('f598acd1-b0de-5c61-8bb5-189c682e2dd6', 'reparacion-de-camara', 'Reparación de cámara', 'Fotos borrosas, cámara que no abre o lente rota: revisamos el módulo y lo reparamos o lo cambiamos.', 'camera', 2800, '24 a 48 horas', array['iPhone', 'Samsung', 'Xiaomi', 'Motorola']::text[], 8)
on conflict do nothing;

insert into public.banners (id, title, subtitle, image_url, cta_label, cta_href, theme, sort_order) values
  ('1f50eead-1603-5705-9221-8098451c59ef', 'iPhone 15 Pro', 'Titanio. Chip A17 Pro. Disponible en varias capacidades.', '/seed/hero-phone.svg', 'Comprar ahora', '/producto/iphone-15-pro', 'dark', 1),
  ('3f75b018-7c39-57e8-837f-f5ffe9e7842f', 'AirPods Pro', 'Cancelación activa de ruido y estuche con USB-C.', '/seed/hero-audio.svg', 'Comprar ahora', '/producto/airpods-pro-2', 'dark', 2),
  ('2e876b57-d480-5c15-92b1-878cce762f16', 'Apple Watch Series 9', 'Pantalla más brillante y el chip S9.', '/seed/hero-watch.svg', 'Comprar ahora', '/producto/apple-watch-series-9', 'dark', 3)
on conflict do nothing;

-- CONFIGURACIÓN PÚBLICA (todas las filas son legibles por cualquier visitante)

insert into public.site_settings (key, value) values
  ('business', '{"businessName":"Raymond Unlock","tagline":"Celulares y Más","description":"Desbloqueo, reparación y venta de celulares y artículos electrónicos en Santo Domingo, República Dominicana.","address":"Calle México #6, casi esq. Isabel Aguiar, Santo Domingo, República Dominicana, 11005","addressParts":{"street":"Calle México #6, casi esq. Isabel Aguiar","locality":"Santo Domingo","postalCode":"11005","country":"DO"},"phoneDisplay":"809-906-3114","shippingNote":"Envíos a todo el país. Entrega en 24 h en el Distrito Nacional. Escríbenos por WhatsApp para coordinar tu envío.","whatsappNumber":"18099063114","email":"Raymondunlock01@gmail.com","instagramUrl":"https://www.instagram.com/raymondunlock_/","threadsUrl":"https://www.threads.net/@raymondunlock_","facebookUrl":null}'::jsonb),
  ('guarantees', '[{"icon":"truck","title":"Entrega en 24 h","text":"En el Distrito Nacional"},{"icon":"badge-check","title":"Equipos originales","text":"Nuevos, open box y usados"},{"icon":"wrench","title":"Garantía en reparaciones","text":"En todos nuestros servicios"},{"icon":"message-circle","title":"Soporte por WhatsApp","text":"Escríbenos al 809-906-3114"}]'::jsonb),
  ('why_us', '[{"icon":"badge-check","title":"Productos originales","text":"Trabajamos con equipos y accesorios de marcas reconocidas."},{"icon":"shield-check","title":"Precios competitivos","text":"Buen precio en unidad y todavía mejor si compras por volumen."},{"icon":"wrench","title":"Técnicos expertos","text":"Diagnóstico y reparación hechos por gente que sabe lo que hace."},{"icon":"message-circle","title":"Servicio postventa","text":"Después de la compra seguimos contigo: escríbenos cuando lo necesites."}]'::jsonb),
  ('repair_process', '[{"title":"Cuéntanos qué pasa","text":"Llena el formulario o escríbenos por WhatsApp con el modelo y el problema."},{"title":"Diagnóstico","text":"Revisamos tu equipo y te decimos qué tiene."},{"title":"Te damos el precio","text":"Te informamos costo y tiempo antes de reparar. Tú decides si seguimos."},{"title":"Reparación y entrega","text":"Reparamos tu equipo y te avisamos cuando esté listo para recogerlo."}]'::jsonb),
  ('testimonials', '[{"id":"t1","name":"Carlos M.","detail":"Cliente en Santo Domingo","quote":"Me cambiaron la pantalla del iPhone el mismo día y quedó como nuevo. Me explicaron todo antes de empezar."},{"id":"t2","name":"Yesenia R.","detail":"Cliente en Santo Domingo Este","quote":"Compré mi Samsung aquí y el trato fue de primera. Me lo dejaron listo y configurado."},{"id":"t3","name":"Ramón P.","detail":"Dueño de negocio","quote":"Les compro accesorios al por mayor para mi tienda. Buenos precios y siempre tienen mercancía."}]'::jsonb),
  ('nav_promos', '{"celulares":{"title":"Nuevos, open box y usados","subtitle":"Elige el equipo que se ajusta a tu presupuesto","href":"/tienda/celulares"},"tablets":{"title":"Tablets para todo","subtitle":"Trabajo, estudio y entretenimiento","href":"/tienda/tablets"},"audio":{"title":"Sonido sin cables","subtitle":"AirPods, Galaxy Buds y más","href":"/tienda/audio"},"smartwatches":{"title":"Tu día en la muñeca","subtitle":"Apple Watch y Galaxy Watch","href":"/tienda/smartwatches"},"accesorios":{"title":"Completa tu equipo","subtitle":"Cargadores, cases y protectores","href":"/tienda/accesorios"}}'::jsonb)
on conflict do nothing;
