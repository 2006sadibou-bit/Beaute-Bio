-- ============================================================
-- SOPE NABY - Schéma Supabase
-- À exécuter dans Supabase > SQL Editor (en une fois)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- CATEGORIES
-- ------------------------------------------------------------
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- PRODUCTS
-- ------------------------------------------------------------
create table products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  category_id uuid references categories(id) on delete set null,
  description text not null default '',
  price numeric(10,2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- DELIVERY ZONES
-- ------------------------------------------------------------
create table delivery_zones (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  fee numeric(10,2) not null default 0,
  active boolean not null default true
);

insert into delivery_zones (name, fee) values
  ('Dakar', 1500),
  ('Mbour', 1000),
  ('Thiès', 1500),
  ('Diamniadio', 1500),
  ('Rufisque', 1500);

-- ------------------------------------------------------------
-- ORDERS
-- ------------------------------------------------------------
create table orders (
  id uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  phone text not null,
  whatsapp text,
  address text not null,
  delivery_zone_id uuid references delivery_zones(id),
  subtotal numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  payment_method text not null default 'wave',
  payment_status text not null default 'pending',
  order_status text not null default 'pending'
    check (order_status in (
      'pending','payment_pending','paid','preparing','shipped','delivered','cancelled'
    )),
  whatsapp_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- ORDER ITEMS
-- ------------------------------------------------------------
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  total numeric(10,2) not null
);

-- ------------------------------------------------------------
-- SITE SETTINGS (une seule ligne)
-- ------------------------------------------------------------
create table site_settings (
  id uuid primary key default uuid_generate_v4(),
  shop_name text not null default 'Sope Naby',
  seller_name text not null default 'Adama',
  whatsapp_number text not null default '',
  wave_number text not null default '',
  wave_name text not null default '',
  welcome_message text,
  description text,
  logo_url text,
  hero_image_url text
);

insert into site_settings (shop_name, seller_name) values ('Sope Naby', 'Adama');

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table categories enable row level security;
alter table products enable row level security;
alter table delivery_zones enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table site_settings enable row level security;

-- Lecture publique des données "catalogue"
create policy "public read categories" on categories for select using (active = true);
create policy "public read products" on products for select using (active = true);
create policy "public read delivery_zones" on delivery_zones for select using (active = true);
create policy "public read site_settings" on site_settings for select using (true);

-- Création de commandes ouverte à tous (client anonyme)
create policy "public insert orders" on orders for insert with check (true);
create policy "public insert order_items" on order_items for insert with check (true);

-- Tout le reste (update/delete, lecture admin des commandes) réservé aux utilisateurs authentifiés
create policy "admin full access categories" on categories for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin full access products" on products for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin full access delivery_zones" on delivery_zones for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin read orders" on orders for select
  using (auth.role() = 'authenticated');
create policy "admin update orders" on orders for update
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin read order_items" on order_items for select
  using (auth.role() = 'authenticated');
create policy "admin update site_settings" on site_settings for update
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
