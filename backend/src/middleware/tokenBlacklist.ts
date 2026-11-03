/**
 * In-memory token blacklist untuk invalidasi token saat logout.
 * Dipisah ke modul tersendiri untuk menghindari circular dependency.
 *
 * Catatan: Solusi ini cukup untuk single-instance. Di produksi multi-instance,
 * gunakan Redis atau penyimpanan terpusat.
 */

const blacklist = new Set<string>();

export function addToBlacklist(token: string): void {
  blacklist.add(token);
}

export function isTokenBlacklisted(token: string): boolean {
  return blacklist.has(token);
}
