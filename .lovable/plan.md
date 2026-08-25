# Färgjustering av LonekollenHero för Deep Space-temat

## Bakgrund

`src/components/LonekollenHero.tsx` har en egen, hårdkodad färgpalett som idag är ljus och cyan/turkos:

| Token | Nuvarande värde | Känsla |
|---|---|---|
| `BG` | `#F4FAFB` | Ljus, kall cyanvit |
| `INK` | `#07333D` | Mörk teal |
| `DIM` | `#5C7F86` | Dämpad tealgrå |
| `LINE` | `#DCEBEE` | Ljus kantlinje |
| `accent` | `#00D2E6` | Kall cyan |

Startsidan (`src/styles.css`) använder Deep Space — mörkt tema med violett/rosa glow:

| Token | Värde | Känsla |
|---|---|---|
| `--background` | `hsl(260 60% 4%)` | Nästan svart, kall lila underton |
| `--foreground` | `hsl(250 30% 96%)` | Varmt vitt |
| `--primary` | `hsl(256 100% 67%)` | Violett |
| `--accent` | `hsl(320 95% 65%)` | Rosa/magenta |
| `--border` | `hsl(260 30% 18%)` | Mörk lila kant |
| `--muted-foreground` | `hsl(250 15% 70%)` | Dämpad lila-grå |

Resultatet är att animeringen ser ut att komma från en annan sajt när den visas på startsidan.

## Mål

Gör `LonekollenHero` visuellt sammanhängande med resten av startsidan utan att ändra animationens tidslinje, rörelser eller innehåll.

## Föreslagna justeringar

### 1. Bakgrund och atmosfär
- Ändra `BG` från `#F4FAFB` till startsidans mörka bakgrund (`hsl(260 60% 4%)` / ca `#080514`).
- Ersätt de cyan radiala gradienterna med violett/rosa glow som matchar hero-sektionen.
- Behåll subtila rörelser (wob) men tonade till mörkare, mjukare färger.

### 2. Textfärger
- `INK` → `--foreground` (vitt/ljust) för rubriker och huvudsaklig text.
- `DIM` → `--muted-foreground` för sekundär text som "regionpris", etiketter och källhänvisning.
- Behåll tillräcklig kontrast mot mörk bakgrund (minst 4.5:1).

### 3. Kort, knappar och UI-element
- Vita kort (`#FFFFFF`) blir mörka kort med `--card` (ca `#151022`) eller en något ljusare mörk ton för att skilja sig från bakgrunden.
- Kantlinjer (`LINE`) använder `--border` (ca `#2D2454`).
- Valda chips och markerade zoner använder `--primary` eller `--accent` i stället för cyan.
- Skuggor justeras till mörka, färgade glows (t.ex. `0 20px 46px hsl(256 100% 67% / 0.25)`).

### 4. Accentfärg
- Ersätt cyanaccenten (`#00D2E6`) med `--primary` (violett) för huvudmarkeringar.
- Använd `--accent` (rosa) sparsamt för "HÖGST ERSÄTTNING"-badge och liknande framhävningar, så att animationen får samma färgaccent som heroformuläret.

### 5. Progress bars och diagram
- Företagarens bar: `--primary` (violett).
- Regionpris-bar: en dämpad sekundär ton, t.ex. `--muted` eller `--secondary`, så att den syns men inte tävlar.

### 6. Genomförande
- Eftersom komponenten är självständig och hårdkodad, byts färgvärdena ut mot CSS-variabler eller konstanter som speglar Deep Space-paletten.
- Ingen ändring av animationstidslinje, timing, easing eller layout.
- Verifiering sker genom att jämföra animeringen visuellt med heroformuläret och övriga startsidan.

## Uteslutet

- Ingen ändring av innehåll, text eller animationens rörelser.
- Ingen omskrivning till Motion eller andra bibliotek.
- Ingen påverkan på backend, data eller prisberäkning.
