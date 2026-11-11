import { describe, it, expect } from "vitest";
import {
  CVDataSchema,
  ProfileSchema,
  ExperienceEntrySchema,
  EducationEntrySchema,
  SAMPLE_CV,
} from "@/lib/schema";

describe("CV Schema Validation", () => {
  it("validates that SAMPLE_CV passes all schema rules", () => {
    const result = CVDataSchema.safeParse(SAMPLE_CV);
    expect(result.success).toBe(true);
  });

  describe("Profile validation", () => {
    it("fails when fullName is empty", () => {
      const invalid = {
        fullName: "",
        email: "test@example.com",
      };
      const result = ProfileSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Full name is required");
      }
    });

    it("fails when email is invalid format", () => {
      const invalid = {
        fullName: "Jane Doe",
        email: "not-an-email",
      };
      const result = ProfileSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("allows empty email or valid email", () => {
      expect(ProfileSchema.safeParse({ fullName: "Jane Doe", email: "" }).success).toBe(true);
      expect(ProfileSchema.safeParse({ fullName: "Jane Doe", email: "jane@test.org" }).success).toBe(true);
    });
  });

  describe("Date format validation (YYYY-MM)", () => {
    it("accepts valid YYYY-MM dates", () => {
      const entry = {
        employer: "Acme Corp",
        title: "Engineer",
        startDate: "2023-01",
        endDate: "2024-12",
      };
      const result = ExperienceEntrySchema.safeParse(entry);
      expect(result.success).toBe(true);
    });

    it("rejects invalid month numbers like 2024-13", () => {
      const entry = {
        employer: "Acme Corp",
        title: "Engineer",
        startDate: "2024-13",
      };
      const result = ExperienceEntrySchema.safeParse(entry);
      expect(result.success).toBe(false);
    });

    it("rejects slash-separated dates like 2024/05", () => {
      const entry = {
        employer: "Acme Corp",
        title: "Engineer",
        startDate: "2024/05",
      };
      const result = ExperienceEntrySchema.safeParse(entry);
      expect(result.success).toBe(false);
    });

    it("rejects arbitrary strings like 'summer 2023'", () => {
      const entry = {
        employer: "Acme Corp",
        title: "Engineer",
        startDate: "summer 2023",
      };
      const result = ExperienceEntrySchema.safeParse(entry);
      expect(result.success).toBe(false);
    });
  });

  describe("Education fields: GPA vs degreeClassification separation", () => {
    it("stores GPA and degreeClassification as distinct fields", () => {
      const entry = {
        institution: "University of Buea",
        degree: "BSc",
        field: "Computer Science",
        gpa: "3.8/4.0",
        degreeClassification: "First Class Honours",
        startDate: "2020-09",
        endDate: "2024-06",
      };
      const result = EducationEntrySchema.safeParse(entry);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.gpa).toBe("3.8/4.0");
        expect(result.data.degreeClassification).toBe("First Class Honours");
      }
    });

    it("requires institution and degree", () => {
      const missing = {
        institution: "",
        degree: "",
        startDate: "2020-09",
      };
      const result = EducationEntrySchema.safeParse(missing);
      expect(result.success).toBe(false);
    });
  });
});
