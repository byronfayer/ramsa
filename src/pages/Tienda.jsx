import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useApp } from '../lib/store.jsx'
import { api } from '../lib/api.js'
import { useReveal } from '../lib/reveal.js'
import ProductCard from '../components/ProductCard.jsx'
import { Search } from '../components/icons.jsx'

export default function Tienda() {
  const { categories } = useApp()
  const [params, setParams] = useSearchParams()
  const cat = params.get('cat') || ''
  const sort = params.get('sort') || ''
  const q = params.get('q') || ''
  const [search, setSearch] = useState(q)
  const [items, setItems] = useState(null)

  useEffect(() => { setSearch(q) }, [q])

  useEffect(() => {
    setItems(null)
    const qs = new URLSearchParams()
    if (cat) qs.set('category', cat)
    if (sort) qs.set('sort', sort)
    if (q) qs.set('q', q)
    api.products('?' + qs.toString()).then(setItems).catch(() => setItems([]))
  }, [cat, sort, q])

  useReveal([items])

  const patch = (k, v) => { const p = new URLSearchParams(params); v ? p.set(k, v) : p.delete(k); setParams(p, { replace: true }) }
  const submitSearch = (e) => { e.preventDefault(); patch('q', search.trim()) }
  const catName = categories.find((c) => c.slug === cat)?.name

  return (
    <div className="shop">
      <div className="wrap">
        <header className="shop-head rv">
          <span className="eyebrow">Tienda</span>
          <h1>{catName || 'Todos los productos'}</h1>
          <p>Elegí tus productos y sumalos al carrito. Finalizás el pedido por WhatsApp.</p>
        </header>

        <div className="shop-bar">
          <div className="chips">
            <button className={'chip' + (!cat ? ' on' : '')} onClick={() => patch('cat', '')}>Todas</button>
            {categories.map((c) => (
              <button key={c.id} className={'chip' + (cat === c.slug ? ' on' : '')} onClick={() => patch('cat', c.slug)}>{c.name}</button>
            ))}
          </div>
          <div className="shop-tools">
            <form className="shop-search" onSubmit={submitSearch}>
              <Search />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar…" aria-label="Buscar productos" />
            </form>
            <select value={sort} onChange={(e) => patch('sort', e.target.value)} aria-label="Ordenar">
              <option value="">Más recientes</option>
              <option value="price_asc">Precio: menor a mayor</option>
              <option value="price_desc">Precio: mayor a menor</option>
              <option value="name">Nombre (A–Z)</option>
            </select>
          </div>
        </div>

        {items === null && <div className="page-loader"><span className="spinner" /></div>}
        {items && items.length === 0 && (
          <div className="shop-empty">
            <h3>No encontramos productos</h3>
            <p>Probá con otra categoría o quitá la búsqueda.</p>
            <button className="btn btn-line" onClick={() => setParams({})}>Ver todo</button>
          </div>
        )}
        {items && items.length > 0 && (
          <div className="grid-cards shop-grid">
            {items.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
