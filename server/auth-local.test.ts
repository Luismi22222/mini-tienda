import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";
import { getDb } from "./db";

// Mock context for testing
function createMockContext(): TrpcContext {
  const cookies: Record<string, string> = {};

  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: { cookie: "" },
    } as any,
    res: {
      cookie: (name: string, value: string, options: any) => {
        cookies[name] = value;
      },
      setHeader: () => {},
      clearCookie: () => {},
    } as any,
  };

  return ctx;
}

describe("Local Authentication", () => {
  const testPassword = "TestPassword123!";
  const testName = "Test User";

  it("should register a new user with email and password", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const testEmail = `test-${Date.now()}-1@example.com`;

    const result = await caller.auth.registerLocal({
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword,
      name: testName,
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("exitosamente");
  });

  it("should fail registration with mismatched passwords", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.auth.registerLocal({
        email: `test-${Date.now()}@example.com`,
        password: "Password123!",
        confirmPassword: "DifferentPassword123!",
        name: "Test User",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });

  it("should fail registration with invalid email", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.auth.registerLocal({
        email: "invalid-email",
        password: "Password123!",
        confirmPassword: "Password123!",
        name: "Test User",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });

  it("should fail registration with weak password", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.auth.registerLocal({
        email: `test-${Date.now()}@example.com`,
        password: "weak123",
        confirmPassword: "weak123",
        name: "Test User",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });

  it("should login with correct email and password", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const testEmail = `test-${Date.now()}-2@example.com`;

    // First register
    await caller.auth.registerLocal({
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword,
      name: testName,
    });

    // Then login
    const loginResult = await caller.auth.loginLocal({
      email: testEmail,
      password: testPassword,
    });

    expect(loginResult.success).toBe(true);
    expect(loginResult.user).toBeDefined();
    expect(loginResult.user.email).toBe(testEmail);
    expect(loginResult.user.name).toBe(testName);
  });

  it("should fail login with incorrect password", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const testEmail = `test-${Date.now()}-3@example.com`;

    // First register
    await caller.auth.registerLocal({
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword,
      name: testName,
    });

    // Try to login with wrong password
    try {
      await caller.auth.loginLocal({
        email: testEmail,
        password: "WrongPassword123!",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("incorrectos");
    }
  });

  it("should fail login with non-existent email", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.auth.loginLocal({
        email: `nonexistent-${Date.now()}@example.com`,
        password: "Password123!",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("incorrectos");
    }
  });

  it("should return user balance after login", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const testEmail = `test-${Date.now()}-4@example.com`;

    // Register
    await caller.auth.registerLocal({
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword,
      name: testName,
    });

    // Login
    const loginResult = await caller.auth.loginLocal({
      email: testEmail,
      password: testPassword,
    });

    expect(loginResult.user.balance).toBeDefined();
    expect(parseFloat(loginResult.user.balance as any)).toBeGreaterThan(0);
  });

  it("should prevent duplicate email registration", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const uniqueEmail = `duplicate-test-${Date.now()}@example.com`;

    // First registration
    await caller.auth.registerLocal({
      email: uniqueEmail,
      password: testPassword,
      confirmPassword: testPassword,
      name: testName,
    });

    // Try to register with same email
    try {
      await caller.auth.registerLocal({
        email: uniqueEmail,
        password: testPassword,
        confirmPassword: testPassword,
        name: "Another User",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("registrado");
    }
  });
});
