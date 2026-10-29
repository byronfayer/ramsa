import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { db } from './db.js'

const SECRET = process.env.JWT_SECRET || 'ramsa-dev-secret-cambiar-en-produccion'

export const hashPassword = (pw) => bcrypt.hashSync(pw, 10)
export const verifyPassword = (pw, hash) => bcrypt.compareSync(pw, hash)
export const getAdminByEmail = (email) =>
  db.prepare('select * from admins where email = ?').get(String(email || '').trim().toLowerCase())

export const signToken = (admin) =>
  jwt.sign({ id: admin.id, email: admin.email }, SECRET, { expiresIn: '7d' })

export function requireAdmin(req, res, next) {
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Falta la sesión' })
  try {
    req.admin = jwt.verify(token, SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Sesión vencida. Ingresá de nuevo.' })
  }
}
