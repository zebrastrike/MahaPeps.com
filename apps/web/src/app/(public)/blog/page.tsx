'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Calendar, ArrowRight, Search } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  keywords: string | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/blog`);

      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }

      const data = await response.json();
      setPosts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load blog posts');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter posts based on search query
  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.keywords && post.keywords.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-500/10">
                <BookOpen className="h-8 w-8 text-accent-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-clinical-white md:text-5xl">
              Peptide Research Insights
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-charcoal-300">
              Stay informed with the latest developments in peptide science, research methodologies,
              quality standards, and therapeutic applications from MAHA Peptides.
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
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-lg border border-charcoal-600 bg-charcoal-700/50 py-3 pl-12 pr-4 text-clinical-white placeholder-charcoal-400 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
            />
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-charcoal-400">
              Found {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading && (
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-accent-500 border-t-transparent"></div>
              <p className="mt-4 text-charcoal-400">Loading articles...</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-6 text-center">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {!isLoading && !error && filteredPosts.length === 0 && (
            <div className="rounded-lg border border-charcoal-700/50 bg-charcoal-800/50 p-12 text-center">
              <Search className="mx-auto h-12 w-12 text-charcoal-500" />
              <p className="mt-4 text-charcoal-400">
                {searchQuery ? 'No articles match your search.' : 'No blog posts available.'}
              </p>
            </div>
          )}

          {!isLoading && !error && filteredPosts.length > 0 && (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="group overflow-hidden rounded-xl border border-charcoal-700/50 bg-charcoal-800/90 shadow-glass backdrop-blur-sm transition-all hover:border-accent-500/50 hover:shadow-accent-glow"
                >
                  {/* Featured Image */}
                  {post.featuredImage ? (
                    <div className="aspect-video w-full overflow-hidden bg-charcoal-700">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-gradient-to-br from-accent-500/20 to-accent-600/20">
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-12 w-12 text-accent-400/50" />
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    {/* Date */}
                    <div className="mb-3 flex items-center gap-2 text-xs text-charcoal-400">
                      <Calendar className="h-4 w-4" />
                      <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                    </div>

                    {/* Title */}
                    <h2 className="mb-3 text-xl font-bold text-clinical-white transition-colors group-hover:text-accent-400">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="mb-4 line-clamp-3 text-sm text-charcoal-300">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Read More Link */}
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-accent-400 transition-all hover:gap-3 hover:text-accent-300"
                    >
                      Read Article
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="border-t border-charcoal-700/50 bg-charcoal-800/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-accent-500/30 bg-gradient-to-br from-charcoal-800 to-charcoal-900 p-12 text-center shadow-accent-glow">
            <h2 className="mb-4 text-3xl font-bold text-clinical-white">
              Stay Updated on Peptide Research
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-charcoal-300">
              Explore our full research catalog, learn about quality standards, and discover how
              MAHA Peptides supports scientific innovation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-accent-600 hover:shadow-xl"
              >
                Browse Catalog
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg border border-accent-500 px-8 py-4 text-base font-semibold text-accent-400 transition-all hover:bg-accent-500 hover:text-white"
              >
                Contact Our Team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
