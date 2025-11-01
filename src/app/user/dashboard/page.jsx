"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import AxiosInstance from "@/lib/api/api";
import VerticalCard from "@/components/ui/general/cards/vertical-card";
import VerticalAddCard from "@/components/ui/general/cards/vertical-add-card";
// Replaced direct form usage with a modalized variant
import GeneralScrollableFormModal from "@/components/ui/general/modals/general-scrollable-form-modal";
import { Div, H1, H2, P, Label, Input, Button } from "@/components/ui/general/primitives";
import { useLanguage } from "@/context/language-context";
import dashboardConfig from '@/config/dashboard-config';
import resourceFiltersConfig from '@/config/resource-filters-config';
import { DangerModal } from "@/components/ui/general/modals/Modal";
import Pagination from "@/components/ui/general/pagination/pagination";
import FilterUpBar from "@/components/ui/general/search/filter-up-bar";
import Image from "next/image";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import AccountSideBar from "@/components/ui/general/account/account-sidebar";
import { useAuthUser } from "@/utils/auth";
import { toAbsoluteUrl } from "@/utils/url";
import { formatPrice } from "@/utils/number";
import { DEFAULT_LANDSCAPE_PLACEHOLDER } from "@/utils/images";
import MultiPinMap from "@/components/ui/general/maps/multi-pin-map";
import ModalMultiPinMap from "@/components/ui/general/modals/multi-pin-map-modal";

function ProductForm({ initial, onCancel, onSubmit, submitting }) {
	const { t } = useLanguage();
	const [name, setName] = useState(initial?.name || "");
	const [price, setPrice] = useState(initial?.price ?? "");
	const [date, setDate] = useState(() => {
		if (!initial?.date) return "";
		const d = new Date(initial.date);
		return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
	});
	// Features (max 2)
	const [features, setFeatures] = useState(() => {
		const init = Array.isArray(initial?.features) ? initial.features.slice(0, 2) : [];
		const norm = init.map(f => ({ name: String(f?.name || ""), value: String(f?.value || "") }));
		while (norm.length < 2) norm.push({ name: "", value: "" });
		return norm;
	});
	const [newFiles, setNewFiles] = useState([]);
	const [deleteImageIds, setDeleteImageIds] = useState([]);

	const existingImages = initial?.images || [];

	const handleFileChange = (e) => {
		const files = Array.from(e.target.files || []);
		setNewFiles(files);
	};

	const toggleDeleteImage = (id) => {
		setDeleteImageIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const fd = new FormData();
		if (name) fd.append("name", name);
		if (price !== "") fd.append("price", String(price));
		if (date) fd.append("date", date);
		const cleaned = features
			.filter(f => (f.name && f.name.trim()) || (f.value && f.value.trim()))
			.slice(0, 2)
			.map(f => ({ name: f.name.trim(), value: f.value.trim() }));
		if (cleaned.length) fd.append("features", JSON.stringify(cleaned));
		newFiles.forEach((f) => fd.append("images", f));
		if (deleteImageIds.length) fd.append("deleteImageIds", deleteImageIds.join(","));
		await onSubmit(fd);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="space-y-2">
					<Label htmlFor="name">{t('resource.form.name')}</Label>
					<Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
				</div>
				<div className="space-y-2">
					<Label htmlFor="price">{t('resource.form.price')}</Label>
					<Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
				</div>
				<div className="space-y-2">
					<Label htmlFor="date">{t('resource.form.date')}</Label>
					<Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
				</div>
			</div>

			<div className="space-y-2">
				<Label>{t('resource.form.features')}</Label>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					{features.map((f, idx) => (
						<div key={idx} className="grid grid-cols-2 gap-2">
							<Input
									placeholder={t('resource.form.featureName')}
								value={f.name}
								onChange={(e) => {
									const v = e.target.value;
									setFeatures((prev) => prev.map((it, i) => i === idx ? { ...it, name: v } : it));
								}}
							/>
							<Input
									placeholder={t('resource.form.featureValue')}
								value={f.value}
								onChange={(e) => {
									const v = e.target.value;
									setFeatures((prev) => prev.map((it, i) => i === idx ? { ...it, value: v } : it));
								}}
							/>
						</div>
					))}
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="images">{t('resource.form.images')}</Label>
				<Input id="images" type="file" multiple accept="image/*" onChange={handleFileChange} />
				{newFiles?.length ? (
					<Div className="mt-2 grid grid-cols-3 gap-2">
						{newFiles.map((f, idx) => (
							<Div key={idx} className="border rounded p-1 text-xs">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-24 object-cover rounded" />
								<P className="truncate mt-1">{f.name}</P>
							</Div>
						))}
					</Div>
				) : null}
			</div>

			{existingImages?.length ? (
				<Div className="space-y-2">
					<Label>{t('resource.form.existingImages')}</Label>
					<Div className="grid grid-cols-3 gap-2">
						{existingImages.map((img) => (
							<button
								type="button"
								key={img.id}
								onClick={() => toggleDeleteImage(img.id)}
								className={`border rounded p-1 relative ${deleteImageIds.includes(img.id) ? 'ring-2 ring-red-500' : ''}`}
								title={deleteImageIds.includes(img.id) ? t('resource.form.markedForDeletion') : t('resource.form.clickToMarkDelete')}
							>
								<Image src={toAbsoluteUrl(img.url)} alt={img.alt || ''} width={300} height={300} className="w-full h-24 object-cover rounded" unoptimized />
								{deleteImageIds.includes(img.id) ? (
									<span className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1 py-0.5 rounded">{t('resource.form.deleteBadge')}</span>
								) : null}
							</button>
						))}
					</Div>
				</Div>
			) : null}

			<Div className="flex gap-2 justify-end">
				<Button type="button" variant="empty-gray" onClick={onCancel} disabled={submitting}>
					{t('common.cancel')}
				</Button>
				<Button type="submit" variant="empty-blue" disabled={submitting}>
					{submitting ? (initial ? t('common.saving') : t('resource.form.creating')) : (initial ? t('common.save') : t('resource.form.create'))}
				</Button>
			</Div>
		</form>
	);
}

export default function VendorDashboardPage() {
    const router = useRouter();
	const user = useAuthUser();
	const { t } = useLanguage();
	const searchParams = useSearchParams();
	const initializedRef = useRef(false);
	const [items, setItems] = useState([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [creating, setCreating] = useState(false);
	const [editing, setEditing] = useState(null);
	const [editingDeleteImageIds, setEditingDeleteImageIds] = useState([]);
	const [submitting, setSubmitting] = useState(false);
	const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
	const [toDeleteId, setToDeleteId] = useState(null);
    const [mapOpen, setMapOpen] = useState(false);

	// filters/state
	const [q, setQ] = useState("");
	const [sortBy, setSortBy] = useState("createdAt");
	const [order, setOrder] = useState("DESC");
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [minPrice, setMinPrice] = useState("");
	const [maxPrice, setMaxPrice] = useState("");
	const [camere, setCamere] = useState("");
	const [suprafataMin, setSuprafataMin] = useState("");
	const [suprafataMax, setSuprafataMax] = useState("");

	// Feature options and fields pulled from shared config
	const featureOptions = useMemo(() => dashboardConfig.getFeatureOptions(t), [t]);
	const createFields = useMemo(() => dashboardConfig.getCreateFields(t), [t]);
	const editFields = useMemo(() => dashboardConfig.getEditFields(t, editing), [t, editing]);

	// Filters config from shared resourceFiltersConfig
	const dashboardFilters = useMemo(() => resourceFiltersConfig.getFilters(t, sortBy, order), [t, sortBy, order]);
	// Build default values from current state (including values restored from URL)
	const dashboardDefaultValues = useMemo(() => ({
		...resourceFiltersConfig.getDefaultValues(sortBy, order),
		minPrice: String(minPrice ?? ""),
		maxPrice: String(maxPrice ?? ""),
		camere: String(camere ?? ""),
		suprafataMin: String(suprafataMin ?? ""),
		suprafataMax: String(suprafataMax ?? ""),
	}), [sortBy, order, minPrice, maxPrice, camere, suprafataMin, suprafataMax]);

	// Key to re-mount FilterUpBar when defaults change so it reflects URL state
	const filterUpBarKey = useMemo(() => JSON.stringify({
		q,
		sort: `${sortBy}:${order}`,
		minPrice: String(minPrice ?? ""),
		maxPrice: String(maxPrice ?? ""),
		camere: String(camere ?? ""),
		suprafataMin: String(suprafataMin ?? ""),
		suprafataMax: String(suprafataMax ?? ""),
	}), [q, sortBy, order, minPrice, maxPrice, camere, suprafataMin, suprafataMax]);

	// Build markers for maps from items with valid coordinates
	const markers = useMemo(() => {
		return (items || [])
			.filter((r) => r?.coordinates && r.coordinates.latitude != null && r.coordinates.longitude != null)
			.map((r) => ({
				id: r.id,
				lat: parseFloat(r.coordinates.latitude),
				lng: parseFloat(r.coordinates.longitude),
				label: r.name,
			}));
	}, [items]);


	const fetchMine = useCallback(async () => {
		if (!user?.id) return;
		setLoading(true);
		setError(null);
		try {
			const res = await AxiosInstance.get("/resources", { params: {
				user_id: user.id,
				q: q || undefined,
				minPrice: minPrice || undefined,
				maxPrice: maxPrice || undefined,
				camere: camere || undefined,
				suprafataMin: suprafataMin || undefined,
				suprafataMax: suprafataMax || undefined,
				limit,
				page,
				sortBy,
				order,
			} });
			const data = res.data;
			if (Array.isArray(data)) {
				setItems(data);
				setTotal(data.length);
			} else {
				setItems(data.items || []);
				setTotal(data.total || 0);
			}
	} catch (e) {
			const msg = e?.response?.data?.error || e?.message || t('resources.errors.cannotLoad');
			setError(msg);
		} finally {
			setLoading(false);
		}
	}, [user?.id, q, limit, page, sortBy, order, minPrice, maxPrice, camere, suprafataMin, suprafataMax, t]);

	useEffect(() => { fetchMine(); }, [fetchMine]);

	// On mount: hydrate filter state from URL params so reloads preserve search
	useEffect(() => {
		if (!searchParams) return;
		if (initializedRef.current) return;
		const qp = (k) => searchParams.get(k);
		const qpNum = (k, d) => {
			const v = qp(k);
			const n = v != null ? parseInt(v, 10) : NaN;
			return !isNaN(n) ? n : d;
		};
		setQ(qp("q") || "");
		setSortBy(qp("sortBy") || "createdAt");
		setOrder((qp("order") || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC");
		setMinPrice(qp("minPrice") || "");
		setMaxPrice(qp("maxPrice") || "");
		setCamere(qp("camere") || "");
		setSuprafataMin(qp("suprafataMin") || "");
		setSuprafataMax(qp("suprafataMax") || "");
		setLimit(qpNum("limit", 10));
		setPage(qpNum("page", 1));
		initializedRef.current = true;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);

	// Reflect local state to URL so navigation preserves filters
	useEffect(() => {
		if (!initializedRef.current) return;
		const params = new URLSearchParams();
		if (q) params.set("q", q);
		if (minPrice) params.set("minPrice", String(minPrice));
		if (maxPrice) params.set("maxPrice", String(maxPrice));
		if (camere) params.set("camere", String(camere));
		if (suprafataMin) params.set("suprafataMin", String(suprafataMin));
		if (suprafataMax) params.set("suprafataMax", String(suprafataMax));
		params.set("page", String(page));
		params.set("limit", String(limit));
		params.set("sortBy", sortBy);
		params.set("order", order);
		router.replace(`?${params.toString()}`, { scroll: false });
	}, [q, minPrice, maxPrice, camere, suprafataMin, suprafataMax, page, limit, sortBy, order, router]);

	useEffect(() => {
		// reset delete-image selection when editing changes
		setEditingDeleteImageIds([]);
	}, [editing]);

	const handleCreate = async (fd) => {
		setSubmitting(true);
		setError(null);
		try {
			await AxiosInstance.post("/resources", fd, { headers: { "Content-Type": "multipart/form-data" } });
			setCreating(false);
			setPage(1);
			await fetchMine();
		} catch (e) {
			const msg = e?.response?.data?.error || e?.message || t('common.createFailed');
			setError(msg);
		} finally {
			setSubmitting(false);
		}
	};

	const handleUpdate = async (id, fd) => {
		setSubmitting(true);
		setError(null);
		try {
			await AxiosInstance.put(`/resources/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
			setEditing(null);
			await fetchMine();
		} catch (e) {
			const msg = e?.response?.data?.error || e?.message || t('common.updateFailed');
			setError(msg);
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async (id) => {
		setError(null);
		try {
			await AxiosInstance.delete(`/resources/${id}`);
			await fetchMine();
		} catch (e) {
			const msg = e?.response?.data?.error || e?.message || t('common.deleteFailed');
			setError(msg);
		}
	};

	return (
		<>
		<div className="max-w-6xl mx-auto py-6 md:py-0">
			<div className="mt-4 flex flex-col md:flex-row md:gap-6">
				<div className="flex items-center justify-center bg-stone-100 rounded-lg md:mt-6 md:hidden">
					<H1 className={"mt-6 mb-6"}>{t('account.myResources')}</H1>
				</div>
				<div className="md:bg-stone-100 hidden md:block sm:bg-white rounded-lg md:w-72 w-full md:shrink-0 p-4 md:mt-6 md:mb-12">
					<AccountSideBar className="bg-stone-100  p-4 md:bg-white md:p-0 rounded-lg" sticky={false} items={[
						{ href: "/user/profile", label: t('account.myProfile') },
						{ href: "/user/dashboard", label: t('account.myResources') },
					]} />
					{/* Small map under the sidebar */}
					{markers.length > 0 ? (
						<div className="mt-6 bg-white p-2 rounded-lg">
							<MultiPinMap
								markers={markers}
								heightClass="h-[400px]"
								className="cursor-pointer"
								onMapClick={() => setMapOpen(true)}
								onMarkerClick={(m) => router.push(`/user/dashboard/${m.id}`)}
							/>
						</div>
					) : null}
				</div>
				<div className="flex-1">
					<div className="flex items-center justify-center bg-stone-100 rounded-lg md:mt-6">
						<H1 className={"hidden md:block mt-6 mb-6"}>{t('account.myResources')}</H1>
					</div>
			<Div className="mt-4 mb-12">
				{error ? (
					<Div className="p-3 my-4 bg-red-100 text-red-800 border border-red-200 rounded">{error}</Div>
				) : null}

				<FilterUpBar
					key={filterUpBarKey}
					defaultQuery={q}
					defaultValues={dashboardDefaultValues}
					filters={dashboardFilters}
					onApply={({ query, values }) => {
						const [sb = "createdAt", ord = "DESC"] = String(values?.sort || `${sortBy}:${order}`).split(":");
						setSortBy(sb);
						setOrder((ord || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC");
						setQ(query || "");
						setMinPrice(values?.minPrice ?? "");
						setMaxPrice(values?.maxPrice ?? "");
						setCamere(values?.camere ?? "");
						setSuprafataMin(values?.suprafataMin ?? "");
						setSuprafataMax(values?.suprafataMax ?? "");
						setPage(1);
					}}
					onClear={() => {
						setQ("");
						setSortBy("createdAt");
						setOrder("DESC");
						setMinPrice("");
						setMaxPrice("");
						setCamere("");
						setSuprafataMin("");
						setSuprafataMax("");
						setPage(1);
					}}
					className="mb-4"
				/>

				{loading ? (
					<P>{t('common.loading')}</P>
				) : items.length === 0 ? (
					<Div>
						<P className="mt-6 mb-4">{t('resources.mine.empty')}</P>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="w-full">
								<VerticalAddCard onClick={() => setCreating(true)} />
							</div>
						</div>
					</Div>
				) : (
					<>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="w-full">
								<VerticalAddCard onClick={() => setCreating(true)} />
							</div>
							{items.map((p) => {
								const firstImage = p?.images?.[0]?.url ? toAbsoluteUrl(p.images[0].url) : DEFAULT_LANDSCAPE_PLACEHOLDER;
								return (
									<div key={p.id} className="w-full">
										<VerticalCard
											href={`/user/dashboard/${p.id}`}
											imageSrc={firstImage}
											imageAlt={p.name}
											title={p.name}
											price={`${formatPrice(p.price)} lei`}
											description={p.description || ""}
											features={p.features || []}
											actions={[
												{ label: "", variant: "empty-blue", icon: <PencilSquareIcon className="w-5 h-5" />, onClick: () => setEditing(p), ariaLabel: t('resource.form.editAria', { name: p.name }) },
												{ label: "", variant: "empty-red", icon: <TrashIcon className="w-5 h-5" />, onClick: () => { setToDeleteId(p.id); setConfirmDeleteOpen(true); }, ariaLabel: t('resource.form.deleteAria') },
											]}
										/>
									</div>
								);
							})}
						</div>

						<Pagination
							page={page}
							total={total}
							limit={limit}
							onPageChange={(n) => setPage(n)}
							tone="neutral"
						/>
					</>
				)}
			</Div>

						{/* Big modal map */}
						<ModalMultiPinMap
							open={mapOpen}
							onClose={() => setMapOpen(false)}
							markers={markers}
							title={t('resources.mapTitle')}
							onMarkerClick={(m) => router.push(`/user/dashboard/${m.id}`)}
						/>

						<GeneralScrollableFormModal
							open={creating}
							onClose={() => setCreating(false)}
							title={t('resource.form.addTitle')}
							submitLabel={t('resource.form.create')}
							showClose={true}
							cols={1}
							className=""
							onSubmit={async (payload) => {
								// ensure FormData
								let fd;
								if (typeof FormData !== 'undefined' && payload instanceof FormData) {
									fd = payload;
								} else {
									fd = new FormData();
									Object.keys(payload || {}).forEach((k) => {
										const v = payload[k];
										if (Array.isArray(v)) {
											// If array of File/Blob, append each; otherwise JSON stringify the array
											const isFiles = v.every((it) => (typeof File !== 'undefined' && it instanceof File) || (typeof Blob !== 'undefined' && it instanceof Blob));
											if (isFiles) {
												v.forEach((it) => fd.append(k, it));
											} else {
												fd.append(k, JSON.stringify(v));
											}
										} else if (v !== undefined && v !== null) {
											fd.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
										}
									});
								}
								try {
									await AxiosInstance.post('/resources', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
									setCreating(false);
									await fetchMine();
									return { success: true, message: t('resource.form.createdSuccess') || 'Created' };
								} catch (e) {
									const msg = e?.response?.data?.error || e?.message || t('common.createFailed');
									setError(msg);
									return { success: false, message: msg };
								}
							}}
							fields={createFields}
						/>

												<GeneralScrollableFormModal
													open={Boolean(editing)}
													onClose={() => setEditing(null)}
													title={t('resource.form.editTitle')}
													header={(
														<>
															{editing?.images?.length ? (
																<Div className="space-y-2 mb-4">
																	<Label>{t('resource.form.existingImages')}</Label>
																	<Div className="grid grid-cols-3 gap-2">
																		{editing.images.map((img) => (
																			<button
																				type="button"
																				key={img.id}
																				onClick={() => setEditingDeleteImageIds((prev) => (prev.includes(img.id) ? prev.filter((x) => x !== img.id) : [...prev, img.id]))}
																				className={`border rounded p-1 relative ${editingDeleteImageIds.includes(img.id) ? 'ring-2 ring-red-500' : ''}`}
																				title={editingDeleteImageIds.includes(img.id) ? t('resource.form.markedForDeletion') : t('resource.form.clickToMarkDelete')}
																			>
																				<Image src={toAbsoluteUrl(img.url)} alt={img.alt || ''} width={300} height={300} className="w-full h-24 object-cover rounded" unoptimized />
																				{editingDeleteImageIds.includes(img.id) ? (
																					<span className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1 py-0.5 rounded">{t('resource.form.deleteBadge')}</span>
																				) : null}
																			</button>
																		))}
																	</Div>
																</Div>
															) : null}
														</>
													)}
													submitLabel={t('resource.form.save')}
													showClose={true}
													cols={{ base: 1, md: 1 }}
													className=""
													onSubmit={async (payload) => {
														let fd;
														if (typeof FormData !== 'undefined' && payload instanceof FormData) {
															fd = payload;
														} else {
															fd = new FormData();
															Object.keys(payload || {}).forEach((k) => {
																const v = payload[k];
																if (Array.isArray(v)) {
																	const isFiles = v.every((it) => (typeof File !== 'undefined' && it instanceof File) || (typeof Blob !== 'undefined' && it instanceof Blob));
																	if (isFiles) {
																		v.forEach((it) => fd.append(k, it));
																	} else {
																		fd.append(k, JSON.stringify(v));
																	}
																} else if (v !== undefined && v !== null) {
																	fd.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
																}
															});
														}
														if (editingDeleteImageIds && editingDeleteImageIds.length) {
															fd.append('deleteImageIds', editingDeleteImageIds.join(','));
														}
														try {
															await AxiosInstance.put(`/resources/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
															setEditing(null);
															await fetchMine();
															return { success: true, message: t('resource.form.updatedSuccess') || 'Updated' };
														} catch (e) {
															const msg = e?.response?.data?.error || e?.message || t('common.updateFailed');
															setError(msg);
															return { success: false, message: msg };
														}
													}}
													fields={editFields}
												/>

					<DangerModal
						open={confirmDeleteOpen}
						onClose={() => { setConfirmDeleteOpen(false); setToDeleteId(null); }}
						title={t('resource.form.deleteTitle')}
						message={t('resource.form.deleteMessage')}
						confirmText={t('resource.form.deleteConfirm')}
						cancelText={t('modal.confirm.cancel')}
						onConfirm={() => toDeleteId ? handleDelete(toDeleteId) : null}
					/>
				</div>
			</div>
		</div>
		</>
	);
}

