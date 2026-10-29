const TOKEN_KEY = 'ramsa_admin_token'
export const getToken = () => { try { return localStorage.getItem(TOKEN_KEY) } catch { return null } }
export const setToken = (t) => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY) } catch {} }

async function req(path, { method = 'GET', body, auth = false, form = false } = {}) {
  const headers = {}
  if (auth) { const t = getToken(); if (t) headers.Authorization = 'Bearer ' + t }
  let payload
  if (form) payload = body
  else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body) }
  let res
  try { res = await fetch('/api' + path, { method, headers, body: payload }) }
  catch { throw new Error('No se pudo conectar con el servidor') }
  const ct = res.headers.get('content-type') || ''
  if (!ct.includes('application/json')) {
    const e = new Error('La API no está respondiendo')
    e.status = res.status
    throw e
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) { const e = new Error(data.error || 'Ocurrió un error'); e.status = res.status; throw e }
  return data
}

export const api = {
  login: (email, password) => req('/auth/login', { method: 'POST', body: { email, password } }),
  me: () => req('/auth/me', { auth: true }),
  settings: () => req('/settings'),
  saveSettings: (b) => req('/settings', { method: 'PUT', body: b, auth: true }),
  categories: () => req('/categories'),
  createCategory: (b) => req('/categories', { method: 'POST', body: b, auth: true }),
  updateCategory: (id, b) => req('/categories/' + id, { method: 'PUT', body: b, auth: true }),
  deleteCategory: (id) => req('/categories/' + id, { method: 'DELETE', auth: true }),
  products: (query = '') => req('/products' + query),
  product: (slug) => req('/products/' + encodeURIComponent(slug)),
  adminProducts: () => req('/admin/products', { auth: true }),
  createProduct: (b) => req('/products', { method: 'POST', body: b, auth: true }),
  updateProduct: (id, b) => req('/products/' + id, { method: 'PUT', body: b, auth: true }),
  deleteProduct: (id) => req('/products/' + id, { method: 'DELETE', auth: true }),
  upload: (file) => { const fd = new FormData(); fd.append('file', file); return req('/uploads', { method: 'POST', body: fd, auth: true, form: true }) },
}
