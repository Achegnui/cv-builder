import type { ValidationRule, ValidationIssue } from "../types";
import type { CVData } from "@/lib/schema";

export const checkRepeatedContent: ValidationRule = {
  id: "repeated-content",
  name: "Repeated Content Detection",
  description: "Detects repeated text or bullets copied across different sections",
  run(cv: CVData): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Helper to clean and normalize a sentence for fuzzy/exact match
    const normalize = (str: string) =>
      str.toLowerCase().replace(/[^\w\s]/g, "").trim();

    // 1. Compare summary with all experience bullets
    const summaryText = cv.summary?.text?.trim() || "";
    if (summaryText.length > 25) {
      const summaryNormalized = normalize(summaryText);
      const summarySentences = summaryText
        .split(/[.!?]+/)
        .map((s) => normalize(s))
        .filter((s) => s.length > 25);

      cv.experience.forEach((exp, expIdx) => {
        exp.bullets.forEach((bullet, bulletIdx) => {
          const bulletNorm = normalize(bullet);
          if (bulletNorm.length > 25) {
            const isFullMatch = summaryNormalized.includes(bulletNorm) || bulletNorm.includes(summaryNormalized);
            const isSentenceMatch = summarySentences.some(
              (sentence) => sentence.includes(bulletNorm) || bulletNorm.includes(sentence)
            );

            if (isFullMatch || isSentenceMatch) {
              issues.push({
                id: `repeated-summary-exp-${exp.id}-${bulletIdx}`,
                checkId: "repeated-content",
                severity: "warning",
                location: `Work Experience (${exp.employer}): Bullet #${bulletIdx + 1}`,
                fieldId: `experience-${expIdx}-bullet-${bulletIdx}`,
                message: `This bullet repeats wording already present in your Summary.`,
                suggestedFix:
                  "Avoid verbatim repetition across sections. Use the bullet to give specific details or metrics instead of repeating the overview.",
                blockingExport: false,
              });
            }
          }
        });
      });
    }

    // 2. Check identical bullets across different experience entries
    const seenBullets = new Map<string, { employer: string; expIdx: number; bulletIdx: number }>();

    cv.experience.forEach((exp, expIdx) => {
      exp.bullets.forEach((bullet, bulletIdx) => {
        const norm = normalize(bullet);
        if (norm.length > 20) {
          if (seenBullets.has(norm)) {
            const prev = seenBullets.get(norm)!;
            issues.push({
              id: `repeated-bullet-${exp.id}-${bulletIdx}`,
              checkId: "repeated-content",
              severity: "warning",
              location: `Work Experience (${exp.employer}): Bullet #${bulletIdx + 1}`,
              fieldId: `experience-${expIdx}-bullet-${bulletIdx}`,
              message: `This bullet is identical to a bullet in "${prev.employer}".`,
              suggestedFix:
                "Tailor each bullet to the specific achievements and context of that position.",
              blockingExport: false,
            });
          } else {
            seenBullets.set(norm, { employer: exp.employer, expIdx, bulletIdx });
          }
        }
      });
    });

    return issues;
  },
};
