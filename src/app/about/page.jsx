"use client";

import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/ui/general/primitives";
import FeatureCard from "@/components/ui/general/cards/feature-card";
import { RocketLaunchIcon, SparklesIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";
import { useLanguage } from "@/context/language-context";
import MapEmbed from "@/components/ui/general/maps/map-embed";

export default function AboutPage() {
	const { t } = useLanguage();
	return (
		<div className="min-h-screen">
			{/* Hero */}
			<Section className="bg-white">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
					<div>
						<p className="text-xs uppercase tracking-wider text-black">{t('about.kicker')}</p>
	            		<h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">{t('about.title')}</h1>
						<p className="mt-3 text-black">
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum vitae eros nec eros pharetra luctus. 
							Suspendisse potenti. Curabitur id diam vitae eros efficitur ultrices a nec quam.
						</p>
						<div className="mt-5 flex flex-wrap gap-3">
							<Link href="/contact" className="inline-flex items-center rounded-md bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:opacity-90">{t('about.cta.contact')}</Link>
							<Link href="/" className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-stone-200">{t('about.cta.work')}</Link>
						</div>
					</div>
					<div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border-gray-300 bg-gray-900">
						{/* Replace src with your image in /public and set proper sizes */}
						<Image alt="Office team" src="/vercel.svg" fill className="object-contain p-8" priority />
					</div>
				</div>
			</Section>

			{/* Features */}
					<Section className="bg-stone-100 rounded-2xl">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
						<FeatureCard
							title="Lorem ipsum"
							description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
							icon={RocketLaunchIcon}
						/>
						<FeatureCard
							title="Dolor sit amet"
							description="Aenean gravida, libero non lacinia feugiat, velit justo."
							icon={SparklesIcon}
						/>
						<FeatureCard
							title="Consectetur adipiscing"
							description="Praesent rutrum dui nec consequat fermentum."
							icon={ShieldCheckIcon}
						/>
								</div>
						</Section>

			{/* Story */}
					<Section className="bg-white">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="md:col-span-2">
							<h2 className="text-xl md:text-2xl font-semibold tracking-tight">{t('about.story.title')}</h2>
							<p className="mt-3 text-gray-700">
								Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer facilisis, ipsum non consequat volutpat, 
								diam ipsum egestas mi, non suscipit sapien mi quis lorem. Aliquam pulvinar augue ac massa faucibus, 
								et malesuada nunc consequat. Integer at placerat lectus. Etiam sagittis, mi sed pretium bibendum, 
								velit elit faucibus neque, a porttitor urna eros at orci.
							</p>
							<p className="mt-3 text-gray-700">
								Sed fermentum rutrum magna, id ultrices leo tempor sed. Donec at placerat justo. Nulla facilisi. 
								Maecenas a lectus id mauris rhoncus vehicula vitae ut sapien.
							</p>
						</div>
						<div className="md:col-span-1">
							<div className="rounded-lg border border-foreground/10 p-4">
								<h3 className="text-base font-semibold">{t('about.facts.title')}</h3>
								<ul className="mt-2 space-y-2 text-sm text-gray-700 list-disc list-inside">
									<li>Founded in 2024</li>
									<li>Remote-first team</li>
									<li>Open-source friendly</li>
								</ul>
							</div>
									</div>
								</div>
						</Section>

			{/* Map */}
			<Section className="bg-stone-100 rounded-2xl mb-10">
				<h2 className="text-xl md:text-2xl font-semibold tracking-tight mb-4">{t('about.map.title') || 'Unde ne găsești'}</h2>
				<MapEmbed
					centerLat={45.757}
					centerLng={21.2301}
					zoom={16}
					label="Haufe Group - Iulius Town, Timișoara"
					query="Haufe Group România, UBC 0, Piața Consiliul Europei 2, Timișoara"
					className="bg-white"
					height="h-[420px]"
				/>
				{/* <div className="h-4" />
				<h3 className="text-base font-semibold mb-2">OpenStreetMap</h3>
				<MapEmbed
					provider="osm"
					centerLat={45.757}
					centerLng={21.2301}
					zoom={16}
					label="Haufe Group - Iulius Town, Timișoara"
					className="bg-white"
					height="h-[420px]"
				/> */}
			</Section>
		</div>
	);
}

