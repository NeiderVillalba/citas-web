# citas-web

Frontend React + TypeScript importado desde Google AI Studio para el sistema de citas FCV. Usa Vite y Tailwind CSS, y debe consumir directamente la API REST de `citas-api`; no usa Express, BFF ni servicios de Gemini.

## Ejecución local

Requiere Node.js 24 LTS.

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

La interfaz estará disponible en `http://localhost:3000`. Configura `VITE_API_BASE_URL` en `.env.local` cuando la API Spring Boot esté disponible. Mientras tanto, la interfaz conserva datos simulados importados del prototipo.

## Verificación

```powershell
npm run lint
npm run build
```
