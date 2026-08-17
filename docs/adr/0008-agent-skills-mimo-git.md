# ADR-0008: Agent skills zůstávají lokální, mimo git

**Date**: 2026-08-17  
**Status**: accepted  
**Supersedes**: ADR-0006  
**Deciders**: Martin Čech

## Context

ADR-0006 rozhodlo, že agent skills se kopírují do repa (`.agents/skills/`) a zamykají
v `skills-lock.json` kvůli reprodukovatelnosti chování agenta. V praxi se ukázalo, že to má
vyšší cenu, než se čekalo: skills jsou několik MB cizího obsahu včetně binárních fontů,
znečišťují diffy a historii, a jsou to nástroje vývojáře — ne součást produktu, který se
deployuje. Repo má být zdrojem webu, ne konfigurací něčího editoru.

## Decision

`.agents/` a `skills-lock.json` se **necommitují**. Obě cesty jsou v `.gitignore`
a byly odstraněny z indexu (`git rm --cached`), soubory zůstávají na disku vývojáře.

Skills si každý vývojář instaluje lokálně podle toho, jaké nástroje používá. Znalosti, které
musí být závazné pro každého (architektura, konvence, důvody rozhodnutí), patří do
`.github/copilot-instructions.md` a do `docs/adr/` — ty verzované zůstávají.

## Alternatives Considered

### Alternative 1: Ponechat skills v repu (stav dle ADR-0006)
- **Pros**: reprodukovatelné chování agenta, funguje offline hned po klonu
- **Cons**: megabajty cizího obsahu v historii, šumné diffy, mísí nástroje vývojáře s produktem
- **Why not**: reprodukovatelnost agenta se dá zajistit instrukcemi a ADR, které jsou o dva
  řády menší

### Alternative 2: Git submodule nebo npm balíček se skills
- **Pros**: verzované, ale mimo hlavní historii
- **Cons**: přidává build/údržbový krok kvůli něčemu, co se nedeployuje
- **Why not**: v rozporu s konvencí „nepřidávat build frameworky" (ADR-0001)

## Consequences

### Positive
- Repo obsahuje jen to, z čeho vzniká web
- Čistší diffy a historie, menší klon
- Každý vývojář může mít vlastní sadu nástrojů bez konfliktů v gitu

### Negative
- Po klonu repa agent nemá skills k dispozici, dokud si je vývojář nenainstaluje
- Ztrácí se `skills-lock.json` jako dohledatelný záznam původu skills

### Risks
- Chování agenta se může lišit mezi vývojáři. Mitigace: závazná pravidla jsou
  v `.github/copilot-instructions.md` a v `docs/adr/`, které verzované zůstávají.
