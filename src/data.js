export const SITE = 'https://tiendaramsa.com.ar'
export const LOGO = `${SITE}/wp-content/uploads/2026/05/1000205499.jpg` // reemplazar por /logo.jpg en public/

// Completar con datos reales. Si quedan vacíos no se muestran.
export const CONTACT = { whatsapp: '', email: '', instagram: '', facebook: '', tiktok: '' }

const u = (id, w) => `https://images.unsplash.com/photo-${id}?q=80&w=${w}&auto=format&fit=crop`
export const IMG = {
  hero: u('1604249180474-3ebaf8747373', 1800),
  tarot: u('1598555572917-7c9acbef58ed', 1000),
  stones: u('1692878276239-899a3879dec2', 900),
  incense: u('1645221681500-11ba5f030d8e', 800),
  cosmetics: u('1643292003796-09b59873b8ba', 800),
  oracle: u('1702432876314-f8aa50fcbf8b', 900),
  about: u('1624274579623-18121fc8126e', 900),
  detail: u('1622910076381-daa95c131044', 600),
}

// URLs verificadas contra el sitio actual. "mayorista" apunta a la sección interna.
export const CATEGORIES = [
  { id: 'c1', name: 'Lecturas: Manos & Tarot', text: 'Un espacio para detenerte, preguntarte y mirar tu camino.', cta: 'Ver lecturas', href: `${SITE}/product/lectura-de-tarot/`, img: IMG.tarot, alt: 'Cartas y elementos para lecturas de manos y tarot' },
  { id: 'c2', name: 'Piedras Energéticas', text: 'Elegí la piedra que vibre con tu energía.', cta: 'Ver piedras', href: `${SITE}/product-category/cristales-magicos/`, img: IMG.stones, alt: 'Piedras y cristales' },
  { id: 'c3', name: 'Sahumerios Naturales', text: 'Aromas para armonizar tus espacios.', cta: 'Ver sahumerios', href: `${SITE}/product-category/sahumerios-puros/`, img: IMG.incense, alt: 'Sahumerios naturales' },
  { id: 'c4', name: 'Cosmética Natural', text: 'Cuidado cotidiano con espíritu artesanal.', cta: 'Ver cosmética', href: `${SITE}/product-category/cosmetica-natural/`, img: IMG.cosmetics, alt: 'Cosmética natural artesanal' },
  { id: 'c5', name: 'Mazos y Oráculos', text: 'Cartas para guiar tus preguntas y tus rituales.', cta: 'Ver mazos', href: `${SITE}/tienda/`, img: IMG.oracle, alt: 'Mazos de cartas y oráculos' }, // PENDIENTE: no existe categoría
]

// Precios y IDs tomados de /tienda/ (15/10/2026). Confirmar con la clienta.
export const PRODUCTS = [
  { name: 'Lectura de Tarot', price: '$ 60,00', slug: 'lectura-de-tarot', id: 30, img: IMG.tarot },
  { name: 'Cosmética Natural', price: '$ 40,00', slug: 'cosmetica-natural', id: 28, img: IMG.cosmetics },
  { name: 'Cristales Únicos', price: '$ 25,00', slug: 'cristales-unicos', id: 26, img: IMG.stones },
  { name: 'Sahumerios Naturales', price: '$ 30,00', slug: 'sahumerios-naturales', id: 24, img: IMG.incense },
]
