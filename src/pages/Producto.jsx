import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useApp, money } from '../lib/store.jsx'
import { api } from '../lib/api.js'
import ProductCard from '../components/ProductCard.jsx'
import { Plus, Minus, Wa, ChevRight } from '../components/icons.jsx'

export default function Producto() {
  const { slug } = useParams()
  const { cart } = useApp()
  const nav = useNavigate()
  const [p, setP] = useState(undefined) // undefined=cargando, null=no existe
  const [related, setRelated] = useState([])
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    setP(undefined); setQty(1); setAdded(false)
    api.product(slug).then((prod) => {
      setP(prod)
      if (prod.category_slug) api.products('?category=' + prod.category_slug + '&limit=5')
        .then((r) => setRelated(r.filter((x) => x.id !== prod.id).slice(0, 4))).catch(() => {})
    }).catch(() => setP(null))
  }, [slug])

  if (p === undefined) return <div className="page-loader"><span className="spinner" /></div>
  if (p === null) return (
    <div className="wrap notfound">
      <h1>Producto no encontrado</h1>
      <p>Puede que ya no esté disponible.</p>
      <Link className="btn btn-primary" to="/tienda">Volver a la tienda</Link>
    </div>
  )

  const out = p.stock === 0
  const lowStock = p.stock !== null && p.stock > 0 && p.stock <= 3
  const waConsult = cart.waLink(`Hola, quiero consultar por: ${p.name}`)
  const addToCart = () => { cart.add(p, qty); setAdded(true); cart.setOpen(true) }

  return (
    <div className="pdp">
      <div className="wrap">
        <nav className="crumbs" aria-label="Migas">
          <Link to="/">Inicio</Link><ChevRight />
          <Link to="/tienda">Tienda</Link>
          {p.category_name && <><ChevRight /><Link to={`/tienda?cat=${p.category_slug}`}>{p.category_name}</Link></>}
          <ChevRight /><span>{p.name}</span>
        </nav>

        <div className="pdp-main">
          <div className="pdp-media ph">
            {p.image_url && <img src={p.image_url} alt={p.name} />}
            {out && <span className="badge-stock">Sin stock</span>}
          </div>
          <div className="pdp-info">
            {p.category_name && <Link className="pdp-cat" to={`/tienda?cat=${p.category_slug}`}>{p.category_name}</Link>}
            <h1>{p.name}</h1>
            <div className="pdp-price">{money(p.price)}</div>
            {p.description && <p className="pdp-desc">{p.description}</p>}

            <div className="pdp-stock">
              {out ? <span className="dot red" /> : <span className="dot green" />}
              {out ? 'Sin stock por ahora' : lowStock ? `¡Últimas ${p.stock} unidades!` : 'Disponible'}
            </div>

            {!out && (
              <div className="pdp-buy">
                <div className="qty big">
                  <button aria-label="Menos" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus /></button>
                  <span>{qty}</span>
                  <button aria-label="Más" onClick={() => setQty((q) => q + 1)}><Plus /></button>
                </div>
                <button className="btn btn-primary" onClick={addToCart}>{added ? 'Agregado ✓' : 'Agregar al carrito'}</button>
              </div>
            )}

            {waConsult && (
              <a className="btn btn-line btn-wa-line" href={waConsult} target="_blank" rel="noopener"><Wa />Consultar por WhatsApp</a>
            )}
            {p.external_url && (
              <a className="btn btn-line" href={p.external_url} target="_blank" rel="noopener">Ver más información</a>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="pdp-related">
            <h2>También te puede gustar</h2>
            <div className="grid-cards">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div>
          </section>
        )}
      </div>
    </div>
  )
}
