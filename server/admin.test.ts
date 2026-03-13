import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

type AdminUser = User & { role: 'admin' };

function createAdminContext(): TrpcContext {
  const adminUser: AdminUser = {
    id: 999,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "local",
    role: "admin",
    passwordHash: "hashed",
    balance: "10000",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user: adminUser,
    req: {
      protocol: "https",
      headers: {},
    } as any,
    res: {
      cookie: () => {},
      setHeader: () => {},
      clearCookie: () => {},
    } as any,
  };

  return ctx;
}

function createUserContext(): TrpcContext {
  const regularUser: User = {
    id: 1,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "local",
    role: "user",
    passwordHash: "hashed",
    balance: "100",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user: regularUser,
    req: {
      protocol: "https",
      headers: {},
    } as any,
    res: {
      cookie: () => {},
      setHeader: () => {},
      clearCookie: () => {},
    } as any,
  };

  return ctx;
}

describe("Admin Panel", () => {
  it("should allow admin to get all users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const users = await caller.admin.getAllUsers();

    expect(Array.isArray(users)).toBe(true);
  });

  it("should deny non-admin from getting all users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.getAllUsers();
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("administrador");
    }
  });

  it("should allow admin to update user", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.updateUser({
      userId: 1,
      name: "Updated Name",
    });

    expect(result).toBeDefined();
  });

  it("should deny non-admin from updating user", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.updateUser({
        userId: 1,
        name: "Updated Name",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("administrador");
    }
  });

  it("should allow admin to delete user", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.deleteUser({
      userId: 1,
    });

    expect(typeof result).toBe("boolean");
  });

  it("should deny non-admin from deleting user", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.deleteUser({
        userId: 1,
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("administrador");
    }
  });

  it("should prevent admin from deleting themselves", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.deleteUser({
        userId: 999, // Same as admin user ID
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("propia");
    }
  });
});
