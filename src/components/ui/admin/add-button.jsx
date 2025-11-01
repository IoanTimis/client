"use client";

import React from "react";
import Button from "@/components/ui/general/primitives/button";
import { PlusIcon } from "@heroicons/react/24/solid";

export default function AddButton({ children = "Adaugă", onClick, className = "" }) {
	return (
		<Button variant="empty-blue" onClick={onClick} className={["inline-flex items-center gap-2", className].join(" ")}> 
			<PlusIcon className="w-5 h-5" />
			<span className="hidden sm:inline">{children}</span>
		</Button>
	);
}

