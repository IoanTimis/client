/**
 * MobileMenu — collapsible navigation for small screens.
 *
 * Props
 * - open: boolean — controls visibility
 * - onClose: () => void — called when a link is clicked or menu should close
 * - items: Array<{ href: string; label: string; icon?: any }>
 * - isActive: (href: string) => boolean — determines active state for links
 * - authenticated: boolean — whether the user is logged in
 * - handleLogout: () => Promise<void> | void — handler for logout action
 * - role: string — user role (e.g., 'vendor') to conditionally show links
 */
"use client";
import React from "react";
import { Link as ALink } from "../../../ui/general/primitives";
import NavLink from "./nav-link";
import logout from "@/lib/auth/logout";
import { useLanguage } from "@/context/language-context";
import LanguageSwitcher from "@/components/ui/general/language-switcher";

export default function MobileMenu({ open, onClose, items, isActive, authenticated, handleLogout, role }) {
  const { t } = useLanguage();
  if (!open) return null;
  return (
    <div className="md:hidden border-t border-gray-800/50 bg-gray-900 text-white">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6 py-4">
        <nav className="grid gap-1">
          {/* Settings area (top) */}
          <div className="flex items-center justify-start py-1">
            <LanguageSwitcher />
          </div>
          <div className="h-px bg-white/10 my-2" />

          {items.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={t(`nav.${item.label.toLowerCase()}`)}
              icon={item.icon}
              active={isActive(item.href)}
              onClick={onClose}
              className="text-white hover:bg-white/10"
              activeClassName="bg-white/10"
            />
          ))}

          <div className="h-px bg-white/10 my-2" />
          {!authenticated ? (
            <>
              <ALink href="/auth/login" underline={false} onClick={onClose} className="text-sm px-3 py-2 rounded-md hover:bg-white/10 text-white">{t('nav.login')}</ALink>
              <ALink href="/auth/register" underline={false} onClick={onClose} className="text-sm px-3 py-2 rounded-md hover:bg-white/10 text-white">{t('nav.register')}</ALink>
            </>
          ) : (
            <>
              <ALink href="/user/profile" underline={false} onClick={onClose} className="text-sm px-3 py-2 rounded-md hover:bg-white/10 text-white">{t('nav.profile')}</ALink> 
              <ALink href="/user/review" underline={false} onClick={onClose} className="text-sm px-3 py-2 rounded-md hover:bg-white/10 text-white">{t('nav.review')}</ALink>
              {role === "admin" && (
              <ALink href="/admin" underline={false} onClick={onClose} className="text-sm px-3 py-2 rounded-md hover:bg-white/10 text-white">{t('nav.admin')}</ALink>
              )}
              <button
                type="button"
                onClick={() => {handleLogout(); onClose();}}
                className="text-left text-sm px-3 py-2 rounded-md hover:bg-white/10 text-white"
              >
                {t('nav.logout')}
              </button>
            </>
          )}
        </nav>
      </div>
    </div>
  );
}
