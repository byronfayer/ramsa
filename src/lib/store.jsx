import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from './api.js'

export const money = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(Number(n) || 0)

const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)
export const useCart = () => useContext(AppCtx).cart
export const useSettings = () => useContext(AppCtx).settings

const CART_KEY = 'ramsa_cart'
const loadCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || [] } catch { return [] } }

const DEFAULTS = { brand_name: 'RAMSA', whatsapp: '', email: '', instagram: '', facebook: '', tiktok: '', about: '', wholesale: '' }

export function AppDataProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS)
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState(loadCart)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    api.settings().then((s) => setSettings({ ...DEFAULTS, ...s })).catch(() => {})
    api.categories().then(setCategories).catch(() => {})
  }, [])
  useEffect(() => { try { localStorage.setItem(CART_KEY, JSON.stringify(items)) } catch {} }, [items])

  const add = useCallback((p, qty = 1) => setItems((s) => {
    const i = s.findIndex((x) => x.id === p.id)
    if (i >= 0) { const c = [...s]; c[i] = { ...c[i], qty: c[i].qty + qty }; return c }
    return [...s, { id: p.id, slug: p.slug, name: p.name, price: p.price, image_url: p.image_url, qty }]
  }), [])
  const setQty = (id, qty) => setItems((s) => (qty <= 0 ? s.filter((x) => x.id !== id) : s.map((x) => (x.id === id ? { ...x, qty } : x))))
  const remove = (id) => setItems((s) => s.filter((x) => x.id !== id))
  const clear = () => setItems([])

  const count = items.reduce((a, b) => a + b.qty, 0)
  const total = items.reduce((a, b) => a + b.price * b.qty, 0)
  const waNumber = (settings.whatsapp || '').replace(/\D/g, '')
  const waLink = (text) => (waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}` : null)
  const checkout = () => {
    if (!items.length) return null
    const lines = items.map((i) => `• ${i.qty}× ${i.name} — ${money(i.price * i.qty)}`).join('\n')
    return waLink(`¡Hola ${settings.brand_name || 'RAMSA'}! Quiero hacer este pedido:\n\n${lines}\n\nTotal: ${money(total)}`)
  }

  const cart = { items, add, setQty, remove, clear, count, total, open, setOpen, checkout, waLink, waNumber }
  return <AppCtx.Provider value={{ settings, setSettings, categories, cart }}>{children}</AppCtx.Provider>
}
