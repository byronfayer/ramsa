import { Link } from 'react-router-dom'
import { useApp, money } from '../lib/store.jsx'

export default function ProductCard({ p }) {
  const { cart } = useApp()
  const out = p.stock === 0
  const to = `/producto/${p.slug}`
  return (
    <article className="pcard rv">
      <Link className={`pcard-img${p.image_url ? '' : ' ph'}`} to={to} aria-label={p.name}>
        {p.image_url && <img loading="lazy" src={p.image_url} alt={p.name} />}
        {out && <span className="badge-stock">Sin stock</span>}
        {p.featured && !out && <span className="badge-feat">Destacado</span>}
      </Link>
      <div className="pcard-body">
        {p.category_name && <span className="pcard-cat">{p.category_name}</span>}
        <h3><Link to={to}>{p.name}</Link></h3>
        <div className="pcard-price">{money(p.price)}</div>
        {out
          ? <button className="btn btn-line" disabled>Sin stock</button>
          : <button className="btn btn-primary" onClick={() => { cart.add(p); cart.setOpen(true) }}>Agregar al carrito</button>}
      </div>
    </article>
  )
}
