"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export type HeaderProps = {
  title: string;
  subtitle?: string;
};

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">MAHA Peptides OS</p>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        {subtitle ? <p className="text-sm text-slate-600">{subtitle}</p> : null}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" aria-label="Open navigation">
          <Menu className="h-4 w-4" />
        </Button>
        <Button asChild>
          <Link href="#">Get Support</Link>
        </Button>
      </div>
    </header>
  );
}
