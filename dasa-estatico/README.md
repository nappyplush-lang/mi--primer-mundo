# DASA Centro Estético · sitio estático (HTML + CSS + JS)

Sin dependencias ni build. Abre `index.html` o publícalo tal cual (GitHub Pages: `/dasa-estatico/`).
Páginas: `index.html`, `servicios.html`, `nosotros.html`, `contacto.html`, `404.html`.

## Imágenes que debes crear (carpeta `images/`)
`hero.jpg` (1920×1080, sujeto a la derecha; el texto va a la izquierda), `servicio-facial.jpg`, `servicio-corporal.jpg`, `servicio-masajes.jpg` (3:4), `promo.jpg` (9:7), `nosotros.jpg` (4:5), `ig-1.jpg` … `ig-6.jpg` (cuadradas), `og-image.jpg` (1200×630). Optimízalas a WebP/JPG ≤ 150 KB. Mientras no existan se ve un degradado rosa/malva.

## Lista REEMPLAZAR (busca `REEMPLAZAR` en el código)
Datos de ejemplo actuales y dónde cambiarlos:
- [ ] Dirección `Carrera 00 # 00-00, El Poblado, Medellín`: `contacto.html`, footer de todas las páginas y JSON-LD (`streetAddress`, código postal, coordenadas) en `index.html` y `contacto.html`
- [x] WhatsApp real `57 314 798 6180`: se cambia en UNA línea, `js/config.js` (`whatsapp: '573147986180'`). Todos los botones y el formulario leen ese valor. `index.html` lleva `config.js` y `main.js` incrustados: si cambias el número, cambia también la línea `window.DASA_CONFIG` dentro del `<script>` de `index.html`. Además actualiza `telephone` en el JSON-LD (`index.html` y `contacto.html`).
- [ ] Horario `Lun a Sáb, 9:00 a. m. a 6:00 p. m.`: `contacto.html`, barra superior y JSON-LD (`opens` / `closes`)
- [ ] Dominio `https://www.dasa-ejemplo.com.co`: canonical, og:url, og:image, JSON-LD, `robots.txt` y `sitemap.xml`
- [ ] Instagram `@dasa.centroestetico`: footer, Inicio y Contacto
- [ ] Mapa de Google (iframe en `index.html` y `contacto.html`): Compartir → Insertar un mapa
- [ ] Testimonios de ejemplo (`index.html`) por reales
- [ ] Lista de tratamientos (`servicios.html`) e historia (`nosotros.html`)
- [ ] Nombre provisional "DASA" y logo, si cambian
- [ ] `priceRange` del JSON-LD
- [ ] Imágenes pendientes: `ig-4.jpg` y `og-image.jpg`

Nota: el formulario de contacto no envía datos a ningún servidor; valida nombre y teléfono (celular colombiano de 10 dígitos) y abre WhatsApp con el mensaje prellenado.
