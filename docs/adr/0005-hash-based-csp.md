# ADR-0005: Hashová Content-Security-Policy ověřovaná při buildu

**Date**: 2026-08-16  
**Status**: accepted  
**Deciders**: Martin Čech

## Context

Web je statický, ale obsahuje inline `<script>` a `<style>` bloky (early theme/nav bootstrap,
kritické CSS, import mapy pro Three.js). Nejjednodušší CSP by je povolila přes
`'unsafe-inline'`, což ale CSP v podstatě vypne jako ochranu proti XSS. Zároveň se hashe při
každé editaci inline bloku mění, takže ručně udržovaná CSP se nevyhnutelně rozejde s realitou
a stránka se tiše rozbije až na produkci.

## Decision

CSP v `vercel.json` je **hashová**: `script-src` a `style-src-elem` vyjmenovávají sha256 hashe
konkrétních inline bloků, `script-src-attr` je `'none'`. Build spouští
`scripts/check-csp.js`, který projde všechny HTML soubory v `dist/` a **selže**, pokud:

- inline `<script>` nebo `<style>` nemá odpovídající hash v CSP,
- CSP obsahuje `'unsafe-inline'` ve `script-src`,
- v markupu je inline `on*` handler nebo `javascript:` / `data:text/html` URL.

Chybějící hash skript vypíše, takže se jen zkopíruje do `vercel.json`.

## Alternatives Considered

### Alternative 1: `'unsafe-inline'` ve `script-src`
- **Pros**: nulová údržba
- **Cons**: ruší hlavní přínos CSP
- **Why not**: cena za pohodlí je celá ochrana proti injektáži

### Alternative 2: Nonce místo hashů
- **Pros**: hash se nemusí přepočítávat při každé editaci
- **Cons**: nonce vyžaduje generování per-request, tedy nestatický response
- **Why not**: web je čistě statický, nonce není kam vygenerovat

### Alternative 3: Všechny inline bloky přesunout do externích souborů
- **Pros**: CSP se zjednoduší na `'self'`
- **Cons**: bootstrap kód, který musí běžet před vykreslením (theme, nav), by způsobil
  blikání; import mapa musí být inline
- **Why not**: část inline kódu je z principu nepřesunutelná

## Consequences

### Positive
- Skutečná ochrana proti injektáži skriptu, ne jen deklarativní hlavička
- Rozejití CSP s markupem se odhalí při buildu, ne na produkci
- Zákaz inline handlerů drží kód konzistentně na `addEventListener`

### Negative
- Každá editace inline bloku znamená aktualizaci hashe ve `vercel.json`
- Přidání nové externí domény (fonty, video, analytika) vyžaduje vědomý zásah do CSP

### Risks
- Frustrace z opakované aktualizace hashů může svádět k `'unsafe-inline'`. Mitigace:
  `check-csp.js` na `'unsafe-inline'` explicitně selže.
