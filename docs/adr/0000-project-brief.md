# ADR-0000: Project Brief — Synthform Studio

**Date**: 2026-08-16  
**Status**: accepted  
**Deciders**: Martin Čech

## Context

Synthform Studio je nový prezentační web. Cílem je vizuálně výrazná statická prezentace
postavená na 3D/WebGL scénách, scroll-driven animacích a interaktivních efektech.
Web nemá uživatelské účty, nemá redakční systém a obsah se mění zřídka, ruční editací v repu.
Tento záznam slouží jako výchozí kontext pro všechna další ADR.

## Decision

Web je **statická HTML prezentace bez backendu**, jejíž hlavní hodnotou je vizuální
zpracování (WebGL / motion design). Obsah se verzuje v repu; nasazuje se předgenerovaný
adresář `dist/`.

Základní parametry:

- **Cíl:** portfolio / studio prezentace s důrazem na vizuální dojem a plynulost.
- **Obsah:** statický, přímo v HTML nebo ve statických JSON souborech v `data/`.
- **Klíčové vlastnosti:** 3D hero scéna (Three.js), scroll-driven animace (GSAP ScrollTrigger),
  interaktivní hover efekty, tmavý vizuální styl.
- **Nefunkční požadavky:** rychlé první vykreslení, plynulé animace na běžném notebooku,
  respekt k `prefers-reduced-motion`, přístupný obsah i bez WebGL.

## Alternatives Considered

### Alternative 1: Headless CMS + statický generátor
- **Pros**: pohodlná editace obsahu bez zásahu do kódu
- **Cons**: další služba, další build závislost, náklady, vendor lock-in
- **Why not**: obsah se mění zřídka a jediným editorem je autor webu

### Alternative 2: SPA framework (React/Next)
- **Pros**: komponenty, ekosystém, snadné sdílení stavu
- **Cons**: velký JS bundle a hydratace navíc u webu, který je fakticky několik stránek
- **Why not**: náklad na runtime a build složitost neodpovídá rozsahu projektu

## Consequences

### Positive
- Minimální počet pohyblivých částí, žádné provozní náklady kromě hostingu
- Výkonový rozpočet zůstává celý pro 3D a animace, ne pro framework

### Negative
- Obsahové změny vyžadují commit a deploy
- Sdílené prvky (hlavička, patička) je nutné držet konzistentní ručně nebo přes build skript

### Risks
- Rozrůstání obsahu může časem statický přístup přerůst — pak se založí nové ADR,
  které toto nahradí build-time generováním stránek ze `data/`.
