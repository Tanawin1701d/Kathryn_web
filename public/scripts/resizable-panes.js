/* Resizable Starlight panes.
 *
 * Adds drag handles to the left navigation sidebar and the right "On this page"
 * table of contents. Widths are written as inline styles on <html> (which beats
 * Starlight's stylesheet rules) and persisted to localStorage.
 *
 *   left handle  -> --sl-sidebar-width   (content follows via --sl-content-inline-start)
 *   right handle -> --sl-content-width    (wider content == narrower TOC, and vice-versa)
 *
 * Double-click a handle to reset it; arrow keys nudge it 16px when focused.
 */
(function () {
  var root = document.documentElement;
  var LEFT = { key: 'kat:sidebarW', varName: '--sl-sidebar-width', min: 180, max: 520, def: 300 };
  var RIGHT = { key: 'kat:contentW', varName: '--sl-content-width', min: 480, max: 1200, def: 720 };

  function readSaved(cfg) {
    try {
      var v = localStorage.getItem(cfg.key);
      if (v) root.style.setProperty(cfg.varName, v + 'px');
    } catch (e) {}
  }
  function currentPx(cfg) {
    var v = getComputedStyle(root).getPropertyValue(cfg.varName).trim();
    var n = parseFloat(v);
    if (!v || isNaN(n)) return cfg.def;
    // getComputedStyle returns px for these once resolved; rem fallback just in case
    return v.indexOf('rem') !== -1 ? n * 16 : n;
  }
  function clamp(cfg, px) {
    return Math.min(cfg.max, Math.max(cfg.min, px));
  }

  // gain: how much the CSS var changes per pixel of pointer travel. The right
  // divider only moves ~half a pixel per px of content-width (the column is
  // centred), so we double it to feel one-to-one.
  function attach(handle, cfg, gain) {
    var startX = 0, startVal = 0, dragging = false, last = null;

    function apply(base, dx) {
      last = clamp(cfg, base + dx * gain);
      root.style.setProperty(cfg.varName, last + 'px');
    }
    handle.addEventListener('pointerdown', function (e) {
      dragging = true;
      startX = e.clientX;
      startVal = currentPx(cfg);
      document.body.classList.add('kat-resizing');
      try { handle.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    });
    window.addEventListener('pointermove', function (e) {
      if (dragging) apply(startVal, e.clientX - startX);
    });
    window.addEventListener('pointerup', function () {
      if (!dragging) return;
      dragging = false;
      document.body.classList.remove('kat-resizing');
      if (last != null) { try { localStorage.setItem(cfg.key, Math.round(last)); } catch (e) {} }
    });
    handle.addEventListener('keydown', function (e) {
      var step = e.key === 'ArrowLeft' ? -16 : e.key === 'ArrowRight' ? 16 : 0;
      if (!step) return;
      e.preventDefault();
      apply(currentPx(cfg), step);
      try { localStorage.setItem(cfg.key, Math.round(last)); } catch (err) {}
    });
    handle.addEventListener('dblclick', function () {
      root.style.removeProperty(cfg.varName);
      try { localStorage.removeItem(cfg.key); } catch (e) {}
    });
  }

  function makeHandle(cls, label) {
    var h = document.createElement('div');
    h.className = 'kat-resize-handle ' + cls;
    h.setAttribute('role', 'separator');
    h.setAttribute('aria-orientation', 'vertical');
    h.setAttribute('aria-label', label);
    h.tabIndex = 0;
    return h;
  }

  function init() {
    readSaved(LEFT);
    readSaved(RIGHT);

    // Left: a fixed strip tracking the sidebar's right edge. Only meaningful
    // when a sidebar exists on this page (splash landing has none).
    if (document.querySelector('.sidebar-pane') && !document.getElementById('kat-handle-left')) {
      var hl = makeHandle('kat-resize-left', 'Resize navigation sidebar');
      hl.id = 'kat-handle-left';
      document.body.appendChild(hl);
      attach(hl, LEFT, 1);
    }
    // Right: absolute handle on the divider between content and the TOC.
    var container = document.querySelector('.right-sidebar-container');
    if (container && !document.getElementById('kat-handle-right')) {
      var hr = makeHandle('kat-resize-right', 'Resize table of contents');
      hr.id = 'kat-handle-right';
      container.appendChild(hr);
      attach(hr, RIGHT, 2);
    }
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
  // Re-run after Starlight/Astro client navigations.
  document.addEventListener('astro:page-load', init);
})();
