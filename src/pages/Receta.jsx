import { Link } from 'react-router-dom'
import { useApp } from '../lib/store.jsx'
import { useReveal } from '../lib/reveal.js'

export default function Receta() {
  const { settings } = useApp()
  useReveal([])
  const brand = settings.brand_name || 'RAMSA'
  const steps = [
    ['Selección', 'Elegimos hierbas, resinas y esencias naturales, una por una.'],
    ['Elaboración', 'Preparamos cada mezcla a mano, respetando la receta de familia.'],
    ['Reposo', 'Dejamos que los aromas se asienten y tomen su carácter.'],
    ['Terminación', 'Armamos y revisamos cada producto antes de que llegue a tu casa.'],
  ]
  return (
    <div className="page">
      <section className="page-hero receta-hero">
        <div className="wrap">
          <span className="eyebrow">Receta artesanal</span>
          <h1>Lo hecho a mano tiene su propio tiempo</h1>
          <p>{settings.about || `Detrás de cada producto de ${brand} hay una receta familiar elaborada con dedicación.`}</p>
        </div>
      </section>

      <section className="receta-steps">
        <div className="wrap">
          <ol>
            {steps.map(([t, d], i) => (
              <li key={t} className="rv">
                <span className="step-n">{String(i + 1).padStart(2, '0')}</span>
                <div><h3>{t}</h3><p>{d}</p></div>
              </li>
            ))}
          </ol>
          <div className="receta-cta rv">
            <p>Cada pieza es única, como el ritual al que acompaña.</p>
            <Link className="btn btn-primary" to="/tienda">Ver la colección</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
