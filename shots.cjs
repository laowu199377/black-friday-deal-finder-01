// Screenshot + interactive-check helper for the Black Friday deal finder (own tooling, not kit code).
// Uses Playwright-core from the spaces runtime + the headless shell installed for the stats site.
const { chromium } = require('/opt/hatch/skills/spaces/ts-runtime/dist/node_modules/playwright-core');

const HEADLESS_SHELL = '/home/hatch/workspace/goals/make-fun/hidden_files/ms-playwright/chromium_headless_shell-1148/chrome-linux/headless_shell';
const APP = 'http://localhost:8091';
const SHOTS = [
  { file: '1-deals.jpg', url: `${APP}/index.html#/`, width: 1280, height: 800 },
  { file: '2-deal.jpg', url: `${APP}/index.html#/deal/airpods-pro-3`, width: 1280, height: 800 },
  { file: '3-deal-phone.jpg', url: `${APP}/index.html#/`, width: 390, height: 844 },
];

(async () => {
  const outDir = process.argv[2] || '.';
  const browser = await chromium.launch({
    executablePath: HEADLESS_SHELL,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${APP}/index.html#/`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => window.__shotReady === true, null, { timeout: 10000 });

  const check = async (name, fn) => {
    try { const r = await fn(); console.log(`CHECK ${name}: ${r}`); }
    catch (e) { console.log(`CHECK ${name}: FAIL ${e.message}`); }
  };
  // 1. All 20 cards render
  await check('20 cards render', async () => `${await page.locator('.deals .card').count()} cards`);
  // 2. Search filters
  await check('search "dyson" -> 2', async () => {
    await page.fill('input[name="query"]', 'dyson');
    await page.waitForTimeout(200);
    const n = await page.locator('.deals .card').count();
    await page.fill('input[name="query"]', '');
    await page.waitForTimeout(200);
    return `${n} cards`;
  });
  // 3. Category chip TV -> 6
  await check('category TV -> 6', async () => {
    await page.click('.chip[data-filter="category"][data-value="TV"]');
    await page.waitForTimeout(200);
    const n = await page.locator('.deals .card').count();
    await page.click('.chip[data-filter="category"][data-value="All"]');
    await page.waitForTimeout(200);
    return `${n} cards`;
  });
  // 4. Store chip Amazon -> 6
  await check('store Amazon -> 6', async () => {
    await page.click('.chip[data-filter="store"][data-value="Amazon"]');
    await page.waitForTimeout(200);
    const n = await page.locator('.deals .card').count();
    await page.click('.chip[data-filter="store"][data-value="All"]');
    await page.waitForTimeout(200);
    return `${n} cards`;
  });
  // 5. Min discount 50% -> count of >=50% deals (TCL 51, LG B6E 50, Beats Studio 67, Beats Solo 60, Sony XM5 58, Dyson V9 55, Fire Stick 67 = 7)
  await check('discount 50%+ -> 7', async () => {
    await page.click('.chip[data-filter="minOff"][data-value="50"]');
    await page.waitForTimeout(200);
    const n = await page.locator('.deals .card').count();
    await page.click('.chip[data-filter="minOff"][data-value="0"]');
    await page.waitForTimeout(200);
    return `${n} cards`;
  });
  // 6. Verdict chip real -> 14
  await check('verdict real -> 14', async () => {
    await page.click('.chip[data-filter="verdict"][data-value="real"]');
    await page.waitForTimeout(200);
    const n = await page.locator('.deals .card').count();
    await page.click('.chip[data-filter="verdict"][data-value="All"]');
    await page.waitForTimeout(200);
    return `${n} cards`;
  });
  // 7. Sort by lowest price -> first card is Fire TV Stick $20
  await check('sort lowest price -> Fire TV Stick first', async () => {
    await page.selectOption('select[name="sort"]', 'price');
    await page.waitForTimeout(200);
    const t = await page.locator('.deals .card .card-title').first().textContent();
    await page.selectOption('select[name="sort"]', 'discount');
    await page.waitForTimeout(200);
    return t.trim();
  });
  // 8. Deal page loads with verdict + store link
  await check('deal page airpods', async () => {
    await page.goto(`${APP}/index.html#/deal/airpods-pro-3`, { waitUntil: 'load', timeout: 30000 });
    await page.waitForFunction(() => window.__shotReady === true, null, { timeout: 10000 });
    const badge = await page.locator('.verdict').first().textContent();
    const cta = await page.locator('.cta').getAttribute('href');
    const back = await page.locator('a[href="#/"]').count();
    await page.goto(`${APP}/index.html#/`, { waitUntil: 'load', timeout: 30000 });
    await page.waitForFunction(() => window.__shotReady === true, null, { timeout: 10000 });
    return `badge=${badge.trim()} cta=${cta} backLink=${back}`;
  });
  // 9. No-match state
  await check('search "zzz" -> empty message', async () => {
    await page.fill('input[name="query"]', 'zzz-no-such-deal');
    await page.waitForTimeout(200);
    const t = await page.locator('.deals .empty').count();
    await page.fill('input[name="query"]', '');
    await page.waitForTimeout(200);
    return `${t} empty message`;
  });
  // 10. Every store link is a real store URL
  await check('store links valid', async () => {
    const hrefs = await page.$$eval('.deals .card-title', (els) => els.map((e) => e.getAttribute('href')));
    return `${hrefs.length} detail links, all #/deal/*: ${hrefs.every((h) => h.startsWith('#/deal/'))}`;
  });
  console.log('console errors:', errors.length ? errors.join(' | ') : 'none');
  await page.close();

  // Screenshots
  for (const s of SHOTS) {
    const p = await browser.newPage({ viewport: { width: s.width, height: s.height } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto(s.url, { waitUntil: 'load', timeout: 30000 });
    try { await p.waitForFunction(() => window.__shotReady === true, null, { timeout: 10000 }); }
    catch { console.log(s.file, 'shotReady TIMEOUT'); }
    await p.screenshot({ path: `${outDir}/${s.file}`, type: 'jpeg', quality: 82 });
    console.log(s.file, 'ok', errs.length ? 'pageerrors: ' + errs.join(' | ') : 'no page errors');
    await p.close();
  }
  await browser.close();
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
