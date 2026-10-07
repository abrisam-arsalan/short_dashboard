/**
 * Utilitas waktu — semua waktu disimpan UTC, UI menampilkan zona operator.
 */
import { formatInTimeZone } from "date-fns-tz";

const TZ_DEFAULT = "Asia/Jakarta";

function getTzOperator(): string {
  return process.env.TZ_OPERATOR || TZ_DEFAULT;
}

/** Format DateTime UTC → string di zona operator (default WIB) */
export function formatWaktuLokal(date: Date | null | undefined): string {
  if (!date) return "-";
  return formatInTimeZone(date, getTzOperator(), "dd MMM yyyy, HH:mm");
}

/** Format DateTime UTC → waktu saja (HH:mm) di zona operator */
export function formatJamLokal(date: Date | null | undefined): string {
  if (!date) return "-";
  return formatInTimeZone(date, getTzOperator(), "HH:mm");
}

/** Konversi menit UTC → string jam (HH:mm UTC) */
export function menitUtcKeJam(menit: number): string {
  const jam = Math.floor(menit / 60);
  const sisa = menit % 60;
  return `${String(jam).padStart(2, "0")}:${String(sisa).padStart(2, "0")} UTC`;
}

/** Konversi menit UTC → string jam di zona operator */
export function menitUtcKeJamLokal(menit: number): string {
  // Buat Date UTC dari menit
  const jam = Math.floor(menit / 60);
  const sisa = menit % 60;
  const date = new Date(Date.UTC(2024, 0, 1, jam, sisa, 0));
  return formatInTimeZone(date, getTzOperator(), "HH:mm");
}

/** Dapatkan tanggal hari ini dalam format YYYY-MM-DD (UTC) */
export function tanggalHariIniUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Dapatkan Date UTC dari menit sejak tengah malam (untuk hari ini) */
export function menitUtcToDate(menit: number): Date {
  const now = new Date();
  const date = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    Math.floor(menit / 60),
    menit % 60,
    0,
  ));
  return date;
}
