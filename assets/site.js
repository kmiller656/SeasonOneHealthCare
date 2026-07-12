/* Season One Healthcare marketing site — shared behavior */
document.addEventListener('DOMContentLoaded', function () {

  // Scroll-reveal
  var reveals = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    reveals.forEach(function (e) { e.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (e) { if (!e.classList.contains('in')) io.observe(e); });
  }

  // Mobile overlay nav
  var menuBtn = document.querySelector('.menu-btn');
  var overlay = document.querySelector('.mobile-overlay');
  var closeBtn = document.querySelector('.mobile-overlay-close');
  function openOverlay() {
    overlay.classList.add('open');
    document.body.classList.add('no-scroll');
    menuBtn.setAttribute('aria-expanded', 'true');
  }
  function closeOverlay() {
    overlay.classList.remove('open');
    document.body.classList.remove('no-scroll');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
  if (menuBtn && overlay) {
    menuBtn.addEventListener('click', openOverlay);
    if (closeBtn) closeBtn.addEventListener('click', closeOverlay);
    overlay.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeOverlay); });
  }

  // Newsletter consent checkbox enables its Join button
  document.querySelectorAll('[data-consent]').forEach(function (cb) {
    var btn = document.querySelector('[data-consent-target="' + cb.id + '"]');
    if (btn) cb.addEventListener('change', function () { btn.disabled = !cb.checked; });
  });

  // Directory search + tag filtering (providers / resources / shop / jobs)
  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('.filter-input');
    var chips = scope.querySelectorAll('.filter-chip');
    var cards = scope.querySelectorAll('.item-card');
    var activeTag = '';
    function apply() {
      var q = (input && input.value || '').trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || card.textContent).toLowerCase();
        var tags = (card.getAttribute('data-tags') || '').split(',');
        var matchesText = !q || text.indexOf(q) !== -1;
        var matchesTag = !activeTag || tags.indexOf(activeTag) !== -1;
        card.style.display = (matchesText && matchesTag) ? '' : 'none';
      });
    }
    if (input) input.addEventListener('input', apply);
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        activeTag = chip.getAttribute('data-tag') || '';
        apply();
      });
    });
  });

  // Smooth in-page anchor scrolling
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  // Generic Web3Forms submit handler — any <form data-web3forms> with a .form-success/.form-error box
  document.querySelectorAll('form[data-web3forms]').forEach(function (form) {
    var successEl = form.querySelector('.form-success');
    var errorEl = form.querySelector('.form-error');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      if (errorEl) errorEl.style.display = 'none';
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.success) {
            form.reset();
            form.style.display = 'none';
            if (successEl) successEl.style.display = 'block';
          } else if (errorEl) {
            errorEl.style.display = 'block';
            if (btn) btn.disabled = false;
          }
        })
        .catch(function () {
          if (errorEl) errorEl.style.display = 'block';
          if (btn) btn.disabled = false;
        });
    });
  });
});
