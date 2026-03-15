import type { Metadata } from 'next';
import './globals.css';

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
  return <>{children}</>;
}
