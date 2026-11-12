# Cars By Rajat (`carsbyrajat.in`) — Enterprise Digital Showroom & Dealership CRM
**Nagpur's #1 Certified Pre-Owned Automotive & Luxury Fleet Hub**

A full-stack enterprise digital showroom, dynamic reel discovery studio, lead management pipeline, price negotiation desk, and dealership CRM.

Built with **TypeScript, React 19, Express 5, and Node.js 22 built-in `node:sqlite`**.

---

## 🌟 Core Features & Architecture

1. **Digital Showroom Storefront:**
   - Soft-light corporate & automotive aesthetic with royal blue `#1D5CE5` accents and ice-blue canvas `#F7F9FC`.
   - Real-time search, multi-facet filtering (Budget, Fuel, Transmission, Owner).
   - Minimalist auto-rotating spotlight vehicle card with hover-pause.
   - 6-Point certified showroom inspection checklist (Engine, Chassis, Tyres, Electricals, Documentation).
   - Multi-car shortlist comparison matrix.

2. **Scroll Studio (`/scroll`):**
   - Native mobile gesture-based vehicle discovery (Swipe UP/DOWN).
   - Double-tap anywhere to like vehicle with center beating heart pop animation (`@keyframes heartPop`).
   - Left/Right photo tap navigation with synchronized progress dots.
   - Mobile slide-up technical dossier bottom sheet with drag handle and dimmed backdrop.
   - Direct WhatsApp Concierge preloaded with vehicle details.
   - Native OS share integration (`navigator.share`).

3. **Confidential Price Unlock & Anti-Fake Mobile Telemetry:**
   - Server-gated direct showroom pricing protected behind 10-digit Indian mobile validation.
   - Anti-fraud heuristic rejects fake sequences (`9876543210`, `9999999999`, invalid prefixes).
   - 7-day HMAC-SHA256 signed session cookie for unlocked customer state.

4. **Interactive Price Negotiation Desk & Buyer Hub (`/dashboard`):**
   - Direct customer counteroffer submission from any vehicle dossier.
   - Real-time showroom management counteroffer tracking.
   - Live notification alerts and 1-click offer acceptance.

5. **Dealership Command Deck & Staff CRM (`/admin/login`):**
   - Role-Based Access Control (RBAC): Superadmin, Sales Executive, Inventory Manager.
   - Live KPI revenue metrics, lead pipeline tracking, chronological browsing trail telemetry.
   - 1-Click WhatsApp handshake and instant CSV & Excel export.
   - Fleet CMS with local photo upload and customizable inspection checkpoints.

6. **Programmatic Local SEO & OpenGraph Engine:**
   - Schema.org `AutoDealer` and `Car` JSON-LD markup.
   - Dynamic 1200x630 OpenGraph social preview cards.
   - Programmatic URLs for Nagpur makes, fuels, and gearboxes.
   - Automated `sitemap.xml` and `robots.txt`.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 22+** (Uses native `node:sqlite` and Node Crypto)
- **npm 10+**

### Installation
```bash
git clone https://github.com/CyberSleuth-Bhushan/carsbyrajat.git
cd carsbyrajat
npm install
```

### Running the Application
```bash
# Development (Vite HMR + Backend Server)
npm run dev

# Typecheck TypeScript
npm run typecheck

# Production Build
npm run build

# Start Production Server
npm start
```

### Access Points
- **Digital Showroom:** [http://localhost:3000](http://localhost:3000)
- **Scroll Studio:** [http://localhost:3000/scroll](http://localhost:3000/scroll)
- **Buyer Hub:** [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- **Admin Command Deck:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
  - **Default Username:** `admin`
  - **Default Password:** `password123` (or `admin123`)

---

## 📄 License
Proprietary — Cars By Rajat & NeuroX Intelligence Platform.
