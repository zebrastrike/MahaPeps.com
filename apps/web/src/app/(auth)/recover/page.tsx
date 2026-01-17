"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function RecoverPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      // For now, just show success - password reset can be implemented later if needed
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      setEmail("");
    } catch (err: any) {
      setError("Unable to process password reset request. Please contact support.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-charcoal-900 to-charcoal-800 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/">
            <Image
              src="/branding/maha-logo.png"
              alt="MAHA Peptides"
              width={200}
              height={70}
              className="mx-auto h-16 w-auto [filter:drop-shadow(0_0_8px_rgba(220,38,38,0.6))_drop-shadow(0_0_16px_rgba(255,255,255,0.4))]"
              priority
            />
          </Link>
        </div>

        <div className="rounded-xl border border-charcoal-700/50 bg-charcoal-800/90 p-8 shadow-glass backdrop-blur-sm">
          {!success ? (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-clinical-white">Reset Password</h1>
                <p className="mt-2 text-sm text-charcoal-300">
                  For password reset assistance, please contact our support team
                </p>
              </div>

              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-charcoal-200">
                    Email Address
                  </label>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-5 w-5 text-charcoal-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-lg border border-charcoal-600 bg-charcoal-700/50 py-3 pl-10 pr-4 text-clinical-white placeholder-charcoal-400 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isLoading ? "Processing..." : "Request Password Reset"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-2 text-sm font-medium text-accent-400 hover:text-accent-300"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-400" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-clinical-white">Request Received</h2>
              <p className="mb-6 text-sm text-charcoal-300">
                Our support team will contact you shortly to assist with your password reset.
              </p>
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 text-sm font-medium text-accent-400 hover:text-accent-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to Sign In
              </Link>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-charcoal-400">
          <p>
            Need immediate help?{" "}
            <Link href="/contact" className="text-accent-400 hover:text-accent-300">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
