# Assistenten: "Jag vill ta uppdrag i Hälsingland vecka 40–44"

Målbilden är en assistent i appen som tar en fritextfråga och svarar med
ersättning, leverantörer och avtalsrisker. Nedan står vad som faktiskt finns i
projektet idag och vad som saknas.

(En notis om namnet: du skriver "Compcare", men det här projektet är
Vårdbemanning.ai. Jag bygger det här, i den här appen.)

## Vad vi redan har

- **Priser per roll och ort.** Avtalsdatan (RS 2022-03983) ligger i databasen:
  88 roller, 290 kommuner, 3 zoner, giltig 2026-01-01–2026-12-31.
- **Sökning i fritext.** Funktioner som tolkar "Ögonläkare" och "Torsby" och
  säger om träffen var exakt eller gissad.
- **Ersättningsberäkning.** Ett anrop ger regionpris, ersättning för företagare
  respektive anställd, plus marginalerna och avgifterna beräkningen vilar på.
- **Inloggning och profiler**, samt startsidans sökformulär som redan använder
  allt ovan.

## Vad som saknas

| Del av frågan | Status |
|---|---|
| "Hälsingland vecka 40–44" | Delvis. Region och kommun är sökbara; landskap och städer som inte är kommuner ska inte bli sökbara — chatten ber i stället användaren ange kommun. Veckonummer tolkas inte ännu. |
| Vilka bemanningsföretag har avtal med regionen | **Saknas helt.** Ingen leverantörsdata finns i projektet. |
| Vilka leverantörer är historiskt starka på rollen/sjukhuset | **Saknas helt.** Ingen uppdragshistorik, inga sjukhus. |
| Ersättning om företaget behåller 10 % | Delvis. Priset finns; men dagens beräkning använder avtalets marginalantaganden, inte en marginal du själv ställer in. |
| Risker i ramavtalet som förs över på konsulten | **Saknas helt.** Inga avtalstexter eller riskanalyser finns lagrade. |
| Själva assistenten (chatt) | Saknas. Appen har bara ett sökformulär. |

## Förslag: bygg i tre steg

### Steg 1 — assistenten, på den data vi har (kan byggas nu)

En chattsida där du skriver fritt och assistenten svarar. Den får tillgång till
den befintliga prisdatan som verktyg och kan:

- tolka roll och ort ur din text och hämta rätt pris,
- räkna på valfri marginal, t.ex. "företaget behåller 10 %", och visa hur
  summan är uppbyggd,
- säga tydligt när en ortsträff är osäker och be dig välja, i stället för att
  gissa ett belopp,
- säga rakt ut när något den frågas om inte finns i underlaget (leverantörer,
  historik, avtalsrisker) i stället för att hitta på.

Chatten sparas per konversation så du kan gå tillbaka till en tidigare fråga.

### Steg 2 — geografi och tid

Landskap och sjukhus → kommun, samt veckonummer → datumintervall, så att
"Hälsingland vecka 40–44" kan besvaras. Kräver ny data från backend-ägaren.

### Steg 3 — leverantörer, historik och avtalsrisker

Leverantörsregister per region, uppdragshistorik per roll och sjukhus, samt
lagrade ramavtalsvillkor med riskbedömning. Allt detta är nytt underlag som
måste tas fram och kvalitetssäkras innan assistenten får svara på det.

## Backendändring behövs (steg 2 och 3)

**Vad jag försöker bygga:** en assistent som kan svara på geografi, tid,
leverantörer, historik och avtalsrisk.

**Vad som saknas:** landskap→kommun, sjukhus→kommun, leverantörer per region
och roll, uppdragshistorik, ramavtalsvillkor med risknivå.

**Föreslagen form:** referenstabeller för landskap och sjukhus kopplade till
`municipality_code`; leverantörstabell kopplad till region och roll;
historiktabell per uppdrag; en tabell för avtalsvillkor och risk per
leverantör.

**Läsa/skriva:** läsning för inloggade, skrivning enbart via migrations.

Det här skickar du vidare till backend-agenten — jag bygger inget av det själv.

## Tekniskt (steg 1)

- Chattyta i appen med streamande svar, byggd på Lovable AI.
- Modellen får verktyg som anropar de befintliga databasfunktionerna
  (`resolve_roles`, `resolve_municipalities`, `hero_compensation`) — inga priser
  hårdkodas eller cachas, och inga siffror räknas fram utan spårbarhet till
  avtalsdatan.
- Marginalen är en parameter i verktyget; assistenten visar alltid vilken
  marginal, sociala avgifter och pension ett belopp vilar på.
- Osäker namnträff (`match_kind` ≠ `exact`) märks i svaret eller leder till en
  följdfråga — aldrig ett belopp som ser bekräftat ut.
- Ingen skrivning mot referensdata, ingen SQL, ingen Lovable Cloud.

## Att bestämma innan steg 1 byggs

- Ska konversationer sparas i databasen (kräver en backendändring) eller bara i
  din webbläsare tills vidare?
