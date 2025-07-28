---
layout: default
title: Datasets
description: 利用可能なRDFデータセットの一覧を表示します
permalink: /datasets/
---

<h1 class="page-title">データセット</h1>
<p class="page-description">利用可能なRDFデータセットの一覧です。各データセットをクリックすると詳細情報を確認できます。</p>

<div id="loading" class="loading">
  <p>データセット情報を読み込み中...</p>
</div>

<div id="error" class="error" style="display: none;">
  <p>データセットの読み込みに失敗しました。</p>
</div>

<div id="dataset-list" class="dataset-list" style="display: none;">
  <!-- データセット一覧がここに動的に生成されます -->
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

.dataset-list {
  display: grid;
  gap: 1.5rem;
  margin-top: 1rem;
}

.dataset-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  background-color: #fafafa;
  transition: box-shadow 0.2s ease;
}

.dataset-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.dataset-item h3 a {
  color: #1976d2;
  text-decoration: none;
}

.dataset-item h3 a:hover {
  text-decoration: underline;
}

.view-details {
  display: inline-block;
  margin-top: 0.5rem;
  color: #1976d2;
  text-decoration: none;
  font-weight: 500;
}

.view-details:hover {
  text-decoration: underline;
}

.dataset-item p {
  margin: 0.5rem 0;
}

.dataset-item strong {
  color: #333;
}

.dataset-item a {
  color: #1976d2;
  text-decoration: none;
}

.dataset-item a:hover {
  text-decoration: underline;
}

.dataset-stats {
  background-color: #e3f2fd;
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
  text-align: center;
}

@media (min-width: 768px) {
  .dataset-list {
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  }
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
  loadDatasets();
});

function loadDatasets() {
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const listEl = document.getElementById('dataset-list');
  
  // 現在は assets/data/temp-datasets.txt からIDリストを読み込み（テンポラリファイル）
  // 将来的にはAPIエンドポイントに変更予定
  const baseUrl = '{{ site.baseurl }}' || '';
  const fetchUrl = `${baseUrl}/assets/data/temp-datasets.txt`;
  
  fetch(fetchUrl)
    .then(function(response) {
      if (!response.ok) {
        throw new Error(`Failed to fetch dataset list: ${response.status}`);
      }
      return response.text();
    })
    .then(function(text) {
      const datasetIds = text.trim().split('\n').filter(id => id.trim());
      
      loadingEl.style.display = 'none';
      
      if (datasetIds.length === 0) {
        errorEl.innerHTML = '<p>データセットが見つかりませんでした。</p>';
        errorEl.style.display = 'block';
        return;
      }
      
      // データセット統計を表示
      const statsHtml = `
        <div class="dataset-stats">
          <h3>データセット統計</h3>
          <p><strong>総データセット数:</strong> ${datasetIds.length}</p>
        </div>
      `;
      
      // データセット一覧を生成
      const datasetsHtml = datasetIds.map(id => `
        <div class="dataset-item">
          <h3><a href="${baseUrl}/dataset/?id=${id}">${id}</a></h3>
          <p><strong>ID:</strong> ${id}</p>
          <p><strong>設定ファイル:</strong> <a href="https://github.com/dbcls/rdf-config/tree/master/config/${id}" target="_blank">GitHub</a></p>
          <p><em>詳細なメタデータは今後のAPI開発により表示予定</em></p>
          <p><a href="${baseUrl}/dataset/?id=${id}" class="view-details">詳細を見る →</a></p>
        </div>
      `).join('');
      
      listEl.innerHTML = statsHtml + datasetsHtml;
      listEl.style.display = 'block';
    })
    .catch(function(error) {
      console.error('Error loading datasets:', error);
      loadingEl.style.display = 'none';
      errorEl.innerHTML = `
        <p>データセットの読み込みに失敗しました。</p>
        <p>エラー: ${error.message}</p>
      `;
      errorEl.style.display = 'block';
    });
}

// 将来のAPI対応用の関数（コメントアウト）
/*
async function loadDatasetsFromAPI() {
  try {
    const response = await fetch('/api/datasets');
    const datasets = await response.json();
    
    const datasetsHtml = datasets.map(dataset => `
      <div class="dataset-item">
        <h3>${dataset.name || dataset.id}</h3>
        <p><strong>ID:</strong> ${dataset.id}</p>
        ${dataset.description ? `<p><strong>Description:</strong> ${dataset.description}</p>` : ''}
        ${dataset.endpoint ? `<p><strong>Endpoint:</strong> <a href="${dataset.endpoint}">${dataset.endpoint}</a></p>` : ''}
        ${dataset.license ? `<p><strong>License:</strong> ${dataset.license}</p>` : ''}
        ${dataset.homepage ? `<p><strong>Homepage:</strong> <a href="${dataset.homepage}">${dataset.homepage}</a></p>` : ''}
      </div>
    `).join('');
    
    document.getElementById('dataset-list').innerHTML = datasetsHtml;
  } catch (error) {
    console.error('Error loading datasets from API:', error);
  }
}
*/
</script>
