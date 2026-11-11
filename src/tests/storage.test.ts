import { describe, it, expect, beforeEach, vi } from "vitest";
import { saveCVToStorage, loadCVFromStorage, clearCVStorage } from "@/lib/storage";
import { SAMPLE_CV } from "@/lib/schema";

describe("Browser Storage Helper", () => {
  let mockStore: Record<string, string> = {};

  beforeEach(() => {
    mockStore = {};
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => mockStore[key] ?? null,
      setItem: (key: string, value: string) => {
        mockStore[key] = value;
      },
      removeItem: (key: string) => {
        delete mockStore[key];
      },
      clear: () => {
        mockStore = {};
      },
    });
  });

  it("returns null when storage is empty", () => {
    expect(loadCVFromStorage()).toBeNull();
  });

  it("saves and reloads valid CV data", () => {
    saveCVToStorage(SAMPLE_CV);
    const loaded = loadCVFromStorage();
    expect(loaded).not.toBeNull();
    expect(loaded?.profile.fullName).toBe("Alex Sample");
    expect(loaded?.experience.length).toBe(SAMPLE_CV.experience.length);
  });

  it("clears saved CV data", () => {
    saveCVToStorage(SAMPLE_CV);
    expect(loadCVFromStorage()).not.toBeNull();
    clearCVStorage();
    expect(loadCVFromStorage()).toBeNull();
  });

  it("rejects corrupt or invalid JSON in storage and returns null", () => {
    mockStore["cv-builder-data"] = "invalid-json-content{";
    expect(loadCVFromStorage()).toBeNull();
  });

  it("rejects stored data that does not conform to the schema", () => {
    mockStore["cv-builder-data"] = JSON.stringify({
      profile: { fullName: "" }, // required name missing
    });
    expect(loadCVFromStorage()).toBeNull();
  });
});
