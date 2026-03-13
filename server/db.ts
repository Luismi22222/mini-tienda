import { and, eq, sum } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, products, orders, orderItems, cartItems } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId && !user.email) {
    throw new Error("User openId or email is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
      email: user.email,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "passwordHash"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get users: database not available");
    return [];
  }

  const result = await db.select().from(users).orderBy(users.createdAt);
  return result;
}

export async function updateUser(userId: number, updates: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return undefined;
  }

  try {
    await db.update(users).set(updates).where(eq(users.id, userId));
    return await getUserById(userId);
  } catch (error) {
    console.error("[Database] Failed to update user:", error);
    throw error;
  }
}

export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete user: database not available");
    return false;
  }

  try {
    await db.delete(users).where(eq(users.id, userId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete user:", error);
    throw error;
  }
}

/**
 * Productos
 */
export async function getPublicProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(products.createdAt);
}

export async function getProductsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.userId, userId));
}

export async function getProductById(productId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  return result[0];
}

export async function createProduct(data: typeof products.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(data);
  return result;
}

export async function updateProduct(productId: number, data: Partial<typeof products.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(products).set(data).where(eq(products.id, productId));
}

export async function deleteProduct(productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(products).where(eq(products.id, productId));
}

/**
 * Carrito
 */
export async function getCartItems(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cartItems).where(eq(cartItems.userId, userId));
}

export async function addToCart(userId: number, productId: number, quantity: number = 1) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Verificar si el producto ya está en el carrito
  const existing = await db.select().from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
    .limit(1);
  
  if (existing.length > 0) {
    // Actualizar cantidad
    return db.update(cartItems)
      .set({ quantity: existing[0].quantity + quantity })
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
  } else {
    // Insertar nuevo
    return db.insert(cartItems).values({ userId, productId, quantity });
  }
}

export async function removeFromCart(cartItemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(cartItems).where(eq(cartItems.id, cartItemId));
}

export async function updateCartItemQuantity(cartItemId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(cartItems).set({ quantity }).where(eq(cartItems.id, cartItemId));
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(cartItems).where(eq(cartItems.userId, userId));
}

/**
 * Pedidos
 */
export async function createOrder(buyerId: number, totalPrice: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values({ buyerId, totalPrice, status: "completed" });
  return result;
}

export async function createOrderItem(data: typeof orderItems.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(orderItems).values(data);
}

export async function getOrdersByBuyerId(buyerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.buyerId, buyerId)).orderBy(orders.createdAt);
}

export async function getOrderItemsByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function getOrdersBySellerIdForSales(sellerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.sellerId, sellerId)).orderBy(orderItems.createdAt);
}

/**
 * Gestión de saldo
 */
export async function getUserBalance(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select({ balance: users.balance }).from(users).where(eq(users.id, userId)).limit(1);
  return result[0]?.balance;
}

export async function updateUserBalance(userId: number, newBalance: string | number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(users).set({ balance: newBalance.toString() }).where(eq(users.id, userId));
}

export async function addUserBalance(userId: number, amount: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const currentBalance = await getUserBalance(userId);
  if (currentBalance === undefined) throw new Error("User not found");
  const newBalance = parseFloat(currentBalance.toString()) + amount;
  return updateUserBalance(userId, newBalance);
}

export async function subtractUserBalance(userId: number, amount: number) {
  return addUserBalance(userId, -amount);
}
