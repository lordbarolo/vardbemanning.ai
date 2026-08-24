# En källa till sanning — och en tyst fallback

Målet: databasen (`zacslqpaqpzxmdyxwjll` via RPC) förblir enda källan för roller, kommuner, zoner, priser och ersättningsberäkning. Om den är otillgänglig visar appen ett tydligt fel-läge med möjlighet att försöka igen — aldrig ett belopp från någon annan källa.

## Princip för fallbacken

En fallback som gissar ett pris skapar exakt det brus du vill undvika: en siffra utan spårbarhet som kan citeras vidare. Därför gäller:

- Ingen cachad, hårdkodad eller lokal prislista. Inga "ungefärliga" belopp.
- Vid fel visas inga siffror alls — platshållaren `—` står kvar.
- Ett tydligt meddelande: "Prisdatabasen svarar inte just nu. Inga belopp visas eftersom de alltid ska komma från avtalsdatan." plus en "Försök igen"-knapp.
- Autocomplete som misslyckas visar "Kunde inte hämta förslag" i stället för tom lista, så att tomt aldrig läses som "rollen finns inte".
- Sista lyckade träffen får ligga kvar visuellt endast om den märks med tidpunkt och en notis om att den inte uppdaterats — annars rensas den. (Standard: rensa.)

## Vad som byggs

1. **Låst källa.** En kort kommentar överst i `src/lib/compensation.ts` som slår fast att modulen är enda datavägen, och att prisdata aldrig får hårdkodas eller cachas i klienten. Ingen ny abstraktion, ingen ny klient.
2. **Feltyper.** `compensation.ts` skiljer på "inget resultat" (giltigt svar, ingen träff) och "källan är otillgänglig" (nätverksfel/RPC-fel), så UI kan behandla dem olika i stället för att visa samma text.
3. **Fel-läge i `SearchPanel`.** Egen ruta vid otillgänglig källa: meddelande + "Försök igen" som kör om anropet. Beloppsfälten visar `—`, aldrig ett gammalt värde.
4. **Robustare autocomplete.** Fel i `search_roles` / `search_municipalities` ger en synlig rad "Kunde inte hämta förslag — försök igen" i listan.
5. **Ett försök till omtag.** Ett automatiskt retry efter kort fördröjning vid nätverksfel, sedan manuellt. Inga upprepade anrop i loop.

## Tekniska detaljer

- Ändringar endast i `src/lib/compensation.ts` och `src/components/home/SearchPanel.tsx`.
- `compensation.ts` returnerar `{ status: 'ok' | 'empty' | 'unavailable', data, message }` i stället för att kasta råa fel; `formatSek` orörd.
- Ingen ny dependency, ingen localStorage, ingen server function, inget nytt backendbehov.
- Osäkra träffar (`match_kind` ≠ `exact`) fortsätter märkas som idag — den logiken rörs inte.
