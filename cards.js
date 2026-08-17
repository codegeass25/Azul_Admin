/* ---------------------------------------------------------------------------
   cards.js — card-first presentation layer.

   Global rule: Transactions and Communications are permanent LIST/TABLE views.
   The module actively removes any previous card decoration from those sections,
   including decoration that may have been added before a dynamic re-render.
--------------------------------------------------------------------------- */
(function () {
  'use strict';

  var NO_CARD_ROOTS = '#page-payments, #page-notifications';

  function headers(table) {
    var hr = table.tHead && table.tHead.rows[0];
    if (!hr) return null;
    return Array.prototype.map.call(hr.cells, function (th) {
      return (th.textContent || '').trim();
    });
  }

  function undecorate(table) {
    table.classList.remove('as-cards');
    var rows = table.querySelectorAll('tbody > tr');
    Array.prototype.forEach.call(rows, function (row) {
      row.classList.remove('is-card', 'is-fullwidth');
      Array.prototype.forEach.call(row.cells, function (cell) {
        cell.classList.remove('cell-actions');
        cell.removeAttribute('data-label');
      });
    });
  }

  function isProtected(table) {
    return table.matches('[data-no-cards="true"]') || !!table.closest(NO_CARD_ROOTS);
  }

  function decorate(table) {
    /* Transactions + every Communications tab are always list/table based. */
    if (isProtected(table)) {
      undecorate(table);
      return;
    }

    var labels = headers(table);
    if (!labels) return;
    table.classList.add('as-cards');
    var bodies = table.tBodies;
    for (var b = 0; b < bodies.length; b++) {
      var rows = bodies[b].rows;
      for (var r = 0; r < rows.length; r++) {
        var row = rows[r];
        if (row.cells.length === 1 && row.cells[0].colSpan > 1) {
          row.classList.add('is-fullwidth');
          continue;
        }
        row.classList.add('is-card');
        for (var c = 0; c < row.cells.length; c++) {
          var cell = row.cells[c];
          var label = labels[c] || '';
          if (label) cell.setAttribute('data-label', label);
          else cell.setAttribute('data-label', '');
          var isLast = c === row.cells.length - 1;
          var looksLikeActions = /action/i.test(label) || (!label && isLast);
          if (isLast && (looksLikeActions || cell.querySelector('button, a'))) {
            cell.classList.add('cell-actions');
          }
        }
      }
    }
  }

  function scan(root) {
    var scope = root || document;
    var protectedTables = scope.querySelectorAll(NO_CARD_ROOTS + ' table.data');
    Array.prototype.forEach.call(protectedTables, undecorate);
    var tables = scope.querySelectorAll('.table-wrap > table.data');
    Array.prototype.forEach.call(tables, decorate);
  }

  function boot() {
    scan(document);
    var pending = null;
    var mo = new MutationObserver(function () {
      if (pending) return;
      pending = window.requestAnimationFrame(function () {
        pending = null;
        scan(document);
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
