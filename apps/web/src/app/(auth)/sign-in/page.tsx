'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid email or password');
      }

      // Store token (use both keys for compatibility)
      const token = data.accessToken || data.access_token;
      localStorage.setItem('token', token);
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to intended destination or based on user role
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        const role = data.user?.role;
        if (role === 'ADMIN') {
          router.push('/admin');
        } else {
          // Redirect customers back to products page after login
          router.push('/products');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-charcoal-900 to-charcoal-800 px-4 sm:px-6 lg:px-8">
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

        {/* Sign In Card */}
        <div className="rounded-xl border border-charcoal-700/50 bg-charcoal-800/90 p-8 shadow-glass backdrop-blur-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-clinical-white">Welcome Back</h1>
            <p className="mt-2 text-sm text-charcoal-300">
              Sign in to your MAHA Peptides account
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
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-charcoal-600 bg-charcoal-700/50 py-3 pl-10 pr-4 text-clinical-white placeholder-charcoal-400 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                  placeholder="you@example.com"
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
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-charcoal-600 bg-charcoal-700/50 py-3 pl-10 pr-12 text-clinical-white placeholder-charcoal-400 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-charcoal-400 hover:text-charcoal-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-charcoal-600 bg-charcoal-700 text-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:ring-offset-0"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-charcoal-300">
                  Remember me
                </label>
              </div>

              <Link
                href="/recover"
                className="text-sm font-medium text-accent-400 hover:text-accent-300"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-charcoal-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-charcoal-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-charcoal-800 px-2 text-charcoal-400">Or</span>
            </div>
          </div>

          {/* Create Account Link */}
          <div className="text-center">
            <p className="text-sm text-charcoal-300">
              Don&apos;t have an account?{' '}
              <Link
                href="/create-account"
                className="font-medium text-accent-400 hover:text-accent-300"
              >
                Create one now
              </Link>
            </p>
          </div>
        </div>

        {/* Compliance Notice */}
        <div className="mt-6 text-center text-xs text-charcoal-400">
          <p>
            By signing in, you acknowledge that you are accessing research materials for
            legitimate scientific purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}
