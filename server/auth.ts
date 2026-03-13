import crypto from "crypto";

/**
 * Hash una contraseña usando PBKDF2
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verificar una contraseña contra su hash
 */
export function verifyPassword(password: string, passwordHash: string): boolean {
  const [salt, hash] = passwordHash.split(":");
  if (!salt || !hash) return false;
  
  const hashToVerify = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha256").toString("hex");
  return hash === hashToVerify;
}

/**
 * Validar formato de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 320;
}

/**
 * Validar contraseña (mínimo 8 caracteres)
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Validar nombre de producto
 */
export function isValidProductName(name: string): boolean {
  return name.trim().length > 0 && name.length <= 255;
}

/**
 * Validar descripción de producto
 */
export function isValidProductDescription(description: string): boolean {
  return description.trim().length > 0 && description.length <= 5000;
}

/**
 * Validar precio (debe ser número positivo)
 */
export function isValidPrice(price: string | number): boolean {
  const priceNum = typeof price === "string" ? parseFloat(price) : price;
  return !isNaN(priceNum) && priceNum > 0 && priceNum <= 999999.99;
}

/**
 * Validar cantidad (debe ser número positivo)
 */
export function isValidQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity > 0 && quantity <= 1000;
}

/**
 * Sanitizar string para evitar XSS
 */
export function sanitizeString(str: string): string {
  return str.trim().slice(0, 5000);
}
