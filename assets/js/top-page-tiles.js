/**
 * Top page dataset tiles background implementation
 * Stage 2: Dynamic data integration from temp-datasets.json
 * RSCSS Convention: Project component with PascalCase ID
 */

class TopTilingBackgroundController {
  constructor() {
    this.container = document.querySelector('#TopTilingBackground .dataset-tiles');
    this.datasetsData = [];
    
    // レスポンシブなタイル数の調整
    this.tileCount = this.calculateTileCount();
    this.animationSpeed = 20; // アニメーション速度（秒）
    
    if (this.container) {
      this.init();
    }
    
    // ウィンドウリサイズ時の再計算
    window.addEventListener('resize', () => this.handleResize());
  }
  
  calculateTileCount() {
    const screenArea = window.innerWidth * window.innerHeight;
    const tileArea = 120 * 80; // タイルのサイズ
    const density = 0.15; // タイル密度（15%）
    
    const maxTiles = Math.floor((screenArea * density) / tileArea);
    return Math.min(Math.max(maxTiles, 15), 40); // 15〜40個の範囲
  }
  
  handleResize() {
    // リサイズ時は再生成を避けて、既存タイルの位置のみ調整
    const newTileCount = this.calculateTileCount();
    if (Math.abs(newTileCount - this.tileCount) > 5) {
      this.tileCount = newTileCount;
      this.container.innerHTML = '';
      if (this.datasetsData.length > 0) {
        this.createDynamicTiles();
      } else {
        this.createStaticTiles();
      }
    }
  }
  
  async init() {
    // ローディング状態を表示
    this.showLoadingState();
    
    try {
      await this.loadDatasetsData();
      this.hideLoadingState();
      this.createDynamicTiles();
      console.log(`データセット情報を読み込み完了: ${this.datasetsData.length}件`);
    } catch (error) {
      this.hideLoadingState();
      console.warn('データセット情報の読み込みに失敗しました。静的なタイルを表示します。', error);
      this.createStaticTiles();
    }
  }
  
  showLoadingState() {
    this.container.innerHTML = '<div class="loading-message">データセット情報を読み込み中...</div>';
  }
  
  hideLoadingState() {
    this.container.innerHTML = '';
  }
  
  async loadDatasetsData() {
    const response = await fetch('/rdf-portal-v2.github.io/assets/data/temp-datasets.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    this.datasetsData = await response.json();
  }
  
  createDynamicTiles() {
    // メタデータがあるデータセットを優先的に使用
    const datasetsWithMetadata = this.datasetsData.filter(dataset => 
      dataset.title && dataset.description
    );
    
    // メタデータがないデータセットも一部含める
    const datasetsWithoutMetadata = this.datasetsData.filter(dataset => 
      !dataset.title || !dataset.description
    );
    
    // 混合してバラエティに富んだ表示にする
    const mixedDatasets = [
      ...datasetsWithMetadata,
      ...datasetsWithoutMetadata.slice(0, 10)
    ];
    
    for (let i = 0; i < this.tileCount; i++) {
      const dataset = mixedDatasets[i % mixedDatasets.length];
      const tile = this.createTile(dataset, i, true);
      this.container.appendChild(tile);
    }
  }
  
  createStaticTiles() {
    // Stage 1の静的なサンプルデータでタイルを生成（フォールバック）
    const sampleTiles = [
      { title: 'UniProt', description: 'Protein sequence and annotation data' },
      { title: 'ChEMBL', description: 'Bioactive drug-like small molecules' },
      { title: 'PubChem', description: 'Chemical substances and compounds' },
      { title: 'KEGG', description: 'Biological pathways and systems' },
      { title: 'GO Terms', description: 'Gene Ontology annotations' },
      { title: 'Reactome', description: 'Biological pathway knowledge' },
      { title: 'DrugBank', description: 'Drug and drug target database' },
      { title: 'OMIM', description: 'Human genes and genetic disorders' },
      { title: 'DisGeNET', description: 'Genes and diseases associations' },
      { title: 'STRING', description: 'Protein-protein interactions' },
      { title: 'PDB', description: '3D structures of proteins' },
      { title: 'Ensembl', description: 'Genome annotation and analysis' },
      { title: 'HGNC', description: 'Human gene nomenclature' },
      { title: 'RefSeq', description: 'Reference sequence database' },
      { title: 'ClinVar', description: 'Clinical significance of variants' },
      { title: 'PharmGKB', description: 'Pharmacogenomics knowledge' },
      { title: 'MONDO', description: 'Disease ontology' },
      { title: 'ChEBI', description: 'Chemical entities of biological interest' },
      { title: 'NCBI Gene', description: 'Gene-specific information' },
      { title: 'OrthoDB', description: 'Orthologous genes across species' }
    ];
    
    for (let i = 0; i < this.tileCount; i++) {
      const tileData = sampleTiles[i % sampleTiles.length];
      const tile = this.createTile(tileData, i, false);
      this.container.appendChild(tile);
    }
  }
  
  createTile(data, index, isDynamic = false) {
    const tile = document.createElement('div');
    tile.className = 'dataset-tile';
    
    // データセットの種類によって視覚的な違いを追加
    if (isDynamic) {
      if (data.title && data.description) {
        tile.classList.add('is-complete');
      } else {
        tile.classList.add('is-placeholder');
      }
      
      // クリック可能にする
      tile.style.cursor = 'pointer';
      tile.addEventListener('click', () => this.handleTileClick(data));
    }
    
    // ランダムな位置に配置（より広範囲に）
    const x = Math.random() * Math.max(window.innerWidth - 120, 800);
    const y = Math.random() * Math.max(window.innerHeight - 80, 600);
    const delay = Math.random() * this.animationSpeed;
    const scale = 0.8 + Math.random() * 0.4; // ランダムなスケール
    
    tile.style.left = `${x}px`;
    tile.style.top = `${y}px`;
    tile.style.animationDelay = `${delay}s`;
    tile.style.animationDuration = `${this.animationSpeed}s`;
    tile.style.transform = `scale(${scale})`;
    
    // タイルの内容を設定
    const title = data.title || data.id || 'Unknown Dataset';
    const description = data.description || 'No description available';
    
    tile.innerHTML = `
      <div class="title">${title}</div>
      <div class="description">${description}</div>
      ${data.tags && data.tags.length > 0 ? `<div class="tags">${data.tags.slice(0, 2).join(', ')}</div>` : ''}
    `;
    
    return tile;
  }
  
  handleTileClick(dataset) {
    // データセット詳細ページへ遷移
    const detailUrl = `/rdf-portal-v2.github.io/dataset/?id=${dataset.id}`;
    window.open(detailUrl, '_blank');
  }
}

// DOM読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', () => {
  new TopTilingBackgroundController();
});
