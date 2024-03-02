import './globals.css';
import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Script from 'next/script';
import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import CookieConsentComponent from '@/components/CookieConsentComponent';
import Providers from '../context/providers';

export const metadata: Metadata = {
  title: 'SWOM - Swap your home.',
  description:
    'BE PART OF A HARMONIOUS COOPERATIVE GLOBAL COMMUNITY. Opening your home to others fosters your capacity for trust and generosity.',
  icons: [
    {
      url: '/logo-icons.png',
      rel: 'icon',
      href: '/logo-icons.png',
    },
  ],
  keywords: [
    'swom',
    'swap',
    'home',
    'travel',
    'community',
    'cooperative',
    'global',
    'trust',
    'generosity',
  ].join(', '),
  robots: {
    index: false,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'Travel',
  openGraph: {
    images: [
      {
        url: '/logo-icons.png',
        alt: `Image for SWOM's logo.`,
      },
    ],
    title: 'SWOM - Swap your home.',
    description:
      'BE PART OF A HARMONIOUS COOPERATIVE GLOBAL COMMUNITY. Opening your home to others fosters your capacity for trust and generosity.',
    url: `https://swom.travel/`,
    type: 'website',
    locale: 'en_US',
    siteName: 'SWOM - Swap your home.',
  },
  twitter: {
    title: 'SWOM - Swap your home.',
    site: 'https://swom.travel/',
    card: 'summary_large_image',
    description:
      'BE PART OF A HARMONIOUS COOPERATIVE GLOBAL COMMUNITY. Opening your home to others fosters your capacity for trust and generosity.',
    images: [
      {
        url: '/logo-icons.png',
        alt: `Image for SWOM's logo.`,
      },
    ],
  },

  metadataBase: new URL('https://swom.travel/'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Providers>
        <body className="relative">
          <CookieConsentComponent />
          <Navigation />
          {children}
          <SpeedInsights />
          <Analytics />
          <Footer />
        </body>
      </Providers>
      <Script src="https://player.vimeo.com/api/player.js"></Script>
    </html>
  );
}
