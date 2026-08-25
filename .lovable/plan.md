# Animeringen som övergång: mörk hero → ljusare sektioner

## Idén

Animeringen ska inte välja sida. I stället blir den själva bryggan: den börjar i heros mörka Deep Space-rymd och landar i det ljusa, lugnare läge som sektionerna under kommer att ha. Tittaren märker aldrig var mörkret slutade — bara att sidan har öppnat sig.

Två saker rör sig samtidigt:

1. **Sektionen** går uppifrån mörk till ljus i sin egen bakgrund (rumslig övergång).
2. **Animationen** startar mörk i sina första scener och ljusnar under tidslinjen (tidsmässig övergång).

Tillsammans ger de en känsla av gryning snarare än en hård kant mellan två teman.

## Så byggs den rumsliga övergången

Animeringen ligger i en sektion vars bakgrund är en vertikal gradient:

```text
   hero slut     ┌───────────────────────┐  hsl(260 60% 4%)   mörk, samma som hero
                 │                       │
                 │      ANIMERINGEN      │  hsl(258 40% 12%)  glöd tonar ut
                 │                       │  hsl(250 25% 40%)  vändpunkt
                 │                       │
   nästa sektion └───────────────────────┘  ljus botten
```

- Toppen matchar hero exakt, så skarven försvinner.
- Mitten är där violett/rosa glow lever kvar men försvagas.
- Botten möter det ljusa temat som kommande sektioner får.
- Ett mjukt övergångsfält (feather) i över- och underkant hindrar synliga band.
- Animeringens egen bakgrund blir transparent så att sektionens gradient syns igenom.

Ett nytt ljust tema-värde behöver definieras i `src/styles.css` som mål för botten, eftersom projektet i dag bara har Deep Space. Det blir också referensen för de kommande ljusa sektionerna.

## Så byggs den tidsmässiga övergången

Animeringens 17 sekunder följer samma resa. Färgerna interpoleras med samma `interpolate`-funktion som redan driver kamera och rörelse — ingen ny teknik krävs.

| Scen | Läge | Vad tittaren ser |
|---|---|---|
| Öppning | Mörkt | Rubriken lyser mot rymdsvart, violett glow bakom |
| Roll | Mörkt | Chips är mörka kort med violett kant, vald chip glöder |
| Zon | Skiftar | Bakgrunden börjar ljusna, korten tar upp mer ljus |
| Belopp | Halvljust | Resultatkortet är ljust mot dämpad bakgrund — beloppet får full läsbarhet |
| Notis | Ljust | Sista scenen ligger nära det ljusa temat och pekar nedåt i sidan |

Praktiskt innebär det att `BG`, `INK`, `DIM`, `LINE` och kortens fyllning blir funktioner av tiden i stället för konstanter. Accentfärgen håller sig till projektets `--primary` (violett) hela vägen, med `--accent` (rosa) sparsamt på "HÖGST ERSÄTTNING", så att identiteten består även när ljusheten ändras.

## Läsbarhet genom hela resan

Eftersom bakgrunden rör sig måste texten röra sig med den:

- Textfärgen interpoleras i takt med bakgrunden — ljus text i mörka scener, mörk text i ljusa.
- Kontrasten hålls över 4.5:1 i varje bildruta, inte bara i ändlägena.
- Kortens fyllning och kantlinjer följer samma kurva så att ingenting tappar sin form mitt i övergången.
- Skuggor byter karaktär: färgad glow när det är mörkt, mjuk neutral skugga när det är ljust.

## Vad som inte ändras

- Tidslinje, scenlängder, easing och kamerarörelser är orörda.
- Ingen text, inget innehåll och inga siffror ändras.
- Inget nytt bibliotek införs.
- Ingen påverkan på data, priser eller backend.

## Verifiering

- Titta på skarven mellan hero och animeringen — den ska inte gå att se.
- Spela igenom hela loopen och kontrollera att ingen bildruta har svag kontrast.
- Kontrollera på mobil och desktop att gradienten inte bryts av sektionens höjdskillnad.

## En fråga innan bygget

Sektionerna under animeringen finns inte ännu. Jag föreslår att jag definierar det ljusa temat nu, som animeringens landningspunkt, och att kommande sektioner byggs mot det. Om du hellre vill bestämma det ljusa temat först säger du bara till, så inväntar jag det.
