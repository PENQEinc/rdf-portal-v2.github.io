/**
 * Top page dataset tiles - データ読み込みテスト
 */

class TopPageTilingDatasetsViewController {
  constructor() {
    this.container = document.querySelector(
      "#TopPageTilingDatasetsView .dataset-tiles"
    );

    if (this.container) {
      this.init();
    } else {
      console.error(
        "Container not found: #TopPageTilingDatasetsView .dataset-tiles"
      );
    }
  }

  async init() {
    try {
      const data = await this.loadDatasetsData();

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

    // 最初の10件を表示
    datasets.forEach((dataset, index) => {
      const tile = this.createTile(dataset, index);
      this.container.appendChild(tile);
    });
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
