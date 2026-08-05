/**
 * Language: the /zh mirror, the switcher, and the first-visit redirect.
 *
 * Every page exists twice — `/thing` in English and `/zh/thing` in Traditional
 * Chinese — and the two are declared equivalent to search engines with
 * `hreflang` in the head. This file is only about getting a human to the right
 * one and letting them override it.
 *
 * ## Why the redirect is here and not in vercel.json
 *
 * A server-side redirect keyed on Accept-Language is the obvious way to do
 * this, and it is the one that can quietly cost you the Chinese pages
 * entirely. Googlebot crawls from the US announcing English; a server that
 * bounces on the header would serve it English forever and `/zh` might never be
 * indexed — which would defeat the whole point of having separate URLs.
 *
 * Doing it in the browser instead means the crawler always receives the real
 * HTML of the URL it asked for. The redirect is a nicety for people, not part
 * of how the site is served.
 *
 * ## The choice has to stick
 *
 * Auto-redirect without memory is a trap: a reader whose browser is set to
 * Chinese clicks "English", and is instantly thrown back. So a manual switch
 * writes `tadapop-lang` to localStorage and that always wins afterwards. The
 * automatic move happens once, on a first visit, and never again.
 *
 * Bots are skipped outright as a second line of defence, and anything with
 * `?lang=` in the URL is treated as an explicit request.
 */
(function () {
  var KEY = 'tadapop-lang';

  /**
   * TEMPORARY: send everyone to Chinese on a first visit, not just people whose
   * browser asks for it. Every tester is a Chinese speaker right now, so the
   * English pages are the ones nobody wants to land on.
   *
   * **Set this to false when that stops being true.** It is the whole switch —
   * flipping it restores the normal behaviour, which is to move only visitors
   * whose browser actually asks for Traditional Chinese.
   *
   * The two protections that make this survivable are below and must stay:
   * crawlers are never redirected (so the English pages keep being indexed on
   * their own URLs), and anyone who clicks "English" is remembered forever.
   * Without the second one this would be a trap — an English reader would be
   * thrown back to Chinese on every single page load.
   */
  var DEFAULT_TO_ZH = true;
  var BOT = /bot|crawl|spider|slurp|bingpreview|duckduckbot|baiduspider|yandex|facebookexternalhit|embedly|quora link preview|whatsapp|telegram|lighthouse|headlesschrome/i;

  /** '/zh/rules' -> '/rules'; '/rules' -> '/rules'. Always the English path. */
  function basePath(path) {
    var p = path.replace(/^\/zh(?=\/|$)/, '');
    return p === '' ? '/' : p;
  }

  function isZh(path) {
    return /^\/zh(\/|$)/.test(path);
  }

  /** Where the same page lives in the other language. */
  function otherHref(path, toZh) {
    var base = basePath(path);
    return toZh ? '/zh' + (base === '/' ? '' : base) : base;
  }

  var path = location.pathname.replace(/\/index\.html$/, '/');
  var here = isZh(path);

  // ---- 1. The switcher ---------------------------------------------------
  // Rendered from JS so the markup lives in one place rather than in nine
  // copies that can drift. It is a real link, so it still works if the script
  // is blocked and is crawlable as an alternate.
  function mount() {
    var host = document.querySelector('[data-lang-switch]');
    if (!host) return;
    var a = document.createElement('a');
    a.className = 'lang-switch';
    a.href = otherHref(path, !here);
    a.setAttribute('lang', here ? 'en' : 'zh-Hant');
    a.textContent = here ? 'English' : '繁體中文';
    a.addEventListener('click', function () {
      // An explicit choice, remembered — otherwise the redirect below would
      // undo it on the very next page load.
      try {
        localStorage.setItem(KEY, here ? 'en' : 'zh');
      } catch (e) {
        /* private mode: the click still navigates, it just won't be sticky */
      }
    });
    host.appendChild(a);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();

  // ---- 2. The first-visit redirect --------------------------------------
  var qs = new URLSearchParams(location.search);
  if (qs.has('lang')) {
    try {
      localStorage.setItem(KEY, qs.get('lang') === 'zh' ? 'zh' : 'en');
    } catch (e) {
      /* ignore */
    }
    return;
  }

  if (BOT.test(navigator.userAgent || '')) return;

  var saved = null;
  try {
    saved = localStorage.getItem(KEY);
  } catch (e) {
    /* ignore */
  }
  if (saved) return; // they have chosen; never move them again

  // Traditional Chinese only. A zh-CN reader is a Simplified reader, and
  // sending them to a Traditional page is not a kindness — the app makes the
  // same distinction (see useLanguageStore.languageForLocale).
  var langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
  var wantsZh = langs.some(function (l) {
    return /^zh\b/i.test(l) && !/^zh[-_](CN|SG|Hans)/i.test(l);
  });

  if ((DEFAULT_TO_ZH || wantsZh) && !here) location.replace(otherHref(path, true) + location.hash);
})();
