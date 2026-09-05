import { webcrypto } from "node:crypto";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export async function encryptHtml(html, password, options = {}) {
  if (!password) throw new Error("A non-empty password is required");
  const crypto = options.crypto || webcrypto;
  const iterations = options.iterations || 150_000;
  const salt = options.salt || crypto.getRandomValues(new Uint8Array(16));
  const iv = options.iv || crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(crypto, password, salt, iterations, ["encrypt"]);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(html));
  return {
    version: 1,
    iterations,
    salt: Buffer.from(salt).toString("base64"),
    iv: Buffer.from(iv).toString("base64"),
    ciphertext: Buffer.from(ciphertext).toString("base64"),
  };
}

export async function decryptHtml(payload, password, options = {}) {
  const crypto = options.crypto || webcrypto;
  const salt = Buffer.from(payload.salt, "base64");
  const iv = Buffer.from(payload.iv, "base64");
  const ciphertext = Buffer.from(payload.ciphertext, "base64");
  const key = await deriveKey(crypto, password, salt, payload.iterations, ["decrypt"]);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return decoder.decode(plaintext);
}

async function deriveKey(crypto, password, salt, iterations, usages) {
  const material = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, material, { name: "AES-GCM", length: 256 }, false, usages);
}
