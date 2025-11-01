"use client";

import React from "react";
import Link from "next/link";
import { Div, H1, P, Button } from "@/components/ui/general/primitives";
import { LockClosedIcon } from "@heroicons/react/24/solid";

export default function ForbiddenPage() {
  return (
    <Div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-xl w-full bg-stone-100 rounded-lg p-6 text-center">
        <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center text-blue-900">
          <LockClosedIcon className="w-6 h-6" />
        </div>
        <H1 className="m-0">403 — Acces interzis</H1>
        <P className="mt-2 text-gray-700">Nu ai permisiunea necesară pentru a accesa această pagină.</P>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Link href="/">
            <Button variant="empty-blue">Înapoi acasă</Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="empty-gray">Autentificare</Button>
          </Link>
        </div>
      </div>
    </Div>
  );
}
