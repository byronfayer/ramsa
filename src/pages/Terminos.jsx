import { useApp } from '../lib/store.jsx'

export default function Terminos() {
  const { settings } = useApp()
  const brand = settings.brand_name || 'RAMSA'
  return (
    <div className="page legal">
      <div className="wrap">
        <span className="eyebrow">Legales</span>
        <h1>Términos y condiciones</h1>
        <p className="legal-note">Contenido de ejemplo. Reemplazá cada sección por las condiciones reales de {brand} antes de publicar.</p>

        <h2>Pedidos y pagos</h2>
        <p>Los pedidos se realizan a través del sitio y se coordinan por WhatsApp. Los precios están expresados en pesos argentinos e incluyen los impuestos vigentes.</p>

        <h2>Envíos</h2>
        <p>Coordinamos el envío o la entrega según la zona. Los tiempos y costos se informan al confirmar cada pedido.</p>

        <h2>Cambios y devoluciones</h2>
        <p>Si tu producto llega con algún inconveniente, escribinos dentro de los días acordados y lo resolvemos.</p>

        <h2>Contacto</h2>
        <p>Ante cualquier duda, podés comunicarte con nosotras por los canales que figuran en el sitio.</p>
      </div>
    </div>
  )
}
