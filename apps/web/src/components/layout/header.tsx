"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, User, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { GlobalSearch } from "@/components/search/global-search";

export type HeaderProps = {
  title?: string;
  subtitle?: string;
};

export function Header({ title, subtitle }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (<header className="sticky top-0 z-50 border-b border-charcoal-700/50 bg-charcoal-900/95 backdrop-blur-sm">
      {searchOpen && <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
                <Image
                  src="/branding/maha-logo.png"
                  alt="MAHA Peptides"
                  width={180}
                  height={65}
                  className="h-16 w-auto [filter:drop-shadow(0_0_8px_rgba(220,38,38,0.6))_drop-shadow(0_0_16px_rgba(255,255,255,0.4))]"
                  priority
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/products"
                className="text-sm font-medium text-clinical-white hover:text-accent-400 transition-colors"
              >
                Products
              </Link>
              <Link
                href="/solutions"
                className="text-sm font-medium text-clinical-white hover:text-accent-400 transition-colors"
              >
                Solutions
              </Link>
              <Link
                href="/wholesale"
                className="text-sm font-medium text-clinical-white hover:text-accent-400 transition-colors"
              >
                Wholesale
              </Link>
              <Link
                href="/contact"
                className="text-sm font-medium text-clinical-white hover:text-accent-400 transition-colors"
              >
                Contact
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden md:flex items-center justify-center h-10 w-10 rounded-md text-charcoal-300 hover:bg-charcoal-800 hover:text-clinical-white transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              <Link
                href="/sign-in"
                className="hidden md:flex items-center justify-center h-10 w-10 rounded-md text-charcoal-300 hover:bg-charcoal-800 hover:text-clinical-white transition-colors"
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </Link>
              <Link
                href="/checkout"
                className="hidden md:flex items-center justify-center h-10 w-10 rounded-md text-charcoal-300 hover:bg-charcoal-800 hover:text-clinical-white transition-colors relative"
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
              </Link>
              <Button
                asChild
                className="hidden md:inline-flex bg-accent-500 text-white hover:bg-accent-600 font-medium px-6"
              >
                <Link href="/products">Browse Catalog</Link>
              </Button>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden flex items-center justify-center h-10 w-10 rounded-md text-charcoal-300 hover:bg-charcoal-800 hover:text-clinical-white transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2 border-t border-charcoal-700/50">
              <button
                onClick={() => {
                  setSearchOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-clinical-white hover:bg-charcoal-800 rounded-md transition-colors"
              >
                <Search className="h-4 w-4" />
                Search
              </button>
              <Link
                href="/products"
                className="block px-4 py-2 text-sm font-medium text-clinical-white hover:bg-charcoal-800 rounded-md transition-colors"
              >
                Products
              </Link>
              <Link
                href="/solutions"
                className="block px-4 py-2 text-sm font-medium text-clinical-white hover:bg-charcoal-800 rounded-md transition-colors"
              >
                Solutions
              </Link>
              <Link
                href="/wholesale"
                className="block px-4 py-2 text-sm font-medium text-clinical-white hover:bg-charcoal-800 rounded-md transition-colors"
              >
                Wholesale
              </Link>
              <Link
                href="/contact"
                className="block px-4 py-2 text-sm font-medium text-clinical-white hover:bg-charcoal-800 rounded-md transition-colors"
              >
                Contact
              </Link>
              <div className="pt-2 space-y-2">
                <Link
                  href="/sign-in"
                  className="block px-4 py-2 text-sm font-medium text-clinical-white hover:bg-charcoal-800 rounded-md transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/products"
                  className="block px-4 py-2 text-sm font-medium bg-accent-500 text-white hover:bg-accent-600 rounded-md transition-colors text-center"
                >
                  Browse Catalog
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>);
}
