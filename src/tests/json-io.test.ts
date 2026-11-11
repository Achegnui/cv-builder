import { describe, it, expect } from "vitest";
import { importCVFromJSON } from "@/lib/json-io";
import { SAMPLE_CV } from "@/lib/schema";

describe("JSON Import & Backup", () => {
  it("imports a valid CV JSON file matching the schema", async () => {
    const jsonString = JSON.stringify(SAMPLE_CV);
    const file = new File([jsonString], "backup.json", {
      type: "application/json",
    });

    const data = await importCVFromJSON(file);
    expect(data.profile.fullName).toBe("Alex Sample");
    expect(data.education[0].institution).toBe("Fictional University");
    expect(data.education[0].gpa).toBe("3.6/4.0");
  });

  it("throws an error when file contains non-JSON text", async () => {
    const file = new File(["not json content"], "corrupt.json", {
      type: "application/json",
    });

    await expect(importCVFromJSON(file)).rejects.toThrow(
      "The file is not valid JSON."
    );
  });

  it("throws a descriptive error when JSON fails schema validation", async () => {
    const invalidData = {
      profile: {
        fullName: "", // required
        email: "bad-email",
      },
    };
    const file = new File([JSON.stringify(invalidData)], "invalid.json", {
      type: "application/json",
    });

    await expect(importCVFromJSON(file)).rejects.toThrow(
      "The file does not match the CV format:"
    );
  });
});
