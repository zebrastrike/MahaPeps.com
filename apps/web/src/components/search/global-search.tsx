"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Beaker, BookOpen, HelpCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

interface SearchResult {
  type: 'product' | 'blog' | 'faq';
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  relevance: number;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

    try {
      const [productsRes, blogRes, faqRes] = await Promise.all([
        fetch(`${apiBaseUrl}/catalog/products`).catch(() => null),
        fetch(`${apiBaseUrl}/blog`).catch(() => null),
        fetch(`${apiBaseUrl}/faq`).catch(() => null),
      ]);

      const products = productsRes?.ok ? await productsRes.json() : [];
      const blogPosts = blogRes?.ok ? await blogRes.json() : [];
      const faqs = faqRes?.ok ? await faqRes.json() : [];

      const searchLower = searchQuery.toLowerCase();
      const allResults: SearchResult[] = [];

      // Search products
      products.forEach((product: any) => {
        const nameMatch = product.name?.toLowerCase().includes(searchLower);
        const descMatch = product.description?.toLowerCase().includes(searchLower);
        const skuMatch = product.sku?.toLowerCase().includes(searchLower);

        if (nameMatch || descMatch || skuMatch) {
          const relevance = nameMatch ? 100 : skuMatch ? 80 : 50;
          allResults.push({
            type: 'product',
            id: product.id,
            title: product.name,
            subtitle: product.description?.substring(0, 100),
            url: `/products/${product.slug || product.id}`,
            relevance,
          });
        }
      });

      // Search blog posts
      blogPosts.forEach((post: any) => {
        const titleMatch = post.title?.toLowerCase().includes(searchLower);
        const excerptMatch = post.excerpt?.toLowerCase().includes(searchLower);
        const keywordsMatch = post.keywords?.toLowerCase().includes(searchLower);

        if (titleMatch || excerptMatch || keywordsMatch) {
          const relevance = titleMatch ? 100 : keywordsMatch ? 70 : 40;
          allResults.push({
            type: 'blog',
            id: post.id,
            title: post.title,
            subtitle: post.excerpt?.substring(0, 100),
            url: `/blog/${post.slug}`,
            relevance,
          });
        }
      });

      // Search FAQs
      faqs.forEach((faq: any) => {
        const questionMatch = faq.question?.toLowerCase().includes(searchLower);
        const answerMatch = faq.answer?.toLowerCase().includes(searchLower);

        if (questionMatch || answerMatch) {
          const relevance = questionMatch ? 90 : 30;
          allResults.push({
            type: 'faq',
            id: faq.id,
            title: faq.question,
            subtitle: faq.answer?.substring(0, 100),
            url: `/faq#${faq.id}`,
            relevance,
          });
        }
      });

      // Sort by relevance
      allResults.sort((a, b) => b.relevance - a.relevance);
      setResults(allResults.slice(0, 10));
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClose = () => {
    setQuery("");
    setResults([]);
    onClose();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Beaker className="h-4 w-4" />;
      case 'blog':
        return <BookOpen className="h-4 w-4" />;
      case 'faq':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'product':
        return 'Product';
      case 'blog':
        return 'Article';
      case 'faq':
        return 'FAQ';
      default:
        return type;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-charcoal-900/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Search Modal */}
      <div className="fixed inset-x-4 top-20 z-50 mx-auto max-w-3xl md:inset-x-auto">
        <div className="rounded-xl border border-charcoal-700/50 bg-charcoal-800 shadow-2xl">
          {/* Search Input */}
          <div className="flex items-center gap-3 border-b border-charcoal-700/50 p-4">
            <Search className="h-5 w-5 text-charcoal-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, articles, and FAQs..."
              className="flex-1 bg-transparent text-clinical-white placeholder-charcoal-400 outline-none"
            />
            {isSearching && <Loader2 className="h-5 w-5 animate-spin text-accent-400" />}
            <button
              onClick={handleClose}
              className="rounded-md p-1 text-charcoal-400 hover:bg-charcoal-700 hover:text-clinical-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {!query.trim() && (
              <div className="p-8 text-center">
                <Search className="mx-auto mb-3 h-8 w-8 text-charcoal-500" />
                <p className="text-sm text-charcoal-400">
                  Start typing to search products, articles, and FAQs
                </p>
              </div>
            )}

            {query.trim() && !isSearching && results.length === 0 && (
              <div className="p-8 text-center">
                <Search className="mx-auto mb-3 h-8 w-8 text-charcoal-500" />
                <p className="text-sm text-charcoal-400">
                  No results found for &quot;{query}&quot;
                </p>
              </div>
            )}

            {results.length > 0 && (
              <div className="divide-y divide-charcoal-700/50">
                {results.map((result) => (
                  <Link
                    key={`${result.type}-${result.id}`}
                    href={result.url as Route}
                    onClick={handleClose}
                    className="block p-4 transition-colors hover:bg-charcoal-700/50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-accent-500/10 text-accent-400">
                        {getIcon(result.type)}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-sm font-medium text-clinical-white">
                            {result.title}
                          </span>
                          <span className="rounded-full bg-charcoal-700 px-2 py-0.5 text-xs text-charcoal-300">
                            {getTypeLabel(result.type)}
                          </span>
                        </div>
                        {result.subtitle && (
                          <p className="line-clamp-2 text-xs text-charcoal-400">
                            {result.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {results.length > 0 && (
            <div className="border-t border-charcoal-700/50 p-3 text-center">
              <p className="text-xs text-charcoal-400">
                Showing {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
