// Emails a copy of every new contact-form message to the portfolio owner.
//
// Triggered by a Supabase Database Webhook on INSERT into public.messages
// (Dashboard → Database → Webhooks). The email's Reply-To is the visitor's address,
// so replying from Gmail goes straight back to them.
//
// Sending only ever goes to NOTIFY_EMAIL (or REPLY_TO_EMAIL), never to an address
// taken from the request, and each message is emailed once (messages.notified_at).
// NOTIFY_EMAIL can list several addresses separated by commas; each gets a copy.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ContactMessage = {
  id: number;
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  created_at?: string;
  notified_at?: string | null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("RESEND_FROM_EMAIL");
  const recipients = [...new Set(
    String(Deno.env.get("NOTIFY_EMAIL") || Deno.env.get("REPLY_TO_EMAIL") || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(isEmail),
  )];
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!resendApiKey || !fromEmail || !recipients.length || !supabaseUrl || !serviceRoleKey) {
    console.error("Missing function configuration", {
      hasResendApiKey: Boolean(resendApiKey),
      hasFromEmail: Boolean(fromEmail),
      recipients: recipients.length,
      hasSupabaseUrl: Boolean(supabaseUrl),
      hasServiceRoleKey: Boolean(serviceRoleKey),
    });
    return jsonResponse({ error: "Notification function is not configured" }, 500);
  }

  let payload: { record?: ContactMessage; messageId?: number | string };
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const messageId = payload.record?.id ?? payload.messageId;
  if (messageId === undefined || messageId === null || messageId === "") {
    return jsonResponse({ error: "No message id in the request" }, 400);
  }

  const db = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
  };

  // Always read the stored row: the email content never comes from the request body.
  const lookup = await fetch(
    `${supabaseUrl}/rest/v1/messages?id=eq.${encodeURIComponent(String(messageId))}&select=id,name,email,subject,message,created_at,notified_at`,
    { headers: db },
  );
  const rows: ContactMessage[] = lookup.ok ? await lookup.json().catch(() => []) : [];
  const message = rows[0];
  if (!message) {
    return jsonResponse({ error: "Message not found" }, 404);
  }
  if (message.notified_at) {
    return jsonResponse({ ok: true, skipped: "already notified" });
  }

  const name = String(message.name || "Website visitor").trim();
  const visitorEmail = String(message.email || "").trim();
  const subject = String(message.subject || "").trim() || "No subject";
  const body = String(message.message || "").trim();
  const adminUrl = Deno.env.get("ADMIN_URL") || "https://stevendaniel.dev/admin";

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
      <p style="margin:0 0 4px;font-size:13px;color:#6b7280">New message from your portfolio contact form</p>
      <h2 style="margin:0 0 16px;font-size:18px">${escapeHtml(subject)}</h2>
      <table style="border-collapse:collapse;font-size:14px;margin-bottom:16px">
        <tr><td style="padding:2px 12px 2px 0;color:#6b7280">From</td><td style="padding:2px 0"><strong>${escapeHtml(name)}</strong></td></tr>
        <tr><td style="padding:2px 12px 2px 0;color:#6b7280">Email</td><td style="padding:2px 0">${
          visitorEmail ? `<a href="mailto:${escapeHtml(visitorEmail)}">${escapeHtml(visitorEmail)}</a>` : "not provided"
        }</td></tr>
        <tr><td style="padding:2px 12px 2px 0;color:#6b7280">Received</td><td style="padding:2px 0">${escapeHtml(formatDate(message.created_at))}</td></tr>
      </table>
      <div style="border-left:3px solid #d1d5db;padding-left:12px;color:#374151">
        ${paragraphsToHtml(body)}
      </div>
      <p style="margin-top:20px;font-size:13px;color:#6b7280">
        ${visitorEmail ? "Just hit reply to answer " + escapeHtml(name) + " directly." : "This message has no reply address."}
        &nbsp;·&nbsp; <a href="${escapeHtml(adminUrl)}">Open the admin dashboard</a>
      </p>
    </div>
  `;

  const text = [
    `New message from your portfolio contact form`,
    ``,
    `From:    ${name}`,
    `Email:   ${visitorEmail || "not provided"}`,
    `Subject: ${subject}`,
    `Received: ${formatDate(message.created_at)}`,
    ``,
    body,
    ``,
    `Admin dashboard: ${adminUrl}`,
  ].join("\n");

  // One email per inbox, so each copy is independent (a problem with one address never
  // blocks the other, and neither inbox sees the other address).
  const sent: string[] = [];
  const failures: { to: string; details: unknown }[] = [];
  for (const to of recipients) {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to,
        subject: `New portfolio message from ${name}: ${subject}`,
        html,
        text,
        // Replying from Gmail or Apple Mail goes straight to the visitor.
        ...(isEmail(visitorEmail) ? { reply_to: visitorEmail } : {}),
      }),
    });
    const resendData = await resendResponse.json().catch(() => ({}));
    if (resendResponse.ok) sent.push(resendData.id || to);
    else failures.push({ to, details: resendData });
  }

  if (!sent.length) {
    console.error("Resend failed for every recipient", failures);
    return jsonResponse({ error: "Resend failed", details: failures }, 502);
  }
  if (failures.length) console.error("Resend failed for some recipients", failures);

  // Marks the message so a webhook retry cannot send a second copy.
  // Ignored when the notified_at column has not been added yet.
  const marked = await fetch(`${supabaseUrl}/rest/v1/messages?id=eq.${encodeURIComponent(String(message.id))}`, {
    method: "PATCH",
    headers: { ...db, Prefer: "return=minimal" },
    body: JSON.stringify({ notified_at: new Date().toISOString() }),
  });
  if (!marked.ok) {
    console.warn("Could not set notified_at", {
      status: marked.status,
      body: await marked.text().catch(() => ""),
    });
  }

  return jsonResponse({ ok: true, sent: sent.length, failed: failures.length });
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function formatDate(value?: string) {
  if (!value) return "just now";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toUTCString();
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char] || char));
}

function paragraphsToHtml(value: string) {
  if (!value) return "<p>(empty message)</p>";
  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}
