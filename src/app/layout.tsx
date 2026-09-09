import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://nbe-arena.vercel.app"),
  title: {
    default: "NBE Arena — White-Label CBT & AI Mentor Engine",
    template: "%s | NBE Arena",
  },
  description:
    "High-performance white-label Computer Based Test (CBT) platform with Vision AI ingestion, authentic 200-question NBE/SSC mocks, and negative marking analytics.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "NBE Arena — White-Label CBT & AI Mentor Engine",
    description:
      "High-performance white-label Computer Based Test (CBT) platform with Vision AI ingestion, authentic 200-question NBE/SSC mocks, and negative marking analytics.",
    url: "https://nbe-arena.vercel.app",
    siteName: "NBE Arena",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NBE Arena — White-Label CBT Platform",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NBE Arena — White-Label CBT & AI Mentor Engine",
    description:
      "High-performance white-label Computer Based Test (CBT) platform with Vision AI ingestion, authentic 200-question NBE/SSC mocks, and negative marking analytics.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen bg-exam-bg text-exam-text antialiased selection:bg-exam-primary/20">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
