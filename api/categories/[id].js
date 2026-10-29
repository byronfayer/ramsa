import { sql } from '../_lib/db.js'
import { requireAdmin } from '../_lib/auth.js'

export default async function handler(req, res) {
  const id = Number(req.query.id)
  if (!id) return res.status(400).json({ error: 'ID inválido' })
  const admin = requireAdmin(req, res)
  if (!admin) return

  if (req.method === 'PUT') {
    const { rows: [cur] } = await sql`SELECT * FROM categories WHERE id = ${id}`
    if (!cur) return res.status(404).json({ error: 'No existe' })
    const name = req.body?.name != null ? String(req.body.name).trim() : cur.name
    const sort_order = req.body?.sort_order != null ? Number(req.body.sort_order) : cur.sort_order
    const { rows: [cat] } = await sql`UPDATE categories SET name = ${name}, sort_order = ${sort_order} WHERE id = ${id} RETURNING *`
    return res.json(cat)
  }
  if (req.method === 'DELETE') {
    await sql`DELETE FROM categories WHERE id = ${id}`
    return res.json({ ok: true })
  }
  res.status(405).json({ error: 'Method not allowed' })
}
