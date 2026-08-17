# Architecture Decision Records

Každé zásadní rozhodnutí (architektura, knihovny, hosting, build pipeline, klíčové UX/animační
vzory) má vlastní záznam. Nové ADR: zkopíruj [template.md](template.md) na
`NNNN-kratky-nazev.md` s dalším pořadovým číslem, vyplň ho a přidej řádek do tabulky níže.

Starý záznam nikdy nepřepisuj — dej mu status `superseded by ADR-NNNN` a založ nový.

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [0000](0000-project-brief.md) | Project Brief — Synthform Studio | accepted | 2026-08-16 |
| [0001](0001-static-html-tailwind-gsap-threejs.md) | Statický HTML web s Tailwindem, GSAP a Three.js | accepted | 2026-08-16 |
| [0002](0002-no-backend-no-database.md) | Bez databáze a bez backendu | accepted | 2026-08-16 |
| [0003](0003-decision-logging-strategy.md) | Logování rozhodnutí přes copilot-instructions rozcestník + ADR | accepted | 2026-08-16 |
| [0004](0004-explicit-public-dist-artifact.md) | Explicitní veřejný `dist/` artefakt pro deploy | accepted | 2026-08-16 |
| [0005](0005-hash-based-csp.md) | Hashová Content-Security-Policy ověřovaná při buildu | accepted | 2026-08-16 |
| [0006](0006-agent-skills-vendored-in-repo.md) | Agent skills verzované v repu | superseded by ADR-0008 | 2026-08-16 |
| [0007](0007-github-pages-preview-relative-asset-paths.md) | GitHub Pages jako testovací prostředí a relativní cesty k assetům | accepted | 2026-08-16 |
| [0008](0008-agent-skills-mimo-git.md) | Agent skills zůstávají lokální, mimo git | accepted | 2026-08-17 |
