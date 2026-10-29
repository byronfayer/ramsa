import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import CartDrawer from './components/CartDrawer.jsx'

export default function Shell() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <>
      <a className="sr" href="#main">Saltar al contenido</a>
      <Header />
      <main id="main"><Outlet /></main>
      <Footer />
      <CartDrawer />
    </>
  )
}
