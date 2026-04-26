# Ball Capsule — Tech Stack Architecture
## Internal Reference Document | LA SYD
### Last updated: April 25, 2026

---

## Overview

Ball Capsule is a pre-launch product page with an email waitlist backend.
It is a static HTML site with one serverless function.
No framework, no database, no CMS — intentionally simple and fast.

---

## Architecture Diagram

```
Visitor
  ↓
Cloudflare (DNS + Security + Bot filtering)
  ↓
Vercel (Hosting + Serverless Functions + SSL)
  ↓
index.html (the website)
  ↓ (on form submit)
api/waitlist.js (Vercel Serverless Function)
  ↓
Google Sheets API (data storage)
  ↓
Google Sheet (Ball Capsule Waitlist)
```

---

## Frontend

| What | Tool | Why |
|---|---|---|
| HTML | Plain HTML5 | No framework needed for a single page |
| CSS | Plain CSS (styles.css) | Custom design system, no framework |
| JavaScript | Plain JS (script.js) | Form handling, no library needed |
| Fonts | Google Fonts (Inter) | Clean, professional, free |
| Icons | None | Design is text and image based |

---

## Backend

| What | Tool | Why |
|---|---|---|
| Hosting | Vercel (free Hobby plan) | Auto-deploys from GitHub, fast global CDN |
| Serverless Function | Vercel (api/waitlist.js) | Handles form submissions securely |
| Runtime | Node.js | Standard for Vercel functions |
| Google Sheets integration | googleapis npm package | Writes form data to Google Sheets |

---

## Data Storage

| What | Tool | Why |
|---|---|---|
| Waitlist data | Google Sheets | Team owns it forever, easy to export |
| Authentication | Google Service Account | Secure API access, no password sharing |
| Credentials storage | Vercel Environment Variables | Never stored in code or GitHub |

---

## Security & Bot Protection

| What | Tool | Why |
|---|---|---|
| DNS | Cloudflare (free) | Masks origin server, DDoS protection |
| SSL/HTTPS | Vercel (auto) | Free, automatic certificate renewal |
| Bot protection layer 1 | Honeypot field | Hidden form field bots fill in, humans don't |
| Bot protection layer 2 | Cloudflare Turnstile | Silent CAPTCHA, no user friction |
| Rate limiting | Vercel built-in | Throttles repeat requests automatically |

---

## SEO & Discovery

| What | Tool | Why |
|---|---|---|
| Search indexing | Google Search Console | Monitors indexing, search performance |
| Sitemap | sitemap.xml | Tells Google what pages exist |
| Structured data | JSON-LD schema | Product, HowTo, FAQ, Organization markup |
| Social sharing | Open Graph + Twitter Cards | Controls how links look when shared |
| Analytics | None yet | Add Cloudflare Analytics or GA4 when ready |

---

## Version Control & Deployment

| What | Tool | Why |
|---|---|---|
| Code storage | GitHub (surferbob888-dev/ball-capsule) | Version history, team collaboration |
| Deployment | Vercel (connected to GitHub) | Auto-deploys on every push to main branch |
| Deployment trigger | Push to main branch | No manual deploy steps needed |

---

## Domain & DNS

| What | Details |
|---|---|
| Domain registrar | Squarespace (theballcapsule.com) |
| DNS provider | Cloudflare |
| Nameservers | haley.ns.cloudflare.com / yew.ns.cloudflare.com |
| Primary domain | theballcapsule.com |
| www redirect | www.theballcapsule.com → theballcapsule.com (307) |
| Backup URL | ball-capsule.vercel.app |

---

## Environment Variables (Vercel)

These are secret and never stored in code or GitHub.

| Variable | What it is |
|---|---|
| GOOGLE_SHEET_ID | ID of the Ball Capsule Waitlist Google Sheet |
| GOOGLE_SERVICE_ACCOUNT_EMAIL | Service account email for Google Sheets API |
| GOOGLE_PRIVATE_KEY | Private key for Google Sheets API authentication |
| CLOUDFLARE_TURNSTILE_SECRET | Secret key for Cloudflare Turnstile bot verification |

---

## Key Files

```
ball-capsule/ (GitHub repo root)
├── index.html          Main page
├── legal.html          Privacy Policy + Terms of Use
├── styles.css          All styling
├── script.js           Form submission logic
├── favicon.svg         Browser tab icon
├── sitemap.xml         Google Search Console sitemap
├── package.json        Node dependencies (googleapis)
├── SETUP-GUIDE.md      Backend setup instructions
├── TECH-STACK.md       This document
└── api/
    └── waitlist.js     Vercel serverless function
└── assets/
    ├── ball-capsule-blue.jpg
    ├── ball-capsule-colors-blue-red-yellow-green.jpg
    ├── ball-capsule-how-it-works-steps.jpg
    ├── ball-capsule-dog-tennis-ball-holder-outdoor.jpg
    ├── ball-capsule-leash-clip-active-dog-walk.jpg
    ├── ball-capsule-og.jpg
    ├── dirty-tennis-ball-dog.jpg
    ├── dog-leash-ball-capsule.jpg
    ├── dog-tennis-ball-goldendoodle.jpg
    └── sydney-and-cooper.jpg
```

---

## Monthly Cost Breakdown

| Service | Cost |
|---|---|
| Vercel (Hobby plan) | $0 |
| Cloudflare (Free plan) | $0 |
| GitHub (Free plan) | $0 |
| Google Sheets API | $0 |
| Google Search Console | $0 |
| Domain (theballcapsule.com) | ~$20/year via Squarespace |
| **Total** | **~$0/month** |

---

## What to Add Next

| Feature | Tool | Priority |
|---|---|---|
| Analytics | Cloudflare Analytics or GA4 | Soon |
| Email confirmation | Resend or Mailchimp | Before launch |
| Privacy-friendly analytics | Cloudflare Web Analytics | Soon |
| E-commerce | Shopify buy button | At launch |
| Blog / SEO content | Add blog pages to this repo | Pre-launch |

---

## Key Contacts & Accounts

| Service | Account |
|---|---|
| GitHub | surferbob888-dev |
| Vercel | surferbob888-7875 |
| Cloudflare | (your account) |
| Google (Sheets + Search Console) | (your account) |
| Domain | Squarespace account |
