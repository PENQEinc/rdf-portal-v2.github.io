- note
  - データセット間のリンク情報が欲しい


- datasets
  _desc: dataset 一覧を取得
  _note:
    - 現状は、フロントエンドから呼び出し動的にページを生成させているが、できればサーバーで処理したい
  props:
    description:
      en:
      ja:
    endpoint:
    id:
    issued:
    name:
      en:
      ja:
    creators[]:
      en:
      ja:
    providers[]:
      en:
      ja:
    rdf_creators[]:
      en:
      ja:
    rdf_providers[]:
      en:
      ja:
    triple_count:
    tags[]:

- dataset:
  _desc: dataset 詳細情報取得
  _note: 
    - GitHub から直接取れるから、もしかしたらいらない？　回数制限はない？
    - データセット個別ページはフロントで動的に生成しているが、できれば SSR にしたい
  props:

- endpoints:
  labe:
  url: なくても良いかも
  desc: エンドポイント情報の取得
  props:
    datasets:
    id:

- statistics:
  desc: 統計情報の取得