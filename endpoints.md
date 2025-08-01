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
    // temp-endpoints.json からエンドポイント情報を読み込み（テンポラリファイル）
    // 将来的にはAPIエンドポイントに変更予定
    const baseUrl = window.SITE_BASE_URL || '';
    const response = await fetch(`${baseUrl}/assets/data/temp-endpoints.json`);
    if (!response.ok) {
      throw new Error('Failed to fetch endpoints list');
    }
    
    const endpoints = await response.json();
    
    if (!endpoints || endpoints.length === 0) {
      return;
    }
    
    renderEndpoints(endpoints);
    endpointListView.style.display = 'block';
    
  } catch (error) {
    console.error('Error loading endpoints:', error);
  }
}

function renderEndpoints(endpoints) {
  const endpointListView = document.getElementById('EndpointsListView');
  const baseUrl = window.SITE_BASE_URL || '';
  
  // エンドポイントカードのHTML（FLOCSSクラス使用）
  const endpointsHtml = endpoints.map(endpoint => `
    <ul class="endpoints">
      <li>
        <h2>${endpoint.id}</h2>
        <ul class="datasets">
          ${endpoint.dataset.map(datasetId => `
            <li>
              <h3>${datasetId}</h3>
            </li>
          `).join('')}
        </ul>
      </li>
    </ul>
  `).join('');
  
  endpointListView.innerHTML = endpointsHtml;
}

</script>
