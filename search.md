---
layout: default
title: Search
description: データセットとエンドポイントの検索機能
permalink: /search/
---

<div class="p-hero">
  <h1 class="p-hero__title">検索</h1>
  <p class="p-hero__description">キーワードやタグを使って、データセットやエンドポイントを検索できます。</p>
</div>

<div class="c-card u-mb-lg">
  <h3 class="c-card__title">データセット・エンドポイント検索</h3>
  <div class="c-card__content">
    <form id="search-form" class="u-mb-md">
      <div class="u-mb-md">
        <label for="search-query" class="u-fw-medium u-d-block u-mb-sm">検索キーワード</label>
        <input 
          type="text" 
          id="search-query" 
          class="u-w-100 u-p-md" 
          placeholder="データセット名、説明、タグなどを入力..." 
          style="border: 1px solid #dee2e6; border-radius: 4px;"
        >
      </div>
      
      <div class="u-mb-md">
        <label class="u-fw-medium u-d-block u-mb-sm">検索対象</label>
        <div class="u-d-flex u-gap-md">
          <label class="u-d-flex u-align-items-center">
            <input type="checkbox" id="search-datasets" checked class="u-mr-sm">
            データセット
          </label>
          <label class="u-d-flex u-align-items-center">
            <input type="checkbox" id="search-endpoints" checked class="u-mr-sm">
            エンドポイント
          </label>
        </div>
      </div>
      
      <div class="u-d-flex u-gap-md">
        <button type="submit" class="c-btn c-btn--primary">検索</button>
        <button type="button" id="clear-search" class="c-btn c-btn--secondary">クリア</button>
      </div>
    </form>
  </div>
</div>

<div id="search-loading" class="p-loading" style="display: none;">
  <p>検索中...</p>
</div>

<div id="search-results" style="display: none;">
  <div class="c-card">
    <h3 class="c-card__title">検索結果</h3>
    <div id="results-content" class="c-card__content">
      <!-- 検索結果がここに表示されます -->
    </div>
  </div>
</div>

<div id="no-results" class="p-error" style="display: none;">
  <p>検索条件に一致するデータが見つかりませんでした。</p>
</div>

<div class="c-card-grid u-mt-lg">
  <div class="c-card">
    <h3 class="c-card__title">検索機能について</h3>
    <div class="c-card__content">
      <h4 class="u-mb-md">現在の機能</h4>
      <ul class="u-mb-md">
        <li>キーワード検索（部分一致）</li>
        <li>データセット名での検索</li>
        <li>基本的なフィルタリング</li>
      </ul>
      
      <h4 class="u-mb-md">今後追加予定の機能</h4>
      <ul>
        <li>高度な検索オプション</li>
        <li>SPARQL検索</li>
        <li>タグによる絞り込み</li>
        <li>ファセット検索</li>
      </ul>
    </div>
  </div>

  <div class="c-card">
    <h3 class="c-card__title">検索のヒント</h3>
    <div class="c-card__content">
      <ul>
        <li>部分的なキーワードでも検索できます</li>
        <li>複数のキーワードはスペースで区切ってください</li>
        <li>英語・日本語どちらでも検索可能です</li>
        <li>大文字・小文字は区別されません</li>
      </ul>
    </div>
  </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const searchForm = document.getElementById('search-form');
  const clearButton = document.getElementById('clear-search');
  const searchQuery = document.getElementById('search-query');
  const searchDatasets = document.getElementById('search-datasets');
  const searchEndpoints = document.getElementById('search-endpoints');
  
  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    performSearch();
  });
  
  clearButton.addEventListener('click', function() {
    searchQuery.value = '';
    document.getElementById('search-results').style.display = 'none';
    document.getElementById('no-results').style.display = 'none';
  });
  
  function performSearch() {
    const query = searchQuery.value.trim();
    if (!query) {
      alert('検索キーワードを入力してください。');
      return;
    }
    
    const loadingEl = document.getElementById('search-loading');
    const resultsEl = document.getElementById('search-results');
    const noResultsEl = document.getElementById('no-results');
    const resultsContent = document.getElementById('results-content');
    
    // 結果をクリア
    resultsEl.style.display = 'none';
    noResultsEl.style.display = 'none';
    loadingEl.style.display = 'block';
    
    // 実際の検索実装（仮の実装）
    const baseUrl = '/rdf-portal-v2.github.io' || '';
    
    Promise.all([
      searchDatasets.checked ? searchInDatasets(query, baseUrl) : Promise.resolve([]),
      searchEndpoints.checked ? searchInEndpoints(query, baseUrl) : Promise.resolve([])
    ]).then(function(results) {
      const [datasetResults, endpointResults] = results;
      const allResults = [...datasetResults, ...endpointResults];
      
      loadingEl.style.display = 'none';
      
      if (allResults.length === 0) {
        noResultsEl.style.display = 'block';
      } else {
        displaySearchResults(allResults, resultsContent);
        resultsEl.style.display = 'block';
      }
    }).catch(function(error) {
      console.error('Search error:', error);
      loadingEl.style.display = 'none';
      noResultsEl.innerHTML = '<p>検索中にエラーが発生しました。</p>';
      noResultsEl.style.display = 'block';
    });
  }
  
  function searchInDatasets(query, baseUrl) {
    return fetch(`${baseUrl}/assets/data/temp-datasets.txt`)
      .then(response => response.text())
      .then(text => {
        const datasetIds = text.trim().split('\n').filter(id => id.trim());
        return datasetIds
          .filter(id => id.toLowerCase().includes(query.toLowerCase()))
          .map(id => ({
            type: 'dataset',
            id: id,
            title: id,
            url: `${baseUrl}/dataset/?id=${id}`
          }));
      });
  }
  
  function searchInEndpoints(query, baseUrl) {
    // 仮のエンドポイントデータで検索
    const endpoints = [
      { id: 'endpoint1', title: 'Example Endpoint 1' },
      { id: 'endpoint2', title: 'Example Endpoint 2' }
    ];
    
    return Promise.resolve(
      endpoints
        .filter(endpoint => 
          endpoint.title.toLowerCase().includes(query.toLowerCase()) ||
          endpoint.id.toLowerCase().includes(query.toLowerCase())
        )
        .map(endpoint => ({
          type: 'endpoint',
          id: endpoint.id,
          title: endpoint.title,
          url: `${baseUrl}/endpoints/#${endpoint.id}`
        }))
    );
  }
  
  function displaySearchResults(results, container) {
    const html = `
      <p class="u-mb-md"><strong>${results.length}件</strong>の結果が見つかりました。</p>
      <div class="c-card-grid">
        ${results.map(result => `
          <div class="c-card">
            <h4 class="c-card__title">
              <a href="${result.url}">${result.title}</a>
            </h4>
            <div class="c-card__content">
              <span class="u-text-sm u-text-muted">
                ${result.type === 'dataset' ? 'データセット' : 'エンドポイント'}
              </span>
              <p class="u-mt-sm">
                <a href="${result.url}" class="c-btn c-btn--outline-primary">詳細を見る →</a>
              </p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    container.innerHTML = html;
  }
});
</script>
