"use client";

import React, { useState } from "react";
import { useAuth } from "./auth-context";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const { user, deleteAccount } = useAuth();
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText !== "DELETE") {
      setError("Please type DELETE to confirm");
      return;
    }

    setIsDeleting(true);
    setError(null);
    try {
      const res = await deleteAccount();
      if (!res.success) {
        setError(res.error || "Failed to delete account");
        setIsDeleting(false);
      } else {
        alert("Your account and all associated CV data have been permanently deleted.");
        onClose();
      }
    } catch {
      setError("An unexpected error occurred while deleting your account.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-red-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-red-50/70 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-900 font-bold text-base">
            <span>⚠️</span> Delete Account & All Data
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 rounded-md p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleDelete} className="p-6 space-y-4">
          <p className="text-xs text-neutral-600 leading-relaxed">
            This action is <strong>permanent and irreversible</strong>. It will immediately and completely delete:
          </p>

          <ul className="text-xs text-neutral-700 list-disc list-inside space-y-1 bg-neutral-50 p-3 rounded-md border border-neutral-200">
            <li>Your account credentials (<strong>{user.email}</strong>)</li>
            <li>All saved cloud CV versions and draft histories</li>
            <li>All Evidence Vault facts and verified claims</li>
          </ul>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              To confirm, type <span className="font-mono text-red-600 font-bold">DELETE</span> below:
            </label>
            <input
              type="text"
              required
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-2 px-3 border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-md hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={confirmText !== "DELETE" || isDeleting}
              className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md shadow-sm transition-colors disabled:opacity-40"
            >
              {isDeleting ? "Deleting Everything..." : "Delete Permanently"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
