/* Pan & zoom for rendered Mermaid diagrams.
 *
 * Every diagram (<pre class="mermaid"> plus its rendered <svg>) becomes a
 * clipped viewport: drag with the mouse to pan, Ctrl/Cmd+scroll (or trackpad
 * pinch) to zoom toward the cursor, double-click to reset. When focused
 * (click or Tab), + / - zoom, arrow keys pan, 0 resets.
 *
 * astro-mermaid renders client-side and re-renders on theme toggle (the <svg>
 * node is replaced), so diagrams are attached lazily via a MutationObserver
 * and the stored transform is re-applied to the fresh <svg>.
 */
(function () {
  var MIN = 0.4, MAX = 10;
  var states = new WeakMap(); // pre.mermaid -> {scale, tx, ty}

  function state(pre) {
    var s = states.get(pre);
    if (!s) { s = { scale: 1, tx: 0, ty: 0 }; states.set(pre, s); }
    return s;
  }

  function apply(pre) {
    var svg = pre.querySelector('svg');
    if (!svg) return;
    var s = state(pre);
    svg.style.transformOrigin = '0 0';
    svg.style.transform = 'translate(' + s.tx + 'px, ' + s.ty + 'px) scale(' + s.scale + ')';
  }

  function zoomAt(pre, clientX, clientY, factor) {
    var s = state(pre);
    var next = Math.min(MAX, Math.max(MIN, s.scale * factor));
    if (next === s.scale) return;
    var rect = pre.getBoundingClientRect();
    var cx = clientX - rect.left, cy = clientY - rect.top;
    var r = next / s.scale;
    s.tx = cx - (cx - s.tx) * r;
    s.ty = cy - (cy - s.ty) * r;
    s.scale = next;
    apply(pre);
  }

  function zoomCenter(pre, factor) {
    var rect = pre.getBoundingClientRect();
    zoomAt(pre, rect.left + rect.width / 2, rect.top + rect.height / 2, factor);
  }

  function pan(pre, dx, dy) {
    var s = state(pre);
    s.tx += dx;
    s.ty += dy;
    apply(pre);
  }

  function reset(pre) {
    states.set(pre, { scale: 1, tx: 0, ty: 0 });
    apply(pre);
  }

  function addBtn(box, glyph, label, onClick) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = glyph;
    b.title = label;
    b.setAttribute('aria-label', label);
    b.addEventListener('click', onClick);
    box.appendChild(b);
  }

  // A theme toggle makes astro-mermaid rebuild the pre's contents, wiping the
  // buttons — so this is called from every scan, not just from attach().
  function ensureControls(pre) {
    if (pre.querySelector('.kat-diagram-controls')) return;
    var box = document.createElement('div');
    box.className = 'kat-diagram-controls';
    // keep button clicks from starting a drag or triggering the dblclick reset
    box.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    box.addEventListener('dblclick', function (e) { e.stopPropagation(); });
    addBtn(box, '+', 'Zoom in', function () { zoomCenter(pre, 1.25); });
    addBtn(box, '−', 'Zoom out', function () { zoomCenter(pre, 0.8); });
    addBtn(box, '↺', 'Reset view', function () { reset(pre); });
    pre.appendChild(box);
  }

  function attach(pre) {
    if (pre.dataset.katPanzoom) return;
    pre.dataset.katPanzoom = 'on';
    pre.tabIndex = 0;
    pre.setAttribute('aria-label', 'Diagram: drag to pan, Ctrl+scroll to zoom, double-click to reset');

    pre.addEventListener('wheel', function (e) {
      if (!e.ctrlKey && !e.metaKey) return; // plain scroll keeps scrolling the page
      e.preventDefault();
      zoomAt(pre, e.clientX, e.clientY, Math.exp(-e.deltaY * 0.005));
    }, { passive: false });

    pre.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || e.pointerType !== 'mouse') return; // touch keeps native page scrolling
      var s = state(pre);
      var offX = e.clientX - s.tx, offY = e.clientY - s.ty;
      pre.classList.add('kat-diagram-dragging');
      try { pre.setPointerCapture(e.pointerId); } catch (err) {}
      function move(ev) { s.tx = ev.clientX - offX; s.ty = ev.clientY - offY; apply(pre); }
      function up() {
        pre.removeEventListener('pointermove', move);
        pre.classList.remove('kat-diagram-dragging');
      }
      pre.addEventListener('pointermove', move);
      pre.addEventListener('pointerup', up, { once: true });
      pre.addEventListener('pointercancel', up, { once: true });
      pre.focus({ preventScroll: true }); // preventDefault below suppresses native focus
      e.preventDefault(); // no text selection while dragging
    });

    pre.addEventListener('dblclick', function (e) {
      e.preventDefault();
      reset(pre);
    });

    pre.addEventListener('keydown', function (e) {
      if (e.key === '+' || e.key === '=') zoomCenter(pre, 1.25);
      else if (e.key === '-' || e.key === '_') zoomCenter(pre, 0.8);
      else if (e.key === 'ArrowLeft') pan(pre, 40, 0);
      else if (e.key === 'ArrowRight') pan(pre, -40, 0);
      else if (e.key === 'ArrowUp') pan(pre, 0, 40);
      else if (e.key === 'ArrowDown') pan(pre, 0, -40);
      else if (e.key === '0') reset(pre);
      else return;
      e.preventDefault();
    });
  }

  var scanQueued = false;
  function scan() {
    scanQueued = false;
    var pres = document.querySelectorAll('pre.mermaid');
    for (var i = 0; i < pres.length; i++) {
      var pre = pres[i];
      // CRITICAL: astro-mermaid snapshots the pre's TEXT as the diagram
      // source on its first render — touching the pre before that corrupts
      // the diagram code. Only handle pres it has fully rendered.
      if (!pre.hasAttribute('data-processed') || !pre.querySelector('svg')) continue;
      attach(pre);
      ensureControls(pre);
      apply(pre); // re-applies the stored transform after a theme re-render
    }
  }
  function queueScan() {
    if (scanQueued) return;
    scanQueued = true;
    requestAnimationFrame(scan);
  }

  function init() {
    queueScan();
    new MutationObserver(queueScan).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
