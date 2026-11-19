# Imperial Barber · Link de reservas

Página web de una sola página (HTML, CSS y JS puros). El cliente abre el link,
elige barbero, servicio, día y hora, y confirma por WhatsApp. No se instala.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | La página: inicio, barberos, agenda y pie de página |
| `styles.css` | Diseño. Los colores están al inicio, en `:root` |
| `script.js` | Lógica. **Barberos, servicios, precios, horario y WhatsApp están al inicio, en `CONFIG`** |
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
