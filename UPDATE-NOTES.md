# MediCare Pharmacy — Update Notes

This is your original `pharmacy-health-store` project with the following additions. All 23 original pages are unchanged in content — only the shared header, footer and `<head>` were updated (see "What changed on every page" below).

## What was added

### 1. Home 2 — Premium (`home-2.html`)
A second home page in the same green pharmacy branding, built around recurring/membership customers: split hero with a quick-order search widget, category grid, three membership plans (Basic / Premium / Family), trusted-brands strip, "why Premium" features, an app-download banner and member testimonials. Switch between homes from the **Home** dropdown in the main nav.

### 2. Admin Portal (`admin/`)
Pharmacies need staff to review prescriptions, manage the catalog and respond to enquiries, so an 8-page admin portal was added, reached via the **Admin** button in the header:
- `admin/index.html` — Dashboard Overview (KPIs, weekly order chart, recent prescription uploads)
- `admin/prescriptions.html` — Prescription Requests
- `admin/enquiries.html` — Customer Enquiries
- `admin/products.html` — Products & Medicines
- `admin/offers.html` — Offers Management
- `admin/customers.html` — Customers
- `admin/stores.html` — Store Locations
- `admin/settings.html` — Business profile & preferences

It's a static UI shell (no login/backend wired up) marked `noindex, nofollow`, with no public navbar/footer, matching standard dashboard conventions.

### 3. Dark Mode & RTL support
Per the template guidelines, every page now has:
- `assets/css/dark-mode.css` — a full dark theme, toggled with the moon icon in the header, persisted in `localStorage` and defaulting to the visitor's OS preference
- `assets/css/rtl.css` — right-to-left layout support, toggled with the globe icon

Both toggles were added to the header of all 23 original pages, `home-2.html`, `coming-soon.html` and the admin portal.

### 4. Missing essential page
- `coming-soon.html` — countdown timer + email capture, matching site branding (this was on the required-pages checklist but wasn't in the original project).

### 5. SEO basics
- `robots.txt` (disallows `/admin/`)
- `sitemap.xml` covering all public pages

### 6. Footer credit line
Added to the footer of every page (including the new ones):
```html
<div class="developed-by">
  <span>Developed by</span>
  <span class="font-semibold text-slate-800 dark:text-slate-200">Abhivorn Technologies Pvt. Ltd.</span>
</div>
```

## What changed on every existing page
Each of the original 23 pages had these exact, identical edits applied (verified byte-for-byte identical before editing, so nothing else was touched):
1. Added `dark-mode.css` and `rtl.css` `<link>` tags after the existing `style.css` link.
2. Turned the "Home" nav item into a Home 1/Home 2 dropdown.
3. Added an **Admin** link, dark-mode toggle and RTL toggle to the header actions (next to "Upload Rx").
4. Added the "Developed by Abhivorn Technologies Pvt. Ltd." line to the footer.

## Not added (left as-is / a suggestion for later)
This is a product-browsing pharmacy site without cart/checkout/account pages in the original scope — those weren't added since they weren't requested and would be a significant feature addition (payment integration, order tracking, login). If you want online ordering (not just prescription upload + enquiry), that's a good next step — happy to help build it.
