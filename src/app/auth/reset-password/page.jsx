"use client";
import React, { useMemo, useState } from "react";
import api from "@/lib/api/auth-api";
import { useSearchParams, useRouter } from "next/navigation";
import { Div, Label, Input, Button, P, H1 } from "@/components/ui/general/primitives";
import { useLanguage } from "@/context/language-context";

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => searchParams.get("token"), [searchParams]);
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  // Helper: update value and clear any existing error
  const handleChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError(null);
  };

  const submit = async (e) => {
    e.preventDefault();
  if (!token) return setError(t('auth.errors.tokenMissingOrInvalid'));
  if (pw1.length < 8) return setError(t('auth.errors.passwordMin'));
  if (pw1 !== pw2) return setError(t('auth.errors.passwordsMismatch'));

    setLoading(true);
    setError(null);
    try {
      await api.post("/password/confirm", { token, newPassword: pw1 });
      setDone(true);
      setTimeout(() => router.replace("/auth/login"), 1200);
    } catch (err) {
  setError(t('auth.errors.tokenInvalidOrExpired'));
    } finally {
      setLoading(false);
    }
  };

  // removed local onChange helper in favor of handleChange

  return (
    <Div className="max-w-md mx-auto mt-10 bg-stone-100" bordered padding="lg">
      <div className="text-center">
        <h1 className="text-black">{t('auth.reset.title')}</h1>
      </div>
      <P className="text-sm">{t('auth.reset.subtitle')}</P>
      <form onSubmit={submit} className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pw1">{t('auth.password')}</Label>
          <Input id="pw1" type="password" value={pw1} onChange={handleChange(setPw1)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pw2">{t('auth.confirmPassword')}</Label>
          <Input id="pw2" type="password" value={pw2} onChange={handleChange(setPw2)} required />
        </div>
        {error ? <P className="text-destructive text-sm text-red-600">{error}</P> : null}
        <Button type="submit" variant="empty-blue" disabled={loading || done} className="w-full">
          {loading ? t('auth.reset.setting') : done ? t('common.done') : t('auth.reset.submit')}
        </Button>
      </form>
    </Div>
  );
}
