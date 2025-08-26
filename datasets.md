---
layout: page
title: Datasets
pageId: datasets
description: 利用可能なRDFデータセットの一覧を表示します
permalink: /datasets/
---



<!-- JekyllでJSONデータを埋め込む -->
<script type="application/json" id="datasets-json">{{ site.data.datasets | jsonify }}</script>

<div id="DatasetsListView"></div>


<script>
document.addEventListener('DOMContentLoaded', async function() {
  // DatasetsManager経由でデータ取得（タグカラーCSSも生成される）
  const datasetLoader = window.DatasetsManager.getInstance();
  let datasets = [];
  try {
    datasets = await datasetLoader.getDatasets();
  } catch (e) {
    console.error('Failed to load datasets:', e);
  }
  if (!datasets || datasets.length === 0) return;
  renderDatasets(datasets);
});

function renderDatasets(datasets) {
  const container = document.getElementById('DatasetsListView');
  container.innerHTML = '';
  const ul = document.createElement('ul');
  ul.className = 'datasets';
  datasets.forEach(dataset => {
    const li = document.createElement('li');
    li.className = 'dataset';
    // DatasetCard.jsで従来通り描画
    const datasetCard = new DatasetCard(dataset, {
      showDescription: true,
      showTags: true,
      showLink: true,
      iconRendering: 'svgOverlap',
      showHeaderMeta: true
    });
    const cardEl = datasetCard.getElement();
    li.appendChild(cardEl);
    ul.appendChild(li);
  });
  container.appendChild(ul);
}
</script>
