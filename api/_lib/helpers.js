import { sql } from './db.js'

export function slugify(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item'
}

export async function uniqueSlug(base, table) {
  const slug = slugify(base)
  let rows
  if (table === 'categories') {
    ;({ rows } = await sql`SELECT slug FROM categories WHERE slug = ${slug} OR slug LIKE ${slug + '-%'}`)
  } else {
    ;({ rows } = await sql`SELECT slug FROM products WHERE slug = ${slug} OR slug LIKE ${slug + '-%'}`)
  }
  const existing = new Set(rows.map(r => r.slug))
  if (!existing.has(slug)) return slug
  let n = 2
  while (existing.has(`${slug}-${n}`)) n++
  return `${slug}-${n}`
}
