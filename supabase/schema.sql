-- =========================================================
-- Propvia Mini Property Dashboard — schema + seed data
-- Run this in: Supabase Dashboard -> SQL Editor -> New query
-- =========================================================

create table if not exists public.properties (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  title       text not null,
  address     text not null,
  city        text not null,
  state       text not null,
  price       numeric not null check (price >= 0),
  type        text not null,            -- House | Apartment | Condo | Townhouse | Commercial
  status      text not null default 'For Sale',  -- For Sale | For Rent | Sold
  beds        int,
  baths       numeric,
  sqft        int,
  image_url   text,
  description text
);

-- Row Level Security: allow anonymous read + insert (demo scope).
alter table public.properties enable row level security;

drop policy if exists "Public read access" on public.properties;
create policy "Public read access"
  on public.properties for select
  using (true);

drop policy if exists "Public insert access" on public.properties;
create policy "Public insert access"
  on public.properties for insert
  with check (true);

-- ---------------------------------------------------------
-- Seed data: 12 properties
-- ---------------------------------------------------------
insert into public.properties
  (title, address, city, state, price, type, status, beds, baths, sqft, image_url, description)
values
  ('Renovated Brick Colonial', '1427 Seyburn St', 'Detroit', 'MI', 285000, 'House', 'For Sale', 4, 2.5, 2150, 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=60&auto=format&fit=crop', 'Fully renovated 1920s colonial in Islandview with original hardwood floors, new roof, and a finished basement.'),
  ('West Village Carriage Loft', '8044 Kercheval Ave', 'Detroit', 'MI', 1850, 'Apartment', 'For Rent', 1, 1, 780, 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=60&auto=format&fit=crop', 'Sunlit one-bedroom loft above a converted carriage house. Walkable to cafes and Belle Isle.'),
  ('Corktown Townhome', '2210 Bagley St', 'Detroit', 'MI', 339900, 'Townhouse', 'For Sale', 3, 2, 1680, 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=60&auto=format&fit=crop', 'Modern three-story townhome with rooftop deck and attached garage, two blocks from Michigan Central.'),
  ('Midtown Studio', '444 W Willis St', 'Detroit', 'MI', 1295, 'Apartment', 'For Rent', 0, 1, 520, 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=60&auto=format&fit=crop', 'Efficient studio with in-unit laundry, steps from Wayne State and the QLine.'),
  ('Boston-Edison Estate', '1731 Chicago Blvd', 'Detroit', 'MI', 525000, 'House', 'For Sale', 6, 4, 4300, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=60&auto=format&fit=crop', 'Grand historic estate with leaded glass, butler''s pantry, and a carriage house on a tree-lined boulevard.'),
  ('Riverfront Condo w/ Skyline View', '300 Riverfront Dr #14C', 'Detroit', 'MI', 264500, 'Condo', 'For Sale', 2, 2, 1240, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=60&auto=format&fit=crop', '14th-floor condo with floor-to-ceiling windows over the Detroit River. 24-hr concierge and gym.'),
  ('Eastern Market Mixed-Use Building', '2934 Russell St', 'Detroit', 'MI', 749000, 'Commercial', 'For Sale', null, 2, 6800, 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=60&auto=format&fit=crop', 'Retail storefront plus two upper-floor apartments in the heart of Eastern Market. Strong rental history.'),
  ('Ferndale Craftsman Bungalow', '642 Vester Ave', 'Ferndale', 'MI', 248000, 'House', 'For Sale', 3, 1.5, 1320, 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=60&auto=format&fit=crop', 'Classic craftsman with covered porch, updated kitchen, and a detached two-car garage.'),
  ('Royal Oak Garden Apartment', '511 S Center St #2', 'Royal Oak', 'MI', 1575, 'Apartment', 'For Rent', 2, 1, 900, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=60&auto=format&fit=crop', 'Quiet two-bedroom garden unit with private entrance, minutes from downtown Royal Oak.'),
  ('Ann Arbor Townhouse near Campus', '1208 Packard St', 'Ann Arbor', 'MI', 412000, 'Townhouse', 'For Sale', 3, 2.5, 1750, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=60&auto=format&fit=crop', 'End-unit townhouse with fenced patio, one mile from the University of Michigan central campus.'),
  ('Grand Rapids Office Suite', '99 Monroe Center NW', 'Grand Rapids', 'MI', 2900, 'Commercial', 'For Rent', null, 1, 2100, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=60&auto=format&fit=crop', 'Open-plan office suite with exposed brick, conference room, and dedicated parking downtown.'),
  ('Palmer Woods Tudor (Sold)', '1980 Balmoral Dr', 'Detroit', 'MI', 610000, 'House', 'Sold', 5, 3.5, 3900, 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=60&auto=format&fit=crop', 'Stately Tudor revival with slate roof and original woodwork. Recently closed — shown for market history.');
