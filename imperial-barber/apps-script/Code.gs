/* =========================================================
   IMPERIAL BARBER · Sistema de citas con Google Sheets
   (Google Apps Script, va pegado en tu hoja de cálculo)

   La hoja tiene 4 pestañas (se crean solas al ejecutar "configurar"):

   - Barberos   Nombre | Activo (SÍ o NO) | Correo
                Un barbero en NO desaparece de la página.
                Con un Correo, cada cita nueva le llega a ese barbero por email
                (y le suena el celular si tiene Gmail con notificaciones).
   - Citas      Fecha | Hora | Barbero | Cliente | Creada en
                Las llena la página. Para cancelar una cita, borra su fila:
                esa hora vuelve a quedar libre.
   - Descansos  Barbero | Fecha | Hora
                Horas en las que un barbero no atiende UNA VEZ (trámite, día
                libre). Hora vacía = todo el día. Aparecen bloqueadas.
   - Horario fijo  Barbero | Día | Hora
                Lo que se REPITE cada semana: "Alex | miércoles | (vacío)" = Alex no
                atiende ningún miércoles. "Dayana | Todos los días | 1:00 p. m." = su
                almuerzo diario. Hora vacía = todo el día.

   Si cambias algo de este código, publica una versión nueva:
   Implementar > Gestionar implementaciones > (lápiz) > Versión: Nueva versión > Implementar.
   ========================================================= */

/* ---------------------------------------------------------
   CONFIGURACIÓN (cámbiala aquí, junto con script.js si hace falta)
   --------------------------------------------------------- */

// Horario: primera y última hora que se puede reservar (formato 24 h).
// Debe ser igual a horaInicio y horaFin en script.js.
const HORA_INICIO = 9;   // 9:00 a. m.
const HORA_FIN = 19;     // 7:00 p. m.

// Cuántos días hacia adelante se acepta una cita
const DIAS_ADELANTE = 100;

// Zona horaria de la barbería
const ZONA = "America/Bogota";

// Barberos que se escriben solos en la pestaña "Barberos" la primera vez.
// Los nombres deben ser IGUALES a los de CONFIG.barberos en script.js.
const BARBEROS_INICIALES = ["Alex", "Dayana"];

// OPCIONAL: Google Calendar. Si pones aquí el ID de un calendario, cada cita
// nueva crea también un evento ahí (lo ves en tu celular, con alarma).
// Déjalo vacío ("") para no usar Calendar.
// Dónde está el ID: en Google Calendar > Configuración de tu calendario >
// "Integrar el calendario" > "ID de calendario". Si usas tu calendario
// principal, es tu correo de Gmail.
const ID_CALENDARIO = "";

// Duración del evento en Calendar, en minutos
const DURACION_MIN = 60;

// Avisar al barbero por correo cada vez que le agendan una cita (usa la columna
// "Correo" de la pestaña Barberos). Pon false para desactivarlo.
const AVISAR_POR_CORREO = true;

// Nombre que ve el barbero como remitente del correo
const NOMBRE_NEGOCIO = "Imperial Barber";

/* ---------------------------------------------------------
   Nombres de las pestañas (no los cambies)
   --------------------------------------------------------- */
const HOJA_BARBEROS = "Barberos";
const HOJA_CITAS = "Citas";
const HOJA_DESCANSOS = "Descansos";
const HOJA_FIJO = "Horario fijo";

/* =========================================================
   1. LA PÁGINA PREGUNTA
   .../exec?accion=barberos
       -> { ok: true, barberos: ["Barbero 1", "Barbero 2"] }   (solo los activos)
   .../exec?accion=ocupadas&barbero=Barbero 1&desde=2026-11-20&hasta=2027-01-31
       -> { ok: true, ocupadas: { "2026-11-23": [9, 14] } }    (citas y descansos)
   Nunca devuelve nombres de clientes.
   ========================================================= */
function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    if (p.accion === "barberos") {
      return responder({ ok: true, barberos: barberosActivos().map(function (b) { return b.nombre; }) });
    }
    if (p.accion === "ocupadas") return responder(listarOcupadas(p));
    return responder({ ok: true, mensaje: "Imperial Barber: el sistema de citas está funcionando." });
  } catch (err) {
    console.error(err);
    return responder(fallo("interno", "Error interno de la hoja"));
  }
}

function listarOcupadas(p) {
  const barbero = buscarBarbero(p.barbero);
  if (!barbero) return fallo("barbero", "Ese barbero no está disponible");

  const desde = esDiaValido(p.desde) ? p.desde : hoyTexto();
  const hasta = esDiaValido(p.hasta) ? p.hasta : sumarDias(hoyTexto(), DIAS_ADELANTE);
  return { ok: true, ocupadas: ocupadasDe(barbero.nombre, desde, hasta) };
}

/* =========================================================
   2. LA PÁGINA CREA UNA CITA
   Recibe (texto JSON): { barbero, fecha: "2026-11-23", hora: 14, nombre, servicio }
   Responde: { ok: true }  o  { ok: false, error: "hora_ocupada", mensaje: "..." }
   ========================================================= */
function doPost(e) {
  let datos;
  try {
    datos = JSON.parse(e.postData.contents);
  } catch (err) {
    return responder(fallo("formato", "Datos mal enviados"));
  }

  // Candado: si dos clientes confirman a la vez, se atienden uno por uno.
  // Así nunca se guardan dos citas en la misma hora.
  const candado = LockService.getScriptLock();
  if (!candado.tryLock(15000)) {
    return responder(fallo("ocupado", "El sistema está ocupado, intenta de nuevo en unos segundos"));
  }
  try {
    return responder(crearCita(datos));
  } catch (err) {
    console.error(err);
    return responder(fallo("interno", "Error interno de la hoja"));
  } finally {
    candado.releaseLock();
  }
}

function crearCita(c) {
  // --- Revisar los datos ---
  const barbero = buscarBarbero(c.barbero);
  const fecha = diaDe(c.fecha);
  const hora = Number(c.hora);
  const nombre = limpiar(c.nombre, 60);
  const servicio = limpiar(c.servicio, 60);

  if (!barbero) return fallo("barbero", "ese barbero no está disponible");
  if (!fecha) return fallo("fecha", "día no válido");
  if (!(Math.floor(hora) === hora && hora >= HORA_INICIO && hora <= HORA_FIN)) return fallo("hora", "hora fuera del horario");
  if (nombre.length < 2) return fallo("nombre", "escribe tu nombre");

  const hoy = hoyTexto();
  if (fecha < hoy) return fallo("pasado", "ese día ya pasó");
  if (fecha === hoy && hora <= horaActual()) return fallo("pasado", "esa hora ya pasó");
  if (fecha > sumarDias(hoy, DIAS_ADELANTE)) return fallo("lejos", "ese día está muy lejos todavía");

  // --- ¿Esa hora ya está ocupada por otra cita o por un descanso? ---
  const ocupadas = ocupadasDe(barbero.nombre, fecha, fecha)[fecha] || [];
  if (ocupadas.indexOf(hora) !== -1) return fallo("hora_ocupada", "esa hora ya no está disponible");

  // --- Guardar ---
  hojas().citas.appendRow([
    fecha,
    etiquetaHora(hora),
    barbero.nombre,
    nombre,
    Utilities.formatDate(new Date(), ZONA, "yyyy-MM-dd HH:mm:ss"),
  ]);
  SpreadsheetApp.flush(); // asegura que quede escrita antes de soltar el candado

  // Los avisos son un extra: si fallan, la cita ya quedó guardada y no se pierde
  crearEventoCalendario(barbero, fecha, hora, nombre, servicio);
  avisarBarbero(barbero, fecha, hora, nombre, servicio);
  return { ok: true };
}

// Crea el evento en Google Calendar. Va al calendario de ID_CALENDARIO; si lo dejaste
// vacío pero el barbero tiene Correo, va a tu calendario principal. Si el barbero tiene
// un Correo distinto al dueño del calendario, se le invita para que le aparezca en su
// Calendar con su alarma. Si falla, la cita ya quedó guardada: el error solo se anota.
function crearEventoCalendario(barbero, fecha, hora, nombre, servicio) {
  if (!ID_CALENDARIO && !esCorreo(barbero.correo)) return;
  try {
    const calendario = ID_CALENDARIO ? CalendarApp.getCalendarById(ID_CALENDARIO) : CalendarApp.getDefaultCalendar();
    if (!calendario) {
      console.error("No se encontró un calendario con el ID: " + ID_CALENDARIO);
      return;
    }
    const inicio = Utilities.parseDate(fecha + " " + pad2(hora) + ":00", ZONA, "yyyy-MM-dd HH:mm");
    const fin = new Date(inicio.getTime() + DURACION_MIN * 60000);
    const titulo = (servicio || "Cita") + " · " + nombre + " (" + barbero.nombre + ")";
    const opciones = {
      description: "Barbero: " + barbero.nombre + "\nCliente: " + nombre + (servicio ? "\nServicio: " + servicio : "") +
        "\nReservada desde la página web",
    };

    // Invitar al barbero solo si su correo no es el del propio calendario (Google no se invita a sí mismo)
    const invitar = esCorreo(barbero.correo) && norm(barbero.correo) !== norm(calendario.getId());
    if (invitar) {
      try {
        calendario.createEvent(titulo, inicio, fin, Object.assign({ guests: barbero.correo, sendInvites: true }, opciones));
        return;
      } catch (err) {
        console.error("No se pudo invitar a " + barbero.correo + ", se crea el evento sin invitación: " + err);
      }
    }
    calendario.createEvent(titulo, inicio, fin, opciones);
  } catch (err) {
    console.error("No se pudo crear el evento en Calendar: " + err);
  }
}

// Manda un correo al barbero con los datos de la cita. Gmail avisa al celular apenas llega.
// Si falla (por ejemplo, falta autorizar el permiso de correo), la cita igual queda guardada.
function avisarBarbero(barbero, fecha, hora, nombre, servicio) {
  if (!AVISAR_POR_CORREO || !esCorreo(barbero.correo)) return;
  try {
    MailApp.sendEmail({
      to: barbero.correo,
      name: NOMBRE_NEGOCIO,
      subject: "Nueva cita: " + fecha + " " + etiquetaHora(hora) + " · " + nombre,
      body: "Tienes una cita nueva.\n\n" +
        "Cliente: " + nombre + "\n" +
        (servicio ? "Servicio: " + servicio + "\n" : "") +
        "Día: " + fecha + "\n" +
        "Hora: " + etiquetaHora(hora) + "\n" +
        "Barbero: " + barbero.nombre + "\n\n" +
        "Reservada desde la página web de " + NOMBRE_NEGOCIO + ".\n" +
        "Para cancelarla, borra su fila en la pestaña Citas de la hoja.",
    });
  } catch (err) {
    console.error("No se pudo mandar el correo a " + barbero.correo + ": " + err);
  }
}

/* =========================================================
   Leer las pestañas
   ========================================================= */

// Barberos de la pestaña "Barberos" con Activo = SÍ
function barberosActivos() {
  return filas(hojas().barberos, 3)
    .map(function (f) {
      return {
        nombre: String(f[0] == null ? "" : f[0]).replace(/\s+/g, " ").trim(),
        activo: esSi(f[1]),
        correo: String(f[2] == null ? "" : f[2]).trim(),
      };
    })
    .filter(function (b) { return b.nombre && b.activo; });
}

// Busca un barbero activo ignorando mayúsculas, tildes y espacios de más
function buscarBarbero(nombre) {
  const clave = norm(nombre);
  if (!clave) return null;
  const lista = barberosActivos();
  for (let i = 0; i < lista.length; i++) if (norm(lista[i].nombre) === clave) return lista[i];
  return null;
}

// Horas ocupadas de un barbero entre dos días: { "2026-11-23": [9, 14] }
// Une las citas guardadas y los descansos.
function ocupadasDe(nombreBarbero, desde, hasta) {
  const clave = norm(nombreBarbero);
  const mapa = {};
  const poner = function (dia, hora) {
    if (!mapa[dia]) mapa[dia] = [];
    if (mapa[dia].indexOf(hora) === -1) mapa[dia].push(hora);
  };

  // Citas: Fecha | Hora | Barbero | Cliente | Creada en
  filas(hojas().citas, 5).forEach(function (f) {
    if (norm(f[2]) !== clave) return;
    const dia = diaDe(f[0]);
    const hora = horaDe(f[1]);
    if (!dia || hora === null || dia < desde || dia > hasta) return;
    poner(dia, hora);
  });

  // Descansos: Barbero | Fecha | Hora (hora vacía = todo el día)
  filas(hojas().descansos, 3).forEach(function (f) {
    if (norm(f[0]) !== clave) return;
    const dia = diaDe(f[1]);
    if (!dia || dia < desde || dia > hasta) return;
    const hora = esVacio(f[2]) ? null : horaDe(f[2]);
    if (hora === null) {
      // Vacía, o con algo que no se entiende: se bloquea todo el día para que se note
      for (let h = HORA_INICIO; h <= HORA_FIN; h++) poner(dia, h);
    } else {
      poner(dia, hora);
    }
  });

  // Horario fijo: Barbero | Día de la semana | Hora (hora vacía = todo el día)
  const fijas = filas(hojas().fijo, 3)
    .filter(function (f) { return norm(f[0]) === clave; })
    .map(function (f) { return { dias: diasDeLaSemana(f[1]), hora: esVacio(f[2]) ? null : horaDe(f[2]) }; })
    .filter(function (r) { return r.dias.length > 0; });
  if (fijas.length > 0) {
    // Se recorre cada día del rango (con un tope, por si piden un rango enorme)
    const tope = sumarDias(desde, 400);
    const fin = hasta < tope ? hasta : tope;
    for (let dia = desde; dia <= fin; dia = sumarDias(dia, 1)) {
      const semana = diaSemanaDe(dia);
      fijas.forEach(function (r) {
        if (r.dias.indexOf(semana) === -1) return;
        if (r.hora === null) {
          for (let h = HORA_INICIO; h <= HORA_FIN; h++) poner(dia, h);
        } else {
          poner(dia, r.hora);
        }
      });
    }
  }

  Object.keys(mapa).forEach(function (d) { mapa[d].sort(function (a, b) { return a - b; }); });
  return mapa;
}

// Filas de datos (sin el título) de una pestaña
function filas(hoja, columnas) {
  const n = hoja.getLastRow() - 1;
  if (n < 1) return [];
  return hoja.getRange(2, 1, n, columnas).getValues();
}

/* =========================================================
   Crear las pestañas
   ========================================================= */
let _hojas = null;
function hojas() {
  if (!_hojas) _hojas = asegurarHojas();
  return _hojas;
}

function asegurarHojas() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let barberos = libro.getSheetByName(HOJA_BARBEROS);
  let citas = libro.getSheetByName(HOJA_CITAS);
  let descansos = libro.getSheetByName(HOJA_DESCANSOS);
  let fijo = libro.getSheetByName(HOJA_FIJO);
  comprobarCitas(citas);
  completarBarberos(barberos);
  if (barberos && citas && descansos && fijo) {
    return { libro: libro, barberos: barberos, citas: citas, descansos: descansos, fijo: fijo };
  }

  // Misma zona horaria en toda la hoja, para que las fechas no se corran un día
  libro.setSpreadsheetTimeZone(ZONA);

  if (!barberos) {
    // Si la hoja es nueva, reutiliza su primera pestaña vacía ("Hoja 1") en vez de dejarla sobrando
    const vacia = libro.getSheets().filter(function (h) {
      return h.getLastRow() === 0 && /^(hoja|sheet) ?\d+$/i.test(h.getName());
    })[0];
    barberos = vacia || libro.insertSheet(HOJA_BARBEROS, 0);
    barberos.setName(HOJA_BARBEROS);
    prepararBarberos(barberos);
  }
  if (!citas) {
    citas = libro.insertSheet(HOJA_CITAS, libro.getSheets().length);
    prepararCitas(citas);
  }
  if (!descansos) {
    descansos = libro.insertSheet(HOJA_DESCANSOS, libro.getSheets().length);
    prepararDescansos(libro, descansos);
  }
  if (!fijo) {
    fijo = libro.insertSheet(HOJA_FIJO, libro.getSheets().length);
    prepararFijo(libro, fijo);
  }
  return { libro: libro, barberos: barberos, citas: citas, descansos: descansos, fijo: fijo };
}

// Si la pestaña "Citas" viene de una versión anterior del código, sus columnas son otras
function comprobarCitas(citas) {
  if (citas && citas.getLastRow() > 0 && citas.getRange(1, 1).getValue() !== "Fecha") {
    throw new Error('La pestaña "Citas" es de una versión anterior (su primera columna no se llama "Fecha"). ' +
      'Cámbiale el nombre a "Citas vieja" y ejecuta "configurar" otra vez.');
  }
}

// Las hojas creadas con una versión anterior no tienen la columna "Correo": se agrega sola
function completarBarberos(barberos) {
  if (barberos && barberos.getLastRow() > 0 && esVacio(barberos.getRange(1, 3).getValue())) {
    barberos.getRange(1, 3).setValue("Correo")
      .setFontWeight("bold").setBackground("#0B0B0C").setFontColor("#C8A97E");
    barberos.getRange("C1").setNote("Correo del barbero. Le llega un aviso por cada cita nueva. Déjalo vacío para no avisarle.");
    barberos.setColumnWidth(3, 240);
  }
}

function titulos(hoja, lista) {
  hoja.getRange(1, 1, 1, lista.length).setValues([lista])
    .setFontWeight("bold").setBackground("#0B0B0C").setFontColor("#C8A97E");
  hoja.setFrozenRows(1);
}

function prepararBarberos(hoja) {
  titulos(hoja, ["Nombre", "Activo", "Correo"]);
  hoja.getRange(2, 1, BARBEROS_INICIALES.length, 3).setValues(BARBEROS_INICIALES.map(function (n) { return [n, "SÍ", ""]; }));
  hoja.getRange("B2:B").setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(["SÍ", "NO"], true).setAllowInvalid(false).build());
  hoja.getRange("A1").setNote("El nombre debe ser igual al de CONFIG.barberos en script.js.");
  hoja.getRange("B1").setNote("SÍ = aparece en la página. NO = desaparece.");
  hoja.getRange("C1").setNote("Correo del barbero. Le llega un aviso por cada cita nueva. Déjalo vacío para no avisarle.");
  hoja.setColumnWidth(1, 200);
  hoja.setColumnWidth(2, 90);
  hoja.setColumnWidth(3, 240);
}

function prepararCitas(hoja) {
  titulos(hoja, ["Fecha", "Hora", "Barbero", "Cliente", "Creada en"]);
  hoja.getRange("A:E").setNumberFormat("@"); // texto: así Google no cambia las fechas ni las horas
  hoja.getRange("A1").setNote("Para cancelar una cita, borra su fila. Esa hora vuelve a quedar libre.");
  hoja.setColumnWidth(1, 110);
  hoja.setColumnWidth(2, 110);
  hoja.setColumnWidth(3, 150);
  hoja.setColumnWidth(4, 200);
  hoja.setColumnWidth(5, 160);
}

function prepararDescansos(libro, hoja) {
  titulos(hoja, ["Barbero", "Fecha", "Hora"]);
  hoja.getRange("C:C").setNumberFormat("@");
  hoja.getRange("B2:B").setNumberFormat("yyyy-mm-dd");

  // Listas y reglas para evitar errores al escribir
  hoja.getRange("A2:A").setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInRange(libro.getRange("Barberos!A2:A"), true).setAllowInvalid(false).build());
  hoja.getRange("B2:B").setDataValidation(
    SpreadsheetApp.newDataValidation().requireDate().setAllowInvalid(false).build());
  const horas = [];
  for (let h = HORA_INICIO; h <= HORA_FIN; h++) horas.push(etiquetaHora(h));
  hoja.getRange("C2:C").setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(horas, true).setAllowInvalid(false).build());

  hoja.getRange("C1").setNote("Déjala vacía para bloquear TODO el día de ese barbero.");
  hoja.setColumnWidth(1, 200);
  hoja.setColumnWidth(2, 120);
  hoja.setColumnWidth(3, 120);
}

function prepararFijo(libro, hoja) {
  titulos(hoja, ["Barbero", "Día", "Hora"]);
  hoja.getRange("C:C").setNumberFormat("@");
  hoja.getRange("A2:A").setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInRange(libro.getRange("Barberos!A2:A"), true).setAllowInvalid(false).build());
  hoja.getRange("B2:B").setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(["Todos los días", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"], true)
      .setAllowInvalid(false).build());
  const horas = [];
  for (let h = HORA_INICIO; h <= HORA_FIN; h++) horas.push(etiquetaHora(h));
  hoja.getRange("C2:C").setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(horas, true).setAllowInvalid(false).build());
  hoja.getRange("A1").setNote("Lo que se repite cada semana. Ejemplos: Alex | miércoles | (vacío) = Alex no atiende los miércoles. Dayana | Todos los días | 1:00 p. m. = su almuerzo.");
  hoja.getRange("C1").setNote("Déjala vacía para bloquear TODO el día.");
  hoja.setColumnWidth(1, 200);
  hoja.setColumnWidth(2, 160);
  hoja.setColumnWidth(3, 120);
}

/* =========================================================
   Ayudantes
   ========================================================= */
function responder(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(ContentService.MimeType.JSON);
}

function fallo(codigo, mensaje) {
  return { ok: false, error: codigo, mensaje: mensaje };
}

function pad2(n) {
  return ("0" + n).slice(-2);
}

// 9 -> "9:00 a. m." · 14 -> "2:00 p. m."  (igual que en la página)
function etiquetaHora(h) {
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return h12 + ":00 " + (h < 12 ? "a. m." : "p. m.");
}

// Minúsculas, sin tildes y sin espacios de más: "  Barbero  1 " -> "barbero 1"
function norm(texto) {
  return String(texto == null ? "" : texto)
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ").trim().toLowerCase();
}

function esVacio(v) {
  return v === "" || v === null || v === undefined || (typeof v === "string" && v.trim() === "");
}

function esCorreo(t) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(t || "").trim());
}

function esSi(v) {
  return ["si", "s", "yes", "y", "true", "1", "x"].indexOf(norm(v)) !== -1;
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

let _zonaLibro = null;
function zonaLibro() {
  if (!_zonaLibro) _zonaLibro = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone() || ZONA;
  return _zonaLibro;
}

// Entiende el día venga como venga de la hoja: fecha real, "2026-11-23" o "23/11/2026".
// Devuelve "2026-11-23", o "" si no se entiende.
function diaDe(v) {
  if (v instanceof Date) return Utilities.formatDate(v, zonaLibro(), "yyyy-MM-dd");
  const t = String(v == null ? "" : v).trim().replace(/^'/, "");
  if (esDiaValido(t)) return t;
  const m = t.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (m) {
    const s = m[3] + "-" + pad2(m[2]) + "-" + pad2(m[1]);
    return esDiaValido(s) ? s : "";
  }
  return "";
}

// Entiende la hora venga como venga de la hoja: 9, "9:00", "14:00", "2:00 p. m.",
// o una hora de Google Sheets. Devuelve el número de hora (0 a 23), o null si no se entiende.
function horaDe(v) {
  if (esVacio(v)) return null;
  if (v instanceof Date) {
    // Google guarda las horas como fecha de 1899 y a veces trae minutos de desfase: se redondea
    const tz = zonaLibro();
    const minutos = Number(Utilities.formatDate(v, tz, "H")) * 60 + Number(Utilities.formatDate(v, tz, "m"));
    return Math.round(minutos / 60) % 24;
  }
  if (typeof v === "number") {
    if (v > 0 && v < 1) return Math.round(v * 24) % 24; // 0.375 = 9:00
    return Math.floor(v) === v && v >= 0 && v <= 23 ? v : null;
  }
  const t = norm(v).replace(/\./g, "").replace(/\s+/g, " ");
  const m = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(a ?m|p ?m)?$/);
  if (!m) return null;
  let h = Number(m[1]);
  if (m[3]) {
    const pm = m[3].charAt(0) === "p";
    if (h < 1 || h > 12) return null;
    if (pm && h < 12) h += 12;
    if (!pm && h === 12) h = 0;
  }
  return h >= 0 && h <= 23 ? h : null;
}

// Día de la semana de un día "2026-12-02": 0 = domingo … 6 = sábado
function diaSemanaDe(diaTexto) {
  const p = diaTexto.split("-").map(Number);
  return new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay();
}

// Entiende "miércoles", "los martes", "Todos los días"… y devuelve los días (0 a 6)
function diasDeLaSemana(texto) {
  const t = norm(texto);
  if (!t) return [];
  const nombres = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
  const dias = [];
  nombres.forEach(function (n, i) { if (t.indexOf(n) !== -1) dias.push(i); });
  if (dias.length > 0) return dias;
  if (/todos|diari|cada dia|siempre/.test(t)) return [0, 1, 2, 3, 4, 5, 6];
  return [];
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
   Ejecútalo UNA vez desde el editor (botón ▶ Ejecutar con
   "configurar" elegido): crea las 3 pestañas y pide los permisos.
   ========================================================= */
function configurar() {
  asegurarHojas();
  console.log("Listo: las pestañas Barberos, Citas, Descansos y Horario fijo están creadas. Ahora publica el código como aplicación web.");
}
