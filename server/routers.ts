import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getUserByEmail,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  getPublicProducts,
  getProductsByUserId,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCartItems,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  createOrder,
  createOrderItem,
  getOrdersByBuyerId,
  getOrderItemsByOrderId,
  getOrdersBySellerIdForSales,
  getUserBalance,
  addUserBalance,
  subtractUserBalance,
  upsertUser,
} from "./db";
import {
  hashPassword,
  verifyPassword,
  isValidEmail,
  isValidPassword,
  isValidProductName,
  isValidProductDescription,
  isValidPrice,
  isValidQuantity,
} from "./auth";
import { TRPCError } from "@trpc/server";
import { sdk } from "./_core/sdk";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, cookieOptions);
      return {
        success: true,
      } as const;
    }),

    /**
     * Registro local con email y contraseña
     */
    registerLocal: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(8),
          confirmPassword: z.string().min(8),
          name: z.string().min(1).max(255).optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Validar que las contraseñas coincidan
        if (input.password !== input.confirmPassword) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Las contraseñas no coinciden",
          });
        }

        // Validar email
        if (!isValidEmail(input.email)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email inválido",
          });
        }

        // Validar contraseña
        if (!isValidPassword(input.password)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "La contraseña debe tener al menos 8 caracteres",
          });
        }

        // Verificar que el email no exista
        const existingUser = await getUserByEmail(input.email);
        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "El email ya está registrado",
          });
        }

        // Crear usuario
        const passwordHash = hashPassword(input.password);
        await upsertUser({
          email: input.email,
          name: input.name || input.email.split("@")[0],
          passwordHash,
          loginMethod: "local",
          balance: "1000.00",
        });

        return {
          success: true,
          message: "Usuario registrado exitosamente",
        };
      }),

    /**
     * Login local con email y contraseña
     */
    loginLocal: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Buscar usuario
        const user = await getUserByEmail(input.email);
        if (!user || !user.passwordHash) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Email o contraseña incorrectos",
          });
        }

        // Verificar contraseña
        if (!verifyPassword(input.password, user.passwordHash)) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Email o contraseña incorrectos",
          });
        }

        // Crear sesión JWT usando el SDK (como OAuth)
        // Para usuarios locales, usar el openId o el email como identificador
        const sessionToken = await sdk.createSessionToken(
          user.openId || user.email || user.id.toString(),
          { name: user.name || "" }
        );

        // Establecer cookie de sesión
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            balance: user.balance,
          },
        };
      }),

    /**
     * Obtener saldo del usuario
     */
    getBalance: protectedProcedure.query(async ({ ctx }) => {
      const balance = await getUserBalance(ctx.user.id);
      return { balance };
    }),
  }),

  /**
   * Productos
   */
  products: router({
    /**
     * Listar todos los productos públicos
     */
    list: publicProcedure.query(async () => {
      const allProducts = await getPublicProducts();
      return allProducts;
    }),

    /**
     * Obtener detalles de un producto
     */
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const product = await getProductById(input.id);
        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Producto no encontrado",
          });
        }
        return product;
      }),

    /**
     * Obtener productos del usuario logueado
     */
    myProducts: protectedProcedure.query(async ({ ctx }) => {
      return getProductsByUserId(ctx.user.id);
    }),

    /**
     * Crear nuevo producto
     */
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(255),
          description: z.string().min(1).max(5000),
          price: z.string().refine((val) => isValidPrice(val), "Precio inválido"),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Validar entrada
        if (!isValidProductName(input.name)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Nombre de producto inválido",
          });
        }

        if (!isValidProductDescription(input.description)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Descripción de producto inválida",
          });
        }

        if (!isValidPrice(input.price)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Precio debe ser un número positivo",
          });
        }

        // Crear producto
        await createProduct({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          price: input.price,
          imageUrl: input.imageUrl,
        });

        return { success: true };
      }),

    /**
     * Actualizar producto (solo propietario)
     */
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(255).optional(),
          description: z.string().min(1).max(5000).optional(),
          price: z.string().optional(),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const product = await getProductById(input.id);
        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Producto no encontrado",
          });
        }

        if (product.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permiso para editar este producto",
          });
        }

        const updateData: any = {};
        if (input.name) updateData.name = input.name;
        if (input.description) updateData.description = input.description;
        if (input.price) updateData.price = input.price;
        if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;

        await updateProduct(input.id, updateData);
        return { success: true };
      }),

    /**
     * Eliminar producto (solo propietario)
     */
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const product = await getProductById(input.id);
        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Producto no encontrado",
          });
        }

        if (product.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permiso para eliminar este producto",
          });
        }

        await deleteProduct(input.id);
        return { success: true };
      }),
  }),

  /**
   * Carrito
   */
  cart: router({
    /**
     * Obtener carrito del usuario
     */
    getItems: protectedProcedure.query(async ({ ctx }) => {
      const items = await getCartItems(ctx.user.id);
      // Enriquecer con detalles del producto
      const enrichedItems = await Promise.all(
        items.map(async (item) => {
          const product = await getProductById(item.productId);
          return {
            ...item,
            product,
          };
        })
      );
      return enrichedItems;
    }),

    /**
     * Agregar producto al carrito
     */
    addItem: protectedProcedure
      .input(
        z.object({
          productId: z.number(),
          quantity: z.number().int().min(1).max(1000),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Verificar que el producto existe
        const product = await getProductById(input.productId);
        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Producto no encontrado",
          });
        }

        // No permitir agregar producto propio
        if (product.userId === ctx.user.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No puedes agregar tus propios productos al carrito",
          });
        }

        await addToCart(ctx.user.id, input.productId, input.quantity);
        return { success: true };
      }),

    /**
     * Actualizar cantidad en carrito
     */
    updateQuantity: protectedProcedure
      .input(
        z.object({
          cartItemId: z.number(),
          quantity: z.number().int().min(1).max(1000),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const items = await getCartItems(ctx.user.id);
        const item = items.find((i) => i.id === input.cartItemId);
        if (!item) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Producto no encontrado en carrito",
          });
        }

        await updateCartItemQuantity(input.cartItemId, input.quantity);
        return { success: true };
      }),

    /**
     * Eliminar producto del carrito
     */
    removeItem: protectedProcedure
      .input(z.object({ cartItemId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const items = await getCartItems(ctx.user.id);
        const item = items.find((i) => i.id === input.cartItemId);
        if (!item) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Producto no encontrado en carrito",
          });
        }

        await removeFromCart(input.cartItemId);
        return { success: true };
      }),

    /**
     * Limpiar carrito
     */
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await clearCart(ctx.user.id);
      return { success: true };
    }),
  }),

  /**
   * Pedidos y compras
   */
  orders: router({
    /**
     * Procesar pago simulado (sin Stripe)
     */
    processPayment: protectedProcedure
      .input(
        z.object({
          cardNumber: z.string(),
          cardHolder: z.string().min(1),
          expiryDate: z.string(),
          cvv: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Validar que el carrito no esté vacío
        const cartItems = await getCartItems(ctx.user.id);
        if (cartItems.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "El carrito está vacío",
          });
        }

        // Simular rechazo de tarjeta específica
        if (input.cardNumber === "4000000000000002") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Tarjeta rechazada. Intenta con otra tarjeta.",
          });
        }

        // Simular procesamiento de pago (1 segundo)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        return {
          success: true,
          transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          message: "Pago procesado exitosamente",
        };
      }),

    /**
     * Finalizar compra
     */
    checkout: protectedProcedure.mutation(async ({ ctx }) => {
      const cartItems = await getCartItems(ctx.user.id);
      if (cartItems.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "El carrito está vacío",
        });
      }

      // Calcular total
      let totalPrice = 0;
      const itemsWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await getProductById(item.productId);
          if (!product) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Producto no encontrado",
            });
          }
          const itemTotal = parseFloat(product.price.toString()) * item.quantity;
          totalPrice += itemTotal;
          return { item, product };
        })
      );

      // Verificar saldo
      const userBalance = await getUserBalance(ctx.user.id);
      if (!userBalance || parseFloat(userBalance.toString()) < totalPrice) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Saldo insuficiente para completar la compra",
        });
      }

      // Crear orden
      const orderResult = await createOrder(ctx.user.id, totalPrice.toFixed(2));
      const orderId = (orderResult as any).insertId as number;

      // Crear items de la orden y actualizar balances
      const sellerBalances: Record<number, number> = {};

      for (const { item, product } of itemsWithProducts) {
        const itemTotal = parseFloat(product.price.toString()) * item.quantity;

        // Crear item de orden
        await createOrderItem({
          orderId,
          productId: product.id,
          sellerId: product.userId,
          quantity: item.quantity,
          priceAtPurchase: product.price,
        });

        // Acumular saldo del vendedor
        if (!sellerBalances[product.userId]) {
          sellerBalances[product.userId] = 0;
        }
        sellerBalances[product.userId] += itemTotal;
      }

      // Actualizar saldo del comprador (restar)
      await subtractUserBalance(ctx.user.id, totalPrice);

      // Actualizar saldo de los vendedores (sumar)
      for (const [sellerId, amount] of Object.entries(sellerBalances)) {
        await addUserBalance(parseInt(sellerId), amount);
      }

      // Limpiar carrito
      await clearCart(ctx.user.id);

      return {
        success: true,
        orderId,
        totalPrice: totalPrice.toFixed(2),
      };
    }),

    /**
     * Obtener compras del usuario
     */
    myPurchases: protectedProcedure.query(async ({ ctx }) => {
      const orders = await getOrdersByBuyerId(ctx.user.id);
      const enrichedOrders = await Promise.all(
        orders.map(async (order) => {
          const items = await getOrderItemsByOrderId(order.id);
          const enrichedItems = await Promise.all(
            items.map(async (item) => {
              const product = await getProductById(item.productId);
              const seller = await getUserById(item.sellerId);
              return {
                ...item,
                product,
                seller,
              };
            })
          );
          return {
            ...order,
            items: enrichedItems,
          };
        })
      );
      return enrichedOrders;
    }),

    /**
     * Obtener ventas del usuario
     */
    mySales: protectedProcedure.query(async ({ ctx }) => {
      const sales = await getOrdersBySellerIdForSales(ctx.user.id);
      const enrichedSales = await Promise.all(
        sales.map(async (sale) => {
          const product = await getProductById(sale.productId);
          const seller = await getUserById(sale.sellerId);
          return {
            ...sale,
            product,
            seller,
          };
        })
      );
      return enrichedSales;
     }),
  }),

  /**
   * Administración (solo para admins)
   */
  admin: router({
    /**
     * Obtener todos los usuarios
     */
    getAllUsers: protectedProcedure.query(async ({ ctx }) => {
      // Verificar que el usuario es admin
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Solo administradores pueden ver los usuarios',
        });
      }
      return await getAllUsers();
    }),

    /**
     * Actualizar usuario
     */
    updateUser: protectedProcedure
      .input(
        z.object({
          userId: z.number(),
          name: z.string().optional(),
          email: z.string().email().optional(),
          balance: z.string().optional(),
          role: z.enum(['user', 'admin']).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Verificar que el usuario es admin
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Solo administradores pueden actualizar usuarios',
          });
        }

        const updates: Record<string, any> = {};
        if (input.name !== undefined) updates.name = input.name;
        if (input.email !== undefined) updates.email = input.email;
        if (input.balance !== undefined) updates.balance = input.balance;
        if (input.role !== undefined) updates.role = input.role;

        return await updateUser(input.userId, updates);
      }),

    /**
     * Eliminar usuario
     */
    deleteUser: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Verificar que el usuario es admin
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Solo administradores pueden eliminar usuarios',
          });
        }

        // No permitir que se elimine a sí mismo
        if (input.userId === ctx.user.id) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'No puedes eliminar tu propia cuenta',
          });
        }

        return await deleteUser(input.userId);
      }),

    /**
     * Crear Google Sheet con usuarios
     */
    createGoogleSheet: protectedProcedure.mutation(async ({ ctx }) => {
      // Verificar que el usuario es admin
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Solo administradores pueden crear Google Sheets',
        });
      }

      // Obtener usuarios
      const users = await getAllUsers();

      // Crear URL de Google Sheets con datos
      // Esta es una simulación - en producción usarías Google Sheets API
      const sheetData = users.map((u) => ({
        ID: u.id,
        Email: u.email || '',
        Nombre: u.name || '',
        Saldo: u.balance || '0',
        Rol: u.role || 'user',
        'Método Login': u.loginMethod || '',
        'Fecha Registro': new Date(u.createdAt).toLocaleDateString('es-ES'),
      }));

      // Simular creación de Google Sheet
      const sheetUrl = `https://docs.google.com/spreadsheets/d/1SimulatedSheetId/edit?usp=sharing`;

      return {
        sheetUrl,
        message: 'Google Sheet simulado. En producción, integra con Google Sheets API.',
        usersCount: users.length,
      };
    }),
  }),
});
export type AppRouter = typeof appRouter;
