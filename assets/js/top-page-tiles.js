/**
 * Top page dataset tiles - データセットタイル表示
 */

class TopPageTilingDatasetsViewController {
  // 定数定義
  static TILE_SIZE = 300;
  static CONTAINER_SELECTOR = "#TopPageTilingDatasetsView > .container";
  static DATA_URL_PATH = "/assets/data/temp-datasets.json";
  static TILE_CLASS = "dataset-tile";
  static TITLE_CLASS = "title";
  static DESCRIPTION_CLASS = "description";
  static DEFAULT_FALLBACK_TITLE = "Unknown Dataset";
  static DEFAULT_FALLBACK_DESCRIPTION = "No description available";
  static RESIZE_DEBOUNCE_DELAY = 150;

  // プライベートプロパティ
  #container;
  #datasets = [];
  #resizeTimeout;

  constructor() {
    this.#container = document.querySelector(
      TopPageTilingDatasetsViewController.CONTAINER_SELECTOR
    );

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
      const data = await this.#loadDatasetsData();
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
    const tile = document.createElement("div");
    tile.className = TopPageTilingDatasetsViewController.TILE_CLASS;

    // タイトルと説明を取得（フォールバック付き）
    const title =
      dataset.title ||
      dataset.id ||
      TopPageTilingDatasetsViewController.DEFAULT_FALLBACK_TITLE;
    const description =
      dataset.description ||
      TopPageTilingDatasetsViewController.DEFAULT_FALLBACK_DESCRIPTION;

    // HTML構造を作成
    tile.innerHTML = `
      <div class="${TopPageTilingDatasetsViewController.TITLE_CLASS}">${title}</div>
      <div class="${TopPageTilingDatasetsViewController.DESCRIPTION_CLASS}">${description}</div>
    `;

    return tile;
  }

  async #loadDatasetsData() {
    const baseUrl = window.SITE_BASE_URL || "";
    const url = `${baseUrl}${TopPageTilingDatasetsViewController.DATA_URL_PATH}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }
}

// DOM読み込み完了後に初期化
document.addEventListener("DOMContentLoaded", () => {
  new TopPageTilingDatasetsViewController();
});
