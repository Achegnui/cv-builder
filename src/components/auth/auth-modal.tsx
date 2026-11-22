"use client";

import React, { useState } from "react";
import { useAuth } from "./auth-context";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
}

export function AuthModal({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || "Failed to log in");
        } else {
          onClose();
        }
      } else {
        const res = await signup(email, password);
        if (!res.success) {
          setError(res.error || "Failed to create account");
        } else {
          onClose();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">
              {mode === "login" ? "Sign In to Your Account" : "Create Free Account"}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Save multiple CV versions and switch between targets effortlessly.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 rounded-md p-1 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Perks banner */}
        <div className="bg-amber-50/60 border-b border-amber-100 px-6 py-2.5 text-xs text-amber-900 flex items-center gap-2">
          <span>✨</span>
          <span>
            <strong>Free Builder Promise:</strong> You can always build, edit, and export for free without an account. Accounts add cloud saving and multiple versions.
          </span>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-neutral-200 bg-neutral-50">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
              mode === "login"
                ? "bg-white text-neutral-900 border-b-2 border-neutral-900"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
              mode === "signup"
                ? "bg-white text-neutral-900 border-b-2 border-neutral-900"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            Create Free Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Password {mode === "signup" && <span className="font-normal text-neutral-500">(minimum 8 characters)</span>}
            </label>
            <input
              type="password"
              required
              minLength={mode === "signup" ? 8 : 1}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm rounded-md shadow-sm transition-colors disabled:opacity-50"
          >
            {isSubmitting
              ? "Processing..."
              : mode === "login"
              ? "Sign In"
              : "Create Free Account"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError(null);
              }}
              className="text-xs text-neutral-600 hover:text-neutral-900 underline"
            >
              {mode === "login"
                ? "Don't have an account? Sign up free"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
