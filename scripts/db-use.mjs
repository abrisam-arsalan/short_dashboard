#!/usr/bin/env node
/**
 * Tukar provider Prisma antara SQLite (dev) dan PostgreSQL (prod).
 * Pakai: node scripts/db-use.mjs sqlite | postgresql
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = join(__dirname, "..", "prisma", "schema.prisma");

const target = process.argv[2];
if (!target || !["sqlite", "postgresql"].includes(target)) {
  console.error("Pakai: node scripts/db-use.mjs sqlite | postgresql");
  process.exit(1);
}

let content = readFileSync(SCHEMA_PATH, "utf8");

// Ganti baris provider di blok datasource
const regex = /provider\s*=\s*"(sqlite|postgresql)"/;
if (!regex.test(content)) {
  console.error("Tidak menemukan baris provider di schema.prisma");
  process.exit(1);
}

content = content.replace(regex, `provider = "${target}"`);
writeFileSync(SCHEMA_PATH, content, "utf8");

console.log(`✅ Provider Prisma diganti ke: ${target}`);
