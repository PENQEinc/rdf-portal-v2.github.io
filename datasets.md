---
layout: default
title: Datasets
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
      
      // データセット一覧を生成
      const datasetsHtml = datasets.map(dataset => {
        const title = dataset.title || dataset.id;
        const description = dataset.description || 'メタデータは準備中です';
        const tagsHtml = dataset.tags && dataset.tags.length > 0 
          ? `<div class="c-card__tags">${dataset.tags.map(tag => `<span class="c-tag">${tag}</span>`).join('')}</div>`
          : '';
        
        return `
          <div class="c-card ${dataset.title ? 'c-card--with-metadata' : 'c-card--no-metadata'}">
            <h3 class="c-card__title">
              <a href="${baseUrl}/dataset/?id=${dataset.id}">${title}</a>
            </h3>
            <div class="c-card__description">
              <p>${description}</p>
              ${tagsHtml}
            </div>
            <div class="c-card__meta">
              <p><strong>ID:</strong> ${dataset.id}</p>
              <p><strong>設定ファイル:</strong> <a href="https://github.com/dbcls/rdf-config/tree/master/config/${dataset.id}" target="_blank">GitHub</a></p>
            </div>
            <p><a href="${baseUrl}/dataset/?id=${dataset.id}" class="c-btn c-btn--outline-primary">詳細を見る →</a></p>
          </div>
        `;
      }).join('');
      
      listEl.innerHTML = statsHtml + datasetsHtml;
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
