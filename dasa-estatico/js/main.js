/* DASA · interacciones ligeras (sin dependencias) */
(function () {
  var d = document, root = d.documentElement;
  var header = d.querySelector('.header');

  // WhatsApp: el número viene de js/config.js; cada enlace trae su mensaje en data-wa
  var WA_NUMBER = (window.DASA_CONFIG && window.DASA_CONFIG.whatsapp) || '';
  var waUrl = function (msg) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
  };
  if (WA_NUMBER) {
    d.querySelectorAll('a[data-wa]').forEach(function (a) { a.href = waUrl(a.getAttribute('data-wa')); });
    var pretty = '+' + WA_NUMBER.slice(0, 2) + ' ' + WA_NUMBER.slice(2, 5) + ' ' + WA_NUMBER.slice(5, 8) + ' ' + WA_NUMBER.slice(8);
    d.querySelectorAll('[data-wa-number]').forEach(function (el) { el.textContent = pretty; });
  }
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

  // Formulario de contacto: valida y abre WhatsApp con el mensaje prellenado
  var form = d.getElementById('form-cita');
  if (form) {
    var fecha = form.elements.fecha;
    if (fecha) {
      var hoy = new Date();
      fecha.min = hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0') + '-' + String(hoy.getDate()).padStart(2, '0');
    }
    var setError = function (input, msg) {
      var box = d.getElementById(input.getAttribute('aria-describedby'));
      box.textContent = msg;
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      input.classList.toggle('invalid', !!msg);
    };
    var checkNombre = function () {
      var v = form.elements.nombre.value.trim();
      var m = !v ? 'Escribe tu nombre para poder atenderte.' : (v.length < 2 ? 'El nombre es muy corto.' : '');
      setError(form.elements.nombre, m); return !m;
    };
    var checkTel = function () {
      var v = form.elements.telefono.value.replace(/[\s\-().]/g, '').replace(/^\+?57/, '');
      var m = !v ? 'Escribe tu teléfono para confirmar la cita.' : (!/^3\d{9}$/.test(v) ? 'Escribe un celular válido de 10 dígitos, por ejemplo 300 000 0000.' : '');
      setError(form.elements.telefono, m); return !m;
    };
    form.elements.nombre.addEventListener('blur', checkNombre);
    form.elements.telefono.addEventListener('blur', checkTel);
    ['nombre', 'telefono'].forEach(function (n) {
      form.elements[n].addEventListener('input', function () { if (this.classList.contains('invalid')) (n === 'nombre' ? checkNombre : checkTel)(); });
    });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var okN = checkNombre(), okT = checkTel();
      if (!okN || !okT) { (okN ? form.elements.telefono : form.elements.nombre).focus(); return; }
      var f = form.elements;
      var partes = ['Hola DASA, soy ' + f.nombre.value.trim() + '.', 'Mi teléfono es ' + f.telefono.value.trim() + '.'];
      if (f.servicio.value) partes.push('Me interesa: ' + f.servicio.value + '.');
      if (f.fecha.value) { var x = f.fecha.value.split('-'); partes.push('Fecha preferida: ' + x[2] + '/' + x[1] + '/' + x[0] + '.'); }
      if (f.mensaje.value.trim()) partes.push('Mensaje: ' + f.mensaje.value.trim());
      window.open(waUrl(partes.join(' ')), '_blank', 'noopener,noreferrer');
    });
  }
})();
