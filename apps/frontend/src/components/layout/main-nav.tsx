import Link from "next/link";

import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/catalog", label: "Catalog" },
  { href: "/client/dashboard", label: "Client" },
  { href: "/clinic/dashboard", label: "Clinic" },
  { href: "/distributor/dashboard", label: "Distributor" },
  { href: "/admin/dashboard", label: "Admin" },
];

export function MainNav() {
  return (
    <header className="border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-semibold">
          MAHA Peptides OS
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-muted-foreground hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/catalog">Explore Catalog</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
