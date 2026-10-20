import React from 'react'
import { createRoot } from 'react-dom/client'

const root = createRoot(document.getElementById('root'))

// /admin se carga aparte: no mete su código ni sus estilos en la tienda pública.
if (location.pathname.startsWith('/admin')) {
  import('./admin/Admin.jsx').then((m) => root.render(<m.default />))
} else {
  Promise.all([import('./App.jsx'), import('./styles.css')]).then(([m]) => root.render(<m.default />))
}
