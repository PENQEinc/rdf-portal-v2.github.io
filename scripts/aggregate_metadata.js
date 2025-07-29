#!/usr/bin/env node
/**
 * RDF Config リポジトリからメタデータを取得して、JSONファイルを生成するスクリプト
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// GitHub API の設定
const GITHUB_API_BASE = 'https://api.github.com';
const REPO_OWNER = 'dbcls';
const REPO_NAME = 'rdf-config';
const CONFIG_PATH = 'config';

/**
 * データセットIDリストを読み込む
 */
function getDatasetIds(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.split('\n').filter(line => line.trim().length > 0);
}

/**
 * HTTPSリクエストを行う
 */
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'RDF-Portal-Metadata-Aggregator'
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * 指定されたデータセットのmetadata.yamlを取得
 */
async function fetchMetadataYaml(datasetId) {
  const url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${CONFIG_PATH}/${datasetId}/metadata.yaml`;
  
  try {
    const response = await httpsGet(url);
    
    // Base64デコードしてYAMLを解析
    const content = Buffer.from(response.content, 'base64').toString('utf-8');
    return parseYaml(content);
  } catch (error) {
    console.log(`⚠️  ${datasetId}: metadata.yaml not found (${error.message})`);
    return null;
  }
}

/**
 * 簡単なYAMLパーサー（必要なフィールドのみ）
 */
function parseYaml(yamlContent) {
  const lines = yamlContent.split('\n');
  const result = {
    title: '',
    description: '',
    tags: []
  };
  
  let currentKey = null;
  let inTags = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('title:')) {
      result.title = trimmed.replace('title:', '').trim().replace(/^["']|["']$/g, '');
      inTags = false;
    } else if (trimmed.startsWith('description:')) {
      result.description = trimmed.replace('description:', '').trim().replace(/^["']|["']$/g, '');
      inTags = false;
    } else if (trimmed.startsWith('tags:')) {
      const tagsLine = trimmed.replace('tags:', '').trim();
      
      // Handle inline array format: tags: [item1, item2]
      if (tagsLine.startsWith('[') && tagsLine.endsWith(']')) {
        const tagsContent = tagsLine.slice(1, -1).trim();
        if (tagsContent) {
          result.tags = tagsContent.split(',').map(tag => tag.trim().replace(/^["']|["']$/g, ''));
        }
        inTags = false;
      } else if (tagsLine === '') {
        // Handle multiline array format
        inTags = true;
        result.tags = [];
      } else {
        inTags = false;
      }
    } else if (inTags && trimmed.startsWith('- ')) {
      const tag = trimmed.replace('- ', '').trim().replace(/^["']|["']$/g, '');
      if (tag) result.tags.push(tag);
    } else if (inTags && trimmed && !trimmed.startsWith(' ') && !trimmed.startsWith('-')) {
      inTags = false;
    }
  }
  
  return result;
}

/**
 * 必要なフィールドを抽出
 */
function extractRequiredFields(metadata) {
  if (!metadata) {
    return {
      title: '',
      description: '',
      tags: []
    };
  }
  
  return {
    title: metadata.title || '',
    description: metadata.description || '',
    tags: metadata.tags || []
  };
}

/**
 * メイン処理
 */
async function main() {
  try {
    // データセットIDを読み込み
    const datasetFile = path.join(__dirname, '../assets/data/temp-datasets.txt');
    const datasetIds = getDatasetIds(datasetFile);
    
    console.log(`📋 Processing ${datasetIds.length} datasets...`);
    
    // 各データセットのメタデータを取得
    const datasets = [];
    
    for (let i = 0; i < datasetIds.length; i++) {
      const datasetId = datasetIds[i];
      console.log(`📡 [${i + 1}/${datasetIds.length}] Fetching ${datasetId}...`);
      
      // GitHub API レート制限を考慮して少し待機
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const metadata = await fetchMetadataYaml(datasetId);
      const extracted = extractRequiredFields(metadata);
      
      const datasetInfo = {
        id: datasetId,
        ...extracted
      };
      
      datasets.push(datasetInfo);
      
      // 進捗表示
      if (extracted.title) {
        console.log(`✅ ${datasetId}: ${extracted.title}`);
      } else {
        console.log(`⭕ ${datasetId}: No metadata found`);
      }
    }
    
    // JSONファイルとして保存
    const outputFile = path.join(__dirname, '../assets/data/temp-datasets.json');
    const outputDir = path.dirname(outputFile);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputFile, JSON.stringify(datasets, null, 2), 'utf-8');
    
    console.log(`\n🎉 Generated ${outputFile}`);
    console.log(`📊 Total datasets: ${datasets.length}`);
    
    // 統計情報
    const withMetadata = datasets.filter(d => d.title).length;
    const withoutMetadata = datasets.length - withMetadata;
    
    console.log(`📈 With metadata: ${withMetadata}`);
    console.log(`📉 Without metadata: ${withoutMetadata}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main();
}
