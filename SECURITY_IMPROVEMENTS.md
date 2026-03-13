# 🔧 GUÍA DE MEJORAS DE SEGURIDAD - MINI-TIENDA

## Implementaciones Recomendadas

### 1. RATE LIMITING (Prioridad: ALTA)

**Problema**: Sin límite de intentos de login fallidos, vulnerable a ataques de fuerza bruta.

**Solución**:

```bash
pnpm add express-rate-limit
```

**Implementación en `server/_core/index.ts`**:

```typescript
import rateLimit from 'express-rate-limit';

// Limiter para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos máximo
  message: 'Demasiados intentos de login. Intenta más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter general de API
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // 100 requests por minuto
  message: 'Demasiadas solicitudes. Intenta más tarde.',
});

// Aplicar limiters
app.post('/api/trpc/auth.loginLocal', loginLimiter, ...);
app.use('/api/trpc', apiLimiter);
```

---

### 2. HEADERS DE SEGURIDAD HTTP (Prioridad: ALTA)

**Problema**: Faltan headers de seguridad que previenen ataques comunes.

**Solución**:

```bash
pnpm add helmet
```

**Implementación en `server/_core/index.ts`**:

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 año
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
```

---

### 3. LOGGING DE SEGURIDAD (Prioridad: MEDIA)

**Problema**: No hay registro de intentos de acceso no autorizado o actividades sospechosas.

**Solución**:

```bash
pnpm add winston
```

**Crear `server/security-logger.ts`**:

```typescript
import winston from 'winston';

export const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'mini-tienda-security' },
  transports: [
    new winston.transports.File({ filename: 'logs/security-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/security.log' }),
  ],
});

// Uso en rutas protegidas
export function logUnauthorizedAccess(userId: number, action: string, resource: string) {
  securityLogger.warn({
    event: 'UNAUTHORIZED_ACCESS_ATTEMPT',
    userId,
    action,
    resource,
    timestamp: new Date().toISOString(),
  });
}

export function logSuspiciousActivity(userId: number, activity: string, details: any) {
  securityLogger.warn({
    event: 'SUSPICIOUS_ACTIVITY',
    userId,
    activity,
    details,
    timestamp: new Date().toISOString(),
  });
}
```

**Uso en `server/routers.ts`**:

```typescript
import { logUnauthorizedAccess, logSuspiciousActivity } from './security-logger';

products: router({
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const product = await db.query.products.findFirst({
        where: eq(products.id, input.id),
      });

      if (!product) {
        logUnauthorizedAccess(ctx.user.id, 'DELETE_PRODUCT', `product_${input.id}`);
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      if (product.userId !== ctx.user.id) {
        logUnauthorizedAccess(ctx.user.id, 'DELETE_PRODUCT_UNAUTHORIZED', `product_${input.id}`);
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      // ... resto del código
    }),
}),
```

---

### 4. AUDITORÍA DE CAMBIOS (Prioridad: MEDIA)

**Problema**: No hay historial de quién cambió qué y cuándo.

**Solución**: Crear tabla de auditoría

**Agregar a `drizzle/schema.ts`**:

```typescript
export const auditLog = mysqlTable('auditLog', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull(),
  action: varchar('action', { length: 50 }).notNull(), // CREATE, UPDATE, DELETE
  entity: varchar('entity', { length: 50 }).notNull(), // products, orders, etc
  entityId: int('entityId').notNull(),
  oldValues: json('oldValues'),
  newValues: json('newValues'),
  ipAddress: varchar('ipAddress', { length: 45 }),
  userAgent: text('userAgent'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});
```

**Helper en `server/db.ts`**:

```typescript
export async function logAudit(
  userId: number,
  action: string,
  entity: string,
  entityId: number,
  oldValues?: any,
  newValues?: any,
  ipAddress?: string,
  userAgent?: string
) {
  await db.insert(auditLog).values({
    userId,
    action,
    entity,
    entityId,
    oldValues: oldValues ? JSON.stringify(oldValues) : null,
    newValues: newValues ? JSON.stringify(newValues) : null,
    ipAddress,
    userAgent,
  });
}
```

---

### 5. ENCRIPTACIÓN DE DATOS EN REPOSO (Prioridad: MEDIA)

**Problema**: Datos sensibles almacenados sin encriptación.

**Solución**:

```bash
pnpm add crypto-js
```

**Crear `server/encryption.ts`**:

```typescript
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

export function encryptData(data: string): string {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
}

export function decryptData(encryptedData: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
```

---

### 6. VALIDACIÓN DE ORIGEN CSRF (Prioridad: MEDIA)

**Problema**: Sin validación de origen en cambios de estado.

**Solución**: Agregar middleware CSRF

```bash
pnpm add csurf
```

**Implementación en `server/_core/index.ts`**:

```typescript
import csrf from 'csurf';
import cookieParser from 'cookie-parser';

app.use(cookieParser());
app.use(csrf({ cookie: true }));

// Middleware para validar CSRF en mutaciones
app.use('/api/trpc', (req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    // Validar token CSRF
    try {
      csrf()(req, res, next);
    } catch (err) {
      res.status(403).json({ error: 'CSRF token invalid' });
    }
  } else {
    next();
  }
});
```

---

### 7. AUTENTICACIÓN MULTIFACTOR (MFA) (Prioridad: BAJA)

**Problema**: Solo autenticación de contraseña, sin factor adicional.

**Solución**:

```bash
pnpm add speakeasy qrcode
```

**Crear `server/mfa.ts`**:

```typescript
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export async function generateMFASecret(email: string) {
  const secret = speakeasy.generateSecret({
    name: `Mini-Tienda (${email})`,
    issuer: 'Mini-Tienda',
    length: 32,
  });

  const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

  return {
    secret: secret.base32,
    qrCode,
  };
}

export function verifyMFAToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2,
  });
}
```

---

### 8. DETECCIÓN DE FRAUDE (Prioridad: BAJA)

**Problema**: Sin detección de transacciones sospechosas.

**Solución**: Crear reglas de detección

**Crear `server/fraud-detection.ts`**:

```typescript
export async function checkFraudRisk(
  userId: number,
  amount: number,
  ipAddress: string
): Promise<{ risk: 'low' | 'medium' | 'high'; reason?: string }> {
  // Regla 1: Transacción muy grande
  if (amount > 10000) {
    return { risk: 'high', reason: 'Transacción muy grande' };
  }

  // Regla 2: Múltiples transacciones en corto tiempo
  const recentTransactions = await db.query.orders.findMany({
    where: and(
      eq(orders.buyerId, userId),
      gte(orders.createdAt, new Date(Date.now() - 5 * 60 * 1000)) // Últimos 5 minutos
    ),
  });

  if (recentTransactions.length > 5) {
    return { risk: 'high', reason: 'Múltiples transacciones en corto tiempo' };
  }

  // Regla 3: IP diferente a la usual
  const userIPs = await db.query.auditLog.findMany({
    where: eq(auditLog.userId, userId),
    limit: 10,
  });

  const knownIPs = new Set(userIPs.map(log => log.ipAddress));
  if (!knownIPs.has(ipAddress) && knownIPs.size > 0) {
    return { risk: 'medium', reason: 'IP diferente a la usual' };
  }

  return { risk: 'low' };
}
```

---

### 9. MONITOREO DE DEPENDENCIAS (Prioridad: MEDIA)

**Problema**: Dependencias con vulnerabilidades conocidas.

**Solución**: Auditar dependencias regularmente

```bash
# Verificar vulnerabilidades
pnpm audit

# Actualizar dependencias
pnpm update

# Usar Snyk para monitoreo continuo
npm install -g snyk
snyk test
```

---

### 10. PENETRATION TESTING REGULAR (Prioridad: BAJA)

**Problema**: Sin pruebas de seguridad periódicas.

**Solución**: Establecer calendario de auditorías

- **Trimestral**: Auditoría interna de seguridad
- **Anual**: Penetration testing externo profesional
- **Continuo**: Monitoreo de vulnerabilidades en dependencias

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Fase 1 (Semana 1-2)
- [ ] Implementar Rate Limiting
- [ ] Agregar Headers de Seguridad (Helmet)
- [ ] Configurar HTTPS en producción

### Fase 2 (Semana 3-4)
- [ ] Implementar Logging de Seguridad
- [ ] Crear tabla de Auditoría
- [ ] Agregar validación de CSRF

### Fase 3 (Mes 2)
- [ ] Implementar Encriptación de datos en reposo
- [ ] Agregar detección de fraude básica
- [ ] Configurar monitoreo de dependencias

### Fase 4 (Mes 3)
- [ ] Implementar MFA (opcional)
- [ ] Realizar penetration testing profesional
- [ ] Establecer SLA de seguridad

---

## 🔐 ESTÁNDARES DE SEGURIDAD APLICADOS

- **OWASP Top 10**: Protección contra las 10 vulnerabilidades más críticas
- **CWE/SANS Top 25**: Cobertura de errores comunes de software
- **NIST Cybersecurity Framework**: Identificar, proteger, detectar, responder, recuperar
- **PCI DSS**: Si se procesa información de pago
- **GDPR**: Si se almacenan datos de usuarios europeos

---

## 📞 SOPORTE

Para preguntas sobre estas mejoras:
- Documentación: https://owasp.org/www-project-top-ten/
- Herramientas: https://www.zaproxy.org/, https://portswigger.net/burp
- Comunidad: https://security.stackexchange.com/

---

**Última actualización**: 13 de Marzo de 2026
