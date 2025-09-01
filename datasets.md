---
layout: page
title: Datasets
pageId: datasets
description: 利用可能なRDFデータセットの一覧を表示します
permalink: /datasets/
---



<!-- JekyllでJSONデータを埋め込む -->
<script type="application/json" id="datasets-json">{{ site.data.datasets | jsonify }}</script>


<!-- #DatasetsSortFilterView（default.html側）を活用するため独自UIは廃止 -->
<div id="DatasetsListView"></div>


<script>


document.addEventListener('DOMContentLoaded', async function() {
  const datasetLoader = window.DatasetsManager.getInstance();
  let datasets = [];
  try {
    datasets = await datasetLoader.getDatasets();
  } catch (e) {
    console.error('Failed to load datasets:', e);
  }
  if (!datasets || datasets.length === 0) return;

  // #DatasetsSortFilterView のUI取得
  const sortSegment = document.getElementById('sortSegment');
  const sortOrderSegment = document.getElementById('sortOrderSegment');
  const tagSelect = document.getElementById('tagSelect');
  const searchInput = document.getElementById('DatasetSearchInput'); // 検索UIは必要に応じて

  // タグ選択肢生成
  if (tagSelect) {
    // タグごとの件数集計
    const tagCounts = {};
    datasets.forEach(ds => {
      (ds.tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const allTags = Object.keys(tagCounts).sort();
    allTags.forEach(tag => {
      if (!Array.from(tagSelect.options).some(opt => opt.value === tag)) {
        const opt = document.createElement('option');
        opt.value = tag;
        opt.textContent = `${tag} (${tagCounts[tag]})`;
        tagSelect.appendChild(opt);
      }
    });
  }

  function getFilteredSortedDatasets() {
    let filtered = datasets;
    // 検索
    if (searchInput && searchInput.value.trim()) {
      const keyword = searchInput.value.trim().toLowerCase();
      filtered = filtered.filter(ds =>
        (ds.title && ds.title.toLowerCase().includes(keyword)) ||
        (ds.description && ds.description.toLowerCase().includes(keyword))
      );
    }
    // タグフィルタ
    if (tagSelect && tagSelect.value) {
      filtered = filtered.filter(ds => Array.isArray(ds.tags) && ds.tags.includes(tagSelect.value));
    }
    // ソートキー
    let sortKey = 'date';
    if (sortSegment) {
      const activeBtn = sortSegment.querySelector('button[data-sort][aria-pressed="true"]');
      if (activeBtn) sortKey = activeBtn.getAttribute('data-sort');
    }
    // ソート順
    let sortOrder = 'desc';
    if (sortOrderSegment) {
      const activeOrderBtn = sortOrderSegment.querySelector('button[data-order][aria-pressed="true"]');
      if (activeOrderBtn) sortOrder = activeOrderBtn.getAttribute('data-order');
    }
    // 実際のソート
    filtered = filtered.slice().sort((a, b) => {
      let va, vb;
      if (sortKey === 'name') {
        va = (a.title || '').toLowerCase();
        vb = (b.title || '').toLowerCase();
        return sortOrder === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      } else if (sortKey === 'triples') {
        va = a.statistics?.number_of_triples || 0;
        vb = b.statistics?.number_of_triples || 0;
        return sortOrder === 'asc' ? va - vb : vb - va;
      } else {
        // date（仮: created, updated, issued, いずれか）
        va = a.created || a.updated || a.issued || '';
        vb = b.created || b.updated || b.issued || '';
        return sortOrder === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      }
    });
    return filtered;
  }

  function renderDatasets(datasetsToRender) {
    const container = document.getElementById('DatasetsListView');
    container.innerHTML = '';
    const ul = document.createElement('ul');
    ul.className = 'datasets';
    datasetsToRender.forEach(dataset => {
      const li = document.createElement('li');
      li.className = 'dataset';
      const datasetCard = new DatasetCard(dataset, {
        showDescription: true,
        showTags: true,
        showLink: true,
        linkBaseUrl: window.SITE_BASE_URL || "",
        iconRendering: 'svgOverlap',
        showHeaderMeta: true
      });
      const cardEl = datasetCard.getElement();
      li.appendChild(cardEl);
      ul.appendChild(li);
    });
    container.appendChild(ul);
  }

  // 初期表示
  renderDatasets(getFilteredSortedDatasets());
  // イベント
  if (searchInput) searchInput.addEventListener('input', () => renderDatasets(getFilteredSortedDatasets()));
  if (tagSelect) tagSelect.addEventListener('change', () => renderDatasets(getFilteredSortedDatasets()));
  if (sortSegment) sortSegment.addEventListener('click', e => {
    if (e.target.matches('button[data-sort]')) {
      sortSegment.querySelectorAll('button').forEach(btn => btn.setAttribute('aria-pressed', 'false'));
      e.target.setAttribute('aria-pressed', 'true');
      renderDatasets(getFilteredSortedDatasets());
    }
  });
  if (sortOrderSegment) sortOrderSegment.addEventListener('click', e => {
    if (e.target.matches('button[data-order]')) {
      sortOrderSegment.querySelectorAll('button').forEach(btn => btn.setAttribute('aria-pressed', 'false'));
      e.target.setAttribute('aria-pressed', 'true');
      renderDatasets(getFilteredSortedDatasets());
    }
  });
});
</script>
