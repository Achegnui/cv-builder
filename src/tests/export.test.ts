import { describe, it, expect } from "vitest";
import * as fflate from "fflate";
import { generateDocx } from "@/lib/export/docx";
import { DEFAULT_STYLE_CONFIG, type StyleConfig } from "@/lib/templates";
import { SAMPLE_CV } from "@/lib/schema";
import { POST } from "@/app/api/export/docx/route";

describe("Word (.docx) Export Generator", () => {
  it("generates a valid .docx buffer for the sample CV", async () => {
    const buffer = await generateDocx(SAMPLE_CV, DEFAULT_STYLE_CONFIG);
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(1000);

    // Verify standard PK zip archive header
    expect(buffer[0]).toBe(0x50); // 'P'
    expect(buffer[1]).toBe(0x4b); // 'K'
    expect(buffer[2]).toBe(0x03);
    expect(buffer[3]).toBe(0x04);
  });

  it("contains expected profile, experience, and education text inside document.xml", async () => {
    const buffer = await generateDocx(SAMPLE_CV, DEFAULT_STYLE_CONFIG);
    const unzipped = fflate.unzipSync(new Uint8Array(buffer));

    expect(unzipped["word/document.xml"]).toBeDefined();
    const documentXml = fflate.strFromU8(unzipped["word/document.xml"]);

    // Verify core CV contents
    expect(documentXml).toContain("Alex Sample");
    expect(documentXml).toContain("Fictional Software Co.");
    expect(documentXml).toContain("Bachelor of Science");
    expect(documentXml).toContain("TypeScript");

    // Verify right-aligned tab stop exists for dates
    expect(documentXml).toContain('w:val="right"');
  });

  it("enforces black color 000000 for headings in black-only mode", async () => {
    const blackStyle: StyleConfig = {
      ...DEFAULT_STYLE_CONFIG,
      colorMode: "black",
      accentColor: "#881337", // Should be ignored
    };

    const buffer = await generateDocx(SAMPLE_CV, blackStyle);
    const unzipped = fflate.unzipSync(new Uint8Array(buffer));
    const documentXml = fflate.strFromU8(unzipped["word/document.xml"]);

    expect(documentXml).toContain('w:color="000000"');
    // Ensure the accent color was not used
    expect(documentXml).not.toContain("881337");
  });

  it("applies accent color when colorMode is accent", async () => {
    const accentStyle: StyleConfig = {
      ...DEFAULT_STYLE_CONFIG,
      colorMode: "accent",
      accentColor: "#1e3a8a",
    };

    const buffer = await generateDocx(SAMPLE_CV, accentStyle);
    const unzipped = fflate.unzipSync(new Uint8Array(buffer));
    const documentXml = fflate.strFromU8(unzipped["word/document.xml"]);

    expect(documentXml).toContain('w:color="1e3a8a"');
  });

  it("sets correct paper dimensions in twips for A4 vs US Letter", async () => {
    const a4Buffer = await generateDocx(SAMPLE_CV, {
      ...DEFAULT_STYLE_CONFIG,
      paperSize: "a4",
    });
    const a4Xml = fflate.strFromU8(fflate.unzipSync(new Uint8Array(a4Buffer))["word/document.xml"]);
    // A4 width in twips: 11905 (210mm)
    expect(a4Xml).toContain('w:w="11905"');

    const letterBuffer = await generateDocx(SAMPLE_CV, {
      ...DEFAULT_STYLE_CONFIG,
      paperSize: "letter",
    });
    const letterXml = fflate.strFromU8(fflate.unzipSync(new Uint8Array(letterBuffer))["word/document.xml"]);
    // Letter width in twips: 12240
    expect(letterXml).toContain('w:w="12240"');
  });
});

describe("Word Export API Route (POST /api/export/docx)", () => {
  it("returns 200 with docx headers for valid payload", async () => {
    const req = new Request("http://localhost:3000/api/export/docx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: SAMPLE_CV,
        style: DEFAULT_STYLE_CONFIG,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    expect(res.headers.get("Content-Disposition")).toContain("attachment; filename=");
    expect(res.headers.get("Content-Disposition")).toContain(".docx");

    const arrayBuffer = await res.arrayBuffer();
    expect(arrayBuffer.byteLength).toBeGreaterThan(1000);
  });

  it("returns 400 for payload missing required profile fields", async () => {
    const invalidPayload = {
      data: {
        profile: {
          fullName: "", // required name is empty
        },
      },
    };

    const req = new Request("http://localhost:3000/api/export/docx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid request payload");
  });
});
