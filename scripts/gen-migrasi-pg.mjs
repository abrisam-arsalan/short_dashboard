#!/usr/bin/env node
/**
 * Generate migration SQL PostgreSQL dari schema.prisma.
 * Otomatis: tukar provider → generate SQL → tukar balik.
 * Output: prisma/migrations_pg/migration.sql
 */
import { execSync } from "child_process";
import { mkdirSync, writeFileSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SCHEMA_PATH = join(ROOT, "prisma", "schema.prisma");
const OUT_DIR = join(ROOT, "prisma", "migrations_pg");

console.log("📝 Generating PostgreSQL migration SQL...");

// Baca schema asli
const original = readFileSync(SCHEMA_PATH, "utf8");

try {
  // Tukar ke postgresql
  writeFileSync(SCHEMA_PATH, original.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"'), "utf8");

  // Generate SQL
  const sql = execSync(
    `npx prisma migrate diff --from-empty --to-schema-datamodel "${SCHEMA_PATH}" --script`,
    { cwd: ROOT, encoding: "utf8" },
  );

  // Simpan
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, "migration.sql"), sql, "utf8");
  console.log(`✅ Migration SQL tersimpan di prisma/migrations_pg/migration.sql`);
} finally {
  // Tukar balik ke sqlite
  writeFileSync(SCHEMA_PATH, original, "utf8");
  console.log("🔄 Provider dikembalikan ke sqlite");
}
