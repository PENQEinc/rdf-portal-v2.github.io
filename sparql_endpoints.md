---
layout: page
title: SPARQL endpoints
pageId: sparql_endpoints
description: SPARQLエンドポイントの一覧を表示します
permalink: /sparql_endpoints/
---

<div id="EndpointsListView">
  <ul class="endpoints">
  {% assign dataset_map = site.data.datasets | index_by: "id" %}
  {% for endpoint in site.data.endpoints %}
    <li class="endpoint">
      <article>
        <header>
          <h2>{{ endpoint.title }}</h2>
          <a href="https://rdfportal.org/{{ endpoint.id }}/sparql" target="endpoint" class="external-link">Endpoint</a>
        </header>
        <ul class="datasets">
          {% for dataset_id in endpoint.dataset %}
            {% assign dataset = site.data.datasets | where: "id", dataset_id | first %}
            <li>
                <a href="{{ site.baseurl }}/dataset/?id={{ dataset_id | url_encode }}">
                {% if dataset and dataset.title %}{{ dataset.title }}{% else %}{{ dataset_id }}{% endif %}
              </a>
            </li>
          {% endfor %}
        </ul>
      </article>
    </li>
  {% endfor %}
  </ul>
</div>