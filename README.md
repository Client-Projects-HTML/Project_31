# Grand Palace — Party Hall & Banquet Venue

A booking/reservation HTML template for a palace-inspired banquet venue, built with plain HTML5, CSS3 and vanilla JavaScript (no build step required).

## Getting Started

Open `pages/index.html` in a browser, or serve the folder locally:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000/pages/index.html
```

All internal links are relative, so the site also works if you deploy the whole folder to any static host (Netlify, GitHub Pages, S3, etc.).

## Design System

**Palette** — deep wine (`#2B0E1F`), ivory (`#FBF3E3`), marigold (`#E0A63A`), emerald (`#1F4A3D`), brass (`#B8860B`). Inspired by Indian palace architecture rather than a generic "wedding" cream-and-gold look.

**Type** — Marcellus/Cormorant Garamond for display headings, Jost for body copy.

**Signature element** — the *arch frame*: every hero image, hall card and gallery thumbnail is clipped into a mandap/palace-window arch (`.arch-frame`), tying the UI back to the venue's own architecture instead of using plain rectangles.

All colors, spacing and radii are CSS custom properties in `assets/css/style.css`, so re-theming is a matter of editing `:root`.

## Folder Structure

```
party-hall-banquet/
├── assets/
│   ├── css/          style.css (design system), responsive.css, dark-mode.css, rtl.css
│   ├── js/            main.js (nav/theme/reveal/lightbox/accordion/slider),
│   │                   booking.js (form validation + availability calendar),
│   │                   dashboard.js (customer dashboard interactions)
│   ├── images/         hero, halls, gallery, decorations, icons, team
│   │                   (branded SVG placeholders — swap for real photography)
│   └── fonts/, videos/ (empty — add licensed assets as needed)
├── pages/              19 HTML pages (see below)
└── documentation/
```

## Pages

Home · About · Halls · Hall Details · Gallery · Packages · Booking · Availability ·
Testimonials · FAQ · Contact · Login · Register · Forgot Password · Dashboard ·
My Bookings · Invoice · Profile · Coming Soon · 404

## Features Implemented

- **Dark/Light mode** — toggle in the header, driven by CSS variables (`assets/css/dark-mode.css`)
- **RTL support** — set `<html dir="rtl">` (or wire up a toggle) to flip layout via `assets/css/rtl.css`
- **Responsive layout** — breakpoints in `assets/css/responsive.css`, mobile hamburger menu
- **Booking form validation** — inline error states, no external libraries (`assets/js/booking.js`)
- **Availability calendar** — month navigation with available/booked/pending states
- **Gallery** — category filters + lightbox
- **FAQ accordion**, **testimonial slider**, **scroll-reveal animations** (AOS-style, respects `prefers-reduced-motion`)
- **Skeleton loading** utility class (`.skeleton`) ready to use while data loads
- Accessible focus states, semantic headings, alt text on every image

## Placeholders / Next Steps

- **Images** — all photography is a generated SVG placeholder in the brand palette. Swap files in `assets/images/` with real photos (keep the same filenames or update the `<img src>` paths).
- **Google Maps** — `contact.html` has a placeholder block; drop in an embed `<iframe>` with your API key.
- **Payments** — invoice/booking pages assume Stripe/PayPal will be wired up separately; no payment SDK is included.
- **Backend** — all forms currently validate client-side only and show a success state; connect them to your API/CMS of choice.
- **Font Awesome / Swiper.js / AOS** — the template ships without a hard dependency on these (a lightweight vanilla-JS slider and scroll-reveal replace Swiper/AOS, and inline SVGs replace Font Awesome) so it works offline with zero external requests. Swap in the real libraries via CDN if you prefer their exact APIs.
