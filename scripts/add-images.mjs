/*
 * Agrega imágenes de ejemplo a productos que no tienen.
 * Correr:  node --env-file=.env.local scripts/add-images.mjs
 */
import { sql } from '@vercel/postgres'

const IMG_BY_CAT = {
  'lecturas-manos-tarot': 'https://images.unsplash.com/photo-1704030328221-94fa7e021808?auto=format&fit=crop&w=800&q=80',
  'piedras-energeticas': 'https://images.unsplash.com/photo-1597681542304-588805052e88?auto=format&fit=crop&w=800&q=80',
  'sahumerios-naturales': 'https://images.unsplash.com/photo-1509726360306-3f44543aea4c?auto=format&fit=crop&w=800&q=80',
  'cosmetica-natural': 'https://images.unsplash.com/photo-1599847935464-fde3827639c2?auto=format&fit=crop&w=800&q=80',
  'mazos-y-oraculos': 'https://images.unsplash.com/photo-1704030328221-94fa7e021808?auto=format&fit=crop&w=800&q=80',
}

const { rows: products } = await sql`
  SELECT p.id, p.name, c.slug AS cat_slug
  FROM products p LEFT JOIN categories c ON c.id = p.category_id
  WHERE p.image_url IS NULL`

let updated = 0
for (const p of products) {
  const img = IMG_BY_CAT[p.cat_slug]
  if (img) {
    await sql`UPDATE products SET image_url = ${img} WHERE id = ${p.id}`
    console.log(`✓ ${p.name} → imagen agregada`)
    updated++
  }
}

console.log(`\n✅ ${updated} productos actualizados.`)
process.exit(0)
