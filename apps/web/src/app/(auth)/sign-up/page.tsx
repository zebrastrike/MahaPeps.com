"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
      const response = await fetch(`${apiBaseUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Store token (use both keys for compatibility)
      const token = data.accessToken || data.access_token;
      localStorage.setItem("token", token);
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect to products page after successful registration
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.push("/products");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-charcoal-900 to-charcoal-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link href="/">
            <Image
              src="/branding/maha-logo.png"
              alt="MAHA Peptides"
              width={300}
              height={108}
              className="mx-auto h-24 w-auto"
              priority
            />
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-clinical-white">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-charcoal-300">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-accent-400 hover:text-accent-300"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="sr-only">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-charcoal-600 placeholder-charcoal-500 text-clinical-white bg-charcoal-800 rounded-md focus:outline-none focus:ring-accent-500 focus:border-accent-500 focus:z-10 sm:text-sm"
                placeholder="First Name"
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="sr-only">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-charcoal-600 placeholder-charcoal-500 text-clinical-white bg-charcoal-800 rounded-md focus:outline-none focus:ring-accent-500 focus:border-accent-500 focus:z-10 sm:text-sm"
                placeholder="Last Name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-charcoal-600 placeholder-charcoal-500 text-clinical-white bg-charcoal-800 rounded-md focus:outline-none focus:ring-accent-500 focus:border-accent-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="sr-only">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-charcoal-600 placeholder-charcoal-500 text-clinical-white bg-charcoal-800 rounded-md focus:outline-none focus:ring-accent-500 focus:border-accent-500 focus:z-10 sm:text-sm"
                placeholder="Phone Number"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-charcoal-600 placeholder-charcoal-500 text-clinical-white bg-charcoal-800 rounded-md focus:outline-none focus:ring-accent-500 focus:border-accent-500 focus:z-10 sm:text-sm"
                placeholder="Password (min 6 characters)"
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-500/10 border border-red-500/50 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent-500 hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </div>

          {/* Compliance Notice */}
          <div className="text-xs text-charcoal-400 text-center">
            By creating an account, you confirm that you are purchasing research materials
            for laboratory use only. Not for human consumption.
          </div>
        </form>
      </div>
    </div>
  );
}
