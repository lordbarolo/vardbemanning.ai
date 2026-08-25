-- Marginaler för anbudsområde sjuksköterska.
--
-- Angivet av projektägaren 2026-08-23:
--   företagande sjuksköterska och barnmorska  15 % marginal till bf
--   anställd sjuksköterska och barnmorska     20 % marginal till bf
--
-- Arbetsgivaravgift och tjänstepension är inte omnämnda för sjuksköterskor.
-- Här används samma som för läkare — 31,42 % respektive 4,5 % — eftersom
-- arbetsgivaravgiften är lagstadgad och inte yrkesberoende, och tjänstepensionen
-- är en avtalsnivå som inte angetts avvika. Antagandet står i source-kolumnen
-- så att det syns i gränssnittet och går att ifrågasätta.

insert into public.compensation_assumptions
  (category, employment_form, valid_from, valid_to,
   agency_margin, employer_social_fee, occupational_pension, source)
values
  ('sjukskoterska', 'foretagare', '2026-01-01', '2026-12-31',
   0.1500, null, null,
   'Angivet av projektägaren 2026-08-23'),
  ('sjukskoterska', 'anstalld', '2026-01-01', '2026-12-31',
   0.2000, 0.3142, 0.0450,
   'Marginal angiven av projektägaren 2026-08-23. Arbetsgivaravgift 31,42 % och tjänstepension 4,5 % antagna lika med läkare — ej separat angivna.')
on conflict (category, employment_form, valid_from) do update set
  valid_to             = excluded.valid_to,
  agency_margin        = excluded.agency_margin,
  employer_social_fee  = excluded.employer_social_fee,
  occupational_pension = excluded.occupational_pension,
  source               = excluded.source;

do $$
declare
  f numeric;
  a numeric;
begin
  -- Sjuksköterska i Stockholm, zon 1, regionpris 616 kr/timme.
  select foretagare_hourly, anstalld_gross_hourly into f, a
  from public.hero_compensation('Sjuksköterska', 'Stockholm', '2026-06-01');

  -- 616 x 0,85 = 523,60
  if round(f, 2) <> 523.60 then
    raise exception 'Företagande ssk i Stockholm gav %, förväntade 523.60', f;
  end if;
  -- 616 x 0,80 / 1,3592 = 362,57
  if round(a, 2) <> 362.57 then
    raise exception 'Anställd ssk i Stockholm gav %, förväntade 362.57', a;
  end if;

  -- Barnmorska i Kiruna, zon 3, regionpris 880 kr/timme.
  select foretagare_hourly, anstalld_gross_hourly into f, a
  from public.hero_compensation('Barnmorska', 'Kiruna', '2026-06-01');

  if round(f, 2) <> 748.00 then
    raise exception 'Företagande barnmorska i Kiruna gav %, förväntade 748.00', f;
  end if;
  if round(a, 2) <> 517.95 then
    raise exception 'Anställd barnmorska i Kiruna gav %, förväntade 517.95', a;
  end if;

  -- Alla 88 roller ska nu ha en ersättning i alla tre zoner. Ingen null kvar.
  if exists (
    select 1 from public.role_zone_compensation
    where foretagare_hourly is null or anstalld_gross_hourly is null
  ) then
    raise exception 'Roller utan ersättning kvarstår efter seed av sjuksköterskeantaganden';
  end if;
end $$;
