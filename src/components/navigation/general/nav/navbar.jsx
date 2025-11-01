/**
 * NavBar — main site navigation with brand, links, account dropdown, and mobile menu.
 *
 * Props
 * - user?: { name?: string } — current user info (used in dropdown label)
 * - onLogout?: () => void — optional callback after logout is triggered
 *
 * Behavior
 * - Uses Redux to determine `authenticated` and `role`. Links differ when logged in.
 * - Mobile menu toggles below the header. Desktop shows links and an account dropdown.
 */
"use client";
import React from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator } from "../../../ui/general/dropdowns";
import MobileMenu from "./mobile-menu";
import { UserIcon, InformationCircleIcon, PhoneIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';
import NavLink from "./nav-link";
import { useDispatch, useSelector } from "react-redux";
import logout from "@/lib/auth/logout";
import { setError } from "@/store/features/error/error-slice";
import LanguageSwitcher from "@/components/ui/general/language-switcher";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/language-context";

// NavLink moved to ./NavLink for reuse across desktop and mobile menus

function getNavItems(role, authenticated) {
	// Remove Home from the center; logo will navigate to home
	const common = [
		{ href: "/about", label: "About", icon: InformationCircleIcon },
		{ href: "/contact", label: "Contact", icon: PhoneIcon },
		{ href: "/resources", label: "Resources", icon: ShoppingCartIcon },
	];
	return common;
}

export default function NavBar({ user, onLogout }) {
	const { t } = useLanguage();
	const pathname = usePathname();
	const [open, setOpen] = React.useState(false);
	const dispatch = useDispatch();
	const authenticated = useSelector((state) => Boolean(state.user?.info));
	const role = useSelector((state) => state.user?.info?.role) ?? "guest";
	console.log(authenticated);
	console.log(role);
	const items = getNavItems(role, authenticated);
	const router = useRouter();

	const isActive = (href) => pathname?.startsWith(href);

	const handleLogout = async () => {
		try{
			await logout();
			router.replace("/auth/login");
		} catch(e) {
			dispatch(setError(t('common.logoutError')));
			console.warn("Logout failed", e);
		}
	}

	return (
		<header className="sticky top-0 z-40 border-b border-gray-800/50 bg-gray-900 text-white">
			<div className="mx-auto w-full max-w-6xl px-4 md:px-6 h-16 grid grid-cols-3 md:grid-cols-[auto_1fr_auto_auto] items-center">
				{/* Left: Brand (acts as Home) */}
				<div className="flex items-center">
					<NextLink href="/" className="text-sm font-semibold tracking-tight hover:opacity-90">
						{t('nav.brand')}
					</NextLink>
				</div>

				{/* Center: General pages (no Home) */}
				<nav className="hidden md:flex items-center justify-center gap-1">
					{items.map((item) => (
						<NavLink
							key={item.href}
							href={item.href}
							label={t(`nav.${item.label.toLowerCase()}`)}
							icon={item.icon}
							active={isActive(item.href)}
							className="text-white hover:text-blue-400 hover:bg-white/20"
							activeClassName="bg-white/10"
						/>
					))}
				</nav>

				{/* Right-1: Language switcher */}
				<div className="hidden md:flex items-center justify-end">
					<LanguageSwitcher />
				</div>

				{/* Right-2: Account dropdown (separated) */}
				<div className="hidden md:flex items-center justify-end gap-2 pl-3 ml-5 border-l border-white/20">
					{!authenticated ? (
						<Dropdown variant="nav">
							<DropdownTrigger leadingIcon={UserIcon} className="">
								{t('nav.myAccount')}
							</DropdownTrigger>
							<DropdownContent>
								<DropdownItem className={"hover:text-blue-400"} href="/auth/login">{t('nav.login')}</DropdownItem>
								<DropdownItem className={"hover:text-blue-400"} href="/auth/register">{t('nav.register')}</DropdownItem>
							</DropdownContent>
						</Dropdown>
					) : (
						<Dropdown variant="nav">
							<DropdownTrigger leadingIcon={UserIcon} className="text-white">
								{user?.name ?? t('nav.myAccount')}
							</DropdownTrigger>
							<DropdownContent>
								<DropdownItem className={"hover:text-blue-400"} href="/user/profile">{t('nav.profile')}</DropdownItem>
								{role === "vendor" && (
									<DropdownItem className={"hover:text-blue-400"} href="/user/dashboard">{t('nav.dashboard')}</DropdownItem>
								)}
								<DropdownItem className={"hover:text-blue-400"} href="/user/review">{t('nav.review')}</DropdownItem>
								{role === "admin" && (
									<DropdownItem className={"hover:text-blue-400"} href="/admin">{t('nav.admin')}</DropdownItem>
								)}
								<DropdownSeparator />
								<DropdownItem className={"hover:text-blue-400"} as="button" type="button" onClick={handleLogout}>{t('nav.logout')}</DropdownItem>
							</DropdownContent>
						</Dropdown>
					)}
				</div>

				{/* Mobile toggle */}
				<div className="md:hidden col-span-1 col-start-3 justify-self-end">
					<button
						aria-label={t('nav.openMenu')}
						aria-expanded={open}
						onClick={() => setOpen((v) => !v)}
						className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-900"
					>
						<span className="sr-only">{t('nav.toggle')}</span>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
							<path d="M3 6h18M3 12h18M3 18h18" />
						</svg>
					</button>
				</div>
			</div>
			<MobileMenu
				open={open}
				onClose={() => setOpen(false)}
				items={items}
				isActive={isActive}
				authenticated={authenticated}
				handleLogout={handleLogout}
				onLogout={onLogout}
				role={role}
			/>
		</header>
	);
}

