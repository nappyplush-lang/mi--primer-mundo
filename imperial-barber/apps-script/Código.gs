/* =========================================================
   IMPERIAL BARBER · Citas en Google Sheets (Google Apps Script)

   Qué hace este código:
   1. Le dice a la página qué horas ya están reservadas
      de cada barbero (sin mostrar nombres de clientes).
   2. Guarda cada cita nueva en la pestaña "Citas" de esta hoja.

   Para liberar una hora: en la columna "Estado" escoge "Cancelada".

   Si cambias algo aquí, publica una versión nueva:
   Implementar > Gestionar implementaciones > (lápiz) > Versión: Nueva versión > Implementar.
   ========================================================= */

/* ---------------------------------------------------------
   CONFIGURACIÓN (debe coincidir con script.js de la página)
   --------------------------------------------------------- */

// Los "id" de los barberos, iguales a los de CONFIG.barberos en script.js.
// Solo cámbialo si agregas o quitas un barbero.
const BARBEROS = ["barbero1", "barbero2"];

// Horario: primera y última hora que se puede reservar (formato 24 h)
const HORA_INICIO = 9;  // 9:00 a. m.
const HORA_FIN = 19;    // 7:00 p. m.

// Cuántos días hacia adelante se acepta una cita
const DIAS_ADELANTE = 100;

// Zona horaria de la barbería
const ZONA = "America/Bogota";

// Nombre de la pestaña donde se guardan las citas (se crea sola)
const HOJA = "Citas";

/* ---------------------------------------------------------
   Columnas de la pestaña "Citas" (no cambies el orden)
   --------------------------------------------------------- */
const COLUMNAS = ["Registrada", "Día", "Hora", "Barbero", "Cliente", "Servicio", "Precio", "Estado", "ID barbero"];
const COL = { registrada: 1, dia: 2, hora: 3, barbero: 4, cliente: 5, servicio: 6, precio: 7, estado: 8, idBarbero: 9 };

/* =========================================================
   1. LA PÁGINA PREGUNTA QUÉ HORAS ESTÁN OCUPADAS
   .../exec?accion=ocupadas&barbero=barbero1&desde=2026-11-20&hasta=2027-01-31
   Responde: { ok: true, ocupadas: { "2026-11-23": [9, 14] } }
   ========================================================= */
function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    if (p.accion === "ocupadas") return responder(horasOcupadas(p));
    return responder({ ok: true, mensaje: "Imperial Barber: el sistema de citas está funcionando." });
  } catch (err) {
    console.error(err);
    return responder({ ok: false, error: "interno", mensaje: "Error interno de la hoja" });
  }
}

function horasOcupadas(p) {
  const barbero = String(p.barbero || "");
  if (BARBEROS.indexOf(barbero) === -1) return { ok: false, error: "barbero", mensaje: "Barbero no válido" };

  // Rango de días (si no llega, desde hoy hasta el límite)
  const desde = esDiaValido(p.desde) ? p.desde : hoyTexto();
  const hasta = esDiaValido(p.hasta) ? p.hasta : sumarDias(hoyTexto(), DIAS_ADELANTE);

  const ocupadas = {};
  leerCitas().forEach(function (c) {
    if (c.idBarbero !== barbero || c.cancelada) return;
    if (c.dia < desde || c.dia > hasta) return;
    if (!ocupadas[c.dia]) ocupadas[c.dia] = [];
    if (ocupadas[c.dia].indexOf(c.hora) === -1) ocupadas[c.dia].push(c.hora);
  });
  Object.keys(ocupadas).forEach(function (d) { ocupadas[d].sort(function (a, b) { return a - b; }); });

  return { ok: true, ocupadas: ocupadas };
}

/* =========================================================
   2. LA PÁGINA GUARDA UNA CITA NUEVA
   Recibe: { barbero, barberoNombre, dia: "2026-11-23", hora: 14, servicio, precio, nombre }
   Responde: { ok: true } o { ok: false, error: "hora_ocupada" }
   ========================================================= */
function doPost(e) {
  let cita;
  try {
    cita = JSON.parse(e.postData.contents);
  } catch (err) {
    return responder({ ok: false, error: "formato", mensaje: "Datos mal enviados" });
  }

  // Candado: si dos clientes confirman al mismo tiempo, se atienden uno por uno
  const candado = LockService.getScriptLock();
  if (!candado.tryLock(15000)) {
    return responder({ ok: false, error: "ocupado", mensaje: "La hoja está ocupada, intenta de nuevo en unos segundos" });
  }
  try {
    return responder(guardarCita(cita));
  } catch (err) {
    console.error(err);
    return responder({ ok: false, error: "interno", mensaje: "Error interno de la hoja" });
  } finally {
    candado.releaseLock();
  }
}

function guardarCita(c) {
  // --- Revisar los datos ---
  const barbero = String(c.barbero || "");
  const dia = String(c.dia || "");
  const hora = Number(c.hora);
  const nombre = limpiar(c.nombre, 60);
  const servicio = limpiar(c.servicio, 60);
  const barberoNombre = limpiar(c.barberoNombre, 60) || barbero;
  const valor = Number(c.precio);

  if (BARBEROS.indexOf(barbero) === -1) return error("barbero", "barbero no válido");
  if (!esDiaValido(dia)) return error("dia", "día no válido");
  if (!(hora >= HORA_INICIO && hora <= HORA_FIN && Math.floor(hora) === hora)) return error("hora", "hora fuera del horario");
  if (nombre.length < 2) return error("nombre", "escribe tu nombre");
  if (!servicio) return error("servicio", "elige un servicio");

  const hoy = hoyTexto();
  if (dia < hoy) return error("pasado", "ese día ya pasó");
  if (dia === hoy && hora <= horaActual()) return error("pasado", "esa hora ya pasó");
  if (dia > sumarDias(hoy, DIAS_ADELANTE)) return error("lejos", "ese día está muy lejos todavía");

  // --- ¿Alguien ya tomó esa hora? ---
  const tomada = leerCitas().some(function (x) {
    return x.idBarbero === barbero && x.dia === dia && x.hora === hora && !x.cancelada;
  });
  if (tomada) return { ok: false, error: "hora_ocupada", mensaje: "esa hora ya está reservada" };

  // --- Guardar ---
  const hoja = obtenerHoja();
  hoja.appendRow([
    new Date(),
    dia,
    hora,
    barberoNombre,
    nombre,
    servicio,
    isFinite(valor) ? valor : "",
    "Confirmada",
    barbero,
  ]);
  return { ok: true };
}

/* =========================================================
   Ayudantes
   ========================================================= */

// Lee todas las citas de la pestaña "Citas"
function leerCitas() {
  const hoja = obtenerHoja();
  const filas = hoja.getLastRow() - 1;
  if (filas < 1) return [];
  const valores = hoja.getRange(2, 1, filas, COLUMNAS.length).getValues();
  return valores.map(function (f) {
    return {
      dia: diaComoTexto(f[COL.dia - 1]),
      hora: Number(f[COL.hora - 1]),
      idBarbero: String(f[COL.idBarbero - 1]).trim(),
      cancelada: String(f[COL.estado - 1]).trim().toLowerCase() === "cancelada",
    };
  }).filter(function (c) { return c.dia && c.idBarbero; });
}

// Devuelve la pestaña "Citas"; si no existe, la crea con sus títulos y formato
function obtenerHoja() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(HOJA);
  if (hoja) return hoja;

  hoja = libro.insertSheet(HOJA);
  hoja.getRange(1, 1, 1, COLUMNAS.length).setValues([COLUMNAS])
    .setFontWeight("bold").setBackground("#0B0B0C").setFontColor("#C8A97E");
  hoja.setFrozenRows(1);
  // "Día" como texto (así Google no lo cambia de formato) y "Registrada" con fecha y hora
  hoja.getRange("B:B").setNumberFormat("@");
  hoja.getRange("A2:A").setNumberFormat("yyyy-mm-dd hh:mm");
  hoja.getRange("G2:G").setNumberFormat("$#,##0");
  // Lista desplegable en "Estado" para poder cancelar con un clic
  const reglas = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Confirmada", "Cancelada"], true)
    .setAllowInvalid(true)
    .build();
  hoja.getRange("H2:H").setDataValidation(reglas);
  hoja.setColumnWidths(1, COLUMNAS.length, 130);
  hoja.setColumnWidth(5, 180);
  return hoja;
}

function responder(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(ContentService.MimeType.JSON);
}

function error(codigo, mensaje) {
  return { ok: false, error: codigo, mensaje: mensaje };
}

// Quita espacios de más, corta el largo y evita que la hoja lo tome como fórmula
function limpiar(texto, largo) {
  let t = String(texto == null ? "" : texto).replace(/\s+/g, " ").trim().slice(0, largo);
  if (/^[=+\-@]/.test(t)) t = "'" + t;
  return t;
}

function esDiaValido(t) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(t || ""))) return false;
  const p = t.split("-").map(Number);
  const f = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
  return f.getUTCFullYear() === p[0] && f.getUTCMonth() === p[1] - 1 && f.getUTCDate() === p[2];
}

// El día puede llegar como texto o, si alguien lo editó a mano, como fecha
function diaComoTexto(v) {
  if (v instanceof Date) return Utilities.formatDate(v, ZONA, "yyyy-MM-dd");
  const t = String(v || "").trim().replace(/^'/, "");
  return esDiaValido(t) ? t : "";
}

function hoyTexto() {
  return Utilities.formatDate(new Date(), ZONA, "yyyy-MM-dd");
}

function horaActual() {
  return Number(Utilities.formatDate(new Date(), ZONA, "H"));
}

function sumarDias(diaTexto, dias) {
  const p = diaTexto.split("-").map(Number);
  const f = new Date(Date.UTC(p[0], p[1] - 1, p[2] + dias));
  return Utilities.formatDate(f, "UTC", "yyyy-MM-dd");
}

/* =========================================================
   Ejecútalo UNA vez desde el editor (botón ▶ Ejecutar) para
   crear la pestaña "Citas" y darle permisos al código.
   ========================================================= */
function configurar() {
  obtenerHoja();
  console.log("Listo: la pestaña \"" + HOJA + "\" está creada. Ahora publica el código como aplicación web.");
}
