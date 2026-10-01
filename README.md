# ⚜️ WJ Jewellers · Heritage Gold, Diamonds & Royal Polki
> **Upscale Luxury Indian Jewelry Showcase & Boutique Operations Management Web Application**  
> *Crafted for WJ Jewellers · Established 1984*

[![Static Hosting Ready](https://img.shields.io/badge/Hosting-GitHub_Pages_%7C_Netlify-D4AF37?style=flat&logo=github)](https://pages.github.com/)
[![Imperial Burgundy Theme](https://img.shields.io/badge/Theme-Imperial_Burgundy_%26_Rose_Gold-8B1E3F?style=flat&logo=palette)]()
[![Automated Gold API](https://img.shields.io/badge/Live_API-Automated_Bullion_Feed-emerald?style=flat&logo=goldenline)]()
[![Client-Side Routing](https://img.shields.io/badge/Routing-Hash--Based_SPA-D4AF37?style=flat)](https://developer.mozilla.org/)

---

## 🌟 Executive Overview

**WJ Jewellers** is a production-grade, fully responsive, static-hosted luxury web application designed for a premier Indian high jewelry shop. It brings together an opulent public-facing showcase celebrating royal Indian bridal, Polki, Kundan, and temple gold ornaments with a protected, client-side boutique operations panel.

The application requires **zero build steps or backend servers**, deploying seamlessly to **GitHub Pages**, **Netlify**, **Vercel**, or any static host with zero 404 router errors.

---

## ✨ New Enhancements & Custom Features

### 1. 🍷 Imperial Burgundy & Antique Rose Gold Theme
- **Signature Haute Joaillerie Palette:** Deep royal wine velvet backgrounds (`#150409`, `#1E070D`, `#2A0A13`) paired with luminescent antique rose gold accents (`#E8B676`, `#FBE0B8`), warm amber glow, and crisp off-white typography (`#FCF7F6`).
- **Unified Visual Identity:** Uniquely tailored for royal bridal and Indian heirloom jewelry across both the Public Showcase and the Atelier Operations Panel.
- **Strict Single-Line Header:** Ultra-clean navigation header with no text wrapping, optimized spacing, and streamlined controls.

### 2. ⚡ Live Automated Bullion Price API Integration
- **Automated Daily Price Updates:** Fetches real-time spot gold prices directly from public bullion market feeds without requiring complex backend servers.
- **Multi-Purity Automated Calculation:**
  - **24K Pure Gold (999)**: Calculated live per gram and per 10g (Tola) in INR (₹), USD ($), GBP (£), and AED.
  - **22K Hallmark Gold (916)**: Exactly 91.6% purity tier.
  - **18K Jewelry Gold (750)**: Exactly 75.0% purity tier.
  - **Platinum 950** & **Fine Silver 999**.
- **Interactive Sync:** Dedicated *"Sync Live Bullion API Now"* button with animated rotating spinner in both the public ticker and the Admin Rates tab.
- **Resilient Fallback:** Automatically caches rates so the application functions seamlessly even when offline.

### 3. 👑 Authentic Indian Jewelry Curation & Scrollable Animated Carousel
- **Dedicated Scrollable & Animated Showcase (`#indian-bridal-section`):**
  - Smooth horizontal scrolling carousel with golden left/right navigation arrows, touch-swipe support, and micro-hover zoom.
  - Highlighting royal Indian creations:
    1. *The Royal Rajputana Nizam Jadau Polki Choker Suite*
    2. *Imperial 22K Temple Nakashi Peacock Kada Pair*
    3. *The Maharani Bikaner Emerald & Polki Grand Bridal Suite with Maang Tikka*
    4. *Royal Cushion Solitaire & Pavé Halo Diamond Cocktail Ring*
    5. *Kundan & South Sea Pearl Chandbali Bridal Jhumkas*
    6. *Mughal Navratna & Uncut Polki Heritage Haar*
- **Local Bespoke High-Resolution Assets (`assets/`):**
  - `assets/indian_bridal_hero.jpg` - Complete 22K Polki uncut diamond bridal choker with emerald drops, jhumkas, and maang tikka.
  - `assets/indian_temple_kadas.jpg` - Pair of 22K temple kadas with Nakashi peacock relief and ruby accents.
  - `assets/indian_jadau_choker.jpg` - Royal Rajasthani Jadau Polki choker with emeralds and Basra pearls.
  - `assets/indian_diamond_ring.jpg` - Royal Indian cushion-cut diamond solitaire ring in 18K yellow gold with pavé halo.

### 4. 🎨 Rich Animations & Micro-Interactions
- Floating hero jewelry display with slow breathing animation (`animate-float-slow` & `animate-float-gentle`).
- 3D card lift and golden border glow effects on hover.
- Continuous live bullion ticker marquee animation with hover-pause.
- Smooth springy modal scale-in and sliding Wishlist drawer.
- Toast notifications with slide-in and progress transitions.

---

## 💎 Features Walkthrough

### Public Boutique (`#/`):
- **Hero Banner:** Tagline, trust markers (100% BIS 916 Hallmark, GIA & IGI Certified, 40+ Years Legacy, Conflict-Free), and dual CTAs.
- **Trending Indian Bridal Carousel (`#/bridal`):** Horizontal scrollable slider showcasing signature bridal chokers and temple kadas.
- **The Curated Vault (Collections Grid):** Filter by Bridal Sets, Polki & Kundan, Gold Bangles & Kadas, and Diamond Rings with search and purity filters.
- **Interactive Quick-View Modal:** Full specs (Gross Weight, Net Gold, Syndicate Polki Carats, Emeralds, Making Charges, Hallmarking) with *"Book Viewing"* and *"Add to Wishlist"*.
- **Curated Wishlist Drawer:** Sliding side panel tracking bookmarked heirlooms and total estimated valuation.
- **VIP Consultation Booking (`#/contact`):** Appointment scheduler that saves directly into the Admin Inquiries queue.

### Protected Admin Panel (`#/admin`):
- **Credentials:**
  - **Username:** `admin`
  - **Password:** `jewel2026`
  - Includes a quick *"Auto-fill demo credentials"* button.
- **Executive Dashboard:** Live inventory valuation, monthly staff payroll status, daily ledger expenses, and pending inquiries.
- **Staff Salary & Payroll Tracker (`#/admin/payroll`):** One-click Paid/Pending toggle, employee modal, CSV export, and print view.
- **Daily Shop Ledger (`#/admin/ledger`):** Expense vouchers, categories (Gold Refining, Velvet Packaging, Insurance, VIP Hospitality), CSV export, and print view.
- **Stock Summary Quick-Glance (`#/admin/stock`):** Real-time unit count, quick `+` and `-` quantity adjusters, and *"Catalog New Creation"* modal that immediately updates the live public showcase!
- **Customer Inquiries Dossier (`#/admin/inquiries`):** Review consultation requests, update status (*New*, *Confirmed*, *Completed*), or trigger direct email client.
- **Bullion Rates Configurator (`#/admin/rates`):** Sync Live Market API or set custom spot overrides.

---

## 🚀 Deployment Instructions

### GitHub Pages (100% Ready)
1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: WJ Jewellers with Day/Night mode and Live Bullion API"
   git push origin main
   ```
2. In your repository on GitHub: **Settings** > **Pages** > Select branch `main` and folder `/ (root)` > Click **Save**.
3. Your site is live immediately at `https://<username>.github.io/<repository-name>/`.
   *(Hash routing guarantees that refreshing any page or admin route will never cause a 404 error!)*

### Netlify / Vercel
- Publish directory: `.` (root)
- Build command: *(none needed)*

### Local Development
```bash
python3 -m http.server 4173
```
Visit `http://localhost:4173/` in your browser.

---

## 🔑 Administrative Access

| Field | Value |
|---|---|
| **Portal URL** | `#/admin` (or click *"Atelier Portal"* in top bar) |
| **Username** | `admin` |
| **Passphrase** | `jewel2026` |
| **Quick Access** | Click *"Auto-fill demo credentials"* on the login card |

---

*WJ Jewellers · Heritage Gold, Diamonds & Royal Polki · Est. 1984*
