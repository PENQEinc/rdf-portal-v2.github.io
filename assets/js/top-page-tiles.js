/**
 * Top page dataset tiles - データ読み込みテスト
 */

class TopPageTilingDatasetsViewController {
  constructor() {
    this.container = document.querySelector(
      "#TopPageTilingDatasetsView > .container"
    );
    this.datasets = []; // データセットを保存

    if (this.container) {
      this.init();
      // ウィンドウリサイズ時の再描画
      window.addEventListener("resize", () => this.handleResize());
    } else {
      console.error(
        "Container not found: #TopPageTilingDatasetsView > .container"
      );
    }
  }

  handleResize() {
    if (this.datasets.length > 0) {
      console.log("ウィンドウリサイズ - タイル再配置");
      this.displayDatasets(this.datasets);
    }
  }

  async init() {
    try {
      const data = await this.loadDatasetsData();
      this.datasets = data; // データを保存

      // 最初の3件をログ出力
      if (data.length > 0) {
        // データを画面に表示
        this.displayDatasets(data);
      }
    } catch (error) {
      console.error("データ読み込み失敗:", error);
    }
  }

  displayDatasets(datasets) {
    // コンテナをクリア
    this.container.innerHTML = "";

    // ウィンドウサイズに応じて必要なタイル数を計算
    const { columns, rows, totalTiles } = this.calculateGridLayout();
    console.log(`表示するタイル数: ${totalTiles} (${columns}列 x ${rows}行)`);

    // 必要な数だけタイルを表示（データが足りない場合は繰り返し）
    for (let i = 0; i < totalTiles; i++) {
      const dataset = datasets[i % datasets.length];
      const tile = this.createTile(dataset, i);

      // グリッド位置を計算
      const row = Math.floor(i / columns);
      const col = i % columns;
      const x = col * 300;
      const y = row * 300;

      // 座標を設定
      tile.style.left = `${x}px`;
      tile.style.top = `${y}px`;

      this.container.appendChild(tile);
    }
  }

  calculateGridLayout() {
    const tileSize = 300;

    // ウィンドウサイズから必要な列数と行数を計算（はみ出るように）
    const columns = Math.ceil(window.innerWidth / tileSize);
    const rows = Math.ceil(window.innerHeight / tileSize);
    const totalTiles = columns * rows;

    console.log(`ウィンドウサイズ: ${window.innerWidth}x${window.innerHeight}`);
    console.log(`グリッド: ${columns}列 x ${rows}行`);

    return { columns, rows, totalTiles };
  }

  createTile(dataset) {
    const tile = document.createElement("div");
    tile.className = "dataset-tile";

    // タイトルと説明を取得（フォールバック付き）
    const title = dataset.title || dataset.id;
    const description = dataset.description || "No description available";

    // HTML構造を作成
    tile.innerHTML = `
      <div class="title">${title}</div>
      <div class="description">${description}</div>
    `;

    return tile;
  }

  async loadDatasetsData() {
    const baseUrl = window.SITE_BASE_URL || "";
    const url = `${baseUrl}/assets/data/temp-datasets.json`;

    const response = await fetch(url);
    console.log("レスポンス状態:", response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }
}

// DOM読み込み完了後に初期化
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM読み込み完了 - TopPageTilingDatasetsViewController初期化");
  new TopPageTilingDatasetsViewController();
});
