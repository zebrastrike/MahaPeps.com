'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Building2, TrendingDown, Headphones, Zap, FileCheck, DollarSign, Shield, CheckCircle, AlertCircle, Loader2, LogIn } from 'lucide-react';

export default function WholesalePage() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    businessType: '',
    taxId: '',
    licenseNumber: '',
    estimatedMonthlyVolume: '',
    message: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          subject: `Wholesale Application - ${formData.companyName}`,
          message: `
Company: ${formData.companyName}
Business Type: ${formData.businessType}
Tax ID: ${formData.taxId}
License Number: ${formData.licenseNumber}
Est. Monthly Volume: ${formData.estimatedMonthlyVolume}

Additional Information:
${formData.message}
          `.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit application');
      }

      setSuccess(true);
      setFormData({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        businessType: '',
        taxId: '',
        licenseNumber: '',
        estimatedMonthlyVolume: '',
        message: '',
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting the application');
    } finally {
      setIsLoading(false);
    }
  };

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
              Wholesale Research Solutions for Institutions & Facilities
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-charcoal-300">
              Partner with MAHA Peptides for premium wholesale pricing, dedicated account management,
              and priority processing for your laboratory, research institution, or biotech facility.
            </p>
            <div className="mt-8">
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 rounded-lg border border-accent-500 px-6 py-3 text-sm font-semibold text-accent-400 transition-all hover:bg-accent-500 hover:text-white"
              >
                <LogIn className="h-4 w-4" />
                Already have an account? Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="border-b border-charcoal-700/50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-clinical-white">
              Wholesale Partner Benefits
            </h2>
            <p className="mt-4 text-lg text-charcoal-300">
              Everything you need for seamless bulk ordering and institutional purchasing
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Benefit 1 */}
            <div className="rounded-xl border border-charcoal-700/50 bg-charcoal-800/90 p-6 shadow-glass backdrop-blur-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-500/10 text-accent-400">
                <TrendingDown className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-clinical-white">
                Volume Discounts
              </h3>
              <p className="text-sm text-charcoal-300">
                Save 10-30% with tiered wholesale pricing based on monthly order volume.
                The more you order, the more you save on pharmaceutical-grade peptides.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="rounded-xl border border-charcoal-700/50 bg-charcoal-800/90 p-6 shadow-glass backdrop-blur-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-500/10 text-accent-400">
                <Headphones className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-clinical-white">
                Dedicated Account Manager
              </h3>
              <p className="text-sm text-charcoal-300">
                Get assigned a personal account manager who understands your research needs
                and provides priority support for ordering and technical questions.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="rounded-xl border border-charcoal-700/50 bg-charcoal-800/90 p-6 shadow-glass backdrop-blur-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-500/10 text-accent-400">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-clinical-white">
                Priority Processing
              </h3>
              <p className="text-sm text-charcoal-300">
                Wholesale orders receive expedited processing and shipping to ensure your
                research timelines stay on track with faster turnaround times.
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="rounded-xl border border-charcoal-700/50 bg-charcoal-800/90 p-6 shadow-glass backdrop-blur-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-500/10 text-accent-400">
                <FileCheck className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-clinical-white">
                Net Payment Terms
              </h3>
              <p className="text-sm text-charcoal-300">
                Qualified institutions receive Net-30 payment terms for improved cash flow
                management and simplified procurement processes.
              </p>
            </div>

            {/* Benefit 5 */}
            <div className="rounded-xl border border-charcoal-700/50 bg-charcoal-800/90 p-6 shadow-glass backdrop-blur-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-500/10 text-accent-400">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-clinical-white">
                Custom Pricing Solutions
              </h3>
              <p className="text-sm text-charcoal-300">
                Large volume or specialized research needs? We offer custom pricing packages
                tailored to your institution&apos;s specific requirements.
              </p>
            </div>

            {/* Benefit 6 */}
            <div className="rounded-xl border border-charcoal-700/50 bg-charcoal-800/90 p-6 shadow-glass backdrop-blur-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-500/10 text-accent-400">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-clinical-white">
                Full Documentation & COAs
              </h3>
              <p className="text-sm text-charcoal-300">
                Every batch includes complete Certificate of Analysis, HPLC results, and
                mass spectrometry data for your regulatory and compliance needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="border-b border-charcoal-700/50 bg-charcoal-800/30 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-clinical-white">
              Wholesale Discount Tiers
            </h2>
            <p className="mt-4 text-lg text-charcoal-300">
              Transparent volume-based pricing for institutional purchasers
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Tier 1 */}
            <div className="rounded-xl border border-charcoal-700/50 bg-gradient-to-br from-charcoal-800 to-charcoal-900 p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-clinical-white">Starter</h3>
                <p className="text-sm text-charcoal-400">Small research teams</p>
              </div>
              <div className="mb-4">
                <p className="text-3xl font-bold text-accent-400">10% OFF</p>
                <p className="text-sm text-charcoal-300">Monthly orders $500 - $2,499</p>
              </div>
              <ul className="space-y-2 text-sm text-charcoal-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent-400" />
                  <span>Email support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent-400" />
                  <span>Standard processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent-400" />
                  <span>Full COA documentation</span>
                </li>
              </ul>
            </div>

            {/* Tier 2 */}
            <div className="rounded-xl border-2 border-accent-500 bg-gradient-to-br from-charcoal-800 to-charcoal-900 p-6 shadow-accent-glow">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-clinical-white">Professional</h3>
                <p className="text-sm text-charcoal-400">Established institutions</p>
              </div>
              <div className="mb-4">
                <p className="text-3xl font-bold text-accent-400">20% OFF</p>
                <p className="text-sm text-charcoal-300">Monthly orders $2,500 - $9,999</p>
              </div>
              <ul className="space-y-2 text-sm text-charcoal-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent-400" />
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent-400" />
                  <span>Priority processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent-400" />
                  <span>Net-30 payment terms</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent-400" />
                  <span>Phone & email support</span>
                </li>
              </ul>
            </div>

            {/* Tier 3 */}
            <div className="rounded-xl border border-charcoal-700/50 bg-gradient-to-br from-charcoal-800 to-charcoal-900 p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-clinical-white">Enterprise</h3>
                <p className="text-sm text-charcoal-400">Major research facilities</p>
              </div>
              <div className="mb-4">
                <p className="text-3xl font-bold text-accent-400">30% OFF</p>
                <p className="text-sm text-charcoal-300">Monthly orders $10,000+</p>
              </div>
              <ul className="space-y-2 text-sm text-charcoal-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent-400" />
                  <span>Custom pricing available</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent-400" />
                  <span>Premium account manager</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent-400" />
                  <span>Expedited shipping</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent-400" />
                  <span>Net-60 payment terms</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent-400" />
                  <span>24/7 priority support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements & Application Form */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Requirements Sidebar */}
            <div>
              <div className="rounded-xl border border-charcoal-700/50 bg-charcoal-800/90 p-6 shadow-glass backdrop-blur-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-500/10 text-accent-400">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="mb-4 text-xl font-semibold text-clinical-white">
                  Wholesale Requirements
                </h3>
                <ul className="space-y-3 text-sm text-charcoal-300">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-accent-400" />
                    <div>
                      <p className="font-medium text-clinical-white">Business License</p>
                      <p className="text-xs text-charcoal-400">Valid business registration required</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-accent-400" />
                    <div>
                      <p className="font-medium text-clinical-white">Minimum Order: $500</p>
                      <p className="text-xs text-charcoal-400">Monthly minimum for wholesale pricing</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-accent-400" />
                    <div>
                      <p className="font-medium text-clinical-white">Tax ID / EIN</p>
                      <p className="text-xs text-charcoal-400">Required for institutional accounts</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-accent-400" />
                    <div>
                      <p className="font-medium text-clinical-white">Research Compliance</p>
                      <p className="text-xs text-charcoal-400">Acknowledgment of research-use-only policy</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Application Form */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-charcoal-700/50 bg-charcoal-800/90 p-8 shadow-glass backdrop-blur-sm">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-clinical-white">Apply for Wholesale Account</h2>
                  <p className="mt-2 text-sm text-charcoal-300">
                    Complete the form below and our team will review your application within 1-2 business days
                  </p>
                </div>

                {/* Success Message */}
                {success && (
                  <div className="mb-6 flex items-start gap-3 rounded-lg border border-green-500/50 bg-green-500/10 p-4">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-green-300">Application submitted successfully!</p>
                      <p className="mt-1 text-xs text-green-400">
                        Our wholesale team will review your application and contact you within 1-2 business days.
                      </p>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Company Name */}
                    <div className="md:col-span-2">
                      <label htmlFor="companyName" className="block text-sm font-medium text-charcoal-200">
                        Company / Institution Name *
                      </label>
                      <input
                        id="companyName"
                        name="companyName"
                        type="text"
                        required
                        value={formData.companyName}
                        onChange={handleChange}
                        className="mt-2 block w-full rounded-lg border border-charcoal-600 bg-charcoal-700/50 px-4 py-3 text-clinical-white placeholder-charcoal-400 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                        placeholder="Research Institute or Company Name"
                      />
                    </div>

                    {/* Contact Name */}
                    <div>
                      <label htmlFor="contactName" className="block text-sm font-medium text-charcoal-200">
                        Contact Person *
                      </label>
                      <input
                        id="contactName"
                        name="contactName"
                        type="text"
                        required
                        value={formData.contactName}
                        onChange={handleChange}
                        className="mt-2 block w-full rounded-lg border border-charcoal-600 bg-charcoal-700/50 px-4 py-3 text-clinical-white placeholder-charcoal-400 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                        placeholder="Dr. Jane Smith"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-charcoal-200">
                        Email Address *
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-2 block w-full rounded-lg border border-charcoal-600 bg-charcoal-700/50 px-4 py-3 text-clinical-white placeholder-charcoal-400 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                        placeholder="procurement@institution.edu"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-charcoal-200">
                        Phone Number *
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="mt-2 block w-full rounded-lg border border-charcoal-600 bg-charcoal-700/50 px-4 py-3 text-clinical-white placeholder-charcoal-400 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    {/* Business Type */}
                    <div>
                      <label htmlFor="businessType" className="block text-sm font-medium text-charcoal-200">
                        Business Type *
                      </label>
                      <select
                        id="businessType"
                        name="businessType"
                        required
                        value={formData.businessType}
                        onChange={handleChange}
                        className="mt-2 block w-full rounded-lg border border-charcoal-600 bg-charcoal-700/50 px-4 py-3 text-clinical-white transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                      >
                        <option value="">Select Type</option>
                        <option value="university">University / Academic Institution</option>
                        <option value="research">Research Laboratory</option>
                        <option value="clinical">Clinical Research Facility</option>
                        <option value="biotech">Biotech / Pharmaceutical Company</option>
                        <option value="distributor">Distributor / Reseller</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Tax ID */}
                    <div>
                      <label htmlFor="taxId" className="block text-sm font-medium text-charcoal-200">
                        Tax ID / EIN *
                      </label>
                      <input
                        id="taxId"
                        name="taxId"
                        type="text"
                        required
                        value={formData.taxId}
                        onChange={handleChange}
                        className="mt-2 block w-full rounded-lg border border-charcoal-600 bg-charcoal-700/50 px-4 py-3 text-clinical-white placeholder-charcoal-400 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                        placeholder="12-3456789"
                      />
                    </div>

                    {/* License Number */}
                    <div>
                      <label htmlFor="licenseNumber" className="block text-sm font-medium text-charcoal-200">
                        Business License Number *
                      </label>
                      <input
                        id="licenseNumber"
                        name="licenseNumber"
                        type="text"
                        required
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        className="mt-2 block w-full rounded-lg border border-charcoal-600 bg-charcoal-700/50 px-4 py-3 text-clinical-white placeholder-charcoal-400 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                        placeholder="BL-123456"
                      />
                    </div>

                    {/* Estimated Monthly Volume */}
                    <div className="md:col-span-2">
                      <label htmlFor="estimatedMonthlyVolume" className="block text-sm font-medium text-charcoal-200">
                        Estimated Monthly Order Volume *
                      </label>
                      <select
                        id="estimatedMonthlyVolume"
                        name="estimatedMonthlyVolume"
                        required
                        value={formData.estimatedMonthlyVolume}
                        onChange={handleChange}
                        className="mt-2 block w-full rounded-lg border border-charcoal-600 bg-charcoal-700/50 px-4 py-3 text-clinical-white transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                      >
                        <option value="">Select Range</option>
                        <option value="$500-$2,499">$500 - $2,499 (10% discount)</option>
                        <option value="$2,500-$9,999">$2,500 - $9,999 (20% discount)</option>
                        <option value="$10,000+">$10,000+ (30% discount)</option>
                      </select>
                    </div>

                    {/* Message */}
                    <div className="md:col-span-2">
                      <label htmlFor="message" className="block text-sm font-medium text-charcoal-200">
                        Additional Information
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        className="mt-2 block w-full rounded-lg border border-charcoal-600 bg-charcoal-700/50 px-4 py-3 text-clinical-white placeholder-charcoal-400 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                        placeholder="Tell us about your research needs, specific product requirements, or any questions..."
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-charcoal-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isLoading ? 'Submitting Application...' : 'Submit Wholesale Application'}
                  </button>
                </form>

                {/* Compliance Notice */}
                <div className="mt-6 rounded-lg border border-charcoal-700/30 bg-charcoal-900/30 p-4">
                  <p className="text-xs text-charcoal-400">
                    By submitting this application, you certify that your organization will use MAHA Peptides
                    products solely for laboratory research purposes and not for human or veterinary consumption.
                    All wholesale accounts are subject to verification and approval.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
