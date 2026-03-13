# Mini-Tienda

Una plataforma de marketplace completa donde los usuarios pueden comprar y vender productos con un sistema de saldo virtual.

## Características

- **Autenticación Local**: Registro e inicio de sesión con email y contraseña hasheada
- **Gestión de Productos**: Crear, editar y eliminar productos
- **Catálogo Público**: Explorar todos los productos disponibles
- **Carrito de Compras**: Agregar productos al carrito y gestionar cantidades
- **Sistema de Saldo Virtual**: Cada usuario tiene un saldo inicial de $1000 para comprar
- **Transacciones Seguras**: Validación de saldo y actualización automática de balances
- **Panel de Usuario**: Dashboard con resumen de compras, ventas y saldo
- **Historial de Compras y Ventas**: Seguimiento completo de transacciones

## Tecnología

### Frontend
- **React 19** con TypeScript
- **Tailwind CSS 4** para estilos
- **tRPC** para comunicación con el backend
- **Wouter** para enrutamiento
- **shadcn/ui** para componentes

### Backend
- **Express.js** con Node.js
- **tRPC** para APIs type-safe
- **Drizzle ORM** para gestión de base de datos
- **MySQL** como base de datos

### DevOps
- **Docker** y **Docker Compose** para contenedorización
- **Vite** para build del frontend

## Instalación Local

### Requisitos
- Node.js 22+
- pnpm 10+
- MySQL 8.0+ (o usar Docker)

### Pasos

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd mini-tienda
```

2. **Instalar dependencias**
```bash
pnpm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
# Editar .env.local con tus valores
```

4. **Iniciar con Docker Compose** (recomendado)
```bash
docker-compose up --build
```

La aplicación estará disponible en `http://localhost:3000`

### Desarrollo Local (sin Docker)

1. **Configurar base de datos**
```bash
# Asegúrate de tener MySQL corriendo
# Crear base de datos y usuario
mysql -u root -p
CREATE DATABASE mini_tienda;
CREATE USER 'tienda_user'@'localhost' IDENTIFIED BY 'tienda_password';
GRANT ALL PRIVILEGES ON mini_tienda.* TO 'tienda_user'@'localhost';
FLUSH PRIVILEGES;
```

2. **Ejecutar migraciones**
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

3. **Iniciar servidor de desarrollo**
```bash
pnpm dev
```

El servidor estará en `http://localhost:3000`

## Estructura del Proyecto

```
mini-tienda/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── components/    # Componentes reutilizables
│   │   ├── lib/           # Utilidades y configuración
│   │   └── App.tsx        # Enrutamiento principal
│   └── index.html
├── server/                # Backend Express
│   ├── routers.ts        # Definición de procedimientos tRPC
│   ├── db.ts             # Helpers de base de datos
│   ├── auth.ts           # Utilidades de autenticación
│   └── _core/            # Configuración del framework
├── drizzle/              # Esquema y migraciones
│   └── schema.ts         # Definición de tablas
├── Dockerfile            # Imagen Docker
├── docker-compose.yml    # Orquestación de servicios
└── package.json
```

## Modelo de Datos

### Tabla `users`
- `id`: Identificador único
- `email`: Email único del usuario
- `passwordHash`: Contraseña hasheada con PBKDF2
- `name`: Nombre del usuario
- `balance`: Saldo virtual (inicial: $1000)
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de última actualización

### Tabla `products`
- `id`: Identificador único
- `userId`: ID del vendedor
- `name`: Nombre del producto
- `description`: Descripción detallada
- `price`: Precio en USD
- `imageUrl`: URL de la imagen (opcional)
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de última actualización

### Tabla `orders`
- `id`: Identificador único
- `buyerId`: ID del comprador
- `totalPrice`: Precio total de la orden
- `status`: Estado (pending, completed, cancelled)
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de última actualización

### Tabla `orderItems`
- `id`: Identificador único
- `orderId`: ID de la orden
- `productId`: ID del producto
- `sellerId`: ID del vendedor
- `quantity`: Cantidad comprada
- `priceAtPurchase`: Precio al momento de compra
- `createdAt`: Fecha de creación

### Tabla `cartItems`
- `id`: Identificador único
- `userId`: ID del usuario
- `productId`: ID del producto
- `quantity`: Cantidad en carrito
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de última actualización

## Flujo de Compra

1. **Registro/Login**: El usuario se registra o inicia sesión
2. **Explorar Catálogo**: Ver todos los productos disponibles
3. **Agregar al Carrito**: Seleccionar cantidad y agregar productos
4. **Revisar Carrito**: Ajustar cantidades o eliminar productos
5. **Finalizar Compra**: 
   - Sistema valida saldo suficiente
   - Crea orden y items asociados
   - Resta saldo del comprador
   - Suma saldo a cada vendedor
   - Limpia el carrito
6. **Confirmación**: Redirecciona a historial de compras

## Validaciones de Seguridad

- **Contraseñas**: Hasheadas con PBKDF2 (100,000 iteraciones)
- **Saldo**: Validado antes de cada compra
- **Propiedad**: Solo el propietario puede editar/eliminar sus productos
- **Precios**: Validados como números positivos
- **Descripciones**: Sanitizadas y limitadas en longitud
- **Transacciones**: Atómicas y seguras

## Endpoints principales

### Autenticación
- `POST /api/trpc/auth.registerLocal` - Registro
- `POST /api/trpc/auth.loginLocal` - Login
- `POST /api/trpc/auth.logout` - Logout
- `GET /api/trpc/auth.me` - Obtener usuario actual
- `GET /api/trpc/auth.getBalance` - Obtener saldo

### Productos
- `GET /api/trpc/products.list` - Listar todos
- `GET /api/trpc/products.getById` - Obtener detalle
- `GET /api/trpc/products.myProducts` - Mis productos
- `POST /api/trpc/products.create` - Crear producto
- `POST /api/trpc/products.update` - Actualizar producto
- `POST /api/trpc/products.delete` - Eliminar producto

### Carrito
- `GET /api/trpc/cart.getItems` - Obtener carrito
- `POST /api/trpc/cart.addItem` - Agregar al carrito
- `POST /api/trpc/cart.updateQuantity` - Actualizar cantidad
- `POST /api/trpc/cart.removeItem` - Eliminar del carrito
- `POST /api/trpc/cart.clear` - Limpiar carrito

### Pedidos
- `POST /api/trpc/orders.checkout` - Finalizar compra
- `GET /api/trpc/orders.myPurchases` - Mis compras
- `GET /api/trpc/orders.mySales` - Mis ventas

## Despliegue con Docker

### Construcción
```bash
docker build -t mini-tienda:latest .
```

### Ejecución
```bash
docker-compose up --build
```

La aplicación estará disponible en `http://localhost:3000`

### Variables de Entorno para Docker
Crear archivo `.env` en la raíz del proyecto:
```
JWT_SECRET=your-secret-key
VITE_APP_ID=your-app-id
# ... otras variables
```

## Testing

```bash
# Ejecutar tests
pnpm test

# Tests con cobertura
pnpm test:coverage
```

## Troubleshooting

### Error de conexión a base de datos
- Verificar que MySQL está corriendo
- Verificar `DATABASE_URL` en `.env.local`
- Verificar credenciales de usuario

### Error de puerto en uso
- Cambiar puerto en `docker-compose.yml`
- O detener el servicio que usa el puerto

### Error al construir Docker
- Limpiar cache: `docker system prune`
- Reconstruir: `docker-compose up --build`

## Contribución

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abrir un Pull Request

## Licencia

MIT

## Contacto

Para preguntas o soporte, contactar al equipo de desarrollo.

---

**Nota**: Este proyecto es una demostración educativa de un marketplace. Para producción, se recomienda implementar medidas de seguridad adicionales como SSL/TLS, rate limiting, y validación más rigurosa.
