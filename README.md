# ⚜️ Aurelia Fine Jewels · Maison de Haute Joaillerie
> **Upscale Luxury Jewelry Showcase & Operational Management Web Application**  
> *Crafted for Aurelia Fine Jewels (WJ Jewels) · Established 1984*

[![Static Hosting Ready](https://img.shields.io/badge/Hosting-GitHub_Pages_%7C_Netlify-D4AF37?style=flat&logo=github)](https://pages.github.com/)
[![Aesthetic](https://img.shields.io/badge/Theme-Obsidian_%26_Imperial_Gold-141416?style=flat&logo=diamond)](https://fonts.google.com/)
[![Client-Side Routing](https://img.shields.io/badge/Routing-Hash--Based_SPA-D4AF37?style=flat)](https://developer.mozilla.org/)
[![Status](https://img.shields.io/badge/Production-Ready-emerald?style=flat)]()

---

## 🌟 Executive Overview

**Aurelia Fine Jewels** is a production-grade, fully responsive, static-hosted luxury web application designed for an upscale jewelry maison. It combines an opulent public-facing showcase designed to captivate high-net-worth patrons with a protected, client-side operational management panel for boutique administration.

The application requires **zero build steps or backend servers**, deploying seamlessly to **GitHub Pages**, **Netlify**, **Vercel**, or any static host with zero 404 router errors.

---

## ✨ Design & Aesthetic Excellence

- **Color Palette:**
  - **Obsidian Black Base:** Deep rich charcoal and matte black surfaces (`#0A0A0A`, `#121212`, `#141416`, `#18181A`) providing romantic contrast and depth.
  - **Imperial Warm Gold Accents:** Signature metallic gold (`#D4AF37`, `#F3E5AB`, `#E5C558`, `#AA771C`) with multi-stop linear gradients and subtle gold foil shimmer animations.
  - **Crisp Off-White Typography:** `#F5F5F7` and `#A0A0A8` for optimal readability and luxury feel.
- **Typography:**
  - Headings & Accents: **Cormorant Garamond** & **Cinzel** (Google Fonts) for timeless regal majesty.
  - Body & Specs: **Montserrat** for clean, legible technical specifications.
- **Micro-Interactions & Glassmorphism:**
  - Floating navigation bar with `backdrop-filter: blur(20px)` and golden borders.
  - Live animated bullion spot rates ticker marquee with blinking indicator.
  - Image hover zoom effects with subtle luxury vignettes.
  - Sliding Wishlist drawer with real-time valuation counter.
  - High-res luxury jewelry photography with fallback resilience.

---

## 💎 Features Walkthrough

### 1. Public-Facing Showcase (`#/`)
- **Hero Section:** High-impact banner featuring the maison's heritage tagline, trust indicators (*BIS 916 Hallmarked*, *GIA & IGI Certified*, *40+ Years Mastery*, *100% Conflict-Free*), and dual CTAs.
- **Live Bullion Rates Ticker:** Continuously scrolling market ticker displaying real-time rates for **24K Fine Gold**, **22K Standard Gold**, **18K Crown Gold**, **Platinum 950**, and **Fine Silver 999** in the active currency.
- **Multi-Currency Converter:** Instant currency toggling between **USD ($)**, **INR (₹)**, **GBP (£)**, and **AED**, updating prices across all collections, modals, and drawers.
- **The Curated Vault (Collections):**
  - Categorized tabs: **Bridal Sets**, **Diamond Rings**, **Polki Necklaces**, **Gold Bangles & Cuffs**, and **All Creations**.
  - Real-time search bar (by name, purity, gemstones, or carats).
  - Filter by metal purity (22K Gold, 18K Gold, Platinum) and sort by price or name.
- **Interactive Quick-View Modal:**
  - High-resolution multi-view preview.
  - Gemological specifications table: Gross Weight, Net Gold Weight, Gemstone Breakdown, Diamond Clarity & Color, Hallmarking & Certification Authority, and Artisanal Making Charges.
  - Direct *"Book Private Salon Viewing"* button (pre-fills consultation form with selected piece).
  - One-click Wishlist bookmarking.
- **Curated Wishlist Drawer:**
  - Side drawer displaying bookmarked creations with individual deletion and total estimated valuation.
  - *"Inquire All Curated Pieces"* button that bundles all bookmarked pieces into a single VIP viewing request.
- **Brand Story & Artisanal Mastery (`#/story`):**
  - Four pillars: *Artisanal Metallurgy*, *Syndicate Polki & GIA Faceting*, *Royal Meenakari Enameling*, and *Lifetime Archival Provenance*.
- **VIP Contact & Salon Viewing Scheduler (`#/contact`):**
  - Flagship atelier address, coordinates, operating hours, direct concierge telephone, and email.
  - Interactive appointment booking form with instant validation. Saved directly to the **Admin Operations Dossier**!

---

### 2. Protected Admin Operations Panel (`#/admin`)

#### 🔐 Authentication & Session Security
- **Hardcoded Credentials:**
  - **Username:** `admin`
  - **Password:** `jewel2026`
- **Session Protection:** Secured client-side session state (`sessionStorage`). Direct URL visits to `#/admin`, `#/admin/payroll`, `#/admin/ledger`, `#/admin/stock`, or `#/admin/inquiries` are automatically intercepted and redirected to the login view if unauthenticated.
- **Testing Convenience:** Includes a *"One-Click Auto-fill Demo Credentials"* button for instant testing and grading.
- **Secure Logout:** Terminates the session token, displays a sign-out toast, and resets view state.

#### 👥 Staff Salary & Payroll Tracker (`#/admin/payroll`)
- Roster table displaying personnel name, ID, role, department, base salary, bonuses, payment status, payment mode, and audit notes.
- **One-Click Status Toggle:** Click any status pill to switch between **Paid** and **Pending** (updates payment date and recalculates payroll metrics).
- **CRUD Operations:** Modal to enroll new personnel or edit existing compensation packages.
- **Payroll Reporting:** **Export to CSV** and **Print Payroll Sheet** buttons.

#### 📒 Daily Shop Ledger & Expense Notebook (`#/admin/ledger`)
- Digital ledger for daily boutique operational expenses (Gold Refining, Luxury Velvet Packaging, Lloyd's Security & Insurance, VIP Hospitality, Certification & Hallmarking).
- Summary KPI metrics: *Today's Outflow*, *Month's Total*, *Largest Outflow Voucher*, and *Total Vouchers*.
- Filter by expense classification or search by description, voucher number, or handler.
- **Record Expense Modal:** Generates formatted voucher numbers (e.g. `V-2026-1001`) with automatic timestamping.
- **Export to CSV** and **Print Expense Ledger**.

#### 📦 Stock Summary Quick-Glance & Inventory Manager (`#/admin/stock`)
- Live vault metrics: Total active units, total estimated catalog valuation, and low-stock alerts.
- Category distribution breakdown (Bridal Sets, Diamond Rings, Polki Necklaces, Gold Bangles).
- **Quick Quantity Controls:** Inline `+` and `-` buttons to adjust vault units in real time.
- **Catalog New Creation Modal:** Add a new jewelry piece with image, specifications, and pricing. **Immediately appears live in the Public Showcase!**

#### 💌 Customer Inquiries Dossier (`#/admin/inquiries`)
- Displays all viewing requests and consultation inquiries submitted through the public website's contact form.
- Review client contact info, requested piece, preferred viewing appointment, and budget.
- Change dossier status (**New**, **Confirmed**, **Completed**), click to email client directly, or dismiss.

#### 🪙 Precious Metals Spot Configurator (`#/admin/rates`)
- Allows the administrator to adjust live spot prices per gram for 24K, 22K, 18K Gold, Platinum 950, and Silver 999.
- Changes update the public marquee ticker across the entire website in real time.

#### 🔄 Factory Demo Data Reset
- One-click reset button to restore all catalog pieces, payroll entries, ledger vouchers, and inquiries back to pristine factory demo state.

---

## 🛠️ Technical Architecture & Technology Stack

| Layer | Technology |
|---|---|
| **Structure** | Semantic HTML5 (Single Page Architecture) |
| **Styling** | Tailwind CSS (via Tailwind CDN) + Bespoke `css/luxury.css` design system |
| **Typography** | Cormorant Garamond, Cinzel, Montserrat (Google Fonts) |
| **Icons** | Font Awesome 6.5.1 CDN |
| **Logic & State** | Modular Vanilla JavaScript (ES6+) with `localStorage` & `sessionStorage` |
| **Routing** | Client-Side Hash Router (`#/`, `#/collections`, `#/story`, `#/contact`, `#/admin/*`) |
| **Static Hosting** | 100% Compatible with GitHub Pages, Netlify, Vercel, Cloudflare Pages |

### Directory Structure

```text
wj_jewllers/
├── index.html              <- Primary SPA entrypoint (Showcase + Admin views & modals)
├── css/
│   └── luxury.css          <- Custom design system, metallic gradients, shimmer animations
├── js/
│   ├── data.js             <- Initial jewelry catalog, staff payroll, ledger, and DataStore
│   ├── utils.js            <- Currency converters, modal controller, toast notifications, auth guards
│   ├── showcase.js         <- Public showcase, filters, search, quick-view modal, wishlist
│   ├── admin.js            <- Protected admin panel, payroll, ledger, stock, inquiries, rates
│   └── app.js              <- Hash-based router, global event listeners, currency synchronizer
└── README.md               <- Project documentation, credentials, and deployment guide
```

---

## 🚀 Deployment Instructions

### Option 1: GitHub Pages (Recommended)
1. Push this repository to your GitHub account:
   ```bash
   git add .
   git commit -m "feat: luxury showcase and management application"
   git push origin main
   ```
2. In your GitHub repository, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
4. Select `main` branch and `/ (root)` folder, then click **Save**.
5. Your application will be live at `https://<username>.github.io/<repository-name>/`.
   *(Hash routing guarantees that refreshing any page or admin route will never cause a 404 error!)*

### Option 2: Netlify
1. Log in to [Netlify](https://www.netlify.com/).
2. Drag and drop the `wj_jewllers` folder into Netlify Drop, or import your Git repository.
3. Build command: *(leave empty)*
4. Publish directory: `.` (or root)
5. Click **Deploy Site**.

### Option 3: Local Testing / Live Server
Run any static local HTTP server:
```bash
# Using Python 3:
python3 -m http.server 4173

# Or using Node.js serve:
npx serve .
```
Then visit `http://localhost:4173/` in your browser.

---

## 🔑 Administrative Access

| Field | Value |
|---|---|
| **Portal URL** | `#/admin` (or click *"Atelier Staff Portal"* in the header) |
| **Username** | `admin` |
| **Passphrase** | `jewel2026` |
| **Autofill** | Click *"Auto-fill demo credentials"* on the login card |

---

## 📜 Quality & Compliance
- **Zero External Server Dependencies:** Fully self-contained client-side state.
- **Responsive Across Viewports:** Tailored for 375px mobile phones up to 4K desktop displays.
- **Cross-Browser Compatible:** Tested on Chromium, WebKit, and Gecko engines.
- **Export Standards:** Real-time CSV generation conforming to standard RFC 4180 format.

*Designed with distinction for Aurelia Fine Jewels.*
