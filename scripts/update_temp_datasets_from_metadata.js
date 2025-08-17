#!/usr/bin/env node
/**
 * metadata.yaml を rdf-config リポジトリ (GitHub) から取得し assets/data/temp-datasets.json を更新するスクリプト
 * 仕様:
 * 1. 現在の temp-datasets.json を読み込み (存在しなければ空配列)
 * 2. temp-datasets.txt の全 dataset id を列挙
 * 3. 各 id について metadata.yaml (config/<id>/metadata.yaml) を GitHub API 経由で取得 (なければスキップ)
 * 4. 取得できた title/description/tags で既存項目を上書き (空文字は未更新扱いオプション)
 * 5. 変更結果を同ファイルへ保存 (バックアップ *.bak 作成)
 * 6. 進捗と統計を標準出力
 *
 * 簡易YAMLパーサ: 必要フィールド(title, description, tags) のみ抽出
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const GITHUB_API_BASE = "https://api.github.com";
const REPO_OWNER = "dbcls";
const REPO_NAME = "rdf-config";
const CONFIG_PATH = "config";

const DATA_TXT = path.join(__dirname, "../assets/data/temp-datasets.txt");
const DATA_JSON = path.join(__dirname, "../assets/data/temp-datasets.json");

const REQUEST_DELAY_MS = 400; // 軽いレート制限対策
const USER_AGENT = "RDF-Portal-UpdateScript";

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadDatasetIds() {
  const content = fs.readFileSync(DATA_TXT, "utf-8");
  return content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function loadExistingJson() {
  if (!fs.existsSync(DATA_JSON)) return [];
  try {
    return JSON.parse(fs.readFileSync(DATA_JSON, "utf-8"));
  } catch (e) {
    console.warn(
      "⚠️  Failed to parse existing JSON, starting fresh:",
      e.message
    );
    return [];
  }
}

function httpsGetJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": USER_AGENT } }, (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          if (res.statusCode === 200) {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(e);
            }
          } else if (res.statusCode === 404) {
            resolve(null); // metadata.yaml 無し
          } else {
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        });
      })
      .on("error", reject);
  });
}

function parseYamlLite(yaml) {
  const result = { title: "", description: "", tags: [] };
  if (!yaml) return result;
  const lines = yaml.split(/\r?\n/);
  let inTags = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("title:")) {
      result.title = line
        .replace(/^title:/, "")
        .trim()
        .replace(/^['"]|['"]$/g, "");
      inTags = false;
    } else if (line.startsWith("description:")) {
      result.description = line
        .replace(/^description:/, "")
        .trim()
        .replace(/^['"]|['"]$/g, "");
      inTags = false;
    } else if (line.startsWith("tags:")) {
      inTags = true;
      // inline array?
      const m = line.match(/tags:\s*\[(.*)\]/);
      if (m) {
        result.tags = m[1]
          .split(",")
          .map((t) => t.trim().replace(/^['"]|['"]$/g, ""))
          .filter(Boolean);
        inTags = false;
      } else {
        result.tags = [];
      }
    } else if (inTags && line.startsWith("- ")) {
      const tag = line
        .slice(2)
        .trim()
        .replace(/^['"]|['"]$/g, "");
      if (tag) result.tags.push(tag);
    } else if (inTags && !line.startsWith(" ") && !line.startsWith("-")) {
      inTags = false;
    }
  }
  return result;
}

async function fetchMetadata(id) {
  const url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${CONFIG_PATH}/${id}/metadata.yaml`;
  const json = await httpsGetJson(url);
  if (!json) return null;
  try {
    const decoded = Buffer.from(json.content, "base64").toString("utf-8");
    return parseYamlLite(decoded);
  } catch (e) {
    console.warn(
      `⚠️  ${id}: failed to decode/parse metadata.yaml (${e.message})`
    );
    return null;
  }
}

function mergeEntry(existingEntry, fetched, id) {
  const base = existingEntry || { id, title: "", description: "", tags: [] };
  if (!fetched) return base; // 変更なし
  return {
    id,
    title: fetched.title || base.title,
    description: fetched.description || base.description,
    tags:
      Array.isArray(fetched.tags) && fetched.tags.length
        ? fetched.tags
        : base.tags,
  };
}

async function main() {
  console.log("🚀 Updating temp-datasets.json from metadata.yaml ...");
  const ids = loadDatasetIds();
  const existing = loadExistingJson();
  const existingMap = new Map(existing.map((d) => [d.id, d]));

  const updated = [];
  let found = 0;
  let notFound = 0;

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    process.stdout.write(`\n📡 [${i + 1}/${ids.length}] ${id} ... `);
    try {
      const meta = await fetchMetadata(id);
      if (meta) {
        found++;
        process.stdout.write("✅");
      } else {
        notFound++;
        process.stdout.write("⭕ (no metadata.yaml)");
      }
      const merged = mergeEntry(existingMap.get(id), meta, id);
      updated.push(merged);
    } catch (e) {
      notFound++;
      process.stdout.write(`❌ (${e.message})`);
      updated.push(mergeEntry(existingMap.get(id), null, id));
    }
    await sleep(REQUEST_DELAY_MS);
  }

  // バックアップ
  if (fs.existsSync(DATA_JSON)) {
    const backupPath = DATA_JSON + "." + Date.now() + ".bak";
    fs.copyFileSync(DATA_JSON, backupPath);
    console.log(`\n💾 Backup created: ${backupPath}`);
  }

  fs.writeFileSync(DATA_JSON, JSON.stringify(updated, null, 2), "utf-8");

  const withTitle = updated.filter((d) => d.title).length;
  console.log(`\n🎉 Updated ${DATA_JSON}`);
  console.log(`📊 Total: ${updated.length}`);
  console.log(`📈 With metadata: ${withTitle}`);
  console.log(`📉 Without metadata: ${updated.length - withTitle}`);
  console.log(`📘 metadata.yaml found: ${found}`);
  console.log(`📕 metadata.yaml missing/errors: ${notFound}`);
}

if (require.main === module) {
  main().catch((e) => {
    console.error("\n❌ Fatal:", e);
    process.exit(1);
  });
}
