# black-friday-deal-finder-01

[![make.fun · black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/laowu199377/black-friday-deal-finder-01/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/laowu199377/black-friday-deal-finder-01/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

A Black Friday deal finder: twenty real Black Friday and Cyber Monday deals, each checked on Black Friday itself (2026-11-27), with a verdict on whether the cut is actually real.

## What it is

A static site (no build step, no network at runtime) that opens at `app/index.html`. Twenty deals from six stores — Amazon, Best Buy, Walmart, Target, LG.com and Samsung.com — across eight categories: TV, Audio, Laptops, Home, Gaming, Smart home, Wearables and Phones. Every deal carries its store link, sale price, usual price, the time its price was checked, and the source it was read in.

The finder itself is the point: search plus filters by category, store, discount and verdict, and sorting by biggest discount, biggest dollar saving, or price. There is a page per deal (`#/` and `#/deal/<id>`), and a phone layout under 600px.

## The verdict — is it really a deal?

A struck-through list price is not a saving on its own. Each deal gets one of four verdicts, and every card and detail page shows the reasoning behind it:

- **Real deal** — 40% or more off, or a big dollar saving at a verified low price (14 of the 20)
- **Solid deal** — 25–39% off, a genuine saving (5)
- **Okay deal** — 15–24% off, worth it only if you already want it (0 here)
- **Weak deal** — under 15% off, barely a deal (1: the Switch 2 bundle, only 9% off)

Where a store's "was" price looked inflated, the note says what the item actually sold for recently — for example, the LG QNED84B's $250 cut is measured against the $729.99 LG charged on Nov 2, not just a strike price.

## The deals

The headline cuts: Beats Studio Pro $99 (was $299, Walmart), Fire TV Stick 4K $20 (was $60, Amazon), TCL 65-inch 4K Fire TV $229.99 (was $469.99, Best Buy), Dyson V9 $270 (was $600, Walmart), AirPods Pro 3 $149 (was $249, Amazon), LG 55-inch B6E OLED $699.99 (was $1,399.99, Best Buy). Total savings across the board: $4,884. Best cut: 67% off.

Prices were checked on Black Friday, 2026-11-27, read from the stores' own Black Friday pages and from deal trackers that re-check the stores (9to5Toys, NBC Select, CNN Underscored, Best Buy's Black Friday release). Prices change through Cyber Monday — check the store page before you buy.

## Run it

Serve it locally with `node serve.ts`, then open http://localhost:8080. Or open `app/index.html` directly in a browser.
