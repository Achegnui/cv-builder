"use client";

import React from "react";

/**
 * Collapsible section wrapper used by every CV form section.
 * Shows a header with the section title and an add button for list sections.
 * Items can be reordered with up/down arrows and removed.
 */
interface SectionWrapperProps {
  title: string;
  /** Description shown under the title */
  description?: string;
  children: React.ReactNode;
  /** If provided, shows an "Add" button that calls this function */
  onAdd?: () => void;
  /** Label for the add button, defaults to "Add" */
  addLabel?: string;
  /** Whether the section starts open. Defaults to true. */
  defaultOpen?: boolean;
}

export function SectionWrapper({
  title,
  description,
  children,
  onAdd,
  addLabel = "Add",
  defaultOpen = true,
}: SectionWrapperProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <section className="border border-neutral-200 rounded-lg overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50 hover:bg-neutral-100 transition-colors text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
          {description && (
            <p className="text-sm text-neutral-500 mt-0.5">{description}</p>
          )}
        </div>
        <span className="text-neutral-400 text-xl" aria-hidden="true">
          {isOpen ? "−" : "+"}
        </span>
      </button>
      {isOpen && (
        <div className="p-4 space-y-4">
          {children}
          {onAdd && (
            <button
              type="button"
              onClick={onAdd}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              + {addLabel}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

/**
 * Controls for a single entry in a repeatable list section:
 * move up, move down, and remove.
 */
interface EntryControlsProps {
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

export function EntryControls({
  index,
  total,
  onMoveUp,
  onMoveDown,
  onRemove,
}: EntryControlsProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onMoveUp}
        disabled={index === 0}
        className="p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-30"
        aria-label="Move up"
        title="Move up"
      >
        ↑
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={index === total - 1}
        className="p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-30"
        aria-label="Move down"
        title="Move down"
      >
        ↓
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="p-1 text-red-400 hover:text-red-600"
        aria-label="Remove entry"
        title="Remove"
      >
        ✕
      </button>
    </div>
  );
}
