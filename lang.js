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
   * Off since 2026-08-25, and this is now the normal behaviour: a first-time
   * visitor is moved to /zh only if their own browser asks for Traditional
   * Chinese. Everyone else stays on the English page they asked for.
   *
   * It was true while every tester was a Chinese speaker and the English
   * pages were the ones nobody wanted to land on. That stopped being true
   * when 1.4.2 went to Apple and Google Play: the audience is now whoever
   * finds the app in a store, most of them English-speaking, and one of them
   * is an App Store reviewer. Sending all of them to a page they cannot read
   * was costing more than it ever bought.
   *
   * Setting it back to true sends EVERYONE to Chinese again, which is almost
   * certainly not what you want — prefer leaving it false and letting
   * `wantsZh` below do the deciding.
   *
   * The two protections either way are below and must stay: crawlers are
   * never redirected, so the English pages keep being indexed on their own
   * URLs, and anyone who clicks the switcher is remembered forever.
   */
  var DEFAULT_TO_ZH = false;
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

  // ANY Chinese, not just Traditional — the same rule the app applies in
  // useLanguageStore.languageForLocale, and for the same reason recorded
  // there: a Simplified reader can read Traditional far more comfortably
  // than they can read English, so showing them the script we have beats
  // showing them a language they may not have at all.
  //
  // This used to exclude zh-CN/zh-SG/zh-Hans, with a comment claiming the app
  // agreed. The app does not, and the exclusion did not even work: it tested
  // `some()` across the whole list, so a browser sending ['zh-CN', 'zh'] —
  // which is what a Simplified browser typically sends — matched on the bare
  // 'zh' and was redirected anyway. The result depended on list order, which
  // is not a decision anyone made. Nothing exposed it while DEFAULT_TO_ZH
  // sent everybody to /zh regardless.
  // navigator.languages is in PREFERENCE order, and that order is the whole
  // answer. `some()` would only ask "is there Chinese anywhere in this list",
  // which sends a reader whose languages are ['en-US', 'en', 'zh-TW'] — an
  // English speaker who also reads Chinese — to a page they did not ask for.
  // Chinese wins only when it is asked for BEFORE English is.
  var langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
  var firstZh = -1, firstEn = -1;
  for (var i = 0; i < langs.length; i++) {
    if (firstZh < 0 && /^zh([-_]|$)/i.test(langs[i])) firstZh = i;
    if (firstEn < 0 && /^en([-_]|$)/i.test(langs[i])) firstEn = i;
  }
  var wantsZh = firstZh >= 0 && (firstEn < 0 || firstZh < firstEn);

  if ((DEFAULT_TO_ZH || wantsZh) && !here) location.replace(otherHref(path, true) + location.hash);
})();
