import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../lib/store.jsx'
import { Mark } from './icons.jsx'

export default function Footer() {
  const { settings, categories } = useApp()
  const nav = useNavigate()
  const wa = (settings.whatsapp || '').replace(/\D/g, '')
  const contact = [
    wa && ['WhatsApp', `https://wa.me/${wa}`],
    settings.email && ['Email', `mailto:${settings.email}`],
    settings.instagram && ['Instagram', settings.instagram],
    settings.facebook && ['Facebook', settings.facebook],
    settings.tiktok && ['TikTok', settings.tiktok],
  ].filter(Boolean)

  return (
    <footer>
      <div className="wrap">
        <div className="fgrid">
          <div>
            <Link className="brand" to="/"><Mark /><span>{settings.brand_name || 'RAMSA'}</span></Link>
            <p className="tag">Aromas, naturaleza y pequeños rituales para acompañar tus momentos.</p>
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
            </div>
          )}
        </div>
        <div className="fbot">
          <span>© {new Date().getFullYear()} {settings.brand_name || 'RAMSA'}. Todos los derechos reservados.</span>
          <Link to="/terminos">Términos y condiciones</Link>
        </div>
      </div>
    </footer>
  )
}
