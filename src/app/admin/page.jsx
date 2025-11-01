"use client";

import React from "react";
import { Div, H1, P, Button } from "@/components/ui/general/primitives";
import Link from "next/link";

export default function AdminHomePage() {
	return (
		<Div className="space-y-4">
			<div className="flex items-center justify-center bg-stone-100 rounded-lg p-4">
				<H1 className="m-0">Bine ai venit în Admin</H1>
			</div>

			<Div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="p-4 bg-stone-100 rounded-lg shadow-sm">
					<h2 className="text-lg font-semibold text-black mb-2">Utilizatori</h2>
					<P className="text-gray-700 mb-3">Gestionează conturile utilizatorilor.</P>
					<Link href="/admin/users">
						<Button variant="empty-blue">Mergi la Utilizatori</Button>
					</Link>
				</div>

				<div className="p-4 bg-stone-100 rounded-lg shadow-sm">
					<h2 className="text-lg font-semibold text-black mb-2">Resurse</h2>
					<P className="text-gray-700 mb-3">Administrează resursele din platformă.</P>
					<Link href="/admin/resources">
						<Button variant="empty-blue">Mergi la Resurse</Button>
					</Link>
				</div>
			</Div>
		</Div>
	);
}

