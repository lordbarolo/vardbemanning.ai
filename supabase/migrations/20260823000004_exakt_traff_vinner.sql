-- Trigram-sökningen rankade "Malå" (zon 3) lika högt som "Malmö" (zon 1) för
-- frågan "Malmö", så price_lookup returnerade priser för fel kommun utan att
-- något i svaret avslöjade det. För en agent som ska svara på vad ett pass
-- kostar är det tyst fel data — värre än inget svar.
--
-- Regeln nedan: finns en exakt namnträff är den ensam svaret. Annars faller
-- vi tillbaka på prefix, delsträng och till sist trigram, i den ordningen,
-- och match_kind talar om vilket det blev.

create function public.resolve_municipalities(q text, max_rows int default 5)
returns table (
  municipality_code char(4),
  name              text,
  zone              smallint,
  contract_region   text,
  match_kind        text,
  similarity        real
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  with needle as (
    select lower(extensions.unaccent(q)) as q
  ),
  scored as (
    select m.municipality_code,
           m.name,
           m.zone,
           m.contract_region,
           case
             when lower(extensions.unaccent(m.name)) = n.q               then 'exact'
             when lower(extensions.unaccent(m.name)) like n.q || '%'     then 'prefix'
             when lower(extensions.unaccent(m.name)) like '%'||n.q||'%'  then 'substring'
             else 'fuzzy'
           end as match_kind,
           similarity(extensions.unaccent(m.name), extensions.unaccent(q)) as similarity
    from public.municipalities m
    cross join needle n
    where lower(extensions.unaccent(m.name)) like '%' || n.q || '%'
       or extensions.unaccent(m.name) % extensions.unaccent(q)
  )
  select s.municipality_code, s.name, s.zone, s.contract_region, s.match_kind, s.similarity
  from scored s
  where s.match_kind = 'exact'
     or not exists (select 1 from scored e where e.match_kind = 'exact')
  order by case s.match_kind
             when 'exact' then 0 when 'prefix' then 1 when 'substring' then 2 else 3
           end,
           s.similarity desc,
           s.name
  limit greatest(1, least(max_rows, 100));
$$;

comment on function public.resolve_municipalities is
  'Slår upp en kommun ur fritext. Exakt namnträff utesluter alla andra — '
  'annars prefix, delsträng, trigram i den ordningen. match_kind säger vilket.';

create function public.resolve_roles(q text, max_rows int default 5)
returns table (
  role_code   text,
  name        text,
  category    text,
  match_kind  text,
  similarity  real
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  with needle as (
    select lower(extensions.unaccent(q)) as q
  ),
  scored as (
    select r.role_code,
           r.name,
           r.category,
           case
             when lower(extensions.unaccent(r.name)) = n.q               then 'exact'
             when lower(extensions.unaccent(r.name)) like n.q || '%'     then 'prefix'
             when lower(extensions.unaccent(r.name)) like '%'||n.q||'%'  then 'substring'
             else 'fuzzy'
           end as match_kind,
           similarity(extensions.unaccent(r.name), extensions.unaccent(q)) as similarity
    from public.roles r
    cross join needle n
    where lower(extensions.unaccent(r.name)) like '%' || n.q || '%'
       or extensions.unaccent(r.name) % extensions.unaccent(q)
  )
  select s.role_code, s.name, s.category, s.match_kind, s.similarity
  from scored s
  where s.match_kind = 'exact'
     or not exists (select 1 from scored e where e.match_kind = 'exact')
  order by case s.match_kind
             when 'exact' then 0 when 'prefix' then 1 when 'substring' then 2 else 3
           end,
           s.similarity desc,
           s.name
  limit greatest(1, least(max_rows, 100));
$$;

comment on function public.resolve_roles is
  'Slår upp en yrkesroll ur fritext, med samma exakt-före-fuzzy-regel som '
  'resolve_municipalities.';

-- search_* behåller sina signaturer men ärver den nya rangordningen, så att
-- ett UI som listar förslag visar Malmö före Malå.

create or replace function public.search_municipalities(q text, max_rows int default 20)
returns table (municipality_code char(4), name text, zone smallint,
               contract_region text, similarity real)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select r.municipality_code, r.name, r.zone, r.contract_region, r.similarity
  from public.resolve_municipalities(q, max_rows) r;
$$;

create or replace function public.search_roles(q text, max_rows int default 20)
returns table (role_code text, name text, category text, similarity real)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select r.role_code, r.name, r.category, r.similarity
  from public.resolve_roles(q, max_rows) r;
$$;

-- price_lookup returnerar nu också hur säker matchningen var, så att en agent
-- kan välja att fråga tillbaka i stället för att gissa.

drop function if exists public.price_lookup(text, text, date);

create function public.price_lookup(
  role_query         text,
  municipality_query text,
  on_date            date default current_date
)
returns table (
  role_code          text,
  role_name          text,
  role_match         text,
  municipality_code  char(4),
  municipality_name  text,
  municipality_match text,
  zone               smallint,
  article_number     char(6),
  hourly_price       numeric(10,2),
  currency           char(3),
  valid_from         date,
  valid_to           date
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select v.role_code,
         v.role_name,
         r.match_kind,
         v.municipality_code,
         v.municipality_name,
         m.match_kind,
         v.zone,
         v.article_number,
         v.hourly_price,
         v.currency,
         v.valid_from,
         v.valid_to
  from public.resolve_roles(role_query, 5) r
  join public.resolve_municipalities(municipality_query, 5) m on true
  join public.role_municipality_prices v
    on v.role_code = r.role_code
   and v.municipality_code = m.municipality_code
  where on_date between v.valid_from and v.valid_to
  order by case r.match_kind when 'exact' then 0 when 'prefix' then 1
                             when 'substring' then 2 else 3 end,
           case m.match_kind when 'exact' then 0 when 'prefix' then 1
                             when 'substring' then 2 else 3 end,
           v.role_name,
           v.municipality_name;
$$;

comment on function public.price_lookup is
  'Fritext roll + fritext kommun + datum -> gällande timpris. role_match och '
  'municipality_match säger om träffen var exakt eller gissad.';

grant execute on function public.resolve_municipalities(text, int) to anon, authenticated;
grant execute on function public.resolve_roles(text, int)          to anon, authenticated;
grant execute on function public.price_lookup(text, text, date)    to anon, authenticated;
