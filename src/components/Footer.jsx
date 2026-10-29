import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../lib/store.jsx'
import { Mark, Instagram, Facebook, TikTokIcon, Wa } from './icons.jsx'

function SocialLinks({ className = '' }) {
  const { settings } = useApp()
  const wa = (settings.whatsapp || '').replace(/\D/g, '')
  const links = [
    settings.instagram && ['Instagram', settings.instagram, <Instagram key="ig" />],
    settings.facebook && ['Facebook', settings.facebook, <Facebook key="fb" />],
    settings.tiktok && ['TikTok', settings.tiktok, <TikTokIcon key="tt" />],
    wa && ['WhatsApp', `https://wa.me/${wa}`, <Wa key="wa" />],
  ].filter(Boolean)

  if (!links.length) return null
  return (
    <div className={`social-row ${className}`}>
      {links.map(([label, url, icon]) => (
        <a key={label} className="social-link" href={url} target="_blank" rel="noopener" aria-label={label}>
          {icon}
        </a>
      ))}
    </div>
  )
}

export default function Footer() {
  const { settings, categories } = useApp()
  const nav = useNavigate()
  const wa = (settings.whatsapp || '').replace(/\D/g, '')
  const contact = [
    wa && ['WhatsApp', `https://wa.me/${wa}`],
    settings.email && ['Email', `mailto:${settings.email}`],
  ].filter(Boolean)

  return (
    <>
      <section className="seguinos">
        <div className="wrap">
          <span className="eyebrow" style={{ color: 'rgba(247,243,236,.7)' }}>Comunidad</span>
          <h2>Seguinos en nuestras redes</h2>
          <p>Recibí novedades, tips de bienestar y ofertas exclusivas de nuestros productos artesanales.</p>
          <SocialLinks />
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="fgrid">
            <div>
              <Link className="brand" to="/"><Mark /><span>{settings.brand_name || 'RAMSA'}</span></Link>
              <p className="tag">Aromas, naturaleza y pequeños rituales para acompañar tus momentos.</p>
              <SocialLinks />
            </div>
            <div>
              <h4>Navegación</h4>
              <ul>
                <li><Link to="/">Inicio</Link></li>
                <li><Link to="/tienda">Tienda</Link></li>
                <li><Link to="/receta-artesanal">Receta artesanal</Link></li>
                <li><Link to="/terminos">Términos y condiciones</Link></li>
              </ul>
            </div>
            <div>
              <h4>Categorías</h4>
              <ul>
                {categories.length
                  ? categories.map((c) => <li key={c.id}><button className="flink" onClick={() => nav('/tienda?cat=' + c.slug)}>{c.name}</button></li>)
                  : <li><Link to="/tienda">Ver tienda</Link></li>}
              </ul>
            </div>
            {contact.length > 0 && (
              <div>
                <h4>Contacto</h4>
                <ul>{contact.map(([l, h]) => <li key={l}><a href={h} target={h.startsWith('http') ? '_blank' : undefined} rel="noopener">{l}</a></li>)}</ul>
                {settings.email && <p className="tag" style={{ marginTop: 12, fontSize: '.86rem' }}>{settings.email}</p>}
              </div>
            )}
          </div>
          <div className="fbot">
            <span>© {new Date().getFullYear()} {settings.brand_name || 'RAMSA'}. Todos los derechos reservados.</span>
            <Link to="/terminos">Términos y condiciones</Link>
          </div>
        </div>
      </footer>
    </>
  )
}
