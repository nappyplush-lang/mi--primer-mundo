# Imperial Barber · Link de reservas

Web app de una sola página (HTML, CSS y JS puros) que se siente como app en el celular.
Se puede instalar en la pantalla de inicio (PWA).

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | Las dos pantallas: Inicio y Agenda |
| `styles.css` | Diseño. Los colores están al inicio, en `:root` |
| `script.js` | Lógica. **Barberos, servicios, precios, horario y WhatsApp están al inicio, en `CONFIG`** |
| `manifest.json` | Datos para instalarla como app |
| `service-worker.js` | Hace que abra rápido y funcione sin señal |
| `img/` | Tus fotos: `hero.jpg`, `barbero1.jpg`, `barbero2.jpg`. Ver `img/LEEME.txt` |

## Links útiles

- Link general: `.../imperial-barber/`
- Link directo a la agenda de un barbero: `.../imperial-barber/#/agenda/barbero1` (o `barbero2`)

## Abrirla en el computador

Doble clic en `index.html` funciona para verla, pero la parte de "instalar como app"
solo funciona con un servidor. Desde esta carpeta:

```bash
python3 -m http.server 8000
```

y abre http://localhost:8000

## Si cambias archivos ya publicados

Sube el número de `VERSION` en `service-worker.js` (ej. `imperial-v2`) para que
los celulares que ya la instalaron tomen la versión nueva.
