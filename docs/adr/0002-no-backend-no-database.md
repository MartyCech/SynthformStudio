# ADR-0002: Bez databáze a bez backendu

**Date**: 2026-08-16  
**Status**: accepted  
**Deciders**: Martin Čech

## Context

Předchozí projekt stejného autora (portfolio) používal Supabase pro dynamický obsah
a serverless funkce pro kontaktní formulář. To s sebou neslo trvalou provozní zátěž:
RLS politiky, rotace klíčů, keep-alive proti pauzování free projektu, ochrana API proti
zneužití, administrační rozhraní. Synthform Studio má výrazně menší a stabilnější obsah
a hlavní hodnotu má ve vizuálu, ne v datech.

## Decision

Projekt **nemá žádnou databázi ani vlastní backend**. Obsah žije v HTML a ve statických
JSON souborech v `data/`. Pokud vznikne potřeba opakovatelných obsahových stránek,
řeší se **build-time generováním** ze statických dat, nikoli klientským fetchem.

Formuláře, pokud budou potřeba, se řeší externí hostovanou službou (mailto odkaz nebo
form endpoint třetí strany), a takové rozhodnutí dostane vlastní ADR.

## Alternatives Considered

### Alternative 1: Supabase jako v předchozím projektu
- **Pros**: hotové CRUD, storage, auth; známý postup
- **Cons**: provozní zátěž (RLS, klíče, keep-alive), runtime závislost na cizí službě,
  klientský fetch zpomaluje první vykreslení
- **Why not**: rozsah obsahu to nevyžaduje; cena za flexibilitu je zde čistá ztráta

### Alternative 2: Vlastní serverless funkce na Vercelu
- **Pros**: možnost skrýt klíče, vlastní logika
- **Cons**: nutnost řešit rate limiting, CAPTCHA, CORS, env proměnné a monitoring
- **Why not**: nemáme dnes žádný use case, který by to ospravedlnil

## Consequences

### Positive
- Deploy je čistě statický; nulová runtime závislost a nulové provozní náklady
- Žádné tajemství v repu ani v prohlížeči, útočná plocha je minimální
- Obsah je verzovaný v gitu s plnou historií

### Negative
- Změna obsahu vyžaduje commit a deploy, ne přihlášení do administrace
- Žádný sběr dat od návštěvníků bez zapojení externí služby

### Risks
- Tlak přidat „jen jeden malý endpoint" postupně stack rozpustí. Mitigace: každý backend
  musí projít novým ADR, které toto explicitně nahradí nebo doplní.
