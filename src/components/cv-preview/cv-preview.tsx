"use client";

import React from "react";
import type { CVData } from "@/lib/schema";
import { type StyleConfig, templateRegistry } from "@/lib/templates";
import type { RegionProfile, UserRegionOverrides } from "@/lib/regions";

interface CVPreviewProps {
  data: CVData;
  style: StyleConfig;
  templateId?: string;
  regionProfile?: RegionProfile;
  userOverrides?: UserRegionOverrides;
}

export function CVPreview({
  data,
  style,
  templateId = "single-column",
  regionProfile,
  userOverrides,
}: CVPreviewProps) {
  const template = templateRegistry.get(templateId);
  const TemplateComponent = template.component;

  // Paper width styles for on-screen preview
  const paperClass =
    style.paperSize === "letter"
      ? "w-full max-w-[8.5in] min-h-[11in]"
      : "w-full max-w-[210mm] min-h-[297mm]";

  return (
    <div className="w-full flex flex-col items-center">
      {/* Scroll container: allows horizontal scrolling on small screens (360px) while maintaining true paper aspect */}
      <div className="w-full overflow-x-auto p-2 sm:p-4 bg-neutral-200/70 rounded-lg flex justify-center print:bg-white print:p-0 print:overflow-visible">
        <div
          className={`${paperClass} bg-white shadow-md print:shadow-none print:w-full print:max-w-none transition-all duration-150`}
        >
          <TemplateComponent
            data={data}
            style={style}
            regionProfile={regionProfile}
            userOverrides={userOverrides}
          />
        </div>
      </div>
    </div>
  );
}
