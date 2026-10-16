# RAMSA web (React + Vite)

    npm install
    npm run dev      # desarrollo
    npm run build    # genera /dist

Deploy: Vercel (framework Vite, sin configuración extra) o Cloudflare Pages (build `npm run build`, salida `dist`).

## Pendiente de confirmar
- `src/data.js`: completar CONTACT (WhatsApp, email, redes). Vacío = no se muestra.
- "Mazos y Oráculos" no tiene categoría propia: enlaza al producto "Oráculo místico".
- Las URLs de tienda/carrito apuntan a tiendaramsa.com.ar; ajustar SITE si cambia el dominio.
- Las fotos son las mismas del sitio actual (hotlink a tiendaramsa.com.ar y Unsplash). Descargarlas a /public/img y cambiar las rutas en src/data.js antes de dar de baja el WordPress viejo.
- Precios tomados de la tienda actual (parecen de prueba).
- Años: el hero original dice "desde 1985" y "Nosotras" dice "aproximadamente 1980". Se usa el texto de "Nosotras"; confirmar el dato con la clienta.
