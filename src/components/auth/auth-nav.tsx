"use client";

import React, { useState } from "react";
import { useAuth } from "./auth-context";
import { AuthModal } from "./auth-modal";
import { SavedCVsModal } from "./saved-cvs-modal";
import { DeleteAccountModal } from "./delete-account-modal";
import type { CVData } from "@/lib/schema";
import type { VaultFact } from "@/lib/vault";

interface AuthNavProps {
  currentCVData: CVData;
  currentVault: VaultFact[];
  onLoadCV: (cvData: CVData, vaultData?: VaultFact[]) => void;
}

export function AuthNav({ currentCVData, currentVault, onLoadCV }: AuthNavProps) {
  const { user, isLoading, logout } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSavedCVsOpen, setIsSavedCVsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (isLoading) {
    return <div className="text-xs text-neutral-400">Checking session...</div>;
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {user ? (
        <div className="flex items-center gap-2">
          {/* Saved CVs button */}
          <button
            type="button"
            onClick={() => setIsSavedCVsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-md shadow-sm transition-colors"
          >
            <span>💾</span>
            <span className="hidden sm:inline">Saved CVs</span>
            <span className="sm:hidden">CVs</span>
          </button>

          {/* User profile dropdown trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-md text-xs font-medium text-neutral-800 transition-colors"
            >
              <span>👤</span>
              <span className="max-w-[120px] sm:max-w-[180px] truncate">{user.email}</span>
              <span className="text-[10px]">▼</span>
            </button>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-52 bg-white rounded-lg shadow-xl border border-neutral-200 py-1 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-neutral-100 text-neutral-500">
                    Signed in as <strong className="text-neutral-900 block truncate">{user.email}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsSavedCVsOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-neutral-50 flex items-center gap-2 text-neutral-700"
                  >
                    <span>💾</span> Manage Saved Versions
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-neutral-50 flex items-center gap-2 text-neutral-700 border-t border-neutral-100"
                  >
                    <span>🚪</span> Sign Out
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsDeleteOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600 border-t border-neutral-100 font-medium"
                  >
                    <span>🗑️</span> Delete Account & Data
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 border border-neutral-200 rounded-full text-[11px] text-neutral-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Free Local Builder
          </span>
          <button
            type="button"
            onClick={() => setIsAuthOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-md shadow-sm transition-colors"
          >
            <span>☁️</span>
            <span>Sign In / Save</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <SavedCVsModal
        isOpen={isSavedCVsOpen}
        onClose={() => setIsSavedCVsOpen(false)}
        currentCVData={currentCVData}
        currentVault={currentVault}
        onLoadCV={onLoadCV}
      />
      <DeleteAccountModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} />
    </div>
  );
}
