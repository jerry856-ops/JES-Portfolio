# Jeremy Elay Srankota — Portfolio Website

A complete, production-ready photography portfolio.

---

## File Structure

```
/
├── index.html          ← Main single-page site
├── travel-japan.html   ← Japan travel subpage (dark, minimal, torii gate SVG)
├── travel-croatia.html ← Croatia subpage (coastal tones, wave SVG)
├── travel-greece.html  ← Greece subpage (bright/airy, sun SVG)
├── worker.js           ← Cloudflare Worker (contact form backend)
└── wrangler.toml       ← Worker config
```

---

## Adding Real Photos

All photo placeholders are SVG blocks. Replace them with real `<img>` tags:

```html
<!-- Before (placeholder) -->
<svg viewBox="0 0 400 500" ...>...</svg>

<!-- After (real photo) -->
<img src="photos/landscape-01.jpg" alt="Landscape — Slovakia" loading="lazy">
```

Recommended image format: WebP, 2400px wide, quality 80%.

---

## Backend Deployment (Cloudflare Worker)

### 1. Create a Resend account
- Go to https://resend.com — free tier covers 3,000 emails/month
- Get your API key from the dashboard

### 2. Install Wrangler
```bash
npm install -g wrangler
wrangler login
```

### 3. Set your secret
```bash
wrangler secret put RESEND_API_KEY
# Paste your Resend API key when prompted
```

### 4. Deploy the Worker
```bash
wrangler deploy
# Outputs: https://jeremy-portfolio-contact.YOUR-SUBDOMAIN.workers.dev
```

### 5. Update the frontend
In `index.html`, find this line and replace the URL:
```js
const res = await fetch('https://YOUR-WORKER.workers.dev/contact', {
```
Change it to your real Worker URL.

### 6. (Optional) Verify a custom domain in Resend
To send from `noreply@jeremysrankota.com` instead of Resend's default domain:
- Add your domain in Resend → Domains
- Follow their DNS instructions
- Update the `from` field in `worker.js`

---

## Hosting the HTML Files

Any static host works:

### Cloudflare Pages (recommended — free, fast)
```bash
# Install Pages CLI
npm install -g wrangler

# Deploy
wrangler pages deploy . --project-name=jeremy-portfolio
```

### Netlify
Drag-and-drop the folder at app.netlify.com — done in 30 seconds.

### Vercel
```bash
npx vercel --prod
```

---

## Design System

| Token        | Value                           |
|-------------|----------------------------------|
| Background  | `#0a0714`                        |
| Primary     | `#2d1b4e`                        |
| Accent      | `#6d4aff`                        |
| Accent 2    | `#9d7fff`                        |
| Text        | `#f0ecff`                        |
| Muted       | `#7a6fa0`                        |
| Serif font  | Playfair Display (Google Fonts)  |
| Sans font   | DM Sans (Google Fonts)           |

### Travel subpage palettes
| Page    | Primary  | Accent    | Background |
|---------|----------|-----------|------------|
| Japan   | #8b1a1a  | #bc3a3a   | #f7f5f2    |
| Croatia | #3a7a8a  | #5aa0b4   | #f2f0ec    |
| Greece  | #1e4a8a  | #3a6abf   | #faf8f4    |

---

## SVG Design Elements

Each travel page includes a hand-built SVG symbol:
- **Japan**: Full torii gate (kasagi, nuki, pillars, komaishi caps)
- **Croatia**: Layered coastal wave paths
- **Greece**: Radiating sun with ray lines and dashed outer ring

---

## Contact

jeresranki@gmail.com  
instagram.com/jeresranki
