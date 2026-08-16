# ADR-0007: GitHub Pages jako testovací prostředí a relativní cesty k assetům

**Date**: 2026-08-16
**Status**: accepted
**Deciders**: Martin Čech

## Context

Produkční hosting je Vercel (ADR-0001). Před ostrým nasazením ale chybělo veřejně dostupné
testovací prostředí pro sdílení rozpracovaného webu. První pokus s GitHub Pages selhal ze dvou
důvodů:

1. Pages servírovaly kořen větve `main`, kde `dist/` ani `css/styles.css` neexistují — oba jsou
   v `.gitignore` a vznikají až buildem (ADR-0004).
2. Project Pages běží na podcestě `https://<user>.github.io/SynthformStudio/`, ale všechny
   cesty v HTML byly absolutní (`/css/styles.css`), takže se rozpadly na kořen domény.

Výsledkem bylo neostylované HTML bez JS. Zároveň platí, že hlavičky ve `vercel.json` (včetně
hashové CSP dle ADR-0005) se na GitHub Pages neuplatní — statické Pages hlavičky nastavovat neumí.

## Decision

GitHub Pages jsou **testovací/preview prostředí**, produkce zůstává Vercel. Build a deploy
zajišťuje GitHub Actions workflow `.github/workflows/deploy-pages.yml`, který spouští
`npm run build` a publikuje výhradně adresář `dist/` (ADR-0004 zůstává v platnosti).
Všechny cesty k assetům v HTML jsou **relativní** (`css/…`, `js/…`, `img/…`, `fonts/…`),
takže stejný artefakt funguje na kořeni domény i na podcestě.

## Alternatives Considered

### Alternative 1: Commitovat `dist/` do repa nebo do větve `gh-pages`
- **Pros**: Bez CI, Pages umí servírovat přímo z větve.
- **Cons**: Build artefakt v gitu, riziko rozjetí zdroje a výstupu, šum v diffech.
- **Why not**: Odporuje ADR-0004 — `dist/` je odvozený artefakt, ne zdroj pravdy.

### Alternative 2: Ponechat absolutní cesty a připojit k Pages vlastní doménu
- **Pros**: Žádný zásah do HTML, absolutní cesty by fungovaly.
- **Cons**: Testovací prostředí by potřebovalo vlastní doménu a DNS správu navíc.
- **Why not**: Neúměrná režie pro dočasné preview prostředí.

### Alternative 3: Build-time přepis cest podle cílového prostředí
- **Pros**: Zachovalo by absolutní cesty na Vercelu.
- **Cons**: Další transformační krok v pipeline, dva různé artefakty, těžší ladění.
- **Why not**: Relativní cesty řeší totéž bez nové logiky v buildu.

## Consequences

### Positive
- Na Pages se dostane přesně ten artefakt, který se ověřuje `check-csp.js`.
- Jeden build funguje na Vercelu i na podcestě Pages bez konfigurace prostředí.
- Sdílení rozpracovaného stavu bez zásahu do produkce.

### Negative
- `404.html` je na Pages i Vercelu stylovaná správně jen do jedné úrovně zanoření; při
  hlubší neexistující cestě se relativní odkazy nerozřeší. Web je plochý, takže dopad je okrajový.
- Testovací prostředí běží bez CSP a bezpečnostních hlaviček — nelze na něm ověřovat ADR-0005.

### Risks
- Pages je nutné v nastavení repa přepnout na source **GitHub Actions**; jinak se workflow
  provede, ale publikuje se dál kořen větve. Ověřuje se pohledem na deploy v záložce Actions.
- Testovací URL může být zaindexovaná. Mitigace: přidat na Pages `robots.txt` s `Disallow: /`,
  jakmile bude prostředí sdíleno mimo tým.
