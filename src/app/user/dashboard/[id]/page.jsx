"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Div, H1, P, Button, Label } from "@/components/ui/general/primitives";
import AccountSideBar from "@/components/ui/general/account/account-sidebar";
import { useLanguage } from "@/context/language-context";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import GalleryWithCarousel from "@/components/ui/general/gallery/gallery-with-carousel";
import AxiosInstance from "@/lib/api/api";
import dashboardConfig from "@/config/dashboard-config";
import GeneralScrollableFormModal from "@/components/ui/general/modals/general-scrollable-form-modal";
import { Modal, DangerModal } from "@/components/ui/general/modals/Modal";
import MultiPinMap from "@/components/ui/general/maps/multi-pin-map";
import ModalMultiPinMap from "@/components/ui/general/modals/multi-pin-map-modal";
import VerticalExpandableTableWithHeader from "@/components/ui/general/table/vertical-expandable-with-header";
import CommentList from "@/components/ui/general/comments/comment-list";
import CommentInput from "@/components/ui/general/comments/comment-input";
import { API_BASE } from "@/utils/url";
import { useSelector } from "react-redux";

import { toAbsoluteUrl } from "@/utils/url";
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

export default function VendorProductDetailPage() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const items = useMemo(() => ([
    { href: "/user/profile", label: t('account.myProfile') },
  { href: "/user/dashboard", label: t('account.myResources') },
  ]), [t]);

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapOpen, setMapOpen] = useState(false);

  // vendor actions state
  const [editing, setEditing] = useState(null);
  const [editingDeleteImageIds, setEditingDeleteImageIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  // unified confirm modal
  const [confirmDialog, setConfirmDialog] = useState(null);
  // item-in-item (resource items) state
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  // comments
  const [comments, setComments] = useState([]);
  const [commentMessage, setCommentMessage] = useState("");
  const [editCommentOpen, setEditCommentOpen] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentMessage, setEditCommentMessage] = useState("");
  const currentUser = useSelector((state) => state?.user?.info || null);

  const images = useMemo(() => {
    const list = Array.isArray(item?.images) ? item.images : [];
    return list.map((im) => ({
      id: im?.id ?? undefined,
      url: toAbsoluteUrl(im?.url) || DEFAULT_LANDSCAPE_PLACEHOLDER,
      alt: im?.alt || item?.name || "",
    }));
  }, [item]);

  const formatFeatureLabel = useCallback(
    (f) => {
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
    },
    [t]
  );

  const fetchItem = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
  const res = await AxiosInstance.get(`/resources/${id}`);
      const data = res.data;
      setItem(data || null);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || t("common.genericError"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    if (!id) return;
    try {
      const res = await AxiosInstance.get(`/resources/${id}/comments`);
      setComments(Array.isArray(res.data) ? res.data : []);
    } catch (_) {
      // ignore
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

  const handleDeleteComment = useCallback(async (comment) => {
    if (!comment?.id) return;
    try {
      await AxiosInstance.delete(`/resources/${id}/comments/${comment.id}`);
      await fetchComments();
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || t('common.deleteFailed'));
    }
  }, [id, fetchComments, t]);

  const handleDeleteCommentConfirm = useCallback((comment) => {
    if (!comment) return;
    setConfirmDialog({
      title: t('modal.confirm.title'),
      message: t('modal.confirm.deleteComment'),
      confirmText: t('modal.confirm.confirm'),
      cancelText: t('modal.confirm.cancel'),
      onConfirm: async () => {
        await handleDeleteComment(comment);
      },
    });
  }, [t, handleDeleteComment]);

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

  // reset delete-image selection when editing changes
  useEffect(() => {
    setEditingDeleteImageIds([]);
  }, [editing]);

  const handleUpdate = async (fd) => {
    setSubmitting(true);
    setError(null);
    try {
      if (editingDeleteImageIds && editingDeleteImageIds.length) {
        fd.append("deleteImageIds", editingDeleteImageIds.join(","));
      }
  await AxiosInstance.put(`/resources/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEditing(null);
      await fetchItem();
  return { success: true, message: t("resource.form.updatedSuccess") || "Updated" };
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || t("common.updateFailed");
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = useCallback(async (resourceItem) => {
    if (!resourceItem?.id) return;
    try {
      await AxiosInstance.delete(`/resources/${id}/items/${resourceItem.id}`);
      await fetchItem();
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || t('common.deleteFailed');
      setError(msg);
    }
  }, [id, fetchItem, t]);

  const handleDelete = async () => {
    setError(null);
    try {
  await AxiosInstance.delete(`/resources/${id}`);
      // Navigate back to vendor dashboard list after successful delete
      router.push('/user/dashboard');
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || t("common.deleteFailed");
      setError(msg);
    }
  };

  const editFields = useMemo(() => dashboardConfig.getEditFields(t, item), [t, item]);
  const itemFields = useMemo(() => ([
    { name: 'name', label: t('resource.item.name') || 'Nume', type: 'text', required: true },
    { name: 'quantity', label: t('resource.item.quantity') || 'Cantitate', type: 'number', required: true, validate: { min: 0 } },
    { name: 'price', label: t('resource.item.price') || 'Preț', type: 'number', required: true, validate: { min: 0 } },
  ]), [t]);

  const markers = useMemo(() => {
    const lat = item?.coordinates?.latitude;
    const lng = item?.coordinates?.longitude;
    if (lat == null || lng == null) return [];
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) return [];
    return [
      {
        id: item?.id,
        lat: latNum,
        lng: lngNum,
        label: item?.name || t("resource.title"),
      },
    ];
  }, [item, t]);

  return (
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6 py-6 md:py-0">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:hidden flex items-center justify-center bg-stone-100 rounded-lg p-4">
              <H1 className="mt-2 mb-2">{item?.name || t("resource.title")}</H1>
            </div>
            {/* Mobile action bar under title, separate box */}
            {item ? (
              <div className="md:hidden mt-2 bg-stone-100 rounded-lg p-3 flex items-center justify-between">
                <div className="text-xl font-semibold text-black">
                  {item.price !== undefined && item.price !== null && String(item.price).length > 0
                    ? `${t("common.price")} ${formatPrice(item.price)} lei`
                    : "--"}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="empty-blue"
                    aria-label={t('resource.form.editAria', { name: item?.name || '' })}
                    onClick={() => setEditing(item)}
                    className="!px-2 !py-2"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="empty-red"
                    aria-label={t('resource.form.deleteAria')}
                    onClick={() => setConfirmDialog({
                      title: t('resource.form.deleteTitle'),
                      message: t('resource.form.deleteMessage'),
                      confirmText: t('resource.form.deleteConfirm'),
                      cancelText: t('modal.confirm.cancel'),
                      onConfirm: async () => { await handleDelete(); },
                    })}
                    className="!px-2 !py-2"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ) : null}

          <div className="hidden md:block md:bg-stone-100 sm:bg-white rounded-lg md:w-72 w-full md:shrink-0 p-4 md:mt-12 md:mb-6">
                    <AccountSideBar className="bg-stone-100  p-4 md:bg-white md:p-0 rounded-lg" sticky={false} items={[
                      { href: "/user/profile", label: t('account.myProfile') },
                      { href: "/user/dashboard", label: t('account.myResources') },
                    ]} />
                    {/* Small map under the sidebar */}
                    {markers.length > 0 ? (
                      <div className="hidden md:block mt-6 bg-white p-2 rounded-lg">
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
            {/* Mobile title (top) */}
            <div className="px-4 pb-4 md:px-6 md:pb-6 rounded-lg md:mt-12">
          {error ? (
            <Div className="p-3 my-4 bg-red-100 text-red-800 border border-red-200 rounded">{error}</Div>
          ) : null}

          {loading ? (
            <P>{t("common.loading")}</P>
          ) : !item ? (
            <P className="mt-6">{t("common.noResults") || "Niciun rezultat"}</P>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 mt-2">
                {/* Main: Title, action bar, Gallery + quick features */}
                <div>
                  {/* Desktop title (below, only on desktop) */}
                  <div className="hidden md:flex items-center justify-center bg-stone-100 rounded-lg mb-4">
                    <H1 className="mt-6 mb-6">{item?.name || t("resource.title")}</H1>
                  </div>
                  {/* Desktop action bar under title */}
                  <div className="hidden md:flex items-center justify-between bg-stone-100 rounded-lg mb-4 px-4 py-3">
                    <div className="text-2xl font-semibold text-black">
                      {item.price !== undefined && item.price !== null && String(item.price).length > 0
                        ? `${t("common.price")} ${formatPrice(item.price)} lei`
                        : "--"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="empty-blue"
                        aria-label={t('resource.form.editAria', { name: item?.name || '' })}
                        onClick={() => setEditing(item)}
                        className="!px-2 !py-2"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="empty-red"
                        aria-label={t('resource.form.deleteAria')}
                        onClick={() => setConfirmDialog({
                          title: t('resource.form.deleteTitle'),
                          message: t('resource.form.deleteMessage'),
                          confirmText: t('resource.form.deleteConfirm'),
                          cancelText: t('modal.confirm.cancel'),
                          onConfirm: async () => { await handleDelete(); },
                        })}
                        className="!px-2 !py-2"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  <GalleryWithCarousel
                    images={images.map((im) => ({ src: im.url, alt: im.alt }))}
                    className="bg-stone-100"
                    showThumbs={true}
                  />
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

                  {/* Description block (desktop only) */
                  }
                  {item.description ? (
                    <div className="hidden md:block mt-6 p-4 md:p-6 bg-stone-100  rounded-lg">
                      <h2 className="text-xl font-semibold text-black mb-2">{t("resource.description") || "Descriere"}</h2>
                      <P className="text-sm text-gray-700 whitespace-pre-line">{item.description}</P>
                    </div>
                  ) : null}

                  {/* Items table (desktop) */}
                  <div className="hidden md:block mt-4">
                    <VerticalExpandableTableWithHeader
                      title={t('resource.item.title') || 'Articole'}
                      addLabel={t('resource.item.add') || 'Adaugă articol'}
                      onAdd={() => setAddItemOpen(true)}
                      data={Array.isArray(item?.items) ? item.items : []}
                      columns={[
                        { key: 'name', label: t('resource.item.name') || 'Nume' },
                        { key: 'quantity', label: t('resource.item.quantity') || 'Cantitate' },
                        { key: 'price', label: t('resource.item.price') || 'Preț' },
                      ]}
                      actions={[
                        {
                          title: t('common.edit') || 'Editează',
                          className: 'text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 rounded',
                          icon: <PencilSquareIcon className="w-4 h-4" />,
                          onClick: (row) => setEditItem(row),
                          ariaLabel: t('common.edit') || 'Editează',
                        },
                        {
                          title: t('common.delete') || 'Șterge',
                          className: 'text-red-700 hover:text-white border border-red-700 hover:bg-red-800 rounded',
                          icon: <TrashIcon className="w-4 h-4" />,
                          onClick: (row) => {
                            setConfirmDialog({
                              title: t('resource.item.deleteTitle') || 'Ștergi articolul?',
                              message: t('resource.item.deleteMessage') || 'Ești sigur că vrei să ștergi acest articol?',
                              confirmText: t('modal.confirm.confirm'),
                              cancelText: t('modal.confirm.cancel'),
                              onConfirm: async () => { await handleDeleteItem(row); },
                            });
                          },
                          ariaLabel: t('common.delete') || 'Șterge',
                        },
                      ]}
                      defaultVisibleKeys={['name','quantity','price']}
                    />
                  </div>

                </div>

                {/* Removed sidebar actions; actions moved under title */}
              </div>

              {/* Mobile-only description */}
              {item.description ? (
                <div className="md:hidden mt-4 p-4 bg-stone-100 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold text-black mb-2">{t("resource.description") || "Descriere"}</h2>
                  <P className="text-sm text-gray-700 whitespace-pre-line">{item.description}</P>
                </div>
              ) : null}

              {/* Items table (mobile) */}
              <div className="md:hidden mt-4">
                <VerticalExpandableTableWithHeader
                  title={t('resource.item.title') || 'Articole'}
                  addLabel={t('resource.item.add') || 'Adaugă articol'}
                  onAdd={() => setAddItemOpen(true)}
                  data={Array.isArray(item?.items) ? item.items : []}
                  columns={[
                    { key: 'name', label: t('resource.item.name') || 'Nume' },
                    { key: 'quantity', label: t('resource.item.quantity') || 'Cantitate' },
                    { key: 'price', label: t('resource.item.price') || 'Preț' },
                  ]}
                  actions={[
                    {
                      title: t('common.edit') || 'Editează',
                      className: 'text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 rounded',
                      icon: <PencilSquareIcon className="w-4 h-4" />,
                      onClick: (row) => setEditItem(row),
                      ariaLabel: t('common.edit') || 'Editează',
                    },
                    {
                      title: t('common.delete') || 'Șterge',
                      className: 'text-red-700 hover:text-white border border-red-700 hover:bg-red-800 rounded',
                      icon: <TrashIcon className="w-4 h-4" />,
                          onClick: (row) => {
                            setConfirmDialog({
                              title: t('resource.item.deleteTitle') || 'Ștergi articolul?',
                              message: t('resource.item.deleteMessage') || 'Ești sigur că vrei să ștergi acest articol?',
                              confirmText: t('modal.confirm.confirm'),
                              cancelText: t('modal.confirm.cancel'),
                              onConfirm: async () => { await handleDeleteItem(row); },
                            });
                          },
                      ariaLabel: t('common.delete') || 'Șterge',
                    },
                  ]}
                  defaultVisibleKeys={['name']}
                />
              </div>

              {/* Mobile map under description */}
              {markers.length > 0 ? (
                <div className="md:hidden mt-4">
                  <MultiPinMap
                    markers={markers}
                    heightClass="h-[280px]"
                    onMapClick={() => setMapOpen(true)}
                    onMarkerClick={() => setMapOpen(true)}
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
            </div>
          </div>
        </div>
          {/* Edit Modal */}
      <GeneralScrollableFormModal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
  title={t("resource.form.editTitle")}
        header={
          editing?.images?.length ? (
            <Div className="space-y-2 mb-4">
              <Label>{t("resource.form.existingImages")}</Label>
              <Div className="grid grid-cols-3 gap-2">
                {editing.images.map((img) => (
                  <button
                    type="button"
                    key={img.id}
                    onClick={() =>
                      setEditingDeleteImageIds((prev) =>
                        prev.includes(img.id) ? prev.filter((x) => x !== img.id) : [...prev, img.id]
                      )
                    }
                    className={`border rounded p-1 relative ${editingDeleteImageIds.includes(img.id) ? "ring-2 ring-red-500" : ""}`}
                    title={
                      editingDeleteImageIds.includes(img.id)
                        ? t("resource.form.markedForDeletion")
                        : t("resource.form.clickToMarkDelete")
                    }
                  >
                    <Image
                      src={toAbsoluteUrl(img.url)}
                      alt={img.alt || ""}
                      width={300}
                      height={300}
                      className="w-full h-24 object-cover rounded"
                      unoptimized
                    />
                    {editingDeleteImageIds.includes(img.id) ? (
                      <span className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1 py-0.5 rounded">
                        {t("resource.form.deleteBadge")}
                      </span>
                    ) : null}
                  </button>
                ))}
              </Div>
            </Div>
          ) : null
        }
  submitLabel={t("resource.form.save")}
        showClose={true}
        cols={{ base: 1, md: 1 }}
        className=""
        onSubmit={async (payload) => {
          let fd;
          if (typeof FormData !== "undefined" && payload instanceof FormData) {
            fd = payload;
          } else {
            fd = new FormData();
            Object.keys(payload || {}).forEach((k) => {
              const v = payload[k];
              if (Array.isArray(v)) {
                const isFiles = v.every(
                  (it) => (typeof File !== "undefined" && it instanceof File) || (typeof Blob !== "undefined" && it instanceof Blob)
                );
                if (isFiles) {
                  v.forEach((it) => fd.append(k, it));
                } else {
                  fd.append(k, JSON.stringify(v));
                }
              } else if (v !== undefined && v !== null) {
                fd.append(k, typeof v === "object" ? JSON.stringify(v) : String(v));
              }
            });
          }
          return handleUpdate(fd);
        }}
        fields={editFields}
      />

      {/* Unified Confirm Modal */}
      <DangerModal
        open={Boolean(confirmDialog)}
        onClose={() => setConfirmDialog(prev => { prev?.onCancel?.(); return null; })}
        title={confirmDialog?.title || t('modal.confirm.title')}
        message={confirmDialog?.message || ''}
        confirmText={confirmDialog?.confirmText || t('modal.confirm.confirm')}
        cancelText={confirmDialog?.cancelText || t('modal.confirm.cancel')}
        onConfirm={async () => {
          const cb = confirmDialog?.onConfirm;
          try { if (cb) await cb(); } finally { setConfirmDialog(null); }
        }}
      />

      {/* Map Modal */}
      <ModalMultiPinMap
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        title={t("resource.mapTitle") || "Locație pe hartă"}
        markers={markers}
      />

      {/* Add Item Modal */}
      <GeneralScrollableFormModal
        open={addItemOpen}
        onClose={() => setAddItemOpen(false)}
        title={t('resource.item.addTitle') || 'Adaugă articol'}
        submitLabel={t('common.save')}
        showClose={true}
        cols={{ base: 1, md: 3 }}
        onSubmit={async (vals) => {
          try {
            const payload = { ...vals };
            // ensure numbers
            if (payload.quantity !== undefined) payload.quantity = Number(payload.quantity);
            if (payload.price !== undefined) payload.price = Number(payload.price);
            await AxiosInstance.post(`/resources/${id}/items`, payload);
            setAddItemOpen(false);
            await fetchItem();
            return { success: true, message: t('common.created') || 'Creat' };
          } catch (e) {
            return { success: false, message: e?.response?.data?.error || e?.message || t('common.createFailed') };
          }
        }}
        fields={itemFields}
      />

      {/* Edit Item Modal */}
      <GeneralScrollableFormModal
        open={Boolean(editItem)}
        onClose={() => setEditItem(null)}
        title={t('resource.item.editTitle') || 'Editează articol'}
        submitLabel={t('common.save')}
        showClose={true}
        cols={{ base: 1, md: 3 }}
        initialValues={editItem ? { name: editItem.name, quantity: editItem.quantity, price: editItem.price } : {}}
        onSubmit={async (vals) => {
          if (!editItem) return { success: false, message: t('common.updateFailed') };
          try {
            const payload = { ...vals };
            if (payload.quantity !== undefined) payload.quantity = Number(payload.quantity);
            if (payload.price !== undefined) payload.price = Number(payload.price);
            await AxiosInstance.put(`/resources/${id}/items/${editItem.id}`, payload);
            setEditItem(null);
            await fetchItem();
            return { success: true, message: t('common.updated') || 'Actualizat' };
          } catch (e) {
            return { success: false, message: e?.response?.data?.error || e?.message || t('common.updateFailed') };
          }
        }}
        fields={itemFields}
      />

      {/* Legacy confirm modals removed; using unified modal above */}

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


      </div>
  );
}
