/**
 * Top page dataset tiles - データセットタイル表示
 */

class TopPageTilingDatasetsViewController {
  // 定数定義
  static TILE_SIZE = 300;
  static CONTAINER_SELECTOR = "#TopPageTilingDatasetsView > .container";
  static RESIZE_DEBOUNCE_DELAY = 150;

  // プライベートプロパティ
  #container;
  #datasets = [];
  #resizeTimeout;
  #datasetLoader;

  constructor() {
    this.#container = document.querySelector(
      TopPageTilingDatasetsViewController.CONTAINER_SELECTOR
    );
    this.#datasetLoader = DatasetsManager.getInstance();

    if (this.#container) {
      this.#init();
      this.#setupEventListeners();
    } else {
      console.error(
        `Container not found: ${TopPageTilingDatasetsViewController.CONTAINER_SELECTOR}`
      );
    }
  }

  #setupEventListeners() {
    // デバウンス付きリサイズハンドラー
    window.addEventListener("resize", () => {
      clearTimeout(this.#resizeTimeout);
      this.#resizeTimeout = setTimeout(
        () => this.#handleResize(),
        TopPageTilingDatasetsViewController.RESIZE_DEBOUNCE_DELAY
      );
    });
  }

  #handleResize() {
    if (this.#datasets.length > 0) {
      this.#displayDatasets(this.#datasets);
    }
  }

  async #init() {
    try {
      const data = await this.#datasetLoader.getDatasets();
      this.#datasets = data;

      if (data.length > 0) {
        this.#displayDatasets(data);
      }
    } catch (error) {
      console.error("データ読み込み失敗:", error);
    }
  }

  #displayDatasets(datasets) {
    this.#container.innerHTML = "";

    const { columns, rows, totalTiles } = this.#calculateGridLayout();

    for (let i = 0; i < totalTiles; i++) {
      const dataset = datasets[i % datasets.length];
      const tile = this.#createTile(dataset);

      const row = Math.floor(i / columns);
      const col = i % columns;
      const x = col * TopPageTilingDatasetsViewController.TILE_SIZE;
      const y = row * TopPageTilingDatasetsViewController.TILE_SIZE;

      tile.style.left = `${x}px`;
      tile.style.top = `${y}px`;

      this.#container.appendChild(tile);
    }
  }

  #calculateGridLayout() {
    const tileSize = TopPageTilingDatasetsViewController.TILE_SIZE;
    const columns = Math.ceil(window.innerWidth / tileSize);
    const rows = Math.ceil(window.innerHeight / tileSize);
    const totalTiles = columns * rows;

    return { columns, rows, totalTiles };
  }
  #createTile(dataset) {
    // DatasetCardクラスを使用
    const datasetCard = new DatasetCard(dataset, {
      showDescription: true,
      showFallbackDescription: true,
      customClasses: [], // 必要に応じて追加のクラスを指定
    });

    const tile = datasetCard.getElement();

    // 既存のスタイル設定（位置指定など）を維持
    return tile;
  }
}

// DOM読み込み完了後に初期化
document.addEventListener("DOMContentLoaded", () => {
  new TopPageTilingDatasetsViewController();
});
