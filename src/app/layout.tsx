import type { Metadata } from 'next';
import { Inter, Merriweather } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const merriweather = Merriweather({
  variable: '--font-merriweather',
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LifeBridge',
  description: 'A universal bridge between messy human intent and structured life-serving actions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${merriweather.variable} h-full antialiased`}>
      <body className="h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] font-sans sm:flex-row m-0 p-0 overflow-hidden">{children}</body>
    </html>
  );
}
