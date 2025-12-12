import Link from "next/link";

export type NavigationItem = {
  label: string;
  href: string;
};

type NavigationProps = {
  items: NavigationItem[];
  description?: string;
};

export function Navigation({ items, description }: NavigationProps) {
  return (
    <nav className="border-b border-slate-200 bg-slate-50 px-6 py-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700">Navigation</p>
          {description ? <p className="text-sm text-slate-600">{description}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 transition hover:border-brand hover:text-brand"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
