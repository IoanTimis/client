import Image from "next/image";
import Link from "next/link";

export default function HorizontalCardTemplate({
  href = "#",
  imageSrc = "/imgs/missingPhoto/placeholder-dark-1x1.svg",
  imageAlt = "",
  title = "Noteworthy technology acquisitions 2021",
  description = "Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.",
  actions = [],
}) {
  const variantCls = (v, iconOnly, disabled) => {
    const base = `${iconOnly ? "w-10 h-10" : "px-4 py-2"} inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-md focus:outline-none focus:ring-4 transition-colors duration-150 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`;
    switch (v) {
      case "secondary":
        return `${base} text-blue-700 bg-transparent border border-blue-600 hover:bg-blue-50 focus:ring-blue-200`;
      case "destructive":
        return `${base} text-white bg-red-600 hover:bg-red-700 focus:ring-red-300`;
      case "primary":
      default:
        return `${base} text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-300`;
    }
  };

  const renderAction = ({ label, href, onClick, variant = "primary", icon, ariaLabel, target, rel, disabled }, i) => {
    const iconOnly = !label && !!icon;
    const cls = variantCls(variant, iconOnly, disabled);
    const content = (
      <>
        {icon}
        {label ? <span>{label}</span> : null}
      </>
    );
    return href ? (
      <Link
        key={i}
        href={href}
        target={target}
        rel={rel}
        aria-label={ariaLabel || label}
        className={`${cls} ${disabled ? "pointer-events-none opacity-60" : ""}`}
      >
        {content}
      </Link>
    ) : (
      <button
        key={i}
        type="button"
        onClick={onClick}
        aria-label={ariaLabel || label}
        disabled={disabled}
        className={`${cls} ${disabled ? "opacity-60" : ""}`}
      >
        {content}
      </button>
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

      <div className="flex flex-col w-full p-4 leading-normal">
        <Link href={href} className="block">
          <h5 className="mb-1 text-lg md:text-xl font-semibold tracking-tight text-gray-900 line-clamp-2">
            {title}
          </h5>
        </Link>

        <p className="mb-4 text-sm text-gray-700 line-clamp-2">
          {description}
        </p>

        <div className="mt-auto w-full flex items-center gap-2 justify-start md:justify-end flex-wrap">
          {actions?.map(renderAction)}
        </div>
      </div>
    </div>
  );
}
