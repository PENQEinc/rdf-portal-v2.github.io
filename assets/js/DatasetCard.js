/**
 * DatasetCard Component - データセットカードコンポーネント
 * 各ページで使用される dataset-card の統一されたJavaScriptクラス
 */

class DatasetCard {
  // 定数定義
  static CARD_CLASS = "dataset-card";
  static TITLE_CLASS = "title";
  static DESCRIPTION_CLASS = "description";
  static TAGS_CLASS = "tags";
  static TAG_CLASS = "tag";
  static LINK_CLASS = "link";

  // デフォルト値
  static DEFAULTS = {
    FALLBACK_TITLE: "Unknown Dataset",
    FALLBACK_DESCRIPTION: "No description available",
    OPTIONS: {
      showLink: false,
      showTags: false,
      showDescription: true,
      showFallbackDescription: false,
      linkBaseUrl: "",
      customClasses: [],
      onClick: null,
    },
  };

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
    this.#options = { ...DatasetCard.DEFAULTS.OPTIONS, ...options };
    this.#element = this.#createElement();
  }

  /**
   * DOM要素を作成
   * @returns {HTMLElement} 作成されたカード要素
   */
  #createElement() {
    const card = document.createElement("div");

    // 基本属性を設定
    card.className = [
      DatasetCard.CARD_CLASS,
      ...this.#options.customClasses,
    ].join(" ");

    if (this.#dataset.id) {
      card.dataset.datasetId = this.#dataset.id;
    }

    // コンテンツを生成して設定
    card.innerHTML = this.#generateContent();

    // イベントリスナーを設定
    this.#setupEventListeners(card);

    return card;
  }

  /**
   * カードのHTMLコンテンツを生成
   * @returns {string} HTML文字列
   */
  #generateContent() {
    const parts = [
      this.#generateTitle(),
      this.#generateDescription(),
      this.#generateTags(),
    ].filter(Boolean);

    return parts.join("");
  }

  /**
   * タイトル部分のHTMLを生成
   * @returns {string} タイトルHTML
   */
  #generateTitle() {
    const title = this.#getTitle();

    if (this.#options.showLink && this.#dataset.id) {
      const linkUrl = `${this.#options.linkBaseUrl}/dataset/?id=${
        this.#dataset.id
      }`;
      return `<h3 class="${DatasetCard.TITLE_CLASS}">
        <a href="${linkUrl}" class="${DatasetCard.LINK_CLASS}">${title}</a>
      </h3>`;
    }

    return `<div class="${DatasetCard.TITLE_CLASS}">${title}</div>`;
  }

  /**
   * 説明文部分のHTMLを生成
   * @returns {string} 説明文HTML
   */
  #generateDescription() {
    if (!this.#options.showDescription) return "";

    const description = this.#getDescription();
    return description
      ? `<div class="${DatasetCard.DESCRIPTION_CLASS}">${description}</div>`
      : "";
  }

  /**
   * タグ部分のHTMLを生成
   * @returns {string} タグHTML
   */
  #generateTags() {
    if (!this.#options.showTags) return "";

    const tags = this.#getTags();
    if (tags.length === 0) return "";

    const tagsHtml = this.#generateTagsHtml(tags);
    return `<div class="${DatasetCard.TAGS_CLASS}">${tagsHtml}</div>`;
  }

  /**
   * タイトルを取得（フォールバック付き）
   * @returns {string} タイトル
   */
  #getTitle() {
    return (
      this.#dataset.title ||
      this.#dataset.id ||
      DatasetCard.DEFAULTS.FALLBACK_TITLE
    );
  }

  /**
   * 説明文を取得（フォールバック付き）
   * @returns {string} 説明文
   */
  #getDescription() {
    return (
      this.#dataset.description ||
      (this.#options.showFallbackDescription
        ? DatasetCard.DEFAULTS.FALLBACK_DESCRIPTION
        : "")
    );
  }

  /**
   * タグ配列を取得
   * @returns {Array} タグの配列
   */
  #getTags() {
    // 色付きタグ情報がある場合はそれを優先
    if (Array.isArray(this.#dataset.tagsWithColors)) {
      return this.#dataset.tagsWithColors;
    }
    // 従来の文字列タグ配列の場合
    return Array.isArray(this.#dataset.tags) ? this.#dataset.tags : [];
  }

  /**
   * タグのHTMLを生成
   * @param {Array} tags - タグの配列
   * @returns {string} タグのHTML文字列
   */
  #generateTagsHtml(tags) {
    return tags
      .map((tag) => this.#generateSingleTagHtml(tag))
      .filter(Boolean)
      .join("");
  }

  /**
   * 単一タグのHTMLを生成
   * @param {string|Object} tag - タグ（文字列またはオブジェクト）
   * @returns {string} タグHTML
   */
  #generateSingleTagHtml(tag) {
    if (typeof tag === "string") {
      return `<span class="${
        DatasetCard.TAG_CLASS
      }" data-tag="${this.#escapeHtml(tag)}">${this.#escapeHtml(tag)}</span>`;
    }

    if (typeof tag === "object" && tag.id) {
      const tagText = this.#getTagDisplayText(tag);
      return `<span class="${
        DatasetCard.TAG_CLASS
      }" data-tag="${this.#escapeHtml(tag.id)}">${this.#escapeHtml(
        tagText
      )}</span>`;
    }

    return "";
  }

  /**
   * タグの表示テキストを取得
   * @param {Object} tag - タグオブジェクト
   * @returns {string} 表示テキスト
   */
  #getTagDisplayText(tag) {
    if (!tag.label) return tag.id;

    const lang = document.documentElement.lang || "ja";
    return tag.label[lang] || tag.label.ja || tag.label.en || tag.id;
  }

  /**
   * 背景色に対するコントラスト色を計算
   * @param {string} backgroundColor - 背景色（#付き16進数）
   * @returns {string} コントラスト色（white または black）
   */
  #getContrastColor(backgroundColor) {
    if (!backgroundColor || !backgroundColor.startsWith("#")) {
      return "black";
    }

    // RGB値を抽出
    const hex = backgroundColor.substring(1);
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // 輝度を計算（ITU-R BT.709）
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // 輝度が0.5以上なら黒文字、未満なら白文字
    return luminance > 0.5 ? "black" : "white";
  }

  /**
   * HTMLをエスケープ
   * @param {string} text - エスケープするテキスト
   * @returns {string} エスケープされたテキスト
   */
  #escapeHtml(text) {
    if (typeof text !== "string") return "";

    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /**
   * 文字列を切り詰める
   * @param {string} str - 切り詰める文字列
   * @param {number} maxLength - 最大長
   * @returns {string} 切り詰められた文字列
   */
  #truncateString(str, maxLength) {
    if (!str || typeof str !== "string") return "";
    return str.length <= maxLength ? str : str.slice(0, maxLength) + "...";
  }

  /**
   * URLが有効かチェック
   * @param {string} url - チェックするURL
   * @returns {boolean} 有効な場合true
   */
  #isValidUrl(url) {
    if (!url || typeof url !== "string") return false;

    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * イベントリスナーを設定
   * @param {HTMLElement} element - 対象要素
   */
  #setupEventListeners(element) {
    if (typeof this.#options.onClick === "function") {
      element.addEventListener("click", (event) => {
        event.preventDefault();
        this.#options.onClick(this.#dataset, event);
      });
      element.style.cursor = "pointer";
    }
  }

  /**
   * DOM要素を取得（必要な場合のみ公開）
   * @returns {HTMLElement} カード要素
   */
  getElement() {
    return this.#element;
  }

  /**
   * カードを指定のコンテナに追加
   * @param {HTMLElement} container - 追加先のコンテナ
   */
  appendTo(container) {
    container.appendChild(this.#element);
  }

  /**
   * カードのデータを更新
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
   * カードを削除
   */
  remove() {
    if (this.#element.parentNode) {
      this.#element.parentNode.removeChild(this.#element);
    }
  }

  /**
   * 複数のカードを一括生成（DocumentFragmentを使用）
   * @param {Array} datasets - データセット配列
   * @param {Object} options - オプション設定
   * @returns {DocumentFragment} カード要素群を含むフラグメント
   */
  static createCards(datasets, options = {}) {
    const fragment = document.createDocumentFragment();

    if (!Array.isArray(datasets)) {
      console.warn("DatasetCard.createCards: datasets should be an array");
      return fragment;
    }

    datasets.forEach((dataset) => {
      const card = new DatasetCard(dataset, options);
      const element = card.render();
      if (element) fragment.appendChild(element);
    });

    return fragment;
  }

  /**
   * 指定された要素にデータセットカードを描画
   * @param {Element} container - 描画先のコンテナ要素
   * @param {Array} datasets - データセット配列
   * @param {Object} options - 描画オプション
   */
  static renderToContainer(container, datasets, options = {}) {
    if (!container || typeof container.appendChild !== "function") {
      console.error("DatasetCard.renderToContainer: Invalid container element");
      return;
    }

    const fragment = DatasetCard.createCards(datasets, options);
    container.appendChild(fragment);
  }

  /**
   * 複数のカードを一括生成（従来の方式）
   * @param {Array} datasets - データセット配列
   * @param {Object} options - オプション設定
   * @returns {Array} DatasetCardインスタンスの配列
   */
  static createMultiple(datasets, options = {}) {
    return datasets.map((dataset) => new DatasetCard(dataset, options));
  }

  /**
   * 複数のカードを指定のコンテナに一括追加
   * @param {Array} datasets - データセット配列
   * @param {HTMLElement} container - 追加先のコンテナ
   * @param {Object} options - オプション設定
   * @returns {Array} 作成されたDatasetCardインスタンスの配列
   */
  static renderMultiple(datasets, container, options = {}) {
    // コンテナをクリア
    container.innerHTML = "";

    // カードを作成して追加
    const cards = DatasetCard.createMultiple(datasets, options);
    cards.forEach((card) => {
      card.appendTo(container);
    });

    return cards;
  }
}

// グローバルスコープに公開
window.DatasetCard = DatasetCard;
