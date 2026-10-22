export const privacyText = `# Integritetspolicy

Senast uppdaterad: juni 2026

## 1. Personuppgiftsansvarig

Vi är personuppgiftsansvariga för behandlingen av dina personuppgifter när du använder vårdbemanning.ai.

Kontakt: info@vardbemanning.ai

## 2. Vilka uppgifter vi samlar in

### 2.1 Löneenkäten

När du gör en analys på vårdbemanning.ai samlar vi in: yrkesroll (ev. specialisering), kommun/region, anställningsform (anställd/egenföretagare), aktuell timersättning eller månadslön, samt e-postadress för att leverera rapporten. Uppgifterna används för att beräkna din marknadsposition mot SKR:s ramavtalspriser.

### 2.2 Kontouppgifter

Om du skapar ett konto sparar vi e-postadress och (vid lösenordsinloggning) ett krypterat lösenord. Du kan även logga in via Google, då tar vi emot ditt namn och e-postadress från Google.

### 2.3 Tekniska uppgifter och analys

Vi använder PostHog (EU-baserat, eu.posthog.com) för anonym användarstatistik. PostHog är opt-out som standard och aktiveras först efter att du accepterat cookies. Data som samlas in inkluderar sidvisningar, klick och enhetsinformation. IP-adresser lagras inte i klartext och vi använder inte session recordings. Vi använder inte Google Analytics eller andra tredjepartsspårare för reklam.

### 2.4 Kupongkoder och kampanjer

Om du anländer via en kampanjlänk eller anger en kupongkod sparar vi vilken kod som använts kopplat till din rapport-ID.

## 3. Varför vi behandlar dina uppgifter

- Leverans av tjänsten: Skapa och visa din löneanalys. Rättslig grund: fullgörande av avtal (artikel 6.1b GDPR).
- Kontoadministration: Hantera inloggning och inställningar om du valt att skapa konto. Rättslig grund: fullgörande av avtal (artikel 6.1b GDPR).
- Kommunikation: Skicka transaktionsmeddelanden (rapportleverans, kontoaktivering, lösenordsåterställning) via e-post. Rättslig grund: fullgörande av avtal (artikel 6.1b GDPR).
- Förbättring av tjänsten: Anonymiserad användarstatistik via PostHog. Rättslig grund: samtycke (artikel 6.1a GDPR). Aktiveras först efter cookie-accept och kan när som helst återkallas.

## 4. Vilka vi delar uppgifter med

Vi delar uppgifter med följande tjänsteleverantörer, som agerar som personuppgiftsbiträden:

- Supabase (Lovable Cloud): Databas, autentisering och fillagring. Data lagras inom EU.
- PostHog: Anonym användaranalys på EU-instans (eu.posthog.com). Aktiveras först efter cookie-samtycke.
- Resend: E-postleverans för transaktionsmeddelanden.
- Google: Om du loggar in via Google delas autentiseringsuppgifter med Google enligt deras integritetspolicy.
- AI-leverantörer (via Lovable AI Gateway): När vi använder AI för att tolka eller berika analysen skickas enbart anonymiserad kontext (yrke, zon, marknadsdata) — inga personidentifierande uppgifter.

Vi säljer aldrig dina personuppgifter till tredje part.

## 5. Var lagras dina uppgifter

Alla uppgifter lagras inom EU/EES. Supabase och PostHog är konfigurerade med EU-baserade servrar.

## 6. Hur länge sparas uppgifterna

- Konto och profil: Sparas så länge du har ett aktivt konto. Du kan begära radering av ditt konto via kontaktadressen nedan, varpå alla personuppgifter raderas inom 30 dagar.
- Löneanalyser (rapporter): Sparas så länge ditt konto är aktivt, eller upp till 24 månader för anonyma analyser utan konto.
- Analysdata (PostHog): Anonymiserade sessionsdata sparas i 12 månader.
- E-postloggar: Sparas i 12 månader för felsökning och leveransuppföljning.

## 7. Dina rättigheter

Enligt GDPR har du rätt att:

- Få tillgång till dina uppgifter — begär en kopia av de uppgifter vi har om dig.
- Få uppgifter rättade — om något är felaktigt.
- Få uppgifter raderade — du kan radera ditt konto direkt i tjänsten, eller kontakta oss.
- Återkalla samtycke — du kan när som helst ändra ditt cookie-val.
- Invända mot behandling — baserat på berättigat intresse.
- Dataportabilitet — få dina uppgifter i ett maskinläsbart format.

Kontakta oss på info@vardbemanning.ai för att utöva dina rättigheter. Vi svarar inom 30 dagar. Du har även rätt att lämna klagomål till Integritetsskyddsmyndigheten (IMY), imy.se.

## 8. Cookies och spårning

vårdbemanning.ai visar en cookie-banner vid första besöket. Du väljer själv om analytiska cookies ska aktiveras. Ditt val sparas i webbläsarens localStorage.

- Nödvändiga: Autentiseringstokens (Supabase) för att hålla dig inloggad. Krävs för att tjänsten ska fungera och kräver inte samtycke.
- Funktionella: SessionStorage och localStorage för att spara enkätsvar, kupongkoder och temaval under ditt besök.
- Analys: PostHog använder localStorage för anonymt användar-ID. Aktiveras först efter att du accepterat cookies. Ingen personidentifierbar information lagras.

Vi använder inte Google Analytics, Facebook Pixel eller andra tredjepartsspårare för reklam.

## 9. Säkerhet

Vi vidtar lämpliga tekniska och organisatoriska åtgärder för att skydda dina personuppgifter, inklusive kryptering i transit (TLS), kryptering vid lagring för uppladdade dokument, och radnivåsäkerhet (RLS) i databasen som säkerställer att varje användare enbart kan se sina egna uppgifter.

## 10. Ändringar av denna policy

Vi kan uppdatera denna policy. Vid väsentliga ändringar publiceras den nya versionen här med uppdaterat datum.

## 11. Kontakt

Har du frågor om hur vi hanterar dina uppgifter?

E-post: info@vardbemanning.ai`;

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