"use client";
import React from "react";
import { usePathname } from "next/navigation";
import AccountSideBar from "@/components/ui/general/account/account-sidebar";
import { useLanguage } from "@/context/language-context";

export default function ClientLayout({ children }) {
	const pathname = usePathname();
	const isVendorDetail = /^\/user\/review\/[^/]+$/.test(pathname || "");
	const isVendorBase = pathname === '/user/review';
	const { t } = useLanguage();
	const items = [
        { href: "/user/profile", label: t('account.myProfile') },
		{ href: "/user/dashboard", label: t('account.myResources') },
		// { href: "/user/settings", label: t('account.settings') },
	];

	// For vendor product detail page, don't apply account layout wrappers/sidebar
	if (isVendorDetail || isVendorBase) {
		return (
			<div className="min-h-screen">{children}</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto min-h-screen py-6">
			<div className="mt-4 flex flex-col md:flex-row gap-6">
				<div className="md:bg-stone-100 sm:bg-white rounded-lg p-4 hidden md:block ">
					<AccountSideBar className="bg-stone-100 p-4 md:bg-white md:p-0 rounded-lg" sticky={false} items={items} />
				</div>
				<div className="flex-1">{children}</div>
			</div>
		</div>
	);
}
