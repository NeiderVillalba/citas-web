# AGENTS.md — citas-web

## Estado del frontend

El frontend de Stitch/Google AI Studio ya está importado como React 19, TypeScript, Vite y Tailwind CSS. El paquete `medcitas---portal-médico-y-gestión-de-citas.zip` entregado por el usuario coincide con las vistas y estilos del repositorio. Consultar [STITCH_INTEGRATION.md](docs/STITCH_INTEGRATION.md) antes de reemplazar componentes: este repositorio conserva adaptaciones REST y assets locales que no aparecen en el ZIP original.

## Inspección obligatoria

Antes de proponer cambios:

1. Revisar el stack React/TypeScript/Vite existente y los componentes importados.
2. Leer la HU, CA y DoD relevantes.
3. Revisar rutas, componentes, estilos, tokens y evidencia del diseño aprobado.
4. Identificar pantallas, componentes, servicios y estados afectados.
5. Mapear estados loading, empty, error, success y disabled.

No cambiar de framework por preferencia propia.

## Responsabilidad

- Implementar exclusivamente el frontend TypeScript con el stack exportado por Google AI Studio.
- Consumir `citas-api` directamente por REST.
- Mantener alta fidelidad al diseño aprobado de Stitch/AI Studio.
- Gestionar formularios, estado de UI, autorización de rutas, errores, accesibilidad y pruebas/build.

## Reglas

- No añadir Express, BFF ni otra capa intermedia.
- No implementar reglas de negocio únicamente en cliente; el backend es autoridad.
- Configurar la URL de API por environment.
- No hardcodear tokens ni secretos.
- Preservar componentes y estilos correctos durante la reconciliación de AI Studio.
- No editar `citas-api`. Si falta contrato, reportar al orquestador el cambio cross-repo requerido.

## Modo de trabajo

1. Leer HU, CA y DoD relevantes.
2. Identificar pantallas, componentes y servicios afectados.
3. Mapear estados UI.
4. Implementar sin rediseñar lo aprobado.
5. Ejecutar build, typecheck y pruebas disponibles.
6. Verificar comportamiento contra criterios de aceptación.
7. Resumir evidencia y declarar expresamente lo no verificado.

## Wiki

No mantener una LLM Wiki propia. Consultar la Wiki global en `../citas-api/docs/wiki/llm-wiki/` cuando sea relevante; sus actualizaciones las realiza el agente orquestador.
