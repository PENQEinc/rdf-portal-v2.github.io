---
layout: page
title: Dataset Details
description: データセットの詳細情報を表示します
permalink: /dataset-old/
---

<div id="loading" class="loading">
  <p>データセット情報を読み込み中...</p>
</div>

<div id="error" class="error" style="display: none;">
  <p>データセットの読み込みに失敗しました。</p>
</div>

<div id="dataset-details" class="dataset-details" style="display: none;">
  <!-- データセット詳細がここに動的に生成されます -->
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  loadDatasetDetails();
});

async function loadDatasetDetails() {
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const detailsEl = document.getElementById('dataset-details');

  // URLパラメータからデータセットIDを取得
  const urlParams = new URLSearchParams(window.location.search);
  const datasetId = urlParams.get('id');

  if (!datasetId) {
    loadingEl.style.display = 'none';
    const baseUrl = '{{ site.baseurl }}' || '';
    errorEl.innerHTML = `<p>データセットIDが指定されていません。</p><p><a href="${baseUrl}/datasets/">データセット一覧に戻る</a></p>`;
    errorEl.style.display = 'block';
    return;
  }

  try {
    // GitHubからメタデータを取得
    const metadataUrl = `https://raw.githubusercontent.com/dbcls/rdf-config/master/config/${datasetId}/metadata.yaml`;
    const response = await fetch(metadataUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status}`);
    }

    const yamlText = await response.text();
    const metadata = parseSimpleYaml(yamlText);

    loadingEl.style.display = 'none';
    renderDatasetDetails(datasetId, metadata, yamlText);
    detailsEl.style.display = 'block';

    // ページタイトルを更新
    document.title = `${metadata.title || datasetId} - RDF Portal`;

  } catch (error) {
    console.error('Error loading dataset details:', error);
    loadingEl.style.display = 'none';
    const baseUrl = '{{ site.baseurl }}' || '';
    errorEl.innerHTML = `
      <p>データセットの読み込みに失敗しました。</p>
      <p>エラー: ${error.message}</p>
      <p><a href="${baseUrl}/datasets/">データセット一覧に戻る</a></p>
    `;
    errorEl.style.display = 'block';
  }
}

function parseSimpleYaml(yamlText) {
  const metadata = {};
  const lines = yamlText.split('\n');
  let currentKey = null;
  let currentValue = '';
  let inMultiline = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Handle array items
    if (trimmed.startsWith('- ')) {
      if (currentKey) {
        if (!metadata[currentKey]) metadata[currentKey] = [];
        const arrayItem = trimmed.substring(2).trim();
        if (Array.isArray(metadata[currentKey])) {
          metadata[currentKey].push(arrayItem);
        }
      }
      continue;
    }

    // Handle key-value pairs
    const match = trimmed.match(/^(\w+):\s*(.*)$/);
    if (match) {
      const [, key, value] = match;

      if (currentKey && inMultiline) {
        metadata[currentKey] = currentValue.trim();
      }

      currentKey = key;
      currentValue = value.replace(/^["'](.*)["']$/, '$1'); // Remove quotes
      inMultiline = false;

      // Check if this is a multiline value or array
      if (!value.trim() || value.trim() === '[' || value.trim() === '{') {
        inMultiline = true;
        currentValue = '';
      } else if (value.includes('[') && value.includes(']')) {
        // Handle inline arrays
        const arrayMatch = value.match(/\[(.*)\]/);
        if (arrayMatch) {
          metadata[currentKey] = arrayMatch[1].split(',').map(item => item.trim().replace(/^["'](.*)["']$/, '$1'));
        } else {
          metadata[currentKey] = currentValue;
        }
        currentKey = null;
      } else {
        metadata[currentKey] = currentValue;
        currentKey = null;
      }
    } else if (inMultiline && currentKey) {
      // Handle multiline values
      currentValue += (currentValue ? ' ' : '') + trimmed;
    }
  }

  // Handle last key if multiline
  if (currentKey && inMultiline) {
    metadata[currentKey] = currentValue.trim();
  }

  return metadata;
}

function renderDatasetDetails(datasetId, metadata, rawYaml) {
  const detailsEl = document.getElementById('dataset-details');
  const baseUrl = '{{ site.baseurl }}' || '';

  const html = `
    <a href="${baseUrl}/datasets/" class="back-link">データセット一覧に戻る</a>

    <div class="dataset-header">
      <h1>${metadata.title || datasetId}</h1>
      <div class="dataset-id">ID: ${datasetId}</div>
    </div>

    ${metadata.description ? `
    <div class="metadata-section">
      <h3>説明</h3>
      <p>${metadata.description}</p>
    </div>
    ` : ''}

    <div class="metadata-section">
      <h3>基本情報</h3>
      <div class="metadata-grid">
        ${renderMetadataItem('ウェブサイト', metadata.website, 'link')}
        ${renderMetadataItem('SPARQL Endpoint', metadata.sparql, 'link')}
        ${renderMetadataItem('VoID', metadata.void, 'link')}
        ${renderMetadataItem('ライセンス', metadata.licenses)}
        ${renderMetadataItem('提供者', metadata.provider)}
        ${renderMetadataItem('作成日', metadata.issued)}
        ${renderMetadataItem('更新日', metadata.updated)}
        ${renderMetadataItem('バージョン', metadata.version)}
      </div>
    </div>

    ${metadata.tags ? `
    <div class="metadata-section">
      <h3>タグ</h3>
      ${renderMetadataItem('', metadata.tags, 'tags')}
    </div>
    ` : ''}

    <div class="metadata-section">
      <h3>リンク</h3>
      <div class="metadata-grid">
        ${renderMetadataItem('設定ファイル', `https://github.com/dbcls/rdf-config/tree/master/config/${datasetId}`, 'link')}
        ${renderMetadataItem('メタデータファイル', `https://github.com/dbcls/rdf-config/blob/master/config/${datasetId}/metadata.yaml`, 'link')}
      </div>
    </div>

    <div class="expandable-section">
      <button class="expand-toggle" onclick="toggleRawMetadata()">
        生のメタデータを表示
      </button>
      <div id="raw-metadata" class="raw-metadata" style="display: none;">
        ${escapeHtml(rawYaml)}
      </div>
    </div>
  `;

  detailsEl.innerHTML = html;
}

function renderMetadataItem(label, value, type = 'text') {
  if (!value) return '';

  let valueHtml;
  if (Array.isArray(value)) {
    if (type === 'tags') {
      valueHtml = `<div class="tags">${value.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>`;
    } else {
      valueHtml = value.map(item => escapeHtml(item)).join(', ');
    }
  } else if (type === 'link') {
    valueHtml = `<a href="${value}" target="_blank">${value}</a>`;
  } else {
    valueHtml = escapeHtml(value);
  }

  return `
    <div class="metadata-item">
      <div class="metadata-label">${label}</div>
      <div class="metadata-value">${valueHtml}</div>
    </div>
  `;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function toggleRawMetadata() {
  const rawMetadata = document.getElementById('raw-metadata');
  const button = document.querySelector('.expand-toggle');

  if (rawMetadata.style.display === 'none') {
    rawMetadata.style.display = 'block';
    button.textContent = '生のメタデータを隠す';
  } else {
    rawMetadata.style.display = 'none';
    button.textContent = '生のメタデータを表示';
  }
}
</script>
