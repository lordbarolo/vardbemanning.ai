# Supabase och GitHub

## Supabase
Projektet är redan kopplat till rätt Supabase-projekt (zacslqpaqpzxmdyxwjll, Stockholm). Inget ändras.

## Vilken gren pushas till i GitHub?
Det går inte att se härifrån. Synkad repo och gren visas under Projektinställningar → Git (eller +-menyn → Project → GitHub). Enligt projektets regler är repot `lordbarolo/vardbemanning.ai` och grenen `main`, men det bekräftas bara i den vyn.

## GitHub-koppling för appen
1. Öppna kopplingskortet för GitHub så att du kan välja eller skapa en anslutning och länka den till projektet.
2. Ingen kod byggs ännu – inga sidor, inga anrop. Nästa steg bestäms när du berättat vad appen ska göra med GitHub-datan.

## Tekniskt
- Kopplingen görs med standard_connectors--connect (connector_id `github`); nyckeln blir en servervariabel.
- Inget under `supabase/`, `data/`, `scripts/` eller `docs/` rörs. Ingen SQL, ingen migration.
- Ingen databasoptimering görs (valdes bort).
