/*
 * Agrega imágenes de ejemplo a productos que no tienen.
 * Correr:  node --env-file=.env.local scripts/add-images.mjs
 */
import { sql } from '@vercel/postgres'

const IMG_BY_CAT = {
  'lecturas-manos-tarot': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
  'piedras-energeticas': 'https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?auto=format&fit=crop&w=800&q=80',
  'sahumerios-naturales': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
  'cosmetica-natural': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80',
  'mazos-y-oraculos': 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80',
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
