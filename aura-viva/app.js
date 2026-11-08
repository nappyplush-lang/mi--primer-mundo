/* ===== Configuración editable ===== */
const CENTRO = {
  nombre: 'Aura Viva',
  whatsapp: '573001234567', // país + número, sin + ni espacios
  saludo: 'Hola Aura Viva 👋'
};

const wa = (texto) => `https://wa.me/${CENTRO.whatsapp}?text=${encodeURIComponent(texto)}`;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Enlaces de contacto
$('#fab').href = wa(`${CENTRO.saludo}, quiero información sobre sus servicios.`);
$('#wa-foot').href = wa(`${CENTRO.saludo}, quiero información.`);
$('#year').textContent = new Date().getFullYear();

// Menú móvil
const header = $('.site-header');
const btn = $('.menu-btn');
const nav = $('#nav');
const setMenu = (open) => {
  btn.setAttribute('aria-expanded', open);
  btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  nav.classList.toggle('open', open);
};
btn.addEventListener('click', () => setMenu(btn.getAttribute('aria-expanded') !== 'true'));
nav.addEventListener('click', (e) => e.target.closest('a') && setMenu(false));
document.addEventListener('keydown', (e) => e.key === 'Escape' && setMenu(false));
addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 8), { passive: true });

// Filtro de servicios
const tabs = $$('.tab');
tabs.forEach((t) => t.addEventListener('click', () => {
  tabs.forEach((x) => x.setAttribute('aria-pressed', x === t));
  const f = t.dataset.filter;
  $$('.card').forEach((c) => {
    const show = f === 'all' || c.dataset.cat === f;
    c.hidden = !show;
    if (show) c.classList.add('in');
  });
}));

// Select de servicios + botones "Reservar"
const select = $('#f-service');
$$('.card').forEach((c) => {
  const name = $('h3', c).textContent;
  select.add(new Option(`${name} — ${$('.price', c).textContent}`, name));
});
$$('.link[data-service]').forEach((b) => b.addEventListener('click', () => {
  select.value = b.dataset.service;
  $('#reservar').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => $('#f-name').focus({ preventScroll: true }), 500);
}));

// Testimonios
const quotes = $('#quotes');
$$('.arrow').forEach((a) => a.addEventListener('click', () => {
  const step = quotes.firstElementChild.getBoundingClientRect().width + 16;
  quotes.scrollBy({ left: step * Number(a.dataset.dir), behavior: 'smooth' });
}));

// Formulario → WhatsApp
const form = $('#form');
const date = $('#f-date');
const today = new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
date.min = today;
const msgs = { name: 'Escribe tu nombre.', service: 'Elige un servicio.', date: 'Elige una fecha desde hoy.', time: 'Elige una hora.' };
form.addEventListener('submit', (e) => {
  e.preventDefault();
  let ok = true, first;
  ['name', 'service', 'date', 'time'].forEach((k) => {
    const el = form.elements[k];
    const bad = !el.value.trim() || (k === 'date' && el.value < today);
    el.closest('.field').classList.toggle('invalid', bad);
    el.setAttribute('aria-invalid', bad);
    $('#e-' + k).textContent = bad ? msgs[k] : '';
    if (bad) { ok = false; first = first || el; }
  });
  if (!ok) return first.focus();
  const d = new Date(date.value + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
  const texto = `${CENTRO.saludo}\nSoy ${form.elements.name.value.trim()} y quiero reservar:\n• Servicio: ${form.elements.service.value}\n• Fecha: ${d}\n• Hora: ${form.elements.time.value}\n¿Tienen disponibilidad?`;
  window.open(wa(texto), '_blank', 'noopener');
});

// Revelado al hacer scroll
const items = $$('[data-reveal]');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => es.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach((i) => io.observe(i));
} else items.forEach((i) => i.classList.add('in'));
