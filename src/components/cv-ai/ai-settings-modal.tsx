"use client";

import React, { useState } from "react";
import { DEFAULT_BANNED_WORDS } from "@/lib/ai/guard";
import type { HonestyGuardConfig } from "@/lib/ai/types";

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: HonestyGuardConfig;
  onSaveConfig: (updated: HonestyGuardConfig) => void;
}

export function AISettingsModal({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}: AISettingsModalProps) {
  const [bannedWordsText, setBannedWordsText] = useState(
    config.bannedWords.join(", ")
  );
  const [avoidEmDashes, setAvoidEmDashes] = useState(config.avoidEmDashes);

  if (!isOpen) return null;

  const handleSave = () => {
    const list = bannedWordsText
      .split(",")
      .map((w) => w.trim().toLowerCase())
      .filter(Boolean);

    onSaveConfig({
      bannedWords: list.length > 0 ? list : DEFAULT_BANNED_WORDS,
      avoidEmDashes,
    });
    onClose();
  };

  const handleReset = () => {
    setBannedWordsText(DEFAULT_BANNED_WORDS.join(", "));
    setAvoidEmDashes(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h3 className="font-semibold text-neutral-900 text-sm sm:text-base">
              AI Honesty & Style Settings
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Em Dash Preference (Rule 7) */}
        <div className="p-3 bg-neutral-50 rounded border border-neutral-200 space-y-1">
          <label className="flex items-center gap-2 text-xs font-semibold text-neutral-800 cursor-pointer">
            <input
              type="checkbox"
              checked={avoidEmDashes}
              onChange={(e) => setAvoidEmDashes(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Avoid em dashes (&mdash;)</span>
          </label>
          <p className="text-[11px] text-neutral-500 pl-5">
            When enabled, the AI Honesty Guard rejects or converts em dashes into standard hyphens or commas.
          </p>
        </div>

        {/* Banned Words (Rule 6) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-neutral-800">
              Banned Words & Clichés (User-Editable)
            </label>
            <button
              type="button"
              onClick={handleReset}
              className="text-[11px] text-blue-600 hover:underline"
            >
              Reset to defaults
            </button>
          </div>
          <p className="text-[11px] text-neutral-500">
            Comma-separated words or phrases that the Honesty Guard will strictly prohibit.
          </p>
          <textarea
            rows={4}
            value={bannedWordsText}
            onChange={(e) => setBannedWordsText(e.target.value)}
            className="w-full text-xs font-mono rounded border border-neutral-300 p-2 focus:border-blue-500"
            placeholder="passionate, robust, proven track record, dynamic..."
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
