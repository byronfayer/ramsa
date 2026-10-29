import { Link } from 'react-router-dom'
import { useApp, money } from '../lib/store.jsx'
import { Close, Plus, Minus, Wa } from './icons.jsx'

export default function CartDrawer() {
  const { cart } = useApp()
  if (!cart.open) return null
  const link = cart.checkout()
  return (
    <div className="cart-wrap" onMouseDown={(e) => e.target === e.currentTarget && cart.setOpen(false)}>
      <aside className="cart" role="dialog" aria-label="Tu carrito">
        <div className="cart-head">
          <h2>Tu carrito</h2>
          <button className="icon-btn" aria-label="Cerrar" onClick={() => cart.setOpen(false)}><Close /></button>
        </div>

        {cart.items.length === 0 ? (
          <div className="cart-empty">
            <p>Todavía no agregaste productos.</p>
            <Link className="btn btn-primary" to="/tienda" onClick={() => cart.setOpen(false)}>Ir a la tienda</Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.items.map((i) => (
                <div className="cart-item" key={i.id}>
                  <Link className="ph" to={`/producto/${i.slug}`} onClick={() => cart.setOpen(false)}>
                    {i.image_url && <img src={i.image_url} alt="" loading="lazy" />}
                  </Link>
                  <div className="cart-item-info">
                    <strong>{i.name}</strong>
                    <span className="cart-item-price">{money(i.price)}</span>
                    <div className="qty">
                      <button aria-label="Quitar uno" onClick={() => cart.setQty(i.id, i.qty - 1)}><Minus /></button>
                      <span>{i.qty}</span>
                      <button aria-label="Agregar uno" onClick={() => cart.setQty(i.id, i.qty + 1)}><Plus /></button>
                    </div>
                  </div>
                  <button className="cart-remove" onClick={() => cart.remove(i.id)}>Quitar</button>
                </div>
              ))}
            </div>

            <div className="cart-foot">
              <div className="cart-total"><span>Total</span><strong>{money(cart.total)}</strong></div>
              {link ? (
                <a className="btn btn-primary btn-wa" href={link} target="_blank" rel="noopener"><Wa />Finalizar pedido por WhatsApp</a>
              ) : (
                <>
                  <button className="btn btn-primary" disabled>Finalizar por WhatsApp</button>
                  <p className="cart-note">Cargá el número de WhatsApp en el panel para habilitar el pedido.</p>
                </>
              )}
              <button className="cart-clear" onClick={cart.clear}>Vaciar carrito</button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
