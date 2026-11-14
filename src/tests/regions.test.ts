// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import {
  REGION_PROFILES,
  getRegionProfile,
  getAllRegionProfiles,
  getDefaultRegionOverrides,
  type RegionProfileId,
} from "@/lib/regions";
import { SingleColumnTemplate } from "@/lib/templates/single-column";
import { DEFAULT_STYLE_CONFIG } from "@/lib/templates";
import { SAMPLE_CV } from "@/lib/schema";

describe("Phase 4: Region & Purpose Profiles", () => {
  it("provides all 8 required region profiles", () => {
    const requiredIds: RegionProfileId[] = [
      "us",
      "uk",
      "german",
      "europass",
      "academic",
      "technical",
      "combination",
      "one-page",
    ];

    const allProfiles = getAllRegionProfiles();
    expect(allProfiles.length).toBe(8);

    for (const id of requiredIds) {
      const profile = getRegionProfile(id);
      expect(profile).toBeDefined();
      expect(profile.id).toBe(id);
      expect(profile.name).toBeTruthy();
      expect(profile.sectionOrder.length).toBeGreaterThan(0);
      expect(profile.sectionLabels).toBeDefined();
    }
  });

  it("US profile adheres to US conventions", () => {
    const us = getRegionProfile("us");
    expect(us.defaultPaperSize).toBe("letter");
    expect(us.photoConvention).toBe("not_used");
    expect(us.personalDetailsAllowed.dateOfBirth).toBe(false);
    expect(us.personalDetailsAllowed.nationality).toBe(false);
    expect(us.sectionLabels.summary).toBe("Summary");

    // Warnings contain polite 'commonly' / 'often' phrasing
    const photoWarning = us.warnings.find((w) => w.field === "photo");
    expect(photoWarning).toBeDefined();
    expect(photoWarning?.message).toMatch(/often left out|commonly/i);
    expect(photoWarning?.why).toBeTruthy();
  });

  it("UK profile uses A4 and omits photos by standard convention", () => {
    const uk = getRegionProfile("uk");
    expect(uk.defaultPaperSize).toBe("a4");
    expect(uk.photoConvention).toBe("not_used");
    expect(uk.sectionLabels.summary).toBe("Personal Profile");
    expect(uk.sectionLabels.experience).toBe("Employment History");
  });

  it("German profile (Lebenslauf) supports photo and personal details", () => {
    const german = getRegionProfile("german");
    expect(german.defaultPaperSize).toBe("a4");
    expect(german.photoConvention).toBe("commonly_expected");
    expect(german.personalDetailsAllowed.dateOfBirth).toBe(true);
    expect(german.personalDetailsAllowed.nationality).toBe(true);
    expect(german.sectionLabels.experience).toBe("Beruflicher Werdegang (Experience)");
    expect(german.sectionLabels.education).toBe("Ausbildung & Studium (Education)");
    expect(german.sectionLabels.skills).toBe("Kenntnisse & Fähigkeiten (Skills)");
  });

  it("Academic profile has no page limit and prioritizes scholarly sections", () => {
    const academic = getRegionProfile("academic");
    expect(academic.recommendedPages).toBeNull(); // No page limit

    const pubIndex = academic.sectionOrder.indexOf("publications");
    const expIndex = academic.sectionOrder.indexOf("experience");
    expect(pubIndex).toBeGreaterThanOrEqual(0);
    expect(expIndex).toBeGreaterThanOrEqual(0);
    // In academic CVs, publications or education appear before general work experience
    expect(pubIndex).toBeLessThan(expIndex);
  });

  it("Technical profile orders skills and projects before general work", () => {
    const tech = getRegionProfile("technical");
    const skillsIndex = tech.sectionOrder.indexOf("skills");
    const expIndex = tech.sectionOrder.indexOf("experience");
    expect(skillsIndex).toBeLessThan(expIndex);
  });

  it("Combination profile leads with skills", () => {
    const comb = getRegionProfile("combination");
    const skillsIndex = comb.sectionOrder.indexOf("skills");
    const expIndex = comb.sectionOrder.indexOf("experience");
    expect(skillsIndex).toBeLessThan(expIndex);
  });

  it("One-Page profile recommends exactly 1 page and carries overflow warning", () => {
    const onePage = getRegionProfile("one-page");
    expect(onePage.recommendedPages).toBe(1);
    const overflowWarn = onePage.warnings.find((w) => w.id === "one-page-overflow");
    expect(overflowWarn).toBeDefined();
    expect(overflowWarn?.message).toMatch(/one sheet|one page/i);
  });

  it("generates correct default overrides for region profiles", () => {
    const usDefaults = getDefaultRegionOverrides(getRegionProfile("us"));
    expect(usDefaults.showPhoto).toBe(false);
    expect(usDefaults.showDateOfBirth).toBe(false);
    expect(usDefaults.showNationality).toBe(false);

    const germanDefaults = getDefaultRegionOverrides(getRegionProfile("german"));
    expect(germanDefaults.showPhoto).toBe(true);
    expect(germanDefaults.showDateOfBirth).toBe(true);
    expect(germanDefaults.showNationality).toBe(true);
  });

  it("renders SingleColumnTemplate with dynamic regional section order and labels", () => {
    const german = getRegionProfile("german");
    const overrides = getDefaultRegionOverrides(german);

    const { container, getByText } = render(
      React.createElement(SingleColumnTemplate, {
        data: SAMPLE_CV,
        style: DEFAULT_STYLE_CONFIG,
        regionProfile: german,
        userOverrides: overrides,
      })
    );

    // Verify German section headings are rendered
    expect(getByText("Beruflicher Werdegang (Experience)")).toBeDefined();
    expect(getByText("Ausbildung & Studium (Education)")).toBeDefined();
    expect(getByText("Kenntnisse & Fähigkeiten (Skills)")).toBeDefined();

    // Verify date of birth is displayed when toggle is on
    expect(container.textContent).toContain("Born: 1998-03");
  });

  it("respects user overrides when toggling photo and personal details off", () => {
    const german = getRegionProfile("german");
    const customOverrides = {
      showPhoto: false,
      showDateOfBirth: false,
      showNationality: false,
      dismissedWarningIds: [],
    };

    const { container } = render(
      React.createElement(SingleColumnTemplate, {
        data: SAMPLE_CV,
        style: DEFAULT_STYLE_CONFIG,
        regionProfile: german,
        userOverrides: customOverrides,
      })
    );

    // Date of birth should not be rendered when user toggles it off
    expect(container.textContent).not.toContain("Born: 1998-03");
  });
});
