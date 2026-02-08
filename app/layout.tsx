import './globals.css';
import React from 'react';

export const metadata = {
  title: 'MycoMiner: Multi-Agent Intelligence Platform',
  description: 'Human-crafted mushroom intelligence with multi-agent orchestration, policy governance, and full explainability.',
  openGraph: {
    title: 'MycoMiner: Multi-Agent Intelligence Platform',
    description: 'Human-crafted mushroom intelligence with multi-agent orchestration.',
    url: 'https://mycominer.com',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}