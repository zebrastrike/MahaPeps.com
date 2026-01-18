'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, ChevronUp, HelpCircle, Search, MessageSquare } from 'lucide-react';

interface Faq {
  id: string;
  question: string;
  answer: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/faq`);

      if (!response.ok) {
        throw new Error('Failed to fetch FAQs');
      }

      const data = await response.json();
      setFaqs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load FAQs');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Filter FAQs based on search query
  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-500/10">
                <HelpCircle className="h-8 w-8 text-accent-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-clinical-white md:text-5xl">
              Frequently Asked Questions
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-charcoal-300">
              Find answers to common questions about our research-grade peptides, quality standards,
              shipping protocols, and compliance requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="border-b border-charcoal-700/50 bg-charcoal-800/30 py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-5 w-5 text-charcoal-400" />
            </div>
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-lg border border-charcoal-600 bg-charcoal-700/50 py-3 pl-12 pr-4 text-clinical-white placeholder-charcoal-400 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
            />
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-charcoal-400">
              Found {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {isLoading && (
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-accent-500 border-t-transparent"></div>
              <p className="mt-4 text-charcoal-400">Loading FAQs...</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-6 text-center">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {!isLoading && !error && filteredFaqs.length === 0 && (
            <div className="rounded-lg border border-charcoal-700/50 bg-charcoal-800/50 p-12 text-center">
              <Search className="mx-auto h-12 w-12 text-charcoal-500" />
              <p className="mt-4 text-charcoal-400">
                {searchQuery ? 'No FAQs match your search.' : 'No FAQs available.'}
              </p>
            </div>
          )}

          {!isLoading && !error && filteredFaqs.length > 0 && (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div
                  key={faq.id}
                  className="overflow-hidden rounded-xl border border-charcoal-700/50 bg-charcoal-800/90 shadow-glass backdrop-blur-sm transition-all hover:border-accent-500/30"
                >
                  {/* Question Button */}
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="flex w-full items-start justify-between gap-4 p-6 text-left transition-colors hover:bg-charcoal-700/30"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-clinical-white">
                        {faq.question}
                      </h3>
                    </div>
                    <div className="flex-shrink-0">
                      {openIndex === index ? (
                        <ChevronUp className="h-5 w-5 text-accent-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-charcoal-400" />
                      )}
                    </div>
                  </button>

                  {/* Answer Content */}
                  {openIndex === index && (
                    <div className="border-t border-charcoal-700/50 bg-charcoal-900/30 p-6">
                      <p className="text-sm leading-relaxed text-charcoal-300 whitespace-pre-line">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="border-t border-charcoal-700/50 bg-charcoal-800/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-accent-400" />
            <h2 className="mt-4 text-2xl font-bold text-clinical-white">
              Didn&apos;t Find Your Answer?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-charcoal-300">
              Our research support team is here to help with product specifications, bulk ordering,
              COA documentation, and compliance questions.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-accent-600"
            >
              Contact Our Team
            </Link>
          </div>
        </div>
      </section>

      {/* Topics Grid */}
      <section className="border-t border-charcoal-700/50 bg-charcoal-900/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-clinical-white">Browse by Topic</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/products"
              className="group rounded-lg border border-charcoal-700/50 bg-charcoal-800/50 p-6 text-center transition-all hover:border-accent-500/50 hover:bg-charcoal-700/50"
            >
              <h3 className="font-semibold text-clinical-white">Product Catalog</h3>
              <p className="mt-2 text-sm text-charcoal-400">
                Browse our 40+ research peptides
              </p>
            </Link>
            <Link
              href="/solutions"
              className="group rounded-lg border border-charcoal-700/50 bg-charcoal-800/50 p-6 text-center transition-all hover:border-accent-500/50 hover:bg-charcoal-700/50"
            >
              <h3 className="font-semibold text-clinical-white">Research Solutions</h3>
              <p className="mt-2 text-sm text-charcoal-400">
                Academic, clinical & biotech
              </p>
            </Link>
            <Link
              href="/wholesale"
              className="group rounded-lg border border-charcoal-700/50 bg-charcoal-800/50 p-6 text-center transition-all hover:border-accent-500/50 hover:bg-charcoal-700/50"
            >
              <h3 className="font-semibold text-clinical-white">Wholesale Pricing</h3>
              <p className="mt-2 text-sm text-charcoal-400">
                Volume discounts & B2B terms
              </p>
            </Link>
            <Link
              href="/blog"
              className="group rounded-lg border border-charcoal-700/50 bg-charcoal-800/50 p-6 text-center transition-all hover:border-accent-500/50 hover:bg-charcoal-700/50"
            >
              <h3 className="font-semibold text-clinical-white">Research Blog</h3>
              <p className="mt-2 text-sm text-charcoal-400">
                Latest peptide science insights
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
