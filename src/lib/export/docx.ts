import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  TabStopType,
  BorderStyle,
  convertInchesToTwip,
  convertMillimetersToTwip,
} from "docx";
import type { CVData } from "@/lib/schema";
import type { StyleConfig } from "@/lib/templates";
import type { RegionProfile, UserRegionOverrides, SectionKey } from "@/lib/regions";

/**
 * Generate a native Microsoft Word (.docx) document buffer from CV data, style config,
 * and optional region profile conventions.
 * Mirrors the SingleColumnTemplate layout dynamically:
 * - Dynamic regional section ordering
 * - Regional section headings
 * - Personal detail toggles (DOB, nationality)
 * - Right-aligned tab stops for dates
 * - Consistent bullet points
 * - A4 and US Letter page dimension support
 * - Black-only mode or accent colors
 * - Three safe font stacks (Arial, Georgia, Courier New)
 */
export async function generateDocx(
  data: CVData,
  style: StyleConfig,
  regionProfile?: RegionProfile,
  userOverrides?: UserRegionOverrides
): Promise<Buffer> {
  const isBlackOnly = style.colorMode === "black";
  const isCompact = style.spacing === "compact";

  // Hex color without '#' for docx
  const accentHex = isBlackOnly ? "000000" : style.accentColor.replace("#", "");
  const bodyTextHex = "171717";
  const mutedTextHex = "666666";

  // Safe fonts for Word
  const fontName =
    style.fontFamily === "serif"
      ? "Georgia"
      : style.fontFamily === "mono"
      ? "Courier New"
      : "Arial";

  // Page dimensions & margins
  const isLetter = style.paperSize === "letter";
  const pageWidth = isLetter
    ? convertInchesToTwip(8.5)
    : convertMillimetersToTwip(210);
  const pageHeight = isLetter
    ? convertInchesToTwip(11)
    : convertMillimetersToTwip(297);
  const marginX = isLetter
    ? convertInchesToTwip(0.6)
    : convertMillimetersToTwip(15);
  const marginY = isLetter
    ? convertInchesToTwip(0.6)
    : convertMillimetersToTwip(15);

  const contentWidth = pageWidth - marginX * 2;

  // Font sizes in half-points (e.g. 24 = 12pt, 20 = 10pt, 18 = 9pt)
  const nameSize = isCompact ? 36 : 42;
  const headingSize = isCompact ? 20 : 22;
  const titleSize = isCompact ? 19 : 20;
  const bodySize = isCompact ? 18 : 19;
  const smallSize = 16;

  // Paragraph Spacing in twips
  const sectionHeadingSpacing = isCompact
    ? { before: 140, after: 60 }
    : { before: 240, after: 100 };
  const entrySpacing = isCompact
    ? { before: 80, after: 40 }
    : { before: 140, after: 60 };
  const bulletSpacing = isCompact
    ? { before: 20, after: 40 }
    : { before: 40, after: 60 };

  // Personal detail toggles
  const showDob = userOverrides?.showDateOfBirth ?? (regionProfile?.personalDetailsAllowed.dateOfBirth ?? false);
  const showNat = userOverrides?.showNationality ?? (regionProfile?.personalDetailsAllowed.nationality ?? false);

  // Regional section ordering and labels
  const sectionOrder: SectionKey[] = regionProfile?.sectionOrder || [
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
    "awards",
    "languages",
    "publications",
    "grants",
    "teaching",
    "conferences",
  ];

  const labels = regionProfile?.sectionLabels || {
    summary: "Summary",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    projects: "Projects",
    certifications: "Certifications",
    awards: "Honors & Awards",
    languages: "Languages",
    publications: "Publications",
    grants: "Grants & Funding",
    teaching: "Teaching Experience",
    conferences: "Conferences & Talks",
  };

  // Helper for section headings with bottom border rule
  const createSectionHeading = (title: string): Paragraph => {
    return new Paragraph({
      spacing: sectionHeadingSpacing,
      border: {
        bottom: {
          color: accentHex,
          space: 2,
          style: BorderStyle.SINGLE,
          size: 8,
        },
      },
      children: [
        new TextRun({
          text: title.toUpperCase(),
          bold: true,
          size: headingSize,
          color: accentHex,
          font: fontName,
        }),
      ],
    });
  };

  // Helper for entries with right-aligned dates via tab stop
  const createEntryHeader = (
    leftTitle: string,
    leftSubtitle: string | undefined,
    rightDate: string | undefined
  ): Paragraph => {
    const children: TextRun[] = [
      new TextRun({
        text: leftTitle,
        bold: true,
        size: titleSize,
        color: bodyTextHex,
        font: fontName,
      }),
    ];

    if (leftSubtitle) {
      children.push(
        new TextRun({
          text: ` — ${leftSubtitle}`,
          bold: false,
          size: titleSize,
          color: bodyTextHex,
          font: fontName,
        })
      );
    }

    if (rightDate) {
      children.push(
        new TextRun({
          text: "\t",
          font: fontName,
        }),
        new TextRun({
          text: rightDate,
          bold: false,
          size: smallSize,
          color: mutedTextHex,
          font: fontName,
        })
      );
    }

    return new Paragraph({
      spacing: entrySpacing,
      tabStops: [
        {
          type: TabStopType.RIGHT,
          position: contentWidth,
        },
      ],
      children,
    });
  };

  const paragraphs: Paragraph[] = [];

  // 1. Header (Full Name & Contact details)
  paragraphs.push(
    new Paragraph({
      spacing: { before: 0, after: 60 },
      children: [
        new TextRun({
          text: data.profile.fullName || "Your Full Name",
          bold: true,
          size: nameSize,
          color: accentHex,
          font: fontName,
        }),
      ],
    })
  );

  const contactItems: string[] = [];
  if (data.profile.email) contactItems.push(data.profile.email);
  if (data.profile.phone) contactItems.push(data.profile.phone);
  if (data.profile.location) contactItems.push(data.profile.location);
  if (data.profile.linkedIn) contactItems.push(data.profile.linkedIn);
  if (data.profile.website) contactItems.push(data.profile.website);
  if (showNat && data.profile.nationality) contactItems.push(`Nationality: ${data.profile.nationality}`);
  if (showDob && data.profile.dateOfBirth) contactItems.push(`Born: ${data.profile.dateOfBirth}`);

  if (contactItems.length > 0) {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 0, after: isCompact ? 100 : 160 },
        children: [
          new TextRun({
            text: contactItems.join("  |  "),
            size: smallSize,
            color: mutedTextHex,
            font: fontName,
          }),
        ],
      })
    );
  }

  // Section generators
  const buildSummary = () => {
    if (!data.summary.text) return;
    paragraphs.push(createSectionHeading(labels.summary));
    paragraphs.push(
      new Paragraph({
        spacing: { before: 40, after: 100 },
        children: [
          new TextRun({
            text: data.summary.text,
            size: bodySize,
            color: bodyTextHex,
            font: fontName,
          }),
        ],
      })
    );
  };

  const buildSkills = () => {
    if (!data.skillGroups || data.skillGroups.length === 0) return;
    paragraphs.push(createSectionHeading(labels.skills));
    for (const group of data.skillGroups) {
      const skillsStr = group.skills.filter(Boolean).join(", ");
      paragraphs.push(
        new Paragraph({
          spacing: { before: 20, after: 40 },
          children: [
            new TextRun({
              text: `${group.category}: `,
              bold: true,
              size: bodySize,
              color: bodyTextHex,
              font: fontName,
            }),
            new TextRun({
              text: skillsStr,
              size: bodySize,
              color: bodyTextHex,
              font: fontName,
            }),
          ],
        })
      );
    }
  };

  const buildExperience = () => {
    if (!data.experience || data.experience.length === 0) return;
    paragraphs.push(createSectionHeading(labels.experience));
    for (const exp of data.experience) {
      const dateRange = `${exp.startDate || ""} – ${exp.isCurrent ? "Present" : exp.endDate || ""}`;
      paragraphs.push(createEntryHeader(exp.title, exp.employer, dateRange));

      if (exp.location) {
        paragraphs.push(
          new Paragraph({
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({
                text: exp.location,
                size: smallSize,
                color: mutedTextHex,
                font: fontName,
              }),
            ],
          })
        );
      }

      for (const bullet of exp.bullets.filter(Boolean)) {
        paragraphs.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: bulletSpacing,
            children: [
              new TextRun({
                text: bullet,
                size: bodySize,
                color: bodyTextHex,
                font: fontName,
              }),
            ],
          })
        );
      }
    }
  };

  const buildEducation = () => {
    if (!data.education || data.education.length === 0) return;
    paragraphs.push(createSectionHeading(labels.education));
    for (const edu of data.education) {
      const dateRange = `${edu.startDate || ""} – ${edu.isExpected ? "Expected " : ""}${edu.endDate || ""}`;
      const degreeFull = edu.field ? `${edu.degree} in ${edu.field}` : edu.degree;
      paragraphs.push(createEntryHeader(degreeFull, edu.institution, dateRange));

      const gradeParts: string[] = [];
      if (edu.gpa) gradeParts.push(`GPA: ${edu.gpa}`);
      if (edu.degreeClassification) gradeParts.push(`Classification: ${edu.degreeClassification}`);

      if (gradeParts.length > 0) {
        paragraphs.push(
          new Paragraph({
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({
                text: gradeParts.join("   |   "),
                size: smallSize,
                color: mutedTextHex,
                font: fontName,
              }),
            ],
          })
        );
      }

      if (edu.bullets) {
        for (const bullet of edu.bullets.filter(Boolean)) {
          paragraphs.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: bulletSpacing,
              children: [
                new TextRun({
                  text: bullet,
                  size: bodySize,
                  color: bodyTextHex,
                  font: fontName,
                }),
              ],
            })
          );
        }
      }
    }
  };

  const buildProjects = () => {
    if (!data.projects || data.projects.length === 0) return;
    paragraphs.push(createSectionHeading(labels.projects));
    for (const proj of data.projects) {
      const dateRange = proj.startDate || proj.endDate
        ? `${proj.startDate || ""} – ${proj.endDate || ""}`
        : undefined;
      const stack = proj.techStack?.length ? ` (${proj.techStack.filter(Boolean).join(", ")})` : "";
      paragraphs.push(createEntryHeader(proj.name + stack, undefined, dateRange));

      if (proj.description) {
        paragraphs.push(
          new Paragraph({
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({
                text: proj.description,
                size: bodySize,
                color: bodyTextHex,
                font: fontName,
              }),
            ],
          })
        );
      }

      if (proj.links && proj.links.length > 0) {
        paragraphs.push(
          new Paragraph({
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({
                text: proj.links.filter(Boolean).join("   "),
                size: smallSize,
                color: isBlackOnly ? "000000" : "1e40af",
                font: fontName,
              }),
            ],
          })
        );
      }
    }
  };

  const buildCertifications = () => {
    if (!data.certifications || data.certifications.length === 0) return;
    paragraphs.push(createSectionHeading(labels.certifications));
    for (const cert of data.certifications) {
      paragraphs.push(
        createEntryHeader(
          cert.name,
          cert.issuer ? `${cert.issuer}${cert.credentialId ? ` (ID: ${cert.credentialId})` : ""}` : undefined,
          cert.date || undefined
        )
      );
    }
  };

  const buildAwards = () => {
    if (!data.awards || data.awards.length === 0) return;
    paragraphs.push(createSectionHeading(labels.awards));
    for (const award of data.awards) {
      paragraphs.push(
        createEntryHeader(
          award.title,
          award.issuer || undefined,
          award.date || undefined
        )
      );
      if (award.description) {
        paragraphs.push(
          new Paragraph({
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({
                text: award.description,
                size: smallSize,
                color: mutedTextHex,
                font: fontName,
              }),
            ],
          })
        );
      }
    }
  };

  const buildLanguages = () => {
    if (!data.languages || data.languages.length === 0) return;
    paragraphs.push(createSectionHeading(labels.languages));
    paragraphs.push(
      new Paragraph({
        spacing: { before: 40, after: 100 },
        children: [
          new TextRun({
            text: data.languages
              .map((l) => `${l.language} (${l.proficiency})`)
              .join("   •   "),
            size: bodySize,
            color: bodyTextHex,
            font: fontName,
          }),
        ],
      })
    );
  };

  const buildPublications = () => {
    if (!data.publications || data.publications.length === 0) return;
    paragraphs.push(createSectionHeading(labels.publications));
    for (const pub of data.publications) {
      const parts = [
        pub.title,
        pub.authors,
        pub.venue,
        pub.date ? `(${pub.date})` : undefined,
      ].filter(Boolean);
      paragraphs.push(
        new Paragraph({
          spacing: { before: 20, after: 60 },
          children: [
            new TextRun({
              text: parts.join(". "),
              size: bodySize,
              color: bodyTextHex,
              font: fontName,
            }),
          ],
        })
      );
    }
  };

  const buildGrants = () => {
    if (!data.grants || data.grants.length === 0) return;
    paragraphs.push(createSectionHeading(labels.grants));
    for (const grant of data.grants) {
      const subtitle = `${grant.funder || ""}${grant.amount ? ` (${grant.currency || "$"} ${grant.amount})` : ""}`;
      paragraphs.push(createEntryHeader(grant.title, subtitle || undefined, grant.startDate || undefined));
    }
  };

  const buildTeaching = () => {
    if (!data.teaching || data.teaching.length === 0) return;
    paragraphs.push(createSectionHeading(labels.teaching));
    for (const t of data.teaching) {
      const dateRange = t.startDate ? `${t.startDate} – ${t.endDate || "Present"}` : undefined;
      const subtitle = `${t.course || ""}${t.institution ? ` (${t.institution})` : ""}`;
      paragraphs.push(createEntryHeader(t.role, subtitle || undefined, dateRange));
    }
  };

  const buildConferences = () => {
    if (!data.conferences || data.conferences.length === 0) return;
    paragraphs.push(createSectionHeading(labels.conferences));
    for (const conf of data.conferences) {
      const subtitle = `${conf.event || ""}${conf.role ? ` [${conf.role}]` : ""}`;
      paragraphs.push(createEntryHeader(conf.title, subtitle || undefined, conf.date || undefined));
    }
  };

  const sectionBuilderMap: Record<SectionKey, () => void> = {
    summary: buildSummary,
    experience: buildExperience,
    education: buildEducation,
    skills: buildSkills,
    projects: buildProjects,
    certifications: buildCertifications,
    awards: buildAwards,
    languages: buildLanguages,
    publications: buildPublications,
    grants: buildGrants,
    teaching: buildTeaching,
    conferences: buildConferences,
  };

  // Build sections according to regional order
  for (const sectionKey of sectionOrder) {
    const builder = sectionBuilderMap[sectionKey];
    if (builder) builder();
  }

  // Create Docx Document
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: fontName,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: pageWidth,
              height: pageHeight,
            },
            margin: {
              top: marginY,
              right: marginX,
              bottom: marginY,
              left: marginX,
            },
          },
        },
        children: paragraphs,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
