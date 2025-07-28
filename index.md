---
layout: default
title: Top
description: RDFポータルサイトへようこそ。データセットやエンドポイント情報を探索できます。
---

<div class="page-hero">
  <h1 class="page-title">RDFポータルサイトへようこそ</h1>
  <p class="page-description">
    このサイトでは、様々なRDFデータセットやSPARQLエンドポイントの情報を提供しています。
    データセットの検索、エンドポイントの探索、統計情報の確認などが可能です。
  </p>
</div>

<div class="feature-grid">
  <div class="feature-card">
    <h3><a href="{{ '/datasets/' | relative_url }}">データセット</a></h3>
    <p>利用可能なRDFデータセットを閲覧・検索できます。各データセットの詳細情報、メタデータ、利用方法を確認いただけます。</p>
    <a href="{{ '/datasets/' | relative_url }}" class="feature-link">データセット一覧へ →</a>
  </div>

  <div class="feature-card">
    <h3><a href="{{ '/endpoints/' | relative_url }}">エンドポイント</a></h3>
    <p>SPARQLエンドポイントの一覧と各エンドポイントで利用可能なデータセットを確認できます。</p>
    <a href="{{ '/endpoints/' | relative_url }}" class="feature-link">エンドポイント一覧へ →</a>
  </div>

  <div class="feature-card">
    <h3><a href="{{ '/statistics/' | relative_url }}">統計情報</a></h3>
    <p>データセットやエンドポイントの統計情報、利用状況の分析結果を提供します。</p>
    <a href="{{ '/statistics/' | relative_url }}" class="feature-link">統計情報へ →</a>
  </div>

  <div class="feature-card">
    <h3><a href="{{ '/search/' | relative_url }}">検索</a></h3>
    <p>キーワードやタグを使って、目的のデータセットやエンドポイントを効率的に検索できます。</p>
    <a href="{{ '/search/' | relative_url }}" class="feature-link">検索ページへ →</a>
  </div>
</div>

<style>
.page-hero {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem 0;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  background: #fff;
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: all 0.2s ease;
}

.feature-card:hover {
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.feature-card h3 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: #333;
}

.feature-card h3 a {
  color: inherit;
  text-decoration: none;
}

.feature-card h3 a:hover {
  color: #007bff;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.feature-link {
  display: inline-block;
  color: #007bff;
  font-weight: 500;
  text-decoration: none;
  padding: 8px 16px;
  border: 1px solid #007bff;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.feature-link:hover {
  background-color: #007bff;
  color: #fff;
  text-decoration: none;
}

@media (max-width: 768px) {
  .page-hero {
    padding: 1rem 0;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .feature-card {
    padding: 1.5rem;
  }
}
</style>
