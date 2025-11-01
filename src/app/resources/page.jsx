"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SubNavSearchBar from "@/components/ui/general/search/sub-nav-search-bar";
import FilterSidebar from "@/components/ui/general/search/filter-sidebar";
import VerticalCard from "@/components/ui/general/cards/vertical-card";
import Pagination from "@/components/ui/general/pagination/pagination";
import { Div, H1, P } from "@/components/ui/general/primitives";
import { useLanguage } from "@/context/language-context";
import resourceFiltersConfig from '@/config/resource-filters-config';
import MultiPinMap from "@/components/ui/general/maps/multi-pin-map";
import ModalMultiPinMap from "@/components/ui/general/modals/multi-pin-map-modal";
import { API_BASE, toAbsoluteUrl } from "@/utils/url";
import { formatPrice } from "@/utils/number";
import { DEFAULT_LANDSCAPE_PLACEHOLDER } from "@/utils/images";

export default function PublicProductsPage() {
	const { t } = useLanguage();
	const router = useRouter();
	const searchParams = useSearchParams();
	const initializedRef = useRef(false);
	// Search in the sticky subnav
	const [query, setQuery] = useState("");
	// Local input state so typing doesn't trigger fetches; only submit applies to `query`
	const [searchInput, setSearchInput] = useState("");
	// Sidebar-driven values
	const [sortBy, setSortBy] = useState("createdAt");
	const [order, setOrder] = useState("DESC");
	const [limit, setLimit] = useState(10);
	const [minPrice, setMinPrice] = useState("");
	const [maxPrice, setMaxPrice] = useState("");
	const [camere, setCamere] = useState("");
	const [suprafataMin, setSuprafataMin] = useState("");
	const [suprafataMax, setSuprafataMax] = useState("");
	const [page, setPage] = useState(1);

	const [items, setItems] = useState([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Map modal state
	const [mapOpen, setMapOpen] = useState(false);

	const sidebarFilters = useMemo(() => resourceFiltersConfig.getFilters(t, sortBy, order), [t, sortBy, order]);
	// Seed FilterSidebar with the current values (including those hydrated from URL)
	const sidebarDefaultValues = useMemo(() => ({
		...resourceFiltersConfig.getDefaultValues(sortBy, order),
		minPrice: String(minPrice ?? ""),
		maxPrice: String(maxPrice ?? ""),
		camere: String(camere ?? ""),
		suprafataMin: String(suprafataMin ?? ""),
		suprafataMax: String(suprafataMax ?? ""),
	}), [sortBy, order, minPrice, maxPrice, camere, suprafataMin, suprafataMax]);

	// Force a one-time remount of FilterSidebar when defaults change so inputs show URL values after hydration
	const sidebarKey = useMemo(() => {
		return JSON.stringify({
			sort: `${sortBy}:${order}`,
			minPrice: String(minPrice ?? ""),
			maxPrice: String(maxPrice ?? ""),
			camere: String(camere ?? ""),
			suprafataMin: String(suprafataMin ?? ""),
			suprafataMax: String(suprafataMax ?? ""),
		});
	}, [sortBy, order, minPrice, maxPrice, camere, suprafataMin, suprafataMax]);

	const fetchResources = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const params = new URLSearchParams();
			if (query) params.set("q", query);
			if (minPrice) params.set("minPrice", String(minPrice));
			if (maxPrice) params.set("maxPrice", String(maxPrice));
			if (camere) params.set("camere", String(camere));
			if (suprafataMin) params.set("suprafataMin", String(suprafataMin));
			if (suprafataMax) params.set("suprafataMax", String(suprafataMax));
			params.set("page", String(page));
			params.set("limit", String(limit));
			params.set("sortBy", sortBy);
			params.set("order", order);
			const res = await fetch(`${API_BASE}/resources?${params.toString()}`, { cache: "no-store" });
			if (!res.ok) throw new Error(`Eroare la încărcare: ${res.status}`);
			const data = await res.json();
			setItems(Array.isArray(data?.items) ? data.items : []);
			setTotal(Number(data?.total) || 0);
		} catch (e) {
			setError(e?.message || "A apărut o eroare");
		} finally {
			setLoading(false);
		}
	}, [query, page, limit, sortBy, order, minPrice, maxPrice, camere, suprafataMin, suprafataMax]);

	useEffect(() => { fetchResources(); }, [fetchResources]);

	// On mount, hydrate state from URL params
	useEffect(() => {
		if (!searchParams) return;
		if (initializedRef.current) return;
		const qp = (k) => searchParams.get(k);
		const qpNum = (k, d) => {
			const v = qp(k);
			const n = v != null ? parseInt(v, 10) : NaN;
			return !isNaN(n) ? n : d;
		};
		setQuery(qp("q") || "");
		setSearchInput(qp("q") || "");
		setMinPrice(qp("minPrice") || "");
		setMaxPrice(qp("maxPrice") || "");
		setCamere(qp("camere") || "");
		setSuprafataMin(qp("suprafataMin") || "");
		setSuprafataMax(qp("suprafataMax") || "");
		setSortBy(qp("sortBy") || "createdAt");
		setOrder((qp("order") || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC");
		setLimit(qpNum("limit", 10));
		setPage(qpNum("page", 1));
		initializedRef.current = true;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);

	// When local filter state changes, reflect it in the URL
	useEffect(() => {
		if (!initializedRef.current) return;
		const params = new URLSearchParams();
		if (query) params.set("q", query);
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
	}, [query, minPrice, maxPrice, camere, suprafataMin, suprafataMax, page, limit, sortBy, order, router]);

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

	const totalPages = Math.max(1, Math.ceil(total / limit));

	return (
		<Div className="min-h-screen">
			{/* Sticky subnav with search */}
			<SubNavSearchBar
				sticky
				value={searchInput}
				onChange={setSearchInput}
				onSubmit={(q) => { setQuery(q ?? ""); setPage(1); }}
				placeholder={t('resources.searchPlaceholder')}
			/>

			<Div className="mx-auto w-full max-w-6xl px-4 md:px-6 py-6">
				<div className="mt-4 flex flex-col md:flex-row gap-6">
					{/* Sidebar: reuse FilterSidebar but hide its internal search */}
					<div className="bg-stone-100 rounded-lg p-4">
						<div>
							<FilterSidebar
								key={sidebarKey}
								showSearch={false}
								className="md:w-72 w-full md:shrink-0 rounded-lg"
								defaultValues={sidebarDefaultValues}
								filters={sidebarFilters}
								onApply={({ values }) => {
									const [sb = "createdAt", ord = "DESC"] = String(values?.sort || `${sortBy}:${order}`).split(":");
									setSortBy(sb);
									setOrder((ord || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC");
									setMinPrice(values?.minPrice ?? "");
									setMaxPrice(values?.maxPrice ?? "");
									setCamere(values?.camere ?? "");
									setSuprafataMin(values?.suprafataMin ?? "");
									setSuprafataMax(values?.suprafataMax ?? "");
									// Commit the pending search text only when applying filters
									setQuery(searchInput ?? "");
									setPage(1);
								}}
								onClear={() => {
									setSortBy("createdAt");
									setOrder("DESC");
									setMinPrice("");
									setMaxPrice("");
									setCamere("");
									setSuprafataMin("");
									setSuprafataMax("");
									// Clear both query and the local input
									setQuery("");
									setSearchInput("");
									setPage(1);
								}}
							/>
							{markers.length > 0 ? (
							<div className="p-2 hidden md:block bg-white rounded-lg">
								<MultiPinMap
									markers={markers}
									heightClass="h-[400px]"
									className="cursor-pointer"
									onMapClick={() => setMapOpen(true)}
									onMarkerClick={(m) => router.push(`/resources/${m.id}`)}
								/>
							</div>
						) : null}
						</div>
						{/* Small map under the filters */}
					</div>

					<Div className="flex-1">
						{error ? (
							<Div className="p-3 my-4 bg-red-100 text-red-800 border border-red-200 rounded">{error}</Div>
						) : null}

						{loading ? (
							<P>{t('common.loading')}</P>
						) : items.length === 0 ? (
							<P className="mt-6">{t('resources.empty')}</P>
						) : (
							<>
								<div className="flex items-center border-b border-gray-300 pb-2 mb-4">
									<h1 className="text-black text-2xl font-semibold">
										{query
											? query
											: t('resources.allResults')
										}
									</h1>
									<span className="text-gray-600 ml-4 text-sm pt-1">
										{total} {t('common.results') || 'rezultate'}
									</span>
								</div>
								<div className="mt-0 grid grid-cols-1 md:grid-cols-2 gap-6">
									{items.map((p) => (
										<div key={p.id} className="w-full">
											<VerticalCard
												href={`/resources/${p.id}`}
												imageSrc={p.images?.[0]?.url ? toAbsoluteUrl(p.images[0].url) : DEFAULT_LANDSCAPE_PLACEHOLDER}
												imageAlt={p.name}
												title={p.name}
												price={`${formatPrice(p.price)} lei`}
												description={p.description || ""}
												features={p.features || []}
												actions={[
													{ label: t('resources.buy'), variant: "empty-blue", onClick: (e) => { e.preventDefault(); /* later */ } },
												]}
											/>
										</div>
									))}
								</div>

								<Pagination
									page={page}
									total={total}
									limit={limit}
									onPageChange={(n) => setPage(n)}
									/* rely on i18n defaults for prev/next labels */
									tone="neutral"
								/>
							</>
						)}
					</Div>
				</div>

				{/* Big modal map */}
				<ModalMultiPinMap
					open={mapOpen}
					onClose={() => setMapOpen(false)}
					markers={markers}
					title={t('resources.mapTitle')}
					onMarkerClick={(m) => router.push(`/resources/${m.id}`)}
				/>
			</Div>
		</Div>
	);
}

