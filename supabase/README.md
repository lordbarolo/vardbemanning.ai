# Supabase (eget projekt, utan Lovable Cloud)

Projektet använder ett eget, externt Supabase-projekt. Lovable Cloud ska aldrig aktiveras här.

## Klient

`src/integrations/supabase/client.ts` innehåller projektets URL och publishable/anon-nyckel
(båda är publika värden och får ligga i koden). All åtkomst styrs av RLS.

## Så sätter du upp databasen

Kör i Supabase SQL Editor, i den här ordningen:

1. `data/01_schema.sql` — tabeller (`roles`, `municipalities`, `role_zone_prices`),
   GRANT, RLS-policys och vyn `role_municipality_prices`.
2. `data/02_seed_roller_priser.sql` — 35 roller och 105 prisrader
   (22 sjuksköterske-/barnmorskeroller v1.7 + 13 läkarspecialiteter v1.6).

Båda filerna är idempotenta (`on conflict … do update`) och kan köras om.

## Kommuner och zoner

`municipalities` skapas tom. Pris per kommun beräknas som roll × kommunens SKR-zon,
så varje kommunrad behöver `name`, `region` och `skr_zone` (1–3). Exempel:

```sql
insert into public.municipalities (slug, name, region, skr_zone)
values ('bollnas', 'Bollnäs', 'Region Gävleborg', 3)
on conflict (slug) do update set skr_zone = excluded.skr_zone;
```

## Regler för data

- Ett specifikt pris per roll och zon — aldrig gruppetiketter
  ("Grupp A/B", enbart "Specialistläkare", enbart "Specialistsjuksköterska").
- En roll skrivs bara in om alla tre zoner finns.
- Databasen är källa till sanning; kodkopior av priser är endast fallback.

## Miljövariabler

Se `supabase/env.example`. Servernyckeln (`SUPABASE_SERVICE_ROLE_KEY`) läggs som secret,
aldrig i koden och aldrig med `VITE_`-prefix.
