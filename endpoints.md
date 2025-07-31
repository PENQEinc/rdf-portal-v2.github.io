---
layout: default
title: Endpoints
pageId: endpoints
description: SPARQLエンドポイントの一覧を表示します
permalink: /endpoints/
---

<div class="p-hero">
  <h1 class="p-hero__title">エンドポイント</h1>
  <p class="p-hero__description">利用可能なSPARQLエンドポイントの一覧です。各エンドポイントで提供されているデータセットを確認できます。</p>
</div>

<div id="loading" class="p-loading">
  <p>エンドポイント情報を読み込み中...</p>
</div>

<div id="error" class="p-error" style="display: none;">
  <p>エンドポイントの読み込みに失敗しました。</p>
</div>

<div id="endpoints-list" style="display: none;">
  <!-- エンドポイント一覧がここに動的に生成されます -->
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  loadEndpoints();
});

async function loadEndpoints() {
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const listEl = document.getElementById('endpoints-list');
  
  try {
    // temp-endpoints.json からエンドポイント情報を読み込み（テンポラリファイル）
    // 将来的にはAPIエンドポイントに変更予定
    const baseUrl = window.SITE_BASE_URL || '';
    const response = await fetch(`${baseUrl}/assets/data/temp-endpoints.json`);
    if (!response.ok) {
      throw new Error('Failed to fetch endpoints list');
    }
    
    const endpoints = await response.json();
    
    loadingEl.style.display = 'none';
    
    if (!endpoints || endpoints.length === 0) {
      errorEl.innerHTML = '<p>エンドポイント情報が見つかりませんでした。</p>';
      errorEl.style.display = 'block';
      return;
    }
    
    renderEndpoints(endpoints);
    listEl.style.display = 'block';
    
  } catch (error) {
    console.error('Error loading endpoints:', error);
    loadingEl.style.display = 'none';
    errorEl.innerHTML = `
      <p>エンドポイントの読み込みに失敗しました。</p>
      <p>エラー: ${error.message}</p>
    `;
    errorEl.style.display = 'block';
  }
}

function renderEndpoints(endpoints) {
  const listEl = document.getElementById('endpoints-list');
  const baseUrl = window.SITE_BASE_URL || '';
  
  // 統計情報を計算
  const totalEndpoints = endpoints.length;
  const totalDatasets = endpoints.reduce((sum, endpoint) => sum + endpoint.dataset.length, 0);
  const avgDatasetsPerEndpoint = Math.round(totalDatasets / totalEndpoints * 10) / 10;
  
  // 統計セクションのHTML（FLOCSSクラス使用）
  const statsHtml = `
    <div class="p-endpoint-stats">
      <h3>エンドポイント統計</h3>
      <div class="p-endpoint-stats__grid">
        <div class="p-endpoint-stats__item">
          <span class="p-endpoint-stats__number">${totalEndpoints}</span>
          <div class="p-endpoint-stats__label">総エンドポイント数</div>
        </div>
        <div class="p-endpoint-stats__item">
          <span class="p-endpoint-stats__number">${totalDatasets}</span>
          <div class="p-endpoint-stats__label">総データセット数</div>
        </div>
        <div class="p-endpoint-stats__item">
          <span class="p-endpoint-stats__number">${avgDatasetsPerEndpoint}</span>
          <div class="p-endpoint-stats__label">平均データセット数/EP</div>
        </div>
      </div>
    </div>
  `;
  
  // エンドポイントカードのHTML（FLOCSSクラス使用）
  const endpointsHtml = endpoints.map(endpoint => `
    <div class="p-endpoint__card">
      <div class="p-endpoint__header">
        <h3>${endpoint.id}</h3>
        <div class="p-endpoint__id">endpoint: ${endpoint.id}</div>
        <div class="p-endpoint__url">https://${endpoint.id}.example.com/sparql</div>
        <div class="p-endpoint__dataset-count">${endpoint.dataset.length} datasets</div>
      </div>
      <div class="p-endpoint-datasets__grid">
        ${endpoint.dataset.map(datasetId => `
          <div class="p-endpoint-datasets__item">
            <a href="${baseUrl}/dataset/?id=${datasetId}" class="p-endpoint-datasets__name">${datasetId}</a>
            <div class="p-endpoint-datasets__id">${datasetId}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
  
  listEl.innerHTML = statsHtml + endpointsHtml;
}

// 将来のAPI対応用の関数（コメントアウト）
/*
async function loadEndpointsFromAPI() {
  try {
    const response = await fetch('/api/endpoints');
    const endpoints = await response.json();
    
    renderEndpoints(endpoints);
  } catch (error) {
    console.error('Error loading endpoints from API:', error);
  }
}
*/
</script>
