import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Script from "next/script";
import CookieConsent from "@/components/cookie-consent";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://aiempire-one.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "AI Empire – 45 Powerful AI Tools in One Platform",
    template: "%s | AI Empire",
  },
  description:
    "AI Empire is your all-in-one AI toolkit with 45 powerful tools including code auditing, image generation, document analysis, chatbots, voice synthesis, SEO optimization, and more. Start free today.",
  keywords: [
    "AI tools", "artificial intelligence", "AI platform", "code audit", "AI image generator",
    "document analysis", "AI chatbot", "voice synthesis", "SEO tools", "AI writing assistant",
    "data analysis", "AI meme generator", "stock analysis AI", "AI productivity tools",
    "machine learning tools", "AI Empire",
  ],
  authors: [{ name: "AI Empire" }],
  creator: "AI Empire",
  publisher: "AI Empire",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "AI Empire",
    title: "AI Empire – 45 Powerful AI Tools in One Platform",
    description:
      "Your all-in-one AI toolkit with 45 powerful tools. Code auditing, image generation, document analysis, chatbots, and more. Start free today.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Empire – 45 AI Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Empire – 45 Powerful AI Tools in One Platform",
    description:
      "Your all-in-one AI toolkit with 45 powerful tools. Start free today.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  metadataBase: new URL(SITE_URL),
};

export const dynamic = "force-dynamic";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "AI Empire",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  description:
    "AI Empire is your all-in-one AI toolkit with 45 powerful tools including code auditing, image generation, document analysis, chatbots, voice synthesis, SEO optimization, and more.",
  offers: [
    {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free tier with 1 free scan per tool and token earning",
    },
    {
      "@type": "Offer",
      price: "29.99",
      priceCurrency: "USD",
      description: "Basic Plan – Access to 10 AI apps",
    },
    {
      "@type": "Offer",
      price: "59.99",
      priceCurrency: "USD",
      description: "Pro Plan – Access to 25 AI apps",
    },
    {
      "@type": "Offer",
      price: "99.99",
      priceCurrency: "USD",
      description: "Ultimate Plan – Access to all 45 AI apps",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "1250",
    bestRating: "5",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#6366f1" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js" async />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>{children}</Providers>
        <CookieConsent />
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
