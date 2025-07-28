---
layout: page
title: Endpoints
permalink: /endpoints/
---

<div id="loading" class="loading">
  <p>エンドポイント情報を読み込み中...</p>
</div>

<div id="error" class="error" style="display: none;">
  <p>エンドポイントの読み込みに失敗しました。</p>
</div>

<div id="endpoints-list" class="endpoints-list" style="display: none;">
  <!-- エンドポイント一覧がここに動的に生成されます -->
</div>

<style>
.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error {
  text-align: center;
  padding: 2rem;
  color: #d32f2f;
  background-color: #ffebee;
  border: 1px solid #ffcdd2;
  border-radius: 4px;
  margin: 1rem 0;
}

.endpoints-list {
  margin-top: 1rem;
}

.endpoint-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 2rem;
  background-color: #fafafa;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.endpoint-header {
  background-color: #1976d2;
  color: white;
  padding: 1.5rem;
  position: relative;
}

.endpoint-header h3 {
  margin: 0;
  font-size: 1.5rem;
  text-transform: capitalize;
}

.endpoint-id {
  font-family: monospace;
  font-size: 1rem;
  opacity: 0.9;
  margin-top: 0.5rem;
}

.dataset-count {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background-color: rgba(255,255,255,0.2);
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.9rem;
}

.datasets-grid {
  padding: 1.5rem;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

.dataset-item {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 1rem;
  transition: all 0.2s ease;
  text-align: center;
}

.dataset-item:hover {
  border-color: #1976d2;
  box-shadow: 0 2px 8px rgba(25,118,210,0.2);
  transform: translateY(-2px);
}

.dataset-name {
  font-weight: 600;
  color: #1976d2;
  text-decoration: none;
  font-size: 1rem;
  display: block;
  margin-bottom: 0.5rem;
}

.dataset-name:hover {
  text-decoration: underline;
}

.dataset-id {
  font-family: monospace;
  font-size: 0.85rem;
  color: #666;
  background-color: #f5f5f5;
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  display: inline-block;
}

.endpoints-stats {
  background-color: #e3f2fd;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.stat-item {
  background-color: white;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #bbdefb;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #1976d2;
  display: block;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.3rem;
}

.endpoint-url {
  font-family: monospace;
  background-color: rgba(255,255,255,0.1);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  word-break: break-all;
}

@media (max-width: 768px) {
  .datasets-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    padding: 1rem;
  }
  
  .endpoint-header {
    padding: 1rem;
  }
  
  .dataset-count {
    position: static;
    display: inline-block;
    margin-top: 0.5rem;
  }
}
</style>

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
    const baseUrl = '{{ site.baseurl }}' || '';
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
  const baseUrl = '{{ site.baseurl }}' || '';
  
  // 統計情報を計算
  const totalEndpoints = endpoints.length;
  const totalDatasets = endpoints.reduce((sum, endpoint) => sum + endpoint.dataset.length, 0);
  const avgDatasetsPerEndpoint = Math.round(totalDatasets / totalEndpoints * 10) / 10;
  
  // 統計セクションのHTML
  const statsHtml = `
    <div class="endpoints-stats">
      <h3>エンドポイント統計</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-number">${totalEndpoints}</span>
          <div class="stat-label">総エンドポイント数</div>
        </div>
        <div class="stat-item">
          <span class="stat-number">${totalDatasets}</span>
          <div class="stat-label">総データセット数</div>
        </div>
        <div class="stat-item">
          <span class="stat-number">${avgDatasetsPerEndpoint}</span>
          <div class="stat-label">平均データセット数/EP</div>
        </div>
      </div>
    </div>
  `;
  
  // エンドポイントカードのHTML
  const endpointsHtml = endpoints.map(endpoint => `
    <div class="endpoint-card">
      <div class="endpoint-header">
        <h3>${endpoint.id}</h3>
        <div class="endpoint-id">endpoint: ${endpoint.id}</div>
        <div class="endpoint-url">https://${endpoint.id}.example.com/sparql</div>
        <div class="dataset-count">${endpoint.dataset.length} datasets</div>
      </div>
      <div class="datasets-grid">
        ${endpoint.dataset.map(datasetId => `
          <div class="dataset-item">
            <a href="${baseUrl}/dataset/?id=${datasetId}" class="dataset-name">${datasetId}</a>
            <div class="dataset-id">${datasetId}</div>
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
