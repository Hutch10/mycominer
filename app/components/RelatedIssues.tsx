"use client";

import Link from 'next/link';

interface RelatedItem {
  title: string;
  href: string;
}

// Client component for optimal navigation prefetching
export default function RelatedIssues({
  related = [],
}: {
  related?: RelatedItem[];
}) {
  if (related.length === 0) return null;

  return (
    <section className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Related Pages</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {related.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="group p-5 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200 block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                {item.title}
              </h3>
              <svg 
                className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
