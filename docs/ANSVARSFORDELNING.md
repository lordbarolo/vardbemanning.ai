# Ansvarsfördelning: Lovable ↔ Claude Code

Det här dokumentet är installerat som **Project Knowledge** i Lovable-projektet
`Vårdbemanning AI Assistant` (`701dd6d0-5d82-48a3-aca9-08a3ce4b13b1`) och är
skrivet för att läsas av Lovables agent. Repot är originalet — ändra här först,
installera om i Lovable efteråt.

Grundregeln är att **varje fil och varje databasobjekt har exakt en ägare**.
Delat ägarskap finns inte. Om två agenter kan ändra samma sak kommer de förr
eller senare göra det samtidigt och åt olika håll.

---

## Vårdbemanning.ai — ansvarsfördelning

Backenden till det här projektet ägs av en separat agent (Claude Code) och bor
i git-repot `lordbarolo/vardbemanning.ai`. Du äger frontenden. Nedan står vad det betyder.

### Du äger — ändra fritt

- `src/**` — komponenter, sidor, routing, hooks, klientlogik
- Design tokens, Tailwind-konfiguration, tema, typografi, all styling
- Formulär, validering i UI, laddningstillstånd, felmeddelanden för användaren
- Klientens tillståndshantering och datahämtning
- All text som visas för användaren
- `package.json` och frontend-beroenden

### Du rör aldrig

1. **Databasschemat.** Skriv aldrig `create`, `alter`, `drop` eller `grant` —
   inte mot tabeller, kolumner, vyer, index, funktioner, triggers, enums,
   policies eller extensions.
2. **Rå SQL.** Kör inte SQL mot databasen, varken i migrations, edge functions
   eller klientkod. Läs data genom klientbiblioteket och de RPC-funktioner som
   listas under *Kontraktet*.
3. **Katalogerna `supabase/`, `data/`, `scripts/` och `docs/`.** Skapa, ändra
   eller radera inga filer där. De ägs av backend-agenten, och
   `supabase/migrations/` körs i filnamnsordning mot produktionsdatabasen.
   Se *Ett repo, två ägare* för hela uppdelningen.
4. **Lovable Cloud.** Slå aldrig på en databas via Lovable (`enable_database`),
   och koppla aldrig projektet till ett annat Supabase-projekt än det som står
   under *Kontraktet*. Projektet har redan en backend.
5. **Referensdata.** Kommuner, zoner, yrkesroller och avtalspriser är
   skrivskyddade. Skriv aldrig till dem, seeda dem inte, och hårdkoda dem inte
   i frontenden — inte ens en delmängd, inte ens "tillfälligt".
6. **Genererade databastyper.** Filen med Supabase-typer genereras av backenden.
   Redigera den aldrig för hand. Saknas en typ betyder det att schemat inte har
   ändrats ännu — se *Begära en backendändring*.
7. **Hemligheter.** Service role-nyckeln, databaslösenord och API-secrets får
   aldrig förekomma i klientkod, i `.env`-filer i repot eller i en edge function
   du skrivit. Endast de publika värdena under *Kontraktet* är tillåtna.
8. **RLS.** Försök aldrig kringgå row level security, och bygg aldrig en
   funktion som läser data åt en användare som inte själv får läsa den.
9. **Andra projekt — och Compcare i synnerhet.** Hämta inte kod, tabeller,
   minnen, siffror eller konventioner från andra projekt i workspacet. Allt som
   byggs här bygger på projektets egna uppgifter: avtalstexten, databasen, och
   det projektägaren själv anger. Compcare och "Remix of Compcare" är inte
   referens för något — inte schema, inte marginaler, inte beräkningar, inte
   namngivning. Det gäller även när deras variant ligger inom räckhåll och ser
   rimlig ut: hittar du en siffra där och inte här, fråga ägaren i stället för
   att låna. Undantag finns bara när ägaren uttryckligen pekar ut något.
   Redan överfört och godkänt: startsidans design och de fyra SQL-filerna
   nedan, som ligger kvar men aldrig ska härledas ifrån.
10. **Radera ingenting utan att fråga först.** Stående order från
    projektägaren. Innan något tas bort: namnge exakt vad — fullständiga
    sökvägar, en rad per objekt — och vänta på ett uttryckligt ja. Tystnad är
    nej. Ett tidigare ja till en liknande borttagning är nej. Det gäller filer,
    kataloger, routes, komponenter och beroenden, och lika mycket när
    borttagningen är indirekt: att "städa upp", "ta bort oanvänt" eller
    "refaktorera bort" något är att radera det. Ägaren har handplockat vad som
    förts över hit — det som ser ut som en kvarleva är sannolikt ett medvetet
    val.

### Backend-agenten äger — och rör inte din kod

- `supabase/migrations/**` — allt schema, all RLS, alla databasfunktioner
- Edge functions och MCP-servern
- Referensdata och seed-skript
- Supabase-projektets konfiguration och hemligheter
- Formen på datan du läser

Backend-agenten ändrar aldrig något under `src/**`, rör inte design tokens och
strukturerar inte om dina routes.

---

## Ett repo, två ägare

Frontend och backend delar **samma** git-repo, `lordbarolo/vardbemanning.ai`.
Gränsen går alltså inte mellan repon utan mellan sökvägar. Du kan tekniskt
skriva var som helst — därför är listan nedan bindande.

| Sökväg | Ägare |
|---|---|
| `src/**`, `public/**` | Du |
| `package.json`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `.prettierrc`, `components.json`, `bun.lock` | Du |
| `AGENTS.md`, `.lovable/**` | Verktygsgenererat — lämna orört |
| `supabase/**` | Backend-agenten |
| `data/**` | Backend-agenten |
| `scripts/**` | Backend-agenten |
| `docs/**` | Backend-agenten |
| `README.md`, `.env.example` | Backend-agenten |

När din första synk går till repot: skriv aldrig över eller slå ihop något
under backendens sökvägar. Ser du en konflikt där — stanna och säg till.

### Fyra filer som ägaren valt att behålla

```
data/01_schema.sql
data/02_seed_roller_priser.sql
supabase/README.md
supabase/env.example
```

De hämtades medvetet av projektägaren och ska ligga kvar. Rör dem inte —
varken för att ändra eller radera.

En sak att veta om du läser dem: de är **inte** det schema som är utrullat.
Filerna beskriver 35 roller och 105 priser med identifierarna `slug`,
`skr_zone` och `hourly_rate_sek`. Databasen har 88 roller, 264 zonpriser och
290 kommuner, nycklade på `role_code` och `municipality_code`. Det utrullade
schemat står i `supabase/migrations/` och är det `Kontraktet` nedan beskriver.
Härled aldrig typer, kolumnnamn eller antaganden ur de fyra filerna.

Design tokens från Compcare är också medvetet införda (`src/styles.css`,
Deep Space-temat) och ska vara kvar. Undantaget i förbud 9 gäller utseende,
aldrig data eller schema — skapa alltså ingen egen `supabase/`-katalog utöver
den som redan finns, och anslut till databasen enbart via
`src/integrations/supabase/client.ts`.

---

## Kontraktet

Det här är hela ytan mellan er. Allt annat i databasen är intern
implementation som kan ändras utan förvarning.

**Supabase-projekt:** `zacslqpaqpzxmdyxwjll` (region eu-north-1, Stockholm)

**Miljövariabler — enbart dessa två, båda publika:**

```
VITE_SUPABASE_URL=https://zacslqpaqpzxmdyxwjll.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_wmaAmPHjmaYMmvYJ2MlJkA_7_Z4kZLj
```

**Herosektionen — ett anrop räcker**

```js
supabase.rpc('hero_compensation', {
  role_query: 'Ögonläkare', municipality_query: 'Torsby'
})
```

Ger `region_price`, `foretagare_hourly`, `anstalld_gross_hourly`, zon, län,
artikelnummer, samt marginaler och avgifter beräkningen vilar på.

**Vyer och funktioner**

| Objekt | Innehåll |
|---|---|
| `hero_compensation(roll, ort, datum)` | Möjlig ersättning, se ovan |
| `role_zone_compensation` | Roll × zon med regionpris och ersättning. `display_name` ger korta namn. |
| `role_municipality_prices` | Roll × kommun med regionens pris. 25 520 rader. |
| `resolve_roles(q, n)` | Fritext → roll. Söker även synonymer. |
| `resolve_municipalities(q, n)` | Fritext → kommun |
| `price_lookup(roll, ort, datum)` | Enbart regionens pris |
| `search_roles` / `search_municipalities` | Autocomplete |

**Läsbara tabeller:** `roles`, `role_aliases`, `municipalities`, `counties`,
`zones`, `role_zone_prices`, `compensation_assumptions`. Alla skrivskyddade.

### `match_kind` får inte döljas för användaren

`resolve_*` och `hero_compensation` returnerar om namnträffen var `exact` eller
gissad (`prefix`, `substring`, `fuzzy`). Ett belopp som bygger på en gissad
träff måste visas som osäkert — märk det, eller be användaren välja mellan
kandidaterna. Presentera aldrig en fuzzy-träff som ett bekräftat belopp.

Skälet är konkret: söker någon på `Malmö` ligger `Malå` nära i stavning men i
en annan zon, och skillnaden är 1457 kr mot 1953 kr i timmen. Ett fel där
hamnar i en faktura.

### Visa vad beloppet vilar på

`hero_compensation` returnerar också `foretagare_margin`, `anstalld_margin`,
`employer_social_fee` och `occupational_pension`. Det är en ersättning en
konsult kan fatta beslut på — grunden ska gå att se, inte gissa.

---

## Begära en backendändring

Behöver du en tabell, en kolumn, en policy eller en funktion som inte finns:
**bygg den inte, och bygg inte runt den.** Stanna och skriv i chatten:

> **Backendändring behövs**
> Vad jag försöker bygga: …
> Vad som saknas: …
> Föreslagen form (tabell/kolumn/funktion, typer, relationer): …
> Vem ska få läsa respektive skriva: …

Användaren för det vidare till backend-agenten. När migrationen är körd får du
uppdaterade typer och kan fortsätta.

Vanliga fall som ser ut som frontend-arbete men är backendändringar:

- "Jag behöver bara ett fält till på profilen"
- "Jag cachar priserna i en JSON-fil så slipper vi anropet"
- "Jag lägger en vy här så blir queryn enklare"
- "Jag stänger av RLS medan jag testar"

Alla fyra är backendändringar. Ingen av dem gör du.

---

## Varför gränsen ser ut så här

**Schemadrift.** Skriver både du och backend-agenten migrations blir det två
källor till sanning för samma tabeller. De divergerar tyst och upptäcks först
när en deploy misslyckas eller ett pris blir fel.

**Priserna ska gå att lita på.** Datan kommer ur ett upphandlat avtal
(RS 2022-03983) och verifieras mot originalfilerna vid varje import. En
hårdkodad kopia i frontenden går inte att verifiera och blir inaktuell när
avtalet uppdateras.

**Agenter läser samma data som människor.** Appen ska vara lika användbar för
en agent som för en människa. Det fungerar bara om åtkomstreglerna sitter i
databasen, en gång, och inte i varje klient för sig.

**RLS är hela säkerhetsmodellen.** Det finns inget applikationslager mellan
klienten och databasen som kan fånga upp en lucka. En policy som är fel är
publik data.
