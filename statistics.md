---
layout: page
title: Statistics
pageId: statistics
description: RDFデータセットの統計情報一覧
permalink: /statistics/
---

<script type="application/json" id="datasets-json">{{ site.data.datasets | jsonify }}</script>
<div id="TagStatsBar"></div>
<div id="StatisticsTableView">
  <div class="inner">
    <table>
      <thead>
        <tr>
          <th data-sort="title">Dataset</th>
          <th data-sort="number_of_triples">Triples</th>
          <th data-sort="number_of_links">Links</th>
          <th data-sort="number_of_classes">Classes</th>
          <th data-sort="number_of_instances">Instances</th>
          <th data-sort="number_of_literals">Literals</th>
          <th data-sort="number_of_subjects">Subjects</th>
          <th data-sort="number_of_properties">Properties</th>
          <th data-sort="number_of_objects">Objects</th>
        </tr>
      </thead>
      <tbody>
        {% for dataset in site.data.datasets %}
          <tr>
            <td data-key="title">{{ dataset.title }}</td>
            <td data-key="number_of_triples">{{ dataset.statistics.number_of_triples }}</td>
            <td data-key="number_of_links">{{ dataset.statistics.number_of_links }}</td>
            <td data-key="number_of_classes">{{ dataset.statistics.number_of_classes }}</td>
            <td data-key="number_of_instances">{{ dataset.statistics.number_of_instances }}</td>
            <td data-key="number_of_literals">{{ dataset.statistics.number_of_literals }}</td>
            <td data-key="number_of_subjects">{{ dataset.statistics.number_of_subjects }}</td>
            <td data-key="number_of_properties">{{ dataset.statistics.number_of_properties }}</td>
            <td data-key="number_of_objects">{{ dataset.statistics.number_of_objects }}</td>
          </tr>
        {% endfor %}
      </tbody>
    </table>
  </div>
</div>

<script>
// タグ統計棒グラフ描画（DatasetsManagerで集計）

document.addEventListener('DOMContentLoaded', async function() {
  // タグ統計バー描画
  const barsContainerEl = document.querySelector('#TagStatsBar');
  if (barsContainerEl && window.DatasetsManager) {
    const mgr = window.DatasetsManager.getInstance();
    const tags = await mgr.getAvailableTags();
    if (tags.length) {
      // const totalTagCount = tags.reduce((acc, tag) => acc + tag.count, 0);
      const maxCount = Math.max(...tags.map(t => t.count));
      const barContainer = document.createElement('div');
      barContainer.className = 'tag-stats-bar';
      const inner = document.createElement('div');
      inner.className = 'inner';
      barContainer.append(inner);
      tags.forEach(tagObj => {
        const { id, count, color } = tagObj;
        const bar = document.createElement('div');
        bar.className = 'bar';
        // bar.style.width = `${tagObj.count / totalTagCount * 100}%`;
        bar.style.height = `${tagObj.count / maxCount * 100}%`;
        bar.style.background = color;
        bar.title = `${id}: ${count}`;
        bar.innerHTML = `<span class=\"label\">${id}</span>`;
        // bar.innerHTML = `<span class=\"tag-label\" style=\"writing-mode:vertical-lr; font-size:10px;\">${id}</span><span class=\"tag-value\" style=\"display:block; font-size:10px;\">${count}</span>`;
        inner.appendChild(bar);
      });
      barsContainerEl.innerHTML = '';
      barsContainerEl.appendChild(barContainer);
    }
  }

  // 簡易テーブルソート（数値・文字列対応）
  const table = document.querySelector('#StatisticsTableView > .inner > table');
  if (table) {
    table.querySelectorAll('th[data-sort]').forEach(th => {
      th.addEventListener('click', function() {
        const sortKey = th.getAttribute('data-sort');
        const rows = Array.from(table.tBodies[0].rows);
        const isNumber = sortKey !== 'title';
        const asc = !th.classList.contains('asc');
        rows.sort((a, b) => {
          const va = a.querySelector(`[data-key='${sortKey}']`)?.textContent || a.cells[th.cellIndex].textContent;
          const vb = b.querySelector(`[data-key='${sortKey}']`)?.textContent || b.cells[th.cellIndex].textContent;
          if (isNumber) return asc ? va - vb : vb - va;
          return asc ? va.localeCompare(vb) : vb.localeCompare(va);
        });
        rows.forEach(row => table.tBodies[0].appendChild(row));
        table.querySelectorAll('th').forEach(h => h.classList.remove('asc', 'desc'));
        th.classList.add(asc ? 'asc' : 'desc');
      });
    });
  }
});

</script>
