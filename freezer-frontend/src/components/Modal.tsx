import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const lastFocusableRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
      if (e.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            (last as HTMLElement).focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            (first as HTMLElement).focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKey, true);

    // Focus the first focusable element when modal opens
    const toFocus = dialogRef.current?.querySelector<HTMLElement>(
      'input, button, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    toFocus?.focus();

    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey, true);
      document.body.style.overflow = "unset";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby="modal-content"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        className="relative bg-white rounded shadow-xl w-full max-w-lg mx-4 p-4 border border-[#00522C]/20"
        role="document"
        id="modal-content"
      >
        <div className="flex items-center justify-between mb-3">
          {title && (
            <h3 id="modal-title" className="text-lg font-medium text-[#00522C]">
              {title}
            </h3>
          )}
          <button
            onClick={onClose}
            aria-label="Close modal"
            ref={firstFocusableRef}
            className="px-3 py-1 text-[#00522C] hover:bg-[#00522C]/5 rounded focus:outline-none focus:ring-2 focus:ring-[#00522C] focus:ring-offset-2"
          >
            Close
          </button>
        </div>
        {children}
        <button
          className="sr-only"
          aria-hidden="true"
          ref={lastFocusableRef}
          onClick={() => {}}
        />
      </div>
    </div>
  );
}

export default Modal;
