/**
 * URL utilities
 * - API_BASE: public base URL for building absolute links (from NEXT_PUBLIC_API_URL)
 * - toAbsoluteUrl(url): returns absolute URL; if already absolute, returns as-is
 */
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Convert a relative URL (e.g. /uploads/xyz.jpg) to an absolute URL using API_BASE.
 * - If `url` is already absolute (http/https), returns it unchanged.
 * - On any error, returns the original `url`.
 */
export function toAbsoluteUrl(url) {
  try {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return new URL(url, API_BASE).toString();
  } catch {
    return url;
  }
}
