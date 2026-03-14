import type { Metadata } from 'next';
import { Geist_Mono, Nunito, Poppins } from 'next/font/google';
import './globals.css';

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com'
  ),
  title: {
    default: 'Pedagogisch Advies | Kind- en Gezinsbegeleiding',
    template: '%s | Pedagogisch Advies',
  },
  description:
    'Professionele pedagogische begeleiding voor kinderen en gezinnen. Individuele consulten, groepsworkshops, kindbeoordelingen en ondersteuning voor scholen.',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'Pedagogisch Advies',
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html suppressHydrationWarning>
      <body
        className={`${nunito.variable} ${poppins.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
