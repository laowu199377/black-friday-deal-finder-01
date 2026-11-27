// HTML for each page, built from the deal data. Every value is escaped before it goes into the page.
// The list shows a verdict badge per deal — the site's own call on whether the cut is real — plus the
// reasoning behind it, so a shopper can judge the badge instead of trusting it blindly.

const escape = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const usd = (n) =>
  `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;
const percentOff = (d) => Math.round((1 - d.price / d.was) * 100);
const saved = (d) => d.was - d.price;
const day = (iso) =>
  new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }) + ' UTC';

export const VERDICTS = {
  real: { label: 'Real deal', hint: '40%+ off or a big saving at a verified low' },
  solid: { label: 'Solid deal', hint: '25–39% off, a genuine saving' },
  okay: { label: 'Okay deal', hint: '15–24% off — only if you already want it' },
  weak: { label: 'Weak deal', hint: 'Under 15% off — barely a deal' },
};

export function categories(deals) {
  return [...new Set(deals.map((d) => d.category))].sort();
}

export function stores(deals) {
  return [...new Set(deals.map((d) => d.store))].sort();
}

export function stats(deals) {
  const totalSaved = deals.reduce((s, d) => s + saved(d), 0);
  const real = deals.filter((d) => d.verdict === 'real').length;
  const best = [...deals].sort((a, b) => percentOff(b) - percentOff(a))[0];
  return { totalSaved, real, best, count: deals.length };
}

export function filterDeals(deals, f) {
  const q = (f.query || '').trim().toLowerCase();
  let out = deals.filter((d) => {
    if (q && !`${d.title} ${d.store} ${d.category}`.toLowerCase().includes(q)) return false;
    if (f.category && f.category !== 'All' && d.category !== f.category) return false;
    if (f.store && f.store !== 'All' && d.store !== f.store) return false;
    if (f.minOff && percentOff(d) < Number(f.minOff)) return false;
    if (f.verdict && f.verdict !== 'All' && d.verdict !== f.verdict) return false;
    return true;
  });
  const sort = f.sort || 'discount';
  if (sort === 'discount') out.sort((a, b) => percentOff(b) - percentOff(a) || saved(b) - saved(a));
  else if (sort === 'saved') out.sort((a, b) => saved(b) - saved(a));
  else if (sort === 'price') out.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') out.sort((a, b) => b.price - a.price);
  return out;
}

function card(d) {
  const v = VERDICTS[d.verdict] || VERDICTS.solid;
  return `<li class="card">
  <a class="card-title" href="#/deal/${encodeURIComponent(d.id)}">${escape(d.title)}</a>
  <span class="card-meta">${escape(d.store)} &middot; ${escape(d.category)}</span>
  <span class="card-price">${usd(d.price)} <s>${usd(d.was)}</s> <b>${percentOff(d)}% off</b></span>
  <span class="card-save">Save ${usd(saved(d))}</span>
  <span class="verdict verdict-${escape(d.verdict)}" title="${escape(v.hint)}">${escape(v.label)}</span>
  <span class="card-why">${escape(d.why)}</span>
</li>`;
}

export function rows(deals, f) {
  const shown = filterDeals(deals, f);
  if (shown.length === 0) return '<li class="empty">No deal matches those filters. Try clearing one.</li>';
  return shown.map(card).join('');
}

export function list(deals, f) {
  const s = stats(deals);
  const cats = ['All', ...categories(deals)];
  const sts = ['All', ...stores(deals)];
  const chip = (name, values, current) =>
    values
      .map(
        (v) =>
          `<button type="button" class="chip${v === current ? ' active' : ''}" data-filter="${name}" data-value="${escape(v)}">${escape(v)}</button>`,
      )
      .join('');
  return `<h1>Black Friday Deal Finder</h1>
<p class="lede">Twenty real Black Friday and Cyber Monday deals, each checked on Black Friday itself — with a verdict on whether the cut is actually real, and the reasoning behind it.</p>
<p class="stats"><strong>${s.count} deals</strong> &middot; <strong>${s.real} real deals</strong> &middot; <strong>${usd(s.totalSaved)} total savings</strong> &middot; best cut: <strong>${percentOff(s.best)}% off</strong> the ${escape(s.best.title)}</p>
<div class="controls">
  <label class="search">Search <input type="search" name="query" value="${escape(f.query || '')}" placeholder="TV, AirPods, Dyson…"></label>
  <label class="sort">Sort
    <select name="sort">
      <option value="discount"${f.sort === 'discount' ? ' selected' : ''}>Biggest discount</option>
      <option value="saved"${f.sort === 'saved' ? ' selected' : ''}>Biggest saving ($)</option>
      <option value="price"${f.sort === 'price' ? ' selected' : ''}>Lowest price</option>
      <option value="price-desc"${f.sort === 'price-desc' ? ' selected' : ''}>Highest price</option>
    </select>
  </label>
</div>
<div class="filters">
  <div class="filter-row"><span class="filter-label">Category</span>${chip('category', cats, f.category || 'All')}</div>
  <div class="filter-row"><span class="filter-label">Store</span>${chip('store', sts, f.store || 'All')}</div>
  <div class="filter-row"><span class="filter-label">Discount</span>${chip('minOff', ['0', '25', '40', '50'], String(f.minOff || 0)).replaceAll('>0<', '>Any<').replaceAll('>25<', '>25%+<').replaceAll('>40<', '>40%+<').replaceAll('>50<', '>50%+<')}</div>
  <div class="filter-row"><span class="filter-label">Verdict</span>${chip('verdict', ['All', 'real', 'solid', 'okay', 'weak'], f.verdict || 'All').replaceAll('>real<', '>Real deal<').replaceAll('>solid<', '>Solid<').replaceAll('>okay<', '>Okay<').replaceAll('>weak<', '>Weak<')}</div>
</div>
<p class="count" aria-live="polite"></p>
<ul class="deals">${rows(deals, f)}</ul>
<p class="how">How the verdict works: <b>Real deal</b> means 40% or more off, or a big dollar saving at a verified low price. <b>Solid</b> is 25–39% off. <b>Okay</b> is 15–24% — only if you already want it. <b>Weak</b> is under 15% off. A struck-through list price is not a saving on its own: where a store's "was" price looked inflated, the note says what the item actually sold for recently.</p>`;
}

export function deal(d) {
  const v = VERDICTS[d.verdict] || VERDICTS.solid;
  return `<p><a href="#/">&larr; All deals</a></p>
<h1>${escape(d.title)}</h1>
<p><span class="verdict verdict-${escape(d.verdict)}" title="${escape(v.hint)}">${escape(v.label)}</span> <span class="why-inline">${escape(d.why)}</span></p>
<dl>
  <dt>Store</dt><dd>${escape(d.store)}</dd>
  <dt>Category</dt><dd>${escape(d.category)}</dd>
  <dt>Price</dt><dd><b>${usd(d.price)}</b>, usually ${usd(d.was)} — ${percentOff(d)}% off, save ${usd(saved(d))}</dd>
  <dt>Checked</dt><dd>${day(d.checked)}</dd>
  <dt>Read in</dt><dd>${escape(d.source)}</dd>
</dl>
<p><a class="cta" href="${escape(d.url)}" rel="noopener">Find it at ${escape(d.store)} &rarr;</a></p>
<p class="note">Prices change through Cyber Monday — check the store page before you buy.</p>`;
}

export function missing() {
  return `<h1>Not found</h1>
<p>There is no deal at this address. <a href="#/">See all deals</a>.</p>`;
}
