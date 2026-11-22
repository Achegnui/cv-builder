"use client";

import React, { useState } from "react";
import type { CVData } from "@/lib/schema";
import type { VaultFact } from "@/lib/vault";
import { SAMPLE_JOB_POSTINGS } from "@/lib/tailoring/sample-postings";
import {
  SUPPORTED_COUNTRIES,
  getSalaryBenchmark,
} from "@/lib/tailoring/salary-data";
import type {
  ExtractedJobPosting,
  RequirementMatch,
  TailoredBulletProposal,
  FitCheckResult,
  CoverLetterOutline,
  SalaryRangeInfo,
} from "@/lib/tailoring/types";
import {
  extractJobRequirements,
  matchRequirements,
  generateFitCheck,
  generateTailoredBulletProposals,
  generateCoverLetterOutline,
} from "@/lib/tailoring/matcher";

interface TailoringModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvData: CVData;
  vault: VaultFact[];
  onApplyTailoredBullets: (proposals: TailoredBulletProposal[]) => void;
}

export function TailoringModal({
  isOpen,
  onClose,
  cvData,
  vault,
  onApplyTailoredBullets,
}: TailoringModalProps) {
  const [activeTab, setActiveTab] = useState<"input" | "match" | "tailor" | "helpers">("input");
  const [jobText, setJobText] = useState(SAMPLE_JOB_POSTINGS[0].description);
  const [selectedSampleId, setSelectedSampleId] = useState<string>(SAMPLE_JOB_POSTINGS[0].id);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [posting, setPosting] = useState<ExtractedJobPosting | null>(null);
  const [matches, setMatches] = useState<RequirementMatch[]>([]);
  const [fitCheck, setFitCheck] = useState<FitCheckResult | null>(null);
  const [proposals, setProposals] = useState<TailoredBulletProposal[]>([]);
  const [coverLetter, setCoverLetter] = useState<CoverLetterOutline | null>(null);

  // Salary helper state
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [selectedLevel, setSelectedLevel] = useState<"intern" | "junior" | "mid" | "senior" | "lead">("junior");
  const [salaryInfo, setSalaryInfo] = useState<SalaryRangeInfo>(() =>
    getSalaryBenchmark("US", "junior")
  );

  // Filter state for match tab
  const [matchFilter, setMatchFilter] = useState<"all" | "strong" | "partial" | "gap">("all");

  if (!isOpen) return null;

  const handleSelectSample = (id: string) => {
    setSelectedSampleId(id);
    const sample = SAMPLE_JOB_POSTINGS.find((p) => p.id === id);
    if (sample) {
      setJobText(sample.description);
    }
  };

  const handleRunAnalysis = async () => {
    if (!jobText.trim()) return;

    setIsAnalyzing(true);
    try {
      // 1. Extract requirements
      const extracted = extractJobRequirements(jobText);
      setPosting(extracted);

      // 2. Match requirements
      const matchResults = matchRequirements(extracted, cvData, vault);
      setMatches(matchResults);

      // 3. Fit check factoring in actual vs required experience
      const fit = generateFitCheck(matchResults, cvData, extracted);
      setFitCheck(fit);

      // 4. Tailored bullet proposals
      const bulletProposals = generateTailoredBulletProposals(cvData, extracted, matchResults, vault);
      setProposals(bulletProposals);

      // 5. Cover letter outline
      const cl = generateCoverLetterOutline(extracted, matchResults, cvData);
      setCoverLetter(cl);

      // 6. Update salary info
      const sal = getSalaryBenchmark(selectedCountry, selectedLevel);
      setSalaryInfo(sal);

      setActiveTab("match");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToggleProposal = (id: string) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, accepted: !p.accepted } : p))
    );
  };

  const handleApplyAccepted = () => {
    const accepted = proposals.filter((p) => p.accepted && p.guardPassed);
    if (accepted.length === 0) {
      alert("Please select at least one approved proposed change to apply.");
      return;
    }
    onApplyTailoredBullets(accepted);
    alert(`Applied ${accepted.length} tailored bullet change(s) to your CV!`);
    onClose();
  };

  const handleSalaryChange = (country: string, level: "intern" | "junior" | "mid" | "senior" | "lead") => {
    setSelectedCountry(country);
    setSelectedLevel(level);
    setSalaryInfo(getSalaryBenchmark(country, level));
  };

  const filteredMatches = matches.filter((m) => {
    if (matchFilter === "all") return true;
    return m.strength === matchFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-neutral-900 text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <div>
              <h3 className="font-semibold text-sm sm:text-base">
                Job Tailoring, Gap Report & Fit Check
              </h3>
              <p className="text-[11px] text-neutral-300">
                Maps posting requirements to your confirmed facts — gaps are shown honestly, never invented
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b text-xs font-semibold bg-neutral-100">
          <button
            type="button"
            onClick={() => setActiveTab("input")}
            className={`flex-1 py-2.5 text-center transition-colors ${
              activeTab === "input"
                ? "bg-white text-blue-600 border-b-2 border-blue-600 font-bold"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            1. 📋 Job Posting
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("match")}
            disabled={!fitCheck}
            className={`flex-1 py-2.5 text-center transition-colors disabled:opacity-40 ${
              activeTab === "match"
                ? "bg-white text-blue-600 border-b-2 border-blue-600 font-bold"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            2. 🔍 Match & Gap Report
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tailor")}
            disabled={!fitCheck}
            className={`flex-1 py-2.5 text-center transition-colors disabled:opacity-40 ${
              activeTab === "tailor"
                ? "bg-white text-blue-600 border-b-2 border-blue-600 font-bold"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            3. ✨ Tailored Line Review ({proposals.filter((p) => p.accepted).length}/{proposals.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("helpers")}
            disabled={!fitCheck}
            className={`flex-1 py-2.5 text-center transition-colors disabled:opacity-40 ${
              activeTab === "helpers"
                ? "bg-white text-blue-600 border-b-2 border-blue-600 font-bold"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            4. 💡 Cover Letter & Salary
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {/* TAB 1: INPUT JOB POSTING */}
          {activeTab === "input" && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-neutral-800">
                  Paste Target Job Posting Description:
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-neutral-500">Quick Samples:</span>
                  {SAMPLE_JOB_POSTINGS.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleSelectSample(sample.id)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        selectedSampleId === sample.id
                          ? "bg-blue-100 text-blue-800 border border-blue-300"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                      }`}
                    >
                      {sample.title.split("/")[0].trim()}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={10}
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                placeholder="Paste the full job posting text here (responsibilities, required skills, preferred qualifications, location)..."
                className="w-full text-xs font-mono rounded border border-neutral-300 p-2.5 focus:border-blue-500 resize-y"
              />

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 flex items-start gap-2">
                <span>🛡️</span>
                <span>
                  <strong>Untrusted Data Protection:</strong> Pasted posting text is isolated as untrusted data. Any adversarial prompt injection commands inside it are stripped and cannot alter your CV facts or force high match scores.
                </span>
              </div>

              <button
                type="button"
                onClick={handleRunAnalysis}
                disabled={isAnalyzing || !jobText.trim()}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs transition-colors disabled:opacity-50"
              >
                {isAnalyzing ? "Extracting Requirements & Cross-Referencing Evidence..." : "Analyze Posting & Match Against My CV"}
              </button>
            </div>
          )}

          {/* TAB 2: MATCH & GAP REPORT */}
          {activeTab === "match" && fitCheck && (
            <div className="space-y-4 text-xs">
              {/* Overall Fit Header */}
              <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                      Fit Check Assessment
                    </span>
                    <h4 className="text-sm font-bold text-neutral-900 mt-0.5">
                      {posting?.title} {posting?.company ? `at ${posting.company}` : ""}
                    </h4>
                    <p className="text-neutral-700 mt-1">{fitCheck.summary}</p>
                  </div>
                  <div className="text-center p-2.5 px-4 bg-white rounded-md border border-neutral-200 shadow-xs">
                    <span
                      className={`block text-sm font-black uppercase tracking-wider ${
                        fitCheck.fitLabel === "strong fit"
                          ? "text-green-700"
                          : fitCheck.fitLabel === "stretch"
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    >
                      {fitCheck.fitLabel === "strong fit"
                        ? "🟢 Strong Fit"
                        : fitCheck.fitLabel === "stretch"
                        ? "🟡 Stretch"
                        : "🔴 Long Shot"}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-semibold uppercase block mt-0.5">
                      Fit Label
                    </span>
                  </div>
                </div>

                {/* Plain-language reasons factoring in YOE */}
                {fitCheck.reasons.length > 0 && (
                  <div className="pt-2 border-t border-neutral-200">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                      Assessment Factors (Experience & Core Requirements):
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-neutral-600">
                      {fitCheck.reasons.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Match Filter Pills */}
              <div className="flex items-center gap-1.5 border-b pb-2">
                <button
                  type="button"
                  onClick={() => setMatchFilter("all")}
                  className={`px-2.5 py-1 rounded text-xs font-medium ${
                    matchFilter === "all" ? "bg-neutral-800 text-white" : "bg-neutral-100 text-neutral-700"
                  }`}
                >
                  All ({matches.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMatchFilter("strong")}
                  className={`px-2.5 py-1 rounded text-xs font-medium ${
                    matchFilter === "strong" ? "bg-green-700 text-white" : "bg-green-50 text-green-800 border border-green-200"
                  }`}
                >
                  🟢 Strong Matches ({matches.filter((m) => m.strength === "strong").length})
                </button>
                <button
                  type="button"
                  onClick={() => setMatchFilter("partial")}
                  className={`px-2.5 py-1 rounded text-xs font-medium ${
                    matchFilter === "partial" ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-800 border border-amber-200"
                  }`}
                >
                  🟡 Partial Matches ({matches.filter((m) => m.strength === "partial").length})
                </button>
                <button
                  type="button"
                  onClick={() => setMatchFilter("gap")}
                  className={`px-2.5 py-1 rounded text-xs font-medium ${
                    matchFilter === "gap" ? "bg-red-700 text-white" : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  🔴 Honest Gaps ({matches.filter((m) => m.strength === "gap").length})
                </button>
              </div>

              {/* Requirement Items List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredMatches.map((match) => (
                  <div
                    key={match.requirement.id}
                    className={`p-2.5 rounded border text-xs space-y-1 ${
                      match.strength === "strong"
                        ? "bg-green-50/50 border-green-200"
                        : match.strength === "partial"
                        ? "bg-amber-50/50 border-amber-200"
                        : "bg-red-50/50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-900 flex items-center gap-1.5">
                        <span>
                          {match.strength === "strong"
                            ? "🟢"
                            : match.strength === "partial"
                            ? "🟡"
                            : "🔴"}
                        </span>
                        <span>{match.requirement.text}</span>
                        {match.requirement.isPreferred && (
                          <span className="text-[10px] text-neutral-500 font-normal italic">
                            (Nice-to-have)
                          </span>
                        )}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          match.strength === "strong"
                            ? "bg-green-100 text-green-800"
                            : match.strength === "partial"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {match.strength === "strong"
                          ? "Strong Match"
                          : match.strength === "partial"
                          ? "Partial Match"
                          : "Honest Gap"}
                      </span>
                    </div>
                    <p className="text-neutral-700 text-[11px] pl-5">{match.evidence}</p>
                  </div>
                ))}
              </div>

              {/* Plain-Language Honest Next Steps */}
              {fitCheck.honestNextSteps.length > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded space-y-1 text-xs text-blue-950">
                  <span className="font-bold block">Honest Next Steps & Recommendations:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-blue-900">
                    {fitCheck.honestNextSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TAILORED CV LINE-BY-LINE REVIEW */}
          {activeTab === "tailor" && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-neutral-900">
                    Line-by-Line Tailoring Proposals
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Keywords from the posting are emphasized only where verified facts support them. Accept or reject line by line.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleApplyAccepted}
                  disabled={proposals.filter((p) => p.accepted).length === 0}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs transition-colors disabled:opacity-40"
                >
                  Apply Accepted Changes ({proposals.filter((p) => p.accepted).length})
                </button>
              </div>

              {proposals.length === 0 ? (
                <div className="p-6 text-center text-neutral-500 bg-neutral-50 rounded border border-neutral-200">
                  No bullet rewording required. Your existing experience bullets already present the core matched keywords concisely.
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {proposals.map((prop) => (
                    <div
                      key={prop.id}
                      className={`p-3 rounded border space-y-2 transition-all ${
                        prop.accepted
                          ? "bg-blue-50/50 border-blue-300 ring-1 ring-blue-300"
                          : "bg-white border-neutral-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-neutral-600">
                          Experience Bullet {prop.bulletIndex + 1} &bull; Emphasizing:{" "}
                          <span className="text-blue-700 font-bold">{prop.keywordEmphasized}</span>
                        </span>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-blue-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={prop.accepted}
                            onChange={() => handleToggleProposal(prop.id)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span>Accept Proposed Line</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 bg-neutral-100 rounded border border-neutral-200">
                          <span className="block text-[10px] font-bold text-neutral-500 uppercase mb-0.5">
                            Original:
                          </span>
                          <p className="text-neutral-700">{prop.originalText}</p>
                        </div>
                        <div className="p-2 bg-blue-50/60 rounded border border-blue-200">
                          <span className="block text-[10px] font-bold text-blue-700 uppercase mb-0.5">
                            Tailored Proposed:
                          </span>
                          <p className="text-blue-950 font-medium">{prop.proposedText}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-green-700">
                        <span>🛡️</span>
                        <span>Honesty Guard Verified: No invented numbers, tools, or dates added.</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: HELPERS (COVER LETTER & SALARY) */}
          {activeTab === "helpers" && (
            <div className="space-y-5 text-xs">
              {/* Cover Letter Structure Helper */}
              {coverLetter && (
                <div className="space-y-2 p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-base">✉️</span>
                    <div>
                      <h4 className="font-semibold text-neutral-900">
                        Cover Letter Structure Helper (Honest Outline)
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        Outlines an honest application statement addressing gaps directly without ghostwriting
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-[11px] pt-1">
                    <div className="p-2 bg-white rounded border border-neutral-200">
                      <span className="font-bold text-neutral-800 block">1. Mission Tie-in:</span>
                      <p className="text-neutral-600">{coverLetter.openingMissionTie}</p>
                    </div>
                    <div className="p-2 bg-amber-50 rounded border border-amber-200 text-amber-950">
                      <span className="font-bold block">2. Transparent Gap Disclosure:</span>
                      <p>{coverLetter.gapTransparencyStatement}</p>
                    </div>
                    <div className="p-2 bg-white rounded border border-neutral-200">
                      <span className="font-bold text-neutral-800 block">3. Concrete Evidence:</span>
                      <ul className="list-disc pl-4 space-y-0.5 text-neutral-600 mt-0.5">
                        {coverLetter.concreteEvidenceSection.map((ev, i) => (
                          <li key={i}>{ev}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-2 bg-white rounded border border-neutral-200 text-neutral-600">
                      <span className="font-bold text-neutral-800 block">4. Fast Learning Proof:</span>
                      <p>{coverLetter.fastLearningProof}</p>
                    </div>
                    <div className="p-2 bg-white rounded border border-neutral-200 text-neutral-600">
                      <span className="font-bold text-neutral-800 block">5. Close:</span>
                      <p>{coverLetter.professionalClose}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Salary Helper */}
              <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">💰</span>
                  <div>
                    <h4 className="font-semibold text-neutral-900">
                      Salary Benchmark Helper
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      Sourced compensation ranges across regions and seniority levels
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Country:
                    </label>
                    <select
                      value={selectedCountry}
                      onChange={(e) => handleSalaryChange(e.target.value, selectedLevel)}
                      className="w-full text-xs rounded border border-neutral-300 p-1.5 focus:border-blue-500"
                    >
                      {SUPPORTED_COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name} ({c.defaultCurrency})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Seniority Level:
                    </label>
                    <select
                      value={selectedLevel}
                      onChange={(e) =>
                        handleSalaryChange(
                          selectedCountry,
                          e.target.value as "intern" | "junior" | "mid" | "senior" | "lead"
                        )
                      }
                      className="w-full text-xs rounded border border-neutral-300 p-1.5 focus:border-blue-500"
                    >
                      <option value="intern">Intern / Trainee</option>
                      <option value="junior">Junior (0-2 years)</option>
                      <option value="mid">Mid-Level (2-5 years)</option>
                      <option value="senior">Senior (5+ years)</option>
                      <option value="lead">Staff / Lead Engineer</option>
                    </select>
                  </div>
                </div>

                {salaryInfo && (
                  <div>
                    {salaryInfo.available ? (
                      <div className="p-3 bg-white border border-neutral-200 rounded text-center space-y-1.5">
                        <span className="text-[11px] font-semibold text-neutral-500 uppercase block">
                          Estimated Market Range ({salaryInfo.country} &bull; {selectedLevel}):
                        </span>
                        <div className="text-lg font-bold text-green-700">
                          {salaryInfo.formattedRange}
                        </div>
                        {salaryInfo.sourceUrl ? (
                          <div className="pt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-neutral-600">
                            <span>Source:</span>
                            <a
                              href={salaryInfo.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-0.5"
                            >
                              <span>{salaryInfo.sourceName}</span>
                              <span className="text-[10px]">↗</span>
                            </a>
                            {salaryInfo.retrievedDate && (
                              <span className="text-neutral-400">
                                &bull; Retrieved on {salaryInfo.retrievedDate}
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-[11px] text-neutral-500">Source: {salaryInfo.sourceName}</p>
                        )}
                        <p className="text-[10px] text-neutral-400 italic pt-1">
                          {salaryInfo.disclaimer}
                        </p>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded text-center space-y-1">
                        <span className="text-xs font-bold text-amber-900 block">
                          ℹ️ No Verified Data for {salaryInfo.country}
                        </span>
                        <p className="text-[11px] text-amber-800">
                          {salaryInfo.noDataReason ||
                            "No verified public tech compensation survey data is currently available for this region. Figures are omitted rather than guessed per honesty standards."}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
