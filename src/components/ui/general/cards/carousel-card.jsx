"use client";
import { useState, useMemo } from "react";
import Image from "next/image";

export default function ProductCardWithCarousel({
  images = [],
  title,
  price,
  rating = 5,
  ctaLabel = "Add to cart",
  onCta = () => {},
  href = "#",
}) {
  const [idx, setIdx] = useState(0);
  const safeImages = useMemo(() => (images.length ? images : ["/placeholder.png"]), [images]);
  const prev = () => setIdx((p) => (p - 1 + safeImages.length) % safeImages.length);
  const next = () => setIdx((p) => (p + 1) % safeImages.length);
  const goTo = (i) => setIdx(i);

  return (
  <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm">
      <a href={href} className="block relative h-56 md:h-72 overflow-hidden rounded-t-lg">
        {safeImages.map((src, i) => (
          <div
            key={src + i}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${i === idx ? "opacity-100" : "opacity-0"}`}
            aria-hidden={i !== idx}
          >
            <Image
              src={src}
              alt={title || "product image"}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 100vw, 384px"
              priority={i === 0}
            />
          </div>
        ))}

        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                prev();
              }}
              className="absolute top-0 start-0 z-10 flex items-center justify-center h-full px-3 group focus:outline-none"
              aria-label="Previous slide"
            >
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/30 group-hover:bg-white/50">
                <svg className="w-4 h-4 text-white rtl:rotate-180" viewBox="0 0 6 10" fill="none">
                  <path d="M5 1 1 5l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                next();
              }}
              className="absolute top-0 end-0 z-10 flex items-center justify-center h-full px-3 group focus:outline-none"
              aria-label="Next slide"
            >
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/30 group-hover:bg-white/50">
                <svg className="w-4 h-4 text-white rtl:rotate-180" viewBox="0 0 6 10" fill="none">
                  <path d="m1 9 4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>

            <div className="absolute z-10 flex -translate-x-1/2 bottom-3 left-1/2 space-x-2 rtl:space-x-reverse">
              {safeImages.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.preventDefault();
                    goTo(i);
                  }}
                  aria-label={`Slide ${i + 1}`}
                  aria-current={i === idx}
                  className={`w-2.5 h-2.5 rounded-full ${i === idx ? "bg-white" : "bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </a>

      <div className="px-5 pb-5">
        <a href={href}>
          <h5 className="text-xl font-semibold tracking-tight text-gray-900 line-clamp-2">{title}</h5>
        </a>

        <div className="flex items-center mt-2.5 mb-5">
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < Math.round(rating) ? "text-yellow-300" : "text-gray-300"}`}
                viewBox="0 0 22 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
              </svg>
            ))}
          </div>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-sm ms-3">
            {Number(rating).toFixed(1)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold text-gray-900">${price}</span>
          <button
            onClick={onCta}
            className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
