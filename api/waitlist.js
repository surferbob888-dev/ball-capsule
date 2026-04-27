// api/waitlist.js
// Vercel serverless function — receives form data, writes to Google Sheets
// Deploy to Vercel. Set environment variables in Vercel dashboard (never hardcode secrets).

const { google } = require('googleapis');

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers — update origin to your actual domain before launch
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { firstName, email, dogBreed, interest, website, 'cf-turnstile-response': turnstileToken } = req.body;

    // ── 1. Honeypot check ──────────────────────────────────────────────────
    if (website) {
      return res.status(200).json({ ok: true });
    }

    // ── 2. Turnstile verification ──────────────────────────────────────────
    if (!turnstileToken) {
      return res.status(400).json({ error: 'Please complete the security check.' });
    }

    const turnstileVerify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.CLOUDFLARE_TURNSTILE_SECRET,
        response: turnstileToken,
      }),
    });

    const turnstileResult = await turnstileVerify.json();
    if (!turnstileResult.success) {
      return res.status(400).json({ error: 'Security check failed. Please try again.' });
    }

    // ── 3. Basic validation ────────────────────────────────────────────────
    if (!firstName || !email) {
      return res.status(400).json({ error: 'First name and email are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    // ── 4. Authenticate with Google ────────────────────────────────────────
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // ── 5. Append row to Google Sheet ──────────────────────────────────────
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          new Date().toISOString(),           // A: Timestamp
          firstName.trim(),                    // B: First Name
          email.trim().toLowerCase(),          // C: Email
          dogBreed?.trim() || '',              // D: Dog Breed
          interest || '',                      // E: Interest
          'Ball Capsule Launch Page',          // F: Source
        ]],
      },
    });

    // ── 6. Send confirmation email via Resend ──────────────────────────────
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Ball Capsule <hello@theballcapsule.com>',
        reply_to: 'hello@theballcapsule.com',
        to: email.trim().toLowerCase(),
        subject: "You're on the list 🐾",
        html: `
          <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #101418;">
            <div style="margin-bottom: 32px;">
              <span style="font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #1f5fd6;">LA SYD</span>
              <p style="font-size: 18px; font-weight: 700; margin: 4px 0 0; letter-spacing: -.02em;">Ball Capsule</p>
            </div>

            <h1 style="font-size: 28px; font-weight: 700; letter-spacing: -.03em; margin: 0 0 16px;">Hey ${firstName.trim()}, you're on the list.</h1>

            <p style="font-size: 16px; color: #5d6672; line-height: 1.6; margin: 0 0 16px;">Thanks for joining the Ball Capsule early-access waitlist. We'll be in touch as soon as we're ready to launch.</p>

            <p style="font-size: 16px; color: #5d6672; line-height: 1.6; margin: 0 0 32px;">In the meantime — keep playing fetch. 🎾</p>

            <div style="background: #eaf1ff; border-radius: 16px; padding: 20px 24px; margin-bottom: 24px;">
              <p style="font-size: 14px; font-weight: 700; margin: 0 0 4px; color: #0d3f9b;">What is Ball Capsule?</p>
              <p style="font-size: 14px; color: #5d6672; margin: 0; line-height: 1.6;">A clean, sealed dog tennis ball holder that clips to your leash. Drop it in, snap it shut, clip and go.</p>
            </div>

            <div style="background: #f5f5f2; border-radius: 16px; padding: 20px 24px; margin-bottom: 32px;">
              <p style="font-size: 14px; font-weight: 700; margin: 0 0 4px; color: #101418;">A note from us</p>
              <p style="font-size: 14px; color: #5d6672; margin: 0; line-height: 1.6;">Ball Capsule is still in development. Final product details — including design, pricing, and availability — may evolve before launch. We'll keep you updated every step of the way.</p>
            </div>

            <p style="font-size: 14px; color: #5d6672; line-height: 1.6; margin: 0 0 8px;">Visit us at <a href="https://theballcapsule.com" style="color: #1f5fd6;">theballcapsule.com</a></p>
            <p style="font-size: 14px; color: #5d6672; line-height: 1.6; margin: 0 0 8px;">Questions? Just reply to this email — we read everything.</p>
            <p style="font-size: 12px; color: #9aa3ae; margin: 32px 0 0; border-top: 1px solid #dde2ea; padding-top: 20px;">You're receiving this because you joined the Ball Capsule waitlist. To unsubscribe, reply with "unsubscribe" in the subject line.<br/>© ${new Date().getFullYear()} LA SYD. All rights reserved.</p>
          </div>
        `,
      }),
    });

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error('Waitlist error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
