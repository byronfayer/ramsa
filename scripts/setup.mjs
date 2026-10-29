/*
 * RAMSA — Setup de la base de datos (Vercel Postgres)
 *
 * Uso:
 *   1. Crear Postgres en Vercel Dashboard → Storage → Create → Postgres
 *   2. Conectarlo al proyecto
 *   3. Bajar las env vars:
 *        npx vercel env pull .env.local
 *   4. Correr este script (Windows PowerShell):
 *        node --env-file=.env.local scripts/setup.mjs
 *      O seteando la URL directo:
 *        $env:POSTGRES_URL = "postgres://..."; node scripts/setup.mjs
 */

import { sql } from '@vercel/postgres'
import bcrypt from 'bcryptjs'

/* ---------- Schema ---------- */
console.log('Creando tablas...')

await sql`CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)`

await sql`CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)`

await sql`CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  stock INTEGER,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  external_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)`

await sql`CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
)`

await sql`CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$`

await sql`DROP TRIGGER IF EXISTS products_touch ON products`
await sql`CREATE TRIGGER products_touch BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION touch_updated_at()`

console.log('✓ Tablas creadas')

/* ---------- Admin ---------- */
const email = (process.env.ADMIN_EMAIL || 'admin@ramsa.com').toLowerCase()
const password = process.env.ADMIN_PASSWORD || 'ramsa1234'
const hash = bcrypt.hashSync(password, 10)

const { rows: [existingAdmin] } = await sql`SELECT 1 FROM admins WHERE email = ${email}`
if (!existingAdmin) {
  await sql`INSERT INTO admins (email, password_hash) VALUES (${email}, ${hash})`
  console.log(`✓ Admin creado: ${email}`)
} else {
  console.log(`· Admin ya existe: ${email}`)
}

/* ---------- Settings por defecto ---------- */
const defaults = [
  ['brand_name', 'RAMSA'],
  ['about', 'Somos una marca familiar que comenzó en Carlos Paz aproximadamente en 1980. Con cada producto llevás magia y años de trayectoria. Lo mejor para energizar y revitalizar tu hogar.'],
  ['whatsapp', ''],
  ['email', ''],
  ['instagram', ''],
  ['facebook', ''],
  ['tiktok', ''],
  ['wholesale', 'Si tenés un comercio, un espacio de bienestar o un emprendimiento y querés sumar productos RAMSA, escribinos por condiciones y disponibilidad.'],
]
for (const [key, value] of defaults) {
  await sql`INSERT INTO settings (key, value) VALUES (${key}, ${value}) ON CONFLICT (key) DO NOTHING`
}
console.log('✓ Settings')

/* ---------- Categorías ---------- */
const cats = [
  ['Lecturas: Manos & Tarot', 'lecturas-manos-tarot', 1],
  ['Piedras Energéticas', 'piedras-energeticas', 2],
  ['Sahumerios Naturales', 'sahumerios-naturales', 3],
  ['Cosmética Natural', 'cosmetica-natural', 4],
  ['Mazos y Oráculos', 'mazos-y-oraculos', 5],
]
for (const [name, slug, order] of cats) {
  await sql`INSERT INTO categories (name, slug, sort_order) VALUES (${name}, ${slug}, ${order}) ON CONFLICT (slug) DO NOTHING`
}
console.log('✓ Categorías')

/* ---------- Productos de ejemplo ---------- */
const { rows: [anyProd] } = await sql`SELECT 1 FROM products LIMIT 1`
if (!anyProd) {
  async function catId(slug) {
    const { rows: [r] } = await sql`SELECT id FROM categories WHERE slug = ${slug}`
    return r?.id || null
  }
  const prods = [
    ['Lectura de Tarot', 'lecturas-manos-tarot', 6000, 'Sesión de lectura de tarot personalizada para acompañarte en tus decisiones.', null, true],
    ['Sahumerios Naturales', 'sahumerios-naturales', 3000, 'Sahumerios artesanales de hierbas seleccionadas para armonizar tus espacios.', null, true],
    ['Cristales y Piedras', 'piedras-energeticas', 2500, 'Piedras energéticas naturales. Elegí la que vibre con vos.', 12, true],
    ['Cosmética Natural', 'cosmetica-natural', 4000, 'Cuidado cotidiano con ingredientes naturales y espíritu artesanal.', null, true],
    ['Oráculo Místico', 'mazos-y-oraculos', 10000, 'Mazo de oráculo para guiar tus preguntas y tus rituales.', null, true],
  ]
  for (const [name, catSlug, price, desc, stock, featured] of prods) {
    const cid = await catId(catSlug)
    const slug = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-')
    await sql`INSERT INTO products (name, slug, description, price, category_id, stock, active, featured)
      VALUES (${name}, ${slug}, ${desc}, ${price}, ${cid}, ${stock}, true, ${featured})`
  }
  console.log('✓ Productos de ejemplo')
} else {
  console.log('· Productos ya existen, no se tocaron')
}

console.log('\n✅ Base lista. Ya podés deployar.')
process.exit(0)
