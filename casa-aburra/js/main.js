/* =========================================================
   Casa Aburrá · Bienes raíces en Medellín
   JavaScript puro, sin dependencias.
   ========================================================= */

/* ---------------------------------------------------------
   1. CONFIGURACIÓN — edita aquí tus datos de contacto
   --------------------------------------------------------- */
const CONFIG = {
  // Número de WhatsApp con indicativo de país, solo dígitos (57 = Colombia)
  whatsapp: '573001234567',
  // Mensaje que aparece escrito al abrir WhatsApp
  whatsappMensaje: 'Hola, vi su página web y quiero información sobre propiedades en Medellín.',
  // Imagen local que se muestra si una foto de Unsplash no carga
  placeholder: 'img/placeholder.svg'
};

/* ---------------------------------------------------------
   2. DATOS DE LAS PROPIEDADES
   Para agregar, quitar o cambiar una propiedad, edita este array.
   - tipo:      'apartamento' | 'casa' | 'finca'
   - operacion: 'venta' | 'arriendo'
   - barrio:    debe coincidir con un barrio de la lista BARRIOS
   - precio:    número en pesos colombianos, sin puntos (arriendo = valor mensual)
   - imagen:    URL de la foto (Unsplash o una ruta local como 'img/apto-1.jpg')
   --------------------------------------------------------- */
const PROPIEDADES = [
  {
    id: 1,
    titulo: 'Apartamento con balcón en Provenza',
    tipo: 'apartamento',
    operacion: 'arriendo',
    barrio: 'Provenza',
    precio: 4800000,
    habitaciones: 2,
    banos: 2,
    area: 85,
    imagen: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=70',
    etiqueta: 'Amoblado'
  },
  {
    id: 2,
    titulo: 'Penthouse con vista a la ciudad',
    tipo: 'apartamento',
    operacion: 'venta',
    barrio: 'El Poblado',
    precio: 1450000000,
    habitaciones: 3,
    banos: 4,
    area: 210,
    imagen: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=70',
    etiqueta: 'Exclusivo'
  },
  {
    id: 3,
    titulo: 'Casa tradicional remodelada',
    tipo: 'casa',
    operacion: 'venta',
    barrio: 'Laureles',
    precio: 1150000000,
    habitaciones: 4,
    banos: 3,
    area: 240,
    imagen: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=70',
    etiqueta: 'Nuevo'
  },
  {
    id: 4,
    titulo: 'Finca campestre en Las Palmas',
    tipo: 'finca',
    operacion: 'venta',
    barrio: 'Envigado',
    precio: 2400000000,
    habitaciones: 5,
    banos: 5,
    area: 5200,
    imagen: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=70',
    etiqueta: 'Clima frío'
  },
  {
    id: 5,
    titulo: 'Apartamento en unidad con piscina',
    tipo: 'apartamento',
    operacion: 'arriendo',
    barrio: 'Sabaneta',
    precio: 2300000,
    habitaciones: 3,
    banos: 2,
    area: 72,
    imagen: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=70',
    etiqueta: ''
  },
  {
    id: 6,
    titulo: 'Apartamento familiar cerca al parque',
    tipo: 'apartamento',
    operacion: 'venta',
    barrio: 'Belén',
    precio: 420000000,
    habitaciones: 3,
    banos: 2,
    area: 88,
    imagen: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=70',
    etiqueta: 'Precio de oportunidad'
  }
];

/* Barrios disponibles en los filtros (en este orden) */
const BARRIOS = ['El Poblado', 'Laureles', 'Envigado', 'Sabaneta', 'Belén', 'Provenza'];

/* Rangos de precio para los filtros. max: null = sin límite */
const RANGOS_PRECIO = [
  { id: 'a1', texto: 'Arriendo: hasta $3 millones', min: 0, max: 3000000 },
  { id: 'a2', texto: 'Arriendo: más de $3 millones', min: 3000000, max: 50000000 },
  { id: 'v1', texto: 'Venta: hasta $500 millones', min: 50000000, max: 500000000 },
  { id: 'v2', texto: 'Venta: $500 a $1.200 millones', min: 500000000, max: 1200000000 },
  { id: 'v3', texto: 'Venta: más de $1.200 millones', min: 1200000000, max: null }
];

/* ---------------------------------------------------------
   3. UTILIDADES
   --------------------------------------------------------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/** Formatea un número como pesos colombianos: 1450000000 → "$ 1.450.000.000" */
const formatoCOP = (valor) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);

/** Escapa texto antes de insertarlo como HTML */
const escapeHTML = (texto) =>
  String(texto).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

/** Construye el enlace de WhatsApp con un mensaje prellenado */
const enlaceWhatsApp = (mensaje = CONFIG.whatsappMensaje) =>
  `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensaje)}`;

/** Si una imagen falla, muestra el placeholder local (solo una vez para evitar bucles).
    Con data-fallback="hide" la imagen se oculta (el hero muestra su degradado verde). */
function activarFallback(img) {
  const usarPlaceholder = () => {
    if (img.dataset.failed) return;
    img.dataset.failed = 'true';
    if (img.dataset.fallback === 'hide') img.hidden = true;
    else img.src = CONFIG.placeholder;
  };
  img.addEventListener('error', usarPlaceholder);
  // Si ya falló antes de que el script corriera
  if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) usarPlaceholder();
}

/* ---------------------------------------------------------
   4. RENDER DE PROPIEDADES Y FILTROS
   --------------------------------------------------------- */
const grid = $('#propertiesGrid');
const filtrosForm = $('#filters');
const heroForm = $('#heroSearch');

// Estado actual de los filtros
const filtros = { tipo: '', operacion: '', barrio: '', precio: '' };

/** Llena los <select> de barrios y precios a partir de los datos */
function poblarSelects() {
  $$('[data-barrios]').forEach((select) => {
    BARRIOS.forEach((b) => select.add(new Option(b, b)));
  });
  $$('[data-precios]').forEach((select) => {
    RANGOS_PRECIO.forEach((r) => select.add(new Option(r.texto, r.id)));
  });
}

/** Devuelve el HTML de una tarjeta de propiedad */
function tarjetaHTML(p) {
  const precio = formatoCOP(p.precio) + (p.operacion === 'arriendo' ? '<small>/mes</small>' : '');
  const operacion = p.operacion === 'venta' ? 'En venta' : 'En arriendo';
  const mensaje = `Hola, me interesa la propiedad "${p.titulo}" en ${p.barrio} (ref. ${p.id}). ¿Me pueden dar más información?`;

  return `
    <article class="card reveal">
      <div class="card__media">
        <img src="${escapeHTML(p.imagen)}" alt="${escapeHTML(capitalizar(p.tipo))} en ${escapeHTML(p.barrio)}: ${escapeHTML(p.titulo)}" loading="lazy" width="800" height="560">
        <span class="badge badge--${p.operacion}">${operacion}</span>
        ${p.etiqueta ? `<span class="badge badge--gold">${escapeHTML(p.etiqueta)}</span>` : ''}
      </div>
      <div class="card__body">
        <p class="card__price">${precio}</p>
        <h3 class="card__title">${escapeHTML(p.titulo)}</h3>
        <p class="card__location">
          <svg class="icon" aria-hidden="true"><use href="#icon-pin"></use></svg>
          ${escapeHTML(p.barrio)}, Medellín · ${escapeHTML(capitalizar(p.tipo))}
        </p>
        <ul class="card__specs">
          <li title="Habitaciones"><svg class="icon" aria-hidden="true"><use href="#icon-bed"></use></svg>${p.habitaciones} <span>hab.</span></li>
          <li title="Baños"><svg class="icon" aria-hidden="true"><use href="#icon-bath"></use></svg>${p.banos} <span>baños</span></li>
          <li title="Área"><svg class="icon" aria-hidden="true"><use href="#icon-area"></use></svg>${p.area.toLocaleString('es-CO')} <span>m²</span></li>
        </ul>
        <a class="card__cta" href="${enlaceWhatsApp(mensaje)}" target="_blank" rel="noopener">
          Consultar por WhatsApp →
        </a>
      </div>
    </article>`;
}

/** Comprueba si una propiedad cumple con los filtros activos */
function cumpleFiltros(p) {
  if (filtros.tipo && p.tipo !== filtros.tipo) return false;
  if (filtros.operacion && p.operacion !== filtros.operacion) return false;
  if (filtros.barrio && p.barrio !== filtros.barrio) return false;
  if (filtros.precio) {
    const rango = RANGOS_PRECIO.find((r) => r.id === filtros.precio);
    if (rango && (p.precio < rango.min || (rango.max !== null && p.precio > rango.max))) return false;
  }
  return true;
}

/** Pinta las tarjetas filtradas */
function renderPropiedades() {
  const lista = PROPIEDADES.filter(cumpleFiltros);
  grid.innerHTML = lista.map(tarjetaHTML).join('');

  $$('img', grid).forEach(activarFallback);
  $$('.reveal', grid).forEach((el) => observarReveal(el));

  $('#emptyState').hidden = lista.length > 0;
  $('#resultsCount').textContent =
    lista.length === PROPIEDADES.length
      ? `Mostrando ${lista.length} propiedades`
      : `${lista.length} de ${PROPIEDADES.length} propiedades coinciden con tu búsqueda`;
}

/** Copia el estado de `filtros` a los controles visibles */
function sincronizarControles() {
  $('#f-tipo').value = filtros.tipo;
  $('#f-barrio').value = filtros.barrio;
  $('#f-precio').value = filtros.precio;
  $$('[data-operacion]', filtrosForm).forEach((chip) => {
    const activo = chip.dataset.operacion === filtros.operacion;
    chip.classList.toggle('is-active', activo);
    chip.setAttribute('aria-pressed', activo);
  });
}

function aplicarFiltros(nuevos = {}) {
  Object.assign(filtros, nuevos);
  sincronizarControles();
  renderPropiedades();
}

function irAPropiedades() {
  $('#propiedades').scrollIntoView({ behavior: 'smooth' });
}

function initFiltros() {
  poblarSelects();

  // Selects de la sección propiedades
  filtrosForm.addEventListener('change', (e) => {
    if (e.target.name) aplicarFiltros({ [e.target.name]: e.target.value });
  });

  // Botones "chip" de operación
  $$('[data-operacion]', filtrosForm).forEach((chip) => {
    chip.addEventListener('click', () => aplicarFiltros({ operacion: chip.dataset.operacion }));
  });

  // Botón limpiar
  filtrosForm.addEventListener('reset', (e) => {
    e.preventDefault();
    heroForm.reset();
    aplicarFiltros({ tipo: '', operacion: '', barrio: '', precio: '' });
  });

  // Buscador del hero → aplica filtros y baja a resultados
  heroForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(heroForm));
    aplicarFiltros(datos);
    irAPropiedades();
  });

  // "Ver propiedades" en cada barrio
  $$('[data-barrio-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      aplicarFiltros({ tipo: '', operacion: '', precio: '', barrio: btn.dataset.barrioFilter });
      irAPropiedades();
    });
  });

  aplicarFiltros();
}

/* ---------------------------------------------------------
   5. HEADER Y MENÚ MÓVIL
   --------------------------------------------------------- */
function initHeader() {
  const header = $('#header');
  const toggle = $('#navToggle');
  const nav = $('#nav');

  const cerrarMenu = () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
    document.body.classList.remove('no-scroll');
  };

  toggle.addEventListener('click', () => {
    const abierto = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', abierto);
    toggle.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    document.body.classList.toggle('no-scroll', abierto);
  });

  // Cierra el menú al tocar un enlace o presionar Escape
  $$('a', nav).forEach((a) => a.addEventListener('click', cerrarMenu));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && cerrarMenu());

  // Sombra al hacer scroll
  const alScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 20);
  window.addEventListener('scroll', alScroll, { passive: true });
  alScroll();

  // Resalta el enlace de la sección visible
  const links = $$('.nav__link');
  const secciones = links.map((l) => $(l.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === `#${entry.target.id}`));
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    secciones.forEach((s) => obs.observe(s));
  }
}

/* ---------------------------------------------------------
   6. ANIMACIONES AL HACER SCROLL
   --------------------------------------------------------- */
let revealObserver = null;

function observarReveal(el) {
  if (revealObserver) revealObserver.observe(el);
  else el.classList.add('is-visible');
}

function initReveal() {
  const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reducirMovimiento && 'IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
  }
  $$('.reveal').forEach(observarReveal);
}

/* ---------------------------------------------------------
   7. FORMULARIO DE CONTACTO CON VALIDACIÓN
   --------------------------------------------------------- */
const VALIDACIONES = {
  nombre: (v) => (v.trim().length >= 3 ? '' : 'Escribe tu nombre (mínimo 3 letras).'),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Escribe un correo válido, ej: nombre@correo.com'),
  telefono: (v) => {
    const digitos = v.replace(/\D/g, '');
    return digitos.length >= 7 && digitos.length <= 15 ? '' : 'Escribe un teléfono válido (7 a 15 dígitos).';
  },
  mensaje: (v) => (v.trim().length >= 10 ? '' : 'Cuéntanos un poco más (mínimo 10 caracteres).')
};

function validarCampo(input) {
  const error = VALIDACIONES[input.name](input.value);
  const contenedor = $(`#${input.id}-error`);
  contenedor.textContent = error;
  input.classList.toggle('is-invalid', Boolean(error));
  input.setAttribute('aria-invalid', Boolean(error));
  if (error) input.setAttribute('aria-describedby', contenedor.id);
  else input.removeAttribute('aria-describedby');
  return !error;
}

function initFormulario() {
  const form = $('#contactForm');
  const estado = $('#formStatus');
  const campos = Object.keys(VALIDACIONES).map((n) => form.elements[n]);

  // Valida al salir del campo y corrige en vivo si ya tenía error
  campos.forEach((input) => {
    input.addEventListener('blur', () => validarCampo(input));
    input.addEventListener('input', () => input.classList.contains('is-invalid') && validarCampo(input));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const validos = campos.map(validarCampo).every(Boolean);
    if (!validos) {
      estado.className = 'form__status is-error';
      estado.textContent = 'Revisa los campos marcados en rojo.';
      campos.find((c) => c.classList.contains('is-invalid')).focus();
      return;
    }

    const boton = $('button[type="submit"]', form);
    boton.disabled = true;
    boton.textContent = 'Enviando…';

    // Mensaje de respaldo por WhatsApp con los datos del formulario
    const datos = Object.fromEntries(new FormData(form));
    const textoWA = `Hola, soy ${datos.nombre}. ${datos.mensaje} (Tel: ${datos.telefono}, Email: ${datos.email})`;

    try {
      // En Netlify, este POST guarda el mensaje en el panel "Forms" sin backend propio
      const respuesta = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      });
      if (!respuesta.ok) throw new Error(respuesta.status);

      estado.className = 'form__status is-success';
      estado.textContent = `¡Gracias, ${datos.nombre.split(' ')[0]}! Recibimos tu mensaje y te contactaremos pronto.`;
      form.reset();
    } catch {
      // Sin servidor de formularios (ej. abriendo el archivo en local): ofrecer WhatsApp
      estado.className = 'form__status is-success';
      estado.innerHTML = `Tus datos están completos. <a href="${enlaceWhatsApp(textoWA)}" target="_blank" rel="noopener">Envíalos por WhatsApp aquí</a> y te respondemos de inmediato.`;
    } finally {
      boton.disabled = false;
      boton.textContent = 'Enviar mensaje';
    }
  });
}

/* ---------------------------------------------------------
   8. INICIO
   --------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // Todos los botones de WhatsApp usan el número de CONFIG
  $$('[data-whatsapp]').forEach((a) => (a.href = enlaceWhatsApp()));

  // Placeholder para imágenes estáticas que fallen
  $$('img[data-fallback]').forEach(activarFallback);

  $('#year').textContent = new Date().getFullYear();

  initReveal();
  initHeader();
  initFiltros();
  initFormulario();
});
