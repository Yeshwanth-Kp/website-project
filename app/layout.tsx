import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "StayFeedback — guest feedback in under a minute",
    template: "%s · StayFeedback",
  },
  description:
    "Turn a QR code at checkout into a 60-second conversation. Guest feedback for hotels, resorts and restaurants, with a dashboard your team will actually open.",
  applicationName: "StayFeedback",
  keywords: [
    "guest feedback",
    "hotel feedback",
    "restaurant feedback",
    "NPS",
    "guest experience",
  ],
  authors: [{ name: "StayFeedback" }],
  openGraph: {
    title: "StayFeedback — guest feedback in under a minute",
    description:
      "A QR code at checkout, a 60-second form, and a dashboard that tells you what to fix this week.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#161311" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
