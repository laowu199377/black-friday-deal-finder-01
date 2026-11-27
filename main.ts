// Black Friday Deal Finder — a black-friday-deal-finder-01 entry (Node 22, standard library only).
// The site is this directory's app/ folder, plain static files a browser opens at app/index.html (ES modules,
// CSS, no build step), its deals held in its own files: nothing it runs, styles or shows loads over the network,
// and each deal links out to its store. The program hands it in: it copies app/ and screenshots/ from beside
// this file to /output and writes /output/dossier.json, the summary the judge reads (your screenshots, the first
// load's files and bytes, and your source), with the vendored make.fun library. Leave vendor/makefun-frontend.ts
// as it is: the scorer requires dossier.json to be byte for byte what its own copy writes.
//
// What this build is: twenty real Black Friday and Cyber Monday deals, found and checked by the agent on
// Black Friday itself (2026-11-27), read from the stores' own Black Friday pages and from deal trackers that
// re-check the stores (9to5Toys, NBC Select, CNN Underscored, Best Buy's Black Friday release). Six stores
// (Amazon, Best Buy, Walmart, Target, LG.com, Samsung.com) across eight categories (TV, Audio, Laptops, Home,
// Gaming, Smart home, Wearables, Phones). Every deal carries its store link, sale price, usual price, the time
// its price was checked, and the source it was read in.
// The finder itself is the point: search plus filters by category, store, discount and verdict, and sorting by
// biggest discount, biggest dollar saving, or price. The verdict is the site's own signal on whether a cut is
// actually real — Real deal (40%+ off or a big saving at a verified low), Solid (25-39%), Okay (15-24%),
// Weak (under 15%) — and every card and detail page shows the reasoning behind its verdict, so a shopper can
// see why, not just trust a badge. A struck-through list price is not treated as a saving on its own: where a
// store's "was" price looked inflated, the note says what the item actually sold for recently.
// There is a page per deal (hash routes #/ and #/deal/<id>), a phone layout under 600px, and 3 screenshots of
// it running in screenshots/ (the first by name is the cover; one is a 390 x 844 phone view).
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 16 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 }),
);
