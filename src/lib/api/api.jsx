import axios from "axios";
import { store, persistor } from "@/store/page";
import { setUser, clearUser } from "@/store/features/user/user-slice";
import { jwtDecode } from "jwt-decode";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const AxiosInstance = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

// Keep AxiosInstance.defaults.headers.common.Authorization in sync with Redux store.
// This avoids occasional races where a request is sent before the header is updated.
let currentToken = store.getState()?.user?.accessToken;
if (currentToken) {
  AxiosInstance.defaults.headers.common["Authorization"] = `Bearer ${currentToken}`;
}

store.subscribe(() => {
  try {
    const nextToken = store.getState()?.user?.accessToken;
    if (nextToken !== currentToken) {
      currentToken = nextToken;
      if (nextToken) {
        AxiosInstance.defaults.headers.common["Authorization"] = `Bearer ${nextToken}`;
      } else {
        // remove header when user logs out
        delete AxiosInstance.defaults.headers.common["Authorization"];
      }
    }
  } catch (e) {
    // ignore during SSR or weird store states
  }
});

// Single-flight refresh logic: queue requests while a refresh is in progress so we
// only call /refresh once and then replay queued requests with the new token.
let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb);
}

AxiosInstance.interceptors.request.use(
  (request) => {
    // Ensure request has Authorization header when token present in defaults.
    // Most requests will already get header from defaults; this keeps parity.
    try {
      const accessToken = store.getState()?.user?.accessToken;
      if (accessToken && !request.headers?.Authorization) {
        request.headers = request.headers || {};
        request.headers["Authorization"] = `Bearer ${accessToken}`;
      }
    } catch (e) {
      // ignore
    }
    return request;
  },
  (error) => Promise.reject(error)
);

AxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If there's no response (network error), just reject it.
    if (!error.response) return Promise.reject(error);

    const status = error.response.status;

    // don't attempt refresh for refresh endpoint itself to avoid loops
    if (originalRequest && originalRequest.url && originalRequest.url.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    if (status === 401) {
      // If we've already retried this request, reject to avoid infinite loop
      if (originalRequest._retry) return Promise.reject(error);
      originalRequest._retry = true;

      if (isRefreshing) {
        // queue the request until refresh completes
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((token) => {
            if (token) {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              resolve(AxiosInstance(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      isRefreshing = true;

      try {
        const response = await axios.post(
          `${apiUrl}/auth/refresh`,
          {},
          { withCredentials: true, timeout: 10000 }
        );

        const { accessToken } = response.data || {};

        if (!accessToken) {
          throw new Error("Refresh token response missing access token");
        }

        let decoded = null;
        try {
          decoded = jwtDecode(accessToken);
        } catch (e) {
          // If token decoding fails, still set token so requests can continue,
          // but clear user to be safe
          console.error("Failed to decode access token:", e);
        }

        // update Redux store with new token and user data (if decoded)
        store.dispatch(setUser({ data: decoded, accessToken }));
        localStorage.setItem('accessToken', accessToken);

        // update axios defaults and notify queued requests
        AxiosInstance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        onRefreshed(accessToken);

        // retry original request with new token
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return AxiosInstance(originalRequest);
      } catch (refreshError) {
        // notify subscribers of failure
        onRefreshed(null);
        console.error("Token refresh failed:", refreshError);
        try {
          store.dispatch(clearUser());
        } catch (e) {
          // ignore
        }
        // optionally purge persisted store to remove stale tokens
        try {
          if (persistor?.purge) persistor.purge();
        } catch (e) {
          // ignore
        }
        isRefreshing = false;
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For other status codes just reject
    return Promise.reject(error);
  }
);

export default AxiosInstance;