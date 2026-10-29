import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="wrap notfound">
      <span className="eyebrow">Error 404</span>
      <h1>Esta página no existe</h1>
      <p>Puede que el enlace esté roto o que la página se haya movido.</p>
      <Link className="btn btn-primary" to="/">Volver al inicio</Link>
    </div>
  )
}
