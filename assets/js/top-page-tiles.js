/**
 * Top page dataset tiles background implementation
 * Stage 3: Visual enhancements with parallax and advanced animations
 * RSCSS Convention: Project component with PascalCase ID
 */

class TopTilingBackgroundController {
  constructor() {
    this.container = document.querySelector('#TopTilingBackground .dataset-tiles');
    this.datasetsData = [];

    console.log('TopTilingBackground: container found?', !!this.container);

    // レスポンシブなタイル数の調整
    this.tileCount = this.calculateTileCount();
    this.animationSpeed = 20; // アニメーション速度（秒）

    // Stage 3: パフォーマンス設定
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.lastScrollY = 0;
    this.ticking = false;

    if (this.container) {
      this.init();
    }

    // ウィンドウリサイズ時の再計算
    window.addEventListener('resize', () => this.handleResize());

    // Stage 3: パララックス効果の設定
    if (!this.isReducedMotion) {
      this.initParallax();
    }
  }

  calculateTileCount() {
    const screenArea = window.innerWidth * window.innerHeight;
    const tileArea = 130 * 90; // Stage 3: 更新されたタイルサイズ
    const density = window.innerWidth > 768 ? 0.18 : 0.12; // レスポンシブ密度

    const maxTiles = Math.floor((screenArea * density) / tileArea);
    return Math.min(Math.max(maxTiles, 12), 50); // 12〜50個の範囲
  }

  handleResize() {
    // リサイズ時は再生成を避けて、既存タイルの位置のみ調整
    const newTileCount = this.calculateTileCount();
    if (Math.abs(newTileCount - this.tileCount) > 8) {
      this.tileCount = newTileCount;
      this.container.innerHTML = '';
      if (this.datasetsData.length > 0) {
        this.createDynamicTiles();
      } else {
        this.createStaticTiles();
      }
    }
  }

  // Stage 3: パララックス効果の初期化
  initParallax() {
    window.addEventListener('scroll', () => this.requestTick());
    document.body.classList.add('has-parallax');
  }

  requestTick() {
    if (!this.ticking) {
      requestAnimationFrame(() => this.updateParallax());
      this.ticking = true;
    }
  }

  updateParallax() {
    const scrollY = window.pageYOffset;
    const parallaxOffset = scrollY * 0.5; // パララックス係数

    document.documentElement.style.setProperty('--parallax-offset', `${parallaxOffset}px`);

    this.lastScrollY = scrollY;
    this.ticking = false;
  }

  // Stage 3: 初期化の最適化
  async init() {
    // ローディング状態を表示
    this.showLoadingState();

    try {
      await this.loadDatasetsData();
      this.hideLoadingState();
      this.createDynamicTiles();

      // パフォーマンス最適化とアクセシビリティ向上を遅延実行
      setTimeout(() => {
        this.optimizePerformance();
        this.enhanceAccessibility();
      }, 1000);

      console.log(`データセット情報を読み込み完了: ${this.datasetsData.length}件`);
    } catch (error) {
      this.hideLoadingState();
      console.warn('データセット情報の読み込みに失敗しました。静的なタイルを表示します。', error);
      this.createStaticTiles();

      // 静的タイルでもアクセシビリティを向上
      setTimeout(() => this.enhanceAccessibility(), 500);
    }
  }

  showLoadingState() {
    this.container.innerHTML = '<div class="loading-message">データセット情報を読み込み中...</div>';
  }

  hideLoadingState() {
    this.container.innerHTML = '';
  }

  async loadDatasetsData() {
    const baseUrl = window.SITE_BASE_URL || '';
    const response = await fetch(`${baseUrl}/assets/data/temp-datasets.json`);
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
      ...datasetsWithoutMetadata.slice(0, 15)
    ];

    // Stage 3: 段階的にタイルを生成（より美しい表示）
    mixedDatasets.slice(0, this.tileCount).forEach((dataset, i) => {
      setTimeout(() => {
        const tile = this.createTile(dataset, i, true);
        this.container.appendChild(tile);

        // Stage 3: 入場アニメーション
        if (!this.isReducedMotion) {
          tile.classList.add('is-entering');
        }
      }, i * 50); // 50msずつ遅延して生成
    });
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

      // Stage 3: ホバー時の追加効果
      tile.addEventListener('mouseenter', () => this.handleTileHover(tile, true));
      tile.addEventListener('mouseleave', () => this.handleTileHover(tile, false));
    }

    // Stage 3: より自然な配置計算
    const margin = 20;
    const tileWidth = window.innerWidth > 768 ? 130 : (window.innerWidth > 480 ? 90 : 75);
    const tileHeight = window.innerWidth > 768 ? 90 : (window.innerWidth > 480 ? 70 : 55);

    const maxX = Math.max(window.innerWidth - tileWidth - margin, tileWidth);
    const maxY = Math.max(window.innerHeight - tileHeight - margin, tileHeight);

    const x = margin + Math.random() * (maxX - margin);
    const y = margin + Math.random() * (maxY - margin);

    // Stage 3: より豊かなアニメーション設定
    const delay = Math.random() * this.animationSpeed;
    const duration = this.animationSpeed + (Math.random() - 0.5) * 5; // ± 2.5秒の変動
    const scale = 0.8 + Math.random() * 0.4; // ランダムなスケール

    tile.style.left = `${x}px`;
    tile.style.top = `${y}px`;

    if (!this.isReducedMotion) {
      tile.style.animationDelay = `${delay}s`;
      tile.style.animationDuration = `${duration}s`;
      tile.style.transform = `scale(${scale})`;
    }

    // タイルの内容を設定
    const title = data.title || data.id || 'Unknown Dataset';
    const description = data.description || 'No description available';

    // Stage 3: より豊富な情報表示
    const tagsHtml = data.tags && data.tags.length > 0
      ? `<div class="tags">${data.tags.slice(0, 2).join(', ')}</div>`
      : '';

    tile.innerHTML = `
      <div class="title">${title}</div>
      <div class="description">${description}</div>
      ${tagsHtml}
    `;

    return tile;
  }

  // Stage 3: ホバー効果の追加処理
  handleTileHover(tile, isHovering) {
    if (this.isReducedMotion) return;

    if (isHovering) {
      // 周囲のタイルを少し動かす効果
      const siblings = Array.from(this.container.children);
      const tileRect = tile.getBoundingClientRect();

      siblings.forEach(sibling => {
        if (sibling === tile) return;

        const siblingRect = sibling.getBoundingClientRect();
        const distance = Math.sqrt(
          Math.pow(tileRect.left - siblingRect.left, 2) +
          Math.pow(tileRect.top - siblingRect.top, 2)
        );

        if (distance < 200) {
          const force = Math.max(0, 1 - distance / 200);
          const angle = Math.atan2(
            siblingRect.top - tileRect.top,
            siblingRect.left - tileRect.left
          );

          const offsetX = Math.cos(angle) * force * 10;
          const offsetY = Math.sin(angle) * force * 10;

          sibling.style.transform += ` translate(${offsetX}px, ${offsetY}px)`;
        }
      });
    } else {
      // ホバー終了時にリセット
      setTimeout(() => {
        const siblings = Array.from(this.container.children);
        siblings.forEach(sibling => {
          if (sibling !== tile) {
            sibling.style.transform = sibling.style.transform.replace(/translate\([^)]*\)/g, '');
          }
        });
      }, 300);
    }
  }

  handleTileClick(dataset) {
    // データセット詳細ページへ遷移
    const baseUrl = window.SITE_BASE_URL || '';
    const detailUrl = `${baseUrl}/dataset/?id=${dataset.id}`;
    window.open(detailUrl, '_blank');
  }

  // Stage 3: パフォーマンス最適化
  optimizePerformance() {
    // Intersection Observer でビューポート外のタイルのアニメーションを停止
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
        } else {
          entry.target.style.animationPlayState = 'paused';
        }
      });
    }, {
      rootMargin: '50px'
    });

    // 全てのタイルを監視対象に追加
    const tiles = this.container.querySelectorAll('.dataset-tile');
    tiles.forEach(tile => observer.observe(tile));
  }

  // Stage 3: アクセシビリティ向上
  enhanceAccessibility() {
    const tiles = this.container.querySelectorAll('.dataset-tile[style*="cursor: pointer"]');

    tiles.forEach((tile, index) => {
      // キーボードナビゲーション対応
      tile.setAttribute('tabindex', '0');
      tile.setAttribute('role', 'button');
      tile.setAttribute('aria-label', `データセット: ${tile.querySelector('.title').textContent}`);

      // キーボードイベント
      tile.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          tile.click();
        }
      });

      // フォーカス表示の改善
      tile.addEventListener('focus', () => {
        tile.style.outline = '2px solid #007bff';
        tile.style.outlineOffset = '2px';
      });

      tile.addEventListener('blur', () => {
        tile.style.outline = 'none';
      });
    });
  }
}

// DOM読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', () => {
  new TopTilingBackgroundController();
});
