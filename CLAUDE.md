# Arbetsregler för det här projektet

## Compcare är aldrig en källa

Stående order från projektägaren. Allt som byggs här bygger på projektets egna
uppgifter — avtalstexten, källfilerna i `data/source/`, och det ägaren själv
anger. Compcare och "Remix of Compcare" är inte referens för något: inte
schema, inte marginaler, inte beräkningar, inte namngivning, inte konventioner.

Det gäller även när Compcares variant ligger inom räckhåll och ser rimlig ut.
Hittar du en siffra eller en modell där och inte här, är svaret att fråga
ägaren — inte att låna. Undantag finns bara när ägaren uttryckligen pekar ut
något och säger att det ska hämtas därifrån.

Det som redan är överfört och godkänt: startsidans design (`src/styles.css`,
`src/routes/index.tsx`) och de fyra SQL-filerna i Lovable-projektet, som ligger
kvar men aldrig ska härledas ifrån. Se `docs/ANSVARSFORDELNING.md`.

## Radera aldrig något i Lovable utan explicit godkännande

Stående order från projektägaren. Den gäller alltid, i varje session, oavsett
hur uppenbart överflödigt något ser ut.

Innan något tas bort i Lovable-projektet `Vårdbemanning AI Assistant`
(`701dd6d0-5d82-48a3-aca9-08a3ce4b13b1`):

1. **Namnge exakt vad** som ska bort i chatten — fullständiga sökvägar, en
   rad per objekt. Inte "de gamla filerna", inte "resterna".
2. **Vänta på ett uttryckligt ja.** Tystnad är nej. Ett svar om något annat är
   nej. Ett tidigare godkännande av en liknande borttagning är nej.
3. Först därefter skickas instruktionen till Lovable.

Det gäller filer, kataloger, routes, komponenter, beroenden, knowledge-innehåll
och allt annat som försvinner. Det gäller också indirekt borttagning: att be
Lovables agent "städa upp", "ta bort oanvänt" eller "refaktorera bort" något är
samma sak som att radera det.

Bakgrunden: projektägaren har handplockat vad som förts över från andra projekt
och kontrollerat att inget annat följde med. Det som ser ut som en kvarleva är
sannolikt ett medvetet val.

Samma försiktighet gäller databasen — inga `drop`, inga raderade rader, inga
borttagna buckets eller projekt utan att först namnge dem och få ja.

## Var sakerna hör hemma

- `README.md` — vad backenden är och hur datan byggs om
- `docs/ANSVARSFORDELNING.md` — vem äger vad mellan Lovable och den här agenten
- `docs/lovable-project-knowledge.md` — samma text, installerad som Project
  Knowledge i Lovable. Ändra i `ANSVARSFORDELNING.md` först, generera om, och
  installera om i Lovable.
- `data/KALLOR.md` — vilka källdokument datan kommer ur

Frontend och backend delar repo. Sökvägsuppdelningen står i
`docs/ANSVARSFORDELNING.md` och är bindande åt båda håll: den här agenten rör
inte `src/**`, `public/**` eller byggkonfigurationen.

## Git-rutin (obligatorisk)

- Vid sessionsstart körs `git pull --ff-only` automatiskt via SessionStart-hooken
  i `.claude/settings.json`. Misslyckas den (divergens eller nätverk): lös det
  innan något annat görs — börja aldrig arbeta i en osynkad arbetskopia.
- Avsluta varje arbetspass med kommandot `/klart` (committa + pusha).
  Lämna aldrig ett pass med ocommittade ändringar.
- En push till `main` deployar `supabase/migrations/**` direkt mot
  produktionsdatabasen via Supabase GitHub-integration. Visa därför alltid
  migrations-SQL för ägaren och invänta ja innan push.
- Backend-README ligger i `docs/BACKEND.md`; rotens `README.md` ägs av Lovable
  sedan repona slogs ihop.
