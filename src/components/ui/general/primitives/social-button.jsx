"use client";

import React from "react";
import { FaGoogle, FaTwitter, FaDribbble, FaGithub, FaFacebook, FaLinkedin, FaApple, FaInstagram } from "react-icons/fa";

/**
 * SocialButton — brand icon button with optional text.
 *
 * Contract
 * - provider: one of 'google' | 'twitter' | 'dribbble' | 'github' | 'facebook' | 'linkedin' | 'apple'
 * - text?: string — optional label rendered next to icon
 * - size?: 'sm' | 'md' (default 'md')
 * - variant?: 'solid' | 'ghost' (default 'solid')
 * - onClick?: (e) => void, type?: 'button' | 'submit' | 'reset'
 * - className?: string — extra classes
 * - ariaLabel?: string — accessibility label (falls back to provider name)
 *
 * Examples
 *   <SocialButton provider="google" />
 *   <SocialButton provider="twitter" text="Continuă cu Twitter" />
 *   <SocialButton provider="github" size="sm" />
 */
export default function SocialButton({
  provider = "google",
  text,
  size = "md",
  variant = "solid",
  className = "",
  type = "button",
  disabled = false,
  onClick,
  ariaLabel,
}) {
  const map = {
    google: { Icon: FaGoogle, bg: "bg-[#ea4335]", hover: "hover:bg-[#ea4335]/90", focus: "focus:bg-[#ea4335]/90", active: "active:bg-[#ea4335]/90" },
    twitter: { Icon: FaTwitter, bg: "bg-[#1DA1F2]", hover: "hover:bg-[#1DA1F2]/90", focus: "focus:bg-[#1DA1F2]/90", active: "active:bg-[#1DA1F2]/90" },
    dribbble: { Icon: FaDribbble, bg: "bg-[#ea4c89]", hover: "hover:bg-[#ea4c89]/90", focus: "focus:bg-[#ea4c89]/90", active: "active:bg-[#ea4c89]/90" },
    github: { Icon: FaGithub, bg: "bg-[#333333]", hover: "hover:bg-[#333333]/90", focus: "focus:bg-[#333333]/90", active: "active:bg-[#333333]/90" },
    facebook: { Icon: FaFacebook, bg: "bg-[#1877F2]", hover: "hover:bg-[#1877F2]/90", focus: "focus:bg-[#1877F2]/90", active: "active:bg-[#1877F2]/90" },
    linkedin: { Icon: FaLinkedin, bg: "bg-[#0A66C2]", hover: "hover:bg-[#0A66C2]/90", focus: "focus:bg-[#0A66C2]/90", active: "active:bg-[#0A66C2]/90" },
    apple: { Icon: FaApple, bg: "bg-black", hover: "hover:bg-black/90", focus: "focus:bg-black/90", active: "active:bg-black/90" },
    instagram: { Icon: FaInstagram, bg: "bg-[#E4405F]", hover: "hover:bg-[#E4405F]/90", focus: "focus:bg-[#E4405F]/90", active: "active:bg-[#E4405F]/90" },
  };

  const brand = map[provider] || map.google;
  const { Icon, bg, hover, focus, active } = brand;

  const base = "inline-flex items-center justify-center gap-2 rounded-md border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow-lg focus:shadow-none active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none";
  const paddings = size === "sm" ? "py-1.5 px-2" : "py-2 px-2.5";
  const iconSize = size === "sm" ? 14 : 16;

  const solidClasses = [bg, hover, focus, active].join(" ");
  const ghostClasses = ["bg-transparent", "text-current", "border", "border-gray-300", hover.replace("hover:", "hover:text-"), focus, active].join(" ");

  const btnClass = [
    base,
    paddings,
    variant === "solid" ? solidClasses : ghostClasses,
    className,
  ].join(" ");

  const label = ariaLabel || (provider.charAt(0).toUpperCase() + provider.slice(1));

  return (
    <button type={type} className={btnClass} disabled={disabled} onClick={onClick} aria-label={label}>
      <Icon size={iconSize} className="shrink-0" />
      {text ? <span className="whitespace-nowrap">{text}</span> : null}
    </button>
  );
}
