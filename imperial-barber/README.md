# Imperial Barber · Link de reservas

Página web de una sola página (HTML, CSS y JS puros). El cliente abre el link,
elige barbero, servicio, día, hora y escribe su nombre; la cita se guarda en tu
Google Sheet y luego se confirma por WhatsApp. No se instala.

Para conectar la hoja de citas sigue `apps-script/LEEME.md`. Mientras
`urlHojaCitas` esté vacío en `script.js`, la página solo abre WhatsApp.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | La página: inicio, barberos, agenda y pie de página |
| `styles.css` | Diseño. Los colores están al inicio, en `:root` |
| `script.js` | Lógica. **Barberos, servicios, precios, horario y WhatsApp están al inicio, en `CONFIG`** |
| `apps-script/Código.gs` | Código para tu Google Sheet: guarda las citas y dice qué horas están ocupadas. Paso a paso en `apps-script/LEEME.md` |
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
