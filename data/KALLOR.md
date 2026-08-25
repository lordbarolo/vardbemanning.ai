# Källor

Allt i `supabase/migrations/2026082300000[23]_*` är genererat ur filerna i
`data/source/`. Rör aldrig SQL-filerna för hand — kör om generatorn.

| Fil | Innehåll | Version |
|---|---|---|
| `priskatalog_lakare_v1.6_2026.xlsx` | Artikel- och priskatalog, anbudsområde läkare | 1.6, giltig 2026-01-01–2026-12-31 |
| `priskatalog_sjukskoterska_v1.7_20260224.xlsx` | Artikel- och priskatalog, anbudsområde sjuksköterska | 1.7, daterad 2026-02-24 |
| `bilaga3_zonindelning.pdf` | Bilaga Zonindelning, kommun → zon | RS 2022-03983 |
| `scb_kommunkoder.json` | SCB:s kommunkoder och länsnamn | via npm-paketet `kommunkoder` 1.1.1 |

Samtliga hör till **avtal RS 2022-03983, Samordnad upphandling hyrpersonal
inom hälso- och sjukvård för Sveriges regioner**.

## Varför en separat kommunkodsfil

Bilaga 3 listar kommunerna med namn men utan kommunkod. Utan kod går datan
inte att joina mot Fortnox, regionernas system eller SCB-statistik. Koderna
hämtas därför ur SCB:s förteckning och matchas på namn — alla 290 namn i
bilagan matchar SCB exakt, inga undantag och inga manuella mappningar.

## Vad som *inte* är importerat

Priskatalogerna innehåller fyra blad till som ligger utanför det här paketet:

- **Jour och beredskap, tillägg** — pristillägg per tidsintervall (vardagkväll,
  storhelg natt, …) samt x2,0-artiklar för utfört arbete under jour.
- **Jour och beredskap, ej utfört arbete** — x0,60/x0,30/x0,14-artiklar.
- **Reseschablon** — fyra avståndsnivåer, gäller bara zon 2 och 3.
- **Introduktion** — artikel 4000, pris 0.

De är nästa steg om appen ska räkna ut vad ett faktiskt pass ger, inte bara
vad grundtimmen kostar. Modellen är förberedd för det: `role_zone_prices` är
grundpriset, tilläggen blir en egen tabell med samma zon- och datumnyckel.
