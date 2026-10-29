import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../lib/store.jsx'
import { api } from '../lib/api.js'
import { useReveal } from '../lib/reveal.js'
import ProductCard from '../components/ProductCard.jsx'

const HERO_IMG = 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=80'
const CAT_IMAGES = {
  'lecturas-manos-tarot': 'https://tiendaramsa.com.ar/wp-content/uploads/2026/05/ed33a534-e7a8-4585-a309-f6ab95fe4b6e.webp',
  'piedras-energeticas': 'https://tiendaramsa.com.ar/wp-content/uploads/2026/05/277bee9d-705a-4728-8f5b-7e73f9eee7a1.webp',
  'sahumerios-naturales': 'https://tiendaramsa.com.ar/wp-content/uploads/2026/08/IMG_20260620_174701-scaled.jpg',
  'cosmetica-natural': 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=800&q=80',
  'mazos-y-oraculos': 'https://images.unsplash.com/photo-1704030328221-94fa7e021808?auto=format&fit=crop&w=800&q=80',
}

export default function Home() {
  const { settings, categories, cart } = useApp()
  const nav = useNavigate()
  const [products, setProducts] = useState([])

  useEffect(() => { api.products('?limit=60').then(setProducts).catch(() => {}) }, [])
  useReveal([products, categories])

  const featured = useMemo(() => {
    const f = products.filter((p) => p.featured)
    return (f.length ? f : products).slice(0, 8)
  }, [products])

  const thumbFor = (cat) => {
    if (!cat) return null
    return products.find((p) => p.category_id === cat.id && p.image_url)?.image_url || CAT_IMAGES[cat.slug] || null
  }

  const waWholesale = cart.waLink(`Hola ${settings.brand_name || 'RAMSA'}, quiero consultar condiciones de venta por mayor.`)
  const tiles = categories.slice(0, 5)

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <img src={HERO_IMG} alt="" aria-hidden="true" onError={e => { e.target.style.display = 'none' }} />
        <div className="wrap">
          <span className="eyebrow">Naturaleza · Artesanía · Bienestar</span>
          <h1>Rituales que conectan con tu <em>esencia</em></h1>
          <p>Descubrí un universo de aromas, naturaleza y pequeños rituales para acompañar tus momentos.</p>
          <div className="cta">
            <Link className="btn btn-primary" to="/tienda">Explorar colección</Link>
            <a className="btn btn-ghost" href="#universo">Conocé {settings.brand_name || 'RAMSA'}</a>
          </div>
        </div>
      </section>

      <div className="features">
        <div className="wrap">
          <div className="feat"><span className="feat-icon" aria-hidden="true">🌿</span> 100% Natural</div>
          <div className="feat"><span className="feat-icon" aria-hidden="true">✋</span> Hecho a mano</div>
          <div className="feat"><span className="feat-icon" aria-hidden="true">🔮</span> Desde 1980</div>
          <div className="feat"><span className="feat-icon" aria-hidden="true">📦</span> Envío a todo el país</div>
        </div>
      </div>

      {/* Categorías */}
      {tiles.length > 0 && (
        <section id="categorias">
          <div className="wrap">
            <div className="head rv">
              <div><span className="eyebrow">Colecciones</span><h2>Elegí tu ritual</h2></div>
              <p>Explorá el universo {settings.brand_name || 'RAMSA'}, desde lecturas y piedras hasta aromas y cosmética natural.</p>
            </div>
            <div className="cats">
              {tiles.map((c, i) => {
                const img = thumbFor(c)
                return (
                  <Link key={c.id} className={`cat c${i + 1} ph rv`} to={`/tienda?cat=${c.slug}`}>
                    {img && <img loading="lazy" src={img} alt="" />}
                    <div className="in"><h3>{c.name}</h3><span className="go">Ver productos →</span></div>
                  </Link>
                )
              })}
              <Link className="cat c6 ph rv" to="/tienda">
                <div className="in">
                  <div><h3>Ventas Por Mayor</h3><p>Para comercios, terapeutas y emprendedoras que quieren sumar {settings.brand_name || 'RAMSA'}.</p></div>
                  <span className="go">Consultar condiciones →</span>
                </div>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Destacados */}
      {featured.length > 0 && (
        <section className="products" id="destacados">
          <div className="wrap">
            <div className="head rv">
              <div><span className="eyebrow">Selección</span><h2>Productos destacados</h2></div>
              <Link className="btn btn-line" to="/tienda">Ver toda la tienda</Link>
            </div>
            <div className="grid-cards">
              {featured.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Editorial */}
      <section className="edit" id="universo">
        <div className="wrap">
          <div className="collage rv">
            <div className="a ph">{thumbFor(tiles[0]) && <img loading="lazy" src={thumbFor(tiles[0])} alt="" />}</div>
            <div className="b ph">{thumbFor(tiles[2]) && <img loading="lazy" src={thumbFor(tiles[2])} alt="" />}</div>
          </div>
          <div className="rv">
            <span className="eyebrow">El universo {settings.brand_name || 'RAMSA'}</span>
            <h2>Pequeños rituales, grandes momentos</h2>
            <p>{settings.about || 'Productos naturales y artesanales pensados para acompañar tu casa y tus días.'}</p>
            <div className="pills"><span>Hecho a mano</span><span>Naturaleza</span><span>Aromas</span><span>Bienestar</span></div>
            <Link className="btn btn-primary" to="/tienda">Explorar colección</Link>
          </div>
        </div>
      </section>

      {/* Receta */}
      <section className="receta">
        <div className="wrap">
          <div className="photo ph rv">{featured[0]?.image_url && <img loading="lazy" src={featured[0].image_url} alt="" />}</div>
          <div className="rv">
            <span className="eyebrow">Receta artesanal</span>
            <h2>Lo hecho a mano tiene su propio tiempo</h2>
            <p>Detrás de cada mezcla hay una receta familiar elaborada con dedicación. Conocé el proceso que da vida a los productos.</p>
            <Link className="btn btn-light" to="/receta-artesanal">Conocer el proceso</Link>
          </div>
        </div>
      </section>

      {/* Mayorista */}
      <section className="mayor" id="mayorista">
        <div className="wrap">
          <div className="box rv">
            <div>
              <span className="eyebrow">Ventas por mayor</span>
              <h2>{settings.brand_name || 'RAMSA'} también crece con vos</h2>
              <p>{settings.wholesale || 'Si tenés un comercio o un emprendimiento y querés sumar nuestros productos, escribinos por condiciones y disponibilidad.'}</p>
            </div>
            <div className="side">
              {waWholesale
                ? <a className="btn btn-primary" href={waWholesale} target="_blank" rel="noopener">Consultar condiciones</a>
                : <button className="btn btn-primary" onClick={() => nav('/tienda')}>Ver productos</button>}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
