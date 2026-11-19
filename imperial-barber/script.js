/* =========================================================
   IMPERIAL BARBER · Lógica de la app
   ========================================================= */

/* ---------------------------------------------------------
   CONFIGURACIÓN: cambia aquí nombres, servicios, precios,
   horarios y número de WhatsApp. No hace falta tocar nada más.
   --------------------------------------------------------- */
const CONFIG = {
  negocio: "Imperial Barber",

  // Número con código de país (57 = Colombia), sin + ni espacios
  whatsapp: "573147986180",

  // Mensaje del botón flotante verde
  mensajeFlotante: "Hola Imperial Barber, quiero agendar una cita",

  // Barberos: la foto va en la carpeta img con ese nombre (proporción 4:5)
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

  // Horario: cada hora desde horaInicio hasta horaFin (formato 24 h)
  horaInicio: 9,  // 9:00 a. m.
  horaFin: 19,    // 7:00 p. m.

  // Días cerrados: 0 = domingo, 1 = lunes … 6 = sábado. Ej.: [0] cierra los domingos
  diasCerrados: [],

  // Cuántos meses hacia adelante se puede agendar
  mesesAdelante: 2,

  // Texto que aparece al final de la pantalla de inicio
  textoHorario: "Lunes a domingo · 9:00 a. m. a 7:00 p. m.",
};

/* ---------------------------------------------------------
   Estado de la reserva
   --------------------------------------------------------- */
const estado = {
  barbero: null,   // objeto de CONFIG.barberos
  servicio: null,  // objeto de CONFIG.servicios
  dia: null,       // Date (a medianoche)
  hora: null,      // número 9..19
  mesVisible: null // Date (día 1 del mes que muestra el calendario)
};

/* ---------------------------------------------------------
   Utilidades
   --------------------------------------------------------- */
const $ = (sel) => document.querySelector(sel);

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

function hoy() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

const mismoDia = (a, b) => a && b && a.getTime() === b.getTime();

const linkWhatsApp = (texto) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;

// Pone la foto dentro de un recuadro; si la foto no existe, se queda el recuadro gris con el texto
function ponerFoto(contenedor, src, etiqueta) {
  contenedor.innerHTML = "";
  contenedor.dataset.label = etiqueta;
  const img = new Image();
  img.alt = "";
  img.decoding = "async";
  img.onerror = () => img.remove();
  img.src = src;
  contenedor.appendChild(img);
}

/* ---------------------------------------------------------
   PANTALLA 1: tarjetas de barberos
   --------------------------------------------------------- */
function pintarBarberos() {
  const lista = $("#lista-barberos");
  lista.innerHTML = "";

  CONFIG.barberos.forEach((b) => {
    const tarjeta = document.createElement("button");
    tarjeta.type = "button";
    tarjeta.className = "barbero";
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
    ponerFoto(tarjeta.querySelector(".barbero__foto"), b.foto, `Foto ${b.nombre} · ${b.foto} (4:5)`);

    tarjeta.addEventListener("click", () => {
      navegoDesdeInicio = true;
      location.hash = `#/agenda/${b.id}`;
    });
    lista.appendChild(tarjeta);
  });

  $("#texto-horario").textContent = CONFIG.textoHorario;
}

/* ---------------------------------------------------------
   PANTALLA 2: agenda
   --------------------------------------------------------- */
function abrirAgenda(barbero) {
  // Si cambia de barbero, empieza la reserva de cero
  if (estado.barbero !== barbero) {
    estado.barbero = barbero;
    estado.servicio = null;
    estado.dia = null;
    estado.hora = null;
    estado.mesVisible = null;
  }
  if (!estado.mesVisible) {
    const h = hoy();
    estado.mesVisible = new Date(h.getFullYear(), h.getMonth(), 1);
  }

  $("#perfil-nombre").textContent = barbero.nombre;
  ponerFoto($("#perfil-foto"), barbero.foto, "Foto");

  pintarServicios();
  pintarCalendario();
  pintarHoras();
  actualizarResumen();
  $("#pantalla-agenda").scrollTop = 0;
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
      if (primeraVez && !estado.dia) irA("#paso-dia");
    });
    lista.appendChild(btn);
  });
}

/* --- Calendario --- */
function pintarCalendario() {
  const contenedor = $("#cal-dias");
  const mes = estado.mesVisible;
  const h = hoy();
  const limite = new Date(h.getFullYear(), h.getMonth() + CONFIG.mesesAdelante + 1, 0); // último día permitido

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
    btn.setAttribute("aria-label", textoDia(fecha));
    btn.setAttribute("aria-pressed", String(mismoDia(fecha, estado.dia)));

    const cerrado = CONFIG.diasCerrados.includes(fecha.getDay());
    const sinHoras = mismoDia(fecha, h) && horasLibres(fecha).length === 0;
    btn.disabled = fecha < h || fecha > limite || cerrado || sinHoras;
    if (mismoDia(fecha, h)) btn.classList.add("es-hoy");

    btn.addEventListener("click", () => {
      estado.dia = fecha;
      // Si la hora elegida ya no está libre ese día, se borra
      if (estado.hora !== null && !horasLibres(fecha).includes(estado.hora)) estado.hora = null;
      contenedor.querySelectorAll(".dia").forEach((el) => el.setAttribute("aria-pressed", String(el === btn)));
      pintarHoras();
      actualizarResumen();
      if (estado.hora === null) irA("#paso-hora");
    });
    contenedor.appendChild(btn);
  }
}

function cambiarMes(delta) {
  const m = estado.mesVisible;
  estado.mesVisible = new Date(m.getFullYear(), m.getMonth() + delta, 1);
  pintarCalendario();
}

/* --- Horas --- */
// Horas libres de un día (hoy no muestra las horas que ya pasaron)
function horasLibres(fecha) {
  const ahora = new Date();
  const horas = [];
  for (let hh = CONFIG.horaInicio; hh <= CONFIG.horaFin; hh++) {
    const momento = new Date(fecha);
    momento.setHours(hh, 0, 0, 0);
    if (momento > ahora) horas.push(hh);
  }
  return horas;
}

function pintarHoras() {
  const lista = $("#lista-horas");
  const hint = $("#hora-hint");
  lista.innerHTML = "";

  if (!estado.dia) { hint.hidden = false; return; }
  hint.hidden = true;

  const libres = horasLibres(estado.dia);
  for (let hh = CONFIG.horaInicio; hh <= CONFIG.horaFin; hh++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "hora";
    btn.textContent = textoHora(hh);
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", String(estado.hora === hh));
    btn.disabled = !libres.includes(hh);

    btn.addEventListener("click", () => {
      estado.hora = hh;
      lista.querySelectorAll(".hora").forEach((el) => el.setAttribute("aria-checked", String(el === btn)));
      actualizarResumen();
      irA("#resumen");
    });
    lista.appendChild(btn);
  }
}

/* --- Resumen y confirmación --- */
function actualizarResumen() {
  const { barbero, servicio, dia, hora } = estado;
  $("#res-barbero").textContent = barbero ? barbero.nombre : "—";
  $("#res-servicio").textContent = servicio ? servicio.nombre : "—";
  $("#res-dia").textContent = dia ? textoDia(dia) : "—";
  $("#res-hora").textContent = hora !== null ? textoHora(hora) : "—";
  $("#res-total").textContent = servicio ? precio(servicio.precio) : "—";

  const faltan = [];
  if (!servicio) faltan.push("servicio");
  if (!dia) faltan.push("día");
  if (hora === null) faltan.push("hora");

  const listo = faltan.length === 0;
  $("#btn-confirmar").disabled = !listo;
  $(".confirmar").classList.toggle("listo", listo);
  if (!listo) $("#confirmar-hint").textContent = `Falta elegir: ${faltan.join(", ")}`;
}

function mensajeReserva() {
  const { barbero, servicio, dia, hora } = estado;
  return [
    `Hola ${CONFIG.negocio}, quiero agendar una cita:`,
    ``,
    `• Barbero: ${barbero.nombre}`,
    `• Servicio: ${servicio.nombre} (${precio(servicio.precio)})`,
    `• Día: ${textoDia(dia)}`,
    `• Hora: ${textoHora(hora)}`,
    ``,
    `¿Me confirman, por favor?`,
  ].join("\n");
}

function confirmarCita() {
  if ($("#btn-confirmar").disabled) return;
  const url = linkWhatsApp(mensajeReserva());
  // Abre WhatsApp (app en el celular, WhatsApp Web en el computador)
  const ventana = window.open(url, "_blank");
  if (ventana) ventana.opener = null;
  else location.href = url; // si el navegador bloquea la ventana nueva, abre en la misma
}

// Desplaza la agenda suavemente hasta el siguiente paso
function irA(selector) {
  const el = $(selector);
  if (!el) return;
  setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 180);
}

/* ---------------------------------------------------------
   Navegación entre pantallas (sin recargar)
   #/                  -> inicio
   #/agenda/barbero1   -> agenda de ese barbero (también sirve como link directo)
   --------------------------------------------------------- */
let navegoDesdeInicio = false;

function mostrarPantalla(nombre) {
  const inicio = $("#pantalla-inicio");
  const agenda = $("#pantalla-agenda");
  const enAgenda = nombre === "agenda";

  $("#app").dataset.screen = nombre;
  inicio.classList.toggle("is-active", !enAgenda);
  agenda.classList.toggle("is-active", enAgenda);

  // Accesibilidad: la pantalla oculta no recibe foco ni lectura
  inicio.toggleAttribute("inert", enAgenda);
  agenda.toggleAttribute("inert", !enAgenda);
  inicio.setAttribute("aria-hidden", String(enAgenda));
  agenda.setAttribute("aria-hidden", String(!enAgenda));

  const titulo = enAgenda ? $("#perfil-nombre") : $(".hero__title");
  setTimeout(() => titulo.focus({ preventScroll: true }), 50);
}

function enrutar() {
  const partes = location.hash.replace(/^#\/?/, "").split("/");
  if (partes[0] === "agenda") {
    const barbero = CONFIG.barberos.find((b) => b.id === partes[1]);
    if (barbero) {
      abrirAgenda(barbero);
      mostrarPantalla("agenda");
      return;
    }
  }
  mostrarPantalla("inicio");
}

function volver() {
  // Si llegó desde el inicio, usa el "atrás" normal; si entró por link directo, va al inicio
  if (navegoDesdeInicio) history.back();
  else location.hash = "#/";
  navegoDesdeInicio = false;
}

/* ---------------------------------------------------------
   Instalar como app (PWA)
   --------------------------------------------------------- */
let avisoInstalar = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  avisoInstalar = e;
  $("#btn-instalar").hidden = false;
});

$("#btn-instalar").addEventListener("click", async () => {
  if (!avisoInstalar) return;
  avisoInstalar.prompt();
  await avisoInstalar.userChoice;
  avisoInstalar = null;
  $("#btn-instalar").hidden = true;
});

window.addEventListener("appinstalled", () => { $("#btn-instalar").hidden = true; });

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}

/* ---------------------------------------------------------
   Arranque
   --------------------------------------------------------- */
$("#fab-whatsapp").href = linkWhatsApp(CONFIG.mensajeFlotante);
$("#btn-volver").addEventListener("click", volver);
$("#cal-prev").addEventListener("click", () => cambiarMes(-1));
$("#cal-next").addEventListener("click", () => cambiarMes(1));
$("#btn-confirmar").addEventListener("click", confirmarCita);
window.addEventListener("hashchange", enrutar);

pintarBarberos();
enrutar();
