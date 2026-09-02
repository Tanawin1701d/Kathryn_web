/* Auto-scroll the nav sidebar to the current page.
 *
 * The sidebar lists all three books, so arriving on a deep page (e.g. the
 * landing page's "Kathryn C++ book" button) can leave the highlighted entry
 * far below the fold of the sidebar pane. On load, find the current entry
 * ([aria-current="page"]) and scroll its nearest scrollable ancestor so the
 * entry sits roughly centered — but only when it is not already visible, so
 * Starlight's own restored scroll position is left alone when it suffices.
 */
(function () {
  function init() {
    requestAnimationFrame(function () {
      var cur = document.querySelector('.sidebar-pane [aria-current="page"]');
      if (!cur) return;
      // find the ancestor that actually scrolls: overflow-y auto/scroll AND
      // overflowing (an inner list can overflow without being scrollable —
      // assigning scrollTop there is a silent no-op)
      var scroller = cur.parentElement;
      while (scroller && scroller !== document.body) {
        var oy = getComputedStyle(scroller).overflowY;
        if ((oy === 'auto' || oy === 'scroll') &&
            scroller.scrollHeight > scroller.clientHeight) break;
        scroller = scroller.parentElement;
      }
      if (!scroller || scroller === document.body) return;
      var sRect = scroller.getBoundingClientRect();
      var cRect = cur.getBoundingClientRect();
      if (cRect.top >= sRect.top && cRect.bottom <= sRect.bottom) return;
      scroller.scrollTop +=
        (cRect.top - sRect.top) - scroller.clientHeight / 2 + cur.clientHeight / 2;
    });
  }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('astro:page-load', init);
})();
