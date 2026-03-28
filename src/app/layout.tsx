import type { Metadata } from 'next';
import { Inter, Merriweather, Noto_Sans } from 'next/font/google';
import { AppWrappers } from '@/components/AppWrappers';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const notoSans = Noto_Sans({
  variable: '--font-noto',
  subsets: ['latin', 'latin-ext', 'devanagari'],
  weight: ['400', '600', '700'],
  display: 'swap',
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
    <html
      lang="en"
      className={`${inter.variable} ${notoSans.variable} ${merriweather.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&family=Noto+Sans+Kannada:wght@400;600;700&family=Noto+Sans+Malayalam:wght@400;600;700&family=Noto+Sans+Tamil:wght@400;600;700&family=Noto+Sans+Telugu:wght@400;600;700&family=Noto+Sans+Gujarati:wght@400;600;700&family=Noto+Sans+Gurmukhi:wght@400;600;700&family=Noto+Sans+Oriya:wght@400;600;700&family=Noto+Naskh+Arabic:wght@400;600;700&display=swap"
        />
      </head>
      <body className="m-0 flex h-full flex-col overflow-hidden bg-background p-0 font-sans text-foreground">
        <AppWrappers>{children}</AppWrappers>
      </body>
    </html>
  );
}
