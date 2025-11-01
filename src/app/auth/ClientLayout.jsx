"use client";

export default function ClientLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md px-4 py-6 bg-white">{children}</div>
    </div>
  );
}