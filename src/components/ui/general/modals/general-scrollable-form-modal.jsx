"use client";

import React from "react";
import { ModalContainer } from "./Modal";
import GeneralScrollableForm from "../forms/general-scrollable-form";
import { Button } from "@/components/ui/general/primitives";

/**
 * GeneralScrollableFormModal
 *
 * A lightweight modal wrapper that renders GeneralScrollableForm inside
 * a modal container (same look-and-feel as GenericModal) WITHOUT using the
 * GenericModal component. Useful when you want the form-in-modal pattern
 * but prefer to avoid the extra GenericModal abstraction.
 *
 * Props:
 * - open: boolean — controls visibility
 * - onClose: () => void — called when the modal/backdrop is dismissed
 * - title?: string | ReactNode — optional title shown above the form
 * - className?: string — extra classes for the modal surface
 * - header?: ReactNode — optional header content passed to the form
 * - ...formProps — all other props are forwarded to GeneralScrollableForm
 */
export default function GeneralScrollableFormModal(props) {
	const { open, onClose, title, className, header, ...formProps } = props || {};

	return (
		<ModalContainer open={open} onClose={onClose} className={className}>
			<div className="space-y-4">
				<div className="flex items-center justify-between gap-3">
					{title ? (
						<h2 className="text-lg font-semibold text-black">{title}</h2>
					) : (
						<div />
					)}
					<Button variant="empty-red" aria-label="Close" onClick={onClose}>
						×
					</Button>
				</div>

				<GeneralScrollableForm
					{...formProps}
					header={header}
					onClose={onClose}
				/>
			</div>
		</ModalContainer>
	);
}

