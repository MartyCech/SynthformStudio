# ADR-0006: Agent skills verzované v repu

**Date**: 2026-08-16  
**Status**: superseded by ADR-0008  
**Deciders**: Martin Čech

## Context

Práce na webu se opírá o AI agenta. Kvalita výstupu výrazně závisí na tom, jestli má agent
k dispozici doménové znalosti (frontend design, motion, přístupnost, Tailwind design system,
SEO, hosting). Tyto znalosti existují jako veřejné „agent skills" na GitHubu, ale jejich
upstream se mění a mizí.

## Decision

Skills jsou **zkopírované do repa** v `.agents/skills/` a jejich původ a hash obsahu je
zamčený v `skills-lock.json`. Sada je zúžená na to, co odpovídá stacku tohoto projektu:
frontend design a UI animace, přístupnost a web design guidelines, Tailwind design system,
SEO a audit webu, canvas/vizuální design, Vercel a Cloudflare.

Skills navázané na technologie, které projekt vědomě nepoužívá (databázové a React/Next
skills), se **nekopírují** — viz ADR-0001 a ADR-0002.

## Alternatives Considered

### Alternative 1: Instalovat skills při potřebě z upstreamu
- **Pros**: vždy aktuální verze, menší repo
- **Cons**: nedeterministické chování agenta v čase, závislost na dostupnosti cizích repozitářů,
  nefunguje offline
- **Why not**: reprodukovatelnost chování agenta je cennější než aktuálnost

### Alternative 2: Kopírovat kompletní sadu z předchozího projektu
- **Pros**: nulové rozhodování, nic nechybí
- **Cons**: databázové a React skills by agenta naváděly k řešením, která tento projekt
  explicitně odmítá
- **Why not**: irelevantní skills aktivně zhoršují výstup

## Consequences

### Positive
- Chování agenta je reprodukovatelné a funguje i offline
- Sada skills odpovídá stacku, agent není naváděn mimo architekturu
- `skills-lock.json` umožňuje dohledat původ a ověřit, že se obsah nezměnil

### Negative
- Repo je o několik MB větší
- Aktualizace skillu je ruční krok včetně přepočtu hashe

### Risks
- Skills postupně zastarají vůči upstreamu. Mitigace: `skills-lock.json` drží zdroj,
  takže je kdykoli jasné, odkud se dá stáhnout novější verze.
