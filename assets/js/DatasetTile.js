/**
 * DatasetTile Component - データセットタイルコンポーネント
 * 各ページで使用される dataset-tile の統一されたJavaScriptクラス
 */

class DatasetTile {
  // 定数定義
  static TILE_CLASS = 'dataset-tile';
  static TITLE_CLASS = 'title';
  static DESCRIPTION_CLASS = 'description';
  static TAGS_CLASS = 'tags';
  static TAG_CLASS = 'tag';
  static LINK_CLASS = 'link';
  static DEFAULT_FALLBACK_TITLE = 'Unknown Dataset';
  static DEFAULT_FALLBACK_DESCRIPTION = 'No description available';

  // プライベートフィールド
  #dataset;
  #options;
  #element;

  /**
   * コンストラクタ
   * @param {Object} dataset - データセット情報
   * @param {Object} options - オプション設定
   */
  constructor(dataset, options = {}) {
    this.#dataset = dataset;
    this.#options = {
      showLink: options.showLink || false,
      showTags: options.showTags || false,
      showDescription: options.showDescription !== false, // デフォルトはtrue
      linkBaseUrl: options.linkBaseUrl || '',
      customClasses: options.customClasses || [],
      onClick: options.onClick || null,
      ...options
    };

    this.#element = this.#createElement();
  }

  /**
   * DOM要素を作成
   * @returns {HTMLElement} 作成されたタイル要素
   */
  #createElement() {
    const tile = document.createElement('div');

    // クラス名を設定
    const classes = [DatasetTile.TILE_CLASS, ...this.#options.customClasses];
    tile.className = classes.join(' ');

    // データ属性を設定
    if (this.#dataset.id) {
      tile.dataset.datasetId = this.#dataset.id;
    }

    // コンテンツを生成
    tile.innerHTML = this.#generateContent();

    // イベントリスナーを設定
    this.#setupEventListeners(tile);

    return tile;
  }

  /**
   * タイルのHTMLコンテンツを生成
   * @returns {string} HTML文字列
   */
  #generateContent() {
    const title = this.#getTitle();
    const description = this.#getDescription();
    const tags = this.#getTags();

    let content = '';

    // タイトル部分
    if (this.#options.showLink && this.#dataset.id) {
      const linkUrl = `${this.#options.linkBaseUrl}/dataset/?id=${this.#dataset.id}`;
      content += `<h3 class="${DatasetTile.TITLE_CLASS}">
        <a href="${linkUrl}" class="${DatasetTile.LINK_CLASS}">${title}</a>
      </h3>`;
    } else {
      content += `<div class="${DatasetTile.TITLE_CLASS}">${title}</div>`;
    }

    // 説明文部分
    if (this.#options.showDescription && description) {
      content += `<div class="${DatasetTile.DESCRIPTION_CLASS}">${description}</div>`;
    }

    // タグ部分
    if (this.#options.showTags && tags.length > 0) {
      const tagsHtml = tags.map(tag =>
        `<span class="${DatasetTile.TAG_CLASS}">${this.#escapeHtml(tag)}</span>`
      ).join('');
      content += `<div class="${DatasetTile.TAGS_CLASS}">${tagsHtml}</div>`;
    }

    return content;
  }

  /**
   * タイトルを取得（フォールバック付き）
   * @returns {string} タイトル
   */
  #getTitle() {
    return this.#dataset.title ||
      this.#dataset.id ||
      DatasetTile.DEFAULT_FALLBACK_TITLE;
  }

  /**
   * 説明文を取得（フォールバック付き）
   * @returns {string} 説明文
   */
  #getDescription() {
    if (!this.#options.showDescription) return '';

    return this.#dataset.description ||
      (this.#options.showFallbackDescription ? DatasetTile.DEFAULT_FALLBACK_DESCRIPTION : '');
  }

  /**
   * タグ配列を取得
   * @returns {Array} タグの配列
   */
  #getTags() {
    return Array.isArray(this.#dataset.tags) ? this.#dataset.tags : [];
  }

  /**
   * HTMLエスケープ
   * @param {string} text - エスケープするテキスト
   * @returns {string} エスケープされたテキスト
   */
  #escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * イベントリスナーを設定
   * @param {HTMLElement} element - 対象要素
   */
  #setupEventListeners(element) {
    if (typeof this.#options.onClick === 'function') {
      element.addEventListener('click', (event) => {
        event.preventDefault();
        this.#options.onClick(this.#dataset, event);
      });
      element.style.cursor = 'pointer';
    }
  }

  /**
   * DOM要素を取得（必要な場合のみ公開）
   * @returns {HTMLElement} タイル要素
   */
  getElement() {
    return this.#element;
  }

  /**
   * タイルを指定のコンテナに追加
   * @param {HTMLElement} container - 追加先のコンテナ
   */
  appendTo(container) {
    container.appendChild(this.#element);
  }

  /**
   * タイルのデータを更新
   * @param {Object} newDataset - 新しいデータセット情報
   */
  updateData(newDataset) {
    this.#dataset = { ...this.#dataset, ...newDataset };
    this.#element.innerHTML = this.#generateContent();

    // データ属性も更新
    if (this.#dataset.id) {
      this.#element.dataset.datasetId = this.#dataset.id;
    }
  }

  /**
   * タイルを削除
   */
  remove() {
    if (this.#element.parentNode) {
      this.#element.parentNode.removeChild(this.#element);
    }
  }

  /**
   * 複数のタイルを一括生成
   * @param {Array} datasets - データセット配列
   * @param {Object} options - オプション設定
   * @returns {Array} DatasetTileインスタンスの配列
   */
  static createMultiple(datasets, options = {}) {
    return datasets.map(dataset => new DatasetTile(dataset, options));
  }

  /**
   * 複数のタイルを指定のコンテナに一括追加
   * @param {Array} datasets - データセット配列
   * @param {HTMLElement} container - 追加先のコンテナ
   * @param {Object} options - オプション設定
   * @returns {Array} 作成されたDatasetTileインスタンスの配列
   */
  static renderMultiple(datasets, container, options = {}) {
    // コンテナをクリア
    container.innerHTML = '';

    // タイルを作成して追加
    const tiles = DatasetTile.createMultiple(datasets, options);
    tiles.forEach(tile => {
      tile.appendTo(container);
    });

    return tiles;
  }
}

// グローバルスコープに公開
window.DatasetTile = DatasetTile;
