# Citas con Google Sheets: paso a paso

Con esto, cada reserva de la página queda guardada en una hoja de cálculo tuya, las
horas ya tomadas salen tachadas para los demás clientes y puedes bloquear horas o
días en los que un barbero no atiende. Es gratis y no instalas nada.

- **Dónde:** en un computador, en el navegador (Chrome). La app de Sheets del celular
  no tiene la opción que necesitamos.
- **Cuánto tarda:** unos 20 minutos la primera vez.
- **Cuentas:** todo se hace con tu cuenta de Google. Nadie más necesita tu contraseña.

> **Antes de empezar:** el código se copia desde GitHub (paso 3), así que el pull
> request con esta función tiene que estar publicado (hecho el "merge").
> Si ya habías pegado el código de una versión anterior (`Código.gs`), usa una hoja
> **nueva**: las columnas cambiaron.

---

## Cómo queda tu hoja

Tendrá 4 pestañas. Las crea el código solo, tú no las armas a mano.

| Pestaña | Para qué sirve | Columnas |
|---|---|---|
| **Barberos** | Quién aparece en la página y a quién se avisa | Nombre · Activo (SÍ o NO) · Correo |
| **Citas** | Las reservas. Las llena la página | Fecha · Hora · Barbero · Cliente · Creada en |
| **Descansos** | Horas o días en que un barbero no atiende **una sola vez** | Barbero · Fecha · Hora |
| **Horario fijo** | Lo que **se repite cada semana**: días libres y almuerzos | Barbero · Día · Hora |

---

## Paso 1. Abre tu hoja de cálculo

1. Entra a https://sheets.new con tu cuenta de Google. Se abre una hoja en blanco.
2. Arriba a la izquierda, donde dice "Hoja de cálculo sin título", escribe:
   **Imperial Barber - Citas**.

*(Si ya tienes la hoja abierta, sigue en el paso 2.)*

## Paso 2. Abre Apps Script

1. Arriba de la hoja ves una fila con palabras: Archivo, Editar, Ver, Insertar,
   Formato, Datos, Herramientas, **Extensiones**, Ayuda.
2. Haz clic en **Extensiones** y luego en **Apps Script**.
3. Se abre **una pestaña nueva** del navegador. A la izquierda dice `Código.gs` y en
   el centro hay un cuadro con `function myFunction() { }`.
4. Arriba a la izquierda dice "Proyecto sin título". Haz clic ahí y escribe
   **Imperial Barber citas**. Pulsa Enter.

## Paso 3. Copia y pega el código

1. Abre este link en otra pestaña (es el código en texto plano):
   https://raw.githubusercontent.com/nappyplush-lang/mi--primer-mundo/main/imperial-barber/apps-script/Code.gs
2. Haz clic en cualquier parte del texto y pulsa **Ctrl + A** (seleccionar todo) y
   luego **Ctrl + C** (copiar). En Mac: **Cmd + A** y **Cmd + C**.
3. Vuelve a la pestaña de Apps Script. Haz clic dentro del cuadro de código,
   pulsa **Ctrl + A** y luego **Ctrl + V** (pegar). Así reemplazas todo el
   `function myFunction() { }`.
4. Guarda con **Ctrl + S**. Si no sale ningún error, está bien.

> El archivo que ves se llama `Código.gs` y el del repositorio `Code.gs`. Es lo mismo:
> el nombre da igual, lo que importa es el contenido.

## Paso 4. Crea las pestañas y da los permisos

1. Arriba, junto al botón **▶ Ejecutar**, hay una lista con el nombre de una
   función. Ábrela y escoge **configurar**.
2. Pulsa **▶ Ejecutar**.
3. Sale una ventana "Se requiere autorización". Pulsa **Revisar permisos** y elige tu
   cuenta de Google.
4. Sale "Google no ha verificado esta aplicación". Es normal: el código es tuyo y
   Google no lo revisó. Pulsa **Configuración avanzada** y luego
   **Ir a Imperial Barber citas (no seguro)**.
5. Te muestra lo que el código podrá hacer: **ver y editar tus hojas de cálculo** y
   **ver y editar tus calendarios** (esto último es por la opción de Calendar; aunque la
   dejes apagada, Google lo pide). Pulsa **Permitir**.
6. Abajo, en "Registro de ejecución", debe salir:
   `Listo: las pestañas Barberos, Citas y Descansos están creadas.`

## Paso 5. Mira tu hoja

Vuelve a la pestaña de la hoja de cálculo. Abajo ves 3 pestañas: **Barberos**,
**Citas** y **Descansos**, con los títulos en dorado. En **Barberos** ya están
"Barbero 1" y "Barbero 2" con **SÍ**.

> **Importante:** los nombres de **Barberos** deben ser **iguales** a los de la página
> (`nombre` en la lista `barberos` de `script.js`). Si cambias "Barbero 1" por el
> nombre real, cámbialo en los dos lados. Si no coinciden, ese barbero no aparece en
> la página.

## Paso 6. Publícalo como aplicación web

1. Vuelve a la pestaña de Apps Script. Arriba a la derecha, pulsa el botón azul
   **Implementar** y luego **Nueva implementación**.
2. Junto a "Seleccionar tipo" hay un engranaje ⚙. Púlsalo y escoge **Aplicación web**.
3. Llena así:
   - **Descripción:** `Citas v1`
   - **Ejecutar como:** **Yo** (tu correo)
   - **Quién tiene acceso:** **Cualquier persona**
     (no "Cualquier persona con cuenta de Google": tus clientes no tienen por qué iniciar sesión).
4. Pulsa **Implementar**. Si pide permisos otra vez, repite los pasos 4.3 a 4.5.
5. Copia la **URL de la aplicación web**. Empieza por
   `https://script.google.com/macros/s/` y termina en **`/exec`**. Guárdala,
   la necesitas en el paso 8.
6. Pulsa **Listo**.

## Paso 7. Prueba el link

Pega la URL en una pestaña nueva del navegador. Debe salir esto:

```
{"ok":true,"mensaje":"Imperial Barber: el sistema de citas está funcionando."}
```

Ahora agrégale al final `?accion=barberos`. Por ejemplo:
`https://script.google.com/macros/s/AKfy.../exec?accion=barberos`
Debe salir: `{"ok":true,"barberos":["Barbero 1","Barbero 2"]}`.

Si sale una página de inicio de sesión o un error, revisa que en el paso 6.3
quedó **Cualquier persona**.

## Paso 8. Pega el link en la página

La URL va en **una sola línea**, al inicio de `script.js`.

**Opción fácil:** pégame el link en el chat y yo lo pongo. No es secreto: queda
escrito en la página.

**Opción tú mismo:**

1. Abre https://github.com/nappyplush-lang/mi--primer-mundo/edit/main/imperial-barber/script.js
   (te lleva directo al editor).
2. Busca esta línea, cerca del inicio (usa **Ctrl + F** y escribe `URL_APPS_SCRIPT`):
   ```js
   const URL_APPS_SCRIPT = "";
   ```
3. Pega tu link entre las comillas:
   ```js
   const URL_APPS_SCRIPT = "https://script.google.com/macros/s/AKfy.../exec";
   ```
   Sin espacios, y sin borrar el `;` del final.
4. Arriba a la derecha pulsa **Commit changes…** y luego **Commit changes** (dejando
   marcado "Commit directly to the main branch").
5. Espera 1 o 2 minutos a que GitHub publique.

## Paso 9. Haz una prueba real

1. Abre la página y haz una reserva con el nombre **Prueba**, hasta "Confirmar cita".
2. En la hoja, pestaña **Citas**, debe aparecer una fila nueva.
3. Recarga la página, entra al mismo barbero y día: esa hora sale tachada.
4. Bórrala: clic derecho sobre el número de esa fila y **Eliminar fila**.

---

## Uso diario

### Ver las citas
Pestaña **Citas**. Para ordenarlas: **Datos → Crear un filtro** y usa las flechitas
de Fecha y Hora.

### Cancelar una cita
Borra su fila (clic derecho sobre el número de la fila → **Eliminar fila**).
Esa hora vuelve a quedar libre en la página.

### Quitar un barbero de la página (vacaciones, salió del equipo)
Pestaña **Barberos**: cambia su **Activo** de **SÍ** a **NO**. Desaparece de la página.
Vuelve a ponerlo en **SÍ** para que regrese. Sus citas guardadas no se pierden.

### Bloquear horas o días: pestaña Descansos
Escribe una fila por cada bloqueo:

| Barbero | Fecha | Hora | Qué pasa |
|---|---|---|---|
| Barbero 1 | 2026-12-08 | 1:00 p. m. | Barbero 1 no atiende a esa hora ese día |
| Barbero 2 | 2026-12-24 | *(vacía)* | Barbero 2 no atiende **todo ese día** |

- **Barbero:** escoge de la lista desplegable.
- **Fecha:** escríbela como **año-mes-día** (`2026-12-08`). Así no se confunde el día
  con el mes.
- **Hora:** escoge de la lista. **Déjala vacía para bloquear todo el día.**
- Para bloquear 3 horas, haces 3 filas.
- Aparece bloqueada en la página de inmediato (al recargar o al elegir ese barbero).
- Para desbloquear, borra la fila.

---

### Lo que se repite cada semana: pestaña Horario fijo

Para días libres y almuerzos que no cambian, no escribas fechas una por una: usa
**Horario fijo**. Escribe una fila por cada regla:

| Barbero | Día | Hora | Qué pasa |
|---|---|---|---|
| Alex | miércoles | *(vacía)* | Alex no atiende **ningún miércoles** |
| Dayana | martes | *(vacía)* | Dayana no atiende **ningún martes** |
| Alex | Todos los días | 2:00 p. m. | Su **almuerzo**: esa hora siempre sale tachada |
| Dayana | Todos los días | 1:00 p. m. | Su **almuerzo** |

- **Barbero, Día y Hora:** escoge de la lista desplegable.
- **Hora vacía = todo el día** de ese barbero.
- Para desactivar una regla, **borra su fila**.
- Un día libre **solo por una vez** (un trámite, una fecha especial) va en **Descansos**.
- Los cambios se ven al **recargar la página**.

---

## Que al barbero le suene el celular cuando le agendan

Cada cita nueva puede avisar **al barbero de esa cita**, de dos formas que funcionan juntas:

1. **Le llega un correo** con el cliente, el servicio, el día y la hora. Gmail avisa al
   celular apenas llega, así que **suena**.
2. **Aparece en Google Calendar.** El evento se crea en el calendario del dueño y, si el
   correo del barbero es otro, **se le invita** para que le salga en su Calendar con su
   alarma de **30 minutos antes**.

### Cómo se activa

1. En la hoja, pestaña **Barberos**, escribe el **Gmail del barbero** en la columna
   **Correo**, en la fila de ese barbero. Si no quieres avisarle a alguien, deja su
   celda vacía.
2. **Si ya tenías el código puesto antes**, pega la versión nueva de `Code.gs`
   (clic en el código, **Ctrl + A**, **Supr**, pegar, **Ctrl + S**). La columna
   **Correo** se agrega sola a tu hoja.
3. **Autoriza el permiso nuevo de correo.** En Apps Script elige `configurar` en la lista
   y pulsa **Ejecutar**. Sale la ventana de permisos: **Revisar permisos** → tu cuenta →
   **Configuración avanzada** → **Ir a Proyecto sin título (no seguro)** → **Permitir**.
4. **Publica una versión nueva** (ver la siguiente sección).
5. Haz una reserva de prueba: al Gmail del barbero debe llegar un correo
   "Nueva cita: …".

### Lo que debe tener el barbero en su celular

- La app **Gmail**, con las **notificaciones activadas**. Así le suena al llegar el aviso.
- La app **Google Calendar**, con una alarma de **30 minutos antes**: **Configuración →
  su calendario → Notificaciones de eventos → Agregar notificación**.
- Para que el evento le aparezca **solo** en su Calendar, en la **Configuración general**
  de Calendar: **Agregar invitaciones a mi calendario → Todas las invitaciones**.
  Con "Solo si el remitente es conocido" la invitación llega por correo, pero él tiene
  que abrirla.

### Si el barbero es el mismo dueño de la hoja

Google no se invita a sí mismo, así que no recibe una invitación. Igual le llega el
**correo de aviso** y el evento aparece directamente en su calendario.

### Calendario aparte, opcional

Por defecto el evento va a tu calendario principal. Si prefieres uno aparte para las citas:
1. En Google Calendar, junto a **Otros calendarios** pulsa **+** → **Crear calendario
   nuevo**. Ponle `Citas Imperial Barber`.
2. En su configuración, **Integrar el calendario**, copia el **ID de calendario**.
3. En `Code.gs`, pégalo entre las comillas de `const ID_CALENDARIO = "";` y publica una
   versión nueva.

### Para apagar los avisos

- **Correo:** en `Code.gs`, cambia `AVISAR_POR_CORREO = true` por `false`.
- **Todo:** deja vacía la columna **Correo** y también `ID_CALENDARIO`.

Si algo falla (un correo mal escrito, un permiso sin dar), la **cita igual queda
guardada** en la hoja. Solo no se envía el aviso.

---

## Si ya tenías la hoja armada y llega una versión nueva del código

1. Pega el código nuevo (clic en el código, **Ctrl + A**, **Supr**, pegar, **Ctrl + S**).
2. **Vuelve a escribir tu correo** entre las comillas de `ID_CALENDARIO`, porque al pegar se borra.
3. Elige `configurar` y pulsa **Ejecutar**. Aparecen solas las pestañas o columnas nuevas (por ejemplo **Horario fijo**), sin tocar tus datos.
4. **Publica una versión nueva** (ver abajo).
5. Cambia en la hoja los nombres de los barberos, si cambiaron. Deben ser **iguales** a los de la página.

---

## Si cambias algo del código (Code.gs)

Guardar no basta: hay que publicar una versión nueva para que la página la use.

**Implementar → Gestionar implementaciones →** lápiz ✏️ **→ Versión: Nueva versión → Implementar.**

Así el link sigue siendo el mismo. **No uses "Nueva implementación"**, porque crea un
link distinto y tendrías que cambiarlo en `script.js`.

## Si agregas un barbero o cambias el horario

| Qué | En la hoja | En `script.js` | En `Code.gs` |
|---|---|---|---|
| Barbero nuevo | Fila nueva en **Barberos** con **SÍ** | Uno nuevo en `barberos` (nombre igual, foto y `id`) | Nada |
| Primera y última hora | Nada | `horaInicio` y `horaFin` | `HORA_INICIO` y `HORA_FIN` |

## Problemas comunes

| Qué pasa | Qué revisar |
|---|---|
| No aparece ningún barbero | El nombre de la pestaña **Barberos** no es igual al de `script.js`, o **Activo** está en NO o vacío. |
| Un barbero no aparece | Igual: nombre distinto o **Activo** distinto de SÍ. |
| Las horas no salen tachadas | La URL en `script.js` termina en `/exec` y está entre comillas. Abre la URL (paso 7). |
| El link pide iniciar sesión | Paso 6.3: **Quién tiene acceso** debe ser **Cualquier persona**. |
| Cambié el código y no pasa nada | Publica una versión nueva (ver arriba). |
| Un Descanso no bloquea nada | El barbero y la fecha deben estar bien escritos. Usa la lista desplegable del barbero. |
| No le llega el correo al barbero | Revisa que su correo esté bien escrito en **Barberos**, que hayas dado el permiso de correo (paso 3 de arriba) y que hayas publicado una versión nueva. Mira también su carpeta de spam. |
| La página dice "No pudimos guardar la cita" | La hoja no respondió. La cita llega por WhatsApp igual; anótala a mano. |
| Error al ejecutar `configurar`: "pestaña Citas es de una versión anterior" | Cámbiale el nombre a esa pestaña (por ejemplo "Citas vieja") y ejecuta `configurar` otra vez. |

## Bueno saber

- **Gratis:** Google permite miles de reservas al día sin pagar.
- **Privacidad:** la página solo puede preguntar qué horas están ocupadas. Nunca
  recibe nombres de clientes.
- **Solo se guarda el nombre**, no el teléfono. El teléfono lo ves cuando el cliente
  te escribe por WhatsApp.
- **El servicio y el precio no se guardan en la hoja**: llegan en el mensaje de
  WhatsApp y, si activas los avisos, en el correo y en el evento de Calendar.
- **Límite de correos:** una cuenta gratuita de Google puede mandar unos 100 correos al
  día desde un script. Para una barbería sobra.
- **Una cita sin WhatsApp también bloquea la hora:** si alguien confirma pero no manda
  el mensaje, la hora queda tomada. Libérala borrando la fila.
- **Citas falsas:** quien tenga conocimientos técnicos podría usar el link para meter
  citas falsas. Para una barbería el riesgo es bajo; se corrigen borrando la fila.
- **Dos personas a la vez:** el sistema las atiende una por una. Si dos confirman la
  misma hora, a la segunda le sale "Esa hora ya no está disponible".
