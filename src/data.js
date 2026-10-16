export const SITE = 'https://tiendaramsa.com.ar'
export const LOGO = `${SITE}/wp-content/uploads/2026/05/1000205499.jpg` // idealmente guardar en /public/logo.jpg

// Completar con datos reales. Si quedan vacíos no se muestran.
export const CONTACT = { whatsapp: '', email: '', instagram: '', facebook: '', tiktok: '' }

// Fotos reales tomadas del sitio actual (mismas que ya usa cada sección).
// Para no depender del WordPress viejo: descargarlas a /public/img y cambiar estas rutas.
const up = (p) => `${SITE}/wp-content/uploads/${p}`
export const IMG = {
  hero: 'https://images.unsplash.com/photo-1573100043937-8f07ec445e51?q=85&w=1920&h=1200&fit=crop', // portada actual
  lecturas: up('2026/05/ed33a534-e7a8-4585-a309-f6ab95fe4b6e.webp'),
  piedras: up('2026/05/277bee9d-705a-4728-8f5b-7e73f9eee7a1.webp'),
  sahumerios: up('2026/08/IMG_20260620_174701-scaled.jpg'),
  cosmetica: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=85&w=800&h=600&fit=crop',
  mazos: up('2026/08/077ebdca-08c8-4a34-8b3e-85af083bd622-8cd8cb419e08bd29fe17422258104988-1024-1024.webp'),
  mayor: up('2026/08/94188-scaled.webp'),
  nosotras: 'https://images.unsplash.com/photo-1624274579623-18121fc8126e?q=85&w=900&fit=crop', // la de "Nosotras"
  receta: 'https://images.unsplash.com/photo-1604249180474-3ebaf8747373?q=85&w=1000&fit=crop', // la de /receta-artesanal/
  receta2: 'https://images.unsplash.com/photo-1622910076381-daa95c131044?q=85&w=600&fit=crop', // la de /receta-artesanal/
}

// URLs verificadas contra el sitio actual.
export const CATEGORIES = [
  { id: 'c1', name: 'Lecturas: Manos & Tarot', text: 'Un espacio para detenerte, preguntarte y mirar tu camino.', cta: 'Ver lecturas', href: `${SITE}/product/lectura-de-tarot/`, img: IMG.lecturas, alt: 'Mesa de lecturas con velas, cartas de tarot y bola de cristal' },
  { id: 'c2', name: 'Piedras Energéticas', text: 'Elegí la piedra que vibre con tu energía.', cta: 'Ver piedras', href: `${SITE}/product-category/cristales-magicos/`, img: IMG.piedras, alt: 'Piedras, pulseras y colgantes de cuarzo sobre madera' },
  { id: 'c3', name: 'Sahumerios Naturales', text: 'Aromas para armonizar tus espacios.', cta: 'Ver sahumerios', href: `${SITE}/product-category/sahumerios-puros/`, img: IMG.sahumerios, alt: 'Hierbas y sahumerios naturales' },
  { id: 'c4', name: 'Cosmética Natural', text: 'Cuidado cotidiano con espíritu artesanal.', cta: 'Ver cosmética', href: `${SITE}/product-category/cosmetica-natural/`, img: IMG.cosmetica, alt: 'Frascos de cosmética natural con ramas y piedras' },
  { id: 'c5', name: 'Mazos y Oráculos', text: 'Cartas para guiar tus preguntas y tus rituales.', cta: 'Ver mazos', href: `${SITE}/product/oraculo-mistico/`, img: IMG.mazos, alt: 'Mazos de cartas y oráculos' }, // sin categoría propia en la tienda: enlaza al producto existente
]

// Precios y productos confirmados por la clienta/tienda (15/10/2026). Sin foto propia en la tienda: se usa la de su categoría.
export const PRODUCTS = [
  { name: 'Lectura de Tarot', price: '$ 60,00', slug: 'lectura-de-tarot', id: 30, img: IMG.lecturas },
  { name: 'Cosmética Natural', price: '$ 40,00', slug: 'cosmetica-natural', id: 28, img: IMG.cosmetica },
  { name: 'Cristales Únicos', price: '$ 25,00', slug: 'cristales-unicos', id: 26, img: IMG.piedras },
  { name: 'Sahumerios Naturales', price: '$ 30,00', slug: 'sahumerios-naturales', id: 24, img: IMG.sahumerios },
]
