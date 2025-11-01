/**
 * Number/format utilities
 * - formatPrice(value, options): format numeric price with 2 decimals or return as-is if not numeric.
 */

/**
 * Format a price-like value.
 * - If `value` is a finite number or numeric string, returns with 2 decimals (defaults).
 * - Otherwise returns the original value as string.
 */
export function formatPrice(value, { decimals = 2 } = {}) {
  const num = typeof value === "string" ? Number(value) : value;
  if (typeof num === "number" && Number.isFinite(num)) {
    return num.toFixed(decimals);
  }
  return String(value ?? "");
}
