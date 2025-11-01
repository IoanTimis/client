/**
 * AddCard — call-to-action card for creating a new item.
 *
 * Purpose
 * - Displays an image, title, description, and a CTA chip. Entire card is clickable.
 *
 * Props
 * - onClick: () => void — invoked when the card is clicked
 * - title?: string ("Adaugă produs") — title text
 * - description?: string ("Creează un produs nou") — supporting text
 * - imageSrc?: string ("/imgs/add.png") — decorative background image
 * - imageAlt?: string — alt text for the image
 * - ctaLabel?: string ("Adaugă") — CTA chip text
 * - className?: string — extra classes for the button wrapper
 * - icon?: React.ReactNode — optional leading icon (not currently rendered, reserved)
 *
 * Usage
 *   <AddCard
 *     onClick={() => setCreating(true)}
 *     title="Add product"
 *     description="Create a new listing"
 *     ctaLabel="Create"
 *   />
 */
import Image from "next/image";
import { useLanguage } from "@/context/language-context";

export default function HorizontalAddCard({
  onClick,
  title,
  description,
  imageSrc = "/imgs/add.png",
  imageAlt = "",
  ctaLabel,
  className = "",
  icon = null,
}) {
  const { t } = useLanguage();
  const resolvedTitle = title ?? t('addCard.title');
  const resolvedDescription = description ?? t('addCard.description');
  const resolvedCta = ctaLabel ?? t('addCard.cta');
  // Hardcoded demo values to visually align with product cards
  const hardcodedPrice = "000 lei";
  const hardcodedFeature = "Nou";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={resolvedTitle}
      className={`cursor-pointer text-left w-full bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow focus:outline-none ${className}`}
    >
      <div className="flex flex-col md:flex-row">
        <div className="relative w-full h-72 md:h-48 md:w-48 md:min-w-48 overflow-hidden rounded-t-lg md:rounded-none md:rounded-s-lg bg-gray-100">
          <Image
            src={imageSrc}
            alt={imageAlt || resolvedTitle}
            fill
            className="object-cover opacity-60"
            sizes="(max-width: 768px) 100vw, 12rem"
            priority
          />
        </div>
        <div className="flex flex-col w-full p-4 leading-normal min-h-[220px]">
          <h5 className="mb-1 text-lg md:text-xl font-semibold tracking-tight text-gray-900">
            {resolvedTitle}
          </h5>
          {/* Price (hardcoded for visual consistency) */}
          <div className="mb-2 text-lg font-semibold">{hardcodedPrice}</div>
          <p className="mb-4 text-sm text-gray-700">{resolvedDescription}</p>
          {/* One feature badge to mimic product cards */}
          <div className="mb-4 -mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-md border border-gray-200 bg-imo px-2 py-1 text-xs font-medium text-black">
              {hardcodedFeature}
            </span>
          </div>
          <div className="mt-auto w-full flex items-center gap-2 justify-start md:justify-end">
            <span className="px-4 py-2 text-sm font-semibold rounded-md text-white bg-blue-600">{resolvedCta}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
