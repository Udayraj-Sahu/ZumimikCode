import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Exam Arena — Competitive Learning Platform",
  description:
    "A competitive battlefield where India's sharpest minds fight, rank, and rise through dynamic exam preparation.",
  keywords: ["exam preparation", "competitive exams", "IIT JEE", "NEET", "UPSC", "online learning", "exam arena", "mock tests"],
  robots: "index, follow",
  metadataBase: new URL("https://examarena.com"),
  alternates: {
    canonical: "https://examarena.com",
  },
  openGraph: {
    title: "Exam Arena — Become the Legend.",
    description:
      "Not a coaching platform. A competitive battlefield where India's sharpest minds fight, rank, and rise.",
    type: "website",
    url: "https://examarena.com",
    siteName: "Exam Arena",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Exam Arena — Competitive Learning Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Exam Arena — Competitive Learning Platform",
    description:
      "Not a coaching platform. A competitive battlefield where India's sharpest minds fight, rank, and rise.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Exam Arena",
      description:
        "A competitive exam preparation platform with dynamic progress maps, rankings, and AI coaching.",
      applicationCategory: "EducationalApplication",
      operatingSystem: "All",
    }),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} overflow-x-hidden`}
    >
      <body>
        <div className="bg-background min-h-screen pb-0">
          <a
            href="#arena"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded focus:text-sm focus:font-semibold"
          >
            Skip to content
          </a>
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 pointer-events-none">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5">
              <polygon
                points="12,2 20,7 20,17 12,22 4,17 4,7"
                fill="none"
                stroke="#C8FF5A"
                strokeWidth="1.5"
                opacity="0.6"
              />
              <circle cx="12" cy="12" r="2" fill="#C8FF5A" opacity="0.4" />
            </svg>
            <span className="font-display text-[10px] tracking-[0.3em] text-primary/60 font-semibold">
              EXAM ARENA
            </span>
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
