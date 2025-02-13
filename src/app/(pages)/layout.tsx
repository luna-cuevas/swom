import "./globals.css";
import type { Metadata } from "next";
import Navigation from "@/components/navigation/Navigation";
import Footer from "@/components/Footer";
import Script from "next/script";
import React from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import CookieConsentComponent from "@/components/CookieConsentComponent";
import Providers from "@/context/providers";
import { GoogleAnalytics } from "@next/third-parties/google";
import HotjarInit from "@/components/HotjarInit";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SignIn from "@/components/navigation/SignIn";

export const metadata: Metadata = {
  title: `SWOM - Swap your home. - ${process.env.NEXT_PUBLIC_VERCEL_ENV === "dev" && "[Development]"}`,
  description:
    "BE PART OF A HARMONIOUS COOPERATIVE GLOBAL COMMUNITY. Opening your home to others fosters your capacity for trust and generosity.",
  icons: [
    {
      url: "/logo-icons.png",
      rel: "icon",
      href: "/logo-icons.png",
    },
  ],
  keywords: [
    "swom",
    "swap",
    "home",
    "travel",
    "community",
    "cooperative",
    "global",
    "trust",
    "generosity",
  ].join(", "),
  robots: {
    index: process.env.NEXT_PUBLIC_VERCEL_ENV !== "dev" ? true : false,
    follow: process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ? true : false,
    googleBot: {
      index: process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ? true : false,
      follow:
        process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ? true : false,
    },
  },
  category: "Travel",
  openGraph: {
    images: [
      {
        url: "/logo-icons.png",
        alt: `Image for SWOM's logo.`,
      },
    ],
    title: "SWOM - Swap your home.",
    description:
      "BE PART OF A HARMONIOUS COOPERATIVE GLOBAL COMMUNITY. Opening your home to others fosters your capacity for trust and generosity.",
    url: `https://swom.travel/`,
    type: "website",
    locale: "en_US",
    siteName: "SWOM - Swap your home.",
  },
  twitter: {
    title: "SWOM - Swap your home.",
    site: "https://swom.travel/",
    card: "summary_large_image",
    description:
      "BE PART OF A HARMONIOUS COOPERATIVE GLOBAL COMMUNITY. Opening your home to others fosters your capacity for trust and generosity.",
    images: [
      {
        url: "/logo-icons.png",
        alt: `Image for SWOM's logo.`,
      },
    ],
  },

  metadataBase: new URL("https://swom.travel/"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.0.1/dist/cookieconsent.css"
        />
        {/* Google Ads Tag */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-16836227126"
          strategy="afterInteractive"
        />
        <Script id="google-ads" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-16836227126');
          `}
        </Script>

        {/* Meta Pixel Code */}
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1157468905904106');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1157468905904106&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </head>
      <GoogleAnalytics gaId="G-Z15K7DHQM2" />
      <Providers>
        <body className="relative">
          {/* <CookieConsentComponent /> */}
          <HotjarInit />
          <Navigation />
          {children}
          <SpeedInsights />
          <Analytics />
          <Footer />
          <SignIn />

          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            limit={5}
          />
        </body>
      </Providers>
      <Script type="module" src="cookie-consent-config.js"></Script>
      <Script src="https://player.vimeo.com/api/player.js"></Script>
    </html>
  );
}
