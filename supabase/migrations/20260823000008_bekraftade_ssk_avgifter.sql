-- Arbetsgivaravgift och tjänstepension för sjuksköterskor: bekräftade.
--
-- När marginalerna seedades var 31,42 % och 4,5 % ett antagande från min sida
-- — de var angivna för läkare men inte för sjuksköterskor. Projektägaren har
-- nu bekräftat att de gäller.
--
-- source-kolumnen visas i gränssnittet som grund för en ersättning en konsult
-- kan fatta beslut på. Skillnaden mellan "antaget" och "bekräftat" är hela
-- poängen med den kolumnen, så texten uppdateras i stället för att stå kvar
-- och underdriva hur väl underbyggd siffran är.

update public.compensation_assumptions
set source = 'Angivet av projektägaren 2026-08-23. '
             'Marginal 20 %, arbetsgivaravgift 31,42 %, tjänstepension 4,5 % — '
             'avgifterna bekräftade av projektägaren samma dag.'
where category = 'sjukskoterska'
  and employment_form = 'anstalld'
  and valid_from = '2026-01-01';

do $$
begin
  if not exists (
    select 1 from public.compensation_assumptions
    where category = 'sjukskoterska' and employment_form = 'anstalld'
      and source like '%bekräftade av projektägaren%'
  ) then
    raise exception 'Källtexten för anställd sjuksköterska uppdaterades inte';
  end if;

  -- Beloppen ska vara oförändrade. Bara texten ändrades.
  if (select round(anstalld_gross_hourly, 2)
      from public.hero_compensation('Sjuksköterska', 'Stockholm', '2026-06-01')) <> 362.57 then
    raise exception 'Bruttolönen ändrades av en textuppdatering';
  end if;
end $$;
