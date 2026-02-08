import React from "react";
import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="w-full bg-white border-b border-gray-200 mb-8">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex space-x-6">
          <Link href="/" className="font-semibold text-gray-900 hover:text-gray-700 transition">Home</Link>
          <Link href="/system" className="font-semibold text-gray-900 hover:text-gray-700 transition">System</Link>
          <Link href="/about" className="font-semibold text-gray-900 hover:text-gray-700 transition">About</Link>
          <Link href="/contact" className="font-semibold text-gray-900 hover:text-gray-700 transition">Contact</Link>
        </div>
      </div>
    </nav>
  );
}
