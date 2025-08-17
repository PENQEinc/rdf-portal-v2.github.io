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
    
    // データが読み込まれてからレンダリング
    renderDatasets(datasets);
    datasetsListView.style.display = 'block';
    
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
  iconRendering: 'svgOverlap'
    });
    const cardEl = datasetCard.getElement();
    const metaWrapper = document.createElement('div');
    metaWrapper.className = 'c-card__meta-wrapper';
    metaWrapper.innerHTML = `
      <div class="c-card__meta">
        <p><strong>ID:</strong> ${dataset.id}</p>
        <p><strong>設定ファイル:</strong> <a href="https://github.com/dbcls/rdf-config/tree/master/config/${dataset.id}" target="_blank" rel="noopener">GitHub</a></p>
      </div>
      <p><a href="${baseUrl}/dataset/?id=${dataset.id}" class="c-btn c-btn--outline-primary">詳細を見る →</a></p>
    `;
    cardEl.appendChild(metaWrapper);
    li.appendChild(cardEl);
    ul.appendChild(li);
  });

  container.appendChild(ul);
}
</script>
