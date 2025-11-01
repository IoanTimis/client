import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// returnează fie response.data (implicit), fie response complet când raw=true
export async function login(payload, { raw = false } = {}) {
  const response = await api.post("/auth/login", payload);
  return raw ? response : response.data;
}

export async function register(payload, { raw = false } = {}) {
  const response = await api.post("/auth/register", payload);
  return raw ? response : response.data;
}

export default api;