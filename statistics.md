---
layout: page
title: Statistics
pageId: statistics
description: RDFデータセットの統計情報一覧
permalink: /statistics/
---

<table id="statistics-table">
  <thead>
    <tr>
      <th data-sort="title">データセット</th>
  <th data-sort="number_of_triples">トリプル数</th>
  <th data-sort="number_of_links">リンク数</th>
  <th data-sort="number_of_classes">クラス数</th>
  <th data-sort="number_of_instances">インスタンス数</th>
  <th data-sort="number_of_literals">リテラル数</th>
  <th data-sort="number_of_subjects">サブジェクト数</th>
  <th data-sort="number_of_properties">プロパティ数</th>
  <th data-sort="number_of_objects">オブジェクト数</th>
      <!-- 必要な統計項目を追加 -->
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
        <!-- 必要な統計項目を追加 -->
      </tr>
    {% endfor %}
  </tbody>
</table>

<script>
// 簡易テーブルソート（数値・文字列対応）
document.addEventListener('DOMContentLoaded', function() {
  const table = document.getElementById('statistics-table');
  if (!table) return;
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
});
</script>
