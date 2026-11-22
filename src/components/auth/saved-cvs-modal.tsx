"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { CVVersionListItem } from "@/lib/supabase/types";
import type { CVData } from "@/lib/schema";
import type { VaultFact } from "@/lib/vault";

interface SavedCVsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCVData: CVData;
  currentVault: VaultFact[];
  onLoadCV: (cvData: CVData, vaultData?: VaultFact[]) => void;
}

export function SavedCVsModal({
  isOpen,
  onClose,
  currentCVData,
  currentVault,
  onLoadCV,
}: SavedCVsModalProps) {
  const [versions, setVersions] = useState<CVVersionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(
    null
  );

  const fetchVersions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/cvs");
      if (res.ok) {
        const data = await res.json();
        setVersions(data.cvs || []);
      }
    } catch {
      setFeedback({ message: "Failed to load saved versions", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchVersions();
      const defaultName = currentCVData.profile.fullName
        ? `${currentCVData.profile.fullName}'s CV`
        : "My CV Version";
      setNewTitle(defaultName);
      setFeedback(null);
    }
  }, [isOpen, fetchVersions, currentCVData.profile.fullName]);

  if (!isOpen) return null;

  const handleSaveCurrentAsNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/cvs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          cvData: currentCVData,
          vaultData: currentVault,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save version");
      }

      setFeedback({ message: `Saved "${newTitle}" successfully!`, type: "success" });
      await fetchVersions();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving";
      setFeedback({ message: msg, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadVersion = async (versionId: string, title: string) => {
    if (
      !window.confirm(
        `Load version "${title}" into the editor? Any unsaved local edits will be replaced.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/cvs/${versionId}`);
      if (!res.ok) throw new Error("Failed to fetch version details");
      const data = await res.json();

      onLoadCV(data.cv.cvData, data.cv.vaultData);
      setFeedback({ message: `Loaded "${title}" into the editor.`, type: "success" });
      setTimeout(() => onClose(), 800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error loading";
      setFeedback({ message: msg, type: "error" });
    }
  };

  const handleDeleteVersion = async (versionId: string, title: string) => {
    if (!window.confirm(`Permanently delete version "${title}"?`)) return;

    try {
      const res = await fetch(`/api/cvs/${versionId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete version");
      setFeedback({ message: `Deleted "${title}".`, type: "success" });
      await fetchVersions();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting";
      setFeedback({ message: msg, type: "error" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <span>💾</span> Saved Cloud CV Versions
            </h2>
            <p className="text-xs text-neutral-500">
              Manage different versions tailored for specific roles or countries.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 rounded-md p-1"
          >
            ✕
          </button>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div
            className={`px-6 py-2.5 text-xs font-medium border-b ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            {feedback.message}
          </div>
        )}

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Save current work section */}
          <form
            onSubmit={handleSaveCurrentAsNew}
            className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3"
          >
            <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Save Current CV as a New Version
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                required
                maxLength={80}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Frontend Engineer - Berlin Target"
                className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-md shadow-sm transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Version"}
              </button>
            </div>
          </form>

          {/* List of existing versions */}
          <div>
            <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-3">
              Your Saved Versions ({versions.length})
            </h3>

            {isLoading ? (
              <div className="py-8 text-center text-xs text-neutral-500">
                Loading saved versions...
              </div>
            ) : versions.length === 0 ? (
              <div className="py-8 text-center bg-neutral-50 rounded-lg border border-neutral-200 border-dashed text-xs text-neutral-500">
                You haven&apos;t saved any CV versions yet. Use the box above to save your first version!
              </div>
            ) : (
              <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-lg overflow-hidden">
                {versions.map((ver) => (
                  <div
                    key={ver.id}
                    className="p-4 bg-white hover:bg-neutral-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900">{ver.title}</h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Last updated: {new Date(ver.updatedAt).toLocaleDateString()} at{" "}
                        {new Date(ver.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleLoadVersion(ver.id, ver.title)}
                        className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-medium rounded-md transition-colors"
                      >
                        📂 Load
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteVersion(ver.id, ver.title)}
                        className="px-2.5 py-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 text-xs font-medium rounded-md transition-colors"
                        title="Delete this version"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
