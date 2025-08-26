---
layout: page
title: Datasets
pageId: datasets
description: 利用可能なRDFデータセットの一覧を表示します
permalink: /datasets/
---

<div id="DatasetsListView"></div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  loadDatasets();
});

async function loadDatasets() {
  const datasetsListView = document.getElementById('DatasetsListView');
  
  try {
    const datasetLoader = DatasetsManager.getInstance();
    const datasets = await datasetLoader.getDatasets();
    
    if (!datasets || datasets.length === 0) {
      return;
    }
    
    renderDatasets(datasets);
    datasetsListView.style.display = 'block';
    // データ取得後にソート/フィルタの初期化を行う（空の実装）
    initSortAndFilter(datasets);
    
  } catch (error) {
    console.error('Error loading datasets:', error);
  }
}

function renderDatasets(datasets) {
  const container = document.getElementById('DatasetsListView');
  const baseUrl = window.SITE_BASE_URL || '';
  // 既存内容クリア
  container.innerHTML = '';
  const ul = document.createElement('ul');
  ul.className = 'datasets';

  datasets.forEach(dataset => {
    const li = document.createElement('li');
    li.className = 'dataset';
    const datasetCard = new DatasetCard(dataset, {
      showDescription: true,
      showTags: true,
      showLink: true,
      linkBaseUrl: baseUrl,
      iconRendering: 'svgOverlap',
      showHeaderMeta: true
    });
    const cardEl = datasetCard.getElement();
    li.appendChild(cardEl);
    ul.appendChild(li);
  });

  container.appendChild(ul);
}

// 将来のソート/フィルタ初期化用（現時点は空実装）
function initSortAndFilter(datasets) {
  const sortSelect = document.getElementById('sortSelect');
  const filterInput = document.getElementById('filterInput');
  // tagSelect will be created dynamically if the layout doesn't include it
  let tagSelect = document.getElementById('tagSelect');
  const orderSelect = document.getElementById('sortOrder');
  const sortSegment = document.getElementById('sortSegment');
  const sortOrderSegment = document.getElementById('sortOrderSegment');

  // populate tag select from DatasetsManager (if available)
  (async function populateTags() {
    try {
      const mgr = DatasetsManager.getInstance();
      if (typeof mgr.getAvailableTags === 'function') {
        const tags = await mgr.getAvailableTags();
        if (!tagSelect) {
          // try to find container in layout
          const datasetsNav = document.getElementById('DatasetsListView');
          // create a small control area above the list if not present
          const ctrl = document.createElement('div');
          ctrl.className = 'datasets-controls';
          tagSelect = document.createElement('select');
          tagSelect.id = 'tagSelect';
          ctrl.appendChild(tagSelect);
          datasetsNav.parentNode.insertBefore(ctrl, datasetsNav);
        }

        // clear and add options
        tagSelect.innerHTML = '';
        const optAll = document.createElement('option');
        optAll.value = '';
        optAll.textContent = 'All tags';
        tagSelect.appendChild(optAll);
        tags.forEach(t => {
          const o = document.createElement('option');
          o.value = t.id;
          o.textContent = `${t.id} (${t.count})`;
          tagSelect.appendChild(o);
        });

        tagSelect.addEventListener('change', () => {
          applySortFilter();
        });
      }
    } catch (e) {
      console.warn('populateTags failed', e);
    }
  })();

  function applySortFilter() {
    try {
      if (!Array.isArray(datasets)) return;
      let out = datasets.slice();

      // filter (keyword)
      const q = filterInput ? filterInput.value.trim().toLowerCase() : '';
      // tag filter (select)
      const tag = tagSelect ? tagSelect.value : '';

      if (q) {
        out = out.filter((ds) => {
          const title = (ds.title || ds.id || '').toString().toLowerCase();
          let desc = '';
          if (typeof ds.description === 'string') desc = ds.description.toLowerCase();
          else if (ds.description && typeof ds.description === 'object') {
            desc = (ds.description.en || ds.description.ja || '').toString().toLowerCase();
          }
          return title.includes(q) || desc.includes(q);
        });
      }

      if (tag) {
        out = out.filter((ds) => Array.isArray(ds.tags) && ds.tags.includes(tag));
      }

      // sort with order (support segmented control + toggle)
      let sortValue = 'date';
      if (sortSegment) {
        const active = sortSegment.querySelector('button.-active');
        if (active) sortValue = active.dataset.sort || sortValue;
      } else if (sortSelect) {
        sortValue = sortSelect.value;
      }
      const order = (function(){
        if (sortOrderSegment) {
          const a = sortOrderSegment.querySelector('button.-active');
          if (a) return a.dataset.order || 'desc';
        }
        if (orderSelect) return orderSelect.value;
        return 'desc';
      })();
      if (sortValue === 'name') {
        out.sort((a, b) => {
          const A = (a.title || a.id || '').toString();
          const B = (b.title || b.id || '').toString();
          return order === 'asc' ? A.localeCompare(B) : B.localeCompare(A);
        });
      } else if (sortValue === 'date') {
        out.sort((a, b) => {
          const ta = Date.parse(a.issued || '') || 0;
          const tb = Date.parse(b.issued || '') || 0;
          return order === 'asc' ? ta - tb : tb - ta; // asc: older->newer, desc: newer->older
        });
      } else if (sortValue === 'triples') {
        out.sort((a, b) => {
          const na = Number(a.triple_count || 0);
          const nb = Number(b.triple_count || 0);
          return order === 'asc' ? na - nb : nb - na;
        });
      }

      // visual debug: set attribute and log
      const container = document.getElementById('DatasetsListView');
      if (container && sortValue) container.dataset.sortedBy = sortValue;
      console.info('[Datasets] applySortFilter:', { sort: sortValue, query: q, count: out.length });
      if (out.length > 0) console.debug('[Datasets] first 3 ids after sort:', out.slice(0, 3).map(d => d.id || d.title));

      renderDatasets(out);
    } catch (err) {
      console.error('applySortFilter error', err);
    }
  }

  if (sortSelect) sortSelect.addEventListener('change', applySortFilter);
  if (filterInput) filterInput.addEventListener('input', applySortFilter);
  if (orderSelect) orderSelect.addEventListener('change', applySortFilter);
  // segmented control handlers
  if (sortSegment) {
    sortSegment.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      // update active
      Array.from(sortSegment.querySelectorAll('button')).forEach(b => {
        b.classList.toggle('-active', b === btn);
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      applySortFilter();
    });
  }
  if (sortOrderSegment) {
    sortOrderSegment.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      Array.from(sortOrderSegment.querySelectorAll('button')).forEach(b => {
        b.classList.toggle('-active', b === btn);
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      applySortFilter();
    });
  }

  // run once to reflect current control values and to verify handler wiring
  try {
    applySortFilter();
  } catch (e) {
    // swallow - already logged inside
  }
}

</script>
