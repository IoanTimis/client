/**
 * Image utilities
 * - DEFAULT_LANDSCAPE_PLACEHOLDER: shared fallback image path
 * - getFirstImageUrl(images, toAbsolute): derive first image absolute url with fallback
 */
import { toAbsoluteUrl } from "@/utils/url";

export const DEFAULT_LANDSCAPE_PLACEHOLDER = "/imgs/default_photos/landscape-placeholder.svg";

/**
 * From an array like [{url, alt}...], return an absolute URL for the first item if present,
 * or a shared placeholder otherwise.
 * Optionally pass a custom `makeAbsolute` function; defaults to toAbsoluteUrl.
 */
export function getFirstImageUrl(images, makeAbsolute = toAbsoluteUrl) {
  try {
    const url = images?.[0]?.url;
    const abs = makeAbsolute(url);
    return abs || DEFAULT_LANDSCAPE_PLACEHOLDER;
  } catch {
    return DEFAULT_LANDSCAPE_PLACEHOLDER;
  }
}
