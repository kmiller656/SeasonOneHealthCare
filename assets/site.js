/* Season One Healthcare marketing site — shared behavior */

// ─── Supabase client + data helpers (used by directory pages, forms, admin) ──
var SUPABASE_URL = 'https://gvqfktkkqscgmxlahyyh.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2cWZrdGtrcXNjZ214bGFoeXloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwOTQ2MDgsImV4cCI6MjA5NzY3MDYwOH0.KSVEzNo0MC9JQCTwN8mpo9UyngObbmA4F3hnORc8r9k';

function getSupabaseClient() {
  if (!window.sbClient && window.supabase) {
    window.sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return window.sbClient;
}

function fetchApproved(table, orderColumn, limit) {
  var client = getSupabaseClient();
  if (!client) return Promise.resolve([]);
  var q = client.from(table).select('*').eq('status', 'approved').order(orderColumn || 'created_at', { ascending: false });
  if (limit) q = q.limit(limit);
  return q.then(function (res) { return res.error ? [] : res.data; });
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Search + tag filtering for a directory grid. Safe to call more than once
// (e.g. once automatically at load, again after async-rendered cards arrive) —
// apply() always re-queries .item-card live, and a guard prevents double-binding.
function initDirectoryFilters(scope) {
  if (!scope || scope.dataset.filterInit) return;
  scope.dataset.filterInit = '1';
  var input = scope.querySelector('.filter-input');
  var chips = scope.querySelectorAll('.filter-chip');
  var activeTag = '';
  function apply() {
    var q = (input && input.value || '').trim().toLowerCase();
    scope.querySelectorAll('.item-card').forEach(function (card) {
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
}

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

  // Directory filters — binds immediately for static content (e.g. resources.html);
  // pages that render cards asynchronously call initDirectoryFilters() again themselves.
  document.querySelectorAll('[data-filter-scope]').forEach(initDirectoryFilters);

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
