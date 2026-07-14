
(function () {
  'use strict';

  function stripInlineWidths(wrap) {

    var targets = [wrap];
    var inner = wrap.querySelectorAll('.scroll-wrapper, .scroll-content');
    for (var i = 0; i < inner.length; i++) targets.push(inner[i]);
    for (var j = 0; j < targets.length; j++) {
      var s = targets[j].style;
      if (s.width) s.removeProperty('width');
      if (s.minWidth) s.removeProperty('min-width');
      if (s.maxWidth) s.removeProperty('max-width');
      if (s.height) s.removeProperty('height');
    }

    var tbl = wrap.querySelector('.kb-benefits__table');
    if (tbl) {
      var enforce = {
        'width': '100%',
        'max-width': '100%',
        'margin-left': '0px',
        'margin-right': '0px',
        'transform': 'none',
        'position': 'static',
        'border-collapse': 'collapse',
        'table-layout': 'fixed'
      };
      for (var p in enforce) {
        if (tbl.style.getPropertyValue(p) !== enforce[p] ||
            tbl.style.getPropertyPriority(p) !== 'important') {
          tbl.style.setProperty(p, enforce[p], 'important');
        }
      }
    }
  }

  function watchInlineWidths(wrap) {
    if (!window.MutationObserver) return;
    var mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var el = muts[i].target;
        if (el.style && (el.style.width || el.style.minWidth ||
            el.style.maxWidth || el.style.height)) {
          stripInlineWidths(wrap);
          break;
        }
      }
    });
    mo.observe(wrap, {
      attributes: true,
      attributeFilter: ['style'],
      subtree: true
    });
  }

  function initKbScrollbar(wrap) {
    if (wrap.dataset.kbScrollbar === '1') return;
    wrap.dataset.kbScrollbar = '1';

    stripInlineWidths(wrap);
    watchInlineWidths(wrap);

    var track = document.createElement('div');
    track.className = 'kb-benefits__sbtrack';
    var thumb = document.createElement('div');
    thumb.className = 'kb-benefits__sbthumb';
    track.appendChild(thumb);
    wrap.parentNode.insertBefore(track, wrap.nextSibling);

    var dragging = false;
    var dragStartX = 0;
    var dragStartScroll = 0;

    function update() {
      var sw = wrap.scrollWidth;
      var cw = wrap.clientWidth;
      if (sw <= cw + 1) {
        track.style.display = 'none';
        return;
      }
      track.style.display = '';
      var trackW = track.clientWidth;
      var thumbW = Math.max(40, (cw / sw) * trackW);
      var maxScroll = sw - cw;
      var maxThumb = trackW - thumbW;
      var x = maxScroll > 0 ? (wrap.scrollLeft / maxScroll) * maxThumb : 0;
      thumb.style.width = thumbW + 'px';
      thumb.style.transform = 'translateX(' + x + 'px)';
    }

    wrap.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    function pointerDown(e) {
      dragging = true;
      dragStartX = (e.touches ? e.touches[0].clientX : e.clientX);
      dragStartScroll = wrap.scrollLeft;
      document.body.style.userSelect = 'none';
      e.preventDefault();
    }

    function pointerMove(e) {
      if (!dragging) return;
      var x = (e.touches ? e.touches[0].clientX : e.clientX);
      var trackW = track.clientWidth;
      var thumbW = thumb.clientWidth;
      var maxThumb = trackW - thumbW;
      var maxScroll = wrap.scrollWidth - wrap.clientWidth;
      if (maxThumb > 0) {
        wrap.scrollLeft = dragStartScroll + ((x - dragStartX) / maxThumb) * maxScroll;
      }
    }

    function pointerUp() {
      dragging = false;
      document.body.style.userSelect = '';
    }

    thumb.addEventListener('mousedown', pointerDown);
    thumb.addEventListener('touchstart', pointerDown, { passive: false });
    document.addEventListener('mousemove', pointerMove);
    document.addEventListener('touchmove', pointerMove, { passive: true });
    document.addEventListener('mouseup', pointerUp);
    document.addEventListener('touchend', pointerUp);

    track.addEventListener('mousedown', function (e) {
      if (e.target !== track) return;
      var rect = track.getBoundingClientRect();
      var ratio = (e.clientX - rect.left) / track.clientWidth;
      wrap.scrollLeft = ratio * (wrap.scrollWidth - wrap.clientWidth);
    });

    update();
  }

  function initAll() {
    var wraps = document.querySelectorAll('.kb-benefits .kb-benefits__wrap');
    for (var i = 0; i < wraps.length; i++) initKbScrollbar(wraps[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  window.addEventListener('load', function () {
    var wraps = document.querySelectorAll('.kb-benefits .kb-benefits__wrap');
    for (var i = 0; i < wraps.length; i++) stripInlineWidths(wraps[i]);
  });
})();
