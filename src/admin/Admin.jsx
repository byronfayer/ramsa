import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api, getToken, setToken } from '../lib/api.js'
import './admin.css'

/* ---------- utilidades ---------- */
const money = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(Number(n) || 0)
const rand = () => Math.random().toString(36).slice(2, 6)

// Redimensiona y comprime la imagen en el navegador antes de subirla.
async function toDataURL(file, max = 1200) {
  try {
    const bmp = await createImageBitmap(file)
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height))
    const c = document.createElement('canvas')
    c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k)
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height)
    const blob = await new Promise((r) => c.toBlob(r, 'image/webp', 0.78))
    if (blob) return new Promise((r) => { const rd = new FileReader(); rd.onload = () => r(rd.result); rd.readAsDataURL(blob) })
  } catch { /* fallback */ }
  return new Promise((r) => { const rd = new FileReader(); rd.onload = () => r(rd.result); rd.readAsDataURL(file) })
}

const ICONS = {
  box: 'M21 8l-9-5-9 5v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v8',
  tag: 'M3 12V4h8l10 10-8 8L3 12zM7.5 7.5h.01',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7 7 0 0 0-1.7-1L14.5 2h-5l-.3 2.9a7 7 0 0 0-1.7 1l-2.4-1-2 3.4L3 11a7 7 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.3 2.9h5l.3-2.9a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6a7 7 0 0 0 .1-1z',
  plus: 'M12 5v14M5 12h14',
  edit: 'M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5',
  out: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
  ext: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
  img: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M9 9.5h.01',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z',
  x: 'M6 6l12 12M18 6L6 18',
}
const Icon = ({ n, size = 18 }) => (
  <svg className="adm-ic" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS[n]} /></svg>
)

/* ---------- raíz: sesión ---------- */
export default function Admin() {
  const [session, setSession] = useState(undefined) // undefined=verificando, null=fuera, {user}=dentro

  useEffect(() => {
    document.title = 'Panel RAMSA'
    let m = document.querySelector('meta[name=robots]')
    if (!m) { m = document.createElement('meta'); m.name = 'robots'; document.head.appendChild(m) }
    m.content = 'noindex,nofollow'
    if (!getToken()) { setSession(null); return }
    api.me().then((d) => setSession(d)).catch(() => { setToken(null); setSession(null) })
  }, [])

  if (session === undefined) return <div className="adm-center"><div className="adm-spinner" /></div>
  if (!session) return <Login onIn={setSession} />
  return <Shell session={session} onOut={() => { setToken(null); setSession(null) }} />
}

/* ---------- login ---------- */
function Login({ onIn }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('')
    try {
      const { token, user } = await api.login(email.trim(), pass)
      setToken(token); onIn({ user })
    } catch (e) { setErr(e.message); setBusy(false) }
  }
  return (
    <div className="adm-login">
      <div className="adm-login-art" aria-hidden="true">
        <div><span className="adm-brand-lg">RAMSA</span><p>Rituales, aromas y artesanías naturales.</p></div>
      </div>
      <form className="adm-login-form" onSubmit={submit}>
        <span className="adm-eyebrow">Panel de administración</span>
        <h1 className="adm-h1">Bienvenida de nuevo</h1>
        <p className="adm-muted">Ingresá para cargar y editar los productos de la tienda.</p>
        <label className="adm-field"><span>Email</span>
          <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="adm-field"><span>Contraseña</span>
          <input type="password" autoComplete="current-password" required value={pass} onChange={(e) => setPass(e.target.value)} />
        </label>
        {err && <div className="adm-alert" role="alert">{err}</div>}
        <button className="adm-btn adm-btn-primary adm-block" disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</button>
        <a className="adm-link" href="/">← Volver a la tienda</a>
      </form>
    </div>
  )
}

/* ---------- estructura ---------- */
function Shell({ session, onOut }) {
  const [tab, setTab] = useState('products')
  const [cats, setCats] = useState([])
  const [toasts, setToasts] = useState([])
  const notify = useCallback((msg, kind = 'ok') => {
    const id = rand()
    setToasts((t) => [...t, { id, msg, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800)
  }, [])
  const loadCats = useCallback(async () => {
    try { setCats(await api.categories()) } catch (e) { notify(e.message, 'err') }
  }, [notify])
  useEffect(() => { loadCats() }, [loadCats])

  const nav = [['products', 'Productos', 'box'], ['categories', 'Categorías', 'tag'], ['settings', 'Ajustes', 'gear']]
  return (
    <div className="adm-app">
      <aside className="adm-side">
        <div className="adm-brand">RAMSA<small>Panel</small></div>
        <nav>
          {nav.map(([k, l, i]) => (
            <button key={k} className={'adm-nav' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}><Icon n={i} />{l}</button>
          ))}
        </nav>
        <div className="adm-side-foot">
          <a className="adm-nav" href="/" target="_blank" rel="noopener"><Icon n="ext" />Ver tienda</a>
          <div className="adm-user">{session.user.email}</div>
          <button className="adm-nav" onClick={onOut}><Icon n="out" />Salir</button>
        </div>
      </aside>
      <header className="adm-top">
        <div className="adm-brand">RAMSA</div>
        <div className="adm-tabs">
          {nav.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}
        </div>
        <button className="adm-icon-btn" onClick={onOut} aria-label="Salir"><Icon n="out" /></button>
      </header>
      <main className="adm-main">
        {tab === 'products' && <ProductsView cats={cats} notify={notify} />}
        {tab === 'categories' && <CategoriesView cats={cats} reload={loadCats} notify={notify} />}
        {tab === 'settings' && <SettingsView notify={notify} />}
      </main>
      <div className="adm-toasts" aria-live="polite">
        {toasts.map((t) => <div key={t.id} className={'adm-toast ' + t.kind}>{t.msg}</div>)}
      </div>
    </div>
  )
}

/* ---------- productos ---------- */
function ProductsView({ cats, notify }) {
  const [items, setItems] = useState(null)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [status, setStatus] = useState('')
  const [editing, setEditing] = useState(null)
  const [del, setDel] = useState(null)

  const load = useCallback(async () => {
    try { setItems(await api.adminProducts()) } catch (e) { notify(e.message, 'err'); setItems([]) }
  }, [notify])
  useEffect(() => { load() }, [load])

  const list = useMemo(() => (items || []).filter((p) =>
    (!q || p.name.toLowerCase().includes(q.toLowerCase())) &&
    (!cat || (cat === 'none' ? !p.category_id : String(p.category_id) === cat)) &&
    (!status || (status === 'active' ? p.active : status === 'hidden' ? !p.active : p.stock === 0))
  ), [items, q, cat, status])

  const stats = useMemo(() => {
    const a = items || []
    return [['Productos', a.length], ['Visibles', a.filter((p) => p.active).length],
      ['Destacados', a.filter((p) => p.featured).length], ['Sin stock', a.filter((p) => p.stock === 0).length]]
  }, [items])

  const toggle = async (p) => {
    try { await api.updateProduct(p.id, { active: !p.active }); setItems((s) => s.map((x) => (x.id === p.id ? { ...x, active: !p.active } : x))); notify(p.active ? 'Producto ocultado' : 'Producto visible') }
    catch (e) { notify(e.message, 'err') }
  }
  const remove = async () => {
    try { await api.deleteProduct(del.id); setItems((s) => s.filter((x) => x.id !== del.id)); setDel(null); notify('Producto eliminado') }
    catch (e) { notify(e.message, 'err') }
  }

  return (
    <>
      <div className="adm-head">
        <div><h1 className="adm-h1">Productos</h1><p className="adm-muted">Lo que cargues acá aparece en la tienda al instante.</p></div>
        <button className="adm-btn adm-btn-primary" onClick={() => setEditing({})}><Icon n="plus" />Nuevo producto</button>
      </div>

      <div className="adm-stats">
        {stats.map(([l, v]) => <div key={l} className="adm-card adm-stat"><span>{l}</span><strong>{items ? v : '–'}</strong></div>)}
      </div>

      <div className="adm-card adm-list">
        <div className="adm-filters">
          <label className="adm-search"><Icon n="search" /><input placeholder="Buscar producto…" value={q} onChange={(e) => setQ(e.target.value)} /></label>
          <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Categoría">
            <option value="">Todas las categorías</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            <option value="none">Sin categoría</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Estado">
            <option value="">Todos los estados</option>
            <option value="active">Visibles</option>
            <option value="hidden">Ocultos</option>
            <option value="nostock">Sin stock</option>
          </select>
        </div>

        {items === null && <div className="adm-empty"><div className="adm-spinner" /></div>}
        {items && list.length === 0 && (
          <div className="adm-empty">
            <Icon n="box" size={34} />
            <h3>{items.length ? 'No hay resultados' : 'Todavía no cargaste productos'}</h3>
            <p className="adm-muted">{items.length ? 'Probá con otros filtros.' : 'Empezá cargando el primero.'}</p>
            {!items.length && <button className="adm-btn adm-btn-primary" onClick={() => setEditing({})}><Icon n="plus" />Cargar producto</button>}
          </div>
        )}
        {list.length > 0 && (
          <div className="adm-rows">
            <div className="adm-row adm-row-h"><span /><span>Producto</span><span>Categoría</span><span>Precio</span><span>Stock</span><span>Visible</span><span /></div>
            {list.map((p) => (
              <div className="adm-row" key={p.id}>
                <div className="adm-thumb">{p.image_url ? <img src={p.image_url} alt="" loading="lazy" /> : <Icon n="img" />}</div>
                <div className="adm-name">
                  <strong>{p.name}</strong>
                  <span>{p.featured && <em className="adm-pill gold"><Icon n="star" size={12} />Destacado</em>}</span>
                </div>
                <div className="adm-cell" data-l="Categoría">{p.category_name || <span className="adm-muted">Sin categoría</span>}</div>
                <div className="adm-cell adm-price" data-l="Precio">{money(p.price)}</div>
                <div className="adm-cell" data-l="Stock">
                  {p.stock === null ? <span className="adm-muted">Sin control</span> : p.stock === 0 ? <em className="adm-pill red">Sin stock</em> : p.stock}
                </div>
                <div className="adm-cell" data-l="Visible">
                  <button role="switch" aria-checked={p.active} aria-label="Visible en la tienda" className={'adm-switch' + (p.active ? ' on' : '')} onClick={() => toggle(p)}><i /></button>
                </div>
                <div className="adm-actions">
                  <button className="adm-icon-btn" aria-label="Editar" onClick={() => setEditing(p)}><Icon n="edit" /></button>
                  <button className="adm-icon-btn danger" aria-label="Eliminar" onClick={() => setDel(p)}><Icon n="trash" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && <ProductForm product={editing} cats={cats} notify={notify} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load() }} />}
      {del && (
        <Modal title="Eliminar producto" onClose={() => setDel(null)}>
          <p>¿Eliminar <strong>{del.name}</strong>? Esta acción no se puede deshacer. Si solo querés que no se vea, ocultalo con el interruptor.</p>
          <div className="adm-modal-actions">
            <button className="adm-btn adm-btn-ghost" onClick={() => setDel(null)}>Cancelar</button>
            <button className="adm-btn adm-btn-danger" onClick={remove}>Eliminar</button>
          </div>
        </Modal>
      )}
    </>
  )
}

function ProductForm({ product, cats, notify, onClose, onSaved }) {
  const isNew = !product.id
  const [f, setF] = useState({
    name: product.name || '', description: product.description || '', price: product.price ?? '',
    category_id: product.category_id || '', stock: product.stock ?? '', external_url: product.external_url || '',
    active: product.active ?? true, featured: product.featured ?? false, image_url: product.image_url || '',
  })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(product.image_url || '')
  const [busy, setBusy] = useState(false)
  const [errs, setErrs] = useState({})
  const [drag, setDrag] = useState(false)
  const inp = useRef(null)
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }))

  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k) }, [onClose])
  useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = '' } }, [])

  const pick = (fl) => {
    if (!fl) return
    if (!fl.type.startsWith('image/')) return notify('El archivo tiene que ser una imagen', 'err')
    if (fl.size > 12 * 1024 * 1024) return notify('La imagen supera los 12 MB', 'err')
    setFile(fl); setPreview(URL.createObjectURL(fl))
  }
  const clearImg = () => { setFile(null); setPreview(''); set('image_url', ''); if (inp.current) inp.current.value = '' }

  const validate = () => {
    const e = {}
    if (!f.name.trim()) e.name = 'Ingresá el nombre'
    if (f.price === '' || Number(f.price) < 0 || Number.isNaN(Number(f.price))) e.price = 'Ingresá un precio válido'
    if (f.stock !== '' && (!Number.isInteger(Number(f.stock)) || Number(f.stock) < 0)) e.stock = 'Usá un número entero (0 o más)'
    if (f.external_url && !/^https?:\/\//i.test(f.external_url)) e.external_url = 'Debe empezar con https://'
    setErrs(e); return !Object.keys(e).length
  }

  const save = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setBusy(true)
    try {
      let image_url = f.image_url || null
      if (file) { image_url = await toDataURL(file) }
      const row = {
        name: f.name.trim(), description: f.description.trim(), price: Number(f.price),
        category_id: f.category_id || null, stock: f.stock === '' ? '' : Number(f.stock),
        external_url: f.external_url.trim(), active: f.active, featured: f.featured, image_url,
      }
      if (isNew) await api.createProduct(row); else await api.updateProduct(product.id, row)
      notify(isNew ? 'Producto creado' : 'Cambios guardados')
      onSaved()
    } catch (e) { notify(e.message || 'No se pudo guardar', 'err'); setBusy(false) }
  }

  return (
    <div className="adm-drawer-wrap" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="adm-drawer" onSubmit={save} noValidate>
        <div className="adm-drawer-head">
          <h2 className="adm-h2">{isNew ? 'Nuevo producto' : 'Editar producto'}</h2>
          <button type="button" className="adm-icon-btn" onClick={onClose} aria-label="Cerrar"><Icon n="x" /></button>
        </div>
        <div className="adm-drawer-body">
          <div className="adm-field"><span>Foto</span>
            <div className={'adm-drop' + (drag ? ' drag' : '') + (preview ? ' has' : '')}
              onDragOver={(e) => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]) }}>
              {preview ? (
                <>
                  <img src={preview} alt="Vista previa" />
                  <div className="adm-drop-btns">
                    <button type="button" className="adm-btn adm-btn-light" onClick={() => inp.current.click()}>Cambiar</button>
                    <button type="button" className="adm-btn adm-btn-light" onClick={clearImg}>Quitar</button>
                  </div>
                </>
              ) : (
                <button type="button" className="adm-drop-empty" onClick={() => inp.current.click()}>
                  <Icon n="img" size={30} /><strong>Subir foto</strong><small>Arrastrala acá o tocá para elegir · JPG, PNG o WebP</small>
                </button>
              )}
              <input ref={inp} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files[0])} />
            </div>
          </div>

          <label className={'adm-field' + (errs.name ? ' bad' : '')}><span>Nombre *</span>
            <input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Ej: Sahumerio de salvia" maxLength={120} />
            {errs.name && <small>{errs.name}</small>}
          </label>
          <div className="adm-two">
            <label className={'adm-field' + (errs.price ? ' bad' : '')}><span>Precio (ARS) *</span>
              <input type="number" inputMode="decimal" min="0" step="0.01" value={f.price} onChange={(e) => set('price', e.target.value)} placeholder="0" />
              {errs.price && <small>{errs.price}</small>}
            </label>
            <label className={'adm-field' + (errs.stock ? ' bad' : '')}><span>Stock</span>
              <input type="number" inputMode="numeric" min="0" step="1" value={f.stock} onChange={(e) => set('stock', e.target.value)} placeholder="Vacío = sin control" />
              {errs.stock && <small>{errs.stock}</small>}
            </label>
          </div>
          <label className="adm-field"><span>Categoría</span>
            <select value={f.category_id} onChange={(e) => set('category_id', e.target.value)}>
              <option value="">Sin categoría</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="adm-field"><span>Descripción</span>
            <textarea rows="4" value={f.description} onChange={(e) => set('description', e.target.value)} placeholder="Contá de qué se trata el producto…" maxLength={1200} />
          </label>
          <label className={'adm-field' + (errs.external_url ? ' bad' : '')}><span>Enlace externo (opcional)</span>
            <input type="url" value={f.external_url} onChange={(e) => set('external_url', e.target.value)} placeholder="https://…" />
            {errs.external_url ? <small>{errs.external_url}</small> : <small className="adm-hint">Enlace a más info. El pedido igual se hace por el carrito.</small>}
          </label>

          <div className="adm-toggles">
            <label><button type="button" role="switch" aria-checked={f.active} className={'adm-switch' + (f.active ? ' on' : '')} onClick={() => set('active', !f.active)}><i /></button>
              <div><strong>Visible en la tienda</strong><small>Si lo apagás, se oculta sin borrarlo.</small></div></label>
            <label><button type="button" role="switch" aria-checked={f.featured} className={'adm-switch' + (f.featured ? ' on' : '')} onClick={() => set('featured', !f.featured)}><i /></button>
              <div><strong>Destacado en el inicio</strong><small>Aparece primero en “Productos destacados”.</small></div></label>
          </div>
        </div>
        <div className="adm-drawer-foot">
          <button type="button" className="adm-btn adm-btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="adm-btn adm-btn-primary" disabled={busy}>{busy ? 'Guardando…' : isNew ? 'Crear producto' : 'Guardar cambios'}</button>
        </div>
      </form>
    </div>
  )
}

/* ---------- categorías ---------- */
function CategoriesView({ cats, reload, notify }) {
  const [edit, setEdit] = useState(null)
  const [del, setDel] = useState(null)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => { setName(edit?.name || '') }, [edit])

  const save = async (e) => {
    e.preventDefault()
    const n = name.trim(); if (!n) return
    setBusy(true)
    try {
      if (edit.id) await api.updateCategory(edit.id, { name: n }); else await api.createCategory({ name: n })
      notify(edit.id ? 'Categoría actualizada' : 'Categoría creada'); setEdit(null); reload()
    } catch (e) { notify(e.message, 'err') } finally { setBusy(false) }
  }
  const remove = async () => {
    try { await api.deleteCategory(del.id); notify('Categoría eliminada'); setDel(null); reload() }
    catch (e) { notify(e.message, 'err') }
  }
  const move = async (c, dir) => {
    const i = cats.findIndex((x) => x.id === c.id), o = cats[i + dir]
    if (!o) return
    try { await Promise.all([api.updateCategory(c.id, { sort_order: o.sort_order }), api.updateCategory(o.id, { sort_order: c.sort_order })]); reload() }
    catch (e) { notify(e.message, 'err') }
  }

  return (
    <>
      <div className="adm-head">
        <div><h1 className="adm-h1">Categorías</h1><p className="adm-muted">Organizan los productos. Al eliminar una, sus productos quedan “sin categoría”.</p></div>
        <button className="adm-btn adm-btn-primary" onClick={() => setEdit({})}><Icon n="plus" />Nueva categoría</button>
      </div>
      <div className="adm-card adm-list">
        {cats.length === 0 && <div className="adm-empty"><Icon n="tag" size={34} /><h3>Sin categorías</h3><p className="adm-muted">Creá la primera para ordenar tus productos.</p></div>}
        {cats.map((c, i) => (
          <div className="adm-cat" key={c.id}>
            <div className="adm-order">
              <button className="adm-icon-btn sm" disabled={i === 0} onClick={() => move(c, -1)} aria-label="Subir">↑</button>
              <button className="adm-icon-btn sm" disabled={i === cats.length - 1} onClick={() => move(c, 1)} aria-label="Bajar">↓</button>
            </div>
            <strong>{c.name}</strong>
            <div className="adm-actions">
              <button className="adm-icon-btn" aria-label="Editar" onClick={() => setEdit(c)}><Icon n="edit" /></button>
              <button className="adm-icon-btn danger" aria-label="Eliminar" onClick={() => setDel(c)}><Icon n="trash" /></button>
            </div>
          </div>
        ))}
      </div>
      {edit && (
        <Modal title={edit.id ? 'Editar categoría' : 'Nueva categoría'} onClose={() => setEdit(null)}>
          <form onSubmit={save}>
            <label className="adm-field"><span>Nombre</span><input autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={80} /></label>
            <div className="adm-modal-actions">
              <button type="button" className="adm-btn adm-btn-ghost" onClick={() => setEdit(null)}>Cancelar</button>
              <button className="adm-btn adm-btn-primary" disabled={busy || !name.trim()}>Guardar</button>
            </div>
          </form>
        </Modal>
      )}
      {del && (
        <Modal title="Eliminar categoría" onClose={() => setDel(null)}>
          <p>¿Eliminar <strong>{del.name}</strong>? Los productos de esta categoría no se borran.</p>
          <div className="adm-modal-actions">
            <button className="adm-btn adm-btn-ghost" onClick={() => setDel(null)}>Cancelar</button>
            <button className="adm-btn adm-btn-danger" onClick={remove}>Eliminar</button>
          </div>
        </Modal>
      )}
    </>
  )
}

/* ---------- ajustes ---------- */
function SettingsView({ notify }) {
  const [f, setF] = useState(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => { api.settings().then(setF).catch((e) => notify(e.message, 'err')) }, [notify])
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }))
  const save = async (e) => {
    e.preventDefault(); setBusy(true)
    try { await api.saveSettings(f); notify('Ajustes guardados') } catch (e) { notify(e.message, 'err') } finally { setBusy(false) }
  }
  if (!f) return <div className="adm-empty"><div className="adm-spinner" /></div>
  const FIELDS = [
    ['brand_name', 'Nombre de la marca', 'text', 'RAMSA'],
    ['whatsapp', 'WhatsApp (con código de país)', 'text', 'Ej: 549351...'],
    ['email', 'Email', 'email', 'hola@ramsa.com'],
    ['instagram', 'Instagram (link)', 'url', 'https://instagram.com/…'],
    ['facebook', 'Facebook (link)', 'url', 'https://facebook.com/…'],
    ['tiktok', 'TikTok (link)', 'url', 'https://tiktok.com/@…'],
  ]
  return (
    <>
      <div className="adm-head"><div><h1 className="adm-h1">Ajustes</h1><p className="adm-muted">Datos de contacto y textos de la tienda.</p></div></div>
      <form className="adm-card adm-settings" onSubmit={save}>
        <div className="adm-note"><Icon n="star" size={14} /> El WhatsApp es el que recibe los pedidos del carrito y las consultas. Sin ese número, el botón de pedido queda deshabilitado.</div>
        <div className="adm-two-grid">
          {FIELDS.map(([k, label, type, ph]) => (
            <label className="adm-field" key={k}><span>{label}</span>
              <input type={type} value={f[k] || ''} onChange={(e) => set(k, e.target.value)} placeholder={ph} />
            </label>
          ))}
        </div>
        <label className="adm-field"><span>Sobre la marca (sección “Nosotras”)</span>
          <textarea rows="4" value={f.about || ''} onChange={(e) => set('about', e.target.value)} maxLength={600} />
        </label>
        <label className="adm-field"><span>Texto de venta por mayor</span>
          <textarea rows="3" value={f.wholesale || ''} onChange={(e) => set('wholesale', e.target.value)} maxLength={400} />
        </label>
        <div className="adm-settings-foot">
          <button className="adm-btn adm-btn-primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar ajustes'}</button>
        </div>
      </form>
    </>
  )
}

function Modal({ title, onClose, children }) {
  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k) }, [onClose])
  return (
    <div className="adm-modal-wrap" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal" role="dialog" aria-modal="true" aria-label={title}>
        <h2 className="adm-h2">{title}</h2>
        {children}
      </div>
    </div>
  )
}
