"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Section, Input, Textarea, Button } from "@/components/ui/general/primitives";
import { useLanguage } from "@/context/language-context";

export default function ContactPage() {
  const { t } = useLanguage();
  const [form, setForm] = React.useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // TODO: integrate with backend endpoint e.g. /contact
      await new Promise((r) => setTimeout(r, 600));
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
  <Section className="bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <p className="text-xs uppercase tracking-wider text-black">{t('contact.kicker')}</p>
            <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">{t('contact.title')}</h1>
            <p className="mt-3 text-black">{t('contact.sub')}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/about" className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium bg-gray-900 text-white hover:opacity-90">{t('contact.aboutUs')}</Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border-gray-300 bg-gray-900">
            <Image alt="Contact" src="/vercel.svg" fill className="object-contain p-8" priority />
          </div>
        </div>
      </Section>

      {/* Form */}
  <Section className="bg-stone-100 rounded-2xl mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">{t('contact.form.name')}</label>
                <Input id="name" name="name" placeholder={t('contact.form.namePlaceholder')} value={form.name} onChange={handleChange} required />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">{t('contact.form.email')}</label>
                <Input id="email" name="email" type="email" placeholder={t('contact.form.emailPlaceholder')} value={form.email} onChange={handleChange} required />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">{t('contact.form.message')}</label>
                <Textarea id="message" name="message" rows={6} placeholder={t('contact.form.messagePlaceholder')} value={form.message} onChange={handleChange} required />
              </div>
              <div className="pt-2">
                <Button type="submit" variant="empty-blue" disabled={submitting}>
                  {submitting ? t('contact.form.sending') : t('contact.send')}
                </Button>
              </div>
              {sent && (
                <p className="text-sm text-emerald-600">{t('contact.form.sent')}</p>
              )}
            </form>
          </div>
          <div className="md:col-span-1">
            <div className="rounded-lg border border-foreground/10 p-4">
              <h3 className="text-base font-semibold">{t('contact.details')}</h3>
              <ul className="mt-2 space-y-2 text-sm text-gray-700">
                <li>Email: hello@example.com</li>
                <li>Phone: +40 700 000 000</li>
                <li>Address: Str. Exemplu 123, București</li>
              </ul>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
