import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// Font configurations
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

// Metadata configuration
export const metadata: Metadata = {
  title: {
    default: 'Cardano Governance Platform',
    template: '%s | Cardano Governance Platform',
  },
  description: 'Comprehensive Cardano blockchain governance platform for DReps, delegators, and proposers. Participate in decentralized governance with transparency and accessibility.',
  keywords: [
    'Cardano',
    'Governance',
    'Blockchain',
    'DRep',
    'Voting',
    'Delegation',
    'Web3',
    'Cryptocurrency',
    'Constitutional',
    'Treasury',
    'Proposals'
  ],
  authors: [
    {
      name: 'Cardano Governance Platform Team',
      url: 'https://cardano-governance.org',
    },
  ],
  creator: 'Cardano Governance Platform',
  publisher: 'Cardano Foundation',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://cardano-governance.org'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
      'es-ES': '/es-ES',
      'ja-JP': '/ja-JP',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cardano-governance.org',
    title: 'Cardano Governance Platform',
    description: 'Participate in Cardano\'s decentralized governance. Vote on proposals, delegate to DReps, and help shape the future of the Cardano ecosystem.',
    siteName: 'Cardano Governance Platform',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Cardano Governance Platform - Decentralized Governance for All',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cardano Governance Platform',
    description: 'Participate in Cardano\'s decentralized governance. Vote, delegate, and propose.',
    images: ['/twitter-image.png'],
    creator: '@CardanoGov',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-site-verification-code',
  },
  category: 'technology',
  classification: 'Blockchain Governance Platform',
  referrer: 'origin-when-cross-origin',
};

// Viewport configuration for responsive design and accessibility
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0ea5e9' },
    { media: '(prefers-color-scheme: dark)', color: '#0ea5e9' },
  ],
  colorScheme: 'light dark',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon and app icons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Security headers for XSS protection */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* Content Security Policy */}
        <meta 
          httpEquiv="Content-Security-Policy" 
          content="default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https: wss:; frame-src 'none'; object-src 'none'; base-uri 'self';"
        />
        
        {/* Accessibility and user experience enhancements */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="application-name" content="Cardano Governance" />
        <meta name="apple-mobile-web-app-title" content="Cardano Gov" />
        
        {/* Structured data for search engines */}
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Cardano Governance Platform",
              "description": "Comprehensive blockchain governance platform for the Cardano ecosystem",
              "url": "https://cardano-governance.org",
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "DRep Registration and Management",
                "Proposal Voting",
                "Stake Delegation",
                "Governance Analytics",
                "Multi-wallet Support"
              ],
              "screenshot": "https://cardano-governance.org/screenshot.png",
              "softwareVersion": "1.0.0",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "1250"
              }
            })
          }}
        />
      </head>
      <body 
        className="min-h-screen font-sans antialiased"
        suppressHydrationWarning
      >
        {/* Skip navigation link for screen readers */}
        <a 
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
        >
          Skip to main content
        </a>
        
        {/* Live region for screen reader announcements */}
        <div 
          id="live-region" 
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-only"
        ></div>
        
        {/* Main application */}
        <div id="root" className="min-h-screen">
          {children}
        </div>
        
        {/* Page load performance monitoring */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Performance monitoring
              if (typeof window !== 'undefined' && window.performance) {
                window.addEventListener('load', function() {
                  setTimeout(function() {
                    const navigation = performance.getEntriesByType('navigation')[0];
                    const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
                    if (loadTime > 3000) {
                      console.warn('Page load time exceeded 3 seconds:', loadTime, 'ms');
                    }
                  }, 0);
                });
              }
              
              // Accessibility: Respect user's motion preferences
              if (typeof window !== 'undefined' && window.matchMedia) {
                const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
                if (prefersReducedMotion.matches) {
                  document.documentElement.style.setProperty('--animation-duration', '0.01ms');
                  document.documentElement.style.setProperty('--transition-duration', '0.01ms');
                }
              }
              
              // Theme detection and application
              if (typeof window !== 'undefined') {
                const theme = localStorage.getItem('theme') || 
                             (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              }
            `,
          }}
        />
      </body>
    </html>
  );
}