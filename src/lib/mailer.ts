import nodemailer from "nodemailer";

export interface LeadInquiryData {
  id: string;
  name: string;
  institute: string;
  email: string;
  phone: string;
  batchSize: string;
  targetExams: string[];
  message?: string;
  tier: string;
  receivedAt: string;
}

/**
 * Creates Nodemailer SMTP transporter using environment credentials
 */
function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER || "sunilbaghel93100@gmail.com";
  const pass = process.env.SMTP_PASS;

  if (!pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Dispatches a comprehensive lead alert to Sunil Baghel's email
 */
export async function sendLeadNotificationToAdmin(lead: LeadInquiryData) {
  const transporter = getTransporter();
  const adminEmail = process.env.NOTIFICATION_EMAIL || "sunilbaghel93100@gmail.com";
  const senderUser = process.env.SMTP_USER || "sunilbaghel93100@gmail.com";

  if (!transporter) {
    console.warn(
      "[MAILER WARNING]: SMTP_PASS is not configured in .env yet. Lead email notification logged instead:\n",
      lead
    );
    return { sent: false, reason: "SMTP_PASS not configured in .env" };
  }

  const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
  const whatsappNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hi ${lead.name}, thank you for requesting a demo for ${lead.institute || "your academy"} on NBE Arena. I am Sunil Baghel, founder of NBE Arena. Let's schedule your 30-minute walkthrough!`
  )}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #1d4ed8, #4338ca); color: #ffffff; padding: 24px 28px; }
          .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
          .title { font-size: 20px; font-weight: 800; margin: 0; }
          .body { padding: 28px; }
          .grid { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          .grid td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
          .label { font-weight: bold; color: #64748b; width: 35%; }
          .value { font-weight: 600; color: #0f172a; }
          .highlight { color: #2563eb; font-weight: 800; }
          .message-box { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 14px 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px; font-size: 13px; color: #334155; line-height: 1.6; }
          .cta-btn { display: inline-block; background: #16a34a; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-size: 13px; font-weight: bold; text-align: center; margin-right: 12px; }
          .email-btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-size: 13px; font-weight: bold; text-align: center; }
          .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; font-size: 11px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">New Inbound Demo Lead</span>
            <h1 class="title">Demo Request: ${lead.institute || lead.name}</h1>
          </div>
          <div class="body">
            <p style="font-size: 14px; margin-top: 0; color: #475569;">
              A coaching academy director / educator just submitted a demo request for the <strong>${lead.tier}</strong> plan on NBE Arena.
            </p>

            <table class="grid">
              <tr>
                <td class="label">Candidate / Director:</td>
                <td class="value">${lead.name}</td>
              </tr>
              <tr>
                <td class="label">Coaching Institute:</td>
                <td class="value">${lead.institute || "Independent Educator"}</td>
              </tr>
              <tr>
                <td class="label">Email Address:</td>
                <td class="value"><a href="mailto:${lead.email}" style="color: #2563eb;">${lead.email}</a></td>
              </tr>
              <tr>
                <td class="label">WhatsApp Number:</td>
                <td class="value"><a href="tel:${lead.phone}" style="color: #059669; font-weight: bold;">${lead.phone}</a></td>
              </tr>
              <tr>
                <td class="label">Requested Plan:</td>
                <td class="value highlight">${lead.tier}</td>
              </tr>
              <tr>
                <td class="label">Student Batch Size:</td>
                <td class="value">${lead.batchSize}</td>
              </tr>
              <tr>
                <td class="label">Target Exams:</td>
                <td class="value">${lead.targetExams.join(", ")}</td>
              </tr>
              <tr>
                <td class="label">Lead ID:</td>
                <td class="value" style="font-family: monospace; font-size: 11px;">${lead.id}</td>
              </tr>
            </table>

            ${
              lead.message
                ? `
              <div style="font-size: 12px; font-weight: bold; color: #475569; margin-bottom: 6px;">Client Requirements / PYQ PDFs:</div>
              <div class="message-box">"${lead.message}"</div>
            `
                : ""
            }

            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9;">
              <a href="${whatsappUrl}" class="cta-btn" target="_blank">
                📱 Message on WhatsApp Now
              </a>
              <a href="mailto:${lead.email}?subject=NBE%20Arena%20Institutional%20Demo%20Walkthrough&body=Hi%20${encodeURIComponent(
    lead.name
  )}%2C%0A%0AThank%20you%20for%20requesting%20a%20demo%20call%20for%20${encodeURIComponent(
    lead.institute || "your academy"
  )}.%0A%0ALet's%20connect%20for%20a%2030-minute%20walkthrough%20to%20review%20your%20PYQ%20PDF%20ingestion%20and%20CBT%20setup.%0A%0ABest%20regards%2C%0ASunil%20Baghel%0ANBE%20Arena" class="email-btn" target="_blank">
                ✉️ Reply by Email
              </a>
            </div>
          </div>
          <div class="footer">
            NBE Arena Automated Ingestion & Lead Routing Engine · Timestamp: ${lead.receivedAt}
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"NBE Arena CBT" <${senderUser}>`,
      to: adminEmail,
      subject: `🚨 New Demo Request: ${lead.name} (${lead.institute || "Academy"}) — ${lead.tier}`,
      html: htmlContent,
      replyTo: lead.email,
    });
    console.log("[MAILER SUCCESS]: Admin lead notification sent to", adminEmail, "MessageId:", info.messageId);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error("[MAILER ERROR]: Failed to send admin notification email:", error);
    return { sent: false, error: String(error) };
  }
}

/**
 * Sends a polite automated confirmation email to the prospect
 */
export async function sendConfirmationToClient(lead: LeadInquiryData) {
  const transporter = getTransporter();
  const senderUser = process.env.SMTP_USER || "sunilbaghel93100@gmail.com";

  if (!transporter || !lead.email) {
    return { sent: false, reason: "Transporter not configured or client email missing" };
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
          .header { background: #0f172a; color: #ffffff; padding: 24px 28px; }
          .title { font-size: 18px; font-weight: 800; margin: 0; color: #ffffff; }
          .body { padding: 28px; line-height: 1.6; font-size: 14px; color: #334155; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0; }
          .cta-btn { display: inline-block; background: #16a34a; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-size: 13px; font-weight: bold; margin-top: 12px; }
          .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; font-size: 11px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">NBE Arena — Demo Request Received</h1>
          </div>
          <div class="body">
            <p>Dear <strong>${lead.name}</strong>,</p>
            <p>
              Thank you for requesting an institutional demonstration of <strong>NBE Arena</strong>
              ${lead.institute ? `for <strong>${lead.institute}</strong>` : ""}.
            </p>

            <div class="card">
              <div style="font-size: 12px; font-weight: bold; color: #64748b; margin-bottom: 8px;">YOUR REQUEST SUMMARY:</div>
              <div><strong>Selected Tier:</strong> ${lead.tier}</div>
              <div><strong>Batch Size:</strong> ${lead.batchSize}</div>
              <div><strong>Target Examinations:</strong> ${lead.targetExams.join(", ")}</div>
              <div><strong>Reference ID:</strong> <span style="font-family: monospace;">${lead.id}</span></div>
            </div>

            <p>
              Our founder, <strong>Sunil Baghel</strong>, and the academic engineering team have received your details. We will connect with you on WhatsApp (<strong>${lead.phone}</strong>) within 24 hours to schedule your live 30-minute walkthrough.
            </p>

            <p>
              If you have past question papers or PDF answer keys you would like us to ingest during the demonstration, feel free to send them directly on WhatsApp:
            </p>

            <a href="https://wa.me/919310065542?text=Hi%20Sunil%2C%20I%20requested%20a%20demo%20for%20${encodeURIComponent(
              lead.institute || lead.name
            )}%20(Ref%3A%20${lead.id})." class="cta-btn" target="_blank">
              💬 Connect on WhatsApp with Sunil (+91 93100 65542)
            </a>

            <p style="margin-top: 24px; font-size: 13px; color: #64748b;">
              Warm regards,<br />
              <strong>Sunil Baghel</strong><br />
              Founder & Chief Architect, NBE Arena<br />
              Email: sunilbaghel93100@gmail.com | WhatsApp: +91 9310065542
            </p>
          </div>
          <div class="footer">
            NBE Arena · 1:1 Computer Based Test Infrastructure · India
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Sunil Baghel | NBE Arena" <${senderUser}>`,
      to: lead.email,
      subject: `Confirmation: NBE Arena Institutional Demo Request (${lead.id})`,
      html: htmlContent,
    });
    console.log("[MAILER SUCCESS]: Client confirmation sent to", lead.email, "MessageId:", info.messageId);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error("[MAILER ERROR]: Failed to send client confirmation email:", error);
    return { sent: false, error: String(error) };
  }
}
