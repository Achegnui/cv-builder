import { CVForm } from "@/components/cv-form/cv-form";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="no-print border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
              CV Builder
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500">
              One profile for every format. Honest, verifiable, and mistake-free.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 py-4 sm:px-6 sm:py-6">
        <CVForm />
      </main>
    </div>
  );
}
