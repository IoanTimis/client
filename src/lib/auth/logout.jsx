import api from '@/lib/api/api';
import { store, persistor } from '@/store/page';
import { clearUser } from '@/store/features/user/user-slice';
import { clearError } from '@/store/features/error/error-slice';

/**
 * Reusable logout helper.
 * - Calls server logout to clear httpOnly refresh cookie (best-effort)
 * - Clears local access token, Redux user and error slices
 * - Removes axios Authorization default header
 * - Purges redux-persist (best-effort)
 *
 * Usage:
 * import logout from '@/lib/auth/logout';
 * await logout();
 * // optionally redirect after
 */
export default async function Logout() {
  // attempt server logout (may fail but we continue cleaning client state)
  try {
    await api.post('/auth/logout');
  } catch (e) {
    console.warn('Logout request failed', e);
  }

  try { localStorage.removeItem('accessToken'); } catch (e) { /* ignore */ }

  try {
    store.dispatch(clearUser());
  } catch (e) {
    console.warn('Failed to dispatch clearUser', e);
  }

  try {
    store.dispatch(clearError());
  } catch (e) {
    // ignore
  }

  try {
    if (api && api.defaults && api.defaults.headers && api.defaults.headers.common) {
      delete api.defaults.headers.common['Authorization'];
    }
  } catch (e) { /* ignore */ }

  try {
    if (persistor && typeof persistor.purge === 'function') {
      await persistor.purge();
    }
  } catch (e) {
    console.warn('Persistor purge failed', e);
  }

  // Redirect to auth page after logout completes (client-side only)
  try {
    if (typeof window !== 'undefined') {
      window.location.assign('/auth/login');
    }
  } catch (e) {
    // ignore
  }
}
