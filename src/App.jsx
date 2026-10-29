import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import { useApp } from './lib/store.jsx'
import { Wa } from './components/icons.jsx'

export default function Shell() {
  const { pathname } = useLocation()
  const { settings } = useApp()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  const wa = (settings.whatsapp || '').replace(/\D/g, '')
  return (
    <>
      <a className="sr" href="#main">Saltar al contenido</a>
      <Header />
      <main id="main"><Outlet /></main>
      <Footer />
      <CartDrawer />
      {wa && (
        <a className="wa-float" href={`https://wa.me/${wa}`} target="_blank" rel="noopener" aria-label="Contactar por WhatsApp">
          <Wa />
        </a>
      )}
    </>
  )
}
