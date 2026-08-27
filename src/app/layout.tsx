import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "NBE ARENA — NBEMS Junior Assistant CBT Platform",
  description: "Authentic Computer-Based Test (CBT) mock simulation for NBEMS Junior Assistant Exam (200 Questions, 180 Minutes, 4 Sections).",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
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
