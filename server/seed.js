import { writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { db, UPLOAD_DIR } from './db.js'
import { hashPassword } from './auth.js'

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@ramsa.com').toLowerCase()
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ramsa1234'

/* ---- admin inicial ---- */
if (!db.prepare('select 1 from admins limit 1').get()) {
  db.prepare('insert into admins (email, password_hash) values (?, ?)').run(ADMIN_EMAIL, hashPassword(ADMIN_PASSWORD))
  console.log(`✓ Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)
}

/* ---- ajustes por defecto ---- */
const setDefault = db.prepare('insert into settings (key, value) values (?, ?) on conflict(key) do nothing')
setDefault.run('brand_name', 'RAMSA')
setDefault.run('about', 'Somos una marca familiar que comenzó en Carlos Paz aproximadamente en 1980. Con cada producto llevás magia y años de trayectoria. Lo mejor para energizar y revitalizar tu hogar.')
setDefault.run('whatsapp', '') // la clienta pone su número en el panel
setDefault.run('email', '')
setDefault.run('instagram', '')
setDefault.run('facebook', '')
setDefault.run('tiktok', '')
setDefault.run('wholesale', 'Si tenés un comercio, un espacio de bienestar o un emprendimiento y querés sumar productos RAMSA, escribinos por condiciones y disponibilidad.')

/* ---- imágenes placeholder (SVG, se ven sin internet; la clienta las reemplaza desde el panel) ---- */
const PALETTES = {
  verde: ['#34483B', '#4B6354', '#D9C7A0'],
  salvia: ['#5E7064', '#899580', '#F7F3EC'],
  terra: ['#8A4B38', '#B96F55', '#F3E6DD'],
  bordo: ['#4C2A31', '#653A43', '#D9C7A0'],
  piedra: ['#45524B', '#6B7A70', '#EDE6D6'],
}
function placeholder(slug, label, pal) {
  const file = `seed-${slug}.svg`
  const [a, b, ink] = PALETTES[pal] || PALETTES.verde
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1125" viewBox="0 0 900 1125">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
  <rect width="900" height="1125" fill="url(#g)"/>
  <circle cx="450" cy="470" r="150" fill="none" stroke="${ink}" stroke-width="2" opacity="0.5"/>
  <circle cx="450" cy="470" r="150" fill="none" stroke="${ink}" stroke-width="2" opacity="0.5" transform="translate(70,0) scale(0.72)" transform-origin="450 470"/>
  <text x="450" y="760" text-anchor="middle" fill="${ink}" font-family="Georgia, serif" font-size="56" letter-spacing="2">RAMSA</text>
  <text x="450" y="810" text-anchor="middle" fill="${ink}" font-family="Georgia, serif" font-size="30" opacity="0.85">${label}</text>
</svg>`
  writeFileSync(join(UPLOAD_DIR, file), svg)
  return '/uploads/' + file
}

/* ---- categorías ---- */
const cats = [
  ['Lecturas: Manos & Tarot', 'lecturas-manos-tarot'],
  ['Piedras Energéticas', 'piedras-energeticas'],
  ['Sahumerios Naturales', 'sahumerios-naturales'],
  ['Cosmética Natural', 'cosmetica-natural'],
  ['Mazos y Oráculos', 'mazos-y-oraculos'],
]
const insCat = db.prepare('insert into categories (name, slug, sort_order) values (?, ?, ?) on conflict(slug) do nothing')
cats.forEach(([name, slug], i) => insCat.run(name, slug, i + 1))
const catId = (slug) => db.prepare('select id from categories where slug = ?').get(slug)?.id

/* ---- productos de ejemplo (solo si la tabla está vacía) ---- */
if (!db.prepare('select 1 from products limit 1').get()) {
  const P = [
    ['Lectura de Tarot', 'lecturas-manos-tarot', 'bordo', 6000, 'Sesión de lectura de tarot personalizada para acompañarte en tus decisiones.', null, 1],
    ['Sahumerios Naturales', 'sahumerios-naturales', 'salvia', 3000, 'Sahumerios artesanales de hierbas seleccionadas para armonizar tus espacios.', null, 1],
    ['Cristales y Piedras', 'piedras-energeticas', 'piedra', 2500, 'Piedras energéticas naturales. Elegí la que vibre con vos.', 12, 1],
    ['Cosmética Natural', 'cosmetica-natural', 'terra', 4000, 'Cuidado cotidiano con ingredientes naturales y espíritu artesanal.', null, 1],
    ['Perfume Artesanal', 'cosmetica-natural', 'terra', 4500, 'Perfume elaborado a mano con la receta familiar de RAMSA.', 6, 0],
    ['Oráculo Místico', 'mazos-y-oraculos', 'verde', 10000, 'Mazo de oráculo para guiar tus preguntas y tus rituales.', null, 1],
    ['Amatista Pulida', 'piedras-energeticas', 'piedra', 8000, 'Amatista pulida, ideal para calmar y equilibrar los ambientes.', 3, 0],
    ['Sahumerio de Salvia', 'sahumerios-naturales', 'salvia', 5000, 'Atado de salvia blanca para limpieza y renovación energética.', 0, 0],
  ]
  const ins = db.prepare(`insert into products (name, slug, description, price, category_id, image_url, stock, active, featured)
    values (@name, @slug, @description, @price, @category_id, @image_url, @stock, 1, @featured)`)
  let slugN = {}
  for (const [name, catSlug, pal, price, description, stock, featured] of P) {
    let slug = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    if (slugN[slug]) slug = slug + '-' + (++slugN[slug]); else slugN[slug] = 1
    ins.run({ name, slug, description, price, category_id: catId(catSlug), image_url: placeholder(slug, name, pal), stock, featured })
  }
  console.log('✓ Productos de ejemplo cargados')
}

console.log('✓ Base lista')
