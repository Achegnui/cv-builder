import type { ValidationRule, ValidationIssue } from "../types";
import type { CVData } from "@/lib/schema";

/**
 * Detects unfinished placeholders such as:
 * - [add number]
 * - [insert metric]
 * - [TBD], [TODO], TODO
 * - <insert role>
 * - [company name], [project], XYZ
 *
 * Per AGENTS.md rule 3: "Placeholders block export. Text like [add number] must be resolved or removed before export."
 */
export const checkPlaceholders: ValidationRule = {
  id: "placeholders",
  name: "Unfinished Placeholders",
  description: "Detects unfinished placeholder text (e.g. [add number]) which blocks document export",
  run(cv: CVData): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Comprehensive placeholder regex: matches square brackets, angle brackets, or standalone TODO/XYZ tokens
    const placeholderRegex = /(\[(?:add|insert|fill|replace|update|tbd|todo)[^\]]*\]|\[[^\]]*(?:number|metric|company|role|title|date|name)[^\]]*\]|\bTODO\b|\bTBD\b|<(?:insert|add)[^>]*>|\bXYZ\b)/i;

    const testText = (text: string, location: string, fieldId: string, idSuffix: string) => {
      if (!text) return;
      const match = text.match(placeholderRegex);
      if (match) {
        issues.push({
          id: `placeholder-${idSuffix}`,
          checkId: "placeholders",
          severity: "error",
          location,
          fieldId,
          message: `Unfinished placeholder "${match[0]}" found. Placeholders must be resolved before exporting.`,
          suggestedFix: `Replace "${match[0]}" with your verified information, or remove the placeholder.`,
          blockingExport: true,
        });
      }
    };

    // 1. Profile fields
    testText(cv.profile.fullName, "Profile: Full Name", "profile-fullName", "profile-name");
    testText(cv.profile.email, "Profile: Email", "profile-email", "profile-email");
    testText(cv.profile.location, "Profile: Location", "profile-location", "profile-location");

    // 2. Summary
    testText(cv.summary.text, "Professional Summary", "summary-text", "summary");

    // 3. Experience
    cv.experience.forEach((exp, expIdx) => {
      testText(exp.employer, `Work Experience: Employer #${expIdx + 1}`, `experience-${expIdx}-employer`, `exp-emp-${exp.id}`);
      testText(exp.title, `Work Experience (${exp.employer}): Job Title`, `experience-${expIdx}-title`, `exp-title-${exp.id}`);
      exp.bullets.forEach((bullet, bulletIdx) => {
        testText(
          bullet,
          `Work Experience (${exp.employer}): Bullet #${bulletIdx + 1}`,
          `experience-${expIdx}-bullet-${bulletIdx}`,
          `exp-bullet-${exp.id}-${bulletIdx}`
        );
      });
    });

    // 4. Education
    cv.education.forEach((edu, eduIdx) => {
      testText(edu.institution, `Education: Institution #${eduIdx + 1}`, `education-${eduIdx}-institution`, `edu-inst-${edu.id}`);
      testText(edu.degree, `Education (${edu.institution}): Degree`, `education-${eduIdx}-degree`, `edu-deg-${edu.id}`);
      edu.bullets.forEach((bullet, bulletIdx) => {
        testText(
          bullet,
          `Education (${edu.institution}): Bullet #${bulletIdx + 1}`,
          `education-${eduIdx}-bullet-${bulletIdx}`,
          `edu-bullet-${edu.id}-${bulletIdx}`
        );
      });
    });

    // 5. Projects
    cv.projects.forEach((proj, projIdx) => {
      testText(proj.name, `Projects: Project #${projIdx + 1}`, `project-${projIdx}-name`, `proj-name-${proj.id}`);
      testText(proj.description, `Projects (${proj.name}): Description`, `project-${projIdx}-desc`, `proj-desc-${proj.id}`);
    });

    // 6. Awards
    cv.awards.forEach((award, awardIdx) => {
      testText(award.title, `Awards: Award #${awardIdx + 1}`, `award-${awardIdx}-title`, `award-title-${award.id}`);
      testText(award.description, `Awards (${award.title}): Description`, `award-${awardIdx}-desc`, `award-desc-${award.id}`);
    });

    return issues;
  },
};
