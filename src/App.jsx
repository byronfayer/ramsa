import { useEffect, useState } from 'react'
import { SITE, LOGO, CONTACT, IMG, CATEGORIES, PRODUCTS } from './data.js'

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.rv')
    if (!('IntersectionObserver' in window)) return els.forEach((e) => e.classList.add('in'))
    const io = new IntersectionObserver(
      (es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target) } }),
      { threshold: 0.12 }
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [])
}

function Header() {
  const [open, setOpen] = useState(false)
  const [sub, setSub] = useState(false)
  const close = () => { setOpen(false); setSub(false) }
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : '' }, [open])
  const mobile = () => window.matchMedia('(max-width:960px)').matches
  return (
    <header className="top">
      <div className="wrap">
        <a className="brand" href="#" aria-label="RAMSA, inicio">
          <img src={LOGO} alt="" width="44" height="44" />
          <span>RAMSA</span>
        </a>
        <nav aria-label="Principal">
          <ul className={'nav' + (open ? ' open' : '')} id="nav">
            <li><a href="#" onClick={close}>Inicio</a></li>
            <li><a href={`${SITE}/tienda/`}>Tienda</a></li>
            <li className={'has-sub' + (sub ? ' open' : '')}>
              <a href="#categorias" aria-haspopup="true" aria-expanded={sub}
                 onClick={(e) => { if (mobile()) { e.preventDefault(); setSub(!sub) } else close() }}>Categorías</a>
              <div className="sub">
                {CATEGORIES.map((c) => <a key={c.id} href={c.href} onClick={close}>{c.name}</a>)}
                <a href="#mayorista" onClick={close}>Ventas Por Mayor</a>
              </div>
            </li>
            <li><a href={`${SITE}/receta-artesanal/`}>Receta artesanal</a></li>
            <li><a href={`${SITE}/terminos-y-condiciones/`}>Términos y condiciones</a></li>
          </ul>
        </nav>
        <div className="actions">
          <a className="icon-btn" href={`${SITE}/mi-cuenta/`} aria-label="Mi cuenta"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4.5 4.2-6.5 8-6.5s7 2 8 6.5" /></svg></a>
          <a className="icon-btn" href={`${SITE}/carrito/`} aria-label="Carrito"><svg viewBox="0 0 24 24"><path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></svg></a>
          <button className="icon-btn burger" aria-label="Abrir menú" aria-expanded={open} aria-controls="nav" onClick={() => setOpen(!open)}>
            <svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <div className="hero">
      <img src={IMG.hero} alt="Composición con elementos naturales y artesanales" fetchpriority="high" width="1800" height="1100" />
      <div className="wrap">
        <span className="eyebrow">Naturaleza · Artesanía · Bienestar</span>
        <h1>Rituales que conectan con tu <em>esencia.</em></h1>
        <p>Descubrí un universo de aromas, naturaleza y pequeños rituales para acompañar tus momentos.</p>
        <div className="cta">
          <a className="btn btn-primary" href={`${SITE}/tienda/`}>Explorar colección</a>
          <a className="btn btn-ghost" href="#universo">Conocé RAMSA</a>
        </div>
      </div>
    </div>
  )
}

function Categories() {
  return (
    <section id="categorias">
      <div className="wrap">
        <div className="head rv">
          <div><span className="eyebrow">Colecciones</span><h2>Elegí tu ritual</h2></div>
          <p>Seis caminos para explorar el universo RAMSA, desde lecturas y piedras hasta aromas y cosmética natural.</p>
        </div>
        <div className="cats">
          {CATEGORIES.map((c, i) => (
            <a key={c.id} className={`cat c${i + 1} ph rv`} href={c.href}>
              <img loading="lazy" src={c.img} alt={c.alt} />
              <div className="in"><h3>{c.name}</h3><p>{c.text}</p><span className="go">{c.cta} →</span></div>
            </a>
          ))}
          <a className="cat c6 ph rv" href="#mayorista">
            <img loading="lazy" src={IMG.mayor} alt="Productos RAMSA para venta por mayor" />
            <div className="in">
              <div><h3>Ventas Por Mayor</h3><p>Para comercios, terapeutas y emprendedoras que quieren sumar RAMSA.</p></div>
              <span className="go">Consultar condiciones →</span>
            </div>
          </a>
        </div>
      </div>
    </section>
  )
}

const money = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(n) || 0)

// Productos de respaldo (los actuales de la tienda) si Supabase está vacío o no responde.
const FALLBACK = PRODUCTS.map((p) => ({
  key: p.id, name: p.name, price: p.price, img: p.img, href: `${SITE}/product/${p.slug}/`,
  actions: [
    { label: 'Agregar al carrito', href: `${SITE}/tienda/?add-to-cart=${p.id}` },
    { label: 'Ver ficha', href: `${SITE}/product/${p.slug}/`, ghost: true },
  ],
}))

function useProducts() {
  const [items, setItems] = useState(FALLBACK)
  useEffect(() => {
    let on = true
    import('./lib/supabase.js').then(({ supabase }) =>
      supabase.from('products')
        .select('id,name,price,image_url,stock,external_url,featured,description')
        .eq('active', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(8)
    ).then(({ data, error }) => {
      if (!on || error || !data || !data.length) return
      const wa = CONTACT.whatsapp.replace(/\D/g, '')
      setItems(data.map((p) => {
        const out = p.stock === 0
        const actions = out ? [] : p.external_url
          ? [{ label: 'Ver producto', href: p.external_url }]
          : wa ? [{ label: 'Consultar', href: `https://wa.me/${wa}?text=${encodeURIComponent('Hola RAMSA, quiero consultar por: ' + p.name)}` }]
          : CONTACT.email ? [{ label: 'Consultar', href: `mailto:${CONTACT.email}?subject=${encodeURIComponent('Consulta: ' + p.name)}` }] : []
        return { key: p.id, name: p.name, price: money(p.price), img: p.image_url, href: p.external_url || null, out, actions }
      }))
    }).catch(() => {})
    return () => { on = false }
  }, [])
  return items
}

function Products() {
  const items = useProducts()
  return (
    <section className="products" id="destacados">
      <div className="wrap">
        <div className="head rv">
          <div><span className="eyebrow">Selección</span><h2>Productos destacados</h2></div>
          <a className="btn btn-line" href={`${SITE}/tienda/`}>Ver toda la tienda</a>
        </div>
        <div className="grid4">
          {items.map((p) => {
            const media = p.img ? <img loading="lazy" src={p.img} alt={p.name} /> : null
            return (
              <article key={p.key} className="prod in">
                {p.href
                  ? <a className="img ph" href={p.href} aria-label={p.name}>{media}{p.out && <span className="badge-stock">Sin stock</span>}</a>
                  : <div className="img ph">{media}{p.out && <span className="badge-stock">Sin stock</span>}</div>}
                <h3>{p.href ? <a href={p.href}>{p.name}</a> : p.name}</h3>
                <div className="price">{p.price}</div>
                {p.actions.length > 0 && (
                  <div className="row">
                    {p.actions.map((a) => (
                      <a key={a.label} className={'btn ' + (a.ghost ? 'btn-line fichabtn' : 'btn-primary')} href={a.href}>{a.label}</a>
                    ))}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function About() {
  return (
    <section className="edit" id="universo">
      <div className="wrap">
        <div className="collage rv">
          <div className="a ph"><img loading="lazy" src={IMG.nosotras} alt="Ambiente cálido con elementos naturales" /></div>
          <div className="b ph"><img loading="lazy" src={IMG.receta2} alt="Detalle de producto artesanal" /></div>
        </div>
        <div className="rv">
          <span className="eyebrow">El universo RAMSA</span>
          <h2>Pequeños rituales, grandes momentos</h2>
          <p>Somos una marca familiar que comenzó en Carlos Paz aproximadamente en 1980. Con cada producto llevás magia y años de trayectoria. Lo mejor para energizar y revitalizar tu hogar.</p>
          <div className="pills"><span>Hecho a mano</span><span>Naturaleza</span><span>Aromas</span><span>Bienestar</span></div>
          <a className="btn btn-primary" href={`${SITE}/tienda/`}>Explorar colección</a>
        </div>
      </div>
    </section>
  )
}

function Recipe() {
  return (
    <section className="receta" id="receta">
      <div className="wrap">
        <div className="photo ph rv"><img loading="lazy" src={IMG.receta} alt="Elaboración artesanal" /></div>
        <div className="rv">
          <span className="eyebrow">Receta artesanal</span>
          <h2>Lo hecho a mano tiene su propio tiempo</h2>
          <p>Detrás de cada mezcla hay una receta familiar elaborada con dedicación. Conocé el proceso que da vida a los productos RAMSA.</p>
          <a className="btn btn-light" href={`${SITE}/receta-artesanal/`}>Conocer el proceso</a>
        </div>
      </div>
    </section>
  )
}

function Wholesale() {
  const wa = CONTACT.whatsapp.replace(/\D/g, '')
  const href = wa
    ? `https://wa.me/${wa}?text=${encodeURIComponent('Hola RAMSA, quiero consultar condiciones de venta por mayor.')}`
    : CONTACT.email
      ? `mailto:${CONTACT.email}?subject=${encodeURIComponent('Consulta venta por mayor')}`
      : '#contacto'
  return (
    <section className="mayor" id="mayorista">
      <div className="wrap">
        <div className="box rv">
          <div>
            <span className="eyebrow">Ventas por mayor</span>
            <h2>RAMSA también crece con vos</h2>
            <p>Si tenés un comercio, un espacio de bienestar o un emprendimiento y querés sumar productos RAMSA, consultanos por condiciones y disponibilidad.</p>
          </div>
          <div className="side"><a className="btn btn-primary" href={href}>Consultar condiciones</a></div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const wa = CONTACT.whatsapp.replace(/\D/g, '')
  const links = [
    wa && ['WhatsApp', `https://wa.me/${wa}`],
    CONTACT.email && [CONTACT.email, `mailto:${CONTACT.email}`],
    CONTACT.instagram && ['Instagram', CONTACT.instagram],
    CONTACT.facebook && ['Facebook', CONTACT.facebook],
    CONTACT.tiktok && ['TikTok', CONTACT.tiktok],
  ].filter(Boolean)
  return (
    <footer id="contacto">
      <div className="wrap">
        <div className="fgrid">
          <div>
            <a className="brand" href="#"><img src={LOGO} alt="" width="44" height="44" loading="lazy" /><span>RAMSA</span></a>
            <p className="tag">Aromas, naturaleza y pequeños rituales para acompañar tus momentos.</p>
          </div>
          <div>
            <h4>Navegación</h4>
            <ul>
              <li><a href="#">Inicio</a></li>
              <li><a href={`${SITE}/tienda/`}>Tienda</a></li>
              <li><a href={`${SITE}/receta-artesanal/`}>Receta artesanal</a></li>
              <li><a href={`${SITE}/terminos-y-condiciones/`}>Términos y condiciones</a></li>
              <li><a href={`${SITE}/mi-cuenta/`}>Mi cuenta</a></li>
            </ul>
          </div>
          <div>
            <h4>Categorías</h4>
            <ul>{CATEGORIES.map((c) => <li key={c.id}><a href={c.href}>{c.name}</a></li>)}</ul>
          </div>
          {links.length > 0 && (
            <div>
              <h4>Contacto</h4>
              <ul>{links.map(([l, h]) => <li key={l}><a href={h} target={h.startsWith('http') ? '_blank' : undefined} rel="noopener">{l}</a></li>)}</ul>
            </div>
          )}
        </div>
        <div className="fbot">
          <span>© {new Date().getFullYear()} RAMSA. Todos los derechos reservados.</span>
          <a href={`${SITE}/terminos-y-condiciones/`}>Términos y condiciones</a>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  useReveal()
  return (
    <>
      <a className="sr" href="#main">Saltar al contenido</a>
      <Header />
      <main id="main">
        <Hero /><Categories /><Products /><About /><Recipe /><Wholesale />
      </main>
      <Footer />
    </>
  )
}
