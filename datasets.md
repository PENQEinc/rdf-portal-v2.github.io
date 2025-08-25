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
  const orderSelect = document.getElementById('sortOrder');

  function applySortFilter() {
    try {
      if (!Array.isArray(datasets)) return;
      let out = datasets.slice();

      // filter (keyword)
      const q = filterInput ? filterInput.value.trim().toLowerCase() : '';
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

      // sort with order
    const sortValue = sortSelect ? sortSelect.value : 'date';
      const order = orderSelect ? orderSelect.value : 'desc'; // 'asc' or 'desc'
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

  // run once to reflect current control values and to verify handler wiring
  try {
    applySortFilter();
  } catch (e) {
    // swallow - already logged inside
  }
}

</script>
