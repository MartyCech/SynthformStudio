# Synthform Studio

Statický prezentační web s důrazem na 3D/WebGL a scroll-driven animace.
**Bez databáze a bez backendu** — obsah je v repu, nasazuje se předgenerovaný `dist/`.

## Stack

| Vrstva | Technologie |
|--------|-------------|
| Markup | ruční statické HTML |
| Styly | Tailwind CSS v3 (build přes CLI) |
| Skripty | Vanilla JS, ES moduly |
| 3D | Three.js (vendorováno v `js/vendor/`) |
| Animace | GSAP 3 + ScrollTrigger |
| Hosting | Vercel, statický output |

## Příkazy

```bash
npm install       # jednorázově
npm run build     # Tailwind → dist/ → kontrola CSP
npm run serve     # build + lokální server nad dist/ na http://localhost:3000
npm run watch     # Tailwind v režimu sledování
npm run deploy    # vercel --prod
```

## Struktura

```
.agents/skills/    Agent skills verzované v repu (ADR-0006)
.github/           copilot-instructions.md — rozcestník pro AI agenta
.vscode/           MCP servery a úlohy
css/input.css      Zdroj Tailwindu (styles.css je build artefakt)
docs/adr/          Architektonická rozhodnutí + jejich důvody
js/                Aplikační skripty; js/vendor/ pro pinnuté knihovny
scripts/           build-public.js (whitelist → dist/), check-csp.js
dev-server.js      Lokální statický server nad dist/
vercel.json        Bezpečnostní hlavičky, hashová CSP, cache pravidla
```

## Než začneš měnit architekturu

Přečti si [docs/adr/README.md](docs/adr/README.md). Zásadní rozhodnutí (statický stack,
absence backendu, `dist/` artefakt, hashová CSP) mají zapsaný důvod i zvažované alternativy.
Po každém dalším zásadním rozhodnutí přibude nové ADR.

## Poznámky

- Nový veřejný soubor nebo adresář musí přibýt do whitelistu v `scripts/build-public.js`,
  jinak se do `dist/` nedostane.
- Nový inline `<script>`/`<style>` vyžaduje doplnění sha256 hashe do CSP ve `vercel.json`;
  `npm run build` chybějící hash vypíše a build selže.
- Barvy a fonty v `tailwind.config.js` jsou zatím převzatý výchozí set — nastav si vlastní.
