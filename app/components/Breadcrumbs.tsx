"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

type Crumb = {
  label: string;
  href: string;
};

export default function Breadcrumbs({
  items,
}: {
  items?: Crumb[];
}) {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  const derived = parts.map((part: string, index: number) => {
    const href = "/" + parts.slice(0, index + 1).join("/");
    const label = part
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c: string) => c.toUpperCase());

    return { href, label };
  });

  const crumbs = items && items.length > 0 ? items : derived;

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-600 dark:text-gray-400 mb-6">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link 
            href="/" 
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded px-1"
          >
            Home
          </Link>
        </li>

        {crumbs.map((crumb: Crumb, i: number) => (
          <li key={i} className="flex items-center gap-2">
            <span className="text-gray-400 dark:text-gray-600" aria-hidden="true">/</span>
            <Link 
              href={crumb.href} 
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded px-1"
              aria-current={i === crumbs.length - 1 ? "page" : undefined}
            >
              {crumb.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}