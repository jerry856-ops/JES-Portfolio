export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const isPost = request.method === 'POST';
    const isEmailRoute = ['/', '/send', '/contact'].includes(path);

    if (request.method === 'GET' && path === '/') {
      return new Response('Worker is running', { headers: cors });
    }

    if (isPost && isEmailRoute) {
      let body;
      try {
        body = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      const { name, email, message } = body;

      if (!name || !email || !message) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 422, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      const clean = s => String(s).replace(/<[^>]*>/g, '').trim().slice(0, 2000);
      const safeName    = clean(name);
      const safeEmail   = clean(email);
      const safeMessage = clean(message);

      const RESEND_API_KEY = env.RESEND_API_KEY; // ← LINE 34 — key loaded from secret, never hardcoded

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`, // ← LINE 40 — only used here
        },
        body: JSON.stringify({
          from: 'Portfolio <pf@srnk1.eu>',
          to: ['jeresranki@gmail.com'],
          reply_to: safeEmail,
          subject: `New message from ${safeName}`,
          text: `Name: ${safeName}\nEmail: ${safeEmail}\n\nMessage:\n${safeMessage}`,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        return new Response(JSON.stringify({ error: 'Email failed', detail: err }), {
          status: 502, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Catch-all — never returns 404 for ambiguous requests
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  },
};
