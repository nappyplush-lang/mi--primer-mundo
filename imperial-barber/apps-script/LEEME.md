# Citas en Google Sheets: paso a paso

Con esto, cada reserva de la página queda guardada en una Google Sheet tuya y las
horas ya tomadas salen tachadas para los demás clientes. Es gratis y no necesitas
instalar nada. Todo se hace desde el navegador del computador (en el celular
Apps Script es incómodo).

Tiempo: unos 15 minutos.

---

## Paso 1. Crear la hoja

1. Entra a https://sheets.new con tu cuenta de Google. Se abre una hoja en blanco.
2. Arriba a la izquierda, donde dice "Hoja de cálculo sin título", escribe:
   **Imperial Barber - Citas**.

## Paso 2. Abrir Apps Script

1. En el menú de la hoja: **Extensiones → Apps Script**.
2. Se abre una pestaña nueva con un archivo llamado `Código.gs` que tiene
   `function myFunction() { }`.
3. Arriba a la izquierda, donde dice "Proyecto sin título", escribe:
   **Imperial Barber citas**.

## Paso 3. Pegar el código

1. Abre el código en GitHub:
   https://github.com/nappyplush-lang/mi--primer-mundo/blob/main/imperial-barber/apps-script/C%C3%B3digo.gs
2. Toca el botón **Copiar** (dos cuadritos, arriba a la derecha del código:
   "Copy raw file").
3. Vuelve a Apps Script, borra todo lo que hay en `Código.gs` y pega.
4. Guarda: ícono del disquete o **Ctrl + S** (en Mac, **Cmd + S**).

## Paso 4. Crear la pestaña "Citas" y dar permisos

1. Arriba, al lado de "▶ Ejecutar", hay una lista con nombres de funciones.
   Escoge **configurar**.
2. Toca **▶ Ejecutar**.
3. Sale "Se requiere autorización". Toca **Revisar permisos** y elige tu cuenta.
4. Sale "Google no ha verificado esta aplicación". Es normal: el código es tuyo y
   Google no lo revisó. Toca **Configuración avanzada** y luego
   **Ir a Imperial Barber citas (no seguro)**.
5. Toca **Permitir**. El permiso es para que el código lea y escriba en tu hoja.
6. Abajo, en el "Registro de ejecución", debe salir:
   `Listo: la pestaña "Citas" está creada.`
7. Vuelve a la pestaña de la hoja: abajo aparece una pestaña nueva llamada
   **Citas**, con los títulos en dorado.

## Paso 5. Publicarlo como aplicación web

1. En Apps Script, arriba a la derecha: botón azul **Implementar → Nueva implementación**.
2. Al lado de "Seleccionar tipo" toca el engranaje ⚙ y escoge **Aplicación web**.
3. Llena así:
   - **Descripción:** `Citas v1`
   - **Ejecutar como:** **Yo** (tu correo)
   - **Quién tiene acceso:** **Cualquier persona**
     (no "Cualquier persona con cuenta de Google": tus clientes no tienen por qué
     iniciar sesión).
4. Toca **Implementar**. Si vuelve a pedir permisos, repite el paso 4.3 a 4.5.
5. Copia la **URL de la aplicación web**. Empieza por
   `https://script.google.com/macros/s/` y termina en **`/exec`**.
6. Toca **Listo**.

## Paso 6. Probar el link

Pega ese link en una pestaña nueva del navegador. Debe salir:

```
{"ok":true,"mensaje":"Imperial Barber: el sistema de citas está funcionando."}
```

Si sale una página de inicio de sesión o de error, revisa que en el paso 5.3
quedó **Cualquier persona**.

## Paso 7. Pegar el link en la página

Opción fácil: pégalo en el chat con Claude y él lo pone. El link no es secreto:
quedará escrito en la página.

Opción tú mismo, en GitHub:

1. Abre https://github.com/nappyplush-lang/mi--primer-mundo/blob/main/imperial-barber/script.js
2. Toca el lápiz ✏️ (**Edit this file**).
3. Busca esta línea (está al principio):
   ```js
   urlHojaCitas: "",
   ```
4. Pon tu link entre las comillas:
   ```js
   urlHojaCitas: "https://script.google.com/macros/s/AKfy.../exec",
   ```
   Sin espacios y sin borrar la coma del final.
5. Toca **Commit changes…** → deja marcado **Commit directly to the main branch**
   → **Commit changes**.
6. Espera 1 o 2 minutos a que GitHub publique.

## Paso 8. Prueba real

1. Abre la página de reservas y haz una cita con el nombre **Prueba**.
2. En la hoja, pestaña **Citas**, debe aparecer una fila nueva.
3. Recarga la página, entra al mismo barbero y día: esa hora sale tachada.
4. Borra la prueba: en la columna **Estado** de esa fila escoge **Cancelada**
   (o borra la fila completa).

---

## Uso diario

- **Ver las citas:** pestaña **Citas**. Para ordenarlas: **Datos → Crear un filtro**
  y usa las flechitas de "Día" y "Hora".
- **Cancelar una cita:** en **Estado** escoge **Cancelada**. Esa hora vuelve a
  quedar libre en la página.
- **No cambies** el nombre de la pestaña "Citas" ni el orden de las columnas.
  Puedes agregar columnas nuevas a la derecha de "ID barbero".

## Si cambias algo del código (Código.gs)

Guardar no basta: hay que publicar una versión nueva para que la página la use.

**Implementar → Gestionar implementaciones →** lápiz ✏️ **→ Versión: Nueva versión → Implementar.**

Así el link sigue siendo el mismo. No uses "Nueva implementación", porque crea un
link distinto y tendrías que cambiarlo en `script.js`.

## Si agregas un barbero o cambias el horario

Hay que cambiarlo en los dos lugares:

| Qué | En `script.js` (página) | En `Código.gs` (hoja) |
|---|---|---|
| Barberos | `CONFIG.barberos` (el `id`) | `BARBEROS` |
| Primera hora | `horaInicio` | `HORA_INICIO` |
| Última hora | `horaFin` | `HORA_FIN` |

Cambiar solo el **nombre** de un barbero se hace en `script.js`; el `id` se queda igual.

## Problemas comunes

| Qué pasa | Qué revisar |
|---|---|
| Las horas no salen tachadas | El link termina en `/exec` y está entre comillas en `script.js`. Abre el link (paso 6). |
| El link pide iniciar sesión | Paso 5.3: **Quién tiene acceso** debe ser **Cualquier persona**. |
| Cambié el código y no pasa nada | Publica una versión nueva (ver arriba). |
| La página dice "No pudimos guardar la cita automáticamente" | La hoja no respondió. La cita llega igual por WhatsApp; anótala a mano. |

## Bueno saber

- **Gratis:** Google permite miles de reservas al día sin pagar.
- **Privacidad:** la página solo puede preguntar qué horas están ocupadas. Nunca
  recibe nombres de clientes.
- **Una cita sin WhatsApp también bloquea la hora:** si alguien confirma pero no
  manda el mensaje, la hora queda tomada. Libérala con **Cancelada**.
- **Citas falsas:** quien tenga conocimientos técnicos podría usar el link para
  meter citas falsas. Para una barbería el riesgo es bajo; se corrigen con
  **Cancelada**.
