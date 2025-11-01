/**
 * Auth utilities
 * - useAuthUser(): Redux selector hook to get the authenticated user info from state.user.info
 */
import { useSelector } from "react-redux";

export function useAuthUser() {
  return useSelector((s) => s?.user?.info);
}
