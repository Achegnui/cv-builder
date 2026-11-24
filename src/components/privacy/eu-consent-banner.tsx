"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export const CONSENT_STORAGE_KEY = "cv_builder_cookie_consent";

export function EUConsentBanner() {
  const [hasConsented, setHasConsented] = useState<boolean>(true); // default true to avoid flash on SSR
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!stored) {
        setHasConsented(false);
      }
    } catch {
      // localStorage may fail in restricted/incognito environments
      setHasConsented(true);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, "accepted");
    } catch {
      // Ignore storage errors
    }
    setHasConsented(true);
  };

  if (!mounted || hasConsented) {
    return null;
  }

  return (
    <aside
      aria-label="Privacy and data storage consent"
      role="region"
      className="no-print fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4 bg-neutral-900 text-white shadow-2xl border-t border-neutral-700"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex-1 pr-2">
          <p className="font-semibold text-neutral-100 flex items-center gap-1.5 mb-1">
            <span aria-hidden="true">🛡️</span> Your Privacy &amp; Data Storage
          </p>
          <p className="text-neutral-300 leading-relaxed">
            We use strictly necessary browser storage to save your CV drafts locally and maintain secure login sessions.
            We do <strong>not</strong> use tracking or advertising cookies, and we <strong>never</strong> sell or log your CV data.
            See our{" "}
            <Link
              href="/privacy"
              className="underline text-primary-300 hover:text-white font-medium focus:outline-none focus:ring-1 focus:ring-primary-400 rounded"
            >
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              href="/terms"
              className="underline text-primary-300 hover:text-white font-medium focus:outline-none focus:ring-1 focus:ring-primary-400 rounded"
            >
              Terms of Service
            </Link>
            .
          </p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={handleAccept}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-md text-xs sm:text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-primary-400"
          >
            I Understand
          </button>
        </div>
      </div>
    </aside>
  );
}
