/**
 * The site header's disclosure, in one place.
 *
 * The header is mounted on every page now, not just the home page, so this
 * behaviour had to stop living in an inline <script> on the home page — the
 * alternative was the same twenty lines copied into fourteen documents, which
 * is exactly the mistake the skip-link styles were pulled out of.
 *
 * There is ONE <nav> in the markup and two layouts in CSS. Below 900px a
 * button reveals it; above, it is the row. A second, phone-only menu would be
 * simpler to write and would make a screen reader read every link twice.
 *
 * No overlay, no scroll lock and no focus trap: five links are a list, not a
 * modal, and trapping focus in one is worse for keyboard users than leaving
 * it alone. Escape closes and hands focus back, which is the part that
 * actually matters.
 *
 * Safe to load on a page with no header — it returns immediately.
 */
(function () {
  var nav = document.getElementById('siteNav');
  var btn = document.getElementById('navToggle');
  if (!nav || !btn) return;

  function set(open) {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  btn.addEventListener('click', function () {
    set(btn.getAttribute('aria-expanded') !== 'true');
  });

  // Following a link has to close the panel. Without this, an in-page anchor
  // scrolls to a heading sitting behind an open menu.
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) set(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) { set(false); btn.focus(); }
  });

  // Crossing the breakpoint must not strand the panel in the open state.
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900) set(false);
  });
})();
