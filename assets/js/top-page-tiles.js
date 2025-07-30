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
    console.log("初期化開始");

    try {
      const data = await this.loadDatasetsData();
      console.log("データ読み込み成功:", data);
      console.log("データ件数:", data.length);

      // 最初の3件をログ出力
      if (data.length > 0) {
        console.log("最初の3件のデータ:");
        data.slice(0, 3).forEach((dataset, index) => {
          console.log(`${index + 1}:`, dataset);
        });
      }
    } catch (error) {
      console.error("データ読み込み失敗:", error);
    }
  }

  async loadDatasetsData() {
    const baseUrl = window.SITE_BASE_URL || "";
    const url = `${baseUrl}/assets/data/temp-datasets.json`;

    console.log("読み込み先URL:", url);

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
