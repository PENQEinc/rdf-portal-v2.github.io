# Scripts Directory

このディレクトリには、データセットメタデータの取得・生成スクリプトが含まれています。

## ⚠️ 将来の削除予定

これらのスクリプトは、**APIが実装された後に削除予定**です。
現在は以下の目的で保持されています：

- APIが利用可能になるまでの間のメタデータ更新
- 開発・テスト環境でのデータ生成  
- バックアップ・フォールバック機能

## ファイル説明

- `aggregate_metadata.js` - GitHub rdf-configリポジトリからメタデータを一括取得
- `fetch_metadata.js` - 個別メタデータ取得（デバッグ用）
- `generate_comprehensive_datasets.js` - 包括的なJSONファイル生成（メイン）

## 使用方法

```bash
# 包括的なメタデータファイル生成
node scripts/generate_comprehensive_datasets.js
```

## API移行後の削除チェックリスト

- [ ] APIエンドポイントが安定稼働している
- [ ] temp-datasets.jsonがAPIで代替されている  
- [ ] scriptsディレクトリとその内容を削除
- [ ] .gitignoreの関連設定を削除
