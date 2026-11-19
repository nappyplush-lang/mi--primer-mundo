/* =========================================================
   IMPERIAL BARBER · Service worker básico
   - Guarda la app para que abra rápido y funcione sin señal.
   - Siempre intenta traer la versión nueva primero (así ves
     tus cambios y tus fotos nuevas apenas las subas).
   Si cambias archivos y quieres forzar la actualización,
   sube el número de VERSION.
   ========================================================= */
const VERSION = "imperial-v1";

const ARCHIVOS_APP = [
  "./",
  "./index.html",
  "./styles.css",
  "./script.js",
  "./manifest.json",
  "./img/icons/icon-192.png",
  "./img/icons/icon-512.png",
];

// Instalación: guarda los archivos base de la app
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(ARCHIVOS_APP)));
  self.skipWaiting();
});

// Activación: borra versiones viejas
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((claves) =>
      Promise.all(claves.filter((c) => c !== VERSION).map((c) => caches.delete(c)))
    )
  );
  self.clients.claim();
});

// Peticiones: primero internet; si no hay señal, usa lo guardado
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const esPropio = url.origin === self.location.origin;
  const esFuente = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (!esPropio && !esFuente) return; // WhatsApp y demás links externos pasan directo

  event.respondWith(
    fetch(request)
      .then((respuesta) => {
        if (respuesta.ok || respuesta.type === "opaque") {
          const copia = respuesta.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copia));
        }
        return respuesta;
      })
      .catch(() =>
        caches.match(request).then((guardado) => guardado || (request.mode === "navigate" ? caches.match("./index.html") : Response.error()))
      )
  );
});
