# Iberá · Guardaparques (IBERA-Rangers-Client)

App web instalable (**PWA**) para que los guardaparques del Gran Parque Iberá reporten incidentes ambientales (lixiviados, basura, fauna herida, infraestructura dañada) **sin señal**, con foto y GPS, y los envíen todos juntos cuando recuperan conexión.

Backend: [IBERA-Rangers-API](https://github.com/FabianGQuintana/IBERA-Rangers-API) (.NET 10 + PostgreSQL + Cloudflare R2).

---

## Índice

- [Para quién está diseñada](#para-quién-está-diseñada)
- [Pantallas](#pantallas)
- [Stack](#stack)
- [Estructura](#estructura)
- [Cómo funciona sin señal](#cómo-funciona-sin-señal)
- [Correrla en tu máquina](#correrla-en-tu-máquina)
- [Cómo probarlo paso a paso](#cómo-probarlo-paso-a-paso)
- [Deploy](#deploy)
- [Forma de trabajo](#forma-de-trabajo)

---

## Para quién está diseñada

| Perfil | Decisión de diseño |
| --- | --- |
| 45 a 65 años, brecha digital | Una sola acción por pantalla, textos en español simple, etiquetas siempre visibles, confirmaciones explícitas antes de salir o borrar |
| Celulares de gama media/baja | Sin librerías pesadas ni animaciones; fotos comprimidas en el teléfono (~1600 px JPEG) |
| Al aire libre, bajo el sol | Fondo claro, texto casi negro, contraste AAA en botones, texto base de 20 px |
| En movimiento, con una mano | Botones de ancho completo de 80 px o más, acción principal fija abajo al alcance del pulgar |
| Sin señal o señal intermitente | Todo se guarda en el teléfono y se envía después; la app abre aunque no haya conexión |

Reglas: **cero escritura obligatoria en el terreno** (solo el login, una vez, con señal), **rojo solo para borrar o alertar**, y **feedback gigante** (✓ verde + vibración) al guardar o enviar.

## Pantallas

| # | Pantalla | Qué hace |
| --- | --- | --- |
| 0 | **Login** | Email y contraseña, con botón para mostrar la contraseña. La sesión dura 12 h y queda en el teléfono. |
| 1 | **Inicio** | "Hola, [Nombre]" y dos botones gigantes: 📸 **Nuevo reporte** (verde) y 🔄 **Sincronizar (N pendientes)** (azul). |
| 2 | **Nuevo reporte** | 📷 **Tomar foto** (abre la cámara nativa) · "¿Qué encontraste?" con 4 botones (🗑️ Basura, 🛢️ Lixiviados, 🦌 Fauna herida, 🚧 Infraestructura) · Notas (opcional) · 💾 **Guardar reporte** fijo abajo. El GPS se toma solo al abrir la pantalla. |
| 3 | **Sincronizar** | Lista de lo guardado ("Reporte: Basura – 15:30 hs") y 🚀 **Enviar todo al servidor**, con progreso y un ✓ gigante al terminar. |

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS 4** (tokens de color en `app/globals.css`)
- **IndexedDB** (reportes y fotos offline) y **localStorage** (sesión), sin dependencias extra
- **Service worker** escrito a mano (`public/sw.js`), el mismo enfoque que IberAPP

## Estructura

```
app/                  layout, página única, manifest de la PWA, estilos y tokens
components/
  RangerApp.tsx       decide qué pantalla mostrar (login / inicio / reporte / sincronizar)
  views/              LoginView, DashboardView, NewReportView, SyncView
  ui/                 BigButton, Screen, TextField, Spinner, SuccessOverlay, ErrorBox, OfflineBanner
  pwa/                registro del service worker
hooks/                useSession, useView (#hash), usePendingReports, useSilentLocation, useOnline
lib/
  api/client.ts       fetch con token, errores de "sin señal" vs errores de la API
  session.ts          sesión en localStorage (sobrevive al vencimiento del token)
  storage/            IndexedDB de reportes pendientes
  image/compress.ts   achica la foto en el teléfono
  data/categories.ts  las 4 categorías con los ids que siembra el backend
services/             login y sincronización (bulk insert + fotos)
types/                contratos con el backend
public/sw.js          cache de la app para abrir sin señal
```

## Cómo funciona sin señal

1. **La app abre sin señal.** Es una sola página (`/`) que cambia de pantalla con el `#` de la URL (`#new-report`, `#sync`), así el botón "atrás" del celular funciona. `public/sw.js` guarda esa página y el JS la primera vez que se abre con señal.
2. **Los reportes se guardan en el teléfono.** Cada reporte va a IndexedDB con un `clientId` único, la categoría, la posición GPS, las notas y la foto comprimida.
3. **El GPS se toma solo.** Al abrir "Nuevo reporte" se enciende el GPS (funciona sin datos móviles) y se queda con la lectura más precisa. Si al guardar todavía no respondió, espera hasta 15 segundos.
4. **Sincronizar** manda todos los datos en un solo `POST /api/reports/sync`, que es idempotente por `clientId`: si la señal se corta a mitad de camino y se reintenta, no se duplica nada. Después sube cada foto con `POST /api/reports/{id}/photo`. Un reporte sale del teléfono recién cuando llegó su foto.
5. **Si el token venció** (12 h), el ranger sigue reportando offline; al sincronizar se le pide el login ahí mismo, con el email ya cargado, sin perder nada.
6. **Categorías offline:** usan los ids fijos que siembra el backend, así no hace falta descargarlas antes de salir.

El navegador siempre llama a `/api/...` en el mismo dominio de la app y Next lo reenvía al backend (`next.config.ts` → `rewrites`), así que no hay que configurar CORS.

## Correrla en tu máquina

Requisitos: Node.js 20 o superior y el [backend](https://github.com/FabianGQuintana/IBERA-Rangers-API#correrlo-en-tu-máquina) corriendo en `http://localhost:5196`.

```bash
npm install
cp .env.example .env.local     # API_URL=http://localhost:5196
npm run dev -- -p 3001         # 3001 para no chocar con IberAPP (3000)
```

Abrí **http://localhost:3001**.

> ⚠️ `API_URL` se lee **al compilar**: si cambia la URL del backend, reiniciá `npm run dev` o volvé a correr `npm run build`.

| Script | Para qué |
| --- | --- |
| `npm run dev` | Desarrollo (el service worker **no** se registra) |
| `npm run build && npm start` | Producción local (con service worker: para probar el modo sin señal) |
| `npm run lint` | ESLint |

## Cómo probarlo paso a paso

### Antes de empezar

1. Backend corriendo y con un usuario **Ranger** creado (ver el [paso 1 de la guía del backend](https://github.com/FabianGQuintana/IBERA-Rangers-API#1-login-y-alta-de-un-guardaparque-swagger)). Con un Admin se puede entrar, pero el backend solo acepta reportes de Rangers y Helpers.
2. Esta app corriendo en `http://localhost:3001`.
3. En Chrome abrí **DevTools (F12) → botón de dispositivo (Ctrl+Shift+M)** y elegí un celular (por ejemplo Pixel 7) para verla como en el teléfono.

### 1. Login

1. Entrá con un email o contraseña incorrectos → recuadro rojo "Email o contraseña incorrectos".
2. Entrá con el ranger → aparece "Hola, Juan".
3. Recargá la página → seguís adentro (la sesión quedó en el teléfono).

### 2. Nuevo reporte con señal

1. Tocá **📸 Nuevo reporte**. El navegador pide permiso de ubicación: aceptalo. Abajo aparece "📍 Ubicación tomada (±N m)".
2. **📷 Tomar foto** → en la PC abre el selector de archivos, elegí cualquier JPG. Aparece la vista previa y "✓ Foto lista".
3. Tocá **💾 Guardar reporte** sin elegir categoría → aparece el aviso para elegir una.
4. Elegí **🛢️ Lixiviados**, escribí una nota y guardá → ✓ verde gigante "¡Reporte guardado!".
5. Volvé al inicio → el botón dice **Sincronizar (1 pendiente)**.

### 3. Trabajar sin señal

1. DevTools → pestaña **Network** → cambiá *No throttling* por **Offline**. Aparece la franja naranja "Sin señal".
2. Creá dos o tres reportes más (con y sin foto). Se guardan igual.
3. Entrá a **Sincronizar** y tocá **🚀 Enviar todo** → "No hay señal…" y los reportes siguen en la lista.
4. Para ver dónde quedaron: DevTools → **Application → IndexedDB → ranger → reports**.

### 4. Sincronizar

1. Volvé a poner **No throttling**.
2. **Sincronizar → 🚀 Enviar todo al servidor** → "Enviando reportes…", después "Enviando fotos…" y al final "¡N reportes enviados!".
3. El inicio vuelve a "Sincronizar (nada pendiente)".
4. En el Swagger del backend, con el token de Admin: `GET /api/reports` → están todos, con coordenadas, notas y `photoUrl`. Abrí una `photoUrl` para ver la foto.

### 5. Casos borde

| Caso | Cómo provocarlo | Resultado esperado |
| --- | --- | --- |
| Sin GPS | Bloqueá la ubicación (ícono del candado → Ubicación → Bloquear) y creá un reporte | Se guarda, pero en Sincronizar aparece "⚠️ Sin ubicación GPS" con opción de borrarlo; el resto se envía igual |
| Sesión vencida | Application → Local Storage → `ranger:session` → en el valor cambiá `"token":"…"` por `"token":null` y sincronizá | Pide el login ahí mismo con el email ya cargado; al entrar, enviás sin perder nada |
| Backend apagado | Detené la API y sincronizá | Mensaje de "sin señal o el servidor no responde"; nada se borra |
| Botón atrás | En "Nuevo reporte", usá el atrás del navegador | Vuelve al inicio sin recargar |
| Salir con pendientes | "Salir de mi usuario" con reportes sin enviar | Avisa cuántos quedan guardados en el teléfono |

### 6. Modo sin señal real (PWA)

1. `npm run build && npm start -- -p 3001` y abrí `http://localhost:3001` (el service worker se registra solo en producción).
2. DevTools → **Application → Service Workers**: tiene que aparecer `sw.js` *activated*.
3. Poné **Offline** y recargá la página → la app abre igual.

### 7. En un celular de verdad

El GPS y la cámara del navegador necesitan **HTTPS**:

```bash
npx next dev --experimental-https -p 3001 -H 0.0.0.0
```

En el celular (misma red Wi-Fi) abrí `https://<IP-de-tu-PC>:3001` y aceptá el aviso del certificado. La API puede seguir en `localhost:5196` porque el reenvío de `/api` lo hace la PC. Desde el menú del navegador, **"Agregar a la pantalla de inicio"** la instala como app.

## Deploy

En **Vercel**, con la variable `API_URL` apuntando al backend en Railway. Pasos completos y lo que falta antes de publicar: [`docs/DEPLOY.md` del backend](https://github.com/FabianGQuintana/IBERA-Rangers-API/blob/development/docs/DEPLOY.md).

## Forma de trabajo

- `main` (releases) ← `development` ← una rama por tarea (`feature/...`, `fix/...`), cada una con su PR.
- Commits en inglés con [Conventional Commits](https://www.conventionalcommits.org/).
