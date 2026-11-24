import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | CV Builder",
  description:
    "Plain-language Terms of Service: honest use pledge, no employment guarantees, payment terms, and content ownership.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-xs sm:text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            ← Back to CV Builder
          </Link>
        </div>

        {/* Header */}
        <header className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-600 mb-2">
            <span>📜 Clear &amp; Fair Terms</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-3">
            Terms of Service (Draft)
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
            Welcome to CV Builder. These terms set out the rules for using our platform. We have written them in plain, direct language rather than dense legalese.
          </p>
          <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-wrap items-center gap-4 text-xs text-neutral-500">
            <span><strong>Effective Date:</strong> November 24, 2026</span>
            <span>•</span>
            <span><strong>Draft Status:</strong> Phase 8c Candidate</span>
            <span>•</span>
            <span><strong>Owner:</strong> Student Developer Project</span>
          </div>
        </header>

        {/* Terms Sections */}
        <div className="space-y-6">
          {/* Section 1 */}
          <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-3">
              1. Educational Purpose &amp; No Guarantee of Employment
            </h2>
            <div className="space-y-3 text-sm text-neutral-700 leading-relaxed">
              <p>
                CV Builder is a formatting, validation, and career document preparation tool. Our CV Doctor checks, regional style recommendations, salary reference benchmarks, and AI suggestions are <strong>educational decision-support aids</strong>.
              </p>
              <p>
                <strong>We do not guarantee:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-neutral-700 text-xs sm:text-sm">
                <li>That using this app will result in job offers, interviews, or hiring callbacks.</li>
                <li>That any specific employer, university, or scholarship committee will accept or approve your CV format.</li>
                <li>That salary benchmarks reflect an offer a particular employer is guaranteed to extend.</li>
              </ul>
              <p>
                Hiring decisions remain entirely at the discretion of prospective employers and institutions.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-3">
              2. Honest Use &amp; Anti-Fraud Policy
            </h2>
            <div className="space-y-3 text-sm text-neutral-700 leading-relaxed">
              <p>
                Our platform is founded on factual integrity. Our AI features and Evidence Vault are strictly engineered never to invent facts, forge credentials, or inflate work history.
              </p>
              <p>
                By using CV Builder, you agree that:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-neutral-700 text-xs sm:text-sm">
                <li>You will provide accurate, truthful personal and professional information.</li>
                <li>You will not use this platform to forge educational degrees, certifications, employer references, or government credentials.</li>
                <li>You will not attempt to bypass security boundaries, forge webhook receipts, tamper with payment status, or reverse-engineer API endpoints.</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-3">
              3. Ownership of Content &amp; Intellectual Property
            </h2>
            <div className="space-y-3 text-sm text-neutral-700 leading-relaxed">
              <p>
                <strong>Your Content Belongs to You:</strong> You retain 100% ownership and copyright of all CV text, work descriptions, portfolio links, and Evidence Vault entries you enter into the application.
              </p>
              <p>
                <strong>Our Software &amp; Templates:</strong> We and our licensors retain all ownership, intellectual property rights, and code copyright for the CV Builder web application, user interface, validation algorithms, styling engines, and export generators.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-3">
              4. Payments, Pricing &amp; No Auto-Renewal
            </h2>
            <div className="space-y-3 text-sm text-neutral-700 leading-relaxed">
              <p>
                We believe in straightforward, honest monetization without hidden traps:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2 text-neutral-700 text-xs sm:text-sm">
                <li>
                  <strong>One-Time Payments Only:</strong> All purchases (Single Export Pass or Lifetime Pass) are one-time transactions. We do <strong>not</strong> operate recurring auto-renewing subscriptions, hidden trials, or automatic credit card renewals.
                </li>
                <li>
                  <strong>Transparent Currency Display:</strong> Prices are displayed upfront before you enter payment details (in USD, XAF, EUR, or GBP).
                </li>
                <li>
                  <strong>Accepted Payment Methods:</strong> Transactions are handled securely via Flutterwave, supporting Mobile Money (Cameroon MTN &amp; Orange MoMo, regional networks) and Visa/Mastercard debit and credit cards.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-3">
              5. Refund &amp; Technical Credit Policy
            </h2>
            <div className="space-y-3 text-sm text-neutral-700 leading-relaxed">
              <p>
                Because digital exports are delivered immediately upon payment, all sales are generally final once a clean export is generated. However:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-neutral-700 text-xs sm:text-sm">
                <li>
                  <strong>Export Delivery Failure:</strong> If a technical bug, server error, or formatting crash prevents you from downloading your document after payment, we will re-issue your export credit or process a full refund.
                </li>
                <li>
                  <strong>Refund Requests:</strong> Contact <code className="bg-neutral-100 px-1 py-0.5 rounded">support@cvbuilder.local</code> within 7 days of purchase with your Flutterwave transaction reference number.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 6: Legal & Flutterwave Review Callouts */}
          <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2">
              6. Legal Review &amp; Payment Gateway Compliance Flags
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mb-4">
              The following clauses must be reviewed and customized with qualified legal counsel and Flutterwave onboarding representatives before production commercial deployment:
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-yellow-50 border-l-4 border-yellow-500 text-yellow-900 text-xs sm:text-sm space-y-2">
                <div className="font-bold uppercase tracking-wide text-xs">
                  ⚠️ [LEGAL REVIEW NEEDED: LIMITATION OF LIABILITY &amp; GOVERNING LAW]
                </div>
                <p>
                  To the maximum extent permitted by applicable law, CV Builder and its developers shall not be liable for any indirect, incidental, or consequential damages resulting from employment rejections, missed application deadlines, or AI-generated phrasing.
                </p>
                <p className="text-xs italic text-yellow-800">
                  Note: A legal counsel must define the exact governing jurisdiction (e.g., Republic of Cameroon or chosen operating territory) and formal dispute arbitration venue.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 border-l-4 border-blue-500 text-blue-900 text-xs sm:text-sm space-y-2">
                <div className="font-bold uppercase tracking-wide text-xs">
                  💳 [FLUTTERWAVE COMPLIANCE NOTE: MERCHANT IDENTIFICATION &amp; CHARGEBACK RULES]
                </div>
                <p>
                  To comply with Flutterwave's Merchant Acceptable Use Policy and card association regulations (Visa/Mastercard):
                </p>
                <ul className="list-disc list-inside text-xs space-y-1 pl-2">
                  <li><strong>Merchant Entity:</strong> Insert official legal registration number and physical company address.</li>
                  <li><strong>Currency Disclosure:</strong> Explicit statement on who absorbs foreign exchange rates and bank conversion fees when charging in foreign currencies.</li>
                  <li><strong>Chargeback Timeline:</strong> Customers agree to contact our support desk first before initiating a bank chargeback, allowing a standard 5-to-7 business day inquiry window.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2">
              7. Changes to These Terms
            </h2>
            <p className="text-sm text-neutral-700 leading-relaxed">
              We may update these terms as our features expand (for example, adding international scholarship templates or multi-language features). Any material changes will be noted on this page with an updated revision date.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
