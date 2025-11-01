"use client";

import React from "react";
import FixedSideBar from "@/components/navigation/admin/fixed-side-bar";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store/page";
import { LanguageProvider } from "@/context/language-context";
import en from "@/locales/en.json";
import ro from "@/locales/ro.json";
import ErrorDiv from "@/components/ui/general/error-div";

export default function AdminClientLayout({ children }) {
	return (
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<LanguageProvider dicts={{ en, ro }}>
					<div className="min-h-screen bg-stone-50">
						{/* Left fixed sidebar */}
						<FixedSideBar />
						{/* Content area with left padding to account for sidebar width */}
						<main className="ml-64 p-4 md:p-6">
							<div className="mx-auto w-full max-w-7xl">
								<ErrorDiv />
								{children}
							</div>
						</main>
					</div>
				</LanguageProvider>
			</PersistGate>
		</Provider>
	);
}

