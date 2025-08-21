---
layout: page
title: SPARQL endpoints
pageId: sparql_endpoints
description: SPARQLエンドポイントの一覧を表示します
permalink: /sparql_endpoints/
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
    const datasetLoader = DatasetsManager.getInstance();
    
    // エンドポイント情報とデータセット情報を並行して読み込み
    const [endpointsResponse, datasets] = await Promise.all([
      fetch(`${baseUrl}/assets/data/temp-endpoints.json`),
      datasetLoader.getDatasets()
    ]);
    
    if (!endpointsResponse.ok) {
      throw new Error('Failed to fetch endpoints list');
    }
    
    const endpoints = await endpointsResponse.json();
    
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
  // エンドポイントのHTMLを生成
  const endpointsHtml = endpoints.map(endpoint => {
    // データセット名のシンプルなリスト生成
    const datasetsHtml = endpoint.dataset.map(datasetId => {
      const dataset = datasetMap[datasetId] || { id: datasetId };
      const datasetName = dataset.title || dataset.id || 'Unknown Dataset';
      const datasetLink = `${baseUrl}/dataset/?id=${encodeURIComponent(datasetId)}`;
      
      return `<li><a href="${datasetLink}">${datasetName}</a></li>`;
    }).join('');

    return `
      <ul class="endpoints">
        <li class="endpoint">
          <article>
            <header>
              <h2>${endpoint.title}</h2>
              <a href="https://rdfportal.org/${endpoint.id}/sparql" target="endpoint" class="external-link">Endpoint</a>
            </header>
            <ul class="datasets">
              ${datasetsHtml}
            </ul>
          </article>
        </li>
      </ul>
    `;
  }).join('');
  
  endpointListView.innerHTML = endpointsHtml;
}

</script>
