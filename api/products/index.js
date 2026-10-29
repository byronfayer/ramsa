import { sql, query } from '../_lib/db.js'
import { requireAdmin } from '../_lib/auth.js'
import { uniqueSlug } from '../_lib/helpers.js'

const COLS = `p.id, p.name, p.slug, p.description, p.price, p.category_id,
  c.name AS category_name, c.slug AS category_slug,
  p.image_url, p.stock, p.active, p.featured, p.external_url, p.created_at`

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { category, q, featured, sort, limit: lim } = req.query
    const where = ['p.active = true']
    const params = []
    let i = 0

    if (category) { where.push(`c.slug = $${++i}`); params.push(String(category)) }
    if (featured === '1') where.push('p.featured = true')
    if (q) { where.push(`p.name ILIKE $${++i}`); params.push(`%${String(q)}%`) }

    const order = sort === 'price_asc' ? 'p.price ASC'
      : sort === 'price_desc' ? 'p.price DESC'
      : sort === 'name' ? 'p.name ASC'
      : 'p.featured DESC, p.created_at DESC'

    let text = `SELECT ${COLS} FROM products p LEFT JOIN categories c ON c.id = p.category_id
      WHERE ${where.join(' AND ')} ORDER BY ${order}`
    if (lim) { text += ` LIMIT $${++i}`; params.push(Math.max(1, Math.min(60, Number(lim) || 8))) }

    const { rows } = await query(text, params)
    return res.json(rows)
  }

  if (req.method === 'POST') {
    const admin = requireAdmin(req, res)
    if (!admin) return
    const b = req.body || {}
    const name = String(b.name || '').trim()
    if (!name) return res.status(400).json({ error: 'Falta el nombre' })
    const price = Number(b.price)
    if (!(price >= 0)) return res.status(400).json({ error: 'Precio inválido' })

    const slug = await uniqueSlug(name, 'products')
    const desc = b.description ? String(b.description).trim() : null
    const cat_id = b.category_id ? Number(b.category_id) : null
    const img = b.image_url ? String(b.image_url).trim() : null
    const stock = b.stock === '' || b.stock == null ? null : Number(b.stock)
    const active = b.active != null ? Boolean(b.active) : true
    const feat = b.featured != null ? Boolean(b.featured) : false
    const ext = b.external_url ? String(b.external_url).trim() : null

    const { rows: [p] } = await sql`
      INSERT INTO products (name, slug, description, price, category_id, image_url, stock, active, featured, external_url)
      VALUES (${name}, ${slug}, ${desc}, ${price}, ${cat_id}, ${img}, ${stock}, ${active}, ${feat}, ${ext})
      RETURNING id`

    const { rows: [full] } = await query(
      `SELECT ${COLS} FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = $1`,
      [p.id]
    )
    return res.status(201).json(full)
  }

  res.status(405).json({ error: 'Method not allowed' })
}
