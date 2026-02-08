import Link from 'next/link';

// Server Component - no client-side JS needed
export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="w-full border-t bg-gray-50 dark:bg-gray-800 dark:border-gray-700 mt-16">
      <div className="max-w-5xl mx-auto p-6 text-center text-gray-700 dark:text-gray-300">
        <p className="text-lg font-semibold">Mycology Guide</p>

        <div className="flex justify-center space-x-6 mt-4 text-lg">
          <Link href="/foundations" className="hover:underline hover:text-gray-900 dark:hover:text-gray-100">
            Foundations
          </Link>
          <Link href="/growing-guides" className="hover:underline hover:text-gray-900 dark:hover:text-gray-100">
            Growing Guides
          </Link>
          <Link href="/troubleshooting" className="hover:underline hover:text-gray-900 dark:hover:text-gray-100">
            Troubleshooting
          </Link>
          <Link href="/medicinal-mushrooms" className="hover:underline hover:text-gray-900 dark:hover:text-gray-100">
            Medicinal
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          © {year} Mycology Guide — Educational content for growers.
        </p>
      </div>
    </footer>
  );
}