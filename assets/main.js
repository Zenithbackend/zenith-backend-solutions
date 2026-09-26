/* Zenith Backend Solutions — interactions
   Plain JS, no dependencies. Every enhancement degrades gracefully:
   content is fully readable and forms still POST without JavaScript. */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var body = document.body;

  /* ---------- footer year ---------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- header: solid on scroll + reading progress ---------- */
  var header = $('.site-header');
  if (header) {
    var ticking = false;
    var onScroll = function () {
      var y = window.scrollY || 0;
      header.classList.toggle('is-scrolled', y > 8);
      var max = document.documentElement.scrollHeight - window.innerHeight;
      header.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
      ticking = false;
    };
    onScroll();
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
  }

  /* ---------- desktop dropdown menus ---------- */
  var menus = $$('.has-menu');
  function closeMenus(except) {
    menus.forEach(function (li) {
      if (li === except) return;
      var b = $('[data-menu-btn]', li), m = $('.menu', li);
      b.setAttribute('aria-expanded', 'false');
      m.classList.remove('is-open');
    });
  }
  menus.forEach(function (li) {
    var btn = $('[data-menu-btn]', li), menu = $('.menu', li), t;
    function open() { clearTimeout(t); closeMenus(li); btn.setAttribute('aria-expanded', 'true'); menu.classList.add('is-open'); }
    function close() { btn.setAttribute('aria-expanded', 'false'); menu.classList.remove('is-open'); }
    btn.addEventListener('click', function () {
      // Hover already opens the menu on mouse devices, so a click must not immediately close it.
      if (finePointer) open();
      else btn.getAttribute('aria-expanded') === 'true' ? close() : open();
    });
    if (finePointer) {
      li.addEventListener('mouseenter', open);
      li.addEventListener('mouseleave', function () { t = setTimeout(close, 140); });
    }
    li.addEventListener('focusout', function (e) {
      if (!li.contains(e.relatedTarget)) close();
    });
    li.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { close(); btn.focus(); }
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-menu')) closeMenus();
  });

  /* ---------- mobile sheet ---------- */
  var toggle = $('#menuToggle'), sheet = $('#mobileSheet');
  function setSheet(open) {
    if (!toggle || !sheet) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    sheet.classList.toggle('is-open', open);
    header.classList.toggle('is-open', open);
    body.classList.toggle('is-locked', open);
    updateDock();
  }
  if (toggle && sheet) {
    toggle.addEventListener('click', function () { setSheet(toggle.getAttribute('aria-expanded') !== 'true'); });
    $$('a', sheet).forEach(function (a) { a.addEventListener('click', function () { setSheet(false); }); });
    $$('[data-open-trial]', sheet).forEach(function (b) { b.addEventListener('click', function () { setSheet(false); }); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1100) setSheet(false); });
  }

  /* ---------- scroll reveal: only what is below the fold is ever hidden ---------- */
  var rv = $$('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var vh = window.innerHeight;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.remove('is-pending'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rv.forEach(function (el) {
      if (el.getBoundingClientRect().top > vh * 0.92) { el.classList.add('is-pending'); io.observe(el); }
    });
  }

  /* ---------- counters ---------- */
  var counters = $$('[data-count-to]');
  if (counters.length && 'IntersectionObserver' in window && !reduce) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, to = parseFloat(el.getAttribute('data-count-to')), suf = el.getAttribute('data-count-suffix') || '';
        var t0 = null, dur = 1400;
        (function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + suf;
          if (p < 1) requestAnimationFrame(step);
        })(performance.now());
        cio.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) {
      var to = el.getAttribute('data-count-to'), suf = el.getAttribute('data-count-suffix') || '';
      el.textContent = '0' + suf; el.setAttribute('aria-label', to + suf); cio.observe(el);
    });
  }

  /* ---------- switcher: one-open disclosure group (services, method, client results) ---------- */
  $$('[data-switcher]').forEach(function (group) {
    var items = $$('[data-switch-item]', group);
    var btns = items.map(function (it) { return $('[data-switch-btn]', it); });
    var hoverTimer;
    function activate(i, focus) {
      items.forEach(function (it, j) {
        var on = i === j;
        it.classList.toggle('is-active', on);
        btns[j].setAttribute('aria-expanded', on ? 'true' : 'false');
      });
      if (focus) btns[i].focus();
    }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { activate(i); });
      b.addEventListener('keydown', function (e) {
        var n = btns.length, k = e.key, j = null;
        if (k === 'ArrowDown' || k === 'ArrowRight') j = (i + 1) % n;
        else if (k === 'ArrowUp' || k === 'ArrowLeft') j = (i - 1 + n) % n;
        else if (k === 'Home') j = 0;
        else if (k === 'End') j = n - 1;
        if (j !== null) { e.preventDefault(); activate(j, true); }
      });
      if (finePointer && group.hasAttribute('data-hover')) {
        b.addEventListener('mouseenter', function () { hoverTimer = setTimeout(function () { activate(i); }, 90); });
        b.addEventListener('mouseleave', function () { clearTimeout(hoverTimer); });
      }
    });
    var start = items.findIndex(function (it) { return it.classList.contains('is-active'); });
    activate(start < 0 ? 0 : start);
  });

  /* ---------- scroller: scroll-driven stage indicator (Zenith Method) ---------- */
  $$('[data-scroller]').forEach(function (scroller) {
    var panels = $$('[data-scroller-panel]', scroller);
    var dots = $$('[data-scroller-dot]', scroller);
    var fill = $('[data-scroller-fill]', scroller);
    if (!panels.length || !dots.length) return;
    var current = 0;
    function setActive(i) {
      if (i === current && panels[i].classList.contains('is-active')) return;
      current = i;
      panels.forEach(function (p, j) { p.classList.toggle('is-active', j === i); });
      dots.forEach(function (d, j) { d.classList.toggle('is-active', j === i); });
      if (fill) fill.style.height = (((i + 1) / panels.length) * 100).toFixed(2) + '%';
    }
    dots.forEach(function (d, i) { d.addEventListener('click', function () { setActive(i); }); });
    if ('IntersectionObserver' in window && !reduce) {
      scroller.classList.add('is-live');
      var sio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) setActive(panels.indexOf(en.target));
        });
      }, { rootMargin: '-42% 0px -42% 0px', threshold: 0 });
      panels.forEach(function (p) { sio.observe(p); });
    }
    setActive(0);
  });


  var board = $('[data-board]');
  if (board) {
    var stages = $$('.stage', board), statusEl = $('[data-board-status]', board);
    var labels = ['Bookkeeping', 'Quality check', 'CPA review', 'Reporting'];
    var setStage = function (n) {
      stages.forEach(function (s, i) {
        s.classList.toggle('is-done', i < n - 1);
        s.classList.toggle('is-active', i === n - 1);
      });
      statusEl.classList.remove('is-ok');
      statusEl.textContent = labels[n - 1] + ' in progress';
      if (n === 3) statusEl.textContent = 'In CPA review';
    };
    var finish = function () {
      stages.forEach(function (s) { s.classList.remove('is-active'); s.classList.add('is-done'); });
      board.classList.add('is-signed');
      statusEl.classList.add('is-ok');
      statusEl.textContent = 'Signed off · ready to deliver';
    };
    if (reduce) { board.classList.remove('is-prep'); finish(); }
    else {
      var script = [[450, function () { board.classList.remove('is-prep'); setStage(1); }],
        [1900, function () { setStage(2); }],
        [3300, function () { setStage(3); }],
        [5200, finish]];
      script.forEach(function (s) { setTimeout(s[1], s[0]); });
    }
  }

  /* ---------- review flow: bookkeeping → QA → CPA review → reporting ---------- */
  var flow = $('[data-flow]');
  if (flow) {
    var fsteps = $$('.flow__step', flow), ftabs = $$('.flow__tab', flow), fpanels = $$('.flow__panel', flow);
    var touched = false;
    var setFlow = function (i, focus) {
      fsteps.forEach(function (s, j) {
        s.classList.toggle('is-current', j === i);
        s.classList.toggle('is-passed', j < i);
        ftabs[j].setAttribute('aria-selected', j === i ? 'true' : 'false');
        ftabs[j].setAttribute('tabindex', j === i ? '0' : '-1');
        fpanels[j].classList.toggle('is-active', j === i);
      });
      flow.style.setProperty('--fill', (i / (fsteps.length - 1)).toFixed(3));
      if (focus) ftabs[i].focus();
    };
    ftabs.forEach(function (t, i) {
      t.addEventListener('click', function () { touched = true; setFlow(i); });
      t.addEventListener('keydown', function (e) {
        var n = ftabs.length, j = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % n;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + n) % n;
        else if (e.key === 'Home') j = 0; else if (e.key === 'End') j = n - 1;
        if (j !== null) { e.preventDefault(); touched = true; setFlow(j, true); }
      });
    });
    setFlow(2);
    if (!reduce && 'IntersectionObserver' in window) {
      setFlow(0);
      var fio = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        fio.disconnect();
        [900, 2500, 4100].forEach(function (ms, k) {
          setTimeout(function () { if (!touched) setFlow(k === 0 ? 1 : 2); }, ms);
        });
      }, { threshold: 0.45 });
      fio.observe(flow);
    }
  }

  /* ---------- in-house vs Zenith: what would you need to cover? ---------- */
  var checker = $('[data-checker]');
  if (checker) {
    var boxes = $$('input[type="checkbox"]', checker), nEl = $('[data-check-n]', checker), inEl = $('[data-check-in]', checker), zEl = $('[data-check-z]', checker);
    var render = function () {
      var n = boxes.filter(function (b) { return b.checked; }).length;
      if (!n) {
        inEl.innerHTML = 'Select what you need covered to see what an internal team involves.';
        zEl.textContent = 'One team, reviewed by a CPA.';
        return;
      }
      inEl.innerHTML = 'You would hire, train, manage and back up <span class="num">' + n + '</span> ' + (n === 1 ? 'responsibility' : 'responsibilities') + ', and still need someone to check the work.';
      zEl.textContent = n === 1 ? 'One responsibility, one accountable team, reviewed before delivery.' : 'All ' + n + ' under one accountable team, reviewed before delivery.';
    };
    boxes.forEach(function (b) { b.addEventListener('change', render); });
    render();
  }

  /* ---------- trial journey: scrub through the 14 days ---------- */
  var journey = $('[data-journey]');
  if (journey) {
    var range = $('input[type="range"]', journey), out = $('output', journey), phases = $$('.phase', journey), ticks = $$('.ticks i', journey);
    var dTitle = $('[data-j-title]', journey), dText = $('[data-j-text]', journey), dOut = $('[data-j-out]', journey);
    var paint = function (day) {
      var cur = phases.filter(function (p) { return day >= +p.dataset.start && day <= +p.dataset.end; })[0] || phases[0];
      out.textContent = day;
      range.setAttribute('aria-valuetext', 'Day ' + day + ', ' + cur.dataset.title);
      phases.forEach(function (p) { p.setAttribute('aria-pressed', p === cur ? 'true' : 'false'); });
      ticks.forEach(function (t, i) { t.classList.toggle('on', i + 1 >= +cur.dataset.start && i + 1 <= +cur.dataset.end); });
      dTitle.textContent = cur.dataset.title; dText.textContent = cur.dataset.text; dOut.textContent = cur.dataset.out;
    };
    range.addEventListener('input', function () { paint(+range.value); });
    phases.forEach(function (p) { p.addEventListener('click', function () { range.value = p.dataset.start; paint(+p.dataset.start); }); });
    paint(+range.value);
  }

  /* ---------- security layers <-> rings ---------- */
  var layers = $$('.layer[data-ring]');
  if (layers.length) {
    var rings = $$('[data-ring-el]');
    var light = function (id) {
      rings.forEach(function (r) { r.classList.toggle('is-active', r.getAttribute('data-ring-el') === id); });
      layers.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('data-ring') === id); });
    };
    layers.forEach(function (l) {
      l.addEventListener('mouseenter', function () { light(l.getAttribute('data-ring')); });
      l.addEventListener('mouseleave', function () { light(''); });
    });
  }

  /* ---------- services page: audience toggle + scrollspy ---------- */
  var audBtns = $$('[data-aud-set]');
  if (audBtns.length) {
    var setAud = function (a) {
      body.setAttribute('data-aud', a);
      audBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-aud-set') === a ? 'true' : 'false'); });
    };
    var q = /[?&]for=(firm|business)/.exec(location.search);
    setAud(q ? q[1] : 'business');
    audBtns.forEach(function (b) { b.addEventListener('click', function () { setAud(b.getAttribute('data-aud-set')); }); });
  }
  var spyLinks = $$('.svc-nav a[href^="#"]');
  if (spyLinks.length && 'IntersectionObserver' in window) {
    var chapters = spyLinks.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        spyLinks.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + en.target.id;
          a.classList.toggle('is-current', on);
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
          if (on && a.scrollIntoView && window.innerWidth < 1024) {
            var nav = a.closest('.svc-nav'); nav.scrollTo({ left: a.offsetLeft - 24, behavior: reduce ? 'auto' : 'smooth' });
          }
        });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    chapters.forEach(function (c) { spy.observe(c); });
  }

  /* ---------- FAQ: one open per group ---------- */
  $$('.faq-group').forEach(function (g) {
    var items = $$('details.faq-item', g);
    items.forEach(function (it) {
      it.addEventListener('toggle', function () {
        if (it.open) items.forEach(function (o) { if (o !== it) o.removeAttribute('open'); });
      });
    });
  });

  /* ---------- trial modal (focus-trapped, restores focus) ---------- */
  var modal = $('#trialModal'), lastFocus = null;
  function focusables(root) {
    return $$('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])', root)
      .filter(function (el) { return el.offsetParent !== null && !el.closest('.hp'); });
  }
  window.openTrialModal = function () {
    if (!modal) return;
    lastFocus = document.activeElement;
    $('#trialFormView').hidden = false;
    $('#trialSuccessView').hidden = true;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    body.classList.add('is-locked');
    updateDock();
    setTimeout(function () { var n = $('#trialName'); if (n) n.focus(); }, 60);
  };
  window.closeTrialModal = function () {
    if (!modal || !modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    body.classList.remove('is-locked');
    updateDock();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };
  if (modal) {
    modal.addEventListener('mousedown', function (e) { if (e.target === modal) closeTrialModal(); });
    $$('[data-close-trial]', modal).forEach(function (b) { b.addEventListener('click', closeTrialModal); });
    document.addEventListener('keydown', function (e) {
      if (!modal.classList.contains('is-open')) return;
      if (e.key === 'Escape') { closeTrialModal(); return; }
      if (e.key !== 'Tab') return;
      var f = focusables(modal); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    if (location.hash === '#trial') setTimeout(openTrialModal, 250);
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-open-trial]');
    if (t) { e.preventDefault(); openTrialModal(); }
  });

  /* ---------- forms: inline validation, loading state, graceful failure ---------- */
  function fieldMessage(el) {
    var v = el.validity;
    if (v.valueMissing) return el.getAttribute('data-msg-missing') || 'This field is required.';
    if (v.typeMismatch || v.patternMismatch) return el.getAttribute('data-msg-type') || 'Check the format of this field.';
    return el.validationMessage;
  }
  function validateField(el) {
    var wrap = el.closest('.field'), err = wrap && $('.field__err', wrap);
    if (!wrap || !err) return true;
    var ok = el.checkValidity();
    wrap.classList.toggle('has-error', !ok);
    if (ok) { el.removeAttribute('aria-invalid'); err.textContent = ''; }
    else { el.setAttribute('aria-invalid', 'true'); err.textContent = fieldMessage(el); }
    return ok;
  }
  function bindForm(form, cfg) {
    if (!form) return;
    var btn = $('[type="submit"]', form), errBox = $(cfg.errorBox), label = btn.textContent;
    var fields = $$('input:not([type="hidden"]),select,textarea', form).filter(function (el) { return !el.closest('.hp'); });
    fields.forEach(function (el) {
      el.addEventListener('blur', function () { if (el.value !== '' || el.closest('.field').classList.contains('has-error')) validateField(el); });
      el.addEventListener('input', function () { if (el.closest('.field').classList.contains('has-error')) validateField(el); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      errBox.hidden = true;
      var bad = fields.filter(function (el) { return !validateField(el); });
      if (bad.length) { bad[0].focus(); return; }
      btn.disabled = true; btn.classList.add('is-loading'); btn.textContent = cfg.busy;
      fetch(form.getAttribute('action'), { method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form) })
        .then(function (r) {
          if (!r.ok) throw new Error('Submission failed');
          $(cfg.formView).hidden = true;
          var done = $(cfg.successView); done.hidden = false;
          var h = $('h2,h3', done); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
          form.reset();
        })
        .catch(function () { errBox.hidden = false; errBox.focus(); })
        .then(function () { btn.disabled = false; btn.classList.remove('is-loading'); btn.textContent = label; });
    });
  }
  bindForm($('#trialForm'), { errorBox: '#trialErrorMsg', formView: '#trialFormView', successView: '#trialSuccessView', busy: 'Submitting…' });
  bindForm($('#contactForm'), { errorBox: '#contactErrorMsg', formView: '#contactFormView', successView: '#contactSuccessView', busy: 'Sending…' });

  /* ---------- mobile CTA dock ---------- */
  var dock = $('.dock'), sentinel = $('[data-dock-sentinel]'), hideEls = $$('[data-dock-hide]');
  var pastSentinel = !sentinel, overHide = false;
  function updateDock() {
    if (!dock) return;
    var blocked = body.classList.contains('is-locked');
    dock.classList.toggle('is-visible', pastSentinel && !overHide && !blocked);
  }
  if (dock) {
    if (sentinel && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        var r = en[0]; pastSentinel = !r.isIntersecting && r.boundingClientRect.top < 0; updateDock();
      }).observe(sentinel);
    } else if (!sentinel) {
      var chk = function () { pastSentinel = (window.scrollY || 0) > 480; updateDock(); };
      window.addEventListener('scroll', chk, { passive: true }); chk();
    }
    if (hideEls.length && 'IntersectionObserver' in window) {
      var seen = new Set();
      var hio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { en.isIntersecting ? seen.add(en.target) : seen.delete(en.target); });
        overHide = seen.size > 0; updateDock();
      }, { threshold: 0.2 });
      hideEls.forEach(function (el) { hio.observe(el); });
    }
    updateDock();
  }

  /* ---------- industry cards: mouse-tracked spotlight ---------- */
  var indCards = $$('.industry-card');
  if (indCards.length && finePointer && !reduce) {
    indCards.forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- hero scroll parallax (subtle, rAF-throttled) ---------- */
  var heroEl = $('.hero');
  if (heroEl && !reduce) {
    var heroTicking = false;
    var onHeroScroll = function () {
      var r = heroEl.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) {
        var p = Math.max(-1, Math.min(1, -r.top / (r.height || 1)));
        heroEl.style.setProperty('--py', (p * 36).toFixed(1) + 'px');
      }
      heroTicking = false;
    };
    onHeroScroll();
    window.addEventListener('scroll', function () {
      if (!heroTicking) { heroTicking = true; requestAnimationFrame(onHeroScroll); }
    }, { passive: true });
  }

  /* ---------- magnetic / glow CTAs ---------- */
  var magnets = $$('[data-magnetic]');
  if (magnets.length && finePointer && !reduce) {
    magnets.forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var mx = e.clientX - r.left, my = e.clientY - r.top;
        btn.style.setProperty('--mx', mx + 'px');
        btn.style.setProperty('--my', my + 'px');
        var dx = (mx / r.width - 0.5) * 8, dy = (my / r.height - 0.5) * 8;
        btn.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
      });
      btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
    });
  }
})();
