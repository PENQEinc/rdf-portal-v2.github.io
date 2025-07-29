const fs = require('fs');
const https = require('https');

// 設定
const GITHUB_API_BASE = 'https://api.github.com';
const REPO_OWNER = 'dbcls';
const REPO_NAME = 'rdf-config';
const CONFIG_PATH = 'config';

// HTTPSリクエスト関数
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'RDF-Portal' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

// YAMLパーサー（簡易版）
function parseYaml(yamlContent) {
  const lines = yamlContent.split('\n');
  const result = { title: '', description: '', tags: [] };
  
  let inTags = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('title:')) {
      result.title = trimmed.replace('title:', '').trim();
      inTags = false;
    } else if (trimmed.startsWith('description:')) {
      result.description = trimmed.replace('description:', '').trim();
      inTags = false;
    } else if (trimmed.startsWith('tags:')) {
      inTags = true;
      // インライン配列の場合
      const inlineMatch = trimmed.match(/tags:\s*\[(.+)\]/);
      if (inlineMatch) {
        result.tags = inlineMatch[1].split(',').map(tag => tag.trim().replace(/['"]/g, ''));
        inTags = false;
      } else {
        result.tags = [];
      }
    } else if (inTags && trimmed.startsWith('- ')) {
      const tag = trimmed.replace('- ', '').trim().replace(/['"]/g, '');
      if (tag) result.tags.push(tag);
    } else if (inTags && trimmed && !trimmed.startsWith(' ') && !trimmed.startsWith('-')) {
      inTags = false;
    }
  }
  
  return result;
}

// メタデータ取得関数
async function fetchMetadata(datasetId) {
  const url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${CONFIG_PATH}/${datasetId}/metadata.yaml`;
  
  try {
    const response = await httpsGet(url);
    const content = Buffer.from(response.content, 'base64').toString('utf-8');
    return parseYaml(content);
  } catch (error) {
    console.log(`⚠️  ${datasetId}: metadata.yaml not found`);
    return null;
  }
}

// メイン処理
async function main() {
  console.log('🚀 Starting dataset metadata aggregation...');
  
  // データセットIDを読み込み（最初の10個をテスト）
  const datasetFile = './assets/data/temp-datasets.txt';
  const content = fs.readFileSync(datasetFile, 'utf-8');
  const allIds = content.split('\n').filter(line => line.trim().length > 0);
  const datasetIds = allIds.slice(0, 10); // 最初の10個でテスト
  
  console.log(`📊 Processing ${datasetIds.length} datasets...`);
  
  const datasets = [];
  
  for (let i = 0; i < datasetIds.length; i++) {
    const datasetId = datasetIds[i];
    console.log(`📡 [${i + 1}/${datasetIds.length}] Fetching ${datasetId}...`);
    
    const metadata = await fetchMetadata(datasetId);
    
    const datasetInfo = {
      id: datasetId,
      title: metadata?.title || '',
      description: metadata?.description || '',
      tags: metadata?.tags || []
    };
    
    datasets.push(datasetInfo);
    
    if (metadata?.title) {
      console.log(`✅ ${datasetId}: ${metadata.title}`);
    } else {
      console.log(`⭕ ${datasetId}: No metadata found`);
    }
    
    // レート制限対策で少し待機
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // JSONファイルとして保存
  const outputFile = './assets/data/datasets-sample.json';
  fs.writeFileSync(outputFile, JSON.stringify(datasets, null, 2), 'utf-8');
  
  console.log(`\n🎉 Generated ${outputFile}`);
  console.log(`📊 Total datasets: ${datasets.length}`);
  
  const withMetadata = datasets.filter(d => d.title).length;
  const withoutMetadata = datasets.length - withMetadata;
  
  console.log(`📈 With metadata: ${withMetadata}`);
  console.log(`📉 Without metadata: ${withoutMetadata}`);
}

main().catch(console.error);
