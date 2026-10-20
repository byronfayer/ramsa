import { createClient } from '@supabase/supabase-js'

// La clave "publishable" es pública por diseño: la seguridad real está en las políticas RLS (supabase/schema.sql).
// Se puede sobrescribir con VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY (ver .env.example).
const url = import.meta.env.VITE_SUPABASE_URL || 'https://mrezdhrxdixquenitgld.supabase.co'
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_LRIvBim107Zmimg0pUj57A_oZ_1G3sW'

export const supabase = createClient(url, key)
export const BUCKET = 'products'
