# Iberá · Guardaparques (IBERA-Rangers-Client)

App web instalable (PWA) para que los guardaparques del Gran Parque Iberá reporten incidentes ambientales **sin señal** y los envíen cuando recuperan conexión.

Stack: Next.js 16 · React 19 · Tailwind CSS 4 · TypeScript (el mismo que IberAPP, la web de turistas).
Backend: [IBERA-Rangers-API](https://github.com/FabianGQuintana/IBERA-Rangers-API) (.NET 10).

## Pantallas

| Pantalla | Qué hace |
| --- | --- |
| Login | Única pantalla con teclado. Se entra una vez con señal; la sesión queda en el teléfono (12 h). |
| Inicio | "Hola, [Nombre]" y dos botones gigantes: **Nuevo reporte** y **Sincronizar (N pendientes)**. |
| Nuevo reporte | Botón **Tomar foto** (cámara nativa), 4 categorías con íconos, notas opcionales y **Guardar reporte**. El GPS se toma solo al abrir la pantalla. |
| Sincronizar | Lista de reportes guardados y **Enviar todo al servidor** (bulk insert + fotos). |

## Cómo funciona sin señal

- **La app**: `public/sw.js` guarda la página y el JS la primera vez que se abre con señal (solo en `npm run build && npm start`, no en `dev`).
- **Los reportes**: se guardan en IndexedDB (`lib/storage/reports-db.ts`), con la foto comprimida en el teléfono (~1600 px JPEG).
- **El envío**: `services/reports.ts` manda los datos en un solo `POST /api/reports/sync` (idempotente por `clientId`, si se corta la señal no se duplica nada) y después cada foto a `POST /api/reports/{id}/photo`. Un reporte se borra del teléfono recién cuando llegó su foto.
- **Categorías**: usan los ids fijos que siembra el backend, así no hace falta descargarlas antes de salir.

## Correr en desarrollo

```bash
npm install
cp .env.example .env.local   # ajustá API_URL si el backend no está en http://localhost:5196
npm run dev
```

El navegador siempre llama a `/api/...` en este mismo dominio y Next lo reenvía al backend (`next.config.ts` → `rewrites`), así que no hay que configurar CORS.

> ⚠️ `API_URL` se lee **al compilar** (`npm run build`): si cambia la URL del backend, hay que volver a compilar.

### Probar en un celular

La cámara funciona por HTTP, pero **el GPS y algunas APIs solo funcionan en HTTPS** (o `localhost`). Para probar desde el celular en la misma red usá `npx next dev --experimental-https` o publicá la app en un hosting con HTTPS.

## Reglas de diseño (perfil: 45–65 años, al sol, una mano, sin señal)

- Texto base de 20 px, alto contraste (verde oscuro para acciones, azul para sincronizar, rojo solo para alertas o borrar).
- Botones de ancho completo y mínimo 80 px de alto; nada de menús ni gestos ocultos.
- Cero escritura obligatoria en el terreno (las notas son opcionales).
- Confirmación gigante (✓ verde + vibración) después de guardar o enviar.
