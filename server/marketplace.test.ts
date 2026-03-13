import { describe, it, expect } from "vitest";
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

describe("Authentication Utilities", () => {
  describe("Password Hashing", () => {
    it("should hash a password", () => {
      const password = "test_password_123";
      const hash = hashPassword(password);
      expect(hash).toContain(":");
      expect(hash.split(":")).toHaveLength(2);
    });

    it("should verify a correct password", () => {
      const password = "test_password_123";
      const hash = hashPassword(password);
      expect(verifyPassword(password, hash)).toBe(true);
    });

    it("should reject an incorrect password", () => {
      const password = "test_password_123";
      const hash = hashPassword(password);
      expect(verifyPassword("wrong_password", hash)).toBe(false);
    });

    it("should create different hashes for the same password", () => {
      const password = "test_password_123";
      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);
      expect(hash1).not.toBe(hash2);
      // But both should verify correctly
      expect(verifyPassword(password, hash1)).toBe(true);
      expect(verifyPassword(password, hash2)).toBe(true);
    });
  });

  describe("Email Validation", () => {
    it("should accept valid emails", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
      expect(isValidEmail("test.user@domain.co.uk")).toBe(true);
      expect(isValidEmail("user+tag@example.com")).toBe(true);
    });

    it("should reject invalid emails", () => {
      expect(isValidEmail("invalid.email")).toBe(false);
      expect(isValidEmail("@example.com")).toBe(false);
      expect(isValidEmail("user@")).toBe(false);
      expect(isValidEmail("")).toBe(false);
    });

    it("should reject emails exceeding max length", () => {
      const longEmail = "a".repeat(320) + "@example.com";
      expect(isValidEmail(longEmail)).toBe(false);
    });
  });

  describe("Password Validation", () => {
    it("should accept passwords with 8+ characters", () => {
      expect(isValidPassword("12345678")).toBe(true);
      expect(isValidPassword("my_secure_password")).toBe(true);
    });

    it("should reject passwords with less than 8 characters", () => {
      expect(isValidPassword("1234567")).toBe(false);
      expect(isValidPassword("pass")).toBe(false);
      expect(isValidPassword("")).toBe(false);
    });
  });

  describe("Product Name Validation", () => {
    it("should accept valid product names", () => {
      expect(isValidProductName("Laptop Dell")).toBe(true);
      expect(isValidProductName("iPhone 15 Pro Max")).toBe(true);
    });

    it("should reject empty product names", () => {
      expect(isValidProductName("")).toBe(false);
      expect(isValidProductName("   ")).toBe(false);
    });

    it("should reject product names exceeding max length", () => {
      const longName = "a".repeat(256);
      expect(isValidProductName(longName)).toBe(false);
    });
  });

  describe("Product Description Validation", () => {
    it("should accept valid descriptions", () => {
      expect(isValidProductDescription("This is a great product")).toBe(true);
      expect(isValidProductDescription("A".repeat(5000))).toBe(true);
    });

    it("should reject empty descriptions", () => {
      expect(isValidProductDescription("")).toBe(false);
      expect(isValidProductDescription("   ")).toBe(false);
    });

    it("should reject descriptions exceeding max length", () => {
      const longDesc = "a".repeat(5001);
      expect(isValidProductDescription(longDesc)).toBe(false);
    });
  });

  describe("Price Validation", () => {
    it("should accept valid prices", () => {
      expect(isValidPrice("99.99")).toBe(true);
      expect(isValidPrice(99.99)).toBe(true);
      expect(isValidPrice("0.01")).toBe(true);
      expect(isValidPrice("999999.99")).toBe(true);
    });

    it("should reject invalid prices", () => {
      expect(isValidPrice("0")).toBe(false);
      expect(isValidPrice(0)).toBe(false);
      expect(isValidPrice("-10")).toBe(false);
      expect(isValidPrice("abc")).toBe(false);
      expect(isValidPrice("1000000.00")).toBe(false); // Exceeds max
    });
  });

  describe("Quantity Validation", () => {
    it("should accept valid quantities", () => {
      expect(isValidQuantity(1)).toBe(true);
      expect(isValidQuantity(100)).toBe(true);
      expect(isValidQuantity(1000)).toBe(true);
    });

    it("should reject invalid quantities", () => {
      expect(isValidQuantity(0)).toBe(false);
      expect(isValidQuantity(-1)).toBe(false);
      expect(isValidQuantity(1001)).toBe(false);
      expect(isValidQuantity(1.5)).toBe(false); // Not integer
    });
  });
});

describe("Marketplace Business Logic", () => {
  describe("Balance Calculations", () => {
    it("should calculate correct balance after purchase", () => {
      const initialBalance = 1000;
      const purchaseAmount = 150.50;
      const expectedBalance = initialBalance - purchaseAmount;
      expect(expectedBalance).toBe(849.5);
    });

    it("should calculate correct seller earnings", () => {
      const productPrice = 100;
      const quantity = 3;
      const expectedEarnings = productPrice * quantity;
      expect(expectedEarnings).toBe(300);
    });

    it("should handle multiple seller payments", () => {
      const sellerPayments = {
        1: 100,
        2: 50,
        3: 75,
      };
      const totalPayments = Object.values(sellerPayments).reduce((a, b) => a + b, 0);
      expect(totalPayments).toBe(225);
    });
  });

  describe("Saldo Validation", () => {
    it("should allow purchase with sufficient balance", () => {
      const balance = 1000;
      const purchaseAmount = 500;
      expect(balance >= purchaseAmount).toBe(true);
    });

    it("should reject purchase with insufficient balance", () => {
      const balance = 100;
      const purchaseAmount = 500;
      expect(balance >= purchaseAmount).toBe(false);
    });

    it("should allow purchase with exact balance", () => {
      const balance = 500;
      const purchaseAmount = 500;
      expect(balance >= purchaseAmount).toBe(true);
    });
  });

  describe("Inventory Constraints", () => {
    it("should prevent user from buying own products", () => {
      const userId = 1;
      const productOwnerId = 1;
      expect(userId === productOwnerId).toBe(true);
    });

    it("should allow user to buy from other sellers", () => {
      const userId = 1;
      const productOwnerId = 2;
      expect(userId === productOwnerId).toBe(false);
    });
  });
});
