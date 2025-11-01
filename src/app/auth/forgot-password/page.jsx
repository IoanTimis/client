"use client";
import React, { useState } from "react";
import api from "@/lib/api/auth-api";
import { Div, Label, Input, Button, P, H2, H1 } from "@/components/ui/general/primitives";
import { useLanguage } from "@/context/language-context";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper: update value and clear any existing error
  const handleChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/password/request", { email });
      setSent(true);
    } catch (err) {
      // Răspunsul e generic, tratează și erorile generic în UI
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Div className="max-w-md mx-auto bg-stone-100" bordered padding="lg">
      <div className="text-center">
        <h1 className="text-black">{t('auth.forgot.title')}</h1>
      </div>
      {sent ? (
        <P className="mt-2 text-sm text-foreground/70">
          {t('auth.forgot.info')}
        </P>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={handleChange(setEmail)}
              placeholder={t('auth.emailPlaceholder')}
              required
            />
          </div>
          {error ? <P className="text-destructive text-sm text-red-600">{error}</P> : null}
          <Button type="submit" variant="empty-blue" disabled={loading} className="w-full">
            {loading ? t('auth.forgot.sending') : t('auth.forgot.sendLink')}
          </Button>
        </form>
      )}
    </Div>
  );
}
