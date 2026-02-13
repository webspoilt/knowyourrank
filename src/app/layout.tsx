import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KnowYourRank.in - AI-Powered Exam Analytics Platform",
  description: "Analyze your exam performance with AI-powered insights. Upload CBT URL or OMR sheet to get instant analysis, topic-wise breakdown, and personalized recommendations.",
  keywords: ["exam analysis", "rank predictor", "CBT analysis", "OMR processing", "AI insights", "exam preparation", "SSC", "IBPS", "UPSC", "OSSSC"],
  authors: [{ name: "zeroday" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "KnowYourRank.in - Exam Analytics Platform",
    description: "Know your rank before results. AI-powered exam analysis.",
    url: "https://knowyourrank.in",
    siteName: "KnowYourRank",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KnowYourRank.in",
    description: "Know your rank before results. AI-powered exam analysis.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
