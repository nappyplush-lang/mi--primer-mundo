# Casa Aburrá · Bienes raíces en Medellín

Sitio web inmobiliario hecho con HTML, CSS y JavaScript puro (sin frameworks ni build).

```
casa-aburra/
├── index.html        # Estructura y contenido (secciones, SEO, Open Graph)
├── css/styles.css    # Estilos mobile-first (paleta en :root)
├── js/main.js        # Datos de propiedades, filtros, menú, animaciones y formulario
└── img/              # Favicon y placeholder (pon aquí tus fotos propias)
```

## Qué editar

| Quiero cambiar…            | Dónde                                                        |
|----------------------------|--------------------------------------------------------------|
| Número de WhatsApp         | `CONFIG.whatsapp` en `js/main.js` (+ teléfonos en `index.html`) |
| Propiedades                | Array `PROPIEDADES` en `js/main.js`                          |
| Rangos de precio / barrios | `RANGOS_PRECIO` y `BARRIOS` en `js/main.js`                  |
| Colores y tipografías      | Variables en `:root` al inicio de `css/styles.css`           |
| Dominio para SEO           | `canonical` y `og:url` en `index.html`                       |

Las imágenes vienen de Unsplash; si alguna no carga se muestra `img/placeholder.svg`.
Para usar fotos propias, cópialas a `img/` y usa rutas como `img/apto-poblado.jpg`.

## Ver en local

Abre `index.html` con doble clic, o mejor, sirve la carpeta:

```bash
cd casa-aburra
python3 -m http.server 8000   # luego abre http://localhost:8000
# o: npx serve .
```

## Desplegar gratis

- **Netlify**: arrastra la carpeta `casa-aburra` a https://app.netlify.com/drop,
  o conecta el repo con *Base directory* = `casa-aburra` y sin comando de build.
  El formulario de contacto queda guardado en *Forms* automáticamente.
- **Vercel**: importa el repo, *Framework Preset* = Other, *Root Directory* = `casa-aburra`.
  (En Vercel el formulario no guarda mensajes; ofrece enviarlos por WhatsApp.)
