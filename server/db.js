import initSqlJs from 'sql.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))

// La base y las fotos viven en disco. En un host con disco persistente,
// apuntá DATA_DIR y UPLOAD_DIR a ese volumen (ver README).
export const DATA_DIR = process.env.DATA_DIR || join(__dirname, 'data')
export const UPLOAD_DIR = process.env.UPLOAD_DIR || join(__dirname, 'uploads')
mkdirSync(DATA_DIR, { recursive: true })
mkdirSync(UPLOAD_DIR, { recursive: true })
const FILE = join(DATA_DIR, 'ramsa.db')

// SQLite en JS puro (WASM): no necesita compilar nada, anda en cualquier Node.
const SQL = await initSqlJs({ locateFile: () => require.resolve('sql.js/dist/sql-wasm.wasm') })
const sqldb = existsSync(FILE) ? new SQL.Database(readFileSync(FILE)) : new SQL.Database()
sqldb.run('PRAGMA foreign_keys = ON')

let inTx = false
const persist = () => writeFileSync(FILE, Buffer.from(sqldb.export()))
const maybePersist = () => { if (!inTx) persist() }

// Convierte {name:v} (placeholders @name) o deja los posicionales (?) como array.
const norm = (args) => {
  if (args.length === 1 && args[0] && typeof args[0] === 'object' && !Array.isArray(args[0])) {
    const o = {}; for (const k in args[0]) o['@' + k] = args[0][k]; return o
  }
  return args
}

// Adaptador con la misma forma que better-sqlite3 (prepare/get/all/run, exec, transaction).
function prepare(sql) {
  return {
    get(...a) { const st = sqldb.prepare(sql); try { st.bind(norm(a)); return st.step() ? st.getAsObject() : undefined } finally { st.free() } },
    all(...a) { const st = sqldb.prepare(sql); const out = []; try { st.bind(norm(a)); while (st.step()) out.push(st.getAsObject()) } finally { st.free() } return out },
    run(...a) {
      sqldb.run(sql, norm(a))
      const r = sqldb.exec('select last_insert_rowid() as id, changes() as ch')[0]
      maybePersist()
      const v = r ? r.values[0] : [0, 0]
      return { lastInsertRowid: v[0], changes: v[1] }
    },
  }
}
function transaction(fn) {
  return (...a) => {
    inTx = true
    try { sqldb.run('BEGIN'); const r = fn(...a); sqldb.run('COMMIT'); inTx = false; persist(); return r }
    catch (e) { try { sqldb.run('ROLLBACK') } catch {} inTx = false; throw e }
  }
}

export const db = {
  prepare,
  exec: (sql) => { sqldb.run(sql); maybePersist() },
  pragma: () => {},
  transaction,
}

db.exec(`
  create table if not exists admins (
    id integer primary key autoincrement,
    email text not null unique,
    password_hash text not null,
    created_at text not null default (datetime('now'))
  );
  create table if not exists categories (
    id integer primary key autoincrement,
    name text not null,
    slug text not null unique,
    sort_order integer not null default 0,
    created_at text not null default (datetime('now'))
  );
  create table if not exists products (
    id integer primary key autoincrement,
    name text not null,
    slug text not null unique,
    description text,
    price real not null default 0,
    category_id integer references categories(id) on delete set null,
    image_url text,
    stock integer,
    active integer not null default 1,
    featured integer not null default 0,
    external_url text,
    created_at text not null default (datetime('now')),
    updated_at text not null default (datetime('now'))
  );
  create table if not exists settings (
    key text primary key,
    value text
  );
`)
