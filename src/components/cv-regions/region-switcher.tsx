"use client";

import React from "react";
import {
  getAllRegionProfiles,
  type RegionProfile,
  type RegionProfileId,
} from "@/lib/regions";

interface RegionSwitcherProps {
  currentProfileId: RegionProfileId;
  onSelectProfile: (profile: RegionProfile) => void;
}

export function RegionSwitcher({
  currentProfileId,
  onSelectProfile,
}: RegionSwitcherProps) {
  const profiles = getAllRegionProfiles();
  const currentProfile = profiles.find((p) => p.id === currentProfileId) || profiles[0];

  return (
    <div className="no-print bg-white border border-neutral-200 rounded-lg p-3 sm:p-4 mb-4 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <label htmlFor="region-profile-select" className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Target Region & CV Format
          </label>
          <p className="text-xs text-neutral-500 mt-0.5">
            Adapts section order, labels, paper size, and regional conventions to your target purpose.
          </p>
        </div>

        {/* Profile Dropdown */}
        <div className="w-full sm:w-auto">
          <select
            id="region-profile-select"
            value={currentProfileId}
            onChange={(e) => {
              const selected = profiles.find((p) => p.id === e.target.value);
              if (selected) onSelectProfile(selected);
            }}
            className="w-full sm:w-64 rounded-md border border-neutral-300 py-1.5 px-3 bg-white text-sm font-semibold text-neutral-800 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Profile Summary Banner */}
      <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-600">
        <div className="space-x-2">
          <span className="font-medium text-neutral-900">{currentProfile.subtitle}</span>
          <span>•</span>
          <span>{currentProfile.description}</span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <span className="bg-neutral-100 px-2 py-0.5 rounded text-neutral-700">
            Paper: {currentProfile.defaultPaperSize.toUpperCase()}
          </span>
          <span className="bg-neutral-100 px-2 py-0.5 rounded text-neutral-700">
            Length: {currentProfile.recommendedPages ? `${currentProfile.recommendedPages} pg recommended` : "No page limit"}
          </span>
        </div>
      </div>

      {/* Honest Conventions Disclaimer */}
      <p className="text-[11px] text-neutral-400 italic">
        Note: Regional conventions vary between individual employers and sectors. These conventions are helpful guidelines, not rigid laws.
      </p>
    </div>
  );
}
