import { sql, createPool } from '@vercel/postgres'

let _pool
function getPool() {
  if (!_pool) _pool = createPool()
  return _pool
}

export { sql }
export const query = (text, params) => getPool().query(text, params)
