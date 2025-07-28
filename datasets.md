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
        <div class="u-text-center u-mb-lg">
          <h3>データセット統計</h3>
          <p><strong>総データセット数:</strong> ${datasetIds.length}</p>
        </div>
      `;
      
      // データセット一覧を生成
      const datasetsHtml = datasetIds.map(id => `
        <div class="c-card">
          <h3 class="c-card__title"><a href="${baseUrl}/dataset/?id=${id}">${id}</a></h3>
          <div class="c-card__description">
            <p><strong>ID:</strong> ${id}</p>
            <p><strong>設定ファイル:</strong> <a href="https://github.com/dbcls/rdf-config/tree/master/config/${id}" target="_blank">GitHub</a></p>
            <p><em>詳細なメタデータは今後のAPI開発により表示予定</em></p>
          </div>
          <p><a href="${baseUrl}/dataset/?id=${id}" class="c-btn c-btn--outline-primary">詳細を見る →</a></p>
        </div>
      `).join('');
      
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
