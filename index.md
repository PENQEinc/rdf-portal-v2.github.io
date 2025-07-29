---
layout: default
title: Top
description: RDFポータルサイトへようこそ。データセットやエンドポイント情報を探索できます。
---

<div id="TopTilingBackground">
  <!-- 背景データセットタイル -->
  <div class="dataset-tiles">
    <!-- JavaScriptで動的に生成 -->
  </div>
  
  <!-- メインコンテンツ -->
  <div class="p-hero p-hero--top">
    <h1 class="p-hero__title">RDF<br>Portal</h1>
    <p class="p-hero__description">
      The RDF Portal provides a collection of<br>
      life science datasets in RDF (Resource Description Framework).<br>
      The portal aims to accelerate<br>
      integrative utilization of the heterogeneous datasets deposited by<br>
      various research institutions and groups.
    </p>
    <p class="p-hero__subdescription">
      In this portal, each dataset comes with a summary,<br>
      downloadable files and a SPARQL endpoint.
    </p>
  </div>

  <div class="p-feature__grid">
    <div class="p-feature__card">
      <h3 class="p-feature__title"><a href="{{ '/datasets/' | relative_url }}">データセット</a></h3>
      <p class="p-feature__description">利用可能なRDFデータセットを閲覧・検索できます。各データセットの詳細情報、メタデータ、利用方法を確認いただけます。</p>
      <a href="{{ '/datasets/' | relative_url }}" class="p-feature__link">データセット一覧へ →</a>
    </div>

    <div class="p-feature__card">
      <h3 class="p-feature__title"><a href="{{ '/endpoints/' | relative_url }}">エンドポイント</a></h3>
      <p class="p-feature__description">SPARQLエンドポイントの一覧と各エンドポイントで利用可能なデータセットを確認できます。</p>
      <a href="{{ '/endpoints/' | relative_url }}" class="p-feature__link">エンドポイント一覧へ →</a>
    </div>

    <div class="p-feature__card">
      <h3 class="p-feature__title"><a href="{{ '/statistics/' | relative_url }}">統計情報</a></h3>
      <p class="p-feature__description">データセットやエンドポイントの統計情報、利用状況の分析結果を提供します。</p>
      <a href="{{ '/statistics/' | relative_url }}" class="p-feature__link">統計情報へ →</a>
    </div>

    <div class="p-feature__card">
      <h3 class="p-feature__title"><a href="{{ '/search/' | relative_url }}">検索</a></h3>
      <p class="p-feature__description">キーワードやタグを使って、目的のデータセットやエンドポイントを効率的に検索できます。</p>
      <a href="{{ '/search/' | relative_url }}" class="p-feature__link">検索ページへ →</a>
    </div>
  </div>
</div>
