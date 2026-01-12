'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ArrowLeft, BookOpen, Share2 } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  keywords: string | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/blog/${slug}`);

      if (!response.ok) {
        throw new Error('Blog post not found');
      }

      const data = await response.json();
      setPost(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load blog post');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-charcoal-900 to-charcoal-800">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-accent-500 border-t-transparent"></div>
          <p className="mt-4 text-charcoal-400">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-charcoal-900 to-charcoal-800 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-12 text-center">
            <p className="mb-6 text-lg text-red-300">{error || 'Blog post not found'}</p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-accent-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal-900 to-charcoal-800">
      {/* Header/Back Link */}
      <section className="border-b border-charcoal-700/50 bg-charcoal-900/50 py-6">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent-400 transition-colors hover:text-accent-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </div>
      </section>

      {/* Article Header */}
      <article className="py-12 lg:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Link href="/">
              <Image
                src="/branding/maha-logo.png"
                alt="MAHA Peptides"
                width={150}
                height={50}
                className="h-12 w-auto [filter:drop-shadow(0_0_8px_rgba(220,38,38,0.6))_drop-shadow(0_0_16px_rgba(255,255,255,0.4))]"
              />
            </Link>
          </div>

          {/* Title */}
          <h1 className="mb-6 text-4xl font-bold text-clinical-white md:text-5xl">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-charcoal-400">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            </div>
            <span>•</span>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>{calculateReadTime(post.content)}</span>
            </div>
          </div>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="mb-12 overflow-hidden rounded-xl">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="h-auto w-full object-cover"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-invert max-w-none">
            <div className="space-y-6 text-base leading-relaxed text-charcoal-200">
              {post.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-charcoal-200">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Keywords/Tags */}
          {post.keywords && (
            <div className="mt-12 border-t border-charcoal-700/50 pt-8">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-charcoal-400">
                Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.keywords.split(',').map((keyword, index) => (
                  <span
                    key={index}
                    className="rounded-full border border-charcoal-700 bg-charcoal-800/50 px-4 py-2 text-xs font-medium text-charcoal-300"
                  >
                    {keyword.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Share Section */}
          <div className="mt-12 border-t border-charcoal-700/50 pt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-charcoal-400">
                Share Article
              </h3>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: post.title,
                      text: post.excerpt || post.title,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-charcoal-700 bg-charcoal-800/50 px-4 py-2 text-sm font-medium text-charcoal-300 transition-all hover:border-accent-500 hover:text-accent-400"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Related/CTA Section */}
      <section className="border-t border-charcoal-700/50 bg-charcoal-800/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold text-clinical-white">
              Explore Our Research Catalog
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-sm text-charcoal-300">
              Browse 40+ pharmaceutical-grade research peptides manufactured to the highest
              quality standards with complete COA documentation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-accent-600"
              >
                Browse Products
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-lg border border-accent-500 px-8 py-3 text-sm font-semibold text-accent-400 transition-all hover:bg-accent-500 hover:text-white"
              >
                More Articles
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
