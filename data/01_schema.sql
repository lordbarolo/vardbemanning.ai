-- 01_schema.sql — Vårdbemanning.ai
-- Tabeller för roller, kommuner (med SKR-zon) och priser.
-- Kör denna fil FÖRE data/02_seed_roller_priser.sql i ditt Supabase-projekt
-- (SQL Editor → New query → klistra in → Run).
--
-- Principer:
--  * Ett specifikt pris per roll och zon — aldrig gruppetiketter
--    ("Grupp A/B", bara "Specialistläkare", bara "Specialistsjuksköterska").
--  * Pris per kommun = roll × kommunens SKR-zon (vyn role_municipality_prices).
--  * Publik läsning (anon + authenticated), skrivning endast via service_role.

-- ── Roller ────────────────────────────────────────────────────────────────
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  -- Kanoniskt SKR-namn, t.ex. "Specialistläkare kardiologi"
  canonical_name text not null,
  -- Kort visningsnamn i UI, t.ex. "Kardiolog"
  display_name text not null,
  profession text not null check (profession in ('sjukskoterska', 'barnmorska', 'lakare')),
  contract_version text not null,
  created_at timestamptz not null default now(),
  -- Gruppetiketter får aldrig lagras som roll
  constraint roles_no_group_labels check (
    lower(canonical_name) not in ('specialistläkare', 'specialistsjuksköterska')
    and canonical_name !~* '^grupp\s'
  )
);

grant select on public.roles to anon, authenticated;
grant all on public.roles to service_role;

alter table public.roles enable row level security;

drop policy if exists "Roller är publikt läsbara" on public.roles;
create policy "Roller är publikt läsbara"
  on public.roles for select
  to anon, authenticated
  using (true);

-- ── Kommuner med SKR-zon ──────────────────────────────────────────────────
create table if not exists public.municipalities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  region text not null,
  skr_zone smallint not null check (skr_zone between 1 and 3),
  created_at timestamptz not null default now(),
  unique (name, region)
);

create index if not exists municipalities_zone_idx on public.municipalities (skr_zone);

grant select on public.municipalities to anon, authenticated;
grant all on public.municipalities to service_role;

alter table public.municipalities enable row level security;

drop policy if exists "Kommuner är publikt läsbara" on public.municipalities;
create policy "Kommuner är publikt läsbara"
  on public.municipalities for select
  to anon, authenticated
  using (true);

-- ── Priser per roll och zon ───────────────────────────────────────────────
create table if not exists public.role_zone_prices (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles (id) on delete cascade,
  zone smallint not null check (zone between 1 and 3),
  hourly_rate_sek integer not null check (hourly_rate_sek > 0),
  contract_version text not null,
  effective_from date not null default date '2026-01-01',
  created_at timestamptz not null default now(),
  unique (role_id, zone, contract_version)
);

create index if not exists role_zone_prices_role_idx on public.role_zone_prices (role_id);

grant select on public.role_zone_prices to anon, authenticated;
grant all on public.role_zone_prices to service_role;

alter table public.role_zone_prices enable row level security;

drop policy if exists "Priser är publikt läsbara" on public.role_zone_prices;
create policy "Priser är publikt läsbara"
  on public.role_zone_prices for select
  to anon, authenticated
  using (true);

-- ── Vy: ett specifikt pris per roll och kommun ────────────────────────────
create or replace view public.role_municipality_prices
with (security_invoker = true) as
select
  r.slug              as role_slug,
  r.canonical_name    as role_canonical_name,
  r.display_name      as role_display_name,
  r.profession,
  m.slug              as municipality_slug,
  m.name              as municipality_name,
  m.region,
  m.skr_zone          as zone,
  p.hourly_rate_sek,
  p.contract_version,
  p.effective_from
from public.roles r
join public.role_zone_prices p on p.role_id = r.id
join public.municipalities m on m.skr_zone = p.zone;

grant select on public.role_municipality_prices to anon, authenticated;
grant all on public.role_municipality_prices to service_role;
