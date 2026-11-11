"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { loadCVFromStorage } from "@/lib/storage";
import { type StyleConfig, DEFAULT_STYLE_CONFIG, templateRegistry } from "@/lib/templates";
import type { CVData } from "@/lib/schema";
import { SAMPLE_CV } from "@/lib/schema";

export default function PrintPage() {
  const [data, setData] = useState<CVData | null>(null);
  const [style, setStyle] = useState<StyleConfig>(DEFAULT_STYLE_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = loadCVFromStorage();
    setData(saved || SAMPLE_CV);

    try {
      const savedStyle = localStorage.getItem("cv-builder-style");
      if (savedStyle) {
        setStyle(JSON.parse(savedStyle));
      }
    } catch {
      // Ignore style parse errors
    }

    setIsLoaded(true);

    // Auto-trigger print dialog after mounting
    const timer = setTimeout(() => {
      window.print();
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen text-neutral-500">
        Preparing document for print...
      </div>
    );
  }

  const template = templateRegistry.get("single-column");
  const TemplateComponent = template.component;

  return (
    <div className="min-h-screen bg-white">
      {/* Top Banner (hidden in print) */}
      <div className="no-print bg-neutral-900 text-white p-3 flex items-center justify-between text-xs sm:text-sm">
        <span>Print View: In the print dialog, select &ldquo;Save as PDF&rdquo; with paper size &ldquo;{style.paperSize.toUpperCase()}&rdquo;.</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded"
          >
            🖨️ Print Dialog
          </button>
          <Link
            href="/"
            className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded"
          >
            ← Back to Editor
          </Link>
        </div>
      </div>

      {/* Printable Document Container */}
      <div className="w-full flex justify-center p-0 print:p-0">
        <div className="w-full max-w-[210mm] print:max-w-none print:w-full">
          <TemplateComponent data={data} style={style} />
        </div>
      </div>
    </div>
  );
}
