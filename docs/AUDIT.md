# Primary for Obsidian — audyt i modernizacja (zgodność z Obsidian 1.13+)

Raport z audytu forka motywu **Primary** i wykaz zmian wykonanych w ramach przygotowania
oficjalnego wydania zgodnego z Obsidian 1.13+ oraz bieżącą dokumentacją motywów.

## Streszczenie

Fork jest **dobrze utrzymany** i architektonicznie zgodny z dobrymi praktykami Obsidian
(`body` + `.theme-light` + `.theme-dark`, `color-scheme`, brak twardych kolorów poza paletą,
brak `@import`/zmiennych SCSS, minimalne `!important`, wsparcie a11y). Audyt wykrył kilka
realnych błędów oraz znaczący problem wydajnościowy (osadzone czcionki) i przerost panelu
Style Settings. Wszystkie naprawiono.

**Najważniejszy efekt:** `theme.css` **1.73 MB → 423 KB (−75%)**; Style Settings **518 → 273**
ustawień; panel teraz parsuje się w strict YAML (wcześniej nie).

## Werdykt zgodności z Obsidian 1.13+

Brak krytycznych niezgodności. Zweryfikowano programowo:

| Obszar | Status |
|---|---|
| `--blur-translucency-*` (przemianowane na `--blur-opacity-*` w 1.13) | ✅ nieużywane |
| CodeMirror | ✅ tylko CM6 (`cm-s-obsidian`), brak CM5 |
| Kolory callout (od 1.13 dowolny format) | ✅ trójki RGB — wstecznie kompatybilne |
| Mobile | ✅ `is-mobile` (×22) |
| Nowoczesny CSS | ✅ `:has()`, `:is()`, `@container`, `color-scheme` |
| A11y | ✅ `prefers-reduced-motion`, `forced-colors` |
| Brak zdalnych zasobów (wymóg dokumentacji) | ✅ |

## Zmiany wykonane w tym wydaniu

### Wydajność / rozmiar
- **Usunięto osadzone czcionki** `inter.css` (947 KB) i `cascadia-code.css` (263 KB) oraz ich
  konkatenację w `Gruntfile.js`. `Inter` jest fontem **wbudowanym w Obsidian**, więc bundlowanie
  było redundantne. Dla monospace dodano fallback:
  `--font-monospace-theme: 'Cascadia Code', var(--font-monospace-default, ui-monospace), monospace`.
- Dodano notę w Style Settings (Typography), że Cascadia Code jest opcjonalna do zainstalowania.

### Naprawione błędy
1. **Nieprawidłowy selektor CSS** `div:not(.list-bullet::after)` w `_typography.scss` (pseudo-element
   w `:not()` unieważniał całą regułę — font-features monospace nie działały na `code`/`pre`). Naprawiono.
2. **Duplikat ID** `link-unresolved-color` / `-hover` — sekcja „Non-markdown Links" dublowała
   „Unresolved Links" i sterowała tą samą zmienną. Usunięto redundantną sekcję (w Obsidian nie ma
   osobnej zmiennej „non-markdown link").
3. **Błędne tytuły** „Progress Color 1" ×4 → 1/2/3/4.
4. **Niezgodny YAML:** plik Style Settings używał tabulatorów we wcięciach (400 linii). YAML zabrania
   tabów w indentacji — oryginał **nie parsował się** w strict js-yaml. Znormalizowano całość do
   spacji; plik teraz parsuje się bezbłędnie. (Uwaga: plan zakładał „taby", ale jest to technicznie
   niepoprawne dla YAML — wybrano spacje, co realizuje intencję „spójne, parsujące się wcięcia".)
5. **21× zduplikowane ID** `readme-content` → unikalne (`readme-content-1..19` + opisowe ID dla nowych not).
6. **12 martwych zmiennych** `--font-*-size: ;` (nieużywane) — usunięto z palety.
7. **Sekcja „Advanced" = „Coming soon!"** — usunięto.
8. **README:** obrazy używały URL-i `/blob/main/` (nie renderują się) → zmieniono na ścieżki względne.

### Manifest
- `minAppVersion` `1.4.0` → **`1.13.0`**; dodano `authorUrl`; `version` `2.10.0` → **`26.6.0`**
  (CalVer `YY.M.PATCH` — konwencja maintainera dla każdego repo; zmiany łamiące: usunięte czcionki + przycięte Style Settings).

### Struktura repo
- Usunięto `assets/archive/` (5 PNG, ~10 MB śledzonych — m.in. hero 5.6 MB).
- `.editorconfig`: `end_of_line` `crlf` → `lf`.
- `release.yml`: `actions/checkout@v3` → `@v4`.

## Style Settings — co zostało, co wycięto

Zasada: każda opcja mapuje na zmienną CSS zdefiniowaną w palecie. **Wycięcie kontrolki z GUI nie
usuwa możliwości motywowania** — zmienna nadal istnieje i można ją nadpisać snippetem. Wycięto więc
nadmiarową granularność, nie tożsamość wizualną.

**Zachowano (esencja + sygnatura):** paleta kolorów, Emphasis (czerwony bold / niebieski italic),
Checkbox + 5 najczęstszych ikon checkboxów, Folder colors 1–6 (File Explorer + Bookmarks), Canvas,
Graph, Headings (size/font/weight/text-transform/color), kluczowe selektory Editor/Ribbon/Status Bar.

**Wycięto z GUI (≈247 opcji, nadal w palecie):** 4× kolor ramki per-bok nagłówków + border/bg/radius
(78), foldery 7–12 ×2 (72), ogon ikon checkboxów (21), kombinacje Highlight (8), wymiary/ramki/gradient
Progress (11), per-bok ramki i mikro-typografia Note Embed (25), granularne opcje Ribbon/Status Bar/Editor,
indenty linii prowadzących listy, skrajne wagi fontu, „Advanced".

## Czego BRAKUJE — propozycje na przyszłość
- Ekspozycja koloru akcentu (`--accent-h/s/l`) jednym suwakiem.
- Szybki wybór tła light/dark.
- Toggle stylu tagów/pigułek i properties.

## Checklist do RĘCZNEGO sprawdzenia przed wydaniem
- [ ] `npm install && npm run build` — wykonane; `theme.css` zregenerowany (**423 KB**), zacommitować.
- [ ] Panel **Style Settings** parsuje się w Obsidian (zweryfikowano strict js-yaml; potwierdzić w aplikacji).
- [ ] **`Inter`** rozwiązuje się do wbudowanego fontu Obsidiana (interfejs + tekst) bez bundla.
- [ ] **Monospace** wygląda sensownie BEZ zainstalowanej Cascadia Code (fallback).
- [ ] Naprawiony selektor → **font-features na `code`/`pre`** działają.
- [ ] **Unresolved Links** sterują właściwą zmienną po usunięciu duplikatu.
- [ ] Test: **light + dark**, **desktop + mobile**, **Live Preview + Reading + Source**.
- [ ] Sygnatura zachowana: czerwony bold, niebieski italic, autorskie checkboxy, kolorowe foldery, ciepła paleta.
- [ ] `manifest.json`: `minAppVersion 1.13.0`, `version` CalVer `26.6.0`, tag releasu = wersja (`v26.6.0`).
- [ ] **Screenshot 512×288** dołączony do submission; obrazy README renderują się na GitHub.
- [ ] Test instalacji „od zera" w czystym vaultcie (Manage → Themes).

Do weryfikacji w aplikacji pomocny skill **`obsidian:obsidian-cli`** (reload motywu, run JS, screenshot, DOM).

## Notatki techniczne
- **Walidacja YAML:** blok `@settings` można walidować: wyekstrahuj treść między `@settings` a `*/`
  i sparsuj `npx js-yaml`. Zalecane jako krok CI (wykrywanie duplikatów ID i błędów wcięć).
- **Podatności dev-dependencies:** `npm audit` zgłasza luki w łańcuchu Grunt (narzędzia build, **nie**
  trafiają do `theme.css`/użytkownika). Rozważyć migrację z Grunta na `sass` CLI + prosty skrypt concat,
  lub `npm audit fix`. Niekrytyczne dla wydania.

## Kierunki rozwoju
- Wiele palet/presetów (katalog `palettes/`, nazwa `classic-original` już to zakładają).
- Migracja kolorów na OKLCH (percepcyjna jednolitość; wspierane w bieżącym Obsidian).
- `stylelint` + walidator YAML Style Settings w CI.
- Rozdział Style Settings: „Essentials" (w motywie) + „Advanced presets" (opcjonalny import z Full Guide).
