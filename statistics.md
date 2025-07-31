---
layout: default
title: Statistics
pageId: statistics
description: RDFデータセットの統計情報を表示します
permalink: /statistics/
---

<div class="p-hero">
  <h1 class="p-hero__title">統計情報</h1>
  <p class="p-hero__description">RDFデータセットとエンドポイントの統計情報を表示します。</p>
</div>

<div id="loading" class="p-loading">
  <p>統計情報を読み込み中...</p>
</div>

<div id="error" class="p-error" style="display: none;">
  <p>統計情報の読み込みに失敗しました。</p>
</div>

<div id="statistics-content" style="display: none;">
  <div class="c-card-grid">
    <div class="c-card">
      <h3 class="c-card__title">データセット統計</h3>
      <div class="c-card__content">
        <div class="u-text-center">
          <div id="dataset-count" class="u-mb-sm">
            <span class="u-text-lg u-fw-bold u-text-primary">-</span>
            <p class="u-text-sm u-text-muted">総データセット数</p>
          </div>
        </div>
      </div>
    </div>

    <div class="c-card">
      <h3 class="c-card__title">エンドポイント統計</h3>
      <div class="c-card__content">
        <div class="u-text-center">
          <div id="endpoint-count" class="u-mb-sm">
            <span class="u-text-lg u-fw-bold u-text-primary">-</span>
            <p class="u-text-sm u-text-muted">エンドポイント数</p>
          </div>
        </div>
      </div>
    </div>

    <div class="c-card">
      <h3 class="c-card__title">データ更新情報</h3>
      <div class="c-card__content">
        <div class="u-text-center">
          <div id="last-update" class="u-mb-sm">
            <span class="u-text-lg u-fw-bold u-text-primary">-</span>
            <p class="u-text-sm u-text-muted">最終更新日</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="c-card u-mt-lg">
    <h3 class="c-card__title">詳細統計</h3>
    <div class="c-card__content">
      <h4 class="u-mb-md">データ統計</h4>
      <ul class="u-mb-md">
        <li>トリプル数: 統計情報を取得中...</li>
        <li>データセット数: <span id="dataset-count-detail">取得中...</span></li>
        <li>エンドポイント数: <span id="endpoint-count-detail">取得中...</span></li>
      </ul>
      
      <p class="u-text-sm u-text-muted">統計情報は定期的に更新されます。</p>
    </div>
  </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  loadStatistics();
});

function loadStatistics() {
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const contentEl = document.getElementById('statistics-content');
  
  // 実際のAPIが利用可能になるまでは固定値で表示
  const baseUrl = '/rdf-portal-v2.github.io' || '';
  
  // データセット数を取得
  fetch(`${baseUrl}/assets/data/temp-datasets.txt`)
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Failed to fetch dataset count');
      }
      return response.text();
    })
    .then(function(text) {
      const datasetIds = text.trim().split('\n').filter(id => id.trim());
      const datasetCount = datasetIds.length;
      
      // エンドポイント数を取得（仮の値）
      const endpointCount = 5; // 実際のAPIが利用可能になったら更新
      
      loadingEl.style.display = 'none';
      contentEl.style.display = 'block';
      
      // 統計情報を表示
      document.getElementById('dataset-count').innerHTML = `
        <span class="u-text-lg u-fw-bold u-text-primary">${datasetCount}</span>
        <p class="u-text-sm u-text-muted">総データセット数</p>
      `;
      
      document.getElementById('endpoint-count').innerHTML = `
        <span class="u-text-lg u-fw-bold u-text-primary">${endpointCount}</span>
        <p class="u-text-sm u-text-muted">エンドポイント数</p>
      `;
      
      document.getElementById('last-update').innerHTML = `
        <span class="u-text-lg u-fw-bold u-text-primary">今日</span>
        <p class="u-text-sm u-text-muted">最終更新日</p>
      `;
      
      // 詳細統計
      document.getElementById('dataset-count-detail').textContent = datasetCount;
      document.getElementById('endpoint-count-detail').textContent = endpointCount;
    })
    .catch(function(error) {
      console.error('Error loading statistics:', error);
      loadingEl.style.display = 'none';
      errorEl.innerHTML = `
        <p>統計情報の読み込みに失敗しました。</p>
        <p>エラー: ${error.message}</p>
      `;
      errorEl.style.display = 'block';
    });
}
</script>
