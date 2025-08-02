/**
 * DatasetsManager - データセット管理用シングルトンクラス
 * temp-datasets.jsonの読み込み処理を一元化し、キャッシュ機能とタグ色生成を提供
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
   * データセットを指定のIDで検索
   * @param {string} id - データセットID
   * @returns {Promise<Object|null>} 見つかったデータセット、または null
   */
  async findDatasetById(id) {
    const datasets = await this.loadDatasets();
    return datasets.find((dataset) => dataset.id === id) || null;
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
