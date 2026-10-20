-- RAMSA · esquema Supabase
-- Ejecutar completo en: Supabase → SQL Editor → New query → Run

-- 1) Tablas -----------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  description text,
  price numeric(12,2) not null check (price >= 0),
  category_id uuid references public.categories(id) on delete set null,
  image_url text,
  stock integer check (stock is null or stock >= 0), -- null = sin control de stock
  active boolean not null default true,
  featured boolean not null default false,
  external_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_active_idx on public.products (active, featured, created_at desc);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- 2) Funciones --------------------------------------------------------
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
for each row execute function public.touch_updated_at();

-- 3) Seguridad (RLS) --------------------------------------------------
alter table public.categories enable row level security;
alter table public.products   enable row level security;
alter table public.admins     enable row level security;

drop policy if exists "categories_read"  on public.categories;
drop policy if exists "categories_write" on public.categories;
create policy "categories_read"  on public.categories for select using (true);
create policy "categories_write" on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "products_read"  on public.products;
drop policy if exists "products_write" on public.products;
create policy "products_read"  on public.products for select using (active = true or public.is_admin());
create policy "products_write" on public.products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins_self" on public.admins;
create policy "admins_self" on public.admins for select to authenticated using (user_id = auth.uid());

-- 4) Fotos (Storage) --------------------------------------------------
insert into storage.buckets (id, name, public) values ('products', 'products', true)
on conflict (id) do nothing;

drop policy if exists "products_img_select" on storage.objects;
drop policy if exists "products_img_insert" on storage.objects;
drop policy if exists "products_img_update" on storage.objects;
drop policy if exists "products_img_delete" on storage.objects;
create policy "products_img_select" on storage.objects for select to authenticated
  using (bucket_id = 'products' and public.is_admin());
create policy "products_img_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'products' and public.is_admin());
create policy "products_img_update" on storage.objects for update to authenticated
  using (bucket_id = 'products' and public.is_admin());
create policy "products_img_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'products' and public.is_admin());

-- 5) Categorías iniciales (opcional) -----------------------------------
insert into public.categories (name, slug, sort_order) values
  ('Lecturas: Manos & Tarot', 'lecturas-manos-tarot', 1),
  ('Piedras Energéticas', 'piedras-energeticas', 2),
  ('Sahumerios Naturales', 'sahumerios-naturales', 3),
  ('Cosmética Natural', 'cosmetica-natural', 4),
  ('Mazos y Oráculos', 'mazos-y-oraculos', 5)
on conflict (slug) do nothing;

-- 6) HABILITAR A LA ADMINISTRADORA ---------------------------------------
-- a) Supabase → Authentication → Users → Add user (email + contraseña, "Auto Confirm User").
-- b) Authentication → Sign In / Providers → desactivar "Allow new users to sign up".
-- c) Ejecutar con el email real:
--    insert into public.admins (user_id) select id from auth.users where email = 'EMAIL_DE_LA_CLIENTA';
