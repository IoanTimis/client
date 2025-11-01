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

export default function AdminResourcesPage() {
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

	const fetchResources = useCallback(async (pageArg) => {
		setLoading(true);
		setError(null);
		try {
			const currentPage = pageArg || page || 1;
			const res = await AxiosInstance.get("/admin/resources", { params: { page: currentPage, limit: LIMIT } });
			const data = Array.isArray(res.data) ? res.data : (res.data?.items || []);
			const count = typeof res.data?.count === 'number' ? res.data.count : data.length;
			console.log("Fetched resources:", data);
			setRows(data);
			setTotal(count);
		} catch (e) {
			console.warn("Failed to load resources, using fallback.", e);
			const fallback = [
				{ id: 101, name: "Resursă Demo", price: 123.45, active: true, description: "O resursă de test pentru interfața de admin.", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
				{ id: 102, name: "Altă Resursă", price: 49.9, active: false, description: "Resursă indisponibilă temporar.", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
			];
			setRows(fallback);
			setTotal(fallback.length);
		} finally {
			setLoading(false);
		}
	}, [page]);

	useEffect(() => { fetchResources(page); }, [fetchResources, page]);

	const columns = useMemo(() => ([
		{ key: "id", label: "ID" },
		{ key: "name", label: "Nume" },
		{ key: "price", label: "Preț" },
		{ key: "description", label: "Descriere" },
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
			await AxiosInstance.delete(`/admin/resources/${toDeleteRow.id}`);
			setRows((prev) => prev.filter((r) => r.id !== toDeleteRow.id));
		} catch (e) {
			setError(e?.response?.data?.error || e.message || "Eroare la ștergere resursă");
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
			ariaLabel: "Editează resursă",
			disabled: () => false,
		},
		{
			title: "Șterge",
			className: "text-red-700 hover:text-white border border-red-700 hover:bg-red-800 rounded",
			icon: <TrashIcon className="w-5 h-5" />,
			onClick: requestDelete,
			ariaLabel: "Șterge resursă",
			disabled: () => false,
		},
	]), [handleEdit, requestDelete]);

	return (
		<Div>
			<div className="bg-stone-100 rounded-lg p-4 flex justify-center items-center">
				<H1 className="m-0">Resurse</H1>
			</div>

			{/* Add button above table, left aligned */}
			<div className="mt-4">
				<AddButton onClick={() => setAddOpen(true)}>Adaugă resursă</AddButton>
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
							defaultVisibleKeys={["id", "name", "price"]}
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

			{/* Add resource modal */}
			<GeneralScrollableFormModal
				open={addOpen}
				onClose={() => setAddOpen(false)}
				title={"Adaugă resursă"}
				submitLabel={t('common.save')}
				showClose={true}
				cols={1}
				fields={[
					{ name: 'name', label: 'Nume', type: 'text', required: true },
					{ name: 'description', label: 'Descriere', type: 'textarea', required: true },
					{ name: 'price', label: 'Preț', type: 'number', required: true, validate: { min: 0 } },
				]}
					onSubmit={async (payload) => {
					try {
						await AxiosInstance.post('/admin/resources', payload);
							await fetchResources();
						return { success: true, message: t('common.created') || 'Creat' };
					} catch (e) {
						const msg = e?.response?.data?.error || e?.message || t('common.createFailed');
						setError(msg);
						return { success: false, message: msg };
					}
				}}
				onSuccess={() => setAddOpen(false)}
			/>

			{/* Edit resource modal */}
			<GeneralScrollableFormModal
				open={editOpen}
				onClose={() => { setEditOpen(false); setEditRow(null); }}
				title={"Editează resursă"}
				submitLabel={t('common.save')}
				showClose={true}
				cols={1}
				initialValues={editRow ? {
					name: editRow.name || '',
					description: editRow.description || '',
					price: editRow.price ?? '',
				} : {}}
				fields={[
					{ name: 'name', label: 'Nume', type: 'text', required: true },
					{ name: 'description', label: 'Descriere', type: 'textarea', required: true },
					{ name: 'price', label: 'Preț', type: 'number', required: true, validate: { min: 0 } },
				]}
					onSubmit={async (vals) => {
					if (!editRow) return { success: false, message: t('common.updateFailed') };
					try {
						await AxiosInstance.put(`/admin/resources/${editRow.id}`, vals);
							await fetchResources();
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
				message={toDeleteRow ? `Ștergi resursa ${toDeleteRow.name}?` : t('modal.confirm.message')}
				confirmText={t('modal.confirm.confirm')}
				cancelText={t('modal.confirm.cancel')}
				onConfirm={handleDelete}
			/>
		</Div>
	);
}

