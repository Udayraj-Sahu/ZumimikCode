import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { OnlineProvider } from "@/providers/online-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { CapacitorInit } from "./capacitor-init";
import { AppEntry } from "@/components/ui/app-entry";

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
  },
  twitter: {
    card: "summary_large_image",
    title: "Exam Arena — Competitive Learning Platform",
    description:
      "Not a coaching platform. A competitive battlefield where India's sharpest minds fight, rank, and rise.",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  other: {
    "theme-color": "#C8FF5A",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("exam-arena-theme");if(t){var o=JSON.parse(t);if(o&&o.state&&o.state.theme==="light")document.documentElement.classList.add("light")}}catch(e){}})()`,
          }}
        />
        <style>{`:root{--background:#050505;--foreground:#fff}`}</style>
        <div className="bg-background min-h-screen pb-0 overflow-x-clip" id="main-content">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded focus:text-sm focus:font-semibold"
          >
            Skip to content
          </a>
          <script
            type="application/ld+json"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                name: "Exam Arena",
                description:
                  "A competitive exam preparation platform with dynamic progress maps, rankings, and AI coaching.",
                applicationCategory: "EducationalApplication",
                operatingSystem: "All",
              }),
            }}
          />
          <QueryProvider>
            <OnlineProvider>
              <ThemeProvider>
                <CapacitorInit />
                <AppEntry>{children}</AppEntry>
              </ThemeProvider>
            </OnlineProvider>
          </QueryProvider>
        </div>
      </body>
    </html>
  );
}
