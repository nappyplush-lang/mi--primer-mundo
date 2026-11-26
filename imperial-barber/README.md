# Imperial Barber · Link de reservas

Página web de una sola página (HTML, CSS y JS puros). El cliente abre el link,
elige barbero, servicio, día, hora y escribe su nombre; la cita se guarda en tu
Google Sheet y luego se confirma por WhatsApp. No se instala.

Para conectar la hoja de citas sigue `apps-script/LEEME.md`. Mientras
`URL_APPS_SCRIPT` esté vacío en `script.js`, la página solo abre WhatsApp.

La hoja tiene 3 pestañas: **Barberos** (quién aparece), **Citas** (las reservas) y
**Descansos** (horas o días bloqueados por barbero).

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | La página: inicio, barberos, agenda y pie de página |
| `styles.css` | Diseño. Los colores están al inicio, en `:root` |
| `script.js` | Lógica. **El link de la hoja (`URL_APPS_SCRIPT`) es la primera línea; barberos, servicios, precios, horario y WhatsApp están en `CONFIG`** |
| `apps-script/Code.gs` | Código que se pega en Apps Script (dentro de tu Google Sheet): guarda las citas y dice qué horas están ocupadas. Paso a paso en `apps-script/LEEME.md` |
| `img/` | Fotos: `hero.jpg` (celular), `hero-pc.jpg` (computador), `barbero1.jpg`, `barbero2.jpg`. Ver `img/LEEME.txt` |

## Links

- Link general: https://nappyplush-lang.github.io/mi--primer-mundo/imperial-barber/
- Link directo a la agenda de un barbero: agrega `#barbero1` o `#barbero2` al final

## Abrirla en el computador

Doble clic en `index.html`, o desde esta carpeta:

```bash
python3 -m http.server 8000
```

y abre http://localhost:8000
