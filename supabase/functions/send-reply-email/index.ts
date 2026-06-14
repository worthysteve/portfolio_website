const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ReplyRequest = {
  messageId?: number | string;
  to?: string;
  name?: string;
  subject?: string;
  replyText?: string;
  originalMessage?: string;
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
  const replyToEmail = Deno.env.get("REPLY_TO_EMAIL") || undefined;
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!resendApiKey || !fromEmail || !supabaseUrl || !serviceRoleKey) {
    console.error("Missing function configuration", {
      hasResendApiKey: Boolean(resendApiKey),
      hasFromEmail: Boolean(fromEmail),
      hasSupabaseUrl: Boolean(supabaseUrl),
      hasServiceRoleKey: Boolean(serviceRoleKey),
    });
    return jsonResponse({ error: "Email function is not configured" }, 500);
  }

  let payload: ReplyRequest;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const to = String(payload.to || "").trim();
  const replyText = String(payload.replyText || "").trim();
  const subject = normalizeSubject(payload.subject);
  const name = String(payload.name || "there").trim();
  const firstName = firstNameFrom(name);
  const originalMessage = String(payload.originalMessage || "").trim();
  const cleanedReplyText = normalizeReplyText(replyText);

  if (!payload.messageId || !isEmail(to) || !replyText) {
    console.error("Invalid reply payload", {
      hasMessageId: Boolean(payload.messageId),
      to,
      hasReplyText: Boolean(replyText),
    });
    return jsonResponse({ error: "messageId, valid to email, and replyText are required" }, 400);
  }

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
      <p>Dear ${escapeHtml(firstName)},</p>
      ${paragraphsToHtml(cleanedReplyText)}
      <p>Best Regards,<br>Steven</p>
      ${originalMessage ? `
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
        <p style="color:#6b7280;font-size:13px">Your original message:</p>
        <blockquote style="border-left:3px solid #d1d5db;margin:0;padding-left:12px;color:#4b5563">
          ${paragraphsToHtml(originalMessage)}
        </blockquote>
      ` : ""}
    </div>
  `;

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to,
      subject,
      html,
      reply_to: replyToEmail,
    }),
  });

  const resendData = await resendResponse.json().catch(() => ({}));
  if (!resendResponse.ok) {
    console.error("Resend failed", resendData);
    return jsonResponse({ error: "Resend failed", details: resendData }, 502);
  }

  const updateResponse = await fetch(`${supabaseUrl}/rest/v1/messages?id=eq.${encodeURIComponent(String(payload.messageId))}`, {
    method: "PATCH",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      status: "read",
      reply_text: cleanedReplyText,
      replied_at: new Date().toISOString(),
    }),
  });

  if (!updateResponse.ok) {
    console.error("Message status update failed", {
      status: updateResponse.status,
      body: await updateResponse.text().catch(() => ""),
    });
    return jsonResponse({ error: "Email sent, but message status update failed" }, 502);
  }

  return jsonResponse({ ok: true, emailId: resendData.id || null });
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeSubject(subject?: string) {
  const clean = String(subject || "Portfolio message").trim();
  return /^re:/i.test(clean) ? clean : `Re: ${clean}`;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function firstNameFrom(value: string) {
  return value.split(/\s+/).filter(Boolean)[0] || "there";
}

function normalizeReplyText(value: string) {
  return value
    .replace(/^\s*(hi|hello|dear)\s+[^,\n]+,?\s*/i, "")
    .replace(/\s*(best|best regards|kind regards|regards),?\s*(steven\s+daniel)?\s*$/i, "")
    .trim();
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
  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}
