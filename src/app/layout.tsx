import type { Metadata } from 'next';
import { Instrument_Serif, Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-codenest-inter', display: 'swap' });
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-codenest-jakarta',
  display: 'swap',
});
const instrument = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  style: 'italic',
  variable: '--font-codenest-instrument',
  display: 'swap',
});

const appName = process.env.APP_NAME || '职策AI';

export const metadata: Metadata = {
  title: `${appName} - AI Resume Builder`,
  description: 'AI-powered intelligent resume builder with drag-and-drop editor',
  icons: {
    icon: [{ url: '/favicon.svg?v=2', type: 'image/svg+xml' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body className={`${inter.variable} ${jakarta.variable} ${instrument.variable} font-sans antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var b=localStorage.getItem('jadeai-brand');if(b==='boss'){b='mint';localStorage.setItem('jadeai-brand','mint');}else if(b==='jade'){b='blue';localStorage.setItem('jadeai-brand','blue');}if(b==='blue'||b==='pink'){document.documentElement.setAttribute('data-brand',b);}}catch(e){}})();`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
