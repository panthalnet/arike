/**
 * Client-side wallpaper CSS cache.
 * Stores the active wallpaper CSS value (gradient string or url(...)) in
 * localStorage so it can be applied immediately on page load without waiting
 * for the /api/wallpapers fetch to complete.
 */

export const WALLPAPER_CACHE_KEY = 'arike:active-wallpaper-css'

export function getCachedWallpaper(): string | null {
  try {
    return localStorage.getItem(WALLPAPER_CACHE_KEY)
  } catch {
    return null
  }
}

export function setCachedWallpaper(value: string | null) {
  try {
    if (value) {
      localStorage.setItem(WALLPAPER_CACHE_KEY, value)
    } else {
      localStorage.removeItem(WALLPAPER_CACHE_KEY)
    }
  } catch {
    // localStorage unavailable (private browsing etc.) — non-fatal
  }
}
