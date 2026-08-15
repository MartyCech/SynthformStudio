# ADR-0001: Statický HTML web s Tailwindem, GSAP a Three.js

**Date**: 2026-08-16  
**Status**: accepted  
**Deciders**: Martin Čech

## Context

Web (viz ADR-0000) je vizuálně náročná statická prezentace: 3D hero scéna, scroll-driven
animace, interaktivní efekty. Potřebujeme stack, který umožní plnou kontrolu nad renderovací
smyčkou a časováním animací, a přitom nezavádí runtime framework, který by soutěžil
o výkonový rozpočet s WebGL.

## Decision

Stack je: **ruční HTML stránky + Tailwind CSS v3 (build přes CLI) + Vanilla JS v ES modulech**,
s **Three.js** pro WebGL a **GSAP 3 + ScrollTrigger** pro animace. Three.js a GSAP se
vendorují do `js/vendor/` s verzí v názvu souboru a načítají přes import map.

## Alternatives Considered

### Alternative 1: React Three Fiber (React + Next)
- **Pros**: deklarativní scény, velký ekosystém helperů (drei)
- **Cons**: React runtime + rekonciliace navíc, těžší ladění výkonu render loopu
- **Why not**: pro web o několika stránkách je runtime cena neúměrná přínosu

### Alternative 2: Čisté CSS animace bez GSAP
- **Pros**: nulová JS závislost
- **Cons**: scroll-driven timeline, pinning a orchestrace sekvencí jsou v CSS bolestivé
  a napříč prohlížeči nekonzistentní
- **Why not**: ScrollTrigger řeší přesně to, co je jádrem zážitku na tomto webu

### Alternative 3: Načítání Three.js a GSAP z veřejného CDN
- **Pros**: nulová správa souborů, sdílená cache
- **Cons**: rozšiřuje CSP o cizí origin, build a lokální vývoj přestanou fungovat offline,
  riziko výpadku nebo změny obsahu na cizím původu
- **Why not**: deterministický build a přísná CSP (ADR-0005) mají přednost

## Consequences

### Positive
- Plná kontrola nad render loopem a pořadím animací
- Malý a předvídatelný JS payload; Tailwind produkuje jediný purge-nutý CSS soubor
- Verze knihoven jsou pinnuté v repu, build je reprodukovatelný a funguje offline

### Negative
- Sdílené kusy markupu (hlavička, patička) nemají komponentový model — řeší se JS
  injektáží nebo build skriptem
- Upgrade Three.js/GSAP je ruční krok (výměna souboru ve `js/vendor/`)

### Risks
- Ruční injektáž sdílených prvků může způsobit race condition s animacemi, které na ně
  cílí. Mitigace: prvek renderovat co nejdříve a animace vždy chránit guardem na existenci
  cílového elementu.
