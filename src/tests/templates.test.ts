// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import {
  templateRegistry,
  DEFAULT_STYLE_CONFIG,
  SingleColumnTemplate,
  type StyleConfig,
} from "@/lib/templates";
import { SAMPLE_CV } from "@/lib/schema";

describe("Template Engine & Registry", () => {
  it("registers and retrieves the default single-column template", () => {
    const template = templateRegistry.get("single-column");
    expect(template).toBeDefined();
    expect(template.id).toBe("single-column");
    expect(template.name).toContain("Single Column");
  });

  it("falls back to single-column when an unknown template ID is requested", () => {
    const fallback = templateRegistry.get("non-existent-template-id");
    expect(fallback).toBeDefined();
    expect(fallback.id).toBe("single-column");
  });

  it("lists all registered templates", () => {
    const all = templateRegistry.getAll();
    expect(all.length).toBeGreaterThanOrEqual(1);
    expect(all.some((t) => t.id === "single-column")).toBe(true);
  });

  it("allows registering a new custom template", () => {
    const dummyComponent = () => React.createElement("div", null, "Custom");
    templateRegistry.register({
      id: "test-custom-template",
      name: "Test Custom",
      description: "Custom template for testing registry",
      component: dummyComponent,
    });

    expect(templateRegistry.has("test-custom-template")).toBe(true);
    expect(templateRegistry.get("test-custom-template").name).toBe("Test Custom");
  });
});

describe("Single Column Template Rendering", () => {
  it("renders sample CV profile, experience, and education without throwing", () => {
    const { container, getByText } = render(
      React.createElement(SingleColumnTemplate, {
        data: SAMPLE_CV,
        style: DEFAULT_STYLE_CONFIG,
      })
    );

    expect(getByText("Alex Sample")).toBeDefined();
    expect(getByText(/Fictional Software Co/)).toBeDefined();
    expect(getByText(/Bachelor of Science/)).toBeDefined();

    // ATS-Safety check: zero <table> elements used for layout
    const tables = container.querySelectorAll("table");
    expect(tables.length).toBe(0);
  });

  it("strictly enforces black colors in black-only color mode", () => {
    const blackStyle: StyleConfig = {
      ...DEFAULT_STYLE_CONFIG,
      colorMode: "black",
      accentColor: "#881337", // Should be ignored in favor of black
    };

    const { getByRole } = render(
      React.createElement(SingleColumnTemplate, {
        data: SAMPLE_CV,
        style: blackStyle,
      })
    );

    const nameHeading = getByRole("heading", { level: 1 });
    expect(nameHeading.style.color).toBe("rgb(0, 0, 0)");
  });

  it("applies accent color when colorMode is accent", () => {
    const accentStyle: StyleConfig = {
      ...DEFAULT_STYLE_CONFIG,
      colorMode: "accent",
      accentColor: "#1e3a8a",
    };

    const { getByRole } = render(
      React.createElement(SingleColumnTemplate, {
        data: SAMPLE_CV,
        style: accentStyle,
      })
    );

    const nameHeading = getByRole("heading", { level: 1 });
    // #1e3a8a converts to rgb(30, 58, 138) in computed styles
    expect(nameHeading.style.color).toBe("rgb(30, 58, 138)");
  });

  it("applies font family class options (sans, serif, mono)", () => {
    const { container: sansContainer } = render(
      React.createElement(SingleColumnTemplate, {
        data: SAMPLE_CV,
        style: { ...DEFAULT_STYLE_CONFIG, fontFamily: "sans" },
      })
    );
    expect((sansContainer.firstChild as HTMLElement).className).toContain("font-sans");

    const { container: serifContainer } = render(
      React.createElement(SingleColumnTemplate, {
        data: SAMPLE_CV,
        style: { ...DEFAULT_STYLE_CONFIG, fontFamily: "serif" },
      })
    );
    expect((serifContainer.firstChild as HTMLElement).className).toContain("font-serif");

    const { container: monoContainer } = render(
      React.createElement(SingleColumnTemplate, {
        data: SAMPLE_CV,
        style: { ...DEFAULT_STYLE_CONFIG, fontFamily: "mono" },
      })
    );
    expect((monoContainer.firstChild as HTMLElement).className).toContain("font-mono");
  });
});
