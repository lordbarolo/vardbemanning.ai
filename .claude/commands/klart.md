---
description: Avsluta arbetspasset — committa och pusha till main
---

Avsluta arbetspasset, i exakt denna ordning:

1. Kör `git status` och sammanfatta kort vad som ändrats.
2. Om något under `supabase/migrations/` har ändrats eller tillkommit: visa hela
   SQL-diffen och invänta ägarens uttryckliga ja innan du fortsätter — en push
   kör migrationen direkt mot produktionsdatabasen via Supabase
   GitHub-integrationen. Tystnad är nej.
3. Kör `git pull --ff-only`. Vid divergens: stanna och rapportera, merga inte.
4. Stage:a och committa med ett beskrivande commitmeddelande på svenska som
   sammanfattar vad passet åstadkom (inte "Changes").
5. Kör `git push origin main`.
6. Bekräfta med den pushade commitens SHA.

Rör aldrig `src/**` eller `public/**` — de ägs av Lovable
(se docs/ANSVARSFORDELNING.md).
