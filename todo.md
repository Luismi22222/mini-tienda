# Mini-Tienda TODO

## Fase 1: Modelo de Datos y Backend

- [x] Extender schema.ts con tablas: productos, pedidos, items_pedidos
- [x] Crear migraciones SQL para nuevas tablas
- [x] Implementar helpers en db.ts para productos, pedidos y carrito

## Fase 2: Autenticación y Gestión de Usuarios

- [x] Implementar registro con email, contraseña hasheada y confirmación
- [x] Implementar login con validación backend
- [x] Agregar saldo inicial a usuarios nuevos
- [x] Crear procedimiento para obtener saldo del usuario

## Fase 3: Gestión de Productos

- [x] Crear procedimiento para listar productos públicos
- [x] Crear procedimiento para crear producto (protegido)
- [x] Crear procedimiento para obtener productos del usuario (mis productos)
- [x] Crear procedimiento para editar producto (solo propietario)
- [x] Crear procedimiento para eliminar producto (solo propietario)

## Fase 4: Carrito de Compras

- [x] Crear procedimiento para agregar producto al carrito
- [x] Crear procedimiento para obtener carrito del usuario
- [x] Crear procedimiento para eliminar producto del carrito
- [x] Crear procedimiento para actualizar cantidad en carrito

## Fase 5: Pedidos y Transacciones

- [x] Crear procedimiento para finalizar compra (validar saldo, actualizar balances)
- [x] Crear procedimiento para obtener historial de compras del usuario
- [x] Crear procedimiento para obtener historial de ventas del usuario
- [x] Implementar transacciones seguras para compras

## Fase 6: Frontend - Autenticación

- [x] Crear página de Registro
- [x] Crear página de Login
- [x] Integrar con procedimientos de autenticación

## Fase 7: Frontend - Catálogo y Productos

- [x] Crear página de Catálogo (listado público)
- [x] Crear página de Crear Producto
- [x] Crear página de Mis Productos (editar, eliminar)
- [x] Crear página de Detalle de Producto

## Fase 8: Frontend - Carrito y Compras

- [x] Crear página de Carrito
- [x] Implementar agregar a carrito desde catálogo
- [x] Implementar finalizar compra con validación
- [x] Crear página de Mis Compras

## Fase 9: Frontend - Dashboard

- [x] Crear dashboard con saldo, resumen de ventas/compras
- [x] Agregar navegación principal

## Fase 10: Docker y Despliegue

- [x] Crear Dockerfile para backend
- [x] Crear docker-compose.yml
- [x] Verificar que la app se levanta correctamente

## Fase 11: Pruebas y Validación

- [x] Escribir tests para procedimientos críticos
- [x] Probar flujo completo de compra
- [x] Validar seguridad de transacciones

## Fase 12: Entrega

- [x] Crear checkpoint final
- [x] Documentar instrucciones de uso
