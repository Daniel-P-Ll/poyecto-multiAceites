# MultiAceites Backend
Spring Boot 3.3.5 + Java 17 + PostgreSQL + Spring Security/JWT.

Capas: controller, service, repository, model/entity, dto, security, config y exception.

## Configuración de empresa e IVA

La configuración de empresa se conserva como un único registro con ID `1` en la tabla `sucursales`,
incluyendo el RUC/NIT opcional que se imprime en los comprobantes.
`GET /api/empresa` devuelve esa configuración para usuarios autenticados y `PUT /api/empresa`
la actualiza (solo ADMIN); la tarifa permitida es 15% u 8%. Las nuevas ventas calculan el IVA
sobre el subtotal usando la tarifa vigente guardada en esa configuración.
