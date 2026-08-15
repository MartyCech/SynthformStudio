# ADR-0003: Logování rozhodnutí přes copilot-instructions rozcestník + ADR

**Date**: 2026-08-16  
**Status**: accepted  
**Deciders**: Martin Čech

## Context

Většina práce na projektu probíhá v konverzacích s AI agentem. Bez zapsaného kontextu agent
i autor po čase zopakují už jednou zamítnutou variantu, nebo omylem přepíší řešení, které
vzniklo jako reakce na konkrétní bug. Zároveň nesmí kontextový soubor bobtnat — dlouhé
instrukce se přestanou číst a začnou konkurovat samotnému zadání.

## Decision

Kontext je rozdělen na dvě vrstvy:

1. **`.github/copilot-instructions.md`** — krátký **rozcestník**, který se načítá do každé
   konverzace. Obsahuje jen architekturu v kostce, odkazy na zdroje pravdy a konvence.
   Nikdy neobsahuje odůvodnění rozhodnutí.
2. **`docs/adr/`** — plné záznamy rozhodnutí ve formátu
   Context → Decision → Alternatives Considered → Consequences, s indexem v `README.md`.

Agent má povinnost přečíst relevantní ADR **před** změnou v dané oblasti a založit nové ADR
**po** zásadním rozhodnutí. Staré ADR se nepřepisují, dostávají status
`superseded by ADR-NNNN`.

## Alternatives Considered

### Alternative 1: Jeden velký instrukční soubor se vším
- **Pros**: vše na jednom místě, žádné hledání
- **Cons**: rychle přeroste rozumnou délku, zabírá kontext v každé konverzaci,
  odůvodnění se míchá s pravidly
- **Why not**: dlouhé instrukce se v praxi ignorují

### Alternative 2: Jen commit messages a PR popisy
- **Pros**: nulová údržba navíc
- **Cons**: zvažované alternativy a důvod zamítnutí se do commitu prakticky nikdy nedostanou;
  dohledávání je pomalé
- **Why not**: klíčová je právě zamítnutá varianta, ne provedená změna

## Consequences

### Positive
- Do každé konverzace jde jen krátký rozcestník; detail se dočte podle potřeby
- Zamítnuté varianty jsou zapsané, takže se necyklí
- Historie rozhodnutí je čitelná i pro člověka, který přijde k projektu později

### Negative
- Vyžaduje disciplínu — ADR se musí opravdu zakládat
- Index v `README.md` je nutné ručně udržovat

### Risks
- ADR se přestanou psát a rozcestník zastará. Mitigace: povinnost je zapsaná přímo
  v `copilot-instructions.md`, takže na ni agent naráží v každé konverzaci.
