import Link from "next/link";

/**
 * Compliance-Safe Footer
 *
 * CRITICAL: This footer contains all required disclaimers from GUARDRAILS.md
 * DO NOT modify or remove any disclaimer text without legal review
 */
export function ComplianceFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Company Info */}
          <div>
            <div className="text-lg font-bold text-slate-900">MAHA Peptides</div>
            <p className="mt-2 text-sm text-slate-600">
              Research-grade peptides for laboratory and analytical use only
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
              Products
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/products" className="text-sm text-slate-600 hover:text-teal-600">
                  Browse Catalog
                </Link>
              </li>
              <li>
                <Link href="/products/categories" className="text-sm text-slate-600 hover:text-teal-600">
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
              Support
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/support" className="text-sm text-slate-600 hover:text-teal-600">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-slate-600 hover:text-teal-600">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-sm text-slate-600 hover:text-teal-600">
                  Shipping Info
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
              Legal
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/terms" className="text-sm text-slate-600 hover:text-teal-600">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-slate-600 hover:text-teal-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/disclaimers" className="text-sm text-slate-600 hover:text-teal-600">
                  Disclaimers
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* REQUIRED DISCLAIMERS - DO NOT MODIFY */}
      <div className="border-t border-slate-300 bg-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-6 text-xs leading-relaxed text-slate-700">

            {/* RESEARCH USE ONLY */}
            <div>
              <h4 className="font-bold text-slate-900">RESEARCH USE ONLY</h4>
              <p className="mt-1">
                All products sold on this platform are intended solely for lawful laboratory research and analytical use.
                Not for human or veterinary consumption.
              </p>
            </div>

            {/* FDA DISCLAIMER */}
            <div>
              <h4 className="font-bold text-slate-900">FDA DISCLAIMER</h4>
              <p className="mt-1">
                All statements on this website have not been evaluated by the Food and Drug Administration (FDA).
                All products are sold strictly for research, laboratory, or analytical purposes only.
                Products are not intended to diagnose, treat, cure, or prevent any disease.
              </p>
            </div>

            {/* NON-PHARMACY DISCLAIMER */}
            <div>
              <h4 className="font-bold text-slate-900">NON-PHARMACY DISCLAIMER</h4>
              <p className="mt-1">
                This site operates solely as a chemical and research materials supplier.
                We are not a compounding pharmacy or chemical compounding facility as defined under Section 503A of the Federal Food, Drug, and Cosmetic Act.
                We are not an outsourcing facility as defined under Section 503B of the Federal Food, Drug, and Cosmetic Act.
              </p>
            </div>

            {/* LIABILITY & RESPONSIBILITY */}
            <div>
              <h4 className="font-bold text-slate-900">LIABILITY & RESPONSIBILITY</h4>
              <p className="mt-1">
                The purchaser assumes full responsibility for the proper handling, storage, use, and disposal of all products.
                The purchaser is responsible for ensuring compliance with all applicable local, state, federal, and international laws.
              </p>
            </div>

            {/* NO MEDICAL ADVICE */}
            <div>
              <h4 className="font-bold text-slate-900">NO MEDICAL ADVICE</h4>
              <p className="mt-1">
                Nothing on this website constitutes medical, clinical, or healthcare advice.
                All information provided is for educational and research discussion purposes only.
              </p>
            </div>

            {/* AGE RESTRICTION */}
            <div>
              <h4 className="font-bold text-slate-900">AGE RESTRICTION</h4>
              <p className="mt-1">
                You must be at least 18 years of age to access this website or purchase products.
                By using this website, you represent and warrant that you are at least 18 years old.
              </p>
            </div>

            {/* INTERNATIONAL DISCLAIMER */}
            <div>
              <h4 className="font-bold text-slate-900">INTERNATIONAL DISCLAIMER</h4>
              <p className="mt-1">
                International customers are responsible for ensuring compliance with their country's import regulations.
                We do not guarantee deliverability to countries where peptides are controlled or prohibited substances.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-300 bg-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-slate-600">
          © {currentYear} MAHA Peptides. All rights reserved. Research materials only.
        </div>
      </div>
    </footer>
  );
}
