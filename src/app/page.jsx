"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";
import { Section, Button } from "@/components/ui/general/primitives";
import SubNavSearchBar from "@/components/ui/general/search/sub-nav-search-bar";
import FeatureCard from "@/components/ui/general/cards/feature-card";
import { RocketLaunchIcon, SparklesIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";
import { useLanguage } from "@/context/language-context";

export default function Home() {
  const { t } = useLanguage();
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const handleSearch = (query) => {
    const qStr = (query || "").trim();
    const target = qStr ? `/resources?q=${encodeURIComponent(qStr)}` : "/resources";
    router.push(target);
  };

  return (
    <div className="min-h-screen">
      {/* Hero — mobile variant (separate layout) */}
      <Section className="bg-white md:hidden">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-black">{t('home.welcome')}</p>
          <h1 className="text-3xl font-bold tracking-tight">{t('home.headline')}</h1>
          <p className="text-black">{t('home.sub')}</p>
          <div className="mt-2">
            <SubNavSearchBar
              value={q}
              onChange={setQ}
              onSubmit={handleSearch}
              placeholder={t('resources.searchPlaceholder')}
              className="col-span-10 w-full"
            />
          </div>
        </div>
      </Section>

      {/* Hero — desktop variant */}
      <Section className="bg-white hidden md:block">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <p className="text-xs uppercase tracking-wider text-black">{t('home.welcome')}</p>
            <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">{t('home.headline')}</h1>
            <p className="mt-3 text-black">{t('home.sub')}</p>
            <div className="mt-5 flex gap-3">
              <SubNavSearchBar
                value={q}
                onChange={setQ}
                onSubmit={handleSearch}
                placeholder={t('resources.searchPlaceholder')}
                className="flex-1"
              />
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/contact" className="inline-flex items-center rounded-md bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:opacity-90">{t('home.cta.contact')}</Link>
              <Link href="/about" className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-stone-200">{t('home.cta.learnMore')}</Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border-gray-300 bg-gray-900">
            <Image alt="Hero" src="/vercel.svg" fill className="object-contain p-8" priority />
          </div>
        </div>
      </Section>

      {/* Features */}
      <Section className="bg-stone-100 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <FeatureCard
            title={t('home.features.fast')}
            description={t('home.features.fastDesc')}
            icon={RocketLaunchIcon}
          />
          <FeatureCard
            title={t('home.features.ui')}
            description={t('home.features.uiDesc')}
            icon={SparklesIcon}
          />
          <FeatureCard
            title={t('home.features.secure')}
            description={t('home.features.secureDesc')}
            icon={ShieldCheckIcon}
          />
        </div>
      </Section>

      {/* CTA */}
      <Section className="bg-white">
        <div className="rounded-lg border border-foreground/10 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight">{t('home.cta.title')}</h2>
              <p className="mt-1 text-gray-700">{t('home.cta.desc')}</p>
            </div>
            <div className="flex gap-3">
              <Link href="/review" className="inline-flex items-center rounded-md bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:opacity-90">{t('home.cta.explore')}</Link>
              <Link href="/contact" className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-stone-200">{t('home.cta.contactUs')}</Link>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
