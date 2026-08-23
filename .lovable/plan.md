# Implementera hero från bifogat paket

## Mål
Bygg om endast startsidans hero enligt `heropaket.zip`, anpassad till Vårdbemanning.ai och projektets befintliga komponenter. Innehållet under hero-sektionen lämnas oförändrat.

## Genomförande
- Skapa en avgränsad hero-komponent baserad på paketets tvåkolumnslayout.
- Återskapa paketets mörka spotlight, gradientkantade badge, rubrik, ingress, vit CTA och diskreta entréanimationer.
- Behåll Vårdbemanning.ai:s befintliga ersättningspanel som innehåll i hero:ns högerkolumn; ingen ny data- eller backendlogik införs.
- Använd projektets `Button`, `Logo`, semantiska färgtokens och tillgängliga Lucide-ikoner i stället för fristående hårdkodade kontroller.
- Lägg till Space Grotesk via sidans befintliga head-konfiguration eftersom det är paketets angivna displaytypsnitt.
- Säkerställ att hero:n staplas naturligt på mobil och blir tvåkolumnig på större skärmar.

## Verifiering
- Kontrollera hero:n visuellt i live-preview på mobil och desktop.
- Kontrollera att CTA/badge, logotyp och ersättningspanel inte överlappar eller skapar layoutskift.
- Kontrollera senaste byggstatus och runtime-fel innan leverans.

## Avgränsning
Ingen Lönekollen-animation, datakoppling, backendändring eller ombyggnad av sektionerna under hero:n ingår nu.
