export const metadata = {
	title: "Admin",
	description: "Admin dashboard",
};

import AdminClientLayout from "./client-layout";

export default function AdminLayout({ children }) {
	return <AdminClientLayout>{children}</AdminClientLayout>;
}

