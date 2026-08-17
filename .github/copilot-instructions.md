# Synthform Studio — Copilot Instructions

Tento soubor se načítá automaticky do každé konverzace. Drž ho krátký.
Je to **rozcestník**: říká, jak je web postavený a kde hledat důvody minulých rozhodnutí.

## Co to je

Statický prezentační web **Synthform Studio**. Důraz na vizuál: 3D/WebGL scény, scroll-driven
animace a interaktivní efekty. **Žádná databáze, žádný CMS, žádný backend.** Veškerý obsah
je přímo v HTML nebo ve statických JSON/JS souborech v repu.

## Jak je web postavený (architektura v kostce)

- **Stack:** statické HTML stránky + Tailwind CSS v3 (build přes CLI: `npm run build` → `css/styles.css`) + Vanilla JS (ES moduly). Žádný React/Next/Vue.
- **3D & efekty:** Three.js (WebGL) pro 3D scény a shadery, GSAP 3 + ScrollTrigger pro scroll-driven animace. Načítat jako ES moduly z lokálního `js/vendor/` (přes import map) — ne přes `<script>` z náhodného CDN, kvůli CSP a offline buildu.
- **Data:** žádná runtime databáze. Obsah = HTML + statické JSON v `data/`. Pokud přijde požadavek na dynamický obsah, řeš to build-time generováním, ne klientským fetchem do cizí služby (ADR-0002).
- **Build artefakt:** `npm run build` = Tailwind CLI → `scripts/build-public.js` (zkopíruje veřejné soubory do `dist/`) → `scripts/check-csp.js` (ověří inline hashe a CSP). **Deployuje se výhradně `dist/`**, nikdy kořen repa (ADR-0004).
- **Hosting:** Vercel, auto-deploy z větve `main`. Čistě statický output, žádné serverless funkce.
- **Bezpečnost:** přísná hashová CSP a bezpečnostní hlavičky ve `vercel.json`; build selže, pokud inline `<script>`/`<style>` nemá odpovídající sha256 hash v CSP (ADR-0005). Žádné inline `on*` handlery, žádné `javascript:` URL.
- **Výkon & přístupnost:** WebGL scény musí respektovat `prefers-reduced-motion` a mít statický fallback, když WebGL kontext není dostupný. Canvas nikdy nesmí blokovat čtení obsahu ani klávesovou navigaci.

## Zdroje pravdy — čti je podle potřeby

| Kde | Co tam je | Kdy do toho sáhnout |
|-----|-----------|---------------------|
| `docs/adr/` | **Zásadní architektonická rozhodnutí + důvody** (Context → Decision → Alternatives → Consequences). Index v `docs/adr/README.md`. | **Vždy než měníš související oblast** — zjisti, proč je to tak, jak to je. |
| `docs/adr/0000-project-brief.md` | Brief projektu: co web je, pro koho, jaký je vizuální záměr. | Když řešíš obsah, texty, vzhled sekcí. |
| `.agents/skills/` | Lokálně nainstalované agent skills (frontend design, UI animace, accessibility, Tailwind design system, SEO, audit webu, Vercel). **Neverzuje se v gitu** (ADR-0008). | Když potřebuješ hlubší doménovou znalost pro daný typ úkolu. |

## Pravidla pro práci s rozhodnutími (ADR)

1. **Před změnou** v oblasti, která může mít historický důvod (architektura, knihovny, hosting, build pipeline, klíčové UX/animační vzory), si **přečti relevantní ADR** v `docs/adr/`. Pokud existuje, respektuj jeho rozhodnutí nebo explicitně navrhni jeho nahrazení.
2. **Po zásadním rozhodnutí nebo změně** (nová knihovna, změna stacku, změna build pipeline, nový vzor) **založ nové ADR**:
   - zkopíruj `docs/adr/template.md` → `docs/adr/NNNN-kratky-nazev.md` (další pořadové číslo),
   - vyplň Context (proč), Decision (co), Alternatives (co se zvažovalo), Consequences (důsledky),
   - přidej řádek do tabulky v `docs/adr/README.md`.
3. ADR needituj zpětně kvůli změně obsahu rozhodnutí — místo toho dej starému status `superseded by ADR-NNNN` a vytvoř nové.
4. Drobné kosmetické změny (CSS doladění, copy) ADR nepotřebují.

## Konvence

- **Žádná databáze a žádný backend.** Návrhy typu „přidáme Supabase / API endpoint" nejdřív rozporuj — hledej statické řešení. Pokud je backend opravdu nutný, založ ADR.
- **Nepřidávat build frameworky.** Jediné build kroky jsou Tailwind CLI + skripty v `scripts/`.
- **Žádná tajemství v repu.** Případné klíče jen jako env proměnné ve Vercelu; `.env*` je v `.gitignore`.
- **Po každé změně HTML s inline scriptem/stylem** spusť `npm run build` — `check-csp.js` řekne, jaký hash chybí v `vercel.json`.
- **Vendorované 3D knihovny** patří do `js/vendor/` s pinnutou verzí v názvu souboru (např. `three.0.180.0.module.js`), aby cache i CSP byly deterministické.
- **Přidání nového veřejného souboru/adresáře** vyžaduje jeho zapsání do whitelistu v `scripts/build-public.js`, jinak se do `dist/` nedostane.
- Lokální vývoj: `npm run serve` (build + statický server na portu 3000 nad `dist/`), `npm run watch` pro Tailwind v režimu sledování.
