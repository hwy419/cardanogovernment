import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Navigation, MobileNavigation } from "@/components/layout/navigation";

export const metadata: Metadata = {
  title: "Cardano Governance Platform",
  description: "A comprehensive governance platform for the Cardano blockchain ecosystem that enables participants to view, create, and vote on governance actions while facilitating delegation relationships between stakeholders and Delegate Representatives (DReps).",
  keywords: [
    "Cardano",
    "Governance",
    "Blockchain",
    "DRep",
    "Voting",
    "Proposals",
    "Delegation",
    "ADA",
    "Cryptocurrency"
  ],
  authors: [
    {
      name: "Cardano Governance Platform Team"
    }
  ],
  creator: "Cardano Community",
  publisher: "Cardano Foundation",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://governance.cardano.org",
    title: "Cardano Governance Platform",
    description: "Participate in Cardano's decentralized governance ecosystem",
    siteName: "Cardano Governance Platform",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Cardano Governance Platform"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Cardano Governance Platform",
    description: "Participate in Cardano's decentralized governance ecosystem",
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#1e40af" }
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased min-h-screen flex flex-col`}>
        <Navigation />
        
        <main className="flex-1 pb-16 md:pb-0">
          {children}
        </main>
        
        <MobileNavigation />
        
        {/* Toast notifications would go here */}
        <div id="toast-container" className="fixed bottom-4 right-4 z-50 space-y-2" />
      </body>
    </html>
  );
}
