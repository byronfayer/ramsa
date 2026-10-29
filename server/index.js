import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { randomUUID } from 'crypto'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'
import { writeFile } from 'fs/promises'
import { db, UPLOAD_DIR } from './db.js'
import { signToken, requireAdmin, verifyPassword, getAdminByEmail } from './auth.js'

let sharp = null
try { sharp = (await import('sharp')).default } catch { sharp = null }

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

/* ---------- helpers ---------- */
const slugify = (s) =>
  String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item'

function uniqueSlug(base, table, excludeId = null) {
  let slug = slugify(base)
  const q = db.prepare(`select id from ${table} where slug = ?`)
  let n = 1
  while (true) {
    const row = q.get(slug)
    if (!row || row.id === excludeId) return slug
    slug = `${slugify(base)}-${++n}`
  }
}

const SETTING_KEYS = ['brand_name', 'whatsapp', 'email', 'instagram', 'facebook', 'tiktok', 'about', 'wholesale']
const getSettings = () => {
  const rows = db.prepare('select key, value from settings').all()
  const out = {}
  for (const k of SETTING_KEYS) out[k] = ''
  for (const r of rows) if (SETTING_KEYS.includes(r.key)) out[r.key] = r.value || ''
  return out
}

const PROD_COLS = `p.id, p.name, p.slug, p.description, p.price, p.category_id,
  c.name as category_name, c.slug as category_slug,
  p.image_url, p.stock, p.active, p.featured, p.external_url, p.created_at`
const mapProduct = (r) => r && ({
  ...r, active: !!r.active, featured: !!r.featured,
  stock: r.stock === null ? null : Number(r.stock),
})

/* ---------- auth ---------- */
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {}
  const admin = getAdminByEmail(email)
  if (!admin || !verifyPassword(String(password || ''), admin.password_hash))
    return res.status(401).json({ error: 'Email o contraseña incorrectos.' })
  res.json({ token: signToken(admin), user: { id: admin.id, email: admin.email } })
})
app.get('/api/auth/me', requireAdmin, (req, res) => res.json({ user: { id: req.admin.id, email: req.admin.email } }))

/* ---------- settings ---------- */
app.get('/api/settings', (_req, res) => res.json(getSettings()))
app.put('/api/settings', requireAdmin, (req, res) => {
  const up = db.prepare('insert into settings (key, value) values (?, ?) on conflict(key) do update set value = excluded.value')
  const tx = db.transaction((body) => {
    for (const k of SETTING_KEYS) if (k in body) up.run(k, String(body[k] ?? ''))
  })
  tx(req.body || {})
  res.json(getSettings())
})

/* ---------- categories ---------- */
app.get('/api/categories', (_req, res) => {
  res.json(db.prepare('select * from categories order by sort_order, name').all())
})
app.post('/api/categories', requireAdmin, (req, res) => {
  const name = String(req.body?.name || '').trim()
  if (!name) return res.status(400).json({ error: 'Falta el nombre' })
  const order = (db.prepare('select max(sort_order) m from categories').get().m || 0) + 1
  const info = db.prepare('insert into categories (name, slug, sort_order) values (?, ?, ?)')
    .run(name, uniqueSlug(name, 'categories'), order)
  res.status(201).json(db.prepare('select * from categories where id = ?').get(info.lastInsertRowid))
})
app.put('/api/categories/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id)
  const cur = db.prepare('select * from categories where id = ?').get(id)
  if (!cur) return res.status(404).json({ error: 'No existe' })
  const name = req.body?.name != null ? String(req.body.name).trim() : cur.name
  const sort_order = req.body?.sort_order != null ? Number(req.body.sort_order) : cur.sort_order
  db.prepare('update categories set name = ?, sort_order = ? where id = ?').run(name, sort_order, id)
  res.json(db.prepare('select * from categories where id = ?').get(id))
})
app.delete('/api/categories/:id', requireAdmin, (req, res) => {
  db.prepare('delete from categories where id = ?').run(Number(req.params.id))
  res.json({ ok: true })
})

/* ---------- products ---------- */
app.get('/api/products', (req, res) => {
  const { category, q, featured, sort, limit } = req.query
  const where = ['p.active = 1']
  const args = []
  if (category) { where.push('c.slug = ?'); args.push(String(category)) }
  if (featured === '1') where.push('p.featured = 1')
  if (q) { where.push('p.name like ?'); args.push('%' + String(q) + '%') }
  const order = sort === 'price_asc' ? 'p.price asc'
    : sort === 'price_desc' ? 'p.price desc'
    : sort === 'name' ? 'p.name asc'
    : 'p.featured desc, p.created_at desc'
  let sql = `select ${PROD_COLS} from products p left join categories c on c.id = p.category_id
    where ${where.join(' and ')} order by ${order}`
  if (limit) sql += ' limit ' + Math.max(1, Math.min(60, Number(limit) || 8))
  res.json(db.prepare(sql).all(...args).map(mapProduct))
})
app.get('/api/products/:slug', (req, res) => {
  const row = db.prepare(`select ${PROD_COLS} from products p left join categories c on c.id = p.category_id
    where p.slug = ? and p.active = 1`).get(req.params.slug)
  if (!row) return res.status(404).json({ error: 'Producto no encontrado' })
  res.json(mapProduct(row))
})
app.get('/api/admin/products', requireAdmin, (_req, res) => {
  res.json(db.prepare(`select ${PROD_COLS} from products p left join categories c on c.id = p.category_id
    order by p.created_at desc`).all().map(mapProduct))
})

function productPayload(body, cur = {}) {
  const num = (v, d) => (v === '' || v == null ? d : Number(v))
  return {
    name: body.name != null ? String(body.name).trim() : cur.name,
    description: body.description != null ? (String(body.description).trim() || null) : (cur.description ?? null),
    price: num(body.price, cur.price ?? 0),
    category_id: body.category_id ? Number(body.category_id) : null,
    image_url: body.image_url != null ? (String(body.image_url).trim() || null) : (cur.image_url ?? null),
    stock: body.stock === '' || body.stock == null ? null : Number(body.stock),
    active: body.active != null ? (body.active ? 1 : 0) : (cur.active ?? 1),
    featured: body.featured != null ? (body.featured ? 1 : 0) : (cur.featured ?? 0),
    external_url: body.external_url != null ? (String(body.external_url).trim() || null) : (cur.external_url ?? null),
  }
}
app.post('/api/products', requireAdmin, (req, res) => {
  const d = productPayload(req.body || {})
  if (!d.name) return res.status(400).json({ error: 'Falta el nombre' })
  if (!(d.price >= 0)) return res.status(400).json({ error: 'Precio inválido' })
  const slug = uniqueSlug(d.name, 'products')
  const info = db.prepare(`insert into products (name, slug, description, price, category_id, image_url, stock, active, featured, external_url)
    values (@name, @slug, @description, @price, @category_id, @image_url, @stock, @active, @featured, @external_url)`)
    .run({ ...d, slug })
  res.status(201).json(mapProduct(db.prepare(`select ${PROD_COLS} from products p left join categories c on c.id = p.category_id where p.id = ?`).get(info.lastInsertRowid)))
})
app.put('/api/products/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id)
  const cur = db.prepare('select * from products where id = ?').get(id)
  if (!cur) return res.status(404).json({ error: 'No existe' })
  const d = productPayload(req.body || {}, cur)
  db.prepare(`update products set name=@name, description=@description, price=@price, category_id=@category_id,
    image_url=@image_url, stock=@stock, active=@active, featured=@featured, external_url=@external_url,
    updated_at=datetime('now') where id=@id`).run({ ...d, id })
  res.json(mapProduct(db.prepare(`select ${PROD_COLS} from products p left join categories c on c.id = p.category_id where p.id = ?`).get(id)))
})
app.delete('/api/products/:id', requireAdmin, (req, res) => {
  db.prepare('delete from products where id = ?').run(Number(req.params.id))
  res.json({ ok: true })
})

/* ---------- uploads ---------- */
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024 } })
app.post('/api/uploads', requireAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No llegó ninguna imagen' })
  if (!req.file.mimetype.startsWith('image/')) return res.status(400).json({ error: 'El archivo debe ser una imagen' })
  try {
    const base = randomUUID()
    if (sharp) {
      const name = base + '.webp'
      const buf = await sharp(req.file.buffer).rotate().resize(1400, 1400, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer()
      await writeFile(join(UPLOAD_DIR, name), buf)
      return res.json({ url: '/uploads/' + name })
    }
    const ext = (req.file.originalname.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
    const name = base + '.' + (ext || 'jpg')
    await writeFile(join(UPLOAD_DIR, name), req.file.buffer)
    res.json({ url: '/uploads/' + name })
  } catch (e) {
    res.status(500).json({ error: 'No se pudo procesar la imagen' })
  }
})

/* ---------- archivos estáticos ---------- */
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '365d', immutable: true }))

const dist = join(__dirname, '..', 'dist')
if (existsSync(dist)) {
  app.use(express.static(dist))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next()
    res.sendFile(join(dist, 'index.html'))
  })
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`RAMSA API en http://localhost:${PORT}`))
