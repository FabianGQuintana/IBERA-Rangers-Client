# 🥾 Iberá · Guardaparques

App para que los guardaparques del **Gran Parque Iberá** 🐊 reporten problemas ambientales desde el terreno, **aunque no tengan señal** 📵.

## 🤔 ¿Qué hace?

1. 📸 El guardaparque saca una foto de lo que encontró.
2. 🗂️ Elige qué es con un toque: 🗑️ Basura · 🛢️ Lixiviados · 🦌 Fauna herida · 🚧 Infraestructura.
3. 📍 La ubicación GPS se guarda sola.
4. 💾 Todo queda guardado en el teléfono.
5. 🔄 Cuando vuelve a tener señal, toca **Sincronizar** y se envía todo de una vez 🚀

## 👴 Pensada para quien la usa

- 🔠 Letras grandes y botones gigantes.
- ☀️ Colores fuertes que se leen bien al sol.
- ✋ Se usa con una sola mano.
- ⌨️ No hace falta escribir nada en el terreno.
- ✅ Un tilde verde enorme confirma cada vez que algo se guardó.

## 📱 Pantallas

| | Pantalla | Qué tiene |
| --- | --- | --- |
| 🔑 | Login | Se entra una sola vez, antes de salir al recorrido |
| 🏠 | Inicio | "Hola, Juan" + **Nuevo reporte** + **Sincronizar (3 pendientes)** |
| 📸 | Nuevo reporte | Foto, categoría, notas opcionales y **Guardar** |
| 🔄 | Sincronizar | Lista de lo guardado y **Enviar todo al servidor** |

## 🧰 Tecnologías

Next.js · React · Tailwind CSS · TypeScript · PWA (se instala como una app y abre sin internet)

## 🚀 Cómo levantarla

1. Primero levantá el [backend](https://github.com/FabianGQuintana/IBERA-Rangers-API) 🌿
2. Después:

   ```bash
   npm install
   cp .env.example .env.local
   npm run dev -- -p 3001
   ```

3. Abrí 👉 **http://localhost:3001**

## 🧪 Cómo probarla

1. 👤 Creá un guardaparque desde el Swagger del backend.
2. 📱 En Chrome apretá **F12** y después **Ctrl+Shift+M** para verla como en un celular.
3. 🔑 Entrá con el guardaparque.
4. 📸 Hacé un reporte: aceptá el permiso de ubicación, elegí una foto y una categoría, y guardá ✅
5. 📵 En **F12 → Network** cambiá a **Offline** y hacé un par de reportes más: se guardan igual.
6. 📶 Volvé a ponerlo **online** → **Sincronizar** → **Enviar todo** 🚀
7. 🔍 En el Swagger, `GET /api/reports` muestra los reportes con su foto y su ubicación.

> 📲 Para probarla en tu celular hace falta HTTPS (por el GPS): `npx next dev --experimental-https -p 3001` y entrá desde el celular a `https://IP-de-tu-PC:3001`.

## ☁️ Deploy

Se publica en **Vercel**, conectada al backend en Railway. Los pasos están en el [`docs/DEPLOY.md`](https://github.com/FabianGQuintana/IBERA-Rangers-API/blob/development/docs/DEPLOY.md) del backend.

---

Hecho con 💚 para el Iberá
