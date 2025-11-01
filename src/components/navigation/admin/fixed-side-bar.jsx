"use client";

import Link from "next/link";
import {
	HomeIcon,
	UsersIcon,
	CubeIcon,
	ArrowRightOnRectangleIcon,
	GlobeAltIcon
} from "@heroicons/react/24/solid";
import { useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import React from "react";
import { setError } from "@/store/features/error/error-slice";
import logout from "@/lib/auth/logout";

export default function FixedSideBar() {
	const dispatch = useDispatch();
	const router = useRouter();
	const pathname = usePathname();

	const handleLogout = async () => {
		try {
			await logout();
			// logout() already redirects to /auth/login via window.location; as a fallback:
			try { router.replace("/auth/login"); } catch (_) {}
		} catch (error) {
			console.error("Logout error:", error);
			dispatch(setError("An error occurred while logging out. Please try again."));
		}
	};

	const linkBase = (href) =>
		`flex items-center gap-2 p-3 rounded-lg hover:bg-gray-700 ${pathname === href ? "bg-gray-700" : ""}`;

	return (
		<aside className="fixed top-0 left-0 h-full w-64 bg-gray-900 text-white flex flex-col p-6 shadow-lg">
			<div className="text-2xl font-bold mb-6 text-center">Admin Dashboard</div>

			<nav className="flex flex-col gap-2">
				<Link href="/admin" className={linkBase("/admin")}>
					<HomeIcon className="h-5 w-5" />
					<span>Dashboard</span>
				</Link>
				<Link href="/admin/users" className={linkBase("/admin/users")}>
					<UsersIcon className="h-5 w-5" />
					<span>Utilizatori</span>
				</Link>
				<Link href="/admin/resources" className={linkBase("/admin/resources")}>
					<CubeIcon className="h-5 w-5" />
					<span>Resurse</span>
				</Link>
				<Link href="/" className={linkBase("/")} aria-label="Site public" title="Site public"> 
	                    <GlobeAltIcon className="h-5 w-5" />
	                    <span>Site public</span>
				</Link>

				<button onClick={handleLogout} className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-700 text-left">
					<ArrowRightOnRectangleIcon className="h-5 w-5" />
					<span>Logout</span>
				</button>
			</nav>
		</aside>
	);
}

