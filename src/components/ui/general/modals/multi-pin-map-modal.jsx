"use client";

import React from "react";
import Modal from "@/components/ui/general/modals/Modal";
import { Button } from "@/components/ui/general/primitives";
import MultiPinMap from "../maps/multi-pin-map";

export default function ModalMultiPinMap({
	open,
	onClose,
	markers = [],
	title = "",
	onMarkerClick,
}) {
	return (
		<Modal open={open} onClose={onClose} className="max-w-5xl w-full" footer={null}>
			<div className="flex items-center justify-between gap-3 mb-3">
				{title ? <h2 className="text-lg font-semibold text-black">{title}</h2> : <div />}
				<Button variant="empty-red" aria-label="Close" onClick={onClose}>×</Button>
			</div>
			<div className="w-full">
				<MultiPinMap
					markers={markers}
					heightClass="h-[70vh]"
					onMarkerClick={onMarkerClick}
				/>
			</div>
		</Modal>
	);
}
