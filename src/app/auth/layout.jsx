export const metadata = {
  title: "Autentificare",
  description: "Conectează-te sau înregistrează‑te",
};

import ClientLayout from "./ClientLayout";

export default function AuthLayout({ children }) {
  return <ClientLayout>{children}</ClientLayout>;
}