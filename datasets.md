---
layout: page
title: Datasets
pageId: datasets
description: 利用可能なRDFデータセットの一覧を表示します
permalink: /datasets/
---

<div class="p-hero">
  <h1 class="p-hero__title">データセット</h1>
  <p class="p-hero__description">利用可能なRDFデータセットの一覧です。各データセットをクリックすると詳細情報を確認できます。</p>
</div>

<div id="loading" class="p-loading">
  <p>データセット情報を読み込み中...</p>
</div>

<div id="error" class="p-error" style="display: none;">
  <p>データセットの読み込みに失敗しました。</p>
</div>

<div id="dataset-list" class="c-card-grid" style="display: none;">
  <!-- データセット一覧がここに動的に生成されます -->
</div>

<style>
.datasets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.dataset-card-wrapper .dataset-card {
  height: auto;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.dataset-card-wrapper .dataset-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.dataset-card-wrapper .dataset-card .title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.dataset-card-wrapper .dataset-card .title a {
  color: #1976d2;
  text-decoration: none;
}

.dataset-card-wrapper .dataset-card .title a:hover {
  text-decoration: underline;
}

.dataset-card-wrapper .dataset-card .description {
  margin-bottom: 1rem;
  line-height: 1.5;
  color: #666;
}

.dataset-card-wrapper .dataset-card .tags {
  margin-bottom: 1rem;
}

.dataset-card-wrapper .dataset-card .tag {
  display: inline-block;
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  margin-right: 0.5rem;
  margin-bottom: 0.25rem;
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
  
  // temp-datasets.json ファイルから詳細なデータセット情報を読み込み
  // 将来的にはAPIエンドポイントに変更予定
  const baseUrl = '{{ site.baseurl }}' || '';
  const fetchUrl = `${baseUrl}/assets/data/temp-datasets.json`;
  
  fetch(fetchUrl)
    .then(function(response) {
      if (!response.ok) {
        throw new Error(`Failed to fetch dataset list: ${response.status}`);
      }
      return response.json();
    })
    .then(function(datasets) {
      loadingEl.style.display = 'none';
      
      if (datasets.length === 0) {
        errorEl.innerHTML = '<p>データセットが見つかりませんでした。</p>';
        errorEl.style.display = 'block';
        return;
      }
      
      // メタデータがあるデータセットとないデータセットを分類
      const withMetadata = datasets.filter(d => d.title && d.title.length > 0);
      const withoutMetadata = datasets.filter(d => !d.title || d.title.length === 0);
      
      // データセット統計を表示
      const statsHtml = `
        <div class="u-text-center u-mb-lg">
          <h3>データセット統計</h3>
          <p><strong>総データセット数:</strong> ${datasets.length}</p>
          <p><strong>メタデータあり:</strong> ${withMetadata.length}</p>
          <p><strong>メタデータなし:</strong> ${withoutMetadata.length}</p>
        </div>
      `;
      
      // データセット一覧を生成（DatasetTileクラスを使用）
      const datasetsContainer = document.createElement('div');
      datasetsContainer.className = 'datasets-grid';
      
      datasets.forEach(dataset => {
        const datasetCard = new DatasetCard(dataset, {
          showDescription: true,
          showTags: true,
          showLink: true,
          linkBaseUrl: baseUrl,
          customClasses: ['c-card', dataset.title ? 'c-card--with-metadata' : 'c-card--no-metadata']
        });
        
        // 追加情報（ID、GitHubリンク、詳細ボタン）を含むカードラッパーを作成
        const cardWrapper = document.createElement('div');
        cardWrapper.className = 'dataset-card-wrapper';
        
        const card = datasetCard.getElement();
        
        // メタ情報とボタンを追加
        const metaHtml = `
          <div class="c-card__meta">
            <p><strong>ID:</strong> ${dataset.id}</p>
            <p><strong>設定ファイル:</strong> <a href="https://github.com/dbcls/rdf-config/tree/master/config/${dataset.id}" target="_blank">GitHub</a></p>
          </div>
          <p><a href="${baseUrl}/dataset/?id=${dataset.id}" class="c-btn c-btn--outline-primary">詳細を見る →</a></p>
        `;
        
        card.insertAdjacentHTML('beforeend', metaHtml);
        cardWrapper.appendChild(card);
        datasetsContainer.appendChild(cardWrapper);
      });
      
      listEl.innerHTML = statsHtml;
      listEl.appendChild(datasetsContainer);
      listEl.style.display = 'grid';
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
</script>
