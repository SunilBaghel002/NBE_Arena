import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LandingView } from "@/components/landing/LandingView";

export const metadata = {
  title: "NBE Arena — White-Label CBT Engine & AI Exam Mentor",
  description:
    "White-label Computer-Based Test (CBT) platform with Vision AI ingestion, authentic 200-question NBE/SSC mocks, 180-min countdown timer, and strict -0.25 negative marking analytics.",
  openGraph: {
    title: "NBE Arena — White-Label CBT Engine & AI Exam Mentor",
    description:
      "Empower coaching institutes with authentic 200-question CBT mock exams, automated PYQ PDF ingestion, -0.25 negative marking, and Groq-powered AI diagnostics.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NBE Arena CBT Simulation Platform",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NBE Arena — White-Label CBT Engine & AI Exam Mentor",
    description:
      "Authentic 200-question CBT mock exams, automated PYQ PDF ingestion, -0.25 negative marking, and Groq-powered AI diagnostics.",
    images: ["/og-image.png"],
  },
};

export default async function HomePage() {
  // If user is already authenticated, redirect directly to /dashboard with zero flash
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  // Otherwise, render the public B2B marketing landing page
  return <LandingView />;
}
