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
  description:
    'Turn photos, voice, and notes into structured health, finance, and life actions—powered by Google Gemini. For caregivers, busy households, and anyone bridging messy reality to clear next steps.',
  openGraph: {
    title: 'LifeBridge',
    description:
      'Universal bridge from messy human input to structured, actionable output. Multimodal AI with Google Gemini; Family Mode and sharing with Google Firestore.',
    type: 'website',
  },
};

const themeInitScript = `(function(){try{var t=localStorage.getItem('lifebridge-theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${merriweather.variable} h-full antialiased dark`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="h-full flex flex-col bg-background text-foreground font-sans sm:flex-row m-0 p-0 overflow-hidden">{children}</body>
    </html>
  );
}
