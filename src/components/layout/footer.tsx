import Link from "next/link";

export function Footer() {
  return (
    <footer className="no-print mt-auto border-t border-neutral-200 bg-white py-6 text-xs text-neutral-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-neutral-800">
            CV Builder
          </p>
          <p className="text-neutral-500 mt-0.5">
            Honest, verifiable, and format-tailored CVs. Zero AI hallucinations.
          </p>
        </div>

        <nav aria-label="Legal and site navigation" className="flex flex-wrap items-center gap-4 text-xs font-medium">
          <Link
            href="/"
            className="text-neutral-600 hover:text-neutral-900 transition-colors focus:outline-none focus:underline"
          >
            Builder
          </Link>
          <span className="text-neutral-300" aria-hidden="true">•</span>
          <Link
            href="/privacy"
            className="text-neutral-600 hover:text-neutral-900 transition-colors focus:outline-none focus:underline"
          >
            Privacy Policy
          </Link>
          <span className="text-neutral-300" aria-hidden="true">•</span>
          <Link
            href="/terms"
            className="text-neutral-600 hover:text-neutral-900 transition-colors focus:outline-none focus:underline"
          >
            Terms of Service
          </Link>
        </nav>
      </div>
    </footer>
  );
}
