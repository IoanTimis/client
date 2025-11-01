'use client';

import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Footer } from "../components/navigation/general/footer";
import { NavBar } from "../components/navigation/general/nav";
import ErrorDiv from "../components/ui/general/error-div";
import { store,  persistor } from "@/store/page";
import { usePathname } from "next/navigation";
import { LanguageProvider } from "@/context/language-context";
import en from "@/locales/en.json";
import ro from "@/locales/ro.json";

export default function AppProvider({ children }) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin") || pathname === "/not-found" || pathname === "/404") {
    return <>{children}</>;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <LanguageProvider dicts={{ en, ro }}>
          <div className="flex flex-col">
            <NavBar />
            <ErrorDiv />
            <main className="flex-1 min-h-screen bg-white">
              {/* Might want to adjust min-h-screen on div, changed it for listing items */}
              <div className="lg:mx-24 min-h-screen xl:mx-32 2xl:mx-64 md:px-6 sm:px-4 px-2">
                {children}
              </div>
            </main>
            <Footer />
          </div>
        </LanguageProvider>
      </PersistGate>
    </Provider>
  );
}
