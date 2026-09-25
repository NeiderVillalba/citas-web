# citas-web

Frontend React + TypeScript importado desde Stitch/Google AI Studio para el sistema de citas FCV. Usa Vite y Tailwind CSS y consume directamente la API REST de `citas-api`; no usa Express, BFF ni servicios de Gemini. La comparación con el ZIP entregado por el usuario y las decisiones de importación están en [docs/STITCH_INTEGRATION.md](docs/STITCH_INTEGRATION.md).

## Ejecución local

Requiere Node.js 24 LTS.

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

La interfaz estará disponible en `http://localhost:3000`. Configura `VITE_API_BASE_URL` en `.env.local` para apuntar a Spring Boot. Registro, sesión, búsqueda de disponibilidad, reserva, Mis citas, cancelación e historial consumen REST. Los usuarios `ADMIN` entran a la bandeja de solicitudes; los `PROFESSIONAL` ven su agenda y registran COMPLETED/NO_SHOW. Si la base está vacía, habilita `DEMO_SEED=true` en la API para cargar profesionales y horarios sintéticos.

El ZIP recibido incluye pantallas de historia clínica, recetas, videollamada y notificaciones que no pertenecen al PRD de citas. El portal USER activo muestra solo los flujos de citas; esas pantallas no se ofrecen en la navegación. Las vistas ADMIN y PROFESSIONAL se implementaron con los mismos componentes y estilos Stitch porque el ZIP no las incluía. La gestión de bloques de disponibilidad sigue pendiente.

## Verificación

```powershell
npm run lint
npm run build
```

Para habilitar el hook local de S3 en este clon, ejecuta `git config --local core.hooksPath .githooks`; cada commit revisa secretos staged, typecheck y pruebas del cliente.
