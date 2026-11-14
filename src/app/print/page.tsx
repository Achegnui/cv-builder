"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { loadCVFromStorage } from "@/lib/storage";
import { type StyleConfig, DEFAULT_STYLE_CONFIG, templateRegistry } from "@/lib/templates";
import {
  getRegionProfile,
  getDefaultRegionOverrides,
  type RegionProfile,
  type RegionProfileId,
  type UserRegionOverrides,
} from "@/lib/regions";
import type { CVData } from "@/lib/schema";
import { SAMPLE_CV } from "@/lib/schema";
import { runCVDoctor, getBlockingIssues } from "@/lib/validation";

export default function PrintPage() {
  const [data, setData] = useState<CVData | null>(null);
  const [style, setStyle] = useState<StyleConfig>(DEFAULT_STYLE_CONFIG);
  const [regionProfile, setRegionProfile] = useState<RegionProfile>(() => getRegionProfile("us"));
  const [overrides, setOverrides] = useState<UserRegionOverrides>(() =>
    getDefaultRegionOverrides(getRegionProfile("us"))
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasPlaceholders, setHasPlaceholders] = useState(false);

  useEffect(() => {
    const saved = loadCVFromStorage();
    const cvData = saved || SAMPLE_CV;
    setData(cvData);

    const issues = runCVDoctor(cvData, { vault: [] });
    const blocking = getBlockingIssues(issues);
    const isBlocked = blocking.length > 0;
    setHasPlaceholders(isBlocked);

    let currentProfile = getRegionProfile("us");
    try {
      const savedRegionId = localStorage.getItem("cv-builder-region") as RegionProfileId | null;
      if (savedRegionId) {
        currentProfile = getRegionProfile(savedRegionId);
        setRegionProfile(currentProfile);
      }
    } catch {
      // Ignore region load errors
    }

    try {
      const savedOverrides = localStorage.getItem("cv-builder-overrides");
      if (savedOverrides) {
        setOverrides(JSON.parse(savedOverrides));
      } else {
        setOverrides(getDefaultRegionOverrides(currentProfile));
      }
    } catch {
      setOverrides(getDefaultRegionOverrides(currentProfile));
    }

    try {
      const savedStyle = localStorage.getItem("cv-builder-style");
      if (savedStyle) {
        setStyle(JSON.parse(savedStyle));
      }
    } catch {
      // Ignore style parse errors
    }

    setIsLoaded(true);

    // Auto-trigger print dialog only if no blocking placeholders
    if (!isBlocked) {
      const timer = setTimeout(() => {
        window.print();
      }, 400);
      return () => clearTimeout(timer);
    }
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
      <div className="no-print bg-neutral-900 text-white p-3 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
        <div>
          {hasPlaceholders ? (
            <span className="text-red-400 font-bold">
              ⚠️ Export blocked: CV contains unfinished placeholders (e.g. [add number]). Resolve them before printing.
            </span>
          ) : (
            <span>
              Print View ({regionProfile.name}): In print dialog, select &ldquo;Save as PDF&rdquo; with paper size &ldquo;{style.paperSize.toUpperCase()}&rdquo;.
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!hasPlaceholders && (
            <button
              type="button"
              onClick={() => window.print()}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded"
            >
              🖨️ Print Dialog
            </button>
          )}
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
          <TemplateComponent
            data={data}
            style={style}
            regionProfile={regionProfile}
            userOverrides={overrides}
          />
        </div>
      </div>
    </div>
  );
}
