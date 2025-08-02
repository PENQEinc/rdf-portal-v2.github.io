/**
 * DatasetLoader - データセット読み込み用シングルトンクラス
 * temp-datasets.jsonの読み込み処理を一元化し、キャッシュ機能を提供
 */

class DatasetLoader {
  // シングルトンインスタンス
  static #instance = null;

  // 定数
  static DATA_URL_PATH = "/assets/data/temp-datasets.json";
  static CACHE_DURATION = 5 * 60 * 1000; // 5分間キャッシュ

  // プライベートプロパティ
  #datasets = null;
  #cacheTimestamp = null;
  #loadingPromise = null;

  /**
   * プライベートコンストラクタ
   */
  constructor() {
    if (DatasetLoader.#instance) {
      throw new Error(
        "DatasetLoader is a singleton class. Use getInstance() instead."
      );
    }
  }

  /**
   * シングルトンインスタンスを取得
   * @returns {DatasetLoader} DatasetLoaderのインスタンス
   */
  static getInstance() {
    if (!DatasetLoader.#instance) {
      DatasetLoader.#instance = new DatasetLoader();
    }
    return DatasetLoader.#instance;
  }

  /**
   * データセットを読み込み（キャッシュ機能付き）
   * @param {Object} options - オプション設定
   * @param {boolean} options.forceReload - キャッシュを無視して強制的に再読み込み
   * @returns {Promise<Array>} データセット配列のPromise
   */
  async loadDatasets(options = {}) {
    const { forceReload = false } = options;

    // 強制再読み込みでない場合、キャッシュをチェック
    if (!forceReload && this.#isCacheValid()) {
      return this.#datasets;
    }

    // 既に読み込み中の場合は、その Promise を返す
    if (this.#loadingPromise) {
      return this.#loadingPromise;
    }

    // 新しい読み込み処理を開始
    this.#loadingPromise = this.#fetchDatasets();

    try {
      const datasets = await this.#loadingPromise;
      this.#datasets = datasets;
      this.#cacheTimestamp = Date.now();
      return datasets;
    } catch (error) {
      console.error("Failed to load datasets:", error);
      throw error;
    } finally {
      this.#loadingPromise = null;
    }
  }

  /**
   * データセットを指定のIDで検索
   * @param {string} id - データセットID
   * @returns {Promise<Object|null>} 見つかったデータセット、または null
   */
  async findDatasetById(id) {
    const datasets = await this.loadDatasets();
    return datasets.find((dataset) => dataset.id === id) || null;
  }

  /**
   * 複数のIDでデータセットを検索
   * @param {Array<string>} ids - データセットIDの配列
   * @returns {Promise<Array>} 見つかったデータセットの配列
   */
  async findDatasetsByIds(ids) {
    const datasets = await this.loadDatasets();
    const datasetMap = new Map(
      datasets.map((dataset) => [dataset.id, dataset])
    );

    return ids
      .map((id) => datasetMap.get(id))
      .filter((dataset) => dataset !== undefined);
  }

  /**
   * タグでデータセットをフィルタリング
   * @param {Array<string>} tags - フィルタリングするタグの配列
   * @param {boolean} matchAll - すべてのタグにマッチする必要があるか（デフォルト: false）
   * @returns {Promise<Array>} フィルタリングされたデータセット配列
   */
  async filterDatasetsByTags(tags, matchAll = false) {
    const datasets = await this.loadDatasets();

    return datasets.filter((dataset) => {
      if (!Array.isArray(dataset.tags)) return false;

      if (matchAll) {
        return tags.every((tag) => dataset.tags.includes(tag));
      } else {
        return tags.some((tag) => dataset.tags.includes(tag));
      }
    });
  }

  /**
   * キャッシュが有効かどうかをチェック
   * @returns {boolean} キャッシュが有効な場合 true
   */
  #isCacheValid() {
    if (!this.#datasets || !this.#cacheTimestamp) {
      return false;
    }

    const now = Date.now();
    return now - this.#cacheTimestamp < DatasetLoader.CACHE_DURATION;
  }

  /**
   * 実際のデータ取得処理
   * @returns {Promise<Array>} データセット配列
   */
  async #fetchDatasets() {
    const baseUrl = window.SITE_BASE_URL || "";
    const url = `${baseUrl}${DatasetLoader.DATA_URL_PATH}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const datasets = await response.json();

    if (!Array.isArray(datasets)) {
      throw new Error("Invalid data format: expected array");
    }

    return datasets;
  }

  /**
   * キャッシュをクリア
   */
  clearCache() {
    this.#datasets = null;
    this.#cacheTimestamp = null;
  }

  /**
   * キャッシュの状態を取得（デバッグ用）
   * @returns {Object} キャッシュ状態の情報
   */
  getCacheInfo() {
    return {
      hasCache: !!this.#datasets,
      cacheTimestamp: this.#cacheTimestamp,
      isValid: this.#isCacheValid(),
      datasetCount: this.#datasets ? this.#datasets.length : 0,
    };
  }

  /**
   * データセットの統計情報を取得
   * @returns {Promise<Object>} 統計情報
   */
  async getStatistics() {
    const datasets = await this.loadDatasets();

    const tagCounts = {};
    let totalDatasets = datasets.length;

    datasets.forEach((dataset) => {
      if (Array.isArray(dataset.tags)) {
        dataset.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    return {
      totalDatasets,
      tagCounts,
      mostCommonTags: Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count })),
    };
  }
}

// グローバルスコープに公開
window.DatasetLoader = DatasetLoader;
