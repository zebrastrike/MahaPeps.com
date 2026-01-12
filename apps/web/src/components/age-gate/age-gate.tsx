'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export function AgeGate() {
  const pathname = usePathname();
  const [showGate, setShowGate] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [researchUseAccepted, setResearchUseAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Don't show gate on homepage
    if (pathname === '/') {
      setIsLoading(false);
      return;
    }

    // Check if user already verified age this session
    const verified = sessionStorage.getItem('age_verified');
    if (verified === 'true') {
      setIsLoading(false);
      return;
    }

    // Show age gate
    setShowGate(true);
    setIsLoading(false);
  }, [pathname]);

  const handleEnter = () => {
    if (!ageConfirmed || !termsAccepted || !researchUseAccepted) return;

    // Store verification and acceptance in session storage
    sessionStorage.setItem('age_verified', 'true');
    sessionStorage.setItem('terms_accepted', 'true');
    sessionStorage.setItem('research_use_accepted', 'true');
    sessionStorage.setItem('acceptance_timestamp', new Date().toISOString());
    setShowGate(false);
  };

  const allAccepted = ageConfirmed && termsAccepted && researchUseAccepted;

  const handleExit = () => {
    // Redirect to Google
    window.location.href = 'https://www.google.com';
  };

  if (isLoading) {
    return null;
  }

  if (!showGate) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-900/95 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-xl border-2 border-red-500 bg-charcoal-800 p-8 shadow-2xl my-8">
        {/* Logo */}
        <div className="mb-6 text-center">
          <Image
            src="/branding/maha-logo.png"
            alt="MAHA Peptides"
            width={180}
            height={60}
            className="mx-auto h-14 w-auto [filter:drop-shadow(0_0_8px_rgba(220,38,38,0.6))_drop-shadow(0_0_16px_rgba(255,255,255,0.4))]"
            priority
          />
        </div>

        {/* Title */}
        <div className="mb-6 text-center">
          <div className="mb-2 text-4xl">⚠️</div>
          <h1 className="text-2xl font-bold text-clinical-white">Legal Agreement Required</h1>
          <p className="text-sm text-charcoal-400 mt-2">You must read and accept all terms before accessing this website</p>
        </div>

        {/* Critical Warning */}
        <div className="mb-6 rounded-lg border-2 border-red-500 bg-red-500/10 p-4">
          <p className="text-center font-bold text-red-200 mb-2">RESEARCH CHEMICALS - NOT FOR HUMAN CONSUMPTION</p>
          <p className="text-center text-sm text-red-100">
            This website contains research chemicals and peptides intended <strong>SOLELY FOR LABORATORY RESEARCH AND ANALYTICAL USE</strong>.
            Products are <strong>NOT for human consumption, animal consumption, or any in-vivo application</strong>.
          </p>
        </div>

        {/* Required Acceptances */}
        <div className="space-y-4 mb-6">
          {/* Age Confirmation */}
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-charcoal-600 bg-charcoal-900/50 p-4 hover:border-accent-500 transition-colors">
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={(e) => setAgeConfirmed(e.target.checked)}
              className="mt-0.5 h-5 w-5 rounded border-charcoal-600 bg-charcoal-900 text-accent-500 focus:ring-2 focus:ring-accent-500/20 flex-shrink-0"
            />
            <div className="text-sm text-charcoal-200">
              <p className="font-semibold text-clinical-white mb-1">Age Verification (Required)</p>
              <p>I confirm that I am <strong className="text-accent-400">at least 18 years of age</strong> and have the legal capacity to enter into binding agreements.</p>
            </div>
          </label>

          {/* Terms of Service */}
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-charcoal-600 bg-charcoal-900/50 p-4 hover:border-accent-500 transition-colors">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 h-5 w-5 rounded border-charcoal-600 bg-charcoal-900 text-accent-500 focus:ring-2 focus:ring-accent-500/20 flex-shrink-0"
            />
            <div className="text-sm text-charcoal-200">
              <p className="font-semibold text-clinical-white mb-1">Terms of Service (Required)</p>
              <p>
                I have read and agree to the{' '}
                <Link href="/terms" target="_blank" className="text-accent-400 hover:text-accent-300 underline font-semibold">
                  Terms of Service
                </Link>
                , including acknowledgment that <strong className="text-red-400">ALL SALES ARE FINAL with NO REFUNDS or RETURNS</strong>.
              </p>
            </div>
          </label>

          {/* Research Use Policy */}
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-charcoal-600 bg-charcoal-900/50 p-4 hover:border-accent-500 transition-colors">
            <input
              type="checkbox"
              checked={researchUseAccepted}
              onChange={(e) => setResearchUseAccepted(e.target.checked)}
              className="mt-0.5 h-5 w-5 rounded border-charcoal-600 bg-charcoal-900 text-accent-500 focus:ring-2 focus:ring-accent-500/20 flex-shrink-0"
            />
            <div className="text-sm text-charcoal-200">
              <p className="font-semibold text-clinical-white mb-1">Research Use Only Policy (Required)</p>
              <p>
                I have read and agree to the{' '}
                <Link href="/research-use" target="_blank" className="text-accent-400 hover:text-accent-300 underline font-semibold">
                  Research Use Only Policy
                </Link>
                , confirming that products are for <strong className="text-amber-400">IN-VITRO RESEARCH ONLY</strong> and{' '}
                <strong className="text-red-400">NOT for human or animal consumption</strong>.
              </p>
            </div>
          </label>
        </div>

        {/* Additional Acknowledgments */}
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="font-semibold text-amber-200 mb-2">By checking all boxes above, I acknowledge:</p>
          <ul className="text-xs text-amber-100 space-y-1">
            <li>• I possess adequate training and facilities to handle research chemicals safely</li>
            <li>• I am responsible for compliance with all applicable federal, state, and local laws</li>
            <li>• I assume ALL risks associated with purchase, handling, storage, and use of products</li>
            <li>• I release MAHA Peptides from liability for any harm or damages resulting from product use</li>
            <li>• I understand that no medical advice or therapeutic guidance is provided</li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleExit}
            className="flex-1 rounded-lg border-2 border-charcoal-600 bg-charcoal-900 px-6 py-3 font-semibold text-charcoal-300 transition-colors hover:border-red-500 hover:bg-red-900/20 hover:text-red-400"
          >
            I Do Not Accept - Exit
          </button>
          <button
            onClick={handleEnter}
            disabled={!allAccepted}
            className="flex-1 rounded-lg bg-accent-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-accent-500"
          >
            I Accept All Terms - Enter Site
          </button>
        </div>

        {/* Footer notice */}
        <p className="mt-6 text-center text-xs text-charcoal-500">
          By entering this website, you confirm acceptance of all terms, policies, and legal disclaimers.
          Your acceptance is legally binding and will be recorded with timestamp and IP address.
        </p>
      </div>
    </div>
  );
}
