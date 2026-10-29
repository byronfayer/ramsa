import { query } from '../_lib/db.js'
import { requireAdmin } from '../_lib/auth.js'

const COLS = `p.id, p.name, p.slug, p.description, p.price, p.category_id,
  c.name AS category_name, c.slug AS category_slug,
  p.image_url, p.stock, p.active, p.featured, p.external_url, p.created_at`

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const admin = requireAdmin(req, res)
  if (!admin) return
  const { rows } = await query(
    `SELECT ${COLS} FROM products p LEFT JOIN categories c ON c.id = p.category_id ORDER BY p.created_at DESC`
  )
  res.json(rows)
}
