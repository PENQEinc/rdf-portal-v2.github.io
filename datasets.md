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
    const baseUrl = window.SITE_BASE_URL || '';
    
    // データセット情報を読み込み
    const response = await fetch(`${baseUrl}/assets/data/temp-datasets.json`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch datasets list');
    }
    
    const datasets = await response.json();
    
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
  const datasetsListView = document.getElementById('DatasetsListView');
  const baseUrl = window.SITE_BASE_URL || '';
  
  // データセットのHTMLを生成
  const datasetsHtml = datasets.map(dataset => {
    // DatasetCardクラスを使用してカードを作成
    const datasetCard = new DatasetCard(dataset, {
      showDescription: true,
      showTags: true,
      showLink: true,
      linkBaseUrl: baseUrl
    });
    
    const cardElement = datasetCard.getElement();
    
    // メタ情報を追加
    const metaHtml = `
      <div class="c-card__meta">
        <p><strong>ID:</strong> ${dataset.id}</p>
        <p><strong>設定ファイル:</strong> <a href="https://github.com/dbcls/rdf-config/tree/master/config/${dataset.id}" target="_blank">GitHub</a></p>
      </div>
      <p><a href="${baseUrl}/dataset/?id=${dataset.id}" class="c-btn c-btn--outline-primary">詳細を見る →</a></p>
    `;
    
    cardElement.insertAdjacentHTML('beforeend', metaHtml);
    
    return `<li class="dataset">${cardElement.outerHTML}</li>`;
  }).join('');

  const html = `
    <ul class="datasets">
      ${datasetsHtml}
    </ul>
  `;
  
  datasetsListView.innerHTML = html;
}
</script>
