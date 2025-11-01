"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

import { DEFAULT_LANDSCAPE_PLACEHOLDER } from "@/utils/images";
const FALLBACK = DEFAULT_LANDSCAPE_PLACEHOLDER;

/**
 * GalleryCarousel — dependency-free carousel with thumbnails.
 *
 * Props
 * - images: Array<{ src: string; alt?: string }>
 * - initialIndex?: number (0)
 * - autoplay?: boolean (true)
 * - interval?: number ms (4000)
 * - loop?: boolean (true)
 * - showThumbs?: boolean (true)
 * - className?: string
 * - heightClasses?: string — tailwind classes controlling height by breakpoints
 */
export default function GalleryCarousel({
	images = [],
	initialIndex = 0,
	autoplay = true,
	interval = 4000,
	loop = true,
	showThumbs = true,
	className = "",
	heightClasses = "h-[240px] sm:h-[300px] md:h-[420px] lg:h-[480px]",
}) {
	const list = useMemo(() => (Array.isArray(images) && images.length ? images : [{ src: FALLBACK, alt: "placeholder" }]), [images]);
	const [index, setIndex] = useState(() => Math.min(Math.max(0, initialIndex), list.length - 1));
	const [hovered, setHovered] = useState(false);
	const timerRef = useRef(null);

	const goPrev = () => {
		setIndex((i) => {
			if (i > 0) return i - 1;
			return loop ? (list.length - 1) : 0;
		});
	};
	const goNext = () => {
		setIndex((i) => {
			if (i < list.length - 1) return i + 1;
			return loop ? 0 : (list.length - 1);
		});
	};

	useEffect(() => {
		if (!autoplay || hovered || list.length <= 1) return;
		timerRef.current = setInterval(() => {
			setIndex((i) => (i + 1) % list.length);
		}, Math.max(1500, interval));
		return () => { if (timerRef.current) clearInterval(timerRef.current); };
	}, [autoplay, hovered, interval, list.length]);

	// Ensure index stays in bounds when images change
	useEffect(() => {
		setIndex((i) => Math.min(Math.max(0, i), list.length - 1));
	}, [list.length]);

	const canPrev = loop || index > 0;
	const canNext = loop || index < list.length - 1;

	return (
		<div className={`w-full border-0 pb-4 rounded-2xl bg-stone-100 ${className}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
			{/* Main viewer */}
			<div className={`relative w-full ${heightClasses} overflow-hidden rounded-xl bg-stone-100`}>
				{list.map((img, i) => (
					<div
						key={i}
						className={`absolute inset-0 transition-opacity duration-500 ${i === index ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
						aria-hidden={i !== index}
					>
						<Image
							src={img.src || FALLBACK}
							alt={img.alt ?? `image-${i + 1}`}
							fill
							className="object-contain object-center"
							sizes="100vw"
							priority={i === index}
							unoptimized
						/>
					</div>
				))}

				{/* Arrows */}
				<button
					type="button"
					aria-label="Previous image"
					onClick={goPrev}
					disabled={!canPrev}
					className={`absolute left-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/40 text-white hover:bg-black/60 transition ${!canPrev ? 'opacity-50 cursor-not-allowed' : ''}`}
				>
					‹
				</button>
				<button
					type="button"
					aria-label="Next image"
					onClick={goNext}
					disabled={!canNext}
					className={`absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/40 text-white hover:bg-black/60 transition ${!canNext ? 'opacity-50 cursor-not-allowed' : ''}`}
				>
					›
				</button>

				{/* Dots */}
				{list.length > 1 ? (
					<div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/20 rounded-full px-2 py-1">
						{list.map((_, i) => (
							<button
								key={i}
								aria-label={`Go to slide ${i + 1}`}
								onClick={() => setIndex(i)}
								className={`w-2.5 h-2.5 rounded-full ${i === index ? 'bg-white' : 'bg-white/60 hover:bg-white'}`}
							/>
						))}
					</div>
				) : null}
			</div>

			{/* Thumbnails */}
			{showThumbs && list.length > 1 ? (
				<div className="mt-3 overflow-x-auto scrollbar-stone">
					<div className="flex gap-2 min-w-max pr-2">
						{list.map((img, i) => (
							<button
								key={i}
								type="button"
								onClick={() => setIndex(i)}
								className={`relative flex-shrink-0 rounded border ${i === index ? 'ring-2 ring-blue-600' : 'border-gray-200'} w-20 h-20 md:w-24 md:h-24 overflow-hidden`}
								aria-label={`thumb-${i + 1}`}
								title={img.alt || `thumb-${i + 1}`}
							>
								<Image
									src={img.src || FALLBACK}
									alt={img.alt ?? `thumb-${i + 1}`}
									fill
									className="object-cover"
									sizes="96px"
									unoptimized
								/>
							</button>
						))}
					</div>
				</div>
			) : null}
		</div>
	);
}
