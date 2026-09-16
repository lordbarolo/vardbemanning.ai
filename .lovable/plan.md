# Steg 1: sidan Leverantörsstatistik

Ett steg i taget. Den här planen bygger **bara** en sida där du väljer yrke,
eventuell specialisering och ort — och får en lista på vilka bemanningsföretag
som faktiskt fakturerat mest timmar där. Ingen chatt, ingen AI, inget annat.

## Är materialet optimalt?

Datapaketet i sig är bra: källa, kvalitetsförbehåll och gränser är tydligt
beskrivna, och RPC-funktionerna gör precis det sidan behöver. Fyra saker i den
bifogade prompten passar dock inte det här projektet och behöver ändras:

1. **Ortsuppslagningen.** Prompten säger tabellen `locations` med kolumnerna
   `kommun`, `region`, `zon`. Den tabellen finns inte här — projektet har
   `municipalities`, `zones` och funktionen `search_municipalities`, som
   startsidans sökruta redan använder. Jag återanvänder den i stället, så
   ortsvalet fungerar likadant på båda ställena.
2. **Filstrukturen.** Prompten pekar på `src/pages/...` och `App.tsx`. Projektet
   har inte de filerna — sidor ligger som routes. Sidan hamnar därför på
   `/leverantorer` under samma inloggningsskydd som dashboarden.
3. **Verifieringssiffrorna** (Bonliva 24,3 % i zon 3 osv.) kan jag inte
   kontrollera förrän datan ligger i databasen. Jag bygger sidan och redovisar
   vad den faktiskt visar, så du kan stämma av mot din kontrollfil.
4. **Databasdelen är inte min.** `schema.sql` och de tre CSV-filerna ska köras
   av dig eller backend-agenten — jag rör aldrig schemat. Två anmärkningar att
   skicka vidare: filen saknar `grant`-satser (utan dem svarar tabellerna med
   behörighetsfel även med RLS på plats), och läsning är begränsad till
   inloggade, vilket är rimligt men innebär att sidan måste ligga bakom login.

Fram till att datan är importerad visar sidan ett tydligt "statistiken är inte
tillgänglig än" i stället för tomma listor.

## Vad som byggs

En sida på `/leverantorer`, bakom inloggning, med:

- **Yrke** (obligatoriskt). De vanligaste rollerna först, resten i bokstavsordning.
- **Specialisering** (valfritt), som följer valt yrke. Standard: alla.
- **Ort** (obligatoriskt). Samma sökruta som på startsidan. Under fältet står
  vilken zon orten hör till, t.ex. "Hudiksvall ligger i zon 3", eftersom
  statistiken bara finns per zon.
- **Period**: senaste fyra kvartalen som standard, med val för två kvartal eller
  hela perioden.

Resultatet är en lista sorterad efter rapporterade timmar: leverantör (med
"avtal avslutat" där det gäller), andel av timmarna med stapel, fakturerade
timmar, snittpris per timme, hur många kvartal de levererat och avtalsområde.
Tio rader först, knapp för att visa alla, och en summeringsrad under.

Ovanför resultatet ligger informationsrutan med förbehållen, ordagrant som i
ditt underlag, plus källänken till VGR.

Länk "Leverantörer" läggs i samma navigation som dashboarden.

## Osäker ortsträff

Om ortsökningen inte ger en exakt träff visas det — sidan gissar aldrig fram en
zon, eftersom fel zon ger fel leverantörslista.

## Tekniskt

- Ny route `src/routes/_authenticated/leverantorer.tsx` plus komponenter under
  `src/components/leverantorer/`.
- Allt via befintlig Supabase-klient: `supplier_ranking`,
  `national_agreement_roles`, `national_agreement_quarters`, och
  `search_municipalities` för ort → zon. Ingen ny dependency, ingen SQL, inga
  hårdkodade siffror.
- Fel från databasen ger "Kunde inte hämta statistiken just nu." med möjlighet
  att försöka igen — aldrig en tom lista som ser ut som ett svar.
- Befintliga moduler och startsidan lämnas orörda.

## Innan jag börjar

Säg till när `schema.sql` och de tre CSV-filerna är körda mot databasen — jag
kan bygga sidan innan dess, men inte verifiera siffrorna.
