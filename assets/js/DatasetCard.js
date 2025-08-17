/**
 * DatasetCard - 再構築版 (最小安定実装 + SVG花弁アイコン)
 * 目的: 破損ファイルを置換してページ復旧。今後拡張しやすいシンプル構造。
 */
class DatasetCard {
  /* =================== 定数 =================== */
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
      iconSize: 48,
      iconRendering: "svgOverlap",
    },
  };
  // SVG花弁パラメータ (必要最低限 + 動的スパンロジック)
  static SVG = {
    MAX_PETALS: 10,
    SCALE: 0.82,
    APEX_Y: 78,
    PETAL_TOP_Y: 10,
    PETAL_CTRL_TOP_Y: 20,
    PETAL_CTRL_LOW_Y: 55,
    PETAL_CTRL_X: 32,
    GRAD_LIGHTEN_L: 12,
    GRAD_OPACITY_START: 0.85,
    GRAD_OPACITY_END: 0.05,
    USE_RANDOM_ID: true,
  };

  #dataset;
  #options;
  #element;

  constructor(dataset = {}, options = {}) {
    try {
      this.#dataset = dataset || {};
      this.#options = { ...DatasetCard.DEFAULTS.OPTIONS, ...(options || {}) };

      const el = document.createElement("div");
      el.className = DatasetCard.CARD_CLASS;
      if (Array.isArray(this.#options.customClasses)) {
        this.#options.customClasses.forEach((c) => c && el.classList.add(c));
      }
      if (this.#dataset.id) el.dataset.datasetId = this.#dataset.id;
      el.innerHTML = this.#generateContent();
      this.#setupEventListeners(el);
      this.#element = el;
    } catch (e) {
      console.error("DatasetCard constructor error", e);
      const fb = document.createElement("div");
      fb.className = DatasetCard.CARD_CLASS + " dataset-card--error";
      fb.textContent =
        this.#dataset?.title || this.#dataset?.id || "Invalid Dataset";
      this.#element = fb;
    }
  }

  /* ============== Public API ============== */
  getElement() {
    return this.#element;
  }
  appendTo(container) {
    if (container?.appendChild && this.#element)
      container.appendChild(this.#element);
  }
  remove() {
    if (this.#element?.parentNode)
      this.#element.parentNode.removeChild(this.#element);
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
  static renderToContainer(container, datasets, options = {}) {
    if (!container?.appendChild) return;
    container.appendChild(DatasetCard.createCards(datasets, options));
  }

  /* ============== HTML生成 ============== */
  #generateContent() {
    return [
      this.#generateHeader(),
      this.#generateDescription(),
      this.#generateTags(),
    ]
      .filter(Boolean)
      .join("");
  }

  #generateHeader() {
    const titleHtml = this.#generateTitle();
    if (!this.#options.showIcon)
      return `<div class="dataset-card__head">${titleHtml}</div>`;
    if (this.#options.iconRendering !== "svgOverlap") {
      // 他方式は未実装: プレースホルダ
      const size = this.#options.iconSize || 48;
      return `<div class="dataset-card__head"><svg class="dataset-card__icon" width="${size}" height="${size}" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#e2e8f0"/></svg>${titleHtml}</div>`;
    }
    return `<div class="dataset-card__head">${this.#buildPetalSvg()}${titleHtml}</div>`;
  }

  #generateTitle() {
    const t =
      this.#dataset.title ||
      this.#dataset.id ||
      DatasetCard.DEFAULTS.FALLBACK_TITLE;
    if (this.#options.showLink && this.#dataset.id) {
      const url = `${this.#options.linkBaseUrl}/dataset/?id=${
        this.#dataset.id
      }`;
      return `<h3 class="${DatasetCard.TITLE_CLASS}"><a class="${
        DatasetCard.LINK_CLASS
      }" href="${url}">${this.#escapeHtml(t)}</a></h3>`;
    }
    return `<div class="${DatasetCard.TITLE_CLASS}">${this.#escapeHtml(
      t
    )}</div>`;
  }

  #generateDescription() {
    if (!this.#options.showDescription) return "";
    const d =
      this.#dataset.description ||
      (this.#options.showFallbackDescription
        ? DatasetCard.DEFAULTS.FALLBACK_DESCRIPTION
        : "");
    return d
      ? `<div class="${DatasetCard.DESCRIPTION_CLASS}">${this.#escapeHtml(
          d
        )}</div>`
      : "";
  }

  #generateTags() {
    if (!this.#options.showTags) return "";
    const tags = this.#getTags();
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
        txt
      )}</span>`;
    }
    return "";
  }

  /* ============== SVG花弁生成 ============== */
  #buildPetalSvg() {
    const P = DatasetCard.SVG;
    const size = this.#options.iconSize || 48;
    const tags = this.#extractTagStrings(this.#getTags());
    if (!tags.length)
      return `<svg class="dataset-card__icon" width="${size}" height="${size}" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#e2e8f0"/></svg>`;
    const arr = tags.slice(0, P.MAX_PETALS);
    const n = arr.length;
    const dynamicSpan =
      n <= 1 ? 0 : n <= 3 ? 70 : Math.min(70 + (n - 3) * 25, 300);
    const step = n === 1 ? 0 : dynamicSpan / (n - 1);
    const start = -dynamicSpan / 2;
    const ctrlX =
      n > 6 ? Math.max(14, P.PETAL_CTRL_X * (6 / n)) : P.PETAL_CTRL_X;
    const lightenL = Math.min(P.GRAD_LIGHTEN_L + (n - 1) * 0.6, 20);
    const path = `M0 ${P.APEX_Y} C ${ctrlX} ${P.PETAL_CTRL_LOW_Y}, ${ctrlX} ${P.PETAL_CTRL_TOP_Y}, 0 ${P.PETAL_TOP_Y} C -${ctrlX} ${P.PETAL_CTRL_TOP_Y}, -${ctrlX} ${P.PETAL_CTRL_LOW_Y}, 0 ${P.APEX_Y}Z`;
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
        Math.min(100, hsl.l + lightenL)
      );
      const idBase = `g_${Math.abs(this.#hashString(tag))}_${i}`;
      const id = P.USE_RANDOM_ID
        ? `${idBase}_${Math.floor(Math.random() * 1e5)}`
        : idBase;
      gradients.push(
        `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${topHex}" stop-opacity="${P.GRAD_OPACITY_START}"/><stop offset="100%" stop-color="${baseHex}" stop-opacity="${P.GRAD_OPACITY_END}"/></linearGradient>`
      );
      petals.push(
        `<path d="${path}" fill="url(#${id})" transform="rotate(${angle} 0 ${P.APEX_Y})" style="mix-blend-mode:multiply"/>`
      );
    });
    return `<svg class="dataset-card__icon dataset-card__icon--svg" width="${size}" height="${size}" viewBox="-50 0 100 100" role="img" aria-label="Tags: ${this.#escapeHtml(
      arr.join(", ")
    )}"><defs>${gradients.join("")}</defs><g transform="scale(${
      P.SCALE
    }) translate(0,-4)">${petals.join("")}</g></svg>`;
  }

  /* ============== Data helpers ============== */
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

  /* ============== Utils ============== */
  #escapeHtml(s) {
    return typeof s === "string"
      ? s
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

// 公開
window.DatasetCard = DatasetCard;
