import React from "react";
import type { TemplateProps } from "./types";
import type { SectionKey } from "@/lib/regions";

export function SingleColumnTemplate({ data, style, regionProfile, userOverrides }: TemplateProps) {
  const { profile, summary, experience, education, skillGroups, projects, certifications, awards, languages, publications, grants, teaching, conferences } = data;
  const isBlackOnly = style.colorMode === "black";
  const isCompact = style.spacing === "compact";

  // Heading color: strictly black if black-only mode, otherwise accent color
  const headingColor = isBlackOnly ? "#000000" : style.accentColor;
  const dividerColor = isBlackOnly ? "#000000" : style.accentColor;

  // Font family styles
  const fontStyle =
    style.fontFamily === "serif"
      ? "font-serif"
      : style.fontFamily === "mono"
      ? "font-mono"
      : "font-sans";

  // Spacing configurations
  const sectionSpacing = isCompact ? "mb-4" : "mb-6";
  const itemSpacing = isCompact ? "space-y-2" : "space-y-3.5";
  const bulletSpacing = isCompact ? "space-y-0.5" : "space-y-1";
  const baseTextSize = isCompact ? "text-[13px] leading-relaxed" : "text-sm leading-normal";

  // Regional toggles & personal detail rules
  const showPhoto = userOverrides?.showPhoto ?? (regionProfile?.photoConvention === "commonly_expected");
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

  const renderSectionHeader = (title: string) => (
    <h2
      className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2"
      style={{ color: headingColor, borderColor: dividerColor }}
    >
      {title}
    </h2>
  );

  const renderSummary = () => {
    if (!summary.text) return null;
    return (
      <section key="summary" className={sectionSpacing}>
        {renderSectionHeader(labels.summary)}
        <p className="text-neutral-700 whitespace-pre-line">{summary.text}</p>
      </section>
    );
  };

  const renderSkills = () => {
    if (!skillGroups || skillGroups.length === 0) return null;
    return (
      <section key="skills" className={sectionSpacing}>
        {renderSectionHeader(labels.skills)}
        <div className="space-y-1.5">
          {skillGroups.map((group) => (
            <div key={group.id} className="text-neutral-800">
              <span className="font-semibold text-neutral-900">{group.category}: </span>
              <span>{group.skills.filter(Boolean).join(", ")}</span>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderExperience = () => {
    if (!experience || experience.length === 0) return null;
    return (
      <section key="experience" className={sectionSpacing}>
        {renderSectionHeader(labels.experience)}
        <div className={itemSpacing}>
          {experience.map((exp) => (
            <div key={exp.id} className="break-inside-avoid">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                <h3 className="font-semibold text-neutral-900">
                  {exp.title}
                  {exp.employer && <span className="font-normal text-neutral-700"> — {exp.employer}</span>}
                </h3>
                <span className="text-xs text-neutral-500 font-medium">
                  {exp.startDate} {exp.startDate && "–"} {exp.isCurrent ? "Present" : exp.endDate}
                </span>
              </div>
              {exp.location && (
                <div className="text-xs text-neutral-500 mb-1">{exp.location}</div>
              )}
              {exp.bullets.length > 0 && (
                <ul className={`list-disc pl-5 text-neutral-700 ${bulletSpacing} mt-1`}>
                  {exp.bullets.filter(Boolean).map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderEducation = () => {
    if (!education || education.length === 0) return null;
    return (
      <section key="education" className={sectionSpacing}>
        {renderSectionHeader(labels.education)}
        <div className={itemSpacing}>
          {education.map((edu) => (
            <div key={edu.id} className="break-inside-avoid">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                <h3 className="font-semibold text-neutral-900">
                  {edu.degree}
                  {edu.field && <span> in {edu.field}</span>}
                  {edu.institution && <span className="font-normal text-neutral-700"> — {edu.institution}</span>}
                </h3>
                <span className="text-xs text-neutral-500 font-medium">
                  {edu.startDate} {edu.startDate && "–"} {edu.isExpected ? `Expected ${edu.endDate}` : edu.endDate}
                </span>
              </div>
              {(edu.gpa || edu.degreeClassification) && (
                <div className="text-xs text-neutral-600 space-x-3 mt-0.5">
                  {edu.gpa && <span>GPA: {edu.gpa}</span>}
                  {edu.degreeClassification && <span>Classification: {edu.degreeClassification}</span>}
                </div>
              )}
              {edu.bullets && edu.bullets.length > 0 && (
                <ul className={`list-disc pl-5 text-neutral-700 ${bulletSpacing} mt-1`}>
                  {edu.bullets.filter(Boolean).map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderProjects = () => {
    if (!projects || projects.length === 0) return null;
    return (
      <section key="projects" className={sectionSpacing}>
        {renderSectionHeader(labels.projects)}
        <div className={itemSpacing}>
          {projects.map((proj) => (
            <div key={proj.id} className="break-inside-avoid">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                <h3 className="font-semibold text-neutral-900">
                  {proj.name}
                  {proj.techStack && proj.techStack.length > 0 && (
                    <span className="font-normal text-xs text-neutral-500">
                      {" "}({proj.techStack.filter(Boolean).join(", ")})
                    </span>
                  )}
                </h3>
                {(proj.startDate || proj.endDate) && (
                  <span className="text-xs text-neutral-500 font-medium">
                    {proj.startDate} {proj.startDate && proj.endDate && "–"} {proj.endDate}
                  </span>
                )}
              </div>
              {proj.description && (
                <p className="text-neutral-700 mt-0.5">{proj.description}</p>
              )}
              {proj.links && proj.links.length > 0 && (
                <div className="flex flex-wrap gap-x-3 text-xs mt-1">
                  {proj.links.filter(Boolean).map((link, idx) => (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-700 hover:underline"
                      style={{ color: isBlackOnly ? "#000000" : undefined }}
                    >
                      {link.replace(/^https?:\/\//, "")}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderCertifications = () => {
    if (!certifications || certifications.length === 0) return null;
    return (
      <section key="certifications" className={sectionSpacing}>
        {renderSectionHeader(labels.certifications)}
        <div className="space-y-1.5">
          {certifications.map((cert) => (
            <div key={cert.id} className="flex flex-wrap items-baseline justify-between gap-x-2 text-neutral-800">
              <span>
                <strong className="font-semibold text-neutral-900">{cert.name}</strong>
                {cert.issuer && <span> — {cert.issuer}</span>}
                {cert.credentialId && <span className="text-xs text-neutral-500"> (ID: {cert.credentialId})</span>}
              </span>
              {cert.date && <span className="text-xs text-neutral-500">{cert.date}</span>}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderAwards = () => {
    if (!awards || awards.length === 0) return null;
    return (
      <section key="awards" className={sectionSpacing}>
        {renderSectionHeader(labels.awards)}
        <div className="space-y-1.5">
          {awards.map((award) => (
            <div key={award.id} className="text-neutral-800">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                <span>
                  <strong className="font-semibold text-neutral-900">{award.title}</strong>
                  {award.issuer && <span> — {award.issuer}</span>}
                </span>
                {award.date && <span className="text-xs text-neutral-500">{award.date}</span>}
              </div>
              {award.description && <p className="text-xs text-neutral-600 mt-0.5">{award.description}</p>}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderLanguages = () => {
    if (!languages || languages.length === 0) return null;
    return (
      <section key="languages" className={sectionSpacing}>
        {renderSectionHeader(labels.languages)}
        <p className="text-neutral-800">
          {languages
            .map((lang) => `${lang.language} (${lang.proficiency})`)
            .join(" • ")}
        </p>
      </section>
    );
  };

  const renderPublications = () => {
    if (!publications || publications.length === 0) return null;
    return (
      <section key="publications" className={sectionSpacing}>
        {renderSectionHeader(labels.publications)}
        <div className="space-y-2">
          {publications.map((pub) => (
            <div key={pub.id} className="text-neutral-800">
              <p>
                <span className="font-semibold">{pub.title}</span>. {pub.authors && <span>{pub.authors}. </span>}
                {pub.venue && <em className="italic">{pub.venue}</em>}
                {pub.date && <span> ({pub.date})</span>}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderGrants = () => {
    if (!grants || grants.length === 0) return null;
    return (
      <section key="grants" className={sectionSpacing}>
        {renderSectionHeader(labels.grants)}
        <div className="space-y-1.5">
          {grants.map((grant) => (
            <div key={grant.id} className="flex justify-between items-baseline text-neutral-800">
              <span>
                <strong className="font-semibold">{grant.title}</strong> — {grant.funder}
                {grant.amount && <span> ({grant.currency || "$"} {grant.amount})</span>}
              </span>
              {grant.startDate && <span className="text-xs text-neutral-500">{grant.startDate}</span>}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderTeaching = () => {
    if (!teaching || teaching.length === 0) return null;
    return (
      <section key="teaching" className={sectionSpacing}>
        {renderSectionHeader(labels.teaching)}
        <div className="space-y-1.5">
          {teaching.map((teach) => (
            <div key={teach.id} className="text-neutral-800">
              <div className="flex justify-between items-baseline">
                <span>
                  <strong className="font-semibold">{teach.role}</strong> — {teach.course} ({teach.institution})
                </span>
                {teach.startDate && <span className="text-xs text-neutral-500">{teach.startDate} – {teach.endDate}</span>}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderConferences = () => {
    if (!conferences || conferences.length === 0) return null;
    return (
      <section key="conferences" className={sectionSpacing}>
        {renderSectionHeader(labels.conferences)}
        <div className="space-y-1.5">
          {conferences.map((conf) => (
            <div key={conf.id} className="flex justify-between items-baseline text-neutral-800">
              <span>
                <strong className="font-semibold">{conf.title}</strong> — {conf.event} ({conf.role})
              </span>
              {conf.date && <span className="text-xs text-neutral-500">{conf.date}</span>}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const sectionMap: Record<SectionKey, () => React.ReactNode> = {
    summary: renderSummary,
    experience: renderExperience,
    education: renderEducation,
    skills: renderSkills,
    projects: renderProjects,
    certifications: renderCertifications,
    awards: renderAwards,
    languages: renderLanguages,
    publications: renderPublications,
    grants: renderGrants,
    teaching: renderTeaching,
    conferences: renderConferences,
  };

  return (
    <article
      className={`cv-page w-full bg-white text-neutral-900 ${fontStyle} ${baseTextSize} p-8 sm:p-12 print:p-0 print:shadow-none print:m-0`}
      style={{
        color: "#171717",
      }}
    >
      {/* ----------------- Header / Profile ----------------- */}
      <header className={`border-b pb-4 ${isCompact ? "mb-4" : "mb-6"}`} style={{ borderColor: dividerColor }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ color: headingColor }}
            >
              {profile.fullName || "Your Full Name"}
            </h1>

            {/* Contact items row */}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-600">
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="hover:underline">
                  {profile.email}
                </a>
              )}
              {profile.phone && <span>{profile.phone}</span>}
              {profile.location && <span>{profile.location}</span>}
              {profile.linkedIn && (
                <a href={profile.linkedIn} target="_blank" rel="noreferrer" className="hover:underline">
                  LinkedIn
                </a>
              )}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noreferrer" className="hover:underline">
                  Portfolio
                </a>
              )}
              {showNat && profile.nationality && <span>Nationality: {profile.nationality}</span>}
              {showDob && profile.dateOfBirth && <span>Born: {profile.dateOfBirth}</span>}
            </div>
          </div>

          {/* Optional Profile Photo (used in German/Europass or when toggled) */}
          {showPhoto && profile.photoUrl && (
            <div className="w-16 h-20 sm:w-20 sm:h-24 overflow-hidden rounded border border-neutral-300 flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.photoUrl}
                alt={profile.fullName || "Applicant photo"}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </header>

      {/* Dynamic Sections in Region-Specified Order */}
      {sectionOrder.map((sectionKey) => {
        const renderer = sectionMap[sectionKey];
        return renderer ? renderer() : null;
      })}
    </article>
  );
}
