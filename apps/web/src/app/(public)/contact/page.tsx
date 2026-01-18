'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, MapPin, Send, AlertCircle, CheckCircle, Loader2, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit contact form');
      }

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting the form');
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
              Contact Our Research Team
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-charcoal-300">
              Have questions about our pharmaceutical-grade peptides or need support with your research project?
              Our team of experts is here to help with product specifications, bulk ordering, and technical guidance.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information & Form Section */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Contact Information Cards */}
            <div className="space-y-6">
              {/* Email Card */}
              <div className="rounded-xl border border-charcoal-700/50 bg-charcoal-800/90 p-6 shadow-glass backdrop-blur-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-500/10 text-accent-400">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-clinical-white">Email Us</h3>
                <p className="mb-3 text-sm text-charcoal-300">
                  For research inquiries, product questions, and technical support
                </p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-charcoal-400">General Inquiries</p>
                    <a
                      href="mailto:info@mahapeps.com"
                      className="text-sm font-medium text-accent-400 hover:text-accent-300"
                    >
                      info@mahapeps.com
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-charcoal-400">Sales & Wholesale</p>
                    <a
                      href="mailto:sales@mahapeps.com"
                      className="text-sm font-medium text-accent-400 hover:text-accent-300"
                    >
                      sales@mahapeps.com
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-charcoal-400">Customer Support</p>
                    <a
                      href="mailto:support@mahapeps.com"
                      className="text-sm font-medium text-accent-400 hover:text-accent-300"
                    >
                      support@mahapeps.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Response Time Card */}
              <div className="rounded-xl border border-charcoal-700/50 bg-charcoal-800/90 p-6 shadow-glass backdrop-blur-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-500/10 text-accent-400">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-clinical-white">Quick Response</h3>
                <p className="mb-3 text-sm text-charcoal-300">
                  Our team responds to all inquiries within 24 hours
                </p>
                <p className="text-sm text-accent-400 font-medium">
                  Use the form to send us a message
                </p>
                <p className="mt-2 text-xs text-charcoal-400">
                  Business hours: Mon-Fri 9AM - 6PM MST
                </p>
              </div>

              {/* Location Card */}
              <div className="rounded-xl border border-charcoal-700/50 bg-charcoal-800/90 p-6 shadow-glass backdrop-blur-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-500/10 text-accent-400">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-clinical-white">Location</h3>
                <p className="mb-3 text-sm text-charcoal-300">
                  American-made peptides from our USA-based laboratory
                </p>
                <p className="text-sm text-charcoal-400">
                  United States<br />
                  Pharmaceutical Research Facility
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-charcoal-700/50 bg-charcoal-800/90 p-8 shadow-glass backdrop-blur-sm">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-clinical-white">Send Us a Message</h2>
                  <p className="mt-2 text-sm text-charcoal-300">
                    Fill out the form below and our research team will respond within 24 hours
                  </p>
                </div>

                {/* Success Message */}
                {success && (
                  <div className="mb-6 flex items-start gap-3 rounded-lg border border-green-500/50 bg-green-500/10 p-4">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-green-300">Message sent successfully!</p>
                      <p className="mt-1 text-xs text-green-400">
                        Thank you for contacting us. We&apos;ll get back to you soon.
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
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-charcoal-200">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-lg border border-charcoal-600 bg-charcoal-700/50 px-4 py-3 text-clinical-white placeholder-charcoal-400 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                      placeholder="Dr. John Smith"
                    />
                  </div>

                  {/* Email Field */}
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
                      placeholder="research@institution.edu"
                    />
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-charcoal-200">
                      Phone Number (Optional)
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-lg border border-charcoal-600 bg-charcoal-700/50 px-4 py-3 text-clinical-white placeholder-charcoal-400 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  {/* Subject Field */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-charcoal-200">
                      Subject *
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-lg border border-charcoal-600 bg-charcoal-700/50 px-4 py-3 text-clinical-white placeholder-charcoal-400 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                      placeholder="Product inquiry, bulk ordering, technical support..."
                    />
                  </div>

                  {/* Message Field */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-charcoal-200">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-lg border border-charcoal-600 bg-charcoal-700/50 px-4 py-3 text-clinical-white placeholder-charcoal-400 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                      placeholder="Tell us about your research needs, product questions, or how we can assist you..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-charcoal-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isLoading ? 'Sending...' : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>

                {/* Compliance Notice */}
                <div className="mt-6 rounded-lg border border-charcoal-700/30 bg-charcoal-900/30 p-4">
                  <p className="text-xs text-charcoal-400">
                    By submitting this form, you acknowledge that MAHA Peptides products are intended for laboratory research use only and not for human or veterinary consumption. All inquiries are subject to our compliance and regulatory policies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Teaser Section */}
      <section className="border-t border-charcoal-700/50 bg-charcoal-800/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-accent-400" />
            <h2 className="mt-4 text-2xl font-bold text-clinical-white">
              Have a Quick Question?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-charcoal-300">
              Check out our comprehensive FAQ section for immediate answers about peptide purity standards,
              COA documentation, shipping protocols, and research compliance requirements.
            </p>
            <Link
              href="/faq"
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-accent-500 px-6 py-3 text-sm font-semibold text-accent-400 transition-all hover:bg-accent-500 hover:text-white"
            >
              Visit FAQ Section
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
