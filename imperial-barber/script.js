/* =========================================================
   IMPERIAL BARBER · Lógica de la página
   ========================================================= */

/* ---------------------------------------------------------
   CONFIGURACIÓN: cambia aquí nombres, servicios, precios,
   horarios y número de WhatsApp. No hace falta tocar nada más.
   --------------------------------------------------------- */
const CONFIG = {
  negocio: "Imperial Barber",

  // Número con código de país (57 = Colombia), sin + ni espacios
  whatsapp: "573147986180",

  // Link de tu Google Sheet de citas (la "aplicación web" de Apps Script).
  // Termina en /exec. Mientras esté vacío, la página no guarda citas
  // ni bloquea horas: solo abre WhatsApp, como antes.
  urlHojaCitas: "",

  // Mensaje del botón flotante verde
  mensajeFlotante: "Hola Imperial Barber, quiero agendar una cita",

  // Barberos: la foto va en la carpeta img con ese nombre (proporción 4:5).
  // El "id" debe ser igual al de la lista BARBEROS en Código.gs.
  barberos: [
    { id: "barbero1", nombre: "Barbero 1", rol: "Cortes clásicos y fade", foto: "img/barbero1.jpg" },
    { id: "barbero2", nombre: "Barbero 2", rol: "Barba y perfilado", foto: "img/barbero2.jpg" },
  ],

  // Servicios: precio en pesos colombianos (sin puntos) y duración en minutos
  servicios: [
    { nombre: "Corte de cabello", precio: 25000, duracion: 45 },
    { nombre: "Arreglo de barba", precio: 18000, duracion: 30 },
    { nombre: "Corte + barba", precio: 38000, duracion: 75 },
    { nombre: "Perfilado de cejas", precio: 10000, duracion: 15 },
  ],

  // Horario: cada hora desde horaInicio hasta horaFin (formato 24 h).
  // Si lo cambias, cámbialo también en Código.gs.
  horaInicio: 9,  // 9:00 a. m.
  horaFin: 19,    // 7:00 p. m.

  // Días cerrados: 0 = domingo, 1 = lunes … 6 = sábado. Ej.: [0] cierra los domingos
  diasCerrados: [],

  // Cuántos meses hacia adelante se puede agendar (el mes actual + estos)
  mesesAdelante: 2,

  // Texto del pie de página
  textoHorario: "Lunes a domingo · 9:00 a. m. a 7:00 p. m.",
};

/* ---------------------------------------------------------
   Estado de la reserva
   --------------------------------------------------------- */
const estado = {
  barbero: null,    // objeto de CONFIG.barberos
  servicio: null,   // objeto de CONFIG.servicios
  dia: null,        // Date (a medianoche)
  hora: null,       // número 9..19
  nombre: "",       // nombre del cliente
  mesVisible: null, // Date (día 1 del mes que muestra el calendario)
  ocupadas: {},     // { "2026-11-23": [9, 14], ... } horas ya reservadas del barbero elegido
  guardando: false, // true mientras se guarda la cita en la hoja
};

/* ---------------------------------------------------------
   Utilidades
   --------------------------------------------------------- */
const $ = (sel) => document.querySelector(sel);
const esCelular = () => matchMedia("(max-width: 899px)").matches;
const hojaConectada = () => /^https:\/\/script\.google\.com\/.+\/exec$/.test(CONFIG.urlHojaCitas.trim());

const formatoPrecio = new Intl.NumberFormat("es-CO", {
  style: "currency", currency: "COP", maximumFractionDigits: 0,
});
const precio = (n) => formatoPrecio.format(n).replace(/\s/g, "");

// 9 -> "9:00 a. m." · 13 -> "1:00 p. m."
function textoHora(h) {
  const sufijo = h < 12 ? "a. m." : "p. m.";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:00 ${sufijo}`;
}

// "jueves, 20 de noviembre"
function textoDia(fecha) {
  return fecha.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
}

// Date -> "2026-11-23" (así se guarda el día en la hoja)
function claveDia(fecha) {
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${m}-${d}`;
}

function hoy() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// Último día que se puede agendar
function ultimoDia() {
  const h = hoy();
  return new Date(h.getFullYear(), h.getMonth() + CONFIG.mesesAdelante + 1, 0);
}

const mismoDia = (a, b) => a && b && a.getTime() === b.getTime();

const linkWhatsApp = (texto) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;

// fetch con límite de tiempo, para no dejar al cliente esperando si la hoja no responde
async function pedirJSON(url, opciones = {}, segundos = 15) {
  const control = new AbortController();
  const reloj = setTimeout(() => control.abort(), segundos * 1000);
  try {
    const resp = await fetch(url, { ...opciones, signal: control.signal, redirect: "follow" });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } finally {
    clearTimeout(reloj);
  }
}

// Pone la foto dentro de un recuadro; si la foto no existe, se queda el recuadro gris con el texto
function ponerFoto(contenedor, src, etiqueta, alt = "") {
  contenedor.innerHTML = "";
  contenedor.dataset.label = etiqueta;
  const img = new Image();
  img.alt = alt;
  img.decoding = "async";
  img.loading = "lazy";
  img.onerror = () => img.remove();
  img.src = src;
  contenedor.appendChild(img);
}

// Desplaza la página suavemente hasta un elemento
function irA(selector, espera = 180) {
  const el = typeof selector === "string" ? $(selector) : selector;
  if (!el) return;
  setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), espera);
}

// Convierte texto en HTML seguro (para mostrar mensajes que vienen de la hoja)
function escaparHTML(texto) {
  const div = document.createElement("div");
  div.textContent = String(texto);
  return div.innerHTML;
}

// Muestra un aviso arriba del botón de confirmar (tipo: "ok" o "error")
function mostrarAviso(html, tipo = "ok") {
  const aviso = $("#aviso");
  aviso.innerHTML = html;
  aviso.classList.toggle("es-error", tipo === "error");
  aviso.hidden = false;
  $(".confirmar").classList.add("con-aviso");
}
function ocultarAviso() {
  $("#aviso").hidden = true;
  $(".confirmar").classList.remove("con-aviso");
}

/* ---------------------------------------------------------
   Horas ocupadas (vienen de la Google Sheet)
   --------------------------------------------------------- */
function horasOcupadasDe(fecha) {
  return estado.ocupadas[claveDia(fecha)] || [];
}

// Pide a la hoja las horas ya reservadas del barbero, desde hoy hasta el último día permitido
async function cargarOcupadas() {
  if (!hojaConectada() || !estado.barbero) return;
  const barbero = estado.barbero;
  const params = new URLSearchParams({
    accion: "ocupadas",
    barbero: barbero.id,
    desde: claveDia(hoy()),
    hasta: claveDia(ultimoDia()),
  });

  $("#hora-hint").textContent = "Cargando horarios disponibles…";
  try {
    const datos = await pedirJSON(`${CONFIG.urlHojaCitas.trim()}?${params}`, {}, 12);
    if (estado.barbero !== barbero) return; // el cliente cambió de barbero mientras cargaba
    if (!datos.ok) throw new Error(datos.error || "respuesta inválida");
    estado.ocupadas = datos.ocupadas || {};
  } catch (err) {
    // Si la hoja no responde, la página sigue funcionando y tú confirmas por WhatsApp
    console.warn("No se pudieron cargar las horas ocupadas:", err);
  } finally {
    $("#hora-hint").textContent = "Primero elige un día.";
  }

  // Si la hora que el cliente tenía elegida ya está ocupada, se borra
  if (estado.dia && estado.hora !== null && horasOcupadasDe(estado.dia).includes(estado.hora)) {
    estado.hora = null;
  }
  pintarCalendario();
  pintarHoras();
  actualizarResumen();
}

/* ---------------------------------------------------------
   Tarjetas de barberos
   --------------------------------------------------------- */
function pintarBarberos() {
  const lista = $("#lista-barberos");
  lista.innerHTML = "";

  CONFIG.barberos.forEach((b) => {
    const tarjeta = document.createElement("button");
    tarjeta.type = "button";
    tarjeta.className = "barbero";
    tarjeta.dataset.id = b.id;
    tarjeta.setAttribute("aria-pressed", "false");
    tarjeta.setAttribute("aria-label", `Agendar con ${b.nombre}`);
    tarjeta.innerHTML = `
      <div class="ph barbero__foto"></div>
      <div class="barbero__info">
        <p class="barbero__nombre"></p>
        <p class="barbero__rol"></p>
      </div>
      <span class="barbero__btn">
        Agendar
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>`;
    tarjeta.querySelector(".barbero__nombre").textContent = b.nombre;
    tarjeta.querySelector(".barbero__rol").textContent = b.rol || "";
    ponerFoto(tarjeta.querySelector(".barbero__foto"), b.foto, `Foto ${b.nombre} · ${b.foto} (4:5)`, b.nombre);

    tarjeta.addEventListener("click", () => abrirAgenda(b, true));
    lista.appendChild(tarjeta);
  });
}

/* ---------------------------------------------------------
   Agenda (aparece debajo al elegir barbero, sin recargar)
   --------------------------------------------------------- */
function abrirAgenda(barbero, desplazar) {
  // Si cambia de barbero, empieza la reserva de cero (el nombre se conserva)
  if (estado.barbero !== barbero) {
    estado.barbero = barbero;
    estado.servicio = null;
    estado.dia = null;
    estado.hora = null;
    estado.mesVisible = null;
    estado.ocupadas = {};
    ocultarAviso();
  }
  if (!estado.mesVisible) {
    const h = hoy();
    estado.mesVisible = new Date(h.getFullYear(), h.getMonth(), 1);
  }

  // Marca la tarjeta elegida
  document.querySelectorAll(".barbero").forEach((t) => t.setAttribute("aria-pressed", String(t.dataset.id === barbero.id)));

  $("#perfil-nombre").textContent = barbero.nombre;
  ponerFoto($("#perfil-foto"), barbero.foto, "Foto", barbero.nombre);

  pintarServicios();
  pintarCalendario();
  pintarHoras();
  actualizarResumen();

  $("#agenda").hidden = false;

  // El link queda listo para compartir: .../imperial-barber/#barbero1
  history.replaceState(null, "", `#${barbero.id}`);

  if (desplazar) {
    irA("#agenda", 60);
    setTimeout(() => $("#perfil-nombre").focus({ preventScroll: true }), 700);
  }

  cargarOcupadas();
}

/* --- Servicios --- */
function pintarServicios() {
  const lista = $("#lista-servicios");
  lista.innerHTML = "";

  CONFIG.servicios.forEach((s) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "servicio";
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", String(estado.servicio === s));
    btn.innerHTML = `
      <span class="servicio__check"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#0B0B0C" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
      <span class="servicio__txt"><span class="servicio__nombre"></span><span class="servicio__dur"></span></span>
      <span class="servicio__precio"></span>`;
    btn.querySelector(".servicio__nombre").textContent = s.nombre;
    btn.querySelector(".servicio__dur").textContent = `${s.duracion} min`;
    btn.querySelector(".servicio__precio").textContent = precio(s.precio);

    btn.addEventListener("click", () => {
      const primeraVez = !estado.servicio;
      estado.servicio = s;
      lista.querySelectorAll(".servicio").forEach((el) => el.setAttribute("aria-checked", String(el === btn)));
      actualizarResumen();
      if (primeraVez && !estado.dia && esCelular()) irA("#paso-dia");
    });
    lista.appendChild(btn);
  });
}

/* --- Calendario --- */
function pintarCalendario() {
  const contenedor = $("#cal-dias");
  const mes = estado.mesVisible;
  const h = hoy();
  const limite = ultimoDia();

  const nombreMes = mes.toLocaleDateString("es-CO", { month: "long" });
  $("#cal-mes").textContent = `${nombreMes.charAt(0).toUpperCase()}${nombreMes.slice(1)} ${mes.getFullYear()}`;
  $("#cal-prev").disabled = mes.getFullYear() === h.getFullYear() && mes.getMonth() === h.getMonth();
  $("#cal-next").disabled = new Date(mes.getFullYear(), mes.getMonth() + 1, 1) > limite;

  contenedor.innerHTML = "";

  // Espacios vacíos antes del día 1 (la semana empieza en lunes)
  const vacios = (mes.getDay() + 6) % 7;
  for (let i = 0; i < vacios; i++) contenedor.appendChild(document.createElement("span"));

  const diasDelMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
  for (let d = 1; d <= diasDelMes; d++) {
    const fecha = new Date(mes.getFullYear(), mes.getMonth(), d);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dia";
    btn.textContent = d;
    btn.setAttribute("aria-pressed", String(mismoDia(fecha, estado.dia)));

    const cerrado = CONFIG.diasCerrados.includes(fecha.getDay());
    const fueraDeRango = fecha < h || fecha > limite;
    // Día lleno: ya pasaron todas sus horas (hoy) o están todas reservadas
    const lleno = !fueraDeRango && !cerrado && horasLibres(fecha).length === 0;
    btn.disabled = fueraDeRango || cerrado || lleno;
    btn.setAttribute("aria-label", textoDia(fecha) + (lleno ? ", sin horas libres" : ""));
    if (mismoDia(fecha, h)) btn.classList.add("es-hoy");

    btn.addEventListener("click", () => {
      estado.dia = fecha;
      // Si la hora elegida ya no está libre ese día, se borra
      if (estado.hora !== null && !horasLibres(fecha).includes(estado.hora)) estado.hora = null;
      contenedor.querySelectorAll(".dia").forEach((el) => el.setAttribute("aria-pressed", String(el === btn)));
      ocultarAviso();
      pintarHoras();
      actualizarResumen();
      if (estado.hora === null && esCelular()) irA("#paso-hora");
    });
    contenedor.appendChild(btn);
  }

  // Si el día elegido quedó sin horas (por ejemplo, se acaban de reservar), se borra
  if (estado.dia && horasLibres(estado.dia).length === 0) {
    estado.dia = null;
    estado.hora = null;
  }
}

function cambiarMes(delta) {
  const m = estado.mesVisible;
  estado.mesVisible = new Date(m.getFullYear(), m.getMonth() + delta, 1);
  pintarCalendario();
}

/* --- Horas --- */
// Horas libres de un día: no han pasado y nadie las reservó
function horasLibres(fecha) {
  const ahora = new Date();
  const ocupadas = horasOcupadasDe(fecha);
  const horas = [];
  for (let hh = CONFIG.horaInicio; hh <= CONFIG.horaFin; hh++) {
    const momento = new Date(fecha);
    momento.setHours(hh, 0, 0, 0);
    if (momento > ahora && !ocupadas.includes(hh)) horas.push(hh);
  }
  return horas;
}

function pintarHoras() {
  const lista = $("#lista-horas");
  const hint = $("#hora-hint");
  lista.innerHTML = "";

  if (!estado.dia) { hint.hidden = false; return; }
  hint.hidden = true;

  const ahora = new Date();
  const ocupadas = horasOcupadasDe(estado.dia);
  for (let hh = CONFIG.horaInicio; hh <= CONFIG.horaFin; hh++) {
    const momento = new Date(estado.dia);
    momento.setHours(hh, 0, 0, 0);
    const yaPaso = momento <= ahora;
    const ocupada = ocupadas.includes(hh);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "hora";
    btn.textContent = textoHora(hh);
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", String(estado.hora === hh));
    btn.disabled = yaPaso || ocupada;
    if (ocupada) {
      btn.classList.add("es-ocupada");
      btn.title = "Ya reservada";
      btn.setAttribute("aria-label", `${textoHora(hh)}, ya reservada`);
    }

    btn.addEventListener("click", () => {
      estado.hora = hh;
      lista.querySelectorAll(".hora").forEach((el) => el.setAttribute("aria-checked", String(el === btn)));
      ocultarAviso();
      actualizarResumen();
      if (esCelular()) irA(estado.nombre.length < 2 ? "#paso-nombre" : "#resumen");
    });
    lista.appendChild(btn);
  }
}

/* --- Resumen y confirmación --- */
function actualizarResumen() {
  const { barbero, servicio, dia, hora, nombre } = estado;
  $("#res-barbero").textContent = barbero ? barbero.nombre : "—";
  $("#res-servicio").textContent = servicio ? servicio.nombre : "—";
  $("#res-dia").textContent = dia ? textoDia(dia) : "—";
  $("#res-hora").textContent = hora !== null ? textoHora(hora) : "—";
  $("#res-nombre").textContent = nombre || "—";
  $("#res-total").textContent = servicio ? precio(servicio.precio) : "—";

  const faltan = [];
  if (!servicio) faltan.push("servicio");
  if (!dia) faltan.push("día");
  if (hora === null) faltan.push("hora");
  if (nombre.length < 2) faltan.push("tu nombre");

  const listo = faltan.length === 0;
  $("#btn-confirmar").disabled = !listo || estado.guardando;
  $(".confirmar").classList.toggle("listo", listo);
  if (!listo) $("#confirmar-hint").textContent = `Falta: ${faltan.join(", ")}`;
}

function mensajeReserva() {
  const { barbero, servicio, dia, hora, nombre } = estado;
  return [
    `Hola ${CONFIG.negocio}, quiero agendar una cita:`,
    ``,
    `• Nombre: ${nombre}`,
    `• Barbero: ${barbero.nombre}`,
    `• Servicio: ${servicio.nombre} (${precio(servicio.precio)})`,
    `• Día: ${textoDia(dia)}`,
    `• Hora: ${textoHora(hora)}`,
    ``,
    `¿Me confirman, por favor?`,
  ].join("\n");
}

// Abre WhatsApp. "ventana" es una pestaña abierta antes de guardar (para que el
// navegador no la bloquee); si no existe, abre en la misma pestaña.
function abrirWhatsApp(url, ventana) {
  if (ventana && !ventana.closed) {
    ventana.location.href = url;
  } else {
    const nueva = window.open(url, "_blank");
    if (nueva) nueva.opener = null;
    else location.href = url;
  }
}

function ponerCargando(si) {
  estado.guardando = si;
  $("#btn-confirmar").classList.toggle("cargando", si);
  $("#btn-confirmar-txt").textContent = si ? "Guardando tu cita…" : "Confirmar cita";
  actualizarResumen();
}

async function confirmarCita() {
  if ($("#btn-confirmar").disabled) return;
  const url = linkWhatsApp(mensajeReserva());

  // Sin hoja conectada: solo abre WhatsApp, como antes
  if (!hojaConectada()) {
    abrirWhatsApp(url, null);
    return;
  }

  // Se abre la pestaña ya, en el mismo toque, para que el navegador no la bloquee.
  // Se llena con WhatsApp cuando la cita quede guardada.
  let ventana = null;
  try {
    ventana = window.open("", "_blank");
    if (ventana) {
      ventana.opener = null;
      ventana.document.title = "Abriendo WhatsApp…";
      ventana.document.body.style.cssText = "font:16px system-ui,sans-serif;background:#0B0B0C;color:#F3EEE6;display:grid;place-items:center;height:100vh;margin:0";
      ventana.document.body.textContent = "Guardando tu cita y abriendo WhatsApp…";
    }
  } catch { ventana = null; }

  const { barbero, servicio, dia, hora, nombre } = estado;
  const cita = {
    barbero: barbero.id,
    barberoNombre: barbero.nombre,
    dia: claveDia(dia),
    hora,
    servicio: servicio.nombre,
    precio: servicio.precio,
    nombre,
  };

  ocultarAviso();
  ponerCargando(true);
  let respuesta = null;
  try {
    // "text/plain" evita un paso extra de permisos (CORS) que Apps Script no soporta
    respuesta = await pedirJSON(CONFIG.urlHojaCitas.trim(), {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(cita),
    }, 20);
  } catch (err) {
    respuesta = null; // la hoja no respondió
    console.warn("No se pudo guardar la cita en la hoja:", err);
  } finally {
    ponerCargando(false);
  }

  // 1) Guardada: abre WhatsApp y marca la hora como ocupada
  if (respuesta && respuesta.ok) {
    const clave = cita.dia;
    estado.ocupadas[clave] = [...(estado.ocupadas[clave] || []), hora];
    estado.hora = null;
    abrirWhatsApp(url, ventana);
    pintarCalendario();
    pintarHoras();
    actualizarResumen();
    mostrarAviso(`Listo, tu cita del ${textoDia(dia)} a las ${textoHora(hora)} quedó guardada. ` +
      `Envía el mensaje de WhatsApp para confirmarla. <a href="${url}" target="_blank" rel="noopener">¿No se abrió WhatsApp? Toca aquí</a>`);
    return;
  }

  // 2) Alguien tomó esa hora primero: no abre WhatsApp
  if (respuesta && respuesta.error === "hora_ocupada") {
    if (ventana) ventana.close();
    estado.ocupadas[cita.dia] = [...(estado.ocupadas[cita.dia] || []), hora];
    estado.hora = null;
    mostrarAviso("Esa hora se acaba de reservar. Elige otra, por favor.", "error");
    cargarOcupadas(); // trae las horas más recientes
    pintarHoras();
    actualizarResumen();
    if (esCelular()) irA("#paso-hora");
    return;
  }

  // 3) La hoja rechazó los datos (por ejemplo, un día que ya pasó)
  if (respuesta && respuesta.error) {
    if (ventana) ventana.close();
    mostrarAviso(`No pudimos guardar tu cita: ${escaparHTML(respuesta.mensaje || "revisa los datos e intenta de nuevo")}.`, "error");
    return;
  }

  // 4) La hoja no respondió: igual abre WhatsApp para no perder al cliente
  abrirWhatsApp(url, ventana);
  mostrarAviso("No pudimos guardar la cita automáticamente, pero te abrimos WhatsApp para confirmarla con la barbería.", "error");
}

/* ---------------------------------------------------------
   Limpieza: una versión anterior se podía instalar como app.
   Esto la desinstala en los celulares que alcanzaron a abrirla.
   --------------------------------------------------------- */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister())).catch(() => {});
  if (window.caches) caches.keys().then((claves) => claves.forEach((c) => caches.delete(c))).catch(() => {});
}

/* ---------------------------------------------------------
   Arranque
   --------------------------------------------------------- */
$("#fab-whatsapp").href = linkWhatsApp(CONFIG.mensajeFlotante);
$("#cal-prev").addEventListener("click", () => cambiarMes(-1));
$("#cal-next").addEventListener("click", () => cambiarMes(1));
$("#btn-confirmar").addEventListener("click", confirmarCita);
$("#cliente-nombre").addEventListener("input", (e) => {
  estado.nombre = e.target.value.replace(/\s+/g, " ").trim();
  actualizarResumen();
});
$("#texto-horario").textContent = CONFIG.textoHorario;
$("#anio").textContent = new Date().getFullYear();

pintarBarberos();

// Link directo a un barbero: .../imperial-barber/#barbero1
// (también acepta el formato anterior #/agenda/barbero1)
const idInicial = location.hash.replace(/^#(\/agenda\/)?/, "");
const barberoInicial = CONFIG.barberos.find((b) => b.id === idInicial);
if (barberoInicial) abrirAgenda(barberoInicial, true);
