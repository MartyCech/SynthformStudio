# ADR-0004: Explicitní veřejný `dist/` artefakt pro deploy

**Date**: 2026-08-16  
**Status**: accepted  
**Deciders**: Martin Čech

## Context

Kořen repa obsahuje kromě veřejných stránek i věci, které na produkci nepatří: `node_modules/`,
konfigurace, `docs/`, `.agents/skills/`, zdrojové `css/input.css`, poznámky a pracovní soubory.
Nasazovat kořen repa a spoléhat na `.vercelignore` znamená, že každý nový pracovní soubor je
ve výchozím stavu veřejný a musí se ručně vyloučit — což je bezpečnostně opačně, než chceme.

## Decision

`npm run build` generuje adresář **`dist/`** pomocí `scripts/build-public.js`, který kopíruje
pouze soubory z explicitního **whitelistu**. Nasazuje se výhradně `dist/`; lokální server
(`npm run serve`) servíruje tentýž adresář, takže lokální běh odpovídá produkci.

`dist/` je v `.gitignore` — je to build artefakt, ne zdroj.

## Alternatives Considered

### Alternative 1: Deploy kořene repa s `.vercelignore`
- **Pros**: žádný build krok navíc
- **Cons**: blacklist je fail-open — nový soubor je veřejný, dokud si ho někdo nevšimne;
  lokální vývoj neodpovídá tomu, co je nasazené
- **Why not**: bezpečnostně špatný výchozí stav

### Alternative 2: Statický generátor (Eleventy, Astro)
- **Pros**: vyřeší kopírování i šablonování sdílených částí
- **Cons**: další framework a jeho konfigurace, v rozporu s ADR-0001
- **Why not**: potřebujeme kopírovat soubory, ne šablonovací engine

## Consequences

### Positive
- Fail-closed: co není ve whitelistu, na produkci se nedostane
- Lokální server i produkce servírují bit po bitu stejný obsah
- `dist/` je jediné místo, které kontroluje `check-csp.js` (ADR-0005)

### Negative
- Přidání nového veřejného adresáře vyžaduje úpravu `scripts/build-public.js`
- Nutnost buildu i pro čistě obsahovou změnu

### Risks
- Zapomenutý zápis do whitelistu se projeví jako 404 až po deployi. Mitigace: `npm run serve`
  běží nad `dist/`, takže se chyba projeví hned lokálně.
