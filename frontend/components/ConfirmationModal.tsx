// components/ConfirmationModal.tsx
"use client";

import { useEffect } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
}

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Yes, Delete" }: ModalProps) {
    // Close modal on Escape key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity">
            <div className="bg-travel-card rounded-2xl p-6 w-full max-w-sm border border-travel-border shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-xl font-bold text-travel-text mb-2">{title}</h3>
                <p className="text-travel-text-muted text-sm mb-6 leading-relaxed">{message}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 bg-travel-bg border border-travel-border rounded-xl text-travel-text font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium shadow-md hover:bg-red-700 hover:shadow-lg transition-all active:scale-95"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}