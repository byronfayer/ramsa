import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../lib/store.jsx'
import { Mark, Cart, Menu } from './icons.jsx'

export default function Header() {
  const { categories, cart, settings } = useApp()
  const [open, setOpen] = useState(false)
  const [sub, setSub] = useState(false)
  const nav = useNavigate()
  const close = () => { setOpen(false); setSub(false) }
  useEffect(() => { const k = (e) => e.key === 'Escape' && close(); document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k) }, [])
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [open])
  const mobile = () => window.matchMedia('(max-width:960px)').matches
  const goCat = (slug) => { close(); nav('/tienda?cat=' + slug) }

  return (
    <header className="top">
      <div className="wrap">
        <Link className="brand" to="/" onClick={close} aria-label={`${settings.brand_name || 'RAMSA'}, inicio`}>
          <Mark /><span>{settings.brand_name || 'RAMSA'}</span>
        </Link>
        <nav aria-label="Principal">
          <ul className={'nav' + (open ? ' open' : '')}>
            <li><NavLink to="/" onClick={close} end>Inicio</NavLink></li>
            <li><NavLink to="/tienda" onClick={close}>Tienda</NavLink></li>
            {categories.length > 0 && (
              <li className={'has-sub' + (sub ? ' open' : '')}>
                <a href="/tienda" aria-haspopup="true" aria-expanded={sub}
                  onClick={(e) => { e.preventDefault(); if (mobile()) setSub(!sub); else { nav('/tienda'); close() } }}>Categorías</a>
                <div className="sub">
                  {categories.map((c) => <button key={c.id} type="button" onClick={() => goCat(c.slug)}>{c.name}</button>)}
                </div>
              </li>
            )}
            <li><NavLink to="/receta-artesanal" onClick={close}>Receta artesanal</NavLink></li>
            <li><NavLink to="/terminos" onClick={close}>Términos</NavLink></li>
          </ul>
        </nav>
        <div className="actions">
          <button className="icon-btn cart-btn" aria-label={`Carrito, ${cart.count} productos`} onClick={() => cart.setOpen(true)}>
            <Cart />{cart.count > 0 && <span className="cart-count">{cart.count}</span>}
          </button>
          <button className="icon-btn burger" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open} onClick={() => setOpen(!open)}><Menu /></button>
        </div>
      </div>
    </header>
  )
}
