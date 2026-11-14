"use client";

import React, { useState } from "react";
import type { VaultFact } from "@/lib/vault";
import { createVaultFact } from "@/lib/vault";

interface VaultPanelProps {
  vault: VaultFact[];
  onUpdateVault: (updated: VaultFact[]) => void;
}

export function VaultPanel({ vault, onUpdateVault }: VaultPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // New fact form state
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newVerified, setNewVerified] = useState(true);

  const verifiedCount = vault.filter((f) => f.verified).length;

  const handleToggleVerify = (id: string) => {
    onUpdateVault(
      vault.map((fact) =>
        fact.id === id ? { ...fact, verified: !fact.verified } : fact
      )
    );
  };

  const handleDeleteFact = (id: string) => {
    onUpdateVault(vault.filter((fact) => fact.id !== id));
  };

  const handleAddFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newValue.trim()) return;

    const fact = createVaultFact(newLabel, newValue, newUnit, newNote, newVerified);
    onUpdateVault([...vault, fact]);

    // Reset form
    setNewLabel("");
    setNewValue("");
    setNewUnit("");
    setNewNote("");
    setNewVerified(true);
    setShowAddForm(false);
  };

  return (
    <div className="no-print border border-blue-200 bg-blue-50/30 rounded-lg shadow-sm mb-4">
      {/* Header bar */}
      <div className="p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏛️</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm sm:text-base text-neutral-900">
                Evidence Vault
              </h3>
              <span className="bg-blue-100 text-blue-800 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded">
                {verifiedCount} of {vault.length} verified
              </span>
            </div>
            <p className="text-xs text-neutral-600">
              User-verified metrics & numbers. CV Doctor flags any bullet numbers not found here.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setShowAddForm(true);
            }}
            className="text-xs font-medium px-2.5 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            + Add Fact
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-xs font-medium px-2 py-1 bg-white border border-neutral-200 rounded text-neutral-700 hover:bg-neutral-50"
          >
            {isOpen ? "Collapse ▴" : "Manage Vault ▾"}
          </button>
        </div>
      </div>

      {/* Expanded vault body */}
      {isOpen && (
        <div className="p-3 sm:p-4 pt-0 space-y-3 border-t border-blue-100 mt-1">
          {/* Add Fact Form */}
          {showAddForm && (
            <form onSubmit={handleAddFact} className="p-3 bg-white border border-blue-200 rounded-md space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                  Add Fact to Evidence Vault
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-neutral-500 hover:text-neutral-800"
                >
                  ✕ Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-neutral-600">Label *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. API Endpoints Covered"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="w-full text-xs rounded border border-neutral-300 p-1.5 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600">Metric Value *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 12"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full text-xs rounded border border-neutral-300 p-1.5 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600">Unit (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. endpoints, %, users"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full text-xs rounded border border-neutral-300 p-1.5 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600">Note / Source (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Sprint 4 test dashboard"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full text-xs rounded border border-neutral-300 p-1.5 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-1.5 text-xs text-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newVerified}
                    onChange={(e) => setNewVerified(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Mark as verified fact</span>
                </label>
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700"
                >
                  Save Fact
                </button>
              </div>
            </form>
          )}

          {/* List of facts */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {vault.length === 0 ? (
              <p className="text-xs text-neutral-500 italic p-2 text-center">
                Your vault is currently empty. Add your numbers and metrics here to verify your claims.
              </p>
            ) : (
              vault.map((fact) => (
                <div
                  key={fact.id}
                  className="p-2.5 rounded border border-neutral-200 bg-white flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleVerify(fact.id)}
                      title={fact.verified ? "Verified (click to unverify)" : "Unverified (click to verify)"}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                        fact.verified
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      }`}
                    >
                      {fact.verified ? "✓ Verified" : "Unverified"}
                    </button>
                    <div className="truncate">
                      <span className="font-semibold text-neutral-900">{fact.label}: </span>
                      <span className="font-bold text-blue-700">
                        {fact.value} {fact.unit}
                      </span>
                      {fact.note && (
                        <span className="text-neutral-500 italic ml-1">({fact.note})</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteFact(fact.id)}
                    className="text-neutral-400 hover:text-red-600 font-bold px-1"
                    title="Delete fact"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
