/**
 * HorizontalCard — media-left, content-right card with actions.
 *
 * Purpose
 * - Show an image on the left (mobile: top), title, optional price and description,
 *   up to two feature badges, and one or more actions (links or buttons).
 *
 * Props
 * - href?: string ("#") — Link target for the image/title area.
 * - imageSrc?: string — Image URL (absolute or relative). Defaults to a placeholder.
 * - imageAlt?: string — Alt text for the image.
 * - title: string — Card title.
 * - description?: string — Optional secondary text.
 * - price?: number | string — If provided, displayed above the description.
 * - features?: Array<string | { name: string; value?: string }>
 *   Up to two are displayed as badges (name: value).
 * - actions?: Array<{
 *     label?: string;
 *     href?: string; // if present, renders a Link; otherwise renders a button
 *     onClick?: (e: React.MouseEvent) => void;
 *     variant?: 'primary' | 'secondary' | 'destructive';
 *     icon?: React.ReactNode;
 *     ariaLabel?: string;
 *     target?: string;
 *     rel?: string;
 *     disabled?: boolean;
 *   }>
 *
 * Usage
 *   <HorizontalCard
 *     href={`/products/${id}`}
 *     imageSrc={firstImage}
 *     imageAlt={name}
 *     title={name}
 *     price={`${Number(price).toFixed(2)} lei`}
 *     description={shortDescription}
 *     features={[{ name: 'Camere', value: '3' }, { name: 'Suprafață', value: '65m²' }]}
 *     actions={[
 *       { label: 'Cumpără', variant: 'primary', onClick: handleBuy },
 *       { label: 'Detalii', href: `/products/${id}`, variant: 'secondary' },
 *     ]}
 *   />
 */
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/general/primitives/button";
import { useLanguage } from "@/context/language-context";

export default function HorizontalCard({
  href = "#",
  imageSrc = "/imgs/missingPhoto/placeholder-dark-1x1.svg",
  imageAlt = "",
  title = "Noteworthy technology acquisitions 2021",
  description = "Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.",
  price,
  features = [],
  actions = [],
}) {
  const { t } = useLanguage?.() || { t: (k) => k };

  const normalizeBool = (v) => {
    if (typeof v === 'boolean') return v;
    if (v == null) return undefined;
    const s = String(v).trim().toLowerCase();
    if (["true", "1", "da", "yes", "y"].includes(s)) return true;
    if (["false", "0", "nu", "no", "n"].includes(s)) return false;
    return undefined;
  };

  const formatFeatureLabel = (f) => {
    if (typeof f === 'string') return f;
    const rawName = String(f?.name || '').trim();
    const value = f?.value;
    if (!rawName && !value) return '';
    const name = rawName.toLowerCase();

    if (["new", "nou"].includes(name)) {
      const b = normalizeBool(value);
      if (b === true) return t('resource.features.new') || 'Nou';
      if (b === false) return t('resource.features.used') || 'Folosit';
      return '';
    }
    if (["surface", "suprafata", "suprafață"].includes(name)) {
      return value ? String(value) : '';
    }
    if (["level", "etaj"].includes(name)) {
      return value ? String(value) : '';
    }
    const labelName = rawName || '';
    const labelValue = value != null && String(value).length ? String(value) : '';
    return [labelName, labelValue].filter(Boolean).join(': ');
  };
  const renderAction = ({ label, href, onClick, variant = "primary", icon, ariaLabel, target, rel, disabled }, i) => {
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
    <div className="flex flex-col md:flex-row w-full bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <Link href={href} className="block">
        <div className="relative w-full h-72 md:h-48 md:w-48 md:min-w-48 overflow-hidden rounded-t-lg md:rounded-none md:rounded-s-lg">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 12rem"
            priority
          />
        </div>
      </Link>

      <div className="flex flex-col w-full p-4 leading-normal text-black">
        <Link href={href} className="block">
          <h5 className="mb-1 text-lg md:text-xl font-semibold tracking-tight text-black line-clamp-2">
            {title}
          </h5>
        </Link>

        {price !== undefined && price !== null && String(price).length > 0 ? (
          <div className="mb-2 text-lg font-semibold">
            {typeof price === 'number' ? price.toFixed(2) : price}
          </div>
        ) : null}

        {description ? (
          <p className="mb-4 text-sm text-gray-700 line-clamp-2">
            {description}
          </p>
        ) : null}

        {Array.isArray(features) && features.length > 0 ? (
          <div className="mb-4 -mt-2 flex flex-wrap gap-2">
            {features.slice(0, 2).map((f, i) => {
              const label = formatFeatureLabel(f);
              if (!label) return null;
              return (
                <span
                  key={i}
                  className="inline-flex items-center rounded-md border border-gray-200 bg-imo px-2 py-1 text-xs font-medium text-black"
                >
                  {label}
                </span>
              );
            })}
          </div>
        ) : null}

        <div className="mt-auto w-full flex items-center gap-2 justify-end flex-wrap">
          {actions?.map(renderAction)}
        </div>
      </div>
    </div>
  );
}
