import React from "react";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 px-6 py-12">
      <section className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-6">
          Contact MycoMiner
        </h1>

        <p className="text-lg text-gray-700 mb-8">
          MycoMiner is a human-authored platform, and we welcome thoughtful questions, collaboration opportunities, and feedback from practitioners, founders, and curious explorers.
        </p>

        <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
        <p className="text-gray-700 mb-8">
          For inquiries related to the platform, system architecture, or future modules, please reach out using the email below. A more interactive contact system will be added as the platform evolves.
        </p>

        <div className="bg-gray-100 p-6 rounded mb-8">
          <p className="text-gray-800 font-mono">
            contact@mycominer.com
          </p>
        </div>

        <a
          href="/"
          className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition"
        >
          Return Home
        </a>
      </section>
    </main>
  );
}
