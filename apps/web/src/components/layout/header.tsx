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

  return (
    <header className="sticky top-0 z-50 border-b border-gold-500/20 bg-navy-900/95 backdrop-blur-md">
      {searchOpen && <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">

          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center transition-opacity hover:opacity-85">
              <Image
                src="/branding/maha-logo.png"
                alt="MAHA Peptides"
                width={180}
                height={65}
                className="h-14 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {[
              { href: "/products",  label: "Products"  },
              { href: "/solutions", label: "Solutions" },
              { href: "/wholesale", label: "Wholesale" },
              { href: "/contact",   label: "Contact"   },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="font-label text-[0.65rem] tracking-widest text-warm-white/70 transition-colors hover:text-gold-400"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden h-9 w-9 items-center justify-center text-warm-white/50 transition-colors hover:text-gold-400 md:flex"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <Link
              href="/sign-in"
              className="hidden h-9 w-9 items-center justify-center text-warm-white/50 transition-colors hover:text-gold-400 md:flex"
              aria-label="Account"
            >
              <User className="h-4 w-4" />
            </Link>
            <Link
              href="/checkout"
              className="relative hidden h-9 w-9 items-center justify-center text-warm-white/50 transition-colors hover:text-gold-400 md:flex"
              aria-label="Cart"
            >
              <ShoppingCart className="h-4 w-4" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[9px] font-bold text-navy-900">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>

            <Button
              asChild
              className="hidden border border-gold-500/60 bg-transparent px-5 py-2 font-label text-[0.6rem] tracking-widest text-gold-400 shadow-none transition-all hover:border-gold-400 hover:bg-gold-500/10 hover:text-gold-300 md:inline-flex"
            >
              <Link href="/products">Browse Catalog</Link>
            </Button>

            {/* Mobile Menu Button */}
            <button
              className="flex h-9 w-9 items-center justify-center text-warm-white/50 transition-colors hover:text-gold-400 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="space-y-1 border-t border-gold-500/15 py-4 md:hidden">
            <button
              onClick={() => { setSearchOpen(true); setMobileMenuOpen(false); }}
              className="flex w-full items-center gap-2 px-4 py-2.5 font-label text-[0.65rem] tracking-widest text-warm-white/60 transition-colors hover:text-gold-400"
            >
              <Search className="h-3.5 w-3.5" />
              Search
            </button>
            {[
              { href: "/products",  label: "Products"  },
              { href: "/solutions", label: "Solutions" },
              { href: "/wholesale", label: "Wholesale" },
              { href: "/contact",   label: "Contact"   },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="block px-4 py-2.5 font-label text-[0.65rem] tracking-widest text-warm-white/60 transition-colors hover:text-gold-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="pt-3 space-y-2 px-4">
              <Link
                href="/checkout"
                className="flex items-center justify-between py-2.5 font-label text-[0.65rem] tracking-widest text-warm-white/60 transition-colors hover:text-gold-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Cart</span>
                {itemCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[9px] font-bold text-navy-900">
                    {itemCount}
                  </span>
                )}
              </Link>
              <Link
                href="/sign-in"
                className="block py-2.5 font-label text-[0.65rem] tracking-widest text-warm-white/60 transition-colors hover:text-gold-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/products"
                className="block border border-gold-500/60 px-4 py-2.5 text-center font-label text-[0.6rem] tracking-widest text-gold-400 transition-colors hover:bg-gold-500/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
