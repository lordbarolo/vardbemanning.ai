-- Visningsnamn för roll 31000, och bekräftat att läkarmarginalerna gäller alla.
--
-- Avtalet kallar roll 31000 för "Sjuksköterska". I en lista där tjugo rader
-- börjar på "Specialistsjuksköterska" läses det som en kategori snarare än ett
-- val — och det är just den rollen som saknar specialistutbildning. Ett
-- visningsnamn som säger vad rollen faktiskt är gör skillnaden synlig.
--
-- roles.name rörs inte. Det är avtalets artikelbenämning och ska stå kvar
-- ordagrant; det är visningsnamnet som byts.

insert into public.role_aliases (role_code, alias, is_primary, source) values
  ('31000', 'Allmänsjuksköterska',      true,  'Visningsnamn valt av projektägaren 2026-08-23'),
  ('31000', 'Leg. sjuksköterska',       false, 'Alternativ benämning angiven av projektägaren'),
  ('31000', 'Legitimerad sjuksköterska', false, 'Alternativ benämning angiven av projektägaren'),
  ('31000', 'Grundutbildad sjuksköterska', false, 'Vanlig benämning i avtalssammanhang')
on conflict (role_code, alias) do update set
  is_primary = excluded.is_primary,
  source     = excluded.source;

-- Projektägaren har bekräftat att legitimerad läkare och ST-läkare omfattas av
-- samma marginaler som specialistläkarna. Frågan var öppen och står nu i
-- källtexten i stället för i en chattlogg.

update public.compensation_assumptions
set source = 'Angivet av projektägaren 2026-08-23. Gäller alla läkarroller, '
             'inklusive legitimerad läkare och ST-läkare — bekräftat samma dag.'
where category = 'lakare' and employment_form = 'foretagare';

update public.compensation_assumptions
set source = 'Angivet av projektägaren 2026-08-23. Arbetsgivaravgift 31,42 %, '
             'tjänstepension 4,5 %. Gäller alla läkarroller, inklusive '
             'legitimerad läkare och ST-läkare — bekräftat samma dag.'
where category = 'lakare' and employment_form = 'anstalld';

do $$
declare
  dn text;
  rc text;
begin
  select display_name into dn
  from public.role_zone_compensation where role_code = '31000' and zone = 1;
  if dn is distinct from 'Allmänsjuksköterska' then
    raise exception 'Visningsnamnet för 31000 blev %, förväntade Allmänsjuksköterska', dn;
  end if;

  -- Avtalsnamnet ska fortfarande hitta rollen, och fortfarande bara den.
  select role_code into rc from public.hero_compensation('Sjuksköterska', 'Kiruna', '2026-06-01');
  if rc is distinct from '31000' then
    raise exception 'Sökning på Sjuksköterska gav roll %, förväntade 31000', rc;
  end if;

  -- Och de nya benämningarna ska leda till samma roll.
  select role_code into rc from public.hero_compensation('Allmänsjuksköterska', 'Kiruna', '2026-06-01');
  if rc is distinct from '31000' then
    raise exception 'Allmänsjuksköterska gav roll %, förväntade 31000', rc;
  end if;

  select role_code into rc from public.hero_compensation('Leg. sjuksköterska', 'Kiruna', '2026-06-01');
  if rc is distinct from '31000' then
    raise exception 'Leg. sjuksköterska gav roll %, förväntade 31000', rc;
  end if;

  -- Specialistsjuksköterskorna ska inte ha påverkats.
  select role_code into rc from public.hero_compensation('Specialistsjuksköterska intensivvård', 'Kiruna', '2026-06-01');
  if rc is distinct from '33100' then
    raise exception 'Specialistsjuksköterska intensivvård gav roll %, förväntade 33100', rc;
  end if;
end $$;
