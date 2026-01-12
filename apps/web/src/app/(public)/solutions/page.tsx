import Link from 'next/link';
import Image from 'next/image';
import { GraduationCap, Hospital, Building2, Beaker, FileCheck, Shield, MapPin, ChevronRight } from 'lucide-react';

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal-900 to-charcoal-800">
      {/* Header Section */}
      <section className="border-b border-charcoal-700/50 bg-charcoal-900/50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <Link href="/">
                <Image
                  src="/branding/maha-logo.png"
                  alt="MAHA Peptides"
                  width={200}
                  height={70}
                  className="h-16 w-auto [filter:drop-shadow(0_0_8px_rgba(220,38,38,0.6))_drop-shadow(0_0_16px_rgba(255,255,255,0.4))]"
                  priority
                />
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-clinical-white md:text-5xl">
              Peptide Research Solutions for Every Scientific Application
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-charcoal-300">
              From academic research to clinical trials and biotech innovation, MAHA Peptides provides
              pharmaceutical-grade compounds trusted by researchers advancing peptide science worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Research Solutions Grid */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-clinical-white">
              Tailored Solutions for Research Excellence
            </h2>
            <p className="mt-4 text-lg text-charcoal-300">
              Specialized peptide solutions designed for your research environment and regulatory requirements
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Academic Research */}
            <div className="rounded-xl border border-charcoal-700/50 bg-gradient-to-br from-charcoal-800/90 to-charcoal-900/90 p-8 shadow-glass backdrop-blur-sm transition-all hover:border-accent-500/50 hover:shadow-accent-glow">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-accent-500/10 text-accent-400">
                <GraduationCap className="h-8 w-8" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-clinical-white">
                Academic Research
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-charcoal-300">
                Supporting university programs, graduate studies, and institutional investigations with
                high-purity peptides for groundbreaking research. We provide educational pricing, flexible
                ordering, and comprehensive documentation for academic publications.
              </p>
              <ul className="mb-6 space-y-3 text-sm text-charcoal-300">
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent-400" />
                  <span>University programs & graduate research</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent-400" />
                  <span>Educational institution pricing</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent-400" />
                  <span>Institutional purchase orders accepted</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent-400" />
                  <span>Publication-ready COA documentation</span>
                </li>
              </ul>
              <Link
                href="/wholesale"
                className="inline-flex items-center gap-2 rounded-lg bg-accent-500/10 px-6 py-3 text-sm font-semibold text-accent-400 transition-all hover:bg-accent-500 hover:text-white"
              >
                Academic Pricing
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Clinical Research Facilities */}
            <div className="rounded-xl border border-charcoal-700/50 bg-gradient-to-br from-charcoal-800/90 to-charcoal-900/90 p-8 shadow-glass backdrop-blur-sm transition-all hover:border-accent-500/50 hover:shadow-accent-glow">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-accent-500/10 text-accent-400">
                <Hospital className="h-8 w-8" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-clinical-white">
                Clinical Research Facilities
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-charcoal-300">
                Empowering licensed medical research facilities and IRB-approved studies with GMP-compliant
                peptides. We understand the rigorous requirements of clinical research and provide the
                quality, documentation, and support your trials demand.
              </p>
              <ul className="mb-6 space-y-3 text-sm text-charcoal-300">
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent-400" />
                  <span>IRB-approved study support</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent-400" />
                  <span>GMP-compliant manufacturing standards</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent-400" />
                  <span>Complete regulatory documentation</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent-400" />
                  <span>Priority delivery for trial timelines</span>
                </li>
              </ul>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg bg-accent-500/10 px-6 py-3 text-sm font-semibold text-accent-400 transition-all hover:bg-accent-500 hover:text-white"
              >
                Clinical Inquiries
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Biotech & Industry */}
            <div className="rounded-xl border border-charcoal-700/50 bg-gradient-to-br from-charcoal-800/90 to-charcoal-900/90 p-8 shadow-glass backdrop-blur-sm transition-all hover:border-accent-500/50 hover:shadow-accent-glow">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-accent-500/10 text-accent-400">
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-clinical-white">
                Biotech & Industry
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-charcoal-300">
                Fueling biotech startups, pharmaceutical R&D, and contract research organizations with
                scalable peptide solutions. From early-stage discovery to pre-clinical development, we
                deliver the quality and consistency your innovation requires.
              </p>
              <ul className="mb-6 space-y-3 text-sm text-charcoal-300">
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent-400" />
                  <span>Pharmaceutical R&D partnerships</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent-400" />
                  <span>Scalable bulk ordering</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent-400" />
                  <span>Custom synthesis capabilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent-400" />
                  <span>Dedicated account management</span>
                </li>
              </ul>
              <Link
                href="/wholesale"
                className="inline-flex items-center gap-2 rounded-lg bg-accent-500/10 px-6 py-3 text-sm font-semibold text-accent-400 transition-all hover:bg-accent-500 hover:text-white"
              >
                Enterprise Solutions
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Assurance Section */}
      <section className="border-y border-charcoal-700/50 bg-charcoal-800/30 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-clinical-white">
              Quality Assurance You Can Trust
            </h2>
            <p className="mt-4 text-lg text-charcoal-300">
              Every MAHA Peptides product meets the highest standards of pharmaceutical research excellence
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Badge 1 */}
            <div className="rounded-xl border border-charcoal-700/50 bg-charcoal-800/50 p-6 text-center backdrop-blur-sm">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-500/10">
                  <Beaker className="h-8 w-8 text-accent-400" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-bold text-clinical-white">
                99%+ Verified Purity
              </h3>
              <p className="text-sm text-charcoal-300">
                Every batch tested via HPLC and mass spectrometry to ensure pharmaceutical-grade quality
              </p>
            </div>

            {/* Badge 2 */}
            <div className="rounded-xl border border-charcoal-700/50 bg-charcoal-800/50 p-6 text-center backdrop-blur-sm">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-500/10">
                  <FileCheck className="h-8 w-8 text-accent-400" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-bold text-clinical-white">
                Third-Party COA
              </h3>
              <p className="text-sm text-charcoal-300">
                Independent Certificate of Analysis provided with complete analytical data for every batch
              </p>
            </div>

            {/* Badge 3 */}
            <div className="rounded-xl border border-charcoal-700/50 bg-charcoal-800/50 p-6 text-center backdrop-blur-sm">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-500/10">
                  <Shield className="h-8 w-8 text-accent-400" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-bold text-clinical-white">
                GMP-Compliant Manufacturing
              </h3>
              <p className="text-sm text-charcoal-300">
                Manufactured following Good Manufacturing Practices in certified pharmaceutical facilities
              </p>
            </div>

            {/* Badge 4 */}
            <div className="rounded-xl border border-charcoal-700/50 bg-charcoal-800/50 p-6 text-center backdrop-blur-sm">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-500/10">
                  <MapPin className="h-8 w-8 text-accent-400" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-bold text-clinical-white">
                American-Made Standards
              </h3>
              <p className="text-sm text-charcoal-300">
                Proudly manufactured in the United States with domestic quality control and support
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-accent-500/30 bg-gradient-to-br from-charcoal-800 to-charcoal-900 p-12 text-center shadow-accent-glow">
            <h2 className="mb-4 text-3xl font-bold text-clinical-white">
              Ready to Advance Your Research?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-charcoal-300">
              Join leading research institutions and biotech innovators who trust MAHA Peptides for
              their most critical peptide research applications.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-accent-600 hover:shadow-xl"
              >
                Browse Catalog
                <ChevronRight className="h-5 w-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg border border-accent-500 px-8 py-4 text-base font-semibold text-accent-400 transition-all hover:bg-accent-500 hover:text-white"
              >
                Contact Our Team
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Notice */}
      <section className="border-t border-charcoal-700/50 bg-charcoal-800/30 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-clinical-warning/30 bg-clinical-warning/10 p-6">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 flex-shrink-0 text-clinical-warning" />
              <div>
                <h3 className="font-semibold text-clinical-warning">
                  Research Use Only - Regulatory Compliance
                </h3>
                <p className="mt-2 text-sm text-charcoal-200">
                  All MAHA Peptides products are intended exclusively for laboratory research, analytical testing,
                  and scientific investigation by qualified researchers. Not for human or veterinary consumption.
                  Purchaser assumes all responsibility for ensuring compliance with applicable local, state, and
                  federal regulations governing peptide research.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
