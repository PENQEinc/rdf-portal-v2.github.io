/**
 * DatasetCard - 花弁アイコン (0/1 タグも統一フォルム)
 */
class DatasetCard {
  static CARD_CLASS = "dataset-card";
  static TITLE_CLASS = "title";
  static DESCRIPTION_CLASS = "description";
  static TAGS_CLASS = "tags";
  static TAG_CLASS = "tag";
  static LINK_CLASS = "link";
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
      showIcon: true,
      iconSize: 36,
      iconRendering: "svgOverlap",
      showHeaderMeta: false, // headerに発行日・トリプル数を表示するか
    },
  };
  static SVG = {
    // 幾何/制御パラメータ ==============================
    MAX_PETALS: 10, // 同時に描画する最大花弁枚数 (タグ数が多くても打ち止め)
    SCALE: 0.82, // 全体基礎スケール (viewBox 100x100 を card サイズへ収める調整)
    APEX_Y: 78, // 花弁先端（下端）Y 座標 (lenFactor で圧縮)
    PETAL_TOP_Y: 10, // 花弁上端（頂点寄り）Y 座標
    PETAL_CTRL_TOP_Y: 20, // Bézier 上側制御点 Y
    PETAL_CTRL_LOW_Y: 55, // Bézier 下側制御点 Y (lenFactor で圧縮)

    // グラデーション関連 ===============================
    GRAD_OPACITY_START: 1, // グラデ上部 stop の不透明度
    GRAD_OPACITY_END: 0.2, // グラデ下部 stop の不透明度
    USE_RANDOM_ID: true, // <defs> の gradient id にランダム要素を含め重複を防ぐ

    // 花弁幅・長さスケーリング =========================
    WIDTH_MAX: 32, // 最小枚数時の最大半幅
    WIDTH_MIN: 12, // 最大枚数時の最小半幅
    WIDTH_EXP: 1.25, // 幅補間用指数 (非線形に細くする)
    LENGTH_COMPRESS: 0.12, // 枚数増加に伴う縦方向圧縮率 (t2 を掛ける)

    // (垂直揃え関連は V_ALIGN に移動)

    ZERO_TAG_COLOR: "#e2e8f0", // タグ 0 件時のプレースホルダ色

    // 視覚サイズ補正 ===================================
    VISUAL_MIN_SCALE: 1.1, // 多枚数時の全体縮小下限 (最小)
    VISUAL_MAX_SCALE: 1.1, // 少枚数時の全体拡大上限 (最大)
    VISUAL_EXP: 1.0, // 視覚スケール補間指数 (大きいほど多枚数側を強く縮小)
    SINGLE_PETAL_EMPHASIS: 1.025, // 単一タグ表示時のわずかな追加拡大倍率
    FULL_CIRCLE_THRESHOLD: 11, // この枚数以上で扇状 → 360° 均等配置に切替
    // レイアウト角度制御 ==============================
    TWO_PETAL_SPAN: 50, // 2枚時の扇状角度 (中心対称配置で ±25°)
    FAN_SPAN_MIN: 70, // 3枚時の扇状角度 (開始値)
    FAN_SPAN_MAX: 110, // FULL_CIRCLE_THRESHOLD-1 枚時の扇状角度 (その次で 360° へ)
  };

  // 垂直位置調整: アイコンとテキストの視覚中心を合わせるための調整定数
  static V_ALIGN = {
    MODE: "geometric", // 'geometric' | 'interpolate' 将来切替用
    // geometric モード (既定)
    CENTER_BASE: 10, // 基本オフセット（下方向に重心を調整）
    CENTER_FACTOR: 1.0, // 中点差分係数
    // interpolate モード (必要なら MODE を変更し下記を調整）
    SHIFT_MIN: -0.8,
    SHIFT_MAX: 0.9,
    SHIFT_EXP: 0.9,
    SINGLE_EXTRA: 0.6,
  };

  #dataset;
  #options;
  #element;
  #languageChangeHandler;
  constructor(dataset = {}, options = {}) {
    try {
      this.#dataset = dataset || {};
      this.#options = { ...DatasetCard.DEFAULTS.OPTIONS, ...(options || {}) };
      // ルートを <article> に変更 (セマンティクス向上)
      const el = document.createElement("article");
      el.className = DatasetCard.CARD_CLASS;
      if (Array.isArray(this.#options.customClasses))
        this.#options.customClasses.forEach((c) => c && el.classList.add(c));
      if (this.#dataset.id) el.dataset.datasetId = this.#dataset.id;
      el.innerHTML = this.#generateContent();
      this.#setupEventListeners(el);
      this.#element = el;

      // 言語変更イベントリスナーを追加
      this.#setupLanguageListener();
    } catch (e) {
      console.error("DatasetCard constructor error", e);
      const fb = document.createElement("div");
      fb.className = DatasetCard.CARD_CLASS + " dataset-card--error";
      fb.textContent =
        this.#dataset?.title || this.#dataset?.id || "Invalid Dataset";
      this.#element = fb;
    }
  }

  // 言語変更イベントリスナー設定
  #setupLanguageListener() {
    this.#languageChangeHandler = () => {
      if (this.#element) {
        this.#element.innerHTML = this.#generateContent();
        this.#setupEventListeners(this.#element);
      }
    };
    window.addEventListener("languageChange", this.#languageChangeHandler);
  }

  static createCards(datasets, options = {}) {
    const frag = document.createDocumentFragment();
    if (!Array.isArray(datasets)) return frag;
    datasets.forEach((ds) => {
      const c = new DatasetCard(ds, options);
      const el = c.getElement();
      if (el) frag.appendChild(el);
    });
    return frag;
  }

  getElement() {
    return this.#element;
  }
  appendTo(container) {
    if (container?.appendChild && this.#element)
      container.appendChild(this.#element);
  }
  remove() {
    // イベントリスナーをクリーンアップ
    if (this.#languageChangeHandler) {
      window.removeEventListener("languageChange", this.#languageChangeHandler);
      this.#languageChangeHandler = null;
    }

    if (this.#element?.parentNode)
      this.#element.parentNode.removeChild(this.#element);
  }

  #generateContent() {
    const iconPart = this.#options.showIcon
      ? `<div class="iconwrapper">${this.#buildPetalSvg()}</div>`
      : "";
    const titlePart = this.#generateTitle();
    const metaPart = this.#options.showHeaderMeta
      ? this.#generateHeaderMeta()
      : "";
    const descHtml = this.#generateDescription();
    const tagsHtml = this.#options.showTags ? this.#generateTags() : "";
    // icon + title + meta を <header> にまとめる
    const headHtml = `<header class="head">${iconPart}${titlePart}${metaPart}</header>`;
    return `${headHtml}<div class="body">${descHtml}${tagsHtml}</div>`;
  }
  // header用: 発行日とトリプル数を表示
  #generateHeaderMeta() {
    const issued = this.#dataset.issued;
    const tripleCount = this.#dataset.statistics?.number_of_triples;
    let html = '<div class="meta">';
    if (issued) {
      html += `<span class="issued">${this.#escapeHtml(issued)}</span>`;
    }
    if (tripleCount && typeof tripleCount === "number") {
      html += `<span class="triples">${tripleCount.toLocaleString()} triples</span>`;
    }
    html += "</div>";
    return html;
  }
  #generateTitle() {
    const ttl =
      this.#dataset.title ||
      this.#dataset.id ||
      DatasetCard.DEFAULTS.FALLBACK_TITLE;
    const safe = this.#escapeHtml(ttl);
    if (
      this.#options.showLink &&
      this.#dataset.id &&
      this.#options.linkBaseUrl
    ) {
      const href = this.#escapeHtml(
        this.#options.linkBaseUrl.replace(/\/$/, "") +
          "/dataset/" +
          encodeURIComponent(this.#dataset.id) +
          "/",
      );
      return `<a class="${DatasetCard.TITLE_CLASS} ${DatasetCard.LINK_CLASS}" href="${href}">${safe}</a>`;
    }
    return `<div class="${DatasetCard.TITLE_CLASS}">${safe}</div>`;
  }
  #generateDescription() {
    if (!this.#options.showDescription) return "";

    // 多言語対応: description がオブジェクトの場合の処理
    let desc = "";
    if (typeof this.#dataset.description === "string") {
      // 従来形式（文字列）
      desc = this.#dataset.description.trim();
    } else if (
      typeof this.#dataset.description === "object" &&
      this.#dataset.description
    ) {
      // 新形式（多言語オブジェクト）
      const currentLang = this.#getCurrentLanguage();
      desc =
        this.#dataset.description[currentLang] ||
        this.#dataset.description.en ||
        this.#dataset.description.ja ||
        "";
      if (desc) desc = desc.trim();
    }

    if (desc)
      return `<div class="${DatasetCard.DESCRIPTION_CLASS}">${this.#escapeHtml(
        desc,
      )}</div>`;
    if (this.#options.showFallbackDescription)
      return `<div class="${
        DatasetCard.DESCRIPTION_CLASS
      } isFallback">${this.#escapeHtml(
        DatasetCard.DEFAULTS.FALLBACK_DESCRIPTION,
      )}</div>`;
    return "";
  }

  // 現在の言語設定を取得
  #getCurrentLanguage() {
    return localStorage.getItem("site-language") || "en";
  }
  #generateTags() {
    const tags = this.#extractTagStrings(this.#getTags());
    if (!tags.length) return "";
    return `<div class="${DatasetCard.TAGS_CLASS}">${tags
      .map((t) => this.#renderTag(t))
      .join("")}</div>`;
  }
  #renderTag(tag) {
    if (typeof tag === "string")
      return `<span class="${
        DatasetCard.TAG_CLASS
      }" data-tag="${this.#escapeHtml(tag)}">${this.#escapeHtml(tag)}</span>`;
    if (tag && typeof tag === "object" && tag.id) {
      const lang = document.documentElement.lang || "ja";
      const txt = tag.label?.[lang] || tag.label?.ja || tag.label?.en || tag.id;
      return `<span class="${
        DatasetCard.TAG_CLASS
      }" data-tag="${this.#escapeHtml(tag.id)}">${this.#escapeHtml(
        txt,
      )}</span>`;
    }
    return "";
  }

  // === helpers (復元) ===
  #getTags() {
    if (Array.isArray(this.#dataset.tagsWithColors))
      return this.#dataset.tagsWithColors;
    return Array.isArray(this.#dataset.tags) ? this.#dataset.tags : [];
  }
  #extractTagStrings(list) {
    return Array.isArray(list)
      ? list
          .map((t) => (typeof t === "string" ? t : t?.id || ""))
          .filter(Boolean)
      : [];
  }
  #escapeHtml(str) {
    return typeof str === "string"
      ? str
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;")
      : "";
  }
  #hashString(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
      h >>> 0;
    }
    return h >>> 0;
  }

  #buildPetalSvg() {
    const P = DatasetCard.SVG;
    const size = this.#options.iconSize || 48;
    const tags = this.#extractTagStrings(this.#getTags());
    const rawCount = tags.length;
    // 共通形状計算 (n=0/1 でも最大幅でふんわりさせる)
    const effectiveN = Math.min(Math.max(rawCount, 1), P.MAX_PETALS);
    const tRaw = (effectiveN - 2) / (P.MAX_PETALS - 2);
    const t = Math.max(0, Math.min(1, tRaw));
    const tVisual = Math.pow(t, P.VISUAL_EXP);
    const t2 = Math.pow(t, P.WIDTH_EXP); // 幾何用 (幅/長さ計算)
    const scaleVisual =
      P.VISUAL_MAX_SCALE - (P.VISUAL_MAX_SCALE - P.VISUAL_MIN_SCALE) * tVisual;
    const ctrlX = P.WIDTH_MAX - (P.WIDTH_MAX - P.WIDTH_MIN) * t2;
    const lenFactor = 1 - P.LENGTH_COMPRESS * t2;
    const APEX_Y = P.APEX_Y * lenFactor;
    const CTRL_LOW_Y = P.PETAL_CTRL_LOW_Y * lenFactor;
    // 視覚スケール (t2=0 少枚数→最大 / t2=1 多枚数→最小)
    const path = `M0 ${APEX_Y} C ${ctrlX} ${CTRL_LOW_Y}, ${ctrlX} ${P.PETAL_CTRL_TOP_Y}, 0 ${P.PETAL_TOP_Y} C -${ctrlX} ${P.PETAL_CTRL_TOP_Y}, -${ctrlX} ${CTRL_LOW_Y}, 0 ${APEX_Y}Z`;
    // --- 垂直位置補正 (V_ALIGN) ----------------------------------------------
    const V = DatasetCard.V_ALIGN;
    let translateY = 0;
    if (V.MODE === "geometric") {
      const baselineMid = (P.PETAL_TOP_Y + P.APEX_Y) * 0.5;
      const currentMid = (P.PETAL_TOP_Y + APEX_Y) * 0.5;
      const midDiff = baselineMid - currentMid;
      translateY = V.CENTER_BASE + midDiff * V.CENTER_FACTOR;
    } else if (V.MODE === "interpolate") {
      const effectiveN2 = Math.min(Math.max(rawCount, 1), P.MAX_PETALS);
      const tRaw2 = (effectiveN2 - 1) / (P.MAX_PETALS - 1);
      const tAlign = Math.pow(Math.max(0, Math.min(1, tRaw2)), V.SHIFT_EXP);
      translateY = V.SHIFT_MIN + (V.SHIFT_MAX - V.SHIFT_MIN) * tAlign;
      if (rawCount <= 2) translateY += V.SINGLE_EXTRA;
    }
    // 0 タグ: フラット灰色一枚
    if (rawCount === 0) {
      return `<svg class="icon -svg" width="${size}" height="${size}" viewBox="-50 0 100 100" role="img" aria-label="No tags"><g transform="scale(${(
        P.SCALE * scaleVisual
      ).toFixed(4)}) translate(0,${translateY.toFixed(
        4,
      )})"><path d="${path}" fill="${P.ZERO_TAG_COLOR}"/></g></svg>`;
    }
    // 1 タグ: 単一グラデ花弁
    if (rawCount === 1) {
      const baseHex =
        window.DatasetsManager && window.DatasetsManager.getColor
          ? window.DatasetsManager.getColor(tags[0])
          : "#999999";
      const hsl =
        window.DatasetsManager && window.DatasetsManager.hexToHsl
          ? window.DatasetsManager.hexToHsl(baseHex)
          : { h: 0, s: 0, l: 55 };
      const topHex = this.#hslToHex(hsl.h, hsl.s, Math.min(100, hsl.l + 14));
      const idBase = `g_${Math.abs(this.#hashString(tags[0]))}_single`;
      const id = P.USE_RANDOM_ID
        ? `${idBase}_${Math.floor(Math.random() * 1e5)}`
        : idBase;
      const grad = `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${topHex}" stop-opacity="${P.GRAD_OPACITY_START}"/><stop offset="100%" stop-color="${baseHex}" stop-opacity="${P.GRAD_OPACITY_END}"/></linearGradient>`;
      return `<svg class="icon -svg" width="${size}" height="${size}" viewBox="-50 0 100 100" role="img" aria-label="Tag: ${this.#escapeHtml(
        tags[0],
      )}"><defs>${grad}</defs><g transform="scale(${(
        P.SCALE *
        scaleVisual *
        P.SINGLE_PETAL_EMPHASIS
      ).toFixed(4)}) translate(0,${translateY.toFixed(
        4,
      )})"><path d="${path}" fill="url(#${id})" style="mix-blend-mode:multiply"/></g></svg>`;
    }
    // 2+ タグ: 多花弁
    const arr = tags.slice(0, P.MAX_PETALS);
    const n = arr.length;
    const fullCircle = n >= P.FULL_CIRCLE_THRESHOLD;
    let dynamicSpan;
    if (fullCircle) {
      dynamicSpan = 360;
    } else if (n <= 1) {
      dynamicSpan = 0; // 0/1 枚は回転不要
    } else if (n === 2) {
      dynamicSpan = P.TWO_PETAL_SPAN; // 2枚専用角度
    } else {
      // 3 <= n < FULL_CIRCLE_THRESHOLD の扇状
      const spanRange = P.FAN_SPAN_MAX - P.FAN_SPAN_MIN;
      const denom = P.FULL_CIRCLE_THRESHOLD - 1 - 3; // 例: 8閾値 → 7-3 = 4
      const ratio = denom > 0 ? (n - 3) / denom : 0; // n=3→0, n=7→1
      const clamped = Math.max(0, Math.min(1, ratio));
      dynamicSpan = P.FAN_SPAN_MIN + spanRange * clamped;
    }
    const step = n === 1 ? 0 : fullCircle ? 360 / n : dynamicSpan / (n - 1);
    const start = fullCircle ? 0 : -dynamicSpan / 2;
    const lightenBase = 8,
      lightenExtra = 8;
    const lightenL = Math.min(lightenBase + (1 - t2) * lightenExtra, 20);
    const gradients = [];
    const petals = [];
    arr.forEach((tag, i) => {
      const angle = start + step * i;
      const baseHex =
        window.DatasetsManager && window.DatasetsManager.getColor
          ? window.DatasetsManager.getColor(tag)
          : "#888888";
      const hsl =
        window.DatasetsManager && window.DatasetsManager.hexToHsl
          ? window.DatasetsManager.hexToHsl(baseHex)
          : { h: 0, s: 0, l: 55 };
      const topHex = this.#hslToHex(
        hsl.h,
        hsl.s,
        Math.min(100, hsl.l + lightenL),
      );
      const idBase = `g_${Math.abs(this.#hashString(tag))}_${i}`;
      const id = P.USE_RANDOM_ID
        ? `${idBase}_${Math.floor(Math.random() * 1e5)}`
        : idBase;
      gradients.push(
        `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${topHex}" stop-opacity="${P.GRAD_OPACITY_START}"/><stop offset="100%" stop-color="${baseHex}" stop-opacity="${P.GRAD_OPACITY_END}"/></linearGradient>`,
      );
      petals.push(
        `<path d="${path}" fill="url(#${id})" transform="rotate(${angle} 0 ${APEX_Y})" style="mix-blend-mode:multiply"/>`,
      );
    });
    return `<svg class="icon -svg" width="${size}" height="${size}" viewBox="-50 0 100 100" role="img" aria-label="Tags: ${this.#escapeHtml(
      arr.join(", "),
    )}"><defs>${gradients.join("")}</defs><g transform="scale(${(
      P.SCALE * scaleVisual
    ).toFixed(4)}) translate(0,${translateY.toFixed(4)})">${petals.join(
      "",
    )}</g></svg>`;
  }
  #hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const r = Math.round(f(0) * 255)
      .toString(16)
      .padStart(2, "0");
    const g = Math.round(f(8) * 255)
      .toString(16)
      .padStart(2, "0");
    const b = Math.round(f(4) * 255)
      .toString(16)
      .padStart(2, "0");
    return `#${r}${g}${b}`;
  }
  #setupEventListeners(el) {
    if (typeof this.#options.onClick === "function") {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        this.#options.onClick(this.#dataset, e);
      });
      el.style.cursor = "pointer";
    }
  }
}

window.DatasetCard = DatasetCard;
