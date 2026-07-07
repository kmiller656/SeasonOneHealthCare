/* RunStaffRun marketing site — shared behavior (nav overlay, accordions, testimonial carousel) */
document.addEventListener('DOMContentLoaded', function () {

  // Hamburger overlay nav
  var burger = document.querySelector('.rsr-burger');
  var overlay = document.querySelector('.rsr-overlay');
  var closeBtn = document.querySelector('.rsr-overlay-close');
  function openOverlay() {
    overlay.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('rsr-noscroll');
  }
  function closeOverlay() {
    overlay.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('rsr-noscroll');
  }
  if (burger && overlay) {
    burger.addEventListener('click', function () {
      overlay.classList.contains('open') ? closeOverlay() : openOverlay();
    });
  }
  if (closeBtn) closeBtn.addEventListener('click', closeOverlay);

  // Generic accordion (nav dropdowns + FAQ) — any .rsr-acc-item with a .rsr-acc-head
  document.querySelectorAll('.rsr-acc-head').forEach(function (head) {
    head.addEventListener('click', function () {
      head.parentElement.classList.toggle('open');
    });
  });

  // Testimonial carousels — supports multiple independent instances per page
  document.querySelectorAll('.rsr-testi[data-carousel]').forEach(function (block) {
    var slides = block.querySelectorAll('.rsr-testi-slide');
    if (slides.length < 2) return;
    var i = 0;
    function show(n) {
      slides.forEach(function (s, idx) { s.style.display = idx === n ? '' : 'none'; });
    }
    show(0);
    var prev = block.querySelector('.rsr-testi-prev');
    var next = block.querySelector('.rsr-testi-next');
    if (prev) prev.addEventListener('click', function () { i = (i - 1 + slides.length) % slides.length; show(i); });
    if (next) next.addEventListener('click', function () { i = (i + 1) % slides.length; show(i); });
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

  // Generic client-side form success (matches existing site convention — no backend wired yet)
  document.querySelectorAll('form[data-client-success]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var successEl = form.querySelector('.rsr-form-success');
      if (successEl) successEl.style.display = 'block';
      var btn = form.querySelector('button[type="submit"]');
      if (btn) btn.style.display = 'none';
    });
  });
});
