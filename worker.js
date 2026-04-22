/**
 * Cloudflare Worker — Contact Form Handler
 * Jeremy Elay Srankota Portfolio
 *
 * Uses Resend API (https://resend.com) — free tier: 3,000 emails/month
 * Deploy: wrangler deploy
 *
 * Required secret (set via wrangler secret put RESEND_API_KEY):
 *   RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
 */

export default {
  async fetch(request, env) {

    // ── CORS headers ──────────────────────────────────────────────────────────
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',          // Change to your domain in production
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow POST to /contact
    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/contact') {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Parse body ─────────────────────────────────────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { name, email, message } = body;

    // Basic validation
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'All fields are required.' }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Simple email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address.' }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sanitise inputs (strip HTML tags)
    const clean = (str) => str.replace(/<[^>]*>/g, '').trim().slice(0, 2000);
    const safeName    = clean(name);
    const safeEmail   = clean(email);
    const safeMessage = clean(message);

    // ── Send via Resend ────────────────────────────────────────────────────────
    const resendPayload = {
      from:    'Portfolio Contact <onboarding@resend.dev>',   // Change after verifying your domain
      to:      ['jeresranki@gmail.com'],
      reply_to: safeEmail,
      subject: `New message from ${safeName} — portfolio`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a2e">
          <div style="background:#0f0a1f;padding:32px;border-radius:8px 8px 0 0">
            <h1 style="font-family:Georgia,serif;color:#9d7fff;font-weight:300;font-size:1.6rem;margin:0">
              New Portfolio Message
            </h1>
          </div>
          <div style="background:#fafafa;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e8e0f4">
            <table style="width:100%;border-collapse:collapse">
              <tr>
                <td style="padding:8px 0;color:#888;font-size:.85rem;width:80px">From</td>
                <td style="padding:8px 0;font-weight:500">${safeName}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#888;font-size:.85rem">Email</td>
                <td style="padding:8px 0">
                  <a href="mailto:${safeEmail}" style="color:#6d4aff">${safeEmail}</a>
                </td>
              </tr>
            </table>
            <hr style="border:none;border-top:1px solid #e8e0f4;margin:20px 0">
            <p style="font-size:.85rem;color:#888;margin:0 0 8px">Message</p>
            <p style="font-size:1rem;line-height:1.7;color:#1a1a2e;white-space:pre-wrap">${safeMessage}</p>
            <hr style="border:none;border-top:1px solid #e8e0f4;margin:20px 0">
            <p style="font-size:.75rem;color:#aaa;margin:0">
              Sent via jeremysrankota.com contact form
            </p>
          </div>
        </div>
      `,
      text: `From: ${safeName} <${safeEmail}>\n\n${safeMessage}`,
    };

    let resendRes;
    try {
      resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        },
        body: JSON.stringify(resendPayload),
      });
    } catch (err) {
      console.error('Resend fetch failed:', err);
      return new Response(JSON.stringify({ error: 'Email service unavailable.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!resendRes.ok) {
      const errBody = await resendRes.text();
      console.error('Resend error:', resendRes.status, errBody);
      return new Response(JSON.stringify({ error: 'Failed to send email.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Success ────────────────────────────────────────────────────────────────
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
};
