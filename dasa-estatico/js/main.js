/* DASA · interacciones ligeras (sin dependencias) */
(function () {
  var d = document, root = d.documentElement;
  var header = d.querySelector('.header');
  var menuBtn = d.querySelector('.menu-btn');

  // Menú móvil
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = header.classList.toggle('menu-open');
      menuBtn.setAttribute('aria-expanded', open);
    });
    d.querySelectorAll('.nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        header.classList.remove('menu-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Sombra del header al hacer scroll
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      header.classList.toggle('scrolled', window.scrollY > 20);
      ticking = false;
    });
  }, { passive: true });

  // Aparición suave al hacer scroll
  var els = d.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }

  // Si falta una imagen, queda el degradado de fondo (sin icono roto)
  d.querySelectorAll('img').forEach(function (img) {
    var hide = function () { img.style.display = 'none'; };
    img.addEventListener('error', hide);
    if (img.complete && img.naturalWidth === 0) hide();
  });

  // Formulario de contacto -> mensaje de WhatsApp
  var form = d.getElementById('form-cita');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var f = new FormData(form);
      var msg = 'Hola DASA, soy ' + f.get('nombre') + '. Quiero reservar una cita para: ' + f.get('servicio') +
        '. Preferiría ' + (f.get('fecha') || 'una fecha por definir') + ' en la ' + f.get('jornada') + '.' +
        (f.get('nota') ? ' Nota: ' + f.get('nota') : '');
      window.open(form.dataset.wa + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    });
  }
})();
