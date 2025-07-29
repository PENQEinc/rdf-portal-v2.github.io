/**
 * Top page dataset tiles background implementation
 * Stage 1: Basic static tiles layout
 * RSCSS Convention: Project component with PascalCase ID
 */

class TopTilingBackgroundController {
  constructor() {
    this.container = document.querySelector('#TopTilingBackground .dataset-tiles');
    this.tileCount = 20; // 初期段階では固定数
    
    if (this.container) {
      this.init();
    }
  }
  
  init() {
    this.createStaticTiles();
  }
  
  createStaticTiles() {
    // Stage 1: 固定のサンプルデータでタイルを生成
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
      const tile = this.createTile(tileData, i);
      this.container.appendChild(tile);
    }
  }
  
  createTile(data, index) {
    const tile = document.createElement('div');
    tile.className = 'dataset-tile';
    
    // ランダムな位置に配置
    const x = Math.random() * (window.innerWidth - 120);
    const y = Math.random() * (window.innerHeight - 80);
    const delay = Math.random() * 15; // アニメーション遅延
    
    tile.style.left = `${x}px`;
    tile.style.top = `${y}px`;
    tile.style.animationDelay = `${delay}s`;
    
    tile.innerHTML = `
      <div class="title">${data.title}</div>
      <div class="description">${data.description}</div>
    `;
    
    return tile;
  }
}

// DOM読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', () => {
  new TopTilingBackgroundController();
});
