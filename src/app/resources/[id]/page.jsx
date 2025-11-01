"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Div, H1, P, Button, SocialButton, ReportButton } from "@/components/ui/general/primitives";
import { useLanguage } from "@/context/language-context";
import GalleryWithCarousel from "@/components/ui/general/gallery/gallery-with-carousel";
import MultiPinMap from "@/components/ui/general/maps/multi-pin-map";
import ModalMultiPinMap from "@/components/ui/general/modals/multi-pin-map-modal";
import CommentList from "@/components/ui/general/comments/comment-list";
import CommentInput from "@/components/ui/general/comments/comment-input";
import AxiosInstance from "@/lib/api/api";
import { useSelector } from "react-redux";
import { Modal, DangerModal } from "@/components/ui/general/modals/Modal";
import SubNavSearchBar from "@/components/ui/general/search/sub-nav-search-bar";
import { useRouter } from "next/navigation";

import { API_BASE, toAbsoluteUrl } from "@/utils/url";
import { formatPrice } from "@/utils/number";
import { DEFAULT_LANDSCAPE_PLACEHOLDER } from "@/utils/images";

function normalizeBool(v) {
	if (typeof v === "boolean") return v;
	if (v == null) return undefined;
	const s = String(v).trim().toLowerCase();
	if (["true", "1", "da", "yes", "y"].includes(s)) return true;
	if (["false", "0", "nu", "no", "n"].includes(s)) return false;
	return undefined;
}

export default function ProductDetailPage() {
	const { t } = useLanguage();
	const params = useParams();
	const router = useRouter();
	const id = params?.id;

	const [item, setItem] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [activeIndex, setActiveIndex] = useState(0);
	const [mapOpen, setMapOpen] = useState(false);
	const [comments, setComments] = useState([]);
	const [commentMessage, setCommentMessage] = useState("");
	const [deleteCommentConfirmOpen, setDeleteCommentConfirmOpen] = useState(false);
	const [commentToDelete, setCommentToDelete] = useState(null);
	const [editCommentOpen, setEditCommentOpen] = useState(false);
	const [editingComment, setEditingComment] = useState(null);
	const [editCommentMessage, setEditCommentMessage] = useState("");
	const currentUser = useSelector((state) => state?.user?.info || null);
	console.log("Current user in ProductDetailPage:", currentUser);

	const formatFeatureLabel = useCallback((f) => {
		if (typeof f === "string") return f;
		const rawName = String(f?.name || "").trim();
		const value = f?.value;
		if (!rawName && !value) return "";
		const name = rawName.toLowerCase();

		if (["new", "nou"].includes(name)) {
			const b = normalizeBool(value);
			if (b === true) return t("resource.features.new") || "Nou";
			if (b === false) return t("resource.features.used") || "Folosit";
			return "";
		}
		if (["surface", "suprafata", "suprafață"].includes(name)) {
			return value ? String(value) : "";
		}
		if (["level", "etaj"].includes(name)) {
			return value ? String(value) : "";
		}
		const labelName = rawName || "";
		const labelValue = value != null && String(value).length ? String(value) : "";
		return [labelName, labelValue].filter(Boolean).join(": ");
	}, [t]);

	const images = useMemo(() => {
		const list = Array.isArray(item?.images) ? item.images : [];
		return list.map((im) => ({
			id: im?.id ?? undefined,
			url: toAbsoluteUrl(im?.url) || DEFAULT_LANDSCAPE_PLACEHOLDER,
			alt: im?.alt || item?.name || "",
		}));
	}, [item]);

	const mainImage = images?.[activeIndex] || images?.[0] || {
		url: DEFAULT_LANDSCAPE_PLACEHOLDER,
		alt: item?.name || "",
	};

	const fetchItem = useCallback(async () => {
		if (!id) return;
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`${API_BASE}/resources/${id}`, { cache: "no-store" });
			if (!res.ok) throw new Error(`Eroare la încărcare: ${res.status}`);
			const data = await res.json();
			setItem(data || null);
			setActiveIndex(0);
		} catch (e) {
			setError(e?.message || t("common.genericError"));
		} finally {
			setLoading(false);
		}
	}, [id, t]);

	useEffect(() => { fetchItem(); }, [fetchItem]);

	// Fetch comments for this resource
	const fetchComments = useCallback(async () => {
		if (!id) return;
		try {
			const res = await fetch(`${API_BASE}/resources/${id}/comments`, { cache: 'no-store' });
			if (!res.ok) throw new Error('Failed to fetch comments');
			const data = await res.json();
			setComments(Array.isArray(data) ? data : []);
		} catch (_) {
			// ignore errors for comments fetching; keep UI working
		}
	}, [id]);

	useEffect(() => { fetchComments(); }, [fetchComments]);

	const handleAddComment = useCallback(async () => {
		const msg = (commentMessage || '').trim();
		if (!msg) return;
		try {
			await AxiosInstance.post(`/resources/${id}/comments`, { message: msg });
			setCommentMessage("");
			await fetchComments();
		} catch (e) {
			setError(e?.response?.data?.error || e?.message || t('common.createFailed'));
		}
	}, [commentMessage, id, fetchComments, t]);

	const handleDeleteCommentConfirm = useCallback((comment) => {
		setCommentToDelete(comment);
		setDeleteCommentConfirmOpen(true);
	}, []);

	const handleDeleteComment = useCallback(async () => {
		if (!commentToDelete) return;
		try {
			await AxiosInstance.delete(`/resources/${id}/comments/${commentToDelete.id}`);
			await fetchComments();
			setDeleteCommentConfirmOpen(false);
			setCommentToDelete(null);
		} catch (e) {
			setError(e?.response?.data?.error || e?.message || t('common.deleteFailed'));
		}
	}, [commentToDelete, id, fetchComments, t]);

	const handleEditComment = useCallback((comment) => {
		setEditingComment(comment);
		setEditCommentMessage(comment.message);
		setEditCommentOpen(true);
	}, []);

	const handleSaveEditComment = useCallback(async () => {
		if (!editingComment) return;
		const msg = editCommentMessage.trim();
		if (!msg) return;
		try {
			await AxiosInstance.put(`/resources/${id}/comments/${editingComment.id}`, { message: msg });
			await fetchComments();
			setEditCommentOpen(false);
			setEditingComment(null);
			setEditCommentMessage("");
		} catch (e) {
			setError(e?.response?.data?.error || e?.message || t('common.updateFailed'));
		}
	}, [editingComment, editCommentMessage, id, fetchComments, t]);

	// Single marker built from coordinates when available
	const marker = useMemo(() => {
		if (item?.coordinates && item.coordinates.latitude != null && item.coordinates.longitude != null) {
			return {
				id: item.id,
				lat: parseFloat(item.coordinates.latitude),
				lng: parseFloat(item.coordinates.longitude),
				label: item.name || '',
			};
		}
		return null;
	}, [item]);

	return (
		<Div className="min-h-screen">
			<SubNavSearchBar
				sticky
				onSubmit={(q) => router.push(`/resources?q=${encodeURIComponent(q)}`)}
				placeholder={t('resources.searchPlaceholder') || 'Caută resurse…'}
			/>
			<Div className="mx-auto w-full max-w-6xl px-4 md:px-6 py-6">
				<div className="flex items-center justify-center bg-stone-100 rounded-lg">
					<H1 className="mt-6 mb-6">{item?.name || t('resource.title')}</H1>
				</div>

				<Div className="mt-4">
					{error ? (
						<Div className="p-3 my-4 bg-red-100 text-red-800 border border-red-200 rounded">{error}</Div>
					) : null}

					{loading ? (
						<P>{t('common.loading')}</P>
					) : !item ? (
						<P className="mt-6">{t('common.noResults') || 'Niciun rezultat'}</P>
					) : (
						<>
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
							{/* Left/Main: Gallery + quick features */}
							<div className="lg:col-span-2">
								<GalleryWithCarousel images={images.map(im => ({ src: im.url, alt: im.alt }))} className="bg-stone-100" showThumbs={true} />
								{Array.isArray(item.features) && item.features.length > 0 ? (
									<div className="mt-3 -mb-1 overflow-x-auto">
										<div className="flex items-center gap-2 min-w-max pr-2">
											{item.features.map((f, i) => {
												const label = formatFeatureLabel(f);
												if (!label) return null;
												return (
													<span
														key={i}
														className="inline-flex items-center rounded-md bg-imo px-3 py-1 text-xs font-medium text-gray-900 shadow-sm"
													>
														{label}
													</span>
												);
											})}
										</div>
									</div>
								) : null}
								{/* Description block (desktop only) */}
								{item.description ? (
									<div className="hidden md:block mt-6 p-4 md:p-6 bg-stone-100  rounded-lg">
										<h2 className="text-xl font-semibold text-black mb-2">{t('resource.description') || 'Descriere'}</h2>
										<P className="text-sm text-gray-700 whitespace-pre-line">{item.description}</P>
									</div>
								) : null}
								{/* Map (desktop) */}
								{marker ? (
									<div className="mt-4 hidden md:block">
										<MultiPinMap
											markers={[marker]}
											className="cursor-pointer"
											onMapClick={() => setMapOpen(true)}
										/>
									</div>
								) : null}
							</div>

							{/* Right: Sidebar actions (placeholder) */}
							<aside className="space-y-4 h-full bg-stone-100 p-4 shadow-sm rounded-lg">
								<div className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
									<div className="text-2xl font-semibold text-black mb-2">
										{item.price !== undefined && item.price !== null && String(item.price).length > 0
											? `${t('common.price')} ${formatPrice(item.price)} lei`
											: '--'}
									</div>
								</div>

								<div className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
									<h3 className="text-lg text-black font-semibold mb-2">{t('resource.actions') || 'Acțiuni'}</h3>
									<div className="flex flex-col gap-2">
										<Button variant="empty-blue">Trimite mesaj</Button>
										<Button variant="empty-blue">{t('resources.buy')}</Button>
									</div>
								</div>

								<div>
									<div className="mt-2 flex items-center justify-center gap-2 flex-nowrap">
										<SocialButton provider="twitter" ariaLabel="Twitter" size="sm" className="w-10 h-10 !px-0 !py-0" />
										<SocialButton provider="facebook" ariaLabel="Facebook" size="sm" className="w-10 h-10 !px-0 !py-0" />
										<SocialButton provider="linkedin" ariaLabel="LinkedIn" size="sm" className="w-10 h-10 !px-0 !py-0" />
										<SocialButton provider="instagram" ariaLabel="Instagram" size="sm" className="w-10 h-10 !px-0 !py-0" />
									</div>
									<div className="mt-3 flex gap-2 justify-center">
										<ReportButton fullWidth />
									</div>
								</div>				
							</aside>
							</div>
							{/* Mobile-only description placed after the grid so it's always last on phone */}
							{item.description ? (
								<div className="md:hidden mt-4 p-4 bg-stone-100 rounded-lg shadow-sm">
									<h2 className="text-lg font-semibold text-black mb-2">{t('resource.description') || 'Descriere'}</h2>
									<P className="text-sm text-gray-700 whitespace-pre-line">{item.description}</P>
								</div>
							) : null}
							{/* Map (mobile) */}
							{marker ? (
								<div className="md:hidden mt-4">
									<MultiPinMap
										markers={[marker]}
										className="cursor-pointer"
										onMapClick={() => setMapOpen(true)}
									/>
								</div>
							) : null}

								{/* Comments section */}
								<div className="mt-6">
									<h2 className="text-xl font-semibold text-black mb-2">{t('resource.comments.title') || 'Comentarii'}</h2>
									<CommentInput
										value={commentMessage}
										setValue={setCommentMessage}
										onSubmit={handleAddComment}
										disabled={!currentUser}
									/>
									{!currentUser ? (
										<p className="text-sm text-gray-500 mt-2">{t('resource.comments.loginToComment') || 'Autentifică-te pentru a adăuga comentarii.'}</p>
									) : null}
									<div className="mt-2">
										<CommentList
											comments={comments}
											language={t('lang') || 'ro'}
											t={t}
											onDelete={handleDeleteCommentConfirm}
											onEdit={handleEditComment}
											currentUserId={currentUser?.id}
											resourceOwnerId={item?.owner?.id}
										/>
									</div>
								</div>
							</>
					)}
				</Div>
				{/* Big modal map */}
				<ModalMultiPinMap
					open={mapOpen}
					onClose={() => setMapOpen(false)}
					markers={marker ? [marker] : []}
					title={item?.name || ''}
				/>

				{/* Confirm delete comment */}
				<DangerModal
					open={deleteCommentConfirmOpen}
					onClose={() => { setDeleteCommentConfirmOpen(false); setCommentToDelete(null); }}
					title={t('modal.confirm.title')}
					message={t('modal.confirm.deleteComment')}
					confirmText={t('modal.confirm.confirm')}
					cancelText={t('modal.confirm.cancel')}
					onConfirm={handleDeleteComment}
				/>

				{/* Edit comment modal */}
				<Modal
					open={editCommentOpen}
					onClose={() => { setEditCommentOpen(false); setEditingComment(null); setEditCommentMessage(""); }}
					title={t('modal.edit.title')}
				>
					<div className="p-4">
						<textarea
							value={editCommentMessage}
							onChange={(e) => setEditCommentMessage(e.target.value)}
							className="w-full p-2 border rounded"
							rows={4}
							maxLength={500}
						/>
						<div className="flex justify-end gap-2 mt-4">
							<Button variant="secondary" onClick={() => { setEditCommentOpen(false); setEditingComment(null); setEditCommentMessage(""); }}>
								{t('modal.edit.cancel')}
							</Button>
							<Button onClick={handleSaveEditComment}>
								{t('modal.edit.save')}
							</Button>
						</div>
					</div>
				</Modal>
			</Div>
		</Div>
	);
}

