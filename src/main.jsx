import { lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppDataProvider } from './lib/store.jsx'
import Shell from './App.jsx'
import Home from './pages/Home.jsx'
import './styles.css'

const Tienda = lazy(() => import('./pages/Tienda.jsx'))
const Producto = lazy(() => import('./pages/Producto.jsx'))
const Receta = lazy(() => import('./pages/Receta.jsx'))
const Terminos = lazy(() => import('./pages/Terminos.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))
const Admin = lazy(() => import('./admin/Admin.jsx'))

const Loader = () => <div className="page-loader"><span className="spinner" /></div>
const S = (el) => <Suspense fallback={<Loader />}>{el}</Suspense>

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/admin/*" element={S(<Admin />)} />
      <Route element={<AppDataProvider><Shell /></AppDataProvider>}>
        <Route path="/" element={<Home />} />
        <Route path="/tienda" element={S(<Tienda />)} />
        <Route path="/producto/:slug" element={S(<Producto />)} />
        <Route path="/receta-artesanal" element={S(<Receta />)} />
        <Route path="/terminos" element={S(<Terminos />)} />
        <Route path="*" element={S(<NotFound />)} />
      </Route>
    </Routes>
  </BrowserRouter>
)
