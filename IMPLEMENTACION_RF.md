# Cambios implementados según la tabla de RF

## Implementado
- RF3: se mantiene el control existente de activación/desactivación de usuarios y se bloquea el registro de ventas cuando el vendedor autenticado está inactivo.
- RF5 y RF14–RF16: se incorpora una gráfica de barras para productos más vendidos y filtros por vendedor/fechas en reportes.
- RF6 y RF12: se añade la dirección del local/sucursal y se muestra su ubicación en el PDF del comprobante cuando existe.
- RF8: endpoint de consulta por vendedor y fechas (`GET /api/reportes/ventas-vendedor`) y descarga global CSV (`GET /api/reportes/descarga-global`).
- RF9: consulta de producto con bloqueo pesimista al registrar venta, validación de existencias en backend y actualización visual del stock disponible en frontend.
- RF10: tarifa IVA configurable por producto (15% predeterminada o 8%), validación en backend y persistencia de tarifa e impuesto en cada detalle; se guarda subtotal, impuesto y total y se muestran desglosados en venta, reportes y PDF.

## Pendiente por definición
- RF11 no se implementó porque la tabla no especifica qué requerimiento debe cambiar. Se necesita su descripción exacta para evitar introducir una regla incorrecta.

## Consideraciones
- La aplicación usa `spring.jpa.hibernate.ddl-auto=update`; al arrancar, Hibernate intentará actualizar el esquema. Se recomienda respaldar la base de datos antes de ejecutar.
- La compilación no pudo verificarse en este entorno: Maven Wrapper no pudo descargar Maven por falta de acceso al repositorio y la instalación de dependencias de npm no terminó. Ejecutar `mvnw.cmd test` desde `backend-springboot` y `npm run build` desde `frontend-react` en el equipo de desarrollo.
- El 8% se deja como una tarifa seleccionable porque la tabla no especifica el criterio de asignación. Confirme con el docente/regla tributaria del proyecto qué productos deben usar cada tarifa.
