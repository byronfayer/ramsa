# RAMSA — Tienda + Panel (React/Vite + Node/Express/SQLite)

Tienda online con panel de administración y **base de datos propia** (SQLite).
No depende de Supabase ni de ningún servicio externo.

## Qué incluye
- **Tienda** (React + Vite + React Router): inicio, catálogo con filtros y búsqueda, ficha de producto, carrito y checkout por WhatsApp.
- **Panel** en `/admin`: login, alta/edición/baja de productos con foto, categorías y ajustes de contacto.
- **Backend** (Node + Express + SQLite): API REST, login con token (JWT), subida y optimización de imágenes.

## Correr en tu compu
```bash
npm install        # instala y carga datos de ejemplo + admin
npm run dev        # arranca backend (3001) y front (5173) juntos
```
Abrí:
- Tienda: http://localhost:5173
- Panel:  http://localhost:5173/admin

**Admin de ejemplo:** `admin@ramsa.com` / `ramsa1234`
(cambialo con las variables `ADMIN_EMAIL` y `ADMIN_PASSWORD`, ver `.env.example`).

## Build de producción
```bash
npm run build      # genera /dist
npm start          # un solo servidor sirve la tienda + la API en el puerto 3001
```

## Estructura
```
server/          backend Express + SQLite
  index.js       API y servidor
  db.js          base de datos y tablas
  auth.js        login / token
  seed.js        admin + categorías + productos de ejemplo
  data/          ramsa.db  (se crea solo, no se sube a git)
  uploads/       fotos subidas (no se sube a git)
src/             tienda (React)
  admin/         panel
```

## Subir a un hosting (Render, Railway, etc.)
Es un servidor Node, no un sitio estático. En Render:
- **Build:** `npm install && npm run build`
- **Start:** `npm start`
- **Variables:** `JWT_SECRET` (frase larga y secreta), `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

⚠️ **Importante — persistencia:** en los planes gratuitos el disco es temporal: si el
servicio se reinicia, se pierden la base y las fotos. Para una tienda real, agregá un
**disco/volumen persistente** y apuntá ahí la base:
```
DATA_DIR=/data
UPLOAD_DIR=/data/uploads
```
(En Railway se llama "Volume"; en Render, "Disk".) El plan gratis también suele
pausar el servicio por inactividad (arranque lento la primera visita).

## Notas
- La clave de sesión real es el `JWT_SECRET`: cambialo en producción.
- Las imágenes se comprimen a WebP en el navegador antes de subirse.
- Los productos y fotos de ejemplo son placeholders; se reemplazan desde el panel.
- Base de datos en JS puro (sql.js): no compila nada, funciona en cualquier Node reciente (incluido Node 24) sin instalar Visual Studio.
