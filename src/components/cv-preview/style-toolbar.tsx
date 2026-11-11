"use client";

import React, { useState } from "react";
import type { StyleConfig, PaperSize, ColorMode, FontFamily, Spacing } from "@/lib/templates";

interface StyleToolbarProps {
  style: StyleConfig;
  onChange: (updated: StyleConfig) => void;
  onExportDocx?: () => void;
  isExportingDocx?: boolean;
}

const ACCENT_COLORS = [
  { name: "Navy", value: "#1e3a8a" },
  { name: "Slate", value: "#334155" },
  { name: "Forest", value: "#14532d" },
  { name: "Burgundy", value: "#881337" },
  { name: "Teal", value: "#0f766e" },
];

export function StyleToolbar({
  style,
  onChange,
  onExportDocx,
  isExportingDocx = false,
}: StyleToolbarProps) {
  const update = (patch: Partial<StyleConfig>) => {
    onChange({ ...style, ...patch });
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="no-print bg-white border border-neutral-200 rounded-lg p-3 sm:p-4 mb-4 shadow-sm space-y-3">
      {/* Top Header & Export Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-neutral-800">Layout & Export</h2>
        <div className="flex items-center gap-2">
          {onExportDocx && (
            <button
              type="button"
              onClick={onExportDocx}
              disabled={isExportingDocx}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-md shadow-sm transition-colors disabled:opacity-50"
              title="Download Microsoft Word document (.docx)"
            >
              <span>📄</span>
              <span>{isExportingDocx ? "Generating..." : "Export Word (.docx)"}</span>
            </button>
          )}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors"
            title="Print or Save as PDF via browser print"
          >
            <span>🖨️</span>
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Style Controls Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-neutral-100 text-xs">
        {/* Paper Size */}
        <div>
          <label className="block text-neutral-500 font-medium mb-1">Paper Size</label>
          <div className="inline-flex rounded-md shadow-sm w-full" role="group">
            <button
              type="button"
              onClick={() => update({ paperSize: "a4" as PaperSize })}
              className={`flex-1 py-1 px-2 border rounded-l-md font-medium text-center transition-colors ${
                style.paperSize === "a4"
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50"
              }`}
            >
              A4
            </button>
            <button
              type="button"
              onClick={() => update({ paperSize: "letter" as PaperSize })}
              className={`flex-1 py-1 px-2 border-t border-b border-r rounded-r-md font-medium text-center transition-colors ${
                style.paperSize === "letter"
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50"
              }`}
            >
              Letter
            </button>
          </div>
        </div>

        {/* Color Mode */}
        <div>
          <label className="block text-neutral-500 font-medium mb-1">Color Mode</label>
          <div className="inline-flex rounded-md shadow-sm w-full" role="group">
            <button
              type="button"
              onClick={() => update({ colorMode: "accent" as ColorMode })}
              className={`flex-1 py-1 px-2 border rounded-l-md font-medium text-center transition-colors ${
                style.colorMode === "accent"
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50"
              }`}
            >
              Accent
            </button>
            <button
              type="button"
              onClick={() => update({ colorMode: "black" as ColorMode })}
              className={`flex-1 py-1 px-2 border-t border-b border-r rounded-r-md font-medium text-center transition-colors ${
                style.colorMode === "black"
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50"
              }`}
            >
              Black Only
            </button>
          </div>
        </div>

        {/* Font Family */}
        <div>
          <label htmlFor="font-family-select" className="block text-neutral-500 font-medium mb-1">
            Font Stack
          </label>
          <select
            id="font-family-select"
            value={style.fontFamily}
            onChange={(e) => update({ fontFamily: e.target.value as FontFamily })}
            className="w-full rounded-md border border-neutral-300 py-1 px-2 bg-white text-neutral-700 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="sans">Sans-serif (Modern)</option>
            <option value="serif">Serif (Classic)</option>
            <option value="mono">Monospace (Code)</option>
          </select>
        </div>

        {/* Spacing */}
        <div>
          <label className="block text-neutral-500 font-medium mb-1">Spacing</label>
          <div className="inline-flex rounded-md shadow-sm w-full" role="group">
            <button
              type="button"
              onClick={() => update({ spacing: "normal" as Spacing })}
              className={`flex-1 py-1 px-2 border rounded-l-md font-medium text-center transition-colors ${
                style.spacing === "normal"
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50"
              }`}
            >
              Normal
            </button>
            <button
              type="button"
              onClick={() => update({ spacing: "compact" as Spacing })}
              className={`flex-1 py-1 px-2 border-t border-b border-r rounded-r-md font-medium text-center transition-colors ${
                style.spacing === "compact"
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50"
              }`}
            >
              Compact
            </button>
          </div>
        </div>
      </div>

      {/* Accent Color picker (only shown if colorMode is accent) */}
      {style.colorMode === "accent" && (
        <div className="pt-2 border-t border-neutral-100 flex items-center gap-2 text-xs">
          <span className="text-neutral-500 font-medium">Accent Color:</span>
          <div className="flex items-center gap-1.5">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => update({ accentColor: c.value })}
                className={`w-5 h-5 rounded-full border-2 transition-transform ${
                  style.accentColor === c.value ? "scale-110 border-neutral-900" : "border-transparent"
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
                aria-label={`Select ${c.name} accent color`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
