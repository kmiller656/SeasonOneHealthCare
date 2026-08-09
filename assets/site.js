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

  // Smooth in-page anchor scrolling
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  // Generic Web3Forms submit handler — any <form data-web3forms> with a .form-success/.form-error
  // box nearby (either inside the form, or as a sibling within the surrounding .form-card).
  document.querySelectorAll('form[data-web3forms]').forEach(function (form) {
    var container = form.closest('.form-card') || form.parentElement || form;
    var successEl = container.querySelector('.form-success');
    var errorEl = container.querySelector('.form-error');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var originalText = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
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
            if (btn) { btn.disabled = false; btn.textContent = originalText; }
          }
        })
        .catch(function () {
          if (errorEl) errorEl.style.display = 'block';
          if (btn) { btn.disabled = false; btn.textContent = originalText; }
        });
    });
  });
});
