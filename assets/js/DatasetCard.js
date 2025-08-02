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
  static DEFAULT_FALLBACK_TITLE = "Unknown Dataset";
  static DEFAULT_FALLBACK_DESCRIPTION = "No description available";

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
      linkBaseUrl: options.linkBaseUrl || "",
      customClasses: options.customClasses || [],
      onClick: options.onClick || null,
      ...options,
    };

    this.#element = this.#createElement();
  }

  /**
   * DOM要素を作成
   * @returns {HTMLElement} 作成されたカード要素
   */
  #createElement() {
    const card = document.createElement("div");

    // クラス名を設定
    const classes = [DatasetCard.CARD_CLASS, ...this.#options.customClasses];
    card.className = classes.join(" ");

    // データ属性を設定
    if (this.#dataset.id) {
      card.dataset.datasetId = this.#dataset.id;
    }

    // コンテンツを生成
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
    const title = this.#getTitle();
    const description = this.#getDescription();
    const tags = this.#getTags();

    let content = "";

    // タイトル部分
    if (this.#options.showLink && this.#dataset.id) {
      const linkUrl = `${this.#options.linkBaseUrl}/dataset/?id=${
        this.#dataset.id
      }`;
      content += `<h3 class="${DatasetCard.TITLE_CLASS}">
        <a href="${linkUrl}" class="${DatasetCard.LINK_CLASS}">${title}</a>
      </h3>`;
    } else {
      content += `<div class="${DatasetCard.TITLE_CLASS}">${title}</div>`;
    }

    // 説明文部分
    if (this.#options.showDescription && description) {
      content += `<div class="${DatasetCard.DESCRIPTION_CLASS}">${description}</div>`;
    }

    // タグ部分
    if (this.#options.showTags && tags.length > 0) {
      const tagsHtml = this.#generateTagsHtml(tags);
      content += `<div class="${DatasetCard.TAGS_CLASS}">${tagsHtml}</div>`;
    }

    return content;
  }

  /**
   * タイトルを取得（フォールバック付き）
   * @returns {string} タイトル
   */
  #getTitle() {
    return (
      this.#dataset.title ||
      this.#dataset.id ||
      DatasetCard.DEFAULT_FALLBACK_TITLE
    );
  }

  /**
   * 説明文を取得（フォールバック付き）
   * @returns {string} 説明文
   */
  #getDescription() {
    if (!this.#options.showDescription) return "";

    return (
      this.#dataset.description ||
      (this.#options.showFallbackDescription
        ? DatasetCard.DEFAULT_FALLBACK_DESCRIPTION
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
      .map((tag) => {
        if (typeof tag === "string") {
          // 従来の文字列タグの場合 - DatasetLoaderから色を取得
          const datasetLoader = DatasetLoader.getInstance();
          const color = datasetLoader.getTagColor(tag);
          const style = `style="background-color: ${color}; color: ${this.#getContrastColor(
            color
          )};"`;
          return `<span class="${
            DatasetCard.TAG_CLASS
          }" ${style}>${this.#escapeHtml(tag)}</span>`;
        } else if (typeof tag === "object" && tag.id) {
          // 色付きタグオブジェクトの場合
          const tagText = this.#getTagDisplayText(tag);
          const style = tag.color
            ? `style="background-color: ${
                tag.color
              }; color: ${this.#getContrastColor(tag.color)};"`
            : "";
          return `<span class="${
            DatasetCard.TAG_CLASS
          }" ${style}>${this.#escapeHtml(tagText)}</span>`;
        }
        return "";
      })
      .join("");
  }

  /**
   * タグの表示テキストを取得
   * @param {Object} tag - タグオブジェクト
   * @returns {string} 表示テキスト
   */
  #getTagDisplayText(tag) {
    // 言語設定に基づいてラベルを選択（日本語優先）
    if (tag.label) {
      const lang = document.documentElement.lang || "ja";
      return tag.label[lang] || tag.label.ja || tag.label.en || tag.id;
    }
    return tag.id;
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
   * HTMLエスケープ
   * @param {string} text - エスケープするテキスト
   * @returns {string} エスケープされたテキスト
   */
  #escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
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
   * 複数のカードを一括生成
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
