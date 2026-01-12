'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function CreateAccountPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptResearchUse, setAcceptResearchUse] = useState(false);
  const [ageConfirm, setAgeConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!acceptTerms || !acceptResearchUse || !ageConfirm) {
      setError('You must accept all agreements to create an account');
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role: 'CLIENT'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create account');
      }

      // Store token
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-charcoal-900 to-charcoal-800 px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
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

        {/* Create Account Card */}
        <div className="rounded-xl border border-charcoal-700/50 bg-charcoal-800/90 p-8 shadow-glass backdrop-blur-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-clinical-white">Create Account</h1>
            <p className="mt-2 text-sm text-charcoal-300">
              Start your research with MAHA Peptides
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
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
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-charcoal-600 bg-charcoal-900/50 py-3 pl-10 pr-3 text-clinical-white placeholder-charcoal-400 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-charcoal-200">
                Password
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-charcoal-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-charcoal-600 bg-charcoal-900/50 py-3 pl-10 pr-10 text-clinical-white placeholder-charcoal-400 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-charcoal-400 hover:text-charcoal-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-charcoal-400">Must be at least 8 characters</p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-charcoal-200">
                Confirm Password
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-charcoal-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-lg border border-charcoal-600 bg-charcoal-900/50 py-3 pl-10 pr-10 text-clinical-white placeholder-charcoal-400 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-charcoal-400 hover:text-charcoal-200"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Compliance Checkboxes */}
            <div className="space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <label className="flex items-start gap-3 text-sm text-charcoal-200">
                <input
                  type="checkbox"
                  checked={acceptResearchUse}
                  onChange={(e) => setAcceptResearchUse(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-charcoal-600 bg-charcoal-900 text-accent-500 focus:ring-2 focus:ring-accent-500/20"
                  required
                />
                <span>
                  I acknowledge that all products are for <strong>research purposes only</strong> and not for human or veterinary consumption.
                </span>
              </label>

              <label className="flex items-start gap-3 text-sm text-charcoal-200">
                <input
                  type="checkbox"
                  checked={ageConfirm}
                  onChange={(e) => setAgeConfirm(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-charcoal-600 bg-charcoal-900 text-accent-500 focus:ring-2 focus:ring-accent-500/20"
                  required
                />
                <span>I confirm that I am at least 18 years of age.</span>
              </label>

              <label className="flex items-start gap-3 text-sm text-charcoal-200">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-charcoal-600 bg-charcoal-900 text-accent-500 focus:ring-2 focus:ring-accent-500/20"
                  required
                />
                <span>
                  I have read and agree to the{' '}
                  <Link href="/terms" className="text-accent-400 hover:text-accent-300 underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-accent-400 hover:text-accent-300 underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-charcoal-300">
              Already have an account?{' '}
              <Link href="/sign-in" className="font-medium text-accent-400 hover:text-accent-300">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Research Use Notice */}
        <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-center">
          <p className="text-sm text-amber-200">
            <strong>Research Use Only:</strong> All products are strictly for laboratory research and analytical purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
