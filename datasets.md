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
    li.appendChild(cardEl);
    ul.appendChild(li);
  });

  container.appendChild(ul);
}
</script>
