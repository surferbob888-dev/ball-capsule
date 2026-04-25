# Ball Capsule — Form Backend Setup Guide
## Vercel + Cloudflare DNS + Google Sheets

---

## The Stack

User submits form
  → Vercel Serverless Function (validates, honeypot check)
  → Google Sheets API (stores the data)
  → User sees success message

---

## What You Need Before Starting

- [ ] Vercel account (free)
- [ ] Google account (for Sheets + API)
- [ ] Cloudflare account (you already have this for DNS)
- [ ] Node.js installed on your computer (to test locally)

---

## STEP 1 — Set Up Your Google Sheet

1. Go to sheets.google.com and create a new sheet
2. Name it: **Ball Capsule Waitlist**
3. Add these headers in Row 1:
   - A1: Timestamp
   - B1: First Name
   - C1: Email
   - D1: Dog Breed
   - E1: Interest
   - F1: Source

4. Copy the Sheet ID from the URL:
   https://docs.google.com/spreadsheets/d/ **[THIS PART]** /edit
   Save it — you'll need it later.

---

## STEP 2 — Create a Google Service Account

This lets your Vercel function write to the sheet securely.

1. Go to console.cloud.google.com
2. Create a new project → name it "Ball Capsule"
3. Go to APIs & Services → Enable APIs
4. Search for and enable: **Google Sheets API**
5. Go to APIs & Services → Credentials
6. Click Create Credentials → Service Account
   - Name: ball-capsule-sheets
   - Role: Editor
7. Click on the new service account → Keys tab
8. Add Key → Create new key → JSON
9. Download the JSON file — keep it safe, never commit it to git

10. Open the JSON file and copy the **client_email** value
    It looks like: ball-capsule-sheets@your-project.iam.gserviceaccount.com

11. Go back to your Google Sheet
12. Click Share → paste the client_email → give it Editor access

---

## STEP 3 — Update Your Project Structure

Your project folder should look like this:

ball-capsule-project/
├── index.html
├── styles.css
├── script.js
├── assets/
│   └── (all images)
└── api/
    └── waitlist.js     ← NEW (the serverless function)

---

## STEP 4 — Create the Vercel Serverless Function

Create a new file: api/waitlist.js
(This file is provided separately — see waitlist.js artifact)

---

## STEP 5 — Set Environment Variables in Vercel

Never put secrets in your code. Set these in Vercel's dashboard:

1. Go to vercel.com → your project → Settings → Environment Variables
2. Add these variables:

   GOOGLE_SHEET_ID
   Value: (the sheet ID you copied in Step 1)

   GOOGLE_SERVICE_ACCOUNT_EMAIL
   Value: (the client_email from your JSON file)

   GOOGLE_PRIVATE_KEY
   Value: (the private_key from your JSON file — include the full value with \n characters)

---

## STEP 6 — Update index.html Form

Two small changes to your existing form:
1. Add the honeypot hidden field
2. Update script.js endpoint to point to /api/waitlist

(Updated script.js provided separately)

---

## STEP 7 — Deploy to Vercel

1. Push your updated project folder to Vercel
2. Vercel auto-detects the /api folder and deploys the function
3. Test by submitting the form on your live URL
4. Check your Google Sheet — the row should appear within seconds

---

## STEP 8 — Cloudflare DNS (if using custom domain)

1. In Vercel: Settings → Domains → Add your domain
2. Vercel gives you two DNS values (A record + CNAME)
3. In Cloudflare: DNS → Add those records
4. IMPORTANT: Set Cloudflare proxy to DNS Only (grey cloud) for the root domain
   Vercel handles SSL — Cloudflare proxying can cause certificate conflicts
5. Propagation takes 5–30 minutes

---

## Spam / Bot Protection

Two layers are built in:

1. HONEYPOT FIELD
   A hidden input called "website" is in the form.
   Bots fill it in. Humans never see it.
   The serverless function checks: if "website" has a value → reject silently.

2. VERCEL RATE LIMITING
   Vercel's free tier includes basic DDoS protection.
   The function also checks for required fields server-side.

Optional upgrade later: Add Cloudflare Turnstile (free, better than reCAPTCHA)
to the form for an extra layer. This can be added in 20 minutes when you're ready.

---

## Testing Checklist

- [ ] Submit the form with real data → row appears in Google Sheet
- [ ] Submit with honeypot field filled → no row appears, silent fail
- [ ] Submit with missing email → form shows error
- [ ] Check Vercel logs (vercel.com → project → Logs) for any errors

---

## What You Own

- Google Sheet: yours forever, export anytime as CSV/Excel
- Vercel function: your code, in your repo
- No third-party email service with its own terms or pricing tiers
- Easy to hand off to a developer later if needed

---

## Cost

- Vercel: Free (Hobby plan, 100GB bandwidth, plenty for a waitlist)
- Google Sheets API: Free (500 requests/100 seconds, far more than needed)
- Cloudflare: Free
- Total: $0/month until you need a custom domain (~$10-15/year for the domain itself)
