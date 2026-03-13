import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Tabla de usuarios con soporte para autenticación local y OAuth
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  /** Contraseña hasheada para autenticación local */
  passwordHash: varchar("passwordHash", { length: 255 }),
  /** Saldo virtual del usuario para compras */
  balance: decimal("balance", { precision: 12, scale: 2 }).default("1000.00").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Productos en el marketplace
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Pedidos (órdenes de compra)
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  buyerId: int("buyerId").notNull(),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Items dentro de cada pedido
 */
export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  sellerId: int("sellerId").notNull(),
  quantity: int("quantity").notNull().default(1),
  priceAtPurchase: decimal("priceAtPurchase", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Carrito temporal (sesión del usuario)
 */
export const cartItems = mysqlTable("cartItems", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

/**
 * Relaciones entre tablas
 */
export const usersRelations = relations(users, ({ many }) => (
  {
    products: many(products),
    orders: many(orders),
    cartItems: many(cartItems),
  }
));

export const productsRelations = relations(products, ({ one, many }) => (
  {
    seller: one(users, {
      fields: [products.userId],
      references: [users.id],
    }),
    orderItems: many(orderItems),
  }
));

export const ordersRelations = relations(orders, ({ one, many }) => (
  {
    buyer: one(users, {
      fields: [orders.buyerId],
      references: [users.id],
    }),
    items: many(orderItems),
  }
));

export const orderItemsRelations = relations(orderItems, ({ one }) => (
  {
    order: one(orders, {
      fields: [orderItems.orderId],
      references: [orders.id],
    }),
    product: one(products, {
      fields: [orderItems.productId],
      references: [products.id],
    }),
    seller: one(users, {
      fields: [orderItems.sellerId],
      references: [users.id],
    }),
  }
));

export const cartItemsRelations = relations(cartItems, ({ one }) => (
  {
    user: one(users, {
      fields: [cartItems.userId],
      references: [users.id],
    }),
    product: one(products, {
      fields: [cartItems.productId],
      references: [products.id],
    }),
  }
));
