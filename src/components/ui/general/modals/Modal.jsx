"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/Ui";
import { Div, Button } from "../primitives";
import { useLanguage } from "@/context/language-context";

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

function Portal({ children }) {
  const mounted = useMounted();
  if (!mounted) return null;
  return createPortal(children, document.body);
}

export function ModalContainer({ open, onClose, children, className }) {
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  const onBackdropMouseDown = () => onClose?.();

  return (
    <Portal>
      <div className="fixed inset-0 z-[100]">
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onMouseDown={onBackdropMouseDown}
        />
        <div className="relative z-[110] min-h-full w-full flex items-center justify-center p-4 pointer-events-none">
          <Div
            padding="lg"
            role="dialog"
            aria-modal="true"
            className={cn(
              "w-full max-w-lg pointer-events-auto",
              "bg-stone-100 text-black border border-gray-200 rounded-xl shadow-xl",
              className
            )}
          >
            {children}
          </Div>
        </div>
      </div>
    </Portal>
  );
}

export function Modal({ open, onClose, title, children, footer, className }) {
  return (
    <ModalContainer open={open} onClose={onClose} className={className}>
      <div className="space-y-4">
        {title ? <h2 className="text-lg font-semibold text-black">{title}</h2> : null}
        <div className="text-gray-700">{children}</div>
        {footer ? (
          <div className="flex justify-end gap-2 pt-3 mt-2 border-t border-gray-200">{footer}</div>
        ) : null}
      </div>
    </ModalContainer>
  );
}

export function DangerModal({
  open,
  onClose,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
}) {
  const { t } = useLanguage();
  const _title = title ?? t('modal.confirm.title');
  const _message = message ?? t('modal.confirm.message');
  const _confirm = confirmText ?? t('modal.confirm.confirm');
  const _cancel = cancelText ?? t('modal.confirm.cancel');
  return (
    <ModalContainer open={open} onClose={onClose}>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-red-600">{_title}</h2>
        <p className="text-gray-700">{_message}</p>
        <div className="flex justify-end gap-2 pt-3 mt-2 border-t border-gray-200">
          <Button variant="empty-gray" onClick={onClose}>
            {_cancel}
          </Button>
          <Button
            variant="empty-red"
            onClick={() => {
              onConfirm?.();
              onClose?.();
            }}
          >
            {_confirm}
          </Button>
        </div>
      </div>
    </ModalContainer>
  );
}

// Backward-compatible names
export const ConfirmActionModal = DangerModal;
export const GenericModal = Modal;

export default Modal;