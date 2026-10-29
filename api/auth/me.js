import { requireAdmin } from '../_lib/auth.js'

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const admin = requireAdmin(req, res)
  if (!admin) return
  res.json({ user: { id: admin.id, email: admin.email } })
}
