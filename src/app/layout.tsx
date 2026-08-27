import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NBE Arena — NBE Junior Assistant CBT Platform",
  description: "Authentic Computer-Based Test (CBT) mock simulation for NBEMS Junior Assistant Exam (200 Questions, 180 Minutes, 4 Sections).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-exam-bg text-exam-text antialiased selection:bg-exam-primary/20">
        {children}
      </body>
    </html>
  );
}
