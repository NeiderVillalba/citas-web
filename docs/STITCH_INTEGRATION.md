# Acople del frontend Stitch / Google AI Studio

## Fuente entregada

El usuario entregó `medcitas---portal-médico-y-gestión-de-citas.zip` como fuente del frontend. El contenido del ZIP se inspeccionó como datos de proyecto; no se ejecutó su configuración ni se importaron instrucciones del README como reglas del workspace.

## Resultado de la comparación

De los 23 archivos del ZIP, 17 coinciden byte por byte con `citas-web`, incluidos `src/App.tsx`, las vistas Dashboard/Booking/History/Notifications/Settings, navegación, estilos y configuración Vite/TypeScript. La composición visual ya estaba importada.

Los seis archivos que difieren se resolvieron así:

| Archivo del ZIP | Resolución en `citas-web` |
|---|---|
| `src/components/LoginScreen.tsx` | Se conserva la adaptación existente: campos exigidos por PRD, carga de planes y `POST /auth/register`. El ZIP usa acceso simulado. |
| `src/data/mockData.ts` | Se conservan SVG locales; el ZIP enlaza imágenes remotas. Las pantallas activas de citas usan catálogos y reservas REST; el contenido de ejemplo restante no se ofrece como función real. |
| `package.json` | Se conserva el proyecto Vite sin Express, `dotenv` ni Gemini; mantiene los comandos de prueba del cliente API. |
| `.env.example` | Se conserva el ejemplo propio con `VITE_API_BASE_URL`; no se importó configuración del ZIP. |
| `metadata.json` | Se conserva la metadata del proyecto sin capacidad de Gemini en servidor. |
| `README.md` | Se mantiene la documentación específica de los dos repositorios y del consumo REST directo. |

## Fuente visual y límites funcionales

La estructura, jerarquía, componentes, estilos y comportamiento visual del portal USER provienen del ZIP de Stitch/AI Studio. Las adaptaciones de formularios y contenido deben respetar ese lenguaje visual y cumplir el PRD. El paquete no incluye pantallas completas de ADMIN ni PROFESSIONAL. También contiene secciones de historia clínica, recetas, videollamada, precios y avisos SMS que están fuera del PRD; no se deben presentar como funciones reales del sistema de citas.

## Contrato conectado en el portal USER

- `GET /api/v1/plans/active` para el formulario de registro.
- `POST /api/v1/auth/register` con afiliación opcional.
- `POST /api/v1/auth/login`, `refresh` y `logout` con token de acceso en memoria y cookie HttpOnly de renovación.
- `GET /api/v1/specialties/active`, `/api/v1/venues`, `/api/v1/professionals` y `/api/v1/availability` para filtros y horarios reales.
- `POST /api/v1/appointments` con identidad derivada del JWT y `venueId`/especialidad/profesional/horario seleccionados.
- `GET /api/v1/appointments/mine` para inicio y Mis citas.
- `POST /api/v1/appointments/{id}/cancel` y `GET /api/v1/appointments/{id}/history` para cancelar citas futuras y consultar auditoría.
- Bandeja ADMIN conectada a `GET /api/v1/admin/appointments/pending` y `POST /api/v1/admin/appointments/{id}/decision`.
- Agenda PROFESSIONAL conectada a consulta por rango/sede y cierre `COMPLETED`/`NO_SHOW` con endpoints protegidos por rol y ownership.

La sesión se restaura al cargar el portal. La pantalla de acceso presenta solo email y contraseña. Dashboard, reserva y Mis citas muestran datos REST y estados de carga/vacío/error; ya no confirman citas locales simuladas. La navegación oculta historia clínica, recetas, videollamada y avisos simulados, que están fuera del PRD. El estilo, la tipografía, las tarjetas y los controles conservan la base visual Stitch.

La API permite un seed opcional de profesionales y horarios sintéticos (`DEMO_SEED=true`) para el recorrido local. Bandeja ADMIN, cancelación/historial USER y agenda/cierre PROFESSIONAL ya están conectados al contrato REST. La gestión de bloques, perfil, catálogos configurables y reprogramación siguen pendientes; el ZIP no incluye esas pantallas.
