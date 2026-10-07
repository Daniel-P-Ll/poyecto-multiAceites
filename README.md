# MultiAceites

Sistema académico de gestión de ventas de aceites construido con React + Spring Boot + PostgreSQL.

## Alcance

El proyecto implementa exclusivamente los requerimientos funcionales del documento de la actividad:
- Login y control de acceso por roles.
- CRUD de usuarios, productos y clientes.
- Stock y alerta de bajo stock.
- Búsqueda de clientes por cédula.
- Registro de ventas y cálculo de importes.
- Descuento automático de stock.
- Historial del precio vendido.
- Emisión y exportación PDF de comprobantes.
- Historial de ventas.
- Dashboard general.
- Reporte de productos más vendidos.
- Reporte de ingresos/facturación.
- Eliminación lógica.

Se tomó como referencia únicamente la separación arquitectónica del ZIP original (frontend React / backend Spring Boot y sus capas), sin copiar sus módulos funcionales no solicitados.

## Requisitos
- Java 17+ (recomendado para IntelliJ IDEA).
- PostgreSQL y pgAdmin.
- Node.js 20+.
- IntelliJ IDEA para el backend.

## PostgreSQL / pgAdmin
Crear una base de datos llamada `multiaceites` en pgAdmin. Usuario por defecto: `postgres`; contraseña por defecto: `123456` (cambiar en `application.properties` o variables de entorno).

## Backend
Abrir `backend-springboot` como proyecto Maven en IntelliJ IDEA.
Ejecutar `com.multiaceites.MultiAceitesApplication`.
API: `http://localhost:8081`
Swagger: `http://localhost:8081/swagger-ui.html`

Usuarios iniciales:
- admin / admin123 (ADMIN)
- vendedor / vendedor123 (VENDEDOR)

## Frontend
```bash
cd frontend-react
npm install
npm run dev
```
Abrir `http://localhost:5173`.

## Variables opcionales
`DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRATION_MS`, `CORS_ALLOWED_ORIGIN`.
