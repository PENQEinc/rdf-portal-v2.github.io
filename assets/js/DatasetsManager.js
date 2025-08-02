/**
 * DatasetsManager - データセット管理用シングルトンクラス
 * temp-datasets.jsonの読み込み処理を一元化し、キャッシュ、検索、統計機能を提供
 */

class DatasetsManager {
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
    if (DatasetsManager.#instance) {
      throw new Error(
        "DatasetsManager is a singleton class. Use getInstance() instead."
      );
    }
  }

  /**
   * シングルトンインスタンスを取得
   * @returns {DatasetsManager} DatasetsManagerのインスタンス
   */
  static getInstance() {
    if (!DatasetsManager.#instance) {
      DatasetsManager.#instance = new DatasetsManager();
    }
    return DatasetsManager.#instance;
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
   * データセット配列を取得（タグに色情報を付加）
   * @returns {Promise<Array>} 色情報付きのデータセット配列
   */
  async getDatasets() {
    const datasets = await this.loadDatasets();

    return datasets.map((dataset) => {
      if (!Array.isArray(dataset.tags)) {
        return dataset;
      }

      const tagsWithColors = dataset.tags.map((tagId) => {
        return {
          id: tagId,
          color: this.getTagColor(tagId),
          label: { en: tagId, ja: tagId },
        };
      });

      return {
        ...dataset,
        tagsWithColors,
      };
    });
  }

  /**
   * 指定したタグIDの色を取得（ハッシュベース）
   * @param {string} tagId - タグID
   * @returns {string} タグの色（#付きの16進数）
   */
  getTagColor(tagId) {
    return this.#generateHashBasedColor(tagId);
  }

  /**
   * 複数のタグIDに対して色を一括取得
   * @param {Array<string>} tagIds - タグIDの配列
   * @returns {Map<string, string>} タグIDをキー、色を値とするMap
   */
  getTagColors(tagIds) {
    const colorMap = new Map();

    tagIds.forEach((tagId) => {
      colorMap.set(tagId, this.getTagColor(tagId));
    });

    return colorMap;
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
    return now - this.#cacheTimestamp < DatasetsManager.CACHE_DURATION;
  }

  /**
   * 実際のデータ取得処理
   * @returns {Promise<Array>} データセット配列
   */
  async #fetchDatasets() {
    const baseUrl = window.SITE_BASE_URL || "";
    const url = `${baseUrl}${DatasetsManager.DATA_URL_PATH}`;

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

  /**
   * タグIDからハッシュベースの色を生成
   * @param {string} tagId - タグID
   * @returns {string} 生成された色（#付きの16進数）
   */
  #generateHashBasedColor(tagId) {
    // タグIDから一意な色を生成（ハッシュベース）
    let hash = 0;
    for (let i = 0; i < tagId.length; i++) {
      const char = tagId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 32bit整数に変換
    }

    // HSLを使用して適度に明るく飽和した色を生成
    const hue = Math.abs(hash) % 360;
    const saturation = 60 + (Math.abs(hash) % 30); // 60-90%
    const lightness = 45 + (Math.abs(hash) % 20); // 45-65%

    return this.#hslToHex(hue, saturation, lightness);
  }

  /**
   * HSL色をHEX色に変換
   * @param {number} h - 色相 (0-360)
   * @param {number} s - 彩度 (0-100)
   * @param {number} l - 明度 (0-100)
   * @returns {string} HEX色文字列
   */
  #hslToHex(h, s, l) {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }
}

// グローバルスコープに公開
window.DatasetsManager = DatasetsManager;
