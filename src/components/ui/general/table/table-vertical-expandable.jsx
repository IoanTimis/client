"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/general/primitives";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";

/**
 * Table — admin table with optional vertical expansion to avoid horizontal scroll.
 *
 * Props:
 * - data: Array<object>
 * - columns: Array<{ key: string, label: string }>
 * - actions?: Array<{ title, className, icon, onClick(row), ariaLabel?, disabled?(row) }>
 * - defaultVisibleKeys?: string[]  // when provided, only these columns show in the main row; the rest appear in an expandable details row
 * - getRowId?: (row, index) => string|number  // default: row.id ?? index
 */
export default function TableVerticalExpandable({ data, columns, actions, defaultVisibleKeys, getRowId }) {
	const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
	const [modalContent, setModalContent] = useState(null);
	const [expandedRow, setExpandedRow] = useState(null); // row id (single-expand)

	const sortedData = useMemo(() => {
			const copy = Array.isArray(data) ? [...data] : [];
		if (!sortConfig.key) return copy;
		return copy.sort((a, b) => {
			const valA = a[sortConfig.key];
			const valB = b[sortConfig.key];
			if (valA == null && valB == null) return 0;
			if (valA == null) return 1;
			if (valB == null) return -1;
			if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
			if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
			return 0;
		});
	}, [data, sortConfig]);

	const handleSort = (key) => {
		setSortConfig((prev) => ({
			key,
			direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
		}));
	};

	// Compute visible/hidden columns if defaultVisibleKeys provided
	const allColumns = useMemo(() => (Array.isArray(columns) ? columns : []), [columns]);
	const visibleCols = useMemo(() => {
		if (!defaultVisibleKeys || !defaultVisibleKeys.length) return allColumns;
		const set = new Set(defaultVisibleKeys);
		return allColumns.filter(c => set.has(c.key));
	}, [allColumns, defaultVisibleKeys]);

	const hiddenCols = useMemo(() => {
		if (!defaultVisibleKeys || !defaultVisibleKeys.length) return [];
		const set = new Set(defaultVisibleKeys);
		return allColumns.filter(c => !set.has(c.key));
	}, [allColumns, defaultVisibleKeys]);

	// Add actions column if actions provided, also add an expand toggle column when there are hidden columns
	const updatedColumns = useMemo(() => {
		let cols = visibleCols;
		if (hiddenCols.length) cols = [{ key: "_expand", label: "" }, ...cols];
		if (actions) cols = [...cols, { key: "_actions", label: "Acțiuni" }];
		return cols;
	}, [visibleCols, hiddenCols, actions]);

	const rowIdFor = (row, index) => {
		if (typeof getRowId === 'function') return getRowId(row, index);
		return row?.id ?? index;
	};

	const renderCellContent = (col, row) => {
		const value = row[col.key];
		if (col.key === "description") {
			return (
				<>
					{value?.length > 80 ? (
						<>
							{value.slice(0, 80)}...
							<button
								type="button"
								className="text-blue-700 underline ml-2 disabled:pointer-events-none disabled:opacity-50"
								onClick={() => setModalContent(value)}
							>
								Vezi mai mult
							</button>
						</>
					) : (
						value
					)}
				</>
			);
		}
		if (typeof value === "boolean") return value ? "Da" : "Nu";
		return value;
	};

		return (
		<div className="overflow-x-auto bg-stone-100 rounded-lg border border-gray-200">
			<div className="w-full overflow-x-auto scrollbar-stone">
					{(!data || data.length === 0) ? (
						<div className="p-4 text-center text-gray-500">Nu există date disponibile.</div>
					) : (
					<table className="min-w-max w-full">
					<thead className="bg-stone-100 sticky top-0 z-10">
						<tr>
							{updatedColumns.map((col) => (
								<th
									key={col.key}
									scope="col"
									className={[
										"px-4 py-2 text-left text-black border-b border-gray-200 select-none whitespace-nowrap",
										col.key !== "_expand" ? "cursor-pointer hover:bg-stone-200" : "w-8",
									].join(" ")}
									onClick={col.key !== "_expand" ? () => handleSort(col.key) : undefined}
								>
									<div className="inline-flex items-center gap-1">
										<span>{col.label}</span>
										{col.key !== "_expand" && sortConfig.key === col.key ? (
											<span aria-hidden>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
										) : null}
									</div>
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{sortedData.map((row, rowIndex) => {
							const rid = rowIdFor(row, rowIndex);
							const isExpanded = expandedRow === rid;
							return (
								<React.Fragment key={rid}>
									<tr className="border-b border-gray-200">
										{updatedColumns.map((col) => {
											if (col.key === "_expand") {
												return (
													<td key="_expand" className="px-2 py-2 align-top">
														{hiddenCols.length ? (
															<button
																type="button"
																className="p-1 rounded border border-gray-300 hover:bg-stone-200"
																aria-expanded={isExpanded}
																aria-label={isExpanded ? "Ascunde detalii" : "Arată detalii"}
																onClick={() => setExpandedRow(isExpanded ? null : rid)}
															>
																{isExpanded ? (
																	<ChevronUpIcon className="w-4 h-4 text-gray-800" aria-hidden="true" />
																) : (
																	<ChevronDownIcon className="w-4 h-4 text-gray-800" aria-hidden="true" />
																)}
															</button>
														) : null}
													</td>
												);
											}
											if (col.key === "_actions") {
												return (
													<td key="_actions" className="px-4 py-2 whitespace-nowrap">
														<div className="flex items-center gap-2">
															{actions.map((action, index) => (
																<button
																	key={index}
																	type="button"
																	title={action.title}
																	className={["px-2 py-1 rounded", action.className].filter(Boolean).join(" ")}
																	onClick={() => action.onClick(row)}
																	disabled={action.disabled?.(row)}
																	aria-label={action.ariaLabel || action.title}
																>
																	{React.cloneElement(action.icon)}
																</button>
															))}
														</div>
													</td>
												);
											}
											return (
												<td key={col.key} className="px-4 py-2 text-black whitespace-nowrap align-top">
													{renderCellContent(col, row)}
												</td>
											);
										})}
									</tr>
									{hiddenCols.length && isExpanded ? (
										<tr>
											<td className="px-4 py-3 bg-white" colSpan={updatedColumns.length}>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													{hiddenCols.map((col) => (
														<div key={col.key} className="text-sm">
															<div className="text-gray-500">{col.label}</div>
															<div className="text-black break-words">
																{renderCellContent(col, row)}
															</div>
														</div>
													))}
												</div>
											</td>
										</tr>
									) : null}
								</React.Fragment>
							);
						})}
					</tbody>
				</table>
							)}
			</div>

			{/* Modal for full description */}
			{modalContent && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[120]">
					<div className="bg-stone-100 text-black p-6 rounded-lg shadow-xl w-[90vw] max-w-lg">
						<h2 className="text-lg font-semibold mb-3">Descriere completă</h2>
						<p className="text-gray-700 whitespace-pre-wrap">{modalContent}</p>
						<div className="flex justify-end mt-4">
							<Button
								variant="empty-gray"
								onClick={() => setModalContent(null)}
							>
								Închide
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

