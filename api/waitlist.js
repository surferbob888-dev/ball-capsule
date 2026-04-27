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

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error('Waitlist error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
