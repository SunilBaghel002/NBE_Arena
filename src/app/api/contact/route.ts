import { NextRequest, NextResponse } from "next/server";
import {
  sendLeadNotificationToAdmin,
  sendConfirmationToClient,
  LeadInquiryData,
} from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, institute, email, phone, batchSize, targetExams, message, tier } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Name, email, and WhatsApp number are required." },
        { status: 400 }
      );
    }

    // Prepare structured lead inquiry object
    const leadInquiry: LeadInquiryData = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: String(name).trim(),
      institute: institute ? String(institute).trim() : "Independent Educator",
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      batchSize: batchSize || "50-200",
      targetExams: Array.isArray(targetExams)
        ? targetExams
        : targetExams
        ? [targetExams]
        : ["NBEMS Jr. Assistant", "SSC CHSL"],
      message: message ? String(message).trim() : "",
      tier: tier || "SaaS Pro",
      receivedAt: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    };

    console.log("[INBOUND LEAD CAPTURE]:", JSON.stringify(leadInquiry, null, 2));

    // Send emails asynchronously (admin notification + client confirmation)
    // We don't block the HTTP response if email fails, ensuring a fast, resilient user experience
    Promise.allSettled([
      sendLeadNotificationToAdmin(leadInquiry),
      sendConfirmationToClient(leadInquiry),
    ]).then((results) => {
      console.log("[EMAIL DISPATCH RESULTS]:", results);
    });

    return NextResponse.json({
      success: true,
      message:
        "Demo request received successfully! Sunil Baghel and our team will connect on WhatsApp within 24 hours.",
      leadId: leadInquiry.id,
    });
  } catch (error) {
    console.error("Error processing contact lead:", error);
    return NextResponse.json(
      { error: "Failed to submit demo request. Please try again or connect directly on WhatsApp." },
      { status: 500 }
    );
  }
}
