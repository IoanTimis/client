"use client";

import React from "react";
import LoadingSpinner from "@/components/ui/animations/loading-spinner";

export default function AdminRouteLoading() {
  return (
    <div className="py-16 flex items-center justify-center">
      <LoadingSpinner className="w-8 h-8 text-blue-900" ariaLabel="Loading admin" />
    </div>
  );
}
