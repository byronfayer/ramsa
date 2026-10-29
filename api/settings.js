import { sql } from './_lib/db.js'
import { requireAdmin } from './_lib/auth.js'

const KEYS = ['brand_name', 'whatsapp', 'email', 'instagram', 'facebook', 'tiktok', 'about', 'wholesale']

async function getSettings() {
  const { rows } = await sql`SELECT key, value FROM settings`
  const out = {}
  for (const k of KEYS) out[k] = ''
  for (const r of rows) if (KEYS.includes(r.key)) out[r.key] = r.value || ''
  return out
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.json(await getSettings())
  }
  if (req.method === 'PUT') {
    const admin = requireAdmin(req, res)
    if (!admin) return
    const body = req.body || {}
    for (const k of KEYS) {
      if (k in body) {
        await sql`INSERT INTO settings (key, value) VALUES (${k}, ${String(body[k] ?? '')})
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`
      }
    }
    return res.json(await getSettings())
  }
  res.status(405).json({ error: 'Method not allowed' })
}
