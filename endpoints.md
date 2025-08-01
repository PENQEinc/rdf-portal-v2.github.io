---
layout: default
title: Endpoints
pageId: endpoints
description: SPARQLエンドポイントの一覧を表示します
permalink: /endpoints/
---

<div id="EndpointsListView"></div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  loadEndpoints();
});

async function loadEndpoints() {
  const endpointListView = document.getElementById('EndpointsListView');
  
  try {
    const baseUrl = window.SITE_BASE_URL || '';
    
    // エンドポイント情報とデータセット情報を並行して読み込み
    const [endpointsResponse, datasetsResponse] = await Promise.all([
      fetch(`${baseUrl}/assets/data/temp-endpoints.json`),
      fetch(`${baseUrl}/assets/data/temp-datasets.json`)
    ]);
    
    if (!endpointsResponse.ok) {
      throw new Error('Failed to fetch endpoints list');
    }
    
    if (!datasetsResponse.ok) {
      throw new Error('Failed to fetch datasets list');
    }
    
    const endpoints = await endpointsResponse.json();
    const datasets = await datasetsResponse.json();
    
    if (!endpoints || endpoints.length === 0) {
      return;
    }
    
    // 両方のデータが読み込まれてからレンダリング
    renderEndpoints(endpoints, datasets);
    endpointListView.style.display = 'block';
    
  } catch (error) {
    console.error('Error loading endpoints:', error);
  }
}

function renderEndpoints(endpoints, datasets) {
  const endpointListView = document.getElementById('EndpointsListView');
  const baseUrl = window.SITE_BASE_URL || '';
  
  // データセット情報をIDでマップ化
  const datasetMap = {};
  if (datasets && Array.isArray(datasets)) {
    datasets.forEach(dataset => {
      datasetMap[dataset.id] = dataset;
    });
  }
  
  // エンドポイントカードのHTML（FLOCSSクラス使用）
  const endpointsHtml = endpoints.map(endpoint => `
    <ul class="endpoints">
      <li class="endpoint">
        <h2>${endpoint.id}</h2>
        <ul class="datasets">
          ${endpoint.dataset.map(datasetId => {
            const dataset = datasetMap[datasetId];
            const datasetTitle = dataset ? dataset.title || datasetId : datasetId;
            return `
              <li>
                <div class="dataset-tile">
                  <h3 class="title">${datasetTitle}</h3>
                  ${dataset && dataset.description ? `<p class="description">${dataset.description}</p>` : ''}
                </div>
              </li>
            `;
          }).join('')}
        </ul>
      </li>
    </ul>
  `).join('');
  
  endpointListView.innerHTML = endpointsHtml;
}

</script>
