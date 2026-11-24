import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | CV Builder",
  description:
    "Plain-language privacy policy: what we store, our zero-logging policy, AI usage terms, and how to permanently delete your data.",
};

export default function PrivacyPage() {
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
            <span>🛡️ Plain-Language Privacy Notice</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-3">
            Our Privacy Policy &amp; Data Promise
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
            We believe your career history is personal. We do not sell your data, we do not log your CV text on our servers,
            and we never use your information to train AI models. This page explains our practices in plain English.
          </p>
          <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-wrap items-center gap-4 text-xs text-neutral-500">
            <span><strong>Effective Date:</strong> November 24, 2026</span>
            <span>•</span>
            <span><strong>Last Updated:</strong> November 2026</span>
            <span>•</span>
            <span><strong>Version:</strong> 1.0 (Phase 8c)</span>
          </div>
        </header>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
            <div className="text-xl mb-1" aria-hidden="true">🔒</div>
            <h2 className="text-sm font-semibold text-neutral-900 mb-1">Zero Logging</h2>
            <p className="text-xs text-neutral-600">
              Server routes never log your CV content, personal details, or AI inputs to disk or telemetry tools.
            </p>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
            <div className="text-xl mb-1" aria-hidden="true">🤖</div>
            <h2 className="text-sm font-semibold text-neutral-900 mb-1">On-Demand AI Only</h2>
            <p className="text-xs text-neutral-600">
              CV text is only sent to Anthropic's Claude API when you click an AI button. Never during normal editing.
            </p>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
            <div className="text-xl mb-1" aria-hidden="true">🗑️</div>
            <h2 className="text-sm font-semibold text-neutral-900 mb-1">Complete Deletion</h2>
            <p className="text-xs text-neutral-600">
              One click permanently deletes your account and all associated CV versions from our database.
            </p>
          </div>
        </div>

        {/* Policy Body */}
        <div className="space-y-6">
          {/* Section 1 */}
          <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <span>1. What We Store (and What We NEVER Collect)</span>
            </h2>
            <div className="space-y-4 text-sm text-neutral-700 leading-relaxed">
              <p>
                To provide formatting, verification, and export features, CV Builder processes only the data you directly enter:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                  <h3 className="font-semibold text-emerald-900 text-sm mb-2 flex items-center gap-1.5">
                    <span>✓</span> What We Store
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-xs text-emerald-800">
                    <li>Contact info (full name, email, phone, location)</li>
                    <li>Work experience, education, skills, and projects</li>
                    <li>Evidence Vault facts (numbers, metrics, notes)</li>
                    <li>Account email and securely hashed password credentials</li>
                    <li>Flutterwave transaction references and digital receipts</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-rose-50 border border-rose-200">
                  <h3 className="font-semibold text-rose-900 text-sm mb-2 flex items-center gap-1.5">
                    <span>✕</span> What We NEVER Collect or Store
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-xs text-rose-800">
                    <li>Government ID numbers (SSN, national ID, passport)</li>
                    <li>Credit or debit card numbers, expiration dates, or CVVs</li>
                    <li>Bank account login credentials or Mobile Money PINs</li>
                    <li>Biometric data, religious beliefs, or medical history</li>
                    <li>Third-party web browsing tracking or ad profiles</li>
                  </ul>
                </div>
              </div>
              <p className="text-xs text-neutral-500 italic">
                Note: Credit card and Mobile Money transactions are handled entirely by Flutterwave on their PCI-DSS Level 1 compliant servers. We never receive or store your card or PIN details.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <span>2. Third-Party AI Processing (Anthropic Claude API)</span>
            </h2>
            <div className="space-y-4 text-sm text-neutral-700 leading-relaxed">
              <p>
                Our AI features (Improve Bullet, Draft Summary, Coach Mode, and Job Tailoring) use the <strong>Anthropic Claude API</strong>. Here is how your data is handled:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-neutral-700 pl-2">
                <li>
                  <strong>Only On Your Command:</strong> Data is transmitted to Anthropic <em>only</em> when you explicitly click an AI action button (such as "Improve wording" or "Analyze Job Posting"). Normal typing, form filling, and preview rendering stay completely in your browser.
                </li>
                <li>
                  <strong>No Model Training:</strong> Under Anthropic's Commercial Terms of Service for developers, API inputs and outputs are <strong>not used to train or fine-tune foundation models</strong>.
                </li>
                <li>
                  <strong>Server-Side Only:</strong> All AI requests are dispatched from our server routes. Your API keys and secrets are never exposed in client JavaScript.
                </li>
                <li>
                  <strong>Honesty Guard Inspection:</strong> Every AI response passes through an automated factual integrity filter before reaching your screen to reject hallucinated dates, companies, or tools.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <span>3. Zero-Logging &amp; No-Analytics Guarantee</span>
            </h2>
            <div className="space-y-3 text-sm text-neutral-700 leading-relaxed">
              <p>
                In strict accordance with Rule 5 of our engineering guidelines:
              </p>
              <blockquote className="border-l-4 border-primary-500 pl-4 py-1 text-neutral-800 bg-neutral-50 rounded-r text-sm italic">
                "Do not log CV content or AI inputs. Do not send CV content to analytics."
              </blockquote>
              <p>
                Our server endpoints do not write your candidate name, company history, bullet points, job postings, or prompt content to server console logs, monitoring files, or disk logs.
                We do not include third-party advertising pixels, session recording scripts (such as Hotjar or FullStory), or behavioral trackers that inspect your form inputs.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <span>4. Data Retention (How Long We Keep Data)</span>
            </h2>
            <div className="space-y-3 text-sm text-neutral-700 leading-relaxed">
              <ul className="space-y-3">
                <li className="p-3 rounded-lg border border-neutral-200 bg-neutral-50">
                  <strong className="text-neutral-900">Guest Users (No Account):</strong>
                  <p className="text-xs text-neutral-600 mt-1">
                    Your CV draft is saved exclusively inside your browser's local memory (<code className="bg-neutral-200 px-1 py-0.5 rounded text-neutral-800">localStorage</code>). It never touches our database. It remains there until you clear your browser cookies/storage or click "Reset form".
                  </p>
                </li>
                <li className="p-3 rounded-lg border border-neutral-200 bg-neutral-50">
                  <strong className="text-neutral-900">Registered Accounts:</strong>
                  <p className="text-xs text-neutral-600 mt-1">
                    When you save CV versions to your cloud account, they are stored in our encrypted Supabase database partition, protected by PostgreSQL Row Level Security (RLS). They are retained until you manually delete specific versions or delete your account.
                  </p>
                </li>
                <li className="p-3 rounded-lg border border-neutral-200 bg-neutral-50">
                  <strong className="text-neutral-900">Payment Records &amp; Receipts:</strong>
                  <p className="text-xs text-neutral-600 mt-1">
                    Purchase transactions and receipts are retained to fulfill statutory accounting, taxation, and anti-fraud audit obligations.
                  </p>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <span>5. How to Permanently Delete Your Data</span>
            </h2>
            <div className="space-y-3 text-sm text-neutral-700 leading-relaxed">
              <p>
                You have an absolute right to be forgotten. We make complete data removal straightforward:
              </p>
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm">
                <strong>Registered Users:</strong> Click on your account email in the top navigation bar, select <strong>"Account Settings"</strong>, and choose <strong>"Delete my account and all data"</strong>.
                When confirmed, a cascading deletion (<code className="bg-amber-100 px-1 py-0.5 rounded">ON DELETE CASCADE</code>) immediately and permanently destroys:
                <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                  <li>Your user account and credentials</li>
                  <li>Every saved CV version and snapshot</li>
                  <li>All Evidence Vault metrics and notes</li>
                  <li>All associated active session tokens</li>
                </ul>
              </div>
              <p className="text-xs text-neutral-600">
                <strong>Guest Users:</strong> Simply clear your browser's site data, or click the "Reset form" button in the CV editor.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <span>6. Third-Party Sub-Processors</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border border-neutral-200 rounded-lg">
                <thead className="bg-neutral-100 text-neutral-800 font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="p-3">Partner / Sub-Processor</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3">Data Shared</th>
                    <th className="p-3">Privacy Terms</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-neutral-700">
                  <tr>
                    <td className="p-3 font-medium">Supabase</td>
                    <td className="p-3">Authentication &amp; Encrypted PostgreSQL Storage</td>
                    <td className="p-3">Email, password hash, saved CV versions</td>
                    <td className="p-3"><a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="underline text-primary-600">Privacy Policy</a></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Anthropic (Claude API)</td>
                    <td className="p-3">On-demand wording assistance &amp; coaching</td>
                    <td className="p-3">Selected bullet or summary text (only when clicked)</td>
                    <td className="p-3"><a href="https://www.anthropic.com/legal/commercial-terms" target="_blank" rel="noopener noreferrer" className="underline text-primary-600">Commercial Terms</a></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Flutterwave</td>
                    <td className="p-3">Payment processing (Cards, MTN/Orange MoMo)</td>
                    <td className="p-3">Transaction amount, currency, email</td>
                    <td className="p-3"><a href="https://flutterwave.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline text-primary-600">Privacy Policy</a></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 7: Formal Review Callouts */}
          <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2 flex items-center gap-2">
              <span>7. Legal &amp; Regulatory Compliance Review Notice</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mb-4">
              To remain fully transparent, the following items are specifically flagged for ongoing legal counsel and payment partner review:
            </p>

            <div className="space-y-4">
              {/* Flag 1: Legal Review Needed */}
              <div className="p-4 rounded-lg bg-yellow-50 border-l-4 border-yellow-500 text-yellow-900 text-xs sm:text-sm space-y-2">
                <div className="font-bold flex items-center gap-1.5 uppercase tracking-wide text-xs">
                  <span>⚠️ [LEGAL REVIEW NEEDED: GDPR CROSS-BORDER TRANSFERS]</span>
                </div>
                <p>
                  Anthropic API servers and certain cloud database regions may operate in the United States. Under GDPR Article 44+, transfers of EU citizen data to US servers require appropriate safeguards (such as Standard Contractual Clauses or the EU-US Data Privacy Framework). A qualified European data protection lawyer should review and finalize our Data Processing Agreement (DPA).
                </p>
              </div>

              {/* Flag 2: Legal Review Needed */}
              <div className="p-4 rounded-lg bg-yellow-50 border-l-4 border-yellow-500 text-yellow-900 text-xs sm:text-sm space-y-2">
                <div className="font-bold flex items-center gap-1.5 uppercase tracking-wide text-xs">
                  <span>⚠️ [LEGAL REVIEW NEEDED: STATUTORY RIGHT OF WITHDRAWAL WAIVER]</span>
                </div>
                <p>
                  Under EU Consumer Rights Directive (Directive 2011/83/EU), purchasers of digital content have a 14-day statutory right of cancellation unless they give explicit prior consent to immediate digital delivery and acknowledge that they forfeit their right of withdrawal. Our checkout flow should confirm this express waiver before delivering clean downloads.
                </p>
              </div>

              {/* Flag 3: Flutterwave Compliance */}
              <div className="p-4 rounded-lg bg-blue-50 border-l-4 border-blue-500 text-blue-900 text-xs sm:text-sm space-y-2">
                <div className="font-bold flex items-center gap-1.5 uppercase tracking-wide text-xs">
                  <span>💳 [FLUTTERWAVE COMPLIANCE NOTE: REGISTERED ENTITY &amp; DISPUTE RESOLUTION]</span>
                </div>
                <p>
                  Flutterwave merchant rules require every live merchant website to clearly display:
                </p>
                <ul className="list-disc list-inside text-xs space-y-1 pl-2">
                  <li>Official registered business/developer name and legal domicile address</li>
                  <li>Dedicated customer support contact email (e.g. <code className="bg-blue-100 px-1 py-0.5 rounded">support@yourdomain.com</code>)</li>
                  <li>Customer service response commitment (e.g. inquiries answered within 48 business hours)</li>
                  <li>Explicit chargeback dispute resolution process and 5-to-7 business day turnaround timeline</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 8: Contact */}
          <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2">8. Contact Us &amp; Exercising Your Rights</h2>
            <p className="text-sm text-neutral-700 leading-relaxed">
              If you have any questions regarding your data, privacy rights, or wish to submit a data access request, please contact our privacy lead at:
            </p>
            <div className="mt-3 p-3 bg-neutral-100 rounded text-xs font-mono text-neutral-800">
              privacy@cvbuilder.local • Legal Lead &amp; Data Protection Officer
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
