export const metadata = {
  title: "Utilizator",
  description: "Panoul de utilizator",
};

import ClientLayout from "./client-layout";

export default function UserLayout({ children }) {
  return <ClientLayout>{children}</ClientLayout>;
}