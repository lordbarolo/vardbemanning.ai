-- Möjlig ersättning: från regionens pris till vad konsulten får ut.
--
-- Regionens pris i role_zone_prices är vad regionen betalar bemanningsföretaget.
-- Konsulten ser något annat, och hur mycket mindre beror på anställningsform:
--
--   Företagare  konsulten fakturerar bf, som behåller sin marginal.
--               ersättning = regionpris x (1 - marginal)
--
--   Anställd    bf anställer konsulten. Av regionpriset går marginalen till bf,
--               resten är arbetsgivarens totalkostnad och ska räcka till
--               bruttolön, arbetsgivaravgift och tjänstepension:
--
--                   brutto x (1 + soc + pension) = regionpris x (1 - marginal)
--               =>  brutto = regionpris x (1 - marginal) / (1 + soc + pension)
--
-- Marginaler och avgifter ligger i tabell, inte i funktionen. Arbetsgivaravgiften
-- ändras med statsbudgeten och marginalerna är affärsvillkor — båda ska kunna
-- justeras utan att någon rör en funktionsdefinition, och gamla värden ska gå
-- att läsa tillbaka för ett datum som passerat.

create table public.compensation_assumptions (
  category             text         not null
    check (category in ('lakare', 'sjukskoterska')),
  employment_form      text         not null
    check (employment_form in ('foretagare', 'anstalld')),
  valid_from           date         not null,
  valid_to             date         not null,
  agency_margin        numeric(6,4) not null
    check (agency_margin >= 0 and agency_margin < 1),
  employer_social_fee  numeric(6,4) check (employer_social_fee  >= 0),
  occupational_pension numeric(6,4) check (occupational_pension >= 0),
  source               text         not null,
  created_at           timestamptz  not null default now(),
  primary key (category, employment_form, valid_from),
  check (valid_to >= valid_from),
  -- En anställd har arbetsgivaravgift och pension, en företagare har det inte.
  -- Utan den här spärren går det att seeda en anställd utan avgifter, och då
  -- blir bruttolönen tyst för hög i stället för att beräkningen fallerar.
  constraint compensation_assumptions_form_consistency check (
    (employment_form = 'anstalld'
       and employer_social_fee is not null and occupational_pension is not null)
    or
    (employment_form = 'foretagare'
       and employer_social_fee is null and occupational_pension is null)
  )
);

comment on table public.compensation_assumptions is
  'Marginaler och lönebikostnader per yrkeskategori och anställningsform. '
  'En rad per avtalsperiod — historiska värden skrivs aldrig över.';
comment on column public.compensation_assumptions.agency_margin is
  'Bemanningsföretagets marginal som andel av regionens pris. 0.1200 = 12 %.';
comment on column public.compensation_assumptions.source is
  'Var siffran kommer ifrån. En ersättning som visas för en konsult ska gå att '
  'härleda till ett beslut eller ett regelverk.';

alter table public.compensation_assumptions enable row level security;

create policy "antaganden är läsbara för alla" on public.compensation_assumptions
  for select to anon, authenticated using (true);

grant select on public.compensation_assumptions to anon, authenticated;

insert into public.compensation_assumptions
  (category, employment_form, valid_from, valid_to,
   agency_margin, employer_social_fee, occupational_pension, source)
values
  ('lakare', 'foretagare', '2026-01-01', '2026-12-31',
   0.1200, null, null,
   'Angivet av projektägaren 2026-08-23'),
  ('lakare', 'anstalld', '2026-01-01', '2026-12-31',
   0.1500, 0.3142, 0.0450,
   'Angivet av projektägaren 2026-08-23. Arbetsgivaravgift 31,42 %, tjänstepension 4,5 %.');

-- Sjuksköterska saknas medvetet. Marginalerna för det anbudsområdet är inte
-- beslutade, och en gissning här blir en siffra en konsult fattar beslut på.
-- Vyn och funktionen nedan ger null för ersättning tills raderna finns, men
-- fortsätter visa regionens pris.

-- ------------------------------------------------- roll x zon x ersättning ---

create view public.role_zone_compensation
with (security_invoker = on) as
select
  r.role_code,
  r.name                as role_name,
  r.category,
  p.zone,
  p.article_number,
  p.hourly_price        as region_price,
  p.currency,
  round(p.hourly_price * (1 - af.agency_margin), 2) as foretagare_hourly,
  round(p.hourly_price * (1 - aa.agency_margin)
        / (1 + aa.employer_social_fee + aa.occupational_pension), 2) as anstalld_gross_hourly,
  af.agency_margin      as foretagare_margin,
  aa.agency_margin      as anstalld_margin,
  aa.employer_social_fee,
  aa.occupational_pension,
  p.valid_from,
  p.valid_to
from public.roles r
join public.role_zone_prices p
  on p.role_code = r.role_code
left join public.compensation_assumptions af
  on af.category = r.category
 and af.employment_form = 'foretagare'
 and p.valid_from between af.valid_from and af.valid_to
left join public.compensation_assumptions aa
  on aa.category = r.category
 and aa.employment_form = 'anstalld'
 and p.valid_from between aa.valid_from and aa.valid_to;

comment on view public.role_zone_compensation is
  'Regionpris och möjlig ersättning per roll och zon. Matar tabellen '
  '"Mest sökta rollerna, alla zoner". Null i ersättningskolumnerna betyder '
  'att antaganden saknas för kategorin, inte att ersättningen är noll.';

grant select on public.role_zone_compensation to anon, authenticated;

-- ------------------------------------------------------ herosektionens RPC ---

create function public.hero_compensation(
  role_query         text,
  municipality_query text,
  on_date            date default current_date
)
returns table (
  role_code             text,
  role_name             text,
  category              text,
  role_match            text,
  municipality_code     char(4),
  municipality_name     text,
  county_name           text,
  contract_region       text,
  zone                  smallint,
  municipality_match    text,
  article_number        char(6),
  region_price          numeric(10,2),
  foretagare_hourly     numeric(10,2),
  anstalld_gross_hourly numeric(10,2),
  foretagare_margin     numeric(6,4),
  anstalld_margin       numeric(6,4),
  employer_social_fee   numeric(6,4),
  occupational_pension  numeric(6,4),
  currency              char(3),
  valid_from            date,
  valid_to              date
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select
    v.role_code,
    v.role_name,
    v.category,
    r.match_kind,
    v.municipality_code,
    v.municipality_name,
    v.county_name,
    v.contract_region,
    v.zone,
    m.match_kind,
    v.article_number,
    v.hourly_price,
    round(v.hourly_price * (1 - af.agency_margin), 2),
    round(v.hourly_price * (1 - aa.agency_margin)
          / (1 + aa.employer_social_fee + aa.occupational_pension), 2),
    af.agency_margin,
    aa.agency_margin,
    aa.employer_social_fee,
    aa.occupational_pension,
    v.currency,
    v.valid_from,
    v.valid_to
  from public.resolve_roles(role_query, 5) r
  join public.resolve_municipalities(municipality_query, 5) m on true
  join public.role_municipality_prices v
    on v.role_code = r.role_code
   and v.municipality_code = m.municipality_code
  left join public.compensation_assumptions af
    on af.category = v.category
   and af.employment_form = 'foretagare'
   and on_date between af.valid_from and af.valid_to
  left join public.compensation_assumptions aa
    on aa.category = v.category
   and aa.employment_form = 'anstalld'
   and on_date between aa.valid_from and aa.valid_to
  where on_date between v.valid_from and v.valid_to
  order by case r.match_kind when 'exact' then 0 when 'prefix' then 1
                             when 'substring' then 2 else 3 end,
           case m.match_kind when 'exact' then 0 when 'prefix' then 1
                             when 'substring' then 2 else 3 end,
           v.role_name,
           v.municipality_name;
$$;

comment on function public.hero_compensation is
  'Herosektionen: fritext roll + fritext ort -> regionens pris och möjlig '
  'ersättning som företagare respektive löntagare. Returnerar också de '
  'antaganden beräkningen vilar på, samt role_match/municipality_match så att '
  'en gissad namnträff går att skilja från en säker.';

grant execute on function public.hero_compensation(text, text, date)
  to anon, authenticated;

do $$
declare
  n numeric;
begin
  -- Avtalets eget exempel korsat med den angivna formeln:
  -- Torsby ligger i zon 3, ögonläkare kostar regionen 1953 kr/timme.
  select foretagare_hourly into n
  from public.hero_compensation('Specialistläkare ögonsjukdomar', 'Torsby', '2026-06-01');
  if n is null or round(n) <> 1719 then
    raise exception 'Företagarersättning i Torsby blev %, förväntade 1718.64', n;
  end if;

  select anstalld_gross_hourly into n
  from public.hero_compensation('Specialistläkare ögonsjukdomar', 'Torsby', '2026-06-01');
  if n is null or round(n) <> 1221 then
    raise exception 'Bruttolön i Torsby blev %, förväntade 1221.34', n;
  end if;
end $$;
