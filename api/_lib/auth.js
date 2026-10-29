import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sql } from './db.js'

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

export const hashPassword = (pw) => bcrypt.hashSync(pw, 10)
export const verifyPassword = (pw, hash) => bcrypt.compareSync(pw, hash)

export const signToken = (admin) =>
  jwt.sign({ id: admin.id, email: admin.email }, SECRET, { expiresIn: '7d' })

export async function getAdminByEmail(email) {
  const { rows } = await sql`SELECT * FROM admins WHERE email = ${String(email || '').toLowerCase().trim()}`
  return rows[0] || null
}

export function verifyToken(req) {
  const h = req.headers.authorization || ''
  const t = h.startsWith('Bearer ') ? h.slice(7) : null
  if (!t) return null
  try { return jwt.verify(t, SECRET) } catch { return null }
}

export function requireAdmin(req, res) {
  const admin = verifyToken(req)
  if (!admin) { res.status(401).json({ error: 'Falta la sesión' }); return null }
  return admin
}
