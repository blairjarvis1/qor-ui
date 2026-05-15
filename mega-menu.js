/* ── Mega Menu — header state + page scrim ──────────────────────── */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var header   = document.querySelector('.site-header');
    var megaItem = document.querySelector('.nav-item--mega');
    var megaMenu = document.querySelector('.mega-menu');
    if (!header || !megaItem) return;

    // Create scrim and append to body
    var scrim = document.createElement('div');
    scrim.className = 'mega-scrim';
    document.body.appendChild(scrim);

    var isOpen = false;
    var closeTimer = null;

    function open() {
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
      if (isOpen) return;
      isOpen = true;
      header.classList.add('mega-open');
      scrim.classList.add('is-visible');
    }

    function scheduleClose() {
      if (!isOpen) return;
      clearTimeout(closeTimer);
      closeTimer = setTimeout(function () {
        isOpen = false;
        header.classList.remove('mega-open');
        scrim.classList.remove('is-visible');
      }, 80);
    }

    // Use document mouseover — fires from any direction, not just top-to-bottom
    document.addEventListener('mouseover', function (e) {
      var inItem = megaItem.contains(e.target);
      var inMenu = megaMenu && megaMenu.contains(e.target);
      if (inItem || inMenu) {
        open();
      } else {
        scheduleClose();
      }
    });

    // Clicking scrim closes immediately
    scrim.addEventListener('click', function () {
      clearTimeout(closeTimer);
      isOpen = false;
      header.classList.remove('mega-open');
      scrim.classList.remove('is-visible');
    });
  });
})();
