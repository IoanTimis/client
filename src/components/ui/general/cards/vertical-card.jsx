/**
 * VerticalCard — media-top, content-bottom.
 * API identic cu HorizontalCard (vezi comentariul din fișierul tău).
 */
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/general/primitives/button";
import { truncateText } from "@/utils/text";
import { useLanguage } from "@/context/language-context";

export default function VerticalCard({
  href = "#",
  imageSrc = "/imgs/missingPhoto/placeholder-light-16x9.svg",
  imageAlt = "",
  title = "Noteworthy technology acquisitions 2021",
  description = "Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.",
  price,
  features = [],
  actions = [],
  // Controls
  maxTitleChars = 41,
  maxDescriptionChars = 97,
}) {
  const { t } = useLanguage?.() || { t: (k) => k };

  const normalizeBool = (v) => {
    if (typeof v === "boolean") return v;
    if (v == null) return undefined;
    const s = String(v).trim().toLowerCase();
    if (["true", "1", "da", "yes", "y"].includes(s)) return true;
    if (["false", "0", "nu", "no", "n"].includes(s)) return false;
    return undefined;
  };

  const formatFeatureLabel = (f) => {
    if (typeof f === "string") return f;
    const rawName = String(f?.name || "").trim();
    const value = f?.value;
    if (!rawName && !value) return "";
    const name = rawName.toLowerCase();

    // Handle "new" / "nou" boolean — show Nou/Folosit
    if (["new", "nou"].includes(name)) {
      const b = normalizeBool(value);
      if (b === true) return t("resource.features.new") || "Nou";
      if (b === false) return t("resource.features.used") || "Folosit";
      return ""; // if not a recognizable boolean, hide
    }

    // Handle surface/suprafata and level/etaj — show value only
    if (["surface", "suprafata", "suprafață"].includes(name)) {
      return value ? String(value) : "";
    }
    if (["level", "etaj"].includes(name)) {
      return value ? String(value) : "";
    }

    // Default: name: value (if at least one exists)
    const labelName = rawName || "";
    const labelValue = value != null && String(value).length ? String(value) : "";
    const label = [labelName, labelValue].filter(Boolean).join(": ");
    return label;
  };
  const renderAction = (
    { label, href, onClick, variant = "primary", icon, ariaLabel, target, rel, disabled },
    i
  ) => {
    const iconOnly = !label && !!icon;
    const content = (
      <>
        {icon}
        {label ? <span>{label}</span> : null}
      </>
    );
    const commonProps = {
      variant,
      size: iconOnly ? "sm" : "md",
      "aria-label": ariaLabel || label,
      disabled,
      className: disabled ? "opacity-60 pointer-events-none" : undefined,
    };
    if (href) {
      return (
        <Button
          key={i}
          as={Link}
          href={href}
          target={target}
          rel={rel}
          aria-disabled={disabled ? true : undefined}
          {...commonProps}
        >
          {content}
        </Button>
      );
    }
    return (
      <Button key={i} onClick={onClick} {...commonProps}>
        {content}
      </Button>
    );
  };

  return (
  <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Imagine sus */}
      <Link href={href} className="block">
        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-t-lg">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
      </Link>

      {/* Conținut */}
      {/*
        Fixed content height to avoid different card heights across a row.
        Adjust min-h to suit your design density.
      */}
      <div className="flex flex-col p-4 leading-normal text-black min-h-[220px]">
        {/* Titlu (link) */}
        <Link href={href} className="block">
          <h5 className="mb-1 text-lg font-semibold tracking-tight text-black line-clamp-2">
            {truncateText(title, maxTitleChars)}
          </h5>
        </Link>

        {/* Preț sus (mobil style) */}
        {price !== undefined && price !== null && String(price).length > 0 ? (
          <div className="mb-2 text-lg font-semibold">
            {typeof price === "number" ? price.toFixed(2) : price}
          </div>
        ) : null}

        {/* Descriere */}
        {description ? (
          <p className="mb-3 text-sm text-gray-700 line-clamp-2">{truncateText(description, maxDescriptionChars)}</p>
        ) : null}

        {/* Badge-uri — toate, cu scroll orizontal */}
        {Array.isArray(features) && features.length > 0 ? (
          <div className="-mt-1 mb-3 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max pr-2">
            {features.map((f, i) => {
              const label = formatFeatureLabel(f);
              if (!label) return null;
              return (
                <span
                  key={i}
                  className="inline-flex items-center rounded-md border border-gray-200 bg-imo px-2 py-1 text-xs font-medium text-gray-900"
                >
                  {label}
                </span>
              );
            })}
            </div>
          </div>
        ) : null}

        {/* Acțiuni — aliniate la dreapta */}
        <div className="mt-auto w-full flex flex-wrap items-center gap-2 justify-end">
          {actions?.map(renderAction)}
        </div>
      </div>
    </div>
  );
}
