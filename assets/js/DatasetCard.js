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
      showIcon: true, // 花弁型アイコン表示
      iconSize: 48, // CSS表示サイズ(px)
      iconRendering: "svgOverlap", // 'svgOverlap' | 'canvasFloral'
    },
  };

  // SVGオーバーラップ花弁アイコン用パラメータ（調整しやすいようにまとめ）
  static SVG_OVERLAP_PARAMS = {
    MAX_PETALS: 10, // 表示する最大花弁数（超過は切り捨て）
    DISTRIBUTION_SPAN_DEG: 70, // 花弁全体を左右に広げる目標角度幅（タグ数>1時）
    MAX_SINGLE_STEP_DEG: 28, // 隣接花弁の最大角度間隔（詰まり防止）
    SCALE: 0.82, // 全体スケール（SVG viewBox 内での余白調整）
    APEX_Y: 78, // 花弁の一番下（先端）Y座標
    PETAL_TOP_Y: 10, // 花弁上部Y（中心側）
    PETAL_CTRL_TOP_Y: 20, // 上部ベジェ制御点Y
    PETAL_CTRL_LOW_Y: 55, // 下部ベジェ制御点Y
    PETAL_CTRL_X: 32, // ベジェ制御点X（左右対称）
    GRAD_LIGHTEN_L: 5, // グラデ上部の明度補正 (+L)
    GRAD_OPACITY_START: 1.0, // 上端不透明度
    GRAD_OPACITY_END: 0.0, // 下端不透明度
    USE_RANDOM_ID: true, // <defs> gradient id に乱数サフィックス付与
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

    // アイコンCanvas描画 (DOM挿入後に描画)
    try {
      this.#renderIconIfNeeded(card);
    } catch (e) {
      console.warn("DatasetCard icon render failed", e);
    }

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
      this.#generateHeader(),
      this.#generateDescription(),
      this.#generateTags(),
    ].filter(Boolean);
    return parts.join("");
  }
  /**
   * ヘッダー(アイコン+タイトル)生成
   */
  #generateHeader() {
    const size = this.#options.iconSize || 48;
    const P = DatasetCard.SVG_OVERLAP_PARAMS;
    const tags = this.#extractTagStrings(this.#getTags());
    if (tags.length === 0) {
      return `<svg class="dataset-card__icon" width="${size}" height="${size}" viewBox="0 0 100 100" role="img" aria-label="No tags"><circle cx="50" cy="50" r="46" fill="#e2e8f0"/></svg>`;
    }
    const limited = tags.slice(0, P.MAX_PETALS);
    const n = limited.length;
    const gradients = [];
    const petals = [];
    // 角度配置: n==1 は 0°, それ以外は span を (n-1) 分割
    const span = Math.min(
      P.DISTRIBUTION_SPAN_DEG,
      P.MAX_SINGLE_STEP_DEG * (n - 1)
    );
    const step = n === 1 ? 0 : span / (n - 1);
    const start = -span / 2;
    // 花弁パス（ベジェティアドロップ）
    const path = `M0 ${P.APEX_Y} C ${P.PETAL_CTRL_X} ${P.PETAL_CTRL_LOW_Y}, ${P.PETAL_CTRL_X} ${P.PETAL_CTRL_TOP_Y}, 0 ${P.PETAL_TOP_Y} C -${P.PETAL_CTRL_X} ${P.PETAL_CTRL_TOP_Y}, -${P.PETAL_CTRL_X} ${P.PETAL_CTRL_LOW_Y}, 0 ${P.APEX_Y}Z`;
    limited.forEach((tag, i) => {
      const angle = start + step * i;
      const colorHsl = this.#colorForTag(tag);
      const { h, s, l } = this.#parseHsl(colorHsl);
      const topHex = this.#hslToHex(h, s, Math.min(100, l + P.GRAD_LIGHTEN_L));
      const idBase = `g_${Math.abs(this.#hashString(tag))}_${i}`;
      const id = P.USE_RANDOM_ID
        ? `${idBase}_${Math.floor(Math.random() * 1e5)}`
        : idBase;
      gradients.push(`<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${topHex}" stop-opacity="${P.GRAD_OPACITY_START}"/>
        <stop offset="100%" stop-color="${topHex}" stop-opacity="${P.GRAD_OPACITY_END}"/>
      </linearGradient>`);
      petals.push(
        `<path d="${path}" fill="url(#${id})" transform="rotate(${angle} 0 ${P.APEX_Y})" style="mix-blend-mode:multiply"/>`
      );
    });
    return `<svg class="dataset-card__icon dataset-card__icon--svg" width="${size}" height="${size}" viewBox="-50 0 100 100" role="img" aria-label="Tags: ${this.#escapeHtml(
      limited.join(", ")
    )}"><defs>${gradients.join("")}</defs><g transform="scale(${
      P.SCALE
    }) translate(0,-4)">${petals.join("")}</g></svg>`;
  }

  /**
   * Canvasアイコン描画実行
   * @param {HTMLElement} card
   */
  #renderIconIfNeeded(card) {
    if (!this.#options.showIcon) return;
    if (this.#options.iconRendering === "svgOverlap") return; // SVGは静的
    const canvas = card.querySelector("canvas.dataset-card__icon");
    if (!canvas) return; // 他レンダリング
    const tags = this.#extractTagStrings(this.#getTags());
    this.#drawFlowerIcon(canvas, tags);
  }

  /**
   * タグ配列から文字列配列へ統一
   */
  #extractTagStrings(rawTags) {
    if (!Array.isArray(rawTags)) return [];
    return rawTags
      .map((t) => {
        if (typeof t === "string") return t;
        if (t && typeof t === "object") return t.id || "";
        return "";
      })
      .filter(Boolean);
  }

  /**
   * 花弁型アイコン描画
   * @param {HTMLCanvasElement} canvas
   * @param {string[]} tags
   */
  #drawFlowerIcon(canvas, tags) {
    const displaySize = this.#options.iconSize || 48;
    const dpr = window.devicePixelRatio || 1;
    // 高解像度描画: 内部解像度
    const base = 256; // 設計ベース
    canvas.width = base * dpr; // 物理解像度
    canvas.height = base * dpr;
    canvas.style.width = displaySize + "px";
    canvas.style.height = displaySize + "px";

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr); // Retinaスケール

    // 背景クリア
    ctx.clearRect(0, 0, base, base);

    const centerX = base / 2;
    const centerY = base / 2;
    const petalCount = Math.min(tags.length, 10); // 最大10花弁
    const extraCount = tags.length - petalCount;

    // 0タグ→グレー単色円
    if (tags.length === 0) {
      const grd = ctx.createRadialGradient(
        centerX - 10,
        centerY - 10,
        10,
        centerX,
        centerY,
        120
      );
      grd.addColorStop(0, "#f5f5f5");
      grd.addColorStop(1, "#c7c7c7");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    // ソート（安定：タグ文字列昇順）
    const sorted = [...tags].sort((a, b) => a.localeCompare(b, "en"));
    const petals = sorted.slice(0, petalCount);

    // ペタル形状パラメータ
    const innerR = 46; // 中心部開始半径
    const petalLen = 80; // 長さ
    const petalWidth = 46; // 幅

    // 背景の淡いグロウ
    const bgGrad = ctx.createRadialGradient(
      centerX,
      centerY,
      10,
      centerX,
      centerY,
      140
    );
    bgGrad.addColorStop(0, "rgba(255,255,255,0.9)");
    bgGrad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 140, 0, Math.PI * 2);
    ctx.fill();

    // 各花弁描画
    petals.forEach((tag, i) => {
      const angle = (Math.PI * 2 * i) / petalCount;
      const col = this.#colorForTag(tag);
      this.#drawPetal(
        ctx,
        centerX,
        centerY,
        angle,
        innerR,
        petalLen,
        petalWidth,
        col
      );
    });

    // 中心コア
    const mainColor = this.#colorForTag(petals[0]);
    this.#drawCore(ctx, centerX, centerY, 52, mainColor);

    // 追加タグ +n 表示
    if (extraCount > 0) {
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.beginPath();
      ctx.arc(centerX, centerY, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#333";
      ctx.font = "bold 60px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("+" + extraCount, centerX, centerY + 4);
    }

    // ハイライトリング
    const highlight = ctx.createRadialGradient(
      centerX,
      centerY,
      30,
      centerX,
      centerY,
      120
    );
    highlight.addColorStop(0, "rgba(255,255,255,0.0)");
    highlight.addColorStop(1, "rgba(0,0,0,0.15)");
    ctx.strokeStyle = highlight;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 120, 0, Math.PI * 2);
    ctx.stroke();

    // 透明フォールバック検出 (理論上ほぼ起きないが安全策)
    try {
      const pixel = ctx.getImageData(centerX | 0, centerY | 0, 1, 1).data;
      if (pixel[3] === 0) {
        ctx.clearRect(0, 0, base, base);
        ctx.fillStyle = "#ddd";
        ctx.beginPath();
        ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
        ctx.fill();
      }
    } catch (_) {}
  }

  /**
   * 花弁描画
   */
  #drawPetal(ctx, cx, cy, angle, innerR, len, width, baseColor) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    const x0 = 0;
    const y0 = -innerR;
    const y1 = -(innerR + len);

    // グラデーション (上=明, 下=濃)
    const grad = ctx.createLinearGradient(0, y1, 0, y0);
    const { h, s, l } = this.#parseHsl(baseColor);
    const lighter = this.#hslToHex(h, s, Math.min(100, l + 12));
    const mid = this.#hslToHex(h, s, l);
    const darker = this.#hslToHex(h, s, Math.max(0, l - 18));
    grad.addColorStop(0, lighter);
    grad.addColorStop(0.5, mid);
    grad.addColorStop(1, darker);

    ctx.fillStyle = grad;
    ctx.strokeStyle = this.#hslToHex(h, s, Math.max(0, l - 30));
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.bezierCurveTo(
      width / 2,
      (y0 + y1) / 2,
      width / 2,
      (y0 + y1) / 2,
      0,
      y1
    );
    ctx.bezierCurveTo(
      -width / 2,
      (y0 + y1) / 2,
      -width / 2,
      (y0 + y1) / 2,
      x0,
      y0
    );
    ctx.closePath();
    ctx.shadowColor = "rgba(0,0,0,0.15)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.stroke();

    // ハイライト
    ctx.globalCompositeOperation = "screen";
    const hl = ctx.createLinearGradient(0, y1, 0, y0);
    hl.addColorStop(0, "rgba(255,255,255,0.5)");
    hl.addColorStop(0.4, "rgba(255,255,255,0.0)");
    ctx.fillStyle = hl;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.bezierCurveTo(
      width / 2,
      (y0 + y1) / 2,
      width / 2,
      (y0 + y1) / 2,
      0,
      y1
    );
    ctx.bezierCurveTo(
      -width / 2,
      (y0 + y1) / 2,
      -width / 2,
      (y0 + y1) / 2,
      x0,
      y0
    );
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    ctx.restore();
  }

  /** 中心コア描画 */
  #drawCore(ctx, cx, cy, r, baseColor) {
    const { h, s, l } = this.#parseHsl(baseColor);
    const lighter = this.#hslToHex(h, s, Math.min(100, l + 15));
    const mid = this.#hslToHex(h, s, l);
    const darker = this.#hslToHex(h, s, Math.max(0, l - 25));
    const grad = ctx.createRadialGradient(
      cx - r / 3,
      cy - r / 3,
      r / 6,
      cx,
      cy,
      r
    );
    grad.addColorStop(0, lighter);
    grad.addColorStop(0.7, mid);
    grad.addColorStop(1, darker);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = this.#hslToHex(h, s, Math.max(0, l - 35));
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  /** タグ文字列→色 (HSL文字列) */
  #colorForTag(tag) {
    // 既存構造に color プロパティがある場合考慮 (tagsWithColors 未使用時安全)
    if (tag && typeof tag === "object" && tag.color) return tag.color;
    const h = this.#hashString(tag) % 360;
    const s = 58; // 彩度%
    const l = 55; // 輝度%
    return `hsl(${h}, ${s}%, ${l}%)`;
  }

  #parseHsl(hsl) {
    // スペース区切りもカンマ区切りに正規化
    const normalized = hsl.replace(
      /hsl\((\d+) (\d+)% (\d+)%\)/,
      "hsl($1,$2%,$3%)"
    );
    const m =
      /hsl\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%\s*\)/i.exec(
        normalized
      );
    if (!m) return { h: 0, s: 0, l: 50 };
    return { h: +m[1], s: +m[2], l: +m[3] };
  }

  #hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const toHex = (x) =>
      Math.round(x * 255)
        .toString(16)
        .padStart(2, "0");
    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
  }

  /** 文字列ハッシュ(FNV-1a 32bit) */
  #hashString(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
      h >>>= 0;
    }
    return h >>> 0;
  }

  /** HSL表記の lightness 調整 (簡易パーサ) */
  #adjustHslLightness(hsl, delta) {
    // 形式: hsl(H S% L%) or hsl(H, S%, L%) 両対応
    const m =
      /hsl\(\s*(\d+(?:\.\d+)?)\s*,?\s*(\d+(?:\.\d+)?)%\s*,?\s*(\d+(?:\.\d+)?)%\s*\)/.exec(
        hsl
      );
    if (!m) return hsl;
    const h = +m[1];
    const s = +m[2];
    let l = +m[3];
    l = Math.max(0, Math.min(100, l + delta));
    return `hsl(${h}, ${s}%, ${l}%)`;
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
    // アイコン再描画
    this.#renderIconIfNeeded(this.#element);

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
      fragment.appendChild(card.getElement());
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
