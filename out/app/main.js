// A deal finder: every deal and a page for each, on hash routes, with search and filters by category,
// store, discount and verdict, plus sorting. The deals are in data.js, so the site needs no network to
// show them; each deal links out to its store.
//
//   #/            the finder, with search and filters
//   #/deal/<id>   one deal
//
// window.__shotReady is false while a page renders and true once it is on screen, so a screenshot script knows when
// to capture.

import { deals } from './data.js';
import { deal, list, missing, rows } from './views.js';

const app = document.getElementById('app');

const filters = { query: '', category: 'All', store: 'All', minOff: 0, verdict: 'All', sort: 'discount' };

function render() {
  window.__shotReady = false;
  const match = location.hash.match(/^#\/deal\/([^/?]+)/);
  if (match) {
    const found = deals.find((d) => d.id === decodeURIComponent(match[1]));
    document.title = `${found ? found.title : 'Not found'} | Black Friday Deal Finder`;
    app.innerHTML = found ? deal(found) : missing();
  } else {
    document.title = 'Black Friday Deal Finder';
    app.innerHTML = list(deals, filters);
    wireFilters();
    updateCount();
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function updateCount() {
  const count = app.querySelector('.count');
  const items = app.querySelectorAll('.deals .card');
  if (count) count.textContent = `${items.length} of ${deals.length} deals shown`;
}

function rerenderRows() {
  const shown = app.querySelector('.deals');
  if (shown) {
    shown.innerHTML = rows(deals, filters);
    updateCount();
  }
}

function wireFilters() {
  const search = app.querySelector('input[name="query"]');
  if (search) {
    search.addEventListener('input', () => {
      filters.query = search.value;
      rerenderRows();
    });
  }
  const sort = app.querySelector('select[name="sort"]');
  if (sort) {
    sort.addEventListener('change', () => {
      filters.sort = sort.value;
      rerenderRows();
    });
  }
  app.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const name = chip.dataset.filter;
      const value = chip.dataset.value;
      filters[name] = name === 'minOff' ? Number(value) : value;
      app.querySelectorAll(`.chip[data-filter="${name}"]`).forEach((c) => c.classList.toggle('active', c === chip));
      rerenderRows();
    });
  });
}

window.addEventListener('hashchange', render);
render();
