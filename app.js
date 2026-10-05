/* ==========================================================================
   骡马 LuoMa · 展示页脚本
   只做三件事：分页点导航、键盘方向键、从 GitHub 取最新版本信息。
   全部是最外层 try/catch + 兜底，脚本完全失效时页面依然可用
   （下载按钮的 href 已经指向 /releases/latest）。
   ========================================================================== */

(function () {
  'use strict';

  var REPO = 'AchooLuv/LuoMaAPK';
  var API = 'https://api.github.com/repos/' + REPO + '/releases/latest';
  var FALLBACK = 'https://github.com/' + REPO + '/releases/latest';
  var CACHE_KEY = 'luoma.latest.v1';
  var CACHE_TTL = 10 * 60 * 1000; // 10 分钟，避免反复打 API（未认证每小时 60 次）

  /* ------------------------------------------------------------ 分页点 */

  function initDots() {
    var dots = Array.prototype.slice.call(document.querySelectorAll('.dots button'));
    var slides = Array.prototype.slice.call(document.querySelectorAll('main .slide'));
    if (!dots.length || !slides.length) return;

    var byId = {};
    slides.forEach(function (el) { byId[el.id] = el; });

    function currentIndex() {
      // 取距离视口顶部最近的一屏
      var best = 0;
      var bestDist = Infinity;
      slides.forEach(function (el, i) {
        var d = Math.abs(el.getBoundingClientRect().top);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      return best;
    }

    function sync() {
      var i = currentIndex();
      dots.forEach(function (dot, n) {
        dot.setAttribute('aria-current', n === i ? 'true' : 'false');
      });
    }

    // 点击：点本身、以及任何带 data-goto 的元素
    Array.prototype.forEach.call(
      document.querySelectorAll('[data-goto]'),
      function (el) {
        el.addEventListener('click', function () {
          var target = byId[el.getAttribute('data-goto')];
          if (target) {
            target.scrollIntoView({
              behavior: prefersReducedMotion() ? 'auto' : 'smooth',
              block: 'start'
            });
          }
        });
      }
    );

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(sync, {
        rootMargin: '-45% 0px -45% 0px',
        threshold: 0
      });
      slides.forEach(function (el) { io.observe(el); });
    } else {
      window.addEventListener('scroll', sync, { passive: true });
    }
    sync();

    /* ---------------------------------------------------- 键盘方向键 */

    var idx = currentIndex();
    window.addEventListener('keydown', function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      var tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      var step = 0;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') step = 1;
      else if (e.key === 'ArrowUp' || e.key === 'PageUp') step = -1;
      else if (e.key === 'Home') { idx = 0; e.preventDefault(); go(); return; }
      else if (e.key === 'End') { idx = slides.length - 1; e.preventDefault(); go(); return; }
      else return;

      // 用当前屏重新定位，避免连续按键时错位
      idx = Math.min(slides.length - 1, Math.max(0, currentIndex() + step));
      e.preventDefault();
      go();

      function go() {
        slides[idx].scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          block: 'start'
        });
      }
    });
  }

  function prefersReducedMotion() {
    return window.matchMedia &&
           window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ------------------------------------------------- 最新版本信息 */

  function formatSize(bytes) {
    if (!bytes || bytes < 0) return '—';
    var mb = bytes / 1024 / 1024;
    return mb.toFixed(2) + ' MB（' + bytes.toLocaleString('en-US') + ' 字节）';
  }

  function applyRelease(rel) {
    if (!rel || !rel.tag_name) return;

    var assets = rel.assets || [];
    var apk = null;
    for (var i = 0; i < assets.length; i++) {
      if (/\.apk$/i.test(assets[i].name)) { apk = assets[i]; break; }
    }

    setText('[data-version]', '最新版本 ' + rel.tag_name);
    if (apk) {
      setText('[data-asset]', apk.name);
      setText('[data-size]', formatSize(apk.size));

      // 让下载按钮直接指向 APK 文件，少一次点击
      Array.prototype.forEach.call(
        document.querySelectorAll('[data-download]'),
        function (a) { a.setAttribute('href', apk.browser_download_url); }
      );
    }
    // 页面标题里补上版本，方便收藏 / 分享时看出是哪一版
    document.title = '骡马 LuoMa ' + rel.tag_name + ' · 磁力链播放器';
  }

  function setText(sel, text) {
    Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
      el.textContent = text;
    });
  }

  function readCache() {
    try {
      var raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || Date.now() - obj.t > CACHE_TTL) return null;
      return obj.d;
    } catch (e) { return null; }
  }

  function writeCache(data) {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), d: data }));
    } catch (e) { /* 隐私模式下 sessionStorage 可能不可用，忽略 */ }
  }

  function initRelease() {
    // 兜底：先把按钮指向 release 列表页
    Array.prototype.forEach.call(
      document.querySelectorAll('[data-download]'),
      function (a) {
        if (!a.getAttribute('href') || a.getAttribute('href') === '#') {
          a.setAttribute('href', FALLBACK);
        }
      }
    );

    var cached = readCache();
    if (cached) { applyRelease(cached); return; }

    if (!window.fetch) return;

    fetch(API, { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (rel) {
        applyRelease(rel);
        writeCache(rel);
      })
      .catch(function () {
        // 网络或限额问题：保持兜底链接，页面照常可用
      });
  }

  /* ------------------------------------------------------------ 启动 */

  function boot() {
    try { initDots(); } catch (e) { /* 导航失效不影响阅读 */ }
    try { initRelease(); } catch (e) { /* 版本信息取不到也不影响下载 */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
