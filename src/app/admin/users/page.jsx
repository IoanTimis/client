"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import TableVerticalExpandable from "@/components/ui/admin/table-vertical-expandable";
import AddButton from "@/components/ui/admin/add-button";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import AxiosInstance from "@/lib/api/api";
import { Div, H1, P } from "@/components/ui/general/primitives";
import LoadingSpinner from "@/components/ui/animations/loading-spinner";
import { useLanguage } from "@/context/language-context";
import GeneralScrollableFormModal from "@/components/ui/general/modals/general-scrollable-form-modal";
import { DangerModal } from "@/components/ui/general/modals/Modal";
import Pagination from "@/components/ui/general/pagination/pagination";

export default function AdminUsersPage() {
	const { t } = useLanguage();
	const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const LIMIT = 50;
	const [addOpen, setAddOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [editRow, setEditRow] = useState(null);
	const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
	const [toDeleteRow, setToDeleteRow] = useState(null);

	const fetchUsers = useCallback(async (pageArg) => {
		setLoading(true);
		setError(null);
		try {
			const currentPage = pageArg || page || 1;
			const res = await AxiosInstance.get(`/admin/users`, { params: { page: currentPage, limit: LIMIT } });
			const data = Array.isArray(res.data) ? res.data : (res.data?.items || []);
			const count = typeof res.data?.count === 'number' ? res.data.count : data.length;
            console.log("Fetched users:", data);
			setRows(data);
			setTotal(count);
		} catch (e) {
			// fallback demo data
			console.warn("Failed to load users, using fallback.", e);
			const fallback = [
				{ id: 1, name: "Admin", email: "admin@example.com", role: "admin", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
				{ id: 2, name: "Vendor One", email: "vendor1@example.com", role: "vendor", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
			];
			setRows(fallback);
			setTotal(fallback.length);
		} finally {
			setLoading(false);
		}
	}, [page]);

	useEffect(() => { fetchUsers(page); }, [fetchUsers, page]);

	const columns = useMemo(() => ([
		{ key: "id", label: "ID" },
		{ key: "first_name", label: "Prenume" },
		{ key: "name", label: "Nume" },
		{ key: "email", label: "Email" },
		{ key: "role", label: "Rol" },
		{ key: "createdAt", label: "Creat la" },
		{ key: "updatedAt", label: "Actualizat la" },
	]), []);

	const handleEdit = useCallback((row) => {
		setEditRow(row);
		setEditOpen(true);
	}, []);

	const requestDelete = useCallback((row) => {
		setToDeleteRow(row);
		setConfirmDeleteOpen(true);
	}, []);

	const handleDelete = useCallback(async () => {
		if (!toDeleteRow) return;
		try {
			setLoading(true);
			await AxiosInstance.delete(`/admin/users/${toDeleteRow.id}`);
			setRows((prev) => prev.filter((r) => r.id !== toDeleteRow.id));
		} catch (e) {
			setError(e?.response?.data?.error || e.message || "Eroare la ștergere utilizator");
		} finally {
			setLoading(false);
			setConfirmDeleteOpen(false);
			setToDeleteRow(null);
		}
	}, [toDeleteRow]);

	const actions = useMemo(() => ([
		{
			title: "Editează",
			className: "text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 rounded",
			icon: <PencilSquareIcon className="w-5 h-5" />,
			onClick: handleEdit,
			ariaLabel: "Editează utilizator",
			disabled: () => false,
		},
		{
			title: "Șterge",
			className: "text-red-700 hover:text-white border border-red-700 hover:bg-red-800 rounded",
			icon: <TrashIcon className="w-5 h-5" />,
			onClick: requestDelete,
			ariaLabel: "Șterge utilizator",
			disabled: () => false,
		},
	]), [handleEdit, requestDelete]);

	return (
		<Div>
			<div className="bg-stone-100 rounded-lg p-4 flex justify-center items-center">
				<H1 className="m-0">Utilizatori</H1>
			</div>

			{/* Add button above table, left aligned */}
			<div className="mt-4">
				<AddButton onClick={() => setAddOpen(true)}>Adaugă utilizator</AddButton>
			</div>

			<Div className="mt-4">
				{error ? (
					<Div className="p-3 my-4 bg-red-100 text-red-800 border border-red-200 rounded">{String(error)}</Div>
				) : null}
				{loading ? (
					<div className="py-10 flex items-center justify-center text-blue-900">
						<LoadingSpinner className="w-6 h-6 text-blue-900" ariaLabel={t('common.loading')} />
					</div>
				) : (
					<div className="overflow-x-auto scrollbar-stone">
						<TableVerticalExpandable
							data={rows}
							columns={columns}
							actions={actions}
							defaultVisibleKeys={["id", "first_name", "name", "email"]}
						/>
					</div>
				)}
			</Div>

			{/* Pagination */}
			{!loading && (
				<div className="flex justify-center">
					<Pagination
						page={page}
						total={total}
						limit={LIMIT}
						onPageChange={(p) => setPage(p)}
						tone="primary"
					/>
				</div>
			)}

			{/* Add user modal */}
			<GeneralScrollableFormModal
				open={addOpen}
				onClose={() => setAddOpen(false)}
				title={"Adaugă utilizator"}
				submitLabel={t('common.save')}
				showClose={true}
				cols={1}
				fields={[
					{ name: 'first_name', label: 'Prenume', type: 'text', required: true },
					{ name: 'name', label: 'Nume', type: 'text', required: true },
					{ name: 'email', label: 'Email', type: 'email', required: true },
					{ name: 'password', label: 'Parolă', type: 'password', required: true, validate: { minLength: 6 } },
					{ name: 'role', label: 'Rol', type: 'select', required: true, options: [
						{ value: 'client', label: 'client' },
						{ value: 'vendor', label: 'vendor' },
						{ value: 'admin', label: 'admin' },
					], defaultValue: 'client' },
				]}
				onSubmit={async (payload) => {
					try {
						await AxiosInstance.post('/admin/users', payload);
						await fetchUsers();
						return { success: true, message: t('common.created') || 'Creat' };
					} catch (e) {
						const msg = e?.response?.data?.error || e?.message || t('common.createFailed');
						setError(msg);
						return { success: false, message: msg };
					}
				}}
				onSuccess={() => setAddOpen(false)}
			/>

			{/* Edit user modal */}
			<GeneralScrollableFormModal
				open={editOpen}
				onClose={() => { setEditOpen(false); setEditRow(null); }}
				title={"Editează utilizator"}
				submitLabel={t('common.save')}
				showClose={true}
				cols={1}
				initialValues={editRow ? {
					first_name: editRow.first_name || '',
					name: editRow.name || '',
					email: editRow.email || '',
				} : {}}
				fields={[
					{ name: 'first_name', label: 'Prenume', type: 'text', required: true },
					{ name: 'name', label: 'Nume', type: 'text', required: true },
					{ name: 'email', label: 'Email', type: 'email', required: true },
				]}
				onSubmit={async (vals) => {
					if (!editRow) return { success: false, message: t('common.updateFailed') };
					try {
						const { first_name, name, email } = vals || {};
						const payload = { first_name, name, email };
						await AxiosInstance.put(`/admin/users/${editRow.id}`, payload);
						await fetchUsers();
						return { success: true, message: t('common.updated') || 'Actualizat' };
					} catch (e) {
						const msg = e?.response?.data?.error || e?.message || t('common.updateFailed');
						setError(msg);
						return { success: false, message: msg };
					}
				}}
				onSuccess={() => { setEditOpen(false); setEditRow(null); }}
			/>

			{/* Delete confirm */}
			<DangerModal
				open={confirmDeleteOpen}
				onClose={() => { setConfirmDeleteOpen(false); setToDeleteRow(null); }}
				title={t('modal.confirm.title')}
				message={toDeleteRow ? `Ștergi utilizatorul ${toDeleteRow.name}?` : t('modal.confirm.message')}
				confirmText={t('modal.confirm.confirm')}
				cancelText={t('modal.confirm.cancel')}
				onConfirm={handleDelete}
			/>
		</Div>
	);
}

