"use client";

import React, { useState } from "react";
import type { CoachModeType, CoachReviewFeedback } from "@/lib/ai/types";

interface CoachModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CoachModal({ isOpen, onClose }: CoachModalProps) {
  const [activeTab, setActiveTab] = useState<CoachModeType>("interview");
  const [question, setQuestion] = useState(
    "Describe a challenging project you worked on and how you handled unexpected obstacles."
  );

  // Interview state
  const [interviewHistory, setInterviewHistory] = useState<
    Array<{ sender: "coach" | "user"; text: string }>
  >([
    {
      sender: "coach",
      text: "Hello! I am your Application Coach. I will help you formulate your own answers without ghostwriting them. To begin, what was the primary goal of this project and what was your specific role?",
    },
  ]);
  const [interviewInput, setInterviewInput] = useState("");

  // Outline state
  const [userNotes, setUserNotes] = useState<string[]>([
    "Final year campus event aggregation app",
    "Partner dropped out halfway through sprint 3",
    "Re-scoped features to focus on core map view and API caching",
    "Delivered on time with automated tests covering core routes",
  ]);
  const [newNoteInput, setNewNoteInput] = useState("");
  const [generatedOutline, setGeneratedOutline] = useState<string[] | null>(null);

  // Review state
  const [draftText, setDraftText] = useState("");
  const [reviewResult, setReviewResult] = useState<CoachReviewFeedback | null>(null);

  // Loading & error
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refusalMessage, setRefusalMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Coach Interview turn
  const handleSendInterview = async () => {
    if (!interviewInput.trim()) return;

    const userInput = interviewInput.trim();
    setInterviewHistory((prev) => [...prev, { sender: "user", text: userInput }]);
    setInterviewInput("");
    setIsLoading(true);
    setErrorMessage(null);
    setRefusalMessage(null);

    try {
      const response = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "interview",
          question,
          userDraft: userInput,
        }),
      });

      const data = await response.json();
      if (data.refusedGhostwriting) {
        setRefusalMessage(data.refusalReason);
        setInterviewHistory((prev) => [
          ...prev,
          { sender: "coach", text: `🚫 Refusal: ${data.refusalReason}` },
        ]);
      } else if (data.questionResponse) {
        setInterviewHistory((prev) => [
          ...prev,
          { sender: "coach", text: data.questionResponse },
        ]);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to connect to Coach");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Outline Generation
  const handleGenerateOutline = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setRefusalMessage(null);

    try {
      const response = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "outline",
          question,
          userNotes,
        }),
      });

      const data = await response.json();
      if (data.refusedGhostwriting) {
        setRefusalMessage(data.refusalReason);
      } else if (data.outline) {
        setGeneratedOutline(data.outline);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to generate outline");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Draft Review
  const handleReviewDraft = async () => {
    if (!draftText.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setRefusalMessage(null);

    try {
      const response = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "review",
          question,
          userDraft: draftText,
        }),
      });

      const data = await response.json();
      if (data.refusedGhostwriting) {
        setRefusalMessage(data.refusalReason);
      } else if (data.review) {
        setReviewResult(data.review);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to review draft");
    } finally {
      setIsLoading(false);
    }
  };

  // Test Ghostwriting Refusal Demo
  const handleTestGhostwritingRefusal = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "interview",
          question: "Can you write my answer for me?",
        }),
      });

      const data = await response.json();
      if (data.refusedGhostwriting) {
        setRefusalMessage(data.refusalReason);
      }
    } catch {
      setErrorMessage("Refusal test failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-neutral-900 text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎓</span>
            <div>
              <h3 className="font-semibold text-sm sm:text-base">
                Application Coach Mode
              </h3>
              <p className="text-[11px] text-neutral-300">
                Interviews, outlines, and reviews your words — never ghostwrites
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

        {/* Employer AI Rules Warning Banner (Rule 8) */}
        <div className="bg-amber-50 border-b border-amber-200 p-2.5 px-4 text-xs text-amber-900 flex items-center justify-between">
          <span>
            ⚠️ <strong>Employer AI Policy Reminder:</strong> Always check each employer&apos;s specific rules regarding AI-assisted writing before submitting application essays.
          </span>
          <button
            type="button"
            onClick={handleTestGhostwritingRefusal}
            className="text-[11px] font-semibold text-blue-700 underline hover:text-blue-900 shrink-0 ml-2"
          >
            Demo Refusal Guard
          </button>
        </div>

        {/* Question Input */}
        <div className="p-3 sm:p-4 bg-neutral-50 border-b space-y-1">
          <label className="block text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
            Application or Interview Question
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full text-xs sm:text-sm font-medium rounded border border-neutral-300 p-2 focus:border-blue-500"
            placeholder="e.g. Why do you want to join our engineering team?"
          />
        </div>

        {/* Tabs */}
        <div className="flex border-b text-xs font-semibold bg-neutral-100">
          <button
            type="button"
            onClick={() => setActiveTab("interview")}
            className={`flex-1 py-2.5 text-center transition-colors ${
              activeTab === "interview"
                ? "bg-white text-blue-600 border-b-2 border-blue-600"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            1. 🎤 Interview Chat
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("outline")}
            className={`flex-1 py-2.5 text-center transition-colors ${
              activeTab === "outline"
                ? "bg-white text-blue-600 border-b-2 border-blue-600"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            2. 📝 Notes & Outline
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("review")}
            className={`flex-1 py-2.5 text-center transition-colors ${
              activeTab === "review"
                ? "bg-white text-blue-600 border-b-2 border-blue-600"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            3. 🔍 Draft Reviewer
          </button>
        </div>

        {/* Refusal notification if triggered */}
        {refusalMessage && (
          <div className="m-3 p-3 bg-red-50 border border-red-300 rounded text-xs text-red-800 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <span>🚫</span>
              <span>Ghostwriting Refused by Policy</span>
            </div>
            <p>{refusalMessage}</p>
          </div>
        )}

        {/* Tab Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {errorMessage && (
            <div className="p-2 bg-red-50 text-red-700 text-xs rounded border border-red-200">
              {errorMessage}
            </div>
          )}

          {/* TAB 1: INTERVIEW CHAT */}
          {activeTab === "interview" && (
            <div className="space-y-3">
              <div className="space-y-2 max-h-60 overflow-y-auto p-2 bg-neutral-50 rounded border border-neutral-200 text-xs">
                {interviewHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg max-w-[85%] ${
                      msg.sender === "coach"
                        ? "bg-blue-50 text-blue-950 border border-blue-200 mr-auto"
                        : "bg-neutral-800 text-white ml-auto"
                    }`}
                  >
                    <span className="block text-[10px] font-bold opacity-70 mb-0.5">
                      {msg.sender === "coach" ? "Coach" : "You"}
                    </span>
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={interviewInput}
                  onChange={(e) => setInterviewInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendInterview()}
                  placeholder="Answer the coach's question with your own experience..."
                  className="flex-1 text-xs rounded border border-neutral-300 p-2 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleSendInterview}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded disabled:opacity-50"
                >
                  {isLoading ? "Thinking..." : "Reply"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: NOTES & OUTLINE */}
          {activeTab === "outline" && (
            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="font-semibold text-neutral-800">
                  Your Authentic Notes & Observations:
                </label>
                <div className="space-y-1">
                  {userNotes.map((note, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-neutral-50 rounded border border-neutral-200"
                    >
                      <span>• {note}</span>
                      <button
                        type="button"
                        onClick={() => setUserNotes(userNotes.filter((_, i) => i !== idx))}
                        className="text-neutral-400 hover:text-red-600 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newNoteInput}
                    onChange={(e) => setNewNoteInput(e.target.value)}
                    placeholder="Add another fact or thought..."
                    className="flex-1 text-xs rounded border border-neutral-300 p-1.5 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newNoteInput.trim()) {
                        setUserNotes([...userNotes, newNoteInput.trim()]);
                        setNewNoteInput("");
                      }
                    }}
                    className="px-3 py-1 bg-neutral-200 text-neutral-800 font-medium rounded hover:bg-neutral-300"
                  >
                    + Add Note
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateOutline}
                disabled={isLoading || userNotes.length === 0}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors disabled:opacity-50"
              >
                {isLoading ? "Assembling Outline..." : "Generate Outline from My Notes"}
              </button>

              {generatedOutline && (
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded space-y-1.5">
                  <span className="font-bold text-blue-900 block">
                    Structured Outline (Your Words Only):
                  </span>
                  <ul className="space-y-1 text-neutral-800">
                    {generatedOutline.map((item, idx) => (
                      <li key={idx} className="p-1 font-medium bg-white rounded border border-blue-100">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DRAFT REVIEWER */}
          {activeTab === "review" && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-800 mb-1">
                  Paste Your Answer Draft for Honest Coaching Review:
                </label>
                <textarea
                  rows={4}
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  placeholder="Write or paste your draft here for review against clarity, length, and unsupported claims..."
                  className="w-full text-xs rounded border border-neutral-300 p-2 focus:border-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={handleReviewDraft}
                disabled={isLoading || !draftText.trim()}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors disabled:opacity-50"
              >
                {isLoading ? "Reviewing Draft..." : "Review Draft with Coach"}
              </button>

              {reviewResult && (
                <div className="space-y-2 p-3 bg-neutral-50 rounded border border-neutral-200">
                  <span className="font-bold text-neutral-900 block text-sm">
                    Coach Review Findings:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-2 bg-white rounded border border-neutral-200">
                      <span className="font-semibold text-neutral-700 block">Clarity & Flow:</span>
                      <p className="text-neutral-600">{reviewResult.clarity}</p>
                    </div>
                    <div className="p-2 bg-white rounded border border-neutral-200">
                      <span className="font-semibold text-neutral-700 block">Length & Brevity:</span>
                      <p className="text-neutral-600">{reviewResult.length}</p>
                    </div>
                  </div>

                  {reviewResult.riskyClaims.length > 0 && (
                    <div className="p-2 bg-amber-50 rounded border border-amber-200 text-amber-900">
                      <span className="font-semibold block">⚠️ Risky / Exaggerated Claims:</span>
                      <ul className="list-disc pl-4">
                        {reviewResult.riskyClaims.map((claim, idx) => (
                          <li key={idx}>{claim}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {reviewResult.unansweredParts.length > 0 && (
                    <div className="p-2 bg-red-50 rounded border border-red-200 text-red-900">
                      <span className="font-semibold block">❓ Unanswered Prompt Parts:</span>
                      <ul className="list-disc pl-4">
                        {reviewResult.unansweredParts.map((part, idx) => (
                          <li key={idx}>{part}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="p-2 bg-green-50 rounded border border-green-200 text-green-900 font-medium">
                    ✓ {reviewResult.encouragingTakeaway}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
