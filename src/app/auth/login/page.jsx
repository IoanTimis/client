"use client";
import React, { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthForm } from "@/components/ui/general/forms";
import { Div, Link as ALink, P } from "@/components/ui/general/primitives";
import { login } from "@/lib/api/auth-api";
import { useDispatch } from "react-redux";
import { setError, clearError } from "@/store/features/error/error-slice";
import { setUser } from "@/store/features/user/user-slice";
import { jwtDecode } from "jwt-decode";
import { useLanguage } from "@/context/language-context";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState(null);
  const dispatch = useDispatch();

  const nextPath = useMemo(() => {
    const n = searchParams?.get("next");
    // Allow only internal, relative paths; avoid open redirects
    if (n && n.startsWith("/") && !n.startsWith("//")) return n;
    return null;
  }, [searchParams]);

  const redirectAfterLogin = (fallback = "/") => {
    router.replace(nextPath || fallback);
  };

  const handleLogin = async (data) => {
    setLoading(true);
    dispatch(clearError());
    setFieldErrors(null);

    try {
      const response = await login(data, { raw: true }); 

      if (response.status === 204 || !response.data?.accessToken) {
        setFieldErrors({ email: t('auth.errors.invalidCredentials') });
        return;
      }

      const { accessToken } = response.data;
      if (accessToken) {
        const decoded = jwtDecode(accessToken);
        dispatch(setUser({ data: decoded, accessToken }));
        localStorage.setItem('accessToken', accessToken);
        redirectAfterLogin();
      } else {
        setFieldErrors({ email: t('auth.errors.invalidCredentials') });
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || t('common.genericError');
      dispatch(setError(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleClearFieldError = (name) => {
          setFieldErrors((prev) => {
            if (!prev) return prev;
            const next = { ...prev };
            delete next[name];
            return Object.keys(next).length ? next : null;
          });
        }

  return (
    <Div bordered padding="lg" className="bg-stone-100">
      <AuthForm
        type="login"
        onSubmit={handleLogin}
        loading={loading}
        fieldErrors={fieldErrors}
        onClearFieldError={handleClearFieldError}
      />
    </Div>
  );
}
