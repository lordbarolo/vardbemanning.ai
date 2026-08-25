-- Vardagsnamn för yrkesroller.
--
-- Avtalet heter "Specialistläkare ögonsjukdomar". Användaren skriver
-- "ögonläkare". Trigram ensamt matchar då hellre "ST-läkare", som delar fler
-- teckentripplar — och heron visar 1233 kr i stället för 1953. Samma klass av
-- fel som Malmö/Malå: fel svar utan att något i svaret avslöjar det.
--
-- Lösningen är ett synonymlager. resolve_roles söker mot både avtalsnamnet och
-- synonymerna, och returnerar alltid den kanoniska rollen.

create table public.role_aliases (
  role_code  text    not null references public.roles (role_code) on delete cascade,
  alias      text    not null,
  is_primary boolean not null default false,
  source     text    not null,
  created_at timestamptz not null default now(),
  primary key (role_code, alias)
);

comment on table public.role_aliases is
  'Vardagsnamn och synonymer per roll. Påverkar bara sökning och visningsnamn '
  '— aldrig pris, artikelnummer eller zon.';
comment on column public.role_aliases.is_primary is
  'Det korta namn som visas i listor och tabeller. Högst ett per roll. '
  'Saknas det används avtalsnamnet i roles.name.';

create unique index role_aliases_one_primary_idx
  on public.role_aliases (role_code) where is_primary;

create index role_aliases_alias_trgm_idx
  on public.role_aliases using gin (alias extensions.gin_trgm_ops);

alter table public.role_aliases enable row level security;

create policy "synonymer är läsbara för alla" on public.role_aliases
  for select to anon, authenticated using (true);

grant select on public.role_aliases to anon, authenticated;

-- Sjuksköterskesynonymerna finns redan i källan: priskatalogens
-- artikelbeskrivning är just vardagsnamnet ("anestesisjuksköterska",
-- "barnsjuksköterska"). De hämtas därifrån i stället för att skrivas för hand.

insert into public.role_aliases (role_code, alias, is_primary, source)
select role_code, description, true, 'Artikelbeskrivning i priskatalogen'
from public.roles
where category = 'sjukskoterska'
  and description ilike '%sköterska%'
  and lower(description) is distinct from lower(name)
on conflict do nothing;

-- Läkarspecialiteternas artikelbeskrivning är specialitetens formella namn
-- ("Kardiologi"), inte yrkestiteln. De skrivs därför för hand.

insert into public.role_aliases (role_code, alias, is_primary, source) values
  ('13010','Barnläkare',true,'Vedertagen yrkestitel'),
  ('13010','Pediatriker',false,'Vedertagen yrkestitel'),
  ('13012','Barnallergolog',true,'Vedertagen yrkestitel'),
  ('13013','Barnonkolog',true,'Vedertagen yrkestitel'),
  ('13014','Barnkardiolog',true,'Vedertagen yrkestitel'),
  ('13015','Barnneurolog',true,'Vedertagen yrkestitel'),
  ('13016','Neonatolog',true,'Vedertagen yrkestitel'),
  ('13110','Klinisk fysiolog',true,'Vedertagen yrkestitel'),
  ('13120','Röntgenläkare',true,'Vedertagen yrkestitel'),
  ('13120','Radiolog',false,'Vedertagen yrkestitel'),
  ('13122','Neuroradiolog',true,'Vedertagen yrkestitel'),
  ('13200','Allmänläkare',true,'Vedertagen yrkestitel'),
  ('13200','Distriktsläkare',false,'Vedertagen yrkestitel'),
  ('13200','Husläkare',false,'Vedertagen yrkestitel'),
  ('13210','Akutläkare',true,'Vedertagen yrkestitel'),
  ('13230','Hudläkare',true,'Vedertagen yrkestitel'),
  ('13230','Dermatolog',false,'Vedertagen yrkestitel'),
  ('13240','Infektionsläkare',true,'Vedertagen yrkestitel'),
  ('13250','Klinisk farmakolog',true,'Vedertagen yrkestitel'),
  ('13260','Klinisk genetiker',true,'Vedertagen yrkestitel'),
  ('13270','Onkolog',true,'Vedertagen yrkestitel'),
  ('13280','Reumatolog',true,'Vedertagen yrkestitel'),
  ('13290','Rättsläkare',true,'Vedertagen yrkestitel'),
  ('13310','Endokrinolog',true,'Vedertagen yrkestitel'),
  ('13310','Diabetolog',false,'Vedertagen yrkestitel'),
  ('13320','Gastroenterolog',true,'Vedertagen yrkestitel'),
  ('13330','Geriatriker',true,'Vedertagen yrkestitel'),
  ('13340','Hematolog',true,'Vedertagen yrkestitel'),
  ('13350','Internmedicinare',true,'Vedertagen yrkestitel'),
  ('13360','Kardiolog',true,'Vedertagen yrkestitel'),
  ('13360','Hjärtläkare',false,'Vedertagen yrkestitel'),
  ('13370','Lungläkare',true,'Vedertagen yrkestitel'),
  ('13380','Njurläkare',true,'Vedertagen yrkestitel'),
  ('13380','Nefrolog',false,'Vedertagen yrkestitel'),
  ('13400','Anestesiläkare',true,'Vedertagen yrkestitel'),
  ('13400','Narkosläkare',false,'Vedertagen yrkestitel'),
  ('13400','Anestesiolog',false,'Vedertagen yrkestitel'),
  ('13400','IVA-läkare',false,'Vedertagen yrkestitel'),
  ('13410','Barnkirurg',true,'Vedertagen yrkestitel'),
  ('13420','Handkirurg',true,'Vedertagen yrkestitel'),
  ('13430','Kirurg',true,'Vedertagen yrkestitel'),
  ('13430','Allmänkirurg',false,'Vedertagen yrkestitel'),
  ('13440','Kärlkirurg',true,'Vedertagen yrkestitel'),
  ('13450','Gynekolog',true,'Vedertagen yrkestitel'),
  ('13450','Obstetriker',false,'Vedertagen yrkestitel'),
  ('13450','Förlossningsläkare',false,'Vedertagen yrkestitel'),
  ('13460','Ortoped',true,'Vedertagen yrkestitel'),
  ('13470','Plastikkirurg',true,'Vedertagen yrkestitel'),
  ('13480','Thoraxkirurg',true,'Vedertagen yrkestitel'),
  ('13490','Urolog',true,'Vedertagen yrkestitel'),
  ('13500','Ögonläkare',true,'Vedertagen yrkestitel'),
  ('13500','Oftalmolog',false,'Vedertagen yrkestitel'),
  ('13510','ÖNH-läkare',true,'Vedertagen yrkestitel'),
  ('13510','Öronläkare',false,'Vedertagen yrkestitel'),
  ('13512','Audiolog',true,'Vedertagen yrkestitel'),
  ('13513','Foniater',true,'Vedertagen yrkestitel'),
  ('13530','Klinisk kemist',true,'Vedertagen yrkestitel'),
  ('13540','Mikrobiolog',true,'Vedertagen yrkestitel'),
  ('13550','Patolog',true,'Vedertagen yrkestitel'),
  ('13560','Klinisk neurofysiolog',true,'Vedertagen yrkestitel'),
  ('13570','Neurokirurg',true,'Vedertagen yrkestitel'),
  ('13580','Neurolog',true,'Vedertagen yrkestitel'),
  ('13590','Rehabläkare',true,'Vedertagen yrkestitel'),
  ('13600','BUP-läkare',true,'Vedertagen yrkestitel'),
  ('13600','Barnpsykiater',false,'Vedertagen yrkestitel'),
  ('13610','Psykiater',true,'Vedertagen yrkestitel'),
  ('13612','Rättspsykiater',true,'Vedertagen yrkestitel'),
  ('13900','Allergolog',true,'Vedertagen yrkestitel'),
  ('13910','Företagsläkare',true,'Vedertagen yrkestitel'),
  ('13920','Beroendeläkare',true,'Vedertagen yrkestitel'),
  ('13930','Gynonkolog',true,'Vedertagen yrkestitel'),
  ('13940','Nuklearmedicinare',true,'Vedertagen yrkestitel'),
  ('13950','Palliativläkare',true,'Vedertagen yrkestitel'),
  ('13960','Skolläkare',true,'Vedertagen yrkestitel'),
  ('13970','Smärtläkare',true,'Vedertagen yrkestitel'),
  ('13980','Hygienläkare',true,'Vedertagen yrkestitel'),
  ('13990','Äldrepsykiater',true,'Vedertagen yrkestitel'),
  ('11000','Leg. läkare',false,'Vanlig förkortning'),
  ('33030','Narkossköterska',false,'Vanligt talspråk'),
  ('33100','IVA-sjuksköterska',false,'Vanlig förkortning'),
  ('33140','OP-sjuksköterska',false,'Vanlig förkortning'),
  ('33060','DSK',false,'Vanlig förkortning')
on conflict (role_code, alias) do nothing;

-- ---------------------------------------------- resolve_roles ser synonymer ---

create or replace function public.resolve_roles(q text, max_rows int default 5)
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
  -- Varje roll söks både på sitt avtalsnamn och på var och en av sina synonymer.
  candidates as (
    select r.role_code, r.name, r.category, r.name as haystack
    from public.roles r
    union all
    select a.role_code, r.name, r.category, a.alias
    from public.role_aliases a
    join public.roles r on r.role_code = a.role_code
  ),
  scored as (
    select c.role_code,
           c.name,
           c.category,
           case
             when lower(extensions.unaccent(c.haystack)) = n.q              then 'exact'
             when lower(extensions.unaccent(c.haystack)) like n.q || '%'    then 'prefix'
             when lower(extensions.unaccent(c.haystack)) like '%'||n.q||'%' then 'substring'
             else 'fuzzy'
           end as match_kind,
           similarity(extensions.unaccent(c.haystack), extensions.unaccent(q)) as similarity
    from candidates c
    cross join needle n
    where lower(extensions.unaccent(c.haystack)) like '%' || n.q || '%'
       or extensions.unaccent(c.haystack) % extensions.unaccent(q)
  ),
  -- En roll kan träffa via både namn och flera synonymer. Behåll dess bästa.
  best as (
    select s.*,
           row_number() over (
             partition by s.role_code
             order by case s.match_kind
                        when 'exact' then 0 when 'prefix' then 1
                        when 'substring' then 2 else 3 end,
                      s.similarity desc
           ) as rn
    from scored s
  )
  select b.role_code, b.name, b.category, b.match_kind, b.similarity
  from best b
  where b.rn = 1
    and (b.match_kind = 'exact'
         or not exists (select 1 from best e where e.rn = 1 and e.match_kind = 'exact'))
  order by case b.match_kind
             when 'exact' then 0 when 'prefix' then 1 when 'substring' then 2 else 3
           end,
           b.similarity desc,
           b.name
  limit greatest(1, least(max_rows, 100));
$$;

comment on function public.resolve_roles is
  'Fritext -> yrkesroll. Söker avtalsnamn och synonymer. Exakt träff på något '
  'av dem utesluter alla andra; annars prefix, delsträng, trigram. '
  'match_kind säger vilket.';

-- ------------------------------------------------------ visningsnamn i vy ---

-- display_name läggs sist: create or replace view tillåter bara att kolumner
-- adderas i slutet, aldrig att en skjuts in i mitten.
create or replace view public.role_zone_compensation
with (security_invoker = on) as
select
  r.role_code,
  r.name                          as role_name,
  r.category,
  p.zone,
  p.article_number,
  p.hourly_price                  as region_price,
  p.currency,
  round(p.hourly_price * (1 - af.agency_margin), 2) as foretagare_hourly,
  round(p.hourly_price * (1 - aa.agency_margin)
        / (1 + aa.employer_social_fee + aa.occupational_pension), 2) as anstalld_gross_hourly,
  af.agency_margin      as foretagare_margin,
  aa.agency_margin      as anstalld_margin,
  aa.employer_social_fee,
  aa.occupational_pension,
  p.valid_from,
  p.valid_to,
  coalesce(pa.alias, r.name)      as display_name
from public.roles r
join public.role_zone_prices p
  on p.role_code = r.role_code
left join public.role_aliases pa
  on pa.role_code = r.role_code and pa.is_primary
left join public.compensation_assumptions af
  on af.category = r.category
 and af.employment_form = 'foretagare'
 and p.valid_from between af.valid_from and af.valid_to
left join public.compensation_assumptions aa
  on aa.category = r.category
 and aa.employment_form = 'anstalld'
 and p.valid_from between aa.valid_from and aa.valid_to;

grant select on public.role_zone_compensation to anon, authenticated;

do $$
declare
  rc text;
  fh numeric;
begin
  -- Det fall som var trasigt innan synonymerna fanns.
  select role_code, foretagare_hourly into rc, fh
  from public.hero_compensation('Ögonläkare', 'Torsby', '2026-06-01');
  if rc is distinct from '13500' then
    raise exception 'Ögonläkare i Torsby gav roll %, förväntade 13500', rc;
  end if;
  if round(fh) <> 1719 then
    raise exception 'Ögonläkare i Torsby gav % kr, förväntade 1718.64', fh;
  end if;

  -- Ett par till som herons rullgardin kommer använda.
  select role_code into rc from public.hero_compensation('Narkosläkare', 'Kiruna', '2026-06-01');
  if rc is distinct from '13400' then
    raise exception 'Narkosläkare gav roll %, förväntade 13400', rc;
  end if;

  select role_code into rc from public.hero_compensation('Geriatriker', 'Malmö', '2026-06-01');
  if rc is distinct from '13330' then
    raise exception 'Geriatriker gav roll %, förväntade 13330', rc;
  end if;
end $$;
