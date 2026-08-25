# Vårdbemanning.ai — backend

Referensdata och databas för svensk vårdbemanning. Fristående projekt: inga
kopplingar, delade tabeller eller ärvda konventioner från andra projekt.

**Supabase:** `zacslqpaqpzxmdyxwjll`, region `eu-north-1` (Stockholm), Postgres 17.

## Vad som finns här nu

Priset per yrkesroll och kommun enligt SKR:s nationella hyrbemanningsavtal
(RS 2022-03983), som frågbar data i stället för tre PDF- och Excel-filer.

| | |
|---|---|
| Yrkesroller | **88** (66 läkare, 22 sjuksköterska/barnmorska) |
| Kommuner | **290**, alla med SCB-kommunkod och zon |
| Zonpriser | **264** (88 roller × 3 zoner) |
| Roll × kommun | **25 520** kombinationer via vyn `role_municipality_prices` |
| Giltighet | 2026-01-01 – 2026-12-31 |

## Datamodellen

Kombinationen roll × kommun lagras **inte** som 25 520 rader. Priset bestäms
av zonen, och zonen bestäms av kommunen:

```
roles (88) ──< role_zone_prices (264) >── zones (3)
                                            │
municipalities (290) ───────────────────────┘
        │
        └── counties (21)
```

Vyn `role_municipality_prices` gör kopplingen vid läsning. Det betyder att en
prisjustering i avtalet är 88 uppdaterade rader, inte 25 520 — och att vyn
aldrig kan innehålla ett pris som avviker från zonpriset den härleds ur.

En materialiserad vy skulle vara snabbare men kan bli inaktuell. Vid den här
storleken kostar den vanliga vyn ingenting: hela korsprodukten är tre små
joins över tabeller som får plats i cachen.

### Artikelnumret är härlett, inte lagrat två gånger

Ett artikelnummer i avtalet är zonsiffran följd av Socialstyrelsens yrkeskod.
Artikel `113430` är zon 1 och yrkeskod `13430`; `313430` är samma roll i zon 3.
Därför är `role_code` yrkeskoden utan zonprefix, och `article_number` byggs i
seeden. Generatorn avbryter om något artikelnummer i källan bryter mönstret.

## Frågor

Vad kostar en specialistläkare i psykiatri i Malmö?

```sql
select * from public.price_lookup('Specialistläkare psykiatri', 'Malmö');
-- 113610 | zon 1 | 1457.00 | role_match=exact | municipality_match=exact
```

Alla kommuner där en anestesisjuksköterska kostar mest:

```sql
select municipality_name, county_name, hourly_price
from public.role_municipality_prices
where role_code = '33030' and zone = 3
order by municipality_name;
```

### För agenter

Tre funktioner är avsedda som verktyg, alla anropbara som PostgREST-RPC:

| Funktion | Vad den gör |
|---|---|
| `resolve_roles(q, max_rows)` | Fritext → yrkesroll. Exakt namnträff utesluter alla andra; annars prefix, delsträng, trigram. `match_kind` säger vilket. |
| `resolve_municipalities(q, max_rows)` | Samma för kommun. |
| `price_lookup(roll, kommun, datum)` | Ett anrop → gällande timpris, med `role_match` och `municipality_match` så att en osäker träff går att skilja från en säker. |

Att skilja exakt från gissad träff är inte kosmetik. Trigram ensamt rankar
"Malå" (zon 3) lika högt som "Malmö" (zon 1) på frågan `Malmö`, vilket ger
1953 kr i stället för 1457 kr utan att något i svaret avslöjar felet. Se
`supabase/migrations/20260823000004_exakt_traff_vinner.sql`.

## Behörigheter

Avtalspriser är offentlig upphandlingsinformation. RLS är påslagen på alla
tabeller med läsrätt för `anon` och `authenticated`. Ingen roll har skrivrätt
— data ändras enbart genom migrations, som körs som `service_role`.

## Köra om datan

När SKR släpper en ny katalogversion: lägg filerna i `data/source/`, uppdatera
`CATALOGS` i generatorn och kör

```bash
pip install openpyxl pymupdf
python3 scripts/generate_migrations.py
```

Generatorn skriver inget om en invariant brister — fel antal kommuner, en roll
som saknar en zon, ett artikelnummer som inte är zon+yrkeskod, en regionetikett
som pekar på fel län. Seed-migrationerna innehåller dessutom en `do`-block som
räknar raderna efter insert och kastar undantag vid avvikelse, så en trasig
katalog stoppas både före och efter att SQL:en körs.

`data/roll_kommun_pris.csv` är hela korsprodukten utskriven för granskning i
Excel. Den läses inte av något — sanningen är databasen.

## Ansvarsfördelning mot Lovable

Frontenden byggs i Lovable av en annan agent. `docs/ANSVARSFORDELNING.md` är
originalet för vem som äger vad; `docs/lovable-project-knowledge.md` är samma
text i den form som är installerad som Project Knowledge i Lovable-projektet
`Vårdbemanning AI Assistant`.

Kortversionen: Lovable äger `src/**` och all design, den här backenden äger
`supabase/**` och all data. Lovable skriver aldrig SQL, aldrig migrations och
slår aldrig på Lovable Cloud. Ändra dokumentet här först, installera om i
Lovable efteråt — annars driver de isär.

## Struktur

```
supabase/migrations/   schema, seeds, funktioner — körs i filnamnsordning
scripts/               generatorn som bygger seeds ur källfilerna
data/source/           avtalets original: två xlsx, en pdf
data/*.csv             genererad export för granskning
data/KALLOR.md         vad som är importerat och vad som inte är det
docs/                  ansvarsfördelningen mot Lovable
```

## Nästa steg

1. **Profiler och inlogg** — `profiles` mot `auth.users`, storage-bucket för
   dokument med RLS per användare.
2. **Jour, beredskap och reseschablon** — de fyra bladen i katalogerna som inte
   är importerade ännu (se `data/KALLOR.md`). Krävs för att räkna på ett
   faktiskt pass, inte bara grundtimmen.
3. **MCP-server** — edge function som exponerar `resolve_*` och `price_lookup`
   som verktyg, med samma RLS som UI:t läser genom.
4. **Design tokens** — hämtas från det andra projektet till frontenden i
   Lovable. Rör inte den här databasen.
