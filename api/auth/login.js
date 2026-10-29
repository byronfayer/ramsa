import { getAdminByEmail, verifyPassword, signToken } from '../_lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { email, password } = req.body || {}
  const admin = await getAdminByEmail(email)
  if (!admin || !verifyPassword(String(password || ''), admin.password_hash))
    return res.status(401).json({ error: 'Email o contraseña incorrectos.' })
  res.json({ token: signToken(admin), user: { id: admin.id, email: admin.email } })
}
