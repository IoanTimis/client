"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/general/primitives";

export default function Table({ data, columns, actions }) {
	const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
	const [modalContent, setModalContent] = useState(null);

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

	// Add actions column if actions provided
	const updatedColumns = actions ? [...columns, { key: "_actions", label: "Acțiuni" }] : columns;

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
									className="px-4 py-2 text-left text-black border-b border-gray-200 select-none whitespace-nowrap cursor-pointer hover:bg-stone-200"
									onClick={() => handleSort(col.key)}
								>
									<div className="inline-flex items-center gap-1">
										<span>{col.label}</span>
										{sortConfig.key === col.key ? (
											<span aria-hidden>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
										) : null}
									</div>
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{sortedData.map((row, rowIndex) => (
							<tr key={rowIndex} className="border-b border-gray-200">
								{columns.map((col) => (
									<td key={col.key} className="px-4 py-2 text-black whitespace-nowrap align-top">
										{col.key === "description" ? (
											<>
												{row[col.key]?.length > 80 ? (
													<>
														{row[col.key].slice(0, 80)}...
														<button
															type="button"
															className="text-blue-700 underline ml-2 disabled:pointer-events-none disabled:opacity-50"
															onClick={() => setModalContent(row[col.key])}
														>
															Vezi mai mult
														</button>
													</>
												) : (
													row[col.key]
												)}
											</>
										) : typeof row[col.key] === "boolean" ? (
											row[col.key] ? "Da" : "Nu"
										) : (
											row[col.key]
										)}
									</td>
								))}
								{actions ? (
									<td className="px-4 py-2 whitespace-nowrap">
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
								) : null}
							</tr>
						))}
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

