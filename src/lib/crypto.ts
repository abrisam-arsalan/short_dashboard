/**
 * Utilitas enkripsi AES-256-GCM untuk credential vault.
 * Key dari env ENCRYPTION_KEY (32-byte hex / 64 karakter).
 */
import crypto from "crypto";

const ALGORITMA = "aes-256-gcm";

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error("ENCRYPTION_KEY harus 64 karakter hex (32 byte). Generate: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"");
  }
  return Buffer.from(hex, "hex");
}

export interface HasilEnkripsi {
  ciphertext: string; // base64
  iv: string; // base64
  tag: string; // base64
}

/** Enkripsi teks → { ciphertext, iv, tag } semua base64 */
export function enkripsi(teks: string): HasilEnkripsi {
  const key = getKey();
  const iv = crypto.randomBytes(12); // 96-bit IV untuk GCM
  const cipher = crypto.createCipheriv(ALGORITMA, key, iv);
  const terenkripsi = Buffer.concat([cipher.update(teks, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    ciphertext: terenkripsi.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
  };
}

/** Dekripsi { ciphertext, iv, tag } → teks asli */
export function dekripsi(data: HasilEnkripsi): string {
  const key = getKey();
  const iv = Buffer.from(data.iv, "base64");
  const tag = Buffer.from(data.tag, "base64");
  const decipher = crypto.createDecipheriv(ALGORITMA, key, iv);
  decipher.setAuthTag(tag);
  const terdekripsi = Buffer.concat([
    decipher.update(Buffer.from(data.ciphertext, "base64")),
    decipher.final(),
  ]);
  return terdekripsi.toString("utf8");
}
