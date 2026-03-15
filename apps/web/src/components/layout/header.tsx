"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, User, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { GlobalSearch } from "@/components/search/global-search";
import { useCart } from "@/contexts/cart-context";

export type HeaderProps = {
  title?: string;
  subtitle?: string;
};

export function Header({ title, subtitle }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount } = useCart();

  return (<header className="sticky top-0 z-50 border-b border-charcoal-700/40 bg-charcoal-900/90 backdrop-blur-md">
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
                  className="h-16 w-auto"
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
                className="hidden h-10 w-10 items-center justify-center rounded-full border border-transparent text-charcoal-300 transition-colors hover:border-charcoal-600/60 hover:bg-charcoal-800/60 hover:text-clinical-white md:flex"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              <Link
                href="/sign-in"
                className="hidden h-10 w-10 items-center justify-center rounded-full border border-transparent text-charcoal-300 transition-colors hover:border-charcoal-600/60 hover:bg-charcoal-800/60 hover:text-clinical-white md:flex"
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </Link>
              <Link
                href="/checkout"
                className="relative hidden h-10 w-10 items-center justify-center rounded-full border border-transparent text-charcoal-300 transition-colors hover:border-charcoal-600/60 hover:bg-charcoal-800/60 hover:text-clinical-white md:flex"
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-[10px] font-bold text-white">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>
              <Button
                asChild
                className="hidden rounded-full bg-accent-500 px-6 font-medium text-white shadow-dark transition-all hover:bg-accent-600 hover:shadow-dark-lg md:inline-flex"
              >
                <Link href="/products">Browse Catalog</Link>
              </Button>

              {/* Mobile Menu Button */}
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-charcoal-300 transition-colors hover:border-charcoal-600/60 hover:bg-charcoal-800/60 hover:text-clinical-white md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="space-y-2 border-t border-charcoal-700/50 py-4 md:hidden">
              <button
                onClick={() => {
                  setSearchOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-clinical-white transition-colors hover:bg-charcoal-800/70"
              >
                <Search className="h-4 w-4" />
                Search
              </button>
              <Link
                href="/products"
                className="block rounded-xl px-4 py-2 text-sm font-medium text-clinical-white transition-colors hover:bg-charcoal-800/70"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                href="/solutions"
                className="block rounded-xl px-4 py-2 text-sm font-medium text-clinical-white transition-colors hover:bg-charcoal-800/70"
                onClick={() => setMobileMenuOpen(false)}
              >
                Solutions
              </Link>
              <Link
                href="/wholesale"
                className="block rounded-xl px-4 py-2 text-sm font-medium text-clinical-white transition-colors hover:bg-charcoal-800/70"
                onClick={() => setMobileMenuOpen(false)}
              >
                Wholesale
              </Link>
              <Link
                href="/contact"
                className="block rounded-xl px-4 py-2 text-sm font-medium text-clinical-white transition-colors hover:bg-charcoal-800/70"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="pt-2 space-y-2">
                <Link
                  href="/checkout"
                  className="flex items-center justify-between rounded-xl px-4 py-2 text-sm font-medium text-clinical-white transition-colors hover:bg-charcoal-800/70"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Cart</span>
                  {itemCount > 0 && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-500 text-xs font-bold text-white">
                      {itemCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/sign-in"
                  className="block rounded-xl px-4 py-2 text-sm font-medium text-clinical-white transition-colors hover:bg-charcoal-800/70"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/products"
                  className="block rounded-full bg-accent-500 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-accent-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Catalog
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>);
}
