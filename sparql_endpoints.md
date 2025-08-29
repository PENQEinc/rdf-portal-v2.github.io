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
          {% for dataset in site.data.datasets %}
            {% if dataset.endpoint == endpoint.id %}
              <li>
                <a href="{{ site.baseurl }}/dataset/?id={{ dataset.id | url_encode }}">
                  {{ dataset.title }}
                </a>
              </li>
            {% endif %}
          {% endfor %}
        </ul>
      </article>
    </li>
  {% endfor %}
  </ul>
</div>