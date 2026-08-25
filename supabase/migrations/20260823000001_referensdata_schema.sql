-- Referensdata: SKR:s nationella hyrbemanningsavtal RS 2022-03983
--
-- Modellen håller INTE 88 x 290 rader på disk. Priset bestäms av (roll, zon)
-- och zonen bestäms av kommunen, så sanningen lagras som 264 prisrader plus
-- 290 kommuner. Vyn role_municipality_prices materialiserar kombinationen
-- (25 520 rader) vid läsning och kan aldrig hamna ur synk med källan.

create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;

-- ---------------------------------------------------------------- zoner ----

create table public.zones (
  zone        smallint primary key check (zone between 1 and 3),
  label       text     not null,
  description text     not null
);

comment on table public.zones is
  'Zonindelning enligt Bilaga 3 Zonindelning, RS 2022-03983. Zonen styr priset.';

-- ------------------------------------------------------------------ län ----

create table public.counties (
  county_code char(2) primary key,
  name        text    not null unique
);

comment on table public.counties is
  'Län enligt SCB:s länskod (två första siffrorna i kommunkoden).';

-- ------------------------------------------------------------- kommuner ----

create table public.municipalities (
  municipality_code char(4)  primary key,
  name              text     not null unique,
  county_code       char(2)  not null references public.counties (county_code),
  contract_region   text     not null,
  zone              smallint not null references public.zones (zone),
  created_at        timestamptz not null default now()
);

comment on column public.municipalities.municipality_code is
  'SCB:s kommunkod, fyrsiffrig med inledande nolla. Join-nyckel mot andra system.';
comment on column public.municipalities.contract_region is
  'Regionetiketten så som den står i Bilaga 3 (t.ex. "VGR", "Jämtland/Hj"). '
  'Avtalstext, inte SCB-namn — använd counties för formellt länsnamn.';
comment on column public.municipalities.zone is
  'Zon 1-3. Detta är hela kopplingen mellan kommun och pris.';

create index municipalities_zone_idx        on public.municipalities (zone);
create index municipalities_county_idx      on public.municipalities (county_code);
create index municipalities_name_trgm_idx   on public.municipalities
  using gin (name extensions.gin_trgm_ops);

-- --------------------------------------------------------------- roller ----

create table public.roles (
  role_code        text primary key,
  name             text not null,
  category         text not null check (category in ('lakare', 'sjukskoterska')),
  description      text,
  procurement_area text not null,
  created_at       timestamptz not null default now()
);

comment on table public.roles is
  'Yrkesroller i avtalets artikelkatalog. En rad per roll — aldrig per zon.';
comment on column public.roles.role_code is
  'Socialstyrelsens yrkeskod = artikelnumret utan inledande zonsiffra. '
  'Artikel 113430 (zon 1) och 313430 (zon 3) är samma roll: 13430.';
comment on column public.roles.name is
  'Normaliserat namn: suffixet " zon N" borttaget, dubbla mellanslag kollapsade. '
  'Zon 1-varianten är kanonisk där källan stavar olika mellan zoner.';

create index roles_category_idx      on public.roles (category);
create index roles_name_trgm_idx     on public.roles
  using gin (name extensions.gin_trgm_ops);

-- ----------------------------------------------------------- zonpriser ----

create table public.role_zone_prices (
  role_code       text     not null references public.roles (role_code) on delete cascade,
  zone            smallint not null references public.zones (zone),
  valid_from      date     not null,
  valid_to        date     not null,
  article_number  char(6)  not null,
  hourly_price    numeric(10,2) not null check (hourly_price >= 0),
  currency        char(3)  not null default 'SEK',
  catalog_version text     not null,
  source_document text     not null,
  primary key (role_code, zone, valid_from),
  unique (article_number, valid_from),
  check (valid_to >= valid_from)
);

comment on table public.role_zone_prices is
  'Grundpris per timme för (roll, zon) under en avtalsperiod. 88 roller x 3 zoner.';
comment on column public.role_zone_prices.article_number is
  'Artikelnumret som ska faktureras: zonsiffra + role_code.';

create index role_zone_prices_zone_idx  on public.role_zone_prices (zone);
create index role_zone_prices_valid_idx on public.role_zone_prices (valid_from, valid_to);

-- ------------------------------------------------- roll x kommun x pris ----

create view public.role_municipality_prices
with (security_invoker = on) as
select
  r.role_code,
  r.name              as role_name,
  r.category,
  r.description       as role_description,
  m.municipality_code,
  m.name              as municipality_name,
  m.county_code,
  c.name              as county_name,
  m.contract_region,
  m.zone,
  p.article_number,
  p.hourly_price,
  p.currency,
  p.valid_from,
  p.valid_to,
  p.catalog_version
from public.roles r
join public.role_zone_prices p on p.role_code = r.role_code
join public.municipalities   m on m.zone      = p.zone
join public.counties         c on c.county_code = m.county_code;

comment on view public.role_municipality_prices is
  'Varje yrkesroll x varje kommun med gällande timpris. Detta är den vy '
  'både UI och agenter läser — den kan aldrig avvika från zonpriserna.';

-- --------------------------------------------------- agentens sökyta ----

create function public.search_roles(q text, max_rows int default 20)
returns table (role_code text, name text, category text, similarity real)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select r.role_code,
         r.name,
         r.category,
         similarity(extensions.unaccent(r.name), extensions.unaccent(q)) as similarity
  from public.roles r
  where extensions.unaccent(r.name) ilike '%' || extensions.unaccent(q) || '%'
     or extensions.unaccent(r.name) %      extensions.unaccent(q)
  order by similarity desc, r.name
  limit greatest(1, least(max_rows, 100));
$$;

comment on function public.search_roles is
  'Fritextsökning på rollnamn, accentokänslig och stavfelstålig. '
  'Avsedd som verktyg för en agent som fått "narkosläkare" av en användare.';

create function public.search_municipalities(q text, max_rows int default 20)
returns table (municipality_code char(4), name text, zone smallint,
               contract_region text, similarity real)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select m.municipality_code,
         m.name,
         m.zone,
         m.contract_region,
         similarity(extensions.unaccent(m.name), extensions.unaccent(q)) as similarity
  from public.municipalities m
  where extensions.unaccent(m.name) ilike '%' || extensions.unaccent(q) || '%'
     or extensions.unaccent(m.name) %      extensions.unaccent(q)
  order by similarity desc, m.name
  limit greatest(1, least(max_rows, 100));
$$;

create function public.price_lookup(
  role_query         text,
  municipality_query text,
  on_date            date default current_date
)
returns table (
  role_code         text,
  role_name         text,
  municipality_code char(4),
  municipality_name text,
  zone              smallint,
  article_number    char(6),
  hourly_price      numeric(10,2),
  currency          char(3),
  valid_from        date,
  valid_to          date
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select v.role_code,
         v.role_name,
         v.municipality_code,
         v.municipality_name,
         v.zone,
         v.article_number,
         v.hourly_price,
         v.currency,
         v.valid_from,
         v.valid_to
  from public.role_municipality_prices v
  where on_date between v.valid_from and v.valid_to
    and v.role_code in (select s.role_code from public.search_roles(role_query, 5) s)
    and v.municipality_code in (
      select s.municipality_code from public.search_municipalities(municipality_query, 5) s
    )
  order by v.role_name, v.municipality_name;
$$;

comment on function public.price_lookup is
  'Ett anrop: fritext roll + fritext kommun + datum -> gällande timpris. '
  'Detta är den funktion MCP-servern exponerar som verktyg.';

-- ------------------------------------------------------------------ RLS ----
-- Referensdata är offentlig avtalsinformation: alla får läsa, ingen får skriva.
-- Skrivning sker enbart via migrations och service_role (som förbigår RLS).

alter table public.zones            enable row level security;
alter table public.counties         enable row level security;
alter table public.municipalities   enable row level security;
alter table public.roles            enable row level security;
alter table public.role_zone_prices enable row level security;

create policy "referensdata är läsbar för alla" on public.zones
  for select to anon, authenticated using (true);
create policy "referensdata är läsbar för alla" on public.counties
  for select to anon, authenticated using (true);
create policy "referensdata är läsbar för alla" on public.municipalities
  for select to anon, authenticated using (true);
create policy "referensdata är läsbar för alla" on public.roles
  for select to anon, authenticated using (true);
create policy "referensdata är läsbar för alla" on public.role_zone_prices
  for select to anon, authenticated using (true);

grant select on public.zones            to anon, authenticated;
grant select on public.counties         to anon, authenticated;
grant select on public.municipalities   to anon, authenticated;
grant select on public.roles            to anon, authenticated;
grant select on public.role_zone_prices to anon, authenticated;
grant select on public.role_municipality_prices to anon, authenticated;

grant execute on function public.search_roles(text, int)          to anon, authenticated;
grant execute on function public.search_municipalities(text, int) to anon, authenticated;
grant execute on function public.price_lookup(text, text, date)   to anon, authenticated;

-- ----------------------------------------------------------- basdata ----

insert into public.zones (zone, label, description) values
  (1, 'Zon 1', 'Storstad och närområde. Lägsta ersättningsnivå.'),
  (2, 'Zon 2', 'Mellanliggande kommuner.'),
  (3, 'Zon 3', 'Glesbygd och svårrekryterade kommuner. Högsta ersättningsnivå.');
