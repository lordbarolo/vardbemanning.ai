export const privacyText = `# Integritetspolicy

*Gäller vardbemanning.ai och kopplingen "vårdbemanning.ai – löneanalys" för AI-assistenter. Senast ändrad 2026-10-21.*

**Personuppgiftsansvarig:** Piemonte Invest AB, org.nr 559264-3836. Kontakt: info@vardbemanning.ai.

## Vad tjänsten gör

Tjänsten svarar på vad en konsult inom vårdbemanning kan få i ersättning per timme för en yrkesroll i en kommun, utifrån SKR:s nationella hyrbemanningsavtal (RS 2022-03983) och en angiven branschmarginal. Den finns som webbsida och som koppling (MCP-server) som kan läggas till i AI-assistenter som Claude och ChatGPT.

## Vilka uppgifter vi behandlar

Tjänsten kräver inget konto och frågar inte efter namn, e-post eller andra uppgifter om dig.

När du gör ett uppslag sparar vi:

- vilken yrkesroll och kommun som slogs upp, som koder ur avtalets katalog, inte din fritext
- om svaret var entydigt, tvetydigt eller tomt
- tidpunkt och om uppslaget kom från webbsidan eller från en AI-koppling

Vi sparar inte IP-adress, användar-id eller det du skrev. För att begränsa missbruk räknar kopplingen antalet anrop per avsändare under tio minuter; räknaren använder en envägshash av IP-adressen som raderas inom ett dygn.

På webbsidan använder vi Google Analytics 4 och PostHog för besöksstatistik. PostHog körs utan kakor och utan sessionsinspelning; IP-adress sparas inte.

## Rättslig grund och ändamål

Behandlingen sker med stöd av berättigat intresse (artikel 6.1 f GDPR): att driva och förbättra tjänsten och förstå vilka roller och orter som efterfrågas. Uppgifterna kan inte knytas till en enskild person.

## Mottagare

Data lagras hos Supabase (EU, Stockholm). Besöksstatistik behandlas av Google respektive PostHog enligt deras villkor. När du använder kopplingen via en AI-assistent behandlar den leverantören (t.ex. Anthropic eller OpenAI) din konversation enligt sin egen policy; vi tar bara emot roll och kommun.

## Lagringstid

Uppslagsstatistik sparas i aggregerad form tills vidare. Räknaren för missbruk raderas inom ett dygn.

## Dina rättigheter

Eftersom vi inte sparar uppgifter som kan knytas till dig kan vi normalt inte hitta "dina" uppgifter. Du har ändå rätt att kontakta oss med frågor om behandlingen och att klaga hos Integritetsskyddsmyndigheten (imy.se).

## Vad svaren är och inte är

Beloppen är beräknade ur ett offentligt avtal och en angiven marginal. De är inte ett löfte om lön, inte lönestatistik och inte rådgivning. Kontrollera alltid villkoren med det bemanningsföretag du anlitar.

---`;

export const connectorText = `# Använd vårdbemanning.ai i din AI-assistent

Kopplingen ger din AI-assistent samma svar som webbsidan: vad en läkare, sjuksköterska eller barnmorska kan få i ersättning per timme i en viss kommun enligt SKR:s nationella hyrbemanningsavtal. Den är gratis, kräver ingen inloggning och läser bara.

## Adress

\`\`\`
https://zacslqpaqpzxmdyxwjll.supabase.co/functions/v1/mcp
\`\`\`

## Lägg till i Claude

1. Öppna Inställningar → Connectors (på Team/Enterprise: Organisationsinställningar → Connectors).
2. Välj "Add custom connector".
3. Klistra in adressen ovan. Välj "No sign-in" om du får frågan.
4. Slå på kopplingen i chatten via plusknappen → Connectors.

Fråga sedan till exempel: *"Vad kan en IVA-sjuksköterska få i Kiruna?"*

## Lägg till i ChatGPT

1. Öppna Inställningar → Appar och kopplingar och aktivera utvecklarläget.
2. Lägg till en MCP-server med adressen ovan, utan autentisering.
3. Aktivera kopplingen i konversationen.

Möjligheten att lägga till egna kopplingar i ChatGPT beror på kontotyp och region. Fungerar det inte i ditt konto går det alltid att använda webbsidan.

## Vad assistenten kan göra

| Verktyg | Svarar på |
|---|---|
| Slå upp ersättning | Regionens pris, zon, artikelnummer och ditt ersättningsspann som företagare respektive anställd för en roll i en kommun. |
| Sök yrkesroll | Vilken avtalsroll som motsvarar ett vardagsnamn, t.ex. "narkosläkare". |
| Sök kommun | Vilken kommun och zon en ort tillhör. |

## Så ska du läsa svaren

- **Regionens pris** är vad regionen betalar bemanningsföretaget per timme enligt avtalet.
- **Som företagare** är vad du kan fakturera bemanningsföretaget när det behåller sin marginal.
- **Som anställd** är din bruttolön per timme när bemanningsföretaget anställer dig; arbetsgivaravgift och tjänstepension är avdragna.
- **Spannet** kommer av att marginalen anges som ett intervall: läkare 10–15 %, sjuksköterskor 12–18 %. Var i spannet du hamnar avgörs av ditt avtal med bemanningsföretaget.
- Är rollen eller orten tvetydig får assistenten en lista att välja ur i stället för ett belopp. Landskap och sjukhus är inte kommuner.

Beloppen bygger på avtalets prislista (läkare v1.6, sjuksköterskor v1.7, giltiga 2026) och på inget annat. Ingen lönestatistik, inga uppskattningar.

## Begränsningar

60 uppslag per tio minuter och avsändare. Jourtillägg, beredskap och reseersättning ingår inte i version 1.

## Kontakt

info@vardbemanning.ai. Integritetspolicy: vardbemanning.ai/integritetspolicy.`;