---
layout: default
title: Top
pageId: top
description: RDFポータルサイトへようこそ。データセットやエンドポイント情報を探索できます。
---

<p class="intro"><span>The RDF Portal provides a collection of </span><br>
<span>life science datasets in RDF (Resource Description Framework). </span><br>
<span>The portal aims to accelerate</span><br>
<span>integrative utilization of the heterogeneous datasets deposited by</span><br>
<span>various research institutions and groups.</span><br>
<span>In this portal, each dataset comes with a summary,</span><br>
<span>downloadable files and a SPARQL endpoint.</span></p>


<!-- JekyllでJSONデータを埋め込む -->
<script type="application/json" id="datasets-json">{{ site.data.datasets | jsonify }}</script>

<div id="TopPageTilingDatasetsView">
  <div class="container"></div>
</div>
