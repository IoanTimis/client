/**
 * AuthForm — login/register form with basic client-side validation.
 *
 * Props
 * - type?: 'login' | 'register' ('login')
 * - onSubmit: (payload) => Promise<void> | void — called with { first_name?, name?, role, email, password }
 * - loading?: boolean — disables submit and shows spinner
 * - error?: string | null — global error message
 * - fieldErrors?: Record<string, string> — per-field error messages
 * - onClearFieldError?: (fieldName: string) => void — called on change to clear server-side field error
 */
"use client";
import React from "react";
import { Button, Input, Label, Div, Span, Link } from "../primitives";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../../animations/loading-spinner";
import { useLanguage } from "@/context/language-context";

export default function AuthForm({ type = "login", onSubmit, loading = false, error = null, fieldErrors = null, onClearFieldError = null, ...props }) {
  const { t } = useLanguage();
  const [form, setForm] = React.useState({ first_name: "", name: "", role: "client", email: "", password: "", confirmPassword: "" });
  const [localError, setLocalError] = React.useState(null);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    if (localError) setLocalError(null);
    onClearFieldError?.(name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (type === "register") {
      if (!form.first_name.trim()) {
        setLocalError(t('auth.errors.firstNameRequired'));
        return;
      }
      if (!form.name.trim()) {
        setLocalError(t('auth.errors.lastNameRequired'));
        return;
      }
      if (form.password.length < 8) {
        setLocalError(t('auth.errors.passwordMin'));
        return;
      }
      if (form.password !== form.confirmPassword) {
        setLocalError(t('auth.errors.passwordsMismatch'));
        return;
      }
    } else {
      if (!form.email || !form.password) {
        setLocalError(t('auth.errors.credentialsRequired'));
        return;
      }
      // fieldErrors este un obiect (ex. { email: "..." }) și va fi afișat lângă câmpuri, nu ca alert global
    }

    if (onSubmit) {
      const payload = {
        first_name: form.first_name?.trim() || undefined,
        name: form.name?.trim() || undefined,
        role: form.role,
        email: form.email?.trim(),
        password: form.password,
      };
      await onSubmit(payload);
    }
  };

  const shownError = typeof error === "string" ? error : (typeof localError === "string" ? localError : null);

  return (
    <form onSubmit={handleSubmit} className="space-y-4" {...props}>
      {shownError ? (
        <Div className="p-3 bg-red-100 text-red-800 border border-red-200 rounded" role="alert">
          <Span className="font-medium">{t('common.error')}</Span> {shownError}
        </Div>
      ) : null}
      {type === "login" ? (
      <div className="text-center">
        <h1 className="text-black">{t('auth.login')}</h1>
      </div>
      ) : (
        <div className="text-center">
          <h1 className="text-black">{t('auth.register')}</h1>
        </div>
      )}
      {/* username field removed - not present in user model */}
      {type === "register" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">{t('auth.firstName')}</Label>
            <Input id="first_name" name="first_name" type="text" placeholder={t('auth.firstNamePlaceholder')} required value={form.first_name} onChange={handleChange} />
            {fieldErrors?.first_name ? <p className="text-sm text-red-600">{fieldErrors.first_name}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">{t('auth.lastName')}</Label>
            <Input id="name" name="name" type="text" placeholder={t('auth.lastNamePlaceholder')} required value={form.name} onChange={handleChange} />
            {fieldErrors?.name ? <p className="text-sm text-red-600">{fieldErrors.name}</p> : null}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">{t('auth.email')}</Label>
        <Input id="email" name="email" type="email" placeholder={t('auth.emailPlaceholder')} required value={form.email} onChange={handleChange} autoComplete="email" />
        {fieldErrors?.email ? <p className="text-sm text-red-600">{fieldErrors.email}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t('auth.password')}</Label>
        <Input id="password" name="password" type="password" placeholder={t('auth.passwordPlaceholder')} required value={form.password} onChange={handleChange} autoComplete={type === "login" ? "current-password" : "new-password"} />
        {fieldErrors?.password ? <p className="text-sm text-red-600">{fieldErrors.password}</p> : null}
      </div>

      {type === "register" && (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" placeholder={t('auth.confirmPasswordPlaceholder')} required value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" />
        </div>
      )}

      {type === "register" && (
        <div className="space-y-2">
          <Label>{t('auth.role')}</Label>
          <div className="flex gap-4 items-center">
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="role" value="client" checked={form.role === "client"} onChange={handleChange} />
              <span className="text-black">{t('auth.client')}</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="role" value="vendor" checked={form.role === "vendor"} onChange={handleChange} />
              <span className="text-black">{t('auth.vendor')}</span>
            </label>
          </div>
        </div>
      )}

      <div className="pt-2">
        <Button type="submit" disabled={loading} variant="empty-blue" className="w-full inline-flex items-center justify-center gap-2">
          {loading ? (
            <>
              <LoadingSpinner className="w-4 h-4 text-current" />
              <span>{type === "register" ? t('auth.buttons.registering') : t('auth.buttons.loggingIn')}</span>
            </>
          ) : (
            <span>{type === "register" ? t('auth.register') : t('auth.login')}</span>
          )}
        </Button>
      </div>
      {type === "login" ? (
        <Div padding="none" className="flex items-center justify-between w-full">
          <Span className="text-sm">
            <Link href="/auth/register" underline={true} className="text-black">{t('auth.links.noAccount')}</Link>
          </Span>
          <Span className="text-sm">
            <Link href="/auth/forgot-password" underline={true} className="text-black">{t('auth.links.forgotPassword')}</Link>
          </Span>
        </Div>
      ) : type === "register" ? (
        <Div padding="none" className="space-y-1">
          <Span className="text-sm">
            <Link href="/auth/login" underline={true} className="text-black">{t('auth.links.haveAccount')}</Link>
          </Span>
        </Div>
      ) : null}
    </form>
  );
}
